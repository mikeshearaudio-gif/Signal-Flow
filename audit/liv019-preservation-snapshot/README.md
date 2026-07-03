# LIV-019 Preservation Snapshot

This directory is a read-only evidence snapshot for the locked LIV-019 board. It is evidence only, not a runtime source manifest, and it must not be wired into the renderer.

## Captured Files

- `routes.json`: 21 required routes from the active native renderer.
- `stereo-groups.json`: 5 stereo groups derived from the active route data.
- `good-hitboxes.json`: 70 locked hitboxes from `audit/liv019-hitbox-export-v6r406.json`, including required-route endpoint classification.
- `wrong-route-pairs.json`: 6 launch-level forbidden examples for LIV-019.
- `locked-behavior.json`: scripts, cable-layer expectations, scroll notes, label/finalizer notes, hitbox expectations, stagebox rules, and browser-smoke expectations.

## Source Files Inspected

- `src/live-sound-native-renderer.js`
- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html`
- `audit/liv019-hitbox-export-v6r406.json`
- `docs/live-sound-liv019-source-route-audit.md`
- `docs/live-sound-locked-board-conversion-plan.md`
- `docs/live-sound-locked-board-preservation-plan.md`
- `docs/HANDOFF_2026-05-26_LIV019_NATIVE_CABLE_LOCK.md`

## Counts

- Required route count: 21
- Stereo group count: 5
- Locked hitbox count expectation: 70/70, missingCount: 0
- Launch forbidden/wrong-route examples captured: 6

## Behavior That Must Be Preserved

- 8 drum mics route to stagebox inputs 1-8.
- 5 FOH Aux outputs route to IEM inputs 1-5 as mono monitor sends.
- Bus 1/2 feed stereo reverb L/R inputs.
- Bus 3/4 feed stereo delay L/R inputs.
- Reverb L/R and delay L/R outputs return to FOH inputs 9-12.
- Stagebox remains locked as an 8-input board.
- Native cable rendering remains owned by `.sf-native-cables` on the top layer.
- Cable endpoints resolve from locked DOM hitbox centers.
- Duplicate source-panel buttons are ignored for cable anchors.
- Scroll shell, label locks, hitbox lock, stagebox lock, clean finalizer, and cable-mode kit remain active.

## Stop Conditions For Future Conversion

- Route count is not 21.
- Stereo group count is not 5.
- Locked hitbox count is not 70 or missingCount is not 0.
- Stagebox inputs 9-16 become visible, hintable, or active.
- Aux-to-IEM routes are converted into stereo IEM pairs.
- Native cables are replaced by custom stubs, pigtails, viewport overlays, or a second cable layer.
- Cable endpoints do not land on locked hitbox centers.
- Scroll, labels, stagebox lock, hitbox lock, finalizer, scoring, hints, checklist timing, or completion behavior changes.
