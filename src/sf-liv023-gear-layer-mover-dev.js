(() => {
  const VERSION = "liv023-gear-layer-mover-v1";
  const board = document.querySelector(".sf-live-native-level-liv-023");
  if (!board) return console.warn("[Signal Flow] LIV-023 gear layer dev: board not found.");

  const gear = [...board.querySelectorAll("img[data-sf-gear-key], img[data-sf-gear-id]")]
    .map(img => ({
      img,
      key: img.dataset.sfGearKey || img.dataset.sfGearId || img.alt || "",
      label: img.alt || img.dataset.sfGearKey || "",
      leftPx: parseFloat(img.style.left || 0),
      topPx: parseFloat(img.style.top || 0),
      widthPx: parseFloat(img.style.width || img.getBoundingClientRect().width || 100),
      zIndex: parseInt(img.style.zIndex || "10", 10)
    }));

  if (!gear.length) return console.warn("[Signal Flow] LIV-023 gear layer dev: no gear images found.");

  let i = 0;

  const panel = document.createElement("div");
  panel.dataset.sfLiv023GearLayerPanel = "1";
  panel.style.cssText = "position:fixed;right:16px;top:90px;z-index:2147483647;width:420px;padding:12px;background:rgba(10,8,4,.96);border:2px solid #f5c542;color:#ffeeb4;font:12px/1.35 monospace;box-shadow:0 10px 30px rgba(0,0,0,.65)";
  panel.innerHTML = `
    <div data-title style="font-weight:900;margin-bottom:8px"></div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px">
      <button data-act="prev">Prev</button>
      <button data-act="next">Next</button>
      <button data-act="front">Front</button>
      <button data-act="back">Back</button>
      <button data-act="up">Up</button>
      <button data-act="down">Down</button>
      <button data-act="left">Left</button>
      <button data-act="right">Right</button>
      <button data-act="up10">Up 10</button>
      <button data-act="down10">Down 10</button>
      <button data-act="left10">Left 10</button>
      <button data-act="right10">Right 10</button>
      <button data-act="smaller">- Width</button>
      <button data-act="bigger">+ Width</button>
      <button data-act="zdown">Z -1</button>
      <button data-act="zup">Z +1</button>
      <button data-act="download">Download JSON</button>
    </div>
    <div data-list></div>
  `;
  document.body.appendChild(panel);

  function cur(){ return gear[i]; }

  function apply(g) {
    g.img.style.left = Math.round(g.leftPx) + "px";
    g.img.style.top = Math.round(g.topPx) + "px";
    g.img.style.width = Math.round(g.widthPx) + "px";
    g.img.style.zIndex = String(g.zIndex);
    g.img.style.outline = g === cur() ? "2px solid #00e5ff" : "none";
  }

  function draw() {
    gear.forEach(apply);
    const g = cur();
    panel.querySelector("[data-title]").textContent =
      `${i+1}/${gear.length}: ${g.key} x${Math.round(g.leftPx)} y${Math.round(g.topPx)} w${Math.round(g.widthPx)} z${g.zIndex}`;
    panel.querySelector("[data-list]").innerHTML = gear.map((g, idx) =>
      `<div data-pick="${idx}" style="cursor:pointer;padding:2px 4px;${idx===i?'background:rgba(0,229,255,.25)':''}">${idx+1}. z${g.zIndex} ${g.key}</div>`
    ).join("");
    panel.querySelectorAll("[data-pick]").forEach(el => {
      el.onclick = () => { i = Number(el.dataset.pick); draw(); };
    });
  }

  function move(dx, dy) { cur().leftPx += dx; cur().topPx += dy; draw(); }
  function width(dw) { cur().widthPx = Math.max(20, cur().widthPx + dw); draw(); }
  function z(dz) { cur().zIndex += dz; draw(); }

  function download() {
    const out = gear.map(g => ({
      key: g.key,
      label: g.label,
      leftPx: Math.round(g.leftPx),
      topPx: Math.round(g.topPx),
      widthPx: Math.round(g.widthPx),
      zIndex: g.zIndex,
      src: g.img.getAttribute("src")
    }));
    const blob = new Blob([JSON.stringify(out, null, 2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "liv023-gear-layer-layout-final.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  panel.addEventListener("click", e => {
    const act = e.target?.dataset?.act;
    if (!act) return;
    if (act === "prev") i = (i - 1 + gear.length) % gear.length;
    if (act === "next") i = (i + 1) % gear.length;
    if (act === "up") move(0, -1);
    if (act === "down") move(0, 1);
    if (act === "left") move(-1, 0);
    if (act === "right") move(1, 0);
    if (act === "up10") move(0, -10);
    if (act === "down10") move(0, 10);
    if (act === "left10") move(-10, 0);
    if (act === "right10") move(10, 0);
    if (act === "smaller") width(-5);
    if (act === "bigger") width(5);
    if (act === "zdown") z(-1);
    if (act === "zup") z(1);
    if (act === "front") { cur().zIndex = 60; draw(); }
    if (act === "back") { cur().zIndex = 5; draw(); }
    if (act === "download") download();
  });

  window.sfLiv023GearLayerDev = { gear, draw, download };
  draw();
  console.log("[Signal Flow] LIV-023 gear layer mover dev loaded", VERSION, { count: gear.length });
})();
