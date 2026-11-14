import React, { useState, useEffect } from 'react';
import { PrintSheet } from '../components/PrintSheet';
import { useDoctor } from '../context/DoctorContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { usePrinter } from '../context/PrinterContext';
import {
  Printer,
  FileDown,
  LayoutGrid,
  Maximize2,
  Sliders,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Eye,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  RotateCw,
  Palette,
  Contrast,
  SunMedium,
  Layers,
  Settings2
} from 'lucide-react';
import { Toast } from '../components/Toast';

export function PrintStudioView({
  images,
  selectedImageIds,
  patientInfo,
  onBackToHome,
  onGoBack,
  onOpenPrinters
}) {
  const { doctorInfo, updateDoctorInfo } = useDoctor();
  const { t, isRTL } = useLanguage();
  const { theme } = useTheme();
  const {
    selectedPrinter,
    copies,
    colorMode,
    paperSize,
    orientation,
    margins
  } = usePrinter();

  // Selected images to display
  const selectedImages = images.filter((img) => selectedImageIds.includes(img.id));

  // Layout Configuration
  const [gridPreset, setGridPreset] = useState(() => {
    const count = selectedImages.length;
    if (count <= 1) return '1';
    if (count === 2) return '2-h';
    if (count <= 4) return '4';
    if (count <= 6) return '6';
    if (count <= 8) return '8';
    return '4';
  });

  // Slot mappings: array of image objects
  const [slotImages, setSlotImages] = useState([]);
  const [slotLabels, setSlotLabels] = useState({});
  const [activeSlotIndex, setActiveSlotIndex] = useState(0); // Default to slot 1 active so resize handles & tools are immediately visible!
  // Slot custom transformations: { [slotIndex]: { scale: 1, x: 0, y: 0 } }
  const [slotTransforms, setSlotTransforms] = useState({});
  const [globalScale, setGlobalScale] = useState(100);

  // Printer Selection Modal & Active Device
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [selectedPrinterName, setSelectedPrinterName] = useState('');

  // Ultrasound Image Adjustments
  const [imageFit, setImageFit] = useState('contain'); // contain or cover
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(110); // Slight clinical contrast boost by default
  const [isInverted, setIsInverted] = useState(false);
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [borderStyle, setBorderStyle] = useState('thin');

  // Preview Zoom
  const [previewZoom, setPreviewZoom] = useState(0.85);
  const [isPrinting, setIsPrinting] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Initialize or re-populate slots when gridPreset or selectedImages change
  useEffect(() => {
    let requiredCount = 4;
    switch (gridPreset) {
      case '1': requiredCount = 1; break;
      case '2-h':
      case '2-v': requiredCount = 2; break;
      case '4': requiredCount = 4; break;
      case '6': requiredCount = 6; break;
      case '8': requiredCount = 8; break;
      case '9': requiredCount = 9; break;
      default: requiredCount = 4;
    }

    const newSlots = Array.from({ length: requiredCount }).map((_, idx) => {
      return selectedImages[idx] || null;
    });
    setSlotImages(newSlots);
  }, [gridPreset, selectedImages.length]);

  // Update transform for a specific slot
  const updateSlotTransform = (slotIndex, newTransform) => {
    setSlotTransforms((prev) => ({
      ...prev,
      [slotIndex]: {
        scale: newTransform.scale !== undefined ? newTransform.scale : (prev[slotIndex]?.scale ?? 1),
        x: newTransform.x !== undefined ? newTransform.x : (prev[slotIndex]?.x ?? 0),
        y: newTransform.y !== undefined ? newTransform.y : (prev[slotIndex]?.y ?? 0)
      }
    }));
  };

  // Apply transform of one slot to all slots
  const handleApplyTransformToAll = (sourceIndex) => {
    const source = slotTransforms[sourceIndex] || { scale: 1, x: 0, y: 0 };
    const newTransforms = {};
    slotImages.forEach((_, idx) => {
      newTransforms[idx] = { ...source };
    });
    setSlotTransforms(newTransforms);
    setToastMsg(isRTL ? `تم تطبيق مقاس الصورة (${Math.round((source.scale || 1) * 100)}%) على جميع خانات الصفحة` : `Applied zoom (${Math.round((source.scale || 1) * 100)}%) to all page slots`);
  };

  // Adjust general scale across all slots
  const handleGlobalScaleChange = (val) => {
    setGlobalScale(val);
    const newScale = Number((val / 100).toFixed(2));
    const newTransforms = {};
    slotImages.forEach((_, idx) => {
      const prev = slotTransforms[idx] || { x: 0, y: 0 };
      newTransforms[idx] = { ...prev, scale: newScale };
    });
    setSlotTransforms(newTransforms);
  };

  // Handle direct printing with chosen printer and options
  const handleExecutePrint = async (options = {}) => {
    setActiveSlotIndex(null); // Clear active slot before print so selection border doesn't print
    setIsPrinting(true);

    const targetPrinter = options.deviceName !== undefined ? options.deviceName : (selectedPrinter || undefined);
    const numCopies = Number(options.copies || copies) || 1;
    const isColor = options.color !== undefined ? options.color : (colorMode === 'color');

    if (window.electronAPI && typeof window.electronAPI.directPrint === 'function') {
      try {
        await window.electronAPI.directPrint({
          pageSize: paperSize,
          landscape: orientation === 'landscape',
          color: isColor,
          deviceName: targetPrinter,
          copies: numCopies,
          silent: options.silent
        });
        setIsPrinting(false);
        if (targetPrinter) {
          setToastMsg(isRTL ? `تم إرسال أمر الطباعة بنجاح إلى: ${targetPrinter}` : `Print job sent successfully to: ${targetPrinter}`);
        } else {
          setToastMsg(isRTL ? 'تم إرسال أمر الطباعة بنجاح' : 'Print job sent successfully');
        }
        return;
      } catch (err) {
        console.warn('Native direct print error:', err);
      }
    }

    // Standard browser print fallback
    window.print();
    setIsPrinting(false);
  };

  // Handle Save PDF
  const handleSavePdf = async () => {
    setActiveSlotIndex(null); // Clear active slot before print
    if (window.electronAPI && typeof window.electronAPI.savePdf === 'function') {
      try {
        const res = await window.electronAPI.savePdf({
          landscape: orientation === 'landscape',
          pageSize: paperSize
        });
        if (res.success) {
          setToastMsg(isRTL ? `تم حفظ ملف الـ PDF بنجاح في: ${res.filePath}` : `PDF saved successfully to: ${res.filePath}`);
          return;
        }
      } catch (err) {
        console.warn('Save PDF error:', err);
      }
    }
    // Fallback: trigger print dialog where user can choose "Save as PDF"
    window.print();
  };

  // Assign an image to the active slot
  const handleAssignImageToSlot = (image) => {
    if (activeSlotIndex === null) return;
    setSlotImages((prev) => {
      const copy = [...prev];
      copy[activeSlotIndex] = image;
      return copy;
    });
    // set default label if available
    if (image.tag) {
      setSlotLabels((prev) => ({ ...prev, [activeSlotIndex]: image.tag }));
    }
    setActiveSlotIndex(null);
  };

  // Assign image by ID (used for drag and drop)
  const handleSlotAssignImage = (slotIndex, imageId) => {
    const found = images.find((i) => i.id === imageId);
    if (!found) return;
    setSlotImages((prev) => {
      const copy = [...prev];
      copy[slotIndex] = found;
      return copy;
    });
    if (found.tag) {
      setSlotLabels((prev) => ({ ...prev, [slotIndex]: found.tag }));
    }
    setToastMsg(isRTL ? `تم إدراج صورة (${found.name}) في الخانة ${slotIndex + 1}` : `Placed (${found.name}) into slot ${slotIndex + 1}`);
  };

  // Clear slot
  const handleClearSlot = (index) => {
    setSlotImages((prev) => {
      const copy = [...prev];
      copy[index] = null;
      return copy;
    });
    setSlotLabels((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
    setSlotTransforms((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="print-studio-container" style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-primary)',
      direction: isRTL ? 'rtl' : 'ltr'
    }}>

      {/* SIDEBAR: Print Controls & Layout Tuning */}
      <div className="no-print" style={{
        width: '380px',
        backgroundColor: 'var(--bg-secondary)',
        borderInlineStart: isRTL ? 'none' : '1px solid var(--border-subtle)',
        borderInlineEnd: isRTL ? '1px solid var(--border-subtle)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 20,
        boxShadow: 'var(--shadow-card)'
      }}>
        
        {/* Studio Top Action Bar */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <button
            type="button"
            onClick={onGoBack || onBackToHome}
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              fontSize: '0.86rem',
              fontWeight: 700,
              background: 'rgba(2, 132, 199, 0.12)',
              border: '1px solid rgba(2, 132, 199, 0.35)',
              color: '#38bdf8'
            }}
            title={isRTL ? 'الرجوع للصفحة السابقة' : 'Back to Previous Page'}
          >
            <BackIcon size={17} />
            <span>{isRTL ? 'رجوع للصفحة السابقة' : t('backToImages')}</span>
          </button>

          <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {t('printPreparation')}
          </span>
        </div>

        {/* Scrollable Settings Panel */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

          {/* 1. LAYOUT PRESETS */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>
              <LayoutGrid size={18} color="#0ea5e9" />
              <span>{t('imageLayoutGrid')}</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { id: '1', label: t('layout1'), desc: t('layout1desc') },
                { id: '2-h', label: t('layout2h'), desc: t('layout2hdesc') },
                { id: '2-v', label: t('layout2v'), desc: t('layout2vdesc') },
                { id: '4', label: t('layout4'), desc: t('layout4desc') },
                { id: '6', label: t('layout6'), desc: t('layout6desc') },
                { id: '8', label: t('layout8'), desc: t('layout8desc') },
                { id: '9', label: t('layout9'), desc: t('layout9desc') }
              ].map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => setGridPreset(layout.id)}
                  style={{
                    padding: '10px 6px',
                    borderRadius: '10px',
                    border: gridPreset === layout.id ? '2px solid #0284c7' : '1px solid var(--border-subtle)',
                    background: gridPreset === layout.id ? 'rgba(2, 132, 199, 0.2)' : 'var(--bg-card)',
                    color: gridPreset === layout.id ? '#38bdf8' : 'var(--text-main)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ fontSize: '0.88rem', fontWeight: 800 }}>{layout.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{layout.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Paper Format Indicator (Configured in Printer Settings) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '8px 12px',
            marginBottom: '20px',
            fontSize: '0.78rem',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
              <Sliders size={14} color="#0ea5e9" style={{ flexShrink: 0 }} />
              <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{isRTL ? 'الورق:' : 'Paper:'}</span>
              <strong style={{ color: '#38bdf8' }}>{paperSize}</strong>
              <span style={{ color: 'var(--text-dim)' }}>•</span>
              <span style={{ color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {orientation === 'landscape' ? (isRTL ? 'عرضي' : 'Landscape') : (isRTL ? 'طولي' : 'Portrait')}
              </span>
            </div>

            {onOpenPrinters && (
              <button
                type="button"
                onClick={onOpenPrinters}
                style={{
                  background: 'rgba(14, 165, 233, 0.12)',
                  border: '1px solid rgba(14, 165, 233, 0.25)',
                  color: '#38bdf8',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  flexShrink: 0
                }}
              >
                {isRTL ? 'تعديل من إعدادات الطابعة' : 'Printer Settings'}
              </button>
            )}
          </div>

          {/* 2. ULTRASOUND IMAGE ENHANCEMENT */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>
              <SunMedium size={18} color="#f59e0b" />
              <span>{t('imageEnhancement')}</span>
            </label>

            {/* Fit mode */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <button
                onClick={() => setImageFit('contain')}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: imageFit === 'contain' ? '2px solid #0284c7' : '1px solid var(--border-subtle)',
                  background: imageFit === 'contain' ? 'rgba(2, 132, 199, 0.25)' : 'var(--bg-card)',
                  color: imageFit === 'contain' ? '#38bdf8' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                {t('fitContain')}
              </button>

              <button
                onClick={() => setImageFit('cover')}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: imageFit === 'cover' ? '2px solid #0284c7' : '1px solid var(--border-subtle)',
                  background: imageFit === 'cover' ? 'rgba(2, 132, 199, 0.25)' : 'var(--bg-card)',
                  color: imageFit === 'cover' ? '#38bdf8' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                {t('fitCover')}
              </button>
            </div>

            {/* Global Zoom / Scale Slider */}
            <div style={{ marginBottom: '14px', background: 'var(--bg-card)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{t('globalScale')}</span>
                <span style={{ color: '#38bdf8', fontWeight: 800 }}>{globalScale}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="250"
                value={globalScale}
                onChange={(e) => handleGlobalScaleChange(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0ea5e9', marginBottom: '8px' }}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleGlobalScaleChange(100)}
                  style={{
                    flex: 1,
                    padding: '4px',
                    fontSize: '0.72rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: globalScale === 100 ? '#38bdf8' : 'var(--text-main)',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {t('standard100')}
                </button>
                <button
                  type="button"
                  onClick={() => handleGlobalScaleChange(145)}
                  style={{
                    flex: 1,
                    padding: '4px',
                    fontSize: '0.72rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: globalScale === 145 ? '#38bdf8' : 'var(--text-main)',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {t('fitWidth145')}
                </button>
              </div>
            </div>

            {/* Brightness slider */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>{t('brightness')}</span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>{brightness}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0ea5e9' }}
              />
            </div>

            {/* Contrast slider */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>{t('contrast')}</span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>{contrast}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="180"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0ea5e9' }}
              />
            </div>

            {/* Quick Filter Toggles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => setIsGrayscale(!isGrayscale)}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  border: '1px solid var(--border-subtle)',
                  background: isGrayscale ? '#0284c7' : 'var(--bg-card)',
                  color: isGrayscale ? '#ffffff' : 'var(--text-main)',
                  cursor: 'pointer'
                }}
              >
                {isGrayscale ? t('grayscaleActive') : t('grayscale')}
              </button>

              <button
                onClick={() => setIsInverted(!isInverted)}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  border: '1px solid var(--border-subtle)',
                  background: isInverted ? '#0284c7' : 'var(--bg-card)',
                  color: isInverted ? '#ffffff' : 'var(--text-main)',
                  cursor: 'pointer'
                }}
              >
                {isInverted ? t('negativeActive') : t('negative')}
              </button>
            </div>
          </div>

          {/* 4. PAGE HEADER & FOOTER TOGGLES */}
          <div style={{ marginBottom: '22px', background: 'var(--bg-card)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              {t('pageElements')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={doctorInfo.showHeaderOnPrint}
                  onChange={(e) => updateDoctorInfo({ showHeaderOnPrint: e.target.checked })}
                  style={{ accentColor: '#0284c7' }}
                />
                <span>{t('showHeader')}</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={doctorInfo.showFooterOnPrint}
                  onChange={(e) => updateDoctorInfo({ showFooterOnPrint: e.target.checked })}
                  style={{ accentColor: '#0284c7' }}
                />
                <span>{t('showFooter')}</span>
              </label>
            </div>
          </div>

          {/* 5. ACTIVE SLOT ASSIGNMENT DRAWER */}
          {activeSlotIndex !== null && (
            <div style={{
              background: 'var(--bg-card)',
              border: '2px solid #0284c7',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '20px'
            }} className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>
                  {t('slotCustomization', { num: activeSlotIndex + 1 })}
                </div>
                <button
                  onClick={() => setActiveSlotIndex(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  ✕
                </button>
              </div>

              {/* Slot label edit */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  {t('slotLabelInput')}
                </label>
                <input
                  type="text"
                  value={slotLabels[activeSlotIndex] || ''}
                  onChange={(e) => setSlotLabels({ ...slotLabels, [activeSlotIndex]: e.target.value })}
                  placeholder={t('slotLabelPlaceholder')}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Slot Image Size & Position (Scale & Pan) */}
              {slotImages[activeSlotIndex] && (
                <div style={{
                  marginBottom: '14px',
                  background: 'var(--bg-secondary)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {t('slotScaleTitle')}
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8' }}>
                      {Math.round(((slotTransforms[activeSlotIndex]?.scale) || 1) * 100)}%
                    </span>
                  </div>

                  {/* Scale Slider */}
                  <input
                    type="range"
                    min="50"
                    max="300"
                    value={Math.round(((slotTransforms[activeSlotIndex]?.scale) || 1) * 100)}
                    onChange={(e) => updateSlotTransform(activeSlotIndex, { scale: Number(e.target.value) / 100 })}
                    style={{ width: '100%', accentColor: '#0ea5e9', marginBottom: '8px' }}
                  />

                  {/* Quick Scale Presets */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '8px' }}>
                    <button
                      type="button"
                      onClick={() => updateSlotTransform(activeSlotIndex, { scale: 1.45 })}
                      style={{
                        padding: '5px 2px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: '1px solid var(--border-subtle)',
                        background: (slotTransforms[activeSlotIndex]?.scale || 1) === 1.45 ? '#0284c7' : 'var(--bg-card)',
                        color: (slotTransforms[activeSlotIndex]?.scale || 1) === 1.45 ? '#ffffff' : 'var(--text-main)',
                        cursor: 'pointer'
                      }}
                      title="145%"
                    >
                      {t('fitWidthBtn')}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSlotTransform(activeSlotIndex, { scale: 1.8 })}
                      style={{
                        padding: '5px 2px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: '1px solid var(--border-subtle)',
                        background: (slotTransforms[activeSlotIndex]?.scale || 1) === 1.8 ? '#0284c7' : 'var(--bg-card)',
                        color: (slotTransforms[activeSlotIndex]?.scale || 1) === 1.8 ? '#ffffff' : 'var(--text-main)',
                        cursor: 'pointer'
                      }}
                      title="180%"
                    >
                      {t('zoom180Btn')}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSlotTransform(activeSlotIndex, { scale: 1, x: 0, y: 0 })}
                      style={{
                        padding: '5px 2px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                      title="100%"
                    >
                      {t('standard100')}
                    </button>
                  </div>

                  {/* Apply to All Slots Button */}
                  <button
                    type="button"
                    onClick={() => handleApplyTransformToAll(activeSlotIndex)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      border: '1px dashed #0284c7',
                      background: 'rgba(2, 132, 199, 0.15)',
                      color: '#38bdf8',
                      cursor: 'pointer',
                      marginBottom: '6px'
                    }}
                  >
                    {t('applyToAllBtn')}
                  </button>

                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4, textAlign: 'center' }}>
                    {t('slotDragHint')}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* BOTTOM PRINT & EXPORT BUTTONS */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            padding: '6px 10px',
            borderRadius: '8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)'
          }}>
            <span>{t('selectedPrinter')} <strong style={{ color: '#38bdf8' }}>{selectedPrinter || (isRTL ? 'الافتراضية' : 'Default')}</strong></span>
            <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.7rem' }}>{copies} {isRTL ? 'نسخة' : 'copies'}</span>
          </div>

          <button
            onClick={() => handleExecutePrint()}
            disabled={isPrinting}
            className="btn btn-primary"
            style={{
              padding: '12px 20px',
              fontSize: '1.05rem',
              fontWeight: 800,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <Printer size={22} />
            <span>{t('directPrint')}</span>
          </button>

          <button
            onClick={handleSavePdf}
            className="btn btn-secondary"
            style={{
              padding: '9px 16px',
              fontSize: '0.9rem',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FileDown size={18} />
            <span>{t('savePdf')}</span>
          </button>
        </div>
      </div>

      {/* CENTER VIEWPORT: Live Interactive WYSIWYG Sheet Preview */}
      <div className="preview-viewport" style={{
        flex: 1,
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '30px 20px 80px',
        position: 'relative'
      }}>
        
        {/* Floating Zoom & Back Controls Bar */}
        <div className="no-print" style={{
          position: 'sticky',
          top: '0',
          marginBottom: '20px',
          zIndex: 10,
          background: 'var(--bg-card)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '30px',
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
        }}>
          <button
            type="button"
            onClick={onGoBack || onBackToHome}
            style={{
              background: 'rgba(2, 132, 199, 0.12)',
              border: '1px solid rgba(2, 132, 199, 0.3)',
              borderRadius: '20px',
              color: '#38bdf8',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '4px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
            title={isRTL ? 'الرجوع للصفحة السابقة' : 'Back to Previous Page'}
          >
            <BackIcon size={14} />
            <span>{isRTL ? 'رجوع' : 'Back'}</span>
          </button>

          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)' }} />

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {t('precisePreview')}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setPreviewZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
              className="btn-icon"
              style={{ background: 'var(--bg-secondary)', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}
              title="Zoom out"
            >
              <ZoomOut size={16} />
            </button>

            <span style={{ fontSize: '0.82rem', fontWeight: 700, minWidth: '46px', textAlign: 'center', color: '#38bdf8' }}>
              {Math.round(previewZoom * 100)}%
            </span>

            <button
              onClick={() => setPreviewZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(2))))}
              className="btn-icon"
              style={{ background: 'var(--bg-secondary)', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}
              title="Zoom in"
            >
              <ZoomIn size={16} />
            </button>

            <button
              onClick={() => setPreviewZoom(0.85)}
              style={{
                background: 'var(--bg-secondary)',
                border: 'none',
                color: 'var(--text-main)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              100%
            </button>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {t('clickSlotHint')}
          </div>
        </div>

        {/* The Scaled Paper Wrapper */}
        <div
          className="printable-paper-wrapper"
          style={{
            transform: `scale(${previewZoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
            boxShadow: 'var(--shadow-sheet)',
            borderRadius: '2px',
            marginBottom: '40px'
          }}
        >
          <PrintSheet
            paperSize={paperSize}
            orientation={orientation}
            margins={margins}
            gridPreset={gridPreset}
            slotImages={slotImages}
            slotLabels={slotLabels}
            slotTransforms={slotTransforms}
            onSlotTransformChange={updateSlotTransform}
            onSlotAssignImage={handleSlotAssignImage}
            imageFit={imageFit}
            brightness={brightness}
            contrast={contrast}
            isInverted={isInverted}
            isGrayscale={isGrayscale}
            borderStyle={borderStyle}
            patientInfo={patientInfo}
            onSlotClick={(index) => setActiveSlotIndex(index)}
            activeSlotIndex={activeSlotIndex}
            isInteractive={true}
          />
        </div>

      </div>

      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />
    </div>
  );
}
