# LIV-020 Smoke Test Notes

## 2026-07-13 Checklist Parity Fix

Checkpoint: controlled LIV-020 source manifest plus browser smoke.

Observed passing behavior before this fix:
- LIV-020 loads as the locked Main PA + IEM Monitor Feed board.
- Valid route acceptance, cable rendering, scoring, false hardware behavior, and red invalid-route behavior remained intact.
- Source manifest and normalized manifest preserved 19 valid routes, 7 stereo groups, 38 good hitboxes, 113 false hardware layout records, and 113 curated bad-route pairs.

Issue found:
- The visible checklist rendered only 4 rows under "Patch these external connections."
- Valid routes 5 through 19 were accepted and drew cables, but the console reported:
  - `Native checklist rows available: Array(4)`
  - `Native checklist target not found: <valid LIV-020 route id>`

Root cause:
- The native LIV-020 renderer route spec contained all 19 valid routes.
- The launcher-side LIV-020 level data still had the old 4-route `required` list for "Main PA amp feed."
- The visible checklist is rendered from launcher `requiredPairs()`, so only those 4 stale rows existed for native checklist matching.

Fix applied:
- Updated only the launcher LIV-020 checklist source to match the controlled 19-route source-manifest labels and order.
- Preserved source and normalized manifests unchanged.
- Preserved route IDs, endpoints, false hardware layout records, curated bad-route pairs, scoring, cable behavior, hitboxes, gear placement, labels, scroll behavior, hint behavior, and LIV-020 needs-review status.

Expected checklist behavior:
- The visible checklist renders exactly 19 rows.
- Each valid native route has exactly one matching checklist target.
- The 7 PA stereo groups are represented as two visible route rows each, preserving existing pair-completion timing.
- The 5 Aux-to-IEM monitor feeds remain individual mono checklist rows.
- False hardware records and curated bad-route pairs never appear as valid checklist rows and cannot complete checklist rows.

Manual smoke needed:
- Reload LIV-020 in browser.
- Confirm 19 rows appear under "Patch these external connections."
- Complete at least one route from rows 1-4 and at least one route from rows 5-19.
- Confirm no `Native checklist target not found` warnings for valid LIV-020 routes.
- Confirm invalid/false jack attempts remain red/non-completing.
