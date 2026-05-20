import Dexie from 'dexie';

export const db = new Dexie('MedSearchDatabase');

db.version(1).stores({
  agents: '++id, email, pin, nom',
  consultations: '++id, agentId, patientRef, date, diagnosticId, statutSync',
});

db.version(2).stores({
  agents: '++id, email, pin, nom',
  consultations: '++id, clientUuid, agentId, patientRef, date, diagnosticId, statutSync, updatedAt, serverId',
  syncConflicts: '++id, consultationId, clientUuid, resolved, detectedAt',
  appSettings: 'key',
}).upgrade(async (tx) => {
  await tx.table('consultations').toCollection().modify((consultation) => {
    if (!consultation.clientUuid) {
      consultation.clientUuid = crypto.randomUUID();
    }
    if (!consultation.updatedAt) {
      consultation.updatedAt = consultation.date || new Date().toISOString();
    }
    if (!consultation.version) {
      consultation.version = 1;
    }
  });
});

export async function getUnresolvedConflictCount() {
  // IndexedDB ne supporte pas nativement les booléens comme clés d'index.
  // On utilise donc un filter() au lieu de where().equals()
  return db.syncConflicts.filter(conflict => conflict.resolved === false).count();
}
