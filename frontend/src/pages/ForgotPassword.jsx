import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './Auth.scss';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Pass
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOTP = (e) => {
    e.preventDefault();
    console.log("Sending OTP to:", email);
    setStep(2);
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = (e) => {
    e.preventDefault();
    console.log("Verifying OTP:", otp);
    setStep(3);
  };

  // Step 3: Reset Password
  const handleResetPassword = (e) => {
    e.preventDefault();
    console.log("Setting New Password:", newPassword);
    // Simulation Success
    alert("Identity Re-secured. Redirecting to Gateway...");
    navigate('/login');
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
                  />
                  <Button variant="primary" type="submit" className="auth-submit" icon={ArrowRight}>
                    Send OTP
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
                  <p>A security code has been transmitted to {email}.</p>
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
                  <p className="resend-text" onClick={() => setStep(1)}>Wrong email? Restart</p>
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
                  />
                  <Button variant="primary" type="submit" className="auth-submit" icon={KeyRound}>
                    Update Identity
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