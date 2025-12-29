import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Save, X, ShieldCheck, Loader2 } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import api from '../services/api'; // Backend API service
import './ProfileSettings.scss';

const ProfileSettings = ({ isOpen, onClose, user, onUpdate }) => {
  const [name, setName] = useState(user?.name || '');
  const [status, setStatus] = useState(user?.status || 'System Online');
  const [preview, setPreview] = useState(user?.image || null);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setStatus(user.status || 'System Online');
      setPreview(user.image || null);
    }
  }, [isOpen, user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result); // Base64 preview
      reader.readAsDataURL(file);
    }
  };

  // ================= BACKEND LINKING LOGIC =================
  const handleSync = async () => {
    if (!name.trim()) return;
    setIsSyncing(true);
    
    try {
      const response = await api.put('/user/update-profile', {
        name: name,
        status: status,
        image: preview // Sending Base64 or Image URL
      });

      // Update parent state with fresh data from DB
      if (response.data.user) {
        onUpdate(response.data.user);
      } else {
        onUpdate({ ...user, name, status, image: preview });
      }

      onClose();
    } catch (err) {
      console.error("Profile Sync Failed:", err);
      alert("Failed to update identity. Check connection.");
    } finally {
      setIsSyncing(false);
    }
  };
  // =========================================================

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
                <><Loader2 size={18} className="spin" /> Syncing...</>
              ) : (
                <><Save size={18} /> Save Identity</>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSettings;