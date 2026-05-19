# Signal Flow Memory

Last updated: 2026-05-18

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
