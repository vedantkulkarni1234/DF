# 01 · Product Information Architecture — AXIOM

**Product:** AXIOM — Autonomous Intelligence Operating System
**Platform:** Desktop (macOS, Windows, Linux), 1280 × 800 → 2560 × 1440
**IA version:** 1.0 · 24 Nov 2026

---

## 1. Product thesis

AXIOM is not a tool launcher. It is an investigation operating system with one primary input — a natural-language objective — and one primary output — a defensible, evidence-backed report. All capability (agents, tools, plugins, skills, MCP servers) is selected autonomously and remains inspectable, governable and revocable.

The IA follows three rules:

1. **Prompt is the front door.** A user can complete an investigation without ever opening a management screen.
2. **Every automation is legible.** Any delegated action can be inspected, paused, denied or traced to an audit entry.
3. **Epistemic status is a first-class object.** Verified, unverified, hypothesis and contradicted are distinct states everywhere — in tables, graph edges, findings and reports.

---

## 2. Application tree

```
AXIOM
├── 00 · Shell / global furniture
│   ├── Workspace selector (enterprise, restricted unit, personal sandbox)
│   ├── Global search + command palette (⌘K)
│   ├── AI model selector
│   ├── System status / notifications / user preferences
│   ├── Investigation tabs (multiple concurrent sessions)
│   ├── Collapsible + resizable left navigation
│   ├── Collapsible + resizable right contextual panel
│   └── Status bar (agents, MCP servers, tasks, health, status, encryption)
│
├── 01 · AI Investigation Command Center  [primary entry]
│   ├── New investigation
│   ├── Prompt composer (large, intelligent autocomplete)
│   ├── Investigation mode selector (Comprehensive / Balanced / Forensics / Quick)
│   ├── AI model selector + autonomous execution toggle
│   ├── Evidence attachments + drag-and-drop
│   ├── Investigation templates
│   ├── Suggested prompts (4 role-based starting points)
│   ├── Recent investigations
│   ├── Follow-up prompt thread (within active case)
│   └── Active agent indicators + real-time execution status
│
├── 02 · Autonomous AI Orchestrator
│   ├── Objective interpretation
│   ├── AI investigation plan (phases, tasks, dependencies)
│   ├── Agent delegation + parallel execution lanes
│   ├── Workflow visualization
│   ├── Live agent activity + inter-agent communication
│   ├── Execution log (streaming, filterable)
│   ├── Approval gate queue
│   └── Controls: pause / resume / step / cancel / approve / deny
│
├── 03 · AI Agent Management
│   ├── Agent registry (12 specialist agents)
│   ├── Profile: capabilities, permissions, tools, tasks, metrics, status
│   ├── Enable / disable, configuration
│   ├── Tool + permission assignment
│   └── Create custom agent
│
├── 04 · Investigation Workspace
│   ├── Case overview + objectives + authorization basis
│   ├── Findings ledger (verified / unverified / hypothesis / contradicted)
│   ├── Evidence collection + source references
│   ├── Investigation timeline (audit-grade)
│   ├── Entity relationship preview
│   ├── Analyst notes (linked to claim IDs)
│   ├── Confidence indicators
│   └── Case management: share, export, status, assign
│
├── 05 · Plugin Marketplace
│   ├── Discover / featured / categories / search
│   ├── Installed plugins
│   ├── Detail: permissions, version, compatibility, signature
│   ├── Install / remove / update / configure
│   └── Connection + runtime status
│
├── 06 · AI Skills Library
│   ├── Installed skills / marketplace / custom skills
│   ├── Skill editor (procedure, dependencies, guardrails)
│   ├── Sandbox test environment + fixtures
│   ├── Version history
│   ├── Agent compatibility + execution history
│   └── Enable / disable / import
│
├── 07 · MCP Server Management
│   ├── Connected servers + server directory
│   ├── Local (stdio) and remote (HTTP / SSE) configuration
│   ├── JSON config editor + environment variables
│   ├── Authentication (OAuth 2.1, API key, Bearer, mTLS)
│   ├── Exposed tools + resources
│   ├── Connection test + health monitoring + logs
│   └── Permission management / reconnect / remove
│
├── 08 · Tools & Integrations Hub
│   ├── Available tools by category
│   ├── Configuration + authentication + rate limits
│   ├── Operational status and usage statistics
│   ├── Execution history
│   └── Agent access permissions
│
├── 09 · Intelligence Visualization
│   ├── Entity relationship graph
│   ├── Evidence network
│   ├── Investigation timeline view
│   ├── Domain / website relationships
│   ├── Transaction flow view
│   ├── Node inspector + expandable intelligence nodes
│   ├── Filters by entity type and evidence status
│   └── Source reliability + edge status legend
│
├── 10 · Digital Evidence Vault
│   ├── Evidence library + file previews
│   ├── Metadata inspection + hashing (SHA-256)
│   ├── Chain of custody + provenance + collection timestamps
│   ├── Categorization + integrity verification
│   ├── Access history
│   └── Secure / signed export
│
├── 11 · AI Investigation Reports
│   ├── Executive summary, scope, methodology
│   ├── Key findings + supporting evidence
│   ├── Source citations + confidence assessments
│   ├── Timeline + relationship diagrams
│   ├── Unresolved questions + alternative explanations
│   ├── Customization / review state
│   └── PDF · JSON · CSV · Markdown export
│
├── 12 · Settings & Administration
│   ├── General, AI models, agents
│   ├── Security & privacy, investigation permissions
│   ├── Automation preferences, approval requirements
│   ├── Notifications, storage, appearance, workspaces
│   └── Audit log
│
└── 13 · Component States (internal reference)
    └── Loading · empty · error · success · permission · validation · typography
```

---

## 3. Navigation model

| Region | Contents | Behavior |
|---|---|---|
| Top navigation | Workspace, global search, model, system status, notifications, user | Persistent across all screens |
| Left sidebar | 4 grouped sections + New investigation | Persistent, collapsible to icon rail (60px), resizable 60–380px |
| Center workspace | Screen content + investigation tabs | Scrolls independently; tabs preserve concurrent sessions |
| Right contextual panel | Depends on active screen | Persistent, collapsible, resizable 260–520px |
| Status bar | Live system metrics | Persistent, non-interactive |

**Navigation hierarchy:** Command Center is the default and home. Management screens (Agents, Tools, Plugins, Skills, MCP, Settings) are second-level — reachable from the sidebar and from contextual links inside workflows, never required for a first investigation.

---

## 4. Object model (the nouns of the system)

| Object | Key fields | Relationships |
|---|---|---|
| Investigation | id, objective, scope, legal basis, status, progress, confidence, lead | has many Findings, Evidence, Tasks, Notes, Reports |
| Plan Phase | id, order, tasks[], dependencies[], approvalGates[] | belongs to Investigation; delegates Tasks to Agents |
| Task | id, agent, tools[], state, input, output, confidence | belongs to Phase; produces Evidence / Findings |
| Agent | id, capabilities[], permissions[], tools[], status, metrics | executes Tasks; uses Plugins, Skills, MCP tools |
| Finding | id, claim, epistemicStatus, confidence, sources[], alternatives[] | supported by Evidence; appears in Report |
| Evidence | id, type, sha256, source, provenance, collectedAt, custodyEvents[] | supports Findings; appears in Graph and Vault |
| Entity | id, type (person/org/domain/wallet/doc), attributes | connected by Relationships |
| Relationship | id, from, to, kind, epistemicStatus, confidence, sources[] | Graph edges; status drives visual encoding |
| Plugin | id, publisher, version, permissions[], signature, status | invoked by Agent |
| Skill | id, procedure, dependencies[], version, guardrails[] | composed into Plan phases |
| MCP Server | id, transport, endpoint, auth, tools[], resources[], health | exposes Tools / Resources |
| Approval | id, requestedBy, action, dataShared, decision, actor, timestamp | gates sensitive Tasks |

---

## 5. Responsive desktop behavior

| Resolution | Layout response |
|---|---|
| 2560 × 1440 | Sidebar 268px, context 360px, generous 44px gutters; graph and report canvases expand |
| 1920 × 1080 | Default sidebar 248px, context 324px, 32px gutters; full two/three-column layouts |
| 1440 × 900 | Sidebar 248px, context 324px; detail grids collapse only where explicitly specified |
| 1280 × 800 | Sidebar 222px, context 300px; orchestrator and case grids stack; report side panel moves below |
| < 1100px | Context panel auto-collapses; user can reopen manually |

Constraints: top bar, tabstrip, sidebar and status bar are fixed height/width; center workspace flexes; internal panels use sticky headers and independently scrolling bodies.

---

## 6. IA → prototype map

| IA node | Prototype route / screen |
|---|---|
| 01 Command Center | `command` |
| 02 Orchestrator | `orchestrator` |
| 03 Agents | `agents` |
| 04 Investigation Workspace | `investigations` → `case` |
| 05 Plugins | `plugins` |
| 06 Skills | `skills` |
| 07 MCP | `mcp` |
| 08 Tools | `tools` |
| 09 Graph | `graph` |
| 10 Vault | `vault` |
| 11 Reports | `reports` |
| 12 Settings | `settings` |
| 13 States | `states` |
