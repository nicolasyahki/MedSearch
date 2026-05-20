import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { db } from '../db/database';
import { resolveConflict } from '../sync/syncEngine';
import { IconAlertTriangle, IconArrowLeft, IconDeviceMobile, IconServer } from '@tabler/icons-react';

export default function SyncConflicts({ onLogout }) {
  const navigate = useNavigate();
  const [conflicts, setConflicts] = useState([]);
  const [resolvingId, setResolvingId] = useState(null);

  const loadConflicts = async () => {
    const rows = await db.syncConflicts.where('resolved').equals(false).reverse().sortBy('detectedAt');
    setConflicts(rows);
  };

  useEffect(() => {
    loadConflicts();
  }, []);

  const handleResolve = async (conflictId, choice) => {
    setResolvingId(conflictId);
    try {
      await resolveConflict(conflictId, choice);
      await loadConflicts();
    } catch (error) {
      alert(error.message);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <Navbar onLogout={onLogout} />

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 pt-6">
        <button
          onClick={() => navigate('/patients')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6"
        >
          <IconArrowLeft size={20} />
          <span>Retour à l'historique</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <IconAlertTriangle className="text-warning" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Conflits de synchronisation</h1>
            <p className="text-text-secondary text-sm">
              La même fiche a été modifiée sur un autre appareil. Choisissez la version à conserver.
            </p>
          </div>
        </div>

        {conflicts.length === 0 ? (
          <div className="bg-bg-card border border-border-strong rounded-2xl p-8 text-center text-text-secondary">
            Aucun conflit en attente.
          </div>
        ) : (
          <div className="space-y-5">
            {conflicts.map((conflict) => (
              <article key={conflict.id} className="bg-bg-card border border-border-strong rounded-2xl p-5">
                <p className="text-xs text-text-muted mb-3">
                  Détecté le {new Date(conflict.detectedAt).toLocaleString('fr-FR')}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-bg-input border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                      <IconDeviceMobile size={18} />
                      Version locale
                    </div>
                    <p className="text-sm text-text-primary font-medium">{conflict.localSnapshot?.patientRef}</p>
                    <p className="text-xs text-text-secondary mt-1">{conflict.localSnapshot?.symptomes}</p>
                  </div>

                  <div className="bg-bg-input border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 text-warning font-semibold mb-2">
                      <IconServer size={18} />
                      Version serveur
                    </div>
                    <p className="text-sm text-text-primary font-medium">{conflict.serverSnapshot?.nom_patient}</p>
                    <p className="text-xs text-text-secondary mt-1">{conflict.serverSnapshot?.symptomes_saisis}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    disabled={resolvingId === conflict.id}
                    onClick={() => handleResolve(conflict.id, 'keep_local')}
                    className="flex-1 px-4 py-3 rounded-xl bg-primary text-white hover:bg-primary-light transition-colors font-medium"
                  >
                    Garder ma version
                  </button>
                  <button
                    disabled={resolvingId === conflict.id}
                    onClick={() => handleResolve(conflict.id, 'keep_server')}
                    className="flex-1 px-4 py-3 rounded-xl bg-bg-input border border-border-strong text-text-primary hover:bg-bg-hover transition-colors font-medium"
                  >
                    Accepter le serveur
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
