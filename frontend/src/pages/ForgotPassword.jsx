import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, KeyRound, CheckCircle2, Loader2 } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import api from '../services/api'; // Axios instance
import './Auth.scss';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  // Step 1: Backend se OTP mangwana
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2); // Success hone par OTP wale step par jao
    } catch (err) {
      setError(err.response?.data?.message || "Failed to transmit recovery code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError("Invalid security code format.");
      return;
    }
    setError('');
    setStep(3); 
  };

  // Step 3: Final Reset (OTP + New Password)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { 
        email, 
        otp: Number(otp), 
        newPassword 
      });

      alert("Identity Re-secured. Neural access restored.");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "Protocol failed. Security code might be expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="auth-obsidian">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="auth-spine"
        >
          <div className="auth-brand">
            <ShieldAlert size={28} className="brand-symbol" />
            <span className="brand-tag">RECOVERY_PROTOCOL_V1</span>
          </div>

          {/* Error Feedback */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="auth-error-chip">
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <header className="auth-header">
                  <h1>Recover Access.</h1>
                  <p>Enter your neural address to receive a verification code.</p>
                </header>
                <form className="auth-form" onSubmit={handleSendOTP}>
                  <Input 
                    label="Neural Address" 
                    type="email" 
                    placeholder="id@nova.arch" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <Button variant="primary" type="submit" className="auth-submit" disabled={isLoading} icon={isLoading ? null : ArrowRight}>
                    {isLoading ? <Loader2 className="spinner" size={18} /> : "Send OTP"}
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <header className="auth-header">
                  <h1>Verify Node.</h1>
                  <p>A security code has been transmitted to <span style={{color: '#10a37f'}}>{email}</span>.</p>
                </header>
                <form className="auth-form" onSubmit={handleVerifyOTP}>
                  <Input 
                    label="Security Code" 
                    type="text" 
                    placeholder="Enter 6-digit OTP" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                  <Button variant="primary" type="submit" className="auth-submit" icon={CheckCircle2}>
                    Verify Identity
                  </Button>
                  <p className="resend-text" style={{cursor: 'pointer', marginTop: '15px', fontSize: '12px', color: '#666'}} onClick={() => setStep(1)}>
                    Wrong email? <span style={{color: '#10a37f'}}>Restart Protocol</span>
                  </p>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <header className="auth-header">
                  <h1>New Access Phrase.</h1>
                  <p>Establish a new secure connection phrase for your node.</p>
                </header>
                <form className="auth-form" onSubmit={handleResetPassword}>
                  <Input 
                    label="New Access Phrase" 
                    type="password" 
                    placeholder="••••••••" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <Button variant="primary" type="submit" className="auth-submit" disabled={isLoading} icon={isLoading ? null : KeyRound}>
                    {isLoading ? <Loader2 className="spinner" size={18} /> : "Update Identity"}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <footer className="auth-footer">
            <Link to="/login" className="editorial-link">Return to Gateway</Link>
          </footer>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default ForgotPassword;