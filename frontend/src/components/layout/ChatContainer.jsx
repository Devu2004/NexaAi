import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Loader2, Command } from 'lucide-react';
import Message from '../ui/Message';
import Button from '../ui/Button'; 
import './ChatContainer.scss';

const ChatContainer = ({ chatData, userName }) => {
  const [input, setInput] = useState('');
  // Initialize local messages from props
  const [messages, setMessages] = useState(chatData?.messages || []);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  const displayName = userName || "Explorer";
  const firstName = displayName.split(' ')[0];

  // Auto scroll to bottom
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

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    // User Message
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // AI Simulation (Later connect to your Node.js backend)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: `Neural stream synchronized for ${chatData?.title || 'this session'}. How can I assist you further, ${firstName}?` 
      }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="obsidian-chat">
      {/* 1. Message Viewport */}
      <div className="broadcast-stream custom-scroll">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="stream-intro"
            >
              <div className="welcome-spine">
                <span className="system-tag">SESSION_ACTIVE</span>
                <h1 className="user-greet">Hi {firstName},</h1>
                
                <p className="editorial-quote">
                  Initiating {chatData?.title || 'New Stream'}... <br/>
                  What's on your mood today?
                </p>

                <div className="mood-indicator">
                  <div className="dot pulse"></div>
                  <span>Ready for the mission?</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="message-list">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Message {...msg} />
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

      {/* 2. Input Control (Docked) */}
      <footer className="command-dock">
        <div className="command-wrapper">
          <div className="input-field">
            <textarea 
              ref={textareaRef}
              placeholder={`Command Nova AI, ${firstName}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
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
            <div className="shortcut-hint desktop-only">
              <Command size={12} />
              <span>+ Enter to broadcast</span>
            </div>
            
            <Button 
              variant="primary"
              icon={isLoading ? Loader2 : ArrowUp}
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`send-trigger ${input.trim() ? 'active' : ''} ${isLoading ? 'loading-active' : ''}`}
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatContainer;