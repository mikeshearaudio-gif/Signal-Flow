from pathlib import Path
import re
files=[p for p in [Path('launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html'), Path('launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html'), Path('index.html')] if p.exists()]
patterns=['sf-build-room-renderer','sf-build-room-2-ui','sf-build-room-locker-integration','sf-equipment-locker-ui']
failed=False
for p in files:
    txt=p.read_text()
    hits={pat:txt.count(pat) for pat in patterns if pat in txt}
    print(f'{p}: {hits}')
    for bad in patterns[1:]:
        if bad in txt:
            failed=True
if failed:
    raise SystemExit('FAIL: stale Build-a-Room/locker refs remain')
print('PASS: no stale Build-a-Room/locker refs found in checked HTML')
