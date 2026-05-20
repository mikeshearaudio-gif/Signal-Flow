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
        b = path.with_name(path.name + f".bak_diag_ui_v6r249_{stamp}")
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

# Make console/version honest.
js = re.sub(r"const VERSION = '6r\d+';", "const VERSION = '6r249';", js, count=1)

selected_fn = r'''  function selectedDiagnosisId(){
    function idFromText(text){
      const m = String(text || '').match(/\b[A-Z]{3}-\d{3}\b/);
      return m ? m[0] : '';
    }

    function diagnosisLevelById(id){
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
      }catch(_){ }
      return null;
    }

    // v6r249: hash / URL is the most reliable source during diag-to-diag navigation.
    // The previous version ignored the hash and only trusted select text containing
    // [DIAG] / diagnose, which can fail while the shell is replacing levels.
    const hashId = idFromText(location.hash || location.href);
    if(diagnosisLevelById(hashId)) return hashId;

    // Prefer any selected level/board control whose value or label maps to a
    // DATA diagnosis level. Do not require "[DIAG]" in the option label.
    const selects = qsa('select');
    for(const s of selects){
      const opt = s.selectedOptions && s.selectedOptions[0];
      const text = [
        s.value || '',
        opt && opt.value || '',
        opt && opt.textContent || '',
        s.id || '',
        s.className || ''
      ].join(' ');

      const id = idFromText(text);
      if(diagnosisLevelById(id)) return id;
    }

    // If window.level/state is already current, use it.
    try{
      if(typeof window.level === 'function'){
        const l = window.level();
        if(l && l.id && l.training && l.training.type === 'diagnose') return l.id;
      }
    }catch(_){ }

    try{
      const l = window.state && window.state.level;
      if(l && l.id && l.training && l.training.type === 'diagnose') return l.id;
    }catch(_){ }

    // Last resort: if the selected dropdown text explicitly says DIAG, accept that ID.
    for(const s of selects){
      const opt = s.selectedOptions && s.selectedOptions[0];
      const text = ((opt && opt.textContent) || '') + ' ' + (s.value || '');
      if(/\[DIAG\]|diagnose/i.test(text)){
        const id = idFromText(text);
        if(id) return id;
      }
    }

    const visible = idFromText(qs('.game-title')?.textContent || document.body.textContent || '');
    return visible;
  }'''

js = replace_function(js, "selectedDiagnosisId", selected_fn)

# Add an explicit event bridge after generic render logs, if not already present.
if "sf:diagnosis-generic-rendered" not in js:
    old_log = "console.log('[Signal Flow] Diagnosis generic GUI active', VERSION, levelId(), diagnosisChoices(t).length);"
    new_log = old_log + """
      try{
        window.dispatchEvent(new CustomEvent('sf:diagnosis-generic-rendered', {
          detail: { levelId: levelId(), version: VERSION }
        }));
      }catch(_){ }"""
    if old_log in js:
        js = js.replace(old_log, new_log, 1)
        print("[OK] added diagnosis generic rendered event")
    else:
        print("[WARN] generic GUI active log not found; skipped event injection")

js_path.write_text(js)
print("[OK] patched diagnosis selected level detection v6r249")

for p in launch_files:
    if not p.exists():
        continue
    html = p.read_text()
    new_html = re.sub(r'diagnosis-ui\.js\?v=6r\d+', 'diagnosis-ui.js?v=6r249', html)
    new_html = re.sub(r'diagnosis-ui\.css\?v=6r\d+', 'diagnosis-ui.css?v=6r249', new_html)
    if new_html != html:
        backup(p)
        p.write_text(new_html)
        print("[OK] bumped diagnosis-ui refs in", p)

print("\nDiagnosis UI selected-level repair v6r249 complete.")
