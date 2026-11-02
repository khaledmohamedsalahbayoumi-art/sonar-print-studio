// Generates realistic mock ultrasound images for immediate testing
function createSonarSvg(title, probeType, depth, gain) {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="640" height="480">
  <defs>
    <!-- Medical Sonar Sector Fan Pattern -->
    <radialGradient id="sonarSector_${Math.random().toString(36).substring(2,6)}" cx="50%" cy="10%" r="90%">
      <stop offset="0%" stop-color="#2a3547" />
      <stop offset="25%" stop-color="#141923" />
      <stop offset="60%" stop-color="#0b0e14" />
      <stop offset="100%" stop-color="#000000" />
    </radialGradient>
    <filter id="noiseFilter_${Math.random().toString(36).substring(2,6)}">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" result="noise" />
      <feColorMatrix type="matrix" values="0.3 0.3 0.3 0 0  0.3 0.3 0.3 0 0  0.3 0.3 0.3 0 0  0 0 0 0.85 0"/>
    </filter>
  </defs>

  <!-- Deep dark monitor background -->
  <rect width="640" height="480" fill="#000000" />

  <!-- Ultrasound Beam Sector (Convex / Phased Array Shape) -->
  <path d="M 320 30 L 100 440 A 380 380 0 0 0 540 440 Z" fill="#182232" opacity="0.9" />

  <!-- Acoustic Texture & Anatomy Simulation -->
  <ellipse cx="330" cy="240" rx="90" ry="60" fill="#2d3748" opacity="0.45" />
  <ellipse cx="310" cy="260" rx="45" ry="30" fill="#090d16" opacity="0.9" stroke="#4a5568" stroke-width="2" />
  <ellipse cx="360" cy="220" rx="25" ry="18" fill="#1a202c" opacity="0.8" />
  <circle cx="280" cy="230" r="14" fill="#0f172a" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="3 3"/>
  <circle cx="370" cy="280" r="22" fill="#0f172a" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="3 3"/>

  <!-- Caliper Measurement Crosshairs -->
  <g stroke="#facc15" stroke-width="1.5">
    <!-- Distance measurement line -->
    <line x1="280" y1="230" x2="370" y2="280" stroke-dasharray="4 4" />
    <path d="M 275 230 L 285 230 M 280 225 L 280 235" />
    <path d="M 365 280 L 375 280 M 370 275 L 370 285" />
    <text x="330" y="270" fill="#facc15" font-family="monospace" font-size="11" font-weight="bold">d1: 4.82 cm</text>
  </g>

  <!-- Depth Marker Ticks on the Side -->
  <g stroke="#64748b" stroke-width="1.5">
    <line x1="560" y1="100" x2="570" y2="100" />
    <line x1="560" y1="160" x2="570" y2="160" />
    <line x1="560" y1="220" x2="575" y2="220" />
    <line x1="560" y1="280" x2="570" y2="280" />
    <line x1="560" y1="340" x2="570" y2="340" />
    <line x1="560" y1="400" x2="575" y2="400" />
  </g>

  <!-- Clinical OSD (On Screen Display) Metadata -->
  <g fill="#38bdf8" font-family="monospace" font-size="12" font-weight="600">
    <text x="24" y="32">HOSPITAL/CLINIC SONAR</text>
    <text x="24" y="50" fill="#94a3b8">PROBE: ${probeType}</text>
    <text x="24" y="68" fill="#94a3b8">FREQ: 3.5 - 5.0 MHz</text>
    <text x="24" y="86" fill="#94a3b8">GAIN: ${gain} dB</text>
    <text x="24" y="104" fill="#94a3b8">DEPTH: ${depth} cm</text>
  </g>

  <g fill="#e2e8f0" font-family="monospace" font-size="12" text-anchor="end">
    <text x="616" y="32" fill="#34d399">TIS &lt; 0.4  TIB &lt; 0.4</text>
    <text x="616" y="50" fill="#94a3b8">FPS: 38 Hz</text>
    <text x="616" y="68" fill="#94a3b8">DR: 65 dB</text>
  </g>

  <!-- Title / Anatomy Banner at the bottom -->
  <rect x="20" y="432" width="600" height="36" rx="4" fill="#0f172a" opacity="0.85" stroke="#334155" stroke-width="1" />
  <text x="320" y="456" fill="#f8fafc" font-family="'Cairo', sans-serif" font-size="14" font-weight="bold" text-anchor="middle">
    ${title}
  </text>
</svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

export const SAMPLE_SONAR_SCANS = [
  {
    id: 'sample_scan_1',
    name: 'Right_Kidney_Longitudinal.jpg',
    url: createSonarSvg('فحص الكلى اليمنى (Right Kidney - Long)', 'C5-1 Convex', '14.0', '58'),
    tag: 'Right Kidney',
    timestamp: Date.now() - 3600000 * 2
  },
  {
    id: 'sample_scan_2',
    name: 'Liver_Gallbladder_View.jpg',
    url: createSonarSvg('فحص الكبد والمرارة (Liver &amp; GB View)', 'C5-1 Convex', '16.0', '62'),
    tag: 'Gallbladder',
    timestamp: Date.now() - 3600000 * 1.5
  },
  {
    id: 'sample_scan_3',
    name: 'Pelvic_Urinary_Bladder.jpg',
    url: createSonarSvg('المثانة البولية والحوض (Urinary Bladder)', 'C5-1 Convex', '12.0', '54'),
    tag: 'Bladder',
    timestamp: Date.now() - 3600000 * 1
  },
  {
    id: 'sample_scan_4',
    name: 'Spleen_Span_Measurement.jpg',
    url: createSonarSvg('قياس أبعاد الطحال (Spleen Measurement)', 'C5-1 Convex', '15.0', '60'),
    tag: 'Spleen',
    timestamp: Date.now() - 3600000 * 0.8
  },
  {
    id: 'sample_scan_5',
    name: 'Thyroid_Gland_Transverse.jpg',
    url: createSonarSvg('الغدة الدرقية مقطع عرضي (Thyroid Transverse)', 'L12-3 Linear', '4.0', '66'),
    tag: 'Thyroid',
    timestamp: Date.now() - 3600000 * 0.5
  },
  {
    id: 'sample_scan_6',
    name: 'Doppler_Vascular_Flow.jpg',
    url: createSonarSvg('تدفق الدوبلر الوعائي (Color Doppler Flow)', 'C5-1 Vascular', '10.0', '52'),
    tag: 'Doppler Flow',
    timestamp: Date.now() - 3600000 * 0.2
  }
];
