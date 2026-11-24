# AXIOM — Autonomous Intelligence Operating System

A high-fidelity, interactive desktop product prototype for an AI-native OSINT / digital-forensics investigation platform. The deliverable is a dependency-free web app that runs anywhere, plus a complete product, design-system and developer handoff.

## Run the prototype

```bash
python3 -m http.server 8000 --bind 0.0.0.0
# open http://localhost:8000
```

Or open `index.html` directly in a browser. No build step, no package install.

## What is included

| Deliverable | Location |
|---|---|
| Complete product information architecture | [`docs/01-information-architecture.md`](docs/01-information-architecture.md) |
| User journey maps (4 personas) | [`docs/02-user-journeys.md`](docs/02-user-journeys.md) |
| High-fidelity desktop screens (14 routes) | `index.html`, `js/screens-a.js`, `js/screens-b.js` |
| Complete design system + light/dark themes | `css/tokens.css`, [`docs/03-design-system.md`](docs/03-design-system.md), [`design/tokens.json`](design/tokens.json) |
| Component & interaction library | [`docs/04-component-interaction-library.md`](docs/04-component-interaction-library.md) |
| Autonomous investigation workflow prototype | `command` → `orchestrator` → `case` → `reports` |
| AI orchestration visualization | `orchestrator` (plan, lanes, dependencies, logs, approvals) |
| Plugin, Skills, MCP management interfaces | `plugins`, `skills`, `mcp`, `tools` |
| Intelligence graph + forensic evidence workspace | `graph`, `vault` |
| Light & dark mode variations | Top-bar toggle or `⌘⇧L` |
| Loading, empty, error, success, permission states | Internal route `states` (kept out of the product UI) |
| Developer-ready UI/UX specifications | [`docs/05-developer-specifications.md`](docs/05-developer-specifications.md) |
| Figma handoff structure | [`docs/06-figma-handoff.md`](docs/06-figma-handoff.md) |

## Screens

`command` · `orchestrator` · `agents` · `investigations` · `case` · `graph` · `vault` · `reports` · `tools` · `plugins` · `skills` · `mcp` · `settings` · `states`

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `⌘/Ctrl K` | Command palette |
| `⌘/Ctrl N` | New investigation |
| `⌘/Ctrl 1–5` | Switch CAPABILITIES tabs (Agents → MCP) |
| `⌘/Ctrl ⇧ L` | Toggle light / dark |
| `⌘/Ctrl \` | Collapse / expand sidebar |
| `Esc` | Close overlays |
| `↑ ↓ ↵` | Navigate command palette |

## Interaction highlights

- Type or pick a suggested prompt → **Start investigation** → live plan, parallel agents, execution log and approval gate.
- Approve or deny the external-lookup request and watch the decision land in the audit narrative.
- Inspect the case workspace with four epistemic states: verified, unverified, hypothesis, contradicted.
- Open the intelligence graph: solid edges are verified, dashed are hypotheses, dotted are unverified.
- Drag files onto the composer or vault to see attachment / hashing affordances.
- Resize the left and right panels by dragging their dividers; collapse the right panel from its header.
- Switch themes without relayout; all tokens are semantic.
- Real local behavior: model/workspace/user/notification menus, file import, report/evidence/graph downloads, plugin install state, settings persistence and help/shortcut dialogs.

## Verification

```bash
npm install --no-save jsdom
node tests/smoke.js
```

The smoke test loads the app in jsdom, renders all 14 screens, and exercises prompt launch and overlays.

## Note on Figma

The connected Figma account has read access to files but its folder scope is denied, and Figma's REST API does not support creating/editing design files. Therefore the delivered artifact is this executable design specification plus token and documentation files structured for direct Figma import — see [`docs/06-figma-handoff.md`](docs/06-figma-handoff.md). If a target Figma file key is supplied, comments and annotations can be added there via the connector.
