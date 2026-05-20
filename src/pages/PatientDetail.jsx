import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { db } from '../db/database';
import { IconArrowLeft, IconUserCircle, IconClipboardList, IconStethoscope, IconHistory } from '@tabler/icons-react';

/**
 * Vue détaillée d'un dossier patient (lecture seule)
 */
export default function PatientDetail({ onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [pastConsultations, setPastConsultations] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const item = await db.consultations.get(parseInt(id));
        setConsultation(item);
        
        if (item && item.patientRef) {
          // Rechercher les autres dossiers du même patient
          const list = await db.consultations
            .where('patientRef')
            .equals(item.patientRef)
            .toArray();
          
          // Exclure la consultation courante et trier par date décroissante
          const filteredList = list
            .filter(c => c.id !== item.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
          
          setPastConsultations(filteredList);
        }
      } catch (error) {
        console.error("Erreur de chargement", error);
      }
    };
    loadData();
  }, [id]);

  if (!consultation) {
    return (
      <div className="min-h-screen bg-bg-app flex flex-col">
        <Navbar onLogout={onLogout} />
        <div className="flex-1 flex items-center justify-center p-8 text-center text-text-secondary">
          Chargement du dossier...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <Navbar onLogout={onLogout} />
      
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 pt-6 animate-in fade-in">
        <button 
          onClick={() => navigate('/patients')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6"
        >
          <IconArrowLeft size={20} />
          <span>Retour à l'historique</span>
        </button>

        <div className="bg-bg-card border border-border-strong rounded-2xl overflow-hidden shadow-sm">
          {/* En-tête du dossier */}
          <div className="p-6 border-b border-border-strong bg-bg-hover/30 flex items-center gap-4">
            <div className="w-16 h-16 bg-bg-input rounded-full flex items-center justify-center text-text-muted border border-border-strong">
              <IconUserCircle size={40} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-1">{consultation.patientRef}</h1>
              <p className="text-text-secondary text-sm">
                {consultation.age} ans • Sexe: {consultation.sexe}{consultation.poids ? ` • Poids: ${consultation.poids} kg` : ''} • {consultation.zone}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Symptômes */}
            <div>
              <div className="flex items-center gap-2 text-text-secondary mb-3">
                <IconClipboardList size={20} className="text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Symptômes reportés</h3>
              </div>
              <p className="text-text-primary bg-bg-input p-4 rounded-xl border border-border-strong leading-relaxed">
                {consultation.symptomes}
              </p>
            </div>

            {/* Diagnostic */}
            <div>
              <div className="flex items-center gap-2 text-text-secondary mb-3">
                <IconStethoscope size={20} className="text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Diagnostic Retenu</h3>
              </div>
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl">
                <p className="text-primary font-bold text-lg">
                  {consultation.diagnosticId || 'Aucun diagnostic spécifique enregistré'}
                </p>
              </div>
            </div>

            {/* Posologies Suggérées (si le poids est disponible) */}
            {consultation.poids && (
              <div>
                <div className="flex items-center gap-2 text-text-secondary mb-3">
                  <IconStethoscope size={20} className="text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Posologies Suggérées (Pédiatrie)</h3>
                </div>
                <div className="bg-bg-hover/30 border border-border-strong rounded-xl p-4">
                  <p className="text-xs text-text-secondary mb-3">
                    Dosages indicatifs basés sur un poids de <span className="font-semibold text-text-primary">{consultation.poids} kg</span> (OMS-PCIME) :
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-bg-input p-3 rounded-lg border border-border">
                      <span className="font-bold text-text-primary block mb-1">Paracétamol</span>
                      <span className="text-[11px] text-text-secondary">{(consultation.poids * 15).toFixed(0)} mg par prise (ou {(consultation.poids * 0.625).toFixed(1)} ml sirop) toutes les 6h</span>
                    </div>
                    <div className="bg-bg-input p-3 rounded-lg border border-border">
                      <span className="font-bold text-text-primary block mb-1">SRO (Plan B)</span>
                      <span className="text-[11px] text-text-secondary">{(consultation.poids * 75).toFixed(0)} ml au total sur 4h</span>
                    </div>
                    <div className="bg-bg-input p-3 rounded-lg border border-border">
                      <span className="font-bold text-text-primary block mb-1">Amoxicilline</span>
                      <span className="text-[11px] text-text-secondary">{(consultation.poids * 40).toFixed(0)} mg par prise (2x/j) (ou {(consultation.poids * 0.8).toFixed(1)} ml suspension)</span>
                    </div>
                    <div className="bg-bg-input p-3 rounded-lg border border-border">
                      <span className="font-bold text-text-primary block mb-1">Coartem / CTA Dispersible</span>
                      <span className="text-[11px] text-text-secondary">
                        {consultation.poids < 5 ? (
                          <span className="text-danger">Poids &lt; 5 kg : Référer d'urgence</span>
                        ) : consultation.poids < 15 ? (
                          "1 comp. par prise (2x/j, 3j)"
                        ) : consultation.poids < 25 ? (
                          "2 comp. par prise (2x/j, 3j)"
                        ) : consultation.poids < 35 ? (
                          "3 comp. par prise (2x/j, 3j)"
                        ) : (
                          "4 comp. par prise (2x/j, 3j)"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Historique Clinique de ce Patient */}
            <div className="border-t border-border-strong pt-6">
              <div className="flex items-center gap-2 text-text-secondary mb-4">
                <IconHistory size={20} className="text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Dossier Médical Unique (Historique Patient)</h3>
              </div>
              
              {pastConsultations.length === 0 ? (
                <p className="text-xs text-text-muted italic">Aucun antécédent clinique enregistré en local pour ce patient.</p>
              ) : (
                <div className="relative border-l border-border-strong pl-5 ml-2.5 space-y-5 my-4">
                  {pastConsultations.map(past => (
                    <div key={past.id} className="relative group cursor-pointer" onClick={() => navigate(`/patient/${past.id}`)}>
                      {/* Pastille de timeline */}
                      <span className="absolute -left-[26px] top-1 w-2.5 h-2.5 rounded-full bg-border-strong group-hover:bg-primary transition-colors"></span>
                      
                      <div className="bg-bg-input p-3.5 rounded-xl border border-border group-hover:border-primary/50 transition-colors">
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">
                            {past.diagnosticId || 'Diag non spécifié'}
                          </span>
                          <span className="text-[10px] text-text-secondary font-medium">
                            {new Date(past.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary line-clamp-2">
                          Symptômes: {past.symptomes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Méta-données */}
            <div className="border-t border-border-strong pt-6">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Informations système</h3>
              <div className="grid grid-cols-2 gap-4 text-sm bg-bg-input p-4 rounded-xl border border-border">
                <div>
                  <span className="text-text-secondary block mb-1">Date d'enregistrement</span>
                  <span className="text-text-primary font-medium">{new Date(consultation.date).toLocaleString('fr-FR')}</span>
                </div>
                <div>
                  <span className="text-text-secondary block mb-1">Statut Synchronisation</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${consultation.statutSync === 'attente' ? 'bg-warning' : 'bg-primary'}`}></div>
                    <span className="text-text-primary capitalize">{consultation.statutSync}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
