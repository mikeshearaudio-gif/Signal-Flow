# Quiz Consolidation Change Summary v1

## Scope

This pass consolidates quiz behavior in the active Signal Flow launch files without replacing the monolithic launch file. The goal was to reduce overlapping quiz render/bind/scoring paths and make wrapper loading delegate back to the native game shell.

## Files Changed

- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`
- `audit/quiz-consolidation-audit-v1.md`
- `audit/quiz-consolidation-change-summary-v1.md`

## Main Game Launch Changes

### Quiz level identity

- Added `sfv182QuizPanel(panel)` as the shared quiz panel resolver.
- Updated `sfv182QuizLevelId(panel)` so scoring prefers `panel.dataset.levelId` from the actual rendered quiz panel.
- Kept current in-game level object as the next fallback.
- Moved wrapper selector/hash style identity to last-resort fallback behavior.
- Active quiz panels now render `data-level-id="${esc(l.id)}"`.

### Quiz scoring

- Added a consolidated immediate score refresh helper: `sfv182RefreshQuizScoreUI()`.
- Updated `sfv182AwardQuizQuestion(panel, index)` to dispatch one deterministic ledger group per question:
  - `quiz-${levelId}-q-${questionIndex}`
  - `scoreValue: 10`
  - `creditValue: 5`
- Added per-panel awarded-question tracking to prevent same-render double awards.
- Kept ledger idempotency as the persistent guard for replay/re-render cases.
- Updated `sfv182AwardQuizTimeBonus(panel, secondsRemaining)` to dispatch one deterministic ledger group:
  - `quiz-${levelId}-time-bonus`
  - `scoreValue: min(50, floor(secondsRemaining))`
  - `creditValue: 0`
- Removed the active completion path that awarded a flat whole-quiz score.
- Changed `sfAwardTimedQuizLedgerScoreOnce(...)` so legacy callers no longer award a flat quiz completion amount; it now only delegates to the consolidated time-bonus helper when fully complete.

### Quiz binding

- Kept `sfv182BindQuiz()` as the consolidated active binder.
- Changed `sfv189BindQuiz()` to delegate to `sfv182BindQuiz()` instead of maintaining its own scoring logic.
- Correct answers now award immediately through `sfv182AwardQuizQuestion(...)`.
- Completion now awards only the time bonus through `sfv182AwardQuizTimeBonus(...)`.
- Double clicks on an already answered question do not create duplicate local awards.

### Quiz timeout

- `gameOver()` already checks for `sfv182CompleteQuizOnTimeout()`.
- Updated timeout completion helper to use the shared quiz panel resolver.
- Timeout behavior now:
  - Stops timer.
  - Keeps already-earned question score/credits.
  - Awards no time bonus.
  - Avoids the Game Over overlay.
  - Shows partial result text.
  - Advances after a short delay.

### Quiz rendering and scroll affordance

- Active quiz card fronts render `1`, `2`, `3`, `4`, `5`.
- Active quiz panels include the actual level id in `data-level-id`.
- Replaced multiple overlapping quiz scroll CSS injections with one consolidated `sfvQuizConsolidatedScrollAffordanceV1` block.
- Added stable quiz-specific `Scroll for more` markup.
- Disabled generic scroll cue/arrow visuals inside quiz boards.
- The quiz scroll cue uses `pointer-events: none` so it cannot block answer clicks.
- Added bottom spacing so lower answers on cards 4 and 5 remain reachable.

### Native shell load behavior

- Added `findInGameLoadButton()` to the native shell script.
- Updated `loadGameLevel(targetId)` so it:
  - Finds the in-game selector.
  - Sets the selector value.
  - Dispatches `input` and `change`.
  - Clicks the in-game Load Board button when present.
- Kept direct `window.loadLevel(target)` as fallback only.

## Wrapper Changes

- Added `delegateToGameFrame(id)` in `Signal_Flow_v1_41_18_NAV_WRAPPER.html`.
- Wrapper `loadLevel(id)` now:
  - Updates wrapper controls for dev navigation.
  - Delegates non-IR boards to `frame.contentWindow.sfNativeGameShellLoadLevel(id)` when the game frame is already available.
  - Falls back to setting `frame.src` if delegation is unavailable.
- The wrapper remains a navigation shell and does not own quiz scoring/completion state.

## Audit Added

Added `audit/quiz-consolidation-audit-v1.md` documenting:

- Active quiz renderers.
- Active quiz binders.
- Remaining old scoring calls.
- Wrapper/native game shell load paths.

## Verification Run

- `git diff --check`
  - Passed.
- `osascript -l JavaScript tools/test_signal_flow_ledger_jxa.js`
  - Passed.
- Headless Chrome quiz smoke for `PST-001`
  - Panel `data-level-id`: `PST-001`.
  - Card fronts: `1,2,3,4,5`.
  - First correct answer: visible score changed from `0` to `10`.
  - Final score after all five: `94`, matching question points plus remaining-time bonus.
  - Credits after five correct answers: `25`.
  - Scroll cue visible and non-click-blocking.
- Headless Chrome timeout smoke for `REC-001`
  - Two correct answers gave score `20`.
  - Credits were `10`.
  - Timeout showed partial result.
  - Game Over overlay did not appear.
- Headless Chrome wrapper load smoke
  - `PST-001` loaded without blank board.
  - `REC-001` loaded without blank board.
  - `LIV-001` loaded without blank board.
- Headless Chrome Build-a-Room render smoke
  - `LIV-004` rendered Build-a-Room content.

## Notes

- Chrome local-file smoke tests still logged two `ERR_FILE_NOT_FOUND` resource messages. They did not block the tested quiz, wrapper, timeout, or Build-a-Room flows.
- Existing non-quiz training-only `sfAwardLedgerScoreOnce('training-' + level().id, 500, 25)` calls remain outside the active quiz path and were documented in the audit.
