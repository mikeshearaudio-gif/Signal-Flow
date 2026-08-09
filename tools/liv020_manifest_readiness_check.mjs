#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const snapshotDir = path.join(root, "audit/liv020-preservation-snapshot");
const sourceManifestPath = path.join(root, "data/live-sound/boards/liv020.json");
const normalizedManifestPath = path.join(root, "data/live-sound/boards/normalized/liv020.normalized.json");

const expectedDuplicateFalseKeys = [
  "liv020-bad-bus-out-01",
  "liv020-bad-bus-out-02",
  "liv020-bad-bus-out-03",
  "liv020-bad-bus-out-04"
];

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

function sameStringSet(actual, expected) {
  return Array.isArray(actual) &&
    actual.length === expected.length &&
    expected.every(value => actual.includes(value));
}

function countBy(items, readKey) {
  const counts = new Map();
  for (const item of items || []) {
    const key = readKey(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

const routes = readJson("audit/liv020-preservation-snapshot/routes.json");
const stereoGroups = readJson("audit/liv020-preservation-snapshot/stereo-groups.json");
const goodHitboxes = readJson("audit/liv020-preservation-snapshot/good-hitboxes.json");
const falseHitboxes = readJson("audit/liv020-preservation-snapshot/false-hitboxes.json");
const badRoutePairs = readJson("audit/liv020-preservation-snapshot/bad-route-pairs.json");
const wrongRouteBehavior = readJson("audit/liv020-preservation-snapshot/wrong-route-behavior.json");
const lockedBehavior = readJson("audit/liv020-preservation-snapshot/locked-behavior.json");
const liveSoundMap = readJson("data/puzzle-metadata/live-sound.json");

assert(fs.existsSync(snapshotDir), "Missing snapshot directory: audit/liv020-preservation-snapshot");

const runtimeManifestExists = fs.existsSync(sourceManifestPath);
const normalizedManifestExists = fs.existsSync(normalizedManifestPath);
const manifestStateIsConsistent = runtimeManifestExists === normalizedManifestExists;
assert(manifestStateIsConsistent, "LIV-020 source and normalized manifests must either both be absent or both exist after a controlled data-only pass");

if (routes) {
  assert(routes.levelId === "LIV-020", "routes.json levelId must be LIV-020");
  assert(routes.routeCount === 19, `routes.json routeCount must be 19, found ${routes.routeCount}`);
  assert(routes.generatedJackKeyCount === 38, `routes.json generatedJackKeyCount must be 38, found ${routes.generatedJackKeyCount}`);
  assert(Array.isArray(routes.generatedJackKeys), "routes.json generatedJackKeys must be an array");
  assert(routes.generatedJackKeys?.length === 38, `routes.json generatedJackKeys must contain 38 keys, found ${routes.generatedJackKeys?.length}`);
  assert(Array.isArray(routes.routes), "routes.json routes must be an array");
  assert(routes.routes?.length === 19, `routes.json routes array must contain 19 routes, found ${routes.routes?.length}`);
  for (const route of routes.routes || []) {
    assert(route.id, "Each route must have an id");
    assert(route.from?.id, `Route ${route.id || "(missing id)"} must have from.id`);
    assert(route.to?.id, `Route ${route.id || "(missing id)"} must have to.id`);
    assert(route.routeFamily, `Route ${route.id || "(missing id)"} must have routeFamily`);
    assert(typeof route.partOfStereoGroup === "boolean", `Route ${route.id || "(missing id)"} must state partOfStereoGroup`);
  }
}

if (stereoGroups) {
  assert(stereoGroups.levelId === "LIV-020", "stereo-groups.json levelId must be LIV-020");
  assert(stereoGroups.stereoGroupCount === 7, `stereo-groups.json stereoGroupCount must be 7, found ${stereoGroups.stereoGroupCount}`);
  assert(Array.isArray(stereoGroups.stereoGroups), "stereo-groups.json stereoGroups must be an array");
  assert(stereoGroups.stereoGroups?.length === 7, `stereo-groups.json stereoGroups must contain 7 groups, found ${stereoGroups.stereoGroups?.length}`);
  for (const group of stereoGroups.stereoGroups || []) {
    assert(group.id, "Each stereo group must have an id");
    assert(Array.isArray(group.routeIds) && group.routeIds.length === 2, `Stereo group ${group.id || "(missing id)"} must contain exactly 2 route IDs`);
    assert(group.routeSides && typeof group.routeSides === "object", `Stereo group ${group.id || "(missing id)"} must include routeSides`);
    assert(group.purpose, `Stereo group ${group.id || "(missing id)"} must include a purpose`);
  }
  assert(Array.isArray(stereoGroups.monoRouteIds) && stereoGroups.monoRouteIds.length === 5, `stereo-groups.json must preserve five mono Aux-to-IEM route IDs, found ${stereoGroups.monoRouteIds?.length}`);
}

if (goodHitboxes) {
  assert(goodHitboxes.levelId === "LIV-020", "good-hitboxes.json levelId must be LIV-020");
  assert(goodHitboxes.expectedCount === 38, `good-hitboxes.json expectedCount must be 38, found ${goodHitboxes.expectedCount}`);
  assert(goodHitboxes.goodHitboxCount === 38, `good-hitboxes.json goodHitboxCount must be 38, found ${goodHitboxes.goodHitboxCount}`);
  assert(goodHitboxes.coordinateSystem === "liv020-board-pixels", "good-hitboxes.json coordinateSystem must be liv020-board-pixels");
  assert(Array.isArray(goodHitboxes.hitboxes), "good-hitboxes.json hitboxes must be an array");
  assert(goodHitboxes.hitboxes?.length === 38, `good-hitboxes.json hitboxes must contain 38 hitboxes, found ${goodHitboxes.hitboxes?.length}`);
  for (const hitbox of goodHitboxes.hitboxes || []) {
    assert(hitbox.key, "Each good hitbox must have a key");
    assert(hitbox.kind === "good", `Good hitbox ${hitbox.key || "(missing key)"} must have kind=good`);
    assert(hitbox.centerPx && Number.isFinite(Number(hitbox.centerPx.x)) && Number.isFinite(Number(hitbox.centerPx.y)), `Good hitbox ${hitbox.key || "(missing key)"} must have finite centerPx`);
  }
}

if (falseHitboxes) {
  assert(falseHitboxes.levelId === "LIV-020", "false-hitboxes.json levelId must be LIV-020");
  assert(falseHitboxes.sourceConstant === "LIV020_BAD_HITBOX_LAYOUT", "false-hitboxes.json must identify LIV020_BAD_HITBOX_LAYOUT as source");
  assert(falseHitboxes.expectedCount === 113, `false-hitboxes.json expectedCount must be 113, found ${falseHitboxes.expectedCount}`);
  assert(falseHitboxes.falseHardwareHitboxRecordCount === 113, `false-hitboxes.json falseHardwareHitboxRecordCount must be 113, found ${falseHitboxes.falseHardwareHitboxRecordCount}`);
  assert(falseHitboxes.uniqueKeyCount === 109, `false-hitboxes.json uniqueKeyCount must be 109, found ${falseHitboxes.uniqueKeyCount}`);
  assert(sameStringSet(falseHitboxes.duplicateKeys, expectedDuplicateFalseKeys), "false-hitboxes.json must preserve duplicate liv020-bad-bus-out-01 through liv020-bad-bus-out-04 evidence");
  assert(Array.isArray(falseHitboxes.hitboxes), "false-hitboxes.json hitboxes must be an array");
  assert(falseHitboxes.hitboxes?.length === 113, `false-hitboxes.json hitboxes must contain 113 records, found ${falseHitboxes.hitboxes?.length}`);
  assert(falseHitboxes.coordinateSystem === "liv020-board-pixels", "false-hitboxes.json coordinateSystem must be liv020-board-pixels");
  assert(falseHitboxes.behavior?.neutralBeforeInteraction === true, "false-hitboxes.json must mark false hardware jacks neutral before interaction");
  assert(falseHitboxes.behavior?.hintable === false, "false-hitboxes.json must mark false hardware jacks as not hintable");
  assert(falseHitboxes.behavior?.completionCredit === false, "false-hitboxes.json must mark false hardware jacks as non-completing");
  assert(String(falseHitboxes.caution || "").includes("not curated bad-route pairs"), "false-hitboxes.json caution must state false layout is not bad-route pair logic");

  const falseKeyCounts = countBy(falseHitboxes.hitboxes, hitbox => hitbox.key);
  for (const duplicateKey of expectedDuplicateFalseKeys) {
    assert(falseKeyCounts.get(duplicateKey) === 2, `${duplicateKey} must remain duplicated exactly twice as layout evidence`);
  }
}

if (badRoutePairs) {
  assert(badRoutePairs.levelId === "LIV-020", "bad-route-pairs.json levelId must be LIV-020");
  assert(badRoutePairs.sourceConstant === "LIV020_BAD_ROUTE_PAIRS", "bad-route-pairs.json must identify LIV020_BAD_ROUTE_PAIRS as source");
  assert(badRoutePairs.expectedCount === 113, `bad-route-pairs.json expectedCount must be 113, found ${badRoutePairs.expectedCount}`);
  assert(badRoutePairs.badRoutePairCount === 113, `bad-route-pairs.json badRoutePairCount must be 113, found ${badRoutePairs.badRoutePairCount}`);
  assert(Array.isArray(badRoutePairs.pairs), "bad-route-pairs.json pairs must be an array");
  assert(badRoutePairs.pairs?.length === 113, `bad-route-pairs.json pairs must contain 113 records, found ${badRoutePairs.pairs?.length}`);
  assert(badRoutePairs.behavior?.curated === true, "bad-route-pairs.json must mark pairs as curated");
  assert(badRoutePairs.behavior?.generatedFromFalseHardwareHitboxLayout === false, "bad-route-pairs.json must explicitly avoid generation from false hardware layout");
  assert(badRoutePairs.behavior?.allowedAsInvalidRoute === true, "bad-route-pairs.json must mark curated bad pairs as allowed invalid routes");
  assert(badRoutePairs.behavior?.completionCredit === false, "bad-route-pairs.json must mark curated bad pairs as non-completing");
  assert(String(badRoutePairs.caution || "").includes("separate from LIV020_BAD_HITBOX_LAYOUT"), "bad-route-pairs.json caution must state curated pairs are separate from false layout");
  for (const pair of badRoutePairs.pairs || []) {
    assert(pair.from?.id, `Bad-route pair ${pair.index ?? "(missing index)"} must have from.id`);
    assert(pair.to?.id, `Bad-route pair ${pair.index ?? "(missing index)"} must have to.id`);
    assert(pair.effect && String(pair.effect).includes("does not count toward completion"), `Bad-route pair ${pair.index ?? "(missing index)"} must state non-completion effect`);
  }
}

if (falseHitboxes && badRoutePairs) {
  const falseDatasetShape = {
    hasGeometry: (falseHitboxes.hitboxes || []).every(hitbox => Number.isFinite(Number(hitbox.leftPx)) && Number.isFinite(Number(hitbox.topPx))),
    hasPairEndpoints: (falseHitboxes.hitboxes || []).some(hitbox => hitbox.from || hitbox.to)
  };
  const badPairDatasetShape = {
    hasGeometry: (badRoutePairs.pairs || []).some(pair => Number.isFinite(Number(pair.leftPx)) || Number.isFinite(Number(pair.topPx))),
    hasPairEndpoints: (badRoutePairs.pairs || []).every(pair => pair.from?.id && pair.to?.id)
  };

  assert(falseDatasetShape.hasGeometry === true, "false-hitboxes.json must preserve geometry records");
  assert(falseDatasetShape.hasPairEndpoints === false, "false-hitboxes.json must not be shaped as route-pair logic");
  assert(badPairDatasetShape.hasGeometry === false, "bad-route-pairs.json must not be shaped as hitbox geometry");
  assert(badPairDatasetShape.hasPairEndpoints === true, "bad-route-pairs.json must preserve endpoint pair logic");
  assert(falseHitboxes.sourceConstant !== badRoutePairs.sourceConstant, "False hardware layout and curated bad-route pairs must come from separate source constants");
}

if (wrongRouteBehavior) {
  assert(wrongRouteBehavior.levelId === "LIV-020", "wrong-route-behavior.json levelId must be LIV-020");
  assert(wrongRouteBehavior.redInvalidRouteBehavior === true, "wrong-route-behavior.json must record red invalid-route behavior");
  assert(wrongRouteBehavior.invalidRoutesNonCompleting === true, "wrong-route-behavior.json must record invalid routes as non-completing");
  assert(Array.isArray(wrongRouteBehavior.behaviorFamilies), "wrong-route-behavior.json behaviorFamilies must be an array");
  const curatedFamily = wrongRouteBehavior.behaviorFamilies?.find(item => item.id === "curated-bad-route-pairs");
  const falseFamily = wrongRouteBehavior.behaviorFamilies?.find(item => item.id === "false-hardware-jack-interactions");
  assert(curatedFamily?.count === 113, "wrong-route-behavior.json must record 113 curated bad-route pairs");
  assert(falseFamily?.count === 113, "wrong-route-behavior.json must record 113 false hardware jack layout records");
  assert(String(falseFamily?.description || "").includes("not the same as curated bad-route pairs"), "wrong-route-behavior.json must keep false hardware interactions distinct from curated bad-route pairs");
  assert((wrongRouteBehavior.evidenceNotes || []).some(note => String(note).includes("preserved separately")), "wrong-route-behavior.json must record separated evidence note");
}

if (lockedBehavior) {
  assert(lockedBehavior.levelId === "LIV-020", "locked-behavior.json levelId must be LIV-020");
  assert(lockedBehavior.title === "Main PA + IEM Monitor Feed", "locked-behavior.json must record LIV-020 title");
  assert(lockedBehavior.counts?.routes === 19, "locked-behavior.json must record 19 routes");
  assert(lockedBehavior.counts?.stereoGroups === 7, "locked-behavior.json must record 7 stereo groups");
  assert(lockedBehavior.counts?.goodHitboxes === 38, "locked-behavior.json must record 38 good hitboxes");
  assert(lockedBehavior.counts?.falseHardwareHitboxRecords === 113, "locked-behavior.json must record 113 false hardware hitbox records");
  assert(lockedBehavior.counts?.curatedBadRoutePairs === 113, "locked-behavior.json must record 113 curated bad-route pairs");
  assert((lockedBehavior.scrollBehaviorNotes || []).length >= 2, "locked-behavior.json must cover scroll/layout behavior");
  assert((lockedBehavior.labelBehaviorNotes || []).length >= 2, "locked-behavior.json must cover label behavior");
  assert((lockedBehavior.hitboxLockNotes || []).length >= 2, "locked-behavior.json must cover hitbox lock behavior");
  assert((lockedBehavior.falseHitboxBehaviorNotes || []).some(note => String(note).includes("not route-pair logic")), "locked-behavior.json must state false layout data is not route-pair logic");
  assert((lockedBehavior.badRouteBehaviorNotes || []).some(note => String(note).includes("separately")), "locked-behavior.json must state bad routes are checked separately");
  assert((lockedBehavior.hintExclusionNotes || []).some(note => String(note).includes("Show Hints exclusion")), "locked-behavior.json must cover hint exclusion");
  assert((lockedBehavior.cableBehaviorNotes || []).some(note => String(note).includes(".sf-native-cables")), "locked-behavior.json must cover cable layer behavior");
  assert((lockedBehavior.checklistCompletionExpectations || []).length >= 3, "locked-behavior.json must cover checklist/completion expectations");
  assert((lockedBehavior.browserSmokeExpectations || []).length >= 10, "locked-behavior.json must cover browser smoke expectations");
}

if (liveSoundMap) {
  const entry = liveSoundMap.levels?.["LIV-020"];
  assert(entry?.status === "needs-review", "LIV-020 must remain needs-review in data/puzzle-metadata/live-sound.json");
  assert(entry?.taskMode === "capstone-system", "LIV-020 batch metadata must remain capstone-system");
}

const duplicateEvidenceStatus = expectedDuplicateFalseKeys.map(key => ({
  key,
  recordCount: (falseHitboxes?.hitboxes || []).filter(hitbox => hitbox.key === key).length
}));

const summary = {
  levelId: "LIV-020",
  mode: "read-only",
  readyForControlledManifestCreation: failures.length === 0,
  manifestState: runtimeManifestExists ? "controlled-manifest-present" : "pre-manifest",
  runtimeManifestExists,
  normalizedManifestExists,
  counts: {
    routes: routes?.routeCount ?? null,
    stereoGroups: stereoGroups?.stereoGroupCount ?? null,
    goodHitboxes: goodHitboxes?.goodHitboxCount ?? null,
    falseHardwareLayoutRecords: falseHitboxes?.falseHardwareHitboxRecordCount ?? null,
    uniqueFalseHardwareKeys: falseHitboxes?.uniqueKeyCount ?? null,
    curatedBadRoutePairs: badRoutePairs?.badRoutePairCount ?? null
  },
  duplicateFalseLayoutEvidence: duplicateEvidenceStatus,
  separatedEvidence: {
    falseHardwareLayoutSource: falseHitboxes?.sourceConstant ?? null,
    curatedBadRoutePairSource: badRoutePairs?.sourceConstant ?? null,
    noIndexMappingAsserted: badRoutePairs?.behavior?.generatedFromFalseHardwareHitboxLayout === false &&
      String(falseHitboxes?.caution || "").includes("not curated bad-route pairs") &&
      String(badRoutePairs?.caution || "").includes("separate from LIV020_BAD_HITBOX_LAYOUT")
  },
  wrongRouteBehaviorEvidence: {
    redInvalidRouteBehavior: wrongRouteBehavior?.redInvalidRouteBehavior ?? null,
    invalidRoutesNonCompleting: wrongRouteBehavior?.invalidRoutesNonCompleting ?? null
  },
  lockedBehaviorEvidence: {
    scrollNotes: lockedBehavior?.scrollBehaviorNotes?.length ?? null,
    labelNotes: lockedBehavior?.labelBehaviorNotes?.length ?? null,
    hitboxNotes: lockedBehavior?.hitboxLockNotes?.length ?? null,
    falseHitboxNotes: lockedBehavior?.falseHitboxBehaviorNotes?.length ?? null,
    badRouteNotes: lockedBehavior?.badRouteBehaviorNotes?.length ?? null,
    hintNotes: lockedBehavior?.hintExclusionNotes?.length ?? null,
    cableNotes: lockedBehavior?.cableBehaviorNotes?.length ?? null,
    checklistExpectations: lockedBehavior?.checklistCompletionExpectations?.length ?? null,
    browserSmokeExpectations: lockedBehavior?.browserSmokeExpectations?.length ?? null
  },
  status: liveSoundMap?.levels?.["LIV-020"]?.status ?? null,
  failures
};

if (failures.length) {
  console.error("LIV-020 manifest readiness check failed");
  console.error(JSON.stringify(summary, null, 2));
  process.exit(1);
}

console.log("LIV-020 manifest readiness check passed");
console.log(JSON.stringify(summary, null, 2));
