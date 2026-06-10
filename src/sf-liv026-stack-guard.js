(function(){
  const VERSION = "liv026-stack-guard-1";

  function apply() {
    const layer = document.querySelector(".sf-live-native-layer.sf-live-native-level-liv-026");
    if (!layer) return;

    layer.querySelectorAll('[data-node-key]').forEach(el => {
      const key = String(el.dataset.nodeKey || "");

      if (key.startsWith("liv026-false-")) {
        el.style.setProperty("z-index", "2100", "important");
        el.style.setProperty("pointer-events", "auto", "important");
        el.style.setProperty("opacity", "0", "important");
        return;
      }

      if (key.startsWith("liv026-")) {
        el.style.setProperty("z-index", "5200", "important");
        el.style.setProperty("pointer-events", "auto", "important");
      }
    });

    layer.querySelectorAll("svg, .sf-native-cable-layer, .sf-live-native-cable-layer").forEach(el => {
      el.style.setProperty("z-index", "4800", "important");
      el.style.setProperty("pointer-events", "none", "important");
    });
  }

  apply();
  setInterval(apply, 250);
  console.log("[Signal Flow] LIV-026 stack guard active", VERSION);
})();
