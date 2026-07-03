# Live-Sound Locked Board Conversion Plan

## Purpose

This document defines preservation-safe conversion plans for the four locked live-sound boards that remain `needs-review` / preservation-required:

- LIV-019
- LIV-020
- LIV-023
- LIV-026

The goal is to make future source-manifest work possible without rediscovering the board state or accidentally weakening current gameplay. Actual route evidence and locked renderer behavior remain the source of truth. Future metadata and manifests must conform to the existing boards, not the reverse.

No source manifests should be created for these boards until their preservation requirements are satisfied and reviewed.

Reference documents:

- `docs/live-sound-metadata-rollout-status.md`
- `docs/live-sound-locked-board-preservation-plan.md`
- `docs/live-sound-liv019-source-route-audit.md`
- `docs/live-sound-liv020-source-route-audit.md`
- `docs/live-sound-liv023-source-route-audit.md`
- `docs/live-sound-liv026-source-route-audit.md`

## Recommended Conversion Order

1. **LIV-019**
   - Lowest false-hitbox risk of the locked group.
   - Route evidence is clear, and the primary risk is preserving lock/finalizer, scroll, label, stagebox, cable-anchor, and checklist behavior.
   - Start here only after a browser parity checklist exists for the current locked board.

2. **LIV-023**
   - Route and layout evidence are clear, and exported good/false hitbox data exists.
   - Higher risk than LIV-019 because it has 101 false hitboxes and broad invalid-route behavior.
   - Convert after the manifest strategy can represent or preserve false-hitbox and insert-direction behavior.

3. **LIV-026**
   - Route evidence is clear, but the board depends on a custom complex-zone renderer, baked true/false hitboxes, stack guard, processor-deco cleanup, and invalid red-cable persistence.
   - Convert only after true/false hitbox baking and stack behavior can be compared before and after manifest creation.

4. **LIV-020**
   - Highest risk because it combines 19 required routes with 113 false hitboxes, 113 curated bad route pairs, neutral bad-jack behavior, custom route-decision logic, label locks, hitbox locks, and compact layout scaling.
   - Leave last so the false-route metadata and renderer-preservation approach can mature on less dense boards first.

## Shared Stop Conditions

Stop conversion immediately if any of these are observed:

- Required route count differs from the locked audit.
- Required route endpoint IDs differ from the locked audit without a documented source-of-truth reason.
- Stereo group count or membership differs.
- Good hitbox count, IDs, or geometry differ unexpectedly.
- False/trap hitbox count, IDs, geometry, visibility, or hintability differ unexpectedly.
- Show Hints reveals false/trap endpoints.
- Wrong routes no longer draw red invalid cables where the locked board currently allows them.
- Wrong routes begin counting toward completion.
- Score penalties or repeated-wrong-route behavior changes.
- Completion checklist rows update at different times than the locked board.
- Cable anchoring, cable layer order, red/green cable persistence, or scroll behavior regresses.
- Label placement or gear placement differs enough to affect playability or visual clarity.
- A browser smoke test shows route state loss, duplicate completed cables, stale score, or reset after route attempts.

## Shared Future Conversion Sequence

Use this sequence for each locked board. Do not skip steps because route evidence looks clear; these boards are protected because behavior outside the route list is fragile.

1. Snapshot current behavior.
   - Record the current commit.
   - Run the metadata report, live-sound validation, patch acceptance, and game/music acceptance checks.
   - Capture a browser smoke note for valid routes, invalid routes, hints, checklist behavior, scoring, scroll, and cable persistence.

2. Export and freeze route data.
   - Capture route IDs, from/to endpoint IDs, route labels, route family names, and required route count from the active renderer or launch evidence.
   - Compare against the board-specific source-route audit.

3. Export and freeze good hitboxes.
   - Capture every valid endpoint ID and geometry.
   - Preserve any generated, baked, or locked hitbox source used by the current renderer.

4. Export and freeze false/trap hitboxes.
   - Capture every false/trap endpoint ID and geometry.
   - Capture current visibility, neutral styling, pointer-event behavior, and hint exclusion flags.

5. Capture wrong-route behavior.
   - Capture curated bad route pairs where they exist.
   - Capture broad invalid-route rules where route decision logic allows any same-board wrong pair to draw red.
   - Confirm wrong routes do not count toward completion.

6. Draft the source manifest behind no renderer integration.
   - Add source JSON only after evidence is frozen.
   - Do not route the live renderer through the manifest yet.
   - Do not migrate existing custom renderer behavior during this draft step.

7. Bake the normalized manifest.
   - Confirm normalized output preserves puzzle/curriculum metadata and all manifest route/hitbox content.

8. Compare manifest against locked audit.
   - Compare route count, route IDs, endpoint IDs, stereo groups, good hitboxes, false hitboxes, labels, gear, and acceptance counts.

9. Run automated checks.
   - Run board validation, metadata validation, patch acceptance, game/music acceptance, syntax checks, and `git diff --check`.

10. Run browser smoke.
   - Complete representative valid routes from every route family.
   - Trigger representative invalid routes, including false/trap jacks.
   - Verify Show Hints, checklist timing, score behavior, scroll behavior, cable layers, and completion.

11. Only then consider metadata status changes.
   - Keep the board `needs-review` until parity is demonstrated.
   - Promote only after the manifest strategy is reviewed and the current locked behavior is preserved.

## LIV-019 Conversion Plan

### Current Locked Evidence Summary

- Title: `Drum Inputs, IEM Sends and FX Returns`
- Route count: 21 required routes.
- Route families:
  - 8 drum mic inputs to stagebox inputs 1-8.
  - 5 mono FOH aux outputs to IEM inputs 1-5.
  - Bus 1/2 to stereo reverb L/R inputs.
  - Bus 3/4 to stereo delay L/R inputs.
  - Reverb L/R and delay L/R outputs back to FOH inputs 9-12.
- Stereo groups:
  - `liv019-drum-overheads`
  - `liv019-bus-1-to-reverb`
  - `liv019-bus-2-to-delay`
  - `liv019-reverb-return`
  - `liv019-delay-return`
- Good hitbox count: lock tooling expects `70/70` lock coverage with `missingCount: 0`.
- False/trap hitbox behavior:
  - Launch data lists forbidden examples for swapped overheads, wrong IEM sends, wrong FX sends, and swapped FX returns.
  - Canonical trap metadata has not been created yet.
- Curated wrong-route behavior:
  - Forbidden examples exist in launch data, but current locked behavior must be audited in-browser before manifest conversion.
- Custom behavior:
  - Locked scroll shell.
  - Overlay lock.
  - FOH label locks and final label lock.
  - Final hitbox lock.
  - Stagebox 8-input lock.
  - Clean finalizer.
  - Native cable mode kit.
  - Cable endpoints resolve from locked DOM hitbox centers.
  - Duplicate source-panel buttons must be ignored for cable anchors.
- Current preservation sources:
  - `src/live-sound-native-renderer.js`
  - `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
  - `src/sf-liv019-scroll-shell.js`
  - `src/sf-liv019-overlay-lock.js`
  - `src/sf-liv019-foh-label-lock.js`
  - `src/sf-liv019-foh-label-final-lock.js`
  - `src/sf-liv019-hitbox-final-lock.js`
  - `src/sf-liv019-stagebox-8-lock.js`
  - `src/sf-liv019-clean-finalizer-v6r421.js`
  - `src/sf-live-cable-mode-kit.js`
  - `docs/live-sound-liv019-source-route-audit.md`

### Preservation Requirements

- Preserve all 21 required route semantics exactly.
- Preserve the 8-input stagebox behavior; do not expose stagebox inputs 9-16 as active gameplay endpoints.
- Preserve five mono Aux-to-IEM routes; do not reinterpret them as stereo IEM pairs.
- Preserve all five stereo groups and checklist timing.
- Preserve locked good hitbox IDs and geometry, including `70/70` hitbox lock coverage.
- Preserve any forbidden/wrong-route examples that currently render or teach in the locked board.
- Preserve hint exclusions for inactive, ghost, or non-valid endpoints.
- Preserve wrong-route penalties and invalid red-cable behavior.
- Preserve scroll shell behavior and avoid vertical-wheel-to-horizontal drift.
- Preserve cable anchoring from locked DOM hitbox centers and the top-layer native cable behavior.
- Preserve FOH labels, gear placement, stagebox presentation, finalizer behavior, and checklist completion behavior.
- Browser smoke must verify drum inputs, mono IEM sends, stereo FX sends, stereo FX returns, hints, scoring, cable persistence, and completion.

### Future Conversion Sequence

1. Snapshot current LIV-019 behavior with browser smoke notes for one drum input, one Aux-to-IEM route, one stereo FX send pair, one stereo FX return pair, one wrong route, Show Hints, scoring, checklist timing, and scroll.
2. Export the 21 route IDs and endpoint IDs from the active renderer and compare them to the LIV-019 audit.
3. Export the locked good hitboxes and verify the expected `70/70` lock coverage.
4. Capture inactive/ghost endpoints and any forbidden launch-route examples so they are not accidentally treated as valid hints.
5. Capture any wrong-route pairs that currently draw red invalid cables.
6. Draft `data/live-sound/boards/liv019.json` without enabling renderer consumption.
7. Bake `data/live-sound/boards/normalized/liv019.normalized.json`.
8. Compare routes, stereo groups, labels, gear, and hitboxes against the audit and lock scripts.
9. Run automated checks.
10. Run browser smoke before considering any status change.
11. Keep `status: needs-review` until parity evidence is reviewed.

### LIV-019 Stop Conditions

- Route count is not 21.
- Aux-to-IEM routes are modeled as stereo pairs.
- Stagebox inputs 9-16 become valid, hintable, or visually active.
- Hitbox lock coverage differs from `70/70`.
- Cable anchors resolve from duplicate source-panel buttons.
- FOH labels, scroll shell, native cable layer, or finalizer behavior changes.

## LIV-020 Conversion Plan

### Current Locked Evidence Summary

- Title: `Main PA + IEM Monitor Feed`
- Route count: 19 required routes.
- Route families:
  - Main L/R to crossover L/R inputs.
  - Crossover high, mid, and low L/R outputs to matching amplifier L/R inputs.
  - High, mid, and low amplifier L/R outputs to matching line-array L/R band inputs.
  - Aux 1-5 to IEM pack inputs.
- Stereo groups:
  - `liv020-main-to-crossover`
  - `liv020-crossover-high-to-amp`
  - `liv020-crossover-mid-to-amp`
  - `liv020-crossover-low-to-amp`
  - `liv020-high-amp-to-array`
  - `liv020-mid-amp-to-array`
  - `liv020-low-amp-to-array`
- Good hitbox count: 38 real generated jack keys.
- False/trap hitbox count: 113 `liv020-bad-*` false hardware hitboxes.
- Curated wrong-route behavior:
  - 113 curated bad route pairs in `LIV020_BAD_ROUTE_PAIRS`.
  - False hardware jacks remain neutral/hidden before interaction.
  - Curated invalid pairs can draw red invalid cables without counting toward completion.
- Custom behavior:
  - Locked layout width and responsive X scaling.
  - Gear lock.
  - Label locks.
  - Hitbox layout lock.
  - Neutral jack-ring normalization.
  - Bad-jack availability updates.
  - Custom route-decision logic.
  - Custom vertical layout and IEM pack overlays.
- Current preservation sources:
  - `src/live-sound-native-renderer.js`
  - `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
  - `data/live-sound/dev-locks/liv020-good-hitbox-lock-v6r406.json`
  - `audit/live-sound-liv020-liv023-detailed-manifest.md`
  - `audit/live-sound-liv020-liv023-route-manifest.csv`
  - `audit/live-sound-liv020-liv023-asset-briefs.md`
  - `audit/live-sound-liv020-liv023-acceptance-tests.md`
  - `src/sf-liv020-good-hitbox-mapper-dev.js`
  - `src/sf-liv020-bad-route-hitbox-dev.js`
  - `src/sf-liv020-bad-route-native-node-bridge-dev.js`
  - `docs/live-sound-liv020-source-route-audit.md`

### Preservation Requirements

- Preserve all 19 required route semantics exactly.
- Preserve seven PA stereo groups and existing checklist timing.
- Preserve five individual Aux-to-IEM routes; do not add IEM stereo-group gating.
- Preserve all 38 real generated jack keys and their locked geometry.
- Preserve all 113 false hitboxes, including IDs, geometry, hit-testability, and neutral pre-interaction styling.
- Preserve all 113 curated bad route pairs and invalid red-cable behavior.
- Preserve Show Hints exclusions for false jacks.
- Preserve score penalties, repeated wrong-route behavior, and non-completion semantics for invalid routes.
- Preserve compact layout width, gear locks, label locks, hitbox locks, IEM overlays, and responsive scaling.
- Browser smoke must verify one route from every PA family, at least one Aux-to-IEM route, curated false-jack behavior, hints, scoring, checklist timing, cable persistence, and completion.

### Future Conversion Sequence

1. Snapshot current LIV-020 behavior with browser smoke notes for each PA stereo route family, one Aux-to-IEM route, one curated wrong PA route, one curated wrong IEM route, Show Hints, score, checklist, and scroll/layout scaling.
2. Export the 19 route IDs and endpoint IDs from the active renderer and compare them to the LIV-020 audit.
3. Export the 38 real generated jack keys and locked geometry from the hitbox lock.
4. Export all 113 `liv020-bad-*` false hitboxes and their neutral styling rules.
5. Export all 113 curated bad route pairs and classify their teaching concepts before mapping them into puzzle metadata.
6. Draft `data/live-sound/boards/liv020.json` without enabling renderer consumption.
7. Bake `data/live-sound/boards/normalized/liv020.normalized.json`.
8. Compare routes, stereo groups, good hitboxes, false hitboxes, labels, gear, assets, and bad-route pairs against the audit and lock sources.
9. Run automated checks.
10. Run browser smoke before considering any status change.
11. Keep `status: needs-review` until false-hitbox and bad-route parity are reviewed.

### LIV-020 Stop Conditions

- Route count is not 19.
- Good hitbox count is not 38.
- False hitbox count is not 113.
- Bad route pair count is not 113.
- False jacks become visually obvious before interaction.
- Show Hints highlights false jacks.
- Curated invalid routes stop drawing red cables or begin counting toward completion.
- Compact layout, labels, gear locks, hitbox locks, or IEM overlays shift.

## LIV-023 Conversion Plan

### Current Locked Evidence Summary

- Title: `Monitor Console: Vocal Insert, Stereo IEM, and 3-Way PA`
- Route count: 15 required routes.
- Route families:
  - Lead vocal and keyboard DI L/R to stagebox inputs 1-3.
  - Channel 1 insert send to compressor input.
  - Compressor output to Channel 1 insert return.
  - Aux 1 L/R to IEM A L/R inputs.
  - Main L/R to crossover L/R inputs.
  - Crossover high, mid, and low L/R outputs to matching amplifier L/R inputs.
- Stereo groups:
  - `liv023-keyboard-di-to-stagebox`
  - `liv023-aux1-to-iem-a`
  - `liv023-main-to-crossover`
  - `liv023-crossover-high-to-amp`
  - `liv023-crossover-mid-to-amp`
  - `liv023-crossover-low-to-amp`
- Good hitbox count: 30 good hitboxes.
- False/trap hitbox count: 101 `liv023-false-*` false hitboxes.
- Curated wrong-route behavior:
  - Hints exclude `liv023-false-*`, `data-sf-native-false-jack="1"`, and `data-sf-native-hintable="0"` nodes.
  - The route-decision branch allows any two distinct `liv023-*` nodes to draw an invalid route when the base route is not valid.
- Custom behavior:
  - Custom scroll host.
  - Legacy mask for old patchbay/cable artifacts.
  - Custom rack-zone visual layout.
  - Exported final gear, label, good-hitbox, false-hitbox, and gear-layer layouts.
  - Insert direction, stereo IEM, and multi-way PA checklist behavior.
- Current preservation sources:
  - `src/live-sound-native-renderer.js`
  - `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
  - `audit/liv023-good-hitboxes-final.json`
  - `audit/liv023-false-hitboxes-final.json`
  - `audit/liv023-gear-layout-final.json`
  - `audit/liv023-label-layout-final.json`
  - `audit/liv023-gear-layer-layout-final.json`
  - `audit/live-sound-liv020-liv023-detailed-manifest.md`
  - `audit/live-sound-liv020-liv023-route-manifest.csv`
  - `audit/live-sound-liv020-liv023-asset-briefs.md`
  - `audit/live-sound-liv020-liv023-acceptance-tests.md`
  - `src/sf-liv023-good-hitbox-mapper-dev.js`
  - `src/sf-liv023-gear-mover-dev.js`
  - `src/sf-liv023-label-mover-dev.js`
  - `src/sf-liv023-gear-layer-mover-dev.js`
  - `src/sf-liv023-static-gear-preview-dev.js`
  - `docs/live-sound-liv023-source-route-audit.md`

### Preservation Requirements

- Preserve all 15 required route semantics exactly.
- Preserve insert send/return direction; do not treat the compressor insert as a stereo pair.
- Preserve all six stereo groups and checklist timing.
- Preserve all 30 good hitboxes and their exported geometry.
- Preserve all 101 false hitboxes and their exported geometry.
- Preserve broad invalid-route rendering for wrong `liv023-*` pairs.
- Preserve Show Hints exclusions for false/hint-disabled nodes.
- Preserve wrong-route penalty, red invalid cable behavior, and non-completion semantics.
- Preserve custom scroll host, legacy mask, rack-zone layout, gear placement, labels, normalizing cable overlays, and compressor label overlay.
- Browser smoke must verify source-to-stagebox routes, insert direction, stereo IEM pair completion, PA pair completion, false-jack neutrality, hints, scoring, checklist timing, scroll, and completion.

### Future Conversion Sequence

1. Snapshot current LIV-023 behavior with browser smoke notes for source inputs, insert send/return, IEM stereo pair, one PA stereo pair, one false-jack attempt, one broad invalid route, Show Hints, scoring, checklist, and scroll.
2. Export the 15 route IDs and endpoint IDs from the active renderer and compare them to the LIV-023 audit.
3. Export all 30 good hitboxes from `audit/liv023-good-hitboxes-final.json`.
4. Export all 101 false hitboxes from `audit/liv023-false-hitboxes-final.json`.
5. Capture broad invalid-route behavior for same-board `liv023-*` pairs and classify representative wrong-route concepts.
6. Draft `data/live-sound/boards/liv023.json` without enabling renderer consumption.
7. Bake `data/live-sound/boards/normalized/liv023.normalized.json`.
8. Compare routes, stereo groups, gear, labels, good hitboxes, false hitboxes, masks, and overlays against the audit exports.
9. Run automated checks.
10. Run browser smoke before considering any status change.
11. Keep `status: needs-review` until custom layout and false-hitbox parity are reviewed.

### LIV-023 Stop Conditions

- Route count is not 15.
- Good hitbox count is not 30.
- False hitbox count is not 101.
- Insert send/return direction becomes reversible or ambiguous.
- False nodes become hintable.
- Broad invalid `liv023-*` wrong-route rendering changes.
- Legacy mask, rack-zone layout, labels, gear placement, or scroll host changes.

## LIV-026 Conversion Plan

### Current Locked Evidence Summary

- Title: `Full Zone Processing`
- Route count: 15 required routes.
- Route families:
  - Main L/R to system processor L/R inputs.
  - System processor L/R outputs to crossover L/R inputs.
  - Crossover high, mid, and low L/R outputs to matching amplifier L/R inputs.
  - Bus 1 to delay tower processor input.
  - Delay processor L/R outputs to stereo delay amp L/R inputs.
  - Bus 2 to front-fill processor input.
  - Front-fill processor output to fill amp input.
- Stereo groups:
  - `liv026-main-to-system`
  - `liv026-system-to-crossover`
  - `liv026-high-to-amp`
  - `liv026-mid-to-amp`
  - `liv026-low-to-amp`
  - `liv026-delay-to-amp`
- Good hitbox count: 31 baked true hitboxes, including one unused layout hitbox.
- False/trap hitbox count: 28 `liv026-false-*` false hitboxes.
- Curated wrong-route behavior:
  - Broad route-decision logic allows any two distinct `liv026-*` nodes to draw invalid red routes when the pair is not valid.
  - False jacks are transparent/neutral before interaction and excluded from hints.
- Custom behavior:
  - Custom scroll host.
  - Custom 1400 x 1260 complex-zone layout.
  - Baked true hitboxes reapplied immediately and on timers.
  - Baked false hitboxes reapplied immediately and on timers.
  - Stack guard for jack, false-jack, and cable layers.
  - Processor-deco cleanup for non-gameplay SUB/FILL modules.
  - Visible XLR, VU, tape-label, and processor decorations.
  - Invalid red-cable persistence behavior.
- Current preservation sources:
  - `src/live-sound-native-renderer.js`
  - `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
  - `src/sf-liv026-false-jacks-lock.js`
  - `src/sf-liv026-stack-guard.js`
  - `src/sf-liv026-processor-deco-cleanup.js`
  - `audit/live-sound-board-functionality-audit-2026-06-24.md`
  - `audit/live-sound-board-equipment-jack-manifest.csv`
  - `audit/live-sound-canonical-route-manifest.csv`
  - `audit/signal-flow-live-sound-environment-audit-v1.md`
  - `docs/live-sound-liv026-source-route-audit.md`

### Preservation Requirements

- Preserve all 15 required route semantics exactly.
- Preserve six stereo groups and mono delay/front-fill route behavior.
- Preserve all 31 baked true hitboxes, including the unused layout hitbox.
- Preserve all 28 false hitboxes, including neutral styling, pointer-event behavior, and hint-exclusion flags.
- Preserve broad invalid-route red cable behavior for wrong `liv026-*` pairs.
- Preserve Show Hints exclusions for false nodes.
- Preserve score penalties, repeated wrong-route behavior, non-completion semantics, and completion checklist timing.
- Preserve custom scroll host, 1400 x 1260 layout, stack guard, processor-deco cleanup, visible decorations, gear placement, labels, and invalid red-cable persistence.
- Browser smoke must verify main/system route pair, crossover/amp route pair, delay-zone routes, front-fill routes, false-jack behavior, hints, scoring, checklist, scroll, cable stack, and completion.

### Future Conversion Sequence

1. Snapshot current LIV-026 behavior with browser smoke notes for main-to-system, system-to-crossover, one crossover-to-amp pair, delay tower routes, front-fill routes, one false-jack attempt, one broad invalid route, Show Hints, scoring, checklist, cable stack, and scroll.
2. Export the 15 route IDs and endpoint IDs from the active renderer and compare them to the LIV-026 audit.
3. Export all 31 baked true hitboxes and identify the unused layout hitbox.
4. Export all 28 false hitboxes from the active renderer and reconcile them with `src/sf-liv026-false-jacks-lock.js`.
5. Capture broad invalid-route behavior and representative wrong-route concepts for zone, processor, band, and left/right mistakes.
6. Draft `data/live-sound/boards/liv026.json` without enabling renderer consumption.
7. Bake `data/live-sound/boards/normalized/liv026.normalized.json`.
8. Compare routes, stereo groups, true hitboxes, false hitboxes, stack behavior, decorations, labels, and gear against the audit and lock scripts.
9. Run automated checks.
10. Run browser smoke before considering any status change.
11. Keep `status: needs-review` until true/false hitbox baking, stack behavior, and invalid-route parity are reviewed.

### LIV-026 Stop Conditions

- Route count is not 15.
- Baked true hitbox count is not 31.
- False hitbox count is not 28.
- The unused layout hitbox is accidentally removed or converted into active gameplay without review.
- False nodes become visible or hintable before interaction.
- Broad invalid `liv026-*` wrong-route rendering changes.
- Stack guard, processor-deco cleanup, visible decorations, invalid red-cable persistence, custom scroll host, or 1400 x 1260 layout changes.

## Status Gate

All four boards remain `needs-review` / preservation-required after this planning pass:

- LIV-019
- LIV-020
- LIV-023
- LIV-026

Future manifest work for these boards should start from this plan, the board-specific audits, and a fresh browser smoke snapshot. Source manifests are allowed only after behavior parity is defined for routes, hitboxes, false/trap behavior, hints, scoring, completion, labels, cable rendering, and scroll behavior.
