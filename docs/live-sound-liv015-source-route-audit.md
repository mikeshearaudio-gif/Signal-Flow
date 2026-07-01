# LIV-015 Source Route Audit

## Purpose

This audit determines whether LIV-015 can move from `needs-review` to `apply-ready` in `data/puzzle-metadata/live-sound.json` before any source board manifest is created.

Scope is read-only for gameplay and renderer behavior. This document does not create a board manifest, alter routes, add traps, change hitboxes, or change LIV-015 playability.

## Source Files Inspected

- `src/live-sound-native-renderer.js`
- `src/live-sound-adapter.js`
- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `docs/HANDOFF_2026-05-21_LIV016_FULL_BAND_STAGEBOX_REPAIR.md`
- `docs/SIGNAL_FLOW_MEMORY.md`
- `docs/live-sound-puzzle-game-roadmap.md`
- `data/puzzle-metadata/live-sound.json`
- `tools/live_sound_patch_acceptance.test.mjs`

## Discovered Title And Brief

The launch data for LIV-015 identifies the level as:

```text
Sub matrix feed
```

with the brief:

```text
Patch sub matrix output to the sub processor.
```

The active native renderer level spec currently sets the title to:

```text
Front Fill Zone Feed
```

but the renderer routes, processor label, launch record, and roadmap intent all point to a sub/matrix zone-feed exercise. The renderer title appears stale or copied from the front-fill family. LIV-025 is the separate front-fill board and owns the dedicated front-fill DSP/amplifier route pattern.

## Discovered Required Routes

Renderer and launch evidence agree on four required routes:

1. Bus 2 Output -> Sub Processor Input
2. Main L Output -> Crossover L In / System Processor L In
3. Main R Output -> Crossover R In / System Processor R In
4. Lead Vocal Mic -> Stage Box Input 1

Renderer route IDs:

- `foh-liv006-bus-2-output-to-liv006-sub-processor-input`
- `foh-liv006-main-left-output-to-liv006-system-processor-l-input`
- `foh-liv006-main-right-output-to-liv006-system-processor-r-input`
- `lead-vocal-mic-to-stagebox-input-1`

The launch data also lists `Bus 2 Output -> Front Fill Processor Input` as forbidden. The renderer exposes `liv006-front-fill-processor-input` as a generated ghost endpoint but does not make it a valid route.

## Discovered Gear And Assets

Renderer evidence:

- `familyLayout`: `processing-stagebox`
- `processorLabel`: `CROSSOVER / SUB PROCESSING`
- `panelKinds`: `stagebox`, `foh`, `amp`
- Source order: `lead-vocal-mic`

Asset overrides:

- Stagebox: `assets/live-sound/svg/hardware/stagebox-snake-head-16x2-aes.svg`
- FOH console: `assets/live-sound/svg/hardware/foh-console-liv006-matrix-main-outs.svg`
- Processor rack: `assets/live-sound/svg/hardware/power-amp-liv006-system-delay-processor.svg?v=6r259`
- `paamp` override is present, but LIV-015 only renders the `stagebox`, `foh`, and `amp` panels in the processing-family layout.

Existing acceptance coverage confirms LIV-015 keeps the processing-family spread layout for the stagebox, FOH console, and processor rack.

## Discovered Endpoint IDs

Required endpoint IDs:

- `lead-vocal-mic`
- `stagebox-input-1`
- `foh-liv006-bus-2-output`
- `liv006-sub-processor-input`
- `foh-liv006-main-left-output`
- `liv006-system-processor-l-input`
- `foh-liv006-main-right-output`
- `liv006-system-processor-r-input`

Additional generated board endpoints include stagebox inputs 1-16, FOH aux/bus outputs, main L/R outputs, delay tower processor input, sub processor input, system processor L/R inputs, and front-fill processor input. Only the required endpoint pairs above count toward completion.

The active endpoints are placed through the generic processing-family panel-relative geometry. `liv006-sub-processor-input` and `liv006-front-fill-processor-input` are marked as ghost jack definitions, but `liv006-sub-processor-input` is active because it participates in a valid route.

## Stereo Groups

One stereo group is present:

- `liv015-main-to-crossover`
  - Left route: `foh-liv006-main-left-output-to-liv006-system-processor-l-input`
  - Right route: `foh-liv006-main-right-output-to-liv006-system-processor-r-input`

The sub processor route and lead vocal stagebox route are mono routes.

## Route Intent

Route intent is clear:

- Bus 2 carries a dedicated sub/zone feed to the sub processor.
- Main L/R remains separated from the zone feed and feeds the main system processor path in stereo.
- Lead Vocal Mic lands on Stage Box Input 1.

This fits a signal-type puzzle about distinguishing a dedicated bus/matrix-style zone feed from the main PA feed.

## Batch Metadata Match

The current LIV-015 entry in `data/puzzle-metadata/live-sound.json` matches the source evidence well enough to apply later:

- `taskMode`: `signal-type`
- Scenario references a dedicated low-frequency, front-fill, or local zone feed while preserving the main PA path.
- Objective references the appropriate bus or matrix-style output and separated main L/R processor feed.
- Concept tags include `matrix-feed`, `zone-feed`, `main-pa`, and `processor-chain`.
- Constraint states that the zone processor should receive the dedicated bus/matrix feed rather than a duplicated main PA output.

The metadata intentionally uses broad zone-feed language because the source evidence contains stale naming: launch and route data identify a sub matrix feed, while the renderer title says front fill. The actual route data is unambiguous.

## Manifest Safety

It is safe to create a complete source board manifest later because the route list, endpoint IDs, panel kinds, asset overrides, generated jack keys, and stereo grouping behavior are discoverable and consistent.

This audit does not create that manifest.

## Recommendation

Recommendation: `promote-to-apply-ready`

Rationale: The route evidence is clear despite stale title text in the renderer. LIV-015 should be treated as a sub/matrix zone-feed signal-type board with preserved main L/R routing and one lead vocal stagebox input. The existing batch metadata already frames that curriculum intent conservatively.
