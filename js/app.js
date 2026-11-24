/* ================= AXIOM — application controller ================= */
const state = {
  screen:'command', theme:'dark', progress:68, running:true,
  sidebarCollapsed:false, contextCollapsed:false, case:'INV-2041', caseTab:'overview',
  selected:{agent:'osint',plugin:0,skill:0,server:0,evidence:0},
  graphNode:'shell1', settingsTab:0, autonomous:true, tabs:['command'], prompt:'', timers:[]
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

/* ------------------------- navigation ------------------------- */
function renderNav(){
  document.getElementById('sidebarNav').innerHTML = `
    <button class="nav-new" data-nav="command" title="New investigation">${IC('plus',15)} New investigation</button>
    ${NAV.map(g=>`<div class="nav-group"><div class="nav-label">${g.group}</div>${g.items.map(it=>`<button class="nav-item ${state.screen===it.id?'active':''}" data-nav="${it.id}" title="${it.label}">
      ${IC(it.icon,16)}<span>${it.label}</span>${it.count?`<span class="nav-count">${it.count}</span>`:''}${it.badge?`<span class="nav-count" style="color:var(--success)">${it.badge}</span>`:''}</button>`).join('')}</div>`).join('')}`;
}
function renderTabs(){
  const labels = {command:'Command Center',orchestrator:'Operation Silent Ledger',case:'INV-2041 · Silent Ledger',graph:'Intelligence graph'};
  document.getElementById('tabstrip').innerHTML = state.tabs.map(t=>`<div class="tab ${t===state.screen?'active':''}" data-nav="${t}">${IC(t==='orchestrator'||t==='case'?'activity':'command',12)}<span>${labels[t]||t[0].toUpperCase()+t.slice(1)}</span>${state.tabs.length>1?`<button class="tab-x" data-action="close-tab" data-id="${t}">${IC('x',11)}</button>`:''}</div>`).join('') + `<button class="tab-add" data-nav="command" title="New tab">${IC('plus',14)}</button>`;
}
const VIEWS = {command:renderCommand,orchestrator:renderOrchestrator,agents:renderAgents,investigations:renderInvestigations,case:renderCase,graph:renderGraph,vault:renderVault,reports:renderReports,tools:renderTools,plugins:renderPlugins,skills:renderSkills,mcp:renderMCP,settings:renderSettings,states:renderStates};

function navigate(screen, addTab){
  if(!VIEWS[screen]) screen='command';
  state.screen=screen;
  if(addTab && !state.tabs.includes(screen)) state.tabs.push(screen);
  if(!state.tabs.includes(screen)) state.tabs.unshift(screen);
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
    extra = `<div class="ctx-section"><div class="ctx-title">Workspace context</div><p class="muted" style="font-size:11px;line-height:1.6">Northstar Investigations · Enterprise plan · 24 seats. All operations are logged and scope-bound.</p></div>
      <div class="ctx-section"><div class="ctx-title">Quick actions</div>${[['command','New investigation','plus'],['investigations','Open cases','cases'],['settings','Administration','settings']].map(x=>`<div class="ctx-row" data-nav="${x[0]}" style="cursor:pointer">${orb(x[2])}<span class="grow">${x[1]}</span>${IC('chevronRight',13)}</div>`).join('')}</div>`;
  }
  b.innerHTML = `<div class="ctx-section"><div class="ctx-title">Execution status <span class="link" data-nav="orchestrator">Details</span></div>
      <div class="row gap-2"><span class="pulse-dot"></span><div class="grow"><strong style="font-size:12px">Investigation running</strong><small class="tertiary">Phase 3 of 6 · ${state.progress}% complete</small></div></div>
      <div class="progress mt-3"><i style="width:${state.progress}%"></i></div>
    </div>${extra}`;
}
function renderView(){ document.getElementById('view').innerHTML = (VIEWS[state.screen]||renderCommand)(); }

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
      case 'toggle-agent': case 'toggle-tool': case 'toggle-server': case 'toggle-perm': case 'toggle-plugin': actEl.classList.toggle('on'); return;
      case 'select-agent': state.selected.agent=id; renderView(); return;
      case 'select-evidence': state.selected.evidence=+id; renderView(); return;
      case 'select-plugin': state.selected.plugin=+id; renderView(); return;
      case 'select-skill': state.selected.skill=+id; renderView(); return;
      case 'select-server': state.selected.server=+id; renderView(); return;
      case 'select-node': state.graphNode=id; renderView(); return;
      case 'case-tab': state.caseTab=actEl.dataset.tab; renderView(); return;
      case 'settings-tab': state.settingsTab=+id; renderView(); return;
      case 'toggle-skill': {e.stopPropagation();const s=DATA.skills[+id];s.status=s.status==='enabled'?'disabled':'enabled';actEl.classList.toggle('on');toast(s.name, s.status==='enabled'?'Skill enabled for the orchestrator.':'Skill disabled.');return;}
      case 'open-case': state.case=id||'INV-2041'; state.caseTab='overview'; navigate('case',true); return;
      case 'approve': closeModal(); toast('Request approved','Decision recorded in the case audit log.','success'); return;
      case 'deny': closeModal(); toast('Request denied','Agent was instructed to use an alternative source.','warning'); return;
      case 'close-modal': closeModal(); return;
      case 'export-dialog': modalExport(); return;
      case 'do-export': closeModal(); toast('Export queued',`${actEl.dataset.format} report is being generated and signed.`,'success'); return;
      case 'close-tab': e.stopPropagation(); state.tabs=state.tabs.filter(t=>t!==id); if(state.screen===id) navigate(state.tabs[0]||'command'); else renderTabs(); return;
      case 'pause-run': state.running=false; toast('Execution paused','Phase 3 paused at task 14/23.','warning'); return;
      case 'step-run': toast('Single step executed','Correlation Agent advanced one task.','success'); return;
      case 'cancel-run': modalConfirmCancel(); return;
      case 'confirm-cancel': closeModal(); state.running=false; state.progress=0; renderView(); toast('Investigation cancelled','Partial results preserved in the case vault.','danger'); return;
      case 'set-theme': setTheme(actEl.dataset.themeValue); renderView(); return;
      case 'retry': toast('Retrying connection','Attempt 3 of 3 · chain-index-mcp','warning'); return;
      case 'verify-all': toast('Integrity check passed','536 items verified · no mismatches found.','success'); return;
      case 'save-note': toast('Note saved','Analyst note appended to case activity.','success'); return;
      case 'save-skill': case 'save-settings': case 'save-skill ': toast('Changes saved','Configuration updated for this workspace.','success'); return;
      case 'test-skill': case 'test-connection': toast('Test complete','All checks passed · connection healthy.','success'); return;
      case 'skill-suggest': toast('3 skills recommended','beneficial-ownership-trace, claims-adjudication, metadata-consistency-audit','success'); return;
      case 'templates': modalTemplates(); return;
      case 'attach': toast('Attach evidence','Drop files into the composer or browse the evidence vault.'); return;
      case 'model-menu': case 'workspaceSwitch': case 'userMenu': case 'notificationBtn': case 'plugin-settings': case 'edit-env': case 'storage': case 'server-directory': case 'import-plugin': case 'import-skill': case 'new-skill': case 'new-agent': case 'connect-tool': case 'share-case': case 'graph-fit': case 'export-cases': case 'report-customize': case 'new-case': case 'evidence-access': case 'export-evidence': case 'export-graph': case 'remove-server': case 'reconnect-server': case 'copy-log':
        toast(H.statusLabel(a).replace(/^./,c=>c.toUpperCase()), 'This action is represented in the prototype and ready for implementation.','success'); return;
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
  if(e.key==='Escape'){closePalette();closeModal();contextMenu.hidden=true;}
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
function setTheme(t){ state.theme=t; document.documentElement.dataset.theme=t; }

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

/* boot */
renderNav(); renderTabs(); renderView(); renderContext();
