import React, { useState, useEffect } from 'react';
import { DoctorProvider } from './context/DoctorContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { PatientFolderBar } from './components/PatientFolderBar';
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

  // Folder & Patients import state
  const [folderData, setFolderData] = useState(null);
  const [activePatientId, setActivePatientId] = useState(null);
  const [isReloadingFolder, setIsReloadingFolder] = useState(false);

  // Handle selecting a patient from the patient bar or header
  const handleSelectPatient = (patient) => {
    if (!patient) return;
    setActivePatientId(patient.id);
    const patientScans = patient.images || [];
    setImages(patientScans);
    setSelectedImageIds(patientScans.map((img) => img.id));
    setPatientInfo((prev) => ({
      ...prev,
      patientName: patient.patientName || patient.folderName,
      patientId: patient.folderName,
      isCustom: true
    }));
  };

  // Handle when a folder is loaded
  const handleFolderLoaded = (data) => {
    if (!data || !data.patients) return;
    setFolderData(data);
    // Find first patient with images, or the first patient in folder
    const targetPatient = data.patients.find((p) => p.images && p.images.length > 0) || data.patients[0];
    if (targetPatient) {
      handleSelectPatient(targetPatient);
    }
  };

  // Open native folder dialog
  const handleOpenFolder = async () => {
    if (window.electronAPI && typeof window.electronAPI.openFolderDialog === 'function') {
      try {
        const result = await window.electronAPI.openFolderDialog();
        if (result && result.success && result.patients && result.patients.length > 0) {
          handleFolderLoaded(result);
          return;
        }
      } catch (err) {
        console.error('Failed to open folder:', err);
      }
    }
  };

  // Reload current folder (e.g. check for new images from ultrasound machine)
  const handleReloadFolder = async () => {
    if (!folderData || !folderData.folderPath) return;
    setIsReloadingFolder(true);
    try {
      if (window.electronAPI && typeof window.electronAPI.reloadFolder === 'function') {
        const result = await window.electronAPI.reloadFolder(folderData.folderPath);
        if (result && result.success && result.patients) {
          setFolderData(result);
          // Re-select active patient or first patient
          const current = result.patients.find((p) => p.id === activePatientId || p.folderName === patientInfo.patientId) || result.patients[0];
          if (current) {
            handleSelectPatient(current);
          }
        }
      }
    } catch (err) {
      console.error('Error reloading folder:', err);
    } finally {
      setIsReloadingFolder(false);
    }
  };

  // Close folder
  const handleCloseFolder = () => {
    setFolderData(null);
    setActivePatientId(null);
  };

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
        folderData={folderData}
        activePatientId={activePatientId}
        onSelectPatient={handleSelectPatient}
        onOpenFolder={handleOpenFolder}
      />

      {/* Patient Folders & Files Bar (Visible across the app when a folder is loaded) */}
      <PatientFolderBar
        folderData={folderData}
        activePatientId={activePatientId}
        onSelectPatient={handleSelectPatient}
        onReloadFolder={handleReloadFolder}
        onCloseFolder={handleCloseFolder}
        onOpenNewFolder={handleOpenFolder}
        onProceedToPrint={() => setCurrentView('studio')}
        currentView={currentView}
        isReloading={isReloadingFolder}
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
            onOpenFolder={handleOpenFolder}
            onFolderLoaded={handleFolderLoaded}
            folderData={folderData}
            activePatientId={activePatientId}
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
