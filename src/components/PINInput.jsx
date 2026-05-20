import React, { useState, useRef, useEffect } from 'react';

/**
 * Composant d'entrée pour un code PIN à 4 chiffres.
 * Respecte le design system MedSearch (cases 56x56, bordures, etc.)
 * 
 * @param {Function} onComplete - Fonction appelée quand les 4 chiffres sont saisis
 * @param {boolean} error - État d'erreur pour affichage visuel rouge
 */
export default function PinInput({ onComplete, error }) {
  const [pin, setPin] = useState(['', '', '', '']);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  // Focus automatique sur le premier champ au montage
  useEffect(() => {
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // N'accepter que les chiffres
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    // Ne garder que le dernier caractère saisi
    newPin[index] = value.substring(value.length - 1); 
    setPin(newPin);

    // Auto-focus vers le champ suivant si une valeur est saisie
    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }

    // Si on est sur le dernier champ et qu'on a une valeur, on vérifie si tout est rempli
    if (index === 3 && value) {
      const fullPin = newPin.join('');
      if (fullPin.length === 4) {
        onComplete(fullPin);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Gestion du retour arrière (Backspace) pour naviguer au champ précédent
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  return (
    <div className="flex justify-center gap-4 my-6">
      {pin.map((digit, index) => (
        <input
          key={index}
          ref={inputRefs[index]}
          type="text"
          inputMode="numeric" // Affiche le pavé numérique sur mobile
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className={`w-[56px] h-[56px] text-center text-2xl font-semibold bg-bg-input text-text-primary rounded-xl border-2 transition-colors duration-200 outline-none
            ${error ? 'border-danger text-danger' : 'border-border-strong focus:border-primary'}
          `}
        />
      ))}
    </div>
  );
}
