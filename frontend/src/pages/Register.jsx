import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Zap, Loader2 } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import api from '../services/api'; 
import './Auth.scss';

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Neural phrases do not match. Re-verify access codes.");
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/register/user', {
        fullName: {
          firstName: formData.firstName,
          lastName: formData.lastName
        },
        email: formData.email,
        password: formData.password
      });

      alert("Node successfully initialized! Synchronizing identity...");
      navigate('/login');

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration protocol failed. Node rejected.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      {/* Scrollable container fix */}
      <div className="auth-obsidian custom-scroll">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="auth-spine"
        >
          <div className="auth-brand">
            <Zap size={24} className="brand-symbol" />
            <span className="brand-tag">NODE_REGISTRATION_V1</span>
          </div>

          <header className="auth-header">
            <h1>Create Identity.</h1>
            <p>Initialize your node to join the network.</p>
          </header>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="auth-error-chip"
            >
              {error}
            </motion.div>
          )}

          <form className="auth-form" onSubmit={handleRegister}>
            {/* Mobile optimized row */}
            <div className="form-row responsive-grid">
              <Input 
                label="First Name" 
                placeholder="John" 
                value={formData.firstName}
                onChange={(e) => handleChange(e, 'firstName')}
                required
                disabled={isLoading}
              />
              <Input 
                label="Last Name" 
                placeholder="Doe" 
                value={formData.lastName}
                onChange={(e) => handleChange(e, 'lastName')}
                required
                disabled={isLoading}
              />
            </div>
            
            <Input 
              label="Neural Address" 
              type="email" 
              placeholder="id@nova.arch" 
              value={formData.email}
              onChange={(e) => handleChange(e, 'email')}
              required
              disabled={isLoading}
            />
            
            <Input 
              label="Access Phrase" 
              type="password" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={(e) => handleChange(e, 'password')}
              required
              disabled={isLoading}
            />

            <Input 
              label="Confirm Phrase" 
              type="password" 
              placeholder="••••••••" 
              value={formData.confirmPassword}
              onChange={(e) => handleChange(e, 'confirmPassword')}
              required
              disabled={isLoading}
            />
            
            <div className="auth-action-zone">
                <Button 
                variant="primary" 
                type="submit" 
                className="auth-submit" 
                icon={isLoading ? null : UserPlus}
                disabled={isLoading}
                >
                {isLoading ? (
                    <span className="loading-flex">
                    <Loader2 className="spinner" size={18} /> Initializing...
                    </span>
                ) : (
                    "Initialize Node"
                )}
                </Button>
            </div>
          </form>

          <footer className="auth-footer">
            <p>Identity exists? <Link to="/login" className="editorial-link">Authorize Now</Link></p>
          </footer>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default Register;