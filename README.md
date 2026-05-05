# Signal Flow

Signal Flow is an audio-routing puzzle/training game about studio, live sound, broadcast, game-audio, and impulse-response workflows.

## Current Import

This repository import is based on the local v1.41.16 handoff package assembled on May 5, 2026.

- Playable build: `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- Local launcher: `index.html`
- Launch and handoff docs: `docs/`
- Audio assets: `assets/audio/`
- IR room images: `assets/IR images/`
- Board art and icons: `assets/board-art/`, `assets/icons/`, `assets/ui-goals/`

The original handoff zip archives are intentionally not committed because some exceed GitHub's 100 MB per-file limit. Their extracted contents are included instead.

## Running Locally

Open `index.html` in a browser, or open the HTML file inside `launch/` directly.

For a local server:

```bash
python3 -m http.server 8000
```

Then visit `http://127.0.0.1:8000/`.

## Notes For Future Builds

- Keep source files, assets, and generated builds separate where possible.
- Avoid committing large zip handoffs to git history.
- If future single assets exceed 100 MB, use Git LFS or move them to a GitHub Release.
- The v1.40.62 board build rules checklist is included in `docs/source_context/` and should remain part of future acceptance checks.
