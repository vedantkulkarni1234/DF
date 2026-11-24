# 05 · Developer-ready UI/UX Specifications

## 1. Stack-agnostic implementation contract

The prototype is dependency-free HTML/CSS/JS. It is a behavioral specification: every screen, state and interaction is rendered from data in `js/data.js`, so engineering can replace the data layer with real API calls without rewriting views.

| Layer | Prototype file | Production replacement |
|---|---|---|
| Tokens | `css/tokens.css` | CSS variables or styled-components theme from `design/tokens.json` |
| Primitives | `css/base.css`, `css/components.css` | Component library (React/Vue/Svelte) with identical variant props |
| Layout | `css/layout.css` | App shell with resizable panel state |
| Screens | `js/screens-a.js`, `js/screens-b.js` | Route-level components |
| State/router | `js/app.js` | Zustand/Redux + router; replace `state.screen` with route |
| Data | `js/data.js` | GraphQL/REST client with typed models from the IA object table |

---

## 2. Screen specifications

Each screen below lists: purpose, layout, data contract, states, actions.

### SCN-01 · Command Center
- **Layout:** centered 1060px column; top mode row; hero; composer; 4 suggestions; 4 recents; footer policy note.
- **Data:** `investigations[]`, `templates[]`, `models[]`, `suggestions[]`.
- **States:** empty prompt, drafting, attachments present, drop active, submitting, policy error.
- **Actions:** `startInvestigation(prompt, mode, model, attachments, autonomous)`, `openCase(id)`, `applyTemplate(id)`.
- **Acceptance:** user can start a valid investigation in ≤3 interactions from cold start.

### SCN-02 · Orchestrator
- **Layout:** head + run banner + approval card + 2× panels (plan / lanes) + 2× panels (log / comms).
- **Data:** `plan.phases[].tasks[]`, `agents[].runtimeState`, `logs[]`, `approvals[]`.
- **States:** running, paused, step mode, approval pending, degraded task, cancel confirm, completed.
- **Actions:** `pause`, `resume`, `step`, `cancel`, `approve(id)`, `deny(id)`, `rerun(taskId)`.
- **Acceptance:** progress, log and agent state remain consistent after pause/resume; no orphan tasks.

### SCN-03 · Agents
- **Layout:** 320px registry + detail (header, 3 metrics, tools, permissions, assigned tasks table).
- **Data:** `agents[]` with capabilities, permissions, tools, metrics, status.
- **Actions:** `select`, `toggleEnabled`, `assignTool`, `editPermissions`, `createAgent`.
- **Acceptance:** changing permissions immediately updates what the orchestrator may delegate.

### SCN-04 · Investigations / Case
- **Layout:** portfolio table with stats/filters; case with 5 subtabs (overview, findings, timeline, evidence, notes).
- **Data:** `investigation`, `findings[]`, `evidence[]`, `timeline[]`, `notes[]`.
- **Actions:** `openCase`, `setTab`, `share`, `signOffFinding`, `saveNote`, `export`.
- **Acceptance:** epistemic status of every finding is visible without opening a detail view.

### SCN-05 · Plugins
- **Layout:** feature banner, category chips, tile grid, detail section with permissions + config.
- **Data:** `plugins[]` incl. signature, permissions, compatibility, version.
- **Actions:** `search`, `filter`, `install`, `remove`, `togglePermission`, `configure`.
- **Acceptance:** install never grants new permissions implicitly; version is pinned and displayed.

### SCN-06 · Skills
- **Layout:** skill list + editor (name, category, description, procedure code, dependencies, compatibility) + sandbox console.
- **Data:** `skills[]` incl. procedure, guardrails, dependencies, runs, version.
- **Actions:** `create`, `edit`, `test(fixture)`, `enable/disable`, `import`, `versionHistory`.
- **Acceptance:** test run writes no case data; advisory results are non-blocking but visible.

### SCN-07 · MCP Servers
- **Layout:** stats row + configured list + detail (kv, tabs, JSON editor, env vars, actions).
- **Data:** `servers[]` incl. transport, endpoint, auth, tools[], resources[], health metrics.
- **Actions:** `add`, `test`, `reconnect`, `remove`, `editConfig`, `grantToolAccess`.
- **Acceptance:** new server starts disabled for agents; JSON editor validates before save; secrets masked.

### SCN-08 · Tools
- **Layout:** category tabs + tool tiles (stats, switch) + recent executions table.
- **Data:** `tools[]` incl. rate limits, auth, status, agent access.
- **Actions:** `toggleAuthorization`, `connect`, `configure`, `viewHistory`.
- **Acceptance:** rate-limited/degraded states are visible and affect orchestrator tool choice.

### SCN-09 · Intelligence Graph
- **Layout:** top controls + canvas (SVG nodes/edges on grid) + inspector.
- **Data:** `nodes[]` (type, status, confidence), `edges[]` (kind, status, label).
- **Actions:** `selectNode`, `filterType`, `fit`, `expandNode`, `export`.
- **Rendering contract:** edge style is a function of `status` only:
  - `verified` → solid `--graph-edge`
  - `hypothesis` → dashed violet
  - `unverified` → dotted amber
- **Acceptance:** a reviewer can distinguish proposed from established relationships at a glance and in monochrome print.

### SCN-10 · Evidence Vault
- **Layout:** encryption strip + filterable table + inspector (preview, integrity, custody, provenance, access).
- **Data:** `evidence[]` with hash, source, timestamps, custody events, access log.
- **Actions:** `verify`, `upload`, `inspect`, `export`, `viewAccessLog`.
- **Acceptance:** no export bypasses signing/custody logging; hash mismatch blocks publication.

### SCN-11 · Reports
- **Layout:** outline (12 sections) + document + health/export side panel.
- **Data:** report sections, findings, citations, confidence, timeline, unresolved questions.
- **Actions:** `customize`, `signOff(sectionId)`, `export(format)`.
- **Acceptance:** export formats PDF/JSON/CSV/Markdown; unsigned sections produce a blocking warning with a direct path to review.

### SCN-12 · Settings
- **Layout:** 12-item nav + section panel with switch rows, selects, tables, audit log.
- **Data:** workspace policy, models, approval gates, storage, audit events.
- **Actions:** `updatePolicy`, `save`, `switchWorkspace`, `viewAudit`.
- **Acceptance:** policy changes are versioned and auditable; blocked capabilities cannot be enabled by an investigator.

---

## 3. Data contracts (TypeScript sketch)

```ts
type EpistemicStatus = 'verified' | 'unverified' | 'hypothesis' | 'contradicted';
type InvestigationStatus = 'draft' | 'planning' | 'collecting' | 'correlating' | 'review' | 'completed' | 'cancelled';

interface Finding {
  id: string; claim: string; status: EpistemicStatus;
  confidence: number;            // 0-100
  sources: SourceRef[];          // never empty for a published finding
  alternatives?: string[];
  evidenceIds: string[];
}

interface Evidence {
  id: string; filename: string; type: 'Document'|'Image'|'Dataset'|'Note';
  sha256: string; source: string; provenance: Provenance;
  collectedAt: string; custody: CustodyEvent[]; status: EpistemicStatus;
}

interface Relationship {
  from: string; to: string; kind: string;
  status: EpistemicStatus; confidence: number; sources: SourceRef[];
}

interface Approval {
  id: string; requestedBy: string; action: string; dataShared: string[];
  recipient: string; legalBasis: string;
  decision: 'pending'|'approved'|'denied'; decidedBy?: string; decidedAt?: string;
}
```

---

## 4. Event and telemetry specification

| Event | Payload | Where surfaced |
|---|---|---|
| `investigation.started` | id, objective hash, mode, model | status bar, audit |
| `plan.generated` | phases, taskCount, approvalGates | orchestrator |
| `agent.task.started` / `.completed` | agentId, taskId, duration | lanes, log |
| `tool.invoked` | toolId, agentId, caseId, result, duration | tools history, log |
| `approval.requested` / `.decided` | approval object | modal, notification, audit |
| `finding.created` | finding object | case, report |
| `contradiction.detected` | findingIds | notification, timeline |
| `evidence.hash.mismatch` | evidenceId | critical block |
| `report.exported` | format, signedBy | report, audit |

Never log raw prompt text or personal identifiers to telemetry.

---

## 5. Performance and quality targets

| Target | Value |
|---|---|
| First paint of Command Center | < 150 ms local |
| Plan generation UX response | < 1 s streaming acknowledgement |
| Live event → UI update | < 100 ms |
| Graph interaction (≤ 500 nodes) | 60 fps |
| Table virtualization threshold | > 1,000 rows |
| Theme switch | no layout shift, < 1 frame |
| Keyboard shortcut latency | immediate |

---

## 6. Legal / ethical UI constraints (must implement)

1. Lawful-use attestation required before an investigation begins.
2. External calls display exact outbound data and recipient before approval.
3. Credentialed/authenticated web access is disabled by default and policy-blocked in the prototype.
4. Unverified hypotheses cannot be exported as established fact; report export warns if unresolved claims are included.
5. Every automated decision is reproducible from the audit log (actor, time, inputs, outputs, sources).
6. Evidence hash mismatch or broken chain of custody blocks report publication.
