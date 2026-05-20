from pathlib import Path
import re
import shutil
from datetime import datetime

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

skin_js = Path("patch/sf-diagnosis-svg-skin.js")
skin_css = Path("patch/sf-diagnosis-svg-skin.css")
launch_files = [
    Path("launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html"),
    Path("launch/Signal_Flow_CRASH_TEST_NO_EMBEDDED_MEDIA.html"),
]

def backup(path):
    if path.exists():
        b = path.with_name(path.name + f".bak_diag_skin_v6r254_{stamp}")
        shutil.copy2(path, b)
        print("[OK] backup", b)

if not skin_js.exists():
    raise SystemExit("Missing patch/sf-diagnosis-svg-skin.js")
if not skin_css.exists():
    raise SystemExit("Missing patch/sf-diagnosis-svg-skin.css")

backup(skin_js)
backup(skin_css)

js = skin_js.read_text()

# Make the visible runtime version honest where possible.
js = re.sub(r"const VERSION = '6r\d+';", "const VERSION = '6r254';", js, count=1)

# Generic diagnosis panels can briefly measure short/collapsed before skin CSS applies.
# Prefer them anyway if they have a usable width.
generic_first = r'''  function activeDiagnosisPanel() {
    const generic = qsa('[data-sfdiag-generic-panel="true"], .sfdiag-generic-panel')
      .filter(el => {
        if (!el || !el.isConnected) return false;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return cs.display !== 'none' &&
          cs.visibility !== 'hidden' &&
          r.width > 360 &&
          r.height > 60;
      })
      .sort((a, b) => rectArea(b) - rectArea(a))[0];
    if (generic) return generic;
'''

if "Generic diagnosis panels can briefly measure short/collapsed before skin CSS applies." not in js:
    js = re.sub(
        r"  function activeDiagnosisPanel\(\) \{\s*(?:const generic = qsa\('\[data-sfdiag-generic-panel=\"true\"\]'\).*?if \(generic\) return generic;\s*)?",
        generic_first,
        js,
        count=1,
        flags=re.S
    )
    print("[OK] made diagnosis skin prefer collapsed generic panel")
else:
    print("[SKIP] generic-first selector already present")

# Relax isVisible only for generic panels, without making old hidden panels eligible.
if "v6r254 generic panel early visibility allowance" not in js:
    js = js.replace(
        "function isVisible(el) {",
        "function isVisible(el) {\n    // v6r254 generic panel early visibility allowance",
        1
    )

    js = js.replace(
        "return cs.display !== 'none' &&\n      cs.visibility !== 'hidden' &&\n      r.width > 420 &&\n      r.height > 240;",
        """if (el.matches && el.matches('[data-sfdiag-generic-panel="true"], .sfdiag-generic-panel')) {
      return cs.display !== 'none' &&
        cs.visibility !== 'hidden' &&
        r.width > 360 &&
        r.height > 60;
    }
    return cs.display !== 'none' &&
      cs.visibility !== 'hidden' &&
      r.width > 420 &&
      r.height > 240;""",
        1
    )
    print("[OK] relaxed generic panel visibility threshold")
else:
    print("[SKIP] visibility allowance already present")

skin_js.write_text(js)

css = skin_css.read_text()
css_add = r'''

/* Diagnosis generic panel sizing/skin repair v6r254.
   The generic diagnosis panel can be created at only ~120px high before the
   SVG skin claims it; make it a real board surface immediately. */
[data-sfdiag-generic-panel="true"].sfdiag-generic-panel,
.sfdiag-generic-panel[data-training-panel="diagnose"] {
  display: block !important;
  position: relative !important;
  width: 100% !important;
  min-height: min(720px, calc(100vh - 230px)) !important;
  height: min(720px, calc(100vh - 230px)) !important;
  overflow: hidden !important;
  isolation: isolate !important;
  box-sizing: border-box !important;
}

[data-sfdiag-generic-panel="true"].sfdiag-svg-skin-active,
.sfdiag-generic-panel.sfdiag-svg-skin-active {
  min-height: min(720px, calc(100vh - 230px)) !important;
  height: min(720px, calc(100vh - 230px)) !important;
}

[data-sfdiag-generic-panel="true"] > .sf-diagnosis-art-layer,
.sfdiag-generic-panel > .sf-diagnosis-art-layer {
  position: absolute !important;
  inset: 0 !important;
  z-index: 0 !important;
  pointer-events: none !important;
}

[data-sfdiag-generic-panel="true"] > :not(.sf-diagnosis-art-layer),
.sfdiag-generic-panel > :not(.sf-diagnosis-art-layer) {
  position: relative !important;
  z-index: 2 !important;
}
'''

if "Diagnosis generic panel sizing/skin repair v6r254" not in css:
    css += css_add
    print("[OK] appended generic diagnosis panel CSS v6r254")
else:
    print("[SKIP] CSS v6r254 already present")

skin_css.write_text(css)

for p in launch_files:
    if not p.exists():
        continue
    html = p.read_text()
    new_html = re.sub(r'sf-diagnosis-svg-skin\.js\?v=6r\d+', 'sf-diagnosis-svg-skin.js?v=6r254', html)
    new_html = re.sub(r'sf-diagnosis-svg-skin\.css\?v=6r\d+', 'sf-diagnosis-svg-skin.css?v=6r254', new_html)
    if new_html != html:
        backup(p)
        p.write_text(new_html)
        print("[OK] bumped diagnosis skin refs in", p)

print("\nDiagnosis generic-panel skin repair v6r254 complete.")
