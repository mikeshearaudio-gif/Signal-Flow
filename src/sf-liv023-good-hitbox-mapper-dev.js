(() => {
  const VERSION = "liv023-good-hitbox-mapper-v4-style-export";
  const BOARD_SELECTOR = ".sf-live-native-level-liv-023";
  const MAX_BOOT_ATTEMPTS = 120;

  const GOOD_NODE_DEFAULTS = [
    ["liv023-lead-vocal-mic", "Lead Vocal Mic", 86, 346, 103, 142],
    ["liv023-keyboard-di-l", "Keyboard DI L", 283, 346, 90, 70],
    ["liv023-keyboard-di-r", "Keyboard DI R", 373, 345, 76, 74],
    ["liv023-stagebox-input-1", "Stage Box Input 1", 59, 251, 23, 26],
    ["liv023-stagebox-input-2", "Stage Box Input 2", 89, 253, 23, 25],
    ["liv023-stagebox-input-3", "Stage Box Input 3", 120, 253, 23, 25],
    ["liv023-ch1-insert-send", "Channel 1 Insert Send", 247, 71, 14, 14],
    ["liv023-ch1-insert-return", "Channel 1 Insert Return", 247, 94, 16, 14],
    ["liv023-aux1-l", "Aux 1 Left Output", 423, 68, 15, 16],
    ["liv023-aux1-r", "Aux 1 Right Output", 441, 67, 15, 17],
    ["liv023-main-l", "Main Left Output", 731, 67, 30, 27],
    ["liv023-main-r", "Main Right Output", 770, 67, 27, 26],
    ["liv023-compressor-input", "Compressor Input", 599, 274, 20, 22],
    ["liv023-compressor-output", "Compressor Output", 677, 275, 20, 20],
    ["liv023-iem-input-l", "IEM A Left Input", 554, 363, 18, 21],
    ["liv023-iem-input-r", "IEM A Right Input", 586, 364, 18, 20],
    ["liv023-crossover-l-input", "Crossover Left Input", 505, 478, 18, 18],
    ["liv023-crossover-r-input", "Crossover Right Input", 545, 478, 18, 18],
    ["liv023-crossover-high-l", "Crossover High Left Output", 656, 451, 19, 19],
    ["liv023-crossover-high-r", "Crossover High Right Output", 698, 451, 17, 21],
    ["liv023-crossover-mid-l", "Crossover Mid Left Output", 658, 477, 18, 21],
    ["liv023-crossover-mid-r", "Crossover Mid Right Output", 699, 478, 17, 17],
    ["liv023-crossover-low-l", "Crossover Low Left Output", 657, 505, 18, 17],
    ["liv023-crossover-low-r", "Crossover Low Right Output", 700, 505, 15, 18],
    ["liv023-high-amp-l", "High Amp Left Input", 519, 580, 20, 22],
    ["liv023-high-amp-r", "High Amp Right Input", 560, 580, 22, 22],
    ["liv023-mid-amp-l", "Mid Amp Left Input", 517, 677, 24, 24],
    ["liv023-mid-amp-r", "Mid Amp Right Input", 558, 678, 24, 21],
    ["liv023-low-amp-l", "Low Amp Left Input", 515, 779, 22, 22],
    ["liv023-low-amp-r", "Low Amp Right Input", 560, 778, 20, 22]
  ];
  const EXPECTED_KEYS = new Set(GOOD_NODE_DEFAULTS.map(n => n[0]));
  const LABEL_BY_KEY = new Map(GOOD_NODE_DEFAULTS.map(n => [n[0], n[1]]));

  function px(value) {
    return parseFloat(value) || 0;
  }

  function nodeStyleRecord(el, label) {
    const key = el.dataset.nodeKey || el.getAttribute("data-node-key") || "";
    return {
      key,
      label: label || el.title || el.getAttribute("aria-label") || LABEL_BY_KEY.get(key) || "",
      leftPx: Math.round(px(el.style.left)),
      topPx: Math.round(px(el.style.top)),
      widthPx: Math.round(px(el.style.width)),
      heightPx: Math.round(px(el.style.height)),
      source: "style"
    };
  }

  function hasUsableInlineBox(el) {
    return ["left", "top", "width", "height"].every(prop => Number.isFinite(parseFloat(el.style[prop])));
  }

  function boardRelativeRectSeed(board, el, label) {
    const boardBox = board.getBoundingClientRect();
    const hitboxBox = el.getBoundingClientRect();
    const key = el.dataset.nodeKey || el.getAttribute("data-node-key") || "";
    return {
      key,
      label: label || el.title || el.getAttribute("aria-label") || LABEL_BY_KEY.get(key) || "",
      leftPx: Math.round(hitboxBox.left - boardBox.left),
      topPx: Math.round(hitboxBox.top - boardBox.top),
      widthPx: Math.round(hitboxBox.width),
      heightPx: Math.round(hitboxBox.height),
      source: "runtime-rect-fallback"
    };
  }

  function collectRuntimeSeeds(board) {
    const seeds = new Map();
    Array.from(board.querySelectorAll("[data-node-key]")).forEach(el => {
      if (el.dataset.sfLiv023GoodNode) return;
      const key = el.dataset.nodeKey || el.getAttribute("data-node-key") || "";
      if (!EXPECTED_KEYS.has(key)) return;
      const current = seeds.get(key);
      const currentIsRuntime = current && current.el && current.el.classList.contains("sf-native-liv023-hitbox");
      const nextIsRuntime = el.classList.contains("sf-native-liv023-hitbox");
      if (current && currentIsRuntime && !nextIsRuntime) return;
      const record = hasUsableInlineBox(el)
        ? nodeStyleRecord(el, LABEL_BY_KEY.get(key))
        : boardRelativeRectSeed(board, el, LABEL_BY_KEY.get(key));
      record.el = el;
      seeds.set(key, record);
    });
    return seeds;
  }

  function stripInternalSeedFields(record) {
    const { key, label, leftPx, topPx, widthPx, heightPx } = record;
    return { key, label, leftPx, topPx, widthPx, heightPx };
  }

  function mismatchAgainst(a, b) {
    return {
      leftPx: Math.abs(a.leftPx - b.leftPx),
      topPx: Math.abs(a.topPx - b.topPx),
      widthPx: Math.abs(a.widthPx - b.widthPx),
      heightPx: Math.abs(a.heightPx - b.heightPx)
    };
  }

  function hasRuntimeSeedCandidates(board) {
    return Array.from(board.querySelectorAll("[data-node-key]")).some(el => {
      if (el.dataset.sfLiv023GoodNode) return false;
      const key = el.dataset.nodeKey || el.getAttribute("data-node-key") || "";
      return EXPECTED_KEYS.has(key);
    });
  }

  function boot(attempt = 0) {
    const board = document.querySelector(BOARD_SELECTOR);
    if (!board) {
      if (attempt < MAX_BOOT_ATTEMPTS) {
        const defer = window.requestAnimationFrame || (fn => window.setTimeout(fn, 50));
        defer(() => boot(attempt + 1));
        return;
      }
      console.warn("[Signal Flow] LIV-023 good mapper: native board not found.", {
        selector: BOARD_SELECTOR,
        version: VERSION
      });
      return;
    }
    if (!hasRuntimeSeedCandidates(board) && attempt < MAX_BOOT_ATTEMPTS) {
      const defer = window.requestAnimationFrame || (fn => window.setTimeout(fn, 50));
      defer(() => boot(attempt + 1));
      return;
    }
    install(board);
  }

  function install(board) {
    if (window.sfLiv023GoodHitboxDev && typeof window.sfLiv023GoodHitboxDev.destroy === "function") {
      window.sfLiv023GoodHitboxDev.destroy();
    }

    document.querySelectorAll("[data-sf-liv023-good-layer], [data-sf-liv023-good-node], [data-sf-liv023-good-panel]").forEach(el => el.remove());

    document.querySelectorAll("[data-sf-liv023-gear-key], [data-sf-liv023-gear-key] img, [data-sf-gear-key^='liv023-'], [data-sf-gear-id^='liv023-']").forEach(el => {
      el.style.setProperty("pointer-events", "none", "important");
      el.style.setProperty("outline", "none", "important");
    });

    const runtimeSeeds = collectRuntimeSeeds(board);
    const fallbackKeys = [];
    const seedRecords = GOOD_NODE_DEFAULTS.map(defaultNode => {
      const [key, label, leftPx, topPx, widthPx, heightPx] = defaultNode;
      const runtimeSeed = runtimeSeeds.get(key);
      if (runtimeSeed) return runtimeSeed;
      fallbackKeys.push(key);
      return { key, label, leftPx, topPx, widthPx, heightPx, source: "fallback" };
    });

    console.log("[Signal Flow] LIV-023 good mapper seed summary", {
      version: VERSION,
      parent: BOARD_SELECTOR,
      runtimeSeedCount: runtimeSeeds.size,
      fallbackSeedCount: fallbackKeys.length,
      fallbackKeys
    });

    const boardRect = board.getBoundingClientRect();
    const layer = document.createElement("div");
    layer.dataset.sfLiv023GoodLayer = "1";
    layer.dataset.sfLiv023GoodParent = BOARD_SELECTOR;
    layer.style.cssText = [
      "position:absolute",
      "left:0",
      "top:0",
      "width:" + Math.max(1400, Math.round(boardRect.width || board.offsetWidth || 0)) + "px",
      "height:" + Math.max(1500, Math.round(boardRect.height || board.offsetHeight || 0)) + "px",
      "z-index:100000",
      "pointer-events:none"
    ].join(";");
    board.appendChild(layer);

    const controller = new AbortController();
    let selected = 0;
    let drag = null;

  const nodes = seedRecords.map((seed, i) => {
    const { key, label, leftPx: left, topPx: top, widthPx: width, heightPx: height } = seed;
    const el = document.createElement("button");
    el.type = "button";
    el.dataset.sfLiv023GoodNode = "1";
    el.dataset.nodeKey = key;
    el.dataset.sfNativeKey = key;
    el.title = label;
    el.setAttribute("aria-label", label);
    el.style.cssText = [
      "position:absolute",
      "left:" + left + "px",
      "top:" + top + "px",
      "width:" + width + "px",
      "height:" + height + "px",
      "min-width:0",
      "min-height:0",
      "max-width:none",
      "max-height:none",
      "box-sizing:border-box",
      "padding:0",
      "margin:0",
      "line-height:0",
      "appearance:none",
      "-webkit-appearance:none",
      "border:0",
      "border-radius:7px",
      "background:rgba(255,210,95,.25)",
      "outline:2px dashed #00e5ff",
      "z-index:9950",
      "cursor:move",
      "pointer-events:auto"
    ].join(";");

    el.addEventListener("pointerdown", e => {
      e.preventDefault();
      e.stopPropagation();
      select(i);
      drag = { i, x: e.clientX, y: e.clientY, left: px(el.style.left), top: px(el.style.top) };
      el.setPointerCapture?.(e.pointerId);
    }, true);

    layer.appendChild(el);
    return el;
  });

  const panel = document.createElement("div");
  panel.dataset.sfLiv023GoodPanel = "1";
  panel.style.cssText = "position:fixed;right:12px;top:88px;z-index:999999;background:#111;color:white;border:2px solid #f5c542;padding:10px;font:12px monospace;max-width:450px";
  panel.innerHTML = `
    <div data-info style="margin-bottom:8px"></div>
    <button data-prev>Prev</button>
    <button data-next>Next</button>
    <button data-export>Download JSON</button>
    <button data-hide>Hide/Show</button>
    <div style="margin-top:8px;line-height:1.45">
      Drag boxes to move.<br>
      [ and ] select.<br>
      Arrows move. Shift+arrows = 10px.<br>
      Alt/Option+arrows resize.
    </div>
  `;
  document.body.appendChild(panel);

  function styleRecord(el) {
    return stripInternalSeedFields(nodeStyleRecord(el, el.title || el.getAttribute("aria-label") || ""));
  }

  function record(el) {
    return styleRecord(el);
  }

  function exportRecords() {
    const data = nodes.map(record);
    const mismatches = data.flatMap((exported, i) => {
      const styled = styleRecord(nodes[i]);
      const delta = mismatchAgainst(exported, styled);
      if (Math.max(delta.leftPx, delta.topPx, delta.widthPx, delta.heightPx) <= 1) return [];
      return [{
        key: exported.key,
        exported,
        styled,
        delta
      }];
    });
    const currentRuntimeSeeds = collectRuntimeSeeds(board);
    const runtimeMismatches = data.flatMap(exported => {
      const runtimeSeed = currentRuntimeSeeds.get(exported.key);
      if (!runtimeSeed) return [];
      const runtime = stripInternalSeedFields(runtimeSeed);
      const delta = mismatchAgainst(exported, runtime);
      if (Math.max(delta.leftPx, delta.topPx, delta.widthPx, delta.heightPx) <= 1) return [];
      return [{ key: exported.key, exported, runtime, delta }];
    });

    if (mismatches.length) {
      console.warn("[Signal Flow] LIV-023 good mapper export coordinate mismatch", {
        parent: BOARD_SELECTOR,
        count: mismatches.length,
        mismatches
      });
    } else {
      console.log("[Signal Flow] LIV-023 good mapper export coordinate self-check passed", {
        parent: BOARD_SELECTOR,
        count: data.length
      });
    }

    if (runtimeMismatches.length) {
      runtimeMismatches.forEach(mismatch => {
        console.warn("[Signal Flow] LIV-023 good mapper per-key runtime mismatch", mismatch);
      });
      console.warn("[Signal Flow] LIV-023 good mapper export differs from current runtime nodes", {
        parent: BOARD_SELECTOR,
        count: runtimeMismatches.length,
        runtimeSeedCount: currentRuntimeSeeds.size,
        mismatches: runtimeMismatches
      });
    } else {
      console.log("[Signal Flow] LIV-023 good mapper runtime self-check passed", {
        parent: BOARD_SELECTOR,
        runtimeSeedCount: currentRuntimeSeeds.size,
        count: data.length
      });
    }

    return data;
  }

  function select(i) {
    selected = (i + nodes.length) % nodes.length;
    nodes.forEach(el => {
      el.style.outline = "2px dashed #00e5ff";
      el.style.background = "rgba(255,210,95,.25)";
    });
    nodes[selected].style.outline = "4px solid yellow";
    nodes[selected].style.background = "rgba(255,255,0,.45)";
    const r = record(nodes[selected]);
    panel.querySelector("[data-info]").textContent = `${selected + 1}/${nodes.length}: ${r.key} pos ${r.leftPx},${r.topPx} size ${r.widthPx}x${r.heightPx}`;
  }

  function move(i, dx, dy) {
    const el = nodes[i];
    el.style.left = Math.round(px(el.style.left) + dx) + "px";
    el.style.top = Math.round(px(el.style.top) + dy) + "px";
    select(i);
  }

  function resize(i, dw, dh) {
    const el = nodes[i];
    el.style.width = Math.max(4, Math.round(px(el.style.width) + dw)) + "px";
    el.style.height = Math.max(4, Math.round(px(el.style.height) + dh)) + "px";
    select(i);
  }

  window.addEventListener("pointermove", e => {
    if (!drag) return;
    const el = nodes[drag.i];
    el.style.left = Math.round(drag.left + e.clientX - drag.x) + "px";
    el.style.top = Math.round(drag.top + e.clientY - drag.y) + "px";
    select(drag.i);
  }, { capture: true, signal: controller.signal });

  window.addEventListener("pointerup", () => { drag = null; }, { capture: true, signal: controller.signal });

  window.addEventListener("keydown", e => {
    if (e.key === "]") { e.preventDefault(); return select(selected + 1); }
    if (e.key === "[") { e.preventDefault(); return select(selected - 1); }
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;

    e.preventDefault();
    const step = e.shiftKey ? 10 : 1;

    if (e.altKey) {
      if (e.key === "ArrowLeft") resize(selected, -step, 0);
      if (e.key === "ArrowRight") resize(selected, step, 0);
      if (e.key === "ArrowUp") resize(selected, 0, -step);
      if (e.key === "ArrowDown") resize(selected, 0, step);
      return;
    }

    if (e.key === "ArrowLeft") move(selected, -step, 0);
    if (e.key === "ArrowRight") move(selected, step, 0);
    if (e.key === "ArrowUp") move(selected, 0, -step);
    if (e.key === "ArrowDown") move(selected, 0, step);
  }, { capture: true, signal: controller.signal });

  window.sfLiv023GoodHitboxDev = {
    board,
    layer,
    version: VERSION,
    export() {
      return exportRecords();
    },
    download() {
      const data = this.export();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "liv023-good-hitboxes-final.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      console.log("[Signal Flow] Downloaded liv023-good-hitboxes-final.json", data.length, "records");
      return data;
    },
    destroy() {
      controller.abort();
      layer.remove();
      panel.remove();
    }
  };

  panel.querySelector("[data-prev]").onclick = () => select(selected - 1);
  panel.querySelector("[data-next]").onclick = () => select(selected + 1);
  panel.querySelector("[data-export]").onclick = () => window.sfLiv023GoodHitboxDev.download();
  panel.querySelector("[data-hide]").onclick = () => {
    const hidden = nodes[0].style.display !== "none";
    nodes.forEach(el => el.style.display = hidden ? "none" : "block");
  };

  select(0);
  console.log("[Signal Flow] LIV-023 good hitbox mapper loaded", VERSION, {
    count: nodes.length,
    parent: BOARD_SELECTOR,
    board
  });
  }

  boot();
})();
