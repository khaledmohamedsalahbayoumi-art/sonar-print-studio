import React, { useState, useMemo } from 'react';
import {
  Stethoscope,
  Image as ImageIcon,
  Printer,
  Folder,
  FolderPlus,
  RotateCw,
  X,
  User,
  Sun,
  Moon,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  UserCog,
  Sparkles,
  ShieldCheck,
  Key,
  Clock,
  ArrowUpDown,
  ArrowDownAZ,
  Palette,
  Minus,
  Plus,
  Zap,
  Sliders,
  Phone,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check
} from 'lucide-react';
import { useDoctor } from '../context/DoctorContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useLicense } from '../context/LicenseContext';
import { usePrinter } from '../context/PrinterContext';
import printifyIcon from '../assets/icon.png';

export function Sidebar({
  currentView,
  setCurrentView,
  selectedImagesCount = 0,
  folderData,
  activePatientId,
  onSelectPatient,
  onOpenFolder,
  onReloadFolder,
  onCloseFolder,
  isReloadingFolder = false,
  onOpenDoctorSettings,
  onInstantPrint,
  onGoBack,
  canGoBack = false
}) {
  const { doctorInfo } = useDoctor();
  const { lang, toggleLang, t, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { isActivated, openActivationModal, machineId, licenseInfo } = useLicense();
  const [copiedMachineId, setCopiedMachineId] = useState(false);

  const handleCopyMachineId = (e) => {
    e?.stopPropagation?.();
    if (!machineId) return;
    navigator.clipboard.writeText(machineId);
    setCopiedMachineId(true);
    setTimeout(() => setCopiedMachineId(false), 2200);
  };

  const subscriptionText = useMemo(() => {
    if (!isActivated) {
      return isRTL ? 'غير مفعل' : 'Unlicensed';
    }
    if (licenseInfo?.isPerpetual) {
      return isRTL ? 'دائم مدى الحياة 🌟' : 'Lifetime 🌟';
    }
    if (typeof licenseInfo?.daysLeft === 'number') {
      if (licenseInfo.daysLeft <= 0) {
        return isRTL ? 'انتهى اليوم ⚠️' : 'Expired today ⚠️';
      }
      return isRTL ? `متبقي ${licenseInfo.daysLeft} يوم` : `${licenseInfo.daysLeft}d left`;
    }
    return isRTL ? 'ترخيص ساري' : 'Active';
  }, [isActivated, licenseInfo, isRTL]);

  const expirySubtext = useMemo(() => {
    if (!isActivated || licenseInfo?.isPerpetual || !licenseInfo?.expiryDate) return null;
    return isRTL ? `حتى تاريخ: ${licenseInfo.expiryDate}` : `Until: ${licenseInfo.expiryDate}`;
  }, [isActivated, licenseInfo, isRTL]);
  const {
    printers,
    selectedPrinter,
    setSelectedPrinter,
    copies,
    setCopies,
    colorMode,
    setColorMode,
    refreshPrinters,
    isDetecting: isDetectingPrinters,
    isPrinting
  } = usePrinter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [patientSortOrder, setPatientSortOrder] = useState('newest'); // 'newest' | 'alpha' | 'oldest'

  const sortedPatients = useMemo(() => {
    if (!folderData?.patients) return [];
    const list = [...folderData.patients];
    if (patientSortOrder === 'newest') {
      return list.sort((a, b) => {
        const diff = (b.timestamp || 0) - (a.timestamp || 0);
        if (Math.abs(diff) > 50) return diff;
        return b.folderName.localeCompare(a.folderName, undefined, { numeric: true });
      });
    } else if (patientSortOrder === 'oldest') {
      return list.sort((a, b) => {
        const diff = (a.timestamp || 0) - (b.timestamp || 0);
        if (Math.abs(diff) > 50) return diff;
        return a.folderName.localeCompare(b.folderName, undefined, { numeric: true });
      });
    } else {
      return list.sort((a, b) => a.folderName.localeCompare(b.folderName, undefined, { numeric: true }));
    }
  }, [folderData?.patients, patientSortOrder]);

  const cycleSortOrder = () => {
    setPatientSortOrder((prev) => {
      if (prev === 'newest') return 'alpha';
      if (prev === 'alpha') return 'oldest';
      return 'newest';
    });
  };

  const CollapseIcon = isRTL
    ? (isCollapsed ? ChevronLeft : ChevronRight)
    : (isCollapsed ? ChevronRight : ChevronLeft);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const sidebarWidth = isCollapsed ? '72px' : '260px';

  return (
    <aside
      className="no-print"
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        height: '100vh',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: isRTL ? 'none' : '1px solid var(--border-subtle)',
        borderLeft: isRTL ? '1px solid var(--border-subtle)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        direction: isRTL ? 'rtl' : 'ltr',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: 'none',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      {/* TOP SECTION: App Branding & Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Branding Header */}
        <div style={{
          padding: isCollapsed ? '16px 12px' : '16px 16px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(2, 132, 199, 0.08)',
              border: '1px solid rgba(2, 132, 199, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(2, 132, 199, 0.2)',
              flexShrink: 0,
              padding: '3px',
              overflow: 'hidden'
            }}>
              <img
                src={printifyIcon}
                alt="Printify"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            {!isCollapsed && (
              <div style={{ overflow: 'hidden' }}>
                <h1 style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  letterSpacing: '-0.3px',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}>
                  {t('appTitle')}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '10px',
                    display: 'inline-block'
                  }}>
                    {t('desktopBadge')}
                  </span>
                </div>
                <a
                  href="https://wa.me/201036623265"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '4px',
                    fontSize: '0.73rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    direction: 'ltr',
                    fontFamily: 'monospace',
                    transition: 'color 0.15s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#38bdf8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  title="الدعم الفني والواتساب: +20 10 36623265"
                >
                  <Phone size={11} style={{ color: '#22c55e', flexShrink: 0 }} />
                  <span>+20 10 36623265</span>
                </a>
              </div>
            )}
          </div>

          {/* Collapse Toggle Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? (isRTL ? "توسيع القائمة" : "Expand Sidebar") : (isRTL ? "طي القائمة" : "Collapse Sidebar")}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              display: isCollapsed ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#38bdf8';
              e.currentTarget.style.borderColor = '#0284c7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <CollapseIcon size={16} />
          </button>
        </div>

        {/* If collapsed, show small un-collapse button */}
        {isCollapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <CollapseIcon size={16} />
            </button>
          </div>
        )}

        {/* Navigation Tabs (Vertical in Sidebar) */}
        <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {canGoBack && (
            <button
              type="button"
              onClick={onGoBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '8px',
                padding: isCollapsed ? '10px 0' : '9px 12px',
                borderRadius: '10px',
                fontSize: '0.84rem',
                fontWeight: 700,
                border: '1px solid rgba(2, 132, 199, 0.45)',
                background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(6, 182, 212, 0.15) 100%)',
                color: '#38bdf8',
                cursor: 'pointer',
                transition: 'all 0.15s',
                marginBottom: '4px',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.2)'
              }}
              title={isRTL ? 'الرجوع للصفحة السابقة' : 'Back to Previous Page'}
            >
              <BackIcon size={17} style={{ flexShrink: 0 }} />
              {!isCollapsed && <span>{isRTL ? '← رجوع للصفحة السابقة' : '← Back'}</span>}
            </button>
          )}

          {!isCollapsed && (
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              padding: '0 6px 4px'
            }}>
              {isRTL ? 'التنقل الرئيسي' : 'Navigation'}
            </div>
          )}

          {/* 1. Image Selection & Search */}
          <button
            type="button"
            onClick={() => setCurrentView('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '10px',
              padding: isCollapsed ? '10px 0' : '10px 14px',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 600,
              border: currentView === 'home' ? '1px solid #0284c7' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: currentView === 'home' ? 'var(--bg-card)' : 'transparent',
              color: currentView === 'home' ? '#38bdf8' : 'var(--text-muted)',
              boxShadow: currentView === 'home' ? '0 2px 10px rgba(0,0,0,0.2)' : 'none',
              width: '100%'
            }}
            title={t('navImages')}
          >
            <ImageIcon size={19} style={{ color: currentView === 'home' ? '#0ea5e9' : 'var(--text-muted)', flexShrink: 0 }} />
            {!isCollapsed && <span>{t('navImages')}</span>}
          </button>

          {/* 2. Print Studio */}
          <button
            type="button"
            onClick={() => setCurrentView('studio')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              gap: '10px',
              padding: isCollapsed ? '10px 0' : '10px 14px',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 600,
              border: currentView === 'studio' ? '1px solid #0284c7' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: currentView === 'studio' ? '#0284c7' : 'transparent',
              color: currentView === 'studio' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: currentView === 'studio' ? '0 4px 14px rgba(2, 132, 199, 0.4)' : 'none',
              width: '100%',
              position: 'relative'
            }}
            title={t('navStudio')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Printer size={19} style={{ color: currentView === 'studio' ? '#ffffff' : 'var(--text-muted)', flexShrink: 0 }} />
              {!isCollapsed && <span>{t('navStudio')}</span>}
            </div>

            {selectedImagesCount > 0 && (
              <span style={{
                background: currentView === 'studio' ? '#ffffff' : '#0284c7',
                color: currentView === 'studio' ? '#0369a1' : '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: '10px',
                position: isCollapsed ? 'absolute' : 'static',
                top: isCollapsed ? '4px' : 'auto',
                right: isCollapsed ? '8px' : 'auto'
              }}>
                {selectedImagesCount}
              </span>
            )}
          </button>

          {/* 3. Printers & Settings Page Navigation Button - DIRECTLY UNDER PRINT STUDIO */}
          <button
            type="button"
            onClick={() => setCurrentView('printers')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              gap: '10px',
              padding: isCollapsed ? '10px 0' : '10px 14px',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 600,
              border: currentView === 'printers' ? '1px solid #0284c7' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: currentView === 'printers' ? 'rgba(2, 132, 199, 0.25)' : 'transparent',
              color: currentView === 'printers' ? '#38bdf8' : 'var(--text-muted)',
              boxShadow: currentView === 'printers' ? '0 2px 10px rgba(2, 132, 199, 0.3)' : 'none',
              width: '100%',
              position: 'relative'
            }}
            title={isRTL ? 'اختيار وإعدادات الطابعة' : 'Printers & Settings'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, overflow: 'hidden' }}>
              <Sliders size={18} style={{ color: currentView === 'printers' ? '#38bdf8' : 'var(--text-muted)', flexShrink: 0 }} />
              {!isCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden', textAlign: isRTL ? 'right' : 'left' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {isRTL ? 'إعدادات الطابعة' : 'Printer Settings'}
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    color: currentView === 'printers' ? '#7dd3fc' : 'var(--text-dim)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '135px'
                  }}>
                    {selectedPrinter || (isRTL ? 'طابعة النظام الافتراضية' : 'System Default')}
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && printers.length > 0 && (
              <span style={{
                background: currentView === 'printers' ? '#0284c7' : 'rgba(100, 116, 139, 0.25)',
                color: currentView === 'printers' ? '#ffffff' : 'var(--text-dim)',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '8px',
                flexShrink: 0
              }}>
                {printers.length}
              </span>
            )}
          </button>

          {/* Quick Instant Print Action Button */}
          {!isCollapsed ? (
            <button
              type="button"
              onClick={onInstantPrint}
              disabled={isPrinting || selectedImagesCount === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: selectedImagesCount > 0 ? '1px solid rgba(14, 165, 233, 0.4)' : '1px solid var(--border-subtle)',
                background: selectedImagesCount > 0 ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.22) 0%, rgba(14, 165, 233, 0.12) 100%)' : 'rgba(255, 255, 255, 0.02)',
                color: selectedImagesCount > 0 ? '#38bdf8' : 'var(--text-dim)',
                cursor: selectedImagesCount > 0 && !isPrinting ? 'pointer' : 'not-allowed',
                width: '100%',
                transition: 'all 0.15s',
                marginTop: '2px',
                boxShadow: selectedImagesCount > 0 ? '0 2px 8px rgba(2, 132, 199, 0.25)' : 'none'
              }}
              title={isRTL ? `طباعة فورية على: ${selectedPrinter || 'الطابعة الافتراضية'}` : `Instant Print on ${selectedPrinter || 'Default'}`}
            >
              {isPrinting ? (
                <>
                  <RotateCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>{isRTL ? 'جاري إرسال الطباعة...' : 'Printing...'}</span>
                </>
              ) : (
                <>
                  <Zap size={13} color="#f59e0b" />
                  <span>{isRTL ? 'طباعة فورية ⚡' : 'Instant Print ⚡'}</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onInstantPrint}
              disabled={isPrinting || selectedImagesCount === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 0',
                borderRadius: '8px',
                border: '1px solid #0284c7',
                background: 'rgba(2, 132, 199, 0.2)',
                color: '#38bdf8',
                cursor: selectedImagesCount > 0 && !isPrinting ? 'pointer' : 'not-allowed',
                width: '100%',
                marginTop: '4px'
              }}
              title={isRTL ? `طباعة فورية على: ${selectedPrinter || 'الطابعة الافتراضية'}` : `Print to: ${selectedPrinter}`}
            >
              <Zap size={15} color="#f59e0b" />
            </button>
          )}
        </div>

        {/* PATIENT FILES SECTION */}
        <div style={{
          padding: '10px 10px 14px',
          borderTop: '1px solid var(--border-subtle)',
          flex: 1,
          overflowY: 'auto'
        }}>
          {!isCollapsed && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
              padding: '0 4px'
            }}>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <User size={13} style={{ color: '#06b6d4' }} />
                <span>{isRTL ? 'ملفات المرضى' : 'Patient Files'}</span>
              </span>

              {folderData && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      color: '#10b981',
                      background: 'rgba(16, 185, 129, 0.12)',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      border: '1px solid rgba(16, 185, 129, 0.25)'
                    }}
                    title={isRTL ? "مزامنة وريفريش تلقائي لأي مجلد أو صورة جديدة" : "Live Auto-Sync Active"}
                  >
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                    <span>{isRTL ? 'تلقائي' : 'Live'}</span>
                  </span>

                  <button
                    type="button"
                    onClick={onReloadFolder}
                    disabled={isReloadingFolder}
                    title={t('refreshFolder')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: isReloadingFolder ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <RotateCw size={13} style={{ animation: isReloadingFolder ? 'spin 1s linear infinite' : 'none' }} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Active Folder Title Pill */}
          {folderData && !isCollapsed && (
            <div style={{
              padding: '6px 10px',
              marginBottom: '8px',
              background: 'var(--bg-primary)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.76rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                <Folder size={14} style={{ color: '#06b6d4', flexShrink: 0 }} />
                <span style={{
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {folderData.folderName}
                </span>
              </div>
              <button
                type="button"
                onClick={onCloseFolder}
                title={t('closeFolder')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: 0
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Patient Sort Order Indicator & Quick Switch */}
          {folderData && !isCollapsed && sortedPatients.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '2px 4px 6px',
              fontSize: '0.72rem'
            }}>
              <button
                type="button"
                onClick={cycleSortOrder}
                title={isRTL ? 'الترتيب التلقائي: المضاف حديثاً (اضغط للتبديل)' : 'Default: Recently Added (click to cycle)'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(14, 165, 233, 0.12)',
                  border: '1px solid rgba(14, 165, 233, 0.3)',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  color: '#38bdf8',
                  cursor: 'pointer',
                  fontSize: '0.71rem',
                  fontWeight: 700,
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(14, 165, 233, 0.22)';
                  e.currentTarget.style.borderColor = '#38bdf8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(14, 165, 233, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.3)';
                }}
              >
                {patientSortOrder === 'newest' && <Clock size={12} />}
                {patientSortOrder === 'alpha' && <ArrowDownAZ size={12} />}
                {patientSortOrder === 'oldest' && <ArrowUpDown size={12} />}
                <span>
                  {patientSortOrder === 'newest' ? t('sortNewest') : patientSortOrder === 'alpha' ? t('sortAlpha') : t('sortOldest')}
                </span>
              </button>

              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                {sortedPatients.length} {isRTL ? 'ملف' : 'files'}
              </span>
            </div>
          )}

          {/* Vertical Patient Files List */}
          {folderData && sortedPatients.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '280px', overflowY: 'auto' }}>
              {sortedPatients.map((patient) => {
                const isActive = patient.id === activePatientId;
                const scanCount = patient.images?.length || 0;

                return (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => onSelectPatient(patient)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isCollapsed ? 'center' : 'space-between',
                      gap: '8px',
                      padding: isCollapsed ? '8px 0' : '7px 10px',
                      borderRadius: '8px',
                      border: isActive ? '1px solid #0284c7' : '1px solid transparent',
                      background: isActive ? 'var(--bg-accent-soft)' : 'var(--bg-card)',
                      color: isActive ? '#38bdf8' : 'var(--text-main)',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: isRTL ? 'right' : 'left',
                      transition: 'all 0.15s',
                      width: '100%',
                      boxShadow: isActive ? '0 0 10px rgba(14, 165, 233, 0.2)' : 'none'
                    }}
                    title={`${patient.patientName} (${scanCount} ${isRTL ? 'صور' : 'scans'})`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <User size={14} style={{ color: isActive ? '#0284c7' : 'var(--text-dim)', flexShrink: 0 }} />
                      {!isCollapsed && (
                        <span style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {patient.patientName}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && (
                      <span style={{
                        fontSize: '0.68rem',
                        padding: '1px 5px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        background: scanCount > 0 ? (isActive ? '#0284c7' : 'rgba(14, 165, 233, 0.15)') : 'rgba(100, 116, 139, 0.15)',
                        color: scanCount > 0 ? (isActive ? '#ffffff' : '#38bdf8') : 'var(--text-dim)',
                        flexShrink: 0
                      }}>
                        {scanCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Button to Import Folder if none is loaded */
            <button
              type="button"
              onClick={onOpenFolder}
              style={{
                width: '100%',
                padding: isCollapsed ? '10px 0' : '10px 12px',
                borderRadius: '8px',
                border: '1px dashed var(--border-subtle)',
                background: 'var(--bg-card)',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '8px',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0284c7';
                e.currentTarget.style.color = '#38bdf8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
              title={t('importFolderBtn')}
            >
              <FolderPlus size={16} style={{ color: '#06b6d4', flexShrink: 0 }} />
              {!isCollapsed && <span>{isRTL ? 'استدعاء مجلد مرضى' : 'Import Patients Folder'}</span>}
            </button>
          )}

          {/* Quick folder action if folder loaded */}
          {folderData && !isCollapsed && (
            <button
              type="button"
              onClick={onOpenFolder}
              style={{
                width: '100%',
                marginTop: '8px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                background: 'transparent',
                color: 'var(--text-dim)',
                fontSize: '0.74rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#38bdf8';
                e.currentTarget.style.borderColor = '#0284c7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-dim)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <FolderPlus size={13} />
              <span>{isRTL ? 'استدعاء فولدر آخر' : 'Open Another Folder'}</span>
            </button>
          )}
        </div>
      </div>

      {/* BOTTOM SECTION: Doctor Settings, Theme & Language */}
      <div style={{
        padding: '12px 10px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* Doctor & Clinic Profile Button */}
        <button
          type="button"
          onClick={onOpenDoctorSettings}
          style={{
            width: '100%',
            padding: isCollapsed ? '8px 0' : '8px 10px',
            borderRadius: '8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-main)',
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '8px',
            transition: 'all 0.15s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#0284c7';
            e.currentTarget.style.color = '#38bdf8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.color = 'var(--text-main)';
          }}
          title={t('doctorProfile')}
        >
          <UserCog size={16} style={{ color: '#0ea5e9', flexShrink: 0 }} />
          {!isCollapsed && (
            <div style={{ textAlign: isRTL ? 'right' : 'left', overflow: 'hidden' }}>
              <div style={{
                fontWeight: 700,
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden'
              }}>
                {doctorInfo.doctorName || t('doctorProfile')}
              </div>
            </div>
          )}
        </button>

        {/* Theme & Language Switchers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isCollapsed ? '1fr' : '1fr 1fr',
          gap: '6px'
        }}>
          {/* Language Switch */}
          <button
            type="button"
            onClick={toggleLang}
            style={{
              padding: '6px 8px',
              borderRadius: '6px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px'
            }}
            title={isRTL ? "Switch to English" : "التبديل إلى العربية"}
          >
            <Globe size={13} style={{ color: '#06b6d4' }} />
            {!isCollapsed && <span>{t('langToggle')}</span>}
          </button>

          {/* Theme Switch */}
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              padding: '6px 8px',
              borderRadius: '6px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px'
            }}
            title={theme === 'dark' ? t('themeLight') : t('themeDark')}
          >
            {theme === 'dark' ? (
              <Sun size={13} style={{ color: '#f59e0b' }} />
            ) : (
              <Moon size={13} style={{ color: '#0ea5e9' }} />
            )}
            {!isCollapsed && <span>{theme === 'dark' ? t('themeLight') : t('themeDark')}</span>}
          </button>
        </div>

        {/* Machine ID ("IP النسخة") & Subscription Remaining Duration (ف الأسفل خالص) */}
        {!isCollapsed ? (
          <div
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              background: isActivated
                ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.03) 100%)'
                : 'linear-gradient(180deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.03) 100%)',
              border: isActivated ? '1px solid rgba(16, 185, 129, 0.28)' : '1px solid rgba(239, 68, 68, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              marginTop: '2px'
            }}
          >
            {/* Status & Subscription Period */}
            <div
              onClick={openActivationModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                gap: '4px'
              }}
              title={isRTL ? 'الترخيص - اضغط لعرض التفاصيل وتغيير الكود' : 'License - Click to view details'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {isActivated ? (
                  <ShieldCheck size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                ) : (
                  <Key size={14} style={{ color: '#f87171', flexShrink: 0 }} />
                )}
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: isActivated ? '#10b981' : '#f87171',
                  whiteSpace: 'nowrap'
                }}>
                  {isActivated ? (isRTL ? 'نسخة أصلية' : 'Genuine License') : (isRTL ? 'نسخة غير مفعلة' : 'Unlicensed')}
                </span>
              </div>

              <span style={{
                fontSize: '0.67rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '5px',
                background: isActivated ? 'rgba(16, 185, 129, 0.16)' : 'rgba(239, 68, 68, 0.16)',
                color: isActivated ? '#34d399' : '#fca5a5',
                whiteSpace: 'nowrap'
              }}>
                {subscriptionText}
              </span>
            </div>

            {/* Machine ID ("IP النسخة" / كود الجهاز) with copy button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(0, 0, 0, 0.24)',
                padding: '4px 7px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                gap: '6px'
              }}
            >
              <div
                onClick={handleCopyMachineId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  flex: 1
                }}
                title={isRTL ? 'اضغط لنسخ كود الجهاز' : 'Click to copy Machine ID'}
              >
                <span style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-dim)',
                  whiteSpace: 'nowrap',
                  fontWeight: 600
                }}>
                  {isRTL ? 'كود الجهاز:' : 'ID:'}
                </span>
                <code style={{
                  fontFamily: 'Consolas, monospace',
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  letterSpacing: '0.3px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  direction: 'ltr'
                }}>
                  {machineId || 'PRINT-DEMO-2026'}
                </code>
              </div>

              <button
                type="button"
                onClick={handleCopyMachineId}
                style={{
                  background: copiedMachineId ? '#10b981' : 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid ' + (copiedMachineId ? '#10b981' : 'rgba(255, 255, 255, 0.08)'),
                  borderRadius: '4px',
                  color: copiedMachineId ? '#ffffff' : 'var(--text-muted)',
                  padding: '2px 6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '0.64rem',
                  fontWeight: 600,
                  flexShrink: 0,
                  transition: 'all 0.15s'
                }}
                title={isRTL ? 'نسخ كود الجهاز' : 'Copy ID'}
              >
                {copiedMachineId ? <Check size={11} /> : <Copy size={11} />}
                <span>{copiedMachineId ? (isRTL ? 'تم النسخ' : 'Copied') : (isRTL ? 'نسخ' : 'Copy')}</span>
              </button>
            </div>

            {/* Expiry date subtext if limited */}
            {expirySubtext && (
              <div style={{
                fontSize: '0.62rem',
                color: 'var(--text-dim)',
                textAlign: 'center',
                marginTop: '-2px'
              }}>
                {expirySubtext}
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={openActivationModal}
            style={{
              width: '100%',
              padding: '7px 0',
              borderRadius: '8px',
              background: isActivated ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: isActivated ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.35)',
              color: isActivated ? '#10b981' : '#f87171',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px'
            }}
            title={`${isRTL ? 'كود الجهاز:' : 'Machine ID:'} ${machineId} | ${subscriptionText}`}
          >
            {isActivated ? <ShieldCheck size={16} /> : <Key size={16} />}
            <span style={{ fontSize: '0.62rem', fontWeight: 700 }}>
              {isActivated
                ? (licenseInfo?.isPerpetual ? '∞' : `${licenseInfo?.daysLeft ?? ''}d`)
                : '!'}
            </span>
          </button>
        )}
      </div>
    </aside>
  );
}

