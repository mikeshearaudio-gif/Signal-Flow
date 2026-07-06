# LIV-026 Manifest Readiness Plan

## Scope

This is a planning and readiness document only. It does not create a runtime source manifest, does not create `data/live-sound/boards/liv026.json`, and does not create `data/live-sound/boards/normalized/liv026.normalized.json`.

Actual LIV-026 route evidence and locked board behavior are the source of truth. Any future source manifest must conform to the captured preservation snapshot, not to older six-route delay-tower audit rows.

## Source Evidence

- `audit/liv026-preservation-snapshot/README.md`
- `audit/liv026-preservation-snapshot/routes.json`
- `audit/liv026-preservation-snapshot/stereo-groups.json`
- `audit/liv026-preservation-snapshot/good-hitboxes.json`
- `audit/liv026-preservation-snapshot/false-hitboxes.json`
- `audit/liv026-preservation-snapshot/wrong-route-behavior.json`
- `audit/liv026-preservation-snapshot/locked-behavior.json`
- `docs/live-sound-liv026-source-route-audit.md`
- `docs/live-sound-locked-board-conversion-plan.md`
- `data/puzzle-metadata/live-sound.json`

## Required Future Manifest Contents

A future controlled data-only source manifest must preserve:

- 15 required routes.
- 6 stereo groups.
- 31 baked true hitboxes.
- 30 required endpoint hitboxes.
- 1 unused baked true hitbox: `liv026-delay-processor-input-unused`.
- 28 `liv026-false-*` false hitboxes.
- Broad invalid red-route behavior for wrong distinct `liv026-*` pairs.
- False hitboxes as neutral before interaction, non-completing, and excluded from hints.
- Custom scroll host behavior.
- False-hitbox lock behavior.
- Stack guard behavior.
- Processor-deco cleanup behavior.
- Cable/checklist/scoring behavior.

## Route Families

The future manifest must preserve these route families:

- Main L/R outputs to system processor L/R inputs.
- System processor L/R outputs to crossover L/R inputs.
- Crossover high L/R outputs to high amp L/R inputs.
- Crossover mid L/R outputs to mid amp L/R inputs.
- Crossover low L/R outputs to low amp L/R inputs.
- Bus 1 output to delay tower processor input.
- Delay processor L/R outputs to stereo delay amp L/R inputs.
- Bus 2 output to front-fill processor input.
- Front-fill processor output to fill amp input.

## Future Source Manifest Structure

A future `data/live-sound/boards/liv026.json` should include:

- `levelId`, title, and brief matching current LIV-026 evidence.
- `environment: live`.
- `requiredRoutes` copied from `routes.json`.
- `stereoGroups` copied from `stereo-groups.json`.
- Gear/assets where supported by `locked-behavior.json`.
- Baked true hitboxes from `good-hitboxes.json`.
- False/trap hitboxes or preservation references from `false-hitboxes.json`, depending on final board-schema suitability.
- Wrong-route/invalid-route evidence references from `wrong-route-behavior.json`.
- Top-level puzzle metadata copied from `data/puzzle-metadata/live-sound.json`.
- Preservation/audit references back to this snapshot and readiness plan.

The future normalized manifest must preserve the same route, hitbox, puzzle, and preservation evidence needed for parity checks.

## Parity Checks

Before any future LIV-026 manifest can be committed, all of these must pass:

- Route count equals 15.
- Stereo group count equals 6.
- Baked true hitbox count equals 31.
- Required endpoint hitbox count equals 30.
- `liv026-delay-processor-input-unused` remains preserved as non-required evidence.
- False hitbox count equals 28.
- Wrong-route/invalid behavior is preserved for wrong distinct `liv026-*` pairs.
- False hitboxes do not count as valid completion routes.
- False hitboxes are excluded from hints.
- Cable behavior is unchanged.
- Checklist behavior is unchanged.
- Scoring behavior is unchanged.
- Custom scroll host behavior is unchanged.
- Stack guard behavior is unchanged.
- Processor-deco cleanup behavior is unchanged.
- Browser smoke passes before and after the data-only manifest pass.

## Stop Conditions

Stop conversion immediately if any of these occur:

- Route IDs, endpoint IDs, route count, or route family semantics mismatch the snapshot.
- Stereo groups or stereo sides mismatch the snapshot.
- Baked true hitbox count is not 31.
- Required endpoint hitbox count is not 30.
- `liv026-delay-processor-input-unused` is removed, ignored, or treated as a required route endpoint without explicit review.
- False hitbox count is not 28.
- False endpoints become hinted.
- A false route counts toward completion.
- Wrong distinct `liv026-*` pairs no longer draw invalid red routes.
- Score, checklist, cable, scroll, label, stack-guard, or processor-deco behavior regresses.

## Readiness Gate

Use the read-only gate before any controlled manifest pass:

```bash
node tools/liv026_manifest_readiness_check.mjs
```

The gate confirms that the preservation evidence is internally complete and that no runtime LIV-026 source or normalized manifest exists yet.

## Recommended Next Step

If the readiness gate passes, the next step may be a controlled data-only source-manifest pass for LIV-026. That pass should still keep LIV-026 `needs-review` until browser smoke and parity checks prove behavior preservation.
