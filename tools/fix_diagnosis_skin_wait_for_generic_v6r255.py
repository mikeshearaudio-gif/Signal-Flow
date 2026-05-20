from pathlib import Path
import re
import shutil
from datetime import datetime

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

skin_js = Path("patch/sf-diagnosis-svg-skin.js")
launch_files = [
    Path("launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html"),
    Path("launch/Signal_Flow_CRASH_TEST_NO_EMBEDDED_MEDIA.html"),
]

def backup(path):
    if path.exists():
        b = path.with_name(path.name + f".bak_diag_skin_v6r255_{stamp}")
        shutil.copy2(path, b)
        print("[OK] backup", b)

if not skin_js.exists():
    raise SystemExit("Missing patch/sf-diagnosis-svg-skin.js")

backup(skin_js)
js = skin_js.read_text()

js = re.sub(r"const VERSION = '6r\\d+';", "const VERSION = '6r255';", js, count=1)

bridge = r'''

// Diagnosis skin wait-for-generic bridge v6r255.
// Prevents select-change from skinning the legacy diagnosis panel before
// diagnosis-ui has recreated the real generic panel.
(function(){
  'use strict';

  const VERSION = '6r255';
  let waitingTimer = null;
  let lastLogKey = '';

  function qsa(sel, root = document){
    return Array.from(root.querySelectorAll(sel));
  }

  function rect(el){
    return el.getBoundingClientRect();
  }

  function visible(el){
    if(!el || !el.isConnected) return false;
    const r = rect(el);
    const cs = getComputedStyle(el);
    return cs.display !== 'none' &&
      cs.visibility !== 'hidden' &&
      r.width > 320 &&
      r.height > 60;
  }

  function currentLevelId(){
    const raw = [
      location.hash || '',
      location.href || '',
      qsa('select').map(s => {
        const opt = s.selectedOptions && s.selectedOptions[0];
        return [s.value || '', opt && opt.value || '', opt && opt.textContent || ''].join(' ');
      }).join(' ')
    ].join(' ');
    return raw.match(/\b[A-Z]{3}-\d{3}\b/)?.[0] || '';
  }

  function genericPanel(){
    return qsa('[data-sfdiag-generic-panel="true"], .sfdiag-generic-panel')
      .filter(visible)
      .sort((a,b) => {
        const ar = rect(a), br = rect(b);
        return (br.width * br.height) - (ar.width * ar.height);
      })[0] || null;
  }

  function removeLegacySkinForLevel(){
    qsa('[data-training-panel="diagnose"], .diagnose-panel').forEach(el => {
      if(el.getAttribute('data-sfdiag-generic-panel') === 'true') return;
      if(!el.classList.contains('sfdiag-svg-skin-active')) return;

      el.classList.remove('sf-diagnosis-mode', 'sfdiag-svg-skin-active');
      el.removeAttribute('data-sfdiag-svg-skin');
      el.removeAttribute('data-sfdiag-svg-version');
      el.removeAttribute('data-sfdiag-level');
      qsa(':scope > .sf-diagnosis-art-layer', el).forEach(layer => layer.remove());
    });
  }

  function reapplyWhenGeneric(reason){
    clearTimeout(waitingTimer);

    const id = currentLevelId();
    const generic = genericPanel();

    if(generic){
      removeLegacySkinForLevel();

      try{
        if(window.SF_DIAGNOSIS_SVG_ASSETS && typeof window.SF_DIAGNOSIS_SVG_ASSETS.installDiagnosisSkin === 'function'){
          window.SF_DIAGNOSIS_SVG_ASSETS.installDiagnosisSkin();
        }
      }catch(_){}

      generic.dataset.sfdiagSvgVersion = VERSION;

      const key = id + ':' + reason + ':' + Math.round(rect(generic).height);
      if(key !== lastLogKey){
        lastLogKey = key;
        console.log('[Signal Flow] Diagnosis SVG skin generic-ready', VERSION, {
          level: id,
          reason,
          classes: String(generic.className || '')
        });
      }
      return true;
    }

    // No generic panel yet: strip accidental legacy skin and wait briefly.
    removeLegacySkinForLevel();

    let tries = 0;
    waitingTimer = setInterval(() => {
      tries += 1;
      const panel = genericPanel();
      if(panel){
        clearInterval(waitingTimer);
        reapplyWhenGeneric(reason + ':ready');
      }else if(tries >= 12){
        clearInterval(waitingTimer);
        console.warn('[Signal Flow] Diagnosis SVG skin waited for generic panel but none appeared', VERSION, {
          level: id,
          reason
        });
      }
    }, 80);

    return false;
  }

  window.addEventListener('sf:diagnosis-generic-rendered', () => {
    setTimeout(() => reapplyWhenGeneric('generic-rendered'), 0);
    setTimeout(() => reapplyWhenGeneric('generic-rendered-late'), 120);
  });

  document.addEventListener('change', event => {
    if(event.target && event.target.matches && event.target.matches('select,#levelJump,#envJump,#levelSelect,#envSelect')){
      setTimeout(() => reapplyWhenGeneric('select-change-guard'), 40);
      setTimeout(() => reapplyWhenGeneric('select-change-guard-late'), 240);
    }
  }, true);

  window.addEventListener('hashchange', () => {
    setTimeout(() => reapplyWhenGeneric('hashchange-guard'), 80);
    setTimeout(() => reapplyWhenGeneric('hashchange-guard-late'), 260);
  });

  setTimeout(() => reapplyWhenGeneric('install-guard'), 250);
})();
'''

if "Diagnosis skin wait-for-generic bridge v6r255" not in js:
    js += bridge
    print("[OK] appended diagnosis skin wait-for-generic bridge v6r255")
else:
    print("[SKIP] v6r255 bridge already present")

skin_js.write_text(js)

for p in launch_files:
    if not p.exists():
        continue
    html = p.read_text()
    new_html = re.sub(r'sf-diagnosis-svg-skin\\.js\\?v=6r\\d+', 'sf-diagnosis-svg-skin.js?v=6r255', html)
    new_html = re.sub(r'sf-diagnosis-svg-skin\\.css\\?v=6r\\d+', 'sf-diagnosis-svg-skin.css?v=6r255', new_html)
    if new_html != html:
        backup(p)
        p.write_text(new_html)
        print("[OK] bumped diagnosis skin refs in", p)

print("\nDiagnosis skin wait-for-generic v6r255 complete.")
