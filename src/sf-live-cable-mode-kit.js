(() => {
  const VERSION = "v6r426";
  const OLD_STUB_LAYER_ID = "sf-liv019-cable-stub-layer";
  const LEGACY_CABLE_LAYER_ID = "cableLayer";
  const STYLE_ID = "sf-liv019-native-cable-top-layer-style";

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

  function ensureStyle(doc) {
    let style = doc.getElementById(STYLE_ID);
    if (!style) {
      style = doc.createElement("style");
      style.id = STYLE_ID;
      (doc.head || doc.documentElement).appendChild(style);
    }

    style.textContent = `
      .sf-live-native-layer.sf-live-native-level-liv-019 .sf-native-cables {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: absolute !important;
        inset: 0 !important;
        z-index: 2147483600 !important;
        pointer-events: none !important;
        overflow: visible !important;
      }
      .sf-live-native-layer.sf-live-native-level-liv-019 .sf-native-cables * {
        pointer-events: none !important;
      }
      #${LEGACY_CABLE_LAYER_ID}[data-sf-live-cable-mode-kit-suppressed] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
  }

  function suppressLegacyCableLayer(doc) {
    const legacy = doc.getElementById(LEGACY_CABLE_LAYER_ID);
    if (!legacy) return false;

    try {
      legacy.replaceChildren();
    } catch {
      try { legacy.innerHTML = ""; } catch {}
    }

    setImportant(legacy, "display", "none");
    setImportant(legacy, "visibility", "hidden");
    setImportant(legacy, "opacity", "0");
    setImportant(legacy, "pointer-events", "none");
    legacy.dataset.sfLiveCableModeKitSuppressed = VERSION;
    return true;
  }

  function promoteNativeCableLayer(layer) {
    const svg = layer && layer.querySelector(".sf-native-cables");
    if (!svg) return false;

    layer.appendChild(svg);
    setImportant(svg, "display", "block");
    setImportant(svg, "visibility", "visible");
    setImportant(svg, "opacity", "1");
    setImportant(svg, "position", "absolute");
    setImportant(svg, "inset", "0");
    setImportant(svg, "z-index", "2147483600");
    setImportant(svg, "pointer-events", "none");
    setImportant(svg, "overflow", "visible");
    svg.dataset.sfLiveCableModeKit = VERSION;
    svg.dataset.sfLiveCableModeSource = "native-game-cables-top-layer";
    return true;
  }

  function cleanupExperimentalStub(doc) {
    const stub = doc.getElementById(OLD_STUB_LAYER_ID);
    if (!stub) return false;
    stub.remove();
    return true;
  }

  let lastSignature = "";

  function apply(reason) {
    const reports = [];

    docsToScan().forEach(item => {
      const layer = item.doc.querySelector(".sf-live-native-layer.sf-live-native-level-liv-019");
      if (!layer) return;

      ensureStyle(item.doc);
      const removedStubLayer = cleanupExperimentalStub(item.doc);
      const legacySuppressed = suppressLegacyCableLayer(item.doc);
      const nativePromoted = promoteNativeCableLayer(layer);
      const nativeLayer = layer.querySelector(".sf-native-cables");

      reports.push({
        document: item.name,
        reason,
        cableModeSource: "native-game-cables-top-layer",
        removedStubLayer,
        legacySuppressed,
        nativePromoted,
        nativeCableGroups: nativeLayer ? nativeLayer.children.length : 0,
        nativeZIndex: nativeLayer ? getComputedStyle(nativeLayer).zIndex : null
      });
    });

    if (!reports.length) return;

    const signature = JSON.stringify(reports.map(report => ({
      document: report.document,
      removedStubLayer: report.removedStubLayer,
      legacySuppressed: report.legacySuppressed,
      nativePromoted: report.nativePromoted,
      nativeCableGroups: report.nativeCableGroups,
      nativeZIndex: report.nativeZIndex
    })));

    if (signature !== lastSignature || reason === "initial") {
      lastSignature = signature;
      console.log("[Signal Flow] Live cable mode kit applied", {
        version: VERSION,
        cableModeSource: "native-game-cables-top-layer",
        reports
      });
    }
  }

  console.log("[Signal Flow] Live cable mode kit loaded", VERSION);

  apply("initial");

  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    apply("interval");
    if (tries > 80) clearInterval(timer);
  }, 250);
})();
