/* Signal Flow reusable Live Sound dev-tool config. DEV ONLY. */
(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search || "");
  let enabled = params.get("sfLiveDevTools") === "1" || params.get("fresh") === "liv020-dev-tools" || params.get("fresh") === "liv028-dev-tools";
  let levelId = params.get("sfLiveDevLevel") || params.get("level") || "";

  try {
    if (window.parent && window.parent !== window) {
      const parentParams = new URLSearchParams(window.parent.location.search || "");
      if (!enabled) {
        enabled = parentParams.get("sfLiveDevTools") === "1" || parentParams.get("fresh") === "liv020-dev-tools" || parentParams.get("fresh") === "liv028-dev-tools";
      }
      if (!levelId) {
        levelId = parentParams.get("sfLiveDevLevel") || parentParams.get("level") || "";
      }
    }
  } catch (_) {}

  levelId = String(levelId || "LIV-020").toUpperCase();
  if (!/^LIV-\d{3}$/.test(levelId)) levelId = "LIV-020";

  const levelSlug = levelId.toLowerCase();

  const gearSelector =
    params.get("sfLiveGearSelector") ||
    (typeof parentParams !== "undefined" && parentParams ? parentParams.get("sfLiveGearSelector") : "") ||
    "img,[data-sf-gear-id]";

  window.sfLiveDevToolConfig = {
    enabled,
    levelId,
    layerSelector: ".sf-live-native-layer.sf-live-native-level-" + levelSlug + ", .sf-live-native-layer.sf-live-native-level-" + levelId.toLowerCase(),
    exportPrefix: "[Signal Flow] " + levelId,
    gearSelector,
    labelSelector: ".sf-live-native-layer.sf-live-native-level-" + levelSlug + " div, .sf-live-native-layer.sf-live-native-level-" + levelSlug + " span",
    hitboxSelector: "[data-node-key]",
    ignoreHitboxClosest: ".sf-native-liv019-source-panel, .sf-native-liv009-source-panel"
  };

  console.log("[Signal Flow] Live dev-tool config loaded", window.sfLiveDevToolConfig);
})();
