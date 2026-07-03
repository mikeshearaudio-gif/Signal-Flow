# Live-Sound Metadata Rollout Status

## Current Milestone Summary

The ordinary live-sound metadata and source-manifest rollout is complete for all safe ordinary patch-board candidates in the current roadmap target set.

Current report state:

- Metadata-backed JSON levels: 22
- Coverage: 27.8%
- Ordinary recommended next batch: none
- Live-sound roadmap targets still missing metadata: 4
- Remaining missing roadmap targets are locked/preservation-required only.

`data/puzzle-metadata/live-sound.json` currently validates with:

- Levels in batch map: 15
- Apply-ready levels: 11
- Needs-review levels: 4

`apply-map` remains read-only/dry-run only. The dry run now reports all ordinary apply-ready entries as already having source JSON and metadata. The only skipped live-sound batch entries are the locked needs-review boards.

## Completed Source-Manifest-Backed Levels

### Initial / Earlier Completed

- LIV-002
- LIV-003
- LIV-006
- LIV-007
- LIV-009
- LIV-010
- LIV-012
- LIV-025
- LIV-029
- LIV-032
- LIV-034

### Batch Completed

- LIV-011
- LIV-015
- LIV-016
- LIV-018
- LIV-021
- LIV-028
- LIV-030
- LIV-033
- LIV-037
- LIV-038
- LIV-039

## Locked / Preservation-Required Boards

These boards remain protected. Do not promote them, create source manifests for them, or treat them as ordinary manifest candidates until preservation parity is defined and reviewed.

Reference documents:

- `docs/live-sound-locked-board-preservation-plan.md`
- `docs/live-sound-locked-board-conversion-plan.md`
- `docs/live-sound-liv019-source-route-audit.md`
- `docs/live-sound-liv020-source-route-audit.md`
- `docs/live-sound-liv023-source-route-audit.md`
- `docs/live-sound-liv026-source-route-audit.md`

### LIV-019

LIV-019 remains protected because it has locked custom scroll, overlay, FOH label, hitbox, stagebox, finalizer, and native cable behavior. Its route evidence is clear, but source-manifest work must preserve the 8-input stagebox behavior, locked cable-anchor behavior, existing checklist and stereo-pair semantics, and the handoff constraints around native cable rendering.

No source manifest should be created until a preservation checklist confirms behavior parity.

### LIV-020

LIV-020 remains protected because it has locked layout width, gear locks, label locks, hitbox locks, neutral jack-ring handling, custom bad-jack availability, and custom route-decision logic. It also has substantial false/trap behavior: 113 false hitboxes and 113 curated bad route pairs.

No source manifest should be created until false-jack behavior, bad-route behavior, hint exclusions, score/completion behavior, and cable persistence are represented or explicitly preserved.

### LIV-023

LIV-023 remains protected because it has custom scroll behavior, legacy masking, exported gear/label/good-hitbox/false-hitbox layouts, and broad invalid-route behavior. It includes 30 good hitboxes and 101 false hitboxes, plus route/checklist semantics for source inputs, insert direction, stereo IEM, and a 3-way PA chain.

No source manifest should be created until false-hitbox semantics, broad wrong-route behavior, hint exclusions, labels, scroll, and checklist behavior have parity requirements.

### LIV-026

LIV-026 remains protected because it uses a custom complex-zone renderer, baked true hitboxes, baked false hitboxes, stack guard, processor decorative cleanup, visible rack decorations, and invalid red-cable persistence behavior. It includes 28 false hitboxes and six stereo groups across the full zone-processing system.

No source manifest should be created until true/false hitbox baking, stack behavior, processor decorations, broad invalid-route behavior, hint exclusions, and completion/checklist semantics can be preserved exactly.

## Current Workflow Rules

- Actual route evidence is the source of truth.
- Metadata conforms to existing boards and route evidence, not the reverse.
- Locked boards require preservation planning before source manifests.
- `apply-map` remains dry-run only; `--write` is not implemented.
- Renderer integration remains paused.
- Metadata rollout must not change gameplay, routes, hitboxes, scoring, hints, gear placement, completion behavior, layouts, traps, false jacks, or locked board behavior.

## Next Recommended Phases

1. Use `docs/live-sound-locked-board-conversion-plan.md` to plan preservation-safe conversion work for LIV-019, LIV-020, LIV-023, and LIV-026.
2. Optional report/tool polish if the next planning pass needs more precise locked-board or environment-level status output.
3. Future universal metadata batches for non-live-sound environments.
4. Renderer integration only after metadata and normalization behavior remain stable.

## Resume Checklist

Before starting future work:

1. Run `node tools/signal-flow-puzzle-metadata-tool.js report`.
2. Confirm ordinary recommended next batch is still `none`.
3. Confirm preservation-required boards are still LIV-019, LIV-020, LIV-023, and LIV-026.
4. Confirm `apply-map --dry-run` remains read-only and skips locked needs-review boards.
5. Do not begin renderer work or locked-board manifest conversion without a preservation parity plan.
