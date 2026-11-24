/* ================= SCREENS B — Vault, Reports, Tools, Plugins, Skills, MCP, Settings, States ================= */

function renderVault() {
  const e = DATA.evidence[state.selected.evidence] || DATA.evidence[0];
  const rows = DATA.evidence.map((x,i)=>`
    <tr class="${i===state.selected.evidence?'selected':''}" data-action="select-evidence" data-id="${i}">
      <td><div class="row gap-2"><span class="thumb">${IC(x.type==='Image'?'image':x.type==='Dataset'?'database':x.type==='Note'?'edit':'file',15)}</span><div><div class="cell-main">${x.name}</div><div class="cell-sub mono">${x.id} · ${x.size}</div></div></div></td>
      <td>${H.statusBadge(x.status)}</td><td class="mono tertiary">${x.hash}</td><td class="mono">${x.source}</td><td>${H.conf(x.confidence)}</td><td class="tertiary">${x.collected}</td></tr>`).join('');
  return `
  <div class="page-head"><div><h1>Digital evidence vault</h1><p>Immutable storage, SHA-256 integrity, provenance and chain of custody for every collected artifact.</p></div>
    <div class="row gap-2"><button class="btn" data-action="verify-all">${IC('shieldCheck',13)} Verify integrity</button><button class="btn primary" data-action="upload">${IC('upload',13)} Add evidence</button></div></div>
  <div class="vault-strip"><span>${IC('lock',13)} <strong>Vault sealed</strong> · AES-256 at rest</span><span class="sep"></span><span>536 items · 12.4 GB</span><span class="sep"></span><span class="badge success">${IC('checkCircle',11)} Last integrity check 4 min ago · all passed</span><span class="spacer"></span><span class="mono tertiary">Retention: 7 years · Legal hold: ON</span></div>
  <div class="vault-layout">
    <div class="stack gap-3">
      <div class="toolbar"><div class="search-input-wrap">${IC('search',14)}<input class="field" placeholder="Search evidence, hashes, sources…"></div><button class="chip active">All 6</button><button class="chip">Verified</button><button class="chip">Unverified</button><button class="chip">Contradicted</button><button class="btn sm">${IC('filter',13)}</button></div>
      <div class="table-wrap"><table class="table"><thead><tr><th style="min-width:250px">ARTIFACT</th><th>STATUS</th><th>SHA-256</th><th>SOURCE</th><th>CONFIDENCE</th><th>COLLECTED</th></tr></thead><tbody>${rows}</tbody></table></div>
    </div>
    <aside class="panel evidence-inspector"><div class="panel-head"><h3>Evidence detail</h3><span class="badge outline mono">${e.id}</span></div><div class="panel-body">
      <div class="evidence-preview">${IC(e.type==='Image'?'image':e.type==='Dataset'?'database':'file',30)}<span class="mono">${e.name}</span><small>Preview available · read-only</small></div>
      <h3 class="h3 mt-4">${e.name}</h3><div class="row gap-2 mt-2">${H.statusBadge(e.status)}${H.conf(e.confidence)}</div>
      <div class="eyebrow mt-5 mb-2">INTEGRITY</div><div class="kv" style="grid-template-columns:96px 1fr"><dt>SHA-256</dt><dd>e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</dd><dt>Verified</dt><dd style="color:var(--success)">${IC('checkCircle',12)} Match at 14:04 UTC</dd><dt>Size</dt><dd>${e.size}</dd></div>
      <div class="eyebrow mt-4 mb-2">CHAIN OF CUSTODY</div><div class="custody">${[['Collected',e.source,e.collected],['Hashed','AXIOM Vault',e.collected],['Analyst review','V. Kulkarni','22 Nov, 14:09']].map((c,i)=>`<div class="custody-step"><span class="custody-dot ${i===0?'first':''}"></span><div><strong>${c[0]}</strong><span>${c[1]}</span><small class="mono">${c[2]}</small></div></div>`).join('')}</div>
      <div class="eyebrow mt-4 mb-2">PROVENANCE</div><p class="muted" style="font-size:11px;line-height:1.6">Collected by ${e.source} under case authorization NS-8821. Original source URL and retrieval headers are preserved in the evidence manifest.</p>
      <div class="row gap-2 mt-4"><button class="btn sm grow" data-action="export-evidence">${IC('download',12)} Export</button><button class="btn sm grow" data-action="evidence-access">${IC('eye',12)} Access log</button></div>
    </div></aside>
  </div>`;
}

function renderReports() {
  return `
  <div class="page-head"><div><h1>Investigation report</h1><p>Operation Silent Ledger · INV-2041 · Draft v4 · Last generated 14:06 UTC</p></div>
    <div class="row gap-2"><span class="badge warning">${IC('clock',11)} 3 sections pending review</span><button class="btn" data-action="report-customize">${IC('settings',13)} Customize</button><button class="btn primary" data-action="export-dialog">${IC('download',13)} Export report</button></div></div>
  <div class="report-layout">
    <aside class="panel report-outline"><div class="panel-head"><h3>Report structure</h3><span class="eyebrow">12 SECTIONS</span></div><div class="outline-list">
      ${[['01','Executive summary','complete'],['02','Scope & authorization','complete'],['03','Investigation methodology','complete'],['04','Key findings','review'],['05','Supporting evidence','complete'],['06','Source citations','complete'],['07','Confidence assessments','review'],['08','Investigation timeline','complete'],['09','Relationship diagram','complete'],['10','Alternative explanations','review'],['11','Unresolved questions','complete'],['12','Appendix & hash manifest','complete']].map(s=>`<div class="outline-item"><span class="mono">${s[0]}</span><span class="grow">${s[1]}</span><span class="dot ${s[2]==='complete'?'success':'warning'}"></span></div>`).join('')}
    </div><div class="panel-body"><div class="callout">${IC('shieldCheck',14)} <div>Every finding is traceable to a source ID and evidence hash. Unverified links are labeled as hypotheses.</div></div></div></aside>
    <section class="panel report-paper">
      <div class="report-toolbar"><div class="segmented"><button class="active">Report</button><button>Draft notes</button><button>Diff v3 → v4</button></div><span class="spacer"></span><span class="mono tertiary">AUTO-SAVED 14:09</span><button class="icon-btn sm">${IC('more',14)}</button></div>
      <div class="report-doc">
        <div class="doc-head"><div class="eyebrow">CONFIDENTIAL · INVESTIGATION REPORT</div><h1>Operation Silent Ledger</h1><p>Cross-border payment fraud & shell-entity network analysis</p><div class="doc-meta"><span>Case INV-2041</span><span>Prepared 24 Nov 2026</span><span>Lead: V. Kulkarni</span><span>Classification: Restricted</span></div></div>
        <h2>01 · Executive summary</h2>
        <p>This investigation examined a network of three corporate entities associated with <strong>northbridge-pay.com</strong> in relation to unpaid invoices totaling approximately USD 1.8M. Public registry records, authorized ledger data and supplied documents were analyzed by six specialist agents under human oversight.</p>
        <p>Strong structural evidence (confidence 92%) indicates the entities share a registered agent and postal address. A traced on-chain flow of 41.2 ETH reached an exchange deposit address within the invoice window (confidence 78%). A possible beneficial-owner overlap remains <strong>unverified</strong> (confidence 46%) and must not be treated as established.</p>
        <h2>04 · Key findings</h2>
        ${DATA.findings.map(f=>`<div class="doc-finding"><span class="badge ${f.status==='verified'?'success':f.status==='hypothesis'?'violet':'danger'}">${H.statusLabel(f.status)}</span> <strong>${f.title}</strong><p>${f.detail}</p><small class="mono">Source: ${f.source} · Confidence ${f.conf}%</small></div>`).join('')}
        <h2>11 · Unresolved questions</h2><ul><li>Identity resolution for the candidate beneficial owner requires a certified registry extract.</li><li>No authoritative evidence yet establishes control of the domain registrant email.</li><li>The three-day discrepancy between invoice and ledger dates remains unreconciled.</li></ul>
        <div class="doc-foot">Generated by AXIOM Report Generation Agent · Human review required before external distribution · Page 1 of 14</div>
      </div>
    </section>
    <aside class="panel report-side"><div class="panel-head"><h3>Report health</h3></div><div class="panel-body">
      <div class="health-row"><span>Source coverage</span><strong>94%</strong></div><div class="progress success"><i style="width:94%"></i></div>
      <div class="health-row mt-4"><span>Claims verified</span><strong>21 / 27</strong></div><div class="progress"><i style="width:78%"></i></div>
      <div class="health-row mt-4"><span>Citation completeness</span><strong>100%</strong></div><div class="progress success"><i style="width:100%"></i></div>
      <div class="eyebrow mt-5 mb-2">EXPORT FORMATS</div><div class="export-grid">${[['PDF','report'],['JSON','code'],['CSV','list'],['Markdown','doc']].map(x=>`<button class="export-tile" data-action="export-dialog">${IC(x[1],16)}<span>${x[0]}</span></button>`).join('')}</div>
      <div class="callout mt-4">${IC('alert',14)} <div><strong>Review required.</strong> Sections 04, 07 and 10 contain unverified claims pending analyst sign-off.</div></div>
    </div></aside>
  </div>`;
}

function renderTools() {
  return `
  <div class="page-head"><div><h1>Tools & integrations</h1><p>Built-in and connected capabilities AXIOM may invoke. Access is governed by case scope and agent permissions.</p></div>
    <div class="row gap-2"><span class="badge success">${IC('checkCircle',11)} 6 operational</span><button class="btn primary" data-action="connect-tool">${IC('plus',13)} Connect tool</button></div></div>
  <div class="tool-tabs"><button class="chip active">All tools 8</button><button class="chip">Collection 3</button><button class="chip">Analysis 2</button><button class="chip">Forensics 1</button><button class="chip">Enrichment 1</button><button class="chip">Output 1</button><span class="spacer"></span><div class="search-input-wrap" style="width:220px">${IC('search',14)}<input class="field" placeholder="Search tools…"></div></div>
  <div class="tile-grid">
    ${DATA.tools.map(t=>`<div class="tile tool-tile"><div class="tile-top"><span class="tool-logo">${IC(t.icon,17)}</span><div class="grow"><h4>${t.name}</h4><span class="eyebrow">${t.cat}</span></div><span class="switch on" data-action="toggle-tool" title="Authorize for autonomous use"></span></div>
      <div class="tool-stats"><div><span>Invocations</span><strong class="mono">${t.uses}</strong></div><div><span>Rate limit</span><strong class="mono">${t.rate}</strong></div><div><span>Auth</span><strong class="mono">${t.auth}</strong></div></div>
      <div class="tile-foot"><span class="badge ${t.status==='operational'?'success':t.status==='degraded'?'warning':'info'}"><span class="dot ${t.status==='operational'?'success':t.status==='degraded'?'warning':'accent'}"></span>${t.status}</span><span class="tile-meta">${IC('bot',12)} ${t.agents}</span></div></div>`).join('')}
  </div>
  <section class="panel mt-5"><div class="panel-head"><h3>Recent tool executions</h3><button class="btn ghost sm" data-nav="orchestrator">View in execution log ${IC('arrowRight',12)}</button></div>
    <div class="table-wrap"><table class="table"><thead><tr><th>TOOL</th><th>AGENT</th><th>CASE</th><th>RESULT</th><th>DURATION</th><th>TIME</th></tr></thead><tbody>
      <tr><td class="cell-main">WHOIS / RDAP</td><td>OSINT Intelligence</td><td class="mono">INV-2041</td><td><span class="badge success">200 OK</span></td><td class="mono">412 ms</td><td class="tertiary">14:02:11</td></tr>
      <tr><td class="cell-main">Hash Verification</td><td>Digital Forensics</td><td class="mono">INV-2041</td><td><span class="badge success">Match</span></td><td class="mono">88 ms</td><td class="tertiary">14:01:42</td></tr>
      <tr><td class="cell-main">Chain Explorer</td><td>Blockchain Analysis</td><td class="mono">INV-2041</td><td><span class="badge warning">Rate limited</span></td><td class="mono">2.1 s</td><td class="tertiary">13:58:09</td></tr>
      <tr><td class="cell-main">Threat Feed</td><td>Threat Intelligence</td><td class="mono">INV-2029</td><td><span class="badge danger">Timeout</span></td><td class="mono">8.0 s</td><td class="tertiary">11:24:33</td></tr>
    </tbody></table></div></section>`;
}

function renderPlugins() {
  const p = DATA.plugins[state.selected.plugin] || DATA.plugins[0];
  return `
  <div class="page-head"><div><h1>Plugin marketplace</h1><p>Extend investigative capability. AXIOM selects installed plugins automatically when the case requires them.</p></div>
    <div class="row gap-2"><button class="btn" data-action="import-plugin">${IC('upload',13)} Import plugin</button><span class="badge accent">3 installed</span></div></div>
  <div class="market-hero"><div><span class="eyebrow">FEATURED COLLECTION</span><h2 class="h2 mt-2">Forensic-grade extensions, vetted for investigations</h2><p class="muted">Signed packages · permission-scoped · version-pinned · auditable execution</p></div><div class="hero-visual">${IC('puzzle',42)}</div></div>
  <div class="tool-tabs"><button class="chip active">Discover</button><button class="chip">Installed 3</button><button class="chip">OSINT</button><button class="chip">Forensics</button><button class="chip">Blockchain</button><button class="chip">Fraud</button><button class="chip">Threat Intel</button><span class="spacer"></span><div class="search-input-wrap" style="width:220px">${IC('search',14)}<input class="field" placeholder="Search plugins…"></div></div>
  <div class="tile-grid">
    ${DATA.plugins.map((x,i)=>`<div class="tile ${i===state.selected.plugin?'tile-selected':''}" data-action="select-plugin" data-id="${i}">
      <div class="tile-top"><span class="tile-logo" style="background:${x.color}">${IC(x.icon,17)}</span><div class="grow"><h4>${x.name}</h4><span class="eyebrow">by ${x.by}</span></div></div>
      <p>${x.desc}</p><div class="row gap-2 mt-3"><span class="badge outline">${x.cat}</span><span class="badge outline">★ ${x.rating}</span><span class="tile-meta">${x.users} users</span></div>
      <div class="tile-foot"><span class="tile-meta mono">v${x.version}</span><button class="btn sm ${x.status==='installed'?'':'primary'}" data-action="toggle-plugin" data-id="${i}">${x.status==='installed'?'Installed':'Install'}</button></div></div>`).join('')}
  </div>
  <section class="panel mt-5"><div class="panel-head"><h3>${p.name} · details & permissions</h3><span class="badge outline mono">v${p.version}</span></div><div class="detail-grid panel-body">
    <div><p class="muted" style="line-height:1.7">${p.desc} The plugin runs in a sandboxed runtime and can only request the capabilities listed here. Every invocation is logged to the case audit trail.</p>
      <div class="callout mt-3">${IC('shieldCheck',14)} <div><strong>Signed & verified</strong> · Publisher ${p.by} · Signature valid · Last scanned 2 days ago</div></div>
      <div class="eyebrow mt-5 mb-2">COMPATIBILITY</div><div class="tag-list"><span class="chip">AXIOM 3.x</span><span class="chip">Desktop · macOS / Windows / Linux</span><span class="chip">Agent runtime 2.4+</span></div></div>
    <div><div class="eyebrow mb-2">REQUESTED PERMISSIONS</div>${p.perms.map(x=>`<div class="perm-row">${IC('lock',13)} <span>${x}</span><span class="switch on" data-action="toggle-perm"></span></div>`).join('')}
      <div class="eyebrow mt-4 mb-2">CONFIGURATION</div><div class="field mono" style="padding:10px;height:auto">{"scope":"case-only","timeout_ms":30000,"cache":true}</div>
      <button class="btn sm full mt-3" data-action="plugin-settings">${IC('settings',12)} Open settings</button></div></div></section>`;
}

function renderSkills() {
  const s = DATA.skills[state.selected.skill] || DATA.skills[0];
  return `
  <div class="page-head"><div><h1>AI skills library</h1><p>Reusable investigative procedures the orchestrator can compose into any plan.</p></div>
    <div class="row gap-2"><button class="btn" data-action="import-skill">${IC('upload',13)} Import</button><button class="btn primary" data-action="new-skill">${IC('plus',13)} New skill</button></div></div>
  <div class="skills-tabs"><div class="subtabs" style="margin:0"><button class="subtab active">Installed <span class="count">5</span></button><button class="subtab" data-action="skill-market">Marketplace</button><button class="subtab">Custom <span class="count">1</span></button><button class="subtab">Execution history</button></div></div>
  <div class="skills-layout">
    <section class="panel"><div class="panel-head"><h3>Skills</h3><div class="search-input-wrap" style="width:170px">${IC('search',13)}<input class="field" placeholder="Filter…"></div></div>
      ${DATA.skills.map((x,i)=>`<div class="skill-row ${i===state.selected.skill?'selected':''}" data-action="select-skill" data-id="${i}"><span class="skill-icon">${IC('sparkles',15)}</span><div class="grow"><strong>${x.name}</strong><small>${x.desc}</small></div><span class="switch ${x.status==='enabled'?'on':''}" data-action="toggle-skill" data-id="${i}"></span></div>`).join('')}
    </section>
    <section class="panel"><div class="panel-head"><h3>Skill editor</h3><div class="row gap-2"><span class="badge outline mono">v${s.version}</span><button class="btn sm" data-action="test-skill">${IC('play',12)} Test</button><button class="btn primary sm" data-action="save-skill">${IC('check',12)} Save</button></div></div>
      <div class="panel-body"><div class="row gap-3"><label class="grow"><span class="field-label">NAME</span><input class="field mono" value="${s.name}"></label><label style="width:120px"><span class="field-label">CATEGORY</span><input class="field" value="${s.cat}"></label></div>
        <label class="mt-3"><span class="field-label">DESCRIPTION</span><input class="field" value="${s.desc}"></label>
        <div class="eyebrow mt-4 mb-2">PROCEDURE</div><div class="code-block"><span class="c"># Trigger: when a case contains corporate registry documents</span>
<span class="k">steps</span>:
  - <span class="k">collect</span>: registry filings for each candidate entity
  - <span class="k">normalize</span>: legal names, addresses, registration numbers
  - <span class="k">compare</span>: shared directors, agents, postal addresses
  - <span class="k">verify</span>: require 2 independent sources per claim
  - <span class="k">output</span>: ownership graph + confidence per link
<span class="k">guardrails</span>:
  - <span class="s">public_sources_only</span>: true
  - <span class="s">human_approval_required</span>: external_lookup</div>
        <div class="detail-grid mt-4"><div><div class="eyebrow mb-2">DEPENDENCIES</div><div class="tag-list">${s.deps.map(d=>`<span class="chip">${IC('link',12)} ${d}</span>`).join('')}</div></div>
          <div><div class="eyebrow mb-2">AGENT COMPATIBILITY</div><div class="tag-list"><span class="chip">${s.compat}</span></div></div></div>
      </div></section>
  </div>
  <div class="test-panel panel mt-4"><div class="panel-head"><h3>Test environment</h3><span class="badge outline mono">SANDBOX · no case data written</span></div><div class="panel-body"><div class="test-console mono"><span class="tertiary">$ axiom skills test ${s.name} --fixture registry_cluster_03</span>\n<span style="color:var(--success)">✓</span> 6 steps executed · 2.4s\n<span style="color:var(--success)">✓</span> 4 entities resolved · 3 shared attributes\n<span style="color:var(--warning)">!</span> 1 link below confidence threshold (0.46)\n<span class="tertiary">Result: PASS with 1 advisory</span></div></div></div>`;
}

function renderMCP() {
  const servers = DATA.servers;
  return `
  <div class="page-head"><div><h1>MCP servers</h1><p>Connect authorized data sources and tools to the orchestrator through the Model Context Protocol.</p></div>
    <div class="row gap-2"><button class="btn" data-action="test-connection">${IC('activity',13)} Test connections</button><button class="btn primary" data-action="add-server">${IC('plus',13)} Add MCP server</button></div></div>
  <div class="mcp-stats"><div class="stat-card"><div class="label">CONNECTED SERVERS</div><div class="value">3 <span class="muted" style="font-size:12px">/ 4</span></div><div class="delta">1 degraded</div></div>
    <div class="stat-card"><div class="label">EXPOSED TOOLS</div><div class="value">45</div><div class="delta">Available to authorized agents</div></div>
    <div class="stat-card"><div class="label">RESOURCES</div><div class="value">35</div><div class="delta">Readable case references</div></div>
    <div class="stat-card"><div class="label">AVG. LATENCY</div><div class="value">96<span style="font-size:12px">ms</span></div><div class="delta">Across all servers</div></div></div>
  <div class="mcp-layout">
    <section class="panel"><div class="panel-head"><h3>Configured servers</h3><button class="btn ghost sm" data-action="server-directory">${IC('globe',12)} Directory</button></div>
      ${servers.map((s,i)=>`<div class="server-row ${i===state.selected.server?'selected':''}" data-action="select-server" data-id="${i}"><span class="tile-logo" style="background:${s.color};width:30px;height:30px">${IC(s.icon,15)}</span>
        <div class="grow"><strong>${s.name}</strong><small>${s.type} · ${s.tools} tools · ${s.resources} resources</small></div><span class="badge ${s.status==='connected'?'success':'warning'}"><span class="dot ${s.status==='connected'?'success':'warning'}"></span>${s.status}</span></div>`).join('')}
      <div class="panel-body"><div class="callout">${IC('shieldCheck',14)} <div><strong>Least privilege by default.</strong> New servers start with no agent access until permissions are explicitly granted.</div></div></div>
    </section>
    <section class="panel"><div class="panel-head"><h3>${servers[state.selected.server].name}</h3><div class="row gap-2"><button class="btn sm" data-action="reconnect-server">${IC('refresh',12)} Reconnect</button><span class="switch on" data-action="toggle-server"></span></div></div>
      <div class="panel-body"><div class="kv" style="grid-template-columns:120px 1fr"><dt>Transport</dt><dd>${servers[state.selected.server].type}</dd><dt>Endpoint</dt><dd>${servers[state.selected.server].url}</dd><dt>Authentication</dt><dd>${servers[state.selected.server].auth}</dd><dt>Uptime (30d)</dt><dd>${servers[state.selected.server].uptime}</dd><dt>Latency</dt><dd>${servers[state.selected.server].latency}</dd></div>
        <div class="subtabs mt-3"><button class="subtab active">Configuration</button><button class="subtab">Tools <span class="count">${servers[state.selected.server].tools}</span></button><button class="subtab">Resources</button><button class="subtab">Logs</button></div>
        <div class="eyebrow mb-2">JSON CONFIGURATION</div><div class="code-block">{
  <span class="s">"mcpServers"</span>: {
    <span class="s">"${servers[state.selected.server].name}"</span>: {
      <span class="s">"transport"</span>: <span class="s">"${servers[state.selected.server].type.includes('stdio')?'stdio':'streamable-http'}"</span>,
      <span class="s">"url"</span>: <span class="s">"${servers[state.selected.server].url}"</span>,
      <span class="s">"auth"</span>: { <span class="s">"type"</span>: <span class="s">"${servers[state.selected.server].auth}"</span>, <span class="s">"envKey"</span>: <span class="s">"MCP_TOKEN"</span> },
      <span class="s">"permissions"</span>: [<span class="s">"tools:read"</span>, <span class="s">"resources:read"</span>],
      <span class="s">"enabled"</span>: <span class="k">true</span>
    }
  }
}</div>
        <div class="eyebrow mt-4 mb-2">ENVIRONMENT VARIABLES</div><div class="env-row"><span class="mono">MCP_TOKEN</span><span class="mono tertiary">••••••••••••••••</span><button class="icon-btn sm" data-action="edit-env">${IC('edit',13)}</button></div>
        <div class="env-row"><span class="mono">MCP_TIMEOUT</span><span class="mono tertiary">30000</span><button class="icon-btn sm" data-action="edit-env">${IC('edit',13)}</button></div>
        <div class="row gap-2 mt-4"><button class="btn sm" data-action="test-connection">${IC('play',12)} Test connection</button><button class="btn sm danger" data-action="remove-server">${IC('trash',12)} Remove</button></div>
      </div></section>
  </div>`;
}

function renderSettings() {
  const nav = [['General','settings'],['AI models','sparkles'],['Agents','bot'],['Security & privacy','shieldCheck'],['Investigation permissions','lock'],['Automation','zap'],['Approvals','scale'],['Notifications','bell'],['Storage','database'],['Audit log','list'],['Appearance','moon'],['Workspaces','building']];
  return `
  <div class="page-head"><div><h1>Settings & administration</h1><p>Workspace-wide policy, model configuration, privacy controls and auditability.</p></div><span class="badge outline">Enterprise plan · 24 seats</span></div>
  <div class="settings-layout">
    <aside class="panel settings-nav">${nav.map((n,i)=>`<button class="settings-nav-item ${i===(state.settingsTab||0)?'active':''}" data-action="settings-tab" data-id="${i}">${IC(n[1],14)} ${n[0]}</button>`).join('')}</aside>
    <section class="panel settings-content"><div class="panel-head"><h3>${nav[state.settingsTab||0][0]}</h3><button class="btn primary sm" data-action="save-settings">${IC('check',12)} Save changes</button></div><div class="panel-body">${H.settingsBody(state.settingsTab||0)}</div></section>
  </div>`;
}

function renderStates() {
  const box = (title, content) => `<section class="panel"><div class="panel-head"><h3>${title}</h3></div><div class="panel-body">${content}</div></section>`;
  return `
  <div class="page-head"><div><h1>Component & interaction states</h1><p>Complete state coverage for loading, empty, error, success, permissions and confirmation patterns.</p></div><span class="badge violet">Design system reference</span></div>
  <div class="states-grid">
    ${box('Loading',`<div class="stack gap-3"><div class="skeleton-line shimmer" style="width:70%"></div><div class="skeleton-line shimmer" style="width:92%"></div><div class="skeleton-line shimmer" style="width:54%"></div><div class="row gap-2 mt-2"><span class="mini-spinner"></span><span class="muted">Collecting sources…</span></div></div>`)}
    ${box('Empty',`<div class="state" style="min-height:170px;padding:18px"><span class="state-icon">${IC('inbox',20)}</span><h3>No investigations yet</h3><p>Start with a prompt. AXIOM will create the plan automatically.</p><button class="btn primary sm" data-nav="command">${IC('plus',12)} New investigation</button></div>`)}
    ${box('Error',`<div class="state" style="min-height:170px;padding:18px"><span class="state-icon danger">${IC('alert',20)}</span><h3>Source unreachable</h3><p>chain-index-mcp returned a timeout. The task was retried twice and paused.</p><button class="btn sm" data-action="retry">${IC('refresh',12)} Retry</button></div>`)}
    ${box('Success',`<div class="state" style="min-height:170px;padding:18px"><span class="state-icon accent">${IC('checkCircle',20)}</span><h3>Evidence verified</h3><p>148 items passed SHA-256 integrity verification. Chain of custody is intact.</p><button class="btn sm" data-nav="vault">${IC('eye',12)} View evidence</button></div>`)}
    ${box('Permission required',`<div class="approval-card" style="margin:0"><span class="approval-icon">${IC('lock',16)}</span><div class="grow"><strong>External lookup requires approval</strong><p>Domain and registration number will be shared with breach-notice registry.</p></div><button class="btn sm" data-action="approve">Approve</button></div>`)}
    ${box('Buttons & states',`<div class="row gap-2 wrap"><button class="btn primary">Primary</button><button class="btn">Secondary</button><button class="btn ghost">Ghost</button><button class="btn danger">Danger</button><button class="btn" disabled>Disabled</button></div><div class="row gap-2 wrap mt-4"><span class="badge accent">Accent</span><span class="badge success">Success</span><span class="badge warning">Warning</span><span class="badge danger">Critical</span><span class="badge outline">Outline</span></div><div class="row gap-2 mt-4"><span class="switch on"></span><span class="switch"></span><span class="chip active">Active chip</span><span class="chip">Chip</span></div>`)}
    ${box('Progress & confidence',`<div class="stack gap-3"><div class="row"><span class="grow">Collection</span><span class="mono">74%</span></div><div class="progress"><i style="width:74%"></i></div><div class="row"><span class="grow">Verification</span><span class="mono">42%</span></div><div class="progress warning"><i style="width:42%"></i></div><div class="row gap-4 mt-2">${H.conf(96)}${H.conf(68)}${H.conf(31)}</div></div>`)}
    ${box('Form validation',`<label class="field-label">MCP endpoint URL</label><input class="field" value="htps://mcp.example.io" style="border-color:var(--danger)"><div class="field-hint" style="color:var(--danger)">${IC('alert',11)} Enter a valid https:// or stdio:// endpoint.</div><label class="field-label mt-4">Display name</label><input class="field" value="Records server"><div class="field-hint">Shown to all workspace members with access.</div>`)}
  </div>
  <section class="panel mt-4"><div class="panel-head"><h3>Typography & color reference</h3></div><div class="panel-body"><div class="type-row"><span class="h1">Heading 1 — 26 / 32 · 640</span><span class="mono tertiary">--text-primary</span></div><div class="type-row"><span class="h2">Heading 2 — 19 / 25 · 620</span><span class="mono tertiary">--text-primary</span></div><div class="type-row"><span class="h3">Heading 3 — 15 / 20 · 600</span><span class="mono tertiary">--text-primary</span></div><div class="type-row"><span>Body — 13 / 20 · 400</span><span class="mono tertiary">--text-secondary</span></div>
    <div class="swatches">${[['--bg-base','#0A0C10'],['--bg-surface','#11141B'],['--bg-elevated','#181C25'],['--border-default','#252A35'],['--accent','#6366F1'],['--violet-500','#8B5CF6'],['--success','#22C55E'],['--warning','#F59E0B'],['--danger','#EF4444']].map(x=>`<div class="swatch"><i style="background:var(${x[0]})"></i><span class="mono">${x[0]}</span><small class="mono tertiary">${x[1]}</small></div>`).join('')}</div></div></section>`;
}
