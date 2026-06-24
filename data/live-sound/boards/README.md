# Live Sound Board Manifests

These manifests are the first step toward data-driven Live Sound boards.

The tool is intentionally additive right now. It validates board JSON and can
write a normalized renderer-ready manifest, but it does not edit
`src/live-sound-native-renderer.js`, launcher HTML, route validation, or runtime
gameplay wiring.

## Validate

```bash
node tools/live-sound-board-tool.js validate data/live-sound/boards/liv029.json
```

Checks include required fields, duplicate route/hitbox ids, stereo-pair
completeness, missing asset paths, prewired cable shape, acceptance counts, and
false/trap jacks accidentally listed as valid route endpoints.

## Summary

```bash
node tools/live-sound-board-tool.js summary data/live-sound/boards/liv029.json
```

Prints route count, valid endpoint count, false/trap jack count, gear count,
required assets, stereo groups, and endpoint keys.

## Bake

Dry-run:

```bash
node tools/live-sound-board-tool.js bake data/live-sound/boards/liv029.json
```

Write normalized JSON:

```bash
node tools/live-sound-board-tool.js bake data/live-sound/boards/liv029.json --write
```

Default output:

```text
data/live-sound/boards/normalized/liv029.normalized.json
```

Custom output:

```bash
node tools/live-sound-board-tool.js bake data/live-sound/boards/liv029.json --write --out data/live-sound/boards/normalized/liv029.test.json
```
