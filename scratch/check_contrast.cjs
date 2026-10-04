// WCAG 2.1 Contrast Ratio Calculator
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const num = parseInt(hex, 16);
  return [num >> 16, (num >> 8) & 255, num & 255];
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrast(hex1, hex2) {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Representative color tokens from CSS
// Light theme tokens
const light = {
  bg: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  muted: '#475569',
  border: '#0f172a',
  btnPrimaryBg: '#0f172a',
  btnPrimaryText: '#ffffff',
  btnSecondaryBg: '#ffffff',
  btnSecondaryText: '#0f172a',
  badgeBg: '#ffffff',
  badgeText: '#0f172a',
  accentPink: '#ff6b8a',
  accentBlue: '#3da5ff',
  accentGreen: '#00dc7a',
  accentOrange: '#ffb300',
  gradPastelLav: '#d8b4fe',
  gradPastelPink: '#f9a8d4'
};

// Dark theme tokens
const dark = {
  bg: '#090d16',
  surface: '#111827',
  surfaceCard: '#151d2e',
  text: '#f1f5f9',
  muted: '#cbd5e1',
  border: '#334155',
  btnPrimaryBg: '#38bdf8',
  btnPrimaryText: '#090d16',
  btnSecondaryBg: '#1e293b',
  btnSecondaryText: '#f8fafc',
  badgeBg: '#1e293b',
  badgeText: '#38bdf8',
  accentPink: '#f43f5e',
  accentBlue: '#38bdf8',
  accentGreen: '#34d399',
  accentOrange: '#fbbf24'
};

const pairs = [
  // LIGHT MODE
  { theme: 'Light', pair: 'Teks Utama / Background', fg: light.text, bg: light.bg },
  { theme: 'Light', pair: 'Teks Utama / Card Surface', fg: light.text, bg: light.surface },
  { theme: 'Light', pair: 'Muted Text / Card Surface', fg: light.muted, bg: light.surface },
  { theme: 'Light', pair: 'Muted Text / Background', fg: light.muted, bg: light.bg },
  { theme: 'Light', pair: 'Tombol Primer (Teks/Bg)', fg: light.btnPrimaryText, bg: light.btnPrimaryBg },
  { theme: 'Light', pair: 'Tombol Sekunder (Teks/Bg)', fg: light.btnSecondaryText, bg: light.btnSecondaryBg },
  { theme: 'Light', pair: 'Badge Pill (Teks/Bg)', fg: light.badgeText, bg: light.badgeBg },
  { theme: 'Light', pair: 'Teks Navy di atas Gradien Pastel Lavender', fg: '#0f172a', bg: light.gradPastelLav },
  { theme: 'Light', pair: 'Teks Navy di atas Gradien Pastel Pink', fg: '#0f172a', bg: light.gradPastelPink },
  { theme: 'Light', pair: 'Tile Ikon Putih di atas Gradien Pink Tua (#d81b60)', fg: '#ffffff', bg: '#d81b60' },
  { theme: 'Light', pair: 'Tile Ikon Putih di atas Gradien Biru Tua (#0077b6)', fg: '#ffffff', bg: '#0077b6' },
  { theme: 'Light', pair: 'Tile Ikon Hitam di atas Gradien Oranye (#ffb300)', fg: '#0f172a', bg: '#ffb300' },
  { theme: 'Light', pair: 'Tile Ikon Hitam di atas Gradien Hijau (#00dc7a)', fg: '#0f172a', bg: '#00dc7a' },

  // DARK MODE
  { theme: 'Dark', pair: 'Teks Utama / Background', fg: dark.text, bg: dark.bg },
  { theme: 'Dark', pair: 'Teks Utama / Card Surface', fg: dark.text, bg: dark.surfaceCard },
  { theme: 'Dark', pair: 'Muted Text / Card Surface', fg: dark.muted, bg: dark.surfaceCard },
  { theme: 'Dark', pair: 'Muted Text / Background', fg: dark.muted, bg: dark.bg },
  { theme: 'Dark', pair: 'Tombol Primer Cyan (Teks/Bg)', fg: dark.btnPrimaryText, bg: dark.btnPrimaryBg },
  { theme: 'Dark', pair: 'Tombol Sekunder (Teks/Bg)', fg: dark.btnSecondaryText, bg: dark.btnSecondaryBg },
  { theme: 'Dark', pair: 'Badge Pill Cyan (Teks/Bg)', fg: dark.badgeText, bg: dark.badgeBg }
];

console.log('| Tema | Pasangan Warna | Foreground | Background | Rasio Kontras | Status WCAG AA (Normal >= 4.5:1) |');
console.log('|---|---|---|---|---|---|');

let allPassed = true;
for (const p of pairs) {
  const ratio = getContrast(p.fg, p.bg);
  const passed = ratio >= 4.5;
  if (!passed) allPassed = false;
  console.log(`| ${p.theme} | ${p.pair} | \`${p.fg}\` | \`${p.bg}\` | **${ratio.toFixed(2)}:1** | ${passed ? '✓ LULUS (AA)' : '✗ GAGAL'} |`);
}

console.log(`\nHasil Akhir: ${allPassed ? 'SEMUA PASANGAN LULUS WCAG AA (100%)' : 'ADA YANG GAGAL'}`);
