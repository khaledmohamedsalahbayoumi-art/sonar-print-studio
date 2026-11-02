import React, { useState } from 'react';
import { useDoctor } from '../context/DoctorContext';
import { X, Upload, Check, RotateCcw, Building2, Phone, MapPin, User, Award, ShieldAlert } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export function DoctorSettingsModal({ isOpen, onClose }) {
  const { doctorInfo, updateDoctorInfo, resetDoctorInfo, defaultLogo } = useDoctor();

  const [formData, setFormData] = useState({ ...doctorInfo });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

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
    setFormData({
      ...doctorInfo,
      doctorName: 'د. أحمد السقا',
      specialty: 'استشاري الأشعة التشخيصية والتصوير الطبي التلفزيوني (السونار)',
      degree: 'دكتوراه الأشعة التشخيصية والتداخلية - كلية الطب',
      clinicName: 'مركز الشفاء للأشعة والسونار التشخيصي',
      phone: '01012345678 - 01287654321',
      address: 'القاهرة - مصر',
      logo: defaultLogo
    });
    setIsResetModalOpen(false);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 8, 16, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '780px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(14, 165, 233, 0.2)',
        padding: '28px'
      }} onClick={(e) => e.stopPropagation()} className="fade-in">
        
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1e293b',
          paddingBottom: '16px',
          marginBottom: '22px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              تخصيص بيانات الطبيب واللوجو
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0 0' }}>
              يتم حفظ هذه البيانات تلقائياً وتظهر في ترويسة ورقة الطباعة في أي وقت دون الحاجة لتعديل الكود
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#1e293b',
              border: 'none',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
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
            <span>معاينة حية لشكل الترويسة على ورقة الطباعة:</span>
            <span style={{ color: '#0284c7' }}>ترويسة رسمية</span>
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
                {formData.clinicName || 'اسم المركز أو العيادة'}
              </h3>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {formData.doctorName || 'اسم الطبيب'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>
                {formData.specialty || 'التخصص'}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                {formData.degree}
              </div>
            </div>

            {/* Left: Logo + Contacts */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left', direction: 'ltr' }}>
              <div style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.4 }}>
                <div style={{ fontWeight: 600 }}>📞 {formData.phone || '0100000000'}</div>
                <div>📍 {formData.address || 'العنوان'}</div>
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
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                اسم الطبيب / الدكتورة
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={formData.doctorName}
                  onChange={(e) => handleChange('doctorName', e.target.value)}
                  placeholder="مثال: د. أحمد السقا"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #334155',
                    background: '#141f36',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Clinic Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                اسم العيادة أو المركز
              </label>
              <input
                type="text"
                value={formData.clinicName}
                onChange={(e) => handleChange('clinicName', e.target.value)}
                placeholder="مثال: مركز الشفاء للأشعة والسونار"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  background: '#141f36',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Specialty */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                التخصص الطبي الدقيق
              </label>
              <input
                type="text"
                value={formData.specialty}
                onChange={(e) => handleChange('specialty', e.target.value)}
                placeholder="استشاري الأشعة التشخيصية والسونار"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  background: '#141f36',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Degree */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                الدرجة العلمية والشهادات
              </label>
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => handleChange('degree', e.target.value)}
                placeholder="دكتوراه الأشعة التشخيصية والتداخلية"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  background: '#141f36',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                أرقام الهاتف للتواصل
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
                  border: '1px solid #334155',
                  background: '#141f36',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Address */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                عنوان العيادة / المركز
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="المدينة، الشارع، رقم العمارة"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  background: '#141f36',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Logo Upload Section */}
            <div style={{ gridColumn: 'span 2', background: '#141f36', padding: '16px', borderRadius: '14px', border: '1px dashed #334155' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
                شعار العيادة / المركز (Logo)
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
                    <span>رفع لوجو جديد من الجهاز (PNG / JPG / SVG)</span>
                  </label>
                  <input
                    id="logo-file-input"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleLogoUpload}
                  />
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '6px' }}>
                    يُفضل استخدام صورة شفافة PNG ذات دقة جيدة لتظهر بأعلى وضوح في الطباعة
                  </div>
                </div>
              </div>
            </div>

            {/* Print Footer Note */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                ملاحظة أسفل صفحة التقرير (Footer Note)
              </label>
              <input
                type="text"
                value={formData.footerNote}
                onChange={(e) => handleChange('footerNote', e.target.value)}
                placeholder="فحص دلالي بالأشعة التلفزيونية..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  background: '#141f36',
                  color: '#ffffff',
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
            borderTop: '1px solid #1e293b'
          }}>
            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="btn btn-secondary"
              style={{ color: '#94a3b8', fontSize: '0.85rem' }}
            >
              <RotateCcw size={16} />
              <span>استعادة الافتراضي</span>
            </button>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                إلغاء
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ minWidth: '160px' }}
              >
                {saveSuccess ? (
                  <>
                    <Check size={18} />
                    <span>تم الحفظ بنجاح!</span>
                  </>
                ) : (
                  <span>حفظ التعديلات</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={isResetModalOpen}
        title="استعادة البيانات الافتراضية"
        message="هل تريد استعادة البيانات والشعار الافتراضي للمركز؟ سيتم مسح أي تعديلات غير محفوظة."
        confirmText="استعادة الافتراضي"
        cancelText="إلغاء"
        type="info"
        onConfirm={executeReset}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}
