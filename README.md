# Signal Flow

Educational audio-routing game for learning signal flow, patching, live sound, broadcast, post-production, game audio, diagnosis workflows, and IR/reverb-space listening.

## Current Launch Target

Latest active entry point: **v1.41.18 - navigation wrapper with distributed IR levels**

This repository import started from the local v1.41.16 handoff package assembled on May 5, 2026, then added the v1.41.18 wrapper and distributed IR level files.

- Playable entry point: `index.html`
- Active wrapper: `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`
- Full embedded game dependency: `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- Local launcher: `index.html`
- Launch and handoff docs: `docs/`
- Audio assets: `assets/audio/`
- IR room images: `assets/IR images/`
- Board art and icons: `assets/board-art/`, `assets/icons/`, `assets/ui-goals/`

Key current milestone:

- PST-103 is now a normal level flow, not a subgame.
- PST-103 uses a subjective IR scoring system instead of binary correct/incorrect validation.
- The IR level uses a target/example room image, 24 labeled IR selections, Flute Solo preview audio, educational feedback, and score values of 100 / 50 / 25.
- Plate and Reverse remain selectable but always score 1 star / 25 points and are never best-fit target spaces.

## Running Locally

Open `index.html` in a browser, or open `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html` directly.

For a local server:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://127.0.0.1:8000/
```

## Repository Notes

The original handoff zip archives are intentionally not committed because some exceed GitHub's 100 MB per-file limit. Their extracted contents are included instead.

Avoid relying on a single huge embedded HTML forever. The embedded builds were useful as transfer workarounds, but the repo should move toward normal source + assets.

Generated one-off patch scripts, pre-patch snapshots, renderer backups, Python cache, OS metadata, and local archive files are intentionally ignored. Keep active code, reusable patch modules, docs, audit summaries, and assets in the repo.

Future preferred structure:

```text
Signal-Flow/
  index.html
  src/
  assets/
    audio/
    ir-spaces/
  docs/
    build-notes/
    handoff/
    manifests/
    rules/
```

## Large Assets

This import does not require Git LFS, but future single assets over 100 MB should use Git LFS or GitHub Releases.

```bash
git lfs install
git lfs track "*.mp3" "*.wav" "*.png" "*.jpg" "*.jpeg"
git add .gitattributes
```

## Important Gameplay Rules

- The v1.40.62 board build rules checklist is included in `docs/source_context/` and should remain part of future acceptance checks.
- IR rules and asset manifests are included in `docs/`.
- Build notes history is included in `docs/build_notes_history/`.
