import React from 'react';

/**
 * Barre de progression visuelle pour le score de diagnostic
 */
export default function ScoreBar({ score }) {
  // Sécurisation de la valeur entre 0 et 100
  const normalizedScore = Math.max(0, Math.min(100, score));
  
  // Application des couleurs de la charte
  let colorClass = 'bg-danger'; // < 40% (Note: les <30% ne s'affichent normalement pas)
  if (normalizedScore >= 70) {
    colorClass = 'bg-primary';
  } else if (normalizedScore >= 40) {
    colorClass = 'bg-warning';
  }

  return (
    <div className="w-full bg-border-strong h-1 rounded-full overflow-hidden">
      <div 
        className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
        style={{ width: `${normalizedScore}%` }}
      ></div>
    </div>
  );
}
