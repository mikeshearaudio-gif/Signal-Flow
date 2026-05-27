(() => {
  const VERSION = "v6r399";

  console.log("[Signal Flow] LIV-019 FOH label lock loaded", VERSION);

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

  function hideOldFohPlaceholderLabels(layer) {
    const old = new Set([
      "A1", "A2", "A3", "A4", "A5", "A6",
      "B1L", "B1R", "B2L", "B2R", "B3L", "B3R",
      "9", "10", "11", "12", "13", "14"
    ]);

    let hidden = 0;
    let nodeTextMuted = 0;

    layer.querySelectorAll("div, span").forEach(el => {
      if (!el || el.nodeType !== 1) return;

      const txt = String(el.textContent || "").trim();
      if (!old.has(txt)) return;

      // Never hide the new labels we create inside the FOH gear.
      if (el.closest('[data-liv019-gear-key="foh"]')) return;

      const nearestNode = el.closest("[data-node-key], .sf-native-node");

      if (nearestNode) {
        // If this text is inside an interactive jack node, hide the text but keep the node usable.
        setImportant(el, "color", "transparent");
        setImportant(el, "text-shadow", "none");
        setImportant(el, "background", "transparent");
        setImportant(el, "border-color", "transparent");
        setImportant(el, "pointer-events", "none");
        nodeTextMuted += 1;
      } else {
        setImportant(el, "display", "none");
        setImportant(el, "visibility", "hidden");
        setImportant(el, "pointer-events", "none");
        hidden += 1;
      }
    });

    return { hidden, nodeTextMuted };
  }

  function makeLabel(parent, key, text, x, y, opts = {}) {
    parent.querySelector(`[data-liv019-foh-label="${key}"]`)?.remove();

    const el = parent.ownerDocument.createElement("div");
    el.dataset.liv019FohLabel = key;
    el.dataset.liv019OverlayKey = `foh-${key}`;
    el.dataset.liv019OverlayKind = "foh-label";
    el.textContent = text;

    setImportant(el, "position", "absolute");
    setImportant(el, "left", x);
    setImportant(el, "top", y);
    setImportant(el, "transform", "translate(-50%, -50%)");
    setImportant(el, "z-index", opts.z || "34");
    setImportant(el, "pointer-events", "none");
    setImportant(el, "white-space", "nowrap");
    setImportant(el, "text-align", "center");
    setImportant(el, "font-family", "system-ui, -apple-system, Segoe UI, sans-serif");
    setImportant(el, "font-weight", opts.weight || "900");
    setImportant(el, "font-size", opts.size || "7px");
    setImportant(el, "letter-spacing", opts.spacing || ".08em");
    setImportant(el, "color", opts.color || "#ffffff");
    setImportant(el, "background", opts.background || "transparent");
    setImportant(el, "text-shadow", "0 1px 2px rgba(0,0,0,.95), 0 0 4px rgba(0,0,0,.9)");
    setImportant(el, "text-transform", opts.upper === false ? "none" : "uppercase");

    parent.appendChild(el);
    return el;
  }

  function installFohLabels(foh) {
    let added = 0;

    // Section labels.
    makeLabel(foh, "section-inputs", "INPUTS", "24%", "13.0%", {
      size: "9px",
      color: "#ffe66c",
      spacing: ".11em"
    });
    makeLabel(foh, "section-aux", "AUX SENDS", "27%", "47.0%", {
      size: "8px",
      color: "#ffe66c",
      spacing: ".10em"
    });
    makeLabel(foh, "section-bus", "58%", "47.0%", {
      size: "8px",
      color: "#ffe66c",
      spacing: ".10em"
    });
    makeLabel(foh, "section-main", "MAIN OUTPUT", "91.8%", "15.5%", {
      size: "8px",
      color: "#ffe66c",
      spacing: ".10em"
    });
    added += 4;

    // FOH input numbers 1-16.
    [
      ["1", "8.6%", "31.5%"], ["2", "12.8%", "31.5%"], ["3", "17.0%", "31.5%"], ["4", "21.2%", "31.5%"],
      ["5", "25.4%", "31.5%"], ["6", "29.6%", "31.5%"], ["7", "33.8%", "31.5%"], ["8", "38.0%", "31.5%"],
      ["9", "66.5%", "18.5%"], ["10", "70.3%", "18.5%"], ["11", "74.1%", "18.5%"], ["12", "77.9%", "18.5%"],
      ["13", "66.5%", "36.0%"], ["14", "70.3%", "36.0%"], ["15", "74.1%", "36.0%"], ["16", "77.9%", "36.0%"]
    ].forEach(([n, x, y]) => {
      makeLabel(foh, `input-${n}`, n, x, y, { size: "7px", color: "#ffffff" });
      added += 1;
    });

    // Aux sends 1-8.
    [
      ["1", "12.1%"], ["2", "16.3%"], ["3", "20.5%"], ["4", "24.7%"],
      ["5", "28.9%"], ["6", "33.1%"], ["7", "37.3%"], ["8", "41.5%"]
    ].forEach(([n, x]) => {
      makeLabel(foh, `aux-${n}`, n, x, "61.5%", { size: "7px", color: "#ffffff" });
      added += 1;
    });

    // Bus outs 1-12.
    [
      ["1", "50.0%", "61.5%"], ["2", "53.8%", "61.5%"], ["3", "57.6%", "61.5%"], ["4", "61.4%", "61.5%"],
      ["5", "65.2%", "61.5%"], ["6", "69.0%", "61.5%"], ["7", "72.8%", "61.5%"], ["8", "76.6%", "61.5%"],
      ["9", "50.0%", "77.0%"], ["10", "53.8%", "77.0%"], ["11", "57.6%", "77.0%"], ["12", "61.4%", "77.0%"]
    ].forEach(([n, x, y]) => {
      makeLabel(foh, `bus-${n}`, n, x, y, { size: "7px", color: "#ffffff" });
      added += 1;
    });

    // Main L/R.
    makeLabel(foh, "main-l", "L", "88.5%", "46.5%", { size: "8px", color: "#ffffff" });
    makeLabel(foh, "main-r", "R", "95.5%", "46.5%", { size: "8px", color: "#ffffff" });
    added += 2;

    return added;
  }

  function installInDoc(item) {
    const doc = item.doc;
    const layer = doc.querySelector(".sf-live-native-layer.sf-live-native-level-liv-019");
    if (!layer) return false;

    const foh = layer.querySelector('[data-liv019-gear-key="foh"]');
    if (!foh) return false;

    const old = hideOldFohPlaceholderLabels(layer);
    const fohLabelsAdded = installFohLabels(foh);

    layer.dataset.sfLiv019FohLabelLock = VERSION;

    console.log("[Signal Flow] LIV-019 FOH label lock applied", {
      version: VERSION,
      document: item.name,
      oldLabelsHidden: old.hidden,
      oldNodeTextMuted: old.nodeTextMuted,
      fohLabelsAdded
    });

    return true;
  }

  function scan() {
    let ok = false;
    docsToScan().forEach(item => {
      try {
        ok = installInDoc(item) || ok;
      } catch (err) {
        console.warn("[Signal Flow] LIV-019 FOH label lock failed", item.name, err);
      }
    });
    return ok;
  }

  scan();

  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (scan() || tries > 80) clearInterval(timer);
  }, 250);
})();
