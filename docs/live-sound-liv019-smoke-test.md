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
