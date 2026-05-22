import { db } from '../db/database';
import { syncService } from '../api/syncService';
import { scheduleBackgroundSync } from './backgroundSync';

/**
 * Moteur de synchronisation partagé (UI + déclenchement Background Sync).
 * Gère l'envoi des consultations, les accusés de réception et les conflits.
 */
export async function runSync({ forceOnline = false } = {}) {
  if (!forceOnline && !navigator.onLine) {
    await scheduleBackgroundSync();
    return { ok: false, reason: 'offline', scheduled: true };
  }

  const agents = await db.agents.toArray();
  if (agents.length === 0) {
    throw new Error('Aucun profil agent trouvé sur cet appareil.');
  }

  const agent = agents[0];
  const token = agent.syncToken;
  if (!token) {
    throw new Error('Session de synchronisation expirée. Reconnectez-vous en ligne.');
  }

  const unsyncedConsultations = await db.consultations
    .where('statutSync')
    .equals('attente')
    .toArray();

  if (unsyncedConsultations.length === 0) {
    return { ok: true, syncedCount: 0, conflictCount: 0 };
  }

  const response = await syncService.syncConsultations(unsyncedConsultations, token);

  if (response.synced_ids?.length) {
    await db.transaction('rw', db.consultations, async () => {
      for (const id of response.synced_ids) {
        const serverMeta = response.server_meta?.[String(id)] || {};
        await db.consultations.update(id, {
          statutSync: 'synced',
          serverId: serverMeta.server_id ?? undefined,
          version: serverMeta.version ?? undefined,
        });
      }
    });
  }

  if (response.conflicts?.length) {
    await db.transaction('rw', db.consultations, db.syncConflicts, async () => {
      for (const conflict of response.conflicts) {
        if (conflict.resolution === 'server_wins') {
          await applyServerRecord(conflict.id_local, conflict.server_record);
          continue;
        }

        await db.consultations.update(conflict.id_local, { statutSync: 'conflit' });
        await db.syncConflicts.put({
          consultationId: conflict.id_local,
          clientUuid: conflict.client_uuid,
          localSnapshot: conflict.local_record,
          serverSnapshot: conflict.server_record,
          detectedAt: new Date().toISOString(),
          resolved: false,
        });
      }
    });
  }

  return {
    ok: true,
    syncedCount: response.synced_ids?.length || 0,
    conflictCount: response.conflicts?.filter(c => c.resolution === 'manual_required')?.length || 0,
    errors: response.errors || [],
  };
}

async function applyServerRecord(localId, serverRecord) {
  if (!serverRecord) return;

  await db.consultations.update(localId, {
    patientRef: serverRecord.nom_patient,
    age: serverRecord.age_patient,
    sexe: serverRecord.sexe_patient,
    poids: serverRecord.poids_patient,
    zone: serverRecord.zone,
    symptomes: serverRecord.symptomes_saisis,
    diagnosticId: serverRecord.diagnostic_retenu,
    score: serverRecord.score_diagnostic,
    signesDanger: serverRecord.signes_danger,
    date: serverRecord.date_consultation,
    updatedAt: serverRecord.updated_at_client,
    version: serverRecord.version,
    serverId: serverRecord.id,
    statutSync: 'synced',
  });
}

/**
 * Résolution manuelle d'un conflit de synchronisation.
 */
export async function resolveConflict(conflictId, choice) {
  const conflict = await db.syncConflicts.get(conflictId);
  if (!conflict || conflict.resolved) {
    throw new Error('Conflit introuvable ou déjà résolu.');
  }

  if (choice === 'keep_server') {
    await applyServerRecord(conflict.consultationId, conflict.serverSnapshot);
  } else if (choice === 'keep_local') {
    await db.consultations.update(conflict.consultationId, {
      statutSync: 'attente',
      updatedAt: new Date().toISOString(),
      version: (conflict.localSnapshot?.version || 1) + 1,
    });
    await scheduleBackgroundSync();
  } else {
    throw new Error('Choix de résolution invalide.');
  }

  await db.syncConflicts.update(conflictId, {
    resolved: true,
    resolvedAt: new Date().toISOString(),
    resolution: choice,
  });
}

/**
 * Prépare une consultation pour la persistance locale + sync différée.
 */
export function buildConsultationPayload(formData, currentAgent) {
  const now = new Date().toISOString();
  return {
    agentId: currentAgent?.id || 1,
    clientUuid: crypto.randomUUID(),
    date: now,
    updatedAt: now,
    version: 1,
    patientRef: formData.nomPatient,
    age: parseInt(formData.age, 10),
    sexe: formData.sexe,
    poids: formData.poids ? parseFloat(formData.poids) : null,
    zone: formData.zone,
    symptomes: formData.symptomes,
    diagnosticId: formData.diagnosticId,
    score: formData.score || 0,
    notes: formData.notes,
    statutSync: 'attente',
  };
}

export async function saveConsultationAndScheduleSync(consultation) {
  await db.consultations.add(consultation);
  await scheduleBackgroundSync();

  if (navigator.onLine) {
    try {
      await runSync();
    } catch (error) {
      console.warn('[Sync] Échec sync immédiate, Background Sync planifié :', error.message);
    }
  }
}
