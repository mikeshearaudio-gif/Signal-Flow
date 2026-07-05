#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const snapshotDir = path.join(root, "audit/liv023-preservation-snapshot");
const sourceManifestPath = path.join(root, "data/live-sound/boards/liv023.json");
const normalizedManifestPath = path.join(root, "data/live-sound/boards/normalized/liv023.normalized.json");

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

const routes = readJson("audit/liv023-preservation-snapshot/routes.json");
const stereoGroups = readJson("audit/liv023-preservation-snapshot/stereo-groups.json");
const goodHitboxes = readJson("audit/liv023-preservation-snapshot/good-hitboxes.json");
const falseHitboxes = readJson("audit/liv023-preservation-snapshot/false-hitboxes.json");
const wrongRouteBehavior = readJson("audit/liv023-preservation-snapshot/wrong-route-behavior.json");
const lockedBehavior = readJson("audit/liv023-preservation-snapshot/locked-behavior.json");

assert(fs.existsSync(snapshotDir), "Missing snapshot directory: audit/liv023-preservation-snapshot");

const runtimeManifestExists = fs.existsSync(sourceManifestPath);
const normalizedManifestExists = fs.existsSync(normalizedManifestPath);
assert(!runtimeManifestExists, "Runtime source manifest must not exist during readiness: data/live-sound/boards/liv023.json");
assert(!normalizedManifestExists, "Normalized runtime manifest must not exist during readiness: data/live-sound/boards/normalized/liv023.normalized.json");

if (routes) {
  assert(routes.levelId === "LIV-023", "routes.json levelId must be LIV-023");
  assert(routes.routeCount === 15, `routes.json routeCount must be 15, found ${routes.routeCount}`);
  assert(Array.isArray(routes.routes), "routes.json routes must be an array");
  assert(routes.routes?.length === 15, `routes.json routes array must contain 15 routes, found ${routes.routes?.length}`);
  for (const route of routes.routes || []) {
    assert(route.id, "Each route must have an id");
    assert(route.from?.id, `Route ${route.id || "(missing id)"} must have from.id`);
    assert(route.to?.id, `Route ${route.id || "(missing id)"} must have to.id`);
    assert(route.routeFamily, `Route ${route.id || "(missing id)"} must have routeFamily`);
  }
}

if (stereoGroups) {
  assert(stereoGroups.levelId === "LIV-023", "stereo-groups.json levelId must be LIV-023");
  assert(stereoGroups.stereoGroupCount === 6, `stereo-groups.json stereoGroupCount must be 6, found ${stereoGroups.stereoGroupCount}`);
  assert(Array.isArray(stereoGroups.stereoGroups), "stereo-groups.json stereoGroups must be an array");
  assert(stereoGroups.stereoGroups?.length === 6, `stereo-groups.json stereoGroups array must contain 6 groups, found ${stereoGroups.stereoGroups?.length}`);
  for (const group of stereoGroups.stereoGroups || []) {
    assert(group.id, "Each stereo group must have an id");
    assert(Array.isArray(group.routeIds) && group.routeIds.length === 2, `Stereo group ${group.id || "(missing id)"} must contain exactly 2 route IDs`);
    assert(group.purpose, `Stereo group ${group.id || "(missing id)"} must include a purpose`);
  }
}

if (goodHitboxes) {
  assert(goodHitboxes.levelId === "LIV-023", "good-hitboxes.json levelId must be LIV-023");
  assert(goodHitboxes.goodHitboxCount === 30, `good-hitboxes.json goodHitboxCount must be 30, found ${goodHitboxes.goodHitboxCount}`);
  assert(goodHitboxes.expectedCount === 30, `good-hitboxes.json expectedCount must be 30, found ${goodHitboxes.expectedCount}`);
  assert(Array.isArray(goodHitboxes.hitboxes), "good-hitboxes.json hitboxes must be an array");
  assert(goodHitboxes.hitboxes?.length === 30, `good-hitboxes.json hitboxes array must contain 30 hitboxes, found ${goodHitboxes.hitboxes?.length}`);
  assert(goodHitboxes.coordinateSystem === "liv023-board-pixels", "good-hitboxes.json coordinateSystem must be liv023-board-pixels");
}

if (falseHitboxes) {
  assert(falseHitboxes.levelId === "LIV-023", "false-hitboxes.json levelId must be LIV-023");
  assert(falseHitboxes.falseHitboxCount === 101, `false-hitboxes.json falseHitboxCount must be 101, found ${falseHitboxes.falseHitboxCount}`);
  assert(falseHitboxes.expectedCount === 101, `false-hitboxes.json expectedCount must be 101, found ${falseHitboxes.expectedCount}`);
  assert(Array.isArray(falseHitboxes.hitboxes), "false-hitboxes.json hitboxes must be an array");
  assert(falseHitboxes.hitboxes?.length === 101, `false-hitboxes.json hitboxes array must contain 101 hitboxes, found ${falseHitboxes.hitboxes?.length}`);
  assert(falseHitboxes.coordinateSystem === "liv023-board-pixels", "false-hitboxes.json coordinateSystem must be liv023-board-pixels");
  assert(falseHitboxes.behavior?.hintable === false, "false-hitboxes.json must mark false hitboxes as not hintable");
  assert(falseHitboxes.behavior?.completionCredit === false, "false-hitboxes.json must mark false hitboxes as non-completing");
  assert(falseHitboxes.behavior?.neutralBeforeInteraction === true, "false-hitboxes.json must mark false hitboxes as neutral before interaction");
}

if (wrongRouteBehavior) {
  assert(wrongRouteBehavior.levelId === "LIV-023", "wrong-route-behavior.json levelId must be LIV-023");
  assert(wrongRouteBehavior.rendererEvidence?.routeDecisionFunction === "sfLiv020RouteDecision", "wrong-route-behavior.json must record sfLiv020RouteDecision");
  assert(String(wrongRouteBehavior.rendererEvidence?.rule || "").includes("distinct keys starting with liv023-"), "wrong-route-behavior.json must record broad liv023-* invalid-route behavior");
  assert(wrongRouteBehavior.rendererEvidence?.invalidRoutesCountTowardCompletion === false, "wrong-route-behavior.json must mark invalid routes non-completing");
  assert(wrongRouteBehavior.rendererEvidence?.hintsExcludeFalseJacks === true, "wrong-route-behavior.json must record false-jack hint exclusion");
  assert(Array.isArray(wrongRouteBehavior.launcherForbiddenExamples), "wrong-route-behavior.json launcherForbiddenExamples must be an array");
  assert(wrongRouteBehavior.launcherForbiddenExamples.length >= 4, `wrong-route-behavior.json must include launcher forbidden examples, found ${wrongRouteBehavior.launcherForbiddenExamples.length}`);
}

if (lockedBehavior) {
  assert(lockedBehavior.levelId === "LIV-023", "locked-behavior.json levelId must be LIV-023");
  assert(lockedBehavior.title === "Monitor Console: Vocal Insert, Stereo IEM, and 3-Way PA", "locked-behavior.json must record the LIV-023 locked title");
  assert(lockedBehavior.scrollBehavior?.customScrollHostClass === "sf-live-native-liv023-scroll-host", "locked-behavior.json must record the LIV-023 custom scroll host");
  assert(lockedBehavior.legacyMasking?.className === "sf-liv023-native-legacy-mask", "locked-behavior.json must record the legacy mask class");
  assert(lockedBehavior.layoutEvidence?.gearLayoutCount === 19, "locked-behavior.json must record 19 gear layout entries");
  assert(lockedBehavior.layoutEvidence?.labelLayoutCount === 11, "locked-behavior.json must record 11 label layout entries");
  assert(lockedBehavior.layoutEvidence?.gearLayerLayoutCount === 19, "locked-behavior.json must record 19 gear-layer layout entries");
  assert(lockedBehavior.hitboxExpectations?.goodHitboxes === 30, "locked-behavior.json must record 30 good hitboxes");
  assert(lockedBehavior.hitboxExpectations?.falseHitboxes === 101, "locked-behavior.json must record 101 false hitboxes");
  assert(lockedBehavior.hitboxExpectations?.hintsExcludeFalseHitboxes === true, "locked-behavior.json must record false hitbox hint exclusions");
  assert(lockedBehavior.cableBehavior?.routeLayer === ".sf-native-cables", "locked-behavior.json must record .sf-native-cables route layer");
  assert(String(lockedBehavior.cableBehavior?.wrongRoutes || "").includes("invalid/red"), "locked-behavior.json must record invalid/red wrong-route cable behavior");
  assert(Array.isArray(lockedBehavior.browserSmokeExpectations) && lockedBehavior.browserSmokeExpectations.length >= 8, "locked-behavior.json must record browser smoke expectations");
}

const summary = {
  levelId: "LIV-023",
  mode: "read-only",
  readyForControlledManifestCreation: failures.length === 0,
  runtimeManifestExists,
  normalizedManifestExists,
  counts: {
    routes: routes?.routeCount ?? null,
    stereoGroups: stereoGroups?.stereoGroupCount ?? null,
    goodHitboxes: goodHitboxes?.goodHitboxCount ?? null,
    falseHitboxes: falseHitboxes?.falseHitboxCount ?? null,
    launcherForbiddenExamples: wrongRouteBehavior?.launcherForbiddenExamples?.length ?? null
  },
  wrongRouteBehaviorEvidence: {
    broadLiv023InvalidRoutes: String(wrongRouteBehavior?.rendererEvidence?.rule || "").includes("liv023-"),
    invalidRoutesCountTowardCompletion: wrongRouteBehavior?.rendererEvidence?.invalidRoutesCountTowardCompletion ?? null,
    hintsExcludeFalseJacks: wrongRouteBehavior?.rendererEvidence?.hintsExcludeFalseJacks ?? null
  },
  lockedBehaviorEvidence: {
    customScrollHostClass: lockedBehavior?.scrollBehavior?.customScrollHostClass ?? null,
    legacyMaskClass: lockedBehavior?.legacyMasking?.className ?? null,
    gearLayoutCount: lockedBehavior?.layoutEvidence?.gearLayoutCount ?? null,
    labelLayoutCount: lockedBehavior?.layoutEvidence?.labelLayoutCount ?? null,
    gearLayerLayoutCount: lockedBehavior?.layoutEvidence?.gearLayerLayoutCount ?? null,
    routeLayer: lockedBehavior?.cableBehavior?.routeLayer ?? null,
    browserSmokeExpectationCount: lockedBehavior?.browserSmokeExpectations?.length ?? null
  },
  failures
};

if (failures.length) {
  console.error("LIV-023 manifest readiness check failed");
  console.error(JSON.stringify(summary, null, 2));
  process.exit(1);
}

console.log("LIV-023 manifest readiness check passed");
console.log(JSON.stringify(summary, null, 2));
