import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, History, Stethoscope, Plus, X, Trash2, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const STORAGE_KEY = 'sonar_study_types_history_v1';

export const DEFAULT_STUDY_PRESETS_AR = [
  'فحص سونار بطن وحوض (Abdomino-Pelvic US)',
  'فحص سونار بطن علوي (Upper Abdomen US)',
  'فحص سونار حوض ومثانة (Pelvis & Bladder US)',
  'فحص سونار الحمل ومتابعة الجنين (Obstetric US)',
  'فحص سونار تفصيلي للجنين 3D/4D (Fetal Anomaly Scan)',
  'فحص سونار الغدة الدرقية والرقبة (Thyroid US)',
  'فحص سونار الثدي (Breast Ultrasound)',
  'فحص دوبلر ملون على الأوعية الدموية (Color Doppler)',
  'فحص دوبلر على شرايين الرقبة (Carotid Doppler)',
  'فحص دوبلر على أوردة الساقين (Lower Limbs Venous Doppler)',
  'فحص دوبلر على شرايين الساقين (Lower Limbs Arterial Doppler)',
  'فحص سونار الخصيتين وكيس الصفن (Scrotal US)',
  'فحص سونار الكلى والمسالك البولية (KUB Ultrasound)',
  'فحص سونار كبد ومرارة (Hepato-Biliary US)',
  'فحص سونار المفاصل والأنسجة الرخوة (MSK Ultrasound)',
  'موجات صوتية على القلب (Echocardiography)',
  'فحص سونار البروستاتا (Prostate Ultrasound)',
  'فحص سونار الطوارئ والبطن (FAST Scan)'
];

export const DEFAULT_STUDY_PRESETS_EN = [
  'Abdomino-Pelvic Ultrasound (US)',
  'Upper Abdomen Ultrasound',
  'Pelvis & Urinary Bladder Ultrasound',
  'Obstetric & Fetal Growth Scan',
  '3D/4D Fetal Anomaly Ultrasound',
  'Thyroid & Neck Ultrasound',
  'Breast Ultrasound Scan',
  'Color Doppler Vascular Ultrasound',
  'Carotid Arteries Doppler Scan',
  'Lower Extremity Venous Doppler',
  'Lower Extremity Arterial Doppler',
  'Scrotal & Testicular Ultrasound',
  'KUB (Kidneys & Bladder) Ultrasound',
  'Hepatobiliary Ultrasound (Liver & GB)',
  'Musculoskeletal (MSK) Ultrasound',
  'Echocardiography (Echo)',
  'Transrectal / Pelvic Prostate Ultrasound',
  'Emergency FAST Ultrasound Scan'
];

export function StudyTypeCombobox({
  value = '',
  onChange,
  placeholder,
  isRTL
}) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Load custom saved history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (e) {
      console.warn('Error reading study history from localStorage', e);
    }
  }, []);

  // Save an item to history
  const saveToHistory = (itemText) => {
    if (!itemText) return;
    const trimmed = itemText.trim();
    if (!trimmed) return;

    setHistory((prev) => {
      // Filter out duplicate if it already exists (case insensitive)
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 50); // Keep latest 50
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
      return updated;
    });
  };

  // Delete an item from custom history
  const deleteFromHistory = (itemToDelete, e) => {
    e.stopPropagation();
    setHistory((prev) => {
      const updated = prev.filter((item) => item !== itemToDelete);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to update localStorage:', err);
      }
      return updated;
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        // Save current non-empty value on blur/close
        if (value && value.trim()) {
          saveToHistory(value.trim());
        }
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [value]);

  const presets = isRTL ? DEFAULT_STUDY_PRESETS_AR : DEFAULT_STUDY_PRESETS_EN;
  const query = (value || '').trim().toLowerCase();

  // Filter history and presets
  const filteredHistory = history.filter((item) =>
    !query || item.toLowerCase().includes(query)
  );

  const filteredPresets = presets.filter((item) => {
    const matchesQuery = !query || item.toLowerCase().includes(query);
    // Don't show in presets if it's already in history
    const existsInHistory = history.some((h) => h.toLowerCase() === item.toLowerCase());
    return matchesQuery && !existsInHistory;
  });

  const exactMatchExists =
    history.some((h) => h.toLowerCase() === query) ||
    presets.some((p) => p.toLowerCase() === query);

  const handleSelect = (item) => {
    onChange(item);
    saveToHistory(item);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (value && value.trim()) {
        saveToHistory(value.trim());
        setIsOpen(false);
        inputRef.current?.blur();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: isRTL ? '8px 12px 8px 36px' : '8px 36px 8px 12px',
            background: 'var(--bg-card)',
            border: isOpen ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
            borderRadius: '8px',
            color: 'var(--text-main)',
            fontSize: '0.9rem',
            outline: 'none',
            boxShadow: isOpen ? '0 0 0 2px var(--bg-accent-soft)' : 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s'
          }}
        />

        {/* Toggle chevron / dropdown button */}
        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev);
            if (!isOpen) inputRef.current?.focus();
          }}
          title={isRTL ? "عرض قائمة الفحوصات والتشخيصات المحفوظة" : "Show saved studies and presets"}
          style={{
            position: 'absolute',
            [isRTL ? 'left' : 'right']: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '26px',
            height: '26px',
            background: 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            transition: 'transform 0.2s, color 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-blue)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ChevronDown
            size={16}
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}
          />
        </button>
      </div>

      {/* Floating Dropdown List */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 5px)',
            left: 0,
            right: 0,
            maxHeight: '270px',
            overflowY: 'auto',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            boxShadow: 'var(--shadow-sheet)',
            zIndex: 100,
            padding: '6px 0'
          }}
        >
          {/* Quick save button if doctor typed a new diagnosis not in the list */}
          {query && !exactMatchExists && (
            <div
              onClick={() => handleSelect(value.trim())}
              style={{
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.86rem',
                color: '#38bdf8',
                background: 'var(--bg-accent-soft)',
                borderBottom: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
            >
              <Plus size={16} />
              <span>
                {isRTL ? `💾 حفظ واعتماد: "${value.trim()}"` : `💾 Save & use: "${value.trim()}"`}
              </span>
            </div>
          )}

          {/* SECTION 1: Doctor's Saved History */}
          {filteredHistory.length > 0 && (
            <div>
              <div
                style={{
                  padding: '6px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  background: 'rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <History size={13} style={{ color: '#0ea5e9' }} />
                  <span>{t('savedStudies') || (isRTL ? 'فحوصاتك وتشخيصاتك المحفوظة' : 'Saved Studies & History')}</span>
                </div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    background: 'var(--border-subtle)',
                    padding: '1px 6px',
                    borderRadius: '4px'
                  }}
                >
                  {filteredHistory.length}
                </span>
              </div>

              {filteredHistory.map((item, idx) => {
                const isSelected = item === value;
                return (
                  <div
                    key={`hist-${idx}`}
                    onClick={() => handleSelect(item)}
                    style={{
                      padding: '8px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.86rem',
                      color: isSelected ? '#38bdf8' : 'var(--text-main)',
                      background: isSelected ? 'var(--bg-accent-soft)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'var(--bg-card-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#0ea5e9',
                          flexShrink: 0
                        }}
                      />
                      <span
                        style={{
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {isSelected && <Check size={14} style={{ color: '#0ea5e9' }} />}
                      <button
                        type="button"
                        onClick={(e) => deleteFromHistory(item, e)}
                        title={t('deleteFromHistory') || (isRTL ? 'حذف من السجل' : 'Delete from history')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '20px',
                          height: '20px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: 'var(--text-dim)',
                          transition: 'color 0.15s, background 0.15s'
                        }}
                        onMouseEnter={(e) => {
                          e.stopPropagation();
                          e.currentTarget.style.color = '#ef4444';
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.stopPropagation();
                          e.currentTarget.style.color = 'var(--text-dim)';
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SECTION 2: Common Clinical Ultrasound Presets */}
          {filteredPresets.length > 0 && (
            <div>
              <div
                style={{
                  padding: '6px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  background: 'rgba(0,0,0,0.1)',
                  marginTop: filteredHistory.length > 0 ? '4px' : '0'
                }}
              >
                <Stethoscope size={13} style={{ color: '#10b981' }} />
                <span>{t('commonStudies') || (isRTL ? 'فحوصات السونار الشائعة' : 'Common Ultrasound Presets')}</span>
              </div>

              {filteredPresets.map((preset, idx) => {
                const isSelected = preset === value;
                return (
                  <div
                    key={`preset-${idx}`}
                    onClick={() => handleSelect(preset)}
                    style={{
                      padding: '8px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.86rem',
                      color: isSelected ? '#38bdf8' : 'var(--text-main)',
                      background: isSelected ? 'var(--bg-accent-soft)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'var(--bg-card-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#10b981',
                          flexShrink: 0
                        }}
                      />
                      <span
                        style={{
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {preset}
                      </span>
                    </div>

                    {isSelected && <Check size={14} style={{ color: '#0ea5e9' }} />}
                  </div>
                );
              })}
            </div>
          )}

          {/* When no match found */}
          {filteredHistory.length === 0 && filteredPresets.length === 0 && (
            <div
              style={{
                padding: '16px 14px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.84rem'
              }}
            >
              {isRTL
                ? 'لا توجد فحوصات سابقة مطابقة. اضغط Enter لحفظ هذا الفحص في سجلك.'
                : 'No matching studies. Press Enter to save this as a new study.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
