import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import DiagnosticCard from '../components/DiagnosticCard';
import DangerAlert from '../components/DangerAlert';
import { search } from '../engine/fuzzySearch';
import { detectDanger } from '../engine/dangerDetector';
import { calculateScore } from '../engine/scorer';
import { IconArrowLeft, IconLoader2, IconInfoCircle } from '@tabler/icons-react';

/**
 * Page affichant les résultats de l'analyse
 */
export default function Results({ onLogout }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dangerInfo, setDangerInfo] = useState({ isDanger: false, keywords: [] });

  useEffect(() => {
    if (query) {
      performAnalysis(query);
    } else {
      setIsLoading(false);
    }
  }, [query]);

  const performAnalysis = async (searchQuery) => {
    setIsLoading(true);
    
    // 1. Détection de mots-clés critiques
    const danger = detectDanger(searchQuery);
    setDangerInfo(danger);

    // 2. Recherche des correspondances dans la base
    const fuseResults = await search(searchQuery);

    // 3. Calcul du score et filtrage
    // L'agent sépare les symptômes par des virgules
    const userSymptoms = searchQuery.toLowerCase().split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    let scoredResults = fuseResults.map(res => {
      const scoring = calculateScore(userSymptoms, res.item);
      return {
        item: res.item,
        score: scoring.score,
        message: scoring.message
      };
    });

    // Filtre les scores < 30% et trie du plus élevé au plus bas
    scoredResults = scoredResults
      .filter(res => res.score >= 30)
      .sort((a, b) => b.score - a.score);

    setResults(scoredResults);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <Navbar onLogout={onLogout} />
      
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col animate-in fade-in">
        {/* Navigation et barre de recherche en haut */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-6 pt-2">
          <button 
            onClick={() => navigate('/')}
            className="self-start p-3 min-w-[48px] min-h-[48px] flex items-center justify-center text-text-secondary hover:text-text-primary bg-bg-input hover:bg-bg-hover border border-border-strong rounded-xl transition-colors"
            aria-label="Retour à l'accueil"
          >
            <IconArrowLeft size={22} />
          </button>
          <div className="flex-1 w-full min-w-0">
            <SearchBar initialValue={query} />
          </div>
        </div>

        {/* Alerte si danger détecté */}
        {dangerInfo.isDanger && <DangerAlert keywords={dangerInfo.keywords} actions={dangerInfo.actions} />}

        <div className="flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <IconLoader2 size={40} className="text-primary animate-spin mb-4" />
              <p className="text-text-secondary font-medium animate-pulse">Analyse des symptômes en cours...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                Diagnostics probables 
                <span className="bg-bg-input text-text-secondary text-sm px-2 py-0.5 rounded-full border border-border">
                  {results.length}
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.map((result, index) => (
                  <DiagnosticCard key={result.item.id || index} result={result} />
                ))}
              </div>
            </>
          ) : (
            <div className="bg-bg-card border border-border-strong rounded-2xl p-10 flex flex-col items-center text-center mt-8">
              <div className="w-16 h-16 bg-bg-input rounded-full flex items-center justify-center mb-4 text-text-muted">
                <IconInfoCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Aucun résultat probant</h3>
              <p className="text-text-secondary max-w-md mb-6">
                Les symptômes renseignés ("{query}") ne correspondent à aucune pathologie connue avec un degré de certitude suffisant.
              </p>
              <div className="p-4 bg-warning/10 text-warning rounded-xl border border-warning/20 w-full max-w-md">
                <span className="font-semibold block mb-1">Action requise</span>
                Données insuffisantes, veuillez référer le patient à un médecin qualifié.
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
