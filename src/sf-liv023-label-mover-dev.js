(() => {
  const VERSION = "liv023-label-mover-dev-v2-buttons";

  const board = document.querySelector(".sf-live-native-level-liv-023");
  if (!board) return console.warn("[Signal Flow] LIV-023 label dev: board not found.");

  document.querySelectorAll("[data-sf-liv023-label-dev], [data-sf-liv023-label-panel]").forEach(el => el.remove());

  const labels = [
    {key:"monitor-console", text:"MONITOR CONSOLE", leftPx:24, topPx:18, fontPx:10, visible:true},
    {key:"stagebox", text:"STAGE BOX / SNAKE HEAD", leftPx:34, topPx:394, fontPx:10, visible:true},
    {key:"lead-vocal-mic", text:"LEAD VOCAL MIC", leftPx:48, topPx:520, fontPx:10, visible:true},
    {key:"keyboard", text:"KEYBOARD", leftPx:300, topPx:515, fontPx:10, visible:true},
    {key:"processing-rack", text:"PROCESSING / AMP RACK", leftPx:485, topPx:175, fontPx:10, visible:true},
    {key:"vocal-compressor", text:"VOCAL COMPRESSOR", leftPx:530, topPx:245, fontPx:9, visible:true},
    {key:"iem-transmitter", text:"IEM TRANSMITTER", leftPx:510, topPx:350, fontPx:9, visible:true},
    {key:"crossover", text:"3-WAY CROSSOVER", leftPx:500, topPx:455, fontPx:9, visible:true},
    {key:"high-amp", text:"HIGH AMP", leftPx:520, topPx:560, fontPx:9, visible:true},
    {key:"mid-amp", text:"MID AMP", leftPx:520, topPx:657, fontPx:9, visible:true},
    {key:"low-amp", text:"LOW AMP", leftPx:520, topPx:757, fontPx:9, visible:true}
  ];

  let i = 0;

  const panel = document.createElement("div");
  panel.dataset.sfLiv023LabelPanel = "1";
  panel.style.cssText = "position:fixed;right:16px;top:92px;z-index:2147483647;width:390px;padding:12px;background:rgba(12,8,3,.96);border:2px solid #f5c542;color:#ffeeb4;font:12px/1.35 monospace;box-shadow:0 10px 30px rgba(0,0,0,.65)";
  panel.innerHTML = `
    <div data-title style="font-weight:900;margin-bottom:8px"></div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px">
      <button data-act="prev">Prev</button>
      <button data-act="next">Next</button>
      <button data-act="toggle">Hide/Show</button>
      <button data-act="download">Download</button>
      <button data-act="up">Up</button>
      <button data-act="down">Down</button>
      <button data-act="left">Left</button>
      <button data-act="right">Right</button>
      <button data-act="up10">Up 10</button>
      <button data-act="down10">Down 10</button>
      <button data-act="left10">Left 10</button>
      <button data-act="right10">Right 10</button>
      <button data-act="small">- Font</button>
      <button data-act="big">+ Font</button>
      <button data-act="hideall">Hide All</button>
      <button data-act="showall">Show All</button>
    </div>
    <div data-list></div>
  `;
  document.body.appendChild(panel);

  function selected(){ return labels[i]; }

  function draw() {
    document.querySelectorAll("[data-sf-liv023-label-dev]").forEach(el => el.remove());

    labels.forEach((l, idx) => {
      if (!l.visible) return;
      const el = document.createElement("div");
      el.dataset.sfLiv023LabelDev = "1";
      el.dataset.key = l.key;
      el.textContent = l.text;
      el.style.cssText = [
        "position:absolute",
        "left:" + l.leftPx + "px",
        "top:" + l.topPx + "px",
        "font:" + l.fontPx + "px/1.1 Arial,sans-serif",
        "letter-spacing:.12em",
        "font-weight:800",
        "color:rgba(255,238,180,.94)",
        "text-shadow:0 2px 8px rgba(0,0,0,.9)",
        "z-index:2147483000",
        "pointer-events:auto",
        "cursor:pointer",
        "user-select:none",
        "padding:3px 5px",
        "border:" + (idx === i ? "2px solid #00e5ff" : "1px dashed rgba(120,220,255,.55)"),
        "background:rgba(0,0,0,.32)"
      ].join(";");
      el.onclick = e => { i = idx; update(); e.stopPropagation(); };
      board.appendChild(el);
    });

    update();
  }

  function update() {
    const l = selected();
    panel.querySelector("[data-title]").textContent = `${i+1}/${labels.length}: ${l.key} x${l.leftPx} y${l.topPx} font${l.fontPx} visible:${l.visible}`;
    panel.querySelector("[data-list]").innerHTML = labels.map((l, idx) =>
      `<div data-pick="${idx}" style="cursor:pointer;padding:2px 4px;${idx===i?'background:rgba(0,229,255,.25)':''}">${idx+1}. ${l.visible?'✓':'×'} ${l.key}</div>`
    ).join("");
    panel.querySelectorAll("[data-pick]").forEach(el => {
      el.onclick = () => { i = Number(el.dataset.pick); draw(); };
    });
  }

  function move(dx, dy) { selected().leftPx += dx; selected().topPx += dy; draw(); }
  function download() {
    const blob = new Blob([JSON.stringify(labels, null, 2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "liv023-label-layout-final.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  panel.addEventListener("click", e => {
    const act = e.target && e.target.dataset && e.target.dataset.act;
    if (!act) return;
    if (act === "prev") i = (i - 1 + labels.length) % labels.length;
    if (act === "next") i = (i + 1) % labels.length;
    if (act === "toggle") selected().visible = !selected().visible;
    if (act === "up") move(0,-1);
    if (act === "down") move(0,1);
    if (act === "left") move(-1,0);
    if (act === "right") move(1,0);
    if (act === "up10") move(0,-10);
    if (act === "down10") move(0,10);
    if (act === "left10") move(-10,0);
    if (act === "right10") move(10,0);
    if (act === "small") selected().fontPx = Math.max(7, selected().fontPx - 1);
    if (act === "big") selected().fontPx += 1;
    if (act === "hideall") labels.forEach(l => l.visible = false);
    if (act === "showall") labels.forEach(l => l.visible = true);
    if (act === "download") download();
    draw();
  });

  window.sfLiv023LabelDev = { labels, draw, download };
  draw();
  console.log("[Signal Flow] LIV-023 label mover dev loaded", VERSION, {count: labels.length});
})();