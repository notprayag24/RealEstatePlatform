// src/components/common/DeleteModal.jsx
import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

const DeleteModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.3s ease'
    }}
    onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '420px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        animation: 'slideUp 0.3s ease',
        position: 'relative'
      }}
      onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            transition: 'color 0.3s ease',
            padding: '4px'
          }}
          onMouseEnter={(e) => e.target.style.color = '#1a1a1a'}
          onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <Trash2 size={28} style={{ color: '#ef4444' }} />
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#1a1a1a',
          textAlign: 'center',
          marginBottom: '8px'
        }}>
          {title || 'Delete Property'}
        </h3>

        {/* Message */}
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center',
          lineHeight: '1.6',
          marginBottom: '24px'
        }}>
          {message || 'Are you sure you want to delete this property? This action cannot be undone.'}
        </p>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 28px',
              background: 'transparent',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              color: '#6b7280',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#d4af37';
              e.currentTarget.style.color = '#1a1a1a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 28px',
              background: 'linear-gradient(145deg, #ef4444, #dc2626)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px -4px rgba(239,68,68,0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px -6px rgba(239,68,68,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px -4px rgba(239,68,68,0.3)';
            }}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default DeleteModal;