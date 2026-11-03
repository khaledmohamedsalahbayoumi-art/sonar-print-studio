import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Printer, Check, Copy, Palette, Sparkles, X, RefreshCw, AlertCircle } from 'lucide-react';

export function PrinterSelectModal({
  isOpen,
  onClose,
  onConfirmPrint,
  paperSize = 'A4',
  orientation = 'portrait',
  defaultColor = true
}) {
  const { t, isRTL } = useLanguage();

  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [copies, setCopies] = useState(1);
  const [isColor, setIsColor] = useState(defaultColor);

  useEffect(() => {
    if (!isOpen) return;
    fetchPrinters();
    setIsColor(defaultColor);
  }, [isOpen, defaultColor]);

  const fetchPrinters = async () => {
    setLoading(true);
    try {
      if (window.electronAPI && typeof window.electronAPI.getPrinters === 'function') {
        const list = await window.electronAPI.getPrinters();
        if (list && Array.isArray(list) && list.length > 0) {
          setPrinters(list);
          // Set default printer if available, otherwise first printer
          const def = list.find((p) => p.isDefault) || list[0];
          setSelectedDevice(def.name);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Error fetching printers:', err);
    }

    // Fallback if no native printers or running in browser
    setPrinters([]);
    setSelectedDevice('');
    setLoading(false);
  };

  if (!isOpen) return null;

  const handlePrintSubmit = () => {
    onConfirmPrint({
      deviceName: selectedDevice || undefined,
      copies: Number(copies) || 1,
      color: isColor,
      pageSize: paperSize,
      landscape: orientation === 'landscape',
      silent: selectedDevice ? true : false
    });
    onClose();
  };

  return (
    <div
      className="modal-overlay fade-in"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="modal-container fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: 'var(--shadow-sheet)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          direction: isRTL ? 'rtl' : 'ltr',
          textAlign: isRTL ? 'right' : 'left'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
            }}>
              <Printer size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {t('printerModalTitle')}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                {t('printerModalSubtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', maxHeight: '68vh', overflowY: 'auto' }}>
          
          {/* PRINTERS LIST */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Printer size={16} color="#0284c7" />
                <span>{t('detectedPrinters', { count: printers.length })}</span>
              </label>

              <button
                type="button"
                onClick={fetchPrinters}
                disabled={loading}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#0284c7',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RefreshCw size={12} className={loading ? 'spin' : ''} />
                <span>تحديث</span>
              </button>
            </div>

            {loading ? (
              <div style={{
                padding: '30px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                background: 'var(--bg-card)',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🔄</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{t('detectingPrinters')}</div>
              </div>
            ) : printers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {printers.map((printer) => {
                  const isSelected = selectedDevice === printer.name;
                  return (
                    <div
                      key={printer.name}
                      onClick={() => setSelectedDevice(printer.name)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #0284c7' : '1px solid var(--border-subtle)',
                        backgroundColor: isSelected ? 'rgba(2, 132, 199, 0.12)' : 'var(--bg-card)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: isSelected ? '5px solid #0284c7' : '2px solid var(--border-subtle)',
                          backgroundColor: '#ffffff'
                        }} />
                        <div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {printer.displayName || printer.name}
                          </div>
                          {printer.description && (
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              {printer.description}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {printer.isDefault && (
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '20px',
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                          }}>
                            ✓ {t('defaultBadge')}
                          </span>
                        )}
                        <span style={{
                          fontSize: '0.72rem',
                          color: '#0284c7',
                          background: 'rgba(2, 132, 199, 0.1)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          جاهزة
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Option to use default system print dialog */}
                <div
                  onClick={() => setSelectedDevice('')}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: selectedDevice === '' ? '2px solid #0284c7' : '1px solid var(--border-subtle)',
                    backgroundColor: selectedDevice === '' ? 'rgba(2, 132, 199, 0.12)' : 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: selectedDevice === '' ? '5px solid #0284c7' : '2px solid var(--border-subtle)',
                    backgroundColor: '#ffffff'
                  }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    🪟 {t('useSystemDialog')}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                background: 'var(--bg-card)',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)'
              }}>
                <AlertCircle size={28} color="#f59e0b" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {t('noPrintersTitle')}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {t('noPrintersDesc')}
                </div>
              </div>
            )}
          </div>

          {/* PRINT OPTIONS: COPIES & COLOR */}
          <div style={{
            background: 'var(--bg-card)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px',
            marginBottom: '16px'
          }}>
            {/* Copies */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                {t('copiesCount')}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setCopies((c) => Math.max(1, c - 1))}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-main)',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    width: '54px',
                    height: '32px',
                    textAlign: 'center',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-main)',
                    fontWeight: 800,
                    fontSize: '0.95rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setCopies((c) => Math.min(50, c + 1))}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-main)',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Color Mode */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                {t('colorModeTitle')}
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsColor(true)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    border: isColor ? '1.5px solid #0284c7' : '1px solid var(--border-subtle)',
                    background: isColor ? 'rgba(2, 132, 199, 0.2)' : 'var(--bg-secondary)',
                    color: isColor ? '#0284c7' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  🎨 {t('colorModeFull')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsColor(false)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    border: !isColor ? '1.5px solid #0284c7' : '1px solid var(--border-subtle)',
                    background: !isColor ? 'rgba(2, 132, 199, 0.2)' : 'var(--bg-secondary)',
                    color: !isColor ? '#0284c7' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  ⬛ {t('colorModeMono')}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Paper Summary */}
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'var(--bg-accent-soft)',
            border: '1px solid var(--border-subtle)'
          }}>
            <span>📄 مقاس الورقة: <strong>{paperSize}</strong></span>
            <span>📐 الاتجاه: <strong>{orientation === 'portrait' ? 'طولي (Portrait)' : 'عرضي (Landscape)'}</strong></span>
            <span>🖨️ الطابعة: <strong>{selectedDevice || 'نافذة النظام'}</strong></span>
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '10px',
          background: 'var(--bg-card)'
        }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '9px 18px', fontSize: '0.88rem' }}
          >
            {t('cancel')}
          </button>

          <button
            type="button"
            onClick={handlePrintSubmit}
            className="btn btn-primary"
            style={{
              padding: '10px 22px',
              fontSize: '0.95rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Printer size={18} />
            <span>{t('printNowButton')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
