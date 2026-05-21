# Signal Flow Handoff: IR / Listening Board UI Cleanup

Date: 2026-05-20

## Task

Apply a universal UI cleanup to all IR/listening boards so the board does not reveal the answer before the player chooses an impulse response, and so the freed space is used to enlarge the reference image.

## Files Changed

- `launch/ir-level-runner.html`

## Universal Route Scope

The shared navigation wrapper routes IR/listening boards through:

- `launch/ir-level-runner.html`

Because the cleanup was made in this shared runner, it applies universally to IR boards rather than only to `LIV-005`.

## Implementation Summary

- Replaced the visible instruction copy with exactly:

  `Choose the impulse response from the list on the right that best matches the image.`

- Removed the answer-reveal UI from the left target panel:
  - Deleted the `#spaceCaption` DOM node.
  - Removed the `.space-caption` CSS.
  - Removed the JavaScript assignment that wrote `level.space` into the panel.

- Removed per-level `level.brief` display from the left panel to avoid extra hint text during play.

- Removed this sentence from the initial and reset helper/listening guidance:

  `All 24 choices are available.`

- Kept the useful listening guidance:

  `Listen for room size, surface tone, reflection density, and decay shape.`

- Reflowed the layout to enlarge the image:
  - Board width increased from `1180px` max to `1440px` max.
  - Left/reference column made wider.
  - Image area min height increased from `250px` to `560px` on desktop.
  - Mobile/stacked layout keeps a large image area with no horizontal overflow.

## Guardrails Observed

- Did not modify Build-a-Room v6r277.
- Did not modify `diagnosis-ui.js?v=6r263`.
- Did not modify native Live route validation.
- Did not modify IR routing, scoring, economy, or assets.
- Did not restore old checklist highlight systems.

## Verification Completed

Syntax:

- Extracted inline script from `launch/ir-level-runner.html`.
- Ran:

  `node --check /tmp/ir-level-runner-inline.js`

- Result: passed.

Static checks:

- Confirmed exactly one instance of the new instruction.
- Confirmed no `spaceCaption` / `space-caption`.
- Confirmed no `All 24 choices are available.`
- Confirmed no `levelBrief` assignment from `level.brief`.
- Confirmed IR options still render from `data.IR_LIST`.

Live browser smoke test:

- Desktop viewport: `1440x900`
  - Exact instruction present.
  - No `#spaceCaption`.
  - Left target panel did not reveal `Club / Live Venue`.
  - Forbidden sentence absent.
  - 24 IR choices rendered.
  - Reference image loaded.
  - Image measured `840x649`.
  - No horizontal overflow.
  - No browser console/page errors.

- Mobile viewport: `390x844`
  - Exact instruction present.
  - No reveal selector.
  - No named-room reveal in target panel.
  - Forbidden sentence absent.
  - 24 IR choices rendered.
  - Reference image loaded.
  - Image measured `360x557`.
  - No horizontal overflow.
  - No browser console/page errors.

Screenshots:

- `audit/ir-board-cleanup-live.png`
- `audit/ir-board-cleanup-mobile.png`

## Manual Test Instructions

1. Open:

   `OPEN_GAME.html`

2. Navigate to an IR/listening board such as `LIV-005`.

3. Confirm the left/reference panel:
   - Shows the exact instruction:

     `Choose the impulse response from the list on the right that best matches the image.`

   - Does not reveal the target room/IR name, for example `Club / Live Venue`.
   - Shows a larger reference image.

4. Confirm the right/listening panel:
   - Renders all IR options.
   - Keeps this guidance:

     `Listen for room size, surface tone, reflection density, and decay shape.`

   - Does not show:

     `All 24 choices are available.`

5. Select an IR and submit.

6. Confirm scoring/result feedback still appears and the board completes normally.

## Current Git Notes

Known modified files after this pass include:

- `launch/ir-level-runner.html`
- `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html` from earlier semantic checklist highlight work

New audit screenshots:

- `audit/ir-board-cleanup-live.png`
- `audit/ir-board-cleanup-mobile.png`

