import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const toolPath = path.join(repoRoot, "tools/live-sound-board-tool.js");
const sourceBoard = JSON.parse(fs.readFileSync(path.join(repoRoot, "data/live-sound/boards/liv029.json"), "utf8"));
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sf-puzzle-metadata-"));

function validPuzzle() {
  return {
    puzzleMode: "signal-type",
    scenario: "You are wiring a four-person debate panel with wireless lavs, PA, moderator wedge, and press recorder feed.",
    objective: "Route receiver audio to the console, feed the PA, provide the moderator monitor, and send a stereo press feed.",
    constraints: [
      {
        id: "rf-is-not-audio",
        text: "RF antenna outputs cannot be patched directly into console audio inputs.",
        concept: "rf-vs-audio",
        appliesTo: ["wireless", "console-input"]
      }
    ],
    routeListVisibility: "partial",
    educationalFeedback: {
      defaultWrongRoute: "Trace the signal type first.",
      routePairs: {
        "wireless-receiver-antenna-a->console-input-1": "That jack carries RF, not balanced audio."
      },
      concepts: {
        "rf-vs-audio": "Use the receiver audio output after RF is converted to audio."
      },
      endpointTypes: {
        "speaker-output->line-input": "Speaker-level output should not feed line input."
      }
    },
    trapRoutes: [
      {
        from: "wireless-receiver-antenna-a",
        to: "console-input-1",
        concept: "rf-vs-audio",
        severity: "teach",
        message: "RF antenna outputs are not console audio outputs."
      },
      {
        from: "pa-processor-amp-l-output",
        to: "press-recorder-l-input",
        concept: "speaker-level-unsafe",
        severity: "unsafe",
        message: "Speaker-level output is unsafe for a recorder input."
      }
    ],
    completionExplanation: "Receivers convert RF to audio, and the console distributes audio to PA, monitor, and press buses.",
    difficulty: 4,
    conceptTags: ["wireless", "rf-vs-audio", "press-feed", "monitor-aux", "main-pa"]
  };
}

function writeBoard(name, mutate) {
  const board = structuredClone(sourceBoard);
  mutate(board);
  const file = path.join(tempDir, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(board, null, 2) + "\n");
  return file;
}

function runTool(args) {
  return spawnSync(process.execPath, [toolPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8"
  });
}

function assertValidatePasses(file, message) {
  const result = runTool(["validate", file]);
  assert.equal(result.status, 0, `${message}\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`);
}

function assertValidateFails(file, expectedText, message) {
  const result = runTool(["validate", file]);
  assert.notEqual(result.status, 0, `${message} should fail validation`);
  assert.match(result.stderr, expectedText, `${message}\nSTDERR:\n${result.stderr}`);
}

const legacyBoard = writeBoard("legacy", board => {
  delete board.puzzle;
});
assertValidatePasses(legacyBoard, "board without puzzle metadata should keep legacy validation behavior");

const validPuzzleBoard = writeBoard("valid-puzzle", board => {
  board.puzzle = validPuzzle();
});
assertValidatePasses(validPuzzleBoard, "valid LIV-029 puzzle metadata should pass");

const invalidPuzzleMode = writeBoard("invalid-puzzle-mode", board => {
  board.puzzle = { ...validPuzzle(), puzzleMode: "liv029-special-case" };
});
assertValidateFails(invalidPuzzleMode, /puzzle\.puzzleMode must be one of/, "invalid puzzleMode");

const missingRequired = writeBoard("missing-required", board => {
  board.puzzle = validPuzzle();
  delete board.puzzle.objective;
});
assertValidateFails(missingRequired, /puzzle\.objective must be a non-empty string/, "missing required puzzle field");

const missingEndpoint = writeBoard("missing-endpoint", board => {
  board.puzzle = validPuzzle();
  board.puzzle.trapRoutes[0].from = "not-a-real-node";
});
assertValidateFails(missingEndpoint, /trapRoutes\[0\]\.from references unknown endpoint/, "trap route with missing endpoint");

const duplicateRequiredRoute = writeBoard("duplicate-required-route", board => {
  board.puzzle = validPuzzle();
  board.puzzle.trapRoutes[0].from = "wireless-receiver-ch1-audio-out";
  board.puzzle.trapRoutes[0].to = "console-input-1";
});
assertValidateFails(duplicateRequiredRoute, /duplicates a required valid route/, "trap route duplicating a required route");

const duplicateTrapRoute = writeBoard("duplicate-trap-route", board => {
  board.puzzle = validPuzzle();
  board.puzzle.trapRoutes.push({ ...board.puzzle.trapRoutes[0] });
});
assertValidateFails(duplicateTrapRoute, /duplicate trap route/, "duplicate trap route");

const invalidVisibility = writeBoard("invalid-route-list-visibility", board => {
  board.puzzle = { ...validPuzzle(), routeListVisibility: "peekaboo" };
});
assertValidateFails(invalidVisibility, /puzzle\.routeListVisibility must be one of/, "invalid routeListVisibility");

const bakeResult = runTool(["bake", validPuzzleBoard]);
assert.equal(bakeResult.status, 0, `bake should preserve puzzle metadata\nSTDOUT:\n${bakeResult.stdout}\nSTDERR:\n${bakeResult.stderr}`);
const baked = JSON.parse(bakeResult.stdout);
assert.deepEqual(baked.manifest.puzzle, validPuzzle(), "normalized manifest should preserve puzzle metadata");

console.log("live sound puzzle metadata validation checks passed");
