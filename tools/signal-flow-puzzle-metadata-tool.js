#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const liveBoardDir = path.join(repoRoot, "data/live-sound/boards");
const normalizedBoardDir = path.join(liveBoardDir, "normalized");
const vocabularyPath = path.join(repoRoot, "data/puzzle-metadata/concept-vocabulary.json");
const rendererPath = path.join(repoRoot, "src/live-sound-native-renderer.js");
const adapterPath = path.join(repoRoot, "src/live-sound-adapter.js");
const irDataPath = path.join(repoRoot, "src/ir-level-data.js");
const launchDir = path.join(repoRoot, "launch");

const TASK_MODES = new Set([
  "basic-build",
  "constrained-build",
  "trap-recognition",
  "troubleshooting",
  "signal-type",
  "redundancy-failure",
  "capstone-system",
  "diagnostic-match",
  "asset-selection",
  "room-match",
  "sequence-order"
]);

const VISIBILITIES = new Set([
  "full",
  "partial",
  "objective-only",
  "hidden-until-hint",
  "diagnostic-partial"
]);

const TRAP_SEVERITIES = new Set([
  "teach",
  "warning",
  "unsafe",
  "feedback-risk"
]);

const MAP_STATUSES = new Set([
  "apply-ready",
  "needs-review",
  "draft"
]);

const FORBIDDEN_MAP_FIELDS = new Set([
  "gear",
  "hitboxes",
  "routes",
  "requiredRoutes",
  "validRoutes",
  "forbiddenRoutes",
  "routeDefinitions",
  "prewiredCables",
  "cables",
  "scoring",
  "score",
  "hints",
  "hintBehavior",
  "completionBehavior",
  "layout",
  "rect",
  "x",
  "y",
  "w",
  "h",
  "svg",
  "asset",
  "assets",
  "renderer",
  "render",
  "generatedJackKeys",
  "panelKinds",
  "sourceOrder"
]);

const PATCH_BOARD_ROADMAP_ORDER = [
  "LIV-002",
  "LIV-003",
  "LIV-006",
  "LIV-007",
  "LIV-009",
  "LIV-010",
  "LIV-011",
  "LIV-012",
  "LIV-015",
  "LIV-016",
  "LIV-018",
  "LIV-019",
  "LIV-020",
  "LIV-021",
  "LIV-023",
  "LIV-025",
  "LIV-026",
  "LIV-028",
  "LIV-029",
  "LIV-030",
  "LIV-032",
  "LIV-033",
  "LIV-034",
  "LIV-037",
  "LIV-038",
  "LIV-039"
];

const BATCH_MAP_FILES = [
  "data/puzzle-metadata/live-sound.json",
  "data/puzzle-metadata/game-music.json",
  "data/puzzle-metadata/post-production.json",
  "data/puzzle-metadata/studio-recording.json",
  "data/puzzle-metadata/broadcast.json",
  "data/puzzle-metadata/ir.json",
  "data/puzzle-metadata/diagnosis.json"
];

function usage() {
  console.log([
    "Usage:",
    "  node tools/signal-flow-puzzle-metadata-tool.js audit",
    "  node tools/signal-flow-puzzle-metadata-tool.js coverage",
    "  node tools/signal-flow-puzzle-metadata-tool.js report",
    "  node tools/signal-flow-puzzle-metadata-tool.js validate-all",
    "  node tools/signal-flow-puzzle-metadata-tool.js validate-map <map.json>",
    "  node tools/signal-flow-puzzle-metadata-tool.js apply-map <map.json> --dry-run [--json]",
    "",
    "Read-only scaffold:",
    "  audit         Summarize discovered level sources and migration blockers.",
    "  coverage      Report known levels and curriculum/puzzle metadata coverage.",
    "  report        Print prioritized next work for batch metadata rollout.",
    "  validate-all  Validate discoverable curriculum/puzzle metadata.",
    "  validate-map  Validate a read-only batch metadata map.",
    "  apply-map     Preview map actions with --dry-run. --write is not implemented.",
    "",
    "Future write commands, intentionally not implemented yet:",
    "  apply-map --write  Apply metadata map files with an explicit --write flag.",
    "  normalize-all Normalize generated/runtime metadata with an explicit --write flag."
  ].join("\n"));
}

function readText(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function rel(file) {
  return path.relative(repoRoot, file);
}

function listFiles(dir, predicate) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .map(name => path.join(dir, name))
    .filter(file => fs.statSync(file).isFile())
    .filter(file => !predicate || predicate(file))
    .sort();
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function extractIds(text) {
  return unique(Array.from(text.matchAll(/\b([A-Z]{3}-IR-\d{2}|LIV-\d{3})\b/g), match => match[1].toUpperCase()));
}

function loadVocabulary() {
  const json = readJson(vocabularyPath);
  return new Set((json.concepts || []).map(item => item.id));
}

function discoverLiveBoardSources() {
  return listFiles(liveBoardDir, file => /^liv\d{3}\.json$/i.test(path.basename(file))).map(file => {
    const board = readJson(file);
    return {
      id: String(board.levelId || path.basename(file, ".json")).toUpperCase(),
      file,
      board,
      hasPuzzle: Boolean(board.puzzle),
      hasCurriculum: Boolean(board.curriculum)
    };
  });
}

function discoverNormalizedBoards() {
  return listFiles(normalizedBoardDir, file => /^liv\d{3}\.normalized\.json$/i.test(path.basename(file))).map(file => {
    const board = readJson(file);
    return {
      id: String(board.levelId || path.basename(file, ".normalized.json")).toUpperCase(),
      file,
      board,
      hasPuzzle: Boolean(board.puzzle),
      hasCurriculum: Boolean(board.curriculum)
    };
  });
}

function discoverLaunchFiles() {
  return listFiles(launchDir, file => /\.(html|js)$/i.test(path.basename(file))).map(file => {
    const text = readText(file);
    return { file, ids: extractIds(text) };
  });
}

function discoverAssetManifests() {
  const roots = ["assets", "data"].map(dir => path.join(repoRoot, dir));
  const found = [];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    const stack = [root];
    while (stack.length) {
      const current = stack.pop();
      for (const name of fs.readdirSync(current)) {
        const file = path.join(current, name);
        const stat = fs.statSync(file);
        if (stat.isDirectory()) stack.push(file);
        else if (/manifest.*\.json$/i.test(name) || /schema\.json$/i.test(name)) found.push(file);
      }
    }
  }
  return found.sort();
}

function discoverSources() {
  const rendererText = readText(rendererPath);
  const adapterText = readText(adapterPath);
  const irText = readText(irDataPath);
  const launchFiles = discoverLaunchFiles();
  const liveSources = discoverLiveBoardSources();
  const normalized = discoverNormalizedBoards();
  const rendererIds = extractIds(rendererText);
  const adapterIds = extractIds(adapterText);
  const irIds = extractIds(irText);
  const launchIds = unique(launchFiles.flatMap(item => item.ids));
  const sourceIds = unique([
    ...liveSources.map(item => item.id),
    ...normalized.map(item => item.id),
    ...rendererIds,
    ...adapterIds,
    ...irIds,
    ...launchIds
  ]);

  return {
    liveSources,
    normalized,
    rendererIds,
    adapterIds,
    irIds,
    launchFiles,
    launchIds,
    assetManifests: discoverAssetManifests(),
    sourceIds
  };
}

function metadataObjectsForBoard(boardRecord) {
  const board = boardRecord.board;
  const objects = [];
  if (board.curriculum) {
    objects.push({ kind: "curriculum", data: board.curriculum, levelId: boardRecord.id, file: boardRecord.file });
  }
  if (board.puzzle) {
    objects.push({ kind: "puzzle", data: board.puzzle, levelId: boardRecord.id, file: boardRecord.file });
  }
  return objects;
}

function getTaskMode(data) {
  return data.taskMode || data.puzzleMode;
}

function getVisibility(data) {
  return data.taskVisibility || data.routeListVisibility;
}

function validateString(value, label, errors) {
  if (typeof value !== "string" || value.trim().length === 0) errors.push(label + " must be a non-empty string");
}

function validateConceptArray(data, key, vocab, errors) {
  if (data[key] === undefined) return;
  if (!Array.isArray(data[key]) || data[key].some(tag => typeof tag !== "string" || tag.trim().length === 0)) {
    errors.push(key + " must be an array of non-empty strings");
    return;
  }
  for (const tag of data[key]) {
    if (!vocab.has(tag)) errors.push(key + " contains unknown concept tag: " + tag);
  }
}

function validateFeedback(feedback, errors) {
  if (feedback === undefined) return;
  if (!feedback || typeof feedback !== "object" || Array.isArray(feedback)) {
    errors.push("educationalFeedback must be an object when present");
    return;
  }
  for (const key of ["defaultWrongAttempt", "defaultWrongRoute"]) {
    if (feedback[key] !== undefined && typeof feedback[key] !== "string") {
      errors.push("educationalFeedback." + key + " must be a string when present");
    }
  }
  for (const key of ["routePairs", "concepts", "endpointTypes"]) {
    if (feedback[key] !== undefined && (!feedback[key] || typeof feedback[key] !== "object" || Array.isArray(feedback[key]))) {
      errors.push("educationalFeedback." + key + " must be an object when present");
    }
  }
}

function validateTrapRoutes(data, errors) {
  const routes = data.trapRoutes || (data.environmentExtensions && data.environmentExtensions.liveSound && data.environmentExtensions.liveSound.trapRoutes);
  if (routes === undefined) return;
  if (!Array.isArray(routes)) {
    errors.push("trapRoutes must be an array when present");
    return;
  }
  routes.forEach((route, index) => {
    if (!route || typeof route !== "object" || Array.isArray(route)) {
      errors.push("trapRoutes[" + index + "] must be an object");
      return;
    }
    for (const key of ["from", "to", "concept", "severity", "message"]) {
      validateString(route[key], "trapRoutes[" + index + "]." + key, errors);
    }
    if (route.severity && !TRAP_SEVERITIES.has(route.severity)) {
      errors.push("trapRoutes[" + index + "].severity must be one of: " + Array.from(TRAP_SEVERITIES).join(", "));
    }
  });
}

function validateConstraintArray(value, vocab, errors, label) {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    errors.push(label + " must be an array when present");
    return;
  }
  value.forEach((constraint, index) => {
    const prefix = label + "[" + index + "]";
    if (!isPlainObject(constraint)) {
      errors.push(prefix + " must be an object");
      return;
    }
    validateString(constraint.id, prefix + ".id", errors);
    validateString(constraint.text, prefix + ".text", errors);
    validateString(constraint.concept, prefix + ".concept", errors);
    if (constraint.concept && !vocab.has(constraint.concept)) {
      errors.push(prefix + ".concept contains unknown concept tag: " + constraint.concept);
    }
    if (constraint.appliesTo !== undefined) {
      if (!Array.isArray(constraint.appliesTo) || constraint.appliesTo.some(item => typeof item !== "string" || item.trim().length === 0)) {
        errors.push(prefix + ".appliesTo must be an array of non-empty strings when present");
      } else {
        for (const tag of constraint.appliesTo) {
          if (!vocab.has(tag)) errors.push(prefix + ".appliesTo contains unknown concept tag: " + tag);
        }
      }
    }
  });
}

function validateMetadataObject(item, vocab) {
  const errors = [];
  const data = item.data;

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return [item.kind + " metadata must be an object"];
  }

  const taskMode = getTaskMode(data);
  const visibility = getVisibility(data);
  if (!TASK_MODES.has(taskMode)) errors.push("taskMode/puzzleMode must be one of: " + Array.from(TASK_MODES).join(", "));
  validateString(data.scenario, "scenario", errors);
  validateString(data.objective, "objective", errors);
  if (!VISIBILITIES.has(visibility)) errors.push("taskVisibility/routeListVisibility must be one of: " + Array.from(VISIBILITIES).join(", "));
  if (!Number.isInteger(data.difficulty) || data.difficulty < 1 || data.difficulty > 7) {
    errors.push("difficulty must be an integer from 1 through 7");
  }

  if (!Array.isArray(data.conceptTags) || data.conceptTags.length === 0) {
    errors.push("conceptTags must be a non-empty array");
  }
  validateConceptArray(data, "conceptTags", vocab, errors);
  validateConceptArray(data, "prerequisiteConcepts", vocab, errors);
  validateConceptArray(data, "assessedConcepts", vocab, errors);

  if (data.constraints !== undefined && !Array.isArray(data.constraints)) {
    errors.push("constraints must be an array when present");
  }
  if (data.completionExplanation !== undefined) validateString(data.completionExplanation, "completionExplanation", errors);
  validateFeedback(data.educationalFeedback, errors);
  validateTrapRoutes(data, errors);

  return errors;
}

function parseJsonForValidation(file, errors) {
  try {
    return readJson(file);
  } catch (error) {
    errors.push("file must parse as JSON: " + error.message);
    return null;
  }
}

function validateStableLevelId(levelId, errors) {
  if (typeof levelId !== "string" || levelId.trim().length === 0) {
    errors.push("level ID must be a non-empty string");
    return;
  }
  if (!/^(?:LIV-\d{3}|[A-Z]{3}-[A-Z0-9]+(?:-[A-Z0-9]+)*)$/.test(levelId)) {
    errors.push(levelId + ": level ID should be a stable uppercase ID such as LIV-011 or REC-IR-01");
  }
}

function validateNoForbiddenMapFields(value, levelId, errors, trail = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => validateNoForbiddenMapFields(item, levelId, errors, trail.concat(String(index))));
    return;
  }
  if (!isPlainObject(value)) return;

  for (const key of Object.keys(value)) {
    if (FORBIDDEN_MAP_FIELDS.has(key)) {
      const fieldPath = trail.concat(key).join(".");
      errors.push(levelId + ": forbidden render/route field: " + fieldPath);
    }
    validateNoForbiddenMapFields(value[key], levelId, errors, trail.concat(key));
  }
}

function validateBatchMapLevel(levelId, level, vocab, errors) {
  validateStableLevelId(levelId, errors);
  if (!isPlainObject(level)) {
    errors.push(levelId + ": level metadata must be an object");
    return;
  }

  validateNoForbiddenMapFields(level, levelId, errors);

  if (level.status !== undefined && !MAP_STATUSES.has(level.status)) {
    errors.push(levelId + ": status must be one of: " + Array.from(MAP_STATUSES).join(", "));
  }
  if (!TASK_MODES.has(level.taskMode)) {
    errors.push(levelId + ": taskMode must be one of: " + Array.from(TASK_MODES).join(", "));
  }
  validateString(level.scenario, levelId + ": scenario", errors);
  validateString(level.objective, levelId + ": objective", errors);
  if (!VISIBILITIES.has(level.taskVisibility)) {
    errors.push(levelId + ": taskVisibility must be one of: " + Array.from(VISIBILITIES).join(", "));
  }
  if (!Number.isInteger(level.difficulty) || level.difficulty < 1 || level.difficulty > 7) {
    errors.push(levelId + ": difficulty must be an integer from 1 through 7");
  }
  if (!Array.isArray(level.conceptTags) || level.conceptTags.length === 0) {
    errors.push(levelId + ": conceptTags must be a non-empty array");
  }
  validateConceptArray(level, "conceptTags", vocab, errors);
  validateConceptArray(level, "prerequisiteConcepts", vocab, errors);
  validateConceptArray(level, "assessedConcepts", vocab, errors);
  validateConstraintArray(level.constraints, vocab, errors, levelId + ": constraints");
  if (level.completionExplanation !== undefined) validateString(level.completionExplanation, levelId + ": completionExplanation", errors);
  if (level.migrationNotes !== undefined) validateString(level.migrationNotes, levelId + ": migrationNotes", errors);
}

function loadAndValidateBatchMap(fileArg) {
  const errors = [];
  if (!fileArg) {
    return { file: null, map: null, errors: ["map JSON path is required"] };
  }

  const file = path.resolve(repoRoot, fileArg);
  const map = parseJsonForValidation(file, errors);
  const vocab = loadVocabulary();

  if (map) {
    if (!isPlainObject(map)) {
      errors.push("map root must be an object");
    } else {
      if (map.schemaVersion === undefined) errors.push("schemaVersion is required");
      if (map.environment === undefined) errors.push("environment is required");
      else validateString(map.environment, "environment", errors);
      if (!isPlainObject(map.levels)) {
        errors.push("levels must be an object");
      } else {
        for (const [levelId, level] of Object.entries(map.levels)) {
          validateBatchMapLevel(levelId, level, vocab, errors);
        }
      }
    }
  }

  return { file, map, errors };
}

function validateBatchMap(fileArg) {
  const result = loadAndValidateBatchMap(fileArg);

  if (!fileArg) {
    console.error("validate-map requires a map JSON path.");
    process.exitCode = 1;
    return;
  }

  if (result.errors.length) {
    console.error("Batch puzzle metadata map validation failed:");
    for (const error of result.errors) console.error("  - " + error);
    process.exitCode = 1;
    return;
  }

  const map = result.map;
  const levelEntries = Object.entries(map.levels);
  const readyCount = levelEntries.filter(([, level]) => level.status === "apply-ready").length;
  const reviewCount = levelEntries.filter(([, level]) => level.status === "needs-review").length;
  console.log("Batch puzzle metadata map validation passed");
  console.log("Map:", rel(result.file));
  console.log("Environment:", map.environment);
  console.log("Schema version:", map.schemaVersion);
  console.log("Levels validated:", levelEntries.length);
  console.log("Apply-ready levels:", readyCount);
  console.log("Needs-review levels:", reviewCount);
  console.log("No files were modified by validate-map.");
}

function classifyApplyMapAction(levelId, level, sources) {
  const sourceRecord = sources.liveSources.find(item => item.id === levelId);
  const kinds = sourceKindsForId(sources, levelId);

  if (level.status === "needs-review") {
    return {
      levelId,
      status: level.status,
      action: "needs-review-skip",
      reason: "Level is marked needs-review in the batch map.",
      sources: kinds
    };
  }

  if (level.status !== "apply-ready") {
    return {
      levelId,
      status: level.status || "unspecified",
      action: "invalid-skip",
      reason: "Level is not marked apply-ready.",
      sources: kinds
    };
  }

  if (sourceRecord && (sourceRecord.hasPuzzle || sourceRecord.hasCurriculum)) {
    return {
      levelId,
      status: level.status,
      action: "already-has-source-and-metadata",
      reason: "Source board JSON already has puzzle/curriculum metadata.",
      sources: kinds
    };
  }

  if (sourceRecord) {
    return {
      levelId,
      status: level.status,
      action: "source-exists-add-metadata",
      reason: "Source board JSON exists and would receive curriculum metadata in a future write mode.",
      sources: kinds
    };
  }

  if (kinds.length) {
    return {
      levelId,
      status: level.status,
      action: "source-missing-create-required",
      reason: "No source board JSON exists yet.",
      sources: kinds
    };
  }

  return {
    levelId,
    status: level.status,
    action: "unknown-level-skip",
    reason: "Level ID was not discovered in current Signal Flow sources.",
    sources: []
  };
}

function buildApplyMapDryRun(file, map) {
  const sources = discoverSources();
  const levelEntries = Object.entries(map.levels);
  const actions = levelEntries.map(([levelId, level]) => classifyApplyMapAction(levelId, level, sources));

  return {
    mode: "dry-run",
    mapFile: rel(file),
    summary: {
      levelsInMap: levelEntries.length,
      applyReady: levelEntries.filter(([, level]) => level.status === "apply-ready").length,
      needsReview: levelEntries.filter(([, level]) => level.status === "needs-review").length,
      wouldWrite: 0
    },
    actions
  };
}

function printApplyMapDryRun(plan) {
  const applyReady = plan.actions.filter(item => item.status === "apply-ready");
  const skipped = plan.actions.filter(item => item.status !== "apply-ready" || item.action.endsWith("-skip"));

  console.log("Signal Flow apply-map dry run");
  console.log("Map:", plan.mapFile);
  console.log("");

  console.log("Apply-ready:");
  if (applyReady.length) {
    for (const item of applyReady) {
      console.log("  [ ] " + item.levelId + " - " + item.action + " - " + item.reason);
    }
  } else {
    console.log("  none");
  }
  console.log("");

  console.log("Skipped / needs review:");
  if (skipped.length) {
    for (const item of skipped) {
      console.log("  [ ] " + item.levelId + " - " + item.action + " - " + item.reason);
    }
  } else {
    console.log("  none");
  }
  console.log("");

  console.log("Would write files:");
  console.log("0, because this is dry-run only.");
  console.log("");
  console.log("No files were modified by apply-map --dry-run.");
}

function applyMapCommand(args) {
  const mapArg = args[0];
  const flags = new Set(args.slice(1));

  if (!mapArg) {
    console.error("apply-map requires a map JSON path and --dry-run.");
    process.exitCode = 1;
    return;
  }
  if (flags.has("--write")) {
    console.error("apply-map --write is not implemented yet. Use --dry-run to preview actions.");
    process.exitCode = 1;
    return;
  }
  if (!flags.has("--dry-run")) {
    console.error("apply-map requires --dry-run. Write mode is not implemented.");
    process.exitCode = 1;
    return;
  }

  const unsupported = Array.from(flags).filter(flag => flag !== "--dry-run" && flag !== "--json");
  if (unsupported.length) {
    console.error("Unsupported apply-map flag(s): " + unsupported.join(", "));
    process.exitCode = 1;
    return;
  }

  const validation = loadAndValidateBatchMap(mapArg);
  if (validation.errors.length) {
    console.error("Batch puzzle metadata map validation failed:");
    for (const error of validation.errors) console.error("  - " + error);
    process.exitCode = 1;
    return;
  }

  const plan = buildApplyMapDryRun(validation.file, validation.map);
  if (flags.has("--json")) {
    console.log(JSON.stringify(plan, null, 2));
  } else {
    printApplyMapDryRun(plan);
  }
}

function printAudit() {
  const sources = discoverSources();
  console.log("Signal Flow level data source audit");
  console.log("");
  console.log("Live-sound source board JSON:", sources.liveSources.length);
  console.log("Live-sound normalized board JSON:", sources.normalized.length);
  console.log("Live-sound native renderer IDs:", sources.rendererIds.length);
  console.log("Live-sound adapter/allowlist IDs:", sources.adapterIds.length);
  console.log("IR data module IDs:", sources.irIds.length);
  console.log("Launcher files scanned:", sources.launchFiles.length);
  console.log("Launcher-discovered level IDs:", sources.launchIds.length);
  console.log("Asset/schema manifests discovered:", sources.assetManifests.length);
  console.log("");
  console.log("JSON-backed live-sound boards:");
  console.log(sources.liveSources.map(item => "  " + item.id + " (" + rel(item.file) + ")").join("\n") || "  none");
  console.log("");
  console.log("Embedded/JS-backed sources:");
  console.log("  " + rel(rendererPath));
  console.log("  " + rel(adapterPath));
  console.log("  " + rel(irDataPath));
  for (const launch of sources.launchFiles) console.log("  " + rel(launch.file));
  console.log("");
  console.log("Current limitations:");
  console.log("  - Universal curriculum metadata is not yet a renderer input.");
  console.log("  - Many levels are still embedded in JS/HTML.");
  console.log("  - Only live-sound board JSON currently has validated puzzle metadata.");
  console.log("  - apply-map and normalize-all write flows are intentionally not implemented yet.");
}

function printCoverage() {
  const sources = discoverSources();
  const liveMeta = sources.liveSources.filter(item => item.hasPuzzle || item.hasCurriculum);
  const known = sources.sourceIds;
  const metadataIds = new Set(liveMeta.map(item => item.id));
  const missing = known.filter(id => !metadataIds.has(id));

  console.log("Signal Flow puzzle/curriculum metadata coverage");
  console.log("");
  console.log("Known level IDs discovered:", known.length);
  console.log("Levels with JSON puzzle/curriculum metadata:", liveMeta.length);
  console.log("Coverage:", known.length ? Math.round((liveMeta.length / known.length) * 1000) / 10 + "%" : "n/a");
  console.log("");
  console.log("Metadata-backed levels:");
  console.log(liveMeta.map(item => "  " + item.id + " (" + (item.hasCurriculum ? "curriculum" : "puzzle") + ")").join("\n") || "  none");
  console.log("");
  console.log("Known levels without JSON curriculum metadata:", missing.length);
  console.log(missing.slice(0, 80).map(id => "  " + id).join("\n") || "  none");
  if (missing.length > 80) console.log("  ... " + (missing.length - 80) + " more");
}

function sourceKindsForId(sources, id) {
  const kinds = [];
  if (sources.liveSources.some(item => item.id === id)) kinds.push("source-json");
  if (sources.normalized.some(item => item.id === id)) kinds.push("normalized-json");
  if (sources.rendererIds.includes(id)) kinds.push("native-renderer");
  if (sources.adapterIds.includes(id)) kinds.push("adapter/allowlist");
  if (sources.irIds.includes(id)) kinds.push("ir-js");
  if (sources.launchIds.includes(id)) kinds.push("launcher");
  return kinds;
}

function actionForLevel(sources, id, metadataIds, sourceIds) {
  const kinds = sourceKindsForId(sources, id);
  if (metadataIds.has(id)) return "already covered";
  if (sourceIds.has(id)) return "add curriculum/puzzle metadata";
  if (kinds.includes("native-renderer") || kinds.includes("launcher")) return "create source manifest, then add metadata";
  return "audit source location before metadata";
}

function printReport() {
  const sources = discoverSources();
  const liveMeta = sources.liveSources.filter(item => item.hasPuzzle || item.hasCurriculum);
  const metadataIds = new Set(liveMeta.map(item => item.id));
  const sourceIds = new Set(sources.liveSources.map(item => item.id));
  const knownIds = sources.sourceIds;
  const coverage = knownIds.length ? Math.round((metadataIds.size / knownIds.length) * 1000) / 10 : 0;
  const roadmapMissing = PATCH_BOARD_ROADMAP_ORDER.filter(id => !metadataIds.has(id));
  const sourceManifestGaps = roadmapMissing.filter(id => !sourceIds.has(id));
  const sourceJsonWithoutMetadata = sources.liveSources.filter(item => !metadataIds.has(item.id)).map(item => item.id);
  const embeddedOnly = knownIds.filter(id => !sourceIds.has(id) && !metadataIds.has(id));
  const recommended = roadmapMissing.slice(0, 10).map(id => ({
    id,
    action: actionForLevel(sources, id, metadataIds, sourceIds),
    sources: sourceKindsForId(sources, id)
  }));

  console.log("Signal Flow actionable puzzle metadata report");
  console.log("");
  console.log("Coverage summary:");
  console.log("  Known level IDs discovered:", knownIds.length);
  console.log("  Levels with JSON puzzle/curriculum metadata:", metadataIds.size);
  console.log("  Coverage:", coverage + "%");
  console.log("  Live-sound roadmap targets:", PATCH_BOARD_ROADMAP_ORDER.length);
  console.log("  Live-sound roadmap targets still missing metadata:", roadmapMissing.length);
  console.log("");

  console.log("Recommended next batch:");
  if (recommended.length) {
    for (const item of recommended) {
      const sourceText = item.sources.length ? item.sources.join(", ") : "not discovered";
      console.log("  " + item.id + " - " + item.action + " [" + sourceText + "]");
    }
  } else {
    console.log("  none");
  }
  console.log("");

  console.log("Needs source board manifests:");
  if (sourceManifestGaps.length) {
    for (const id of sourceManifestGaps.slice(0, 40)) {
      const kinds = sourceKindsForId(sources, id);
      console.log("  " + id + " [" + (kinds.length ? kinds.join(", ") : "not discovered") + "]");
    }
    if (sourceManifestGaps.length > 40) console.log("  ... " + (sourceManifestGaps.length - 40) + " more");
  } else {
    console.log("  none");
  }
  console.log("");

  console.log("Source JSON without metadata:");
  console.log(sourceJsonWithoutMetadata.map(id => "  " + id).join("\n") || "  none");
  console.log("");

  console.log("Embedded/JS-only coverage gaps:");
  if (embeddedOnly.length) {
    for (const id of embeddedOnly.slice(0, 60)) {
      const kinds = sourceKindsForId(sources, id);
      console.log("  " + id + " [" + (kinds.length ? kinds.join(", ") : "unknown") + "]");
    }
    if (embeddedOnly.length > 60) console.log("  ... " + (embeddedOnly.length - 60) + " more");
  } else {
    console.log("  none");
  }
  console.log("");

  console.log("Batch map files to create:");
  for (const file of BATCH_MAP_FILES) console.log("  " + file);
  console.log("");

  console.log("Suggested order:");
  console.log("  1. Create source manifests for the recommended live-sound batch where missing.");
  console.log("  2. Draft data/puzzle-metadata/live-sound.json from those manifests.");
  console.log("  3. Validate concepts against data/puzzle-metadata/concept-vocabulary.json.");
  console.log("  4. Keep renderer integration paused until metadata coverage and normalization are stable.");
  console.log("");
  console.log("No files were modified by this report command.");
}

function validateAll() {
  const sources = discoverSources();
  const vocab = loadVocabulary();
  const items = sources.liveSources.flatMap(metadataObjectsForBoard);
  const errors = [];

  for (const item of items) {
    const itemErrors = validateMetadataObject(item, vocab);
    for (const error of itemErrors) {
      errors.push(rel(item.file) + " " + item.kind + " " + item.levelId + ": " + error);
    }
  }

  if (errors.length) {
    console.error("Signal Flow puzzle/curriculum metadata validation failed:");
    for (const error of errors) console.error("  - " + error);
    process.exitCode = 1;
    return;
  }

  console.log("Signal Flow puzzle/curriculum metadata validation passed");
  console.log("Validated metadata objects:", items.length);
  console.log("Live-sound source boards scanned:", sources.liveSources.length);
  console.log("Vocabulary concepts:", vocab.size);
}

const command = process.argv[2];
if (!command || command === "help" || command === "--help" || command === "-h") {
  usage();
} else if (command === "audit") {
  printAudit();
} else if (command === "coverage") {
  printCoverage();
} else if (command === "report") {
  printReport();
} else if (command === "validate-all") {
  validateAll();
} else if (command === "validate-map") {
  validateBatchMap(process.argv[3]);
} else if (command === "apply-map") {
  applyMapCommand(process.argv.slice(3));
} else if (command === "normalize-all") {
  console.error(command + " is documented for the future but is not implemented in this read-only scaffold.");
  process.exitCode = 1;
} else {
  console.error("Unknown command: " + command);
  usage();
  process.exitCode = 1;
}
