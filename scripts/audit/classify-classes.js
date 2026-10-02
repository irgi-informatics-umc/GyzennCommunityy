import fs from 'fs';

const origCss = fs.readFileSync('./style.css', 'utf8');
const selectors = new Set();
(origCss.match(/\.[\w-]+/g) || []).forEach(m => selectors.add(m.substring(1)));

const html = fs.readFileSync('./index.html', 'utf8');
const script = fs.readFileSync('./script.js', 'utf8');

// Function to find used classes in content
function getClassNames(content) {
  const set = new Set();
  const matches = content.match(/class(Name)?\s*=\s*["'`]([^"'`]+)["'`]/g) || [];
  matches.forEach(m => {
    const val = m.replace(/class(Name)?\s*=\s*["'`]/, '').replace(/["'`]$/, '');
    val.split(/\s+/).forEach(c => {
      if (c && !c.includes('{') && !c.includes('$') && !c.includes('=') && !c.startsWith('fa')) {
        set.add(c.trim());
      }
    });
  });
  return set;
}

const origUsedClasses = new Set([...getClassNames(html), ...getClassNames(script)]);

const list = [
  'brand-text', 'mobile-nav-footer', 'hero-word', 'section-server', 'server-img-col',
  'server-badges-row', 'hero-container', 'wa-ring', 'tiktok-ring', 'retro-handwriting',
  'btn-hero-main', 'btn-hero-sub', 'home-teaser-grid', 'teaser-card', 'teaser-card-icon',
  'teaser-card-title', 'teaser-card-desc', 'btn-saweria-burst', 'section-community',
  'counter-animate', 'section-discord', 'modpack-subnav-sticky', 'modpack-subnav-chips',
  'subnav-chip', 'section-modpacks', 'derivative-card', 'derivative-brand',
  'derivative-info-poster', 'credit-label', 'credit-subtext', 'derivative-download-wrapper',
  'resourcepack-card', 'mode-text', 'mode-status', 'modpack-archive-details',
  'archive-grid', 'section-zalith', 'zalith-main-card', 'status-percent-text'
];

console.log('=== CLASSIFICATION OF 39 EXTRA CLASSES ===');
list.forEach((c, i) => {
  const inOrigCode = origUsedClasses.has(c);
  console.log(`${i+1}. .${c} -> ${inOrigCode ? '[Group i: Hook/Element in Original Code without dedicated .class rule]' : '[Group ii: New Element Created for Multi-Page Architecture]'}`);
});
