import React, { useState } from 'react';
import { useDoctor } from '../context/DoctorContext';

export function PrintSheet({
  paperSize = 'A4', // A4 or A5
  orientation = 'portrait', // portrait or landscape
  margins = 'normal', // tight, normal, wide
  gridPreset = '4', // 1, 2-h, 2-v, 4, 6, 8, 9
  slotImages = [], // array of images or nulls
  slotLabels = {}, // { [slotIndex]: 'label' }
  slotTransforms = {}, // { [slotIndex]: { scale: 1, x: 0, y: 0 } }
  onSlotTransformChange = null,
  onSlotAssignImage = null,
  imageFit = 'contain', // contain or cover
  brightness = 100,
  contrast = 100,
  isInverted = false,
  isGrayscale = false,
  borderStyle = 'thin', // none, thin, dark
  patientInfo = {},
  onSlotClick = null,
  activeSlotIndex = null,
  isInteractive = true
}) {
  const { doctorInfo } = useDoctor();
  const [dragOverSlotIndex, setDragOverSlotIndex] = useState(null);

  // Paper dimensions in mm
  const dimensions = {
    A4: orientation === 'portrait' ? { width: '210mm', minHeight: '297mm' } : { width: '297mm', minHeight: '210mm' },
    A5: orientation === 'portrait' ? { width: '148mm', minHeight: '210mm' } : { width: '210mm', minHeight: '148mm' }
  }[paperSize] || { width: '210mm', minHeight: '297mm' };

  // Margin padding
  const marginPadding = {
    tight: '6mm',
    normal: '10mm',
    wide: '15mm'
  }[margins] || '10mm';

  // Grid layout config based on preset
  const getGridConfig = () => {
    switch (gridPreset) {
      case '1':
        return { cols: 1, rows: 1, count: 1 };
      case '2-h':
        return { cols: 2, rows: 1, count: 2 };
      case '2-v':
        return { cols: 1, rows: 2, count: 2 };
      case '4':
        return { cols: 2, rows: 2, count: 4 };
      case '6':
        return orientation === 'landscape' ? { cols: 3, rows: 2, count: 6 } : { cols: 2, rows: 3, count: 6 };
      case '8':
        return orientation === 'landscape' ? { cols: 4, rows: 2, count: 8 } : { cols: 2, rows: 4, count: 8 };
      case '9':
        return { cols: 3, rows: 3, count: 9 };
      default:
        return { cols: 2, rows: 2, count: 4 };
    }
  };

  const gridConfig = getGridConfig();

  // Calculate slots array
  const slots = Array.from({ length: gridConfig.count }).map((_, idx) => {
    return slotImages[idx] || null;
  });

  // Interactive Resize Handles Handler (Drag to scale)
  const handleResizePointerDown = (e, index, corner) => {
    e.stopPropagation();
    e.preventDefault();

    if (onSlotClick) onSlotClick(index);

    const slotContainer = e.currentTarget.closest('.print-slot-container');
    if (!slotContainer) return;

    const rect = slotContainer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const currentTransform = slotTransforms[index] || { scale: 1, x: 0, y: 0 };
    const initialScale = currentTransform.scale || 1;
    const initialDist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

    const onPointerMove = (moveEvent) => {
      moveEvent.preventDefault();
      const currentDist = Math.hypot(moveEvent.clientX - centerX, moveEvent.clientY - centerY);
      const ratio = currentDist / (initialDist || 1);
      let nextScale = Number((initialScale * ratio).toFixed(2));
      nextScale = Math.max(0.5, Math.min(3.5, nextScale));

      if (onSlotTransformChange) {
        onSlotTransformChange(index, {
          ...currentTransform,
          scale: nextScale
        });
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  // Interactive Pan Handler (Drag to move/center image inside slot)
  const handlePanPointerDown = (e, index) => {
    if (e.target.closest('.slot-resize-handle') || e.target.closest('.slot-toolbar-elem')) {
      return;
    }

    if (onSlotClick) onSlotClick(index);

    const slotContainer = e.currentTarget.closest('.print-slot-container');
    if (!slotContainer) return;

    const rect = slotContainer.getBoundingClientRect();
    const currentTransform = slotTransforms[index] || { scale: 1, x: 0, y: 0 };
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = currentTransform.x || 0;
    const initialY = currentTransform.y || 0;

    const onPointerMove = (moveEvent) => {
      moveEvent.preventDefault();
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      // Delta as percentage of slot container dimensions
      const deltaPercentX = (deltaX / rect.width) * 100;
      const deltaPercentY = (deltaY / rect.height) * 100;

      let nextX = Math.round(initialX + deltaPercentX);
      let nextY = Math.round(initialY + deltaPercentY);

      nextX = Math.max(-80, Math.min(80, nextX));
      nextY = Math.max(-80, Math.min(80, nextY));

      if (onSlotTransformChange) {
        onSlotTransformChange(index, {
          ...currentTransform,
          x: nextX,
          y: nextY
        });
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  // Mouse wheel zoom over active slot
  const handleSlotWheel = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    const currentTransform = slotTransforms[index] || { scale: 1, x: 0, y: 0 };
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    let nextScale = Number(((currentTransform.scale || 1) + delta).toFixed(2));
    nextScale = Math.max(0.5, Math.min(3.5, nextScale));

    if (onSlotTransformChange) {
      onSlotTransformChange(index, {
        ...currentTransform,
        scale: nextScale
      });
    }
  };

  // Step zoom (+ / - buttons)
  const handleStepZoom = (index, step) => {
    const currentTransform = slotTransforms[index] || { scale: 1, x: 0, y: 0 };
    let nextScale = Number(((currentTransform.scale || 1) + step).toFixed(2));
    nextScale = Math.max(0.5, Math.min(3.5, nextScale));

    if (onSlotTransformChange) {
      onSlotTransformChange(index, {
        ...currentTransform,
        scale: nextScale
      });
    }
  };

  // Quick fit width
  const handleQuickFitWidth = (index) => {
    const currentTransform = slotTransforms[index] || { scale: 1, x: 0, y: 0 };
    const nextScale = (currentTransform.scale || 1) > 1.25 ? 1 : 1.45;
    if (onSlotTransformChange) {
      onSlotTransformChange(index, {
        ...currentTransform,
        scale: nextScale
      });
    }
  };

  // Reset slot transform
  const handleResetSlotTransform = (index) => {
    if (onSlotTransformChange) {
      onSlotTransformChange(index, { scale: 1, x: 0, y: 0 });
    }
  };

  // Drag & drop handlers
  const handleSlotDragOver = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (dragOverSlotIndex !== index) {
      setDragOverSlotIndex(index);
    }
  };

  const handleSlotDragLeave = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragOverSlotIndex === index) {
      setDragOverSlotIndex(null);
    }
  };

  const handleSlotDrop = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlotIndex(null);

    const jsonData = e.dataTransfer.getData('application/json');
    if (jsonData) {
      try {
        const parsed = JSON.parse(jsonData);
        if (parsed.id && onSlotAssignImage) {
          onSlotAssignImage(index, parsed.id);
          return;
        }
      } catch (err) {}
    }

    const textId = e.dataTransfer.getData('text/plain');
    if (textId && onSlotAssignImage) {
      onSlotAssignImage(index, textId);
    }
  };

  // Image filter string
  const filterStyle = `brightness(${brightness}%) contrast(${contrast}%) ${isInverted ? 'invert(1)' : ''} ${isGrayscale ? 'grayscale(1)' : ''}`;

  return (
    <div
      className="printable-paper"
      style={{
        width: dimensions.width,
        minHeight: dimensions.minHeight,
        padding: marginPadding,
        backgroundColor: '#ffffff',
        color: '#000000',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        direction: 'rtl',
        position: 'relative',
        margin: '0 auto',
        fontFamily: "'Cairo', 'Outfit', sans-serif"
      }}
    >
      {/* Top Section: Header & Patient Info */}
      <div>
        {/* DOCTOR & CLINIC HEADER BANNER */}
        {doctorInfo.showHeaderOnPrint && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2.5px solid #0284c7',
            paddingBottom: '8px',
            marginBottom: '8px'
          }}>
            {/* Right: Clinic & Doctor Details */}
            <div style={{ textAlign: 'right' }}>
              <h2 style={{
                fontSize: paperSize === 'A5' ? '12pt' : '15pt',
                fontWeight: 900,
                color: '#0369a1',
                margin: 0,
                lineHeight: 1.2
              }}>
                {doctorInfo.clinicName || 'مركز السونار والأشعة'}
              </h2>
              <div style={{
                fontSize: paperSize === 'A5' ? '10.5pt' : '12pt',
                fontWeight: 800,
                color: '#0f172a',
                marginTop: '2px'
              }}>
                {doctorInfo.doctorName || 'اسم الطبيب'}
              </div>
              <div style={{
                fontSize: paperSize === 'A5' ? '8pt' : '9.5pt',
                fontWeight: 600,
                color: '#334155'
              }}>
                {doctorInfo.specialty}
              </div>
              {doctorInfo.degree && (
                <div style={{
                  fontSize: paperSize === 'A5' ? '7pt' : '8pt',
                  color: '#64748b'
                }}>
                  {doctorInfo.degree}
                </div>
              )}
            </div>

            {/* Left: Contact info & Doctor Logo */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              direction: 'ltr',
              textAlign: 'left'
            }}>
              <div style={{
                fontSize: paperSize === 'A5' ? '7pt' : '8pt',
                color: '#475569',
                lineHeight: 1.4
              }}>
                {doctorInfo.phone && <div style={{ fontWeight: 600 }}>📞 {doctorInfo.phone}</div>}
                {doctorInfo.address && <div>📍 {doctorInfo.address}</div>}
              </div>

              {doctorInfo.logo && (
                <div style={{
                  width: paperSize === 'A5' ? '46px' : '62px',
                  height: paperSize === 'A5' ? '46px' : '62px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ffffff',
                  flexShrink: 0
                }}>
                  <img
                    src={doctorInfo.logo}
                    alt="Clinic Logo"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* PATIENT & EXAM INFORMATION STRIP */}
        <div style={{
          backgroundColor: '#f1f5f9',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          padding: '6px 10px',
          marginBottom: '10px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px',
          fontSize: paperSize === 'A5' ? '7.5pt' : '8.5pt',
          color: '#1e293b'
        }}>
          <div>
            <span style={{ color: '#64748b', fontWeight: 600 }}>المريض: </span>
            <strong style={{ color: '#0f172a' }}>{patientInfo.patientName || 'غير محدد'}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', fontWeight: 600 }}>السن/النوع: </span>
            <strong>{patientInfo.age ? `${patientInfo.age} (${patientInfo.gender || 'أنثى'})` : (patientInfo.gender || '-')}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', fontWeight: 600 }}>التاريخ: </span>
            <strong dir="ltr">{patientInfo.examDate || new Date().toISOString().slice(0, 10)}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', fontWeight: 600 }}>نوع الفحص: </span>
            <strong style={{ color: '#0284c7' }}>{patientInfo.studyType || 'Ultrasound Scan'}</strong>
          </div>
        </div>
      </div>

      {/* Center Section: THE ULTRASOUND IMAGE GRID */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
        gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
        gap: paperSize === 'A5' ? '6px' : '10px',
        alignItems: 'stretch',
        minHeight: '0',
        padding: '2px 0'
      }}>
        {slots.map((img, index) => {
          const isActive = activeSlotIndex === index;
          const label = slotLabels[index] || (img && img.tag) || '';
          const transform = slotTransforms[index] || { scale: 1, x: 0, y: 0 };
          const scaleVal = transform.scale || 1;
          const transX = transform.x || 0;
          const transY = transform.y || 0;
          const isDropTarget = dragOverSlotIndex === index;

          return (
            <div
              key={index}
              className="print-slot-container"
              onClick={() => onSlotClick && onSlotClick(index)}
              onDragOver={(e) => handleSlotDragOver(e, index)}
              onDragLeave={(e) => handleSlotDragLeave(e, index)}
              onDrop={(e) => handleSlotDrop(e, index)}
              style={{
                backgroundColor: isDropTarget ? 'rgba(14, 165, 233, 0.2)' : '#000000',
                borderRadius: '6px',
                border: isDropTarget
                  ? '3px dashed #38bdf8'
                  : isActive
                  ? '3px solid #0284c7'
                  : borderStyle === 'thin'
                  ? '1px solid #94a3b8'
                  : borderStyle === 'dark'
                  ? '2px solid #000000'
                  : 'none',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: onSlotClick ? 'pointer' : 'default',
                minHeight: '120px',
                boxShadow: isDropTarget ? '0 0 16px rgba(56, 189, 248, 0.4)' : 'none',
                transition: 'border-color 0.15s, background-color 0.15s'
              }}
              title={img ? `خانة ${index + 1}: ${img.name} (اضغط للتحكم بالحجم أو السحب)` : `خانة ${index + 1} فارغة - اضغط أو أسقط صورة هنا`}
            >
              {img ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isActive && isInteractive ? 'grab' : (onSlotClick ? 'pointer' : 'default'),
                    touchAction: 'none'
                  }}
                  onPointerDown={isInteractive ? (e) => handlePanPointerDown(e, index) : undefined}
                  onWheel={isInteractive ? (e) => handleSlotWheel(e, index) : undefined}
                >
                  <img
                    src={img.url}
                    alt={img.name || `Scan ${index + 1}`}
                    draggable={false}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: imageFit,
                      filter: filterStyle,
                      transform: `translate(${transX}%, ${transY}%) scale(${scaleVal}) rotate(${img.rotation || 0}deg)`,
                      transformOrigin: 'center center',
                      pointerEvents: 'none',
                      userSelect: 'none',
                      transition: 'none'
                    }}
                  />

                  {/* Slot Label Overlay */}
                  {label && (
                    <div style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '6px',
                      backgroundColor: 'rgba(0, 0, 0, 0.75)',
                      color: '#ffffff',
                      fontSize: paperSize === 'A5' ? '6.5pt' : '8pt',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      pointerEvents: 'none',
                      maxWidth: '90%',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      zIndex: 8
                    }}>
                      {label}
                    </div>
                  )}

                  {/* Slot Number watermark (screen only) */}
                  <div
                    className="no-print"
                    style={{
                      position: 'absolute',
                      top: '4px',
                      left: '4px',
                      backgroundColor: 'rgba(2, 132, 199, 0.85)',
                      color: '#ffffff',
                      fontSize: '9px',
                      fontWeight: 800,
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10,
                      pointerEvents: 'none'
                    }}
                  >
                    {index + 1}
                  </div>

                  {/* Interactive Resize Handles & Frame (Screen only, for active slot) */}
                  {isActive && isInteractive && (
                    <>
                      {/* Outline Guide Box */}
                      <div
                        className="no-print"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          border: '2px dashed rgba(56, 189, 248, 0.85)',
                          pointerEvents: 'none',
                          zIndex: 14
                        }}
                      />

                      {/* 4 Corner Resize Handles */}
                      {[
                        { corner: 'nw', top: '3px', left: '3px', cursor: 'nwse-resize' },
                        { corner: 'ne', top: '3px', right: '3px', cursor: 'nesw-resize' },
                        { corner: 'sw', bottom: '3px', left: '3px', cursor: 'nesw-resize' },
                        { corner: 'se', bottom: '3px', right: '3px', cursor: 'nwse-resize' }
                      ].map((h) => (
                        <div
                          key={h.corner}
                          className="no-print slot-resize-handle"
                          onPointerDown={(e) => handleResizePointerDown(e, index, h.corner)}
                          style={{
                            position: 'absolute',
                            top: h.top,
                            bottom: h.bottom,
                            left: h.left,
                            right: h.right,
                            width: '22px',
                            height: '22px',
                            backgroundColor: '#0284c7',
                            border: '3px solid #ffffff',
                            borderRadius: '50%',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.85)',
                            cursor: h.cursor,
                            pointerEvents: 'auto',
                            zIndex: 30,
                            touchAction: 'none',
                            transition: 'transform 0.1s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.25)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                          title="اسحب هذا المقبض بالماوس لتكبير أو تصغير حجم الصورة"
                        >
                          <div style={{ width: '5px', height: '5px', backgroundColor: '#ffffff', borderRadius: '50%', pointerEvents: 'none' }} />
                        </div>
                      ))}

                      {/* Floating Controls Bar on Top of Active Slot */}
                      <div
                        className="no-print slot-toolbar-elem"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          top: '6px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                          border: '1px solid #0284c7',
                          borderRadius: '20px',
                          padding: '3px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          zIndex: 25,
                          boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
                          pointerEvents: 'auto',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#38bdf8' }}>
                          {Math.round(scaleVal * 100)}%
                        </span>

                        <button
                          type="button"
                          onClick={() => handleStepZoom(index, -0.1)}
                          style={{
                            background: '#1e293b',
                            border: '1px solid #334155',
                            color: '#ffffff',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            lineHeight: 1
                          }}
                          title="تصغير (-10%)"
                        >
                          -
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStepZoom(index, 0.1)}
                          style={{
                            background: '#1e293b',
                            border: '1px solid #334155',
                            color: '#ffffff',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            lineHeight: 1
                          }}
                          title="تكبير (+10%)"
                        >
                          +
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickFitWidth(index)}
                          style={{
                            background: scaleVal > 1.2 ? '#0284c7' : '#1e293b',
                            border: '1px solid #334155',
                            color: '#ffffff',
                            borderRadius: '8px',
                            padding: '1px 6px',
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          title="ملء العرض (Fit Width) - تكبير لإزالة الفراغ الرأسي"
                        >
                          ملء العرض ↔
                        </button>

                        {(scaleVal !== 1 || transX !== 0 || transY !== 0) && (
                          <button
                            type="button"
                            onClick={() => handleResetSlotTransform(index)}
                            style={{
                              background: '#ef4444',
                              border: 'none',
                              color: '#ffffff',
                              borderRadius: '8px',
                              padding: '1px 6px',
                              fontSize: '10px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title="إعادة ضبط الحجم والموضع"
                          >
                            ↺
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div style={{
                  color: '#64748b',
                  fontSize: '9pt',
                  textAlign: 'center',
                  padding: '8px'
                }}>
                  <div style={{ fontSize: '14pt', marginBottom: '4px' }}>➕</div>
                  <div>خانة {index + 1}</div>
                  <div style={{ fontSize: '7.5pt', color: '#475569' }}>(اضغط أو اسحب صورة هنا)</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Section: Footer Disclaimer & Signature */}
      {doctorInfo.showFooterOnPrint && (
        <div style={{
          marginTop: '8px',
          paddingTop: '6px',
          borderTop: '1px solid #cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: paperSize === 'A5' ? '6.5pt' : '7.5pt',
          color: '#64748b'
        }}>
          <div>
            <span>{doctorInfo.footerNote}</span>
          </div>

          <div style={{ textAlign: 'left', direction: 'ltr' }}>
            <span style={{ fontWeight: 600 }}>Signature / Stamp: ___________________</span>
          </div>
        </div>
      )}
    </div>
  );
}
