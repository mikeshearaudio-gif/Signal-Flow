// Signal Flow Diagnosis Mode SVG Skin helper
// Place at Signal-Flow-main/patch/sf-diagnosis-svg-skin.js
// Codex should adapt selectors to the current local build.
(function () {
  const ASSET_ROOT = 'assets/diagnosis/svg';
  const DIAGNOSIS_ASSETS = {
    boardShell: `${ASSET_ROOT}/backgrounds/diagnosis-board-shell.svg`,
    topbar: `${ASSET_ROOT}/backgrounds/diagnosis-topbar-skin.svg`,
    sidebar: `${ASSET_ROOT}/backgrounds/diagnosis-sidebar-skin.svg`,
    clipboard: `${ASSET_ROOT}/clipboard/diagnosis-clipboard-blank.svg`,
    patient: `${ASSET_ROOT}/cards/patient-status-card.svg`,
    vitals: `${ASSET_ROOT}/cards/caller-vitals-card.svg`,
    insertMonitor: `${ASSET_ROOT}/monitors/insert-path-monitor.svg`,
    analyzer: `${ASSET_ROOT}/monitors/audio-analyzer.svg`,
    neon: `${ASSET_ROOT}/cards/neon-diagnose-sign.svg`,
    patchTester: `${ASSET_ROOT}/monitors/signal-flow-patch-tester.svg`,
    spectrum: `${ASSET_ROOT}/monitors/spectrum-view.svg`,
    overallMeter: `${ASSET_ROOT}/monitors/overall-level-meter.svg`,
    cart: `${ASSET_ROOT}/props/diagnosis-cart.svg`,
    lamp: `${ASSET_ROOT}/props/desk-lamp.svg`,
    workflowRail: `${ASSET_ROOT}/navigation/diagnosis-workflow-rail.svg`
  };

  function isDiagnosisMode() {
    const wrap = document.querySelector('#patchbayWrap');
    const body = document.body;
    return Boolean(
      wrap?.classList.contains('sf-diagnosis-mode') ||
      wrap?.dataset?.mode === 'diagnose' ||
      body?.classList.contains('sf-diagnosis-mode') ||
      document.querySelector('[data-diagnosis-board], .diagnosis-board, .diagnose-board')
    );
  }

  function makeImg(src, className, alt = '') {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.className = className;
    img.decoding = 'async';
    img.loading = 'eager';
    img.draggable = false;
    return img;
  }

  function installDiagnosisSkin() {
    if (!isDiagnosisMode()) return false;
    const host = document.querySelector('#patchbayWrap') || document.querySelector('#app') || document.body;
    if (host.querySelector('.sf-diagnosis-art-layer')) return true;
    host.classList.add('sf-diagnosis-mode');
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

    const layer = document.createElement('div');
    layer.className = 'sf-diagnosis-art-layer';
    layer.dataset.sfDiagnosisSkin = 'v1';
    // Codex: place these assets into the existing diagnosis layout containers instead of absolute defaults when available.
    layer.appendChild(makeImg(DIAGNOSIS_ASSETS.boardShell, 'sf-diagnosis-board-shell', ''));
    host.prepend(layer);
    return true;
  }

  function updateDiagnosisMetersFromState() {
    // Generic placeholder: Codex should replace this with real diagnosis/progress state.
    const completed = Boolean(window.SignalFlow?.state?.diagnosisAnswered || document.querySelector('.diagnosis-choice.is-correct, .sf-diagnosis-choice-card.is-correct'));
    document.querySelectorAll('.sf-diagnosis-meter').forEach((el) => el.classList.toggle('is-active', completed));
  }

  window.SF_DIAGNOSIS_SVG_ASSETS = {
    ASSET_ROOT,
    DIAGNOSIS_ASSETS,
    installDiagnosisSkin,
    updateDiagnosisMetersFromState
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { installDiagnosisSkin(); updateDiagnosisMetersFromState(); });
  } else {
    installDiagnosisSkin();
    updateDiagnosisMetersFromState();
  }
})();
