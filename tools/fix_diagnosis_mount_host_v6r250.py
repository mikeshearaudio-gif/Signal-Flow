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
        b = path.with_name(path.name + f".bak_diag_ui_v6r250_{stamp}")
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

js = re.sub(r"const VERSION = '6r\d+';", "const VERSION = '6r250';", js, count=1)

helper = r'''
  function resolveDiagnosisMountHost(rawBoard){
    const main = gameRoot();
    if(!rawBoard || !main) return rawBoard;

    const isLegacyDiagnosisPanel =
      rawBoard.matches &&
      rawBoard.matches('[data-training-panel="diagnose"], .diagnose-panel') &&
      rawBoard.getAttribute('data-sfdiag-generic-panel') !== 'true';

    if(!isLegacyDiagnosisPanel) return rawBoard;

    const rawRect = rawBoard.getBoundingClientRect();

    const candidates = [
      rawBoard.parentElement,
      rawBoard.closest('.training-stage-board'),
      rawBoard.closest('.training-stage-shell'),
      rawBoard.closest('.level-shell'),
      rawBoard.closest('.training-only-board'),
      rawBoard.closest('.board-card'),
      main
    ].filter(Boolean).filter(el => {
      if(el === rawBoard) return false;
      if(el.matches && el.matches('[data-training-panel="diagnose"], .diagnose-panel')) return false;
      const r = el.getBoundingClientRect();
      return r.width >= Math.min(420, rawRect.width * 0.7) && r.height >= Math.min(220, rawRect.height * 0.7);
    });

    return candidates[0] || rawBoard.parentElement || rawBoard;
  }

  function blurDiagnosisButtons(root){
    try{
      const active = document.activeElement;
      if(active && active.matches && active.matches('.diagnose-patch, .sf-diagnosis-choice-card, .sfv174-diagnose-item, .sfv175-diagnose-item')){
        active.blur();
      }
    }catch(_){}
  }

  function restoreLegacyDiagnosisPanels(root){
    qsa('[data-sfdiag-legacy-diagnosis="hidden"]', root || document).forEach(el => {
      el.removeAttribute('data-sfdiag-legacy-diagnosis');
      el.removeAttribute('aria-hidden');
      el.style.display = '';
      el.style.visibility = '';
      el.style.pointerEvents = '';
    });
  }

  function hideLegacyDiagnosisPanels(root, generated){
    blurDiagnosisButtons(root);

    qsa('[data-training-panel="diagnose"], .diagnose-panel', root || document).forEach(el => {
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

if "function resolveDiagnosisMountHost(rawBoard)" not in js:
    marker = "  function removeOldDecorators(board){"
    if marker not in js:
        raise SystemExit("Could not find insertion marker before removeOldDecorators")
    js = js.replace(marker, helper + "\n" + marker, 1)
    print("[OK] inserted diagnosis mount host helpers")
else:
    print("[SKIP] diagnosis mount host helpers already present")

render_fn = r'''  function renderGenericDiagnosis(){
    if(!isDiagnosisBoard()) return false;

    const main = gameRoot();
    const l = currentLevelObject();
    const t = currentDiagnosisTraining();
    const rawBoard = findBoardShell();
    const board = resolveDiagnosisMountHost(rawBoard);

    if(!main || !board || !t) return false;

    const id = (l && l.id) || levelId();
    const existingId = board.getAttribute('data-sfdiag-rendered-level');

    // v6r250: The generated generic panel must be a child of the real board host,
    // never nested inside the legacy .diagnose-panel. Diag-to-diag navigation can
    // cause findBoardShell() to return the legacy diagnosis panel itself.
    if(main.dataset.sfdiagVersion !== VERSION || existingId !== id){
      removeOldDecorators(board);
      restoreLegacyDiagnosisPanels(board);
      qsa('[data-sfdiag-generic-panel="true"]', board).forEach(el => el.remove());
      qsa('.sf-diagnosis-art-layer', board).forEach(el => el.remove());
    }

    main.classList.add('sfdiag-ui-active');
    main.dataset.sfdiagVersion = VERSION;

    board.classList.add('sfdiag-board-shell');
    board.setAttribute('data-sfdiag-rendered-level', id || 'unknown');

    let panel = qs(':scope > [data-sfdiag-generic-panel="true"]', board);
    if(!panel){
      board.insertAdjacentHTML('afterbegin', generatedPanelHtml(l, t));
      panel = qs(':scope > [data-sfdiag-generic-panel="true"]', board);
    }

    if(!panel) return false;

    panel.classList.add('sfdiag-clipboard-panel', 'sfdiag-generic-panel');
    panel.setAttribute('data-training-panel', 'diagnose');
    panel.setAttribute('data-training-only', 'true');
    panel.setAttribute('data-sfdiag-generic-panel', 'true');
    panel.setAttribute('data-sfdiag-level-id', id || 'unknown');

    bindGeneratedPanel(panel);

    // Hide legacy panels after the new generic panel is present and bound.
    hideLegacyDiagnosisPanels(board, panel);

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
        window.SF_DIAGNOSIS_SVG_ASSETS.reapplyDiagnosisSkin('diagnosis-ui-v6r250');
      }else if(window.SF_DIAGNOSIS_SVG_ASSETS && typeof window.SF_DIAGNOSIS_SVG_ASSETS.installDiagnosisSkin === 'function'){
        window.SF_DIAGNOSIS_SVG_ASSETS.installDiagnosisSkin();
      }
    }catch(_){}

    console.log('[Signal Flow] Diagnosis generic GUI active', VERSION, id, diagnosisChoices(t).length);
    return true;
  }'''

js = replace_function(js, "renderGenericDiagnosis", render_fn)

# Make deactivate clean up the host-level class/attrs without disturbing other formats.
deact_fn = r'''  function deactivateIfNeeded(){
    if(isDiagnosisBoard()) return;
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

js_path.write_text(js)
print("[OK] patched diagnosis mount ownership v6r250")

for p in launch_files:
    if not p.exists():
        continue
    html = p.read_text()
    new_html = re.sub(r'diagnosis-ui\.js\?v=6r\d+', 'diagnosis-ui.js?v=6r250', html)
    new_html = re.sub(r'diagnosis-ui\.css\?v=6r\d+', 'diagnosis-ui.css?v=6r250', new_html)
    if new_html != html:
        backup(p)
        p.write_text(new_html)
        print("[OK] bumped diagnosis-ui refs in", p)

print("\nDiagnosis mount ownership v6r250 complete.")
