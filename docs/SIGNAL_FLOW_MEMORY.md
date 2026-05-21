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

## Splash / IR Routing / Audio-Origin Lock

Locked 2026-05-20 after wrapper splash and IR navigation repairs.

Current locked files:

- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`
- `launch/ir-level-runner.html`
- `assets/ui/signal-flow-splash-stage.png`

Locked behavior:

- The wrapper boots to the raw game splash/start state. No gameplay board auto-loads on wrapper boot.
- The raw splash art is restored through `assets/ui/signal-flow-splash-stage.png`, extracted from the original bundled splash PNG. Do not replace it with the transparent 1x1 GIF or a redesigned CSS splash.
- Wrapper Splash/Home returns to the same raw splash/start state.
- Public IR board IDs use the cleaned IR runner:
  - `REC-005`, `LIV-005`, `BRD-005`, `PST-005`, `GAM-005`
  - `REC-014`, `LIV-014`, `BRD-014`, `PST-014`, `GAM-014`
  - `REC-024`, `LIV-024`, `BRD-024`, `PST-024`, `GAM-024`
  - `REC-035`, `LIV-035`, `BRD-035`, `PST-035`, `GAM-035`
  - `REC-046`, `LIV-046`, `BRD-046`, `PST-046`, `GAM-046`
- IR runner URLs stay in this form:
  `ir-level-runner.html?level=ENV-IR-NN&display=ENV-XXX&v=ir-ui-cleanup-v2`
- The wrapper exposes `window.sfWrapperLoadLevel = loadLevel`, listens for `sf-wrapper-load-level`, and catches stale iframe raw-game IR hashes so `#/level/LIV-005` cannot strand the user inside the native board.
- The raw game delegates public IR IDs to the IR runner instead of rendering them through the native level path.
- Direct top-level `ir-level-runner.html` has standalone navigation fallbacks:
  - `Choose Another Board` goes to `Signal_Flow_v1_41_18_NAV_WRAPPER.html`.
  - `Next Board` goes to the next public raw board hash, such as `#/level/LIV-006`.
  - Inside the wrapper, those buttons continue to use `postMessage`.

Audio-origin rule:

- Test the wrapper through local HTTP:
  `http://127.0.0.1:8000/launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`
- Do not test IR preview audio, Build-a-Room manifests, or native SFX from `file://`. Browser security blocks `fetch()` from `origin null`, causing missing flute audio and manifest/SFX CORS errors.
- Missing `Flute Solo` audio under `file://` is not a code bug. Only change IR audio code if the same failure reproduces from `http://127.0.0.1:8000`.

Harmless/expected console noise:

- `AudioContext was not allowed to start` can appear until a user gesture.
- `favicon.ico` 404 is harmless.

Do not modify for this lock:

- Build-a-Room v6r277 renderer behavior, layout, submit/retry behavior, scoring, or economy.
- `diagnosis-ui.js?v=6r263`.
- Native Live renderer behavior, route validation, scoring, or economy.
- IR scoring or cleaned IR layout unless directly tasked.
- Semantic checklist highlighter.

Reference handoff:

- `docs/HANDOFF_2026-05-20_SPLASH_IR_ROUTING_AUDIO_LOCK.md`

## Raw Splash Universal Board-Load Lock

Locked 2026-05-21 after repairing raw splash Play / level select navigation inside the wrapper.

Current locked files:

- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`

Locked behavior:

- The raw splash must be able to load every known board from its Environment / Level picker, not just a small set of test levels.
- When the raw game is embedded in the wrapper, splash Play delegates to the wrapper bridge:
  - `parent.sfWrapperLoadLevel(levelId)` when available.
  - `postMessage({ type: "sf-wrapper-load-level", levelId })` as fallback.
- The wrapper-facing raw API `window.sfNativeGameShellLoadLevel(anyLevelId)` routes by level ID first using:
  `navigateTo("/level/" + encodeURIComponent(levelId))`
- The old selector-hunting behavior inside `sfNativeGameShellLoadLevel` is fallback only. Repeated console logs like `Native game shell changed in-game selector: REC-002` indicate the browser is running a stale or broken path.
- Normal non-IR boards route to the raw game hash:
  `Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html?v=raw-splash-universal-load-v2#/level/LEVEL-ID`
- Public IR boards still route through the wrapper to the cleaned IR runner:
  `ir-level-runner.html?level=ENV-IR-NN&display=ENV-XXX&v=ir-ui-cleanup-v2`
- The wrapper raw iframe uses cache key:
  `raw-splash-universal-load-v2`
- The IR runner URL and cache key are unchanged:
  - `IR_RUNNER = "ir-level-runner.html"`
  - `IR_RUNNER_CACHE = "ir-ui-cleanup-v2"`

Expected success console:

- For normal boards loaded from the raw splash:
  `[Signal Flow] Native game shell routed level: REC-002`
- Do not accept repeated selector-only logs as a passing state:
  `[Signal Flow] Native game shell changed in-game selector: REC-002`

Verification completed 2026-05-21 against:

- `http://127.0.0.1:8000/launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`

Verified through the actual raw splash UI:

- `REC-001` -> raw `#/level/REC-001`
- `REC-002` -> raw `#/level/REC-002`
- `BRD-003` -> raw `#/level/BRD-003`
- `PST-010` -> raw `#/level/PST-010`
- `GAM-020` -> raw `#/level/GAM-020`
- `LIV-004` -> raw `#/level/LIV-004`
- `LIV-005` -> cleaned IR runner with 24 choices

Syntax verification:

- Inline script syntax check passed for `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html` with 16 inline scripts.
- Inline script syntax check passed for `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html` with 5 inline scripts.

Do not modify for this lock:

- `launch/ir-level-runner.html`
- Build-a-Room v6r277
- `diagnosis-ui.js?v=6r263`
- Semantic checklist highlighter
- LIV-002 jack layout
- IR runner layout/scoring

Reference handoff:

- `docs/HANDOFF_2026-05-21_RAW_SPLASH_UNIVERSAL_BOARD_LOAD_LOCK.md`
