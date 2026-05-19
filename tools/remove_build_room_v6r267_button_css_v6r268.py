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
        b = path.with_name(path.name + f".bak_buildroom_v6r268_{stamp}")
        shutil.copy2(path, b)
        print("[OK] backup", b)

if not css_path.exists():
    raise SystemExit("Missing patch/sf-build-room-renderer.css")

backup(css_path)
css = css_path.read_text()

start = css.find("/* Build-a-Room locked layout recovery v6r267.")
if start >= 0:
    # Remove from the v6r267 comment to EOF only if v6r267 was the last appended block.
    # This is safer than regexing individual button rules.
    css = css[:start].rstrip() + "\n"
    print("[OK] removed v6r267 button stability CSS block")
else:
    print("[WARN] v6r267 CSS block not found; no CSS removed")

css_path.write_text(css)

for p in launch_files:
    if not p.exists():
        continue
    html = p.read_text()
    new_html = re.sub(r'sf-build-room-renderer\.js\?v=6r\d+', 'sf-build-room-renderer.js?v=6r268', html)
    new_html = re.sub(r'sf-build-room-renderer\.css\?v=6r\d+', 'sf-build-room-renderer.css?v=6r268', new_html)
    if new_html != html:
        backup(p)
        p.write_text(new_html)
        print("[OK] bumped build-room cache in", p)

print("\nRemoved v6r267 button CSS and bumped Build-a-Room to v6r268.")
