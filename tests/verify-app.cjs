/**
 * Végponti ellenőrzés a futó alkalmazáson (CDP-n keresztül, külső függőség nélkül).
 *
 * Használat:
 *   1) npm run build && npx next start -p 4174
 *   2) chrome.exe --headless=new --remote-debugging-port=9227 --user-data-dir=<temp>
 *   3) node tests/verify-app.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ORIGIN = process.env.APP_ORIGIN || 'http://127.0.0.1:4174';
const DEBUG_PORT = process.env.CDP_PORT || 9227;
const SHOT_DIR = process.env.SHOT_DIR || path.join(__dirname, '..', '.verify-shots');

async function main() {
  const targets = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json();
  const target = targets.find(t => t.type === 'page');
  assert.ok(target, 'nincs megnyitható lap a böngészőben');

  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });

  let nextId = 0;
  const pending = new Map();
  const exceptions = [];
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const job = pending.get(message.id);
      if (!job) return;
      pending.delete(message.id);
      clearTimeout(job.timer);
      message.error ? job.reject(new Error(JSON.stringify(message.error))) : job.resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails);
  };

  function cdp(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++nextId;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error('Timed out: ' + method)); }, 20000);
      pending.set(id, { resolve, reject, timer });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const response = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
    return response.result.value;
  }

  const settle = () => evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');

  async function goto(url) {
    await cdp('Page.navigate', { url });
    for (let i = 0; i < 100; i++) {
      const ready = await evaluate(
        `document.readyState==='complete' && !!document.querySelector('.highcharts-container, [data-pending-notice]')`
      ).catch(() => false);
      if (ready) break;
      await new Promise(r => setTimeout(r, 150));
    }
    await settle();
  }

  async function screenshot(name) {
    fs.mkdirSync(SHOT_DIR, { recursive: true });
    const result = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(SHOT_DIR, name), Buffer.from(result.data, 'base64'));
  }

  // Egy diagram x-tengelyének kategóriái a kirajzolt SVG-ből
  const xLabels = (index = 0) => evaluate(
    `[...document.querySelectorAll('.highcharts-container')][${index}]` +
    `?.querySelectorAll('.highcharts-xaxis-labels text')` +
    ` ? [...[...document.querySelectorAll('.highcharts-container')][${index}]` +
    `.querySelectorAll('.highcharts-xaxis-labels text')].map(t=>t.textContent) : []`
  );

  await cdp('Runtime.enable');
  await cdp('Page.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1120, deviceScaleFactor: 1, mobile: false });

  // Bejelentkezés kihagyása: a teljes hozzáférés beállítása közvetlenül
  await cdp('Page.navigate', { url: `${ORIGIN}/` });
  await new Promise(r => setTimeout(r, 800));
  await evaluate(`localStorage.setItem('univer_dashboard_access_level','total');sessionStorage.clear()`);

  // --- 2026: tövön tarthatóság ---
  await goto(`${ORIGIN}/dashboard?year=2026`);
  assert.deepEqual(await xLabels(0), ['Cs-I', 'Cs-II', 'L-I', 'L-II'], '2026 kategóriák');
  assert.equal(
    await evaluate(`[...document.querySelectorAll('.highcharts-plot-band-label')].map(t=>t.textContent).slice(0,2).join('|')`),
    'Csabacsűd|Lakitelek',
    '2026 helyszín-sávok'
  );
  assert.ok(await evaluate(`document.body.innerText.includes('Heinz+Syngenta')`), '2026 nemesítőház');
  assert.ok(await evaluate(`!document.body.innerText.includes('Mezőberény')`), '2026-ban nincs Mezőberény');
  assert.ok(await evaluate(`document.body.innerText.includes('Univer 2026 Dashboard')`), '2026 cím');
  await screenshot('app-2026-retention.png');
  console.log('PASS 2026 tövön tarthatóság: helyszínek, sávcímkék, nemesítőházak');

  // Hiányzó mérés a részletező panelen
  await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='UG10162')?.click()`);
  await settle();
  assert.ok(await evaluate(`document.body.innerText.includes('Nem vizsgált')`), 'nem vizsgált helyszín jelölése');
  await screenshot('app-2026-selection.png');
  console.log('PASS hiányzó mérés "Nem vizsgált" jelöléssel');

  // --- Szezonváltás 2025-re ---
  await evaluate(`[...document.querySelectorAll('[role="radio"]')].find(b=>b.textContent.includes('2025'))?.click()`);
  for (let i = 0; i < 60; i++) {
    if ((await xLabels(0)).length === 6) break;
    await new Promise(r => setTimeout(r, 150));
  }
  assert.deepEqual(await xLabels(0), ['M-I', 'M-II', 'Cs-I', 'Cs-II', 'L-I', 'L-II'], '2025 kategóriák');
  assert.ok(await evaluate(`document.body.innerText.includes('WALLER + Heinz')`), '2025 nemesítőház');
  assert.ok(await evaluate(`location.search.includes('year=2025')`), 'az év az URL-ben');
  await screenshot('app-2025-retention.png');
  console.log('PASS szezonváltó: 2025 regresszió és URL-állapot');

  // --- Brix: a 2026-os mérések megérkeztek ---
  await goto(`${ORIGIN}/dashboard/brix-diagram?year=2026`);
  await new Promise(r => setTimeout(r, 600));
  assert.ok(await evaluate(`!document.body.innerText.includes('Brix-adatai még nem érkeztek meg')`), '2026 Brix már nincs függőben');
  assert.equal(await evaluate(`document.querySelectorAll('.highcharts-container').length`), 3, '2026 Brix diagram nemesítőházanként');
  assert.deepEqual(await xLabels(0), ['Cs-I', 'Cs-II', 'L-I', 'L-II'], '2026 Brix kategóriák');
  assert.ok(await evaluate(`document.querySelector('.highcharts-container')?.querySelector('.highcharts-yaxis .highcharts-axis-title')?.textContent === '%'`), 'Brix tengelyfelirat');
  assert.ok(await evaluate(`[...document.querySelectorAll('.highcharts-container text')].some(t=>t.textContent.trim()==='5%')`), '5%-os referenciavonal');
  await screenshot('app-2026-brix.png');
  console.log('PASS 2026 Brix diagramok kategóriákkal és referenciavonallal');

  // Lakitelek 50 töves Brix ugyanebben a szezonban
  await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('50 töves'))?.click()`);
  for (let i = 0; i < 60; i++) {
    if ((await xLabels(0)).length === 2) break;
    await new Promise(r => setTimeout(r, 150));
  }
  assert.deepEqual(await xLabels(0), ['L-50-I', 'L-50-II'], '2026 Brix L-50 kategóriák');
  await screenshot('app-2026-brix-l50.png');
  console.log('PASS 2026 Brix L-50 nézet');

  // Szezonváltás: a 2025-ös Brix továbbra is a hat helyszínt rajzolja
  await goto(`${ORIGIN}/dashboard/brix-diagram?year=2025`);
  await new Promise(r => setTimeout(r, 600));
  assert.deepEqual(await xLabels(0), ['M-I', 'M-II', 'Cs-I', 'Cs-II', 'L-I', 'L-II'], '2025 Brix kategóriák');
  console.log('PASS 2025 Brix regresszió');

  // --- Halmozott termés ---
  await goto(`${ORIGIN}/dashboard/halmozott-termes?year=2025`);
  await new Promise(r => setTimeout(r, 600));
  assert.ok(await evaluate(`document.body.innerText.includes('Lakitelek - 50 töves')`), 'helyszínnév ékezetei');
  await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Mezőberény - 2 soros')?.click()`);
  await settle();

  await goto(`${ORIGIN}/dashboard/halmozott-termes?year=2026`);
  await new Promise(r => setTimeout(r, 600));
  assert.ok(
    await evaluate(`![...document.querySelectorAll('button')].some(b=>b.textContent.trim()==='Mezőberény - 2 soros')`),
    '2026-ban nincs mezőberényi helyszíngomb'
  );
  assert.ok(await evaluate(`document.body.innerText.includes('nem szerepel')`), 'helyszínváltás jelzése');
  assert.ok(await evaluate(`document.querySelectorAll('.highcharts-container').length > 0`), '2026 halmozott diagramok');
  await screenshot('app-2026-cumulative.png');
  console.log('PASS halmozott nézet: helyszínlista szezononként és váltásjelzés');

  assert.deepEqual(exceptions.map(e => e.text), [], 'futásidejű hibák');
  console.log('PASS nincs futásidejű kivétel; képek:', SHOT_DIR);
  socket.close();
}

main().catch(error => { console.error(error); process.exitCode = 1; setTimeout(() => process.exit(1), 100); });
