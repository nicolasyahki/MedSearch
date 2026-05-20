import React, { useState } from 'react';
import { IconSearch } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar({ onSearch, autoFocus = false, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(`/results?q=${encodeURIComponent(query)}`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 sm:block sm:relative">
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <IconSearch size={22} className="text-text-secondary" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: fièvre, maux de tête, toux..."
          autoFocus={autoFocus}
          enterKeyHint="search"
          className="w-full bg-bg-input border-2 border-border focus:border-primary text-text-primary text-base rounded-2xl py-4 pl-12 pr-4 sm:pr-28 outline-none transition-colors placeholder:text-text-muted shadow-sm min-h-[52px]"
        />
        {/* Bouton visible sur tablette / desktop (dans le champ) */}
        <button
          type="submit"
          className="absolute inset-y-2 right-2 px-4 min-h-[44px] hidden sm:flex items-center justify-center bg-primary hover:bg-primary-light active:bg-primary-dark text-white font-medium rounded-xl transition-colors"
        >
          Analyser
        </button>
      </div>

      {/* Bouton pleine largeur sur mobile */}
      <button
        type="submit"
        disabled={!query.trim()}
        className="w-full min-h-[48px] sm:hidden flex items-center justify-center gap-2 bg-primary hover:bg-primary-light active:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-colors shadow-sm"
      >
        <IconSearch size={20} />
        Analyser
      </button>
    </form>
  );
}
