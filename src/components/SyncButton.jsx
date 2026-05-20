import { IconCloudUpload, IconWifiOff, IconLoader2 } from '@tabler/icons-react'
import { useSync } from '../hooks/useSync'

/**
 * Bouton de synchronisation intelligent qui s'adapte en temps réel à l'état de la connexion réseau
 * et gère automatiquement l'envoi des données et les animations de chargement.
 */
function SyncButton({ isOnline: propIsOnline, onClick }) {
  const { syncData, isSyncing, isOnline: isOnlineSystem } = useSync()
  
  const activeOnline = propIsOnline !== undefined ? (propIsOnline && isOnlineSystem) : isOnlineSystem

  const handleSyncClick = async (e) => {
    e.stopPropagation() // Empêche le clic de se propager
    if (onClick) {
      onClick(e)
    } else {
      await syncData()
    }
  }

  return (
    <button 
      disabled={!isOnlineSystem || isSyncing}
      onClick={handleSyncClick}
      className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-all duration-300 ${
        isOnlineSystem && !isSyncing
          ? 'hover:bg-bg-hover cursor-pointer active:scale-95' 
          : 'opacity-40 cursor-not-allowed bg-transparent'
      }`}
      title={
        isSyncing 
          ? "Synchronisation en cours..." 
          : isOnlineSystem 
            ? "Synchroniser les données avec le serveur" 
            : "Synchronisation impossible (Hors-ligne)"
      }
    >
      {isSyncing ? (
        <IconLoader2 size={20} className="text-primary animate-spin" />
      ) : activeOnline ? (
        <IconCloudUpload size={20} className="text-primary hover:scale-110 transition-transform" />
      ) : (
        <IconWifiOff size={20} className="text-text-muted" />
      )}
    </button>
  )
}

export default SyncButton


