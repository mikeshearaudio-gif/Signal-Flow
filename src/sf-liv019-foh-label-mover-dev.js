(() => {
  const VERSION = "v6r399-dev";

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

  function install(docName, doc, layer) {
    if (doc.querySelector("#sf-liv019-foh-label-mover")) return true;

    const labels = {};
    layer.querySelectorAll("[data-liv019-foh-label]").forEach(el => {
      labels[el.dataset.liv019FohLabel] = el;
    });

    const keys = Object.keys(labels).sort();
    if (!keys.length) return false;

    let selectedKey = keys[0];

    const panel = doc.createElement("div");
    panel.id = "sf-liv019-foh-label-mover";
    panel.style.cssText = [
      "position:fixed",
      "left:16px",
      "bottom:16px",
      "z-index:999999",
      "width:430px",
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
      '<div style="font-size:14px;margin-bottom:8px;">LIV-019 FOH Label Mover</div>',
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
      '<div style="font-size:11px;color:white;line-height:1.35;">Move step: 0.5%. Hold Shift for 0.1%. Font step is 1px.</div>'
    ].join("");

    doc.body.appendChild(panel);

    const select = panel.querySelector("#sf-flm-select");
    const current = panel.querySelector("#sf-flm-current");

    keys.forEach(key => {
      const opt = doc.createElement("option");
      opt.value = key;
      opt.textContent = key;
      select.appendChild(opt);
    });

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
        current.textContent = "No label selected.";
        return;
      }

      el.style.outline = "2px solid #ff3b30";
      el.style.outlineOffset = "2px";
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

        const step = e.shiftKey ? 0.1 : 0.5;
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
        await doc.defaultView.navigator.clipboard.writeText(text);
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
    console.log("[Signal Flow] LIV-019 FOH Label Mover installed", VERSION, docName, { targets: keys.length });
    return true;
  }

  function scan() {
    for (const item of docsToScan()) {
      const layer = item.doc.querySelector(".sf-live-native-layer.sf-live-native-level-liv-019");
      if (layer && install(item.name, item.doc, layer)) return true;
    }
    return false;
  }

  console.log("[Signal Flow] LIV-019 FOH Label Mover loaded", VERSION);

  scan();
  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (scan() || tries > 100) clearInterval(timer);
  }, 250);
})();
