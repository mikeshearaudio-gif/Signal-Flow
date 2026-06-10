(function(){
  const VERSION = "liv026falsejacklock2";
  const HITBOXES = [
  {
    "key": "liv026-false-matrix-1",
    "leftPx": 215,
    "topPx": 120,
    "widthPx": 44,
    "heightPx": 19
  },
  {
    "key": "liv026-false-matrix-2",
    "leftPx": 280,
    "topPx": 120,
    "widthPx": 44,
    "heightPx": 34
  },
  {
    "key": "liv026-false-matrix-3",
    "leftPx": 340,
    "topPx": 120,
    "widthPx": 44,
    "heightPx": 34
  },
  {
    "key": "liv026-false-aux-1",
    "leftPx": 405,
    "topPx": 120,
    "widthPx": 44,
    "heightPx": 24
  },
  {
    "key": "liv026-false-aux-2",
    "leftPx": 485,
    "topPx": 125,
    "widthPx": 24,
    "heightPx": 34
  },
  {
    "key": "liv026-false-bus-4",
    "leftPx": 520,
    "topPx": 125,
    "widthPx": 24,
    "heightPx": 34
  },
  {
    "key": "liv026-false-bus-5",
    "leftPx": 555,
    "topPx": 125,
    "widthPx": 24,
    "heightPx": 34
  },
  {
    "key": "liv026-false-bus-6",
    "leftPx": 585,
    "topPx": 125,
    "widthPx": 24,
    "heightPx": 34
  },
  {
    "key": "liv026-false-1781010639535",
    "leftPx": 800,
    "topPx": 115,
    "widthPx": 34,
    "heightPx": 34
  },
  {
    "key": "liv026-false-1781010639834",
    "leftPx": 620,
    "topPx": 125,
    "widthPx": 24,
    "heightPx": 34
  },
  {
    "key": "liv026-false-1781010640240",
    "leftPx": 650,
    "topPx": 125,
    "widthPx": 34,
    "heightPx": 34
  },
  {
    "key": "liv026-false-1781010710123",
    "leftPx": 840,
    "topPx": 115,
    "widthPx": 34,
    "heightPx": 34
  },
  {
    "key": "liv026-false-1781010728364",
    "leftPx": 725,
    "topPx": 170,
    "widthPx": 34,
    "heightPx": 34
  },
  {
    "key": "liv026-false-1781010742991",
    "leftPx": 765,
    "topPx": 170,
    "widthPx": 34,
    "heightPx": 34
  },
  {
    "key": "liv026-false-1781010756692",
    "leftPx": 800,
    "topPx": 170,
    "widthPx": 39,
    "heightPx": 34
  },
  {
    "key": "liv026-false-1781010772123",
    "leftPx": 840,
    "topPx": 170,
    "widthPx": 39,
    "heightPx": 34
  },
  {
    "key": "liv026-false-1781010794875",
    "leftPx": 485,
    "topPx": 330,
    "widthPx": 29,
    "heightPx": 34
  },
  {
    "key": "liv026-false-1781010807865",
    "leftPx": 515,
    "topPx": 335,
    "widthPx": 39,
    "heightPx": 34
  },
  {
    "key": "liv026-false-1781010828368",
    "leftPx": 970,
    "topPx": 310,
    "widthPx": 44,
    "heightPx": 34
  },
  {
    "key": "liv026-false-1781010841025",
    "leftPx": 1020,
    "topPx": 310,
    "widthPx": 44,
    "heightPx": 34
  },
  {
    "key": "liv026-false-1781010855266",
    "leftPx": 975,
    "topPx": 430,
    "widthPx": 44,
    "heightPx": 34
  },
  {
    "key": "liv026-false-1781010877125",
    "leftPx": 1020,
    "topPx": 430,
    "widthPx": 44,
    "heightPx": 34
  },
  {
    "key": "liv026-false-1781010899810",
    "leftPx": 490,
    "topPx": 655,
    "widthPx": 44,
    "heightPx": 34
  },
  {
    "key": "liv026-false-1781010911666",
    "leftPx": 545,
    "topPx": 655,
    "widthPx": 44,
    "heightPx": 34
  },
  {
    "key": "liv026-false-1781010925247",
    "leftPx": 965,
    "topPx": 550,
    "widthPx": 54,
    "heightPx": 44
  },
  {
    "key": "liv026-false-1781010953316",
    "leftPx": 1020,
    "topPx": 545,
    "widthPx": 49,
    "heightPx": 44
  },
  {
    "key": "liv026-false-1781010990234",
    "leftPx": 970,
    "topPx": 660,
    "widthPx": 44,
    "heightPx": 39
  },
  {
    "key": "liv026-false-1781011135566",
    "leftPx": 1020,
    "topPx": 660,
    "widthPx": 44,
    "heightPx": 29
  }
];

  function install(){
    const layer = document.querySelector(".sf-live-native-layer.sf-live-native-level-liv-026");
    if (!layer) return setTimeout(install, 250);

    function jack(key, x, y, label){
      let el = layer.querySelector('[data-node-key="' + key + '"]');
      if (!el) {
        el = document.createElement("button");
        el.type = "button";
        el.className = "sf-native-jack sf-native-node sf-liv026-false-jack";
        el.dataset.nodeKey = key;
        el.dataset.label = label || "False Jack";
        layer.appendChild(el);
      }
      return el;
    }

    HITBOXES.forEach(function(hb){
      const el = jack(hb.key, hb.leftPx, hb.topPx, "False Jack");
      el.dataset.sfFalseJack = "1";
      el.style.cssText += ";position:absolute!important;left:" + hb.leftPx + "px!important;top:" + hb.topPx + "px!important;width:" + hb.widthPx + "px!important;height:" + hb.heightPx + "px!important;z-index:3200!important;opacity:0!important;border:0!important;background:transparent!important;box-shadow:none!important;cursor:pointer!important;pointer-events:auto!important;";
    });

    console.warn("[Signal Flow] LIV-026 false jacks lock applied", VERSION, HITBOXES.length);
  }

  setTimeout(install, 500);
})();
