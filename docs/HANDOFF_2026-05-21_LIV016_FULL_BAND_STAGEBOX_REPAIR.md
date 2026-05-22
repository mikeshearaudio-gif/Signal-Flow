# Signal Flow LIV-016 Full-Band Stagebox Repair Handoff

Date: 2026-05-21

## Status

`LIV-016` has been rebuilt as a PNG-backed full-band stagebox board.

The board is not the old delay-tower layout anymore. It now uses the full-band stagebox image and transparent semantic hitboxes over the image.

Current test URL:

```text
http://127.0.0.1:8000/launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html
```

Load `LIV-016` from the wrapper.

## Files Changed

- `src/live-sound-native-renderer.js`
- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`

New/staged assets expected to remain with this work:

- `assets/live-sound/png/liv016-full-band-layout.png`
- `assets/live-sound/png/liv016hitboxes0.png`
- `assets/live-sound/png/liv160.png`
- `assets/live-sound/svg/hardware/live mic.svg`
- `assets/live-sound/svg/hardware/bass0.svg`
- `assets/live-sound/svg/hardware/guitar1.svg`
- `assets/live-sound/svg/hardware/Guitar 2.svg`
- `assets/live-sound/svg/hardware/keyboard0.svg`

`assets/live-sound/png/liv016hitboxes0.png` is reference only. It must not be rendered in the live board.

## Locked Guardrails

- Work directly on `main`; no branch was created.
- Do not commit until the user approves after visual QA.
- Do not change `LIV-015`; it is locked and must keep using the processing-family renderer.
- Do not return `LIV-016` to the failed multi-SVG source layout.
- Do not render blue source boxes over the PNG.
- Do not draw an extra grey normalization cable; the trunk cable is already baked into the PNG.
- Do not modify Build-a-Room v6r277.
- Do not modify `diagnosis-ui.js?v=6r263`.
- Do not modify IR runner layout/scoring.

## Current LIV-016 Behavior

Title/checklist:

```text
16-channel Stage Box to Front-of-House
```

Required routes:

1. Lead Vocal Microphone -> Stage Box Input 1
2. Bass DI -> Stage Box Input 2
3. Guitar 1 Left -> Stage Box Input 3
4. Guitar 1 Right -> Stage Box Input 4
5. Guitar 2 Left -> Stage Box Input 5
6. Guitar 2 Right -> Stage Box Input 6
7. Keys Left DI -> Stage Box Input 7
8. Keys Right DI -> Stage Box Input 8
9. Kick -> Stage Box Input 9
10. Snare -> Stage Box Input 10
11. Hi-hat -> Stage Box Input 11
12. Rack Tom 1 -> Stage Box Input 12
13. Rack Tom 2 -> Stage Box Input 13
14. Floor Tom -> Stage Box Input 14
15. OH Left -> Stage Box Input 15
16. OH Right -> Stage Box Input 16
17. Main Left Output -> Crossover Left In
18. Main Right Output -> Crossover Right In

Stereo-pair checklist completion is enforced for:

- Guitar 1 L/R
- Guitar 2 L/R
- Keys L/R
- OH L/R
- Main L/R

The visible checklist should not mark a stereo half complete until the paired route is also complete.

## Hitbox Map Notes

The instrument/source hitboxes were remapped from the brown regions in:

```text
assets/live-sound/png/liv016hitboxes0.png
```

The latest user correction fixed the endpoint map:

- Instrument/source hitboxes are considered correct.
- `Stage Box Input 1-16` must be on the upper stagebox input panel, not on the FOH console.
- `FOH Main L/R` must stay on the blue FOH main output jacks.
- `Crossover Left/Right In` must be on the left input pair of the crossover, not on the colored crossover output rows.

Current equipment hint labels include:

- Stage Box Inputs
- Stage Box 1-8
- Stage Box 9-16
- FOH Console
- FOH Main L/R
- Crossover
- Crossover Inputs
- Crossover Outputs

Renderer cache in the active launch file:

```html
<script src="../src/live-sound-native-renderer.js?v=6r276"></script>
```

## Validation Completed

Syntax:

```text
node --check src/live-sound-native-renderer.js
```

Browser QA through wrapper on port `8000`:

- `LIV-016` loads the PNG-backed board.
- 16 source hotspots exist.
- 20 jack endpoints exist.
- Show Hints shows source, jack, and equipment labels.
- `liv016hitboxes0.png` is not rendered.
- Tested routes:
  - Lead Vocal Microphone -> Stage Box Input 1
  - Bass DI -> Stage Box Input 2
  - Keys Left DI -> Stage Box Input 7
  - Keys Right DI -> Stage Box Input 8
  - Kick -> Stage Box Input 9
  - Main Left Output -> Crossover Left In
  - Main Right Output -> Crossover Right In
- Stereo-pair gating verified:
  - Keys L alone does not mark complete; Keys R completes both.
  - Main L alone does not mark complete; Main R completes both.
- `LIV-015` smoke check passed earlier in this repair:
  - no `LIV-016` layer mounted
  - processing-family renderer still used

## Current Git State

At handoff, no commit has been made.

Expected modified files:

- `src/live-sound-native-renderer.js`
- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`

Expected staged/new asset files:

- `assets/live-sound/png/liv016-full-band-layout.png`
- `assets/live-sound/png/liv016hitboxes0.png`
- `assets/live-sound/png/liv160.png`
- `assets/live-sound/svg/hardware/Guitar 2.svg`
- `assets/live-sound/svg/hardware/bass0.svg`
- `assets/live-sound/svg/hardware/guitar1.svg`
- `assets/live-sound/svg/hardware/keyboard0.svg`
- `assets/live-sound/svg/hardware/live mic.svg`

Temporary audit screenshots generated during QA were removed.

## Manual Smoke Test

1. Open:
   `http://127.0.0.1:8000/launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html?fresh=liv016-final-check`
2. Select `Live Sound` / `LIV-016`.
3. Click `Load Board`.
4. Click `Start Level` if the intro overlay appears.
5. Click `Show Hints`.
6. Confirm:
   - instrument rings sit on the visible instruments/gear
   - stagebox input rings sit on the upper stagebox input panel
   - FOH main rings sit on the blue FOH main output jacks
   - crossover input rings sit on the left input pair
   - colored crossover output rows are labeled as outputs and are not the required input target
7. Patch the sample routes listed in the validation section.

## Do Not Regress

The most recent correction was specifically about endpoint identity:

- Do not move stagebox inputs back onto the FOH console.
- Do not move crossover inputs back onto crossover low/output rows.
- Do not remove equipment labels without replacing them with equally clear labels.
