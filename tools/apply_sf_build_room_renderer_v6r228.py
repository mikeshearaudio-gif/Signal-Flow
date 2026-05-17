#!/usr/bin/env python3
from pathlib import Path
import re, shutil
ROOT = Path.cwd()
inner = ROOT / 'launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html'
if not inner.exists():
    raise SystemExit(f'Missing launch file: {inner}')
patch_dir = ROOT / 'patch'
patch_dir.mkdir(exist_ok=True)
for name in ['sf-build-room-renderer.js','sf-build-room-renderer.css']:
    src = Path(__file__).resolve().parents[1] / 'patch' / name
    dst = patch_dir / name
    dst.write_text(src.read_text())
html = inner.read_text()
# remove retired stack references defensively
html = re.sub(r'\n\s*<link[^>]+sf-(?:equipment-locker-ui|build-room-locker-integration|build-room-2-ui)[^>]*>\s*', '\n', html)
html = re.sub(r'\n\s*<script[^>]+sf-(?:equipment-locker-ui|build-room-locker-integration|build-room-2-ui)[^>]*></script>\s*', '\n', html)
# ensure consolidated css/js refs exist and use v6r228
html = re.sub(r'/patch/sf-build-room-renderer\.css\?v=6r\d+', '/patch/sf-build-room-renderer.css?v=6r228', html)
html = re.sub(r'/patch/sf-build-room-renderer\.js\?v=6r\d+', '/patch/sf-build-room-renderer.js?v=6r228', html)
if '/patch/sf-build-room-renderer.css?v=6r228' not in html:
    html = html.replace('</head>', '  <link rel="stylesheet" href="/patch/sf-build-room-renderer.css?v=6r228" />\n</head>')
if '/patch/sf-build-room-renderer.js?v=6r228' not in html:
    html = html.replace('</body>', '  <script src="/patch/sf-build-room-renderer.js?v=6r228"></script>\n</body>')
# source-level splash text normalization
html = html.replace('>Mic Locker<', '>Equipment Locker<')
html = html.replace('"Mic Locker"', '"Equipment Locker"')
html = html.replace("'Mic Locker'", "'Equipment Locker'")
html = html.replace('aria-label="Mic Locker"', 'aria-label="Equipment Locker"')
inner.write_text(html)
print('[PASS] Applied Build-a-Room renderer v6r228 layout/splash repair.')
