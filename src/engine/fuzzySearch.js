import Fuse from 'fuse.js';

// Cache des catégories déjà chargées (lazy loading)
const categoryCache = {};
let catalogCache = null;

/**
 * Charge le catalogue léger (index)
 */
export async function loadIndex() {
  if (catalogCache) return catalogCache;
  try {
    const res = await fetch('/data/index.json');
    catalogCache = await res.json();
    return catalogCache;
  } catch (error) {
    console.error("Erreur de chargement du catalogue", error);
    return [];
  }
}

/**
 * Charge une catégorie spécifique (Lazy Loading)
 */
export async function loadCategory(categoryName) {
  if (categoryCache[categoryName]) {
    return categoryCache[categoryName];
  }
  try {
    const res = await fetch(`/data/${categoryName}.json`);
    const data = await res.json();
    categoryCache[categoryName] = data;
    return data;
  } catch (error) {
    console.error(`Erreur de chargement de la catégorie ${categoryName}`, error);
    return [];
  }
}

/**
 * Effectue une recherche globale ou ciblée
 */
export async function search(query) {
  if (!query || query.trim() === '') return [];

  const indexData = await loadIndex();
  
  // 1. Chercher d'abord dans l'index pour trouver les catégories pertinentes
  const indexFuse = new Fuse(indexData, { keys: ['nom', 'categorie'], threshold: 0.3 });
  const indexResults = indexFuse.search(query);
  
  // Identifier les catégories à charger
  const categoriesToLoad = new Set();
  indexResults.forEach(res => categoriesToLoad.add(res.item.categorie));
  
  // Si rien trouvé, on charge toutes les catégories existantes par défaut
  if (categoriesToLoad.size === 0) {
    const allCategories = new Set(indexData.map(item => item.categorie));
    allCategories.forEach(c => categoriesToLoad.add(c));
  }

  // 2. Charger les données complètes (Lazy Loading)
  let detailedData = [];
  for (const cat of categoriesToLoad) {
    const data = await loadCategory(cat);
    detailedData = [...detailedData, ...data];
  }

  // 3. Retourner toutes les données pour que le scorer.js évalue chaque maladie individuellement.
  // Cela permet de supporter les requêtes longues (ex: "fièvre maux de tête fatigue")
  // sans être bloqué par le fuzzy matching de texte intégral.
  return detailedData.map(item => ({ item }));
}
