/* Signal Flow reusable Live Sound label mover. DEV ONLY.
   Keyboard + console fallback + layer control. */
(function () {
  "use strict";

  const VERSION = "sf-live-label-mover-dev-v5-keyboard-layer";
  let installed = false;

  function cfg() {
    return window.sfLiveDevToolConfig || {};
  }

  function docsToScan() {
    const docs = [{ name: "top", doc: document, win: window }];
    document.querySelectorAll("iframe").forEach((frame, i) => {
      try {
        if (frame.contentDocument && frame.contentWindow) {
          docs.push({ name: "iframe-" + i, doc: frame.contentDocument, win: frame.contentWindow });
        }
      } catch (_) {}
    });
    return docs;
  }

  function findLayer() {
    const c = cfg();
    if (!c.enabled) return null;

    for (const item of docsToScan()) {
      const layer = item.doc.querySelector(c.layerSelector);
      if (layer) return { ...item, layer };
    }

    return null;
  }

  function px(el, prop) {
    const raw = el.style[prop] || el.ownerDocument.defaultView.getComputedStyle(el)[prop] || "0";
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  }

  function labelKey(text, fallback) {
    return String(text || fallback || "label")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || fallback;
  }

  function collectLabels(layer) {
    return Array.from(layer.querySelectorAll("div")).filter(el => {
      if (el.closest("#sf-live-label-mover-dev")) return false;

      const text = (el.innerText || el.textContent || "").trim();
      const cs = el.ownerDocument.defaultView.getComputedStyle(el);

      if (!text) return false;
      if (text.length > 80) return false;
      if (cs.position !== "absolute") return false;

      return true;
    });
  }

  function install() {
    if (installed) return true;

    const found = findLayer();
    if (!found) return false;

    const c = cfg();
    const layer = found.layer;
    const gameDoc = found.doc;
    const gameWin = found.win;

    const labels = collectLabels(layer);

    labels.forEach((el, i) => {
      if (!el.dataset.sfLiveDevLabelKey) {
        el.dataset.sfLiveDevLabelKey = labelKey(el.innerText || el.textContent, "label-" + i);
      }
      el.style.pointerEvents = "none";
      el.style.outline = "1px dashed rgba(255,230,80,.35)";
      if (!el.style.zIndex || el.style.zIndex === "auto") el.style.zIndex = "70";
    });

    if (!labels.length) {
      console.warn("[Signal Flow] Live Label Mover found no label targets.");
      return false;
    }

    let selectedIndex = 0;
    let step = 5;

    function selected() {
      return labels[selectedIndex] || labels[0];
    }

    function markSelected() {
      labels.forEach((el, i) => {
        el.style.outline = i === selectedIndex
          ? "3px solid rgba(255,230,80,.98)"
          : "1px dashed rgba(255,230,80,.35)";
      });

      const el = selected();
      if (!el) return;

      console.log("[Signal Flow] Live dev selected label", {
        index: selectedIndex,
        key: el.dataset.sfLiveDevLabelKey,
        text: (el.innerText || el.textContent || "").trim(),
        left: px(el, "left"),
        top: px(el, "top"),
        fontSize: gameDoc.defaultView.getComputedStyle(el).fontSize,
        zIndex: gameDoc.defaultView.getComputedStyle(el).zIndex
      });
    }

    function select(delta) {
      selectedIndex = (selectedIndex + delta + labels.length) % labels.length;
      markSelected();
    }

    function selectIndex(index) {
      const n = Number(index);
      if (!Number.isFinite(n)) return;
      selectedIndex = Math.max(0, Math.min(labels.length - 1, Math.round(n)));
      markSelected();
    }

    function move(dx, dy, amount) {
      const el = selected();
      if (!el) return;

      const useStep = Number.isFinite(Number(amount)) ? Number(amount) : step;
      const left = Math.round(px(el, "left") + dx * useStep);
      const top = Math.round(px(el, "top") + dy * useStep);

      el.style.left = left + "px";
      el.style.top = top + "px";

      console.log("[Signal Flow] Live dev label move", {
        key: el.dataset.sfLiveDevLabelKey,
        left,
        top,
        step: useStep
      });
    }

    function font(delta) {
      const el = selected();
      if (!el) return;

      const current = parseFloat(el.style.fontSize || gameDoc.defaultView.getComputedStyle(el).fontSize || "11") || 11;
      const fontSize = Math.max(6, Math.round(current + delta));

      el.style.fontSize = fontSize + "px";

      console.log("[Signal Flow] Live dev label font", {
        key: el.dataset.sfLiveDevLabelKey,
        fontSize
      });
    }

    function layerDelta(delta) {
      const el = selected();
      if (!el) return;

      const current = parseInt(el.style.zIndex || gameDoc.defaultView.getComputedStyle(el).zIndex || "70", 10) || 70;
      const zIndex = current + delta;

      el.style.zIndex = String(zIndex);

      console.log("[Signal Flow] Live dev label layer", {
        key: el.dataset.sfLiveDevLabelKey,
        zIndex
      });
    }

    function setLayer(value) {
      const el = selected();
      if (!el) return;

      const zIndex = parseInt(value, 10);
      if (!Number.isFinite(zIndex)) return;

      el.style.zIndex = String(zIndex);

      console.log("[Signal Flow] Live dev label layer set", {
        key: el.dataset.sfLiveDevLabelKey,
        zIndex
      });
    }

    function setStep(value) {
      const n = Number(value);
      if (!Number.isFinite(n) || n <= 0) return;
      step = n;
      console.log("[Signal Flow] Live dev label step", step);
    }

    function exportLabels() {
      const data = labels.map(el => ({
        key: el.dataset.sfLiveDevLabelKey,
        text: (el.innerText || el.textContent || "").trim(),
        leftPx: Math.round(px(el, "left")),
        topPx: Math.round(px(el, "top")),
        fontSize: el.style.fontSize || gameDoc.defaultView.getComputedStyle(el).fontSize,
        zIndex: el.style.zIndex || gameDoc.defaultView.getComputedStyle(el).zIndex
      }));

      console.log(`${c.exportPrefix || "[Signal Flow] LIV-020"} Label Mover export:`, data);

      window.__sfLiveLabelExport = data;
      gameWin.__sfLiveLabelExport = data;

      try {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      } catch (_) {}

      return data;
    }

    const api = {
      labels,
      selected: () => selected(),
      select,
      selectIndex,
      move,
      up: amount => move(0, -1, amount),
      down: amount => move(0, 1, amount),
      left: amount => move(-1, 0, amount),
      right: amount => move(1, 0, amount),
      font,
      fontUp: () => font(1),
      fontDown: () => font(-1),
      layer: layerDelta,
      layerUp: () => layerDelta(1),
      layerDown: () => layerDelta(-1),
      setLayer,
      step: setStep,
      export: exportLabels
    };

    window.sfLiveLabelDev = api;
    gameWin.sfLiveLabelDev = api;

    const panel = document.createElement("div");
    panel.id = "sf-live-label-mover-dev";
    panel.style.cssText = [
      "position:fixed",
      "right:12px",
      "top:12px",
      "z-index:2147483647",
      "width:410px",
      "padding:12px",
      "border:1px solid rgba(255,230,120,.75)",
      "border-radius:12px",
      "background:rgba(16,12,4,.98)",
      "color:#fff4cf",
      "font:12px/1.4 system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
      "box-shadow:0 10px 30px rgba(0,0,0,.55)",
      "pointer-events:none"
    ].join(";");

    panel.innerHTML = `
      <div style="font-size:14px;font-weight:800;margin-bottom:8px;">Live Label Mover - ${c.levelId || "LIV-020"}</div>
      <div><b>[</b> previous label &nbsp; <b>]</b> next label</div>
      <div><b>Arrow keys</b> move selected label</div>
      <div><b>Shift + Arrow</b> move 5x faster</div>
      <div><b>+</b>/<b>-</b> font size up/down</div>
      <div><b>Z</b>/<b>X</b> layer up/down</div>
      <div><b>1</b>/<b>2</b>/<b>5</b>/<b>0</b> step = 1/2/5/20 px</div>
      <div><b>E</b> export JSON</div>
      <div style="margin-top:8px;opacity:.85;">Console: <code>sfLiveLabelDev.setLayer(90)</code>, <code>sfLiveLabelDev.export()</code></div>
    `;

    document.body.appendChild(panel);

    function onKey(e) {
      const tag = (e.target && e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      let used = true;
      const amount = e.shiftKey ? step * 5 : step;

      switch (e.key) {
        case "ArrowUp": move(0, -1, amount); break;
        case "ArrowDown": move(0, 1, amount); break;
        case "ArrowLeft": move(-1, 0, amount); break;
        case "ArrowRight": move(1, 0, amount); break;
        case "[": select(-1); break;
        case "]": select(1); break;
        case "+": case "=": font(1); break;
        case "-": case "_": font(-1); break;
        case "z": case "Z": layerDelta(1); break;
        case "x": case "X": layerDelta(-1); break;
        case "1": setStep(1); break;
        case "2": setStep(2); break;
        case "5": setStep(5); break;
        case "0": setStep(20); break;
        case "e": case "E": exportLabels(); break;
        default: used = false;
      }

      if (used) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      }
    }

    [document, gameDoc].forEach(doc => {
      try {
        doc.addEventListener("keydown", onKey, true);
      } catch (_) {}
    });

    [window, gameWin].forEach(win => {
      try {
        win.addEventListener("keydown", onKey, true);
      } catch (_) {}
    });

    markSelected();
    installed = true;

    console.log("[Signal Flow] Live Label Mover installed", VERSION, c.levelId || "LIV-020", {
      targets: labels.length,
      layerDocument: found.name,
      keyboard: true,
      consoleApi: "sfLiveLabelDev"
    });

    return true;
  }

  console.log("[Signal Flow] Live Label Mover dev script loaded", VERSION);

  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 120) clearInterval(timer);
  }, 250);
})();
