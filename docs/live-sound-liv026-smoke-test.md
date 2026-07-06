# LIV-026 Browser Smoke Test

Date: 2026-07-06

## Checkpoint

LIV-026 loaded with the controlled source manifest and preservation behavior intact.

Confirmed during smoke review:

- Board loads.
- Required routes remain playable.
- Wrong routes draw red and do not complete required route rows.
- Cable behavior works.
- Scroll, stagebox/rack layout, and false-hitbox behavior appear intact.
- False hitboxes remain neutral before interaction.

## Issue Found

Show Hints had the same visual persistence issue previously seen on LIV-019. The shared node-level hint styling could be overwritten or visually buried by LIV-026 cable redraws, locked hitbox geometry passes, and cleanup/stacking behavior.

## Fix Applied

LIV-026 now uses a dedicated, visual-only hint ring layer rebuilt from required route endpoints. The rings use `data-sf-liv026-hint-key`, not `data-node-key`, so they cannot become clickable gameplay hitboxes.

The hint sync excludes:

- all `liv026-false-*` hitboxes
- the unused `liv026-delay-processor-input-unused` hitbox
- nodes marked as non-hintable

The ring layer is rebuilt after hint toggles, native cable redraws, and LIV-026 locked true-hitbox geometry passes. Hide Hints, Clear, reset, and level changes remove the visual-only rings.

## Remaining Manual Check

Reopen LIV-026 in the browser and confirm:

- Show Hints creates persistent yellow rings on valid required endpoints only.
- Hint rings remain visible after one correct route, one wrong route, and a cable redraw.
- False hitboxes and `liv026-delay-processor-input-unused` remain unhinted.
- Hide Hints removes the rings.
