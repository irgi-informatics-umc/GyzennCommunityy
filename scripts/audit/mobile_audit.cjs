const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const distDir = path.resolve('dist');
const port = 4455;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0].split('#')[0]);
  let filePath = path.join(distDir, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  if (!fs.existsSync(filePath)) {
    filePath = path.join(distDir, '404.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading file');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

async function runAudit() {
  await new Promise(resolve => server.listen(port, resolve));
  console.log('Static preview server running on port ' + port);

  const screenshotDir = path.resolve('scratch/screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    try {
      browser = await chromium.launch({ headless: true });
    } catch (err) {
      console.error('Browser launch failed:', err.message);
      server.close();
      return;
    }
  }

  const viewports = [320, 360, 390, 430];
  const themes = ['light', 'dark'];

  console.log('\n--- TESTING HORIZONTAL OVERFLOW ACROSS VIEWPORTS ---');
  for (const width of viewports) {
    for (const theme of themes) {
      const page = await browser.newPage({ viewport: { width, height: 800 } });
      await page.goto(`http://localhost:${port}/modpacks/`, { waitUntil: 'domcontentloaded' });
      
      if (theme === 'dark') {
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
      } else {
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
      }

      await page.waitForTimeout(200);

      // Check scrollWidth vs clientWidth
      const overflow = await page.evaluate(() => {
        const docWidth = document.documentElement.clientWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const bodyScrollWidth = document.body.scrollWidth;
        
        // Find elements with right edge > docWidth
        const overflowingEls = [];
        const all = document.querySelectorAll('*');
        all.forEach(el => {
          // ignore ticker animation items that clip in overflow-hidden container
          if (el.closest('.retro-ticker-bar') || el.closest('.modpack-filters-scroll')) return;
          const rect = el.getBoundingClientRect();
          if (rect.right > docWidth + 1) {
            overflowingEls.push({
              tag: el.tagName,
              id: el.id,
              class: el.className,
              right: rect.right,
              docWidth
            });
          }
        });
        return {
          clientWidth: docWidth,
          scrollWidth,
          bodyScrollWidth,
          hasOverflow: scrollWidth > docWidth,
          overflowingEls: overflowingEls.slice(0, 5)
        };
      });

      console.log(`Viewport ${width}px [${theme}]: scrollWidth=${overflow.scrollWidth}, clientWidth=${overflow.clientWidth}, hasOverflow=${overflow.hasOverflow}`);
      if (overflow.hasOverflow) {
        console.log('  Elements exceeding right edge:', overflow.overflowingEls);
      }

      // Take screenshots for 390px
      if (width === 390) {
        // Gyzenn Vanilla++
        const vanillaEl = await page.$('#gyzenn-vanilla-plus-plus');
        if (vanillaEl) {
          await vanillaEl.screenshot({ path: path.join(screenshotDir, `card-vanilla-390-${theme}.png`) });
        }
        // Cobra Ultimized Remake 26.3
        const cobraEl = await page.$('#cobra-ultimize-remake-26-3');
        if (cobraEl) {
          await cobraEl.screenshot({ path: path.join(screenshotDir, `card-cobra-26-3-390-${theme}.png`) });
        }
        // Better Sound Java
        const soundEl = await page.$('#better-sound-java');
        if (soundEl) {
          await soundEl.screenshot({ path: path.join(screenshotDir, `card-better-sound-390-${theme}.png`) });
        }
      }

      await page.close();
    }
  }

  // Test functional features: Filter & Deep Link
  console.log('\n--- TESTING FUNCTIONALITY (FILTER & DEEP LINK) ---');
  const testPage = await browser.newPage({ viewport: { width: 390, height: 800 } });
  
  // 1. Deep link
  await testPage.goto(`http://localhost:${port}/modpacks/#gyzenn-vanilla-plus-plus`, { waitUntil: 'domcontentloaded' });
  await testPage.waitForTimeout(300);
  const targetInView = await testPage.evaluate(() => {
    const el = document.getElementById('gyzenn-vanilla-plus-plus');
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.top >= 0 && rect.top <= window.innerHeight;
  });
  console.log('Deep link #gyzenn-vanilla-plus-plus scrolled into view:', targetInView);

  // 2. Filter test
  await testPage.click('.filter-pill[data-category="SURVIVAL"]');
  await testPage.waitForTimeout(100);
  const survivalState = await testPage.evaluate(() => {
    const vanilla = document.getElementById('gyzenn-vanilla-plus-plus');
    const opt261 = document.getElementById('gyzenn-optimized-26-1');
    return {
      vanillaVisible: vanilla && getComputedStyle(vanilla).display !== 'none',
      opt261Visible: opt261 && getComputedStyle(opt261).display !== 'none'
    };
  });
  console.log('Filter SURVIVAL: Vanilla visible =', survivalState.vanillaVisible, '; Opt 26.1 visible =', survivalState.opt261Visible);

  // Reset to ALL
  await testPage.click('.filter-pill[data-category="ALL"]');
  await testPage.waitForTimeout(100);
  const allState = await testPage.evaluate(() => {
    const vanilla = document.getElementById('gyzenn-vanilla-plus-plus');
    const opt261 = document.getElementById('gyzenn-optimized-26-1');
    return {
      vanillaVisible: vanilla && getComputedStyle(vanilla).display !== 'none',
      opt261Visible: opt261 && getComputedStyle(opt261).display !== 'none'
    };
  });
  console.log('Filter ALL: Vanilla visible =', allState.vanillaVisible, '; Opt 26.1 visible =', allState.opt261Visible);

  // 3. Read more toggle test
  const readMoreTest = await testPage.evaluate(() => {
    const btn = document.querySelector('#gyzenn-vanilla-plus-plus .btn-read-more');
    const desc = document.querySelector('#gyzenn-vanilla-plus-plus .modpack-editorial-desc');
    if (!btn || !desc) return { found: false };
    const beforeExpanded = desc.classList.contains('is-expanded');
    btn.click();
    const afterExpanded = desc.classList.contains('is-expanded');
    return {
      found: true,
      beforeExpanded,
      afterExpanded,
      buttonText: btn.textContent.trim()
    };
  });
  console.log('Read more toggle:', readMoreTest);

  // 4. Verify Download URLs in DOM
  const urlsInDom = await testPage.evaluate(() => {
    const vanillaDl = Array.from(document.querySelectorAll('#gyzenn-vanilla-plus-plus .btn-card-action')).map(a => a.href);
    const soundDl = Array.from(document.querySelectorAll('#better-sound-java a.btn-resourcepack-download')).map(a => a.href);
    return {
      vanillaDl,
      soundDl
    };
  });
  console.log('DOM Download URLs:');
  console.log('  Vanilla++:', urlsInDom.vanillaDl);
  console.log('  Better Sound:', urlsInDom.soundDl);

  await testPage.close();
  await browser.close();
  server.close();
  console.log('\nAudit complete.');
}

runAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
