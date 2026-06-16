(function(){
  "use strict";

  const DEV_ID = "sfLiv028TrueHitboxDev";
  const PANEL_ID = "sf-liv028-true-hitbox-panel";
  const EXPORT_NAME = "liv028-true-hitboxes-export.json";

  if (window[DEV_ID]?.destroy) {
    window[DEV_ID].destroy();
  }

  const TRUE_NODE_PREFIXES = [
    "liv028-"
  ];

  const FALSE_PREFIXES = [
    "liv028-bad-",
    "liv028-false-",
    "liv028-trap-"
  ];

  function docsToScan(){
    const docs = [{ name: "top", doc: document }];
    document.querySelectorAll("iframe").forEach((frame, i) => {
      try {
        if (frame.contentDocument) docs.push({ name: "iframe-" + i, doc: frame.contentDocument });
      } catch {}
    });
    return docs;
  }

  function bestTarget(){
    let best = null;
    docsToScan().forEach(item => {
      const layer = item.doc.querySelector(".sf-live-native-layer.sf-live-native-level-liv-028, .sf-live-native-layer.sf-liv028-visual-scaffold");
      if (!layer) return;
      const r = layer.getBoundingClientRect();
      const score = (item.name.indexOf("iframe") === 0 ? 100000 : 0) + r.width * r.height;
      if (!best || score > best.score) best = { name: item.name, doc: item.doc, layer, score };
    });
    return best;
  }

  function activeDoc(){
    return bestTarget()?.doc || document;
  }

  function isLiv028(){
    const doc = activeDoc();
    return doc.body?.innerText?.includes("LIV-028") ||
      doc.body?.innerText?.includes("Talkback to Monitor System") ||
      location.href.includes("LIV-028");
  }

  function parsePx(value){
    const n = parseFloat(String(value || "").replace("px", ""));
    return Number.isFinite(n) ? n : 0;
  }

  function px(n){
    return `${Math.round(Number(n) || 0)}px`;
  }

  function nodeKey(el){
    return el.dataset.nodeKey || el.getAttribute("data-node-key") || "";
  }

  function isTrueTarget(el){
    const key = nodeKey(el);
    if (!key) return false;
    if (!el.matches('[data-node-key^="liv028-"]')) return false;
    if (!TRUE_NODE_PREFIXES.some(prefix => key.startsWith(prefix))) return false;
    if (FALSE_PREFIXES.some(prefix => key.startsWith(prefix))) return false;
    if (!el.classList.contains("sf-native-liv028-true-hitbox") && el.dataset.liv028TrueHitbox !== "1") return false;
    if (el.classList.contains("sf-liv028-amp-tape-label")) return false;
    if (el.classList.contains("sf-liv028-dev-gear-label")) return false;
    return true;
  }

  function targets(){
    const target = bestTarget();
    const root = target?.layer || document;
    return Array.from(root.querySelectorAll('[data-node-key^="liv028-"]'))
      .filter(isTrueTarget)
      .sort((a, b) => nodeKey(a).localeCompare(nodeKey(b)));
  }

  function ensureEditableStyle(el){
    const r = el.getBoundingClientRect();
    const width = parsePx(el.style.width) || Math.round(r.width) || 24;
    const height = parsePx(el.style.height) || Math.round(r.height) || 24;
    el.style.setProperty("position", "absolute", "important");
    el.style.setProperty("width", px(width), "important");
    el.style.setProperty("height", px(height), "important");
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

  function setBox(el, left, top, width, height){
    if (Number.isFinite(left)) el.style.setProperty("left", px(left), "important");
    if (Number.isFinite(top)) el.style.setProperty("top", px(top), "important");
    if (Number.isFinite(width)) el.style.setProperty("width", px(width), "important");
    if (Number.isFinite(height)) el.style.setProperty("height", px(height), "important");
    el.style.setProperty("min-width", "0", "important");
    el.style.setProperty("min-height", "0", "important");
    el.style.setProperty("max-width", "none", "important");
    el.style.setProperty("max-height", "none", "important");
    el.style.setProperty("box-sizing", "border-box", "important");
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

  function labelFor(el){
    return nodeKey(el) || el.textContent?.trim() || "hitbox";
  }

  function decorate(){
    const list = targets();
    list.forEach((el, i) => {
      ensureEditableStyle(el);
      el.style.outline = i === selectedIndex ? "2px solid #00e5ff" : "1px dashed rgba(0,229,255,.28)";
      el.style.outlineOffset = "1px";
      el.style.background = i === selectedIndex ? "rgba(0,229,255,.20)" : "rgba(0,229,255,.08)";
      el.style.border = "1px solid rgba(0,229,255,.55)";
      el.title = labelFor(el);
    });
    updateReadout();
  }

  function updateReadout(){
    const out = activeDoc().getElementById("sf-liv028-true-hitbox-current");
    const el = selected();
    if (!out) return;

    if (!el) {
      out.textContent = "No true LIV-028 hitboxes found.";
      return;
    }

    const r = el.getBoundingClientRect();
    out.textContent = [
      `${selectedIndex + 1}/${targets().length}`,
      labelFor(el),
      `left ${parsePx(el.style.left)}`,
      `top ${parsePx(el.style.top)}`,
      `w ${parsePx(el.style.width) || Math.round(r.width)}`,
      `h ${parsePx(el.style.height) || Math.round(r.height)}`
    ].join(" | ");
  }

  function move(dx, dy){
    const el = selected();
    if (!el) return;
    setBox(el, parsePx(el.style.left) + dx, parsePx(el.style.top) + dy);
    updateReadout();
  }

  function resize(dw, dh){
    const el = selected();
    if (!el) return;
    const r = el.getBoundingClientRect();
    const w = parsePx(el.style.width) || r.width;
    const h = parsePx(el.style.height) || r.height;
    setBox(el, NaN, NaN, Math.max(4, w + dw), Math.max(4, h + dh));
    updateReadout();
  }

  function exportData(){
    const data = targets().map(el => {
      const r = el.getBoundingClientRect();
      return {
        key: nodeKey(el),
        text: (el.textContent || "").trim(),
        leftPx: parsePx(el.style.left),
        topPx: parsePx(el.style.top),
        widthPx: parsePx(el.style.width) || Math.round(r.width),
        heightPx: parsePx(el.style.height) || Math.round(r.height),
        className: String(el.className || "")
      };
    });

    const json = JSON.stringify(data, null, 2);
    const out = activeDoc().getElementById("sf-liv028-true-hitbox-export");
    if (out) out.textContent = json;
    console.log("[Signal Flow] LIV-028 true hitbox export", data);
    return json;
  }

  function downloadExport(){
    const json = exportData();
    const blob = new Blob([json], {type:"application/json"});
    const a = activeDoc().createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = EXPORT_NAME;
    activeDoc().body.appendChild(a);
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
      console.log("[Signal Flow] LIV-028 true hitbox JSON copied.");
    } catch (err) {
      console.warn("[Signal Flow] Clipboard copy failed; use downloaded JSON or panel output.", err);
    }
  }

  function makePanel(){
    activeDoc().getElementById(PANEL_ID)?.remove();

    const doc = activeDoc();
    const el = doc.createElement("div");
    el.id = PANEL_ID;
    el.style.cssText = [
      "position:fixed",
      "right:18px",
      "bottom:18px",
      "z-index:2147483647",
      "width:340px",
      "padding:12px",
      "border-radius:12px",
      "background:rgba(8,12,16,.95)",
      "border:1px solid rgba(0,229,255,.5)",
      "box-shadow:0 12px 30px rgba(0,0,0,.45)",
      "color:#fff",
      "font:12px system-ui,-apple-system,Segoe UI,sans-serif"
    ].join(";");

    el.innerHTML = `
      <div style="font-weight:900;color:#00e5ff;margin-bottom:8px;letter-spacing:.04em;text-transform:uppercase;">
        LIV-028 True Hitbox Mapper
      </div>
      <div id="sf-liv028-true-hitbox-current" style="margin:0 0 8px;color:#cdefff;">No selection</div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px;">
        <button data-act="prev">Prev</button>
        <button data-act="next">Next</button>
        <button data-act="flash">Flash</button>
      </div>

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

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px;">
        <button data-act="step1">Step 1</button>
        <button data-act="step5">Step 5</button>
        <button data-act="step10">Step 10</button>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">
        <button data-act="export">Export JSON</button>
        <button data-act="copy">Copy JSON</button>
      </div>

      <button data-act="destroy" style="width:100%;background:#552020;color:#fff;border-color:#aa5555;">Close Tool</button>

      <pre id="sf-liv028-true-hitbox-export" style="max-height:130px;overflow:auto;white-space:pre-wrap;background:rgba(255,255,255,.06);padding:8px;border-radius:8px;margin:8px 0 0;"></pre>

      <style>
        #${PANEL_ID} button {
          cursor:pointer;
          border:1px solid rgba(0,229,255,.38);
          border-radius:7px;
          padding:6px 8px;
          background:rgba(255,255,255,.09);
          color:#fff;
          font-weight:800;
        }
        #${PANEL_ID} button:hover { background:rgba(0,229,255,.18); }
      </style>
    `;

    doc.body.appendChild(el);
    return el;
  }

  function flash(){
    const list = targets();
    list.forEach(el => {
      el.style.background = "rgba(255,230,108,.35)";
      el.style.outline = "2px solid #ffe66c";
    });
    setTimeout(decorate, 450);
  }

  function handleAction(act){
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

  function installEvents(){
    panel.addEventListener("click", event => {
      const act = event.target?.dataset?.act;
      if (!act) return;
      event.preventDefault();
      handleAction(act);
    });

    activeDoc().addEventListener("keydown", onKey, true);

    activeDoc().addEventListener("pointerdown", event => {
      const el = event.target?.closest?.('[data-node-key^="liv028-"]');
      if (!el || !isTrueTarget(el)) return;

      const list = targets();
      selectedIndex = list.indexOf(el);
      decorate();

      drag = {
        el,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        left: parsePx(el.style.left),
        top: parsePx(el.style.top)
      };

      el.setPointerCapture?.(event.pointerId);
      event.preventDefault();
      event.stopPropagation();
    }, true);

    activeDoc().addEventListener("pointermove", event => {
      if (!drag) return;
      setBox(drag.el, drag.left + event.clientX - drag.startX, drag.top + event.clientY - drag.startY);
      updateReadout();
      event.preventDefault();
      event.stopPropagation();
    }, true);

    activeDoc().addEventListener("pointerup", event => {
      if (!drag) return;
      drag = null;
      event.preventDefault();
      event.stopPropagation();
    }, true);
  }

  function boot(){
    const target = bestTarget();
    if (!target) {
      console.warn("[Signal Flow] LIV-028 true hitbox mapper: no LIV-028 native layer found.");
      return;
    }

    if (!isLiv028()) {
      console.warn("[Signal Flow] LIV-028 true hitbox mapper loaded, but current page does not look like LIV-028.");
    }

    panel = makePanel();
    targets().forEach(ensureEditableStyle);
    installEvents();
    decorate();

    console.log("[Signal Flow] LIV-028 true hitbox mapper installed", {
      target: target.name,
      targetCount: targets().length,
      targets: targets().map(nodeKey)
    });
  }

  const api = {
    targets,
    selected,
    exportData,
    downloadExport,
    copyExport,
    destroy(){
      docsToScan().forEach(item => {
        item.doc.removeEventListener("keydown", onKey, true);
        item.doc.getElementById(PANEL_ID)?.remove();
      });
      targets().forEach(el => {
        el.style.outline = "";
        el.style.outlineOffset = "";
        el.style.background = "";
        el.style.border = "";
        el.style.cursor = "";
      });
      delete window[DEV_ID];
      console.log("[Signal Flow] LIV-028 true hitbox mapper removed");
    }
  };

  window[DEV_ID] = api;
  boot();
})();
