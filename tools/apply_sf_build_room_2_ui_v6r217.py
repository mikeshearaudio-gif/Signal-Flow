from pathlib import Path
import re

launch = Path('launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html')
if not launch.exists():
    raise SystemExit(f'Missing {launch}')

s = launch.read_text()

# Remove prior copies of this package only.
s = re.sub(r'\n\s*<link rel="stylesheet" href="/patch/sf-build-room-2-ui\.css\?v=[^"]+"\s*/>\s*', '\n', s)
s = re.sub(r'\n\s*<script src="/patch/sf-build-room-2-ui\.js\?v=[^"]+"></script>\s*', '\n', s)

css = '  <link rel="stylesheet" href="/patch/sf-build-room-2-ui.css?v=6r217" />\n'
js = '  <script src="/patch/sf-build-room-2-ui.js?v=6r217"></script>\n'

# Prefer installing after the v6r216 locker integration so v6r217 can build on its storage model.
marker = '<script src="/patch/sf-build-room-locker-integration.js?v=6r216"></script>'
if marker in s:
    s = s.replace(marker, marker + '\n' + css.rstrip('\n') + '\n' + js.rstrip('\n'), 1)
else:
    # Fallback: install before </head>.
    if '</head>' not in s:
        raise SystemExit('Could not find </head> to inject Build-a-Room 2.0 UI')
    s = s.replace('</head>', css + js + '</head>', 1)

# Update visible version badge/header string where present without touching core game build.
s = re.sub(r'diagnosis GUI v6r\d+', 'diagnosis GUI v6r213 · build-room UI v6r217', s)
s = re.sub(r'build-room UI v6r\d+', 'build-room UI v6r217', s)

launch.write_text(s)
print('Applied Build-a-Room 2.0 UI v6r217 to', launch)
