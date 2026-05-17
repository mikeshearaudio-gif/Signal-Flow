#!/usr/bin/env python3
from pathlib import Path
import re, json, sys
ROOT=Path.cwd()
inner=ROOT/'launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html'
if not inner.exists(): raise SystemExit('[FAIL] missing inner launch')
text=inner.read_text()
forbidden=['sf-equipment-locker-ui','sf-build-room-locker-integration','sf-build-room-2-ui','Build-a-Room 2.0 GUI active','Equipment Locker UI active','Build-a-Room locker integration active']
fail=[]
for token in forbidden:
    if token in text: fail.append('forbidden token in launch: '+token)
for token in ['/patch/sf-build-room-renderer.css?v=6r228','/patch/sf-build-room-renderer.js?v=6r228']:
    if token not in text: fail.append('missing '+token)
js=ROOT/'patch/sf-build-room-renderer.js'
css=ROOT/'patch/sf-build-room-renderer.css'
for p in [js,css,ROOT/'assets/build-room/build-room-manifest-v4.json',ROOT/'assets/build-room/build-room-asset-map.json']:
    if not p.exists(): fail.append('missing '+str(p))
if js.exists():
    j=js.read_text()
    for token in ['setInterval(installSplashLocker','cloneNode(true)','replaceWith(clone)']:
        if token in j: fail.append('old splash workaround remains: '+token)
    if "VERSION = '6r228'" not in j: fail.append('renderer version not 6r228')
if css.exists() and 'max-height: calc(100vh - 185px)' not in css.read_text():
    fail.append('scroll/fitting CSS not found')
if fail:
    print('[FAIL] Build-a-Room v6r228 verify failed:')
    for f in fail: print(' - '+f)
    sys.exit(1)
print('[PASS] Build-a-Room v6r228 layout/splash install is clean.')
