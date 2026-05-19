from pathlib import Path
import re
import shutil
from datetime import datetime

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

js_path = Path("patch/sf-build-room-renderer.js")
css_path = Path("patch/sf-build-room-renderer.css")
launch_files = [
    Path("launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html"),
    Path("launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html"),
    Path("launch/Signal_Flow_CRASH_TEST_NO_EMBEDDED_MEDIA.html"),
]

def backup(path):
    if path.exists():
        b = path.with_name(path.name + f".bak_buildroom_v6r262_{stamp}")
        shutil.copy2(path, b)
        print("[OK] backup", b)

if not js_path.exists():
    raise SystemExit("Missing patch/sf-build-room-renderer.js")
if not css_path.exists():
    raise SystemExit("Missing patch/sf-build-room-renderer.css")

backup(js_path)
backup(css_path)

js = js_path.read_text()
css = css_path.read_text()

old_top = '''      <div class="sf-br-top">
        <div>
          <div class="sf-br-title-kicker">${escapeHtml(level.environment || '')} • BUILD A ROOM</div>
          <div class="sf-br-title">${escapeHtml(level.level_id)} • ${escapeHtml(level.scenario || 'Build the Room')}</div>
          <div class="sf-br-brief">${escapeHtml(level.brief || level.instruction || 'Choose the equipment needed for this job.')}</div>
        </div>
        <div class="sf-br-metrics">
          <div class="sf-br-metric"><div class="sf-br-metric-label">Credits available</div><div class="sf-br-metric-value">${totals.availableCredits}</div></div>
          <div class="sf-br-metric"><div class="sf-br-metric-label">New spend</div><div class="sf-br-metric-value">${money.spend}</div></div>
          <div class="sf-br-metric"><div class="sf-br-metric-label">Owned applied</div><div class="sf-br-metric-value">${money.ownedApplied}</div></div>
        </div>
      </div>'''

new_top = '''      <div class="sf-br-top">
        <div>
          <div class="sf-br-title-kicker">${escapeHtml(level.environment || '')} • BUILD A ROOM</div>
          <div class="sf-br-title">${escapeHtml(level.level_id)} • ${escapeHtml(level.scenario || 'Build the Room')}</div>
          <div class="sf-br-brief">${escapeHtml(level.brief || level.instruction || 'Choose the equipment needed for this job.')}</div>
        </div>
        <div class="sf-br-top-side">
          <div class="sf-br-metrics">
            <div class="sf-br-metric"><div class="sf-br-metric-label">Credits available</div><div class="sf-br-metric-value">${totals.availableCredits}</div></div>
            <div class="sf-br-metric"><div class="sf-br-metric-label">New spend</div><div class="sf-br-metric-value">${money.spend}</div></div>
            <div class="sf-br-metric"><div class="sf-br-metric-label">Owned applied</div><div class="sf-br-metric-value">${money.ownedApplied}</div></div>
          </div>
          <div class="sf-br-actions sf-br-top-actions">
            <button class="sf-br-btn danger" data-sf-br-action="reset">Reset Build</button>
            <button class="sf-br-btn" data-sf-br-action="check">Submit Build</button>
          </div>
        </div>
      </div>'''

if old_top not in js:
    raise SystemExit("Could not find expected Build-a-Room top block. Stop and inspect template.")
js = js.replace(old_top, new_top, 1)
print("[OK] moved Reset/Submit into top strip")

old_scene = '''          <section class="sf-br-scene">
            <div class="sf-br-room-backdrop"></div>
            <div class="sf-br-room-title">Room / System Build</div>
            <div class="sf-br-placement-grid">
              ${reqStatus.statuses.slice(0,8).map(st => `<div class="sf-br-placement ${st.ok ? 'is-satisfied' : ''}"><div class="sf-br-placement-label">${escapeHtml(st.req.need_group || st.req.name)}</div><div class="sf-br-placement-sub">${st.ok ? 'Ready' : 'Needs gear'}</div></div>`).join('')}
            </div>
          </section>
'''

if old_scene not in js:
    raise SystemExit("Could not find expected Room/System Build scene block. Stop and inspect template.")
js = js.replace(old_scene, "", 1)
print("[OK] removed redundant Room/System Build scene")

old_bottom = '''      <div class="sf-br-bottom">
        <div class="sf-br-summary">
          <span><strong>${money.selectedCount}</strong> selected</span>
          <span><strong>${money.spend}</strong> new credits</span>
          <span><strong>${Math.max(0, totals.availableCredits - money.spend)}</strong> remaining</span>
          <span><strong>${reqStatus.ok ? 'Ready to check' : 'Needs gear'}</strong></span>
        </div>
        <div class="sf-br-actions">
          <button class="sf-br-btn secondary" data-sf-br-action="open-locker">Open Locker</button>
          <button class="sf-br-btn danger" data-sf-br-action="reset">Reset Build</button>
          <button class="sf-br-btn" data-sf-br-action="check">Check Room</button>
        </div>
      </div>`;'''

new_bottom = '''      <div class="sf-br-bottom">
        <div class="sf-br-summary">
          <span><strong>${money.selectedCount}</strong> selected</span>
          <span><strong>${money.spend}</strong> new credits</span>
          <span><strong>${Math.max(0, totals.availableCredits - money.spend)}</strong> remaining</span>
          <span><strong>${reqStatus.ok ? 'Ready to submit' : 'Needs gear'}</strong></span>
        </div>
      </div>`;'''

if old_bottom not in js:
    raise SystemExit("Could not find expected bottom action block. Stop and inspect template.")
js = js.replace(old_bottom, new_bottom, 1)
print("[OK] removed bottom actions and Open Locker")

# Keep the modal locker function for already-owned gear history, but stop exposing floating shell button.
old_install_start = '''  function installSplashLocker(){
    // Remove old floating fallback buttons from previous patches.'''

new_install_start = '''  function installSplashLocker(){
    // Build-a-Room locked layout v6r262:
    // do not inject or clone floating Equipment Locker / Mic Locker buttons.
    return;
    // Remove old floating fallback buttons from previous patches.'''

if old_install_start not in js:
    raise SystemExit("Could not find installSplashLocker start.")
js = js.replace(old_install_start, new_install_start, 1)
print("[OK] disabled floating Equipment Locker injection")

# Add shell-mode helper: scoped, reversible, renderer-owned.
helper = r'''
  function applyBuildRoomShellMode(root){
    try{
      document.body.classList.add('sf-build-room-v6r227-active');

      // Clear previous shell hiding when re-rendering/changing levels.
      document.querySelectorAll('[data-sf-br-shell-hidden="true"]').forEach(el => {
        el.style.display = el.dataset.sfBrPrevDisplay || '';
        el.style.visibility = el.dataset.sfBrPrevVisibility || '';
        el.style.pointerEvents = el.dataset.sfBrPrevPointerEvents || '';
        delete el.dataset.sfBrShellHidden;
        delete el.dataset.sfBrPrevDisplay;
        delete el.dataset.sfBrPrevVisibility;
        delete el.dataset.sfBrPrevPointerEvents;
      });

      if(!root) return;
      const rootRect = root.getBoundingClientRect();
      const candidates = Array.from(document.querySelectorAll('body > * , body *')).filter(el => {
        if(!el || el === root || root.contains(el) || el.contains(root)) return false;
        const r = el.getBoundingClientRect && el.getBoundingClientRect();
        if(!r || r.width < 120 || r.height < 220) return false;
        const cs = getComputedStyle(el);
        if(cs.display === 'none' || cs.visibility === 'hidden') return false;

        // Hide only the old left lesson/sidebar panel: left of the Build-a-Room root,
        // tall enough to be the sidebar, below the top nav, not the browser/game top bar.
        return (
          r.left >= 0 &&
          r.left < rootRect.left - 12 &&
          r.top > 90 &&
          r.width <= 340 &&
          r.height >= 360
        );
      });

      // Prefer top-level visible containers so we do not hide tiny children one by one.
      candidates.sort((a,b) => {
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        return (br.width * br.height) - (ar.width * ar.height);
      });

      const hidden = [];
      for(const el of candidates){
        if(hidden.some(parent => parent.contains(el))) continue;
        const txt = String(el.textContent || '');
        // Only hide if it looks like the level lesson/sidebar, not nav or dev chrome.
        if(!/Level Brief|Current Level|Build the Room|Patch these|Reality Check|Learning Goals|Format Awareness|Why this setup matters/i.test(txt)) continue;
        el.dataset.sfBrShellHidden = 'true';
        el.dataset.sfBrPrevDisplay = el.style.display || '';
        el.dataset.sfBrPrevVisibility = el.style.visibility || '';
        el.dataset.sfBrPrevPointerEvents = el.style.pointerEvents || '';
        el.style.display = 'none';
        el.style.visibility = 'hidden';
        el.style.pointerEvents = 'none';
        hidden.push(el);
        if(hidden.length >= 2) break;
      }

      console.log('[Signal Flow] Build-a-Room shell mode applied v6r262', {hidden: hidden.length});
    }catch(err){
      console.warn('[Signal Flow] Build-a-Room shell mode failed v6r262', err);
    }
  }

  function clearBuildRoomShellMode(){
    try{
      document.body.classList.remove('sf-build-room-v6r227-active');
      document.querySelectorAll('[data-sf-br-shell-hidden="true"]').forEach(el => {
        el.style.display = el.dataset.sfBrPrevDisplay || '';
        el.style.visibility = el.dataset.sfBrPrevVisibility || '';
        el.style.pointerEvents = el.dataset.sfBrPrevPointerEvents || '';
        delete el.dataset.sfBrShellHidden;
        delete el.dataset.sfBrPrevDisplay;
        delete el.dataset.sfBrPrevVisibility;
        delete el.dataset.sfBrPrevPointerEvents;
      });
    }catch(_){}
  }

'''

if "function applyBuildRoomShellMode(root)" not in js:
    insert_at = js.find("  function renderBuildRoom(){")
    if insert_at < 0:
      raise SystemExit("Could not find renderBuildRoom insertion point.")
    js = js[:insert_at] + helper + js[insert_at:]
    print("[OK] inserted scoped shell-mode helper")
else:
    print("[SKIP] shell-mode helper already present")

old_active = '''    document.body.classList.add('sf-build-room-v6r227-active');
    const root = ensureContainer(levelId);'''

new_active = '''    document.body.classList.add('sf-build-room-v6r227-active');
    const root = ensureContainer(levelId);
    applyBuildRoomShellMode(root);'''

if old_active not in js:
    raise SystemExit("Could not find active/root lines.")
js = js.replace(old_active, new_active, 1)
print("[OK] call shell-mode helper after root creation")

# If non-Build-a-Room level, clear shell mode.
old_return = '''    const levelId = currentLevelId();
    if(!isBuildRoomLevel(levelId)) return;'''

new_return = '''    const levelId = currentLevelId();
    if(!isBuildRoomLevel(levelId)) { clearBuildRoomShellMode(); return; }'''

if old_return in js:
    js = js.replace(old_return, new_return, 1)
    print("[OK] clear shell mode outside Build-a-Room")
else:
    print("[WARN] could not patch non-Build-a-Room return")

js_path.write_text(js)

append_css = r'''

/* Build-a-Room locked layout recovery v6r262.
   Shared renderer-level fix for all Build-a-Room levels. */
body.sf-build-room-v6r227-active #micLockerBtn,
body.sf-build-room-v6r227-active .clean-locker-btn:not(.sf-br-btn),
body.sf-build-room-v6r227-active .sf-build-room-equipment-locker-entry,
body.sf-build-room-v6r227-active [data-sf-br-action="open-locker"] {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

body.sf-build-room-v6r227-active .sf-build-room-v6r227 {
  width: min(1500px, calc(100vw - 36px)) !important;
  max-width: none !important;
  margin: 10px auto 28px !important;
}

body.sf-build-room-v6r227-active .sf-br-top {
  grid-template-columns: minmax(0, 1fr) auto !important;
  align-items: start !important;
}

body.sf-build-room-v6r227-active .sf-br-top-side {
  display: grid !important;
  grid-template-columns: auto auto !important;
  gap: 12px !important;
  align-items: stretch !important;
  justify-content: end !important;
}

body.sf-build-room-v6r227-active .sf-br-top-actions {
  display: flex !important;
  align-items: stretch !important;
  gap: 10px !important;
}

body.sf-build-room-v6r227-active .sf-br-top-actions .sf-br-btn {
  min-width: 118px !important;
  min-height: 48px !important;
}

body.sf-build-room-v6r227-active .sf-br-body {
  grid-template-columns: minmax(250px, 300px) minmax(0, 1fr) !important;
  min-height: 610px !important;
}

body.sf-build-room-v6r227-active .sf-br-main {
  padding: 18px !important;
  display: flex !important;
  flex-direction: column !important;
  min-width: 0 !important;
}

body.sf-build-room-v6r227-active .sf-br-scene,
body.sf-build-room-v6r227-active .sf-br-room-title,
body.sf-build-room-v6r227-active .sf-br-placement-grid {
  display: none !important;
}

body.sf-build-room-v6r227-active .sf-br-store-head {
  margin: 0 0 12px !important;
  align-items: center !important;
}

body.sf-build-room-v6r227-active .sf-br-tabs {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 9px !important;
  align-items: center !important;
}

body.sf-build-room-v6r227-active .sf-br-tab {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 38px !important;
  padding: 9px 13px !important;
  line-height: 1.05 !important;
}

body.sf-build-room-v6r227-active .sf-br-store-grid {
  align-content: start !important;
}

@media (max-width: 1050px) {
  body.sf-build-room-v6r227-active .sf-br-top,
  body.sf-build-room-v6r227-active .sf-br-top-side,
  body.sf-build-room-v6r227-active .sf-br-body {
    grid-template-columns: 1fr !important;
  }
}
'''

if "Build-a-Room locked layout recovery v6r262" not in css:
    css += append_css
    print("[OK] appended v6r262 CSS")
else:
    print("[SKIP] v6r262 CSS already present")

css_path.write_text(css)

for p in launch_files:
    if not p.exists():
        continue
    html = p.read_text()
    new_html = re.sub(r'sf-build-room-renderer\.js\?v=6r\d+', 'sf-build-room-renderer.js?v=6r262', html)
    new_html = re.sub(r'sf-build-room-renderer\.css\?v=6r\d+', 'sf-build-room-renderer.css?v=6r262', new_html)
    if new_html != html:
        backup(p)
        p.write_text(new_html)
        print("[OK] bumped build-room cache in", p)

print("\nBuild-a-Room locked layout v6r262 patch complete.")
