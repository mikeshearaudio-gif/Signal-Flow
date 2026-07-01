# Signal Flow Level Data Source Audit

This audit describes where level and task data currently lives, which files are source-of-truth candidates, and what blocks a universal puzzle/curriculum metadata rollout.

## Summary

Signal Flow currently has mixed level-data ownership. Live-sound patch boards now have a small JSON manifest layer under `data/live-sound/boards`, but many live levels still have route, layout, and interaction data embedded directly in renderer JavaScript. IR/game-music style levels are defined in JavaScript data modules and the launcher HTML. Asset inventories exist as JSON manifests, but they are not curriculum manifests.

The practical migration path is to keep existing gameplay data in place, add curriculum metadata as a separate data layer, and validate/normalize that metadata in batches before any renderer consumes it.

## Live Sound

Source-of-truth candidates:

- `data/live-sound/boards/*.json`: Source board manifests for the JSON-backed patch-board rollout subset.
- `src/live-sound-native-renderer.js`: Current source for many live-sound native route definitions, hard-coded layouts, hitboxes, labels, special cases, and puzzle feedback behavior.
- `src/live-sound-adapter.js`: Live normal-level allowlist and adapter logic for mapping level IDs and panel jacks.
- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`: Embedded launcher/runtime data and the current shipped gameplay shell.

Generated/normalized/runtime files:

- `data/live-sound/boards/normalized/*.normalized.json`: Generated board-tool manifests.
- `launch/live-sound-native-renderer.js`: Runtime copy or launch-side renderer artifact.
- `launch/Signal_Flow_v1_41_17_NAV_WRAPPER.html` and `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`: Wrapper launch artifacts.

Current JSON coverage:

- JSON source manifests exist for the metadata rollout subset: LIV-002, LIV-003, LIV-006, LIV-007, LIV-009, LIV-010, LIV-012, LIV-025, LIV-029, LIV-032, and LIV-034.
- Existing canonical live-sound patch-board targets still include many levels that are embedded or partially embedded in JS/HTML.

Tools:

- `tools/live-sound-board-tool.js`: Validates and bakes live-sound board JSON.
- `tools/live_sound_puzzle_metadata_validation.test.mjs`: Validates current live-sound puzzle metadata and preservation through normalization.
- `tools/live_sound_patch_acceptance.test.mjs`: Regression checks for selected live-sound behavior and LIV-029 prototype assumptions.
- `tools/extract_live_sound_manifest.py` and `tools/build_live_sound_equipment_jack_manifest.py`: Audit/extraction helpers, not universal metadata tools.

Limitations:

- The renderer remains the true gameplay source for many live boards.
- Some layout and hitbox data is locked in board-specific renderer branches and helper scripts.
- Existing `puzzle` metadata is top-level live-sound board data, not yet universal curriculum metadata.
- Normalized files are generated, but not all live levels have source JSON manifests.

## IR / Reverb-Matching Levels

Source-of-truth candidates:

- `src/ir-level-data.js`: Defines IR lists, room metadata, image candidates, and IR level objects for recording, live, broadcast, post, and game environments.
- `src/ir-scoring.js`: Scoring logic for evaluating selected IR fit.
- `src/ir-audio-preview.js`: Audio preview behavior and generated/preview profile logic.
- `launch/ir-level-runner.html`: Standalone IR runner.
- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`: Main launcher with IR integration.

Generated/normalized/runtime files:

- No dedicated normalized IR level manifests were found.
- Image and audio assets are referenced from JS and launcher paths.

Tools:

- There is no dedicated IR metadata validator or normalizer yet.

Limitations:

- IR level definitions are embedded in JS instead of data JSON.
- The task model is not route-based, so live-sound `routeListVisibility` and `trapRoutes` need universal equivalents such as `taskVisibility` and `wrongAttempts`.

## Game / Music

Source-of-truth candidates:

- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`: Contains the main game shell, audio unlock/music behavior, and embedded runtime data.
- `tools/game_music_acceptance.test.mjs`: Regression checks for game/music audio behavior.
- `assets/audio/music/*`: Shipped music assets.

Generated/normalized/runtime files:

- No standalone JSON level manifests were found for game/music levels.
- Audio asset fallback mapping currently lives in launcher code.

Tools:

- `tools/game_music_acceptance.test.mjs`: Acceptance test only; no metadata validator.

Limitations:

- Game/music behavior is launcher-embedded and not batch-addressable as level JSON.
- No current separation exists between gameplay task data, curriculum metadata, and render/audio behavior.

## Other Environment Structures

Assets and manifests exist for several environment families:

- `assets/recording-studio/manifest.json`
- `assets/recording-studio/svg/...`
- `assets/broadcast/svg/manifest.json`
- `assets/diagnosis/svg/manifest.json`
- `assets/build-room/build-room-manifest-v4.json`
- `assets/build-room/svg/manifest.json`
- `assets/board-art/manifest.json`
- `assets/icons/individual/manifest.json`

These files are useful asset inventories, but they are not level curriculum manifests.

## Embedded Launcher Data

The main launcher HTML remains a major runtime source. It includes environment UI, audio behavior, and embedded level/runtime references. This should be treated as runtime/shipping data, not the preferred long-term metadata source.

## Current Universal Migration Blockers

- No single universal level registry exists.
- Live sound has partial JSON source coverage; other environments are mostly JS/HTML embedded.
- Existing `puzzle` metadata is validated only for live-sound board JSON.
- Concept tags have not had a shared vocabulary until this scaffold.
- Route/patch metadata is mixed with layout and renderer behavior in some renderer branches.
- Batch apply tooling does not yet exist; only read-only audit/coverage/validation is safe today.

## Recommended Near-Term Direction

Keep gameplay source files stable. Add universal curriculum metadata as an external data layer under `data/puzzle-metadata/`, validate it against `data/puzzle-metadata/concept-vocabulary.json`, then gradually wire renderers to read it after coverage and schema stability are proven.
