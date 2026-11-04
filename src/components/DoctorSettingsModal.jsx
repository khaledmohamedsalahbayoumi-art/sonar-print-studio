import React, { useState, useEffect } from 'react';
import { useDoctor } from '../context/DoctorContext';
import { useLanguage } from '../context/LanguageContext';
import { X, Upload, Check, RotateCcw, Building2, Phone, MapPin, User, Award, ShieldAlert, Palette, Type, Sliders } from 'lucide-react';
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
          border: '1px solid #cbd5e1',
          fontFamily: `'${formData.headerFontFamily || 'Cairo'}', system-ui, sans-serif`
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
            <span style={{ color: formData.headerColor || '#0284c7', fontWeight: 800 }}>{isRTL ? 'ترويسة رسمية' : 'Official Header'}</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `2.5px solid ${formData.headerColor || '#0284c7'}`,
            paddingBottom: '12px',
            gap: '16px'
          }}>
            {/* Right: Clinic & Doctor info */}
            <div>
              <h3 style={{
                fontSize: `${1.2 * ((formData.headerScale || 100) / 100)}rem`,
                fontWeight: formData.headerFontWeight || '900',
                color: formData.headerColor || '#0369a1',
                margin: 0,
                transition: 'all 0.15s'
              }}>
                {formData.clinicName || (isRTL ? 'اسم المركز أو العيادة' : 'Clinic / Center Name')}
              </h3>
              <div style={{
                fontSize: `${1.05 * ((formData.headerScale || 100) / 100)}rem`,
                fontWeight: formData.headerFontWeight || '800',
                color: formData.doctorNameColor || '#0f172a',
                marginTop: '2px',
                transition: 'all 0.15s'
              }}>
                {formData.doctorName || (isRTL ? 'اسم الطبيب' : 'Doctor Name')}
              </div>
              <div style={{
                fontSize: `${0.8 * ((formData.headerScale || 100) / 100)}rem`,
                color: '#334155',
                fontWeight: 600
              }}>
                {formData.specialty || (isRTL ? 'التخصص' : 'Specialty')}
              </div>
              <div style={{
                fontSize: `${0.74 * ((formData.headerScale || 100) / 100)}rem`,
                color: '#64748b'
              }}>
                {formData.degree}
              </div>
            </div>

            {/* Left: Logo + Contacts */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left', direction: 'ltr' }}>
              <div style={{ fontSize: `${0.74 * ((formData.headerScale || 100) / 100)}rem`, color: '#475569', lineHeight: 1.4 }}>
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

            {/* Typography & Appearance Control Card */}
            <div style={{
              gridColumn: 'span 2',
              background: 'var(--bg-card)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid var(--border-subtle)',
              marginTop: '4px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.95rem',
                fontWeight: 800,
                color: '#38bdf8',
                marginBottom: '16px',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '10px'
              }}>
                <Palette size={18} color="#0ea5e9" />
                <span>{t('headerTypographyTitle')}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* 1. Header Primary Color */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                    {t('headerColor')}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                      type="color"
                      value={formData.headerColor || '#0284c7'}
                      onChange={(e) => handleChange('headerColor', e.target.value)}
                      style={{
                        width: '38px',
                        height: '38px',
                        padding: 0,
                        borderRadius: '8px',
                        border: '2px solid var(--border-subtle)',
                        cursor: 'pointer',
                        backgroundColor: 'transparent'
                      }}
                      title={isRTL ? "اختر لوناً مخصصاً" : "Pick custom color"}
                    />

                    {['#0284c7', '#1e3a8a', '#0d9488', '#059669', '#7c3aed', '#be123c', '#334155'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleChange('headerColor', color)}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: color,
                          border: (formData.headerColor || '#0284c7') === color ? '3px solid #ffffff' : '2px solid transparent',
                          boxShadow: (formData.headerColor || '#0284c7') === color ? '0 0 8px rgba(255,255,255,0.6)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* 2. Doctor Name Color */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                    {t('doctorNameColor')}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                      type="color"
                      value={formData.doctorNameColor || '#0f172a'}
                      onChange={(e) => handleChange('doctorNameColor', e.target.value)}
                      style={{
                        width: '38px',
                        height: '38px',
                        padding: 0,
                        borderRadius: '8px',
                        border: '2px solid var(--border-subtle)',
                        cursor: 'pointer',
                        backgroundColor: 'transparent'
                      }}
                    />

                    {['#0f172a', '#0284c7', '#1e3a8a', '#334155', '#475569'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleChange('doctorNameColor', color)}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: color,
                          border: (formData.doctorNameColor || '#0f172a') === color ? '3px solid #ffffff' : '2px solid transparent',
                          boxShadow: (formData.doctorNameColor || '#0f172a') === color ? '0 0 8px rgba(255,255,255,0.6)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* 3. Font Family */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                    {t('fontFamily')}
                  </label>
                  <select
                    value={formData.headerFontFamily || 'Cairo'}
                    onChange={(e) => handleChange('headerFontFamily', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-main)',
                      fontSize: '0.92rem',
                      outline: 'none',
                      fontFamily: `'${formData.headerFontFamily || 'Cairo'}', sans-serif`
                    }}
                  >
                    <option value="Cairo" style={{ fontFamily: 'Cairo' }}>القاهرة (Cairo) - خط قياسي طبي أنيق</option>
                    <option value="Tajawal" style={{ fontFamily: 'Tajawal' }}>تجوال (Tajawal) - خط هندسي عصري</option>
                    <option value="Almarai" style={{ fontFamily: 'Almarai' }}>المراعي (Almarai) - عريض وواضح جداً</option>
                    <option value="Alexandria" style={{ fontFamily: 'Alexandria' }}>الإسكندرية (Alexandria) - متناسق حديث</option>
                    <option value="Amiri" style={{ fontFamily: 'Amiri' }}>أميري (Amiri) - كلاسيكي فخم</option>
                    <option value="Outfit" style={{ fontFamily: 'Outfit' }}>Outfit - Modern Display Font</option>
                  </select>
                </div>

                {/* 4. Font Weight */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                    {t('fontWeight')}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {[
                      { id: '600', label: isRTL ? 'متوسط' : 'Medium' },
                      { id: '700', label: isRTL ? 'عريض' : 'Bold' },
                      { id: '800', label: isRTL ? 'عريض+' : 'ExBold' },
                      { id: '900', label: isRTL ? 'ثقيل' : 'Black' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleChange('headerFontWeight', item.id)}
                        style={{
                          padding: '8px 4px',
                          borderRadius: '8px',
                          border: (formData.headerFontWeight || '800') === item.id ? '2px solid #0284c7' : '1px solid var(--border-subtle)',
                          background: (formData.headerFontWeight || '800') === item.id ? 'rgba(2, 132, 199, 0.2)' : 'var(--bg-primary)',
                          color: (formData.headerFontWeight || '800') === item.id ? '#38bdf8' : 'var(--text-muted)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Header Size Scale Slider */}
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                      {t('textSize')}
                    </label>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>
                      {formData.headerScale || 100}%
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>80%</span>
                    <input
                      type="range"
                      min="80"
                      max="140"
                      step="5"
                      value={formData.headerScale || 100}
                      onChange={(e) => handleChange('headerScale', Number(e.target.value))}
                      style={{ flex: '1 1 180px', accentColor: '#0284c7', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>140%</span>

                    {/* Quick presets */}
                    {[85, 100, 115, 130].map((presetVal) => (
                      <button
                        key={presetVal}
                        type="button"
                        onClick={() => handleChange('headerScale', presetVal)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: (formData.headerScale || 100) === presetVal ? '1px solid #0284c7' : '1px solid var(--border-subtle)',
                          background: (formData.headerScale || 100) === presetVal ? 'rgba(2, 132, 199, 0.2)' : 'var(--bg-primary)',
                          color: (formData.headerScale || 100) === presetVal ? '#38bdf8' : 'var(--text-muted)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {presetVal}%
                      </button>
                    ))}
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
