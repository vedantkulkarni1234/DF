/* ================= SCREENS A — Command, Orchestration, Agents, Cases, Graph ================= */

function renderCommand() {
  const recents = DATA.investigations.slice(0, 4).map(i => `
    <button class="recent-row" data-action="open-case" data-id="${i.id}">
      <span class="recent-icon ${i.status}">${IC(i.status === 'executing' ? 'activity' : i.status === 'review' ? 'eye' : 'checkCircle')}</span>
      <span class="recent-main"><strong>${i.title}</strong><small>${i.id} · ${i.subject}</small></span>
      <span class="badge ${i.status === 'executing' ? 'accent' : i.status === 'review' ? 'warning' : 'success'}">${H.statusLabel(i.status)}</span>
      <span class="recent-time">${i.updated}</span>${IC('chevronRight', 14)}
    </button>`).join('');

  return `
  <div class="command-home">
    <div class="command-top">
      <div class="mode-select">
        <span class="eyebrow">INVESTIGATION MODE</span>
        <div class="segmented" data-segment="mode">
          <button class="active" data-mode="comprehensive">Comprehensive</button>
          <button data-mode="balanced">Balanced</button>
          <button data-mode="forensics">Forensics</button>
          <button data-mode="quick">Quick scan</button>
        </div>
      </div>
      <div class="command-top-right"><span class="badge outline">${IC('shieldCheck',12)} Authorized scope active</span><button class="btn sm" data-action="templates">${IC('book',13)} Templates</button></div>
    </div>

    <div class="command-hero">
      <div class="hero-symbol"><span>✳</span></div>
      <h1 class="hero-title">What are we investigating?</h1>
      <p class="hero-sub">State the objective in plain language. AXIOM builds the plan, delegates to specialist agents, and returns an evidence-backed report.</p>
    </div>

    <div class="composer" id="composer">
      <div class="composer-top">
        <div class="composer-model" data-action="model-menu">${IC('sparkles',14)} <strong>Axiom Reasoner 3</strong><span class="composer-model-sep"></span><span>Autonomous</span><span class="switch on" data-action="toggle-autonomous" title="Autonomous resource selection"></span>${IC('chevronDown',13)}</div>
        <div class="composer-top-right"><span class="mono tertiary">${IC('lock',12)} Case-scoped & encrypted</span></div>
      </div>
      <textarea class="composer-input" id="promptInput" placeholder="e.g. Investigate a suspected shell-company network behind unpaid invoices linked to northbridge-pay.com. Identify beneficial owners, trace payments, and assess confidence." spellcheck="false"></textarea>
      <div class="composer-attachments" id="composerAttachments">
        <div class="file-pill">${IC('file',13)} invoice_scan_7781.pdf <span class="tertiary mono">2.4 MB</span><button data-action="remove-attachment" aria-label="Remove">${IC('x',12)}</button></div>
        <div class="file-pill">${IC('image',13)} domain_capture.png <span class="tertiary mono">810 KB</span><button data-action="remove-attachment" aria-label="Remove">${IC('x',12)}</button></div>
      </div>
      <div class="dropzone-mini" id="dropzone">${IC('upload',15)} <span>Drop evidence here or <strong data-action="attach">browse files</strong> — AXIOM will index and hash them automatically</span></div>
      <div class="composer-foot">
        <div class="composer-tools">
          <button class="composer-tool" data-action="attach" title="Attach evidence">${IC('attach',16)}</button>
          <button class="composer-tool" data-action="templates" title="Investigation templates">${IC('layers',16)}</button>
          <button class="composer-tool" data-action="skill-suggest" title="Suggested skills">${IC('sparkles',16)}</button>
          <span class="divider-v"></span>
          <span class="composer-hint">${IC('zap',12)} Agents, tools & sources selected automatically</span>
        </div>
        <div class="composer-send-group"><span class="mono tertiary" id="promptCount">0 / 4000</span><button class="btn primary send-btn" data-action="launch">${IC('arrowRight',15)} Start investigation <kbd>⏎</kbd></button></div>
      </div>
    </div>

    <div class="suggestion-section">
      <div class="section-inline-head"><span class="eyebrow">SUGGESTED STARTING POINTS</span><button class="text-link" data-action="templates">Browse all templates ${IC('arrowRight',12)}</button></div>
      <div class="suggestion-grid">
        <button class="suggestion" data-action="use-prompt" data-prompt="Investigate a suspected shell-company network behind unpaid invoices. Map beneficial ownership, trace payments and rate source reliability."><span class="suggestion-icon">${IC('network',15)}</span><span><strong>Map a shell entity network</strong><small>Ownership, addresses, payment links</small></span>${IC('arrowUpRight',13)}</button>
        <button class="suggestion" data-action="use-prompt" data-prompt="Analyze this invoice and supporting documents for metadata inconsistency, alteration signals and conflicting claims."><span class="suggestion-icon">${IC('fingerprint',15)}</span><span><strong>Audit document authenticity</strong><small>Metadata, OCR, provenance</small></span>${IC('arrowUpRight',13)}</button>
        <button class="suggestion" data-action="use-prompt" data-prompt="Trace the public on-chain flow from the attached wallet addresses and summarize likely counterparties with confidence."><span class="suggestion-icon">${IC('chain',15)}</span><span><strong>Trace a wallet cluster</strong><small>Hops, clustering, risk signals</small></span>${IC('arrowUpRight',13)}</button>
        <button class="suggestion" data-action="use-prompt" data-prompt="Determine whether this website impersonates a legitimate service. Capture evidence and identify infrastructure overlaps."><span class="suggestion-icon">${IC('globe',15)}</span><span><strong>Investigate impersonation</strong><small>Domain, visual clone, infrastructure</small></span>${IC('arrowUpRight',13)}</button>
      </div>
    </div>

    <div class="recent-section">
      <div class="section-inline-head"><span class="eyebrow">RECENT INVESTIGATIONS</span><button class="text-link" data-nav="investigations">View workspace ${IC('arrowRight',12)}</button></div>
      <div class="recent-list panel">${recents}</div>
    </div>
    <div class="command-footer-note">${IC('shieldCheck',12)} Lawful-use guardrails are enforced on every run. Sensitive operations pause for human approval. <button class="text-link" data-nav="settings">Review policy</button></div>
  </div>`;
}

function renderOrchestrator() {
  const steps = [
    { n:'01', title:'Objective interpretation', sub:'Scope, constraints, lawful-use check', state:'done', time:'00:04' },
    { n:'02', title:'Investigation planning', sub:'6 phases · 23 tasks · 4 approval gates', state:'done', time:'00:09' },
    { n:'03', title:'Parallel collection', sub:'5 agents · 11 authorized tools', state:'active', time:'running' },
    { n:'04', title:'Correlation & verification', sub:'Entity resolution · claim adjudication', state:'pending', time:'—' },
    { n:'05', title:'Report assembly', sub:'Citations, confidence, unresolved questions', state:'pending', time:'—' }
  ].map(s => `<div class="plan-step ${s.state}">
      <div class="plan-rail"><span class="plan-node">${s.state === 'done' ? IC('check',12) : s.state === 'active' ? '<span class="mini-spinner"></span>' : s.n}</span></div>
      <div class="plan-content"><div class="row"><strong>${s.title}</strong><span class="right mono tertiary">${s.time}</span></div><p>${s.sub}</p></div>
    </div>`).join('');

  const lanes = DATA.agents.slice(0,5).map((a,idx) => {
    const prog = [100,100,74,62,38][idx];
    return `<div class="lane">
      <div class="lane-agent"><span class="agent-orb ${a.tone === 'green' ? 'green' : a.tone === 'amber' ? 'amber' : a.tone === 'violet' ? 'violet' : ''}">${IC(a.icon,13)}</span><div class="lane-name"><strong>${a.name.replace(' Agent','')}</strong><small>${a.role}</small></div></div>
      <div class="lane-task"><span class="mono">${['Collect registry filings','Verify artifact hashes','Trace wallet hops','Resolve domain history','Cluster candidate entities'][idx]}</span><div class="progress ${prog === 100 ? 'success' : ''}"><i style="width:${prog}%"></i></div></div>
      <span class="badge ${prog === 100 ? 'success' : 'accent'}">${prog === 100 ? 'Complete' : prog + '%'}</span>
    </div>`;
  }).join('');

  const logs = [
    ['08:41:02','ORCH','Plan generated · 6 phases, 23 tasks','ok'],
    ['08:41:09','AGENT','OSINT delegated: entity enrichment (4 targets)',''],
    ['08:41:14','TOOL','RDAP lookup · northbridge-pay.com · 200 OK',''],
    ['08:42:38','VAULT','3 artifacts hashed SHA-256 · chain of custody appended','ok'],
    ['08:44:11','AGENT','Fraud Analysis: 41.2 ETH flow detected across 3 hops',''],
    ['08:45:02','POLICY','Approval gate reached · external enrichment request','warn'],
    ['08:45:44','HUMAN','Approved by V. Kulkarni · scope confirmed','ok'],
    ['08:47:19','CORR','8 proposed edges added to case graph (4 unverified)','']
  ].map(l => `<div class="log-line"><span class="log-time">${l[0]}</span><span class="log-tag">${l[1]}</span><span class="log-msg ${l[3]}">${l[2]}</span></div>`).join('');

  return `
  <div class="screen-head">
    <div><div class="breadcrumb">${IC('command',13)} Command Center ${IC('chevronRight',12)} <span>Operation Silent Ledger</span></div>
      <h1 class="h1 mt-2">Autonomous orchestration</h1>
      <p class="muted mt-1">Live coordination of agents, tools and authorization gates for <strong class="mono">INV-2041</strong>.</p></div>
    <div class="row gap-2">
      <button class="btn" data-action="pause-run">${IC('pause',13)} Pause</button>
      <button class="btn" data-action="step-run">${IC('branch',13)} Step</button>
      <button class="btn danger" data-action="cancel-run">${IC('stop',13)} Cancel</button>
    </div>
  </div>

  <div class="run-banner">
    <div class="run-banner-left"><span class="run-pulse">${IC('activity',16)}</span><div><strong>Investigation executing</strong><span>Phase 3 of 6 · Parallel collection · 14 of 23 tasks complete</span></div></div>
    <div class="run-banner-right"><div class="run-progress"><i style="width:${state.progress}%"></i></div><strong class="mono">${state.progress}%</strong><span class="mono tertiary">elapsed 08:47</span></div>
  </div>

  <div class="approval-card">
    <span class="approval-icon">${IC('shieldCheck',16)}</span>
    <div class="grow"><strong>Approval checkpoint · external enrichment</strong><p>The Verification Agent requests a query to an external breach-notice registry. Data shared: domain name and company registration number only.</p></div>
    <button class="btn sm" data-action="deny">Deny</button><button class="btn primary sm" data-action="approve">${IC('check',13)} Approve</button>
  </div>

  <div class="orch-grid">
    <section class="panel">
      <div class="panel-head"><h3>Investigation plan</h3><span class="badge accent">${IC('sparkles',11)} AI generated</span></div>
      <div class="panel-body"><div class="plan-list">${steps}</div>
        <div class="dependency-note">${IC('git',13)} <span>Dependencies auto-resolved · <strong>2 tasks</strong> blocked until verification completes</span></div>
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><h3>Parallel agent execution</h3><button class="btn ghost sm" data-nav="agents">Manage agents ${IC('arrowRight',12)}</button></div>
      <div class="lanes">${lanes}</div>
    </section>
  </div>

  <div class="orch-grid-lower">
    <section class="panel">
      <div class="panel-head"><h3>Execution log</h3><div class="row gap-2"><button class="btn ghost sm" data-action="copy-log">${IC('copy',12)} Copy</button><span class="badge outline mono">live</span></div></div>
      <div class="log-body">${logs}</div>
    </section>
    <section class="panel">
      <div class="panel-head"><h3>Agent communication</h3><span class="eyebrow">LAST 12 MIN</span></div>
      <div class="panel-body comm-list">
        <div class="comm"><span class="agent-orb">${IC('network',12)}</span><p><strong>Correlation → Verification</strong><br>4 proposed entity links require independent corroboration before report inclusion.</p></div>
        <div class="comm"><span class="agent-orb green">${IC('shieldCheck',12)}</span><p><strong>Verification → Orchestrator</strong><br>Registry claim verified across 3 sources · confidence raised to 92%.</p></div>
        <div class="comm"><span class="agent-orb violet">${IC('report',12)}</span><p><strong>Report → Orchestrator</strong><br>Draft section 3 reserved pending contradiction review.</p></div>
      </div>
    </section>
  </div>`;
}

function renderAgents() {
  const selected = DATA.agents.find(a => a.id === state.selected.agent) || DATA.agents[0];
  const list = DATA.agents.map(a => `
    <button class="agent-row ${a.id === selected.id ? 'selected' : ''}" data-action="select-agent" data-id="${a.id}">
      <span class="agent-orb ${a.tone === 'green' ? 'green' : a.tone === 'amber' ? 'amber' : a.tone === 'violet' ? 'violet' : ''}">${IC(a.icon,14)}</span>
      <span class="grow"><strong>${a.name.replace(' Agent','')}</strong><small>${a.role}</small></span>
      <span class="badge ${a.status === 'active' ? 'success' : 'outline'}"><span class="dot ${a.status === 'active' ? 'success' : ''}"></span>${a.status}</span>
    </button>`).join('');

  return `
  <div class="page-head"><div><h1>AI agents</h1><p>Specialized investigators. AXIOM selects and delegates automatically; configure behavior and permissions here.</p></div>
    <div class="row gap-2"><span class="badge outline">${DATA.agents.length} agents installed</span><button class="btn primary" data-action="new-agent">${IC('plus',13)} Create agent</button></div></div>

  <div class="agent-layout">
    <section class="panel agent-list-panel"><div class="panel-head"><h3>Agent registry</h3><span class="eyebrow">${DATA.agents.filter(a=>a.status==='active').length} ACTIVE</span></div>
      <div class="agent-search">${IC('search',14)}<input class="field" id="agentSearch" placeholder="Filter agents…" data-filter="agents"></div>
      <div class="agent-rows" id="agentRows">${list}</div></section>

    <section class="panel agent-detail">
      <div class="agent-detail-head"><span class="agent-orb big ${selected.tone === 'green' ? 'green' : selected.tone === 'amber' ? 'amber' : selected.tone === 'violet' ? 'violet' : ''}">${IC(selected.icon,22)}</span>
        <div class="grow"><h2 class="h2">${selected.name}</h2><p class="muted">${selected.desc}</p></div>
        <div class="switch-row compact"><span class="switch on" data-action="toggle-agent"></span></div>
      </div>
      <div class="agent-metrics">
        <div class="stat-card"><div class="label">TASKS COMPLETED</div><div class="value">${selected.tasks}</div><div class="delta">This quarter</div></div>
        <div class="stat-card"><div class="label">SUCCESS RATE</div><div class="value">${selected.success}%</div><div class="delta">↑ 0.8% vs last quarter</div></div>
        <div class="stat-card"><div class="label">TOOL CALLS</div><div class="value">${selected.calls}</div><div class="delta">All-time</div></div>
      </div>
      <div class="agent-detail-grid">
        <div><div class="eyebrow mb-2">AVAILABLE TOOLS</div><div class="tag-list">${selected.tools.map(t=>`<span class="chip">${IC('tools',12)} ${t}</span>`).join('')}</div></div>
        <div><div class="eyebrow mb-2">PERMISSIONS</div><div class="tag-list">${selected.perms.map(p=>`<span class="chip">${IC('lock',12)} ${p}</span>`).join('')}</div></div>
      </div>
      <div class="panel mt-4"><div class="panel-head"><h3>Assigned tasks</h3><span class="badge accent">Current case</span></div>
        <div class="table-wrap"><table class="table"><thead><tr><th>Task</th><th>Status</th><th>Started</th><th>Confidence</th></tr></thead><tbody>
          <tr><td class="cell-main">Collect registry filings for 4 entities</td><td><span class="badge success">Complete</span></td><td class="mono">08:41</td><td>${H.conf(96)}</td></tr>
          <tr><td class="cell-main">Cross-check address normalization</td><td><span class="badge success">Complete</span></td><td class="mono">08:46</td><td>${H.conf(92)}</td></tr>
          <tr><td class="cell-main">Enrich candidate person entity</td><td><span class="badge accent">Running</span></td><td class="mono">08:52</td><td>${H.conf(46)}</td></tr>
        </tbody></table></div></div>
    </section>
  </div>`;
}

function renderInvestigations() {
  const rows = DATA.investigations.map(i => `
    <tr data-action="open-case" data-id="${i.id}"><td><div class="cell-main">${i.title}</div><div class="cell-sub mono">${i.id} · ${i.subject}</div></td>
      <td><span class="badge ${i.status==='executing'?'accent':i.status==='review'?'warning':'success'}"><span class="dot ${i.status==='executing'?'accent':i.status==='review'?'warning':'success'}"></span>${H.statusLabel(i.status)}</span></td>
      <td>${H.conf(i.confidence)}</td><td class="mono">${i.evidence}</td><td>${i.tags.map(t=>`<span class="badge outline">${t}</span>`).join(' ')}</td><td class="tertiary">${i.updated}</td><td>${IC('chevronRight',14)}</td></tr>`).join('');
  return `
  <div class="page-head"><div><h1>Investigations</h1><p>Every case, its objective, evidence and AI-generated findings in one auditable workspace.</p></div>
    <div class="row gap-2"><button class="btn" data-action="export-cases">${IC('download',13)} Export index</button><button class="btn primary" data-action="new-case">${IC('plus',13)} New investigation</button></div></div>
  <div class="stat-row">
    <div class="stat-card"><div class="label">ACTIVE INVESTIGATIONS</div><div class="value">03</div><div class="delta">1 executing · 2 in review</div></div>
    <div class="stat-card"><div class="label">EVIDENCE ITEMS</div><div class="value">536</div><div class="delta">487 verified hashes</div></div>
    <div class="stat-card"><div class="label">AI FINDINGS</div><div class="value">182</div><div class="delta">41 awaiting review</div></div>
    <div class="stat-card"><div class="label">AVG. CONFIDENCE</div><div class="value">81%</div><div class="delta">Across completed cases</div></div>
  </div>
  <div class="toolbar"><div class="search-input-wrap">${IC('search',14)}<input class="field" placeholder="Search cases, subjects, entities…"></div>
    <button class="chip active">All <span class="mono">5</span></button><button class="chip">Executing</button><button class="chip">In review</button><button class="chip">Completed</button>
    <span class="spacer"></span><button class="btn sm">${IC('filter',13)} Filter</button><button class="btn sm">${IC('list',13)} Last updated ${IC('chevronDown',12)}</button></div>
  <div class="table-wrap scroll-x"><table class="table"><thead><tr><th style="min-width:270px">INVESTIGATION</th><th>STATUS</th><th>CONFIDENCE</th><th>EVIDENCE</th><th>TAGS</th><th>UPDATED</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
  <div class="table-foot"><span>Showing 5 of 5 investigations</span><span class="mono">Workspace: Northstar Investigations</span></div>`;
}

function renderCase() {
  const c = DATA.investigations.find(x => x.id === state.case) || DATA.investigations[0];
  const tab = state.caseTab || 'overview';
  let body = '';
  if (tab === 'overview') {
    body = `<div class="case-grid">
      <div class="stack gap-4">
        <section class="panel"><div class="panel-head"><h3>Objective</h3><span class="badge outline">${c.priority} priority</span></div><div class="panel-body">
          <p class="case-objective">Map the shell-company network linked to <strong>northbridge-pay.com</strong>, identify beneficial owners with defensible confidence, and trace the payment flow associated with unpaid invoices.</p>
          <div class="kv"><dt>Lead analyst</dt><dd>${c.lead}</dd><dt>Authorized scope</dt><dd>Public sources · case vault · authorized ledgers</dd><dt>Opened</dt><dd>2026-11-22 08:41 UTC</dd><dt>Legal basis</dt><dd>Civil fraud investigation · case authorization #NS-8821</dd></div></div></section>
        <section class="panel"><div class="panel-head"><h3>Key findings</h3><button class="btn ghost sm" data-nav="reports">View in report ${IC('arrowRight',12)}</button></div>
          ${DATA.findings.map(f=>`<div class="finding"><div class="row gap-2"><span class="badge ${f.status==='verified'?'success':f.status==='hypothesis'?'violet':'danger'}">${H.statusLabel(f.status)}</span><span class="right">${H.conf(f.conf)}</span></div><h4>${f.title}</h4><p>${f.detail}</p><div class="finding-source">${IC('link',11)} ${f.source} <span class="right mono">${f.time}</span></div></div>`).join('')}
        </section>
      </div>
      <div class="stack gap-4">
        <section class="panel"><div class="panel-head"><h3>Evidence posture</h3><span class="eyebrow">LIVE</span></div><div class="panel-body"><div class="stat-grid-2">
          <div class="stat-tile"><b>148</b><span>Items collected</span></div><div class="stat-tile"><b style="color:var(--success)">112</b><span>Verified</span></div>
          <div class="stat-tile"><b style="color:var(--warning)">21</b><span>Unverified</span></div><div class="stat-tile"><b style="color:var(--danger)">3</b><span>Contradicted</span></div></div>
          <button class="btn sm full mt-3" data-nav="vault">${IC('vault',13)} Open evidence vault</button></div></section>
        <section class="panel"><div class="panel-head"><h3>Investigation timeline</h3><button class="btn ghost sm" data-action="case-tab" data-tab="timeline">Full timeline</button></div><div class="panel-body">${H.timeline(DATA.timeline.slice(0,4))}</div></section>
        <section class="panel"><div class="panel-head"><h3>Entity graph</h3><button class="btn ghost sm" data-nav="graph">Open graph ${IC('arrowRight',12)}</button></div><div class="graph-mini" data-nav="graph">${H.miniGraph()}<div class="graph-mini-overlay"><strong>9 entities · 8 relationships</strong><span>4 proposed links unverified</span></div></div></section>
        <section class="panel"><div class="panel-head"><h3>Ask a follow-up</h3><span class="badge violet">${IC('sparkles',11)} Context aware</span></div><div class="panel-body">
          <textarea class="followup-input" id="followupInput" rows="3" placeholder="Ask AXIOM to investigate a specific entity, verify a claim, or expand the scope…"></textarea>
          <div class="row gap-2 mt-2"><span class="tertiary" style="font-size:10px">Prior evidence and findings are retained</span><button class="btn primary sm right" data-action="follow-up">${IC('send',12)} Send follow-up</button></div>
        </div></section>
      </div></div>`;
  } else if (tab === 'findings') {
    body = `<div class="panel"><div class="panel-head"><h3>Finding ledger</h3><div class="row gap-2"><button class="chip active">All ${DATA.findings.length}</button><button class="chip">Verified 2</button><button class="chip">Hypotheses 1</button><button class="chip">Contradicted 1</button></div></div>
      ${DATA.findings.map(f=>`<div class="finding finding-wide"><div class="row gap-2"><span class="badge ${f.status==='verified'?'success':f.status==='hypothesis'?'violet':'danger'}">${H.statusLabel(f.status)}</span><span class="eyebrow">${f.time} UTC</span><span class="right">${H.conf(f.conf)}</span></div><h4>${f.title}</h4><p>${f.detail}</p><div class="finding-source">${IC('link',11)} ${f.source}</div></div>`).join('')}</div>`;
  } else if (tab === 'timeline') {
    body = `<div class="panel panel-pad"><div class="section-head"><div><div class="h2">Case activity</div><div class="sub">Chronological audit of every automated and human action.</div></div><span class="badge outline mono">UTC</span></div>${H.timeline(DATA.timeline)}</div>`;
  } else if (tab === 'evidence') {
    body = `<div class="toolbar"><div class="search-input-wrap">${IC('search',14)}<input class="field" placeholder="Filter evidence…"></div><button class="chip active">All 148</button><button class="chip">Verified</button><button class="chip">Unverified</button><button class="chip">Contradicted</button><span class="spacer"></span><button class="btn sm" data-nav="vault">${IC('external',12)} Open vault</button></div>
      <div class="table-wrap"><table class="table"><thead><tr><th>EVIDENCE</th><th>TYPE</th><th>STATUS</th><th>HASH</th><th>CONFIDENCE</th><th>COLLECTED</th></tr></thead><tbody>${DATA.evidence.map(e=>`<tr data-nav="vault"><td class="cell-main">${e.name}<div class="cell-sub mono">${e.id}</div></td><td>${e.type}</td><td>${H.statusBadge(e.status)}</td><td class="mono tertiary">${e.hash}</td><td>${H.conf(e.confidence)}</td><td class="tertiary">${e.collected}</td></tr>`).join('')}</tbody></table></div>`;
  } else {
    body = `<div class="panel panel-pad"><div class="section-head"><div><div class="h2">Analyst notes</div><div class="sub">Private to your account. Claim sources are linked to evidence IDs.</div></div><button class="btn primary sm" data-action="save-note">${IC('check',12)} Save note</button></div>
      <textarea class="field" rows="9" style="line-height:1.7">REVIEW NOTE — 22 Nov 2026

The shared registered agent is the strongest structural link so far (3 independent registry records). Treat the R. Venkatesh overlap as a lead only; current evidence is circumstantial.

Next: request certified registry extract before elevating beneficial-owner claim. Verify whether the domain registrant email appears in any other case entity.

Do not include the claimed payment date in the draft report until the metadata contradiction is resolved.</textarea>
      <div class="callout mt-4">${IC('link',14)} <div><strong>Linked claims:</strong> Finding 03 (hypothesis) · Finding 04 (contradicted) · EV-0812, EV-0808</div></div></div>`;
  }

  return `
  <div class="screen-head case-head"><div><div class="breadcrumb" data-nav="investigations" style="cursor:pointer">${IC('cases',13)} Investigations ${IC('chevronRight',12)} <span>${c.id}</span></div>
    <h1 class="h1 mt-2">${c.title}</h1><div class="row gap-3 mt-2"><span class="badge ${c.status==='executing'?'accent':'success'}">${H.statusLabel(c.status)}</span><span class="muted">${c.subject}</span><span class="tertiary mono">${c.id}</span></div></div>
    <div class="row gap-2"><button class="btn" data-action="share-case">${IC('link',13)} Share</button><button class="btn primary" data-nav="reports">${IC('report',13)} Open report</button></div></div>
  <div class="subtabs">${['overview','findings','timeline','evidence','notes'].map(t=>`<button class="subtab ${t===tab?'active':''}" data-action="case-tab" data-tab="${t}">${t[0].toUpperCase()+t.slice(1)}${t==='findings'?'<span class="count">4</span>':''}</button>`).join('')}</div>
  ${body}`;
}

function renderGraph() {
  const nodes = DATA.graphNodes, edges = DATA.graphEdges;
  const edgeSvg = edges.map(([a,b,kind,label]) => {
    const n1 = nodes.find(n=>n.id===a), n2 = nodes.find(n=>n.id===b);
    const mx=(n1.x+n2.x)/2, my=(n1.y+n2.y)/2;
    const cls = kind==='verified'?'edge-verified':kind==='unverified'?'edge-unverified':'edge-hypothesis';
    return `<g class="${cls}"><line x1="${n1.x}" y1="${n1.y}" x2="${n2.x}" y2="${n2.y}"/><text x="${mx}" y="${my-6}" text-anchor="middle">${label}</text></g>`;
  }).join('');
  const nodeSvg = nodes.map(n => {
    const sel = state.graphNode===n.id;
    const r = n.type==='Organization'?22:18;
    return `<g class="gnode ${n.status} ${sel?'selected':''}" data-action="select-node" data-id="${n.id}" transform="translate(${n.x},${n.y})">
      <circle class="halo" r="${r+9}"/><circle class="core" r="${r}"/>
      <text class="node-letter" y="4" text-anchor="middle">${n.label[0]}</text>
      <text class="node-label" y="${r+17}" text-anchor="middle">${n.label}</text>
      <text class="node-sub" y="${r+30}" text-anchor="middle">${n.type} · ${n.conf}%</text></g>`;
  }).join('');
  const sel = nodes.find(n=>n.id===state.graphNode) || nodes[0];
  return `
  <div class="graph-screen">
    <div class="graph-top"><div><h1 class="h1">Intelligence graph</h1><p class="muted mt-1">Case INV-2041 · 9 entities · 8 relationships · 4 unverified</p></div>
      <div class="row gap-2"><div class="segmented"><button class="active">Entities</button><button>Evidence</button><button>Timeline</button><button>Transactions</button></div><button class="btn" data-action="graph-fit">${IC('crosshair',13)} Fit view</button><button class="btn primary" data-action="export-graph">${IC('download',13)} Export graph</button></div></div>
    <div class="graph-layout">
      <div class="graph-canvas panel"><div class="graph-filters"><button class="chip active">All</button><button class="chip">${IC('building',12)} Organizations</button><button class="chip">${IC('fingerprint',12)} People</button><button class="chip">${IC('chain',12)} Wallets</button><button class="chip">${IC('globe',12)} Domains</button><span class="spacer"></span><span class="mono tertiary">Scroll to zoom · drag to pan</span></div>
        <div class="graph-stage"><svg viewBox="0 0 850 500" preserveAspectRatio="xMidYMid meet" class="graph-svg">
          <defs><pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="var(--grid-line)" stroke-width="1"/></pattern></defs>
          <rect width="850" height="500" fill="url(#grid)"/>
          <g class="edges">${edgeSvg}</g>${nodeSvg}
        </svg></div>
        <div class="graph-legend"><span><i class="legend-line solid"></i> Verified</span><span><i class="legend-line dashed"></i> Hypothesized</span><span><i class="legend-line dotted"></i> Unverified</span><span class="right tertiary">Dashed links are proposals, not established facts</span></div>
      </div>
      <aside class="graph-inspector panel"><div class="panel-head"><h3>Node inspector</h3><button class="icon-btn sm">${IC('more',14)}</button></div>
        <div class="panel-body"><div class="inspector-type">${IC(sel.type==='Wallet'?'chain':sel.type==='Person'?'fingerprint':sel.type==='Domain'?'globe':'building',20)}<span class="eyebrow">${sel.type.toUpperCase()}</span></div>
          <h3 class="h2 mt-3">${sel.label}</h3><div class="row gap-2 mt-2">${H.statusBadge(sel.status)}${H.conf(sel.conf)}</div>
          <div class="eyebrow mt-5 mb-2">PROPERTIES</div><div class="kv" style="grid-template-columns:90px 1fr"><dt>Entity ID</dt><dd>ENT-${sel.id.toUpperCase()}</dd><dt>First seen</dt><dd>2026-11-21T09:14Z</dd><dt>Sources</dt><dd>${Math.max(1,Math.round(sel.conf/24))} independent</dd><dt>Last update</dt><dd>14:02 UTC</dd></div>
          <div class="eyebrow mt-4 mb-2">CONNECTED ENTITIES</div><div class="stack gap-2">${edges.filter(e=>e.includes(sel.id)).map(e=>{const other=nodes.find(n=>(e[0]===sel.id&&n.id===e[1])||(e[1]===sel.id&&n.id===e[0]));return `<div class="inspector-link"><span class="dot ${e[2]==='verified'?'success':e[2]==='hypothesis'?'violet':'warning'}"></span><span class="grow">${other.label}<small>${e[3]}</small></span>${IC('chevronRight',13)}</div>`}).join('')}</div>
          <button class="btn full mt-4" data-action="open-case">${IC('external',13)} Open in case workspace</button>
        </div></aside>
    </div>
  </div>`;
}
