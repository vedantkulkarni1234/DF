/* ================= AXIOM — application controller ================= */
const store = {
  get(k, fallback){ try { const v = localStorage.getItem('axiom.'+k); return v === null ? fallback : JSON.parse(v); } catch(_) { return fallback; } },
  set(k, v){ try { localStorage.setItem('axiom.'+k, JSON.stringify(v)); } catch(_) {} }
};
const state = {
  screen:'command', theme:'dark', progress:68, running:true,
  sidebarCollapsed:false, contextCollapsed:false, case:'INV-2041', caseTab:'overview',
  selected:{agent:'osint',plugin:0,skill:0,server:0,evidence:0},
  graphNode:'shell1', settingsTab:0, autonomous:true, tabs:['command'], prompt:'', timers:[],
  workspace:store.get('workspace','Northstar Investigations'), model:store.get('model','Axiom Reasoner 3'),
  notifications:store.get('notifications',[
    {tone:'warning',title:'Approval required',detail:'External enrichment · INV-2041 · 14:45'},
    {tone:'danger',title:'Contradiction detected',detail:'Invoice date vs. ledger timestamp · 12:52'},
    {tone:'success',title:'Integrity check passed',detail:'536 evidence items · 14:04'}
  ])
};

const NAV = [
  { group:'INVESTIGATE', items:[
    {id:'command', label:'AI Command Center', icon:'command'},
    {id:'orchestrator', label:'Orchestrator', icon:'activity', badge:'LIVE'},
    {id:'investigations', label:'Investigations', icon:'cases', count:'5'},
    {id:'case', label:'Case workspace', icon:'folder' in ICONS?'folder':'cases'}
  ]},
  { group:'INTELLIGENCE', items:[
    {id:'graph', label:'Intelligence Graph', icon:'graph'},
    {id:'vault', label:'Evidence Vault', icon:'vault'},
    {id:'reports', label:'Reports', icon:'report'}
  ]},
  { group:'CAPABILITIES', items:[
    {id:'agents', label:'AI Agents', icon:'bot', count:'12'},
    {id:'tools', label:'Tools', icon:'tools', count:'8'},
    {id:'plugins', label:'Plugins', icon:'puzzle'},
    {id:'skills', label:'Skills', icon:'sparkles'},
    {id:'mcp', label:'MCP Servers', icon:'server', count:'4'}
  ]},
  { group:'SYSTEM', items:[{id:'settings', label:'Settings', icon:'settings'}]}
];
const CAPABILITIES = NAV.find(g => g.group === 'CAPABILITIES').items;
const CAP_IDS = CAPABILITIES.map(i => i.id);
const SCREEN_TITLES = {command:'Investigation pulse',orchestrator:'Live orchestration',agents:'Agent fleet',investigations:'Case portfolio',case:'Case context',graph:'Graph context',vault:'Vault context',reports:'Report context',tools:'Tool context',plugins:'Plugin context',skills:'Skill context',mcp:'Server context',settings:'Administration',states:'System context'};

/* ------------------------- shared helpers ------------------------- */
const H = {
  esc: s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),
  statusLabel: s => ({executing:'Executing',review:'In review',completed:'Completed',verified:'Verified',unverified:'Unverified',hypothesis:'Hypothesis',contradicted:'Contradicted',active:'Active',idle:'Idle',connected:'Connected',degraded:'Degraded'}[s]||s),
  conf(v){ const tone=v>=80?'success':v>=50?'warning':'danger'; return `<span class="conf" title="Confidence ${v}%"><span class="conf-bar"><i style="width:${v}%;background:var(--${tone})"></i></span>${v}%</span>`; },
  statusBadge(s){ const cls=s==='verified'?'success':s==='unverified'?'warning':s==='hypothesis'?'violet':'danger'; return `<span class="badge ${cls}"><span class="dot ${cls==='violet'?'violet':cls}"></span>${H.statusLabel(s)}</span>`; },
  timeline(items){ return `<div class="timeline">${items.map(t=>`<div class="timeline-item"><span class="timeline-dot ${t.tone||''}"></span><div class="timeline-content"><div class="row"><span class="mono tertiary">${t.time}</span><strong>${t.label}</strong></div><p>${t.detail}</p></div></div>`).join('')}</div>`; },
  miniGraph(){ return `<svg viewBox="0 0 360 130" width="100%" height="120"><g fill="none" stroke="var(--graph-edge)" stroke-width="1.4"><path d="M60 60 150 40M60 60 140 95M150 40 260 65M140 95 260 65M260 65 320 35" stroke-dasharray="4 4"/></g>${[[60,60,'N'],[150,40,'M'],[140,95,'A'],[260,65,'0'],[320,35,'E']].map(([x,y,l],i)=>`<circle cx="${x}" cy="${y}" r="15" fill="var(--bg-elevated)" stroke="${i===1?'var(--accent)':'var(--border-strong)'}"/><text x="${x}" y="${y+4}" text-anchor="middle" font-size="11" fill="var(--text-secondary)">${l}</text>`).join('')}</svg>`; },
  settingsBody(i){
    const bodies = [
      `<div class="switch-row"><div><strong>Telemetry</strong><small>Share anonymized performance data. Never includes case content.</small></div><span class="switch on"></span></div><div class="switch-row"><div><strong>Automatic updates</strong><small>Install signed updates when the workstation is idle.</small></div><span class="switch on"></span></div><div class="switch-row"><div><strong>Compact interface density</strong><small>Fit more information on screen.</small></div><span class="switch"></span></div><div class="switch-row"><div><strong>Startup session restore</strong><small>Reopen investigation tabs after restart.</small></div><span class="switch on"></span></div>`,
      `<div class="row gap-3"><label class="grow"><span class="field-label">PRIMARY MODEL</span><select class="field select-field"><option>Axiom Reasoner 3 · 200K context</option><option>Axiom Reasoner 3 Fast</option><option>Claude Opus 4 · external</option></select></label><label class="grow"><span class="field-label">FALLBACK MODEL</span><select class="field select-field"><option>Axiom Reasoner 3 Fast</option><option>None</option></select></label></div><div class="switch-row mt-4"><div><strong>Local inference for sensitive cases</strong><small>Keep prompts and evidence on this workstation when classification requires it.</small></div><span class="switch on"></span></div><div class="switch-row"><div><strong>Temperature</strong><small>Lower values produce more deterministic reports.</small></div><input type="range" value="25" style="width:140px"></div>`,
      `<p class="muted mb-3">Configure default delegation behavior for the 12 installed agents.</p><div class="switch-row"><div><strong>Allow autonomous delegation</strong><small>Orchestrator may select agents without prompting.</small></div><span class="switch on"></span></div><div class="switch-row"><div><strong>External actions require approval</strong><small>Recommended for all investigations.</small></div><span class="switch on"></span></div><div class="switch-row"><div><strong>Record agent communications</strong><small>Include inter-agent summaries in the audit log.</small></div><span class="switch on"></span></div>`,
      `<div class="switch-row"><div><strong>Encrypt case data at rest</strong><small>AES-256-GCM. Cannot be disabled on enterprise plans.</small></div><span class="switch on"></span></div><div class="switch-row"><div><strong>Hardware key for export signing</strong><small>Require YubiKey or Touch ID for report export.</small></div><span class="switch"></span></div><div class="switch-row"><div><strong>Redact personal identifiers in model calls</strong><small>Replace direct identifiers with case-scoped tokens.</small></div><span class="switch on"></span></div><div class="switch-row"><div><strong>Strict lawful-use attestation</strong><small>Require purpose statement before every investigation.</small></div><span class="switch on"></span></div>`,
      `<p class="muted mb-3">Workspace-wide boundaries applied to every investigation.</p><div class="switch-row"><div><strong>Public web collection</strong><small>Allowed for all investigators.</small></div><span class="switch on"></span></div><div class="switch-row"><div><strong>Authorized ledger access</strong><small>Requires case-level authorization record.</small></div><span class="switch on"></span></div><div class="switch-row"><div><strong>External API calls</strong><small>Must be approved per request.</small></div><span class="switch on"></span></div><div class="switch-row"><div><strong>Credentialed / authenticated web access</strong><small>Blocked by policy.</small></div><span class="switch"></span></div>`,
      `<div class="switch-row"><div><strong>Auto-select tools and skills</strong><small>Core prompt-first behavior. Disable for manual control.</small></div><span class="switch on"></span></div><div class="switch-row"><div><strong>Parallel agent execution</strong><small>Run independent tasks simultaneously.</small></div><span class="switch on"></span></div><div class="switch-row"><div><strong>Auto-verify every claim</strong><small>Adds a verification pass before findings are published.</small></div><span class="switch on"></span></div><div class="switch-row"><div><strong>Continue on recoverable errors</strong><small>Retry with fallback source instead of pausing.</small></div><span class="switch on"></span></div>`,
      `<div class="switch-row"><div><strong>External data sharing</strong><small>Any data leaving the case boundary.</small></div><span class="switch on"></span></div><div class="switch-row"><div><strong>Evidence export</strong><small>Exporting artifacts outside the vault.</small></div><span class="switch on"></span></div><div class="switch-row"><div><strong>Final report publication</strong><small>Require lead analyst sign-off before distribution.</small></div><span class="switch on"></span></div><div class="callout mt-3">${IC('shieldCheck',14)} <div><strong>4 approval gates</strong> active in this workspace · 12 approvals recorded this month</div></div>`,
      `<div class="switch-row"><div><strong>Investigation completion</strong><small>Notify lead analyst when report is ready for review.</small></div><span class="switch on"></span></div><div class="switch-row"><div><strong>Approval requests</strong><small>Surface immediately in the command center.</small></div><span class="switch on"></span></div><div class="switch-row"><div><strong>Contradictions detected</strong><small>Alert when findings conflict.</small></div><span class="switch on"></span></div><div class="switch-row"><div><strong>Weekly case digest</strong><small>Email summary every Monday, 09:00.</small></div><span class="switch"></span></div>`,
      `<div class="kv" style="grid-template-columns:150px 1fr"><dt>Vault location</dt><dd>/var/axiom/vault/encrypted</dd><dt>Used / allocated</dt><dd>12.4 GB / 500 GB</dd><dt>Backup</dt><dd>Daily 02:00 UTC · 3 copies · immutable</dd><dt>Retention</dt><dd>7 years with legal hold</dd><dt>Integrity schedule</dt><dd>Hourly SHA-256 verification</dd></div><button class="btn sm mt-4" data-action="storage">${IC('database',12)} Manage storage</button>`,
      `<div class="table-wrap"><table class="table"><thead><tr><th>TIME</th><th>ACTOR</th><th>EVENT</th><th>CASE</th></tr></thead><tbody><tr><td class="mono">14:04:22</td><td>System</td><td>Integrity verification passed · 148 items</td><td class="mono">INV-2041</td></tr><tr><td class="mono">13:58:09</td><td>Blockchain Agent</td><td>Chain Explorer rate-limited · retried</td><td class="mono">INV-2041</td></tr><tr><td class="mono">13:41:55</td><td>V. Kulkarni</td><td>Approved external enrichment request</td><td class="mono">INV-2041</td></tr><tr><td class="mono">12:52:10</td><td>Verification Agent</td><td>Contradiction recorded · Finding 04</td><td class="mono">INV-2041</td></tr></tbody></table></div>`,
      `<div class="row gap-4"><div class="theme-choice active" data-action="set-theme" data-theme-value="dark"><div class="theme-preview dark"><i></i><i></i><i></i></div><strong>Dark</strong><span class="muted">Default for investigation rooms</span></div><div class="theme-choice" data-action="set-theme" data-theme-value="light"><div class="theme-preview light"><i></i><i></i><i></i></div><strong>Light</strong><span class="muted">Optimized for report review</span></div></div><div class="switch-row mt-4"><div><strong>Reduce motion</strong><small>Minimize animation and transitions.</small></div><span class="switch"></span></div>`,
      `<div class="switch-row"><div><strong>Northstar Investigations</strong><small>Enterprise · 24 seats · primary workspace</small></div><span class="badge accent">Current</span></div><div class="switch-row"><div><strong>Regulatory Response Unit</strong><small>Restricted · 8 seats · separate vault</small></div><button class="btn sm">Switch</button></div><div class="switch-row"><div><strong>Personal Sandbox</strong><small>Training · no case data</small></div><button class="btn sm">Switch</button></div>`
    ];
    return bodies[i] || bodies[0];
  }
};
window.H = H;

/* ------------------------- real local actions ------------------------- */
function downloadFile(filename, content, mime){
  const blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
  toast('Download started', filename, 'success');
}
async function copyText(text, label){
  try { await navigator.clipboard.writeText(text); }
  catch(_) { try { const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); } catch(__) {} }
  toast('Copied to clipboard', label || text.slice(0,60), 'success');
}
function closePopover(){ const p=document.getElementById('popover'); p.hidden=true; }
function openPopover(anchor, html){
  const p=document.getElementById('popover'); p.innerHTML=html; p.hidden=false;
  const r=anchor.getBoundingClientRect();
  const w=p.offsetWidth||260, h=p.offsetHeight||180;
  p.style.left=Math.max(8, Math.min(r.left, window.innerWidth-w-8))+'px';
  p.style.top=(r.bottom+h+8>window.innerHeight ? Math.max(8, r.top-h-6) : r.bottom+6)+'px';
}
function openInfoModal(icon, title, body, foot){
  const m=document.getElementById('modalHost'); m.className='modal';
  m.innerHTML=`<div class="modal-head"><span class="modal-icon accent">${IC(icon,17)}</span><div><h3>${title}</h3><p>${body}</p></div></div>
    <div class="modal-body">${foot||''}</div>
    <div class="modal-foot"><button class="btn" data-action="close-modal">Close</button></div>`;
  document.getElementById('modalOverlay').hidden=false;
}
function openFormModal(title, fields, onSubmit){
  const m=document.getElementById('modalHost'); m.className='modal';
  m.innerHTML=`<div class="modal-head"><span class="modal-icon accent">${IC('plus',17)}</span><div><h3>${title}</h3><p>Add a resource to this workspace. Access is scoped to the current case.</p></div></div>
    <div class="modal-body">${fields.map(f=>`<label class="mt-3" style="display:block"><span class="field-label">${f.label}</span><input class="field ${f.mono?'mono':''}" id="form-${f.key}" placeholder="${f.placeholder||''}" value="${f.value||''}"></label>`).join('')}</div>
    <div class="modal-foot"><button class="btn" data-action="close-modal">Cancel</button><button class="btn primary" id="formSubmit">${IC('check',13)} Add</button></div>`;
  document.getElementById('modalOverlay').hidden=false;
  document.getElementById('formSubmit').onclick=()=>{
    const values={}; fields.forEach(f=>values[f.key]=document.getElementById('form-'+f.key).value.trim());
    if(fields.some(f=>f.required&&!values[f.key])){ toast('Missing information','Complete the required fields before adding.','warning'); return; }
    onSubmit(values); closeModal();
  };
}
function pickFiles(intent){
  const input=document.getElementById('filePicker');
  input.onchange=()=>{ const files=[...input.files];
    if(intent==='composer'){
      const box=document.getElementById('composerAttachments');
      files.forEach(f=>{ const pill=document.createElement('div'); pill.className='file-pill';
        pill.innerHTML=`${IC('file',13)} ${H.esc(f.name)} <span class="tertiary mono">${(f.size/1024).toFixed(0)} KB</span><button data-action="remove-attachment">${IC('x',12)}</button>`;
        box.appendChild(pill); });
      toast('Evidence attached',`${files.length} file(s) indexed and queued for hashing.`,'success');
    } else {
      toast('Import complete',`${files.length} file(s) validated and added to the workspace.`,'success');
    }
    input.value='';
  };
  input.click();
}

/* ------------------------- navigation ------------------------- */
function renderNav(){
  document.getElementById('sidebarNav').innerHTML = `
    <button class="nav-new" data-nav="command" title="New investigation">${IC('plus',15)} New investigation</button>
    ${NAV.map(g=>`<div class="nav-group"><div class="nav-label">${g.group}</div>${g.items.map(it=>`<button class="nav-item ${state.screen===it.id?'active':''}" data-nav="${it.id}" title="${it.label}">
      ${IC(it.icon,16)}<span>${it.label}</span>${it.count?`<span class="nav-count">${it.count}</span>`:''}${it.badge?`<span class="nav-count" style="color:var(--success)">${it.badge}</span>`:''}</button>`).join('')}</div>`).join('')}`;
}
function renderTabs(){
  const labels = {command:'Command Center',orchestrator:'Operation Silent Ledger',investigations:'Investigations',case:'INV-2041 · Silent Ledger',graph:'Intelligence graph',vault:'Evidence vault',reports:'Report',agents:'AI Agents',tools:'Tools & integrations',plugins:'Plugin marketplace',skills:'AI Skills',mcp:'MCP servers',settings:'Settings'};
  const icons = {command:'command',orchestrator:'activity',investigations:'cases',case:'activity',graph:'graph',vault:'vault',reports:'report',agents:'bot',tools:'tools',plugins:'puzzle',skills:'sparkles',mcp:'server',settings:'settings',states:'help'};
  document.getElementById('tabstrip').innerHTML = state.tabs.map(t=>`<div class="tab ${t===state.screen?'active':''} ${CAP_IDS.includes(t)?'capability-tab-in-strip':''}" data-nav="${t}" title="${labels[t]||t}">${IC(icons[t]||'command',12)}<span>${labels[t]||t[0].toUpperCase()+t.slice(1)}</span>${state.tabs.length>1?`<button class="tab-x" data-action="close-tab" data-id="${t}">${IC('x',11)}</button>`:''}</div>`).join('') + `<button class="tab-add" data-nav="command" title="New investigation">${IC('plus',14)}</button>`;
}
/* CAPABILITIES section rendered as a tabbed page group */
function renderCapabilityTabs(){
  if(!CAP_IDS.includes(state.screen)) return '';
  return `<div class="capability-tabs">
    <div class="capability-tabs-label"><span class="eyebrow">CAPABILITIES</span><span class="capability-tabs-sub">Manage what the orchestrator can use</span></div>
    <div class="capability-tabs-list">${CAPABILITIES.map((c,i)=>`<button class="capability-tab ${state.screen===c.id?'active':''}" data-nav="${c.id}" title="${c.label} (⌘${i+1})">
      ${IC(c.icon,15)}<span>${c.label}</span>${c.count?`<span class="cap-count">${c.count}</span>`:''}<kbd>⌘${i+1}</kbd></button>`).join('')}</div>
    <div class="capability-tabs-hint">${IC('zap',12)} Auto-selected during investigations</div>
  </div>`;
}
const VIEWS = {command:renderCommand,orchestrator:renderOrchestrator,agents:renderAgents,investigations:renderInvestigations,case:renderCase,graph:renderGraph,vault:renderVault,reports:renderReports,tools:renderTools,plugins:renderPlugins,skills:renderSkills,mcp:renderMCP,settings:renderSettings,states:renderStates};

function navigate(screen, addTab){
  if(!VIEWS[screen]) screen='command';
  state.screen=screen;
  if(screen!=='states' && !state.tabs.includes(screen)) state.tabs.push(screen);
  renderNav(); renderTabs(); renderView(); renderContext();
  document.getElementById('viewScroll').scrollTop=0;
  if(window.innerWidth<1240) document.getElementById('app').classList.add('panel-hidden-by-default');
}

/* ------------------------- contextual panel ------------------------- */
function renderContext(){
  document.getElementById('contextTitle').textContent = SCREEN_TITLES[state.screen] || 'Context';
  const b = document.getElementById('contextBody');
  const orb = (ic,tone)=>`<span class="agent-orb ${tone||''}">${IC(ic,13)}</span>`;
  let extra='';
  if(state.screen==='command'||state.screen==='orchestrator'||state.screen==='case'){
    extra = `<div class="ctx-section"><div class="ctx-title">Active agents <span class="link" data-nav="agents">Manage</span></div>
      ${[['osint','OSINT Intelligence','Collecting registry filings','green',82],['forensics','Digital Forensics','Hashing 3 artifacts','green',100],['fraud','Fraud Analysis','Tracing wallet hops','',64],['correlation','Evidence Correlation','Resolving 9 entities','violet',48]].map(a=>`<div class="ctx-row">${orb(a[3]==='green'?'shieldCheck':a[3]==='violet'?'network':'globe',a[3])}<div class="ctx-row-main"><strong>${a[1]}</strong><small>${a[2]}</small><div class="progress-line"><i style="width:${a[4]}%"></i></div></div></div>`).join('')}
    </div>
    <div class="ctx-section"><div class="ctx-title">Investigation plan <span class="link" data-nav="orchestrator">Open</span></div>
      ${[['Interpret objective','done'],['Generate plan','done'],['Parallel collection','active'],['Correlate & verify','pending'],['Assemble report','pending']].map((s,i)=>`<div class="plan-mini ${s[1]}"><span class="dot ${s[1]==='done'?'success':s[1]==='active'?'accent':''}"></span><span>${s[0]}</span><span class="mono tertiary">0${i+1}</span></div>`).join('')}
    </div>
    <div class="ctx-section"><div class="ctx-title">Tools in use</div><div class="row gap-2 wrap">${['RDAP','Hash','Chain Explorer','OCR','Graph'].map(t=>`<span class="badge outline">${t}</span>`).join('')}</div></div>
    <div class="ctx-section"><div class="ctx-title">Sources collected</div><div class="stat-grid-2"><div class="stat-tile"><b>64</b><span>Sources</span></div><div class="stat-tile"><b style="color:var(--success)">48</b><span>Reliable</span></div><div class="stat-tile"><b style="color:var(--warning)">11</b><span>Medium</span></div><div class="stat-tile"><b style="color:var(--danger)">5</b><span>Low</span></div></div></div>
    <div class="ctx-section"><div class="ctx-title">Evidence posture</div><div class="row"><div class="grow"><div class="row"><span class="muted">148 items · 76% verified</span></div><div class="progress mt-2"><i style="width:76%"></i></div></div><strong class="mono">148</strong></div></div>`;
  } else if(state.screen==='agents'){
    extra = `<div class="ctx-section"><div class="ctx-title">Fleet status</div><div class="stat-grid-2"><div class="stat-tile"><b>6</b><span>Active</span></div><div class="stat-tile"><b>6</b><span>Standby</span></div></div></div><div class="ctx-section"><div class="ctx-title">Current delegation</div><div class="ctx-row">${orb('network','violet')}<div class="ctx-row-main"><strong>5 agents assigned</strong><small>23 tasks · 14 complete</small></div></div></div>`;
  } else if(state.screen==='graph'){
    extra = `<div class="ctx-section"><div class="ctx-title">Graph integrity</div><div class="callout">${IC('alert',14)} <div><strong>4 proposed relationships</strong> are displayed as dashed links. Do not treat them as established facts.</div></div></div><div class="ctx-section"><div class="ctx-title">Node types</div>${[['Organizations',3,'building'],['People',2,'fingerprint'],['Wallets',2,'chain'],['Domains',1,'globe'],['Documents',1,'doc']].map(x=>`<div class="ctx-row">${orb(x[2])}<span class="grow">${x[0]}</span><span class="mono tertiary">${x[1]}</span></div>`).join('')}</div>`;
  } else if(state.screen==='vault'){
    extra = `<div class="ctx-section"><div class="ctx-title">Vault health</div><div class="callout success">${IC('shieldCheck',14)} <div><strong>All hashes match.</strong> 536 items verified 4 minutes ago.</div></div></div><div class="ctx-section"><div class="ctx-title">Access history</div><div class="ctx-row"><span class="dot success"></span><span class="grow">V. Kulkarni viewed EV-0812</span><span class="mono tertiary">14:09</span></div><div class="ctx-row"><span class="dot accent"></span><span class="grow">Verification Agent read 12 items</span><span class="mono tertiary">13:48</span></div></div>`;
  } else if(state.screen==='mcp'){
    extra = `<div class="ctx-section"><div class="ctx-title">Server health</div>${DATA.servers.map(s=>`<div class="ctx-row"><span class="dot ${s.status==='connected'?'success':'warning'}"></span><div class="ctx-row-main"><strong>${s.name}</strong><small>${s.latency} · ${s.tools} tools</small></div></div>`).join('')}</div>`;
  } else if(state.screen==='reports'){
    extra = `<div class="ctx-section"><div class="ctx-title">Review queue</div><div class="ctx-row"><span class="dot warning"></span><span class="grow">3 sections pending sign-off</span></div><div class="ctx-row"><span class="dot success"></span><span class="grow">9 sections complete</span></div></div><div class="ctx-section"><div class="ctx-title">Citation map</div><div class="stat-grid-2"><div class="stat-tile"><b>78</b><span>Citations</span></div><div class="stat-tile"><b>100%</b><span>Resolved</span></div></div></div>`;
  } else {
    extra = `<div class="ctx-section"><div class="ctx-title">Workspace context</div><p class="muted" style="font-size:11px;line-height:1.6">${H.esc(state.workspace)} · Enterprise plan · 24 seats. All operations are logged and scope-bound.</p></div>
      <div class="ctx-section"><div class="ctx-title">Quick actions</div>${[['command','New investigation','plus'],['investigations','Open cases','cases'],['settings','Administration','settings']].map(x=>`<div class="ctx-row" data-nav="${x[0]}" style="cursor:pointer">${orb(x[2])}<span class="grow">${x[1]}</span>${IC('chevronRight',13)}</div>`).join('')}</div>`;
  }
  b.innerHTML = `<div class="ctx-section"><div class="ctx-title">Execution status <span class="link" data-nav="orchestrator">Details</span></div>
      <div class="row gap-2"><span class="pulse-dot"></span><div class="grow"><strong style="font-size:12px">Investigation running</strong><small class="tertiary">Phase 3 of 6 · ${state.progress}% complete</small></div></div>
      <div class="progress mt-3"><i style="width:${state.progress}%"></i></div>
    </div>${extra}`;
}
function renderView(){ const render = VIEWS[state.screen]||renderCommand; document.getElementById('view').innerHTML = renderCapabilityTabs() + render(); }

/* ------------------------- overlays ------------------------- */
const PALETTE_ITEMS = [
  ...NAV.flatMap(g=>g.items.map(i=>({label:i.label, icon:i.icon, action:()=>navigate(i.id), group:'Navigate', hint:'⌘'+i.id[0].toUpperCase()}))),
  {label:'Start new investigation',icon:'plus',action:()=>navigate('command'),group:'Actions',hint:'⌘ N'},
  {label:'Pause active investigation',icon:'pauseCircle',action:()=>{toast('Execution paused','Phase 3 paused at task 14/23.','warning');},group:'Actions'},
  {label:'Approve pending external lookup',icon:'shieldCheck',action:()=>modalApproval(),group:'Actions'},
  ...DATA.investigations.map(i=>({label:i.title,icon:'cases',action:()=>{state.case=i.id;navigate('case');},group:'Investigations',hint:i.id})),
  ...DATA.agents.slice(0,6).map(a=>({label:a.name,icon:a.icon,action:()=>{state.selected.agent=a.id;navigate('agents');},group:'Agents'}))
];
let paletteIndex=0, paletteFiltered=[];
function openPalette(){ const o=document.getElementById('paletteOverlay'); o.hidden=false; const inp=document.getElementById('paletteInput'); inp.value=''; paletteFiltered=PALETTE_ITEMS; paletteIndex=0; drawPalette(); setTimeout(()=>inp.focus(),10); }
function closePalette(){ document.getElementById('paletteOverlay').hidden=true; }
function drawPalette(){
  const q=document.getElementById('paletteInput').value.toLowerCase();
  paletteFiltered=PALETTE_ITEMS.filter(x=>x.label.toLowerCase().includes(q)||(x.group||'').toLowerCase().includes(q));
  paletteIndex=Math.min(paletteIndex,Math.max(0,paletteFiltered.length-1));
  let html='', last='';
  paletteFiltered.forEach((x,i)=>{ if(x.group!==last){html+=`<div class="palette-group-label">${x.group}</div>`;last=x.group;} html+=`<div class="palette-item ${i===paletteIndex?'selected':''}" data-pi="${i}">${IC(x.icon,15)}<span>${x.label}</span>${x.hint?`<span class="key-hint">${x.hint}</span>`:''}</div>`; });
  document.getElementById('paletteResults').innerHTML = html || `<div class="state" style="min-height:140px"><span class="state-icon">${IC('search',20)}</span><h3>No results</h3><p>Try a case name, agent, or section.</p></div>`;
}
function toast(title,msg,tone){
  const el=document.createElement('div'); el.className='toast';
  el.innerHTML=`<span class="toast-icon" style="${tone==='warning'?'background:var(--warning-soft);color:var(--warning)':tone==='danger'?'background:var(--danger-soft);color:var(--danger)':''}">${IC(tone==='warning'?'alert':tone==='danger'?'x':'check',12)}</span><div><strong>${title}</strong><p>${msg||''}</p></div>`;
  document.getElementById('toastStack').appendChild(el);
  setTimeout(()=>{el.style.opacity='0';el.style.transform='translateX(14px)';el.style.transition='all .2s';setTimeout(()=>el.remove(),220);},3800);
}
function closeModal(){ document.getElementById('modalOverlay').hidden=true; }
function modalApproval(){
  const m=document.getElementById('modalHost'); m.className='modal';
  m.innerHTML=`<div class="modal-head"><span class="modal-icon">${IC('shieldCheck',17)}</span><div><h3>Approval required</h3><p>The orchestrator is requesting permission for a sensitive operation.</p></div></div>
    <div class="modal-body"><div class="callout warning">${IC('alert',15)} <div><strong>External enrichment request</strong><br>Verification Agent → breach-notice registry. Data shared: domain name and registration number. No case evidence or personal identifiers will be transmitted.</div></div>
    <div class="kv"><dt>Requested by</dt><dd>Verification Agent</dd><dt>Case</dt><dd>INV-2041 · Operation Silent Ledger</dd><dt>Legal basis</dt><dd>NS-8821 · Civil fraud investigation</dd></div>
    <label class="field-label mt-2">Decision note (optional)</label><input class="field" placeholder="Add context for the audit log…"></div>
    <div class="modal-foot"><button class="btn" data-action="close-modal">Cancel</button><button class="btn danger" data-action="deny">Deny request</button><button class="btn primary" data-action="approve">${IC('check',13)} Approve & log</button></div>`;
  document.getElementById('modalOverlay').hidden=false;
}
function modalExport(){
  const m=document.getElementById('modalHost'); m.className='modal';
  m.innerHTML=`<div class="modal-head"><span class="modal-icon accent">${IC('download',17)}</span><div><h3>Export investigation report</h3><p>Choose a format. Exports are signed and recorded in the audit log.</p></div></div>
    <div class="modal-body"><div class="export-grid modal-export">${[['PDF','report'],['JSON','code'],['CSV','list'],['Markdown','doc']].map(x=>`<button class="export-tile" data-action="do-export" data-format="${x[0]}">${IC(x[1],18)}<span>${x[0]}</span></button>`).join('')}</div>
    <div class="switch-row mt-3"><div><strong>Include evidence hash manifest</strong><small>Adds SHA-256 values and chain-of-custody records.</small></div><span class="switch on"></span></div>
    <div class="switch-row"><div><strong>Redact personal identifiers</strong><small>Recommended for external distribution.</small></div><span class="switch"></span></div></div>
    <div class="modal-foot"><button class="btn" data-action="close-modal">Cancel</button><button class="btn primary" data-action="do-export" data-format="PDF">${IC('download',13)} Export PDF</button></div>`;
  document.getElementById('modalOverlay').hidden=false;
}

/* ------------------------- simulation ------------------------- */
function launch(){
  const text=(document.getElementById('promptInput')||{}).value || state.prompt || 'New investigation';
  state.progress=2; state.running=true; state.prompt=text;
  navigate('orchestrator',true);
  toast('Investigation started','Plan generated · 6 phases · 23 tasks delegated.','success');
  state.timers.forEach(clearInterval); state.timers=[];
  const t=setInterval(()=>{
    if(!state.running){clearInterval(t);return;}
    state.progress=Math.min(100,state.progress+3);
    const view=document.getElementById('view');
    const bar=view.querySelector('.run-progress i'); if(bar) bar.style.width=state.progress+'%';
    const pct=view.querySelector('.run-banner-right strong.mono'); if(pct) pct.textContent=state.progress+'%';
    if(state.progress===100){clearInterval(t);state.running=false;toast('Investigation complete','4 findings and 148 evidence items are ready for review.','success');renderView();renderContext();}
  },900); state.timers.push(t);
}

/* ------------------------- event delegation ------------------------- */
document.addEventListener('click', e=>{
  const navEl=e.target.closest('[data-nav]');
  const actEl=e.target.closest('[data-action]');
  if(actEl){
    const a=actEl.dataset.action, id=actEl.dataset.id;
    switch(a){
      case 'launch': launch(); return;
      case 'follow-up': {
        const ta=document.getElementById('followupInput');
        if(ta&&ta.value.trim()){
          state.prompt=ta.value; state.progress=74; state.running=true;
          navigate('orchestrator',true);
          toast('Follow-up delegated','Affected phases re-planned. Prior evidence retained.','success');
          const t=setInterval(()=>{if(!state.running){clearInterval(t);return;}state.progress=Math.min(100,state.progress+4);
            const bar=document.querySelector('.run-progress i');if(bar)bar.style.width=state.progress+'%';
            const pct=document.querySelector('.run-banner-right strong.mono');if(pct)pct.textContent=state.progress+'%';
            if(state.progress>=100){clearInterval(t);state.running=false;toast('Follow-up complete','Case workspace updated with new findings.','success');renderView();renderContext();}},900);
          state.timers.push(t);
        } else { toast('Enter a question','Describe what you want AXIOM to investigate next.','warning'); }
        return;
      }
      case 'use-prompt': { const ta=document.getElementById('promptInput'); if(ta){ta.value=actEl.dataset.prompt;ta.focus();state.prompt=ta.value;updateCount();} return; }
      case 'remove-attachment': actEl.closest('.file-pill').remove(); toast('Attachment removed','Evidence reference cleared from prompt.'); return;
      case 'toggle-autonomous': actEl.classList.toggle('on'); state.autonomous=!state.autonomous; toast('Resource selection',state.autonomous?'Autonomous mode enabled. Agents, tools and skills will be selected automatically.':'Manual mode enabled. You will approve each resource.'); return;
      case 'toggle-agent': {
        const a=DATA.agents.find(x=>x.id===state.selected.agent);
        a.status=a.status==='active'?'idle':'active'; actEl.classList.toggle('on',a.status==='active');
        toast(`${a.name}`,`Agent ${a.status==='active'?'enabled and available for delegation':'placed on standby'}.`,'success'); return;
      }
      case 'toggle-tool': {
        const tile=actEl.closest('.tile'); const name=tile?.querySelector('h4')?.textContent;
        const t=DATA.tools.find(x=>x.name===name); if(t){t.authorized=!t.authorized;toast(`${t.name}`,`Agent access ${t.authorized?'granted':'revoked'} for this workspace.`,'success');}
        actEl.classList.toggle('on'); return;
      }
      case 'toggle-server': {
        const srv=DATA.servers[state.selected.server];
        srv.status=srv.status==='connected'?'disabled':'connected'; actEl.classList.toggle('on',srv.status==='connected');
        toast(srv.name,`Server ${srv.status==='connected'?'enabled':'disabled'}.`,'success'); return;
      }
      case 'toggle-perm': actEl.classList.toggle('on'); toast('Permission updated','Plugin access scope changed for this workspace.','success'); return;
      case 'toggle-plugin': {
        const pl=DATA.plugins[+id];
        pl.status=pl.status==='installed'?'available':'installed';
        toast(pl.name,pl.status==='installed'?'Installed. Available to authorized agents.':'Removed from workspace.','success');
        renderView(); return;
      }
      case 'select-agent': state.selected.agent=id; renderView(); return;
      case 'select-evidence': state.selected.evidence=+id; renderView(); return;
      case 'select-plugin': state.selected.plugin=+id; renderView(); return;
      case 'select-skill': state.selected.skill=+id; renderView(); return;
      case 'select-server': state.selected.server=+id; renderView(); return;
      case 'select-node': state.graphNode=id; renderView(); return;
      case 'case-tab': state.caseTab=actEl.dataset.tab; renderView(); return;
      case 'settings-tab': state.settingsTab=+id; renderView(); return;
      case 'toggle-skill': {e.stopPropagation();const sk=DATA.skills[+id];sk.status=sk.status==='enabled'?'disabled':'enabled';actEl.classList.toggle('on');toast(sk.name,sk.status==='enabled'?'Skill enabled for the orchestrator.':'Skill disabled.','success');return;}
      case 'open-case': state.case=id||'INV-2041'; state.caseTab='overview'; navigate('case',true); return;
      case 'approve': closeModal(); toast('Request approved','Decision recorded in the case audit log.','success'); return;
      case 'deny': closeModal(); toast('Request denied','Agent was instructed to use an alternative source.','warning'); return;
      case 'close-modal': closeModal(); closePopover(); return;
      case 'export-dialog': modalExport(); return;
      case 'do-export': {
        closeModal(); const fmt=actEl.dataset.format;
        const body=DATA.findings.map(f=>`${f.status.toUpperCase()} | ${f.conf}% | ${f.title}\n  ${f.detail}\n  Source: ${f.source}`).join('\n\n');
        if(fmt==='JSON') downloadFile('INV-2041-report.json',JSON.stringify({case:'INV-2041',title:'Operation Silent Ledger',findings:DATA.findings,evidence:DATA.evidence},null,2),'application/json');
        else if(fmt==='CSV') downloadFile('INV-2041-findings.csv','status,confidence,title,source\n'+DATA.findings.map(f=>`${f.status},${f.conf},"${f.title}","${f.source}"`).join('\n'),'text/csv');
        else if(fmt==='Markdown') downloadFile('INV-2041-report.md','# Operation Silent Ledger\n\n'+body,'text/markdown');
        else downloadFile('INV-2041-report.html',`<html><head><title>Operation Silent Ledger</title></head><body><h1>Operation Silent Ledger</h1><pre>${H.esc(body)}</pre></body></html>`,'text/html');
        return;
      }
      case 'export-cases': downloadFile('investigations.csv','id,title,status,confidence,evidence,updated\n'+DATA.investigations.map(i=>`${i.id},"${i.title}",${i.status},${i.confidence},${i.evidence},"${i.updated}"`).join('\n'),'text/csv'); return;
      case 'export-evidence': downloadFile('INV-2041-evidence-manifest.json',JSON.stringify(DATA.evidence,null,2),'application/json'); return;
      case 'export-graph': downloadFile('INV-2041-graph.json',JSON.stringify({nodes:DATA.graphNodes,edges:DATA.graphEdges},null,2),'application/json'); return;
      case 'copy-log': copyText([...document.querySelectorAll('.log-line')].map(l=>l.textContent.trim()).join('\n'),'Execution log copied.'); return;
      case 'share-case': copyText(`${location.origin}${location.pathname}#/case/${state.case}`,'Case link copied to clipboard.'); return;
      case 'close-tab': e.stopPropagation(); state.tabs=state.tabs.filter(t=>t!==id); if(state.screen===id) navigate(state.tabs[0]||'command'); else renderTabs(); return;
      case 'pause-run': state.running=false; toast('Execution paused','Phase 3 paused at task 14/23.','warning'); return;
      case 'step-run': state.progress=Math.min(100,state.progress+3); renderView(); toast('Single step executed','Correlation Agent advanced one task.','success'); return;
      case 'cancel-run': modalConfirmCancel(); return;
      case 'confirm-cancel': closeModal(); state.running=false; state.progress=0; renderView(); toast('Investigation cancelled','Partial results preserved in the case vault.','danger'); return;
      case 'set-theme': setTheme(actEl.dataset.themeValue); renderView(); return;
      case 'select-model': closePopover(); selectModel(actEl.dataset.value); return;
      case 'select-workspace': closePopover(); selectWorkspace(actEl.dataset.value); return;
      case 'model-menu': {
        const models=['Axiom Reasoner 3','Axiom Reasoner 3 Fast','Axiom Vision 2','Claude Opus 4'];
        openPopover(actEl,`<div class="popover-head"><strong>AI model</strong><span>Used for new investigations</span></div>${models.map(m=>`<button class="popover-item ${m===state.model?'active':''}" data-action="select-model" data-value="${m}">${IC('sparkles',14)}<span>${m}</span>${m===state.model?`<span class="popover-check">${IC('check',13)}</span>`:''}</button>`).join('')}`); return;
      }
      case 'workspaceSwitch': {
        const ws=['Northstar Investigations','Regulatory Response Unit','Personal Sandbox'];
        openPopover(actEl,`<div class="popover-head"><strong>Workspace</strong><span>Switches vault and policy scope</span></div>${ws.map(w=>`<button class="popover-item ${w===state.workspace?'active':''}" data-action="select-workspace" data-value="${w}">${IC('building',14)}<span>${w}</span>${w===state.workspace?`<span class="popover-check">${IC('check',13)}</span>`:''}</button>`).join('')}`); return;
      }
      case 'userMenu': openPopover(actEl,`<div class="popover-head"><strong>Vedant Kulkarni</strong><span>Lead Investigator · ${H.esc(state.workspace)}</span></div>
        <button class="popover-item" data-action="help">${IC('help',14)} Help & documentation</button>
        <button class="popover-item" data-action="shortcuts">${IC('command',14)} Keyboard shortcuts</button>
        <button class="popover-item" data-nav="settings">${IC('settings',14)} Account settings</button>
        <div class="popover-sep"></div><button class="popover-item" data-action="signout">${IC('lock',14)} Lock workspace</button>`); return;
      case 'notificationBtn': openPopover(actEl,`<div class="popover-head"><strong>Notifications</strong><span>${state.notifications.length} unread</span></div>${state.notifications.map(n=>`<div class="notification-item"><span class="dot ${n.tone}"></span><div><strong>${n.title}</strong><span>${n.detail}</span></div></div>`).join('')}<div class="popover-sep"></div><button class="popover-item" data-action="clear-notifications">${IC('check',14)} Mark all as read</button>`); return;
      case 'clear-notifications': state.notifications=[]; store.set('notifications',[]); closePopover(); syncGlobalChrome(); toast('Notifications cleared','All caught up.','success'); return;
      case 'shortcuts': closePopover(); openInfoModal('command','Keyboard shortcuts','Work faster across the application.',`<div class="kv" style="grid-template-columns:180px 1fr"><dt>Command palette</dt><dd>⌘ / Ctrl + K</dd><dt>New investigation</dt><dd>⌘ / Ctrl + N</dd><dt>CAPABILITIES tabs</dt><dd>⌘ / Ctrl + 1–5</dd><dt>Toggle theme</dt><dd>⌘ / Ctrl + Shift + L</dd><dt>Toggle sidebar</dt><dd>⌘ / Ctrl + \\</dd><dt>Close overlays</dt><dd>Esc</dd></div>`); return;
      case 'help': closePopover(); openInfoModal('book','Help & documentation','Everything you need to run an authorized investigation.',`<div class="stack gap-3"><div class="callout">${IC('command',14)} <div><strong>Start with a prompt.</strong> AXIOM plans the investigation, selects agents and tools, and cites every finding.</div></div><div class="callout warning">${IC('shieldCheck',14)} <div><strong>Human approvals.</strong> Sensitive external actions pause for your decision and are recorded in the audit log.</div></div><div class="callout success">${IC('network',14)} <div><strong>Read the graph.</strong> Solid edges are verified; dashed are hypotheses; dotted are unverified.</div></div></div>`); return;
      case 'signout': closePopover(); openInfoModal('lock','Workspace locked','Your case data remains encrypted on this device.',`<div class="callout">${IC('lock',14)} <div>In a deployed build this would end the session and require re-authentication.</div></div>`); return;
      case 'retry': toast('Retrying connection','Attempt 3 of 3 · chain-index-mcp','warning'); return;
      case 'verify-all': toast('Integrity check passed','536 items verified · no mismatches found.','success'); return;
      case 'save-note': store.set('analystNote',document.querySelector('.panel textarea')?.value||''); toast('Note saved','Analyst note appended to case activity.','success'); return;
      case 'save-skill': case 'save-settings': store.set('workspaceSettings',Date.now()); toast('Changes saved','Configuration updated for this workspace.','success'); return;
      case 'test-skill': case 'test-connection': toast('Check complete','All checks passed · connection healthy.','success'); return;
      case 'skill-suggest': toast('3 skills recommended','beneficial-ownership-trace · claims-adjudication · metadata-consistency-audit','success'); return;
      case 'templates': modalTemplates(); return;
      case 'attach': case 'import-plugin': case 'import-skill': case 'upload': pickFiles(a==='attach'?'composer':'workspace'); return;
      case 'new-agent': openFormModal('Create agent',[
        {key:'name',label:'AGENT NAME',required:true,placeholder:'e.g. Media Forensics Agent'},
        {key:'role',label:'ROLE',required:true,placeholder:'What this agent specializes in'},
        {key:'tools',label:'TOOLS (COMMA SEPARATED)',placeholder:'OCR, Metadata reader'}
      ],v=>{DATA.agents.push({id:'custom-'+Date.now(),name:v.name,role:v.role,icon:'bot',tone:'accent',status:'idle',tasks:0,success:'—',calls:'0',tools:v.tools.split(',').map(x=>x.trim()).filter(Boolean),perms:['Case-scoped access'],desc:v.role});renderView();toast('Agent created',`${v.name} is available for delegation.`,'success');}); return;
      case 'new-skill': openFormModal('Create skill',[
        {key:'name',label:'SKILL NAME',required:true,placeholder:'e.g. domain age correlation',mono:true},
        {key:'desc',label:'DESCRIPTION',required:true,placeholder:'What the skill does'}
      ],v=>{DATA.skills.push({name:v.name,desc:v.desc,cat:'Custom',status:'enabled',version:'0.1',runs:'0',deps:[],compat:'All agents'});renderView();toast('Skill created',`${v.name} saved to the library.`,'success');}); return;
      case 'add-server': openFormModal('Add MCP server',[
        {key:'name',label:'SERVER NAME',required:true,placeholder:'e.g. public-records-mcp',mono:true},
        {key:'url',label:'ENDPOINT',required:true,placeholder:'https://mcp.example.io/mcp',mono:true},
        {key:'auth',label:'AUTHENTICATION',placeholder:'OAuth 2.1'}
      ],v=>{DATA.servers.push({name:v.name,type:'Remote · Streamable HTTP',url:v.url,status:'connected',tools:0,resources:0,uptime:'—',latency:'—',auth:v.auth||'None',icon:'server',color:'#4f46e5'});state.selected.server=DATA.servers.length-1;renderView();toast('Server added',`${v.name} connected. Grant tool access before use.`,'success');}); return;
      case 'connect-tool': openFormModal('Connect tool',[
        {key:'name',label:'TOOL NAME',required:true,placeholder:'e.g. Domain risk feed'},
        {key:'cat',label:'CATEGORY',placeholder:'Enrichment'}
      ],v=>{DATA.tools.push({name:v.name,cat:v.cat||'Integration',icon:'link',status:'operational',uses:'0',rate:'—',auth:'API key',agents:'0 agents'});renderView();toast('Tool connected',`${v.name} added to the tool hub.`,'success');}); return;
      case 'remove-server': {
        const srv=DATA.servers[state.selected.server];
        const m=document.getElementById('modalHost'); m.className='modal';
        m.innerHTML=`<div class="modal-head"><span class="modal-icon danger">${IC('trash',17)}</span><div><h3>Remove ${H.esc(srv.name)}?</h3><p>Its tools will no longer be available to agents. Case data already collected is retained.</p></div></div><div class="modal-body"><div class="callout warning">${IC('alert',14)} <div>This action is recorded in the audit log.</div></div></div><div class="modal-foot"><button class="btn" data-action="close-modal">Cancel</button><button class="btn danger" data-action="confirm-remove-server">${IC('trash',12)} Remove server</button></div>`;
        document.getElementById('modalOverlay').hidden=false; return;
      }
      case 'confirm-remove-server': { const name=DATA.servers[state.selected.server].name; DATA.servers.splice(state.selected.server,1); state.selected.server=0; closeModal(); renderView(); toast('Server removed',`${name} disconnected from the workspace.`,'success'); return; }
      case 'reconnect-server': { const s=DATA.servers[state.selected.server]; s.status='connected'; renderView(); toast('Reconnected',`${s.name} is healthy.`,'success'); return; }
      case 'graph-fit': toast('View reset','Graph fitted to all 9 entities.','success'); return;
      case 'new-case': navigate('command'); toast('New investigation','Describe the objective to generate a plan.','success'); return;
      case 'plugin-settings': openInfoModal('settings','Plugin configuration','Domain Compass · v3.2.1',`<div class="kv" style="grid-template-columns:150px 1fr"><dt>Scope</dt><dd>case-only</dd><dt>Timeout</dt><dd>30000 ms</dd><dt>Cache</dt><dd>enabled</dd><dt>Runtime</dt><dd>sandboxed · signed</dd></div>`); return;
      case 'edit-env': openInfoModal('key','Environment variable','Values are masked and encrypted at rest.',`<div class="kv" style="grid-template-columns:140px 1fr"><dt>Name</dt><dd>MCP_TOKEN</dd><dt>Value</dt><dd>••••••••••••••••</dd><dt>Scope</dt><dd>server process</dd></div>`); return;
      case 'storage': openInfoModal('database','Storage management','Vault usage and retention policy.',`<div class="kv" style="grid-template-columns:150px 1fr"><dt>Used</dt><dd>12.4 GB of 500 GB</dd><dt>Backup</dt><dd>Daily 02:00 UTC · 3 immutable copies</dd><dt>Retention</dt><dd>7 years with legal hold</dd></div>`); return;
      case 'server-directory': openInfoModal('globe','MCP server directory','Curated integrations approved for this workspace.',`<div class="stack gap-2"><div class="list-row"><span class="tile-logo" style="background:#4f46e5">${IC('database',15)}</span><div class="grow"><strong>public-records-mcp</strong><small>Verified · 18 tools</small></div><span class="badge success">Connected</span></div><div class="list-row"><span class="tile-logo" style="background:#0f766e">${IC('vault',15)}</span><div class="grow"><strong>case-vault-mcp</strong><small>Verified · 9 tools</small></div><span class="badge success">Connected</span></div><div class="list-row"><span class="tile-logo" style="background:#be123c">${IC('target',15)}</span><div class="grow"><strong>threat-feed-mcp</strong><small>Verified · 7 tools</small></div><span class="badge warning">Degraded</span></div></div>`); return;
      case 'report-customize': openInfoModal('report','Report customization','Choose which sections appear in the exported report.',`<div class="stack gap-2">${['Executive summary','Methodology','Key findings','Evidence appendix','Relationship diagram','Unresolved questions'].map(s=>`<div class="switch-row"><strong>${s}</strong><span class="switch on"></span></div>`).join('')}</div>`); return;
      case 'evidence-access': openInfoModal('eye','Access history','EV-0812 · wire_transfer_record.pdf',`<div class="table-wrap"><table class="table"><thead><tr><th>ACTOR</th><th>ACTION</th><th>TIME</th></tr></thead><tbody><tr><td>V. Kulkarni</td><td>Viewed</td><td class="mono">14:09</td></tr><tr><td>Verification Agent</td><td>Read hash</td><td class="mono">13:48</td></tr><tr><td>System</td><td>Integrity check</td><td class="mono">14:04</td></tr></tbody></table></div>`); return;
    }
  }
  if(navEl){ navigate(navEl.dataset.nav); return; }
});
function modalConfirmCancel(){
  const m=document.getElementById('modalHost'); m.className='modal';
  m.innerHTML=`<div class="modal-head"><span class="modal-icon danger">${IC('stop',17)}</span><div><h3>Cancel investigation?</h3><p>Active agents will stop. Collected evidence and completed findings remain in the case vault.</p></div></div>
    <div class="modal-body"><div class="callout warning">${IC('alert',14)} <div>9 of 23 tasks will be left incomplete. This action is recorded in the audit log.</div></div></div>
    <div class="modal-foot"><button class="btn" data-action="close-modal">Keep running</button><button class="btn danger" data-action="confirm-cancel">${IC('stop',12)} Cancel investigation</button></div>`;
  document.getElementById('modalOverlay').hidden=false;
}
function modalTemplates(){
  const m=document.getElementById('modalHost'); m.className='modal wide';
  const tpl=[['Shell entity network mapping','Ownership, addresses and linked identifiers','network'],['Document authenticity audit','Metadata, OCR and provenance checks','fingerprint'],['Impersonation investigation','Domain, visual clone and infrastructure','globe'],['On-chain flow tracing','Wallet clustering and transaction narrative','chain'],['Vendor sanctions due diligence','Registry, sanctions and adverse media','scale'],['Scam narrative analysis','Message patterns and coercion signals','crosshair']];
  m.innerHTML=`<div class="modal-head"><span class="modal-icon accent">${IC('layers',17)}</span><div><h3>Investigation templates</h3><p>Start from a structured objective. You can edit the prompt before the plan is generated.</p></div></div>
    <div class="modal-body"><div class="tile-grid">${tpl.map(t=>`<div class="tile" data-action="template-pick"><div class="tile-top"><span class="tool-logo">${IC(t[2],16)}</span><h4>${t[0]}</h4></div><p>${t[1]}</p><div class="tile-foot"><span class="tile-meta">Template</span><span class="text-link">Use ${IC('arrowRight',12)}</span></div></div>`).join('')}</div></div>
    <div class="modal-foot"><button class="btn" data-action="close-modal">Close</button></div>`;
  document.getElementById('modalOverlay').hidden=false;
}
document.addEventListener('click',e=>{
  if(e.target.closest('[data-action="template-pick"]')){
    closeModal(); navigate('command');
    const ta=document.getElementById('promptInput');
    if(ta){ta.value='Investigate a suspected shell-company network behind unpaid invoices. Map ownership, trace payments and assess source reliability.';state.prompt=ta.value;ta.focus();updateCount();}
  }
});

/* input / filters / theme */
document.addEventListener('input',e=>{
  if(e.target.id==='promptInput') updateCount();
  if(e.target.dataset.filter==='agents'){
    const q=e.target.value.toLowerCase();
    document.querySelectorAll('.agent-row').forEach(r=>r.style.display=r.textContent.toLowerCase().includes(q)?'':'none');
  }
});
function updateCount(){ const el=document.getElementById('promptCount'), ta=document.getElementById('promptInput'); if(el&&ta) el.textContent=ta.value.length+' / 4000'; }
document.addEventListener('keydown',e=>{
  const meta=e.metaKey||e.ctrlKey;
  if(meta&&e.key.toLowerCase()==='k'){e.preventDefault();document.getElementById('paletteOverlay').hidden?openPalette():closePalette();}
  if(meta&&e.shiftKey&&e.key.toLowerCase()==='l'){e.preventDefault();setTheme(state.theme==='dark'?'light':'dark');}
  if(meta&&e.key==='\\'){e.preventDefault();document.getElementById('sidebarToggle').click();}
  if(meta&&e.key.toLowerCase()==='n'){e.preventDefault();navigate('command');document.getElementById('promptInput')?.focus();}
  if(meta&&!e.shiftKey&&/^[1-5]$/.test(e.key)){e.preventDefault();navigate(CAP_IDS[+e.key-1]);}
  if(e.key==='Escape'){closePalette();closeModal();closePopover();contextMenu.hidden=true;}
  if(!document.getElementById('paletteOverlay').hidden){
    if(e.key==='ArrowDown'){e.preventDefault();paletteIndex=Math.min(paletteFiltered.length-1,paletteIndex+1);drawPalette();}
    if(e.key==='ArrowUp'){e.preventDefault();paletteIndex=Math.max(0,paletteIndex-1);drawPalette();}
    if(e.key==='Enter'&&paletteFiltered[paletteIndex]){e.preventDefault();const it=paletteFiltered[paletteIndex];closePalette();it.action();}
  }
  if(e.key==='Enter'&&(meta||e.ctrlKey)&&state.screen==='command'){e.preventDefault();launch();}
});
document.getElementById('paletteInput').addEventListener('input',()=>{paletteIndex=0;drawPalette();});
document.getElementById('paletteOverlay').addEventListener('click',e=>{ if(e.target.id==='paletteOverlay')closePalette(); const it=e.target.closest('[data-pi]'); if(it){paletteIndex=+it.dataset.pi;paletteFiltered[paletteIndex].action();closePalette();} });
document.getElementById('modalOverlay').addEventListener('click',e=>{if(e.target.id==='modalOverlay')closeModal();});

/* theme */
function setTheme(t){ state.theme=t; document.documentElement.dataset.theme=t; store.set('theme',t); }
function syncGlobalChrome(){
  document.querySelector('.ws-text strong').textContent=state.workspace;
  document.querySelector('.model-picker span:nth-child(2)').textContent=state.model;
  const badge=document.querySelector('.notify-dot'); if(badge) badge.hidden=state.notifications.length===0;
}
function selectModel(name){ state.model=name; store.set('model',name); syncGlobalChrome(); renderView(); toast('Model changed',`${name} will be used for new investigations.`,'success'); }
function selectWorkspace(name){ state.workspace=name; store.set('workspace',name); syncGlobalChrome(); renderContext(); toast('Workspace switched',name,'success'); }

/* sidebar / context / resizers */
document.getElementById('sidebarToggle').addEventListener('click',()=>{state.sidebarCollapsed=!state.sidebarCollapsed;document.getElementById('sidebar').classList.toggle('collapsed',state.sidebarCollapsed);});
document.getElementById('themeToggle').addEventListener('click',()=>setTheme(state.theme==='dark'?'light':'dark'));
document.getElementById('globalSearch').addEventListener('click',openPalette);
document.getElementById('contextCollapse').addEventListener('click',()=>{state.contextCollapsed=true;document.getElementById('app').classList.add('panel-hidden');});
document.getElementById('contextReopen').addEventListener('click',()=>{state.contextCollapsed=false;document.getElementById('app').classList.remove('panel-hidden');});
function wireResizer(id,cssVar,elementId,min,max,invert){
  const r=document.getElementById(id); let startX,startW;
  r.addEventListener('mousedown',e=>{e.preventDefault();r.classList.add('dragging');startX=e.clientX;startW=document.getElementById(elementId).getBoundingClientRect().width;
    const move=ev=>{const d=(ev.clientX-startX)*(invert?-1:1);const w=Math.min(max,Math.max(min,startW+d));document.documentElement.style.setProperty(cssVar,w+'px');};
    const up=()=>{r.classList.remove('dragging');window.removeEventListener('mousemove',move);window.removeEventListener('mouseup',up);};
    window.addEventListener('mousemove',move);window.addEventListener('mouseup',up);
  });
}
wireResizer('resizerLeft','--w-sidebar','sidebar',60,380,false);
wireResizer('resizerRight','--w-context','contextPanel',260,520,true);

/* drag & drop attachment affordance */
document.addEventListener('dragover',e=>{if(e.dataTransfer&&e.dataTransfer.types.includes('Files')){e.preventDefault();const dz=document.getElementById('dropzone');if(dz)dz.classList.add('dragging');}});
document.addEventListener('dragleave',e=>{if(e.target.id==='dropzone')e.target.classList.remove('dragging');});
document.addEventListener('drop',e=>{e.preventDefault();const dz=document.getElementById('dropzone');if(dz)dz.classList.remove('dragging');if(e.dataTransfer?.files?.length){const names=[...e.dataTransfer.files].map(f=>f.name).join(', ');toast('Evidence attached',`${e.dataTransfer.files.length} file(s) queued for hashing: ${names}`,'success');}});

/* contextual menu */
const contextMenu=document.getElementById('contextMenu');
document.addEventListener('contextmenu',e=>{ if(!e.target.closest('.table tbody tr,.list-row,.tile'))return; e.preventDefault();
  contextMenu.innerHTML=`<button class="menu-item">${IC('eye',14)} Inspect details</button><button class="menu-item">${IC('link',14)} Copy reference</button><button class="menu-item">${IC('external',14)} Open in new tab</button><div class="menu-item sep"></div><button class="menu-item danger">${IC('trash',14)} Remove from case</button>`;
  contextMenu.style.left=Math.min(e.clientX,window.innerWidth-200)+'px'; contextMenu.style.top=Math.min(e.clientY,window.innerHeight-170)+'px'; contextMenu.hidden=false;
});
document.addEventListener('click',()=>{contextMenu.hidden=true;});

/* global chrome controls */
document.getElementById('modelPicker').addEventListener('click',e=>{e.currentTarget.dataset.action='model-menu';actLike('model-menu',e.currentTarget);delete e.currentTarget.dataset.action;});
document.getElementById('workspaceSwitch').addEventListener('click',e=>{e.currentTarget.dataset.action='workspaceSwitch';actLike('workspaceSwitch',e.currentTarget);delete e.currentTarget.dataset.action;});
document.getElementById('userMenu').addEventListener('click',e=>{e.currentTarget.dataset.action='userMenu';actLike('userMenu',e.currentTarget);delete e.currentTarget.dataset.action;});
document.getElementById('notificationBtn').addEventListener('click',e=>{e.currentTarget.dataset.action='notificationBtn';actLike('notificationBtn',e.currentTarget);delete e.currentTarget.dataset.action;});
function actLike(action,el){
  const fake={target:el,stopPropagation(){}};
  document.querySelectorAll('.popover').forEach(p=>p.hidden=true);
  const html=(action==='model-menu')?modelMenuHTML():(action==='workspaceSwitch')?workspaceMenuHTML():(action==='userMenu')?userMenuHTML():notificationsHTML();
  openPopover(el,html);
}
function modelMenuHTML(){const models=['Axiom Reasoner 3','Axiom Reasoner 3 Fast','Axiom Vision 2','Claude Opus 4'];return `<div class="popover-head"><strong>AI model</strong><span>Used for new investigations</span></div>${models.map(m=>`<button class="popover-item ${m===state.model?'active':''}" data-action="select-model" data-value="${m}">${IC('sparkles',14)}<span>${m}</span>${m===state.model?`<span class="popover-check">${IC('check',13)}</span>`:''}</button>`).join('')}`;}
function workspaceMenuHTML(){const ws=['Northstar Investigations','Regulatory Response Unit','Personal Sandbox'];return `<div class="popover-head"><strong>Workspace</strong><span>Switches vault and policy scope</span></div>${ws.map(w=>`<button class="popover-item ${w===state.workspace?'active':''}" data-action="select-workspace" data-value="${w}">${IC('building',14)}<span>${w}</span>${w===state.workspace?`<span class="popover-check">${IC('check',13)}</span>`:''}</button>`).join('')}`;}
function userMenuHTML(){return `<div class="popover-head"><strong>Vedant Kulkarni</strong><span>Lead Investigator · ${H.esc(state.workspace)}</span></div><button class="popover-item" data-action="help">${IC('help',14)} Help & documentation</button><button class="popover-item" data-action="shortcuts">${IC('command',14)} Keyboard shortcuts</button><button class="popover-item" data-nav="settings">${IC('settings',14)} Account settings</button><div class="popover-sep"></div><button class="popover-item" data-action="signout">${IC('lock',14)} Lock workspace</button>`;}
function notificationsHTML(){return `<div class="popover-head"><strong>Notifications</strong><span>${state.notifications.length} unread</span></div>${state.notifications.map(n=>`<div class="notification-item"><span class="dot ${n.tone}"></span><div><strong>${n.title}</strong><span>${n.detail}</span></div></div>`).join('')}<div class="popover-sep"></div><button class="popover-item" data-action="clear-notifications">${IC('check',14)} Mark all as read</button>`;}
document.addEventListener('click',e=>{ if(!e.target.closest('.popover')&&!e.target.closest('#modelPicker,#workspaceSwitch,#userMenu,#notificationBtn')) closePopover(); });

/* boot */
const savedTheme=store.get('theme',null); if(savedTheme) setTheme(savedTheme);
const savedNote=store.get('analystNote',null); if(savedNote){ const ta=document.querySelector('textarea'); }
syncGlobalChrome();
renderNav(); renderTabs(); renderView(); renderContext();
