(() => {
  const VERSION = "v6r400";

  const rootWin = window.top || window;
  if (rootWin.__sfLiv019FohLabelFinalizerVersion === VERSION) return;
  rootWin.__sfLiv019FohLabelFinalizerVersion = VERSION;

  console.log("[Signal Flow] LIV-019 FOH label finalizer loaded", VERSION);

  function docsToScan() {
    const rootDoc = rootWin.document || document;
    const docs = [{ name: "top", doc: rootDoc }];

    rootDoc.querySelectorAll("iframe").forEach((frame, i) => {
      try {
        if (frame.contentDocument) docs.push({ name: `iframe-${i}`, doc: frame.contentDocument, frame });
      } catch {}
    });

    return docs;
  }

  function setImportant(el, prop, value) {
    if (el && value !== undefined && value !== "") {
      el.style.setProperty(prop, value, "important");
    }
  }

  function candidateScore(item, layer) {
    const wrap = item.doc.querySelector(".patchbay-wrap") || item.doc.querySelector("#patchbay");
    const r = wrap ? wrap.getBoundingClientRect() : layer.getBoundingClientRect();
    const area = Math.max(0, r.width) * Math.max(0, r.height);
    const iframeBoost = item.name.startsWith("iframe") ? 100000 : 0;
    return area + iframeBoost;
  }

  function findBestTarget() {
    let best = null;

    docsToScan().forEach(item => {
      const layer = item.doc.querySelector(".sf-live-native-layer.sf-live-native-level-liv-019");
      const foh = layer?.querySelector('[data-liv019-gear-key="foh"]');
      if (!layer || !foh) return;

      const score = candidateScore(item, layer);
      if (!best || score > best.score) {
        best = { ...item, layer, foh, score };
      }
    });

    return best;
  }

  function muteLegacyPlaceholderText(layer) {
    const old = new Set([
      "A1", "A2", "A3", "A4", "A5", "A6",
      "B1L", "B1R", "B2L", "B2R", "B3L", "B3R",
      "9", "10", "11", "12", "13", "14"
    ]);

    let muted = 0;

    layer.querySelectorAll("*").forEach(el => {
      if (!el || el.nodeType !== 1) return;
      if (el.closest('[data-liv019-gear-key="foh"]')) return;
      if (el.dataset?.liv019FohLabel) return;

      const txt = String(el.textContent || "").trim();
      if (!old.has(txt)) return;

      const isNode = el.matches(".sf-native-node, [data-node-key]") || el.closest(".sf-native-node, [data-node-key]");
      if (isNode) {
        setImportant(el, "font-size", "0px");
        setImportant(el, "line-height", "0");
        setImportant(el, "color", "transparent");
        setImportant(el, "text-shadow", "none");
        setImportant(el, "pointer-events", "auto");

        el.querySelectorAll("*").forEach(child => {
          setImportant(child, "font-size", "0px");
          setImportant(child, "line-height", "0");
          setImportant(child, "color", "transparent");
          setImportant(child, "text-shadow", "none");
        });
      } else {
        setImportant(el, "display", "none");
        setImportant(el, "visibility", "hidden");
        setImportant(el, "pointer-events", "none");
      }

      muted += 1;
    });

    return muted;
  }

  function makeLabel(foh, key, text, x, y, opts = {}) {
    foh.querySelector(`[data-liv019-foh-label="${key}"]`)?.remove();

    const el = foh.ownerDocument.createElement("div");
    el.dataset.liv019FohLabel = key;
    el.dataset.liv019OverlayKey = `foh-${key}`;
    el.dataset.liv019OverlayKind = "foh-label";
    el.textContent = text;

    setImportant(el, "position", "absolute");
    setImportant(el, "left", x);
    setImportant(el, "top", y);
    setImportant(el, "transform", "translate(-50%, -50%)");
    setImportant(el, "z-index", opts.z || "60");
    setImportant(el, "pointer-events", "none");
    setImportant(el, "white-space", "nowrap");
    setImportant(el, "text-align", "center");
    setImportant(el, "font-family", "system-ui, -apple-system, Segoe UI, sans-serif");
    setImportant(el, "font-weight", opts.weight || "900");
    setImportant(el, "font-size", opts.size || "7px");
    setImportant(el, "letter-spacing", opts.spacing || ".08em");
    setImportant(el, "color", opts.color || "#ffffff");
    setImportant(el, "background", "transparent");
    setImportant(el, "text-shadow", "0 1px 2px rgba(0,0,0,.95), 0 0 4px rgba(0,0,0,.9)");
    setImportant(el, "text-transform", opts.upper === false ? "none" : "uppercase");

    foh.appendChild(el);
    return el;
  }

  function installFohLabels(foh) {
    foh.querySelectorAll("[data-liv019-foh-label]").forEach(el => el.remove());

    const labels = [];

    labels.push(["section-inputs", "INPUTS", "24%", "13.0%", { size: "9px", color: "#ffe66c", spacing: ".11em" }]);
    labels.push(["section-aux", "AUX SENDS", "27%", "47.0%", { size: "8px", color: "#ffe66c", spacing: ".10em" }]);
    labels.push(["section-bus", "BUS OUTS", "58%", "47.0%", { size: "8px", color: "#ffe66c", spacing: ".10em" }]);
    labels.push(["section-main", "MAIN OUTPUT", "91.8%", "15.5%", { size: "8px", color: "#ffe66c", spacing: ".10em" }]);

    [
      ["1", "8.6%", "31.5%"], ["2", "12.8%", "31.5%"], ["3", "17.0%", "31.5%"], ["4", "21.2%", "31.5%"],
      ["5", "25.4%", "31.5%"], ["6", "29.6%", "31.5%"], ["7", "33.8%", "31.5%"], ["8", "38.0%", "31.5%"],
      ["9", "66.5%", "18.5%"], ["10", "70.3%", "18.5%"], ["11", "74.1%", "18.5%"], ["12", "77.9%", "18.5%"],
      ["13", "66.5%", "36.0%"], ["14", "70.3%", "36.0%"], ["15", "74.1%", "36.0%"], ["16", "77.9%", "36.0%"]
    ].forEach(([n, x, y]) => labels.push([`input-${n}`, n, x, y, { size: "7px", color: "#ffffff" }]));

    [
      ["1", "12.1%"], ["2", "16.3%"], ["3", "20.5%"], ["4", "24.7%"],
      ["5", "28.9%"], ["6", "33.1%"], ["7", "37.3%"], ["8", "41.5%"]
    ].forEach(([n, x]) => labels.push([`aux-${n}`, n, x, "61.5%", { size: "7px", color: "#ffffff" }]));

    [
      ["1", "50.0%", "61.5%"], ["2", "53.8%", "61.5%"], ["3", "57.6%", "61.5%"], ["4", "61.4%", "61.5%"],
      ["5", "65.2%", "61.5%"], ["6", "69.0%", "61.5%"], ["7", "72.8%", "61.5%"], ["8", "76.6%", "61.5%"],
      ["9", "50.0%", "77.0%"], ["10", "53.8%", "77.0%"], ["11", "57.6%", "77.0%"], ["12", "61.4%", "77.0%"]
    ].forEach(([n, x, y]) => labels.push([`bus-${n}`, n, x, y, { size: "7px", color: "#ffffff" }]));

    labels.push(["main-l", "L", "88.5%", "46.5%", { size: "8px", color: "#ffffff" }]);
    labels.push(["main-r", "R", "95.5%", "46.5%", { size: "8px", color: "#ffffff" }]);

    labels.forEach(args => makeLabel(foh, ...args));

    return labels.length;
  }

  function removeOldPanels() {
    docsToScan().forEach(item => {
      item.doc.querySelector("#sf-liv019-foh-label-mover")?.remove();
    });
  }

  function installMover(target) {
    const panelDoc = rootWin.document || target.doc;
    removeOldPanels();

    const labels = {};
    target.foh.querySelectorAll("[data-liv019-foh-label]").forEach(el => {
      labels[el.dataset.liv019FohLabel] = el;
    });

    const keys = Object.keys(labels).sort();
    if (!keys.length) return false;

    let selectedKey = keys.includes("section-inputs") ? "section-inputs" : keys[0];

    const panel = panelDoc.createElement("div");
    panel.id = "sf-liv019-foh-label-mover";
    panel.style.cssText = [
      "position:fixed",
      "left:16px",
      "bottom:16px",
      "z-index:999999",
      "width:450px",
      "max-height:76vh",
      "overflow:auto",
      "background:#111",
      "color:#ffd84a",
      "border:2px solid #ffd84a",
      "border-radius:12px",
      "padding:12px",
      "font:700 12px system-ui,sans-serif"
    ].join(";");

    panel.innerHTML = [
      '<div style="font-size:14px;margin-bottom:8px;">LIV-019 FOH Label Mover v6r400</div>',
      `<div style="margin-bottom:6px;color:#9ee;">Target: ${target.name}</div>`,
      '<div id="sf-flm-current" style="margin-bottom:8px;color:white;"></div>',
      '<select id="sf-flm-select" style="width:100%;margin-bottom:8px;"></select>',
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px;">',
      '<span></span><button data-move="up">Up</button><span></span>',
      '<button data-move="left">Left</button><button data-move="down">Down</button><button data-move="right">Right</button>',
      '</div>',
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">',
      '<button data-font="-">Font -</button>',
      '<button data-font="+">Font +</button>',
      '<button id="sf-flm-export">Export JSON</button>',
      '<button id="sf-flm-close">Close</button>',
      '</div>',
      '<div style="font-size:11px;color:white;line-height:1.35;">Move step: 2%. Hold Shift for 0.25%. Font step is 1px.</div>'
    ].join("");

    panelDoc.body.appendChild(panel);

    const select = panel.querySelector("#sf-flm-select");
    const current = panel.querySelector("#sf-flm-current");

    keys.forEach(key => {
      const opt = panelDoc.createElement("option");
      opt.value = key;
      opt.textContent = key;
      select.appendChild(opt);
    });
    select.value = selectedKey;

    function num(el, prop) {
      const raw = el.style[prop] || target.doc.defaultView.getComputedStyle(el)[prop] || "0";
      return parseFloat(raw) || 0;
    }

    function selected() {
      return labels[selectedKey];
    }

    function update() {
      Object.values(labels).forEach(el => {
        el.style.outline = "";
        el.style.outlineOffset = "";
      });

      const el = selected();
      if (!el) {
        current.textContent = "No selected label.";
        return;
      }

      el.style.setProperty("outline", "3px solid #ff3b30", "important");
      el.style.setProperty("outline-offset", "2px", "important");

      current.textContent = `${selectedKey}: left ${el.style.left}, top ${el.style.top}, font ${el.style.fontSize}, text "${el.textContent}"`;
    }

    select.addEventListener("change", e => {
      selectedKey = e.target.value;
      update();
    });

    panel.querySelectorAll("[data-move]").forEach(btn => {
      btn.addEventListener("click", e => {
        const el = selected();
        if (!el) return;

        const step = e.shiftKey ? 0.25 : 2;
        const dir = e.currentTarget.dataset.move;
        let left = num(el, "left");
        let top = num(el, "top");

        if (dir === "left") left -= step;
        if (dir === "right") left += step;
        if (dir === "up") top -= step;
        if (dir === "down") top += step;

        el.style.setProperty("left", `${left}%`, "important");
        el.style.setProperty("top", `${top}%`, "important");
        update();
      });
    });

    panel.querySelectorAll("[data-font]").forEach(btn => {
      btn.addEventListener("click", e => {
        const el = selected();
        if (!el) return;

        const font = num(el, "fontSize") || 7;
        const mode = e.currentTarget.dataset.font;
        el.style.setProperty("font-size", `${Math.max(4, font + (mode === "+" ? 1 : -1))}px`, "important");
        update();
      });
    });

    panel.querySelector("#sf-flm-export").addEventListener("click", async () => {
      const data = {};
      keys.forEach(key => {
        const el = labels[key];
        data[key] = {
          text: el.textContent,
          left: el.style.left,
          top: el.style.top,
          fontSize: el.style.fontSize,
          color: el.style.color
        };
      });

      const text = JSON.stringify(data, null, 2);
      console.log("LIV-019 FOH Label Mover export:");
      console.log(text);

      try {
        await rootWin.navigator.clipboard.writeText(text);
        current.textContent = "Copied FOH label JSON.";
      } catch {
        current.textContent = "Copy FOH label JSON from console.";
      }
    });

    panel.querySelector("#sf-flm-close").addEventListener("click", () => {
      Object.values(labels).forEach(el => {
        el.style.outline = "";
        el.style.outlineOffset = "";
      });
      panel.remove();
    });

    update();

    console.log("[Signal Flow] LIV-019 FOH Label Mover installed", VERSION, {
      target: target.name,
      labels: keys.length
    });

    return true;
  }

  function install() {
    const target = findBestTarget();
    if (!target) return false;

    const muted = muteLegacyPlaceholderText(target.layer);
    const added = installFohLabels(target.foh);
    const mover = installMover(target);

    target.layer.dataset.sfLiv019FohLabelFinalizer = VERSION;

    console.log("[Signal Flow] LIV-019 FOH label finalizer applied", {
      version: VERSION,
      target: target.name,
      mutedLegacyLabels: muted,
      fohLabelsAdded: added,
      moverInstalled: mover
    });

    return mover;
  }

  install();

  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (install() || tries > 80) clearInterval(timer);
  }, 250);
})();
