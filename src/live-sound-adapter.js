/*!
 * Signal Flow - Live Sound Adapter
 * Version: 0.1.0
 *
 * Compatibility shim between existing Signal Flow normal-board jack ids
 * and the new Live Sound hardware panel ids: panel.jack.
 */
(function(root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SF_LIVE_SOUND_ADAPTER = factory();
})(typeof globalThis !== "undefined" ? globalThis : window, function() {
  "use strict";

  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
    "stagebox.mic7": { panel: "stagebox", jack: "mic7", type: "xlr-female", label: "Stagebox Mic 7" },
    "stagebox.mic8": { panel: "stagebox", jack: "mic8", type: "xlr-female", label: "Stagebox Mic 8" },
    "stagebox.linkOut": { panel: "stagebox", jack: "linkOut", type: "xlr-male", label: "Stagebox Link Out" },

    "foh.mic1": { panel: "foh", jack: "mic1", type: "xlr-female", label: "FOH Mic 1" },
    "foh.mic2": { panel: "foh", jack: "mic2", type: "xlr-female", label: "FOH Mic 2" },
    "foh.mic3": { panel: "foh", jack: "mic3", type: "xlr-female", label: "FOH Mic 3" },
    "foh.mic4": { panel: "foh", jack: "mic4", type: "xlr-female", label: "FOH Mic 4" },
    "foh.lineIn5": { panel: "foh", jack: "lineIn5", type: "trs", label: "FOH Line In 5" },
    "foh.lineIn6": { panel: "foh", jack: "lineIn6", type: "trs", label: "FOH Line In 6" },
    "foh.lineIn7": { panel: "foh", jack: "lineIn7", type: "trs", label: "FOH Line In 7" },
    "foh.lineIn8": { panel: "foh", jack: "lineIn8", type: "trs", label: "FOH Line In 8" },
    "foh.lineOut1": { panel: "foh", jack: "lineOut1", type: "xlr-male", label: "FOH Line Out 1" },
    "foh.lineOut2": { panel: "foh", jack: "lineOut2", type: "xlr-male", label: "FOH Line Out 2" },
    "foh.lineOut3": { panel: "foh", jack: "lineOut3", type: "xlr-male", label: "FOH Line Out 3" },
    "foh.lineOut4": { panel: "foh", jack: "lineOut4", type: "xlr-male", label: "FOH Line Out 4" },
    "foh.mainLeft": { panel: "foh", jack: "mainLeft", type: "speakon", label: "FOH Main Left", stereoPair: "foh.mainRight" },
    "foh.mainRight": { panel: "foh", jack: "mainRight", type: "speakon", label: "FOH Main Right", stereoPair: "foh.mainLeft" },

    "monitor.input": { panel: "monitor", jack: "input", type: "xlr-female", label: "Monitor Input" },
    "monitor.thru": { panel: "monitor", jack: "thru", type: "xlr-male", label: "Monitor Thru / Link" },
    "monitor.auxIn": { panel: "monitor", jack: "auxIn", type: "trs", label: "Monitor Aux In" },

    "amp.inputA": { panel: "amp", jack: "inputA", type: "xlr-female", label: "Amp Input A" },
    "amp.inputB": { panel: "amp", jack: "inputB", type: "xlr-female", label: "Amp Input B" },
    "amp.link": { panel: "amp", jack: "link", type: "xlr-male", label: "Amp Link / Thru" },
    "amp.outputA": { panel: "amp", jack: "outputA", type: "speakon", label: "Amp Output A" },
    "amp.outputB": { panel: "amp", jack: "outputB", type: "speakon", label: "Amp Output B" },

    "utility.powerIn": { panel: "utility", jack: "powerIn", type: "powercon", label: "Utility Power In" },
    "utility.powerOut": { panel: "utility", jack: "powerOut", type: "powercon", label: "Utility Power Out" },
    "utility.network": { panel: "utility", jack: "network", type: "rj45", label: "Utility Network" },

    "iem.antennaA": { panel: "iem", jack: "antennaA", type: "bnc", label: "IEM Antenna A" },
    "iem.antennaB": { panel: "iem", jack: "antennaB", type: "bnc", label: "IEM Antenna B" },
    "iem.phones": { panel: "iem", jack: "phones", type: "trs", label: "IEM Phones" },

    "pa.left": { panel: "virtual", jack: "pa.left", type: "speaker", label: "PA Speaker Left", stereoPair: "pa.right" },
    "pa.right": { panel: "virtual", jack: "pa.right", type: "speaker", label: "PA Speaker Right", stereoPair: "pa.left" },
    "iem.receiver1": { panel: "virtual", jack: "iem.receiver1", type: "wireless", label: "IEM Receiver 1" },
    "iem.receiver2": { panel: "virtual", jack: "iem.receiver2", type: "wireless", label: "IEM Receiver 2" }
  });

  const LIVE_PANEL_GEOMETRY = Object.freeze({
    "stagebox.mic1": { x: 130, y: 135 }, "stagebox.mic2": { x: 202, y: 135 },
    "stagebox.mic3": { x: 274, y: 135 }, "stagebox.mic4": { x: 346, y: 135 },
    "stagebox.mic5": { x: 418, y: 135 }, "stagebox.mic6": { x: 490, y: 135 },
    "stagebox.mic7": { x: 562, y: 135 }, "stagebox.mic8": { x: 634, y: 135 },
    "stagebox.linkOut": { x: 775, y: 135 },

    "foh.mic1": { x: 100, y: 134 }, "foh.mic2": { x: 160, y: 134 },
    "foh.mic3": { x: 220, y: 134 }, "foh.mic4": { x: 280, y: 134 },
    "foh.lineIn5": { x: 425, y: 134 }, "foh.lineIn6": { x: 485, y: 134 },
    "foh.lineIn7": { x: 545, y: 134 }, "foh.lineIn8": { x: 605, y: 134 },
    "foh.lineOut1": { x: 715, y: 134 }, "foh.lineOut2": { x: 770, y: 134 },
    "foh.lineOut3": { x: 825, y: 134 }, "foh.lineOut4": { x: 880, y: 134 },
    "foh.mainLeft": { x: 975, y: 134 }, "foh.mainRight": { x: 1045, y: 134 },

    "monitor.input": { x: 150, y: 130 }, "monitor.thru": { x: 315, y: 130 },
    "monitor.auxIn": { x: 470, y: 130 },

    "amp.inputA": { x: 142, y: 125 }, "amp.inputB": { x: 222, y: 125 },
    "amp.link": { x: 360, y: 125 }, "amp.outputA": { x: 760, y: 126 },
    "amp.outputB": { x: 850, y: 126 },

    "utility.powerIn": { x: 115, y: 128 }, "utility.powerOut": { x: 395, y: 128 },
    "utility.network": { x: 560, y: 128 },

    "iem.antennaA": { x: 80, y: 125 }, "iem.antennaB": { x: 815, y: 125 },
    "iem.phones": { x: 635, y: 126 }
  });

  const PANEL_VIEWBOX = Object.freeze({
    stagebox: [0, 0, 860, 260],
    foh: [0, 0, 1120, 260],
    monitor: [0, 0, 850, 240],
    amp: [0, 0, 940, 240],
    utility: [0, 0, 1000, 260],
    iem: [0, 0, 900, 240]
  });

  const DEFAULT_PANEL_PLANS = Object.freeze({
    "stagebox-foh": [
      { id: "stagebox", kind: "stagebox", x: 52, y: 116, width: 610 },
      { id: "foh", kind: "foh", x: 46, y: 410, width: 800 }
    ],
    "foh-monitor": [
      { id: "foh", kind: "foh", x: 46, y: 96, width: 800 },
      { id: "monitor", kind: "monitor", x: 112, y: 420, width: 650 }
    ],
    "foh-amp": [
      { id: "foh", kind: "foh", x: 42, y: 92, width: 805 },
      { id: "amp", kind: "amp", x: 106, y: 400, width: 690 }
    ],
    "iem": [
      { id: "foh", kind: "foh", x: 42, y: 88, width: 805 },
      { id: "iem", kind: "iem", x: 92, y: 410, width: 720 }
    ],
    "utility": [
      { id: "utility", kind: "utility", x: 50, y: 116, width: 760 },
      { id: "foh", kind: "foh", x: 42, y: 430, width: 805 }
    ],
    "final": [
      { id: "stagebox", kind: "stagebox", x: 28, y: 78, width: 520 },
      { id: "foh", kind: "foh", x: 310, y: 260, width: 640 },
      { id: "amp", kind: "amp", x: 42, y: 520, width: 560 },
      { id: "iem", kind: "iem", x: 545, y: 540, width: 430 }
    ]
  });

  const SCENARIO_SLOT_MAP = Object.freeze({
    "stagebox-foh": {
      src1: "stagebox.mic1", dst1: "foh.mic1",
      src2: "stagebox.mic2", dst2: "foh.mic2",
      src3: "stagebox.mic3", dst3: "foh.mic3",
      src4: "stagebox.mic4", dst4: "foh.mic4",
      src5: "stagebox.mic5", dst5: "foh.lineIn5",
      src6: "stagebox.mic6", dst6: "foh.lineIn6",
      src7: "stagebox.mic7", dst7: "foh.lineIn7",
      src8: "stagebox.mic8", dst8: "foh.lineIn8",
      src9: "stagebox.linkOut", dst9: "foh.lineOut1"
    },
    "foh-monitor": {
      src1: "foh.lineOut1", dst1: "monitor.input",
      src2: "foh.lineOut2", dst2: "monitor.auxIn",
      src3: "monitor.thru", dst3: "monitor.input"
    },
    "foh-amp": {
      src1: "foh.mainLeft", dst1: "amp.inputA",
      src2: "foh.mainRight", dst2: "amp.inputB",
      src3: "amp.outputA", dst3: "pa.left",
      src4: "amp.outputB", dst4: "pa.right",
      src5: "amp.link", dst5: "amp.inputB"
    },
    "iem": {
      src1: "foh.lineOut3", dst1: "iem.receiver1",
      src2: "foh.lineOut4", dst2: "iem.receiver2",
      src3: "iem.antennaA", dst3: "iem.receiver1",
      src4: "iem.antennaB", dst4: "iem.receiver2",
      src5: "iem.phones", dst5: "iem.receiver1"
    },
    "utility": {
      src1: "utility.powerIn", dst1: "utility.powerOut",
      src2: "utility.network", dst2: "foh.lineIn5",
      src3: "utility.powerOut", dst3: "amp.inputA",
      src4: "utility.powerOut", dst4: "amp.inputB"
    },
    "final": {
      src1: "stagebox.mic1", dst1: "foh.mic1",
      src2: "stagebox.mic2", dst2: "foh.mic2",
      src3: "foh.mainLeft", dst3: "amp.inputA",
      src4: "foh.mainRight", dst4: "amp.inputB",
      src5: "amp.outputA", dst5: "pa.left",
      src6: "amp.outputB", dst6: "pa.right",
      src7: "foh.lineOut3", dst7: "iem.receiver1",
      src8: "foh.lineOut4", dst8: "iem.receiver2"
    }
  });

  function normalizeLevelId(levelId) {
    return String(levelId || "").trim().toUpperCase();
  }

  function isLiveNormalLevelId(levelId) {
    const id = normalizeLevelId(levelId);
    return /^LIV-\d+$/i.test(id) && !LIVE_IR_LEVEL_RE.test(id);
  }

  function scenarioForLevelId(levelId) {
    const id = normalizeLevelId(levelId);
    if (!isLiveNormalLevelId(id)) return null;
    const n = Number((id.match(/^LIV-(\d+)$/i) || [])[1]);
    if (!Number.isFinite(n)) {
      if (/^LIV-113$/i.test(id)) return "stagebox-foh";
      if (/^LIV-21[3-7]$/i.test(id)) return "final";
      return "final";
    }
    if (n >= 1 && n <= 13) return "stagebox-foh";
    if (n >= 14 && n <= 23) return "foh-monitor";
    if (n >= 24 && n <= 35) return "foh-amp";
    if (n >= 36 && n <= 45) return "utility";
    if (n >= 46 && n <= 50) return "final";
    return "stagebox-foh";
  }

  function normalizeId(raw) {
    return String(raw || "")
      .trim()
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .toLowerCase()
      .replace(/^liv[:._\-\s]+/, "")
      .replace(/^live[:._\-\s]+/, "")
      .replace(/\bconsole\b/g, "foh")
      .replace(/\bsnake\b/g, "stagebox")
      .replace(/\bsnakehead\b/g, "stagebox")
      .replace(/\bstage-box\b/g, "stagebox")
      .replace(/\bfront-of-house\b/g, "foh")
      .replace(/\bfrontofhouse\b/g, "foh")
      .replace(/\bpower-amp\b/g, "amp")
      .replace(/\bpoweramp\b/g, "amp")
      .replace(/\bpower-amplifier\b/g, "amp")
      .replace(/\bwireless\b/g, "iem")
      .replace(/\baux-send\b/g, "line-out")
      .replace(/\bauxout\b/g, "line-out")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function isPanelJackId(raw) {
    return Object.prototype.hasOwnProperty.call(CANONICAL_PANEL_JACKS, String(raw || ""));
  }

  function getScenarioSlotMap(context) {
    const scenario = context && context.scenario ? context.scenario : scenarioForLevelId(context && context.levelId);
    return scenario ? SCENARIO_SLOT_MAP[scenario] || null : null;
  }

  function genericSlotFromId(raw) {
    const n = normalizeId(raw);
    const sourceMatch = n.match(/^(?:source|src|from|out|output|send|left|a)-?0?([1-9])$/);
    if (sourceMatch) return "src" + sourceMatch[1];

    const targetMatch = n.match(/^(?:target|dst|dest|destination|to|in|input|return|right|b)-?0?([1-9])$/);
    if (targetMatch) return "dst" + targetMatch[1];

    const sideMatch = n.match(/^(?:jack|node|port)-?([ab])?-?0?([1-9])$/);
    if (sideMatch && sideMatch[1]) {
      return sideMatch[1] === "a" ? "src" + sideMatch[2] : "dst" + sideMatch[2];
    }
    return null;
  }

  function matchNumberedId(n, prefixes, count, makeId) {
    for (const prefix of prefixes) {
      const rx = new RegExp("(^|-)" + prefix + "-?0?([1-" + count + "])($|-)");
      const m = n.match(rx);
      if (m) return makeId(Number(m[2]));
    }
    return null;
  }

  function patternPanelJackId(raw) {
    const n = normalizeId(raw);
    if (!n) return null;

    const direct = n.replace(/-/g, ".");
    if (isPanelJackId(direct)) return direct;

    const compact = n.replace(/-/g, "");
    const compactMap = {
      stageboxlinkout: "stagebox.linkOut",
      fohmainleft: "foh.mainLeft", fohmainl: "foh.mainLeft", fohleft: "foh.mainLeft", mainleft: "foh.mainLeft", mainl: "foh.mainLeft",
      fohmainright: "foh.mainRight", fohmainr: "foh.mainRight", fohright: "foh.mainRight", mainright: "foh.mainRight", mainr: "foh.mainRight",
      ampinputa: "amp.inputA", ampina: "amp.inputA", inputa: "amp.inputA",
      ampinputb: "amp.inputB", ampinb: "amp.inputB", inputb: "amp.inputB",
      ampoutputa: "amp.outputA", ampouta: "amp.outputA", cha: "amp.outputA", channela: "amp.outputA",
      ampoutputb: "amp.outputB", ampoutb: "amp.outputB", chb: "amp.outputB", channelb: "amp.outputB",
      monitorinput: "monitor.input", wedgeinput: "monitor.input",
      monitorthru: "monitor.thru", wedgethru: "monitor.thru", monitorauxin: "monitor.auxIn",
      utilitypowerin: "utility.powerIn", powerin: "utility.powerIn",
      utilitypowerout: "utility.powerOut", powerout: "utility.powerOut",
      utilitynetwork: "utility.network", network: "utility.network",
      iemantennaa: "iem.antennaA", antennaa: "iem.antennaA",
      iemantennab: "iem.antennaB", antennab: "iem.antennaB",
      iemphones: "iem.phones", phones: "iem.phones",
      paleft: "pa.left", speakerleft: "pa.left", speakerl: "pa.left",
      paright: "pa.right", speakerright: "pa.right", speakerr: "pa.right"
    };
    if (compactMap[compact]) return compactMap[compact];

    if (n.includes("stagebox")) {
      const matched = matchNumberedId(n, ["mic", "input", "in", "ch", "channel"], 8, i => "stagebox.mic" + i);
      if (matched) return matched;
      if (/(link|thru|through).*(out)?/.test(n)) return "stagebox.linkOut";
    }

    if (n.includes("foh")) {
      const mic = matchNumberedId(n, ["mic", "input", "in", "ch", "channel"], 4, i => "foh.mic" + i);
      if (mic) return mic;

      const lineIn = n.match(/(?:line|trs).*(?:in|input)-?0?([5-8])/) || n.match(/(?:in|input)-?0?([5-8])/);
      if (lineIn) return "foh.lineIn" + Number(lineIn[1]);

      const lineOut = n.match(/(?:line|aux|send).*(?:out|output)-?0?([1-4])/) || n.match(/(?:out|output)-?0?([1-4])/);
      if (lineOut) return "foh.lineOut" + Number(lineOut[1]);

      if (/(main|master).*(left|l)$/.test(n) || /(left|l).*(main|master)/.test(n)) return "foh.mainLeft";
      if (/(main|master).*(right|r)$/.test(n) || /(right|r).*(main|master)/.test(n)) return "foh.mainRight";
    }

    if (n.includes("line-out") || n.includes("aux") || n.includes("send")) {
      const m = n.match(/(?:line-out|aux|send)-?0?([1-4])/);
      if (m) return "foh.lineOut" + Number(m[1]);
    }

    if (n.includes("main")) {
      if (/(left|^l$|-l$)/.test(n)) return "foh.mainLeft";
      if (/(right|^r$|-r$)/.test(n)) return "foh.mainRight";
    }

    if (n.includes("amp") || n.includes("amplifier")) {
      if (/input-?a|in-?a/.test(n)) return "amp.inputA";
      if (/input-?b|in-?b/.test(n)) return "amp.inputB";
      if (/output-?a|out-?a|ch-?a|channel-?a/.test(n)) return "amp.outputA";
      if (/output-?b|out-?b|ch-?b|channel-?b/.test(n)) return "amp.outputB";
      if (/link|thru|through/.test(n)) return "amp.link";
    }

    if (n.includes("monitor") || n.includes("wedge")) {
      if (/aux/.test(n)) return "monitor.auxIn";
      if (/thru|through|link/.test(n)) return "monitor.thru";
      if (/input|in/.test(n)) return "monitor.input";
    }

    if (n.includes("utility") || n.includes("power") || n.includes("network")) {
      if (/power.*in|in.*power/.test(n)) return "utility.powerIn";
      if (/power.*out|out.*power/.test(n)) return "utility.powerOut";
      if (/network|rj45|ethernet/.test(n)) return "utility.network";
    }

    if (n.includes("iem") || n.includes("wireless") || n.includes("antenna") || n.includes("phones")) {
      if (/antenna.*a|a.*antenna/.test(n)) return "iem.antennaA";
      if (/antenna.*b|b.*antenna/.test(n)) return "iem.antennaB";
      if (/phones|headphone|hp/.test(n)) return "iem.phones";
      if (/receiver.*1|rx.*1/.test(n)) return "iem.receiver1";
      if (/receiver.*2|rx.*2/.test(n)) return "iem.receiver2";
    }

    if (n.includes("speaker") || n.includes("pa")) {
      if (/(left|^l$|-l$)/.test(n)) return "pa.left";
      if (/(right|^r$|-r$)/.test(n)) return "pa.right";
    }

    return null;
  }

  function toPanelJackId(raw, context) {
    if (raw == null) return raw;
    const original = String(raw);
    if (isPanelJackId(original)) return original;

    const slot = genericSlotFromId(original);
    if (slot) {
      const slotMap = getScenarioSlotMap(context || {});
      if (slotMap && slotMap[slot]) return slotMap[slot];
    }

    const matched = patternPanelJackId(original);
    return matched || original;
  }

  function fromPanelJackId(panelJackId, fallback) {
    const id = String(panelJackId || "");
    const reverse = {
      "stagebox.mic1": "source-1", "foh.mic1": "target-1",
      "stagebox.mic2": "source-2", "foh.mic2": "target-2",
      "stagebox.mic3": "source-3", "foh.mic3": "target-3",
      "stagebox.mic4": "source-4", "foh.mic4": "target-4",
      "foh.mainLeft": "source-1", "amp.inputA": "target-1",
      "foh.mainRight": "source-2", "amp.inputB": "target-2",
      "amp.outputA": "source-3", "pa.left": "target-3",
      "amp.outputB": "source-4", "pa.right": "target-4",
      "foh.lineOut1": "source-1", "monitor.input": "target-1",
      "foh.lineOut3": "source-1", "iem.receiver1": "target-1",
      "foh.lineOut4": "source-2", "iem.receiver2": "target-2"
    };
    return reverse[id] || fallback || id;
  }

  function adaptEndpoint(endpoint, context, options) {
    const opts = options || {};
    if (typeof endpoint === "string") return toPanelJackId(endpoint, context);
    if (!endpoint || typeof endpoint !== "object") return endpoint;

    const clone = Array.isArray(endpoint) ? endpoint.slice() : Object.assign({}, endpoint);
    const idKey =
      clone.jackId != null ? "jackId" :
      clone.id != null ? "id" :
      clone.nodeId != null ? "nodeId" :
      clone.portId != null ? "portId" :
      null;

    if (idKey) {
      const oldId = clone[idKey];
      const panelJackId = toPanelJackId(oldId, context);
      clone.legacyId = clone.legacyId || oldId;
      clone.panelJackId = panelJackId;
      if (opts.rewriteIds) clone[idKey] = panelJackId;
    }
    return clone;
  }

  function adaptRoute(route, context, options) {
    if (Array.isArray(route)) {
      const next = route.slice();
      next[0] = adaptEndpoint(next[0], context, options);
      next[1] = adaptEndpoint(next[1], context, options);
      return next;
    }

    if (!route || typeof route !== "object") return route;
    const clone = Object.assign({}, route);
    if (clone.from != null) clone.from = adaptEndpoint(clone.from, context, options);
    if (clone.to != null) clone.to = adaptEndpoint(clone.to, context, options);
    if (clone.a != null) clone.a = adaptEndpoint(clone.a, context, options);
    if (clone.b != null) clone.b = adaptEndpoint(clone.b, context, options);
    if (clone.source != null) clone.source = adaptEndpoint(clone.source, context, options);
    if (clone.target != null) clone.target = adaptEndpoint(clone.target, context, options);
    return clone;
  }

  function adaptJack(jack, context, options) {
    if (typeof jack === "string") {
      const panelJackId = toPanelJackId(jack, context);
      return { id: panelJackId, legacyId: jack, panelJackId: panelJackId };
    }
    if (!jack || typeof jack !== "object") return jack;

    const opts = options || {};
    const clone = Object.assign({}, jack);
    const oldId = clone.id || clone.jackId || clone.nodeId || clone.portId;
    if (!oldId) return clone;

    const panelJackId = toPanelJackId(oldId, context);
    clone.legacyId = clone.legacyId || oldId;
    clone.panelJackId = panelJackId;
    clone.livePanelJackId = panelJackId;

    const meta = CANONICAL_PANEL_JACKS[panelJackId];
    if (meta) {
      clone.panel = clone.panel || meta.panel;
      clone.jack = clone.jack || meta.jack;
      clone.type = clone.type || meta.type;
      clone.label = clone.label || meta.label;
      if (meta.stereoPair) clone.stereoPair = clone.stereoPair || meta.stereoPair;
    }

    if (opts.rewriteIds) {
      if (clone.id != null) clone.id = panelJackId;
      if (clone.jackId != null) clone.jackId = panelJackId;
      if (clone.nodeId != null) clone.nodeId = panelJackId;
      if (clone.portId != null) clone.portId = panelJackId;
    }

    return clone;
  }

  function adaptArrayProperty(level, prop, context, options, adapter) {
    if (!Array.isArray(level[prop])) return;
    level[prop] = level[prop].map(item => adapter(item, context, options));
  }

  function adaptLiveSoundLevel(level, options) {
    if (!level || typeof level !== "object") return level;

    const opts = Object.assign({ rewriteIds: false, addPanelPlan: true, onlyLive: true }, options || {});
    const id = normalizeLevelId(level.id || level.levelId || level.name);
    if (opts.onlyLive && !isLiveNormalLevelId(id)) return level;

    const scenario = opts.scenario || scenarioForLevelId(id) || "stagebox-foh";
    const context = Object.assign({}, opts.context || {}, { levelId: id, scenario });

    const clone = Object.assign({}, level);
    clone.visualSkin = clone.visualSkin || "live-sound-rack";
    clone.environment = clone.environment || "liveSound";

    if (opts.addPanelPlan) {
      clone.panels = Array.isArray(clone.panels) && clone.panels.length
        ? clone.panels
        : (DEFAULT_PANEL_PLANS[scenario] || DEFAULT_PANEL_PLANS["stagebox-foh"]).map(p => Object.assign({}, p));
    }

    clone.liveSoundAdapter = Object.assign({}, clone.liveSoundAdapter || {}, {
      version: VERSION,
      scenario,
      slotMap: Object.assign({}, SCENARIO_SLOT_MAP[scenario] || {})
    });

    ["jacks","nodes","ports","inputs","outputs","sources","destinations"]
      .forEach(prop => adaptArrayProperty(clone, prop, context, opts, adaptJack));

    ["routes","requiredRoutes","solution","solutions","validRoutes","connections","expectedConnections","targets"]
      .forEach(prop => adaptArrayProperty(clone, prop, context, opts, adaptRoute));

    return clone;
  }

  function makeHitboxDataset(legacyId, context) {
    const panelJackId = toPanelJackId(legacyId, context);
    const meta = CANONICAL_PANEL_JACKS[panelJackId] || {};
    return {
      jackId: panelJackId,
      panelJackId: panelJackId,
      legacyJackId: String(legacyId || panelJackId),
      jackType: meta.type || "",
      panelId: meta.panel || "",
      jackKey: meta.jack || "",
      label: meta.label || String(legacyId || panelJackId)
    };
  }

  function routeParts(route) {
    if (Array.isArray(route)) return [route[0], route[1]];
    if (!route || typeof route !== "object") return [undefined, undefined];
    if ("from" in route || "to" in route) return [route.from, route.to];
    if ("a" in route || "b" in route) return [route.a, route.b];
    if ("source" in route || "target" in route) return [route.source, route.target];
    return [undefined, undefined];
  }

  function sameJack(a, b, context) {
    return toPanelJackId(a, context) === toPanelJackId(b, context);
  }

  function sameRoute(a, b, context) {
    const [a1, a2] = routeParts(a);
    const [b1, b2] = routeParts(b);
    const A1 = toPanelJackId(a1, context);
    const A2 = toPanelJackId(a2, context);
    const B1 = toPanelJackId(b1, context);
    const B2 = toPanelJackId(b2, context);
    return (A1 === B1 && A2 === B2) || (A1 === B2 && A2 === B1);
  }

  function stereoPairFor(panelJackId) {
    const meta = CANONICAL_PANEL_JACKS[toPanelJackId(panelJackId)];
    return meta && meta.stereoPair ? meta.stereoPair : null;
  }

  function routeContainsJack(routes, jackId, context) {
    const target = toPanelJackId(jackId, context);
    return (routes || []).some(route => {
      const [a, b] = routeParts(route);
      return toPanelJackId(a, context) === target || toPanelJackId(b, context) === target;
    });
  }

  function missingStereoPairs(routes, context) {
    const missing = [];
    (routes || []).forEach(route => {
      const [a, b] = routeParts(route);
      [a, b].forEach(endpoint => {
        const id = toPanelJackId(endpoint, context);
        const pair = stereoPairFor(id);
        if (pair && !routeContainsJack(routes, pair, context)) {
          missing.push({ jack: id, missingPair: pair });
        }
      });
    });
    return missing;
  }

  function getPanelJackGeometry(panelJackId, panelConfig) {
    const id = toPanelJackId(panelJackId);
    const meta = CANONICAL_PANEL_JACKS[id];
    const geom = LIVE_PANEL_GEOMETRY[id];
    if (!meta || !geom) return null;

    const panel = panelConfig || { x: 0, y: 0, width: (PANEL_VIEWBOX[meta.panel] || [0,0,1,1])[2] };
    const viewBox = PANEL_VIEWBOX[meta.panel] || [0, 0, 1, 1];
    const scale = Number(panel.width || viewBox[2]) / viewBox[2];

    return {
      x: Number(panel.x || 0) + geom.x * scale,
      y: Number(panel.y || 0) + geom.y * scale,
      localX: geom.x,
      localY: geom.y,
      scale,
      panel: meta.panel,
      jack: meta.jack
    };
  }

  function findPanelConfigForJack(level, panelJackId) {
    const id = toPanelJackId(panelJackId);
    const meta = CANONICAL_PANEL_JACKS[id];
    if (!meta || !Array.isArray(level && level.panels)) return null;
    return level.panels.find(panel => panel.id === meta.panel || panel.kind === meta.panel) || null;
  }

  function endpointPanelPoint(level, endpoint, context) {
    const panelJackId = toPanelJackId(endpoint, context);
    return getPanelJackGeometry(panelJackId, findPanelConfigForJack(level, panelJackId));
  }

  function reportUnmappedEndpoints(level, context) {
    const unmapped = [];
    const scanEndpoint = endpoint => {
      if (endpoint == null) return;
      if (typeof endpoint === "object") {
        const id = endpoint.panelJackId || endpoint.jackId || endpoint.id || endpoint.nodeId || endpoint.portId;
        if (id != null) scanEndpoint(id);
        return;
      }
      const before = String(endpoint);
      const after = toPanelJackId(before, context);
      if (before === after && !isPanelJackId(after)) unmapped.push(before);
    };

    ["jacks","nodes","ports","inputs","outputs","sources","destinations"].forEach(prop => {
      if (Array.isArray(level && level[prop])) level[prop].forEach(scanEndpoint);
    });
    ["routes","requiredRoutes","solution","solutions","validRoutes","connections","expectedConnections","targets"].forEach(prop => {
      if (!Array.isArray(level && level[prop])) return;
      level[prop].forEach(route => {
        const [a, b] = routeParts(route);
        scanEndpoint(a);
        scanEndpoint(b);
      });
    });
    return Array.from(new Set(unmapped));
  }

  return {
    VERSION,
    LIVE_NORMAL_LEVEL_IDS,
    CANONICAL_PANEL_JACKS,
    LIVE_PANEL_GEOMETRY,
    PANEL_VIEWBOX,
    DEFAULT_PANEL_PLANS,
    SCENARIO_SLOT_MAP,
    normalizeId,
    normalizeLevelId,
    isLiveNormalLevelId,
    scenarioForLevelId,
    toPanelJackId,
    fromPanelJackId,
    adaptEndpoint,
    adaptRoute,
    adaptJack,
    adaptLiveSoundLevel,
    makeHitboxDataset,
    sameJack,
    sameRoute,
    stereoPairFor,
    missingStereoPairs,
    getPanelJackGeometry,
    endpointPanelPoint,
    reportUnmappedEndpoints
  };
});
