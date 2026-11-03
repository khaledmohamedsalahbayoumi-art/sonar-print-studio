import React, { useState, useEffect } from 'react';
import { useDoctor } from '../context/DoctorContext';
import { useLanguage } from '../context/LanguageContext';
import { X, Upload, Check, RotateCcw, Building2, Phone, MapPin, User, Award, ShieldAlert } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export function DoctorSettingsModal({ isOpen, onClose }) {
  const { doctorInfo, updateDoctorInfo, resetDoctorInfo, defaultLogo, presets } = useDoctor();
  const { lang, t, isRTL } = useLanguage();

  const [formData, setFormData] = useState({ ...doctorInfo });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...doctorInfo });
    }
  }, [doctorInfo, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateDoctorInfo(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 700);
  };

  const executeReset = () => {
    resetDoctorInfo();
    const freshPreset = presets ? (presets[lang] || presets.ar) : doctorInfo;
    setFormData({
      ...freshPreset,
      logo: defaultLogo
    });
    setIsResetModalOpen(false);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 8, 16, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-main)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '780px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-sheet)',
        padding: '28px',
        direction: isRTL ? 'rtl' : 'ltr',
        textAlign: isRTL ? 'right' : 'left'
      }} onClick={(e) => e.stopPropagation()} className="fade-in">
        
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '16px',
          marginBottom: '22px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {t('doctorSettingsTitle')}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              {t('saveSettings')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-icon"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Preview of Header on Paper */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          color: '#0f172a',
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          border: '1px solid #cbd5e1'
        }}>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>{isRTL ? 'معاينة حية لشكل الترويسة على ورقة الطباعة:' : 'Live Preview of Paper Header:'}</span>
            <span style={{ color: '#0284c7' }}>{isRTL ? 'ترويسة رسمية' : 'Official Header'}</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #0284c7',
            paddingBottom: '12px',
            gap: '16px'
          }}>
            {/* Right: Clinic & Doctor info */}
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0369a1', margin: 0 }}>
                {formData.clinicName || (isRTL ? 'اسم المركز أو العيادة' : 'Clinic / Center Name')}
              </h3>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {formData.doctorName || (isRTL ? 'اسم الطبيب' : 'Doctor Name')}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>
                {formData.specialty || (isRTL ? 'التخصص' : 'Specialty')}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                {formData.degree}
              </div>
            </div>

            {/* Left: Logo + Contacts */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left', direction: 'ltr' }}>
              <div style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.4 }}>
                <div style={{ fontWeight: 600 }}>📞 {formData.phone || '0100000000'}</div>
                <div>📍 {formData.address || (isRTL ? 'العنوان' : 'Address')}</div>
              </div>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff'
              }}>
                <img
                  src={formData.logo}
                  alt="Logo Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            
            {/* Doctor Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                {t('doctorName')}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={formData.doctorName}
                  onChange={(e) => handleChange('doctorName', e.target.value)}
                  placeholder={isRTL ? "مثال: د. أحمد السقا" : "e.g. Dr. Ahmed El-Sakka"}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.92rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Clinic Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                {t('clinicName')}
              </label>
              <input
                type="text"
                value={formData.clinicName}
                onChange={(e) => handleChange('clinicName', e.target.value)}
                placeholder={isRTL ? "مثال: مركز الشفاء للأشعة والسونار" : "e.g. Al-Shefaa Ultrasound Center"}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Specialty */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                {t('specialty')}
              </label>
              <input
                type="text"
                value={formData.specialty}
                onChange={(e) => handleChange('specialty', e.target.value)}
                placeholder={isRTL ? "استشاري الأشعة التشخيصية والسونار" : "Consultant of Diagnostic Ultrasound"}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Degree */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                {t('degree')}
              </label>
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => handleChange('degree', e.target.value)}
                placeholder={isRTL ? "دكتوراه الأشعة التشخيصية والتداخلية" : "M.D. Diagnostic & Interventional Radiology"}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                {t('phone')}
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="010XXXXXXXX - 012XXXXXXXX"
                dir="ltr"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Address */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                {t('address')}
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder={isRTL ? "المدينة، الشارع، رقم العمارة" : "City, Street, Building"}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Logo Upload Section */}
            <div style={{ gridColumn: 'span 2', background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px dashed var(--border-subtle)' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
                {t('clinicLogo')}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '2px solid #0284c7',
                  flexShrink: 0
                }}>
                  <img src={formData.logo} alt="Current Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor="logo-file-input"
                    className="btn btn-secondary"
                    style={{ cursor: 'pointer', display: 'inline-flex', gap: '8px' }}
                  >
                    <Upload size={18} />
                    <span>{t('uploadLogo')} (PNG / JPG / SVG)</span>
                  </label>
                  <input
                    id="logo-file-input"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleLogoUpload}
                  />
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    {isRTL ? 'يُفضل استخدام صورة شفافة PNG ذات دقة جيدة لتظهر بأعلى وضوح في الطباعة' : 'A transparent PNG with high resolution is recommended for optimal print quality'}
                  </div>
                </div>
              </div>
            </div>

            {/* Print Footer Note */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                {t('footerNote')}
              </label>
              <input
                type="text"
                value={formData.footerNote}
                onChange={(e) => handleChange('footerNote', e.target.value)}
                placeholder={isRTL ? "فحص دلالي بالأشعة التلفزيونية..." : "Diagnostic ultrasound exam..."}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '26px',
            paddingTop: '18px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="btn btn-secondary"
              style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}
            >
              <RotateCcw size={16} />
              <span>{t('restoreDefaults')}</span>
            </button>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                {t('cancel')}
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ minWidth: '160px' }}
              >
                {saveSuccess ? (
                  <>
                    <Check size={18} />
                    <span>{t('savedToast')}</span>
                  </>
                ) : (
                  <span>{t('saveSettings')}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={isResetModalOpen}
        title={t('restoreDefaults')}
        message={isRTL ? "هل تريد استعادة البيانات والشعار الافتراضي للمركز؟ سيتم مسح أي تعديلات غير محفوظة." : "Are you sure you want to restore default clinic info & logo? Any unsaved changes will be cleared."}
        confirmText={t('restoreDefaults')}
        cancelText={t('cancel')}
        type="info"
        onConfirm={executeReset}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}
