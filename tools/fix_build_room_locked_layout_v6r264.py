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
        b = path.with_name(path.name + f".bak_buildroom_v6r264_{stamp}")
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

# 1. Stop shell mode from reapplying/logging continuously.
#    Keep shell hiding behavior, but make it idempotent per root position/level.
old = """      const rootRect = root.getBoundingClientRect();

      // Build-a-Room locked layout v6r263:
      // Reclaim the hidden shell/sidebar column so .sf-br-left becomes the real left column.
      const shellShift = Math.max(0, Math.min(330, Math.round(rootRect.left - 12)));
      root.style.setProperty('--sf-br-shell-shift', shellShift + 'px');
      if(root.parentElement){
        root.parentElement.style.overflow = 'visible';
      }

      const candidates = Array.from(document.querySelectorAll('body > * , body *')).filter(el => {"""

new = """      const rootRect = root.getBoundingClientRect();

      // Build-a-Room locked layout v6r264:
      // Do not translate the renderer. Use a real two-column internal layout instead.
      root.style.setProperty('--sf-br-shell-shift', '0px');
      if(root.parentElement){
        root.parentElement.style.overflow = 'visible';
      }

      const shellKey = [
        currentLevelId && currentLevelId(),
        Math.round(rootRect.left),
        Math.round(rootRect.top),
        Math.round(rootRect.width),
        Math.round(rootRect.height)
      ].join(':');

      if(root.dataset.sfBrShellModeKey === shellKey){
        return;
      }
      root.dataset.sfBrShellModeKey = shellKey;

      const candidates = Array.from(document.querySelectorAll('body > * , body *')).filter(el => {"""

if old in js:
    js = js.replace(old, new, 1)
    print("[OK] made shell mode idempotent and removed shell shift")
else:
    print("[WARN] v6r263 shell-shift block not found; continuing with CSS-level repair")

# 2. Update stale console label from v6r262 to v6r264, and reduce repeated logging.
js = js.replace(
    "console.log('[Signal Flow] Build-a-Room shell mode applied v6r262', {hidden: hidden.length});",
    "console.log('[Signal Flow] Build-a-Room shell mode applied v6r264', {hidden: hidden.length});"
)

# 3. Ensure actions are before metrics in the template.
old_top_side = """        <div class="sf-br-top-side">
          <div class="sf-br-metrics">
            <div class="sf-br-metric"><div class="sf-br-metric-label">Credits available</div><div class="sf-br-metric-value">${totals.availableCredits}</div></div>
            <div class="sf-br-metric"><div class="sf-br-metric-label">New spend</div><div class="sf-br-metric-value">${money.spend}</div></div>
            <div class="sf-br-metric"><div class="sf-br-metric-label">Owned applied</div><div class="sf-br-metric-value">${money.ownedApplied}</div></div>
          </div>
          <div class="sf-br-actions sf-br-top-actions">
            <button class="sf-br-btn danger" data-sf-br-action="reset">Reset Build</button>
            <button class="sf-br-btn" data-sf-br-action="check">Submit Build</button>
          </div>
        </div>"""

new_top_side = """        <div class="sf-br-top-side">
          <div class="sf-br-actions sf-br-top-actions">
            <button class="sf-br-btn danger" data-sf-br-action="reset">Reset Build</button>
            <button class="sf-br-btn" data-sf-br-action="check">Submit Build</button>
          </div>
          <div class="sf-br-metrics">
            <div class="sf-br-metric"><div class="sf-br-metric-label">Credits available</div><div class="sf-br-metric-value">${totals.availableCredits}</div></div>
            <div class="sf-br-metric"><div class="sf-br-metric-label">New spend</div><div class="sf-br-metric-value">${money.spend}</div></div>
            <div class="sf-br-metric"><div class="sf-br-metric-label">Owned applied</div><div class="sf-br-metric-value">${money.ownedApplied}</div></div>
          </div>
        </div>"""

if old_top_side in js:
    js = js.replace(old_top_side, new_top_side, 1)
    print("[OK] moved Reset/Submit before credit metrics")
else:
    print("[INFO] Reset/Submit already appears before metrics or template differs")

js_path.write_text(js)

# 4. Append a corrective CSS layer that overrides the bad transform/shift behavior.
append_css = r'''

/* Build-a-Room locked layout recovery v6r264.
   Correct v6r263: no translated renderer; use a true internal left column. */
body.sf-build-room-v6r227-active .sf-build-room-v6r227 {
  transform: none !important;
  width: min(1500px, calc(100vw - 36px)) !important;
  max-width: none !important;
  margin: 10px auto 28px !important;
  position: relative !important;
  z-index: 20 !important;
}

body.sf-build-room-v6r227-active .sf-br-top {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) auto !important;
  gap: 16px !important;
  align-items: start !important;
}

body.sf-build-room-v6r227-active .sf-br-top-side {
  display: flex !important;
  flex-direction: row !important;
  align-items: stretch !important;
  justify-content: flex-end !important;
  gap: 12px !important;
}

body.sf-build-room-v6r227-active .sf-br-top-actions {
  order: 1 !important;
  display: flex !important;
  flex-direction: row !important;
  align-items: stretch !important;
  gap: 10px !important;
}

body.sf-build-room-v6r227-active .sf-br-metrics {
  order: 2 !important;
  display: flex !important;
  flex-direction: row !important;
  align-items: stretch !important;
  gap: 10px !important;
}

body.sf-build-room-v6r227-active .sf-br-top-actions .sf-br-btn {
  min-width: 118px !important;
  min-height: 48px !important;
}

/* This is the important part: Build Brief / Checklist are the true left column
   inside the Build-a-Room surface, not part of the gear/store area. */
body.sf-build-room-v6r227-active .sf-br-body {
  display: grid !important;
  grid-template-columns: 300px minmax(0, 1fr) !important;
  gap: 18px !important;
  align-items: stretch !important;
  min-height: 610px !important;
}

body.sf-build-room-v6r227-active .sf-br-left {
  grid-column: 1 !important;
  width: 300px !important;
  min-width: 300px !important;
  max-width: 300px !important;
  align-self: stretch !important;
  position: relative !important;
  z-index: 3 !important;
}

body.sf-build-room-v6r227-active .sf-br-main {
  grid-column: 2 !important;
  min-width: 0 !important;
  padding: 18px !important;
  display: flex !important;
  flex-direction: column !important;
}

body.sf-build-room-v6r227-active .sf-br-store-head {
  margin-top: 0 !important;
}

body.sf-build-room-v6r227-active .sf-br-tabs {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 9px !important;
  align-items: center !important;
}

body.sf-build-room-v6r227-active .sf-br-tab {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 38px !important;
  padding: 9px 13px !important;
  line-height: 1.05 !important;
}

/* The removed grid should never reappear from cache or old markup. */
body.sf-build-room-v6r227-active .sf-br-scene,
body.sf-build-room-v6r227-active .sf-br-room-title,
body.sf-build-room-v6r227-active .sf-br-placement-grid {
  display: none !important;
}

@media (max-width: 1050px) {
  body.sf-build-room-v6r227-active .sf-br-top,
  body.sf-build-room-v6r227-active .sf-br-body {
    grid-template-columns: 1fr !important;
  }

  body.sf-build-room-v6r227-active .sf-br-left {
    width: auto !important;
    min-width: 0 !important;
    max-width: none !important;
  }

  body.sf-build-room-v6r227-active .sf-br-main {
    grid-column: 1 !important;
  }

  body.sf-build-room-v6r227-active .sf-br-top-side {
    justify-content: flex-start !important;
    flex-wrap: wrap !important;
  }
}
'''

if "Build-a-Room locked layout recovery v6r264" not in css:
    css += append_css
    print("[OK] appended v6r264 CSS")
else:
    print("[SKIP] v6r264 CSS already present")

css_path.write_text(css)

# 5. Cache-bust.
for p in launch_files:
    if not p.exists():
        continue
    html = p.read_text()
    new_html = re.sub(r'sf-build-room-renderer\.js\?v=6r\d+', 'sf-build-room-renderer.js?v=6r264', html)
    new_html = re.sub(r'sf-build-room-renderer\.css\?v=6r\d+', 'sf-build-room-renderer.css?v=6r264', new_html)
    if new_html != html:
        backup(p)
        p.write_text(new_html)
        print("[OK] bumped build-room cache in", p)

print("\nBuild-a-Room locked layout v6r264 patch complete.")
