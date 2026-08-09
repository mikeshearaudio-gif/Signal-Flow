#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "audit/liv020-preservation-snapshot");

const sourceFiles = {
  renderer: "src/live-sound-native-renderer.js",
  launch: "launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html",
  sourceAudit: "docs/live-sound-liv020-source-route-audit.md",
  preservationPlan: "docs/live-sound-locked-board-preservation-plan.md",
  conversionPlan: "docs/live-sound-locked-board-conversion-plan.md",
  rolloutStatus: "docs/live-sound-metadata-rollout-status.md",
  goodHitboxes: "data/live-sound/dev-locks/liv020-good-hitbox-lock-v6r406.json",
  goodHitboxMapper: "src/sf-liv020-good-hitbox-mapper-dev.js",
  badRouteHitboxMapper: "src/sf-liv020-bad-route-hitbox-dev.js",
  badRouteNativeBridge: "src/sf-liv020-bad-route-native-node-bridge-dev.js"
};

const expected = {
  routes: 19,
  stereoGroups: 7,
  goodHitboxes: 38,
  falseHardwareHitboxRecords: 113,
  badRoutePairs: 113
};

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function writeJson(fileName, value) {
  fs.writeFileSync(path.join(outDir, fileName), JSON.stringify(value, null, 2) + "\n");
}

function assertCount(name, actual, expectedCount) {
  if (actual !== expectedCount) {
    throw new Error(`Expected ${expectedCount} ${name}, found ${actual}`);
  }
}

function extractBetween(text, startPattern, endPattern, name) {
  const start = text.search(startPattern);
  if (start < 0) throw new Error(`Could not find ${name} start`);
  const rest = text.slice(start);
  const end = rest.search(endPattern);
  if (end < 0) throw new Error(`Could not find ${name} end`);
  return rest.slice(0, end);
}

function extractLiv020Config(renderer) {
  return extractBetween(renderer, /"LIV-020": \{/, /\n\s*\},\n\};/, "LIV-020 config");
}

function extractRenderFunction(renderer) {
  return extractBetween(renderer, /function renderLiv020MainPaAndIem\(surface, adapter\) \{/, /\n\s*function renderLiv026ComplexZones/, "renderLiv020MainPaAndIem");
}

function extractRouteObjects(config) {
  const validRoutesMatch = config.match(/validRoutes: \[([\s\S]*?)\n\s*\]\s*$/);
  if (!validRoutesMatch) throw new Error("Could not find LIV-020 validRoutes block");

  return Array.from(validRoutesMatch[1].matchAll(/\{[^{}]*key: "([^"]+)"[^{}]*from: "([^"]+)"[^{}]*to: "([^"]+)"[^{}]*checklist: "([^"]+)"([^{}]*)\}/g)).map(match => {
    const tail = match[5] || "";
    const stereoGroup = (tail.match(/stereoGroup: "([^"]+)"/) || [])[1] || null;
    const stereoSide = (tail.match(/stereoSide: "([^"]+)"/) || [])[1] || null;
    return {
      id: match[1],
      from: match[2],
      to: match[3],
      checklist: match[4],
      routeFamily: routeFamilyForRoute(match[1]),
      partOfStereoGroup: !!stereoGroup,
      stereoGroup,
      stereoSide
    };
  });
}

function routeFamilyForRoute(routeId) {
  if (/main-(left|right)-output-to-liv020-crossover/.test(routeId)) return "main-to-crossover";
  if (/crossover-high-.*high-amp/.test(routeId)) return "crossover-high-to-amp";
  if (/crossover-mid-.*mid-amp/.test(routeId)) return "crossover-mid-to-amp";
  if (/crossover-low-.*low-amp/.test(routeId)) return "crossover-low-to-amp";
  if (/high-amp-.*line-array-high/.test(routeId)) return "high-amp-to-line-array";
  if (/mid-amp-.*line-array-mid/.test(routeId)) return "mid-amp-to-line-array";
  if (/low-amp-.*line-array-low/.test(routeId)) return "low-amp-to-line-array";
  if (/aux-\d-output-to-liv020-iem-pack/.test(routeId)) return "aux-to-iem-monitor";
  return "unknown";
}

function purposeForStereoGroup(groupId) {
  return {
    "liv020-main-to-crossover": "Main L/R outputs feed the crossover inputs in left/right order.",
    "liv020-crossover-high-to-amp": "Crossover high-band L/R outputs feed matching high amplifier inputs.",
    "liv020-crossover-mid-to-amp": "Crossover mid-band L/R outputs feed matching mid amplifier inputs.",
    "liv020-crossover-low-to-amp": "Crossover low-band L/R outputs feed matching low amplifier inputs.",
    "liv020-high-amp-to-array": "High amplifier L/R outputs feed matching high line-array inputs.",
    "liv020-mid-amp-to-array": "Mid amplifier L/R outputs feed matching mid line-array inputs.",
    "liv020-low-amp-to-array": "Low amplifier L/R outputs feed matching low line-array inputs."
  }[groupId] || groupId;
}

function extractGeneratedJackKeys(config) {
  const match = config.match(/generatedJackKeys: \[([\s\S]*?)\],\n\s*validRoutes:/);
  if (!match) throw new Error("Could not find LIV-020 generatedJackKeys block");
  return Array.from(match[1].matchAll(/"([^"]+)"/g)).map(item => item[1]);
}

function labelFromKey(key) {
  return String(key || "")
    .replace(/^liv020-/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

function labelsFromRoutes(routes) {
  const labels = new Map();
  routes.forEach(route => {
    const parts = route.checklist.split("→").map(part => part.trim());
    if (parts.length === 2) {
      labels.set(route.from, parts[0]);
      labels.set(route.to, parts[1]);
    }
  });
  return labels;
}

function normalizeGoodHitboxes(raw, labelMap) {
  return Object.entries(raw).map(([key, hitbox]) => ({
    key,
    label: labelMap.get(key) || labelFromKey(key),
    kind: "good",
    coordinateSystem: "liv020-board-pixels",
    leftPx: hitbox.leftPx,
    topPx: hitbox.topPx,
    widthPx: hitbox.widthPx,
    heightPx: hitbox.heightPx,
    centerPx: {
      x: hitbox.centerX,
      y: hitbox.centerY
    },
    layerRelativePercent: {
      x: hitbox.layerRelX,
      y: hitbox.layerRelY
    },
    gearRelative: hitbox.gearRel ?? null,
    raw: hitbox
  }));
}

function parseJsonArrayConstant(renderer, constantName) {
  const pattern = new RegExp("const " + constantName + " = \\[([\\s\\S]*?)\\n\\s*\\];");
  const match = renderer.match(pattern);
  if (!match) throw new Error(`Could not find ${constantName}`);
  return JSON.parse("[" + match[1] + "\n]");
}

function normalizeFalseHitbox(hitbox, index) {
  return {
    index,
    key: hitbox.key,
    label: hitbox.label || hitbox.key,
    kind: "false-hardware-hitbox",
    coordinateSystem: "liv020-board-pixels",
    leftPx: hitbox.leftPx,
    topPx: hitbox.topPx,
    widthPx: hitbox.widthPx,
    heightPx: hitbox.heightPx,
    centerPx: {
      x: hitbox.centerX,
      y: hitbox.centerY
    },
    raw: hitbox
  };
}

function duplicateKeys(records) {
  const seen = new Set();
  const dupes = new Set();
  records.forEach(record => {
    if (seen.has(record.key)) dupes.add(record.key);
    seen.add(record.key);
  });
  return Array.from(dupes).sort();
}

function badRouteConcept(fromKey, toKey) {
  if (/^liv020-main-/.test(fromKey) && /crossover-(left|right)-input/.test(toKey)) return "left-right-swap";
  if (/^liv020-main-/.test(fromKey) && /(amp|line-array|iem-pack)/.test(toKey)) return "processor-bypass-or-wrong-destination";
  if (/^liv020-aux-/.test(fromKey) && /(crossover|line-array)/.test(toKey)) return "monitor-send-to-pa-destination";
  if (/^liv020-aux-/.test(fromKey) && /iem-pack/.test(toKey)) return "wrong-iem-destination";
  if (/crossover-(high|mid|low)-/.test(fromKey) && /amp/.test(toKey)) return "wrong-band-or-side";
  if (/crossover-(high|mid|low)-/.test(fromKey) && /line-array/.test(toKey)) return "processor-output-bypasses-amplifier";
  if (/amp-(left|right)-output/.test(fromKey) && /line-array/.test(toKey)) return "wrong-speaker-band-or-side";
  return "curated-invalid-route";
}

function normalizeBadRoutePairs(pairs, labelMap) {
  return pairs.map(([fromKey, toKey], index) => ({
    index,
    from: {
      id: fromKey,
      label: labelMap.get(fromKey) || labelFromKey(fromKey)
    },
    to: {
      id: toKey,
      label: labelMap.get(toKey) || labelFromKey(toKey)
    },
    concept: badRouteConcept(fromKey, toKey),
    behavior: "allowed invalid route",
    effect: "draws red/invalid cable and does not count toward completion",
    scoringNote: "Uses existing wrong-route penalty behavior; no source-manifest change in this snapshot.",
    source: sourceFiles.renderer,
    evidenceNotes: "Curated real-endpoint bad-route pair from LIV020_BAD_ROUTE_PAIRS. This is separate from false hardware jack layout records."
  }));
}

function extractLaunchBlock(launch) {
  const match = launch.match(/\{\n\s+"id": "LIV-020",[\s\S]*?\n\s+\},\n\s+\{\n\s+"id": "LIV-021"/);
  if (!match) throw new Error("Could not find LIV-020 launch block");
  return match[0].replace(/,\n\s+\{\n\s+"id": "LIV-021"[\s\S]*$/, "");
}

function extractLaunchForbidden(launchBlock) {
  const forbiddenBlock = launchBlock.match(/"forbidden": \[([\s\S]*?)\n\s+\],\n\s+"system"/);
  if (!forbiddenBlock) return [];
  return Array.from(forbiddenBlock[1].matchAll(/\["([^"]+)", "([^"]+)"\]/g)).map(match => ({
    fromLabel: match[1],
    toLabel: match[2],
    source: "launch forbidden examples"
  }));
}

const renderer = readText(sourceFiles.renderer);
const launch = readText(sourceFiles.launch);
const config = extractLiv020Config(renderer);
const renderFunction = extractRenderFunction(renderer);
const routesRaw = extractRouteObjects(config);
const generatedJackKeys = extractGeneratedJackKeys(config);
const labelMap = labelsFromRoutes(routesRaw);
const goodHitboxesRaw = readJson(sourceFiles.goodHitboxes);
const falseHitboxesRaw = parseJsonArrayConstant(renderer, "LIV020_BAD_HITBOX_LAYOUT");
const badRoutePairsRaw = parseJsonArrayConstant(renderer, "LIV020_BAD_ROUTE_PAIRS");
const launchBlock = extractLaunchBlock(launch);
const launchForbiddenExamples = extractLaunchForbidden(launchBlock);

assertCount("LIV-020 routes", routesRaw.length, expected.routes);
assertCount("LIV-020 generated jack keys", generatedJackKeys.length, expected.goodHitboxes);
assertCount("LIV-020 good hitboxes", Object.keys(goodHitboxesRaw).length, expected.goodHitboxes);
assertCount("LIV-020 false hardware hitbox records", falseHitboxesRaw.length, expected.falseHardwareHitboxRecords);
assertCount("LIV-020 curated bad-route pairs", badRoutePairsRaw.length, expected.badRoutePairs);

const stereoGroupMap = new Map();
routesRaw.forEach(route => {
  if (!route.stereoGroup) return;
  if (!stereoGroupMap.has(route.stereoGroup)) stereoGroupMap.set(route.stereoGroup, []);
  stereoGroupMap.get(route.stereoGroup).push(route);
});

const stereoGroups = Array.from(stereoGroupMap.entries()).map(([id, routes]) => ({
  id,
  routeIds: routes.map(route => route.id),
  routeSides: Object.fromEntries(routes.map(route => [route.id, route.stereoSide])),
  purpose: purposeForStereoGroup(id)
}));

assertCount("LIV-020 stereo groups", stereoGroups.length, expected.stereoGroups);

const routes = routesRaw.map(route => ({
  id: route.id,
  from: {
    id: route.from,
    label: labelMap.get(route.from) || labelFromKey(route.from)
  },
  to: {
    id: route.to,
    label: labelMap.get(route.to) || labelFromKey(route.to)
  },
  checklist: route.checklist,
  routeFamily: route.routeFamily,
  partOfStereoGroup: route.partOfStereoGroup,
  stereoGroup: route.stereoGroup,
  stereoSide: route.stereoSide
}));

const goodHitboxes = normalizeGoodHitboxes(goodHitboxesRaw, labelMap);
const falseHitboxes = falseHitboxesRaw.map(normalizeFalseHitbox);
const badRoutePairs = normalizeBadRoutePairs(badRoutePairsRaw, labelMap);
const duplicateFalseKeys = duplicateKeys(falseHitboxesRaw);
const sourceFilesInspected = Object.values(sourceFiles);

fs.mkdirSync(outDir, { recursive: true });

writeJson("routes.json", {
  levelId: "LIV-020",
  title: "Main PA + IEM Monitor Feed",
  source: sourceFiles.renderer,
  routeCount: routes.length,
  generatedJackKeyCount: generatedJackKeys.length,
  generatedJackKeys,
  routes
});

writeJson("stereo-groups.json", {
  levelId: "LIV-020",
  source: sourceFiles.renderer,
  stereoGroupCount: stereoGroups.length,
  stereoGroups,
  monoRouteIds: routes.filter(route => !route.partOfStereoGroup).map(route => route.id),
  note: "The five Aux-to-IEM routes are individual mono aux monitor sends and are not stereo-gated in current route data."
});

writeJson("good-hitboxes.json", {
  levelId: "LIV-020",
  source: sourceFiles.goodHitboxes,
  coordinateSystem: "liv020-board-pixels",
  expectedCount: expected.goodHitboxes,
  goodHitboxCount: goodHitboxes.length,
  hitboxes: goodHitboxes,
  evidenceNotes: [
    "Good hitbox geometry is captured from the v6r406 dev-lock JSON.",
    "Generated jack key count in the active renderer matches the good hitbox count."
  ]
});

writeJson("false-hitboxes.json", {
  levelId: "LIV-020",
  source: sourceFiles.renderer,
  sourceConstant: "LIV020_BAD_HITBOX_LAYOUT",
  coordinateSystem: "liv020-board-pixels",
  expectedCount: expected.falseHardwareHitboxRecords,
  falseHardwareHitboxRecordCount: falseHitboxes.length,
  uniqueKeyCount: new Set(falseHitboxesRaw.map(item => item.key)).size,
  duplicateKeys: duplicateFalseKeys,
  behavior: {
    neutralBeforeInteraction: true,
    hintable: false,
    completionCredit: false,
    installedBy: "installLiv020BadJacks(layer)",
    availabilityUpdater: "sfLiv020UpdateBadJackAvailability(layer, selectedKey)",
    falseRouteHandler: "sfLiv020FalseRoutePair(fromNode, toNode)"
  },
  caution: "These records describe visible/clickable false hardware jack geometry. They are not curated bad-route pairs and must not be mapped to bad-route pair logic by array index.",
  families: [
    "mic inputs",
    "insert points",
    "aux outputs",
    "bus outputs",
    "alternate main outputs",
    "unused IEM points"
  ],
  hitboxes: falseHitboxes
});

writeJson("bad-route-pairs.json", {
  levelId: "LIV-020",
  source: sourceFiles.renderer,
  sourceConstant: "LIV020_BAD_ROUTE_PAIRS",
  expectedCount: expected.badRoutePairs,
  badRoutePairCount: badRoutePairs.length,
  behavior: {
    curated: true,
    generatedFromFalseHardwareHitboxLayout: false,
    allowedAsInvalidRoute: true,
    completionCredit: false,
    routeDecisionFunction: "sfLiv020RouteDecision(fromNode, toNode, baseValid, baseKey)",
    curatedPairCheck: "sfLiv020IsCuratedBadPair(aKey, bKey)"
  },
  caution: "This is curated invalid route logic between endpoint IDs. It is separate from LIV020_BAD_HITBOX_LAYOUT false hardware jack coordinates.",
  pairs: badRoutePairs
});

writeJson("wrong-route-behavior.json", {
  levelId: "LIV-020",
  source: sourceFiles.renderer,
  redInvalidRouteBehavior: true,
  invalidRoutesNonCompleting: true,
  behaviorFamilies: [
    {
      id: "curated-bad-route-pairs",
      count: badRoutePairs.length,
      sourceConstant: "LIV020_BAD_ROUTE_PAIRS",
      description: "Curated invalid real-endpoint pairs are allowed to draw red/invalid cables without completion credit."
    },
    {
      id: "false-hardware-jack-interactions",
      count: falseHitboxes.length,
      sourceConstant: "LIV020_BAD_HITBOX_LAYOUT",
      description: "False hardware jack interactions are handled by sfLiv020FalseRoutePair and are not the same as curated bad-route pairs."
    }
  ],
  broadInvalidRouteRules: [
    "LIV-020 does not use LIV-023/LIV-026 broad any-node invalid behavior.",
    "Real endpoint invalid behavior is curated through LIV020_BAD_ROUTE_PAIRS.",
    "False hardware jack behavior is mediated by sfLiv020FalseRoutePair."
  ],
  knownForbiddenExamples: launchForbiddenExamples,
  scoringOrPenaltyNotes: [
    "Invalid routes use the existing native wrong-route path.",
    "Invalid routes remain non-completing and do not mark checklist rows complete.",
    "This snapshot does not change scoring."
  ],
  evidenceNotes: [
    "addRoute() calls sfLiv020RouteDecision() before committing valid or invalid cable state.",
    "Curated bad-route pairs and false hardware hitbox layout arrays are preserved separately."
  ]
});

writeJson("locked-behavior.json", {
  levelId: "LIV-020",
  title: "Main PA + IEM Monitor Feed",
  sourceFilesInspected,
  rendererEvidence: {
    title: "Main PA + IEM Monitor Feed",
    processorLabel: "3-WAY PA + MONITOR IEM FEEDS",
    renderFunction: "renderLiv020MainPaAndIem(surface, adapter)",
    routeDecisionFunction: "sfLiv020RouteDecision(fromNode, toNode, baseValid, baseKey)",
    falseJackInstaller: "installLiv020BadJacks(layer)",
    falseJackAvailabilityUpdater: "sfLiv020UpdateBadJackAvailability(layer, selectedKey)",
    hitboxLockFunction: "sfLiv020ApplyHitboxLayoutLock(layer, reason)",
    neutralJackNormalizer: "sfLiv020NormalizeNeutralJackRings(reason)"
  },
  counts: {
    routes: routes.length,
    stereoGroups: stereoGroups.length,
    goodHitboxes: goodHitboxes.length,
    falseHardwareHitboxRecords: falseHitboxes.length,
    curatedBadRoutePairs: badRoutePairs.length
  },
  scrollBehaviorNotes: [
    "renderLiv020MainPaAndIem adds sf-live-native-scroll-host-liv010 and sets vertical/horizontal overflow.",
    "The board uses a vertical stack with boardHeight derived from IEM pack placement."
  ],
  labelBehaviorNotes: [
    "LIV020_LABEL_LAYOUT_LOCK and LIV020_LABEL_JSON_LOCK preserve label positions.",
    "IEM INPUT A/B labels are overlays only; no extra IEM equipment is created."
  ],
  hitboxLockNotes: [
    "LIV020_HITBOX_LAYOUT_LOCK and data/live-sound/dev-locks/liv020-good-hitbox-lock-v6r406.json preserve real jack geometry.",
    "Good hitboxes are 38 generated jack keys."
  ],
  falseHitboxBehaviorNotes: [
    "113 false hardware hitbox layout records are installed by installLiv020BadJacks.",
    "False hardware jacks remain hit-testable but visually neutral/hidden before interaction.",
    "False hardware layout data is not route-pair logic."
  ],
  badRouteBehaviorNotes: [
    "113 curated bad-route pairs are checked separately by sfLiv020IsCuratedBadPair.",
    "False hardware jack interactions use sfLiv020FalseRoutePair.",
    "Both paths are invalid/non-completing behavior."
  ],
  hintExclusionNotes: [
    "False hardware jacks are not valid required route endpoints.",
    "Future manifest conversion must preserve Show Hints exclusion for false hardware jacks."
  ],
  cableBehaviorNotes: [
    "Native cable routes use .sf-native-cables.",
    "Invalid/bad route attempts draw red invalid cables and remain non-completing."
  ],
  checklistCompletionExpectations: [
    "Only 19 valid routes can complete checklist rows.",
    "Seven PA route families are stereo grouped.",
    "Five Aux-to-IEM monitor sends are individual mono routes."
  ],
  browserSmokeExpectations: [
    "Board loads as Main PA + IEM Monitor Feed.",
    "One main-to-crossover stereo pair completes as expected.",
    "One crossover-to-amp stereo pair completes as expected.",
    "One amp-to-line-array stereo pair completes as expected.",
    "One Aux-to-IEM route completes as an individual mono route.",
    "Curated bad PA route draws red and does not complete.",
    "Curated wrong IEM route draws red and does not complete.",
    "False hardware jack remains neutral before interaction.",
    "Show Hints does not reveal false hardware jacks.",
    "Score/checklist state does not reset unexpectedly after invalid attempts."
  ],
  caution: "Do not create a source manifest until route, good-hitbox, false-hardware-hitbox, curated bad-route pair, hint, score, cable, scroll, label, and checklist parity are defined."
});

const readme = `# LIV-020 Preservation Snapshot

This directory captures locked LIV-020 board evidence for future source-manifest conversion work.

This is evidence only. It is not a runtime source manifest, does not create \`data/live-sound/boards/liv020.json\`, and does not change gameplay or renderer behavior.

## Captured Evidence

- Title: \`Main PA + IEM Monitor Feed\`
- Required routes: ${routes.length}
- Stereo groups: ${stereoGroups.length}
- Good hitboxes: ${goodHitboxes.length}
- False/bad visible hardware hitbox records: ${falseHitboxes.length}
- Unique false/bad hardware hitbox keys: ${new Set(falseHitboxesRaw.map(item => item.key)).size}
- Curated bad-route pairs: ${badRoutePairs.length}
- Launch forbidden examples: ${launchForbiddenExamples.length}

## Files

- \`routes.json\`: active renderer route IDs, endpoints, checklist text, route family, and stereo metadata.
- \`stereo-groups.json\`: seven PA stereo groups plus five mono Aux-to-IEM route IDs.
- \`good-hitboxes.json\`: 38 valid hitboxes from \`${sourceFiles.goodHitboxes}\`.
- \`false-hitboxes.json\`: 113 false hardware hitbox layout records from \`LIV020_BAD_HITBOX_LAYOUT\`.
- \`bad-route-pairs.json\`: 113 curated invalid route pairs from \`LIV020_BAD_ROUTE_PAIRS\`.
- \`wrong-route-behavior.json\`: invalid red-route behavior, curated pair behavior, false hardware jack behavior, and scoring/completion notes.
- \`locked-behavior.json\`: scroll, label, hitbox lock, false-hitbox, bad-route, hint, cable, checklist, and browser-smoke expectations.

## Source Files Inspected

${sourceFilesInspected.map(file => `- \`${file}\``).join("\n")}

## Important Warning

Do not conflate false hardware jack layout data with curated bad-route pair logic.

- \`false-hitboxes.json\` preserves visible/clickable false hardware jack geometry and labels.
- \`bad-route-pairs.json\` preserves curated invalid route logic between endpoint IDs.
- These arrays both currently contain 113 records, but they are separate concepts and must not be mapped by array index.

## Behavior That Must Be Preserved

- 19 required route semantics.
- Seven PA stereo groups.
- Five mono Aux-to-IEM monitor routes.
- 38 good hitboxes.
- 113 false hardware hitbox layout records.
- 113 curated bad-route pairs.
- False hardware jacks stay neutral/hidden before interaction.
- False hardware jacks stay excluded from Show Hints.
- Curated bad routes and false hardware jack interactions draw red invalid cables and do not count toward completion.
- Locked layout width, gear placement, label locks, hitbox lock, neutral jack-ring normalization, vertical scroll layout, cable behavior, checklist behavior, and scoring behavior.

## Stop Conditions For Future Conversion

- Route count differs from 19.
- Stereo group count differs from 7.
- Good hitbox count differs from 38.
- False hardware hitbox record count differs from 113.
- Curated bad-route pair count differs from 113.
- False hardware jack layout data is treated as bad-route pair logic.
- False hardware jacks become hinted or count toward completion.
- Curated bad routes become valid or complete checklist rows.
- Red invalid-route behavior, score behavior, cable behavior, scroll behavior, label behavior, or locked hitbox geometry changes.
`;

fs.writeFileSync(path.join(outDir, "README.md"), readme);

console.log("LIV-020 preservation snapshot written");
console.log(JSON.stringify({
  levelId: "LIV-020",
  mode: "read-only snapshot extraction",
  outputDirectory: "audit/liv020-preservation-snapshot",
  counts: {
    routes: routes.length,
    stereoGroups: stereoGroups.length,
    goodHitboxes: goodHitboxes.length,
    falseHardwareHitboxRecords: falseHitboxes.length,
    uniqueFalseHardwareHitboxKeys: new Set(falseHitboxesRaw.map(item => item.key)).size,
    duplicateFalseHardwareHitboxKeys: duplicateFalseKeys,
    curatedBadRoutePairs: badRoutePairs.length,
    launchForbiddenExamples: launchForbiddenExamples.length
  },
  separatedEvidence: {
    falseHardwareHitboxLayout: "false-hitboxes.json",
    curatedBadRoutePairs: "bad-route-pairs.json"
  }
}, null, 2));
