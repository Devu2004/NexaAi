import React from 'react';
import './Input.scss';

const Input = ({ 
  label, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  error 
}) => {
  return (
    <div className={`obsidian-input-group ${error ? 'has-error' : ''}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrapper">
        <input 
          type={type} 
          placeholder={placeholder} 
          value={value} 
          onChange={onChange} 
        />
        <div className="input-focus-line" />
      </div>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default Input;