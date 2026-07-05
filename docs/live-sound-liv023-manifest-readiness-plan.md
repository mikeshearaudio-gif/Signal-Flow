# LIV-023 Source Manifest Readiness Plan

## Scope

This is a planning and readiness document only. It does not create, normalize, or integrate a runtime source manifest for LIV-023.

Do not create either runtime manifest during this readiness stage:

- `data/live-sound/boards/liv023.json`
- `data/live-sound/boards/normalized/liv023.normalized.json`

The source of truth is the current locked LIV-023 board behavior captured in `audit/liv023-preservation-snapshot/`, plus `docs/live-sound-liv023-source-route-audit.md`, `docs/live-sound-locked-board-conversion-plan.md`, and the existing curriculum metadata in `data/puzzle-metadata/live-sound.json`. Any future manifest must conform to the existing board, not the other way around.

## Required Future Manifest Content

Any future LIV-023 source manifest must preserve:

- 15 required routes.
- 6 stereo groups.
- 30 good hitboxes.
- 101 false hitboxes.
- Broad invalid `liv023-*` route behavior as non-completing behavior/evidence.
- False hitboxes excluded from hints.
- Custom scroll host behavior.
- Legacy masking behavior.
- Gear, label, good-hitbox, false-hitbox, and gear-layer layout exports.
- Cable, checklist, scoring, hint, completion, and browser-smoke behavior.

Evidence files:

- `audit/liv023-preservation-snapshot/routes.json`
- `audit/liv023-preservation-snapshot/stereo-groups.json`
- `audit/liv023-preservation-snapshot/good-hitboxes.json`
- `audit/liv023-preservation-snapshot/false-hitboxes.json`
- `audit/liv023-preservation-snapshot/wrong-route-behavior.json`
- `audit/liv023-preservation-snapshot/locked-behavior.json`

## Future Manifest Structure

A future controlled source manifest should include only evidence-backed board data:

- `levelId`, title, and brief.
- `environment`.
- Required routes from `routes.json`.
- Stereo groups from `stereo-groups.json`.
- Gear/assets where supported by renderer and layout evidence.
- Good hitboxes from `good-hitboxes.json`.
- False/trap hitboxes, or preservation references if the current board schema cannot safely represent all false-hitbox behavior.
- Wrong-route/invalid-route behavior references from `wrong-route-behavior.json`.
- Puzzle/curriculum metadata copied from the LIV-023 entry in `data/puzzle-metadata/live-sound.json`.
- Preservation/audit references to this snapshot and the source-route audit.

The manifest must not rename route IDs, endpoint IDs, stereo group IDs, or hitbox keys for neatness.

## Parity Checks

Before any future LIV-023 manifest can be committed under `data/live-sound/boards/`, all of these checks must pass:

- Route count equals 15.
- Stereo group count equals 6.
- Good hitbox count equals 30.
- False hitbox count equals 101.
- Route IDs and endpoint IDs match `routes.json`.
- Stereo group route IDs match `stereo-groups.json`.
- False hitboxes do not count as valid completion routes.
- False hitboxes are excluded from Show Hints.
- Broad invalid `liv023-*` route attempts remain non-completing wrong routes.
- Cable behavior is unchanged.
- Checklist and stereo-pair completion semantics are unchanged.
- Scoring behavior is unchanged.
- Custom scroll host remains active.
- Legacy mask remains active.
- Gear and label placement are unchanged.
- Browser smoke passes before and after the data-only manifest pass.

## Stop Conditions

Stop any future conversion immediately if:

- Route count, route ID, endpoint ID, or route family differs from the snapshot.
- Stereo group count or group membership differs from the snapshot.
- Good hitbox count is not 30.
- False hitbox count is not 101.
- Any false hitbox appears as a valid hint endpoint.
- Any false route counts toward completion.
- Wrong-route red cable behavior changes.
- Checklist or stereo-pair completion behavior changes.
- Score behavior changes.
- Cable layer, scroll host, label placement, gear placement, or legacy mask behavior changes.
- Browser smoke shows a regression.

## Readiness Gate

`tools/liv023_manifest_readiness_check.mjs` is the read-only gate for this stage. It validates the preservation snapshot and confirms that no LIV-023 runtime source manifest exists yet.

If the gate passes, the next safe step is a separate controlled data-only task to create `data/live-sound/boards/liv023.json` and its normalized manifest while comparing every route, stereo group, hitbox, false-hitbox, and locked behavior expectation against this snapshot.
