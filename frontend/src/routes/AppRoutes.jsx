import React from 'react';
import { Route, BrowserRouter, Routes, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import ForgotPassword from '../pages/ForgotPassword';

/**
 * 1. PROTECTED ROUTE
 * Sirf login karne wale users Dashboard (Home) dekh payenge.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('nova_auth_token');
  
  // Agar token nahi hai, to login page par bhej do
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

/**
 * 2. PUBLIC ROUTE
 * Agar user pehle se logged-in hai, to use Login/Register page nahi dikhna chahiye.
 */
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('nova_auth_token');
  
  // Agar token hai, to seedha Home page par redirect karo
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    // mode="wait" ensures current page finishes exit animation before next one enters
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* HOME (Protected) */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />

        {/* AUTH ROUTES (Public Only) */}
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
              <Register  />
            </PublicRoute>
          } 
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* 404/FALLBACK */}
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