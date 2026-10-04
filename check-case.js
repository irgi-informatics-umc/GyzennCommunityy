import fs from 'fs';
import path from 'path';

function getAllFiles(dir, fileList = []) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) getAllFiles(full, fileList);
    else fileList.push(full);
  });
  return fileList;
}

const distDir = path.join(process.cwd(), 'dist');
const htmlFiles = getAllFiles(distDir).filter(f => f.endsWith('.html'));

const allActualFiles = new Set(getAllFiles(distDir).map(f => path.relative(distDir, f).replace(/\\/g, '/')));

let errors = [];

htmlFiles.forEach(htmlFile => {
  const content = fs.readFileSync(htmlFile, 'utf8');
  // Simple regex to grab href, src, url()
  const regex = /(?:href|src)=["']([^"']+)["']|url\(["']?([^"')]+)["']?\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    let link = match[1] || match[2];
    if (!link || link.startsWith('http') || link.startsWith('data:') || link.startsWith('#') || link.startsWith('mailto:')) continue;
    
    // Strip query strings/hashes
    link = link.split('?')[0].split('#')[0];
    
    if (link.startsWith('/')) {
      link = link.substring(1);
    }
    
    // Convert to index.html if it's a directory
    let target = link;
    if (target === '' || target.endsWith('/')) target += 'index.html';
    
    // Check if exists case-sensitively
    if (!allActualFiles.has(target)) {
       // if we append index.html and it matches, that's fine
       if (!allActualFiles.has(target + '/index.html') && !allActualFiles.has(target + 'index.html')) {
          errors.push(`File ${htmlFile}: Link to /${link} not found with exact case.`);
       }
    }
  }
});

if (errors.length === 0) {
  console.log("All internal links match files exactly (case-sensitive).");
} else {
  console.log("Case sensitivity errors found:");
  errors.forEach(e => console.log(e));
}

