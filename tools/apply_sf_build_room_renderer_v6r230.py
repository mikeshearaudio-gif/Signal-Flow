#!/usr/bin/env python3
from pathlib import Path
import re, json

ROOT = Path.cwd()
LAUNCH = ROOT / 'launch' / 'Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html'
if not LAUNCH.exists():
    raise SystemExit(f'Missing {LAUNCH}')

html = LAUNCH.read_text()
backup = LAUNCH.with_suffix('.html.pre-build-room-v6r230.bak')
if not backup.exists():
    backup.write_text(html)

# Remove fragmented Build-a-Room/locker UI stack and any prior consolidated renderer refs.
patterns = [
    r'\n?\s*<script[^>]+src=["\'][^"\']*(?:sf-build-room-2-ui|sf-build-room-locker-integration|sf-equipment-locker-ui|sf-build-room-renderer)\.js[^"\']*["\'][^>]*>\s*</script>\s*',
    r'\n?\s*<link[^>]+href=["\'][^"\']*(?:sf-build-room-2-ui|sf-build-room-locker-integration|sf-equipment-locker-ui|sf-build-room-renderer)\.css[^"\']*["\'][^>]*>\s*',
]
for pat in patterns:
    html = re.sub(pat, '\n', html, flags=re.I)

# Remove prior consolidated blocks.
html = re.sub(r'\n?\s*<!-- Signal Flow Build-a-Room consolidated renderer v6r\d+ -->[\s\S]*?<!-- /Signal Flow Build-a-Room consolidated renderer v6r\d+ -->\s*', '\n', html)

css = '<link rel="stylesheet" href="/patch/sf-build-room-renderer.css?v=6r230">'
js = '<script src="/patch/sf-build-room-renderer.js?v=6r230"></script>'
block_head = '\n<!-- Signal Flow Build-a-Room consolidated renderer v6r230 -->\n' + css + '\n<!-- /Signal Flow Build-a-Room consolidated renderer v6r230 -->\n'
block_body = '\n<!-- Signal Flow Build-a-Room consolidated renderer v6r230 -->\n' + js + '\n<!-- /Signal Flow Build-a-Room consolidated renderer v6r230 -->\n'
if '</head>' not in html.lower() or '</body>' not in html.lower():
    raise SystemExit('Launch HTML is missing </head> or </body>')
html = re.sub(r'sf-build-room-v6r\d+-mount', 'sf-build-room-v6r230-mount', html)
html = re.sub(r'</head>', block_head + '</head>', html, count=1, flags=re.I)
html = re.sub(r'</body>', block_body + '</body>', html, count=1, flags=re.I)
LAUNCH.write_text(html)

# Generate shelf asset map from local repo assets. This avoids guessed shelf paths and avoids 404 spam.
shelf_dir = ROOT / 'assets' / 'build-room' / 'svg' / 'shelves'
shelves = []
if shelf_dir.exists():
    for p in sorted(shelf_dir.rglob('*')):
        if p.is_file() and p.suffix.lower() in {'.svg', '.png', '.jpg', '.jpeg', '.webp'}:
            rel = p.relative_to(ROOT).as_posix()
            shelves.append({'name': p.stem, 'path': rel})
out = ROOT / 'assets' / 'build-room' / 'build-room-shelf-map.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps({'version':'6r230','shelves':shelves}, indent=2))

# Confirm installed files exist.
for p in [ROOT/'assets/build-room/build-room-asset-map.json', ROOT/'assets/build-room/build-room-manifest-v4.json', ROOT/'assets/build-room/build-room-shelf-map.json', ROOT/'patch/sf-build-room-renderer.js', ROOT/'patch/sf-build-room-renderer.css']:
    if not p.exists():
        raise SystemExit(f'Missing installed file: {p}')

print('[OK] Installed Build-a-Room consolidated renderer v6r230')
print('[OK] Removed old fragmented Build-a-Room/Locker script refs from launch HTML')
print(f'[OK] Generated shelf map with {len(shelves)} shelf assets')
