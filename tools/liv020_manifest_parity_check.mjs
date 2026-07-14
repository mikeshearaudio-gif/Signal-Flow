#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
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

function routePair(route) {
  return `${route.fromId || route.from}->${route.toId || route.to}`;
}

function countBy(items, readKey) {
  const counts = new Map();
  for (const item of items || []) {
    const key = readKey(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

function sameStringSet(actual, expected) {
  return Array.isArray(actual) &&
    actual.length === expected.length &&
    expected.every(value => actual.includes(value));
}

const snapshotRoutes = readJson("audit/liv020-preservation-snapshot/routes.json");
const snapshotStereoGroups = readJson("audit/liv020-preservation-snapshot/stereo-groups.json");
const snapshotGoodHitboxes = readJson("audit/liv020-preservation-snapshot/good-hitboxes.json");
const snapshotFalseHitboxes = readJson("audit/liv020-preservation-snapshot/false-hitboxes.json");
const snapshotBadRoutePairs = readJson("audit/liv020-preservation-snapshot/bad-route-pairs.json");
const snapshotWrongRouteBehavior = readJson("audit/liv020-preservation-snapshot/wrong-route-behavior.json");
const sourceBoard = readJson("data/live-sound/boards/liv020.json");
const normalizedBoard = readJson("data/live-sound/boards/normalized/liv020.normalized.json");
const liveSoundMap = readJson("data/puzzle-metadata/live-sound.json");

if (sourceBoard && normalizedBoard) {
  assert(sourceBoard.levelId === "LIV-020", "source manifest levelId must be LIV-020");
  assert(normalizedBoard.levelId === "LIV-020", "normalized manifest levelId must be LIV-020");
  assert(sourceBoard.preservation?.status === "needs-review", "source manifest must keep LIV-020 needs-review");
  assert(normalizedBoard.preservation?.status === "needs-review", "normalized manifest must keep LIV-020 needs-review");
  assert(sourceBoard.preservation?.rendererIntegration === false, "source preservation must state renderer integration remains disabled");
  assert(sourceBoard.requiredRoutes?.length === 19, `source route count must be 19, found ${sourceBoard.requiredRoutes?.length}`);
  assert(normalizedBoard.routes?.length === 19, `normalized route count must be 19, found ${normalizedBoard.routes?.length}`);
  assert(sourceBoard.stereoGroups?.length === 7, `source stereo group count must be 7, found ${sourceBoard.stereoGroups?.length}`);
  assert(normalizedBoard.stereoGroups?.length === 7, `normalized stereo group count must be 7, found ${normalizedBoard.stereoGroups?.length}`);
  assert(sourceBoard.hitboxes?.good?.length === 38, `source good hitbox count must be 38, found ${sourceBoard.hitboxes?.good?.length}`);
  assert(normalizedBoard.hitboxes?.good?.length === 38, `normalized good hitbox count must be 38, found ${normalizedBoard.hitboxes?.good?.length}`);
  assert(normalizedBoard.nodes?.validEndpointKeys?.length === 38, `normalized valid endpoint count must be 38, found ${normalizedBoard.nodes?.validEndpointKeys?.length}`);
  assert(sourceBoard.hitboxes?.false?.length === 0, "source hitboxes.false must stay empty because LIV-020 false hardware records have duplicate layout keys");
  assert(normalizedBoard.hitboxes?.false?.length === 0, "normalized hitboxes.false must stay empty because LIV-020 false hardware records have duplicate layout keys");
  assert(normalizedBoard.nodes?.falseTrapKeys?.length === 0, "normalized falseTrapKeys must stay empty for LIV-020 controlled manifest");
  assert(sourceBoard.puzzle?.puzzleMode === "capstone-system", "source puzzleMode must be capstone-system");
  assert(normalizedBoard.puzzle?.puzzleMode === "capstone-system", "normalized puzzleMode must be capstone-system");
  assert(JSON.stringify(sourceBoard.puzzle) === JSON.stringify(normalizedBoard.puzzle), "normalized puzzle metadata must match source metadata exactly");
}

if (snapshotRoutes && sourceBoard && normalizedBoard) {
  const snapshotRouteIds = snapshotRoutes.routes.map(route => route.id).sort();
  const sourceRouteIds = sourceBoard.requiredRoutes.map(route => route.id).sort();
  const normalizedRouteIds = normalizedBoard.routes.map(route => route.key).sort();
  assert(JSON.stringify(sourceRouteIds) === JSON.stringify(snapshotRouteIds), "source route IDs must match snapshot route IDs");
  assert(JSON.stringify(normalizedRouteIds) === JSON.stringify(snapshotRouteIds), "normalized route IDs must match snapshot route IDs");

  const snapshotPairs = snapshotRoutes.routes.map(route => `${route.from.id}->${route.to.id}`).sort();
  const sourcePairs = sourceBoard.requiredRoutes.map(routePair).sort();
  const normalizedPairs = normalizedBoard.routes.map(routePair).sort();
  assert(JSON.stringify(sourcePairs) === JSON.stringify(snapshotPairs), "source route endpoint pairs must match snapshot");
  assert(JSON.stringify(normalizedPairs) === JSON.stringify(snapshotPairs), "normalized route endpoint pairs must match snapshot");
}

if (snapshotStereoGroups && sourceBoard && normalizedBoard) {
  for (const group of snapshotStereoGroups.stereoGroups || []) {
    const sourceGroup = sourceBoard.stereoGroups.find(item => item.id === group.id);
    const normalizedGroup = normalizedBoard.stereoGroups.find(item => item.id === group.id);
    assert(Boolean(sourceGroup), `source stereo group missing: ${group.id}`);
    assert(Boolean(normalizedGroup), `normalized stereo group missing: ${group.id}`);
    const expectedLeft = group.routeIds.find(routeId => group.routeSides[routeId] === "left");
    const expectedRight = group.routeIds.find(routeId => group.routeSides[routeId] === "right");
    assert(sourceGroup?.leftRouteId === expectedLeft, `source stereo group ${group.id} left route mismatch`);
    assert(sourceGroup?.rightRouteId === expectedRight, `source stereo group ${group.id} right route mismatch`);
    assert(normalizedGroup?.leftRouteId === expectedLeft, `normalized stereo group ${group.id} left route mismatch`);
    assert(normalizedGroup?.rightRouteId === expectedRight, `normalized stereo group ${group.id} right route mismatch`);
  }
}

if (snapshotGoodHitboxes && sourceBoard && normalizedBoard) {
  const snapshotKeys = snapshotGoodHitboxes.hitboxes.map(hitbox => hitbox.key).sort();
  const sourceKeys = sourceBoard.hitboxes.good.map(hitbox => hitbox.id).sort();
  const normalizedKeys = normalizedBoard.hitboxes.good.map(hitbox => hitbox.id).sort();
  assert(JSON.stringify(sourceKeys) === JSON.stringify(snapshotKeys), "source good hitbox IDs must match snapshot keys");
  assert(JSON.stringify(normalizedKeys) === JSON.stringify(snapshotKeys), "normalized good hitbox IDs must match snapshot keys");
}

if (snapshotFalseHitboxes && sourceBoard && normalizedBoard) {
  const sourceFalseLayout = sourceBoard.preservation?.falseHardwareLayout;
  const normalizedFalseLayout = normalizedBoard.preservation?.falseHardwareLayout;
  assert(sourceFalseLayout?.recordCount === 113, `source false hardware layout count must be 113, found ${sourceFalseLayout?.recordCount}`);
  assert(normalizedFalseLayout?.recordCount === 113, `normalized false hardware layout count must be 113, found ${normalizedFalseLayout?.recordCount}`);
  assert(sourceFalseLayout?.records?.length === 113, `source false hardware layout records must be 113, found ${sourceFalseLayout?.records?.length}`);
  assert(normalizedFalseLayout?.records?.length === 113, `normalized false hardware layout records must be 113, found ${normalizedFalseLayout?.records?.length}`);
  assert(sourceFalseLayout?.uniqueKeyCount === 109, `source false hardware uniqueKeyCount must be 109, found ${sourceFalseLayout?.uniqueKeyCount}`);
  assert(normalizedFalseLayout?.uniqueKeyCount === 109, `normalized false hardware uniqueKeyCount must be 109, found ${normalizedFalseLayout?.uniqueKeyCount}`);
  assert(sameStringSet(sourceFalseLayout?.duplicateKeys, expectedDuplicateFalseKeys), "source duplicate false layout keys must be preserved");
  assert(sameStringSet(normalizedFalseLayout?.duplicateKeys, expectedDuplicateFalseKeys), "normalized duplicate false layout keys must be preserved");
  assert(sourceFalseLayout?.behavior?.hintable === false, "source false hardware layout must remain non-hintable");
  assert(normalizedFalseLayout?.behavior?.hintable === false, "normalized false hardware layout must remain non-hintable");
  assert(sourceFalseLayout?.behavior?.completionCredit === false, "source false hardware layout must remain non-completing");
  assert(normalizedFalseLayout?.behavior?.completionCredit === false, "normalized false hardware layout must remain non-completing");

  const sourceFalseCounts = countBy(sourceFalseLayout?.records, record => record.key);
  const normalizedFalseCounts = countBy(normalizedFalseLayout?.records, record => record.key);
  for (const duplicateKey of expectedDuplicateFalseKeys) {
    assert(sourceFalseCounts.get(duplicateKey) === 2, `${duplicateKey} must be duplicated exactly twice in source preservation records`);
    assert(normalizedFalseCounts.get(duplicateKey) === 2, `${duplicateKey} must be duplicated exactly twice in normalized preservation records`);
  }
}

if (snapshotBadRoutePairs && sourceBoard && normalizedBoard) {
  const sourceBadPairs = sourceBoard.invalidRouteEvidence?.curatedBadRoutePairs;
  const normalizedBadPairs = normalizedBoard.invalidRouteEvidence?.curatedBadRoutePairs;
  assert(sourceBadPairs?.count === 113, `source curated bad-route count must be 113, found ${sourceBadPairs?.count}`);
  assert(normalizedBadPairs?.count === 113, `normalized curated bad-route count must be 113, found ${normalizedBadPairs?.count}`);
  assert(sourceBadPairs?.pairs?.length === 113, `source curated bad-route pairs must be 113, found ${sourceBadPairs?.pairs?.length}`);
  assert(normalizedBadPairs?.pairs?.length === 113, `normalized curated bad-route pairs must be 113, found ${normalizedBadPairs?.pairs?.length}`);
  assert(sourceBadPairs?.behavior?.generatedFromFalseHardwareHitboxLayout === false, "source bad-route pairs must not be generated from false hardware layout");
  assert(normalizedBadPairs?.behavior?.generatedFromFalseHardwareHitboxLayout === false, "normalized bad-route pairs must not be generated from false hardware layout");
  assert(sourceBadPairs?.behavior?.completionCredit === false, "source curated bad routes must remain non-completing");
  assert(normalizedBadPairs?.behavior?.completionCredit === false, "normalized curated bad routes must remain non-completing");
}

if (snapshotWrongRouteBehavior && sourceBoard && normalizedBoard) {
  assert(sourceBoard.invalidRouteEvidence?.redInvalidRouteBehavior === true, "source must preserve red invalid-route behavior evidence");
  assert(normalizedBoard.invalidRouteEvidence?.redInvalidRouteBehavior === true, "normalized must preserve red invalid-route behavior evidence");
  assert(sourceBoard.invalidRouteEvidence?.invalidRoutesNonCompleting === true, "source must preserve invalid routes as non-completing");
  assert(normalizedBoard.invalidRouteEvidence?.invalidRoutesNonCompleting === true, "normalized must preserve invalid routes as non-completing");
}

if (sourceBoard && normalizedBoard) {
  assert(sourceBoard.preservation?.separation?.falseHardwareLayoutIsRoutePairLogic === false, "source must state false hardware layout is not route-pair logic");
  assert(normalizedBoard.preservation?.separation?.falseHardwareLayoutIsRoutePairLogic === false, "normalized must state false hardware layout is not route-pair logic");
  assert(sourceBoard.preservation?.separation?.curatedBadRoutePairsGeneratedFromFalseHardwareLayout === false, "source must state curated bad pairs are not generated from false layout");
  assert(normalizedBoard.preservation?.separation?.curatedBadRoutePairsGeneratedFromFalseHardwareLayout === false, "normalized must state curated bad pairs are not generated from false layout");
  assert(sourceBoard.preservation?.separation?.indexBasedMappingAsserted === false, "source must not assert index-based mapping");
  assert(normalizedBoard.preservation?.separation?.indexBasedMappingAsserted === false, "normalized must not assert index-based mapping");
  assert(sourceBoard.preservation?.separation?.falseHardwareLayoutStoredOutsideHitboxesFalse === true, "source must record false hardware layout outside hitboxes.false");
  assert(normalizedBoard.preservation?.separation?.falseHardwareLayoutStoredOutsideHitboxesFalse === true, "normalized must record false hardware layout outside hitboxes.false");
}

if (liveSoundMap) {
  const liv020 = liveSoundMap.levels?.["LIV-020"];
  assert(liv020?.status === "needs-review", "LIV-020 must remain needs-review in data/puzzle-metadata/live-sound.json");
  assert(liv020?.taskMode === "capstone-system", "LIV-020 batch metadata must remain capstone-system");
}

const summary = {
  levelId: "LIV-020",
  mode: "read-only",
  sourceManifest: "data/live-sound/boards/liv020.json",
  normalizedManifest: "data/live-sound/boards/normalized/liv020.normalized.json",
  counts: {
    routes: sourceBoard?.requiredRoutes?.length ?? null,
    stereoGroups: sourceBoard?.stereoGroups?.length ?? null,
    goodHitboxes: sourceBoard?.hitboxes?.good?.length ?? null,
    schemaFalseHitboxes: sourceBoard?.hitboxes?.false?.length ?? null,
    falseHardwareLayoutRecords: sourceBoard?.preservation?.falseHardwareLayout?.records?.length ?? null,
    curatedBadRoutePairs: sourceBoard?.invalidRouteEvidence?.curatedBadRoutePairs?.pairs?.length ?? null
  },
  separation: {
    falseHardwareLayoutStoredOutsideHitboxesFalse: sourceBoard?.preservation?.separation?.falseHardwareLayoutStoredOutsideHitboxesFalse ?? null,
    curatedBadRoutePairsGeneratedFromFalseHardwareLayout: sourceBoard?.preservation?.separation?.curatedBadRoutePairsGeneratedFromFalseHardwareLayout ?? null,
    indexBasedMappingAsserted: sourceBoard?.preservation?.separation?.indexBasedMappingAsserted ?? null
  },
  status: liveSoundMap?.levels?.["LIV-020"]?.status ?? null,
  failures
};

if (failures.length) {
  console.error("LIV-020 manifest parity check failed");
  console.error(JSON.stringify(summary, null, 2));
  process.exit(1);
}

console.log("LIV-020 manifest parity check passed");
console.log(JSON.stringify(summary, null, 2));
