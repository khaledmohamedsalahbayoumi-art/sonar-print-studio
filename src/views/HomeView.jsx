import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FolderOpen,
  Search,
  CheckCircle2,
  Circle,
  RotateCw,
  Trash2,
  User,
  Calendar,
  FileText,
  Printer,
  Sparkles,
  Layers,
  ArrowLeft,
  Tag
} from 'lucide-react';
import { SAMPLE_SONAR_SCANS } from '../utils/sampleImages';
import { ConfirmModal } from '../components/ConfirmModal';

export function HomeView({
  images,
  setImages,
  selectedImageIds,
  setSelectedImageIds,
  patientInfo,
  setPatientInfo,
  onProceedToPrint
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Filter images by search query
  const filteredImages = images.filter((img) =>
    (img.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (img.tag || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // File picker handler: native Electron or HTML file input
  const handleBrowseFiles = async () => {
    if (window.electronAPI && typeof window.electronAPI.openFileDialog === 'function') {
      try {
        const nativeFiles = await window.electronAPI.openFileDialog();
        if (nativeFiles && nativeFiles.length > 0) {
          addLoadedImages(nativeFiles);
          return;
        }
      } catch (err) {
        console.warn('Native dialog failed, falling back to browser input:', err);
      }
    }
    // Fallback to browser file input
    fileInputRef.current?.click();
  };

  const handleBrowserFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    processFileList(files);
    e.target.value = '';
  };

  const processFileList = (files) => {
    const newItems = [];
    let processedCount = 0;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        newItems.push({
          id: 'img_' + Math.random().toString(36).substring(2, 9),
          name: file.name,
          url: event.target.result,
          rotation: 0,
          tag: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          timestamp: Date.now()
        });
        processedCount++;
        if (processedCount === files.length) {
          addLoadedImages(newItems);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const addLoadedImages = (newImages) => {
    setImages((prev) => [...prev, ...newImages]);
    // Automatically select newly added images
    setSelectedImageIds((prev) => [
      ...prev,
      ...newImages.map((img) => img.id)
    ]);
  };

  // Drag and Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      processFileList(files);
    }
  };

  // Toggle image selection
  const toggleSelectImage = (id) => {
    setSelectedImageIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedImageIds.length === images.length) {
      setSelectedImageIds([]);
    } else {
      setSelectedImageIds(images.map((img) => img.id));
    }
  };

  const handleRotateImage = (id) => {
    setImages((prev) =>
      prev.map((img) => {
        if (img.id === id) {
          const nextRot = ((img.rotation || 0) + 90) % 360;
          return { ...img, rotation: nextRot };
        }
        return img;
      })
    );
  };

  const handleDeleteImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setSelectedImageIds((prev) => prev.filter((item) => item !== id));
  };

  const handleUpdateTag = (id, newTag) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, tag: newTag } : img))
    );
  };

  const handleLoadSamples = () => {
    addLoadedImages(SAMPLE_SONAR_SCANS);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px 80px' }}>
      
      {/* Hidden File Input Fallback */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleBrowserFileInput}
        multiple
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Patient Information Banner */}
      <div style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
          color: '#38bdf8',
          fontSize: '0.88rem',
          fontWeight: 700
        }}>
          <User size={18} />
          <span>بيانات المريض والفحص (تظهر في ترويسة ورقة السونار):</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>
              اسم المريض
            </label>
            <input
              type="text"
              value={patientInfo.patientName || ''}
              onChange={(e) => setPatientInfo({ ...patientInfo, patientName: e.target.value })}
              placeholder="مثال: سارة محمد أحمد"
              style={{
                width: '100%',
                padding: '8px 12px',
                background: '#141f36',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>
              السن والنوع
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                value={patientInfo.age || ''}
                onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
                placeholder="السن (مثلاً: 34 سنة)"
                style={{
                  width: '60%',
                  padding: '8px 12px',
                  background: '#141f36',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <select
                value={patientInfo.gender || 'أنثى'}
                onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value })}
                style={{
                  width: '40%',
                  padding: '8px 8px',
                  background: '#141f36',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              >
                <option value="أنثى">أنثى</option>
                <option value="ذكر">ذكر</option>
                <option value="طفل">طفل</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>
              تاريخ الفحص
            </label>
            <input
              type="date"
              value={patientInfo.examDate || new Date().toISOString().slice(0, 10)}
              onChange={(e) => setPatientInfo({ ...patientInfo, examDate: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: '#141f36',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                direction: 'ltr'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>
              نوع فحص السونار
            </label>
            <input
              type="text"
              value={patientInfo.studyType || ''}
              onChange={(e) => setPatientInfo({ ...patientInfo, studyType: e.target.value })}
              placeholder="مثلاً: سونار بطن وحوض Pelvic-Abdominal US"
              style={{
                width: '100%',
                padding: '8px 12px',
                background: '#141f36',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>
              رقم الملف / ID
            </label>
            <input
              type="text"
              value={patientInfo.patientId || ''}
              onChange={(e) => setPatientInfo({ ...patientInfo, patientId: e.target.value })}
              placeholder="مثلاً: #2026-089"
              dir="ltr"
              style={{
                width: '100%',
                padding: '8px 12px',
                background: '#141f36',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Central Search & Drag-Drop Hero Section */}
      <div style={{
        background: 'linear-gradient(180deg, #0f172a 0%, #090d16 100%)',
        border: '1px solid #1e293b',
        borderRadius: '24px',
        padding: '36px 24px',
        textAlign: 'center',
        marginBottom: '28px',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow ambient circle */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '180px',
          background: 'radial-gradient(ellipse at center, rgba(14, 165, 233, 0.18) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Central Search Input */}
        <div style={{
          maxWidth: '560px',
          margin: '0 auto 24px',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none'
          }}>
            <Search size={20} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث في صور السونار بالاسم أو العضو (مثلاً: Kidney, Liver)..."
            style={{
              width: '100%',
              padding: '14px 48px 14px 18px',
              backgroundColor: '#141f36',
              border: '2px solid #334155',
              borderRadius: '16px',
              color: '#ffffff',
              fontSize: '1rem',
              outline: 'none',
              boxShadow: '0 4px 18px rgba(0,0,0,0.3)',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => (e.target.style.borderColor = '#0284c7')}
            onBlur={(e) => (e.target.style.borderColor = '#334155')}
          />
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseFiles}
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            padding: '36px 20px',
            border: isDragging ? '2px dashed #38bdf8' : '2px dashed #334155',
            backgroundColor: isDragging ? 'rgba(14, 165, 233, 0.08)' : '#0d1527',
            borderRadius: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isDragging ? 'scale(1.01)' : 'scale(1)'
          }}
          onMouseEnter={(e) => {
            if (!isDragging) e.currentTarget.style.borderColor = '#0ea5e9';
          }}
          onMouseLeave={(e) => {
            if (!isDragging) e.currentTarget.style.borderColor = '#334155';
          }}
        >
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
            border: '1px solid rgba(14, 165, 233, 0.4)',
            color: '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <UploadCloud size={34} />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
            اسحب وأفلت صور السونار هنا
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '0 auto 18px', maxWidth: '420px' }}>
            يدعم صور السونار بأي امتداد (JPG, PNG, WEBP, BMP) ويمكنك اختيار عدة صور في وقت واحد
          </p>

          <div style={{ display: 'inline-flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '12px 24px', fontSize: '1rem' }}
              onClick={(e) => {
                e.stopPropagation();
                handleBrowseFiles();
              }}
            >
              <FolderOpen size={20} />
              <span>استعراض ملفات الكمبيوتر (Browse)</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={(e) => {
                e.stopPropagation();
                handleLoadSamples();
              }}
              title="تجربة فورية بصور سونار جاهزة"
            >
              <Sparkles size={18} color="#f59e0b" />
              <span>تحميل صور عينات للتجربة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Section Header & Batch Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '18px',
        padding: '0 4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            الصور المحملة ({images.length})
          </h2>
          <span style={{
            background: '#1e293b',
            color: '#38bdf8',
            fontSize: '0.8rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '20px'
          }}>
            المحدد للطباعة: {selectedImageIds.length} صورة
          </span>
        </div>

        {images.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleSelectAll}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '8px 14px' }}
            >
              {selectedImageIds.length === images.length ? 'إلغاء تحديد الكل' : 'تحديد كل الصور'}
            </button>

            <button
              onClick={() => setIsClearModalOpen(true)}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '8px 14px', color: '#f43f5e' }}
            >
              <Trash2 size={16} />
              <span>مسح القائمة</span>
            </button>

            <button
              onClick={onProceedToPrint}
              disabled={selectedImageIds.length === 0}
              className="btn btn-success"
              style={{
                fontSize: '0.95rem',
                padding: '10px 22px',
                opacity: selectedImageIds.length === 0 ? 0.5 : 1,
                cursor: selectedImageIds.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <span>التجهيز للطباعة</span>
              <ArrowLeft size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Image Cards Grid */}
      {images.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#0f172a',
          borderRadius: '16px',
          border: '1px solid #1e293b'
        }}>
          <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>
            لم يتم تحميل أي صور سونار حتى الآن. استخدم خيار الاستعراض أعلاه لاختيار الصور من جهازك.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '18px'
        }}>
          {filteredImages.map((img) => {
            const isSelected = selectedImageIds.includes(img.id);
            return (
              <div
                key={img.id}
                style={{
                  background: isSelected ? '#152445' : '#0f172a',
                  border: isSelected ? '2px solid #0284c7' : '1px solid #1e293b',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: isSelected ? '0 8px 24px rgba(2, 132, 199, 0.25)' : 'var(--shadow-card)',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                {/* Image Preview Box */}
                <div
                  onClick={() => toggleSelectImage(img.id)}
                  style={{
                    height: '210px',
                    backgroundColor: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      transform: `rotate(${img.rotation || 0}deg)`,
                      transition: 'transform 0.25s'
                    }}
                  />

                  {/* Selection Checkbox Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: isSelected ? '#0284c7' : 'rgba(15, 23, 42, 0.75)',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(4px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    transition: 'all 0.2s'
                  }}>
                    {isSelected ? <CheckCircle2 size={20} /> : <Circle size={20} color="#94a3b8" />}
                  </div>

                  {/* Rotation Indicator */}
                  {img.rotation ? (
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '10px',
                      background: 'rgba(0,0,0,0.7)',
                      color: '#38bdf8',
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      {img.rotation}°
                    </div>
                  ) : null}
                </div>

                {/* Details & Controls */}
                <div style={{ padding: '12px 14px' }}>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#f8fafc',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '8px'
                  }} title={img.name}>
                    {img.name}
                  </div>

                  {/* Tag / Description Field */}
                  <div style={{ position: 'relative', marginBottom: '10px' }}>
                    <input
                      type="text"
                      value={img.tag || ''}
                      onChange={(e) => handleUpdateTag(img.id, e.target.value)}
                      placeholder="وصف الصورة (مثال: كبد، مرارة، حوض)..."
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        background: '#141f36',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#38bdf8',
                        fontSize: '0.78rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Quick Card Toolbar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #1e293b',
                    paddingTop: '8px'
                  }}>
                    <button
                      onClick={() => handleRotateImage(img.id)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                      title="تدوير الصورة 90 درجة"
                    >
                      <RotateCw size={14} />
                      <span>تدوير</span>
                    </button>

                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#f43f5e' }}
                      title="حذف الصورة من القائمة"
                    >
                      <Trash2 size={14} />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Bar at the bottom when images are selected */}
      {selectedImageIds.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid #0284c7',
          padding: '12px 28px',
          borderRadius: '50px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.7), 0 0 20px rgba(14, 165, 233, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          zIndex: 30
        }} className="fade-in">
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>
            تم تحديد <span style={{ color: '#38bdf8', fontSize: '1.1rem' }}>{selectedImageIds.length}</span> صورة للطباعة
          </div>

          <button
            onClick={onProceedToPrint}
            className="btn btn-primary"
            style={{ padding: '10px 26px', borderRadius: '30px', fontSize: '1rem' }}
          >
            <span>التجهيز والترتيب للطباعة</span>
            <Printer size={18} />
          </button>
        </div>
      )}

      {/* In-app custom confirmation dialog */}
      <ConfirmModal
        isOpen={isClearModalOpen}
        title="مسح جميع الصور"
        message="هل أنت متأكد من مسح جميع الصور المحملة؟ يمكنك إعادة اختيار صور جديدة في أي وقت."
        confirmText="نعم، امسح الصور"
        cancelText="إلغاء"
        type="danger"
        onConfirm={() => {
          setImages([]);
          setSelectedImageIds([]);
          setIsClearModalOpen(false);
        }}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </div>
  );
}

