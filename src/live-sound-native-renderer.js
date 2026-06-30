/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Front fill zone feed
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

  const SF_REPO_ROOT = new URL("../", document.currentScript?.src || document.baseURI);

  function sfRepoUrl(path) {
    return new URL(String(path || "").replace(/^\/+/, ""), SF_REPO_ROOT).href;
  }

  function sfNormalizeLevelId(value) {
    const match = String(value || "").toUpperCase().match(/\b([A-Z]{3})[-_ ]?(\d{1,3})\b/);
    if (!match) return "";
    return match[1] + "-" + String(Number(match[2])).padStart(3, "0");
  }


  function sfBroadcastWrapperBoardSync(levelId) {
    // Exterior wrapper controls are dev-only and should not be a gameplay source of truth.
    return;
  }

  function sfCurrentWrapperBoardId() {
    const values = [];

    document.querySelectorAll("select, input, [data-board], [data-level-id]").forEach(el => {
      if (el.value) values.push(el.value);
      if (el.dataset) {
        if (el.dataset.board) values.push(el.dataset.board);
        if (el.dataset.levelId) values.push(el.dataset.levelId);
      }
      values.push(el.textContent || "");
    });

    const bodyTitle = (document.body && document.body.innerText || "").match(/\bLIV-\d{3}\b/);
    if (bodyTitle) values.push(bodyTitle[0]);

    for (const value of values) {
      const id = sfNormalizeLevelId(value);
      if (id) return id;
    }

    return "";
  }

  function sfNextSequentialLevelId(levelId) {
    const match = String(levelId || "").toUpperCase().match(/^([A-Z]{3})-(\d{3})$/);
    if (!match) return "";
    return match[1] + "-" + String(Number(match[2]) + 1).padStart(3, "0");
  }

  function sfElementIsVisible(el) {
    if (!el || !el.getBoundingClientRect) return false;
    const r = el.getBoundingClientRect();
    return r.width > 4 && r.height > 4 && r.bottom > 0 && r.right > 0;
  }

  function sfIsInsideNativeOrPopup(el) {
    return !!(el && el.closest && el.closest(
      ".sf-live-native-layer, .patchbay-wrap, .sf-native-completion, .sf-native-completion-popup, .native-completion, .completion-popup, .modal, .popup, [class*='completion'], [class*='complete']"
    ));
  }

  function sfFindBestLevelSelect(targetId) {
    const candidates = [];

    document.querySelectorAll("select").forEach(select => {
      const option = Array.from(select.options || []).find(opt => {
        return sfNormalizeLevelId(opt.value) === targetId || sfNormalizeLevelId(opt.textContent) === targetId;
      });

      if (!option) return;

      let score = 0;
      if (sfElementIsVisible(select)) score += 20;
      if (!sfIsInsideNativeOrPopup(select)) score += 20;
      if ((select.options || []).length > 10) score += 10;

      const nearbyText = [
        select.id,
        select.name,
        select.getAttribute("aria-label"),
        select.closest("form, section, aside, div") && select.closest("form, section, aside, div").textContent
      ].join(" ");

      if (/board|level|load|select|liv/i.test(nearbyText)) score += 10;

      candidates.push({ select, option, score });
    });

    candidates.sort((a, b) => b.score - a.score);
    return candidates[0] || null;
  }

  function sfFindLoadButtonNear(select) {
    const roots = [];

    let node = select;
    for (let i = 0; i < 6 && node; i += 1) {
      roots.push(node);
      node = node.parentElement;
    }

    roots.push(document);

    for (const root of roots) {
      const buttons = Array.from(root.querySelectorAll ? root.querySelectorAll("button, [role='button'], input[type='button'], input[type='submit']") : []);

      const match = buttons.find(btn => {
        const text = (btn.textContent || btn.value || btn.getAttribute("aria-label") || "").trim();
        if (!/^load board$/i.test(text) && !/^load$/i.test(text)) return false;
        if (!sfElementIsVisible(btn)) return false;
        if (sfIsInsideNativeOrPopup(btn)) return false;
        return true;
      });

      if (match) return match;
    }

    return null;
  }

  function sfForceWrapperUrlLevel(targetId) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("level", targetId);
      url.searchParams.set("board", targetId);
      url.hash = "#" + targetId;
      console.log("[Signal Flow] Completion Next fallback URL load:", url.href);
      window.location.href = url.href;
      return true;
    } catch (err) {
      console.warn("[Signal Flow] wrapper URL fallback failed", err);
      return false;
    }
  }


  function sfSyncWrapperBoardControls(levelId) {
    const targetId = sfNormalizeLevelId(levelId);
    if (!targetId) return;

    document.querySelectorAll("select").forEach(select => {
      const option = Array.from(select.options || []).find(opt => {
        return sfNormalizeLevelId(opt.value) === targetId || sfNormalizeLevelId(opt.textContent) === targetId;
      });

      if (option) {
        select.value = option.value;
        option.selected = true;
        select.dispatchEvent(new Event("input", { bubbles: true }));
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    document.querySelectorAll("input").forEach(input => {
      const label = [
        input.id,
        input.name,
        input.placeholder,
        input.getAttribute("aria-label"),
        input.closest("label") && input.closest("label").textContent
      ].join(" ");

      if (/board|level|go to/i.test(label) || /\bLIV-\d{3}\b/i.test(input.value || "")) {
        input.value = targetId;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  }

  function sfLoadBoardThroughWrapper(levelId) {
    const targetId = sfNormalizeLevelId(levelId);
    if (!targetId) return false;

    const candidate = sfFindBestLevelSelect(targetId);

    if (candidate && candidate.select && candidate.option) {
      const select = candidate.select;
      const option = candidate.option;

      select.value = option.value;
      option.selected = true;

      select.dispatchEvent(new Event("input", { bubbles: true }));
      select.dispatchEvent(new Event("change", { bubbles: true }));

      const loadButton = sfFindLoadButtonNear(select);

      if (loadButton) {
        console.log("[Signal Flow] Completion Next using wrapper dropdown/load button:", targetId, {
          select: select,
          optionValue: option.value,
          buttonText: loadButton.textContent || loadButton.value
        });

        setTimeout(() => {
          loadButton.click();

        }, 40);
        return true;
      }

      console.log("[Signal Flow] Completion Next changed wrapper dropdown but found no nearby Load Board button:", targetId);

      setTimeout(() => {
        select.dispatchEvent(new Event("change", { bubbles: true }));

      }, 40);
      return true;
    }

    console.warn("[Signal Flow] Completion Next could not find wrapper select for:", targetId);
    return sfForceWrapperUrlLevel(targetId);
  }

  function sfInstallCompletionNextBridge() {
    if (window.sfCompletionNextBridgeInstalled) return;
    window.sfCompletionNextBridgeInstalled = true;

    document.addEventListener("click", function(event) {
      const button = event.target && event.target.closest
        ? event.target.closest("button, [role='button'], a")
        : null;

      if (!button) return;

      const text = (button.textContent || "").trim();
      if (!/\b(next|continue|next level|continue to next)\b/i.test(text)) return;

      const inCompletionUi = button.closest(
        ".sf-native-completion, .sf-native-completion-popup, .native-completion, .completion-popup, .modal, .popup, [class*='completion'], [class*='complete']"
      );

      if (!inCompletionUi) return;

      if (
        window.sfCentralCompletionNextInstalled ||
        (window.parent && window.parent.sfCentralCompletionNextInstalled) ||
        (window.top && window.top.sfCentralCompletionNextInstalled)
      ) {
        return;
      }

      if (
        window.sfNativeGameShellOwnsNavigation ||
        window.sfCentralCompletionNextInstalled ||
        (window.parent && (window.parent.sfNativeGameShellOwnsNavigation || window.parent.sfCentralCompletionNextInstalled)) ||
        (window.top && (window.top.sfNativeGameShellOwnsNavigation || window.top.sfCentralCompletionNextInstalled))
      ) {
        return;
      }

      const nativeCurrentId = sfNormalizeLevelId(
        typeof LEVEL_ID !== "undefined" && LEVEL_ID ? LEVEL_ID : ""
      );

      const currentId = nativeCurrentId || sfCurrentWrapperBoardId();
      const nextId = sfNextSequentialLevelId(currentId);

      if (!nextId) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      sfClearNativeCompletionOverlay("completion-next");
      console.log("[Signal Flow] Completion Next bridged through wrapper:", currentId, "->", nextId);
      sfLoadBoardThroughWrapper(nextId);
    }, true);
  }

  sfInstallCompletionNextBridge();





  let LEVEL_ID = "LIV-025";
  let activeNativeLevelId = null;
  let nativeLevelCompleteShown = false;
  let nativeSurfaceRetryTimer = null;
  let nativeSurfaceRetryCount = 0;
  let nativeSurfaceRetryLevelId = null;

  const LIV_028_LAYOUT = {
    sources: {
      x: 0.145,
      firstY: 0.155,
      gap: 44,
      width: 154,
      height: 38
    },
    stagebox: {
      x: 0.045,
      y: 0.535,
      width: 0.410
    },
    foh: {
      x: 0.385,
      y: 0.115,
      width: 0.555
    },
    iem: {
      x: 0.565,
      y: 0.625,
      width: 0.375
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

  const SF_NATIVE_LEDGER_STORAGE_KEY = "signal-flow-native-ledger-v1";
  try {
    window.sessionStorage && window.sessionStorage.removeItem(SF_NATIVE_LEDGER_STORAGE_KEY);
  } catch (err) {}

  function getNativeLedgerModule() {
    if (typeof window === "undefined") return null;

    if (window.SignalFlowLedger) return window.SignalFlowLedger;

    try {
      if (window.parent && window.parent !== window && window.parent.SignalFlowLedger) {
        return window.parent.SignalFlowLedger;
      }
    } catch (err) {}

    return null;
  }

  function getNativeLedgerState() {
    const Ledger = getNativeLedgerModule();
    if (!Ledger) return null;

    if (window.sfSignalFlowLedgerState) {
      return window.sfSignalFlowLedgerState;
    }

    try {
      if (window.parent && window.parent !== window && window.parent.sfSignalFlowLedgerState) {
        window.sfSignalFlowLedgerState = window.parent.sfSignalFlowLedgerState;
        return window.sfSignalFlowLedgerState;
      }
    } catch (err) {}

    window.sfSignalFlowLedgerState = Ledger.createInitialState({
      environmentId: "live-sound",
      currentLevelId: getLevelId() || activeNativeLevelId || LEVEL_ID || null
    });

    return window.sfSignalFlowLedgerState;
  }

  function saveNativeLedgerState(nextState) {
    if (!nextState) return;

    window.sfSignalFlowLedgerState = nextState;

    try {
      if (window.parent && window.parent !== window) {
        window.parent.sfSignalFlowLedgerState = nextState;
      }
    } catch (err) {}
  }

  function dispatchNativeLedger(event) {
    const Ledger = getNativeLedgerModule();
    if (!Ledger) return null;

    const currentState = getNativeLedgerState();
    const levelId = event.levelId || getLevelId() || activeNativeLevelId || LEVEL_ID;

    if (!levelId) return currentState;

    const nextState = Ledger.dispatch(
      currentState,
      Object.assign({}, event, { levelId: levelId })
    );

    saveNativeLedgerState(nextState);

    try {
      console.log("[Signal Flow] Native ledger updated:", Ledger.summarize(nextState));
    } catch (err) {}

    return nextState;
  }

  function getNativeLedgerScore() {
    const ledgerState = getNativeLedgerState();
    if (!ledgerState) return null;

    const score = Number(ledgerState.totalScore);
    return Number.isFinite(score) ? score : null;
  }



  const nativeCompletionLevelStartTotals = {};

  function getNativeLedgerCredits() {
    const ledgerState = getNativeLedgerState();
    if (!ledgerState) return { totalCredits: 0, spentCredits: 0, availableCredits: 0 };

    const totalCredits = Number.isFinite(Number(ledgerState.totalCredits)) ? Number(ledgerState.totalCredits) : 0;
    const spentCredits = Number.isFinite(Number(ledgerState.spentCredits)) ? Number(ledgerState.spentCredits) : 0;
    let availableCredits = Number.isFinite(Number(ledgerState.availableCredits)) ? Number(ledgerState.availableCredits) : NaN;

    try {
      const Ledger = getNativeLedgerModule();
      if (Ledger && typeof Ledger.getAvailableCredits === "function") {
        availableCredits = Ledger.getAvailableCredits(ledgerState);
      }
    } catch (err) {}

    if (!Number.isFinite(availableCredits)) availableCredits = Math.max(0, totalCredits - spentCredits);

    return { totalCredits, spentCredits, availableCredits };
  }

  function captureNativeCompletionStartTotals(levelId) {
    const id = String(levelId || getLevelId() || activeNativeLevelId || LEVEL_ID || "").toUpperCase();
    if (!id || nativeCompletionLevelStartTotals[id]) return;

    const credits = getNativeLedgerCredits();
    nativeCompletionLevelStartTotals[id] = {
      totalScore: Number(getNativeLedgerScore() || 0),
      totalCredits: credits.totalCredits,
      availableCredits: credits.availableCredits
    };
  }

  function nativeCompletionLedgerSummaryMarkup(levelId) {
    const id = String(levelId || getLevelId() || activeNativeLevelId || LEVEL_ID || "").toUpperCase();
    const credits = getNativeLedgerCredits();
    const totalScore = Number(getNativeLedgerScore() || 0);
    const start = nativeCompletionLevelStartTotals[id];
    const scoreDelta = start ? Math.max(0, totalScore - Number(start.totalScore || 0)) : null;
    const creditDelta = start ? Math.max(0, credits.totalCredits - Number(start.totalCredits || 0)) : null;

    return {
      scoreText: scoreDelta == null ? String(totalScore) : "+" + scoreDelta + " / " + totalScore,
      creditText: creditDelta == null ? String(credits.totalCredits) : "+" + creditDelta + " / " + credits.totalCredits,
      availableText: String(credits.availableCredits)
    };
  }

  function dispatchNativeRouteCompleted(validRoute) {
    if (!validRoute || !validRoute.key) return null;

    const groupId = validRoute.stereoGroup || validRoute.key;
    const requiredRouteIds = validRoute.stereoGroup
      ? LEVEL.validRoutes
          .filter(route => route.stereoGroup === validRoute.stereoGroup)
          .map(route => route.key)
      : [validRoute.key];

    return dispatchNativeLedger({
      type: "ROUTE_COMPLETED",
      routeId: validRoute.key,
      groupId: groupId,
      requiredRouteIds: requiredRouteIds,
      scoreValue: 100,
      creditValue: 25
    });
  }

  function dispatchNativeWrongAttempt(attemptId) {
    if (!attemptId) return null;

    return dispatchNativeLedger({
      type: "ROUTE_ATTEMPTED",
      routeId: attemptId,
      attemptId: attemptId,
      isCorrect: false,
      penaltyValue: 50
    });
  }

  const NATIVE_LAYER_TOP = 58;

  const LEVEL = {
    id: LEVEL_ID,
    title: "Front Fill Zone Feed",
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
      title: "Vocal Wedge Mix",
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
    "LIV-012": {
      id: "LIV-012",
      title: "Vocal Wedge Mix 4",
      processorLabel: "VOCAL WEDGE",
      panelKinds: ["stagebox", "foh", "monitor"],
      sourceOrder: ["lead-vocal-mic", "keys-left-di", "keys-right-di"],
      generatedJackKeys: [
        "stagebox-input-1",
        "stagebox-input-2",
        "stagebox-input-3",
        "stagebox-input-4",
        "stagebox-input-5",
        "stagebox-input-6",
        "stagebox-input-7",
        "stagebox-input-8",
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
          key: "liv012-lead-vocal-mic-to-stagebox-input-1",
          from: "lead-vocal-mic",
          to: "stagebox-input-1",
          checklist: "Lead Vocal Microphone → Stage Box Input 1"
        },
        {
          key: "liv012-foh-aux-1-output-to-vocal-wedge-input",
          from: "foh-aux-1-output",
          to: "vocal-wedge-input",
          checklist: "Front-of-House Auxiliary 1 Output → Vocal Wedge Input"
        },
        {
          key: "liv012-keys-left-di-to-stagebox-input-7",
          from: "keys-left-di",
          to: "stagebox-input-7",
          checklist: "Keys Left DI → Stage Box Input 7",
          stereoGroup: "liv012-keys-di-to-stagebox",
          stereoSide: "left"
        },
        {
          key: "liv012-keys-right-di-to-stagebox-input-8",
          from: "keys-right-di",
          to: "stagebox-input-8",
          checklist: "Keys Right DI → Stage Box Input 8",
          stereoGroup: "liv012-keys-di-to-stagebox",
          stereoSide: "right"
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
      processorLabel: "FRONT FILL DSP",
      panelKinds: ["foh", "amp"],
      sourceOrder: [],
      assetOverrides: {
        foh: "/assets/live-sound/svg/hardware/foh-console-liv006-matrix-main-outs.svg",
        amp: "/assets/live-sound/svg/hardware/power-amp-liv006-system-delay-processor.svg?v=6r259"
      },
      generatedJackKeys: [
        "foh-liv006-bus-1-output",
        "foh-liv006-bus-2-output",
        "foh-liv006-bus-3-output",
        "foh-liv006-bus-4-output",
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
          key: "foh-liv006-bus-3-output-to-liv006-delay-tower-processor-input",
          from: "foh-liv006-bus-3-output",
          to: "liv006-delay-tower-processor-input",
          checklist: "Bus 3 Output → Delay Tower Processor Input"
        },
        {
          key: "foh-liv006-main-left-output-to-liv006-system-processor-l-input",
          from: "foh-liv006-main-left-output",
          to: "liv006-system-processor-l-input",
          checklist: "Main L Output → Crossover L In",
          stereoGroup: "liv006-main-to-system",
          stereoSide: "left"
        },
        {
          key: "foh-liv006-main-right-output-to-liv006-system-processor-r-input",
          from: "foh-liv006-main-right-output",
          to: "liv006-system-processor-r-input",
          checklist: "Main R Output → Crossover R In",
          stereoGroup: "liv006-main-to-system",
          stereoSide: "right"
        }
      ]
    },
    "LIV-007": {
      id: "LIV-007",
      title: "Broadcast Split",
      processorLabel: "BROADCAST FEEDS",
      panelKinds: ["foh", "iem-record", "iem-station-a", "iem-station-b", "amp7"],
      sourceOrder: [],
      assetOverrides: {
        foh: "/assets/live-sound/svg/hardware/foh-console-liv003-game-style.svg",
        "iem-record": "/assets/live-sound/svg/hardware/iem-feed-liv007-record.svg",
        "iem-station-a": "/assets/live-sound/svg/hardware/iem-feed-liv007-station-a.svg",
        "iem-station-b": "/assets/live-sound/svg/hardware/iem-feed-liv007-station-b.svg",
        amp7: "/assets/live-sound/svg/hardware/power-amp-liv007-main-system.svg"
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
        "foh-liv007-main-left-output",
        "foh-liv007-main-right-output",
        "liv007-record-feed-left-input",
        "liv007-record-feed-right-input",
        "liv007-station-a-feed-left-input",
        "liv007-station-a-feed-right-input",
        "liv007-station-b-feed-left-input",
        "liv007-station-b-feed-right-input",
        "liv007-system-amp-left-input",
        "liv007-system-amp-right-input"
      ],
      validRoutes: [
        {
          key: "foh-aux-1-l-output-to-liv007-record-feed-left-input",
          from: "foh-aux-1-l-output",
          to: "liv007-record-feed-left-input",
          checklist: "Aux 1 L / Split 1 L → Record Feed L",
          stereoGroup: "liv007-split-1-record",
          stereoSide: "left"
        },
        {
          key: "foh-aux-1-r-output-to-liv007-record-feed-right-input",
          from: "foh-aux-1-r-output",
          to: "liv007-record-feed-right-input",
          checklist: "Aux 1 R / Split 1 R → Record Feed R",
          stereoGroup: "liv007-split-1-record",
          stereoSide: "right"
        },
        {
          key: "foh-aux-2-l-output-to-liv007-station-a-feed-left-input",
          from: "foh-aux-2-l-output",
          to: "liv007-station-a-feed-left-input",
          checklist: "Aux 2 L / Split 2 L → Station A L",
          stereoGroup: "liv007-split-2-station-a",
          stereoSide: "left"
        },
        {
          key: "foh-aux-2-r-output-to-liv007-station-a-feed-right-input",
          from: "foh-aux-2-r-output",
          to: "liv007-station-a-feed-right-input",
          checklist: "Aux 2 R / Split 2 R → Station A R",
          stereoGroup: "liv007-split-2-station-a",
          stereoSide: "right"
        },
        {
          key: "foh-aux-3-l-output-to-liv007-station-b-feed-left-input",
          from: "foh-aux-3-l-output",
          to: "liv007-station-b-feed-left-input",
          checklist: "Aux 3 L / Split 3 L → Station B L",
          stereoGroup: "liv007-split-3-station-b",
          stereoSide: "left"
        },
        {
          key: "foh-aux-3-r-output-to-liv007-station-b-feed-right-input",
          from: "foh-aux-3-r-output",
          to: "liv007-station-b-feed-right-input",
          checklist: "Aux 3 R / Split 3 R → Station B R",
          stereoGroup: "liv007-split-3-station-b",
          stereoSide: "right"
        },
        {
          key: "foh-liv007-main-left-output-to-liv007-system-amp-left-input",
          from: "foh-liv007-main-left-output",
          to: "liv007-system-amp-left-input",
          checklist: "Main L Output → System Amp L In",
          stereoGroup: "liv007-main-amp",
          stereoSide: "left"
        },
        {
          key: "foh-liv007-main-right-output-to-liv007-system-amp-right-input",
          from: "foh-liv007-main-right-output",
          to: "liv007-system-amp-right-input",
          checklist: "Main R Output → System Amp R In",
          stereoGroup: "liv007-main-amp",
          stereoSide: "right"
        }
      ]
    },
    "LIV-009": {
      id: "LIV-009",
      title: "Drum Kit Stage Inputs",
      processorLabel: "DRUM INPUTS",
      panelKinds: ["stagebox", "foh"],
      sourceOrder: [
        "kick",
        "snare",
        "hi-hat",
        "high-rack-tom",
        "low-rack-tom",
        "floor-tom",
        "overhead-left-crash",
        "overhead-right-ride"
      ],
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
          key: "kick-to-stagebox-input-1",
          from: "kick",
          to: "stagebox-input-1",
          checklist: "Kick → Stage Box Input 1"
        },
        {
          key: "snare-to-stagebox-input-2",
          from: "snare",
          to: "stagebox-input-2",
          checklist: "Snare → Stage Box Input 2"
        },
        {
          key: "hi-hat-to-stagebox-input-3",
          from: "hi-hat",
          to: "stagebox-input-3",
          checklist: "Hi-hat → Stage Box Input 3"
        },
        {
          key: "high-rack-tom-to-stagebox-input-4",
          from: "high-rack-tom",
          to: "stagebox-input-4",
          checklist: "Rack Tom 1 → Stage Box Input 4"
        },
        {
          key: "low-rack-tom-to-stagebox-input-5",
          from: "low-rack-tom",
          to: "stagebox-input-5",
          checklist: "Rack Tom 2 → Stage Box Input 5"
        },
        {
          key: "floor-tom-to-stagebox-input-6",
          from: "floor-tom",
          to: "stagebox-input-6",
          checklist: "Floor Tom → Stage Box Input 6"
        },
        {
          key: "overhead-left-crash-to-stagebox-input-7",
          from: "overhead-left-crash",
          to: "stagebox-input-7",
          checklist: "OH L → Stage Box Input 7",
          stereoGroup: "drum-overheads",
          stereoSide: "left"
        },
        {
          key: "overhead-right-ride-to-stagebox-input-8",
          from: "overhead-right-ride",
          to: "stagebox-input-8",
          checklist: "OH R → Stage Box Input 8",
          stereoGroup: "drum-overheads",
          stereoSide: "right"
        }
      ]
    },

    "LIV-019": {
      id: "LIV-019",
      title: "Drum Inputs, IEM Sends and FX Returns",
      processorLabel: "DRUMS / IEM / FX",
      panelKinds: ["stagebox", "foh", "iem", "reverb", "delay"],
      sourceOrder: [
        "kick",
        "snare",
        "hi-hat",
        "high-rack-tom",
        "low-rack-tom",
        "floor-tom",
        "overhead-left-crash",
        "overhead-right-ride"
      ],
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

        "foh-liv019-aux-1-output",
        "foh-liv019-aux-2-output",
        "foh-liv019-aux-3-output",
        "foh-liv019-aux-4-output",
        "foh-liv019-aux-5-output",
        "foh-liv019-aux-6-output",

        "liv019-iem-1-input",
        "liv019-iem-2-input",
        "liv019-iem-3-input",
        "liv019-iem-4-input",
        "liv019-iem-5-input",

        "foh-liv019-bus-1-output",
        "foh-liv019-bus-2-output",
        "foh-liv019-bus-3-output",
        "foh-liv019-bus-4-output",
        "foh-liv019-bus-3-left-output",
        "foh-liv019-bus-3-right-output",

        "liv019-reverb-left-input",
        "liv019-reverb-right-input",
        "liv019-reverb-left-output",
        "liv019-reverb-right-output",

        "liv019-delay-left-input",
        "liv019-delay-right-input",
        "liv019-delay-left-output",
        "liv019-delay-right-output",

        "foh-liv019-input-9",
        "foh-liv019-input-10",
        "foh-liv019-input-11",
        "foh-liv019-input-12",
        "foh-liv019-input-13",
        "foh-liv019-input-14"
      ],
      validRoutes: [
        { key: "liv019-kick-to-stagebox-input-1", from: "kick", to: "stagebox-input-1", checklist: "Kick Mic → Stage Box Input 1" },
        { key: "liv019-snare-to-stagebox-input-2", from: "snare", to: "stagebox-input-2", checklist: "Snare Mic → Stage Box Input 2" },
        { key: "liv019-hi-hat-to-stagebox-input-3", from: "hi-hat", to: "stagebox-input-3", checklist: "Hi-Hat Mic → Stage Box Input 3" },
        { key: "liv019-rack-tom-1-to-stagebox-input-4", from: "high-rack-tom", to: "stagebox-input-4", checklist: "Rack Tom 1 Mic → Stage Box Input 4" },
        { key: "liv019-rack-tom-2-to-stagebox-input-5", from: "low-rack-tom", to: "stagebox-input-5", checklist: "Rack Tom 2 Mic → Stage Box Input 5" },
        { key: "liv019-floor-tom-to-stagebox-input-6", from: "floor-tom", to: "stagebox-input-6", checklist: "Floor Tom Mic → Stage Box Input 6" },
        { key: "liv019-oh-left-to-stagebox-input-7", from: "overhead-left-crash", to: "stagebox-input-7", checklist: "Overhead Left Mic → Stage Box Input 7", stereoGroup: "liv019-drum-overheads", stereoSide: "left" },
        { key: "liv019-oh-right-to-stagebox-input-8", from: "overhead-right-ride", to: "stagebox-input-8", checklist: "Overhead Right Mic → Stage Box Input 8", stereoGroup: "liv019-drum-overheads", stereoSide: "right" },

        { key: "liv019-aux-1-to-iem-1", from: "foh-liv019-aux-1-output", to: "liv019-iem-1-input", checklist: "FOH Aux 1 Output → IEM 1 Input" },
        { key: "liv019-aux-2-to-iem-2", from: "foh-liv019-aux-2-output", to: "liv019-iem-2-input", checklist: "FOH Aux 2 Output → IEM 2 Input" },
        { key: "liv019-aux-3-to-iem-3", from: "foh-liv019-aux-3-output", to: "liv019-iem-3-input", checklist: "FOH Aux 3 Output → IEM 3 Input" },
        { key: "liv019-aux-4-to-iem-4", from: "foh-liv019-aux-4-output", to: "liv019-iem-4-input", checklist: "FOH Aux 4 Output → IEM 4 Input" },
        { key: "liv019-aux-5-to-iem-5", from: "foh-liv019-aux-5-output", to: "liv019-iem-5-input", checklist: "FOH Aux 5 Output → IEM 5 Input" },

        { key: "liv019-bus-1-l-to-reverb-l-in", from: "foh-liv019-bus-1-output", to: "liv019-reverb-left-input", checklist: "FOH Bus 1 Output → Stereo Reverb L Input", stereoGroup: "liv019-bus-1-to-reverb", stereoSide: "left" },
        { key: "liv019-bus-1-r-to-reverb-r-in", from: "foh-liv019-bus-2-output", to: "liv019-reverb-right-input", checklist: "FOH Bus 2 Output → Stereo Reverb R Input", stereoGroup: "liv019-bus-1-to-reverb", stereoSide: "right" },
        { key: "liv019-bus-2-l-to-delay-l-in", from: "foh-liv019-bus-3-output", to: "liv019-delay-left-input", checklist: "FOH Bus 3 Output → Stereo Delay L Input", stereoGroup: "liv019-bus-2-to-delay", stereoSide: "left" },
        { key: "liv019-bus-2-r-to-delay-r-in", from: "foh-liv019-bus-4-output", to: "liv019-delay-right-input", checklist: "FOH Bus 4 Output → Stereo Delay R Input", stereoGroup: "liv019-bus-2-to-delay", stereoSide: "right" },

        { key: "liv019-reverb-l-out-to-foh-input-9", from: "liv019-reverb-left-output", to: "foh-liv019-input-9", checklist: "Stereo Reverb L Output → FOH Input Channel 9", stereoGroup: "liv019-reverb-return", stereoSide: "left" },
        { key: "liv019-reverb-r-out-to-foh-input-10", from: "liv019-reverb-right-output", to: "foh-liv019-input-10", checklist: "Stereo Reverb R Output → FOH Input Channel 10", stereoGroup: "liv019-reverb-return", stereoSide: "right" },
        { key: "liv019-delay-l-out-to-foh-input-11", from: "liv019-delay-left-output", to: "foh-liv019-input-11", checklist: "Stereo Delay L Output → FOH Input Channel 11", stereoGroup: "liv019-delay-return", stereoSide: "left" },
        { key: "liv019-delay-r-out-to-foh-input-12", from: "liv019-delay-right-output", to: "foh-liv019-input-12", checklist: "Stereo Delay R Output → FOH Input Channel 12", stereoGroup: "liv019-delay-return", stereoSide: "right" }
      ]
    },

    "LIV-010": {
      id: "LIV-010",
      title: "3-Way Crossover PA Feed",
      processorLabel: "3-WAY CROSSOVER PA",
      panelKinds: ["foh", "crossover", "amp-high", "amp-mid", "amp-low", "speaker-left", "speaker-right", "pa-visual"],
      sourceOrder: [],
      assetOverrides: {
        foh: "/assets/live-sound/svg/hardware/foh-console-liv006-matrix-main-outs.svg",
        crossover: "/assets/live-sound/svg/hardware/crossover-liv010-3way.svg",
        "amp-high": "/assets/live-sound/svg/hardware/power-amp-liv010-high.svg",
        "amp-mid": "/assets/live-sound/svg/hardware/power-amp-liv010-mid.svg",
        "amp-low": "/assets/live-sound/svg/hardware/power-amp-liv010-low.svg",
        "speaker-left": "/assets/live-sound/svg/hardware/line-array-input-panel-liv010-left.svg",
        "speaker-right": "/assets/live-sound/svg/hardware/line-array-input-panel-liv010-right.svg",
        "pa-visual": "/assets/live-sound/svg/hardware/full-pa-system-line-array-over-subs-renderstyle-standalone.svg"
      },
      generatedJackKeys: [
        "foh-liv010-main-left-output",
        "foh-liv010-main-right-output",
        "foh-liv006-bus-1-output",
        "foh-liv006-bus-2-output",
        "foh-liv006-bus-3-output",
        "foh-liv006-bus-4-output",
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
        "liv010-crossover-left-input",
        "liv010-crossover-right-input",
        "liv010-crossover-high-left-output",
        "liv010-crossover-high-right-output",
        "liv010-crossover-mid-left-output",
        "liv010-crossover-mid-right-output",
        "liv010-crossover-low-left-output",
        "liv010-crossover-low-right-output",
        "liv010-high-amp-left-input",
        "liv010-high-amp-right-input",
        "liv010-mid-amp-left-input",
        "liv010-mid-amp-right-input",
        "liv010-low-amp-left-input",
        "liv010-low-amp-right-input",
        "liv010-high-amp-left-output",
        "liv010-high-amp-right-output",
        "liv010-mid-amp-left-output",
        "liv010-mid-amp-right-output",
        "liv010-low-amp-left-output",
        "liv010-low-amp-right-output",
        "liv010-left-line-array-high-input",
        "liv010-right-line-array-high-input",
        "liv010-left-line-array-mid-input",
        "liv010-right-line-array-mid-input",
        "liv010-left-line-array-low-input",
        "liv010-right-line-array-low-input"
      ],
      validRoutes: [
        { key: "foh-liv010-main-left-output-to-liv010-crossover-left-input", from: "foh-liv010-main-left-output", to: "liv010-crossover-left-input", checklist: "Main L Output → Crossover L Input", stereoGroup: "liv010-main-to-crossover", stereoSide: "left" },
        { key: "foh-liv010-main-right-output-to-liv010-crossover-right-input", from: "foh-liv010-main-right-output", to: "liv010-crossover-right-input", checklist: "Main R Output → Crossover R Input", stereoGroup: "liv010-main-to-crossover", stereoSide: "right" },
        { key: "liv010-crossover-high-left-output-to-liv010-high-amp-left-input", from: "liv010-crossover-high-left-output", to: "liv010-high-amp-left-input", checklist: "Crossover High L Output → High Amp L Input", stereoGroup: "liv010-crossover-high-to-amp", stereoSide: "left" },
        { key: "liv010-crossover-high-right-output-to-liv010-high-amp-right-input", from: "liv010-crossover-high-right-output", to: "liv010-high-amp-right-input", checklist: "Crossover High R Output → High Amp R Input", stereoGroup: "liv010-crossover-high-to-amp", stereoSide: "right" },
        { key: "liv010-crossover-mid-left-output-to-liv010-mid-amp-left-input", from: "liv010-crossover-mid-left-output", to: "liv010-mid-amp-left-input", checklist: "Crossover Mid L Output → Mid Amp L Input", stereoGroup: "liv010-crossover-mid-to-amp", stereoSide: "left" },
        { key: "liv010-crossover-mid-right-output-to-liv010-mid-amp-right-input", from: "liv010-crossover-mid-right-output", to: "liv010-mid-amp-right-input", checklist: "Crossover Mid R Output → Mid Amp R Input", stereoGroup: "liv010-crossover-mid-to-amp", stereoSide: "right" },
        { key: "liv010-crossover-low-left-output-to-liv010-low-amp-left-input", from: "liv010-crossover-low-left-output", to: "liv010-low-amp-left-input", checklist: "Crossover Low L Output → Low Amp L Input", stereoGroup: "liv010-crossover-low-to-amp", stereoSide: "left" },
        { key: "liv010-crossover-low-right-output-to-liv010-low-amp-right-input", from: "liv010-crossover-low-right-output", to: "liv010-low-amp-right-input", checklist: "Crossover Low R Output → Low Amp R Input", stereoGroup: "liv010-crossover-low-to-amp", stereoSide: "right" },
        { key: "liv010-high-amp-left-output-to-liv010-left-line-array-high-input", from: "liv010-high-amp-left-output", to: "liv010-left-line-array-high-input", checklist: "High Amp L Output → Left Line Array High Input", stereoGroup: "liv010-high-amp-to-array", stereoSide: "left" },
        { key: "liv010-high-amp-right-output-to-liv010-right-line-array-high-input", from: "liv010-high-amp-right-output", to: "liv010-right-line-array-high-input", checklist: "High Amp R Output → Right Line Array High Input", stereoGroup: "liv010-high-amp-to-array", stereoSide: "right" },
        { key: "liv010-mid-amp-left-output-to-liv010-left-line-array-mid-input", from: "liv010-mid-amp-left-output", to: "liv010-left-line-array-mid-input", checklist: "Mid Amp L Output → Left Line Array Mid Input", stereoGroup: "liv010-mid-amp-to-array", stereoSide: "left" },
        { key: "liv010-mid-amp-right-output-to-liv010-right-line-array-mid-input", from: "liv010-mid-amp-right-output", to: "liv010-right-line-array-mid-input", checklist: "Mid Amp R Output → Right Line Array Mid Input", stereoGroup: "liv010-mid-amp-to-array", stereoSide: "right" },
        { key: "liv010-low-amp-left-output-to-liv010-left-line-array-low-input", from: "liv010-low-amp-left-output", to: "liv010-left-line-array-low-input", checklist: "Low Amp L Output → Left Line Array Low Input", stereoGroup: "liv010-low-amp-to-array", stereoSide: "left" },
        { key: "liv010-low-amp-right-output-to-liv010-right-line-array-low-input", from: "liv010-low-amp-right-output", to: "liv010-right-line-array-low-input", checklist: "Low Amp R Output → Right Line Array Low Input", stereoGroup: "liv010-low-amp-to-array", stereoSide: "right" }
      ]
    },
                    "LIV-018": {
      id: "LIV-018",
      title: "Talkback to monitor system",
      processorLabel: "IN-EAR MONITORING",
      sourceOrder: [
        "talkback-mic",
        "lead-vocal-mic",
        "keys-left-di",
        "keys-right-di"
      ],
      panelKinds: ["stagebox", "foh", "iem"],
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
        "talkback-output",
        "main-left-output",
        "main-right-output",
        "in-ear-b-input",
        "iem-tx-a-left-input",
        "iem-tx-phones"
      ],
      validRoutes: [
        {
          key: "liv018-talkback-mic-to-stagebox-input-14",
          from: "talkback-mic",
          to: "stagebox-input-14",
          checklist: "Talkback Microphone → Stage Box Input 14"
        },
        {
          key: "liv018-talkback-output-to-in-ear-b-input",
          from: "talkback-output",
          to: "in-ear-b-input",
          checklist: "Talkback Output → In-Ear B Input"
        },
        {
          key: "liv018-lead-vocal-mic-to-stagebox-input-1",
          from: "lead-vocal-mic",
          to: "stagebox-input-1",
          checklist: "Lead Vocal Microphone → Stage Box Input 1"
        },
        {
          key: "liv018-keys-left-di-to-stagebox-input-7",
          from: "keys-left-di",
          to: "stagebox-input-7",
          checklist: "Keys Left DI → Stage Box Input 7",
          stereoGroup: "liv018-keys-di-to-stagebox",
          stereoSide: "left"
        },
        {
          key: "liv018-keys-right-di-to-stagebox-input-8",
          from: "keys-right-di",
          to: "stagebox-input-8",
          checklist: "Keys Right DI → Stage Box Input 8",
          stereoGroup: "liv018-keys-di-to-stagebox",
          stereoSide: "right"
        }
      ]
    },

    "LIV-011": {
      id: "LIV-011",
      title: "Lead Vocal Mic to FOH",
      processorLabel: "FRONT FILL DSP",
      rackLabel: "Crossover Rack",
      ampLabel: "CROSSOVER",
      panelKinds: ["stagebox", "foh", "amp"],
      sourceOrder: ["lead-vocal-mic", "keys-left-di", "keys-right-di"],
      assetOverrides: {
        stagebox: "/assets/live-sound/svg/hardware/stagebox-snake-head-16x2-aes.svg",
        foh: "/assets/live-sound/svg/hardware/foh-console-liv006-matrix-main-outs.svg",
        amp: "/assets/live-sound/svg/hardware/crossover-liv010-3way.svg"
      },
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
        "foh-liv006-bus-1-output",
        "foh-liv006-bus-2-output",
        "foh-liv006-bus-3-output",
        "foh-liv006-bus-4-output",
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
        "liv011-crossover-l-input",
        "liv011-crossover-r-input"
      ],
      validRoutes: [
        { key: "lead-vocal-mic-to-stagebox-input-11", from: "lead-vocal-mic", to: "stagebox-input-11", checklist: "Lead Vocal Mic \u2192 Stage Box Input 11" },
        { key: "foh-liv006-main-left-output-to-liv011-crossover-l-input", from: "foh-liv006-main-left-output", to: "liv011-crossover-l-input", checklist: "Main L Output \u2192 Crossover L In", stereoGroup: "liv011-main-to-crossover", stereoSide: "left" },
        { key: "foh-liv006-main-right-output-to-liv011-crossover-r-input", from: "foh-liv006-main-right-output", to: "liv011-crossover-r-input", checklist: "Main R Output \u2192 Crossover R In", stereoGroup: "liv011-main-to-crossover", stereoSide: "right" },
        { key: "keys-left-di-to-stagebox-input-7", from: "keys-left-di", to: "stagebox-input-7", checklist: "Keys L DI \u2192 Stage Box Input 7", stereoGroup: "liv011-keys-di-to-stagebox", stereoSide: "left" },
        { key: "keys-right-di-to-stagebox-input-8", from: "keys-right-di", to: "stagebox-input-8", checklist: "Keys R DI \u2192 Stage Box Input 8", stereoGroup: "liv011-keys-di-to-stagebox", stereoSide: "right" }
      ]
    },




"LIV-025": {
      id: "LIV-025",
      title: "Front Fill Zone Feed",
      processorLabel: "FRONT FILL DSP",
      panelKinds: ["foh", "front-fill-dsp", "front-fill-amp"],
      sourceOrder: [],
      assetOverrides: {
        foh: "/assets/live-sound/svg/hardware/foh-console-liv006-matrix-main-outs.svg",
        "front-fill-dsp": "/assets/live-sound/svg/hardware/foh-console-io-panel.svg",
        "front-fill-amp": "/assets/live-sound/svg/hardware/power-amp-liv010-low.svg"
      },
      generatedJackKeys: [
        "bus-1-output",
        "front-fill-processor-input",
        "front-fill-processor-output",
        "front-fill-amp-input"
      ],
      validRoutes: [
        { key: "bus-1-to-front-fill-dsp", from: "bus-1-output", to: "front-fill-processor-input", checklist: "Bus 1/2 Output → Front Fill DSP Bus In" },
        { key: "front-fill-dsp-to-front-fill-amp", from: "front-fill-processor-output", to: "front-fill-amp-input", checklist: "Front Fill DSP Out → Front Fill Amp Input" }
      ]
    },
    "LIV-026": {
      id: "LIV-026",
      title: "Full Zone Processing",
      processorLabel: "FULL ZONE PROCESSING",
      panelKinds: [],
      sourceOrder: [],
      generatedJackKeys: [],
      validRoutes: [
        { key: "liv026-main-l-to-system-l", from: "liv026-main-l-output", to: "liv026-system-processor-l-input", checklist: "Main L Output → System Processor L In", stereoGroup: "liv026-main-to-system", stereoSide: "left" },
        { key: "liv026-main-r-to-system-r", from: "liv026-main-r-output", to: "liv026-system-processor-r-input", checklist: "Main R Output → System Processor R In", stereoGroup: "liv026-main-to-system", stereoSide: "right" },
        { key: "liv026-system-l-to-crossover-l", from: "liv026-system-processor-l-output", to: "liv026-crossover-l-input", checklist: "System Processor L Out → Crossover L In", stereoGroup: "liv026-system-to-crossover", stereoSide: "left" },
        { key: "liv026-system-r-to-crossover-r", from: "liv026-system-processor-r-output", to: "liv026-crossover-r-input", checklist: "System Processor R Out → Crossover R In", stereoGroup: "liv026-system-to-crossover", stereoSide: "right" },

        { key: "liv026-crossover-high-l-to-high-amp-l", from: "liv026-crossover-high-l-output", to: "liv026-high-amp-l-input", checklist: "Crossover High Left Out → High Amp Left In", stereoGroup: "liv026-high-to-amp", stereoSide: "left" },
        { key: "liv026-crossover-high-r-to-high-amp-r", from: "liv026-crossover-high-r-output", to: "liv026-high-amp-r-input", checklist: "Crossover High Right Out → High Amp Right In", stereoGroup: "liv026-high-to-amp", stereoSide: "right" },
        { key: "liv026-crossover-mid-l-to-mid-amp-l", from: "liv026-crossover-mid-l-output", to: "liv026-mid-amp-l-input", checklist: "Crossover Mid Left Out → Mid Amp Left In", stereoGroup: "liv026-mid-to-amp", stereoSide: "left" },
        { key: "liv026-crossover-mid-r-to-mid-amp-r", from: "liv026-crossover-mid-r-output", to: "liv026-mid-amp-r-input", checklist: "Crossover Mid Right Out → Mid Amp Right In", stereoGroup: "liv026-mid-to-amp", stereoSide: "right" },
        { key: "liv026-crossover-low-l-to-low-amp-l", from: "liv026-crossover-low-l-output", to: "liv026-low-amp-l-input", checklist: "Crossover Low Left Out → Low Amp Left In", stereoGroup: "liv026-low-to-amp", stereoSide: "left" },
        { key: "liv026-crossover-low-r-to-low-amp-r", from: "liv026-crossover-low-r-output", to: "liv026-low-amp-r-input", checklist: "Crossover Low Right Out → Low Amp Right In", stereoGroup: "liv026-low-to-amp", stereoSide: "right" },

        { key: "liv026-bus1-to-delay-processor", from: "liv026-bus-1-output", to: "liv026-delay-processor-input", checklist: "Front-of-House Bus 1 Out → Delay Tower Processor In" },
        { key: "liv026-delay-l-to-delay-amp-l", from: "liv026-delay-processor-l-output", to: "liv026-delay-amp-l-input", checklist: "Delay Tower Processor Left Out → Stereo Power Amp Left In", stereoGroup: "liv026-delay-to-amp", stereoSide: "left" },
        { key: "liv026-delay-r-to-delay-amp-r", from: "liv026-delay-processor-r-output", to: "liv026-delay-amp-r-input", checklist: "Delay Tower Processor Right Out → Stereo Power Amp Right In", stereoGroup: "liv026-delay-to-amp", stereoSide: "right" },

        { key: "liv026-bus2-to-front-fill-processor", from: "liv026-bus-2-output", to: "liv026-front-fill-processor-input", checklist: "Front-of-House Bus 2 Out → Front Fill Processor In" },
        { key: "liv026-front-fill-processor-to-fill-amp", from: "liv026-front-fill-processor-output", to: "liv026-fill-amp-l-input", checklist: "Front Fill Processor Out → Power Amp Left In" }
      ]
    },
    "LIV-029": {
      id: "LIV-029",
      title: "Debate Panel Signal Flow",
      processorLabel: "DEBATE PANEL PA / PRESS / MODERATOR MONITOR",
      sourceLabels: {
        "wireless-receiver-ch1-audio-out": "Moderator Lav Audio Out",
        "wireless-receiver-ch2-audio-out": "Panelist 1 Lav Audio Out",
        "wireless-receiver-ch3-audio-out": "Panelist 2 Lav Audio Out",
        "wireless-receiver-ch4-audio-out": "Audience Q&A Handheld Audio Out"
      },
      destLabels: {
        "console-input-1": "Console Input 1",
        "console-input-2": "Console Input 2",
        "console-input-3": "Console Input 3",
        "console-input-4": "Console Input 4",
        "console-main-l-output": "Console Main L Out",
        "console-main-r-output": "Console Main R Out",
        "console-matrix-record-l-output": "Console Matrix/Record L Out",
        "console-matrix-record-r-output": "Console Matrix/Record R Out",
        "console-aux-1-output": "Console Aux 1 Out",
        "pa-processor-amp-l-input": "PA Processor/Amp L In",
        "pa-processor-amp-r-input": "PA Processor/Amp R In",
        "pa-processor-amp-l-output": "PA Processor/Amp L Out",
        "pa-processor-amp-r-output": "PA Processor/Amp R Out",
        "left-speaker-input": "Left Speaker In",
        "right-speaker-input": "Right Speaker In",
        "press-recorder-l-input": "Press/Recorder L In",
        "press-recorder-r-input": "Press/Recorder R In",
        "moderator-wedge-input": "Moderator Wedge In"
      },
      validRoutes: [
        { key: "liv029-rx-ch1-to-console-input-1", from: "wireless-receiver-ch1-audio-out", to: "console-input-1", checklist: "Moderator Lav Audio Out → Console Input 1" },
        { key: "liv029-rx-ch2-to-console-input-2", from: "wireless-receiver-ch2-audio-out", to: "console-input-2", checklist: "Panelist 1 Lav Audio Out → Console Input 2" },
        { key: "liv029-rx-ch3-to-console-input-3", from: "wireless-receiver-ch3-audio-out", to: "console-input-3", checklist: "Panelist 2 Lav Audio Out → Console Input 3" },
        { key: "liv029-rx-ch4-to-console-input-4", from: "wireless-receiver-ch4-audio-out", to: "console-input-4", checklist: "Audience Q&A Handheld Audio Out → Console Input 4" },
        { key: "liv029-main-l-to-pa-l-input", from: "console-main-l-output", to: "pa-processor-amp-l-input", checklist: "Console Main L Out → PA Processor/Amp L In", stereoGroup: "liv029-main-to-pa-inputs", stereoSide: "left" },
        { key: "liv029-main-r-to-pa-r-input", from: "console-main-r-output", to: "pa-processor-amp-r-input", checklist: "Console Main R Out → PA Processor/Amp R In", stereoGroup: "liv029-main-to-pa-inputs", stereoSide: "right" },
        { key: "liv029-pa-l-output-to-left-speaker", from: "pa-processor-amp-l-output", to: "left-speaker-input", checklist: "PA Processor/Amp L Out → Left Speaker In", stereoGroup: "liv029-pa-outputs-to-speakers", stereoSide: "left" },
        { key: "liv029-pa-r-output-to-right-speaker", from: "pa-processor-amp-r-output", to: "right-speaker-input", checklist: "PA Processor/Amp R Out → Right Speaker In", stereoGroup: "liv029-pa-outputs-to-speakers", stereoSide: "right" },
        { key: "liv029-record-l-to-press-l", from: "console-matrix-record-l-output", to: "press-recorder-l-input", checklist: "Console Matrix/Record L Out → Press/Recorder L In", stereoGroup: "liv029-record-to-press-feed", stereoSide: "left" },
        { key: "liv029-record-r-to-press-r", from: "console-matrix-record-r-output", to: "press-recorder-r-input", checklist: "Console Matrix/Record R Out → Press/Recorder R In", stereoGroup: "liv029-record-to-press-feed", stereoSide: "right" },
        { key: "liv029-aux-1-to-moderator-wedge", from: "console-aux-1-output", to: "moderator-wedge-input", checklist: "Console Aux 1 Out → Moderator Wedge In" }
      ],
      requiredRoutes: [
        ["wireless-receiver-ch1-audio-out", "console-input-1"],
        ["wireless-receiver-ch2-audio-out", "console-input-2"],
        ["wireless-receiver-ch3-audio-out", "console-input-3"],
        ["wireless-receiver-ch4-audio-out", "console-input-4"],
        ["console-main-l-output", "pa-processor-amp-l-input"],
        ["console-main-r-output", "pa-processor-amp-r-input"],
        ["pa-processor-amp-l-output", "left-speaker-input"],
        ["pa-processor-amp-r-output", "right-speaker-input"],
        ["console-matrix-record-l-output", "press-recorder-l-input"],
        ["console-matrix-record-r-output", "press-recorder-r-input"],
        ["console-aux-1-output", "moderator-wedge-input"]
      ],
      stereoGroups: [
        ["console-main-l-output", "console-main-r-output"],
        ["pa-processor-amp-l-output", "pa-processor-amp-r-output"],
        ["console-matrix-record-l-output", "console-matrix-record-r-output"]
      ],
      assets: {
        "wireless-receiver": "/assets/live-sound/svg/hardware/wireless-receiver-panel-animated-aligned.svg",
        "press-recorder": "/assets/live-sound/svg/hardware/iem-feed-liv007-station-a.svg",
        "wedge-amp": "/assets/live-sound/svg/hardware/power-amp-liv010-high.svg"
      },
      puzzle: {
        puzzleMode: "signal-type",
        scenario: "You are wiring a four-person debate panel with wireless lavs, an audience Q&A handheld, a room PA, a moderator wedge, and a press recorder feed.",
        objective: "Route each wireless receiver audio output into the console, feed the room PA through the processor/amp path, send a clean stereo press feed, and provide a separate moderator monitor feed.",
        constraints: [
          {
            id: "rf-is-not-audio",
            text: "Wireless receiver antenna jacks carry RF, not console-ready audio.",
            concept: "rf-vs-audio",
            appliesTo: ["wireless", "console-input"]
          },
          {
            id: "press-feed-is-line-level",
            text: "The press recorder needs a line-level matrix/record feed, not a speaker-level amplifier output.",
            concept: "speaker-level-unsafe",
            appliesTo: ["press-feed", "speaker-level"]
          },
          {
            id: "moderator-monitor-uses-aux",
            text: "The moderator wedge should receive a monitor aux feed instead of the main audience mix.",
            concept: "wrong-bus",
            appliesTo: ["monitor-aux", "main-pa"]
          },
          {
            id: "pa-path-uses-main-outs",
            text: "The PA processor/amp path should receive the console main L/R mix before driving the speakers.",
            concept: "processor-chain",
            appliesTo: ["main-pa", "processor-chain"]
          }
        ],
        routeListVisibility: "full",
        educationalFeedback: {
          defaultWrongRoute: "Trace the signal type and direction first: receiver audio to console input, console bus output to downstream input, processor output to speaker input.",
          routePairs: {
            "wireless-receiver-antenna-a->console-input-1": "This is RF, not audio. Use the receiver's audio output.",
            "wireless-receiver-antenna-b->console-input-2": "This is RF, not audio. Use the receiver's audio output.",
            "wireless-receiver-ch1-audio-out->left-speaker-input": "Receiver output is line-level and needs the console/mix path before the PA.",
            "wireless-receiver-ch2-audio-out->pa-processor-amp-l-input": "Receiver output is line-level and needs the console/mix path before the PA.",
            "pa-processor-amp-l-output->press-recorder-l-input": "This is speaker-level output and can overload or damage recording inputs.",
            "pa-processor-amp-r-output->press-recorder-r-input": "This is speaker-level output and can overload or damage recording inputs.",
            "console-main-l-output->moderator-wedge-input": "The wedge should receive a monitor/aux mix, not the main audience mix.",
            "console-main-r-output->moderator-wedge-input": "The wedge should receive a monitor/aux mix, not the main audience mix.",
            "console-aux-1-output->pa-processor-amp-l-input": "Aux sends are monitor mixes here. The PA processor should receive the main L/R mix.",
            "press-recorder-output->console-input-4": "This reverses the signal direction. The recorder should receive a feed from the console.",
            "left-speaker-thru->console-input-1": "Speaker outputs are not console inputs. Follow signal from source to mix to amplifier to speaker."
          },
          concepts: {
            "rf-vs-audio": "RF antenna jacks are not balanced audio outputs. Use the receiver's audio output after the wireless receiver converts RF to audio.",
            "wrong-signal-type": "Match the signal level and type before patching: mic/line, bus output, processor input, amplifier output, or speaker input.",
            "wrong-bus": "Choose the console bus that matches the destination. Main outputs feed the audience PA, auxes feed monitor mixes, and matrix/record outputs feed press or recorder paths.",
            "wrong-direction": "Follow the signal direction from source to console to destination. Outputs feed inputs.",
            "speaker-level-unsafe": "Speaker-level outputs belong at speakers and can overload line-level recorder or console inputs.",
            "processor-chain": "The room PA path runs from console main outputs into the processor/amp inputs, then from amp outputs to speaker inputs."
          },
          endpointTypes: {
            "rf-output->line-input": "RF outputs are not line-level audio inputs. Patch from the receiver audio output instead.",
            "speaker-output->line-input": "Speaker-level output should not feed a line-level recorder or console input.",
            "main-output->monitor-input": "A monitor wedge should receive an aux/monitor output, not the main audience mix."
          }
        },
        trapRoutes: [
          { from: "wireless-receiver-antenna-a", to: "console-input-1", concept: "rf-vs-audio", severity: "teach", message: "This is RF, not audio. Use the receiver's audio output." },
          { from: "wireless-receiver-antenna-b", to: "console-input-2", concept: "rf-vs-audio", severity: "teach", message: "This is RF, not audio. Use the receiver's audio output." },
          { from: "wireless-receiver-ch1-audio-out", to: "left-speaker-input", concept: "wrong-destination", severity: "teach", message: "Receiver output is line-level and needs the console/mix path before the PA." },
          { from: "wireless-receiver-ch2-audio-out", to: "pa-processor-amp-l-input", concept: "processor-bypass", severity: "teach", message: "Receiver output is line-level and needs the console/mix path before the PA." },
          { from: "pa-processor-amp-l-output", to: "press-recorder-l-input", concept: "speaker-level-unsafe", severity: "unsafe", message: "This is speaker-level output and can overload or damage recording inputs." },
          { from: "pa-processor-amp-r-output", to: "press-recorder-r-input", concept: "speaker-level-unsafe", severity: "unsafe", message: "This is speaker-level output and can overload or damage recording inputs." },
          { from: "console-main-l-output", to: "moderator-wedge-input", concept: "wrong-bus", severity: "warning", message: "The wedge should receive a monitor/aux mix, not the main audience mix." },
          { from: "console-main-r-output", to: "moderator-wedge-input", concept: "wrong-bus", severity: "warning", message: "The wedge should receive a monitor/aux mix, not the main audience mix." },
          { from: "console-aux-1-output", to: "pa-processor-amp-l-input", concept: "wrong-bus", severity: "warning", message: "Aux sends are monitor mixes here. The PA processor should receive the main L/R mix." },
          { from: "press-recorder-output", to: "console-input-4", concept: "wrong-direction", severity: "teach", message: "This reverses the signal direction. The recorder should receive a feed from the console." },
          { from: "left-speaker-thru", to: "console-input-1", concept: "speaker-level-unsafe", severity: "unsafe", message: "Speaker outputs are not console inputs. Follow signal from source to mix to amplifier to speaker." },
          { from: "right-speaker-thru", to: "console-input-2", concept: "speaker-level-unsafe", severity: "unsafe", message: "Speaker outputs are not console inputs. Follow signal from source to mix to amplifier to speaker." },
          { from: "pa-speaker-output-trap", to: "press-recorder-l-input", concept: "speaker-level-unsafe", severity: "unsafe", message: "This is speaker-level output and can overload or damage recording inputs." },
          { from: "console-main-l-wedge-trap", to: "moderator-wedge-input", concept: "wrong-bus", severity: "warning", message: "The wedge should receive a monitor/aux mix, not the main audience mix." },
          { from: "console-aux-pa-trap", to: "pa-processor-amp-l-input", concept: "wrong-bus", severity: "warning", message: "Aux sends are monitor mixes here. The PA processor should receive the main L/R mix." }
        ],
        completionExplanation: "The receiver audio outputs feed console inputs, the console main L/R outputs feed the PA processor/amp, the amp outputs drive the speakers, the matrix/record outputs feed the press recorder, and Aux 1 feeds the moderator wedge. RF antenna jacks, speaker-level outputs, and reversed recorder paths are intentionally avoided.",
        difficulty: 4,
        conceptTags: ["wireless", "rf-vs-audio", "press-feed", "monitor-aux", "main-pa", "signal-direction"]
      }
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
    },
          "LIV-015": {
          id: "LIV-015",
          title: "Front Fill Zone Feed",
          familyLayout: "processing-stagebox",
          processorLabel: "CROSSOVER / SUB PROCESSING",
          panelKinds: ["stagebox", "foh", "amp"],
          sourceOrder: ["lead-vocal-mic"],
          assetOverrides: {
            stagebox: "/assets/live-sound/svg/hardware/stagebox-snake-head-16x2-aes.svg",
            foh: "/assets/live-sound/svg/hardware/foh-console-liv006-matrix-main-outs.svg",
            amp: "/assets/live-sound/svg/hardware/power-amp-liv006-system-delay-processor.svg?v=6r259",
            paamp: "/assets/live-sound/svg/hardware/power-amp-liv007-main-system.svg"
          },
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
            "foh-liv006-bus-1-output",
            "foh-liv006-bus-2-output",
            "foh-liv006-bus-3-output",
            "foh-liv006-bus-4-output",
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
            { key: "foh-liv006-bus-2-output-to-liv006-sub-processor-input", from: "foh-liv006-bus-2-output", to: "liv006-sub-processor-input", checklist: "Bus 2 Output → Sub Processor Input" },
            { key: "foh-liv006-main-left-output-to-liv006-system-processor-l-input", from: "foh-liv006-main-left-output", to: "liv006-system-processor-l-input", checklist: "Main L Output → Crossover L In", stereoGroup: "liv015-main-to-crossover", stereoSide: "left" },
            { key: "foh-liv006-main-right-output-to-liv006-system-processor-r-input", from: "foh-liv006-main-right-output", to: "liv006-system-processor-r-input", checklist: "Main R Output → Crossover R In", stereoGroup: "liv015-main-to-crossover", stereoSide: "right" },
            { key: "lead-vocal-mic-to-stagebox-input-1", from: "lead-vocal-mic", to: "stagebox-input-1", checklist: "Lead Vocal Mic → Stage Box Input 1" }
          ]
        },
        "LIV-016": {
          id: "LIV-016",
          title: "16-channel Stage Box to Front-of-House",
          familyLayout: "png-full-band-stagebox",
          processorLabel: "FULL BAND STAGEBOX",
          panelKinds: ["stagebox", "foh", "amp"],
          sourceOrder: [
            "lead-vocal-mic",
            "bass-di",
            "guitar-1-left",
            "guitar-1-right",
            "guitar-2-left",
            "guitar-2-right",
            "keys-left-di",
            "keys-right-di",
            "kick",
            "snare",
            "hi-hat",
            "high-rack-tom",
            "low-rack-tom",
            "floor-tom",
            "overhead-left-crash",
            "overhead-right-ride"
          ],
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
            "foh-liv006-main-left-output",
            "foh-liv006-main-right-output",
            "liv242-crossover-l-input",
            "liv242-crossover-r-input"
          ],
          validRoutes: [
            { key: "liv016-lead-vocal-mic-to-stagebox-input-1", from: "lead-vocal-mic", to: "stagebox-input-1", checklist: "Lead Vocal Microphone → Stage Box Input 1" },
            { key: "liv016-bass-di-to-stagebox-input-2", from: "bass-di", to: "stagebox-input-2", checklist: "Bass DI → Stage Box Input 2" },
            { key: "liv016-guitar-1-left-to-stagebox-input-3", from: "guitar-1-left", to: "stagebox-input-3", checklist: "Guitar 1 Left → Stage Box Input 3", stereoGroup: "liv016-guitar-1-to-stagebox", stereoSide: "left" },
            { key: "liv016-guitar-1-right-to-stagebox-input-4", from: "guitar-1-right", to: "stagebox-input-4", checklist: "Guitar 1 Right → Stage Box Input 4", stereoGroup: "liv016-guitar-1-to-stagebox", stereoSide: "right" },
            { key: "liv016-guitar-2-left-to-stagebox-input-5", from: "guitar-2-left", to: "stagebox-input-5", checklist: "Guitar 2 Left → Stage Box Input 5", stereoGroup: "liv016-guitar-2-to-stagebox", stereoSide: "left" },
            { key: "liv016-guitar-2-right-to-stagebox-input-6", from: "guitar-2-right", to: "stagebox-input-6", checklist: "Guitar 2 Right → Stage Box Input 6", stereoGroup: "liv016-guitar-2-to-stagebox", stereoSide: "right" },
            { key: "liv016-keys-left-di-to-stagebox-input-7", from: "keys-left-di", to: "stagebox-input-7", checklist: "Keys Left DI → Stage Box Input 7", stereoGroup: "liv016-keys-to-stagebox", stereoSide: "left" },
            { key: "liv016-keys-right-di-to-stagebox-input-8", from: "keys-right-di", to: "stagebox-input-8", checklist: "Keys Right DI → Stage Box Input 8", stereoGroup: "liv016-keys-to-stagebox", stereoSide: "right" },
            { key: "liv016-kick-to-stagebox-input-9", from: "kick", to: "stagebox-input-9", checklist: "Kick → Stage Box Input 9" },
            { key: "liv016-snare-to-stagebox-input-10", from: "snare", to: "stagebox-input-10", checklist: "Snare → Stage Box Input 10" },
            { key: "liv016-hi-hat-to-stagebox-input-11", from: "hi-hat", to: "stagebox-input-11", checklist: "Hi-hat → Stage Box Input 11" },
            { key: "liv016-rack-tom-1-to-stagebox-input-12", from: "high-rack-tom", to: "stagebox-input-12", checklist: "Rack Tom 1 → Stage Box Input 12" },
            { key: "liv016-rack-tom-2-to-stagebox-input-13", from: "low-rack-tom", to: "stagebox-input-13", checklist: "Rack Tom 2 → Stage Box Input 13" },
            { key: "liv016-floor-tom-to-stagebox-input-14", from: "floor-tom", to: "stagebox-input-14", checklist: "Floor Tom → Stage Box Input 14" },
            { key: "liv016-overhead-left-to-stagebox-input-15", from: "overhead-left-crash", to: "stagebox-input-15", checklist: "OH Left → Stage Box Input 15", stereoGroup: "liv016-overheads-to-stagebox", stereoSide: "left" },
            { key: "liv016-overhead-right-to-stagebox-input-16", from: "overhead-right-ride", to: "stagebox-input-16", checklist: "OH Right → Stage Box Input 16", stereoGroup: "liv016-overheads-to-stagebox", stereoSide: "right" },
            { key: "liv016-main-left-output-to-crossover-left-input", from: "foh-liv006-main-left-output", to: "liv242-crossover-l-input", checklist: "Main Left Output → Crossover Left In", stereoGroup: "liv016-main-to-crossover", stereoSide: "left" },
            { key: "liv016-main-right-output-to-crossover-right-input", from: "foh-liv006-main-right-output", to: "liv242-crossover-r-input", checklist: "Main Right Output → Crossover Right In", stereoGroup: "liv016-main-to-crossover", stereoSide: "right" }
          ]
        },
        "LIV-021": {
          id: "LIV-021",
          title: "Lead Vocal Input + Channel Insert Compressor",
          processorLabel: "LEAD VOCAL INPUT + CHANNEL INSERT COMPRESSOR",
          panelKinds: ["foh", "stagebox", "compressor", "system-processor", "main-amp", "vocal-wedge-amp", "vocal-wedge"],
          sourceOrder: ["lead-vocal-mic"],
          generatedJackKeys: [
            "liv021-stagebox-input-1",
            "liv021-ch1-insert-send",
            "liv021-ch1-insert-return",
            "liv021-compressor-input",
            "liv021-compressor-output",
            "liv021-aux-1-output",
            "liv021-vocal-wedge-amp-input",
            "liv021-vocal-wedge-amp-output",
            "liv021-vocal-wedge-input",
            "liv021-main-left-output",
            "liv021-main-right-output",
            "liv021-system-processor-left-input",
            "liv021-system-processor-right-input",
            "liv021-system-processor-left-output",
            "liv021-system-processor-right-output",
            "liv021-main-amp-left-input",
            "liv021-main-amp-right-input"
          ],
          validRoutes: [
            { key: "liv021-lead-vocal-mic-to-stagebox-input-1", from: "lead-vocal-mic", to: "liv021-stagebox-input-1", checklist: "Lead Vocal Microphone → Stage Box Input 1" },
            { key: "liv021-insert-send-to-compressor-input", from: "liv021-ch1-insert-send", to: "liv021-compressor-input", checklist: "Channel 1 Insert Send → Vocal Compressor Input" },
            { key: "liv021-compressor-output-to-insert-return", from: "liv021-compressor-output", to: "liv021-ch1-insert-return", checklist: "Vocal Compressor Output → Channel 1 Insert Return" },
            { key: "liv021-aux1-to-vocal-wedge-amp-input", from: "liv021-aux-1-output", to: "liv021-vocal-wedge-amp-input", checklist: "Auxiliary 1 Output → Vocal Wedge Amp Input" },
            { key: "liv021-vocal-wedge-amp-output-to-wedge-input", from: "liv021-vocal-wedge-amp-output", to: "liv021-vocal-wedge-input", checklist: "Vocal Wedge Amp Output → Vocal Wedge Input" },
            { key: "liv021-main-left-to-system-processor-left-input", from: "liv021-main-left-output", to: "liv021-system-processor-left-input", checklist: "Main Left Output → System Processor Left Input" },
            { key: "liv021-main-right-to-system-processor-right-input", from: "liv021-main-right-output", to: "liv021-system-processor-right-input", checklist: "Main Right Output → System Processor Right Input" },
            { key: "liv021-system-processor-left-output-to-main-amp-left-input", from: "liv021-system-processor-left-output", to: "liv021-main-amp-left-input", checklist: "System Processor Left Output → Main Amp Left Input" },
            { key: "liv021-system-processor-right-output-to-main-amp-right-input", from: "liv021-system-processor-right-output", to: "liv021-main-amp-right-input", checklist: "System Processor Right Output → Main Amp Right Input" }
          ]
        },
        "LIV-023": {
          id: "LIV-023",
          title: "Monitor Console: Vocal Insert, Stereo IEM, and 3-Way PA",
          processorLabel: "MONITOR CONSOLE: VOCAL INSERT, STEREO IEM, AND 3-WAY PA",
          panelKinds: ["monitor-console", "stagebox", "compressor", "iem", "crossover", "high-amp", "mid-amp", "low-amp"],
          sourceOrder: [],
          generatedJackKeys: [
            "liv023-lead-vocal-mic",
            "liv023-keyboard-di-l",
            "liv023-keyboard-di-r",
            "liv023-stagebox-input-1",
            "liv023-stagebox-input-2",
            "liv023-stagebox-input-3",
            "liv023-ch1-insert-send",
            "liv023-ch1-insert-return",
            "liv023-aux1-l",
            "liv023-aux1-r",
            "liv023-main-l",
            "liv023-main-r",
            "liv023-compressor-input",
            "liv023-compressor-output",
            "liv023-iem-input-l",
            "liv023-iem-input-r",
            "liv023-crossover-l-input",
            "liv023-crossover-r-input",
            "liv023-crossover-high-l",
            "liv023-crossover-high-r",
            "liv023-crossover-mid-l",
            "liv023-crossover-mid-r",
            "liv023-crossover-low-l",
            "liv023-crossover-low-r",
            "liv023-high-amp-l",
            "liv023-high-amp-r",
            "liv023-mid-amp-l",
            "liv023-mid-amp-r",
            "liv023-low-amp-l",
            "liv023-low-amp-r"
          ],
          validRoutes: [
            { key: "liv023-lead-vocal-mic-to-stagebox-input-1", from: "liv023-lead-vocal-mic", to: "liv023-stagebox-input-1", checklist: "Lead Vocal Mic → Stage Box Input 1" },
            { key: "liv023-keyboard-di-l-to-stagebox-input-2", from: "liv023-keyboard-di-l", to: "liv023-stagebox-input-2", checklist: "Keyboard DI L → Stage Box Input 2", stereoGroup: "liv023-keyboard-di-to-stagebox", stereoSide: "left" },
            { key: "liv023-keyboard-di-r-to-stagebox-input-3", from: "liv023-keyboard-di-r", to: "liv023-stagebox-input-3", checklist: "Keyboard DI R → Stage Box Input 3", stereoGroup: "liv023-keyboard-di-to-stagebox", stereoSide: "right" },
            { key: "liv023-ch1-insert-send-to-compressor-input", from: "liv023-ch1-insert-send", to: "liv023-compressor-input", checklist: "Channel 1 Insert Send → Compressor Input" },
            { key: "liv023-compressor-output-to-ch1-insert-return", from: "liv023-compressor-output", to: "liv023-ch1-insert-return", checklist: "Compressor Output → Channel 1 Insert Return" },
            { key: "liv023-aux1-l-to-iem-input-l", from: "liv023-aux1-l", to: "liv023-iem-input-l", checklist: "Aux 1 Left Output → IEM A Left Input", stereoGroup: "liv023-aux1-to-iem-a", stereoSide: "left" },
            { key: "liv023-aux1-r-to-iem-input-r", from: "liv023-aux1-r", to: "liv023-iem-input-r", checklist: "Aux 1 Right Output → IEM A Right Input", stereoGroup: "liv023-aux1-to-iem-a", stereoSide: "right" },
            { key: "liv023-main-l-to-crossover-l-input", from: "liv023-main-l", to: "liv023-crossover-l-input", checklist: "Main Left Output → Crossover Left Input", stereoGroup: "liv023-main-to-crossover", stereoSide: "left" },
            { key: "liv023-main-r-to-crossover-r-input", from: "liv023-main-r", to: "liv023-crossover-r-input", checklist: "Main Right Output → Crossover Right Input", stereoGroup: "liv023-main-to-crossover", stereoSide: "right" },
            { key: "liv023-crossover-high-l-to-high-amp-l", from: "liv023-crossover-high-l", to: "liv023-high-amp-l", checklist: "Crossover High Left Output → High Amp Left Input", stereoGroup: "liv023-crossover-high-to-amp", stereoSide: "left" },
            { key: "liv023-crossover-high-r-to-high-amp-r", from: "liv023-crossover-high-r", to: "liv023-high-amp-r", checklist: "Crossover High Right Output → High Amp Right Input", stereoGroup: "liv023-crossover-high-to-amp", stereoSide: "right" },
            { key: "liv023-crossover-mid-l-to-mid-amp-l", from: "liv023-crossover-mid-l", to: "liv023-mid-amp-l", checklist: "Crossover Mid Left Output → Mid Amp Left Input", stereoGroup: "liv023-crossover-mid-to-amp", stereoSide: "left" },
            { key: "liv023-crossover-mid-r-to-mid-amp-r", from: "liv023-crossover-mid-r", to: "liv023-mid-amp-r", checklist: "Crossover Mid Right Output → Mid Amp Right Input", stereoGroup: "liv023-crossover-mid-to-amp", stereoSide: "right" },
            { key: "liv023-crossover-low-l-to-low-amp-l", from: "liv023-crossover-low-l", to: "liv023-low-amp-l", checklist: "Crossover Low Left Output → Low Amp Left Input", stereoGroup: "liv023-crossover-low-to-amp", stereoSide: "left" },
            { key: "liv023-crossover-low-r-to-low-amp-r", from: "liv023-crossover-low-r", to: "liv023-low-amp-r", checklist: "Crossover Low Right Output → Low Amp Right Input", stereoGroup: "liv023-crossover-low-to-amp", stereoSide: "right" }
          ]
        },
        "LIV-020": {
          id: "LIV-020",
          title: "Main PA + IEM Monitor Feed",
          processorLabel: "3-WAY PA + MONITOR IEM FEEDS",
          panelKinds: ["foh", "crossover", "amp-high", "amp-mid", "amp-low", "speaker-left", "speaker-right", "pa-visual", "iem-pack"],
          sourceOrder: [],
          assetOverrides: {
            foh: "/assets/live-sound/svg/hardware/monitor-console-aux-panel.svg",
            crossover: "/assets/live-sound/svg/hardware/crossover-liv010-3way.svg",
            "amp-high": "/assets/live-sound/svg/hardware/power-amp-liv010-high.svg",
            "amp-mid": "/assets/live-sound/svg/hardware/power-amp-liv010-mid.svg",
            "amp-low": "/assets/live-sound/svg/hardware/power-amp-liv010-low.svg",
            "speaker-left": "/assets/live-sound/svg/hardware/line-array-input-panel-liv010-left.svg",
            "speaker-right": "/assets/live-sound/svg/hardware/line-array-input-panel-liv010-right.svg",
            "pa-visual": "/assets/live-sound/svg/hardware/full-pa-system-line-array-over-subs-renderstyle-standalone.svg",
            "iem-pack": "/assets/live-sound/svg/hardware/iem-wireless-rack-front.svg"
          },
          generatedJackKeys: [
            "liv020-main-left-output",
            "liv020-main-right-output",
            "liv020-aux-1-output",
            "liv020-aux-2-output",
            "liv020-aux-3-output",
            "liv020-aux-4-output",
            "liv020-aux-5-output",
            "liv020-crossover-left-input",
            "liv020-crossover-right-input",
            "liv020-crossover-high-left-output",
            "liv020-crossover-high-right-output",
            "liv020-crossover-mid-left-output",
            "liv020-crossover-mid-right-output",
            "liv020-crossover-low-left-output",
            "liv020-crossover-low-right-output",
            "liv020-high-amp-left-input",
            "liv020-high-amp-right-input",
            "liv020-mid-amp-left-input",
            "liv020-mid-amp-right-input",
            "liv020-low-amp-left-input",
            "liv020-low-amp-right-input",
            "liv020-high-amp-left-output",
            "liv020-high-amp-right-output",
            "liv020-mid-amp-left-output",
            "liv020-mid-amp-right-output",
            "liv020-low-amp-left-output",
            "liv020-low-amp-right-output",
            "liv020-left-line-array-high-input",
            "liv020-right-line-array-high-input",
            "liv020-left-line-array-mid-input",
            "liv020-right-line-array-mid-input",
            "liv020-left-line-array-low-input",
            "liv020-right-line-array-low-input",
            "liv020-iem-pack-1-input",
            "liv020-iem-pack-1-input-b",
            "liv020-iem-pack-2-input",
            "liv020-iem-pack-2-input-b",
            "liv020-iem-pack-3-input"
          ],
          validRoutes: [
            { key: "liv020-main-left-output-to-liv020-crossover-left-input", from: "liv020-main-left-output", to: "liv020-crossover-left-input", checklist: "Main L Output → Crossover L Input", stereoGroup: "liv020-main-to-crossover", stereoSide: "left" },
            { key: "liv020-main-right-output-to-liv020-crossover-right-input", from: "liv020-main-right-output", to: "liv020-crossover-right-input", checklist: "Main R Output → Crossover R Input", stereoGroup: "liv020-main-to-crossover", stereoSide: "right" },
            { key: "liv020-crossover-high-left-output-to-liv020-high-amp-left-input", from: "liv020-crossover-high-left-output", to: "liv020-high-amp-left-input", checklist: "Crossover High L Output → High Amp L Input", stereoGroup: "liv020-crossover-high-to-amp", stereoSide: "left" },
            { key: "liv020-crossover-high-right-output-to-liv020-high-amp-right-input", from: "liv020-crossover-high-right-output", to: "liv020-high-amp-right-input", checklist: "Crossover High R Output → High Amp R Input", stereoGroup: "liv020-crossover-high-to-amp", stereoSide: "right" },
            { key: "liv020-crossover-mid-left-output-to-liv020-mid-amp-left-input", from: "liv020-crossover-mid-left-output", to: "liv020-mid-amp-left-input", checklist: "Crossover Mid L Output → Mid Amp L Input", stereoGroup: "liv020-crossover-mid-to-amp", stereoSide: "left" },
            { key: "liv020-crossover-mid-right-output-to-liv020-mid-amp-right-input", from: "liv020-crossover-mid-right-output", to: "liv020-mid-amp-right-input", checklist: "Crossover Mid R Output → Mid Amp R Input", stereoGroup: "liv020-crossover-mid-to-amp", stereoSide: "right" },
            { key: "liv020-crossover-low-left-output-to-liv020-low-amp-left-input", from: "liv020-crossover-low-left-output", to: "liv020-low-amp-left-input", checklist: "Crossover Low L Output → Low Amp L Input", stereoGroup: "liv020-crossover-low-to-amp", stereoSide: "left" },
            { key: "liv020-crossover-low-right-output-to-liv020-low-amp-right-input", from: "liv020-crossover-low-right-output", to: "liv020-low-amp-right-input", checklist: "Crossover Low R Output → Low Amp R Input", stereoGroup: "liv020-crossover-low-to-amp", stereoSide: "right" },
            { key: "liv020-high-amp-left-output-to-liv020-left-line-array-high-input", from: "liv020-high-amp-left-output", to: "liv020-left-line-array-high-input", checklist: "High Amp L Output → Left Line Array High Input", stereoGroup: "liv020-high-amp-to-array", stereoSide: "left" },
            { key: "liv020-high-amp-right-output-to-liv020-right-line-array-high-input", from: "liv020-high-amp-right-output", to: "liv020-right-line-array-high-input", checklist: "High Amp R Output → Right Line Array High Input", stereoGroup: "liv020-high-amp-to-array", stereoSide: "right" },
            { key: "liv020-mid-amp-left-output-to-liv020-left-line-array-mid-input", from: "liv020-mid-amp-left-output", to: "liv020-left-line-array-mid-input", checklist: "Mid Amp L Output → Left Line Array Mid Input", stereoGroup: "liv020-mid-amp-to-array", stereoSide: "left" },
            { key: "liv020-mid-amp-right-output-to-liv020-right-line-array-mid-input", from: "liv020-mid-amp-right-output", to: "liv020-right-line-array-mid-input", checklist: "Mid Amp R Output → Right Line Array Mid Input", stereoGroup: "liv020-mid-amp-to-array", stereoSide: "right" },
            { key: "liv020-low-amp-left-output-to-liv020-left-line-array-low-input", from: "liv020-low-amp-left-output", to: "liv020-left-line-array-low-input", checklist: "Low Amp L Output → Left Line Array Low Input", stereoGroup: "liv020-low-amp-to-array", stereoSide: "left" },
            { key: "liv020-low-amp-right-output-to-liv020-right-line-array-low-input", from: "liv020-low-amp-right-output", to: "liv020-right-line-array-low-input", checklist: "Low Amp R Output → Right Line Array Low Input", stereoGroup: "liv020-low-amp-to-array", stereoSide: "right" },
            { key: "liv020-aux-1-output-to-liv020-iem-pack-1-input", from: "liv020-aux-1-output", to: "liv020-iem-pack-1-input", checklist: "Aux 1 Output → IEM Pack 1 Input A" },
            { key: "liv020-aux-2-output-to-liv020-iem-pack-1-input-b", from: "liv020-aux-2-output", to: "liv020-iem-pack-1-input-b", checklist: "Aux 2 Output → IEM Pack 1 Input B" },
            { key: "liv020-aux-3-output-to-liv020-iem-pack-2-input", from: "liv020-aux-3-output", to: "liv020-iem-pack-2-input", checklist: "Aux 3 Output → IEM Pack 2 Input A" },
            { key: "liv020-aux-4-output-to-liv020-iem-pack-2-input-b", from: "liv020-aux-4-output", to: "liv020-iem-pack-2-input-b", checklist: "Aux 4 Output → IEM Pack 2 Input B" },
            { key: "liv020-aux-5-output-to-liv020-iem-pack-3-input", from: "liv020-aux-5-output", to: "liv020-iem-pack-3-input", checklist: "Aux 5 Output → IEM Pack 3 Input A" }
          ]
        },
};

  function sfClearNativeCompletionOverlay(reason) {
    if (typeof document === "undefined") return;

    document.querySelectorAll([
      ".sf-native-completion",
      ".sf-native-completion-popup",
      ".native-completion",
      ".completion-popup",
      ".level-complete",
      ".modal",
      ".popup",
      "[class*='completion']",
      "[class*='complete']"
    ].join(",")).forEach(function(el) {
      const body = (el.textContent || "").replace(/\s+/g, " ").trim();

      const looksLikeNativeCompletion =
        /LEVEL COMPLETE/i.test(body) &&
        (
          /All required routes are patched correctly/i.test(body) ||
          /Continue to LIV-\d{3}/i.test(body) ||
          /Next Level/i.test(body)
        );

      if (looksLikeNativeCompletion) {
        console.log("[Signal Flow] Removed stale native completion overlay:", reason || "");
        el.remove();
      }
    });
  }



  function resetNativeStateForLevelChange(nextLevelId) {
if (activeNativeLevelId === nextLevelId) return;
      console.log("[Signal Flow] Native level changed, clearing state:", activeNativeLevelId, "→", nextLevelId);

    activeNativeLevelId = nextLevelId;
    resetNativeSurfaceRetry();
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

    try {
      captureNativeCompletionStartTotals(nextLevelId);
      dispatchNativeLedger({ type: "LEVEL_STARTED", levelId: nextLevelId });
    } catch (err) {
      console.warn("[Signal Flow] Native ledger level start failed:", err);
    }

    // Remove any old native layers/cables so a previous board cannot visually
    // carry routes into the next board.
    document.querySelectorAll(".sf-live-native-layer").forEach(layer => layer.remove());

    try {
      updateNativeScore();
    } catch (err) {}
  }

  function syncActiveLevelSpec() {
    const id = currentNativePatchLevelId();
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
    LEVEL.puzzle = spec.puzzle || null;
    syncLiv028ValidRoutesFromData();

    return spec;
  }

  const NODE_DEFS = {
    "liv242-main-pa-r-input": { label: "Main PA R Input", kind: "jack", panelRel: { panel: "paamp", x: 0.640000, y: 0.625000 } },
    "liv242-main-pa-l-input": { label: "Main PA L Input", kind: "jack", panelRel: { panel: "paamp", x: 0.360000, y: 0.625000 } },
    "liv242-crossover-r-output": { label: "Crossover R Out", kind: "jack", panelRel: { panel: "amp", x: 0.720000, y: 0.455000 } },
    "liv242-crossover-l-output": { label: "Crossover L Out", kind: "jack", panelRel: { panel: "amp", x: 0.620000, y: 0.455000 } },
    "liv242-sub-processor-input": { label: "Sub Processor Input", kind: "jack", panelRel: { panel: "amp", x: 0.640000, y: 0.615000 } },
    "liv242-delay-tower-processor-input": { label: "Delay Tower Processor Input", kind: "jack", panelRel: { panel: "amp", x: 0.640000, y: 0.340000 } },
    "liv242-crossover-r-input": { label: "Crossover R In", kind: "jack", panelRel: { panel: "amp", x: 0.257000, y: 0.615000 } },
    "liv242-crossover-l-input": { label: "Crossover L In", kind: "jack", panelRel: { panel: "amp", x: 0.166000, y: 0.615000 } },
    "lead-vocal-mic": { label: "Lead Vocal Microphone", kind: "source" },
    "talkback-mic": { label: "Talkback Mic", kind: "source", x: 44, y: 160 },
    "keys-left-di": { label: "Keys L DI", kind: "source" },
    "keys-right-di": { label: "Keys R DI", kind: "source" },
    "bass-di": { label: "Bass DI", kind: "source" },
    "guitar-1-left": { label: "Guitar 1 L", kind: "source" },
    "guitar-1-right": { label: "Guitar 1 R", kind: "source" },
    "guitar-2-left": { label: "Guitar 2 L", kind: "source" },
    "guitar-2-right": { label: "Guitar 2 R", kind: "source" },
    "kick": { label: "Kick", kind: "source" },
    "snare": { label: "Snare", kind: "source" },
    "hi-hat": { label: "Hi-hat", kind: "source" },
    "high-rack-tom": { label: "Rack Tom 1", kind: "source" },
    "low-rack-tom": { label: "Rack Tom 2", kind: "source" },
    "floor-tom": { label: "Floor Tom", kind: "source" },
    "overhead-left-crash": { label: "OH L", kind: "source" },
    "overhead-right-ride": { label: "OH R", kind: "source" },
    "stagebox-input-1": { label: "Stage Box Input 1", kind: "jack", panelRel: { panel: "stagebox", x: 0.093878, y: 0.347222 } },
    "stagebox-input-2": { label: "Stage Box Input 2", kind: "jack", panelRel: { panel: "stagebox", x: 0.171429, y: 0.347222 } },
    "stagebox-input-3": { label: "Stage Box Input 3", kind: "jack", panelRel: { panel: "stagebox", x: 0.248980, y: 0.347222 } },
    "stagebox-input-4": { label: "Stage Box Input 4", kind: "jack", panelRel: { panel: "stagebox", x: 0.326531, y: 0.347222 } },
    "stagebox-input-5": { label: "Stage Box Input 5", kind: "jack", panelRel: { panel: "stagebox", x: 0.404082, y: 0.347222 } },
    "stagebox-input-6": { label: "Stage Box Input 6", kind: "jack", panelRel: { panel: "stagebox", x: 0.481633, y: 0.347222 } },
    "stagebox-input-14": { label: "Stage Box Input 14", kind: "jack", panelRel: { panel: "stagebox", x: 0.481633, y: 0.694444 } },
    "stagebox-input-9": { label: "Stage Box Input 9", kind: "jack", panelRel: { panel: "stagebox", x: 0.093878, y: 0.694444 } },
    "stagebox-input-10": { label: "Stage Box Input 10", kind: "jack", panelRel: { panel: "stagebox", x: 0.171429, y: 0.694444 } },
    "stagebox-input-11": { label: "Stage Box Input 11", kind: "jack", panelRel: { panel: "stagebox", x: 0.248980, y: 0.694444 } },
    "stagebox-input-12": { label: "Stage Box Input 12", kind: "jack", panelRel: { panel: "stagebox", x: 0.326531, y: 0.694444 } },
    "stagebox-input-13": { label: "Stage Box Input 13", kind: "jack", panelRel: { panel: "stagebox", x: 0.404082, y: 0.694444 } },
    "stagebox-input-15": { label: "Stage Box Input 15", kind: "jack", panelRel: { panel: "stagebox", x: 0.559184, y: 0.694444 } },
    "stagebox-input-16": { label: "Stage Box Input 16", kind: "jack", panelRel: { panel: "stagebox", x: 0.636735, y: 0.694444 } },
    "stagebox-input-7": { label: "Stage Box Input 7", kind: "jack", panelRel: { panel: "stagebox", x: 0.559184, y: 0.347222 } },
    "stagebox-input-8": { label: "Stage Box Input 8", kind: "jack", panelRel: { panel: "stagebox", x: 0.636735, y: 0.347222 } },
    "stagebox-link-out": { label: "Stagebox Link Out", kind: "jack", panelJack: "stagebox.linkOut", ghost: true },

    "foh-main-left": { label: "FOH Main Left", kind: "jack", panelJack: "foh.mainLeft", ghost: true },
    "foh-main-right": { label: "FOH Main Right", kind: "jack", panelJack: "foh.mainRight", ghost: true },
    "main-left-output": { label: "Main Left Output", kind: "jack", panelJack: "foh.mainLeft" },
    "main-right-output": { label: "Main Right Output", kind: "jack", panelJack: "foh.mainRight" },
    "bus-2-output": { label: "Aux 2 Output", kind: "jack", panelJack: "foh.lineOut2" },

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

    "foh-liv007-main-left-output": { label: "Main L Output", kind: "jack", panelRel: { panel: "foh", x: 975 / 1120, y: 134 / 260 } },
    "foh-liv007-main-right-output": { label: "Main R Output", kind: "jack", panelRel: { panel: "foh", x: 1045 / 1120, y: 134 / 260 } },

    "foh-liv006-bus-1-output": { label: "Bus 1/2 Output", kind: "jack", panelRel: { panel: "foh", x: 105 / 1120, y: 134 / 260 }, ghost: true },
    "foh-liv006-bus-2-output": { label: "Bus 2 Output", kind: "jack", panelRel: { panel: "foh", x: 180 / 1120, y: 134 / 260 }, ghost: true },
    "foh-liv006-bus-3-output": { label: "Bus 3 Output", kind: "jack", panelRel: { panel: "foh", x: 255 / 1120, y: 134 / 260 } },
    "foh-liv006-bus-4-output": { label: "Bus 4 Output", kind: "jack", panelRel: { panel: "foh", x: 330 / 1120, y: 134 / 260 }, ghost: true },

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

    "liv007-record-feed-left-input": { label: "Record Feed L", kind: "jack", panelRel: { panel: "iem-record", x: 335 / 900, y: 150 / 240 } },
    "liv007-record-feed-right-input": { label: "Record Feed R", kind: "jack", panelRel: { panel: "iem-record", x: 565 / 900, y: 150 / 240 } },
    "liv007-station-a-feed-left-input": { label: "Station A Feed L", kind: "jack", panelRel: { panel: "iem-station-a", x: 335 / 900, y: 150 / 240 } },
    "liv007-station-a-feed-right-input": { label: "Station A Feed R", kind: "jack", panelRel: { panel: "iem-station-a", x: 565 / 900, y: 150 / 240 } },
    "liv007-station-b-feed-left-input": { label: "Station B Feed L", kind: "jack", panelRel: { panel: "iem-station-b", x: 335 / 900, y: 150 / 240 } },
    "liv007-station-b-feed-right-input": { label: "Station B Feed R", kind: "jack", panelRel: { panel: "iem-station-b", x: 565 / 900, y: 150 / 240 } },
    "liv007-system-amp-left-input": { label: "System Amp L In", kind: "jack", panelRel: { panel: "amp7", x: 260 / 700, y: 168 / 240 } },
    "liv007-system-amp-right-input": { label: "System Amp R In", kind: "jack", panelRel: { panel: "amp7", x: 440 / 700, y: 168 / 240 } },

    "liv006-system-processor-l-input": { label: "Crossover L In", kind: "jack", panelRel: { panel: "amp", x: 94 / 940, y: 146 / 260 } },
    "liv006-system-processor-r-input": { label: "Crossover R In", kind: "jack", panelRel: { panel: "amp", x: 214 / 940, y: 146 / 260 } },
    "liv006-delay-tower-processor-input": { label: "Delay Tower Processor Input", kind: "jack", panelRel: { panel: "amp", x: 470 / 940, y: 146 / 260 } },
    "liv006-sub-processor-input": { label: "Sub Processor Input", kind: "jack", panelRel: { panel: "amp", x: 704 / 940, y: 146 / 260 }, ghost: true },
    "liv006-front-fill-processor-input": { label: "Front Fill Processor Input", kind: "jack", panelRel: { panel: "amp", x: 818 / 940, y: 146 / 260 }, ghost: true },
    "liv011-crossover-l-input": { label: "Crossover L In", kind: "jack", panelRel: { panel: "amp", x: 0.166000, y: 0.615000 } },
    "liv011-crossover-r-input": { label: "Crossover R In", kind: "jack", panelRel: { panel: "amp", x: 0.257000, y: 0.615000 } },
    // LIV-011 v6r240 crossover input jack alignment hotfix.
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

  function isNativePatchLevelId(levelId) {
    return !!LIVE_NATIVE_PATCH_SPECS[String(levelId || "").toUpperCase()];
  }

  function currentNativePatchLevelId() {
    const id = getLevelId();
    return isNativePatchLevelId(id) ? id : "";
  }

  function isNativePatchBoardActive() {
    return !!currentNativePatchLevelId() && !document.querySelector('[data-training-panel], .quiz-panel, .inline-room-build');
  }

  function hardwareAssetFor(kind) {
    if (LEVEL.assetOverrides && LEVEL.assetOverrides[kind]) {
      return sfRepoUrl(LEVEL.assetOverrides[kind]);
    }

    const path = {
      stagebox: "/assets/live-sound/svg/hardware/stagebox-snake-head.svg",
      foh: "/assets/live-sound/svg/hardware/foh-console-io-panel.svg",
      monitor: "/assets/live-sound/svg/hardware/monitor-wedge-input-panel.svg",
      iem: "/assets/live-sound/svg/hardware/iem-wireless-rack-front.svg",
      amp: "/assets/live-sound/svg/hardware/power-amplifier.svg",
      "front-fill-dsp": "/assets/live-sound/svg/hardware/foh-console-io-panel.svg",
      "front-fill-amp": "/assets/live-sound/svg/hardware/power-amp-liv010-low.svg",
      crossover: "/assets/live-sound/svg/hardware/crossover-liv010-3way.svg",
      "amp-high": "/assets/live-sound/svg/hardware/power-amp-liv010-high.svg",
      "amp-mid": "/assets/live-sound/svg/hardware/power-amp-liv010-mid.svg",
      "amp-low": "/assets/live-sound/svg/hardware/power-amp-liv010-low.svg",
      "speaker-left": "/assets/live-sound/svg/hardware/line-array-input-panel-liv010-left.svg",
      "speaker-right": "/assets/live-sound/svg/hardware/line-array-input-panel-liv010-right.svg",
      "pa-visual": "/assets/live-sound/svg/hardware/full-pa-system-line-array-over-subs-renderstyle-standalone.svg"
    }[kind];
    return path ? sfRepoUrl(path) : "";
  }

  function areaOf(el) {
    const r = el.getBoundingClientRect();
    return Math.max(0, r.width * r.height);
  }

  function isUsableNativeBoardSurface(el) {
    if (!el || !el.getBoundingClientRect) return false;
    const r = el.getBoundingClientRect();
    const minWidth = LEVEL_ID === "LIV-020" ? 250 : 650;
    return (
      r.width > minWidth &&
      r.height > 360 &&
      getComputedStyle(el).display !== "none" &&
      !el.classList.contains("level-shell") &&
      !el.classList.contains("game") &&
      !el.classList.contains("panel-scroll")
    );
  }

  function findSurface() {
    const explicitBoardSurface = Array.from(document.querySelectorAll(
      LEVEL_ID === "LIV-028"
        ? "#patchbayWrap, .board-card .patchbay-wrap, .patchbay-wrap, .board-card #patchbay, #patchbay"
        : ".board-card #patchbay, #patchbay, .board-card .patchbay-wrap, .patchbay-wrap"
    ))
      .filter(isUsableNativeBoardSurface)
      .sort((a, b) => {
        const score = el => {
          if (LEVEL_ID === "LIV-028") {
            return (el.id === "patchbayWrap" ? 4 : el.classList.contains("patchbay-wrap") ? 3 : el.id === "patchbay" ? 2 : 1) * 10000000 + areaOf(el);
          }
          return (el.id === "patchbay" ? 3 : el.classList.contains("patchbay-wrap") ? 2 : 1) * 10000000 + areaOf(el);
        };
        return score(b) - score(a);
      })[0];

    if (explicitBoardSurface) {
      console.log("[Signal Flow] Native surface selected:", {
        text: textOf(explicitBoardSurface).slice(0, 90),
        rect: explicitBoardSurface.getBoundingClientRect(),
        selector: explicitBoardSurface.id ? "#" + explicitBoardSurface.id : "." + Array.from(explicitBoardSurface.classList).join(".")
      });
      return explicitBoardSurface;
    }

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
          isUsableNativeBoardSurface(el) &&
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

    const surface = playfield || candidates[0] || null;

    if (!surface) {
      console.warn("[Signal Flow] Native renderer waiting for board surface:", {
        levelId: LEVEL_ID,
        cardClass: card.className,
        cardText: textOf(card).slice(0, 90),
        cardRect
      });
      return null;
    }

    console.log("[Signal Flow] Native surface selected:", {
      text: textOf(surface).slice(0, 90),
      rect: surface.getBoundingClientRect(),
      selector: surface.id ? "#" + surface.id : "." + Array.from(surface.classList).join(".")
    });

    return surface;
  }

  function routeFor(a, b) {
    return LEVEL.validRoutes.find(route =>
      (route.from === a && route.to === b) ||
      (route.from === b && route.to === a)
    ) || null;
  }

  function shouldCommitLiv015InvalidCable(fromKey, toKey) {
    if (LEVEL_ID !== "LIV-015") return false;
    if (!fromKey || !toKey || fromKey === toKey) return false;
    return true;
  }

  function liv028SlugEndpoint(endpoint) {
    return String(endpoint || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function liv028NodeKeyFromEndpoint(endpoint) {
    const slug = liv028SlugEndpoint(endpoint);
    return slug ? "liv028-" + slug : "";
  }

  function liv028ActiveLevelData() {
    try {
      const data =
        (typeof DATA !== "undefined" && DATA) ||
        (window.DATA && window.DATA) ||
        null;
      const levels = data && Array.isArray(data.levels) ? data.levels : [];
      return levels.find(item => item && String(item.id || "").toUpperCase() === "LIV-028") || null;
    } catch (err) {
      return null;
    }
  }

  function liv028ValidRoutesFromData() {
    const liv028 = liv028ActiveLevelData();
    const required = liv028 && Array.isArray(liv028.required) ? liv028.required : [];

    return required
      .map(pair => {
        if (!Array.isArray(pair) || pair.length < 2) return null;
        const fromLabel = String(pair[0] || "").trim();
        const toLabel = String(pair[1] || "").trim();
        const from = liv028NodeKeyFromEndpoint(fromLabel);
        const to = liv028NodeKeyFromEndpoint(toLabel);
        if (!from || !to) return null;
        return {
          key: from + "-to-" + liv028SlugEndpoint(toLabel),
          from,
          to,
          checklist: fromLabel + " → " + toLabel,
          liv028FromEndpoint: fromLabel,
          liv028ToEndpoint: toLabel
        };
      })
      .filter(Boolean);
  }

  function syncLiv028ValidRoutesFromData() {
    if (LEVEL_ID !== "LIV-028") return;
    const routes = liv028ValidRoutesFromData();
    if (!routes.length) return;
    LEVEL.validRoutes = routes;
  }

  function liv028EndpointLabelForNodeKey(key) {
    const liv028 = liv028ActiveLevelData();
    const nodes = liv028 && Array.isArray(liv028.nodes) ? liv028.nodes : [];
    const nodeKey = String(key || "");
    return nodes.find(label => liv028NodeKeyFromEndpoint(label) === nodeKey) || nodeKey;
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

    const layoutHeight = LEVEL_ID === "LIV-006"
      ? Math.min(Math.max(rect.height, 1), 640)
      : LEVEL_ID === "LIV-011"
        ? Math.max(820, Math.min(Math.max(rect.height, 1) * 1.45, 980))
        : LEVEL_ID === "LIV-028"
          ? Math.max(760, Math.min(Math.max(rect.height, 1) * 1.25, 900))
          : Math.min(rect.height, 640);
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
    const isBroadcastBoard = LEVEL_ID === "LIV-007";
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
        x: rect.width * ((isDelayTowerBoard || isBroadcastBoard) ? 0.055 : (isStereoIemBoard ? 0.06 : (liv ? liv.foh.x : 0.39))),
        y: layoutHeight * (isDelayTowerBoard ? 0.105 : (isBroadcastBoard ? 0.105 : (isStereoIemBoard ? 0.18 : (liv ? liv.foh.y : 0.15)))),
        width: rect.width * ((isDelayTowerBoard || isBroadcastBoard) ? 0.89 : (isStereoIemBoard ? 0.88 : (liv ? liv.foh.width : 0.55)))
      },
      {
        id: "amp",
        kind: "amp",
        x: rect.width * (isDelayTowerBoard ? 0.075 : 0.22),
        y: layoutHeight * (isDelayTowerBoard ? 0.575 : 0.58),
        width: rect.width * (isDelayTowerBoard ? 0.88 : 0.60)
      }
    ];

    // LIV-011 v6r239 spacious layout: keep source/stagebox, FOH, and crossover in distinct zones.
    if (LEVEL_ID === "LIV-011") {
      defaultPanels.splice(0, defaultPanels.length,
        {
          id: "stagebox",
          kind: "stagebox",
          x: rect.width * 0.055,
          y: layoutHeight * 0.310,
          width: rect.width * 0.410
        },
        {
          id: "foh",
          kind: "foh",
          x: rect.width * 0.410,
          y: layoutHeight * 0.085,
          width: rect.width * 0.555
        },
        {
          id: "amp",
          kind: "amp",
          x: rect.width * 0.385,
          // LIV-011 v6r302: move crossover 250px upward from previous placement.
          y: Math.max(12, layoutHeight * 0.615 - 250),
          width: rect.width * 0.570
        }
      );
    }

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
    if (LEVEL_ID === "LIV-007") {
      manifestPanels.push(
        {
          id: "iem-record",
          kind: "iem-record",
          x: rect.width * 0.060,
          y: layoutHeight * 0.485,
          width: rect.width * 0.390
        },
        {
          id: "iem-station-a",
          kind: "iem-station-a",
          x: rect.width * 0.535,
          y: layoutHeight * 0.485,
          width: rect.width * 0.390
        },
        {
          id: "iem-station-b",
          kind: "iem-station-b",
          x: rect.width * 0.060,
          y: layoutHeight * 0.695,
          width: rect.width * 0.390
        },
        {
          id: "amp7",
          kind: "amp7",
          x: rect.width * 0.535,
          y: layoutHeight * 0.705,
          width: rect.width * 0.390
        }
      );
    }

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

    // LIV-011 v6r239 source endpoints: match the visible source buttons.
    if (LEVEL_ID === "LIV-011") {
      const sourceIndex = {
        "lead-vocal-mic": 0,
        "keys-left-di": 1,
        "keys-right-di": 2
      };
      if (Object.prototype.hasOwnProperty.call(sourceIndex, key)) {
        return {
          x: level.rect.width * 0.06 + 85,
          y: level.rect.height * (0.12 + sourceIndex[key] * 0.06) + 23
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

    if (LEVEL_ID === "LIV-025" || LEVEL_ID === "LIV-026") {
      const liv025Rel = {
        "bus-1-output": { panel: "foh", x: 100 / 1120, y: 132 / 260 },
        "bus-2-output": { panel: "foh", x: (LEVEL_ID === "LIV-025" ? 174 : 458) / 1120, y: (LEVEL_ID === "LIV-025" ? 134 : 140) / 260 },
        "aux-2-output": { panel: "foh", x: 458 / 1120, y: 140 / 260 },
        "aux-3-output": { panel: "foh", x: 498 / 1120, y: 140 / 260 },
        "foh-line-out-1": { panel: "foh", x: 418 / 1120, y: 140 / 260 },
        "foh-line-out-3": { panel: "foh", x: 498 / 1120, y: 140 / 260 },
        "foh-line-out-4": { panel: "foh", x: 538 / 1120, y: 140 / 260 },
        "main-left-output": { panel: "foh", x: 975 / 1120, y: 134 / 260 },
        "main-right-output": { panel: "foh", x: 1045 / 1120, y: 134 / 260 },
        "system-processor-left-in": { panel: "amp", x: 94 / 940, y: 146 / 260 },
        "system-processor-right-in": { panel: "amp", x: 214 / 940, y: 146 / 260 },
        "delay-tower-processing-input": { panel: "amp", x: 470 / 940, y: 146 / 260 },
        "sub-processor-input": { panel: "amp", x: 704 / 940, y: 146 / 260 },
        "front-fill-processor-input": { panel: "amp", x: 470 / 940, y: 154 / 260 },
        "front-fill-processor-output": { panel: "amp", x: 600 / 940, y: 154 / 260 },
        "front-fill-amp-input": { panel: "amp", x: 704 / 940, y: 154 / 260 },
        "processor-output-a": { panel: "amp", x: 818 / 940, y: 146 / 260 },
        "processor-output-b": { panel: "amp", x: 890 / 940, y: 146 / 260 }
      }[key];

      if (liv025Rel) {
        const panel = (level.panels || []).find(item => item.id === liv025Rel.panel || item.kind === liv025Rel.panel);
        if (panel) {
          const panelAspect = {
            foh: 260 / 1120,
            amp: 260 / 940
          }[panel.kind] || 0.25;

          return {
            x: panel.x + panel.width * liv025Rel.x,
            y: panel.y + panel.width * panelAspect * liv025Rel.y
          };
        }
      }
    }

    // LIV-002 uses asset-specific SVG hardware centers.
    // Keep this level-specific so later boards that use different stagebox/console
    // artwork do not inherit these coordinates.
    if (LEVEL_ID === "LIV-002" || LEVEL_ID === "LIV-012") {
      const liv002Rel = {
        "stagebox-input-1": { panel: "stagebox", x: 130 / 860, y: 135 / 260 },
        "stagebox-input-2": { panel: "stagebox", x: 202 / 860, y: 135 / 260 },
        "stagebox-input-3": { panel: "stagebox", x: 274 / 860, y: 135 / 260 },
        "stagebox-input-4": { panel: "stagebox", x: 346 / 860, y: 135 / 260 },
        "stagebox-input-5": { panel: "stagebox", x: 418 / 860, y: 135 / 260 },
        "stagebox-input-6": { panel: "stagebox", x: 490 / 860, y: 135 / 260 },
        "stagebox-input-7": { panel: "stagebox", x: 562 / 860, y: 135 / 260 },
        "stagebox-input-8": { panel: "stagebox", x: 634 / 860, y: 135 / 260 },
        "stagebox-link-out": { panel: "stagebox", x: 775 / 860, y: 135 / 260 },

        "foh-aux-1-output": { panel: "foh", x: 715 / 1120, y: 134 / 260 },
        "aux-2-output": { panel: "foh", x: 770 / 1120, y: 134 / 260 },
        "aux-3-output": { panel: "foh", x: 825 / 1120, y: 134 / 260 },
        "talkback-output": { panel: "foh", x: 880 / 1120, y: 134 / 260 },
        "main-left-output": { panel: "foh", x: 975 / 1120, y: 134 / 260 },
        "main-right-output": { panel: "foh", x: 1045 / 1120, y: 134 / 260 },

        "vocal-wedge-input": { panel: "monitor", x: 150 / 850, y: 130 / 240 },
        "vocal-wedge-thru": { panel: "monitor", x: 315 / 850, y: 130 / 240 },
        "vocal-wedge-aux-in": { panel: "monitor", x: 470 / 850, y: 130 / 240 }
      }[key];

      if (liv002Rel) {
        const panel = (level.panels || []).find(item => item.id === liv002Rel.panel || item.kind === liv002Rel.panel);
        if (panel) {
          const panelAspect = {
            stagebox: 260 / 860,
            foh: 260 / 1120,
            monitor: 240 / 850
          }[panel.kind] || 0.25;

          return {
            x: panel.x + panel.width * liv002Rel.x,
            y: panel.y + panel.width * panelAspect * liv002Rel.y
          };
        }
      }
    }

    if (def.panelRel) {
      const panel = (level.panels || []).find(item => item.id === def.panelRel.panel || item.kind === def.panelRel.panel);
      if (panel) {
        const panelAspect = {
          // LIV-015 renders the 980x360 AES stagebox asset; using the older
          // 860x260 stagebox aspect pulls clickable targets above the jacks.
          stagebox: (["LIV-011", "LIV-015", "LIV-025", "LIV-026"].includes(LEVEL_ID) ? 360 / 980 : 260 / 860),
          foh: 260 / 1120,
          monitor: 240 / 850,
          iem: 240 / 900,
          "iem-record": 240 / 900,
          "iem-station-a": 240 / 900,
          "iem-station-b": 240 / 900,
          amp7: 240 / 700,
          paamp: 240 / 700,
          amp: 260 / 940,
          crossover: 250 / 940,
          "amp-high": 240 / 940,
          "amp-mid": 240 / 940,
          "amp-low": 240 / 940,
          "speaker-left": 620 / 260,
          "speaker-right": 620 / 260,
          "pa-visual": 870 / 857
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
    if (LEVEL_ID === "LIV-029") {
      const liv029Bends = {
        "liv029-rx-ch1-to-console-input-1": -28,
        "liv029-rx-ch2-to-console-input-2": -14,
        "liv029-rx-ch3-to-console-input-3": 14,
        "liv029-rx-ch4-to-console-input-4": 28,
        "liv029-main-l-to-pa-l-input": 92,
        "liv029-main-r-to-pa-r-input": 116,
        "liv029-pa-l-output-to-left-speaker": -18,
        "liv029-pa-r-output-to-right-speaker": 24,
        "liv029-record-l-to-press-l": 118,
        "liv029-record-r-to-press-r": 142,
        "liv029-aux-1-to-moderator-wedge": 88
      };
      if (Object.prototype.hasOwnProperty.call(liv029Bends, routeKey)) {
        return liv029Bends[routeKey];
      }
      if (String(routeKey || "").startsWith("invalid:")) {
        return -72;
      }
    }
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
      "z-index:2147483600",
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


  function sfNativeFinitePoint(point) {
    return point &&
      Number.isFinite(Number(point.x)) &&
      Number.isFinite(Number(point.y));
  }

  function sfNativeRouteEndpointKeys(route) {
    const from =
      route.from ||
      route.fromKey ||
      route.source ||
      route.sourceKey ||
      route.start ||
      route.startKey ||
      null;

    const to =
      route.to ||
      route.toKey ||
      route.dest ||
      route.destKey ||
      route.target ||
      route.targetKey ||
      null;

    if (from && to) return { from, to };

    const key = String(route.key || "");
    if (key.startsWith("invalid:") && key.includes("--")) {
      const parts = key.slice("invalid:".length).split("--");
      if (parts[0] && parts[1]) return { from: parts[0], to: parts[1] };
    }

    const marker = "-to-";
    const idx = key.indexOf(marker);
    if (idx > 0) {
      return {
        from: key.slice(0, idx),
        to: key.slice(idx + marker.length)
      };
    }

    return { from, to };
  }

  function sfNativeCablePointFromNode(layer, nodeKey, fallbackPoint) {
    if (!layer || !nodeKey) {
      return sfNativeFinitePoint(fallbackPoint) ? fallbackPoint : null;
    }

    if (isLiv019NativeLayer(layer)) {
      const livePoint = liv019CablePointFor(layer, nodeKey, null);
      if (sfNativeFinitePoint(livePoint)) return livePoint;
    }

    const el = layer.querySelector('[data-node-key="' + nodeKey + '"]');
    if (!el) {
      return sfNativeFinitePoint(fallbackPoint) ? fallbackPoint : null;
    }

    const dataX = Number(el.dataset.sfCableCenterX || el.dataset.centerX || el.dataset.x);
    const dataY = Number(el.dataset.sfCableCenterY || el.dataset.centerY || el.dataset.y);
    if (Number.isFinite(dataX) && Number.isFinite(dataY)) {
      return { x: dataX, y: dataY };
    }

    const layerRect = layer.getBoundingClientRect();
    const r = el.getBoundingClientRect();

    const x = r.left - layerRect.left + r.width / 2;
    const y = r.top - layerRect.top + r.height / 2;

    if (Number.isFinite(x) && Number.isFinite(y)) {
      return { x, y };
    }

    return sfNativeFinitePoint(fallbackPoint) ? fallbackPoint : null;
  }

  function drawCable(layer, route) {
    const svg = getCableSvg(layer);
    const endpointKeys = sfNativeRouteEndpointKeys(route);
    const fromPoint = sfNativeCablePointFromNode(layer, endpointKeys.from, route.fromPoint);
    const toPoint = sfNativeCablePointFromNode(layer, endpointKeys.to, route.toPoint);
    const isLiv029Layer = !!(layer && layer.classList && layer.classList.contains("sf-live-native-level-liv-029"));

    if (!sfNativeFinitePoint(fromPoint) || !sfNativeFinitePoint(toPoint)) {
      console.warn("[Signal Flow] Native cable skipped invalid points", {
        routeKey: route && route.key,
        endpointKeys,
        fromPoint,
        toPoint,
        originalFromPoint: route && route.fromPoint,
        originalToPoint: route && route.toPoint
      });
      return;
    }

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.dataset.routeKey = route.key;
    group.dataset.from = JSON.stringify(fromPoint);
    group.dataset.to = JSON.stringify(toPoint);
    group.dataset.bend = String(route.bend || 0);

    const color = route.valid ? "#55e36f" : "#ff4f4f";
    const glow = route.valid ? "rgba(85,227,111,.56)" : "rgba(255,79,79,.58)";

    const shadow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    shadow.classList.add("sf-cable-shadow");
    shadow.setAttribute("fill", "none");
    shadow.setAttribute("stroke", "rgba(0,0,0,.62)");
    shadow.setAttribute("stroke-width", isLiv029Layer ? "7" : "10");
    shadow.setAttribute("stroke-linecap", "round");
    shadow.setAttribute("d", cableD(fromPoint, toPoint, route.bend || 0));
    group.appendChild(shadow);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.classList.add("sf-cable-line");
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", isLiv029Layer ? "4" : "5");
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("opacity", isLiv029Layer ? "0.88" : "0.96");
    line.setAttribute("d", cableD(fromPoint, toPoint, route.bend || 0));
    line.style.filter = "drop-shadow(0 0 " + (isLiv029Layer ? "7px " : "10px ") + glow + ")";
    group.appendChild(line);

    [fromPoint, toPoint].forEach(point => {
      const dotShadow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dotShadow.setAttribute("cx", point.x);
      dotShadow.setAttribute("cy", point.y);
      dotShadow.setAttribute("r", isLiv029Layer ? "5.5" : "7");
      dotShadow.setAttribute("fill", "rgba(0,0,0,.62)");
      group.appendChild(dotShadow);

      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", point.x);
      dot.setAttribute("cy", point.y);
      dot.setAttribute("r", isLiv029Layer ? "4" : "5");
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

    state.routes.forEach(route => {
      refreshNativeCableRoutePoints(layer, route);
      drawCable(layer, route);
    });

    const svg = layer.querySelector(".sf-native-cables");
    if (svg && svg.parentNode) {
      svg.dataset.sfNativeCableLayer = "top-board-layer";
      svg.style.setProperty("z-index", "2147483600", "important");
      svg.style.setProperty("display", "block", "important");
      svg.style.setProperty("visibility", "visible", "important");
      svg.style.setProperty("opacity", "1", "important");
      svg.style.setProperty("pointer-events", "none", "important");
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

  // LIV-011 v6r241 native SFX latency fix: preload/decode and pool route feedback sounds.
  const NATIVE_SFX_SOURCES = [
    "/assets/audio/sfx/SFcoin(81).wav",
    "/assets/audio/sfx/wrong_patch_blip(51).mp3"
  ];
  const NATIVE_SFX_POOL_SIZE = 4;
  const nativeSfxBuffers = window.__sfLiveNativeSfxBuffers || (window.__sfLiveNativeSfxBuffers = Object.create(null));
  const nativeSfxPromises = window.__sfLiveNativeSfxPromises || (window.__sfLiveNativeSfxPromises = Object.create(null));
  const nativeSfxPools = window.__sfLiveNativeSfxPools || (window.__sfLiveNativeSfxPools = Object.create(null));

  function loadNativeSfxBuffer(src) {
    try {
      if (nativeSfxBuffers[src]) return Promise.resolve(nativeSfxBuffers[src]);
      if (nativeSfxPromises[src]) return nativeSfxPromises[src];

      const ctx = getNativeAudioContext();
      if (!ctx || !window.fetch) return Promise.resolve(null);

      nativeSfxPromises[src] = fetch(src)
        .then(resp => {
          if (!resp.ok) throw new Error("SFX preload failed " + resp.status + " " + src);
          return resp.arrayBuffer();
        })
        .then(data => ctx.decodeAudioData(data))
        .then(buffer => {
          nativeSfxBuffers[src] = buffer;
          return buffer;
        })
        .catch(err => {
          console.warn("[Signal Flow] Native SFX preload failed:", src, err);
          nativeSfxPromises[src] = null;
          return null;
        });

      return nativeSfxPromises[src];
    } catch (err) {
      return Promise.resolve(null);
    }
  }

  function getNativeSfxPool(src) {
    if (!nativeSfxPools[src]) {
      nativeSfxPools[src] = [];
      for (let i = 0; i < NATIVE_SFX_POOL_SIZE; i += 1) {
        const audio = new Audio(src);
        audio.preload = "auto";
        audio.load();
        nativeSfxPools[src].push(audio);
      }
    }
    return nativeSfxPools[src];
  }

  function primeNativeSfx() {
    NATIVE_SFX_SOURCES.forEach(src => {
      loadNativeSfxBuffer(src);
      getNativeSfxPool(src);
    });
  }

  function playNativeSfxBuffer(src, volume) {
    try {
      const ctx = getNativeAudioContext();
      const buffer = nativeSfxBuffers[src];
      if (!ctx || !buffer) return false;

      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = buffer;
      gain.gain.setValueAtTime(volume == null ? 0.75 : volume, ctx.currentTime);
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(ctx.currentTime);
      return true;
    } catch (err) {
      return false;
    }
  }

  try {
    if (!window.__sfLiveNativeSfxPrimeInstalled) {
      window.__sfLiveNativeSfxPrimeInstalled = true;
      window.addEventListener("pointerdown", primeNativeSfx, { capture: true, passive: true });
      window.addEventListener("keydown", primeNativeSfx, { capture: true, passive: true });
      setTimeout(primeNativeSfx, 0);
    }
  } catch (err) {}

  function playNativeSfx(src, volume, delay) {
    try {
      const play = () => {
        if (playNativeSfxBuffer(src, volume)) return;

        loadNativeSfxBuffer(src);
        const pool = getNativeSfxPool(src);
        const audio = pool.find(item => item.paused || item.ended) || pool[0].cloneNode(true);
        audio.volume = volume == null ? 0.75 : volume;
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (err) {}

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

  function markChecklistForCompletedRoute(validRoute) {
    if (!validRoute) return;

    if ((LEVEL_ID === "LIV-016" || LEVEL_ID === "LIV-029") && validRoute.stereoGroup) {
      const groupRoutes = LEVEL.validRoutes.filter(route => route.stereoGroup === validRoute.stereoGroup);
      const groupComplete = groupRoutes.every(route => state.completedValidKeys.has(route.key));

      if (!groupComplete) return;

      groupRoutes.forEach(route => markChecklist(route.key));
      return;
    }

    markChecklist(validRoute.key);
  }

  function setSelected(node, selected) {
    node.el.style.boxShadow = selected
      ? "0 0 0 3px rgba(111,208,255,.95), 0 0 20px rgba(111,208,255,.55)"
      : node.defaultShadow;
  }

  function clearSelection() {
    if (selectedNode) setSelected(selectedNode, false);
    selectedNode = null;
    const activeLiv020Layer = document.querySelector(".sf-live-native-level-liv-020");
    sfLiv020UpdateBadJackAvailability(activeLiv020Layer, "");
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
      "width:min(500px, calc(100vw - 40px))",
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
      "margin-bottom:14px",
      "color:#f7ead0"
    ].join(";");

    const ledgerSummary = nativeCompletionLedgerSummaryMarkup(LEVEL_ID);
    const summary = document.createElement("div");
    summary.className = "sf-native-completion-ledger-summary";
    summary.style.cssText = [
      "margin:0 0 18px",
      "padding:12px",
      "border-radius:14px",
      "border:1px solid rgba(255,215,106,.36)",
      "background:linear-gradient(180deg, rgba(255,215,106,.14), rgba(0,0,0,.18))",
      "box-shadow:0 0 18px rgba(255,215,106,.12) inset",
      "text-align:left"
    ].join(";");
    summary.innerHTML = [
      '<div style="font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#ffe66c;margin-bottom:8px;">Run Update</div>',
      '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;">',
      '<div style="padding:8px 9px;border-radius:10px;background:rgba(0,0,0,.24);border:1px solid rgba(255,255,255,.10);"><span style="display:block;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,247,209,.72);margin-bottom:3px;">Score</span><strong style="display:block;font-size:18px;color:#9effb6;font-weight:950;">' + ledgerSummary.scoreText + '</strong></div>',
      '<div style="padding:8px 9px;border-radius:10px;background:rgba(0,0,0,.24);border:1px solid rgba(255,255,255,.10);"><span style="display:block;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,247,209,.72);margin-bottom:3px;">Credits</span><strong style="display:block;font-size:18px;color:#9effb6;font-weight:950;">' + ledgerSummary.creditText + '</strong></div>',
      '<div style="padding:8px 9px;border-radius:10px;background:rgba(0,0,0,.24);border:1px solid rgba(255,255,255,.10);"><span style="display:block;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,247,209,.72);margin-bottom:3px;">Budget</span><strong style="display:block;font-size:18px;color:#9effb6;font-weight:950;">' + ledgerSummary.availableText + '</strong></div>',
      '</div>'
    ].join('');

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
    card.appendChild(summary);
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
    const ledgerScore = getNativeLedgerScore();
    const score = ledgerScore != null ? ledgerScore : state.completedValidKeys.size * 100;

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

  function liv018CablePointFor(key, fallback) {
    if (LEVEL_ID !== "LIV-018") return fallback;

    const anchors = {
      "talkback-mic": { x: 150, y: 54 },
      "lead-vocal-mic": { x: 142, y: 278 },
      "keys-left-di": { x: 211, y: 527 },
      "keys-right-di": { x: 285, y: 529 }
    };

    return anchors[key] || fallback;
  }

  function isLiv019NativeLayer(layer) {
    return !!(layer && (LEVEL_ID === "LIV-019" || layer.classList.contains("sf-live-native-level-liv-019")));
  }

  function liv019NodeKeyFromElement(el) {
    if (!el || !el.dataset) return "";
    return el.dataset.nodeKey || el.dataset.sfNativeKey || el.dataset.key || "";
  }

  function liv019ElementCenterInLayer(layer, el) {
    if (!layer || !el || !layer.contains(el)) return null;

    const rect = el.getBoundingClientRect();
    const layerRect = layer.getBoundingClientRect();
    const style = window.getComputedStyle ? window.getComputedStyle(el) : null;

    if (!rect.width || !rect.height) return null;
    if (style && (style.display === "none" || style.visibility === "hidden")) return null;

    return {
      x: rect.left - layerRect.left + rect.width / 2,
      y: rect.top - layerRect.top + rect.height / 2
    };
  }

  function liv019CablePointFor(layer, key, fallback) {
    if (!isLiv019NativeLayer(layer) || !key) return fallback;

    const matches = Array.from(layer.querySelectorAll("[data-node-key], [data-key]")).filter(el => {
      if (liv019NodeKeyFromElement(el) !== key) return false;
      if (el.closest(".sf-native-liv019-source-panel") || el.closest(".sf-native-liv009-source-panel")) return false;
      return !!liv019ElementCenterInLayer(layer, el);
    });

    const node = matches.find(el => el.classList && el.classList.contains("sf-native-node")) || matches[0];
    return liv019ElementCenterInLayer(layer, node) || fallback;
  }

  function nativeCablePointForRouteNode(layer, node) {
    if (!node) return { x: 0, y: 0 };
    const fallback = node.point || { x: 0, y: 0 };
    if (isLiv019NativeLayer(layer)) return liv019CablePointFor(layer, node.key, fallback);
    return liv018CablePointFor(node.key, fallback);
  }

  function refreshNativeCableRoutePoints(layer, route) {
    if (!route) return;
    if (!isLiv019NativeLayer(layer)) return;
    route.fromPoint = liv019CablePointFor(layer, route.from, route.fromPoint);
    route.toPoint = liv019CablePointFor(layer, route.to, route.toPoint);
  }


  function sfLiv020IsRealNodeKey(key) {
    return (
      LEVEL_ID === "LIV-020" &&
      typeof key === "string" &&
      Array.isArray(LEVEL.generatedJackKeys) &&
      LEVEL.generatedJackKeys.includes(key)
    );
  }

  function sfLiv020IsBadNodeKey(key) {
    return (
      LEVEL_ID === "LIV-020" &&
      typeof key === "string" &&
      key.startsWith("liv020-bad-")
    );
  }

  function sfLiv020FalseJackFromNode(node) {
    if (LEVEL_ID !== "LIV-020" || !node || !node.el || !node.el.dataset) return null;
    if (!sfLiv020IsBadNodeKey(node.key)) return null;

    return {
      key: node.key,
      label: node.el.dataset.label || node.key
    };
  }

  function sfLiv020IsOutputKey(key) {
    return sfLiv020IsRealNodeKey(key) && key.includes("-output");
  }

  function sfLiv020IsInputKey(key) {
    return sfLiv020IsRealNodeKey(key) && key.includes("-input");
  }

  function sfLiv020NormalizeOutputInputPair(aKey, bKey) {
    if (sfLiv020IsOutputKey(aKey) && sfLiv020IsInputKey(bKey)) {
      return { fromKey: aKey, toKey: bKey };
    }

    if (sfLiv020IsInputKey(aKey) && sfLiv020IsOutputKey(bKey)) {
      return { fromKey: bKey, toKey: aKey };
    }

    return null;
  }

  function sfLiv020PairKey(fromKey, toKey) {
    return fromKey + "-to-" + toKey;
  }

  function getLiveSoundPuzzleSpec(board, levelId) {
    const source = board || LEVEL;
    if (!source || !source.puzzle || typeof source.puzzle !== "object") return null;
    if (source.id && levelId && source.id !== levelId) return null;
    return source.puzzle;
  }

  function liveSoundPuzzlePairKey(fromKey, toKey) {
    return String(fromKey || "") + "->" + String(toKey || "");
  }

  function liveSoundPuzzleEndpointType(key) {
    key = String(key || "").toLowerCase();
    if (key.includes("antenna") || key.includes("rf-")) return "rf-output";
    if (key.includes("speaker") || key.includes("thru") || key.includes("amp") && key.includes("output")) return "speaker-output";
    if (key.includes("main") && key.includes("output")) return "main-output";
    if (key.includes("input") || key.includes("recorder")) return "line-input";
    if (key.includes("output") || key.includes("out")) return "line-output";
    return "endpoint";
  }

  function resolveLiveSoundPuzzleFeedback(puzzle, fromKey, toKey) {
    if (!puzzle || typeof puzzle !== "object") return "";
    const a = String(fromKey || "");
    const b = String(toKey || "");
    const directKey = liveSoundPuzzlePairKey(a, b);
    const reverseKey = liveSoundPuzzlePairKey(b, a);
    const feedback = puzzle.educationalFeedback || {};

    const traps = Array.isArray(puzzle.trapRoutes) ? puzzle.trapRoutes : [];
    const exactTrap = traps.find(trap =>
      trap &&
      (
        (trap.from === a && trap.to === b) ||
        (trap.from === b && trap.to === a)
      )
    );
    if (exactTrap && exactTrap.message) return exactTrap.message;

    if (feedback.routePairs && typeof feedback.routePairs === "object") {
      if (feedback.routePairs[directKey]) return feedback.routePairs[directKey];
      if (feedback.routePairs[reverseKey]) return feedback.routePairs[reverseKey];
    }

    if (exactTrap && exactTrap.concept && feedback.concepts && feedback.concepts[exactTrap.concept]) {
      return feedback.concepts[exactTrap.concept];
    }

    if (feedback.endpointTypes && typeof feedback.endpointTypes === "object") {
      const directType = liveSoundPuzzleEndpointType(a) + "->" + liveSoundPuzzleEndpointType(b);
      const reverseType = liveSoundPuzzleEndpointType(b) + "->" + liveSoundPuzzleEndpointType(a);
      if (feedback.endpointTypes[directType]) return feedback.endpointTypes[directType];
      if (feedback.endpointTypes[reverseType]) return feedback.endpointTypes[reverseType];
    }

    return typeof feedback.defaultWrongRoute === "string" ? feedback.defaultWrongRoute : "";
  }

  function showLiveSoundEducationalFeedback(message) {
    if (!message) return;

    let toast = document.querySelector(".sf-liv029-educational-feedback");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "sf-live-sound-educational-feedback sf-liv029-educational-feedback";
      toast.style.cssText = [
        "position:fixed",
        "left:50%",
        "bottom:22px",
        "transform:translateX(-50%)",
        "max-width:min(560px, calc(100vw - 28px))",
        "padding:12px 15px",
        "border-radius:10px",
        "border:1px solid rgba(255,118,92,.55)",
        "background:linear-gradient(180deg, rgba(52,20,16,.98), rgba(20,12,10,.98))",
        "box-shadow:0 18px 42px rgba(0,0,0,.46), 0 0 18px rgba(255,118,92,.20)",
        "color:#ffe9d8",
        "font:800 13px/1.35 system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
        "letter-spacing:0",
        "z-index:2147483200",
        "pointer-events:none",
        "opacity:0",
        "transition:opacity .18s ease"
      ].join(";");
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = "1";
    clearTimeout(toast._sfLiv029FeedbackTimer);
    toast._sfLiv029FeedbackTimer = setTimeout(() => {
      toast.style.opacity = "0";
    }, 3400);
  }

  function isLiveSoundPuzzleHintExcluded(puzzle, btn) {
    if (!puzzle || !btn || !btn.dataset) return false;
    return btn.dataset.sfNativeFalseJack === "1" || btn.dataset.sfNativeHintable === "0";
  }

  function sfLiv020FalseRoutePair(fromNode, toNode) {
    if (LEVEL_ID !== "LIV-020" || LEVEL_ID === "LIV-021") return null;

    const fromKey = fromNode && fromNode.key;
    const toKey = toNode && toNode.key;
    const fromFalse = sfLiv020FalseJackFromNode(fromNode);
    const toFalse = sfLiv020FalseJackFromNode(toNode);

    if (fromFalse && sfLiv020IsRealNodeKey(toKey)) {
      return {
        fromKey,
        toKey,
        key: sfLiv020PairKey(toKey, fromKey)
      };
    }

    if (toFalse && sfLiv020IsRealNodeKey(fromKey)) {
      return {
        fromKey,
        toKey,
        key: sfLiv020PairKey(fromKey, toKey)
      };
    }

    return null;
  }

  function sfLiv020IsCuratedBadPair(aKey, bKey) {
    if (LEVEL_ID !== "LIV-020" || LEVEL_ID === "LIV-021") return false;
    if (!Array.isArray(LIV020_BAD_ROUTE_PAIRS)) return false;

    if (LEVEL_ID === "LIV-025") {
      const a = String(fromNode && fromNode.key || "");
      const b = String(toNode && toNode.key || "");
      if (a !== b && (a.startsWith("liv025-false-") || b.startsWith("liv025-false-"))) {
        return {
          allowed: true,
          valid: false,
          key: "invalid:" + [a, b].sort().join("--"),
          from: a,
          to: b
        };
      }
    }

    const pair = sfLiv020NormalizeOutputInputPair(aKey, bKey);
    if (!pair) return false;

    return LIV020_BAD_ROUTE_PAIRS.some(item =>
      item &&
      item[0] === pair.fromKey &&
      item[1] === pair.toKey
    );
  }

	  function sfLiv020RouteDecision(fromNode, toNode, baseValid, baseKey) {
	    if (LEVEL_ID === "LIV-023") {
	      const fromKey = fromNode && fromNode.key;
	      const toKey = toNode && toNode.key;
	      const fromLiv023 = String(fromKey || "").startsWith("liv023-");
	      const toLiv023 = String(toKey || "").startsWith("liv023-");

	      if (baseValid) {
	        return {
	          allowed: true,
	          valid: true,
	          key: baseKey,
	          from: fromKey,
	          to: toKey
	        };
	      }

	      if (fromKey && toKey && fromKey !== toKey && fromLiv023 && toLiv023) {
	        return {
	          allowed: true,
	          valid: false,
	          key: baseKey,
	          from: fromKey,
	          to: toKey
	        };
	      }

	      return {
	        allowed: false,
	        valid: false,
	        key: baseKey,
	        from: fromKey,
	        to: toKey
	      };
	    }

	    if (LEVEL_ID !== "LIV-020" || LEVEL_ID === "LIV-021") {
	      return {
	        allowed: baseValid,
	        valid: baseValid,
	        key: baseKey,
        from: fromNode && fromNode.key,
        to: toNode && toNode.key
      };
    }

    const falseRoutePair = sfLiv020FalseRoutePair(fromNode, toNode);
    if (falseRoutePair) {
      return {
        allowed: true,
        valid: false,
        key: falseRoutePair.key,
        from: falseRoutePair.fromKey,
        to: falseRoutePair.toKey
      };
    }

    const pair = sfLiv020NormalizeOutputInputPair(
      fromNode && fromNode.key,
      toNode && toNode.key
    );

    if (!pair) {
      return {
        allowed: baseValid,
        valid: baseValid,
        key: baseKey,
        from: fromNode && fromNode.key,
        to: toNode && toNode.key
      };
    }

    const normalizedKey = sfLiv020PairKey(pair.fromKey, pair.toKey);

    if (baseValid) {
      return {
        allowed: true,
        valid: true,
        key: normalizedKey,
        from: pair.fromKey,
        to: pair.toKey
      };
    }

    if (sfLiv020IsCuratedBadPair(pair.fromKey, pair.toKey)) {
      return {
        allowed: true,
        valid: false,
        key: normalizedKey,
        from: pair.fromKey,
        to: pair.toKey
      };
    }

    if (LEVEL_ID === "LIV-021" && (
      String(pair.fromKey).startsWith("liv021-false-") ||
      String(pair.toKey).startsWith("liv021-false-")
    )) {
      return {
        allowed: true,
        valid: false,
        key: normalizedKey,
        from: pair.fromKey,
        to: pair.toKey
      };
    }

    if (LEVEL_ID === "LIV-021") {
      const a = String(pair.fromKey || "");
      const b = String(pair.toKey || "");
      const isLiv021Node = key => key === "lead-vocal-mic" || key.startsWith("liv021-");
      if (a !== b && isLiv021Node(a) && isLiv021Node(b)) {
        return {
          allowed: true,
          valid: false,
          key: normalizedKey,
          from: pair.fromKey,
          to: pair.toKey
        };
      }
    }

    return {
      allowed: false,
      valid: false,
      key: normalizedKey,
      from: pair.fromKey,
      to: pair.toKey
    };
  }

  function addRoute(layer, fromNode, toNode) {
    const baseValid = routeFor(fromNode.key, toNode.key);
    const baseKey = baseValid
      ? baseValid.key
      : "invalid:" + [fromNode.key, toNode.key].sort().join("--");

    const decision = sfLiv020RouteDecision(fromNode, toNode, !!baseValid, baseKey);

    if (!decision.allowed && LEVEL_ID === "LIV-025") {
      const a = String(fromNode && fromNode.key || "");
      const b = String(toNode && toNode.key || "");
      if (a !== b && (a.startsWith("liv025-false-") || b.startsWith("liv025-false-"))) {
        decision.allowed = true;
        decision.valid = false;
        decision.key = "invalid:" + [a, b].sort().join("--");
        decision.from = a;
        decision.to = b;
      }
    }

    if (!decision.allowed) {
      const liv021Selectable = key => {
        key = String(key || "");
        return key === "lead-vocal-mic" || key.startsWith("liv021-");
      };

      if (LEVEL_ID === "LIV-021" && fromNode.key !== toNode.key && liv021Selectable(fromNode.key) && liv021Selectable(toNode.key)) {
        decision.allowed = true;
        decision.valid = false;
        decision.from = fromNode.key;
        decision.to = toNode.key;
      } else if (
        LEVEL_ID === "LIV-026" &&
        fromNode.key !== toNode.key &&
        String(fromNode.key || "").startsWith("liv026-") &&
        String(toNode.key || "").startsWith("liv026-")
      ) {
        decision.allowed = true;
        decision.valid = false;
        decision.key = "invalid:" + [fromNode.key, toNode.key].sort().join("--");
        decision.from = fromNode.key;
        decision.to = toNode.key;
      } else if (
        LEVEL_ID === "LIV-016" &&
        fromNode.key &&
        toNode.key &&
        fromNode.key !== toNode.key
      ) {
        decision.allowed = true;
        decision.valid = false;
        decision.key = "invalid:" + [fromNode.key, toNode.key].sort().join("--");
        decision.from = fromNode.key;
        decision.to = toNode.key;
      } else if (
        LEVEL_ID === "LIV-019" &&
        fromNode.key &&
        toNode.key &&
        fromNode.key !== toNode.key
      ) {
        decision.allowed = true;
        decision.valid = false;
        decision.key = "invalid:" + [fromNode.key, toNode.key].sort().join("--");
        decision.from = fromNode.key;
        decision.to = toNode.key;
      } else if (
        LEVEL_ID === "LIV-029" &&
        fromNode.key &&
        toNode.key &&
        fromNode.key !== toNode.key
      ) {
        decision.allowed = true;
        decision.valid = false;
        decision.key = "invalid:" + [fromNode.key, toNode.key].sort().join("--");
        decision.from = fromNode.key;
        decision.to = toNode.key;
      } else if (
        LEVEL_ID === "LIV-028" &&
        fromNode.key &&
        toNode.key &&
        fromNode.key !== toNode.key &&
        String(fromNode.key || "").startsWith("liv028-") &&
        String(toNode.key || "").startsWith("liv028-")
      ) {
        decision.allowed = true;
        decision.valid = false;
        decision.key = "invalid:" + [fromNode.key, toNode.key].sort().join("--");
        decision.from = fromNode.key;
        decision.to = toNode.key;
      } else if (shouldCommitLiv015InvalidCable(fromNode.key, toNode.key)) {
        decision.allowed = true;
        decision.valid = false;
        decision.key = "invalid:" + [fromNode.key, toNode.key].sort().join("--");
        decision.from = fromNode.key;
        decision.to = toNode.key;
      } else {
        console.log("[Signal Flow] Native route blocked:", decision.key);
        flashNode(fromNode);
        flashNode(toNode);
        playBadConnect();
        return;
      }
    }

    const key = decision.key;

    if (state.routes.some(route => route.key === key)) return;

    const route = {
      key,
      valid: !!decision.valid,
      from: decision.from || fromNode.key,
      to: decision.to || toNode.key,
      fromPoint: sfNativeCablePointFromNode(layer, decision.from || fromNode.key, nativeCablePointForRouteNode(layer, fromNode)),
      toPoint: sfNativeCablePointFromNode(layer, decision.to || toNode.key, nativeCablePointForRouteNode(layer, toNode)),
      bend: defaultCableBend(key, state.routes.length)
    };

    state.routes.push(route);
    console.log("[Signal Flow] Native route added:", route.key, "valid?", route.valid);

    if (decision.valid && baseValid) {
      state.completedValidKeys.add(baseValid.key);
      dispatchNativeRouteCompleted(baseValid);
      markChecklistForCompletedRoute(baseValid);
      playGoodConnect();
    } else {
      dispatchNativeWrongAttempt(key);
      showLiveSoundEducationalFeedback(resolveLiveSoundPuzzleFeedback(getLiveSoundPuzzleSpec(LEVEL, LEVEL_ID), decision.from || fromNode.key, decision.to || toNode.key));
      playBadConnect();
      flashNode(fromNode);
      flashNode(toNode);
    }

    updateNativeScore();
    checkNativeLevelComplete();
    redrawCables(layer);
  }


  function sfLiv020NodeForKey(layer, key) {
    if (!layer || !key) return null;

    const el = layer.querySelector('[data-node-key="' + key + '"]');
    if (!el) return null;

    return {
      el,
      key,
      label: (el.dataset && el.dataset.label) || key,
      kind: (el.dataset && el.dataset.kind) || "jack",
      point: nativeCablePointForRouteNode(layer, { el, key })
    };
  }

  function sfLiv020UpdateBadJackAvailability(layer, selectedKey) {
    if (LEVEL_ID !== "LIV-020" || !layer) return;

    const badJacks = Array.from(layer.querySelectorAll('[data-node-key^="liv020-bad-"]'));

    badJacks.forEach(el => {
      // Lock-state behavior:
      // False hardware jacks remain real hit targets, but they must not visually
      // announce themselves or use a special cursor before the player drops.
      el.style.setProperty("pointer-events", "auto", "important");
      el.style.setProperty("cursor", "pointer", "important");
      el.style.setProperty("opacity", "0", "important");
      el.style.setProperty("background", "transparent", "important");
      el.style.setProperty("border", "0", "important");
      el.style.setProperty("box-shadow", "none", "important");
      el.style.setProperty("outline", "none", "important");
      el.style.setProperty("z-index", "2600", "important");
      el.removeAttribute("aria-hidden");
      el.tabIndex = -1;
      el.title = "";
    });

    console.log("[Signal Flow] LIV-020 bad jack availability updated neutral-hidden", {
      selectedKey: selectedKey || null,
      total: badJacks.length
    });
  }

function handleNodeClick(layer, node) {
    console.log("[Signal Flow] Native node select/connect:", node.key, "selected was", selectedNode && selectedNode.key);

    if (!selectedNode) {
      selectedNode = node;
      setSelected(node, true);
      sfLiv020UpdateBadJackAvailability(layer, node.key);
      return;
    }

    if (selectedNode.key === node.key) {
      clearSelection();
      sfLiv020UpdateBadJackAvailability(layer, "");
      return;
    }

    addRoute(layer, selectedNode, node);
    clearSelection();
    sfLiv020UpdateBadJackAvailability(layer, "");
  }

  function pointInLayerFromEvent(layer, event) {
    const r = layer.getBoundingClientRect();
    return {
      x: event.clientX - r.left,
      y: event.clientY - r.top
    };
  }

  function pointForNativeNode(layer, el) {
    if (isLiv019NativeLayer(layer)) {
      const key = liv019NodeKeyFromElement(el);
      const livePoint = liv019CablePointFor(layer, key, null);
      if (livePoint) return livePoint;
    }

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

    const startPoint =
      patchDrag.startPoint ||
      sfNativeCablePointFromNode(
        patchDrag.layer,
        patchDrag.fromNode && patchDrag.fromNode.key,
        patchDrag.fromNode && patchDrag.fromNode.point
      );

    const path = getDragPreviewPath(patchDrag.layer);

    if (sfNativeFinitePoint(startPoint) && sfNativeFinitePoint(point)) {
      path.setAttribute("d", cableD(startPoint, point, 0));
      path.setAttribute("stroke", "#ffd76a");
      path.style.filter = "drop-shadow(0 0 10px rgba(255,215,106,.48))";
    } else {
      console.warn("[Signal Flow] Native drag preview skipped invalid points", {
        fromKey: patchDrag.fromNode && patchDrag.fromNode.key,
        startPoint,
        point
      });
    }

    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
  }


  function sfLiv020ResolveDropTarget(layer, fromNode, event) {
    const target = nativeNodeFromDocumentPoint(layer, event);
    if (LEVEL_ID !== "LIV-020" || !layer || !fromNode || !fromNode.key || !target || !target.key) {
      return target;
    }

    if (sfLiv020IsBadNodeKey(target.key)) return target;

    if (!sfLiv020IsRealNodeKey(fromNode.key) || !sfLiv020IsRealNodeKey(target.key)) return target;

    return sfLiv020NodeForKey(layer, target.key) || target;
  }


  function finishNativePatchDrag(event) {
    if (!patchDrag) return;

    const drag = patchDrag;
    patchDrag = null;

    const target = sfLiv020ResolveDropTarget(drag.layer, drag.fromNode, event);
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

    sfLiv020UpdateBadJackAvailability(drag.layer, "");

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
    sfLiv020UpdateBadJackAvailability(layer, "");

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

    const dragStartPoint = sfNativeCablePointFromNode(layer, node && node.key, node && node.point);
    if (!sfNativeFinitePoint(dragStartPoint)) {
      console.warn("[Signal Flow] Native patch drag skipped invalid start point", {
        nodeKey: node && node.key,
        point: node && node.point
      });
      patchDrag = null;
      return;
    }

    patchDrag.startPoint = dragStartPoint;
    sfLiv020UpdateBadJackAvailability(layer, node && node.key);
    getDragPreviewPath(layer).setAttribute("d", cableD(dragStartPoint, dragStartPoint, 0));

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
    const sourceWidth = 170;
    const sourceHeight = 46;
    const jackPoint = {
      x: x + sourceWidth - 8,
      y: y + sourceHeight / 2
    };
    btn.dataset.sfNativeDefaultShadow = defaultShadow;
    btn.dataset.sfNativePointX = String(jackPoint.x);
    btn.dataset.sfNativePointY = String(jackPoint.y);
    btn.style.cssText = [
      "position:absolute",
      "left:" + x + "px",
      "top:" + y + "px",
      "width:" + sourceWidth + "px",
      "height:" + sourceHeight + "px",
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

    const port = document.createElement("span");
    port.setAttribute("aria-hidden", "true");
    port.style.cssText = [
      "position:absolute",
      "right:-2px",
      "top:50%",
      "width:15px",
      "height:15px",
      "border-radius:50%",
      "transform:translate(50%,-50%)",
      "background:radial-gradient(circle at 38% 38%,#fef3c7 0,#f59e0b 45%,#78350f 100%)",
      "border:2px solid rgba(255,246,203,.88)",
      "box-shadow:0 0 0 3px rgba(245,158,11,.16),0 4px 10px rgba(0,0,0,.35)",
      "pointer-events:none"
    ].join(";");
    btn.appendChild(port);

    btn.addEventListener("pointerdown", event => {
      const node = {
        key,
        el: btn,
        defaultShadow,
        point: pointForNativeNode(layer, btn)
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

      const node = {
        key,
        el: btn,
        defaultShadow,
        point: pointForNativeNode(layer, btn)
      };

      console.log("[Signal Flow] Native source clicked:", key);
      handleNodeClick(layer, node);
    });

    layer.appendChild(btn);
  }

  function updateLiv016SourceHintHighlights() {
    Array.from(document.querySelectorAll(".sf-native-liv016-source-hotspot")).forEach(btn => {
      if (!nativeHintsVisible) {
        btn.style.boxShadow = "none";
        btn.style.background = "rgba(255,210,95,0)";
        btn.style.borderColor = "rgba(255,210,95,0)";
        return;
      }

      btn.style.boxShadow = "0 0 0 3px rgba(255,210,95,.88), 0 0 18px rgba(255,210,95,.44)";
      btn.style.background = "rgba(255,210,95,.10)";
      btn.style.borderColor = "rgba(255,246,203,.78)";
    });

    Array.from(document.querySelectorAll(".sf-native-liv016-label")).forEach(label => {
      label.style.display = "none";
    });
  }


  function installLiv025HintStyle() {
    if (document.getElementById("sf-liv025-hint-style")) return;

    const style = document.createElement("style");
    style.id = "sf-liv025-hint-style";
    style.textContent = `
      .sf-live-native-level-liv-025 .sf-native-liv025-hitbox {
        box-shadow: none !important;
        outline: none !important;
        background: transparent !important;
        border: 0 !important;
      }

      .sf-live-native-level-liv-025.sf-native-hints-visible .sf-native-liv025-hitbox {
        opacity: .55 !important;
        background: rgba(255,210,95,.10) !important;
        box-shadow: 0 0 0 3px rgba(255,210,95,.95), 0 0 18px rgba(255,210,95,.50) !important;
      }

      .sf-live-native-level-liv-025:not(.sf-native-hints-visible) .sf-native-liv025-hitbox,
      .sf-live-native-level-liv-025:not(.sf-native-hints-visible) .sf-native-liv025-hitbox:hover {
        opacity: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        outline: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function normalizeLiv025GoodHitboxContract(layer) {
    if (LEVEL_ID !== "LIV-025" || !layer) return;

    installLiv025HintStyle();

    const keys = [
      "bus-1-output",
      "front-fill-processor-input",
      "front-fill-processor-output",
      "front-fill-amp-input"
    ];

    keys.forEach(key => {
      layer.querySelectorAll(
        '[data-node-key="' + key + '"], [data-sf-native-key="' + key + '"], [data-sf-native-node-key="' + key + '"]'
      ).forEach(node => {
        node.classList.add("sf-native-node", "sf-native-jack", "sf-native-liv025-hitbox");
        node.dataset.sfNativeKey = key;
        node.dataset.sfNativeGhost = "0";
        node.dataset.sfNativeHintable = "1";
        node.dataset.sfNativeGoodHint = "1";
        node.dataset.sfNativeDefaultShadow = "none";
        node.style.opacity = nativeHintsVisible ? ".55" : "0";
        node.style.pointerEvents = "auto";
        node.style.cursor = "pointer";
        node.style.zIndex = "2600";
      });
    });

    layer.classList.toggle("sf-native-hints-visible", !!nativeHintsVisible);
  }


  function normalizeNativeRequiredHintRings() {
    const levelId = String(LEVEL_ID || getLevelId() || activeNativeLevelId || "").toUpperCase();
    const spec = LIVE_NATIVE_PATCH_SPECS && LIVE_NATIVE_PATCH_SPECS[levelId];
    if (!spec) return;

    const requiredKeys = new Set();

    function addKey(value) {
      const key = String(value || "").trim();
      if (key) requiredKeys.add(key);
    }

    function readRouteEndpointKeys(route) {
      if (!route) return;

      if (Array.isArray(route)) {
        addKey(route[0]);
        addKey(route[1]);
        return;
      }

      if (typeof route === "object") {
        addKey(route.fromKey);
        addKey(route.toKey);
        addKey(route.from);
        addKey(route.to);
        addKey(route.sourceKey);
        addKey(route.destinationKey);
        addKey(route.src);
        addKey(route.dst);
      }
    }

    [
      spec.validRoutes,
      spec.requiredRoutes,
      spec.routes
    ].forEach(list => {
      if (!Array.isArray(list)) return;
      list.forEach(readRouteEndpointKeys);
    });

    if (!requiredKeys.size && Array.isArray(spec.toDoRoutes)) {
      spec.toDoRoutes.forEach(readRouteEndpointKeys);
    }

    const layers = Array.from(document.querySelectorAll(".sf-live-native-layer"));
    layers.forEach(layer => {
      if (!layer.classList.contains("sf-live-native-level-" + levelId.toLowerCase())) return;

      const hintsOn =
        !!nativeHintsVisible ||
        layer.classList.contains("sf-native-hints-visible") ||
        document.body.classList.contains("sf-native-hints-visible");

      Array.from(layer.querySelectorAll(".sf-native-jack")).forEach(btn => {
        const key = String(btn.dataset.nodeKey || btn.getAttribute("data-node-key") || "");
        const isRequiredEndpoint = requiredKeys.has(key);

        btn.classList.toggle("sf-native-required-hint", hintsOn && isRequiredEndpoint);

        if (!hintsOn || !isRequiredEndpoint) {
          if (LEVEL_ID === "LIV-029" && btn.classList.contains("sf-native-liv029-hitbox")) {
            btn.style.setProperty("box-shadow", btn.dataset.sfNativeDefaultShadow || "0 0 0 2px rgba(123,255,190,.72)", "important");
            btn.style.setProperty("background", "rgba(70,255,165,.18)", "important");
            btn.style.setProperty("border-color", "rgba(186,255,216,.85)", "important");
            btn.style.setProperty("opacity", ".92", "important");
            btn.style.setProperty("outline", "none", "important");
            return;
          }
          btn.style.setProperty("box-shadow", "none", "important");
          btn.style.setProperty("background", "rgba(255,255,255,0)", "important");
          btn.style.setProperty("border-color", "rgba(255,255,255,0)", "important");
          btn.style.setProperty("outline", "none", "important");
          return;
        }

        btn.style.setProperty("box-shadow", "0 0 0 3px rgba(255,210,95,.95), 0 0 18px rgba(255,210,95,.50)", "important");
        btn.style.setProperty("background", "rgba(255,210,95,.10)", "important");
        btn.style.setProperty("border-color", "rgba(255,210,95,.95)", "important");
        btn.style.setProperty("outline", "none", "important");
      });
    });
  }


  function updateNativeHintHighlights() {
    const hintNodes = Array.from(document.querySelectorAll(".sf-native-jack")).filter(btn => {
      const key = btn.dataset.nodeKey || btn.dataset.sfNativeKey || btn.getAttribute("data-node-key") || "";
      if (LEVEL_ID === "LIV-021" && String(key).startsWith("liv021-false-")) return false;
      if (LEVEL_ID === "LIV-025" && String(key).startsWith("liv025-false-")) return false;
      if (LEVEL_ID === "LIV-026" && String(key).startsWith("liv026-false-")) return false;
      if (LEVEL_ID === "LIV-023" && String(key).startsWith("liv023-false-")) return false;
      if (LEVEL_ID === "LIV-023" && btn.dataset.sfNativeFalseJack === "1") return false;
      if (LEVEL_ID === "LIV-023" && btn.dataset.sfNativeHintable === "0") return false;
      if (isLiveSoundPuzzleHintExcluded(getLiveSoundPuzzleSpec(LEVEL, LEVEL_ID), btn)) return false;
      return true;
    });

    if (LEVEL_ID === "LIV-021") {
      Array.from(document.querySelectorAll(".sf-native-liv021-hitbox")).forEach(btn => {
        const key = btn.dataset.nodeKey || btn.dataset.sfNativeKey || btn.getAttribute("data-node-key") || "";
        if (String(key).startsWith("liv021-false-")) return;
        if (!hintNodes.includes(btn)) hintNodes.push(btn);
      });
    }

    if (LEVEL_ID === "LIV-025") {
      document.querySelectorAll(".sf-live-native-level-liv-025").forEach(layer => {
        normalizeLiv025GoodHitboxContract(layer);
        layer.classList.toggle("sf-native-hints-visible", !!nativeHintsVisible);
      });

      Array.from(document.querySelectorAll(".sf-live-native-level-liv-025 .sf-native-liv025-hitbox")).forEach(btn => {
        if (!hintNodes.includes(btn)) hintNodes.push(btn);
      });
    }

    document.querySelectorAll(".sf-native-jack.sf-native-required-hint").forEach(btn => {
      btn.classList.remove("sf-native-required-hint");
    });

    hintNodes.forEach(btn => {
      // Required hint class is assigned only by normalizeNativeRequiredHintRings().
      const nodeKey = btn.dataset.nodeKey || btn.dataset.key || btn.dataset.sfNativeKey || "";
      const isLiv023False = LEVEL_ID === "LIV-023" && (
        nodeKey.startsWith("liv023-false-") ||
        btn.dataset.sfNativeFalseJack === "1" ||
        btn.dataset.sfNativeHintable === "0"
      );

      if (isLiv023False) {
        btn.style.boxShadow = "none";
        btn.style.outline = "none";
        btn.style.background = "rgba(255,255,255,0)";
        return;
      }

      const isGhost = btn.dataset.sfNativeGhost === "1";

      if (!nativeHintsVisible) {
        if (LEVEL_ID === "LIV-029" && btn.classList.contains("sf-native-liv029-hitbox")) {
          btn.style.setProperty("box-shadow", btn.dataset.sfNativeDefaultShadow || "0 0 0 2px rgba(123,255,190,.72)", "important");
          btn.style.setProperty("outline", "none", "important");
          btn.style.setProperty("background", "rgba(70,255,165,.18)", "important");
          btn.style.setProperty("border-color", "rgba(186,255,216,.85)", "important");
          btn.style.setProperty("opacity", ".92", "important");
          return;
        }
        btn.style.boxShadow = "none";
        btn.style.outline = "none";
        btn.style.background = "rgba(255,255,255,0)";
        if (LEVEL_ID === "LIV-021" && btn.classList.contains("sf-native-liv021-hitbox")) {
          btn.style.opacity = "0";
        }
        if (LEVEL_ID === "LIV-025" && btn.classList.contains("sf-native-liv025-hitbox")) {
          btn.style.opacity = "0";
        }
        return;
      }

      if (isGhost) {
        btn.style.boxShadow = "none";
        btn.style.outline = "none";
        btn.style.background = "rgba(255,255,255,0)";
      } else {
        btn.style.boxShadow = "0 0 0 3px rgba(255,210,95,.95), 0 0 18px rgba(255,210,95,.50)";
        btn.style.outline = "none";
        btn.style.background = "rgba(255,210,95,.10)";
        if (LEVEL_ID === "LIV-021" && btn.classList.contains("sf-native-liv021-hitbox")) {
          btn.style.opacity = ".55";
        }
        if (LEVEL_ID === "LIV-025" && btn.classList.contains("sf-native-liv025-hitbox")) {
          btn.style.opacity = ".55";
        }
      }
    });
    updateLiv016SourceHintHighlights();
  }

  function setNativeHintsVisible(visible) {
    nativeHintsVisible = !!visible;
    console.log("[Signal Flow] Native jack hints visible:", nativeHintsVisible);
    updateNativeHintHighlights();
    normalizeNativeRequiredHintRings();
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

  function selectNativeSourceOnly(layer, node) {
    if (!node || !node.key || !node.el || !node.point) return;

    if (LEVEL_ID === "LIV-009") {
      const drumHitbox = layer.querySelector(".sf-native-liv009-drum-hitbox[data-node-key='" + node.key + "']");
      if (drumHitbox) {
        node.point = pointForNativeNode(layer, drumHitbox);
      }
    }

    if (selectedNode && selectedNode.el !== node.el) clearSelection();
    selectedNode = node;
    setSelected(node, true);
    console.log("[Signal Flow] Native source selected:", node.key);
  }

  function nativeNodeFromButton(layer, btn, key, defaultShadow) {
    const rect = btn.getBoundingClientRect();
    const parent = layer.getBoundingClientRect();
    return {
      key,
      el: btn,
      defaultShadow,
      point: {
        x: rect.left - parent.left + rect.width / 2,
        y: rect.top - parent.top + rect.height / 2
      }
    };
  }

  function createLiv009SourceButton(layer, panel, key, label) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.className = "sf-native-node sf-native-source sf-native-liv009-source-chip";
    setNativeNodeDomKey(btn, key, "source");
    btn.dataset.sfNativeKey = key;
    btn.setAttribute("aria-label", label);

    const defaultShadow = "inset 0 1px 0 rgba(255,255,255,.12), 0 8px 16px rgba(0,0,0,.36)";
    btn.dataset.sfNativeDefaultShadow = defaultShadow;
    btn.style.cssText = [
      "min-width:0",
      "height:48px",
      "border-radius:12px",
      "border:1px solid rgba(255,215,106,.30)",
      "background:linear-gradient(180deg,rgba(75,57,36,.98),rgba(42,31,22,.98))",
      "color:#fff4d2",
      "font:900 clamp(13px,1.35vw,20px) system-ui,-apple-system,Segoe UI,sans-serif",
      "letter-spacing:0",
      "cursor:pointer",
      "pointer-events:auto",
      "box-shadow:" + defaultShadow
    ].join(";");

    btn.addEventListener("pointerdown", event => {
      startNativePatchDrag(layer, nativeNodeFromButton(layer, btn, key, defaultShadow), event);
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
      selectNativeSourceOnly(layer, nativeNodeFromButton(layer, btn, key, defaultShadow));
    });

    panel.appendChild(btn);
    return btn;
  }

  function createLiv009DrumHitbox(layer, key, label, drum, rel) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sf-native-node sf-native-source sf-native-liv009-drum-hitbox";
    setNativeNodeDomKey(btn, key, "source");
    btn.dataset.sfNativeKey = key;
    btn.setAttribute("aria-label", label);

    const defaultShadow = "0 0 0 0 rgba(0,0,0,0)";
    btn.dataset.sfNativeDefaultShadow = defaultShadow;
    btn.style.cssText = [
      "position:absolute",
      "left:" + (drum.x + drum.w * rel.x) + "px",
      "top:" + (drum.y + drum.h * rel.y) + "px",
      "width:" + (drum.w * rel.w) + "px",
      "height:" + (drum.h * rel.h) + "px",
      "transform:translate(-50%,-50%)",
      "border-radius:50%",
      "border:1px solid rgba(100,241,255,.08)",
      "background:rgba(100,241,255,.001)",
      "cursor:pointer",
      "pointer-events:auto",
      "touch-action:none",
      "z-index:2150",
      "box-shadow:" + defaultShadow
    ].join(";");

    btn.addEventListener("mouseenter", () => {
      if (!selectedNode || selectedNode.el !== btn) {
        btn.style.boxShadow = "0 0 0 2px rgba(100,241,255,.22), 0 0 18px rgba(100,241,255,.18)";
      }
    });
    btn.addEventListener("mouseleave", () => {
      if (!selectedNode || selectedNode.el !== btn) btn.style.boxShadow = defaultShadow;
    });
    btn.addEventListener("pointerdown", event => {
      startNativePatchDrag(layer, nativeNodeFromButton(layer, btn, key, defaultShadow), event);
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
      selectNativeSourceOnly(layer, nativeNodeFromButton(layer, btn, key, defaultShadow));
    });

    layer.appendChild(btn);
  }

  
  function sfLiv009InstallHintGate(){
    if(document.getElementById("sf-liv009-hint-gate-style")) return;

    const style = document.createElement("style");
    style.id = "sf-liv009-hint-gate-style";
    style.textContent = `
      /*
        LIV-009 hint gate:
        Hide hint/highlight/glow artifacts until the player actually enables hints.
        Keep completed/correct/error route feedback untouched.
      */
      .sf-live-native-layer.sf-live-native-level-liv-009:not(.sf-liv009-hints-enabled) .sf-liv009-hint,
      .sf-live-native-layer.sf-live-native-level-liv-009:not(.sf-liv009-hints-enabled) .sf-liv009-hint-highlight,
      .sf-live-native-layer.sf-live-native-level-liv-009:not(.sf-liv009-hints-enabled) .sf-liv009-hint-ring,
      .sf-live-native-layer.sf-live-native-level-liv-009:not(.sf-liv009-hints-enabled) .sf-native-hint,
      .sf-live-native-layer.sf-live-native-level-liv-009:not(.sf-liv009-hints-enabled) .sf-native-hint-highlight,
      .sf-live-native-layer.sf-live-native-level-liv-009:not(.sf-liv009-hints-enabled) .hint-highlight,
      .sf-live-native-layer.sf-live-native-level-liv-009:not(.sf-liv009-hints-enabled) [data-hint],
      .sf-live-native-layer.sf-live-native-level-liv-009:not(.sf-liv009-hints-enabled) [data-hint-target],
      .sf-live-native-layer.sf-live-native-level-liv-009:not(.sf-liv009-hints-enabled) [data-liv009-hint] {
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        box-shadow: none !important;
        filter: none !important;
      }

      .sf-live-native-layer.sf-live-native-level-liv-009:not(.sf-liv009-hints-enabled) .sf-liv009-source-chip.is-hint,
      .sf-live-native-layer.sf-live-native-level-liv-009:not(.sf-liv009-hints-enabled) .sf-liv009-source-chip.hint,
      .sf-live-native-layer.sf-live-native-level-liv-009:not(.sf-liv009-hints-enabled) .sf-liv009-stagebox-input.is-hint,
      .sf-live-native-layer.sf-live-native-level-liv-009:not(.sf-liv009-hints-enabled) .sf-liv009-stagebox-input.hint {
        outline: none !important;
        box-shadow: none !important;
        filter: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function sfLiv009SyncHintGate(){
    const layer = document.querySelector(".sf-live-native-layer.sf-live-native-level-liv-009");
    if(!layer) return;

    const hintButton = Array.from(document.querySelectorAll("button")).find(btn =>
      /show hints|hide hints/i.test((btn.textContent || "").trim())
    );

    const hintsEnabled = !!(
      hintButton &&
      (
        /hide hints/i.test((hintButton.textContent || "").trim()) ||
        hintButton.getAttribute("aria-pressed") === "true" ||
        hintButton.classList.contains("active") ||
        hintButton.classList.contains("is-active") ||
        hintButton.classList.contains("selected") ||
        hintButton.classList.contains("is-selected")
      )
    );

    layer.classList.toggle("sf-liv009-hints-enabled", hintsEnabled);
  }

  
  const sfLiv009StageboxHintRingGateStyle = document.createElement("style");
  sfLiv009StageboxHintRingGateStyle.id = "sf-liv009-stagebox-hint-ring-gate-style";
  sfLiv009StageboxHintRingGateStyle.textContent = `
    /*
      LIV-009: stagebox yellow rings are hints, not default jack visuals.
      Hide them until Show Hints is enabled.

      Preserve completed/correct/valid route feedback so already-patched
      inputs can still glow green.
    */

    .sf-live-native-layer.sf-live-native-level-liv-009:not(.sf-liv009-hints-enabled)
      .sf-native-liv009-stagebox-input:not(.complete):not(.completed):not(.correct):not(.valid):not(.is-complete):not(.is-correct):not(.is-valid):not(.connected):not(.patched):not(.done),
    .sf-live-native-layer.sf-live-native-level-liv-009:not(.sf-liv009-hints-enabled)
      [data-node-key^="stagebox-input-"]:not(.complete):not(.completed):not(.correct):not(.valid):not(.is-complete):not(.is-correct):not(.is-valid):not(.connected):not(.patched):not(.done) {
      outline: none !important;
      box-shadow: none !important;
      filter: none !important;
      border-color: transparent !important;
      background: transparent !important;
    }

    .sf-live-native-layer.sf-live-native-level-liv-009:not(.sf-liv009-hints-enabled)
      .sf-native-liv009-stagebox-input:not(.complete):not(.completed):not(.correct):not(.valid):not(.is-complete):not(.is-correct):not(.is-valid):not(.connected):not(.patched):not(.done)::before,
    .sf-live-native-layer.sf-live-native-level-liv-009:not(.sf-liv009-hints-enabled)
      .sf-native-liv009-stagebox-input:not(.complete):not(.completed):not(.correct):not(.valid):not(.is-complete):not(.is-correct):not(.is-valid):not(.connected):not(.patched):not(.done)::after,
    .sf-live-native-layer.sf-live-native-level-liv-009:not(.sf-liv009-hints-enabled)
      [data-node-key^="stagebox-input-"]:not(.complete):not(.completed):not(.correct):not(.valid):not(.is-complete):not(.is-correct):not(.is-valid):not(.connected):not(.patched):not(.done)::before,
    .sf-live-native-layer.sf-live-native-level-liv-009:not(.sf-liv009-hints-enabled)
      [data-node-key^="stagebox-input-"]:not(.complete):not(.completed):not(.correct):not(.valid):not(.is-complete):not(.is-correct):not(.is-valid):not(.connected):not(.patched):not(.done)::after {
      opacity: 0 !important;
      visibility: hidden !important;
      box-shadow: none !important;
      filter: none !important;
      border-color: transparent !important;
      background: transparent !important;
    }

    /*
      When hints are enabled, restore the intended target-ring styling.
      This lets Show Hints work without changing route logic.
    */
    .sf-live-native-layer.sf-live-native-level-liv-009.sf-liv009-hints-enabled
      .sf-native-liv009-stagebox-input,
    .sf-live-native-layer.sf-live-native-level-liv-009.sf-liv009-hints-enabled
      [data-node-key^="stagebox-input-"] {
      visibility: visible !important;
      pointer-events: auto !important;
    }
  `;
  document.head.appendChild(sfLiv009StageboxHintRingGateStyle);



  const sfLiv009CableTopLayerStyle = document.createElement("style");
  sfLiv009CableTopLayerStyle.id = "sf-liv009-cable-top-layer-style";
  sfLiv009CableTopLayerStyle.textContent = `
    /*
      LIV-009 visual-only cable layering:
      Draw cables above hardware/drum graphics, but keep them non-interactive
      so source chips and stagebox jacks remain clickable.
    */

    .sf-live-native-layer.sf-live-native-level-liv-009 svg[class*="cable"],
    .sf-live-native-layer.sf-live-native-level-liv-009 [class*="cable-layer"],
    .sf-live-native-layer.sf-live-native-level-liv-009 [class*="cables"],
    .sf-live-native-layer.sf-live-native-level-liv-009 [data-cable-layer],
    .sf-live-native-layer.sf-live-native-level-liv-009 .sf-native-cable-layer,
    .sf-live-native-layer.sf-live-native-level-liv-009 .sf-native-cables,
    .sf-live-native-layer.sf-live-native-level-liv-009 .sf-native-cable-svg {
      position: absolute !important;
      inset: 0 !important;
      z-index: 9000 !important;
      pointer-events: none !important;
      overflow: visible !important;
    }

    .sf-live-native-layer.sf-live-native-level-liv-009 svg[class*="cable"] *,
    .sf-live-native-layer.sf-live-native-level-liv-009 [class*="cable-layer"] *,
    .sf-live-native-layer.sf-live-native-level-liv-009 [class*="cables"] *,
    .sf-live-native-layer.sf-live-native-level-liv-009 [data-cable-layer] *,
    .sf-live-native-layer.sf-live-native-level-liv-009 .sf-native-cable-layer *,
    .sf-live-native-layer.sf-live-native-level-liv-009 .sf-native-cables *,
    .sf-live-native-layer.sf-live-native-level-liv-009 .sf-native-cable-svg * {
      pointer-events: none !important;
    }

    /*
      Keep active controls above background art but below cable visuals.
      Since cable SVG is pointer-events:none, it will not block clicks.
      Stagebox hitboxes must stay absolute so the measured SVG jack map is respected.
    */
    .sf-live-native-layer.sf-live-native-level-liv-009 .sf-liv009-source-chip,
    .sf-live-native-layer.sf-live-native-level-liv-009 .sf-native-liv009-source-chip {
      position: relative !important;
      z-index: 7000 !important;
    }

    .sf-live-native-layer.sf-live-native-level-liv-009 .sf-native-liv009-stagebox-input,
    .sf-live-native-layer.sf-live-native-level-liv-009 [data-node-key^="stagebox-input-"] {
      position: absolute !important;
      z-index: 7000 !important;
      pointer-events: auto !important;
    }
  `;
  document.head.appendChild(sfLiv009CableTopLayerStyle);


function sfLiv009BindHintGate(){
    sfLiv009InstallHintGate();
    sfLiv009SyncHintGate();

    if(window.sfLiv009HintGateBound) return;
    window.sfLiv009HintGateBound = true;

    document.addEventListener("click", event => {
      const btn = event.target && event.target.closest && event.target.closest("button");
      if(!btn) return;
      if(!/show hints|hide hints/i.test((btn.textContent || "").trim())) return;

      setTimeout(sfLiv009SyncHintGate, 0);
      setTimeout(sfLiv009SyncHintGate, 80);
      setTimeout(sfLiv009SyncHintGate, 220);
    }, true);

    const observer = new MutationObserver(() => {
      if(document.querySelector(".sf-live-native-layer.sf-live-native-level-liv-009")){
        sfLiv009SyncHintGate();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "aria-pressed"]
    });
  }



  function sfLiv009NormalizeLabelAndJackLayers(){
    const layer = document.querySelector(".sf-live-native-layer.sf-live-native-level-liv-009");
    if(!layer) return;

    layer.classList.add("sf-liv009-label-jack-clean");

    // Normalize duplicate labels created by generic + dedicated render paths.
    const labelTexts = new Set([
      "STAGE BOX INPUTS",
      "FOH CONSOLE",
      "FOH CONSOLE INPUT MAP"
    ]);

    const leafLabels = Array.from(layer.querySelectorAll("*")).filter(el => {
      const text = (el.textContent || "").replace(/\s+/g, " ").trim();
      if(!labelTexts.has(text)) return false;
      if(el.closest("[data-liv009-source-panel]")) return false;
      return el.children.length === 0 || Array.from(el.children).every(child => !(child.textContent || "").trim());
    });

    // Prefer simple FOH CONSOLE over FOH CONSOLE INPUT MAP if both exist.
    const hasSimpleFoh = leafLabels.some(el => (el.textContent || "").replace(/\s+/g, " ").trim() === "FOH CONSOLE");
    leafLabels.forEach(el => {
      const text = (el.textContent || "").replace(/\s+/g, " ").trim();
      if(text === "FOH CONSOLE INPUT MAP" && hasSimpleFoh){
        el.remove();
      }
    });

    // Remove duplicate exact labels, keeping the upper-leftmost one.
    const groups = {};
    Array.from(layer.querySelectorAll("*")).forEach(el => {
      const text = (el.textContent || "").replace(/\s+/g, " ").trim();
      if(!labelTexts.has(text)) return;
      if(el.closest("[data-liv009-source-panel]")) return;
      const r = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
      if(!r || r.width <= 0 || r.height <= 0) return;
      (groups[text] ||= []).push({ el, x: r.x, y: r.y });
    });


    Object.values(groups).forEach(items => {
      items.sort((a, b) => (a.y - b.y) || (a.x - b.x));
      items.slice(1).forEach(item => item.el.remove());
    });

    // Ensure stagebox hitboxes have no visible label or second jack graphic.
    layer.querySelectorAll(".sf-native-liv009-stagebox-input, [data-node-key^='stagebox-input-']").forEach(el => {
      if(el.classList.contains("sf-native-liv009-stagebox-input") || /^stagebox-input-/.test(el.getAttribute("data-node-key") || "")){
        el.textContent = "";
        el.setAttribute("aria-label", el.getAttribute("aria-label") || el.title || el.getAttribute("data-node-key") || "Stage Box Input");
      }
    });
  }

  function sfLiv009InstallLabelJackLayerStyle(){
    if(document.getElementById("sf-liv009-label-jack-layer-cleanup-style")) return;

    const style = document.createElement("style");
    style.id = "sf-liv009-label-jack-layer-cleanup-style";
    style.textContent = `
      /*
        LIV-009 label/jack layer cleanup:
        - stagebox asset is the visible jack graphic
        - native buttons are transparent hitboxes
        - hover/focus still gives useful feedback
      */

      .sf-live-native-layer.sf-live-native-level-liv-009.sf-liv009-label-jack-clean
        .sf-native-liv009-stagebox-input,
      .sf-live-native-layer.sf-live-native-level-liv-009.sf-liv009-label-jack-clean
        [data-node-key^="stagebox-input-"] {
        color: transparent !important;
        font-size: 0 !important;
        line-height: 0 !important;
        text-shadow: none !important;
        background: transparent !important;
        border-color: transparent !important;
        box-shadow: none !important;
        filter: none !important;
        outline: none !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }

      .sf-live-native-layer.sf-live-native-level-liv-009.sf-liv009-label-jack-clean
        .sf-native-liv009-stagebox-input::before,
      .sf-live-native-layer.sf-live-native-level-liv-009.sf-liv009-label-jack-clean
        .sf-native-liv009-stagebox-input::after,
      .sf-live-native-layer.sf-live-native-level-liv-009.sf-liv009-label-jack-clean
        [data-node-key^="stagebox-input-"]::before,
      .sf-live-native-layer.sf-live-native-level-liv-009.sf-liv009-label-jack-clean
        [data-node-key^="stagebox-input-"]::after {
        opacity: 0 !important;
        visibility: hidden !important;
        box-shadow: none !important;
        background: transparent !important;
        border-color: transparent !important;
      }

      .sf-live-native-layer.sf-live-native-level-liv-009.sf-liv009-label-jack-clean
        .sf-native-liv009-stagebox-input:hover,
      .sf-live-native-layer.sf-live-native-level-liv-009.sf-liv009-label-jack-clean
        .sf-native-liv009-stagebox-input:focus-visible,
      .sf-live-native-layer.sf-live-native-level-liv-009.sf-liv009-label-jack-clean
        [data-node-key^="stagebox-input-"]:hover,
      .sf-live-native-layer.sf-live-native-level-liv-009.sf-liv009-label-jack-clean
        [data-node-key^="stagebox-input-"]:focus-visible {
        outline: 2px solid rgba(125, 211, 252, 0.9) !important;
        outline-offset: 2px !important;
      }

      /*
        Preserve completed/correct/valid state feedback. This should only show
        after a successful patch, not as the default jack layer.
      */
      .sf-live-native-layer.sf-live-native-level-liv-009.sf-liv009-label-jack-clean
        .sf-native-liv009-stagebox-input.complete,
      .sf-live-native-layer.sf-live-native-level-liv-009.sf-liv009-label-jack-clean
        .sf-native-liv009-stagebox-input.completed,
      .sf-live-native-layer.sf-live-native-level-liv-009.sf-liv009-label-jack-clean
        .sf-native-liv009-stagebox-input.correct,
      .sf-live-native-layer.sf-live-native-level-liv-009.sf-liv009-label-jack-clean
        .sf-native-liv009-stagebox-input.valid,
      .sf-live-native-layer.sf-live-native-level-liv-009.sf-liv009-label-jack-clean
        [data-node-key^="stagebox-input-"].complete,
      .sf-live-native-layer.sf-live-native-level-liv-009.sf-liv009-label-jack-clean
        [data-node-key^="stagebox-input-"].completed,
      .sf-live-native-layer.sf-live-native-level-liv-009.sf-liv009-label-jack-clean
        [data-node-key^="stagebox-input-"].correct,
      .sf-live-native-layer.sf-live-native-level-liv-009.sf-liv009-label-jack-clean
        [data-node-key^="stagebox-input-"].valid {
        outline: 2px solid rgba(74, 222, 128, 0.95) !important;
        outline-offset: 2px !important;
      }
    `;
    document.head.appendChild(style);
  }

  function sfLiv009ApplyLabelJackLayerCleanup(){
    sfLiv009InstallLabelJackLayerStyle();
    sfLiv009NormalizeLabelAndJackLayers();
    setTimeout(sfLiv009NormalizeLabelAndJackLayers, 80);
    setTimeout(sfLiv009NormalizeLabelAndJackLayers, 220);
  }



  
  
  
    function sfLiv009StageboxAssetRect(layer) {
    return Array.from(layer.querySelectorAll("img")).find(img => {
      const src = String(img.getAttribute("src") || img.src || "");
      return /stagebox|snake/i.test(src);
    });
  }

  const SF_LIV009_STAGEBOX_TOP_REL = [[0.151163,0.519231],[0.234884,0.519231],[0.318605,0.519231],[0.402326,0.519231],[0.486047,0.519231],[0.569767,0.519231],[0.653488,0.519231],[0.737209,0.519231]];
  const SF_LIV009_STAGEBOX_FALSE_REL = [[0.151163,0.746154],[0.234884,0.746154],[0.318605,0.746154],[0.402326,0.746154],[0.486047,0.746154],[0.569767,0.746154],[0.653488,0.746154],[0.737209,0.746154]];
  const SF_LIV009_STAGEBOX_LINK_REL = [0.901163,0.519231];

  function sfLiv009AlignStageboxHitboxes() {
    const layer = document.querySelector(".sf-live-native-layer.sf-live-native-level-liv-009");
    if(!layer) return;

    const img = sfLiv009StageboxAssetRect(layer);
    if(!img || !img.getBoundingClientRect) return;

    const layerRect = layer.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    const left = imgRect.left - layerRect.left;
    const top = imgRect.top - layerRect.top;
    const width = imgRect.width;
    const height = imgRect.height || (width * 260 / 860);

    function place(key, pair, size) {
      const el = layer.querySelector(`[data-node-key="${key}"]`);
      if(!el) return;

      const cx = left + width * pair[0];
      const cy = top + height * pair[1];

      Object.assign(el.style, {
        position: "absolute",
        left: Math.round(cx - size / 2) + "px",
        top: Math.round(cy - size / 2) + "px",
        width: size + "px",
        height: size + "px",
        minWidth: size + "px",
        minHeight: size + "px",
        maxWidth: size + "px",
        maxHeight: size + "px",
        transform: "none",
        zIndex: "7000",
        pointerEvents: "auto"
      });

      el.dataset.sfNativePointX = String(Math.round(cx));
      el.dataset.sfNativePointY = String(Math.round(cy));
    }

    SF_LIV009_STAGEBOX_TOP_REL.forEach((pair, idx) => place("stagebox-input-" + (idx + 1), pair, 34));
    SF_LIV009_STAGEBOX_FALSE_REL.forEach((pair, idx) => place("stagebox-input-" + (idx + 9), pair, 24));
    place("stagebox-link-out", SF_LIV009_STAGEBOX_LINK_REL, 34);
  }

function sfLiv009InstallHitboxTransparencyStyle() {
    if(document.getElementById("sf-liv009-hitbox-transparency-style")) return;
    const style = document.createElement("style");
    style.id = "sf-liv009-hitbox-transparency-style";
    style.textContent = `
      .sf-live-native-layer.sf-live-native-level-liv-009 .sf-native-liv009-stagebox-input {
        color: transparent !important;
        font-size: 0 !important;
        line-height: 0 !important;
        background: transparent !important;
        border-color: transparent !important;
        box-shadow: none !important;
        text-shadow: none !important;
      }
      .sf-live-native-layer.sf-live-native-level-liv-009 .sf-native-liv009-stagebox-input:hover,
      .sf-live-native-layer.sf-live-native-level-liv-009 .sf-native-liv009-stagebox-input:focus-visible {
        outline: 2px solid rgba(125,211,252,.8) !important;
        outline-offset: 2px !important;
      }
    `;
    document.head.appendChild(style);
  }

function createLiv009StageboxInput(layer, key, point, falseTarget) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sf-native-node sf-native-jack sf-native-liv009-stagebox-input";
    setNativeNodeDomKey(btn, key, "jack");
    btn.dataset.sfNativeKey = key;
    btn.dataset.sfNativeGhost = falseTarget ? "1" : "0";

    const hitboxLabel = "Stage Box Input " + key.replace("stagebox-input-", "");
    btn.textContent = "";
    btn.setAttribute("aria-label", hitboxLabel);
    btn.title = hitboxLabel;

    const defaultShadow = "none";
    btn.dataset.sfNativeDefaultShadow = defaultShadow;
    btn.dataset.sfNativePointX = String(point.x);
    btn.dataset.sfNativePointY = String(point.y);

    const size = falseTarget ? 24 : 34;
    btn.style.cssText = [
      "position:absolute",
      "left:" + Math.round(point.x - size / 2) + "px",
      "top:" + Math.round(point.y - size / 2) + "px",
      "width:" + size + "px",
      "height:" + size + "px",
      "min-width:" + size + "px",
      "min-height:" + size + "px",
      "max-width:" + size + "px",
      "max-height:" + size + "px",
      "transform:none",
      "border-radius:50%",
      "border:0",
      "background:rgba(255,255,255,0)",
      "color:transparent",
      "font-size:0",
      "line-height:0",
      "cursor:pointer",
      "pointer-events:auto",
      "z-index:7000",
      "box-shadow:" + defaultShadow
    ].join(";");

    function currentNode() {
      return {
        key,
        el: btn,
        defaultShadow,
        point: pointForNativeNode(layer, btn)
      };
    }

    btn.addEventListener("pointerdown", event => {
      startNativePatchDrag(layer, currentNode(), event);
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
      handleNodeClick(layer, currentNode());
    });

    layer.appendChild(btn);
  }

  
  function sfLiv009NormalizeRoutes() { return; }



  function sfLiv009DrawFohNormalizationCables(layer, foh) {
    if(!layer || !foh) return;

    layer.querySelectorAll(".sf-liv009-foh-normalled-cables").forEach(el => el.remove());

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("sf-liv009-foh-normalled-cables");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.cssText = [
      "position:absolute",
      "inset:0",
      "z-index:1200",
      "pointer-events:none",
      "overflow:visible"
    ].join(";");

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    grad.setAttribute("id", "sfLiv009NormCableGrad");
    grad.setAttribute("x1", "0");
    grad.setAttribute("y1", "0");
    grad.setAttribute("x2", "0");
    grad.setAttribute("y2", "1");
    [
      ["0", "#8a867f"],
      ["0.35", "#5f5b55"],
      ["0.72", "#3f3c38"],
      ["1", "#282622"]
    ].forEach(([offset, color]) => {
      const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop.setAttribute("offset", offset);
      stop.setAttribute("stop-color", color);
      grad.appendChild(stop);
    });
    defs.appendChild(grad);
    svg.appendChild(defs);

    const panel = {
      x: foh.x,
      y: foh.y,
      w: foh.w,
      h: foh.h || (foh.w * 260 / 1120)
    };

    const inputs = [
      { x: 100 / 1120, y: 134 / 260 },
      { x: 160 / 1120, y: 134 / 260 },
      { x: 220 / 1120, y: 134 / 260 },
      { x: 280 / 1120, y: 134 / 260 },
      { x: 425 / 1120, y: 134 / 260 },
      { x: 485 / 1120, y: 134 / 260 },
      { x: 545 / 1120, y: 134 / 260 },
      { x: 605 / 1120, y: 134 / 260 }
    ];

    inputs.forEach((rel, index) => {
      const end = {
        x: panel.x + panel.w * rel.x,
        y: panel.y + panel.h * rel.y
      };

      // Short FOH-side normalled/prewired tails, matching LIV-002 behavior:
      // visible realism without implying player-patched routes.
      const start = {
        x: Math.max(panel.x + 20, end.x - panel.w * (index < 4 ? 0.105 : 0.080)),
        y: end.y + panel.h * (index % 2 === 0 ? 0.145 : 0.118)
      };
      const c1 = { x: start.x + panel.w * 0.040, y: start.y - panel.h * 0.018 };
      const c2 = { x: end.x - panel.w * 0.030, y: end.y + panel.h * 0.028 };
      const d = `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;

      const shadow = document.createElementNS("http://www.w3.org/2000/svg", "path");
      shadow.setAttribute("d", d);
      shadow.setAttribute("fill", "none");
      shadow.setAttribute("stroke", "rgba(0,0,0,.58)");
      shadow.setAttribute("stroke-width", "11");
      shadow.setAttribute("stroke-linecap", "round");
      shadow.setAttribute("stroke-linejoin", "round");
      shadow.setAttribute("transform", "translate(0 4)");
      svg.appendChild(shadow);

      const under = document.createElementNS("http://www.w3.org/2000/svg", "path");
      under.setAttribute("d", d);
      under.setAttribute("fill", "none");
      under.setAttribute("stroke", "#24221f");
      under.setAttribute("stroke-width", "8");
      under.setAttribute("stroke-linecap", "round");
      under.setAttribute("stroke-linejoin", "round");
      under.setAttribute("opacity", "0.95");
      svg.appendChild(under);

      const body = document.createElementNS("http://www.w3.org/2000/svg", "path");
      body.setAttribute("d", d);
      body.setAttribute("fill", "none");
      body.setAttribute("stroke", "url(#sfLiv009NormCableGrad)");
      body.setAttribute("stroke-width", "5.2");
      body.setAttribute("stroke-linecap", "round");
      body.setAttribute("stroke-linejoin", "round");
      body.setAttribute("opacity", "0.98");
      svg.appendChild(body);

      const sleeve = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      sleeve.setAttribute("cx", end.x.toFixed(1));
      sleeve.setAttribute("cy", end.y.toFixed(1));
      sleeve.setAttribute("r", index < 4 ? "7.3" : "6.0");
      sleeve.setAttribute("fill", "#3b3834");
      sleeve.setAttribute("stroke", "#8a857b");
      sleeve.setAttribute("stroke-width", "1.1");
      sleeve.setAttribute("opacity", "0.96");
      svg.appendChild(sleeve);

      const plug = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      plug.setAttribute("cx", end.x.toFixed(1));
      plug.setAttribute("cy", end.y.toFixed(1));
      plug.setAttribute("r", index < 4 ? "3.4" : "2.8");
      plug.setAttribute("fill", "#161514");
      plug.setAttribute("opacity", "0.95");
      svg.appendChild(plug);
    });

    layer.appendChild(svg);
  }

function renderLiv009DrumStageInputs(surface, adapter) {

    const level = buildLevelGeometry(surface);
    const rect = level.rect;
    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());

    const layer = document.createElement("div");
    layer.className = "sf-live-native-layer sf-live-native-level-liv-009";
    layer.style.cssText = [
      "position:absolute",
      "inset:0",
      "z-index:9990",
      "isolation:isolate",
      "pointer-events:none",
      "overflow:visible",
      "border-radius:16px",
      "background:linear-gradient(180deg,rgba(8,24,19,.96),rgba(6,17,15,.98))"
    ].join(";");

    const width = Math.max(1, rect.width || surface.getBoundingClientRect().width);
    const height = Math.max(1, rect.height || surface.getBoundingClientRect().height);
    const stage = { x: width * 0.02, y: 78, w: width * 0.39 };
    stage.h = stage.w * 260 / 860;
    const foh = { x: width * 0.43, y: 96, w: width * 0.54 };
    foh.h = foh.w * 260 / 1120;
    const drum = { x: width * 0.40, y: Math.max(228, height * 0.38), w: width * 0.55 };
    drum.h = drum.w * 1102 / 2048;
    const sourcePanel = { x: width * 0.10, y: Math.max(260, drum.y + 44), w: width * 0.28, h: 162 };

    createLabel(layer, "DRUM INPUTS - NATIVE CONCEPT MODE", 28, 28, 12);
    createLabel(layer, "STAGE BOX INPUTS", stage.x + 12, stage.y - 24, 11);
    createLabel(layer, "FOH CONSOLE", foh.x + 12, foh.y - 24, 11);

    const stageImg = document.createElement("img");
    stageImg.src = hardwareAssetFor("stagebox");
    stageImg.alt = "Stagebox inputs";
    stageImg.style.cssText = [
      "position:absolute",
      "left:" + stage.x + "px",
      "top:" + stage.y + "px",
      "width:" + stage.w + "px",
      "height:" + stage.h + "px",
      "object-fit:contain",
      "pointer-events:none",
      "user-select:none",
      "filter:drop-shadow(0 12px 24px rgba(0,0,0,.72))",
      "z-index:40"
    ].join(";");
    layer.appendChild(stageImg);

    const fohImg = document.createElement("img");
    fohImg.src = hardwareAssetFor("foh");
    fohImg.alt = "FOH console input map";
    fohImg.style.cssText = [
      "position:absolute",
      "left:" + foh.x + "px",
      "top:" + foh.y + "px",
      "width:" + foh.w + "px",
      "height:" + foh.h + "px",
      "object-fit:contain",
      "pointer-events:none",
      "user-select:none",
      "filter:drop-shadow(0 12px 24px rgba(0,0,0,.72))",
      "z-index:40"
    ].join(";");
    layer.appendChild(fohImg);
    sfLiv009DrawFohNormalizationCables(layer, foh);

    for (let i = 1; i <= 16; i += 1) {
      const col = (i - 1) % 8;
      const rel = i <= 8 ? SF_LIV009_STAGEBOX_TOP_REL[col] : SF_LIV009_STAGEBOX_FALSE_REL[col];
      const point = {
        x: stage.x + stage.w * rel[0],
        y: stage.y + stage.h * rel[1]
      };
      createLiv009StageboxInput(layer, "stagebox-input-" + i, point, i > 8);
    }
    sfLiv009ApplyLabelJackLayerCleanup();

    const kitImg = document.createElement("img");
    kitImg.src = sfRepoUrl("/assets/drums/svg/drum-kit-5-piece-8-hitboxes.svg");
    kitImg.alt = "Drum kit sources";
    kitImg.style.cssText = [
      "position:absolute",
      "left:" + drum.x + "px",
      "top:" + drum.y + "px",
      "width:" + drum.w + "px",
      "height:" + drum.h + "px",
      "object-fit:contain",
      "pointer-events:none",
      "user-select:none",
      "filter:drop-shadow(0 18px 28px rgba(0,0,0,.66))",
      "z-index:70"
    ].join(";");
    layer.appendChild(kitImg);

    const panel = document.createElement("div");
    panel.className = "sf-native-liv009-source-panel";
    panel.style.cssText = [
      "position:absolute",
      "left:" + sourcePanel.x + "px",
      "top:" + sourcePanel.y + "px",
      "width:" + sourcePanel.w + "px",
      "min-width:320px",
      "max-width:430px",
      "padding:12px 16px 14px",
      "box-sizing:border-box",
      "border-radius:0",
      "border:1px solid rgba(65,91,132,.55)",
      "background:linear-gradient(180deg,rgba(22,39,65,.96),rgba(13,26,45,.96))",
      "box-shadow:0 18px 36px rgba(0,0,0,.42)",
      "pointer-events:auto",
      "z-index:2400"
    ].join(";");

    const panelTitle = document.createElement("div");
    panelTitle.textContent = "DRUM KIT SOURCES";
    panelTitle.style.cssText = [
      "margin:0 0 8px",
      "color:#ffe66c",
      "font:900 14px system-ui,-apple-system,Segoe UI,sans-serif",
      "letter-spacing:.14em",
      "text-transform:uppercase"
    ].join(";");
    panel.appendChild(panelTitle);

    const grid = document.createElement("div");
    grid.style.cssText = [
      "display:grid",
      "grid-template-columns:repeat(3,minmax(0,1fr))",
      "gap:8px"
    ].join(";");
    panel.appendChild(grid);

    [
      ["kick", "Kick"],
      ["snare", "Snare"],
      ["hi-hat", "Hi-hat"],
      ["high-rack-tom", "Rack Tom 1"],
      ["low-rack-tom", "Rack Tom 2"],
      ["floor-tom", "Floor Tom"],
      ["overhead-left-crash", "OH L"],
      ["overhead-right-ride", "OH R"]
    ].forEach(item => createLiv009SourceButton(layer, grid, item[0], item[1]));

    layer.appendChild(panel);

    [
      ["kick", "Kick", { x: 0.48, y: 0.43, w: 0.24, h: 0.36 }],
      ["snare", "Snare", { x: 0.36, y: 0.56, w: 0.18, h: 0.22 }],
      ["hi-hat", "Hi-hat", { x: 0.22, y: 0.39, w: 0.20, h: 0.28 }],
      ["high-rack-tom", "Rack Tom 1", { x: 0.40, y: 0.32, w: 0.17, h: 0.22 }],
      ["low-rack-tom", "Rack Tom 2", { x: 0.54, y: 0.31, w: 0.17, h: 0.22 }],
      ["floor-tom", "Floor Tom", { x: 0.66, y: 0.56, w: 0.20, h: 0.24 }],
      ["overhead-left-crash", "OH L", { x: 0.29, y: 0.22, w: 0.22, h: 0.22 }],
      ["overhead-right-ride", "OH R", { x: 0.77, y: 0.29, w: 0.24, h: 0.26 }]
    ].forEach(item => createLiv009DrumHitbox(layer, item[0], item[1], drum, item[2]));


    Array.from(layer.querySelectorAll("div")).forEach(el => {
      const text = (el.innerText || el.textContent || "").trim().toUpperCase();
      const labelKeyByText = {
        "MAIN PA + IEM MONITOR FEED": "main-pa-iem-monitor-feed",
        "MONITOR CONSOLE OUTPUTS": "monitor-console-outputs",
        "3-WAY CROSSOVER": "3-way-crossover",
        "HIGH AMP": "high-amp",
        "MID AMP": "mid-amp",
        "LOW AMP": "low-amp",
        "LEFT LINE ARRAY INPUTS": "left-line-array-inputs",
        "RIGHT LINE ARRAY INPUTS": "right-line-array-inputs",
        "IEM PACK 1": "iem-pack-1",
        "IEM PACK 2": "iem-pack-2",
        "IEM PACK 3": "iem-pack-3"
      };
      if (labelKeyByText[text]) {
        el.dataset.sfLiveDevLabelKey = labelKeyByText[text];
      }
    });

    surface.appendChild(layer);
    redrawCables(layer);
    installCableDrag(layer);
    sfLiv020ApplyHitboxLayoutLock("after-renderLiv020MainPaAndIem");
    setTimeout(function() { sfLiv020ApplyHitboxLayoutLock("after-renderLiv020MainPaAndIem-timeout-0"); }, 0);
    setTimeout(function() { sfLiv020ApplyHitboxLayoutLock("after-renderLiv020MainPaAndIem-timeout-100"); }, 100);
    setTimeout(function() { sfLiv020ApplyHitboxLayoutLock("after-renderLiv020MainPaAndIem-timeout-500"); }, 500);
    sfLiv020ApplyHitboxLayoutLock(layer, "after-installCableDrag");
    sfLiv009BindHintGate();
    if(typeof sfLiv009SyncHintGate === 'function') sfLiv009SyncHintGate();
    sfLiv009ApplyLabelJackLayerCleanup();
    sfLiv009InstallHitboxTransparencyStyle();
    sfLiv009AlignStageboxHitboxes();
    setTimeout(sfLiv009AlignStageboxHitboxes, 80);
    setTimeout(sfLiv009AlignStageboxHitboxes, 220);
    setTimeout(sfLiv009AlignStageboxHitboxes, 420);
    console.log("[Signal Flow] LIV-009 dedicated drum renderer mounted.");
  }



  function renderLiv019IemFxFromLiv009Layout(surface, adapter) {
    const level = buildLevelGeometry(surface);
    const rect = level.rect;
    const boardHeight = Math.max(760, Math.ceil(rect.height || surface.getBoundingClientRect().height || 0));
    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    surface.querySelectorAll(".sfLiveNativeSurfaceScrollSpacer").forEach(el => el.remove());

    // LIV-028 is a full visual scaffold. Remove legacy generated patch rows so
    // old digital nodes do not visually cover or intercept the scaffold.
    Array.from(surface.children).forEach(child => {
      if (
        child.classList &&
        !child.classList.contains("sf-live-native-layer") &&
        !child.classList.contains("sfLiveNativeSurfaceScrollSpacer")
      ) {
        child.remove();
      }
    });

    surface.classList.add("sf-live-native-scroll-host");
    surface.style.setProperty("--sf-live-native-board-height", boardHeight + "px");
    surface.style.setProperty("overflow", "auto", "important");
    surface.style.setProperty("overflow-x", "auto", "important");
    surface.style.setProperty("overflow-y", "auto", "important");
    applyNativeViewportContract(surface, boardHeight);

    const viewport = surface.closest(".sf-live-native-viewport") || surface.parentElement;
    if (viewport) {
      viewport.style.setProperty("overflow", "auto", "important");
      viewport.style.setProperty("overflow-x", "auto", "important");
      viewport.style.setProperty("overflow-y", "auto", "important");
      viewport.style.setProperty("-webkit-overflow-scrolling", "touch");
    }

    const layer = document.createElement("div");
    layer.className = "sf-live-native-layer sf-live-native-level-liv-019";
    layer.style.cssText = [
      "position:absolute",
      "inset:0",
      "z-index:9990",
      "isolation:isolate",
      "pointer-events:none",
      "overflow:visible",
      "border-radius:16px",
      "background:linear-gradient(180deg,rgba(8,24,19,.96),rgba(6,17,15,.98))"
    ].join(";");
    layer.style.setProperty("height", boardHeight + "px", "important");
    layer.style.setProperty("min-height", boardHeight + "px", "important");

    const width = Math.max(980, rect.width || surface.getBoundingClientRect().width || 980);

    // LIV-019 v6r385: corrected gear placement locked from Gear Mover export.
    const gear = {
      stagebox: { x: 32, y: -4, w: 464, z: 50, label: "STAGE BOX", src: hardwareAssetFor("stagebox"), alt: "Stagebox inputs" },
      foh: { x: 496, y: -142, w: 754, z: 50, label: "16CH FOH CONSOLE", src: "/assets/live-sound/svg/hardware/16ch FOH console0.svg", alt: "16 channel FOH console" },
      drum: { x: 15, y: 190, w: 503, z: 70, label: "DRUM KIT", src: "/assets/drums/svg/drum-kit-5-piece-8-hitboxes.svg", alt: "Drum kit sources" },

      iem1: { x: 574, y: 180, w: 300, z: 55, label: "IEM UNIT 1", src: "/assets/live-sound/svg/hardware/iem-wireless-rack-front.svg", alt: "IEM wireless rack unit 1" },
      iem2: { x: 888, y: 180, w: 300, z: 55, label: "IEM UNIT 2", src: "/assets/live-sound/svg/hardware/iem-wireless-rack-front.svg", alt: "IEM wireless rack unit 2" },
      iem3: { x: 754, y: 272, w: 300, z: 55, label: "IEM UNIT 3", src: "/assets/live-sound/svg/hardware/iem-wireless-rack-front.svg", alt: "IEM wireless rack unit 3" },

      reverb: { x: 574, y: 385, w: 316, z: 55, label: "STEREO REVERB", src: "/assets/live-sound/svg/hardware/power-amp-liv006-system-delay-processor.svg", alt: "Stereo reverb processor" },
      delay: { x: 900, y: 395, w: 316, z: 55, label: "STEREO DELAY", src: "/assets/live-sound/svg/hardware/power-amp-liv006-system-delay-processor.svg", alt: "Stereo delay processor" }
    };

    function gearGroup(key) {
      const g = gear[key];
      const wrap = document.createElement("div");
      wrap.className = "sf-liv019-gear";
      wrap.dataset.liv019GearKey = key;
      wrap.style.cssText = [
        "position:absolute",
        "left:" + Math.round(g.x) + "px",
        "top:" + Math.round(g.y) + "px",
        "width:" + Math.round(g.w) + "px",
        "z-index:" + (g.z || 60),
        "pointer-events:none"
      ].join(";");

      const lbl = document.createElement("div");
      lbl.className = "sf-liv019-gear-label";
      lbl.textContent = g.label;
      lbl.style.cssText = [
        "height:20px",
        "color:#ffe66c",
        "font:900 11px system-ui,-apple-system,Segoe UI,sans-serif",
        "letter-spacing:.08em",
        "text-transform:uppercase",
        "text-shadow:0 2px 4px rgba(0,0,0,.78)",
        "white-space:nowrap"
      ].join(";");
      wrap.appendChild(lbl);

      const img = document.createElement("img");
      img.src = sfRepoUrl(g.src);
      img.alt = g.alt || key;
      img.style.cssText = [
        "display:block",
        "width:100%",
        "height:auto",
        "object-fit:contain",
        "pointer-events:none",
        "user-select:none",
        "filter:drop-shadow(0 12px 24px rgba(0,0,0,.72))"
      ].join(";");
      wrap.appendChild(img);

      layer.appendChild(wrap);
      return { wrap, img, x: g.x, y: g.y + 20, w: g.w };
    }
    function processorLedRingRecolor(parent, color) {
      // LIV-019 v6r386: replace the processor display-frame LED rings.
      // This covers the existing colored display rings and redraws them in the effect color.
      parent.querySelectorAll(".sf-liv019-processor-display-frame-recolor").forEach(el => el.remove());

      const frames = [
        // x%, y%, w%, h% for the three processor display sections
        [5.1, 27.7, 24.5, 21.3],
        [39.1, 27.7, 24.5, 21.3],
        [72.1, 27.7, 23.7, 21.3]
      ];

      frames.forEach(([x, y, w, h]) => {
        const cover = document.createElement("div");
        cover.className = "sf-liv019-processor-display-frame-recolor";
        cover.style.cssText = [
          "position:absolute",
          "left:" + x + "%",
          "top:" + y + "%",
          "width:" + w + "%",
          "height:" + h + "%",
          "box-sizing:border-box",
          "border-radius:5px",
          "background:linear-gradient(180deg,rgba(9,18,21,.98),rgba(6,12,14,.98))",
          "border:3px solid " + color,
          "box-shadow:inset 0 0 0 2px rgba(0,0,0,.86)",
          "pointer-events:none",
          "z-index:3"
        ].join(";");
        parent.appendChild(cover);

        const inner = document.createElement("div");
        inner.style.cssText = [
          "position:absolute",
          "left:8%",
          "right:8%",
          "top:18%",
          "bottom:18%",
          "border-radius:3px",
          "border:2px dashed " + color,
          "opacity:.86",
          "box-sizing:border-box",
          "pointer-events:none"
        ].join(";");
        cover.appendChild(inner);

        const line1 = document.createElement("div");
        line1.style.cssText = [
          "position:absolute",
          "left:16%",
          "right:16%",
          "top:38%",
          "height:2px",
          "background:" + color,
          "opacity:.5",
          "pointer-events:none"
        ].join(";");
        cover.appendChild(line1);

        const line2 = document.createElement("div");
        line2.style.cssText = [
          "position:absolute",
          "left:16%",
          "right:16%",
          "top:58%",
          "height:2px",
          "background:" + color,
          "opacity:.32",
          "pointer-events:none"
        ].join(";");
        cover.appendChild(line2);
      });
    }


    function label(text, x, y, size, w) {
      const el = document.createElement("div");
      el.textContent = text;
      el.style.cssText = [
        "position:absolute",
        "left:" + Math.round(x) + "px",
        "top:" + Math.round(y) + "px",
        "width:" + Math.round(w || 80) + "px",
        "color:#ffe66c",
        "font:900 " + (size || 8) + "px system-ui,-apple-system,Segoe UI,sans-serif",
        "letter-spacing:.05em",
        "text-align:center",
        "text-transform:uppercase",
        "pointer-events:none",
        "z-index:7600",
        "text-shadow:0 2px 4px rgba(0,0,0,.75)"
      ].join(";");
      layer.appendChild(el);
      return el;
    }

    function jackAt(key, x, y, text, ghost, size) {
      createJackNode(layer, key, { x, y }, text, !!ghost);
      const el = layer.querySelector('[data-node-key="' + key + '"]');
      if (el) {
        const s = size || 26;
        el.style.setProperty("left", Math.round(x - s / 2) + "px", "important");
        el.style.setProperty("top", Math.round(y - s / 2) + "px", "important");
        el.style.setProperty("width", s + "px", "important");
        el.style.setProperty("height", s + "px", "important");
        el.style.setProperty("z-index", "7200", "important");
        el.style.setProperty("pointer-events", "auto", "important");
      }
      return el;
    }

    createLabel(layer, "DRUM INPUTS + IEM SENDS + FX RETURNS", 28, 28, 12);

    const stagebox = gearGroup("stagebox");
    const foh = gearGroup("foh");
    const drum = gearGroup("drum");
    const iem1 = gearGroup("iem1");
    const iem2 = gearGroup("iem2");
    const iem3 = gearGroup("iem3");
    const reverb = gearGroup("reverb");
    const delay = gearGroup("delay");


    function gearText(parent, text, xPct, yPct, opts = {}) {
      const el = document.createElement("div");
      el.textContent = text;
      el.style.cssText = [
        "position:absolute",
        "left:" + xPct + "%",
        "top:" + yPct + "%",
        "transform:translate(-50%,-50%)",
        "min-width:" + (opts.width || 44) + "px",
        "padding:1px 4px",
        "border-radius:3px",
        "background:" + (opts.background || "rgba(0,0,0,.82)"),
        "color:" + (opts.color || "#ffe66c"),
        "font:900 " + (opts.size || 9) + "px system-ui,-apple-system,Segoe UI,sans-serif",
        "letter-spacing:.04em",
        "text-align:center",
        "text-transform:uppercase",
        "pointer-events:none",
        "z-index:4",
        "box-sizing:border-box"
      ].join(";");
      parent.appendChild(el);
      return el;
    }

    [
      [iem1, "IEM 1", "IEM 2"],
      [iem2, "IEM 3", "IEM 4"],
      [iem3, "IEM 5", "IEM 6"]
    ].forEach(([unit, aLabel, bLabel], idx) => {
      gearText(unit.wrap, aLabel + " INPUT", 28, 64, { width: 82, size: 7, color: "#ffffff" });
      gearText(unit.wrap, bLabel + " INPUT", 72, 64, { width: 82, size: 7, color: "#ffffff" });
      gearText(unit.wrap, "INPUT A", 28, 74, { width: 58 });
      gearText(unit.wrap, "INPUT B", 72, 74, { width: 58 });
      gearText(unit.wrap, aLabel, 28, 88, { width: 52, size: 8, color: "#bdeaff" });
      gearText(unit.wrap, bLabel, 72, 88, { width: 52, size: 8, color: "#bdeaff" });
    });

    gearText(foh.wrap, "AUX SENDS", 52, 36, { width: 90, size: 8, background: "rgba(0,0,0,.88)" });
    gearText(foh.wrap, "BUS OUTS", 70, 36, { width: 86, size: 8, background: "rgba(0,0,0,.88)" });

    processorLedRingRecolor(reverb.wrap, "#4cb7ff");
    gearText(reverb.wrap, "REVERB", 50, 24, { width: 80, size: 10, background: "rgba(0,20,50,.86)", color: "#a9d6ff" });
    gearText(reverb.wrap, "IN L", 19, 72, { width: 38 });
    gearText(reverb.wrap, "IN R", 32, 72, { width: 38 });
    gearText(reverb.wrap, "LINK", 50, 72, { width: 44, color: "#ffb86b" });
    gearText(reverb.wrap, "OUT L", 68, 72, { width: 44 });
    gearText(reverb.wrap, "OUT R", 81, 72, { width: 44 });

    processorLedRingRecolor(delay.wrap, "#49f27a");
    gearText(delay.wrap, "DELAY", 50, 24, { width: 80, size: 10, background: "rgba(0,45,20,.86)", color: "#a8ffbd" });
    gearText(delay.wrap, "IN L", 19, 72, { width: 38 });
    gearText(delay.wrap, "IN R", 32, 72, { width: 38 });
    gearText(delay.wrap, "SIDE", 50, 72, { width: 44, color: "#ffb86b" });
    gearText(delay.wrap, "OUT L", 68, 72, { width: 44 });
    gearText(delay.wrap, "OUT R", 81, 72, { width: 44 });


    // Rough initial route hitboxes so the level remains interactive while gear is being placed.
    // Final hitboxes should be mapped with the Hitbox Tool after gear placement is locked.

    const stageH = stagebox.w * 260 / 860;
    // LIV-019 uses an 8-input drum stagebox. Do not generate the lower false row
    // from the LIV-009 16-input template; false/trap jacks for this board should
    // be added separately and remain visually neutral.
    for (let i = 1; i <= 8; i += 1) {
      const col = (i - 1) % 8;
      const rel = SF_LIV009_STAGEBOX_TOP_REL[col];
      const x = stagebox.x + stagebox.w * rel[0];
      const y = stagebox.y + stageH * rel[1];
      createLiv009StageboxInput(layer, "stagebox-input-" + i, { x, y }, false);
    }

    // Drum source panel + drum hitboxes from LIV-009.
    const drumH = drum.w * 1102 / 2048;
    const panel = document.createElement("div");
    panel.className = "sf-native-liv009-source-panel sf-native-liv019-source-panel";
    panel.style.cssText = [
      "position:absolute",
      "left:" + Math.round(drum.x + 8) + "px",
      "top:" + Math.round(drum.y + drumH - 10) + "px",
      "width:340px",
      "padding:10px 12px 12px",
      "box-sizing:border-box",
      "border:1px solid rgba(65,91,132,.55)",
      "background:linear-gradient(180deg,rgba(22,39,65,.96),rgba(13,26,45,.96))",
      "box-shadow:0 18px 36px rgba(0,0,0,.42)",
      "pointer-events:auto",
      "z-index:2400"
    ].join(";");

    const grid = document.createElement("div");
    grid.style.cssText = "display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px";
    panel.appendChild(grid);
    [
      ["kick", "Kick"], ["snare", "Snare"], ["hi-hat", "Hi-Hat"], ["high-rack-tom", "Rack 1"],
      ["low-rack-tom", "Rack 2"], ["floor-tom", "Floor"], ["overhead-left-crash", "OH L"], ["overhead-right-ride", "OH R"]
    ].forEach(item => createLiv009SourceButton(layer, grid, item[0], item[1]));
    layer.appendChild(panel);

    [
      ["kick", "Kick", { x: 0.48, y: 0.43, w: 0.24, h: 0.36 }],
      ["snare", "Snare", { x: 0.36, y: 0.56, w: 0.18, h: 0.22 }],
      ["hi-hat", "Hi-Hat", { x: 0.22, y: 0.39, w: 0.20, h: 0.28 }],
      ["high-rack-tom", "Rack Tom 1", { x: 0.40, y: 0.32, w: 0.17, h: 0.22 }],
      ["low-rack-tom", "Rack Tom 2", { x: 0.54, y: 0.31, w: 0.17, h: 0.22 }],
      ["floor-tom", "Floor Tom", { x: 0.66, y: 0.56, w: 0.20, h: 0.24 }],
      ["overhead-left-crash", "OH L", { x: 0.29, y: 0.22, w: 0.22, h: 0.22 }],
      ["overhead-right-ride", "OH R", { x: 0.77, y: 0.29, w: 0.24, h: 0.26 }]
    ].forEach(item => createLiv009DrumHitbox(layer, item[0], item[1], { x: drum.x, y: drum.y, w: drum.w, h: drumH }, item[2]));

    // LIV-019 v6r403: FOH hitboxes rebuilt from the locked FOH labels.
    // Auxes are 1-8. Buses are mono outs 1-12.
    // FX sends are mono bus outs feeding stereo FX sides:
    // Bus 1 -> Reverb L, Bus 2 -> Reverb R, Bus 3 -> Delay L, Bus 4 -> Delay R.
    const FOH_IMG_H = foh.w * 1628 / 3024;

    function fohNodeAt(key, xPct, yPct, labelText, ghost, size = 24) {
      return jackAt(
        key,
        foh.x + foh.w * (xPct / 100),
        foh.y + FOH_IMG_H * (yPct / 100),
        labelText,
        !!ghost,
        size
      );
    }

    const FOH_INPUT_POINTS = {
      1: [9.6, 42.0], 2: [14.3, 42.0], 3: [19.0, 42.0], 4: [23.95, 42.0],
      5: [28.65, 42.0], 6: [33.35, 42.0], 7: [38.05, 42.0], 8: [43.0, 42.0],
      9: [9.5, 54.0], 10: [14.3, 54.0], 11: [19.1, 54.0], 12: [23.9, 54.0],
      13: [28.5, 54.0], 14: [33.3, 54.0], 15: [38.1, 54.0], 16: [42.9, 54.0]
    };

    Object.entries(FOH_INPUT_POINTS).forEach(([ch, pt]) => {
      const n = Number(ch);
      fohNodeAt(
        "foh-liv019-input-" + ch,
        pt[0],
        pt[1],
        "FOH Input Channel " + ch,
        !(n >= 9 && n <= 12),
        24
      );
    });

    const FOH_AUX_POINTS = {
      1: [49.35, 47.5], 2: [54.55, 47.5],
      3: [49.5, 53.5], 4: [54.45, 53.5],
      5: [49.4, 60.25], 6: [54.35, 60.25],
      7: [49.55, 67.5], 8: [54.5, 67.5]
    };

    Object.entries(FOH_AUX_POINTS).forEach(([aux, pt]) => {
      const n = Number(aux);
      fohNodeAt(
        "foh-liv019-aux-" + aux + "-output",
        pt[0],
        pt[1],
        "FOH Aux " + aux + " Output",
        n > 5,
        24
      );
    });

    const FOH_BUS_POINTS = {
      1: [60.75, 43.0], 2: [65.55, 43.0], 3: [70.35, 43.0], 4: [74.9, 43.0],
      5: [60.7, 51.5], 6: [65.5, 51.5], 7: [70.3, 51.5], 8: [74.85, 51.5],
      9: [61.0, 59.5], 10: [65.55, 59.5], 11: [70.1, 59.5], 12: [74.9, 59.5]
    };

    Object.entries(FOH_BUS_POINTS).forEach(([bus, pt]) => {
      const n = Number(bus);
      fohNodeAt(
        "foh-liv019-bus-" + bus + "-output",
        pt[0],
        pt[1],
        "FOH Bus " + bus + " Output",
        n > 4,
        24
      );
    });

    fohNodeAt("foh-liv019-main-left-output", 85.25, 46.5, "FOH Main L Output", true, 26);
    fohNodeAt("foh-liv019-main-right-output", 91.25, 46.5, "FOH Main R Output", true, 26);

    // IEM jacks: two per reused wireless rack. IEM 6 is false/trap.
    function iemInputJack(unit, suffix, key, text, ghost) {
      const relX = suffix === "a" ? 0.28 : 0.72;
      const relY = 0.73;
      const h = unit.w * 0.34;
      jackAt(key, unit.x + unit.w * relX, unit.y + h * relY, text, ghost, 28);
    }

    iemInputJack(iem1, "a", "liv019-iem-1-input", "IEM 1 Input", false);
    iemInputJack(iem1, "b", "liv019-iem-2-input", "IEM 2 Input", false);
    iemInputJack(iem2, "a", "liv019-iem-3-input", "IEM 3 Input", false);
    iemInputJack(iem2, "b", "liv019-iem-4-input", "IEM 4 Input", false);
    iemInputJack(iem3, "a", "liv019-iem-5-input", "IEM 5 Input", false);
    iemInputJack(iem3, "b", "liv019-iem-6-input", "IEM 6 Input", true);

    // Processor jacks: reused LIV-006 processor asset, rough positions until Hitbox Tool.
    function processorJacks(prefix, box, labelPrefix) {
      const h = box.w * 0.34;
      [
        [prefix + "-left-input", 0.19, 0.72, labelPrefix + " L Input", false],
        [prefix + "-right-input", 0.32, 0.72, labelPrefix + " R Input", false],
        [prefix + "-link", 0.50, 0.72, labelPrefix + " Link", true],
        [prefix + "-left-output", 0.68, 0.72, labelPrefix + " L Output", false],
        [prefix + "-right-output", 0.81, 0.72, labelPrefix + " R Output", false]
      ].forEach(item => {
        jackAt(item[0], box.x + box.w * item[1], box.y + h * item[2], item[3], item[4], 24);
      });
    }

    processorJacks("liv019-reverb", reverb, "Stereo Reverb");
    processorJacks("liv019-delay", delay, "Stereo Delay");

    surface.appendChild(layer);
    const spacer = document.createElement("div");
    spacer.className = "sfLiveNativeSurfaceScrollSpacer sf-liv019-scroll-spacer";
    spacer.style.cssText = "position:relative;display:block;width:1px;opacity:0;pointer-events:none";
    spacer.style.setProperty("height", boardHeight + "px", "important");
    spacer.style.setProperty("min-height", boardHeight + "px", "important");
    surface.appendChild(spacer);
    redrawCables(layer);
    installCableDrag(layer);

    console.log("[Signal Flow] LIV-019 corrected gear renderer mounted v6r403.");
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
    img.src = sfRepoUrl(src);
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
    if (LEVEL_ID !== "LIV-028" || document.querySelector(".sf-liv028-visual-scaffold")) return;

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
    if (LEVEL_ID !== "LIV-028" || document.querySelector(".sf-liv028-visual-scaffold")) return;

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
    if (LEVEL_ID !== "LIV-028" || document.querySelector(".sf-liv028-visual-scaffold")) return;

    const targetLayer = layer || document.querySelector(".sf-live-native-layer");
    if (!targetLayer) {
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
    if (LEVEL_ID !== "LIV-028" || document.querySelector(".sf-liv028-visual-scaffold")) return;

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
    if (LEVEL_ID !== "LIV-028" || document.querySelector(".sf-liv028-visual-scaffold")) return;

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
    img.src = sfRepoUrl("/assets/live-sound/svg/hardware/stagebox-snake-head-16x2-aes.svg");
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

    if (!["LIV-003", "LIV-006", "LIV-007", "LIV-015", "LIV-016", "LIV-020", "LIV-021", "LIV-025", "LIV-028"].includes(LEVEL_ID)) createNativePrewireIcons(layer, adapter, level);

    if (LEVEL_ID === "LIV-002" || LEVEL_ID === "LIV-012") {
      const aux = getNodePoint(adapter, level, "foh-aux-1-output");
      const foh = (level.panels || []).find(panel => panel.id === "foh" || panel.kind === "foh");
      const labelX = foh ? foh.x + foh.width * (798 / 1120) : aux.x + 44;
      const labelY = aux.y - 48;

      // Player-facing terminology: these jacks function as monitor aux outputs
      // in the LIV-002/LIV-012 wedge boards. Do not rename the shared SVG asset.
      mask(labelX, labelY, 120, 16);
      plaque("AUX OUTS", labelX, labelY, 94);
    }

    // LIV-025 labels are placed with the label dev tool, not hardcoded plaques.

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


  function sfLiv010AssetPath(kind) {
    return (LEVEL.assetOverrides && LEVEL.assetOverrides[kind]) ? sfRepoUrl(LEVEL.assetOverrides[kind]) : hardwareAssetFor(kind);
  }

  function sfLiv010PanelHeight(panel) {
    const aspect = {
      foh: 260 / 1120,
      crossover: 250 / 940,
      "amp-high": 240 / 940,
      "amp-mid": 240 / 940,
      "amp-low": 240 / 940,
      "speaker-left": 620 / 260,
      "speaker-right": 620 / 260,
      "pa-visual": 870 / 857
    }[panel.kind] || 0.25;
    return panel.w * aspect;
  }

  function sfLiv010Point(panel, relX, relY) {
    return {
      x: panel.x + panel.w * relX,
      y: panel.y + sfLiv010PanelHeight(panel) * relY
    };
  }

  function sfLiv010PlaceImage(layer, panel, options) {
    const img = document.createElement("img");
    img.src = sfLiv010AssetPath(panel.kind);
    img.alt = options && options.alt ? options.alt : panel.kind;
    img.style.cssText = [
      "position:absolute",
      "left:" + panel.x + "px",
      "top:" + panel.y + "px",
      "width:" + panel.w + "px",
      "height:" + sfLiv010PanelHeight(panel) + "px",
      "object-fit:contain",
      "pointer-events:none",
      "user-select:none",
      "filter:drop-shadow(0 12px 24px rgba(0,0,0,.70))",
      "z-index:" + ((options && options.zIndex) || 40)
    ].join(";");
    layer.appendChild(img);
    return img;
  }

  function sfLiv010CreateJack(layer, key, point, label, falseTarget) {
    createJackNode(layer, key, point, label, !!falseTarget);
    const el = layer.querySelector('[data-node-key="' + key + '"]');
    if(!el) return;
    el.classList.add("sf-native-liv010-jack");
    el.dataset.sfNativePointX = String(point.x);
    el.dataset.sfNativePointY = String(point.y);
    el.style.zIndex = "2400";
    el.style.width = falseTarget ? "30px" : "36px";
    el.style.height = falseTarget ? "30px" : "36px";
    el.style.transform = "translate(-50%,-50%)";
  }

  
  function sfLiv010BuildPanels(width) {
    /*
      v6r204 locked vertical stack. This is deliberately explicit so LIV-010
      cannot fall back into the generic/right-column layout:
        FOH centered
        3-way crossover centered below FOH
        High amp below crossover
        Mid amp below high amp
        Low amp below mid amp
        PA visual below low amp
        Left/right line-array input panels flank the PA visual.
    */
    const centerX = width / 2;
    const margin = Math.max(18, Math.min(34, width * 0.025));

    const rackW = Math.max(600, Math.min(width * 0.74, 780));
    const rackX = Math.round(centerX - rackW / 2);

    const foh = { kind: "foh", x: rackX, y: 72, w: rackW };
    const crossover = { kind: "crossover", x: rackX, y: Math.round(foh.y + sfLiv010PanelHeight(foh) + 54), w: rackW };
    const highAmp = { kind: "amp-high", x: rackX, y: Math.round(crossover.y + sfLiv010PanelHeight(crossover) + 46), w: rackW };
    const midAmp = { kind: "amp-mid", x: rackX, y: Math.round(highAmp.y + sfLiv010PanelHeight(highAmp) + 42), w: rackW };
    const lowAmp = { kind: "amp-low", x: rackX, y: Math.round(midAmp.y + sfLiv010PanelHeight(midAmp) + 42), w: rackW };

    const paW = Math.max(360, Math.min(width * 0.42, 520));
    const speakerW = Math.max(120, Math.min(width * 0.13, 160));
    const gap = Math.max(18, Math.min(width * 0.024, 30));
    let groupW = speakerW + gap + paW + gap + speakerW;

    let finalPaW = paW;
    let finalSpeakerW = speakerW;
    let finalGap = gap;
    if (groupW > width - margin * 2) {
      finalGap = Math.max(14, gap * 0.75);
      finalSpeakerW = Math.max(104, Math.min(speakerW, (width - margin * 2 - finalPaW - finalGap * 2) / 2));
      if (finalSpeakerW < 110) {
        finalPaW = Math.max(300, width - margin * 2 - finalGap * 2 - 220);
        finalSpeakerW = Math.max(104, (width - margin * 2 - finalPaW - finalGap * 2) / 2);
      }
      groupW = finalSpeakerW + finalGap + finalPaW + finalGap + finalSpeakerW;
    }

    const groupX = Math.round(centerX - groupW / 2);
    const paVisual = {
      kind: "pa-visual",
      x: Math.round(groupX + finalSpeakerW + finalGap),
      y: Math.round(lowAmp.y + sfLiv010PanelHeight(lowAmp) + 74),
      w: Math.round(finalPaW)
    };

    const paH = sfLiv010PanelHeight(paVisual);
    const speakerPanelH = finalSpeakerW * (620 / 260);
    const speakerY = Math.round(paVisual.y + Math.max(0, (paH - speakerPanelH) / 2));

    return {
      foh,
      crossover,
      highAmp,
      midAmp,
      lowAmp,
      paVisual,
      speakerLeft: { kind: "speaker-left", x: Math.round(groupX), y: speakerY, w: Math.round(finalSpeakerW) },
      speakerRight: { kind: "speaker-right", x: Math.round(groupX + finalSpeakerW + finalGap + finalPaW + finalGap), y: speakerY, w: Math.round(finalSpeakerW) }
    };
  }


  
  function sfLiv010InstallStyle() {
    const old = document.getElementById("sf-liv010-dedicated-style");
    if(old) old.remove();

    const style = document.createElement("style");
    style.id = "sf-liv010-dedicated-style";
    style.textContent = `
      .sf-live-native-scroll-host-liv010 {
        position: relative !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        overscroll-behavior: contain !important;
        max-height: min(72vh, 760px) !important;
        scrollbar-gutter: stable !important;
        touch-action: pan-y !important;
      }
      .sf-live-native-layer.sf-live-native-level-liv-010 {
        min-height: var(--sf-liv010-board-height, 2300px) !important;
        height: var(--sf-liv010-board-height, 2300px) !important;
        overflow: visible !important;
      }
      .sf-live-native-layer.sf-live-native-level-liv-010 .sf-native-jack {
        color: transparent !important;
        font-size: 0 !important;
        line-height: 0 !important;
      }
      .sf-live-native-layer.sf-live-native-level-liv-010 .sf-native-cables {
        z-index: 9000 !important;
        pointer-events: none !important;
      }
      .sf-live-native-layer.sf-live-native-level-liv-010 .sf-native-liv010-jack {
        pointer-events: auto !important;
        z-index: 2400 !important;
      }
      .sf-live-native-layer.sf-live-native-level-liv-010 .sf-native-liv010-jack:hover,
      .sf-live-native-layer.sf-live-native-level-liv-010 .sf-native-liv010-jack:focus-visible {
        outline: 2px solid rgba(125, 211, 252, .9) !important;
        outline-offset: 2px !important;
      }
      .sfLiv010SurfaceScrollSpacer {
        min-height: var(--sf-liv010-board-height, 2300px) !important;
        height: var(--sf-liv010-board-height, 2300px) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function installNativeScrollStyle() {
    if (document.getElementById("sf-live-native-shared-scroll-style")) return;
    const style = document.createElement("style");
    style.id = "sf-live-native-shared-scroll-style";
    style.textContent = `
      .sf-live-native-scroll-host {
        position: relative !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        overscroll-behavior: contain !important;
        max-height: min(72vh, 760px) !important;
        scrollbar-gutter: stable !important;
        touch-action: pan-y !important;
      }
      .sf-live-native-scroll-host .sf-live-native-layer {
        min-height: var(--sf-live-native-board-height, 820px) !important;
        overflow: visible !important;
      }
      .sfLiveNativeSurfaceScrollSpacer {
        min-height: var(--sf-live-native-board-height, 820px) !important;
        height: var(--sf-live-native-board-height, 820px) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function nativeViewportForSurface(surface) {
    if (!surface || !surface.closest) return surface;
    return surface.closest(".patchbay-wrap") || surface;
  }

  function applyNativeViewportContract(surface, boardHeight) {
    const viewport = nativeViewportForSurface(surface);
    if (!viewport) return surface;

    if (getComputedStyle(viewport).position === "static") {
      viewport.style.position = "relative";
    }

    viewport.classList.add("sf-live-native-viewport");
    viewport.style.setProperty("overflow-y", "auto", "important");
    viewport.style.setProperty("overflow-x", "hidden", "important");
    viewport.style.setProperty("overscroll-behavior", "contain", "important");
    viewport.style.setProperty("-webkit-overflow-scrolling", "touch", "important");
    viewport.style.setProperty("touch-action", "pan-y", "important");
    viewport.style.setProperty("--sf-live-native-board-height", boardHeight + "px");

    console.log("[Signal Flow] Native viewport contract:", {
      levelId: LEVEL_ID,
      surfaceClass: surface.className,
      viewportClass: viewport.className,
      sameElement: viewport === surface,
      clientHeight: viewport.clientHeight,
      scrollHeight: viewport.scrollHeight,
      overflowY: getComputedStyle(viewport).overflowY
    });

    return viewport;
  }


  


  const LIV020_LOCKED_LAYOUT_WIDTH = 720;

  function sfLiv020ResponsiveXScale(layer) {
    if (LEVEL_ID !== "LIV-020" || !layer) return 1;

    const host = layer.parentElement || layer;
    const width = host.clientWidth || layer.getBoundingClientRect().width || LIV020_LOCKED_LAYOUT_WIDTH;
    if (width >= LIV020_LOCKED_LAYOUT_WIDTH) return 1;

    return Math.max(0.36, Math.min(1, (width - 18) / LIV020_LOCKED_LAYOUT_WIDTH));
  }

  function sfLiv020ScaleX(layer, value) {
    return Math.round(Number(value || 0) * sfLiv020ResponsiveXScale(layer));
  }

  function applyLiv020GearLock(layer) {
    if (!layer || layer.dataset.sfLiv020GearLockApplied === "1") return;
    layer.dataset.sfLiv020GearLockApplied = "1";

    const lock = {
      "monitor-console-outputs": { leftPx: -31, topPx: -150, widthPx: 782, zIndex: 40 },
      "3-way-crossover": { leftPx: 6, topPx: 205, widthPx: 420, zIndex: 40 },
      "high-amplifier": { leftPx: 6, topPx: 331, widthPx: 400, zIndex: 40 },
      "mid-amplifier": { leftPx: 6, topPx: 406, widthPx: 400, zIndex: 40 },
      "low-amplifier": { leftPx: 6, topPx: 481, widthPx: 400, zIndex: 40 },
      "pa-line-arrays-over-subs": { leftPx: 386, topPx: 168, widthPx: 360, zIndex: 47 },
      "left-line-array-input-panel": { leftPx: 388, topPx: 248, widthPx: 100, zIndex: 49 },
      "right-line-array-input-panel": { leftPx: 604, topPx: 248, widthPx: 100, zIndex: 49 },
      "iem-pack-1": { leftPx: 18, topPx: 580, widthPx: 380, zIndex: 44 },
      "iem-pack-2": { leftPx: 110, topPx: 660, widthPx: 400, zIndex: 44 },
      "iem-pack-3": { leftPx: 212, topPx: 750, widthPx: 380, zIndex: 44 }
    };

    function keyFor(el, i) {
      if (el.dataset.sfLiveDevGearKey) return el.dataset.sfLiveDevGearKey;
      const raw = el.alt || el.getAttribute("src") || ("gear-" + i);
      return raw
        .split("/")
        .pop()
        .replace(/\.[a-z0-9]+$/i, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    Array.from(layer.querySelectorAll("img")).forEach((el, i) => {
      const key = keyFor(el, i);
      const spec = lock[key];
      if (!spec) return;

      el.dataset.sfLiveDevGearKey = key;
      el.style.position = "absolute";
      el.style.left = sfLiv020ScaleX(layer, spec.leftPx) + "px";
      el.style.top = spec.topPx + "px";
      el.style.width = Math.max(80, sfLiv020ScaleX(layer, spec.widthPx)) + "px";
      el.style.height = "auto";
      el.style.zIndex = String(spec.zIndex);
    });

    console.log("[Signal Flow] LIV-020 gear layout lock applied", lock);
  }


  const LIV020_LABEL_LAYOUT_LOCK = {
    "main-pa-iem-monitor-feed": { leftPx: 4, topPx: 5, fontSize: "12px", zIndex: "46" },
    "monitor-console-outputs": { leftPx: 46, topPx: 93, fontSize: "11px", zIndex: "36" },
    "3-way-crossover": { leftPx: 28, topPx: 218, fontSize: "11px", zIndex: "50" },
    "high-amp": { leftPx: 173, topPx: 369, fontSize: "11px", zIndex: "52" },
    "mid-amp": { leftPx: 178, topPx: 449, fontSize: "11px", zIndex: "49" },
    "low-amp": { leftPx: 173, topPx: 534, fontSize: "11px", zIndex: "48" },
    "left-line-array-inputs": { leftPx: 373, topPx: 271, fontSize: "9px", zIndex: "51" },
    "right-line-array-inputs": { leftPx: 564, topPx: 271, fontSize: "10px", zIndex: "56" },
    "iem-pack-1": { leftPx: 130, topPx: 583, fontSize: "11px", zIndex: "49" },
    "iem-pack-2": { leftPx: 232, topPx: 663, fontSize: "11px", zIndex: "49" },
    "iem-pack-3": { leftPx: 324, topPx: 753, fontSize: "12px", zIndex: "50" }
  };



  const LIV020_HITBOX_LAYOUT_LOCK = {
  "liv020-aux-1-output": {
    "leftPx": 350,
    "topPx": 68,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 358,
    "centerY": 75
  },
  "liv020-aux-2-output": {
    "leftPx": 369,
    "topPx": 68,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 376,
    "centerY": 75
  },
  "liv020-aux-3-output": {
    "leftPx": 384,
    "topPx": 70,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 391,
    "centerY": 78
  },
  "liv020-aux-4-output": {
    "leftPx": 401,
    "topPx": 70,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 408,
    "centerY": 77
  },
  "liv020-aux-5-output": {
    "leftPx": 420,
    "topPx": 68,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 427,
    "centerY": 74
  },
  "liv020-crossover-high-left-output": {
    "leftPx": 223,
    "topPx": 240,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 230,
    "centerY": 247
  },
  "liv020-crossover-high-right-output": {
    "leftPx": 264,
    "topPx": 240,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 271,
    "centerY": 246
  },
  "liv020-crossover-left-input": {
    "leftPx": 74,
    "topPx": 262,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 81,
    "centerY": 269
  },
  "liv020-crossover-low-left-output": {
    "leftPx": 224,
    "topPx": 293,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 231,
    "centerY": 300
  },
  "liv020-crossover-low-right-output": {
    "leftPx": 265,
    "topPx": 293,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 272,
    "centerY": 300
  },
  "liv020-crossover-mid-left-output": {
    "leftPx": 223,
    "topPx": 266,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 230,
    "centerY": 273
  },
  "liv020-crossover-mid-right-output": {
    "leftPx": 264,
    "topPx": 266,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 271,
    "centerY": 272
  },
  "liv020-crossover-right-input": {
    "leftPx": 112,
    "topPx": 262,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 119,
    "centerY": 269
  },
  "liv020-high-amp-left-input": {
    "leftPx": 73,
    "topPx": 382,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 80,
    "centerY": 389
  },
  "liv020-high-amp-left-output": {
    "leftPx": 284,
    "topPx": 382,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 291,
    "centerY": 389
  },
  "liv020-high-amp-right-input": {
    "leftPx": 116,
    "topPx": 382,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 123,
    "centerY": 389
  },
  "liv020-high-amp-right-output": {
    "leftPx": 327,
    "topPx": 382,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 334,
    "centerY": 389
  },
  "liv020-iem-pack-1-input": {
    "leftPx": 43,
    "topPx": 628,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 50,
    "centerY": 635
  },
  "liv020-iem-pack-1-input-b": {
    "leftPx": 353,
    "topPx": 628,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 360,
    "centerY": 635
  },
  "liv020-iem-pack-2-input": {
    "leftPx": 138,
    "topPx": 708,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 145,
    "centerY": 715
  },
  "liv020-iem-pack-2-input-b": {
    "leftPx": 463,
    "topPx": 708,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 470,
    "centerY": 715
  },
  "liv020-iem-pack-3-input": {
    "leftPx": 238,
    "topPx": 796,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 245,
    "centerY": 803
  },
  "liv020-left-line-array-high-input": {
    "leftPx": 431,
    "topPx": 304,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 438,
    "centerY": 311
  },
  "liv020-left-line-array-low-input": {
    "leftPx": 431,
    "topPx": 426,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 438,
    "centerY": 433
  },
  "liv020-left-line-array-mid-input": {
    "leftPx": 430,
    "topPx": 364,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 437,
    "centerY": 371
  },
  "liv020-low-amp-left-input": {
    "leftPx": 73,
    "topPx": 532,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 80,
    "centerY": 539
  },
  "liv020-low-amp-left-output": {
    "leftPx": 285,
    "topPx": 533,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 292,
    "centerY": 540
  },
  "liv020-low-amp-right-input": {
    "leftPx": 114,
    "topPx": 532,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 121,
    "centerY": 539
  },
  "liv020-low-amp-right-output": {
    "leftPx": 326,
    "topPx": 533,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 333,
    "centerY": 540
  },
  "liv020-main-left-output": {
    "leftPx": 633,
    "topPx": 73,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 640,
    "centerY": 80
  },
  "liv020-main-right-output": {
    "leftPx": 668,
    "topPx": 73,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 675,
    "centerY": 80
  },
  "liv020-mid-amp-left-input": {
    "leftPx": 73,
    "topPx": 457,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 80,
    "centerY": 464
  },
  "liv020-mid-amp-left-output": {
    "leftPx": 285,
    "topPx": 457,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 292,
    "centerY": 464
  },
  "liv020-mid-amp-right-input": {
    "leftPx": 114,
    "topPx": 457,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 121,
    "centerY": 464
  },
  "liv020-mid-amp-right-output": {
    "leftPx": 328,
    "topPx": 456,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 335,
    "centerY": 463
  },
  "liv020-right-line-array-high-input": {
    "leftPx": 647,
    "topPx": 304,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 654,
    "centerY": 311
  },
  "liv020-right-line-array-low-input": {
    "leftPx": 647,
    "topPx": 426,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 654,
    "centerY": 433
  },
  "liv020-right-line-array-mid-input": {
    "leftPx": 647,
    "topPx": 365,
    "widthPx": 14,
    "heightPx": 14,
    "centerX": 654,
    "centerY": 372
  }
};

  
  function sfLiv020NormalizeNeutralJackRings(reason) {
    if (LEVEL_ID !== "LIV-020" || LEVEL_ID === "LIV-021") return;

    const hintsOn =
      document.body.classList.contains("sf-native-hints-visible") ||
      document.body.classList.contains("sf-live-hints-visible") ||
      document.documentElement.classList.contains("sf-native-hints-visible") ||
      document.documentElement.classList.contains("sf-live-hints-visible") ||
      Array.from(document.querySelectorAll("button")).some(btn =>
        /hide hints/i.test((btn.textContent || "").trim())
      );

    const nodes = Array.from(document.querySelectorAll(
      ".sf-live-native-level-liv-020 [data-node-key^='liv020-']"
    )).filter(el => sfLiv020IsRealNodeKey(el.dataset.nodeKey));

    nodes.forEach(el => {
      const isActive =
        el.classList.contains("sf-native-node-selected") ||
        el.classList.contains("sf-native-node-valid") ||
        el.classList.contains("sf-native-node-invalid") ||
        el.classList.contains("sf-native-route-valid") ||
        el.classList.contains("sf-native-route-invalid") ||
        el.dataset.sfNativeSelected === "true" ||
        el.dataset.sfNativeRouteState === "valid" ||
        el.dataset.sfNativeRouteState === "invalid";

      if (!hintsOn && !isActive) {
        el.style.setProperty("border", "2px solid rgba(115,145,170,0.18)", "important");
        el.style.setProperty("box-shadow", "none", "important");
        el.style.setProperty("outline", "none", "important");
        el.style.setProperty("background", "rgba(255,255,255,0)", "important");
      } else if (hintsOn && !isActive) {
        el.style.setProperty("border", "2px solid rgba(255,215,95,0.78)", "important");
        el.style.setProperty("box-shadow", "0 0 0 2px rgba(255,215,95,0.22)", "important");
      }
    });

    console.log("[Signal Flow] LIV-020 neutral jack rings normalized", {
      reason: reason || "manual",
      hintsOn,
      count: nodes.length
    });
  }


function sfLiv020ApplyHitboxLayoutLock(layer, reason) {
    if (LEVEL_ID !== "LIV-020" || !layer) return;

    let applied = 0;

    Object.entries(LIV020_HITBOX_LAYOUT_LOCK).forEach(([nodeKey, pos]) => {
      const el = layer.querySelector('[data-node-key="' + nodeKey + '"]');
      if (!el) return;

      const widthPx = Number(pos.widthPx || 14);
      const heightPx = Number(pos.heightPx || 14);
      const centerX = sfLiv020ScaleX(
        layer,
        Number.isFinite(Number(pos.centerX))
          ? Number(pos.centerX)
          : Number(pos.leftPx) + widthPx / 2
      );
      const centerY = Number.isFinite(Number(pos.centerY))
        ? Number(pos.centerY)
        : Number(pos.topPx) + heightPx / 2;
      const leftPx = Math.round(centerX - widthPx / 2);

      el.style.setProperty("position", "absolute", "important");
      el.style.setProperty("left", leftPx + "px", "important");
      el.style.setProperty("top", pos.topPx + "px", "important");
      el.style.setProperty("width", widthPx + "px", "important");
      el.style.setProperty("height", heightPx + "px", "important");
      el.style.setProperty("transform", "none", "important");

      // Visual lock: keep the drawn/clickable jack marker the same size as the real hitbox.
      // This prevents the player from seeing a large jack target while only the small center is live.
      // LIV-020 visual reset: make the visible jack exactly match the locked hitbox.
      // Keep route logic untouched; this is only node presentation.
      el.style.setProperty("appearance", "none", "important");
      el.style.setProperty("-webkit-appearance", "none", "important");
      el.style.setProperty("display", "block", "important");
      el.style.setProperty("box-sizing", "border-box", "important");
      el.style.setProperty("padding", "0", "important");
      el.style.setProperty("margin", "0", "important");
      el.style.setProperty("min-width", widthPx + "px", "important");
      el.style.setProperty("min-height", heightPx + "px", "important");
      el.style.setProperty("max-width", widthPx + "px", "important");
      el.style.setProperty("max-height", heightPx + "px", "important");
      el.style.setProperty("inline-size", widthPx + "px", "important");
      el.style.setProperty("block-size", heightPx + "px", "important");
      el.style.setProperty("line-height", "0", "important");
      el.style.setProperty("font-size", "0", "important");
      el.style.setProperty("color", "transparent", "important");
      el.style.setProperty("text-indent", "-9999px", "important");
      el.style.setProperty("overflow", "hidden", "important");
      el.style.setProperty("border-radius", "50%", "important");
      el.style.setProperty("border", "2px solid rgba(115, 145, 170, 0.72)", "important");
      el.style.setProperty("background", "rgba(10, 14, 20, 0.82)", "important");
      el.style.setProperty("box-shadow", "0 0 0 1px rgba(0,0,0,.72)", "important");
      el.style.setProperty("outline", "none", "important");

      el.dataset.centerX = String(centerX);
      el.dataset.centerY = String(centerY);
      el.dataset.x = String(centerX);
      el.dataset.y = String(centerY);
      el.dataset.sfCableCenterX = String(centerX);
      el.dataset.sfCableCenterY = String(centerY);
      el.dataset.sfLiv020HitboxLocked = "true";
      applied += 1;
    });

    console.log("[Signal Flow] LIV-020 hitbox layout lock applied", {
      reason: reason || "manual",
      applied,
      expected: Object.keys(LIV020_HITBOX_LAYOUT_LOCK).length
    });

    sfLiv020NormalizeNeutralJackRings(reason || "after-hitbox-lock");
  }


  function applyLiv020LabelLayoutLock(layer) {
    if (LEVEL_ID !== "LIV-020" || !layer) return;

    const keyByText = {
      "MAIN PA + IEM MONITOR FEED": "main-pa-iem-monitor-feed",
      "MONITOR CONSOLE OUTPUTS": "monitor-console-outputs",
      "3-WAY CROSSOVER": "3-way-crossover",
      "HIGH AMP": "high-amp",
      "MID AMP": "mid-amp",
      "LOW AMP": "low-amp",
      "LEFT LINE ARRAY INPUTS": "left-line-array-inputs",
      "RIGHT LINE ARRAY INPUTS": "right-line-array-inputs",
      "IEM PACK 1": "iem-pack-1",
      "IEM PACK 2": "iem-pack-2",
      "IEM PACK 3": "iem-pack-3"
    };

    let applied = 0;

    Array.from(layer.querySelectorAll("div")).forEach(el => {
      const text = (el.innerText || el.textContent || "").trim().toUpperCase();
      const key = keyByText[text];
      const pos = key ? LIV020_LABEL_LAYOUT_LOCK[key] : null;
      if (!pos) return;

      el.dataset.sfLiveDevLabelKey = key;
      el.style.position = "absolute";
      el.style.left = sfLiv020ScaleX(layer, pos.leftPx) + "px";
      el.style.top = pos.topPx + "px";
      el.style.fontSize = pos.fontSize;
      el.style.zIndex = String(pos.zIndex);
      applied += 1;
    });

    console.log("[Signal Flow] LIV-020 label layout lock applied", {
      applied,
      expected: Object.keys(LIV020_LABEL_LAYOUT_LOCK).length,
      layout: LIV020_LABEL_LAYOUT_LOCK
    });
  }


  
  const LIV020_LABEL_JSON_LOCK = [
  {"key":"main-pa-iem-monitor-feed","text":"MAIN PA + IEM MONITOR FEED","leftPx":4,"topPx":5,"fontSize":"12px","zIndex":"46"},
  {"key":"monitor-console-outputs","text":"MONITOR CONSOLE OUTPUTS","leftPx":46,"topPx":93,"fontSize":"11px","zIndex":"36"},
  {"key":"3-way-crossover","text":"3-WAY CROSSOVER","leftPx":28,"topPx":218,"fontSize":"11px","zIndex":"50"},
  {"key":"high-amp","text":"HIGH AMP","leftPx":173,"topPx":369,"fontSize":"11px","zIndex":"52"},
  {"key":"mid-amp","text":"MID AMP","leftPx":178,"topPx":449,"fontSize":"11px","zIndex":"49"},
  {"key":"low-amp","text":"LOW AMP","leftPx":173,"topPx":534,"fontSize":"11px","zIndex":"48"},
  {"key":"left-line-array-inputs","text":"LEFT LINE ARRAY INPUTS","leftPx":373,"topPx":271,"fontSize":"9px","zIndex":"51"},
  {"key":"right-line-array-inputs","text":"RIGHT LINE ARRAY INPUTS","leftPx":564,"topPx":271,"fontSize":"10px","zIndex":"56"},
  {"key":"iem-pack-1","text":"IEM PACK 1","leftPx":130,"topPx":583,"fontSize":"11px","zIndex":"49"},
  {"key":"iem-pack-2","text":"IEM PACK 2","leftPx":232,"topPx":663,"fontSize":"11px","zIndex":"49"},
  {"key":"iem-pack-3","text":"IEM PACK 3","leftPx":324,"topPx":753,"fontSize":"12px","zIndex":"50"},
  {"key":"input-a-1","text":"INPUT A","leftPx":33,"topPx":597,"fontSize":"8px","zIndex":"49"},
  {"key":"input-b-1","text":"INPUT B","leftPx":342,"topPx":597,"fontSize":"8px","zIndex":"46"},
  {"key":"input-a-2","text":"INPUT A","leftPx":125,"topPx":678,"fontSize":"8px","zIndex":"49"},
  {"key":"input-b-2","text":"INPUT B","leftPx":452,"topPx":677,"fontSize":"8px","zIndex":"54"},
  {"key":"input-a-3","text":"INPUT A","leftPx":225,"topPx":767,"fontSize":"8px","zIndex":"48"},
  {"key":"input-b-3","text":"INPUT B","leftPx":538,"topPx":768,"fontSize":"7px","zIndex":"50"}
];

  function sfLiv020ApplyLabelJsonLock(reason) {
    if (LEVEL_ID !== "LIV-020" || LEVEL_ID === "LIV-021") return;
    const layers = Array.from(document.querySelectorAll(".sf-live-native-layer.sf-live-native-level-liv-020"));
    let applied = 0;

    layers.forEach(layer => {
      const labelEls = Array.from(layer.querySelectorAll("div")).filter(el => {
        const text = (el.innerText || el.textContent || "").trim().toUpperCase();
        return LIV020_LABEL_JSON_LOCK.some(item => item.text === text);
      });

      const used = new Set();

      LIV020_LABEL_JSON_LOCK.forEach((item, index) => {
        let occurrence = -1;
        const target = labelEls.find((el, elIndex) => {
          if (used.has(elIndex)) return false;
          const text = (el.innerText || el.textContent || "").trim().toUpperCase();
          if (text !== item.text) return false;
          occurrence += 1;
          return true;
        });

        if (!target) return;

        const elIndex = labelEls.indexOf(target);
        used.add(elIndex);

        target.dataset.sfLiveDevLabelKey = item.key;
        target.dataset.sfLiv020LabelLockIndex = String(index);
        target.style.setProperty("position", "absolute", "important");
        target.style.setProperty("left", sfLiv020ScaleX(layer, item.leftPx) + "px", "important");
        target.style.setProperty("top", item.topPx + "px", "important");
        target.style.setProperty("font-size", item.fontSize, "important");
        target.style.setProperty("z-index", String(item.zIndex), "important");
        target.style.setProperty("pointer-events", "none", "important");
        applied += 1;
      });
    });

    console.log("[Signal Flow] LIV-020 label JSON lock applied", {
      reason,
      layers: layers.length,
      applied,
      expected: LIV020_LABEL_JSON_LOCK.length
    });
  }



  const LIV020_BAD_HITBOX_LAYOUT = [
  {
    "key": "liv020-bad-mic-in-01",
    "label": "Mic In 1",
    "leftPx": 14,
    "topPx": 63,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 28,
    "centerY": 80
  },
  {
    "key": "liv020-bad-mic-in-02",
    "label": "Mic In 2",
    "leftPx": 35,
    "topPx": 63,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 49,
    "centerY": 80
  },
  {
    "key": "liv020-bad-mic-in-03",
    "label": "Mic In 3",
    "leftPx": 58,
    "topPx": 64,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 72,
    "centerY": 81
  },
  {
    "key": "liv020-bad-mic-in-04",
    "label": "Mic In 4",
    "leftPx": 76,
    "topPx": 64,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 90,
    "centerY": 81
  },
  {
    "key": "liv020-bad-mic-in-05",
    "label": "Mic In 5",
    "leftPx": 99,
    "topPx": 64,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 113,
    "centerY": 81
  },
  {
    "key": "liv020-bad-mic-in-06",
    "label": "Mic In 6",
    "leftPx": 120,
    "topPx": 64,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 134,
    "centerY": 81
  },
  {
    "key": "liv020-bad-mic-in-07",
    "label": "Mic In 7",
    "leftPx": 141,
    "topPx": 64,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 155,
    "centerY": 81
  },
  {
    "key": "liv020-bad-mic-in-08",
    "label": "Mic In 8",
    "leftPx": 162,
    "topPx": 63,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 176,
    "centerY": 80
  },
  {
    "key": "liv020-bad-mic-in-09",
    "label": "Mic In 9",
    "leftPx": 16,
    "topPx": 104,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 30,
    "centerY": 121
  },
  {
    "key": "liv020-bad-mic-in-10",
    "label": "Mic In 10",
    "leftPx": 37,
    "topPx": 104,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 51,
    "centerY": 121
  },
  {
    "key": "liv020-bad-mic-in-11",
    "label": "Mic In 11",
    "leftPx": 58,
    "topPx": 104,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 72,
    "centerY": 121
  },
  {
    "key": "liv020-bad-mic-in-12",
    "label": "Mic In 12",
    "leftPx": 79,
    "topPx": 106,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 93,
    "centerY": 123
  },
  {
    "key": "liv020-bad-mic-in-13",
    "label": "Mic In 13",
    "leftPx": 100,
    "topPx": 104,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 114,
    "centerY": 121
  },
  {
    "key": "liv020-bad-mic-in-14",
    "label": "Mic In 14",
    "leftPx": 120,
    "topPx": 104,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 134,
    "centerY": 121
  },
  {
    "key": "liv020-bad-mic-in-15",
    "label": "Mic In 15",
    "leftPx": 141,
    "topPx": 104,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 155,
    "centerY": 121
  },
  {
    "key": "liv020-bad-mic-in-16",
    "label": "Mic In 16",
    "leftPx": 162,
    "topPx": 104,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 176,
    "centerY": 121
  },
  {
    "key": "liv020-bad-mic-in-17",
    "label": "Mic In 17",
    "leftPx": 16,
    "topPx": 147,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 30,
    "centerY": 164
  },
  {
    "key": "liv020-bad-mic-in-18",
    "label": "Mic In 18",
    "leftPx": 37,
    "topPx": 147,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 51,
    "centerY": 164
  },
  {
    "key": "liv020-bad-mic-in-19",
    "label": "Mic In 19",
    "leftPx": 59,
    "topPx": 147,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 73,
    "centerY": 164
  },
  {
    "key": "liv020-bad-mic-in-20",
    "label": "Mic In 20",
    "leftPx": 79,
    "topPx": 147,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 93,
    "centerY": 164
  },
  {
    "key": "liv020-bad-mic-in-21",
    "label": "Mic In 21",
    "leftPx": 99,
    "topPx": 147,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 113,
    "centerY": 164
  },
  {
    "key": "liv020-bad-mic-in-22",
    "label": "Mic In 22",
    "leftPx": 121,
    "topPx": 147,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 135,
    "centerY": 164
  },
  {
    "key": "liv020-bad-mic-in-23",
    "label": "Mic In 23",
    "leftPx": 143,
    "topPx": 147,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 157,
    "centerY": 164
  },
  {
    "key": "liv020-bad-mic-in-24",
    "label": "Mic In 24",
    "leftPx": 163,
    "topPx": 146,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 177,
    "centerY": 163
  },
  {
    "key": "liv020-bad-insert-01",
    "label": "Insert 1",
    "leftPx": 190,
    "topPx": 62,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 204,
    "centerY": 79
  },
  {
    "key": "liv020-bad-insert-02",
    "label": "Insert 2",
    "leftPx": 208,
    "topPx": 62,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 222,
    "centerY": 79
  },
  {
    "key": "liv020-bad-insert-03",
    "label": "Insert 3",
    "leftPx": 222,
    "topPx": 61,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 236,
    "centerY": 78
  },
  {
    "key": "liv020-bad-insert-04",
    "label": "Insert 4",
    "leftPx": 240,
    "topPx": 61,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 254,
    "centerY": 78
  },
  {
    "key": "liv020-bad-insert-05",
    "label": "Insert 5",
    "leftPx": 257,
    "topPx": 61,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 271,
    "centerY": 78
  },
  {
    "key": "liv020-bad-insert-06",
    "label": "Insert 6",
    "leftPx": 272,
    "topPx": 60,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 286,
    "centerY": 77
  },
  {
    "key": "liv020-bad-insert-07",
    "label": "Insert 7",
    "leftPx": 290,
    "topPx": 59,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 304,
    "centerY": 76
  },
  {
    "key": "liv020-bad-insert-08",
    "label": "Insert 8",
    "leftPx": 303,
    "topPx": 61,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 317,
    "centerY": 78
  },
  {
    "key": "liv020-bad-insert-09",
    "label": "Insert 9",
    "leftPx": 190,
    "topPx": 82,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 204,
    "centerY": 99
  },
  {
    "key": "liv020-bad-insert-10",
    "label": "Insert 10",
    "leftPx": 203,
    "topPx": 82,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 217,
    "centerY": 99
  },
  {
    "key": "liv020-bad-insert-11",
    "label": "Insert 11",
    "leftPx": 220,
    "topPx": 81,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 234,
    "centerY": 98
  },
  {
    "key": "liv020-bad-insert-12",
    "label": "Insert 12",
    "leftPx": 238,
    "topPx": 81,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 252,
    "centerY": 98
  },
  {
    "key": "liv020-bad-insert-13",
    "label": "Insert 13",
    "leftPx": 256,
    "topPx": 80,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 270,
    "centerY": 97
  },
  {
    "key": "liv020-bad-insert-14",
    "label": "Insert 14",
    "leftPx": 275,
    "topPx": 83,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 289,
    "centerY": 100
  },
  {
    "key": "liv020-bad-insert-15",
    "label": "Insert 15",
    "leftPx": 292,
    "topPx": 83,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 306,
    "centerY": 100
  },
  {
    "key": "liv020-bad-insert-16",
    "label": "Insert 16",
    "leftPx": 304,
    "topPx": 82,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 318,
    "centerY": 99
  },
  {
    "key": "liv020-bad-insert-17",
    "label": "Insert 17",
    "leftPx": 191,
    "topPx": 106,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 205,
    "centerY": 123
  },
  {
    "key": "liv020-bad-insert-18",
    "label": "Insert 18",
    "leftPx": 205,
    "topPx": 105,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 219,
    "centerY": 122
  },
  {
    "key": "liv020-bad-insert-19",
    "label": "Insert 19",
    "leftPx": 221,
    "topPx": 106,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 235,
    "centerY": 123
  },
  {
    "key": "liv020-bad-insert-20",
    "label": "Insert 20",
    "leftPx": 235,
    "topPx": 106,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 249,
    "centerY": 123
  },
  {
    "key": "liv020-bad-insert-21",
    "label": "Insert 21",
    "leftPx": 254,
    "topPx": 104,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 268,
    "centerY": 121
  },
  {
    "key": "liv020-bad-insert-22",
    "label": "Insert 22",
    "leftPx": 272,
    "topPx": 104,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 286,
    "centerY": 121
  },
  {
    "key": "liv020-bad-insert-23",
    "label": "Insert 23",
    "leftPx": 287,
    "topPx": 105,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 301,
    "centerY": 122
  },
  {
    "key": "liv020-bad-insert-24",
    "label": "Insert 24",
    "leftPx": 304,
    "topPx": 105,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 318,
    "centerY": 122
  },
  {
    "key": "liv020-bad-insert-25",
    "label": "Insert 25",
    "leftPx": 190,
    "topPx": 126,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 204,
    "centerY": 143
  },
  {
    "key": "liv020-bad-insert-26",
    "label": "Insert 26",
    "leftPx": 208,
    "topPx": 126,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 222,
    "centerY": 143
  },
  {
    "key": "liv020-bad-insert-27",
    "label": "Insert 27",
    "leftPx": 220,
    "topPx": 125,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 234,
    "centerY": 142
  },
  {
    "key": "liv020-bad-insert-28",
    "label": "Insert 28",
    "leftPx": 236,
    "topPx": 127,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 250,
    "centerY": 144
  },
  {
    "key": "liv020-bad-insert-29",
    "label": "Insert 29",
    "leftPx": 259,
    "topPx": 126,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 273,
    "centerY": 143
  },
  {
    "key": "liv020-bad-insert-30",
    "label": "Insert 30",
    "leftPx": 275,
    "topPx": 126,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 289,
    "centerY": 143
  },
  {
    "key": "liv020-bad-insert-31",
    "label": "Insert 31",
    "leftPx": 287,
    "topPx": 125,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 301,
    "centerY": 142
  },
  {
    "key": "liv020-bad-insert-32",
    "label": "Insert 32",
    "leftPx": 310,
    "topPx": 125,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 324,
    "centerY": 142
  },
  {
    "key": "liv020-bad-aux-out-01",
    "label": "Aux Out 1",
    "leftPx": 430,
    "topPx": 60,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 444,
    "centerY": 77
  },
  {
    "key": "liv020-bad-aux-out-02",
    "label": "Aux Out 2",
    "leftPx": 445,
    "topPx": 60,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 459,
    "centerY": 77
  },
  {
    "key": "liv020-bad-aux-out-03",
    "label": "Aux Out 3",
    "leftPx": 461,
    "topPx": 60,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 475,
    "centerY": 77
  },
  {
    "key": "liv020-bad-aux-out-04",
    "label": "Aux Out 4",
    "leftPx": 345,
    "topPx": 94,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 359,
    "centerY": 111
  },
  {
    "key": "liv020-bad-aux-out-05",
    "label": "Aux Out 5",
    "leftPx": 362,
    "topPx": 94,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 376,
    "centerY": 111
  },
  {
    "key": "liv020-bad-aux-out-06",
    "label": "Aux Out 6",
    "leftPx": 379,
    "topPx": 93,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 393,
    "centerY": 110
  },
  {
    "key": "liv020-bad-aux-out-07",
    "label": "Aux Out 7",
    "leftPx": 396,
    "topPx": 93,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 410,
    "centerY": 110
  },
  {
    "key": "liv020-bad-aux-out-08",
    "label": "Aux Out 8",
    "leftPx": 413,
    "topPx": 92,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 427,
    "centerY": 109
  },
  {
    "key": "liv020-bad-aux-out-09",
    "label": "Aux Out 9",
    "leftPx": 431,
    "topPx": 93,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 445,
    "centerY": 110
  },
  {
    "key": "liv020-bad-aux-out-10",
    "label": "Aux Out 10",
    "leftPx": 446,
    "topPx": 93,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 460,
    "centerY": 110
  },
  {
    "key": "liv020-bad-aux-out-11",
    "label": "Aux Out 11",
    "leftPx": 461,
    "topPx": 93,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 475,
    "centerY": 110
  },
  {
    "key": "liv020-bad-aux-out-12",
    "label": "Aux Out 12",
    "leftPx": 346,
    "topPx": 136,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 360,
    "centerY": 153
  },
  {
    "key": "liv020-bad-aux-out-13",
    "label": "Aux Out 13",
    "leftPx": 363,
    "topPx": 135,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 377,
    "centerY": 152
  },
  {
    "key": "liv020-bad-aux-out-14",
    "label": "Aux Out 14",
    "leftPx": 379,
    "topPx": 135,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 393,
    "centerY": 152
  },
  {
    "key": "liv020-bad-aux-out-15",
    "label": "Aux Out 15",
    "leftPx": 397,
    "topPx": 135,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 411,
    "centerY": 152
  },
  {
    "key": "liv020-bad-aux-out-16",
    "label": "Aux Out 16",
    "leftPx": 414,
    "topPx": 135,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 428,
    "centerY": 152
  },
  {
    "key": "liv020-bad-aux-out-17",
    "label": "Aux Out 17",
    "leftPx": 428,
    "topPx": 134,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 442,
    "centerY": 151
  },
  {
    "key": "liv020-bad-aux-out-18",
    "label": "Aux Out 18",
    "leftPx": 444,
    "topPx": 135,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 458,
    "centerY": 152
  },
  {
    "key": "liv020-bad-aux-out-19",
    "label": "Aux Out 19",
    "leftPx": 462,
    "topPx": 135,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 476,
    "centerY": 152
  },
  {
    "key": "liv020-bad-aux-out-20",
    "label": "Aux Out 20",
    "leftPx": 510,
    "topPx": 62,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 524,
    "centerY": 79
  },
  {
    "key": "liv020-bad-bus-out-01",
    "label": "Bus Out 1",
    "leftPx": 531,
    "topPx": 62,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 545,
    "centerY": 79
  },
  {
    "key": "liv020-bad-bus-out-02",
    "label": "Bus Out 2",
    "leftPx": 552,
    "topPx": 62,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 566,
    "centerY": 79
  },
  {
    "key": "liv020-bad-bus-out-03",
    "label": "Bus Out 3",
    "leftPx": 572,
    "topPx": 62,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 586,
    "centerY": 79
  },
  {
    "key": "liv020-bad-bus-out-04",
    "label": "Bus Out 4",
    "leftPx": 511,
    "topPx": 92,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 525,
    "centerY": 109
  },
  {
    "key": "liv020-bad-bus-out-05",
    "label": "Bus Out 5",
    "leftPx": 532,
    "topPx": 92,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 546,
    "centerY": 109
  },
  {
    "key": "liv020-bad-bus-out-06",
    "label": "Bus Out 6",
    "leftPx": 552,
    "topPx": 92,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 566,
    "centerY": 109
  },
  {
    "key": "liv020-bad-bus-out-07",
    "label": "Bus Out 7",
    "leftPx": 573,
    "topPx": 92,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 587,
    "centerY": 109
  },
  {
    "key": "liv020-bad-bus-out-08",
    "label": "Bus Out 8",
    "leftPx": 511,
    "topPx": 121,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 525,
    "centerY": 138
  },
  {
    "key": "liv020-bad-bus-out-09",
    "label": "Bus Out 9",
    "leftPx": 533,
    "topPx": 121,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 547,
    "centerY": 138
  },
  {
    "key": "liv020-bad-bus-out-10",
    "label": "Bus Out 10",
    "leftPx": 553,
    "topPx": 121,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 567,
    "centerY": 138
  },
  {
    "key": "liv020-bad-bus-out-11",
    "label": "Bus Out 11",
    "leftPx": 574,
    "topPx": 120,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 588,
    "centerY": 137
  },
  {
    "key": "liv020-bad-bus-out-12",
    "label": "Bus Out 12",
    "leftPx": 511,
    "topPx": 148,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 525,
    "centerY": 165
  },
  {
    "key": "liv020-bad-bus-out-13",
    "label": "Bus Out 13",
    "leftPx": 532,
    "topPx": 148,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 546,
    "centerY": 165
  },
  {
    "key": "liv020-bad-bus-out-14",
    "label": "Bus Out 14",
    "leftPx": 554,
    "topPx": 148,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 568,
    "centerY": 165
  },
  {
    "key": "liv020-bad-bus-out-15",
    "label": "Bus Out 15",
    "leftPx": 575,
    "topPx": 149,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 589,
    "centerY": 166
  },
  {
    "key": "liv020-bad-bus-out-16",
    "label": "Bus Out 16",
    "leftPx": 619,
    "topPx": 112,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 633,
    "centerY": 129
  },
  {
    "key": "liv020-bad-bus-out-17",
    "label": "Bus Out 17",
    "leftPx": 636,
    "topPx": 112,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 650,
    "centerY": 129
  },
  {
    "key": "liv020-bad-bus-out-18",
    "label": "Bus Out 18",
    "leftPx": 652,
    "topPx": 112,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 666,
    "centerY": 129
  },
  {
    "key": "liv020-bad-bus-out-19",
    "label": "Bus Out 19",
    "leftPx": 667,
    "topPx": 112,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 681,
    "centerY": 129
  },
  {
    "key": "liv020-bad-bus-out-20",
    "label": "Bus Out 20",
    "leftPx": 614,
    "topPx": 142,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 628,
    "centerY": 159
  },
  {
    "key": "liv020-bad-bus-out-21",
    "label": "Bus Out 21",
    "leftPx": 635,
    "topPx": 142,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 649,
    "centerY": 159
  },
  {
    "key": "liv020-bad-bus-out-22",
    "label": "Bus Out 22",
    "leftPx": 656,
    "topPx": 141,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 670,
    "centerY": 158
  },
  {
    "key": "liv020-bad-bus-out-23",
    "label": "Bus Out 23",
    "leftPx": 675,
    "topPx": 141,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 689,
    "centerY": 158
  },
  {
    "key": "liv020-bad-bus-out-24",
    "label": "Bus Out 24",
    "leftPx": 271,
    "topPx": 616,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 285,
    "centerY": 633
  },
  {
    "key": "liv020-bad-bus-out-25",
    "label": "Bus Out 25",
    "leftPx": 376,
    "topPx": 699,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 390,
    "centerY": 716
  },
  {
    "key": "liv020-bad-bus-out-01",
    "label": "Bus Out 1",
    "leftPx": 464,
    "topPx": 787,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 478,
    "centerY": 804
  },
  {
    "key": "liv020-bad-bus-out-02",
    "label": "Bus Out 2",
    "leftPx": 541,
    "topPx": 785,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 555,
    "centerY": 802
  },
  {
    "key": "liv020-bad-bus-out-03",
    "label": "Bus Out 3",
    "leftPx": 196,
    "topPx": 148,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 210,
    "centerY": 165
  },
  {
    "key": "liv020-bad-bus-out-04",
    "label": "Bus Out 4",
    "leftPx": 211,
    "topPx": 148,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 225,
    "centerY": 165
  },
  {
    "key": "liv020-bad-main-alt-01",
    "label": "Main Alt 1",
    "leftPx": 227,
    "topPx": 148,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 241,
    "centerY": 165
  },
  {
    "key": "liv020-bad-main-alt-02",
    "label": "Main Alt 2",
    "leftPx": 230,
    "topPx": 148,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 244,
    "centerY": 165
  },
  {
    "key": "liv020-bad-main-alt-03",
    "label": "Main Alt 3",
    "leftPx": 258,
    "topPx": 147,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 272,
    "centerY": 164
  },
  {
    "key": "liv020-bad-main-alt-04",
    "label": "Main Alt 4",
    "leftPx": 273,
    "topPx": 147,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 287,
    "centerY": 164
  },
  {
    "key": "liv020-bad-iem-unused-01",
    "label": "IEM Unused 1",
    "leftPx": 288,
    "topPx": 147,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 302,
    "centerY": 164
  },
  {
    "key": "liv020-bad-iem-unused-02",
    "label": "IEM Unused 2",
    "leftPx": 299,
    "topPx": 149,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 313,
    "centerY": 166
  },
  {
    "key": "liv020-bad-iem-unused-03",
    "label": "IEM Unused 3",
    "leftPx": 524,
    "topPx": 423,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 538,
    "centerY": 440
  },
  {
    "key": "liv020-bad-iem-unused-04",
    "label": "IEM Unused 4",
    "leftPx": 522,
    "topPx": 234,
    "widthPx": 28,
    "heightPx": 34,
    "centerX": 536,
    "centerY": 251
  }
];

  const LIV020_BAD_ROUTE_PAIRS = [
    ["liv020-main-left-output", "liv020-crossover-right-input"],
    ["liv020-main-right-output", "liv020-crossover-left-input"],
    ["liv020-main-left-output", "liv020-high-amp-left-input"],
    ["liv020-main-left-output", "liv020-mid-amp-left-input"],
    ["liv020-main-left-output", "liv020-low-amp-left-input"],
    ["liv020-main-right-output", "liv020-high-amp-right-input"],
    ["liv020-main-right-output", "liv020-mid-amp-right-input"],
    ["liv020-main-right-output", "liv020-low-amp-right-input"],
    ["liv020-aux-1-output", "liv020-crossover-left-input"],
    ["liv020-aux-2-output", "liv020-crossover-right-input"],
    ["liv020-aux-3-output", "liv020-crossover-left-input"],
    ["liv020-aux-4-output", "liv020-crossover-right-input"],
    ["liv020-aux-5-output", "liv020-crossover-left-input"],
    ["liv020-aux-1-output", "liv020-iem-pack-1-input-b"],
    ["liv020-aux-1-output", "liv020-iem-pack-2-input"],
    ["liv020-aux-1-output", "liv020-iem-pack-2-input-b"],
    ["liv020-aux-1-output", "liv020-iem-pack-3-input"],
    ["liv020-aux-2-output", "liv020-iem-pack-1-input"],
    ["liv020-aux-2-output", "liv020-iem-pack-2-input"],
    ["liv020-aux-2-output", "liv020-iem-pack-2-input-b"],
    ["liv020-aux-2-output", "liv020-iem-pack-3-input"],
    ["liv020-aux-3-output", "liv020-iem-pack-1-input"],
    ["liv020-aux-3-output", "liv020-iem-pack-1-input-b"],
    ["liv020-aux-3-output", "liv020-iem-pack-2-input-b"],
    ["liv020-aux-3-output", "liv020-iem-pack-3-input"],
    ["liv020-aux-4-output", "liv020-iem-pack-1-input"],
    ["liv020-aux-4-output", "liv020-iem-pack-1-input-b"],
    ["liv020-aux-4-output", "liv020-iem-pack-2-input"],
    ["liv020-aux-4-output", "liv020-iem-pack-3-input"],
    ["liv020-aux-5-output", "liv020-iem-pack-1-input"],
    ["liv020-aux-5-output", "liv020-iem-pack-1-input-b"],
    ["liv020-aux-5-output", "liv020-iem-pack-2-input"],
    ["liv020-aux-5-output", "liv020-iem-pack-2-input-b"],
    ["liv020-crossover-high-left-output", "liv020-high-amp-right-input"],
    ["liv020-crossover-high-right-output", "liv020-high-amp-left-input"],
    ["liv020-crossover-mid-left-output", "liv020-mid-amp-right-input"],
    ["liv020-crossover-mid-right-output", "liv020-mid-amp-left-input"],
    ["liv020-crossover-low-left-output", "liv020-low-amp-right-input"],
    ["liv020-crossover-low-right-output", "liv020-low-amp-left-input"],
    ["liv020-crossover-high-left-output", "liv020-mid-amp-left-input"],
    ["liv020-crossover-high-left-output", "liv020-low-amp-left-input"],
    ["liv020-crossover-high-right-output", "liv020-mid-amp-right-input"],
    ["liv020-crossover-high-right-output", "liv020-low-amp-right-input"],
    ["liv020-crossover-mid-left-output", "liv020-high-amp-left-input"],
    ["liv020-crossover-mid-left-output", "liv020-low-amp-left-input"],
    ["liv020-crossover-mid-right-output", "liv020-high-amp-right-input"],
    ["liv020-crossover-mid-right-output", "liv020-low-amp-right-input"],
    ["liv020-crossover-low-left-output", "liv020-high-amp-left-input"],
    ["liv020-crossover-low-left-output", "liv020-mid-amp-left-input"],
    ["liv020-crossover-low-right-output", "liv020-high-amp-right-input"],
    ["liv020-crossover-low-right-output", "liv020-mid-amp-right-input"],
    ["liv020-crossover-high-left-output", "liv020-left-line-array-high-input"],
    ["liv020-crossover-high-left-output", "liv020-left-line-array-mid-input"],
    ["liv020-crossover-high-left-output", "liv020-left-line-array-low-input"],
    ["liv020-crossover-high-right-output", "liv020-right-line-array-high-input"],
    ["liv020-crossover-high-right-output", "liv020-right-line-array-mid-input"],
    ["liv020-crossover-high-right-output", "liv020-right-line-array-low-input"],
    ["liv020-crossover-mid-left-output", "liv020-left-line-array-high-input"],
    ["liv020-crossover-mid-left-output", "liv020-left-line-array-mid-input"],
    ["liv020-crossover-mid-left-output", "liv020-left-line-array-low-input"],
    ["liv020-crossover-mid-right-output", "liv020-right-line-array-high-input"],
    ["liv020-crossover-mid-right-output", "liv020-right-line-array-mid-input"],
    ["liv020-crossover-mid-right-output", "liv020-right-line-array-low-input"],
    ["liv020-crossover-low-left-output", "liv020-left-line-array-high-input"],
    ["liv020-crossover-low-left-output", "liv020-left-line-array-mid-input"],
    ["liv020-crossover-low-left-output", "liv020-left-line-array-low-input"],
    ["liv020-crossover-low-right-output", "liv020-right-line-array-high-input"],
    ["liv020-crossover-low-right-output", "liv020-right-line-array-mid-input"],
    ["liv020-crossover-low-right-output", "liv020-right-line-array-low-input"],
    ["liv020-high-amp-left-output", "liv020-right-line-array-high-input"],
    ["liv020-high-amp-left-output", "liv020-left-line-array-mid-input"],
    ["liv020-high-amp-left-output", "liv020-left-line-array-low-input"],
    ["liv020-high-amp-right-output", "liv020-left-line-array-high-input"],
    ["liv020-high-amp-right-output", "liv020-right-line-array-mid-input"],
    ["liv020-high-amp-right-output", "liv020-right-line-array-low-input"],
    ["liv020-mid-amp-left-output", "liv020-right-line-array-mid-input"],
    ["liv020-mid-amp-left-output", "liv020-left-line-array-high-input"],
    ["liv020-mid-amp-left-output", "liv020-left-line-array-low-input"],
    ["liv020-mid-amp-right-output", "liv020-left-line-array-mid-input"],
    ["liv020-mid-amp-right-output", "liv020-right-line-array-high-input"],
    ["liv020-mid-amp-right-output", "liv020-right-line-array-low-input"],
    ["liv020-low-amp-left-output", "liv020-right-line-array-low-input"],
    ["liv020-low-amp-left-output", "liv020-left-line-array-high-input"],
    ["liv020-low-amp-left-output", "liv020-left-line-array-mid-input"],
    ["liv020-low-amp-right-output", "liv020-left-line-array-low-input"],
    ["liv020-low-amp-right-output", "liv020-right-line-array-high-input"],
    ["liv020-low-amp-right-output", "liv020-right-line-array-mid-input"],
    ["liv020-main-left-output", "liv020-left-line-array-high-input"],
    ["liv020-main-left-output", "liv020-left-line-array-mid-input"],
    ["liv020-main-left-output", "liv020-left-line-array-low-input"],
    ["liv020-main-right-output", "liv020-right-line-array-high-input"],
    ["liv020-main-right-output", "liv020-right-line-array-mid-input"],
    ["liv020-main-right-output", "liv020-right-line-array-low-input"],
    ["liv020-aux-1-output", "liv020-left-line-array-high-input"],
    ["liv020-aux-2-output", "liv020-right-line-array-high-input"],
    ["liv020-aux-3-output", "liv020-left-line-array-mid-input"],
    ["liv020-aux-4-output", "liv020-right-line-array-mid-input"],
    ["liv020-aux-5-output", "liv020-left-line-array-low-input"],
    ["liv020-main-left-output", "liv020-iem-pack-1-input"],
    ["liv020-main-right-output", "liv020-iem-pack-1-input-b"],
    ["liv020-main-left-output", "liv020-iem-pack-2-input"],
    ["liv020-main-left-output", "liv020-high-amp-right-input"],
    ["liv020-main-left-output", "liv020-mid-amp-right-input"],
    ["liv020-main-left-output", "liv020-low-amp-right-input"],
    ["liv020-main-left-output", "liv020-right-line-array-high-input"],
    ["liv020-main-left-output", "liv020-right-line-array-mid-input"],
    ["liv020-main-left-output", "liv020-right-line-array-low-input"],
    ["liv020-main-left-output", "liv020-iem-pack-1-input-b"],
    ["liv020-main-left-output", "liv020-iem-pack-2-input-b"],
    ["liv020-main-left-output", "liv020-iem-pack-3-input"],
    ["liv020-main-right-output", "liv020-high-amp-left-input"],
    ["liv020-main-right-output", "liv020-mid-amp-left-input"],
    ["liv020-main-right-output", "liv020-low-amp-left-input"]
  ];


  function installLiv020BadJacks(layer) {
    if (LEVEL_ID !== "LIV-020" || !layer) return;

    layer.querySelectorAll('[data-node-key^="liv020-bad-"]').forEach(el => el.remove());

    const badLayout = Array.isArray(LIV020_BAD_HITBOX_LAYOUT) ? LIV020_BAD_HITBOX_LAYOUT : [];

    let made = 0;
    let skipped = 0;

    badLayout.forEach((pos, index) => {
      const badKey = pos && pos.key;

      if (!badKey) {
        skipped += 1;
        return;
      }

      const left = Number(pos.leftPx);
      const top = Number(pos.topPx);
      const width = Number(pos.widthPx);
      const height = Number(pos.heightPx);
      const centerX = Number.isFinite(Number(pos.centerX)) ? Number(pos.centerX) : left + width / 2;
      const centerY = Number.isFinite(Number(pos.centerY)) ? Number(pos.centerY) : top + height / 2;

      if (![left, top, width, height, centerX, centerY].every(Number.isFinite)) {
        console.warn("[Signal Flow] LIV-020 bad jack skipped invalid saved layout", { index, pos });
        skipped += 1;
        return;
      }

      const bad = document.createElement("button");
      bad.type = "button";
      bad.className = "sf-native-node sf-native-jack sf-native-liv010-jack sf-native-liv020-bad-jack";
      bad.tabIndex = 0;

      bad.dataset.nodeKey = badKey;
      bad.dataset.key = badKey;
      bad.dataset.sfNativeKey = badKey;
      bad.dataset.kind = "jack";
      bad.dataset.nodeKind = "jack";
      bad.dataset.label = pos.label || badKey;
      bad.dataset.falseHardwareJack = "1";

      bad.dataset.sfNativePointX = String(centerX);
      bad.dataset.sfCableCenterX = String(centerX);
      bad.dataset.centerX = String(centerX);
      bad.dataset.x = String(centerX);

      bad.dataset.sfNativePointY = String(centerY);
      bad.dataset.sfCableCenterY = String(centerY);
      bad.dataset.centerY = String(centerY);
      bad.dataset.y = String(centerY);

      bad.style.setProperty("position", "absolute", "important");
      bad.style.setProperty("left", left + "px", "important");
      bad.style.setProperty("top", top + "px", "important");
      bad.style.setProperty("width", width + "px", "important");
      bad.style.setProperty("height", height + "px", "important");
      bad.style.setProperty("min-width", width + "px", "important");
      bad.style.setProperty("min-height", height + "px", "important");
      bad.style.setProperty("max-width", width + "px", "important");
      bad.style.setProperty("max-height", height + "px", "important");
      bad.style.setProperty("inline-size", width + "px", "important");
      bad.style.setProperty("block-size", height + "px", "important");
      bad.style.setProperty("transform", "none", "important");

      bad.style.setProperty("appearance", "none", "important");
      bad.style.setProperty("-webkit-appearance", "none", "important");
      bad.style.setProperty("display", "block", "important");
      bad.style.setProperty("box-sizing", "border-box", "important");
      bad.style.setProperty("padding", "0", "important");
      bad.style.setProperty("margin", "0", "important");
      bad.style.setProperty("line-height", "0", "important");
      bad.style.setProperty("font-size", "0", "important");
      bad.style.setProperty("color", "transparent", "important");
      bad.style.setProperty("text-indent", "-9999px", "important");
      bad.style.setProperty("overflow", "hidden", "important");
      bad.style.setProperty("border-radius", "50%", "important");

      bad.style.setProperty("pointer-events", "auto", "important");
      bad.style.setProperty("cursor", "pointer", "important");
      bad.style.setProperty("opacity", "0.42", "important");
      bad.style.setProperty("background", "rgba(255, 80, 80, 0.18)", "important");
      bad.style.setProperty("border", "1px solid rgba(255, 80, 80, 0.66)", "important");
      bad.style.setProperty("box-shadow", "none", "important");
      bad.style.setProperty("outline", "none", "important");
      bad.style.setProperty("z-index", "2300", "important");
      bad.setAttribute("aria-label", pos.label || badKey);
      bad.title = pos.label || badKey;

      bad.addEventListener("pointerdown", event => {
        console.log("[Signal Flow] LIV-020 false hardware jack drag start:", badKey);
        startNativePatchDrag(layer, {
          key: badKey,
          el: bad,
          defaultShadow: "0 0 8px rgba(255,70,70,.35)",
          point: { x: centerX, y: centerY }
        }, event);
      }, true);

      bad.addEventListener("click", event => {
        if (Date.now() < suppressNativeClickUntil) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        console.log("[Signal Flow] LIV-020 false hardware jack clicked:", badKey);
        handleNodeClick(layer, {
          key: badKey,
          el: bad,
          defaultShadow: "0 0 8px rgba(255,70,70,.35)",
          point: { x: centerX, y: centerY }
        });
      });

      layer.appendChild(bad);
      made += 1;
    });

    sfLiv020UpdateBadJackAvailability(layer, "");

    console.log("[Signal Flow] LIV-020 false hardware jacks installed from saved 113-layout array", {
      made,
      expected: 113,
      skipped,
      layoutRecords: badLayout.length,
      good: Array.from(layer.querySelectorAll("[data-node-key]")).filter(el =>
        sfLiv020IsRealNodeKey(el.dataset && el.dataset.nodeKey)
      ).length,
      bad: layer.querySelectorAll('[data-node-key^="liv020-bad-"]').length,
      total: layer.querySelectorAll("[data-node-key]").length
    });
  }

function renderLiv020MainPaAndIem(surface, adapter) {
    sfLiv010InstallStyle();

    surface.classList.add("sf-live-native-scroll-host-liv010");
    surface.style.setProperty("overflow-y", "auto", "important");
    surface.style.setProperty("overflow-x", "auto", "important");
    if (getComputedStyle(surface).position === "static") {
      surface.style.position = "relative";
    }

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    surface.querySelectorAll(".sfLiv010SurfaceScrollSpacer").forEach(el => el.remove());

    const rect = surface.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const layoutWidth = Math.max(760, Math.ceil(width));
    const boardWidth = width < LIV020_LOCKED_LAYOUT_WIDTH ? Math.ceil(width) : layoutWidth;
    const panels = sfLiv010BuildPanels(layoutWidth);

    // LIV-020 uses the large monitor console asset, not the compact LIV-010 FOH strip.
    // Make it ~500% larger than the inherited LIV-010 FOH panel.
    panels.foh = {
      kind: "foh",
      x: Math.round(width * 0.04),
      y: 70,
      width: Math.round(width * 4.45)
    };

    panels.crossover.y += 920;
    panels.highAmp.y += 920;
    panels.midAmp.y += 920;
    panels.lowAmp.y += 920;
    panels.paVisual.y += 920;
    panels.speakerLeft.y += 920;
    panels.speakerRight.y += 920;

    panels.iemPack1 = {
      kind: "iem-pack",
      x: Math.round(width * 0.08),
      y: 2140,
      width: Math.round(width * 0.26)
    };
    panels.iemPack2 = {
      kind: "iem-pack",
      x: Math.round(width * 0.37),
      y: 2140,
      width: Math.round(width * 0.26)
    };
    panels.iemPack3 = {
      kind: "iem-pack",
      x: Math.round(width * 0.66),
      y: 2140,
      width: Math.round(width * 0.26)
    };

    const boardHeight = Math.max(2650, Math.ceil(panels.iemPack1.y + 360));
    surface.style.setProperty("--sf-liv010-board-height", boardHeight + "px");

    const layer = document.createElement("div");
    layer.className = "sf-live-native-layer sf-live-native-level-liv-020 sf-liv010-vertical-stack-v204";
    layer.style.cssText = [
      "position:absolute",
      "left:0",
      "top:0",
      "right:auto",
      "width:" + boardWidth + "px",
      "min-width:" + boardWidth + "px",
      "height:" + boardHeight + "px",
      "min-height:" + boardHeight + "px",
      "z-index:9990",
      "isolation:isolate",
      "pointer-events:none",
      "overflow:visible",
      "border-radius:18px",
      "background:radial-gradient(circle at 50% 10%, rgba(41,126,93,.13) 0%, rgba(41,126,93,.06) 22%, rgba(0,0,0,0) 46%), linear-gradient(180deg, rgba(2,8,9,.91), rgba(3,9,10,.95) 50%, rgba(3,8,9,.98))"
    ].join(";");
    layer.style.setProperty("width", boardWidth + "px", "important");
    layer.style.setProperty("min-width", boardWidth + "px", "important");
    layer.style.setProperty("height", boardHeight + "px", "important");
    layer.style.setProperty("min-height", boardHeight + "px", "important");

    function centerLabel(text, panel, yOffset, size) {
      createLabel(layer, text, panel.x + 12, panel.y + (yOffset || -22), size || 11);
    }

    createLabel(layer, "MAIN PA + IEM MONITOR FEED", 24, 20, 12);
    centerLabel("MONITOR CONSOLE OUTPUTS", panels.foh, -22, 11);
    centerLabel("3-WAY CROSSOVER", panels.crossover, -22, 11);
    centerLabel("HIGH AMP", panels.highAmp, -22, 11);
    centerLabel("MID AMP", panels.midAmp, -22, 11);
    centerLabel("LOW AMP", panels.lowAmp, -22, 11);
    createLabel(layer, "LEFT LINE ARRAY INPUTS", panels.speakerLeft.x, panels.speakerLeft.y - 22, 11);
    createLabel(layer, "RIGHT LINE ARRAY INPUTS", panels.speakerRight.x, panels.speakerRight.y - 22, 11);
    centerLabel("IEM PACK 1", panels.iemPack1, -22, 11);
    centerLabel("IEM PACK 2", panels.iemPack2, -22, 11);
    centerLabel("IEM PACK 3", panels.iemPack3, -22, 11);

    // LIV-020 IEM input labels are overlays only, like LIV-019.
    // Do not create extra IEM equipment here.
    createLabel(layer, "INPUT A", panels.iemPack1.x + 58, panels.iemPack1.y + 40, 10);
    createLabel(layer, "INPUT B", panels.iemPack1.x + 138, panels.iemPack1.y + 40, 10);
    createLabel(layer, "INPUT A", panels.iemPack2.x + 58, panels.iemPack2.y + 40, 10);
    createLabel(layer, "INPUT B", panels.iemPack2.x + 138, panels.iemPack2.y + 40, 10);
    createLabel(layer, "INPUT A", panels.iemPack3.x + 58, panels.iemPack3.y + 40, 10);
    createLabel(layer, "INPUT B", panels.iemPack3.x + 138, panels.iemPack3.y + 40, 10);

    sfLiv010PlaceImage(layer, panels.foh, { alt: "Monitor console outputs", zIndex: 40 });
    sfLiv010PlaceImage(layer, panels.crossover, { alt: "3-way crossover", zIndex: 40 });
    sfLiv010PlaceImage(layer, panels.highAmp, { alt: "High amplifier", zIndex: 40 });
    sfLiv010PlaceImage(layer, panels.midAmp, { alt: "Mid amplifier", zIndex: 40 });
    sfLiv010PlaceImage(layer, panels.lowAmp, { alt: "Low amplifier", zIndex: 40 });
    sfLiv010PlaceImage(layer, panels.paVisual, { alt: "PA line arrays over subs", zIndex: 20 });
    sfLiv010PlaceImage(layer, panels.speakerLeft, { alt: "Left line array input panel", zIndex: 44 });
    sfLiv010PlaceImage(layer, panels.speakerRight, { alt: "Right line array input panel", zIndex: 44 });
    sfLiv010PlaceImage(layer, panels.iemPack1, { alt: "IEM pack 1", zIndex: 44 });
    sfLiv010PlaceImage(layer, panels.iemPack2, { alt: "IEM pack 2", zIndex: 44 });
    sfLiv010PlaceImage(layer, panels.iemPack3, { alt: "IEM pack 3", zIndex: 44 });

    [
      ["monitor-console", "Monitor console outputs"],
      ["crossover", "3-way crossover"],
      ["high-amp", "High amplifier"],
      ["mid-amp", "Mid amplifier"],
      ["low-amp", "Low amplifier"],
      ["pa-visual", "PA line arrays over subs"],
      ["speaker-left", "Left line array input panel"],
      ["speaker-right", "Right line array input panel"],
      ["iem-pack-1", "IEM pack 1"],
      ["iem-pack-2", "IEM pack 2"],
      ["iem-pack-3", "IEM pack 3"]
    ].forEach(([key, alt]) => {
      const img = Array.from(layer.querySelectorAll("img")).find(el => el.alt === alt);
      if (img) {
        img.dataset.liv019GearKey = key;
        img.dataset.liv020GearKey = key;
      }
    });

    function p(panel, x, y) {
      return sfLiv010Point(panel, x, y);
    }

    function jack(key, panel, x, y, label) {
      sfLiv010CreateJack(layer, key, p(panel, x, y), label || nodeLabel(key), false);
    }

    jack("liv020-main-left-output", panels.foh, 975 / 1120, 134 / 260, "Main L Output");
    jack("liv020-main-right-output", panels.foh, 1045 / 1120, 134 / 260, "Main R Output");

    [418, 458, 498, 538, 578].forEach((x, idx) => {
      jack("liv020-aux-" + (idx + 1) + "-output", panels.foh, x / 1120, 140 / 260, "Aux " + (idx + 1) + " Output");
    });

    jack("liv020-crossover-left-input", panels.crossover, 165 / 940, 155 / 250, "Crossover L Input");
    jack("liv020-crossover-right-input", panels.crossover, 255 / 940, 155 / 250, "Crossover R Input");
    jack("liv020-crossover-high-left-output", panels.crossover, 505 / 940, 95 / 250, "Crossover High L Output");
    jack("liv020-crossover-high-right-output", panels.crossover, 595 / 940, 95 / 250, "Crossover High R Output");
    jack("liv020-crossover-mid-left-output", panels.crossover, 505 / 940, 155 / 250, "Crossover Mid L Output");
    jack("liv020-crossover-mid-right-output", panels.crossover, 595 / 940, 155 / 250, "Crossover Mid R Output");
    jack("liv020-crossover-low-left-output", panels.crossover, 505 / 940, 215 / 250, "Crossover Low L Output");
    jack("liv020-crossover-low-right-output", panels.crossover, 595 / 940, 215 / 250, "Crossover Low R Output");

    [
      [panels.highAmp, "high"],
      [panels.midAmp, "mid"],
      [panels.lowAmp, "low"]
    ].forEach(([panel, band]) => {
      const label = band.charAt(0).toUpperCase() + band.slice(1);
      jack("liv020-" + band + "-amp-left-input", panel, 170 / 940, 145 / 240, label + " Amp L Input");
      jack("liv020-" + band + "-amp-right-input", panel, 270 / 940, 145 / 240, label + " Amp R Input");
      jack("liv020-" + band + "-amp-left-output", panel, 670 / 940, 145 / 240, label + " Amp L Output");
      jack("liv020-" + band + "-amp-right-output", panel, 770 / 940, 145 / 240, label + " Amp R Output");
    });

    jack("liv020-left-line-array-high-input", panels.speakerLeft, 130 / 260, 168 / 620, "Left Line Array High Input");
    jack("liv020-left-line-array-mid-input", panels.speakerLeft, 130 / 260, 328 / 620, "Left Line Array Mid Input");
    jack("liv020-left-line-array-low-input", panels.speakerLeft, 130 / 260, 488 / 620, "Left Line Array Low Input");
    jack("liv020-right-line-array-high-input", panels.speakerRight, 130 / 260, 168 / 620, "Right Line Array High Input");
    jack("liv020-right-line-array-mid-input", panels.speakerRight, 130 / 260, 328 / 620, "Right Line Array Mid Input");
    jack("liv020-right-line-array-low-input", panels.speakerRight, 130 / 260, 488 / 620, "Right Line Array Low Input");

    jack("liv020-iem-pack-1-input", panels.iemPack1, 0.50, 0.54, "IEM Pack 1 Input A");
    jack("liv020-iem-pack-1-input-b", panels.iemPack1, 0.72, 0.54, "IEM Pack 1 Input B");
    jack("liv020-iem-pack-2-input", panels.iemPack2, 0.50, 0.54, "IEM Pack 2 Input A");
    jack("liv020-iem-pack-2-input-b", panels.iemPack2, 0.72, 0.54, "IEM Pack 2 Input B");
    jack("liv020-iem-pack-3-input", panels.iemPack3, 0.50, 0.54, "IEM Pack 3 Input A");

    sfLiv020ApplyHitboxLayoutLock(layer, "after-liv020-jack-create");

    const spacer = document.createElement("div");
    spacer.className = "sfLiv010SurfaceScrollSpacer";
    spacer.style.cssText = "position:relative;display:block;opacity:0;pointer-events:none";
    spacer.style.setProperty("width", boardWidth + "px", "important");
    spacer.style.setProperty("min-width", boardWidth + "px", "important");
    spacer.style.setProperty("min-height", boardHeight + "px", "important");
    spacer.style.setProperty("height", boardHeight + "px", "important");

    surface.appendChild(layer);
    applyLiv020GearLock(layer);
    sfLiv020ApplyHitboxLayoutLock(layer, "after-gear-lock");
    installLiv020BadJacks(layer);
    surface.appendChild(spacer);
    redrawCables(layer);
    installCableDrag(layer);

    console.log("[Signal Flow] LIV-020 main PA + IEM renderer mounted", {
      boardHeight,
      boardWidth,
      foh: panels.foh,
      crossover: panels.crossover,
      iemPack1: panels.iemPack1,
      iemPack2: panels.iemPack2,
      iemPack3: panels.iemPack3
    });
  }

  function renderLiv010ThreeWayCrossover(surface, adapter) {
    sfLiv010InstallStyle();

    surface.classList.add("sf-live-native-scroll-host-liv010");
    surface.style.setProperty("overflow-y", "auto", "important");
    surface.style.setProperty("overflow-x", "auto", "important");
    if (getComputedStyle(surface).position === "static") {
      surface.style.position = "relative";
    }

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    surface.querySelectorAll(".sfLiv010SurfaceScrollSpacer").forEach(el => el.remove());

    const rect = surface.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const panels = sfLiv010BuildPanels(width);
    const boardHeight = Math.max(2300, Math.ceil(panels.paVisual.y + sfLiv010PanelHeight(panels.paVisual) + 150));

    surface.style.setProperty("--sf-liv010-board-height", boardHeight + "px");

    const layer = document.createElement("div");
    layer.className = "sf-live-native-layer sf-live-native-level-liv-010 sf-liv010-vertical-stack-v204";
    layer.style.cssText = [
      "position:absolute",
      "left:0",
      "top:0",
      "right:0",
      "height:" + boardHeight + "px",
      "min-height:" + boardHeight + "px",
      "z-index:9990",
      "isolation:isolate",
      "pointer-events:none",
      "overflow:visible",
      "border-radius:18px",
      "background:radial-gradient(circle at 50% 10%, rgba(41,126,93,.13) 0%, rgba(41,126,93,.06) 22%, rgba(0,0,0,0) 46%), linear-gradient(180deg, rgba(2,8,9,.91), rgba(3,9,10,.95) 50%, rgba(3,8,9,.98))"
    ].join(";");
    layer.style.setProperty("height", boardHeight + "px", "important");
    layer.style.setProperty("min-height", boardHeight + "px", "important");

    function centerLabel(text, panel, yOffset, size) {
      createLabel(layer, text, panel.x + 12, panel.y + (yOffset || -22), size || 11);
    }

    createLabel(layer, "3-WAY CROSSOVER PA FEED - VERTICAL LOCKED LAYOUT", 24, 20, 12);
    centerLabel("FOH MAIN OUTPUTS", panels.foh, -22, 11);
    centerLabel("3-WAY CROSSOVER", panels.crossover, -22, 11);
    centerLabel("HIGH AMP", panels.highAmp, -22, 11);
    centerLabel("MID AMP", panels.midAmp, -22, 11);
    centerLabel("LOW AMP", panels.lowAmp, -22, 11);
    createLabel(layer, "LEFT LINE ARRAY INPUTS", panels.speakerLeft.x, panels.speakerLeft.y - 22, 11);
    createLabel(layer, "RIGHT LINE ARRAY INPUTS", panels.speakerRight.x, panels.speakerRight.y - 22, 11);

    sfLiv010PlaceImage(layer, panels.foh, { alt: "FOH console main outputs", zIndex: 40 });
    sfLiv010PlaceImage(layer, panels.crossover, { alt: "3-way crossover", zIndex: 40 });
    sfLiv010PlaceImage(layer, panels.highAmp, { alt: "High amplifier", zIndex: 40 });
    sfLiv010PlaceImage(layer, panels.midAmp, { alt: "Mid amplifier", zIndex: 40 });
    sfLiv010PlaceImage(layer, panels.lowAmp, { alt: "Low amplifier", zIndex: 40 });
    sfLiv010PlaceImage(layer, panels.paVisual, { alt: "PA line arrays over subs", zIndex: 20 });
    sfLiv010PlaceImage(layer, panels.speakerLeft, { alt: "Left line array input panel", zIndex: 44 });
    sfLiv010PlaceImage(layer, panels.speakerRight, { alt: "Right line array input panel", zIndex: 44 });

    function p(panel, x, y){ return sfLiv010Point(panel, x, y); }

    const active = new Set();
    LEVEL.validRoutes.forEach(route => { active.add(route.from); active.add(route.to); });
    function jack(key, panel, x, y, label){
      sfLiv010CreateJack(layer, key, p(panel, x, y), label || nodeLabel(key), !active.has(key));
    }

    // FOH main outputs plus visible false candidates from the bus / aux / bus sections.
    jack("foh-liv010-main-left-output", panels.foh, 975/1120, 134/260, "Main L Output");
    jack("foh-liv010-main-right-output", panels.foh, 1045/1120, 134/260, "Main R Output");
    [105,180,255,330].forEach((x, idx) => jack("foh-liv006-bus-" + (idx + 1) + "-output", panels.foh, x/1120, 134/260, "Bus " + (idx + 1) + " Output"));
    [418,458,498,538,578,618].forEach((x, idx) => jack("foh-liv006-aux-" + (idx + 1) + "-output", panels.foh, x/1120, 140/260, "Aux " + (idx + 1) + " Output"));
    [710,756,802,848].forEach((x, idx) => jack("foh-liv006-bus-" + (idx + 1) + "-output", panels.foh, x/1120, 126/260, "Bus " + (idx + 1) + " Output"));
    [710,756,802,848].forEach((x, idx) => jack("foh-liv006-bus-" + (idx + 5) + "-output", panels.foh, x/1120, 190/260, "Bus " + (idx + 5) + " Output"));

    // Crossover inputs and band outputs.
    jack("liv010-crossover-left-input", panels.crossover, 165/940, 155/250, "Crossover L Input");
    jack("liv010-crossover-right-input", panels.crossover, 255/940, 155/250, "Crossover R Input");
    jack("liv010-crossover-high-left-output", panels.crossover, 505/940, 95/250, "Crossover High L Output");
    jack("liv010-crossover-high-right-output", panels.crossover, 595/940, 95/250, "Crossover High R Output");
    jack("liv010-crossover-mid-left-output", panels.crossover, 505/940, 155/250, "Crossover Mid L Output");
    jack("liv010-crossover-mid-right-output", panels.crossover, 595/940, 155/250, "Crossover Mid R Output");
    jack("liv010-crossover-low-left-output", panels.crossover, 505/940, 215/250, "Crossover Low L Output");
    jack("liv010-crossover-low-right-output", panels.crossover, 595/940, 215/250, "Crossover Low R Output");

    // Amp inputs and Speakon outputs.
    [
      [panels.highAmp, "high"],
      [panels.midAmp, "mid"],
      [panels.lowAmp, "low"]
    ].forEach(([panel, band]) => {
      const label = band.charAt(0).toUpperCase() + band.slice(1);
      jack("liv010-" + band + "-amp-left-input", panel, 170/940, 145/240, label + " Amp L Input");
      jack("liv010-" + band + "-amp-right-input", panel, 270/940, 145/240, label + " Amp R Input");
      jack("liv010-" + band + "-amp-left-output", panel, 670/940, 145/240, label + " Amp L Output");
      jack("liv010-" + band + "-amp-right-output", panel, 770/940, 145/240, label + " Amp R Output");
    });

    // Speaker input panels flank the PA image. The PA artwork itself is visual-only.
    jack("liv010-left-line-array-high-input", panels.speakerLeft, 130/260, 168/620, "Left Line Array High Input");
    jack("liv010-left-line-array-mid-input", panels.speakerLeft, 130/260, 328/620, "Left Line Array Mid Input");
    jack("liv010-left-line-array-low-input", panels.speakerLeft, 130/260, 488/620, "Left Line Array Low Input");
    jack("liv010-right-line-array-high-input", panels.speakerRight, 130/260, 168/620, "Right Line Array High Input");
    jack("liv010-right-line-array-mid-input", panels.speakerRight, 130/260, 328/620, "Right Line Array Mid Input");
    jack("liv010-right-line-array-low-input", panels.speakerRight, 130/260, 488/620, "Right Line Array Low Input");

    const spacer = document.createElement("div");
    spacer.className = "sfLiv010SurfaceScrollSpacer";
    spacer.style.cssText = "position:relative;display:block;width:1px;opacity:0;pointer-events:none";
    spacer.style.setProperty("min-height", boardHeight + "px", "important");
    spacer.style.setProperty("height", boardHeight + "px", "important");

    surface.appendChild(layer);
    surface.appendChild(spacer);

    applyLiv020LabelLayoutLock(layer);
    setTimeout(() => applyLiv020LabelLayoutLock(layer), 0);
    setTimeout(() => applyLiv020LabelLayoutLock(layer), 100);

    redrawCables(layer);
    installCableDrag(layer);

    console.log("[Signal Flow] LIV-010 vertical locked dedicated renderer mounted v6r204", {
      boardHeight,
      foh: panels.foh,
      crossover: panels.crossover,
      highAmp: panels.highAmp,
      midAmp: panels.midAmp,
      lowAmp: panels.lowAmp,
      paVisual: panels.paVisual,
      speakerLeft: panels.speakerLeft,
      speakerRight: panels.speakerRight
    });
  }


  // LIV-011 native patch-board uses generic renderer with crossover player-facing terminology.



  function renderLiv018TalkbackMonitor(surface, adapter) {

    // LIV-018 v6r366: lock coordinate canvas, not viewport.
    // All Gear Mover, Hitbox Tool, and Cable Anchor Tool exports were captured on this canvas.
    // The wrapper may scroll; the coordinate plane must not reflow.
    const liv018CanvasWidth = 1220;
    const liv018CanvasHeight = 760;
    const liv018Wrap = surface && surface.closest ? surface.closest(".patchbay-wrap, .sf-live-native-viewport") : null;

    if (liv018Wrap) {
      liv018Wrap.style.setProperty("overflow", "auto", "important");
      liv018Wrap.style.setProperty("max-height", "none", "important");
    }

    surface.style.setProperty("width", liv018CanvasWidth + "px", "important");
    surface.style.setProperty("min-width", liv018CanvasWidth + "px", "important");
    surface.style.setProperty("height", liv018CanvasHeight + "px", "important");
    surface.style.setProperty("min-height", liv018CanvasHeight + "px", "important");
    surface.style.setProperty("max-height", "none", "important");
    surface.style.setProperty("overflow", "visible", "important");

    // LIV-018 v6r370: constrain legacy cableLayer scroll footprint.
    // Inspector showed svg#cableLayer was 1248x912 and causing diagonal scroll.
    // Native LIV cables are drawn inside .sf-live-native-layer; the legacy layer should not define scroll size.
    const legacyCableLayer =
      (liv018Wrap && liv018Wrap.querySelector && liv018Wrap.querySelector("#cableLayer")) ||
      document.getElementById("cableLayer");

    if (legacyCableLayer) {
      legacyCableLayer.setAttribute("width", String(liv018CanvasWidth));
      legacyCableLayer.setAttribute("height", String(liv018CanvasHeight));
      legacyCableLayer.style.setProperty("width", liv018CanvasWidth + "px", "important");
      legacyCableLayer.style.setProperty("height", liv018CanvasHeight + "px", "important");
      legacyCableLayer.style.setProperty("max-width", liv018CanvasWidth + "px", "important");
      legacyCableLayer.style.setProperty("max-height", liv018CanvasHeight + "px", "important");
      legacyCableLayer.style.setProperty("left", "0px", "important");
      legacyCableLayer.style.setProperty("top", "0px", "important");
      legacyCableLayer.style.setProperty("overflow", "hidden", "important");
      legacyCableLayer.style.setProperty("pointer-events", "none", "important");
    }
    const rect = surface.getBoundingClientRect();
    const boardHeight = Math.max(620, Math.min(760, Math.round(rect.height || 640)));

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    surface.querySelectorAll(".sfLiveNativeSurfaceScrollSpacer").forEach(el => el.remove());
    surface.classList.remove("sf-live-native-scroll-host");
    surface.style.removeProperty("--sf-live-native-board-height");

    if (typeof applyNativeViewportContract === "function") {
      applyNativeViewportContract(surface, boardHeight);
    }

    const layer = document.createElement("div");

    // LIV-018 v6r352: compatibility point for stale tbOut references.
    // Required because older TB tape code still references tbOut.x / tbOut.y.
    const tbOut = { x: 770, y: 293 };
    layer.className = "sf-live-native-layer sf-live-native-level-liv-018 sf-live-native-liv018-talkback";
    layer.style.cssText = [
      "position:absolute",
      "left:0",
      "top:0",
      "right:0",
      "height:" + boardHeight + "px",
      "min-height:" + boardHeight + "px",
      "z-index:9990",
      "isolation:isolate",
      "pointer-events:none",
      "overflow:hidden",
      "border-radius:16px",
      "background:radial-gradient(circle at 18% 14%, rgba(68,120,95,.22), rgba(0,0,0,0) 45%),radial-gradient(circle at 76% 28%, rgba(80,118,190,.18), rgba(0,0,0,0) 48%)"
    ].join(";");

    const W = rect.width;
    const H = boardHeight;

    const activeEndpointKeys = new Set();
    (LEVEL.validRoutes || []).forEach(route => {
      activeEndpointKeys.add(route.from);
      activeEndpointKeys.add(route.to);
    });

    function asset(path) {
      return typeof sfRepoUrl === "function" ? sfRepoUrl(path) : path;
    }

    function placeImage(path, x, y, w, alt, z) {
      const img = document.createElement("img");
      img.src = asset(path);
      img.alt = alt || "";
      img.style.cssText = [
        "position:absolute",
        "left:" + x + "px",
        "top:" + y + "px",
        "width:" + w + "px",
        "height:auto",
        "pointer-events:none",
        "user-select:none",
        "filter:drop-shadow(0 12px 24px rgba(0,0,0,.70))",
        "z-index:" + (z || 10)
      ].join(";");
      layer.appendChild(img);
      return img;
    }

    function textLabel(text, x, y, size, align) {
      createLabel(layer, text, x, y, size || 11);
      const labels = Array.from(layer.querySelectorAll("*")).filter(el => {
        return String(el.textContent || "").replace(/\s+/g, " ").trim() === text;
      });
      const el = labels[labels.length - 1];
      if (el && align === "center") {
        el.style.transform = "translateX(-50%)";
        el.style.textAlign = "center";
      }
      return el;
    }

    function transparentSource(key, label, x, y, w, h) {
      createSourceNode(layer, key, label, x, y);
      const el = layer.querySelector('[data-node-key="' + key + '"]');
      if (el) {
        el.style.setProperty("position", "absolute", "important");
        el.style.setProperty("left", (x - w / 2) + "px", "important");
        el.style.setProperty("top", (y - h / 2) + "px", "important");
        el.style.setProperty("width", w + "px", "important");
        el.style.setProperty("height", h + "px", "important");
        el.style.setProperty("min-width", w + "px", "important");
        el.style.setProperty("min-height", h + "px", "important");
        el.style.setProperty("background", "rgba(255,255,255,0.001)", "important");
        el.style.setProperty("border", "2px solid rgba(255,255,255,0.001)", "important");
        el.style.setProperty("box-shadow", "none", "important");
        el.style.setProperty("color", "transparent", "important");
        el.style.setProperty("text-shadow", "none", "important");
        el.style.setProperty("pointer-events", "auto", "important");
        el.style.setProperty("z-index", "80", "important");
        el.dataset.sfLiv018SemanticSource = "true";
        el.setAttribute("aria-label", label);
        el.title = label;
      }
    }

    function jack(key, x, y, label, active, r) {
      createJackNode(layer, key, { x, y }, label, !active);
      const el = layer.querySelector('[data-node-key="' + key + '"]');
      if (el && r) {
        el.style.setProperty("width", (r * 2) + "px", "important");
        el.style.setProperty("height", (r * 2) + "px", "important");
        el.style.setProperty("margin-left", (-r) + "px", "important");
        el.style.setProperty("margin-top", (-r) + "px", "important");
      }
      return el;
    }

    function active(key) {
      return activeEndpointKeys.has(key);
    }

    createLabel(layer, "TALKBACK TO MONITOR SYSTEM - NATIVE BOARD", 18, 14, 12);

    // Visual layout.
    // LIV-018 v6r320: restore the uploaded "best version" geometry.
    // Keep native spec/routes/viewport unchanged.
    const micW = Math.min(220, W * 0.215);
    const keysW = Math.min(365, W * 0.360);

    const talkbackMic = { x: W * 0.020, y: H * 0.075, w: micW };
    // LIV-018 v6r333: move Vocal mic group up to match Talkback spacing better.
    const vocalMic = { x: W * 0.020, y: H * 0.495, w: micW };
    // LIV-018 v6r338: align keyboard image box top with Vocal mic image box top; size unchanged.

    const keys = { x: W * 0.165, y: vocalMic.y - H * 0.045, w: keysW };

    const stage = { x: W * 0.505, y: H * 0.045, w: W * 0.470 };
    const foh = { x: W * 0.291, y: H * 0.255, w: W * 0.710 };
    const iem = { x: W * 0.505, y: H * 0.565, w: W * 0.465 };

    // LIV-018 v6r350: source visuals locked from Gear Mover export.
    textLabel("SOURCES", W * 0.055, H * 0.075, 12);

    placeImage("/assets/live-sound/svg/hardware/mic nbg.svg", 8, 31, 304, "Talkback microphone", 20);
    textLabel("TALKBACK", 159, 211, 12, "center");

    placeImage("/assets/live-sound/svg/hardware/mic nbg.svg", 3, 250, 304, "Lead vocal microphone", 20);
    textLabel("VOCALS", 164, 445, 12, "center");

    placeImage("/assets/live-sound/svg/hardware/keyboard0.svg", 66, 477, 365, "Keyboard DI", 20);
    textLabel("KEYS", 254, 509, 12, "center");
    textLabel("STAGE BOX INPUTS", stage.x, stage.y - 25, 11);
    placeImage("/assets/live-sound/svg/hardware/stagebox-snake-head-16x2-aes.svg", stage.x, stage.y, stage.w, "16-channel stage box", 15);

    // LIV-018 v6r347: FOH visual placement from Gear Mover export.
    textLabel("FOH CONSOLE", foh.x - 45, foh.y - 24, 11);
    placeImage("/assets/live-sound/svg/hardware/foh-console-liv003-game-style.svg", foh.x, foh.y, foh.w, "FOH console aux outputs", 15);

    // LIV-018 v6r334: keep In-Ear Monitoring label above rack/cables.
    const iemLabel = textLabel("IN-EAR MONITORING", iem.x, iem.y - 24, 11);
    if (iemLabel) {
      iemLabel.style.setProperty("z-index", "120", "important");
      iemLabel.style.setProperty("pointer-events", "none", "important");
    }
    placeImage("/assets/live-sound/svg/hardware/iem-transmitter-liv003-game-style.svg", iem.x, iem.y, iem.w, "In-ear monitoring transmitter", 15);

    // LIV-018 v6r374: SAFE RESTORE; fixed 1220x760 canvas and v370 cableLayer constraint only. False-jack/axis-lock experiments removed.
    // LIV-018 v6r354: exact Hitbox Tool rectangles using existing working node helpers.
    // v6r353 had correct box positions but custom event handlers that were out of scope.
    // This version creates nodes with transparentSource()/jack(), then snaps the DOM box exactly.

    const LIV018_REQUIRED_HITBOXES = {
      "talkback-mic": { type: "source", label: "Talkback Mic", x: 165, y: 93, w: 92, h: 178 },
      "lead-vocal-mic": { type: "source", label: "Lead Vocal Mic", x: 158, y: 313, w: 92, h: 178 },
      "keys-left-di": { type: "source", label: "Keys L DI", x: 183, y: 556, w: 118, h: 96 },
      "keys-right-di": { type: "source", label: "Keys R DI", x: 307, y: 559, w: 118, h: 96 },

      "stagebox-input-1": { type: "jack", label: "Stage Box Input 1", x: 668, y: 108, w: 34, h: 34 },
      "stagebox-input-7": { type: "jack", label: "Stage Box Input 7", x: 935, y: 107, w: 34, h: 34 },
      "stagebox-input-8": { type: "jack", label: "Stage Box Input 8", x: 981, y: 106, w: 40, h: 40 },
      "stagebox-input-14": { type: "jack", label: "Stage Box Input 14", x: 891, y: 179, w: 34, h: 34 },

      "talkback-output": { type: "jack", label: "Talkback Output", x: 770, y: 293, w: 34, h: 34 },
      "in-ear-b-input": { type: "jack", label: "In-Ear B Input", x: 904, y: 519, w: 40, h: 40 }
    };

    // LIV-018 v6r358: cable anchors captured with Cable Anchor Tool.
    // Hitboxes remain large/easy; cables start from the visible source output points.
    const LIV018_CABLE_ANCHORS = {
      "talkback-mic": { x: 150, y: 54 },
      "lead-vocal-mic": { x: 142, y: 278 },
      "keys-left-di": { x: 211, y: 527 },
      "keys-right-di": { x: 285, y: 529 }
    };

    function findLiv018NodeElement(key) {
      const nodes = Array.from(layer.querySelectorAll('[data-node-key="' + key + '"], [data-key="' + key + '"]'));
      return (
        nodes.find(el => {
          const pe = getComputedStyle(el).pointerEvents;
          return pe !== "none" && (el.tagName === "BUTTON" || el.classList.contains("sf-native-node"));
        }) ||
        nodes.find(el => getComputedStyle(el).pointerEvents !== "none") ||
        nodes[0] ||
        null
      );
    }

    function snapLiv018NodeBox(key) {
      const hb = LIV018_REQUIRED_HITBOXES[key];
      const el = findLiv018NodeElement(key);

      if (!hb || !el) {
        console.warn("[Signal Flow] LIV-018 v6r354 could not snap node", key);
        return;
      }

      el.classList.add("sf-native-liv018-exact-node");
      el.dataset.nodeKey = key;
      el.dataset.key = key;
      el.dataset.nodeType = hb.type;
      el.dataset.type = hb.type;
      el.dataset.label = hb.label || key;
      el.setAttribute("aria-label", hb.label || key);
      el.title = hb.label || key;

      const cableAnchor = LIV018_CABLE_ANCHORS[key];
      if (cableAnchor) {
        el.dataset.anchorX = String(cableAnchor.x);
        el.dataset.anchorY = String(cableAnchor.y);
        el.dataset.cableX = String(cableAnchor.x);
        el.dataset.cableY = String(cableAnchor.y);
        el.style.setProperty("--sf-cable-x", cableAnchor.x + "px");
        el.style.setProperty("--sf-cable-y", cableAnchor.y + "px");

        // LIV-018 v6r357:
        // Keep the real DOM box large for clicking, but make cable drawing see
        // the captured source output point as the element center.
        Object.defineProperty(el, "getBoundingClientRect", {
          configurable: true,
          value: function() {
            const layerRect = layer.getBoundingClientRect();
            const size = 2;
            const left = layerRect.left + cableAnchor.x - size / 2;
            const top = layerRect.top + cableAnchor.y - size / 2;
            const rect = {
              x: left,
              y: top,
              left,
              top,
              right: left + size,
              bottom: top + size,
              width: size,
              height: size,
              toJSON() {
                return {
                  x: left,
                  y: top,
                  left,
                  top,
                  right: left + size,
                  bottom: top + size,
                  width: size,
                  height: size
                };
              }
            };
            return rect;
          }
        });
      }

      el.style.setProperty("position", "absolute", "important");
      el.style.setProperty("left", Math.round(hb.x - hb.w / 2) + "px", "important");
      el.style.setProperty("top", Math.round(hb.y - hb.h / 2) + "px", "important");
      el.style.setProperty("width", Math.round(hb.w) + "px", "important");
      el.style.setProperty("height", Math.round(hb.h) + "px", "important");
      el.style.setProperty("margin", "0", "important");
      el.style.setProperty("margin-left", "0", "important");
      el.style.setProperty("margin-top", "0", "important");
      el.style.setProperty("padding", "0", "important");
      el.style.setProperty("transform", "none", "important");
      el.style.setProperty("pointer-events", "auto", "important");
      el.style.setProperty("z-index", "4200", "important");
      el.style.setProperty("border-radius", hb.type === "source" ? "18px" : "999px", "important");
    }

    function forwardLiv018ProxyEvent(proxyEvent, realNode) {
      if (!realNode) return;

      const opts = {
        bubbles: true,
        cancelable: true,
        composed: true,
        clientX: proxyEvent.clientX,
        clientY: proxyEvent.clientY,
        screenX: proxyEvent.screenX,
        screenY: proxyEvent.screenY,
        button: proxyEvent.button || 0,
        buttons: proxyEvent.buttons || 1,
        ctrlKey: proxyEvent.ctrlKey,
        shiftKey: proxyEvent.shiftKey,
        altKey: proxyEvent.altKey,
        metaKey: proxyEvent.metaKey
      };

      let forwarded;
      if (proxyEvent.type.indexOf("pointer") === 0 && typeof PointerEvent !== "undefined") {
        forwarded = new PointerEvent(proxyEvent.type, {
          ...opts,
          pointerId: proxyEvent.pointerId || 1,
          pointerType: proxyEvent.pointerType || "mouse",
          isPrimary: proxyEvent.isPrimary !== false
        });
      } else {
        forwarded = new MouseEvent(proxyEvent.type, opts);
      }

      realNode.dispatchEvent(forwarded);
    }

    function placeLiv018SourceProxy(key, realNode) {
      const hb = LIV018_REQUIRED_HITBOXES[key];
      if (!hb || !realNode) return;

      layer.querySelectorAll('[data-liv018-proxy-key="' + key + '"]').forEach(el => el.remove());

      const proxy = document.createElement("button");
      proxy.type = "button";
      proxy.className = "sf-native-liv018-source-proxy";
      proxy.dataset.liv018ProxyKey = key;
      proxy.setAttribute("aria-label", hb.label || key);
      proxy.title = hb.label || key;

      proxy.style.cssText = [
        "position:absolute",
        "left:" + Math.round(hb.x - hb.w / 2) + "px",
        "top:" + Math.round(hb.y - hb.h / 2) + "px",
        "width:" + Math.round(hb.w) + "px",
        "height:" + Math.round(hb.h) + "px",
        "padding:0",
        "margin:0",
        "border:0",
        "outline:none",
        "appearance:none",
        "-webkit-appearance:none",
        "background:transparent",
        "pointer-events:auto",
        "cursor:pointer",
        "z-index:4300",
        "border-radius:18px"
      ].join(";");

      ["pointerdown", "pointerup", "click"].forEach(type => {
        proxy.addEventListener(type, event => {
          event.preventDefault();
          event.stopPropagation();
          forwardLiv018ProxyEvent(event, realNode);
        }, true);
      });

      layer.appendChild(proxy);
    }

    function placeLiv018RequiredSource(key) {
      const hb = LIV018_REQUIRED_HITBOXES[key];
      if (!hb) return;

      const anchor = LIV018_CABLE_ANCHORS[key] || { x: hb.x, y: hb.y };

      layer.querySelectorAll('[data-node-key="' + key + '"], [data-key="' + key + '"], [data-liv018-proxy-key="' + key + '"]').forEach(el => el.remove());

      // LIV-018 v6r358:
      // Real native source stays tiny at the cable output point.
      // A separate large invisible proxy forwards user clicks to it.
      transparentSource(key, hb.label || key, anchor.x, anchor.y, 18, 18);

      const realNode = findLiv018NodeElement(key);
      if (realNode) {
        realNode.classList.add("sf-native-liv018-real-source-anchor");
        realNode.style.setProperty("position", "absolute", "important");
        realNode.style.setProperty("left", Math.round(anchor.x - 9) + "px", "important");
        realNode.style.setProperty("top", Math.round(anchor.y - 9) + "px", "important");
        realNode.style.setProperty("width", "18px", "important");
        realNode.style.setProperty("height", "18px", "important");
        realNode.style.setProperty("margin", "0", "important");
        realNode.style.setProperty("margin-left", "0", "important");
        realNode.style.setProperty("margin-top", "0", "important");
        realNode.style.setProperty("padding", "0", "important");
        realNode.style.setProperty("transform", "none", "important");
        realNode.style.setProperty("pointer-events", "auto", "important");
        realNode.style.setProperty("z-index", "4250", "important");
        realNode.style.setProperty("opacity", "0.001", "important");
      }

      placeLiv018SourceProxy(key, realNode);
    }

    function placeLiv018RequiredJack(key) {
      const hb = LIV018_REQUIRED_HITBOXES[key];
      if (!hb) return;
      layer.querySelectorAll('[data-node-key="' + key + '"], [data-key="' + key + '"]').forEach(el => el.remove());
      const radius = Math.ceil(Math.max(hb.w, hb.h) / 2);
      jack(key, hb.x, hb.y, hb.label || key, active(key), radius);
      snapLiv018NodeBox(key);
    }

    placeLiv018RequiredSource("talkback-mic");
    placeLiv018RequiredSource("lead-vocal-mic");
    placeLiv018RequiredSource("keys-left-di");
    placeLiv018RequiredSource("keys-right-di");

    placeLiv018RequiredJack("stagebox-input-1");
    placeLiv018RequiredJack("stagebox-input-7");
    placeLiv018RequiredJack("stagebox-input-8");
    placeLiv018RequiredJack("stagebox-input-14");
    placeLiv018RequiredJack("talkback-output");
    placeLiv018RequiredJack("in-ear-b-input");

    // LIV-018 v6r377: restore invisible false jacks and visual label overlays.
    // Scroll remains owned by sf-liv018-scroll-shell.js. No scroll code belongs here.

    const LIV018_FALSE_JACK_HITBOXES = {
      "stagebox-input-2": { label: "Stage Box Input 2", x: 714, y: 106, w: 28, h: 28 },
      "stagebox-input-3": { label: "Stage Box Input 3", x: 759, y: 106, w: 28, h: 28 },
      "stagebox-input-4": { label: "Stage Box Input 4", x: 801, y: 102, w: 28, h: 28 },
      "stagebox-input-5": { label: "Stage Box Input 5", x: 846, y: 103, w: 28, h: 28 },
      "stagebox-input-6": { label: "Stage Box Input 6", x: 892, y: 103, w: 28, h: 28 },
      "stagebox-input-9": { label: "Stage Box Input 9", x: 668, y: 179, w: 28, h: 28 },
      "stagebox-input-10": { label: "Stage Box Input 10", x: 713, y: 178, w: 28, h: 28 },
      "stagebox-input-11": { label: "Stage Box Input 11", x: 754, y: 176, w: 28, h: 28 },
      "stagebox-input-12": { label: "Stage Box Input 12", x: 801, y: 177, w: 28, h: 28 },
      "stagebox-input-13": { label: "Stage Box Input 13", x: 844, y: 180, w: 28, h: 28 },
      "stagebox-input-15": { label: "Stage Box Input 15", x: 933, y: 182, w: 28, h: 28 },
      "stagebox-input-16": { label: "Stage Box Input 16", x: 979, y: 178, w: 28, h: 28 },
      "stagebox-aes-link-out": { label: "Stagebox AES Link Out", x: 1126, y: 103, w: 28, h: 28 },
      "stagebox-aes-link-in": { label: "Stagebox AES Link In", x: 1125, y: 178, w: 28, h: 28 },

      "foh-liv018-input-1": { label: "FOH Input 1", x: 426, y: 288, w: 28, h: 28 },
      "foh-liv018-input-2": { label: "FOH Input 2", x: 478, y: 289, w: 28, h: 28 },
      "foh-liv018-input-3": { label: "FOH Input 3", x: 526, y: 288, w: 28, h: 28 },
      "foh-liv018-input-4": { label: "FOH Input 4", x: 574, y: 288, w: 28, h: 28 },
      "foh-liv018-input-5": { label: "FOH Input 5", x: 431, y: 335, w: 28, h: 28 },
      "foh-liv018-input-6": { label: "FOH Input 6", x: 475, y: 339, w: 28, h: 28 },
      "foh-liv018-input-7": { label: "FOH Input 7", x: 524, y: 339, w: 28, h: 28 },
      "foh-liv018-input-8": { label: "FOH Input 8", x: 572, y: 341, w: 28, h: 28 },

      "foh-liv018-aux-false-1": { label: "Aux Output 1", x: 680, y: 293, w: 28, h: 28 },
      "foh-liv018-aux-false-2": { label: "Aux Output 2", x: 711, y: 289, w: 28, h: 28 },
      "foh-liv018-aux-false-3": { label: "Aux Output 3", x: 740, y: 290, w: 28, h: 28 },
      "foh-liv018-aux-false-5": { label: "Aux Output 5", x: 805, y: 291, w: 28, h: 28 },
      "foh-liv018-aux-false-6": { label: "Aux Output 6", x: 833, y: 291, w: 28, h: 28 },
      "foh-liv018-aux-false-7": { label: "Aux Output 7", x: 676, y: 330, w: 28, h: 28 },
      "foh-liv018-aux-false-8": { label: "Aux Output 8", x: 711, y: 330, w: 28, h: 28 },
      "foh-liv018-aux-false-9": { label: "Aux Output 9", x: 743, y: 326, w: 28, h: 28 },
      "foh-liv018-aux-false-10": { label: "Aux Output 10", x: 773, y: 325, w: 28, h: 28 },
      "foh-liv018-aux-false-11": { label: "Aux Output 11", x: 799, y: 326, w: 28, h: 28 },
      "foh-liv018-aux-false-12": { label: "Aux Output 12", x: 830, y: 328, w: 28, h: 28 },

      "foh-liv018-bus-1": { label: "Bus Output 1", x: 902, y: 290, w: 28, h: 28 },
      "foh-liv018-bus-2": { label: "Bus Output 2", x: 937, y: 291, w: 28, h: 28 },
      "foh-liv018-bus-3": { label: "Bus Output 3", x: 974, y: 290, w: 28, h: 28 },
      "foh-liv018-bus-4": { label: "Bus Output 4", x: 1013, y: 292, w: 28, h: 28 },
      "foh-liv018-bus-5": { label: "Bus Output 5", x: 906, y: 340, w: 28, h: 28 },
      "foh-liv018-bus-6": { label: "Bus Output 6", x: 939, y: 340, w: 28, h: 28 },
      "foh-liv018-bus-7": { label: "Bus Output 7", x: 975, y: 339, w: 28, h: 28 },
      "foh-liv018-bus-8": { label: "Bus Output 8", x: 1010, y: 341, w: 28, h: 28 },

      "main-left-output": { label: "Main L Output", x: 1108, y: 298, w: 32, h: 32 },
      "main-right-output": { label: "Main R Output", x: 1162, y: 298, w: 32, h: 32 },

      "iem-tx-a-left-input": { label: "IEM A Left Input", x: 761, y: 515, w: 30, h: 30 },
      "iem-tx-a-right-input": { label: "IEM A Right Input", x: 809, y: 518, w: 30, h: 30 },
      "iem-tx-b-right-input": { label: "IEM B Right Input", x: 966, y: 521, w: 30, h: 30 },
      "iem-tx-phones": { label: "Phones", x: 1080, y: 518, w: 30, h: 30 }
    };

    function hideLiv018FalseJackVisual(el) {
      if (!el) return;
      el.classList.add("sf-native-liv018-invisible-false-jack");
      el.style.setProperty("border", "0", "important");
      el.style.setProperty("outline", "none", "important");
      el.style.setProperty("box-shadow", "none", "important");
      el.style.setProperty("background", "transparent", "important");
      el.style.setProperty("opacity", "0.001", "important");
      el.style.setProperty("color", "transparent", "important");
    }

    function snapLiv018InvisibleFalseJackBox(key) {
      const hb = LIV018_FALSE_JACK_HITBOXES[key];
      const el = findLiv018NodeElement(key);
      if (!hb || !el) return;

      el.dataset.nodeKey = key;
      el.dataset.key = key;
      el.dataset.nodeType = "jack";
      el.dataset.type = "jack";
      el.dataset.label = hb.label || key;
      el.setAttribute("aria-label", hb.label || key);
      el.title = hb.label || key;

      el.style.setProperty("position", "absolute", "important");
      el.style.setProperty("left", Math.round(hb.x - hb.w / 2) + "px", "important");
      el.style.setProperty("top", Math.round(hb.y - hb.h / 2) + "px", "important");
      el.style.setProperty("width", Math.round(hb.w) + "px", "important");
      el.style.setProperty("height", Math.round(hb.h) + "px", "important");
      el.style.setProperty("margin", "0", "important");
      el.style.setProperty("margin-left", "0", "important");
      el.style.setProperty("margin-top", "0", "important");
      el.style.setProperty("padding", "0", "important");
      el.style.setProperty("transform", "none", "important");
      el.style.setProperty("pointer-events", "auto", "important");
      el.style.setProperty("z-index", "4140", "important");
      el.style.setProperty("border-radius", "999px", "important");

      hideLiv018FalseJackVisual(el);
    }

    function placeLiv018InvisibleFalseJack(key) {
      const hb = LIV018_FALSE_JACK_HITBOXES[key];
      if (!hb) return;

      layer.querySelectorAll('[data-node-key="' + key + '"], [data-key="' + key + '"]').forEach(el => el.remove());

      const radius = Math.ceil(Math.max(hb.w, hb.h) / 2);
      jack(key, hb.x, hb.y, hb.label || key, false, radius);
      snapLiv018InvisibleFalseJackBox(key);
    }

    Object.keys(LIV018_FALSE_JACK_HITBOXES).forEach(placeLiv018InvisibleFalseJack);

    function liv018OverlayLabel(text, x, y, w, h, opts = {}) {
      const el = document.createElement("div");
      el.className = "sf-liv018-visual-overlay";
      el.textContent = text || "";
      el.style.position = "absolute";
      el.style.left = Math.round(x) + "px";
      el.style.top = Math.round(y) + "px";
      el.style.width = Math.round(w) + "px";
      el.style.height = Math.round(h) + "px";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.boxSizing = "border-box";
      el.style.pointerEvents = "none";
      el.style.zIndex = String(opts.zIndex || 4340);
      el.style.background = opts.background || "rgba(0,0,0,0.96)";
      el.style.color = opts.color || "#f1d46a";
      el.style.fontSize = (opts.fontSize || 12) + "px";
      el.style.fontWeight = String(opts.fontWeight || 900);
      el.style.borderRadius = (opts.radius || 2) + "px";
      el.style.border = opts.border || "none";
      el.style.lineHeight = "1";
      el.style.textAlign = "center";
      layer.appendChild(el);
      return el;
    }

    function liv018ApplyVisualOverlays() {
      layer.querySelectorAll(".sf-liv018-visual-overlay").forEach(el => el.remove());
      layer.querySelectorAll('img[alt="Talkback label tape"]').forEach(el => el.remove());

      // Restore the white TB tape graphic on the FOH aux section.
      const tbTape = placeImage(
        "/assets/live-sound/svg/handwritten/tb-label-tape-slight-left.svg",
        729,
        243,
        91,
        "Talkback label tape",
        4340
      );
      if (tbTape) {
        tbTape.style.setProperty("pointer-events", "none", "important");
        tbTape.style.setProperty("z-index", "4340", "important");
        tbTape.style.setProperty("transform", "rotate(5deg)", "important");
        tbTape.style.setProperty("transform-origin", "50% 50%", "important");
        tbTape.style.setProperty("clip-path", "inset(0 25% 0 25%)", "important");
        tbTape.style.setProperty("-webkit-clip-path", "inset(0 25% 0 25%)", "important");
      }

      // LIV-018 v6r378: IEM label overlays locked from IEM Label Mover export.
      // Black covers over AL / AR / BL / BR.
      liv018OverlayLabel("", 751, 542, 24, 15);
      liv018OverlayLabel("", 797, 542, 24, 15);
      liv018OverlayLabel("", 890, 542, 24, 15);
      liv018OverlayLabel("", 942, 542, 24, 15);

      // Replace Left/Right labels with 1/2 labels for both IEM packs.
      liv018OverlayLabel("1", 746, 479, 30, 16, { fontSize: 12 });
      liv018OverlayLabel("2", 792, 479, 30, 16, { fontSize: 12 });
      liv018OverlayLabel("1", 890, 479, 30, 16, { fontSize: 12 });
      liv018OverlayLabel("2", 937, 479, 30, 16, { fontSize: 12 });
    }

    liv018ApplyVisualOverlays();


    // Small visible L/R labels for keyboard DI outputs.
    textLabel("L DI", 174, 535, 10, "center");
    textLabel("R DI", 332, 535, 10, "center");


    layer.style.setProperty("width", liv018CanvasWidth + "px", "important");
    layer.style.setProperty("min-width", liv018CanvasWidth + "px", "important");
    layer.style.setProperty("height", liv018CanvasHeight + "px", "important");
    layer.style.setProperty("min-height", liv018CanvasHeight + "px", "important");
    layer.style.setProperty("right", "auto", "important");
    layer.style.setProperty("overflow", "hidden", "important");

    surface.appendChild(layer);
    redrawCables(layer);
    installCableDrag(layer);

    console.log("[Signal Flow] LIV-018 dedicated talkback monitor renderer mounted.", {
      stage,
      foh,
      iem,
      talkbackOutput: tbOut,
    });
  }

  function isLivProcessingFamilyLevel() {
    return LEVEL_ID === "LIV-015" || LEVEL_ID === "LIV-025";
  }

  function buildLivProcessingFamilyGeometry(surface) {
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

    const panels = [];
    if (LEVEL_ID === "LIV-025") {
      panels.push(
        { id: "foh", kind: "foh", x: 92, y: 39, width: 702, zIndex: 11 },
        { id: "front-fill-dsp", kind: "front-fill-dsp", x: 88, y: 194, width: 709, zIndex: 10 },
        { id: "front-fill-amp", kind: "front-fill-amp", x: 142, y: 354, width: 593, zIndex: 10 }
      );
      return { id: LEVEL_ID, rect: layoutRect, panels };
    }
    if (LEVEL_ID === "LIV-020" || LEVEL_ID === "LIV-021") {
      panels.push(
        { id: "foh", kind: "foh", x: rect.width * 0.045, y: layoutHeight * 0.195, width: rect.width * 0.445 },
        { id: "amp", kind: "amp", x: rect.width * 0.505, y: layoutHeight * 0.180, width: rect.width * 0.410 },
        { id: "paamp", kind: "paamp", x: rect.width * 0.575, y: layoutHeight * 0.600, width: rect.width * 0.315 }
      );
    } else if (LEVEL_ID === "LIV-025") {
      // LIV-025 locked gear layout from gear mover export.
      panels.push(
        { id: "foh", kind: "foh", x: 112, y: 39, width: 702, zIndex: 11 },
        { id: "front-fill-dsp", kind: "front-fill-dsp", x: 8, y: 214, width: 349, zIndex: 10 },
        { id: "front-fill-amp", kind: "front-fill-amp", x: 362, y: 334, width: 453, zIndex: 10 },
        { id: "front-fill-speaker", kind: "front-fill-speaker", x: 382, y: 203, width: 432, zIndex: 10 }
      );
    } else if (LEVEL_ID === "LIV-015" || LEVEL_ID === "LIV-026") {
      // Processing-family boards: keep sources, stagebox, FOH, and processor
      // in distinct zones inside the fixed native board height.
      panels.push(
        { id: "stagebox", kind: "stagebox", x: rect.width * 0.045, y: layoutHeight * 0.330, width: rect.width * 0.330 },
        { id: "foh", kind: "foh", x: rect.width * 0.445, y: layoutHeight * 0.075, width: rect.width * 0.500 },
        { id: "amp", kind: "amp", x: rect.width * 0.420, y: layoutHeight * 0.650, width: rect.width * 0.500 }
      );
    } else {
      panels.push(
        { id: "stagebox", kind: "stagebox", x: rect.width * 0.055, y: layoutHeight * 0.400, width: rect.width * 0.330 },
        { id: "foh", kind: "foh", x: rect.width * 0.405, y: layoutHeight * 0.145, width: rect.width * 0.545 },
        { id: "amp", kind: "amp", x: rect.width * 0.455, y: layoutHeight * 0.600, width: rect.width * 0.475 }
      );
    }

    return { id: LEVEL_ID, rect: layoutRect, panels };
  }

  function renderLivProcessingFamily(surface, adapter) {
    const level = buildLivProcessingFamilyGeometry(surface);
    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    const useLockedProcessingSurface = LEVEL_ID === "LIV-025" || LEVEL_ID === "LIV-026";

    const layer = document.createElement("div");
    layer.className = "sf-live-native-layer sf-live-native-processing-family";
    layer.classList.add("sf-live-native-level-" + LEVEL_ID.toLowerCase());
    layer.style.cssText = [
      "position:absolute",
      "inset:0",
      "z-index:9990",
      "isolation:isolate",
      "pointer-events:none",
      "overflow:hidden",
      "border-radius:16px",
      "background:" + (
        useLockedProcessingSurface
          ? "radial-gradient(circle at 52% 22%, rgba(31,72,48,.24), rgba(5,10,7,0) 62%),linear-gradient(180deg,#06100d 0%,#020504 100%)"
          : "radial-gradient(circle at 56% 30%, rgba(18,48,38,.30), rgba(0,0,0,0) 70%)"
      ),
      useLockedProcessingSurface ? "box-shadow:inset 0 0 0 1px rgba(232,196,96,.12),inset 0 -80px 140px rgba(0,0,0,.42)" : ""
    ].join(";");

    const activeEndpointKeys = new Set();
    (LEVEL.validRoutes || []).forEach(route => {
      activeEndpointKeys.add(route.from);
      activeEndpointKeys.add(route.to);
    });

    createLabel(layer, (LEVEL.title || "Live Patch").toUpperCase() + (useLockedProcessingSurface ? "" : " - PROCESSING FAMILY MODE"), level.rect.width * 0.03, level.rect.height * 0.055, 12);

    if (LEVEL_ID === "LIV-020" || LEVEL_ID === "LIV-021") {
      createLabel(layer, "FOH CONSOLE MAIN OUTS", level.rect.width * 0.065, level.rect.height * 0.145, 12);
      if (LEVEL_ID !== "LIV-011") {
        createLabel(layer, "CROSSOVER", level.rect.width * 0.520, level.rect.height * 0.130, 12);
      }
      createLabel(layer, "MAIN PA AMPLIFIER", level.rect.width * 0.600, level.rect.height * 0.550, 12);
    } else if (LEVEL_ID === "LIV-025") {
      // LIV-025 equipment labels are handled by explicit black-background overlays below.
    } else {
      createLabel(layer, "SOURCE", level.rect.width * 0.060, level.rect.height * 0.100, 12);
      createLabel(layer, "STAGE BOX INPUTS", level.rect.width * 0.065, level.rect.height * 0.350, 12);
      createLabel(layer, "FOH CONSOLE MATRIX / MAIN OUTS", level.rect.width * 0.420, level.rect.height * 0.095, 12);
      createLabel(layer, LEVEL_ID === "LIV-026" ? "DELAY TOWER PROCESSING" : "CROSSOVER + SUB PROCESSING", level.rect.width * 0.470, level.rect.height * 0.545, 12);
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
        "filter:drop-shadow(0 12px 24px rgba(0,0,0,.70))",
        "z-index:" + (panel.zIndex || 10)
      ].join(";");
      layer.appendChild(img);
    });



    if (LEVEL_ID === "LIV-025") {
      function liv025Div(left, top, width, height, zIndex) {
        const el = document.createElement("div");
        el.style.cssText = [
          "position:absolute",
          "left:" + left + "px",
          "top:" + top + "px",
          "width:" + width + "px",
          "height:" + height + "px",
          "box-sizing:border-box",
          "pointer-events:none",
          "z-index:" + (zIndex || 80)
        ].join(";");
        layer.appendChild(el);
        return el;
      }

      // Approved LED bus-style screen overlay.
      const led = liv025Div(683.415771484375, 217.66925048828125, 100, 110, 80);
      led.innerHTML = [
        '<div style="width:100%;height:100%;box-sizing:border-box;border-radius:7px;',
        'background:linear-gradient(180deg,#08251f,#020806);',
        'border:1px solid rgba(115,255,210,.55);',
        'box-shadow:0 0 10px rgba(70,255,170,.35),inset 0 0 18px rgba(70,255,170,.16);',
        'display:flex;align-items:center;justify-content:center;color:#9fffd6;',
        'font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;font-weight:900;',
        'font-size:8px;letter-spacing:.06em;line-height:1.05;text-align:center;',
        'position:relative;overflow:hidden;">',
          '<div style="position:absolute;inset:10px;border-radius:4px;border:1px solid rgba(130,255,215,.28);"></div>',
          '<div style="position:absolute;left:16px;top:42px;width:8px;height:8px;background:#60ff8b;box-shadow:18px 0 #60ff8b,36px 0 #60ff8b,54px 0 #60ff8b,0 16px #60ff8b,24px 16px #60ff8b,48px 16px #60ff8b,12px 32px #60ff8b,36px 32px #60ff8b,60px 32px #60ff8b;"></div>',
          '<div style="position:relative;z-index:2;text-shadow:0 0 5px rgba(120,255,210,.9);">MATRIX OUTS →<br>DSP MATRIX IN</div>',
        '</div>'
      ].join("");

      // Approved VU meter-style overlay.
      const meter = liv025Div(366.85760498046875, 395.2344055175781, 150, 82, 80);
      meter.innerHTML = [
        '<div style="width:100%;height:100%;box-sizing:border-box;border-radius:5px;',
        'background:linear-gradient(180deg,#241c0c,#080604);',
        'border:1px solid rgba(255,226,150,.32);',
        'box-shadow:0 2px 8px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.10);',
        'display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;">',
          '<div style="position:absolute;left:18px;right:18px;top:12px;bottom:10px;border-radius:5px;',
          'background:radial-gradient(circle at 50% 90%,#f4d982 0,#e0b95e 44%,#5b3513 78%,#120b04 100%);',
          'box-shadow:inset 0 0 18px rgba(255,237,160,.45);"></div>',
          '<div style="position:absolute;top:19px;left:36px;font:900 9px system-ui;color:#261607;letter-spacing:.03em;">-20&nbsp; -10&nbsp; -3&nbsp; 0&nbsp; +3</div>',
          '<div style="position:absolute;left:74px;top:42px;width:3px;height:35px;background:#2b1203;transform-origin:50% 100%;transform:rotate(24deg);border-radius:2px;"></div>',
          '<div style="position:absolute;bottom:16px;font:900 15px system-ui;color:#4b2a0a;letter-spacing:.04em;">VU</div>',
        '</div>'
      ].join("");

      // Existing black OUTPUTS mask/label.
      const outputs = liv025Div(529.3272705078125, 213.29864501953125, 120, 16, 80);
      outputs.textContent = "OUTPUTS";
      outputs.style.cssText += ";background:#050505;color:#f4f1dc;font:900 9px system-ui;letter-spacing:.12em;text-align:center;line-height:16px;border-radius:3px;";

      // POWER AMP mask over printed LOW AMPLIFIER.
      const amp = (level.panels || []).find(panel => panel.id === "front-fill-amp" || panel.kind === "front-fill-amp");
      if (amp) {
        const ampHeight = amp.width * (240 / 940);
        const power = liv025Div(amp.x + amp.width * 0.50 - 50, amp.y + ampHeight * 0.105 - 9, 100, 18, 85);
        power.textContent = "POWER AMP";
        power.style.cssText += ";background:#0a0a0a;color:#f4f1dc;font:900 9px system-ui;letter-spacing:.08em;text-align:center;line-height:18px;border-radius:3px;";
      }
    }

    const sourceOrder = LEVEL.sourceOrder || [];
    sourceOrder
      .filter(key => activeEndpointKeys.has(key))
      .filter(key => NODE_DEFS[key] && NODE_DEFS[key].kind === "source")
      .forEach((key, index) => {
        const def = NODE_DEFS[key];
        createSourceNode(layer, key, def.label, level.rect.width * 0.060, level.rect.height * (0.135 + index * 0.066));
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
        createJackNode(layer, key, point, def.label, !activeEndpointKeys.has(key));
      });

    surface.appendChild(layer);

    if (LEVEL_ID === "LIV-025") {
      const liv025GoodHitboxes = [
        { key: "bus-1-output", leftPx: 140.06, topPx: 107.16, widthPx: 34, heightPx: 34 },
        { key: "front-fill-processor-input", leftPx: 133.51, topPx: 262.7, widthPx: 34, heightPx: 34 },
        { key: "front-fill-processor-output", leftPx: 522.96, topPx: 263.32, widthPx: 34, heightPx: 34 },
        { key: "front-fill-amp-input", leftPx: 232.44, topPx: 430.56, widthPx: 34, heightPx: 34 }
      ];

      liv025GoodHitboxes.forEach(hb => {
        const node = layer.querySelector('[data-node-key="' + hb.key + '"], [data-sf-native-key="' + hb.key + '"]');
        if (!node) return;
        node.style.left = (hb.leftPx + hb.widthPx / 2) + "px";
        node.style.top = (hb.topPx + hb.heightPx / 2) + "px";
        node.style.width = hb.widthPx + "px";
        node.style.height = hb.heightPx + "px";
        node.dataset.sfNativePointX = String(hb.leftPx + hb.widthPx / 2);
        node.dataset.sfNativePointY = String(hb.topPx + hb.heightPx / 2);
      });
    }

    createNativeBoardTerminologyOverlays(layer, adapter, level);
    redrawCables(layer);
    installCableDrag(layer);
  }

  function renderLiv016FullBandPngBoard(surface, adapter) {
    const rect = surface.getBoundingClientRect();
    const PNG_W = 3024;
    const PNG_H = 1628;

    const scale = Math.min(rect.width * 0.985 / PNG_W, rect.height * 0.955 / PNG_H);
    const bgW = PNG_W * scale;
    const bgH = PNG_H * scale;
    const bgX = (rect.width - bgW) / 2;
    const bgY = 12;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    surface.querySelectorAll(".sfLiveNativeSurfaceScrollSpacer").forEach(el => el.remove());
    surface.classList.remove("sf-live-native-scroll-host");
    surface.style.removeProperty("--sf-live-native-board-height");

    if (!document.getElementById("sf-liv016-neutral-hover-style")) {
      const style = document.createElement("style");
      style.id = "sf-liv016-neutral-hover-style";
      style.textContent = `
        .sf-live-native-level-liv-016 .sf-native-node:not(.sf-native-selected),
        .sf-live-native-level-liv-016 .sf-native-node:not(.sf-native-selected):hover,
        .sf-live-native-level-liv-016 .sf-native-node:not(.sf-native-selected):focus,
        .sf-live-native-level-liv-016 .sf-native-node:not(.sf-native-selected):focus-visible {
          box-shadow: none !important;
          outline: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    const layer = document.createElement("div");
    layer.className = "sf-live-native-layer sf-live-native-level-liv-016 sf-live-native-liv016-png-board";
    layer.style.cssText = [
      "position:absolute",
      "inset:0",
      "z-index:9990",
      "isolation:isolate",
      "pointer-events:none",
      "overflow:hidden",
      "border-radius:16px",
      "background:radial-gradient(circle at 46% 42%, rgba(18,48,38,.24), rgba(0,0,0,0) 70%)"
    ].join(";");

    const bg = document.createElement("img");
    bg.src = sfRepoUrl("/assets/live-sound/png/liv016v20-board-only.png");
    bg.alt = "LIV-016 full-band stagebox layout";
    bg.style.cssText = [
      "position:absolute",
      "left:" + bgX + "px",
      "top:" + bgY + "px",
      "width:" + bgW + "px",
      "height:" + bgH + "px",
      "object-fit:contain",
      "pointer-events:none",
      "user-select:none",
      "z-index:10",
      "filter:drop-shadow(0 16px 28px rgba(0,0,0,.55))"
    ].join(";");
    layer.appendChild(bg);

    function pt(x, y) {
      return {
        x: bgX + bgW * (x / PNG_W),
        y: bgY + bgH * (y / PNG_H)
      };
    }

    function source(key, x, y, radius) {
      const label = nodeLabel(key);
      const point = pt(x, y);
      const r = radius || 30;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sf-native-node sf-native-source sf-native-liv016-source-hotspot";
      setNativeNodeDomKey(btn, key, "source");
      btn.dataset.sfNativeKey = key;
      btn.dataset.sfNativeDefaultShadow = "none";
      btn.dataset.sfNativePointX = String(point.x);
      btn.dataset.sfNativePointY = String(point.y);
      btn.setAttribute("aria-label", label);
      btn.title = label;

      btn.style.cssText = [
        "position:absolute",
        "left:" + point.x + "px",
        "top:" + point.y + "px",
        "width:" + (r * 2) + "px",
        "height:" + (r * 2) + "px",
        "transform:translate(-50%,-50%)",
        "border-radius:50%",
        "border:1px solid rgba(255,210,95,0)",
        "background:rgba(255,210,95,0)",
        "box-shadow:none",
        "cursor:pointer",
        "pointer-events:auto",
        "z-index:150"
      ].join(";");

      btn.addEventListener("mouseenter", () => {
        btn.style.boxShadow = "0 0 0 2px rgba(255,210,95,.24), 0 0 14px rgba(255,210,95,.18)";
      });

      btn.addEventListener("mouseleave", () => {
        if (!selectedNode || selectedNode.el !== btn) btn.style.boxShadow = "none";
      });

      btn.addEventListener("pointerdown", event => {
        const node = { key, el: btn, defaultShadow: "none", point: pointForNativeNode(layer, btn) };
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

        const node = { key, el: btn, defaultShadow: "none", point: pointForNativeNode(layer, btn) };
        console.log("[Signal Flow] Native source clicked:", key);
        handleNodeClick(layer, node);
      });

      layer.appendChild(btn);
    }

    const active = new Set();
    (LEVEL.validRoutes || []).forEach(route => {
      active.add(route.from);
      active.add(route.to);
    });

    function jack(key, x, y, label, radius) {
      createJackNode(layer, key, pt(x, y), label || nodeLabel(key), !active.has(key));

      const btn = layer.querySelector('[data-node-key="' + key + '"]');
      if (btn) {
        const r = radius || 16;
        btn.style.width = (r * 2) + "px";
        btn.style.height = (r * 2) + "px";
        btn.style.minWidth = (r * 2) + "px";
        btn.style.minHeight = (r * 2) + "px";
        btn.style.padding = "0";
      }
    }


    function label(text, x, y, w) {
      const el = document.createElement("div");
      el.textContent = text;
      el.className = "sf-native-liv016-label";
      el.style.cssText = [
        "position:absolute",
        "left:" + (bgX + bgW * (x / PNG_W)) + "px",
        "top:" + (bgY + bgH * (y / PNG_H)) + "px",
        "width:" + ((w || 94) * scale) + "px",
        "transform:translate(-50%,-50%)",
        "padding:" + Math.max(2, 4 * scale) + "px " + Math.max(4, 7 * scale) + "px",
        "border-radius:" + Math.max(6, 9 * scale) + "px",
        "border:1px solid rgba(255,214,102,.55)",
        "background:rgba(6,12,20,.76)",
        "color:#fff4bf",
        "font:900 " + Math.max(7, 12 * scale) + "px system-ui,-apple-system,Segoe UI,sans-serif",
        "letter-spacing:.035em",
        "line-height:1.05",
        "text-align:center",
        "text-transform:uppercase",
        "text-shadow:0 1px 3px rgba(0,0,0,.75)",
        "pointer-events:none",
        "z-index:155",
        "display:none"
      ].join(";");
      layer.appendChild(el);
      return el;
    }

    // Source labels + transparent hitboxes.
    // PNG-space coordinates are mapped from liv016hitboxes0.png reference regions.
    label("Gtr 1 L", 244, 132, 84);
    label("Gtr 1 R", 461, 122, 84);
    source("guitar-1-left", 244, 245, 17);
    source("guitar-1-right", 461, 233, 17);

    label("Vocal", 1034, 54, 78);
    source("lead-vocal-mic", 1034, 137, 76);

    label("Gtr 2 L", 361, 660, 86);
    label("Gtr 2 R", 685, 654, 86);
    source("guitar-2-left", 361, 777, 17);
    source("guitar-2-right", 685, 771, 17);

    label("Bass DI", 1271, 1118, 92);
    source("bass-di", 1271, 1286, 17);

    label("Keys L", 1665, 1044, 82);
    label("Keys R", 1945, 1044, 82);
    source("keys-left-di", 1665, 1184, 17);
    source("keys-right-di", 1945, 1184, 17);

    label("OH L", 326, 1018, 68);
    label("OH R", 897, 1050, 68);
    label("Hi-hat", 226, 1172, 78);
    label("Rack 1", 454, 1114, 78);
    label("Rack 2", 642, 1114, 78);
    label("Snare", 386, 1284, 78);
    label("Kick", 552, 1308, 74);
    label("Floor", 742, 1318, 74);

    source("overhead-left-crash", 326, 1088, 20);
    source("overhead-right-ride", 897, 1120, 20);
    source("hi-hat", 226, 1240, 20);
    source("high-rack-tom", 454, 1182, 20);
    source("low-rack-tom", 642, 1182, 20);
    source("snare", 386, 1350, 20);
    source("kick", 552, 1372, 20);
    source("floor-tom", 742, 1382, 20);

    label("Stage Box Inputs", 2358, 98, 176);
    label("Stage Box 1-8", 2358, 168, 126);
    label("Stage Box 9-16", 2358, 302, 132);
    label("FOH Console", 2208, 474, 150);
    label("FOH Main L/R", 2862, 594, 126);
    label("Crossover", 2388, 872, 118);
    label("Crossover Inputs", 2190, 936, 154);
    label("Crossover Outputs", 2580, 842, 164);

    // 16-channel stagebox input hitboxes.
    const stageXs = [2080, 2160, 2240, 2320, 2400, 2480, 2560, 2640];
    stageXs.forEach((x, idx) => jack("stagebox-input-" + (idx + 1), x, 205, "Stage Box Input " + (idx + 1), 15));
    stageXs.forEach((x, idx) => jack("stagebox-input-" + (idx + 9), x, 340, "Stage Box Input " + (idx + 9), 15));

    // FOH main outputs on the 16ch console.
    jack("foh-liv006-main-left-output", 2814, 638, "Main Left Output", 20);
    jack("foh-liv006-main-right-output", 2928, 638, "Main Right Output", 20);

    // Crossover inputs on the left side of the crossover panel.
    jack("liv242-crossover-l-input", 2140, 990, "Crossover Left In", 18);
    jack("liv242-crossover-r-input", 2240, 990, "Crossover Right In", 18);


    // LIV-016 channel-number and board-label overlay v3
    surface.appendChild(layer);
    redrawCables(layer);
    installCableDrag(layer);
    updateNativeHintHighlights();

    console.log("[Signal Flow] LIV-016 PNG full-band native renderer mounted", {
      bgX,
      bgY,
      bgW,
      bgH
    });
  }


  function renderLiv021VocalInsertDevScaffold(surface, adapter) {
    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    surface.querySelectorAll(".sfLiveNativeSurfaceScrollSpacer").forEach(el => el.remove());

    const rect = surface.getBoundingClientRect();
    const boardWidth = Math.max(1100, Math.ceil(rect.width || 1100));
    const boardHeight = 900;

    const layer = document.createElement("div");
    layer.className = "sf-live-native-layer sf-live-native-processing-family sf-live-native-level-liv-021";
    layer.style.cssText = [
      "position:absolute",
      "inset:0",
      "height:" + boardHeight + "px",
      "min-height:" + boardHeight + "px",
      "z-index:9990",
      "isolation:isolate",
      "pointer-events:none",
      "overflow:visible",
      "border-radius:16px",
      "background:radial-gradient(circle at 54% 24%, rgba(18,48,38,.30), rgba(0,0,0,0) 72%)"
    ].join(";");

    function addGear(id, src, x, y, w, label) {
      const img = document.createElement("img");
      img.dataset.sfGearId = id;
      img.dataset.sfGearLabel = label || id;
      img.src = sfRepoUrl(src);
      img.alt = label || id;
      img.style.cssText = [
        "position:absolute",
        "left:" + x + "px",
        "top:" + y + "px",
        "width:" + w + "px",
        "height:auto",
        "pointer-events:none",
        "user-select:none",
        "filter:drop-shadow(0 12px 24px rgba(0,0,0,.70))",
        "z-index:10"
      ].join(";");
      layer.appendChild(img);
      return img;
    }


    function addLiv021DevNode(key, label, x, y, width, height) {
      const node = document.createElement("button");
      node.type = "button";
      const kind = NODE_DEFS[key] && NODE_DEFS[key].kind === "source" ? "source" : "jack";
      node.className = "sf-native-node sf-native-" + kind + " sf-native-liv021-hitbox";
      setNativeNodeDomKey(node, key, kind);
      node.dataset.sfNativeKey = key;
      node.dataset.sfLiv021DevNode = "1";
      node.dataset.sfNativeGhost = "0";
      node.title = label;
      node.setAttribute("aria-label", label);
      const w = width || 22;
      const h = height || w;
      const defaultShadow = "none";
      const centerX = x + w / 2;
      const centerY = y + h / 2;
      node.dataset.sfNativeDefaultShadow = defaultShadow;
      node.dataset.sfNativePointX = String(centerX);
      node.dataset.sfNativePointY = String(centerY);
      node.dataset.sfCableCenterX = String(centerX);
      node.dataset.sfCableCenterY = String(centerY);
      node.style.cssText = [
        "position:absolute",
        "left:" + x + "px",
        "top:" + y + "px",
        "width:" + w + "px",
        "height:" + h + "px",
        "min-width:0",
        "min-height:0",
        "max-width:none",
        "max-height:none",
        "box-sizing:border-box",
        "padding:0",
        "margin:0",
        "line-height:0",
        "appearance:none",
        "-webkit-appearance:none",
        "border-radius:8px",
        "border:0",
        "background:transparent",
        "box-shadow:" + defaultShadow,
        "z-index:2600",
        "pointer-events:auto",
        "cursor:pointer",
        "opacity:0"
      ].join(";");

      if (LEVEL_ID === "LIV-021" && !String(key).startsWith("liv021-false-")) {
        node.dataset.sfNativeHintable = "1";
        node.dataset.sfNativeGoodHint = "1";
        node.dataset.sfNativeDefaultShadow = "none";
        node.dataset.sfNativeHintShadow = "0 0 0 2px rgba(70, 210, 255, .95), 0 0 14px rgba(70, 210, 255, .8)";
      }

      node.addEventListener("pointerdown", event => {
        const nativeNode = {
          key,
          label,
          el: node,
          defaultShadow,
          point: pointForNativeNode(layer, node)
        };

        console.log("[Signal Flow] LIV-021 native hitbox drag start:", key);
        startNativePatchDrag(layer, nativeNode, event);
      }, true);

      node.addEventListener("click", event => {
        if (Date.now() < suppressNativeClickUntil) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const nativeNode = {
          key,
          label,
          el: node,
          defaultShadow,
          point: pointForNativeNode(layer, node)
        };

        console.log("[Signal Flow] LIV-021 native hitbox clicked:", key);
        handleNodeClick(layer, nativeNode);
      });

      layer.appendChild(node);
      return node;
    }

    function addLabel(text, x, y, size, align) {
      const el = document.createElement("div");
      el.textContent = text;
      el.dataset.sfLabel = text;
      el.style.cssText = [
        "position:absolute",
        "left:" + x + "px",
        "top:" + y + "px",
        "z-index:40",
        "pointer-events:none",
        "font-family:Inter,system-ui,sans-serif",
        "font-size:" + (size || 12) + "px",
        "font-weight:900",
        "letter-spacing:.08em",
        "text-transform:uppercase",
        "text-align:" + (align || "left"),
        "color:rgba(235,248,255,.94)",
        "text-shadow:0 2px 8px rgba(0,0,0,.95)"
      ].join(";");
      layer.appendChild(el);
      return el;
    }


    addGear("liv021-monitor-console", "/assets/live-sound/svg/hardware/monitor-console-aux-panel.svg", 16, -172, 850, "Monitor Console").style.zIndex = "2";
    addGear("liv021-stagebox", "/assets/live-sound/svg/hardware/stagebox-snake-head.svg", 4, 200, 310, "Stage Box").style.zIndex = "10";
    addGear("liv021-compressor", "/assets/live-sound/svg/hardware/power-amp-liv007-main-system.svg", 250, 200, 275, "Vocal Compressor").style.zIndex = "10";
    addGear("liv021-system-processor", "/assets/live-sound/svg/hardware/crossover-liv010-3way.svg", 530, 200, 310, "System Processor").style.zIndex = "10";
    addGear("liv021-main-amp", "/assets/live-sound/svg/hardware/power-amp-liv010-high.svg", 520, 295, 340, "Power Amp").style.zIndex = "10";
    addGear("liv021-vocal-wedge-amp", "/assets/live-sound/svg/hardware/power-amp-liv010-high.svg", 528, 390, 335, "Vocal Wedge Amp").style.zIndex = "10";
    addGear("liv021-vocal-wedge", "/assets/build-room/svg/gear/stage monitor.svg", 275, 307, 222, "Vocal Wedge").style.zIndex = "10";
    addGear("liv021-main-speakers", "/assets/live-sound/svg/hardware/full-pa-system-line-array-over-subs-renderstyle-standalone.svg", 590, 130, 245, "Main Speakers").style.zIndex = "1";
    addGear("lead-vocal-mic", "/assets/live-sound/svg/hardware/mic nbg.svg", 13, 300, 230, "Lead Vocal Mic").style.zIndex = "10";

    const liv021CableAsset = "/assets/live-sound/svg/cables/single-one-end-raised.svg";
    const liv021CableLayout = [
      { key: "liv021-cable-01", leftPx: -56, topPx: 74, widthPx: 145, heightPx: 54, rotationDeg: 0 },
      { key: "liv021-cable-02", leftPx: -8, topPx: 62, widthPx: 120, heightPx: 39, rotationDeg: 0 },
      { key: "liv021-cable-03", leftPx: 12, topPx: 72, widthPx: 120, heightPx: 37, rotationDeg: 0 },
      { key: "liv021-cable-04", leftPx: 20, topPx: 55, widthPx: 135, heightPx: 55, rotationDeg: 0 },
      { key: "liv021-cable-05", leftPx: 55, topPx: 70, widthPx: 120, heightPx: 33, rotationDeg: 0 },
      { key: "liv021-cable-06", leftPx: 79, topPx: 63, widthPx: 120, heightPx: 37, rotationDeg: 0 },
      { key: "liv021-cable-07", leftPx: 92, topPx: 63, widthPx: 130, heightPx: 44, rotationDeg: 0 },
      { key: "liv021-cable-08", leftPx: 116, topPx: 59, widthPx: 130, heightPx: 49, rotationDeg: 0 },
      { key: "liv021-cable-09", leftPx: 653, topPx: 320, widthPx: 155, heightPx: 68, rotationDeg: 0 },
      { key: "liv021-cable-10", leftPx: 635, topPx: 320, widthPx: 135, heightPx: 64, rotationDeg: 0 }
    ];

    function liv021CableRuntimeRecord(img, index) {
      function cssPx(prop, fallback) {
        const value = parseFloat(img.style[prop]);
        if (Number.isFinite(value)) return Math.round(value);
        return Math.round(fallback || 0);
      }

      const rect = img.getBoundingClientRect();
      return {
        index,
        key: img.dataset.sfGearKey || img.alt || "liv021-cable-" + String(index + 1).padStart(2, "0"),
        leftPx: cssPx("left", img.offsetLeft),
        topPx: cssPx("top", img.offsetTop),
        widthPx: cssPx("width", rect.width),
        heightPx: cssPx("height", rect.height)
      };
    }

    function installLiv021CableDevApi() {
      window.sfLiv021CableDev = {
        parentSelector: ".sf-live-native-layer.sf-live-native-level-liv-021",
        export() {
          const cables = Array.from(layer.querySelectorAll('img[data-sf-liv021-cable="1"]'));
          const data = cables.map((img, index) => liv021CableRuntimeRecord(img, index));
          console.log("[Signal Flow] LIV-021 cable dev export layer-space", data);
          try { navigator.clipboard.writeText(JSON.stringify(data, null, 2)); } catch (err) {}
          return data;
        },
        apply(records) {
          if (!Array.isArray(records)) return [];
          const byKey = new Map(records.map((item, index) => [item.key || "liv021-cable-" + String(index + 1).padStart(2, "0"), item]));
          const cables = Array.from(layer.querySelectorAll('img[data-sf-liv021-cable="1"]'));
          cables.forEach((img, index) => {
            const key = img.dataset.sfGearKey || "liv021-cable-" + String(index + 1).padStart(2, "0");
            const item = byKey.get(key) || records[index];
            if (!item) return;
            ["leftPx", "topPx", "widthPx", "heightPx"].forEach(prop => {
              const value = Number(item[prop]);
              if (!Number.isFinite(value)) return;
              const cssProp = prop === "leftPx" ? "left" : prop === "topPx" ? "top" : prop === "widthPx" ? "width" : "height";
              img.style[cssProp] = value + "px";
            });
          });
          const data = this.export();
          console.log("[Signal Flow] LIV-021 cable dev applied layer-space records", data);
          return data;
        }
      };
    }

    function logLiv021CableRuntimeLayout() {
      const cables = Array.from(layer.querySelectorAll('img[data-sf-liv021-cable="1"]'));
      const parent = cables[0] && cables[0].parentElement ? cables[0].parentElement : layer;
      const records = cables.map((img, index) => liv021CableRuntimeRecord(img, index));
      console.log("[Signal Flow] LIV-021 static cable runtime layout", {
        cableCount: cables.length,
        parentClass: parent.className || "",
        parentTag: parent.tagName || "",
        records
      });
    }

    liv021CableLayout.forEach(function(c, index) {
      const img = document.createElement("img");
      img.dataset.sfGearKey = c.key;
      img.dataset.sfLiv021Cable = "1";
      img.dataset.sfLiv021CableIndex = String(index);
      img.src = sfRepoUrl(liv021CableAsset);
      img.alt = c.key;
      img.style.cssText = [
        "position:absolute",
        "left:" + c.leftPx + "px",
        "top:" + c.topPx + "px",
        "width:" + c.widthPx + "px",
        "height:" + c.heightPx + "px",
        "z-index:24",
        "pointer-events:none",
        "user-select:none",
        "opacity:.92",
        "transform:rotate(0deg)",
        "transform-origin:50% 50%",
        "filter:drop-shadow(0 4px 8px rgba(0,0,0,.75))"
      ].join(";");
      layer.appendChild(img);
    });

    installLiv021CableDevApi();


    addLabel("LIV-021 - LEAD VOCAL INPUT + CHANNEL INSERT COMPRESSOR", -6, 1, 13).style.zIndex = "40";
    addLabel("STAGE BOX - LEAD VOCAL TO INPUT 1", 21, 268, 10).style.zIndex = "40";
    addLabel("VOCAL COMPRESSOR", 322, 212, 11).style.zIndex = "40";
    addLabel("INPUT", 340, 244, 8).style.zIndex = "40";
    addLabel("OUTPUT", 404, 246, 8).style.zIndex = "40";
    addLabel("SYSTEM PROCESSOR", 624, 203, 11).style.zIndex = "40";
    addLabel("MAIN POWER AMP", 635, 303, 11).style.zIndex = "40";
    addLabel("VOCAL WEDGE AMP", 628, 402, 11).style.zIndex = "40";
    addLabel("VOCAL WEDGE", 330, 338, 10).style.zIndex = "40";
    addLabel("MAIN SPEAKERS", 645, 348, 11).style.zIndex = "9";
    addLabel("LEAD VOCAL MIC", 87, 375, 10).style.zIndex = "40";

    const liv021GoodHitboxes = [
      [
            "lead-vocal-mic",
            "Lead Vocal Mic",
            82,
            304,
            111,
            149
      ],
      [
            "liv021-stagebox-input-1",
            "Stage Box Input 1",
            39,
            237,
            23,
            23
      ],
      [
            "liv021-ch1-insert-send",
            "Channel 1 Insert Send",
            259,
            66,
            20,
            19
      ],
      [
            "liv021-compressor-input",
            "Vocal Compressor Input",
            344,
            257,
            18,
            19
      ],
      [
            "liv021-compressor-output",
            "Vocal Compressor Output",
            414,
            258,
            18,
            17
      ],
      [
            "liv021-ch1-insert-return",
            "Channel 1 Insert Return",
            261,
            90,
            18,
            15
      ],
      [
            "liv021-aux-1-output",
            "Auxiliary 1 Output",
            432,
            67,
            18,
            16
      ],
      [
            "liv021-vocal-wedge-amp-input",
            "Vocal Wedge Amp Input",
            582,
            435,
            16,
            15
      ],
      [
            "liv021-vocal-wedge-amp-output",
            "Vocal Wedge Amp Output",
            759,
            434,
            16,
            15
      ],
      [
            "liv021-vocal-wedge-input",
            "Vocal Wedge Input",
            275,
            307,
            222,
            117
      ],
      [
            "liv021-main-left-output",
            "Main Left Output",
            735,
            64,
            26,
            28
      ],
      [
            "liv021-main-right-output",
            "Main Right Output",
            768,
            63,
            29,
            28
      ],
      [
            "liv021-system-processor-left-input",
            "System Processor Left Input",
            576,
            243,
            16,
            16
      ],
      [
            "liv021-system-processor-right-input",
            "System Processor Right Input",
            605,
            243,
            16,
            15
      ],
      [
            "liv021-system-processor-left-output",
            "System Processor Left Output",
            690,
            247,
            16,
            16
      ],
      [
            "liv021-system-processor-right-output",
            "System Processor Right Output",
            721,
            246,
            15,
            15
      ],
      [
            "liv021-main-amp-left-input",
            "Main Amp Left Input",
            574,
            341,
            16,
            14
      ],
      [
            "liv021-main-amp-right-input",
            "Main Amp Right Input",
            613,
            341,
            15,
            14
      ]
];

    const liv021FalseHitboxes = [
      [
            "liv021-false-console-input-9",
            "Console Input 9",
            72,
            111,
            16,
            22
      ],
      [
            "liv021-false-console-input-10",
            "Console Input 10",
            94,
            111,
            19,
            21
      ],
      [
            "liv021-false-console-input-11",
            "Console Input 11",
            117,
            112,
            20,
            19
      ],
      [
            "liv021-false-console-input-12",
            "Console Input 12",
            140,
            111,
            18,
            20
      ],
      [
            "liv021-false-console-input-13",
            "Console Input 13",
            163,
            113,
            19,
            18
      ],
      [
            "liv021-false-console-input-14",
            "Console Input 14",
            187,
            113,
            16,
            17
      ],
      [
            "liv021-false-console-input-15",
            "Console Input 15",
            208,
            112,
            20,
            16
      ],
      [
            "liv021-false-console-input-16",
            "Console Input 16",
            231,
            113,
            17,
            17
      ],
      [
            "liv021-false-console-input-17",
            "Console Input 17",
            71,
            160,
            19,
            18
      ],
      [
            "liv021-false-console-input-18",
            "Console Input 18",
            97,
            160,
            18,
            17
      ],
      [
            "liv021-false-console-input-19",
            "Console Input 19",
            118,
            160,
            17,
            18
      ],
      [
            "liv021-false-console-input-20",
            "Console Input 20",
            145,
            159,
            17,
            20
      ],
      [
            "liv021-false-console-input-21",
            "Console Input 21",
            168,
            160,
            19,
            20
      ],
      [
            "liv021-false-console-input-22",
            "Console Input 22",
            183,
            159,
            17,
            20
      ],
      [
            "liv021-false-console-input-23",
            "Console Input 23",
            207,
            160,
            17,
            19
      ],
      [
            "liv021-false-console-input-24",
            "Console Input 24",
            228,
            160,
            19,
            19
      ],
      [
            "liv021-false-insert-2-send",
            "Channel 2 Insert Send",
            281,
            69,
            14,
            12
      ],
      [
            "liv021-false-insert-2-return",
            "Channel 2 Insert Return",
            281,
            91,
            13,
            13
      ],
      [
            "liv021-false-insert-3-send",
            "Channel 3 Insert Send",
            298,
            69,
            12,
            13
      ],
      [
            "liv021-false-insert-3-return",
            "Channel 3 Insert Return",
            298,
            90,
            12,
            14
      ],
      [
            "liv021-false-insert-4-send",
            "Channel 4 Insert Send",
            315,
            69,
            12,
            12
      ],
      [
            "liv021-false-insert-4-return",
            "Channel 4 Insert Return",
            316,
            90,
            15,
            12
      ],
      [
            "liv021-false-insert-5-send",
            "Channel 5 Insert Send",
            341,
            67,
            15,
            15
      ],
      [
            "liv021-false-insert-5-return",
            "Channel 5 Insert Return",
            342,
            89,
            12,
            15
      ],
      [
            "liv021-false-insert-6-send",
            "Channel 6 Insert Send",
            354,
            67,
            13,
            14
      ],
      [
            "liv021-false-insert-6-return",
            "Channel 6 Insert Return",
            354,
            89,
            15,
            15
      ],
      [
            "liv021-false-insert-7-send",
            "Channel 7 Insert Send",
            370,
            66,
            16,
            15
      ],
      [
            "liv021-false-insert-7-return",
            "Channel 7 Insert Return",
            370,
            91,
            13,
            13
      ],
      [
            "liv021-false-insert-8-send",
            "Channel 8 Insert Send",
            388,
            67,
            14,
            14
      ],
      [
            "liv021-false-insert-8-return",
            "Channel 8 Insert Return",
            388,
            90,
            15,
            15
      ],
      [
            "liv021-false-insert-9-send",
            "Channel 9 Insert Send",
            263,
            113,
            14,
            14
      ],
      [
            "liv021-false-insert-9-return",
            "Channel 9 Insert Return",
            263,
            136,
            15,
            18
      ],
      [
            "liv021-false-insert-10-send",
            "Channel 10 Insert Send",
            281,
            113,
            14,
            14
      ],
      [
            "liv021-false-insert-10-return",
            "Channel 10 Insert Return",
            280,
            137,
            15,
            16
      ],
      [
            "liv021-false-insert-11-send",
            "Channel 11 Insert Send",
            298,
            114,
            13,
            14
      ],
      [
            "liv021-false-insert-11-return",
            "Channel 11 Insert Return",
            298,
            137,
            13,
            16
      ],
      [
            "liv021-false-insert-12-send",
            "Channel 12 Insert Send",
            316,
            112,
            15,
            16
      ],
      [
            "liv021-false-insert-12-return",
            "Channel 12 Insert Return",
            316,
            135,
            15,
            18
      ],
      [
            "liv021-false-insert-13-send",
            "Channel 13 Insert Send",
            336,
            112,
            17,
            17
      ],
      [
            "liv021-false-insert-13-return",
            "Channel 13 Insert Return",
            336,
            136,
            15,
            16
      ],
      [
            "liv021-false-insert-14-send",
            "Channel 14 Insert Send",
            354,
            111,
            15,
            18
      ],
      [
            "liv021-false-insert-14-return",
            "Channel 14 Insert Return",
            354,
            137,
            14,
            16
      ],
      [
            "liv021-false-insert-15-send",
            "Channel 15 Insert Send",
            370,
            113,
            15,
            16
      ],
      [
            "liv021-false-insert-15-return",
            "Channel 15 Insert Return",
            370,
            136,
            16,
            16
      ],
      [
            "liv021-false-insert-16-send",
            "Channel 16 Insert Send",
            387,
            114,
            15,
            17
      ],
      [
            "liv021-false-insert-16-return",
            "Channel 16 Insert Return",
            387,
            136,
            16,
            15
      ],
      [
            "liv021-false-aux-2-output",
            "Auxiliary 2 Output",
            451,
            66,
            13,
            15
      ],
      [
            "liv021-false-aux-3-output",
            "Auxiliary 3 Output",
            467,
            67,
            14,
            14
      ],
      [
            "liv021-false-aux-4-output",
            "Auxiliary 4 Output",
            485,
            67,
            15,
            14
      ],
      [
            "liv021-false-aux-5-output",
            "Auxiliary 5 Output",
            506,
            67,
            15,
            14
      ],
      [
            "liv021-false-aux-6-output",
            "Auxiliary 6 Output",
            523,
            67,
            15,
            15
      ],
      [
            "liv021-false-aux-7-output",
            "Auxiliary 7 Output",
            539,
            67,
            16,
            15
      ],
      [
            "liv021-false-aux-8-output",
            "Auxiliary 8 Output",
            559,
            66,
            15,
            16
      ],
      [
            "liv021-false-aux-9-output",
            "Auxiliary 9 Output",
            433,
            103,
            15,
            16
      ],
      [
            "liv021-false-aux-10-output",
            "Auxiliary 10 Output",
            450,
            102,
            16,
            16
      ],
      [
            "liv021-false-aux-11-output",
            "Auxiliary 11 Output",
            467,
            103,
            14,
            14
      ],
      [
            "liv021-false-aux-12-output",
            "Auxiliary 12 Output",
            486,
            103,
            14,
            14
      ],
      [
            "liv021-false-aux-13-output",
            "Auxiliary 13 Output",
            506,
            103,
            15,
            15
      ],
      [
            "liv021-false-aux-14-output",
            "Auxiliary 14 Output",
            524,
            103,
            14,
            14
      ],
      [
            "liv021-false-aux-15-output",
            "Auxiliary 15 Output",
            540,
            104,
            14,
            13
      ],
      [
            "liv021-false-aux-16-output",
            "Auxiliary 16 Output",
            559,
            103,
            15,
            15
      ],
      [
            "liv021-false-aux-17-output",
            "Auxiliary 17 Output",
            434,
            147,
            13,
            15
      ],
      [
            "liv021-false-aux-18-output",
            "Auxiliary 18 Output",
            451,
            148,
            13,
            14
      ],
      [
            "liv021-false-aux-19-output",
            "Auxiliary 19 Output",
            468,
            149,
            14,
            14
      ],
      [
            "liv021-false-aux-20-output",
            "Auxiliary 20 Output",
            485,
            148,
            15,
            13
      ],
      [
            "liv021-false-aux-21-output",
            "Auxiliary 21 Output",
            506,
            149,
            15,
            14
      ],
      [
            "liv021-false-aux-22-output",
            "Auxiliary 22 Output",
            523,
            147,
            16,
            16
      ],
      [
            "liv021-false-aux-23-output",
            "Auxiliary 23 Output",
            539,
            149,
            16,
            14
      ],
      [
            "liv021-false-aux-24-output",
            "Auxiliary 24 Output",
            558,
            147,
            16,
            16
      ],
      [
            "liv021-false-aux-25-output",
            "Auxiliary 25 Output",
            559,
            148,
            14,
            13
      ],
      [
            "liv021-false-bus-1-output",
            "Bus 1 Output",
            610,
            69,
            18,
            17
      ],
      [
            "liv021-false-bus-2-output",
            "Bus 2 Output",
            631,
            69,
            17,
            17
      ],
      [
            "liv021-false-bus-3-output",
            "Bus 3 Output",
            654,
            69,
            20,
            18
      ],
      [
            "liv021-false-bus-4-output",
            "Bus 4 Output",
            675,
            68,
            19,
            20
      ],
      [
            "liv021-false-bus-5-output",
            "Bus 5 Output",
            611,
            99,
            19,
            20
      ],
      [
            "liv021-false-bus-6-output",
            "Bus 6 Output",
            632,
            99,
            21,
            20
      ],
      [
            "liv021-false-bus-7-output",
            "Bus 7 Output",
            655,
            100,
            19,
            19
      ],
      [
            "liv021-false-bus-8-output",
            "Bus 8 Output",
            675,
            100,
            19,
            19
      ],
      [
            "liv021-false-bus-9-output",
            "Bus 9 Output",
            610,
            131,
            18,
            19
      ],
      [
            "liv021-false-bus-10-output",
            "Bus 10 Output",
            631,
            131,
            20,
            19
      ],
      [
            "liv021-false-bus-11-output",
            "Bus 11 Output",
            655,
            131,
            20,
            20
      ],
      [
            "liv021-false-bus-12-output",
            "Bus 12 Output",
            679,
            131,
            18,
            20
      ],
      [
            "liv021-false-bus-13-output",
            "Bus 13 Output",
            610,
            161,
            19,
            19
      ],
      [
            "liv021-false-bus-14-output",
            "Bus 14 Output",
            632,
            160,
            20,
            20
      ],
      [
            "liv021-false-bus-15-output",
            "Bus 15 Output",
            654,
            161,
            19,
            19
      ],
      [
            "liv021-false-bus-16-output",
            "Bus 16 Output",
            677,
            159,
            21,
            21
      ],
      [
            "liv021-false-bus-1",
            "M1 Output",
            731,
            123,
            13,
            13
      ],
      [
            "liv021-false-bus-2",
            "M2 Output",
            748,
            124,
            13,
            13
      ],
      [
            "liv021-false-bus-3",
            "M3 Output",
            764,
            123,
            14,
            15
      ],
      [
            "liv021-false-bus-4",
            "M4 Output",
            783,
            122,
            15,
            16
      ],
      [
            "liv021-false-main-xlr-1",
            "Misc Main Section XLR 1",
            722,
            150,
            19,
            21
      ],
      [
            "liv021-false-main-xlr-2",
            "Misc Main Section XLR 2",
            744,
            151,
            20,
            21
      ],
      [
            "liv021-false-main-xlr-3",
            "Misc Main Section XLR 3",
            767,
            151,
            21,
            22
      ],
      [
            "liv021-false-main-xlr-4",
            "Misc Main Section XLR 4",
            790,
            151,
            18,
            20
      ],
      [
            "liv021-false-stagebox-input-2",
            "Stage Box Input 2",
            65,
            237,
            22,
            24
      ],
      [
            "liv021-false-stagebox-input-3",
            "Stage Box Input 3",
            93,
            237,
            19,
            23
      ],
      [
            "liv021-false-stagebox-input-4",
            "Stage Box Input 4",
            117,
            237,
            22,
            22
      ],
      [
            "liv021-false-stagebox-input-5",
            "Stage Box Input 5",
            144,
            237,
            21,
            23
      ],
      [
            "liv021-false-stagebox-input-6",
            "Stage Box Input 6",
            169,
            237,
            24,
            22
      ],
      [
            "liv021-false-stagebox-input-7",
            "Stage Box Input 7",
            195,
            238,
            21,
            22
      ],
      [
            "liv021-false-stagebox-input-8",
            "Stage Box Input 8",
            221,
            237,
            23,
            24
      ]
];

    liv021GoodHitboxes.concat(liv021FalseHitboxes).forEach(function(hitbox) {
      addLiv021DevNode(hitbox[0], hitbox[1], hitbox[2], hitbox[3], hitbox[4], hitbox[5]);
    });

    console.log("[Signal Flow] LIV-021 false jack hitboxes installed", {
      good: liv021GoodHitboxes.length,
      falseJacks: liv021FalseHitboxes.length
    });

    surface.appendChild(layer);
    requestAnimationFrame(logLiv021CableRuntimeLayout);
    redrawCables(layer);
    installCableDrag(layer);

    console.log("[Signal Flow] LIV-021 vocal insert dev scaffold mounted v6r451 normalized mono wedge", {
      boardWidth,
      boardHeight,
      gearCount: layer.querySelectorAll("img[data-sf-gear-id]").length
    });
  }


	
  function renderLiv026ComplexZones(surface, adapter) {
    const boardWidth = 1400;
    const boardHeight = 1260;
    const scrollHeight = boardHeight + 140;

    surface.innerHTML = "";
    surface.style.setProperty("position", "relative", "important");
    surface.style.setProperty("height", "min(72vh, 760px)", "important");
    surface.style.setProperty("min-height", "520px", "important");
    surface.style.setProperty("max-height", "min(72vh, 760px)", "important");
    surface.style.setProperty("display", "block", "important");
    surface.style.setProperty("overflow-y", "auto", "important");
    surface.style.setProperty("overflow-x", "auto", "important");
    surface.style.setProperty("overscroll-behavior", "contain", "important");
    surface.style.setProperty("-webkit-overflow-scrolling", "touch", "important");
    surface.style.setProperty("--sf-live-native-board-height", scrollHeight + "px");
    surface.classList.add("sf-live-native-scroll-host", "sf-live-native-liv026-scroll-host");

    const layer = document.createElement("div");
    layer.className = "sf-live-native-layer sf-live-native-level-liv-026";
    layer.style.cssText = "position:absolute;left:0;top:0;width:"+boardWidth+"px;min-width:"+boardWidth+"px;height:"+boardHeight+"px;min-height:"+boardHeight+"px;z-index:9990;pointer-events:none;overflow:visible;background:linear-gradient(180deg,#071016,#0b171b);border:1px solid rgba(245,197,66,.34);border-radius:16px;box-sizing:border-box;";

    function img(id, src, x, y, w) {
      const el = document.createElement("img");
      el.dataset.sfGearId = id;
      el.src = sfRepoUrl(src);
      el.alt = id;
      el.style.cssText = "position:absolute;left:"+x+"px;top:"+y+"px;width:"+w+"px;height:auto;pointer-events:none;filter:drop-shadow(0 12px 24px rgba(0,0,0,.70));z-index:"+(id === "liv026-system-delay-processor-asset" ? 14 : 10)+";";
      layer.appendChild(el);
    }

    function label(t, x, y) {
      const el = document.createElement("div");
      el.textContent = t;
      el.style.cssText = "position:absolute;left:"+x+"px;top:"+y+"px;color:#ffd76a;font:900 12px system-ui;letter-spacing:.08em;z-index:20;pointer-events:none;";
      layer.appendChild(el);
    }

    function rack(x, y, w, h) {
      const el = document.createElement("div");
      el.className = "sf-liv026-rack-zone sf-liv023-rack-zone";
      el.style.cssText = "position:absolute;left:"+x+"px;top:"+y+"px;width:"+w+"px;height:"+h+"px;border:1px solid rgba(245,197,66,.40);border-radius:8px;background:linear-gradient(90deg,rgba(226,180,72,.22) 0 5px,rgba(0,0,0,.28) 5px 34px,transparent 34px calc(100% - 34px),rgba(0,0,0,.28) calc(100% - 34px) calc(100% - 5px),rgba(226,180,72,.22) calc(100% - 5px) 100%),repeating-linear-gradient(180deg,rgba(255,236,172,.06) 0 1px,transparent 1px 92px),linear-gradient(180deg,rgba(13,12,10,.95),rgba(20,15,9,.88));z-index:3;pointer-events:none;";
      layer.appendChild(el);
    }

    function proc(id, text, x, y, stereo) {
      const el = document.createElement("div");
      el.textContent = text;
      el.style.cssText = "position:absolute;left:"+x+"px;top:"+y+"px;width:350px;height:88px;border:1px solid rgba(210,188,120,.42);border-radius:8px;background:linear-gradient(180deg,#252521,#111312);color:#f4f1dc;font:900 10px system-ui;letter-spacing:.08em;text-align:center;padding-top:8px;box-sizing:border-box;z-index:12;pointer-events:none;";
      layer.appendChild(el);
      if (stereo) {
        jack(id+"-l-input", x+72, y+55, text+" L Input");
        jack(id+"-r-input", x+122, y+55, text+" R Input");
        jack(id+"-l-output", x+220, y+55, text+" L Output");
        jack(id+"-r-output", x+270, y+55, text+" R Output");
      } else {
        jack(id+"-input", x+90, y+55, text+" Input");
        jack(id+"-output", x+235, y+55, text+" Output");
      }
    }

    function jack(key, x, y, labelText) {
      createJackNode(layer, key, { x, y }, labelText, false);
      const el = layer.querySelector('[data-node-key="'+key+'"]');
      if (el) {
        el.style.width = "34px";
        el.style.height = "34px";
        el.style.zIndex = "2600";
      }
    }

    label("LIV-026 MULTI-ZONE PROCESSING", 34, 24);

    function addLiv026RackOutline() {
      const rack = document.createElement("div");
      rack.className = "sf-liv026-rack-outline";
      rack.style.cssText = [
        "position:absolute",
        "left:30px",
        "top:242px",
        "width:1135px",
        "height:510px",
        "box-sizing:border-box",
        "border:2px solid rgba(245,197,66,.55)",
        "border-radius:10px",
        "background:linear-gradient(180deg,rgba(10,14,16,.28),rgba(0,0,0,.12))",
        "box-shadow:inset 0 0 34px rgba(0,0,0,.45),0 10px 28px rgba(0,0,0,.28)",
        "z-index:2",
        "pointer-events:none"
      ].join(";");
      layer.appendChild(rack);
    }

    function addLiv026TapeLabel(text, x, y, w, h, kind) {
      const wrap = document.createElement("div");
      wrap.className = "sf-liv026-tape-label";
      wrap.dataset.sfGearId = "liv026-label-" + text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      wrap.dataset.sfGearLabel = text;
      wrap.style.cssText = [
        "position:absolute",
        "left:" + x + "px",
        "top:" + y + "px",
        "width:" + w + "px",
        "height:" + h + "px",
        "z-index:3200",
        "opacity:1",
        "pointer-events:auto",
        "cursor:move"
      ].join(";");
      const src = kind === "delay"
        ? "/assets/live-sound/svg/handwritten/delay-label-tape-straight.svg"
        : "/assets/live-sound/svg/blank/tape-blank-medium.svg";
      wrap.innerHTML =
        '<img src="' + sfRepoUrl(src) + '" alt="" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;">' +
        '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;color:#1b1305;font:900 10px system-ui,-apple-system,Segoe UI,sans-serif;letter-spacing:.04em;text-shadow:0 1px 0 rgba(255,255,255,.35);padding:2px 8px;box-sizing:border-box;">' + text + '</div>';
      layer.appendChild(wrap);
    }

    addLiv026RackOutline();


    function visibleXlrM(id, labelText, x, y, w, h, z) {
      const wrap = document.createElement("div");
      wrap.dataset.sfGearId = id;
      wrap.dataset.sfGearLabel = labelText;
      wrap.className = "sf-liv026-movable-xlrm";
      wrap.style.cssText = "position:absolute;left:"+x+"px;top:"+y+"px;width:"+w+"px;height:"+h+"px;z-index:"+(z||2700)+";pointer-events:auto;text-align:center;cursor:move;";
      wrap.innerHTML =
        '<div style="width:30px;height:30px;margin:0 auto;border-radius:50%;background:#151515;border:2px solid #c9c1a8;box-shadow:0 2px 8px rgba(0,0,0,.65),inset 0 0 0 5px #050505;position:relative;">' +
        '<span style="position:absolute;left:8px;top:8px;width:4px;height:4px;border-radius:50%;background:#d7d0bb;"></span>' +
        '<span style="position:absolute;left:18px;top:8px;width:4px;height:4px;border-radius:50%;background:#d7d0bb;"></span>' +
        '<span style="position:absolute;left:13px;top:18px;width:4px;height:4px;border-radius:50%;background:#d7d0bb;"></span>' +
        '</div><div style="margin-top:4px;color:#f4f1dc;font:900 8px system-ui;letter-spacing:.06em;text-shadow:0 1px 4px #000;">'+labelText+'</div>';
      layer.appendChild(wrap);
    }

    function addLiv026Vu(x, y, w, h, z) {
      const wrap = document.createElement("div");
      wrap.dataset.sfGearId = "liv026-vu-meter-" + (layer.querySelectorAll('[data-sf-gear-id^="liv026-vu-meter-"]').length + 1);
      wrap.dataset.sfGearLabel = "VU Meter";
      wrap.style.cssText = "position:absolute;left:"+x+"px;top:"+y+"px;width:"+w+"px;height:"+h+"px;box-sizing:border-box;pointer-events:auto;cursor:move;z-index:"+(z||120)+";";
      wrap.innerHTML = '<svg viewBox="0 0 180 92" width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="176" height="88" rx="10" fill="#120b04" stroke="rgba(255,226,150,.45)" stroke-width="3"/><rect x="18" y="12" width="144" height="66" rx="8" fill="#e0b95e"/><path d="M18 78 Q90 6 162 78 Z" fill="#f4d982"/><path d="M18 78 Q90 30 162 78 Z" fill="#5b3513" opacity=".72"/><text x="38" y="34" font-size="13" font-weight="900" fill="#2b1706">-20</text><text x="72" y="29" font-size="13" font-weight="900" fill="#2b1706">-10</text><text x="103" y="29" font-size="13" font-weight="900" fill="#2b1706">0</text><text x="128" y="35" font-size="13" font-weight="900" fill="#2b1706">+3</text><line x1="90" y1="75" x2="116" y2="28" stroke="#2b1203" stroke-width="4" stroke-linecap="round"/><text x="90" y="66" text-anchor="middle" font-size="21" font-weight="900" fill="#4b2a0a">VU</text></svg>';
      layer.appendChild(wrap);
    }

    img("foh", "/assets/live-sound/svg/hardware/foh-console-liv006-matrix-main-outs.svg", 147, 31, 940);
    img("liv026-system-delay-processor-asset", "/assets/live-sound/svg/hardware/power-amp-liv006-system-delay-processor.svg", 44, 255, 610);
    img("crossover", "/assets/live-sound/svg/hardware/crossover-liv010-3way.svg", 47, 432, 605);
    img("high-amp", "/assets/live-sound/svg/hardware/power-amp-liv010-high.svg", 657, 257, 470);
    img("mid-amp", "/assets/live-sound/svg/hardware/power-amp-liv010-mid.svg", 662, 377, 465);
    img("low-amp", "/assets/live-sound/svg/hardware/power-amp-liv010-low.svg", 662, 497, 465);
    img("delay-amp", "/assets/live-sound/svg/hardware/power-amp-liv010-mid.svg", 147, 597, 510);
    img("fill-amp", "/assets/live-sound/svg/hardware/power-amp-liv010-low.svg", 662, 612, 465);

    addLiv026Vu(597, 385, 35, 21, 120);
    addLiv026Vu(519, 386, 35, 21, 162);
    addLiv026Vu(557, 477, 60, 34, 120);
    addLiv026Vu(557, 527, 60, 34, 120);
    addLiv026Vu(342, 652, 55, 31, 120);
    addLiv026Vu(417, 652, 55, 31, 120);
    addLiv026Vu(822, 662, 60, 34, 120);
    addLiv026Vu(902, 662, 60, 34, 120);

    visibleXlrM("liv026-xlrm-main-out-l", "MAIN OUT L", 70, 374, 70, 40, 2700);
    visibleXlrM("liv026-xlrm-main-out-r", "MAIN OUT R", 154, 375, 60, 38, 2700);
    visibleXlrM("liv026-xlrm-delay-out-l", "DELAY OUT L", 256, 375, 65, 43, 2700);
    visibleXlrM("liv026-xlrm-delay-out-r", "DELAY OUT R", 383, 375, 65, 43, 2700);
    visibleXlrM("liv026-xlrm-fill-out", "FILL OUT", 590, 339, 49, 42, 2700);
    visibleXlrM("liv026-xlrm-sub-out", "SUB OUT", 517, 339, 40, 23, 14);


    // LIV-026 good/required gameplay jacks - first rough alignment pass.
    jack("liv026-main-l-output", 948.46, 124.33, "Main L Output");
    jack("liv026-main-r-output", 1007.77, 127.43, "Main R Output");
    jack("liv026-bus-1-output", 661, 103, "Bus 1 Output");
    jack("liv026-bus-2-output", 692.84, 103, "Bus 2 Output");

    jack("liv026-system-processor-l-input", 72, 376, "System Processor L Input");
    jack("liv026-system-processor-r-input", 156, 377, "System Processor R Input");
    jack("liv026-system-processor-l-output", 137.23, 514.81, "System Processor L Output");
    jack("liv026-system-processor-r-output", 194.69, 515.44, "System Processor R Output");
    jack("liv026-front-fill-processor-output", 598.33, 332.46, "Front Fill Processor Output");
    jack("liv026-front-fill-processor-input", 555.64, 331.32, "Front Fill Processor Input");
    jack("liv026-delay-processor-input", 334.66, 334.11, "Delay Processor Input");
    jack("liv026-delay-processor-l-output", 270.75, 374.8, "Delay Processor L Output");
    jack("liv026-delay-processor-r-output", 399.53, 374.51, "Delay Processor R Output");
    // LIV-026: removed duplicate upper processor jack calls; true hitbox bake owns these nodes.
    jack("liv026-crossover-l-input", 137.23, 514.81, "Crossover L Input");
    jack("liv026-crossover-r-input", 194.69, 515.44, "Crossover R Input");
    jack("liv026-crossover-high-l-output", 355.89, 476.36, "Crossover High L Output");
    jack("liv026-crossover-high-r-output", 411.21, 476.47, "Crossover High R Output");
    jack("liv026-crossover-mid-l-output", 353.59, 514.04, "Crossover Mid L Output");
    jack("liv026-crossover-mid-r-output", 413.12, 514.29, "Crossover Mid R Output");
    jack("liv026-crossover-low-l-output", 354.9, 552.87, "Crossover Low L Output");
    jack("liv026-crossover-low-r-output", 413.76, 553.91, "Crossover Low R Output");

    jack("liv026-high-amp-l-input", 724.7, 313.64, "High Amp L Input");
    jack("liv026-high-amp-r-input", 774.11, 314.17, "High Amp R Input");
    jack("liv026-mid-amp-l-input", 728.9, 431.82, "Mid Amp L Input");
    jack("liv026-mid-amp-r-input", 777.74, 432.28, "Mid Amp R Input");
    jack("liv026-low-amp-l-input", 729.61, 551.9, "Low Amp L Input");
    jack("liv026-low-amp-r-input", 777.25, 553.28, "Low Amp R Input");
    jack("liv026-delay-amp-l-input", 222.38, 658.43, "Delay Amp L Input");
    jack("liv026-delay-amp-r-input", 276.26, 658.08, "Delay Amp R Input");
    jack("liv026-fill-amp-l-input", 728.58, 666.44, "Fill Amp L Input");


    function liv026TapeLabel(text, x, y, w, h, rot) {
      const el = document.createElement("div");
      el.className = "sf-liv026-tape-label";
      el.dataset.sfGearId = "liv026-label-" + text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      el.textContent = text;
      el.style.cssText = [
        "position:absolute",
        "left:"+x+"px",
        "top:"+y+"px",
        "width:"+w+"px",
        "height:"+h+"px",
        "z-index:3000",
        "display:flex",
        "align-items:center",
        "justify-content:center",
        "text-align:center",
        "color:#1c1710",
        "font:900 18px 'Marker Felt','Bradley Hand','Comic Sans MS',cursive",
        "letter-spacing:.01em",
        "background:#f4eed1",
        "border:1px solid rgba(80,65,30,.36)",
        "box-shadow:0 2px 5px rgba(0,0,0,.38)",
        "transform:rotate("+(rot||0)+"deg)",
        "pointer-events:none"
      ].join(";");
      layer.appendChild(el);
    }

    liv026TapeLabel("System Processor", 190, 270, 150, 34, -1);
    liv026TapeLabel("3-Way Crossover", 82, 462, 150, 30, -1);
    liv026TapeLabel("High Amp", 832, 305, 145, 38, -1);
    liv026TapeLabel("Mid Amp", 832, 420, 145, 38, 1);
    liv026TapeLabel("Low Amp", 832, 550, 145, 38, -1);
    liv026TapeLabel("Delay", 176, 610, 117, 44, -2);
    liv026TapeLabel("Fill Amp", 704, 624, 82, 26, 1);


    surface.appendChild(layer);


    function installLiv026FalseHitboxStyle() {
      if (document.getElementById("sf-liv026-false-hitbox-style")) return;
      const style = document.createElement("style");
      style.id = "sf-liv026-false-hitbox-style";
      style.textContent = `
        .sf-live-native-level-liv-026 .sf-liv026-false-jack,
        .sf-live-native-level-liv-026 .sf-liv026-false-jack:hover,
        .sf-live-native-level-liv-026 .sf-liv026-false-jack:focus,
        .sf-live-native-level-liv-026 .sf-liv026-false-jack:focus-visible {
          opacity: 0 !important;
          background: transparent !important;
          border: 0 !important;
          box-shadow: none !important;
          outline: 0 !important;
          color: transparent !important;
          cursor: pointer !important;
          pointer-events: auto !important;
        }
      `;
      document.head.appendChild(style);
    }

    const LIV026_FALSE_HITBOXES = [
      {
            "key": "liv026-false-bus-1",
            "leftPx": 215,
            "topPx": 120,
            "widthPx": 44,
            "heightPx": 19
      },
      {
            "key": "liv026-false-bus-2",
            "leftPx": 280,
            "topPx": 120,
            "widthPx": 44,
            "heightPx": 34
      },
      {
            "key": "liv026-false-bus-3",
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

    function applyLiv026FalseHitboxes() {
      installLiv026FalseHitboxStyle();

      LIV026_FALSE_HITBOXES.forEach(function(hb) {
        let el = layer.querySelector('[data-node-key="' + hb.key + '"]');

        const cx = hb.leftPx + hb.widthPx / 2;
        const cy = hb.topPx + hb.heightPx / 2;

        if (!el) {
          createJackNode(layer, hb.key, { x: cx, y: cy }, "False Jack", false);
          el = layer.querySelector('[data-node-key="' + hb.key + '"]');
        }

        if (!el) return;

        el.classList.add("sf-liv026-false-jack");
        el.dataset.sfFalseJack = "1";
        el.dataset.sfNativeHintable = "0";
        el.dataset.sfNativeGoodHint = "0";
        el.dataset.sfNativeGhost = "0";
        el.dataset.sfNativeDefaultShadow = "none";
        el.dataset.sfNativePointX = String(cx);
        el.dataset.sfNativePointY = String(cy);
        el.setAttribute("aria-label", "False Jack");

        el.style.setProperty("position", "absolute", "important");
        el.style.setProperty("left", hb.leftPx + "px", "important");
        el.style.setProperty("top", hb.topPx + "px", "important");
        el.style.setProperty("width", hb.widthPx + "px", "important");
        el.style.setProperty("height", hb.heightPx + "px", "important");
        el.style.setProperty("transform", "none", "important");
        el.style.setProperty("z-index", "3600", "important");
        el.style.setProperty("opacity", "0", "important");
        el.style.setProperty("background", "transparent", "important");
        el.style.setProperty("border", "0", "important");
        el.style.setProperty("box-shadow", "none", "important");
        el.style.setProperty("outline", "0", "important");
        el.style.setProperty("color", "transparent", "important");
        el.style.setProperty("cursor", "pointer", "important");
        el.style.setProperty("pointer-events", "auto", "important");
      });

      console.log("[Signal Flow] LIV-026 false hitboxes baked/applied", LIV026_FALSE_HITBOXES.length);
    }

    function applyLiv026TrueHitboxes() {
      const liv026TrueHitboxes = [["liv026-main-l-output", 946.7, 125.22, 34, 34], ["liv026-main-r-output", 1006.4, 124.93, 34, 34], ["liv026-bus-1-output", 726.93, 121.1, 34, 34], ["liv026-bus-2-output", 763.48, 118.96, 34, 34], ["liv026-system-processor-l-input", 87.73, 332.63, 34, 34], ["liv026-system-processor-r-input", 164.4, 332.82, 34, 34], ["liv026-system-processor-l-output", 87.75, 372.89, 34, 34], ["liv026-system-processor-r-output", 168.75, 373.92, 34, 34], ["liv026-front-fill-processor-input", 555.64, 331.32, 34, 34], ["liv026-front-fill-processor-output", 597.81, 336.78, 34, 34], ["liv026-delay-processor-input", 334.66, 334.11, 34, 34], ["liv026-delay-processor-input-unused", 520.71, 337.34, 34, 34], ["liv026-delay-processor-l-output", 270.75, 374.8, 34, 34], ["liv026-delay-processor-r-output", 399.53, 374.51, 34, 34], ["liv026-crossover-l-input", 137.9, 518.05, 34, 34], ["liv026-crossover-r-input", 191.36, 517.18, 34, 34], ["liv026-crossover-high-l-output", 355.63, 477.77, 34, 34], ["liv026-crossover-high-r-output", 413.37, 476.45, 34, 34], ["liv026-crossover-mid-l-output", 355.06, 515.51, 34, 34], ["liv026-crossover-mid-r-output", 412.19, 515.04, 34, 34], ["liv026-crossover-low-l-output", 353.71, 552.06, 34, 34], ["liv026-crossover-low-r-output", 412.26, 554.54, 34, 34], ["liv026-high-amp-l-input", 727.68, 314.95, 34, 34], ["liv026-high-amp-r-input", 775.71, 311.99, 34, 34], ["liv026-mid-amp-l-input", 730.61, 432.3, 34, 34], ["liv026-mid-amp-r-input", 778.84, 432.21, 34, 34], ["liv026-low-amp-l-input", 729.94, 552.65, 34, 34], ["liv026-low-amp-r-input", 778.1, 552.44, 34, 34], ["liv026-delay-amp-l-input", 225.55, 663.33, 34, 34], ["liv026-delay-amp-r-input", 275.91, 661.19, 34, 34], ["liv026-fill-amp-l-input", 729.12, 665.91, 34, 34]];
      liv026TrueHitboxes.forEach(([key,x,y,w,h]) => {
        const el = layer.querySelector('[data-node-key="' + key + '"]');
        if (!el) return;
        const LIV026_HITBOX_DX = 15;
        const LIV026_HITBOX_DY = 18;
        el.style.setProperty("left", (x + LIV026_HITBOX_DX) + "px", "important");
        el.style.setProperty("top", (y + LIV026_HITBOX_DY) + "px", "important");
        el.style.setProperty("width", w + "px", "important");
        el.style.setProperty("height", h + "px", "important");
        el.style.setProperty("z-index", "3100", "important");
      });
      console.log("[Signal Flow] LIV-026 true hitboxes baked/applied", liv026TrueHitboxes.length);
    }
    applyLiv026TrueHitboxes();
    setTimeout(applyLiv026TrueHitboxes, 0);
    setTimeout(applyLiv026TrueHitboxes, 120);
    applyLiv026FalseHitboxes();
    setTimeout(applyLiv026FalseHitboxes, 0);
    setTimeout(applyLiv026FalseHitboxes, 120);
redrawCables(layer);
    installCableDrag(layer);
    console.log("[Signal Flow] LIV-026 complex zone renderer mounted.");
  }


  function renderLiv023MonitorConsoleStereoPa(surface, adapter) {
	    const boardWidth = 1400;
	    const boardHeight = 1500;
	    const boardTopOffset = 210;
	    const scrollHeight = boardTopOffset + boardHeight + 130;

	    surface.innerHTML = "";
	    surface.querySelectorAll(".sfLiveNativeSurfaceScrollSpacer").forEach(el => el.remove());

	    surface.style.setProperty("position", "relative", "important");
	    surface.style.removeProperty("height");
	    surface.style.setProperty("min-height", "0", "important");
	    surface.style.setProperty("max-height", "min(72vh, 760px)", "important");
	    surface.style.setProperty("overflow-y", "auto", "important");
	    surface.style.setProperty("overflow-x", "hidden", "important");
	    surface.style.setProperty("overscroll-behavior", "contain", "important");
	    surface.style.setProperty("-webkit-overflow-scrolling", "touch", "important");
	    surface.style.setProperty("touch-action", "pan-y", "important");
	    surface.style.setProperty("--sf-live-native-board-height", scrollHeight + "px");
	    surface.classList.add("sf-live-native-scroll-host", "sf-live-native-liv023-scroll-host");

	    Array.from((surface.parentElement || surface).children || []).forEach(function(el) {
	      if (!el || el === surface) return;
	      if (
	        el.id === "cableLayer" ||
	        el.classList.contains("cable-layer") ||
	        el.classList.contains("patchbay-bg")
	      ) {
	        el.dataset.sfLiv023LegacyHidden = "true";
	        el.style.setProperty("display", "none", "important");
	        el.style.setProperty("pointer-events", "none", "important");
	      }
	    });

	    const legacyMask = document.createElement("div");
	    legacyMask.className = "sf-liv023-native-legacy-mask";
	    legacyMask.setAttribute("aria-hidden", "true");
	    legacyMask.style.cssText = [
	      "position:absolute",
	      "left:0",
	      "top:0",
	      "width:" + boardWidth + "px",
	      "min-width:" + boardWidth + "px",
	      "height:" + scrollHeight + "px",
	      "min-height:" + scrollHeight + "px",
	      "z-index:9980",
	      "pointer-events:none",
	      "background:linear-gradient(180deg, rgba(4,8,10,1), rgba(5,10,12,1) 58%, rgba(3,6,7,1))",
	      "border-radius:16px"
	    ].join(";");

	    const layer = document.createElement("div");
	    layer.className = "sf-live-native-layer sf-live-native-level-liv-023";
	    layer.style.cssText = [
	      "position:absolute",
	      "left:0",
	      "top:" + boardTopOffset + "px",
	      "width:" + boardWidth + "px",
	      "min-width:" + boardWidth + "px",
	      "height:" + boardHeight + "px",
	      "min-height:" + boardHeight + "px",
	      "z-index:9990",
	      "isolation:isolate",
	      "pointer-events:none",
	      "overflow:visible",
	      "background:linear-gradient(180deg, rgba(7,12,16,1), rgba(10,18,22,.99))",
	      "border:1px solid rgba(245,197,66,.34)",
	      "box-shadow:inset 0 0 40px rgba(0,0,0,.72)"
	    ].join(";");

	    function addRackPanel() {
	      const rack = document.createElement("div");
	      rack.className = "sf-liv023-rack-zone";
	      rack.setAttribute("aria-hidden", "true");
	      rack.style.cssText = [
	        "position:absolute",
	        "left:420px",
	        "top:190px",
	        "width:470px",
	        "height:670px",
	        "box-sizing:border-box",
	        "border:1px solid rgba(245,197,66,.40)",
	        "border-radius:8px",
	        "background:linear-gradient(90deg, rgba(226,180,72,.22) 0 5px, rgba(0,0,0,.28) 5px 34px, transparent 34px calc(100% - 34px), rgba(0,0,0,.28) calc(100% - 34px) calc(100% - 5px), rgba(226,180,72,.22) calc(100% - 5px) 100%), repeating-linear-gradient(180deg, rgba(255,236,172,.06) 0 1px, transparent 1px 92px), linear-gradient(180deg, rgba(13,12,10,.95), rgba(20,15,9,.88) 52%, rgba(8,8,7,.96))",
	        "box-shadow:inset 0 0 0 1px rgba(255,229,145,.08), inset 0 0 46px rgba(0,0,0,.72), 0 22px 42px rgba(0,0,0,.46)",
	        "pointer-events:none",
	        "z-index:3"
	      ].join(";");
	      [
	        { side: "left", x: 12 },
	        { side: "right", x: 436 }
	      ].forEach(function(rail) {
	        const el = document.createElement("div");
	        el.className = "sf-liv023-rack-rail sf-liv023-rack-rail-" + rail.side;
	        el.style.cssText = [
	          "position:absolute",
	          "left:" + rail.x + "px",
	          "top:16px",
	          "width:22px",
	          "height:638px",
	          "border-radius:5px",
	          "background:linear-gradient(180deg, rgba(238,205,116,.22), rgba(54,40,19,.44))",
	          "box-shadow:inset 0 0 0 1px rgba(255,236,172,.14), inset 0 0 16px rgba(0,0,0,.56)",
	          "pointer-events:none"
	        ].join(";");
	        rack.appendChild(el);
	      });
	      [96, 198, 300, 404, 506, 608].forEach(function(y) {
	        const slot = document.createElement("div");
	        slot.className = "sf-liv023-rack-slot-line";
	        slot.style.cssText = [
	          "position:absolute",
	          "left:42px",
	          "top:" + y + "px",
	          "width:386px",
	          "height:1px",
	          "background:linear-gradient(90deg, transparent, rgba(255,236,172,.18), transparent)",
	          "box-shadow:0 1px 0 rgba(0,0,0,.40)",
	          "pointer-events:none"
	        ].join(";");
	        rack.appendChild(slot);
	      });
	      layer.appendChild(rack);
	    }

		    addRackPanel();

    const gearLayout = [
      {
            "key": "liv023-monitor-console",
            "label": "Monitor Console",
            "leftPx": 12,
            "topPx": 17,
            "widthPx": 837,
            "zIndex": 0,
            "src": "assets/live-sound/svg/hardware/Monitor_Console_LIV023.svg"
      },
      {
            "key": "liv023-lead-vocal-mic",
            "label": "Lead Vocal Mic",
            "leftPx": -72,
            "topPx": 331,
            "widthPx": 295,
            "zIndex": 10,
            "src": "assets/live-sound/svg/hardware/mic nbg.svg"
      },
      {
            "key": "liv023-keyboard",
            "label": "Keyboard",
            "leftPx": 157,
            "topPx": 330,
            "widthPx": 300,
            "zIndex": 1,
            "src": "assets/live-sound/svg/hardware/keys.svg"
      },
      {
            "key": "liv023-stagebox-8",
            "label": "8 Input Stage Box",
            "leftPx": 16,
            "topPx": 210,
            "widthPx": 360,
            "zIndex": 9,
            "src": "assets/live-sound/svg/hardware/stagebox-snake-head.svg"
      },
      {
            "key": "liv023-vocal-compressor",
            "label": "Vocal Compressor",
            "leftPx": 498,
            "topPx": 214,
            "widthPx": 305,
            "zIndex": 10,
            "src": "assets/live-sound/svg/hardware/power-amp-liv007-main-system.svg"
      },
      {
            "key": "liv023-iem-a",
            "label": "IEM Transmitter A",
            "leftPx": 470,
            "topPx": 318,
            "widthPx": 360,
            "zIndex": 10,
            "src": "assets/live-sound/svg/hardware/iem-transmitter-liv003-game-style.svg"
      },
      {
            "key": "liv023-crossover",
            "label": "Stereo 3-Way Crossover",
            "leftPx": 440,
            "topPx": 416,
            "widthPx": 425,
            "zIndex": 10,
            "src": "assets/live-sound/svg/hardware/crossover-liv010-3way.svg"
      },
      {
            "key": "liv023-high-amp",
            "label": "High Amp",
            "leftPx": 455,
            "topPx": 530,
            "widthPx": 400,
            "zIndex": 10,
            "src": "assets/live-sound/svg/hardware/power-amp-liv010-high.svg"
      },
      {
            "key": "liv023-mid-amp",
            "label": "Mid Amp",
            "leftPx": 455,
            "topPx": 627,
            "widthPx": 400,
            "zIndex": 10,
            "src": "assets/live-sound/svg/hardware/power-amp-liv010-mid.svg"
      },
      {
            "key": "liv023-low-amp",
            "label": "Low Amp",
            "leftPx": 454,
            "topPx": 727,
            "widthPx": 400,
            "zIndex": 10,
            "src": "assets/live-sound/svg/hardware/power-amp-liv010-low.svg"
      },
      {
            "key": "liv023-compressor-label",
            "label": "Compressor Label",
            "leftPx": 526,
            "topPx": 225,
            "widthPx": 250,
            "zIndex": 10,
            "src": "assets/live-sound/svg/hardware/Compressor label.svg"
      },
      {
            "key": "liv023-normal-cable-01",
            "label": "Normalization Cable 1",
            "leftPx": 702,
            "topPx": 681,
            "widthPx": 82,
            "zIndex": 10,
            "src": "assets/live-sound/svg/cables/single-one-end-raised.svg"
      },
      {
            "key": "liv023-normal-cable-02",
            "label": "Normalization Cable 2",
            "leftPx": 695,
            "topPx": 782,
            "widthPx": 92,
            "zIndex": 10,
            "src": "assets/live-sound/svg/cables/single-one-end-raised.svg"
      },
      {
            "key": "liv023-normal-cable-03",
            "label": "Normalization Cable 3",
            "leftPx": -102,
            "topPx": 66,
            "widthPx": 220,
            "zIndex": 10,
            "src": "assets/live-sound/svg/cables/single-one-end-raised.svg"
      },
      {
            "key": "liv023-normal-cable-04",
            "label": "Normalization Cable 4",
            "leftPx": -9,
            "topPx": 66,
            "widthPx": 182,
            "zIndex": 10,
            "src": "assets/live-sound/svg/cables/single-one-end-raised.svg"
      },
      {
            "key": "liv023-normal-cable-05",
            "label": "Normalization Cable 5",
            "leftPx": 3,
            "topPx": 61,
            "widthPx": 232,
            "zIndex": 10,
            "src": "assets/live-sound/svg/cables/single-one-end-raised.svg"
      },
      {
            "key": "liv023-normal-cable-06",
            "label": "Normalization Cable 6",
            "leftPx": 660,
            "topPx": 585,
            "widthPx": 82,
            "zIndex": 10,
            "src": "assets/live-sound/svg/cables/single-one-end-raised.svg"
      },
      {
            "key": "liv023-normal-cable-07",
            "label": "Normalization Cable 7",
            "leftPx": 706,
            "topPx": 585,
            "widthPx": 82,
            "zIndex": 10,
            "src": "assets/live-sound/svg/cables/single-one-end-raised.svg"
      },
      {
            "key": "liv023-normal-cable-08",
            "label": "Normalization Cable 8",
            "leftPx": 663,
            "topPx": 680,
            "widthPx": 82,
            "zIndex": 10,
            "src": "assets/live-sound/svg/cables/single-one-end-raised.svg"
      }
];

	    gearLayout.forEach(function(g) {
	      const img = document.createElement("img");
      img.dataset.sfGearKey = g.key;
      img.dataset.sfGearId = g.key;
      img.alt = g.label;
      img.src = sfRepoUrl(g.src);
      img.style.cssText = [
        "position:absolute",
        "left:" + g.leftPx + "px",
        "top:" + g.topPx + "px",
        "width:" + g.widthPx + "px",
        "height:auto",
        "z-index:" + (g.zIndex ?? 10),
        "pointer-events:none",
        "user-select:none",
        "filter:drop-shadow(0 10px 18px rgba(0,0,0,.65))"
      ].join(";");
	      layer.appendChild(img);
	    });
					
    const goodHitboxes = [
      {
            "key": "liv023-lead-vocal-mic",
            "label": "Lead Vocal Mic",
            "leftPx": 26,
            "topPx": 342,
            "widthPx": 123,
            "heightPx": 180
      },
      {
            "key": "liv023-keyboard-di-l",
            "label": "Keyboard DI L",
            "leftPx": 233,
            "topPx": 346,
            "widthPx": 85,
            "heightPx": 72
      },
      {
            "key": "liv023-keyboard-di-r",
            "label": "Keyboard DI R",
            "leftPx": 324,
            "topPx": 346,
            "widthPx": 85,
            "heightPx": 74
      },
      {
            "key": "liv023-stagebox-input-1",
            "label": "Stage Box Input 1",
            "leftPx": 58,
            "topPx": 252,
            "widthPx": 25,
            "heightPx": 28
      },
      {
            "key": "liv023-stagebox-input-2",
            "label": "Stage Box Input 2",
            "leftPx": 89,
            "topPx": 253,
            "widthPx": 25,
            "heightPx": 27
      },
      {
            "key": "liv023-stagebox-input-3",
            "label": "Stage Box Input 3",
            "leftPx": 119,
            "topPx": 254,
            "widthPx": 25,
            "heightPx": 26
      },
      {
            "key": "liv023-ch1-insert-send",
            "label": "Channel 1 Insert Send",
            "leftPx": 245,
            "topPx": 70,
            "widthPx": 17,
            "heightPx": 17
      },
      {
            "key": "liv023-ch1-insert-return",
            "label": "Channel 1 Insert Return",
            "leftPx": 246,
            "topPx": 93,
            "widthPx": 17,
            "heightPx": 16
      },
      {
            "key": "liv023-aux1-l",
            "label": "Aux 1 Left Output",
            "leftPx": 422,
            "topPx": 68,
            "widthPx": 16,
            "heightPx": 17
      },
      {
            "key": "liv023-aux1-r",
            "label": "Aux 1 Right Output",
            "leftPx": 440,
            "topPx": 68,
            "widthPx": 16,
            "heightPx": 18
      },
      {
            "key": "liv023-main-l",
            "label": "Main Left Output",
            "leftPx": 732,
            "topPx": 68,
            "widthPx": 30,
            "heightPx": 27
      },
      {
            "key": "liv023-main-r",
            "label": "Main Right Output",
            "leftPx": 771,
            "topPx": 68,
            "widthPx": 27,
            "heightPx": 26
      },
      {
            "key": "liv023-compressor-input",
            "label": "Compressor Input",
            "leftPx": 600,
            "topPx": 275,
            "widthPx": 23,
            "heightPx": 24
      },
      {
            "key": "liv023-compressor-output",
            "label": "Compressor Output",
            "leftPx": 678,
            "topPx": 276,
            "widthPx": 22,
            "heightPx": 23
      },
      {
            "key": "liv023-iem-input-l",
            "label": "IEM A Left Input",
            "leftPx": 552,
            "topPx": 363,
            "widthPx": 21,
            "heightPx": 23
      },
      {
            "key": "liv023-iem-input-r",
            "label": "IEM A Right Input",
            "leftPx": 583,
            "topPx": 362,
            "widthPx": 21,
            "heightPx": 23
      },
      {
            "key": "liv023-crossover-l-input",
            "label": "Crossover Left Input",
            "leftPx": 504,
            "topPx": 474,
            "widthPx": 21,
            "heightPx": 23
      },
      {
            "key": "liv023-crossover-r-input",
            "label": "Crossover Right Input",
            "leftPx": 545,
            "topPx": 476,
            "widthPx": 21,
            "heightPx": 21
      },
      {
            "key": "liv023-crossover-high-l",
            "label": "Crossover High Left Output",
            "leftPx": 657,
            "topPx": 449,
            "widthPx": 21,
            "heightPx": 20
      },
      {
            "key": "liv023-crossover-high-r",
            "label": "Crossover High Right Output",
            "leftPx": 700,
            "topPx": 449,
            "widthPx": 19,
            "heightPx": 21
      },
      {
            "key": "liv023-crossover-mid-l",
            "label": "Crossover Mid Left Output",
            "leftPx": 659,
            "topPx": 476,
            "widthPx": 18,
            "heightPx": 21
      },
      {
            "key": "liv023-crossover-mid-r",
            "label": "Crossover Mid Right Output",
            "leftPx": 700,
            "topPx": 478,
            "widthPx": 18,
            "heightPx": 18
      },
      {
            "key": "liv023-crossover-low-l",
            "label": "Crossover Low Left Output",
            "leftPx": 657,
            "topPx": 505,
            "widthPx": 20,
            "heightPx": 18
      },
      {
            "key": "liv023-crossover-low-r",
            "label": "Crossover Low Right Output",
            "leftPx": 701,
            "topPx": 504,
            "widthPx": 17,
            "heightPx": 19
      },
      {
            "key": "liv023-high-amp-l",
            "label": "High Amp Left Input",
            "leftPx": 518,
            "topPx": 581,
            "widthPx": 20,
            "heightPx": 22
      },
      {
            "key": "liv023-high-amp-r",
            "label": "High Amp Right Input",
            "leftPx": 561,
            "topPx": 581,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-mid-amp-l",
            "label": "Mid Amp Left Input",
            "leftPx": 516,
            "topPx": 678,
            "widthPx": 24,
            "heightPx": 24
      },
      {
            "key": "liv023-mid-amp-r",
            "label": "Mid Amp Right Input",
            "leftPx": 558,
            "topPx": 679,
            "widthPx": 24,
            "heightPx": 23
      },
      {
            "key": "liv023-low-amp-l",
            "label": "Low Amp Left Input",
            "leftPx": 516,
            "topPx": 779,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-low-amp-r",
            "label": "Low Amp Right Input",
            "leftPx": 558,
            "topPx": 778,
            "widthPx": 21,
            "heightPx": 23
      }
];

	  function addNode(hit) {
	      const btn = document.createElement("button");
	      btn.type = "button";
	      btn.className = "sf-native-node sf-native-jack sf-native-liv023-hitbox";
      btn.dataset.nodeKey = hit.key;
      btn.dataset.key = hit.key;
      btn.dataset.sfNativeKey = hit.key;
      btn.dataset.sfNativeKind = "jack";
      btn.dataset.sfNativeGhost = "0";
	      btn.title = hit.label;
	      btn.setAttribute("aria-label", hit.label);
	      const defaultShadow = "none";
	      const point = {
	        x: hit.leftPx + hit.widthPx / 2,
	        y: hit.topPx + hit.heightPx / 2
	      };
	      btn.dataset.sfNativeDefaultShadow = defaultShadow;
	      btn.dataset.sfNativePointX = String(point.x);
	      btn.dataset.sfNativePointY = String(point.y);

	      if (typeof setNativeNodeDomKey === "function") {
	        setNativeNodeDomKey(btn, hit.key, "jack");
	      }

      btn.style.cssText = [
        "position:absolute",
        "left:" + hit.leftPx + "px",
        "top:" + hit.topPx + "px",
        "width:" + hit.widthPx + "px",
        "height:" + hit.heightPx + "px",
        "min-width:0",
        "min-height:0",
        "max-width:none",
        "max-height:none",
        "box-sizing:border-box",
        "padding:0",
        "margin:0",
        "line-height:0",
        "appearance:none",
        "-webkit-appearance:none",
        "border:0",
	        "border-radius:7px",
	        "background:rgba(255,255,255,0)",
	        "box-shadow:" + defaultShadow,
	        "outline:none",
	        "z-index:80",
	        "cursor:pointer",
	        "pointer-events:auto"
	      ].join(";");

	      btn.addEventListener("pointerdown", event => {
	        console.log("[Signal Flow] LIV-023 native jack drag start:", hit.key);
	        startNativePatchDrag(layer, {
	          key: hit.key,
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

	        console.log("[Signal Flow] LIV-023 native jack clicked:", hit.key);
	        handleNodeClick(layer, {
	          key: hit.key,
	          el: btn,
	          defaultShadow,
	          point
	        });
	      });

	      layer.appendChild(btn);
	    }

	    const falseHitboxes = [
      {
            "key": "liv023-false-stagebox-mic-line-4",
            "label": "Stage Box Mic/Line 4",
            "leftPx": 147,
            "topPx": 256,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-stagebox-mic-line-5",
            "label": "Stage Box Mic/Line 5",
            "leftPx": 178,
            "topPx": 256,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-stagebox-mic-line-6",
            "label": "Stage Box Mic/Line 6",
            "leftPx": 208,
            "topPx": 256,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-stagebox-mic-line-7",
            "label": "Stage Box Mic/Line 7",
            "leftPx": 240,
            "topPx": 256,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-stagebox-mic-line-8",
            "label": "Stage Box Mic/Line 8",
            "leftPx": 270,
            "topPx": 256,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-stagebox-link-out-1",
            "label": "Stage Box Link Out 1",
            "leftPx": 329,
            "topPx": 255,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-mic-line-in-9",
            "label": "Console Mic/Line In 9",
            "leftPx": 48,
            "topPx": 116,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-mic-line-in-10",
            "label": "Console Mic/Line In 10",
            "leftPx": 71,
            "topPx": 116,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-mic-line-in-11",
            "label": "Console Mic/Line In 11",
            "leftPx": 95,
            "topPx": 116,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-mic-line-in-12",
            "label": "Console Mic/Line In 12",
            "leftPx": 119,
            "topPx": 116,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-mic-line-in-13",
            "label": "Console Mic/Line In 13",
            "leftPx": 143,
            "topPx": 116,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-mic-line-in-14",
            "label": "Console Mic/Line In 14",
            "leftPx": 166,
            "topPx": 116,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-mic-line-in-15",
            "label": "Console Mic/Line In 15",
            "leftPx": 189,
            "topPx": 116,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-mic-line-in-16",
            "label": "Console Mic/Line In 16",
            "leftPx": 212,
            "topPx": 116,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-mic-line-in-17",
            "label": "Console Mic/Line In 17",
            "leftPx": 46,
            "topPx": 166,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-mic-line-in-18",
            "label": "Console Mic/Line In 18",
            "leftPx": 69,
            "topPx": 166,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-mic-line-in-19",
            "label": "Console Mic/Line In 19",
            "leftPx": 94,
            "topPx": 166,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-mic-line-in-20",
            "label": "Console Mic/Line In 20",
            "leftPx": 118,
            "topPx": 166,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-mic-line-in-21",
            "label": "Console Mic/Line In 21",
            "leftPx": 141,
            "topPx": 166,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-mic-line-in-22",
            "label": "Console Mic/Line In 22",
            "leftPx": 165,
            "topPx": 166,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-mic-line-in-23",
            "label": "Console Mic/Line In 23",
            "leftPx": 189,
            "topPx": 166,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-mic-line-in-24",
            "label": "Console Mic/Line In 24",
            "leftPx": 212,
            "topPx": 166,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-insert-send-2",
            "label": "Console Insert Send 2",
            "leftPx": 263,
            "topPx": 71,
            "widthPx": 15,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-send-3",
            "label": "Console Insert Send 3",
            "leftPx": 282,
            "topPx": 71,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-send-4",
            "label": "Console Insert Send 4",
            "leftPx": 300,
            "topPx": 71,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-send-5",
            "label": "Console Insert Send 5",
            "leftPx": 320,
            "topPx": 71,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-send-6",
            "label": "Console Insert Send 6",
            "leftPx": 339,
            "topPx": 71,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-send-7",
            "label": "Console Insert Send 7",
            "leftPx": 356,
            "topPx": 71,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-send-8",
            "label": "Console Insert Send 8",
            "leftPx": 375,
            "topPx": 71,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-send-9",
            "label": "Console Insert Send 9",
            "leftPx": 246,
            "topPx": 117,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-send-10",
            "label": "Console Insert Send 10",
            "leftPx": 263,
            "topPx": 117,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-send-11",
            "label": "Console Insert Send 11",
            "leftPx": 281,
            "topPx": 117,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-send-12",
            "label": "Console Insert Send 12",
            "leftPx": 300,
            "topPx": 117,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-send-13",
            "label": "Console Insert Send 13",
            "leftPx": 322,
            "topPx": 117,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-send-14",
            "label": "Console Insert Send 14",
            "leftPx": 340,
            "topPx": 117,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-send-15",
            "label": "Console Insert Send 15",
            "leftPx": 357,
            "topPx": 117,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-send-16",
            "label": "Console Insert Send 16",
            "leftPx": 378,
            "topPx": 117,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-return-2",
            "label": "Console Insert Return 2",
            "leftPx": 264,
            "topPx": 93,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-return-3",
            "label": "Console Insert Return 3",
            "leftPx": 282,
            "topPx": 93,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-return-4",
            "label": "Console Insert Return 4",
            "leftPx": 300,
            "topPx": 93,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-return-5",
            "label": "Console Insert Return 5",
            "leftPx": 321,
            "topPx": 93,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-return-6",
            "label": "Console Insert Return 6",
            "leftPx": 339,
            "topPx": 93,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-return-7",
            "label": "Console Insert Return 7",
            "leftPx": 356,
            "topPx": 93,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-return-8",
            "label": "Console Insert Return 8",
            "leftPx": 376,
            "topPx": 93,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-return-9",
            "label": "Console Insert Return 9",
            "leftPx": 245,
            "topPx": 143,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-return-10",
            "label": "Console Insert Return 10",
            "leftPx": 263,
            "topPx": 143,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-return-11",
            "label": "Console Insert Return 11",
            "leftPx": 281,
            "topPx": 143,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-return-12",
            "label": "Console Insert Return 12",
            "leftPx": 299,
            "topPx": 143,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-return-13",
            "label": "Console Insert Return 13",
            "leftPx": 321,
            "topPx": 143,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-return-14",
            "label": "Console Insert Return 14",
            "leftPx": 339,
            "topPx": 143,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-return-15",
            "label": "Console Insert Return 15",
            "leftPx": 356,
            "topPx": 143,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-insert-return-16",
            "label": "Console Insert Return 16",
            "leftPx": 375,
            "topPx": 143,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-aux-out-3",
            "label": "Console Aux Out 3",
            "leftPx": 458,
            "topPx": 69,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-aux-out-4",
            "label": "Console Aux Out 4",
            "leftPx": 476,
            "topPx": 69,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-aux-out-5",
            "label": "Console Aux Out 5",
            "leftPx": 498,
            "topPx": 69,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-aux-out-6",
            "label": "Console Aux Out 6",
            "leftPx": 517,
            "topPx": 69,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-aux-out-7",
            "label": "Console Aux Out 7",
            "leftPx": 532,
            "topPx": 69,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-aux-out-8",
            "label": "Console Aux Out 8",
            "leftPx": 552,
            "topPx": 69,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-aux-out-9",
            "label": "Console Aux Out 9",
            "leftPx": 421,
            "topPx": 107,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-aux-out-10",
            "label": "Console Aux Out 10",
            "leftPx": 439,
            "topPx": 107,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-aux-out-11",
            "label": "Console Aux Out 11",
            "leftPx": 457,
            "topPx": 107,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-aux-out-12",
            "label": "Console Aux Out 12",
            "leftPx": 476,
            "topPx": 107,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-aux-out-13",
            "label": "Console Aux Out 13",
            "leftPx": 498,
            "topPx": 107,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-aux-out-14",
            "label": "Console Aux Out 14",
            "leftPx": 515,
            "topPx": 107,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-aux-out-15",
            "label": "Console Aux Out 15",
            "leftPx": 532,
            "topPx": 107,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-aux-out-16",
            "label": "Console Aux Out 16",
            "leftPx": 551,
            "topPx": 107,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-aux-out-17",
            "label": "Console Aux Out 17",
            "leftPx": 422,
            "topPx": 153,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-aux-out-18",
            "label": "Console Aux Out 18",
            "leftPx": 440,
            "topPx": 153,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-aux-out-19",
            "label": "Console Aux Out 19",
            "leftPx": 457,
            "topPx": 153,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-aux-out-20",
            "label": "Console Aux Out 20",
            "leftPx": 476,
            "topPx": 153,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-aux-out-21",
            "label": "Console Aux Out 21",
            "leftPx": 498,
            "topPx": 153,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-aux-out-22",
            "label": "Console Aux Out 22",
            "leftPx": 515,
            "topPx": 153,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-aux-out-23",
            "label": "Console Aux Out 23",
            "leftPx": 533,
            "topPx": 153,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-aux-out-24",
            "label": "Console Aux Out 24",
            "leftPx": 551,
            "topPx": 153,
            "widthPx": 16,
            "heightPx": 16
      },
      {
            "key": "liv023-false-console-bus-out-1",
            "label": "Console Bus Out 1",
            "leftPx": 604,
            "topPx": 70,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-bus-out-2",
            "label": "Console Bus Out 2",
            "leftPx": 627,
            "topPx": 70,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-bus-out-3",
            "label": "Console Bus Out 3",
            "leftPx": 650,
            "topPx": 70,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-bus-out-4",
            "label": "Console Bus Out 4",
            "leftPx": 674,
            "topPx": 70,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-bus-out-5",
            "label": "Console Bus Out 5",
            "leftPx": 604,
            "topPx": 103,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-bus-out-6",
            "label": "Console Bus Out 6",
            "leftPx": 628,
            "topPx": 103,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-bus-out-7",
            "label": "Console Bus Out 7",
            "leftPx": 652,
            "topPx": 103,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-bus-out-8",
            "label": "Console Bus Out 8",
            "leftPx": 674,
            "topPx": 103,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-bus-out-9",
            "label": "Console Bus Out 9",
            "leftPx": 604,
            "topPx": 136,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-bus-out-10",
            "label": "Console Bus Out 10",
            "leftPx": 628,
            "topPx": 136,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-bus-out-11",
            "label": "Console Bus Out 11",
            "leftPx": 653,
            "topPx": 136,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-bus-out-12",
            "label": "Console Bus Out 12",
            "leftPx": 676,
            "topPx": 136,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-bus-out-13",
            "label": "Console Bus Out 13",
            "leftPx": 605,
            "topPx": 165,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-bus-out-14",
            "label": "Console Bus Out 14",
            "leftPx": 630,
            "topPx": 165,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-bus-out-15",
            "label": "Console Bus Out 15",
            "leftPx": 653,
            "topPx": 165,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-bus-out-16",
            "label": "Console Bus Out 16",
            "leftPx": 676,
            "topPx": 165,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-bus-1",
            "label": "Console Bus 1/2",
            "leftPx": 731,
            "topPx": 129,
            "widthPx": 12,
            "heightPx": 12
      },
      {
            "key": "liv023-false-console-bus-2",
            "label": "Console Bus 2",
            "leftPx": 750,
            "topPx": 129,
            "widthPx": 12,
            "heightPx": 12
      },
      {
            "key": "liv023-false-console-bus-3",
            "label": "Console Bus 3",
            "leftPx": 769,
            "topPx": 129,
            "widthPx": 12,
            "heightPx": 12
      },
      {
            "key": "liv023-false-console-bus-4",
            "label": "Console Bus 4",
            "leftPx": 786,
            "topPx": 129,
            "widthPx": 12,
            "heightPx": 12
      },
      {
            "key": "liv023-false-console-talkback",
            "label": "Console TALKBACK",
            "leftPx": 720,
            "topPx": 158,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-aes",
            "label": "Console AES",
            "leftPx": 743,
            "topPx": 158,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-cue",
            "label": "Console CUE",
            "leftPx": 767,
            "topPx": 158,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-console-mon",
            "label": "Console MON",
            "leftPx": 790,
            "topPx": 158,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-iem-b-l",
            "label": "IEM Unit B L",
            "leftPx": 643,
            "topPx": 364,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-iem-b-r",
            "label": "IEM Unit B R",
            "leftPx": 675,
            "topPx": 364,
            "widthPx": 22,
            "heightPx": 22
      },
      {
            "key": "liv023-false-iem-phones",
            "label": "IEM Phones",
            "leftPx": 755,
            "topPx": 364,
            "widthPx": 22,
            "heightPx": 22
      }
];

    falseHitboxes.forEach(addNode);

    goodHitboxes.forEach(addNode);

	    const spacer = document.createElement("div");
	    spacer.className = "sfLiveNativeSurfaceScrollSpacer sf-liv023-scroll-spacer";
	    spacer.style.cssText = "position:relative;display:block;opacity:0;pointer-events:none";
	    spacer.style.setProperty("width", boardWidth + "px", "important");
	    spacer.style.setProperty("min-width", boardWidth + "px", "important");
	    spacer.style.setProperty("height", scrollHeight + "px", "important");
	    spacer.style.setProperty("min-height", scrollHeight + "px", "important");

	    surface.appendChild(legacyMask);
	    surface.appendChild(layer);
	    surface.appendChild(spacer);
	    redrawCables(layer);
	    installCableDrag(layer);

    console.log("[Signal Flow] LIV-023 native renderer mounted", {
      gear: gearLayout.length,
      good: goodHitboxes.length,
      boardWidth,
      boardHeight
    });
  }

  const LIV028_VISUAL_ITEMS = [
    {
        "key": "leadVocalMic",
        "tagName": "img",
        "text": "",
        "src": "/assets/live-sound/svg/hardware/mic nbg.svg",
        "alt": "Lead Vocal Mic",
        "label": "Lead Vocal Mic",
        "leftPx": -5,
        "topPx": 30,
        "widthPx": 200,
        "heightPx": 130,
        "zIndex": 300,
        "className": "sf-liv028-full-gear-placed sf-liv028-gear-leadVocalMic"
    },
    {
        "key": "keyboardVocalMic",
        "tagName": "img",
        "text": "",
        "src": "/assets/live-sound/svg/hardware/mic nbg.svg",
        "alt": "Keyboard Vocal Mic",
        "label": "Keyboard Vocal Mic",
        "leftPx": 170,
        "topPx": 30,
        "widthPx": 200,
        "heightPx": 130,
        "zIndex": 298,
        "className": "sf-liv028-full-gear-placed sf-liv028-gear-keyboardVocalMic"
    },
    {
        "key": "keysLDi",
        "tagName": "img",
        "text": "",
        "src": "/assets/live-sound/svg/hardware/DI.svg",
        "alt": "Keys L DI",
        "label": "Keys L DI",
        "leftPx": 350,
        "topPx": 32,
        "widthPx": 70,
        "heightPx": 38,
        "zIndex": 347,
        "className": "sf-liv028-full-gear-placed sf-liv028-gear-keysLDi"
    },
    {
        "key": "keysRDi",
        "tagName": "img",
        "text": "",
        "src": "/assets/live-sound/svg/hardware/DI.svg",
        "alt": "Keys R DI",
        "label": "Keys R DI",
        "leftPx": 510,
        "topPx": 30,
        "widthPx": 69,
        "heightPx": 37,
        "zIndex": 321,
        "className": "sf-liv028-full-gear-placed sf-liv028-gear-keysRDi"
    },
    {
        "key": "keyboard",
        "tagName": "img",
        "text": "",
        "src": "/assets/live-sound/svg/hardware/keys b.svg",
        "alt": "Keyboard",
        "label": "Keyboard",
        "leftPx": 345,
        "topPx": 33,
        "widthPx": 230,
        "heightPx": 124,
        "zIndex": 300,
        "className": "sf-liv028-full-gear-placed sf-liv028-gear-keyboard"
    },
    {
        "key": "stagebox16",
        "tagName": "img",
        "text": "",
        "src": "/assets/live-sound/svg/hardware/stagebox-snake-head-16x2-aes.svg",
        "alt": "16 Input Stagebox",
        "label": "16 Input Stagebox",
        "leftPx": 590,
        "topPx": 30,
        "widthPx": 340,
        "heightPx": 125,
        "zIndex": 320,
        "className": "sf-liv028-full-gear-placed sf-liv028-gear-stagebox16"
    },
    {
        "key": "fohConsole",
        "tagName": "img",
        "text": "",
        "src": "/assets/live-sound/svg/hardware/16ch_FOH_console_trimmed_no_background.svg",
        "alt": "16 Channel FOH Console",
        "label": "16 Channel FOH Console",
        "leftPx": 15,
        "topPx": 165,
        "widthPx": 850,
        "heightPx": 189,
        "zIndex": 300,
        "className": "sf-liv028-full-gear-placed sf-liv028-gear-fohConsole"
    },
    {
        "key": "mainSplitter",
        "tagName": "img",
        "text": "",
        "src": "/assets/live-sound/svg/hardware/Spliter_background_removed_cropped_from_svg.png",
        "alt": "FOH Main Splitter",
        "label": "FOH Main Splitter",
        "leftPx": 15,
        "topPx": 360,
        "widthPx": 460,
        "heightPx": 92,
        "zIndex": 300,
        "className": "sf-liv028-full-gear-placed sf-liv028-gear-mainSplitter"
    },
    {
        "key": "recordingFeed",
        "tagName": "img",
        "text": "",
        "src": "/assets/live-sound/svg/hardware/iem-feed-liv007-record.svg",
        "alt": "Recording Feed",
        "label": "Recording Feed",
        "leftPx": 140,
        "topPx": 525,
        "widthPx": 215,
        "heightPx": 57,
        "zIndex": 300,
        "className": "sf-liv028-full-gear-placed sf-liv028-gear-recordingFeed"
    },
    {
        "key": "broadcastFeedA",
        "tagName": "img",
        "text": "",
        "src": "/assets/live-sound/svg/hardware/iem-feed-liv007-station-a.svg",
        "alt": "Broadcast A",
        "label": "Broadcast A",
        "leftPx": 15,
        "topPx": 460,
        "widthPx": 215,
        "heightPx": 57,
        "zIndex": 300,
        "className": "sf-liv028-full-gear-placed sf-liv028-gear-broadcastFeedA"
    },
    {
        "key": "broadcastFeedB",
        "tagName": "img",
        "text": "",
        "src": "/assets/live-sound/svg/hardware/iem-feed-liv007-station-b.svg",
        "alt": "Broadcast B",
        "label": "Broadcast B",
        "leftPx": 265,
        "topPx": 460,
        "widthPx": 215,
        "heightPx": 57,
        "zIndex": 300,
        "className": "sf-liv028-full-gear-placed sf-liv028-gear-broadcastFeedB"
    },
    {
        "key": "crossover",
        "tagName": "img",
        "text": "",
        "src": "/assets/live-sound/svg/hardware/crossover-liv010-3way.svg",
        "alt": "Crossover",
        "label": "Crossover",
        "leftPx": 490,
        "topPx": 355,
        "widthPx": 370,
        "heightPx": 98,
        "zIndex": 300,
        "className": "sf-liv028-full-gear-placed sf-liv028-gear-crossover"
    },
    {
        "key": "bus",
        "tagName": "img",
        "text": "",
        "src": "/assets/live-sound/svg/hardware/Bus_trimmed_no_background.svg",
        "alt": "Bus Router",
        "label": "Bus Router",
        "leftPx": 490,
        "topPx": 455,
        "widthPx": 370,
        "heightPx": 92,
        "zIndex": 300,
        "className": "sf-liv028-full-gear-placed sf-liv028-gear-bus"
    },
    {
        "key": "iemTransmittersAB",
        "tagName": "img",
        "text": "",
        "src": "/assets/live-sound/svg/hardware/iem-transmitter-liv028-talkback.svg",
        "alt": "IEM A/B",
        "label": "IEM A/B",
        "leftPx": 14,
        "topPx": 590,
        "widthPx": 275,
        "heightPx": 73,
        "zIndex": 300,
        "className": "sf-liv028-full-gear-placed sf-liv028-gear-iemTransmittersAB"
    },
    {
        "key": "iemTransmittersCD",
        "tagName": "img",
        "text": "",
        "src": "/assets/live-sound/svg/hardware/iem-transmitter-liv028-talkback.svg",
        "alt": "IEM C/D",
        "label": "IEM C/D",
        "leftPx": 217,
        "topPx": 591,
        "widthPx": 270,
        "heightPx": 72,
        "zIndex": 300,
        "className": "sf-liv028-full-gear-placed sf-liv028-gear-iemTransmittersCD"
    },
    {
        "key": "powerAmp1",
        "tagName": "img",
        "text": "",
        "src": "/assets/live-sound/svg/hardware/power-amp-liv010-high.svg",
        "alt": "Power Amp 1",
        "label": "BAL A",
        "leftPx": 490,
        "topPx": 555,
        "widthPx": 370,
        "heightPx": 94,
        "zIndex": 300,
        "className": "sf-liv028-full-gear-placed sf-liv028-gear-powerAmp1"
    },
    {
        "key": "powerAmp2",
        "tagName": "img",
        "text": "",
        "src": "/assets/live-sound/svg/hardware/power-amp-liv010-mid.svg",
        "alt": "Power Amp 2",
        "label": "BAL B",
        "leftPx": 490,
        "topPx": 650,
        "widthPx": 370,
        "heightPx": 94,
        "zIndex": 300,
        "className": "sf-liv028-full-gear-placed sf-liv028-gear-powerAmp2"
    },
    {
        "key": "powerAmp3",
        "tagName": "img",
        "text": "",
        "src": "/assets/live-sound/svg/hardware/power-amp-liv010-low.svg",
        "alt": "Power Amp 3",
        "label": "BAL CENTER",
        "leftPx": 490,
        "topPx": 745,
        "widthPx": 370,
        "heightPx": 94,
        "zIndex": 300,
        "className": "sf-liv028-full-gear-placed sf-liv028-gear-powerAmp3"
    }
];

  const LIV028_NORMALLED_CABLES = [
    {
        "key": "stagebox-foh-normal-01",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Normalled Stagebox Input 1 to FOH Input 1",
        "leftPx": -74,
        "topPx": 218,
        "widthPx": 156,
        "rotateDeg": 0,
        "zIndex": 1000,
        "opacity": 1
    },
    {
        "key": "stagebox-foh-normal-02",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Normalled Stagebox Input 2 to FOH Input 2",
        "leftPx": -30,
        "topPx": 216,
        "widthPx": 159,
        "rotateDeg": 1,
        "zIndex": 1000,
        "opacity": 1
    },
    {
        "key": "stagebox-foh-normal-03",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Normalled Stagebox Input 3 to FOH Input 3",
        "leftPx": 5,
        "topPx": 220,
        "widthPx": 163,
        "rotateDeg": 0,
        "zIndex": 1005,
        "opacity": 1
    },
    {
        "key": "stagebox-foh-normal-04",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Normalled Stagebox Input 4 to FOH Input 4",
        "leftPx": 45,
        "topPx": 214,
        "widthPx": 166,
        "rotateDeg": 1,
        "zIndex": 1005,
        "opacity": 1
    },
    {
        "key": "stagebox-foh-normal-05",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Normalled Stagebox Input 5 to FOH Input 5",
        "leftPx": 88,
        "topPx": 216,
        "widthPx": 170,
        "rotateDeg": 0,
        "zIndex": 1005,
        "opacity": 1
    },
    {
        "key": "stagebox-foh-normal-06",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Normalled Stagebox Input 6 to FOH Input 6",
        "leftPx": 125,
        "topPx": 214,
        "widthPx": 174,
        "rotateDeg": 1,
        "zIndex": 1005,
        "opacity": 1
    },
    {
        "key": "stagebox-foh-normal-07",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Normalled Stagebox Input 7 to FOH Input 7",
        "leftPx": 169,
        "topPx": 216,
        "widthPx": 177,
        "rotateDeg": 0,
        "zIndex": 1005,
        "opacity": 1
    },
    {
        "key": "stagebox-foh-normal-08",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Normalled Stagebox Input 8 to FOH Input 8",
        "leftPx": 201,
        "topPx": 216,
        "widthPx": 181,
        "rotateDeg": 1,
        "zIndex": 1000,
        "opacity": 1
    },
    {
        "key": "stagebox-foh-normal-09",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Normalled Stagebox Input 9 to FOH Input 9",
        "leftPx": -105,
        "topPx": 279,
        "widthPx": 188,
        "rotateDeg": 0,
        "zIndex": 1000,
        "opacity": 1
    },
    {
        "key": "stagebox-foh-normal-10",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Normalled Stagebox Input 10 to FOH Input 10",
        "leftPx": -56,
        "topPx": 279,
        "widthPx": 184,
        "rotateDeg": 0,
        "zIndex": 1000,
        "opacity": 1
    },
    {
        "key": "stagebox-foh-normal-11",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Normalled Stagebox Input 11 to FOH Input 11",
        "leftPx": -11,
        "topPx": 281,
        "widthPx": 179,
        "rotateDeg": -1,
        "zIndex": 1000,
        "opacity": 1
    },
    {
        "key": "stagebox-foh-normal-12",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Normalled Stagebox Input 12 to FOH Input 12",
        "leftPx": 39,
        "topPx": 272,
        "widthPx": 175,
        "rotateDeg": 1,
        "zIndex": 1000,
        "opacity": 1
    },
    {
        "key": "stagebox-foh-normal-13",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Normalled Stagebox Input 13 to FOH Input 13",
        "leftPx": 83,
        "topPx": 276,
        "widthPx": 170,
        "rotateDeg": 0,
        "zIndex": 1000,
        "opacity": 1
    },
    {
        "key": "stagebox-foh-normal-14",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Normalled Stagebox Input 14 to FOH Input 14",
        "leftPx": 123,
        "topPx": 272,
        "widthPx": 176,
        "rotateDeg": 1,
        "zIndex": 1000,
        "opacity": 1
    },
    {
        "key": "stagebox-foh-normal-15",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Normalled Stagebox Input 15 to FOH Input 15",
        "leftPx": 168,
        "topPx": 272,
        "widthPx": 177,
        "rotateDeg": 0,
        "zIndex": 1000,
        "opacity": 1
    },
    {
        "key": "stagebox-foh-normal-16",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Normalled Stagebox Input 16 to FOH Input 16",
        "leftPx": 205,
        "topPx": 272,
        "widthPx": 182,
        "rotateDeg": 0,
        "zIndex": 1000,
        "opacity": 1
    },
    {
        "key": "crossover-high-l-to-power-amp-1-l",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Crossover High L Output to Power Amp 1 L Input",
        "leftPx": 875,
        "topPx": 435,
        "widthPx": 160,
        "rotateDeg": 188,
        "zIndex": 1000,
        "opacity": 1
    },
    {
        "key": "crossover-high-r-to-power-amp-1-r",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Crossover High R Output to Power Amp 1 R Input",
        "leftPx": 845,
        "topPx": 440,
        "widthPx": 165,
        "rotateDeg": 190,
        "zIndex": 1000,
        "opacity": 1
    },
    {
        "key": "crossover-mid-l-to-power-amp-2-l",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Crossover Mid L Output to Power Amp 2 L Input",
        "leftPx": 905,
        "topPx": 425,
        "widthPx": 230,
        "rotateDeg": 192,
        "zIndex": 1000,
        "opacity": 1
    },
    {
        "key": "crossover-mid-r-to-power-amp-2-r",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Crossover Mid R Output to Power Amp 2 R Input",
        "leftPx": 900,
        "topPx": 430,
        "widthPx": 190,
        "rotateDeg": 194,
        "zIndex": 1000,
        "opacity": 1
    },
    {
        "key": "crossover-low-l-to-power-amp-3-l",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Crossover Low L Output to Power Amp 3 L Input",
        "leftPx": 945,
        "topPx": 370,
        "widthPx": 265,
        "rotateDeg": 185,
        "zIndex": 1000,
        "opacity": 1
    },
    {
        "key": "crossover-low-r-to-power-amp-3-r",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Crossover Low R Output to Power Amp 3 R Input",
        "leftPx": 970,
        "topPx": 360,
        "widthPx": 250,
        "rotateDeg": 182,
        "zIndex": 1000,
        "opacity": 1
    },
    {
        "key": "power-amp-1-l-to-zone-output-a-l",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Power Amp 1 L Output to Balcony / Zone Output A L",
        "leftPx": 955,
        "topPx": 640,
        "widthPx": 180,
        "rotateDeg": 200,
        "zIndex": 1000,
        "opacity": 1
    },
    {
        "key": "power-amp-1-r-to-zone-output-a-r",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Power Amp 1 R Output to Balcony / Zone Output A R",
        "leftPx": 925,
        "topPx": 615,
        "widthPx": 180,
        "rotateDeg": 190,
        "zIndex": 1000,
        "opacity": 1
    },
    {
        "key": "power-amp-2-l-to-zone-output-b-l",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Power Amp 2 L Output to Balcony / Zone Output B L",
        "leftPx": 925,
        "topPx": 710,
        "widthPx": 180,
        "rotateDeg": 190,
        "zIndex": 1000,
        "opacity": 1
    },
    {
        "key": "power-amp-2-r-to-zone-output-b-r",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Power Amp 2 R Output to Balcony / Zone Output B R",
        "leftPx": 965,
        "topPx": 710,
        "widthPx": 180,
        "rotateDeg": 190,
        "zIndex": 1000,
        "opacity": 1
    },
    {
        "key": "power-amp-3-l-to-zone-output-c-l",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Power Amp 3 L Output to Balcony / Zone Output C L",
        "leftPx": 925,
        "topPx": 790,
        "widthPx": 180,
        "rotateDeg": 185,
        "zIndex": 1000,
        "opacity": 1
    },
    {
        "key": "power-amp-3-r-to-zone-output-c-r",
        "src": "/assets/live-sound/svg/cables/single-one-end-raised.svg",
        "alt": "Power Amp 3 R Output to Balcony / Zone Output C R",
        "leftPx": 965,
        "topPx": 805,
        "widthPx": 180,
        "rotateDeg": 190,
        "zIndex": 1000,
        "opacity": 1
    }
];

  const LIV028_TRUE_HITBOXES = [
    {"key":"liv028-aux-1-out","leftPx":608,"topPx":206,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-aux-2-out","leftPx":653,"topPx":207,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-aux-3-out","leftPx":608,"topPx":241,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-aux-4-out","leftPx":653,"topPx":242,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-aux-5-out","leftPx":607,"topPx":272,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-aux-6-out","leftPx":654,"topPx":272,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-aux-7-out","leftPx":608,"topPx":305,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-aux-8-out","leftPx":653,"topPx":305,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-balcony-a-center","leftPx":730,"topPx":791,"widthPx":24,"heightPx":24,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-balcony-a-left","leftPx":730,"topPx":601,"widthPx":24,"heightPx":24,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-balcony-a-right","leftPx":770,"topPx":600,"widthPx":24,"heightPx":24,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-balcony-b-center","leftPx":770,"topPx":790,"widthPx":24,"heightPx":24,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-balcony-b-left","leftPx":730,"topPx":695,"widthPx":24,"heightPx":24,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-balcony-b-right","leftPx":770,"topPx":695,"widthPx":24,"heightPx":24,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-broadcast-a-l","leftPx":271,"topPx":485,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-broadcast-a-r","leftPx":322,"topPx":485,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-broadcast-b-l","leftPx":519,"topPx":485,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-broadcast-b-r","leftPx":572,"topPx":485,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-bus-1-out","leftPx":730,"topPx":210,"widthPx":24,"heightPx":24,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-bus-2-out","leftPx":772,"topPx":210,"widthPx":24,"heightPx":24,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-bus-3-out","leftPx":812,"topPx":205,"widthPx":29,"heightPx":29,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-bus-4-out","leftPx":856,"topPx":209,"widthPx":24,"heightPx":24,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-bus-5-out","leftPx":732,"topPx":251,"widthPx":24,"heightPx":24,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-bus-6-out","leftPx":772,"topPx":251,"widthPx":24,"heightPx":24,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-bus-7-out","leftPx":815,"topPx":251,"widthPx":24,"heightPx":24,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-bus-8-out","leftPx":855,"topPx":251,"widthPx":24,"heightPx":24,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-crossover-in-l","leftPx":726,"topPx":403,"widthPx":24,"heightPx":24,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-crossover-in-r","leftPx":763,"topPx":403,"widthPx":24,"heightPx":24,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-foh-main-out-l","leftPx":923,"topPx":245,"widthPx":34,"heightPx":34,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-foh-main-out-r","leftPx":976,"topPx":245,"widthPx":34,"heightPx":34,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-iem-a-l-input","leftPx":257,"topPx":621,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-iem-a-r-input","leftPx":284,"topPx":621,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-iem-b-l-input","leftPx":327,"topPx":621,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-iem-b-r-input","leftPx":353,"topPx":621,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-iem-c-l-input","leftPx":460,"topPx":621,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-iem-c-r-input","leftPx":486,"topPx":621,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-iem-d-l-input","leftPx":527,"topPx":621,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-iem-d-r-input","leftPx":554,"topPx":621,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-keyboard-vocal-mic","leftPx":426,"topPx":42,"widthPx":60,"heightPx":109,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-source"},
    {"key":"liv028-keys-l-di","leftPx":539,"topPx":42,"widthPx":54,"heightPx":24,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-source"},
    {"key":"liv028-keys-r-di","leftPx":699,"topPx":40,"widthPx":64,"heightPx":24,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-source"},
    {"key":"liv028-lead-vocal-mic","leftPx":249,"topPx":42,"widthPx":74,"heightPx":114,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-source"},
    {"key":"liv028-bus-input-1","leftPx":700,"topPx":476,"widthPx":20,"heightPx":20,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-bus-input-2","leftPx":723,"topPx":476,"widthPx":20,"heightPx":20,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-bus-input-3","leftPx":745,"topPx":476,"widthPx":20,"heightPx":20,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-bus-input-4","leftPx":767,"topPx":476,"widthPx":20,"heightPx":20,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-bus-input-5","leftPx":790,"topPx":476,"widthPx":20,"heightPx":20,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-bus-input-6","leftPx":813,"topPx":476,"widthPx":20,"heightPx":20,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-bus-input-7","leftPx":835,"topPx":476,"widthPx":20,"heightPx":20,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-bus-input-8","leftPx":858,"topPx":476,"widthPx":20,"heightPx":20,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-bus-out-1a","leftPx":700,"topPx":501,"widthPx":20,"heightPx":20,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-bus-out-1b","leftPx":725,"topPx":501,"widthPx":20,"heightPx":20,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-bus-out-2a","leftPx":790,"topPx":501,"widthPx":20,"heightPx":20,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-bus-out-2b","leftPx":813,"topPx":501,"widthPx":20,"heightPx":20,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-bus-out-3a","leftPx":889,"topPx":479,"widthPx":20,"heightPx":20,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-bus-out-3b","leftPx":913,"topPx":479,"widthPx":20,"heightPx":20,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-recording-in-l","leftPx":394,"topPx":550,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-recording-in-r","leftPx":450,"topPx":550,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-splitter-in-1","leftPx":283,"topPx":377,"widthPx":24,"heightPx":24,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-splitter-in-2","leftPx":315,"topPx":377,"widthPx":24,"heightPx":24,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-splitter-out-1-l","leftPx":284,"topPx":413,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-splitter-out-1-r","leftPx":316,"topPx":413,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-splitter-out-2-l","leftPx":348,"topPx":413,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-splitter-out-2-r","leftPx":380,"topPx":413,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-splitter-out-3-l","leftPx":413,"topPx":413,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-splitter-out-3-r","leftPx":444,"topPx":413,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-splitter-out-4-l","leftPx":476,"topPx":413,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-splitter-out-4-r","leftPx":509,"topPx":413,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-stage-box-input-1","leftPx":795,"topPx":62,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-stage-box-input-2","leftPx":822,"topPx":62,"widthPx":21,"heightPx":21,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-stage-box-input-7","leftPx":954,"topPx":62,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"},
    {"key":"liv028-stage-box-input-8","leftPx":981,"topPx":62,"widthPx":22,"heightPx":22,"className":"sf-native-node sf-native-liv028-true-hitbox sf-native-jack"}
  ];


  const LIV029_HITBOXES = [
    { key: "wireless-receiver-ch1-audio-out", label: "CH1 Moderator Lav Audio Out", tag: "CH1 MOD OUT", kind: "source", x: 278, y: 166, w: 28, h: 28 },
    { key: "wireless-receiver-ch2-audio-out", label: "CH2 Panelist 1 Lav Audio Out", tag: "CH2 P1 OUT", kind: "source", x: 278, y: 205, w: 28, h: 28 },
    { key: "wireless-receiver-ch3-audio-out", label: "CH3 Panelist 2 Lav Audio Out", tag: "CH3 P2 OUT", kind: "source", x: 278, y: 244, w: 28, h: 28 },
    { key: "wireless-receiver-ch4-audio-out", label: "CH4 Audience Q&A Audio Out", tag: "CH4 Q&A OUT", kind: "source", x: 278, y: 283, w: 28, h: 28 },
    { key: "console-input-1", label: "Console Input 1", tag: "IN 1", kind: "jack", x: 395, y: 206, w: 24, h: 24 },
    { key: "console-input-2", label: "Console Input 2", tag: "IN 2", kind: "jack", x: 435, y: 206, w: 24, h: 24 },
    { key: "console-input-3", label: "Console Input 3", tag: "IN 3", kind: "jack", x: 475, y: 206, w: 24, h: 24 },
    { key: "console-input-4", label: "Console Input 4", tag: "IN 4", kind: "jack", x: 515, y: 206, w: 24, h: 24 },
    { key: "console-aux-1-output", label: "Console Aux 1 Out", tag: "AUX 1", kind: "source", x: 635, y: 212, w: 26, h: 26 },
    { key: "console-matrix-record-l-output", label: "Console Matrix/Record L Out", tag: "REC L", kind: "source", x: 700, y: 212, w: 26, h: 26 },
    { key: "console-matrix-record-r-output", label: "Console Matrix/Record R Out", tag: "REC R", kind: "source", x: 735, y: 212, w: 26, h: 26 },
    { key: "console-main-l-output", label: "Console Main L Out", tag: "MAIN L", kind: "source", x: 785, y: 212, w: 28, h: 28 },
    { key: "console-main-r-output", label: "Console Main R Out", tag: "MAIN R", kind: "source", x: 825, y: 212, w: 28, h: 28 },
    { key: "pa-processor-amp-l-input", label: "PA Processor/Amp L In", tag: "PA L IN", kind: "jack", x: 410, y: 385, w: 28, h: 28 },
    { key: "pa-processor-amp-r-input", label: "PA Processor/Amp R In", tag: "PA R IN", kind: "jack", x: 455, y: 385, w: 28, h: 28 },
    { key: "pa-processor-amp-l-output", label: "PA Processor/Amp L Out", tag: "AMP L OUT", kind: "source", x: 548, y: 385, w: 28, h: 28 },
    { key: "pa-processor-amp-r-output", label: "PA Processor/Amp R Out", tag: "AMP R OUT", kind: "source", x: 593, y: 385, w: 28, h: 28 },
    { key: "left-speaker-input", label: "Left Speaker In", tag: "L SPK IN", kind: "jack", x: 780, y: 482, w: 30, h: 30 },
    { key: "right-speaker-input", label: "Right Speaker In", tag: "R SPK IN", kind: "jack", x: 890, y: 482, w: 30, h: 30 },
    { key: "press-recorder-l-input", label: "Press/Recorder L In", tag: "PRESS L IN", kind: "jack", x: 150, y: 430, w: 26, h: 26 },
    { key: "press-recorder-r-input", label: "Press/Recorder R In", tag: "PRESS R IN", kind: "jack", x: 200, y: 430, w: 26, h: 26 },
    { key: "moderator-wedge-input", label: "Moderator Wedge In", tag: "WEDGE IN", kind: "jack", x: 750, y: 525, w: 30, h: 30 },
    { key: "wireless-receiver-antenna-a", label: "Wireless Receiver Antenna A", tag: "ANT A RF", kind: "source", x: 52, y: 160, w: 30, h: 30, falseTrap: true },
    { key: "wireless-receiver-antenna-b", label: "Wireless Receiver Antenna B", tag: "ANT B RF", kind: "source", x: 52, y: 280, w: 30, h: 30, falseTrap: true },
    { key: "pa-speaker-output-trap", label: "PA Amp Speaker Output Trap", tag: "SPKR OUT", kind: "source", x: 635, y: 386, w: 26, h: 26, falseTrap: true },
    { key: "press-recorder-output", label: "Press Recorder Output", tag: "REC OUT", kind: "source", x: 255, y: 430, w: 26, h: 26, falseTrap: true },
    { key: "left-speaker-thru", label: "Left Speaker Thru", tag: "L THRU", kind: "source", x: 805, y: 510, w: 28, h: 28, falseTrap: true },
    { key: "right-speaker-thru", label: "Right Speaker Thru", tag: "R THRU", kind: "source", x: 915, y: 510, w: 28, h: 28, falseTrap: true },
    { key: "console-main-l-wedge-trap", label: "Main L Wedge Trap", tag: "MAIN?", kind: "source", x: 865, y: 212, w: 24, h: 24, falseTrap: true },
    { key: "console-aux-pa-trap", label: "Aux To PA Trap", tag: "AUX?", kind: "source", x: 665, y: 212, w: 24, h: 24, falseTrap: true }
  ];

  function renderLiv029DebatePanelScaffold(surface, adapter) {
    const boardWidth = 960;
    const boardHeight = 610;

    surface.innerHTML = "";
    surface.style.setProperty("position", "relative", "important");
    surface.style.setProperty("height", "min(74vh, 620px)", "important");
    surface.style.setProperty("min-height", "520px", "important");
    surface.style.setProperty("max-height", "min(74vh, 620px)", "important");
    surface.style.setProperty("display", "block", "important");
    surface.style.setProperty("overflow-y", "auto", "important");
    surface.style.setProperty("overflow-x", "auto", "important");
    surface.style.setProperty("overscroll-behavior", "contain", "important");
    surface.style.setProperty("-webkit-overflow-scrolling", "touch", "important");
    surface.style.setProperty("--sf-live-native-board-height", boardHeight + "px");
    surface.classList.add("sf-live-native-scroll-host", "sf-live-native-liv029-scroll-host");

    const layer = document.createElement("div");
    layer.className = "sf-live-native-layer sf-live-native-level-liv-029 sf-liv029-debate-panel-scaffold";
    layer.style.cssText = [
      "position:absolute",
      "left:0",
      "top:0",
      "width:" + boardWidth + "px",
      "min-width:" + boardWidth + "px",
      "height:" + boardHeight + "px",
      "min-height:" + boardHeight + "px",
      "z-index:9990",
      "pointer-events:none",
      "overflow:visible",
      "background:linear-gradient(135deg,rgba(20,22,25,.98),rgba(8,10,13,.96) 55%,rgba(22,20,14,.98))"
    ].join(";");

    const spacer = document.createElement("div");
    spacer.className = "sfLiveNativeSurfaceScrollSpacer";
    spacer.style.cssText = "height:" + (boardHeight + 40) + "px;width:" + boardWidth + "px;pointer-events:none;";
    surface.appendChild(spacer);

    function repo(src) {
      return sfRepoUrl ? sfRepoUrl(src) : src;
    }

    function addGear(key, label, src, x, y, w, extraClass, options) {
      options = options || {};
      const renderMode = options.mode || "";
      const cropFill = renderMode === "crop-fill";
      const wrap = document.createElement("div");
      wrap.className = "sf-liv029-gear " + (extraClass || "");
      wrap.dataset.sfGearId = key;
      wrap.dataset.liv029GearKey = key;
      if (renderMode) wrap.dataset.sfLiveRenderMode = renderMode;
      wrap.style.cssText = [
        "position:absolute",
        "left:" + x + "px",
        "top:" + y + "px",
        "width:" + w + "px",
        "height:" + (options.height ? options.height + "px" : "auto"),
        "z-index:80",
        "pointer-events:auto",
        "overflow:" + (cropFill ? "hidden" : "visible"),
        "filter:drop-shadow(0 14px 24px rgba(0,0,0,.72))"
      ].join(";");

      const img = document.createElement("img");
      img.src = repo(src);
      img.alt = label;
      img.draggable = false;
      img.style.cssText = cropFill
        ? [
            "display:block",
            "width:100%",
            "height:100%",
            "object-fit:cover",
            "object-position:" + (options.objectPosition || "50% 50%"),
            "pointer-events:none",
            "user-select:none"
          ].join(";")
        : options.squashToHeight
        ? [
            "display:block",
            "width:100%",
            "height:auto",
            "pointer-events:none",
            "user-select:none",
            "transform:scaleY(" + options.squashToHeight + ")",
            "transform-origin:left top"
          ].join(";")
        : "display:block;width:100%;height:auto;pointer-events:none;user-select:none;";
      wrap.appendChild(img);

      const tape = document.createElement("div");
      tape.className = "sf-liv029-gear-label";
      tape.textContent = label;
      tape.style.cssText = [
        "position:absolute",
        "left:10px",
        "top:-24px",
        "min-width:120px",
        "padding:4px 8px",
        "border-radius:5px",
        "background:rgba(12,14,16,.88)",
        "border:1px solid rgba(255,215,120,.36)",
        "color:#ffd76a",
        "font:900 11px/1.1 system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
        "letter-spacing:.08em",
        "text-transform:uppercase",
        "white-space:nowrap",
        "pointer-events:none"
      ].join(";");
      wrap.appendChild(tape);

      layer.appendChild(wrap);
      return wrap;
    }


    function addLiv029VisualCable(key, src, x, y, w, h, rotateDeg, z) {
      const cable = document.createElement("img");
      cable.setAttribute("data-liv029-visual-cable", key);
      cable.alt = "";
      cable.src = repo(src);
      cable.style.cssText = [
        "position:absolute",
        "left:" + x + "px",
        "top:" + y + "px",
        "width:" + w + "px",
        "height:" + h + "px",
        "object-fit:contain",
        "z-index:" + (z || 132),
        "transform:rotate(" + (rotateDeg || 0) + "deg)",
        "transform-origin:18px 50%",
        "pointer-events:none",
        "filter:drop-shadow(0 4px 7px rgba(0,0,0,.55))"
      ].join(";");
      layer.appendChild(cable);
      return cable;
    }

    function addTextLabel(text, x, y, w) {
      const el = document.createElement("div");
      el.textContent = text;
      el.style.cssText = [
        "position:absolute",
        "left:" + x + "px",
        "top:" + y + "px",
        "width:" + (w || 260) + "px",
        "z-index:120",
        "color:#f4e7bd",
        "font:800 13px/1.25 system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
        "letter-spacing:.02em",
        "text-shadow:0 2px 8px rgba(0,0,0,.85)",
        "pointer-events:none"
      ].join(";");
      layer.appendChild(el);
      return el;
    }

    function addPortTag(item) {
      const tag = document.createElement("div");
      tag.className = "sf-liv029-port-tag" + (item.falseTrap ? " sf-liv029-port-tag-trap" : "");
      tag.textContent = item.tag || item.label;
      tag.style.cssText = [
        "position:absolute",
        "left:" + Math.max(4, item.x - 5) + "px",
        "top:" + (item.y + item.h + 4) + "px",
        "min-width:" + Math.max(44, item.w + 16) + "px",
        "max-width:116px",
        "padding:2px 5px",
        "border-radius:4px",
        "background:" + (item.falseTrap ? "rgba(54,58,62,.72)" : "rgba(17,25,23,.92)"),
        "border:1px solid " + (item.falseTrap ? "rgba(185,190,192,.24)" : "rgba(127,255,190,.48)"),
        "color:" + (item.falseTrap ? "rgba(225,229,229,.74)" : "#baffd8"),
        "font:900 9px/1.08 system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
        "letter-spacing:.04em",
        "text-transform:uppercase",
        "text-align:center",
        "text-shadow:0 1px 5px rgba(0,0,0,.85)",
        "z-index:2550",
        "pointer-events:none",
        "white-space:normal"
      ].join(";");
      layer.appendChild(tag);
      return tag;
    }

    function addLiv029Hitbox(item) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sf-native-node sf-native-" + (item.kind === "source" ? "source" : "jack") + " sf-native-liv029-hitbox";
      if (item.falseTrap) {
        btn.className += " sf-native-liv029-false-hitbox";
        btn.dataset.sfNativeFalseJack = "1";
        btn.dataset.sfNativeHintable = "0";
      } else {
        btn.dataset.sfNativeHintable = "1";
        btn.dataset.sfNativeGoodHint = "1";
      }
      setNativeNodeDomKey(btn, item.key, item.kind || "jack");
      btn.dataset.sfNativeKey = item.key;
      btn.dataset.label = item.label;
      btn.title = item.label;
      btn.setAttribute("aria-label", item.label);

      const defaultShadow = item.falseTrap
        ? "0 0 0 1px rgba(205,210,212,.26), inset 0 0 0 2px rgba(0,0,0,.38)"
        : "0 0 0 2px rgba(123,255,190,.72), 0 0 14px rgba(123,255,190,.26), inset 0 0 0 2px rgba(0,0,0,.42)";
      const centerX = item.x + item.w / 2;
      const centerY = item.y + item.h / 2;
      btn.dataset.sfNativeDefaultShadow = defaultShadow;
      btn.dataset.sfNativePointX = String(centerX);
      btn.dataset.sfNativePointY = String(centerY);
      btn.style.cssText = [
        "position:absolute",
        "left:" + item.x + "px",
        "top:" + item.y + "px",
        "width:" + item.w + "px",
        "height:" + item.h + "px",
        "min-width:0",
        "min-height:0",
        "box-sizing:border-box",
        "padding:0",
        "margin:0",
        "border:1px solid " + (item.falseTrap ? "rgba(200,205,207,.22)" : "rgba(186,255,216,.85)"),
        "border-radius:8px",
        "background:" + (item.falseTrap ? "rgba(160,165,168,.10)" : "rgba(70,255,165,.18)"),
        "box-shadow:" + defaultShadow,
        "opacity:" + (item.falseTrap ? ".42" : ".92"),
        "z-index:2600",
        "pointer-events:auto",
        "cursor:pointer",
        "touch-action:none"
      ].join(";");

      btn.addEventListener("pointerdown", event => {
        startNativePatchDrag(layer, {
          key: item.key,
          label: item.label,
          el: btn,
          defaultShadow,
          point: pointForNativeNode(layer, btn)
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
        handleNodeClick(layer, {
          key: item.key,
          label: item.label,
          el: btn,
          defaultShadow,
          point: pointForNativeNode(layer, btn)
        });
      });

      layer.appendChild(btn);
      addPortTag(item);
      return btn;
    }

    function addPanelBox(key, label, x, y, w, h, subtitle) {
      const box = document.createElement("div");
      box.className = "sf-liv029-gear sf-liv029-panel-box";
      box.dataset.sfGearId = key;
      box.dataset.liv029GearKey = key;
      box.style.cssText = [
        "position:absolute",
        "left:" + x + "px",
        "top:" + y + "px",
        "width:" + w + "px",
        "height:" + h + "px",
        "z-index:70",
        "pointer-events:auto",
        "border:1px solid rgba(227,205,134,.42)",
        "border-radius:12px",
        "background:linear-gradient(180deg,#2d2e2a,#111311)",
        "box-shadow:0 18px 34px rgba(0,0,0,.66), inset 0 0 18px rgba(255,230,150,.05)"
      ].join(";");

      const title = document.createElement("div");
      title.textContent = label;
      title.style.cssText = [
        "position:absolute",
        "left:14px",
        "top:12px",
        "right:14px",
        "color:#ffd76a",
        "font:1000 14px/1.1 system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
        "letter-spacing:.10em",
        "text-transform:uppercase"
      ].join(";");
      box.appendChild(title);

      const sub = document.createElement("div");
      sub.textContent = subtitle || "";
      sub.style.cssText = [
        "position:absolute",
        "left:14px",
        "top:38px",
        "right:14px",
        "color:#d7cda5",
        "font:800 11px/1.25 system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
        "letter-spacing:.05em",
        "text-transform:uppercase"
      ].join(";");
      box.appendChild(sub);

      layer.appendChild(box);
      return box;
    }

    addTextLabel("Debate Panel Signal Flow: route wireless audio through the console before distributing PA, press, and moderator monitor feeds.", 34, 26, 760);

    const liv029GearBakedSizeStyle = document.createElement("style");
    liv029GearBakedSizeStyle.textContent = [
      '.sf-live-native-level-liv-029 [data-sf-gear-id="liv029-wireless-rack"]{height:190px!important;}',
      '.sf-live-native-level-liv-029 [data-sf-gear-id="liv029-event-console"]{height:250px!important;}',
      '.sf-live-native-level-liv-029 [data-sf-gear-id="liv029-pa-processor-amp"]{height:100px!important;}',
      '.sf-live-native-level-liv-029 [data-sf-gear-id="liv029-left-speaker"]{height:205px!important;}',
      '.sf-live-native-level-liv-029 [data-sf-gear-id="liv029-right-speaker"]{height:205px!important;}',
      '.sf-live-native-level-liv-029 [data-sf-gear-id="liv029-press-recorder"]{height:80px!important;}',
      '.sf-live-native-level-liv-029 [data-sf-gear-id="liv029-moderator-wedge"]{height:115px!important;}',
      '.sf-live-native-level-liv-029 [data-sf-gear-id]:not([data-sf-gear-id="liv029-event-console"]) > img{width:100%!important;height:100%!important;object-fit:contain!important;}',
      '.sf-live-native-level-liv-029 [data-sf-gear-id="liv029-event-console"][data-sf-live-render-mode="crop-fill"] > img{width:100%!important;height:100%!important;object-fit:cover!important;object-position:50% 54%!important;transform:none!important;}'
    ].join("\n");
    layer.appendChild(liv029GearBakedSizeStyle);


    addGear(
      "liv029-wireless-rack",
      "4-Channel Wireless Receiver Rack",
      "/assets/live-sound/svg/hardware/wireless-receiver-panel-animated-aligned.svg",
      35,
      125,
      285,
      "sf-liv029-wireless-rack"
    );

    const consoleBox = addGear(
      "liv029-event-console",
      "FOH Console",
      "/assets/live-sound/svg/hardware/16ch FOH console0.svg",
      340,
      55,
      570,
      "sf-liv029-event-console",
      { height: 250, mode: "crop-fill", objectPosition: "50% 54%" }
    );

    const roomPaProcessor = addGear(
      "liv029-pa-processor-amp",
      "PA Processor / Amp Rack",
      "/assets/live-sound/svg/hardware/power-amp-liv010-high.svg",
      360,
      345,
      280,
      "sf-liv029-pa-processor-amp"
    );

    addGear(
      "liv029-left-speaker",
      "Left Speaker",
      "/assets/live-sound/svg/hardware/line-array-liv010-left-image.svg",
      735,
      330,
      95,
      "sf-liv029-left-speaker",
      { height: 205 }
    );

    addGear(
      "liv029-right-speaker",
      "Right Speaker",
      "/assets/live-sound/svg/hardware/line-array-liv010-right-image.svg",
      850,
      330,
      95,
      "sf-liv029-right-speaker",
      { height: 205 }
    );

    addGear(
      "liv029-press-recorder",
      "Press / Recorder Feed Box",
      "/assets/live-sound/svg/hardware/iem-feed-liv007-station-a.svg",
      50,
      395,
      270,
      "sf-liv029-press-recorder"
    );

    addGear(
      "liv029-moderator-wedge",
      "Moderator Wedge",
      "/assets/build-room/svg/gear/stage monitor.svg",
      660,
      470,
      210,
      "sf-liv029-moderator-wedge",
      { height: 115 }
    );

    addTextLabel("RF antenna jacks are traps, not audio outputs.", 38, 334, 300);
    addTextLabel("CONSOLE INPUTS 1-4", 390, 174, 170);
    addTextLabel("AUX / RECORD / MAIN OUTS", 625, 174, 260);
    addTextLabel("PRESS / RECORD FEED", 72, 370, 230);
    addTextLabel("PA PROCESSOR / AMP PATH", 380, 322, 270);
    addTextLabel("LEFT / RIGHT PA SPEAKERS", 722, 304, 230);
    addTextLabel("MODERATOR MONITOR", 658, 448, 230);

    surface.appendChild(layer);
    LIV029_HITBOXES.forEach(addLiv029Hitbox);

    updateNativeHintHighlights();

    console.log("[Signal Flow] LIV-029 debate panel gear scaffold mounted v6r662requiredhintorder", {
      gear: layer.querySelectorAll("[data-sf-gear-id]").length,
      hitboxes: layer.querySelectorAll(".sf-native-liv029-hitbox").length,
      boardWidth,
      boardHeight
    });
  }


  function renderLiv028VisualScaffold(surface, adapter) {
    const level = buildLevelGeometry(surface);
    const rect = level.rect;
    const nativeRect = surface.getBoundingClientRect();
    const scaffoldPadding = 180;
    const offsetPadding = 80;
    const extents = [...LIV028_VISUAL_ITEMS, ...LIV028_NORMALLED_CABLES].reduce((acc, node) => {
      const left = Number(node.leftPx || 0);
      const top = Number(node.topPx || 0);
      const width = Math.max(1, Number(node.widthPx || 80));
      const height = Math.max(1, Number(node.heightPx || (node.src ? 80 : 24)));
      acc.minX = Math.min(acc.minX, left);
      acc.minY = Math.min(acc.minY, top);
      acc.maxX = Math.max(acc.maxX, left + width);
      acc.maxY = Math.max(acc.maxY, top + height);
      return acc;
    }, { minX: 0, minY: 0, maxX: 0, maxY: 0 });
    const rawMinX = Math.floor(extents.minX);
    const rawMinY = Math.floor(extents.minY);
    const rawMaxX = Math.ceil(extents.maxX);
    const rawMaxY = Math.ceil(extents.maxY);
    const liv028OffsetX = rawMinX < 0 ? Math.ceil(-rawMinX + offsetPadding) : 0;
    const liv028OffsetY = rawMinY < 0 ? Math.ceil(-rawMinY + offsetPadding) : 0;
    const boardWidth = Math.max(
      900,
      Math.ceil(rect.width || nativeRect.width || 900),
      rawMaxX + liv028OffsetX + scaffoldPadding
    );
    const boardHeight = Math.max(
      900,
      rawMaxY + liv028OffsetY + scaffoldPadding
    );
    const liv028Left = value => Math.round(Number(value || 0) + liv028OffsetX);
    const liv028Top = value => Math.round(Number(value || 0) + liv028OffsetY);
    const liv028AmpTapeLayout = {
      powerAmp1: { relX: 150, relY: 38, widthPx: 78, heightPx: 30 },
      powerAmp2: { relX: 128, relY: 38, widthPx: 78, heightPx: 29 },
      powerAmp3: { relX: 128, relY: 38, widthPx: 118, heightPx: 30 }
    };
    const liv028AmpTapeLogs = [];

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    surface.querySelectorAll(".sfLiveNativeSurfaceScrollSpacer").forEach(el => el.remove());
    surface.classList.add("sf-live-native-scroll-host");
    surface.style.setProperty("--sf-live-native-board-height", boardHeight + "px");
    applyNativeViewportContract(surface, boardHeight);

    const viewport = surface.closest(".sf-live-native-viewport") || surface.parentElement;
    function applyLiv028ScrollContract() {
      surface.style.setProperty("overflow", "auto", "important");
      surface.style.setProperty("overflow-x", "auto", "important");
      surface.style.setProperty("overflow-y", "auto", "important");
      surface.style.setProperty("width", "100%", "important");
      surface.style.setProperty("max-width", "100%", "important");
      surface.style.removeProperty("min-width");
      surface.style.setProperty("-webkit-overflow-scrolling", "touch");
      surface.style.setProperty("overflow-anchor", "none", "important");
      if (viewport && viewport !== surface) {
        viewport.style.setProperty("overflow", "auto", "important");
        viewport.style.setProperty("overflow-x", "auto", "important");
        viewport.style.setProperty("overflow-y", "auto", "important");
        viewport.style.setProperty("-webkit-overflow-scrolling", "touch");
      }
    }
    applyLiv028ScrollContract();

    const layer = document.createElement("div");
    layer.className = "sf-live-native-layer sf-live-native-level-liv-028 sf-liv028-visual-scaffold";
    layer.style.cssText = [
      "position:absolute",
      "left:0",
      "top:0",
      "width:" + boardWidth + "px",
      "height:" + boardHeight + "px",
      "min-height:" + boardHeight + "px",
      "z-index:9990",
      "isolation:isolate",
      "pointer-events:none",
      "overflow:hidden",
      "border-radius:16px",
      "background:linear-gradient(180deg,rgba(8,24,19,.96),rgba(6,17,15,.98))"
    ].join(";");

    const title = document.createElement("div");
    title.textContent = "LIV-028 PLACED GEAR SCAFFOLD - NO GAMEPLAY HITBOXES";
    title.style.cssText = [
      "position:absolute",
      "left:16px",
      "top:8px",
      "z-index:4000",
      "color:#ffe66c",
      "font:900 12px system-ui,-apple-system,Segoe UI,sans-serif",
      "letter-spacing:.08em",
      "text-transform:uppercase",
      "text-shadow:0 2px 4px rgba(0,0,0,.75)",
      "pointer-events:none"
    ].join(";");
    layer.appendChild(title);

    LIV028_VISUAL_ITEMS.forEach(item => {
      const isLabel = item.tagName === "div" || !item.src;
      const el = isLabel ? document.createElement("div") : document.createElement("img");
      el.dataset.liv028VisualKey = item.key;
      if (!isLabel) {
        el.dataset.sfGearId = item.key;
        el.dataset.sfLiveDevGearKey = item.key;
      }
      el.className = "sf-liv028-visual-item " + (item.className || "");

      el.style.cssText = [
        "position:absolute",
        "left:" + liv028Left(item.leftPx) + "px",
        "top:" + liv028Top(item.topPx) + "px",
        "width:" + Math.round(item.widthPx || 80) + "px",
        "z-index:" + Math.round(item.zIndex || 100),
        "pointer-events:none",
        "box-sizing:border-box"
      ].join(";");

      if (isLabel) {
        el.textContent = item.text || item.key;
        el.style.setProperty("color", "#ffe66c");
        el.style.setProperty("font", "900 10px system-ui,-apple-system,Segoe UI,sans-serif");
        el.style.setProperty("letter-spacing", ".05em");
        el.style.setProperty("text-transform", "uppercase");
        el.style.setProperty("text-align", "center");
        el.style.setProperty("text-shadow", "0 2px 4px rgba(0,0,0,.78)");
        el.style.setProperty("background", "rgba(0,0,0,.38)");
        el.style.setProperty("border-radius", "4px");
        el.style.setProperty("padding", "2px 4px");
      } else {
        el.src = sfRepoUrl(item.src);
        el.alt = item.alt || item.key;
        el.style.setProperty("display", "block");
        el.style.setProperty("height", "auto");
        el.style.setProperty("object-fit", "contain");
        el.style.setProperty("filter", "drop-shadow(0 10px 18px rgba(0,0,0,.62))");
      }

      layer.appendChild(el);

      if (!isLabel && item.label) {
        const badge = document.createElement("div");
        badge.textContent = item.label;
        badge.dataset.liv028GearLabelFor = item.key;
        const isLiv028AmpTapeLabel = /power[-_]?amp|powerAmp/i.test(item.key || "");
        const tapeLayout = isLiv028AmpTapeLabel ? liv028AmpTapeLayout[item.key] : null;
        const tapeLeft = tapeLayout ? liv028Left(Number(item.leftPx || 0) + tapeLayout.relX) : 0;
        const tapeTop = tapeLayout ? liv028Top(Number(item.topPx || 0) + tapeLayout.relY) : 0;
        const tapeWidth = tapeLayout ? tapeLayout.widthPx : 118;
        const tapeHeight = tapeLayout ? tapeLayout.heightPx : 30;
        badge.className = "sf-liv028-dev-gear-label" + (isLiv028AmpTapeLabel ? " sf-liv028-amp-tape-label" : "");
        badge.style.cssText = isLiv028AmpTapeLabel ? [
          "position:absolute",
          "left:" + tapeLeft + "px",
          "top:" + tapeTop + "px",
          "width:" + tapeWidth + "px",
          "height:" + tapeHeight + "px",
          "z-index:" + Math.round((item.zIndex || 100) + 35),
          "pointer-events:none",
          "box-sizing:border-box",
          "color:#111111",
          "font:900 14px system-ui,-apple-system,Segoe UI,sans-serif",
          "letter-spacing:.03em",
          "text-transform:none",
          "text-align:center",
          "text-shadow:0 1px 0 rgba(255,255,255,.35)",
          "background:linear-gradient(180deg,#f2e9c9,#e1d4ad)",
          "border:1px solid rgba(74,55,24,.45)",
          "border-radius:2px",
          "padding:4px 8px 5px",
          "box-shadow:0 4px 8px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.55)",
          "transform:rotate(-1deg)"
        ].join(";") : [
          "position:absolute",
          "left:" + liv028Left(item.leftPx) + "px",
          "top:" + liv028Top(Number(item.topPx || 0) + 4) + "px",
          "width:" + Math.round(item.widthPx || 80) + "px",
          "z-index:" + Math.round((item.zIndex || 100) + 20),
          "pointer-events:none",
          "box-sizing:border-box",
          "color:#ffe66c",
          "font:900 10px system-ui,-apple-system,Segoe UI,sans-serif",
          "letter-spacing:.05em",
          "text-transform:uppercase",
          "text-align:center",
          "text-shadow:0 2px 4px rgba(0,0,0,.78)",
          "background:rgba(0,0,0,.40)",
          "border-radius:4px",
          "padding:2px 4px"
        ].join(";");
        layer.appendChild(badge);
        if (isLiv028AmpTapeLabel) {
          liv028AmpTapeLogs.push({
            key: item.key,
            left: badge.style.left,
            top: badge.style.top,
            width: badge.style.width,
            text: badge.textContent
          });
        }
      }
    });
    console.log("[Signal Flow] LIV-028 amp tape labels", liv028AmpTapeLogs);

    LIV028_NORMALLED_CABLES.forEach(cable => {
      const img = document.createElement("img");
      img.dataset.liv028NormalledCableKey = cable.key;
      img.className = "sf-liv028-normalled-cable";
      img.src = sfRepoUrl(cable.src);
      img.alt = cable.alt || cable.key;
      img.style.cssText = [
        "position:absolute",
        "left:" + liv028Left(cable.leftPx) + "px",
        "top:" + liv028Top(cable.topPx) + "px",
        "width:" + Math.round(cable.widthPx || 120) + "px",
        "height:auto",
        "z-index:" + Math.round(cable.zIndex || 1000),
        "opacity:" + (Number.isFinite(Number(cable.opacity)) ? Number(cable.opacity) : 1),
        "transform:rotate(" + (Number(cable.rotateDeg) || 0) + "deg)",
        "transform-origin:left center",
        "pointer-events:none",
        "filter:drop-shadow(0 8px 10px rgba(0,0,0,.55))"
      ].join(";");
      layer.appendChild(img);
    });

    LIV028_TRUE_HITBOXES.forEach(hitbox => {
      const btn = document.createElement("button");
      const exportedClassName = String(hitbox.className || "");
      const isSourceHitbox = exportedClassName.indexOf("sf-native-source") !== -1;
      const isJackHitbox = exportedClassName.indexOf("sf-native-jack") !== -1;
      const nodeKind = isSourceHitbox ? "source" : "jack";
      const resolvedEndpoint = liv028EndpointLabelForNodeKey(hitbox.key);
      const defaultShadow = "none";
      const point = {
        x: Math.round((hitbox.leftPx || 0) + (hitbox.widthPx || 24) / 2),
        y: Math.round((hitbox.topPx || 0) + (hitbox.heightPx || 24) / 2)
      };
      btn.type = "button";
      btn.className = [
        exportedClassName,
        exportedClassName.indexOf("sf-native-node") === -1 ? "sf-native-node" : "",
        exportedClassName.indexOf("sf-native-liv028-true-hitbox") === -1 ? "sf-native-liv028-true-hitbox" : "",
        !isSourceHitbox && !isJackHitbox ? "sf-native-jack" : ""
      ].filter(Boolean).join(" ");
      setNativeNodeDomKey(btn, hitbox.key, nodeKind);
      btn.dataset.sfNativeKey = hitbox.key;
      btn.dataset.sfNativeDefaultShadow = defaultShadow;
      btn.dataset.sfNativePointX = String(point.x);
      btn.dataset.sfNativePointY = String(point.y);
      btn.dataset.liv028RouteEndpoint = resolvedEndpoint;
      btn.dataset.liv028TrueHitbox = "1";
      btn.dataset.nodeKind = nodeKind;
      btn.setAttribute("aria-label", resolvedEndpoint);
      btn.title = resolvedEndpoint;
      btn.style.cssText = [
        "position:absolute",
        "left:" + Math.round(hitbox.leftPx || 0) + "px",
        "top:" + Math.round(hitbox.topPx || 0) + "px",
        "width:" + Math.round(hitbox.widthPx || 24) + "px",
        "height:" + Math.round(hitbox.heightPx || 24) + "px",
        "min-width:0",
        "min-height:0",
        "max-width:none",
        "max-height:none",
        "box-sizing:border-box",
        "padding:0",
        "margin:0",
        "line-height:0",
        "appearance:none",
        "-webkit-appearance:none",
        "border:1px solid rgba(0,229,255,.58)",
        "border-radius:4px",
        "background:rgba(0,229,255,.10)",
        "outline:1px dashed rgba(0,229,255,.65)",
        "outline-offset:1px",
        "color:transparent",
        "font-size:0",
        "text-indent:-9999px",
        "overflow:hidden",
        "z-index:5200",
        "pointer-events:auto",
        "cursor:crosshair"
      ].join(";");
      btn.addEventListener("pointerdown", event => {
        console.log("[Signal Flow] LIV-028 true hitbox selected", {
          key: hitbox.key,
          resolvedRouteEndpoint: resolvedEndpoint
        });
        startNativePatchDrag(layer, {
          key: hitbox.key,
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

        console.log("[Signal Flow] LIV-028 true hitbox selected", {
          key: hitbox.key,
          resolvedRouteEndpoint: resolvedEndpoint
        });
        handleNodeClick(layer, {
          key: hitbox.key,
          el: btn,
          defaultShadow,
          point
        });
      });
      layer.appendChild(btn);
    });

    // Runtime player-facing state: true hitboxes remain active but invisible.
    layer.querySelectorAll(".sf-native-liv028-true-hitbox").forEach(el => {
      el.style.setProperty("background", "transparent", "important");
      el.style.setProperty("border", "0", "important");
      el.style.setProperty("outline", "0", "important");
      el.style.setProperty("box-shadow", "none", "important");
      el.style.setProperty("opacity", "1", "important");
      el.style.setProperty("pointer-events", "auto", "important");
      el.style.setProperty("cursor", "pointer", "important");
    });

    console.log("[Signal Flow] LIV-028 true hitboxes mounted", {
      count: LIV028_TRUE_HITBOXES.length,
      nodeKeys: LIV028_TRUE_HITBOXES.map(hitbox => hitbox.key)
    });

    surface.appendChild(layer);

    const spacer = document.createElement("div");
    spacer.className = "sfLiveNativeSurfaceScrollSpacer sf-liv028-scroll-spacer";
    spacer.style.cssText = [
      "position:absolute",
      "left:0",
      "top:0",
      "width:" + boardWidth + "px",
      "min-width:" + boardWidth + "px",
      "height:" + boardHeight + "px",
      "min-height:" + boardHeight + "px",
      "pointer-events:none",
      "opacity:0"
    ].join(";");
    surface.appendChild(spacer);
    applyLiv028ScrollContract();

    function resetLiv028ScrollOrigin() {
      surface.scrollLeft = 0;
      surface.scrollTop = 0;
      if (viewport && viewport !== surface) {
        viewport.scrollLeft = 0;
        viewport.scrollTop = 0;
      }
    }

    resetLiv028ScrollOrigin();
    requestAnimationFrame(() => {
      applyLiv028ScrollContract();
      resetLiv028ScrollOrigin();
    });
    setTimeout(() => {
      applyLiv028ScrollContract();
      resetLiv028ScrollOrigin();
    }, 120);
    setTimeout(resetLiv028ScrollOrigin, 360);
    setTimeout(resetLiv028ScrollOrigin, 800);

    if (!surface.dataset.liv028HorizontalKeysInstalled) {
      surface.dataset.liv028HorizontalKeysInstalled = "1";
      surface.tabIndex = surface.tabIndex >= 0 ? surface.tabIndex : 0;
      surface.addEventListener("keydown", event => {
        if (LEVEL_ID !== "LIV-028") return;
        if (event.key === "ArrowRight") {
          surface.scrollLeft += 80;
          event.preventDefault();
        } else if (event.key === "ArrowLeft") {
          surface.scrollLeft -= 80;
          event.preventDefault();
        }
      });
    }


    // LIV-028 false/trap hitboxes - dev-visible placement pass.
    // Keep separate from true route endpoints. These should never complete checklist items.
    const LIV028_FALSE_HITBOX_LAYOUT = [
      { key: "liv028-false-balcony-a-spare", leftPx: 855, topPx: 295, widthPx: 24, heightPx: 24 },
      { key: "liv028-false-balcony-b-spare", leftPx: 812, topPx: 295, widthPx: 24, heightPx: 24 },
      { key: "liv028-false-balcony-center-spare-1", leftPx: 772, topPx: 295, widthPx: 24, heightPx: 24 },
      { key: "liv028-false-balcony-center-spare-2", leftPx: 731, topPx: 295, widthPx: 24, heightPx: 24 },
      { key: "liv028-false-broadcast-a-extra", leftPx: 348, topPx: 379, widthPx: 22, heightPx: 22 },
      { key: "liv028-false-broadcast-b-extra", leftPx: 380, topPx: 379, widthPx: 22, heightPx: 22 },
      { key: "liv028-false-crossover-thru-l", leftPx: 749, topPx: 504, widthPx: 15, heightPx: 15 },
      { key: "liv028-false-crossover-thru-r", leftPx: 770, topPx: 503, widthPx: 17, heightPx: 17 },
      { key: "liv028-false-foh-line-in-1", leftPx: 904, topPx: 108, widthPx: 17, heightPx: 17 },
      { key: "liv028-false-foh-line-in-2", leftPx: 927, topPx: 106, widthPx: 22, heightPx: 22 },
      { key: "liv028-false-foh-line-in-3", leftPx: 955, topPx: 106, widthPx: 22, heightPx: 22 },
      { key: "liv028-false-foh-line-in-4", leftPx: 980, topPx: 106, widthPx: 22, heightPx: 22 },
      { key: "liv028-false-foh-main-alt-l", leftPx: 1065, topPx: 60, widthPx: 28, heightPx: 28 },
      { key: "liv028-false-foh-main-alt-r", leftPx: 1064, topPx: 102, widthPx: 28, heightPx: 28 },
      { key: "liv028-false-iem-a-phones", leftPx: 963, topPx: 483, widthPx: 15, heightPx: 15 },
      { key: "liv028-false-iem-b-phones", leftPx: 992, topPx: 483, widthPx: 15, heightPx: 15 },
      { key: "liv028-false-iem-c-phones", leftPx: 978, topPx: 504, widthPx: 15, heightPx: 15 },
      { key: "liv028-false-iem-d-phones", leftPx: 1008, topPx: 504, widthPx: 15, heightPx: 15 },
      { key: "liv028-false-bus-input-10", leftPx: 835, topPx: 502, widthPx: 20, heightPx: 20 },
      { key: "liv028-false-bus-input-9", leftPx: 858, topPx: 502, widthPx: 20, heightPx: 20 },
      { key: "liv028-false-bus-out-4a", leftPx: 936, topPx: 479, widthPx: 20, heightPx: 20 },
      { key: "liv028-false-bus-out-4b", leftPx: 889, topPx: 502, widthPx: 20, heightPx: 20 },
      { key: "liv028-false-recording-extra-l", leftPx: 412, topPx: 379, widthPx: 22, heightPx: 22 },
      { key: "liv028-false-recording-extra-r", leftPx: 445, topPx: 378, widthPx: 22, heightPx: 22 },
      { key: "liv028-false-splitter-extra-1", leftPx: 478, topPx: 378, widthPx: 22, heightPx: 22 },
      { key: "liv028-false-splitter-extra-2", leftPx: 510, topPx: 378, widthPx: 22, heightPx: 22 },
      { key: "liv028-false-splitter-extra-3", leftPx: 911, topPx: 501, widthPx: 22, heightPx: 22 },
      { key: "liv028-false-splitter-extra-4", leftPx: 936, topPx: 503, widthPx: 17, heightPx: 17 },
      { key: "liv028-false-stage-box-input-10", leftPx: 822, topPx: 105, widthPx: 22, heightPx: 22 },
      { key: "liv028-false-stage-box-input-11", leftPx: 849, topPx: 105, widthPx: 22, heightPx: 22 },
      { key: "liv028-false-stage-box-input-12", leftPx: 875, topPx: 105, widthPx: 22, heightPx: 22 },
      { key: "liv028-false-stage-box-input-3", leftPx: 849, topPx: 62, widthPx: 22, heightPx: 22 },
      { key: "liv028-false-stage-box-input-4", leftPx: 875, topPx: 62, widthPx: 22, heightPx: 22 },
      { key: "liv028-false-stage-box-input-5", leftPx: 902, topPx: 62, widthPx: 22, heightPx: 22 },
      { key: "liv028-false-stage-box-input-6", leftPx: 928, topPx: 62, widthPx: 22, heightPx: 22 },
      { key: "liv028-false-stage-box-input-9", leftPx: 795, topPx: 105, widthPx: 22, heightPx: 22 }
    ];


    // LIV-028 dual rack backing panels, modeled after the LIV-023 CSS/DOM rack-box treatment.
    // Visual-only. Sits behind hardware; hitboxes, routes, and cables stay unchanged.
    function addLiv028RackBackingPanel(opts) {
      const rack = document.createElement("div");
      rack.className = "sf-liv028-rack-backing-panel";
      rack.setAttribute("aria-hidden", "true");
      rack.style.cssText = [
        "position:absolute",
        "left:" + opts.left + "px",
        "top:" + opts.top + "px",
        "width:" + opts.width + "px",
        "height:" + opts.height + "px",
        "z-index:70",
        "pointer-events:none",
        "border-radius:18px",
        "background:linear-gradient(180deg, rgba(25,28,34,.96), rgba(9,11,15,.98))",
        "border:1px solid rgba(255,255,255,.18)",
        "box-shadow:inset 0 0 0 2px rgba(0,0,0,.72), inset 0 18px 28px rgba(255,255,255,.055), 0 18px 34px rgba(0,0,0,.42)",
        "overflow:hidden"
      ].join(";");

      const grill = document.createElement("div");
      grill.style.cssText = [
        "position:absolute",
        "left:34px",
        "right:34px",
        "top:14px",
        "bottom:14px",
        "border-radius:12px",
        "background:repeating-linear-gradient(180deg, rgba(255,255,255,.045) 0, rgba(255,255,255,.045) 2px, transparent 2px, transparent 24px)",
        "opacity:.75"
      ].join(";");

      const railLeft = document.createElement("div");
      railLeft.style.cssText = [
        "position:absolute",
        "left:12px",
        "top:10px",
        "bottom:10px",
        "width:14px",
        "border-radius:8px",
        "background:linear-gradient(180deg, rgba(0,0,0,.76), rgba(42,45,52,.92), rgba(0,0,0,.78))",
        "box-shadow:inset 0 0 0 1px rgba(255,255,255,.10)"
      ].join(";");

      const railRight = railLeft.cloneNode(false);
      railRight.style.left = "auto";
      railRight.style.right = "12px";

      const label = document.createElement("div");
      label.textContent = opts.label;
      label.style.cssText = [
        "position:absolute",
        "left:46px",
        "right:46px",
        "top:18px",
        "height:20px",
        "display:flex",
        "align-items:center",
        "justify-content:center",
        "border-radius:8px",
        "background:rgba(255,255,255,.08)",
        "color:rgba(255,255,255,.76)",
        "font:700 10px system-ui,-apple-system,Segoe UI,sans-serif",
        "letter-spacing:.08em",
        "text-transform:uppercase"
      ].join(";");

      for (let y = 48; y <= opts.height - 42; y += 48) {
        const line = document.createElement("div");
        line.style.cssText = [
          "position:absolute",
          "left:34px",
          "right:34px",
          "top:" + y + "px",
          "height:1px",
          "background:rgba(255,255,255,.11)",
          "box-shadow:0 1px 0 rgba(0,0,0,.65)"
        ].join(";");
        rack.appendChild(line);
      }

      rack.appendChild(grill);
      rack.appendChild(railLeft);
      rack.appendChild(railRight);
      rack.appendChild(label);
      layer.appendChild(rack);
      return rack;
    }

    addLiv028RackBackingPanel({
      label: "SPLIT / IEM RACK",
      left: 190,
      top: 350,
      width: 500,
      height: 320
    });

    addLiv028RackBackingPanel({
      label: "PROCESSING / AMP RACK",
      left: 665,
      top: 350,
      width: 390,
      height: 500
    });


    LIV028_FALSE_HITBOX_LAYOUT.forEach(point => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sf-native-node sf-native-liv028-false-hitbox sf-native-jack";
      btn.dataset.nodeKey = point.key;
      btn.dataset.sfNativeKey = point.key;
      btn.dataset.key = point.key;
      btn.dataset.nodeKind = "jack";
      btn.setAttribute("aria-label", point.key.replace(/^liv028-false-/, "False "));
      btn.style.cssText = [
        "position:absolute",
        "left:" + point.leftPx + "px",
        "top:" + point.topPx + "px",
        "width:" + point.widthPx + "px",
        "height:" + point.heightPx + "px",
        "z-index:950",
        "pointer-events:auto",
        "cursor:pointer",
        "box-sizing:border-box",
        "min-width:0",
        "min-height:0",
        "max-width:none",
        "max-height:none",
        "padding:0",
        "margin:0",
        "line-height:0",
        "appearance:none",
        "-webkit-appearance:none",
        "border:0",
        "border-radius:50%",
        "background:transparent",
        "outline:0",
        "box-shadow:none"
      ].join(";");
      layer.appendChild(btn);
    });

    console.log("[Signal Flow] LIV-028 false hitboxes mounted", {
      count: LIV028_FALSE_HITBOX_LAYOUT.length,
      nodeKeys: LIV028_FALSE_HITBOX_LAYOUT.map(point => point.key)
    });


    console.log("[Signal Flow] LIV-028 full gear dev scaffold mounted", {
      items: LIV028_VISUAL_ITEMS.length,
      normalledCables: LIV028_NORMALLED_CABLES.length,
      rawMinX,
      rawMaxX,
      rawMinY,
      rawMaxY,
      liv028OffsetX,
      liv028OffsetY,
      boardWidth,
      boardHeight
    });
  }


  function renderNative(surface, adapter) {
    if (LEVEL_ID === "LIV-029") {
      renderLiv029DebatePanelScaffold(surface, adapter);
      return;
    }

    if (LEVEL_ID === "LIV-028") {
      renderLiv028VisualScaffold(surface, adapter);
      return;
    }

    if (LEVEL_ID === "LIV-026") {
      renderLiv026ComplexZones(surface, adapter);
      return;
    }

    if (LEVEL_ID === "LIV-023") {
      renderLiv023MonitorConsoleStereoPa(surface, adapter);
      return;
    }

    if (LEVEL_ID === "LIV-016") {
      renderLiv016FullBandPngBoard(surface, adapter);
      return;
    }

    if (isLivProcessingFamilyLevel()) {
      renderLivProcessingFamily(surface, adapter);
      return;
    }

    if (LEVEL_ID === "LIV-019") {
      renderLiv019IemFxFromLiv009Layout(surface, adapter);
      return;
    }

    if (LEVEL_ID === "LIV-009") {
      renderLiv009DrumStageInputs(surface, adapter);
      return;
    }

    if (LEVEL_ID === "LIV-021") {
      renderLiv021VocalInsertDevScaffold(surface, adapter);
      return;
    }

    if (LEVEL_ID === "LIV-020" || LEVEL_ID === "LIV-021") {
      renderLiv020MainPaAndIem(surface, adapter);
      sfLiv020ApplyLabelJsonLock("after-renderLiv020MainPaAndIem");
      sfLiv020NormalizeNeutralJackRings("after-renderLiv020MainPaAndIem");
      setTimeout(() => {
        sfLiv020ApplyLabelJsonLock("after-renderLiv020MainPaAndIem-timeout-0");
        sfLiv020NormalizeNeutralJackRings("after-renderLiv020MainPaAndIem-timeout-0");
      }, 0);
      setTimeout(() => {
        sfLiv020ApplyLabelJsonLock("after-renderLiv020MainPaAndIem-timeout-100");
        sfLiv020NormalizeNeutralJackRings("after-renderLiv020MainPaAndIem-timeout-100");
      }, 100);
      setTimeout(() => {
        sfLiv020ApplyLabelJsonLock("after-renderLiv020MainPaAndIem-timeout-500");
        sfLiv020NormalizeNeutralJackRings("after-renderLiv020MainPaAndIem-timeout-500");
      }, 500);
      return;
    }

    if (LEVEL_ID === "LIV-010") {
      renderLiv010ThreeWayCrossover(surface, adapter);
      return;
    }

    const level = buildLevelGeometry(surface);
    const boardHeight = Math.ceil(level.rect.height);

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    surface.querySelectorAll(".sfLiveNativeSurfaceScrollSpacer").forEach(el => el.remove());

    const needsNativeScroll = LEVEL_ID === "LIV-011" || LEVEL_ID === "LIV-028";
    if (needsNativeScroll) {
      surface.classList.add("sf-live-native-scroll-host");
      surface.style.setProperty("overflow-y", "auto", "important");
      surface.style.setProperty("overflow-x", "hidden", "important");
      surface.style.setProperty("--sf-live-native-board-height", boardHeight + "px");
    } else {
      surface.classList.remove("sf-live-native-scroll-host");
      surface.style.removeProperty("--sf-live-native-board-height");
    }

    applyNativeViewportContract(surface, boardHeight);

    const layer = document.createElement("div");
    layer.className = "sf-live-native-layer";
    layer.classList.add("sf-live-native-level-" + LEVEL_ID.toLowerCase());
    layer.style.cssText = [
      "position:absolute",
      "left:0",
      "top:0",
      "right:0",
      "height:" + boardHeight + "px",
      "min-height:" + boardHeight + "px",
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
    if (panelKinds.has("foh") && !["LIV-003", "LIV-006", "LIV-007"].includes(LEVEL_ID)) {
      createLabel(layer, "FOH CONSOLE", level.rect.width * 0.40, level.rect.height * 0.10, 11);
    }
    if (panelKinds.has("amp") && LEVEL_ID !== "LIV-006") {
      if (LEVEL_ID === "LIV-011") {
        createLabel(layer, LEVEL.processorLabel || "CROSSOVER", level.rect.width * 0.405, level.rect.height * 0.375, 12);
      } else {
        createLabel(layer, LEVEL.processorLabel || "SYSTEM PROCESSOR / SUB", (LEVEL_ID === "LIV-028" ? level.rect.width * 0.51 : level.rect.width * 0.46), (LEVEL_ID === "LIV-028" ? level.rect.height * 0.55 : level.rect.height * 0.47), 11);
      }
    }
    if (panelKinds.has("monitor")) {
      if (LEVEL_ID === "LIV-011") {
        createLabel(layer, LEVEL.processorLabel || "CROSSOVER", level.rect.width * 0.405, level.rect.height * 0.375, 12);
      } else {
        createLabel(layer, LEVEL.processorLabel || "VOCAL WEDGE", level.rect.width * 0.52, level.rect.height * 0.51, 11);
      }
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
    if (needsNativeScroll) {
      const spacer = document.createElement("div");
      spacer.className = "sfLiveNativeSurfaceScrollSpacer";
      spacer.style.cssText = "position:relative;display:block;width:1px;opacity:0;pointer-events:none";
      spacer.style.setProperty("min-height", boardHeight + "px", "important");
      spacer.style.setProperty("height", boardHeight + "px", "important");
      surface.appendChild(spacer);
    }
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



  function installLiv025StealthHitboxStyle() {
    if (document.getElementById("sf-liv025-stealth-hitbox-style")) return;

    const style = document.createElement("style");
    style.id = "sf-liv025-stealth-hitbox-style";
    style.textContent = `
      .sf-live-native-level-liv-025 .sf-native-liv025-stealth-hitbox {
        opacity: 0.01 !important;
        background: transparent !important;
        border-color: transparent !important;
        box-shadow: none !important;
        outline: none !important;
      }

      .sf-live-native-level-liv-025 .sf-native-liv025-stealth-hitbox:hover,
      .sf-live-native-level-liv-025 .sf-native-liv025-stealth-hitbox:focus,
      .sf-live-native-level-liv-025 .sf-native-liv025-stealth-hitbox:active {
        opacity: 0.01 !important;
        background: transparent !important;
        border-color: transparent !important;
        box-shadow: none !important;
        outline: none !important;
      }

      .sf-live-native-level-liv-025.sf-native-hints-visible .sf-native-liv025-stealth-hitbox,
      .sf-native-hints-visible .sf-live-native-level-liv-025 .sf-native-liv025-stealth-hitbox {
        opacity: 1 !important;
        box-shadow: 0 0 0 2px rgba(255,210,95,.45), 0 0 14px rgba(255,210,95,.25) !important;
      }
    `;
    document.head.appendChild(style);
  }


  function forceLiv025HintVisibility(visible) {
    if (LEVEL_ID !== "LIV-025") return;

    const keys = [
      "bus-1-output",
      "front-fill-processor-input",
      "front-fill-processor-output",
      "front-fill-amp-input"
    ];

    let count = 0;

    keys.forEach(key => {
      const selector = [
        '.sf-live-native-level-liv-025 [data-node-key="' + key + '"]',
        '.sf-live-native-level-liv-025 [data-sf-native-key="' + key + '"]',
        '.sf-live-native-level-liv-025 [data-sf-native-node-key="' + key + '"]'
      ].join(",");

      document.querySelectorAll(selector).forEach(node => {
        count++;

        node.classList.add("sf-native-liv025-stealth-hitbox");

        node.style.setProperty("pointer-events", "auto", "important");
        node.style.setProperty("border-radius", "50%", "important");
        node.style.setProperty("z-index", "2600", "important");

        if (visible) {
          node.style.setProperty("opacity", "1", "important");
          node.style.setProperty("background", "rgba(255,210,95,.22)", "important");
          node.style.setProperty("border", "2px solid rgba(255,210,95,.9)", "important");
          node.style.setProperty("box-shadow", "0 0 0 2px rgba(255,210,95,.55), 0 0 16px rgba(255,210,95,.4)", "important");
          node.style.setProperty("outline", "none", "important");
        } else {
          node.style.setProperty("opacity", "0.01", "important");
          node.style.setProperty("background", "transparent", "important");
          node.style.setProperty("border", "2px solid transparent", "important");
          node.style.setProperty("box-shadow", "none", "important");
          node.style.setProperty("outline", "none", "important");
        }
      });
    });

    console.log("[Signal Flow] LIV-025 forced hint visibility", { visible: !!visible, count });
  }


  const LIV025_FALSE_HITBOXES = [
    { key:"liv025-false-bus-2-output", leftPx:190.48, topPx:109.76, widthPx:24, heightPx:24 },
    { key:"liv025-false-bus-3-output", leftPx:238.71, topPx:108.82, widthPx:24, heightPx:24 },
    { key:"liv025-false-bus-4-output", leftPx:283.72, topPx:109.93, widthPx:24, heightPx:24 },
    { key:"liv025-false-aux-1-output", leftPx:342.55, topPx:115.25, widthPx:24, heightPx:24 },
    { key:"liv025-false-aux-2-output", leftPx:367.05, topPx:115.18, widthPx:24, heightPx:24 },
    { key:"liv025-false-aux-3-output", leftPx:391.41, topPx:114.88, widthPx:24, heightPx:24 },
    { key:"liv025-false-aux-4-output", leftPx:417.45, topPx:114.31, widthPx:24, heightPx:24 },
    { key:"liv025-false-aux-5-output", leftPx:442.31, topPx:114.44, widthPx:24, heightPx:24 },
    { key:"liv025-false-aux-6-output", leftPx:467.37, topPx:114.70, widthPx:24, heightPx:24 },
    { key:"liv025-false-bus-1-output", leftPx:525.29, topPx:105.77, widthPx:24, heightPx:24 },
    { key:"liv025-false-bus-2-output", leftPx:553.48, topPx:106.09, widthPx:24, heightPx:24 },
    { key:"liv025-false-bus-3-output", leftPx:582.24, topPx:106.05, widthPx:24, heightPx:24 },
    { key:"liv025-false-bus-4-output", leftPx:610.66, topPx:105.48, widthPx:24, heightPx:24 },
    { key:"liv025-false-bus-5-output", leftPx:525.26, topPx:145.91, widthPx:24, heightPx:24 },
    { key:"liv025-false-bus-6-output", leftPx:553.74, topPx:146.08, widthPx:24, heightPx:24 },
    { key:"liv025-false-bus-7-output", leftPx:582.49, topPx:145.47, widthPx:24, heightPx:24 },
    { key:"liv025-false-bus-8-output", leftPx:612.07, topPx:145.84, widthPx:24, heightPx:24 },
    { key:"liv025-false-main-left-output", leftPx:685.91, topPx:106.81, widthPx:34, heightPx:34 },
    { key:"liv025-false-main-right-output", leftPx:729.35, topPx:105.97, widthPx:34, heightPx:34 },
    { key:"liv025-false-dsp-mic-input-1", leftPx:171.14, topPx:261.97, widthPx:34, heightPx:34 },
    { key:"liv025-false-dsp-mic-input-2", leftPx:209.93, topPx:260.50, widthPx:34, heightPx:34 },
    { key:"liv025-false-dsp-mic-input-3", leftPx:247.57, topPx:260.39, widthPx:34, heightPx:34 },
    { key:"liv025-false-dsp-mic-input-4", leftPx:344.22, topPx:266.76, widthPx:24, heightPx:24 },
    { key:"liv025-false-dsp-line-input-5", leftPx:382.92, topPx:266.35, widthPx:24, heightPx:24 },
    { key:"liv025-false-dsp-line-input-6", leftPx:420.98, topPx:266.10, widthPx:24, heightPx:24 },
    { key:"liv025-false-dsp-line-input-7", leftPx:458.40, topPx:266.85, widthPx:24, heightPx:24 },
    { key:"liv025-false-dsp-line-input-8", leftPx:557.89, topPx:261.57, widthPx:34, heightPx:34 },
    { key:"liv025-false-dsp-line-output-2", leftPx:592.91, topPx:262.99, widthPx:34, heightPx:34 },
    { key:"liv025-false-dsp-line-output-3", leftPx:627.22, topPx:262.19, widthPx:34, heightPx:34 },
    { key:"liv025-false-dsp-line-output-4", leftPx:295.14, topPx:428.87, widthPx:34, heightPx:34 },
    { key:"liv025-false-amp-left-output", leftPx:547.10, topPx:428.56, widthPx:34, heightPx:34 },
    { key:"liv025-false-amp-right-output", leftPx:611.12, topPx:429.33, widthPx:34, heightPx:34 }
  ];

  function ensureLiv025FalseGameplayHitboxes() {
    if (LEVEL_ID !== "LIV-025") return;

    const layer = document.querySelector(".sf-live-native-layer.sf-live-native-level-liv-025");
    if (!layer) return;

    LIV025_FALSE_HITBOXES.forEach(box => {
      if (layer.querySelector('[data-node-key="' + box.key + '"]')) return;

      const node = document.createElement("button");
      node.type = "button";
      node.className = "sf-native-node sf-native-jack sf-native-liv025-false-hitbox";
      setNativeNodeDomKey(node, box.key, "jack");

      const centerX = box.leftPx + box.widthPx / 2;
      const centerY = box.topPx + box.heightPx / 2;

      node.dataset.nodeKey = box.key;
      node.dataset.key = box.key;
      node.dataset.sfNativeKey = box.key;
      node.dataset.sfNativeFalseJack = "1";
      node.dataset.sfNativeHintable = "0";
      node.dataset.sfNativeGhost = "1";
      node.dataset.sfNativeDefaultShadow = "none";
      node.dataset.sfNativePointX = String(centerX);
      node.dataset.sfNativePointY = String(centerY);
      node.dataset.sfCableCenterX = String(centerX);
      node.dataset.sfCableCenterY = String(centerY);

      node.setAttribute("aria-label", box.key.replace(/^liv025-false-/, "").replace(/-/g, " "));
      node.title = node.getAttribute("aria-label");

      node.style.cssText = [
        "position:absolute",
        "left:" + box.leftPx + "px",
        "top:" + box.topPx + "px",
        "width:" + box.widthPx + "px",
        "height:" + box.heightPx + "px",
        "min-width:0",
        "min-height:0",
        "max-width:none",
        "max-height:none",
        "box-sizing:border-box",
        "padding:0",
        "margin:0",
        "line-height:0",
        "appearance:none",
        "-webkit-appearance:none",
        "border-radius:50%",
        "border:0",
        "background:transparent",
        "box-shadow:none",
        "outline:none",
        "opacity:0.01",
        "z-index:2600",
        "pointer-events:auto",
        "cursor:pointer"
      ].join(";");

      node.addEventListener("mouseenter", () => {
        node.style.boxShadow = "none";
        node.style.background = "transparent";
        node.style.outline = "none";
      });

      node.addEventListener("mouseleave", () => {
        node.style.boxShadow = "none";
        node.style.background = "transparent";
        node.style.outline = "none";
      });

      node.addEventListener("pointerdown", event => {
        startNativePatchDrag(layer, {
          key: box.key,
          el: node,
          defaultShadow: "none",
          point: pointForNativeNode(layer, node)
        }, event);
      }, true);

      node.addEventListener("click", event => {
        if (Date.now() < suppressNativeClickUntil) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        handleNodeClick(layer, {
          key: box.key,
          el: node,
          defaultShadow: "none",
          point: pointForNativeNode(layer, node)
        });
      });

      layer.appendChild(node);
    });

    console.log("[Signal Flow] LIV-025 false gameplay hitboxes ensured", LIV025_FALSE_HITBOXES.length);
  }

  function ensureLiv025GoodGameplayHitboxes() {
    if (LEVEL_ID !== "LIV-025") return;

    installLiv025StealthHitboxStyle();

    const layer = document.querySelector(".sf-live-native-layer.sf-live-native-level-liv-025");
    if (!layer) return;

    const hitboxes = [
      { key: "bus-1-output", label: "Bus 1/2 Output", leftPx: 140.06, topPx: 107.16, widthPx: 34, heightPx: 34 },
      { key: "front-fill-processor-input", label: "Front Fill DSP Bus In", leftPx: 133.51, topPx: 262.7, widthPx: 34, heightPx: 34 },
      { key: "front-fill-processor-output", label: "Front Fill DSP Out", leftPx: 522.96, topPx: 263.32, widthPx: 34, heightPx: 34 },
      { key: "front-fill-amp-input", label: "Front Fill Amp Input", leftPx: 232.44, topPx: 430.56, widthPx: 34, heightPx: 34 }
    ];

    hitboxes.forEach(hb => {
      const cx = hb.leftPx + hb.widthPx / 2;
      const cy = hb.topPx + hb.heightPx / 2;

      let node = layer.querySelector('[data-node-key="' + hb.key + '"], [data-sf-native-key="' + hb.key + '"]');

      if (!node) {
        createJackNode(layer, hb.key, { x: cx, y: cy }, hb.label, false);
        node = layer.querySelector('[data-node-key="' + hb.key + '"], [data-sf-native-key="' + hb.key + '"]');
      }

      if (!node) return;

      node.classList.add("sf-native-liv025-stealth-hitbox");

      node.style.left = cx + "px";
      node.style.top = cy + "px";
      node.style.width = hb.widthPx + "px";
      node.style.height = hb.heightPx + "px";
      node.style.transform = "translate(-50%,-50%)";
      node.style.pointerEvents = "auto";
      node.style.zIndex = "2400";
      node.dataset.sfNativePointX = String(cx);
      node.dataset.sfNativePointY = String(cy);
    });

    forceLiv025HintVisibility(false);
    normalizeLiv025GoodHitboxContract(layer);
    updateNativeHintHighlights();
    console.log("[Signal Flow] LIV-025 post-mount gameplay hitboxes ensured", hitboxes.length);
  }

function mountNative(force) {
    const adapter = window.SF_LIVE_SOUND_ADAPTER;
    if (!adapter) {
      console.warn("[Signal Flow] Native renderer missing adapter.");
      return;
    }

    if (!isNativePatchBoardActive()) return;
    if (!syncActiveLevelSpec() || !nativeVisible) return;

    const surface = findSurface();
    if (!surface) {
      scheduleNativeSurfaceRetry(force);
      return;
    }

    resetNativeSurfaceRetry();

    if (!force && surface.querySelector(".sf-live-native-layer")) {
      return;
    }

    if (getComputedStyle(surface).position === "static") {
      surface.style.position = "relative";
    }

    installNativeScrollStyle();
    hideLegacyBoard(surface);
    if (LEVEL_ID === "LIV-023") {
      renderLiv023MonitorConsoleStereoPa(surface, adapter);
    } else if (LEVEL_ID === "LIV-018") {
      renderLiv018TalkbackMonitor(surface, adapter);
    } else if (typeof isLivProcessingFamilyLevel === "function" && isLivProcessingFamilyLevel()) {
      renderLivProcessingFamily(surface, adapter);
    } else {
      renderNative(surface, adapter);
    }
    if (LEVEL_ID === "LIV-025") {
      ensureLiv025GoodGameplayHitboxes();
      ensureLiv025FalseGameplayHitboxes();
      hidePanelToggleControls();
      raiseHintOverlays();
    }
    updateNativeHintHighlights();

    markNativeLiveMounted(surface);
    installNativeGreyRingSuppressStyle();
    console.log("[Signal Flow] " + LEVEL_ID + " native renderer v6 mounted.");
  }

  function resetNativeSurfaceRetry() {
    clearTimeout(nativeSurfaceRetryTimer);
    nativeSurfaceRetryTimer = null;
    nativeSurfaceRetryCount = 0;
    nativeSurfaceRetryLevelId = null;
  }


  function installNativeLiveLegacyUnderlayHide() {
    if (document.getElementById("sf-native-live-legacy-underlay-hide-style")) return;
    const style = document.createElement("style");
    style.id = "sf-native-live-legacy-underlay-hide-style";
    style.textContent = `
      #patchbay.sf-native-live-mounted .device-card,
      #patchbay.sf-native-live-mounted .sf-live-skinned-card,
      #patchbay.sf-native-live-mounted .live-ui-card,
      #patchbay.sf-native-live-mounted .live-ui-jack,
      #patchbay.sf-native-live-mounted .sf-live-connector-node,
      #patchbay.sf-native-live-mounted .sf-live-connector-art,
      #patchbay.sf-native-live-mounted .sf-live-section-bg,
      #patchbay.sf-native-live-mounted .device-icon {
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }

      #patchbay.sf-native-live-mounted .sf-live-native-layer,
      #patchbay.sf-native-live-mounted .sf-live-native-layer *,
      #patchbay.sf-native-live-mounted .sf-live-native-viewport,
      #patchbay.sf-native-live-mounted .sf-live-native-viewport *,
      #patchbay.sf-native-live-mounted .sf-live-native-scroll-host,
      #patchbay.sf-native-live-mounted .sf-live-native-scroll-host * {
        visibility: visible !important;
      }

      #patchbay.sf-native-live-mounted .sf-live-native-layer .sf-native-node,
      #patchbay.sf-native-live-mounted .sf-live-native-layer .sf-native-jack {
        pointer-events: auto !important;
      }
    `;
    document.head.appendChild(style);
  }

  function markNativeLiveMounted(surface) {
    installNativeLiveLegacyUnderlayHide();
    const patchbay = document.getElementById("patchbay");
    if (patchbay) patchbay.classList.add("sf-native-live-mounted");
    if (surface && surface.classList) surface.classList.add("sf-native-live-surface-mounted");
  }


  function installNativeGreyRingSuppressStyle() {
    if (document.getElementById("sf-native-grey-ring-suppress-style")) return;
    const style = document.createElement("style");
    style.id = "sf-native-grey-ring-suppress-style";
    style.textContent = `
      /*
        Native grey-ring suppress:
        Hide default/inactive native jack button rings.
        Preserve required/yellow hint rings and active route feedback.
      */

      #patchbay.sf-native-live-mounted .sf-live-native-layer .sf-native-jack:not(.sf-native-required-hint):not(.required):not([data-required="true"]):not([data-sf-required="true"]):not(.is-valid):not(.is-invalid):not(.sf-native-valid):not(.sf-native-invalid) {
        border-color: transparent !important;
        box-shadow: none !important;
        outline: none !important;
        background: transparent !important;
      }

      #patchbay.sf-native-live-mounted .sf-live-native-layer .sf-native-jack:not(.sf-native-required-hint):not(.required):not([data-required="true"]):not([data-sf-required="true"]):not(.is-valid):not(.is-invalid):not(.sf-native-valid):not(.sf-native-invalid):hover,
      #patchbay.sf-native-live-mounted .sf-live-native-layer .sf-native-jack:not(.sf-native-required-hint):not(.required):not([data-required="true"]):not([data-sf-required="true"]):not(.is-valid):not(.is-invalid):not(.sf-native-valid):not(.sf-native-invalid):focus,
      #patchbay.sf-native-live-mounted .sf-live-native-layer .sf-native-jack:not(.sf-native-required-hint):not(.required):not([data-required="true"]):not([data-sf-required="true"]):not(.is-valid):not(.is-invalid):not(.sf-native-valid):not(.sf-native-invalid):focus-visible {
        border-color: transparent !important;
        box-shadow: none !important;
        outline: none !important;
        background: transparent !important;
      }
    `;
    document.head.appendChild(style);
  }

  function scheduleNativeSurfaceRetry(force) {
    if (nativeSurfaceRetryLevelId !== LEVEL_ID) {
      nativeSurfaceRetryLevelId = LEVEL_ID;
      nativeSurfaceRetryCount = 0;
    }

    if (nativeSurfaceRetryCount >= 12) {
      console.warn("[Signal Flow] Native renderer could not find live board surface.", {
        levelId: LEVEL_ID,
        attempts: nativeSurfaceRetryCount
      });
      resetNativeSurfaceRetry();
      return;
    }

    nativeSurfaceRetryCount += 1;
    clearTimeout(nativeSurfaceRetryTimer);
    nativeSurfaceRetryTimer = setTimeout(() => mountNative(!!force), nativeSurfaceRetryCount < 5 ? 260 : 520);
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    if (!isNativePatchBoardActive()) return;
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
    if (!currentNativePatchLevelId()) {
      nativeVisible = false;
      unmountNative();
      return;
    }

    nativeVisible = true;
    clearNative();
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
    if (!isNativePatchBoardActive()) return;

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


/* LIV-026 final stacking + invalid red cable persistence */
(function(){
  function applyLiv026CableStack(){
    if (!/LIV-026/.test(document.body.innerText || "")) return;
    document.querySelectorAll(
      '.sf-live-native-level-liv-026 svg, .sf-live-native-level-liv-026 .sf-native-cable-layer, .sf-live-native-level-liv-026 [data-sf-cable-layer]'
    ).forEach(function(el){
      el.style.setProperty('z-index','9000','important');
      el.style.setProperty('position','absolute','important');
      el.style.setProperty('pointer-events','none','important');
    });
    document.querySelectorAll('.sf-live-native-level-liv-026 .sf-liv026-tape-label').forEach(function(el){
      el.style.setProperty('z-index','3300','important');
      el.style.setProperty('pointer-events','none','important');
    });
  }
  setInterval(applyLiv026CableStack, 250);
  window.sfLiv026ApplyCableStack = applyLiv026CableStack;
})();
