# LIV-016 Source Route Audit

## Purpose

This audit determines whether LIV-016 can move from `needs-review` to `apply-ready` in `data/puzzle-metadata/live-sound.json` before any source board manifest is created.

Scope is read-only for gameplay and renderer behavior. This document does not create a board manifest, alter routes, add traps, change hitboxes, or change LIV-016 playability.

## Source Files Inspected

- `src/live-sound-native-renderer.js`
- `src/live-sound-adapter.js`
- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `docs/HANDOFF_2026-05-21_LIV016_FULL_BAND_STAGEBOX_REPAIR.md`
- `docs/SIGNAL_FLOW_MEMORY.md`
- `docs/live-sound-puzzle-game-roadmap.md`
- `data/puzzle-metadata/live-sound.json`

## Discovered Title And Brief

The current playable LIV-016 board is:

```text
16-channel Stage Box to Front-of-House
```

The launch payload describes the brief as:

```text
Patch the full band into the 16-channel stagebox, then feed FOH main outputs to the crossover.
```

This matches the renderer level spec and the existing LIV-016 repair handoff. It does not match the older roadmap row that still describes LIV-016 as a delay-tower route.

## Discovered Required Routes

Renderer and launch evidence agree on these required routes:

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

The renderer route keys use the `liv016-` prefix for all eighteen routes.

## Discovered Gear And Assets

Renderer evidence:

- `familyLayout`: `png-full-band-stagebox`
- `processorLabel`: `FULL BAND STAGEBOX`
- `panelKinds`: `stagebox`, `foh`, `amp`
- Background image: `assets/live-sound/png/liv016v20-board-only.png`
- Background alt text: `LIV-016 full-band stagebox layout`

Existing handoff evidence also references `assets/live-sound/png/liv016hitboxes0.png` as the hitbox mapping reference. That image is not rendered as the playable board; it documents the source-region mapping.

## Discovered Endpoint IDs

Source endpoints:

- `lead-vocal-mic`
- `bass-di`
- `guitar-1-left`
- `guitar-1-right`
- `guitar-2-left`
- `guitar-2-right`
- `keys-left-di`
- `keys-right-di`
- `kick`
- `snare`
- `hi-hat`
- `high-rack-tom`
- `low-rack-tom`
- `floor-tom`
- `overhead-left-crash`
- `overhead-right-ride`

Destination/output endpoints:

- `stagebox-input-1` through `stagebox-input-16`
- `foh-liv006-main-left-output`
- `foh-liv006-main-right-output`
- `liv242-crossover-l-input`
- `liv242-crossover-r-input`

The LIV-016 renderer branch creates transparent source hotspots for the instrument endpoints and jack hitboxes for the stagebox, FOH main outputs, and crossover inputs.

## Stereo Groups

Stereo-pair checklist gating is present for:

- `liv016-guitar-1-to-stagebox`
- `liv016-guitar-2-to-stagebox`
- `liv016-keys-to-stagebox`
- `liv016-overheads-to-stagebox`
- `liv016-main-to-crossover`

The handoff notes confirm the visible checklist should not mark a stereo half complete until its paired route is also complete.

## Route Intent

Route intent is clear:

- Inputs 1-16 teach full-band source-to-stagebox channel order.
- The final two routes preserve stereo left/right from FOH main outputs into the crossover inputs.
- The board is a constrained build around channel order, stagebox patching, and a stereo main PA processor feed.

## Batch Metadata Match

The current LIV-016 entry in `data/puzzle-metadata/live-sound.json` matches the source evidence:

- `taskMode`: `constrained-build`
- Scenario references a full stage input list, front-of-house stagebox, and main PA processor feed.
- Objective references stagebox channel order and main L/R processor inputs.
- Concept tags include `source-to-input`, `stagebox`, `channel-order`, `main-pa`, `processor-chain`, `left-right`, and `multi-route`.
- Constraints cover channel order and left/right preservation.

The only mismatch is with the older curriculum roadmap text, which still describes LIV-016 as a delay-tower/troubleshooting candidate. The current renderer, launch data, and LIV-016 repair handoff supersede that stale roadmap entry for this audit.

## Manifest Safety

It is safe to create a complete source board manifest later because the route list, endpoint IDs, source order, generated jack keys, asset reference, and stereo grouping behavior are all discoverable and consistent.

This audit does not create that manifest.

## Recommendation

Recommendation: `promote-to-apply-ready`

Rationale: LIV-016 has clear source-route evidence from the renderer, launch payload, and handoff documentation. The existing batch metadata already describes the current playable board accurately. The stale delay-tower roadmap entry should not keep LIV-016 in `needs-review`.
