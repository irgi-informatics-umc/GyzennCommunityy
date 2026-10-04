const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getFiles(dir, exts) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) results = results.concat(getFiles(file, exts));
    else if (!exts || exts.some(ext => file.endsWith(ext))) results.push(file);
  });
  return results;
}

// 1. Ambil semua class dari src/**/*.astro dan public/assets/js/**
const astroFiles = getFiles('src', ['.astro']);
const jsFiles = getFiles('public/assets/js', ['.js']);

const usedClasses = new Set();

function extractClassesFromAstro(content) {
  // class="..." atau class={`...`}
  const classMatches = content.matchAll(/class=(?:["']([^"']*)["']|{`([^`]*)`}|{([^}]*)})/g);
  for (const m of classMatches) {
    const raw = (m[1] || m[2] || m[3] || '');
    // Pecah string, abaikan ekspresi JS ternari / template interpolasi
    const tokens = raw.replace(/\${[^}]*}/g, ' ').split(/[\s'"`?:]+/);
    tokens.forEach(t => {
      t = t.trim();
      if (t && /^[a-zA-Z0-9_\-]+$/.test(t) && !['true', 'false', 'undefined', 'null', 'modpack', 'index'].includes(t)) {
        usedClasses.add(t);
      }
    });
  }
}

function extractClassesFromJS(content) {
  // classList.add / remove / toggle
  const clMatches = content.matchAll(/\.classList\.(?:add|remove|toggle|contains)\(([^)]+)\)/g);
  for (const m of clMatches) {
    m[1].split(',').forEach(arg => {
      const cleaned = arg.replace(/['"\s]/g, '');
      if (cleaned && /^[a-zA-Z0-9_\-]+$/.test(cleaned)) usedClasses.add(cleaned);
    });
  }
  // class="..." dalam template string
  const strMatches = content.matchAll(/class=["']([^"']+)["']/g);
  for (const m of strMatches) {
    m[1].split(/\s+/).forEach(c => {
      if (c && /^[a-zA-Z0-9_\-]+$/.test(c)) usedClasses.add(c);
    });
  }
}

astroFiles.forEach(f => extractClassesFromAstro(fs.readFileSync(f, 'utf8')));
jsFiles.forEach(f => extractClassesFromJS(fs.readFileSync(f, 'utf8')));

// 2. Kumpulkan semua aturan CSS yang ada sekarang di src/styles/**/*.css
const currentCssFiles = getFiles('src/styles', ['.css']);
let currentCssCombined = '';
currentCssFiles.forEach(f => {
  currentCssCombined += fs.readFileSync(f, 'utf8') + '\n';
});

// Ambil semua selector class dari CSS sekarang
const currentDefinedClasses = new Set();
const cssClassMatches = currentCssCombined.matchAll(/\.([a-zA-Z0-9_\-]+)/g);
for (const m of cssClassMatches) {
  currentDefinedClasses.add(m[1]);
}

// 3. Kumpulkan semua aturan CSS lama dari HEAD~1
let oldCssCombined = '';
['src/styles/global.css', 'src/styles/pages/home.css', 'src/styles/pages/modpacks.css', 'src/styles/pages/komunitas.css', 'src/styles/pages/zalith.css', 'src/styles/pages/casda.css'].forEach(f => {
  try {
    oldCssCombined += execSync('git show HEAD~1:' + f, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }) + '\n';
  } catch (e) {}
});

const oldDefinedClasses = new Set();
const oldClassMatches = oldCssCombined.matchAll(/\.([a-zA-Z0-9_\-]+)/g);
for (const m of oldClassMatches) {
  oldDefinedClasses.add(m[1]);
}

// 4. Analisis:
// a) Class yang dipakai di template/JS tapi TIDAK didefinisikan di CSS saat ini sama sekali
const missingInCurrent = [];
// b) Class yang pernah ada di CSS lama (HEAD~1) dan MASIH dipakai di template/JS, tetapi hilang dari CSS sekarang
const lostOldClasses = [];

usedClasses.forEach(cls => {
  // Abaikan font-awesome icons seperti fa-*, fa-*
  if (cls.startsWith('fa-')) return;
  
  if (!currentDefinedClasses.has(cls)) {
    missingInCurrent.push(cls);
    if (oldDefinedClasses.has(cls)) {
      lostOldClasses.push(cls);
    }
  }
});

console.log('Total Class Unik Dipakai di Template/JS:', usedClasses.size);
console.log('Total Class Didefinisikan di CSS Sekarang:', currentDefinedClasses.size);
console.log('Total Class Didefinisikan di CSS Lama (HEAD~1):', oldDefinedClasses.size);

console.log('\n=== CLASS YANG DIPAKAI TAPI TIDAK MEMILIKI ATURAN CSS SAAT INI ===');
console.log(missingInCurrent.sort().join('\n') || '(Tidak ada)');

console.log('\n=== CLASS LAMA (DARI HEAD~1) YANG HILANG DARI CSS TAPI MASIH DIPAKAI ===');
console.log(lostOldClasses.sort().join('\n') || '(Tidak ada)');
