(function(){
  const VERSION = "sf-live-hitbox-mapper-dev-v5-reusable-waiting";

  function param(name) {
    try {
      const own = new URLSearchParams(window.location.search || "");
      if (own.get(name)) return own.get(name);
      if (window.parent && window.parent !== window) {
        const parent = new URLSearchParams(window.parent.location.search || "");
        if (parent.get(name)) return parent.get(name);
      }
    } catch (_) {}
    return "";
  }

  const cfg = window.SF_LIVE_DEV_CONFIG || {};
  const LEVEL_ID = String(param("sfLiveDevLevel") || cfg.levelId || "LIV-020").toUpperCase();
  const layerSelector = cfg.layerSelector || ".sf-live-native-layer.sf-live-native-level-" + LEVEL_ID.toLowerCase();
  const keyPrefix = param("sfLiveHitboxPrefix") || cfg.keyPrefix || "";
  let explicitKeys = String(param("sfLiveHitboxKeys") || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  if (!explicitKeys.length && LEVEL_ID === "LIV-025") {
    explicitKeys = [
      "matrix-1-output",
      "front-fill-processor-input",
      "front-fill-processor-output",
      "front-fill-amp-input"
    ];
  }

  function px(n){ return Math.round(Number(n) * 100) / 100; }

  function nodeKey(el) {
    return (
      el.getAttribute("data-node-key") ||
      el.getAttribute("data-sf-native-key") ||
      el.getAttribute("data-sf-native-node-key") ||
      el.getAttribute("data-sf-node-key") ||
      el.getAttribute("data-key") ||
      el.getAttribute("data-id") ||
      el.dataset.nodeKey ||
      el.dataset.sfNativeKey ||
      el.dataset.sfNativeNodeKey ||
      el.dataset.sfNodeKey ||
      el.dataset.key ||
      el.getAttribute("aria-label") ||
      el.getAttribute("title") ||
      ""
    );
  }

  function looksInteractive(el) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return false;
    if (cs.display === "none" || cs.visibility === "hidden") return false;
    if (el.classList.contains("sf-native-source")) return false;
    if (el.getAttribute("data-node-kind") === "source") return false;
    if (el.matches("button,[role='button'],[tabindex],.sf-native-node,.sf-native-jack,.sf-native-hotspot")) return true;
    if (cs.pointerEvents !== "none" && (cs.cursor === "pointer" || cs.cursor === "grab" || cs.cursor === "move")) return true;
    return false;
  }

  function findTargets(layer) {
    let nodes = Array.from(layer.querySelectorAll(
      "[data-node-key], [data-sf-native-key], [data-sf-native-node-key], [data-sf-node-key], [data-key], [data-id], button, [role='button'], [tabindex], .sf-native-node, .sf-native-jack, .sf-native-hotspot"
    ));

    nodes = nodes.filter(el => {
      const key = nodeKey(el);
      if (!key) return false;
      if (!looksInteractive(el)) return false;
      if (explicitKeys.length && !explicitKeys.includes(key)) return false;
      if (keyPrefix && !key.startsWith(keyPrefix)) return false;
      return true;
    });

    // De-dupe by resolved key.
    const seen = new Set();
    nodes = nodes.filter(el => {
      const key = nodeKey(el);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return nodes;
  }

  function rectFromNode(el) {
    const left = parseFloat(el.style.left || el.offsetLeft || 0);
    const top = parseFloat(el.style.top || el.offsetTop || 0);
    const width = parseFloat(el.style.width || el.offsetWidth || 30);
    const height = parseFloat(el.style.height || el.offsetHeight || 30);
    return { left: left - width / 2, top: top - height / 2, width, height };
  }

  function install(layer) {
    document.querySelectorAll(".sf-live-hitbox-dev-panel,.sf-live-hitbox-dev-box").forEach(el => el.remove());

    let targets = findTargets(layer);
    const boxes = [];
    let selected = null;

    if (explicitKeys.length) {
      targets = explicitKeys.map((key, i) => {
        const found = targets.find(el => nodeKey(el) === key);
        if (found) return found;
        return {
          __virtualHitbox: true,
          __key: key,
          __rect: {
            left: 120 + i * 70,
            top: 120,
            width: 34,
            height: 34
          }
        };
      });
    }

    targets.forEach(node => {
      const key = node.__virtualHitbox ? node.__key : nodeKey(node);
      const r = node.__virtualHitbox ? node.__rect : rectFromNode(node);

      const box = document.createElement("div");
      box.className = "sf-live-hitbox-dev-box";
      box.dataset.nodeKey = key;
      box.style.cssText = [
        "position:absolute",
        "left:" + r.left + "px",
        "top:" + r.top + "px",
        "width:" + r.width + "px",
        "height:" + r.height + "px",
        "z-index:8000",
        "box-sizing:border-box",
        "border:2px solid rgba(255,215,80,.96)",
        "background:rgba(255,215,80,.12)",
        "border-radius:50%",
        "cursor:move",
        "pointer-events:auto"
      ].join(";");
      box.tabIndex = 0;
      layer.appendChild(box);
      boxes.push(box);

      function select() {
        selected = box;
        boxes.forEach(b => b.style.outline = "");
        box.style.outline = "3px solid rgba(90,210,255,.96)";
        console.log("[Signal Flow] Live hitbox selected", exportOne(box));
      }

      box.addEventListener("pointerdown", ev => {
        ev.preventDefault();
        ev.stopPropagation();
        select();

        const startX = ev.clientX;
        const startY = ev.clientY;
        const startL = parseFloat(box.style.left);
        const startT = parseFloat(box.style.top);

        function move(e) {
          box.style.left = (startL + e.clientX - startX) + "px";
          box.style.top = (startT + e.clientY - startY) + "px";
          sync(box);
        }

        function up() {
          window.removeEventListener("pointermove", move, true);
          window.removeEventListener("pointerup", up, true);
        }

        window.addEventListener("pointermove", move, true);
        window.addEventListener("pointerup", up, true);
      }, true);

      box.addEventListener("click", ev => {
        ev.preventDefault();
        ev.stopPropagation();
        select();
      }, true);
    });

    function sync(box) {
      const key = box.dataset.nodeKey;
      const node = Array.from(layer.querySelectorAll("*")).find(el => nodeKey(el) === key);
      if (!node) return;

      const l = parseFloat(box.style.left);
      const t = parseFloat(box.style.top);
      const w = parseFloat(box.style.width);
      const h = parseFloat(box.style.height);
      const cx = l + w / 2;
      const cy = t + h / 2;

      node.style.left = cx + "px";
      node.style.top = cy + "px";
      node.style.width = w + "px";
      node.style.height = h + "px";
      node.dataset.sfNativePointX = String(cx);
      node.dataset.sfNativePointY = String(cy);
    }

    function exportOne(box) {
      return {
        key: box.dataset.nodeKey,
        leftPx: px(parseFloat(box.style.left)),
        topPx: px(parseFloat(box.style.top)),
        widthPx: px(parseFloat(box.style.width)),
        heightPx: px(parseFloat(box.style.height))
      };
    }

    function exportAll() {
      const data = boxes.map(exportOne);
      console.log("[Signal Flow] " + LEVEL_ID + " hitbox export", JSON.stringify(data, null, 2));
      return data;
    }

    function nudge(dx, dy, dw, dh) {
      if (!selected) return;
      selected.style.left = (parseFloat(selected.style.left) + dx) + "px";
      selected.style.top = (parseFloat(selected.style.top) + dy) + "px";
      selected.style.width = Math.max(6, parseFloat(selected.style.width) + dw) + "px";
      selected.style.height = Math.max(6, parseFloat(selected.style.height) + dh) + "px";
      sync(selected);
    }

    document.addEventListener("keydown", ev => {
      if (!selected) return;
      const step = ev.altKey ? 10 : 1;
      const resize = ev.shiftKey;

      if (ev.key === "ArrowLeft") { ev.preventDefault(); resize ? nudge(0,0,-step,0) : nudge(-step,0,0,0); }
      if (ev.key === "ArrowRight") { ev.preventDefault(); resize ? nudge(0,0,step,0) : nudge(step,0,0,0); }
      if (ev.key === "ArrowUp") { ev.preventDefault(); resize ? nudge(0,0,0,-step) : nudge(0,-step,0,0); }
      if (ev.key === "ArrowDown") { ev.preventDefault(); resize ? nudge(0,0,0,step) : nudge(0,step,0,0); }
      if (ev.key.toLowerCase() === "e") exportAll();
    }, true);

    const panel = document.createElement("div");
    panel.className = "sf-live-hitbox-dev-panel";
    panel.style.cssText = "position:fixed;right:12px;top:90px;z-index:99999;background:#111;color:#f4f1dc;border:1px solid #ffd75a;border-radius:8px;padding:10px;font:12px system-ui;box-shadow:0 6px 20px rgba(0,0,0,.45)";
    panel.innerHTML = "<b>" + LEVEL_ID + " Hitboxes</b><br>Drag boxes. Arrows move.<br>Shift+arrows resize. Alt=10px.<br>Press E to export.";
    document.body.appendChild(panel);

    window.sfLiveHitboxDev = { levelId: LEVEL_ID, boxes, export: exportAll };
    if (boxes[0]) boxes[0].click();

    console.log("[Signal Flow] Live Hitbox Mapper installed", VERSION, {
      levelId: LEVEL_ID,
      layerSelector,
      targets: boxes.length
    });
  }

  let tries = 0;
  const timer = setInterval(() => {
    const layer = document.querySelector(layerSelector);
    tries++;
    if (layer) {
      clearInterval(timer);
      install(layer);
    } else if (tries === 1) {
      console.log("[Signal Flow] Live hitbox mapper waiting for native layer.", { levelId: LEVEL_ID, layerSelector });
    } else if (tries > 100) {
      clearInterval(timer);
      console.warn("[Signal Flow] Live hitbox mapper: no usable hitbox targets found after wait.", { levelId: LEVEL_ID, layerSelector, layerFound: !!layer, targetCount: layer ? findTargets(layer).length : 0 });
    }
  }, 100);
})();



// Reusable hitbox mapper control correction.
// Keeps the existing mapper UI, but fixes selection + 1px resize.
// Arrows = move 1px. Alt+arrows = move 10px.
// Shift+arrows = resize 1px. Shift+Alt+arrows = resize 10px.
// [ and ] cycle boxes.
(function installReusableHitboxKeyboardFix(){
  if (window.sfLiveHitboxKeyboardFixV13) return;
  window.sfLiveHitboxKeyboardFixV13 = true;

  function boxes(){
    return Array.from(document.querySelectorAll(".sf-live-hitbox-dev-box"));
  }

  function selected(){
    return window.sfLiveHitboxSelectedBox ||
           window.sfLiveHitboxActiveBox ||
           boxes().find(el => String(el.style.outline || "").includes("255")) ||
           boxes()[0] ||
           null;
  }

  function selectBox(el){
    if (!el) return;
    window.sfLiveHitboxSelectedBox = el;
    window.sfLiveHitboxActiveBox = el;

    boxes().forEach(box => {
      box.style.outline = box === el
        ? "2px solid rgba(255,230,90,.95)"
        : "1px solid rgba(255,210,95,.55)";
      box.style.pointerEvents = "auto";
      box.style.visibility = "visible";
    });

    console.log("[Signal Flow] Live hitbox selected", {
      key: el.dataset.nodeKey || el.dataset.sfNativeKey || "",
      leftPx: parseFloat(el.style.left) || 0,
      topPx: parseFloat(el.style.top) || 0,
      widthPx: parseFloat(el.style.width) || 0,
      heightPx: parseFloat(el.style.height) || 0
    });
  }

  function cycle(delta){
    const list = boxes();
    if (!list.length) return;
    const cur = selected();
    const i = Math.max(0, list.indexOf(cur));
    selectBox(list[(i + delta + list.length) % list.length]);
  }

  document.addEventListener("pointerdown", event => {
    const box = event.target && event.target.closest && event.target.closest(".sf-live-hitbox-dev-box");
    if (box) selectBox(box);
  }, true);

  document.addEventListener("keydown", event => {
    if (event.key === "[") {
      event.preventDefault();
      event.stopImmediatePropagation();
      cycle(-1);
      return;
    }

    if (event.key === "]") {
      event.preventDefault();
      event.stopImmediatePropagation();
      cycle(1);
      return;
    }

    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;

    const el = selected();
    if (!el) return;

    const amount = event.altKey ? 10 : 1;
    let dx = 0;
    let dy = 0;

    if (event.key === "ArrowLeft") dx = -amount;
    if (event.key === "ArrowRight") dx = amount;
    if (event.key === "ArrowUp") dy = -amount;
    if (event.key === "ArrowDown") dy = amount;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const left = parseFloat(el.style.left) || 0;
    const top = parseFloat(el.style.top) || 0;
    const width = parseFloat(el.style.width) || 34;
    const height = parseFloat(el.style.height) || 34;

    if (event.shiftKey) {
      el.style.width = Math.max(4, width + dx) + "px";
      el.style.height = Math.max(4, height + dy) + "px";
    } else {
      el.style.left = (left + dx) + "px";
      el.style.top = (top + dy) + "px";
    }

    selectBox(el);
  }, true);

  const timer = setInterval(() => {
    const list = boxes();
    if (!list.length) return;
    clearInterval(timer);

    document.querySelectorAll(".sf-live-native-layer, #patchbayWrap").forEach(el => {
      el.style.overflow = "visible";
    });

    selectBox(list[0]);
    console.log("[Signal Flow] Reusable hitbox keyboard fix v13 active", { targets: list.length });
  }, 200);
})();
