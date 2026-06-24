#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const DEFAULT_BUILD_DIR = path.join(repoRoot, "data/live-sound/boards/normalized");

function usage() {
  console.log([
    "Usage:",
    "  node tools/live-sound-board-tool.js validate data/live-sound/boards/liv029.json",
    "  node tools/live-sound-board-tool.js summary data/live-sound/boards/liv029.json",
    "  node tools/live-sound-board-tool.js bake data/live-sound/boards/liv029.json [--write] [--out path]",
    "",
    "Commands:",
    "  validate   Check board JSON shape and Signal Flow invariants.",
    "  summary    Print a compact board summary.",
    "  bake       Produce a renderer-ready normalized JSON manifest. Dry-run unless --write is present.",
    "",
    "Notes:",
    "  The bake command is intentionally not wired into gameplay yet.",
    "  It never edits src/live-sound-native-renderer.js or launch/*.html."
  ].join("\n"));
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(repoRoot, file), "utf8"));
}

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function assetCandidatePaths(assetPath) {
  const raw = String(assetPath || "").split("?")[0].trim();
  if (!raw) return [];

  const withoutLeadingSlash = raw.replace(/^\/+/, "");
  const repoRelative = withoutLeadingSlash.replace(/^(\.\.\/)+/, "");

  return Array.from(new Set([
    path.resolve(repoRoot, raw),
    path.resolve(repoRoot, withoutLeadingSlash),
    path.resolve(repoRoot, repoRelative)
  ]));
}

function assetExists(assetPath) {
  return assetCandidatePaths(assetPath).some(candidate => fs.existsSync(candidate));
}

function normalizedAssetPath(assetPath) {
  const raw = String(assetPath || "").trim();
  if (!raw) return "";
  const [filePart, queryPart] = raw.split("?");
  const normalized = filePart
    .replace(/^\/+/, "")
    .replace(/^(\.\.\/)+/, "");
  return queryPart ? normalized + "?" + queryPart : normalized;
}

function uniqueSorted(values) {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

function collectEndpointIds(board) {
  const ids = [];
  for (const route of board.requiredRoutes || []) {
    ids.push(route.fromId, route.toId);
  }
  return uniqueSorted(ids);
}

function collectFalseJackIds(board) {
  const ids = [];
  for (const hitbox of (board.hitboxes && board.hitboxes.false) || []) {
    ids.push(hitbox.id);
    if (hitbox.routeId) ids.push(hitbox.routeId);
  }
  return uniqueSorted(ids);
}

function labelTokenOverlap(route) {
  const labelTokens = String(route.fromLabel + " " + route.toLabel)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(token => token.length > 2);

  const id = String(route.id || "").toLowerCase();
  return labelTokens.some(token => id.includes(token));
}

function validateBoard(board) {
  const errors = [];
  const warnings = [];
  assert(/^LIV-\d{3}$/.test(board.levelId || ""), "levelId must look like LIV-029", errors);
  assert(board.environment === "live", "environment must be live", errors);
  assert(typeof board.title === "string" && board.title.trim().length > 0, "title must be present", errors);
  assert(Array.isArray(board.requiredRoutes) && board.requiredRoutes.length > 0, "requiredRoutes must be non-empty", errors);
  assert(Array.isArray(board.gear) && board.gear.length > 0, "gear must be non-empty", errors);
  assert(board.hitboxes && Array.isArray(board.hitboxes.good) && Array.isArray(board.hitboxes.false), "hitboxes.good and hitboxes.false are required arrays", errors);
  assert(Array.isArray(board.prewiredCables), "prewiredCables must be an array", errors);

  const routeIds = new Set();
  const endpointIds = new Set();
  const validEndpointIds = new Set();
  for (const route of board.requiredRoutes || []) {
    assert(route.id && !routeIds.has(route.id), "route ids must be present and unique: " + (route.id || "(missing)"), errors);
    routeIds.add(route.id);
    ["fromId", "toId", "fromLabel", "toLabel"].forEach(key => {
      assert(Boolean(route[key]), "route " + (route.id || "(missing)") + " missing " + key, errors);
    });
    if (route.id && route.fromLabel && route.toLabel && !labelTokenOverlap(route)) {
      warnings.push("route label/key mismatch is suspicious: " + route.id + " (" + route.fromLabel + " -> " + route.toLabel + ")");
    }
    endpointIds.add(route.fromId);
    endpointIds.add(route.toId);
    validEndpointIds.add(route.fromId);
    validEndpointIds.add(route.toId);
  }

  for (const group of board.stereoGroups || []) {
    assert(routeIds.has(group.leftRouteId), "stereo group " + group.id + " leftRouteId is not a required route", errors);
    assert(routeIds.has(group.rightRouteId), "stereo group " + group.id + " rightRouteId is not a required route", errors);
    const left = board.requiredRoutes.find(route => route.id === group.leftRouteId);
    const right = board.requiredRoutes.find(route => route.id === group.rightRouteId);
    assert(left && left.stereoGroup === group.id && left.stereoSide === "left", "stereo group " + group.id + " left route must be tagged left", errors);
    assert(right && right.stereoGroup === group.id && right.stereoSide === "right", "stereo group " + group.id + " right route must be tagged right", errors);
  }

  const groupedRoutes = new Map();
  for (const route of board.requiredRoutes || []) {
    if (!route.stereoGroup) continue;
    if (!groupedRoutes.has(route.stereoGroup)) groupedRoutes.set(route.stereoGroup, []);
    groupedRoutes.get(route.stereoGroup).push(route);
  }

  for (const [groupId, routes] of groupedRoutes.entries()) {
    const sides = new Set(routes.map(route => route.stereoSide));
    assert(sides.has("left") && sides.has("right"), "stereo group " + groupId + " must include both left and right routes", errors);
  }

  for (const item of board.gear || []) {
    assert(item.id && !/^gear-\d+$/i.test(item.id), "gear uses a fallback id: " + (item.id || "(missing)"), errors);
    assert(item.rect && item.rect.w > 0 && item.rect.h > 0, "gear " + item.id + " must have positive rect w/h", errors);
    assert(Boolean(item.asset), "gear " + item.id + " missing asset", errors);
    if (item.asset) assert(assetExists(item.asset), "gear " + item.id + " asset does not exist: " + item.asset, errors);
    if (item.render) {
      const allowedRenderKeys = new Set(["mode", "objectPosition"]);
      Object.keys(item.render).forEach(key => {
        assert(allowedRenderKeys.has(key), "gear " + item.id + " has unsupported render key " + key, errors);
      });
      assert(!item.render.mode || item.render.mode === "crop-fill", "gear " + item.id + " has unsupported render mode " + item.render.mode, errors);
    }
  }

  for (const label of board.labels || []) {
    assert(label.id && !/^label-\d+$/i.test(label.id), "label uses a fallback id: " + (label.id || "(missing)"), errors);
  }

  for (const cable of board.prewiredCables || []) {
    assert(cable.id && !/^cable-\d+$/i.test(cable.id), "cable uses a fallback id: " + (cable.id || "(missing)"), errors);
    assert(cable.visualOnly === true, "prewired cable " + cable.id + " must be visualOnly true", errors);
    assert(Boolean(cable.asset), "prewired cable " + (cable.id || "(missing)") + " missing asset", errors);
    if (cable.asset) assert(assetExists(cable.asset), "prewired cable " + cable.id + " asset does not exist: " + cable.asset, errors);
  }

  const declaredNodeIds = new Set();
  for (const kind of ["good", "false"]) {
    for (const hitbox of (board.hitboxes && board.hitboxes[kind]) || []) {
      assert(hitbox.id && !/^hitbox-\d+$/i.test(hitbox.id), kind + " hitbox uses a fallback id: " + (hitbox.id || "(missing)"), errors);
      assert(!declaredNodeIds.has(hitbox.id), "duplicate node/hitbox key: " + hitbox.id, errors);
      declaredNodeIds.add(hitbox.id);
      assert(hitbox.rect && hitbox.rect.w > 0 && hitbox.rect.h > 0, kind + " hitbox " + hitbox.id + " must have positive rect w/h", errors);
    }
  }

  for (const falseId of collectFalseJackIds(board)) {
    assert(!validEndpointIds.has(falseId), "false/trap jack is also listed as a valid route endpoint: " + falseId, errors);
  }

  if (board.acceptance) {
    assert(board.acceptance.gearCount === (board.gear || []).length, "acceptance.gearCount does not match gear length", errors);
    assert(board.acceptance.routeCount === (board.requiredRoutes || []).length, "acceptance.routeCount does not match requiredRoutes length", errors);
    assert(board.acceptance.visualCableCount === (board.prewiredCables || []).length, "acceptance.visualCableCount does not match prewiredCables length", errors);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    endpointIds: Array.from(endpointIds).sort(),
    falseJackIds: collectFalseJackIds(board)
  };
}

function jsString(value) {
  return JSON.stringify(value);
}

function routeToJs(route) {
  const parts = [
    "key: " + jsString(route.id),
    "from: " + jsString(route.fromId),
    "to: " + jsString(route.toId),
    "checklist: " + jsString(route.fromLabel + " \u2192 " + route.toLabel)
  ];
  if (route.stereoGroup) parts.push("stereoGroup: " + jsString(route.stereoGroup));
  if (route.stereoSide) parts.push("stereoSide: " + jsString(route.stereoSide));
  return "{ " + parts.join(", ") + " }";
}

function objectFromPairs(pairs) {
  const out = {};
  for (const [key, value] of pairs) out[key] = value;
  return out;
}

function rendererLevelSpec(board) {
  const sourceLabels = [];
  const destLabels = [];
  for (const route of board.requiredRoutes) {
    const fromIsSource = /^wireless-receiver/i.test(route.fromId);
    (fromIsSource ? sourceLabels : destLabels).push([route.fromId, route.fromLabel]);
    destLabels.push([route.toId, route.toLabel]);
  }

  const assetMap = {};
  for (const gear of board.gear) {
    if (/wireless-rx/.test(gear.className || "")) assetMap["wireless-receiver"] = gear.asset.replace(/^\.\./, "");
    if (/press-recorder/.test(gear.className || "")) assetMap["press-recorder"] = gear.asset.replace(/^\.\./, "");
    if (/wedge-amp/.test(gear.className || "")) assetMap["wedge-amp"] = gear.asset.replace(/^\.\./, "");
  }

  return [
    '    "' + board.levelId + '": {',
    "      id: " + jsString(board.levelId) + ",",
    "      title: " + jsString(board.title) + ",",
    "      processorLabel: " + jsString(board.processorLabel || "") + ",",
    "      sourceLabels: " + JSON.stringify(objectFromPairs(sourceLabels), null, 8).replace(/\n/g, "\n      ") + ",",
    "      destLabels: " + JSON.stringify(objectFromPairs(destLabels), null, 8).replace(/\n/g, "\n      ") + ",",
    "      validRoutes: [",
    board.requiredRoutes.map(route => "        " + routeToJs(route)).join(",\n"),
    "      ],",
    "      requiredRoutes: [",
    board.requiredRoutes.map(route => "        [" + jsString(route.fromId) + ", " + jsString(route.toId) + "]").join(",\n"),
    "      ],",
    "      stereoGroups: [",
    board.stereoGroups.map(group => {
      const left = board.requiredRoutes.find(route => route.id === group.leftRouteId);
      const right = board.requiredRoutes.find(route => route.id === group.rightRouteId);
      return "        [" + jsString(left.fromId) + ", " + jsString(right.fromId) + "]";
    }).join(",\n"),
    "      ],",
    "      assets: " + JSON.stringify(assetMap, null, 8).replace(/\n/g, "\n      "),
    "    }"
  ].join("\n");
}

function launcherLevelObject(board) {
  return {
    id: board.levelId,
    environment: "live",
    title: board.title,
    brief: board.brief,
    difficulty: 4,
    required: board.requiredRoutes.map(route => [route.fromLabel, route.toLabel]),
    forbidden: (board.forbiddenRoutes || []).map(route => [route.fromLabel, route.toLabel]),
    stereoGroups: board.stereoGroups.map(group => {
      const left = board.requiredRoutes.find(route => route.id === group.leftRouteId);
      const right = board.requiredRoutes.find(route => route.id === group.rightRouteId);
      return [left.fromLabel, right.fromLabel];
    }),
    system: [
      "Wireless receivers feed console input channels; they do not feed the PA processor directly.",
      "Main left/right outputs feed the room PA processor as a stereo pair.",
      "Bus outputs 1 and 2 create the separate stereo press, recorder, or broadcast feed on this console.",
      "Aux outputs are useful for monitor and cue feeds such as confidence monitors."
    ],
    notes: [
      "This board introduces speech-first reinforcement and event distribution rather than another music-stage patch.",
      "Keep the press/recorder feed separate from the house PA mix.",
      "Keep the confidence monitor feed separate from the press feed."
    ],
    learning: [
      "Wireless mic receiver outputs",
      "Speech reinforcement",
      "Stereo bus feeds",
      "Aux cue feeds",
      "Room PA stereo routing"
    ],
    time: 420
  };
}

function findJsObjectByQuotedKey(source, quotedKey) {
  const keyIndex = source.indexOf(quotedKey);
  if (keyIndex < 0) throw new Error("Could not find key " + quotedKey);
  const colon = source.indexOf(":", keyIndex + quotedKey.length);
  const start = source.indexOf("{", colon);
  return braceRange(source, start);
}

function findLauncherLevelObject(source, levelId) {
  const idNeedle = '"id": "' + levelId + '"';
  const idIndex = source.indexOf(idNeedle);
  if (idIndex < 0) throw new Error("Could not find launcher level " + levelId);
  const start = source.lastIndexOf("{", idIndex);
  return braceRange(source, start);
}

function braceRange(source, start) {
  let depth = 0;
  let inString = false;
  let quote = "";
  let escaped = false;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === quote) {
        inString = false;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = true;
      quote = ch;
      continue;
    }
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return { start, end: i + 1 };
    }
  }
  throw new Error("Unclosed object starting at " + start);
}

function normalizedManifest(board) {
  const endpointIds = collectEndpointIds(board);
  const falseJackIds = collectFalseJackIds(board);
  const assets = uniqueSorted([
    ...(board.gear || []).map(item => item.asset),
    ...(board.prewiredCables || []).map(item => item.asset)
  ].map(normalizedAssetPath));

  return {
    schemaVersion: 1,
    generatedBy: "tools/live-sound-board-tool.js",
    levelId: board.levelId,
    environment: board.environment,
    title: board.title,
    brief: board.brief,
    processorLabel: board.processorLabel || "",
    routeCount: (board.requiredRoutes || []).length,
    routes: (board.requiredRoutes || []).map(route => ({
      key: route.id,
      from: route.fromId,
      to: route.toId,
      checklist: route.fromLabel + " \u2192 " + route.toLabel,
      stereoGroup: route.stereoGroup || null,
      stereoSide: route.stereoSide || null
    })),
    nodes: {
      validEndpointKeys: endpointIds,
      falseTrapKeys: falseJackIds
    },
    stereoGroups: board.stereoGroups || [],
    gear: (board.gear || []).map(item => ({
      id: item.id,
      label: item.label,
      asset: normalizedAssetPath(item.asset),
      rect: item.rect,
      className: item.className || "",
      render: item.render || null
    })),
    labels: board.labels || [],
    prewiredCables: (board.prewiredCables || []).map(item => ({
      id: item.id,
      asset: normalizedAssetPath(item.asset),
      rect: item.rect,
      rotation: item.rotation || 0,
      visualOnly: true
    })),
    hitboxes: board.hitboxes || { good: [], false: [] },
    requiredAssets: assets,
    acceptance: board.acceptance || null
  };
}

function defaultBakeOutPath(board) {
  const filename = String(board.levelId || "board").toLowerCase().replace(/-/g, "");
  return path.join(DEFAULT_BUILD_DIR, filename + ".normalized.json");
}

function bake(board, options) {
  const manifest = normalizedManifest(board);
  const outPath = options.out ? path.resolve(repoRoot, options.out) : defaultBakeOutPath(board);

  if (options.write) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n");
  }

  return {
    write: !!options.write,
    outputPath: outPath,
    routeCount: manifest.routeCount,
    validEndpointCount: manifest.nodes.validEndpointKeys.length,
    falseTrapJackCount: manifest.nodes.falseTrapKeys.length,
    gearCount: manifest.gear.length,
    requiredAssets: manifest.requiredAssets,
    manifest
  };
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--write") out.write = true;
    else if (arg === "--out") out.out = argv[++i];
    else out._.push(arg);
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const [command, file] = args._;
  if (!command || !file || command === "help") {
    usage();
    process.exit(command ? 0 : 1);
  }

  const board = readJson(file);
  const result = validateBoard(board);
  if (!result.ok) {
    console.error("Board validation failed:");
    result.errors.forEach(error => console.error(" - " + error));
    process.exit(1);
  }

  if (command === "validate") {
    console.log("Board validation passed:", board.levelId, "routes=" + board.requiredRoutes.length, "gear=" + board.gear.length);
    result.warnings.forEach(warning => console.warn("Warning:", warning));
    return;
  }

  if (command === "summary") {
    console.log(JSON.stringify({
      levelId: board.levelId,
      title: board.title,
      routeCount: board.requiredRoutes.length,
      validEndpointCount: result.endpointIds.length,
      falseTrapJackCount: result.falseJackIds.length,
      gearCount: board.gear.length,
      visualOnlyCableCount: board.prewiredCables.length,
      requiredAssets: uniqueSorted([
        ...board.gear.map(item => normalizedAssetPath(item.asset)),
        ...board.prewiredCables.map(item => normalizedAssetPath(item.asset))
      ]),
      stereoGroups: board.stereoGroups.map(group => group.id),
      endpoints: result.endpointIds,
      falseTrapJacks: result.falseJackIds
    }, null, 2));
    return;
  }

  if (command === "bake") {
    const baked = bake(board, args);
    console.log(JSON.stringify(baked, null, 2));
    return;
  }

  usage();
  process.exit(1);
}

main();
