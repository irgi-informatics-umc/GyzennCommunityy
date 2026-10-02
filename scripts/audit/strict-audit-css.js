import fs from 'fs';
import path from 'path';

// Extract all class selectors from original style.css
const origCss = fs.readFileSync('./style.css', 'utf8');

// Helper to clean comments from CSS string
function removeComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

const origCssClean = removeComments(origCss);

// Extract rules blocks from original style.css
// Matches selector { rules }
const ruleRegex = /([^{}]+)\{([^{}]+)\}/g;
let match;
const origRuleMap = new Map();

while ((match = ruleRegex.exec(origCssClean)) !== null) {
  const selectors = match[1].trim();
  const body = match[2].trim();
  origRuleMap.set(selectors, body);
}

console.log('Total CSS rule blocks parsed from style.css:', origRuleMap.size);

// Get used classes from src/ (HTML, Astro, JS)
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
          if (c && !c.includes('{') && !c.includes('$')) classSet.add(c.trim());
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

// Filter out font-awesome icons
const usedCustomClasses = Array.from(usedClasses).filter(c => !c.startsWith('fa-') && !c.startsWith('fa'));

console.log('Custom used classes in project:', usedCustomClasses.length);

// Read new CSS combined
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
const newClassesSet = new Set(newClassMatches.map(c => c.substring(1)));

const missingCustomClasses = usedCustomClasses.filter(c => !newClassesSet.has(c));

console.log('Missing Custom Used Classes in src/styles/ (Total: ' + missingCustomClasses.length + '):');
console.log(missingCustomClasses);
