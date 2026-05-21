# Signal Flow Splash / IR Routing / Audio-Origin Handoff

Date: 2026-05-20

## Status

Splash is restored. IR routing is repaired. Missing flute audio seen from `file://` is an origin/security testing issue, not currently a Signal Flow code issue.

Use this URL for live testing:

```text
http://127.0.0.1:8000/launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html
```

If the server is not running, start it from the repo root:

```bash
python3 -m http.server 8000
```

## Files Touched

- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`
- `launch/ir-level-runner.html`
- `assets/ui/signal-flow-splash-stage.png`

Related existing handoff:

- `docs/HANDOFF_2026-05-20_IR_LISTENING_BOARD_UI_CLEANUP.md`

## Locked Behavior

- Wrapper hard reload shows the raw game splash/start state.
- Wrapper Splash/Home returns to that same splash/start state.
- No board auto-loads on wrapper boot.
- Raw splash art uses `assets/ui/signal-flow-splash-stage.png`, extracted from the original bundled splash PNG.
- The splash must not fall back to the transparent 1x1 GIF.
- The splash controls remain the original controls:
  - Environment select
  - Level select
  - Tutorial
  - Equipment Locker
  - Play

## IR Routing

Public IR board IDs are routed to the cleaned standalone IR runner:

- `REC/LIV/BRD/PST/GAM-005`
- `REC/LIV/BRD/PST/GAM-014`
- `REC/LIV/BRD/PST/GAM-024`
- `REC/LIV/BRD/PST/GAM-035`
- `REC/LIV/BRD/PST/GAM-046`

URL shape must remain:

```text
ir-level-runner.html?level=ENV-IR-NN&display=ENV-XXX&v=ir-ui-cleanup-v2
```

Examples:

```text
ir-level-runner.html?level=LIV-IR-01&display=LIV-005&v=ir-ui-cleanup-v2
ir-level-runner.html?level=REC-IR-02&display=REC-014&v=ir-ui-cleanup-v2
```

The wrapper now exposes `window.sfWrapperLoadLevel = loadLevel`, listens for `sf-wrapper-load-level`, and catches stale raw-game iframe hashes such as `#/level/LIV-005`. The raw game also delegates public IR IDs to the runner so a public IR board does not render through the native board path.

## Standalone IR Navigation

When `ir-level-runner.html` is opened directly at top level:

- `Choose Another Board` navigates back to `Signal_Flow_v1_41_18_NAV_WRAPPER.html`.
- `Next Board` navigates to the next public raw board hash, for example `Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html#/level/LIV-006`.

When the IR runner is inside the wrapper iframe:

- `Choose Another Board` and `Next Board` continue to use `postMessage` to the wrapper.

## Audio-Origin Rule

Do not test IR preview audio from `file://`.

`file://` causes browser CORS/security errors like:

```text
Access to fetch at 'file:///.../assets/audio/stems/Flute Solo_1(24).wav' from origin 'null' has been blocked by CORS policy
```

That is expected. It also affects Build-a-Room manifests and native SFX fetches. Test audio only through the local HTTP server.

Correct flute/audio fetches should look like:

```text
http://127.0.0.1:8000/assets/audio/stems/Flute%20Solo_1(24).wav
http://127.0.0.1:8000/assets/audio/stems/Flute%20Solo_1(25).wav
```

Only edit IR audio code if flute audio fails from the HTTP URL.

## Smoke Test Checklist

1. Start server from repo root if needed:
   `python3 -m http.server 8000`
2. Open:
   `http://127.0.0.1:8000/launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`
3. Hard reload wrapper.
4. Confirm original splash art and controls are visible.
5. Select Live Sound / `LIV-005` / Play.
6. Confirm IR runner loads with `LIV-005` display and 24 choices.
7. Confirm the URL or iframe source contains:
   `ir-level-runner.html?level=LIV-IR-01&display=LIV-005&v=ir-ui-cleanup-v2`
8. Click an IR option or Preview Selected.
9. Confirm flute preview fetches use `http://127.0.0.1:8000`, not `file://`.
10. Submit an IR and confirm scoring/result actions render.
11. Open `ir-level-runner.html?level=LIV-IR-01&display=LIV-005&v=ir-ui-cleanup-v2` directly.
12. Confirm `Choose Another Board` returns to wrapper.
13. Confirm `Next Board` goes to the next public board.

Expected harmless console noise:

- `AudioContext was not allowed to start` before a user gesture.
- `favicon.ico` 404.

## Guardrails

Do not modify:

- Build-a-Room v6r277 renderer behavior, layout, submit/retry behavior, scoring, or economy.
- `diagnosis-ui.js?v=6r263`.
- Native Live renderer behavior, route validation, scoring, or economy.
- IR scoring or cleaned IR layout unless directly tasked.
- Semantic checklist highlighter.

Do not reintroduce:

- iframe mutation observers
- cache-guard scripts
- fixed overlay systems
- broad sidebar/list scanning
- transparent 1x1 splash placeholder

## Verification Already Completed

- Wrapper splash routes to raw game splash/start state.
- Wrapper selected `LIV-005` routes to cleaned IR runner.
- Stale raw-game iframe hash `#/level/LIV-005` is caught and redirected to the runner.
- Raw game direct `startLevelById('LIV-005')` delegates to the runner.
- Direct top-level IR runner navigation fallbacks work.
- Inline JS syntax checks passed for the edited scripts.
