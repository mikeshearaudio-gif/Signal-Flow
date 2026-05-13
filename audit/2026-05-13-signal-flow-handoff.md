# Signal Flow Handoff - 2026-05-13

## Current Repo State

- Branch: `main`
- Latest relevant commit: `b541030 Consolidate quiz scoring and wrapper loading`
- Current working tree has follow-up edits in:
  - `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
  - `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`
  - `src/live-sound-native-renderer.js`

## What Was Done Today

### 1. Quiz consolidation

The first major pass consolidated quiz behavior in the monolithic game launch file instead of adding more DOM patches.

Key outcomes:

- Kept the central ledger as the score/credits source of truth.
- Made quiz scoring use deterministic ledger keys:
  - `quiz-${levelId}-q-${questionIndex}`
  - `quiz-${levelId}-time-bonus`
- Correct quiz answers award:
  - `+10` score immediately
  - `+5` credits immediately
- Quiz completion awards only remaining-time bonus, capped at `50`.
- Removed the active path that awarded flat quiz completion points.
- Re-clicks and same-render duplicate clicks do not double-award.
- Card fronts show `1, 2, 3, 4, 5`, not `100, 200, 300, 400, 500`.
- Active quiz panels now carry `data-level-id` for the actual rendered level.
- Older `sfv189BindQuiz` now delegates to the consolidated `sfv182BindQuiz` path.

### 2. Quiz level mismatch fix

After consolidation, one remaining bug showed:

- quiz panel was `PST-001`
- ledger `currentLevelId` had moved to `PST-002`

Fixes added:

- `sfv182EnsureQuizLedgerLevel(panel)` starts/restarts the ledger at the rendered quiz panel level before question/time-bonus awards.
- Quiz binding starts the ledger for `panel.dataset.levelId`.
- Quiz awards derive level id from the actual panel, not wrapper/hash state.
- Score UI refreshes from returned ledger totals instead of stale `state.score`.
- Added console logging for quiz awards:
  - `eventLevelId`
  - `ledgerCurrentLevelId`
  - `ledgerBefore`
  - `ledgerAfter`
  - `delta`
  - `routeId`

### 3. Quiz timeout behavior

Timeout behavior was kept aligned with the acceptance criteria:

- No Game Over overlay for timed-out quiz boards.
- Already-earned per-question score/credits remain.
- No time bonus is awarded on timeout.
- Partial result text is shown.
- Level advances after a short delay.

Verified case:

- `REC-001`, 3 correct answers, forced timeout:
  - score `30`
  - credits `15`
  - no Game Over overlay
  - partial result shown

### 4. Quiz scroll affordance

The existing global/universal scroll cue system was interfering with quiz behavior differently depending on load path.

Changes:

- The quiz panel is now the quiz scroll container.
- The quiz-specific cue lives inside the quiz panel.
- The cue is sticky, visible, and `pointer-events: none`.
- Universal scroll cue generation exits early when a quiz panel is active.
- Wrapper and game universal cue scripts both skip quiz boards.
- Answer D on cards 4 and 5 is reachable after scroll.

Verified wrapper-loaded quiz levels:

- `REC-001`
- `PST-001`
- `LIV-001`

All used the same quiz scroll host, had quiz-specific cue behavior, and had universal cue count `0`.

### 5. Wrapper/load path consolidation

The wrapper should remain a dev/navigation shell and should not own gameplay state.

Changes:

- Wrapper `loadLevel()` delegates non-IR boards into the iframe game shell when possible.
- Game shell `loadGameLevel(targetId)` attempts:
  - in-game selector value set
  - `input` / `change` dispatch
  - in-game Load Board click
  - normal `navigateTo("/level/...")` fallback
- The normal route fallback returns success, avoiding false native-load failure messages for non-native levels such as `LIV-001`.

### 6. Ledger refresh/new-run behavior

The remaining QA issue was score carryover after browser refresh because ledger state was restored from `sessionStorage`.

Changes:

- In the main game launch file:
  - stopped reading `signal-flow-native-ledger-v1` from `sessionStorage`
  - stopped writing it to `sessionStorage`
  - kept `window.sfSignalFlowLedgerState` as the in-page run state
  - removes stale `signal-flow-native-ledger-v1` once on boot
- In `src/live-sound-native-renderer.js`:
  - same no-sessionStorage ledger rule
  - continues to use `window.sfSignalFlowLedgerState`
  - can adopt `parent.sfSignalFlowLedgerState` for same-page wrapper/frame continuity

Expected behavior now:

- Browser refresh starts a fresh run at score `0`.
- In-page navigation carries score across levels.

Verified:

- `PST-001` starts at `0`.
- First correct answer changes score to `10`.
- `PST-001 -> PST-002` in-page navigation keeps score `10`.
- Browser refresh resets score to `0`.

### 7. Native Live renderer guard

The native Live renderer was running hashchange cleanup/unmark logic while non-native quiz/training boards were active, especially `LIV-001`.

Changes in `src/live-sound-native-renderer.js`:

- Added native patch-level checks based on `LIVE_NATIVE_PATCH_SPECS`.
- `syncActiveLevelSpec()` only syncs native patch levels.
- `mountNative()` returns early unless the current board is a native patch board.
- `clearNative()` returns early unless the current board is a native patch board.
- Hashchange handler:
  - unmounts native layer and exits on non-native boards
  - only clears/boots native renderer for native patch levels
- Native click intercepts do not run on non-native boards.

Acceptance covered:

- `LIV-001` loads as quiz/training.
- No native layer on `LIV-001`.
- No “Native game shell could not load: LIV-001” line in smoke test.
- No native cleanup/unmark spam in smoke test.
- `LIV-001` answers remain clickable and score `+10`.
- `LIV-002` and `LIV-003` still mount native patch boards.

## Verification Run Today

Required commands:

- `git diff --check`
  - Passed.
- `osascript -l JavaScript tools/test_signal_flow_ledger_jxa.js`
  - Passed.

Browser smokes:

- PST refresh/new-run:
  - `PST-001` score starts `0`
  - first answer `10`
  - `PST-001 -> PST-002` in-page navigation keeps `10`
  - browser refresh resets to `0`
- LIV-001 wrapper load:
  - panel level `LIV-001`
  - first answer `0 -> 10`
  - native layer count `0`
  - bad native logs `[]`
- Native patch board check:
  - `LIV-002` mounted native layer
  - `LIV-003` mounted native layer

## Important Constraints Preserved

- Quiz scoring math was not changed after it reached the accepted `+10/+5` plus time-bonus behavior.
- No broad new MutationObservers or polling loops were added.
- Build-a-Room scoring/credits were not intentionally changed.
- Native Live scoring still uses the central ledger.
- Wrapper remains a navigation shell, not a gameplay scoring source.

## Known Notes

- The active launch file remains monolithic and contains legacy generations of quiz/training systems. The current active path has been consolidated, but future work should continue avoiding one-off DOM patch layers.
- There are existing 404s for favicon/local resources during browser smoke tests. They did not block the tested flows.
- The current open diff is larger than ideal because it includes both the earlier follow-up fixes and the current no-sessionStorage/native guard fixes. It is still scoped to three files.

## Suggested Next Steps

- Commit the current follow-up diff separately from `b541030`.
- Run one manual interactive smoke in the browser:
  - refresh `PST-001`
  - answer one quiz question
  - navigate to `PST-002`
  - refresh again
  - load `LIV-001`, answer one question
  - load `LIV-002` and patch routes
  - load `LIV-003` and verify stereo pair scores once
- If continuing cleanup, consider extracting quiz helpers out of the monolithic launch file into a dedicated module, but only after the current behavior is locked.
