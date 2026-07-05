# LIV-023 Preservation Snapshot

This package captures the current locked LIV-023 board behavior as evidence only. It is not a runtime source manifest and must not be used as `data/live-sound/boards/liv023.json`.

## Captured Evidence

- `routes.json`: 15 required routes from the active native renderer.
- `stereo-groups.json`: 6 stereo groups from active route metadata.
- `good-hitboxes.json`: 30 valid hitboxes from `audit/liv023-good-hitboxes-final.json`.
- `false-hitboxes.json`: 101 false/trap hitboxes from `audit/liv023-false-hitboxes-final.json`.
- `wrong-route-behavior.json`: broad invalid-route behavior and launcher forbidden examples.
- `locked-behavior.json`: scroll host, legacy mask, label/gear layout exports, hitbox expectations, cable behavior, and browser smoke expectations.

## Source Files Inspected

- `src/live-sound-native-renderer.js`
- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `docs/live-sound-liv023-source-route-audit.md`
- `docs/live-sound-locked-board-preservation-plan.md`
- `docs/live-sound-locked-board-conversion-plan.md`
- `audit/liv023-good-hitboxes-final.json`
- `audit/liv023-false-hitboxes-final.json`
- `audit/liv023-gear-layout-final.json`
- `audit/liv023-label-layout-final.json`
- `audit/liv023-gear-layer-layout-final.json`

## Counts

- Required routes: 15
- Stereo groups: 6
- Good hitboxes: 30
- False hitboxes: 101
- Gear layout entries: 19
- Label layout entries: 11
- Gear-layer layout entries: 19

## Locked Behavior To Preserve

- Custom scroll host class: `sf-live-native-liv023-scroll-host`
- Legacy masking layer: `sf-liv023-native-legacy-mask`
- Gear, label, good-hitbox, false-hitbox, and gear-layer exported layouts
- Broad invalid-route behavior for distinct `liv023-*` pairs that are not valid required routes
- False hitbox hint exclusion via `liv023-false-*`, `data-sf-native-false-jack="1"`, and `data-sf-native-hintable="0"`
- Route/checklist semantics for source inputs, insert direction, stereo IEM, main-to-crossover, and 3-way PA amplifier pairs

## Stop Conditions For Future Conversion

Stop any future LIV-023 source-manifest conversion if:

- Route count is not 15.
- Stereo group count is not 6.
- Good hitbox count is not 30.
- False hitbox count is not 101.
- Any route id, endpoint id, or stereo group membership differs from this snapshot.
- False hitboxes appear in hints or count toward completion.
- Broad invalid-route red-cable behavior changes.
- Scroll host, legacy mask, label placement, gear placement, cable behavior, checklist behavior, score behavior, or completion behavior changes.

## Future Use

Future manifest work should compare proposed `data/live-sound/boards/liv023.json` against this snapshot before runtime adoption. The manifest must conform to current board behavior, not the other way around.
