# LIV-019 Source Route Audit

## Purpose

This audit determines whether LIV-019 can move from `needs-review` to `apply-ready` in `data/puzzle-metadata/live-sound.json` before any source board manifest is created.

Scope is read-only for gameplay and renderer behavior. This document does not create a board manifest, alter routes, add traps, change hitboxes, or change LIV-019 playability.

## Source Files Inspected

- `src/live-sound-native-renderer.js`
- `src/live-sound-adapter.js`
- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`
- `docs/HANDOFF_2026-05-26_LIV019_NATIVE_CABLE_LOCK.md`
- `docs/HANDOFF_2026-05-28_SCROLL_AFFORDANCE_LOCK.md`
- `docs/HANDOFF_SUMMARY.md`
- `docs/SIGNAL_FLOW_MEMORY.md`
- `docs/live-sound-puzzle-game-roadmap.md`
- `data/puzzle-metadata/live-sound.json`
- LIV-019 lock/tool scripts under `src/`
- `tools/live_sound_patch_acceptance.test.mjs`

## Discovered Title And Brief

Renderer title:

```text
Drum Inputs, IEM Sends and FX Returns
```

Launch brief:

```text
Patch the full drum kit into stagebox inputs 1-8, patch five FOH aux outputs to five IEM inputs, send two stereo bus pairs to reverb and delay, then return the stereo effects to FOH input channels 9-12.
```

The renderer, launch data, and roadmap agree that LIV-019 is an integrated drum input, IEM send, and FX send/return board.

## Discovered Required Routes

Renderer and launch evidence agree on twenty-one required routes:

1. Kick Mic -> Stage Box Input 1
2. Snare Mic -> Stage Box Input 2
3. Hi-Hat Mic -> Stage Box Input 3
4. Rack Tom 1 Mic -> Stage Box Input 4
5. Rack Tom 2 Mic -> Stage Box Input 5
6. Floor Tom Mic -> Stage Box Input 6
7. Overhead Left Mic -> Stage Box Input 7
8. Overhead Right Mic -> Stage Box Input 8
9. FOH Aux 1 Output -> IEM 1 Input
10. FOH Aux 2 Output -> IEM 2 Input
11. FOH Aux 3 Output -> IEM 3 Input
12. FOH Aux 4 Output -> IEM 4 Input
13. FOH Aux 5 Output -> IEM 5 Input
14. FOH Bus 1 Output -> Stereo Reverb L Input
15. FOH Bus 2 Output -> Stereo Reverb R Input
16. FOH Bus 3 Output -> Stereo Delay L Input
17. FOH Bus 4 Output -> Stereo Delay R Input
18. Stereo Reverb L Output -> FOH Input Channel 9
19. Stereo Reverb R Output -> FOH Input Channel 10
20. Stereo Delay L Output -> FOH Input Channel 11
21. Stereo Delay R Output -> FOH Input Channel 12

Renderer route IDs:

- `liv019-kick-to-stagebox-input-1`
- `liv019-snare-to-stagebox-input-2`
- `liv019-hi-hat-to-stagebox-input-3`
- `liv019-rack-tom-1-to-stagebox-input-4`
- `liv019-rack-tom-2-to-stagebox-input-5`
- `liv019-floor-tom-to-stagebox-input-6`
- `liv019-oh-left-to-stagebox-input-7`
- `liv019-oh-right-to-stagebox-input-8`
- `liv019-aux-1-to-iem-1`
- `liv019-aux-2-to-iem-2`
- `liv019-aux-3-to-iem-3`
- `liv019-aux-4-to-iem-4`
- `liv019-aux-5-to-iem-5`
- `liv019-bus-1-l-to-reverb-l-in`
- `liv019-bus-1-r-to-reverb-r-in`
- `liv019-bus-2-l-to-delay-l-in`
- `liv019-bus-2-r-to-delay-r-in`
- `liv019-reverb-l-out-to-foh-input-9`
- `liv019-reverb-r-out-to-foh-input-10`
- `liv019-delay-l-out-to-foh-input-11`
- `liv019-delay-r-out-to-foh-input-12`

Launch data also lists forbidden examples for swapped overheads, wrong IEM send, wrong FX send, and swapped return destinations. Those are not implemented as puzzle trap metadata yet.

## Discovered Gear And Assets

Renderer evidence:

- `processorLabel`: `DRUMS / IEM / FX`
- `panelKinds`: `stagebox`, `foh`, `iem`, `reverb`, `delay`
- Source order: drum kit sources only.

Custom native renderer gear:

- `stagebox`: `hardwareAssetFor("stagebox")`
- `foh`: `assets/live-sound/svg/hardware/16ch FOH console0.svg`
- `drum`: `assets/drums/svg/drum-kit-5-piece-8-hitboxes.svg`
- `iem1`, `iem2`, `iem3`: `assets/live-sound/svg/hardware/iem-wireless-rack-front.svg`
- `reverb`, `delay`: `assets/live-sound/svg/hardware/power-amp-liv006-system-delay-processor.svg`

LIV-019 has locked gear placement from Gear Mover export `v6r385` and locked processor display recolors `v6r386`.

## Discovered Endpoint IDs

Required source endpoints:

- `kick`
- `snare`
- `hi-hat`
- `high-rack-tom`
- `low-rack-tom`
- `floor-tom`
- `overhead-left-crash`
- `overhead-right-ride`
- `foh-liv019-aux-1-output`
- `foh-liv019-aux-2-output`
- `foh-liv019-aux-3-output`
- `foh-liv019-aux-4-output`
- `foh-liv019-aux-5-output`
- `foh-liv019-bus-1-output`
- `foh-liv019-bus-2-output`
- `foh-liv019-bus-3-output`
- `foh-liv019-bus-4-output`
- `liv019-reverb-left-output`
- `liv019-reverb-right-output`
- `liv019-delay-left-output`
- `liv019-delay-right-output`

Required destination endpoints:

- `stagebox-input-1` through `stagebox-input-8`
- `liv019-iem-1-input`
- `liv019-iem-2-input`
- `liv019-iem-3-input`
- `liv019-iem-4-input`
- `liv019-iem-5-input`
- `liv019-reverb-left-input`
- `liv019-reverb-right-input`
- `liv019-delay-left-input`
- `liv019-delay-right-input`
- `foh-liv019-input-9`
- `foh-liv019-input-10`
- `foh-liv019-input-11`
- `foh-liv019-input-12`

Additional generated but inactive/ghost endpoints include stagebox inputs 9-16, FOH inputs outside the FX return range, Aux 6-8, Bus 5-12, FOH main L/R, IEM 6 input, and processor link jacks.

## Stereo Groups

Five stereo groups are present:

- `liv019-drum-overheads`
- `liv019-bus-1-to-reverb`
- `liv019-bus-2-to-delay`
- `liv019-reverb-return`
- `liv019-delay-return`

The five Aux-to-IEM routes are mono one-to-one sends in the current valid route data. They are not represented as stereo IEM pairs.

## Locked Behavior And Custom Tooling

LIV-019 has significant locked custom behavior and tooling:

- `src/sf-liv019-scroll-shell.js?v=6r389`
- `src/sf-liv019-overlay-lock.js?v=6r407`
- `src/sf-liv019-foh-label-lock.js?v=6r399`
- `src/sf-liv019-foh-label-final-lock.js?v=6r401`
- `src/sf-liv019-hitbox-final-lock.js?v=6r408q2`
- `src/sf-liv019-stagebox-8-lock.js?v=6r404`
- `src/sf-liv019-clean-finalizer-v6r421.js?v=6r421q2`
- `src/sf-live-cable-mode-kit.js?v=6r426`

Important lock rules:

- Native cable rendering is locked to `.sf-native-cables` promoted to the top layer.
- Cable endpoints must resolve from locked DOM hitbox centers.
- The duplicate source-panel buttons under `.sf-native-liv019-source-panel` and `.sf-native-liv009-source-panel` must be ignored for cable anchors.
- No custom cable stubs, pigtails, viewport cable layers, or old runtime finalizer should be reintroduced.
- The stagebox is locked as an 8-input board; the stagebox 9-16 row is removed/hidden by lock tooling.
- The hitbox lock is expected to report `70/70` with `missingCount: 0`.
- The scroll shell owns LIV-019 scrolling and must not regress into vertical-wheel-to-horizontal drift.

Acceptance coverage currently checks that LIV-019 FOH aux/bus labels and IEM input labels remain present in the renderer.

## Route Intent

Route intent is clear:

- Drum microphones land on stagebox inputs 1-8.
- FOH aux outputs feed five individual IEM inputs.
- Bus outputs 1-4 feed stereo reverb and stereo delay inputs in left/right order.
- Stereo reverb and delay outputs return to FOH input channels 9-12 in left/right order.

This is a capstone-style integrated patch-board, not a low-risk early metadata retrofit.

## Batch Metadata Match

The current LIV-019 entry in `data/puzzle-metadata/live-sound.json` only partially matches the source evidence:

- It correctly identifies LIV-019 as `capstone-system`.
- It correctly emphasizes drum inputs, monitor sends, FX returns, separated signal roles, stereo pairs, and multi-route reasoning.
- It does not precisely match the current IEM route evidence because the metadata says `stereo IEM sends` and includes the `iem-stereo` concept tag, while current valid routes are five mono Aux-to-IEM input routes with no IEM stereo groups.

That mismatch is curriculum-level rather than renderer-level. The source routes are clear, but the metadata should be revised before promotion so future board data does not imply stereo IEM behavior that the current board does not require.

## Manifest Safety

It is technically possible to create a complete source board manifest later because the route list, endpoint IDs, gear assets, generated jack keys, lock scripts, and stereo groups are discoverable.

However, LIV-019 should not be auto-promoted yet. A future manifest pass must preserve the locked behavior above, avoid introducing false/trap hitboxes, avoid changing the cable/scroll/hitbox tooling, and first correct the curriculum metadata mismatch around IEM sends.

## Recommendation

Recommendation: `keep-needs-review`

Rationale: Source-route evidence is clear, but LIV-019 is locked and custom-tool-heavy, and the current batch metadata does not precisely match the route evidence. Keep it in review until the metadata is corrected to describe mono Aux-to-IEM sends or a deliberate curriculum decision is made to teach stereo IEM behavior on a later board.
