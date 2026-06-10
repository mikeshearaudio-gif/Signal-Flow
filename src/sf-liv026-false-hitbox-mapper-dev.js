(function(){
  const VERSION = "sf-liv026-false-hitbox-mapper-dev-v2-waiting-standalone";
  const SELECTOR = ".sf-live-native-layer.sf-live-native-level-liv-026";
  let tries = 0;

  function px(n){ return Math.round(Number(n) || 0); }

  function boot(){
    const layer = document.querySelector(SELECTOR);
    if (!layer) {
      if (++tries < 100) return setTimeout(boot, 100);
      console.warn("[Signal Flow] LIV-026 false jack mapper gave up waiting for layer.");
      return;
    }

    document.querySelectorAll("#sf-liv026-false-dev-panel").forEach(el => el.remove());

    const existing = Array.from(layer.querySelectorAll("[data-node-key^='liv026-false-']"));
    if (!existing.length) {
      [
        ["liv026-false-matrix-1", 150, 105],
        ["liv026-false-matrix-2", 200, 105],
        ["liv026-false-matrix-3", 250, 105],
        ["liv026-false-aux-1", 520, 105],
        ["liv026-false-aux-2", 560, 105],
        ["liv026-false-bus-4", 785, 105],
        ["liv026-false-bus-5", 725, 145],
        ["liv026-false-bus-6", 765, 145]
      ].forEach(([key,x,y]) => addFalse(layer, key, x, y, 34, 34));
    }

    let nodes = Array.from(layer.querySelectorAll("[data-node-key^='liv026-false-']"));
    let index = 0;
    let step = 5;

    function addFalse(layer, key, x, y, w, h) {
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.nodeKey = key;
      b.dataset.sfFalseJack = "1";
      b.className = "sf-native-jack sf-liv026-false-dev-jack";
      b.style.cssText = [
        "position:absolute",
        `left:${x}px`,
        `top:${y}px`,
        `width:${w}px`,
        `height:${h}px`,
        "z-index:3200",
        "border:2px dashed rgba(255,80,120,.95)",
        "border-radius:50%",
        "background:rgba(255,40,90,.18)",
        "box-shadow:0 0 10px rgba(255,70,110,.75)",
        "pointer-events:auto",
        "cursor:pointer",
        "padding:0",
        "margin:0"
      ].join(";");
      layer.appendChild(b);
      return b;
    }

    function selected(){ return nodes[index] || nodes[0]; }
    function mark(){
      nodes.forEach((el,i)=>el.style.outline = i === index ? "3px solid #fff" : "none");
      const el = selected();
      if (el) console.log("[Signal Flow] LIV-026 false selected", { index:index+1, total:nodes.length, key:el.dataset.nodeKey });
    }
    function move(dx,dy){
      const el = selected(); if(!el) return;
      el.style.left = px(parseFloat(el.style.left) + dx * step) + "px";
      el.style.top = px(parseFloat(el.style.top) + dy * step) + "px";
    }
    function size(dw,dh){
      const el = selected(); if(!el) return;
      el.style.width = Math.max(8, px(parseFloat(el.style.width) + dw * step)) + "px";
      el.style.height = Math.max(8, px(parseFloat(el.style.height) + dh * step)) + "px";
    }
    function exportFalse(){
      const data = nodes.map(el => ({
        key: el.dataset.nodeKey,
        leftPx: px(parseFloat(el.style.left)),
        topPx: px(parseFloat(el.style.top)),
        widthPx: px(parseFloat(el.style.width)),
        heightPx: px(parseFloat(el.style.height))
      }));
      window.__sfLiv026FalseHitboxes = data;
      console.log("[Signal Flow] LIV-026 false hitbox export", JSON.stringify(data, null, 2));
      return data;
    }

    const panel = document.createElement("div");
    panel.id = "sf-liv026-false-dev-panel";
    panel.style.cssText = "position:fixed;right:12px;top:190px;z-index:2147483647;background:#16070b;color:#ffeef3;border:1px solid #ff7590;border-radius:10px;padding:10px;font:12px system-ui;max-width:270px";
    panel.innerHTML = "<b>LIV-026 FALSE JACKS</b><br>[ / ] select<br>Arrows move<br>Shift+Arrows resize<br>A add jack<br>D delete jack<br>E export JSON";
    document.body.appendChild(panel);

    document.addEventListener("keydown", function(e){
      if (["INPUT","TEXTAREA","SELECT"].includes((e.target && e.target.tagName)||"")) return;
      let used = true;
      if (e.key === "[") index = (index - 1 + nodes.length) % nodes.length;
      else if (e.key === "]") index = (index + 1) % nodes.length;
      else if (e.key === "ArrowUp") e.shiftKey ? size(0,-1) : move(0,-1);
      else if (e.key === "ArrowDown") e.shiftKey ? size(0,1) : move(0,1);
      else if (e.key === "ArrowLeft") e.shiftKey ? size(-1,0) : move(-1,0);
      else if (e.key === "ArrowRight") e.shiftKey ? size(1,0) : move(1,0);
      else if (e.key === "a" || e.key === "A") { nodes.push(addFalse(layer, "liv026-false-" + Date.now(), 500, 300, 34, 34)); index = nodes.length - 1; }
      else if (e.key === "d" || e.key === "D") { const el = selected(); if(el){ el.remove(); nodes.splice(index,1); index = Math.max(0, index-1); } }
      else if (e.key === "e" || e.key === "E") exportFalse();
      else used = false;
      if (used) { e.preventDefault(); e.stopPropagation(); mark(); }
    }, true);

    mark();
    console.log("[Signal Flow] LIV-026 false jack mapper installed", VERSION, { targets:nodes.length });
  }

  boot();
})();
