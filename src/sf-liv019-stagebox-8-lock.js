(() => {
  const VERSION = "v6r404";

  console.log("[Signal Flow] LIV-019 8-input stagebox lock loaded", VERSION);

  function docsToScan() {
    const docs = [{ name: "top", doc: document }];
    document.querySelectorAll("iframe").forEach((frame, i) => {
      try {
        if (frame.contentDocument) docs.push({ name: `iframe-${i}`, doc: frame.contentDocument });
      } catch {}
    });
    return docs;
  }

  function killExtraStageboxInputs(layer) {
    let killed = 0;

    for (let n = 9; n <= 16; n += 1) {
      const key = `stagebox-input-${n}`;
      layer.querySelectorAll(`[data-node-key="${key}"], [data-key="${key}"], [data-source-key="${key}"]`).forEach(el => {
        el.dataset.sfLiv019KilledStageboxExtra = "true";
        el.style.setProperty("display", "none", "important");
        el.style.setProperty("visibility", "hidden", "important");
        el.style.setProperty("pointer-events", "none", "important");
        el.remove();
        killed += 1;
      });
    }

    return killed;
  }

  function scan() {
    let ok = false;

    docsToScan().forEach(item => {
      const layer = item.doc.querySelector(".sf-live-native-layer.sf-live-native-level-liv-019");
      if (!layer) return;

      const killed = killExtraStageboxInputs(layer);
      layer.dataset.sfLiv019Stagebox8Lock = VERSION;

      if (killed) {
        console.log("[Signal Flow] LIV-019 stagebox extra inputs removed", {
          version: VERSION,
          document: item.name,
          killed
        });
      }

      ok = true;
    });

    return ok;
  }

  scan();

  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (scan() || tries > 100) clearInterval(timer);
  }, 200);
})();
