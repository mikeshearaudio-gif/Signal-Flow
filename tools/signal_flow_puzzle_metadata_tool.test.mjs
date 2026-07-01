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

const applyWithoutDryRun = runTool(["apply-map", "data/puzzle-metadata/live-sound.json"]);

assert.notEqual(applyWithoutDryRun.status, 0, "apply-map should refuse to run without --dry-run");
assert.match(applyWithoutDryRun.stderr, /requires --dry-run/, "apply-map should explain that only dry-run is available");

const dryRunBeforeStat = fs.statSync(liveSoundMapPath);
const dryRunResult = runTool(["apply-map", "data/puzzle-metadata/live-sound.json", "--dry-run"]);

assert.equal(dryRunResult.status, 0, `apply-map --dry-run should pass\nSTDOUT:\n${dryRunResult.stdout}\nSTDERR:\n${dryRunResult.stderr}`);
assert.match(dryRunResult.stdout, /Signal Flow apply-map dry run/, "dry-run should have a clear title");
assert.match(dryRunResult.stdout, /Apply-ready:/, "dry-run should list apply-ready levels");
assert.match(dryRunResult.stdout, /LIV-011/, "dry-run should include apply-ready levels");
assert.match(dryRunResult.stdout, /source-missing-create-required/, "dry-run should classify missing source manifests");
assert.match(dryRunResult.stdout, /Skipped \/ needs review:/, "dry-run should list skipped needs-review levels");
assert.match(dryRunResult.stdout, /LIV-015/, "dry-run should include needs-review levels");
assert.match(dryRunResult.stdout, /Would write files:\n0, because this is dry-run only\./, "dry-run should report zero writes");
const dryRunAfterStat = fs.statSync(liveSoundMapPath);
assert.equal(dryRunAfterStat.mtimeMs, dryRunBeforeStat.mtimeMs, "apply-map dry-run should not modify the map file");

const dryRunJsonResult = runTool(["apply-map", "data/puzzle-metadata/live-sound.json", "--dry-run", "--json"]);

assert.equal(dryRunJsonResult.status, 0, `apply-map --dry-run --json should pass\nSTDOUT:\n${dryRunJsonResult.stdout}\nSTDERR:\n${dryRunJsonResult.stderr}`);
const dryRunJson = JSON.parse(dryRunJsonResult.stdout);
assert.equal(dryRunJson.mode, "dry-run", "JSON dry-run should declare dry-run mode");
assert.equal(dryRunJson.mapFile, "data/puzzle-metadata/live-sound.json", "JSON dry-run should include map path");
assert.equal(dryRunJson.summary.levelsInMap, 10, "JSON dry-run should count all map levels");
assert.equal(dryRunJson.summary.applyReady, 4, "JSON dry-run should count apply-ready levels");
assert.equal(dryRunJson.summary.needsReview, 6, "JSON dry-run should count needs-review levels");
assert.equal(dryRunJson.summary.wouldWrite, 0, "JSON dry-run should never write");
const liv011Action = dryRunJson.actions.find(item => item.levelId === "LIV-011");
assert.equal(liv011Action.status, "apply-ready", "JSON dry-run should preserve apply-ready status");
assert.equal(liv011Action.action, "source-missing-create-required", "LIV-011 should require a source manifest before applying metadata");
const liv015Action = dryRunJson.actions.find(item => item.levelId === "LIV-015");
assert.equal(liv015Action.action, "needs-review-skip", "needs-review levels should be skipped");

console.log("signal flow puzzle metadata tool checks passed");
