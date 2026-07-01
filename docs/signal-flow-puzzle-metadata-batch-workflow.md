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

4. Normalize generated/runtime files
   - For JSON-backed live-sound boards, run the existing board bake process.
   - For future environment JSON, add equivalent non-destructive normalizers.
   - Do not rewrite JS/HTML embedded levels until a specific migration plan exists.

5. Compare source and normalized metadata
   - Confirm generated files preserve curriculum metadata exactly.
   - Report missing or divergent metadata.

6. Report blockers
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
```

Use `report` as the planning command before batch work. It summarizes coverage, lists the recommended next live-sound batch, separates levels that need source manifests first, identifies embedded/JS-only gaps, and names the batch map files that still need to be created.

Future write commands should require explicit flags:

```bash
node tools/signal-flow-puzzle-metadata-tool.js normalize-all --write
node tools/signal-flow-puzzle-metadata-tool.js apply-map data/puzzle-metadata/live-sound.json --write
```

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
