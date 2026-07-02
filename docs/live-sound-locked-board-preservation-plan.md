# Live-Sound Locked Board Preservation Plan

## Purpose

This plan protects complex live-sound patch boards from being treated as ordinary source-manifest candidates. LIV-019, LIV-020, LIV-023, and LIV-026 have clear route evidence, but they also have locked renderer behavior, custom hitbox handling, false/trap jack behavior, scroll/cable/label rules, or finalizer scripts that must be preserved before any source JSON manifest is created.

The goal is behavior parity first, metadata migration second.

## Protected Boards

### LIV-019: Drum Inputs, IEM Sends and FX Returns

- Route count: 21 required routes.
- Stereo groups: 5 groups: drum overheads, reverb send, delay send, reverb return, and delay return.
- False/trap hitbox behavior: launch data lists forbidden examples for swapped overheads, wrong IEM sends, wrong FX sends, and swapped FX returns, but canonical trap metadata has not been created yet.
- Custom renderer/lock scripts: LIV-019 uses locked scroll shell, overlay lock, FOH label locks, final hitbox lock, stagebox 8-input lock, clean finalizer, and native cable mode kit.
- Preserve before manifest creation:
  - 8-input stagebox behavior.
  - Locked FOH aux/bus/input labels.
  - Final hitbox lock behavior and expected `70/70` lock coverage.
  - Native cable top-layer behavior and anchor resolution from locked hitbox centers.
  - Scroll shell behavior and no vertical-wheel-to-horizontal drift.
  - Existing checklist and stereo-pair behavior.
- Why it remains needs-review: route evidence is clear, but the board has significant lock/finalizer history and source-manifest work could easily disturb cable, scroll, hitbox, or label behavior.
- Recommended future conversion approach: create a parity checklist from the LIV-019 audit and handoff docs, write a manifest only after a browser smoke confirms the current locked board behavior, then compare source-manifest output against the locked renderer before enabling it.

### LIV-020: Main PA + IEM Monitor Feed

- Route count: 19 required routes.
- Stereo groups: 7 PA route families: main-to-crossover, crossover high/mid/low to amps, and high/mid/low amps to line-array inputs.
- False/trap hitbox behavior: 113 `liv020-bad-*` false hardware hitboxes and 113 curated bad route pairs. False jacks remain visually neutral/hidden before interaction and allow invalid red-cable feedback without counting toward completion.
- Custom renderer/lock scripts: LIV-020 uses locked layout width, gear lock, label locks, hitbox layout lock, neutral jack-ring normalization, bad-jack availability updates, custom route decision logic, and a custom vertical layout.
- Preserve before manifest creation:
  - Locked compact layout and responsive X scaling.
  - 38 real generated jacks and all label/hitbox locks.
  - 113 false hitboxes and curated bad route pairs.
  - Neutral false-jack presentation before interaction.
  - Hint exclusions for false jacks.
  - PA stereo-pair completion behavior and mono aux-to-IEM behavior.
- Why it remains needs-review: route evidence is clear, but false-jack and bad-route behavior are renderer-specific and must be represented or deliberately preserved before manifest conversion.
- Recommended future conversion approach: first define how LIV-020 false hitboxes and bad route pairs map into canonical puzzle metadata, then create a manifest with explicit parity tests for hints, wrong-route feedback, score/completion, and cable persistence.

### LIV-023: Monitor Console: Vocal Insert, Stereo IEM, and 3-Way PA

- Route count: 15 required routes.
- Stereo groups: 6 groups: keyboard DI to stagebox, Aux 1 to IEM A, main to crossover, and crossover high/mid/low to amps.
- False/trap hitbox behavior: 101 `liv023-false-*` false hitboxes covering unused stagebox, console, insert, aux, bus, and alternate patch points. Hints exclude false nodes, and broad invalid-route behavior lets wrong attempts render without counting toward completion.
- Custom renderer/lock scripts: LIV-023 uses custom scroll host behavior, legacy masking, rack-zone visual layout, exported gear/label/good-hitbox/false-hitbox layouts, and multiple dev layout tools.
- Preserve before manifest creation:
  - 30 good hitboxes and 101 false hitboxes.
  - Legacy mask behavior and custom rack layout.
  - Gear placement, labels, and exported layout positions.
  - Broad invalid-route behavior for `liv023-*` pairs.
  - Insert send/return direction behavior.
  - Stereo IEM and PA stereo-pair checklist behavior.
- Why it remains needs-review: route evidence is clear, but the board is a custom advanced capstone with large false-hitbox coverage and broad invalid-route behavior.
- Recommended future conversion approach: create a source manifest only after false-hitbox semantics are modeled, then run before/after browser smoke tests for insert direction, IEM pair completion, PA pair completion, false-jack neutrality, and hint exclusions.

### LIV-026: Full Zone Processing

- Route count: 15 required routes.
- Stereo groups: 6 groups: main-to-system, system-to-crossover, high-to-amp, mid-to-amp, low-to-amp, and delay-to-amp.
- False/trap hitbox behavior: 28 `liv026-false-*` false hitboxes. False jacks are transparent/neutral before interaction, excluded from hints, and supported by broad invalid-route behavior for wrong `liv026-*` pairs.
- Custom renderer/lock scripts: LIV-026 uses a custom scroll host, baked true hitboxes, baked false hitboxes, stack guard, processor-deco cleanup, visible XLR/VU/tape-label decorations, and invalid red-cable persistence behavior.
- Preserve before manifest creation:
  - 1400 x 1260 complex-zone board layout.
  - 31 baked true hitboxes, including the unused layout hitbox.
  - 28 baked false hitboxes and their neutral styling.
  - Stack guard for jack, false-jack, and cable layers.
  - Processor decorative cleanup for non-gameplay SUB/FILL modules.
  - Broad invalid-route behavior and hint exclusions.
  - Main/system/crossover/amp stereo-pair checklist behavior.
- Why it remains needs-review: the current board is clear and playable, but its true/false hitbox baking, stack management, processor-deco cleanup, and invalid-route behavior must be preserved exactly before source-manifest work.
- Recommended future conversion approach: produce a parity spec from the audit, then create a manifest only when true hitboxes, false hitboxes, stack behavior, processor decorations, hints, wrong routes, and completion behavior can be validated before and after conversion.

## Shared Locked Board Conversion Checklist

Before creating a source manifest for any locked board:

- Capture route evidence from renderer and launch data.
- Capture good hitbox evidence, including generated and baked hitboxes.
- Capture false/trap hitbox evidence and any curated bad-route pairs.
- Preserve wrong-route behavior, including invalid red cables and non-completion semantics.
- Preserve hint exclusions so false/trap jacks are not revealed by Show Hints.
- Preserve cable, scroll, label, stack, and finalizer behavior.
- Validate score and completion behavior before and after conversion.
- Run browser smoke tests before and after conversion.
- Do not convert to a manifest unless behavior parity is explicitly defined.

## Workflow Gate

`tools/signal-flow-puzzle-metadata-tool.js report` should classify these levels as `preservation-plan-required` / `locked-needs-review`, not ordinary source-manifest candidates. They can remain visible in coverage gaps, but they should not be used as apply-ready instructions or quick manifest work.

Future promotion requires:

1. A board-specific parity checklist derived from the source-route audit.
2. A proposed manifest strategy for required routes, good hitboxes, false/trap hitboxes, and renderer-specific behavior.
3. Browser smoke evidence that the current locked board behavior is understood.
4. A reviewed implementation plan that preserves gameplay before source-manifest creation begins.
