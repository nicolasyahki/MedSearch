import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AutoSyncRunner from './components/AutoSyncRunner';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Results from './pages/Results';
import PatientForm from './pages/PatientForm';
import PatientList from './pages/PatientList';
import PatientDetail from './pages/PatientDetail';
import SyncConflicts from './pages/SyncConflicts';

import Profile from './pages/Profile';

function App() {
  const { isAuthenticated, hasAgent, currentAgent, registerAgent, loginAgent, loginWithEmailAndPin, logout, updateAgent } = useAuth();

  // Affichage d'un écran de chargement pendant la vérification Dexie
  if (hasAgent === null) {
    return <div className="min-h-screen bg-bg-app flex items-center justify-center text-text-secondary">Chargement...</div>;
  }

  return (
    <BrowserRouter>
      <AutoSyncRunner isAuthenticated={isAuthenticated} />
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login
                currentAgent={currentAgent}
                hasLocalAgent={hasAgent === true}
                onLogin={loginAgent}
                onLoginWithEmailAndPin={loginWithEmailAndPin}
              />
            )
          }
        />

        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : hasAgent ? (
              <Navigate to="/login" replace />
            ) : (
              <Register onRegister={registerAgent} />
            )
          }
        />

        {/* Routes protégées */}
        <Route path="/" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Home currentAgent={currentAgent} onLogout={logout} />
          </ProtectedRoute>
        } />
        
        <Route path="/results" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Results onLogout={logout} />
          </ProtectedRoute>
        } />

        <Route path="/patient/new" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PatientForm currentAgent={currentAgent} onLogout={logout} />
          </ProtectedRoute>
        } />

        <Route path="/patients" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PatientList onLogout={logout} />
          </ProtectedRoute>
        } />

        <Route path="/patient/:id" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PatientDetail onLogout={logout} />
          </ProtectedRoute>
        } />

        <Route path="/sync/conflicts" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <SyncConflicts onLogout={logout} />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Profile currentAgent={currentAgent} onLogout={logout} onUpdateAgent={updateAgent} />
          </ProtectedRoute>
        } />

        {/* Fallback vers l'accueil */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
