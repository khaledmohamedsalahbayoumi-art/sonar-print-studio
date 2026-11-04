import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

// Default modern medical ultrasound emblem as SVG Data URL
const DEFAULT_LOGO = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="medGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0f766e" />
    </linearGradient>
    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#34d399" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#medGrad)" />
  <circle cx="100" cy="100" r="75" fill="none" stroke="#ffffff" stroke-width="3" stroke-opacity="0.3" stroke-dasharray="6 6"/>
  <!-- Ultrasound Probe Body -->
  <path d="M70 45 L130 45 L125 105 C125 125 115 135 100 135 C85 135 75 125 75 105 Z" fill="#ffffff" />
  <rect x="80" y="55" width="40" height="35" rx="6" fill="#0284c7" opacity="0.9"/>
  <!-- Ultrasound Sound Waves -->
  <path d="M60 148 C75 162 125 162 140 148" fill="none" stroke="url(#waveGrad)" stroke-width="6" stroke-linecap="round"/>
  <path d="M45 165 C70 185 130 185 155 165" fill="none" stroke="url(#waveGrad)" stroke-width="6" stroke-linecap="round" opacity="0.8"/>
  <path d="M30 180 C65 208 135 208 170 180" fill="none" stroke="url(#waveGrad)" stroke-width="6" stroke-linecap="round" opacity="0.5"/>
</svg>
`);

export const DOCTOR_PRESETS = {
  ar: {
    doctorName: 'د. أحمد السقا',
    specialty: 'استشاري الأشعة التشخيصية والتصوير الطبي التلفزيوني (السونار)',
    degree: 'دكتوراه الأشعة التشخيصية والتداخلية - كلية الطب',
    clinicName: 'مركز الشفاء للأشعة والسونار التشخيصي',
    phone: '01012345678 - 01287654321',
    address: 'القاهرة - مدينة نصر - شارع عباس العقاد - برج الأطباء',
    logo: DEFAULT_LOGO,
    showHeaderOnPrint: true,
    showFooterOnPrint: true,
    footerNote: 'فحص دلالي بالأشعة التلفزيونية (Ultrasound) - يُرجى المتابعة السريرية مع الطبيب المعالج.',
    reportTitle: 'تقرير أشعة تلفزيونية سونار (Ultrasound Report)',
    headerColor: '#0284c7',
    doctorNameColor: '#0f172a',
    headerFontFamily: 'Cairo',
    headerScale: 100,
    headerFontWeight: '800'
  },
  en: {
    doctorName: 'Dr. Ahmed El-Sakka',
    specialty: 'Consultant of Diagnostic Ultrasound & Medical Imaging',
    degree: 'M.D. Diagnostic & Interventional Radiology - Faculty of Medicine',
    clinicName: 'Al-Shefaa Ultrasound & Diagnostic Imaging Center',
    phone: '+20 1012345678 / +20 1287654321',
    address: 'Abbas El-Akkad St., Nasr City, Cairo - Doctors Tower',
    logo: DEFAULT_LOGO,
    showHeaderOnPrint: true,
    showFooterOnPrint: true,
    footerNote: 'Diagnostic Ultrasound Examination - Clinical correlation is recommended.',
    reportTitle: 'Diagnostic Ultrasound Examination Report',
    headerColor: '#0284c7',
    doctorNameColor: '#0f172a',
    headerFontFamily: 'Cairo',
    headerScale: 100,
    headerFontWeight: '800'
  }
};

const DoctorContext = createContext();

const STORAGE_KEY = 'sonar_print_doctor_profile_v2';

export function DoctorProvider({ children }) {
  const { lang } = useLanguage();

  const [doctorInfo, setDoctorInfo] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isCustom) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read doctor profile from localStorage:', e);
    }
    return { ...DOCTOR_PRESETS[lang] || DOCTOR_PRESETS.ar, isCustom: false };
  });

  // Automatically update preset if user hasn't explicitly customized their own doctor info
  useEffect(() => {
    setDoctorInfo((prev) => {
      const isDefaultArabic = prev.doctorName === DOCTOR_PRESETS.ar.doctorName || !prev.doctorName;
      const isDefaultEnglish = prev.doctorName === DOCTOR_PRESETS.en.doctorName;
      if (!prev.isCustom || isDefaultArabic || isDefaultEnglish) {
        return {
          ...prev,
          ...DOCTOR_PRESETS[lang] || DOCTOR_PRESETS.ar,
          isCustom: false
        };
      }
      return prev;
    });
  }, [lang]);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doctorInfo));
    } catch (e) {
      console.error('Failed to save doctor profile to localStorage:', e);
    }
  }, [doctorInfo]);

  const updateDoctorInfo = (updates) => {
    setDoctorInfo((prev) => ({
      ...prev,
      ...updates,
      isCustom: true
    }));
  };

  const resetDoctorInfo = () => {
    const freshPreset = DOCTOR_PRESETS[lang] || DOCTOR_PRESETS.ar;
    setDoctorInfo({ ...freshPreset, isCustom: false });
  };

  return (
    <DoctorContext.Provider value={{ doctorInfo, updateDoctorInfo, resetDoctorInfo, defaultLogo: DEFAULT_LOGO, presets: DOCTOR_PRESETS }}>
      {children}
    </DoctorContext.Provider>
  );
}

export function useDoctor() {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error('useDoctor must be used within DoctorProvider');
  }
  return context;
}
