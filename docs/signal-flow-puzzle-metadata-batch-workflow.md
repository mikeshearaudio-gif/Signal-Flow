# Signal Flow Puzzle Metadata Batch Workflow

This workflow describes how to move from one-off board metadata edits to safe batchable curriculum metadata across Signal Flow.

## Goals

- Apply metadata to many levels from mapping files.
- Validate concept tags and required curriculum fields consistently.
- Preserve existing gameplay and renderer behavior.
- Identify embedded levels that are not safe to auto-migrate.
- Compare source metadata with normalized/runtime metadata where generated files exist.

## Proposed Files

```text
data/puzzle-metadata/concept-vocabulary.json
data/puzzle-metadata/live-sound.json
data/puzzle-metadata/game-music.json
data/puzzle-metadata/post-production.json
data/puzzle-metadata/studio-recording.json
data/puzzle-metadata/broadcast.json
data/puzzle-metadata/ir.json
data/puzzle-metadata/diagnosis.json
```

Each environment map should be keyed by level ID:

```json
{
  "schemaVersion": 1,
  "environment": "live-sound",
  "levels": {
    "LIV-029": {
      "taskMode": "signal-type",
      "scenario": "Production context...",
      "objective": "Player-facing goal...",
      "taskVisibility": "full",
      "difficulty": 4,
      "conceptTags": ["signal-direction"]
    }
  }
}
```

## Batch Workflow

1. Audit coverage
   - Discover level IDs from JSON manifests, JS modules, renderer specs, adapter allowlists, and launcher HTML.
   - Report which levels have `curriculum` or compatible `puzzle` metadata.

2. Draft environment maps
   - Fill `data/puzzle-metadata/<environment>.json` from curriculum spreadsheets or generated drafts.
   - Keep render/layout fields out of the map.

3. Validate metadata
   - Require core fields.
   - Validate enum values.
   - Validate `conceptTags`, `prerequisiteConcepts`, and `assessedConcepts` against `concept-vocabulary.json`.
   - Validate environment-specific extensions without requiring renderer adoption.
   - Run the read-only batch-map validator before any future apply-map command exists:

```bash
node tools/signal-flow-puzzle-metadata-tool.js validate-map data/puzzle-metadata/live-sound.json
```

4. Preview apply-map actions
   - Run the read-only dry run to classify each level before any source files are created or edited.
   - Treat `needs-review` levels as skips until their curriculum intent is confirmed.
   - Use JSON output when batch planning needs stable machine-readable action lists.

```bash
node tools/signal-flow-puzzle-metadata-tool.js apply-map data/puzzle-metadata/live-sound.json --dry-run
node tools/signal-flow-puzzle-metadata-tool.js apply-map data/puzzle-metadata/live-sound.json --dry-run --json
```

5. Triage needs-review entries
   - Review migration notes, discovered source evidence, and the recommended next decision.
   - Keep uncertain levels in `needs-review`.
   - Promote a level to `apply-ready` only after curriculum intent and source route evidence are clear.

```bash
node tools/signal-flow-puzzle-metadata-tool.js triage data/puzzle-metadata/live-sound.json
```

6. Create manifests or apply metadata only for apply-ready entries
   - Create source manifests only when the dry run and triage show the level is ready.
   - Do not use needs-review entries as source-manifest instructions.
   - `apply-map --write` is still not implemented.

7. Normalize generated/runtime files
   - For JSON-backed live-sound boards, run the existing board bake process.
   - For future environment JSON, add equivalent non-destructive normalizers.
   - Do not rewrite JS/HTML embedded levels until a specific migration plan exists.

8. Compare source and normalized metadata
   - Confirm generated files preserve curriculum metadata exactly.
   - Report missing or divergent metadata.

9. Report blockers
   - Missing source manifests.
   - Levels still embedded in JS/HTML.
   - Unknown concept tags.
   - Levels that use board-specific renderer state.
   - Levels whose task model is not yet represented in schema.

## Tool Commands

Implemented read-only scaffold:

```bash
node tools/signal-flow-puzzle-metadata-tool.js audit
node tools/signal-flow-puzzle-metadata-tool.js coverage
node tools/signal-flow-puzzle-metadata-tool.js report
node tools/signal-flow-puzzle-metadata-tool.js validate-all
node tools/signal-flow-puzzle-metadata-tool.js validate-map data/puzzle-metadata/live-sound.json
node tools/signal-flow-puzzle-metadata-tool.js apply-map data/puzzle-metadata/live-sound.json --dry-run
node tools/signal-flow-puzzle-metadata-tool.js triage data/puzzle-metadata/live-sound.json
```

Use `report` as the planning command before batch work. It summarizes coverage, lists the recommended next live-sound batch, separates levels that need source manifests first, identifies embedded/JS-only gaps, reports whether batch maps are missing, invalid, valid, or not applicable yet, and includes a needs-review triage summary.

Use `validate-map` after drafting an environment map and before any future apply-map command. It is read-only and rejects board route/layout/render fields so batch metadata cannot accidentally become a gameplay or renderer migration.

Use `apply-map --dry-run` after validation to preview per-level actions. It validates the map first, classifies each level, and writes nothing. `--json` is available for stable automation output.

Use `triage` after dry-run to review needs-review entries. It is read-only and reports migration notes, discovered source evidence, and a recommended next decision such as `keep-needs-review`, `requires-manual-curriculum-decision`, or `requires-source-route-audit`.

Future write commands should require explicit flags:

```bash
node tools/signal-flow-puzzle-metadata-tool.js normalize-all --write
node tools/signal-flow-puzzle-metadata-tool.js apply-map data/puzzle-metadata/live-sound.json --write
```

`apply-map --write` is still not implemented.

## Safety Rules

- No command modifies files unless it includes an explicit write/apply mode.
- `apply-map` must refuse to touch JS/HTML embedded levels until a source JSON manifest exists.
- Generated files must preserve source metadata exactly.
- Unknown concept tags should fail validation unless they are first added to the vocabulary.
- Existing live-sound top-level `puzzle` metadata remains valid during the transition.

## What Remains Manual

- Creating source manifests for levels still embedded in renderer JS.
- Deciding curriculum intent for levels with outdated or ambiguous titles.
- Choosing safe trap/wrong-attempt definitions.
- Migrating existing live-sound `puzzle` objects into `curriculum.puzzle`.
- Wiring renderers to display universal metadata.
