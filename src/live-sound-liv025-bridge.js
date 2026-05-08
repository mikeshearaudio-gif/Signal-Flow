/*
 * Signal Flow - Live Sound LIV-025 Bridge v5
 *
 * Fixes from v5:
 * - Visual cables draw above hardware panels and above jack badges.
 * - Browser-native title tooltips and visible jack badges removed from visual jacks.
 * - Unused visible panel jacks are clickable and participate in invalid-pair feedback.
 * - Valid LIV-025 pairs draw blue cables; invalid pairs draw a temporary red cable then disappear.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-liv025-bridge.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";
  let selectedVisualNode = null;
  const completedVisualRoutes = new Set();

  const VALID_ROUTES = [
    { key: "lead-vocal-to-stagebox-1", a: "lead-vocal-mic", b: "stagebox-input-1" },
    { key: "keys-left-to-stagebox-7", a: "keys-left-di", b: "stagebox-input-7" },
    { key: "keys-right-to-stagebox-8", a: "keys-right-di", b: "stagebox-input-8" },
    { key: "main-left-to-system-left", a: "main-left-output", b: "system-processor-left-in" },
    { key: "main-right-to-system-right", a: "main-right-output", b: "system-processor-right-in" },
    { key: "matrix-2-to-sub", a: "matrix-2-output", b: "sub-processor-input" }
  ];

  function validRouteKey(a, b) {
    const route = VALID_ROUTES.find(r =>
      (r.a === a && r.b === b) || (r.a === b && r.b === a)
    );
    return route ? route.key : null;
  }

  function getLevelId() {
    const fromHash = String(location.hash || "").match(/\/level\/([^/?#]+)/);
    if (fromHash) return decodeURIComponent(fromHash[1]).toUpperCase();

    const selected = Array.from(document.querySelectorAll("select"))
      .map(el => String(el.value || "").trim().toUpperCase())
      .find(value => /^LIV-\d+$/i.test(value));

    return selected || "";
  }

  function textOf(el) {
    return (el && el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function normalize(v) {
    return String(v || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function hardwareAssetFor(kind) {
    return {
      stagebox: "/assets/live-sound/svg/hardware/stagebox-snake-head.svg",
      foh: "/assets/live-sound/svg/hardware/foh-console-io-panel.svg",
      monitor: "/assets/live-sound/svg/hardware/monitor-wedge-input-panel.svg",
      amp: "/assets/live-sound/svg/hardware/power-amplifier.svg",
      utility: "/assets/live-sound/svg/hardware/system-utility-rack.svg",
      iem: "/assets/live-sound/svg/hardware/iem-wireless-rack-front.svg"
    }[kind];
  }

  function findLiveWorldSurface() {
    const all = Array.from(document.querySelectorAll("div, section, article, main"));
    const titleEl = all
      .filter(el => textOf(el).includes("Live Console + Rack World"))
      .sort((a, b) => textOf(a).length - textOf(b).length)[0];

    if (!titleEl) return null;

    let card = titleEl;
    for (let i = 0; i < 12 && card && card.parentElement; i++) {
      const r = card.getBoundingClientRect();
      if (r.width > 900 && r.height > 520) break;
      card = card.parentElement;
    }
    return card || null;
  }

  function findOriginalControlByAliases(aliases) {
    const normalizedAliases = aliases.map(normalize);

    const candidates = Array.from(
      document.querySelectorAll(
        "button, [role='button'], [tabindex], [title], [aria-label], [data-jack-id], [data-id], [class*='jack'], [class*='node'], [class*='port']"
      )
    ).filter(el => {
      if (el.classList && el.classList.contains("sf-live-panel-hitbox")) return false;
      if (el.closest && el.closest(".sf-live-integrated-layer")) return false;

      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return false;

      const values = [
        textOf(el),
        el.getAttribute("title"),
        el.getAttribute("aria-label"),
        el.getAttribute("data-jack-id"),
        el.getAttribute("data-id"),
        el.id
      ].map(normalize);

      return normalizedAliases.some(alias =>
        values.some(value => value === alias || value.includes(alias) || alias.includes(value))
      );
    });

    const ranked = candidates.sort((a, b) => {
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();

      const aValues = [
        textOf(a),
        a.getAttribute("title"),
        a.getAttribute("aria-label"),
        a.getAttribute("data-jack-id"),
        a.getAttribute("data-id"),
        a.id
      ].map(normalize);

      const bValues = [
        textOf(b),
        b.getAttribute("title"),
        b.getAttribute("aria-label"),
        b.getAttribute("data-jack-id"),
        b.getAttribute("data-id"),
        b.id
      ].map(normalize);

      const aExact = normalizedAliases.some(alias => aValues.includes(alias));
      const bExact = normalizedAliases.some(alias => bValues.includes(alias));

      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      return (ar.width * ar.height) - (br.width * br.height);
    })[0];

    return ranked
      ? (ranked.closest("button, [role='button'], [tabindex], [data-jack-id], [data-id]") || ranked)
      : null;
  }

  function pointFromPanel(adapter, level, panelJackId) {
    return adapter.endpointPanelPoint(level, panelJackId, {
      levelId: level.id,
      scenario: "sub-matrix-feed"
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
      "z-index:9994",
      "pointer-events:none"
    ].join(";");
    layer.appendChild(el);
  }

  function getCableLayer(layer) {
    let svg = layer.querySelector(".sf-live-visual-cables");
    if (svg) return svg;

    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("sf-live-visual-cables");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.cssText = [
      "position:absolute",
      "inset:0",
      "z-index:2147483000",
      "pointer-events:none",
      "overflow:visible"
    ].join(";");
    layer.appendChild(svg);
    return svg;
  }

  function drawVisualCable(layer, routeKey, from, to) {
    if (completedVisualRoutes.has(routeKey)) return;
    completedVisualRoutes.add(routeKey);

    const svg = getCableLayer(layer);
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const controlLift = Math.max(55, Math.min(150, (dx + dy) * 0.16));
    const midY = Math.min(from.y, to.y) - controlLift;

    const shadow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    shadow.dataset.routeKey = routeKey + "-shadow";
    shadow.setAttribute(
      "d",
      "M " + from.x + " " + from.y +
      " C " + from.x + " " + midY + ", " + to.x + " " + midY + ", " + to.x + " " + to.y
    );
    shadow.setAttribute("fill", "none");
    shadow.setAttribute("stroke", "rgba(0,0,0,.55)");
    shadow.setAttribute("stroke-width", "9");
    shadow.setAttribute("stroke-linecap", "round");
    svg.appendChild(shadow);

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.dataset.routeKey = routeKey;
    path.setAttribute(
      "d",
      "M " + from.x + " " + from.y +
      " C " + from.x + " " + midY + ", " + to.x + " " + midY + ", " + to.x + " " + to.y
    );
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#6fd0ff");
    path.setAttribute("stroke-width", "5");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("opacity", "0.95");
    path.style.filter = "drop-shadow(0 0 8px rgba(111,208,255,.55))";
    svg.appendChild(path);

    [from, to].forEach(point => {
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.dataset.routeKey = routeKey;
      dot.setAttribute("cx", point.x);
      dot.setAttribute("cy", point.y);
      dot.setAttribute("r", "5");
      dot.setAttribute("fill", "#6fd0ff");
      svg.appendChild(dot);
    });

    if (svg.parentNode) {
      svg.parentNode.appendChild(svg);
    }
  }

  function tryPlayBadConnectSfx() {
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
    } catch (err) {
      // Local fallback sound is best-effort only.
    }
  }


  function drawTemporaryInvalidCable(layer, from, to) {
    const svg = getCableLayer(layer);

    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const controlLift = Math.max(45, Math.min(130, (dx + dy) * 0.14));
    const midY = Math.min(from.y, to.y) - controlLift;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M " + from.x + " " + from.y +
      " C " + from.x + " " + midY + ", " + to.x + " " + midY + ", " + to.x + " " + to.y
    );
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#ff5b5b");
    path.setAttribute("stroke-width", "5");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("opacity", "0.88");
    path.style.filter = "drop-shadow(0 0 10px rgba(255,91,91,.55))";
    svg.appendChild(path);

    [from, to].forEach(point => {
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", point.x);
      dot.setAttribute("cy", point.y);
      dot.setAttribute("r", "5");
      dot.setAttribute("fill", "#ff5b5b");
      svg.appendChild(dot);

      setTimeout(() => {
        dot.style.transition = "opacity 220ms ease";
        dot.style.opacity = "0";
      }, 180);

      setTimeout(() => dot.remove(), 460);
    });

    setTimeout(() => {
      path.style.transition = "opacity 220ms ease";
      path.style.opacity = "0";
    }, 180);

    setTimeout(() => path.remove(), 460);
  }

  function clearVisualSelection() {
    if (selectedVisualNode) {
      selectedVisualNode.el.style.boxShadow = selectedVisualNode.defaultShadow;
      selectedVisualNode = null;
    }
  }

  function flashInvalid(node) {
    node.el.style.boxShadow = "0 0 0 3px rgba(255,80,80,.95), 0 0 20px rgba(255,80,80,.55)";
    setTimeout(() => {
      if (!selectedVisualNode || selectedVisualNode.el !== node.el) {
        node.el.style.boxShadow = node.defaultShadow;
      }
    }, 260);
  }

  function handleVisualClick(layer, node) {
    if (!selectedVisualNode) {
      selectedVisualNode = node;
      node.el.style.boxShadow = "0 0 0 3px rgba(111,208,255,.95), 0 0 20px rgba(111,208,255,.55)";
      return;
    }

    if (selectedVisualNode.key === node.key) {
      clearVisualSelection();
      return;
    }

    const routeKey = validRouteKey(selectedVisualNode.key, node.key);

    if (!routeKey) {
      drawTemporaryInvalidCable(layer, selectedVisualNode.point, node.point);
      flashInvalid(selectedVisualNode);
      flashInvalid(node);
      clearVisualSelection();
      tryPlayBadConnectSfx();
      return;
    }

    drawVisualCable(layer, routeKey, selectedVisualNode.point, node.point);
    clearVisualSelection();
  }

  function clickOriginal(original, label, aliases) {
    console.log("[Signal Flow] Visual click:", label, "matched original?", !!original);
    if (original && typeof original.click === "function") {
      original.click();
      return true;
    }
    console.warn("[Signal Flow] Could not find original control:", label, aliases);
    return false;
  }

  function createSourceButton(layer, key, label, aliases, x, y) {
    const original = findOriginalControlByAliases(aliases);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.setAttribute("aria-label", label);
    btn.className = "sf-live-panel-hitbox sf-live-source-hitbox";

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
      "z-index:2147483200",
      "box-shadow:" + defaultShadow
    ].join(";");

    btn.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();

      clickOriginal(original, label, aliases);

      const r = btn.getBoundingClientRect();
      const parent = layer.getBoundingClientRect();

      handleVisualClick(layer, {
        key,
        el: btn,
        defaultShadow,
        point: {
          x: r.left - parent.left + r.width / 2,
          y: r.top - parent.top + r.height / 2
        }
      });
    });

    layer.appendChild(btn);
  }

  function createJackButton(layer, key, label, aliases, point, shortLabel, options) {
    if (!point) return;

    const opts = options || {};
    const original = opts.ghost ? null : findOriginalControlByAliases(aliases || []);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", label);
    btn.className = "sf-live-panel-hitbox";
    btn.dataset.visualLabel = label;

    const defaultShadow = opts.ghost
      ? "0 0 0 1px rgba(255,210,95,.12)"
      : "0 0 0 2px rgba(255,210,95,.28)";

    btn.style.cssText = [
      "position:absolute",
      "left:" + point.x + "px",
      "top:" + point.y + "px",
      "width:" + (opts.ghost ? 34 : 42) + "px",
      "height:" + (opts.ghost ? 34 : 42) + "px",
      "transform:translate(-50%,-50%)",
      "border-radius:50%",
      "border:0",
      "background:rgba(255,255,255,0.01)",
      "box-shadow:" + defaultShadow,
      "cursor:pointer",
      "pointer-events:auto",
      "z-index:10030"
    ].join(";");

    btn.addEventListener("mouseenter", () => {
      btn.style.boxShadow = opts.ghost
        ? "0 0 0 2px rgba(255,210,95,.45)"
        : "0 0 0 3px rgba(255,210,95,.9), 0 0 18px rgba(255,210,95,.45)";
    });

    btn.addEventListener("mouseleave", () => {
      if (!selectedVisualNode || selectedVisualNode.el !== btn) {
        btn.style.boxShadow = defaultShadow;
      }
    });

    btn.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();

      if (!opts.ghost) {
        clickOriginal(original, label, aliases || []);
      }

      handleVisualClick(layer, {
        key,
        el: btn,
        defaultShadow,
        point: { x: point.x, y: point.y }
      });
    });

    layer.appendChild(btn);

    // No visible jack badge: the hardware artwork supplies the jack identity.
  }

  function hideLegacyVisuals(surface) {
    const blocks = Array.from(surface.querySelectorAll("div, section, article"));
    const labels = [
      "Sources",
      "Stage Box / Stage Box Inputs",
      "Front-of-House Console",
      "Monitor and System Rack",
      "System Processor"
    ];

    blocks.forEach(el => {
      const t = textOf(el);
      if (labels.some(label => t.includes(label))) {
        el.style.opacity = "0.04";
        el.style.filter = "blur(1px)";
      }
    });
  }

  function addGhostPanelJacks(layer, adapter, level, usedKeys) {
    const ghostDefs = [
      ["stagebox-unused-2", "Unused Stagebox Input 2", "stagebox.mic2"],
      ["stagebox-unused-3", "Unused Stagebox Input 3", "stagebox.mic3"],
      ["stagebox-unused-4", "Unused Stagebox Input 4", "stagebox.mic4"],
      ["stagebox-unused-5", "Unused Stagebox Input 5", "stagebox.mic5"],
      ["stagebox-unused-6", "Unused Stagebox Input 6", "stagebox.mic6"],
      ["stagebox-unused-link", "Unused Stagebox Link Out", "stagebox.linkOut"],

      ["foh-unused-mic-1", "Unused FOH Mic 1", "foh.mic1"],
      ["foh-unused-mic-2", "Unused FOH Mic 2", "foh.mic2"],
      ["foh-unused-mic-3", "Unused FOH Mic 3", "foh.mic3"],
      ["foh-unused-mic-4", "Unused FOH Mic 4", "foh.mic4"],
      ["foh-unused-linein-5", "Unused FOH Line In 5", "foh.lineIn5"],
      ["foh-unused-linein-6", "Unused FOH Line In 6", "foh.lineIn6"],
      ["foh-unused-linein-7", "Unused FOH Line In 7", "foh.lineIn7"],
      ["foh-unused-linein-8", "Unused FOH Line In 8", "foh.lineIn8"],
      ["foh-unused-lineout-1", "Unused FOH Line Out 1", "foh.lineOut1"],
      ["foh-unused-lineout-3", "Unused FOH Line Out 3", "foh.lineOut3"],
      ["foh-unused-lineout-4", "Unused FOH Line Out 4", "foh.lineOut4"],

      ["amp-unused-output-a", "Unused Processor Output A", "amp.outputA"],
      ["amp-unused-output-b", "Unused Processor Output B", "amp.outputB"]
    ];

    ghostDefs.forEach(([key, label, panelJackId]) => {
      if (usedKeys.has(key)) return;
      const point = pointFromPanel(adapter, level, panelJackId);
      createJackButton(layer, key, label, [], point, "", { ghost: true });
    });
  }

  function renderLiv025(surface, adapter) {
    const rect = surface.getBoundingClientRect();

    const level = {
      id: LEVEL_ID,
      panels: [
        { id: "stagebox", kind: "stagebox", x: rect.width * 0.06, y: rect.height * 0.34, width: rect.width * 0.39 },
        { id: "foh", kind: "foh", x: rect.width * 0.39, y: rect.height * 0.15, width: rect.width * 0.55 },
        { id: "amp", kind: "amp", x: rect.width * 0.46, y: rect.height * 0.62, width: rect.width * 0.42 }
      ]
    };

    surface.querySelectorAll(".sf-live-integrated-layer").forEach(el => el.remove());
    selectedVisualNode = null;
    completedVisualRoutes.clear();

    const layer = document.createElement("div");
    layer.className = "sf-live-integrated-layer";
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

    createLabel(layer, "SUB MATRIX FEED - CONCEPT SHEET MODE", 18, 14, 12);

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

    createLabel(layer, "SOURCES", rect.width * 0.06, rect.height * 0.08, 12);

    createSourceButton(layer, "lead-vocal-mic", "Lead Vocal Microphone", ["Lead Vocal Microphone", "Lead Vocal Mic", "Lead Vocal"], rect.width * 0.06, rect.height * 0.12);
    createSourceButton(layer, "keys-left-di", "Keys Left DI", ["Keys Left DI", "Keys L DI", "Keys Left"], rect.width * 0.06, rect.height * 0.18);
    createSourceButton(layer, "keys-right-di", "Keys Right DI", ["Keys Right DI", "Keys R DI", "Keys Right"], rect.width * 0.06, rect.height * 0.24);

    const usedKeys = new Set();

    createLabel(layer, "STAGE BOX INPUTS", rect.width * 0.07, rect.height * 0.31, 11);
    createJackButton(layer, "stagebox-input-1", "Stage Box Input 1", ["Stage Box Input 1", "Stagebox Input 1", "Input 1"], pointFromPanel(adapter, level, "stagebox.mic1"), "1");
    createJackButton(layer, "stagebox-input-7", "Stage Box Input 7", ["Stage Box Input 7", "Stagebox Input 7", "Input 7"], pointFromPanel(adapter, level, "stagebox.mic7"), "7");
    createJackButton(layer, "stagebox-input-8", "Stage Box Input 8", ["Stage Box Input 8", "Stagebox Input 8", "Input 8"], pointFromPanel(adapter, level, "stagebox.mic8"), "8");

    createLabel(layer, "FOH OUTPUTS", rect.width * 0.40, rect.height * 0.10, 11);
    createJackButton(layer, "main-left-output", "Main Left Output", ["Main Left Output", "Main L Output", "Main Left", "Left Output"], pointFromPanel(adapter, level, "foh.mainLeft"), "L");
    createJackButton(layer, "main-right-output", "Main Right Output", ["Main Right Output", "Main R Output", "Main Right", "Right Output"], pointFromPanel(adapter, level, "foh.mainRight"), "R");
    createJackButton(layer, "matrix-2-output", "Matrix 2 Output", ["Matrix 2 Output", "Matrix Output 2", "Matrix 2"], pointFromPanel(adapter, level, "foh.lineOut2"), "M2");

    createLabel(layer, "SYSTEM PROCESSOR / SUB", rect.width * 0.46, rect.height * 0.58, 11);
    createJackButton(layer, "system-processor-left-in", "System Processor Left In", ["System Processor Left In", "System Processor L In", "Processor Left In", "Left In"], pointFromPanel(adapter, level, "amp.inputA"), "L");
    createJackButton(layer, "system-processor-right-in", "System Processor Right In", ["System Processor Right In", "System Processor R In", "Processor Right In", "Right In"], pointFromPanel(adapter, level, "amp.inputB"), "R");
    createJackButton(layer, "sub-processor-input", "Sub Processor Input", ["Sub Processor Input", "Sub Processor In", "Sub Input", "Sub"], pointFromPanel(adapter, level, "amp.link"), "SUB");

    addGhostPanelJacks(layer, adapter, level, usedKeys);

    surface.appendChild(layer);
    console.log("[Signal Flow] LIV-025 Sub Matrix Feed renderer v5 mounted.");
  }

  function renderIntegratedLiveSound() {
    const adapter = window.SF_LIVE_SOUND_ADAPTER;

    if (!adapter) {
      console.warn("[Signal Flow] Live Sound adapter missing.");
      return;
    }

    const levelId = getLevelId();

    if (levelId !== LEVEL_ID) {
      console.log("[Signal Flow] Integrated bridge currently tuned for LIV-025 only:", levelId);
      return;
    }

    const surface = findLiveWorldSurface();

    if (!surface) {
      console.warn("[Signal Flow] Could not find Live Console + Rack World surface.");
      return;
    }

    if (getComputedStyle(surface).position === "static") {
      surface.style.position = "relative";
    }

    hideLegacyVisuals(surface);
    renderLiv025(surface, adapter);
  }

  function boot() {
    setTimeout(renderIntegratedLiveSound, 400);
    setTimeout(renderIntegratedLiveSound, 1000);
    setTimeout(renderIntegratedLiveSound, 1800);
  }

  window.addEventListener("hashchange", boot);
  window.addEventListener("load", boot);

  document.addEventListener("click", function (event) {
    const clearButton = event.target && event.target.closest && event.target.closest("button");
    if (clearButton && textOf(clearButton).toLowerCase() === "clear") {
      setTimeout(renderIntegratedLiveSound, 250);
    }
  }, true);

  boot();
})();
