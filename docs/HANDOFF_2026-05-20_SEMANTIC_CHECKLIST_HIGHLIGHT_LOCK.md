# Signal Flow Semantic Checklist Highlight Lock

Date: 2026-05-20

## Purpose

This handoff locks the clean semantic checklist highlight system for Signal Flow.

The previous broad/fixed highlight implementations caused two regressions:

- a blinking fixed overlay highlighted the left column too broadly
- a failed replacement removed highlights from the whole game

The locked replacement is item-level only and targets real checklist row DOM, not sidebar text or panel geometry.

## Locked Files

Current locked implementation files:

- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`

Do not move this behavior into the locked Build-a-Room renderer or diagnosis renderer unless a future architecture pass explicitly chooses to externalize all shared launch patches.

## Active System Names

- CSS block id: `sf-semantic-todo-highlight-v1`
- Cleanup script id: `sf-semantic-todo-highlight-script-v1`
- Pulse animation: `sfSemanticTodoPulseV1`
- Rail animation: `sfSemanticTodoRailV1`
- Runtime marker: `window.SignalFlowSemanticTodoHighlight`

## Locked Selectors

Normal patch-board checklist rows:

```css
main.game .level-shell .panel #paths > .path-card:has(.todo-badge):not(.done):not(:has(.done-badge))
```

Build-a-Room Build Checklist rows:

```css
.sf-build-room-v6r227 .sf-br-checklist > .sf-br-need:not(.is-satisfied)
```

These are the only active highlight targets.

## Build-a-Room DOM Finding

Verified on `LIV-004` Build-a-Room `v6r277`.

Stable Build Checklist structure:

```html
.sf-build-room-v6r227
  .sf-br-checklist
    .sf-br-section-title
    .sf-br-need
      .sf-br-need-dot
      .sf-br-need-name
      .sf-br-need-detail
```

Completion state:

```css
.sf-br-need.is-satisfied
```

Only unsatisfied `.sf-br-need` rows should pulse.

## Visual Lock

The locked pulse is deliberately stronger than the first semantic version:

- larger glow radius
- stronger border/outline
- visible left rail
- item-level background inset pulse
- no fixed overlay

The highlight must stay attached to the checklist row itself.

## Cleanup Script Scope

The cleanup script is intentionally small. It may:

- remove stale `#sf-todo-list-glow-overlay-v3`
- remove stale `.sf-todo-list-glow-overlay-v3`
- remove stale old attention classes:
  - `.sf-brief-todo-attention`
  - `.sf-todo-item-attention-v1`
  - `.sf-todo-item-complete-v1`
- normalize normal patch-board rows whose `.todo-badge` text becomes `COMPLETE` or `DONE` by adding `.done`

The script must not:

- create highlight classes for active rows
- scan sidebar/brief text
- scan broad `.panel`, `.panel-scroll`, `aside`, or `main` content
- move DOM nodes
- hide shell siblings
- affect scoring, routing, economy, validation, or assets

## Do Not Restore

Do not restore these systems:

- `sf-brief-todo-attention-runtime-v4`
- `sf-todo-list-overlay-glow-v3`
- `sf-todo-item-highlight-v1`
- `sf-todo-item-highlight-v2`

Do not add:

- fixed overlay boxes
- geometry-based sidebar highlighting
- broad left-column scans
- broad panel scans
- generic checklist text scans

## Protected Systems

Do not modify these unless a future bug directly requires it:

- Build-a-Room shared renderer/layout locked as `v6r277`
  - `patch/sf-build-room-renderer.js?v=6r277`
  - `patch/sf-build-room-renderer.css?v=6r277`
- Diagnosis renderer locked as `diagnosis-ui.js?v=6r263`
- Native Live route validation
- IR routing
- scoring
- economy
- assets

## Acceptance Results

Browser QA completed on 2026-05-20.

### LIV-003 Normal Patch Board

URL:

```text
http://127.0.0.1:8000/launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html?fresh=semantic-follow-liv003#/level/LIV-003
```

Result:

- two incomplete `#paths > .path-card` rows used `animationName === "sfSemanticTodoPulseV1"`
- after completing one route, that row became `.done`
- completed row animation became `none`
- remaining incomplete row kept `sfSemanticTodoPulseV1`

### LIV-004 Build-a-Room

URL:

```text
http://127.0.0.1:8000/launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html?fresh=semantic-follow-liv004#/level/LIV-004
```

Result:

- `.sf-build-room-v6r227 .sf-br-checklist > .sf-br-need:not(.is-satisfied)` rows used `animationName === "sfSemanticTodoPulseV1"`
- Build Checklist rows had the stronger `2px` outline
- gear cards did not highlight
- credit/budget metric panels did not highlight
- Job Brief did not highlight
- Reset Build and Submit Build did not highlight
- result/modal areas did not highlight
- Build-a-Room script still loaded:
  `patch/sf-build-room-renderer.js?v=6r277`

### Diagnosis

Verified on `LIV-031`.

Result:

- no patch checklist rows highlighted
- no Build-a-Room checklist rows highlighted
- diagnosis script still loaded:
  `patch/diagnosis-ui.js?v=6r263`

### No-Checklist Board

Verified on `LIV-001`.

Result:

- no semantic checklist animation present

### Old System Absence

Across acceptance probes:

```js
oldOverlay === 0
oldBroad === 0
```

Where old systems include:

- `#sf-todo-list-glow-overlay-v3`
- `.sf-todo-list-glow-overlay-v3`
- `#sf-brief-todo-attention-runtime-v4`
- `#sf-brief-todo-attention-runtime-script-v4`
- `#sf-todo-list-overlay-glow-v3`
- `#sf-todo-list-overlay-glow-script-v3`
- `#sf-todo-item-highlight-v1`
- `#sf-todo-item-highlight-script-v1`
- `#sf-todo-item-highlight-v2`
- `#sf-todo-item-highlight-script-v2`
- `.sf-brief-todo-attention`
- `.sf-todo-item-attention-v1`

## Static Checks

Passed:

```text
node --check
```

for both edited inline cleanup scripts extracted from:

- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`

## Future Change Rule

Future checklist-highlight changes should extend semantic row selectors only after inspecting live DOM.

If a new board type needs checklist highlighting:

1. Inspect the board DOM in browser.
2. Identify the real repeated checklist row element.
3. Identify its real completed state.
4. Add a narrowly scoped selector for incomplete rows only.
5. Verify old overlay systems remain absent.
6. Verify protected Build-a-Room and diagnosis versions still load unchanged.

