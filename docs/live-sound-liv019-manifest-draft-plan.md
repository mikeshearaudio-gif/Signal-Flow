# LIV-019 Source Manifest Readiness Plan

## Manifest Scope

This is a planning document only. It does not create, normalize, or integrate a runtime source manifest for LIV-019. The purpose is to define a manifest-readiness gate: whether the captured preservation evidence is complete enough for a later controlled real source-manifest creation pass.

Do not create either of these files during this planning stage:

- `data/live-sound/boards/liv019.json`
- `data/live-sound/boards/normalized/liv019.normalized.json`

The source of truth for future work is the preservation snapshot in `audit/liv019-preservation-snapshot/`, plus the locked board behavior documented in `docs/live-sound-liv019-source-route-audit.md` and `docs/live-sound-locked-board-conversion-plan.md`. A future manifest must conform to the existing board, not the other way around.

The next step is not a temporary draft manifest. The next step is a read-only readiness validation gate. If that gate passes, a later data-only task may create the real source manifest under `data/live-sound/boards/` with no renderer integration.

## Required Future Manifest Content

Any future LIV-019 source manifest must preserve:

- 21 required routes.
- 5 stereo groups.
- 70 locked good hitboxes.
- No invented canonical false/trap hitbox source; none was found for LIV-019.
- 6 launch-level forbidden/wrong-route examples captured as evidence.
- Locked scroll, label, hitbox, stagebox, cleanup, finalizer, and cable-mode behavior.
- Native cable rendering owned by `.sf-native-cables`.
- Stagebox locked as an 8-input board.

Evidence files:

- `audit/liv019-preservation-snapshot/routes.json`
- `audit/liv019-preservation-snapshot/stereo-groups.json`
- `audit/liv019-preservation-snapshot/good-hitboxes.json`
- `audit/liv019-preservation-snapshot/wrong-route-pairs.json`
- `audit/liv019-preservation-snapshot/locked-behavior.json`

## Route Families

Future manifest route content must preserve these exact route families:

- 8 drum mics to stagebox inputs 1-8.
- 5 mono FOH Aux outputs to IEM inputs 1-5.
- Bus 1/2 to stereo reverb L/R inputs.
- Bus 3/4 to stereo delay L/R inputs.
- Reverb L/R and delay L/R outputs back to FOH inputs 9-12.

Required route IDs from `routes.json`:

- `liv019-kick-to-stagebox-input-1`
- `liv019-snare-to-stagebox-input-2`
- `liv019-hi-hat-to-stagebox-input-3`
- `liv019-rack-tom-1-to-stagebox-input-4`
- `liv019-rack-tom-2-to-stagebox-input-5`
- `liv019-floor-tom-to-stagebox-input-6`
- `liv019-oh-left-to-stagebox-input-7`
- `liv019-oh-right-to-stagebox-input-8`
- `liv019-aux-1-to-iem-1`
- `liv019-aux-2-to-iem-2`
- `liv019-aux-3-to-iem-3`
- `liv019-aux-4-to-iem-4`
- `liv019-aux-5-to-iem-5`
- `liv019-bus-1-l-to-reverb-l-in`
- `liv019-bus-1-r-to-reverb-r-in`
- `liv019-bus-2-l-to-delay-l-in`
- `liv019-bus-2-r-to-delay-r-in`
- `liv019-reverb-l-out-to-foh-input-9`
- `liv019-reverb-r-out-to-foh-input-10`
- `liv019-delay-l-out-to-foh-input-11`
- `liv019-delay-r-out-to-foh-input-12`

## Stereo Groups

Future manifest stereo groups must match `stereo-groups.json` exactly:

- Drum overheads: `liv019-drum-overheads`
  - `liv019-oh-left-to-stagebox-input-7`
  - `liv019-oh-right-to-stagebox-input-8`
- Reverb send: `liv019-bus-1-to-reverb`
  - `liv019-bus-1-l-to-reverb-l-in`
  - `liv019-bus-1-r-to-reverb-r-in`
- Delay send: `liv019-bus-2-to-delay`
  - `liv019-bus-2-l-to-delay-l-in`
  - `liv019-bus-2-r-to-delay-r-in`
- Reverb return: `liv019-reverb-return`
  - `liv019-reverb-l-out-to-foh-input-9`
  - `liv019-reverb-r-out-to-foh-input-10`
- Delay return: `liv019-delay-return`
  - `liv019-delay-l-out-to-foh-input-11`
  - `liv019-delay-r-out-to-foh-input-12`

The five Aux-to-IEM routes are mono one-to-one monitor sends. Do not model them as stereo IEM groups.

## Future Manifest Fields

A future LIV-019 source manifest should follow the existing ordinary board shape used by files such as `data/live-sound/boards/liv021.json` and `data/live-sound/boards/liv028.json`, with additional preservation references because LIV-019 is locked.

Proposed high-level structure:

```json
{
  "levelId": "LIV-019",
  "environment": "live",
  "title": "Drum Inputs, IEM Sends and FX Returns",
  "brief": "Patch the full drum kit into stagebox inputs 1-8, patch five FOH aux outputs to five IEM inputs, send two stereo bus pairs to reverb and delay, then return the stereo effects to FOH input channels 9-12.",
  "processorLabel": "DRUMS / IEM / FX",
  "requiredRoutes": [],
  "forbiddenRoutes": [],
  "puzzle": {},
  "stereoGroups": [],
  "gear": [],
  "labels": [],
  "prewiredCables": [],
  "hitboxes": {
    "good": [],
    "false": []
  },
  "acceptance": {},
  "preservation": {}
}
```

### `requiredRoutes`

Populate from `audit/liv019-preservation-snapshot/routes.json`.

Each future route should preserve:

- `id`
- `fromId`
- `toId`
- `fromLabel`
- `toLabel`
- `stereoGroup`, when present
- `stereoSide`, when present

Route IDs and endpoint IDs must not be renamed for neatness.

### `forbiddenRoutes`

Do not invent new trap routes. If the existing board schema supports non-completing forbidden evidence safely, the future draft may reference the 6 launch-level examples from `wrong-route-pairs.json`.

If forbidden routes are added, they must remain non-completing and must not become Show Hints targets.

### `puzzle`

Copy or adapt the existing LIV-019 curriculum metadata from `data/puzzle-metadata/live-sound.json`.

Required curriculum intent to preserve:

- `taskMode`: `capstone-system`
- Full route visibility.
- Difficulty 5.
- Drum inputs, source-to-input routing, stagebox, aux sends, FX returns, monitor mix, stereo pairs, and multi-route reasoning.
- Completion explanation that describes drum inputs, five mono aux monitor feeds, stereo bus sends, and stereo FX returns.

Do not promote LIV-019 from `needs-review` as part of manifest drafting.

### `stereoGroups`

Populate from `audit/liv019-preservation-snapshot/stereo-groups.json`.

Each group should identify:

- group id
- left route id
- right route id
- purpose/label if the board schema can preserve it

### `gear` and `labels`

Use only gear/assets supported by the renderer audit:

- Stagebox: `hardwareAssetFor("stagebox")` / existing stagebox asset path used by the renderer.
- FOH console: `assets/live-sound/svg/hardware/16ch FOH console0.svg`.
- Drum kit: `assets/drums/svg/drum-kit-5-piece-8-hitboxes.svg`.
- IEM racks: `assets/live-sound/svg/hardware/iem-wireless-rack-front.svg`.
- Reverb/delay processor racks: `assets/live-sound/svg/hardware/power-amp-liv006-system-delay-processor.svg`.

Do not use the future manifest to move gear, labels, overlays, or FOH label locks. If layout values are included, they must be evidence-backed and compared against the locked behavior before any runtime adoption.

### `hitboxes`

Populate future `hitboxes.good` from `audit/liv019-preservation-snapshot/good-hitboxes.json`.

The draft must preserve:

- 70 locked hitboxes.
- Raw coordinate fields where possible.
- Coordinate-system notes: locked native layer pixels plus layer-relative percentages.
- Required route endpoint classification.
- Inactive or ghost endpoint classification.

Future `hitboxes.false` should remain empty unless a canonical LIV-019 false/trap hitbox source is found later. The preservation snapshot found no canonical false/trap hitbox source and no top-level puzzle trap metadata for LIV-019.

### `acceptance`

Future acceptance should assert at least:

- Route count: 21.
- Stereo group count: 5.
- Good hitbox count: 70.
- False hitbox count: 0 unless a canonical source is found and reviewed.
- Required lock scripts remain referenced by preservation notes.
- Forbidden text does not allow older/stale LIV-019 concepts to replace the current board identity.

### `preservation`

Add a preservation block or equivalent audit references if the board schema can accept non-runtime metadata without breaking validation.

Suggested content:

```json
{
  "evidenceSnapshot": "audit/liv019-preservation-snapshot/",
  "sourceRouteAudit": "docs/live-sound-liv019-source-route-audit.md",
  "conversionPlan": "docs/live-sound-locked-board-conversion-plan.md",
  "lockedBehavior": {
    "stageboxInputCount": 8,
    "hitboxLockExpected": 70,
    "hitboxLockMissingCount": 0,
    "cableLayer": ".sf-native-cables",
    "scrollShell": "src/sf-liv019-scroll-shell.js?v=6r389",
    "stageboxLock": "src/sf-liv019-stagebox-8-lock.js?v=6r404",
    "cleanFinalizerRole": "tool-cleanup-only-no-cables"
  }
}
```

If the existing board schema rejects this block, keep preservation references in documentation and readiness output instead of adding them to `data/live-sound/boards/liv019.json`.

## Readiness Gate

Before any future LIV-019 manifest can be created under `data/live-sound/boards/`, the read-only readiness gate must pass:

- Route count equals 21.
- Stereo group count equals 5.
- Good hitbox count equals 70.
- Wrong-route example count equals 6.
- Route IDs match `audit/liv019-preservation-snapshot/routes.json`.
- Route endpoint IDs match `audit/liv019-preservation-snapshot/routes.json`.
- Stereo group route IDs match `audit/liv019-preservation-snapshot/stereo-groups.json`.
- The five Aux-to-IEM routes remain mono one-to-one sends.
- Stagebox inputs 9-16 remain inactive, hidden, removed, or non-gameplay according to the existing lock behavior.
- No false/trap behavior is invented.
- The 6 launch forbidden/wrong-route examples remain non-completing if represented.
- Show Hints does not reveal invalid, inactive, ghost, or forbidden endpoints.
- Cable layer remains `.sf-native-cables`.
- Cable layer stays top-layered with z-index `2147483600`.
- Cable endpoints continue to resolve from locked DOM hitbox centers.
- Duplicate source-panel buttons remain ignored for cable anchors.
- Scroll shell behavior is unchanged.
- FOH labels and final label locks are unchanged.
- Hitbox lock still reports expected 70, applied 70, missingCount 0.
- Stagebox remains locked as an 8-input board.
- Clean finalizer remains tool cleanup only and does not draw cables.
- Patch acceptance tests pass.
- Browser smoke confirms same route, score, checklist, hint, cable, scroll, label, and completion behavior before and after manifest drafting.
- `data/live-sound/boards/liv019.json` does not already exist during readiness.
- `data/live-sound/boards/normalized/liv019.normalized.json` does not already exist during readiness.

Recommended commands for the readiness gate:

```bash
node tools/liv019_manifest_readiness_check.mjs
node tools/liv019_preservation_snapshot.mjs
node tools/signal-flow-puzzle-metadata-tool.js validate-map data/puzzle-metadata/live-sound.json
node tools/signal-flow-puzzle-metadata-tool.js apply-map data/puzzle-metadata/live-sound.json --dry-run
node tools/live_sound_puzzle_metadata_validation.test.mjs
node tools/live_sound_patch_acceptance.test.mjs
node tools/game_music_acceptance.test.mjs
node --check src/live-sound-native-renderer.js
node --check tools/live-sound-board-tool.js
git diff --check
```

Browser smoke must include:

- Kick Mic -> Stage Box Input 1.
- FOH Aux 1 Output -> IEM 1 Input.
- FOH Bus 1 Output -> Stereo Reverb L Input.
- One reverb return route.
- One delay return route.
- One launch forbidden/wrong-route example.
- Show Hints before and after a valid route.
- Completion checklist behavior for stereo groups.
- Score behavior for valid and invalid attempts.

## Controlled Real Manifest Creation Gate

If readiness passes, the next allowed implementation phase is a controlled data-only pass that creates the real source manifest directly:

- `data/live-sound/boards/liv019.json`
- `data/live-sound/boards/normalized/liv019.normalized.json`

That future pass must still avoid renderer integration, gameplay changes, route changes, hitbox changes, scoring changes, hint changes, cable changes, scroll changes, label changes, trap changes, false-jack changes, and status promotion.

The real manifest should be validated immediately against the preservation snapshot before any broader work continues.

## Stop Conditions

Stop conversion immediately if any parity check fails.

Specific LIV-019 stop conditions:

- Route count is not 21.
- Stereo group count is not 5.
- Good hitbox count is not 70.
- Any route ID changes.
- Any endpoint ID changes without a documented renderer-source reason.
- Aux-to-IEM routes are modeled as stereo pairs.
- Stagebox inputs 9-16 become valid, hintable, visible gameplay endpoints, or completion candidates.
- False/trap hitboxes are added without a canonical evidence source.
- Launch forbidden examples become valid routes or completion candidates.
- Show Hints reveals invalid, inactive, ghost, or forbidden endpoints.
- Native cables are replaced by custom stubs, pigtails, viewport overlays, or another cable layer.
- Cable endpoints stop landing on locked hitbox centers.
- Scroll, labels, stagebox lock, hitbox lock, finalizer, scoring, hints, checklist timing, or completion behavior changes.

## Optional Future Manifest Comparison Script Plan

A future comparison script would be useful after the real manifest exists. Do not implement it until a later task explicitly allows real manifest creation.

Proposed future command:

```bash
node tools/liv019_manifest_compare.mjs data/live-sound/boards/liv019.json
```

Expected read-only behavior:

- Parse the real source manifest.
- Parse `routes.json`, `stereo-groups.json`, `good-hitboxes.json`, `wrong-route-pairs.json`, and `locked-behavior.json`.
- Compare route count, route IDs, endpoint IDs, labels, route families, stereo group membership, good hitbox count, and preservation references.
- Fail if the manifest creates false/trap behavior that the snapshot does not support.
- Fail if the manifest omits the locked behavior references needed for future review.
- Print a stable JSON summary for review.

This script should not read or write runtime board files unless a later task explicitly permits it.

## Recommended Next Step

The next safe step is to run the read-only readiness gate:

```bash
node tools/liv019_manifest_readiness_check.mjs
```

If readiness passes, the following task may be a controlled real source-manifest creation pass under `data/live-sound/boards/`, still with no renderer integration and no gameplay behavior changes. Runtime adoption remains blocked until parity is reviewed and browser smoke confirms behavior before and after.
