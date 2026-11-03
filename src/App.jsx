import React, { useState } from 'react';
import { DoctorProvider } from './context/DoctorContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { HomeView } from './views/HomeView';
import { PrintStudioView } from './views/PrintStudioView';
import { DoctorSettingsModal } from './components/DoctorSettingsModal';
import { SAMPLE_SONAR_SCANS } from './utils/sampleImages';

function AppContent() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'studio'
  const [isDoctorSettingsOpen, setIsDoctorSettingsOpen] = useState(false);

  // Ultrasound images state (preloaded with sample scans so it looks alive immediately)
  const [images, setImages] = useState(SAMPLE_SONAR_SCANS);
  const [selectedImageIds, setSelectedImageIds] = useState([
    'sample_scan_1',
    'sample_scan_2',
    'sample_scan_3',
    'sample_scan_4'
  ]);

  // Patient metadata
  const [patientInfo, setPatientInfo] = useState({
    patientName: 'مريم عادل الشريف',
    age: '29 سنة',
    gender: 'أنثى',
    examDate: new Date().toISOString().slice(0, 10),
    studyType: 'فحص سونار بطن وحوض (Abdomino-Pelvic US)',
    patientId: 'US-2026-104'
  });

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
            setPatientInfo={setPatientInfo}
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
