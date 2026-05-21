# Signal Flow Raw Splash Universal Board-Load Handoff

Date: 2026-05-21

## Status

Raw splash board loading is now a universal route-by-ID path. The splash Environment / Level picker should be able to load every known Signal Flow board through the wrapper, not just `LIV-002`, `REC-002`, or hand-picked test cases.

Test URL:

```text
http://127.0.0.1:8000/launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html
```

## Files Changed

- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`

Files intentionally not changed:

- `launch/ir-level-runner.html`
- Build-a-Room v6r277
- `diagnosis-ui.js?v=6r263`
- Semantic checklist highlighter
- LIV-002 jack layout
- IR runner layout/scoring

## What Was Broken

The wrapper could ask the raw iframe to load a board, but the raw helper searched visible `<select>` elements, changed the splash dropdown, logged `Native game shell changed in-game selector`, and returned success without reliably routing to the board.

That made splash Play appear dead or inconsistent, especially after refreshes.

## Locked Fix

In `Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`:

- `startSelectedLevel()` delegates embedded splash Play to the wrapper bridge.
- Public IR IDs still delegate through the wrapper first.
- `window.sfNativeGameShellLoadLevel(anyLevelId)` now routes by ID first:

```js
navigateTo("/level/" + encodeURIComponent(target));
```

The selector-hunting / Load Board click behavior remains only as fallback if the route API is unavailable.

In `Signal_Flow_v1_41_18_NAV_WRAPPER.html`:

- Raw iframe URLs now include:

```text
?v=raw-splash-universal-load-v2
```

- Normal board route shape:

```text
Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html?v=raw-splash-universal-load-v2#/level/LEVEL-ID
```

- IR runner route shape remains unchanged:

```text
ir-level-runner.html?level=ENV-IR-NN&display=ENV-XXX&v=ir-ui-cleanup-v2
```

## Expected Console

Passing normal board load:

```text
[Signal Flow] Native game shell routed level: REC-002
```

Not passing / stale path:

```text
[Signal Flow] Native game shell changed in-game selector: REC-002
```

If the stale selector-only log repeats, hard reload the wrapper. The wrapper should now request the raw iframe with `?v=raw-splash-universal-load-v2`.

Expected harmless console noise:

- `AudioContext was not allowed to start` before user gesture.
- `favicon.ico` 404.

## Verification Completed

Verified through the actual raw splash UI on port `8000`:

- `REC-001` loads raw `#/level/REC-001`
- `REC-002` loads raw `#/level/REC-002`
- `BRD-003` loads raw `#/level/BRD-003`
- `PST-010` loads raw `#/level/PST-010`
- `GAM-020` loads raw `#/level/GAM-020`
- `LIV-004` loads raw `#/level/LIV-004`
- `LIV-005` routes to `ir-level-runner.html?level=LIV-IR-01&display=LIV-005&v=ir-ui-cleanup-v2`
- `LIV-005` IR runner shows 24 choices

Syntax checks:

- Raw game inline scripts OK: 16
- Wrapper inline scripts OK: 5

## Manual Smoke Test

1. Open:
   `http://127.0.0.1:8000/launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`
2. Hard refresh.
3. Confirm splash is visible.
4. From raw splash, choose Recording Studio / `REC-002` / Play.
5. Confirm board loads and console says:
   `Native game shell routed level: REC-002`
6. Click wrapper Splash.
7. Choose Live Sound / `LIV-004` / Play.
8. Confirm Build-a-Room board loads without changing v6r277 behavior.
9. Click wrapper Splash.
10. Choose Live Sound / `LIV-005` / Play.
11. Confirm cleaned IR runner loads with:
    `level=LIV-IR-01&display=LIV-005&v=ir-ui-cleanup-v2`

## Guardrails

Do not reintroduce selector-first loading as the primary path.

Do not change the IR runner route builder unless specifically tasked.

Do not modify Build-a-Room, diagnosis, semantic checklist highlight, LIV-002 jack layout, or IR scoring/layout for this repair.
