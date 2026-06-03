(function () {
  const VERSION = "sf-live-hitbox-mapper-dev-v1-resize";

  const qs = new URLSearchParams(location.search);
  const levelId =
    qs.get("sfLiveHitboxLevel") ||
    window.sfLiveHitboxLevel ||
    document.querySelector("[data-current-level-id]")?.dataset.currentLevelId ||
    "LIV-021";

  const keyPrefix =
    qs.get("sfLiveHitboxPrefix") ||
    window.sfLiveHitboxPrefix ||
    "";

  const layer =
    document.querySelector(`.sf-live-native-layer.sf-live-native-level-${levelId.toLowerCase()}`) ||
    document.querySelector(".sf-live-native-layer");

  if (!layer) {
    console.warn("[Signal Flow] Live hitbox mapper: no native layer found.", { levelId, keyPrefix });
    return;
  }

  document.querySelectorAll("[data-sf-live-hitbox-dev-handle], [data-sf-live-hitbox-dev-panel]")
    .forEach(el => el.remove());

  const keyOf = n =>
    n.dataset.nodeKey ||
    n.dataset.sfNativeKey ||
    n.getAttribute("data-node-key") ||
    n.getAttribute("data-sf-native-key") ||
    "";

  const px = v => parseFloat(v) || 0;

  const nodes = Array.from(layer.querySelectorAll("[data-node-key], [data-sf-native-key], button.sf-native-node"))
    .filter(n => {
      const k = keyOf(n);
      if (!k) return false;
      if (keyPrefix && !k.startsWith(keyPrefix)) return false;
      return true;
    });

  if (!nodes.length) {
    console.warn("[Signal Flow] Live hitbox mapper: no matching nodes found.", { levelId, keyPrefix });
    return;
  }

  let selected = 0;
  let drag = null;

  function nodeRecord(n) {
    return {
      key: keyOf(n),
      label: n.title || n.getAttribute("aria-label") || "",
      leftPx: px(n.style.left),
      topPx: px(n.style.top),
      widthPx: px(n.style.width),
      heightPx: px(n.style.height)
    };
  }

  function updateCableCenter(n) {
    n.dataset.sfCableCenterX = String(px(n.style.left) + px(n.style.width) / 2);
    n.dataset.sfCableCenterY = String(px(n.style.top) + px(n.style.height) / 2);
    n.dataset.sfNativePointX = n.dataset.sfCableCenterX;
    n.dataset.sfNativePointY = n.dataset.sfCableCenterY;
  }

  const handles = nodes.map((node, index) => {
    const h = document.createElement("div");
    h.dataset.sfLiveHitboxDevHandle = "1";
    h.dataset.index = String(index);
    h.dataset.key = keyOf(node);
    h.title = `${index}: ${keyOf(node)} ${node.title || ""}`;

    h.style.cssText = [
      "position:absolute",
      "left:" + node.style.left,
      "top:" + node.style.top,
      "width:" + node.style.width,
      "height:" + node.style.height,
      "z-index:9500",
      "background:rgba(255,0,0,.28)",
      "outline:2px dashed cyan",
      "cursor:move",
      "pointer-events:auto",
      "border-radius:8px",
      "box-sizing:border-box"
    ].join(";");

    layer.appendChild(h);

    h.addEventListener("pointerdown", e => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      select(index);
      drag = {
        index,
        x: e.clientX,
        y: e.clientY,
        left: px(node.style.left),
        top: px(node.style.top)
      };
      h.setPointerCapture?.(e.pointerId);
    }, true);

    return h;
  });

  const panel = document.createElement("div");
  panel.dataset.sfLiveHitboxDevPanel = "1";
  panel.style.cssText = [
    "position:fixed",
    "right:12px",
    "top:80px",
    "z-index:999999",
    "background:#111",
    "color:white",
    "padding:10px",
    "border:2px solid #ffc400",
    "font:12px monospace",
    "max-width:420px",
    "box-shadow:0 8px 24px rgba(0,0,0,.5)"
  ].join(";");

  panel.innerHTML = `
    <div style="font-weight:bold;margin-bottom:4px">Live Hitbox Mapper</div>
    <div data-meta style="margin-bottom:6px"></div>
    <div data-name style="margin-bottom:6px"></div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px">
      <button data-prev>Prev</button>
      <button data-next>Next</button>
      <button data-export>Export</button>
      <button data-hide>Hide</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-bottom:6px">
      <span></span><button data-move="up">Up</button><span></span>
      <button data-move="left">Left</button><button data-move="down">Down</button><button data-move="right">Right</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px">
      <button data-size="w-">W-</button>
      <button data-size="w+">W+</button>
      <button data-size="h-">H-</button>
      <button data-size="h+">H+</button>
    </div>
    <div style="opacity:.85">
      Drag = move. [/] selects. Arrows move. Shift = 10px.
      Alt/Option + arrows resize. Alt+Shift = 10px resize.
    </div>
  `;

  document.body.appendChild(panel);

  function syncHandle(index) {
    const n = nodes[index];
    const h = handles[index];
    h.style.left = n.style.left;
    h.style.top = n.style.top;
    h.style.width = n.style.width;
    h.style.height = n.style.height;
  }

  function select(index) {
    selected = Math.max(0, Math.min(nodes.length - 1, Number(index) || 0));

    handles.forEach(h => {
      h.style.outline = "2px dashed cyan";
      h.style.background = "rgba(255,0,0,.28)";
    });

    handles[selected].style.outline = "4px solid yellow";
    handles[selected].style.background = "rgba(255,255,0,.45)";

    const r = nodeRecord(nodes[selected]);
    panel.querySelector("[data-meta]").textContent =
      `Level: ${levelId} | Prefix: ${keyPrefix || "(all)"} | Count: ${nodes.length}`;
    panel.querySelector("[data-name]").textContent =
      `${selected}: ${r.key} | X ${r.leftPx} Y ${r.topPx} W ${r.widthPx} H ${r.heightPx}`;
  }

  function move(index, dx, dy) {
    const n = nodes[index];
    n.style.left = px(n.style.left) + dx + "px";
    n.style.top = px(n.style.top) + dy + "px";
    updateCableCenter(n);
    syncHandle(index);
    select(index);
  }

  function resize(index, dw, dh) {
    const n = nodes[index];
    n.style.width = Math.max(4, px(n.style.width) + dw) + "px";
    n.style.height = Math.max(4, px(n.style.height) + dh) + "px";
    updateCableCenter(n);
    syncHandle(index);
    select(index);
  }

  window.addEventListener("pointermove", e => {
    if (!drag) return;
    e.preventDefault();

    const n = nodes[drag.index];
    n.style.left = Math.round(drag.left + e.clientX - drag.x) + "px";
    n.style.top = Math.round(drag.top + e.clientY - drag.y) + "px";

    updateCableCenter(n);
    syncHandle(drag.index);
    select(drag.index);
  }, true);

  window.addEventListener("pointerup", () => {
    drag = null;
  }, true);

  window.addEventListener("keydown", e => {
    if (e.key === "]") {
      e.preventDefault();
      return select((selected + 1) % nodes.length);
    }

    if (e.key === "[") {
      e.preventDefault();
      return select((selected - 1 + nodes.length) % nodes.length);
    }

    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;

    e.preventDefault();
    const step = e.shiftKey ? 10 : 1;

    if (e.altKey) {
      if (e.key === "ArrowLeft") resize(selected, -step, 0);
      if (e.key === "ArrowRight") resize(selected, step, 0);
      if (e.key === "ArrowUp") resize(selected, 0, -step);
      if (e.key === "ArrowDown") resize(selected, 0, step);
      return;
    }

    if (e.key === "ArrowLeft") move(selected, -step, 0);
    if (e.key === "ArrowRight") move(selected, step, 0);
    if (e.key === "ArrowUp") move(selected, 0, -step);
    if (e.key === "ArrowDown") move(selected, 0, step);
  }, true);

  panel.querySelector("[data-prev]").onclick = () => select((selected - 1 + nodes.length) % nodes.length);
  panel.querySelector("[data-next]").onclick = () => select((selected + 1) % nodes.length);
  panel.querySelector("[data-hide]").onclick = () => {
    const hidden = handles[0].style.display !== "none";
    handles.forEach(h => h.style.display = hidden ? "none" : "block");
  };

  panel.querySelectorAll("[data-move]").forEach(btn => {
    btn.onclick = () => {
      const dir = btn.dataset.move;
      if (dir === "up") move(selected, 0, -1);
      if (dir === "down") move(selected, 0, 1);
      if (dir === "left") move(selected, -1, 0);
      if (dir === "right") move(selected, 1, 0);
    };
  });

  panel.querySelectorAll("[data-size]").forEach(btn => {
    btn.onclick = () => {
      const op = btn.dataset.size;
      if (op === "w-") resize(selected, -1, 0);
      if (op === "w+") resize(selected, 1, 0);
      if (op === "h-") resize(selected, 0, -1);
      if (op === "h+") resize(selected, 0, 1);
    };
  });

  window.sfLiveHitboxMapperDev = {
    version: VERSION,
    levelId,
    keyPrefix,
    count: nodes.length,
    select,
    moveSelected(dx, dy) { move(selected, Number(dx) || 0, Number(dy) || 0); },
    resizeSelected(dw, dh) { resize(selected, Number(dw) || 0, Number(dh) || 0); },
    export() {
      const data = nodes.map(nodeRecord);
      window.__sfLiveHitboxMapperExport = data;
      console.log(JSON.stringify(data, null, 2));
      return data;
    },
    destroy() {
      handles.forEach(h => h.remove());
      panel.remove();
      delete window.sfLiveHitboxMapperDev;
    }
  };

  panel.querySelector("[data-export]").onclick = () => window.sfLiveHitboxMapperDev.export();

  select(0);
  console.log("[Signal Flow] Live hitbox mapper loaded", VERSION, {
    levelId,
    keyPrefix,
    count: nodes.length
  });
})();
