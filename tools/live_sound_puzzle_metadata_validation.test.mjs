import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const toolPath = path.join(repoRoot, "tools/live-sound-board-tool.js");
const sourceBoard = JSON.parse(fs.readFileSync(path.join(repoRoot, "data/live-sound/boards/liv029.json"), "utf8"));
const normalizedBoard = JSON.parse(fs.readFileSync(path.join(repoRoot, "data/live-sound/boards/normalized/liv029.normalized.json"), "utf8"));
const beginnerBoards = [
  {
    levelId: "LIV-002",
    file: "data/live-sound/boards/liv002.json",
    normalizedFile: "data/live-sound/boards/normalized/liv002.normalized.json",
    puzzleMode: "basic-build",
    difficulty: 1,
    conceptTags: ["signal-direction", "aux-send", "monitor-wedge", "console-output"]
  },
  {
    levelId: "LIV-003",
    file: "data/live-sound/boards/liv003.json",
    normalizedFile: "data/live-sound/boards/normalized/liv003.normalized.json",
    puzzleMode: "basic-build",
    difficulty: 2,
    conceptTags: ["signal-direction", "iem-stereo", "aux-send", "stereo-pair", "left-right"]
  },
  {
    levelId: "LIV-006",
    file: "data/live-sound/boards/liv006.json",
    normalizedFile: "data/live-sound/boards/normalized/liv006.normalized.json",
    puzzleMode: "constrained-build",
    difficulty: 3,
    conceptTags: ["signal-direction", "matrix-feed", "delay-tower", "processor-chain", "main-pa", "left-right"]
  },
  {
    levelId: "LIV-007",
    file: "data/live-sound/boards/liv007.json",
    normalizedFile: "data/live-sound/boards/normalized/liv007.normalized.json",
    puzzleMode: "signal-type",
    difficulty: 3,
    conceptTags: ["signal-direction", "broadcast-split", "record-feed", "matrix-feed", "main-pa", "left-right"]
  },
  {
    levelId: "LIV-009",
    file: "data/live-sound/boards/liv009.json",
    normalizedFile: "data/live-sound/boards/normalized/liv009.normalized.json",
    puzzleMode: "basic-build",
    difficulty: 2,
    conceptTags: ["signal-direction", "source-to-input", "stagebox", "drum-inputs", "channel-order"]
  },
  {
    levelId: "LIV-010",
    file: "data/live-sound/boards/liv010.json",
    normalizedFile: "data/live-sound/boards/normalized/liv010.normalized.json",
    puzzleMode: "constrained-build",
    difficulty: 3,
    conceptTags: ["signal-direction", "main-pa", "processor-chain", "amplifier", "speaker-level", "left-right"]
  },
  {
    levelId: "LIV-012",
    file: "data/live-sound/boards/liv012.json",
    normalizedFile: "data/live-sound/boards/normalized/liv012.normalized.json",
    puzzleMode: "trap-recognition",
    difficulty: 3,
    conceptTags: ["signal-direction", "aux-send", "monitor-wedge", "console-output", "monitor-mix"]
  },
  {
    levelId: "LIV-025",
    file: "data/live-sound/boards/liv025.json",
    normalizedFile: "data/live-sound/boards/normalized/liv025.normalized.json",
    puzzleMode: "signal-type",
    difficulty: 3,
    conceptTags: ["signal-direction", "matrix-feed", "front-fill", "zone-feed", "main-pa", "processor-chain"]
  },
  {
    levelId: "LIV-034",
    file: "data/live-sound/boards/liv034.json",
    normalizedFile: "data/live-sound/boards/normalized/liv034.normalized.json",
    puzzleMode: "signal-type",
    difficulty: 4,
    conceptTags: ["signal-direction", "matrix-feed", "front-fill", "zone-feed", "left-right", "processor-chain"]
  },
  {
    levelId: "LIV-032",
    file: "data/live-sound/boards/liv032.json",
    normalizedFile: "data/live-sound/boards/normalized/liv032.normalized.json",
    puzzleMode: "constrained-build",
    difficulty: 4,
    conceptTags: ["signal-direction", "aux-send", "monitor-wedge", "monitor-mix", "console-output", "multi-route"]
  }
];
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sf-puzzle-metadata-"));

function validPuzzle() {
  return structuredClone(sourceBoard.puzzle || {
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
    conceptTags: ["wireless", "rf-vs-audio", "press-feed", "monitor-aux", "main-pa", "signal-direction"]
  });
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

assert(sourceBoard.puzzle, "LIV-029 source board should contain top-level puzzle metadata");
assert.equal(sourceBoard.puzzle.puzzleMode, "signal-type", "LIV-029 puzzleMode should be signal-type");
assert.equal(sourceBoard.puzzle.routeListVisibility, "full", "LIV-029 should preserve current full visible route-list gameplay");
for (const tag of ["wireless", "rf-vs-audio", "press-feed", "monitor-aux", "main-pa", "signal-direction"]) {
  assert(sourceBoard.puzzle.conceptTags.includes(tag), `LIV-029 puzzle conceptTags should include ${tag}`);
}

const realLiv029Result = runTool(["validate", "data/live-sound/boards/liv029.json"]);
assert.equal(realLiv029Result.status, 0, `real LIV-029 puzzle metadata should validate\nSTDOUT:\n${realLiv029Result.stdout}\nSTDERR:\n${realLiv029Result.stderr}`);
assert.deepEqual(normalizedBoard.puzzle, sourceBoard.puzzle, "normalized LIV-029 manifest should preserve source puzzle metadata");

for (const beginner of beginnerBoards) {
  const board = JSON.parse(fs.readFileSync(path.join(repoRoot, beginner.file), "utf8"));
  const normalized = JSON.parse(fs.readFileSync(path.join(repoRoot, beginner.normalizedFile), "utf8"));
  assert(board.puzzle, `${beginner.levelId} source board should contain top-level puzzle metadata`);
  assert.equal(board.puzzle.puzzleMode, beginner.puzzleMode, `${beginner.levelId} puzzleMode should be ${beginner.puzzleMode}`);
  assert.equal(board.puzzle.routeListVisibility, "full", `${beginner.levelId} should keep full route-list visibility`);
  assert.equal(board.puzzle.difficulty, beginner.difficulty, `${beginner.levelId} should have expected beginner difficulty`);
  assert(!Array.isArray(board.puzzle.trapRoutes) || board.puzzle.trapRoutes.length === 0, `${beginner.levelId} should not add trap routes yet`);
  if (["constrained-build", "troubleshooting", "signal-type", "redundancy-failure", "capstone-system"].includes(beginner.puzzleMode)) {
    assert.equal(typeof board.puzzle.completionExplanation, "string", `${beginner.levelId} ${beginner.puzzleMode} puzzle should include completionExplanation`);
    assert(board.puzzle.completionExplanation.trim().length > 0, `${beginner.levelId} completionExplanation should be non-empty`);
  }
  for (const tag of beginner.conceptTags) {
    assert(board.puzzle.conceptTags.includes(tag), `${beginner.levelId} puzzle conceptTags should include ${tag}`);
  }

  const validation = runTool(["validate", beginner.file]);
  assert.equal(validation.status, 0, `${beginner.levelId} puzzle metadata should validate\nSTDOUT:\n${validation.stdout}\nSTDERR:\n${validation.stderr}`);
  assert.deepEqual(normalized.puzzle, board.puzzle, `${beginner.levelId} normalized manifest should preserve source puzzle metadata`);
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
