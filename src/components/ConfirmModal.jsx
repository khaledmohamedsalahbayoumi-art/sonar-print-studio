import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  type = 'danger', // 'danger' | 'info' | 'success'
  onConfirm,
  onCancel
}) {
  const { isRTL, t } = useLanguage();

  if (!isOpen) return null;

  const resolvedTitle = title || (isRTL ? 'تأكيد الإجراء' : 'Confirm Action');
  const resolvedConfirmText = confirmText || (isRTL ? 'تأكيد' : 'Confirm');
  const resolvedCancelText = cancelText || (isRTL ? 'إلغاء' : 'Cancel');

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 8, 16, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '20px',
      direction: isRTL ? 'rtl' : 'ltr'
    }} onClick={onCancel} className="fade-in">
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '18px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: 'var(--shadow-sheet)',
        padding: '24px',
        textAlign: 'center',
        position: 'relative'
      }} onClick={(e) => e.stopPropagation()}>

        {/* Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: type === 'danger' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(2, 132, 199, 0.12)',
          color: type === 'danger' ? '#ef4444' : '#0284c7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          border: type === 'danger' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(2, 132, 199, 0.3)'
        }}>
          {type === 'danger' ? <AlertTriangle size={28} /> : <AlertCircle size={28} />}
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
          {resolvedTitle}
        </h3>

        {/* Message */}
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 24px' }}>
          {message}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            className="btn btn-secondary"
            style={{ flex: 1, padding: '10px' }}
          >
            {resolvedCancelText}
          </button>

          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.95rem',
              backgroundColor: type === 'danger' ? '#ef4444' : '#0284c7',
              color: '#ffffff',
              boxShadow: type === 'danger' ? '0 4px 14px rgba(239, 68, 68, 0.4)' : '0 4px 14px rgba(2, 132, 199, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            {resolvedConfirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
