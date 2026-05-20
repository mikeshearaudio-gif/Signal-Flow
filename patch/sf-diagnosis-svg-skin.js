// Signal Flow Diagnosis SVG Skin compatibility shim v6r261.
// Diagnosis art is now rendered only by patch/diagnosis-ui.js.
(function(){
  'use strict';

  const VERSION = '6r261';
  const ASSET_ROOT = new URL('../assets/diagnosis/svg/', document.currentScript?.src || document.baseURI).href.replace(/\/$/, '');
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

  window.SF_DIAGNOSIS_SVG_ASSETS = {
    VERSION,
    ASSET_ROOT,
    DIAGNOSIS_ASSETS,
    installDiagnosisSkin(){ return Boolean(document.querySelector('[data-sfdiag-generic-panel="true"] > .sf-diagnosis-art-layer')); },
    reapplyDiagnosisSkin(){ return Boolean(document.querySelector('[data-sfdiag-generic-panel="true"] > .sf-diagnosis-art-layer')); },
    updateDiagnosisMetersFromState(){ return false; }
  };
})();
