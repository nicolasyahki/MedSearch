import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { buildConsultationPayload, saveConsultationAndScheduleSync } from '../sync/syncEngine';
import { loadIndex } from '../engine/fuzzySearch';
import { IconArrowLeft, IconCheck } from '@tabler/icons-react';

/**
 * Formulaire de création d'un dossier patient / consultation
 */
const generateUniqueRef = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MS-${year}${month}${day}-${randomStr}`;
};

const generateUniqueDiagnosticId = (diseaseId) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  if (diseaseId) {
    const cleanDiseaseId = diseaseId.toUpperCase();
    return `DIAG-${cleanDiseaseId}-${year}${month}${day}-${randomStr}`;
  }
  
  return `DIAG-${year}${month}${day}-${randomStr}`;
};

export default function PatientForm({ currentAgent, onLogout }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Récupère l'ID de la maladie si on vient d'une carte diagnostic
  const diseaseId = searchParams.get('diseaseId') || '';
  const score = searchParams.get('score') || '';

  const [diseaseName, setDiseaseName] = useState('');

  const [formData, setFormData] = useState({
    nomPatient: generateUniqueRef(),
    age: '',
    sexe: 'M',
    poids: '',
    zone: currentAgent?.zone || '',
    symptomes: '',
    diagnosticId: generateUniqueDiagnosticId(diseaseId),
    score: score ? parseInt(score, 10) : 0,
    notes: ''
  });

  useEffect(() => {
    if (diseaseId) {
      loadIndex().then(index => {
        const found = index.find(d => d.id === diseaseId);
        if (found) {
          setDiseaseName(found.nom);
        }
      });
    }
  }, [diseaseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const consultation = buildConsultationPayload(formData, currentAgent);
      await saveConsultationAndScheduleSync(consultation);
      navigate('/patients', { state: { success: true, patientRef: formData.nomPatient } });
    } catch (error) {
      console.error("Erreur d'enregistrement", error);
      alert("Une erreur est survenue lors de l'enregistrement de la consultation.");
    }
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <Navbar onLogout={onLogout} />
      
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 pt-6 animate-in fade-in slide-in-from-bottom-4">
        
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6"
        >
          <IconArrowLeft size={20} />
          <span>Retour</span>
        </button>

        <h1 className="text-2xl font-bold text-text-primary mb-6">Nouveau Dossier Patient</h1>
        
        <form onSubmit={handleSubmit} className="bg-bg-card border border-border-strong rounded-2xl p-6 shadow-sm">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Nom ou Réf. unique du Dossier</label>
              <input 
                required
                type="text" 
                value={formData.nomPatient}
                onChange={e => setFormData({...formData, nomPatient: e.target.value})}
                className="w-full bg-bg-input border border-border-strong rounded-xl p-3 text-text-primary focus:border-primary outline-none transition-colors"
                placeholder="Ex: MS-20260522-ABCD"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Âge</label>
                <input 
                  required
                  type="number" 
                  min="0"
                  max="120"
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value})}
                  className="w-full bg-bg-input border border-border-strong rounded-xl p-3 text-text-primary focus:border-primary outline-none transition-colors"
                  placeholder="Ans"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Sexe</label>
                <select 
                  value={formData.sexe}
                  onChange={e => setFormData({...formData, sexe: e.target.value})}
                  className="w-full bg-bg-input border border-border-strong rounded-xl p-3 text-text-primary focus:border-primary outline-none appearance-none"
                >
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Poids (kg)</label>
                <input 
                  type="number" 
                  step="0.1"
                  min="1"
                  max="150"
                  value={formData.poids}
                  onChange={e => setFormData({...formData, poids: e.target.value})}
                  className="w-full bg-bg-input border border-border-strong rounded-xl p-3 text-text-primary focus:border-primary outline-none transition-colors"
                  placeholder="kg"
                />
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Zone géographique</label>
            <input 
              required
              type="text" 
              value={formData.zone}
              onChange={e => setFormData({...formData, zone: e.target.value})}
              className="w-full bg-bg-input border border-border-strong rounded-xl p-3 text-text-primary focus:border-primary outline-none transition-colors"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Symptômes observés</label>
            <textarea 
              required
              rows="3"
              value={formData.symptomes}
              onChange={e => setFormData({...formData, symptomes: e.target.value})}
              className="w-full bg-bg-input border border-border-strong rounded-xl p-3 text-text-primary focus:border-primary outline-none resize-none transition-colors"
              placeholder="Décrivez les symptômes..."
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">ID unique du diagnostic</label>
            <input 
              type="text" 
              value={formData.diagnosticId}
              onChange={e => setFormData({...formData, diagnosticId: e.target.value})}
              className="w-full bg-bg-input border border-border-strong rounded-xl p-3 text-text-primary focus:border-primary outline-none transition-colors opacity-70"
              readOnly={!!diseaseId}
              placeholder="Aucun diagnostic sélectionné"
            />
            {diseaseName && (
              <p className="text-sm text-primary font-semibold mt-1.5 flex items-center gap-1.5">
                <span>🩺 Maladie associée :</span>
                <span className="text-text-primary font-bold">{diseaseName}</span>
                {formData.score > 0 && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30 font-bold ml-1">
                    Confiance : {formData.score}%
                  </span>
                )}
              </p>
            )}
            <p className="text-[11px] text-text-muted mt-1.5">
              * Cet identifiant est unique à cette consultation (format: DIAG-MALADIE-DATE-RANDOM) pour éviter les doublons de dossiers.
            </p>
          </div>

          {/* Calculateur de Posologie Pédiatrique */}
          {formData.poids && parseFloat(formData.poids) > 0 && (
            <div className="mb-6 bg-bg-hover/30 border border-border-strong rounded-2xl p-5 animate-in fade-in slide-in-from-top-2">
              <h3 className="text-base font-bold text-primary mb-3 flex items-center gap-2">
                💊 Posologies Suggérées (Pédiatrie)
              </h3>
              <p className="text-xs text-text-secondary mb-4">
                Calculs indicatifs basés sur un poids de <span className="font-semibold text-text-primary">{formData.poids} kg</span> (Directives OMS-PCIME) :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Paracétamol */}
                <div className="bg-bg-input p-3.5 rounded-xl border border-border">
                  <span className="font-bold text-xs text-text-primary block mb-1">Paracétamol (Fièvre / Douleur)</span>
                  <span className="text-[11px] text-text-secondary block mb-2">15 mg/kg par prise, toutes les 6h</span>
                  <div className="text-sm font-semibold text-primary">
                    {(parseFloat(formData.poids) * 15).toFixed(0)} mg par prise
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
                    soit env. <span className="font-medium text-text-primary">{(parseFloat(formData.poids) * 0.625).toFixed(1)} ml</span> de sirop (120mg/5ml)
                  </div>
                </div>

                {/* SRO */}
                <div className="bg-bg-input p-3.5 rounded-xl border border-border">
                  <span className="font-bold text-xs text-text-primary block mb-1">SRO (Plan B Réhydratation)</span>
                  <span className="text-[11px] text-text-secondary block mb-2">75 ml/kg à administrer sur 4 heures</span>
                  <div className="text-sm font-semibold text-primary">
                    {(parseFloat(formData.poids) * 75).toFixed(0)} ml au total
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
                    Donner fréquemment à la cuillère/tasse
                  </div>
                </div>

                {/* Amoxicilline */}
                <div className="bg-bg-input p-3.5 rounded-xl border border-border">
                  <span className="font-bold text-xs text-text-primary block mb-1">Amoxicilline (Pneumonie)</span>
                  <span className="text-[11px] text-text-secondary block mb-2">80 mg/kg/jour en 2 prises par jour</span>
                  <div className="text-sm font-semibold text-primary">
                    {(parseFloat(formData.poids) * 40).toFixed(0)} mg par prise (2x/j)
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
                    soit env. <span className="font-medium text-text-primary">{(parseFloat(formData.poids) * 0.8).toFixed(1)} ml</span> de suspension (250mg/5ml)
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-bg-input p-3.5 rounded-xl border border-border">
                  <span className="font-bold text-xs text-text-primary block mb-1">Coartem / CTA Dispersible (Paludisme)</span>
                  <span className="text-[11px] text-text-secondary block mb-2">Artéméther-luméfantrine 20/120mg (2x/j, 3 jours)</span>
                  <div className="text-sm font-semibold text-primary">
                    {parseFloat(formData.poids) < 5 ? (
                      <span className="text-danger">Poids &lt; 5 kg : Référer d'urgence</span>
                    ) : parseFloat(formData.poids) < 15 ? (
                      "1 comp. par prise (2x/j)"
                    ) : parseFloat(formData.poids) < 25 ? (
                      "2 comp. par prise (2x/j)"
                    ) : parseFloat(formData.poids) < 35 ? (
                      "3 comp. par prise (2x/j)"
                    ) : (
                      "4 comp. par prise (2x/j)"
                    )}
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
                    Prendre avec un repas ou du lait
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-5 border-t border-border-strong flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl text-text-primary bg-bg-input hover:bg-bg-hover transition-colors font-medium text-center"
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="px-6 py-3 rounded-xl text-white bg-primary hover:bg-primary-light active:bg-primary-dark transition-colors font-medium flex items-center justify-center gap-2"
            >
              <IconCheck size={20} />
              Enregistrer le dossier
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

