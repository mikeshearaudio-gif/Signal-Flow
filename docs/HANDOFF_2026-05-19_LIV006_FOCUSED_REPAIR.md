# Signal Flow LIV-006 Focused Repair Handoff

Date: 2026-05-19

## Scope

This handoff covers the focused `LIV-006` repair pass only. The goal was to fix the visual rack layout and player-facing labels without changing route logic, score logic, stereo rules, completion navigation, manifest structure, or other board behavior.

## Active Test URL

Use the active full build:

```text
http://127.0.0.1:8000/launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html?fresh=liv006-final#/level/LIV-006
```

The active launch currently loads:

```html
<script src="../src/live-sound-native-renderer.js?v=6r259"></script>
```

## Files Changed For LIV-006

- `src/live-sound-native-renderer.js`
- `assets/live-sound/svg/hardware/power-amp-liv006-system-delay-processor.svg`
- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`

## Renderer Changes

In `src/live-sound-native-renderer.js`:

- `LIV-006` lower rack asset is now cache-busted as:
  ```js
  /assets/live-sound/svg/hardware/power-amp-liv006-system-delay-processor.svg?v=6r259
  ```
- `LIV-006` processor display label is `CROSSOVER`.
- `LIV-006` checklist text now uses:
  - `Main L Output -> Crossover L In`
  - `Main R Output -> Crossover R In`
- `LIV-006` native jack labels now use:
  - `Crossover L In`
  - `Crossover R In`
- Underlying route keys were intentionally kept unchanged:
  - `liv006-system-processor-l-input`
  - `liv006-system-processor-r-input`

## Layout Changes

The lower processor rack is now positioned by the native renderer geometry, not by an external DOM mover.

Current `LIV-006` layout behavior:

- FOH top rack stays in the upper position.
- Lower rack uses the same panel-relative jack coordinates as the SVG, preserving alignment.
- Lower rack sits lower than the original overlapping placement.
- `LIV-006` is no longer included in the nested native scroll-host path.
- `LIV-006` native board height is compact again, capped at `640px`.
- Last measured browser QA values:
  - FOH/rack gap: `79px`
  - `scrollHost: false`
  - `scrollDelta: 0`
  - red debug outlines: `0`

## Removed / Replaced Patches

The active launch no longer loads:

```html
../patch/sf-liv006-rack-layout-v6r254.js
```

That patch moved the lower rack with external DOM mutation and left a red debug outline. It should remain unused for this board. Earlier experimental `v6r255` and `v6r256` cleanup patches should also stay ignored, because they caused jack misalignment.

The old internal `sfLiv006MoveProcessorRackDownV6r252` DOM-style mover was removed from the native renderer.

## SVG Asset Changes

In `assets/live-sound/svg/hardware/power-amp-liv006-system-delay-processor.svg`:

- `SYSTEM PROCESSOR` changed to `CROSSOVER`.
- `OTHER ZONE INPUTS` / later `AUX ZONE INPUTS` changed to `AUX INPUTS`.
- `DELAY TOWER PROCESSOR` stayed unchanged.
- Jack drawing coordinates stayed unchanged:
  - Crossover L: `cx=94`, `cy=146`
  - Crossover R: `cx=214`, `cy=146`
  - Delay input: `cx=470`, `cy=146`
  - Sub In false route: `cx=704`, `cy=146`
  - Fill In false route: `cx=818`, `cy=146`

## Launch Changes

In `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`:

- Removed the active `sf-liv006-rack-layout-v6r254.js` include.
- Bumped native renderer cache to `v=6r259`.
- The embedded `LIV-006` required text was updated for visible/player-facing terminology:
  - `System Processor L In` -> `Crossover L In`
  - `System Processor R In` -> `Crossover R In`

Note: the launch file also contains broader stabilization edits from earlier passes, including local repo-relative script paths and embedded-media removal. Those were not part of the final label/layout repair itself.

## Behavior Intentionally Preserved

The valid `LIV-006` routes remain:

- `Matrix 3 Output -> Delay Tower Processor Input`
- `Main L Output -> Crossover L In`
- `Main R Output -> Crossover R In`

The route keys and validation endpoints are unchanged:

- `foh-liv006-matrix-3-output -> liv006-delay-tower-processor-input`
- `foh-liv006-main-left-output -> liv006-system-processor-l-input`
- `foh-liv006-main-right-output -> liv006-system-processor-r-input`

Wrong-route rejection behavior was not changed.

## Verification Completed

Static:

```bash
node --check src/live-sound-native-renderer.js
```

Browser QA against the active `LIV-006` URL confirmed:

- lower rack no longer overlaps the FOH rack
- no nested scroll host for `LIV-006`
- no excessive internal scroll space
- no red debug outline
- no duplicate small `CROSSOVER` label from the renderer
- no top FOH `AUX ZONE INPUTS` overlay
- visible lower rack labels read:
  - `CROSSOVER`
  - `DELAY TOWER PROCESSOR`
  - `AUX INPUTS`
- native jack aria labels read:
  - `Crossover L In`
  - `Crossover R In`
- correct route sequence completed the level
- wrong route did not mark checklist items complete

Known browser-console noise during QA:

- Two unrelated `404 File not found` resource messages appeared during local browser checks.
- They did not block `LIV-006` native render, route completion, or label verification.

## Next-Pass Guidance

If `LIV-006` needs more visual tuning, adjust only these renderer-level values first:

- `buildLevelGeometry(surface)` special case for `LEVEL_ID === "LIV-006"`
- lower rack `amp` panel `y`
- lower rack `amp` panel `width`

Do not reintroduce DOM mover patches or generic text-search mutation patches for this board. If visible text is wrong, prefer editing the SVG asset or the `LIV-006` native node labels directly.
