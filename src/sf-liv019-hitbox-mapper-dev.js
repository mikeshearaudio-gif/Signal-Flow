(() => {
  const VERSION = "v6r406-dev";

  function docsToScan() {
    const docs = [{ name: "top", doc: document }];
    document.querySelectorAll("iframe").forEach((frame, i) => {
      try {
        if (frame.contentDocument) docs.push({ name: `iframe-${i}`, doc: frame.contentDocument });
      } catch {}
    });
    return docs;
  }

  function bestTarget() {
    let best = null;
    docsToScan().forEach(item => {
      const layer = item.doc.querySelector(".sf-live-native-layer.sf-live-native-level-liv-019");
      if (!layer) return;
      const r = layer.getBoundingClientRect();
      const score = (item.name.startsWith("iframe") ? 100000 : 0) + r.width * r.height;
      if (!best || score > best.score) best = { ...item, layer, score };
    });
    return best;
  }

  function px(el, prop) {
    const raw = el.style[prop] || el.ownerDocument.defaultView.getComputedStyle(el)[prop] || "0";
    return parseFloat(raw) || 0;
  }

  function ensurePxBox(el) {
    const r = el.getBoundingClientRect();
    const left = px(el, "left");
    const top = px(el, "top");
    const w = px(el, "width") || r.width || 24;
    const h = px(el, "height") || r.height || 24;

    el.style.setProperty("left", `${left}px`, "important");
    el.style.setProperty("top", `${top}px`, "important");
    ["width", "min-width", "max-width", "inline-size"].forEach(prop => el.style.setProperty(prop, `${w}px`, "important"));
    ["height", "min-height", "max-height", "block-size"].forEach(prop => el.style.setProperty(prop, `${h}px`, "important"));
    el.style.setProperty("box-sizing", "border-box", "important");
    el.style.setProperty("pointer-events", "auto", "important");
  }

  function collectNodes(layer) {
    const map = {};
    const seen = {};

    layer.querySelectorAll("[data-node-key]").forEach(el => {
      if (el.closest(".sf-native-liv019-source-panel") || el.closest(".sf-native-liv009-source-panel")) return;

      const base = el.dataset.nodeKey || "unknown";

      // LIV-019 uses an 8-input stagebox.
      if (/^stagebox-input-(9|10|11|12|13|14|15|16)$/.test(base)) {
        el.style.setProperty("display", "none", "important");
        el.style.setProperty("visibility", "hidden", "important");
        el.style.setProperty("pointer-events", "none", "important");
        return;
      }

      seen[base] = (seen[base] || 0) + 1;
      const key = seen[base] === 1 ? base : `${base}#${seen[base]}`;

      el.dataset.sfLiv019HitboxMapKey = key;
      ensurePxBox(el);
      map[key] = el;
    });

    return map;
  }

  function makeOverlayLayer(layer) {
    let overlayLayer = layer.querySelector(".sf-liv019-hitbox-visual-layer");
    if (!overlayLayer) {
      overlayLayer = layer.ownerDocument.createElement("div");
      overlayLayer.className = "sf-liv019-hitbox-visual-layer";
      overlayLayer.style.cssText = [
        "position:absolute",
        "left:0",
        "top:0",
        "width:100%",
        "height:100%",
        "z-index:99999",
        "pointer-events:none",
        "overflow:visible"
      ].join(";");
      layer.appendChild(overlayLayer);
    }
    return overlayLayer;
  }

  function makeVisualBox(overlayLayer, key) {
    let box = overlayLayer.querySelector(`[data-sf-hitbox-visual="${CSS.escape(key)}"]`);
    if (!box) {
      box = overlayLayer.ownerDocument.createElement("div");
      box.dataset.sfHitboxVisual = key;
      box.style.cssText = [
        "position:absolute",
        "box-sizing:border-box",
        "border:2px dashed rgba(255,216,74,.9)",
        "background:rgba(255,216,74,.10)",
        "box-shadow:0 0 10px rgba(255,216,74,.45)",
        "border-radius:999px",
        "pointer-events:none",
        "display:none",
        "z-index:1"
      ].join(";");
      overlayLayer.appendChild(box);
    }
    return box;
  }

  function syncVisualBox(layer, node, box, selected) {
    const lr = layer.getBoundingClientRect();
    const r = node.getBoundingClientRect();

    box.style.setProperty("left", `${r.left - lr.left}px`, "important");
    box.style.setProperty("top", `${r.top - lr.top}px`, "important");
    box.style.setProperty("width", `${r.width}px`, "important");
    box.style.setProperty("height", `${r.height}px`, "important");
    box.style.setProperty("display", "block", "important");

    if (selected) {
      box.style.setProperty("border", "3px solid #ff3b30", "important");
      box.style.setProperty("background", "rgba(255,59,48,.16)", "important");
      box.style.setProperty("box-shadow", "0 0 14px rgba(255,59,48,.65)", "important");
    } else {
      box.style.setProperty("border", "2px dashed rgba(255,216,74,.9)", "important");
      box.style.setProperty("background", "rgba(255,216,74,.10)", "important");
      box.style.setProperty("box-shadow", "0 0 10px rgba(255,216,74,.45)", "important");
    }
  }

  function install() {
    const target = bestTarget();
    if (!target) return false;

    document.querySelector("#sf-liv019-hitbox-mapper")?.remove();

    const nodes = collectNodes(target.layer);
    const keys = Object.keys(nodes).sort();

    if (!keys.length) {
      console.warn("[Signal Flow] LIV-019 Hitbox Mapper found no data-node-key targets.");
      return false;
    }

    const visualLayer = makeOverlayLayer(target.layer);
    const visuals = {};
    keys.forEach(key => visuals[key] = makeVisualBox(visualLayer, key));

    let selectedKey = keys[0];
    let showAll = false;

    const panel = document.createElement("div");
    panel.id = "sf-liv019-hitbox-mapper";
    panel.style.cssText = [
      "position:fixed",
      "right:16px",
      "bottom:16px",
      "z-index:999999",
      "width:500px",
      "max-height:78vh",
      "overflow:auto",
      "background:#111",
      "color:#ffd84a",
      "border:2px solid #ffd84a",
      "border-radius:12px",
      "padding:12px",
      "font:700 12px system-ui,sans-serif"
    ].join(";");

    panel.innerHTML = [
      '<div style="font-size:14px;margin-bottom:8px;">LIV-019 Hitbox Mapper v6r406</div>',
      `<div style="margin-bottom:6px;color:#9ee;">Target: ${target.name} · ${keys.length} hitboxes</div>`,
      '<div id="sf-hbm-current" style="margin-bottom:8px;color:white;line-height:1.35;"></div>',
      '<select id="sf-hbm-select" style="width:100%;margin-bottom:8px;"></select>',
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px;">',
      '<span></span><button data-move="up">Up</button><span></span>',
      '<button data-move="left">Left</button><button data-move="down">Down</button><button data-move="right">Right</button>',
      '</div>',
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">',
      '<button data-size="w-">W -</button>',
      '<button data-size="w+">W +</button>',
      '<button data-size="h-">H -</button>',
      '<button data-size="h+">H +</button>',
      '<button id="sf-hbm-show-all">Show all</button>',
      '<button id="sf-hbm-hide-all">Hide all</button>',
      '</div>',
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">',
      '<button id="sf-hbm-export">Export JSON</button>',
      '<button id="sf-hbm-download">Download JSON</button>',
      '<button id="sf-hbm-close">Close</button>',
      '</div>',
      '<div style="font-size:11px;color:white;line-height:1.35;">Move/resize step: 5px. Hold Shift for 1px. Yellow/red boxes show actual mapped hitbox bounds.</div>'
    ].join("");

    document.body.appendChild(panel);

    const select = panel.querySelector("#sf-hbm-select");
    const current = panel.querySelector("#sf-hbm-current");

    keys.forEach(key => {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = key;
      select.appendChild(opt);
    });

    function selected() {
      return nodes[selectedKey];
    }

    function nodeInfo(el) {
      const lr = target.layer.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2 - lr.left;
      const cy = r.top + r.height / 2 - lr.top;
      const parentGear = el.closest("[data-liv019-gear-key]");
      let gearRel = null;

      if (parentGear) {
        const gr = parentGear.getBoundingClientRect();
        gearRel = {
          gear: parentGear.dataset.liv019GearKey,
          x: +(((r.left + r.width / 2 - gr.left) / gr.width) * 100).toFixed(3),
          y: +(((r.top + r.height / 2 - gr.top) / gr.height) * 100).toFixed(3)
        };
      }

      return {
        left: px(el, "left"),
        top: px(el, "top"),
        width: px(el, "width") || Math.round(r.width),
        height: px(el, "height") || Math.round(r.height),
        centerX: +cx.toFixed(2),
        centerY: +cy.toFixed(2),
        layerRelX: +((cx / lr.width) * 100).toFixed(3),
        layerRelY: +((cy / lr.height) * 100).toFixed(3),
        gearRel
      };
    }

    function buildExportData() {
      const data = {};
      keys.forEach(key => {
        const el = nodes[key];
        const info = nodeInfo(el);
        data[key] = {
          nodeKey: el.dataset.nodeKey || key,
          leftPx: Math.round(info.left),
          topPx: Math.round(info.top),
          widthPx: Math.round(info.width),
          heightPx: Math.round(info.height),
          centerX: info.centerX,
          centerY: info.centerY,
          layerRelX: info.layerRelX,
          layerRelY: info.layerRelY,
          gearRel: info.gearRel
        };
      });

      window.__sfLiv019HitboxExport = data;
      return data;
    }

    function syncVisuals() {
      keys.forEach(key => {
        const node = nodes[key];
        const box = visuals[key];
        if (!node || !box) return;

        if (showAll || key === selectedKey) {
          syncVisualBox(target.layer, node, box, key === selectedKey);
        } else {
          box.style.setProperty("display", "none", "important");
        }
      });
    }

    function update() {
      const el = selected();
      if (!el) {
        current.textContent = "No selected hitbox.";
        return;
      }

      const info = nodeInfo(el);
      current.textContent =
        `${selectedKey}: left ${Math.round(info.left)}px, top ${Math.round(info.top)}px, ` +
        `w ${Math.round(info.width)}px, h ${Math.round(info.height)}px · ` +
        `center ${info.centerX}, ${info.centerY}` +
        (info.gearRel ? ` · ${info.gearRel.gear} ${info.gearRel.x}%, ${info.gearRel.y}%` : "");

      syncVisuals();
    }

    select.addEventListener("change", e => {
      selectedKey = e.target.value;
      update();
    });

    panel.querySelectorAll("[data-move]").forEach(btn => {
      btn.addEventListener("click", e => {
        const el = selected();
        if (!el) return;

        const step = e.shiftKey ? 1 : 5;
        const dir = e.currentTarget.dataset.move;
        let left = px(el, "left");
        let top = px(el, "top");

        if (dir === "left") left -= step;
        if (dir === "right") left += step;
        if (dir === "up") top -= step;
        if (dir === "down") top += step;

        el.style.setProperty("left", `${left}px`, "important");
        el.style.setProperty("top", `${top}px`, "important");
        update();
      });
    });

    panel.querySelectorAll("[data-size]").forEach(btn => {
      btn.addEventListener("click", e => {
        const el = selected();
        if (!el) return;

        const step = e.shiftKey ? 1 : 5;
        const mode = e.currentTarget.dataset.size;
        let w = px(el, "width") || el.getBoundingClientRect().width;
        let h = px(el, "height") || el.getBoundingClientRect().height;

        if (mode === "w-") w -= step;
        if (mode === "w+") w += step;
        if (mode === "h-") h -= step;
        if (mode === "h+") h += step;

        w = Math.max(4, w);
        h = Math.max(4, h);

        ["width", "min-width", "max-width", "inline-size"].forEach(prop => el.style.setProperty(prop, `${w}px`, "important"));
        ["height", "min-height", "max-height", "block-size"].forEach(prop => el.style.setProperty(prop, `${h}px`, "important"));

        update();
      });
    });

    panel.querySelector("#sf-hbm-show-all").addEventListener("click", () => {
      showAll = true;
      update();
    });

    panel.querySelector("#sf-hbm-hide-all").addEventListener("click", () => {
      showAll = false;
      update();
    });

    panel.querySelector("#sf-hbm-export").addEventListener("click", async () => {
      const data = buildExportData();
      const text = JSON.stringify(data, null, 2);
      console.log("LIV-019 Hitbox Mapper export:");
      console.log(text);

      try {
        await navigator.clipboard.writeText(text);
        current.textContent = "Copied complete hitbox JSON to clipboard.";
      } catch {
        current.textContent = "Copy hitbox JSON from console.";
      }
    });

    panel.querySelector("#sf-hbm-download").addEventListener("click", () => {
      const data = buildExportData();
      const text = JSON.stringify(data, null, 2);
      const blob = new Blob([text], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "liv019-hitbox-export-v6r406.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      current.textContent = "Downloaded liv019-hitbox-export-v6r406.json.";
    });

    panel.querySelector("#sf-hbm-close").addEventListener("click", () => {
      Object.values(visuals).forEach(box => box.remove());
      visualLayer.remove();
      panel.remove();
    });

    update();

    console.log("[Signal Flow] LIV-019 Hitbox Mapper installed", VERSION, {
      target: target.name,
      hitboxes: keys.length,
      visualOverlay: true,
      downloadJson: true
    });

    return true;
  }

  console.log("[Signal Flow] LIV-019 Hitbox Mapper loaded", VERSION);

  install();
  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (document.querySelector("#sf-liv019-hitbox-mapper") || install() || tries > 100) clearInterval(timer);
  }, 250);
})();
