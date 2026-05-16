from pathlib import Path
import json
import re

LAUNCH = Path('launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html')
if not LAUNCH.exists():
    raise SystemExit(f'Missing {LAUNCH}')

# Generate a real installed asset manifest so the runtime does not request guessed paths.
asset_roots = [
    Path('assets/build-room'),
    Path('assets/post/build-room'),
]
assets = []
for root in asset_roots:
    if not root.exists():
        continue
    for p in root.rglob('*'):
        if p.is_file() and p.suffix.lower() in {'.svg', '.png', '.jpg', '.jpeg', '.webp'}:
            rel = '/' + p.as_posix()
            assets.append({
                'path': rel,
                'name': p.name,
                'stem': p.stem,
                'ext': p.suffix.lower(),
            })
manifest_path = Path('assets/build-room/build-room-asset-manifest.json')
manifest_path.parent.mkdir(parents=True, exist_ok=True)
manifest_path.write_text(json.dumps({'version':'6r225','assets':assets}, indent=2))
print(f'Wrote {manifest_path} with {len(assets)} installed assets')

s = LAUNCH.read_text()

# Remove prior fragmented Build-a-Room/Locker UI patch stack and previous consolidated renderer refs.
legacy_names = [
    'sf-build-room-2-ui',
    'sf-build-room-locker-integration',
    'sf-equipment-locker-ui',
    'sf-build-room-renderer',
]
for name in legacy_names:
    s = re.sub(rf'\n\s*<link rel="stylesheet" href="/patch/{re.escape(name)}\.css\?v=[^"]+"\s*/>\s*', '\n', s)
    s = re.sub(rf'\n\s*<script src="/patch/{re.escape(name)}\.js\?v=[^"]+"></script>\s*', '\n', s)

inject = (
    '  <link rel="stylesheet" href="/patch/sf-build-room-renderer.css?v=6r225" />\n'
    '  <script src="/patch/sf-build-room-renderer.js?v=6r225"></script>\n'
)
if '</head>' not in s:
    raise SystemExit('Could not find </head> for injection')
s = s.replace('</head>', inject + '</head>', 1)

# Leave diagnosis/economy labels intact, but mark Build-a-Room as consolidated v6r225.
s = re.sub(r'(diagnosis GUI v6r\d+)(?:\s*·\s*build-room(?: UI| renderer)? v6r\d+)?', r'\1 · build-room renderer v6r225', s)
s = re.sub(r'build-room(?: UI| renderer)? v6r\d+', 'build-room renderer v6r225', s)
s = re.sub(r'equipment locker UI v6r\d+', 'build-room renderer v6r225', s)

LAUNCH.write_text(s)
print(f'Applied Build-a-Room consolidated renderer v6r225 to {LAUNCH}')
