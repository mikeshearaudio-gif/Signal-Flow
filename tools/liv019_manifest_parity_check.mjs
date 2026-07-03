#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceManifestPath = path.join(root, "data/live-sound/boards/liv019.json");
const normalizedManifestPath = path.join(root, "data/live-sound/boards/normalized/liv019.normalized.json");
const snapshotDir = path.join(root, "audit/liv019-preservation-snapshot");
const mapPath = path.join(root, "data/puzzle-metadata/live-sound.json");
const failures = [];

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`Missing required file: ${relativePath}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    failures.push(`Could not parse ${relativePath}: ${error.message}`);
    return null;
  }
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function routeSignatureFromManifest(route) {
  return {
    id: route.id,
    fromId: route.fromId,
    toId: route.toId,
    fromLabel: route.fromLabel,
    toLabel: route.toLabel,
    stereoGroup: route.stereoGroup || null,
    stereoSide: route.stereoSide || null
  };
}

function routeSignatureFromSnapshot(route) {
  return {
    id: route.id,
    fromId: route.source.id,
    toId: route.destination.id,
    fromLabel: route.source.label,
    toLabel: route.destination.label,
    stereoGroup: route.stereo.groupId || null,
    stereoSide: route.stereo.side || null
  };
}

function stable(value) {
  if (Array.isArray(value)) return "[" + value.map(stable).join(",") + "]";
  if (value && typeof value === "object") {
    return "{" + Object.keys(value).sort().map(key => JSON.stringify(key) + ":" + stable(value[key])).join(",") + "}";
  }
  return JSON.stringify(value);
}

const board = readJson("data/live-sound/boards/liv019.json");
const normalized = readJson("data/live-sound/boards/normalized/liv019.normalized.json");
const routesEvidence = readJson("audit/liv019-preservation-snapshot/routes.json");
const groupsEvidence = readJson("audit/liv019-preservation-snapshot/stereo-groups.json");
const hitboxesEvidence = readJson("audit/liv019-preservation-snapshot/good-hitboxes.json");
const wrongEvidence = readJson("audit/liv019-preservation-snapshot/wrong-route-pairs.json");
const lockedEvidence = readJson("audit/liv019-preservation-snapshot/locked-behavior.json");
const liveSoundMap = readJson("data/puzzle-metadata/live-sound.json");

assert(fs.existsSync(snapshotDir), "Missing snapshot directory: audit/liv019-preservation-snapshot");
assert(fs.existsSync(sourceManifestPath), "Missing source manifest: data/live-sound/boards/liv019.json");
assert(fs.existsSync(normalizedManifestPath), "Missing normalized manifest: data/live-sound/boards/normalized/liv019.normalized.json");

if (board && routesEvidence) {
  assert(board.levelId === "LIV-019", "Source manifest levelId must be LIV-019");
  assert(board.environment === "live", "Source manifest environment must be live");
  assert(Array.isArray(board.requiredRoutes), "Source manifest requiredRoutes must be an array");
  assert(board.requiredRoutes?.length === 21, `Source manifest must contain 21 required routes, found ${board.requiredRoutes?.length}`);
  assert(board.acceptance?.routeCount === 21, "Source manifest acceptance.routeCount must be 21");

  const boardRoutes = (board.requiredRoutes || []).map(routeSignatureFromManifest).sort((a, b) => a.id.localeCompare(b.id));
  const snapshotRoutes = (routesEvidence.routes || []).map(routeSignatureFromSnapshot).sort((a, b) => a.id.localeCompare(b.id));
  assert(stable(boardRoutes) === stable(snapshotRoutes), "Source manifest routes must match snapshot route IDs, endpoints, labels, and stereo tags");
}

if (board && groupsEvidence) {
  assert(Array.isArray(board.stereoGroups), "Source manifest stereoGroups must be an array");
  assert(board.stereoGroups?.length === 5, `Source manifest must contain 5 stereo groups, found ${board.stereoGroups?.length}`);
  assert(board.acceptance?.stereoGroupCount === 5, "Source manifest acceptance.stereoGroupCount must be 5");

  const boardGroups = (board.stereoGroups || []).map(group => ({
    id: group.id,
    leftRouteId: group.leftRouteId,
    rightRouteId: group.rightRouteId
  })).sort((a, b) => a.id.localeCompare(b.id));
  const snapshotGroups = (groupsEvidence.stereoGroups || []).map(group => {
    const left = group.routes.find(route => route.side === "left");
    const right = group.routes.find(route => route.side === "right");
    return {
      id: group.id,
      leftRouteId: left?.id,
      rightRouteId: right?.id
    };
  }).sort((a, b) => a.id.localeCompare(b.id));
  assert(stable(boardGroups) === stable(snapshotGroups), "Source manifest stereo groups must match snapshot route membership");
}

if (board && hitboxesEvidence) {
  assert(Array.isArray(board.hitboxes?.good), "Source manifest hitboxes.good must be an array");
  assert(board.hitboxes.good.length === 70, `Source manifest must preserve 70 good hitboxes, found ${board.hitboxes.good.length}`);
  assert(board.acceptance?.goodHitboxCount === 70, "Source manifest acceptance.goodHitboxCount must be 70");
  const boardHitboxIds = board.hitboxes.good.map(hitbox => hitbox.id).sort();
  const snapshotHitboxIds = hitboxesEvidence.hitboxes.map(hitbox => hitbox.id).sort();
  assert(JSON.stringify(boardHitboxIds) === JSON.stringify(snapshotHitboxIds), "Source manifest good hitbox IDs must match snapshot");
  assert(board.preservation?.lockedBehavior?.hitboxLockExpected === 70, "Source manifest must reference hitbox lock expected count 70");
  assert(board.preservation?.lockedBehavior?.hitboxLockMissingCount === 0, "Source manifest must reference hitbox lock missingCount 0");
}

if (board && wrongEvidence) {
  assert((board.forbiddenRoutes || []).length === 0, "Source manifest must not convert wrong-route examples into forbiddenRoutes");
  assert(board.preservation?.wrongRouteEvidenceOnly === true, "Source manifest must mark wrong-route examples as preservation evidence only");
  assert(board.preservation?.wrongRouteExamples?.length === 6, `Source manifest must preserve 6 wrong-route evidence examples, found ${board.preservation?.wrongRouteExamples?.length}`);
  assert(board.acceptance?.wrongRouteEvidenceCount === 6, "Source manifest acceptance.wrongRouteEvidenceCount must be 6");
}

if (board && lockedEvidence) {
  assert((board.hitboxes?.false || []).length === 0, "Source manifest must not invent false/trap hitboxes");
  assert(board.acceptance?.falseHitboxCount === 0, "Source manifest acceptance.falseHitboxCount must be 0");
  assert(board.preservation?.falseTrapEvidence?.canonicalFalseHitboxSourceFound === false, "Source manifest must not claim canonical false hitbox evidence exists");
  assert(board.preservation?.falseTrapEvidence?.canonicalTrapMetadataFound === false, "Source manifest must not claim canonical trap metadata exists");
  assert(board.preservation?.lockedBehavior?.cableLayer === ".sf-native-cables", "Source manifest must preserve native cable layer reference");
  assert(board.preservation?.lockedBehavior?.stageboxInputCount === 8, "Source manifest must preserve stagebox 8-input lock reference");
  assert(board.preservation?.lockedBehavior?.cleanFinalizerRole === "tool-cleanup-only-no-cables", "Source manifest must preserve clean finalizer role");
}

if (board && liveSoundMap) {
  const entry = liveSoundMap.levels?.["LIV-019"];
  assert(entry?.status === "needs-review", "LIV-019 must remain needs-review in data/puzzle-metadata/live-sound.json");
  assert(board.puzzle?.puzzleMode === entry.taskMode, "Source manifest puzzleMode must match batch taskMode");
  assert(board.puzzle?.routeListVisibility === entry.taskVisibility, "Source manifest routeListVisibility must match batch taskVisibility");
  assert(board.puzzle?.difficulty === entry.difficulty, "Source manifest difficulty must match batch difficulty");
  assert(JSON.stringify(board.puzzle?.conceptTags || []) === JSON.stringify(entry.conceptTags || []), "Source manifest conceptTags must match batch metadata");
}

if (normalized && board) {
  assert(normalized.levelId === "LIV-019", "Normalized manifest levelId must be LIV-019");
  assert(normalized.routeCount === 21, "Normalized manifest routeCount must be 21");
  assert(normalized.routes?.length === 21, "Normalized manifest routes array must contain 21 routes");
  assert(normalized.stereoGroups?.length === 5, "Normalized manifest stereoGroups must contain 5 groups");
  assert(normalized.hitboxes?.good?.length === 70, "Normalized manifest hitboxes.good must contain 70 hitboxes");
  assert((normalized.hitboxes?.false || []).length === 0, "Normalized manifest must not contain false/trap hitboxes");
  assert(normalized.nodes?.falseTrapKeys?.length === 0, "Normalized manifest falseTrapKeys must be empty");
  assert(normalized.puzzle?.puzzleMode === board.puzzle?.puzzleMode, "Normalized manifest must preserve puzzle metadata");
}

const summary = {
  levelId: "LIV-019",
  mode: "read-only",
  ok: failures.length === 0,
  counts: {
    routes: board?.requiredRoutes?.length ?? null,
    stereoGroups: board?.stereoGroups?.length ?? null,
    goodHitboxes: board?.hitboxes?.good?.length ?? null,
    falseHitboxes: board?.hitboxes?.false?.length ?? null,
    wrongRouteEvidence: board?.preservation?.wrongRouteExamples?.length ?? null,
    normalizedRoutes: normalized?.routes?.length ?? null
  },
  status: liveSoundMap?.levels?.["LIV-019"]?.status ?? null,
  failures
};

if (failures.length) {
  console.error("LIV-019 manifest parity check failed");
  console.error(JSON.stringify(summary, null, 2));
  process.exit(1);
}

console.log("LIV-019 manifest parity check passed");
console.log(JSON.stringify(summary, null, 2));
