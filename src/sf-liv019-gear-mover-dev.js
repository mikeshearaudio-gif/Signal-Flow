(() => {
  const VERSION = "v6r384-dev";

  function docsToScan() {
    const docs = [{ name: "top", doc: document }];
    document.querySelectorAll("iframe").forEach((frame, i) => {
      try {
        if (frame.contentDocument) docs.push({ name: `iframe-${i}`, doc: frame.contentDocument });
      } catch {}
    });
    return docs;
  }

  function px(el, prop) {
    const raw = el.style[prop] || el.ownerDocument.defaultView.getComputedStyle(el)[prop] || "0";
    return parseFloat(raw) || 0;
  }

  function install(docName, doc, layer) {
    if (doc.querySelector("#sf-liv019-gear-mover")) return true;

    const gear = {};
    layer.querySelectorAll("[data-liv019-gear-key]").forEach(el => {
      gear[el.dataset.liv019GearKey] = el;
    });

    const keys = ["stagebox", "foh", "drum", "iem1", "iem2", "iem3", "reverb", "delay"];
    let selectedKey = keys.find(k => gear[k]) || null;

    const panel = doc.createElement("div");
    panel.id = "sf-liv019-gear-mover";
    panel.style.cssText = [
      "position:fixed",
      "right:16px",
      "bottom:16px",
      "z-index:999999",
      "width:430px",
      "background:#111",
      "color:#ffd84a",
      "border:2px solid #ffd84a",
      "border-radius:12px",
      "padding:12px",
      "font:700 12px system-ui,sans-serif"
    ].join(";");

    panel.innerHTML = [
      '<div style="font-size:14px;margin-bottom:8px;">LIV-019/020 Gear Mover</div>',
      '<div id="sf-lgm-current" style="margin-bottom:8px;color:white;"></div>',
      '<div id="sf-lgm-selects" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;"></div>',
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px;">',
      '<span></span><button data-move="up">Up</button><span></span>',
      '<button data-move="left">Left</button><button data-move="down">Down</button><button data-move="right">Right</button>',
      '</div>',
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">',
      '<button data-size="w-">Width -</button>',
      '<button data-size="w+">Width +</button>',
      '<button data-z="-">Layer -</button>',
      '<button data-z="+">Layer +</button>',
      '</div>',
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">',
      '<button id="sf-lgm-hide-nodes">Hide hitboxes</button>',
      '<button id="sf-lgm-show-nodes">Show hitboxes</button>',
      '<button id="sf-lgm-export">Export JSON</button>',
      '<button id="sf-lgm-close">Close</button>',
      '</div>',
      '<div style="font-size:11px;color:white;line-height:1.35;">Hold Shift for 1px / 1-width steps. Normal step is 10px.<br>Export JSON when gear placement looks right.</div>'
    ].join("");

    doc.body.appendChild(panel);

    const selectWrap = panel.querySelector("#sf-lgm-selects");
    keys.forEach(key => {
      const btn = doc.createElement("button");
      btn.textContent = key;
      btn.dataset.select = key;
      selectWrap.appendChild(btn);
    });

    const current = panel.querySelector("#sf-lgm-current");

    function selected() {
      return selectedKey ? gear[selectedKey] : null;
    }

    function update() {
      Object.values(gear).forEach(el => {
        el.style.outline = "";
        el.style.outlineOffset = "";
      });

      const el = selected();
      if (!el) {
        current.textContent = "No selected gear.";
        return;
      }

      el.style.outline = "2px solid #ff3b30";
      el.style.outlineOffset = "3px";

      current.textContent =
        `${selectedKey}: x ${Math.round(px(el, "left"))}, y ${Math.round(px(el, "top"))}, ` +
        `w ${Math.round(px(el, "width"))}, z ${Math.round(px(el, "zIndex"))}`;
    }

    panel.querySelectorAll("[data-select]").forEach(btn => {
      btn.addEventListener("click", e => {
        selectedKey = e.currentTarget.dataset.select;
        update();
      });
    });

    panel.querySelectorAll("[data-move]").forEach(btn => {
      btn.addEventListener("click", e => {
        const el = selected();
        if (!el) return;

        const step = e.shiftKey ? 1 : 10;
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

        const step = e.shiftKey ? 1 : 10;
        const mode = e.currentTarget.dataset.size;
        let width = px(el, "width");

        if (mode === "w-") width -= step;
        if (mode === "w+") width += step;

        el.style.setProperty("width", `${Math.max(40, width)}px`, "important");
        update();
      });
    });

    panel.querySelectorAll("[data-z]").forEach(btn => {
      btn.addEventListener("click", e => {
        const el = selected();
        if (!el) return;

        const step = e.shiftKey ? 1 : 10;
        const mode = e.currentTarget.dataset.z;
        let z = px(el, "zIndex") || 50;

        if (mode === "-") z -= step;
        if (mode === "+") z += step;

        el.style.setProperty("z-index", `${Math.max(1, z)}`, "important");
        update();
      });
    });

    panel.querySelector("#sf-lgm-hide-nodes").addEventListener("click", () => {
      layer.querySelectorAll(".sf-native-node").forEach(el => {
        el.dataset.sfLiv019OldDisplay = el.style.display || "";
        el.style.setProperty("display", "none", "important");
      });
    });

    panel.querySelector("#sf-lgm-show-nodes").addEventListener("click", () => {
      layer.querySelectorAll(".sf-native-node").forEach(el => {
        el.style.display = el.dataset.sfLiv019OldDisplay || "";
      });
    });

    panel.querySelector("#sf-lgm-export").addEventListener("click", async () => {
      const data = {};
      keys.forEach(key => {
        const el = gear[key];
        if (!el) return;
        data[key] = {
          x: Math.round(px(el, "left")),
          y: Math.round(px(el, "top")),
          w: Math.round(px(el, "width")),
          z: Math.round(px(el, "zIndex"))
        };
      });

      const text = JSON.stringify(data, null, 2);
      console.log("LIV-019 Corrected Gear Mover export:");
      console.log(text);

      try {
        await doc.defaultView.navigator.clipboard.writeText(text);
        current.textContent = "Copied gear JSON to clipboard.";
      } catch {
        current.textContent = "Copy gear JSON from console.";
      }
    });

    panel.querySelector("#sf-lgm-close").addEventListener("click", () => {
      Object.values(gear).forEach(el => {
        el.style.outline = "";
        el.style.outlineOffset = "";
      });
      panel.remove();
    });

    update();
    console.log("[Signal Flow] LIV-019 Gear Mover installed", VERSION, docName);
    return true;
  }

  function scan() {
    for (const item of docsToScan()) {
      const layer = item.doc.querySelector(".sf-live-native-layer.sf-live-native-level-liv-019, .sf-live-native-layer.sf-live-native-level-liv-020");
      if (layer) return install(item.name, item.doc, layer);
    }
    return false;
  }

  console.log("[Signal Flow] LIV-019 Gear Mover dev script loaded", VERSION);

  scan();
  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (scan() || tries > 80) clearInterval(timer);
  }, 250);
})();
