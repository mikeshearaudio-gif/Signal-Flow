(() => {
  const VERSION = "liv023-static-gear-preview-v1";
  const GEAR = [
  {
    "key": "liv023-monitor-console",
    "label": "Monitor Console",
    "leftPx": -10,
    "topPx": -178,
    "widthPx": 880,
    "src": "assets/live-sound/svg/hardware/Monitor_Console.svg"
  },
  {
    "key": "liv023-lead-vocal-mic",
    "label": "Lead Vocal Mic",
    "leftPx": 13,
    "topPx": 337,
    "widthPx": 240,
    "src": "assets/live-sound/svg/hardware/mic nbg.svg"
  },
  {
    "key": "liv023-keyboard",
    "label": "Keyboard",
    "leftPx": 208,
    "topPx": 330,
    "widthPx": 300,
    "src": "assets/live-sound/svg/hardware/keys.svg"
  },
  {
    "key": "liv023-stagebox-8",
    "label": "8 Input Stage Box",
    "leftPx": 16,
    "topPx": 210,
    "widthPx": 360,
    "src": "assets/live-sound/svg/hardware/stagebox-snake-head.svg"
  },
  {
    "key": "liv023-vocal-compressor",
    "label": "Vocal Compressor",
    "leftPx": 498,
    "topPx": 214,
    "widthPx": 300,
    "src": "assets/live-sound/svg/hardware/power-amp-liv007-main-system.svg"
  },
  {
    "key": "liv023-iem-a",
    "label": "IEM Transmitter A",
    "leftPx": 470,
    "topPx": 318,
    "widthPx": 360,
    "src": "assets/live-sound/svg/hardware/iem-transmitter-liv003-game-style.svg"
  },
  {
    "key": "liv023-crossover",
    "label": "Stereo 3-Way Crossover",
    "leftPx": 440,
    "topPx": 419,
    "widthPx": 420,
    "src": "assets/live-sound/svg/hardware/crossover-liv010-3way.svg"
  },
  {
    "key": "liv023-high-amp",
    "label": "High Amp",
    "leftPx": 455,
    "topPx": 530,
    "widthPx": 400,
    "src": "assets/live-sound/svg/hardware/power-amp-liv010-high.svg"
  },
  {
    "key": "liv023-mid-amp",
    "label": "Mid Amp",
    "leftPx": 455,
    "topPx": 627,
    "widthPx": 400,
    "src": "assets/live-sound/svg/hardware/power-amp-liv010-mid.svg"
  },
  {
    "key": "liv023-low-amp",
    "label": "Low Amp",
    "leftPx": 454,
    "topPx": 727,
    "widthPx": 400,
    "src": "assets/live-sound/svg/hardware/power-amp-liv010-low.svg"
  },
  {
    "key": "liv023-normal-cable-01",
    "label": "Normalization Cable 1",
    "leftPx": 702,
    "topPx": 681,
    "widthPx": 82,
    "src": "assets/live-sound/svg/cables/single-one-end-raised.svg"
  },
  {
    "key": "liv023-normal-cable-02",
    "label": "Normalization Cable 2",
    "leftPx": 695,
    "topPx": 782,
    "widthPx": 92,
    "src": "assets/live-sound/svg/cables/single-one-end-raised.svg"
  },
  {
    "key": "liv023-normal-cable-03",
    "label": "Normalization Cable 3",
    "leftPx": -102,
    "topPx": 66,
    "widthPx": 220,
    "src": "assets/live-sound/svg/cables/single-one-end-raised.svg"
  },
  {
    "key": "liv023-normal-cable-04",
    "label": "Normalization Cable 4",
    "leftPx": -9,
    "topPx": 66,
    "widthPx": 182,
    "src": "assets/live-sound/svg/cables/single-one-end-raised.svg"
  },
  {
    "key": "liv023-normal-cable-05",
    "label": "Normalization Cable 5",
    "leftPx": 3,
    "topPx": 61,
    "widthPx": 232,
    "src": "assets/live-sound/svg/cables/single-one-end-raised.svg"
  },
  {
    "key": "liv023-normal-cable-06",
    "label": "Normalization Cable 6",
    "leftPx": 660,
    "topPx": 585,
    "widthPx": 82,
    "src": "assets/live-sound/svg/cables/single-one-end-raised.svg"
  },
  {
    "key": "liv023-normal-cable-07",
    "label": "Normalization Cable 7",
    "leftPx": 706,
    "topPx": 585,
    "widthPx": 82,
    "src": "assets/live-sound/svg/cables/single-one-end-raised.svg"
  },
  {
    "key": "liv023-normal-cable-08",
    "label": "Normalization Cable 8",
    "leftPx": 663,
    "topPx": 680,
    "widthPx": 82,
    "src": "assets/live-sound/svg/cables/single-one-end-raised.svg"
  }
];

  const mount = document.querySelector("#patchbay");
  if (!mount) return console.warn("[Signal Flow] LIV-023 static preview: #patchbay not found.");

  document.querySelectorAll("[data-sf-liv023-gear-dev-root], [data-sf-liv023-gear-dev-panel], [data-sf-liv023-good-layer], [data-sf-liv023-good-node], [data-sf-liv023-good-panel]").forEach(el => el.remove());

  mount.style.position = mount.style.position || "relative";

  const root = document.createElement("div");
  root.dataset.sfLiv023GearDevRoot = "1";
  root.style.cssText = "position:absolute;inset:0;z-index:9990;overflow:auto;background:rgba(0,0,0,.35);border:2px solid rgba(245,197,66,.75);box-sizing:border-box;pointer-events:auto;";

  const board = document.createElement("div");
  board.dataset.sfLiv023GearDevBoard = "1";
  board.style.cssText = "position:relative;width:1400px;height:1500px;background:rgba(0,20,14,.25);background-image:radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px);background-size:24px 24px;pointer-events:auto;";

  root.appendChild(board);
  mount.appendChild(root);

  GEAR.forEach(g => {
    const img = document.createElement("img");
    img.dataset.sfLiv023GearKey = g.key;
    img.alt = g.label;
    img.src = "../" + g.src;
    img.style.cssText = [
      "position:absolute",
      "left:" + g.leftPx + "px",
      "top:" + g.topPx + "px",
      "width:" + g.widthPx + "px",
      "height:auto",
      "pointer-events:none",
      "user-select:none",
      "filter:drop-shadow(0 10px 18px rgba(0,0,0,.65))"
    ].join(";");
    board.appendChild(img);
  });

  console.log("[Signal Flow] LIV-023 static gear preview loaded", VERSION, { count: GEAR.length });
})();
