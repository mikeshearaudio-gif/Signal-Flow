# Signal Flow Memory

Last updated: 2026-05-28

## Current Working Entry Point

- Open `index.html` first.
- `index.html` redirects to `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`.
- The wrapper uses `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html` as the full embedded game dependency.
- Distributed IR levels use `launch/ir-level-runner.html`.

## Native Board Surface Discovery After Build-a-Room

Locked 2026-05-27 as Build-a-Room cleanup / native surface discovery fix `v6r280`.

Root cause:

- After visiting LIV-004 / Build-a-Room, `body.sf-build-room-v6r227-active` could remain on the raw iframe after navigating to normal Live Sound boards.
- That active Build-a-Room class hid normal `.level-shell` children that were not `.sf-build-room-v6r227`.
- LIV-020 and LIV-019 still rendered `#patchbay`, but the patchbay was hidden at `0 x 0`, so `src/live-sound-native-renderer.js` saw only the brief shell and logged `Native renderer waiting for board surface` / `Native renderer could not find live board surface`.

Locked behavior:

- `patch/sf-build-room-renderer.js?v=6r280` must clear Build-a-Room shell mode whenever the current level is not a Build-a-Room level.
- Leaving Build-a-Room must remove stale Build-a-Room roots, restore `.level-shell` / `.training-stage-shell` layout and overflow styles, and unhide children marked with `data-sf-br-old-shell-child`.
- Build-a-Room shell mode must rescan after navigation hooks including `startLevelById`, `renderRoute`, `navigateTo`, `loadGameLevel`, `loadLevel`, selector changes, hash changes, and popstate.
- Keep Build-a-Room behavior locked for LIV-004, LIV-013, LIV-027, and LIV-041.
- `src/live-sound-native-renderer.js?v=6r403q2` may retry native surface discovery for a bounded async shell/render replacement window, but must not use infinite retry.
- Normal Live Sound boards must expose a visible `#patchbay` / `.patchbay-wrap` before native mount attempts complete.

Cache/version notes:

- Active raw build include: `../patch/sf-build-room-renderer.js?v=6r280`.
- Active native renderer include: `../src/live-sound-native-renderer.js?v=6r403q2`.
- Wrapper raw-build cache key: `scroll-affordance-passive-v6r292`.

Do not use this fix as a reason to touch route data, `validRoutes`, cable renderer behavior, LIV-019 native cable lock `v6r426`, hitbox locks, label locks, gear placement, checklist behavior, or scoring/economy.

## LIV-019 Native Cable Lock

Locked 2026-05-26 as LIV-019 native cable layer `v6r426`.

Reference handoff:

- `docs/HANDOFF_2026-05-26_LIV019_NATIVE_CABLE_LOCK.md`

Locked cable behavior:

- LIV-019 uses the original native game cable renderer: `.sf-native-cables`, `.sf-cable-line`, `.sf-cable-shadow`, and native endpoint dots.
- Do not reintroduce custom endpoint stubs, pigtails, viewport overlays, canvas cables, or any second LIV-019 cable layer.
- `src/sf-live-cable-mode-kit.js?v=6r426` is a cable-mode/top-layer kit only; it must not draw custom cable graphics.
- LIV-019 native cable SVG must stay above hardware, labels, overlays, and hitboxes with `z-index: 2147483600` and `pointer-events: none`.
- LIV-019 cable endpoints must resolve from the current locked DOM hitbox centers inside `.sf-live-native-layer.sf-live-native-level-liv-019`.
- Ignore duplicate source-panel buttons under `.sf-native-liv019-source-panel` and `.sf-native-liv009-source-panel` when resolving cable endpoint anchors.
- `src/sf-liv019-clean-finalizer-v6r421.js` is locked as tool cleanup only: no cable drawing, no endpoint movement, no native cable suppression.

Forbidden legacy cable code:

- No active include of `src/sf-liv019-runtime-finalizer.js`.
- No `sf-liv019-runtime-finalizer.js?v=6r419` or `sf-liv019-runtime-finalizer.js?v=6r421`.
- No `native-cableLayer-rendered-locked-hitbox-center`.
- No `cableCenterSource`.

Keep these locked LIV-019 scripts:

- `sf-liv019-scroll-shell.js?v=6r389`
- `sf-liv019-overlay-lock.js?v=6r407`
- `sf-liv019-foh-label-lock.js?v=6r399`
- `sf-liv019-foh-label-final-lock.js?v=6r401`
- `sf-liv019-hitbox-final-lock.js?v=6r408`
- `sf-liv019-stagebox-8-lock.js?v=6r404`
- `sf-liv019-clean-finalizer-v6r421.js?v=6r421q2`
- `sf-live-cable-mode-kit.js?v=6r426`

Do not change route data, `validRoutes`, hitbox coordinates, label locks, gear placement, scroll shell, stagebox 8-input lock, or live-sound native renderer route validation when working on LIV-019 cable display.

Latest cable QA passed for Kick -> Stage Box Input 1, FOH Aux 1 -> IEM 1, and FOH Bus 1 -> Reverb In L. All tested cable endpoints landed exactly on locked hitbox centers with max delta `0px`, the native cable SVG was top-layered, and the hitbox lock reported `70/70` with `missingCount: 0`.

## Scroll Affordance Rule

Locked 2026-05-28 as passive scroll affordance `v6r292`.

Scrollable boards should show idle-only static direction indicators for available scroll directions. Indicators hide during active scrolling and recompute after scroll idle. They must not flash, animate repeatedly, intercept pointer events, or be board-specific visual patches.

Locked behavior:

- Active shared utility: `src/sf-scroll-affordance.js?v=6r292`.
- The scroll-affordance utility only observes selected scroll hosts and draws passive cue overlays. It must not own, correct, or rewrite wheel physics.
- Do not let `src/sf-scroll-affordance.js` set `scrollLeft`, `scrollTop`, container overflow, dimensions, min-height, transforms, wrapping, reparenting, or board content position.
- Do not reintroduce inline launcher blocks `sf-universal-scroll-cues-v1` or `sf-universal-scroll-cues-script-v1`.
- Treat scroll affordance as a small state machine: `state = idle | scrolling`.
- Visible indicators are `idle && availableDirections`; hidden indicators are `scrolling || no hidden content`.
- Show scroll indicators only when the scroll container has hidden content in that direction.
- Hide the left indicator at the left edge and the right indicator at the right edge.
- Hide the up indicator at the top edge and the down indicator at the bottom edge.
- Hide all indicators during wheel, touch, trackpad, pointer-drag, keyboard, or native scroll activity.
- Recompute after scroll idle, board load, level change, resize, orientation/layout change, and native board remount.
- Indicators must use `pointer-events: none` and must not alter layout, scroll dimensions, jack clicks, cable dragging, labels, gear interaction, route validation, cable rendering, hitbox locks, or checklist behavior.
- Indicator visuals are subtle transparent edge chevrons, not circular buttons or game controls. They must not look clickable.
- Use existing viewport contract markers rather than guessing board surfaces from scratch: native `.sf-live-native-viewport`, `.sf-live-native-scroll-host`, `.sf-live-native-scroll-host-liv010`, and Build-a-Room `.sf-br-shell-owned` / `data-sf-br-shell-root` viewport contracts.
- Build-a-Room root contracts may resolve their scroll target to the owned shell, because the visual root is mounted inside the viewport contract while the shell owns the scroll range.
- For Build-a-Room targets only, the cue overlay should be clipped to the visible browser/iframe viewport if the owned shell extends below the viewport. This keeps the DOWN cue at the visible owned-shell edge instead of below the screen.
- Build-a-Room target preference is the actual scroll host whose `scrollTop` changes: `.sf-br-shell-owned` with real scroll range, then `[data-sf-br-shell-root]`, then `.sf-build-room-v6r227`, then the nearest visible scrollable ancestor of the Build-a-Room root. Do not attach to gear cards, selected gear lists, option grids, buttons, stale patchbay containers, or stale native board containers.
- Known rendered viewport hosts such as `.patchbay-wrap`, `.patchbay-wrap.front-panel-view`, and environment-scoped `.patchbay-wrap.env-*` may be used as passive fallback targets only when they already have real hidden scroll range; the affordance utility must never change their overflow, dimensions, or scroll behavior.
- Diagnosis/training panel roots may be used as passive candidates, but cue rendering must resolve to the nearest visible element with actual scroll range rather than card/control children.
- The scroll-affordance MutationObserver must ignore `.sf-scroll-cue` and `#sf-universal-scroll-cues-v1` mutations so cue rendering never schedules itself into a repeated clear/repaint loop.
- Legacy scroll-cue filters in the native game shell must not hide `.sf-scroll-cue`; the shared affordance utility owns those indicators across native patch, LIV-018/019 shell, Build-a-Room, diagnosis, and other real scroll viewports.
- Build-a-Room submit visibility helpers must not set padding, overflow, dimensions, or scroll ownership on board containers; Build-a-Room renderer `v6r280` owns those viewports.
- Do not depend on immediate native board mount timing. During navigation/remount, the affordance utility should quietly retry until a stable viewport contract exists, then render idle indicators once appropriate.
- Keep this as a shared scroll-affordance utility for Signal Flow boards; do not add board-specific scroll indicator patches unless absolutely necessary.

Locked scroll ownership:

- LIV-018 scroll behavior is owned by `src/sf-liv018-scroll-shell.js?v=6r376`. The raw `#patchbayWrap` wheel handler must exit for `.patchbay-wrap[data-sf-liv018-scroll-shell]` and not fight the dedicated shell.
- LIV-019 scroll shell/layout remains locked by `src/sf-liv019-scroll-shell.js?v=6r389`. The active raw game wheel handler may handle LIV-019 clear vertical wheel as vertical scroll and clear horizontal / shift-wheel as horizontal scroll, but must not reintroduce vertical-wheel-to-horizontal drift.
- Other patch boards retain the legacy raw game wheel behavior unless specifically repaired.
- Build-a-Room scroll ownership remains with `patch/sf-build-room-renderer.js?v=6r280`; the affordance utility must only observe `.sf-br-shell-owned` / Build-a-Room viewport contracts and draw cues.
- Diagnosis scroll ownership remains with diagnosis rendering; the affordance utility must not change diagnosis layout or controls.

Current acceptance lock:

- LIV-018 and LIV-019: vertical wheel/scroll must not drift right; horizontal scrolling must still work; subtle idle cues appear only for available directions and hide while scrolling.
- Build-a-Room: at top, DOWN cue is visible when content remains below and UP is hidden; after scrolling down, UP appears and DOWN remains visible if more content remains; at bottom, DOWN disappears.
- Non-scrollable boards show no cues.
- LIV-019 cable kit `v6r426`, clean finalizer `v6r421q2`, hitbox locks, label locks, route validation, and native cable top-layer behavior remain untouched.

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

## LIV-016 Full-Band Stagebox Repair Memory

Recorded 2026-05-21 after the PNG-backed LIV-016 repair and endpoint-map correction.

Current relevant files:

- `src/live-sound-native-renderer.js`
- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `assets/live-sound/png/liv016-full-band-layout.png`
- `assets/live-sound/png/liv016hitboxes0.png`
- `assets/live-sound/png/liv160.png`
- `assets/live-sound/svg/hardware/live mic.svg`
- `assets/live-sound/svg/hardware/bass0.svg`
- `assets/live-sound/svg/hardware/guitar1.svg`
- `assets/live-sound/svg/hardware/Guitar 2.svg`
- `assets/live-sound/svg/hardware/keyboard0.svg`

Locked/current behavior:

- `LIV-016` is now `16-channel Stage Box to Front-of-House`, not the old delay-tower board.
- It uses `assets/live-sound/png/liv016-full-band-layout.png` as the rendered board image.
- `assets/live-sound/png/liv016hitboxes0.png` is reference only and must not render.
- Source/instrument hitboxes were mapped from the brown reference regions and are considered correct after the latest pass.
- `Stage Box Input 1-16` endpoints belong on the upper stagebox input panel.
- `FOH Main L/R` endpoints belong on the blue FOH main output jacks.
- `Crossover Left/Right In` endpoints belong on the left input pair of the crossover.
- Crossover colored rows are outputs, not the required input targets.
- Show Hints must show source, jack, and equipment labels, including Stage Box Inputs, FOH Console, FOH Main L/R, Crossover Inputs, and Crossover Outputs.
- No blue source boxes should render over the PNG.
- No extra grey normalization cable should be drawn because the trunk cable is already in the PNG.
- Renderer cache in the raw launch file is currently `v=6r276`.

Route/checklist behavior:

- Required routes are the 16 stagebox inputs plus FOH Main L/R to Crossover L/R In.
- Stereo-pair visible checklist gating is enforced for Guitar 1, Guitar 2, Keys, OH, and Main L/R.
- A stereo half should not visually complete its checklist row until the paired route is also complete.

Validation completed:

- `node --check src/live-sound-native-renderer.js`
- Browser QA through the wrapper on port `8000`.
- `LIV-016` loads with 16 source hotspots and 20 jack endpoints.
- Show Hints labels equipment and endpoints.
- `liv016hitboxes0.png` is not rendered.
- Tested Lead Vocal, Bass, Keys L/R, Kick, and Main L/R routes.
- Keys L alone did not complete; Keys R completed both. Main L alone did not complete; Main R completed both.
- `LIV-015` was smoke-checked earlier and still uses the processing-family renderer, not the LIV-016 PNG layer.

Do not modify for this lock:

- `LIV-015`
- Build-a-Room v6r277
- `diagnosis-ui.js?v=6r263`
- IR runner layout/scoring
- Semantic checklist highlighter

Reference handoff:

- `docs/HANDOFF_2026-05-21_LIV016_FULL_BAND_STAGEBOX_REPAIR.md`

## Signal Flow project law — reassess the approach when a better one exists

Do not assume the current implementation path is the best or only path. If a cleaner, safer, more maintainable, or more visually reliable approach exists, suggest it clearly before continuing. Do not keep doing work merely because the current path is already underway. When a chosen method starts creating repeated alignment, readability, maintainability, or regression problems, pause and reassess the approach. Prefer the method that best serves the game, player clarity, and long-term maintainability, even if that means changing direction.
