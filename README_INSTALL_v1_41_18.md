# v1.41.18 Distributed IR Patch — Install

Copy the contents of this patch folder into the root of the `Signal-Flow` repository.

It adds or replaces:

```text
index.html
launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html
launch/ir-level-runner.html
src/ir-level-data.js
src/ir-scoring.js
src/ir-audio-preview.js
docs/build-notes/BUILD_NOTES_v1_41_18_DISTRIBUTED_IR_LEVELS.md
docs/rules/IR_SYSTEM_CHECKLIST.md
docs/manifests/DISTRIBUTED_IR_LEVELS_MANIFEST.md
```

Then run locally from repo root:

```bash
python3 -m http.server 8000
```

Open:

```text
http://localhost:8000/
```

The wrapper will open `PST-IR-01` by default. Use the top navigation to switch environments and boards.

## Existing full game dependency

This patch expects the existing full build to remain at:

```text
launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html
```

Normal levels are loaded from that file. IR levels are loaded by `launch/ir-level-runner.html`.

## Git

After local verification:

```bash
git add .
git commit -m "Add distributed IR levels"
git push origin main
```
