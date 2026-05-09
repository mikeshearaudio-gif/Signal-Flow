/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let nativeVisible = true;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

  const LEVEL = {
    id: LEVEL_ID,
    title: "Sub Matrix Feed",
    validRoutes: [
      {
        key: "matrix-2-to-sub",
        from: "matrix-2-output",
        to: "sub-processor-input",
        checklist: "Matrix 2 Output → Sub Processor Input"
      },
      {
        key: "main-left-to-system-left",
        from: "main-left-output",
        to: "system-processor-left-in",
        checklist: "Main Left Output → System Processor Left In"
      },
      {
        key: "main-right-to-system-right",
        from: "main-right-output",
        to: "system-processor-right-in",
        checklist: "Main Right Output → System Processor Right In"
      },
      {
        key: "lead-vocal-to-stagebox-1",
        from: "lead-vocal-mic",
        to: "stagebox-input-1",
        checklist: "Lead Vocal Microphone → Stage Box Input 1"
      },
      {
        key: "keys-left-to-stagebox-7",
        from: "keys-left-di",
        to: "stagebox-input-7",
        checklist: "Keys Left DI → Stage Box Input 7"
      },
      {
        key: "keys-right-to-stagebox-8",
        from: "keys-right-di",
        to: "stagebox-input-8",
        checklist: "Keys Right DI → Stage Box Input 8"
      }
    ]
  };

  const NODE_DEFS = {
    "lead-vocal-mic": { label: "Lead Vocal Microphone", kind: "source" },
    "keys-left-di": { label: "Keys Left DI", kind: "source" },
    "keys-right-di": { label: "Keys Right DI", kind: "source" },

    "stagebox-input-1": { label: "Stage Box Input 1", kind: "jack", panelJack: "stagebox.mic1" },
    "stagebox-input-2": { label: "Stage Box Input 2", kind: "jack", panelJack: "stagebox.mic2", ghost: true },
    "stagebox-input-3": { label: "Stage Box Input 3", kind: "jack", panelJack: "stagebox.mic3", ghost: true },
    "stagebox-input-4": { label: "Stage Box Input 4", kind: "jack", panelJack: "stagebox.mic4", ghost: true },
    "stagebox-input-5": { label: "Stage Box Input 5", kind: "jack", panelJack: "stagebox.mic5", ghost: true },
    "stagebox-input-6": { label: "Stage Box Input 6", kind: "jack", panelJack: "stagebox.mic6", ghost: true },
    "stagebox-input-7": { label: "Stage Box Input 7", kind: "jack", panelJack: "stagebox.mic7" },
    "stagebox-input-8": { label: "Stage Box Input 8", kind: "jack", panelJack: "stagebox.mic8" },
    "stagebox-link-out": { label: "Stagebox Link Out", kind: "jack", panelJack: "stagebox.linkOut", ghost: true },

    "foh-main-left": { label: "FOH Main Left", kind: "jack", panelJack: "foh.mainLeft", ghost: true },
    "foh-main-right": { label: "FOH Main Right", kind: "jack", panelJack: "foh.mainRight", ghost: true },
    "main-left-output": { label: "Main Left Output", kind: "jack", panelJack: "foh.mainLeft" },
    "main-right-output": { label: "Main Right Output", kind: "jack", panelJack: "foh.mainRight" },
    "matrix-2-output": { label: "Matrix 2 Output", kind: "jack", panelJack: "foh.lineOut2" },

    "foh-mic-1": { label: "FOH Mic 1", kind: "jack", panelJack: "foh.mic1", ghost: true },
    "foh-mic-2": { label: "FOH Mic 2", kind: "jack", panelJack: "foh.mic2", ghost: true },
    "foh-mic-3": { label: "FOH Mic 3", kind: "jack", panelJack: "foh.mic3", ghost: true },
    "foh-mic-4": { label: "FOH Mic 4", kind: "jack", panelJack: "foh.mic4", ghost: true },
    "foh-line-in-5": { label: "FOH Line In 5", kind: "jack", panelJack: "foh.lineIn5", ghost: true },
    "foh-line-in-6": { label: "FOH Line In 6", kind: "jack", panelJack: "foh.lineIn6", ghost: true },
    "foh-line-in-7": { label: "FOH Line In 7", kind: "jack", panelJack: "foh.lineIn7", ghost: true },
    "foh-line-in-8": { label: "FOH Line In 8", kind: "jack", panelJack: "foh.lineIn8", ghost: true },
    "foh-line-out-1": { label: "FOH Line Out 1", kind: "jack", panelJack: "foh.lineOut1", ghost: true },
    "foh-line-out-3": { label: "FOH Line Out 3", kind: "jack", panelJack: "foh.lineOut3", ghost: true },
    "foh-line-out-4": { label: "FOH Line Out 4", kind: "jack", panelJack: "foh.lineOut4", ghost: true },

    "system-processor-left-in": { label: "System Processor Left In", kind: "jack", panelJack: "amp.inputA" },
    "system-processor-right-in": { label: "System Processor Right In", kind: "jack", panelJack: "amp.inputB" },
    "sub-processor-input": { label: "Sub Processor Input", kind: "jack", panelJack: "amp.link" },
    "processor-output-a": { label: "Processor Output A", kind: "jack", panelJack: "amp.outputA", ghost: true },
    "processor-output-b": { label: "Processor Output B", kind: "jack", panelJack: "amp.outputB", ghost: true }
  };

  function textOf(el) {
    return (el && el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function normalize(text) {
    return String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function getLevelId() {
    const fromHash = String(location.hash || "").match(/\/level\/([^/?#]+)/);
    if (fromHash) return decodeURIComponent(fromHash[1]).toUpperCase();

    const selected = Array.from(document.querySelectorAll("select"))
      .map(el => String(el.value || "").trim().toUpperCase())
      .find(value => /^LIV-\d+$/i.test(value));

    return selected || "";
  }

  function hardwareAssetFor(kind) {
    return {
      stagebox: "/assets/live-sound/svg/hardware/stagebox-snake-head.svg",
      foh: "/assets/live-sound/svg/hardware/foh-console-io-panel.svg",
      amp: "/assets/live-sound/svg/hardware/power-amplifier.svg"
    }[kind];
  }

  function areaOf(el) {
    const r = el.getBoundingClientRect();
    return Math.max(0, r.width * r.height);
  }

  function findSurface() {
    const all = Array.from(document.querySelectorAll("div, section, article, main"));

    const titleEl = all
      .filter(el => textOf(el).includes("Live Console + Rack World"))
      .sort((a, b) => textOf(a).length - textOf(b).length)[0];

    if (!titleEl) return null;

    // The surface must be the visual board body below the brown header, not the
    // whole game shell and not the left checklist/sidebar. Pick the largest
    // nearby descendant that lives inside the board card, has enough space, and
    // does not include the level brief / checklist text.
    let card = titleEl;

    for (let i = 0; i < 10 && card && card.parentElement; i++) {
      const r = card.getBoundingClientRect();
      if (r.width > 850 && r.height > 430) break;
      card = card.parentElement;
    }

    if (!card) return null;

    const cardRect = card.getBoundingClientRect();

    const candidates = Array.from(card.querySelectorAll("div, section, article, main"))
      .filter(el => {
        const r = el.getBoundingClientRect();
        const t = textOf(el);

        return (
          r.width > 650 &&
          r.height > 360 &&
          r.left >= cardRect.left - 4 &&
          r.right <= cardRect.right + 4 &&
          !t.includes("PATCH THESE EXTERNAL CONNECTIONS") &&
          !t.includes("CURRENT LEVEL") &&
          !t.includes("REALITY CHECK") &&
          !t.includes("EDUCATIONAL TOOLS")
        );
      })
      .sort((a, b) => areaOf(b) - areaOf(a));

    // Prefer the old visual playfield if it contains the original helper text.
    const playfield = candidates.find(el =>
      textOf(el).includes("Build the path through the console") ||
      textOf(el).includes("STAGEBOX AUX MATRIX PA") ||
      textOf(el).includes("CONSOLE + AMP RACK")
    );

    const surface = playfield || candidates[0] || card;

    console.log("[Signal Flow] Native surface selected:", {
      text: textOf(surface).slice(0, 90),
      rect: surface.getBoundingClientRect()
    });

    return surface;
  }

  function routeFor(a, b) {
    return LEVEL.validRoutes.find(route =>
      (route.from === a && route.to === b) ||
      (route.from === b && route.to === a)
    ) || null;
  }

  function routeAlreadyExists(routeKey) {
    return state.routes.some(route => route.key === routeKey);
  }

  function nodeLabel(key) {
    return NODE_DEFS[key] ? NODE_DEFS[key].label : key;
  }

  function pointFromPanel(adapter, level, panelJackId) {
    return adapter.endpointPanelPoint(level, panelJackId, {
      levelId: LEVEL_ID,
      scenario: "native-liv025"
    });
  }

  function buildLevelGeometry(surface) {
    const rect = surface.getBoundingClientRect();

    return {
      id: LEVEL_ID,
      rect,
      panels: [
        { id: "stagebox", kind: "stagebox", x: rect.width * 0.06, y: rect.height * 0.34, width: rect.width * 0.39 },
        { id: "foh", kind: "foh", x: rect.width * 0.39, y: rect.height * 0.15, width: rect.width * 0.55 },
        { id: "amp", kind: "amp", x: rect.width * 0.46, y: rect.height * 0.62, width: rect.width * 0.42 }
      ]
    };
  }

  function getNodePoint(adapter, level, key) {
    const def = NODE_DEFS[key];
    if (!def) return null;

    if (def.kind === "source") {
      const sourcePositions = {
        "lead-vocal-mic": { x: level.rect.width * 0.06 + 85, y: level.rect.height * 0.12 + 19 },
        "keys-left-di": { x: level.rect.width * 0.06 + 85, y: level.rect.height * 0.18 + 19 },
        "keys-right-di": { x: level.rect.width * 0.06 + 85, y: level.rect.height * 0.24 + 19 }
      };
      return sourcePositions[key] || null;
    }

    if (def.panelJack) return pointFromPanel(adapter, level, def.panelJack);

    return null;
  }

  function hideLegacyBoard(surface) {
    // Do NOT hide the whole board card. The header contains Inspect, Back Panel,
    // Undo, and Clear. Hiding the entire child tree made those controls vanish.
    // Only fade the old visual modules that are being replaced by the native layer.
    const labels = [
      "Sources",
      "Stage Box / Stage Box Inputs",
      "Front-of-House Console",
      "Monitor and System Rack",
      "System Processor"
    ];

    Array.from(surface.querySelectorAll("div, section, article")).forEach(el => {
      const text = textOf(el);
      if (labels.some(label => text.includes(label))) {
        el.style.opacity = "0.035";
        el.style.filter = "blur(1px)";
        el.style.pointerEvents = "none";
      }
    });
  }

  function restoreLegacyBoard(surface) {
    Array.from(surface.querySelectorAll("div, section, article")).forEach(el => {
      el.style.opacity = "";
      el.style.filter = "";
      el.style.pointerEvents = "";
    });
  }

  function createLabel(layer, text, x, y, size) {
    const el = document.createElement("div");
    el.textContent = text;
    el.style.cssText = [
      "position:absolute",
      "left:" + x + "px",
      "top:" + y + "px",
      "font:900 " + (size || 12) + "px system-ui,-apple-system,Segoe UI,sans-serif",
      "letter-spacing:.08em",
      "color:#ffd76a",
      "text-shadow:0 2px 8px #000",
      "z-index:20",
      "pointer-events:none"
    ].join(";");
    layer.appendChild(el);
  }

  function cableD(from, to, bend) {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const lift = Math.max(55, Math.min(150, (dx + dy) * 0.16)) + (bend || 0);
    const midY = Math.min(from.y, to.y) - lift;

    return (
      "M " + from.x + " " + from.y +
      " C " + from.x + " " + midY + ", " + to.x + " " + midY + ", " + to.x + " " + to.y
    );
  }

  function cubicPoint(p0, p1, p2, p3, t) {
    const mt = 1 - t;
    return {
      x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
      y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y
    };
  }

  function distanceToCable(point, from, to, bend) {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const lift = Math.max(55, Math.min(150, (dx + dy) * 0.16)) + (bend || 0);
    const midY = Math.min(from.y, to.y) - lift;

    const p0 = from;
    const p1 = { x: from.x, y: midY };
    const p2 = { x: to.x, y: midY };
    const p3 = to;

    let best = Infinity;
    for (let i = 0; i <= 48; i++) {
      const p = cubicPoint(p0, p1, p2, p3, i / 48);
      const d = Math.hypot(p.x - point.x, p.y - point.y);
      if (d < best) best = d;
    }
    return best;
  }

  function getCableSvg(layer) {
    let svg = layer.querySelector(".sf-native-cables");
    if (svg) return svg;

    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("sf-native-cables");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.cssText = [
      "position:absolute",
      "inset:0",
      "z-index:180",
      "pointer-events:none",
      "overflow:visible"
    ].join(";");
    layer.appendChild(svg);
    return svg;
  }

  function cablePointAtMid(from, to, bend) {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const lift = Math.max(55, Math.min(150, (dx + dy) * 0.16)) + (bend || 0);
    const midY = Math.min(from.y, to.y) - lift;

    return cubicPoint(
      from,
      { x: from.x, y: midY },
      { x: to.x, y: midY },
      to,
      0.5
    );
  }

  function createCableDragHandle(layer, route) {
    const point = cablePointAtMid(route.fromPoint, route.toPoint, route.bend || 0);

    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = "sf-cable-drag-handle";
    handle.setAttribute("aria-label", "Drag cable");
    handle.dataset.routeKey = route.key;

    handle.style.cssText = [
      "position:absolute",
      "left:" + point.x + "px",
      "top:" + point.y + "px",
      "width:34px",
      "height:34px",
      "transform:translate(-50%,-50%)",
      "border-radius:50%",
      "border:0",
      "background:rgba(255,255,255,0.001)",
      "cursor:grab",
      "pointer-events:auto",
      "z-index:220"
    ].join(";");

    handle.addEventListener("mouseenter", () => {
      handle.style.boxShadow = "0 0 0 2px rgba(255,255,255,.35)";
    });

    handle.addEventListener("mouseleave", () => {
      handle.style.boxShadow = "";
    });

    layer.appendChild(handle);
  }

  function drawCable(layer, route) {
    const svg = getCableSvg(layer);
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.dataset.routeKey = route.key;
    group.dataset.from = JSON.stringify(route.fromPoint);
    group.dataset.to = JSON.stringify(route.toPoint);
    group.dataset.bend = String(route.bend || 0);

    const color = route.valid ? "#55e36f" : "#ff4f4f";
    const glow = route.valid ? "rgba(85,227,111,.56)" : "rgba(255,79,79,.58)";

    const shadow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    shadow.classList.add("sf-cable-shadow");
    shadow.setAttribute("fill", "none");
    shadow.setAttribute("stroke", "rgba(0,0,0,.62)");
    shadow.setAttribute("stroke-width", "10");
    shadow.setAttribute("stroke-linecap", "round");
    shadow.setAttribute("d", cableD(route.fromPoint, route.toPoint, route.bend || 0));
    group.appendChild(shadow);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.classList.add("sf-cable-line");
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", "5");
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("opacity", "0.96");
    line.setAttribute("d", cableD(route.fromPoint, route.toPoint, route.bend || 0));
    line.style.filter = "drop-shadow(0 0 10px " + glow + ")";
    group.appendChild(line);

    [route.fromPoint, route.toPoint].forEach(point => {
      const dotShadow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dotShadow.setAttribute("cx", point.x);
      dotShadow.setAttribute("cy", point.y);
      dotShadow.setAttribute("r", "7");
      dotShadow.setAttribute("fill", "rgba(0,0,0,.62)");
      group.appendChild(dotShadow);

      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", point.x);
      dot.setAttribute("cy", point.y);
      dot.setAttribute("r", "5");
      dot.setAttribute("fill", color);
      group.appendChild(dot);
    });

    svg.appendChild(group);
    createCableDragHandle(layer, route);
  }

  function redrawCables(layer) {
    const old = layer.querySelector(".sf-native-cables");
    if (old) old.remove();

    layer.querySelectorAll(".sf-cable-drag-handle").forEach(handle => handle.remove());

    state.routes.forEach(route => drawCable(layer, route));

    const svg = layer.querySelector(".sf-native-cables");
    if (svg && svg.parentNode) {
      svg.parentNode.appendChild(svg);
    }

    // Handles must stay above the cable SVG.
    layer.querySelectorAll(".sf-cable-drag-handle").forEach(handle => layer.appendChild(handle));

    console.log("[Signal Flow] Native cables redrawn:", state.routes.length);
  }

  function updateCableGroup(group, from, to, bend) {
    group.dataset.bend = String(bend);
    const d = cableD(from, to, bend);
    group.querySelectorAll("path").forEach(path => path.setAttribute("d", d));
  }

  function installCableDrag(layer) {
    if (layer.dataset.dragInstalled === "1") return;
    layer.dataset.dragInstalled = "1";

    let drag = null;

    layer.addEventListener("pointerdown", event => {
      const handle = event.target && event.target.closest && event.target.closest(".sf-cable-drag-handle");
      if (!handle) return;

      const routeKey = handle.dataset.routeKey;
      const route = state.routes.find(item => item.key === routeKey);
      if (!route) return;

      drag = {
        route,
        startY: event.clientY,
        startBend: route.bend || 0
      };

      handle.style.cursor = "grabbing";
      layer.style.cursor = "grabbing";
      event.preventDefault();
      event.stopPropagation();
    }, true);

    window.addEventListener("pointermove", event => {
      if (!drag) return;

      drag.route.bend = Math.max(-120, Math.min(170, drag.startBend + (drag.startY - event.clientY)));
      redrawCables(layer);

      event.preventDefault();
      event.stopPropagation();
    }, true);

    function endDrag() {
      if (drag) layer.style.cursor = "";
      drag = null;
    }

    window.addEventListener("pointerup", endDrag, true);
    window.addEventListener("pointercancel", endDrag, true);
  }

  function playBadConnect() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(72, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.17);
      setTimeout(() => ctx.close && ctx.close(), 240);
    } catch (err) {}
  }

  function checklistDocuments() {
    const docs = [];

    function addDoc(doc) {
      if (doc && docs.indexOf(doc) === -1) docs.push(doc);
    }

    addDoc(document);

    // When running through the v1.41.18 wrapper, the game lives inside an
    // iframe. Search both this document and the parent document's same-origin
    // frames so checklist marking works whether the renderer is executing from
    // the game frame or a wrapper-injected context.
    try {
      if (window.parent && window.parent !== window && window.parent.document) {
        addDoc(window.parent.document);
        Array.from(window.parent.document.querySelectorAll("iframe")).forEach(frame => {
          try { addDoc(frame.contentDocument); } catch (err) {}
        });
      }
    } catch (err) {}

    Array.from(document.querySelectorAll("iframe")).forEach(frame => {
      try { addDoc(frame.contentDocument); } catch (err) {}
    });

    return docs;
  }

  function findChecklistTarget(routeKey) {
    const routeIndex = LEVEL.validRoutes.findIndex(r => r.key === routeKey);
    const route = LEVEL.validRoutes[routeIndex];
    if (!route) return null;

    const parts = route.checklist
      .toLowerCase()
      .split("→")
      .map(part => normalize(part))
      .filter(Boolean);

    let allRows = [];

    checklistDocuments().forEach(doc => {
      const rows = Array.from(doc.querySelectorAll(".path-card"))
        .filter(row => row && row.isConnected && row.querySelector(".todo-badge"));

      allRows = allRows.concat(rows);
    });

    // De-dupe rows in case parent-frame scanning sees the same document twice.
    allRows = allRows.filter((row, index) => allRows.indexOf(row) === index);

    const exact = allRows.find(row => {
      const text = normalize(textOf(row));
      return parts.every(part => text.includes(part));
    });

    const row = exact || allRows[routeIndex];
    if (!row) {
      console.warn("[Signal Flow] Native checklist rows available:", allRows.map(row => textOf(row)));
      return null;
    }

    const badge = row.querySelector(".todo-badge");
    if (!badge) {
      console.warn("[Signal Flow] Native checklist row missing badge:", textOf(row));
      return null;
    }

    console.log("[Signal Flow] Native checklist target matched:", routeKey, textOf(row));
    return { row, badge };
  }

  function markChecklist(routeKey) {
    const target = findChecklistTarget(routeKey);
    if (!target) {
      console.warn("[Signal Flow] Native checklist target not found:", routeKey);
      return;
    }

    const row = target.row;
    const badge = target.badge;

    row.dataset.sfLiveChecklistState = "complete";
    row.style.borderColor = "#55e36f";
    row.style.boxShadow = "0 0 0 1px rgba(85,227,111,.85), 0 0 18px rgba(85,227,111,.25)";
    row.style.background = "rgba(31,92,45,.58)";

    badge.textContent = "COMPLETE";
  }

  function unmarkChecklist(routeKey) {
    const target = findChecklistTarget(routeKey);
    if (!target) {
      console.warn("[Signal Flow] Native checklist target not found for unmark:", routeKey);
      return;
    }

    const row = target.row;
    const badge = target.badge;

    row.dataset.sfLiveChecklistState = "";
    row.style.borderColor = "";
    row.style.boxShadow = "";
    row.style.background = "";

    badge.textContent = "TO DO";
  }

  function setSelected(node, selected) {
    node.el.style.boxShadow = selected
      ? "0 0 0 3px rgba(111,208,255,.95), 0 0 20px rgba(111,208,255,.55)"
      : node.defaultShadow;
  }

  function clearSelection() {
    if (selectedNode) setSelected(selectedNode, false);
    selectedNode = null;
  }

  function flashNode(node) {
    node.el.style.boxShadow = "0 0 0 3px rgba(255,80,80,.95), 0 0 20px rgba(255,80,80,.55)";
    setTimeout(() => {
      if (!selectedNode || selectedNode.el !== node.el) node.el.style.boxShadow = node.defaultShadow;
    }, 260);
  }

  function addRoute(layer, fromNode, toNode) {
    const valid = routeFor(fromNode.key, toNode.key);
    const key = valid
      ? valid.key
      : "invalid:" + [fromNode.key, toNode.key].sort().join("--");

    if (state.routes.some(route => route.key === key)) return;

    const route = {
      key,
      valid: !!valid,
      from: fromNode.key,
      to: toNode.key,
      fromPoint: fromNode.point,
      toPoint: toNode.point,
      bend: 0
    };

    state.routes.push(route);
    console.log("[Signal Flow] Native route added:", route.key, "valid?", route.valid);

    if (valid) {
      state.completedValidKeys.add(valid.key);
      markChecklist(valid.key);
    } else {
      playBadConnect();
      flashNode(fromNode);
      flashNode(toNode);
    }

    redrawCables(layer);
  }

  function handleNodeClick(layer, node) {
    console.log("[Signal Flow] Native node select/connect:", node.key, "selected was", selectedNode && selectedNode.key);

    if (!selectedNode) {
      selectedNode = node;
      setSelected(node, true);
      return;
    }

    if (selectedNode.key === node.key) {
      clearSelection();
      return;
    }

    addRoute(layer, selectedNode, node);
    clearSelection();
  }

  function createSourceNode(layer, key, label, x, y) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.className = "sf-native-node sf-native-source";
    btn.setAttribute("aria-label", label);

    const defaultShadow = "0 8px 18px rgba(0,0,0,.35)";
    btn.style.cssText = [
      "position:absolute",
      "left:" + x + "px",
      "top:" + y + "px",
      "width:170px",
      "height:38px",
      "border-radius:14px",
      "border:1px solid rgba(255,210,95,.35)",
      "background:linear-gradient(180deg,rgba(34,66,105,.96),rgba(13,28,48,.96))",
      "color:#fff",
      "font:900 11px system-ui,-apple-system,Segoe UI,sans-serif",
      "letter-spacing:.04em",
      "cursor:pointer",
      "pointer-events:auto",
      "z-index:80",
      "box-shadow:" + defaultShadow
    ].join(";");

    btn.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();

      const rect = btn.getBoundingClientRect();
      const parent = layer.getBoundingClientRect();
      const node = {
        key,
        el: btn,
        defaultShadow,
        point: {
          x: rect.left - parent.left + rect.width / 2,
          y: rect.top - parent.top + rect.height / 2
        }
      };

      console.log("[Signal Flow] Native source clicked:", key);
      handleNodeClick(layer, node);
    });

    layer.appendChild(btn);
  }

  function createJackNode(layer, key, point, label, ghost) {
    if (!point) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sf-native-node sf-native-jack";
    btn.setAttribute("aria-label", label);

    const defaultShadow = "none";
    btn.style.cssText = [
      "position:absolute",
      "left:" + point.x + "px",
      "top:" + point.y + "px",
      "width:" + (ghost ? 34 : 42) + "px",
      "height:" + (ghost ? 34 : 42) + "px",
      "transform:translate(-50%,-50%)",
      "border-radius:50%",
      "border:0",
      "background:rgba(255,255,255,0)",
      "box-shadow:" + defaultShadow,
      "cursor:pointer",
      "pointer-events:auto",
      "z-index:80"
    ].join(";");

    btn.addEventListener("mouseenter", () => {
      btn.style.boxShadow = ghost
        ? "0 0 0 2px rgba(255,210,95,.45)"
        : "0 0 0 3px rgba(255,210,95,.9), 0 0 18px rgba(255,210,95,.45)";
    });

    btn.addEventListener("mouseleave", () => {
      if (!selectedNode || selectedNode.el !== btn) btn.style.boxShadow = defaultShadow;
    });

    btn.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();

      console.log("[Signal Flow] Native jack clicked:", key);
      handleNodeClick(layer, {
        key,
        el: btn,
        defaultShadow,
        point
      });
    });

    layer.appendChild(btn);
  }

  function renderNative(surface, adapter) {
    const level = buildLevelGeometry(surface);

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());

    const layer = document.createElement("div");
    layer.className = "sf-live-native-layer";
    layer.style.cssText = [
      "position:absolute",
      "inset:0",
      "z-index:9990",
      "isolation:isolate",
      "pointer-events:none",
      "overflow:hidden",
      "border-radius:16px",
      "background:radial-gradient(circle at top, rgba(18,36,28,.32), rgba(0,0,0,0) 62%)"
    ].join(";");

    createLabel(layer, "SUB MATRIX FEED - NATIVE CONCEPT MODE", 18, 14, 12);
    createLabel(layer, "SOURCES", level.rect.width * 0.06, level.rect.height * 0.08, 12);
    createLabel(layer, "STAGE BOX INPUTS", level.rect.width * 0.07, level.rect.height * 0.31, 11);
    createLabel(layer, "FOH OUTPUTS", level.rect.width * 0.40, level.rect.height * 0.10, 11);
    createLabel(layer, "SYSTEM PROCESSOR / SUB", level.rect.width * 0.46, level.rect.height * 0.58, 11);

    level.panels.forEach(panel => {
      const img = document.createElement("img");
      img.src = hardwareAssetFor(panel.kind);
      img.alt = panel.kind;
      img.style.cssText = [
        "position:absolute",
        "left:" + panel.x + "px",
        "top:" + panel.y + "px",
        "width:" + panel.width + "px",
        "height:auto",
        "pointer-events:none",
        "user-select:none",
        "filter:drop-shadow(0 12px 24px rgba(0,0,0,.7))",
        "z-index:10"
      ].join(";");
      layer.appendChild(img);
    });

    createSourceNode(layer, "lead-vocal-mic", "Lead Vocal Microphone", level.rect.width * 0.06, level.rect.height * 0.12);
    createSourceNode(layer, "keys-left-di", "Keys Left DI", level.rect.width * 0.06, level.rect.height * 0.18);
    createSourceNode(layer, "keys-right-di", "Keys Right DI", level.rect.width * 0.06, level.rect.height * 0.24);

    Object.keys(NODE_DEFS).forEach(key => {
      const def = NODE_DEFS[key];
      if (def.kind !== "jack") return;
      const point = getNodePoint(adapter, level, key);
      createJackNode(layer, key, point, def.label, !!def.ghost);
    });

    surface.appendChild(layer);
    redrawCables(layer);
    installCableDrag(layer);
  }

  function mountNative(force) {
    const adapter = window.SF_LIVE_SOUND_ADAPTER;
    if (!adapter) {
      console.warn("[Signal Flow] Native renderer missing adapter.");
      return;
    }

    if (getLevelId() !== LEVEL_ID || !nativeVisible) return;

    const surface = findSurface();
    if (!surface) {
      console.warn("[Signal Flow] Native renderer could not find live board surface.");
      return;
    }

    if (!force && surface.querySelector(".sf-live-native-layer")) {
      return;
    }

    if (getComputedStyle(surface).position === "static") {
      surface.style.position = "relative";
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
    state.completedValidKeys.clear();
    clearSelection();

    LEVEL.validRoutes.forEach(route => unmarkChecklist(route.key));

    const layer = document.querySelector(".sf-live-native-layer");
    if (layer) redrawCables(layer);
  }

  function undoNative() {
    const route = state.routes.pop();
    if (!route) return;

    if (route.valid) {
      state.completedValidKeys.delete(route.key);
      unmarkChecklist(route.key);
    }

    clearSelection();

    const layer = document.querySelector(".sf-live-native-layer");
    if (layer) redrawCables(layer);
  }

  function clickLabelFromEvent(event) {
    const parts = [];
    let el = event.target;

    for (let i = 0; i < 6 && el; i++) {
      if (el.nodeType === 1) {
        const label = textOf(el);
        const aria = el.getAttribute && el.getAttribute("aria-label");
        const title = el.getAttribute && el.getAttribute("title");
        if (label) parts.push(label);
        if (aria) parts.push(aria);
        if (title) parts.push(title);
      }
      el = el.parentElement;
    }

    return parts.join(" ").toLowerCase();
  }

  function wireBoardButtons() {
    // Header controls are handled by the document-level capture listener above.
    // Keep this function as a lightweight compatibility hook for the mutation observer.
  }

  function boot() {
    setTimeout(wireBoardButtons, 120);
    setTimeout(() => mountNative(false), 350);
    setTimeout(wireBoardButtons, 650);
    setTimeout(() => mountNative(false), 900);
    setTimeout(() => mountNative(false), 1600);
  }

  window.addEventListener("hashchange", () => {
    clearNative();
    nativeVisible = true;
    boot();
  });

  window.addEventListener("load", boot);

  function buttonLabelFromEvent(event) {
    const button = event.target && event.target.closest && event.target.closest("button, [role='button']");
    if (button) {
      return normalize([
        textOf(button),
        button.getAttribute && button.getAttribute("aria-label"),
        button.getAttribute && button.getAttribute("title")
      ].filter(Boolean).join(" "));
    }

    return normalize(clickLabelFromEvent(event));
  }

  function frontPanelLooksReady() {
    const buttons = Array.from(document.querySelectorAll("button, [role='button']"));
    const labels = buttons.map(button => normalize(textOf(button)));

    const hasBackPanelButton = labels.some(label => label.includes("back panel"));
    const hasFrontPanelButton = labels.some(label => label.includes("front panel") || label === "front");

    return hasBackPanelButton && !hasFrontPanelButton;
  }

  function restoreNativeFrontPanel(attempt) {
    nativeVisible = true;

    if (frontPanelLooksReady()) {
      unmountNative();
      mountNative(true);
      setTimeout(() => mountNative(false), 180);
      return;
    }

    if (attempt < 14) {
      setTimeout(() => restoreNativeFrontPanel(attempt + 1), 120);
      return;
    }

    // Fallback: if the legacy button state was not detectable, still try the
    // known v6 remount path rather than leaving the native layer absent.
    unmountNative();
    mountNative(true);
    setTimeout(() => mountNative(false), 180);
  }

  document.addEventListener("click", event => {
    // Never interpret native board/source/jack/cable clicks as header controls.
    if (event.target && event.target.closest && event.target.closest(".sf-live-native-layer")) {
      return;
    }

    const label = buttonLabelFromEvent(event);

    if (label.includes("clear")) {
      console.log("[Signal Flow] Native clear intercepted.");
      event.preventDefault();
      event.stopImmediatePropagation();
      clearNative();
      setTimeout(() => mountNative(true), 250);
      return;
    }

    if (label.includes("undo")) {
      console.log("[Signal Flow] Native undo intercepted.");
      event.preventDefault();
      event.stopImmediatePropagation();
      undoNative();
      return;
    }

    if (label.includes("back panel")) {
      console.log("[Signal Flow] Native panel toggle intercepted from front.");
      nativeVisible = false;
      // Allow the original game button to perform the actual panel swap.
      setTimeout(unmountNative, 80);
      return;
    }

    if (label.includes("front panel") || label === "front") {
      console.log("[Signal Flow] Native panel toggle intercepted from back.");
      nativeVisible = true;
      // Allow the original game button to perform the actual panel swap, then
      // remount only after the front-panel button state is visible again.
      setTimeout(() => restoreNativeFrontPanel(0), 80);
      return;
    }
  }, true);


  const observer = new MutationObserver(() => {
    if (getLevelId() !== LEVEL_ID) return;

    const hasFrontPanelButton = Array.from(document.querySelectorAll("button, [role='button']"))
      .some(button => {
        const label = normalize(textOf(button));
        return label.includes("front panel") || label === "front";
      });

    const hasBackPanelButton = Array.from(document.querySelectorAll("button, [role='button']"))
      .some(button => normalize(textOf(button)).includes("back panel"));

    if (!nativeVisible && hasBackPanelButton && !hasFrontPanelButton) {
      // The legacy front has returned after a panel swap.
      nativeVisible = true;
    }

    if (!nativeVisible || document.querySelector(".sf-live-native-layer")) return;

    clearTimeout(observer._sfTimer);
    observer._sfTimer = setTimeout(() => {
      mountNative(false);
    }, 180);
  });


  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  boot();
})();
