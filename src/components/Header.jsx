import React from 'react';
import { useDoctor } from '../context/DoctorContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Stethoscope, UserCog, Printer, Image as ImageIcon, Sun, Moon, Globe } from 'lucide-react';

export function Header({ currentView, setCurrentView, selectedImagesCount, onOpenDoctorSettings }) {
  const { doctorInfo } = useDoctor();
  const { lang, toggleLang, t, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="no-print" style={{
      backgroundColor: 'var(--bg-secondary)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '12px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      direction: isRTL ? 'rtl' : 'ltr',
      boxShadow: 'var(--shadow-card)'
    }}>
      {/* Brand & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(6, 182, 212, 0.35)',
          flexShrink: 0
        }}>
          <Stethoscope size={24} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px', margin: 0 }}>
              {t('appTitle')}
            </h1>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '20px',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              {t('desktopBadge')}
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
            {t('appSubtitle')}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-primary)',
        padding: '4px',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)'
      }}>
        <button
          onClick={() => setCurrentView('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '9px',
            fontSize: '0.88rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: currentView === 'home' ? 'var(--bg-card)' : 'transparent',
            color: currentView === 'home' ? '#0284c7' : 'var(--text-muted)',
            boxShadow: currentView === 'home' ? 'var(--shadow-card)' : 'none'
          }}
        >
          <ImageIcon size={18} />
          <span>{t('navImages')}</span>
        </button>

        <button
          onClick={() => setCurrentView('studio')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '9px',
            fontSize: '0.88rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: currentView === 'studio' ? '#0284c7' : 'transparent',
            color: currentView === 'studio' ? '#ffffff' : 'var(--text-muted)',
            boxShadow: currentView === 'studio' ? '0 2px 10px rgba(2, 132, 199, 0.5)' : 'none'
          }}
        >
          <Printer size={18} />
          <span>{t('navStudio')}</span>
          {selectedImagesCount > 0 && (
            <span style={{
              background: currentView === 'studio' ? '#ffffff' : '#0284c7',
              color: currentView === 'studio' ? '#0369a1' : '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '10px'
            }}>
              {selectedImagesCount}
            </span>
          )}
        </button>
      </div>

      {/* Utilities: Language, Theme, Doctor Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Language Switcher */}
        <button
          onClick={toggleLang}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            padding: '7px 12px',
            borderRadius: '10px',
            cursor: 'pointer',
            color: 'var(--text-main)',
            fontSize: '0.8rem',
            fontWeight: 700,
            transition: 'all 0.15s'
          }}
          title={lang === 'ar' ? 'Switch to English' : 'التحويل للغة العربية'}
        >
          <Globe size={15} color="#0284c7" />
          <span>{t('langToggle')}</span>
        </button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            padding: '7px 12px',
            borderRadius: '10px',
            cursor: 'pointer',
            color: 'var(--text-main)',
            fontSize: '0.8rem',
            fontWeight: 700,
            transition: 'all 0.15s'
          }}
          title={theme === 'dark' ? (isRTL ? 'التحويل للوضع الفاتح (Light Mode)' : 'Switch to Light Mode') : (isRTL ? 'التحويل للوضع الداكن (Dark Mode)' : 'Switch to Dark Mode')}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={15} color="#f59e0b" />
              <span>{t('themeLight')}</span>
            </>
          ) : (
            <>
              <Moon size={15} color="#38bdf8" />
              <span>{t('themeDark')}</span>
            </>
          )}
        </button>

        {/* Doctor Info & Settings Badge */}
        <button
          onClick={onOpenDoctorSettings}
          title={t('doctorProfile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            padding: '5px 12px 5px 8px',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: isRTL ? 'right' : 'left'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#0284c7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            flexShrink: 0
          }}>
            <img
              src={doctorInfo.logo}
              alt="Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {doctorInfo.doctorName || (isRTL ? 'طبيب السونار' : 'Ultrasound Specialist')}
              </span>
              <UserCog size={13} color="#0284c7" />
            </div>
            <div style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              maxWidth: '140px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {doctorInfo.specialty}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
