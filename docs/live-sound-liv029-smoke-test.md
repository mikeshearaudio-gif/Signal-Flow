# LIV-029 Current-State Preservation Smoke Test

Checkpoint date: 2026-07-14

## Scope

This checkpoint captures the current LIV-029 runtime state before any further board-build layout or hitbox work. It does not change gameplay, routes, manifests, renderer behavior, scoring, hints, checklist logic, completion behavior, or trap behavior.

Runtime URL:

`http://127.0.0.1:5174/launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html?level=LIV-029&fresh=liv029-preservation-smoke`

The v1.41.18 wrapper loads the selector screen first. The browser smoke selects `#levelSelect=LIV-029`, clicks `#loadBtn`, then verifies the raw build in `#gameFrame` at `#/level/LIV-029`.

## Known Current State

- Title: `Debate Panel Signal Flow`
- Required routes: 11
- Runtime gear: 7
- Runtime good hitboxes: 22
- Runtime false/trap hitboxes: 8
- Stereo groups: 3
- Required wireless receiver asset: `assets/live-sound/svg/hardware/wireless-receiver-panel-animated-aligned.svg`
- Runtime implementation source: `renderLiv029DebatePanelScaffold` and `LIV029_HITBOXES` in `src/live-sound-native-renderer.js`
- Snapshot evidence: `audit/liv029-preservation-snapshot/`

## Snapshot Files

- `routes.json`: all 11 required routes, endpoint IDs/labels, route families, and stereo membership.
- `stereo-groups.json`: the three stereo groups and current checklist/completion semantics.
- `gear-layout.json`: current renderer/runtime gear geometry, assets, labels, and source-manifest geometry comparisons.
- `good-hitboxes.json`: all 22 valid runtime hitboxes with route associations and source-manifest geometry comparisons.
- `false-hitboxes.json`: all 8 false/trap runtime hitboxes with hint/completion flags and trap purpose.
- `locked-behavior.json`: current renderer functions, cable anchors, hint behavior, scoring expectations, completion expectations, and visual risks.
- `browser-smoke-result.json`: automated browser smoke evidence.

Note: `tools/liv029_browser_smoke.mjs` currently exits nonzero because it intentionally treats the incomplete hint coverage as a failing smoke condition. Mount, RF trap behavior, route-family completion, checklist completion, scoring, and final completion pass in the captured result.

## Browser Smoke Results

Mount passed:

- LIV-029 loads through the wrapper after selecting the board.
- Runtime layer count is 1.
- Runtime gear count is 7.
- Runtime hitbox count is 30 total: 22 valid and 8 false/trap.
- The aligned wireless receiver asset is visible in the runtime DOM.

Route-family smoke passed:

- Receiver routes complete:
  - Moderator Lav Audio Out -> Console Input 1
  - Panelist 1 Lav Audio Out -> Console Input 2
  - Panelist 2 Lav Audio Out -> Console Input 3
  - Audience Q&A Handheld Audio Out -> Console Input 4
- Main PA routes complete:
  - Console Main L/R -> PA Processor/Amp L/R
- Speaker routes complete:
  - PA Processor/Amp L/R -> Left/Right Speaker
- Press feed routes complete:
  - Console Matrix/Record L/R -> Press/Recorder L/R
- Monitor route completes:
  - Console Aux 1 -> Moderator Wedge

Trap behavior passed:

- Wireless Receiver Antenna A -> Console Input 1 produces the expected RF feedback: `This is RF, not audio. Use the receiver's audio output.`
- RF trap route draws an invalid/red route and does not complete a checklist row.
- Trap attempt leaves score clamped at 0.
- All 8 false/trap hitboxes remain marked non-hintable.

Checklist, scoring, and completion passed:

- All 11 route rows reach `COMPLETE`.
- Final `TO DO` count is 0.
- Completion overlay/state appears after all required routes are completed.
- Final score is 800 in the automated sequence. Current scoring awards:
  - 100 points for each of the four mono receiver input routes.
  - 100 points when each stereo pair is completed, not when the first side of the pair is patched.
  - 100 points for the mono moderator wedge route.
- This matches the observed LIV-029 stereo-pair behavior and should be treated as current behavior unless future design explicitly changes scoring.

Viewport/runtime observations:

- In the 1440x900 automated smoke, the native surface width is 1048px and the board layer width is 1000px, so no horizontal clipping was detected.
- The surface height is about 604px and the board layer height is 610px, with scroll height 646px, so a small vertical scroll area is expected.
- No duplicate LIV-029 layer, duplicate gear, or remount artifact was detected during the automated smoke.

## Confirmed Defect

Hint coverage is incomplete.

Observed:

- Clicking `Show Hints` changes the button to `Hide Hints`.
- False/trap hitboxes remain excluded from hints: 0 false hitboxes receive required-hint styling.
- Only 11 valid hitboxes receive `.sf-native-required-hint`.

Expected:

- LIV-029 has 22 valid route endpoints.
- Show Hints should identify all valid required endpoints, or the intended reduced destination-only hint behavior should be documented and accepted.

Likely cause:

- `normalizeNativeRequiredHintRings()` currently queries `.sf-native-jack` nodes only. LIV-029 source endpoints are rendered as `.sf-native-source.sf-native-liv029-hitbox`, so required source-side endpoints are not getting the required-hint class.

Severity:

- Medium. The board remains playable and completion works, but the hint system does not fully expose the valid source-side endpoints for this puzzle prototype.

Recommended next checkpoint:

- Fix LIV-029 hint coverage so `Show Hints` highlights all 22 valid required endpoints while still excluding all 8 false/trap hitboxes.
- Keep the fix scoped to hint selection/visualization only.
- Do not move gear, change hitbox geometry, alter route validity, change scoring, or change trap behavior in that checkpoint.

## Visual/Layout Risks To Manually Review

The automated smoke confirms route-family clickability, but a human browser pass should still review:

- Cable readability across the console and PA processor/amp area.
- Label readability around PA processor/amp, PA speakers, press recorder, and moderator wedge.
- Whether cable crossings obscure essential endpoints after several routes are patched.
- Whether the compact runtime layout remains comfortable on normal desktop viewport sizes.

## Commit Boundary Recommendation

Commit this snapshot and smoke checkpoint separately from any runtime fix. The next implementation commit should be only the LIV-029 hint-coverage fix, with snapshot evidence and acceptance coverage updated afterward.
