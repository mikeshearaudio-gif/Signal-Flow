#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "audit/liv026-preservation-snapshot");

const sourceFiles = {
  renderer: "src/live-sound-native-renderer.js",
  launch: "launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html",
  sourceAudit: "docs/live-sound-liv026-source-route-audit.md",
  preservationPlan: "docs/live-sound-locked-board-preservation-plan.md",
  conversionPlan: "docs/live-sound-locked-board-conversion-plan.md",
  stackGuard: "src/sf-liv026-stack-guard.js",
  falseJacksLock: "src/sf-liv026-false-jacks-lock.js",
  processorDecoCleanup: "src/sf-liv026-processor-deco-cleanup.js"
};

const expected = {
  routes: 15,
  stereoGroups: 6,
  trueHitboxes: 31,
  requiredEndpointHitboxes: 30,
  falseHitboxes: 28
};

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function writeJson(fileName, value) {
  fs.writeFileSync(path.join(outDir, fileName), JSON.stringify(value, null, 2) + "\n");
}

function assertCount(name, actual, count) {
  if (actual !== count) {
    throw new Error(`Expected ${count} ${name}, found ${actual}`);
  }
}

function extractBlock(text, startPattern, endPattern, name) {
  const start = text.search(startPattern);
  if (start < 0) throw new Error(`Could not find ${name} start`);
  const afterStart = text.slice(start);
  const end = afterStart.search(endPattern);
  if (end < 0) throw new Error(`Could not find ${name} end`);
  return afterStart.slice(0, end);
}

function extractLiv026Config(renderer) {
  return extractBlock(renderer, /"LIV-026": \{/, /\n\s*\},\n\s*"LIV-029"/, "LIV-026 config");
}

function extractRenderFunction(renderer) {
  return extractBlock(renderer, /function renderLiv026ComplexZones\(surface, adapter\) \{/, /\n\s*function renderLiv023MonitorConsoleStereoPa/, "renderLiv026ComplexZones");
}

function extractRouteObjects(renderer) {
  const config = extractLiv026Config(renderer);
  const validRoutesMatch = config.match(/validRoutes: \[([\s\S]*)\]\s*$/);
  if (!validRoutesMatch) throw new Error("Could not find LIV-026 validRoutes block");

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
  if (/main-[lr]-to-system/.test(routeId)) return "main-to-system-processing";
  if (/system-[lr]-to-crossover/.test(routeId)) return "system-processor-to-crossover";
  if (/crossover-high/.test(routeId)) return "high-band-amp-feed";
  if (/crossover-mid/.test(routeId)) return "mid-band-amp-feed";
  if (/crossover-low/.test(routeId)) return "low-band-amp-feed";
  if (/bus1-to-delay/.test(routeId)) return "delay-tower-mono-feed";
  if (/delay-[lr]-to-delay-amp/.test(routeId)) return "delay-tower-stereo-amp-feed";
  if (/bus2-to-front-fill/.test(routeId)) return "front-fill-mono-feed";
  if (/front-fill-processor-to-fill-amp/.test(routeId)) return "front-fill-amp-feed";
  return "unknown";
}

function purposeForStereoGroup(groupId) {
  return {
    "liv026-main-to-system": "Main L/R outputs feed the system processor inputs in left/right order.",
    "liv026-system-to-crossover": "System processor L/R outputs feed the 3-way crossover inputs.",
    "liv026-high-to-amp": "Crossover high-band L/R outputs feed the high amplifier inputs.",
    "liv026-mid-to-amp": "Crossover mid-band L/R outputs feed the mid amplifier inputs.",
    "liv026-low-to-amp": "Crossover low-band L/R outputs feed the low amplifier inputs.",
    "liv026-delay-to-amp": "Delay processor L/R outputs feed the stereo delay amplifier inputs."
  }[groupId] || groupId;
}

function extractJackLabels(renderBlock) {
  const labels = new Map();
  for (const match of renderBlock.matchAll(/jack\("([^"]+)",\s*[-\d.]+,\s*[-\d.]+,\s*"([^"]+)"\)/g)) {
    labels.set(match[1], match[2]);
  }
  return labels;
}

function extractTrueHitboxes(renderBlock, labels, validEndpointKeys) {
  const match = renderBlock.match(/const liv026TrueHitboxes = \[([\s\S]*?)\];\n\s*liv026TrueHitboxes\.forEach/);
  if (!match) throw new Error("Could not find LIV-026 true hitbox array");

  return Array.from(match[1].matchAll(/\["([^"]+)",\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\]/g)).map(item => {
    const key = item[1];
    const leftPx = Number(item[2]);
    const topPx = Number(item[3]);
    const widthPx = Number(item[4]);
    const heightPx = Number(item[5]);
    return {
      key,
      label: labels.get(key) || key,
      kind: validEndpointKeys.has(key) ? "good" : "unused-baked-true-hitbox",
      coordinateSystem: "liv026-board-pixels",
      rawLeftPx: leftPx,
      rawTopPx: topPx,
      appliedLeftPx: leftPx + 15,
      appliedTopPx: topPx + 18,
      widthPx,
      heightPx,
      centerPx: {
        x: leftPx + 15 + widthPx / 2,
        y: topPx + 18 + heightPx / 2
      },
      raw: {
        key,
        leftPx,
        topPx,
        widthPx,
        heightPx,
        hitboxDx: 15,
        hitboxDy: 18
      }
    };
  });
}

function extractFalseHitboxes(renderBlock) {
  const match = renderBlock.match(/const LIV026_FALSE_HITBOXES = \[([\s\S]*?)\];\n\s*function applyLiv026FalseHitboxes/);
  if (!match) throw new Error("Could not find LIV-026 false hitbox array");

  return Array.from(match[1].matchAll(/\{\s*"key": "([^"]+)",\s*"leftPx": ([-\d.]+),\s*"topPx": ([-\d.]+),\s*"widthPx": ([-\d.]+),\s*"heightPx": ([-\d.]+)\s*\}/g)).map(item => {
    const key = item[1];
    const leftPx = Number(item[2]);
    const topPx = Number(item[3]);
    const widthPx = Number(item[4]);
    const heightPx = Number(item[5]);
    return {
      key,
      label: "False Jack",
      kind: "false",
      coordinateSystem: "liv026-board-pixels",
      leftPx,
      topPx,
      widthPx,
      heightPx,
      centerPx: {
        x: leftPx + widthPx / 2,
        y: topPx + heightPx / 2
      },
      raw: {
        key,
        leftPx,
        topPx,
        widthPx,
        heightPx
      }
    };
  });
}

function extractLaunchBlock(launch) {
  const match = launch.match(/\{\n\s+"id": "LIV-026",[\s\S]*?\n\s+\},\n\s+\{\n\s+"id": "LIV-027"/);
  if (!match) throw new Error("Could not find LIV-026 launch block");
  return match[0].replace(/,\n\s+\{\n\s+"id": "LIV-027"[\s\S]*$/, "");
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

function extractAssets(renderBlock) {
  return Array.from(renderBlock.matchAll(/img\("([^"]+)",\s*"([^"]+)",\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/g)).map(match => ({
    id: match[1],
    asset: match[2],
    leftPx: Number(match[3]),
    topPx: Number(match[4]),
    widthPx: Number(match[5]),
    source: sourceFiles.renderer
  }));
}

function extractTapeLabels(renderBlock) {
  return Array.from(renderBlock.matchAll(/liv026TapeLabel\("([^"]+)",\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/g)).map(match => ({
    text: match[1],
    leftPx: Number(match[2]),
    topPx: Number(match[3]),
    widthPx: Number(match[4]),
    heightPx: Number(match[5]),
    rotationDeg: Number(match[6]),
    source: sourceFiles.renderer
  }));
}

function extractVisibleXlrDecorations(renderBlock) {
  return Array.from(renderBlock.matchAll(/visibleXlrM\("([^"]+)",\s*"([^"]+)",\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/g)).map(match => ({
    id: match[1],
    label: match[2],
    leftPx: Number(match[3]),
    topPx: Number(match[4]),
    widthPx: Number(match[5]),
    heightPx: Number(match[6]),
    zIndex: Number(match[7]),
    source: sourceFiles.renderer
  }));
}

function readOptionalText(relativePath) {
  const fullPath = path.join(root, relativePath);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : "";
}

fs.mkdirSync(outDir, { recursive: true });

const renderer = readText(sourceFiles.renderer);
const launch = readText(sourceFiles.launch);
const renderBlock = extractRenderFunction(renderer);
const routesRaw = extractRouteObjects(renderer);
assertCount("LIV-026 routes", routesRaw.length, expected.routes);

const validEndpointKeys = new Set();
for (const route of routesRaw) {
  validEndpointKeys.add(route.from);
  validEndpointKeys.add(route.to);
}

const jackLabels = extractJackLabels(renderBlock);
const goodHitboxesRaw = extractTrueHitboxes(renderBlock, jackLabels, validEndpointKeys);
const falseHitboxesRaw = extractFalseHitboxes(renderBlock);
assertCount("LIV-026 true hitboxes", goodHitboxesRaw.length, expected.trueHitboxes);
assertCount("LIV-026 required endpoint hitboxes", goodHitboxesRaw.filter(hitbox => hitbox.kind === "good").length, expected.requiredEndpointHitboxes);
assertCount("LIV-026 false hitboxes", falseHitboxesRaw.length, expected.falseHitboxes);

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
  purpose: purposeForStereoGroup(id)
}));
assertCount("LIV-026 stereo groups", stereoGroups.length, expected.stereoGroups);

const routes = routesRaw.map(route => ({
  id: route.id,
  from: {
    id: route.from,
    label: jackLabels.get(route.from) || route.from
  },
  to: {
    id: route.to,
    label: jackLabels.get(route.to) || route.to
  },
  checklist: route.checklist,
  routeFamily: route.routeFamily,
  partOfStereoGroup: route.partOfStereoGroup,
  stereoGroup: route.stereoGroup,
  stereoSide: route.stereoSide
}));

const launchBlock = extractLaunchBlock(launch);
const launcherForbiddenExamples = extractLaunchForbidden(launchBlock);
const stackGuard = readOptionalText(sourceFiles.stackGuard);
const falseJacksLock = readOptionalText(sourceFiles.falseJacksLock);
const processorDecoCleanup = readOptionalText(sourceFiles.processorDecoCleanup);
const sourceFilesInspected = Object.values(sourceFiles);

writeJson("routes.json", {
  levelId: "LIV-026",
  source: sourceFiles.renderer,
  routeCount: routes.length,
  routes,
  note: "Current active renderer evidence supersedes older six-route delay-tower audit rows."
});

writeJson("stereo-groups.json", {
  levelId: "LIV-026",
  source: sourceFiles.renderer,
  stereoGroupCount: stereoGroups.length,
  stereoGroups,
  monoRoutes: routes.filter(route => !route.partOfStereoGroup).map(route => route.id)
});

writeJson("good-hitboxes.json", {
  levelId: "LIV-026",
  source: sourceFiles.renderer,
  coordinateSystem: "liv026-board-pixels",
  expectedCount: expected.trueHitboxes,
  trueHitboxCount: goodHitboxesRaw.length,
  requiredEndpointHitboxCount: goodHitboxesRaw.filter(hitbox => hitbox.kind === "good").length,
  unusedBakedTrueHitboxCount: goodHitboxesRaw.filter(hitbox => hitbox.kind !== "good").length,
  notes: [
    "The renderer's baked true-hitbox array contains 31 entries.",
    "Thirty entries are required route endpoints; liv026-delay-processor-input-unused is intentionally captured as unused baked true-hitbox evidence.",
    "The applied geometry includes renderer offsets HITBOX_DX=15 and HITBOX_DY=18."
  ],
  hitboxes: goodHitboxesRaw
});

writeJson("false-hitboxes.json", {
  levelId: "LIV-026",
  source: sourceFiles.renderer,
  lockScriptSource: sourceFiles.falseJacksLock,
  coordinateSystem: "liv026-board-pixels",
  expectedCount: expected.falseHitboxes,
  falseHitboxCount: falseHitboxesRaw.length,
  behavior: {
    neutralBeforeInteraction: true,
    hintable: false,
    completionCredit: false,
    pointerEvents: "auto",
    opacity: 0,
    invalidRouteRendering: "False hitboxes participate in broad LIV-026 invalid-route rendering but do not count toward completion."
  },
  families: [
    "alternate bus/matrix/aux outputs",
    "unused processor/deco jacks",
    "unused amplifier inputs"
  ],
  hitboxes: falseHitboxesRaw,
  lockScriptNotes: [
    "src/sf-liv026-false-jacks-lock.js preserves 28 false hitboxes.",
    "Some early lock-script names use matrix labels where the active renderer now uses bus labels; active renderer keys are source of truth for future manifests."
  ]
});

writeJson("wrong-route-behavior.json", {
  levelId: "LIV-026",
  rendererEvidence: {
    source: sourceFiles.renderer,
    routeDecisionFunction: "sfLiv020RouteDecision/addRoute LIV-026 fallback",
    rule: "When a pair is not a valid route, any two distinct node keys starting with liv026- are allowed to draw an invalid red route.",
    validRoutesRemainValid: true,
    invalidRoutesCountTowardCompletion: false,
    hintsExcludeFalseJacks: true,
    falseHintExclusionEvidence: [
      "String(key).startsWith(\"liv026-false-\")",
      "data-sf-native-hintable=\"0\"",
      "data-sf-native-good-hint=\"0\""
    ],
    invalidRouteKeyShape: "invalid:<sorted liv026 endpoint keys joined with -->"
  },
  launcherForbiddenExamples,
  knownForbiddenExamples: [
    {
      from: "liv026-main-l-output",
      to: "liv026-system-processor-r-input",
      concept: "stereo-pair-error",
      source: "source-route audit narrative"
    },
    {
      from: "liv026-bus-1-output",
      to: "liv026-front-fill-processor-input",
      concept: "wrong-bus",
      source: "source-route audit narrative"
    },
    {
      from: "liv026-crossover-high-l-output",
      to: "liv026-low-amp-l-input",
      concept: "wrong-destination",
      source: "source-route audit narrative"
    }
  ],
  notes: [
    "The launch block contains no explicit forbidden pairs for LIV-026.",
    "Wrong-route behavior is renderer-specific today and is not represented as canonical puzzle trapRoutes.",
    "Future manifest conversion must preserve broad invalid-route red-cable behavior without counting false hitboxes or invalid routes toward completion."
  ]
});

writeJson("locked-behavior.json", {
  levelId: "LIV-026",
  title: "Full Zone Processing",
  sourceFilesInspected,
  customScriptsAndData: {
    runtimeHelpers: [
      sourceFiles.stackGuard,
      sourceFiles.falseJacksLock,
      sourceFiles.processorDecoCleanup
    ],
    customRenderer: "renderLiv026ComplexZones(surface, adapter)",
    noRuntimeManifestExpected: true
  },
  scrollBehavior: {
    customScrollHostClass: "sf-live-native-liv026-scroll-host",
    boardSizePx: { width: 1400, height: 1260 },
    note: "Custom scroll host and board dimensions are owned by the renderer."
  },
  assets: extractAssets(renderBlock),
  labels: extractTapeLabels(renderBlock),
  visibleDecorations: {
    vuMeters: 8,
    xlrMaleDecorations: extractVisibleXlrDecorations(renderBlock),
    processorDecoCleanup: {
      source: sourceFiles.processorDecoCleanup,
      hidesLabels: ["SUB OUT", "FILL OUT"],
      evidenceFound: processorDecoCleanup.includes("sfLiv026ProcessorDecoHidden")
    }
  },
  hitboxExpectations: {
    trueHitboxes: expected.trueHitboxes,
    requiredEndpointHitboxes: expected.requiredEndpointHitboxes,
    falseHitboxes: expected.falseHitboxes,
    hintsExcludeFalseHitboxes: true,
    falseHitboxLockEvidenceFound: falseJacksLock.includes("liv026falsejacklock2")
  },
  stackGuard: {
    source: sourceFiles.stackGuard,
    evidenceFound: stackGuard.includes("liv026-stack-guard-1"),
    falseJackZIndex: 2100,
    liv026NodeZIndex: 5200,
    cableLayerZIndex: 4800
  },
  cableBehavior: {
    routeLayer: ".sf-native-cables",
    finalCableStackComment: "LIV-026 final stacking + invalid red cable persistence",
    finalCableZIndex: 9000,
    wrongRoutes: "Broad liv026-* invalid pairs draw invalid/red cables and do not complete routes."
  },
  checklistCompletionExpectations: [
    "Required route count remains 15.",
    "Stereo groups complete in the same pairs captured in stereo-groups.json.",
    "Bus 1 delay input, Bus 2 front-fill input, and front-fill amp feed are mono route rows.",
    "False hitboxes and invalid routes remain non-completing."
  ],
  browserSmokeExpectations: [
    "LIV-026 loads with Full Zone Processing title.",
    "Custom scroll host is present.",
    "Main L/R to system processor routes complete.",
    "System processor to crossover routes complete.",
    "At least one high/mid/low amp stereo pair completes.",
    "Bus 1 delay processor route and delay amp stereo pair complete.",
    "Bus 2 front-fill route and fill amp route complete.",
    "False jack attempt draws invalid red route and does not complete.",
    "Show Hints excludes false hitboxes.",
    "Stack guard keeps jacks and cables clickable/visible.",
    "Processor-deco cleanup hides non-gameplay SUB/FILL decorations."
  ]
});

const readme = `# LIV-026 Preservation Snapshot

This directory captures the locked LIV-026 board evidence for future source-manifest conversion work.

This is evidence only. It is not a runtime source manifest, does not create \`data/live-sound/boards/liv026.json\`, and does not change gameplay or renderer behavior.

## Captured Evidence

- Title: \`Full Zone Processing\`
- Required routes: ${routes.length}
- Stereo groups: ${stereoGroups.length}
- Baked true hitboxes: ${goodHitboxesRaw.length}
- Required endpoint hitboxes: ${goodHitboxesRaw.filter(hitbox => hitbox.kind === "good").length}
- Unused baked true hitboxes: ${goodHitboxesRaw.filter(hitbox => hitbox.kind !== "good").length}
- False hitboxes: ${falseHitboxesRaw.length}
- Launch forbidden examples: ${launcherForbiddenExamples.length}

## Files

- \`routes.json\`: current active renderer route IDs, endpoints, checklist text, route family, and stereo metadata.
- \`stereo-groups.json\`: six stereo groups plus mono route IDs.
- \`good-hitboxes.json\`: baked true hitbox geometry, including the unused baked true hitbox.
- \`false-hitboxes.json\`: 28 transparent \`liv026-false-*\` hitboxes and false-jack behavior notes.
- \`wrong-route-behavior.json\`: broad invalid red-route behavior for wrong \`liv026-*\` pairs.
- \`locked-behavior.json\`: scroll, stack guard, false-hitbox lock, processor-deco cleanup, cable, label, and browser-smoke expectations.

## Source Files Inspected

${sourceFilesInspected.map(file => `- \`${file}\``).join("\n")}

## Behavior That Must Be Preserved

- Custom scroll host \`sf-live-native-liv026-scroll-host\`.
- Renderer-owned 1400 x 1260 complex-zone layout.
- 15 required route semantics.
- Six stereo groups: ${stereoGroups.map(group => `\`${group.id}\``).join(", ")}.
- Baked true-hitbox geometry, including \`liv026-delay-processor-input-unused\`.
- 28 transparent false hitboxes.
- False hitboxes stay neutral before interaction, excluded from hints, and non-completing.
- Broad invalid red-route behavior for wrong \`liv026-*\` pairs.
- Stack guard z-index and pointer-event behavior.
- Processor-deco cleanup for non-gameplay SUB/FILL decorations.
- Cable stacking and invalid red-cable persistence.
- Checklist and scoring behavior.

## Stop Conditions For Future Conversion

- Route count differs from 15.
- Stereo group count differs from 6.
- Baked true-hitbox count differs from 31, or required endpoint hitbox count differs from 30.
- False hitbox count differs from 28.
- False hitboxes become hinted or count toward completion.
- Broad invalid red-route behavior for wrong \`liv026-*\` pairs changes.
- Stack guard, scroll host, processor-deco cleanup, cable layer, label, or completion behavior regresses.
- Any future source manifest uses the older six-route delay-tower evidence instead of the current Full Zone Processing renderer evidence.
`;

fs.writeFileSync(path.join(outDir, "README.md"), readme);

const sourceManifestPath = path.join(root, "data/live-sound/boards/liv026.json");
const normalizedManifestPath = path.join(root, "data/live-sound/boards/normalized/liv026.normalized.json");
if (fs.existsSync(sourceManifestPath) || fs.existsSync(normalizedManifestPath)) {
  throw new Error("LIV-026 runtime manifests must not exist during preservation snapshot capture");
}

console.log("LIV-026 preservation snapshot written");
console.log(JSON.stringify({
  outDir: "audit/liv026-preservation-snapshot",
  routes: routes.length,
  stereoGroups: stereoGroups.length,
  trueHitboxes: goodHitboxesRaw.length,
  requiredEndpointHitboxes: goodHitboxesRaw.filter(hitbox => hitbox.kind === "good").length,
  falseHitboxes: falseHitboxesRaw.length,
  launcherForbiddenExamples: launcherForbiddenExamples.length
}, null, 2));
