from pathlib import Path
import re
import shutil
from datetime import datetime

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

skin_js = Path("patch/sf-diagnosis-svg-skin.js")
skin_css = Path("patch/sf-diagnosis-svg-skin.css")
launch_files = [
    Path("launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html"),
    Path("launch/Signal_Flow_CRASH_TEST_NO_EMBEDDED_MEDIA.html"),
]

def backup(path):
    if path.exists():
        b = path.with_name(path.name + f".bak_diag_skin_v6r247_{stamp}")
        shutil.copy2(path, b)
        print("[OK] backup", b)

if not skin_js.exists():
    raise SystemExit("Missing patch/sf-diagnosis-svg-skin.js")
if not skin_css.exists():
    raise SystemExit("Missing patch/sf-diagnosis-svg-skin.css")

backup(skin_js)
backup(skin_css)

skin_js.write_text(r'''// Signal Flow Diagnosis Mode SVG Skin helper v6r247
// Takes ownership of the visible diagnosis panel, not a loose outer ancestor.
(function () {
  'use strict';

  const VERSION = '6r247';
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

  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function rectArea(el) {
    const r = el.getBoundingClientRect();
    return Math.max(0, r.width) * Math.max(0, r.height);
  }

  function isVisible(el) {
    if (!el || !el.isConnected) return false;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return cs.display !== 'none' &&
      cs.visibility !== 'hidden' &&
      r.width > 420 &&
      r.height > 240;
  }

  function textOf(el) {
    return String(el && el.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function looksLikeDiagnosisPanel(el) {
    if (!el || !isVisible(el)) return false;
    const cls = String(el.className || '');
    const panel = el.getAttribute('data-training-panel') || '';
    const txt = textOf(el);

    return panel === 'diagnose' ||
      /\bdiagnose-panel\b|sfv174-diagnose|sfv175-diagnose|diagnosis-board|diagnose-board/i.test(cls) ||
      /Signal Flow Diagnosis|Find the broken|unsafe patch|Routing Monitor|Diagnosis/i.test(txt);
  }

  function activeDiagnosisPanel() {
    const candidates = qsa([
      'section.training-level-panel.diagnose-panel[data-training-panel="diagnose"]',
      '[data-training-panel="diagnose"]',
      '.diagnose-panel',
      '.sfv174-diagnose-clinic',
      '.sfv175-diagnose-board',
      '.diagnosis-board',
      '.diagnose-board'
    ].join(','))
      .filter(looksLikeDiagnosisPanel)
      .sort((a, b) => rectArea(b) - rectArea(a));

    return candidates[0] || null;
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

  function ensureLayer(panel) {
    let layer = Array.from(panel.children).find(el => el.classList && el.classList.contains('sf-diagnosis-art-layer'));
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'sf-diagnosis-art-layer';
      layer.dataset.sfDiagnosisSkin = VERSION;
      layer.appendChild(makeImg(DIAGNOSIS_ASSETS.boardShell, 'sf-diagnosis-board-shell', ''));
      layer.appendChild(makeImg(DIAGNOSIS_ASSETS.topbar, 'sf-diagnosis-topbar-skin', ''));
      layer.appendChild(makeImg(DIAGNOSIS_ASSETS.sidebar, 'sf-diagnosis-sidebar-skin', ''));
      panel.prepend(layer);
    } else {
      layer.dataset.sfDiagnosisSkin = VERSION;
    }
    return layer;
  }

  function decoratePanel(panel) {
    panel.classList.add('sf-diagnosis-mode', 'sfdiag-svg-skin-active');
    panel.dataset.sfdiagSvgSkin = 'active';
    panel.dataset.sfdiagSvgVersion = VERSION;

    if (getComputedStyle(panel).position === 'static') {
      panel.style.position = 'relative';
    }

    qsa('.diagnose-patch, button.inline-diagnose, .sfv174-diagnose-item, .sfv175-diagnose-item', panel)
      .forEach((btn, index) => {
        btn.classList.add('sf-diagnosis-choice-card');
        btn.dataset.sfdiagChoiceIndex = String(index + 1);
      });

    qsa('.sf-diagnosis-art-layer', document)
      .forEach(layer => {
        if (layer.parentElement !== panel) layer.remove();
      });
  }

  function installDiagnosisSkin() {
    const panel = activeDiagnosisPanel();
    if (!panel) return false;

    decoratePanel(panel);
    ensureLayer(panel);

    document.documentElement.dataset.sfdiagSvgSkinVersion = VERSION;

    if (installDiagnosisSkin._lastPanel !== panel) {
      installDiagnosisSkin._lastPanel = panel;
      console.log('[Signal Flow] Diagnosis SVG skin active', VERSION, {
        classes: String(panel.className || ''),
        level: location.hash || ''
      });
    }

    return true;
  }

  function updateDiagnosisMetersFromState() {
    const completed = Boolean(
      window.SignalFlow?.state?.diagnosisAnswered ||
      document.querySelector('.diagnosis-choice.is-correct, .sf-diagnosis-choice-card.is-correct, .diagnose-patch.selected')
    );
    document.querySelectorAll('.sf-diagnosis-meter').forEach((el) => el.classList.toggle('is-active', completed));
  }

  window.SF_DIAGNOSIS_SVG_ASSETS = {
    VERSION,
    ASSET_ROOT,
    DIAGNOSIS_ASSETS,
    installDiagnosisSkin,
    updateDiagnosisMetersFromState
  };

  function refreshDiagnosisSkin() {
    installDiagnosisSkin();
    updateDiagnosisMetersFromState();
  }

  let refreshTimer = null;
  function scheduleRefresh(delay = 80) {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refreshDiagnosisSkin, delay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => scheduleRefresh(20));
  } else {
    scheduleRefresh(20);
  }

  window.addEventListener('load', () => {
    scheduleRefresh(40);
    setTimeout(refreshDiagnosisSkin, 250);
    setTimeout(refreshDiagnosisSkin, 900);
  });
  window.addEventListener('hashchange', () => scheduleRefresh(80));
  window.addEventListener('popstate', () => scheduleRefresh(80));
  document.addEventListener('change', event => {
    if (event.target?.matches?.('select,#levelJump,#envJump')) scheduleRefresh(120);
  }, true);

  new MutationObserver(() => scheduleRefresh(120)).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'data-mode', 'data-board-id', 'data-level-id', 'data-training-panel', 'style', 'aria-hidden']
  });
})();
''')

css = skin_css.read_text()
append = r'''

/* Diagnosis SVG skin ownership v6r247.
   Attach art to the visible diagnosis panel itself. */
.diagnose-panel.sfdiag-svg-skin-active,
.training-level-panel.diagnose-panel.sfdiag-svg-skin-active,
[data-training-panel="diagnose"].sfdiag-svg-skin-active {
  position: relative !important;
  isolation: isolate !important;
  overflow: hidden !important;
  background:
    radial-gradient(circle at 12% 10%, rgba(255, 210, 110, 0.15), transparent 28%),
    linear-gradient(135deg, rgba(24, 18, 34, 0.96), rgba(8, 12, 22, 0.98)) !important;
}

.diagnose-panel.sfdiag-svg-skin-active > :not(.sf-diagnosis-art-layer),
[data-training-panel="diagnose"].sfdiag-svg-skin-active > :not(.sf-diagnosis-art-layer) {
  position: relative !important;
  z-index: 2 !important;
}

.sfdiag-svg-skin-active > .sf-diagnosis-art-layer {
  position: absolute !important;
  inset: 0 !important;
  z-index: 0 !important;
  pointer-events: none !important;
  overflow: hidden !important;
}

.sfdiag-svg-skin-active .sf-diagnosis-board-shell {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  opacity: 0.72 !important;
}

.sfdiag-svg-skin-active .sf-diagnosis-topbar-skin {
  position: absolute !important;
  top: 10px !important;
  left: 18px !important;
  right: 18px !important;
  width: calc(100% - 36px) !important;
  height: 74px !important;
  object-fit: fill !important;
  opacity: 0.9 !important;
}

.sfdiag-svg-skin-active .sf-diagnosis-sidebar-skin {
  position: absolute !important;
  top: 92px !important;
  left: 14px !important;
  width: min(270px, 28%) !important;
  height: calc(100% - 112px) !important;
  object-fit: fill !important;
  opacity: 0.72 !important;
}

.sfdiag-svg-skin-active .sf-diagnosis-choice-card,
.sfdiag-svg-skin-active .diagnose-patch {
  position: relative !important;
  z-index: 3 !important;
}
'''

if "Diagnosis SVG skin ownership v6r247" not in css:
    css += append
    print("[OK] appended diagnosis skin CSS v6r247")
else:
    print("[SKIP] diagnosis skin CSS v6r247 already present")

skin_css.write_text(css)

for p in launch_files:
    if not p.exists():
        continue
    html = p.read_text()
    new_html = re.sub(r'diagnosis-ui\.css\?v=6r\d+', 'diagnosis-ui.css?v=6r247', html)
    new_html = re.sub(r'sf-diagnosis-svg-skin\.css\?v=6r\d+', 'sf-diagnosis-svg-skin.css?v=6r247', new_html)
    new_html = re.sub(r'diagnosis-ui\.js\?v=6r\d+', 'diagnosis-ui.js?v=6r247', new_html)
    new_html = re.sub(r'sf-diagnosis-svg-skin\.js\?v=6r\d+', 'sf-diagnosis-svg-skin.js?v=6r247', new_html)
    if new_html != html:
        backup(p)
        p.write_text(new_html)
        print("[OK] bumped diagnosis cache refs in", p)

print("\nDiagnosis SVG skin v6r247 patch complete.")
