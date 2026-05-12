/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  let LEVEL_ID = "LIV-025";
  let activeNativeLevelId = null;
  let nativeLevelCompleteShown = false;

  const LIV_028_LAYOUT = {
    sources: {
      x: 0.145,
      firstY: 0.155,
      gap: 44,
      width: 154,
      height: 38
    },
    stagebox: {
      x: 0.060,
      y: 0.555,
      width: 0.440
    },
    foh: {
      x: 0.390,
      y: 0.150,
      width: 0.550
    },
    iem: {
      x: 0.600,
      y: 0.575,
      width: 0.365
    }
  };

  let selectedNode = null;
  let patchDrag = null;
  let suppressNativeClickUntil = 0;
  let nativeVisible = true;
  let nativeHintsVisible = false;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

  const LEVEL = {
    id: LEVEL_ID,
    title: "Sub Matrix Feed",
    validRoutes: [
      {
        key: "aux-2-to-sub",
        from: "aux-2-output",
        to: "sub-processor-input",
        checklist: "Aux 2 Output → Sub Input"
      },
      {
        key: "main-left-to-system-left",
        from: "main-left-output",
        to: "system-processor-left-in",
        checklist: "Main Left Output → System Processor Left In"
      },
      {
        key: "main-right-to-system-right",
        from: "main-right-output",
        to: "system-processor-right-in",
        checklist: "Main Right Output → System Processor Right In"
      },
      {
        key: "lead-vocal-to-stagebox-1",
        from: "lead-vocal-mic",
        to: "stagebox-input-1",
        checklist: "Lead Vocal Microphone → Stage Box Input 1"
      },
      {
        key: "keys-left-to-stagebox-7",
        from: "keys-left-di",
        to: "stagebox-input-7",
        checklist: "Keys Left DI → Stage Box Input 7"
      },
      {
        key: "keys-right-to-stagebox-8",
        from: "keys-right-di",
        to: "stagebox-input-8",
        checklist: "Keys Right DI → Stage Box Input 8"
      }
    ]
  };

  const LIVE_NATIVE_PATCH_SPECS = {
    "LIV-002": {
      id: "LIV-002",
      title: "Vocal Wedge Mix 2",
      processorLabel: "VOCAL WEDGE",
      panelKinds: ["stagebox", "foh", "monitor"],
      sourceOrder: ["lead-vocal-mic"],
      generatedJackKeys: [
        "stagebox-input-1",
        "stagebox-input-2",
        "stagebox-input-3",
        "stagebox-input-4",
        "stagebox-input-5",
        "stagebox-input-6",
        "stagebox-input-7",
        "stagebox-input-8",
        "stagebox-input-9",
        "stagebox-input-10",
        "stagebox-input-11",
        "stagebox-input-12",
        "stagebox-input-13",
        "stagebox-input-14",
        "stagebox-input-15",
        "stagebox-input-16",
        "stagebox-link-out",
        "foh-aux-1-output",
        "aux-2-output",
        "aux-3-output",
        "talkback-output",
        "main-left-output",
        "main-right-output",
        "vocal-wedge-input",
        "vocal-wedge-thru",
        "vocal-wedge-aux-in"
      ],
      validRoutes: [
        {
          key: "lead-vocal-mic-to-stagebox-input-1",
          from: "lead-vocal-mic",
          to: "stagebox-input-1",
          checklist: "Lead Vocal Mic → Stage Box Input 1"
        },
        {
          key: "foh-aux-1-output-to-vocal-wedge-input",
          from: "foh-aux-1-output",
          to: "vocal-wedge-input",
          checklist: "FOH Aux 1 Output → Vocal Wedge Input"
        }
      ]
    },
    "LIV-003": {
      id: "LIV-003",
      title: "Stereo IEM Send 1",
      processorLabel: "IEM TRANSMITTER",
      panelKinds: ["foh", "iem"],
      sourceOrder: [],
      assetOverrides: {
        foh: "/assets/live-sound/svg/hardware/foh-console-liv003-game-style.svg",
        iem: "/assets/live-sound/svg/hardware/iem-transmitter-liv003-game-style.svg"
      },
      generatedJackKeys: [
        "foh-mic-line-1-input",
        "foh-mic-line-2-input",
        "foh-mic-line-3-input",
        "foh-mic-line-4-input",
        "foh-mic-line-5-input",
        "foh-mic-line-6-input",
        "foh-mic-line-7-input",
        "foh-mic-line-8-input",
        "foh-aux-1-l-output",
        "foh-aux-1-r-output",
        "foh-aux-2-l-output",
        "foh-aux-2-r-output",
        "foh-aux-3-l-output",
        "foh-aux-3-r-output",
        "foh-aux-4-l-output",
        "foh-aux-4-r-output",
        "foh-aux-5-l-output",
        "foh-aux-5-r-output",
        "foh-aux-6-l-output",
        "foh-aux-6-r-output",
        "foh-bus-1-output",
        "foh-bus-2-output",
        "foh-bus-3-output",
        "foh-bus-4-output",
        "foh-bus-5-output",
        "foh-bus-6-output",
        "foh-bus-7-output",
        "foh-bus-8-output",
        "main-left-output",
        "main-right-output",
        "iem-tx-a-left-input",
        "iem-tx-a-right-input",
        "iem-tx-b-left-input",
        "iem-tx-b-right-input",
        "iem-tx-phones"
      ],
      validRoutes: [
        {
          key: "foh-aux-5-l-output-to-iem-tx-a-left-input",
          from: "foh-aux-5-l-output",
          to: "iem-tx-a-left-input",
          checklist: "FOH Aux 5 L Output → IEM TX A Left Input",
          stereoGroup: "foh-aux-5-to-iem-tx-a",
          stereoSide: "left"
        },
        {
          key: "foh-aux-5-r-output-to-iem-tx-a-right-input",
          from: "foh-aux-5-r-output",
          to: "iem-tx-a-right-input",
          checklist: "FOH Aux 5 R Output → IEM TX A Right Input",
          stereoGroup: "foh-aux-5-to-iem-tx-a",
          stereoSide: "right"
        }
      ]
    },
    "LIV-006": {
      id: "LIV-006",
      title: "Delay Tower Route",
      processorLabel: "SYSTEM + DELAY PROCESSING",
      panelKinds: ["foh", "amp"],
      sourceOrder: [],
      assetOverrides: {
        foh: "/assets/live-sound/svg/hardware/foh-console-liv006-matrix-main-outs.svg",
        amp: "/assets/live-sound/svg/hardware/power-amp-liv006-system-delay-processor.svg"
      },
      generatedJackKeys: [
        "foh-liv006-matrix-1-output",
        "foh-liv006-matrix-2-output",
        "foh-liv006-matrix-3-output",
        "foh-liv006-matrix-4-output",
        "foh-liv006-aux-1-output",
        "foh-liv006-aux-2-output",
        "foh-liv006-aux-3-output",
        "foh-liv006-aux-4-output",
        "foh-liv006-aux-5-output",
        "foh-liv006-aux-6-output",
        "foh-liv006-bus-1-output",
        "foh-liv006-bus-2-output",
        "foh-liv006-bus-3-output",
        "foh-liv006-bus-4-output",
        "foh-liv006-bus-5-output",
        "foh-liv006-bus-6-output",
        "foh-liv006-bus-7-output",
        "foh-liv006-bus-8-output",
        "foh-liv006-main-left-output",
        "foh-liv006-main-right-output",
        "liv006-system-processor-l-input",
        "liv006-system-processor-r-input",
        "liv006-delay-tower-processor-input",
        "liv006-sub-processor-input",
        "liv006-front-fill-processor-input"
      ],
      validRoutes: [
        {
          key: "foh-liv006-matrix-3-output-to-liv006-delay-tower-processor-input",
          from: "foh-liv006-matrix-3-output",
          to: "liv006-delay-tower-processor-input",
          checklist: "Matrix 3 Output → Delay Tower Processor Input"
        },
        {
          key: "foh-liv006-main-left-output-to-liv006-system-processor-l-input",
          from: "foh-liv006-main-left-output",
          to: "liv006-system-processor-l-input",
          checklist: "Main L Output → System Processor L In",
          stereoGroup: "liv006-main-to-system",
          stereoSide: "left"
        },
        {
          key: "foh-liv006-main-right-output-to-liv006-system-processor-r-input",
          from: "foh-liv006-main-right-output",
          to: "liv006-system-processor-r-input",
          checklist: "Main R Output → System Processor R In",
          stereoGroup: "liv006-main-to-system",
          stereoSide: "right"
        }
      ]
    },
    "LIV-009": {
      id: "LIV-009",
      title: "Keyboard Stereo Inputs",
      processorLabel: "",
      panelKinds: ["stagebox"],
      sourceOrder: ["keys-left-di", "keys-right-di"],
      generatedJackKeys: [
        "stagebox-input-1",
        "stagebox-input-2",
        "stagebox-input-3",
        "stagebox-input-4",
        "stagebox-input-5",
        "stagebox-input-6",
        "stagebox-input-7",
        "stagebox-input-8",
        "stagebox-input-9",
        "stagebox-input-10",
        "stagebox-input-11",
        "stagebox-input-12",
        "stagebox-input-13",
        "stagebox-input-14",
        "stagebox-input-15",
        "stagebox-input-16",
        "stagebox-link-out"
      ],
      validRoutes: [
        {
          key: "keys-l-di-to-stagebox-input-7",
          from: "keys-left-di",
          to: "stagebox-input-7",
          checklist: "Keys L DI → Stage Box Input 7",
          stereoGroup: "keys-di",
          stereoSide: "left"
        },
        {
          key: "keys-r-di-to-stagebox-input-8",
          from: "keys-right-di",
          to: "stagebox-input-8",
          checklist: "Keys R DI → Stage Box Input 8",
          stereoGroup: "keys-di",
          stereoSide: "right"
        }
      ]
    },
    "LIV-025": {
      id: "LIV-025",
      title: "Sub Matrix Feed",
      processorLabel: "CROSSOVER",
      validRoutes: [
        {
          key: "aux-2-to-sub",
          from: "matrix-2-output",
          to: "sub-processor-input",
          checklist: "Aux 2 Output → Sub Input"
        },
        {
          key: "main-left-to-system-left",
          from: "main-left-output",
          to: "system-processor-left-in",
          checklist: "Main Left Output → System Processor Left In"
        },
        {
          key: "main-right-to-system-right",
          from: "main-right-output",
          to: "system-processor-right-in",
          checklist: "Main Right Output → System Processor Right In"
        },
        {
          key: "lead-vocal-to-stagebox-1",
          from: "lead-vocal-mic",
          to: "stagebox-input-1",
          checklist: "Lead Vocal Microphone → Stage Box Input 1"
        },
        {
          key: "keys-left-to-stagebox-7",
          from: "keys-left-di",
          to: "stagebox-input-7",
          checklist: "Keys Left DI → Stage Box Input 7"
        },
        {
          key: "keys-right-to-stagebox-8",
          from: "keys-right-di",
          to: "stagebox-input-8",
          checklist: "Keys Right DI → Stage Box Input 8"
        }
      ]
    },
    "LIV-026": {
      id: "LIV-026",
      title: "Delay Tower Route",
      processorLabel: "DELAY TOWER PROCESSING",
      validRoutes: [
        {
          key: "aux-3-to-delay-processing",
          from: "aux-3-output",
          to: "delay-tower-processing-input",
          checklist: "Aux 3 Output → Delay"
        },
        {
          key: "main-left-to-system-left",
          from: "main-left-output",
          to: "system-processor-left-in",
          checklist: "Main Left Output → System Processor Left In"
        },
        {
          key: "main-right-to-system-right",
          from: "main-right-output",
          to: "system-processor-right-in",
          checklist: "Main Right Output → System Processor Right In"
        },
        {
          key: "lead-vocal-to-stagebox-1",
          from: "lead-vocal-mic",
          to: "stagebox-input-1",
          checklist: "Lead Vocal Microphone → Stage Box Input 1"
        },
        {
          key: "keys-left-to-stagebox-7",
          from: "keys-left-di",
          to: "stagebox-input-7",
          checklist: "Keys Left DI → Stage Box Input 7"
        },
        {
          key: "keys-right-to-stagebox-8",
          from: "keys-right-di",
          to: "stagebox-input-8",
          checklist: "Keys Right DI → Stage Box Input 8"
        }
      ]
    },
    "LIV-028": {
      id: "LIV-028",
      title: "Talkback to Monitor System",
      processorLabel: "IN-EAR MONITORING",
      validRoutes: [
        {
          key: "talkback-mic-to-stagebox-14",
          from: "talkback-mic",
          to: "stagebox-input-14",
          checklist: "Talkback Mic → Stage Box Input 14"
        },
        {
          key: "talkback-output-to-in-ear-b",
          from: "talkback-output",
          to: "in-ear-b-in",
          checklist: "Talkback Output → In-Ear B In"
        },
        {
          key: "lead-vocal-to-stagebox-1",
          from: "lead-vocal-mic",
          to: "stagebox-input-1",
          checklist: "Lead Vocal Microphone → Stage Box Input 1"
        },
        {
          key: "keys-left-to-stagebox-7",
          from: "keys-left-di",
          to: "stagebox-input-7",
          checklist: "Keys Left DI → Stage Box Input 7"
        },
        {
          key: "keys-right-to-stagebox-8",
          from: "keys-right-di",
          to: "stagebox-input-8",
          checklist: "Keys Right DI → Stage Box Input 8"
        }
      ]
    }
  };

  function resetNativeStateForLevelChange(nextLevelId) {
    if (activeNativeLevelId === nextLevelId) return;

    console.log("[Signal Flow] Native level changed, clearing state:", activeNativeLevelId, "→", nextLevelId);

    activeNativeLevelId = nextLevelId;
    resetNativeLevelComplete();

    try {
      if (patchDrag) {
        patchDrag = null;
      }
    } catch (err) {}

    try {
      selectedNode = null;
    } catch (err) {}

    try {
      nativeHintsVisible = false;
    } catch (err) {}

    try {
      state.routes = [];
      if (state.completedValidKeys && state.completedValidKeys.clear) {
        state.completedValidKeys.clear();
      }
    } catch (err) {}

    // Remove any old native layers/cables so a previous board cannot visually
    // carry routes into the next board.
    document.querySelectorAll(".sf-live-native-layer").forEach(layer => layer.remove());

    try {
      updateNativeScore();
    } catch (err) {}
  }

  function syncActiveLevelSpec() {
    const id = getLevelId();
    const spec = LIVE_NATIVE_PATCH_SPECS[id];

    if (!spec) return null;

    resetNativeStateForLevelChange(spec.id);

    LEVEL_ID = spec.id;
    LEVEL.id = spec.id;
    LEVEL.title = spec.title;
    LEVEL.processorLabel = spec.processorLabel;
    LEVEL.validRoutes = spec.validRoutes;
    LEVEL.panelKinds = spec.panelKinds || null;
    LEVEL.sourceOrder = spec.sourceOrder || null;
    LEVEL.generatedJackKeys = spec.generatedJackKeys || null;
    LEVEL.assetOverrides = spec.assetOverrides || null;

    return spec;
  }

  const NODE_DEFS = {
    "lead-vocal-mic": { label: "Lead Vocal Microphone", kind: "source" },
    "talkback-mic": { label: "Talkback Mic", kind: "source", x: 44, y: 160 },
    "keys-left-di": { label: "Keys L DI", kind: "source" },
    "keys-right-di": { label: "Keys R DI", kind: "source" },

    "stagebox-input-1": { label: "Stage Box Input 1", kind: "jack", panelJack: "stagebox.mic1" },
    "stagebox-input-2": { label: "Stage Box Input 2", kind: "jack", panelJack: "stagebox.mic2", ghost: true },
    "stagebox-input-3": { label: "Stage Box Input 3", kind: "jack", panelJack: "stagebox.mic3", ghost: true },
    "stagebox-input-4": { label: "Stage Box Input 4", kind: "jack", panelJack: "stagebox.mic4", ghost: true },
    "stagebox-input-5": { label: "Stage Box Input 5", kind: "jack", panelJack: "stagebox.mic5", ghost: true },
    "stagebox-input-6": { label: "Stage Box Input 6", kind: "jack", panelJack: "stagebox.mic6", ghost: true },
    "stagebox-input-14": { label: "Stage Box Input 14", kind: "jack", panelJack: "stagebox.input14" },
    "stagebox-input-9": { label: "Stage Box Input 9", kind: "jack", panelJack: "stagebox.input9" },
    "stagebox-input-10": { label: "Stage Box Input 10", kind: "jack", panelJack: "stagebox.input10" },
    "stagebox-input-11": { label: "Stage Box Input 11", kind: "jack", panelJack: "stagebox.input11" },
    "stagebox-input-12": { label: "Stage Box Input 12", kind: "jack", panelJack: "stagebox.input12" },
    "stagebox-input-13": { label: "Stage Box Input 13", kind: "jack", panelJack: "stagebox.input13" },
    "stagebox-input-15": { label: "Stage Box Input 15", kind: "jack", panelJack: "stagebox.input15" },
    "stagebox-input-16": { label: "Stage Box Input 16", kind: "jack", panelJack: "stagebox.input16" },
    "stagebox-input-7": { label: "Stage Box Input 7", kind: "jack", panelJack: "stagebox.mic7" },
    "stagebox-input-8": { label: "Stage Box Input 8", kind: "jack", panelJack: "stagebox.mic8" },
    "stagebox-link-out": { label: "Stagebox Link Out", kind: "jack", panelJack: "stagebox.linkOut", ghost: true },

    "foh-main-left": { label: "FOH Main Left", kind: "jack", panelJack: "foh.mainLeft", ghost: true },
    "foh-main-right": { label: "FOH Main Right", kind: "jack", panelJack: "foh.mainRight", ghost: true },
    "main-left-output": { label: "Main Left Output", kind: "jack", panelJack: "foh.mainLeft" },
    "main-right-output": { label: "Main Right Output", kind: "jack", panelJack: "foh.mainRight" },
    "matrix-2-output": { label: "Aux 2 Output", kind: "jack", panelJack: "foh.lineOut2" },

    "foh-mic-1": { label: "FOH Mic 1", kind: "jack", panelJack: "foh.mic1", ghost: true },
    "foh-mic-2": { label: "FOH Mic 2", kind: "jack", panelJack: "foh.mic2", ghost: true },
    "foh-mic-3": { label: "FOH Mic 3", kind: "jack", panelJack: "foh.mic3", ghost: true },
    "foh-mic-4": { label: "FOH Mic 4", kind: "jack", panelJack: "foh.mic4", ghost: true },
    "foh-line-in-5": { label: "FOH Line In 5", kind: "jack", panelJack: "foh.lineIn5", ghost: true },
    "foh-line-in-6": { label: "FOH Line In 6", kind: "jack", panelJack: "foh.lineIn6", ghost: true },
    "foh-line-in-7": { label: "FOH Line In 7", kind: "jack", panelJack: "foh.lineIn7", ghost: true },
    "foh-line-in-8": { label: "FOH Line In 8", kind: "jack", panelJack: "foh.lineIn8", ghost: true },
    "foh-line-out-1": { label: "FOH Line Out 1", kind: "jack", panelJack: "foh.lineOut1", ghost: true },
    "foh-mic-line-1-input": { label: "FOH Mic/Line 1 Input", kind: "jack", panelRel: { panel: "foh", x: 100 / 1120, y: 124 / 260 }, ghost: true },
    "foh-mic-line-2-input": { label: "FOH Mic/Line 2 Input", kind: "jack", panelRel: { panel: "foh", x: 160 / 1120, y: 124 / 260 }, ghost: true },
    "foh-mic-line-3-input": { label: "FOH Mic/Line 3 Input", kind: "jack", panelRel: { panel: "foh", x: 220 / 1120, y: 124 / 260 }, ghost: true },
    "foh-mic-line-4-input": { label: "FOH Mic/Line 4 Input", kind: "jack", panelRel: { panel: "foh", x: 280 / 1120, y: 124 / 260 }, ghost: true },
    "foh-mic-line-5-input": { label: "FOH Mic/Line 5 Input", kind: "jack", panelRel: { panel: "foh", x: 100 / 1120, y: 190 / 260 }, ghost: true },
    "foh-mic-line-6-input": { label: "FOH Mic/Line 6 Input", kind: "jack", panelRel: { panel: "foh", x: 160 / 1120, y: 190 / 260 }, ghost: true },
    "foh-mic-line-7-input": { label: "FOH Mic/Line 7 Input", kind: "jack", panelRel: { panel: "foh", x: 220 / 1120, y: 190 / 260 }, ghost: true },
    "foh-mic-line-8-input": { label: "FOH Mic/Line 8 Input", kind: "jack", panelRel: { panel: "foh", x: 280 / 1120, y: 190 / 260 }, ghost: true },

    "foh-liv006-matrix-1-output": { label: "Matrix 1 Output", kind: "jack", panelRel: { panel: "foh", x: 105 / 1120, y: 134 / 260 }, ghost: true },
    "foh-liv006-matrix-2-output": { label: "Matrix 2 Output", kind: "jack", panelRel: { panel: "foh", x: 180 / 1120, y: 134 / 260 }, ghost: true },
    "foh-liv006-matrix-3-output": { label: "Matrix 3 Output", kind: "jack", panelRel: { panel: "foh", x: 255 / 1120, y: 134 / 260 } },
    "foh-liv006-matrix-4-output": { label: "Matrix 4 Output", kind: "jack", panelRel: { panel: "foh", x: 330 / 1120, y: 134 / 260 }, ghost: true },

    "foh-liv006-aux-1-output": { label: "Aux 1 Output", kind: "jack", panelRel: { panel: "foh", x: 418 / 1120, y: 140 / 260 }, ghost: true },
    "foh-liv006-aux-2-output": { label: "Aux 2 Output", kind: "jack", panelRel: { panel: "foh", x: 458 / 1120, y: 140 / 260 }, ghost: true },
    "foh-liv006-aux-3-output": { label: "Aux 3 Output", kind: "jack", panelRel: { panel: "foh", x: 498 / 1120, y: 140 / 260 }, ghost: true },
    "foh-liv006-aux-4-output": { label: "Aux 4 Output", kind: "jack", panelRel: { panel: "foh", x: 538 / 1120, y: 140 / 260 }, ghost: true },
    "foh-liv006-aux-5-output": { label: "Aux 5 Output", kind: "jack", panelRel: { panel: "foh", x: 578 / 1120, y: 140 / 260 }, ghost: true },
    "foh-liv006-aux-6-output": { label: "Aux 6 Output", kind: "jack", panelRel: { panel: "foh", x: 618 / 1120, y: 140 / 260 }, ghost: true },

    "foh-liv006-bus-1-output": { label: "Bus 1 Output", kind: "jack", panelRel: { panel: "foh", x: 710 / 1120, y: 126 / 260 }, ghost: true },
    "foh-liv006-bus-2-output": { label: "Bus 2 Output", kind: "jack", panelRel: { panel: "foh", x: 756 / 1120, y: 126 / 260 }, ghost: true },
    "foh-liv006-bus-3-output": { label: "Bus 3 Output", kind: "jack", panelRel: { panel: "foh", x: 802 / 1120, y: 126 / 260 }, ghost: true },
    "foh-liv006-bus-4-output": { label: "Bus 4 Output", kind: "jack", panelRel: { panel: "foh", x: 848 / 1120, y: 126 / 260 }, ghost: true },
    "foh-liv006-bus-5-output": { label: "Bus 5 Output", kind: "jack", panelRel: { panel: "foh", x: 710 / 1120, y: 190 / 260 }, ghost: true },
    "foh-liv006-bus-6-output": { label: "Bus 6 Output", kind: "jack", panelRel: { panel: "foh", x: 756 / 1120, y: 190 / 260 }, ghost: true },
    "foh-liv006-bus-7-output": { label: "Bus 7 Output", kind: "jack", panelRel: { panel: "foh", x: 802 / 1120, y: 190 / 260 }, ghost: true },
    "foh-liv006-bus-8-output": { label: "Bus 8 Output", kind: "jack", panelRel: { panel: "foh", x: 848 / 1120, y: 190 / 260 }, ghost: true },

    "foh-liv006-main-left-output": { label: "Main L Output", kind: "jack", panelRel: { panel: "foh", x: 975 / 1120, y: 134 / 260 } },
    "foh-liv006-main-right-output": { label: "Main R Output", kind: "jack", panelRel: { panel: "foh", x: 1045 / 1120, y: 134 / 260 } },

    "foh-aux-1-output": { label: "FOH Aux 1 Output", kind: "jack", panelJack: "foh.lineOut1" },

    "foh-aux-1-l-output": { label: "FOH Aux 1 L Output", kind: "jack", panelRel: { panel: "foh", x: 418 / 1120, y: 126 / 260 }, ghost: true },
    "foh-aux-1-r-output": { label: "FOH Aux 1 R Output", kind: "jack", panelRel: { panel: "foh", x: 418 / 1120, y: 172 / 260 }, ghost: true },
    "foh-aux-2-l-output": { label: "FOH Aux 2 L Output", kind: "jack", panelRel: { panel: "foh", x: 458 / 1120, y: 126 / 260 }, ghost: true },
    "foh-aux-2-r-output": { label: "FOH Aux 2 R Output", kind: "jack", panelRel: { panel: "foh", x: 458 / 1120, y: 172 / 260 }, ghost: true },
    "foh-aux-3-l-output": { label: "FOH Aux 3 L Output", kind: "jack", panelRel: { panel: "foh", x: 498 / 1120, y: 126 / 260 }, ghost: true },
    "foh-aux-3-r-output": { label: "FOH Aux 3 R Output", kind: "jack", panelRel: { panel: "foh", x: 498 / 1120, y: 172 / 260 }, ghost: true },
    "foh-aux-4-l-output": { label: "FOH Aux 4 L Output", kind: "jack", panelRel: { panel: "foh", x: 538 / 1120, y: 126 / 260 }, ghost: true },
    "foh-aux-4-r-output": { label: "FOH Aux 4 R Output", kind: "jack", panelRel: { panel: "foh", x: 538 / 1120, y: 172 / 260 }, ghost: true },
    "foh-aux-5-l-output": { label: "FOH Aux 5 L Output", kind: "jack", panelRel: { panel: "foh", x: 578 / 1120, y: 126 / 260 } },
    "foh-aux-5-r-output": { label: "FOH Aux 5 R Output", kind: "jack", panelRel: { panel: "foh", x: 578 / 1120, y: 172 / 260 } },
    "foh-aux-6-l-output": { label: "FOH Aux 6 L Output", kind: "jack", panelRel: { panel: "foh", x: 618 / 1120, y: 126 / 260 }, ghost: true },
    "foh-aux-6-r-output": { label: "FOH Aux 6 R Output", kind: "jack", panelRel: { panel: "foh", x: 618 / 1120, y: 172 / 260 }, ghost: true },

    "foh-bus-1-output": { label: "FOH Bus 1 Output", kind: "jack", panelRel: { panel: "foh", x: 710 / 1120, y: 126 / 260 }, ghost: true },
    "foh-bus-2-output": { label: "FOH Bus 2 Output", kind: "jack", panelRel: { panel: "foh", x: 756 / 1120, y: 126 / 260 }, ghost: true },
    "foh-bus-3-output": { label: "FOH Bus 3 Output", kind: "jack", panelRel: { panel: "foh", x: 802 / 1120, y: 126 / 260 }, ghost: true },
    "foh-bus-4-output": { label: "FOH Bus 4 Output", kind: "jack", panelRel: { panel: "foh", x: 848 / 1120, y: 126 / 260 }, ghost: true },
    "foh-bus-5-output": { label: "FOH Bus 5 Output", kind: "jack", panelRel: { panel: "foh", x: 710 / 1120, y: 190 / 260 }, ghost: true },
    "foh-bus-6-output": { label: "FOH Bus 6 Output", kind: "jack", panelRel: { panel: "foh", x: 756 / 1120, y: 190 / 260 }, ghost: true },
    "foh-bus-7-output": { label: "FOH Bus 7 Output", kind: "jack", panelRel: { panel: "foh", x: 802 / 1120, y: 190 / 260 }, ghost: true },
    "foh-bus-8-output": { label: "FOH Bus 8 Output", kind: "jack", panelRel: { panel: "foh", x: 848 / 1120, y: 190 / 260 }, ghost: true },
    "foh-line-out-3": { label: "Aux 3 Output", kind: "jack", panelJack: "foh.lineOut3", ghost: true },
    "aux-2-output": { label: "Aux 2 Output", kind: "jack", panelJack: "foh.lineOut2" },
    "talkback-output": { label: "Talkback Output", kind: "jack", panelJack: "foh.lineOut4" },
    "aux-3-output": { label: "Aux 3 Output", kind: "jack", panelJack: "foh.lineOut3" },
    "foh-line-out-4": { label: "FOH Line Out 4", kind: "jack", panelJack: "foh.lineOut4", ghost: true },

    "system-processor-left-in": { label: "System Processor Left In", kind: "jack", panelJack: "amp.inputA" },
    "system-processor-right-in": { label: "System Processor Right In", kind: "jack", panelJack: "amp.inputB" },
    "sub-processor-input": { label: "Sub Input", kind: "jack", panelJack: "amp.link" },
    "in-ear-b-in": { label: "In-Ear B In", kind: "jack", panelJack: "amp.inputB" },
    "vocal-wedge-input": { label: "Vocal Wedge Input", kind: "jack", panelJack: "monitor.input" },
    "vocal-wedge-thru": { label: "Vocal Wedge Thru", kind: "jack", panelJack: "monitor.thru", ghost: true },
    "vocal-wedge-aux-in": { label: "Vocal Wedge Aux In", kind: "jack", panelJack: "monitor.auxIn", ghost: true },

    "iem-tx-a-left-input": { label: "IEM TX A Left Input", kind: "jack", panelRel: { panel: "iem", x: 230 / 900, y: 140 / 240 } },
    "iem-tx-a-right-input": { label: "IEM TX A Right Input", kind: "jack", panelRel: { panel: "iem", x: 310 / 900, y: 140 / 240 } },
    "iem-tx-b-left-input": { label: "IEM TX B Left Input", kind: "jack", panelRel: { panel: "iem", x: 460 / 900, y: 140 / 240 }, ghost: true },
    "iem-tx-b-right-input": { label: "IEM TX B Right Input", kind: "jack", panelRel: { panel: "iem", x: 540 / 900, y: 140 / 240 }, ghost: true },
    "iem-tx-phones": { label: "IEM TX Phones", kind: "jack", panelRel: { panel: "iem", x: 740 / 900, y: 140 / 240 }, ghost: true },

    "liv006-system-processor-l-input": { label: "System Processor L In", kind: "jack", panelRel: { panel: "amp", x: 94 / 940, y: 146 / 260 } },
    "liv006-system-processor-r-input": { label: "System Processor R In", kind: "jack", panelRel: { panel: "amp", x: 214 / 940, y: 146 / 260 } },
    "liv006-delay-tower-processor-input": { label: "Delay Tower Processor Input", kind: "jack", panelRel: { panel: "amp", x: 470 / 940, y: 146 / 260 } },
    "liv006-sub-processor-input": { label: "Sub Processor Input", kind: "jack", panelRel: { panel: "amp", x: 704 / 940, y: 146 / 260 }, ghost: true },
    "liv006-front-fill-processor-input": { label: "Front Fill Processor Input", kind: "jack", panelRel: { panel: "amp", x: 818 / 940, y: 146 / 260 }, ghost: true },

    "delay-tower-processing-input": { label: "Delay", kind: "jack", panelJack: "amp.link" },
    "processor-output-a": { label: "Processor Output A", kind: "jack", panelJack: "amp.outputA", ghost: true },
    "processor-output-b": { label: "Processor Output B", kind: "jack", panelJack: "amp.outputB", ghost: true }
  };

  function textOf(el) {
    return (el && el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function normalize(text) {
    return String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function getLevelId() {
    const fromHash = String(location.hash || "").match(/\/level\/([^/?#]+)/);
    if (fromHash) return decodeURIComponent(fromHash[1]).toUpperCase();

    const selected = Array.from(document.querySelectorAll("select"))
      .map(el => String(el.value || "").trim().toUpperCase())
      .find(value => /^LIV-\d+$/i.test(value));

    return selected || "";
  }

  function hardwareAssetFor(kind) {
    if (LEVEL.assetOverrides && LEVEL.assetOverrides[kind]) {
      return LEVEL.assetOverrides[kind];
    }

    return {
      stagebox: "/assets/live-sound/svg/hardware/stagebox-snake-head.svg",
      foh: "/assets/live-sound/svg/hardware/foh-console-io-panel.svg",
      monitor: "/assets/live-sound/svg/hardware/monitor-wedge-input-panel.svg",
      iem: "/assets/live-sound/svg/hardware/iem-wireless-rack-front.svg",
      amp: "/assets/live-sound/svg/hardware/power-amplifier.svg"
    }[kind];
  }

  function areaOf(el) {
    const r = el.getBoundingClientRect();
    return Math.max(0, r.width * r.height);
  }

  function findSurface() {
    const all = Array.from(document.querySelectorAll("div, section, article, main"));

    const titleEl = all
      .filter(el => textOf(el).includes("Live Console + Rack World"))
      .sort((a, b) => textOf(a).length - textOf(b).length)[0];

    if (!titleEl) return null;

    // The surface must be the visual board body below the brown header, not the
    // whole game shell and not the left checklist/sidebar. Pick the largest
    // nearby descendant that lives inside the board card, has enough space, and
    // does not include the level brief / checklist text.
    let card = titleEl;

    for (let i = 0; i < 10 && card && card.parentElement; i++) {
      const r = card.getBoundingClientRect();
      if (r.width > 850 && r.height > 430) break;
      card = card.parentElement;
    }

    if (!card) return null;

    const cardRect = card.getBoundingClientRect();

    const candidates = Array.from(card.querySelectorAll("div, section, article, main"))
      .filter(el => {
        const r = el.getBoundingClientRect();
        const t = textOf(el);

        return (
          r.width > 650 &&
          r.height > 360 &&
          r.left >= cardRect.left - 4 &&
          r.right <= cardRect.right + 4 &&
          !t.includes("PATCH THESE EXTERNAL CONNECTIONS") &&
          !t.includes("CURRENT LEVEL") &&
          !t.includes("REALITY CHECK") &&
          !t.includes("EDUCATIONAL TOOLS")
        );
      })
      .sort((a, b) => areaOf(b) - areaOf(a));

    // Prefer the old visual playfield if it contains the original helper text.
    const playfield = candidates.find(el =>
      textOf(el).includes("Build the path through the console") ||
      textOf(el).includes("STAGEBOX AUX MATRIX PA") ||
      textOf(el).includes("CONSOLE + AMP RACK")
    );

    const surface = playfield || candidates[0] || card;

    console.log("[Signal Flow] Native surface selected:", {
      text: textOf(surface).slice(0, 90),
      rect: surface.getBoundingClientRect()
    });

    return surface;
  }

  function routeFor(a, b) {
    return LEVEL.validRoutes.find(route =>
      (route.from === a && route.to === b) ||
      (route.from === b && route.to === a)
    ) || null;
  }

  function routeAlreadyExists(routeKey) {
    return state.routes.some(route => route.key === routeKey);
  }

  function nodeLabel(key) {
    return NODE_DEFS[key] ? NODE_DEFS[key].label : key;
  }

  function fallbackNativePanelPoint(level, panelJackId) {
    const stage = level.panels && level.panels.find && level.panels.find(p => p.id === "stagebox");
    const foh = level.panels && level.panels.find && level.panels.find(p => p.id === "foh");
    const amp = level.panels && level.panels.find && level.panels.find(p => p.id === "amp");

    const stageMatch = /^stagebox\.input(\d+)$/.exec(panelJackId || "");
    if (stage && stageMatch) {
      const n = Number(stageMatch[1]);

      if (LEVEL_ID === "LIV-028" && n >= 1 && n <= 16) {
        const svgXs = [92, 168, 244, 320, 396, 472, 548, 624];
        const col = (n - 1) % 8;
        const row = n > 8 ? 1 : 0;
        const assetHeight = stage.width * 360 / 980;

        return {
          x: stage.x + stage.width * (svgXs[col] / 980),
          y: stage.y + assetHeight * ((row ? 250 : 125) / 360)
        };
      }

      if (n >= 1 && n <= 16) {
        const col = (n - 1) % 8;
        const row = n > 8 ? 1 : 0;

        return {
          x: stage.x + stage.width * (0.12 + col * 0.065),
          y: stage.y + (row ? 126 : 72)
        };
      }
    }

    const fohOutMatch = /^foh\.lineOut(\d+)$/.exec(panelJackId || "");
    if (foh && fohOutMatch) {
      const n = Number(fohOutMatch[1]);

      if (n >= 1 && n <= 4) {
        return {
          x: foh.x + foh.width * (0.62 + (n - 1) * 0.052),
          y: foh.y + 72
        };
      }
    }

    if (amp && panelJackId === "amp.inputB") {
      return {
        x: amp.x + amp.width * 0.245,
        y: amp.y + 62
      };
    }

    if (amp && panelJackId === "amp.link") {
      return {
        x: amp.x + amp.width * 0.34,
        y: amp.y + 72
      };
    }

    return null;
  }

  function pointFromPanel(adapter, level, panelJackId) {
    if (
      LEVEL_ID === "LIV-028" &&
      (
        /^stagebox\.input([1-9]|1[0-6])$/.test(panelJackId || "") ||
        panelJackId === "amp.inputB"
      )
    ) {
      const fallback = fallbackNativePanelPoint(level, panelJackId);
      if (fallback) return fallback;
    }

    try {
      const pt = adapter.endpointPanelPoint(level, panelJackId, {
        levelId: LEVEL_ID,
        scenario: "native-liv025"
      });

      if (pt && Number.isFinite(pt.x) && Number.isFinite(pt.y)) return pt;
    } catch (err) {}

    const fallback = fallbackNativePanelPoint(level, panelJackId);
    if (fallback) return fallback;

    return adapter.endpointPanelPoint(level, panelJackId, {
      levelId: LEVEL_ID,
      scenario: "native-liv025"
    });
  }

  function buildLevelGeometry(surface) {
    const rect = surface.getBoundingClientRect();

    const layoutHeight = Math.min(rect.height, 640);
    const layoutRect = {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.top + layoutHeight,
      width: rect.width,
      height: layoutHeight
    };

    const isTalkbackBoard = LEVEL_ID === "LIV-028";
    const isStereoIemBoard = LEVEL_ID === "LIV-003";
    const isDelayTowerBoard = LEVEL_ID === "LIV-006";
    const liv = isTalkbackBoard ? LIV_028_LAYOUT : null;

    const defaultPanels = [
      {
        id: "stagebox",
        kind: "stagebox",
        x: rect.width * (liv ? liv.stagebox.x : 0.06),
        y: layoutHeight * (liv ? liv.stagebox.y : 0.34),
        width: rect.width * (liv ? liv.stagebox.width : 0.39)
      },
      {
        id: "foh",
        kind: "foh",
        x: rect.width * (isDelayTowerBoard ? 0.055 : (isStereoIemBoard ? 0.06 : (liv ? liv.foh.x : 0.39))),
        y: layoutHeight * (isDelayTowerBoard ? 0.105 : (isStereoIemBoard ? 0.18 : (liv ? liv.foh.y : 0.15))),
        width: rect.width * (isDelayTowerBoard ? 0.89 : (isStereoIemBoard ? 0.88 : (liv ? liv.foh.width : 0.55)))
      },
      {
        id: "amp",
        kind: "amp",
        x: rect.width * (isDelayTowerBoard ? 0.075 : 0.22),
        y: layoutHeight * (isDelayTowerBoard ? 0.50 : 0.58),
        width: rect.width * (isDelayTowerBoard ? 0.88 : 0.60)
      }
    ];

    const manifestPanels = defaultPanels.concat([
      {
        id: "monitor",
        kind: "monitor",
        x: rect.width * 0.52,
        y: layoutHeight * 0.54,
        width: rect.width * 0.34
      },
      {
        id: "iem",
        kind: "iem",
        x: rect.width * (isStereoIemBoard ? 0.20 : 0.20),
        y: layoutHeight * (isStereoIemBoard ? 0.58 : 0.58),
        width: rect.width * (isStereoIemBoard ? 0.66 : 0.66)
      }
    ]);

    const panels = LEVEL.panelKinds
      ? manifestPanels.filter(panel => LEVEL.panelKinds.includes(panel.kind))
      : defaultPanels;

    return {
      id: LEVEL_ID,
      rect: layoutRect,
      panels
    };
  }



  function getNodePoint(adapter, level, key) {
    if (LEVEL_ID === "LIV-028") {
      const sourceIndex = {
        "lead-vocal-mic": 0,
        "keys-left-di": 1,
        "keys-right-di": 2,
        "talkback-mic": 3
      };

      if (Object.prototype.hasOwnProperty.call(sourceIndex, key)) {
        return {
          x: level.rect.width * LIV_028_LAYOUT.sources.x,
          y: level.rect.height * LIV_028_LAYOUT.sources.firstY + sourceIndex[key] * LIV_028_LAYOUT.sources.gap
        };
      }
    }

    const def = NODE_DEFS[key];

    if (!def) {
      return {
        x: level.rect.width * 0.5,
        y: level.rect.height * 0.5
      };
    }

    if (def.panelRel) {
      const panel = (level.panels || []).find(item => item.id === def.panelRel.panel || item.kind === def.panelRel.panel);
      if (panel) {
        const panelAspect = {
          stagebox: 260 / 860,
          foh: 260 / 1120,
          monitor: 240 / 850,
          iem: 240 / 900,
          amp: 260 / 940
        }[panel.kind] || 0.25;

        return {
          x: panel.x + panel.width * def.panelRel.x,
          y: panel.y + panel.width * panelAspect * def.panelRel.y
        };
      }
    }

    if (def.panelJack) {
      return pointFromPanel(adapter, level, def.panelJack);
    }

    const sourceBaseX = level.rect.width * 0.06;
    const sourceBaseY = level.rect.height * 0.11;

    return {
      x: sourceBaseX + (def.x || 0),
      y: sourceBaseY + (def.y || 0)
    };
  }



  function hideLegacyBoard(surface) {
    // Do NOT hide the whole board card. The header contains Inspect, Back Panel,
    // Undo, and Clear. Hiding the entire child tree made those controls vanish.
    // Only fade the old visual modules that are being replaced by the native layer.
    const labels = [
      "Sources",
      "Stage Box / Stage Box Inputs",
      "Front-of-House Console",
      "Monitor and System Rack",
      "System Processor"
    ];

    Array.from(surface.querySelectorAll("div, section, article")).forEach(el => {
      const text = textOf(el);
      if (labels.some(label => text.includes(label))) {
        el.style.opacity = "0.035";
        el.style.filter = "blur(1px)";
        el.style.pointerEvents = "none";
      }
    });
  }

  function restoreLegacyBoard(surface) {
    Array.from(surface.querySelectorAll("div, section, article")).forEach(el => {
      el.style.opacity = "";
      el.style.filter = "";
      el.style.pointerEvents = "";
    });
  }

  function createLabel(layer, text, x, y, size) {
    const el = document.createElement("div");
    el.textContent = text;
    el.style.cssText = [
      "position:absolute",
      "left:" + x + "px",
      "top:" + y + "px",
      "font:900 " + (size || 12) + "px system-ui,-apple-system,Segoe UI,sans-serif",
      "letter-spacing:.08em",
      "color:#ffd76a",
      "text-shadow:0 2px 8px #000",
      "z-index:20",
      "pointer-events:none"
    ].join(";");
    layer.appendChild(el);
  }

  function cableHash(text) {
    let hash = 0;
    String(text || "").split("").forEach(ch => {
      hash = ((hash << 5) - hash) + ch.charCodeAt(0);
      hash |= 0;
    });
    return Math.abs(hash);
  }

  function defaultCableBend(routeKey, index) {
    const lanes = [-54, -36, -20, 18, 34, 52, 68];
    return lanes[(cableHash(routeKey) + index) % lanes.length];
  }

  function cableD(from, to, bend) {
    // LIV-025 natural cable feel:
    // - cables sag downward with gravity
    // - each route gets a slightly different lane/bow
    // - near-vertical runs bow sideways instead of stacking on top of each other
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const span = Math.max(1, Math.hypot(dx, dy));
    const lane = Number.isFinite(bend) ? bend : 0;

    const sag = Math.max(38, Math.min(190, span * 0.20 + Math.abs(dy) * 0.10));
    const verticalish = Math.abs(dy) > Math.abs(dx) * 1.35;

    let c1;
    let c2;

    if (verticalish) {
      const side = lane || (dx >= 0 ? 38 : -38);
      c1 = {
        x: from.x + side,
        y: from.y + Math.max(40, span * 0.28)
      };
      c2 = {
        x: to.x + side * 0.72,
        y: to.y - Math.max(32, span * 0.18)
      };
    } else {
      c1 = {
        x: from.x + dx * 0.34 + lane * 0.20,
        y: from.y + sag + lane * 0.12
      };
      c2 = {
        x: from.x + dx * 0.66 - lane * 0.20,
        y: to.y + sag - lane * 0.12
      };
    }

    return (
      "M " + from.x + " " + from.y +
      " C " + c1.x + " " + c1.y + ", " + c2.x + " " + c2.y + ", " + to.x + " " + to.y
    );
  }

  function cubicPoint(p0, p1, p2, p3, t) {
    const mt = 1 - t;
    return {
      x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
      y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y
    };
  }

  function distanceToCable(point, from, to, bend) {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const lift = Math.max(55, Math.min(150, (dx + dy) * 0.16)) + (bend || 0);
    const midY = Math.min(from.y, to.y) - lift;

    const p0 = from;
    const p1 = { x: from.x, y: midY };
    const p2 = { x: to.x, y: midY };
    const p3 = to;

    let best = Infinity;
    for (let i = 0; i <= 48; i++) {
      const p = cubicPoint(p0, p1, p2, p3, i / 48);
      const d = Math.hypot(p.x - point.x, p.y - point.y);
      if (d < best) best = d;
    }
    return best;
  }

  function getCableSvg(layer) {
    let svg = layer.querySelector(".sf-native-cables");
    if (svg) return svg;

    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("sf-native-cables");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.cssText = [
      "position:absolute",
      "inset:0",
      "z-index:1800",
      "pointer-events:none",
      "overflow:visible"
    ].join(";");
    layer.appendChild(svg);
    return svg;
  }

  function cablePointAtMid(from, to, bend) {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const lift = Math.max(55, Math.min(150, (dx + dy) * 0.16)) + (bend || 0);
    const midY = Math.min(from.y, to.y) - lift;

    return cubicPoint(
      from,
      { x: from.x, y: midY },
      { x: to.x, y: midY },
      to,
      0.5
    );
  }

  function createCableDragHandle(layer, route) {
    // Disabled: LIV-025 now uses drag-from-endpoint-to-endpoint patching,
    // not midpoint cable-bend handles.
    return;
    const point = cablePointAtMid(route.fromPoint, route.toPoint, route.bend || 0);

    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = "sf-cable-drag-handle";
    handle.setAttribute("aria-label", "Drag cable");
    handle.dataset.routeKey = route.key;

    handle.style.cssText = [
      "position:absolute",
      "left:" + point.x + "px",
      "top:" + point.y + "px",
      "width:30px",
      "height:46px",
      "transform:translate(-50%,-50%)",
      "border-radius:50%",
      "border:2px solid rgba(255,255,255,.82)",
      "background:rgba(18,32,48,.82)",
      "box-shadow:0 0 0 2px rgba(0,0,0,.45), 0 0 14px rgba(255,255,255,.20)",
      "cursor:grab",
      "pointer-events:auto",
      "z-index:260",
      "touch-action:none"
    ].join(";");

    handle.addEventListener("mouseenter", () => {
      handle.style.boxShadow = "0 0 0 2px rgba(255,255,255,.35)";
    });

    handle.addEventListener("mouseleave", () => {
      handle.style.boxShadow = "";
    });

    handle.addEventListener("click", event => {
      console.log("[Signal Flow] Native cable drag handle click swallowed.");
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }, true);

    layer.appendChild(handle);
  }

  function drawCable(layer, route) {
    const svg = getCableSvg(layer);
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.dataset.routeKey = route.key;
    group.dataset.from = JSON.stringify(route.fromPoint);
    group.dataset.to = JSON.stringify(route.toPoint);
    group.dataset.bend = String(route.bend || 0);

    const color = route.valid ? "#55e36f" : "#ff4f4f";
    const glow = route.valid ? "rgba(85,227,111,.56)" : "rgba(255,79,79,.58)";

    const shadow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    shadow.classList.add("sf-cable-shadow");
    shadow.setAttribute("fill", "none");
    shadow.setAttribute("stroke", "rgba(0,0,0,.62)");
    shadow.setAttribute("stroke-width", "10");
    shadow.setAttribute("stroke-linecap", "round");
    shadow.setAttribute("d", cableD(route.fromPoint, route.toPoint, route.bend || 0));
    group.appendChild(shadow);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.classList.add("sf-cable-line");
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", "5");
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("opacity", "0.96");
    line.setAttribute("d", cableD(route.fromPoint, route.toPoint, route.bend || 0));
    line.style.filter = "drop-shadow(0 0 10px " + glow + ")";
    group.appendChild(line);

    [route.fromPoint, route.toPoint].forEach(point => {
      const dotShadow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dotShadow.setAttribute("cx", point.x);
      dotShadow.setAttribute("cy", point.y);
      dotShadow.setAttribute("r", "7");
      dotShadow.setAttribute("fill", "rgba(0,0,0,.62)");
      group.appendChild(dotShadow);

      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", point.x);
      dot.setAttribute("cy", point.y);
      dot.setAttribute("r", "5");
      dot.setAttribute("fill", color);
      group.appendChild(dot);
    });

    svg.appendChild(group);
    createCableDragHandle(layer, route);
  }

  function redrawCables(layer) {
    const old = layer.querySelector(".sf-native-cables");
    if (old) old.remove();

    layer.querySelectorAll(".sf-cable-drag-handle").forEach(handle => handle.remove());

    state.routes.forEach(route => drawCable(layer, route));

    const svg = layer.querySelector(".sf-native-cables");
    if (svg && svg.parentNode) {
      svg.parentNode.appendChild(svg);
    }

    // Handles must stay above the cable SVG.
    layer.querySelectorAll(".sf-cable-drag-handle").forEach(handle => layer.appendChild(handle));

    console.log("[Signal Flow] Native cables redrawn:", state.routes.length);
  }

  function updateCableGroup(group, from, to, bend) {
    group.dataset.bend = String(bend);
    const d = cableD(from, to, bend);
    group.querySelectorAll("path").forEach(path => path.setAttribute("d", d));
  }

  function installCableDrag(layer) {
    if (layer.dataset.dragInstalled === "1") return;
    layer.dataset.dragInstalled = "1";

    let drag = null;

    layer.addEventListener("pointerdown", event => {
      const handle = event.target && event.target.closest && event.target.closest(".sf-cable-drag-handle");
      if (!handle) return;

      const routeKey = handle.dataset.routeKey;
      const route = state.routes.find(item => item.key === routeKey);
      if (!route) return;

      drag = {
        route,
        startY: event.clientY,
        startBend: route.bend || 0
      };

      handle.style.cursor = "grabbing";
      layer.style.cursor = "grabbing";

      try {
        handle.setPointerCapture && handle.setPointerCapture(event.pointerId);
      } catch (err) {}

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }, true);

    window.addEventListener("pointermove", event => {
      if (!drag) return;

      drag.route.bend = Math.max(-120, Math.min(170, drag.startBend + (drag.startY - event.clientY)));
      redrawCables(layer);

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }, true);

    function endDrag(event) {
      if (drag) {
        layer.style.cursor = "";
        if (event) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation && event.stopImmediatePropagation();
        }
      }
      drag = null;
    }

    window.addEventListener("pointerup", endDrag, true);
    window.addEventListener("pointercancel", endDrag, true);
  }

  function getNativeAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;

      if (!window.__sfLiveNativeAudioContext) {
        window.__sfLiveNativeAudioContext = new AudioContext();
      }

      const ctx = window.__sfLiveNativeAudioContext;
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    } catch (err) {
      return null;
    }
  }

  function playNativeTone(freq, delay, duration, gainValue, type) {
    const ctx = getNativeAudioContext();
    if (!ctx) return;

    const start = ctx.currentTime + (delay || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue || 0.12, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + duration + 0.03);
  }

  function playNativeSfx(src, volume, delay) {
    try {
      const play = () => {
        const audio = new Audio(src);
        audio.volume = volume == null ? 0.75 : volume;
        audio.currentTime = 0;

        const result = audio.play();
        if (result && result.catch) {
          result.catch(err => {
            console.warn("[Signal Flow] Native SFX play blocked:", src, err);
          });
        }
      };

      if (delay) {
        setTimeout(play, delay);
      } else {
        play();
      }
    } catch (err) {
      console.warn("[Signal Flow] Native SFX failed:", src, err);
    }
  }

  function playGoodConnect() {
    playNativeSfx("/assets/audio/sfx/SFcoin(81).wav", 0.75, 0);
  }

  function playBadConnect() {
    playNativeSfx("/assets/audio/sfx/wrong_patch_blip(51).mp3", 0.78, 0);
  }

  function checklistDocuments() {
    const docs = [];

    function addDoc(doc) {
      if (doc && docs.indexOf(doc) === -1) docs.push(doc);
    }

    addDoc(document);

    // When running through the v1.41.18 wrapper, the game lives inside an
    // iframe. Search both this document and the parent document's same-origin
    // frames so checklist marking works whether the renderer is executing from
    // the game frame or a wrapper-injected context.
    try {
      if (window.parent && window.parent !== window && window.parent.document) {
        addDoc(window.parent.document);
        Array.from(window.parent.document.querySelectorAll("iframe")).forEach(frame => {
          try { addDoc(frame.contentDocument); } catch (err) {}
        });
      }
    } catch (err) {}

    Array.from(document.querySelectorAll("iframe")).forEach(frame => {
      try { addDoc(frame.contentDocument); } catch (err) {}
    });

    return docs;
  }

  function findChecklistTarget(routeKey) {
    const routeIndex = LEVEL.validRoutes.findIndex(r => r.key === routeKey);
    const route = LEVEL.validRoutes[routeIndex];
    if (!route) return null;

    const parts = route.checklist
      .toLowerCase()
      .split("→")
      .map(part => normalize(part))
      .filter(Boolean);

    let allRows = [];

    checklistDocuments().forEach(doc => {
      const rows = Array.from(doc.querySelectorAll(".path-card"))
        .filter(row => row && row.isConnected && row.querySelector(".todo-badge"));

      allRows = allRows.concat(rows);
    });

    // De-dupe rows in case parent-frame scanning sees the same document twice.
    allRows = allRows.filter((row, index) => allRows.indexOf(row) === index);

    const exact = allRows.find(row => {
      const text = normalize(textOf(row));
      return parts.every(part => text.includes(part));
    });

    const row = exact || allRows[routeIndex];
    if (!row) {
      console.warn("[Signal Flow] Native checklist rows available:", allRows.map(row => textOf(row)));
      return null;
    }

    const badge = row.querySelector(".todo-badge");
    if (!badge) {
      console.warn("[Signal Flow] Native checklist row missing badge:", textOf(row));
      return null;
    }

    console.log("[Signal Flow] Native checklist target matched:", routeKey, textOf(row));
    return { row, badge };
  }

  function markChecklist(routeKey) {
    const target = findChecklistTarget(routeKey);
    if (!target) {
      console.warn("[Signal Flow] Native checklist target not found:", routeKey);
      return;
    }

    const row = target.row;
    const badge = target.badge;

    row.dataset.sfLiveChecklistState = "complete";
    row.style.borderColor = "#55e36f";
    row.style.boxShadow = "0 0 0 1px rgba(85,227,111,.85), 0 0 18px rgba(85,227,111,.25)";
    row.style.background = "rgba(31,92,45,.58)";

    badge.textContent = "COMPLETE";
    badge.style.background = "#55e36f";
    badge.style.color = "#062b10";
    badge.style.boxShadow = "0 0 14px rgba(85,227,111,.55)";

    try {
      row.animate([
        { transform: "scale(1)", boxShadow: row.style.boxShadow },
        { transform: "scale(1.025)", boxShadow: "0 0 0 2px rgba(85,227,111,.95), 0 0 30px rgba(85,227,111,.48)" },
        { transform: "scale(1)", boxShadow: row.style.boxShadow }
      ], {
        duration: 420,
        easing: "ease-out"
      });
    } catch (err) {}
  }

  function unmarkChecklist(routeKey) {
    const target = findChecklistTarget(routeKey);
    if (!target) {
      console.warn("[Signal Flow] Native checklist target not found for unmark:", routeKey);
      return;
    }

    const row = target.row;
    const badge = target.badge;

    row.dataset.sfLiveChecklistState = "";
    row.style.borderColor = "";
    row.style.boxShadow = "";
    row.style.background = "";

    badge.textContent = "TO DO";
    badge.style.background = "";
    badge.style.color = "";
    badge.style.boxShadow = "";
  }

  function setSelected(node, selected) {
    node.el.style.boxShadow = selected
      ? "0 0 0 3px rgba(111,208,255,.95), 0 0 20px rgba(111,208,255,.55)"
      : node.defaultShadow;
  }

  function clearSelection() {
    if (selectedNode) setSelected(selectedNode, false);
    selectedNode = null;
  }

  function flashNode(node) {
    node.el.style.boxShadow = "0 0 0 3px rgba(255,80,80,.95), 0 0 20px rgba(255,80,80,.55)";
    setTimeout(() => {
      if (!selectedNode || selectedNode.el !== node.el) node.el.style.boxShadow = node.defaultShadow;
    }, 260);
  }

  function closeNativeCompletionPopup() {
    document.querySelectorAll(".sf-native-complete-modal").forEach(el => el.remove());
  }

  function resetNativeLevelComplete() {
    nativeLevelCompleteShown = false;
    closeNativeCompletionPopup();
  }

  function allCanonicalLevelIds() {
    try {
      const data =
        (typeof DATA !== "undefined" && DATA) ||
        (window.DATA && window.DATA) ||
        null;

      const levels = data && Array.isArray(data.levels)
        ? data.levels
        : [];

      return levels
        .map(item => item && item.id)
        .filter(id => typeof id === "string" && id.length > 0);
    } catch (err) {
      return [];
    }
  }

  function nextNativeLevelId() {
    const ids = allCanonicalLevelIds();
    const index = ids.indexOf(LEVEL_ID);

    if (index >= 0) {
      return ids[index + 1] || null;
    }

    const match = String(LEVEL_ID || "").match(/^LIV-(\d+)$/i);
    if (!match) return null;

    const nextNumber = String(Number(match[1]) + 1).padStart(3, "0");
    return "LIV-" + nextNumber;
  }

  function goToNativeLevel(levelId) {
    if (!levelId) {
      closeNativeCompletionPopup();
      return;
    }

    closeNativeCompletionPopup();
    resetNativeLevelComplete();

    const route = "/level/" + encodeURIComponent(levelId);

    try {
      if (typeof window.navigateTo === "function") {
        window.navigateTo(route);
        return;
      }
    } catch (err) {}

    try {
      if (
        window.parent &&
        window.parent !== window &&
        typeof window.parent.navigateTo === "function"
      ) {
        window.parent.navigateTo(route);
        return;
      }
    } catch (err) {}

    try {
      if (location.hash !== "#" + route) {
        location.hash = route;
      } else {
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
      return;
    } catch (err) {}

    window.location.href = "#" + route;
  }

  function showNativeCompletionPopup() {
    closeNativeCompletionPopup();

    const modal = document.createElement("div");
    modal.className = "sf-native-complete-modal";
    modal.style.cssText = [
      "position:fixed",
      "inset:0",
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "background:rgba(0,0,0,.42)",
      "z-index:2147483000",
      "pointer-events:auto"
    ].join(";");

    const card = document.createElement("div");
    card.style.cssText = [
      "width:min(420px, calc(100vw - 40px))",
      "padding:24px 26px",
      "border-radius:18px",
      "background:linear-gradient(180deg, #20170d, #0e0b08)",
      "border:1px solid rgba(255,215,106,.42)",
      "box-shadow:0 24px 70px rgba(0,0,0,.62), 0 0 28px rgba(255,215,106,.18)",
      "color:#fff7d1",
      "font-family:inherit",
      "text-align:center"
    ].join(";");

    const title = document.createElement("div");
    title.textContent = "Level Complete";
    title.style.cssText = [
      "font-size:28px",
      "font-weight:900",
      "letter-spacing:.04em",
      "margin-bottom:10px",
      "color:#ffe66c",
      "text-transform:uppercase"
    ].join(";");

    const body = document.createElement("div");
    const nextId = nextNativeLevelId();

    body.textContent = nextId
      ? "All required routes are patched correctly. Continue to " + nextId + "."
      : "All required routes are patched correctly.";
    body.style.cssText = [
      "font-size:16px",
      "line-height:1.35",
      "margin-bottom:20px",
      "color:#f7ead0"
    ].join(";");

    const button = document.createElement("button");
    button.textContent = nextId ? "Next Level" : "Continue";
    button.style.cssText = [
      "appearance:none",
      "border:0",
      "border-radius:12px",
      "padding:11px 18px",
      "font-size:15px",
      "font-weight:900",
      "background:#ffd76a",
      "color:#15100a",
      "cursor:pointer",
      "box-shadow:0 6px 18px rgba(0,0,0,.35)"
    ].join(";");

    button.addEventListener("click", () => {
      if (nextId) {
        goToNativeLevel(nextId);
      } else {
        closeNativeCompletionPopup();
      }
    });

    card.appendChild(title);
    card.appendChild(body);
    card.appendChild(button);
    modal.appendChild(card);
    document.body.appendChild(modal);
  }

  function checkNativeLevelComplete() {
    const complete =
      LEVEL.validRoutes.length > 0 &&
      LEVEL.validRoutes.every(route => state.completedValidKeys.has(route.key));

    if (!complete) {
      nativeLevelCompleteShown = false;
      closeNativeCompletionPopup();
      return;
    }

    if (nativeLevelCompleteShown) return;

    nativeLevelCompleteShown = true;
    setTimeout(showNativeCompletionPopup, 180);
  }

  function updateNativeScore() {
    const score = state.completedValidKeys.size * 100;

    const roots = [document];

    try {
      if (window.parent && window.parent !== window && window.parent.document) {
        roots.push(window.parent.document);
      }
    } catch (err) {}

    roots.forEach(doc => {
      const scoreNodes = Array.from(doc.querySelectorAll('[class*="score" i], [id*="score" i], div, span, b, strong'))
        .filter(el => {
          const text = normalize(textOf(el));
          const r = el.getBoundingClientRect();
          return (
            r.width > 20 &&
            r.height > 8 &&
            text.includes("score")
          );
        });

      scoreNodes.forEach(node => {
        const numberChild = Array.from(node.querySelectorAll("div, span, b, strong"))
          .find(child => /^\d+$/.test(normalize(textOf(child))));

        if (numberChild) {
          numberChild.textContent = String(score);
          return;
        }

        const text = textOf(node);
        if (/score\s*\d+/i.test(text)) {
          node.textContent = text.replace(/(score\s*)\d+/i, "$1" + score);
        }
      });

      // Fallback for compact score displays where the label and number are siblings.
      const visibleNumbers = Array.from(doc.querySelectorAll("div, span, b, strong"))
        .filter(el => {
          const r = el.getBoundingClientRect();
          return /^\d+$/.test(normalize(textOf(el))) && r.width > 5 && r.height > 8 && r.top < 260;
        });

      const likelyScoreNumber = visibleNumbers.find(el => {
        let parent = el.parentElement;
        for (let i = 0; i < 4 && parent; i++, parent = parent.parentElement) {
          if (normalize(textOf(parent)).includes("score")) return true;
        }
        return false;
      });

      if (likelyScoreNumber) likelyScoreNumber.textContent = String(score);
    });

    console.log("[Signal Flow] Native score updated:", score);
  }

  function addRoute(layer, fromNode, toNode) {
    const valid = routeFor(fromNode.key, toNode.key);
    const key = valid
      ? valid.key
      : "invalid:" + [fromNode.key, toNode.key].sort().join("--");

    if (state.routes.some(route => route.key === key)) return;

    const route = {
      key,
      valid: !!valid,
      from: fromNode.key,
      to: toNode.key,
      fromPoint: fromNode.point,
      toPoint: toNode.point,
      bend: defaultCableBend(key, state.routes.length)
    };

    state.routes.push(route);
    console.log("[Signal Flow] Native route added:", route.key, "valid?", route.valid);

    if (valid) {
      state.completedValidKeys.add(valid.key);
      markChecklist(valid.key);
      playGoodConnect();
    } else {
      playBadConnect();
      flashNode(fromNode);
      flashNode(toNode);
    }

    updateNativeScore();
    checkNativeLevelComplete();
    redrawCables(layer);
  }

  function handleNodeClick(layer, node) {
    console.log("[Signal Flow] Native node select/connect:", node.key, "selected was", selectedNode && selectedNode.key);

    if (!selectedNode) {
      selectedNode = node;
      setSelected(node, true);
      return;
    }

    if (selectedNode.key === node.key) {
      clearSelection();
      return;
    }

    addRoute(layer, selectedNode, node);
    clearSelection();
  }

  function pointInLayerFromEvent(layer, event) {
    const r = layer.getBoundingClientRect();
    return {
      x: event.clientX - r.left,
      y: event.clientY - r.top
    };
  }

  function pointForNativeNode(layer, el) {
    const px = parseFloat(el.dataset.sfNativePointX || "");
    const py = parseFloat(el.dataset.sfNativePointY || "");

    if (Number.isFinite(px) && Number.isFinite(py)) {
      return { x: px, y: py };
    }

    const r = el.getBoundingClientRect();
    const pr = layer.getBoundingClientRect();

    return {
      x: r.left - pr.left + r.width / 2,
      y: r.top - pr.top + r.height / 2
    };
  }

  function nativeNodeFromElement(layer, el) {
    const nodeEl = el && el.closest && el.closest(".sf-native-node");
    if (!nodeEl || !layer.contains(nodeEl)) return null;

    const key = nodeEl.dataset.sfNativeKey;
    if (!key) return null;

    return {
      key,
      el: nodeEl,
      defaultShadow: nodeEl.dataset.sfNativeDefaultShadow || "none",
      point: pointForNativeNode(layer, nodeEl)
    };
  }

  function nativeNodeFromDocumentPoint(layer, event) {
    const el = document.elementFromPoint(event.clientX, event.clientY);
    return nativeNodeFromElement(layer, el);
  }

  function getDragPreviewPath(layer) {
    const svg = getCableSvg(layer);
    let path = svg.querySelector(".sf-native-drag-preview");

    if (!path) {
      path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.classList.add("sf-native-drag-preview");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke-width", "5");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("opacity", "0.92");
      path.style.filter = "drop-shadow(0 0 10px rgba(255,215,106,.48))";
      svg.appendChild(path);
    }

    return path;
  }

  function removeDragPreview(layer) {
    if (!layer) return;
    layer.querySelectorAll(".sf-native-drag-preview").forEach(el => el.remove());
  }

  function updateNativePatchDrag(event) {
    if (!patchDrag) return;

    const point = pointInLayerFromEvent(patchDrag.layer, event);
    const dx = event.clientX - patchDrag.startClientX;
    const dy = event.clientY - patchDrag.startClientY;

    if (Math.hypot(dx, dy) > 6) patchDrag.moved = true;

    // Do not reveal whether the hovered endpoint is valid before drop.
    // The preview cable stays neutral while dragging; committed routes become
    // green/red only after finishNativePatchDrag() calls addRoute().
    const path = getDragPreviewPath(patchDrag.layer);
    path.setAttribute("d", cableD(patchDrag.fromNode.point, point, 0));
    path.setAttribute("stroke", "#ffd76a");
    path.style.filter = "drop-shadow(0 0 10px rgba(255,215,106,.48))";

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }

  function finishNativePatchDrag(event) {
    if (!patchDrag) return;

    const drag = patchDrag;
    patchDrag = null;

    const target = nativeNodeFromDocumentPoint(drag.layer, event);
    removeDragPreview(drag.layer);

    const shouldConnect =
      target &&
      target.key &&
      target.key !== drag.fromNode.key &&
      (drag.moved || target.el !== drag.fromNode.el);

    if (shouldConnect) {
      suppressNativeClickUntil = Date.now() + 450;
      addRoute(drag.layer, drag.fromNode, target);
      clearSelection();
    } else if (drag.moved) {
      suppressNativeClickUntil = Date.now() + 300;
    }

    window.removeEventListener("pointermove", updateNativePatchDrag, true);
    window.removeEventListener("pointerup", finishNativePatchDrag, true);
    window.removeEventListener("pointercancel", cancelNativePatchDrag, true);

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }

  function cancelNativePatchDrag(event) {
    if (!patchDrag) return;

    const layer = patchDrag.layer;
    patchDrag = null;
    removeDragPreview(layer);

    window.removeEventListener("pointermove", updateNativePatchDrag, true);
    window.removeEventListener("pointerup", finishNativePatchDrag, true);
    window.removeEventListener("pointercancel", cancelNativePatchDrag, true);

    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation && event.stopImmediatePropagation();
    }
  }

  function startNativePatchDrag(layer, node, event) {
    if (event.button != null && event.button !== 0) return;

    patchDrag = {
      layer,
      fromNode: node,
      startClientX: event.clientX,
      startClientY: event.clientY,
      moved: false
    };

    getDragPreviewPath(layer).setAttribute("d", cableD(node.point, node.point, 0));

    window.addEventListener("pointermove", updateNativePatchDrag, true);
    window.addEventListener("pointerup", finishNativePatchDrag, true);
    window.addEventListener("pointercancel", cancelNativePatchDrag, true);

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }

  function setNativeNodeDomKey(el, key, kind) {
    if (!el) return;

    const nodeKey = String(key || "");
    if (!nodeKey) return;

    el.setAttribute("data-node-key", nodeKey);
    el.setAttribute("data-key", nodeKey);
    el.setAttribute("data-node-kind", kind || "node");
  }

  function createSourceNode(layer, key, label, x, y) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.className = "sf-native-node sf-native-source";

    setNativeNodeDomKey(btn, key, "source");

    btn.setAttribute("data-node-key", key);

    btn.setAttribute("data-key", key);

    btn.setAttribute("data-node-kind", "source" || "node");
    btn.dataset.sfNativeKey = key;
    btn.setAttribute("aria-label", label);

    const defaultShadow = "0 8px 18px rgba(0,0,0,.35)";
    btn.dataset.sfNativeDefaultShadow = defaultShadow;
    btn.style.cssText = [
      "position:absolute",
      "left:" + x + "px",
      "top:" + y + "px",
      "width:170px",
      "height:46px",
      "border-radius:14px",
      "border:1px solid rgba(255,210,95,.35)",
      "background:linear-gradient(180deg,rgba(34,66,105,.96),rgba(13,28,48,.96))",
      "color:#fff",
      "font:900 11px system-ui,-apple-system,Segoe UI,sans-serif",
      "letter-spacing:.04em",
      "cursor:pointer",
      "pointer-events:auto",
      "z-index:80",
      "box-shadow:" + defaultShadow
    ].join(";");

    btn.addEventListener("pointerdown", event => {
      const rect = btn.getBoundingClientRect();
      const parent = layer.getBoundingClientRect();
      const node = {
        key,
        el: btn,
        defaultShadow,
        point: {
          x: rect.left - parent.left + rect.width / 2,
          y: rect.top - parent.top + rect.height / 2
        }
      };

      console.log("[Signal Flow] Native source drag start:", key);
      startNativePatchDrag(layer, node, event);
    }, true);

    btn.addEventListener("click", event => {
      if (Date.now() < suppressNativeClickUntil) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const rect = btn.getBoundingClientRect();
      const parent = layer.getBoundingClientRect();
      const node = {
        key,
        el: btn,
        defaultShadow,
        point: {
          x: rect.left - parent.left + rect.width / 2,
          y: rect.top - parent.top + rect.height / 2
        }
      };

      console.log("[Signal Flow] Native source clicked:", key);
      handleNodeClick(layer, node);
    });

    layer.appendChild(btn);
  }

  function updateNativeHintHighlights() {
    Array.from(document.querySelectorAll(".sf-native-jack")).forEach(btn => {
      const isGhost = btn.dataset.sfNativeGhost === "1";

      if (!nativeHintsVisible) {
        btn.style.boxShadow = "none";
        btn.style.outline = "none";
        btn.style.background = "rgba(255,255,255,0)";
        return;
      }

      if (isGhost) {
        btn.style.boxShadow = "0 0 0 2px rgba(255,255,255,.10)";
        btn.style.outline = "none";
        btn.style.background = "rgba(255,255,255,0)";
      } else {
        btn.style.boxShadow = "0 0 0 3px rgba(255,210,95,.95), 0 0 18px rgba(255,210,95,.50)";
        btn.style.outline = "none";
        btn.style.background = "rgba(255,210,95,.10)";
      }
    });
  }

  function setNativeHintsVisible(visible) {
    nativeHintsVisible = !!visible;
    console.log("[Signal Flow] Native jack hints visible:", nativeHintsVisible);
    updateNativeHintHighlights();
    raiseHintOverlays();
  }

  function createJackNode(layer, key, point, label, ghost) {
    if (!point) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sf-native-node sf-native-jack";

    setNativeNodeDomKey(btn, key, "jack");

    btn.setAttribute("data-node-key", key);

    btn.setAttribute("data-key", key);

    btn.dataset.sfNativeKey = key;
    btn.dataset.sfNativeGhost = ghost ? "1" : "0";
    btn.setAttribute("aria-label", label);

    const defaultShadow = "none";
    btn.dataset.sfNativeDefaultShadow = defaultShadow;
    btn.dataset.sfNativePointX = String(point.x);
    btn.dataset.sfNativePointY = String(point.y);
    btn.style.cssText = [
      "position:absolute",
      "left:" + point.x + "px",
      "top:" + point.y + "px",
      "width:" + (ghost ? 34 : 42) + "px",
      "height:" + (ghost ? 34 : 42) + "px",
      "transform:translate(-50%,-50%)",
      "border-radius:50%",
      "border:0",
      "background:rgba(255,255,255,0)",
      "box-shadow:" + defaultShadow,
      "cursor:pointer",
      "pointer-events:auto",
      "z-index:80"
    ].join(";");

    btn.addEventListener("mouseenter", () => {
      if (nativeHintsVisible) {
        btn.style.boxShadow = ghost
          ? "0 0 0 2px rgba(255,255,255,.10)"
          : "0 0 0 3px rgba(255,210,95,.95), 0 0 18px rgba(255,210,95,.50)";
      } else {
        // Neutral hover only. Do not reveal whether this jack is a valid target.
        btn.style.boxShadow = "0 0 0 2px rgba(255,255,255,.16)";
      }
    });

    btn.addEventListener("mouseleave", () => {
      if (!selectedNode || selectedNode.el !== btn) {
        if (nativeHintsVisible) {
          updateNativeHintHighlights();
        } else {
          btn.style.boxShadow = defaultShadow;
        }
      }
    });

    btn.addEventListener("pointerdown", event => {
      console.log("[Signal Flow] Native jack drag start:", key);
      startNativePatchDrag(layer, {
        key,
        el: btn,
        defaultShadow,
        point
      }, event);
    }, true);

    btn.addEventListener("click", event => {
      if (Date.now() < suppressNativeClickUntil) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      console.log("[Signal Flow] Native jack clicked:", key);
      handleNodeClick(layer, {
        key,
        el: btn,
        defaultShadow,
        point
      });
    });

    layer.appendChild(btn);
  }

  function createNativeOverlayLabel(layer, text, x, y, options) {
    const opts = options || {};
    const label = document.createElement("div");

    label.textContent = text;
    label.className = "sf-native-overlay-label";
    label.style.cssText = [
      "position:absolute",
      "left:" + x + "px",
      "top:" + y + "px",
      "transform:translate(-50%,-50%)",
      "min-width:" + (opts.width || 64) + "px",
      "padding:1px 4px",
      "border-radius:4px",
      "background:transparent",
      "border:0",
      "box-shadow:none",
      "color:" + (opts.color || "#f4f1dc"),
      "font-size:" + (opts.size || 7) + "px",
      "font-weight:800",
      "letter-spacing:.06em",
      "line-height:1.05",
      "text-align:center",
      "text-transform:uppercase",
      "pointer-events:none",
      "z-index:" + (opts.zIndex || 999)
    ].join(";");

    layer.appendChild(label);
    return label;
  }

  function createNativePrewireIcons(layer, adapter, level) {
    // Passive grey normalled/prewired cables:
    // Draw these already-cropped so they cannot cover the Sources / Keys DI labels.
    // Visual-only; not interactive route logic.
    let svg = layer.querySelector(".sf-native-normalled-cables-svg");

    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.classList.add("sf-native-normalled-cables-svg");
      svg.setAttribute("aria-hidden", "true");
      svg.style.cssText = [
        "position:absolute",
        "inset:0",
        "width:100%",
        "height:100%",
        "overflow:visible",
        "pointer-events:none",
        "z-index:235"
      ].join(";");
      layer.appendChild(svg);
    }

    svg.innerHTML = "";

    function safePoint(panelJackId, fallback) {
      try {
        const pt = pointFromPanel(adapter, level, panelJackId);
        if (pt && Number.isFinite(pt.x) && Number.isFinite(pt.y)) return pt;
      } catch (err) {}
      return fallback;
    }

    const foh = level.panels.find(p => p.id === "foh");
    if (!foh) return;

    const fohFallbackX = [0.085, 0.135, 0.185, 0.235, 0.375, 0.425, 0.475, 0.525];

    for (let i = 1; i <= 8; i++) {
      const to = safePoint("foh.input" + i, {
        x: foh.x + foh.width * fohFallbackX[i - 1],
        y: foh.y + 72
      });

      // HARD CROP: start the visible cable just left of the FOH console input bank.
      // This intentionally removes the stagebox-side span that was covering source labels.
      const sx = foh.x - 14;
      const sy = foh.y + 118 + (i - 4.5) * 3.2;
      const tx = to.x;
      const ty = to.y;

      const c1x = sx + (tx - sx) * 0.22;
      const c1y = sy - 18 - i * 0.7;
      const c2x = sx + (tx - sx) * 0.72;
      const c2y = ty + 20 + i * 0.7;

      const d = [
        "M", sx, sy,
        "C", c1x, c1y, c2x, c2y, tx, ty
      ].join(" ");

      const shadow = document.createElementNS("http://www.w3.org/2000/svg", "path");
      shadow.setAttribute("d", d);
      shadow.setAttribute("fill", "none");
      shadow.setAttribute("stroke", "rgba(10,11,11,.45)");
      shadow.setAttribute("stroke-width", "4.8");
      shadow.setAttribute("stroke-linecap", "round");
      shadow.setAttribute("opacity", ".38");
      shadow.classList.add("sf-native-normalled-cable-shadow");
      svg.appendChild(shadow);

      const cable = document.createElementNS("http://www.w3.org/2000/svg", "path");
      cable.setAttribute("d", d);
      cable.setAttribute("fill", "none");
      cable.setAttribute("stroke", "rgba(135,140,136,.52)");
      cable.setAttribute("stroke-width", "2.8");
      cable.setAttribute("stroke-linecap", "round");
      cable.setAttribute("opacity", ".58");
      cable.classList.add("sf-native-normalled-cable");
      cable.style.filter = "drop-shadow(0 1px 1px rgba(0,0,0,.24))";
      svg.appendChild(cable);
    }
  }

  function createNativeAssetLabel(layer, src, x, y, options) {
    const opts = options || {};
    const img = document.createElement("img");

    img.className = "sf-native-asset-label";
    img.src = src;
    img.alt = "";
    img.setAttribute("aria-hidden", "true");

    img.style.cssText = [
      "position:absolute",
      "left:" + x + "px",
      "top:" + y + "px",
      "width:" + (opts.width || 74) + "px",
      "height:" + (opts.height || 24) + "px",
      "object-fit:contain",
      "transform:translate(-50%,-50%) rotate(" + (opts.rotate || "0deg") + ")",
      "opacity:" + (opts.opacity || ".96"),
      "pointer-events:none",
      "z-index:" + (opts.zIndex || 1000)
    ].join(";");

    layer.appendChild(img);
    return img;
  }

  function installLiv028LayerStackCss(targetLayer) {
    if (LEVEL_ID !== "LIV-028") return;

    const doc = targetLayer && targetLayer.ownerDocument ? targetLayer.ownerDocument : document;
    if (!doc || !doc.head) return;

    let style = doc.getElementById("sf-liv028-layer-stack-style");
    if (!style) {
      style = doc.createElement("style");
      style.id = "sf-liv028-layer-stack-style";
      doc.head.appendChild(style);
    }

    style.textContent = [
      ".sf-live-native-layer img { z-index: 700 !important; pointer-events: none !important; }",
      ".sf-live-native-layer .sf-native-liv028-stagebox-asset { z-index: 700 !important; pointer-events: none !important; }",
      ".sf-live-native-layer svg, .sf-live-native-layer svg.sf-native-cables { position: absolute !important; z-index: 3500 !important; pointer-events: none !important; overflow: visible !important; }",
      ".sf-live-native-layer .sf-native-node.sf-native-jack { z-index: 4600 !important; pointer-events: auto !important; }",
      ".sf-live-native-layer .sf-native-node.sf-native-source { z-index: 5000 !important; pointer-events: auto !important; }",
      ".sf-live-native-layer .sf-native-liv028-talkback-source { z-index: 6000 !important; pointer-events: auto !important; }"
    ].join("\n");
  }

  function syncLiv028JackHitboxesToVisibleHardware(layer) {
    if (LEVEL_ID !== "LIV-028") return;

    const targetLayer = layer || document.querySelector(".sf-live-native-layer");
    if (!targetLayer) return;

    const layerRect = targetLayer.getBoundingClientRect();
    installLiv028LayerStackCss(targetLayer);
    const debug = true;

    const stageAsset = targetLayer.querySelector(".sf-native-liv028-stagebox-asset") ||
      Array.from(targetLayer.querySelectorAll("img")).find(img =>
        String(img.getAttribute("src") || "").includes("stagebox-snake-head-16x2")
      );

    const iemAsset = Array.from(targetLayer.querySelectorAll("img")).find(img => {
      const src = String(img.getAttribute("src") || "").toLowerCase();
      const cls = String(img.className || "").toLowerCase();
      return src.includes("iem-wireless-rack-front") ||
        src.includes("in-ear") ||
        src.includes("iem") ||
        cls.includes("iem") ||
        cls.includes("in-ear");
    });

    const fohAsset = Array.from(targetLayer.querySelectorAll("img")).find(img =>
      String(img.getAttribute("src") || "").includes("foh-console-io-panel")
    );

    function styleHitbox(key, x, y, size) {
      const nodes = Array.from(targetLayer.querySelectorAll("[data-node-key='" + key + "']"));

      nodes.forEach(el => {
        el.style.position = "absolute";
        el.style.left = x + "px";
        el.style.top = y + "px";
        el.style.width = (size || 30) + "px";
        el.style.height = (size || 30) + "px";
        el.style.transform = "translate(-50%,-50%)";
        el.style.pointerEvents = "auto";
        el.style.zIndex = "2600";
        el.style.opacity = debug ? "0.55" : "0.01";
        el.style.background = debug ? "rgba(255,0,255,.28)" : "transparent";
        el.style.outline = debug ? "2px solid rgba(255,0,255,.95)" : "none";
        el.style.borderRadius = "50%";
        el.style.boxSizing = "border-box";
      });

      return nodes.length;
    }

    let stageboxCount = 0;

    if (stageAsset) {
      const r = stageAsset.getBoundingClientRect();
      const ox = r.left - layerRect.left;
      const oy = r.top - layerRect.top;

      const xs = [92, 168, 244, 320, 396, 472, 548, 624];

      xs.forEach((svgX, i) => {
        stageboxCount += styleHitbox(
          "stagebox-input-" + (i + 1),
          ox + r.width * (svgX / 980),
          oy + r.height * (125 / 360),
          32
        );
      });

      xs.forEach((svgX, i) => {
        stageboxCount += styleHitbox(
          "stagebox-input-" + (i + 9),
          ox + r.width * (svgX / 980),
          oy + r.height * (250 / 360),
          32
        );
      });

      stageAsset.style.zIndex = "700";
      stageAsset.style.pointerEvents = "none";
    }

    let iemCount = 0;

    if (iemAsset) {
      const r = iemAsset.getBoundingClientRect();
      const ox = r.left - layerRect.left;
      const oy = r.top - layerRect.top;

      iemAsset.style.zIndex = "700";
      iemAsset.style.pointerEvents = "none";

      iemCount += styleHitbox(
        "in-ear-b-in",
        ox + r.width * 0.215,
        oy + r.height * 0.42,
        34
      );
    }

    let fohCount = 0;

    if (fohAsset) {
      const r = fohAsset.getBoundingClientRect();
      const ox = r.left - layerRect.left;
      const oy = r.top - layerRect.top;

      fohAsset.style.zIndex = "700";
      fohAsset.style.pointerEvents = "none";

      fohCount += styleHitbox(
        "talkback-output",
        ox + r.width * 0.765,
        oy + r.height * 0.575,
        34
      );
    }

    console.log("[Signal Flow] LIV-028 real hitboxes synced from Talkback helper", {
      stageAsset: !!stageAsset,
      iemAsset: !!iemAsset,
      fohAsset: !!fohAsset,
      stageboxCount,
      iemCount,
      fohCount
    });
  }

  function forceLiv028TalkbackSourceFinal(layer, level) {
    if (LEVEL_ID !== "LIV-028") return;

    const targetLayer = layer || document.querySelector(".sf-live-native-layer");
    if (!targetLayer) {
      console.log("[Signal Flow] LIV-028 talkback final helper: no layer");
      return;
    }

    const layerRect = targetLayer.getBoundingClientRect();

    const candidates = Array.from(targetLayer.querySelectorAll("button, div, [role='button']")).filter(el => {
      const txt = (el.textContent || "").trim().toLowerCase();
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);

      return (
        txt.includes("keys right di") &&
        r.width > 70 &&
        r.height > 18 &&
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        Number(style.opacity || 1) > 0.05
      );
    });

    let sourceX = 150;
    let sourceY = 230;

    if (candidates.length) {
      const kr = candidates[0].getBoundingClientRect();
      sourceX = kr.left - layerRect.left + kr.width / 2;
      sourceY = kr.top - layerRect.top + kr.height / 2 + 48;
    }

    sourceX = Math.max(90, Math.min(sourceX, layerRect.width - 90));
    sourceY = Math.max(80, Math.min(sourceY, layerRect.height - 80));

    Array.from(targetLayer.querySelectorAll(".sf-native-liv028-talkback-source, [data-node-key='talkback-mic']")).forEach(el => {
      el.remove();
    });

    const talkback = document.createElement("button");
    talkback.type = "button";
    talkback.className = "sf-native-source-node sf-native-liv028-talkback-source";
    talkback.setAttribute("data-node-key", "talkback-mic");
    talkback.setAttribute("data-key", "talkback-mic");
    talkback.setAttribute("data-node-kind", "source");
    talkback.textContent = "Talkback Mic";

    talkback.style.cssText = [
      "position:absolute",
      "left:" + sourceX + "px",
      "top:" + sourceY + "px",
      "width:154px",
      "height:38px",
      "transform:translate(-50%,-50%)",
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "text-align:center",
      "box-sizing:border-box",
      "border-radius:10px",
      "border:1px solid rgba(119,185,255,.42)",
      "background:linear-gradient(180deg, rgba(28,70,116,.98), rgba(10,30,55,.98))",
      "box-shadow:inset 0 1px 0 rgba(255,255,255,.12), 0 3px 10px rgba(0,0,0,.35)",
      "color:#f6f2dc",
      "font-size:10.5px",
      "font-weight:900",
      "letter-spacing:.04em",
      "text-transform:uppercase",
      "cursor:grab",
      "pointer-events:auto",
      "z-index:5000"
    ].join(";");

    talkback.addEventListener("pointerdown", event => {
      event.preventDefault();
      event.stopPropagation();
      handleNodeClick("talkback-mic");
    });

    targetLayer.appendChild(talkback);
    syncLiv028JackHitboxesToVisibleHardware(targetLayer);

    console.log("[Signal Flow] LIV-028 talkback final helper ran", {
      candidates: candidates.length,
      sourceX,
      sourceY
    });
  }









  function createLiv028TalkbackUnderSources(layer, adapter, level) {
    if (LEVEL_ID !== "LIV-028") return;

    const layout = LIV_028_LAYOUT.sources;
    const sourceX = level.rect.width * layout.x;
    const firstY = level.rect.height * layout.firstY;

    const sourceLayout = [
      { key: "lead-vocal-mic", y: firstY },
      { key: "keys-left-di", y: firstY + layout.gap },
      { key: "keys-right-di", y: firstY + layout.gap * 2 },
      { key: "talkback-mic", y: firstY + layout.gap * 3 }
    ];

    Array.from(layer.querySelectorAll("[data-node-key='talkback-mic']")).forEach(el => {
      el.remove();
    });

    const talkback = document.createElement("button");
    talkback.type = "button";
    talkback.className = "sf-native-source-node sf-native-liv028-talkback-source";
    talkback.setAttribute("data-node-key", "talkback-mic");
    talkback.setAttribute("data-key", "talkback-mic");
    talkback.setAttribute("data-node-kind", "source");
    talkback.textContent = "Talkback Mic";

    talkback.addEventListener("pointerdown", event => {
      event.preventDefault();
      event.stopPropagation();
      handleNodeClick("talkback-mic");
    });

    layer.appendChild(talkback);

    sourceLayout.forEach(item => {
      Array.from(layer.querySelectorAll("[data-node-key='" + item.key + "']")).forEach(el => {
        el.style.left = sourceX + "px";
        el.style.top = item.y + "px";
        el.style.width = layout.width + "px";
        el.style.height = layout.height + "px";
        el.style.transform = "translate(-50%,-50%)";
        el.style.zIndex = item.key === "talkback-mic" ? "1100" : "900";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.textAlign = "center";
        el.style.boxSizing = "border-box";
      });
    });

    talkback.style.borderRadius = "10px";
    talkback.style.border = "1px solid rgba(119,185,255,.42)";
    talkback.style.background = "linear-gradient(180deg, rgba(28,70,116,.98), rgba(10,30,55,.98))";
    talkback.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,.12), 0 3px 10px rgba(0,0,0,.35)";
    talkback.style.color = "#f6f2dc";
    talkback.style.fontSize = "10.5px";
    talkback.style.fontWeight = "900";
    talkback.style.letterSpacing = ".04em";
    talkback.style.textTransform = "uppercase";
    talkback.style.cursor = "grab";
  }









  function createNativeStagebox16Overlay(layer, level) {
    if (LEVEL_ID !== "LIV-028") return;

    const stage = level.panels && level.panels.find && level.panels.find(p => p.id === "stagebox");
    if (!stage) return;

    for (let n = 1; n <= 16; n++) {
      Array.from(layer.querySelectorAll("[data-node-key='stagebox-input-" + n + "']")).forEach(el => {
        el.style.opacity = "0.01";
        el.style.pointerEvents = "auto";
        el.style.zIndex = "780";
      });
    }

    const old = layer.querySelector(".sf-native-liv028-stagebox-asset");
    if (old) old.remove();

    const assetHeight = stage.width * 360 / 980;

    const img = document.createElement("img");
    img.className = "sf-native-liv028-stagebox-asset";
    img.src = "/assets/live-sound/svg/hardware/stagebox-snake-head-16x2-aes.svg";
    img.alt = "";
    img.setAttribute("aria-hidden", "true");

    img.style.cssText = [
      "position:absolute",
      "left:" + stage.x + "px",
      "top:" + stage.y + "px",
      "width:" + stage.width + "px",
      "height:" + assetHeight + "px",
      "object-fit:contain",
      "pointer-events:none",
      "z-index:720",
      "filter:drop-shadow(0 8px 16px rgba(0,0,0,.48))"
    ].join(";");

    layer.appendChild(img);
  }

  function createNativeBoardTerminologyOverlays(layer, adapter, level) {
    function mask(x, y, w, h) {
      const el = document.createElement("div");
      el.className = "sf-native-overlay-mask";
      el.style.cssText = [
        "position:absolute",
        "left:" + x + "px",
        "top:" + y + "px",
        "width:" + w + "px",
        "height:" + h + "px",
        "transform:translate(-50%,-50%)",
        "border-radius:4px",
        "background:rgba(50,52,50,.98)",
        "box-shadow:none",
        "pointer-events:none",
        "z-index:990"
      ].join(";");
      layer.appendChild(el);
    }

    function plaque(text, x, y, w) {
      createNativeOverlayLabel(layer, text, x, y, { width: w || 80, size: 7, color: "#f4f1dc" });
    }

    if (!["LIV-003", "LIV-006", "LIV-028"].includes(LEVEL_ID)) createNativePrewireIcons(layer, adapter, level);

    if (LEVEL_ID === "LIV-025") {
      const aux = pointFromPanel(adapter, level, "foh.lineOut2");
      const sub = pointFromPanel(adapter, level, "amp.link");

      // Only relabel the section. Do not cover the jack numbers.
      mask(aux.x + 4, aux.y - 48, 112, 16);
      plaque("AUX OUTS", aux.x + 4, aux.y - 48, 92);

      mask(sub.x, sub.y - 29, 86, 16);
      plaque("SUB INPUT", sub.x, sub.y - 29, 78);
    }

    if (LEVEL_ID === "LIV-026") {
      const aux = pointFromPanel(adapter, level, "foh.lineOut3");
      const delay = pointFromPanel(adapter, level, "amp.link");

      // Only relabel the section. Do not cover the jack numbers.
      mask(aux.x + 2, aux.y - 48, 112, 16);
      plaque("AUX OUTS", aux.x + 2, aux.y - 48, 92);

      mask(delay.x, delay.y - 35, 86, 16);
      createNativeAssetLabel(layer, "/assets/live-sound/svg/cable-wrap/delay-cable-wrap-label.svg", delay.x, delay.y - 35, { width: 76, height: 24 });
    }

    if (LEVEL_ID === "LIV-028") {
      createNativeStagebox16Overlay(layer, level);

      const talkbackOut = pointFromPanel(adapter, level, "foh.lineOut4");

      createNativeAssetLabel(
        layer,
        "/assets/live-sound/svg/cable-wrap/tb-cable-wrap-label.svg",
        talkbackOut.x,
        talkbackOut.y + 28,
        { width: 64, height: 20, rotate: "-2deg", opacity: ".96" }
      );
    }
  }

  function renderNative(surface, adapter) {
    const level = buildLevelGeometry(surface);

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());

    const layer = document.createElement("div");
    layer.className = "sf-live-native-layer";
    layer.classList.add("sf-live-native-level-" + LEVEL_ID.toLowerCase());
    layer.style.cssText = [
      "position:absolute",
      "inset:0",
      "z-index:9990",
      "isolation:isolate",
      "pointer-events:none",
      "overflow:hidden",
      "border-radius:16px",
      "background:radial-gradient(circle at top, rgba(18,36,28,.32), rgba(0,0,0,0) 62%)"
    ].join(";");

    const panelKinds = new Set(level.panels.map(panel => panel.kind));

    const configuredSourceOrder = LEVEL.sourceOrder || [
      "lead-vocal-mic",
      "keys-left-di",
      "keys-right-di",
      "talkback-mic"
    ];

    createLabel(layer, (LEVEL.title || "Live Patch").toUpperCase() + " - NATIVE CONCEPT MODE", 18, 14, 12);
    if (configuredSourceOrder.length > 0) {
      createLabel(layer, "SOURCES", level.rect.width * 0.06, level.rect.height * 0.08, 12);
    }
    if (panelKinds.has("stagebox")) {
      createLabel(layer, "STAGE BOX INPUTS", level.rect.width * 0.07, (LEVEL_ID === "LIV-028" ? level.rect.height * 0.31 + 86 : level.rect.height * 0.31), 11);
    }
    if (panelKinds.has("foh") && !["LIV-003", "LIV-006"].includes(LEVEL_ID)) {
      createLabel(layer, "FOH CONSOLE", level.rect.width * 0.40, level.rect.height * 0.10, 11);
    }
    if (panelKinds.has("amp")) {
      createLabel(layer, LEVEL.processorLabel || "SYSTEM PROCESSOR / SUB", (LEVEL_ID === "LIV-028" ? level.rect.width * 0.51 : level.rect.width * 0.46), (LEVEL_ID === "LIV-028" ? level.rect.height * 0.55 : level.rect.height * 0.47), 11);
    }
    if (panelKinds.has("monitor")) {
      createLabel(layer, LEVEL.processorLabel || "VOCAL WEDGE", level.rect.width * 0.52, level.rect.height * 0.51, 11);
    }

    level.panels.forEach(panel => {
      const img = document.createElement("img");
      img.src = hardwareAssetFor(panel.kind);
      img.alt = panel.kind;
      img.style.cssText = [
        "position:absolute",
        "left:" + panel.x + "px",
        "top:" + panel.y + "px",
        "width:" + panel.width + "px",
        "height:auto",
        "pointer-events:none",
        "user-select:none",
        "filter:drop-shadow(0 12px 24px rgba(0,0,0,.7))",
        "z-index:10"
      ].join(";");
      layer.appendChild(img);
    });

    const activeEndpointKeys = new Set();
    LEVEL.validRoutes.forEach(route => {
      activeEndpointKeys.add(route.from);
      activeEndpointKeys.add(route.to);
    });

    const sourceOrder = configuredSourceOrder;

    sourceOrder
      .filter(key => activeEndpointKeys.has(key))
      .filter(key => NODE_DEFS[key] && NODE_DEFS[key].kind === "source")
      .forEach((key, index) => {
        const def = NODE_DEFS[key];
        createSourceNode(
          layer,
          key,
          def.label,
          level.rect.width * 0.06,
          level.rect.height * (0.12 + index * 0.06)
        );
      });

    const renderedPanelJacks = new Set();

    Object.keys(NODE_DEFS)
      .filter(key => NODE_DEFS[key].kind === "jack")
      .filter(key => !LEVEL.generatedJackKeys || LEVEL.generatedJackKeys.includes(key))
      .sort((a, b) => {
        const aa = activeEndpointKeys.has(a) ? 1 : 0;
        const bb = activeEndpointKeys.has(b) ? 1 : 0;
        return bb - aa;
      })
      .forEach(key => {
        const def = NODE_DEFS[key];
        const panelJack = def.panelJack || key;

        if (renderedPanelJacks.has(panelJack)) return;
        renderedPanelJacks.add(panelJack);

        const point = getNodePoint(adapter, level, key);
        const activeEndpoint = activeEndpointKeys.has(key);
        createJackNode(layer, key, point, def.label, !activeEndpoint);
      });

    surface.appendChild(layer);
    createNativeBoardTerminologyOverlays(layer, adapter, level);
    createLiv028TalkbackUnderSources(layer, adapter, level);
    redrawCables(layer);
    installCableDrag(layer);
  }

  function raiseHintOverlays() {
    // Native LIV-025 layer sits high in the board. Keep hint UI visible above it.
    Array.from(document.querySelectorAll("div, section, article, aside, dialog"))
      .forEach(el => {
        if (!el || !el.isConnected) return;
        if (el.closest(".sf-live-native-layer")) return;

        const text = normalize(textOf(el));
        const cls = String(el.className || "").toLowerCase();

        const looksLikeHint =
          cls.includes("hint") ||
          text.includes("hint") ||
          text.includes("show hints") ||
          text.includes("hide hints");

        if (!looksLikeHint) return;

        const r = el.getBoundingClientRect();

        // Avoid restyling the whole app shell/body.
        if (r.width > window.innerWidth * 0.95 && r.height > window.innerHeight * 0.75) return;

        el.style.position = getComputedStyle(el).position === "static" ? "relative" : el.style.position;
        el.style.zIndex = "12000";
      });
  }

  function hidePanelToggleControls() {
    // LIV-025 native recovery: front/back equipment images are not ready yet.
    // Hide the panel toggle for now so players stay on the stable native board.
    Array.from(document.querySelectorAll("button, [role='button']")).forEach(button => {
      const label = normalize([
        textOf(button),
        button.getAttribute && button.getAttribute("aria-label"),
        button.getAttribute && button.getAttribute("title")
      ].filter(Boolean).join(" "));

      if (
        label.includes("inspect") ||
        label.includes("back panel") ||
        label.includes("front panel") ||
        label === "front" ||
        label === "back"
      ) {
        button.dataset.sfLivePanelToggleHidden = "true";
        button.style.display = "none";
        button.setAttribute("aria-hidden", "true");
        if ("tabIndex" in button) button.tabIndex = -1;
      }
    });
  }

  function mountNative(force) {
    const adapter = window.SF_LIVE_SOUND_ADAPTER;
    if (!adapter) {
      console.warn("[Signal Flow] Native renderer missing adapter.");
      return;
    }

    if (!syncActiveLevelSpec() || !nativeVisible) return;

    const surface = findSurface();
    if (!surface) {
      console.warn("[Signal Flow] Native renderer could not find live board surface.");
      return;
    }

    if (!force && surface.querySelector(".sf-live-native-layer")) {
      return;
    }

    if (getComputedStyle(surface).position === "static") {
      surface.style.position = "relative";
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);
    hidePanelToggleControls();
    raiseHintOverlays();
    updateNativeHintHighlights();

    console.log("[Signal Flow] " + LEVEL_ID + " native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    resetNativeLevelComplete();
    state.routes = [];
    state.completedValidKeys.clear();
    clearSelection();

    LEVEL.validRoutes.forEach(route => unmarkChecklist(route.key));
    updateNativeScore();

    const layer = document.querySelector(".sf-live-native-layer");
    if (layer) redrawCables(layer);
  }

  function undoNative() {
    const route = state.routes.pop();
    if (!route) return;

    if (route.valid) {
      state.completedValidKeys.delete(route.key);
      unmarkChecklist(route.key);
    }

    clearSelection();

    const layer = document.querySelector(".sf-live-native-layer");
    if (layer) redrawCables(layer);
  }

  function clickLabelFromEvent(event) {
    const parts = [];
    let el = event.target;

    for (let i = 0; i < 6 && el; i++) {
      if (el.nodeType === 1) {
        const label = textOf(el);
        const aria = el.getAttribute && el.getAttribute("aria-label");
        const title = el.getAttribute && el.getAttribute("title");
        if (label) parts.push(label);
        if (aria) parts.push(aria);
        if (title) parts.push(title);
      }
      el = el.parentElement;
    }

    return parts.join(" ").toLowerCase();
  }

  function wireBoardButtons() {
    // Header controls are handled by the document-level capture listener above.
    // Keep this function as a lightweight compatibility hook for the mutation observer.
  }

  function boot() {
    setTimeout(wireBoardButtons, 120);
    setTimeout(() => mountNative(false), 350);
    setTimeout(wireBoardButtons, 650);
    setTimeout(() => mountNative(false), 900);
    setTimeout(() => mountNative(false), 1600);
      setTimeout(() => forceLiv028TalkbackSourceFinal(document.querySelector(".sf-live-native-layer")), 1150);
    setTimeout(() => forceLiv028TalkbackSourceFinal(document.querySelector(".sf-live-native-layer")), 1700);
    setTimeout(() => forceLiv028TalkbackSourceFinal(document.querySelector(".sf-live-native-layer")), 2400);
}

  window.addEventListener("hashchange", () => {
    clearNative();
    nativeVisible = true;
    boot();
  });

  window.addEventListener("load", boot);

  function buttonLabelFromEvent(event) {
    const button = event.target && event.target.closest && event.target.closest("button, [role='button']");

    // Critical: do not infer header controls from broad board/background text.
    // Empty board clicks can bubble from the legacy/native playfield and include
    // unrelated words like Clear in ancestor text, which caused accidental level clear.
    if (!button) return "";

    return normalize([
      textOf(button),
      button.getAttribute && button.getAttribute("aria-label"),
      button.getAttribute && button.getAttribute("title")
    ].filter(Boolean).join(" "));
  }

  document.addEventListener("click", event => {
    // Never interpret native board/source/jack/cable clicks as header controls.
    if (event.target && event.target.closest && event.target.closest(".sf-live-native-layer")) {
      return;
    }

    const label = buttonLabelFromEvent(event);

    if (label.includes("clear")) {
      console.log("[Signal Flow] Native clear intercepted.");
      event.preventDefault();
      event.stopImmediatePropagation();
      clearNative();
      setTimeout(() => mountNative(true), 250);
      return;
    }

    if (label.includes("undo")) {
      console.log("[Signal Flow] Native undo intercepted.");
      event.preventDefault();
      event.stopImmediatePropagation();
      undoNative();
      return;
    }

    if (label.includes("show hints") || label === "hints") {
      // Let the original game handle its hint toggle, then reveal native jack hints.
      setTimeout(() => setNativeHintsVisible(true), 80);
      setTimeout(() => setNativeHintsVisible(true), 250);
      setTimeout(() => setNativeHintsVisible(true), 600);
      return;
    }

    if (label.includes("hide hints")) {
      setTimeout(() => setNativeHintsVisible(false), 80);
      setTimeout(() => setNativeHintsVisible(false), 250);
      return;
    }

    if (label.includes("back panel")) {
      console.log("[Signal Flow] Native panel toggle intercepted from front.");
      nativeVisible = false;
      // Allow the original game button to perform the actual panel swap.
      setTimeout(unmountNative, 80);
      return;
    }

    if (label.includes("front panel") || label === "front") {
      console.log("[Signal Flow] Native panel toggle intercepted from back.");
      nativeVisible = true;
      // Allow the original game button to perform the actual panel swap, then
      // remount only after the front-panel button state is visible again.
      setTimeout(() => restoreNativeFrontPanel(0), 80);
      return;
    }
  }, true);


  const observer = new MutationObserver(() => {
    if (!syncActiveLevelSpec()) return;

    hidePanelToggleControls();

    const hasFrontPanelButton = Array.from(document.querySelectorAll("button, [role='button']"))
      .some(button => {
        const label = normalize(textOf(button));
        return label.includes("front panel") || label === "front";
      });

    const hasBackPanelButton = Array.from(document.querySelectorAll("button, [role='button']"))
      .some(button => normalize(textOf(button)).includes("back panel"));

    if (!nativeVisible && hasBackPanelButton && !hasFrontPanelButton) {
      // The legacy front has returned after a panel swap.
      nativeVisible = true;
    }

    if (!nativeVisible || document.querySelector(".sf-live-native-layer")) return;

    clearTimeout(observer._sfTimer);
    observer._sfTimer = setTimeout(() => {
      mountNative(false);
    }, 180);
  });


  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  boot();
})();
