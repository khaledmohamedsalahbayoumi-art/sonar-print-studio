import React, { useState, useEffect } from 'react';
import { DoctorProvider } from './context/DoctorContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { HomeView } from './views/HomeView';
import { PrintStudioView } from './views/PrintStudioView';
import { DoctorSettingsModal } from './components/DoctorSettingsModal';
import { getSampleSonarScans } from './utils/sampleImages';

const PATIENT_PRESETS = {
  ar: {
    patientName: 'مريم عادل الشريف',
    age: '29 سنة',
    gender: 'أنثى',
    examDate: new Date().toISOString().slice(0, 10),
    studyType: 'فحص سونار بطن وحوض (Abdomino-Pelvic US)',
    patientId: 'US-2026-104',
    isCustom: false
  },
  en: {
    patientName: 'Mariam Adel El-Sherif',
    age: '29 Years',
    gender: 'Female',
    examDate: new Date().toISOString().slice(0, 10),
    studyType: 'Abdomino-Pelvic Ultrasound (US)',
    patientId: 'US-2026-104',
    isCustom: false
  }
};

function AppContent() {
  const { lang } = useLanguage();
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'studio'
  const [isDoctorSettingsOpen, setIsDoctorSettingsOpen] = useState(false);

  // Ultrasound images state (preloaded with sample scans for current language)
  const [images, setImages] = useState(() => getSampleSonarScans(lang));
  const [selectedImageIds, setSelectedImageIds] = useState([
    'sample_scan_1',
    'sample_scan_2',
    'sample_scan_3',
    'sample_scan_4'
  ]);

  // Patient metadata
  const [patientInfo, setPatientInfo] = useState(() => PATIENT_PRESETS[lang] || PATIENT_PRESETS.ar);

  // When language switches, dynamically translate sample scans & default patient info
  useEffect(() => {
    // 1. Update patient preset if user hasn't typed custom data, or if it matches the preset
    setPatientInfo((prev) => {
      const isDefaultArabic = prev.patientName === PATIENT_PRESETS.ar.patientName || !prev.patientName;
      const isDefaultEnglish = prev.patientName === PATIENT_PRESETS.en.patientName;
      if (!prev.isCustom || isDefaultArabic || isDefaultEnglish) {
        return {
          ...PATIENT_PRESETS[lang] || PATIENT_PRESETS.ar,
          examDate: prev.examDate || new Date().toISOString().slice(0, 10),
          isCustom: false
        };
      }
      return prev;
    });

    // 2. Update sample scans to matching language if still using mock scans
    setImages((prev) => {
      const isAllSamples = prev.every((img) => img.id.startsWith('sample_scan_'));
      if (isAllSamples) {
        return getSampleSonarScans(lang);
      }
      return prev;
    });
  }, [lang]);

  const handlePatientInfoChange = (updates) => {
    setPatientInfo((prev) => ({
      ...prev,
      ...updates,
      isCustom: true
    }));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Application Bar */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedImagesCount={selectedImageIds.length}
        onOpenDoctorSettings={() => setIsDoctorSettingsOpen(true)}
      />

      {/* Main Views */}
      <main style={{ flex: 1 }}>
        {currentView === 'home' ? (
          <HomeView
            images={images}
            setImages={setImages}
            selectedImageIds={selectedImageIds}
            setSelectedImageIds={setSelectedImageIds}
            patientInfo={patientInfo}
            setPatientInfo={handlePatientInfoChange}
            onProceedToPrint={() => setCurrentView('studio')}
          />
        ) : (
          <PrintStudioView
            images={images}
            selectedImageIds={selectedImageIds}
            patientInfo={patientInfo}
            onBackToHome={() => setCurrentView('home')}
          />
        )}
      </main>

      {/* Doctor & Clinic Branding Settings Modal */}
      <DoctorSettingsModal
        isOpen={isDoctorSettingsOpen}
        onClose={() => setIsDoctorSettingsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <DoctorProvider>
          <AppContent />
        </DoctorProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
