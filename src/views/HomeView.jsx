import React, { useState, useRef, useMemo } from 'react';
import {
  UploadCloud,
  FolderOpen,
  Folder,
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
  ArrowRight,
  Tag,
  Clock,
  ArrowUpDown,
  ArrowDownAZ
} from 'lucide-react';
import { SAMPLE_SONAR_SCANS } from '../utils/sampleImages';
import { ConfirmModal } from '../components/ConfirmModal';
import { StudyTypeCombobox } from '../components/StudyTypeCombobox';
import { useLanguage } from '../context/LanguageContext';

export function HomeView({
  images,
  setImages,
  selectedImageIds,
  setSelectedImageIds,
  patientInfo,
  setPatientInfo,
  onProceedToPrint,
  onOpenFolder,
  onFolderLoaded,
  folderData,
  activePatientId
}) {
  const { t, isRTL } = useLanguage();
  const ProceedIcon = isRTL ? ArrowLeft : ArrowRight;

  const [searchTerm, setSearchTerm] = useState('');
  const [imageSortOrder, setImageSortOrder] = useState('newest'); // 'newest' | 'name' | 'oldest'
  const [isDragging, setIsDragging] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleOpenFolderClick = async () => {
    if (window.electronAPI && typeof window.electronAPI.openFolderDialog === 'function') {
      if (onOpenFolder) {
        await onOpenFolder();
        return;
      }
    }
    // Browser fallback
    folderInputRef.current?.click();
  };

  const handleBrowserFolderChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const patientMap = {};
    const rootImages = [];

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const relPath = file.webkitRelativePath || file.name;
      const parts = relPath.split('/');

      if (parts.length > 2) {
        const patientSubfolder = parts[1];
        if (!patientMap[patientSubfolder]) {
          patientMap[patientSubfolder] = [];
        }
        patientMap[patientSubfolder].push(file);
      } else {
        rootImages.push(file);
      }
    });

    const readPromises = [];
    const patients = [];

    Object.keys(patientMap).forEach((patientName) => {
      const pImages = [];
      const pObj = {
        id: 'patient_' + Math.random().toString(36).substring(2, 9),
        folderName: patientName,
        patientName: patientName.replace(/[-_]/g, ' '),
        path: '',
        images: pImages,
        timestamp: 0,
        mtimeMs: 0
      };
      patients.push(pObj);

      patientMap[patientName].forEach((file) => {
        const p = new Promise((resolve) => {
          const fileTime = file.lastModified || Date.now();
          const reader = new FileReader();
          reader.onload = (ev) => {
            pImages.push({
              id: 'img_' + Math.random().toString(36).substring(2, 9),
              name: file.name,
              url: ev.target.result,
              rotation: 0,
              tag: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
              timestamp: fileTime,
              mtimeMs: fileTime
            });
            resolve();
          };
          reader.readAsDataURL(file);
        });
        readPromises.push(p);
      });
    });

    if (rootImages.length > 0) {
      const rootPatient = {
        id: 'patient_root_' + Math.random().toString(36).substring(2, 9),
        folderName: 'General',
        patientName: isRTL ? 'ملف عام' : 'General',
        path: '',
        images: [],
        timestamp: 0,
        mtimeMs: 0
      };
      patients.unshift(rootPatient);
      rootImages.forEach((file) => {
        const p = new Promise((resolve) => {
          const fileTime = file.lastModified || Date.now();
          const reader = new FileReader();
          reader.onload = (ev) => {
            rootPatient.images.push({
              id: 'img_' + Math.random().toString(36).substring(2, 9),
              name: file.name,
              url: ev.target.result,
              rotation: 0,
              tag: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
              timestamp: fileTime,
              mtimeMs: fileTime
            });
            resolve();
          };
          reader.readAsDataURL(file);
        });
        readPromises.push(p);
      });
    }

    Promise.all(readPromises).then(() => {
      // Sort images within each patient newest first
      patients.forEach((p) => {
        p.images.sort((a, b) => {
          const diff = (b.timestamp || 0) - (a.timestamp || 0);
          if (Math.abs(diff) > 50) return diff;
          return (b.name || '').localeCompare(a.name || '', undefined, { numeric: true });
        });
        const latestTime = p.images.length > 0 ? p.images[0].timestamp : 0;
        p.timestamp = latestTime;
        p.mtimeMs = latestTime;
      });

      // Sort patients newest first (المضاف حديثاً بالأعلى)
      patients.sort((a, b) => {
        const timeDiff = (b.timestamp || 0) - (a.timestamp || 0);
        if (Math.abs(timeDiff) > 50) return timeDiff;
        return b.folderName.localeCompare(a.folderName, undefined, { numeric: true, sensitivity: 'base' });
      });

      if (onFolderLoaded) {
        onFolderLoaded({
          folderName: files[0]?.webkitRelativePath?.split('/')[0] || 'Ultrasound Folder',
          patients
        });
      }
    });
    e.target.value = '';
  };

  // Sort and filter images
  const sortedAndFilteredImages = useMemo(() => {
    const list = images.filter((img) =>
      (img.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (img.tag || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (imageSortOrder === 'newest') {
      return list.sort((a, b) => {
        const diff = (b.timestamp || 0) - (a.timestamp || 0);
        if (Math.abs(diff) > 50) return diff;
        return (b.name || '').localeCompare(a.name || '', undefined, { numeric: true });
      });
    } else if (imageSortOrder === 'oldest') {
      return list.sort((a, b) => {
        const diff = (a.timestamp || 0) - (b.timestamp || 0);
        if (Math.abs(diff) > 50) return diff;
        return (a.name || '').localeCompare(b.name || '', undefined, { numeric: true });
      });
    } else {
      return list.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { numeric: true }));
    }
  }, [images, searchTerm, imageSortOrder]);

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
      const fileTime = file.lastModified || Date.now();
      const reader = new FileReader();
      reader.onload = (event) => {
        newItems.push({
          id: 'img_' + Math.random().toString(36).substring(2, 9),
          name: file.name,
          url: event.target.result,
          rotation: 0,
          tag: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          timestamp: fileTime,
          mtimeMs: fileTime
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
    // Sort newly loaded images newest first
    const sortedNew = [...newImages].sort((a, b) => {
      const diff = (b.timestamp || 0) - (a.timestamp || 0);
      if (Math.abs(diff) > 50) return diff;
      return (b.name || '').localeCompare(a.name || '', undefined, { numeric: true });
    });
    setImages((prev) => [...sortedNew, ...prev]);
    // Automatically select newly added images
    setSelectedImageIds((prev) => [
      ...sortedNew.map((img) => img.id),
      ...prev
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
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px 80px', direction: isRTL ? 'rtl' : 'ltr', position: 'relative' }}
    >
      {/* Full-window drag overlay when user drags images */}
      {isDragging && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(2, 132, 199, 0.3)',
          backdropFilter: 'blur(8px)',
          border: '3px dashed #38bdf8',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <UploadCloud size={64} color="#38bdf8" />
          <h2 style={{ color: '#ffffff', fontWeight: 800, marginTop: '16px' }}>
            {t('dragDropTitle')}
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.95rem' }}>
            {t('dragDropSubtitle')}
          </p>
        </div>
      )}
      
      {/* Hidden File Input Fallback */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleBrowserFileInput}
        multiple
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Hidden Folder Input Fallback */}
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleBrowserFolderChange}
        webkitdirectory=""
        directory=""
        multiple
        style={{ display: 'none' }}
      />

      {/* Patient Information Banner */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
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
          <span>{t('patientDataTitle')}</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {t('patientName')}
            </label>
            <input
              type="text"
              value={patientInfo.patientName || ''}
              onChange={(e) => setPatientInfo({ ...patientInfo, patientName: e.target.value })}
              placeholder={isRTL ? "مثال: سارة محمد أحمد" : "e.g. Sarah Johnson"}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {t('patientAge')}
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                value={patientInfo.age || ''}
                onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
                placeholder={isRTL ? "السن (مثلاً: 34 سنة)" : "Age (e.g. 34y)"}
                style={{
                  width: '60%',
                  padding: '8px 12px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <select
                value={
                  patientInfo.gender === 'ذكر' || patientInfo.gender === 'Male' ? 'male' :
                  patientInfo.gender === 'طفل' || patientInfo.gender === 'Child' ? 'child' :
                  'female'
                }
                onChange={(e) => {
                  const val = e.target.value;
                  const localizedGender = val === 'male' ? (isRTL ? 'ذكر' : 'Male') :
                    val === 'child' ? (isRTL ? 'طفل' : 'Child') :
                    (isRTL ? 'أنثى' : 'Female');
                  setPatientInfo({ ...patientInfo, gender: localizedGender });
                }}
                style={{
                  width: '40%',
                  padding: '8px 8px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              >
                <option value="female">{isRTL ? 'أنثى' : 'Female'}</option>
                <option value="male">{isRTL ? 'ذكر' : 'Male'}</option>
                <option value="child">{isRTL ? 'طفل' : 'Child'}</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {t('examDate')}
            </label>
            <input
              type="date"
              value={patientInfo.examDate || new Date().toISOString().slice(0, 10)}
              onChange={(e) => setPatientInfo({ ...patientInfo, examDate: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none',
                direction: 'ltr'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {t('studyType')}
            </label>
            <StudyTypeCombobox
              value={patientInfo.studyType || ''}
              onChange={(val) => setPatientInfo({ ...patientInfo, studyType: val })}
              placeholder={isRTL ? "مثلاً: سونار بطن وحوض Pelvic-Abdominal US" : "e.g. Abdomino-Pelvic Ultrasound"}
              isRTL={isRTL}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {t('patientId')}
            </label>
            <input
              type="text"
              value={patientInfo.patientId || ''}
              onChange={(e) => setPatientInfo({ ...patientInfo, patientId: e.target.value })}
              placeholder={isRTL ? "مثلاً: #2026-089" : "e.g. #2026-089"}
              dir="ltr"
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            {isRTL ? `الصور المحملة (${images.length})` : `Loaded Scans (${images.length})`}
          </h2>
          <span style={{
            background: 'var(--bg-card)',
            color: '#38bdf8',
            fontSize: '0.8rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '20px',
            border: '1px solid var(--border-subtle)'
          }}>
            {t('imagesSelected', { count: selectedImageIds.length, total: images.length })}
          </span>

          {/* Quick Compact Search */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                right: isRTL ? '10px' : 'auto',
                left: isRTL ? 'auto' : '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isRTL ? 'ابحث في صور السونار...' : 'Search scans...'}
              style={{
                width: '100%',
                padding: isRTL ? '7px 32px 7px 12px' : '7px 12px 7px 32px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                color: 'var(--text-main)',
                fontSize: '0.84rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#0284c7')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
            />
          </div>

          {images.length > 1 && (
            <button
              type="button"
              onClick={() => {
                setImageSortOrder((prev) => {
                  if (prev === 'newest') return 'name';
                  if (prev === 'name') return 'oldest';
                  return 'newest';
                });
              }}
              title={isRTL ? 'تغيير ترتيب عرض الصور (الافتراضي: المضاف حديثاً)' : 'Change sort order (default: Recently Added)'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(14, 165, 233, 0.1)',
                border: '1px solid rgba(14, 165, 233, 0.3)',
                borderRadius: '8px',
                padding: '4px 10px',
                color: '#38bdf8',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(14, 165, 233, 0.2)';
                e.currentTarget.style.borderColor = '#38bdf8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(14, 165, 233, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.3)';
              }}
            >
              {imageSortOrder === 'newest' && <Clock size={13} />}
              {imageSortOrder === 'name' && <ArrowDownAZ size={13} />}
              {imageSortOrder === 'oldest' && <ArrowUpDown size={13} />}
              <span>
                {imageSortOrder === 'newest' ? t('sortNewest') : imageSortOrder === 'name' ? t('sortName') : t('sortOldest')}
              </span>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleBrowseFiles}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title={t('browseFiles')}
          >
            <FolderOpen size={16} />
            <span>{t('browseFiles')}</span>
          </button>

          {images.length > 0 && (
            <>
              <button
                onClick={handleSelectAll}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', padding: '8px 14px' }}
              >
                {selectedImageIds.length === images.length ? t('deselectAll') : t('selectAll')}
              </button>

              <button
                onClick={() => setIsClearModalOpen(true)}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', padding: '8px 14px', color: '#f43f5e' }}
              >
                <Trash2 size={16} />
                <span>{t('clearAll')}</span>
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
                <span>{t('proceedToPrint')}</span>
                <ProceedIcon size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Image Cards Grid */}
      {images.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'var(--bg-secondary)',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle)'
        }}>
          {folderData ? (
            <div>
              <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8', margin: 0 }}>
                {t('noScansInPatientFolder')}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                {isRTL
                  ? 'يمكنك وضع صور السونار داخل هذا المجلد على جهازك والضغط على زر "تحديث المجلد 🔄" في شريط ملفات المرضى بالأعلى، أو سحب الصور وإفلاتها هنا.'
                  : 'You can place ultrasound scans into this patient folder on your computer and click "Refresh Folder 🔄" in the bar above, or drag & drop images here.'}
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>
                {t('noImagesYet')}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                {t('noImagesSubtitle')}
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={handleBrowseFiles}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px' }}
                >
                  <FolderOpen size={18} />
                  <span>{t('browseFiles')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadSamples}
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
                >
                  <Sparkles size={16} color="#f59e0b" />
                  <span>{t('loadSamples')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '18px'
        }}>
          {sortedAndFilteredImages.map((img) => {
            const isSelected = selectedImageIds.includes(img.id);
            return (
              <div
                key={img.id}
                style={{
                  background: isSelected ? 'var(--bg-card)' : 'var(--bg-secondary)',
                  border: isSelected ? '2px solid #0284c7' : '1px solid var(--border-subtle)',
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
                    right: isRTL ? '12px' : 'auto',
                    left: isRTL ? 'auto' : '12px',
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
                      left: isRTL ? '10px' : 'auto',
                      right: isRTL ? 'auto' : '10px',
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
                    color: 'var(--text-main)',
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
                      placeholder={t('tagPlaceholder')}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
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
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '8px'
                  }}>
                    <button
                      onClick={() => handleRotateImage(img.id)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                      title={t('rotate')}
                    >
                      <RotateCw size={14} />
                      <span>{t('rotate')}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#f43f5e' }}
                      title={t('delete')}
                    >
                      <Trash2 size={14} />
                      <span>{t('delete')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}



      {/* In-app custom confirmation dialog */}
      <ConfirmModal
        isOpen={isClearModalOpen}
        title={t('clearModalTitle')}
        message={t('clearModalDesc')}
        confirmText={t('confirm')}
        cancelText={t('cancel')}
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

