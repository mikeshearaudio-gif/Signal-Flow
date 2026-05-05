# Signal Flow v1.41.18 — Distributed IR Levels Patch

## Purpose

Move the working subjective IR gameplay out of the one-off PST-103 prototype and distribute IR listening levels across every environment.

## Key changes

- Removes `PST-103` from the wrapper navigation list.
- Adds a dedicated IR level runner at `launch/ir-level-runner.html`.
- Adds split IR modules:
  - `src/ir-level-data.js`
  - `src/ir-scoring.js`
  - `src/ir-audio-preview.js`
- Adds 22 distributed IR level IDs across the five environment families:
  - Recording: `REC-IR-01` through `REC-IR-04`
  - Live Sound: `LIV-IR-01` through `LIV-IR-05`
  - Broadcast: `BRD-IR-01` through `BRD-IR-04`
  - Post: `PST-IR-01` through `PST-IR-05`
  - Game Audio: `GAM-IR-01` through `GAM-IR-05`
- Adds new wrapper `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html` that routes normal boards to the full game and IR boards to the IR runner.
- Updates `index.html` to launch the v1.41.18 wrapper.

## IR scoring rules

- 3 stars = 100 points
- 2 stars = 50 points
- 1 star = 25 points
- Plate and Reverse are selectable but always score 1 star / 25 points.
- Plate and Reverse are never used as target spaces.
- Scoring is forgiving and based on size, environment, and acoustic character similarity.

## Audio behavior

- The runner attempts to load `Flute Solo 1` from repo asset paths.
- If the stem is not present, it falls back to a synthesized flute-like preview so the level remains playable.
- Selection previews the chosen IR.
- Non-100 submissions play selected IR followed by target/reference IR.

## Asset paths expected

The runner searches several path variants for image/audio compatibility:

- `assets/ir-spaces/final/`
- `assets/ir-spaces/`
- `assets/images/ir/`
- `assets/audio/stems/`
- `assets/audio/`

## Validation performed

- `node --check` passed for all new JavaScript modules.
- Inline scripts in both new HTML files were extracted and syntax-checked.
