# Signal Flow Handoff: Scroll Affordance Lock

Date: 2026-05-28

## Scope

This handoff locks the current scroll behavior and scroll-affordance architecture after the `v6r292` repair pass.

The scroll-affordance system is a passive visual hint system only. It should not own wheel physics, rewrite scroll positions, change layout, or alter board renderers.

## Active Files

- `src/sf-scroll-affordance.js`
- `src/sf-liv018-scroll-shell.js?v=6r376`
- `src/sf-liv019-scroll-shell.js?v=6r389`
- `patch/sf-build-room-renderer.js?v=6r280`
- `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`
- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`

Active wrapper/raw cache key:

- `scroll-affordance-passive-v6r292`

Active cue include:

- `<script src="../src/sf-scroll-affordance.js?v=6r292"></script>`

## Locked Principle

`src/sf-scroll-affordance.js` draws indicators only.

It may:

- scan for existing scroll hosts,
- attach a fixed `pointer-events:none` cue overlay,
- show subtle edge chevrons while idle,
- hide cues during active scrolling,
- recompute after scroll idle, resize, level change, and remount.

It must not:

- set `scrollLeft` or `scrollTop`,
- correct wheel physics,
- set or override scroll-host overflow,
- set board dimensions or min-height,
- wrap, move, or reparent content,
- change renderer layout,
- affect cable, hitbox, label, route, checklist, scoring, diagnosis, or Build-a-Room control behavior.

## Cue Behavior

State machine:

- `state = idle | scrolling`
- visible indicators = `idle && availableDirections`
- hidden indicators = `scrolling || no hidden content`

Available direction calculation:

- `canLeft = scrollLeft > 3`
- `canRight = scrollLeft < scrollWidth - clientWidth - 3`
- `canUp = scrollTop > 3`
- `canDown = scrollTop < scrollHeight - clientHeight - 3`

Visual lock:

- subtle transparent edge chevrons,
- no circular button background,
- no heavy gold border,
- no pulsing, flashing, bouncing, or repeated animation,
- no cursor/click behavior,
- `pointer-events:none`.

## Scroll Ownership

LIV-018:

- Scroll behavior is owned by `src/sf-liv018-scroll-shell.js?v=6r376`.
- The raw `#patchbayWrap` wheel handler must exit for `.patchbay-wrap[data-sf-liv018-scroll-shell]`.
- Do not add wheel correction to the cue utility for LIV-018.

LIV-019:

- Layout shell remains `src/sf-liv019-scroll-shell.js?v=6r389`.
- The raw game wheel handler may handle clear vertical as vertical scroll and clear horizontal / shift-wheel as horizontal scroll for `.patchbay-wrap[data-sf-liv019-scroll-shell]`.
- Do not reintroduce vertical-wheel-to-horizontal drift.
- Do not touch LIV-019 cable kit `v6r426`.

Build-a-Room:

- Scroll ownership is `patch/sf-build-room-renderer.js?v=6r280`.
- Preferred cue target is the actual scroll host whose `scrollTop` changes:
  1. `.sf-br-shell-owned` with real scroll range
  2. `[data-sf-br-shell-root]` with real scroll range
  3. `.sf-build-room-v6r227` with real scroll range
  4. nearest visible scrollable ancestor of the Build-a-Room root
- Do not attach cues to gear cards, selected gear lists, option grids, buttons, stale patchbay containers, or stale native containers.
- Build-a-Room cue overlay clips to the visible browser/iframe viewport when the owned shell extends below the screen, so the DOWN cue sits at the visible shell edge.

Diagnosis:

- The affordance system may observe the visible diagnosis scroll host.
- It must not change diagnosis rendering, controls, answers, or layout.

## Current Validation Results

LIV-018:

- vertical wheel: `scrollLeft` stays `0`, `scrollTop` changes,
- horizontal wheel: horizontal scrolling works,
- idle cues show available directions,
- cues hide during scroll and return after idle.

LIV-019:

- vertical wheel: `scrollLeft` stays `0`, `scrollTop` changes,
- horizontal / shift-wheel: horizontal scrolling works,
- cable kit `v6r426` remains loaded,
- no old runtime finalizer strings returned.

Build-a-Room LIV-004:

- selected target: `.sf-br-shell-owned`,
- top state: DOWN cue visible, UP hidden,
- after scrolling down: UP and DOWN visible if content remains,
- bottom state: DOWN hidden,
- down cue rect is inside the visible viewport.

Forbidden checks:

- no `sf-universal-scroll-cues-v1` active inline block,
- no `sf-universal-scroll-cues-script-v1` active inline block,
- no `sf-liv019-runtime-finalizer`,
- no `native-cableLayer-rendered-locked-hitbox-center`,
- no `cableCenterSource`.

## Quick Verification Commands

```bash
node --check src/sf-scroll-affordance.js
grep -nE "sf-universal-scroll-cues-v1|sf-universal-scroll-cues-script-v1" \
  launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html \
  launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html
grep -nE "sf-liv019-runtime-finalizer|native-cableLayer-rendered-locked-hitbox-center|cableCenterSource" \
  launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html \
  launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html \
  src/sf-live-cable-mode-kit.js \
  src/sf-liv019-clean-finalizer-v6r421.js
```

Expected grep result for forbidden strings: no output.

## Future Work Rules

- Fix scroll physics in the scroll owner, not in `src/sf-scroll-affordance.js`.
- Fix cue visibility/placement in `src/sf-scroll-affordance.js`, but keep it passive.
- Do not solve Build-a-Room cue problems by changing LIV-018/LIV-019 or patch-board cue math.
- Do not solve LIV-018/LIV-019 scroll problems by changing Build-a-Room or diagnosis.
- Keep LIV-019 cable lock `v6r426` and clean finalizer `v6r421q2` untouched unless the task is explicitly about LIV-019 cable behavior.
