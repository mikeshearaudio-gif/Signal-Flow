#!/usr/bin/env python3
from pathlib import Path
import re, json

ROOT = Path.cwd()
LAUNCH = ROOT / 'launch' / 'Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html'
if not LAUNCH.exists():
    raise SystemExit(f'Missing {LAUNCH}')

html = LAUNCH.read_text()
backup = LAUNCH.with_suffix('.html.pre-build-room-v6r233.bak')
if not backup.exists():
    backup.write_text(html)

# Remove fragmented Build-a-Room/locker stack and prior consolidated renderer refs.
patterns = [
    r'\n?\s*<script[^>]+src=["\'][^"\']*(?:sf-build-room-2-ui|sf-build-room-locker-integration|sf-equipment-locker-ui|sf-build-room-renderer)\.js[^"\']*["\'][^>]*>\s*</script>\s*',
    r'\n?\s*<link[^>]+href=["\'][^"\']*(?:sf-build-room-2-ui|sf-build-room-locker-integration|sf-equipment-locker-ui|sf-build-room-renderer)\.css[^"\']*["\'][^>]*>\s*',
]
for pat in patterns:
    html = re.sub(pat, '\n', html, flags=re.I)

# Remove prior consolidated blocks.
html = re.sub(r'\n?\s*<!-- Signal Flow Build-a-Room consolidated renderer v6r\d+ -->[\s\S]*?<!-- /Signal Flow Build-a-Room consolidated renderer v6r\d+ -->\s*', '\n', html)
html = re.sub(r'\n?\s*<!-- Signal Flow Build-a-Room Equipment Locker source override v6r\d+ -->[\s\S]*?<!-- /Signal Flow Build-a-Room Equipment Locker source override v6r\d+ -->\s*', '\n', html)

# Source-level Splash label replacement. This is intentionally string-level so the real button says Equipment Locker.
html = re.sub(r'(?<![A-Za-z])Mic Locker(?![A-Za-z])', 'Equipment Locker', html)
html = re.sub(r'aria-label=["\']Mic Locker["\']', 'aria-label="Equipment Locker"', html)

# If the legacy click listener still calls openMicLocker, route it to the consolidated Equipment Locker.
html = re.sub(
    r"q\('micLockerBtn'\)\.addEventListener\('click',\s*\(ev\)\s*=>\s*\{\s*ev\.preventDefault\(\);\s*openMicLocker\(\);\s*\}\);",
    "q('micLockerBtn').addEventListener('click', (ev) => {\n    ev.preventDefault();\n    ev.stopPropagation();\n    if(window.sfOpenBuildRoomEquipmentLocker) window.sfOpenBuildRoomEquipmentLocker();\n    else openMicLocker();\n  });",
    html,
    flags=re.S,
)

# Guard the legacy function itself so the old reward locker page cannot be reached by stale handlers.
html = re.sub(
    r"function openMicLocker\(\)\{",
    "function openMicLocker(){\n  if(window.sfOpenBuildRoomEquipmentLocker){ window.sfOpenBuildRoomEquipmentLocker(); return; }",
    html,
    count=1,
)

css = '<link rel="stylesheet" href="/patch/sf-build-room-renderer.css?v=6r233" />'
js = '<script src="/patch/sf-build-room-renderer.js?v=6r233"></script>'
source_override = r'''
<!-- Signal Flow Build-a-Room Equipment Locker source override v6r233 -->
<script>
(function(){
  function txt(el){ return String((el && (el.textContent || el.getAttribute('aria-label'))) || '').replace(/\s+/g,' ').trim(); }
  function isSplash(){ return /\bPlay\b/i.test(document.body && document.body.textContent || '') && /\b(Equipment Locker|Mic Locker|Tutorial)\b/i.test(document.body && document.body.textContent || ''); }
  function openLocker(ev){
    if(ev){ ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation) ev.stopImmediatePropagation(); }
    if(window.sfOpenBuildRoomEquipmentLocker){ window.sfOpenBuildRoomEquipmentLocker(); return false; }
    return false;
  }
  window.openMicLocker = function(){ return openLocker(); };
  document.addEventListener('click', function(ev){
    if(!isSplash()) return;
    var target = ev.target && ev.target.closest && ev.target.closest('#micLockerBtn, button, a, [role="button"], .clean-splash-btn');
    if(!target) return;
    if(!/^(Equipment Locker|Mic Locker)$/i.test(txt(target))) return;
    target.textContent = 'Equipment Locker';
    target.setAttribute('aria-label','Equipment Locker');
    openLocker(ev);
  }, true);
})();
</script>
<!-- /Signal Flow Build-a-Room Equipment Locker source override v6r233 -->
'''
block_head = '\n<!-- Signal Flow Build-a-Room consolidated renderer v6r233 -->\n' + css + '\n<!-- /Signal Flow Build-a-Room consolidated renderer v6r233 -->\n'
block_body = source_override + '\n<!-- Signal Flow Build-a-Room consolidated renderer v6r233 -->\n' + js + '\n<!-- /Signal Flow Build-a-Room consolidated renderer v6r233 -->\n'
if '</head>' not in html.lower() or '</body>' not in html.lower():
    raise SystemExit('Launch HTML is missing </head> or </body>')
html = re.sub(r'sf-build-room-v6r\d+-mount', 'sf-build-room-v6r233-mount', html)
html = re.sub(r'</head>', block_head + '</head>', html, count=1, flags=re.I)
html = re.sub(r'</body>', block_body + '</body>', html, count=1, flags=re.I)
LAUNCH.write_text(html)

# Generate shelf map from local repo assets.
shelf_dir = ROOT / 'assets' / 'build-room' / 'svg' / 'shelves'
shelves = []
if shelf_dir.exists():
    for p in sorted(shelf_dir.rglob('*')):
        if p.is_file() and p.suffix.lower() in {'.svg', '.png', '.jpg', '.jpeg', '.webp'}:
            shelves.append({'name': p.stem, 'path': p.relative_to(ROOT).as_posix()})
out = ROOT / 'assets' / 'build-room' / 'build-room-shelf-map.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps({'version':'6r233','shelves':shelves}, indent=2))

# Normalize asset map using local files. This prevents blank/misleading DI and dynamic mic art when matching assets exist.
asset_path = ROOT / 'assets' / 'build-room' / 'build-room-asset-map.json'
if asset_path.exists():
    data = json.loads(asset_path.read_text())
    data['version'] = '6r233'
    items = data.setdefault('items', [])
    by_id = {str(it.get('id','')): it for it in items}
    def rel_files():
        roots = [ROOT/'assets/build-room/svg', ROOT/'assets/recording-studio', ROOT/'assets/live-sound']
        for base in roots:
            if base.exists():
                for p in base.rglob('*'):
                    if p.is_file() and p.suffix.lower() in {'.svg','.png','.jpg','.jpeg','.webp'}:
                        yield p.relative_to(ROOT).as_posix()
    files = list(rel_files())
    def best(include, exclude=()):
        for f in files:
            low = f.lower()
            if all(x in low for x in include) and not any(x in low for x in exclude): return f
        return ''
    def ensure_item(item_id, name, category, aliases=(), paths=()):
        it = by_id.get(item_id)
        if not it:
            it = {'id':item_id, 'displayName':name, 'category':category, 'family':'gear', 'assetPaths':[], 'aliases':[], 'source':'v6r233-normalized'}
            items.append(it); by_id[item_id] = it
        it['displayName'] = name
        it['category'] = category
        al = set(it.get('aliases') or [])
        al.update(aliases)
        it['aliases'] = sorted(al)
        clean_paths = [p for p in paths if p]
        if clean_paths:
            # Prefer exact local asset paths; keep older paths after them as fallbacks.
            old = [p for p in (it.get('assetPaths') or []) if p not in clean_paths]
            it['assetPaths'] = clean_paths + old
        return it
    di = best(('di',), ('diaphragm','condition','studio')) or best(('direct','box'), ()) or best(('di-box',), ())
    dyn = best(('sm58',), ()) or best(('dynamic','mic'), ('condenser',)) or best(('handheld','mic'), ('condenser',))
    ensure_item('passive-di-box','Passive DI box','Cables / DI', ['DI box','direct box','direct injection box'], [di])
    ensure_item('dynamic-cardioid-mic','Dynamic cardioid mic','Mics', ['Handheld dynamic mic','SM58 dynamic mic','SM57 dynamic mic'], [dyn])
    ensure_item('handheld-dynamic-cardioid-mic','Handheld dynamic cardioid mic','Mics', ['Dynamic cardioid mic','SM58 dynamic mic'], [dyn])
    asset_path.write_text(json.dumps(data, indent=2))

for p in [ROOT/'assets/build-room/build-room-asset-map.json', ROOT/'assets/build-room/build-room-manifest-v4.json', ROOT/'assets/build-room/build-room-shelf-map.json', ROOT/'patch/sf-build-room-renderer.js', ROOT/'patch/sf-build-room-renderer.css']:
    if not p.exists():
        raise SystemExit(f'Missing installed file: {p}')

print('[OK] Installed Build-a-Room consolidated renderer v6r233')
print('[OK] Replaced source Splash locker label/handler with Equipment Locker')
print('[OK] Generated shelf map with %d shelf assets' % len(shelves))
print('[OK] Normalized DI/dynamic mic asset mappings when local assets are available')
