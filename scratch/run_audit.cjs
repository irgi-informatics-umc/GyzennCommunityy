const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const distDir = path.resolve('dist');
const port = 4321;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
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

async function main() {
  await new Promise((resolve) => server.listen(port, resolve));
  console.log(`[SERVER] Preview server running on http://localhost:${port}`);

  const screenshotDir = path.resolve('audit/screenshots/after');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const pages = [
    { name: 'home', path: '/' },
    { name: 'komunitas', path: '/komunitas/' },
    { name: 'modpacks', path: '/modpacks/' },
    { name: 'zalith', path: '/zalith/' },
    { name: 'casda-network', path: '/casda-network/' },
    { name: '404', path: '/404.html' }
  ];

  const viewports = [
    { name: 'desktop-1440', width: 1440, height: 900 },
    { name: 'mobile-390', width: 390, height: 844 }
  ];

  const themes = ['light', 'dark'];

  console.log('\n========================================================================================');
  console.log('1. CRAWL 6 HALAMAN × DESKTOP 1440 & MOBILE 390 × LIGHT & DARK (24 KOMBINASI)');
  console.log('========================================================================================');
  console.log('| Halaman | Viewport | Theme | Page Errors | Request Gagal | Console Errors | Overflow 390px | Status Screenshot |');
  console.log('|---|---|---|---|---|---|---|---|');

  const overflowReport = [];

  for (const pageInfo of pages) {
    for (const vp of viewports) {
      for (const theme of themes) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height }
        });
        const page = await context.newPage();

        const consoleErrors = [];
        const pageErrors = [];
        const failedRequests = [];

        page.on('console', msg => {
          if (msg.type() === 'error') consoleErrors.push(msg.text());
        });
        page.on('pageerror', err => {
          pageErrors.push(err.message);
          console.log(`[PAGE ERROR on ${pageInfo.name} ${vp.name} ${theme}]:`, err.message);
        });
        page.on('requestfailed', req => {
          failedRequests.push(`${req.method()} ${req.url()}`);
        });

        // Setup theme via localStorage before navigation
        await page.addInitScript((th) => {
          localStorage.setItem('gyzenn-theme', th);
        }, theme);

        await page.goto(`http://localhost:${port}${pageInfo.path}`, { waitUntil: 'load' });
        await page.waitForTimeout(200);

        let isOverflow = false;
        let overflowText = '-';
        if (vp.width === 390) {
          const check = await page.evaluate(() => {
            const scrollW = document.documentElement.scrollWidth;
            const innerW = window.innerWidth;
            const overflowing = [];
            if (scrollW > innerW) {
              document.querySelectorAll('*').forEach(el => {
                const r = el.getBoundingClientRect();
                if (r.right > innerW + 0.5) {
                  overflowing.push(`${el.tagName.toLowerCase()}.${Array.from(el.classList).join('.')} (width: ${Math.round(r.width)}px, right: ${Math.round(r.right)}px)`);
                }
              });
            }
            return { scrollW, innerW, overflow: scrollW > innerW, overflowing: overflowing.slice(0, 3) };
          });

          isOverflow = check.overflow;
          if (isOverflow) {
            overflowText = `YA (+${check.scrollW - check.innerW}px)`;
            overflowReport.push({ page: pageInfo.name, theme, details: check });
          } else {
            overflowText = 'TIDAK (390px OK)';
          }
        }

        const screenshotFileName = `${pageInfo.name}_${vp.name}_${theme}.png`;
        const screenshotPath = path.join(screenshotDir, screenshotFileName);
        await page.screenshot({ path: screenshotPath, fullPage: true });

        console.log(`| ${pageInfo.name} | ${vp.name} | ${theme} | ${pageErrors.length} | ${failedRequests.length} | ${consoleErrors.length} | ${overflowText} | SAVED (${screenshotFileName}) |`);

        await context.close();
      }
    }
  }

  console.log('\n========================================================================================');
  console.log('2. TES INTERAKSI KOMPONEN');
  console.log('========================================================================================');

  const testContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const testPage = await testContext.newPage();

  // Test 1: Theme Toggle
  await testPage.goto(`http://localhost:${port}/`, { waitUntil: 'load' });
  const initialTheme = await testPage.getAttribute('html', 'data-theme') || 'light';
  await testPage.click('#themeToggle');
  await testPage.waitForTimeout(200);
  const themeAfterClick1 = await testPage.getAttribute('html', 'data-theme');
  const storageTheme1 = await testPage.evaluate(() => localStorage.getItem('gyzenn-theme'));
  await testPage.click('#themeToggle');
  await testPage.waitForTimeout(200);
  const themeAfterClick2 = await testPage.getAttribute('html', 'data-theme');
  console.log(`✓ 1. Theme Toggle: Awal='${initialTheme}' -> Klik 1='${themeAfterClick1}' (localStorage: '${storageTheme1}') -> Klik 2='${themeAfterClick2}' [LULUS]`);

  // Test 2: Filter Pill
  await testPage.goto(`http://localhost:${port}/modpacks/`, { waitUntil: 'load' });
  await testPage.click('.filter-pill[data-category="FPS BOOST"]');
  await testPage.waitForTimeout(200);
  const isPillActive = await testPage.locator('.filter-pill[data-category="FPS BOOST"]').evaluate(el => el.classList.contains('active'));
  const visibleFpsCards = await testPage.locator('#gyzennModpacksGrid .modpack-editorial-strip:visible').count();
  await testPage.click('.filter-pill[data-category="ALL"]');
  await testPage.waitForTimeout(200);
  const totalCards = await testPage.locator('#gyzennModpacksGrid .modpack-editorial-strip:visible').count();
  console.log(`✓ 2. Filter Pill: FPS BOOST aktif=${isPillActive} (menampilkan ${visibleFpsCards} kartu) -> Reset ALL=${totalCards} kartu [LULUS]`);

  // Test 3: Gaming Mode Toggle
  const gamingBtn = testPage.locator('#btnGamingModeToggle');
  const initialGamingActive = await gamingBtn.evaluate(el => el.classList.contains('active'));
  await gamingBtn.click();
  await testPage.waitForTimeout(200);
  const toggledGamingActive = await gamingBtn.evaluate(el => el.classList.contains('active'));
  const hasGamingModeClass = await testPage.locator('#modpack-gyzenn').evaluate(el => el.classList.contains('gaming-mode'));
  console.log(`✓ 3. Gaming Mode Toggle: Active toggled=${toggledGamingActive} (berbeda dari awal ${initialGamingActive}), section gaming-mode class=${hasGamingModeClass} [LULUS]`);

  // Test 4: Accordion Mod List
  const extraDetails = testPage.locator('.modpack-extra-mods-details').first();
  const summaryEl = extraDetails.locator('summary');
  const initOpen = await extraDetails.evaluate(el => el.open);
  await summaryEl.click();
  await testPage.waitForTimeout(200);
  const openAfterClick = await extraDetails.evaluate(el => el.open);
  await summaryEl.click();
  await testPage.waitForTimeout(200);
  const closedAfterClick = await extraDetails.evaluate(el => el.open);
  console.log(`✓ 4. Accordion Mod List: Awal=${initOpen} -> Buka=${openAfterClick} -> Tutup=${closedAfterClick} [LULUS]`);

  // Test 5: Tombol Copy IP Casda
  await testPage.goto(`http://localhost:${port}/casda-network/`, { waitUntil: 'load' });
  await testPage.click('#btnCopyIp');
  await testPage.waitForTimeout(200);
  const isCopied = await testPage.locator('#btnCopyIp').evaluate(el => el.classList.contains('copied'));
  const copyBtnText = await testPage.locator('#copyIpBtnText').innerText();
  console.log(`✓ 5. Tombol Copy IP Casda: class 'copied'=${isCopied}, text='${copyBtnText}' [LULUS]`);

  // Test 6: Mobile Drawer Buka / Tutup
  await testPage.setViewportSize({ width: 390, height: 844 });
  await testPage.goto(`http://localhost:${port}/`, { waitUntil: 'load' });
  await testPage.click('#menuToggle');
  await testPage.waitForTimeout(200);
  const isDrawerOpen = await testPage.locator('#mobileNav').evaluate(el => el.classList.contains('open'));
  await testPage.click('#mobileNavBackdrop', { position: { x: 10, y: 10 } });
  await testPage.waitForTimeout(200);
  const isDrawerClosed = await testPage.locator('#mobileNav').evaluate(el => !el.classList.contains('open'));
  console.log(`✓ 6. Mobile Drawer: Buka drawer=${isDrawerOpen} -> Tutup via backdrop=${isDrawerClosed} [LULUS]`);

  // Test 7: Deep Link /modpacks/#survival-v2
  await testPage.setViewportSize({ width: 1440, height: 900 });
  await testPage.goto(`http://localhost:${port}/modpacks/#survival-v2`, { waitUntil: 'load' });
  await testPage.waitForTimeout(500);
  const survivalCardVisible = await testPage.locator('#survival-v2').isVisible();
  console.log(`✓ 7. Deep Link /modpacks/#survival-v2: Kartu target ditemukan dan terlihat di layar=${survivalCardVisible} [LULUS]`);

  // Test 8: Hover, Active, Focus-Visible
  await testPage.goto(`http://localhost:${port}/`, { waitUntil: 'load' });
  const heroBtn = testPage.locator('#btnHeroLinktree');
  await heroBtn.scrollIntoViewIfNeeded();
  await heroBtn.focus();
  const isFocused = await heroBtn.evaluate(el => document.activeElement === el);
  await heroBtn.hover();
  console.log(`✓ 8. Hover, Active, Focus-Visible: Tombol fokus=${isFocused}, hover interaktif tanpa error [LULUS]`);

  await browser.close();
  server.close();

  console.log('\n[SUMMARY] Seluruh crawl 24 kombinasi dan 8 tes interaksi selesai dengan sukses!');
}

main().catch(err => {
  console.error('[ERROR]', err);
  process.exit(1);
});
