#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceManifestPath = path.join(root, "data/live-sound/boards/liv023.json");
const normalizedManifestPath = path.join(root, "data/live-sound/boards/normalized/liv023.normalized.json");
const snapshotDir = path.join(root, "audit/liv023-preservation-snapshot");
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

function stable(value) {
  if (Array.isArray(value)) return "[" + value.map(stable).join(",") + "]";
  if (value && typeof value === "object") {
    return "{" + Object.keys(value).sort().map(key => JSON.stringify(key) + ":" + stable(value[key])).join(",") + "}";
  }
  return JSON.stringify(value);
}

function routeSignatureFromManifest(route) {
  return {
    id: route.id,
    fromId: route.fromId,
    toId: route.toId,
    fromLabel: route.fromLabel,
    toLabel: route.toLabel,
    stereoGroup: route.stereoGroup || null,
    stereoSide: route.stereoSide || null,
    routeFamily: route.routeFamily || null
  };
}

function routeSignatureFromSnapshot(route) {
  return {
    id: route.id,
    fromId: route.from?.id,
    toId: route.to?.id,
    fromLabel: route.from?.label,
    toLabel: route.to?.label,
    stereoGroup: route.stereoGroup || null,
    stereoSide: route.stereoSide || null,
    routeFamily: route.routeFamily || null
  };
}

const board = readJson("data/live-sound/boards/liv023.json");
const normalized = readJson("data/live-sound/boards/normalized/liv023.normalized.json");
const routesEvidence = readJson("audit/liv023-preservation-snapshot/routes.json");
const groupsEvidence = readJson("audit/liv023-preservation-snapshot/stereo-groups.json");
const goodHitboxesEvidence = readJson("audit/liv023-preservation-snapshot/good-hitboxes.json");
const falseHitboxesEvidence = readJson("audit/liv023-preservation-snapshot/false-hitboxes.json");
const wrongRouteEvidence = readJson("audit/liv023-preservation-snapshot/wrong-route-behavior.json");
const lockedEvidence = readJson("audit/liv023-preservation-snapshot/locked-behavior.json");
const liveSoundMap = readJson("data/puzzle-metadata/live-sound.json");

assert(fs.existsSync(snapshotDir), "Missing snapshot directory: audit/liv023-preservation-snapshot");
assert(fs.existsSync(sourceManifestPath), "Missing source manifest: data/live-sound/boards/liv023.json");
assert(fs.existsSync(normalizedManifestPath), "Missing normalized manifest: data/live-sound/boards/normalized/liv023.normalized.json");

if (board && routesEvidence) {
  assert(board.levelId === "LIV-023", "Source manifest levelId must be LIV-023");
  assert(board.environment === "live", "Source manifest environment must be live");
  assert(Array.isArray(board.requiredRoutes), "Source manifest requiredRoutes must be an array");
  assert(board.requiredRoutes?.length === 15, `Source manifest must contain 15 required routes, found ${board.requiredRoutes?.length}`);
  assert(board.acceptance?.routeCount === 15, "Source manifest acceptance.routeCount must be 15");

  const boardRoutes = (board.requiredRoutes || []).map(routeSignatureFromManifest).sort((a, b) => a.id.localeCompare(b.id));
  const snapshotRoutes = (routesEvidence.routes || []).map(routeSignatureFromSnapshot).sort((a, b) => a.id.localeCompare(b.id));
  assert(stable(boardRoutes) === stable(snapshotRoutes), "Source manifest routes must match snapshot route IDs, endpoints, labels, route families, and stereo tags");
}

if (board && groupsEvidence) {
  assert(Array.isArray(board.stereoGroups), "Source manifest stereoGroups must be an array");
  assert(board.stereoGroups?.length === 6, `Source manifest must contain 6 stereo groups, found ${board.stereoGroups?.length}`);
  assert(board.acceptance?.stereoGroupCount === 6, "Source manifest acceptance.stereoGroupCount must be 6");

  const boardGroups = (board.stereoGroups || []).map(group => ({
    id: group.id,
    leftRouteId: group.leftRouteId,
    rightRouteId: group.rightRouteId
  })).sort((a, b) => a.id.localeCompare(b.id));
  const snapshotGroups = (groupsEvidence.stereoGroups || []).map(group => {
    const leftId = group.routeIds?.find(routeId => group.routeSides?.[routeId] === "left");
    const rightId = group.routeIds?.find(routeId => group.routeSides?.[routeId] === "right");
    return {
      id: group.id,
      leftRouteId: leftId,
      rightRouteId: rightId
    };
  }).sort((a, b) => a.id.localeCompare(b.id));
  assert(stable(boardGroups) === stable(snapshotGroups), "Source manifest stereo groups must match snapshot route membership");
}

if (board && goodHitboxesEvidence && falseHitboxesEvidence) {
  assert(Array.isArray(board.hitboxes?.good), "Source manifest hitboxes.good must be an array");
  assert(Array.isArray(board.hitboxes?.false), "Source manifest hitboxes.false must be an array");
  assert(board.hitboxes.good.length === 30, `Source manifest must preserve 30 good hitboxes, found ${board.hitboxes.good.length}`);
  assert(board.hitboxes.false.length === 101, `Source manifest must preserve 101 false hitboxes, found ${board.hitboxes.false.length}`);
  assert(board.acceptance?.goodHitboxCount === 30, "Source manifest acceptance.goodHitboxCount must be 30");
  assert(board.acceptance?.falseHitboxCount === 101, "Source manifest acceptance.falseHitboxCount must be 101");

  const boardGoodIds = board.hitboxes.good.map(hitbox => hitbox.id).sort();
  const snapshotGoodIds = goodHitboxesEvidence.hitboxes.map(hitbox => hitbox.key).sort();
  assert(JSON.stringify(boardGoodIds) === JSON.stringify(snapshotGoodIds), "Source manifest good hitbox IDs must match snapshot");

  const boardFalseIds = board.hitboxes.false.map(hitbox => hitbox.id).sort();
  const snapshotFalseIds = falseHitboxesEvidence.hitboxes.map(hitbox => hitbox.key).sort();
  assert(JSON.stringify(boardFalseIds) === JSON.stringify(snapshotFalseIds), "Source manifest false hitbox IDs must match snapshot");

  for (const hitbox of board.hitboxes.false) {
    assert(hitbox.completionCredit === false, `False hitbox ${hitbox.id} must be non-completing`);
    assert(hitbox.hintable === false, `False hitbox ${hitbox.id} must be excluded from hints`);
    assert(hitbox.neutralBeforeInteraction === true, `False hitbox ${hitbox.id} must remain neutral before interaction`);
  }

  const validEndpointKeys = new Set();
  for (const route of board.requiredRoutes || []) {
    validEndpointKeys.add(route.fromId);
    validEndpointKeys.add(route.toId);
  }
  for (const falseHitbox of board.hitboxes.false) {
    assert(!validEndpointKeys.has(falseHitbox.id), `False hitbox ${falseHitbox.id} must not be a required route endpoint`);
  }
}

if (board && wrongRouteEvidence) {
  assert((board.forbiddenRoutes || []).length === 0, "Source manifest must not convert wrong-route examples into forbiddenRoutes");
  assert(Array.isArray(board.puzzle?.trapRoutes), "Source manifest puzzle.trapRoutes must be an array");
  assert(board.puzzle.trapRoutes.length === 0, "Source manifest must not invent canonical trapRoutes");
  assert(board.invalidRouteEvidence?.preservationOnly === true, "Invalid route evidence must be marked preservation-only");
  assert(board.invalidRouteEvidence?.notValidRoutes === true, "Invalid route evidence must be marked not valid routes");
  assert(board.invalidRouteEvidence?.notCompletionRoutes === true, "Invalid route evidence must be marked non-completing");
  assert(board.invalidRouteEvidence?.broadInvalidRouteRule?.invalidRoutesCountTowardCompletion === false, "Invalid route evidence must remain non-completing");
  assert(board.invalidRouteEvidence?.broadInvalidRouteRule?.hintsExcludeFalseJacks === true, "Invalid route evidence must record hint exclusion for false jacks");
  assert(board.invalidRouteEvidence?.launcherForbiddenExamples?.length === 4, `Source manifest must preserve 4 launcher forbidden examples, found ${board.invalidRouteEvidence?.launcherForbiddenExamples?.length}`);
}

if (board && lockedEvidence) {
  assert(board.preservation?.status === "needs-review", "Source manifest preservation status must remain needs-review");
  assert(board.preservation?.preservationRequired === true, "Source manifest must remain preservation-required");
  assert(board.preservation?.lockedBehavior?.customScrollHostClass === "sf-live-native-liv023-scroll-host", "Source manifest must preserve custom scroll host reference");
  assert(board.preservation?.lockedBehavior?.legacyMaskClass === "sf-liv023-native-legacy-mask", "Source manifest must preserve legacy mask reference");
  assert(board.preservation?.lockedBehavior?.routeLayer === ".sf-native-cables", "Source manifest must preserve native cable layer reference");
  assert(board.preservation?.lockedBehavior?.gearLayoutCount === 19, "Source manifest must preserve gear layout count evidence");
  assert(board.preservation?.lockedBehavior?.labelLayoutCount === 11, "Source manifest must preserve label layout count evidence");
}

if (board && liveSoundMap) {
  const entry = liveSoundMap.levels?.["LIV-023"];
  assert(entry?.status === "needs-review", "LIV-023 must remain needs-review in data/puzzle-metadata/live-sound.json");
  assert(board.puzzle?.puzzleMode === entry.taskMode, "Source manifest puzzleMode must match batch taskMode");
  assert(board.puzzle?.routeListVisibility === entry.taskVisibility, "Source manifest routeListVisibility must match batch taskVisibility");
  assert(board.puzzle?.difficulty === entry.difficulty, "Source manifest difficulty must match batch difficulty");
  assert(JSON.stringify(board.puzzle?.conceptTags || []) === JSON.stringify(entry.conceptTags || []), "Source manifest conceptTags must match batch metadata");
}

if (normalized && board) {
  assert(normalized.levelId === "LIV-023", "Normalized manifest levelId must be LIV-023");
  assert(normalized.routeCount === 15, "Normalized manifest routeCount must be 15");
  assert(normalized.routes?.length === 15, "Normalized manifest routes array must contain 15 routes");
  assert(normalized.stereoGroups?.length === 6, "Normalized manifest stereoGroups must contain 6 groups");
  assert(normalized.hitboxes?.good?.length === 30, "Normalized manifest hitboxes.good must contain 30 hitboxes");
  assert(normalized.hitboxes?.false?.length === 101, "Normalized manifest hitboxes.false must contain 101 hitboxes");
  assert(normalized.nodes?.falseTrapKeys?.length === 101, "Normalized manifest falseTrapKeys must contain 101 false hitboxes");
  assert(normalized.puzzle?.puzzleMode === board.puzzle?.puzzleMode, "Normalized manifest must preserve puzzle metadata");
  assert(normalized.preservation?.status === "needs-review", "Normalized manifest must preserve preservation metadata");
  assert(normalized.invalidRouteEvidence?.preservationOnly === true, "Normalized manifest must preserve invalid route evidence");
}

const summary = {
  levelId: "LIV-023",
  mode: "read-only",
  ok: failures.length === 0,
  counts: {
    routes: board?.requiredRoutes?.length ?? null,
    stereoGroups: board?.stereoGroups?.length ?? null,
    goodHitboxes: board?.hitboxes?.good?.length ?? null,
    falseHitboxes: board?.hitboxes?.false?.length ?? null,
    launcherForbiddenExamples: board?.invalidRouteEvidence?.launcherForbiddenExamples?.length ?? null,
    normalizedRoutes: normalized?.routes?.length ?? null
  },
  status: liveSoundMap?.levels?.["LIV-023"]?.status ?? null,
  failures
};

if (failures.length) {
  console.error("LIV-023 manifest parity check failed");
  console.error(JSON.stringify(summary, null, 2));
  process.exit(1);
}

console.log("LIV-023 manifest parity check passed");
console.log(JSON.stringify(summary, null, 2));
