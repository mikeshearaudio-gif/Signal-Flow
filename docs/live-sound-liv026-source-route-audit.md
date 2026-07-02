# LIV-026 Source Route Audit

## Purpose

This audit determines whether LIV-026 can move from `needs-review` to `apply-ready` in `data/puzzle-metadata/live-sound.json` before any source board manifest is created.

Scope is read-only for gameplay and renderer behavior. This document does not create a board manifest, alter routes, add traps, change hitboxes, or change LIV-026 playability.

## Source Files Inspected

- `src/live-sound-native-renderer.js`
- `src/live-sound-adapter.js`
- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `docs/live-sound-puzzle-game-roadmap.md`
- `data/puzzle-metadata/live-sound.json`
- `audit/live-sound-board-functionality-audit-2026-06-24.md`
- `audit/live-sound-board-equipment-jack-manifest.csv`
- `audit/live-sound-canonical-route-manifest.csv`
- `audit/signal-flow-live-sound-environment-audit-v1.md`
- `src/sf-liv026-false-jacks-lock.js`
- `src/sf-liv026-stack-guard.js`
- `src/sf-liv026-processor-deco-cleanup.js`

## Discovered Title And Brief

The active native renderer title is:

```text
Full Zone Processing
```

The launch payload agrees:

```text
Build full main, processor, crossover, delay, and fill zone routing.
```

Older audit CSV files describe an earlier `Delay tower route` concept with six routes, source-to-stagebox inputs, and an Aux 3 delay feed. Those files are historical and do not match the current active native renderer. Current renderer and launch evidence are the source of truth for this audit.

## Discovered Required Routes

Renderer and launch evidence agree on fifteen required routes:

1. Main L Output -> System Processor L In
2. Main R Output -> System Processor R In
3. System Processor L Out -> Crossover L In
4. System Processor R Out -> Crossover R In
5. Crossover High Left Out -> High Amp Left In
6. Crossover High Right Out -> High Amp Right In
7. Crossover Mid Left Out -> Mid Amp Left In
8. Crossover Mid Right Out -> Mid Amp Right In
9. Crossover Low Left Out -> Low Amp Left In
10. Crossover Low Right Out -> Low Amp Right In
11. Front-of-House Bus 1 Out -> Delay Tower Processor In
12. Delay Tower Processor Left Out -> Stereo Power Amp Left In
13. Delay Tower Processor Right Out -> Stereo Power Amp Right In
14. Front-of-House Bus 2 Out -> Front Fill Processor In
15. Front Fill Processor Out -> Power Amp Left In

Renderer route IDs:

- `liv026-main-l-to-system-l`
- `liv026-main-r-to-system-r`
- `liv026-system-l-to-crossover-l`
- `liv026-system-r-to-crossover-r`
- `liv026-crossover-high-l-to-high-amp-l`
- `liv026-crossover-high-r-to-high-amp-r`
- `liv026-crossover-mid-l-to-mid-amp-l`
- `liv026-crossover-mid-r-to-mid-amp-r`
- `liv026-crossover-low-l-to-low-amp-l`
- `liv026-crossover-low-r-to-low-amp-r`
- `liv026-bus1-to-delay-processor`
- `liv026-delay-l-to-delay-amp-l`
- `liv026-delay-r-to-delay-amp-r`
- `liv026-bus2-to-front-fill-processor`
- `liv026-front-fill-processor-to-fill-amp`

## Discovered Gear And Assets

Renderer evidence:

- `processorLabel`: `FULL ZONE PROCESSING`
- `panelKinds`: empty
- `sourceOrder`: empty
- `generatedJackKeys`: empty
- Custom renderer function: `renderLiv026ComplexZones(surface, adapter)`

Gear/assets used by the active renderer:

- FOH console: `assets/live-sound/svg/hardware/foh-console-liv006-matrix-main-outs.svg`
- System/delay processor asset: `assets/live-sound/svg/hardware/power-amp-liv006-system-delay-processor.svg`
- 3-way crossover: `assets/live-sound/svg/hardware/crossover-liv010-3way.svg`
- High amplifier: `assets/live-sound/svg/hardware/power-amp-liv010-high.svg`
- Mid amplifier: `assets/live-sound/svg/hardware/power-amp-liv010-mid.svg`
- Low amplifier: `assets/live-sound/svg/hardware/power-amp-liv010-low.svg`
- Delay amplifier: `assets/live-sound/svg/hardware/power-amp-liv010-mid.svg`
- Fill amplifier: `assets/live-sound/svg/hardware/power-amp-liv010-low.svg`
- Inline VU-meter SVG decorations
- Custom visible XLR-M decorations for Main Out L/R, Delay Out L/R, Fill Out, and Sub Out
- Tape labels for System Processor, 3-Way Crossover, High Amp, Mid Amp, Low Amp, Delay, and Fill Amp

## Discovered Endpoint IDs

Required source/output endpoints:

- `liv026-main-l-output`
- `liv026-main-r-output`
- `liv026-system-processor-l-output`
- `liv026-system-processor-r-output`
- `liv026-crossover-high-l-output`
- `liv026-crossover-high-r-output`
- `liv026-crossover-mid-l-output`
- `liv026-crossover-mid-r-output`
- `liv026-crossover-low-l-output`
- `liv026-crossover-low-r-output`
- `liv026-bus-1-output`
- `liv026-delay-processor-l-output`
- `liv026-delay-processor-r-output`
- `liv026-bus-2-output`
- `liv026-front-fill-processor-output`

Required input/destination endpoints:

- `liv026-system-processor-l-input`
- `liv026-system-processor-r-input`
- `liv026-crossover-l-input`
- `liv026-crossover-r-input`
- `liv026-high-amp-l-input`
- `liv026-high-amp-r-input`
- `liv026-mid-amp-l-input`
- `liv026-mid-amp-r-input`
- `liv026-low-amp-l-input`
- `liv026-low-amp-r-input`
- `liv026-delay-processor-input`
- `liv026-delay-amp-l-input`
- `liv026-delay-amp-r-input`
- `liv026-front-fill-processor-input`
- `liv026-fill-amp-l-input`

The active renderer applies a baked true-hitbox list containing 31 entries. Thirty are normal required endpoint hitboxes and one is an unused `liv026-delay-processor-input-unused` true hitbox in the layout.

## False And Trap Behavior

LIV-026 has custom false/trap behavior in the active renderer:

- The renderer contains 28 `liv026-false-*` false hitboxes.
- False hitboxes are installed by `applyLiv026FalseHitboxes()`.
- False jacks are transparent/neutral before interaction with `opacity: 0`, transparent background, no border, and pointer events enabled.
- False jacks set `data-sf-false-jack`, `data-sf-native-hintable="0"`, `data-sf-native-good-hint="0"`, and `data-sf-native-ghost="0"`.
- Hint highlighting explicitly excludes keys that start with `liv026-false-`.
- LIV-026 route decision logic allows any two distinct `liv026-*` nodes to draw an invalid red route when the pair is not a valid route. That preserves wrong-route visual feedback without counting toward completion.
- `src/sf-liv026-false-jacks-lock.js` contains a matching false-jack lock with 28 hitboxes, though some early names differ from the in-renderer baked keys.

These false/trap behaviors are renderer-specific today. They are not yet represented as canonical top-level puzzle metadata.

## Stereo Groups

Six stereo groups are present:

- `liv026-main-to-system`
- `liv026-system-to-crossover`
- `liv026-high-to-amp`
- `liv026-mid-to-amp`
- `liv026-low-to-amp`
- `liv026-delay-to-amp`

The Bus 1 delay processor input route, Bus 2 front-fill processor input route, and front-fill processor-to-fill-amp route are mono routes.

## Locked Behavior And Custom Tooling

LIV-026 has significant custom behavior and tooling:

- The board uses a custom scroll host class: `sf-live-native-liv026-scroll-host`.
- The native renderer owns a custom 1400 x 1260 complex-zone layout.
- `applyLiv026TrueHitboxes()` bakes and reapplies real hitbox positions immediately and on timers.
- `applyLiv026FalseHitboxes()` bakes and reapplies false hitboxes immediately and on timers.
- `src/sf-liv026-stack-guard.js` preserves jack, false-jack, and cable stack order.
- `src/sf-liv026-processor-deco-cleanup.js` hides decorative processor SUB/FILL modules that should not behave like gameplay jacks.
- The renderer includes comments and finalizer behavior around invalid red-cable persistence.
- The functionality audit marks LIV-026 as implemented and regression-sensitive, with custom true/false hitbox and false-route persistence behavior.

Older audit files and route manifests still reference the pre-current six-route delay-tower concept. Any future source board manifest must preserve the current renderer behavior, not those stale manifests.

## Route Intent

Route intent is clear:

- Main L/R feeds system processing in left/right order.
- System processor L/R feeds the crossover in left/right order.
- Crossover high, mid, and low outputs feed their matching amplifier band inputs in left/right order.
- Bus 1 feeds the delay tower processor, which then feeds a stereo delay amp.
- Bus 2 feeds front-fill processing, which then feeds the fill amp.

This is a full-system capstone board focused on zone feeds, processor-chain reasoning, amplifier routing, left/right consistency, and multi-route completion.

## Batch Metadata Match

The existing LIV-026 entry in `data/puzzle-metadata/live-sound.json` was broadly aligned with the active board:

- It correctly used `capstone-system`.
- It correctly emphasized zone feeds, delay tower, front fill, main PA, processor chain, amplification, speaker-level routing, left/right consistency, and multi-route reasoning.
- It was too generic about "multiple audience zones" and did not name the actual Main L/R, Bus 1, and Bus 2 route families.

The batch metadata was corrected to match the current route evidence more tightly while keeping `status` as `needs-review`.

## Manifest Safety

It is technically possible to create a complete source board manifest later because the active renderer exposes route IDs, endpoint IDs, good hitboxes, false hitboxes, assets, labels, and stereo groups.

However, LIV-026 should not be auto-promoted yet. A future manifest pass must explicitly preserve the custom scroll host, baked true hitboxes, baked false hitboxes, stack guard, processor-deco cleanup, broad invalid-route behavior, visible decorations, and checklist/stereo-pair semantics before creating source board JSON.

## Recommendation

Recommendation: `keep-needs-review`

Rationale: Source-route evidence is clear enough to correct the batch metadata, but LIV-026 is a locked regression-sensitive capstone with custom false hitboxes, true-hitbox baking, stack management, and broad invalid-route behavior. Keep it in review until the source-manifest strategy can preserve the current renderer behavior exactly.
