import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Zap } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './Auth.scss';

const Register = () => {
  const navigate = useNavigate();
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

  const handleRegister = (e) => {
    e.preventDefault();
    // Logic check: password match validation yahan kar sakte ho
    if(formData.password !== formData.confirmPassword) {
      alert("Neural phrases do not match.");
      return;
    }

    // SIMULATION: Register successful, bhej do login par
    console.log("Registering Node:", formData);
    navigate('/login');
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
            <Zap size={28} className="brand-symbol" />
            <span className="brand-tag">NODE_REGISTRATION_V1</span>
          </div>

          <header className="auth-header">
            <h1>Create Identity.</h1>
            <p>Initialize your neural node to join the editorial network.</p>
          </header>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-row">
              <Input 
                label="First Name" 
                placeholder="John" 
                value={formData.firstName}
                onChange={(e) => handleChange(e, 'firstName')}
                required
              />
              <Input 
                label="Last Name" 
                placeholder="Doe" 
                value={formData.lastName}
                onChange={(e) => handleChange(e, 'lastName')}
                required
              />
            </div>
            
            <Input 
              label="Neural Address" 
              type="email" 
              placeholder="id@nova.arch" 
              value={formData.email}
              onChange={(e) => handleChange(e, 'email')}
              required
            />
            
            <Input 
              label="Access Phrase" 
              type="password" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={(e) => handleChange(e, 'password')}
              required
            />

            <Input 
              label="Confirm Phrase" 
              type="password" 
              placeholder="••••••••" 
              value={formData.confirmPassword}
              onChange={(e) => handleChange(e, 'confirmPassword')}
              required
            />
            
            <Button variant="primary" type="submit" className="auth-submit" icon={UserPlus}>
              Initialize Node
            </Button>
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