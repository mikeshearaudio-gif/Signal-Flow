# LIV-020 Source Route Audit

## Purpose

This audit determines whether LIV-020 can move from `needs-review` to `apply-ready` in `data/puzzle-metadata/live-sound.json` before any source board manifest is created.

Scope is read-only for gameplay and renderer behavior. This document does not create a board manifest, alter routes, add traps, change hitboxes, or change LIV-020 playability.

## Source Files Inspected

- `src/live-sound-native-renderer.js`
- `src/live-sound-adapter.js`
- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `docs/live-sound-puzzle-game-roadmap.md`
- `data/puzzle-metadata/live-sound.json`
- `data/live-sound/dev-locks/liv020-good-hitbox-lock-v6r406.json`
- `audit/live-sound-liv020-liv023-detailed-manifest.md`
- `audit/live-sound-liv020-liv023-route-manifest.csv`
- `audit/live-sound-liv020-liv023-asset-briefs.md`
- `audit/live-sound-liv020-liv023-acceptance-tests.md`
- LIV-020 dev/lock scripts under `src/`
- `tools/live_sound_patch_acceptance.test.mjs`

## Discovered Title And Brief

The active native renderer title is:

```text
Main PA + IEM Monitor Feed
```

The renderer processor label is:

```text
3-WAY PA + MONITOR IEM FEEDS
```

The launch payload still lists an older simpler level:

```text
Main PA amp feed
```

with four main-PA processor routes. The active native renderer supersedes that launch summary for current playable route evidence.

## Discovered Required Routes

The active native renderer defines nineteen required routes:

1. Main L Output -> Crossover L Input
2. Main R Output -> Crossover R Input
3. Crossover High L Output -> High Amp L Input
4. Crossover High R Output -> High Amp R Input
5. Crossover Mid L Output -> Mid Amp L Input
6. Crossover Mid R Output -> Mid Amp R Input
7. Crossover Low L Output -> Low Amp L Input
8. Crossover Low R Output -> Low Amp R Input
9. High Amp L Output -> Left Line Array High Input
10. High Amp R Output -> Right Line Array High Input
11. Mid Amp L Output -> Left Line Array Mid Input
12. Mid Amp R Output -> Right Line Array Mid Input
13. Low Amp L Output -> Left Line Array Low Input
14. Low Amp R Output -> Right Line Array Low Input
15. Aux 1 Output -> IEM Pack 1 Input A
16. Aux 2 Output -> IEM Pack 1 Input B
17. Aux 3 Output -> IEM Pack 2 Input A
18. Aux 4 Output -> IEM Pack 2 Input B
19. Aux 5 Output -> IEM Pack 3 Input A

Renderer route IDs:

- `liv020-main-left-output-to-liv020-crossover-left-input`
- `liv020-main-right-output-to-liv020-crossover-right-input`
- `liv020-crossover-high-left-output-to-liv020-high-amp-left-input`
- `liv020-crossover-high-right-output-to-liv020-high-amp-right-input`
- `liv020-crossover-mid-left-output-to-liv020-mid-amp-left-input`
- `liv020-crossover-mid-right-output-to-liv020-mid-amp-right-input`
- `liv020-crossover-low-left-output-to-liv020-low-amp-left-input`
- `liv020-crossover-low-right-output-to-liv020-low-amp-right-input`
- `liv020-high-amp-left-output-to-liv020-left-line-array-high-input`
- `liv020-high-amp-right-output-to-liv020-right-line-array-high-input`
- `liv020-mid-amp-left-output-to-liv020-left-line-array-mid-input`
- `liv020-mid-amp-right-output-to-liv020-right-line-array-mid-input`
- `liv020-low-amp-left-output-to-liv020-left-line-array-low-input`
- `liv020-low-amp-right-output-to-liv020-right-line-array-low-input`
- `liv020-aux-1-output-to-liv020-iem-pack-1-input`
- `liv020-aux-2-output-to-liv020-iem-pack-1-input-b`
- `liv020-aux-3-output-to-liv020-iem-pack-2-input`
- `liv020-aux-4-output-to-liv020-iem-pack-2-input-b`
- `liv020-aux-5-output-to-liv020-iem-pack-3-input`

## Discovered Gear And Assets

Renderer evidence:

- `processorLabel`: `3-WAY PA + MONITOR IEM FEEDS`
- `panelKinds`: `foh`, `crossover`, `amp-high`, `amp-mid`, `amp-low`, `speaker-left`, `speaker-right`, `pa-visual`, `iem-pack`
- Source order: empty; all endpoints are generated jack keys on the rendered hardware.

Asset overrides:

- Monitor console outputs: `assets/live-sound/svg/hardware/monitor-console-aux-panel.svg`
- Crossover: `assets/live-sound/svg/hardware/crossover-liv010-3way.svg`
- High amplifier: `assets/live-sound/svg/hardware/power-amp-liv010-high.svg`
- Mid amplifier: `assets/live-sound/svg/hardware/power-amp-liv010-mid.svg`
- Low amplifier: `assets/live-sound/svg/hardware/power-amp-liv010-low.svg`
- Left line-array input panel: `assets/live-sound/svg/hardware/line-array-input-panel-liv010-left.svg`
- Right line-array input panel: `assets/live-sound/svg/hardware/line-array-input-panel-liv010-right.svg`
- PA visual: `assets/live-sound/svg/hardware/full-pa-system-line-array-over-subs-renderstyle-standalone.svg`
- IEM pack: `assets/live-sound/svg/hardware/iem-wireless-rack-front.svg`

## Discovered Endpoint IDs

Required output endpoints:

- `liv020-main-left-output`
- `liv020-main-right-output`
- `liv020-aux-1-output`
- `liv020-aux-2-output`
- `liv020-aux-3-output`
- `liv020-aux-4-output`
- `liv020-aux-5-output`
- `liv020-crossover-high-left-output`
- `liv020-crossover-high-right-output`
- `liv020-crossover-mid-left-output`
- `liv020-crossover-mid-right-output`
- `liv020-crossover-low-left-output`
- `liv020-crossover-low-right-output`
- `liv020-high-amp-left-output`
- `liv020-high-amp-right-output`
- `liv020-mid-amp-left-output`
- `liv020-mid-amp-right-output`
- `liv020-low-amp-left-output`
- `liv020-low-amp-right-output`

Required input endpoints:

- `liv020-crossover-left-input`
- `liv020-crossover-right-input`
- `liv020-high-amp-left-input`
- `liv020-high-amp-right-input`
- `liv020-mid-amp-left-input`
- `liv020-mid-amp-right-input`
- `liv020-low-amp-left-input`
- `liv020-low-amp-right-input`
- `liv020-left-line-array-high-input`
- `liv020-right-line-array-high-input`
- `liv020-left-line-array-mid-input`
- `liv020-right-line-array-mid-input`
- `liv020-left-line-array-low-input`
- `liv020-right-line-array-low-input`
- `liv020-iem-pack-1-input`
- `liv020-iem-pack-1-input-b`
- `liv020-iem-pack-2-input`
- `liv020-iem-pack-2-input-b`
- `liv020-iem-pack-3-input`

The current renderer declares thirty-eight real generated jack keys for the board.

## False And Trap Jack Behavior

LIV-020 has substantial custom false/trap jack behavior in the active renderer:

- `LIV020_BAD_HITBOX_LAYOUT` contains 113 `liv020-bad-*` false hardware hitboxes.
- False hitbox families include mic inputs, inserts, aux outputs, bus outputs, matrix outputs, alternate main outputs, and unused IEM points.
- `LIV020_BAD_ROUTE_PAIRS` contains 113 curated invalid route pairs.
- False hardware jacks are installed by `installLiv020BadJacks(layer)`.
- False hardware jacks are real hit targets but remain visually neutral/hidden before interaction.
- Curated bad route pairs allow invalid red-cable feedback without counting toward completion.

The bad-route examples cover:

- Main L/R crossed into the wrong crossover input.
- Main outputs patched directly into amplifier or speaker inputs.
- Aux outputs patched into PA/crossover destinations.
- Aux outputs patched into the wrong IEM input.
- Crossover band outputs patched into the wrong amp band or wrong left/right side.
- Crossover outputs patched directly into line-array inputs.
- Amp outputs patched into the wrong side or wrong band.
- Main outputs patched into IEM inputs.

These are renderer-specific false-jack and bad-route affordances today, not yet canonical top-level puzzle metadata.

## Stereo Groups

Seven stereo-grouped PA route families are present:

- `liv020-main-to-crossover`
- `liv020-crossover-high-to-amp`
- `liv020-crossover-mid-to-amp`
- `liv020-crossover-low-to-amp`
- `liv020-high-amp-to-array`
- `liv020-mid-amp-to-array`
- `liv020-low-amp-to-array`

The five Aux-to-IEM routes are not assigned to stereo groups in the current valid route data. They are individual aux monitor sends to IEM pack inputs.

## Locked Behavior And Custom Tooling

LIV-020 has significant locked/custom behavior:

- `LIV020_LOCKED_LAYOUT_WIDTH` controls the compact board width and responsive X scaling.
- `applyLiv020GearLock(layer)` locks gear placement.
- `LIV020_LABEL_LAYOUT_LOCK` and `LIV020_LABEL_JSON_LOCK` lock label positions.
- `LIV020_HITBOX_LAYOUT_LOCK` locks the real jack hitbox positions.
- `sfLiv020NormalizeNeutralJackRings()` preserves neutral jack presentation when hints are off.
- `sfLiv020UpdateBadJackAvailability()` keeps false hardware jacks hit-testable but visually neutral/hidden.
- `sfLiv020RouteDecision()` allows valid routes and curated invalid LIV-020 bad routes without changing completion semantics.
- `renderLiv020MainPaAndIem()` owns the board's vertical layout and custom IEM pack overlays.
- Dev tooling includes `src/sf-liv020-good-hitbox-mapper-dev.js`, `src/sf-liv020-bad-route-hitbox-dev.js`, and `src/sf-liv020-bad-route-native-node-bridge-dev.js`.

The audit also found older planning docs for a future simplified mono-IEM LIV-020 concept. Those docs are useful historical context, but they do not match the current active renderer, which is the source of truth for this metadata pass.

## Route Intent

Route intent is clear:

- Main L/R feeds the three-way crossover inputs in left/right order.
- Crossover high, mid, and low outputs feed matching amplifier inputs in left/right order.
- Amplifier outputs feed matching high, mid, and low line-array inputs in left/right order.
- Aux 1-5 feed the intended IEM pack inputs.
- False/trap jacks teach wrong direction, wrong destination family, wrong processor order, wrong band, wrong side, and monitor-vs-PA confusion.

This is a mid-late capstone-style integrated PA plus monitor board, not a low-risk source-manifest candidate.

## Batch Metadata Match

The existing LIV-020 entry in `data/puzzle-metadata/live-sound.json` partially matched the active board:

- It correctly used `capstone-system`.
- It correctly described a main PA processor/amplifier path plus a monitor/IEM path.
- It correctly included `main-pa`, `processor-chain`, `amplifier`, `speaker-level`, `monitor-mix`, `left-right`, and `multi-route`.
- It incorrectly implied `iem-stereo`, while current Aux-to-IEM valid routes are individual aux sends with no IEM stereo-group gating.

The batch metadata was corrected to remove `iem-stereo`, add `aux-send` and `monitor-aux`, and describe five aux-to-IEM routes while preserving the PA processor/amplifier capstone framing.

## Manifest Safety

It is technically possible to create a complete source board manifest later because the active renderer exposes the route list, endpoint IDs, asset overrides, hitbox locks, label locks, false hitboxes, bad-route pairs, and stereo groups.

However, LIV-020 should not be auto-promoted yet. A future manifest pass must preserve the locked gear, label, hitbox, false-jack, bad-route, neutral-jack, and vertical layout behavior before any source manifest replaces or shadows renderer-only state.

## Recommendation

Recommendation: `keep-needs-review`

Rationale: Source-route evidence is clear enough to correct the batch metadata, but LIV-020 has locked/custom renderer behavior and substantial false-jack/bad-route logic that should not be represented casually in a first source manifest. Keep the board in review until the manifest strategy explicitly preserves current locked behavior and decides how the 113 false hitboxes and 113 curated bad-route pairs map into canonical puzzle metadata.
