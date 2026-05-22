import React from 'react';
import ScoreBar from './ScoreBar';
import { useNavigate } from 'react-router-dom';
import { IconChevronRight } from '@tabler/icons-react';

/**
 * Affiche une maladie potentielle avec son score
 */
export default function DiagnosticCard({ result }) {
  const navigate = useNavigate();
  const disease = result.item;
  const score = result.score; // Score en pourcentage
  
  // Couleurs du badge selon le score
  const getBadgeColor = (val) => {
    if (val >= 70) return 'bg-primary/20 text-primary border border-primary/30';
    if (val >= 40) return 'bg-warning/20 text-warning border border-warning/30';
    return 'bg-danger/20 text-danger border border-danger/30';
  };

  // Couleurs du texte d'urgence
  const getUrgencyColor = (urgency) => {
    switch(urgency?.toLowerCase()) {
      case 'critique': return 'text-danger font-bold';
      case 'haute': return 'text-warning font-semibold';
      case 'moyenne': return 'text-primary font-medium';
      default: return 'text-text-secondary';
    }
  };

  return (
    <div 
      className="bg-bg-card border border-border-strong rounded-xl p-5 hover:border-primary/50 transition-colors cursor-pointer group flex flex-col h-full"
      onClick={() => navigate(`/patient/new?diseaseId=${disease.id}&score=${score}`)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="pr-2">
          <h3 className="text-lg font-bold text-text-primary mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {disease.nom}
          </h3>
          <p className="text-xs text-text-secondary capitalize">
            {disease.categorie} • Urgence: <span className={getUrgencyColor(disease.urgence)}>{disease.urgence}</span>
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-bold shrink-0 ${getBadgeColor(score)}`}>
          {score}%
        </div>
      </div>
      
      <div className="mb-5 flex-1">
        <p className="text-sm text-text-secondary line-clamp-2">
          {disease.description}
        </p>
      </div>

      <div className="mt-auto">
        <ScoreBar score={score} />
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
          <span className="text-xs text-text-muted">Créer un dossier patient</span>
          <IconChevronRight size={18} className="text-text-secondary group-hover:text-primary transition-colors" />
        </div>
      </div>
    </div>
  );
}
