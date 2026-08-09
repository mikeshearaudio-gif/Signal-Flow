# LIV-020 Preservation Snapshot

This directory captures locked LIV-020 board evidence for future source-manifest conversion work.

This is evidence only. It is not a runtime source manifest, does not create `data/live-sound/boards/liv020.json`, and does not change gameplay or renderer behavior.

## Captured Evidence

- Title: `Main PA + IEM Monitor Feed`
- Required routes: 19
- Stereo groups: 7
- Good hitboxes: 38
- False/bad visible hardware hitbox records: 113
- Unique false/bad hardware hitbox keys: 109
- Curated bad-route pairs: 113
- Launch forbidden examples: 0

## Files

- `routes.json`: active renderer route IDs, endpoints, checklist text, route family, and stereo metadata.
- `stereo-groups.json`: seven PA stereo groups plus five mono Aux-to-IEM route IDs.
- `good-hitboxes.json`: 38 valid hitboxes from `data/live-sound/dev-locks/liv020-good-hitbox-lock-v6r406.json`.
- `false-hitboxes.json`: 113 false hardware hitbox layout records from `LIV020_BAD_HITBOX_LAYOUT`.
- `bad-route-pairs.json`: 113 curated invalid route pairs from `LIV020_BAD_ROUTE_PAIRS`.
- `wrong-route-behavior.json`: invalid red-route behavior, curated pair behavior, false hardware jack behavior, and scoring/completion notes.
- `locked-behavior.json`: scroll, label, hitbox lock, false-hitbox, bad-route, hint, cable, checklist, and browser-smoke expectations.

## Source Files Inspected

- `src/live-sound-native-renderer.js`
- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `docs/live-sound-liv020-source-route-audit.md`
- `docs/live-sound-locked-board-preservation-plan.md`
- `docs/live-sound-locked-board-conversion-plan.md`
- `docs/live-sound-metadata-rollout-status.md`
- `data/live-sound/dev-locks/liv020-good-hitbox-lock-v6r406.json`
- `src/sf-liv020-good-hitbox-mapper-dev.js`
- `src/sf-liv020-bad-route-hitbox-dev.js`
- `src/sf-liv020-bad-route-native-node-bridge-dev.js`

## Important Warning

Do not conflate false hardware jack layout data with curated bad-route pair logic.

- `false-hitboxes.json` preserves visible/clickable false hardware jack geometry and labels.
- `bad-route-pairs.json` preserves curated invalid route logic between endpoint IDs.
- These arrays both currently contain 113 records, but they are separate concepts and must not be mapped by array index.

## Behavior That Must Be Preserved

- 19 required route semantics.
- Seven PA stereo groups.
- Five mono Aux-to-IEM monitor routes.
- 38 good hitboxes.
- 113 false hardware hitbox layout records.
- 113 curated bad-route pairs.
- False hardware jacks stay neutral/hidden before interaction.
- False hardware jacks stay excluded from Show Hints.
- Curated bad routes and false hardware jack interactions draw red invalid cables and do not count toward completion.
- Locked layout width, gear placement, label locks, hitbox lock, neutral jack-ring normalization, vertical scroll layout, cable behavior, checklist behavior, and scoring behavior.

## Stop Conditions For Future Conversion

- Route count differs from 19.
- Stereo group count differs from 7.
- Good hitbox count differs from 38.
- False hardware hitbox record count differs from 113.
- Curated bad-route pair count differs from 113.
- False hardware jack layout data is treated as bad-route pair logic.
- False hardware jacks become hinted or count toward completion.
- Curated bad routes become valid or complete checklist rows.
- Red invalid-route behavior, score behavior, cable behavior, scroll behavior, label behavior, or locked hitbox geometry changes.
