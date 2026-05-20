# Signal Flow Diagnosis and Asset Recovery Handoff

Date: 2026-05-20

## Scope

This handoff covers the work completed today after the Build-a-Room `v6r277` lock.

Primary goals:

- Replace the diagnosis board behavior with a single-owner deterministic renderer.
- Make diagnosis rendering work across all environments, not only Live Sound.
- Preserve the locked Build-a-Room `v6r277` renderer and native Live patch boards.
- Restore missing gear-map visuals caused by transparent placeholder image assets.

## Locked / Preserved Areas

Do not modify these as part of follow-up diagnosis or asset work unless a new bug specifically requires it:

- Build-a-Room shared renderer locked at:
  - `patch/sf-build-room-renderer.js?v=6r277`
  - `patch/sf-build-room-renderer.css?v=6r277`
- Native Live patch boards.
- IR routing.
- Score, route, stereo, manifest, or economy logic.
- Diagnosis layout/CSS unless a visual-only diagnosis bug is confirmed.

## Files Changed

- `patch/diagnosis-ui.js`
- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`

No assets were deleted or moved.

## Diagnosis Renderer State

Active diagnosis renderer:

```text
patch/diagnosis-ui.js?v=6r263
```

The launch file now loads:

```html
<script src="../patch/diagnosis-ui.js?v=6r263"></script>
```

Diagnosis CSS and the compatibility skin remain on the previous stable cache refs:

```text
patch/diagnosis-ui.css?v=6r261
patch/sf-diagnosis-svg-skin.js?v=6r261
patch/sf-diagnosis-svg-skin.css?v=6r261
```

## Diagnosis Changes

`patch/diagnosis-ui.js` is now `VERSION = '6r263'`.

Important behavior:

- Diagnosis UI is owned by `diagnosis-ui.js`.
- The renderer creates one generic panel:

```html
<section data-sfdiag-generic-panel="true">
```

- Legacy `.diagnose-panel` UI is hidden/removed for diagnosis levels.
- The renderer does not mount inside the legacy diagnosis panel.
- Choices render directly from `level.training.patches`.
- Correct answers are detected from `ok:false`.
- LIV-031 now resolves to five diagnosis choices in data, including the single correct `ok:false` choice.

## Cross-Environment Diagnosis Fix

The diagnosis level resolver is now environment-agnostic.

It collects candidates from:

- visible active level selectors
- central ledger/current state where present
- URL hash
- current `level()` function result
- visible game title fallback
- full `DATA.levels` lookup

Diagnosis detection is based on:

```js
level.training && level.training.type === 'diagnose'
```

It is not prefix-based and does not assume Live Sound.

Supported prefixes include:

```text
LIV
REC
BRD
PST
GAM
```

## Transition / Retry Fix

The renderer now rejects hidden or stale hosts before mounting.

Important details:

- `mainTrainingSurface()` ignores hidden/stale board surfaces.
- Build-a-Room mounts are excluded as diagnosis hosts.
- If the active surface is not ready, diagnosis retries once shortly after the level transition.
- Retry no longer reverts diagnosis boards to the old style when the active surface is available.

This was added because environment changes and Build-a-Room transitions could leave diagnosis mounting into a hidden or stale surface.

## Event Hooks

Diagnosis remounts are scheduled from:

- selector changes
- `hashchange`
- `popstate`
- wrapped render/load functions:
  - `renderTrainingOnlyLevel`
  - `renderLevel`
  - `render`
  - `renderRoute`
  - `navigateTo`
  - `loadLevel`
- ledger dispatch events containing level/current-level data

The intent is explicit level-change coverage without MutationObserver loops or constant polling.

## Diagnosis Verified

Direct browser probes passed for:

```text
LIV-008
REC-008
BRD-008
PST-008
GAM-008
LIV-017
LIV-031
```

Transition testing included:

```text
GAM-008 -> GAM-027 -> GAM-008
PST-004 -> PST-008
GAM-041 -> GAM-050 -> GAM-008
LIV-017
```

Expected probe result:

- exactly one visible diagnosis panel
- `data-sfdiag-generic-panel="true"`
- no visible legacy diagnosis panel
- answer buttons generated from `level.training.patches`
- current level id matches the active board

## Asset Recovery

Bug observed:

- Several non-diagnosis gear-map visuals showed as blank white/empty blocks.
- Example: `REC-009 - Delay send and return`.

Root cause:

- `GEAR_ICON_ASSETS` in the launch file had been set to transparent 1x1 GIF placeholders.
- The browser was not showing 404s because the placeholder images loaded successfully.
- The visible blank cards were valid `<img>` elements with `naturalWidth = 1` and `naturalHeight = 1`.

Fix:

- Restored `GEAR_ICON_ASSETS` to real bundled asset paths.
- Used existing assets under:
  - `assets/board-art/`
  - `assets/build-room/svg/gear/`

Key restored mappings include:

```text
microphone -> assets/board-art/sheet1_icon_microphone.png
compressor -> assets/board-art/sheet1_icon_compressor.png
equalizer -> assets/board-art/sheet1_icon_equalizer.png
delay_reverb -> assets/board-art/sheet1_icon_delay_reverb.png
mixer_console -> assets/board-art/sheet1_icon_mixer_console.png
audio_interface -> assets/board-art/sheet1_icon_audio_interface.png
monitor_speakers -> assets/board-art/sheet1_icon_monitor_speakers.png
headphone_amp -> assets/board-art/sheet1_icon_headphone_amp.png
recorder -> assets/board-art/sheet1_icon_recorder.png
playback_tape_machine -> assets/board-art/sheet1_icon_playback_tape_machine.png
```

## Asset Recovery Verified

Browser probe on `REC-009` showed:

- top gear-map images now load real assets
- no visible 1x1 placeholder GIFs
- no broken visible gear images

Verified `REC-009` visible card assets:

```text
assets/board-art/sheet1_icon_microphone.png
assets/board-art/sheet1_icon_compressor.png
assets/board-art/sheet1_icon_monitor_speakers.png
```

Spot checks showed no visible placeholder/broken images on:

```text
BRD-009
PST-009
GAM-009
LIV-009
GAM-008
```

## Syntax Check

Passed:

```text
node --check patch/diagnosis-ui.js
```

## Current Test URLs

Diagnosis:

```text
http://127.0.0.1:8000/launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html?fresh=diag-v6r263#/level/LIV-031
http://127.0.0.1:8000/launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html?fresh=diag-v6r263#/level/GAM-008
```

Asset recovery:

```text
http://127.0.0.1:8000/launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html?fresh=asset-map-v1#/level/REC-009
```

Build-a-Room locked regression reference:

```text
http://127.0.0.1:8000/launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html?fresh=buildroom-v6r277-final#/level/LIV-004
```

## Known Non-Blocking Console Items

These are still expected and were not part of today’s fix:

- `AudioContext was not allowed to start`
  - browser autoplay/user gesture warning
- `GET /favicon.ico 404`
  - missing favicon only
- `environmentId: 'live-sound'` appearing in ledger logs during cross-environment navigation
  - existing ledger naming behavior; diagnosis rendering now resolves by actual level id instead of relying on this environment id

## Do Not Regress

Do not reintroduce:

- diagnosis MutationObserver loops
- 250ms polling bridges
- legacy-panel skin attachment as the primary diagnosis UI
- prefix-only diagnosis detection
- Live Sound-only selector logic
- diagnosis mounts inside `.diagnose-panel`
- broad DOM movers or geometry-based shell hiding
- transparent 1x1 GIF placeholders in `GEAR_ICON_ASSETS`

Do preserve:

- one visible generic diagnosis panel per diagnosis level
- choices generated from `level.training.patches`
- `ok:false` as the correct-answer source
- Build-a-Room `v6r277`
- native Live patch boards and IR routing
- existing score/economy behavior

## Suggested Next QA Sweep

Run a browser sweep with a hard reload and fresh query string:

```text
LIV-008
LIV-017
LIV-031
REC-008
BRD-008
PST-008
GAM-008
REC-009
BRD-009
PST-009
GAM-009
LIV-009
```

For diagnosis levels, verify:

- one generic diagnosis panel
- no legacy diagnosis panel visible
- correct level id
- correct choice count
- exactly one `ok:false` button where the level data expects one

For gear-map levels, verify:

- no 1x1 placeholder image sources
- no broken visible gear images
- top gear cards show real art

