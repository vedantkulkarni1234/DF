# 03 · AXIOM Design System

**Status:** Implemented in `css/tokens.css`, `css/base.css`, `css/components.css`
**Figma mirror:** `design/tokens.json` (semantic tokens structured for Tokens Studio variable import)

---

## 1. Design philosophy

The interface is **quiet, dense and exact**. Intelligence products fail when they look like dashboards: every available number fights for attention. AXIOM uses restraint as a hierarchy tool.

- **Quiet surfaces, loud state.** Surfaces stay low-contrast; only status, approvals and active work use saturated color.
- **Evidence first.** Data is never presented without its epistemic status and confidence.
- **One focal action per screen.** The prompt composer is the only visually "large" interactive object.
- **Precision over decoration.** Hairline borders, 4/8pt spacing, no ornamental gradients, no glow except active AI state.
- **Progressive disclosure.** Default = prompt + pulse. Advanced controls live in secondary panels and context menus.

---

## 2. Foundations

### Color primitives

| Role | Dark | Light | Usage |
|---|---|---|---|
| Brand 500 | `#6366F1` | `#4F46E5` | Primary action, active state, focus |
| Brand 400 | `#818CF8` | `#6366F1` | Hover, accent text |
| Violet 500 | `#8B5CF6` | `#8B5CF6` | AI/hypothesis semantic color |
| Success | `#22C55E` | `#16A34A` | Verified, complete, healthy |
| Warning | `#F59E0B` | `#D97706` | Unverified, approval, degraded |
| Danger | `#EF4444` | `#DC2626` | Contradicted, destructive, error |
| Info | `#38BDF8` | `#0284C7` | Neutral informational state |

### Semantic tokens (theme-aware)

```
bg.base · bg.sidebar · bg.surface · bg.elevated · bg.inset · bg.hover · bg.active · bg.overlay
text.primary · text.secondary · text.tertiary · text.inverse · text.accent
border.subtle · border.default · border.strong · border.accent
accent.default · accent.hover · accent.soft · accent.softer · accent.border
status.success · status.warning · status.danger · status.info (+ matching *.soft)
```

**Rule:** components reference semantic tokens only. Never hard-code a hex value in a component; theme switching must require zero component changes.

### Typography

| Style | Size / line | Weight | Tracking | Use |
|---|---|---|---|---|
| Display | 32 / 38 | 640 | −0.045em | Command Center hero |
| H1 | 26 / 32 | 640 | −0.032em | Screen titles |
| H2 | 19 / 25 | 620 | −0.022em | Section titles, detail headers |
| H3 | 15 / 20 | 600 | −0.012em | Card headers |
| Body | 13 / 20 | 400 | 0 | Default UI |
| Body small | 11.5 / 17 | 400 | 0 | Dense data, rows, buttons |
| Caption | 10 / 15 | 400 | 0 | Metadata, timestamps |
| Eyebrow | 10 / 14 | 700 | +0.1em, uppercase | Group labels |
| Mono | 11.5 / 18 | 400 | −0.01em | IDs, hashes, logs, JSON, metrics |

Fonts: **Inter / SF Pro Text** for UI; **JetBrains Mono / SF Mono** for technical content. Numeric data uses tabular figures where available.

### Spacing

4pt base scale: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.
- 4–8px: within controls, icon gaps
- 12–16px: between related elements, panel padding
- 20–24px: between sections
- 32–64px: page-level rhythm and empty space

### Radius / elevation

Radius: 4 (badge) · 6 (small control) · 8 (button, input) · 10 (panel) · 14 (modal, composer) · 20 (hero).
Elevation: `sm` subtle border-shadow for controls; `md` for popovers/toasts; `lg` for modal/palette. No large decorative shadows on content panels.

### Motion

`120ms` micro (hover, color), `180ms` standard (panel state), `280ms` slow (drawer/palette). Easing `cubic-bezier(.22,.61,.36,1)`. Respect `prefers-reduced-motion` in production.

---

## 3. Epistemic color system (product-specific)

This is the most important semantic layer in AXIOM and must never be decorative.

| Status | Color / encoding | Where applied |
|---|---|---|
| Verified | Green solid dot + green badge; solid graph edge | Findings, evidence, graph edges, tool health |
| Unverified | Amber dot + amber badge; dotted graph edge | Claims, evidence, graph edges |
| Hypothesis | Violet dot + violet badge; dashed graph edge | AI-proposed links, findings |
| Contradicted | Red dot + red badge | Findings, evidence, conflicts |

**Copy rules:**
- Never say "proven" — say "verified by N independent sources".
- Hypotheses must include the phrase "requires corroboration".
- Confidence is expressed as a percentage plus rationale, never as certainty.

---

## 4. Component inventory (implemented)

| Component | Variants / states | File |
|---|---|---|
| Button | Primary, secondary, ghost, danger, icon-only; sm/md/lg; disabled, hover, active | `components.css` |
| Badge | Accent, success, warning, danger, info, violet, outline | `components.css`, `base.css` |
| Confidence meter | Bar + numeric (high / medium / low tone) | `base.css` → `H.conf()` |
| Switch | On / off, disabled (production) | `components.css` |
| Segmented control | 2–5 options, active | `components.css` |
| Tabs | Investigation tabs, subtabs, settings tabs | `layout.css`, `components.css` |
| Input / textarea / select | Default, focus, error, hint, monospace | `components.css` |
| Search field | With icon, inline filter | `components.css` |
| Panel / card | Header + body, padded, scrollable | `components.css` |
| Data table | Hover, selected, sortable placeholder, dense | `components.css` |
| List row | Hover, selected, contextual menu | `components.css` |
| Tile | Marketplace/tool card, selected, hover elevation | `components.css` |
| Chip / filter | Default, active | `components.css` |
| Progress bar | Accent, success, warning | `components.css` |
| Timeline | 5 tones (accent/success/warning/danger/violet) | `screens.css` |
| Callout | Info, warning, success | `components.css` |
| Dropzone | Default, hover, dragging | `components.css`, `screens.css` |
| Log line | Info, warning, success | `components.css` |
| Command palette | Grouped results, keyboard selection, empty | `layout.css` |
| Modal | Standard, wide; approval, confirmation, export, templates | `layout.css` |
| Toast | Success, warning, danger | `layout.css` |
| Context menu | 4 default actions, danger variant | `layout.css` |
| Skeleton / empty / error / success / validation | Full gallery at route `states` | `components.css`, `screens-b.js` |

---

## 5. Layout grammar

```
┌───────────────────────────────────────────────────────────────┐
│ TOP BAR 56px — workspace · search · model · status · user     │
├──────────┬────────────────────────────────────┬───────────────┤
│ SIDEBAR  │ TABSTRIP 40px                      │ CONTEXT       │
│ 248px    ├────────────────────────────────────┤ 324px         │
│ (60px    │ VIEW — screen content              │ (collapsible) │
│  icon    │ independently scrolling            │               │
│  rail)   │                                    │               │
├──────────┴────────────────────────────────────┴───────────────┤
│ STATUS BAR 28px                                               │
└───────────────────────────────────────────────────────────────┘
```

- Sidebar and context panel are resizable via 4px hit targets; double-click a divider to reset.
- Center content max-widths: Command Center 1060px, standard views fluid, report document 820px.
- Sticky headers: panel heads, graph filters, report toolbar.
- All scroll regions are independent; never scroll the entire shell.

---

## 6. Light mode notes

Light mode is a peer theme, not an inversion:
- Elevated surfaces remain white; hierarchy comes from borders and background steps (`#F7F8FB` → `#F1F3F8` → `#FFF`).
- Accent darkens to `#4F46E5` to preserve AA contrast on white.
- Success/warning/danger shift to 600/700 weights.
- Graph edges darken to `#B9C2D2`; hypothesis violet stays at `#8B5CF6` for continuity.
- Code blocks keep the same syntax hues with darker variants.

---

## 7. Accessibility

- Text contrast target: ≥ 4.5:1 for body, ≥ 3:1 for large text and UI borders.
- Status is never color-only: dot + text label always paired.
- Focus rings: 2px accent, 2px offset. Visible on every interactive element.
- Keyboard: ⌘K palette, ⌘N new investigation, ⌘⇧L theme, ⌘\ sidebar, Esc close, ↑/↓ palette navigation.
- Keyboard shortcuts shown in UI where they exist.
- Motion can be reduced; live status uses `aria-live` regions in production.
- Minimal target size 26px; primary controls 32px+.

---

## 8. Figma variable mapping

| Figma variable collection | Modes | Bind to |
|---|---|---|
| `Color / Semantic` | Dark, Light | All fills, strokes, text colors |
| `Color / Status` | Dark, Light | Status dots, badges, graph edges |
| `Typography` | — | Text styles Display/H1/H2/H3/Body/Caption/Eyebrow/Mono |
| `Spacing` | — | Auto Layout gaps and padding |
| `Radius` | — | Corner radius on all frames |
| `Layout` | Desktop 1280/1440/1920/2560 | Shell frame dimensions |

Import `design/tokens.json` via Tokens Studio, then create variables per mode. Components must consume variables — no raw values in instances.
