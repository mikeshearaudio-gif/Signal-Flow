#!/usr/bin/env python3
from pathlib import Path
import json, sys
ROOT = Path.cwd()
ACTIVE_LAUNCHES = [
    ROOT/'launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html',
    ROOT/'launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html',
]
fail=[]
forbidden = [
    'sf-equipment-locker-ui',
    'sf-build-room-locker-integration',
    'sf-build-room-2-ui',
    'Build-a-Room 2.0 GUI active',
    'Equipment Locker UI active',
    'Build-a-Room locker integration active',
]
launch_text = {}
for path in ACTIVE_LAUNCHES:
    if not path.exists():
        fail.append(f'Missing active launch file: {path.relative_to(ROOT)}')
        continue
    text = path.read_text(errors='replace')
    launch_text[path] = text
    for token in forbidden:
        if token in text:
            fail.append(f'{path.relative_to(ROOT)} contains forbidden Build-a-Room token: {token}')
html = launch_text.get(ACTIVE_LAUNCHES[0], '')
for ref in ['sf-build-room-renderer.css?v=6r227','sf-build-room-renderer.js?v=6r227']:
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
if fail:
    print('[FAIL] Build-a-Room v6r227 verification failed:')
    for f in fail: print(' -', f)
    sys.exit(1)
print('[PASS] Build-a-Room v6r227 single-owner install is clean.')
