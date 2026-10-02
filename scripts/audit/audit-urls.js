import fs from 'fs';

const html = fs.readFileSync('./index.html', 'utf8');
const script = fs.readFileSync('./script.js', 'utf8');
const modpacks = JSON.parse(fs.readFileSync('./public/assets/data/modpacks.json', 'utf8'));

const urlRegex = /(https?:\/\/(www\.)?(mediafire\.com|drive\.google\.com|sfile\.co)[^\s\"'\<\>]+)/g;
const originalUrls = new Set([...(html.match(urlRegex) || []), ...(script.match(urlRegex) || [])]);

console.log('Original Unique Download URLs Found:', originalUrls.size);

let jsonUrls = [];
modpacks.forEach(m => {
  (m.downloads || []).forEach(d => jsonUrls.push({ id: m.id, url: d.url }));
  if (m.mrpackUrl) jsonUrls.push({ id: m.id, url: m.mrpackUrl });
  if (m.zipUrl) jsonUrls.push({ id: m.id, url: m.zipUrl });
  if (m.downloadUrl) jsonUrls.push({ id: m.id, url: m.downloadUrl });
});

console.log('JSON Download URLs Total:', jsonUrls.length);

let notFound = [];
jsonUrls.forEach(item => {
  if (!originalUrls.has(item.url)) {
    notFound.push(item);
  }
});

console.log('URLs in JSON not found in Original:', notFound);
