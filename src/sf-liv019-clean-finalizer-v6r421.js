(() => {
  const VERSION = "v6r421-clean-finalizer";
  console.log("[Signal Flow] LIV-019 clean finalizer loaded", VERSION);

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
    if (el) el.style.setProperty(prop, value, "important");
  }

  function cleanup(doc) {
    const layer = doc.querySelector(".sf-live-native-layer.sf-live-native-level-liv-019");
    if (!layer) return false;

    [
      "#sf-liv019-gear-mover",
      "#sf-liv019-overlay-mover",
      "#sf-liv019-foh-label-mover",
      "#sf-liv019-hitbox-mapper",
      ".sf-liv019-hitbox-visual-layer",
      "#sf-liv019-centered-cable-layer",
      "#sf-liv019-viewport-cable-layer"
    ].forEach(selector => {
      doc.querySelectorAll(selector).forEach(el => el.remove());
    });

    layer.querySelectorAll(".sf-native-liv019-source-panel, .sf-native-liv009-source-panel").forEach(panel => {
      setImportant(panel, "display", "none");
      setImportant(panel, "visibility", "hidden");
      setImportant(panel, "pointer-events", "none");
    });

    layer.dataset.sfLiv019CleanFinalizer = VERSION;
    return true;
  }

  let lastAppliedSignature = "";

  function applyAll(reason) {
    const docs = [];
    docsToScan().forEach(item => {
      if (cleanup(item.doc)) docs.push(item.name);
    });

    if (docs.length) {
      const signature = docs.join("|");
      if (signature !== lastAppliedSignature || reason === "initial") {
        lastAppliedSignature = signature;
        console.log("[Signal Flow] LIV-019 clean finalizer applied", {
          version: VERSION,
          role: "tool-cleanup-only-no-cables",
          reason,
          documents: docs
        });
      }
    }
  }

  applyAll("initial");

  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    applyAll("interval");
    if (tries > 40) clearInterval(timer);
  }, 250);
})();
