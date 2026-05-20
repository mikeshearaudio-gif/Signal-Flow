from pathlib import Path
import re
import shutil
from datetime import datetime

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

diag_js = Path("patch/diagnosis-ui.js")
skin_js = Path("patch/sf-diagnosis-svg-skin.js")
skin_css = Path("patch/sf-diagnosis-svg-skin.css")
launch_files = [
    Path("launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html"),
    Path("launch/Signal_Flow_CRASH_TEST_NO_EMBEDDED_MEDIA.html"),
]

def backup(path):
    if path.exists():
        b = path.with_name(path.name + f".bak_diag_v6r256_{stamp}")
        shutil.copy2(path, b)
        print("[OK] backup", b)

if not diag_js.exists():
    raise SystemExit("Missing patch/diagnosis-ui.js")

backup(diag_js)
js = diag_js.read_text()

js = re.sub(r"const VERSION = '6r\d+';", "const VERSION = '6r256';", js, count=1)

watchdog = r'''
  // Diagnosis selected-level watchdog v6r256.
  // This fixes diagnosis levels such as LIV-031 where the ledger/select changes,
  // but no generic diagnosis panel is rebuilt after navigation.
  function sfdiagVisibleGenericForSelected(){
    const id = sfdiagSelectedIdNoRecursion ? sfdiagSelectedIdNoRecursion() : '';
    return qsa('[data-sfdiag-generic-panel="true"]').find(el => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return cs.display !== 'none' &&
        cs.visibility !== 'hidden' &&
        r.width > 320 &&
        r.height > 60 &&
        (!id || el.getAttribute('data-sfdiag-level-id') === id);
    }) || null;
  }

  let sfdiagLastWatchKey = '';
  function sfdiagWatchDiagnosisLevel(reason){
    try{
      const id = sfdiagSelectedIdNoRecursion ? sfdiagSelectedIdNoRecursion() : '';
      const level = sfdiagDiagnosisLevelById ? sfdiagDiagnosisLevelById(id) : null;
      if(!level) return;

      const visibleGeneric = sfdiagVisibleGenericForSelected();
      if(visibleGeneric) return;

      const key = id + ':' + reason + ':' + Date.now().toString().slice(0, -3);
      if(key === sfdiagLastWatchKey) return;
      sfdiagLastWatchKey = key;

      refresh();
      setTimeout(refresh, 120);
      setTimeout(refresh, 360);
    }catch(err){
      console.warn('[Signal Flow] Diagnosis watchdog failed v6r256', err);
    }
  }
'''

if "Diagnosis selected-level watchdog v6r256" not in js:
    marker = "  function refresh(){ if(!renderGenericDiagnosis()) deactivateIfNeeded(); }"
    if marker not in js:
        raise SystemExit("Could not find refresh() marker in diagnosis-ui.js")
    js = js.replace(marker, marker + "\n" + watchdog, 1)
    print("[OK] inserted LIV-031 diagnosis watchdog")
else:
    print("[SKIP] watchdog already present")

# Add targeted triggers after the existing listeners/schedule section.
if "sfdiagWatchDiagnosisLevel('interval')" not in js:
    js = js.replace(
        "  schedule(80);\n})();",
        """  schedule(80);

  window.addEventListener('hashchange', () => setTimeout(() => sfdiagWatchDiagnosisLevel('hashchange'), 90));
  document.addEventListener('change', event => {
    if(event.target && event.target.matches && event.target.matches('select,#levelJump,#envJump,#levelSelect,#envSelect')){
      setTimeout(() => sfdiagWatchDiagnosisLevel('select'), 100);
      setTimeout(() => sfdiagWatchDiagnosisLevel('select-late'), 450);
    }
  }, true);

  setInterval(() => sfdiagWatchDiagnosisLevel('interval'), 500);
})();""",
        1
    )
    print("[OK] added diagnosis watchdog triggers")
else:
    print("[SKIP] watchdog triggers already present")

diag_js.write_text(js)

# Make skin version string honest if possible.
if skin_js.exists():
    backup(skin_js)
    sj = skin_js.read_text()
    sj = re.sub(r"const VERSION = '6r\d+';", "const VERSION = '6r256';", sj, count=1)
    skin_js.write_text(sj)

if skin_css.exists():
    backup(skin_css)

# Correct cache refs. Earlier regex escaping left the browser on v6r254.
for p in launch_files:
    if not p.exists():
        continue
    html = p.read_text()
    new_html = re.sub(r'diagnosis-ui\.js\?v=6r\d+', 'diagnosis-ui.js?v=6r256', html)
    new_html = re.sub(r'diagnosis-ui\.css\?v=6r\d+', 'diagnosis-ui.css?v=6r256', new_html)
    new_html = re.sub(r'sf-diagnosis-svg-skin\.js\?v=6r\d+', 'sf-diagnosis-svg-skin.js?v=6r256', new_html)
    new_html = re.sub(r'sf-diagnosis-svg-skin\.css\?v=6r\d+', 'sf-diagnosis-svg-skin.css?v=6r256', new_html)
    if new_html != html:
        backup(p)
        p.write_text(new_html)
        print("[OK] bumped diagnosis refs in", p)

print("\nDiagnosis LIV-031 watchdog v6r256 complete.")
