from pathlib import Path
import re
import shutil
from datetime import datetime

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

js_path = Path("patch/diagnosis-ui.js")
launch_files = [
    Path("launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html"),
    Path("launch/Signal_Flow_CRASH_TEST_NO_EMBEDDED_MEDIA.html"),
]

def backup(path):
    if path.exists():
        b = path.with_name(path.name + f".bak_diag_ui_v6r251_{stamp}")
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

js = re.sub(r"const VERSION = '6r\d+';", "const VERSION = '6r251';", js, count=1)

helpers = r'''
  function sfdiagRectVisible(el){
    if(!el || !el.isConnected) return false;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return cs.display !== 'none' &&
      cs.visibility !== 'hidden' &&
      r.width > 240 &&
      r.height > 160;
  }

  function sfdiagVisibleGenericPanel(){
    return qsa('[data-sfdiag-generic-panel="true"]').find(sfdiagRectVisible) || null;
  }

  function sfdiagSelectedRawText(){
    return [
      location.hash || '',
      location.href || '',
      qsa('select').map(s => {
        const opt = s.selectedOptions && s.selectedOptions[0];
        return [s.id || '', s.className || '', s.value || '', opt && opt.value || '', opt && opt.textContent || ''].join(' ');
      }).join(' '),
      qs('.game-title')?.textContent || ''
    ].join(' ');
  }

  function sfdiagIdFromText(text){
    const m = String(text || '').match(/\b[A-Z]{3}-\d{3}\b/);
    return m ? m[0] : '';
  }

  function sfdiagLevelById(id){
    if(!id) return null;
    try{
      if(window.DATA && Array.isArray(window.DATA.levels)){
        return window.DATA.levels.find(l =>
          l &&
          l.id === id &&
          l.training &&
          l.training.type === 'diagnose'
        ) || null;
      }
    }catch(_){}
    return null;
  }

  function sfdiagCurrentDiagnosisLevel(){
    const raw = sfdiagSelectedRawText();
    const directId = sfdiagIdFromText(raw);
    const directLevel = sfdiagLevelById(directId);
    if(directLevel) return directLevel;

    try{
      if(typeof window.level === 'function'){
        const l = window.level();
        if(l && l.training && l.training.type === 'diagnose') return l;
      }
    }catch(_){}

    try{
      const l = window.state && window.state.level;
      if(l && l.training && l.training.type === 'diagnose') return l;
    }catch(_){}

    return null;
  }

  function sfdiagIsCurrentDiagnosis(){
    return Boolean(sfdiagCurrentDiagnosisLevel()) ||
      /\[DIAG\]|diagnose|diagnosis/i.test(sfdiagSelectedRawText());
  }

  function sfdiagStableHost(){
    const main = gameRoot();

    const existing = qsa('.sfdiag-board-shell').find(el => {
      if(el.matches && el.matches('[data-training-panel="diagnose"], .diagnose-panel')) return false;
      return sfdiagRectVisible(el);
    });
    if(existing) return existing;

    const candidates = [
      qs('.training-stage-shell'),
      qs('.level-shell'),
      qs('.training-only-board'),
      qs('.board-card'),
      qs('main.game'),
      qs('main'),
      qs('#app'),
      main
    ].filter(Boolean).filter(el => {
      if(el.matches && el.matches('[data-training-panel="diagnose"], .diagnose-panel')) return false;
      if(el.closest && el.closest('.sf-build-room-v6r227')) return false;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return cs.display !== 'none' &&
        cs.visibility !== 'hidden' &&
        r.width > 420 &&
        r.height > 260;
    });

    let host = candidates[0] || main || document.body;

    if(host.matches && host.matches('[data-training-panel="diagnose"], .diagnose-panel')){
      host = host.parentElement || main || document.body;
    }

    return host;
  }

  function sfdiagClearOldGeneratedPanels(host){
    qsa('[data-sfdiag-generic-panel="true"]').forEach(el => {
      if(host && el.parentElement === host) return;
      el.remove();
    });
    qsa('[data-sfdiag-decorator]').forEach(el => {
      if(host && el.parentElement === host) return;
      el.remove();
    });
    qsa('.sf-diagnosis-art-layer').forEach(el => {
      if(host && el.parentElement === host.querySelector('[data-sfdiag-generic-panel="true"]')) return;
      if(host && host.contains(el)) return;
      el.remove();
    });
  }

  function sfdiagHideLegacyPanels(host, generated){
    try{
      const active = document.activeElement;
      if(active && active.matches && active.matches('.diagnose-patch, .sf-diagnosis-choice-card, .sfv174-diagnose-item, .sfv175-diagnose-item')){
        active.blur();
      }
    }catch(_){}

    qsa('[data-training-panel="diagnose"], .diagnose-panel').forEach(el => {
      if(el === generated || generated.contains(el) || el.contains(generated)) return;
      if(el.getAttribute('data-sfdiag-generic-panel') === 'true') return;

      el.setAttribute('data-sfdiag-legacy-diagnosis', 'hidden');
      el.setAttribute('aria-hidden', 'true');
      el.style.display = 'none';
      el.style.visibility = 'hidden';
      el.style.pointerEvents = 'none';
    });
  }
'''

if "function sfdiagStableHost()" not in js:
    marker = "  function removeOldDecorators(board){"
    if marker not in js:
      raise SystemExit("Could not find insertion marker before removeOldDecorators")
    js = js.replace(marker, helpers + "\n" + marker, 1)
    print("[OK] inserted v6r251 diagnosis recovery helpers")
else:
    print("[SKIP] v6r251 helpers already present")

selected_fn = r'''  function selectedDiagnosisId(){
    const level = sfdiagCurrentDiagnosisLevel && sfdiagCurrentDiagnosisLevel();
    if(level && level.id) return level.id;

    const raw = sfdiagSelectedRawText && sfdiagSelectedRawText();
    const id = sfdiagIdFromText && sfdiagIdFromText(raw);
    if(id) return id;

    const visible = (qs('.game-title')?.textContent || document.body.textContent || '').match(/\b[A-Z]{3}-\d{3}\b/);
    return visible ? visible[0] : '';
  }'''
js = replace_function(js, "selectedDiagnosisId", selected_fn)

render_fn = r'''  function renderGenericDiagnosis(){
    const l = sfdiagCurrentDiagnosisLevel();
    if(!l && !isDiagnosisBoard()) return false;

    const main = gameRoot();
    const levelObj = l || currentLevelObject();
    const t = (levelObj && levelObj.training && levelObj.training.type === 'diagnose')
      ? levelObj.training
      : currentDiagnosisTraining();

    if(!main || !t) return false;

    const id = (levelObj && levelObj.id) || levelId();
    const board = sfdiagStableHost();

    if(!board) return false;

    const existingId = board.getAttribute('data-sfdiag-rendered-level');
    if(main.dataset.sfdiagVersion !== VERSION || existingId !== id){
      removeOldDecorators(board);
      qsa(':scope > [data-sfdiag-generic-panel="true"]', board).forEach(el => el.remove());
      qsa(':scope > .sf-diagnosis-art-layer', board).forEach(el => el.remove());
      sfdiagClearOldGeneratedPanels(board);
    }

    main.classList.add('sfdiag-ui-active');
    main.dataset.sfdiagVersion = VERSION;

    board.classList.add('sfdiag-board-shell');
    board.setAttribute('data-sfdiag-rendered-level', id || 'unknown');
    if(getComputedStyle(board).position === 'static'){
      board.style.position = 'relative';
    }

    let panel = qs(':scope > [data-sfdiag-generic-panel="true"]', board);
    if(!panel){
      board.insertAdjacentHTML('afterbegin', generatedPanelHtml(levelObj, t));
      panel = qs(':scope > [data-sfdiag-generic-panel="true"]', board);
    }

    if(!panel) return false;

    panel.classList.add('sfdiag-clipboard-panel', 'sfdiag-generic-panel');
    panel.setAttribute('data-training-panel', 'diagnose');
    panel.setAttribute('data-training-only', 'true');
    panel.setAttribute('data-sfdiag-generic-panel', 'true');
    panel.setAttribute('data-sfdiag-level-id', id || 'unknown');

    bindGeneratedPanel(panel);
    sfdiagHideLegacyPanels(board, panel);

    if(!qs(':scope > [data-sfdiag-decorator="left"]', board)) board.insertAdjacentHTML('afterbegin', labLeftHtml());
    if(!qs(':scope > [data-sfdiag-decorator="right"]', board)) board.insertAdjacentHTML('beforeend', labRightHtml());
    if(!qs(':scope > [data-sfdiag-decorator="workflow"]', board)) board.insertAdjacentHTML('beforeend', workflowHtml());

    setPatchTester('neutral');

    document.documentElement.classList.remove('sfdiag-precloak-pending','sfdiag-cloak-failsafe-open');

    try{
      window.dispatchEvent(new CustomEvent('sf:diagnosis-generic-rendered', {
        detail: { levelId: id, version: VERSION }
      }));
    }catch(_){}

    try{
      if(window.SF_DIAGNOSIS_SVG_ASSETS && typeof window.SF_DIAGNOSIS_SVG_ASSETS.reapplyDiagnosisSkin === 'function'){
        window.SF_DIAGNOSIS_SVG_ASSETS.reapplyDiagnosisSkin('diagnosis-ui-v6r251');
      }else if(window.SF_DIAGNOSIS_SVG_ASSETS && typeof window.SF_DIAGNOSIS_SVG_ASSETS.installDiagnosisSkin === 'function'){
        window.SF_DIAGNOSIS_SVG_ASSETS.installDiagnosisSkin();
      }
    }catch(_){}

    console.log('[Signal Flow] Diagnosis generic GUI active', VERSION, id, diagnosisChoices(t).length);
    return true;
  }'''
js = replace_function(js, "renderGenericDiagnosis", render_fn)

deact_fn = r'''  function deactivateIfNeeded(){
    if(sfdiagIsCurrentDiagnosis && sfdiagIsCurrentDiagnosis()) return;

    const main = qs('main.game.sfdiag-ui-active') || qs('main.sfdiag-ui-active') || qs('#app.sfdiag-ui-active') || qs('.sfdiag-ui-active');
    if(!main) return;

    main.classList.remove('sfdiag-ui-active');
    delete main.dataset.sfdiagVersion;

    qsa('[data-sfdiag-decorator]').forEach(el => el.remove());
    qsa('[data-sfdiag-generic-panel="true"]').forEach(el => el.remove());
    qsa('.sf-diagnosis-art-layer').forEach(el => el.remove());

    qsa('[data-sfdiag-legacy-diagnosis="hidden"]').forEach(el => {
      el.removeAttribute('data-sfdiag-legacy-diagnosis');
      el.removeAttribute('aria-hidden');
      el.style.display = '';
      el.style.visibility = '';
      el.style.pointerEvents = '';
    });

    qsa('.sfdiag-board-shell').forEach(el => {
      el.classList.remove('sfdiag-board-shell');
      el.removeAttribute('data-sfdiag-rendered-level');
    });
  }'''
js = replace_function(js, "deactivateIfNeeded", deact_fn)

# Add a recovery watchdog after the existing schedule(80); but only once.
if "Diagnosis recovery watchdog v6r251" not in js:
    js = js.replace(
        "  schedule(80);\n})();",
        """  schedule(80);

  // Diagnosis recovery watchdog v6r251:
  // If a diagnosis level is selected/current but no visible generic panel exists,
  // recover the renderer after transitions from Build-a-Room or native boards.
  let sfdiagWatchLast = '';
  setInterval(() => {
    try{
      if(!sfdiagIsCurrentDiagnosis()) return;
      const visibleGeneric = sfdiagVisibleGenericPanel();
      if(visibleGeneric) return;

      const id = selectedDiagnosisId();
      const key = id + ':' + Date.now().toString().slice(0, -3);
      if(key === sfdiagWatchLast) return;
      sfdiagWatchLast = key;

      refresh();
    }catch(_){}
  }, 350);
})();""",
        1
    )
    print("[OK] added diagnosis recovery watchdog v6r251")
else:
    print("[SKIP] watchdog already present")

js_path.write_text(js)
print("[OK] patched diagnosis recovery after build-room/native transitions v6r251")

for p in launch_files:
    if not p.exists():
        continue
    html = p.read_text()
    new_html = re.sub(r'diagnosis-ui\.js\?v=6r\d+', 'diagnosis-ui.js?v=6r251', html)
    new_html = re.sub(r'diagnosis-ui\.css\?v=6r\d+', 'diagnosis-ui.css?v=6r251', new_html)
    if new_html != html:
        backup(p)
        p.write_text(new_html)
        print("[OK] bumped diagnosis-ui refs in", p)

print("\nDiagnosis recovery v6r251 complete.")
