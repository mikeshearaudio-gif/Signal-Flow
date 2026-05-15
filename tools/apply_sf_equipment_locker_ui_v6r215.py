#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path.cwd()
launch = ROOT / 'launch' / 'Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html'
if not launch.exists():
    raise SystemExit(f'Missing {launch}')
text = launch.read_text()

css_tag = '<link rel="stylesheet" href="/patch/sf-equipment-locker-ui.css?v=6r215" />'
js_tag = '<script src="/patch/sf-equipment-locker-ui.js?v=6r215"></script>'

# Remove older v215 tag variants if rerun.
text = re.sub(r'\n\s*<link rel="stylesheet" href="/patch/sf-equipment-locker-ui\.css\?v=[^"]+"\s*/>', '', text)
text = re.sub(r'\n\s*<script src="/patch/sf-equipment-locker-ui\.js\?v=[^"]+"></script>', '', text)

# Insert CSS after economy rules CSS when possible.
if '/patch/sf-economy-rules.css' in text:
    text = re.sub(r'(<link rel="stylesheet" href="/patch/sf-economy-rules\.css\?v=[^"]+"\s*/>)', r'\1\n  ' + css_tag, text, count=1)
elif '</head>' in text:
    text = text.replace('</head>', '  ' + css_tag + '\n</head>', 1)
else:
    raise SystemExit('Could not find CSS insertion point')

# Insert JS after economy rules JS when possible.
if '/patch/sf-economy-rules.js' in text:
    text = re.sub(r'(<script src="/patch/sf-economy-rules\.js\?v=[^"]+"></script>)', r'\1\n  ' + js_tag, text, count=1)
elif '</body>' in text:
    text = text.replace('</body>', '  ' + js_tag + '\n</body>', 1)
else:
    raise SystemExit('Could not find JS insertion point')

launch.write_text(text)
print('Applied Equipment Locker UI v6r215 to', launch)
