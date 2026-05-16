from pathlib import Path
import re

launch = Path('launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html')
if not launch.exists():
    raise SystemExit(f'Missing {launch}')

s = launch.read_text()

# Remove prior Equipment Locker UI package copies.
s = re.sub(r'\n\s*<link rel="stylesheet" href="/patch/sf-equipment-locker-ui\.css\?v=[^"]+"\s*/>\s*', '\n', s)
s = re.sub(r'\n\s*<script src="/patch/sf-equipment-locker-ui\.js\?v=[^"]+"></script>\s*', '\n', s)

# Remove prior Build-a-Room 2 UI package copies.
s = re.sub(r'\n\s*<link rel="stylesheet" href="/patch/sf-build-room-2-ui\.css\?v=[^"]+"\s*/>\s*', '\n', s)
s = re.sub(r'\n\s*<script src="/patch/sf-build-room-2-ui\.js\?v=[^"]+"></script>\s*', '\n', s)

locker_css = '  <link rel="stylesheet" href="/patch/sf-equipment-locker-ui.css?v=6r222" />\n'
locker_js = '  <script src="/patch/sf-equipment-locker-ui.js?v=6r222"></script>\n'
br_css = '  <link rel="stylesheet" href="/patch/sf-build-room-2-ui.css?v=6r222" />\n'
br_js = '  <script src="/patch/sf-build-room-2-ui.js?v=6r222"></script>\n'

# Keep economy/locker integration before visual UIs when present.
insert = locker_css + locker_js + br_css + br_js
if '</head>' not in s:
    raise SystemExit('Could not find </head> to inject v6r222 UI patches')
s = s.replace('</head>', insert + '</head>', 1)

# Header/version badge.
s = re.sub(r'diagnosis GUI v6r\d+(?: · build-room UI v6r\d+)?', 'diagnosis GUI v6r213 · build-room UI v6r222', s)
s = re.sub(r'build-room UI v6r\d+', 'build-room UI v6r222', s)
s = re.sub(r'equipment locker UI v6r\d+', 'equipment locker UI v6r222', s)

launch.write_text(s)
print('Applied Build-a-Room 2.0 / Equipment Locker UI v6r222 to', launch)
