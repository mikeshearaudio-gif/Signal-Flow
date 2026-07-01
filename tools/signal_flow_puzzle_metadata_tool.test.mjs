import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const cwd = process.cwd();

function runTool(args) {
  return spawnSync(process.execPath, ["tools/signal-flow-puzzle-metadata-tool.js", ...args], {
    cwd,
    encoding: "utf8"
  });
}

const result = runTool(["report"]);

assert.equal(result.status, 0, `report command should pass\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`);
assert.match(result.stdout, /Signal Flow actionable puzzle metadata report/, "report should have a clear title");
assert.match(result.stdout, /Recommended next batch/, "report should recommend a next batch");
assert.match(result.stdout, /LIV-011/, "report should include an actionable live-sound candidate from the patch-board roadmap");
assert.match(result.stdout, /Needs source board manifests/, "report should identify levels blocked on source manifests");
assert.match(result.stdout, /Embedded\/JS-only coverage gaps/, "report should identify embedded coverage gaps");
assert.match(result.stdout, /Batch map files to create/, "report should name batch map files to create");
assert.match(result.stdout, /data\/puzzle-metadata\/live-sound\.json/, "report should point to the live-sound batch map");
assert.match(result.stdout, /No files were modified/, "report should state read-only behavior");

const liveSoundMapPath = path.join(cwd, "data/puzzle-metadata/live-sound.json");
const beforeStat = fs.statSync(liveSoundMapPath);
const validMapResult = runTool(["validate-map", "data/puzzle-metadata/live-sound.json"]);

assert.equal(validMapResult.status, 0, `validate-map should accept live-sound map\nSTDOUT:\n${validMapResult.stdout}\nSTDERR:\n${validMapResult.stderr}`);
assert.match(validMapResult.stdout, /Batch puzzle metadata map validation passed/, "validate-map should report success");
assert.match(validMapResult.stdout, /Levels validated: 10/, "validate-map should validate the full first batch");
const afterStat = fs.statSync(liveSoundMapPath);
assert.equal(afterStat.mtimeMs, beforeStat.mtimeMs, "validate-map should not modify the map file");

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sf-puzzle-map-"));
const malformedMapPath = path.join(tempDir, "bad-live-sound.json");
fs.writeFileSync(malformedMapPath, JSON.stringify({
  schemaVersion: 1,
  environment: "live-sound",
  levels: {
    "LIV-999": {
      taskMode: "basic-build",
      scenario: "Malformed map for test.",
      objective: "This should fail because it includes route data.",
      taskVisibility: "full",
      difficulty: 1,
      conceptTags: ["signal-direction"],
      routes: []
    }
  }
}, null, 2));

const malformedResult = runTool(["validate-map", malformedMapPath]);

assert.notEqual(malformedResult.status, 0, "validate-map should reject malformed maps");
assert.match(malformedResult.stderr, /forbidden render\/route field: routes/, "validate-map should reject route/layout fields");

console.log("signal flow puzzle metadata tool checks passed");
