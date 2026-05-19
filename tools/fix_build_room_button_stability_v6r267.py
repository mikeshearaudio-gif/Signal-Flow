from pathlib import Path
import re
import shutil
from datetime import datetime

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

css_path = Path("patch/sf-build-room-renderer.css")
launch_files = [
    Path("launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html"),
    Path("launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html"),
    Path("launch/Signal_Flow_CRASH_TEST_NO_EMBEDDED_MEDIA.html"),
]

def backup(path):
    if path.exists():
        b = path.with_name(path.name + f".bak_buildroom_v6r267_{stamp}")
        shutil.copy2(path, b)
        print("[OK] backup", b)

if not css_path.exists():
    raise SystemExit("Missing patch/sf-build-room-renderer.css")

backup(css_path)
css = css_path.read_text()

append_css = r'''

/* Build-a-Room locked layout recovery v6r267.
   Stabilize top action/credit strip and align real button hitboxes with visible GUI.
   No DOM movement, no shell shifting. */
body.sf-build-room-v6r227-active .sf-build-room-v6r227,
body.sf-build-room-v6r227-active .sf-build-room-v6r227 * {
  box-sizing: border-box !important;
}

/* Keep the top right strip from reflowing when New Spend / Owned Applied values change. */
body.sf-build-room-v6r227-active .sf-br-top {
  display: grid !important;
  grid-template-columns: minmax(260px, 1fr) 520px !important;
  align-items: start !important;
  gap: 14px !important;
}

body.sf-build-room-v6r227-active .sf-br-top-side {
  width: 520px !important;
  min-width: 520px !important;
  max-width: 520px !important;
  display: grid !important;
  grid-template-columns: 206px 302px !important;
  gap: 12px !important;
  align-items: stretch !important;
  justify-content: end !important;
  justify-self: end !important;
}

body.sf-build-room-v6r227-active .sf-br-top-actions {
  width: 206px !important;
  min-width: 206px !important;
  max-width: 206px !important;
  display: grid !important;
  grid-template-columns: 98px 98px !important;
  gap: 10px !important;
  align-items: stretch !important;
  justify-content: start !important;
  order: 1 !important;
}

body.sf-build-room-v6r227-active .sf-br-metrics {
  width: 302px !important;
  min-width: 302px !important;
  max-width: 302px !important;
  display: grid !important;
  grid-template-columns: 94px 94px 94px !important;
  gap: 10px !important;
  align-items: stretch !important;
  justify-content: end !important;
  order: 2 !important;
}

body.sf-build-room-v6r227-active .sf-br-metric {
  width: 94px !important;
  min-width: 94px !important;
  max-width: 94px !important;
  min-height: 50px !important;
  overflow: hidden !important;
}

body.sf-build-room-v6r227-active .sf-br-metric-label {
  white-space: normal !important;
  line-height: 1.05 !important;
}

body.sf-build-room-v6r227-active .sf-br-metric-value {
  white-space: nowrap !important;
  line-height: 1 !important;
}

/* Real top buttons equal their visible boxes. */
body.sf-build-room-v6r227-active .sf-br-top-actions .sf-br-btn,
body.sf-build-room-v6r227-active button[data-sf-br-action="reset"],
body.sf-build-room-v6r227-active button[data-sf-br-action="check"] {
  width: 98px !important;
  min-width: 98px !important;
  max-width: 98px !important;
  height: 50px !important;
  min-height: 50px !important;
  max-height: 50px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 8px !important;
  margin: 0 !important;
  transform: none !important;
  line-height: 1.05 !important;
  white-space: normal !important;
  pointer-events: auto !important;
}

/* Category pills: make the actual button the visible/hit target. */
body.sf-build-room-v6r227-active .sf-br-tab {
  position: relative !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 36px !important;
  padding: 8px 13px !important;
  margin: 0 !important;
  line-height: 1 !important;
  transform: none !important;
  pointer-events: auto !important;
  cursor: pointer !important;
}

body.sf-build-room-v6r227-active .sf-br-tab *,
body.sf-build-room-v6r227-active .sf-br-btn *,
body.sf-build-room-v6r227-active .sf-br-card button * {
  pointer-events: none !important;
}

/* Gear quantity buttons: visible circles and hitboxes must be the same size/location. */
body.sf-build-room-v6r227-active .sf-br-card button,
body.sf-build-room-v6r227-active .sf-br-card [role="button"],
body.sf-build-room-v6r227-active .sf-br-card [data-sf-br-delta],
body.sf-build-room-v6r227-active .sf-br-card [data-sf-br-action] {
  transform: none !important;
  pointer-events: auto !important;
  cursor: pointer !important;
}

body.sf-build-room-v6r227-active .sf-br-card button:not(.sf-br-btn),
body.sf-build-room-v6r227-active .sf-br-card [data-sf-br-delta] {
  width: 32px !important;
  min-width: 32px !important;
  max-width: 32px !important;
  height: 32px !important;
  min-height: 32px !important;
  max-height: 32px !important;
  padding: 0 !important;
  margin: 0 !important;
  border-radius: 999px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1 !important;
}

/* Avoid hover/focus transforms shifting visible controls away from their hitboxes. */
body.sf-build-room-v6r227-active .sf-br-card,
body.sf-build-room-v6r227-active .sf-br-card:hover,
body.sf-build-room-v6r227-active .sf-br-tab:hover,
body.sf-build-room-v6r227-active .sf-br-btn:hover,
body.sf-build-room-v6r227-active .sf-br-card button:hover {
  transform: none !important;
}

/* Keep cards from changing layout size after each click/rerender. */
body.sf-build-room-v6r227-active .sf-br-store-grid {
  align-items: start !important;
}

body.sf-build-room-v6r227-active .sf-br-card {
  min-height: 178px !important;
  overflow: hidden !important;
}

@media (max-width: 1120px) {
  body.sf-build-room-v6r227-active .sf-br-top {
    grid-template-columns: 1fr !important;
  }

  body.sf-build-room-v6r227-active .sf-br-top-side {
    justify-self: start !important;
  }
}
'''

if "Build-a-Room locked layout recovery v6r267" not in css:
    css += append_css
    print("[OK] appended v6r267 button stability CSS")
else:
    print("[SKIP] v6r267 CSS already present")

css_path.write_text(css)

for p in launch_files:
    if not p.exists():
        continue
    html = p.read_text()
    new_html = re.sub(r'sf-build-room-renderer\.js\?v=6r\d+', 'sf-build-room-renderer.js?v=6r267', html)
    new_html = re.sub(r'sf-build-room-renderer\.css\?v=6r\d+', 'sf-build-room-renderer.css?v=6r267', new_html)
    if new_html != html:
        backup(p)
        p.write_text(new_html)
        print("[OK] bumped build-room cache in", p)

print("\nBuild-a-Room button stability v6r267 patch complete.")
