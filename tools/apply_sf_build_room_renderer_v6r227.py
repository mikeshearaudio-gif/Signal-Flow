#!/usr/bin/env python3
from pathlib import Path
import re, shutil, json

ROOT = Path.cwd()
LAUNCH = ROOT / 'launch' / 'Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html'
if not LAUNCH.exists():
    raise SystemExit(f'Missing {LAUNCH}')

html = LAUNCH.read_text()
backup = LAUNCH.with_suffix('.html.pre-build-room-v6r227.bak')
if not backup.exists():
    backup.write_text(html)

# Remove fragmented Build-a-Room/locker UI stack and any prior consolidated renderer refs.
patterns = [
    r'\n?\s*<script[^>]+src=["\'][^"\']*(?:sf-build-room-2-ui|sf-build-room-locker-integration|sf-equipment-locker-ui|sf-build-room-renderer)\.js[^"\']*["\'][^>]*>\s*</script>\s*',
    r'\n?\s*<link[^>]+href=["\'][^"\']*(?:sf-build-room-2-ui|sf-build-room-locker-integration|sf-equipment-locker-ui|sf-build-room-renderer)\.css[^"\']*["\'][^>]*>\s*',
]
for pat in patterns:
    html = re.sub(pat, '\n', html, flags=re.I)

# Remove accidental duplicate v6r227 injections if rerun.
html = re.sub(r'\n?\s*<!-- Signal Flow Build-a-Room consolidated renderer v6r227 -->[\s\S]*?<!-- /Signal Flow Build-a-Room consolidated renderer v6r227 -->\s*', '\n', html)

css = '<link rel="stylesheet" href="/patch/sf-build-room-renderer.css?v=6r227">'
js = '<script src="/patch/sf-build-room-renderer.js?v=6r227"></script>'
block_head = '\n<!-- Signal Flow Build-a-Room consolidated renderer v6r227 -->\n' + css + '\n<!-- /Signal Flow Build-a-Room consolidated renderer v6r227 -->\n'
block_body = '\n<!-- Signal Flow Build-a-Room consolidated renderer v6r227 -->\n' + js + '\n<!-- /Signal Flow Build-a-Room consolidated renderer v6r227 -->\n'
if '</head>' not in html.lower() or '</body>' not in html.lower():
    raise SystemExit('Launch HTML is missing </head> or </body>')
html = re.sub(r'</head>', block_head + '</head>', html, count=1, flags=re.I)
html = re.sub(r'</body>', block_body + '</body>', html, count=1, flags=re.I)

LAUNCH.write_text(html)

# Confirm JSON assets exist in repo after unzip.
for p in [ROOT/'assets/build-room/build-room-asset-map.json', ROOT/'assets/build-room/build-room-manifest-v4.json', ROOT/'patch/sf-build-room-renderer.js', ROOT/'patch/sf-build-room-renderer.css']:
    if not p.exists():
        raise SystemExit(f'Missing installed file: {p}')

print('[OK] Installed Build-a-Room consolidated renderer v6r227')
print('[OK] Removed old fragmented Build-a-Room/Locker script refs from launch HTML')
print('[OK] Added manifest-driven renderer refs')
