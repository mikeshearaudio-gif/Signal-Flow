(() => {
  const VERSION = "v6r407";

  const LABEL_LOCKS = {
    iem1: [
      { find: ["INPUT A"], text: "INPUT A", left: "9.5%", top: "37%", minWidth: "43px", fontSize: "7px", color: "rgb(255, 230, 108)" },
      { find: ["INPUT B"], text: "INPUT B", left: "90.5%", top: "38%", minWidth: "43px", fontSize: "7px", color: "rgb(255, 230, 108)" },
      { find: ["IEM 1"], text: "IEM 1", left: "28.5%", top: "37%", minWidth: "52px", fontSize: "9px", color: "rgb(189, 234, 255)" },
      { find: ["IEM 2"], text: "IEM 2", left: "52.5%", top: "36.5%", minWidth: "52px", fontSize: "9px", color: "rgb(189, 234, 255)" }
    ],
    iem2: [
      { find: ["INPUT A"], text: "INPUT A", left: "9.5%", top: "39%", minWidth: "43px", fontSize: "7px", color: "rgb(255, 230, 108)" },
      { find: ["INPUT B"], text: "INPUT B", left: "90.5%", top: "37%", minWidth: "43px", fontSize: "7px", color: "rgb(255, 230, 108)" },
      { find: ["IEM 3"], text: "IEM 3", left: "28%", top: "38%", minWidth: "52px", fontSize: "9px", color: "rgb(189, 234, 255)" },
      { find: ["IEM 4"], text: "IEM 4", left: "52%", top: "38%", minWidth: "52px", fontSize: "9px", color: "rgb(189, 234, 255)" }
    ],
    iem3: [
      { find: ["INPUT A"], text: "INPUT A", left: "9%", top: "37.5%", minWidth: "38px", fontSize: "6px", color: "rgb(255, 230, 108)" },
      { find: ["INPUT B"], text: "INPUT B", left: "90%", top: "37.5%", minWidth: "43px", fontSize: "6px", color: "rgb(255, 230, 108)", background: "rgba(0, 0, 0, 0.82)" },
      { find: ["IEM 5"], text: "IEM 5", left: "28%", top: "36.5%", minWidth: "52px", fontSize: "9px", color: "rgb(189, 234, 255)" },
      { find: ["SPARE", "IEM 6"], text: "IEM 6", left: "52%", top: "37%", minWidth: "42px", fontSize: "9px", color: "rgb(189, 234, 255)", background: "rgba(0, 0, 0, 0.82)" }
    ],
    reverb: [
      { find: ["REVERB"], text: "REVERB", left: "50%", top: "43.5%", minWidth: "55px", fontSize: "8px", color: "rgb(169, 214, 255)", background: "rgba(0, 20, 50, 0.86)" },
      { find: ["IN L"], text: "IN L", left: "10%", top: "80.5%", minWidth: "38px", fontSize: "9px", color: "rgb(255, 230, 108)" },
      { find: ["IN R"], text: "IN R", left: "23.5%", top: "80.5%", minWidth: "38px", fontSize: "9px", color: "rgb(255, 230, 108)" },
      { find: ["LINK"], text: "LINK", left: "50%", top: "82.5%", minWidth: "44px", fontSize: "9px", color: "rgb(255, 184, 107)" },
      { find: ["OUT L"], text: "OUT L", left: "74.5%", top: "81.5%", minWidth: "44px", fontSize: "9px", color: "rgb(255, 230, 108)" },
      { find: ["OUT R"], text: "OUT R", left: "87%", top: "81%", minWidth: "44px", fontSize: "9px", color: "rgb(255, 230, 108)" }
    ],
    delay: [
      { find: ["DELAY"], text: "DELAY", left: "51.5%", top: "42%", minWidth: "25px", height: "7.5%", fontSize: "8px", color: "rgb(168, 255, 189)", background: "rgba(0, 45, 20, 0.86)" },
      { find: ["IN L"], text: "IN L", left: "11%", top: "80%", minWidth: "38px", fontSize: "9px", color: "rgb(255, 230, 108)" },
      { find: ["IN R"], text: "IN R", left: "23.5%", top: "79.5%", minWidth: "38px", fontSize: "9px", color: "rgb(255, 230, 108)" },
      { find: ["SIDE"], text: "SIDE", left: "50%", top: "79%", minWidth: "44px", fontSize: "9px", color: "rgb(255, 184, 107)" },
      { find: ["OUT L"], text: "OUT L", left: "75.5%", top: "76%", minWidth: "44px", fontSize: "9px", color: "rgb(255, 230, 108)" },
      { find: ["OUT R"], text: "OUT R", left: "88%", top: "77%", minWidth: "44px", fontSize: "9px", color: "rgb(255, 230, 108)" }
    ]
  };

  const LED_LOCKS = {
    reverb: [
      { left: "5.1%", top: "30.7%", width: "26.5%", height: "23.3%" },
      { left: "38.1%", top: "31.7%", width: "25.5%", height: "22.8%" },
      { left: "69.6%", top: "30.7%", width: "26.2%", height: "23.8%" }
    ],
    delay: [
      { left: "4.6%", top: "30.7%", width: "24.5%", height: "21.3%" },
      { left: "39.1%", top: "32.2%", width: "24.5%", height: "21.3%" },
      { left: "70.6%", top: "31.7%", width: "23.7%", height: "21.3%" }
    ]
  };

  function docsToScan() {
    const docs = [{ name: "top", doc: document }];
    document.querySelectorAll("iframe").forEach((frame, i) => {
      try {
        if (frame.contentDocument) docs.push({ name: `iframe-${i}`, doc: frame.contentDocument });
      } catch {}
    });
    return docs;
  }

  function setImportant(el, prop, value) {
    if (el && value !== undefined && value !== "") {
      el.style.setProperty(prop, value, "important");
    }
  }

  function textOf(el) {
    return String(el.textContent || "").trim().toUpperCase();
  }

  function findTextEl(gear, terms) {
    const wanted = terms.map(t => String(t).trim().toUpperCase());
    return Array.from(gear.querySelectorAll("div")).find(el => wanted.includes(textOf(el)));
  }

  function applyLabelLock(gear, lock) {
    const el = findTextEl(gear, lock.find);
    if (!el) return false;

    el.textContent = lock.text;

    setImportant(el, "left", lock.left);
    setImportant(el, "top", lock.top);
    setImportant(el, "min-width", lock.minWidth);
    setImportant(el, "height", lock.height);
    setImportant(el, "font-size", lock.fontSize);
    setImportant(el, "color", lock.color);
    setImportant(el, "background", lock.background || "rgba(0, 0, 0, 0.82)");
    setImportant(el, "pointer-events", "none");

    return true;
  }

  function applyLedLock(gear, locks) {
    const frames = Array.from(gear.querySelectorAll(".sf-liv019-processor-display-frame-recolor"));
    frames.forEach((el, index) => {
      const lock = locks[index];
      if (!lock) return;

      setImportant(el, "left", lock.left);
      setImportant(el, "top", lock.top);
      setImportant(el, "width", lock.width);
      setImportant(el, "height", lock.height);
    });

    return frames.length;
  }

  function hideSecondaryDrumSourcePanel(layer) {
    let hidden = 0;

    layer.querySelectorAll(".sf-native-liv019-source-panel, .sf-native-liv009-source-panel").forEach(panel => {
      setImportant(panel, "display", "none");
      setImportant(panel, "visibility", "hidden");
      setImportant(panel, "pointer-events", "none");
      hidden += 1;
    });

    return hidden;
  }

  function clearWrongDrumHitboxHiding(layer) {
    const drumKeys = [
      "kick",
      "snare",
      "hi-hat",
      "high-rack-tom",
      "low-rack-tom",
      "floor-tom",
      "overhead-left-crash",
      "overhead-right-ride"
    ];

    let restored = 0;

    drumKeys.forEach(key => {
      layer.querySelectorAll(
        `[data-node-key="${key}"], [data-key="${key}"], [data-source-key="${key}"]`
      ).forEach(el => {
        if (el.closest(".sf-native-liv019-source-panel") || el.closest(".sf-native-liv009-source-panel")) return;

        el.classList.remove("sf-liv019-hidden-drum-hitbox");
        el.style.removeProperty("opacity");
        el.style.removeProperty("visibility");
        el.style.removeProperty("display");
        setImportant(el, "pointer-events", "auto");
        restored += 1;
      });
    });

    return restored;
  }

  function installInDoc(item) {
    const doc = item.doc;
    const layer = doc.querySelector(".sf-live-native-layer.sf-live-native-level-liv-019");
    if (!layer) return false;

    const gear = {};
    layer.querySelectorAll("[data-liv019-gear-key]").forEach(el => {
      gear[el.dataset.liv019GearKey] = el;
    });

    let labelsApplied = 0;
    Object.entries(LABEL_LOCKS).forEach(([gearKey, locks]) => {
      const gearEl = gear[gearKey];
      if (!gearEl) return;

      locks.forEach(lock => {
        if (applyLabelLock(gearEl, lock)) labelsApplied += 1;
      });
    });

    let framesApplied = 0;
    Object.entries(LED_LOCKS).forEach(([gearKey, locks]) => {
      const gearEl = gear[gearKey];
      if (!gearEl) return;
      framesApplied += applyLedLock(gearEl, locks);
    });

    const drumHitboxesRestored = clearWrongDrumHitboxHiding(layer);
    const secondaryDrumSourcePanelsHidden = hideSecondaryDrumSourcePanel(layer);

    layer.dataset.sfLiv019OverlayLock = VERSION;

    console.log("[Signal Flow] LIV-019 overlay lock applied", {
      version: VERSION,
      document: item.name,
      labelsApplied,
      framesApplied,
      drumHitboxesRestored,
      secondaryDrumSourcePanelsHidden
    });

    return true;
  }

  function scan() {
    let ok = false;

    docsToScan().forEach(item => {
      try {
        ok = installInDoc(item) || ok;
      } catch (err) {
        console.warn("[Signal Flow] LIV-019 overlay lock failed", item.name, err);
      }
    });

    return ok;
  }

  console.log("[Signal Flow] LIV-019 overlay lock loaded", VERSION);

  scan();

  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (scan() || tries > 80) clearInterval(timer);
  }, 250);
})();
