# Signal Flow Handoff Summary

Last updated: 2026-05-21

Latest active local entry point: `index.html`

Current launch flow:

- `index.html`
- `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`
- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html` for the full embedded game dependency
- `launch/ir-level-runner.html` for distributed IR levels

Current handoff documents:

- `docs/HANDOFF_2026-05-19_BUILD_ROOM_V6R277_LOCK.md`
- `docs/HANDOFF_2026-05-19_LIV006_FOCUSED_REPAIR.md`
- `docs/HANDOFF_2026-05-21_LIV016_FULL_BAND_STAGEBOX_REPAIR.md`

Current repo memory:

- `docs/SIGNAL_FLOW_MEMORY.md`

Key current feature: PST-103 Convolution / IR Lab with subjective scoring. The player sees a target space image, chooses from all 24 labeled IRs, previews with Flute Solo 1, submits once, and receives 100/50/25 points with educational feedback.

Latest stabilization pass addressed crashes and missing updated GUI renders by fixing local patch/source/asset path resolution and loading the diagnosis SVG skin in the active full game launch.

Latest live-board bug pass fixed build-room and diagnosis fallback mounting, `LIV-006` terminology, `LIV-010`/`LIV-011` scrolling, source jack alignment on `LIV-002`/`LIV-025`/`LIV-026`/`LIV-028`, and `LIV-028` equipment overlap.

Latest focused repair: `LIV-006` now uses renderer-level rack placement, no external rack mover/debug outline, compact non-nested scrolling, aligned jacks, and player-facing `CROSSOVER` / `AUX INPUTS` labels. Details are in `docs/HANDOFF_2026-05-19_LIV006_FOCUSED_REPAIR.md`.

Latest Build-a-Room lock: `v6r277` is the stable shared Build-a-Room renderer/layout baseline. It preserves the button/hitbox fixes, mounts into the active training shell, hides only old direct shell siblings, removes the duplicated legacy brief/board, keeps the board directly below the game header, and prevents Retry Build from blanking the surface. Details are in `docs/HANDOFF_2026-05-19_BUILD_ROOM_V6R277_LOCK.md`.

Latest LIV-016 repair: `LIV-016` is now a PNG-backed full-band stagebox board using `assets/live-sound/png/liv016-full-band-layout.png`, with transparent semantic source and jack hitboxes, equipment labels, corrected stagebox endpoint placement, corrected crossover input placement, and LIV-016-only stereo checklist gating. Details are in `docs/HANDOFF_2026-05-21_LIV016_FULL_BAND_STAGEBOX_REPAIR.md`.

Known risk: continue smoke-testing diagnosis, live-sound native boards, normal levels, and PST/IR levels after extraction/opening. Build-a-Room browser DOM QA passed for `LIV-004`, `LIV-013`, `LIV-027`, `LIV-041`, `REC-004`, `BRD-004`, `PST-004`, and `GAM-004`.
