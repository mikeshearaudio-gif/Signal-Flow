# Signal Flow Handoff Summary

Last updated: 2026-05-19

Latest active local entry point: `index.html`

Current launch flow:

- `index.html`
- `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`
- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html` for the full embedded game dependency
- `launch/ir-level-runner.html` for distributed IR levels

Current handoff document:

- `docs/HANDOFF_2026-05-19_LIV006_FOCUSED_REPAIR.md`

Current repo memory:

- `docs/SIGNAL_FLOW_MEMORY.md`

Key current feature: PST-103 Convolution / IR Lab with subjective scoring. The player sees a target space image, chooses from all 24 labeled IRs, previews with Flute Solo 1, submits once, and receives 100/50/25 points with educational feedback.

Latest stabilization pass addressed crashes and missing updated GUI renders by fixing local patch/source/asset path resolution and loading the diagnosis SVG skin in the active full game launch.

Latest live-board bug pass fixed build-room and diagnosis fallback mounting, `LIV-006` terminology, `LIV-010`/`LIV-011` scrolling, source jack alignment on `LIV-002`/`LIV-025`/`LIV-026`/`LIV-028`, and `LIV-028` equipment overlap.

Latest focused repair: `LIV-006` now uses renderer-level rack placement, no external rack mover/debug outline, compact non-nested scrolling, aligned jacks, and player-facing `CROSSOVER` / `AUX INPUTS` labels. Details are in `docs/HANDOFF_2026-05-19_LIV006_FOCUSED_REPAIR.md`.

Known risk: browser screenshot QA still needs to be run because Playwright visual verification was blocked in the current environment. Smoke-test diagnosis, build-room, live-sound native boards, normal levels, and PST/IR levels after extraction/opening.
