(() => {
  const VERSION = "liv023-gear-mover-scroll-wrapper-v1";

  const ASSET = p => "../" + p.replace(/^\/+/, "");

  const GEAR = [
    ["liv023-monitor-console", "Monitor Console", "assets/live-sound/svg/hardware/Monitor_Console.svg", -10, -178, 880],
    ["liv023-lead-vocal-mic", "Lead Vocal Mic", "assets/live-sound/svg/hardware/mic nbg.svg", 13, 337, 240],
    ["liv023-keyboard", "Keyboard", "assets/live-sound/svg/hardware/keys.svg", 208, 330, 300],
    ["liv023-stagebox-8", "8 Input Stage Box", "assets/live-sound/svg/hardware/stagebox-snake-head.svg", 16, 210, 360],
    ["liv023-vocal-compressor", "Vocal Compressor", "assets/live-sound/svg/hardware/power-amp-liv007-main-system.svg", 498, 214, 300],
    ["liv023-iem-a", "IEM Transmitter A", "assets/live-sound/svg/hardware/iem-transmitter-liv003-game-style.svg", 470, 318, 360],
    ["liv023-crossover", "Stereo 3-Way Crossover", "assets/live-sound/svg/hardware/crossover-liv010-3way.svg", 440, 419, 420],
    ["liv023-high-amp", "High Amp", "assets/live-sound/svg/hardware/power-amp-liv010-high.svg", 455, 530, 400],
    ["liv023-mid-amp", "Mid Amp", "assets/live-sound/svg/hardware/power-amp-liv010-mid.svg", 455, 627, 400],
    ["liv023-low-amp", "Low Amp", "assets/live-sound/svg/hardware/power-amp-liv010-low.svg", 454, 727, 400],
    ["liv023-normal-cable-01", "Normalization Cable 1", "assets/live-sound/svg/cables/single-one-end-raised.svg", 702, 681, 82],
    ["liv023-normal-cable-02", "Normalization Cable 2", "assets/live-sound/svg/cables/single-one-end-raised.svg", 695, 782, 92],
    ["liv023-normal-cable-03", "Normalization Cable 3", "assets/live-sound/svg/cables/single-one-end-raised.svg", -102, 66, 220],
    ["liv023-normal-cable-04", "Normalization Cable 4", "assets/live-sound/svg/cables/single-one-end-raised.svg", -9, 66, 182],
    ["liv023-normal-cable-05", "Normalization Cable 5", "assets/live-sound/svg/cables/single-one-end-raised.svg", 3, 61, 232],
    ["liv023-normal-cable-06", "Normalization Cable 6", "assets/live-sound/svg/cables/single-one-end-raised.svg", 660, 585, 82],
    ["liv023-normal-cable-07", "Normalization Cable 7", "assets/live-sound/svg/cables/single-one-end-raised.svg", 706, 585, 82],
    ["liv023-normal-cable-08", "Normalization Cable 8", "assets/live-sound/svg/cables/single-one-end-raised.svg", 663, 680, 82]
  ].map(([key, label, src, leftPx, topPx, widthPx]) => ({
    key, label, src: ASSET(src), leftPx, topPx, widthPx
  }));

  const mount = document.querySelector("#patchbay");
  if (!mount) return console.warn("[Signal Flow] LIV-023 gear dev: #patchbay not found.");

  document.querySelectorAll("[data-sf-liv023-gear-dev-root], [data-sf-liv023-gear-dev-panel]").forEach(el => el.remove());

  const root = document.createElement("div");
  root.dataset.sfLiv023GearDevRoot = "1";
  root.style.cssText = [
    "position:absolute",
    "inset:0",
    "z-index:9990",
    "background:rgba(0,0,0,.35)",
    "pointer-events:auto",
    "overflow:auto",
    "border:2px solid rgba(245,197,66,.75)",
    "box-sizing:border-box"
  ].join(";");

  const board = document.createElement("div");
  board.dataset.sfLiv023GearDevBoard = "1";
  board.style.cssText = [
    "position:relative",
    "width:1400px",
    "height:1500px",
    "background:rgba(0,20,14,.25)",
    "background-image:radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px)",
    "background-size:24px 24px"
  ].join(";");

  mount.style.position = mount.style.position || "relative";
  mount.appendChild(root);
  root.appendChild(board);

  const px = v => parseFloat(v) || 0;
  let selected = 0;
  let drag = null;

  const items = GEAR.map((g, i) => {
    const wrap = document.createElement("div");
    wrap.dataset.sfLiv023GearKey = g.key;
    wrap.dataset.sfLiv023GearLabel = g.label;
    wrap.style.cssText = [
      "position:absolute",
      "left:" + g.leftPx + "px",
      "top:" + g.topPx + "px",
      "width:" + g.widthPx + "px",
      "height:auto",
      "cursor:move",
      "outline:2px dashed rgba(0,229,255,.7)",
      "box-sizing:border-box",
      "user-select:none"
    ].join(";");

    const img = document.createElement("img");
    img.src = g.src;
    img.alt = g.label;
    img.style.cssText = "display:block;width:100%;height:auto;pointer-events:none;filter:drop-shadow(0 10px 18px rgba(0,0,0,.65));";

    wrap.appendChild(img);
    board.appendChild(wrap);

    wrap.addEventListener("pointerdown", e => {
      e.preventDefault();
      e.stopPropagation();
      select(i);
      drag = { i, x: e.clientX, y: e.clientY, left: px(wrap.style.left), top: px(wrap.style.top) };
      wrap.setPointerCapture?.(e.pointerId);
    }, true);

    return wrap;
  });

  const panel = document.createElement("div");
  panel.dataset.sfLiv023GearDevPanel = "1";
  panel.style.cssText = "position:fixed;right:12px;top:88px;z-index:999999;background:#111;color:white;border:2px solid #f5c542;padding:10px;font:12px monospace;max-width:430px";
  panel.innerHTML = `
    <div data-info style="margin-bottom:8px"></div>
    <button data-prev>Prev</button>
    <button data-next>Next</button>
    <button data-export>Download JSON</button>
    <button data-close>Close</button>
    <div style="margin-top:8px;line-height:1.45">
      Scroll inside the board.<br>
      Drag gear to move.<br>
      [ and ] select.<br>
      Arrows move. Shift+arrows = 10px.<br>
      Alt/Option+Left/Right resizes width.
    </div>
  `;
  document.body.appendChild(panel);

  function record(el) {
    return {
      key: el.dataset.sfLiv023GearKey,
      label: el.dataset.sfLiv023GearLabel,
      leftPx: Math.round(px(el.style.left)),
      topPx: Math.round(px(el.style.top)),
      widthPx: Math.round(px(el.style.width))
    };
  }

  function select(i) {
    selected = (i + items.length) % items.length;
    items.forEach(el => el.style.outline = "2px dashed rgba(0,229,255,.7)");
    items[selected].style.outline = "4px solid yellow";
    const r = record(items[selected]);
    panel.querySelector("[data-info]").textContent = `${selected + 1}/${items.length}: ${r.key} pos ${r.leftPx},${r.topPx} width ${r.widthPx}`;
  }

  function move(i, dx, dy) {
    const el = items[i];
    el.style.left = Math.round(px(el.style.left) + dx) + "px";
    el.style.top = Math.round(px(el.style.top) + dy) + "px";
    select(i);
  }

  function resize(i, dw) {
    const el = items[i];
    el.style.width = Math.max(20, Math.round(px(el.style.width) + dw)) + "px";
    select(i);
  }

  window.addEventListener("pointermove", e => {
    if (!drag) return;
    const el = items[drag.i];
    el.style.left = Math.round(drag.left + e.clientX - drag.x) + "px";
    el.style.top = Math.round(drag.top + e.clientY - drag.y) + "px";
    select(drag.i);
  }, true);

  window.addEventListener("pointerup", () => { drag = null; }, true);

  window.addEventListener("keydown", e => {
    if (e.key === "]") { e.preventDefault(); return select(selected + 1); }
    if (e.key === "[") { e.preventDefault(); return select(selected - 1); }
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;

    e.preventDefault();
    const step = e.shiftKey ? 10 : 1;

    if (e.altKey) {
      if (e.key === "ArrowLeft") resize(selected, -step);
      if (e.key === "ArrowRight") resize(selected, step);
      return;
    }

    if (e.key === "ArrowLeft") move(selected, -step, 0);
    if (e.key === "ArrowRight") move(selected, step, 0);
    if (e.key === "ArrowUp") move(selected, 0, -step);
    if (e.key === "ArrowDown") move(selected, 0, step);
  }, true);

  window.sfLiv023GearDev = {
    export() {
      return items.map(record);
    },
    download() {
      const data = this.export();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "liv023-gear-layout-final.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      console.log("[Signal Flow] Downloaded liv023-gear-layout-final.json", data.length, "records");
      return data;
    },
    close() {
      root.remove();
      panel.remove();
    }
  };

  panel.querySelector("[data-prev]").onclick = () => select(selected - 1);
  panel.querySelector("[data-next]").onclick = () => select(selected + 1);
  panel.querySelector("[data-export]").onclick = () => window.sfLiv023GearDev.download();
  panel.querySelector("[data-close]").onclick = () => window.sfLiv023GearDev.close();

  select(0);
  console.log("[Signal Flow] LIV-023 gear mover dev loaded", VERSION, { count: items.length });
})();
