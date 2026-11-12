import React from 'react';
import {
  Printer,
  RotateCw,
  CheckCircle2,
  Sliders,
  Palette,
  Minus,
  Plus,
  Zap,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  Check,
  Sparkles,
  FileText
} from 'lucide-react';
import { usePrinter } from '../context/PrinterContext';
import { useLanguage } from '../context/LanguageContext';

export function PrintersView({
  onNavigate,
  selectedImagesCount = 0,
  patientInfo,
  onInstantPrint
}) {
  const { t, isRTL } = useLanguage();
  const {
    printers,
    selectedPrinter,
    setSelectedPrinter,
    copies,
    setCopies,
    colorMode,
    setColorMode,
    paperSize,
    setPaperSize,
    orientation,
    setOrientation,
    margins,
    setMargins,
    refreshPrinters,
    isDetecting,
    isPrinting
  } = usePrinter();

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div style={{
      minHeight: '100%',
      backgroundColor: 'var(--bg-primary)',
      padding: '24px 32px',
      direction: isRTL ? 'rtl' : 'ltr',
      color: 'var(--text-main)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* 1. Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {/* Title & Description */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)',
            flexShrink: 0
          }}>
            <Printer size={26} color="#ffffff" />
          </div>

          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              {isRTL ? 'اختيار الطابعة وإعدادات الطباعة' : 'Printer Selection & Settings'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              {isRTL
                ? 'إدارة الطابعات المتصلة بجهاز السونار، وتعيين الطابعة الافتراضية، وضبط عدد النسخ والألوان'
                : 'Manage connected ultrasound printers, set default device, copies and color mode'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={refreshPrinters}
            disabled={isDetecting}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '0.85rem' }}
          >
            <RotateCw size={16} style={{ animation: isDetecting ? 'spin 1s linear infinite' : 'none' }} />
            <span>{isRTL ? 'إعادة فحص الطابعات' : 'Refresh Printers'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('studio')}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '0.85rem' }}
          >
            <Printer size={16} />
            <span>{isRTL ? 'استوديو الطباعة' : 'Print Studio'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '0.85rem' }}
          >
            <ImageIcon size={16} />
            <span>{isRTL ? 'استعراض الصور' : 'Browse Images'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* LEFT COLUMN (Primary in RTL): Printers List & Paper Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            boxShadow: 'var(--shadow-card)'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Printer size={18} style={{ color: '#0ea5e9' }} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {isRTL ? `الطابعات المتاحة على الجهاز (${printers.length})` : `Available Printers (${printers.length})`}
              </h2>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {isRTL ? 'انقر على الطابعة لتفعيلها للطباعة الفورية' : 'Click any printer to make it active'}
            </span>
          </div>

          {/* Printers Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {printers.map((printer) => {
              const isSelected = selectedPrinter === printer.name;
              return (
                <div
                  key={printer.name}
                  onClick={() => setSelectedPrinter(printer.name)}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #0284c7' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'rgba(2, 132, 199, 0.15)' : 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? '0 0 16px rgba(14, 165, 233, 0.25)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  {/* Left: Radio + Icon + Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden' }}>
                    {/* Radio indicator */}
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: isSelected ? '5px solid #0284c7' : '2px solid var(--text-dim)',
                      background: '#ffffff',
                      flexShrink: 0,
                      transition: 'all 0.15s'
                    }} />

                    {/* Printer icon badge */}
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: isSelected ? 'rgba(2, 132, 199, 0.25)' : 'rgba(100, 116, 139, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isSelected ? '#38bdf8' : 'var(--text-muted)',
                      flexShrink: 0
                    }}>
                      <Printer size={20} />
                    </div>

                    {/* Name */}
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{
                        fontSize: '0.98rem',
                        fontWeight: 700,
                        color: isSelected ? '#38bdf8' : 'var(--text-main)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {printer.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {isRTL ? 'طابعة نظام مثبتة وجاهزة للعمل' : 'System printer ready for jobs'}
                      </div>
                    </div>
                  </div>

                  {/* Right: Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {printer.isDefault && (
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        color: '#10b981',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        {isRTL ? 'الافتراضية ⭐' : 'Default ⭐'}
                      </span>
                    )}

                    {isSelected ? (
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        background: '#0284c7',
                        color: '#ffffff',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Check size={12} />
                        <span>{isRTL ? 'المحددة للطباعة' : 'Active'}</span>
                      </span>
                    ) : (
                      <span style={{
                        fontSize: '0.72rem',
                        background: 'rgba(100, 116, 139, 0.15)',
                        color: 'var(--text-dim)',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        {isRTL ? 'جاهزة' : 'Ready'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Option for Native Windows Print Dialog */}
            <div
              onClick={() => setSelectedPrinter('')}
              style={{
                padding: '14px 20px',
                borderRadius: '12px',
                border: !selectedPrinter ? '2px solid #0284c7' : '1px dashed var(--border-subtle)',
                background: !selectedPrinter ? 'rgba(2, 132, 199, 0.15)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: !selectedPrinter ? '5px solid #0284c7' : '2px solid var(--text-dim)',
                  background: '#ffffff',
                  flexShrink: 0
                }} />
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: !selectedPrinter ? '#38bdf8' : 'var(--text-main)' }}>
                    {isRTL ? 'الطباعة عبر نافذة النظام للطباعة (System Print Dialog)' : 'System Native Print Dialog'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                    {isRTL ? 'فتح نافذة النظام الكلاسيكية لاختيار الطابعة يدوياً عند كل طباعة' : 'Opens classic system dialog upon print'}
                  </div>
                </div>
              </div>

              {!selectedPrinter && (
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  background: '#0284c7',
                  color: '#ffffff',
                  padding: '3px 10px',
                  borderRadius: '6px'
                }}>
                  {isRTL ? 'محدد' : 'Active'}
                </span>
              )}
            </div>
          </div>
        </div>

          {/* Box 2 in Primary Column: Paper Format & Orientation (Moved from Print Studio) */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={18} color="#0ea5e9" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  {t('paperSettings')}
                </h3>
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#38bdf8',
                background: 'rgba(14, 165, 233, 0.15)',
                padding: '3px 9px',
                borderRadius: '6px'
              }}>
                {paperSize} • {orientation === 'landscape' ? (isRTL ? 'عرضي' : 'Landscape') : (isRTL ? 'طولي' : 'Portrait')}
              </span>
            </div>

            {/* Paper Size */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setPaperSize('A4')}
                style={{
                  padding: '11px',
                  borderRadius: '10px',
                  border: paperSize === 'A4' ? '2px solid #0284c7' : '1px solid var(--border-subtle)',
                  background: paperSize === 'A4' ? '#0284c7' : 'var(--bg-card)',
                  color: paperSize === 'A4' ? '#ffffff' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: paperSize === 'A4' ? '0 4px 12px rgba(2, 132, 199, 0.35)' : 'none'
                }}
              >
                {t('paperA4')}
              </button>

              <button
                type="button"
                onClick={() => setPaperSize('A5')}
                style={{
                  padding: '11px',
                  borderRadius: '10px',
                  border: paperSize === 'A5' ? '2px solid #0284c7' : '1px solid var(--border-subtle)',
                  background: paperSize === 'A5' ? '#0284c7' : 'var(--bg-card)',
                  color: paperSize === 'A5' ? '#ffffff' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: paperSize === 'A5' ? '0 4px 12px rgba(2, 132, 199, 0.35)' : 'none'
                }}
              >
                {t('paperA5')}
              </button>
            </div>

            {/* Orientation */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                style={{
                  padding: '11px',
                  borderRadius: '10px',
                  border: orientation === 'portrait' ? '2px solid #0ea5e9' : '1px solid var(--border-subtle)',
                  background: orientation === 'portrait' ? 'rgba(14, 165, 233, 0.25)' : 'var(--bg-card)',
                  color: orientation === 'portrait' ? '#38bdf8' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {t('orientationPortrait')}
              </button>

              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                style={{
                  padding: '11px',
                  borderRadius: '10px',
                  border: orientation === 'landscape' ? '2px solid #0ea5e9' : '1px solid var(--border-subtle)',
                  background: orientation === 'landscape' ? 'rgba(14, 165, 233, 0.25)' : 'var(--bg-card)',
                  color: orientation === 'landscape' ? '#38bdf8' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {t('orientationLandscape')}
              </button>
            </div>

            {/* Margins */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-card)',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {t('pageMargins')}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { id: 'tight', label: t('marginTight') },
                  { id: 'normal', label: t('marginNormal') },
                  { id: 'wide', label: t('marginWide') }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMargins(m.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '7px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      background: margins === m.id ? '#0284c7' : 'var(--bg-secondary)',
                      color: margins === m.id ? '#ffffff' : 'var(--text-main)',
                      transition: 'all 0.15s'
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Settings & Action Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Box 1: Print Parameters (Copies & Colors) */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} style={{ color: '#0ea5e9' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {isRTL ? 'خيارات وإعدادات الطباعة' : 'Print Options'}
              </h3>
            </div>

            {/* Copies */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {isRTL ? 'عدد النسخ المطبوعة:' : 'Number of Copies:'}
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '4px'
              }}>
                <button
                  type="button"
                  onClick={() => setCopies((c) => Math.max(1, c - 1))}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Minus size={16} />
                </button>

                <div style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: '#38bdf8'
                }}>
                  {copies} {isRTL ? 'نسخة' : 'copies'}
                </div>

                <button
                  type="button"
                  onClick={() => setCopies((c) => Math.min(20, c + 1))}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Color Mode */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {isRTL ? 'وضع الألوان:' : 'Color Output Mode:'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setColorMode('color')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: colorMode === 'color' ? '2px solid #0284c7' : '1px solid var(--border-subtle)',
                    background: colorMode === 'color' ? 'rgba(2, 132, 199, 0.2)' : 'var(--bg-card)',
                    color: colorMode === 'color' ? '#38bdf8' : 'var(--text-main)',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s'
                  }}
                >
                  <Palette size={16} />
                  <span>{isRTL ? 'ألوان كاملة' : 'Full Color'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setColorMode('monochrome')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: colorMode === 'monochrome' ? '2px solid #0284c7' : '1px solid var(--border-subtle)',
                    background: colorMode === 'monochrome' ? 'rgba(2, 132, 199, 0.2)' : 'var(--bg-card)',
                    color: colorMode === 'monochrome' ? '#38bdf8' : 'var(--text-main)',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s'
                  }}
                >
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#94a3b8' }} />
                  <span>{isRTL ? 'أبيض وأسود طبي' : 'Monochrome'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Box 2: Instant Print Action Card */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(2, 132, 199, 0.15) 0%, rgba(15, 23, 42, 0.85) 100%)',
            border: '1px solid rgba(14, 165, 233, 0.4)',
            borderRadius: '16px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 8px 24px rgba(2, 132, 199, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="#f59e0b" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#38bdf8' }}>
                {isRTL ? 'الطباعة الفورية المباشرة' : 'Instant Print'}
              </h3>
            </div>

            {/* Study meta summary */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '10px',
              padding: '10px 14px',
              border: '1px solid rgba(2, 132, 199, 0.2)',
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>{isRTL ? 'المريض الحالي: ' : 'Active Patient: '}</span>
                <strong style={{ color: '#ffffff' }}>{patientInfo?.patientName || (isRTL ? 'مريض تجريبي' : 'Patient')}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>{isRTL ? 'الصور المحددة للطباعة: ' : 'Selected Scans: '}</span>
                <strong style={{ color: '#38bdf8' }}>{selectedImagesCount} {isRTL ? 'صور جاهزة' : 'scans'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>{isRTL ? 'الطابعة المحددة: ' : 'Target Printer: '}</span>
                <strong style={{ color: '#10b981' }}>{selectedPrinter || (isRTL ? 'طابعة النظام الافتراضية' : 'System Default')}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>{isRTL ? 'مقاس واتجاه الورقة: ' : 'Paper & Layout: '}</span>
                <strong style={{ color: '#38bdf8' }}>
                  {paperSize} • {orientation === 'landscape' ? (isRTL ? 'عرضي (Landscape)' : 'Landscape') : (isRTL ? 'طولي (Portrait)' : 'Portrait')}
                </strong>
              </div>
            </div>

            {/* Direct Print Button */}
            <button
              type="button"
              onClick={onInstantPrint}
              disabled={isPrinting || selectedImagesCount === 0}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 18px rgba(2, 132, 199, 0.45)'
              }}
            >
              {isPrinting ? (
                <>
                  <RotateCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>{isRTL ? 'جاري إرسال أمر الطباعة...' : 'Sending Print Job...'}</span>
                </>
              ) : (
                <>
                  <Zap size={18} color="#fef08a" />
                  <span>{isRTL ? 'طباعة الفحص الآن على هذه الطابعة' : 'Print Study Now on this Printer'}</span>
                  <Printer size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

