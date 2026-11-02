import React from 'react';
import { useDoctor } from '../context/DoctorContext';
import { Stethoscope, UserCog, Printer, Image as ImageIcon, Sparkles } from 'lucide-react';

export function Header({ currentView, setCurrentView, selectedImagesCount, onOpenDoctorSettings }) {
  const { doctorInfo } = useDoctor();

  return (
    <header className="no-print" style={{
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #1e293b',
      padding: '12px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px'
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
          boxShadow: '0 0 16px rgba(6, 182, 212, 0.35)'
        }}>
          <Stethoscope size={24} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.3px', margin: 0 }}>
              Sonar Print Studio
            </h1>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '20px',
              border: '1px solid rgba(52, 211, 153, 0.3)'
            }}>
              برنامج ديسكتوب
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            تجهيز وتنظيم وطباعة صور السونار والتقارير الطبية
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: '#090d16',
        padding: '4px',
        borderRadius: '12px',
        border: '1px solid #1e293b'
      }}>
        <button
          onClick={() => setCurrentView('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '9px',
            fontSize: '0.9rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: currentView === 'home' ? '#1e293b' : 'transparent',
            color: currentView === 'home' ? '#38bdf8' : '#94a3b8',
            boxShadow: currentView === 'home' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none'
          }}
        >
          <ImageIcon size={18} />
          <span>اختيار الصور والبحث</span>
        </button>

        <button
          onClick={() => setCurrentView('studio')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '9px',
            fontSize: '0.9rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: currentView === 'studio' ? '#0284c7' : 'transparent',
            color: currentView === 'studio' ? '#ffffff' : '#94a3b8',
            boxShadow: currentView === 'studio' ? '0 2px 10px rgba(2, 132, 199, 0.5)' : 'none'
          }}
        >
          <Printer size={18} />
          <span>استوديو الطباعة</span>
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

      {/* Doctor Info & Settings Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onOpenDoctorSettings}
          title="تغيير اسم الطبيب، التخصص، واللوجو"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#141f36',
            border: '1px solid #1e293b',
            padding: '6px 14px 6px 10px',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'right'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#0284c7';
            e.currentTarget.style.backgroundColor = '#1a2947';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#1e293b';
            e.currentTarget.style.backgroundColor = '#141f36';
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
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
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
                {doctorInfo.doctorName || 'طبيب السونار'}
              </span>
              <UserCog size={14} color="#38bdf8" />
            </div>
            <div style={{
              fontSize: '0.72rem',
              color: '#38bdf8',
              maxWidth: '180px',
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
