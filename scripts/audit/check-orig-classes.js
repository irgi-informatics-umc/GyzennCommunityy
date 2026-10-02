import fs from 'fs';
import path from 'path';

const origCss = fs.readFileSync('./style.css', 'utf8');

const selectors = new Set();
const matches = origCss.match(/\.[\w-]+/g) || [];
matches.forEach(m => selectors.add(m.substring(1)));

console.log('Total unique CSS class selectors in original style.css:', selectors.size);

function getUsedClasses(dir, classSet = new Set()) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getUsedClasses(filePath, classSet);
    } else if (file.endsWith('.astro') || file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const classMatches = content.match(/class(Name)?\s*=\s*["'`]([^"'`]+)["'`]/g) || [];
      classMatches.forEach(m => {
        const val = m.replace(/class(Name)?\s*=\s*["'`]/, '').replace(/["'`]$/, '');
        val.split(/\s+/).forEach(c => {
          if (c && !c.includes('{') && !c.includes('$') && !c.includes('=')) classSet.add(c.trim());
        });
      });
      const jsMatches = content.match(/classList\.(add|remove|toggle|contains)\(['"]([^'"]+)['"]\)/g) || [];
      jsMatches.forEach(m => {
        const c = m.replace(/classList\.(add|remove|toggle|contains)\(['"]/, '').replace(/['"]\)/, '');
        classSet.add(c.trim());
      });
    }
  });
  return classSet;
}

const usedClasses = getUsedClasses('./src');
getUsedClasses('./public', usedClasses);

const missingFromOrigCss = [];
usedClasses.forEach(c => {
  if (!c.startsWith('fa') && !selectors.has(c)) {
    missingFromOrigCss.push(c);
  }
});

console.log('Classes used in HTML/Astro/JS that NEVER existed in original style.css (Total: ' + missingFromOrigCss.length + '):');
console.log(missingFromOrigCss);
