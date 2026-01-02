import React from 'react';
import { Route, BrowserRouter, Routes, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import ForgotPassword from '../pages/ForgotPassword';

// --- 1. PROTECTED ROUTE LOGIC ---
// Sirf logged-in users ke liye (Token check)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('nova_auth_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// --- 2. PUBLIC ROUTE LOGIC ---
// Logged-in users ko Auth pages (Login/Register) par jane se rokega
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
        
        {/* PROTECTED: Dashboard sirf login ke baad khulega */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />

        {/* PUBLIC: Login/Register sirf tab dikhenge jab user logged-out ho */}
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

        {/* FALLBACK: Galat URL par seedha Home (jo redirect handle kar lega) */}
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