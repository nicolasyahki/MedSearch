import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Composant HOC (Higher-Order Component) pour protéger les routes.
 * Si l'agent n'est pas authentifié, il est redirigé vers /login.
 * 
 * @param {boolean} isAuthenticated - État d'authentification
 * @param {React.ReactNode} children - Les composants enfants à rendre si authentifié
 */
export default function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    // Redirection vers la page de connexion, en remplaçant l'historique
    return <Navigate to="/login" replace />;
  }

  return children;
}
