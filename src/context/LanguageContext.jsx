import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  ar: {
    // Header
    appTitle: 'Sonar Print Studio',
    appSubtitle: 'تجهيز وتنظيم وطباعة صور السونار والتقارير الطبية',
    desktopBadge: 'برنامج ديسكتوب',
    navImages: 'اختيار الصور والبحث',
    navStudio: 'استوديو الطباعة',
    doctorProfile: 'بيانات الطبيب والعيادة',
    themeDark: 'الداكن',
    themeLight: 'الفاتح',
    langToggle: 'English',

    // Home View
    patientDataTitle: 'بيانات المريض والفحص الطبي',
    patientName: 'اسم المريض',
    patientAge: 'السن والنوع',
    examDate: 'تاريخ الفحص',
    studyType: 'نوع الفحص الطبي',
    patientId: 'رقم الملف / ID',
    searchPlaceholder: 'ابحث في صور السونار بالاسم أو العضو (مثلاً: Kidney, Liver)...',
    dragDropTitle: 'اسحب وأفلت صور السونار هنا',
    dragDropSubtitle: 'يدعم صور السونار بأي امتداد (JPG, PNG, WEBP, BMP) ويمكنك اختيار عدة صور في وقت واحد',
    browseFiles: 'استعراض الصور من الكمبيوتر',
    loadSamples: 'تحميل عينات سونار للتجربة',
    imagesSelected: 'تم تحديد {count} من إجمالي {total} صورة',
    selectAll: 'تحديد الكل',
    deselectAll: 'إلغاء التحديد',
    clearAll: 'تفريغ القائمة بالكامل',
    proceedToPrint: 'الانتقال لتجهيز الطباعة',
    rotate: 'تدوير 90°',
    delete: 'حذف الصورة',
    tagPlaceholder: 'وصف الخانة (مثال: Right Kidney)',
    noImagesYet: 'لم تقم بإضافة صور سونار بعد',
    noImagesSubtitle: 'ابدأ بسحب الصور إلى المربع أعلاه أو استعرض الصور من جهازك',
    clearModalTitle: 'تأكيد مسح كافة الصور',
    clearModalDesc: 'هل أنت متأكد من رغبتك في حذف جميع الصور من القائمة؟',
    confirm: 'تأكيد الحذف',
    cancel: 'إلغاء',

    // Print Studio View
    backToImages: 'الرجوع لاختيار الصور',
    printPreparation: 'تجهيز الطباعة',
    imageLayoutGrid: 'تقسيم وترتيب الصور في الصفحة',
    layout1: '1 صورة',
    layout1desc: 'مكبرة',
    layout2h: '2 أفقي',
    layout2hdesc: '1×2',
    layout2v: '2 رأسي',
    layout2vdesc: '2×1',
    layout4: '4 صور',
    layout4desc: '2×2 قياسي',
    layout6: '6 صور',
    layout6desc: '3×2',
    layout8: '8 صور',
    layout8desc: '4×2',
    layout9: '9 صور',
    layout9desc: '3×3',
    paperSettings: 'إعدادات ورق الطباعة',
    paperA4: 'ورق A4 (قياسي)',
    paperA5: 'ورق A5 (نصف صفحة)',
    orientationPortrait: 'طولي (Portrait)',
    orientationLandscape: 'عرضي (Landscape)',
    pageMargins: 'هوامش الورقة:',
    marginTight: 'ضيق',
    marginNormal: 'عادي',
    marginWide: 'عريض',
    imageEnhancement: 'معالجة ووضوح صور السونار',
    fitContain: 'احتواء كامل (Fit)',
    fitCover: 'ملء الإطار (Fill)',
    globalScale: '🔍 مقياس حجم الصور العام',
    standard100: '100% قياسي',
    fitWidth145: 'ملء العرض 145%',
    brightness: 'سطوع الصورة (Brightness)',
    contrast: 'تباين الأنسجة (Contrast)',
    grayscale: 'أبيض وأسود طبي',
    grayscaleActive: '✓ رمادي طبي',
    negative: 'صورة معكوسة (Negative)',
    negativeActive: '✓ وضع معكوس (Neg)',
    pageElements: 'عناصر الصفحة',
    showHeader: 'إظهار ترويسة الدكتور واللوجو',
    showFooter: 'إظهار التوقيع والملاحظة أسفل الورقة',
    slotCustomization: 'تخصيص الخانة رقم ({num}):',
    slotLabelInput: 'كتابة وصف أو تشخيص للخانة:',
    slotLabelPlaceholder: 'مثال: Right Kidney, Gallbladder...',
    slotScaleTitle: '📐 حجم وتكبير الصورة بالخانة:',
    fitWidthBtn: 'ملء العرض (145%)',
    zoom180Btn: 'مكبر (180%)',
    applyToAllBtn: '⤨ تطبيق هذا الحجم على جميع صور الصفحة',
    slotDragHint: '💡 يمكنك سحب المقابض الدائرية بزوايا الصورة مباشرة في الورقة لتكبير/تصغير حجمها، أو سحب الصورة لتحريكها.',
    chooseImageForSlot: 'اختر صورة لوضعها في هذه الخانة (أو اسحبها وأفلتها في الورقة):',
    clearSlotBtn: 'مسح وتفريغ هذه الخانة',
    directPrint: 'طباعة فورية مباشرة (Print)',
    savePdf: 'حفظ كملف PDF عالي الجودة',
    precisePreview: 'معاينة دقيقة للورقة:',
    clickSlotHint: '(اضغط على أي خانة بالورقة لتعديلها أو استبدال صورتها)',
    selectedPrinter: 'الطابعة الحالية:',
    changePrinter: 'تغيير الطابعة',

    // Printer Modal
    printerModalTitle: 'اختيار الطابعة وإعدادات الطباعة',
    printerModalSubtitle: 'اختر الطابعة المناسبة من الطابعات المتصلة بالجهاز للطباعة الفورية',
    detectedPrinters: 'الطابعات المتاحة على الجهاز ({count})',
    detectingPrinters: 'جاري البحث عن الطابعات المتصلة...',
    noPrintersTitle: 'لم يتم العثور على طابعات مثبتة',
    noPrintersDesc: 'يمكنك استخدام نافذة الطباعة العامة للنظام أو حفظ التقرير كملف PDF.',
    useSystemDialog: 'الطباعة عبر نافذة الويندوز الافتراضية',
    defaultBadge: 'الافتراضية',
    copiesCount: 'عدد النسخ:',
    colorModeTitle: 'وضع الألوان:',
    colorModeFull: 'ألوان كاملة (Color)',
    colorModeMono: 'أبيض وأسود طبي (Monochrome)',
    printNowButton: 'طباعة الآن على هذه الطابعة',

    // Doctor Settings Modal
    doctorSettingsTitle: 'تخصيص بيانات الطبيب والعيادة',
    clinicName: 'اسم العيادة أو المركز الطبي',
    doctorName: 'اسم الطبيب / الأخصائي',
    specialty: 'التخصص الدقيق',
    degree: 'الدرجة العلمية والمؤهلات',
    phone: 'أرقام الهاتف للتواصل',
    address: 'عنوان العيادة / المركز',
    clinicLogo: 'شعار العيادة (Logo)',
    uploadLogo: 'رفع لوجو جديد',
    removeLogo: 'حذف اللوجو',
    footerNote: 'الملاحظة القانونية أسفل ورقة التقرير',
    saveSettings: 'حفظ البيانات محلياً',
    restoreDefaults: 'استعادة البيانات الافتراضية',
    savedToast: 'تم حفظ بيانات الطبيب بنجاح',

    // Print Sheet Labels
    patientLabel: 'المريض:',
    ageGenderLabel: 'السن/النوع:',
    dateLabel: 'التاريخ:',
    studyLabel: 'نوع الفحص:',
    unspecified: 'غير محدد',
    emptySlotText: 'خانة {num}',
    emptySlotHint: '(اضغط أو اسحب صورة هنا)'
  },
  en: {
    // Header
    appTitle: 'Sonar Print Studio',
    appSubtitle: 'Ultrasound image preparation, layout & medical report printing',
    desktopBadge: 'Desktop App',
    navImages: 'Image Selection & Search',
    navStudio: 'Print Studio',
    doctorProfile: 'Doctor & Clinic Info',
    themeDark: 'Dark',
    themeLight: 'Light',
    langToggle: 'العربية',

    // Home View
    patientDataTitle: 'Patient & Exam Information',
    patientName: 'Patient Name',
    patientAge: 'Age & Gender',
    examDate: 'Exam Date',
    studyType: 'Medical Study Type',
    patientId: 'File No. / ID',
    searchPlaceholder: 'Search ultrasound images by name or organ (e.g. Kidney, Liver)...',
    dragDropTitle: 'Drag & Drop Ultrasound Images Here',
    dragDropSubtitle: 'Supports all image extensions (JPG, PNG, WEBP, BMP). You can select multiple scans at once.',
    browseFiles: 'Browse Images from PC',
    loadSamples: 'Load Sample Sonar Scans',
    imagesSelected: '{count} of {total} images selected',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    clearAll: 'Clear All Scans',
    proceedToPrint: 'Proceed to Print Studio',
    rotate: 'Rotate 90°',
    delete: 'Delete Image',
    tagPlaceholder: 'Slot Tag (e.g. Right Kidney)',
    noImagesYet: 'No ultrasound images added yet',
    noImagesSubtitle: 'Start by dragging scans into the box above or browsing files from your computer',
    clearModalTitle: 'Confirm Clearing All Scans',
    clearModalDesc: 'Are you sure you want to remove all ultrasound images from the list?',
    confirm: 'Confirm Clear',
    cancel: 'Cancel',

    // Print Studio View
    backToImages: 'Back to Image Selection',
    printPreparation: 'Print Layout Studio',
    imageLayoutGrid: 'Page Layout & Grid Arrangement',
    layout1: '1 Image',
    layout1desc: 'Enlarged',
    layout2h: '2 Horiz.',
    layout2hdesc: '1×2',
    layout2v: '2 Vert.',
    layout2vdesc: '2×1',
    layout4: '4 Images',
    layout4desc: '2×2 Standard',
    layout6: '6 Images',
    layout6desc: '3×2',
    layout8: '8 Images',
    layout8desc: '4×2',
    layout9: '9 Images',
    layout9desc: '3×3',
    paperSettings: 'Paper & Print Settings',
    paperA4: 'A4 Paper (Standard)',
    paperA5: 'A5 Paper (Half Page)',
    orientationPortrait: 'Portrait',
    orientationLandscape: 'Landscape',
    pageMargins: 'Page Margins:',
    marginTight: 'Tight',
    marginNormal: 'Normal',
    marginWide: 'Wide',
    imageEnhancement: 'Ultrasound Image Enhancement',
    fitContain: 'Fit (Contain)',
    fitCover: 'Fill (Cover)',
    globalScale: '🔍 General Image Scale',
    standard100: '100% Default',
    fitWidth145: 'Fit Width 145%',
    brightness: 'Brightness',
    contrast: 'Tissue Contrast',
    grayscale: 'Medical Grayscale',
    grayscaleActive: '✓ Grayscale',
    negative: 'Invert (Negative)',
    negativeActive: '✓ Negative',
    pageElements: 'Page Elements',
    showHeader: 'Show Doctor & Clinic Header',
    showFooter: 'Show Signature & Disclaimer Footer',
    slotCustomization: 'Slot #{num} Customization:',
    slotLabelInput: 'Diagnosis / Label for this slot:',
    slotLabelPlaceholder: 'e.g. Right Kidney, Gallbladder...',
    slotScaleTitle: '📐 Slot Image Size & Zoom:',
    fitWidthBtn: 'Fit Width (145%)',
    zoom180Btn: 'Enlarged (180%)',
    applyToAllBtn: '⤨ Apply This Size to All Page Scans',
    slotDragHint: '💡 You can drag the circular handles at corners on the paper to resize, or drag inside the scan to pan.',
    chooseImageForSlot: 'Choose scan for this slot (or drag & drop onto the paper):',
    clearSlotBtn: 'Clear This Slot',
    directPrint: 'Direct Print Now',
    savePdf: 'Save High-Quality PDF',
    precisePreview: 'Live Sheet Preview:',
    clickSlotHint: '(Click any slot on the sheet to adjust or replace its image)',
    selectedPrinter: 'Active Printer:',
    changePrinter: 'Change',

    // Printer Modal
    printerModalTitle: 'Select Printer & Print Options',
    printerModalSubtitle: 'Choose a connected printer from your system for high-precision printing',
    detectedPrinters: 'Available Printers on System ({count})',
    detectingPrinters: 'Detecting connected printers...',
    noPrintersTitle: 'No installed printers found',
    noPrintersDesc: 'You can use the standard system print dialog or save as a PDF file.',
    useSystemDialog: 'Print using Windows default dialog',
    defaultBadge: 'Default',
    copiesCount: 'Copies:',
    colorModeTitle: 'Color Mode:',
    colorModeFull: 'Full Color',
    colorModeMono: 'Medical Grayscale (Monochrome)',
    printNowButton: 'Print Now on Selected Device',

    // Doctor Settings Modal
    doctorSettingsTitle: 'Doctor & Clinic Header Settings',
    clinicName: 'Clinic or Center Name',
    doctorName: 'Doctor / Specialist Name',
    specialty: 'Subspecialty / Title',
    degree: 'Academic Degree & Qualifications',
    phone: 'Contact Phone Numbers',
    address: 'Clinic / Center Address',
    clinicLogo: 'Clinic Logo',
    uploadLogo: 'Upload New Logo',
    removeLogo: 'Remove Logo',
    footerNote: 'Legal Disclaimer Note at Sheet Footer',
    saveSettings: 'Save Settings Locally',
    restoreDefaults: 'Restore Default Data',
    savedToast: 'Doctor profile updated successfully',

    // Print Sheet Labels
    patientLabel: 'Patient:',
    ageGenderLabel: 'Age/Gender:',
    dateLabel: 'Date:',
    studyLabel: 'Study:',
    unspecified: 'Unspecified',
    emptySlotText: 'Slot {num}',
    emptySlotHint: '(Click or drop image here)'
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('sonar_lang') || 'ar';
  });

  const isRTL = lang === 'ar';

  useEffect(() => {
    localStorage.setItem('sonar_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.body.dir = isRTL ? 'rtl' : 'ltr';
  }, [lang, isRTL]);

  const toggleLang = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key, params = {}) => {
    let text = translations[lang]?.[key] || translations['ar']?.[key] || key;
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

