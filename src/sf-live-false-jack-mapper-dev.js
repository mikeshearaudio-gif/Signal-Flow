(function(){
  const VERSION = "liv026-false-jack-mapper-1";
  console.log("[Signal Flow] False Jack Mapper loaded", VERSION);

  const layer = document.querySelector(".sf-live-native-layer.sf-live-native-level-liv-026");
  if (!layer) {
    console.warn("[Signal Flow] False Jack Mapper waiting: LIV-026 layer not found.");
    setTimeout(arguments.callee, 300);
    return;
  }

  let selected = null;
  let count = 0;

  function makeFalseJack(x=40,y=40){
    count += 1;
    const el = document.createElement("button");
    el.type = "button";
    el.className = "sf-liv026-false-jack-dev";
    el.dataset.sfFalseJackKey = "liv026-false-jack-" + String(count).padStart(3,"0");
    el.style.cssText = [
      "position:absolute",
      "left:"+x+"px",
      "top:"+y+"px",
      "width:34px",
      "height:34px",
      "border:2px dashed rgba(255,80,80,.85)",
      "border-radius:50%",
      "background:rgba(255,80,80,.18)",
      "z-index:3400",
      "pointer-events:auto",
      "cursor:pointer"
    ].join(";");
    el.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      selected = el;
      mark();
    });
    layer.appendChild(el);
    selected = el;
    mark();
  }

  function mark(){
    layer.querySelectorAll(".sf-liv026-false-jack-dev").forEach(el=>{
      el.style.outline = el === selected ? "3px solid #fff06a" : "none";
    });
  }

  function px(el, prop){ return parseFloat(el.style[prop] || "0") || 0; }

  function exportFalse(){
    const data = Array.from(layer.querySelectorAll(".sf-liv026-false-jack-dev")).map(el => ({
      key: el.dataset.sfFalseJackKey,
      leftPx: Math.round(px(el,"left")*100)/100,
      topPx: Math.round(px(el,"top")*100)/100,
      widthPx: Math.round(px(el,"width")*100)/100,
      heightPx: Math.round(px(el,"height")*100)/100
    }));
    console.log("[Signal Flow] LIV-026 false jack export", data);
    try { navigator.clipboard.writeText(JSON.stringify(data,null,2)); } catch(e){}
    window.__sfLiv026FalseJackExport = data;
  }

  document.addEventListener("keydown", e => {
    if ((e.target.tagName||"").match(/INPUT|TEXTAREA|SELECT/)) return;
    const step = e.altKey ? 10 : (e.shiftKey ? 5 : 1);
    if (e.key === "n" || e.key === "N") { makeFalseJack(80,80); e.preventDefault(); return; }
    if (e.key === "e" || e.key === "E") { exportFalse(); e.preventDefault(); return; }
    if (!selected) return;

    if (e.key === "ArrowLeft") selected.style.left = px(selected,"left") - step + "px";
    else if (e.key === "ArrowRight") selected.style.left = px(selected,"left") + step + "px";
    else if (e.key === "ArrowUp") selected.style.top = px(selected,"top") - step + "px";
    else if (e.key === "ArrowDown") selected.style.top = px(selected,"top") + step + "px";
    else if (e.key === "=" || e.key === "+") selected.style.width = selected.style.height = px(selected,"width") + step + "px";
    else if (e.key === "-" || e.key === "_") selected.style.width = selected.style.height = Math.max(8, px(selected,"width") - step) + "px";
    else return;
    e.preventDefault();
  }, true);

  makeFalseJack(80,80);
})();
