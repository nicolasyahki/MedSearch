import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconStethoscope, IconUser, IconLogout, IconAlertTriangle, IconHistory } from '@tabler/icons-react';
import SyncButton from './SyncButton';
import { getUnresolvedConflictCount } from '../db/database';

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const [conflictCount, setConflictCount] = useState(0);

  useEffect(() => {
    const refreshConflicts = async () => {
      const count = await getUnresolvedConflictCount();
      setConflictCount(count);
    };

    refreshConflicts();
    const interval = setInterval(refreshConflicts, 15000);
    return () => clearInterval(interval);
  }, []);


  return (
    <nav className="min-h-16 h-16 border-b border-border-strong bg-bg-app flex items-center justify-between px-3 sm:px-4 sticky top-0 z-50">
      {/* Logo MedSearch */}
      <div 
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => navigate('/')}
      >
        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white transition-transform group-hover:scale-105">
          <IconStethoscope size={20} />
        </div>
        <span className="font-bold text-lg text-text-primary tracking-tight hidden sm:block">
          Med<span className="text-primary">Search</span>
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <SyncButton />

        {conflictCount > 0 && (
          <button
            onClick={() => navigate('/sync/conflicts')}
            className="relative p-2 text-warning hover:bg-warning/10 rounded-lg transition-colors"
            title={`${conflictCount} conflit(s) de synchronisation`}
          >
            <IconAlertTriangle size={20} />
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-warning text-bg-app text-[10px] font-bold rounded-full flex items-center justify-center">
              {conflictCount}
            </span>
          </button>
        )}

        <div className="h-6 w-px bg-border-strong mx-1"></div>

        {/* Historique patients */}
        <button
          onClick={() => navigate('/patients')}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors"
          title="Historique des patients"
        >
          <IconHistory size={20} />
        </button>

        {/* Profil agent */}
        <button
          onClick={() => navigate('/profile')}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors"
          title="Mon profil"
        >
          <IconUser size={20} />
        </button>

        {/* Déconnexion */}
        <button 
          onClick={onLogout}
          className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
          title="Déconnexion"
        >
          <IconLogout size={20} />
        </button>
      </div>
    </nav>
  );
}
