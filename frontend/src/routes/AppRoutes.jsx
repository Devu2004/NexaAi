import React from 'react';
import { Route, BrowserRouter, Routes, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import ForgotPassword from '../pages/ForgotPassword';

// --- PROTECTED ROUTE ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('nova_auth_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// --- PUBLIC ROUTE ---
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('nova_auth_token');
  
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* HOME: Sirf login users ke liye */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />

        {/* AUTH: Sirf logged-out users ke liye */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </AnimatePresence>
  );
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}