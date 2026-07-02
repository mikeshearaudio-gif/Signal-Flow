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

function section(stdout, heading, nextHeading) {
  const start = stdout.indexOf(heading);
  assert.notEqual(start, -1, `missing report section: ${heading}`);
  const fromHeading = stdout.slice(start);
  if (!nextHeading) return fromHeading;
  const end = fromHeading.indexOf(nextHeading);
  assert.notEqual(end, -1, `missing next report section: ${nextHeading}`);
  return fromHeading.slice(0, end);
}

const result = runTool(["report"]);

assert.equal(result.status, 0, `report command should pass\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`);
assert.match(result.stdout, /Signal Flow actionable puzzle metadata report/, "report should have a clear title");
assert.match(result.stdout, /Recommended next batch/, "report should recommend a next batch");
assert.match(result.stdout, /Recommended next batch:\n  none/, "report should have no ordinary source-manifest candidates after the ordinary batch manifests are created");
assert.match(result.stdout, /Preservation-plan-required locked boards/, "report should identify locked boards that need preservation planning");
assert.match(result.stdout, /Needs source board manifests/, "report should identify levels blocked on source manifests");
assert.match(result.stdout, /Needs source board manifests:\n  none/, "report should show no ordinary source-manifest gaps after the ordinary batch manifests are created");
assert.match(result.stdout, /Embedded\/JS-only coverage gaps/, "report should identify embedded coverage gaps");
assert.match(result.stdout, /Batch map status/, "report should summarize batch map state");
assert.match(result.stdout, /data\/puzzle-metadata\/live-sound\.json - exists and validates/, "report should show the live-sound map as existing and valid");
assert.doesNotMatch(result.stdout, /Batch map files to create:[\s\S]*data\/puzzle-metadata\/live-sound\.json/, "report should not list existing live-sound map as a file to create");
assert.match(result.stdout, /Needs-review triage/, "report should include needs-review triage guidance");
assert.match(result.stdout, /No files were modified/, "report should state read-only behavior");

const recommendedSection = section(result.stdout, "Recommended next batch:", "Preservation-plan-required locked boards:");
const preservationSection = section(result.stdout, "Preservation-plan-required locked boards:", "Needs source board manifests:");
const sourceManifestSection = section(result.stdout, "Needs source board manifests:", "Source JSON without metadata:");
for (const levelId of ["LIV-019", "LIV-020", "LIV-023", "LIV-026"]) {
  assert.match(preservationSection, new RegExp(levelId + " - locked-needs-review"), `${levelId} should be in the locked/preservation-needed bucket`);
  assert.doesNotMatch(recommendedSection, new RegExp(levelId), `${levelId} should not be presented as an ordinary recommended source-manifest candidate`);
  assert.doesNotMatch(sourceManifestSection, new RegExp(levelId), `${levelId} should not be presented as an ordinary source-manifest gap`);
}

const liveSoundMapPath = path.join(cwd, "data/puzzle-metadata/live-sound.json");
const beforeStat = fs.statSync(liveSoundMapPath);
const validMapResult = runTool(["validate-map", "data/puzzle-metadata/live-sound.json"]);

assert.equal(validMapResult.status, 0, `validate-map should accept live-sound map\nSTDOUT:\n${validMapResult.stdout}\nSTDERR:\n${validMapResult.stderr}`);
assert.match(validMapResult.stdout, /Batch puzzle metadata map validation passed/, "validate-map should report success");
assert.match(validMapResult.stdout, /Levels validated: 15/, "validate-map should validate the expanded live-sound batch");
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
assert.match(dryRunResult.stdout, /already-has-source-and-metadata/, "dry-run should classify completed source manifests");
assert.match(dryRunResult.stdout, /Skipped \/ needs review:/, "dry-run should list skipped needs-review levels");
assert.match(dryRunResult.stdout, /LIV-015/, "dry-run should include promoted source-missing levels");
assert.match(dryRunResult.stdout, /Would write files:\n0, because this is dry-run only\./, "dry-run should report zero writes");
const dryRunAfterStat = fs.statSync(liveSoundMapPath);
assert.equal(dryRunAfterStat.mtimeMs, dryRunBeforeStat.mtimeMs, "apply-map dry-run should not modify the map file");

const dryRunJsonResult = runTool(["apply-map", "data/puzzle-metadata/live-sound.json", "--dry-run", "--json"]);

assert.equal(dryRunJsonResult.status, 0, `apply-map --dry-run --json should pass\nSTDOUT:\n${dryRunJsonResult.stdout}\nSTDERR:\n${dryRunJsonResult.stderr}`);
const dryRunJson = JSON.parse(dryRunJsonResult.stdout);
assert.equal(dryRunJson.mode, "dry-run", "JSON dry-run should declare dry-run mode");
assert.equal(dryRunJson.mapFile, "data/puzzle-metadata/live-sound.json", "JSON dry-run should include map path");
assert.equal(dryRunJson.summary.levelsInMap, 15, "JSON dry-run should count all map levels");
assert.equal(dryRunJson.summary.applyReady, 11, "JSON dry-run should count apply-ready levels");
assert.equal(dryRunJson.summary.needsReview, 4, "JSON dry-run should count needs-review levels");
assert.equal(dryRunJson.summary.wouldWrite, 0, "JSON dry-run should never write");
const liv011Action = dryRunJson.actions.find(item => item.levelId === "LIV-011");
assert.equal(liv011Action.status, "apply-ready", "JSON dry-run should preserve apply-ready status");
assert.equal(liv011Action.action, "already-has-source-and-metadata", "LIV-011 should be recognized as already covered after source manifest creation");
const liv015Action = dryRunJson.actions.find(item => item.levelId === "LIV-015");
assert.equal(liv015Action.status, "apply-ready", "LIV-015 should be promoted after source-route audit");
assert.equal(liv015Action.action, "already-has-source-and-metadata", "LIV-015 should be recognized as already covered after source manifest creation");
const liv016Action = dryRunJson.actions.find(item => item.levelId === "LIV-016");
assert.equal(liv016Action.status, "apply-ready", "LIV-016 should be promoted after source-route audit");
assert.equal(liv016Action.action, "already-has-source-and-metadata", "LIV-016 should be recognized as already covered after source manifest creation");
for (const levelId of ["LIV-019", "LIV-020", "LIV-023", "LIV-026"]) {
  const action = dryRunJson.actions.find(item => item.levelId === levelId);
  assert.equal(action.status, "needs-review", `${levelId} should remain needs-review in apply-map dry-run`);
  assert.equal(action.action, "needs-review-skip", `${levelId} should still be skipped by apply-map dry-run`);
}
for (const levelId of ["LIV-030", "LIV-033", "LIV-037", "LIV-038", "LIV-039"]) {
  const action = dryRunJson.actions.find(item => item.levelId === levelId);
  assert.equal(action.status, "apply-ready", `${levelId} should be apply-ready after ordinary batch audit`);
  assert.equal(action.action, "already-has-source-and-metadata", `${levelId} should be recognized as already covered after source manifest creation`);
}

const triageResult = runTool(["triage", "data/puzzle-metadata/live-sound.json"]);

assert.equal(triageResult.status, 0, `triage command should pass\nSTDOUT:\n${triageResult.stdout}\nSTDERR:\n${triageResult.stderr}`);
assert.match(triageResult.stdout, /Signal Flow needs-review triage/, "triage should have a clear title");
for (const levelId of ["LIV-019", "LIV-020", "LIV-023", "LIV-026"]) {
  assert.match(triageResult.stdout, new RegExp(levelId), `triage should include ${levelId}`);
}
assert.doesNotMatch(triageResult.stdout, /LIV-015/, "triage should omit LIV-015 after promotion to apply-ready");
assert.doesNotMatch(triageResult.stdout, /LIV-016/, "triage should omit LIV-016 after promotion to apply-ready");
assert.match(triageResult.stdout, /keep-needs-review/, "triage should preserve capstone review holds");
assert.match(triageResult.stdout, /No files were modified/, "triage should state read-only behavior");

console.log("signal flow puzzle metadata tool checks passed");
