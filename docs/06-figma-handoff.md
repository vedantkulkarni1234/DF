# 06 · Figma Handoff

## Why this handoff looks the way it does

The connected Figma account is enabled for reading files, but its folder/project scope is denied (`Invalid scope` on `get_team_projects`), and the Figma REST API has no endpoint for creating or editing design files. Rather than stall, this repository contains the complete design as a **running, high-fidelity specification**: every screen, theme, state and interaction is implemented in code and documented for direct translation into Figma.

To move into Figma:

1. Import `design/tokens.json` with Tokens Studio → create variable collections with **Dark / Light** modes.
2. Create page structure below.
3. Build components from `docs/04-component-interaction-library.md` using the prototype as the visual reference at `1440 × 900`.
4. Use `docs/05-developer-specifications.md` for property names, states and acceptance criteria.
5. Add prototype interactions in Figma using the interaction table in section 4 of this file.

---

## Recommended Figma page structure

```
00 · Cover & reading guide
01 · Foundations
    ├── Color primitives + semantic tokens (Dark / Light)
    ├── Typography styles (9 styles)
    ├── Spacing, radius, elevation, motion
    └── Epistemic status system (verified / unverified / hypothesis / contradicted)
02 · Components
    ├── Shell (TopBar, Sidebar, TabStrip, ContextPanel, StatusBar)
    ├── Core (Composer, Badge, Confidence, Switch, Segmented, Tabs)
    ├── Data (Table, ListRow, Tile, Timeline, LogLine)
    └── Feedback (Callout, Toast, Modal, Dropzone, States)
03 · Application screens — Dark
    ├── 01 Command Center
    ├── 02 Orchestrator
    ├── 03 Agents
    ├── 04 Investigations / Case
    ├── 05 Plugins
    ├── 06 Skills
    ├── 07 MCP
    ├── 08 Tools
    ├── 09 Intelligence Graph
    ├── 10 Evidence Vault
    ├── 11 Reports
    └── 12 Settings
04 · Application screens — Light (all 12)
05 · Responsive frames (1280 / 1440 / 1920 / 2560)
06 · Workflows & journeys (Journey A–D from docs/02)
07 · Prototype flows
08 · Developer specs & annotations
```

---

## Frame setup

| Frame | Size | Notes |
|---|---|---|
| Desktop base | 1440 × 900 | Primary reference frame |
| Compact | 1280 × 800 | Verify stacking rules |
| Standard | 1920 × 1080 | Default enterprise deployment |
| Wide | 2560 × 1440 | Expanded graph/report canvases |

Every screen frame contains: TopBar (H 56), TabStrip (H 40), Sidebar (W 248), ContextPanel (W 324), StatusBar (H 28). Use Auto Layout on all shell frames; pin sidebar/status bar, hug center content.

---

## Component construction rules

- One main component per pattern; all variations as **variants**, not detached copies.
- Boolean props: `hasAttachments`, `isActive`, `hasCount`, `isCollapsed`, `isFocused`.
- Enum props: `status = verified|unverified|hypothesis|contradicted`, `tone = accent|success|warning|danger|violet`.
- Text layers bound to text styles; fills/strokes bound to semantic variables.
- Nested components: Tile → Badge → StatusDot; Composer → FilePill → Button; Orchestrator → PlanStep / ExecutionLane.
- All interactive components include states: default, hover, focus, pressed, disabled, loading.
- Use constraints: shell regions fixed; content regions left/top with right/bottom stretch; graph canvas scale.

---

## Prototype interactions to recreate

| Source frame | Trigger | Destination / action |
|---|---|---|
| Command Center | Start investigation | Orchestrator (run banner at 2%, plan active) |
| Command Center | Suggestion card | Fill prompt text |
| Any screen | ⌘K | Command palette overlay |
| Orchestrator | Approve | Close modal, log toast, resume progress |
| Orchestrator | Cancel | Confirmation modal → Cancelled state |
| Agents | Registry row | Swap detail panel content |
| Graph | Node | Update inspector content + selection halo |
| Case | Subtabs | Swap body content |
| Vault | Evidence row | Update inspector content |
| Reports | Export | Export modal → success toast |
| Top bar | Theme icon | Swap to Light page variants |
| Sidebar | Toggle | Sidebar → 60px icon rail |

Smart animate 280ms for panel changes, 180ms for detail swaps. Do not animate status color changes.

---

## Developer handoff artifacts

| Artifact | Purpose |
|---|---|
| `index.html` + `css/` + `js/` | Living visual specification; run locally to inspect any state |
| `design/tokens.json` | Figma variable / theme import |
| `docs/01-information-architecture.md` | Page and object model |
| `docs/02-user-journeys.md` | Flow narratives and state transitions |
| `docs/03-design-system.md` | Foundations and design rules |
| `docs/04-component-interaction-library.md` | Component variants and interaction contract |
| `docs/05-developer-specifications.md` | Screen specs, data contracts, acceptance criteria |
| `tests/smoke.js` | Verifies all 14 screens render without runtime errors |
