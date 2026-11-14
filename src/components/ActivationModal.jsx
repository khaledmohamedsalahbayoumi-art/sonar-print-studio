import React, { useState } from 'react';
import {
  ShieldCheck,
  Key,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  Phone,
  MessageCircle,
  Lock,
  X,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useLicense } from '../context/LicenseContext';
import { useLanguage } from '../context/LanguageContext';

export function ActivationModal() {
  const {
    isActivated,
    machineId,
    licenseInfo,
    isActivationModalOpen,
    closeActivationModal,
    activate
  } = useLicense();
  const { isRTL } = useLanguage();

  const [inputKey, setInputKey] = useState('');
  const [clientName, setClientName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);

  if (!isActivationModalOpen) return null;

  // Auto-format activation key as user types: XXXX-XXXX-XXXX-XXXX
  const handleKeyChange = (e) => {
    let raw = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (raw.length > 16) raw = raw.slice(0, 16);

    const parts = [];
    for (let i = 0; i < raw.length; i += 4) {
      parts.push(raw.slice(i, i + 4));
    }
    setInputKey(parts.join('-'));
    setErrorMsg('');
  };

  const handleCopyMachineId = () => {
    if (!machineId) return;
    navigator.clipboard.writeText(machineId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanKey = inputKey.replace(/[^A-Za-z0-9]/g, '');
    if (cleanKey.length !== 16) {
      setErrorMsg(isRTL ? 'كود التفعيل يجب أن يتكون من 16 حرفاً مقسمة إلى 4 أجزاء' : 'Activation key must be 16 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await activate(inputKey, clientName);
      if (res.success) {
        setSuccessAnimation(true);
        setTimeout(() => {
          setSuccessAnimation(false);
          closeActivationModal();
        }, 1200);
      } else {
        setErrorMsg(res.error || (isRTL ? 'كود التفعيل غير صالح لهذا الجهاز' : 'Invalid activation key for this machine'));
      }
    } catch (err) {
      setErrorMsg(err.message || 'حدث خطأ أثناء التفعيل');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(5, 10, 20, 0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        direction: isRTL ? 'rtl' : 'ltr'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '24px',
          padding: '32px 28px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(14, 165, 233, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Ambient Top Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-70px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '280px',
            height: '140px',
            background: isActivated
              ? 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.3) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at center, rgba(14, 165, 233, 0.3) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* Close Button (ONLY IF already activated) */}
        {isActivated && (
          <button
            type="button"
            onClick={closeActivationModal}
            style={{
              position: 'absolute',
              top: '20px',
              left: isRTL ? '20px' : 'auto',
              right: isRTL ? 'auto' : '20px',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <X size={16} />
          </button>
        )}

        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '20px',
              background: isActivated
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)'
                : 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              border: isActivated ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(14, 165, 233, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: isActivated ? '0 0 20px rgba(16, 185, 129, 0.3)' : '0 0 20px rgba(6, 182, 212, 0.3)'
            }}
          >
            {isActivated ? (
              <ShieldCheck size={36} color="#10b981" />
            ) : (
              <Key size={34} color="#38bdf8" />
            )}
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px' }}>
            {isActivated
              ? (isRTL ? 'بيانات ترخيص البرنامج' : 'Software License Info')
              : (isRTL ? 'تفعيل ترخيص البرنامج' : 'Software Activation Required')}
          </h2>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            {isActivated
              ? (isRTL ? 'هذه النسخة أصلية ومرخصة لجهازك الطبي بنجاح' : 'This software is licensed and activated for this machine')
              : (isRTL ? 'يرجى تفعيل نسختك للبدء في استخدام برنتيفاي (Printify)' : 'Please activate your license to start using Printify')}
          </p>
        </div>

        {/* ============================================================ */}
        {/* VIEW 1: ALREADY ACTIVATED DETAILS                            */}
        {/* ============================================================ */}
        {isActivated ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <ShieldCheck size={24} color="#10b981" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981' }}>
                  {isRTL ? '✓ حالة الترخيص: نسخة أصلية مفعلة' : '✓ License Status: Genuine Activated'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {licenseInfo?.isPerpetual
                    ? (isRTL ? 'نوع الترخيص: ترخيص دائم مدى الحياة (Perpetual)' : 'License Type: Lifetime Perpetual')
                    : (isRTL
                        ? `ترخيص محدد حتى تاريخ: ${licenseInfo?.expiryDate} (متبقي ${licenseInfo?.daysLeft} يوم)`
                        : `Valid until: ${licenseInfo?.expiryDate} (${licenseInfo?.daysLeft} days remaining)`)}
                </div>
              </div>
            </div>

            {/* Machine ID Box */}
            <div
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                  {isRTL ? 'كود جهازك المعتمد (Machine ID):' : 'Hardware Machine ID:'}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '1px' }}>
                  {machineId}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyMachineId}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                title={isRTL ? 'نسخ كود الجهاز' : 'Copy Machine ID'}
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>{copied ? (isRTL ? 'تم النسخ' : 'Copied') : (isRTL ? 'نسخ' : 'Copy')}</span>
              </button>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={closeActivationModal}
              style={{
                marginTop: '10px',
                padding: '12px',
                fontSize: '0.95rem',
                background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)'
              }}
            >
              <span>{isRTL ? 'متابعة إلى البرنامج' : 'Continue to Studio'}</span>
            </button>
          </div>
        ) : (
          /* ============================================================ */
          /* VIEW 2: UNREGISTERED / ACTIVATION FORM                       */
          /* ============================================================ */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Step 1: Your Machine Code */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                {isRTL ? '1. كود جهازك الخاص (Hardware Machine ID):' : '1. Your Hardware Machine ID:'}
              </label>

              <div
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: '#38bdf8',
                    letterSpacing: '1.5px',
                    direction: 'ltr'
                  }}
                >
                  {machineId || 'جاري فحص الجهاز...'}
                </span>

                <button
                  type="button"
                  onClick={handleCopyMachineId}
                  className="btn btn-secondary"
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.82rem',
                    background: copied ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-card)',
                    borderColor: copied ? '#10b981' : 'var(--border-subtle)',
                    color: copied ? '#10b981' : 'var(--text-main)'
                  }}
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  <span>{copied ? (isRTL ? 'تم النسخ بنجاح' : 'Copied!') : (isRTL ? 'نسخ الكود' : 'Copy Code')}</span>
                </button>
              </div>

              <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {isRTL
                  ? '💡 انسخ هذا الكود وأرسله للمطور عبر الواتساب للحصول على مفتاح التفعيل لجهازك.'
                  : 'Copy this ID and send it to the developer to get your activation key.'}
              </span>
            </div>

            {/* Step 2: Enter Activation Key */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                {isRTL ? '2. أدخل مفتاح التفعيل المستلم (Activation Key):' : '2. Enter your received Activation Key:'}
              </label>

              <input
                type="text"
                value={inputKey}
                onChange={handleKeyChange}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                dir="ltr"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-primary)',
                  border: errorMsg ? '2px solid #ef4444' : '2px solid var(--border-subtle)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '1.25rem',
                  fontFamily: 'monospace',
                  fontWeight: 800,
                  letterSpacing: '3px',
                  textAlign: 'center',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  if (!errorMsg) e.target.style.borderColor = '#0284c7';
                }}
                onBlur={(e) => {
                  if (!errorMsg) e.target.style.borderColor = 'var(--border-subtle)';
                }}
              />

              {errorMsg && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#f87171',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    marginTop: '6px'
                  }}
                >
                  <AlertCircle size={15} />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || inputKey.replace(/[^A-Za-z0-9]/g, '').length !== 16}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: successAnimation
                  ? '#10b981'
                  : 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: 800,
                cursor: (isSubmitting || inputKey.replace(/[^A-Za-z0-9]/g, '').length !== 16) ? 'not-allowed' : 'pointer',
                opacity: inputKey.replace(/[^A-Za-z0-9]/g, '').length !== 16 ? 0.6 : 1,
                boxShadow: '0 4px 18px rgba(6, 182, 212, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                marginTop: '6px'
              }}
            >
              {successAnimation ? (
                <>
                  <Check size={20} />
                  <span>{isRTL ? 'تم التفعيل بنجاح! جاري الدخول...' : 'Activated Successfully!'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>{isSubmitting ? (isRTL ? 'جاري التحقق...' : 'Verifying...') : (isRTL ? 'تفعيل البرنامج الآن 🚀' : 'Activate Software Now 🚀')}</span>
                </>
              )}
            </button>

            {/* Developer Contact & WhatsApp Assistance */}
            <div
              style={{
                marginTop: '10px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                fontSize: '0.84rem',
                color: 'var(--text-muted)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageCircle size={18} color="#22c55e" />
                <span style={{ fontWeight: 600 }}>{isRTL ? 'لطلب كود التفعيل عبر واتساب:' : 'WhatsApp Support:'}</span>
              </div>

              <a
                href={`https://wa.me/201553332921?text=${encodeURIComponent(
                  `السلام عليكم، أود تفعيل برنامج Printify.\nكود جهازي هو: ${machineId || ''}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(34, 197, 94, 0.12)',
                  border: '1px solid rgba(34, 197, 94, 0.35)',
                  color: '#22c55e',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontFamily: 'monospace',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  direction: 'ltr',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.22)';
                  e.currentTarget.style.borderColor = '#22c55e';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.35)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                title={isRTL ? 'اضغط لفتح محادثة واتساب فورية وإرسال كود جهازك' : 'Click to send your machine code via WhatsApp'}
              >
                <span>01553332921</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

