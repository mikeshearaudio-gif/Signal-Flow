# Signal Flow Local Repo Stabilization Handoff

Date: 2026-05-18

## Summary

This pass stabilized the local Signal Flow repo after cleanup, crashes, and missing updated GUI renders. The main issue pattern was that several active runtime patches and assets were being loaded with root-relative paths such as `/patch/...`, `/src/...`, and `/assets/...`. Those paths are brittle in the local repo and can fail when the game is opened from a nested launch file or from a future packaged build.

The fix pass made the active main launch file load patch/source files with repo-relative paths, added the missing diagnosis SVG skin to the active launch, and changed key patch modules to resolve assets from their own script location.

## Active Launch Flow

Use this path for local testing:

1. Open `index.html`.
2. It redirects to `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`.
3. Normal/full game boards are hosted by `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`.
4. Distributed IR levels use `launch/ir-level-runner.html`.

The full embedded game file remains the critical dependency for the wrapper.

## Files Changed In This Stabilization Pass

- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
  - Changed active patch/source includes from root-relative to repo-relative paths.
  - Added `../patch/sf-diagnosis-svg-skin.css` and `../patch/sf-diagnosis-svg-skin.js`.
  - Bumped the live-sound native renderer cache query to `v=6r246`.

- `patch/diagnosis-ui.css`
  - Changed root-relative diagnosis background asset URLs to CSS-relative URLs.

- `patch/diagnosis-ui.js`
  - Changed diagnosis SVG asset root to `new URL('../assets/diagnosis/svg/', document.currentScript?.src || document.baseURI).href`.
  - Diagnosis UI can now mount when the page root is `main`, `#app`, or `body`, not only `main.game`.

- `patch/sf-diagnosis-svg-skin.js`
  - Changed diagnosis SVG asset root to resolve from the script URL.
  - Added refresh scheduling on load, hash changes, history changes, select changes, and relevant DOM mutations so diagnosis art can appear after navigating to a diagnosis board.

- `patch/sf-build-room-renderer.js`
  - Changed manifest and asset-map URLs to resolve from the script URL.
  - Added an embedded `level().training` fallback so build-room boards can still render if local JSON fetches are blocked.
  - Build-room card images now resolve from the repo root.

- `src/live-sound-native-renderer.js`
  - Added `sfRepoUrl()` helper rooted at the repo.
  - Routed live-sound native hardware images, drum-kit image, asset labels, LIV-028 stagebox overlay, and LIV-010 panel images through repo-root URL resolution.
  - Fixed listed live-board issues:
    - `LIV-006` now presents `CROSSOVER` terminology for the processor path and overlays `AUX ZONE INPUTS` over the old zone wording.
    - `LIV-010` retains a dedicated tall scrollable native layout.
    - `LIV-011` has a taller scrollable board and larger equipment panels.
    - `LIV-002`, `LIV-025`, `LIV-026`, and `LIV-028` source cable starts now align with a visible right-edge source jack.
    - `LIV-028` has adjusted stagebox/FOH/IEM placement plus a taller scrollable board to reduce equipment overlap.

## Current Validation

Static checks passed:

```bash
/Users/mikeshear/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check src/live-sound-native-renderer.js
/Users/mikeshear/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check patch/diagnosis-ui.js
/Users/mikeshear/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check patch/sf-diagnosis-svg-skin.js
/Users/mikeshear/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check patch/sf-build-room-renderer.js
```

Asset presence checked:

- `assets/diagnosis/svg/backgrounds/diagnosis-board-shell.svg`
- `assets/build-room/build-room-manifest-v4.json`
- `assets/build-room/build-room-asset-map.json`
- `assets/live-sound/svg/hardware/stagebox-snake-head-16x2-aes.svg`
- `assets/drums/svg/drum-kit-5-piece-8-hitboxes.svg`

Path sanity checked:

- Active `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html` no longer has active root-relative `/patch` or `/src` includes.

## Known Limits

Browser screenshot QA was not completed in this pass because Playwright could not launch in the current environment. The bundled Playwright package was present, but its browser executable/cache was unavailable or broken. Do not treat this pass as full visual QA.

The repo still has an untracked local crash harness:

- `launch/Signal_Flow_CRASH_TEST_NATIVE_ONLY.html`

Keep it for now unless the crash investigation is fully resolved.

## Recommended Next QA Pass

Run a local server from repo root:

```bash
python3 -m http.server 8000
```

Then verify in a browser:

1. Open `http://127.0.0.1:8000/`.
2. Confirm wrapper loads.
3. Navigate to representative diagnosis boards and confirm the updated diagnosis GUI/skin appears after navigation.
4. Navigate to build-room boards and confirm the consolidated build-room renderer loads art from `assets/build-room`.
5. Navigate to LIV native-rendered boards, especially LIV-010, LIV-011, LIV-015, LIV-028, and confirm hardware SVGs render.
6. Exercise the crash-test harness if still needed:
   `http://127.0.0.1:8000/launch/Signal_Flow_CRASH_TEST_NATIVE_ONLY.html`
7. Capture screenshots of diagnosis, build-room, and live-sound native states.
8. Check browser console for runtime errors and 404s.

## Cleanup Guidance

Keep all `assets/` content, even if apparently unused.

Safe-to-remove categories remain:

- local archive copies
- `.DS_Store`
- generated cache files
- generated pre-patch snapshots
- old one-off patch/verify scripts
- renderer backup snapshots

Do not rewrite Git history unless the goal is specifically to shrink the repo for distribution or create a fresh clean remote. Keeping history is safer for local recovery.
