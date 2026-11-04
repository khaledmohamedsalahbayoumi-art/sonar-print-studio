import React, { createContext, useContext, useState, useEffect } from 'react';

const LicenseContext = createContext(null);

export function LicenseProvider({ children }) {
  const [isActivated, setIsActivated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [machineId, setMachineId] = useState('');
  const [licenseInfo, setLicenseInfo] = useState(null);
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);

  // Check license status on startup
  const checkStatus = async () => {
    setIsLoading(true);
    try {
      if (window.electronAPI && typeof window.electronAPI.getLicenseStatus === 'function') {
        const status = await window.electronAPI.getLicenseStatus();
        if (status) {
          setMachineId(status.machineId || '');
          setIsActivated(status.isActivated === true);
          setLicenseInfo(status);
          // If not activated, automatically open activation modal
          if (!status.isActivated) {
            setIsActivationModalOpen(true);
          }
        }
      } else {
        // Browser fallback (for preview/development in Vite)
        const storedMachine = localStorage.getItem('sonar_browser_machine_id') || 'SONAR-DEMO-2026-TEST';
        localStorage.setItem('sonar_browser_machine_id', storedMachine);
        setMachineId(storedMachine);

        const isBrowserActive = localStorage.getItem('sonar_browser_is_activated') === 'true';
        setIsActivated(isBrowserActive);
        setLicenseInfo({
          isActivated: isBrowserActive,
          machineId: storedMachine,
          licenseType: 'PERPETUAL',
          isPerpetual: true,
          clientName: 'نسخة تجريبية للمتصفح'
        });
        if (!isBrowserActive) {
          setIsActivationModalOpen(true);
        }
      }
    } catch (err) {
      console.error('Error checking license status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  // Activate license with key
  const activate = async (activationKey, clientName = '') => {
    if (!activationKey) return { success: false, error: 'يرجى إدخال كود التفعيل' };

    try {
      if (window.electronAPI && typeof window.electronAPI.activateLicense === 'function') {
        const result = await window.electronAPI.activateLicense({
          activationKey: activationKey.trim(),
          clientName: clientName.trim()
        });

        if (result && result.success) {
          setIsActivated(true);
          setLicenseInfo(result.license);
          setIsActivationModalOpen(false);
          return { success: true };
        } else {
          return { success: false, error: result?.error || 'كود التفعيل غير صحيح' };
        }
      } else {
        // Browser fallback: accept any 16-char code or sample
        if (activationKey.replace(/[^A-Za-z0-9]/g, '').length === 16) {
          localStorage.setItem('sonar_browser_is_activated', 'true');
          setIsActivated(true);
          setIsActivationModalOpen(false);
          return { success: true };
        }
        return { success: false, error: 'كود التفعيل في المتصفح يجب أن يكون 16 حرفاً' };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Deactivate (Reset)
  const deactivate = async () => {
    if (window.electronAPI && typeof window.electronAPI.deactivateLicense === 'function') {
      await window.electronAPI.deactivateLicense();
    } else {
      localStorage.removeItem('sonar_browser_is_activated');
    }
    setIsActivated(false);
    setLicenseInfo(null);
    setIsActivationModalOpen(true);
  };

  return (
    <LicenseContext.Provider
      value={{
        isActivated,
        isLoading,
        machineId,
        licenseInfo,
        isActivationModalOpen,
        openActivationModal: () => setIsActivationModalOpen(true),
        closeActivationModal: () => {
          // Can only manually close if already activated
          if (isActivated) {
            setIsActivationModalOpen(false);
          }
        },
        activate,
        deactivate,
        refreshLicense: checkStatus
      }}
    >
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
}

