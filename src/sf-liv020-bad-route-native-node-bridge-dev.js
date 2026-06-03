(function () {
  "use strict";

  const VERSION = "sf-liv020-bad-route-native-node-bridge-dev-v1";
  const LEVEL_CLASS = ".sf-live-native-layer.sf-live-native-level-liv-020";

  const BAD_ROUTES = [
    // PASTE THE 113 BAD-ROUTE JSON ARRAY HERE
  ];

  function getLayer() {
    return document.querySelector(LEVEL_CLASS);
  }

  function makeNode(item) {
    const el = document.createElement("div");
    el.className = "sf-native-node sf-live-node sf-liv020-bad-route-node-dev";
    el.dataset.nodeKey = item.key;
    el.dataset.sfLiveHitboxKey = item.key;
    el.dataset.sfLiveBadRoute = "1";
    el.dataset.label = item.label || item.key;

    el.style.position = "absolute";
    el.style.left = item.leftPx + "px";
    el.style.top = item.topPx + "px";
    el.style.width = item.widthPx + "px";
    el.style.height = item.heightPx + "px";
    el.style.zIndex = "9998";
    el.style.pointerEvents = "auto";
    el.style.boxSizing = "border-box";
    el.style.border = "1px dashed rgba(255,80,80,.85)";
    el.style.borderRadius = "999px";
    el.style.background = "rgba(255,0,0,.10)";
    el.title = item.label || item.key;

    return el;
  }

  function install(reason) {
    const layer = getLayer();

    if (!layer) {
      console.warn("[Signal Flow] LIV-020 bad-route native-node bridge: layer not found", { reason });
      return false;
    }

    layer.querySelectorAll(".sf-liv020-bad-route-node-dev").forEach(el => el.remove());

    BAD_ROUTES.forEach(item => {
      if (!item || !item.key) return;
      layer.appendChild(makeNode(item));
    });

    window.sfLiv020BadRouteNodeBridgeDev = {
      version: VERSION,
      count: () => BAD_ROUTES.length,
      nodes: () => Array.from(document.querySelectorAll(".sf-liv020-bad-route-node-dev")),
      remove: () => document.querySelectorAll(".sf-liv020-bad-route-node-dev").forEach(el => el.remove())
    };

    console.log("[Signal Flow] LIV-020 bad-route native-node bridge installed", {
      version: VERSION,
      reason,
      count: BAD_ROUTES.length,
      api: "window.sfLiv020BadRouteNodeBridgeDev"
    });

    return true;
  }

  setTimeout(() => install("timeout-0"), 0);
  setTimeout(() => install("timeout-100"), 100);
  setTimeout(() => install("timeout-500"), 500);
})();
