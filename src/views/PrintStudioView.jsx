import React, { useState, useEffect } from 'react';
import { PrintSheet } from '../components/PrintSheet';
import { useDoctor } from '../context/DoctorContext';
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
  onBackToHome
}) {
  const { doctorInfo, updateDoctorInfo } = useDoctor();

  // Selected images to display
  const selectedImages = images.filter((img) => selectedImageIds.includes(img.id));

  // Layout & Paper Configuration
  const [paperSize, setPaperSize] = useState('A4'); // A4 or A5
  const [orientation, setOrientation] = useState('portrait'); // portrait or landscape
  const [margins, setMargins] = useState('normal'); // tight, normal, wide
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
    setToastMsg(`تم تطبيق مقاس الصورة (${Math.round((source.scale || 1) * 100)}%) على جميع خانات الصفحة`);
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

  // Handle direct printing
  const handleDirectPrint = async () => {
    setActiveSlotIndex(null); // Clear active slot before print so selection border doesn't print
    setIsPrinting(true);

    if (window.electronAPI && typeof window.electronAPI.directPrint === 'function') {
      try {
        await window.electronAPI.directPrint({
          pageSize: paperSize,
          landscape: orientation === 'landscape',
          color: !isGrayscale
        });
        setIsPrinting(false);
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
        const res = await window.electronAPI.savePdf();
        if (res.success) {
          setToastMsg(`تم حفظ ملف الـ PDF بنجاح في: ${res.filePath}`);
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
    setToastMsg(`تم إدراج صورة (${found.name}) في الخانة ${slotIndex + 1}`);
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

  return (
    <div className="print-studio-container" style={{
      display: 'flex',
      height: 'calc(100vh - 72px)',
      overflow: 'hidden',
      backgroundColor: '#090d16'
    }}>

      {/* RIGHT SIDEBAR: Print Controls & Layout Tuning */}
      <div className="no-print" style={{
        width: '380px',
        backgroundColor: '#0f172a',
        borderLeft: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 20,
        boxShadow: 'var(--shadow-card)'
      }}>
        
        {/* Studio Top Action Bar */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={onBackToHome}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
          >
            <ArrowRight size={16} />
            <span>الرجوع لاختيار الصور</span>
          </button>

          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8' }}>
            تجهيز الطباعة
          </span>
        </div>

        {/* Scrollable Settings Panel */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

          {/* 1. LAYOUT PRESETS */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', marginBottom: '10px' }}>
              <LayoutGrid size={18} color="#0ea5e9" />
              <span>تقسيم وترتيب الصور في الصفحة</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { id: '1', label: '1 صورة', desc: 'مكبرة' },
                { id: '2-h', label: '2 أفقي', desc: '1×2' },
                { id: '2-v', label: '2 رأسي', desc: '2×1' },
                { id: '4', label: '4 صور', desc: '2×2 قياسي' },
                { id: '6', label: '6 صور', desc: '3×2' },
                { id: '8', label: '8 صور', desc: '4×2' },
                { id: '9', label: '9 صور', desc: '3×3' }
              ].map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => setGridPreset(layout.id)}
                  style={{
                    padding: '10px 6px',
                    borderRadius: '10px',
                    border: gridPreset === layout.id ? '2px solid #0284c7' : '1px solid #334155',
                    background: gridPreset === layout.id ? 'rgba(2, 132, 199, 0.2)' : '#141f36',
                    color: gridPreset === layout.id ? '#38bdf8' : '#e2e8f0',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ fontSize: '0.88rem', fontWeight: 800 }}>{layout.label}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{layout.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. PAPER FORMAT & ORIENTATION */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', marginBottom: '10px' }}>
              <Sliders size={18} color="#0ea5e9" />
              <span>إعدادات ورق الطباعة</span>
            </label>

            {/* Paper Size */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              <button
                onClick={() => setPaperSize('A4')}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: paperSize === 'A4' ? '2px solid #0284c7' : '1px solid #334155',
                  background: paperSize === 'A4' ? '#0284c7' : '#141f36',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                ورق A4 (قياسي)
              </button>

              <button
                onClick={() => setPaperSize('A5')}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: paperSize === 'A5' ? '2px solid #0284c7' : '1px solid #334155',
                  background: paperSize === 'A5' ? '#0284c7' : '#141f36',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                ورق A5 (نصف صفحة)
              </button>
            </div>

            {/* Orientation */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              <button
                onClick={() => setOrientation('portrait')}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: orientation === 'portrait' ? '2px solid #0ea5e9' : '1px solid #334155',
                  background: orientation === 'portrait' ? 'rgba(14, 165, 233, 0.25)' : '#141f36',
                  color: orientation === 'portrait' ? '#38bdf8' : '#cbd5e1',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                طولي (Portrait)
              </button>

              <button
                onClick={() => setOrientation('landscape')}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: orientation === 'landscape' ? '2px solid #0ea5e9' : '1px solid #334155',
                  background: orientation === 'landscape' ? 'rgba(14, 165, 233, 0.25)' : '#141f36',
                  color: orientation === 'landscape' ? '#38bdf8' : '#cbd5e1',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                عرضي (Landscape)
              </button>
            </div>

            {/* Margins */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#141f36', padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>هوامش الورقة:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['tight', 'normal', 'wide'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMargins(m)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      border: 'none',
                      cursor: 'pointer',
                      background: margins === m ? '#0284c7' : '#1e293b',
                      color: '#ffffff'
                    }}
                  >
                    {m === 'tight' ? 'ضيق' : m === 'normal' ? 'عادي' : 'عريض'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. ULTRASOUND IMAGE ENHANCEMENT */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', marginBottom: '10px' }}>
              <SunMedium size={18} color="#f59e0b" />
              <span>معالجة ووضوح صور السونار</span>
            </label>

            {/* Fit mode */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <button
                onClick={() => setImageFit('contain')}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: imageFit === 'contain' ? '2px solid #0284c7' : '1px solid #334155',
                  background: imageFit === 'contain' ? 'rgba(2, 132, 199, 0.25)' : '#141f36',
                  color: imageFit === 'contain' ? '#38bdf8' : '#cbd5e1',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
                title="يمنع قص القياسات والبيانات الهامشية للسونار"
              >
                احتواء كامل (Fit)
              </button>

              <button
                onClick={() => setImageFit('cover')}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: imageFit === 'cover' ? '2px solid #0284c7' : '1px solid #334155',
                  background: imageFit === 'cover' ? 'rgba(2, 132, 199, 0.25)' : '#141f36',
                  color: imageFit === 'cover' ? '#38bdf8' : '#cbd5e1',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
                title="يملأ الإطار بالكامل"
              >
                ملء الإطار (Fill)
              </button>
            </div>

            {/* Global Zoom / Scale Slider */}
            <div style={{ marginBottom: '14px', background: '#141f36', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, color: '#f8fafc' }}>🔍 مقياس حجم الصور العام</span>
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
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: globalScale === 100 ? '#38bdf8' : '#cbd5e1',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  100% قياسي
                </button>
                <button
                  type="button"
                  onClick={() => handleGlobalScaleChange(145)}
                  style={{
                    flex: 1,
                    padding: '4px',
                    fontSize: '0.72rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: globalScale === 145 ? '#38bdf8' : '#cbd5e1',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  title="تكبير الصور بنسبة 145% لتناسب الخانات الطولية بدون فراغات"
                >
                  ملء العرض 145%
                </button>
              </div>
            </div>

            {/* Brightness slider */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>
                <span>سطوع الصورة (Brightness)</span>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>
                <span>تباين الأنسجة (Contrast)</span>
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
                  border: '1px solid #334155',
                  background: isGrayscale ? '#0284c7' : '#141f36',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                {isGrayscale ? '✓ رمادي طبي' : 'أبيض وأسود طبي'}
              </button>

              <button
                onClick={() => setIsInverted(!isInverted)}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  border: '1px solid #334155',
                  background: isInverted ? '#0284c7' : '#141f36',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                {isInverted ? '✓ وضع معكوس (Neg)' : 'صورة معكوسة (Negative)'}
              </button>
            </div>
          </div>

          {/* 4. PAGE HEADER & FOOTER TOGGLES */}
          <div style={{ marginBottom: '22px', background: '#141f36', padding: '12px', borderRadius: '10px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
              عناصر الصفحة
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={doctorInfo.showHeaderOnPrint}
                  onChange={(e) => updateDoctorInfo({ showHeaderOnPrint: e.target.checked })}
                  style={{ accentColor: '#0284c7' }}
                />
                <span>إظهار ترويسة الدكتور واللوجو</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={doctorInfo.showFooterOnPrint}
                  onChange={(e) => updateDoctorInfo({ showFooterOnPrint: e.target.checked })}
                  style={{ accentColor: '#0284c7' }}
                />
                <span>إظهار التوقيع والملاحظة أسفل الورقة</span>
              </label>
            </div>
          </div>

          {/* 5. ACTIVE SLOT ASSIGNMENT DRAWER */}
          {activeSlotIndex !== null && (
            <div style={{
              background: '#152445',
              border: '2px solid #0284c7',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '20px'
            }} className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>
                  تخصيص الخانة رقم ({activeSlotIndex + 1}):
                </div>
                <button
                  onClick={() => setActiveSlotIndex(null)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  إغلاق ✕
                </button>
              </div>

              {/* Slot label edit */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '4px' }}>
                  كتابة وصف أو تشخيص للخانة:
                </label>
                <input
                  type="text"
                  value={slotLabels[activeSlotIndex] || ''}
                  onChange={(e) => setSlotLabels({ ...slotLabels, [activeSlotIndex]: e.target.value })}
                  placeholder="مثال: Right Kidney, Gallbladder..."
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #334155',
                    background: '#0f172a',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Slot Image Size & Position (Scale & Pan) */}
              {slotImages[activeSlotIndex] && (
                <div style={{
                  marginBottom: '14px',
                  background: '#0d1527',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #1e293b'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc' }}>
                      📐 حجم وتكبير الصورة بالخانة:
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
                        border: '1px solid #334155',
                        background: (slotTransforms[activeSlotIndex]?.scale || 1) === 1.45 ? '#0284c7' : '#141f36',
                        color: '#ffffff',
                        cursor: 'pointer'
                      }}
                      title="ملء عرض الخانة والتخلص من الفراغ الرأسي"
                    >
                      ملء العرض (145%)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSlotTransform(activeSlotIndex, { scale: 1.8 })}
                      style={{
                        padding: '5px 2px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: '1px solid #334155',
                        background: (slotTransforms[activeSlotIndex]?.scale || 1) === 1.8 ? '#0284c7' : '#141f36',
                        color: '#ffffff',
                        cursor: 'pointer'
                      }}
                      title="تكبير واضح للقياسات (180%)"
                    >
                      مكبر (180%)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSlotTransform(activeSlotIndex, { scale: 1, x: 0, y: 0 })}
                      style={{
                        padding: '5px 2px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: '1px solid #334155',
                        background: '#1e293b',
                        color: '#cbd5e1',
                        cursor: 'pointer'
                      }}
                      title="استعادة الحجم الأصلي 100%"
                    >
                      100% قياسي
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
                    ⤨ تطبيق هذا الحجم على جميع صور الصفحة
                  </button>

                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.4, textAlign: 'center' }}>
                    💡 يمكنك سحب المقابض الدائرية بزوايا الصورة مباشرة في الورقة لتكبير/تصغير حجمها، أو سحب الصورة لتحريكها.
                  </div>
                </div>
              )}

              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px' }}>
                اختر صورة لوضعها في هذه الخانة (أو اسحبها وأفلتها في الورقة):
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                {images.map((img) => (
                  <div
                    key={img.id}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', img.id);
                      e.dataTransfer.setData('application/json', JSON.stringify({ id: img.id }));
                    }}
                    onClick={() => handleAssignImageToSlot(img)}
                    style={{
                      height: '60px',
                      background: '#000000',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      cursor: 'grab',
                      border: '1px solid #334155'
                    }}
                    title={`${img.name} (اضغط أو اسحب وأسقط في أي خانة)`}
                  >
                    <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <button
                  onClick={() => handleClearSlot(activeSlotIndex)}
                  style={{
                    background: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    cursor: 'pointer'
                  }}
                >
                  مسح وتفريغ هذه الخانة
                </button>
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM PRINT & EXPORT BUTTONS */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #1e293b',
          backgroundColor: '#090d16',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <button
            onClick={handleDirectPrint}
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
            <span>طباعة فورية مباشرة (Print)</span>
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
            <span>حفظ كملف PDF عالي الجودة</span>
          </button>
        </div>
      </div>

      {/* CENTER VIEWPORT: Live Interactive WYSIWYG Sheet Preview */}
      <div className="preview-viewport" style={{
        flex: 1,
        height: '100%',
        overflow: 'auto',
        backgroundColor: '#090d16',
        backgroundImage: 'radial-gradient(circle at 50% 50%, #152033 0%, #090d16 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '30px 20px 80px',
        position: 'relative'
      }}>
        
        {/* Floating Zoom Controls Bar */}
        <div className="no-print" style={{
          position: 'sticky',
          top: '0',
          marginBottom: '20px',
          zIndex: 10,
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #1e293b',
          borderRadius: '30px',
          padding: '6px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
            معاينة دقيقة للورقة:
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setPreviewZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
              className="btn-icon"
              style={{ background: '#1e293b', border: 'none', color: '#f8fafc', cursor: 'pointer' }}
              title="تصغير"
            >
              <ZoomOut size={16} />
            </button>

            <span style={{ fontSize: '0.82rem', fontWeight: 700, minWidth: '46px', textAlign: 'center', color: '#38bdf8' }}>
              {Math.round(previewZoom * 100)}%
            </span>

            <button
              onClick={() => setPreviewZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(2))))}
              className="btn-icon"
              style={{ background: '#1e293b', border: 'none', color: '#f8fafc', cursor: 'pointer' }}
              title="تكبير"
            >
              <ZoomIn size={16} />
            </button>

            <button
              onClick={() => setPreviewZoom(0.85)}
              style={{
                background: '#1e293b',
                border: 'none',
                color: '#cbd5e1',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              100%
            </button>
          </div>

          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
            (اضغط على أي خانة بالورقة لتعديلها أو استبدال صورتها)
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
