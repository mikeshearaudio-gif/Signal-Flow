#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path.cwd()
launch = ROOT / 'launch' / 'Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html'
if not launch.exists():
    raise SystemExit(f'Missing {launch}')
text = launch.read_text()

css_tag = '<link rel="stylesheet" href="/patch/sf-build-room-locker-integration.css?v=6r216" />'
js_tag = '<script src="/patch/sf-build-room-locker-integration.js?v=6r216"></script>'

# Remove older versions if rerun.
text = re.sub(r'\n\s*<link rel="stylesheet" href="/patch/sf-build-room-locker-integration\.css\?v=[^"]+"\s*/>', '', text)
text = re.sub(r'\n\s*<script src="/patch/sf-build-room-locker-integration\.js\?v=[^"]+"></script>', '', text)

# CSS can live after locker UI CSS.
if '/patch/sf-equipment-locker-ui.css' in text:
    text = re.sub(r'(<link rel="stylesheet" href="/patch/sf-equipment-locker-ui\.css\?v=[^"]+"\s*/>)', r'\1\n  ' + css_tag, text, count=1)
elif '/patch/sf-economy-rules.css' in text:
    text = re.sub(r'(<link rel="stylesheet" href="/patch/sf-economy-rules\.css\?v=[^"]+"\s*/>)', r'\1\n  ' + css_tag, text, count=1)
elif '</head>' in text:
    text = text.replace('</head>', '  ' + css_tag + '\n</head>', 1)
else:
    raise SystemExit('Could not find CSS insertion point')

# IMPORTANT: JS must be inserted in <head>, before older inline Build-a-Room delegated handlers register.
# Put it after CSS links but before </head>.
if '</head>' in text:
    text = text.replace('</head>', '  ' + js_tag + '\n</head>', 1)
else:
    raise SystemExit('Could not find JS insertion point')

launch.write_text(text)
print('Applied Build-a-Room Locker Integration v6r216 to', launch)
