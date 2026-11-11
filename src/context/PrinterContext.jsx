import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PrinterContext = createContext();

export function PrinterProvider({ children }) {
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(() => {
    return localStorage.getItem('sonar_selected_printer') || '';
  });
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState('color'); // 'color' | 'monochrome'
  const [paperSize, setPaperSizeState] = useState(() => {
    return localStorage.getItem('sonar_paper_size') || 'A4';
  });
  const [orientation, setOrientationState] = useState(() => {
    return localStorage.getItem('sonar_orientation') || 'portrait';
  });
  const [margins, setMarginsState] = useState(() => {
    return localStorage.getItem('sonar_margins') || 'normal';
  });
  const [isDetecting, setIsDetecting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const setPaperSize = (val) => {
    setPaperSizeState(val);
    localStorage.setItem('sonar_paper_size', val);
  };

  const setOrientation = (val) => {
    setOrientationState(val);
    localStorage.setItem('sonar_orientation', val);
  };

  const setMargins = (val) => {
    setMarginsState(val);
    localStorage.setItem('sonar_margins', val);
  };

  // Fetch connected printers
  const refreshPrinters = useCallback(async () => {
    setIsDetecting(true);
    try {
      if (window.electronAPI && typeof window.electronAPI.getPrinters === 'function') {
        const list = await window.electronAPI.getPrinters();
        if (list && Array.isArray(list) && list.length > 0) {
          setPrinters(list);
          setSelectedPrinter((prev) => {
            const exists = list.some((p) => p.name === prev);
            if (prev && exists) return prev;
            const def = list.find((p) => p.isDefault) || list[0];
            const chosen = def ? def.name : '';
            if (chosen) localStorage.setItem('sonar_selected_printer', chosen);
            return chosen;
          });
          setIsDetecting(false);
          return list;
        }
      }
    } catch (err) {
      console.warn('Failed to detect printers:', err);
    }

    // Fallback for browser or if no printers returned
    const fallbackList = [
      { name: 'Microsoft Print to PDF', isDefault: true },
      { name: 'OneNote (Desktop)', isDefault: false },
      { name: 'Microsoft XPS Document Writer', isDefault: false }
    ];
    setPrinters(fallbackList);
    setSelectedPrinter((prev) => prev || fallbackList[0].name);
    setIsDetecting(false);
    return fallbackList;
  }, []);

  useEffect(() => {
    refreshPrinters();
  }, [refreshPrinters]);

  const handleSelectPrinter = (name) => {
    setSelectedPrinter(name);
    if (name) {
      localStorage.setItem('sonar_selected_printer', name);
    } else {
      localStorage.removeItem('sonar_selected_printer');
    }
  };

  // Direct print execution
  const executeDirectPrint = useCallback(async (options = {}) => {
    setIsPrinting(true);
    const targetPrinter = options.deviceName || selectedPrinter || undefined;
    const isColor = (options.colorMode || colorMode) === 'color';
    const numCopies = Number(options.copies || copies) || 1;

    if (window.electronAPI && typeof window.electronAPI.directPrint === 'function') {
      try {
        const res = await window.electronAPI.directPrint({
          silent: !!targetPrinter,
          deviceName: targetPrinter,
          copies: numCopies,
          color: isColor,
          landscape: options.landscape !== undefined ? options.landscape : (orientation === 'landscape'),
          pageSize: options.pageSize || paperSize || 'A4'
        });
        setIsPrinting(false);
        return res;
      } catch (err) {
        console.error('Direct print error:', err);
        setIsPrinting(false);
        throw err;
      }
    }

    // Browser fallback
    window.print();
    setIsPrinting(false);
    return { success: true };
  }, [selectedPrinter, colorMode, copies, orientation, paperSize]);

  return (
    <PrinterContext.Provider
      value={{
        printers,
        selectedPrinter,
        setSelectedPrinter: handleSelectPrinter,
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
        isDetecting,
        isPrinting,
        setIsPrinting,
        refreshPrinters,
        executeDirectPrint
      }}
    >
      {children}
    </PrinterContext.Provider>
  );
}

export function usePrinter() {
  const context = useContext(PrinterContext);
  if (!context) {
    throw new Error('usePrinter must be used within a PrinterProvider');
  }
  return context;
}

