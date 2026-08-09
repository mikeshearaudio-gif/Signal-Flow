#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "audit/liv029-preservation-snapshot");

const sourceFiles = {
  renderer: "src/live-sound-native-renderer.js",
  sourceBoard: "data/live-sound/boards/liv029.json",
  normalizedBoard: "data/live-sound/boards/normalized/liv029.normalized.json",
  launcher: "launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html",
  legacyLauncher: "launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html",
  acceptance: "tools/live_sound_patch_acceptance.test.mjs"
};

const expected = {
  routes: 11,
  gear: 7,
  goodHitboxes: 22,
  falseHitboxes: 8,
  stereoGroups: 3,
  alignedWirelessAsset: "assets/live-sound/svg/hardware/wireless-receiver-panel-animated-aligned.svg"
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

function normalizeAsset(asset) {
  return String(asset || "").replace(/^\/+/, "").replace(/^\.\.\//, "");
}

function sliceBalanced(text, startIndex, openChar, closeChar) {
  let depth = 0;
  let inString = false;
  let stringQuote = "";
  let escaped = false;

  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === stringQuote) {
        inString = false;
      }
      continue;
    }

    if (char === "\"" || char === "'" || char === "`") {
      inString = true;
      stringQuote = char;
      continue;
    }

    if (char === openChar) depth += 1;
    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) return text.slice(startIndex, index + 1);
    }
  }

  throw new Error(`Could not find balanced ${openChar}${closeChar} slice`);
}

function extractArrayConstant(text, constantName) {
  const marker = `const ${constantName} = `;
  const markerIndex = text.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Could not find ${constantName}`);
  const arrayStart = text.indexOf("[", markerIndex);
  const arrayText = sliceBalanced(text, arrayStart, "[", "]");
  return Function(`"use strict"; return (${arrayText});`)();
}

function extractLiv029RenderFunction(renderer) {
  const start = renderer.indexOf("function renderLiv029DebatePanelScaffold(surface, adapter) {");
  if (start < 0) throw new Error("Could not find renderLiv029DebatePanelScaffold");
  return sliceBalanced(renderer, renderer.indexOf("{", start), "{", "}");
}

function extractBoardDimensions(renderFunction) {
  const width = Number((renderFunction.match(/const boardWidth = (\d+);/) || [])[1]);
  const height = Number((renderFunction.match(/const boardHeight = (\d+);/) || [])[1]);
  return { widthPx: width, heightPx: height };
}

function extractForcedHeights(renderFunction) {
  const heights = new Map();
  for (const match of renderFunction.matchAll(/\[data-sf-gear-id="([^"]+)"\]\{height:(\d+)px!important;\}/g)) {
    heights.set(match[1], Number(match[2]));
  }
  return heights;
}

function extractRuntimeGear(renderFunction, sourceGear) {
  const forcedHeights = extractForcedHeights(renderFunction);
  const gear = [];
  const gearPattern = /addGear\(\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+),\s*"([^"]+)"([\s\S]*?)\);/g;
  for (const match of renderFunction.matchAll(gearPattern)) {
    const id = match[1];
    const optionsText = match[8] || "";
    const source = sourceGear.find(item => item.id === id);
    const optionHeight = (optionsText.match(/height:\s*([-\d.]+)/) || [])[1];
    const runtime = {
      x: Number(match[4]),
      y: Number(match[5]),
      w: Number(match[6]),
      h: optionHeight ? Number(optionHeight) : forcedHeights.get(id) || null
    };
    const sourceRect = source?.rect || null;
    gear.push({
      id,
      label: match[2],
      asset: normalizeAsset(match[3]),
      className: match[7],
      runtimeGeometry: runtime,
      sourceManifestGeometry: sourceRect,
      geometryMatchesSourceManifest: !!sourceRect &&
        runtime.x === sourceRect.x &&
        runtime.y === sourceRect.y &&
        runtime.w === sourceRect.w &&
        runtime.h === sourceRect.h,
      assetMatchesSourceManifest: !!source && normalizeAsset(match[3]) === normalizeAsset(source.asset),
      renderOptions: {
        showLabel: !/showLabel:\s*false/.test(optionsText),
        mode: (optionsText.match(/mode:\s*"([^"]+)"/) || [])[1] || null,
        objectPosition: (optionsText.match(/objectPosition:\s*"([^"]+)"/) || [])[1] || null
      },
      geometrySource: sourceFiles.renderer,
      sourceManifestGear: source || null
    });
  }
  return gear;
}

function extractRuntimeLabels(renderFunction) {
  return Array.from(renderFunction.matchAll(/addTextLabel\("([^"]+)",\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\);/g)).map((match, index) => ({
    id: `liv029-runtime-label-${index + 1}`,
    text: match[1],
    runtimeGeometry: {
      x: Number(match[2]),
      y: Number(match[3]),
      w: Number(match[4])
    },
    source: sourceFiles.renderer
  }));
}

function routeFamily(route) {
  if (route.id.includes("rx-ch")) return "wireless-receiver-audio-to-console-input";
  if (route.id.includes("main-") && route.id.includes("pa")) return "console-main-to-pa-processor";
  if (route.id.includes("pa-") && route.id.includes("speaker")) return "pa-processor-amp-to-speaker";
  if (route.id.includes("record") || route.id.includes("press")) return "matrix-record-to-press-feed";
  if (route.id.includes("aux-1")) return "monitor-aux-to-moderator-wedge";
  return "unclassified";
}

function groupPurpose(groupId) {
  return {
    "liv029-main-to-pa-inputs": "Console Main L/R must both feed matching PA processor/amp inputs before the stereo checklist pair completes.",
    "liv029-pa-outputs-to-speakers": "PA processor/amp L/R outputs must both feed matching speaker inputs before the stereo checklist pair completes.",
    "liv029-record-to-press-feed": "Matrix/record L/R outputs must both feed matching press recorder inputs before the stereo checklist pair completes."
  }[groupId] || groupId;
}

function labelsByEndpoint(routes) {
  const labels = new Map();
  for (const route of routes) {
    labels.set(route.fromId, route.fromLabel);
    labels.set(route.toId, route.toLabel);
  }
  return labels;
}

function associatedRoutesForEndpoint(routes, endpointId) {
  return routes
    .filter(route => route.fromId === endpointId || route.toId === endpointId)
    .map(route => route.id);
}

function compareRect(runtime, source) {
  if (!source) return null;
  return {
    sourceManifestGeometry: source.rect,
    geometryMatchesSourceManifest:
      runtime.x === source.rect.x &&
      runtime.y === source.rect.y &&
      runtime.w === source.rect.w &&
      runtime.h === source.rect.h,
    delta: {
      x: runtime.x - source.rect.x,
      y: runtime.y - source.rect.y,
      w: runtime.w - source.rect.w,
      h: runtime.h - source.rect.h
    }
  };
}

function normalizeHitbox(hitbox, sourceHitbox, routes, labelMap) {
  const runtime = { x: hitbox.x, y: hitbox.y, w: hitbox.w, h: hitbox.h };
  return {
    id: hitbox.key,
    label: hitbox.label || labelMap.get(hitbox.key) || hitbox.key,
    tag: hitbox.tag || null,
    kind: hitbox.kind || "jack",
    coordinateSystem: "LIV-029 runtime board pixels from renderLiv029DebatePanelScaffold",
    runtimeGeometry: runtime,
    centerPx: {
      x: hitbox.x + hitbox.w / 2,
      y: hitbox.y + hitbox.h / 2
    },
    routeAssociations: associatedRoutesForEndpoint(routes, hitbox.key),
    sourceManifestComparison: compareRect(runtime, sourceHitbox),
    source: sourceFiles.renderer
  };
}

function trapPurpose(hitbox, board) {
  const pairMatches = (board.puzzle?.trapRoutes || []).filter(route => route.from === hitbox.key || route.to === hitbox.key);
  const sourceFalse = (board.hitboxes?.false || []).find(item => item.id === hitbox.key);
  return {
    purpose: pairMatches.map(route => ({
      from: route.from,
      to: route.to,
      concept: route.concept,
      severity: route.severity,
      message: route.message
    })),
    message: sourceFalse?.message || pairMatches[0]?.message || null
  };
}

function classifyVisualRisk(record) {
  if (record.id === "liv029-right-speaker") return "Right-edge clipping risk; current runtime x/w is compact compared with source manifest.";
  if (record.id === "liv029-pa-processor-amp") return "Cable readability risk around PA processor/amp inputs and outputs.";
  if (record.id === "liv029-event-console") return "Dense console port row; labels/cables may overlap in browser smoke.";
  if (record.id === "liv029-moderator-wedge") return "Monitor wedge label/jack crowding risk.";
  return null;
}

const renderer = readText(sourceFiles.renderer);
const board = readJson(sourceFiles.sourceBoard);
const normalized = readJson(sourceFiles.normalizedBoard);
const renderFunction = extractLiv029RenderFunction(renderer);
const runtimeHitboxes = extractArrayConstant(renderer, "LIV029_HITBOXES");
const runtimeGear = extractRuntimeGear(renderFunction, board.gear || []);
const runtimeLabels = extractRuntimeLabels(renderFunction);
const boardDimensions = extractBoardDimensions(renderFunction);

const goodRuntimeHitboxes = runtimeHitboxes.filter(hitbox => !hitbox.falseTrap);
const falseRuntimeHitboxes = runtimeHitboxes.filter(hitbox => hitbox.falseTrap);

assertCount("LIV-029 required routes", board.requiredRoutes.length, expected.routes);
assertCount("LIV-029 runtime gear", runtimeGear.length, expected.gear);
assertCount("LIV-029 runtime good hitboxes", goodRuntimeHitboxes.length, expected.goodHitboxes);
assertCount("LIV-029 runtime false hitboxes", falseRuntimeHitboxes.length, expected.falseHitboxes);
assertCount("LIV-029 stereo groups", board.stereoGroups.length, expected.stereoGroups);

if (!runtimeGear.some(item => item.asset === expected.alignedWirelessAsset)) {
  throw new Error("Aligned wireless receiver asset was not found in runtime gear");
}

const routeLabels = labelsByEndpoint(board.requiredRoutes);
const sourceGood = new Map((board.hitboxes?.good || []).map(item => [item.id, item]));
const sourceFalse = new Map((board.hitboxes?.false || []).map(item => [item.id, item]));

const routes = board.requiredRoutes.map(route => ({
  id: route.id,
  source: {
    id: route.fromId,
    label: route.fromLabel
  },
  destination: {
    id: route.toId,
    label: route.toLabel
  },
  routeFamily: routeFamily(route),
  stereo: {
    isStereoGrouped: Boolean(route.stereoGroup),
    groupId: route.stereoGroup || null,
    side: route.stereoSide || null
  },
  checklist: `${route.fromLabel} -> ${route.toLabel}`,
  evidenceSource: sourceFiles.sourceBoard
}));

const stereoGroups = board.stereoGroups.map(group => ({
  id: group.id,
  purpose: groupPurpose(group.id),
  memberRouteIds: [group.leftRouteId, group.rightRouteId],
  routes: [group.leftRouteId, group.rightRouteId].map(routeId => {
    const route = board.requiredRoutes.find(item => item.id === routeId);
    return {
      id: route.id,
      side: route.stereoSide || null,
      from: route.fromId,
      to: route.toId
    };
  }),
  checklistCompletionSemantics: "Renderer groups LIV-029 stereo checklist rows with LIV-016-style behavior: paired checklist rows are marked after all routes in the stereo group are complete.",
  source: sourceFiles.sourceBoard
}));

const gearLayout = {
  levelId: "LIV-029",
  title: board.title,
  boardDimensions,
  runtimeGeometrySource: "renderLiv029DebatePanelScaffold in src/live-sound-native-renderer.js",
  sourceManifestGeometryNote: "Source-manifest geometry is preserved for data/normalization, but current browser runtime uses the custom renderer geometry captured here.",
  geometrySummary: {
    gearCount: runtimeGear.length,
    runtimeSourceManifestMismatches: runtimeGear.filter(item => !item.geometryMatchesSourceManifest).map(item => item.id),
    visualRisks: runtimeGear.map(classifyVisualRisk).filter(Boolean)
  },
  gear: runtimeGear,
  labels: runtimeLabels
};

const goodHitboxes = goodRuntimeHitboxes.map(hitbox => normalizeHitbox(
  hitbox,
  sourceGood.get(hitbox.key),
  board.requiredRoutes,
  routeLabels
));

const falseHitboxes = falseRuntimeHitboxes.map(hitbox => ({
  ...normalizeHitbox(hitbox, sourceFalse.get(hitbox.key), board.requiredRoutes, routeLabels),
  falseTrap: true,
  hintable: false,
  completing: false,
  neutralBeforeInteraction: true,
  trapPurpose: trapPurpose(hitbox, board)
}));

const lockedBehavior = {
  levelId: "LIV-029",
  title: board.title,
  evidenceOnly: true,
  sourceFiles,
  rendererFunctionsAndConstants: {
    spec: "LIV-029 entry in LIVE_SOUND_LEVEL_SPECS",
    scaffold: "renderLiv029DebatePanelScaffold(surface, adapter)",
    hitboxes: "LIV029_HITBOXES",
    genericPuzzleSpecReader: "getLiveSoundPuzzleSpec(board, levelId)",
    genericFeedbackResolver: "resolveLiveSoundPuzzleFeedback(...)",
    hintFiltering: "isLiveSoundPuzzleHintExcluded(...) plus data-sf-native-hintable flags",
    stereoChecklistBehavior: "markChecklistForCompletedRoute handles LIV-029 stereo groups like LIV-016"
  },
  cableLayerAndAnchors: {
    nativeLayerClass: "sf-live-native-layer sf-live-native-level-liv-029 sf-liv029-debate-panel-scaffold",
    hitboxClass: "sf-native-liv029-hitbox",
    cableAnchors: "data-sf-native-point-x/y set from runtime hitbox centers",
    routeBends: "defaultCableBend has LIV-029-specific bend values for all 11 required routes",
    cableReadability: "LIV-029 cables use slimmer native styling than default patch boards."
  },
  hints: {
    validEndpointCount: expected.goodHitboxes,
    falseTrapExcludedCount: expected.falseHitboxes,
    validEndpointFlags: ["data-sf-native-hintable=1", "data-sf-native-good-hint=1"],
    falseEndpointFlags: ["data-sf-native-false-jack=1", "data-sf-native-hintable=0"],
    expectation: "Show Hints should reveal only the 22 valid endpoint hitboxes and never the 8 false/trap hitboxes."
  },
  trapsAndFeedback: {
    topLevelPuzzleTrapRoutes: board.puzzle?.trapRoutes?.length || 0,
    falseTrapHitboxes: expected.falseHitboxes,
    rfTrapExpectation: "Wireless Receiver Antenna A/B should draw red invalid routes and show RF-not-audio feedback.",
    completionExpectation: "Trap routes are invalid and do not count toward completion."
  },
  scoring: {
    expectedValidRouteScore: "+100 per newly completed required route",
    expectedWrongRoutePenalty: "-50, clamped at 0",
    repeatedWrongRoute: "Should not repeatedly penalize the same wrong route if existing ledger rules recognize the duplicate.",
    notes: "This snapshot records expected behavior; browser smoke must confirm current runtime behavior."
  },
  completion: {
    requiredRouteCount: expected.routes,
    stereoGroupCount: expected.stereoGroups,
    finalCompletionExpectation: "Completion should trigger only after all 11 required route IDs are complete."
  },
  remountAndViewport: {
    scrollHostClass: "sf-live-native-liv029-scroll-host",
    boardDimensions,
    expectedViewportBehavior: "Core route families should be playable in a normal desktop viewport with no excessive panning.",
    knownRisk: "Runtime/source geometry mismatch means browser smoke is the authority for viewport fit."
  },
  manifestParity: {
    sourceRouteCount: board.requiredRoutes.length,
    normalizedRouteCount: normalized.routeCount,
    sourceGoodHitboxes: board.hitboxes.good.length,
    sourceFalseHitboxes: board.hitboxes.false.length,
    runtimeGoodHitboxes: goodRuntimeHitboxes.length,
    runtimeFalseHitboxes: falseRuntimeHitboxes.length,
    alignedWirelessAssetInSource: board.gear.some(item => normalizeAsset(item.asset) === expected.alignedWirelessAsset),
    alignedWirelessAssetInRuntime: runtimeGear.some(item => item.asset === expected.alignedWirelessAsset)
  },
  knownVisualRisks: [
    "Cable clutter may still be dense across the console and PA processor/amp area.",
    "Right-side speaker/PA area should be re-smoked for clipping after the compact runtime layout.",
    "Moderator monitor label and wedge jack should be checked for crowding.",
    "Source-manifest geometry differs from runtime geometry; future edits must choose runtime/browser parity first."
  ]
};

fs.mkdirSync(outDir, { recursive: true });
writeJson("routes.json", {
  levelId: "LIV-029",
  title: board.title,
  routeCount: routes.length,
  routes
});
writeJson("stereo-groups.json", {
  levelId: "LIV-029",
  stereoGroupCount: stereoGroups.length,
  stereoGroups
});
writeJson("gear-layout.json", gearLayout);
writeJson("good-hitboxes.json", {
  levelId: "LIV-029",
  goodHitboxCount: goodHitboxes.length,
  hitboxes: goodHitboxes
});
writeJson("false-hitboxes.json", {
  levelId: "LIV-029",
  falseHitboxCount: falseHitboxes.length,
  hitboxes: falseHitboxes
});
writeJson("locked-behavior.json", lockedBehavior);

console.log(JSON.stringify({
  levelId: "LIV-029",
  snapshotDir: path.relative(root, outDir),
  routes: routes.length,
  gear: runtimeGear.length,
  goodHitboxes: goodHitboxes.length,
  falseHitboxes: falseHitboxes.length,
  stereoGroups: stereoGroups.length,
  runtimeSourceManifestGearMismatches: gearLayout.geometrySummary.runtimeSourceManifestMismatches.length,
  alignedWirelessReceiverAsset: "present"
}, null, 2));
