# Live-Sound Next Ordinary Batch Audit

## Purpose

This audit reviews the remaining ordinary live-sound roadmap candidates after the locked-board preservation gate:

- LIV-030
- LIV-033
- LIV-037
- LIV-038
- LIV-039

Scope is read-only for gameplay and renderer behavior. This pass does not create source board manifests, change routes, add traps, edit hitboxes, alter scoring, or touch locked/preservation-required boards.

Actual source evidence is the source of truth. The batch metadata should describe the current launcher/adapter/audit evidence, not future roadmap ideas.

## Sources Inspected

- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `src/live-sound-adapter.js`
- `src/live-sound-native-renderer.js`
- `data/live-sound/boards/`
- `tools/live_sound_patch_acceptance.test.mjs`
- `audit/live-sound-board-equipment-jack-manifest.csv`
- `audit/live-sound-canonical-route-manifest.csv`
- `audit/live-sound-board-functionality-audit-2026-06-24.md`
- `audit/live-sound-remaining-board-roadmap.md`
- `audit/live-sound-asset-gap-manifest.csv`
- `docs/live-sound-puzzle-game-roadmap.md`

No source board JSON manifests currently exist for these five levels. No native renderer route specs were found for these five IDs. All five are present in the live-sound adapter allowlist and launcher data.

## LIV-030

### Title And Brief

- Current title: `Main PA amp feed`
- Current brief: patch console mains into the system processor, then patch processor outputs into main PA amplifier inputs.

### Evidence Found

- Launcher defines 5 required routes.
- Adapter allowlist includes LIV-030.
- Canonical manifest agrees with the launcher route family.
- Functionality audit marks it as planned/not built with canonical and asset planning rows.
- No source board JSON or native renderer branch was found.

### Inferred Route/Task Intent

Required route intent:

- Main L Output -> System Processor L In
- Main R Output -> System Processor R In
- System Processor L Out -> Main PA L Input
- System Processor R Out -> Main PA R Input
- Lead Vocal Mic -> Stage Box Input 1

This is a constrained main-PA processor/amplifier build. The key concept is that processor outputs feed amplifier inputs; processor inputs should not be treated as amp feeds.

### Metadata Readiness

Source route evidence is clear enough for curriculum metadata and future source-manifest planning.

### Recommended Batch Status

`apply-ready`

Rationale: launcher and canonical route evidence agree, and no locked/custom behavior was found.

## LIV-033

### Title And Brief

- Current title: `Stereo IEM send 1`
- Current brief: patch stereo aux outputs into the IEM transmitter.

### Evidence Found

- Launcher defines 6 required routes.
- Adapter allowlist includes LIV-033.
- Canonical manifest agrees with the stereo IEM plus stagebox-source routes.
- Roadmap identifies it as a signal-type stereo IEM puzzle.
- Functionality audit marks it as planned/not built and missing native spec.
- No source board JSON or native renderer branch was found.

### Inferred Route/Task Intent

Required route intent:

- FOH Aux 5 L Output -> IEM TX A Left Input
- FOH Aux 5 R Output -> IEM TX A Right Input
- Lead Vocal Mic -> Stage Box Input 1
- Keys L DI -> Stage Box Input 7
- Keys R DI -> Stage Box Input 8
- Talkback Mic -> Stage Box Input 14

This is a stereo IEM signal-type board with source-to-stagebox support routes.

### Metadata Readiness

Source route evidence is clear enough for curriculum metadata and future source-manifest planning.

### Recommended Batch Status

`apply-ready`

Rationale: launcher, roadmap, and canonical route evidence align, and no locked/custom behavior was found.

## LIV-037

### Title And Brief

- Current title: `Broadcast split`
- Current brief: patch broadcast split outputs for a recorder or stream feed.

### Evidence Found

- Launcher defines 6 required routes.
- Adapter allowlist includes LIV-037.
- Canonical manifest agrees with the broadcast split / record output route family.
- Roadmap describes a broader redundancy/failure puzzle; current launcher evidence is simpler.
- Functionality audit marks it as planned/not built and missing native spec.
- No source board JSON or native renderer branch was found.

### Inferred Route/Task Intent

Required route intent:

- Broadcast Split L -> Record Out L
- Broadcast Split R -> Record Out R
- Lead Vocal Mic -> Stage Box Input 1
- Keys L DI -> Stage Box Input 7
- Keys R DI -> Stage Box Input 8
- Talkback Mic -> Stage Box Input 14

This is a stereo broadcast/record feed board with source-to-stagebox support routes. The future roadmap can add redundancy/failure behavior later, but current metadata should stay grounded in the existing route evidence.

### Metadata Readiness

Source route evidence is clear enough for curriculum metadata and future source-manifest planning.

### Recommended Batch Status

`apply-ready`

Rationale: current route evidence is clear, no locked/custom behavior was found, and roadmap expansion can wait until after the source manifest exists.

## LIV-038

### Title And Brief

- Current title: `Talkback to monitor system`
- Current brief: route talkback into the monitor send path without feeding mains.

### Evidence Found

- Launcher defines 7 required routes.
- Adapter allowlist includes LIV-038.
- Canonical manifest agrees with the talkback, stagebox, and main-system support routes.
- Roadmap identifies it as an advanced talkback/monitor troubleshooting candidate.
- Functionality audit marks it as planned/not built and missing native spec.
- No source board JSON or native renderer branch was found.

### Inferred Route/Task Intent

Required route intent:

- Talkback Mic -> Stage Box Input 14
- Talkback Output -> In-Ear B Input
- Lead Vocal Mic -> Stage Box Input 1
- Keys L DI -> Stage Box Input 7
- Keys R DI -> Stage Box Input 8
- Main L Output -> System Processor L In
- Main R Output -> System Processor R In

This is a talkback/monitor troubleshooting board. The important constraint is keeping talkback in the monitor/communication path and out of the main PA.

### Metadata Readiness

Source route evidence is clear enough for curriculum metadata and future source-manifest planning.

### Recommended Batch Status

`apply-ready`

Rationale: launcher and canonical route evidence align, forbidden PA talkback destinations are explicit, and no locked/custom behavior was found.

## LIV-039

### Title And Brief

- Current title: `Drum Kit Stage Inputs`
- Current brief: patch stereo keyboard DIs into adjacent stagebox inputs.

### Evidence Found

- Launcher defines 6 required routes.
- Adapter allowlist includes LIV-039.
- Canonical manifest and roadmap both describe `Keyboard stereo inputs`.
- Functionality audit marks it as planned/not built and missing native spec.
- No source board JSON or native renderer branch was found.

### Inferred Route/Task Intent

Required route intent:

- Keys L DI -> Stage Box Input 7
- Keys R DI -> Stage Box Input 8
- Lead Vocal Mic -> Stage Box Input 1
- Talkback Mic -> Stage Box Input 14
- Main L Output -> System Processor L In
- Main R Output -> System Processor R In

The current launcher title appears stale or mismatched, but the launcher brief, required routes, roadmap, and canonical manifest all point to stereo keyboard stage inputs with supporting vocal, talkback, and main-system routes.

### Metadata Readiness

Source route evidence is clear enough for curriculum metadata and future source-manifest planning, with a migration note documenting the title mismatch.

### Recommended Batch Status

`apply-ready`

Rationale: route/task evidence is clear despite the title mismatch, and no locked/custom behavior was found. Future manifest work should preserve or deliberately correct the title after review.

## Batch Recommendation

Add all five levels to `data/puzzle-metadata/live-sound.json` as apply-ready batch-map entries:

- LIV-030: `apply-ready`
- LIV-033: `apply-ready`
- LIV-037: `apply-ready`
- LIV-038: `apply-ready`
- LIV-039: `apply-ready`

These statuses do not create source manifests and do not change gameplay. They mean the levels have enough evidence for future source-manifest planning. Locked boards LIV-019, LIV-020, LIV-023, and LIV-026 remain untouched and preservation-plan-required.
