#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const DEFAULT_RENDERER = path.join(repoRoot, "src/live-sound-native-renderer.js");
const DEFAULT_LAUNCHER = path.join(repoRoot, "launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html");
const DEFAULT_CACHE_KEY = "6r655liv029fohstable";

function usage() {
  console.log([
    "Usage:",
    "  node tools/live-sound-board-tool.js validate data/live-sound/boards/liv029.json",
    "  node tools/live-sound-board-tool.js bake data/live-sound/boards/liv029.json [--write] [--cache-key key]",
    "",
    "Commands:",
    "  validate   Check board JSON shape and Signal Flow invariants.",
    "  bake       Build renderer and launcher changes for one target level. Dry-run unless --write is present.",
    "  summary    Print a compact board summary."
  ].join("\n"));
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(repoRoot, file), "utf8"));
}

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function validateBoard(board) {
  const errors = [];
  assert(/^LIV-\d{3}$/.test(board.levelId || ""), "levelId must look like LIV-029", errors);
  assert(board.environment === "live", "environment must be live", errors);
  assert(Array.isArray(board.requiredRoutes) && board.requiredRoutes.length > 0, "requiredRoutes must be non-empty", errors);
  assert(Array.isArray(board.gear) && board.gear.length > 0, "gear must be non-empty", errors);
  assert(board.hitboxes && Array.isArray(board.hitboxes.good) && Array.isArray(board.hitboxes.false), "hitboxes.good and hitboxes.false are required arrays", errors);
  assert(Array.isArray(board.prewiredCables), "prewiredCables must be an array", errors);

  const routeIds = new Set();
  const endpointIds = new Set();
  for (const route of board.requiredRoutes || []) {
    assert(route.id && !routeIds.has(route.id), "route ids must be present and unique: " + (route.id || "(missing)"), errors);
    routeIds.add(route.id);
    ["fromId", "toId", "fromLabel", "toLabel"].forEach(key => {
      assert(Boolean(route[key]), "route " + (route.id || "(missing)") + " missing " + key, errors);
    });
    endpointIds.add(route.fromId);
    endpointIds.add(route.toId);
  }

  for (const group of board.stereoGroups || []) {
    assert(routeIds.has(group.leftRouteId), "stereo group " + group.id + " leftRouteId is not a required route", errors);
    assert(routeIds.has(group.rightRouteId), "stereo group " + group.id + " rightRouteId is not a required route", errors);
    const left = board.requiredRoutes.find(route => route.id === group.leftRouteId);
    const right = board.requiredRoutes.find(route => route.id === group.rightRouteId);
    assert(left && left.stereoGroup === group.id && left.stereoSide === "left", "stereo group " + group.id + " left route must be tagged left", errors);
    assert(right && right.stereoGroup === group.id && right.stereoSide === "right", "stereo group " + group.id + " right route must be tagged right", errors);
  }

  for (const item of board.gear || []) {
    assert(item.id && !/^gear-\d+$/i.test(item.id), "gear uses a fallback id: " + (item.id || "(missing)"), errors);
    assert(item.rect && item.rect.w > 0 && item.rect.h > 0, "gear " + item.id + " must have positive rect w/h", errors);
    assert(Boolean(item.asset), "gear " + item.id + " missing asset", errors);
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
  }

  for (const kind of ["good", "false"]) {
    for (const hitbox of (board.hitboxes && board.hitboxes[kind]) || []) {
      assert(hitbox.id && !/^hitbox-\d+$/i.test(hitbox.id), kind + " hitbox uses a fallback id: " + (hitbox.id || "(missing)"), errors);
      assert(hitbox.rect && hitbox.rect.w > 0 && hitbox.rect.h > 0, kind + " hitbox " + hitbox.id + " must have positive rect w/h", errors);
    }
  }

  if (board.acceptance) {
    assert(board.acceptance.gearCount === (board.gear || []).length, "acceptance.gearCount does not match gear length", errors);
    assert(board.acceptance.routeCount === (board.requiredRoutes || []).length, "acceptance.routeCount does not match requiredRoutes length", errors);
    assert(board.acceptance.visualCableCount === (board.prewiredCables || []).length, "acceptance.visualCableCount does not match prewiredCables length", errors);
  }

  return { ok: errors.length === 0, errors, endpointIds: Array.from(endpointIds).sort() };
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

function bake(board, options) {
  const rendererPath = options.renderer || DEFAULT_RENDERER;
  const launcherPath = options.launcher || DEFAULT_LAUNCHER;
  const cacheKey = options.cacheKey || DEFAULT_CACHE_KEY;
  let renderer = fs.readFileSync(rendererPath, "utf8");
  let launcher = fs.readFileSync(launcherPath, "utf8");

  const rendererRange = findJsObjectByQuotedKey(renderer, '"' + board.levelId + '"');
  renderer = renderer.slice(0, rendererRange.start) + rendererLevelSpec(board) + renderer.slice(rendererRange.end);

  const launcherRange = findLauncherLevelObject(launcher, board.levelId);
  const launcherJson = JSON.stringify(launcherLevelObject(board), null, 18).replace(/^/gm, "                  ");
  launcher = launcher.slice(0, launcherRange.start) + launcherJson.trimStart() + launcher.slice(launcherRange.end);

  launcher = launcher.replace(
    /<script src="\.\.\/src\/live-sound-native-renderer\.js\?v=[^"]+"><\/script>/,
    '<script src="../src/live-sound-native-renderer.js?v=' + cacheKey + '"></script>'
  );

  if (options.write) {
    fs.writeFileSync(rendererPath, renderer);
    fs.writeFileSync(launcherPath, launcher);
  }

  return {
    rendererPath,
    launcherPath,
    cacheKey,
    write: options.write,
    rendererBytes: renderer.length,
    launcherBytes: launcher.length
  };
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--write") out.write = true;
    else if (arg === "--cache-key") out.cacheKey = argv[++i];
    else if (arg === "--renderer") out.renderer = path.resolve(repoRoot, argv[++i]);
    else if (arg === "--launcher") out.launcher = path.resolve(repoRoot, argv[++i]);
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
    return;
  }

  if (command === "summary") {
    console.log(JSON.stringify({
      levelId: board.levelId,
      title: board.title,
      routes: board.requiredRoutes.length,
      stereoGroups: board.stereoGroups.length,
      gear: board.gear.length,
      visualOnlyCables: board.prewiredCables.length,
      endpoints: result.endpointIds
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
