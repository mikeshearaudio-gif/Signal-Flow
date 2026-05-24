(() => {
  const VERSION = "v6r376";
  const CANVAS_W = 1220;
  const CANVAS_H = 760;

  console.log("[Signal Flow] LIV-018 scroll shell loaded", VERSION);

  function setImportant(el, prop, value) {
    if (el) el.style.setProperty(prop, value, "important");
  }

  function docsToScan() {
    const docs = [{ name: "top", doc: document }];

    document.querySelectorAll("iframe").forEach((frame, index) => {
      try {
        if (frame.contentDocument) {
          docs.push({ name: `iframe-${index}`, doc: frame.contentDocument });
        }
      } catch (err) {}
    });

    return docs;
  }

  function installInDoc(item) {
    const doc = item.doc;
    const layer = doc.querySelector(".sf-live-native-layer.sf-live-native-level-liv-018");
    const patchbay = doc.querySelector("#patchbay");
    const wrap = patchbay?.closest(".patchbay-wrap") || doc.querySelector(".patchbay-wrap");

    if (!layer || !patchbay || !wrap) return false;
    if (wrap.dataset.sfLiv018ScrollShell === VERSION) return true;

    wrap.dataset.sfLiv018ScrollShell = VERSION;

    // Keep the known LIV-018 coordinate canvas. Do not remap gear/hitboxes.
    [patchbay, layer].forEach(el => {
      setImportant(el, "width", `${CANVAS_W}px`);
      setImportant(el, "min-width", `${CANVAS_W}px`);
      setImportant(el, "height", `${CANVAS_H}px`);
      setImportant(el, "min-height", `${CANVAS_H}px`);
      setImportant(el, "max-height", "none");
    });

    // The wrapper is the scroll host.
    setImportant(wrap, "overflow-x", "auto");
    setImportant(wrap, "overflow-y", "auto");
    setImportant(wrap, "overscroll-behavior", "contain");
    setImportant(wrap, "touch-action", "pan-x pan-y");

    // Legacy cable layer must not inflate scroll footprint.
    const legacyCableLayer = wrap.querySelector("#cableLayer") || doc.getElementById("cableLayer");
    if (legacyCableLayer) {
      legacyCableLayer.setAttribute("width", String(CANVAS_W));
      legacyCableLayer.setAttribute("height", String(CANVAS_H));
      setImportant(legacyCableLayer, "width", `${CANVAS_W}px`);
      setImportant(legacyCableLayer, "height", `${CANVAS_H}px`);
      setImportant(legacyCableLayer, "max-width", `${CANVAS_W}px`);
      setImportant(legacyCableLayer, "max-height", `${CANVAS_H}px`);
      setImportant(legacyCableLayer, "left", "0px");
      setImportant(legacyCableLayer, "top", "0px");
      setImportant(legacyCableLayer, "overflow", "hidden");
      setImportant(legacyCableLayer, "pointer-events", "none");
    }

    // Tooltip should not create scroll height.
    const hintTooltip = wrap.querySelector("#hintTooltip") || doc.getElementById("hintTooltip");
    if (hintTooltip) {
      setImportant(hintTooltip, "position", "absolute");
      setImportant(hintTooltip, "left", "0px");
      setImportant(hintTooltip, "top", "0px");
      setImportant(hintTooltip, "width", "0px");
      setImportant(hintTooltip, "height", "0px");
      setImportant(hintTooltip, "pointer-events", "none");
    }

    let lockedAxis = null;
    let releaseTimer = null;

    function normalizeDelta(event) {
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? wrap.clientHeight : 1;
      return {
        x: event.deltaX * unit,
        y: event.deltaY * unit
      };
    }

    wrap.addEventListener("wheel", event => {
      if (event.ctrlKey) return;

      const maxX = Math.max(0, wrap.scrollWidth - wrap.clientWidth);
      const maxY = Math.max(0, wrap.scrollHeight - wrap.clientHeight);
      if (!maxX && !maxY) return;

      const delta = normalizeDelta(event);
      const ax = Math.abs(delta.x);
      const ay = Math.abs(delta.y);

      clearTimeout(releaseTimer);
      releaseTimer = setTimeout(() => {
        lockedAxis = null;
      }, 160);

      if (!lockedAxis) {
        if (event.shiftKey && maxX > 0) {
          lockedAxis = "x";
        } else if (ax >= ay * 0.75 && maxX > 0) {
          lockedAxis = "x";
        } else {
          lockedAxis = "y";
        }
      }

      if (lockedAxis === "x" && maxX > 0) {
        const move = event.shiftKey && Math.abs(delta.x) < 1 ? delta.y : delta.x;
        wrap.scrollLeft = Math.max(0, Math.min(maxX, wrap.scrollLeft + move));
        event.preventDefault();
        return;
      }

      if (lockedAxis === "y" && maxY > 0) {
        const keepX = wrap.scrollLeft;
        wrap.scrollTop = Math.max(0, Math.min(maxY, wrap.scrollTop + delta.y));
        wrap.scrollLeft = keepX;
        event.preventDefault();
      }
    }, { passive: false });

    console.log("[Signal Flow] LIV-018 scroll shell installed", {
      version: VERSION,
      document: item.name,
      wrapClient: `${wrap.clientWidth} x ${wrap.clientHeight}`,
      wrapScroll: `${wrap.scrollWidth} x ${wrap.scrollHeight}`,
      patchbay: `${patchbay.clientWidth} x ${patchbay.clientHeight}`,
      layer: `${layer.clientWidth} x ${layer.clientHeight}`
    });

    return true;
  }

  function scan() {
    let installed = false;
    docsToScan().forEach(item => {
      try {
        installed = installInDoc(item) || installed;
      } catch (err) {
        console.warn("[Signal Flow] LIV-018 scroll shell install failed", item.name, err);
      }
    });
    return installed;
  }

  scan();

  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (scan() || tries > 80) {
      clearInterval(timer);
    }
  }, 250);

  if (typeof MutationObserver !== "undefined") {
    const observer = new MutationObserver(() => scan());
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
