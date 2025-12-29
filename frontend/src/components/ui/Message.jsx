import React from 'react';
import { motion } from 'framer-motion';
import { User, Cpu, Copy, Check } from 'lucide-react';
import './Message.scss';

const Message = ({ role, content }) => {
  const isAI = role === 'ai';
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
      className={`editorial-message ${role}`}
    >
      {/* Identity Layer */}
      <div className="msg-header">
        <div className="author-tag">
          <div className="icon-frame">
            {isAI ? <Cpu size={12} strokeWidth={2.5} /> : <User size={12} strokeWidth={2.5} />}
          </div>
          <span className="name">{isAI ? 'NOVA_CORE' : 'IDENTITY_01'}</span>
        </div>
        
        {/* */}
      </div>
      
      {/* Content Layer */}
      <div className="msg-body">
        <div className="content-text">
          {content}
        </div>
      </div>
    </motion.div>
  );
};

export default Message;