from pathlib import Path
import json
import re
import sys

VERSION = '6r226'
ROOT = Path('.')
PATCH = Path('patch')
RAW_LAUNCH = Path('launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html')
WRAPPER = Path('launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html')
HTML_TARGETS = [p for p in [RAW_LAUNCH, WRAPPER, Path('index.html')] if p.exists()]

if not RAW_LAUNCH.exists():
    raise SystemExit(f'Missing {RAW_LAUNCH}')
if not (PATCH / 'sf-build-room-renderer.js').exists():
    raise SystemExit('Missing patch/sf-build-room-renderer.js. Unzip patch/* before running this tool.')
if not (PATCH / 'sf-build-room-renderer.css').exists():
    raise SystemExit('Missing patch/sf-build-room-renderer.css. Unzip patch/* before running this tool.')

# 1) Generate a real installed asset manifest from the user's local asset folders.
asset_roots = [
    Path('assets/build-room'),
    Path('assets/post/build-room'),
]
assets = []
for root in asset_roots:
    if not root.exists():
        continue
    for p in root.rglob('*'):
        if p.is_file() and p.suffix.lower() in {'.svg', '.png', '.jpg', '.jpeg', '.webp'}:
            assets.append({
                'path': '/' + p.as_posix(),
                'name': p.name,
                'stem': p.stem,
                'ext': p.suffix.lower(),
            })
manifest_path = Path('assets/build-room/build-room-asset-manifest.json')
manifest_path.parent.mkdir(parents=True, exist_ok=True)
manifest_path.write_text(json.dumps({'version': VERSION, 'assets': assets}, indent=2))
print(f'[OK] wrote {manifest_path} with {len(assets)} installed assets')

legacy_files = [
    'sf-build-room-2-ui',
    'sf-build-room-locker-integration',
    'sf-equipment-locker-ui',
    'sf-build-room-renderer',
]
legacy_alt = '|'.join(re.escape(x) for x in legacy_files)

# Handles: /patch/name.js?v=..., patch/name.js?v=..., extra attrs, defer, spaces, single quotes.
SCRIPT_RE = re.compile(
    rf'\s*<script\b[^>]*\bsrc=["\'](?:/)?patch/(?:{legacy_alt})\.js(?:\?[^"\']*)?["\'][^>]*>\s*</script>\s*',
    re.IGNORECASE | re.DOTALL,
)
LINK_RE = re.compile(
    rf'\s*<link\b[^>]*\bhref=["\'](?:/)?patch/(?:{legacy_alt})\.css(?:\?[^"\']*)?["\'][^>]*>\s*',
    re.IGNORECASE | re.DOTALL,
)

INJECT = (
    f'  <link rel="stylesheet" href="/patch/sf-build-room-renderer.css?v={VERSION}" />\n'
    f'  <script src="/patch/sf-build-room-renderer.js?v={VERSION}"></script>\n'
)

def clean_html(path: Path, inject: bool):
    s = path.read_text()
    before = s
    s = SCRIPT_RE.sub('\n', s)
    s = LINK_RE.sub('\n', s)
    # Remove accidental duplicate blank lines from repeated package installs.
    s = re.sub(r'\n{3,}', '\n\n', s)
    if inject:
        if '</head>' in s:
            s = s.replace('</head>', INJECT + '</head>', 1)
        elif '</body>' in s:
            s = s.replace('</body>', INJECT + '</body>', 1)
        else:
            raise SystemExit(f'Could not find </head> or </body> in {path}')
    # Version label cleanup.
    s = re.sub(r'(diagnosis GUI v6r\d+)(?:\s*·\s*build-room[^<\n]*)?', rf'\1 · build-room renderer {VERSION}', s)
    s = re.sub(r'build-room(?: UI| renderer| locker| 2\.0)? v6r\d+', f'build-room renderer {VERSION}', s, flags=re.IGNORECASE)
    path.write_text(s)
    removed = before.count('sf-build-room-2-ui') + before.count('sf-build-room-locker-integration') + before.count('sf-equipment-locker-ui') + before.count('sf-build-room-renderer')
    print(f'[OK] cleaned {path} ({removed} prior build-room/locker refs scanned)')

# Only the raw launch needs the renderer. Clean wrapper/index to remove stale refs if any.
for p in HTML_TARGETS:
    clean_html(p, inject=(p == RAW_LAUNCH))

# 2) Fail closed if stale refs remain in launch HTML.
stale_patterns = ['sf-build-room-2-ui', 'sf-build-room-locker-integration', 'sf-equipment-locker-ui']
errors = []
for p in HTML_TARGETS:
    txt = p.read_text()
    for pat in stale_patterns:
        if pat in txt:
            errors.append(f'{p}: still contains {pat}')

raw = RAW_LAUNCH.read_text()
new_refs = re.findall(r'(?:/)?patch/sf-build-room-renderer\.(?:js|css)\?v=([^"\']+)', raw)
if sorted(new_refs) != [VERSION, VERSION]:
    errors.append(f'{RAW_LAUNCH}: expected exactly one CSS and one JS renderer ref for {VERSION}; found {new_refs}')

if errors:
    print('[FAIL] Build-a-Room single-owner install did not complete cleanly:', file=sys.stderr)
    for e in errors:
        print(' - ' + e, file=sys.stderr)
    raise SystemExit(1)

print('[PASS] Build-a-Room single-owner install is clean.')
print('[PASS] Expected only one Build-a-Room script in raw launch: /patch/sf-build-room-renderer.js?v=6r226')
