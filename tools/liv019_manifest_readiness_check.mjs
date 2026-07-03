#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const snapshotDir = path.join(root, "audit/liv019-preservation-snapshot");
const sourceManifestPath = path.join(root, "data/live-sound/boards/liv019.json");
const normalizedManifestPath = path.join(root, "data/live-sound/boards/normalized/liv019.normalized.json");

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

const routes = readJson("audit/liv019-preservation-snapshot/routes.json");
const stereoGroups = readJson("audit/liv019-preservation-snapshot/stereo-groups.json");
const goodHitboxes = readJson("audit/liv019-preservation-snapshot/good-hitboxes.json");
const wrongRoutePairs = readJson("audit/liv019-preservation-snapshot/wrong-route-pairs.json");
const lockedBehavior = readJson("audit/liv019-preservation-snapshot/locked-behavior.json");

assert(fs.existsSync(snapshotDir), "Missing snapshot directory: audit/liv019-preservation-snapshot");
const sourceManifestExists = fs.existsSync(sourceManifestPath);
const normalizedManifestExists = fs.existsSync(normalizedManifestPath);
if (sourceManifestExists || normalizedManifestExists) {
  assert(sourceManifestExists && normalizedManifestExists, "LIV-019 source and normalized manifests must either both exist or both be absent");
}
assert(!fs.existsSync(path.join(snapshotDir, "liv019.draft.json")), "Temporary draft manifest exists; readiness gate expects no audit/liv019-preservation-snapshot/liv019.draft.json");

if (routes) {
  assert(routes.levelId === "LIV-019", "routes.json levelId must be LIV-019");
  assert(routes.routeCount === 21, `routes.json routeCount must be 21, found ${routes.routeCount}`);
  assert(Array.isArray(routes.routes), "routes.json routes must be an array");
  assert(routes.routes?.length === 21, `routes.json routes array must contain 21 routes, found ${routes.routes?.length}`);
}

if (stereoGroups) {
  assert(stereoGroups.levelId === "LIV-019", "stereo-groups.json levelId must be LIV-019");
  assert(stereoGroups.stereoGroupCount === 5, `stereo-groups.json stereoGroupCount must be 5, found ${stereoGroups.stereoGroupCount}`);
  assert(Array.isArray(stereoGroups.stereoGroups), "stereo-groups.json stereoGroups must be an array");
  assert(stereoGroups.stereoGroups?.length === 5, `stereo-groups.json stereoGroups array must contain 5 groups, found ${stereoGroups.stereoGroups?.length}`);
  for (const group of stereoGroups.stereoGroups || []) {
    assert(Array.isArray(group.routeIds) && group.routeIds.length === 2, `Stereo group ${group.id || "(missing id)"} must contain exactly 2 route IDs`);
  }
}

if (goodHitboxes) {
  assert(goodHitboxes.levelId === "LIV-019", "good-hitboxes.json levelId must be LIV-019");
  assert(goodHitboxes.lockedHitboxCount === 70, `good-hitboxes.json lockedHitboxCount must be 70, found ${goodHitboxes.lockedHitboxCount}`);
  assert(Array.isArray(goodHitboxes.hitboxes), "good-hitboxes.json hitboxes must be an array");
  assert(goodHitboxes.hitboxes?.length === 70, `good-hitboxes.json hitboxes array must contain 70 hitboxes, found ${goodHitboxes.hitboxes?.length}`);
}

if (wrongRoutePairs) {
  assert(wrongRoutePairs.levelId === "LIV-019", "wrong-route-pairs.json levelId must be LIV-019");
  assert(wrongRoutePairs.canonicalTrapMetadataFound === false, "wrong-route-pairs.json must not claim canonical trap metadata exists");
  assert(wrongRoutePairs.wrongRoutePairCount === 6, `wrong-route-pairs.json wrongRoutePairCount must be 6, found ${wrongRoutePairs.wrongRoutePairCount}`);
  assert(Array.isArray(wrongRoutePairs.wrongRoutePairs), "wrong-route-pairs.json wrongRoutePairs must be an array");
  assert(wrongRoutePairs.wrongRoutePairs?.length === 6, `wrong-route-pairs.json wrongRoutePairs array must contain 6 examples, found ${wrongRoutePairs.wrongRoutePairs?.length}`);
}

if (lockedBehavior) {
  assert(lockedBehavior.levelId === "LIV-019", "locked-behavior.json levelId must be LIV-019");
  assert(lockedBehavior.evidenceOnly === true, "locked-behavior.json must mark evidenceOnly true");
  assert(lockedBehavior.notRuntimeManifest === true, "locked-behavior.json must mark notRuntimeManifest true");
  assert(lockedBehavior.falseTrapEvidence?.canonicalFalseHitboxSourceFound === false, "locked-behavior.json must not claim a canonical false hitbox source exists");
  assert(lockedBehavior.falseTrapEvidence?.canonicalTrapMetadataFound === false, "locked-behavior.json must not claim canonical trap metadata exists");
  assert(lockedBehavior.cableLayerExpectations?.nativeCableLayer === ".sf-native-cables", "locked-behavior.json must record .sf-native-cables as the native cable layer");
  assert(lockedBehavior.cableLayerExpectations?.modeSource === "native-game-cables-top-layer", "locked-behavior.json must record native-game-cables-top-layer mode source");
  assert(lockedBehavior.scrollBehaviorNotes?.owner?.includes("sf-liv019-scroll-shell.js"), "locked-behavior.json must record LIV-019 scroll shell ownership");
  assert(Array.isArray(lockedBehavior.labelAndFinalizerNotes?.fohLabelLocks) && lockedBehavior.labelAndFinalizerNotes.fohLabelLocks.length >= 2, "locked-behavior.json must record FOH label locks");
  assert(lockedBehavior.labelAndFinalizerNotes?.finalizerRole === "tool-cleanup-only-no-cables", "locked-behavior.json must record clean finalizer role");
  assert(lockedBehavior.stageboxBehavior?.lockedAsEightInputBoard === true, "locked-behavior.json must record stagebox as an 8-input board");
  assert(lockedBehavior.hitboxExpectations?.lockedHitboxCount === 70, "locked-behavior.json must record locked hitbox count 70");
  assert(lockedBehavior.hitboxExpectations?.missingCount === 0, "locked-behavior.json must record missingCount 0");

  const scripts = lockedBehavior.customScriptsDetected || [];
  for (const requiredScript of [
    "sf-liv019-scroll-shell.js",
    "sf-liv019-foh-label-lock.js",
    "sf-liv019-foh-label-final-lock.js",
    "sf-liv019-hitbox-final-lock.js",
    "sf-liv019-stagebox-8-lock.js",
    "sf-liv019-clean-finalizer-v6r421.js",
    "sf-live-cable-mode-kit.js"
  ]) {
    assert(scripts.some(script => script.includes(requiredScript)), `locked-behavior.json must record ${requiredScript}`);
  }
}

const summary = {
  levelId: "LIV-019",
  mode: "read-only",
  readyForControlledManifestCreation: failures.length === 0,
  runtimeManifestExists: sourceManifestExists,
  normalizedManifestExists,
  counts: {
    routes: routes?.routeCount ?? null,
    stereoGroups: stereoGroups?.stereoGroupCount ?? null,
    goodHitboxes: goodHitboxes?.lockedHitboxCount ?? null,
    wrongRouteExamples: wrongRoutePairs?.wrongRoutePairCount ?? null
  },
  falseTrapEvidence: {
    canonicalFalseHitboxSourceFound: lockedBehavior?.falseTrapEvidence?.canonicalFalseHitboxSourceFound ?? null,
    canonicalTrapMetadataFound: lockedBehavior?.falseTrapEvidence?.canonicalTrapMetadataFound ?? null
  },
  lockedBehaviorEvidence: {
    nativeCableLayer: lockedBehavior?.cableLayerExpectations?.nativeCableLayer ?? null,
    scrollShell: lockedBehavior?.scrollBehaviorNotes?.owner ?? null,
    finalizerRole: lockedBehavior?.labelAndFinalizerNotes?.finalizerRole ?? null,
    stageboxEightInputLock: lockedBehavior?.stageboxBehavior?.lockedAsEightInputBoard ?? null,
    hitboxLockExpected: lockedBehavior?.hitboxExpectations?.lockedHitboxCount ?? null,
    hitboxMissingCount: lockedBehavior?.hitboxExpectations?.missingCount ?? null
  },
  failures
};

if (failures.length) {
  console.error("LIV-019 manifest readiness check failed");
  console.error(JSON.stringify(summary, null, 2));
  process.exit(1);
}

console.log("LIV-019 manifest readiness check passed");
console.log(JSON.stringify(summary, null, 2));
