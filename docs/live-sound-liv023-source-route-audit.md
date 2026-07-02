# LIV-023 Source Route Audit

## Purpose

This audit determines whether LIV-023 can move from `needs-review` to `apply-ready` in `data/puzzle-metadata/live-sound.json` before any source board manifest is created.

Scope is read-only for gameplay and renderer behavior. This document does not create a board manifest, alter routes, add traps, change hitboxes, or change LIV-023 playability.

## Source Files Inspected

- `src/live-sound-native-renderer.js`
- `src/live-sound-adapter.js`
- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `docs/live-sound-puzzle-game-roadmap.md`
- `data/puzzle-metadata/live-sound.json`
- `audit/liv023-good-hitboxes-final.json`
- `audit/liv023-false-hitboxes-final.json`
- `audit/liv023-gear-layout-final.json`
- `audit/liv023-label-layout-final.json`
- `audit/liv023-gear-layer-layout-final.json`
- `audit/live-sound-liv020-liv023-detailed-manifest.md`
- `audit/live-sound-liv020-liv023-route-manifest.csv`
- `audit/live-sound-liv020-liv023-asset-briefs.md`
- `audit/live-sound-liv020-liv023-acceptance-tests.md`
- LIV-023 dev/layout scripts under `src/`
- `tools/live_sound_patch_acceptance.test.mjs`

## Discovered Title And Brief

The active native renderer title is:

```text
Monitor Console: Vocal Insert, Stereo IEM, and 3-Way PA
```

The launch payload agrees:

```text
Patch vocal input, keyboard stereo DI, insert compression, stereo IEM, and crossover-fed amplifier inputs.
```

Older audit and planning files describe earlier LIV-023 concepts, including `Stereo IEM send 1` and `Drum Fill Plus Sidefill Plus Vocal Wedge`. Those are historical plans and do not match the current active board. Current renderer and launch evidence are the source of truth for this audit.

## Discovered Required Routes

Renderer and launch evidence agree on fifteen required routes:

1. Lead Vocal Mic -> Stage Box Input 1
2. Keyboard DI L -> Stage Box Input 2
3. Keyboard DI R -> Stage Box Input 3
4. Channel 1 Insert Send -> Compressor Input
5. Compressor Output -> Channel 1 Insert Return
6. Aux 1 Left Output -> IEM A Left Input
7. Aux 1 Right Output -> IEM A Right Input
8. Main Left Output -> Crossover Left Input
9. Main Right Output -> Crossover Right Input
10. Crossover High Left Output -> High Amp Left Input
11. Crossover High Right Output -> High Amp Right Input
12. Crossover Mid Left Output -> Mid Amp Left Input
13. Crossover Mid Right Output -> Mid Amp Right Input
14. Crossover Low Left Output -> Low Amp Left Input
15. Crossover Low Right Output -> Low Amp Right Input

Renderer route IDs:

- `liv023-lead-vocal-mic-to-stagebox-input-1`
- `liv023-keyboard-di-l-to-stagebox-input-2`
- `liv023-keyboard-di-r-to-stagebox-input-3`
- `liv023-ch1-insert-send-to-compressor-input`
- `liv023-compressor-output-to-ch1-insert-return`
- `liv023-aux1-l-to-iem-input-l`
- `liv023-aux1-r-to-iem-input-r`
- `liv023-main-l-to-crossover-l-input`
- `liv023-main-r-to-crossover-r-input`
- `liv023-crossover-high-l-to-high-amp-l`
- `liv023-crossover-high-r-to-high-amp-r`
- `liv023-crossover-mid-l-to-mid-amp-l`
- `liv023-crossover-mid-r-to-mid-amp-r`
- `liv023-crossover-low-l-to-low-amp-l`
- `liv023-crossover-low-r-to-low-amp-r`

## Discovered Gear And Assets

Renderer evidence:

- `processorLabel`: `MONITOR CONSOLE: VOCAL INSERT, STEREO IEM, AND 3-WAY PA`
- `panelKinds`: `monitor-console`, `stagebox`, `compressor`, `iem`, `crossover`, `high-amp`, `mid-amp`, `low-amp`
- Source order: empty; all endpoints are generated jack keys on the rendered board.

Gear/layout evidence:

- Monitor Console: `assets/live-sound/svg/hardware/Monitor_Console_LIV023.svg`
- Lead Vocal Mic: `assets/live-sound/svg/hardware/mic nbg.svg`
- Keyboard: `assets/live-sound/svg/hardware/keys.svg`
- 8 Input Stage Box: `assets/live-sound/svg/hardware/stagebox-snake-head.svg`
- Vocal Compressor: `assets/live-sound/svg/hardware/power-amp-liv007-main-system.svg`
- IEM Transmitter A: `assets/live-sound/svg/hardware/iem-transmitter-liv003-game-style.svg`
- Stereo 3-Way Crossover: `assets/live-sound/svg/hardware/crossover-liv010-3way.svg`
- High Amp: `assets/live-sound/svg/hardware/power-amp-liv010-high.svg`
- Mid Amp: `assets/live-sound/svg/hardware/power-amp-liv010-mid.svg`
- Low Amp: `assets/live-sound/svg/hardware/power-amp-liv010-low.svg`
- Eight normalizing cable overlays: `assets/live-sound/svg/cables/single-one-end-raised.svg`
- Compressor label overlay: `assets/live-sound/svg/hardware/Compressor label.svg`

The exported final gear layout contains 19 placed items.

## Discovered Endpoint IDs

Required source/output endpoints:

- `liv023-lead-vocal-mic`
- `liv023-keyboard-di-l`
- `liv023-keyboard-di-r`
- `liv023-ch1-insert-send`
- `liv023-compressor-output`
- `liv023-aux1-l`
- `liv023-aux1-r`
- `liv023-main-l`
- `liv023-main-r`
- `liv023-crossover-high-l`
- `liv023-crossover-high-r`
- `liv023-crossover-mid-l`
- `liv023-crossover-mid-r`
- `liv023-crossover-low-l`
- `liv023-crossover-low-r`

Required input/destination endpoints:

- `liv023-stagebox-input-1`
- `liv023-stagebox-input-2`
- `liv023-stagebox-input-3`
- `liv023-compressor-input`
- `liv023-ch1-insert-return`
- `liv023-iem-input-l`
- `liv023-iem-input-r`
- `liv023-crossover-l-input`
- `liv023-crossover-r-input`
- `liv023-high-amp-l`
- `liv023-high-amp-r`
- `liv023-mid-amp-l`
- `liv023-mid-amp-r`
- `liv023-low-amp-l`
- `liv023-low-amp-r`

The active renderer creates 30 good hitboxes for LIV-023, matching `audit/liv023-good-hitboxes-final.json`.

## False And Trap Behavior

LIV-023 has substantial false/trap behavior:

- The active renderer creates 101 false hitboxes with `liv023-false-*` keys.
- False hitbox families include unused stagebox mic/line jacks, a stagebox link output, console mic/line inputs, insert sends, insert returns, aux outputs, bus outputs, and other console bus/alternate points.
- Hints explicitly exclude `liv023-false-*`, `data-sf-native-false-jack="1"`, and `data-sf-native-hintable="0"` nodes.
- `sfLiv020RouteDecision()` has a LIV-023 branch that allows any two distinct `liv023-*` nodes to draw an invalid route when the base route is not valid. That lets wrong attempts render as invalid without counting toward completion.

These false/trap behaviors are renderer-specific today. They are not yet represented as canonical top-level puzzle metadata.

## Stereo Groups

Six stereo groups are present:

- `liv023-keyboard-di-to-stagebox`
- `liv023-aux1-to-iem-a`
- `liv023-main-to-crossover`
- `liv023-crossover-high-to-amp`
- `liv023-crossover-mid-to-amp`
- `liv023-crossover-low-to-amp`

The insert send/return pair is a directional two-route loop, but it is not encoded as a stereo group.

## Locked Behavior And Custom Tooling

LIV-023 has significant custom behavior and tooling:

- The board uses a custom scroll host class: `sf-live-native-liv023-scroll-host`.
- The native renderer creates a `sf-liv023-native-legacy-mask` to hide old patchbay/cable-layer artifacts.
- The renderer owns a custom rack-zone visual layout.
- Final layout exports exist for gear, labels, good hitboxes, false hitboxes, and gear-layer positions.
- Dev tooling includes `src/sf-liv023-good-hitbox-mapper-dev.js`, `src/sf-liv023-gear-mover-dev.js`, `src/sf-liv023-label-mover-dev.js`, `src/sf-liv023-gear-layer-mover-dev.js`, and `src/sf-liv023-static-gear-preview-dev.js`.
- The functionality audit marks LIV-023 as implemented but needing smoke QA for false/trap jacks, labels, scroll/cues, red/green cables, and checklist state.

## Route Intent

Route intent is clear:

- Lead vocal and keyboard sources land on the stagebox in the expected input order.
- The vocal compressor is inserted through Channel 1 insert send and return.
- Aux 1 L/R feeds IEM Transmitter A in stereo.
- Main L/R feeds the crossover in stereo.
- Crossover high, mid, and low outputs feed the matching amplifier inputs in left/right order.

This is an advanced capstone-style board that combines source-to-input routing, insert-direction reasoning, stereo IEM routing, and a multi-way PA processor/amplifier chain.

## Batch Metadata Match

The existing LIV-023 entry in `data/puzzle-metadata/live-sound.json` mostly matched the active board:

- It correctly used `capstone-system`.
- It correctly emphasized vocal insert, stereo IEM, multi-way PA, stereo pairs, processor chain, amplifier, speaker-level, and multi-route reasoning.
- It did not explicitly mention the vocal and keyboard source-to-stagebox routes.

The batch metadata was corrected to mention vocal and keyboard stage inputs, add `source-to-input` and `stagebox`, and make the objective/completion explanation match the current 15-route board.

## Manifest Safety

It is technically possible to create a complete source board manifest later because the active renderer exposes route IDs, endpoint IDs, good hitboxes, false hitboxes, gear placement, labels, assets, and stereo groups.

However, LIV-023 should not be auto-promoted yet. A future manifest pass must explicitly preserve the custom scroll host, legacy masking, gear layout, labels, 30 good hitboxes, 101 false hitboxes, broad invalid-route behavior, and checklist/stereo-pair semantics before creating source board JSON.

## Recommendation

Recommendation: `keep-needs-review`

Rationale: Source-route evidence is clear enough to correct the batch metadata, but LIV-023 is a custom advanced capstone board with large false-hitbox coverage and broad invalid-route behavior. Keep it in review until the source-manifest strategy can preserve the current renderer behavior and decide how its false hitboxes map into canonical puzzle metadata.
