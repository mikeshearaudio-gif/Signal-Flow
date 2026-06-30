# Live Sound Puzzle Metadata Schema

Status: proposed data contract  
Scope: live-sound patch-board levels only  
Related roadmap: `docs/live-sound-puzzle-game-roadmap.md`

## Purpose

This document defines the reusable puzzle metadata model for Signal Flow live-sound patch boards. The goal is to support the global puzzle-game pivot with a stable data contract before renderer refactors or level conversions begin.

The metadata should let boards describe realistic scenarios, production objectives, intentional constraints, trap routes, educational wrong-route feedback, route-list visibility, completion explanations, and later troubleshooting states without hard-coding behavior per level.

LIV-029 currently acts as the first proof of concept for this direction. Future implementation should generalize that behavior into this metadata model rather than expanding LIV-029-specific renderer branches.

## Metadata Location

Puzzle metadata should live in each board JSON object as an optional top-level `puzzle` object:

```json
{
  "id": "LIV-029",
  "title": "Debate Panel Signal Flow",
  "routes": [],
  "puzzle": {
    "puzzleMode": "signal-type",
    "scenario": "You are wiring a debate panel.",
    "objective": "Route microphones, PA, monitor, and press feeds correctly."
  }
}
```

Normalized board JSON should preserve the same `puzzle` object without changing field names. Launcher-level inline board data should use the same shape when a board is not loaded from JSON.

Boards without a `puzzle` object are legacy boards and must keep their existing behavior.

## Required Fields

When `puzzle` exists, these fields are required:

- `puzzleMode`
- `scenario`
- `objective`
- `routeListVisibility`
- `difficulty`
- `conceptTags`

For puzzle modes that include trap or diagnostic behavior, these additional fields are required:

- `trapRoutes` is required when a board includes false/trap route attempts.
- `educationalFeedback` is required when `trapRoutes` is non-empty.
- `completionExplanation` is required for `constrained-build`, `troubleshooting`, `signal-type`, `redundancy-failure`, and `capstone-system`.

## Optional Fields

These fields are optional for all puzzle boards unless required by the mode-specific rules above:

- `constraints`
- `educationalFeedback`
- `trapRoutes`
- `completionExplanation`
- `initialPatchState`
- `lockedRoutes`
- `faults`
- `diagnosticPrompts`

## Field Definitions

### `puzzleMode`

String enum identifying the level's primary puzzle pattern.

Accepted values:

- `basic-build`
- `constrained-build`
- `trap-recognition`
- `troubleshooting`
- `signal-type`
- `redundancy-failure`
- `capstone-system`

### `scenario`

Player-facing production context. This should describe the real job, not the cable list.

Example: "You are wiring a four-person debate panel with wireless lavs, a room PA, a moderator wedge, and a press recorder feed."

### `objective`

Player-facing success goal. This may be shorter than the full route list and may hide exact endpoints on later puzzles.

Example: "Deliver every receiver audio output to the console, feed the room PA, provide the moderator monitor, and send a clean stereo press feed."

### `constraints`

Array of rule objects that define intentional limitations or conceptual boundaries.

Recommended shape:

```json
{
  "id": "rf-is-not-audio",
  "text": "RF antenna outputs cannot be patched directly into console audio inputs.",
  "concept": "rf-vs-audio",
  "appliesTo": ["wireless", "console-input"]
}
```

Fields:

- `id`: Stable string identifier.
- `text`: Player-facing or author-facing rule text.
- `concept`: Optional concept tag used by feedback and validation.
- `appliesTo`: Optional array of endpoint, equipment, or concept tags.

### `routeListVisibility`

String enum controlling how much route information the player sees.

Accepted values:

- `full`: Show all valid routes.
- `partial`: Show some route guidance, but hide at least one exact endpoint decision.
- `objective-only`: Show scenario and objective, but not the full route list.
- `hidden-until-hint`: Hide route details until the player requests hints.
- `diagnostic-partial`: Show symptoms, locked routes, or partial route state for troubleshooting levels.

### `educationalFeedback`

Object containing wrong-route feedback. Feedback should teach the misconception and suggest the reasoning path without simply revealing every remaining route.

Recommended shape:

```json
{
  "defaultWrongRoute": "Trace the signal type first: source audio, console bus, processor input, amplifier output, or speaker input.",
  "routePairs": {
    "rf-antenna-out->console-input-1": "That jack carries RF, not balanced audio. Use the receiver audio output after the wireless receiver demodulates the microphone signal."
  },
  "concepts": {
    "wrong-bus": "This destination needs a dedicated bus, not the main PA output.",
    "insert-direction-error": "Insert sends leave the console channel and insert returns come back into it."
  },
  "endpointTypes": {
    "speaker-output->line-input": "Speaker-level outputs should not be patched into line-level inputs."
  }
}
```

Resolution order should be:

1. Exact `trapRoutes` message.
2. Exact `routePairs` key.
3. Matching concept feedback.
4. Matching endpoint-type feedback.
5. `defaultWrongRoute`.

### `trapRoutes`

Array of explicit invalid route attempts that should be accepted as interactions but rejected as completion routes. Trap routes must represent real audio misconceptions.

Recommended shape:

```json
{
  "from": "rf-antenna-out",
  "to": "console-input-1",
  "concept": "rf-vs-audio",
  "severity": "teach",
  "message": "RF antenna outputs are not console audio outputs. Use the receiver audio output instead."
}
```

Required fields:

- `from`
- `to`
- `concept`
- `severity`
- `message`

Accepted severity values:

- `teach`
- `warning`
- `unsafe`
- `feedback-risk`

Accepted concept examples:

- `wrong-direction`
- `wrong-signal-type`
- `wrong-bus`
- `wrong-destination`
- `rf-vs-audio`
- `speaker-level-unsafe`
- `processor-bypass`
- `stereo-pair-error`
- `insert-direction-error`
- `feedback-risk`

Concept tags may expand over time, but every new concept should be documented and used consistently.

### `completionExplanation`

Player-facing explanation shown after successful completion. It should connect the final patch to the production goal and the core learning concept.

Example: "The wireless receivers convert RF to audio, the console distributes that audio to PA, monitor, and press buses, and each output lands on the correct downstream input."

### `difficulty`

Number representing relative curriculum complexity. Use integers from `1` to `7` unless a future curriculum pass defines a different scale.

Suggested scale:

- `1`: Single-route or nearly single-concept build.
- `2`: Simple stereo or simple monitor build.
- `3`: Multiple routes with visible instructions.
- `4`: Constrained build with traps or partial visibility.
- `5`: Troubleshooting or multi-subsystem build.
- `6`: Full-system puzzle with hidden/partial route reasoning.
- `7`: Capstone with multiple simultaneous production goals.

### `conceptTags`

Array of stable strings used for curriculum review, analytics, validation, and feedback grouping.

Examples:

- `signal-direction`
- `source-to-input`
- `aux-send`
- `matrix-feed`
- `main-pa`
- `monitor-wedge`
- `iem-stereo`
- `wireless`
- `rf-vs-audio`
- `press-feed`
- `broadcast-split`
- `processor-chain`
- `speaker-level`
- `insert-send-return`
- `talkback`
- `troubleshooting`

## Optional Troubleshooting Fields

These fields are reserved for later troubleshooting and diagnostic boards. They should not be required for the first metadata implementation.

### `initialPatchState`

Array of route objects that should be present when the board starts.

Use for troubleshooting levels where the player repairs an existing system instead of building from scratch.

### `lockedRoutes`

Array of route IDs or route objects that the player cannot remove. Use for known-good infrastructure or scenario constraints.

### `faults`

Array of fault objects describing the issue to diagnose.

Recommended shape:

```json
{
  "id": "talkback-in-pa",
  "symptom": "Talkback is audible in the house PA.",
  "concept": "wrong-destination",
  "expectedFix": ["remove-talkback-to-main", "patch-talkback-to-monitor-bus"]
}
```

### `diagnosticPrompts`

Array of player-facing prompts or staged hints for troubleshooting levels.

Example: "The singer hears talkback, but the audience should not. Find the route that sends talkback to the wrong destination."

## Example Metadata Object

```json
{
  "puzzleMode": "signal-type",
  "scenario": "You are wiring a four-person debate panel with wireless lavs, a room PA, a moderator wedge, and a press recorder feed.",
  "objective": "Deliver all microphone receiver audio to the console, feed the room PA, provide a moderator monitor, and send a clean stereo press feed.",
  "constraints": [
    {
      "id": "rf-is-not-audio",
      "text": "RF antenna outputs cannot be patched directly into console audio inputs.",
      "concept": "rf-vs-audio",
      "appliesTo": ["wireless", "console-input"]
    },
    {
      "id": "press-feed-not-main-pa",
      "text": "The press recorder should receive a controlled record/matrix feed, not a speaker-level or amp output.",
      "concept": "wrong-signal-type",
      "appliesTo": ["press-feed", "matrix-feed"]
    }
  ],
  "routeListVisibility": "partial",
  "educationalFeedback": {
    "defaultWrongRoute": "Trace the signal type first: source audio, console bus, processor input, amplifier output, or speaker input.",
    "routePairs": {
      "rf-antenna-out->console-input-1": "That jack carries RF, not balanced audio. Use the receiver audio output after the wireless receiver demodulates the microphone signal."
    },
    "concepts": {
      "wrong-bus": "This destination needs a dedicated bus, not the main PA output.",
      "speaker-level-unsafe": "Speaker-level outputs belong at speakers, not console or recorder inputs."
    },
    "endpointTypes": {
      "speaker-output->line-input": "That would send speaker-level signal into a line-level input."
    }
  },
  "trapRoutes": [
    {
      "from": "rf-antenna-out",
      "to": "console-input-1",
      "concept": "rf-vs-audio",
      "severity": "teach",
      "message": "RF antenna outputs are not console audio outputs. Use the receiver audio output instead."
    },
    {
      "from": "amp-left-out",
      "to": "press-recorder-left-in",
      "concept": "speaker-level-unsafe",
      "severity": "unsafe",
      "message": "A speaker-level amplifier output is unsafe for a recorder input. Use a line-level matrix or record output."
    }
  ],
  "completionExplanation": "The receivers convert RF to audio, the console distributes that audio to PA, monitor, and press buses, and each output lands on the correct downstream input.",
  "difficulty": 4,
  "conceptTags": ["wireless", "rf-vs-audio", "press-feed", "monitor-aux", "main-pa"]
}
```

## Validation Rules

Board tooling should validate these rules before a puzzle board is accepted:

- If `puzzle` is absent, skip puzzle validation.
- If `puzzle` is present, all required fields must exist.
- `puzzleMode`, `routeListVisibility`, and trap `severity` must match accepted enum values.
- `difficulty` must be an integer from `1` through `7`.
- `conceptTags` must be a non-empty array of strings.
- `scenario` and `objective` must be non-empty strings.
- `trapRoutes` must not duplicate valid completion routes.
- Every `trapRoutes` item must have feedback through its own `message` or matching `educationalFeedback`.
- Every trap route must map to a real audio misconception through `concept`.
- Show-hint data must reference valid routes only.
- Hidden route-list modes must not hide routes from completion validation.
- Optional troubleshooting fields must only reference known route IDs, endpoint IDs, or concept tags.

## Renderer Expectations

The renderer should treat `puzzle` as optional. Existing boards without `puzzle` must continue to use current behavior.

For puzzle boards, the renderer should:

- Read puzzle metadata from board data, not per-board constants.
- Render `scenario`, `objective`, `constraints`, route-list visibility, and `completionExplanation` through reusable UI surfaces.
- Resolve educational feedback through the documented feedback order.
- Treat trap routes as interactive invalid attempts that never count toward completion.
- Keep false/trap jacks visually neutral before interaction.
- Keep Show Hints limited to valid routes and valid jacks.
- Preserve existing locked board rendering, cable drawing, z-index, route validation, and scroll behavior unless a board explicitly opts into new puzzle features.

## Board-Tool Expectations

Board tooling should:

- Preserve the `puzzle` object during normalization.
- Validate schema fields and enum values.
- Report missing educational feedback for trap routes.
- Report trap routes that duplicate valid routes.
- Report traps that reference unknown endpoint IDs.
- Report puzzle boards with missing scenario, objective, difficulty, or concept tags.
- Report route-list visibility values that are unsupported.
- Generate audit output that can be reviewed by curriculum level, puzzle mode, and concept tag.

## Backward Compatibility Rules

- Absence of `puzzle` means legacy behavior.
- Existing `routes`, hitboxes, cable rendering, and completion checks remain authoritative.
- Puzzle metadata may change presentation and wrong-route feedback, but must not alter valid route definitions unless the board data itself changes.
- LIV-019 and other locked native boards must not be altered by global puzzle support unless they explicitly opt in through metadata and pass regression checks.
- Normalized JSON and launcher inline data must preserve puzzle metadata exactly enough for renderer and tooling parity.

## LIV-029 Prototype Notes

LIV-029 currently demonstrates the desired player experience: production scenario, signal-type reasoning, false/trap jacks, educational wrong-route feedback, and completion explanation. It should remain the first prototype for review.

The next implementation pass should migrate LIV-029's special behavior toward this schema without changing its gameplay. That migration should prove the generic metadata path before other levels are converted.

## What Must Not Be Hard-Coded Per Board

Future renderer work should not hard-code these by level ID:

- Feedback messages.
- Trap route lists.
- Hint exclusions for false jacks.
- Puzzle mode or route-list visibility.
- Completion explanations.
- Diagnostic start states.
- Constraint text.
- Concept tags.

Board IDs may still be used for compatibility shims during migration, but new puzzle behavior should come from data.
