import React, { useState, useEffect } from 'react';
import { LicenseProvider } from './context/LicenseContext';
import { DoctorProvider } from './context/DoctorContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './views/HomeView';
import { PrintStudioView } from './views/PrintStudioView';
import { DoctorSettingsModal } from './components/DoctorSettingsModal';
import { ActivationModal } from './components/ActivationModal';
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
  const { lang, isRTL } = useLanguage();
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
    if (window.electronAPI && typeof window.electronAPI.closeFolder === 'function') {
      window.electronAPI.closeFolder();
    }
  };

  // Automatic Folder Watcher Listener (Real-time Auto-Refresh)
  useEffect(() => {
    if (window.electronAPI && typeof window.electronAPI.onFolderUpdated === 'function') {
      const unsubscribe = window.electronAPI.onFolderUpdated((newData) => {
        if (!newData || !newData.patients) return;
        setFolderData(newData);

        // Keep active patient or update their images in real-time
        setActivePatientId((prevActiveId) => {
          const updatedActive =
            newData.patients.find((p) => p.id === prevActiveId || p.folderName === prevActiveId) ||
            newData.patients.find((p) => p.folderName === patientInfo.patientId) ||
            newData.patients[0];

          if (updatedActive) {
            const patientScans = updatedActive.images || [];
            setImages(patientScans);
            setSelectedImageIds(patientScans.map((img) => img.id));
            setPatientInfo((prev) => ({
              ...prev,
              patientName: updatedActive.patientName || updatedActive.folderName,
              patientId: updatedActive.folderName,
              isCustom: true
            }));
            return updatedActive.id;
          }
          return prevActiveId;
        });
      });

      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, [patientInfo.patientId]);

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row', direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Sidebar Navigation & Patient Files */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedImagesCount={selectedImageIds.length}
        folderData={folderData}
        activePatientId={activePatientId}
        onSelectPatient={handleSelectPatient}
        onOpenFolder={handleOpenFolder}
        onReloadFolder={handleReloadFolder}
        onCloseFolder={handleCloseFolder}
        isReloadingFolder={isReloadingFolder}
        onOpenDoctorSettings={() => setIsDoctorSettingsOpen(true)}
      />

      {/* Main Content Workspace */}
      <div style={{ flex: 1, minWidth: 0, height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
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
      </div>

      {/* Doctor & Clinic Branding Settings Modal */}
      <DoctorSettingsModal
        isOpen={isDoctorSettingsOpen}
        onClose={() => setIsDoctorSettingsOpen(false)}
      />

      {/* Software Licensing & Activation Protection Modal */}
      <ActivationModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <DoctorProvider>
          <LicenseProvider>
            <AppContent />
          </LicenseProvider>
        </DoctorProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
