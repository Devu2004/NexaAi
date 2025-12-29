import React from 'react';
import './Button.scss';

const Button = ({ 
  children, 
  onClick, 
  type = "button", 
  variant = "primary", // primary, secondary, ghost
  className = "",
  disabled = false,
  icon: Icon // Optional icon component
}) => {
  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled}
      className={`obsidian-btn ${variant} ${className}`}
    >
      {Icon && <Icon size={16} className="btn-icon" />}
      {children && <span className="btn-text">{children}</span>}
    </button>
  );
};

export default Button;