# Signal Flow Volume 1 Reference Archive

Use this as stable project reference only.

## Global Rules
- Stereo L/R routes must include both sides.
- Correct route default: +100 score.
- Wrong unique route default: -50 score.
- Repeated wrong route should not keep subtracting.
- Hints reduce perfect/bonus status, not core completion.
- Build-a-Room uses Credits/Budget economy.

## Architecture
- Native game shell owns current level and completion navigation.
- Exterior wrapper is dev-only and may show stale state.
- Asset-first board workflow is preferred.
- Layout data, false-jack data, hint data, and route logic must remain separate.

## Locked Live Sound Boards
- LIV-003 locked reference IEM board.
- LIV-006 locked delay/matrix processor board.
- LIV-007 locked broadcast split board.
- LIV-020 locked false-jack board.
- LIV-021 locked at v6r498liv021hintboxsizing.

## Tooling Rules
- Dev tools must support move and resize.
- Export JSON using Blob download, not console copy.
- Validate JSON count and extreme coordinates with Python.
- Bake exported JSON arrays directly; remove procedural generators.
- Good hint hitboxes and false/trap hitboxes need separate tools/exports.
- SVG/DOM hitbox buttons need explicit sizing CSS:
  min-width:0; min-height:0; max-width:none; max-height:none;
  box-sizing:border-box; padding:0; margin:0; line-height:0;
  appearance:none; -webkit-appearance:none.
