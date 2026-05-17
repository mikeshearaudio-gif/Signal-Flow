# Signal Flow Build-a-Room Hard Reset Handoff v6r227

Date: 2026-05-16

## Goal

Make Build-a-Room run through exactly one active renderer:

- `patch/sf-build-room-renderer.js`
- `patch/sf-build-room-renderer.css`
- `assets/build-room/build-room-manifest-v4.json`
- `assets/build-room/build-room-asset-map.json`

The old Build-a-Room DOM and the retired locker / Build-a-Room 2.0 patch stack should not be loaded by the active launch files.

## Active Files Touched

- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `patch/sf-build-room-renderer.js`
- `patch/sf-build-room-renderer.css`
- `tools/verify_sf_build_room_renderer_v6r227.py`

The asset files already present in the worktree are:

- `assets/build-room/build-room-manifest-v4.json`
- `assets/build-room/build-room-asset-map.json`

## Launch File Changes

In `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`:

- Removed active references to the retired Build-a-Room stack:
  - `sf-build-room-locker-integration.css`
  - `sf-build-room-locker-integration.js`
  - `sf-equipment-locker-ui.css`
  - `sf-equipment-locker-ui.js`
  - `sf-build-room-2-ui.css`
  - `sf-build-room-2-ui.js`
- Added the consolidated renderer stylesheet:
  - `/patch/sf-build-room-renderer.css?v=6r227`
- Added the consolidated renderer script:
  - `/patch/sf-build-room-renderer.js?v=6r227`
- Changed the splash/template button text from `Mic Locker` to `Equipment Locker`.
- Added `aria-label="Equipment Locker"` at the source template level.
- Changed the active Build-a-Room training panel output so it emits only a small v6r227 mount section:
  - `class="sf-build-room-v6r227-mount"`
  - `data-sf-build-room-renderer-mount="true"`
  - `data-level-id="<level id>"`
- Added an early return in the old Build-a-Room binder when it sees the v6r227 mount, so the old binder does not attach old click/scoring behavior to the consolidated renderer path.

## Renderer Changes

In `patch/sf-build-room-renderer.js`:

- Removed a stale `oldScriptNames` list that referenced retired script names.
- When the consolidated renderer mounts, it inserts the v6r227 root and removes the old Build-a-Room panel/mount DOM.
- Retry Build now goes through a single `retryBuild(levelId)` helper.
- `closeAllBuildModals()` now also clears older modal surfaces, including:
  - `.sf-economy-modal`
  - `.sf-br2-modal`
  - `#gameOverOverlay`
  - `.game-over-overlay`
- The Equipment Locker splash binding now updates the existing template button in place.
- The renderer no longer clones/replaces the focused locker button.
- The renderer no longer creates floating fallback Equipment Locker buttons.
- The periodic `setInterval(installSplashLocker, 1000)` was removed.
- The existing MutationObserver remains only to re-bind after app rerenders and schedule the consolidated renderer.

Expected runtime console from this renderer remains:

- `[Signal Flow] Build-a-Room consolidated renderer installed v6r227`
- `[Signal Flow] Build-a-Room consolidated renderer active v6r227 <level>`

Forbidden old runtime logs should not appear from the active launch path:

- `Equipment Locker UI active 6r224`
- `Build-a-Room locker integration active 6r216`
- `Build-a-Room 2.0 UI installed 6r224`
- `Build-a-Room 2.0 GUI active 6r224`

## Verification Script

Added/updated:

- `tools/verify_sf_build_room_renderer_v6r227.py`

It checks both active launch files:

- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`

It fails if any of these forbidden strings appear in the active launch files:

- `sf-equipment-locker-ui`
- `sf-build-room-locker-integration`
- `sf-build-room-2-ui`
- `Build-a-Room 2.0 GUI active`
- `Equipment Locker UI active`
- `Build-a-Room locker integration active`

It also verifies that the consolidated renderer CSS/JS references exist in the inner launch file and that the v4 build-room asset JSON files exist and parse.

## Verification Run

These passed:

- Forbidden string scan against active launch files.
- `python3 tools/verify_sf_build_room_renderer_v6r227.py`
- `/Users/mikeshear/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check patch/sf-build-room-renderer.js`
- `git diff --check`
- `osascript -l JavaScript tools/test_signal_flow_ledger_jxa.js`

Browser smoke performed through a temporary local server:

- Confirmed the consolidated renderer script and CSS were requested.
- Confirmed the v4 manifest and asset map were requested.
- Confirmed the installed console log appeared:
  - `Build-a-Room consolidated renderer installed v6r227`
- Confirmed no forbidden old Build-a-Room runtime console markers appeared.

## Current Worktree Notes

At handoff, the worktree is intentionally not committed.

Current changed/untracked files include:

- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `patch/sf-build-room-renderer.css`
- `patch/sf-build-room-renderer.js`
- `assets/build-room/build-room-asset-map.json`
- `assets/build-room/build-room-manifest-v4.json`
- `tools/apply_sf_build_room_renderer_v6r227.py`
- `tools/verify_sf_build_room_renderer_v6r227.py`
- `audit/build-room-hard-reset-handoff-v6r227.md`

Some renderer/CSS/asset changes were already present in the worktree before this handoff pass. They were preserved and not reverted.

## Recommended Next Manual QA

Use the active wrapper:

- `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`

Then hard reload and check:

1. Splash shows `Equipment Locker`, not `Mic Locker`.
2. Console shows only the consolidated v6r227 Build-a-Room install/active logs.
3. Console does not show old locker or Build-a-Room 2.0 active logs.
4. Load a Build-a-Room level such as `LIV-004`.
5. Confirm only the consolidated Build-a-Room UI is visible.
6. Confirm no old floating Equipment Locker fallback button appears.
7. Confirm wrong gear rejects.
8. Confirm over-budget rejects.
9. Confirm correct build approves.
10. Confirm Retry Build closes any timeout/modal surface before restarting the build.

## Follow-Up Risk

The monolithic launch file still contains historical Build-a-Room functions and CSS definitions for older renderer generations. This pass prevents the active launch path from loading retired external patch files and routes the active Build-a-Room panel into the v6r227 mount, but it does not delete every old historical function from the 30k-line launch file.

If the next pass wants a stricter cleanup, the safest direction is to remove or inert the old inline Build-a-Room helper blocks in small diffs, verifying after each deletion that non-Build-a-Room training modes still render.
