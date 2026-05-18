(function () {
  "use strict";
  const VERSION = "v6r240";
  const MARKER = "sfLiv011V6r240CleanupInstalled";
  if (window[MARKER]) return;
  window[MARKER] = true;
  function textOf(el) { return String((el && (el.textContent || el.value || el.getAttribute("aria-label"))) || "").trim(); }
  function isLiv011Active() {
    const bodyText = document.body ? String(document.body.textContent || "") : "";
    const boardSelect = Array.from(document.querySelectorAll("select, input")).some(el => /LIV-011/i.test(String(el.value || el.textContent || "")));
    return /LIV-011/.test(bodyText) || boardSelect;
  }
  function replaceText(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest("script, style, noscript")) return NodeFilter.FILTER_REJECT;
        return /System Processor|System processor|Monitor and System Rack|Processor Rack/.test(node.nodeValue || "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      node.nodeValue = String(node.nodeValue || "")
        .replace(/Monitor and System Rack/g, "Crossover Rack")
        .replace(/Processor Rack/g, "Crossover Rack")
        .replace(/System Processor Left In/g, "Crossover Left In")
        .replace(/System Processor Right In/g, "Crossover Right In")
        .replace(/System Processor L In/g, "Crossover L In")
        .replace(/System Processor R In/g, "Crossover R In")
        .replace(/System Processor/g, "Crossover")
        .replace(/System processor/g, "Crossover");
    });
  }
  function hideElement(el) {
    if (!el) return;
    el.style.display = "none";
    el.style.visibility = "hidden";
    el.setAttribute("aria-hidden", "true");
    if ("tabIndex" in el) el.tabIndex = -1;
  }
  function hideLegacyControls(root) {
    if (!root) return;
    root.querySelectorAll("button, [role='button'], [data-node-key], .sf-native-node").forEach(el => {
      const t = textOf(el).toLowerCase().replace(/\s+/g, " ");
      const key = String(el.getAttribute("data-node-key") || "").toLowerCase();
      if (t === "inspect" || t === "back panel" || /open vocal mic input/.test(t) || key === "open-vocal-mic-input") hideElement(el);
    });
  }
  function cleanup() {
    if (!isLiv011Active() || !document.body) return;
    document.body.classList.add("sf-liv011-v6r240-clean");
    replaceText(document.body);
    hideLegacyControls(document.body);
  }
  let queued = false;
  function scheduleCleanup() { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; cleanup(); }); }
  document.addEventListener("DOMContentLoaded", scheduleCleanup, { once: true });
  window.addEventListener("load", scheduleCleanup, { once: true });
  document.addEventListener("click", scheduleCleanup, true);
  document.addEventListener("change", scheduleCleanup, true);
  const observer = new MutationObserver(scheduleCleanup);
  function startObserver() { if (document.body) { observer.observe(document.body, { childList: true, subtree: true, characterData: true }); scheduleCleanup(); } else { setTimeout(startObserver, 50); } }
  startObserver();
  window.sfLiv011V6r240Cleanup = cleanup;
  console.log("[Signal Flow] LIV-011 cleanup " + VERSION + " installed");
})();
