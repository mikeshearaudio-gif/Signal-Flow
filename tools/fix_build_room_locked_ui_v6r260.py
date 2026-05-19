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
        b = path.with_name(path.name + f".bak_buildroom_v6r260_{stamp}")
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

# 1. Keep the existing submit/check behavior, but make the player-facing action Submit Build.
js = js.replace('data-sf-br-action="check">Check Room</button>', 'data-sf-br-action="check">Submit Build</button>')
js = js.replace("data-sf-br-action=\"check\">Check Room</button>", "data-sf-br-action=\"check\">Submit Build</button>")

# 2. Remove the internal Open Locker action from the Build-a-Room action row.
js = re.sub(
    r'\s*<button\s+class="sf-br-btn secondary"\s+data-sf-br-action="open-locker">\s*Open Locker\s*</button>\s*',
    '\n',
    js
)

# 3. Make the approval modal say Submit Build / Equipment Locker economy text can remain, but remove main UI dependency.
js = js.replace("Check Room", "Submit Build")

# 4. Prevent the Build-a-Room renderer from injecting/cloning the floating Equipment Locker button.
# Do this narrowly inside this renderer by neutralizing the function that creates/syncs that button.
for fn_name in ["installLockerButton", "syncEquipmentLockerButton", "installEquipmentLockerButton", "ensureLockerButton"]:
    idx = js.find("function " + fn_name)
    if idx >= 0:
        brace = js.find("{", idx)
        if brace >= 0 and "Build-a-Room locked UI v6r260" not in js[brace:brace+300]:
            js = js[:brace+1] + "\n    // Build-a-Room locked UI v6r260: do not expose floating locker buttons.\n    return;\n" + js[brace+1:]
            print("[OK] neutralized", fn_name)

# Fallback: if no named function was found, neutralize the specific fallback button creation.
js = re.sub(
    r"fallback\.type\s*=\s*'button';\s*fallback\.className\s*=\s*'clean-splash-btn clean-locker-btn sf-build-room-equipment-locker-entry';\s*fallback\.textContent\s*=\s*'Equipment Locker';\s*fallback\.dataset\.sfBrLockerOwner\s*=\s*VERSION;",
    "return; // Build-a-Room locked UI v6r260: no floating Equipment Locker fallback.",
    js
)

js_path.write_text(js)
print("[OK] patched shared Build-a-Room renderer JS")

# 5. Shared CSS: hide legacy/global shell pieces only while the cleaned Build-a-Room renderer is active.
append_css = r'''

/* Build-a-Room locked UI v6r260
   Shared Build-a-Room presentation fix:
   - the cleaned Build-a-Room renderer owns the screen
   - no external training sidebar
   - no floating Equipment/Mic Locker button
   - no redundant Room/System Build grid
*/
body:has(.sf-build-room-v6r227) #micLockerBtn,
body:has(.sf-build-room-v6r227) .clean-locker-btn:not(.sf-br-btn),
body:has(.sf-build-room-v6r227) .sf-build-room-equipment-locker-entry,
body:has(.sf-build-room-v6r227) [data-sf-br-action="open-locker"] {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

body:has(.sf-build-room-v6r227) .training-level-panel:not(.sf-build-room-v6r227):not(.sf-build-room-v6r227-mount):not([data-sf-build-room-renderer-mount]),
body:has(.sf-build-room-v6r227) [data-training-panel="build-room"]:not(.sf-build-room-v6r227):not(.sf-build-room-v6r227-mount):not([data-sf-build-room-renderer-mount]),
body:has(.sf-build-room-v6r227) [data-training-panel]:not([data-sf-build-room-renderer-mount]) {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

.sf-build-room-v6r227 div:has(> .sf-br-room-title),
.sf-build-room-v6r227 section:has(> .sf-br-room-title),
.sf-build-room-v6r227 article:has(> .sf-br-room-title) {
  display: none !important;
}

.sf-build-room-v6r227 .sf-br-room-title {
  display: none !important;
}

.sf-build-room-v6r227 [data-sf-br-action="check"] {
  font-weight: 900 !important;
  letter-spacing: 0.04em !important;
}

.sf-build-room-v6r227 [data-sf-br-action="check"]::after {
  content: "";
}
'''

if "Build-a-Room locked UI v6r260" not in css:
    css += append_css
    print("[OK] appended shared locked Build-a-Room CSS")
else:
    print("[SKIP] v6r260 CSS already present")

css_path.write_text(css)

# 6. Bump cache refs for all active launch files.
for p in launch_files:
    html = p.read_text()

    new_html = re.sub(
        r'sf-build-room-renderer\.js\?v=6r\d+',
        'sf-build-room-renderer.js?v=6r260',
        html
    )
    new_html = re.sub(
        r'sf-build-room-renderer\.css\?v=6r\d+',
        'sf-build-room-renderer.css?v=6r260',
        new_html
    )

    if new_html != html:
        backup(p)
        p.write_text(new_html)
        print("[OK] bumped build-room cache in", p)

print("\nBuild-a-Room locked UI v6r260 patch complete.")
