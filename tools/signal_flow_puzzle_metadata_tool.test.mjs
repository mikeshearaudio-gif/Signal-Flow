import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const result = spawnSync(process.execPath, ["tools/signal-flow-puzzle-metadata-tool.js", "report"], {
  cwd: process.cwd(),
  encoding: "utf8"
});

assert.equal(result.status, 0, `report command should pass\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`);
assert.match(result.stdout, /Signal Flow actionable puzzle metadata report/, "report should have a clear title");
assert.match(result.stdout, /Recommended next batch/, "report should recommend a next batch");
assert.match(result.stdout, /LIV-011/, "report should include an actionable live-sound candidate from the patch-board roadmap");
assert.match(result.stdout, /Needs source board manifests/, "report should identify levels blocked on source manifests");
assert.match(result.stdout, /Embedded\/JS-only coverage gaps/, "report should identify embedded coverage gaps");
assert.match(result.stdout, /Batch map files to create/, "report should name batch map files to create");
assert.match(result.stdout, /data\/puzzle-metadata\/live-sound\.json/, "report should point to the live-sound batch map");
assert.match(result.stdout, /No files were modified/, "report should state read-only behavior");

console.log("signal flow puzzle metadata tool report checks passed");
