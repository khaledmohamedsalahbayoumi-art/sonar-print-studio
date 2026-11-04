import React from 'react';
import {
  Folder,
  User,
  RotateCw,
  X,
  Printer,
  FolderPlus,
  CheckCircle2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function PatientFolderBar({
  folderData,
  activePatientId,
  onSelectPatient,
  onReloadFolder,
  onCloseFolder,
  onOpenNewFolder,
  onProceedToPrint,
  currentView,
  isReloading
}) {
  const { t, isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  if (!folderData || !folderData.patients || folderData.patients.length === 0) {
    return null;
  }

  const activePatient = folderData.patients.find((p) => p.id === activePatientId) || folderData.patients[0];

  return (
    <div
      className="no-print"
      style={{
        background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        direction: isRTL ? 'rtl' : 'ltr',
        boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
        position: 'sticky',
        top: '68px',
        zIndex: 35
      }}
    >
      {/* 1. Folder Label & Meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#06b6d4'
          }}
        >
          <Folder size={17} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {t('patientFolderLabel')}
            </span>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {folderData.folderName}
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: '#38bdf8',
                padding: '1px 7px',
                borderRadius: '10px',
                fontWeight: 600
              }}
            >
              {t('patientFilesCount').replace('{count}', folderData.patients.length)}
            </span>
          </div>
        </div>

        {/* Reload Folder Button */}
        <button
          type="button"
          onClick={onReloadFolder}
          disabled={isReloading}
          title={t('refreshFolder')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            cursor: isReloading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
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
          <RotateCw
            size={14}
            style={{
              animation: isReloading ? 'spin 1s linear infinite' : 'none'
            }}
          />
        </button>
      </div>

      {/* 2. Patient Files Tabs Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          flex: 1,
          padding: '2px 4px',
          scrollbarWidth: 'thin'
        }}
      >
        <span
          style={{
            fontSize: '0.74rem',
            color: 'var(--text-dim)',
            whiteSpace: 'nowrap',
            fontWeight: 600
          }}
        >
          {isRTL ? 'ملفات المرضى:' : 'Patient Files:'}
        </span>

        {folderData.patients.map((patient) => {
          const isActive = patient.id === activePatientId;
          const scanCount = patient.images ? patient.images.length : 0;

          return (
            <button
              key={patient.id}
              type="button"
              onClick={() => onSelectPatient(patient)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: isActive
                  ? '1px solid #0284c7'
                  : '1px solid var(--border-subtle)',
                background: isActive ? 'var(--bg-accent-soft)' : 'var(--bg-card)',
                color: isActive ? '#38bdf8' : 'var(--text-muted)',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                boxShadow: isActive ? '0 0 10px rgba(14, 165, 233, 0.2)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--border-accent)';
                  e.currentTarget.style.color = 'var(--text-main)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              <User size={14} style={{ color: isActive ? '#0284c7' : 'var(--text-dim)' }} />
              <span>{patient.patientName}</span>

              {/* Scans Count Pill */}
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  background: scanCount > 0
                    ? (isActive ? '#0284c7' : 'rgba(14, 165, 233, 0.15)')
                    : 'rgba(100, 116, 139, 0.15)',
                  color: scanCount > 0
                    ? (isActive ? '#ffffff' : '#38bdf8')
                    : 'var(--text-dim)'
                }}
              >
                {t('patientScansCount').replace('{count}', scanCount)}
              </span>

              {isActive && (
                <CheckCircle2 size={13} style={{ color: '#10b981', flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Quick shortcut to Print Studio if currently in Home */}
        {currentView === 'home' && activePatient && activePatient.images?.length > 0 && (
          <button
            type="button"
            onClick={onProceedToPrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(6, 182, 212, 0.3)',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <Printer size={14} />
            <span>{t('printThisPatient')}</span>
            <ArrowIcon size={14} />
          </button>
        )}

        {/* Change / Open New Folder */}
        <button
          type="button"
          onClick={onOpenNewFolder}
          title={t('openNewFolder')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 10px',
            borderRadius: '8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
            cursor: 'pointer',
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
          <FolderPlus size={14} />
          <span>{isRTL ? 'فولدر آخر' : 'New Folder'}</span>
        </button>

        {/* Close Folder Button */}
        <button
          type="button"
          onClick={onCloseFolder}
          title={t('closeFolder')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ef4444';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-dim)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
