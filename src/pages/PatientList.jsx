import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { db } from '../db/database';
import { IconHistory, IconChevronRight, IconCloudUpload, IconClock, IconSearch, IconAlertTriangle, IconCheck } from '@tabler/icons-react';

/**
 * Liste des consultations enregistrées (historique)
 */
export default function PatientList({ onLogout }) {
  const [consultations, setConsultations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [registeredPatientRef, setRegisteredPatientRef] = useState('');

  useEffect(() => {
    loadConsultations();
  }, []);

  useEffect(() => {
    if (location.state?.success) {
      setShowSuccessBanner(true);
      setRegisteredPatientRef(location.state.patientRef || '');
      // Clear navigation state to prevent reappearing on reload
      window.history.replaceState({}, document.title);
      
      const timer = setTimeout(() => setShowSuccessBanner(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const loadConsultations = async () => {
    try {
      // Récupération depuis Dexie, tri inverse (récent en haut)
      const data = await db.consultations.orderBy('date').reverse().toArray();
      setConsultations(data);
    } catch (error) {
      console.error("Erreur chargement historique", error);
    }
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).format(d);
  };

  const filteredConsultations = consultations.filter(cons => 
    cons.patientRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cons.diagnosticId && cons.diagnosticId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <Navbar onLogout={onLogout} />
      
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 pt-8 animate-in fade-in">
        <div className="flex justify-between items-end mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <IconHistory size={26} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Historique</h1>
              <p className="text-sm text-text-secondary">{filteredConsultations.length} dossiers affichés</p>
            </div>
          </div>
        </div>

        {showSuccessBanner && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                <IconCheck size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Dossier Patient Enregistré</p>
                <p className="text-xs text-text-secondary">
                  Le dossier de <span className="font-semibold text-text-primary">{registeredPatientRef}</span> a été enregistré localement avec succès.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowSuccessBanner(false)}
              className="text-text-muted hover:text-text-primary text-xs font-semibold px-2 py-1 transition-colors"
            >
              Fermer
            </button>
          </div>
        )}

        <div className="bg-bg-card border border-border-strong rounded-2xl overflow-hidden shadow-sm">
          
          {/* Barre de recherche d'historique */}
          {consultations.length > 0 && (
            <div className="p-4 border-b border-border-strong bg-bg-hover/10 flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-text-secondary">
                  <IconSearch size={18} />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par nom, réf. patient ou diagnostic..."
                  className="w-full bg-bg-input border border-border rounded-xl py-3 pl-11 pr-4 text-sm text-text-primary focus:border-primary outline-none transition-colors placeholder:text-text-muted"
                />
              </div>
            </div>
          )}

          {consultations.length === 0 ? (
            <div className="p-12 text-center text-text-secondary flex flex-col items-center">
              <IconHistory size={48} className="text-border-strong mb-4" />
              <p>Aucune consultation enregistrée.</p>
              <button 
                onClick={() => navigate('/')}
                className="mt-4 text-primary hover:underline"
              >
                Effectuer une recherche
              </button>
            </div>
          ) : filteredConsultations.length === 0 ? (
            <div className="p-12 text-center text-text-secondary">
              Aucun résultat pour "{searchTerm}".
            </div>
          ) : (
            <ul className="divide-y divide-border-strong">
              {filteredConsultations.map(cons => (
                <li 
                  key={cons.id}
                  onClick={() => navigate(`/patient/${cons.id}`)}
                  className="p-4 hover:bg-bg-hover transition-colors cursor-pointer flex justify-between items-center group"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-text-primary">
                        {cons.patientRef}
                      </h3>
                      <span className="bg-bg-input text-text-secondary text-xs px-2 py-0.5 rounded border border-border">
                        {cons.age} ans, {cons.sexe}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-text-secondary">
                      <span className="flex items-center gap-1">
                        <IconClock size={14} />
                        {formatDate(cons.date)}
                      </span>
                      <span className="text-border-strong">•</span>
                      <span className="truncate max-w-[150px] sm:max-w-xs">
                        Diag: {cons.diagnosticId || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {cons.statutSync === 'attente' ? (
                      <div className="w-2 h-2 rounded-full bg-warning" title="En attente de synchronisation"></div>
                    ) : cons.statutSync === 'conflit' ? (
                      <IconAlertTriangle size={16} className="text-warning" title="Conflit de synchronisation" />
                    ) : (
                      <IconCloudUpload size={16} className="text-primary" title="Synchronisé" />
                    )}
                    <IconChevronRight size={20} className="text-text-muted group-hover:text-primary transition-colors" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
