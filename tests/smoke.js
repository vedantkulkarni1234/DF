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
  beforeParse(win) {
    win.matchMedia = () => ({ matches: false, addListener(){}, removeListener(){} });
    win.URL.createObjectURL = () => 'blob:test'; win.URL.revokeObjectURL = () => {};
    Object.defineProperty(win.navigator, 'clipboard', { value: { writeText: async () => {} }, configurable: true });
  }
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
  // CAPABILITIES tab group: 5 tabs, active state, tab strip registration, switching
  try {
    window.eval(`navigate('agents')`);
    const tabs = [...window.document.querySelectorAll('.capability-tab')];
    if (tabs.length !== 5) errors.push(`capability tabs: expected 5, got ${tabs.length}`);
    if (!window.document.querySelector('.capability-tab.active[data-nav="agents"]')) errors.push('capability tabs: missing active state');
    window.document.querySelector('.capability-tab[data-nav="mcp"]').click();
    if (window.eval('state.screen') !== 'mcp') errors.push('capability tabs: click did not switch page');
    if (!window.eval('state.tabs.includes("agents")') || !window.eval('state.tabs.includes("mcp")')) errors.push('capability tabs: pages not registered in tab strip');
    console.log('✓ capabilities tab group');
  } catch (e) { errors.push('capability tabs: ' + e.stack); }

  // Real actions: menus, state changes, downloads, help content
  try {
    window.eval(`navigate('command')`);
    window.document.querySelector('[data-action="shortcuts"]').click();
    if (!window.document.getElementById('modalHost').textContent.includes('Keyboard shortcuts')) errors.push('shortcuts modal did not open');
    window.eval('closeModal()');

    window.document.getElementById('modelPicker').click();
    if (window.document.getElementById('popover').hidden) errors.push('model menu did not open');
    window.document.querySelector('[data-action="select-model"][data-value="Axiom Vision 2"]').click();
    if (window.eval('state.model') !== 'Axiom Vision 2') errors.push('model selection did not apply');

    window.eval(`navigate('plugins')`);
    const before = window.eval('DATA.plugins[0].status');
    window.document.querySelector('[data-action="toggle-plugin"]').click();
    if (window.eval('DATA.plugins[0].status') === before) errors.push('plugin install state did not change');

    window.eval(`downloadFile('smoke.json','{}','application/json')`);
    console.log('✓ real actions (menus, state, downloads, help)');
  } catch (e) { errors.push('real actions: ' + e.stack); }

  // No prototype-only copy in the product UI
  try {
    window.eval(`navigate('command')`);
    const text = window.document.body.textContent;
    for (const phrase of ['represented in the prototype','ready for implementation','Component states','Design system reference']) {
      if (text.includes(phrase)) errors.push(`unreal copy still visible: ${phrase}`);
    }
    console.log('✓ no prototype-only copy in UI');
  } catch (e) { errors.push('copy audit: ' + e.stack); }

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
