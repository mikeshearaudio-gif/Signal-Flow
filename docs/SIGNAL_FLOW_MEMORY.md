# Signal Flow Memory

Last updated: 2026-05-20

## Current Working Entry Point

- Open `index.html` first.
- `index.html` redirects to `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`.
- The wrapper uses `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html` as the full embedded game dependency.
- Distributed IR levels use `launch/ir-level-runner.html`.

## Repo Cleanup Rule

Keep `assets/` even when unused, because future board passes may need retired or reference art/audio.

Disposable cleanup targets:

- `.DS_Store`
- `__pycache__/`
- `.pyc`
- `.zip` local packaging copies
- `.bak` and `.bak_*`
- generated `audit/pre-*` snapshots
- generated one-off `tools/apply_*_v6r*.py` and `tools/verify_*_v6r*.py`
- renderer snapshot files such as `src/live-sound-native-renderer.v6*`

## Current Crash / Missing GUI Render Fixes

The active local fix pass addresses crashes and missing updated GUI renders by making patch/source loading and asset resolution stable from the local repo layout.

Important changes:

- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html` now loads active patch/source files with repo-relative paths such as `../patch/...` and `../src/...`.
- The diagnosis SVG skin is loaded by the main launch file.
- `patch/diagnosis-ui.js` resolves diagnosis SVG assets from its script location.
- `patch/sf-diagnosis-svg-skin.js` resolves diagnosis SVG assets from its script location and re-runs after DOM, level, hash, and selector changes.
- `patch/sf-build-room-renderer.js` resolves the build-room manifest and asset map from its script location.
- `src/live-sound-native-renderer.js` resolves live-sound hardware and overlay assets from the repo root, instead of assuming the page is served at `/`.

## Latest Live Board Bug Pass

Applied 2026-05-18:

- Build-a-room boards now have an embedded-level fallback if the manifest or asset map cannot be fetched locally.
- Diagnosis boards now mount against `main`, `#app`, or `body` if `main.game` is not present.
- `LIV-006` player-facing labels now read `CROSSOVER` and `AUX ZONE INPUTS` where the old processor/zone wording could show through.
- `LIV-010` keeps its dedicated tall scrollable native board styling.
- `LIV-011` uses a taller scrollable native board and larger equipment panels.
- `LIV-002`, `LIV-025`, `LIV-026`, and `LIV-028` source nodes now expose a visible right-edge source jack and use that point for cable starts.
- `LIV-028` uses a taller scrollable board and adjusted stagebox/FOH/IEM placement to reduce equipment stacking.

## Current Verification State

Passed static checks:

- `node --check src/live-sound-native-renderer.js`
- `node --check patch/diagnosis-ui.js`
- `node --check patch/sf-diagnosis-svg-skin.js`
- `node --check patch/sf-build-room-renderer.js`
- key referenced diagnosis, build-room, drums, and live-sound assets exist on disk.
- active main launch file no longer contains active root-relative `/patch` or `/src` includes.

Not yet complete:

- Browser screenshot QA was blocked because the local Playwright browser install was missing/broken in the current environment.
- Next pass should run the game in a browser and visually verify diagnosis, build-room, live-sound native boards, and IR wrapper navigation.

## Current Dirty Working Tree Context

At this handoff point, the relevant edited files are:

- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `patch/diagnosis-ui.css`
- `patch/diagnosis-ui.js`
- `patch/sf-build-room-renderer.js`
- `patch/sf-diagnosis-svg-skin.js`
- `src/live-sound-native-renderer.js`

Also present:

- `launch/Signal_Flow_CRASH_TEST_NATIVE_ONLY.html` is untracked and appears to be a local crash-investigation harness. It should be kept until the native live-sound crash investigation is finished.

## Build-a-Room Locked Design Baseline

Locked 2026-05-19 as Build-a-Room `v6r277`.

Current locked Build-a-Room files:

- `patch/sf-build-room-renderer.js`
- `patch/sf-build-room-renderer.css`
- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`

Active cache refs:

- `patch/sf-build-room-renderer.js?v=6r277`
- `patch/sf-build-room-renderer.css?v=6r277`

Locked player-facing behavior:

- Build-a-Room owns the main training-stage surface.
- The legacy external lesson/sidebar and old training-only board are hidden while Build-a-Room is active.
- Internal Job Brief and Build Checklist are the true left column inside the Build-a-Room UI.
- Equipment Options and cards are the right/main area.
- No redundant Room / System Build grid.
- No floating Equipment Locker / Mic Locker button.
- Reset Build and Submit Build stay in the top strip immediately left of the credit boxes.
- Category pill hitboxes and gear plus/minus hitboxes match the visible controls.
- Submit Build uses the existing shared validation/check path.
- Retry Build must not blank the Build-a-Room surface.

Implementation lock:

- `ensureContainer(levelId)` mounts into the active `.training-stage-shell` or `.level-shell`, using the current Build-a-Room mount as the anchor.
- Shell ownership hides only direct old shell siblings of the `.sf-build-room-v6r227` root.
- Do not reintroduce geometry-based sidebar hiding, broad DOM movers, mutation observers, transforms, negative shifts, or generic class-name scans.
- Keep the `v6r277` button/hitbox fixes intact.

Verified Build-a-Room levels:

- `LIV-004`
- `LIV-013`
- `LIV-027`
- `LIV-041`
- `REC-004`
- `BRD-004`
- `PST-004`
- `GAM-004`

Reference handoff:

- `docs/HANDOFF_2026-05-19_BUILD_ROOM_V6R277_LOCK.md`

## Build-a-Room Future Fix Rule

Treat the locked Build-a-Room design as the source of truth and recover it rather than redesigning.

Rules for Build-a-Room fixes:
- Restore the locked player-facing Build-a-Room experience.
- Fix shared Build-a-Room behavior in `patch/sf-build-room-renderer.js` and `patch/sf-build-room-renderer.css`.
- Apply fixes universally to all Build-a-Room levels.
- Do not use broad DOM movers, mutation observers, or generic cleanup scripts.
- Do not patch only LIV-004 unless the bug is truly LIV-004-specific.
- Keep shared submit/check behavior intact.
- Do not affect native patch boards, diagnosis boards, quiz boards, IR boards, or navigation.
- Protect Build-a-Room with the `v6r277` regression checklist before changing layout again.

## Semantic Checklist Highlight Lock

Locked 2026-05-20 as semantic checklist highlight `sf-semantic-todo-highlight-v1`.

Current locked files:

- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`

Active system:

- CSS block id: `sf-semantic-todo-highlight-v1`
- Cleanup script id: `sf-semantic-todo-highlight-script-v1`
- Pulse animation: `sfSemanticTodoPulseV1`
- Rail animation: `sfSemanticTodoRailV1`

Locked semantic selectors:

- Normal patch-board checklist rows:
  `main.game .level-shell .panel #paths > .path-card:has(.todo-badge):not(.done):not(:has(.done-badge))`
- Build-a-Room checklist item rows:
  `.sf-build-room-v6r227 .sf-br-checklist > .sf-br-need:not(.is-satisfied)`

Locked behavior:

- Highlight is item-level only.
- Normal patch-board incomplete to-do rows pulse.
- Completed normal rows stop pulsing when `.done` or `.done-badge` is present.
- The cleanup script also normalizes renderer rows whose `.todo-badge` text becomes `COMPLETE` or `DONE` by adding `.done`, because some native boards update badge text without swapping class names.
- Build-a-Room highlights only unsatisfied Build Checklist rows inside `.sf-br-checklist`.
- Build-a-Room satisfied rows stop pulsing through `.is-satisfied`.
- Gear cards, credit/budget metrics, Job Brief, selected gear lists, Submit/Reset buttons, result modals, diagnosis boards, quiz boards, IR boards, and boards without real checklist rows must not highlight.

Do not restore:

- `sf-brief-todo-attention-runtime-v4`
- `sf-todo-list-overlay-glow-v3`
- `sf-todo-item-highlight-v1` or `sf-todo-item-highlight-v2`
- fixed overlay boxes
- broad sidebar/brief/panel text scanning

Verification completed 2026-05-20:

- `LIV-003`: normal to-do rows highlight; completed route row stops highlighting.
- `LIV-004`: Build-a-Room Build Checklist rows highlight; gear cards, metrics, Job Brief, Submit/Reset, and result areas do not.
- `LIV-031`: diagnosis board has no checklist highlight.
- `LIV-001`: no-checklist/quiz board has no semantic highlight.
- `oldOverlay === 0` and `oldBroad === 0`.
- Build-a-Room still loads `sf-build-room-renderer.js?v=6r277`.
- Diagnosis still loads `diagnosis-ui.js?v=6r263`.
- `node --check` passed for both edited inline cleanup scripts.

Reference handoff:

- `docs/HANDOFF_2026-05-20_SEMANTIC_CHECKLIST_HIGHLIGHT_LOCK.md`
