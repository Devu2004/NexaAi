import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Loader2, Command, Lock, Copy, Check } from 'lucide-react';
import Message from '../ui/Message';
import Button from '../ui/Button'; 
import api from '../../services/api'; 
import './ChatContainer.scss';

const ChatContainer = ({ activeChatId, userName }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null); 
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  const displayName = userName || "Explorer";
  const firstName = displayName.split(' ')[0];

  // 1. FETCH MESSAGE HISTORY (Persistence Fix)
  // Jab bhi chat switch hogi, ye purane messages load karega
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChatId) {
        setMessages([]);
        return;
      }
      
      try {
        setIsLoading(true);
        // Pehle UI saaf karo (Optional, but better UX)
        setMessages([]); 
        
        const response = await api.get(`/chat/${activeChatId}/messages`);
        
        // Backend se aayi history ko state mein save karo
        if (response.data && response.data.messages) {
          setMessages(response.data.messages);
        }
      } catch (err) {
        console.error("Neural Stream Sync Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [activeChatId]);

  // Auto scroll logic
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Copy to Clipboard Utility
  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000); 
  };

  // 2. SEND MESSAGE
  const handleSend = async () => {
    if (!input.trim() || isLoading || !activeChatId) return;

    const userMsgContent = input;
    setInput('');
    
    // User message local state mein turant dalo
    const userMsg = { role: 'user', content: userMsgContent };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Backend ko message bhejo (Backend ise DB mein save bhi karega)
      const response = await api.post('/chat/message', { 
        chatId: activeChatId, 
        content: userMsgContent 
      });

      // AI response state mein dalo
      const aiResponse = { 
        role: 'ai', 
        content: response.data.aiContent 
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error("Communication Error:", err);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "System Error: Failed to receive AI broadcast. Please check server." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`obsidian-chat ${!activeChatId ? 'state-locked' : 'state-active'}`}>
      <div className="broadcast-stream custom-scroll">
        <AnimatePresence mode="popLayout">
          {!activeChatId ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stream-placeholder">
              <div className="lock-notice">
                <div className="lock-icon-wrapper"><Lock size={32} /></div>
                <h3>Neural Stream Locked</h3>
                <p>Select a broadcast channel from the sidebar to establish a connection.</p>
              </div>
            </motion.div>
          ) : messages.length === 0 && !isLoading ? (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="stream-intro">
              <div className="welcome-spine">
                <span className="system-tag">SESSION_ACTIVE</span>
                <h1 className="user-greet">Hi {firstName},</h1>
                <p className="editorial-quote">
                  Stream Secured. <br/>
                  Awaiting Neural Input...
                </p>
                <div className="mood-indicator">
                  <div className="dot pulse"></div>
                  <span>Ready for mission</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="message-list">
              {messages.map((msg, i) => (
                <motion.div 
                  key={i} 
                  className="message-wrapper"
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Message role={msg.role} content={msg.content} />
                  
                  {/* Clean Copy Button Design */}
                  <button 
                    className={`copy-btn ${copiedId === i ? 'copied' : ''}`}
                    onClick={() => handleCopy(msg.content, i)}
                  >
                    {copiedId === i ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </motion.div>
              ))}
              
              {isLoading && (
                <div className="system-loader">
                  <Loader2 size={16} className="spin-icon" />
                  <span>Nova is thinking...</span>
                </div>
              )}
              <div ref={scrollRef} style={{ height: '1px' }} />
            </div>
          )}
        </AnimatePresence>
      </div>

      <footer className={`command-dock ${!activeChatId ? 'is-locked' : ''}`}>
        <div className="command-wrapper">
          <div className="input-field">
            <textarea 
              ref={textareaRef}
              placeholder={activeChatId ? `Command Nova AI...` : "Neural Connection: INACTIVE"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!activeChatId || isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
            />
          </div>
          <div className="input-controls">
            <div className="shortcut-hint desktop-only"><Command size={12} /><span>+ Enter to broadcast</span></div>
            <Button 
              variant="primary"
              icon={isLoading ? Loader2 : (activeChatId ? ArrowUp : Lock)}
              onClick={handleSend}
              disabled={!input.trim() || isLoading || !activeChatId}
              className={`send-trigger ${input.trim() ? 'active' : ''}`}
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatContainer;