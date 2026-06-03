(() => {
  const VERSION = "liv021-good-hitbox-mapper-v2";
  const GOOD_KEYS = [
    "lead-vocal-mic",
    "liv021-stagebox-input-1",
    "liv021-ch1-insert-send",
    "liv021-compressor-input",
    "liv021-compressor-output",
    "liv021-ch1-insert-return",
    "liv021-aux-1-output",
    "liv021-vocal-wedge-amp-input",
    "liv021-vocal-wedge-amp-output",
    "liv021-vocal-wedge-input",
    "liv021-main-left-output",
    "liv021-main-right-output",
    "liv021-system-processor-left-input",
    "liv021-system-processor-right-input",
    "liv021-system-processor-left-output",
    "liv021-system-processor-right-output",
    "liv021-main-amp-left-input",
    "liv021-main-amp-right-input"
  ];

  const layer = document.querySelector(".sf-live-native-layer.sf-live-native-level-liv-021") ||
                document.querySelector(".sf-live-native-layer");

  if (!layer) return console.warn("[Signal Flow] LIV-021 good mapper: no native layer found.");

  document.querySelectorAll("[data-sf-liv021-good-dev-handle], [data-sf-liv021-good-dev-panel]").forEach(el => el.remove());

  const keyOf = n => n.dataset.nodeKey || n.dataset.sfNativeKey || n.getAttribute("data-node-key") || "";
  const px = v => parseFloat(v) || 0;

  const nodes = GOOD_KEYS
    .map(key => document.querySelector(`[data-node-key="${key}"], [data-sf-native-key="${key}"]`))
    .filter(Boolean);

  if (!nodes.length) return console.warn("[Signal Flow] LIV-021 good mapper: no good nodes found.");

  let selected = 0;
  let drag = null;

  function record(n) {
    return {
      key: keyOf(n),
      label: n.title || n.getAttribute("aria-label") || "",
      leftPx: px(n.style.left),
      topPx: px(n.style.top),
      widthPx: px(n.style.width),
      heightPx: px(n.style.height)
    };
  }

  function syncNode(n) {
    n.dataset.sfCableCenterX = String(px(n.style.left) + px(n.style.width) / 2);
    n.dataset.sfCableCenterY = String(px(n.style.top) + px(n.style.height) / 2);
    n.dataset.sfNativePointX = n.dataset.sfCableCenterX;
    n.dataset.sfNativePointY = n.dataset.sfCableCenterY;
  }

  const handles = nodes.map((n, i) => {
    const h = document.createElement("div");
    h.dataset.sfLiv021GoodDevHandle = "1";
    h.dataset.key = keyOf(n);
    h.style.cssText = [
      "position:absolute",
      "left:" + n.style.left,
      "top:" + n.style.top,
      "width:" + n.style.width,
      "height:" + n.style.height,
      "z-index:9900",
      "background:rgba(255,210,95,.25)",
      "outline:2px dashed #00e5ff",
      "border-radius:8px",
      "box-sizing:border-box",
      "cursor:move",
      "pointer-events:auto"
    ].join(";");

    h.addEventListener("pointerdown", e => {
      e.preventDefault();
      e.stopPropagation();
      select(i);
      drag = { i, x: e.clientX, y: e.clientY, left: px(n.style.left), top: px(n.style.top) };
      h.setPointerCapture?.(e.pointerId);
    }, true);

    layer.appendChild(h);
    return h;
  });

  const panel = document.createElement("div");
  panel.dataset.sfLiv021GoodDevPanel = "1";
  panel.style.cssText = "position:fixed;right:12px;top:90px;z-index:999999;background:#111;color:white;padding:10px;border:2px solid #ffc400;font:12px monospace;max-width:420px";
  panel.innerHTML = `
    <div data-info style="margin-bottom:8px"></div>
    <button data-prev>Prev</button>
    <button data-next>Next</button>
    <button data-export>Export</button>
    <button data-hide>Hide</button>
    <div style="margin-top:8px">Drag handles. [/] select. Arrows move. Shift=10px. Alt/Option+arrows resize.</div>
  `;
  document.body.appendChild(panel);

  function syncHandle(i) {
    const n = nodes[i], h = handles[i];
    h.style.left = n.style.left;
    h.style.top = n.style.top;
    h.style.width = n.style.width;
    h.style.height = n.style.height;
  }

  function select(i) {
    selected = (i + nodes.length) % nodes.length;
    handles.forEach(h => {
      h.style.outline = "2px dashed #00e5ff";
      h.style.background = "rgba(255,210,95,.25)";
    });
    handles[selected].style.outline = "4px solid yellow";
    handles[selected].style.background = "rgba(255,255,0,.45)";
    const r = record(nodes[selected]);
    panel.querySelector("[data-info]").textContent = `${selected}: ${r.key} pos ${r.leftPx}, ${r.topPx} size ${r.widthPx} x ${r.heightPx}`;
  }

  function move(i, dx, dy) {
    const n = nodes[i];
    n.style.left = px(n.style.left) + dx + "px";
    n.style.top = px(n.style.top) + dy + "px";
    syncNode(n);
    syncHandle(i);
    select(i);
  }

  function resize(i, dw, dh) {
    const n = nodes[i];
    n.style.width = Math.max(4, px(n.style.width) + dw) + "px";
    n.style.height = Math.max(4, px(n.style.height) + dh) + "px";
    syncNode(n);
    syncHandle(i);
    select(i);
  }

  window.addEventListener("pointermove", e => {
    if (!drag) return;
    const n = nodes[drag.i];
    n.style.left = Math.round(drag.left + e.clientX - drag.x) + "px";
    n.style.top = Math.round(drag.top + e.clientY - drag.y) + "px";
    syncNode(n);
    syncHandle(drag.i);
    select(drag.i);
  }, true);

  window.addEventListener("pointerup", () => { drag = null; }, true);

  window.addEventListener("keydown", e => {
    if (e.key === "]") { e.preventDefault(); return select(selected + 1); }
    if (e.key === "[") { e.preventDefault(); return select(selected - 1); }
    if (!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)) return;

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

  panel.querySelector("[data-prev]").onclick = () => select(selected - 1);
  panel.querySelector("[data-next]").onclick = () => select(selected + 1);
  panel.querySelector("[data-hide]").onclick = () => {
    const hide = handles[0].style.display !== "none";
    handles.forEach(h => h.style.display = hide ? "none" : "block");
  };

  window.sfLiv021GoodHitboxDev = {
    export() {
      const data = nodes.map(record);
      console.log(JSON.stringify(data, null, 2));
      return data;
    }
  };

  panel.querySelector("[data-export]").onclick = () => window.sfLiv021GoodHitboxDev.export();

  select(0);
  console.log("[Signal Flow] LIV-021 good hitbox mapper loaded", VERSION, { count: nodes.length });
})();
