import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "audit/liv023-preservation-snapshot");
const rendererPath = path.join(root, "src/live-sound-native-renderer.js");
const launchPath = path.join(root, "launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html");

const sourceFiles = {
  renderer: "src/live-sound-native-renderer.js",
  launch: "launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html",
  sourceAudit: "docs/live-sound-liv023-source-route-audit.md",
  preservationPlan: "docs/live-sound-locked-board-preservation-plan.md",
  conversionPlan: "docs/live-sound-locked-board-conversion-plan.md",
  goodHitboxes: "audit/liv023-good-hitboxes-final.json",
  falseHitboxes: "audit/liv023-false-hitboxes-final.json",
  gearLayout: "audit/liv023-gear-layout-final.json",
  labelLayout: "audit/liv023-label-layout-final.json",
  gearLayerLayout: "audit/liv023-gear-layer-layout-final.json"
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

function assertCount(name, actual, expected) {
  if (actual !== expected) {
    throw new Error(`Expected ${expected} ${name}, found ${actual}`);
  }
}

function extractRouteObjects(renderer) {
  const blockMatch = renderer.match(/"LIV-023": \{[\s\S]*?validRoutes: \[([\s\S]*?)\n\s*\]\n\s*\},\n\s*"LIV-020"/);
  if (!blockMatch) throw new Error("Could not find LIV-023 validRoutes block in renderer");

  const routeObjectMatches = Array.from(blockMatch[1].matchAll(/\{[^{}]*key: "([^"]+)"[^{}]*from: "([^"]+)"[^{}]*to: "([^"]+)"[^{}]*checklist: "([^"]+)"([^{}]*)\}/g));
  return routeObjectMatches.map(match => {
    const tail = match[5] || "";
    const stereoGroup = (tail.match(/stereoGroup: "([^"]+)"/) || [])[1] || null;
    const stereoSide = (tail.match(/stereoSide: "([^"]+)"/) || [])[1] || null;
    return {
      id: match[1],
      from: match[2],
      to: match[3],
      checklist: match[4],
      routeFamily: routeFamilyForRoute(match[1]),
      stereoGroup,
      stereoSide,
      partOfStereoGroup: !!stereoGroup
    };
  });
}

function routeFamilyForRoute(routeId) {
  if (/keyboard-di/.test(routeId)) return "keyboard-stagebox-stereo-source";
  if (/lead-vocal-mic/.test(routeId)) return "vocal-stagebox-source";
  if (/insert|compressor/.test(routeId)) return "vocal-insert-processing";
  if (/aux1.*iem/.test(routeId)) return "stereo-iem-feed";
  if (/main-.*crossover/.test(routeId)) return "main-to-crossover";
  if (/crossover-high/.test(routeId)) return "high-band-amp-feed";
  if (/crossover-mid/.test(routeId)) return "mid-band-amp-feed";
  if (/crossover-low/.test(routeId)) return "low-band-amp-feed";
  return "unknown";
}

function labelsByKey(hitboxes) {
  return Object.fromEntries(hitboxes.map(hitbox => [hitbox.key, hitbox.label || hitbox.key]));
}

function normalizeHitbox(hitbox, kind) {
  return {
    key: hitbox.key,
    label: hitbox.label,
    kind,
    coordinateSystem: "liv023-board-pixels",
    leftPx: hitbox.leftPx,
    topPx: hitbox.topPx,
    widthPx: hitbox.widthPx,
    heightPx: hitbox.heightPx,
    centerPx: {
      x: Math.round((hitbox.leftPx || 0) + (hitbox.widthPx || 0) / 2),
      y: Math.round((hitbox.topPx || 0) + (hitbox.heightPx || 0) / 2)
    },
    raw: hitbox
  };
}

function extractLaunchBlock(launch) {
  const match = launch.match(/\{\n\s+"id": "LIV-023",[\s\S]*?\n\s+\},\n\s+\{\n\s+"id": "LIV-024"/);
  if (!match) throw new Error("Could not find LIV-023 launch block");
  return match[0].replace(/,\n\s+\{\n\s+"id": "LIV-024"[\s\S]*$/, "");
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

const renderer = fs.readFileSync(rendererPath, "utf8");
const launch = fs.readFileSync(launchPath, "utf8");
const goodHitboxesRaw = readJson(sourceFiles.goodHitboxes);
const falseHitboxesRaw = readJson(sourceFiles.falseHitboxes);
const gearLayout = readJson(sourceFiles.gearLayout);
const labelLayout = readJson(sourceFiles.labelLayout);
const gearLayerLayout = readJson(sourceFiles.gearLayerLayout);
const routesRaw = extractRouteObjects(renderer);
const goodLabels = labelsByKey(goodHitboxesRaw);

assertCount("LIV-023 routes", routesRaw.length, 15);
assertCount("LIV-023 good hitboxes", goodHitboxesRaw.length, 30);
assertCount("LIV-023 false hitboxes", falseHitboxesRaw.length, 101);

const stereoGroupMap = new Map();
routesRaw.forEach(route => {
  if (!route.stereoGroup) return;
  if (!stereoGroupMap.has(route.stereoGroup)) {
    stereoGroupMap.set(route.stereoGroup, []);
  }
  stereoGroupMap.get(route.stereoGroup).push(route);
});

const stereoGroups = Array.from(stereoGroupMap.entries()).map(([id, routes]) => ({
  id,
  routeIds: routes.map(route => route.id),
  routeSides: Object.fromEntries(routes.map(route => [route.id, route.stereoSide])),
  purpose: {
    "liv023-keyboard-di-to-stagebox": "Keyboard stereo DI lands on stagebox inputs 2 and 3.",
    "liv023-aux1-to-iem-a": "Aux 1 L/R feeds IEM Transmitter A as a stereo monitor mix.",
    "liv023-main-to-crossover": "Main L/R feeds the 3-way crossover inputs.",
    "liv023-crossover-high-to-amp": "Crossover high-band L/R feeds the high amplifier inputs.",
    "liv023-crossover-mid-to-amp": "Crossover mid-band L/R feeds the mid amplifier inputs.",
    "liv023-crossover-low-to-amp": "Crossover low-band L/R feeds the low amplifier inputs."
  }[id] || id
}));

assertCount("LIV-023 stereo groups", stereoGroups.length, 6);

const routes = routesRaw.map(route => ({
  id: route.id,
  from: {
    id: route.from,
    label: goodLabels[route.from] || route.from
  },
  to: {
    id: route.to,
    label: goodLabels[route.to] || route.to
  },
  checklist: route.checklist,
  routeFamily: route.routeFamily,
  partOfStereoGroup: route.partOfStereoGroup,
  stereoGroup: route.stereoGroup,
  stereoSide: route.stereoSide
}));

const launchBlock = extractLaunchBlock(launch);
const forbiddenExamples = extractLaunchForbidden(launchBlock);

const sourceFilesInspected = Object.values(sourceFiles);

writeJson("routes.json", {
  levelId: "LIV-023",
  source: sourceFiles.renderer,
  routeCount: routes.length,
  routes
});

writeJson("stereo-groups.json", {
  levelId: "LIV-023",
  source: sourceFiles.renderer,
  stereoGroupCount: stereoGroups.length,
  stereoGroups,
  note: "The insert send/return pair is directional processing, not a stereo group."
});

writeJson("good-hitboxes.json", {
  levelId: "LIV-023",
  source: sourceFiles.goodHitboxes,
  coordinateSystem: "liv023-board-pixels",
  expectedCount: 30,
  goodHitboxCount: goodHitboxesRaw.length,
  hitboxes: goodHitboxesRaw.map(hitbox => normalizeHitbox(hitbox, "good"))
});

writeJson("false-hitboxes.json", {
  levelId: "LIV-023",
  source: sourceFiles.falseHitboxes,
  coordinateSystem: "liv023-board-pixels",
  expectedCount: 101,
  falseHitboxCount: falseHitboxesRaw.length,
  behavior: {
    neutralBeforeInteraction: true,
    hintable: false,
    completionCredit: false,
    invalidRouteRendering: "False hitboxes participate in broad LIV-023 invalid-route rendering but do not count toward completion."
  },
  families: [
    "unused stagebox mic/line jacks",
    "stagebox link output",
    "console mic/line inputs",
    "insert sends",
    "insert returns",
    "aux outputs",
    "bus outputs",
    "alternate console bus/patch points"
  ],
  hitboxes: falseHitboxesRaw.map(hitbox => normalizeHitbox(hitbox, "false"))
});

writeJson("wrong-route-behavior.json", {
  levelId: "LIV-023",
  rendererEvidence: {
    source: sourceFiles.renderer,
    routeDecisionFunction: "sfLiv020RouteDecision",
    rule: "For LIV-023, any two distinct keys starting with liv023- are allowed to draw an invalid route when they are not a valid required route.",
    validRoutesRemainValid: true,
    invalidRoutesCountTowardCompletion: false,
    hintsExcludeFalseJacks: true,
    falseHintExclusionEvidence: [
      "String(key).startsWith(\"liv023-false-\")",
      "btn.dataset.sfNativeFalseJack === \"1\"",
      "btn.dataset.sfNativeHintable === \"0\""
    ]
  },
  launcherForbiddenExamples: forbiddenExamples,
  notes: [
    "False/trap behavior is renderer-specific today and is not represented as canonical puzzle trapRoutes.",
    "Future manifest conversion must preserve broad invalid-route red-cable behavior without treating false hitboxes as valid completion endpoints."
  ]
});

writeJson("locked-behavior.json", {
  levelId: "LIV-023",
  title: "Monitor Console: Vocal Insert, Stereo IEM, and 3-Way PA",
  sourceFilesInspected,
  customScriptsAndData: {
    devTools: [
      "src/sf-liv023-good-hitbox-mapper-dev.js",
      "src/sf-liv023-gear-mover-dev.js",
      "src/sf-liv023-label-mover-dev.js",
      "src/sf-liv023-gear-layer-mover-dev.js",
      "src/sf-liv023-static-gear-preview-dev.js"
    ],
    layoutExports: [
      sourceFiles.goodHitboxes,
      sourceFiles.falseHitboxes,
      sourceFiles.gearLayout,
      sourceFiles.labelLayout,
      sourceFiles.gearLayerLayout
    ]
  },
  scrollBehavior: {
    customScrollHostClass: "sf-live-native-liv023-scroll-host",
    boardWidthPx: 900,
    boardHeightPx: 940,
    boardTopOffsetPx: 24,
    scrollHeightPx: 990,
    notes: "Renderer sets vertical native scroll host and hides legacy patchbay/cable artifacts around the native layer."
  },
  legacyMasking: {
    className: "sf-liv023-native-legacy-mask",
    purpose: "Hide old patchbay/cable-layer artifacts behind the native LIV-023 board."
  },
  layoutEvidence: {
    gearLayoutCount: gearLayout.length,
    labelLayoutCount: labelLayout.length,
    gearLayerLayoutCount: gearLayerLayout.length,
    gearLayout,
    labelLayout,
    gearLayerLayout
  },
  hitboxExpectations: {
    goodHitboxes: 30,
    falseHitboxes: 101,
    hintsExcludeFalseHitboxes: true,
    falseHitboxDataset: {
      sfNativeFalseJack: "1",
      sfNativeHintable: "0",
      sfNativeGhost: "1"
    }
  },
  cableBehavior: {
    routeLayer: ".sf-native-cables",
    wrongRoutes: "Broad invalid liv023-* route attempts render as invalid/red cables.",
    validRoutes: "Required routes render as valid/green cables and drive checklist/completion semantics."
  },
  browserSmokeExpectations: [
    "Board loads with title Monitor Console: Vocal Insert, Stereo IEM, and 3-Way PA.",
    "15 required routes are playable.",
    "Six stereo groups retain pair completion behavior.",
    "30 good hitboxes are clickable and remain aligned to visible endpoints.",
    "101 false hitboxes remain neutral before interaction and excluded from hints.",
    "Wrong liv023-* pairs draw invalid/red routes without counting toward completion.",
    "Legacy mask and custom scroll host remain active.",
    "Checklist, score, hints, cable, label, and completion behavior do not regress."
  ]
});

const readme = `# LIV-023 Preservation Snapshot

This package captures the current locked LIV-023 board behavior as evidence only. It is not a runtime source manifest and must not be used as \`data/live-sound/boards/liv023.json\`.

## Captured Evidence

- \`routes.json\`: 15 required routes from the active native renderer.
- \`stereo-groups.json\`: 6 stereo groups from active route metadata.
- \`good-hitboxes.json\`: 30 valid hitboxes from \`${sourceFiles.goodHitboxes}\`.
- \`false-hitboxes.json\`: 101 false/trap hitboxes from \`${sourceFiles.falseHitboxes}\`.
- \`wrong-route-behavior.json\`: broad invalid-route behavior and launcher forbidden examples.
- \`locked-behavior.json\`: scroll host, legacy mask, label/gear layout exports, hitbox expectations, cable behavior, and browser smoke expectations.

## Source Files Inspected

${sourceFilesInspected.map(file => `- \`${file}\``).join("\n")}

## Counts

- Required routes: 15
- Stereo groups: 6
- Good hitboxes: 30
- False hitboxes: 101
- Gear layout entries: ${gearLayout.length}
- Label layout entries: ${labelLayout.length}
- Gear-layer layout entries: ${gearLayerLayout.length}

## Locked Behavior To Preserve

- Custom scroll host class: \`sf-live-native-liv023-scroll-host\`
- Legacy masking layer: \`sf-liv023-native-legacy-mask\`
- Gear, label, good-hitbox, false-hitbox, and gear-layer exported layouts
- Broad invalid-route behavior for distinct \`liv023-*\` pairs that are not valid required routes
- False hitbox hint exclusion via \`liv023-false-*\`, \`data-sf-native-false-jack="1"\`, and \`data-sf-native-hintable="0"\`
- Route/checklist semantics for source inputs, insert direction, stereo IEM, main-to-crossover, and 3-way PA amplifier pairs

## Stop Conditions For Future Conversion

Stop any future LIV-023 source-manifest conversion if:

- Route count is not 15.
- Stereo group count is not 6.
- Good hitbox count is not 30.
- False hitbox count is not 101.
- Any route id, endpoint id, or stereo group membership differs from this snapshot.
- False hitboxes appear in hints or count toward completion.
- Broad invalid-route red-cable behavior changes.
- Scroll host, legacy mask, label placement, gear placement, cable behavior, checklist behavior, score behavior, or completion behavior changes.

## Future Use

Future manifest work should compare proposed \`data/live-sound/boards/liv023.json\` against this snapshot before runtime adoption. The manifest must conform to current board behavior, not the other way around.
`;

fs.writeFileSync(path.join(outDir, "README.md"), readme);

console.log("LIV-023 preservation snapshot written");
console.log(`Routes: ${routes.length}`);
console.log(`Stereo groups: ${stereoGroups.length}`);
console.log(`Good hitboxes: ${goodHitboxesRaw.length}`);
console.log(`False hitboxes: ${falseHitboxesRaw.length}`);
console.log(`Output: ${path.relative(root, outDir)}`);
