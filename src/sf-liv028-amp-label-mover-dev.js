(function(){
  "use strict";

  const DEV_ID = "sfLiv028AmpLabelMoverDev";
  const PANEL_ID = "sf-liv028-amp-label-mover-panel";
  const TARGET_SELECTOR = ".sf-liv028-amp-tape-label";

  if (window[DEV_ID]?.destroy) {
    window[DEV_ID].destroy();
  }

  function currentLevelId(){
    const fromHash = (location.hash || "").match(/\/level\/([^/?#]+)/);
    if (fromHash) return decodeURIComponent(fromHash[1]);
    const active = document.querySelector("[data-level-id]");
    return active?.dataset?.levelId || "";
  }

  function isLiv028(){
    return currentLevelId() === "LIV-028" ||
      document.body?.innerText?.includes("LIV-028 - Front of House Distribution Matrix") ||
      document.body?.innerText?.includes("Front of House Distribution Matrix");
  }

  function px(n){
    return `${Math.round(Number(n) || 0)}px`;
  }

  function parsePx(value){
    const n = parseFloat(String(value || "").replace("px", ""));
    return Number.isFinite(n) ? n : 0;
  }

  function targets(){
    return Array.from(document.querySelectorAll(TARGET_SELECTOR));
  }

  function labelName(el){
    return (el.textContent || "").trim() || el.dataset.liv028GearLabelFor || "label";
  }

  function makePanel(){
    const old = document.getElementById(PANEL_ID);
    if (old) old.remove();

    const panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.style.cssText = [
      "position:fixed",
      "right:18px",
      "bottom:18px",
      "z-index:2147483647",
      "width:310px",
      "padding:12px",
      "border-radius:12px",
      "background:rgba(8,12,16,.94)",
      "border:1px solid rgba(255,230,108,.45)",
      "box-shadow:0 12px 30px rgba(0,0,0,.45)",
      "color:#fff",
      "font:12px system-ui,-apple-system,Segoe UI,sans-serif"
    ].join(";");

    panel.innerHTML = `
      <div style="font-weight:900;color:#ffe66c;margin-bottom:8px;letter-spacing:.04em;text-transform:uppercase;">
        LIV-028 Amp Label Mover
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">
        <button data-act="select-prev">Prev</button>
        <button data-act="select-next">Next</button>
      </div>
      <div id="sf-liv028-label-current" style="margin:0 0 8px;color:#cdefff;">No label selected</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;align-items:center;margin-bottom:8px;">
        <span></span><button data-act="up">↑</button><span></span>
        <button data-act="left">←</button><button data-act="down">↓</button><button data-act="right">→</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">
        <button data-act="w-dec">Width -</button>
        <button data-act="w-inc">Width +</button>
        <button data-act="h-dec">Height -</button>
        <button data-act="h-inc">Height +</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">
        <button data-act="small">Step 1</button>
        <button data-act="large">Step 10</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">
        <button data-act="export">Export JSON</button>
        <button data-act="copy">Copy JSON</button>
      </div>
      <button data-act="destroy" style="width:100%;background:#552020;color:#fff;border-color:#aa5555;">Close Tool</button>
      <pre id="sf-liv028-label-export" style="max-height:120px;overflow:auto;white-space:pre-wrap;background:rgba(255,255,255,.06);padding:8px;border-radius:8px;margin:8px 0 0;"></pre>
      <style>
        #${PANEL_ID} button {
          cursor:pointer;
          border:1px solid rgba(255,230,108,.35);
          border-radius:7px;
          padding:6px 8px;
          background:rgba(255,255,255,.09);
          color:#fff;
          font-weight:800;
        }
        #${PANEL_ID} button:hover { background:rgba(255,230,108,.18); }
      </style>
    `;

    document.body.appendChild(panel);
    return panel;
  }

  let selectedIndex = 0;
  let step = 1;
  let panel = null;

  function selected(){
    const list = targets();
    if (!list.length) return null;
    selectedIndex = Math.max(0, Math.min(selectedIndex, list.length - 1));
    return list[selectedIndex];
  }

  function decorate(){
    targets().forEach((el, i) => {
      el.style.outline = i === selectedIndex ? "2px solid #00e5ff" : "";
      el.style.outlineOffset = i === selectedIndex ? "2px" : "";
      el.style.pointerEvents = "auto";
      el.style.cursor = "move";
      el.draggable = false;
    });
    updateReadout();
  }

  function updateReadout(){
    const out = document.getElementById("sf-liv028-label-current");
    const el = selected();
    if (!out) return;
    if (!el) {
      out.textContent = "No amp labels found. Load LIV-028 first.";
      return;
    }
    out.textContent = `${selectedIndex + 1}/${targets().length}: ${labelName(el)} | left ${parsePx(el.style.left)}, top ${parsePx(el.style.top)}, width ${parsePx(el.style.width)}`;
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
    const newW = Math.max(30, parsePx(el.style.width) + dw);
    el.style.width = px(newW);
    if (dh) {
      const currentH = parsePx(el.style.height) || el.getBoundingClientRect().height;
      el.style.height = px(Math.max(14, currentH + dh));
    }
    updateReadout();
  }

  function exportData(){
    const data = targets().map(el => ({
      text: labelName(el),
      key: el.dataset.liv028GearLabelFor || "",
      leftPx: parsePx(el.style.left),
      topPx: parsePx(el.style.top),
      widthPx: parsePx(el.style.width),
      heightPx: Math.round(el.getBoundingClientRect().height),
      transform: el.style.transform || "",
      className: String(el.className || "")
    }));
    const json = JSON.stringify(data, null, 2);
    const out = document.getElementById("sf-liv028-label-export");
    if (out) out.textContent = json;
    console.log("[Signal Flow] LIV-028 amp label export", data);
    return json;
  }

  function downloadExport(){
    const json = exportData();
    const blob = new Blob([json], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "liv028-amp-label-layout-export.json";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 100);
  }

  async function copyExport(){
    const json = exportData();
    try {
      await navigator.clipboard.writeText(json);
      console.log("[Signal Flow] LIV-028 amp label export copied to clipboard");
    } catch (err) {
      console.warn("[Signal Flow] Clipboard copy failed; use panel JSON or console export.", err);
    }
  }

  function installEvents(){
    panel.addEventListener("click", event => {
      const act = event.target?.dataset?.act;
      if (!act) return;
      event.preventDefault();

      if (act === "select-prev") selectedIndex -= 1;
      if (act === "select-next") selectedIndex += 1;
      if (act === "small") step = 1;
      if (act === "large") step = 10;
      if (act === "up") move(0, -step);
      if (act === "down") move(0, step);
      if (act === "left") move(-step, 0);
      if (act === "right") move(step, 0);
      if (act === "w-dec") resize(-step, 0);
      if (act === "w-inc") resize(step, 0);
      if (act === "h-dec") resize(0, -step);
      if (act === "h-inc") resize(0, step);
      if (act === "export") downloadExport();
      if (act === "copy") copyExport();
      if (act === "destroy") return api.destroy();

      const list = targets();
      if (list.length) {
        if (selectedIndex < 0) selectedIndex = list.length - 1;
        if (selectedIndex >= list.length) selectedIndex = 0;
      }
      decorate();
    });

    document.addEventListener("keydown", onKey, true);

    let drag = null;
    document.addEventListener("pointerdown", event => {
      const el = event.target?.closest?.(TARGET_SELECTOR);
      if (!el) return;
      const list = targets();
      selectedIndex = list.indexOf(el);
      decorate();
      drag = {
        el,
        startX: event.clientX,
        startY: event.clientY,
        left: parsePx(el.style.left),
        top: parsePx(el.style.top)
      };
      el.setPointerCapture?.(event.pointerId);
      event.preventDefault();
      event.stopPropagation();
    }, true);

    document.addEventListener("pointermove", event => {
      if (!drag) return;
      drag.el.style.left = px(drag.left + event.clientX - drag.startX);
      drag.el.style.top = px(drag.top + event.clientY - drag.startY);
      updateReadout();
      event.preventDefault();
      event.stopPropagation();
    }, true);

    document.addEventListener("pointerup", event => {
      if (!drag) return;
      drag = null;
      event.preventDefault();
      event.stopPropagation();
    }, true);
  }

  function onKey(event){
    if (!panel || event.target.closest?.(`#${PANEL_ID}`)) return;
    const el = selected();
    if (!el) return;

    const n = event.shiftKey ? 10 : 1;
    if (event.key === "ArrowUp") move(0, -n);
    else if (event.key === "ArrowDown") move(0, n);
    else if (event.key === "ArrowLeft") move(-n, 0);
    else if (event.key === "ArrowRight") move(n, 0);
    else if (event.key === "[" ) resize(-n, 0);
    else if (event.key === "]" ) resize(n, 0);
    else return;

    event.preventDefault();
    event.stopPropagation();
  }

  function boot(){
    if (!isLiv028()) {
      console.warn("[Signal Flow] LIV-028 amp label mover loaded, but current board does not look like LIV-028.");
    }
    panel = makePanel();
    installEvents();
    decorate();
    console.log("[Signal Flow] LIV-028 amp label mover dev tool installed", {
      targets: targets().map(labelName)
    });
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
        el.style.cursor = "";
        el.style.pointerEvents = "none";
      });
      delete window[DEV_ID];
      console.log("[Signal Flow] LIV-028 amp label mover dev tool removed");
    }
  };

  window[DEV_ID] = api;
  boot();
})();
