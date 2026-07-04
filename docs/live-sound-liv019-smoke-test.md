# LIV-019 Smoke Test Note

Date: 2026-07-03

Checkpoint: controlled LIV-019 source manifest plus browser smoke.

## Observed Passing Behavior

- LIV-019 loads with the correct locked board identity.
- Hitbox lock reported expected 70, applied 70, missingCount 0.
- Correct drum source routes complete.
- Wrong routes draw red and apply the expected penalty behavior.
- Hints toggle is visible and interactive.
- Scroll shell, overlay lock, FOH label locks, stagebox lock, clean finalizer, and cable mode kit all load.

## Issue Found

The browser smoke found incorrect generic labels reading `IEM # INPUT` on the LIV-019 IEM units. These duplicated the intended unit/channel labeling and made the IEM area look cluttered.

## Fix Applied

Removed the LIV-019-only renderer overlays that generated `IEM 1 INPUT` through `IEM 6 INPUT` from the IEM unit artwork. The intended `IEM UNIT 1`, `IEM UNIT 2`, `IEM UNIT 3`, `INPUT A`, `INPUT B`, `IEM 1` through `IEM 6`, and jack hitbox labels remain unchanged.

No route definitions, hitboxes, scoring, hints, cable behavior, scroll behavior, stagebox behavior, source manifest data, or normalized manifest data were changed.

## Remaining Manual Check

Confirm in browser that the generic `IEM # INPUT` labels are gone while the intended IEM unit headings, channel labels, and input jack behavior remain intact.

## Hint Recheck

Follow-up smoke after the label cleanup found that LIV-019 hints were not functioning correctly.

Cause: the native required-hint normalizer read older embedded route fields such as `from` and `to`, but the controlled source manifest uses canonical `fromId` and `toId` route endpoints. That could leave the required endpoint set empty for manifest-backed routes, so Show Hints could toggle without applying the expected required endpoint rings.

Fix applied: the hint endpoint reader now accepts `fromId` and `toId` in addition to the existing route field names. The fix does not restore the removed `IEM # INPUT` overlays and does not change routes, hitboxes, scoring, cable behavior, scroll behavior, stagebox behavior, source manifests, or normalized manifests.

Remaining manual check: confirm in browser that Show Hints highlights only valid LIV-019 endpoints while the duplicate `IEM # INPUT` labels remain absent.

## Second Smoke Recheck

Follow-up smoke found that the duplicate `IEM # INPUT` labels stayed removed, but `INPUT A` and `INPUT B` had migrated away from the prior locked antenna-label overlay positions. Hints were still not visibly reliable.

Cause: the duplicate-label cleanup removed the extra visible `IEM # INPUT` overlays, but the base renderer still created `INPUT A` and `INPUT B` at the lower jack-label positions and depended on the LIV-019 overlay lock to move them afterward. That made the initial/rendered position fragile. Hint visibility also needed a LIV-019-specific bridge that applies required endpoint rings from route endpoint IDs instead of relying on label text or overlay nodes.

Fix applied: the base LIV-019 renderer now creates `INPUT A`, `INPUT B`, and the IEM channel labels at the same locked overlay coordinates declared by `sf-liv019-overlay-lock.js`. The duplicate `IEM # INPUT` overlays remain removed. LIV-019 hint visibility is reinforced from required route endpoint IDs and does not depend on the removed duplicate labels.

Remaining manual browser recheck:
- Confirm duplicate `IEM # INPUT` labels stay absent.
- Confirm `INPUT A` and `INPUT B` sit on the antenna-label overlay positions.
- Confirm `IEM 1` through `IEM 6` remain visible and correctly placed.
- Confirm Show Hints visibly highlights only valid LIV-019 endpoints.
- Confirm routes, wrong-route red cables, score behavior, scroll shell, stagebox lock, and cable behavior remain unchanged.

## Hint Visibility Follow-Up

Date: 2026-07-04

Current smoke confirmed that the duplicate `IEM # INPUT` labels are gone, `INPUT A` and `INPUT B` are back in the locked antenna-label positions, IEM labels/headings are correct, routes work, wrong routes turn red and penalize correctly, and cable/scroll/stagebox/label behavior appears intact. Hints still did not operate visually even though the console showed repeated state changes such as `Native jack hints visible: true` and `Native jack hints visible: false`.

Failure mode: the Show Hints control and renderer state were firing, but the visual hint rings were not reliably visible/persistent on LIV-019.

Cause: LIV-019 uses `sf-live-cable-mode-kit.js` to promote the native cable SVG to a top board layer with z-index `2147483600`. The generic hint path styled the jack hitbox elements themselves, which remained below that promoted cable layer and could be visually suppressed by the locked LIV-019 stacking model. The previous canonical endpoint fix was still needed, but was not enough to guarantee visible rings in this locked layout.

Fix applied: LIV-019 now creates a dedicated pointerless `.sf-liv019-hint-ring-layer` above the promoted cable layer when hints are visible. The ring layer is rebuilt from required route endpoint IDs and skips ghost/invalid endpoints, so it does not depend on removed duplicate labels and does not reveal invalid jacks. Hiding hints removes the ring layer.

Manual recheck checklist:
- Show Hints creates visible rings on valid LIV-019 endpoints.
- Hide Hints removes those rings.
- Rings remain visible until toggled off.
- Rings do not appear on invalid/ghost endpoints.
- Duplicate `IEM # INPUT` labels stay absent.
- `INPUT A` and `INPUT B` remain in the locked antenna-label positions.
- Existing routes, wrong-route red cables, scoring, hitboxes, cable mode, scroll shell, and stagebox lock remain unchanged.

## Hint Persistence Follow-Up

Date: 2026-07-04

Video review corrected the hint diagnosis: Show Hints does create visible yellow rings initially. The rings disappear after a route is completed and native cables redraw, while the button still says Hide Hints and the hint state remains active.

Failure mode: hint visibility is correct on initial toggle, then the visual hint layer is lost or stale after route completion / wrong-route attempts / cable redraw.

Cause: `addRoute()` updates route state and calls `redrawCables(layer)`. `redrawCables()` removes and recreates the native cable SVG, promotes the cable layer, and appends route drag handles, but previously did not rebuild active LIV-019 hint visuals afterward. The hint state stayed true, but the route/cable redraw path did not refresh the LIV-019 hint ring layer.

Fix applied: when LIV-019 hints are active, `redrawCables()` now reapplies `forceLiv019HintVisibility(true)` after recreating/promoting cables and handles. The rebuild is idempotent: it reuses a single `.sf-liv019-hint-ring-layer`, moves it back above redraw artifacts, clears existing rings, and recreates rings from valid route endpoint IDs. Hide Hints still removes the layer.

Manual recheck checklist:
- Click Show Hints and confirm rings appear.
- Complete one correct route, such as Snare Mic to Stage Box Input 2, and confirm rings remain after the green cable appears.
- Make one wrong route and confirm rings remain after the red cable appears.
- Click Hide Hints and confirm rings disappear.
- Confirm duplicate `IEM # INPUT` labels stay absent.
- Confirm `INPUT A` and `INPUT B` remain correctly positioned.
- Confirm routes, hitboxes, scoring, cable behavior, scroll shell, and stagebox lock remain unchanged.

## Endpoint Ring Visibility Follow-Up

Date: 2026-07-04

ScreenFlow 6 corrected the hint diagnosis. The Show Hints control changes to Hide Hints, the console logs `Native jack hints visible: true`, and the checklist rows receive yellow hint styling.

Corrected failure mode: Show Hints does create visible endpoint rings, but they behave like a temporary effect. Rings can disappear after a correct route, wrong-route attempt, cable redraw, or later LIV-019 cleanup/lock pass even though the button still says Hide Hints and the hint state remains active. Expected behavior is steady-state: valid endpoint rings should remain visible until Hide Hints, level change, or board clear/reset.

Cause: the LIV-019 ring builder needed to behave as a persistent visual overlay, not as another set of endpoint nodes. The controlled LIV-019 routes include drum source endpoints rendered as `.sf-native-source`, so the ring builder must target both `.sf-native-jack` and `.sf-native-source`. The visual rings also previously used `data-node-key`, which let the LIV-019 hitbox final lock treat ring divs as locked hitbox nodes during later DOM/lock passes. That made the hint overlay vulnerable to cleanup/lock refreshes instead of keeping it as a visual-only steady state.

Fix applied: LIV-019 now uses an idempotent `syncLiv019HintRings()` path keyed to the persistent `nativeHintsVisible` state. It scans current, parent, and same-origin iframe documents for `.sf-live-native-level-liv-019`, creates one ring layer in the board layer's owner document, targets both `.sf-native-jack` and `.sf-native-source` endpoint nodes, skips hidden source-panel duplicates, and uses visual-only `data-sf-liv019-hint-key` attributes instead of `data-node-key`. The sync runs after Show/Hide Hints, after cable redraws, after valid and invalid route attempts through the redraw path, and with a bounded deferred resync to survive immediate cleanup/lock passes. Static route evidence expects 42 unique valid endpoint ids from the 21 required routes.

Diagnostics added: LIV-019 hint sync logs reason, `nativeHintsVisible`, target endpoint ids, matched count, ring count, document context, parent class, ring layer existence, z-index/overflow, nonzero-rect failures, and whether rings were removed because hints were hidden.

Remaining manual browser recheck:
- Click Show Hints and confirm board endpoint rings appear.
- Complete one correct route and confirm rings remain visible.
- Attempt one wrong route and confirm rings remain visible.
- Wait for cleanup/lock passes and confirm rings remain visible.
- Confirm the log reports matched/ring counts for the LIV-019 board document after toggle and route/cable redraw.
- Click Hide Hints and confirm rings disappear.
- Confirm hidden source-panel duplicates and invalid endpoints are not highlighted.
- Confirm duplicate `IEM # INPUT` labels stay absent.
- Confirm `INPUT A`, `INPUT B`, IEM labels, routes, hitboxes, scoring, cable behavior, scroll shell, and stagebox lock remain unchanged.
