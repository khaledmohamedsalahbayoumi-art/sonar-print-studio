import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose && onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: '#0f172a',
        border: type === 'success' ? '1px solid #10b981' : '1px solid #0284c7',
        borderRadius: '14px',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.7), 0 0 20px rgba(16, 185, 129, 0.2)',
        zIndex: 300,
        color: '#f8fafc',
        maxWidth: '420px',
        animation: 'fadeIn 0.25s ease-out forwards'
      }}
    >
      <div style={{ color: type === 'success' ? '#10b981' : '#38bdf8', flexShrink: 0 }}>
        {type === 'success' ? <CheckCircle2 size={22} /> : <Info size={22} />}
      </div>

      <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.4 }}>
        {message}
      </div>

      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
