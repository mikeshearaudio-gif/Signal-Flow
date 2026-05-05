# Signal Flow

Educational audio-routing game for learning signal flow, patching, live sound, broadcast, post-production, game audio, diagnosis workflows, and IR/reverb-space listening.

## Current handoff target

Latest active ChatGPT build: **v1.41.16 — IR normal level flow fix**

Key current milestone:

- PST-103 is now a normal level flow, not a subgame.
- PST-103 uses a subjective IR scoring system instead of binary correct/incorrect validation.
- The IR level uses a target/example room image, 24 labeled IR selections, Flute Solo preview audio, educational feedback, and score values of 100 / 50 / 25.
- Plate and Reverse remain selectable but always score 1 star / 25 points and are never best-fit target spaces.

## Recommended repository structure

```text
Signal-Flow/
  index.html
  src/
    signal-flow-v27.js
    signal-flow-v27.css
  assets/
    audio/
      music/
      sfx/
      stems/
    ir-spaces/
      final/
      retired/
  docs/
    build-notes/
    handoff/
    manifests/
    rules/
```

## Local run

For folder-based builds, run a local static server from the repo root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/index.html
```

Avoid relying on a single huge embedded HTML forever. The embedded builds were useful as transfer workarounds, but the repo should move toward normal source + assets.

## Large assets

Use Git LFS for audio/image binaries:

```bash
git lfs install
git lfs track "*.mp3" "*.wav" "*.png" "*.jpg" "*.jpeg"
git add .gitattributes
```

Then add the asset folders normally.

## Important gameplay rules

See:

- `docs/rules/IR_SYSTEM_CHECKLIST.md`
- `docs/rules/BOARD_BUILD_RULES_CHECKLIST.md`
- `docs/manifests/IR_ASSET_MANIFEST.md`
- `docs/handoff/Signal_Flow_v1_41_16_Handoff.md`
