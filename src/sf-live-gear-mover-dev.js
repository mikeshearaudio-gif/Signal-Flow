/* Signal Flow reusable Live Sound gear mover. DEV ONLY.
   Keyboard-first version because native board click handlers can steal tool clicks. */
(function () {
  "use strict";

  const VERSION = "sf-live-gear-mover-dev-v3-keyboard";
  let installed = false;

  function cfg() {
    return window.sfLiveDevToolConfig || {};
  }

  function docsToScan() {
    const docs = [{ name: "self", doc: document, win: window }];
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

  function relRect(layer, el) {
    const lr = layer.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      leftPx: Math.round(r.left - lr.left),
      topPx: Math.round(r.top - lr.top),
      widthPx: Math.round(r.width),
      heightPx: Math.round(r.height)
    };
  }

  function gearKey(el, i) {
    if (el.dataset.sfLiveDevGearKey) return el.dataset.sfLiveDevGearKey;

    const key = (el.alt || el.getAttribute("src") || `gear-${i}`)
      .split("/")
      .pop()
      .replace(/\.[a-z0-9]+$/i, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    el.dataset.sfLiveDevGearKey = key || `gear-${i}`;
    return el.dataset.sfLiveDevGearKey;
  }

  function ensureMovable(layer, el, i) {
    gearKey(el, i);

    const rr = relRect(layer, el);
    el.style.position = "absolute";
    el.style.left = rr.leftPx + "px";
    el.style.top = rr.topPx + "px";
    el.style.width = rr.widthPx + "px";
    el.style.height = "auto";
    el.style.pointerEvents = "auto";
    el.style.outline = "2px dashed rgba(120,255,190,.45)";

    if (!el.style.zIndex || el.style.zIndex === "auto") {
      el.style.zIndex = "50";
    }
  }

  function install() {
    if (installed) return true;

    const found = findLayer();
    if (!found) return false;

    const c = cfg();
    const gameDoc = found.doc;
    const layer = found.layer;

    const gear = Array.from(layer.querySelectorAll(c.gearSelector || "img"))
      .filter(el => !el.closest("#sf-live-gear-mover-dev"));

    gear.forEach((el, i) => ensureMovable(layer, el, i));

    if (!gear.length) {
      console.warn("[Signal Flow] Live Gear Mover found no gear targets.");
      return false;
    }

    let selectedIndex = 0;
    let step = 20;

    function selected() {
      return gear[selectedIndex] || gear[0];
    }

    function markSelected() {
      gear.forEach((el, i) => {
        el.style.outline = i === selectedIndex
          ? "4px solid rgba(255,230,80,.95)"
          : "2px dashed rgba(120,255,190,.45)";
      });

      const el = selected();
      if (el) {
        console.log("[Signal Flow] Live dev selected gear", {
          index: selectedIndex + 1,
          total: gear.length,
          key: el.dataset.sfLiveDevGearKey
        });
      }
    }

    function move(dx, dy) {
      const el = selected();
      if (!el) return;

      const left = Math.round(px(el, "left") + dx * step);
      const top = Math.round(px(el, "top") + dy * step);

      el.style.left = left + "px";
      el.style.top = top + "px";

      console.log("[Signal Flow] Live dev gear move", {
        key: el.dataset.sfLiveDevGearKey,
        left,
        top,
        step
      });
    }

    function size(dw) {
      const el = selected();
      if (!el) return;

      const width = Math.max(40, Math.round(px(el, "width") + dw * step));
      el.style.width = width + "px";
      el.style.height = "auto";

      console.log("[Signal Flow] Live dev gear size", {
        key: el.dataset.sfLiveDevGearKey,
        width,
        step
      });
    }

    function z(dz) {
      const el = selected();
      if (!el) return;

      const current = parseInt(el.style.zIndex || gameDoc.defaultView.getComputedStyle(el).zIndex || "50", 10) || 50;
      const zIndex = current + dz;
      el.style.zIndex = String(zIndex);

      console.log("[Signal Flow] Live dev gear z", {
        key: el.dataset.sfLiveDevGearKey,
        zIndex
      });
    }

    function exportGear() {
      const data = gear.map(el => ({
        key: el.dataset.sfLiveDevGearKey,
        ...relRect(layer, el),
        zIndex: gameDoc.defaultView.getComputedStyle(el).zIndex,
        alt: el.alt || "",
        src: el.getAttribute("src") || ""
      }));

      console.log(`${c.exportPrefix} Gear Mover export:`, data);

      // Store export anywhere DevTools might be looking: this script window,
      // the game document window, and the parent wrapper window.
      try { window.__sfLiveGearExport = data; } catch (_) {}
      try { gameDoc.defaultView.__sfLiveGearExport = data; } catch (_) {}
      try { window.parent.__sfLiveGearExport = data; } catch (_) {}
      try { window.top.__sfLiveGearExport = data; } catch (_) {}

      try {
        const text = JSON.stringify(data, null, 2);
        navigator.clipboard.writeText(text);
        console.log(`${c.exportPrefix} Gear Mover JSON copied to clipboard.`);
      } catch (_) {
        console.warn(`${c.exportPrefix} Gear Mover clipboard copy failed; use __sfLiveGearExport.`);
      }

      return data;
    }

    const panel = document.createElement("div");
    panel.id = "sf-live-gear-mover-dev";
    panel.style.cssText = [
      "position:fixed",
      "right:12px",
      "top:12px",
      "z-index:2147483647",
      "width:360px",
      "padding:12px",
      "border:1px solid rgba(160,255,210,.7)",
      "border-radius:12px",
      "background:rgba(4,12,14,.98)",
      "color:#ddfff2",
      "font:12px/1.4 system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
      "box-shadow:0 10px 30px rgba(0,0,0,.55)",
      "pointer-events:none"
    ].join(";");

    panel.innerHTML = `
      <div style="font-size:14px;font-weight:800;margin-bottom:8px;">Live Gear Mover - ${c.levelId}</div>
      <div><b>[</b> previous gear &nbsp; <b>]</b> next gear</div>
      <div><b>Arrow keys</b> move selected gear</div>
      <div><b>Shift + Arrow</b> move 5x faster</div>
      <div><b>+</b>/<b>-</b> resize selected gear</div>
      <div><b>Z</b>/<b>X</b> z-index up/down</div>
      <div><b>1</b>/<b>2</b>/<b>5</b>/<b>0</b> step = 1/2/5/20 px</div>
      <div><b>E</b> export gear JSON</div>
      <div style="margin-top:8px;opacity:.8;">Current selection is outlined yellow. Clicks are intentionally bypassed.</div>
    `;

    document.body.appendChild(panel);

    function onKey(e) {
      const tag = (e.target && e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      let used = true;
      const mul = e.shiftKey ? 5 : 1;
      const oldStep = step;
      step = step * mul;

      switch (e.key) {
        case "ArrowUp": move(0, -1); break;
        case "ArrowDown": move(0, 1); break;
        case "ArrowLeft": move(-1, 0); break;
        case "ArrowRight": move(1, 0); break;
        case "[": selectedIndex = (selectedIndex - 1 + gear.length) % gear.length; markSelected(); break;
        case "]": selectedIndex = (selectedIndex + 1) % gear.length; markSelected(); break;
        case "+": case "=": size(1); break;
        case "-": case "_": size(-1); break;
        case "z": case "Z": z(1); break;
        case "x": case "X": z(-1); break;
        case "1": step = 1; console.log("[Signal Flow] Live dev gear step", step); used = false; break;
        case "2": step = 2; console.log("[Signal Flow] Live dev gear step", step); used = false; break;
        case "5": step = 5; console.log("[Signal Flow] Live dev gear step", step); used = false; break;
        case "0": step = 20; console.log("[Signal Flow] Live dev gear step", step); used = false; break;
        case "e": case "E": exportGear(); break;
        default: used = false;
      }

      if (used) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      }

      if (mul !== 1) step = oldStep;
    }

    document.addEventListener("keydown", onKey, true);
    gameDoc.addEventListener("keydown", onKey, true);

    markSelected();
    installed = true;

    console.log("[Signal Flow] Live Gear Mover installed", VERSION, c.levelId, {
      targets: gear.length,
      layerDocument: found.name,
      keyboard: true
    });

    return true;
  }

  console.log("[Signal Flow] Live Gear Mover dev script loaded", VERSION);

  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 120) clearInterval(timer);
  }, 250);
})();
