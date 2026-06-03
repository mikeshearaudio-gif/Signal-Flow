(() => {
  const VERSION = "sf-liv020-bad-route-hitbox-dev-v2-movable-113";
  const LEVEL_ID = "LIV-020";
  const API_NAME = "sfLiv020BadRouteDev";

  const GROUPS = [
    ["mic-in", 24, "Mic In"],
    ["insert", 32, "Insert"],
    ["aux-out", 20, "Aux Out"],
    ["bus-out", 25, "Bus Out"],
    ["matrix-out", 4, "Matrix Out"],
    ["main-alt", 4, "Main Alt"],
    ["iem-unused", 4, "IEM Unused"]
  ];

  const DEFAULT_W = 28;
  const DEFAULT_H = 34;

  function getLayer() {
    return document.querySelector(".sf-live-native-layer.sf-live-native-level-liv-020");
  }

  function makeTargets() {
    const targets = [];
    let n = 1;

    GROUPS.forEach(([prefix, count, label]) => {
      for (let i = 1; i <= count; i += 1) {
        targets.push({
          key: `liv020-bad-${prefix}-${String(i).padStart(2, "0")}`,
          label: `${label} ${i}`,
          leftPx: 20 + ((n - 1) % 12) * 48,
          topPx: 900 + Math.floor((n - 1) / 12) * 46,
          widthPx: DEFAULT_W,
          heightPx: DEFAULT_H
        });
        n += 1;
      }
    });

    return targets;
  }

  let targets = makeTargets();
  let selectedIndex = 0;

  function getOrCreateBox(layer, target, index) {
    let el = layer.querySelector(`[data-sf-liv020-bad-key="${target.key}"]`);

    if (!el) {
      el = document.createElement("div");
      el.className = "sf-liv020-bad-route-hitbox-dev";
      el.dataset.sfLiv020BadKey = target.key;
      el.dataset.sfLiveDevHitboxKey = target.key;
      el.dataset.sfBadRouteIndex = String(index);
      el.title = target.label;
      layer.appendChild(el);
    }

    return el;
  }

  function styleBox(el, target, selected) {
    el.style.position = "absolute";
    el.style.left = target.leftPx + "px";
    el.style.top = target.topPx + "px";
    el.style.width = target.widthPx + "px";
    el.style.height = target.heightPx + "px";
    el.style.border = selected ? "2px solid #ff3b30" : "1px solid rgba(255,59,48,.75)";
    el.style.background = selected ? "rgba(255,59,48,.25)" : "rgba(255,59,48,.11)";
    el.style.boxShadow = selected ? "0 0 0 2px rgba(255,255,255,.55)" : "none";
    el.style.borderRadius = "7px";
    el.style.zIndex = selected ? "99997" : "99996";
    el.style.pointerEvents = "auto";
    el.style.cursor = "move";
    el.style.boxSizing = "border-box";
    el.textContent = selected ? String(Number(el.dataset.sfBadRouteIndex) + 1) : "";
    el.style.color = "#fff";
    el.style.font = "700 10px/1 sans-serif";
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
  }

  function render(reason = "render") {
    const layer = getLayer();
    if (!layer) {
      console.warn("[Signal Flow] LIV-020 bad-route dev: layer not found", { reason });
      return false;
    }

    targets.forEach((target, index) => {
      const el = getOrCreateBox(layer, target, index);
      styleBox(el, target, index === selectedIndex);
      el.onclick = ev => {
        ev.preventDefault();
        ev.stopPropagation();
        select(index);
      };
    });

    console.log("[Signal Flow] LIV-020 bad-route hitbox dev rendered", {
      version: VERSION,
      reason,
      selectedIndex,
      selected: targets[selectedIndex],
      targets: targets.length,
      note: "DEV-only bad-route hitboxes. The 38 locked valid hitboxes are untouched."
    });

    return true;
  }

  function select(index) {
    const nextIndex = Math.max(0, Math.min(targets.length - 1, Number(index) || 0));
    selectedIndex = nextIndex;
    render("select");
    return targets[selectedIndex];
  }

  function next() {
    return select((selectedIndex + 1) % targets.length);
  }

  function prev() {
    return select((selectedIndex - 1 + targets.length) % targets.length);
  }

  function nudge(dx = 0, dy = 0) {
    const target = targets[selectedIndex];
    target.leftPx += Number(dx) || 0;
    target.topPx += Number(dy) || 0;
    render("nudge");
    return target;
  }

  function resize(dw = 0, dh = 0) {
    const target = targets[selectedIndex];
    target.widthPx = Math.max(4, target.widthPx + (Number(dw) || 0));
    target.heightPx = Math.max(4, target.heightPx + (Number(dh) || 0));
    render("resize");
    return target;
  }

  function exportJson() {
    const out = targets.map(t => ({
      key: t.key,
      label: t.label,
      leftPx: t.leftPx,
      topPx: t.topPx,
      widthPx: t.widthPx,
      heightPx: t.heightPx,
      centerX: Math.round(t.leftPx + t.widthPx / 2),
      centerY: Math.round(t.topPx + t.heightPx / 2)
    }));

    console.log("[Signal Flow] LIV-020 BAD ROUTE HITBOX JSON");
    console.log(JSON.stringify(out, null, 2));
    return out;
  }

  function installKeyboard() {
    if (window.__sfLiv020BadRouteKeyboardInstalled) return;
    window.__sfLiv020BadRouteKeyboardInstalled = true;

    window.addEventListener("keydown", ev => {
      if (!window[API_NAME] || !window[API_NAME].enabled) return;

      const step = ev.shiftKey ? 10 : 1;

      if (ev.key === "ArrowLeft") {
        ev.preventDefault();
        nudge(-step, 0);
      } else if (ev.key === "ArrowRight") {
        ev.preventDefault();
        nudge(step, 0);
      } else if (ev.key === "ArrowUp") {
        ev.preventDefault();
        nudge(0, -step);
      } else if (ev.key === "ArrowDown") {
        ev.preventDefault();
        nudge(0, step);
      } else if (ev.key === "[") {
        ev.preventDefault();
        prev();
      } else if (ev.key === "]") {
        ev.preventDefault();
        next();
      }
    }, true);
  }

  window[API_NAME] = {
    version: VERSION,
    enabled: true,
    count: () => targets.length,
    current: () => targets[selectedIndex],
    all: () => targets.slice(),
    render,
    select,
    next,
    prev,
    nudge,
    resize,
    export: exportJson
  };

  installKeyboard();

  setTimeout(() => render("initial-timeout-0"), 0);
  setTimeout(() => render("initial-timeout-100"), 100);
  setTimeout(() => render("initial-timeout-500"), 500);

  console.log("[Signal Flow] LIV-020 bad-route hitbox dev installed", {
    version: VERSION,
    targets: targets.length,
    api: `window.${API_NAME}`,
    keys: Object.keys(window[API_NAME])
  });
})();
