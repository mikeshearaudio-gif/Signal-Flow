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
        b = path.with_name(path.name + f".bak_diag_recursion_v6r253_{stamp}")
        shutil.copy2(path, b)
        print("[OK] backup", b)

def replace_function(src, name, replacement):
    needle = "  function " + name
    idx = src.find(needle)
    if idx < 0:
        print("[WARN] function not found:", name)
        return src

    brace = src.find("{", idx)
    if brace < 0:
        raise SystemExit(f"No opening brace for {name}")

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

    raise SystemExit(f"Could not find closing brace for {name}")

if not js_path.exists():
    raise SystemExit("Missing patch/diagnosis-ui.js")

backup(js_path)
js = js_path.read_text()

js = re.sub(r"const VERSION = '6r\d+';", "const VERSION = '6r253';", js, count=1)

safe_lookup_helpers = r'''
  function sfdiagExtractId(text){
    const m = String(text || '').match(/\b[A-Z]{3}-\d{3}\b/);
    return m ? m[0] : '';
  }

  function sfdiagLevelById(id){
    if(!id) return null;
    try{
      if(window.DATA && Array.isArray(window.DATA.levels)){
        return window.DATA.levels.find(l => l && l.id === id) || null;
      }
    }catch(_){}
    return null;
  }

  function sfdiagDiagnosisLevelById(id){
    const l = sfdiagLevelById(id);
    return (l && l.training && l.training.type === 'diagnose') ? l : null;
  }

  function sfdiagSelectedIdNoRecursion(){
    // Important: no calls to selectedDiagnosisId(), currentLevelObject(),
    // levelId(), or sfdiagCurrentDiagnosisLevelObject() in this function.
    const hashId = sfdiagExtractId(location.hash || location.href || '');
    if(hashId) return hashId;

    for(const s of qsa('select')){
      const opt = s.selectedOptions && s.selectedOptions[0];
      const raw = [
        s.value || '',
        opt && opt.value || '',
        opt && opt.textContent || '',
        s.id || '',
        s.className || ''
      ].join(' ');
      const id = sfdiagExtractId(raw);
      if(id) return id;
    }

    return sfdiagExtractId(qs('.game-title')?.textContent || document.body.textContent || '');
  }

'''

if "function sfdiagSelectedIdNoRecursion()" not in js:
    marker = "  function selectedDiagnosisId(){"
    if marker not in js:
        raise SystemExit("Could not find selectedDiagnosisId insertion marker")
    js = js.replace(marker, safe_lookup_helpers + "\n" + marker, 1)
    print("[OK] inserted non-recursive diagnosis lookup helpers")
else:
    print("[SKIP] non-recursive helpers already present")

selected_fn = r'''  function selectedDiagnosisId(){
    const id = sfdiagSelectedIdNoRecursion();
    if(id) return id;
    return '';
  }'''

current_fn = r'''  function currentLevelObject(){
    const id = sfdiagSelectedIdNoRecursion();

    // Prefer the explicit selected/hash ID, but only accept DATA levels.
    const byId = sfdiagLevelById(id);
    if(byId) return byId;

    // Safe fallbacks. These must not call selectedDiagnosisId/currentLevelObject.
    try{
      if(typeof window.level === 'function'){
        const l = window.level();
        if(l && l.id) return l;
      }
    }catch(_){}

    try{
      const l = window.state && window.state.level;
      if(l && l.id) return l;
    }catch(_){}

    return null;
  }'''

level_id_fn = r'''  function levelId(){
    const l = currentLevelObject();
    return (l && l.id) || sfdiagSelectedIdNoRecursion() || '';
  }'''

sfdiag_current_fn = r'''  function sfdiagCurrentDiagnosisLevelObject(){
    const id = sfdiagSelectedIdNoRecursion();

    const byId = sfdiagDiagnosisLevelById(id);
    if(byId) return byId;

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
  }'''

js = replace_function(js, "selectedDiagnosisId", selected_fn)
js = replace_function(js, "currentLevelObject", current_fn)
js = replace_function(js, "levelId", level_id_fn)
js = replace_function(js, "sfdiagCurrentDiagnosisLevelObject", sfdiag_current_fn)

# Disable the v6r252 hard-stage path only if it is still present and causing recursion/layout chaos.
# Leave renderGenericDiagnosis itself intact for now; this patch is only to stop the crash.

js_path.write_text(js)
print("[OK] patched diagnosis recursion break v6r253")

for p in launch_files:
    if not p.exists():
        continue
    html = p.read_text()
    new_html = re.sub(r'diagnosis-ui\.js\?v=6r\d+', 'diagnosis-ui.js?v=6r253', html)
    new_html = re.sub(r'diagnosis-ui\.css\?v=6r\d+', 'diagnosis-ui.css?v=6r253', new_html)
    if new_html != html:
        backup(p)
        p.write_text(new_html)
        print("[OK] bumped diagnosis-ui refs in", p)

print("\nDiagnosis recursion break v6r253 complete.")
