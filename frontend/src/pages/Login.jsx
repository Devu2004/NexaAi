import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Fingerprint } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './Auth.scss';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // SIMULATION: Token save karke Home par bhej rahe hain
    // Backend connect hone par yahan axios.post call aayegi
    localStorage.setItem('nova_auth_token', 'session_active_node_verified');
    navigate('/');
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

          <form className="auth-form" onSubmit={handleLogin}>
            <Input 
              label="Neural Address" 
              type="email" 
              placeholder="id@nova.arch" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <div className="password-field-wrapper">
              <Input 
                label="Access Phrase" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="field-action">
                <Link to="/forgot-password" title="Recover Access" className="editorial-link small">
                  Forgot Phrase?
                </Link>
              </div>
            </div>
            
            <Button variant="primary" type="submit" className="auth-submit" icon={ArrowRight}>
              Authorized Access
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