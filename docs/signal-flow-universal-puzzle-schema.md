# Signal Flow Universal Puzzle Schema

This document proposes a universal curriculum metadata contract for every Signal Flow environment. It is not a renderer contract and does not replace route, layout, hitbox, scoring, or asset data.

## Recommended Top-Level Object

Use `curriculum` as the long-term universal top-level object:

```json
{
  "curriculum": {
    "environment": "live-sound",
    "levelId": "LIV-029",
    "puzzle": {}
  }
}
```

Why `curriculum`:

- It separates teaching intent from route/task mechanics and renderer layout.
- It can contain a `puzzle` object for puzzle boards, but can also support diagnosis, IR matching, build-room, or game/music tasks without pretending every level is a patch puzzle.
- It lets existing live-sound `puzzle` objects remain as a compatibility layer during migration.

Compatibility rule: existing top-level `puzzle` metadata remains valid for live-sound board JSON until those manifests are migrated or wrapped into `curriculum.puzzle`.

## Object Boundaries

Universal curriculum metadata:

- Scenario, objective, difficulty, concept tags, prerequisite concepts, assessed concepts, and learning explanation.

Route/patch/task metadata:

- Valid routes, required tasks, wrong attempts, trap route definitions, task visibility, diagnostic faults, and completion conditions.

Render/layout metadata:

- Gear positions, hitboxes, labels, SVG/canvas geometry, cable anchors, z-index, visual state, and UI layout.

Environment-specific metadata:

- Live-sound patch endpoints, IR target spaces, game/music audio assets, build-room inventory categories, post-production clip contexts, or diagnosis answer choices.

The universal schema should reference environment-specific data where needed, but should not own renderer layout.

## Proposed Shape

```json
{
  "curriculum": {
    "schemaVersion": 1,
    "environment": "live-sound",
    "levelId": "LIV-029",
    "taskMode": "signal-type",
    "scenario": "You are wiring a panel discussion system.",
    "objective": "Route wireless receiver audio to the console and distribute PA, monitor, and press feeds.",
    "constraints": [
      {
        "id": "rf-is-not-audio",
        "text": "RF antenna jacks are not console audio outputs.",
        "concept": "rf-vs-audio",
        "appliesTo": ["wireless", "signal-direction"]
      }
    ],
    "taskVisibility": "full",
    "difficulty": 4,
    "conceptTags": ["wireless", "rf-vs-audio", "press-feed", "monitor-aux", "main-pa", "signal-direction"],
    "prerequisiteConcepts": ["signal-direction", "input-vs-output"],
    "assessedConcepts": ["rf-vs-audio", "press-feed", "monitor-aux"],
    "completionExplanation": "Receivers convert RF to audio, and the console distributes audio to PA, monitor, and press buses.",
    "educationalFeedback": {
      "defaultWrongAttempt": "Trace the signal type first."
    },
    "wrongAttempts": [],
    "environmentExtensions": {
      "liveSound": {
        "routeListVisibility": "full",
        "trapRoutes": []
      }
    }
  }
}
```

## Required Fields

- `schemaVersion`: Integer schema version.
- `environment`: Stable environment key such as `live-sound`, `recording-studio`, `broadcast`, `post-production`, `game-music`, `ir`, `diagnosis`, or `build-room`.
- `levelId`: Stable level identifier.
- `taskMode`: Universal task type. Existing live-sound `puzzleMode` can map to this.
- `scenario`: Non-empty production or learning context.
- `objective`: Non-empty player-facing success goal.
- `taskVisibility`: How much of the task is visible before hints.
- `difficulty`: Integer from 1 through 7.
- `conceptTags`: Non-empty array of concept IDs from the shared vocabulary.

## Optional Fields

- `constraints`: Array of concept-backed task constraints.
- `routeListVisibility`: Compatibility alias for live-sound patch boards.
- `completionExplanation`: Explanation shown or logged after success.
- `educationalFeedback`: Feedback lookup for wrong attempts.
- `wrongAttempts`: Universal wrong-attempt definitions.
- `trapRoutes`: Compatibility alias for live-sound route traps.
- `prerequisiteConcepts`: Concepts expected before the level.
- `assessedConcepts`: Concepts assessed by the level.
- `environmentExtensions`: Object keyed by environment for specialized fields.

## Task Mode Enum

Initial accepted values:

- `basic-build`
- `constrained-build`
- `trap-recognition`
- `troubleshooting`
- `signal-type`
- `redundancy-failure`
- `capstone-system`
- `diagnostic-match`
- `asset-selection`
- `room-match`
- `sequence-order`

## Visibility Enum

Initial accepted values:

- `full`
- `partial`
- `objective-only`
- `hidden-until-hint`
- `diagnostic-partial`

## Feedback and Wrong Attempts

Use `educationalFeedback` for reusable messages and `wrongAttempts` for universal wrong choices. Live-sound `trapRoutes` can remain inside `environmentExtensions.liveSound.trapRoutes` or as a compatibility alias during migration.

Wrong attempts should teach a real misconception, not arbitrary failure:

- wrong signal type
- wrong destination
- wrong bus or feed
- unsafe level/signal mismatch
- missing prerequisite diagnostic step
- incorrect environmental/acoustic match

## Environment-Specific Extensions

Examples:

- `environmentExtensions.liveSound.routeListVisibility`
- `environmentExtensions.liveSound.trapRoutes`
- `environmentExtensions.ir.targetSpace`
- `environmentExtensions.ir.acceptableAdjacentSpaces`
- `environmentExtensions.gameMusic.assetFamily`
- `environmentExtensions.buildRoom.requiredGearCategories`

Extensions must not redefine universal fields with incompatible meanings.

## Migration Notes

The current live-sound board JSON uses top-level `puzzle`. That should remain supported while the schema and tooling mature. A later migration can wrap existing objects as `curriculum.puzzle` or transform `puzzleMode` to `taskMode`.

No existing renderer should assume `curriculum` is available until batch coverage, validation, and normalized preservation are proven.
