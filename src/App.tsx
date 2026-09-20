import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Play from './pages/Play';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Wallet from './pages/Wallet';
import Admin from './pages/Admin';

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { session, profile, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-bold animate-pulse">Carregando...</div>;
  
  if (!session?.user) return <Navigate to="/login" replace />;
  
  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/jogar" replace />;
  }
  return children;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          
          <Route path="/jogar" element={<ProtectedRoute><Play /></ProtectedRoute>} />
          <Route path="/carteira" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          
          <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" />
    </AuthProvider>
  );
}
