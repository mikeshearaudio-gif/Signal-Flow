# LIV-020 Source Manifest Readiness Plan

## Scope

This is a planning and readiness document only. It does not create, normalize, or integrate a runtime source manifest for LIV-020.

Do not create either runtime manifest during this readiness stage:

- `data/live-sound/boards/liv020.json`
- `data/live-sound/boards/normalized/liv020.normalized.json`

The source of truth is the current locked LIV-020 board behavior captured in `audit/liv020-preservation-snapshot/`, plus `docs/live-sound-liv020-source-route-audit.md`, `docs/live-sound-locked-board-conversion-plan.md`, and the existing curriculum metadata in `data/puzzle-metadata/live-sound.json`. Any future manifest must conform to the existing board, not the other way around.

## Required Future Manifest Content

Any future LIV-020 source manifest must preserve:

- 19 required routes.
- 7 stereo groups.
- 38 good hitboxes.
- 113 false hardware layout records.
- 109 unique false hardware keys.
- Duplicate `liv020-bad-bus-out-01` through `liv020-bad-bus-out-04` false-layout records as preservation evidence.
- 113 curated bad-route pairs.
- False hardware layout records and curated bad-route pair logic as separate concepts.
- Red invalid routes as non-completing behavior.
- False jacks excluded from Show Hints.
- Scroll, layout, label, hitbox, cable, checklist, completion, and scoring behavior.

Evidence files:

- `audit/liv020-preservation-snapshot/routes.json`
- `audit/liv020-preservation-snapshot/stereo-groups.json`
- `audit/liv020-preservation-snapshot/good-hitboxes.json`
- `audit/liv020-preservation-snapshot/false-hitboxes.json`
- `audit/liv020-preservation-snapshot/bad-route-pairs.json`
- `audit/liv020-preservation-snapshot/wrong-route-behavior.json`
- `audit/liv020-preservation-snapshot/locked-behavior.json`

## Critical Data Separation

LIV-020 has two different invalid-route evidence streams:

- `false-hitboxes.json` preserves visible/clickable false hardware jack geometry and labels from `LIV020_BAD_HITBOX_LAYOUT`.
- `bad-route-pairs.json` preserves curated invalid route logic between endpoint IDs from `LIV020_BAD_ROUTE_PAIRS`.

Both currently contain 113 records, but they are not interchangeable. A future manifest must not map false hardware layout records to bad-route pairs by array index.

## Future Manifest Structure

A future controlled source manifest should include only evidence-backed board data:

- `levelId`, title, and brief.
- `environment`.
- Required routes from `routes.json`.
- Stereo groups from `stereo-groups.json`.
- Gear/assets where supported by renderer and layout evidence.
- Good hitboxes from `good-hitboxes.json`.
- False hardware hitboxes from `false-hitboxes.json`, or preservation references if the current board schema cannot safely represent all false hardware behavior.
- Curated bad route pairs from `bad-route-pairs.json`, or preservation references if the schema cannot safely represent them without changing gameplay.
- Wrong-route/invalid-route behavior references from `wrong-route-behavior.json`.
- Puzzle/curriculum metadata copied from the LIV-020 entry in `data/puzzle-metadata/live-sound.json`.
- Preservation/audit references to this snapshot and the source-route audit.

The manifest must not rename route IDs, endpoint IDs, stereo group IDs, or hitbox keys for neatness.

## Parity Checks

Before any future LIV-020 manifest can be committed under `data/live-sound/boards/`, all of these checks must pass:

- Route count equals 19.
- Stereo group count equals 7.
- Good hitbox count equals 38.
- False hardware layout record count equals 113.
- Unique false hardware key count equals 109.
- Duplicate false-layout records for `liv020-bad-bus-out-01`, `liv020-bad-bus-out-02`, `liv020-bad-bus-out-03`, and `liv020-bad-bus-out-04` remain represented as evidence.
- Curated bad-route pair count equals 113.
- False hardware layout records and curated bad-route pairs remain structurally separate.
- Route IDs and endpoint IDs match `routes.json`.
- Stereo group route IDs match `stereo-groups.json`.
- False hardware jacks do not count as valid completion routes.
- False hardware jacks are excluded from Show Hints.
- Curated bad routes and false hardware jack interactions remain non-completing wrong routes.
- Red invalid-route cable behavior is unchanged.
- Checklist and stereo-pair completion semantics are unchanged.
- Scoring behavior is unchanged.
- Scroll, label, hitbox lock, neutral jack-ring, gear placement, and cable behavior are unchanged.
- Browser smoke passes before and after the data-only manifest pass.

## Browser-Smoke Expectations

At minimum, browser smoke should confirm:

- Board loads as `Main PA + IEM Monitor Feed`.
- One main-to-crossover stereo pair completes as expected.
- One crossover-to-amp stereo pair completes as expected.
- One amp-to-line-array stereo pair completes as expected.
- One Aux-to-IEM route completes as an individual mono route.
- A curated bad PA route draws red and does not complete.
- A curated wrong IEM route draws red and does not complete.
- A false hardware jack remains neutral before interaction.
- Show Hints does not reveal false hardware jacks.
- Score/checklist state does not reset unexpectedly after invalid attempts.

## Stop Conditions

Stop any future conversion immediately if:

- Route count, route ID, endpoint ID, or route family differs from the snapshot.
- Stereo group count or group membership differs from the snapshot.
- Good hitbox count is not 38.
- False layout record count is not 113.
- Unique false-key count is not 109.
- Duplicate false-layout records are removed, collapsed, or normalized away incorrectly.
- Curated bad-route pair count is not 113.
- Any implementation asserts or depends on index-based mapping between false layout records and bad-route pairs.
- Any false jack becomes valid or completing.
- Any false jack becomes hintable.
- Curated bad routes become valid or complete checklist rows.
- Red invalid-route behavior changes.
- Checklist or stereo-pair completion behavior changes.
- Score behavior changes.
- Cable layer, scroll behavior, label placement, gear placement, hitbox lock, or neutral jack-ring behavior changes.
- Browser smoke shows a regression.

## Readiness Gate

`tools/liv020_manifest_readiness_check.mjs` is the read-only gate for this stage. It validates the preservation snapshot and confirms that no LIV-020 runtime source manifest exists yet.

If the gate passes, the next safe step is a separate controlled data-only task to create `data/live-sound/boards/liv020.json` and its normalized manifest while comparing every route, stereo group, good hitbox, false hardware layout record, curated bad-route pair, and locked behavior expectation against this snapshot.
