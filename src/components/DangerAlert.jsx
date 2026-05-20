import React from 'react';
import { IconAlertTriangleFilled } from '@tabler/icons-react';

/**
 * Alerte rouge prioritaire affichée lors de la détection de mots-clés dangereux
 */
export default function DangerAlert({ keywords = [], actions = [] }) {
  if (keywords.length === 0) return null;

  return (
    <div className="bg-danger/10 border-2 border-danger/50 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start gap-4 shadow-[0_0_20px_rgba(229,62,62,0.2)] relative overflow-hidden animate-pulse-danger">
      {/* Animation de pulse légère sur le fond */}
      <div className="absolute inset-0 bg-danger/5 animate-pulse pointer-events-none"></div>
      
      <div className="text-danger shrink-0 p-2 bg-danger/20 rounded-xl relative z-10">
        <IconAlertTriangleFilled size={28} className="drop-shadow-[0_0_8px_rgba(229,62,62,0.6)]" />
      </div>
      
      <div className="relative z-10 flex-1">
        <h3 className="text-danger font-extrabold text-lg mb-2 flex items-center gap-2">
          🚨 URGENCE MÉDICALE CRITIQUE DETECTÉE
        </h3>
        
        <div className="text-text-primary text-sm leading-relaxed mb-3">
          <p className="mb-2">
            Signes cliniques graves identifiés : <span className="font-bold text-white bg-danger px-2 py-0.5 rounded uppercase text-xs tracking-wider">{keywords.join(', ')}</span>
          </p>
          
          {actions.length > 0 && (
            <div className="mt-3 p-3 bg-bg-app/80 border border-border-strong rounded-xl">
              <span className="font-bold text-danger text-xs uppercase tracking-wider block mb-2">
                Actions de secours immédiates (OMS - PCIME) :
              </span>
              <ul className="list-disc pl-5 space-y-1.5 text-text-secondary text-xs">
                {actions.map((action, index) => (
                  <li key={index} className="leading-relaxed">
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="text-xs font-bold text-danger bg-danger/20 border border-danger/30 px-3 py-2 rounded-lg inline-block">
          ⚠️ REFERENCE : Référez et transférez immédiatement le patient vers un centre de santé spécialisé.
        </div>
      </div>
    </div>
  );
}

