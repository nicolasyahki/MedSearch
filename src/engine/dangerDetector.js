// Dictionnaire des mots-clés de danger critique et leurs actions de secours d'urgence associées (Directives OMS - PCIME)
const DANGER_REGISTRY = {
  "convulsions": "Placer l'enfant en position latérale de sécurité (PLS). Dégager les voies respiratoires. Ne rien introduire dans la bouche. Référer en urgence. Préparer du diazépam rectal (0.5 mg/kg) si crise active.",
  "convulsion": "Placer l'enfant en position latérale de sécurité (PLS). Dégager les voies respiratoires. Ne rien introduire dans la bouche. Référer en urgence. Préparer du diazépam rectal (0.5 mg/kg) si crise active.",
  "inconscient": "Vérifier la respiration et le pouls. Libérer les voies aériennes. Placer en PLS. Prévenir l'hypoglycémie : administrer du sucre sous la langue ou du sérum glucosé à 10% (2 ml/kg en IV lente) si qualifié. Référer d'urgence.",
  "inconscience": "Vérifier la respiration et le pouls. Libérer les voies aériennes. Placer en PLS. Prévenir l'hypoglycémie : administrer du sucre sous la langue ou du sérum glucosé à 10% (2 ml/kg en IV lente) si qualifié. Référer d'urgence.",
  "coma": "Vérifier la respiration et le pouls. Libérer les voies aériennes. Placer en PLS. Prévenir l'hypoglycémie : administrer du sucre sous la langue ou du sérum glucosé à 10% (2 ml/kg en IV lente) si qualifié. Référer d'urgence.",
  "perte de connaissance": "Vérifier la respiration et le pouls. Libérer les voies aériennes. Placer en PLS. Prévenir l'hypoglycémie : administrer du sucre sous la langue ou du sérum glucosé à 10% (2 ml/kg en IV lente) si qualifié. Référer d'urgence.",
  "hémorragie": "Appliquer une pression directe forte et continue sur la plaie avec une compresse propre. Surélever le membre blessé. Garder au chaud pour prévenir le choc. Référer d'urgence.",
  "détresse respiratoire": "Administrer de l'oxygène immédiatement si disponible. Placer le patient en position semi-assise. Référer en urgence (suspicion de pneumonie grave ou asthme aigu).",
  "cyanose": "Administrer de l'oxygène immédiatement si disponible. Placer le patient en position semi-assise. Référer en urgence (suspicion de pneumonie grave ou asthme aigu).",
  "choc": "Allonger le patient et surélever ses jambes. Le couvrir pour éviter l'hypothermie. Si qualifié, poser une voie veineuse et perfuser du Ringer Lactate ou sérum physiologique (20 ml/kg en 30 min). Référer en extrême urgence.",
  "tirage sous-costal": "Indication d'une détresse respiratoire sévère (Pneumonie grave). Administrer de l'oxygène si la saturation est basse. Référer rapidement pour traitement antibiotique IV.",
  "tirage": "Indication d'une détresse respiratoire sévère (Pneumonie grave). Administrer de l'oxygène si la saturation est basse. Référer rapidement pour traitement antibiotique IV.",
  "incapacité de boire": "Signe de danger général. Risque d'hypoglycémie et de déshydratation sévère. Tenter de réhydrater avec du SRO à la cuillère ou par sonde naso-gastrique si l'enfant est conscient. Référer d'urgence.",
  "incapacité de téter": "Signe de danger général. Risque d'hypoglycémie et de déshydratation sévère. Tenter de réhydrater avec du SRO à la cuillère ou par sonde naso-gastrique si l'enfant est conscient. Référer d'urgence.",
  "téter": "Signe de danger général. Risque d'hypoglycémie et de déshydratation sévère. Tenter de réhydrater avec du SRO à la cuillère ou par sonde naso-gastrique si l'enfant est conscient. Référer d'urgence.",
  "boire": "Signe de danger général. Risque d'hypoglycémie et de déshydratation sévère. Tenter de réhydrater avec du SRO à la cuillère ou par sonde naso-gastrique si l'enfant est conscient. Référer d'urgence.",
  "léthargique": "Signe de danger général. Risque d'infection sévère (méningite, sepsis). Garder au chaud, donner du sucre sous la langue pour prévenir l'hypoglycémie. Référer d'urgence.",
  "léthargie": "Signe de danger général. Risque d'infection sévère (méningite, sepsis). Garder au chaud, donner du sucre sous la langue pour prévenir l'hypoglycémie. Référer d'urgence."
};

/**
 * Analyse une requête pour détecter des signes de danger critique.
 * 
 * @param {string|Array} input - Symptômes entrés par l'utilisateur
 * @returns {Object} Objet contenant le statut de danger, les mots détectés et les actions d'urgence
 */
export function detectDanger(input) {
  if (!input) return { isDanger: false, keywords: [], actions: [] };

  const text = Array.isArray(input) ? input.join(" ").toLowerCase() : input.toLowerCase();
  
  const detectedKeywords = [];
  const actions = [];

  Object.keys(DANGER_REGISTRY).forEach(keyword => {
    // Évite les détections partielles abusives (ex: "boire" dans "déboire", mais ici simple text.includes convient pour la clinique)
    if (text.includes(keyword)) {
      if (!detectedKeywords.includes(keyword)) {
        detectedKeywords.push(keyword);
        actions.push(DANGER_REGISTRY[keyword]);
      }
    }
  });

  // Dédupliquer les actions (ex: convulsions et convulsion mènent à la même action)
  const uniqueActions = [...new Set(actions)];

  return {
    isDanger: detectedKeywords.length > 0,
    keywords: detectedKeywords,
    actions: uniqueActions
  };
}

