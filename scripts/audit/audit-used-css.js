import fs from 'fs';
import path from 'path';

// Extract all class names actually used across HTML, Astro, and JS files in src/ and public/
function getUsedClasses(dir, classSet = new Set()) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getUsedClasses(filePath, classSet);
    } else if (file.endsWith('.astro') || file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Match class="..." or class:list="..." or className="..."
      const classAttrMatches = content.match(/(class|className)\s*=\s*["'`]([^"'`]+)["'`]/g) || [];
      classAttrMatches.forEach(m => {
        const val = m.replace(/(class|className)\s*=\s*["'`]/, '').replace(/["'`]$/, '');
        val.split(/\s+/).forEach(c => {
          if (c && !c.includes('{') && !c.includes('$')) {
            classSet.add(c.trim());
          }
        });
      });

      // Match classList.add('...'), classList.toggle('...'), querySelector('....')
      const jsClassMatches = content.match(/classList\.(add|remove|toggle|contains)\(['"]([^'"]+)['"]\)/g) || [];
      jsClassMatches.forEach(m => {
        const c = m.replace(/classList\.(add|remove|toggle|contains)\(['"]/, '').replace(/['"]\)/, '');
        classSet.add(c.trim());
      });
    }
  });
  return classSet;
}

const usedClasses = getUsedClasses('./src');
getUsedClasses('./public', usedClasses);

console.log('Total unique classes used in HTML/Astro/JS:', usedClasses.size);

// Check which used classes are missing in src/styles/
function getAllCssFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllCssFiles(filePath, fileList);
    } else if (file.endsWith('.css')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const newCssFiles = getAllCssFiles('./src/styles');
let newCssCombined = '';
newCssFiles.forEach(f => {
  newCssCombined += fs.readFileSync(f, 'utf8') + '\n';
});

const newClassMatches = newCssCombined.match(/\.[\w-]+/g) || [];
const newClasses = new Set(newClassMatches.map(c => c.substring(1)));

const missingUsedClasses = [];
usedClasses.forEach(c => {
  if (!newClasses.has(c)) {
    missingUsedClasses.push(c);
  }
});

console.log('USED Classes in HTML/Astro/JS missing in src/styles/ (Total: ' + missingUsedClasses.length + '):');
console.log(missingUsedClasses);
