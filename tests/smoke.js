/* Smoke test: load the prototype in jsdom, render every screen, and surface runtime errors.
   Run with: npm install --no-save jsdom && node tests/smoke.js  */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.resolve(__dirname, '..');
const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errors.push('jsdom: ' + (e.stack || e.message)));
vc.on('error', (...a) => errors.push('console: ' + a.join(' ')));

JSDOM.fromFile(path.join(root, 'index.html'), {
  runScripts: 'dangerously', resources: 'usable', virtualConsole: vc,
  beforeParse(win) { win.matchMedia = () => ({ matches: false, addListener(){}, removeListener(){} }); }
}).then(async dom => {
  await new Promise(r => setTimeout(r, 400));
  const { window } = dom;
  // Regression: overlays must not cover the app on first load
  for (const id of ['paletteOverlay', 'modalOverlay', 'contextMenu']) {
    const el = window.document.getElementById(id);
    if (!el.hidden || window.getComputedStyle(el).display !== 'none')
      errors.push(`${id}: visible on initial load (blurred-screen regression)`);
  }
  console.log('✓ overlays hidden on initial load');

  const screens = ['command','orchestrator','agents','investigations','case','graph','vault','reports','tools','plugins','skills','mcp','settings','states'];
  for (const s of screens) {
    try {
      window.eval(`navigate(${JSON.stringify(s)})`);
      const html = window.document.getElementById('view').innerHTML;
      if (html.trim().length < 200) errors.push(`${s}: view rendered too little markup`);
      console.log(`✓ ${s.padEnd(15)} ${html.length} chars`);
    } catch (e) { errors.push(`${s}: ${e.stack}`); }
  }
  // Core interactions
  try {
    window.eval(`navigate('command')`);
    window.document.getElementById('promptInput').value = 'Investigate a shell company network';
    window.eval('launch()');
    console.log('✓ prompt launch');
    window.eval('modalApproval()');
    window.eval('modalExport()');
    window.eval('openPalette()');
    console.log('✓ overlays');
  } catch (e) { errors.push('interaction: ' + e.stack); }
  dom.window.close();
  if (errors.length) { console.error('\nFAILURES:\n' + errors.join('\n')); process.exit(1); }
  console.log('\nAll screens and core interactions rendered without runtime errors.');
}).catch(e => { console.error(e); process.exit(1); });
