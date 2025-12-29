import React from 'react';
import { motion } from 'framer-motion';

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      // Initial: Subtle scale and blur for high-end entry
      initial={{ opacity: 0, y: 15, scale: 0.99, filter: 'blur(10px)' }}
      // Animate: Crystal clear state
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      // Exit: Smooth upward fade
      exit={{ opacity: 0, y: -15, filter: 'blur(10px)' }}
      // Liquid transition cubic-bezier
      transition={{ 
        duration: 0.9, 
        ease: [0.16, 1, 0.3, 1], 
        delay: 0.1 
      }}
      className="page-wrapper-root"
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;