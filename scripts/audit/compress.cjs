const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetImages = [
  'gyzen-optimized.png',
  'preview.png',
  'casda.jpg',
  'server-mania.png',
  'cobraserver.jpg'
];

async function convert() {
  for (const imgName of targetImages) {
    const srcPath = path.join('public/assets/img', imgName);
    const ext = path.extname(imgName);
    const base = path.basename(imgName, ext);
    const outName = base + '.webp';
    const outPath = path.join('public/assets/img', outName);
    
    const origSize = fs.statSync(srcPath).size;
    
    let quality = 80;
    let buffer = await sharp(srcPath).webp({ quality }).toBuffer();
    while (buffer.length > 300 * 1024 && quality > 30) {
      quality -= 10;
      buffer = await sharp(srcPath).webp({ quality }).toBuffer();
    }
    fs.writeFileSync(outPath, buffer);
    const newSize = fs.statSync(outPath).size;
    console.log(imgName + ' (' + (origSize/1024).toFixed(1) + ' KB) -> ' + outName + ' (' + (newSize/1024).toFixed(1) + ' KB) [q=' + quality + ']');
  }
}

convert().catch(err => {
  console.error(err);
  process.exit(1);
});
