import fs from 'fs';
import path from 'path';

const origCss = fs.readFileSync('./style.css', 'utf8');

// Extract all class selectors from original style.css
const classMatches = origCss.match(/\.[\w-]+/g) || [];
const origClasses = new Set(classMatches.map(c => c.substring(1)));

console.log('Total unique classes in original style.css:', origClasses.size);

// Read all new CSS files in src/styles/
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.css')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const newCssFiles = getAllFiles('./src/styles');
let newCssCombined = '';
newCssFiles.forEach(f => {
  newCssCombined += fs.readFileSync(f, 'utf8') + '\n';
});

const newClassMatches = newCssCombined.match(/\.[\w-]+/g) || [];
const newClasses = new Set(newClassMatches.map(c => c.substring(1)));

console.log('Total unique classes in new CSS files:', newClasses.size);

const missingInNew = [];
origClasses.forEach(c => {
  if (!newClasses.has(c)) {
    missingInNew.push(c);
  }
});

console.log('Classes present in original style.css BUT missing in new CSS files (Total: ' + missingInNew.length + '):');
console.log(missingInNew);
