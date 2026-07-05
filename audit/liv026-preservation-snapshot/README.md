# LIV-026 Preservation Snapshot

This directory captures the locked LIV-026 board evidence for future source-manifest conversion work.

This is evidence only. It is not a runtime source manifest, does not create `data/live-sound/boards/liv026.json`, and does not change gameplay or renderer behavior.

## Captured Evidence

- Title: `Full Zone Processing`
- Required routes: 15
- Stereo groups: 6
- Baked true hitboxes: 31
- Required endpoint hitboxes: 30
- Unused baked true hitboxes: 1
- False hitboxes: 28
- Launch forbidden examples: 0

## Files

- `routes.json`: current active renderer route IDs, endpoints, checklist text, route family, and stereo metadata.
- `stereo-groups.json`: six stereo groups plus mono route IDs.
- `good-hitboxes.json`: baked true hitbox geometry, including the unused baked true hitbox.
- `false-hitboxes.json`: 28 transparent `liv026-false-*` hitboxes and false-jack behavior notes.
- `wrong-route-behavior.json`: broad invalid red-route behavior for wrong `liv026-*` pairs.
- `locked-behavior.json`: scroll, stack guard, false-hitbox lock, processor-deco cleanup, cable, label, and browser-smoke expectations.

## Source Files Inspected

- `src/live-sound-native-renderer.js`
- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `docs/live-sound-liv026-source-route-audit.md`
- `docs/live-sound-locked-board-preservation-plan.md`
- `docs/live-sound-locked-board-conversion-plan.md`
- `src/sf-liv026-stack-guard.js`
- `src/sf-liv026-false-jacks-lock.js`
- `src/sf-liv026-processor-deco-cleanup.js`

## Behavior That Must Be Preserved

- Custom scroll host `sf-live-native-liv026-scroll-host`.
- Renderer-owned 1400 x 1260 complex-zone layout.
- 15 required route semantics.
- Six stereo groups: `liv026-main-to-system`, `liv026-system-to-crossover`, `liv026-high-to-amp`, `liv026-mid-to-amp`, `liv026-low-to-amp`, `liv026-delay-to-amp`.
- Baked true-hitbox geometry, including `liv026-delay-processor-input-unused`.
- 28 transparent false hitboxes.
- False hitboxes stay neutral before interaction, excluded from hints, and non-completing.
- Broad invalid red-route behavior for wrong `liv026-*` pairs.
- Stack guard z-index and pointer-event behavior.
- Processor-deco cleanup for non-gameplay SUB/FILL decorations.
- Cable stacking and invalid red-cable persistence.
- Checklist and scoring behavior.

## Stop Conditions For Future Conversion

- Route count differs from 15.
- Stereo group count differs from 6.
- Baked true-hitbox count differs from 31, or required endpoint hitbox count differs from 30.
- False hitbox count differs from 28.
- False hitboxes become hinted or count toward completion.
- Broad invalid red-route behavior for wrong `liv026-*` pairs changes.
- Stack guard, scroll host, processor-deco cleanup, cable layer, label, or completion behavior regresses.
- Any future source manifest uses the older six-route delay-tower evidence instead of the current Full Zone Processing renderer evidence.
