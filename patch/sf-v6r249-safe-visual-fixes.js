(function(){
  "use strict";

  function removeStrayLiteralNewlines(){
    try {
      const roots = [document.documentElement, document.body].filter(Boolean);
      for (const root of roots) {
        for (const node of Array.from(root.childNodes)) {
          if (node.nodeType === Node.TEXT_NODE && /^(\s*\\n\s*)+$/.test(node.nodeValue || "")) {
            node.remove();
          }
        }
      }

      for (const el of Array.from(document.body.querySelectorAll("body > *"))) {
        const txt = (el.textContent || "").trim();
        if (/^(\\n)+$/.test(txt) && el.children.length === 0) {
          el.remove();
        }
      }
    } catch (err) {
      console.warn("[Signal Flow] v6r249 newline cleanup skipped", err);
    }
  }

  function rescueEquipmentLocker(){
    try {
      const candidates = Array.from(document.querySelectorAll("button, div, aside, section, a"))
        .filter(el => /Equipment\s+Locker|Mic\s+Locker/i.test((el.textContent || "").trim()));

      for (const el of candidates) {
        el.classList.add("sf-v6r249-locker-rescue");
        el.style.zIndex = "9999";
        el.style.pointerEvents = "auto";
      }
    } catch (err) {
      console.warn("[Signal Flow] v6r249 locker rescue skipped", err);
    }
  }

  function run(){
    removeStrayLiteralNewlines();
    rescueEquipmentLocker();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }

  window.addEventListener("load", run, { once: true });
  setTimeout(run, 250);
  setTimeout(run, 1000);
  setTimeout(run, 2500);

  console.log("[Signal Flow] v6r249 safe visual fixes installed");
})();
