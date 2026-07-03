#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "audit/liv019-preservation-snapshot");
const rendererPath = path.join(root, "src/live-sound-native-renderer.js");
const launchPath = path.join(root, "launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html");
const hitboxExportPath = path.join(root, "audit/liv019-hitbox-export-v6r406.json");

const renderer = fs.readFileSync(rendererPath, "utf8");
const launch = fs.readFileSync(launchPath, "utf8");
const hitboxExport = JSON.parse(fs.readFileSync(hitboxExportPath, "utf8"));

function sliceBalanced(text, startIndex, openChar, closeChar) {
  let depth = 0;
  let inString = false;
  let stringQuote = "";
  let escaped = false;

  for (let i = startIndex; i < text.length; i += 1) {
    const ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === stringQuote) {
        inString = false;
      }
      continue;
    }

    if (ch === "\"" || ch === "'" || ch === "`") {
      inString = true;
      stringQuote = ch;
      continue;
    }

    if (ch === openChar) depth += 1;
    if (ch === closeChar) {
      depth -= 1;
      if (depth === 0) return text.slice(startIndex, i + 1);
    }
  }

  throw new Error(`Could not find balanced ${openChar}${closeChar} slice`);
}

function extractLiv019RendererBlock() {
  const marker = "\"LIV-019\":";
  const markerIndex = renderer.indexOf(marker);
  if (markerIndex < 0) throw new Error("Could not find LIV-019 renderer block");
  const blockStart = renderer.indexOf("{", markerIndex);
  return sliceBalanced(renderer, blockStart, "{", "}");
}

function extractValidRoutes(block) {
  const marker = "validRoutes:";
  const markerIndex = block.indexOf(marker);
  if (markerIndex < 0) throw new Error("Could not find LIV-019 validRoutes");
  const arrayStart = block.indexOf("[", markerIndex);
  const arrayText = sliceBalanced(block, arrayStart, "[", "]");
  return Function(`"use strict"; return (${arrayText});`)();
}

function extractGeneratedJackKeys(block) {
  const marker = "generatedJackKeys:";
  const markerIndex = block.indexOf(marker);
  if (markerIndex < 0) throw new Error("Could not find LIV-019 generatedJackKeys");
  const arrayStart = block.indexOf("[", markerIndex);
  const arrayText = sliceBalanced(block, arrayStart, "[", "]");
  return Function(`"use strict"; return (${arrayText});`)();
}

function extractLaunchLevel() {
  const marker = "\"id\": \"LIV-019\"";
  const markerIndex = launch.indexOf(marker);
  if (markerIndex < 0) throw new Error("Could not find LIV-019 launch level");

  let start = markerIndex;
  while (start >= 0 && launch[start] !== "{") start -= 1;
  if (start < 0) throw new Error("Could not find LIV-019 launch object start");

  const objectText = sliceBalanced(launch, start, "{", "}");
  return JSON.parse(objectText);
}

function routeFamily(route) {
  if (route.key.includes("to-stagebox")) return "drum-inputs-to-stagebox";
  if (route.key.includes("aux-") && route.key.includes("to-iem")) return "mono-aux-to-iem";
  if (route.key.includes("to-reverb")) return "stereo-reverb-send";
  if (route.key.includes("to-delay")) return "stereo-delay-send";
  if (route.key.includes("reverb") && route.key.includes("foh-input")) return "stereo-reverb-return";
  if (route.key.includes("delay") && route.key.includes("foh-input")) return "stereo-delay-return";
  return "unclassified";
}

function splitChecklist(checklist) {
  const [sourceLabel, destinationLabel] = String(checklist || "").split("→").map(part => part.trim());
  return { sourceLabel: sourceLabel || "", destinationLabel: destinationLabel || "" };
}

function labelForHitbox(key, routeLabelMap) {
  if (routeLabelMap.has(key)) return routeLabelMap.get(key);
  if (/^stagebox-input-\d+$/.test(key)) return `Stage Box Input ${key.replace("stagebox-input-", "")}`;
  if (/^foh-liv019-aux-\d+-output$/.test(key)) return `FOH Aux ${key.match(/\d+/)[0]} Output`;
  if (/^foh-liv019-bus-\d+-output$/.test(key)) return `FOH Bus ${key.match(/\d+/)[0]} Output`;
  if (/^foh-liv019-input-\d+$/.test(key)) return `FOH Input Channel ${key.replace("foh-liv019-input-", "")}`;
  if (/^liv019-iem-\d+-input$/.test(key)) return `IEM ${key.match(/\d+/)[0]} Input`;
  if (key.includes("reverb-left-input")) return "Stereo Reverb L Input";
  if (key.includes("reverb-right-input")) return "Stereo Reverb R Input";
  if (key.includes("reverb-left-output")) return "Stereo Reverb L Output";
  if (key.includes("reverb-right-output")) return "Stereo Reverb R Output";
  if (key.includes("delay-left-input")) return "Stereo Delay L Input";
  if (key.includes("delay-right-input")) return "Stereo Delay R Input";
  if (key.includes("delay-left-output")) return "Stereo Delay L Output";
  if (key.includes("delay-right-output")) return "Stereo Delay R Output";
  return key.replace(/-/g, " ");
}

function purposeForGroup(groupId) {
  const purposes = {
    "liv019-drum-overheads": "Preserve overhead left/right drum input order into stagebox inputs 7-8.",
    "liv019-bus-1-to-reverb": "Preserve stereo reverb send left/right order from FOH Bus 1/2 to reverb inputs.",
    "liv019-bus-2-to-delay": "Preserve stereo delay send left/right order from FOH Bus 3/4 to delay inputs.",
    "liv019-reverb-return": "Preserve stereo reverb return left/right order into FOH inputs 9-10.",
    "liv019-delay-return": "Preserve stereo delay return left/right order into FOH inputs 11-12."
  };
  return purposes[groupId] || groupId;
}

const block = extractLiv019RendererBlock();
const validRoutes = extractValidRoutes(block);
const generatedJackKeys = extractGeneratedJackKeys(block);
const launchLevel = extractLaunchLevel();

if (validRoutes.length !== 21) throw new Error(`Expected 21 LIV-019 routes, found ${validRoutes.length}`);

const routeLabelMap = new Map();
const routeEndpointIds = new Set();
const routes = validRoutes.map(route => {
  const { sourceLabel, destinationLabel } = splitChecklist(route.checklist);
  routeLabelMap.set(route.from, sourceLabel);
  routeLabelMap.set(route.to, destinationLabel);
  routeEndpointIds.add(route.from);
  routeEndpointIds.add(route.to);
  return {
    id: route.key,
    source: {
      id: route.from,
      label: sourceLabel
    },
    destination: {
      id: route.to,
      label: destinationLabel
    },
    routeFamily: routeFamily(route),
    stereo: {
      isStereoGrouped: Boolean(route.stereoGroup),
      groupId: route.stereoGroup || null,
      side: route.stereoSide || null
    },
    checklist: route.checklist
  };
});

const groupsById = new Map();
for (const route of routes) {
  if (!route.stereo.groupId) continue;
  if (!groupsById.has(route.stereo.groupId)) {
    groupsById.set(route.stereo.groupId, {
      id: route.stereo.groupId,
      label: purposeForGroup(route.stereo.groupId),
      routeIds: [],
      routes: []
    });
  }
  const group = groupsById.get(route.stereo.groupId);
  group.routeIds.push(route.id);
  group.routes.push({
    id: route.id,
    side: route.stereo.side,
    from: route.source.id,
    to: route.destination.id
  });
}

const stereoGroups = Array.from(groupsById.values());
if (stereoGroups.length !== 5) throw new Error(`Expected 5 LIV-019 stereo groups, found ${stereoGroups.length}`);

const hitboxes = Object.keys(hitboxExport).sort().map(key => {
  const raw = hitboxExport[key];
  return {
    id: key,
    label: labelForHitbox(key, routeLabelMap),
    classification: routeEndpointIds.has(key)
      ? "required-route-endpoint"
      : generatedJackKeys.includes(key)
        ? "generated-inactive-or-ghost-endpoint"
        : "locked-extra-endpoint",
    coordinateSystem: "LIV-019 locked native layer pixels plus layer-relative percentages",
    raw
  };
});

if (hitboxes.length !== 70) throw new Error(`Expected 70 LIV-019 locked hitboxes, found ${hitboxes.length}`);

const wrongRoutePairs = (launchLevel.forbidden || []).map((pair, index) => ({
  id: `liv019-launch-forbidden-${index + 1}`,
  sourceLabel: pair[0],
  destinationLabel: pair[1],
  evidenceSource: "launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html LIV-019 forbidden list",
  note: "Launch-level forbidden example. Not canonical top-level puzzle trap metadata yet."
}));

const lockedBehavior = {
  levelId: "LIV-019",
  title: "Drum Inputs, IEM Sends and FX Returns",
  evidenceOnly: true,
  notRuntimeManifest: true,
  sourceFiles: [
    "src/live-sound-native-renderer.js",
    "launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html",
    "launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html",
    "audit/liv019-hitbox-export-v6r406.json",
    "docs/live-sound-liv019-source-route-audit.md",
    "docs/HANDOFF_2026-05-26_LIV019_NATIVE_CABLE_LOCK.md"
  ],
  customScriptsDetected: [
    "src/sf-liv019-scroll-shell.js?v=6r389",
    "src/sf-liv019-overlay-lock.js?v=6r407",
    "src/sf-liv019-foh-label-lock.js?v=6r399",
    "src/sf-liv019-foh-label-final-lock.js?v=6r401",
    "src/sf-liv019-hitbox-final-lock.js?v=6r408q2",
    "src/sf-liv019-stagebox-8-lock.js?v=6r404",
    "src/sf-liv019-clean-finalizer-v6r421.js?v=6r421q2",
    "src/sf-live-cable-mode-kit.js?v=6r426"
  ],
  routeExpectations: {
    requiredRouteCount: 21,
    routeFamilies: [
      "8 drum mics to stagebox inputs 1-8",
      "5 mono FOH Aux outputs to IEM inputs 1-5",
      "Bus 1/2 to stereo reverb L/R inputs",
      "Bus 3/4 to stereo delay L/R inputs",
      "Reverb L/R and delay L/R outputs back to FOH inputs 9-12"
    ],
    stereoGroupCount: 5,
    stereoGroups: stereoGroups.map(group => group.id)
  },
  hitboxExpectations: {
    lockedHitboxCount: 70,
    missingCount: 0,
    hitboxLockReport: "expected: 70, applied: 70, missingCount: 0",
    source: "audit/liv019-hitbox-export-v6r406.json and src/sf-liv019-hitbox-final-lock.js"
  },
  stageboxBehavior: {
    lockedAsEightInputBoard: true,
    validStageboxInputs: ["stagebox-input-1", "stagebox-input-2", "stagebox-input-3", "stagebox-input-4", "stagebox-input-5", "stagebox-input-6", "stagebox-input-7", "stagebox-input-8"],
    extraInputsRule: "stagebox-input-9 through stagebox-input-16 are removed/hidden by src/sf-liv019-stagebox-8-lock.js."
  },
  cableLayerExpectations: {
    owner: "original native game cable renderer",
    nativeCableLayer: ".sf-native-cables",
    zIndex: 2147483600,
    pointerEvents: "none",
    modeSource: "native-game-cables-top-layer",
    forbiddenLayers: [
      "#sf-liv019-cable-stub-layer",
      "#sf-liv019-centered-cable-layer",
      "#sf-liv019-viewport-cable-layer",
      "old #cableLayer finalizer path"
    ],
    anchorRule: "Cable endpoints resolve from locked DOM hitbox centers inside .sf-live-native-layer.sf-live-native-level-liv-019.",
    ignoredAnchorContainers: [".sf-native-liv019-source-panel", ".sf-native-liv009-source-panel"]
  },
  scrollBehaviorNotes: {
    owner: "src/sf-liv019-scroll-shell.js?v=6r389",
    canvasWidth: 1320,
    canvasHeight: 820,
    wrapOverflowX: "auto",
    wrapOverflowY: "auto",
    patchbayPosition: "relative",
    nativeLayerPosition: "absolute at top-left",
    regressionRisk: "Do not regress into vertical-wheel-to-horizontal drift or top-gap anchoring."
  },
  labelAndFinalizerNotes: {
    fohLabelLocks: ["src/sf-liv019-foh-label-lock.js?v=6r399", "src/sf-liv019-foh-label-final-lock.js?v=6r401"],
    finalizerRole: "tool-cleanup-only-no-cables",
    hiddenDuplicateSourcePanels: [".sf-native-liv019-source-panel", ".sf-native-liv009-source-panel"],
    removedDevTools: [
      "#sf-liv019-gear-mover",
      "#sf-liv019-overlay-mover",
      "#sf-liv019-foh-label-mover",
      "#sf-liv019-hitbox-mapper",
      ".sf-liv019-hitbox-visual-layer"
    ]
  },
  falseTrapEvidence: {
    canonicalFalseHitboxSourceFound: false,
    canonicalTrapMetadataFound: false,
    note: "No LIV-019 canonical false/trap hitbox file or top-level puzzle trap metadata was found. Launch-level forbidden examples are captured in wrong-route-pairs.json."
  },
  browserSmokeExpectations: [
    "Kick Mic -> Stage Box Input 1 validates, completes checklist, scores, and draws a native full cable.",
    "FOH Aux 1 Output -> IEM 1 Input validates, completes checklist, scores, and draws a native full cable.",
    "FOH Bus 1 Output -> Stereo Reverb L Input validates, completes checklist, scores, and draws a native full cable.",
    "Native cable SVG stays on the top layer with z-index 2147483600.",
    "Cable endpoints land on locked hitbox centers.",
    "Hitbox lock remains expected: 70, applied: 70, missingCount: 0.",
    "Scroll still works and returning to LIV-019 does not fallback.",
    "No custom stub layer appears and no old runtime finalizer logs appear."
  ]
};

const readme = `# LIV-019 Preservation Snapshot

This directory is a read-only evidence snapshot for the locked LIV-019 board. It is evidence only, not a runtime source manifest, and it must not be wired into the renderer.

## Captured Files

- \`routes.json\`: 21 required routes from the active native renderer.
- \`stereo-groups.json\`: 5 stereo groups derived from the active route data.
- \`good-hitboxes.json\`: 70 locked hitboxes from \`audit/liv019-hitbox-export-v6r406.json\`, including required-route endpoint classification.
- \`wrong-route-pairs.json\`: 6 launch-level forbidden examples for LIV-019.
- \`locked-behavior.json\`: scripts, cable-layer expectations, scroll notes, label/finalizer notes, hitbox expectations, stagebox rules, and browser-smoke expectations.

## Source Files Inspected

- \`src/live-sound-native-renderer.js\`
- \`launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html\`
- \`launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html\`
- \`audit/liv019-hitbox-export-v6r406.json\`
- \`docs/live-sound-liv019-source-route-audit.md\`
- \`docs/live-sound-locked-board-conversion-plan.md\`
- \`docs/live-sound-locked-board-preservation-plan.md\`
- \`docs/HANDOFF_2026-05-26_LIV019_NATIVE_CABLE_LOCK.md\`

## Counts

- Required route count: 21
- Stereo group count: 5
- Locked hitbox count expectation: 70/70, missingCount: 0
- Launch forbidden/wrong-route examples captured: 6

## Behavior That Must Be Preserved

- 8 drum mics route to stagebox inputs 1-8.
- 5 FOH Aux outputs route to IEM inputs 1-5 as mono monitor sends.
- Bus 1/2 feed stereo reverb L/R inputs.
- Bus 3/4 feed stereo delay L/R inputs.
- Reverb L/R and delay L/R outputs return to FOH inputs 9-12.
- Stagebox remains locked as an 8-input board.
- Native cable rendering remains owned by \`.sf-native-cables\` on the top layer.
- Cable endpoints resolve from locked DOM hitbox centers.
- Duplicate source-panel buttons are ignored for cable anchors.
- Scroll shell, label locks, hitbox lock, stagebox lock, clean finalizer, and cable-mode kit remain active.

## Stop Conditions For Future Conversion

- Route count is not 21.
- Stereo group count is not 5.
- Locked hitbox count is not 70 or missingCount is not 0.
- Stagebox inputs 9-16 become visible, hintable, or active.
- Aux-to-IEM routes are converted into stereo IEM pairs.
- Native cables are replaced by custom stubs, pigtails, viewport overlays, or a second cable layer.
- Cable endpoints do not land on locked hitbox centers.
- Scroll, labels, stagebox lock, hitbox lock, finalizer, scoring, hints, checklist timing, or completion behavior changes.
`;

fs.mkdirSync(outDir, { recursive: true });

function writeJson(name, data) {
  fs.writeFileSync(path.join(outDir, name), `${JSON.stringify(data, null, 2)}\n`);
}

writeJson("routes.json", {
  levelId: "LIV-019",
  title: "Drum Inputs, IEM Sends and FX Returns",
  source: "src/live-sound-native-renderer.js LIV-019 validRoutes",
  routeCount: routes.length,
  routes
});

writeJson("stereo-groups.json", {
  levelId: "LIV-019",
  source: "src/live-sound-native-renderer.js LIV-019 validRoutes stereoGroup fields",
  stereoGroupCount: stereoGroups.length,
  stereoGroups
});

writeJson("good-hitboxes.json", {
  levelId: "LIV-019",
  source: "audit/liv019-hitbox-export-v6r406.json",
  lockedHitboxCount: hitboxes.length,
  requiredRouteEndpointHitboxCount: hitboxes.filter(hitbox => hitbox.classification === "required-route-endpoint").length,
  generatedInactiveOrGhostEndpointCount: hitboxes.filter(hitbox => hitbox.classification === "generated-inactive-or-ghost-endpoint").length,
  lockedExtraEndpointCount: hitboxes.filter(hitbox => hitbox.classification === "locked-extra-endpoint").length,
  coordinateSystem: "LIV-019 locked native layer pixels plus layer-relative percentages",
  hitboxes
});

writeJson("wrong-route-pairs.json", {
  levelId: "LIV-019",
  source: "launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html LIV-019 forbidden list",
  canonicalTrapMetadataFound: false,
  wrongRoutePairCount: wrongRoutePairs.length,
  wrongRoutePairs
});

writeJson("locked-behavior.json", lockedBehavior);
fs.writeFileSync(path.join(outDir, "README.md"), readme);

console.log("LIV-019 preservation snapshot written");
console.log(`Directory: ${path.relative(root, outDir)}`);
console.log(`Routes: ${routes.length}`);
console.log(`Stereo groups: ${stereoGroups.length}`);
console.log(`Locked hitboxes: ${hitboxes.length}`);
console.log(`Wrong-route examples: ${wrongRoutePairs.length}`);
