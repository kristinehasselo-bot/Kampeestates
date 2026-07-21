// Drives renderer.html in Chromium, records the reel (video+audio), saves webm.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const out = process.argv[2] || path.join(__dirname, '..', 'asking-price-is-never-the-price.webm');
  const b = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: [
      '--autoplay-policy=no-user-gesture-required',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--disable-gpu-vsync', '--disable-frame-rate-limit',
    ],
  });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('console', m => { const t = m.text(); if (t) console.log('[page]', t); });
  await p.goto('file://' + path.join(__dirname, 'renderer.html'), { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200); // let fonts settle
  console.log('rendering ~30s ...');
  await p.evaluate(() => window.__startReel());
  await p.waitForFunction(() => window.__reelDone === true, { timeout: 90000 });
  const { b64, mime, len } = await p.evaluate(() => ({ b64: window.__reelB64, mime: window.__reelMime, len: window.__reelB64.length }));
  fs.writeFileSync(out, Buffer.from(b64, 'base64'));
  console.log('saved', out, 'mime', mime, 'bytes', fs.statSync(out).size);
  await b.close();
})().catch(e => { console.error('ERR', e); process.exit(1); });
