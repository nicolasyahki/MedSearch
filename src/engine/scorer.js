import Fuse from 'fuse.js';

/**
 * Calcule le pourcentage de correspondance entre les symptômes utilisateur et une maladie.
 * 
 * @param {Array} userSymptoms - Liste des mots/symptômes saisis par l'utilisateur
 * @param {Object} disease - Maladie avec ses symptômes et poids (Majeur=3, Moyen=2, Mineur=1)
 * @returns {Object} Score en % et message d'alerte si applicable
 */
export function calculateScore(userSymptoms, disease) {
  if (!userSymptoms || userSymptoms.length === 0 || !disease || !disease.symptomes) {
    return { score: 0, message: "Données insuffisantes, consulter un médecin" };
  }

  let maxScore = 0;
  let currentScore = 0;

  disease.symptomes.forEach(sym => {
    maxScore += sym.poids;
  });

  if (maxScore === 0) {
    return { score: 0, message: "Données insuffisantes, consulter un médecin" };
  }

  // Filtrer les petits mots de liaison (le, la, de, et, un, etc.)
  const normalizedUserSymptoms = userSymptoms
    .map(s => s.toLowerCase().trim())
    .filter(s => s.length > 2);

  // Utilisation de Fuse.js pour faire correspondre les mots tapés avec les symptômes de la maladie
  const fuse = new Fuse(disease.symptomes, {
    keys: ['nom'],
    threshold: 0.4, // Tolérance aux fautes d'orthographe
    ignoreLocation: true,
    includeScore: true
  });

  const matchedSymptoms = new Set();

  normalizedUserSymptoms.forEach(userWord => {
    const results = fuse.search(userWord);
    // Si on trouve une correspondance valide
    if (results.length > 0) {
      // On ajoute le symptôme qui a matché
      matchedSymptoms.add(results[0].item.nom);
    }
  });

  let hasMajorSymptom = false;

  disease.symptomes.forEach(sym => {
    // Si le symptôme a été détecté dans les mots de l'utilisateur
    if (matchedSymptoms.has(sym.nom)) {
      currentScore += sym.poids;
      if (sym.poids >= 3) {
        hasMajorSymptom = true;
      }
    }
  });

  // Si l'utilisateur a tapé le nom exact de la maladie, on donne un score de 100%
  const queryStr = userSymptoms.join(" ");
  if (queryStr.includes(disease.nom.toLowerCase())) {
    currentScore = maxScore;
    hasMajorSymptom = true;
  }

  let scorePercent = Math.round((currentScore / maxScore) * 100);

  // SÉCURITÉ : Pénaliser fortement si la maladie a des symptômes majeurs mais qu'aucun n'est trouvé
  if (!hasMajorSymptom && disease.symptomes.some(s => s.poids >= 3)) {
    scorePercent = Math.round(scorePercent * 0.5); // On divise le score par 2
  }

  // SÉCURITÉ : Augmenter le seuil d'affichage à 35% pour éviter les faux positifs
  if (scorePercent < 35) {
    return { score: scorePercent, message: "Correspondance trop faible, évaluez plus de symptômes." };
  }

  return { score: scorePercent, message: null };
}
