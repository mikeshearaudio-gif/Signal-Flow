from pathlib import Path
import re

launch = Path('launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html')
if not launch.exists():
    raise SystemExit('Could not find launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html')

s = launch.read_text()
if 'sf-economy-rules.css' not in s:
    diag_css = re.search(r'<link[^>]+diagnosis-ui\.css\?v=6r\d+[^>]*>', s)
    tag = '  <link rel="stylesheet" href="/patch/sf-economy-rules.css?v=6r214" />'
    if diag_css:
        s = s[:diag_css.end()] + '\n' + tag + s[diag_css.end():]
    else:
        s = s.replace('</head>', tag + '\n</head>', 1)

if 'sf-economy-rules.js' not in s:
    diag_js = re.search(r'<script[^>]+diagnosis-ui\.js\?v=6r\d+[^>]*></script>', s)
    tag = '  <script src="/patch/sf-economy-rules.js?v=6r214"></script>'
    if diag_js:
        s = s[:diag_js.end()] + '\n' + tag + s[diag_js.end():]
    else:
        s = s.replace('</body>', tag + '\n</body>', 1)

launch.write_text(s)
print('Injected sf-economy-rules v6r214 into', launch)
