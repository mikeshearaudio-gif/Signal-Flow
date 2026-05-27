# Signal Flow LIV-019 Native Cable Lock - 2026-05-26

## Locked Goal

LIV-019 cable visuals are owned by the original native game cable renderer.

Do not reintroduce a separate LIV-019 cable drawing system. The prior endpoint-stub experiments were useful for diagnosis, but the locked player-facing cable behavior is the native cable renderer, promoted to the top visual layer and anchored to the locked hitboxes.

## Active Entry Point

Use:

- `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`

The wrapper loads:

- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `src/live-sound-native-renderer.js?v=6r403`
- `src/sf-liv019-clean-finalizer-v6r421.js?v=6r421q2`
- `src/sf-live-cable-mode-kit.js?v=6r426`

Expected console source:

- `[Signal Flow] LIV-019 clean finalizer loaded v6r421-clean-finalizer`
- `[Signal Flow] Live cable mode kit loaded v6r426`
- `[Signal Flow] Live cable mode kit applied { cableModeSource: "native-game-cables-top-layer", ... }`

## Cable Rules

- Use the original `.sf-native-cables` SVG, `.sf-cable-line`, `.sf-cable-shadow`, and native endpoint dots.
- LIV-019 native cables must render above hardware, labels, overlays, and hitboxes.
- LIV-019 cable SVG is promoted to `z-index: 2147483600`.
- Keep `pointer-events: none` on the cable SVG.
- Do not draw custom stubs, pigtails, viewport overlays, canvas cables, or a second cable layer for LIV-019.
- Remove any experimental `#sf-liv019-cable-stub-layer` if it appears.
- Do not suppress valid native LIV-019 cables. The original full native cables are the correct player-facing cable shape.

## Endpoint Anchor Lock

LIV-019 cable endpoints must use the current locked DOM hitbox centers.

The anchor source is the live element center inside:

- `.sf-live-native-layer.sf-live-native-level-liv-019`

The renderer must ignore duplicate source-panel buttons when finding cable anchor targets:

- `.sf-native-liv019-source-panel`
- `.sf-native-liv009-source-panel`

Implementation is in `src/live-sound-native-renderer.js`:

- `redrawCables(layer)` refreshes LIV-019 route points before drawing each route.
- `liv019CablePointFor(layer, key, fallback)` resolves the visible locked hitbox by `data-node-key` / `data-key`.
- `refreshNativeCableRoutePoints(layer, route)` updates existing route endpoints before redraw.
- `pointForNativeNode(layer, el)` prefers live LIV-019 hitbox centers over cached `data-sf-native-point-x/y`.

This prevents route endpoints from drifting to stale pre-lock coordinates.

## Clean Finalizer Rule

`src/sf-liv019-clean-finalizer-v6r421.js` is locked as tool cleanup only.

It must not:

- draw cables
- move cable endpoints
- suppress native cables
- install a competing cable layer

Expected role log:

- `role: "tool-cleanup-only-no-cables"`

## Removed / Forbidden Legacy Cable Code

There must be no active include of:

- `src/sf-liv019-runtime-finalizer.js`
- `sf-liv019-runtime-finalizer.js?v=6r419`
- `sf-liv019-runtime-finalizer.js?v=6r421`

There must be no active reliance on:

- `native-cableLayer-rendered-locked-hitbox-center`
- `cableCenterSource`
- the old `#cableLayer` full-cable finalizer path

The old runtime finalizer caused full-cable conflicts and must stay out of wrapper, raw build, iframe launch, and crash-test launch paths.

## Keep These LIV-019 Locks

Do not remove or bypass:

- `sf-liv019-scroll-shell.js?v=6r389`
- `sf-liv019-overlay-lock.js?v=6r407`
- `sf-liv019-foh-label-lock.js?v=6r399`
- `sf-liv019-foh-label-final-lock.js?v=6r401`
- `sf-liv019-hitbox-final-lock.js?v=6r408`
- `sf-liv019-stagebox-8-lock.js?v=6r404`
- `sf-liv019-clean-finalizer-v6r421.js?v=6r421q2`
- `sf-live-cable-mode-kit.js?v=6r426`

The hitbox lock must continue reporting:

- `expected: 70`
- `applied: 70`
- `missingCount: 0`

## Do Not Change

For cable fixes, do not change:

- route data
- `validRoutes`
- hitbox coordinates
- label locks
- gear placement
- scroll shell
- stagebox 8-input lock
- live-sound native renderer route validation

Cable display fixes should be limited to native cable layer ownership, top-layer promotion, and endpoint anchoring to the locked hitbox DOM centers.

## Verification Commands

Syntax:

```bash
node --check src/live-sound-native-renderer.js
node --check src/sf-live-cable-mode-kit.js
node --check src/sf-liv019-clean-finalizer-v6r421.js
```

Legacy-removal proof:

```bash
grep -RIn "sf-liv019-runtime-finalizer" launch src patch || true
grep -RIn "native-cableLayer-rendered-locked-hitbox-center" launch src patch || true
grep -RIn "cableCenterSource" launch src patch || true
```

## Browser QA

Load:

```text
http://127.0.0.1:8000/launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html?fresh=liv019-native-cable-lock
```

Test:

- Kick -> Stage Box Input 1
- FOH Aux 1 -> IEM 1
- FOH Bus 1 -> Reverb In L

Expected:

- routes validate
- checklist items complete
- score updates
- native full cables draw in the original Signal Flow style
- cable SVG stays on the top layer
- cable endpoints land on the locked hitbox centers
- hitbox lock remains `70/70`, `missingCount: 0`
- scroll still works
- returning to LIV-019 does not fallback
- no custom stub layer appears
- no old runtime finalizer logs appear

## Latest QA Result

Headless browser QA on 2026-05-26 loaded LIV-019 through the wrapper and created:

- `liv019-kick-to-stagebox-input-1`
- `liv019-aux-1-to-iem-1`
- `liv019-bus-1-l-to-reverb-l-in`

Result:

- `routeCount: 3`
- max cable endpoint delta from locked hitbox centers: `0px`
- `.sf-native-cables` z-index: `2147483600`
- `.sf-native-cables` was the last child of the native layer
- `#sf-liv019-cable-stub-layer`: absent
- hitbox report: `expected: 70`, `applied: 70`, `missingCount: 0`

