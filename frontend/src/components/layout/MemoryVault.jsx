import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, Zap, Clock, ShieldCheck } from 'lucide-react';
import './MemoryVault.scss';

const MemoryVault = ({ isOpen, onClose, memories }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="vault-overlay"
          />

          <motion.aside 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="memory-vault-panel"
          >
            <header className="vault-header">
              <div className="header-top">
                <div className="vault-branding">
                  <Database size={16} color="#8b9d83" />
                  <span>NEURAL_VAULT_V1</span>
                </div>
                <button onClick={onClose} className="close-btn"><X size={20} /></button>
              </div>
              <h1>Long-Term Memory</h1>
              <p>Persistent context synchronized across all neural nodes.</p>
            </header>

            <div className="vault-content">
              {/* Memory Stats */}
              <div className="vault-stats">
                <div className="stat-card">
                  <Zap size={14} />
                  <div className="stat-info">
                    <span className="val">2.4k</span>
                    <span className="lab">Context Nodes</span>
                  </div>
                </div>
                <div className="stat-card">
                  <ShieldCheck size={14} />
                  <div className="stat-info">
                    <span className="val">Secure</span>
                    <span className="lab">Encryption</span>
                  </div>
                </div>
              </div>

              {/* Memory List */}
              <div className="memory-list">
                <p className="list-label">Recent Extractions</p>
                
                {/* Static Example: Isse backend se connect karenge baad mein */}
                <div className="memory-item">
                  <div className="item-meta">
                    <Clock size={12} />
                    <span>2 hours ago</span>
                  </div>
                  <h3>User preference: Minimalist UI</h3>
                  <p>AI detected a strong preference for "Ethereal Spine" layout and Sage colors.</p>
                </div>

                <div className="memory-item">
                  <div className="item-meta">
                    <Clock size={12} />
                    <span>Yesterday</span>
                  </div>
                  <h3>Tech Stack: React/Next.js</h3>
                  <p>Remembered active projects: "Nova AI" and "Campus Care".</p>
                </div>
              </div>
            </div>

            <footer className="vault-footer">
              <button className="clear-vault-btn">Wipe Memory Bank</button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default MemoryVault;