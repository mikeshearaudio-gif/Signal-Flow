(() => {
  const VERSION = "v6r401";

  const FOH_LABELS = {
    "aux-1": {"text":"1","left":"49.35%","top":"47.5%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "aux-2": {"text":"2","left":"54.55%","top":"47.5%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "aux-3": {"text":"3","left":"49.5%","top":"53.5%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "aux-4": {"text":"4","left":"54.45%","top":"53.5%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "aux-5": {"text":"5","left":"49.4%","top":"60.25%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "aux-6": {"text":"6","left":"54.35%","top":"60.25%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "aux-7": {"text":"7","left":"49.55%","top":"67.5%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "aux-8": {"text":"8","left":"54.5%","top":"67.5%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "bus-1": {"text":"1","left":"60.75%","top":"43%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "bus-2": {"text":"2","left":"65.55%","top":"43%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "bus-3": {"text":"3","left":"70.35%","top":"43%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "bus-4": {"text":"4","left":"74.9%","top":"43%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "bus-5": {"text":"5","left":"60.7%","top":"51.5%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "bus-6": {"text":"6","left":"65.5%","top":"51.5%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "bus-7": {"text":"7","left":"70.3%","top":"51.5%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "bus-8": {"text":"8","left":"74.85%","top":"51.5%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "bus-9": {"text":"9","left":"61%","top":"59.5%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "bus-10": {"text":"10","left":"65.55%","top":"59.5%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "bus-11": {"text":"11","left":"70.1%","top":"59.5%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "bus-12": {"text":"12","left":"74.9%","top":"59.5%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "input-1": {"text":"1","left":"9.6%","top":"42%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "input-2": {"text":"2","left":"14.3%","top":"42%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "input-3": {"text":"3","left":"19%","top":"42%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "input-4": {"text":"4","left":"23.95%","top":"42%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "input-5": {"text":"5","left":"28.65%","top":"42%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "input-6": {"text":"6","left":"33.35%","top":"42%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "input-7": {"text":"7","left":"38.05%","top":"42%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "input-8": {"text":"8","left":"43%","top":"42%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "input-9": {"text":"9","left":"9.5%","top":"54%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "input-10": {"text":"10","left":"14.3%","top":"54%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "input-11": {"text":"11","left":"19.1%","top":"54%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "input-12": {"text":"12","left":"23.9%","top":"54%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "input-13": {"text":"13","left":"28.5%","top":"54%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "input-14": {"text":"14","left":"33.3%","top":"54%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "input-15": {"text":"15","left":"38.1%","top":"54%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "input-16": {"text":"16","left":"42.9%","top":"54%","fontSize":"7px","color":"rgb(255, 255, 255)"},
    "main-l": {"text":"L","left":"85.25%","top":"46.5%","fontSize":"8px","color":"rgb(255, 255, 255)"},
    "main-r": {"text":"R","left":"91.25%","top":"46.5%","fontSize":"8px","color":"rgb(255, 255, 255)"},
    "section-aux": {"text":"AUX SENDS","left":"52%","top":"39%","fontSize":"9px","color":"rgb(255, 230, 108)"},
    "section-bus": {"text":"BUS OUTS","left":"70%","top":"39%","fontSize":"9px","color":"rgb(255, 230, 108)"},
    "section-inputs": {"text":"INPUTS","left":"26.5%","top":"39%","fontSize":"9px","color":"rgb(255, 230, 108)"},
    "section-main": {"text":"MAIN OUTPUT","left":"88.3%","top":"39.5%","fontSize":"9px","color":"rgb(255, 230, 108)"}
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
    if (el && value !== undefined && value !== "") el.style.setProperty(prop, value, "important");
  }

  function makeLabel(foh, key, item) {
    let el = foh.querySelector(`[data-liv019-foh-label="${key}"]`);
    if (!el) {
      el = foh.ownerDocument.createElement("div");
      el.dataset.liv019FohLabel = key;
      el.dataset.liv019OverlayKey = `foh-${key}`;
      el.dataset.liv019OverlayKind = "foh-label";
      foh.appendChild(el);
    }

    el.textContent = item.text;
    setImportant(el, "position", "absolute");
    setImportant(el, "left", item.left);
    setImportant(el, "top", item.top);
    setImportant(el, "transform", "translate(-50%, -50%)");
    setImportant(el, "z-index", "80");
    setImportant(el, "pointer-events", "none");
    setImportant(el, "white-space", "nowrap");
    setImportant(el, "text-align", "center");
    setImportant(el, "font-family", "system-ui, -apple-system, Segoe UI, sans-serif");
    setImportant(el, "font-weight", "900");
    setImportant(el, "font-size", item.fontSize);
    setImportant(el, "letter-spacing", item.text.length > 2 ? ".08em" : ".04em");
    setImportant(el, "color", item.color);
    setImportant(el, "background", "transparent");
    setImportant(el, "text-shadow", "0 1px 2px rgba(0,0,0,.95), 0 0 4px rgba(0,0,0,.9)");
    setImportant(el, "text-transform", "uppercase");
    return el;
  }

  function muteLegacyFohPlaceholders(layer) {
    const old = new Set(["A1","A2","A3","A4","A5","A6","B1L","B1R","B2L","B2R","B3L","B3R","9","10","11","12","13","14"]);
    let muted = 0;

    layer.querySelectorAll("*").forEach(el => {
      if (!el || el.nodeType !== 1) return;
      if (el.closest('[data-liv019-gear-key="foh"]')) return;
      if (el.dataset?.liv019FohLabel) return;

      const txt = String(el.textContent || "").trim();
      if (!old.has(txt)) return;

      setImportant(el, "font-size", "0px");
      setImportant(el, "line-height", "0");
      setImportant(el, "color", "transparent");
      setImportant(el, "text-shadow", "none");
      muted += 1;
    });

    return muted;
  }

  function applyInDoc(item) {
    const layer = item.doc.querySelector(".sf-live-native-layer.sf-live-native-level-liv-019");
    const foh = layer?.querySelector('[data-liv019-gear-key="foh"]');
    if (!layer || !foh) return false;

    let applied = 0;
    Object.entries(FOH_LABELS).forEach(([key, value]) => {
      makeLabel(foh, key, value);
      applied += 1;
    });

    const mutedLegacyLabels = muteLegacyFohPlaceholders(layer);
    layer.dataset.sfLiv019FohFinalLock = VERSION;

    console.log("[Signal Flow] LIV-019 FOH final label lock applied", {
      version: VERSION,
      document: item.name,
      labelsApplied: applied,
      mutedLegacyLabels
    });

    return true;
  }

  function scan() {
    let ok = false;
    docsToScan().forEach(item => {
      try { ok = applyInDoc(item) || ok; }
      catch (err) { console.warn("[Signal Flow] LIV-019 FOH final label lock failed", item.name, err); }
    });
    return ok;
  }

  console.log("[Signal Flow] LIV-019 FOH final label lock loaded", VERSION);

  scan();
  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (scan() || tries > 80) clearInterval(timer);
  }, 250);
})();
