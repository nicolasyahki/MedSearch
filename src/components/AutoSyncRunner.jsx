import { useAutoSyncOnReconnect } from '../hooks/useAutoSyncOnReconnect';

/**
 * Active la synchronisation automatique dans le contexte du routeur.
 */
export default function AutoSyncRunner({ isAuthenticated }) {
  useAutoSyncOnReconnect(isAuthenticated);
  return null;
}
