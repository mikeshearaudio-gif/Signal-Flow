(function() {
  const VERSION = "liv026-processor-deco-cleanup-1";

  function getLiv026Layer() {
    return document.querySelector(".sf-live-native-layer.sf-live-native-level-liv-026");
  }

  function hideBadProcessorDecorations() {
    const layer = getLiv026Layer();
    if (!layer) return false;

    const boardRect = layer.getBoundingClientRect();
    let hidden = 0;

    Array.from(layer.querySelectorAll(".sf-liv026-movable-xlrm")).forEach(function(el) {
      const label = (el.textContent || "").trim().toUpperCase();
      const rect = el.getBoundingClientRect();
      const left = rect.left - boardRect.left;
      const top = rect.top - boardRect.top;

      const isWrongProcessorDecoration =
        (label === "SUB OUT" || label === "FILL OUT") &&
        left >= 500 &&
        left <= 650 &&
        top >= 300 &&
        top <= 390;

      if (!isWrongProcessorDecoration) return;

      el.dataset.sfLiv026ProcessorDecoHidden = "1";
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("visibility", "hidden", "important");
      el.style.setProperty("pointer-events", "none", "important");
      hidden += 1;
    });

    if (hidden) {
      console.log("[Signal Flow] LIV-026 processor decorative SUB/FILL modules hidden", VERSION, hidden);
    }

    return true;
  }

  function install() {
    let tries = 0;

    function tick() {
      tries += 1;
      hideBadProcessorDecorations();

      if (tries < 80) {
        setTimeout(tick, 100);
      }
    }

    tick();

    const observer = new MutationObserver(function() {
      hideBadProcessorDecorations();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    console.log("[Signal Flow] LIV-026 processor deco cleanup active", VERSION);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install);
  } else {
    install();
  }
})();
