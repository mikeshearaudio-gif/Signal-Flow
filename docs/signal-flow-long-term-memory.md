# Signal Flow Long-Term Memory — Universal Puzzle/Curriculum Scaffold

_Last updated: 2026-07-01_

## Purpose

This file summarizes the current Signal Flow project memory, with emphasis on the recent universal puzzle/curriculum metadata scaffold. Use it as a compact handoff reference when continuing Signal Flow development in future sessions or with Codex.

Signal Flow is moving from a collection of environment-specific routing exercises into a broader educational puzzle/curriculum system. The long-term goal is to support multiple environments, including live sound, IR/reverb matching, game/music, broadcast, recording studio, post-production, diagnosis, and build-room style tasks.

The most important current design decision: the curriculum system must be universal, not live-sound-only.

---

## Current Repository/Workflow Context

- Local repo path: `/Users/mikeshear/Documents/New project/Signal-Flow_GitHub_Import`
- Main working branch: `main`
- User preference: do not create new branches unless explicitly requested.
- User runs terminal commands and pastes output back. Provide terminal-safe commands; do not ask for manual code edits.
- Commit cadence: commit meaningful checkpoints, not every small step.
- Local server commonly used:

```bash
python3 -m http.server 5174
```

- Common launcher:

```text
launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html
```

- Wrapper:

```text
launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html
```

- Active live-sound renderer:

```text
src/live-sound-native-renderer.js
```

- Live-sound board tool:

```text
tools/live-sound-board-tool.js
```

---

## High-Level Signal Flow Direction

Signal Flow should become an educational puzzle game where players learn signal flow by solving realistic production problems under constraints.

The system should support:

- realistic production scenarios
- task objectives
- concept tags
- route or task visibility modes
- constraints
- educational feedback
- wrong attempts/traps
- completion explanations
- prerequisite and assessed concepts
- environment-specific extensions
- batch validation and coverage reporting

The goal is not simply “connect A to B.” The goal is to teach why a routing choice is correct or incorrect.

---

## Important Design Pivot

The early puzzle work started in Live Sound because LIV-029 was the first prototype. That proved the model, but the user clarified that the system needs to be universal across Signal Flow.

Therefore:

- Do not continue building only live-sound board metadata by hand unless it is part of a batchable universal workflow.
- Do not add puzzle metadata one or two levels at a time as the default process.
- Prefer universal scaffolding, audit reports, metadata maps, and batch validation.
- Live-sound top-level `puzzle` metadata remains valid as a compatibility layer.
- Long-term metadata should move toward a universal `curriculum` object.

Recommended long-term shape:

```json
{
  "curriculum": {
    "schemaVersion": 1,
    "environment": "live-sound",
    "levelId": "LIV-029",
    "taskMode": "signal-type",
    "scenario": "...",
    "objective": "...",
    "constraints": [],
    "taskVisibility": "full",
    "difficulty": 4,
    "conceptTags": [],
    "prerequisiteConcepts": [],
    "assessedConcepts": [],
    "completionExplanation": "...",
    "educationalFeedback": {},
    "wrongAttempts": [],
    "environmentExtensions": {}
  }
}
```

Compatibility rule:

```text
Existing live-sound board JSON files with top-level puzzle objects remain valid until a deliberate migration wraps or maps them into curriculum.puzzle / curriculum task fields.
```

---

## Universal Scaffold Added

The universal scaffold introduced these files:

```text
docs/signal-flow-level-data-source-audit.md
docs/signal-flow-universal-puzzle-schema.md
docs/signal-flow-puzzle-metadata-batch-workflow.md
data/puzzle-metadata/concept-vocabulary.json
tools/signal-flow-puzzle-metadata-tool.js
```

No gameplay, renderer, route, hitbox, scoring, hint, layout, trap, or false-jack behavior was changed by this scaffold.

### What the scaffold does

It creates a read-only foundation for universal curriculum metadata.

Implemented tool commands:

```bash
node tools/signal-flow-puzzle-metadata-tool.js audit
node tools/signal-flow-puzzle-metadata-tool.js coverage
node tools/signal-flow-puzzle-metadata-tool.js validate-all
```

The tool is intentionally read-only. Future write commands are documented but not implemented:

```bash
node tools/signal-flow-puzzle-metadata-tool.js apply-map
node tools/signal-flow-puzzle-metadata-tool.js normalize-all
```

These future commands should require explicit write flags before modifying files.

---

## Universal Scaffold Audit Findings

The scaffold discovered mixed level-data ownership:

- Live-sound JSON source boards: 11
- Live-sound normalized board JSON: 11
- Native live renderer IDs: 19
- Live adapter/allowlist IDs: 56
- IR data module IDs: 23
- Launcher files scanned: 5
- Launcher-discovered level IDs: 79
- Asset/schema manifests: 9

Important implication:

```text
There is no single universal level registry yet.
```

Live Sound now has partial JSON source coverage, but many live levels and most other environments are still embedded in JS/HTML.

---

## Universal Metadata Boundaries

The schema must keep these layers separate:

### Universal curriculum metadata

Teaching intent:

- scenario
- objective
- difficulty
- concept tags
- prerequisite concepts
- assessed concepts
- completion explanation
- educational feedback intent

### Route/patch/task metadata

Task mechanics:

- required routes
- valid tasks
- wrong attempts
- traps
- task visibility
- diagnostic faults
- completion conditions

### Render/layout metadata

Visual/runtime layout:

- gear positions
- hitboxes
- labels
- SVG/canvas geometry
- cable anchors
- z-index
- visual state
- UI layout

### Environment-specific metadata

Specialized fields for environments:

- live-sound patch endpoints
- IR target spaces
- game/music asset families
- build-room inventory categories
- post-production clip contexts
- diagnosis answer choices

The universal curriculum schema should reference environment-specific data where needed, but should not own renderer layout.

---

## Proposed Batch Metadata Files

Future batch metadata should use environment maps under:

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

Environment maps should be keyed by level ID and contain curriculum/task metadata only, not render/layout data.

Example shape:

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

---

## Concept Vocabulary

A shared vocabulary now exists at:

```text
data/puzzle-metadata/concept-vocabulary.json
```

It includes universal and environment-specific concepts such as:

- signal-direction
- input-vs-output
- source-to-input
- console-output
- wrong-signal-type
- wrong-destination
- wrong-bus
- feedback-risk
- troubleshooting
- diagnostic-reasoning
- multi-route
- channel-order
- left-right
- stereo-pair
- gain-staging
- pre-fader
- post-fader
- patchbay-normal
- insert-direction
- phantom-power
- record-feed
- broadcast-split
- stagebox
- drum-inputs
- aux-send
- monitor-aux
- monitor-mix
- monitor-wedge
- matrix-feed
- zone-feed
- front-fill
- main-pa
- processor-chain
- amplifier
- speaker-level
- delay-tower
- wireless
- rf-vs-audio
- press-feed
- iem-stereo
- room-size
- room-material
- ambience-match
- asset-selection

Future validators should fail unknown concept tags unless the concept is first added to this vocabulary.

---

## Current Live-Sound Puzzle Metadata Status

Live-sound board metadata exists for these JSON-backed boards:

```text
LIV-002
LIV-003
LIV-006
LIV-007
LIV-009
LIV-010
LIV-012
LIV-025
LIV-029
LIV-032
LIV-034
```

Each has a source board file and a normalized generated file under:

```text
data/live-sound/boards/*.json
data/live-sound/boards/normalized/*.normalized.json
```

The live-sound validation test confirms that top-level `puzzle` metadata validates and is preserved in normalized output.

Important: These are still top-level `puzzle` objects, not yet universal `curriculum` objects. That is acceptable for now.

---

## LIV-029 Prototype Status

LIV-029 is the first playable puzzle prototype.

Identity:

```text
LIV-029 — Debate Panel Signal Flow
```

Intent:

- wireless receiver audio into console inputs
- main PA L/R feed
- speaker output routes
- press/record stereo feed
- moderator monitor wedge feed
- RF antenna traps / educational wrong-route feedback

Confirmed working through manual smoke and tests:

- correct header
- wireless receiver routes complete
- scoring increments on correct routes
- wrong routes penalize and draw red
- hints toggle
- checklist updates
- RF trap feedback exists
- layout has been cleaned up

Known note:

```text
LIV-029 may still be slightly tight visually, but it is playable and committed as a prototype checkpoint.
```

---

## Key Commits From Recent Puzzle/Curriculum Work

Known recent commits:

```text
8462838 Add live sound puzzle prototype and metadata roadmap
8b8523d Add beginner puzzle metadata boards for LIV-002 and LIV-003
3340ab5 Add early puzzle metadata boards for LIV-009 and LIV-010
0090887 Clean up LIV-029 puzzle prototype layout
6865137 Add puzzle metadata boards for LIV-006 and LIV-007
fe9232f Add puzzle metadata boards for LIV-025 and LIV-034
```

Pending or expected around this memory point:

```text
Add puzzle metadata boards for LIV-012 and LIV-032
Scaffold universal puzzle metadata system
```

Check `git log --oneline -n 12` for exact current hashes.

---

## Existing Live-Sound Rules To Preserve

Important locked behavior:

- Drag preview neutral until drop.
- Correct routes turn green after drop.
- Invalid routes turn red after drop.
- False/trap jacks are neutral before interaction.
- Show Hints reveals valid endpoints/routes only, not false/trap jacks.
- Wrong route penalties apply once per unique wrong route.
- Score cannot drop below 0.
- Hints should not unexpectedly affect score unless deliberately designed.
- Stereo-pair routes complete as a pair; one side alone does not complete the pair.
- Cable state clears when switching levels.
- Completion popup appears when all required routes complete.
- Empty board clicks should not clear the level.
- Wrapper navigation can show stale values; in-game selector owns visible state and Next navigation.

---

## Live-Sound Allowlist / Non-Patch Distinction

Patch-board allowlist:

```text
LIV-002, LIV-003, LIV-006, LIV-007, LIV-009, LIV-010, LIV-011, LIV-012, LIV-015, LIV-016, LIV-018, LIV-019, LIV-020, LIV-021, LIV-023, LIV-025, LIV-026, LIV-028, LIV-029, LIV-030, LIV-032, LIV-033, LIV-034, LIV-037, LIV-038, LIV-039
```

Non-patch levels:

```text
LIV-001, LIV-004, LIV-005, LIV-008, LIV-013, LIV-014, LIV-017, LIV-022, LIV-024, LIV-027, LIV-031, LIV-035, LIV-036, LIV-041, LIV-045, LIV-046, LIV-050
```

Do not convert non-patch levels into patch boards unless explicitly approved.

---

## Next Best Development Step

Do not continue picking board pairs manually.

Next recommended package:

```text
Make the universal metadata tool produce an actionable coverage report that drives batch work.
```

The report should group levels into:

1. `metadata-backed`
   - has source JSON and has puzzle/curriculum metadata

2. `json-backed-missing-metadata`
   - has source JSON but no puzzle/curriculum metadata

3. `embedded-only`
   - discovered in renderer/launcher/adapter/IR data but no source JSON manifest

4. `safe-batch-candidate`
   - likely safe to apply metadata map once source manifest exists or already exists

5. `manual-manifest-required`
   - embedded or ambiguous level that needs a source manifest before migration

6. `non-puzzle-or-non-patch`
   - levels that should not be converted into patch puzzles but may still get curriculum metadata later

This will reduce user burnout because it turns next steps into a generated checklist instead of requiring manual level selection.

---

## Suggested Next Codex Prompt

```text
Continue from the universal puzzle metadata scaffold.

New task: improve the read-only universal metadata tool so it produces an actionable coverage report that can drive batch work.

Do not change gameplay.
Do not change renderer behavior.
Do not edit routes, hitboxes, scoring, hints, layouts, traps, or false jacks.
Do not apply metadata maps yet.
Do not create a branch unless explicitly asked.

Goal:
Make `tools/signal-flow-puzzle-metadata-tool.js` output a clear level migration report so we stop manually selecting one or two levels at a time.

Required work:

1. Add a new read-only command:

node tools/signal-flow-puzzle-metadata-tool.js report

2. The report should group known levels into:
- metadata-backed
- json-backed-missing-metadata
- embedded-only
- safe-batch-candidate
- manual-manifest-required
- non-puzzle-or-non-patch

3. The report should include counts and level IDs for each group.

4. Use existing discovered sources:
- data/live-sound/boards/*.json
- normalized live-sound boards
- src/live-sound-native-renderer.js
- src/live-sound-adapter.js
- src/ir-level-data.js
- launch/*.html and launch/*.js

5. Preserve current commands:
- audit
- coverage
- validate-all

6. Add documentation for the report command to:
- docs/signal-flow-puzzle-metadata-batch-workflow.md

7. If safe, make the report optionally emit JSON with:

node tools/signal-flow-puzzle-metadata-tool.js report --json

8. Run checks:
- node --check tools/signal-flow-puzzle-metadata-tool.js
- node tools/signal-flow-puzzle-metadata-tool.js audit
- node tools/signal-flow-puzzle-metadata-tool.js coverage
- node tools/signal-flow-puzzle-metadata-tool.js validate-all
- node tools/signal-flow-puzzle-metadata-tool.js report
- node tools/signal-flow-puzzle-metadata-tool.js report --json
- node tools/live_sound_puzzle_metadata_validation.test.mjs
- node tools/live_sound_patch_acceptance.test.mjs
- node tools/game_music_acceptance.test.mjs
- git diff --check

Report back:
- files changed
- report groups added
- counts by group
- whether JSON output works
- tests run and results
- git status
```

---

## Persistent User Preference / Process Note

The user wants to reduce burnout by speeding up repetitive development loops. Prefer:

- batchable workflows
- generated reports
- audit-first commands
- clear commit checkpoints
- fewer manual inspection loops
- fewer board-by-board prompts
- no unnecessary branching
- no renderer changes unless the purpose is explicit
- no manual edits by the user

When possible, give Codex one scoped prompt that includes files, goals, constraints, checks, and reporting requirements.
