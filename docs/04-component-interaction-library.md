# 04 · Component & Interaction Library

Companion to the implemented prototype. Each entry lists the Figma component structure, variants, states and the interaction contract engineering should implement.

---

## Shell components

### `Shell / TopBar`
- **Structure:** left cluster (brand, menu, workspace) · center search · right cluster (status, model, notifications, theme, user).
- **Variants:** workspace type (enterprise / restricted / personal).
- **States:** default, search focused, notification unread, menu open.
- **Behavior:** search opens palette on click or ⌘K; workspace switch opens a menu with 3 workspaces; model selector opens model list with context-window metadata.

### `Shell / Sidebar`
- **Structure:** New Investigation CTA, 4 nav groups, footer (states link, profile).
- **Variants:** expanded (248px), collapsed (60px), custom width (drag).
- **States:** default, hover, active (tinted + 2px left rail), badge/count, loading.
- **Behavior:** nav switches center view without losing investigation tabs; ⌘\ toggles collapse.

### `Shell / TabStrip`
- **Structure:** session tabs + add button.
- **States:** active (top 2px accent), inactive, hover, closable.
- **Behavior:** tabs are independent sessions (prompt + case context + scroll position); middle-click and × close; last tab cannot close.

### `Shell / ContextPanel`
- **Variants:** investigation pulse, agents, graph, vault, report, MCP, generic.
- **States:** expanded, collapsed, resizing, streaming update.
- **Behavior:** content is screen-aware; collapse reveals a 28px reopen rail; live values update without scrolling the panel.

### `Shell / StatusBar`
- Live fields: active agents, connected MCP servers, running tasks, system health, encryption, version.
- Numeric changes animate; degraded state changes status dot only (no alarm color) unless critical.

---

## Core components

### `Prompt / Composer` — the signature component
- **Structure:** header (model, autonomous toggle, encryption indicator) · textarea · attachment pills · dropzone · footer (tools, hint, count, send).
- **Variants:** empty, drafting, attachments, follow-up (case thread), error.
- **States:** default, focus (accent ring + glow), dragging file, over-limit, submitting, disabled-by-policy.
- **Behavior:** Enter sends with ⌘/Ctrl; autocomplete suggests entities from case context; attachments hash on drop; autonomous toggle switches between auto-select and manual resource approval.
- **Figma setup:** one component with boolean props `hasAttachments`, `isFocused`, `isFollowUp`, `isSubmitting`, `hasError`. Auto Layout vertical, textarea grows.

### `Agent / Orb`
- **Structure:** 24px rounded-square icon container with semantic tone.
- **Variants:** accent, green, violet, amber, big (48px).
- **States:** active (pulse), idle, disabled.
- Used in sidebar context, orchestrator lanes, agent registry, comm feed.

### `Plan / Step`
- **Structure:** rail + node (number / spinner / check) + title + metadata.
- **Variants:** done, active, pending, blocked, skipped.
- **Behavior:** active node shows spinner; blocked shows lock icon and dependency reason on hover.

### `Execution / Lane`
- **Structure:** agent identity (32px) · current task + progress · status badge.
- **Variants:** complete, running (3 tones), blocked, paused.
- **Behavior:** progress animates on task event; clicking lane filters log to that agent.

### `Evidence / StatusBadge`
- Always pairs a dot with a text label. Variants: Verified, Unverified, Hypothesis, Contradicted.
- Figma: component with `status` variant property; never use color alone.

### `Confidence / Meter`
- 36px bar + numeric percent, tone by band: ≥80 success, 50–79 warning, <50 danger.
- Includes a tooltip trigger for "why this confidence?" in production.

### `Graph / Node`
- **Structure:** halo (selection), core circle, initial, label, type + confidence sub-label.
- **Variants:** verified (solid accent stroke), hypothesis (violet dashed), unverified (amber dotted).
- **States:** default, hover, selected, dimmed-by-filter.

### `Graph / Edge`
- Solid = verified; dashed = hypothesis; dotted = unverified. Label shows relationship kind.
- Legend is permanently visible on the graph screen.

### `Data / Table`
- **Structure:** header row (uppercase 9.5px eyebrow), body rows (11.5px), optional selection rail.
- **States:** default, hover, selected, empty, loading (skeleton rows), error (inline retry).
- Dense by default; no zebra striping; borders are 1px `--border-subtle`.

### `Marketplace / Tile`
- **Structure:** logo · title + publisher · description · tags · footer (version + action).
- **Variants:** available, installed, update available, featured, selected.
- **Behavior:** entire tile selects detail; action button installs/removes without opening detail.

### `Modal / Approval`
- **Structure:** icon, title, description, data-sharing callout, key/value context, optional note field, three actions.
- **Variants:** approval (warning), destructive confirm (danger), export (accent), templates (wide).
- **Behavior:** focus trapped; Esc cancels; decision always written to audit log; "deny" offers alternate path in copy.

### `Feedback / Toast`
- Success / warning / danger. Auto-dismiss 3.8s, stacked bottom-right above status bar, never covers the composer.

---

## Interaction patterns

| Pattern | Trigger | Result |
|---|---|---|
| Command palette | ⌘K or search click | Grouped actions, cases, agents; ↑↓ + Enter; Esc cancel |
| New investigation | ⌘N / CTA | Command Center, prompt focused |
| Theme toggle | ⌘⇧L / top-bar icon | Immediate theme swap, no flash, persists |
| Panel collapse | Context collapse button / ⌘\ for sidebar | Smooth width transition; reopen rail |
| Panel resize | Drag 4px divider | Min/max enforced; cursor col-resize; no layout reflow jank |
| Context menu | Right-click table row / tile / list row | Inspect, copy reference, open new tab, remove |
| Approval checkpoint | Sensitive tool call | Execution pauses; modal lists exact data shared; approve/deny logged |
| Batch state change | Toggle in list row | Optimistic UI; toast confirmation |
| Loading | Any fetch > 250ms | Skeleton or inline spinner; never a full-screen blocking overlay |
| Error recovery | Failed tool/server | Inline message + retry; fallback source offered; case remains usable |
| Empty state | No results / new workspace | Icon + explanatory copy + primary next action |
| Success state | Verification/export complete | Confirmation with what happened and where to inspect it |

---

## Content & microcopy rules

- Use verbs for actions: "Start investigation", "Approve & log", "Verify integrity".
- Never imply certainty from probability: "92% confidence · 3 independent sources" not "confirmed fact".
- Errors name the failing object and the recovery: "chain-index-mcp timed out after 8s · Retry or use fallback source".
- Approval dialogs always disclose: requester, action, exact data shared, recipient, legal basis.
- Empty states always offer a next action, never just "Nothing here".

---

## Prototype → production checklist

- [ ] Add ARIA roles/labels to custom controls (`role="switch"`, `aria-checked`, dialog focus trap)
- [ ] Replace interval-driven progress with real task events + WebSocket/SSE
- [ ] Add `prefers-reduced-motion` media query
- [ ] Add keyboard reordering for tabs and list selection
- [ ] Add confirmation for plugin removal and evidence deletion
- [ ] Wire authentication/session state into top bar
- [ ] Add virtualized tables for >1,000 evidence items
- [ ] Persist panel widths, theme, tab sessions to local storage
