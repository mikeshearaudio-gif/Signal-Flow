#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const snapshotDir = path.join(root, "audit/liv026-preservation-snapshot");
const sourceManifestPath = path.join(root, "data/live-sound/boards/liv026.json");
const normalizedManifestPath = path.join(root, "data/live-sound/boards/normalized/liv026.normalized.json");

const failures = [];

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`Missing required evidence file: ${relativePath}`);
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

const routes = readJson("audit/liv026-preservation-snapshot/routes.json");
const stereoGroups = readJson("audit/liv026-preservation-snapshot/stereo-groups.json");
const goodHitboxes = readJson("audit/liv026-preservation-snapshot/good-hitboxes.json");
const falseHitboxes = readJson("audit/liv026-preservation-snapshot/false-hitboxes.json");
const wrongRouteBehavior = readJson("audit/liv026-preservation-snapshot/wrong-route-behavior.json");
const lockedBehavior = readJson("audit/liv026-preservation-snapshot/locked-behavior.json");
const liveSoundMap = readJson("data/puzzle-metadata/live-sound.json");

assert(fs.existsSync(snapshotDir), "Missing snapshot directory: audit/liv026-preservation-snapshot");

const runtimeManifestExists = fs.existsSync(sourceManifestPath);
const normalizedManifestExists = fs.existsSync(normalizedManifestPath);
assert(!runtimeManifestExists, "Runtime source manifest must not exist during readiness: data/live-sound/boards/liv026.json");
assert(!normalizedManifestExists, "Normalized runtime manifest must not exist during readiness: data/live-sound/boards/normalized/liv026.normalized.json");

if (routes) {
  assert(routes.levelId === "LIV-026", "routes.json levelId must be LIV-026");
  assert(routes.routeCount === 15, `routes.json routeCount must be 15, found ${routes.routeCount}`);
  assert(Array.isArray(routes.routes), "routes.json routes must be an array");
  assert(routes.routes?.length === 15, `routes.json routes array must contain 15 routes, found ${routes.routes?.length}`);
  for (const route of routes.routes || []) {
    assert(route.id, "Each route must have an id");
    assert(route.from?.id, `Route ${route.id || "(missing id)"} must have from.id`);
    assert(route.to?.id, `Route ${route.id || "(missing id)"} must have to.id`);
    assert(route.routeFamily, `Route ${route.id || "(missing id)"} must have routeFamily`);
    assert(typeof route.partOfStereoGroup === "boolean", `Route ${route.id || "(missing id)"} must state partOfStereoGroup`);
  }
}

if (stereoGroups) {
  assert(stereoGroups.levelId === "LIV-026", "stereo-groups.json levelId must be LIV-026");
  assert(stereoGroups.stereoGroupCount === 6, `stereo-groups.json stereoGroupCount must be 6, found ${stereoGroups.stereoGroupCount}`);
  assert(Array.isArray(stereoGroups.stereoGroups), "stereo-groups.json stereoGroups must be an array");
  assert(stereoGroups.stereoGroups?.length === 6, `stereo-groups.json stereoGroups array must contain 6 groups, found ${stereoGroups.stereoGroups?.length}`);
  for (const group of stereoGroups.stereoGroups || []) {
    assert(group.id, "Each stereo group must have an id");
    assert(Array.isArray(group.routeIds) && group.routeIds.length === 2, `Stereo group ${group.id || "(missing id)"} must contain exactly 2 route IDs`);
    assert(group.routeSides && typeof group.routeSides === "object", `Stereo group ${group.id || "(missing id)"} must include routeSides`);
    assert(group.purpose, `Stereo group ${group.id || "(missing id)"} must include a purpose`);
  }
}

if (goodHitboxes) {
  assert(goodHitboxes.levelId === "LIV-026", "good-hitboxes.json levelId must be LIV-026");
  assert(goodHitboxes.trueHitboxCount === 31, `good-hitboxes.json trueHitboxCount must be 31, found ${goodHitboxes.trueHitboxCount}`);
  assert(goodHitboxes.expectedCount === 31, `good-hitboxes.json expectedCount must be 31, found ${goodHitboxes.expectedCount}`);
  assert(goodHitboxes.requiredEndpointHitboxCount === 30, `good-hitboxes.json requiredEndpointHitboxCount must be 30, found ${goodHitboxes.requiredEndpointHitboxCount}`);
  assert(goodHitboxes.unusedBakedTrueHitboxCount === 1, `good-hitboxes.json unusedBakedTrueHitboxCount must be 1, found ${goodHitboxes.unusedBakedTrueHitboxCount}`);
  assert(Array.isArray(goodHitboxes.hitboxes), "good-hitboxes.json hitboxes must be an array");
  assert(goodHitboxes.hitboxes?.length === 31, `good-hitboxes.json hitboxes array must contain 31 hitboxes, found ${goodHitboxes.hitboxes?.length}`);
  assert(goodHitboxes.coordinateSystem === "liv026-board-pixels", "good-hitboxes.json coordinateSystem must be liv026-board-pixels");

  const unused = (goodHitboxes.hitboxes || []).filter(hitbox => hitbox.kind !== "good");
  assert(unused.length === 1, `Exactly one baked true hitbox should be non-required, found ${unused.length}`);
  assert(unused[0]?.key === "liv026-delay-processor-input-unused", `Unused baked true hitbox must be liv026-delay-processor-input-unused, found ${unused[0]?.key || "(none)"}`);
}

if (falseHitboxes) {
  assert(falseHitboxes.levelId === "LIV-026", "false-hitboxes.json levelId must be LIV-026");
  assert(falseHitboxes.falseHitboxCount === 28, `false-hitboxes.json falseHitboxCount must be 28, found ${falseHitboxes.falseHitboxCount}`);
  assert(falseHitboxes.expectedCount === 28, `false-hitboxes.json expectedCount must be 28, found ${falseHitboxes.expectedCount}`);
  assert(Array.isArray(falseHitboxes.hitboxes), "false-hitboxes.json hitboxes must be an array");
  assert(falseHitboxes.hitboxes?.length === 28, `false-hitboxes.json hitboxes array must contain 28 hitboxes, found ${falseHitboxes.hitboxes?.length}`);
  assert(falseHitboxes.coordinateSystem === "liv026-board-pixels", "false-hitboxes.json coordinateSystem must be liv026-board-pixels");
  assert(falseHitboxes.behavior?.hintable === false, "false-hitboxes.json must mark false hitboxes as not hintable");
  assert(falseHitboxes.behavior?.completionCredit === false, "false-hitboxes.json must mark false hitboxes as non-completing");
  assert(falseHitboxes.behavior?.neutralBeforeInteraction === true, "false-hitboxes.json must mark false hitboxes as neutral before interaction");
  assert(falseHitboxes.behavior?.pointerEvents === "auto", "false-hitboxes.json must preserve pointer-event behavior");
}

if (wrongRouteBehavior) {
  assert(wrongRouteBehavior.levelId === "LIV-026", "wrong-route-behavior.json levelId must be LIV-026");
  assert(String(wrongRouteBehavior.rendererEvidence?.routeDecisionFunction || "").includes("LIV-026"), "wrong-route-behavior.json must record LIV-026 route decision evidence");
  assert(String(wrongRouteBehavior.rendererEvidence?.rule || "").includes("distinct node keys starting with liv026-"), "wrong-route-behavior.json must record broad liv026-* invalid-route behavior");
  assert(wrongRouteBehavior.rendererEvidence?.validRoutesRemainValid === true, "wrong-route-behavior.json must mark valid routes valid");
  assert(wrongRouteBehavior.rendererEvidence?.invalidRoutesCountTowardCompletion === false, "wrong-route-behavior.json must mark invalid routes non-completing");
  assert(wrongRouteBehavior.rendererEvidence?.hintsExcludeFalseJacks === true, "wrong-route-behavior.json must record false-jack hint exclusion");
  assert(Array.isArray(wrongRouteBehavior.knownForbiddenExamples) && wrongRouteBehavior.knownForbiddenExamples.length >= 3, "wrong-route-behavior.json must include representative known forbidden examples");
}

if (lockedBehavior) {
  assert(lockedBehavior.levelId === "LIV-026", "locked-behavior.json levelId must be LIV-026");
  assert(lockedBehavior.title === "Full Zone Processing", "locked-behavior.json must record the LIV-026 locked title");
  assert(lockedBehavior.scrollBehavior?.customScrollHostClass === "sf-live-native-liv026-scroll-host", "locked-behavior.json must record the custom scroll host");
  assert(lockedBehavior.hitboxExpectations?.trueHitboxes === 31, "locked-behavior.json must record 31 true hitboxes");
  assert(lockedBehavior.hitboxExpectations?.requiredEndpointHitboxes === 30, "locked-behavior.json must record 30 required endpoint hitboxes");
  assert(lockedBehavior.hitboxExpectations?.falseHitboxes === 28, "locked-behavior.json must record 28 false hitboxes");
  assert(lockedBehavior.hitboxExpectations?.hintsExcludeFalseHitboxes === true, "locked-behavior.json must record false hitbox hint exclusions");
  assert(lockedBehavior.hitboxExpectations?.falseHitboxLockEvidenceFound === true, "locked-behavior.json must record false-hitbox lock evidence");
  assert(lockedBehavior.stackGuard?.evidenceFound === true, "locked-behavior.json must record stack guard evidence");
  assert(lockedBehavior.visibleDecorations?.processorDecoCleanup?.evidenceFound === true, "locked-behavior.json must record processor-deco cleanup evidence");
  assert(lockedBehavior.cableBehavior?.routeLayer === ".sf-native-cables", "locked-behavior.json must record .sf-native-cables route layer");
  assert(String(lockedBehavior.cableBehavior?.wrongRoutes || "").includes("invalid"), "locked-behavior.json must record invalid wrong-route cable behavior");
  assert(Array.isArray(lockedBehavior.checklistCompletionExpectations) && lockedBehavior.checklistCompletionExpectations.length >= 4, "locked-behavior.json must record checklist/completion expectations");
  assert(Array.isArray(lockedBehavior.browserSmokeExpectations) && lockedBehavior.browserSmokeExpectations.length >= 10, "locked-behavior.json must record browser smoke expectations");
}

if (liveSoundMap) {
  const entry = liveSoundMap.levels?.["LIV-026"];
  assert(entry?.status === "needs-review", "LIV-026 must remain needs-review in data/puzzle-metadata/live-sound.json");
  assert(entry?.taskMode === "capstone-system", "LIV-026 batch metadata must remain capstone-system");
}

const summary = {
  levelId: "LIV-026",
  mode: "read-only",
  readyForControlledManifestCreation: failures.length === 0,
  runtimeManifestExists,
  normalizedManifestExists,
  counts: {
    routes: routes?.routeCount ?? null,
    stereoGroups: stereoGroups?.stereoGroupCount ?? null,
    bakedTrueHitboxes: goodHitboxes?.trueHitboxCount ?? null,
    requiredEndpointHitboxes: goodHitboxes?.requiredEndpointHitboxCount ?? null,
    unusedBakedTrueHitboxes: goodHitboxes?.unusedBakedTrueHitboxCount ?? null,
    falseHitboxes: falseHitboxes?.falseHitboxCount ?? null
  },
  unusedBakedTrueHitbox: (goodHitboxes?.hitboxes || []).find(hitbox => hitbox.kind !== "good")?.key ?? null,
  wrongRouteBehaviorEvidence: {
    broadLiv026InvalidRoutes: String(wrongRouteBehavior?.rendererEvidence?.rule || "").includes("liv026-"),
    invalidRoutesCountTowardCompletion: wrongRouteBehavior?.rendererEvidence?.invalidRoutesCountTowardCompletion ?? null,
    hintsExcludeFalseJacks: wrongRouteBehavior?.rendererEvidence?.hintsExcludeFalseJacks ?? null
  },
  lockedBehaviorEvidence: {
    customScrollHostClass: lockedBehavior?.scrollBehavior?.customScrollHostClass ?? null,
    falseHitboxLockEvidenceFound: lockedBehavior?.hitboxExpectations?.falseHitboxLockEvidenceFound ?? null,
    stackGuardEvidenceFound: lockedBehavior?.stackGuard?.evidenceFound ?? null,
    processorDecoCleanupEvidenceFound: lockedBehavior?.visibleDecorations?.processorDecoCleanup?.evidenceFound ?? null,
    routeLayer: lockedBehavior?.cableBehavior?.routeLayer ?? null,
    browserSmokeExpectationCount: lockedBehavior?.browserSmokeExpectations?.length ?? null
  },
  status: liveSoundMap?.levels?.["LIV-026"]?.status ?? null,
  failures
};

if (failures.length) {
  console.error("LIV-026 manifest readiness check failed");
  console.error(JSON.stringify(summary, null, 2));
  process.exit(1);
}

console.log("LIV-026 manifest readiness check passed");
console.log(JSON.stringify(summary, null, 2));
