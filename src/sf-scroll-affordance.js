(() => {
  "use strict";

  const VERSION = "v6r292";
  const STYLE_ID = "sf-scroll-affordance-style-v1";
  const OVERLAY_CLASS = "sf-scroll-affordance-layer";
  const THRESHOLD = 3;
  const IDLE_DELAY = 300;
  const SCAN_DELAY = 120;

  const TARGET_SELECTORS = [
    ".patchbay-wrap[data-sf-liv018-scroll-shell]",
    ".patchbay-wrap[data-sf-liv019-scroll-shell]",
    ".sfdiag-clipboard-panel",
    ".sf-live-native-scroll-host-liv010",
    ".sf-live-native-scroll-host",
    ".sf-live-native-viewport",
    ".patchbay-wrap.front-panel-view",
    ".patchbay-wrap.env-live",
    ".patchbay-wrap",
    ".sf-br-shell-owned",
    "[data-sf-br-shell-root]",
    ".sf-build-room-v6r227"
  ];

  const states = new WeakMap();
  const attached = [];
  const buildRoomReports = new Set();
  let scanTimer = 0;
  let installedLog = false;
  let lastTargetLogKey = "";

  function logInstall() {
    if (installedLog) return;
    installedLog = true;
    console.log("[Signal Flow] Scroll affordance installed", {
      version: VERSION,
      mode: "passive-idle-state-machine"
    });
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
.sf-scroll-affordance-layer {
  position: fixed;
  inset: auto;
  z-index: 12000;
  pointer-events: none !important;
  contain: layout style;
}
.sf-scroll-affordance-layer .sf-scroll-cue {
  position: absolute;
  z-index: 1;
  width: 24px;
  height: 24px;
  opacity: 0;
  pointer-events: none !important;
  background: transparent;
  border: 0;
  box-shadow: none;
  transition: opacity 120ms linear;
}
.sf-scroll-affordance-layer .sf-scroll-cue.is-visible {
  opacity: .68;
}
.sf-scroll-affordance-layer .sf-scroll-cue::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 11px;
  height: 11px;
  border: solid rgba(238, 246, 232, .82);
  border-width: 0 2px 2px 0;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, .7));
}
.sf-scroll-affordance-layer .sf-scroll-cue-left {
  left: 8px;
  top: calc(50% - 12px);
}
.sf-scroll-affordance-layer .sf-scroll-cue-left::before {
  transform: translate(-35%, -50%) rotate(135deg);
}
.sf-scroll-affordance-layer .sf-scroll-cue-right {
  right: 8px;
  top: calc(50% - 12px);
}
.sf-scroll-affordance-layer .sf-scroll-cue-right::before {
  transform: translate(-65%, -50%) rotate(-45deg);
}
.sf-scroll-affordance-layer .sf-scroll-cue-up {
  left: calc(50% - 12px);
  top: 8px;
}
.sf-scroll-affordance-layer .sf-scroll-cue-up::before {
  transform: translate(-50%, -35%) rotate(-135deg);
}
.sf-scroll-affordance-layer .sf-scroll-cue-down {
  left: calc(50% - 12px);
  bottom: 8px;
}
.sf-scroll-affordance-layer .sf-scroll-cue-down::before {
  transform: translate(-50%, -65%) rotate(45deg);
}`;
    document.head.appendChild(style);
  }

  function visible(el) {
    if (!el || !el.isConnected) return false;
    if (el.closest && el.closest("[hidden], [aria-hidden='true']")) return false;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 24 && rect.height > 24;
  }

  function currentLevelId() {
    const candidates = [];
    try { candidates.push(window.sfSignalFlowLedgerState && window.sfSignalFlowLedgerState.currentLevelId); } catch (_) {}
    try { candidates.push(window.SignalFlowLedger && window.SignalFlowLedger.currentLevelId); } catch (_) {}
    try { candidates.push(window.state && window.state.currentLevelId); } catch (_) {}
    try { candidates.push(window.state && window.state.level && window.state.level.id); } catch (_) {}
    candidates.push(location.hash, location.href, document.body && document.body.textContent);
    for (const value of candidates) {
      const match = String(value || "").toUpperCase().match(/\b[A-Z]{3}-\d{3}\b/);
      if (match) return match[0];
    }
    return "unknown";
  }

  function scrollInfo(el) {
    const maxX = Math.max(0, (el.scrollWidth || 0) - (el.clientWidth || 0));
    const maxY = Math.max(0, (el.scrollHeight || 0) - (el.clientHeight || 0));
    const style = getComputedStyle(el);
    const userX = /auto|scroll|overlay/i.test(style.overflowX);
    const userY = /auto|scroll|overlay/i.test(style.overflowY);
    return {
      maxX,
      maxY,
      overflowX: style.overflowX,
      overflowY: style.overflowY,
      canUserScrollX: maxX > THRESHOLD && userX,
      canUserScrollY: maxY > THRESHOLD && userY
    };
  }

  function targetLabel(el) {
    if (!el) return "unknown";
    for (const selector of TARGET_SELECTORS) {
      try {
        if (el.matches(selector)) return selector;
      } catch (_) {}
    }
    return el.id ? "#" + el.id : "." + String(el.className || "").trim().split(/\s+/).filter(Boolean).join(".");
  }

  function targetScore(el, order) {
    if (el.matches && el.matches(".patchbay-wrap[data-sf-liv018-scroll-shell], .patchbay-wrap[data-sf-liv019-scroll-shell]")) return 10000 - order;
    if (el.matches && el.matches(".sfdiag-clipboard-panel")) return 9000 - order;
    if (el.matches && el.matches(".sf-live-native-scroll-host-liv010")) return 8500 - order;
    if (el.matches && el.matches(".sf-live-native-scroll-host")) return 8200 - order;
    if (el.matches && el.matches(".sf-br-shell-owned, [data-sf-br-shell-root], .sf-build-room-v6r227")) return 7800 - order;
    if (el.matches && el.matches(".sf-live-native-viewport")) return 7400 - order;
    if (el.matches && el.matches(".patchbay-wrap")) return 7000 - order;
    return 1000 - order;
  }

  function isBuildRoomActive() {
    return (
      document.body.classList.contains("sf-build-room-v6r227-active") ||
      Boolean(document.querySelector(".sf-build-room-v6r227, .sf-br-shell-owned, [data-sf-br-shell-root]"))
    );
  }

  function isBuildRoomTarget(el) {
    return Boolean(
      el &&
      el.matches &&
      isBuildRoomActive() &&
      el.matches(".sf-br-shell-owned, [data-sf-br-shell-root], .sf-build-room-v6r227")
    );
  }

  function findTargets() {
    const seen = new Set();
    const candidates = [];

    TARGET_SELECTORS.forEach((selector, selectorIndex) => {
      document.querySelectorAll(selector).forEach(el => {
        if (seen.has(el) || !visible(el)) return;
        seen.add(el);
        const info = scrollInfo(el);
        if (!info.canUserScrollX && !info.canUserScrollY) return;
        candidates.push({
          el,
          info,
          score: targetScore(el, selectorIndex)
        });
      });
    });

    candidates.sort((a, b) => b.score - a.score);
    return candidates.map(item => item.el);
  }

  function ensureOverlay(state) {
    if (state.overlay && state.overlay.isConnected) return state.overlay;
    const overlay = document.createElement("div");
    overlay.className = OVERLAY_CLASS;
    overlay.setAttribute("aria-hidden", "true");
    ["left", "right", "up", "down"].forEach(dir => {
      const cue = document.createElement("div");
      cue.className = "sf-scroll-cue sf-scroll-cue-" + dir;
      cue.dataset.direction = dir;
      overlay.appendChild(cue);
    });
    document.body.appendChild(overlay);
    state.overlay = overlay;
    return overlay;
  }

  function directions(el) {
    return {
      left: el.scrollLeft > THRESHOLD,
      right: el.scrollLeft < (el.scrollWidth - el.clientWidth - THRESHOLD),
      up: el.scrollTop > THRESHOLD,
      down: el.scrollTop < (el.scrollHeight - el.clientHeight - THRESHOLD)
    };
  }

  function placeOverlay(el, overlay) {
    const rect = el.getBoundingClientRect();
    let left = rect.left;
    let top = rect.top;
    let right = rect.right;
    let bottom = rect.bottom;

    if (isBuildRoomTarget(el)) {
      left = Math.max(0, left);
      top = Math.max(0, top);
      right = Math.min(window.innerWidth || document.documentElement.clientWidth || right, right);
      bottom = Math.min(window.innerHeight || document.documentElement.clientHeight || bottom, bottom);
    }

    overlay.style.left = Math.round(left) + "px";
    overlay.style.top = Math.round(top) + "px";
    overlay.style.width = Math.max(0, Math.round(right - left)) + "px";
    overlay.style.height = Math.max(0, Math.round(bottom - top)) + "px";
  }

  function render(el) {
    const state = states.get(el);
    if (!state) return;

    const overlay = ensureOverlay(state);
    placeOverlay(el, overlay);

    const available = directions(el);
    overlay.querySelectorAll(".sf-scroll-cue").forEach(cue => {
      const show = state.mode === "idle" && Boolean(available[cue.dataset.direction]);
      cue.classList.toggle("is-visible", show);
    });
  }

  function hide(el) {
    const state = states.get(el);
    if (!state || !state.overlay) return;
    state.overlay.querySelectorAll(".sf-scroll-cue").forEach(cue => cue.classList.remove("is-visible"));
  }

  function markScrolling(el) {
    const state = states.get(el);
    if (!state) return;
    state.mode = "scrolling";
    hide(el);
    clearTimeout(state.idleTimer);
    state.idleTimer = setTimeout(() => {
      state.mode = "idle";
      render(el);
    }, IDLE_DELAY);
  }

  function attach(el) {
    if (states.has(el)) {
      if (!attached.some(item => item.el === el)) attached.push({ el, state: states.get(el) });
      render(el);
      return;
    }

    const state = {
      mode: "idle",
      idleTimer: 0,
      overlay: null
    };
    states.set(el, state);
    attached.push({ el, state });

    el.addEventListener("scroll", () => markScrolling(el), { passive: true });
    el.addEventListener("wheel", () => markScrolling(el), { passive: true });
    el.addEventListener("touchmove", () => markScrolling(el), { passive: true });
    el.addEventListener("pointerdown", () => markScrolling(el), { passive: true });
    window.addEventListener("resize", () => scheduleScan(), { passive: true });
    window.addEventListener("orientationchange", () => scheduleScan(), { passive: true });

    render(el);
  }

  function detachMissing(activeTargets) {
    const active = new Set(activeTargets);
    for (let index = attached.length - 1; index >= 0; index -= 1) {
      const item = attached[index];
      if (active.has(item.el) && item.el.isConnected) continue;
      clearTimeout(item.state.idleTimer);
      if (item.state.overlay) item.state.overlay.remove();
      attached.splice(index, 1);
    }
  }

  function logTarget(el) {
    const info = scrollInfo(el);
    const levelId = currentLevelId();
    const key = levelId + ":" + targetLabel(el);
    if (key === lastTargetLogKey) return;
    lastTargetLogKey = key;
    console.log("[Signal Flow] Scroll affordance target selected", {
      version: VERSION,
      levelId,
      selector: targetLabel(el),
      clientWidth: el.clientWidth,
      clientHeight: el.clientHeight,
      scrollWidth: el.scrollWidth,
      scrollHeight: el.scrollHeight,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
      overflowX: info.overflowX,
      overflowY: info.overflowY,
      canScrollX: info.canUserScrollX,
      canScrollY: info.canUserScrollY
    });
  }

  function buildRoomShellSummary(el) {
    const shell = el && el.closest && el.closest(".sf-br-shell-owned, [data-sf-br-shell-root], .sf-build-room-v6r227");
    if (!shell) return null;
    const rect = shell.getBoundingClientRect();
    return {
      selector: targetLabel(shell),
      className: String(shell.className || ""),
      clientHeight: shell.clientHeight,
      scrollHeight: shell.scrollHeight,
      scrollTop: shell.scrollTop,
      rect: {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      }
    };
  }

  function rectSummary(el) {
    if (!el || !el.getBoundingClientRect) return null;
    const rect = el.getBoundingClientRect();
    return {
      left: Math.round(rect.left),
      top: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      right: Math.round(rect.right),
      bottom: Math.round(rect.bottom)
    };
  }

  function styleSummary(el) {
    if (!el) return null;
    const style = getComputedStyle(el);
    return {
      display: style.display,
      visibility: style.visibility,
      opacity: style.opacity,
      overflowX: style.overflowX,
      overflowY: style.overflowY
    };
  }

  function rectInside(inner, outer) {
    if (!inner || !outer) return false;
    return (
      inner.left >= outer.left &&
      inner.top >= outer.top &&
      inner.right <= outer.right &&
      inner.bottom <= outer.bottom
    );
  }

  function clippingParents(el) {
    const clips = [];
    let parent = el && el.parentElement;
    while (parent && clips.length < 5) {
      const style = getComputedStyle(parent);
      if (/hidden|clip|auto|scroll/i.test(style.overflowX + " " + style.overflowY)) {
        clips.push({
          tag: parent.tagName.toLowerCase(),
          id: parent.id || "",
          className: String(parent.className || "").trim().slice(0, 120),
          overflowX: style.overflowX,
          overflowY: style.overflowY,
          rect: rectSummary(parent)
        });
      }
      parent = parent.parentElement;
    }
    return clips;
  }

  function logBuildRoomReport(el, state) {
    const levelId = currentLevelId();
    if (!isBuildRoomActive()) return;

    const key = levelId + ":" + targetLabel(el);
    if (buildRoomReports.has(key)) return;
    buildRoomReports.add(key);

    const overlay = state && state.overlay;
    const downCue = overlay && overlay.querySelector(".sf-scroll-cue-down");
    const targetRect = rectSummary(el);
    const overlayRect = rectSummary(overlay);
    const downRect = rectSummary(downCue);
    console.log("[Signal Flow] Build-a-Room scroll affordance target report", {
      version: VERSION,
      levelId,
      selector: targetLabel(el),
      targetClass: String(el.className || ""),
      targetId: el.id || "",
      scrollTop: el.scrollTop,
      clientHeight: el.clientHeight,
      scrollHeight: el.scrollHeight,
      remainingDown: el.scrollHeight - el.clientHeight - el.scrollTop,
      canUp: el.scrollTop > THRESHOLD,
      canDown: el.scrollTop < (el.scrollHeight - el.clientHeight - THRESHOLD),
      visibleRect: targetRect,
      downCueExists: Boolean(downCue),
      downCueClassName: downCue ? downCue.className : "",
      downCueStyle: styleSummary(downCue),
      downCueRect: downRect,
      overlayRect,
      downCueInsideViewportRect: rectInside(downRect, overlayRect),
      clippingParents: clippingParents(downCue || overlay),
      nearestBuildRoomShell: buildRoomShellSummary(el)
    });
  }

  function scan() {
    installStyle();
    logInstall();
    const targets = findTargets().slice(0, 1);
    targets.forEach(el => {
      attach(el);
      logTarget(el);
      logBuildRoomReport(el, states.get(el));
    });
    detachMissing(targets);
  }

  function scheduleScan() {
    if (scanTimer) return;
    scanTimer = setTimeout(() => {
      scanTimer = 0;
      scan();
    }, SCAN_DELAY);
  }

  function ignoredMutationNode(node) {
    if (!node || node.nodeType !== 1) return false;
    if (node.id === STYLE_ID || node.id === "sf-universal-scroll-cues-v1") return true;
    return Boolean(node.classList && (node.classList.contains("sf-scroll-cue") || node.classList.contains(OVERLAY_CLASS)));
  }

  scan();
  window.addEventListener("load", scheduleScan, { passive: true });
  window.addEventListener("hashchange", scheduleScan, { passive: true });
  window.addEventListener("resize", scheduleScan, { passive: true });
  window.addEventListener("orientationchange", scheduleScan, { passive: true });
  setTimeout(scheduleScan, 500);
  setTimeout(scheduleScan, 1500);
  setTimeout(scheduleScan, 3000);
  setInterval(scan, 1000);

  if (typeof MutationObserver !== "undefined") {
    const observer = new MutationObserver(mutations => {
      const onlyCues = mutations.every(mutation => {
        if (ignoredMutationNode(mutation.target)) return true;
        const added = Array.from(mutation.addedNodes || []);
        const removed = Array.from(mutation.removedNodes || []);
        return added.concat(removed).every(ignoredMutationNode);
      });
      if (!onlyCues) scheduleScan();
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "data-sf-liv018-scroll-shell", "data-sf-liv019-scroll-shell"]
    });
  }
})();
