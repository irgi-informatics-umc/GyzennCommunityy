import fs from 'fs';

const origCss = fs.readFileSync('./style.css', 'utf8');

fs.writeFileSync('./src/styles/base.css', `/* Base CSS Reset & Theme Tokens */\n` + origCss);
fs.writeFileSync('./src/styles/layout.css', `/* Layout CSS System */\n` + origCss);
fs.writeFileSync('./src/styles/components.css', `/* Components CSS System */\n` + origCss);

console.log('Successfully copied full original style.css into all modular CSS files!');
