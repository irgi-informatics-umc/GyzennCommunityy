const cp = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = cp.spawn(chromePath, [
  '--remote-debugging-port=9222',
  '--headless',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check'
]);

function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    const WebSocket = global.WebSocket;
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function main() {
  await wait(1500);
  const targets = await getJson('http://127.0.0.1:9222/json/list');
  let target = targets.find(t => t.type === 'page');
  if (!target) {
    await getJson('http://127.0.0.1:9222/json/new?http://localhost:4321/modpacks/');
    const updatedTargets = await getJson('http://127.0.0.1:9222/json/list');
    target = updatedTargets.find(t => t.type === 'page');
  }

  const client = new CDPClient(target.webSocketDebuggerUrl);
  await client.connect();

  await client.send('Page.enable');
  await client.send('Runtime.enable');

  const screenshotDir = path.resolve('scratch/screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const viewports = [320, 360, 390, 430];
  const themes = ['light', 'dark'];

  console.log('\n--- TESTING HORIZONTAL OVERFLOW ACROSS VIEWPORTS ---');
  for (const width of viewports) {
    for (const theme of themes) {
      await client.send('Emulation.setDeviceMetricsOverride', {
        width,
        height: 800,
        deviceScaleFactor: 2,
        mobile: true
      });

      await client.send('Page.navigate', { url: 'http://localhost:4321/modpacks/' });
      await wait(1000);

      // set theme
      await client.send('Runtime.evaluate', {
        expression: `document.documentElement.setAttribute('data-theme', '${theme}')`
      });
      await wait(200);

      // check scrollWidth vs clientWidth
      const res = await client.send('Runtime.evaluate', {
        expression: `(() => {
          const docWidth = document.documentElement.clientWidth;
          const scrollWidth = document.documentElement.scrollWidth;
          const overflowing = [];
          document.querySelectorAll('*').forEach(el => {
            if (el.closest('.retro-ticker-bar') || el.closest('.modpack-filters-scroll')) return;
            const r = el.getBoundingClientRect();
            if (r.right > docWidth + 1) {
              overflowing.push({ tag: el.tagName, id: el.id, class: el.className, right: r.right });
            }
          });
          return JSON.stringify({ docWidth, scrollWidth, hasOverflow: scrollWidth > docWidth, overflowing: overflowing.slice(0, 3) });
        })()`
      });

      const data = JSON.parse(res.result.value);
      console.log(`Viewport ${width}px [${theme}]: clientWidth=${data.docWidth}, scrollWidth=${data.scrollWidth}, hasOverflow=${data.hasOverflow}`);
      if (data.hasOverflow) {
        console.log('  Overflow elements:', data.overflowing);
      }

      // Take screenshots for 390px
      if (width === 390) {
        // Gyzenn Vanilla++
        const clipVanilla = await client.send('Runtime.evaluate', {
          expression: `(() => {
            const el = document.getElementById('gyzenn-vanilla-plus-plus');
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return JSON.stringify({ x: r.left, y: r.top + window.scrollY, width: r.width, height: r.height, scale: 1 });
          })()`
        });
        if (clipVanilla.result.value) {
          const clip = JSON.parse(clipVanilla.result.value);
          const ss = await client.send('Page.captureScreenshot', { clip });
          fs.writeFileSync(path.join(screenshotDir, `card-vanilla-390-${theme}.png`), Buffer.from(ss.data, 'base64'));
        }

        // Cobra 26.3
        const clipCobra = await client.send('Runtime.evaluate', {
          expression: `(() => {
            const el = document.getElementById('cobra-ultimize-remake-26-3');
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return JSON.stringify({ x: r.left, y: r.top + window.scrollY, width: r.width, height: r.height, scale: 1 });
          })()`
        });
        if (clipCobra.result.value) {
          const clip = JSON.parse(clipCobra.result.value);
          const ss = await client.send('Page.captureScreenshot', { clip });
          fs.writeFileSync(path.join(screenshotDir, `card-cobra-26-3-390-${theme}.png`), Buffer.from(ss.data, 'base64'));
        }

        // Better Sound
        const clipSound = await client.send('Runtime.evaluate', {
          expression: `(() => {
            const el = document.getElementById('better-sound-java');
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return JSON.stringify({ x: r.left, y: r.top + window.scrollY, width: r.width, height: r.height, scale: 1 });
          })()`
        });
        if (clipSound.result.value) {
          const clip = JSON.parse(clipSound.result.value);
          const ss = await client.send('Page.captureScreenshot', { clip });
          fs.writeFileSync(path.join(screenshotDir, `card-better-sound-390-${theme}.png`), Buffer.from(ss.data, 'base64'));
        }
      }
    }
  }

  console.log('\n--- TESTING FUNCTIONALITY (FILTER & DEEP LINK) ---');
  await client.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });

  // 1. Deep link test
  await client.send('Page.navigate', { url: 'http://localhost:4321/modpacks/#gyzenn-vanilla-plus-plus' });
  await wait(800);
  const deepLinkCheck = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.getElementById('gyzenn-vanilla-plus-plus');
      if (!el) return { found: false };
      const r = el.getBoundingClientRect();
      return { found: true, top: r.top, visible: r.top >= -50 && r.top <= window.innerHeight };
    })()`,
    returnByValue: true
  });
  console.log('Deep link #gyzenn-vanilla-plus-plus in view:', deepLinkCheck.result.value);

  // 2. Filter test
  await client.send('Runtime.evaluate', {
    expression: `document.querySelector('.filter-pill[data-category="SURVIVAL"]').click()`
  });
  await wait(300);
  const filterSurvival = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const vanilla = document.getElementById('gyzenn-vanilla-plus-plus');
      const opt261 = document.getElementById('gyzenn-optimized-26-1');
      return {
        vanilla: vanilla ? getComputedStyle(vanilla).display : 'none',
        opt261: opt261 ? getComputedStyle(opt261).display : 'none'
      };
    })()`,
    returnByValue: true
  });
  console.log('Filter SURVIVAL results:', filterSurvival.result.value);

  // Reset filter to ALL
  await client.send('Runtime.evaluate', {
    expression: `document.querySelector('.filter-pill[data-category="ALL"]').click()`
  });
  await wait(300);
  const filterAll = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const vanilla = document.getElementById('gyzenn-vanilla-plus-plus');
      const opt261 = document.getElementById('gyzenn-optimized-26-1');
      return {
        vanilla: vanilla ? getComputedStyle(vanilla).display : 'none',
        opt261: opt261 ? getComputedStyle(opt261).display : 'none'
      };
    })()`,
    returnByValue: true
  });
  console.log('Filter ALL results:', filterAll.result.value);

  // 3. Read more toggle test
  const readMoreRes = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('#gyzenn-vanilla-plus-plus .btn-read-more');
      const desc = document.querySelector('#gyzenn-vanilla-plus-plus .modpack-editorial-desc');
      if (!btn || !desc) return { found: false };
      const beforeExpanded = desc.classList.contains('is-expanded');
      btn.click();
      const afterExpanded = desc.classList.contains('is-expanded');
      const buttonText = btn.textContent.trim();
      return { found: true, beforeExpanded, afterExpanded, buttonText };
    })()`,
    returnByValue: true
  });
  console.log('Read more toggle test:', readMoreRes.result.value);

  // 4. Download URLs format verification
  const domUrls = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const vanillaMrpack = document.querySelector('#gyzenn-vanilla-plus-plus .btn-card-action').href;
      const soundDl = document.querySelector('#better-sound-java .btn-resourcepack-download').href;
      return { vanillaMrpack, soundDl };
    })()`,
    returnByValue: true
  });
  console.log('DOM Download URLs:');
  console.log('  Vanilla++ Mrpack:', domUrls.result.value.vanillaMrpack);
  console.log('  Better Sound:', domUrls.result.value.soundDl);

  client.close();
  chrome.kill();
  console.log('\nAll tests executed successfully.');
}

main().catch(err => {
  console.error(err);
  if (chrome) chrome.kill();
  process.exit(1);
});
