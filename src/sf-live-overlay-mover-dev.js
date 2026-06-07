(function () {
  "use strict";

  const VERSION = "sf-live-overlay-mover-dev-v6-reusable-controls";
  const cfg = window.sfLiveDevToolConfig || {};
  const levelId = String(cfg.levelId || "LIV-025").toUpperCase();
  const layerSelector = cfg.layerSelector || `.sf-live-native-layer.sf-live-native-level-${levelId.toLowerCase()}`;

  let selected = null;
  let items = [];

  function layer() {
    return document.querySelector(layerSelector);
  }

  function px(n) { return `${Math.round(n)}px`; }

  function applyBox(el, item) {
    el.style.left = px(item.leftPx);
    el.style.top = px(item.topPx);
    el.style.width = px(item.widthPx);
    el.style.height = px(item.heightPx);
    el.style.zIndex = item.zIndex || 80;
    el.style.display = item.hidden ? "none" : "block";
  }

  function htmlFor(type, text) {
    if (type === "label") return `<div class="sf-live-ov-label">${text || "LABEL"}</div>`;
    if (type === "screen") return `<div class="sf-live-ov-screen">
      <div>MATRIX OUTS → DSP MATRIX IN</div>
      <div class="grid">${Array.from({length: 32}).map((_,i)=>`<i class="${i%5===0||i%7===0?"on":""}"></i>`).join("")}</div>
    </div>`;
    if (type === "vu" || type === "meter") return `<div class="sf-live-ov-vu"><div class="scale">-20&nbsp;&nbsp;-10&nbsp;&nbsp;-3&nbsp;&nbsp;0&nbsp;&nbsp;+3</div><div class="needle"></div><b>VU</b></div>`;
    return `<div class="sf-live-ov-label">${text || "MASK"}</div>`;
  }

  function injectCss() {
    if (document.getElementById("sf-live-overlay-dev-css")) return;
    const st = document.createElement("style");
    st.id = "sf-live-overlay-dev-css";
    st.textContent = `
      [data-sf-live-overlay-key]{
        position:absolute; box-sizing:border-box; user-select:none; pointer-events:auto;
        outline:2px solid transparent; outline-offset:2px; cursor:move;
      }
      [data-sf-live-overlay-key].selected{outline-color:#ffd84d;}
      .sf-live-ov-label{
        width:100%;height:100%;display:flex;align-items:center;justify-content:center;
        background:rgba(0,0,0,.92);color:#fff4b8;border-radius:5px;
        font:800 12px/1 system-ui,sans-serif;letter-spacing:.08em;text-align:center;
        box-shadow:0 0 10px rgba(0,0,0,.8), inset 0 0 0 1px rgba(255,220,120,.18);
      }
      .sf-live-ov-screen{
        width:100%;height:100%;background:linear-gradient(#06291d,#020806);
        border:2px solid rgba(105,255,170,.65);border-radius:8px;color:#6cff8b;
        font:700 10px/1.1 ui-monospace,Menlo,monospace;text-align:center;
        box-shadow:0 0 18px rgba(0,255,120,.35), inset 0 0 18px rgba(0,255,120,.18);
        padding:7px;overflow:hidden;
      }
      .sf-live-ov-screen .grid{display:grid;grid-template-columns:repeat(8,1fr);gap:4px;margin-top:6px}
      .sf-live-ov-screen i{height:7px;background:rgba(50,255,95,.12)}
      .sf-live-ov-screen i.on{background:#5cff68;box-shadow:0 0 8px #5cff68}
      .sf-live-ov-vu{
        width:100%;height:100%;position:relative;overflow:hidden;border-radius:7px;
        background:radial-gradient(circle at 50% 105%,#d49b44 0,#f4cf86 45%,#5b4424 100%);
        border:3px solid #151515;box-shadow:inset 0 0 14px rgba(0,0,0,.55),0 2px 8px rgba(0,0,0,.7);
        color:#2b1705;font:800 10px system-ui,sans-serif;text-align:center;
      }
      .sf-live-ov-vu .scale{position:absolute;top:12%;left:0;right:0;font-size:9px}
      .sf-live-ov-vu .needle{position:absolute;bottom:8%;left:50%;width:2px;height:62%;background:#5b1208;
        transform-origin:bottom center;transform:rotate(24deg);box-shadow:0 0 2px #000}
      .sf-live-ov-vu b{position:absolute;bottom:18%;left:0;right:0;font-size:14px}
      #sf-live-overlay-panel{
        position:fixed;right:18px;bottom:18px;z-index:999999;background:rgba(8,10,10,.95);
        border:1px solid rgba(255,216,77,.45);border-radius:10px;color:#fff4c0;padding:10px;
        font:12px system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.6);min-width:260px;
      }
      #sf-live-overlay-panel button{margin:3px;padding:5px 8px;border-radius:6px;border:1px solid #806b31;background:#15110b;color:#ffe69a}
    `;
    document.head.appendChild(st);
  }

  function select(el) {
    document.querySelectorAll("[data-sf-live-overlay-key]").forEach(x => x.classList.remove("selected"));
    selected = el;
    if (selected) selected.classList.add("selected");
  }

  function renderOne(item) {
    const l = layer();
    if (!l) return null;

    let el = l.querySelector(`[data-sf-live-overlay-key="${item.key}"]`);
    if (!el) {
      el = document.createElement("div");
      el.dataset.sfLiveOverlayKey = item.key;
      el.dataset.sfLiveOverlayType = item.type;
      el.innerHTML = htmlFor(item.type, item.text);
      l.appendChild(el);

      el.addEventListener("pointerdown", e => {
        e.preventDefault();
        e.stopPropagation();
        select(el);
        const startX = e.clientX, startY = e.clientY;
        const startL = item.leftPx, startT = item.topPx;
        const move = ev => {
          item.leftPx = startL + ev.clientX - startX;
          item.topPx = startT + ev.clientY - startY;
          applyBox(el, item);
        };
        const up = () => {
          window.removeEventListener("pointermove", move, true);
          window.removeEventListener("pointerup", up, true);
        };
        window.addEventListener("pointermove", move, true);
        window.addEventListener("pointerup", up, true);
      }, true);
    }
    applyBox(el, item);
    return el;
  }

  function render() {
    injectCss();
    items.forEach(renderOne);
    buildPanel();
  }

  function add(type, opts = {}) {
    const item = {
      key: `${type}-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      type,
      text: opts.text || (type === "label" ? "FRONT FILL DSP" : ""),
      leftPx: opts.leftPx ?? 100,
      topPx: opts.topPx ?? 100,
      widthPx: opts.widthPx ?? ((type === "vu" || type === "meter") ? 150 : type === "screen" ? 190 : 130),
      heightPx: opts.heightPx ?? ((type === "vu" || type === "meter") ? 82 : type === "screen" ? 70 : 26),
      zIndex: opts.zIndex ?? 80,
      hidden: false
    };
    items.push(item);
    const el = renderOne(item);
    select(el);
    return item;
  }

  function selectedItem() {
    if (!selected) return null;
    return items.find(x => x.key === selected.dataset.sfLiveOverlayKey) || null;
  }

  function nudge(dx, dy) {
    const item = selectedItem(); if (!item) return;
    item.leftPx += dx; item.topPx += dy; applyBox(selected, item);
  }

  function resize(dw, dh) {
    const item = selectedItem(); if (!item) return;
    item.widthPx = Math.max(8, item.widthPx + dw);
    item.heightPx = Math.max(8, item.heightPx + dh);
    applyBox(selected, item);
  }

  function removeSelected() {
    const item = selectedItem(); if (!item) return;
    items = items.filter(x => x.key !== item.key);
    selected.remove(); selected = null;
  }

  function toggleSelected() {
    const item = selectedItem(); if (!item) return;
    item.hidden = !item.hidden; applyBox(selected, item);
  }

  function clean() {
    document.querySelectorAll("[data-sf-live-overlay-key]").forEach(el => el.remove());
    items = []; selected = null;
  }

  function exportJson() {
    console.log(`[Signal Flow] ${levelId} overlay export`, JSON.stringify(items, null, 2));
    return items;
  }

  function buildPanel() {
    if (document.getElementById("sf-live-overlay-panel")) return;
    const p = document.createElement("div");
    p.id = "sf-live-overlay-panel";
    p.innerHTML = `
      <b>Overlay Tool - ${levelId}</b><br>
      <button data-add="label">+ label/mask</button>
      <button data-add="vu">+ VU meter</button>
      <button data-add="screen">+ LED screen</button><br>
      <button data-act="hide">show/hide</button>
      <button data-act="delete">delete</button>
      <button data-act="export">export</button><br>
      <small>Drag selected overlay. Arrows move. Shift+arrows resize. [ / ] select.</small>
    `;
    document.body.appendChild(p);
    p.addEventListener("click", e => {
      const addType = e.target.dataset.add;
      const act = e.target.dataset.act;
      if (addType) add(addType);
      if (act === "hide") toggleSelected();
      if (act === "delete") removeSelected();
      if (act === "export") exportJson();
    });
  }

  window.addEventListener("keydown", e => {
    const step = e.shiftKey ? 10 : 1;
    if (e.key === "[") {
      const els = Array.from(document.querySelectorAll("[data-sf-live-overlay-key]"));
      if (!els.length) return;
      const i = Math.max(0, els.indexOf(selected));
      select(els[(i - 1 + els.length) % els.length]);
    }
    if (e.key === "]") {
      const els = Array.from(document.querySelectorAll("[data-sf-live-overlay-key]"));
      if (!els.length) return;
      const i = Math.max(0, els.indexOf(selected));
      select(els[(i + 1) % els.length]);
    }
    if (!selected) return;
    if (e.key === "ArrowLeft") e.shiftKey ? resize(-step,0) : nudge(-step,0);
    if (e.key === "ArrowRight") e.shiftKey ? resize(step,0) : nudge(step,0);
    if (e.key === "ArrowUp") e.shiftKey ? resize(0,-step) : nudge(0,-step);
    if (e.key === "ArrowDown") e.shiftKey ? resize(0,step) : nudge(0,step);
  }, true);

  window.sfLiveOverlayDev = { add, render, export: exportJson, clean, items };
  render();

  
  function scheduleOverlayRestore() {
    clearTimeout(window.__sfLiveOverlayRestoreTimer);
    window.__sfLiveOverlayRestoreTimer = setTimeout(function () {
      try {
        if (window.sfLiveOverlayDev && Array.isArray(window.sfLiveOverlayDev.items)) {
          window.sfLiveOverlayDev.render();
        }
      } catch (err) {
        console.warn("[Signal Flow] overlay restore failed", err);
      }
    }, 80);
  }

  if (!window.__sfLiveOverlayObserverInstalled) {
    window.__sfLiveOverlayObserverInstalled = true;
    new MutationObserver(scheduleOverlayRestore).observe(document.body, { childList: true, subtree: true });
  }

  console.log("[Signal Flow] Live Overlay Mover dev script loaded", VERSION);
})();
