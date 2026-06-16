(function(){
  "use strict";

  const DEV_ID = "sfLiv028FalseHitboxDev";
  const PANEL_ID = "sf-liv028-false-hitbox-panel";
  const TARGET_SELECTOR = ".sf-native-liv028-false-hitbox,[data-node-key^='liv028-false-'],[data-node-key^='liv028-bad-']";

  if (window[DEV_ID]?.destroy) window[DEV_ID].destroy();

  function parsePx(v){ const n = parseFloat(String(v || "").replace("px", "")); return Number.isFinite(n) ? n : 0; }
  function px(n){ return `${Math.round(Number(n) || 0)}px`; }
  function keyOf(el){ return el.dataset.nodeKey || el.getAttribute("data-node-key") || ""; }

  function targets(){
    return Array.from(document.querySelectorAll(TARGET_SELECTOR))
      .filter(el => {
        const key = keyOf(el);
        return key.startsWith("liv028-false-") || key.startsWith("liv028-bad-") || el.classList.contains("sf-native-liv028-false-hitbox");
      })
      .sort((a,b) => keyOf(a).localeCompare(keyOf(b)));
  }

  let selectedIndex = 0;
  let step = 1;
  let panel = null;
  let drag = null;

  function selected(){
    const list = targets();
    if (!list.length) return null;
    selectedIndex = Math.max(0, Math.min(selectedIndex, list.length - 1));
    return list[selectedIndex];
  }

  function ensureStyle(el){
    el.style.setProperty("pointer-events", "auto", "important");
    el.style.setProperty("cursor", "move", "important");
    el.style.setProperty("box-sizing", "border-box", "important");
    el.style.setProperty("min-width", "0", "important");
    el.style.setProperty("min-height", "0", "important");
    el.style.setProperty("max-width", "none", "important");
    el.style.setProperty("max-height", "none", "important");
    el.style.setProperty("padding", "0", "important");
    el.style.setProperty("margin", "0", "important");
    el.style.setProperty("line-height", "0", "important");
    el.style.setProperty("appearance", "none", "important");
    el.style.setProperty("-webkit-appearance", "none", "important");
  }

  function decorate(){
    targets().forEach((el, i) => {
      ensureStyle(el);
      el.style.outline = i === selectedIndex ? "2px solid #fff" : "1px dashed rgba(255,0,200,.55)";
      el.style.outlineOffset = "1px";
      el.style.background = i === selectedIndex ? "rgba(255,0,200,.45)" : "rgba(255,0,200,.22)";
      el.style.border = "1px solid rgba(255,0,200,.85)";
      el.title = keyOf(el);
    });
    updateReadout();
  }

  function updateReadout(){
    const out = document.getElementById("sf-liv028-false-hitbox-current");
    const el = selected();
    if (!out) return;
    if (!el) {
      out.textContent = "No LIV-028 false hitboxes found.";
      return;
    }
    const r = el.getBoundingClientRect();
    out.textContent = `${selectedIndex + 1}/${targets().length} | ${keyOf(el)} | left ${parsePx(el.style.left)} | top ${parsePx(el.style.top)} | w ${parsePx(el.style.width) || Math.round(r.width)} | h ${parsePx(el.style.height) || Math.round(r.height)}`;
  }

  function move(dx, dy){
    const el = selected();
    if (!el) return;
    el.style.left = px(parsePx(el.style.left) + dx);
    el.style.top = px(parsePx(el.style.top) + dy);
    updateReadout();
  }

  function resize(dw, dh){
    const el = selected();
    if (!el) return;
    const r = el.getBoundingClientRect();
    const w = parsePx(el.style.width) || r.width;
    const h = parsePx(el.style.height) || r.height;
    el.style.width = px(Math.max(4, w + dw));
    el.style.height = px(Math.max(4, h + dh));
    updateReadout();
  }

  function exportData(){
    const data = targets().map(el => {
      const r = el.getBoundingClientRect();
      return {
        key: keyOf(el),
        text: (el.textContent || "").trim(),
        leftPx: parsePx(el.style.left),
        topPx: parsePx(el.style.top),
        widthPx: parsePx(el.style.width) || Math.round(r.width),
        heightPx: parsePx(el.style.height) || Math.round(r.height),
        className: String(el.className || "")
      };
    });
    const json = JSON.stringify(data, null, 2);
    const pre = document.getElementById("sf-liv028-false-hitbox-export");
    if (pre) pre.textContent = json;
    console.log("[Signal Flow] LIV-028 false hitbox export", data);
    return json;
  }

  function downloadExport(){
    const blob = new Blob([exportData()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "liv028-false-hitboxes-export.json";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 100);
  }

  async function copyExport(){
    try { await navigator.clipboard.writeText(exportData()); }
    catch (err) { console.warn("[Signal Flow] Clipboard copy failed; use downloaded JSON.", err); }
  }

  function makePanel(){
    document.getElementById(PANEL_ID)?.remove();
    const el = document.createElement("div");
    el.id = PANEL_ID;
    el.style.cssText = [
      "position:fixed",
      "right:18px",
      "bottom:18px",
      "z-index:2147483647",
      "width:360px",
      "padding:12px",
      "border-radius:12px",
      "background:rgba(12,8,16,.96)",
      "border:1px solid rgba(255,0,200,.60)",
      "box-shadow:0 12px 30px rgba(0,0,0,.45)",
      "color:#fff",
      "font:12px system-ui,-apple-system,Segoe UI,sans-serif"
    ].join(";");

    el.innerHTML = `
      <div style="font-weight:900;color:#ff73df;margin-bottom:8px;letter-spacing:.04em;text-transform:uppercase;">LIV-028 False Hitbox Mapper</div>
      <div id="sf-liv028-false-hitbox-current" style="margin:0 0 8px;color:#ffd6f5;">No selection</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px;">
        <button data-act="prev">Prev</button><button data-act="next">Next</button><button data-act="flash">Flash</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;align-items:center;margin-bottom:8px;">
        <span></span><button data-act="up">↑</button><span></span>
        <button data-act="left">←</button><button data-act="down">↓</button><button data-act="right">→</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">
        <button data-act="w-dec">Width -</button><button data-act="w-inc">Width +</button>
        <button data-act="h-dec">Height -</button><button data-act="h-inc">Height +</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px;">
        <button data-act="step1">Step 1</button><button data-act="step5">Step 5</button><button data-act="step10">Step 10</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">
        <button data-act="export">Export JSON</button><button data-act="copy">Copy JSON</button>
      </div>
      <button data-act="destroy" style="width:100%;background:#552044;color:#fff;border-color:#aa55aa;">Close Tool</button>
      <pre id="sf-liv028-false-hitbox-export" style="max-height:130px;overflow:auto;white-space:pre-wrap;background:rgba(255,255,255,.06);padding:8px;border-radius:8px;margin:8px 0 0;"></pre>
      <style>
        #${PANEL_ID} button {
          cursor:pointer;
          border:1px solid rgba(255,0,200,.45);
          border-radius:7px;
          padding:6px 8px;
          background:rgba(255,255,255,.09);
          color:#fff;
          font-weight:800;
        }
        #${PANEL_ID} button:hover { background:rgba(255,0,200,.20); }
      </style>
    `;
    document.body.appendChild(el);
    return el;
  }

  function flash(){
    targets().forEach(el => {
      el.style.background = "rgba(255,230,108,.45)";
      el.style.outline = "2px solid #ffe66c";
    });
    setTimeout(decorate, 450);
  }

  function action(act){
    const list = targets();
    if (act === "prev") selectedIndex -= 1;
    if (act === "next") selectedIndex += 1;
    if (act === "step1") step = 1;
    if (act === "step5") step = 5;
    if (act === "step10") step = 10;

    if (list.length) {
      if (selectedIndex < 0) selectedIndex = list.length - 1;
      if (selectedIndex >= list.length) selectedIndex = 0;
    }

    if (act === "up") move(0, -step);
    if (act === "down") move(0, step);
    if (act === "left") move(-step, 0);
    if (act === "right") move(step, 0);
    if (act === "w-dec") resize(-step, 0);
    if (act === "w-inc") resize(step, 0);
    if (act === "h-dec") resize(0, -step);
    if (act === "h-inc") resize(0, step);
    if (act === "flash") flash();
    if (act === "export") downloadExport();
    if (act === "copy") copyExport();
    if (act === "destroy") return api.destroy();

    decorate();
  }

  function onKey(event){
    if (event.target?.closest?.(`#${PANEL_ID}`)) return;
    const n = event.shiftKey ? 10 : step;
    if (event.key === "ArrowUp") move(0, -n);
    else if (event.key === "ArrowDown") move(0, n);
    else if (event.key === "ArrowLeft") move(-n, 0);
    else if (event.key === "ArrowRight") move(n, 0);
    else if (event.key === "[") resize(-n, 0);
    else if (event.key === "]") resize(n, 0);
    else if (event.key === "{") resize(0, -n);
    else if (event.key === "}") resize(0, n);
    else return;
    event.preventDefault();
    event.stopPropagation();
  }

  function install(){
    panel.addEventListener("click", e => {
      const act = e.target?.dataset?.act;
      if (!act) return;
      e.preventDefault();
      action(act);
    });

    document.addEventListener("keydown", onKey, true);

    document.addEventListener("pointerdown", e => {
      const el = e.target?.closest?.(TARGET_SELECTOR);
      if (!el) return;
      const list = targets();
      selectedIndex = list.indexOf(el);
      decorate();
      drag = {
        el,
        startX: e.clientX,
        startY: e.clientY,
        left: parsePx(el.style.left),
        top: parsePx(el.style.top)
      };
      el.setPointerCapture?.(e.pointerId);
      e.preventDefault();
      e.stopPropagation();
    }, true);

    document.addEventListener("pointermove", e => {
      if (!drag) return;
      drag.el.style.left = px(drag.left + e.clientX - drag.startX);
      drag.el.style.top = px(drag.top + e.clientY - drag.startY);
      updateReadout();
      e.preventDefault();
      e.stopPropagation();
    }, true);

    document.addEventListener("pointerup", e => {
      if (!drag) return;
      drag = null;
      e.preventDefault();
      e.stopPropagation();
    }, true);
  }

  const api = {
    targets,
    selected,
    exportData,
    downloadExport,
    copyExport,
    destroy(){
      document.removeEventListener("keydown", onKey, true);
      document.getElementById(PANEL_ID)?.remove();
      targets().forEach(el => {
        el.style.outline = "";
        el.style.outlineOffset = "";
      });
      delete window[DEV_ID];
      console.log("[Signal Flow] LIV-028 false hitbox mapper removed");
    }
  };

  window[DEV_ID] = api;
  panel = makePanel();
  targets().forEach(ensureStyle);
  install();
  decorate();

  console.log("[Signal Flow] LIV-028 false hitbox mapper installed", {
    targetCount: targets().length,
    targets: targets().map(keyOf)
  });
})();
