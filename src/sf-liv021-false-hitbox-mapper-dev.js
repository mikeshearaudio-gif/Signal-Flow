(function () {
  const VERSION = "liv021-false-fast-drag-v1";
  const layer = document.querySelector(".sf-live-native-layer.sf-live-native-level-liv-021");
  if (!layer) return console.warn("[Signal Flow] LIV-021 false mapper: no native layer.");

  document.querySelectorAll("[data-sf-liv021-false-dev-handle], [data-sf-liv021-false-dev-panel]").forEach(el => el.remove());

  const nodes = Array.from(layer.querySelectorAll("button.sf-native-liv021-hitbox")).filter(n => {
    const key = n.dataset.nodeKey || n.dataset.sfNativeKey || n.getAttribute("data-node-key") || n.getAttribute("data-sf-native-key") || "";
    return key.startsWith("liv021-false-");
  });

  const keyOf = n => n.dataset.nodeKey || n.dataset.sfNativeKey || n.getAttribute("data-node-key") || n.getAttribute("data-sf-native-key") || "";
  const px = v => parseFloat(v) || 0;

  if (!nodes.length) return console.warn("[Signal Flow] LIV-021 false mapper: no false nodes found.");

  let selected = 0;
  let drag = null;

  const handles = nodes.map((node, index) => {
    const h = document.createElement("div");
    h.dataset.sfLiv021FalseDevHandle = "1";
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
      "border-radius:8px"
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
  panel.dataset.sfLiv021FalseDevPanel = "1";
  panel.style.cssText = "position:fixed;right:12px;top:80px;z-index:999999;background:#111;color:white;padding:10px;border:2px solid #ffc400;font:12px monospace;max-width:360px";
  panel.innerHTML = '<div data-name style="margin-bottom:6px"></div><button data-prev>Prev</button> <button data-next>Next</button> <button data-export>Export</button><div style="margin-top:6px">Drag handles. [/] selects. Arrows nudge. Shift+arrows = 10px.</div>';
  document.body.appendChild(panel);

  function syncHandle(index) {
    const n = nodes[index], h = handles[index];
    h.style.left = n.style.left;
    h.style.top = n.style.top;
    h.style.width = n.style.width;
    h.style.height = n.style.height;
  }

  function select(index) {
    selected = Math.max(0, Math.min(nodes.length - 1, index));
    handles.forEach(h => {
      h.style.outline = "2px dashed cyan";
      h.style.background = "rgba(255,0,0,.28)";
    });
    handles[selected].style.outline = "4px solid yellow";
    handles[selected].style.background = "rgba(255,255,0,.45)";
    panel.querySelector("[data-name]").textContent =
      `${selected}: ${keyOf(nodes[selected])} pos ${nodes[selected].style.left}, ${nodes[selected].style.top} size ${nodes[selected].style.width} x ${nodes[selected].style.height}`;
  }

  function move(index, dx, dy) {
    const n = nodes[index];
    n.style.left = px(n.style.left) + dx + "px";
    n.style.top = px(n.style.top) + dy + "px";
    n.dataset.sfCableCenterX = String(px(n.style.left) + px(n.style.width) / 2);
    n.dataset.sfCableCenterY = String(px(n.style.top) + px(n.style.height) / 2);
    syncHandle(index);
    select(index);
  }

  window.addEventListener("pointermove", e => {
    if (!drag) return;
    e.preventDefault();
    const n = nodes[drag.index];
    n.style.left = Math.round(drag.left + e.clientX - drag.x) + "px";
    n.style.top = Math.round(drag.top + e.clientY - drag.y) + "px";
    n.dataset.sfCableCenterX = String(px(n.style.left) + px(n.style.width) / 2);
    n.dataset.sfCableCenterY = String(px(n.style.top) + px(n.style.height) / 2);
    syncHandle(drag.index);
    select(drag.index);
  }, true);

  window.addEventListener("pointerup", () => { drag = null; }, true);

  window.addEventListener("keydown", e => {
    if (e.key === "]") { e.preventDefault(); return select((selected + 1) % nodes.length); }
    if (e.key === "[") { e.preventDefault(); return select((selected - 1 + nodes.length) % nodes.length); }
    if (!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    const step = e.shiftKey ? 10 : 1;
    if (e.altKey) {
      const n = nodes[selected];
      if (e.key === "ArrowLeft") n.style.width = Math.max(4, px(n.style.width) - step) + "px";
      if (e.key === "ArrowRight") n.style.width = Math.max(4, px(n.style.width) + step) + "px";
      if (e.key === "ArrowUp") n.style.height = Math.max(4, px(n.style.height) - step) + "px";
      if (e.key === "ArrowDown") n.style.height = Math.max(4, px(n.style.height) + step) + "px";
      syncHandle(selected);
      select(selected);
      return;
    }

    if (e.key === "ArrowLeft") move(selected, -step, 0);
    if (e.key === "ArrowRight") move(selected, step, 0);
    if (e.key === "ArrowUp") move(selected, 0, -step);
    if (e.key === "ArrowDown") move(selected, 0, step);
  }, true);

  window.sfLiv021FalseHitboxDev = {
    select,
    export() {
      const data = nodes.map(n => ({
        key: keyOf(n),
        label: n.title,
        leftPx: px(n.style.left),
        topPx: px(n.style.top),
        widthPx: px(n.style.width),
        heightPx: px(n.style.height)
      }));
      window.__sfLiv021FalseHitboxExport = data;
      console.log(JSON.stringify(data, null, 2));
      return data;
    }
  };

  panel.querySelector("[data-prev]").onclick = () => select((selected - 1 + nodes.length) % nodes.length);
  panel.querySelector("[data-next]").onclick = () => select((selected + 1) % nodes.length);
  panel.querySelector("[data-export]").onclick = () => window.sfLiv021FalseHitboxDev.export();

  select(0);
  console.log("[Signal Flow] LIV-021 false hitbox fast mapper loaded", VERSION, { count: nodes.length });
})();
