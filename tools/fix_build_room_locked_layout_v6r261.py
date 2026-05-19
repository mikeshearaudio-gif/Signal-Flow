from pathlib import Path
import re
import shutil
from datetime import datetime

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

js_path = Path("patch/sf-build-room-renderer.js")
css_path = Path("patch/sf-build-room-renderer.css")
launch_files = list(Path("launch").glob("*.html"))

def backup(path):
    if path.exists():
        b = path.with_name(path.name + f".bak_buildroom_v6r261_{stamp}")
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

# Keep validation path. Only move the player-facing actions.
old_metrics = '''        <div class="sf-br-metrics">
          <div class="sf-br-metric"><div class="sf-br-metric-label">Credits available</div><div class="sf-br-metric-value">${totals.availableCredits}</div></div>
          <div class="sf-br-metric"><div class="sf-br-metric-label">New spend</div><div class="sf-br-metric-value">${money.spend}</div></div>
          <div class="sf-br-metric"><div class="sf-br-metric-label">Owned applied</div><div class="sf-br-metric-value">${money.ownedApplied}</div></div>
        </div>'''

new_metrics = '''        <div class="sf-br-top-side">
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

if old_metrics not in js:
    raise SystemExit("Could not find expected sf-br-metrics block; stop and inspect renderer template.")
js = js.replace(old_metrics, new_metrics, 1)
print("[OK] moved Reset/Submit into top metric/action strip")

# Remove redundant Room / System Build scene from the shared template entirely.
scene_pat = re.compile(
    r'\s*<section class="sf-br-scene">\s*'
    r'<div class="sf-br-room-backdrop"></div>\s*'
    r'<div class="sf-br-room-title">Room / System Build</div>\s*'
    r'<div class="sf-br-placement-grid">\s*'
    r'\$\{reqStatus\.statuses\.slice\(0,8\)\.map\(st => `<div class="sf-br-placement \$\{st\.ok \? \'is-satisfied\' : \'\'\}"><div class="sf-br-placement-label">\$\{escapeHtml\(st\.req\.need_group \|\| st\.req\.name\)\}</div><div class="sf-br-placement-sub">\$\{st\.ok \? \'Ready\' : \'Needs gear\'\}</div></div>`\)\.join\(\'\'\)\}\s*'
    r'</div>\s*'
    r'</section>\s*',
    re.S
)

js, scene_count = scene_pat.subn('\n', js, count=1)
if scene_count != 1:
    raise SystemExit(f"Expected to remove exactly one redundant Room/System Build scene, removed {scene_count}.")
print("[OK] removed redundant Room / System Build scene from template")

# Remove bottom action buttons. Leave summary if present.
bottom_pat = re.compile(
    r'\s*<div class="sf-br-bottom">\s*'
    r'<div class="sf-br-summary">\s*'
    r'([\s\S]*?)'
    r'</div>\s*'
    r'<div class="sf-br-actions">\s*'
    r'<button class="sf-br-btn danger" data-sf-br-action="reset">Reset Build</button>\s*'
    r'<button class="sf-br-btn" data-sf-br-action="check">Submit Build</button>\s*'
    r'</div>\s*'
    r'</div>\s*',
    re.S
)

def bottom_repl(m):
    return '''      <div class="sf-br-bottom">
        <div class="sf-br-summary">
''' + m.group(1) + '''        </div>
      </div>
'''

js, bottom_count = bottom_pat.subn(bottom_repl, js, count=1)
if bottom_count != 1:
    raise SystemExit(f"Expected to rewrite exactly one bottom action block, rewrote {bottom_count}.")
print("[OK] removed bottom Reset/Submit action copy")

# Make sure old Open Locker action is not present in the action row.
js = re.sub(
    r'\s*<button\s+class="sf-br-btn secondary"\s+data-sf-br-action="open-locker">\s*Open Locker\s*</button>\s*',
    '\n',
    js
)

js_path.write_text(js)

append_css = r'''

/* Build-a-Room locked layout recovery v6r261
   Shared renderer-level layout restoration for all Build-a-Room levels. */
body.sf-build-room-v6r227-active #micLockerBtn,
body.sf-build-room-v6r227-active .clean-locker-btn:not(.sf-br-btn),
body.sf-build-room-v6r227-active .sf-build-room-equipment-locker-entry,
body.sf-build-room-v6r227-active [data-sf-br-action="open-locker"] {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

/* Hide legacy shell/training sidebars while the shared Build-a-Room UI owns the screen.
   Keep the renderer's internal .sf-br-left column. */
body.sf-build-room-v6r227-active aside:not(.sf-br-left),
body.sf-build-room-v6r227-active .training-level-panel:not(.sf-build-room-v6r227):not(.sf-build-room-v6r227-mount):not([data-sf-build-room-renderer-mount]),
body.sf-build-room-v6r227-active [data-training-panel]:not([data-sf-build-room-renderer-mount]),
body.sf-build-room-v6r227-active .level-sidebar,
body.sf-build-room-v6r227-active .lesson-sidebar,
body.sf-build-room-v6r227-active .training-sidebar,
body.sf-build-room-v6r227-active .educational-sidebar,
body.sf-build-room-v6r227-active .educational-tools-panel,
body.sf-build-room-v6r227-active [class*="education"]:not(.sf-build-room-v6r227):not(.sf-br-left):not(.sf-br-section-title),
body.sf-build-room-v6r227-active [class*="sidebar"]:not(.sf-br-left) {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

/* Make Build-a-Room feel like the level surface, not a small board inside another board. */
body.sf-build-room-v6r227-active .sf-build-room-v6r227 {
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  border-radius: 18px !important;
  min-height: calc(100vh - 170px) !important;
  display: flex !important;
  flex-direction: column !important;
}

body.sf-build-room-v6r227-active .sf-br-top {
  grid-template-columns: minmax(0, 1fr) auto !important;
  align-items: start !important;
  gap: 16px !important;
  padding: 16px 18px !important;
}

body.sf-build-room-v6r227-active .sf-br-top-side {
  display: grid !important;
  grid-template-columns: auto auto !important;
  gap: 12px !important;
  align-items: stretch !important;
  justify-content: end !important;
}

body.sf-build-room-v6r227-active .sf-br-top-actions {
  align-self: stretch !important;
  display: flex !important;
  align-items: stretch !important;
  gap: 10px !important;
}

body.sf-build-room-v6r227-active .sf-br-top-actions .sf-br-btn {
  min-width: 118px !important;
  min-height: 48px !important;
}

body.sf-build-room-v6r227-active .sf-br-body {
  grid-template-columns: minmax(250px, 300px) minmax(0, 1fr) !important;
  min-height: 0 !important;
  flex: 1 1 auto !important;
}

body.sf-build-room-v6r227-active .sf-br-left {
  align-self: stretch !important;
}

body.sf-build-room-v6r227-active .sf-br-main {
  padding: 18px !important;
  min-width: 0 !important;
  display: flex !important;
  flex-direction: column !important;
}

/* Belt-and-suspenders: the scene is removed from JS, but hide stale cached copies too. */
body.sf-build-room-v6r227-active .sf-br-scene,
body.sf-build-room-v6r227-active .sf-br-room-title,
body.sf-build-room-v6r227-active .sf-br-placement-grid {
  display: none !important;
}

body.sf-build-room-v6r227-active .sf-br-store-head {
  margin: 0 0 12px !important;
  align-items: center !important;
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
  position: relative !important;
  z-index: 2 !important;
}

body.sf-build-room-v6r227-active .sf-br-store-grid {
  flex: 1 1 auto !important;
  align-content: start !important;
}

body.sf-build-room-v6r227-active .sf-br-bottom {
  margin-top: auto !important;
  min-height: 42px !important;
}

@media (max-width: 1050px) {
  body.sf-build-room-v6r227-active .sf-br-top,
  body.sf-build-room-v6r227-active .sf-br-top-side,
  body.sf-build-room-v6r227-active .sf-br-body {
    grid-template-columns: 1fr !important;
  }
  body.sf-build-room-v6r227-active .sf-br-top-side {
    justify-content: stretch !important;
  }
}
'''

if "Build-a-Room locked layout recovery v6r261" not in css:
    css += append_css
    print("[OK] appended v6r261 shared Build-a-Room CSS")
else:
    print("[SKIP] v6r261 CSS already present")

css_path.write_text(css)

for p in launch_files:
    html = p.read_text()
    new_html = re.sub(r'sf-build-room-renderer\.js\?v=6r\d+', 'sf-build-room-renderer.js?v=6r261', html)
    new_html = re.sub(r'sf-build-room-renderer\.css\?v=6r\d+', 'sf-build-room-renderer.css?v=6r261', new_html)
    if new_html != html:
        backup(p)
        p.write_text(new_html)
        print("[OK] bumped build-room cache in", p)

print("\nBuild-a-Room locked layout v6r261 patch complete.")
