(() => {
  const VERSION = "v6r390b-generic";

  function docsToScan() {
    const docs = [{ name: "top", doc: document }];
    document.querySelectorAll("iframe").forEach((frame, i) => {
      try {
        if (frame.contentDocument) docs.push({ name: `iframe-${i}`, doc: frame.contentDocument });
      } catch {}
    });
    return docs;
  }

  function num(el, prop) {
    const raw = el.style[prop] || el.ownerDocument.defaultView.getComputedStyle(el)[prop] || "0";
    return parseFloat(raw) || 0;
  }

  function unitOf(el, prop, fallback = "%") {
    const raw = el.style[prop] || el.ownerDocument.defaultView.getComputedStyle(el)[prop] || "";
    return String(raw).includes("px") ? "px" : fallback;
  }

  function cleanKeyText(text) {
    return String(text || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "blank";
  }

  function collectOverlays(layer) {
    const overlays = {};
    const gearEls = Array.from(layer.querySelectorAll("[data-liv019-gear-key]"));

    gearEls.forEach(gear => {
      const gearKey = gear.dataset.liv019GearKey || "gear";
      const children = Array.from(gear.querySelectorAll("div"));
      let count = 0;

      children.forEach(el => {
        const cs = el.ownerDocument.defaultView.getComputedStyle(el);
        const text = String(el.textContent || "").trim();
        const isLedFrame = el.classList.contains("sf-liv019-processor-display-frame-recolor");
        const isMovableLabel = cs.position === "absolute" && text && !el.closest(".sf-liv019-processor-display-frame-recolor");

        if (!isLedFrame && !isMovableLabel) return;

        count += 1;
        const kind = isLedFrame ? "led-frame" : "label";
        const base = isLedFrame ? "led-frame" : cleanKeyText(text);
        const key = `${gearKey}-${kind}-${base}-${count}`;

        el.dataset.sfLiv019OverlayMoverKey = key;
        el.dataset.sfLiv019OverlayMoverKind = kind;
        overlays[key] = el;
      });
    });

    return overlays;
  }

  function install(docName, doc, layer) {
    if (doc.querySelector("#sf-liv019-overlay-mover")) return true;

    const overlays = collectOverlays(layer);
    const keys = Object.keys(overlays).sort();

    if (!keys.length) {
      console.warn("[Signal Flow] LIV-019 Overlay Mover found no overlay labels/frames yet.");
      return false;
    }

    let selectedKey = keys[0];

    const panel = doc.createElement("div");
    panel.id = "sf-liv019-overlay-mover";
    panel.style.cssText = [
      "position:fixed",
      "left:16px",
      "bottom:16px",
      "z-index:999999",
      "width:470px",
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
      '<div style="font-size:14px;margin-bottom:8px;">LIV-019/020 Overlay Mover</div>',
      '<div id="sf-lom-current" style="margin-bottom:8px;color:white;"></div>',
      '<select id="sf-lom-select" style="width:100%;margin-bottom:8px;"></select>',
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px;">',
      '<span></span><button data-move="up">Up</button><span></span>',
      '<button data-move="left">Left</button><button data-move="down">Down</button><button data-move="right">Right</button>',
      '</div>',
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">',
      '<button data-size="w-">Width -</button>',
      '<button data-size="w+">Width +</button>',
      '<button data-size="h-">Height -</button>',
      '<button data-size="h+">Height +</button>',
      '<button data-font="-">Font -</button>',
      '<button data-font="+">Font +</button>',
      '</div>',
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">',
      '<button id="sf-lom-refresh">Refresh targets</button>',
      '<button id="sf-lom-export">Export JSON</button>',
      '<button id="sf-lom-close">Close</button>',
      '</div>',
      '<div style="font-size:11px;color:white;line-height:1.35;">Normal move step: 0.5%. Hold Shift for 0.1%. Font step is 1px.</div>'
    ].join("");

    doc.body.appendChild(panel);

    const select = panel.querySelector("#sf-lom-select");
    const current = panel.querySelector("#sf-lom-current");

    function refillSelect() {
      select.innerHTML = "";
      keys.forEach(key => {
        const opt = doc.createElement("option");
        opt.value = key;
        opt.textContent = key;
        select.appendChild(opt);
      });
      select.value = selectedKey;
    }

    function selected() {
      return overlays[selectedKey];
    }

    function setWithExistingUnit(el, prop, value) {
      const unit = unitOf(el, prop, "%");
      el.style.setProperty(prop, `${value}${unit}`, "important");
    }

    function update() {
      Object.values(overlays).forEach(el => {
        el.style.outline = "";
        el.style.outlineOffset = "";
      });

      const el = selected();
      if (!el) {
        current.textContent = "No selected overlay.";
        return;
      }

      el.style.outline = "2px solid #ff3b30";
      el.style.outlineOffset = "2px";

      current.textContent =
        `${selectedKey}: left ${el.style.left || "?"}, top ${el.style.top || "?"}, ` +
        `width ${el.style.width || el.style.minWidth || "?"}, height ${el.style.height || "auto"}, ` +
        `font ${el.style.fontSize || "?"}`;
    }

    refillSelect();

    select.addEventListener("change", e => {
      selectedKey = e.target.value;
      update();
    });

    panel.querySelectorAll("[data-move]").forEach(btn => {
      btn.addEventListener("click", e => {
        const el = selected();
        if (!el) return;

        const step = e.shiftKey ? 0.1 : 0.5;
        const dir = e.currentTarget.dataset.move;

        let left = num(el, "left");
        let top = num(el, "top");

        if (dir === "left") left -= step;
        if (dir === "right") left += step;
        if (dir === "up") top -= step;
        if (dir === "down") top += step;

        setWithExistingUnit(el, "left", left);
        setWithExistingUnit(el, "top", top);
        update();
      });
    });

    panel.querySelectorAll("[data-size]").forEach(btn => {
      btn.addEventListener("click", e => {
        const el = selected();
        if (!el) return;

        const step = e.shiftKey ? 0.1 : 0.5;
        const mode = e.currentTarget.dataset.size;

        if (mode === "w-" || mode === "w+") {
          if (el.style.width) {
            setWithExistingUnit(el, "width", Math.max(1, num(el, "width") + (mode === "w+" ? step : -step)));
          } else {
            const pxStep = e.shiftKey ? 1 : 5;
            const currentWidth = num(el, "minWidth") || 40;
            el.style.setProperty("min-width", `${Math.max(4, currentWidth + (mode === "w+" ? pxStep : -pxStep))}px`, "important");
          }
        }

        if (mode === "h-" || mode === "h+") {
          if (!el.style.height) el.style.setProperty("height", "8%", "important");
          setWithExistingUnit(el, "height", Math.max(1, num(el, "height") + (mode === "h+" ? step : -step)));
        }

        update();
      });
    });

    panel.querySelectorAll("[data-font]").forEach(btn => {
      btn.addEventListener("click", e => {
        const el = selected();
        if (!el) return;

        const font = num(el, "fontSize") || 9;
        const mode = e.currentTarget.dataset.font;
        el.style.setProperty("font-size", `${Math.max(5, font + (mode === "+" ? 1 : -1))}px`, "important");
        update();
      });
    });

    panel.querySelector("#sf-lom-refresh").addEventListener("click", () => {
      panel.remove();
      install(docName, doc, layer);
    });

    panel.querySelector("#sf-lom-export").addEventListener("click", async () => {
      const data = {};
      keys.forEach(key => {
        const el = overlays[key];
        const parentGear = el.closest("[data-liv019-gear-key]");
        data[key] = {
          parent: parentGear ? parentGear.dataset.liv019GearKey : null,
          kind: el.dataset.sfLiv019OverlayMoverKind || "",
          text: String(el.textContent || "").trim(),
          left: el.style.left || "",
          top: el.style.top || "",
          width: el.style.width || "",
          minWidth: el.style.minWidth || "",
          height: el.style.height || "",
          fontSize: el.style.fontSize || "",
          color: el.style.color || "",
          background: el.style.background || ""
        };
      });

      const text = JSON.stringify(data, null, 2);
      console.log("LIV-019 Overlay Mover export:");
      console.log(text);

      try {
        await doc.defaultView.navigator.clipboard.writeText(text);
        current.textContent = "Copied overlay JSON to clipboard.";
      } catch {
        current.textContent = "Copy overlay JSON from console.";
      }
    });

    panel.querySelector("#sf-lom-close").addEventListener("click", () => {
      Object.values(overlays).forEach(el => {
        el.style.outline = "";
        el.style.outlineOffset = "";
      });
      panel.remove();
    });

    update();
    console.log("[Signal Flow] LIV-019 Overlay Mover installed", VERSION, docName, { targets: keys.length });
    return true;
  }

  function scan() {
    for (const item of docsToScan()) {
      const layer = item.doc.querySelector(".sf-live-native-layer.sf-live-native-level-liv-019, .sf-live-native-layer.sf-live-native-level-liv-020");
      if (layer) return install(item.name, item.doc, layer);
    }
    return false;
  }

  console.log("[Signal Flow] LIV-019 Overlay Mover dev script loaded", VERSION);

  scan();
  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (scan() || tries > 100) clearInterval(timer);
  }, 250);
})();
