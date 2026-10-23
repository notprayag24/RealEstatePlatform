// src/layouts/AuthLayout.jsx - Clean Auth Layout
import React from 'react';
import { Link } from 'react-router-dom';
import '../css/layouts/auth.css';
import '../css/global.css';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      <div className="auth-layout-top">
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon">RA</div>
          <span className="auth-logo-text">
            RealEstate<span>AI</span>
          </span>
        </Link>
        
        <Link to="/" className="auth-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Home
        </Link>
      </div>

      {children}
    </div>
  );
};

export default AuthLayout;