from pathlib import Path
import re
import shutil
from datetime import datetime

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

js_path = Path("patch/sf-diagnosis-svg-skin.js")
css_path = Path("patch/sf-diagnosis-svg-skin.css")
launch_files = [
    Path("launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html"),
    Path("launch/Signal_Flow_CRASH_TEST_NO_EMBEDDED_MEDIA.html"),
]

def backup(path):
    if path.exists():
        b = path.with_name(path.name + f".bak_diag_v6r248_{stamp}")
        shutil.copy2(path, b)
        print("[OK] backup", b)

if not js_path.exists():
    raise SystemExit("Missing patch/sf-diagnosis-svg-skin.js")
if not css_path.exists():
    raise SystemExit("Missing patch/sf-diagnosis-svg-skin.css")

backup(js_path)
backup(css_path)

js = js_path.read_text()

bridge = r'''

// Diagnosis diag-to-diag skin lifecycle bridge v6r248.
// Keeps the SVG skin attached when navigating directly between diagnosis boards.
(function(){
  'use strict';

  const VERSION = '6r248';
  let refreshTimer = null;
  let lastAppliedKey = '';

  function qsa(sel, root = document){
    return Array.from(root.querySelectorAll(sel));
  }

  function rectArea(el){
    const r = el.getBoundingClientRect();
    return Math.max(0, r.width) * Math.max(0, r.height);
  }

  function visible(el){
    if(!el || !el.isConnected) return false;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return cs.display !== 'none' &&
      cs.visibility !== 'hidden' &&
      el.getAttribute('aria-hidden') !== 'true' &&
      r.width > 420 &&
      r.height > 240;
  }

  function textOf(el){
    return String(el && el.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function currentLevelId(){
    const hash = (location.hash || '').match(/\b[A-Z]{3}-\d{3}\b/);
    if(hash) return hash[0];

    for(const s of qsa('select')){
      const opt = s.selectedOptions && s.selectedOptions[0];
      const raw = [s.value || '', opt && opt.textContent || ''].join(' ');
      const m = raw.match(/\b[A-Z]{3}-\d{3}\b/);
      if(m) return m[0];
    }

    const bodyMatch = textOf(document.body).match(/\b[A-Z]{3}-\d{3}\b/);
    return bodyMatch ? bodyMatch[0] : '';
  }

  function isDiagnosisLevel(){
    const raw = [
      location.hash || '',
      document.body.className || '',
      qsa('select').map(s => {
        const opt = s.selectedOptions && s.selectedOptions[0];
        return [s.value || '', opt && opt.textContent || ''].join(' ');
      }).join(' '),
      textOf(document.querySelector('.game-title') || document.body).slice(0, 1000)
    ].join(' ');

    return /\[DIAG\]|diagnose|diagnosis|Find the broken|unsafe patch/i.test(raw) ||
      Boolean(document.querySelector('[data-training-panel="diagnose"], .diagnose-panel, .sfdiag-generic-panel'));
  }

  function blurDiagnosisFocus(){
    const active = document.activeElement;
    if(active && active.matches && active.matches('.diagnose-patch, .sf-diagnosis-choice-card, .sfv174-diagnose-item, .sfv175-diagnose-item')){
      try { active.blur(); } catch(_){}
    }
  }

  function makeImg(src, cls){
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.className = cls;
    img.decoding = 'async';
    img.loading = 'eager';
    img.draggable = false;
    return img;
  }

  function assets(){
    return window.SF_DIAGNOSIS_SVG_ASSETS && window.SF_DIAGNOSIS_SVG_ASSETS.DIAGNOSIS_ASSETS || null;
  }

  function activeDiagnosisPanel(){
    const panels = qsa([
      'section.training-level-panel.diagnose-panel.sfdiag-generic-panel[data-training-panel="diagnose"]',
      'section.training-level-panel.diagnose-panel[data-training-panel="diagnose"]',
      '[data-training-panel="diagnose"].sfdiag-generic-panel',
      '.diagnose-panel.sfdiag-generic-panel',
      '.sfdiag-generic-panel',
      '[data-training-panel="diagnose"]',
      '.diagnose-panel'
    ].join(','))
      .filter(el => {
        if(!visible(el)) return false;
        if(el.dataset.sfdiagLegacyDiagnosis === 'hidden') return false;
        const cls = String(el.className || '');
        const txt = textOf(el);
        return /diagnose|diagnosis|sfdiag/i.test(cls + ' ' + txt);
      })
      .sort((a,b) => {
        const ag = a.classList.contains('sfdiag-generic-panel') ? 1 : 0;
        const bg = b.classList.contains('sfdiag-generic-panel') ? 1 : 0;
        if(ag !== bg) return bg - ag;
        return rectArea(b) - rectArea(a);
      });

    return panels[0] || null;
  }

  function removeStaleSkins(target){
    qsa('.sf-diagnosis-art-layer').forEach(layer => {
      if(!target || layer.parentElement !== target) layer.remove();
    });

    qsa('[data-sfdiag-svg-skin], .sfdiag-svg-skin-active').forEach(panel => {
      if(panel === target) return;
      panel.classList.remove('sf-diagnosis-mode', 'sfdiag-svg-skin-active');
      panel.removeAttribute('data-sfdiag-svg-skin');
      panel.removeAttribute('data-sfdiag-svg-version');
      panel.removeAttribute('data-sfdiag-level');
    });
  }

  function ensureArtLayer(panel){
    const a = assets();
    if(!a) return false;

    let layer = panel.querySelector(':scope > .sf-diagnosis-art-layer');
    if(!layer){
      layer = document.createElement('div');
      layer.className = 'sf-diagnosis-art-layer';
      panel.prepend(layer);
    }

    layer.dataset.sfDiagnosisSkin = VERSION;

    if(!layer.querySelector('.sf-diagnosis-board-shell')){
      layer.appendChild(makeImg(a.boardShell, 'sf-diagnosis-board-shell'));
    }
    if(!layer.querySelector('.sf-diagnosis-topbar-skin')){
      layer.appendChild(makeImg(a.topbar, 'sf-diagnosis-topbar-skin'));
    }
    if(!layer.querySelector('.sf-diagnosis-sidebar-skin')){
      layer.appendChild(makeImg(a.sidebar, 'sf-diagnosis-sidebar-skin'));
    }

    return true;
  }

  function applySkin(reason){
    if(!isDiagnosisLevel()){
      return false;
    }

    blurDiagnosisFocus();

    const panel = activeDiagnosisPanel();
    if(!panel){
      return false;
    }

    removeStaleSkins(panel);

    panel.classList.add('sf-diagnosis-mode', 'sfdiag-svg-skin-active');
    panel.dataset.sfdiagSvgSkin = 'active';
    panel.dataset.sfdiagSvgVersion = VERSION;
    panel.dataset.sfdiagLevel = currentLevelId();

    if(getComputedStyle(panel).position === 'static'){
      panel.style.position = 'relative';
    }

    qsa('.diagnose-patch, button.inline-diagnose, .sfv174-diagnose-item, .sfv175-diagnose-item', panel)
      .forEach((btn, index) => {
        btn.classList.add('sf-diagnosis-choice-card');
        btn.dataset.sfdiagChoiceIndex = String(index + 1);
      });

    ensureArtLayer(panel);

    const key = [currentLevelId(), panel.dataset.sfdiagSvgVersion, Math.round(rectArea(panel))].join(':');
    if(key !== lastAppliedKey){
      lastAppliedKey = key;
      console.log('[Signal Flow] Diagnosis SVG skin reapplied', VERSION, {
        level: currentLevelId(),
        reason,
        classes: String(panel.className || '')
      });
    }

    return true;
  }

  function schedule(reason = 'schedule', delay = 60){
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => applySkin(reason), delay);
  }

  function burst(reason){
    [0, 40, 90, 160, 300, 600, 1000, 1500].forEach(delay => {
      setTimeout(() => applySkin(reason + ':' + delay), delay);
    });
  }

  window.SF_DIAGNOSIS_SVG_ASSETS = window.SF_DIAGNOSIS_SVG_ASSETS || {};
  window.SF_DIAGNOSIS_SVG_ASSETS.reapplyDiagnosisSkin = function(reason){
    burst(reason || 'manual');
  };

  document.addEventListener('change', event => {
    if(event.target && event.target.matches && event.target.matches('select,#levelJump,#envJump,#levelSelect,#envSelect')){
      blurDiagnosisFocus();
      burst('select-change');
    }
  }, true);

  document.addEventListener('click', event => {
    if(event.target && event.target.closest && event.target.closest('select,#levelJump,#envJump,#levelSelect,#envSelect,.diagnose-patch')){
      schedule('click', 80);
    }
  }, true);

  window.addEventListener('hashchange', () => burst('hashchange'));
  window.addEventListener('popstate', () => burst('popstate'));
  window.addEventListener('load', () => burst('load'));

  ['pushState', 'replaceState'].forEach(name => {
    const original = history[name];
    if(typeof original !== 'function' || original.__sfdiagWrapped) return;
    history[name] = function(){
      const result = original.apply(this, arguments);
      burst('history-' + name);
      return result;
    };
    history[name].__sfdiagWrapped = true;
  });

  new MutationObserver(() => schedule('mutation', 90)).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style', 'aria-hidden', 'data-training-panel', 'data-level-id', 'data-sfdiag-legacy-diagnosis']
  });

  burst('install');
})();
'''

if "Diagnosis diag-to-diag skin lifecycle bridge v6r248" not in js:
    js += bridge
    print("[OK] appended diagnosis diag-to-diag bridge v6r248")
else:
    print("[SKIP] v6r248 bridge already present")

js_path.write_text(js)

css = css_path.read_text()
css_append = r'''

/* Diagnosis diag-to-diag skin lifecycle bridge v6r248 */
.diagnose-panel.sfdiag-svg-skin-active,
.training-level-panel.diagnose-panel.sfdiag-svg-skin-active,
[data-training-panel="diagnose"].sfdiag-svg-skin-active {
  position: relative !important;
  isolation: isolate !important;
}

.sfdiag-svg-skin-active > .sf-diagnosis-art-layer {
  position: absolute !important;
  inset: 0 !important;
  z-index: 0 !important;
  pointer-events: none !important;
}

.sfdiag-svg-skin-active > :not(.sf-diagnosis-art-layer) {
  position: relative !important;
  z-index: 2 !important;
}

.sfdiag-svg-skin-active .sf-diagnosis-choice-card,
.sfdiag-svg-skin-active .diagnose-patch {
  position: relative !important;
  z-index: 3 !important;
}
'''

if "Diagnosis diag-to-diag skin lifecycle bridge v6r248" not in css:
    css += css_append
    print("[OK] appended diagnosis CSS v6r248")
else:
    print("[SKIP] v6r248 CSS already present")

css_path.write_text(css)

for p in launch_files:
    if not p.exists():
        continue
    html = p.read_text()
    new_html = re.sub(r'sf-diagnosis-svg-skin\.js\?v=6r\d+', 'sf-diagnosis-svg-skin.js?v=6r248', html)
    new_html = re.sub(r'sf-diagnosis-svg-skin\.css\?v=6r\d+', 'sf-diagnosis-svg-skin.css?v=6r248', new_html)
    if new_html != html:
        backup(p)
        p.write_text(new_html)
        print("[OK] bumped diagnosis skin refs in", p)

print("\nDiagnosis diag-to-diag skin bridge v6r248 complete.")
