import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Fingerprint, Loader2 } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import api from '../services/api'; 
import './Auth.scss';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); 
    try {
      // 1. Real Backend API Call
      const response = await api.post('/auth/login/user', { 
        email, 
        password 
      });

      if (response.data.token) {
        localStorage.setItem('nova_auth_token', response.data.token);
        console.log(localStorage.getItem('nova_auth_token'));
        
      } else {
        localStorage.setItem('nova_auth_token', 'verified_session');
      }

      navigate('/');
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Neural connection refused. Check credentials.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="auth-obsidian">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="auth-spine"
        >
          <div className="auth-brand">
            <Fingerprint size={28} className="brand-symbol" />
            <span className="brand-tag">IDENTITY_GATEWAY_V1</span>
          </div>

          <header className="auth-header">
            <h1>Authorize.</h1>
            <p>Synchronize your node with the Nova Core stream.</p>
          </header>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className="auth-error-chip"
            >
              {error}
            </motion.div>
          )}

          <form className="auth-form" onSubmit={handleLogin}>
            <Input 
              label="Neural Address" 
              type="email" 
              placeholder="id@nova.arch" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            
            <div className="password-field-wrapper">
              <Input 
                label="Access Phrase" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <div className="field-action">
                <Link to="/forgot-password" title="Recover Access" className="editorial-link small">
                  Forgot Phrase?
                </Link>
              </div>
            </div>
            
            <Button 
              variant="primary" 
              type="submit" 
              className="auth-submit" 
              icon={isLoading ? null : ArrowRight}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-flex">
                  <Loader2 className="spinner" size={18} /> Verifying...
                </span>
              ) : (
                "Authorized Access"
              )}
            </Button>
          </form>

          <footer className="auth-footer">
            <p>New Identity? <Link to="/register" className="editorial-link">Register Node</Link></p>
          </footer>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default Login;