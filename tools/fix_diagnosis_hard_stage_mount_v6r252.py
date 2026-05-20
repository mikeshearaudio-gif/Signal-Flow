from pathlib import Path
import re
import shutil
from datetime import datetime

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

js_path = Path("patch/diagnosis-ui.js")
skin_js_path = Path("patch/sf-diagnosis-svg-skin.js")
launch_files = [
    Path("launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html"),
    Path("launch/Signal_Flow_CRASH_TEST_NO_EMBEDDED_MEDIA.html"),
]

def backup(path):
    if path.exists():
        b = path.with_name(path.name + f".bak_diag_v6r252_{stamp}")
        shutil.copy2(path, b)
        print("[OK] backup", b)

def replace_function(src, name, replacement):
    needle = "  function " + name
    idx = src.find(needle)
    if idx < 0:
        raise SystemExit(f"Function not found: {name}")

    brace = src.find("{", idx)
    if brace < 0:
        raise SystemExit(f"No opening brace for: {name}")

    depth = 0
    quote = None
    escape = False
    line_comment = False
    block_comment = False
    i = brace

    while i < len(src):
        ch = src[i]
        nxt = src[i + 1] if i + 1 < len(src) else ""

        if line_comment:
            if ch == "\n":
                line_comment = False
            i += 1
            continue

        if block_comment:
            if ch == "*" and nxt == "/":
                block_comment = False
                i += 2
                continue
            i += 1
            continue

        if quote:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == quote:
                quote = None
            i += 1
            continue

        if ch in ("'", '"', "`"):
            quote = ch
            i += 1
            continue

        if ch == "/" and nxt == "/":
            line_comment = True
            i += 2
            continue

        if ch == "/" and nxt == "*":
            block_comment = True
            i += 2
            continue

        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return src[:idx] + replacement + src[i + 1:]

        i += 1

    raise SystemExit(f"Could not find closing brace for: {name}")

if not js_path.exists():
    raise SystemExit("Missing patch/diagnosis-ui.js")

backup(js_path)
js = js_path.read_text()

js = re.sub(r"const VERSION = '6r\d+';", "const VERSION = '6r252';", js, count=1)

helpers = r'''
  function sfdiagVisible(el){
    if(!el || !el.isConnected) return false;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return cs.display !== 'none' &&
      cs.visibility !== 'hidden' &&
      r.width > 360 &&
      r.height > 220;
  }

  function sfdiagStageHost(){
    const candidates = [
      qs('.training-stage-shell'),
      qs('.level-shell'),
      qs('.training-only-board'),
      qs('.board-card'),
      qs('main.game'),
      qs('main'),
      qs('#app')
    ].filter(Boolean);

    for(const el of candidates){
      if(el.closest && el.closest('.sf-build-room-v6r227')) continue;
      if(el.matches && el.matches('[data-training-panel="diagnose"], .diagnose-panel')) continue;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if(cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 520 && r.height > 320){
        return el;
      }
    }

    return gameRoot() || document.body;
  }

  function sfdiagClearDiagnosisStage(host){
    if(!host) return;

    qsa('[data-sfdiag-generic-panel="true"]', host).forEach(el => el.remove());
    qsa('[data-sfdiag-decorator]', host).forEach(el => el.remove());
    qsa('.sf-diagnosis-art-layer', host).forEach(el => el.remove());

    // Remove/neutralize legacy diagnosis panels inside the stage host only.
    qsa('[data-training-panel="diagnose"], .diagnose-panel', host).forEach(el => {
      if(el.getAttribute('data-sfdiag-generic-panel') === 'true') return;
      el.remove();
    });

    // If the stage still contains non-diagnosis leftover content from a previous
    // Build-a-Room/native shell, clear only when this host is diagnosis-owned.
    if(host.dataset.sfdiagStageOwned === 'true'){
      host.innerHTML = '';
    }
  }

  function sfdiagCurrentDiagnosisLevelObject(){
    try{
      const hashId = String(location.hash || location.href || '').match(/\b[A-Z]{3}-\d{3}\b/)?.[0] || '';
      if(hashId && window.DATA && Array.isArray(window.DATA.levels)){
        const byHash = window.DATA.levels.find(l => l && l.id === hashId && l.training && l.training.type === 'diagnose');
        if(byHash) return byHash;
      }
    }catch(_){}

    try{
      for(const s of qsa('select')){
        const opt = s.selectedOptions && s.selectedOptions[0];
        const raw = [s.value || '', opt && opt.value || '', opt && opt.textContent || ''].join(' ');
        const id = raw.match(/\b[A-Z]{3}-\d{3}\b/)?.[0] || '';
        if(id && window.DATA && Array.isArray(window.DATA.levels)){
          const bySelect = window.DATA.levels.find(l => l && l.id === id && l.training && l.training.type === 'diagnose');
          if(bySelect) return bySelect;
        }
      }
    }catch(_){}

    const l = currentLevelObject();
    if(l && l.training && l.training.type === 'diagnose') return l;
    return null;
  }
'''

if "function sfdiagStageHost()" not in js:
    marker = "  function removeOldDecorators(board){"
    if marker not in js:
        raise SystemExit("Could not find insertion marker before removeOldDecorators")
    js = js.replace(marker, helpers + "\n" + marker, 1)
    print("[OK] inserted v6r252 hard-stage helpers")
else:
    print("[SKIP] v6r252 helpers already present")

selected_fn = r'''  function selectedDiagnosisId(){
    const l = sfdiagCurrentDiagnosisLevelObject();
    if(l && l.id) return l.id;

    const visible = (qs('.game-title')?.textContent || document.body.textContent || '').match(/\b[A-Z]{3}-\d{3}\b/);
    return visible ? visible[0] : '';
  }'''
js = replace_function(js, "selectedDiagnosisId", selected_fn)

render_fn = r'''  function renderGenericDiagnosis(){
    const l = sfdiagCurrentDiagnosisLevelObject();
    if(!l && !isDiagnosisBoard()) return false;

    const main = gameRoot();
    const levelObj = l || currentLevelObject();
    const t = (levelObj && levelObj.training && levelObj.training.type === 'diagnose')
      ? levelObj.training
      : currentDiagnosisTraining();

    if(!main || !levelObj || !t) return false;

    const id = levelObj.id || levelId();
    const host = sfdiagStageHost();

    if(!host) return false;

    const currentKey = host.dataset.sfdiagRenderedLevel || '';

    if(currentKey !== id || main.dataset.sfdiagVersion !== VERSION){
      sfdiagClearDiagnosisStage(host);
      host.dataset.sfdiagStageOwned = 'true';
      host.dataset.sfdiagRenderedLevel = id || 'unknown';

      host.classList.add('sfdiag-board-shell');
      if(getComputedStyle(host).position === 'static'){
        host.style.position = 'relative';
      }

      host.insertAdjacentHTML('afterbegin', generatedPanelHtml(levelObj, t));

      if(!qs(':scope > [data-sfdiag-decorator="left"]', host)) host.insertAdjacentHTML('afterbegin', labLeftHtml());
      if(!qs(':scope > [data-sfdiag-decorator="right"]', host)) host.insertAdjacentHTML('beforeend', labRightHtml());
      if(!qs(':scope > [data-sfdiag-decorator="workflow"]', host)) host.insertAdjacentHTML('beforeend', workflowHtml());
    }

    let panel = qs(':scope > [data-sfdiag-generic-panel="true"]', host);
    if(!panel){
      host.insertAdjacentHTML('afterbegin', generatedPanelHtml(levelObj, t));
      panel = qs(':scope > [data-sfdiag-generic-panel="true"]', host);
    }

    if(!panel) return false;

    panel.classList.add('sfdiag-clipboard-panel', 'sfdiag-generic-panel');
    panel.setAttribute('data-training-panel', 'diagnose');
    panel.setAttribute('data-training-only', 'true');
    panel.setAttribute('data-sfdiag-generic-panel', 'true');
    panel.setAttribute('data-sfdiag-level-id', id || 'unknown');

    main.classList.add('sfdiag-ui-active');
    main.dataset.sfdiagVersion = VERSION;

    bindGeneratedPanel(panel);
    setPatchTester('neutral');

    document.documentElement.classList.remove('sfdiag-precloak-pending','sfdiag-cloak-failsafe-open');

    try{
      window.dispatchEvent(new CustomEvent('sf:diagnosis-generic-rendered', {
        detail: { levelId: id, version: VERSION }
      }));
    }catch(_){}

    try{
      if(window.SF_DIAGNOSIS_SVG_ASSETS && typeof window.SF_DIAGNOSIS_SVG_ASSETS.reapplyDiagnosisSkin === 'function'){
        window.SF_DIAGNOSIS_SVG_ASSETS.reapplyDiagnosisSkin('diagnosis-ui-v6r252');
      }else if(window.SF_DIAGNOSIS_SVG_ASSETS && typeof window.SF_DIAGNOSIS_SVG_ASSETS.installDiagnosisSkin === 'function'){
        window.SF_DIAGNOSIS_SVG_ASSETS.installDiagnosisSkin();
      }
    }catch(_){}

    if(renderGenericDiagnosis._lastLog !== id + ':' + VERSION){
      renderGenericDiagnosis._lastLog = id + ':' + VERSION;
      console.log('[Signal Flow] Diagnosis generic GUI active', VERSION, id, diagnosisChoices(t).length);
    }

    return true;
  }'''
js = replace_function(js, "renderGenericDiagnosis", render_fn)

deact_fn = r'''  function deactivateIfNeeded(){
    if(isDiagnosisBoard()) return;

    const main = qs('main.game.sfdiag-ui-active') || qs('main.sfdiag-ui-active') || qs('#app.sfdiag-ui-active') || qs('.sfdiag-ui-active');
    if(main){
      main.classList.remove('sfdiag-ui-active');
      delete main.dataset.sfdiagVersion;
    }

    qsa('[data-sfdiag-stage-owned="true"], .sfdiag-board-shell[data-sfdiag-rendered-level]').forEach(host => {
      if(host.dataset.sfdiagStageOwned === 'true'){
        host.innerHTML = '';
      }
      delete host.dataset.sfdiagStageOwned;
      host.removeAttribute('data-sfdiag-rendered-level');
      host.classList.remove('sfdiag-board-shell');
    });

    qsa('[data-sfdiag-decorator]').forEach(el => el.remove());
    qsa('[data-sfdiag-generic-panel="true"]').forEach(el => el.remove());
    qsa('.sf-diagnosis-art-layer').forEach(el => el.remove());
  }'''
js = replace_function(js, "deactivateIfNeeded", deact_fn)

# Remove the v6r251 interval watchdog if present.
js = re.sub(
    r"\n\s*// Diagnosis recovery watchdog v6r251:.*?setInterval\(\(\) => \{.*?\}, 350\);\n",
    "\n",
    js,
    flags=re.S
)

js_path.write_text(js)
print("[OK] patched diagnosis hard stage mount v6r252")

# Skin should attach only to generic panel when present.
if skin_js_path.exists():
    backup(skin_js_path)
    skin_js = skin_js_path.read_text()
    # Insert a generic-panel preference into activeDiagnosisPanel if possible.
    if "const generic = qsa('[data-sfdiag-generic-panel=\"true\"]')" not in skin_js:
        skin_js = skin_js.replace(
            "  function activeDiagnosisPanel() {",
            """  function activeDiagnosisPanel() {
    const generic = qsa('[data-sfdiag-generic-panel="true"]')
      .filter(isVisible)
      .sort((a, b) => rectArea(b) - rectArea(a))[0];
    if (generic) return generic;
""",
            1
        )
        print("[OK] made skin prefer generic panel")
    skin_js_path.write_text(skin_js)

for p in launch_files:
    if not p.exists():
        continue
    html = p.read_text()
    new_html = re.sub(r'diagnosis-ui\.js\?v=6r\d+', 'diagnosis-ui.js?v=6r252', html)
    new_html = re.sub(r'diagnosis-ui\.css\?v=6r\d+', 'diagnosis-ui.css?v=6r252', new_html)
    new_html = re.sub(r'sf-diagnosis-svg-skin\.js\?v=6r\d+', 'sf-diagnosis-svg-skin.js?v=6r252', new_html)
    new_html = re.sub(r'sf-diagnosis-svg-skin\.css\?v=6r\d+', 'sf-diagnosis-svg-skin.css?v=6r252', new_html)
    if new_html != html:
        backup(p)
        p.write_text(new_html)
        print("[OK] bumped diagnosis refs in", p)

print("\nDiagnosis hard-stage mount v6r252 complete.")
