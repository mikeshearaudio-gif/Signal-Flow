from pathlib import Path
import re
import shutil
from datetime import datetime

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

js_path = Path("patch/sf-build-room-renderer.js")
launch_files = [
    Path("launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html"),
    Path("launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html"),
    Path("launch/Signal_Flow_CRASH_TEST_NO_EMBEDDED_MEDIA.html"),
]

def backup(path):
    if path.exists():
        b = path.with_name(path.name + f".bak_buildroom_v6r266_{stamp}")
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
    raise SystemExit("Missing patch/sf-build-room-renderer.js")

backup(js_path)
js = js_path.read_text()

apply_fn = r'''  function applyBuildRoomShellMode(root){
    try{
      document.body.classList.add('sf-build-room-v6r227-active');

      if(!root) return;

      const levelId = (typeof currentLevelId === 'function' ? currentLevelId() : '') || '';
      document.body.dataset.sfBrShellModeKey = 'build-room:' + levelId;

      root.style.setProperty('--sf-br-shell-shift', '0px');
      if(root.parentElement){
        root.parentElement.style.overflow = 'visible';
      }

      const rootRect = root.getBoundingClientRect();

      const candidates = Array.from(document.querySelectorAll('body *')).filter(el => {
        if(!el || el === root || root.contains(el) || el.contains(root)) return false;
        if(el.dataset.sfBrShellHidden === 'true') return false;

        const r = el.getBoundingClientRect && el.getBoundingClientRect();
        if(!r || r.width < 120 || r.height < 220) return false;

        const cs = getComputedStyle(el);
        if(cs.display === 'none' || cs.visibility === 'hidden') return false;

        return (
          r.left >= 0 &&
          r.left < rootRect.left - 12 &&
          r.top > 90 &&
          r.width <= 380 &&
          r.height >= 300
        );
      });

      candidates.sort((a,b) => {
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        return (br.width * br.height) - (ar.width * ar.height);
      });

      const hidden = [];

      for(const el of candidates){
        if(hidden.some(parent => parent.contains(el))) continue;

        const txt = String(el.textContent || '');
        const cls = String(el.className || '');
        const looksLikeLessonShell =
          /Current Level|Level Brief|Build the Room|Patch these|Reality Check|Learning Goals|Format Awareness|Why this setup matters|Front fill matrix/i.test(txt) ||
          /level|brief|lesson|sidebar|education|training/i.test(cls);

        if(!looksLikeLessonShell) continue;

        el.dataset.sfBrShellHidden = 'true';
        el.dataset.sfBrPrevDisplay = el.style.display || '';
        el.dataset.sfBrPrevVisibility = el.style.visibility || '';
        el.dataset.sfBrPrevPointerEvents = el.style.pointerEvents || '';
        el.style.display = 'none';
        el.style.visibility = 'hidden';
        el.style.pointerEvents = 'none';
        hidden.push(el);

        if(hidden.length >= 2) break;
      }

      // v6r266: rescan every render, but only log when a new shell element is hidden.
      if(hidden.length){
        console.log('[Signal Flow] Build-a-Room shell mode hid shell v6r266', {hidden: hidden.length});
      }
    }catch(err){
      console.warn('[Signal Flow] Build-a-Room shell mode failed v6r266', err);
    }
  }'''

clear_fn = r'''  function clearBuildRoomShellMode(removeClass = true){
    try{
      if(removeClass){
        document.body.classList.remove('sf-build-room-v6r227-active');
      }
      delete document.body.dataset.sfBrShellModeKey;

      document.querySelectorAll('[data-sf-br-shell-hidden="true"]').forEach(el => {
        el.style.display = el.dataset.sfBrPrevDisplay || '';
        el.style.visibility = el.dataset.sfBrPrevVisibility || '';
        el.style.pointerEvents = el.dataset.sfBrPrevPointerEvents || '';
        delete el.dataset.sfBrShellHidden;
        delete el.dataset.sfBrPrevDisplay;
        delete el.dataset.sfBrPrevVisibility;
        delete el.dataset.sfBrPrevPointerEvents;
      });
    }catch(_){}
  }'''

js = replace_function(js, "applyBuildRoomShellMode", apply_fn)
js = replace_function(js, "clearBuildRoomShellMode", clear_fn)

js = js.replace("shell mode applied v6r265", "shell mode hid shell v6r266")
js = js.replace("shell mode failed v6r265", "shell mode failed v6r266")

js_path.write_text(js)
print("[OK] patched Build-a-Room shell rescan v6r266")

for p in launch_files:
    if not p.exists():
        continue
    html = p.read_text()
    new_html = re.sub(r'sf-build-room-renderer\.js\?v=6r\d+', 'sf-build-room-renderer.js?v=6r266', html)
    new_html = re.sub(r'sf-build-room-renderer\.css\?v=6r\d+', 'sf-build-room-renderer.css?v=6r266', new_html)
    if new_html != html:
        backup(p)
        p.write_text(new_html)
        print("[OK] bumped build-room cache in", p)

print("\nBuild-a-Room shell rescan v6r266 patch complete.")
