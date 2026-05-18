#!/usr/bin/env python3
from pathlib import Path
import re, json, sys
ROOT = Path.cwd()
LAUNCH = ROOT/'launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html'
html = LAUNCH.read_text() if LAUNCH.exists() else ''
fail=[]
old_refs = ['sf-build-room-2-ui','sf-build-room-locker-integration','sf-equipment-locker-ui']
for ref in old_refs:
    if ref in html: fail.append(f'Old ref still present in launch HTML: {ref}')
for ref in ['sf-build-room-renderer.css?v=6r229','sf-build-room-renderer.js?v=6r229']:
    if ref not in html: fail.append(f'Missing new renderer ref: {ref}')
for p in ['assets/build-room/build-room-asset-map.json','assets/build-room/build-room-manifest-v4.json','patch/sf-build-room-renderer.js','patch/sf-build-room-renderer.css']:
    if not (ROOT/p).exists(): fail.append(f'Missing file: {p}')
try:
    a=json.loads((ROOT/'assets/build-room/build-room-asset-map.json').read_text())
    if not a.get('items'): fail.append('Asset map has no items')
except Exception as e: fail.append(f'Asset map JSON invalid: {e}')
try:
    m=json.loads((ROOT/'assets/build-room/build-room-manifest-v4.json').read_text())
    if not m.get('levels'): fail.append('Build-room manifest has no levels')
except Exception as e: fail.append(f'Manifest JSON invalid: {e}')

js = (ROOT/'patch/sf-build-room-renderer.js').read_text() if (ROOT/'patch/sf-build-room-renderer.js').exists() else ''
for bad in ['setInterval(installSplashLocker', 'cloneNode(true)', 'replaceWith(clone)', 'v6r228']:
    if bad in js: fail.append(f'Forbidden renderer pattern still present: {bad}')

if fail:
    print('[FAIL] Build-a-Room v6r229 verification failed:')
    for f in fail: print(' -', f)
    sys.exit(1)
print('[PASS] Build-a-Room v6r229 single-owner install is clean.')
