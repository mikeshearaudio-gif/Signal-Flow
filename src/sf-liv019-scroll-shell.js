(() => {
  const VERSION = "v6r389";

  // LIV-019 v6r389:
  // Fixes bad v6r387/v6r388 layer anchoring.
  // The native layer must stay absolute at top-left.
  // Do NOT use inset:auto.
  const CANVAS_W = 1320;
  const CANVAS_H = 820;

  console.log("[Signal Flow] LIV-019 scroll shell loaded", VERSION);

  function setImportant(el, prop, value) {
    if (el) el.style.setProperty(prop, value, "important");
  }

  function docsToScan() {
    const docs = [{ name: "top", doc: document }];
    document.querySelectorAll("iframe").forEach((frame, index) => {
      try {
        if (frame.contentDocument) docs.push({ name: `iframe-${index}`, doc: frame.contentDocument });
      } catch {}
    });
    return docs;
  }

  function installInDoc(item) {
    const doc = item.doc;
    const layer = doc.querySelector(".sf-live-native-layer.sf-live-native-level-liv-019");
    const patchbay = doc.querySelector("#patchbay");
    const wrap = patchbay?.closest(".patchbay-wrap") || doc.querySelector(".patchbay-wrap");

    if (!layer || !patchbay || !wrap) return false;
    if (wrap.dataset.sfLiv019ScrollShell === VERSION) return true;

    wrap.dataset.sfLiv019ScrollShell = VERSION;

    setImportant(wrap, "overflow-x", "auto");
    setImportant(wrap, "overflow-y", "auto");
    setImportant(wrap, "overscroll-behavior", "contain");
    setImportant(wrap, "touch-action", "pan-x pan-y");

    setImportant(patchbay, "position", "relative");
    setImportant(patchbay, "display", "block");
    setImportant(patchbay, "width", `${CANVAS_W}px`);
    setImportant(patchbay, "min-width", `${CANVAS_W}px`);
    setImportant(patchbay, "height", `${CANVAS_H}px`);
    setImportant(patchbay, "min-height", `${CANVAS_H}px`);
    setImportant(patchbay, "max-height", "none");
    setImportant(patchbay, "margin", "0");
    setImportant(patchbay, "padding", "0");
    setImportant(patchbay, "transform", "none");
    setImportant(patchbay, "overflow", "hidden");

    // Critical fix: anchor the native layer with inset: 0 auto auto 0.
    // Do not set inset:auto; that caused the big top gap.
    setImportant(layer, "position", "absolute");
    setImportant(layer, "inset", "0 auto auto 0");
    setImportant(layer, "left", "0px");
    setImportant(layer, "top", "0px");
    setImportant(layer, "right", "auto");
    setImportant(layer, "bottom", "auto");
    setImportant(layer, "width", `${CANVAS_W}px`);
    setImportant(layer, "min-width", `${CANVAS_W}px`);
    setImportant(layer, "height", `${CANVAS_H}px`);
    setImportant(layer, "min-height", `${CANVAS_H}px`);
    setImportant(layer, "max-height", "none");
    setImportant(layer, "margin", "0");
    setImportant(layer, "padding", "0");
    setImportant(layer, "transform", "none");
    setImportant(layer, "overflow", "visible");

    const legacyCableLayer = wrap.querySelector("#cableLayer") || doc.getElementById("cableLayer");
    if (legacyCableLayer) {
      legacyCableLayer.setAttribute("width", String(CANVAS_W));
      legacyCableLayer.setAttribute("height", String(CANVAS_H));
      setImportant(legacyCableLayer, "position", "absolute");
      setImportant(legacyCableLayer, "inset", "0 auto auto 0");
      setImportant(legacyCableLayer, "left", "0px");
      setImportant(legacyCableLayer, "top", "0px");
      setImportant(legacyCableLayer, "width", `${CANVAS_W}px`);
      setImportant(legacyCableLayer, "height", `${CANVAS_H}px`);
      setImportant(legacyCableLayer, "max-width", `${CANVAS_W}px`);
      setImportant(legacyCableLayer, "max-height", `${CANVAS_H}px`);
      setImportant(legacyCableLayer, "overflow", "hidden");
      setImportant(legacyCableLayer, "pointer-events", "none");
      setImportant(legacyCableLayer, "transform", "none");
    }

    const hintTooltip = wrap.querySelector("#hintTooltip") || doc.getElementById("hintTooltip");
    if (hintTooltip) {
      setImportant(hintTooltip, "position", "absolute");
      setImportant(hintTooltip, "left", "0px");
      setImportant(hintTooltip, "top", "0px");
      setImportant(hintTooltip, "width", "0px");
      setImportant(hintTooltip, "height", "0px");
      setImportant(hintTooltip, "pointer-events", "none");
    }

    // Start at the actual board top once, without fighting later user scroll.
    wrap.scrollTop = 0;

    console.log("[Signal Flow] LIV-019 scroll shell installed", {
      version: VERSION,
      document: item.name,
      wrapClient: `${wrap.clientWidth} x ${wrap.clientHeight}`,
      wrapScroll: `${wrap.scrollWidth} x ${wrap.scrollHeight}`,
      patchbay: `${patchbay.clientWidth} x ${patchbay.clientHeight}`,
      layer: `${layer.clientWidth} x ${layer.clientHeight}`,
      scrollTop: wrap.scrollTop,
      scrollLeft: wrap.scrollLeft
    });

    return true;
  }

  function scan() {
    let installed = false;
    docsToScan().forEach(item => {
      try {
        installed = installInDoc(item) || installed;
      } catch (err) {
        console.warn("[Signal Flow] LIV-019 scroll shell install failed", item.name, err);
      }
    });
    return installed;
  }

  scan();

  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (scan() || tries > 80) clearInterval(timer);
  }, 250);
})();
