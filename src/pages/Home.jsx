import React from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import { IconStethoscope } from '@tabler/icons-react';

/**
 * Page d'accueil : point d'entrée pour la recherche
 */
export default function Home({ currentAgent, onLogout }) {
  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <Navbar onLogout={onLogout} />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 pb-8 sm:pb-4">
        <div className="w-full max-w-2xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 px-1">
          
          <div className="w-20 h-20 bg-primary-muted rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(29,158,117,0.1)]">
            <IconStethoscope size={40} className="text-primary" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary text-center mb-3">
            Bonjour, {currentAgent?.prenom || 'Agent'}
          </h1>
          <p className="text-text-secondary text-center mb-10 text-lg max-w-lg">
            Saisissez les symptômes du patient <strong className="text-text-primary font-semibold">séparés par des virgules</strong> pour une analyse précise.
          </p>

          <div className="w-full">
            <SearchBar autoFocus={true} />
          </div>

          <div className="mt-8 text-text-muted text-sm flex flex-wrap justify-center gap-4">
            <span className="bg-bg-input px-3 py-1.5 rounded-lg border border-border">Ex: <span className="text-text-secondary">Fièvre, frissons</span></span>
            <span className="bg-bg-input px-3 py-1.5 rounded-lg border border-border">Ex: <span className="text-text-secondary">Toux persistante</span></span>
          </div>

        </div>
      </main>
    </div>
  );
}
