#!/usr/bin/env python3
from pathlib import Path
import json, sys, re
ROOT = Path.cwd()
LAUNCH = ROOT/'launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html'
html = LAUNCH.read_text() if LAUNCH.exists() else ''
fail=[]
old_refs = ['sf-build-room-2-ui','sf-build-room-locker-integration','sf-equipment-locker-ui']
for ref in old_refs:
    if ref in html: fail.append(f'Old ref still present in launch HTML: {ref}')
for ref in ['sf-build-room-renderer.css?v=6r233','sf-build-room-renderer.js?v=6r233']:
    if ref not in html: fail.append(f'Missing new renderer ref: {ref}')
if '>Mic Locker<' in html:
    fail.append('Source Splash button still renders Mic Locker text')
if 'sfOpenBuildRoomEquipmentLocker' not in html:
    fail.append('Launch HTML lacks Equipment Locker source override')
for p in ['assets/build-room/build-room-asset-map.json','assets/build-room/build-room-manifest-v4.json','assets/build-room/build-room-shelf-map.json','patch/sf-build-room-renderer.js','patch/sf-build-room-renderer.css']:
    if not (ROOT/p).exists(): fail.append(f'Missing file: {p}')
for p, key in [('assets/build-room/build-room-asset-map.json','items'),('assets/build-room/build-room-manifest-v4.json','levels')]:
    try:
        data=json.loads((ROOT/p).read_text())
        if not data.get(key): fail.append(f'{p} has no {key}')
    except Exception as e: fail.append(f'{p} JSON invalid: {e}')
try:
    json.loads((ROOT/'assets/build-room/build-room-shelf-map.json').read_text())
except Exception as e: fail.append(f'Shelf map JSON invalid: {e}')
js = (ROOT/'patch/sf-build-room-renderer.js').read_text() if (ROOT/'patch/sf-build-room-renderer.js').exists() else ''
css = (ROOT/'patch/sf-build-room-renderer.css').read_text() if (ROOT/'patch/sf-build-room-renderer.css').exists() else ''
for bad in ['setInterval(installSplashLocker', 'cloneNode(true)', 'replaceWith(clone)', 'v6r228', 'v6r229', 'v6r230', 'v6r231', 'v6r232']:
    if bad in js: fail.append(f'Forbidden renderer pattern/version still present: {bad}')
if 'installed v6r233' not in js: fail.append('Renderer install log is not v6r233')
if 'buildRoomSidebarRoot' not in js or 'Connection Checklist' not in js: fail.append('Renderer lacks v6r233 sidebar checklist logic')
if 'sf-br-card-category' in js: fail.append('Renderer still emits visible gear-card category sublabels')
if 'sf-br-card-category' not in css: fail.append('CSS lacks category sublabel hiding rule')
# Basic syntax check is done externally with node --check if available.
if fail:
    print('[FAIL] Build-a-Room v6r233 verification failed:')
    for f in fail: print(' -', f)
    sys.exit(1)
print('[PASS] Build-a-Room v6r233 single-owner install is clean.')
