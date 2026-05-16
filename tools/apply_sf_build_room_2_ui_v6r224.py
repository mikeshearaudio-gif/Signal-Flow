from pathlib import Path
import re

launch = Path('launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html')
if not launch.exists():
    raise SystemExit(f'Missing {launch}')

s = launch.read_text()

# Remove prior economy / equipment locker / Build-a-Room 2 UI package refs.
for name in ['sf-economy-rules', 'sf-equipment-locker-ui', 'sf-build-room-2-ui']:
    s = re.sub(rf'\n\s*<link rel="stylesheet" href="/patch/{name}\.css\?v=[^"]+"\s*/>\s*', '\n', s)
    s = re.sub(rf'\n\s*<script src="/patch/{name}\.js\?v=[^"]+"></script>\s*', '\n', s)

inject = (
    '  <link rel="stylesheet" href="/patch/sf-economy-rules.css?v=6r224" />\n'
    '  <script src="/patch/sf-economy-rules.js?v=6r224"></script>\n'
    '  <link rel="stylesheet" href="/patch/sf-equipment-locker-ui.css?v=6r224" />\n'
    '  <script src="/patch/sf-equipment-locker-ui.js?v=6r224"></script>\n'
    '  <link rel="stylesheet" href="/patch/sf-build-room-2-ui.css?v=6r224" />\n'
    '  <script src="/patch/sf-build-room-2-ui.js?v=6r224"></script>\n'
)
if '</head>' not in s:
    raise SystemExit('Could not find </head> to inject v6r224 patches')
s = s.replace('</head>', inject + '</head>', 1)

s = re.sub(r'diagnosis GUI v6r\d+(?: · build-room UI v6r\d+)?', 'diagnosis GUI v6r213 · build-room UI v6r224', s)
s = re.sub(r'build-room UI v6r\d+', 'build-room UI v6r224', s)
s = re.sub(r'equipment locker UI v6r\d+', 'equipment locker UI v6r224', s)
s = re.sub(r'economy rules v6r\d+', 'economy rules v6r224', s)

launch.write_text(s)
print('Applied Build-a-Room 2.0 / Equipment Locker / Economy fixes v6r224 to', launch)
