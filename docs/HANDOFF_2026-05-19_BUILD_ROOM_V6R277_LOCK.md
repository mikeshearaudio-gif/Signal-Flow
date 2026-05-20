# Signal Flow Build-a-Room v6r277 Lock Handoff

Date: 2026-05-19

## Scope

This handoff covers the Build-a-Room shared renderer/layout repair locked as `v6r277`.

The goal was to preserve the `v6r272` button/hitbox improvements while fixing the remaining layout regression:

- massive blank space above the Build-a-Room board
- duplicate/legacy left lesson brief visible behind or beside the Build-a-Room UI
- old training-only board/card visible below or behind the new board
- Retry Build blanking or detaching the Build-a-Room surface

## Locked Version

Active cache refs:

- `patch/sf-build-room-renderer.js?v=6r277`
- `patch/sf-build-room-renderer.css?v=6r277`

Active test URL:

```text
http://127.0.0.1:8000/launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html?fresh=buildroom-v6r277-final#/level/LIV-004
```

## Files Changed

- `patch/sf-build-room-renderer.js`
- `patch/sf-build-room-renderer.css`
- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `docs/SIGNAL_FLOW_MEMORY.md`
- `docs/HANDOFF_SUMMARY.md`
- `docs/HANDOFF_2026-05-19_BUILD_ROOM_V6R277_LOCK.md`

## What Changed

### Shared Renderer

`patch/sf-build-room-renderer.js` is now `VERSION = '6r277'`.

The renderer now mounts the `.sf-build-room-v6r227` root into the active shell instead of assuming the first `.level-shell` is correct.

Important functions:

- `ensureContainer(levelId)`
- `currentBuildRoomMount()`
- `buildRoomShellFor(el)`
- `buildRoomShellHost()`
- `mountContainerInShell(root)`
- `applyBuildRoomShellMode(root)`
- `clearBuildRoomShellMode(removeClass)`
- `rescanBuildRoomShellOnly()`

The important behavior is:

- Find the current Build-a-Room mount by `data-sf-build-room-renderer-mount="true"` and current `data-level-id`.
- Use its closest `.training-stage-shell` or `.level-shell`.
- Insert the Build-a-Room root as a direct child of that shell.
- Mark the shell as `.sf-br-shell-owned`.
- Hide only direct sibling children in that same shell.
- Preserve and restore styles through `rememberStyle()` / `restoreStyle()`.

This is intentionally not a broad DOM mover and not a geometry scan.

### Shared CSS

`patch/sf-build-room-renderer.css` is now labeled `v6r277`.

The scoped locked layout now applies to both shell types:

- `.level-shell`
- `.training-stage-shell`

The CSS hides only direct shell siblings while Build-a-Room is active and keeps the `.sf-build-room-v6r227` root as the shell owner.

### Launch Cache

`launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html` now loads:

```html
<link rel="stylesheet" href="../patch/sf-build-room-renderer.css?v=6r277">
<script src="../patch/sf-build-room-renderer.js?v=6r277"></script>
```

## Locked Player-Facing Result

Build-a-Room should show:

- no external old lesson/sidebar
- no duplicated old level brief
- no legacy training-only board/card below the new renderer
- no floating Equipment Locker / Mic Locker button
- Job Brief and Build Checklist as the internal left column
- Equipment Options and gear cards as the main right area
- Reset Build and Submit Build in the top strip immediately left of credits
- credits grouped on the right
- category pill hitboxes aligned to the visible pills
- plus/minus hitboxes aligned to the visible circles
- Submit Build using the existing validation path
- Retry Build returning to a populated Build-a-Room surface

## Verified

Static check:

```text
node --check patch/sf-build-room-renderer.js
```

Browser DOM QA against `LIV-004` confirmed:

- renderer loaded `v6r277` JS and CSS
- one `.sf-build-room-v6r227` root
- parent shell was `.training-stage-shell`
- old training-only sidebar and old board-card were hidden direct siblings
- old visible sibling count was `0`
- root gap from game header was `10px`
- floating locker button count was `0`
- Reset Build and Submit Build were present
- Retry Build did not blank the board

Button stability check:

- Reset Build and Submit Build kept the same document position after a gear plus click.
- Browser viewport scrolled after the click because the card was low on the page, but the buttons did not reflow or move in document layout.

Regression sweep passed:

- `LIV-004`
- `LIV-013`
- `LIV-027`
- `LIV-041`
- `REC-004`
- `BRD-004`
- `PST-004`
- `GAM-004`

Each showed:

- one Build-a-Room root
- visible `.sf-br-body`
- parent shell `.training-stage-shell`
- two old shell siblings hidden
- zero visible old shell siblings
- Reset Build and Submit Build present
- `10px` gap from the game header

## Do Not Regress

Do not reintroduce:

- broad DOM movers
- mutation observers
- geometry-based sidebar hiding
- transforms or negative shifts to fake alignment
- generic `[class*=sidebar]` or broad text-search shell patches
- new external patch files for Build-a-Room layout
- LIV-004-only fixes for shared Build-a-Room behavior

Do preserve:

- `v6r277` shell ownership behavior
- `v6r272+` button/hitbox alignment improvements
- shared Submit Build validation/check behavior
- current scoring/economy behavior
- non-Build-a-Room boards, diagnosis boards, quiz boards, IR boards, native patch boards, and navigation

## Next Safe Test Command

Open:

```text
http://127.0.0.1:8000/launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html?fresh=buildroom-v6r277-final#/level/LIV-004
```

Then verify the same regression set:

```text
LIV-004
LIV-013
LIV-027
LIV-041
REC-004
BRD-004
PST-004
GAM-004
```
