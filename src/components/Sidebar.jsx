import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { useDoctor } from '../context/DoctorContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

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
  onOpenDoctorSettings
}) {
  const { doctorInfo } = useDoctor();
  const { lang, toggleLang, t, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const CollapseIcon = isRTL
    ? (isCollapsed ? ChevronLeft : ChevronRight)
    : (isCollapsed ? ChevronRight : ChevronLeft);

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
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(6, 182, 212, 0.35)',
              flexShrink: 0
            }}>
              <Stethoscope size={22} color="#ffffff" />
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
                <span style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  display: 'inline-block',
                  marginTop: '2px'
                }}>
                  {t('desktopBadge')}
                </span>
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

          {/* Vertical Patient Files List */}
          {folderData && folderData.patients?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '280px', overflowY: 'auto' }}>
              {folderData.patients.map((patient) => {
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
      </div>
    </aside>
  );
}

