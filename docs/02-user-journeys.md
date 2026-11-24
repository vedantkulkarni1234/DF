# 02 · User Journey Maps — AXIOM

Four primary journeys. Each maps stages, user intent, system behavior, UI surface, emotional state and failure recovery.

---

## Journey A — First-time investigator: "Start with one prompt"

**Persona:** Analyst with domain expertise, no OSINT tool training.
**Goal:** Establish whether a suspected shell-company network is real, without learning 12 tools.
**Success metric:** First defensible finding in under 15 minutes.

| Stage | User action | System response | Surface | User state | Recovery / guardrail |
|---|---|---|---|---|---|
| 1. Arrive | Opens AXIOM | Command Center focused on the prompt. Active case pulse visible on the right. | Command Center | Oriented, slightly unsure where to begin | Suggested prompts + templates reduce blank-page anxiety |
| 2. Describe | Types objective in natural language | Inline autocomplete suggests entities and scope; character count; attachments accepted by drop | Composer | Confident — uses own language | Plain-language guidance; no required tool selection |
| 3. Augment | Drops invoice PDF and website capture | Files indexed, SHA-256 hashed, custody entries appended; pills shown in composer | Composer | Trusting | Failed upload shows inline error and retry |
| 4. Launch | Clicks "Start investigation" | Objective validated against lawful-use policy; plan generated in ~5s; orchestrator opens | Orchestrator | Anticipation | Invalid scope produces a specific reason and edit path |
| 5. Observe | Watches plan, agents and log | Parallel lanes update; agent messages summarized; progress and elapsed time visible | Orchestrator + context | In control | Pause / step / cancel always available |
| 6. Approve | Reviews an external lookup request | Sensitive action pauses. Exact data shared, recipient, legal basis displayed. | Approval dialog | Deliberate | Deny routes agent to alternate source; decision logged |
| 7. Review | Reads 4 findings with confidence and status | Verified, hypothesis and contradicted findings visually separated; sources linked | Case workspace | Critical but informed | Hypothesis cannot be exported as fact; one-click source inspection |
| 8. Verify | Opens graph, clicks dashed link | Node inspector shows entity, sources, confidence, and why link is unverified | Intelligence Graph | Analytical | Legend permanently states dashed ≠ established |
| 9. Report | Opens report, signs off 3 sections | Export requires human sign-off; PDF/JSON/CSV/Markdown options | Reports | Assured | Signing blocked until unresolved claims reviewed |
| 10. Continue | Asks follow-up question in case thread | Orchestrator replans only affected phases; prior evidence retained | Command Center (case thread) | Confident | Session persists across restarts |

**Moments of truth:** stage 4 (plan appears in plain language), stage 6 (approval is specific, not generic), stage 7 (epistemic status is unmistakable).

---

## Journey B — Expert investigator: "Control and audit an autonomous run"

**Persona:** Senior forensic investigator with strict evidentiary standards.
**Goal:** Understand exactly what the AI did, why, and with what authority.

| Stage | Action | System response | Surface |
|---|---|---|---|
| 1. Set policy | Configure approval gates, disabled tools, credentialed-access block | Workspace policy stored; per-case inheritance indicated | Settings → Approvals / Permissions |
| 2. Constrain run | Select "Forensics" mode and attach a legal-hold case | Only local + vault tools authorized; external lookups gated | Command Center |
| 3. Inspect plan | Expand plan tasks and dependency graph | Every task shows agent, tools, inputs and expected output | Orchestrator |
| 4. Intervene | Pause mid-collection and reassign one task | Agent state preserved; task reassigned with audit entry | Orchestrator / Agents |
| 5. Challenge | Click a verified finding | Source list, extraction method, confidence rationale and hash manifest open | Case → Findings |
| 6. Reconcile | Investigate a contradiction | Timeline shows conflicting artifact and metadata; alternative explanations surfaced | Case → Timeline / Reports |
| 7. Audit | Export audit log and report hash manifest | Signed export, decision times, actor IDs | Settings → Audit log |

**Key requirement:** no autonomous step is unexplainable. Every agent action is traceable to a task, a permission, a source and a timestamp.

---

## Journey C — Capability administrator: "Extend the platform safely"

**Persona:** Platform/admin user responsible for tools, integrations and governance.
**Goal:** Add a new data source without exposing the organization to unscoped access.

| Stage | Action | System response | Surface |
|---|---|---|---|
| 1. Discover | Browse plugin marketplace; filter by category | Featured, vetted plugins with rating, version, signature | Plugins |
| 2. Inspect permissions | Open plugin detail | Requested permissions listed one-by-one with toggles; sandbox runtime noted | Plugins → detail |
| 3. Install | Install plugin | Version pinned; execution logging enabled by default | Plugins |
| 4. Configure MCP | Add a remote MCP server with OAuth 2.1 | Guided form + advanced JSON editor + env vars | MCP Servers |
| 5. Test | Run connection test | Exposed tools/resources enumerated; latency and health recorded | MCP |
| 6. Scope access | Grant tool access only to relevant agents | Least privilege: new server starts with zero agent access | MCP / Tools / Agents |
| 7. Author skill | Create a reusable skill with guardrails | Editor + sandbox test with fixture; version history | Skills |
| 8. Observe | Monitor usage stats and rate-limit events | Tool hub shows invocations, limits, execution history | Tools |

**Guardrail:** capability additions never auto-grant permission. Dynamic orchestrator selection only considers installed **and** authorized resources.

---

## Journey D — Reviewer / legal: "Can I rely on this report?"

**Persona:** Legal counsel or reviewing partner.
**Goal:** Assess whether conclusions are defensible and appropriately qualified.

| Stage | Action | System response | Surface |
|---|---|---|---|
| 1. Open report | Read executive summary | Clear separation of established facts vs. leads; scope and legal basis visible | Reports |
| 2. Challenge confidence | Open confidence assessments | Each confidence value linked to source count, reliability and verification method | Reports / Case |
| 3. Inspect citations | Click a citation | Source, retrieved timestamp, snapshot hash and extraction notes | Report → Source panel |
| 4. Review alternatives | Read alternative explanations and unresolved questions | Contradicted claims surfaced rather than hidden | Reports |
| 5. Check chain | Open evidence vault | Custody timeline, SHA-256 verification, access history | Vault |
| 6. Sign or return | Approve or request changes | Sign-off recorded; unresolved claim blocks publication | Reports / Audit |

---

## Cross-journey state transitions

```
DRAFT → PLANNING → COLLECTING → CORRELATING → REVIEW → COMPLETED
             │          │             │          │
             │          │             │          └─ → RECOLLECT (follow-up prompt)
             │          │             └─ → PAUSED (contradiction / approval)
             │          └─ → DEGRADED (tool failure, fallback source)
             └─ → CANCELLED (partial artifacts retained, audit entry written)
```

## Notifications strategy

| Event | Channel | Timing |
|---|---|---|
| Approval required | Command Center banner + bell + OS notification | Immediate |
| Contradiction detected | Context panel + case timeline | Immediate |
| Agent failure | Execution log + status bar | Immediate, retry inline |
| Investigation complete | Toast + notification center | On completion |
| Integrity mismatch | Critical alert, report publication blocked | Immediate |
