import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Save, X, ShieldCheck, Loader2 } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './ProfileSettings.scss';

const ProfileSettings = ({ isOpen, onClose, user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [status, setStatus] = useState(user.status || 'System Online');
  const [preview, setPreview] = useState(user.image || null);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef(null);

  // Sync state with user prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setStatus(user.status);
      setPreview(user.image);
    }
  }, [isOpen, user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    
    // Simulate API Call / Persistence Logic
    const updatedUser = {
      ...user,
      name: name,
      status: status,
      image: preview
    };

    // 1. Save to LocalStorage for persistence on reload
    localStorage.setItem('user_profile', JSON.stringify(updatedUser));

    // 2. Update Parent State
    setTimeout(() => {
      onUpdate(updatedUser);
      setIsSyncing(false);
      onClose();
    }, 800); // Chhota sa delay professional feel ke liye
  };

  if (!isOpen) return null;

  return (
    <div className="profile-overlay" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="profile-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <div className="header-identity">
            <ShieldCheck size={14} className="icon-sec" />
            <span className="title">IDENTITY_CONFIGURATION</span>
          </div>
          <button className="close-trigger" onClick={onClose} aria-label="Close">
            <X size={20} strokeWidth={1.5} />
          </button>
        </header>

        <div className="profile-body">
          <div className="avatar-preview-section">
            <div className="avatar-circle">
              {preview ? (
                <img src={preview} alt="Profile" />
              ) : (
                <div className="fallback-initial">{name ? name.charAt(0).toUpperCase() : 'U'}</div>
              )}
              <button 
                className="cam-badge" 
                onClick={() => fileInputRef.current.click()}
                title="Change Avatar"
              >
                <Camera size={14} />
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              hidden 
              accept="image/*" 
              onChange={handleImageChange} 
            />
          </div>

          <div className="form-stack">
            <Input 
              label="Display Name" 
              placeholder="Enter your name"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
            
            <Input 
              label="System Status" 
              placeholder="e.g. Working on Campus Care"
              value={status} 
              onChange={(e) => setStatus(e.target.value)} 
            />
          </div>

          <div className="action-footer">
            <Button 
              variant="primary" 
              className="sync-btn"
              onClick={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <><Loader2 size={18} className="spin" /> Updating...</>
              ) : (
                <><Save size={18} /> Sync Changes</>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSettings;