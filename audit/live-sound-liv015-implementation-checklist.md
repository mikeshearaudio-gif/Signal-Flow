# LIV-015 Implementation Checklist

Source: `Signal_Flow_Live_Sound_LIV015_Level_Builder_Handoff_2026-06-23.docx`

Prepared: 2026-06-23

## Ground Rules

- [ ] Work on `main`; do not create a new branch.
- [ ] Do not stage or commit unrelated dirty files.
- [ ] Keep the first repair narrow: LIV-015 red invalid cable behavior only.
- [ ] Do not disturb locked board behavior.
- [ ] Preserve the native hint grey-ring fix:
  - [ ] Yellow required hints remain visible.
  - [ ] Grey rings on decoy/non-required native jacks stay hidden.
  - [ ] Do not revert hint ordering or required-hint normalizer work.
- [ ] Ignore unrelated browser noise unless Signal Flow source files appear in the stack:
  - `contentscript.js`
  - `ObjectMultiplex`
  - `MaxListenersExceededWarning`
  - `favicon.ico 404`
  - `AudioContext autoplay warning`

## Phase 1: LIV-015 Red Invalid Cable Repair

### Current Known Good State

- [ ] Confirm LIV-006 to-do text is corrected to `Bus 3 Output -> Delay Tower Processor Input`.
- [ ] Confirm LIV-015 to-do text is corrected to `Bus 2 Output -> Sub Processor Input`.
- [ ] Confirm LIV-015 valid route still works:
  - Route key: `foh-liv006-bus-2-output-to-liv006-sub-processor-input`
  - Expected: green/valid route.
  - Expected: checklist target completes for `Bus 2 Output -> Sub Processor Input`.
- [ ] Confirm LIV-006 valid route still works:
  - Expected: `Bus 3 Output -> Delay Tower Processor Input` remains green/valid.

### Cache and Launcher Reliability

- [ ] Inspect `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`.
- [ ] Update the actual `live-sound-native-renderer.js?v=<cache-key>` script tag after renderer code changes.
- [ ] Do not rely only on the page URL bust parameter.
- [ ] Browser-validate that the console/network panel loads the exact updated renderer script URL:
  - [ ] `live-sound-native-renderer.js?v=<new-cache-key>`
- [ ] Record the new cache key in the implementation notes.

### Code Investigation

- [ ] Inspect `src/live-sound-native-renderer.js` before editing.
- [ ] Search for any existing helper such as `shouldCommitLiv015InvalidCable`.
- [ ] Confirm whether that helper is actually called from the invalid-route branch.
- [ ] Find the central invalid-route branch that logs:
  - `Native route blocked: invalid:`
- [ ] Identify the existing invalid-route cable commit path that produces behavior equivalent to:
  - `Native route added: ... valid? false`
  - cable redraw with a red invalid cable.

### Required Behavior Change

- [ ] For LIV-015 only, plausible FOH output -> processor input wrong routes should commit red invalid cables.
- [ ] Do not silently block plausible LIV-015 wrong processor routes before drawing.
- [ ] Preserve normal blocking behavior for unrelated impossible/native-invalid interactions.
- [ ] Preserve valid route behavior:
  - [ ] LIV-015 `Bus 2 Output -> Sub Processor Input` remains valid/green.
  - [ ] LIV-006 `Bus 3 Output -> Delay Tower Processor Input` remains valid/green.
- [ ] Plausible wrong LIV-015 routes should:
  - [ ] leave a red cable visible,
  - [ ] not complete checklist items,
  - [ ] not award valid-route score,
  - [ ] redraw cables.

### LIV-015 Gameplay Tests

- [ ] Load LIV-015 directly:
  - `http://localhost:8000/launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html?sfLiveDevLevel=LIV-015&bust=<new-cache-key>`
- [ ] Confirm loaded renderer:
  - [ ] `live-sound-native-renderer.js?v=<new-cache-key>`
- [ ] Test valid route:
  - [ ] `Bus 2 Output -> Sub Processor Input`
  - [ ] Expected: green cable.
  - [ ] Expected: checklist completion.
- [ ] Test plausible wrong route:
  - [ ] `Bus 3 Output -> Delay Tower Processor Input`
  - [ ] Expected: red cable remains visible.
  - [ ] Expected: no checklist completion.
- [ ] Test plausible wrong route:
  - [ ] `Bus 7 Output -> Delay Tower Processor Input`
  - [ ] Expected: red cable remains visible.
  - [ ] Expected: no checklist completion.
- [ ] Test Show Hints:
  - [ ] Required hints show yellow.
  - [ ] Decoy/non-required grey rings do not return.
- [ ] Retest LIV-006:
  - [ ] `Bus 3 Output -> Delay Tower Processor Input`
  - [ ] Expected: green/valid route.

### Phase 1 Validation Commands

```bash
cd "/Users/mikeshear/Documents/New project/Signal-Flow_GitHub_Import"

node --check src/live-sound-native-renderer.js

git diff --check -- \
  src/live-sound-native-renderer.js \
  launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html

grep -nE 'live-sound-native-renderer\.js\?v=|shouldCommitLiv015InvalidCable|Native route blocked: invalid|addNativeRoute\(fromKey, toKey, false\)|setNativeHintsVisible|normalizeNativeRequiredHintRings' \
  src/live-sound-native-renderer.js \
  launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html | head -180
```

### Phase 1 Completion Notes

- [ ] List changed files.
- [ ] List renderer cache key.
- [ ] Record browser validation results.
- [ ] Commit only after browser validation passes.

## Phase 2: Start Live Sound Level-Building Tool

Only start this after Phase 1 is validated and committed.

### Existing Scaffold

- [ ] Confirm `tools/live-sound-board-tool.js` exists.
- [ ] Confirm `data/live-sound/boards/schema.json` exists.
- [ ] Confirm `data/live-sound/boards/liv029.json` exists.
- [ ] Treat LIV-029 as the first example board manifest.

### Tool Requirements

- [ ] Read a board JSON file from `data/live-sound/boards/<level>.json`.
- [ ] Validate required board fields:
  - [ ] level id,
  - [ ] title,
  - [ ] route list,
  - [ ] gear list,
  - [ ] source/destination node keys,
  - [ ] real/good jacks,
  - [ ] false/trap jacks,
  - [ ] stereo-pair groups if present,
  - [ ] asset paths.
- [ ] Produce a normalized board manifest consumable by the native renderer.
- [ ] Keep changes additive and low-risk.
- [ ] Do not refactor locked board runtime behavior.
- [ ] Do not wire the tool into gameplay unless already safe and obvious.

### Validate Command

- [ ] Add or repair `validate` command.
- [ ] Catch missing route endpoint nodes.
- [ ] Catch one-sided stereo pairs.
- [ ] Catch duplicate node keys.
- [ ] Catch route labels that do not match route keys.
- [ ] Catch asset paths that do not exist.
- [ ] Catch false jacks accidentally listed as valid route endpoints.

### Summary Command

- [ ] Add or repair `summary` command.
- [ ] Print route count.
- [ ] Print valid endpoint count.
- [ ] Print false/trap jack count.
- [ ] Print gear count.
- [ ] Print required assets.
- [ ] Print stereo groups.

### Bake Command Stub

- [ ] Add `bake` command stub.
- [ ] Write renderer-ready JSON output.
- [ ] Do not integrate baked output into gameplay yet.

### Tool Documentation

- [ ] Add clear terminal usage examples in comments or a README-style file under `tools/` or `data/live-sound/boards/`.

### Phase 2 Validation Commands

```bash
cd "/Users/mikeshear/Documents/New project/Signal-Flow_GitHub_Import"

node --check tools/live-sound-board-tool.js
node tools/live-sound-board-tool.js validate data/live-sound/boards/liv029.json
node tools/live-sound-board-tool.js summary data/live-sound/boards/liv029.json

git diff --check -- \
  tools/live-sound-board-tool.js \
  data/live-sound/boards/schema.json \
  data/live-sound/boards/liv029.json
```

### Phase 2 Completion Notes

- [ ] List changed files.
- [ ] List commands run.
- [ ] Document what remains before gameplay integration.
- [ ] Do not commit automatically unless explicitly instructed.

## Suggested Work Order

- [ ] Repair LIV-015 red invalid cable behavior first.
- [ ] Verify renderer cache key in browser console before gameplay testing.
- [ ] Test LIV-015 valid and plausible wrong routes.
- [ ] Retest Show Hints for yellow-only hints and no grey decoy rings.
- [ ] Retest LIV-006 Bus 3 valid route.
- [ ] Commit the repair after browser validation passes.
- [ ] Start the level-building tool as a separate task and separate commit.
