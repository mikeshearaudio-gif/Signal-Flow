from pathlib import Path
import re
import shutil
from datetime import datetime

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

js_path = Path("patch/sf-build-room-renderer.js")
css_path = Path("patch/sf-build-room-renderer.css")
launch_files = [
    Path("launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html"),
    Path("launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html"),
    Path("launch/Signal_Flow_CRASH_TEST_NO_EMBEDDED_MEDIA.html"),
]

def backup(path):
    if path.exists():
        b = path.with_name(path.name + f".bak_buildroom_v6r263_{stamp}")
        shutil.copy2(path, b)
        print("[OK] backup", b)

if not js_path.exists():
    raise SystemExit("Missing patch/sf-build-room-renderer.js")
if not css_path.exists():
    raise SystemExit("Missing patch/sf-build-room-renderer.css")

backup(js_path)
backup(css_path)

js = js_path.read_text()
css = css_path.read_text()

# 1. Put Reset/Submit on the opposite side of the credit boxes:
#    actions first, metrics second.
old_top_side = '''        <div class="sf-br-top-side">
          <div class="sf-br-metrics">
            <div class="sf-br-metric"><div class="sf-br-metric-label">Credits available</div><div class="sf-br-metric-value">${totals.availableCredits}</div></div>
            <div class="sf-br-metric"><div class="sf-br-metric-label">New spend</div><div class="sf-br-metric-value">${money.spend}</div></div>
            <div class="sf-br-metric"><div class="sf-br-metric-label">Owned applied</div><div class="sf-br-metric-value">${money.ownedApplied}</div></div>
          </div>
          <div class="sf-br-actions sf-br-top-actions">
            <button class="sf-br-btn danger" data-sf-br-action="reset">Reset Build</button>
            <button class="sf-br-btn" data-sf-br-action="check">Submit Build</button>
          </div>
        </div>'''

new_top_side = '''        <div class="sf-br-top-side">
          <div class="sf-br-actions sf-br-top-actions">
            <button class="sf-br-btn danger" data-sf-br-action="reset">Reset Build</button>
            <button class="sf-br-btn" data-sf-br-action="check">Submit Build</button>
          </div>
          <div class="sf-br-metrics">
            <div class="sf-br-metric"><div class="sf-br-metric-label">Credits available</div><div class="sf-br-metric-value">${totals.availableCredits}</div></div>
            <div class="sf-br-metric"><div class="sf-br-metric-label">New spend</div><div class="sf-br-metric-value">${money.spend}</div></div>
            <div class="sf-br-metric"><div class="sf-br-metric-label">Owned applied</div><div class="sf-br-metric-value">${money.ownedApplied}</div></div>
          </div>
        </div>'''

if old_top_side in js:
    js = js.replace(old_top_side, new_top_side, 1)
    print("[OK] moved Reset/Submit before credit metrics")
else:
    print("[WARN] exact v6r262 top-side block not found; checking if already reordered")
    if "sf-br-top-actions" not in js or "sf-br-metrics" not in js:
        raise SystemExit("Could not verify top action/metric blocks.")

# 2. Reclaim the old left shell/sidebar width.
#    v6r262 hides the legacy sidebar, but the Build-a-Room root still starts to its right.
#    This sets a CSS variable based on root.left and lets CSS pull the shared renderer left.
if "root.style.setProperty('--sf-br-shell-shift'" not in js:
    needle = '''      const rootRect = root.getBoundingClientRect();
      const candidates = Array.from(document.querySelectorAll('body > * , body *')).filter(el => {'''
    repl = '''      const rootRect = root.getBoundingClientRect();

      // Build-a-Room locked layout v6r263:
      // Reclaim the hidden shell/sidebar column so .sf-br-left becomes the real left column.
      const shellShift = Math.max(0, Math.min(330, Math.round(rootRect.left - 12)));
      root.style.setProperty('--sf-br-shell-shift', shellShift + 'px');
      if(root.parentElement){
        root.parentElement.style.overflow = 'visible';
      }

      const candidates = Array.from(document.querySelectorAll('body > * , body *')).filter(el => {'''
    if needle not in js:
        raise SystemExit("Could not find applyBuildRoomShellMode rootRect block.")
    js = js.replace(needle, repl, 1)
    print("[OK] added shell-width reclaim variable")
else:
    print("[SKIP] shell shift already present")

js_path.write_text(js)

# 3. CSS: use the shell shift variable to pull the renderer left and expand width.
append_css = r'''

/* Build-a-Room locked layout recovery v6r263.
   Reclaim hidden shell/sidebar space so .sf-br-left is the true left column. */
body.sf-build-room-v6r227-active .sf-build-room-v6r227 {
  transform: translateX(calc(-1 * var(--sf-br-shell-shift, 0px))) !important;
  width: min(1500px, calc(100vw - 36px + var(--sf-br-shell-shift, 0px))) !important;
  position: relative !important;
  z-index: 20 !important;
}

body.sf-build-room-v6r227-active .sf-br-top-side {
  grid-template-columns: auto auto !important;
  justify-content: end !important;
  align-items: stretch !important;
}

body.sf-build-room-v6r227-active .sf-br-top-actions {
  order: 1 !important;
}

body.sf-build-room-v6r227-active .sf-br-metrics {
  order: 2 !important;
}

body.sf-build-room-v6r227-active .sf-br-left {
  min-width: 270px !important;
  max-width: 310px !important;
}

body.sf-build-room-v6r227-active .sf-br-body {
  grid-template-columns: minmax(270px, 310px) minmax(0, 1fr) !important;
}
'''

if "Build-a-Room locked layout recovery v6r263" not in css:
    css += append_css
    print("[OK] appended v6r263 CSS")
else:
    print("[SKIP] v6r263 CSS already present")

css_path.write_text(css)

# 4. Cache-bust active launch files.
for p in launch_files:
    if not p.exists():
        continue
    html = p.read_text()
    new_html = re.sub(r'sf-build-room-renderer\.js\?v=6r\d+', 'sf-build-room-renderer.js?v=6r263', html)
    new_html = re.sub(r'sf-build-room-renderer\.css\?v=6r\d+', 'sf-build-room-renderer.css?v=6r263', new_html)
    if new_html != html:
        backup(p)
        p.write_text(new_html)
        print("[OK] bumped build-room cache in", p)

print("\nBuild-a-Room locked layout v6r263 patch complete.")
