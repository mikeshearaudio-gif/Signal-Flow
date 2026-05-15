
/* Signal Flow Equipment Locker UI v6r215
 * Visual locker for permanent Build-a-Room gear ownership.
 * Reads signal-flow-equipment-locker-v1 written by sf-economy-rules.js.
 */
(function(){
  'use strict';
  if(window.sfEquipmentLockerUiV6r215Installed) return;
  window.sfEquipmentLockerUiV6r215Installed = true;

  const VERSION = '6r215';
  const LOCKER_KEY = 'signal-flow-equipment-locker-v1';
  const ROOT = '/assets/build-room/svg/';
  const SHELVES = ROOT + 'shelves/';
  const GEAR = ROOT + 'gear/';
  const BOXES = ROOT + 'boxes/';
  const ICONS = '/assets/icons/';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
  function safeJson(raw, fallback){ try { return raw ? JSON.parse(raw) : fallback; } catch(_) { return fallback; } }
  function readLocker(){
    let locker = { items:{}, history:[] };
    try { locker = safeJson(localStorage.getItem(LOCKER_KEY), locker); } catch(_) {}
    locker.items = locker.items || {};
    locker.history = Array.isArray(locker.history) ? locker.history : [];
    return locker;
  }
  function currentTotals(){
    try {
      const s = window.sfSignalFlowLedgerState || (typeof sfLedgerState === 'function' ? sfLedgerState() : null) || {};
      const totalCredits = Number(s.totalCredits || 0);
      const spentCredits = Number(s.spentCredits || 0);
      const availableCredits = Number(s.availableCredits != null ? s.availableCredits : Math.max(0, totalCredits - spentCredits));
      return { totalCredits, spentCredits, availableCredits };
    } catch(_) { return { totalCredits:0, spentCredits:0, availableCredits:0 }; }
  }
  function norm(s){ return String(s || '').toLowerCase(); }
  function categoryFor(item){
    const text = norm([item.category, item.label, item.key].join(' '));
    if(/mic|sm57|sm58|condenser|dynamic|lav|shotgun/.test(text)) return 'mics';
    if(/interface|converter|adac|a\/d|d\/a/.test(text)) return 'interfaces';
    if(/compress|preamp|eq|reverb|delay|processor|rack|outboard/.test(text)) return 'processors';
    if(/cable|xlr|adapter|di|direct/.test(text)) return 'cables';
    if(/speaker|monitor|wedge|pa|line array/.test(text)) return 'speakers';
    if(/console|mixer|mixing/.test(text)) return 'consoles';
    return item.category || 'equipment';
  }
  function assetFor(item){
    const text = norm([item.key, item.label, item.category].join(' '));
    if(/condenser/.test(text)) return BOXES + 'microphone-condenser-green-box-goodstyle.svg';
    if(/mic|sm57|sm58|dynamic|vocal/.test(text)) return BOXES + 'microphone-dynamic-orange-box-goodstyle.svg';
    if(/monitor|speaker|wedge|line array|pa/.test(text)) return BOXES + 'monitor-speakers-teal-box-goodstyle.svg';
    if(/interface|converter|adac/.test(text)) return BOXES + 'audio-interface-blue-box-goodstyle.svg';
    if(/tube.*preamp|preamp.*tube/.test(text)) return GEAR + 'tube-preamp-rack-unit-goodstyle.svg';
    if(/preamp/.test(text)) return GEAR + 'preamp-rack-unit-goodstyle.svg';
    if(/optical/.test(text)) return GEAR + 'optical-compressor-rack-unit-goodstyle.svg';
    if(/fet.*compress|compress.*fet/.test(text)) return GEAR + 'fet-compressor-rack-unit-goodstyle.svg';
    if(/vca.*compress|compress/.test(text)) return GEAR + 'vca-compressor-rack-unit-goodstyle.svg';
    if(/parametric.*eq/.test(text)) return GEAR + 'parametric-eq-rack-unit-goodstyle.svg';
    if(/eq|equalizer/.test(text)) return GEAR + 'graphic-eq-rack-unit-goodstyle.svg';
    if(/delay|reverb|fx|effect/.test(text)) return GEAR + 'delay-reverb-open-case-goodstyle.svg';
    if(/xlr|adapter|cable|di|direct/.test(text)) return GEAR + 'xlr-adapter-hanging-card-goodstyle.svg';
    if(/console|mixer|mixing/.test(text)) return GEAR + 'mixing-console-open-case-goodstyle.svg';
    return SHELVES + 'dimensional-empty-cubby-goodstyle.svg';
  }
  function useCasesFor(item){
    const cat = categoryFor(item);
    const text = norm([item.key, item.label].join(' '));
    if(cat === 'mics') return /condenser/.test(text) ? 'Detailed vocals, acoustic instruments, room capture, controlled studio sources.' : 'Live vocals, guitar cabs, snare, utility stage sources, durable close-miking.';
    if(cat === 'interfaces') return 'Computer I/O, podcast rigs, small recording setups, playback and capture routing.';
    if(cat === 'processors') return 'Signal shaping, dynamics control, EQ correction, tone polish, effects chains.';
    if(cat === 'cables') return 'Patch connections, DI/interface hookups, stagebox feeds, utility routing.';
    if(cat === 'speakers') return 'Monitoring, PA playback, wedge mixes, room approval checks.';
    if(cat === 'consoles') return 'Input mixing, aux sends, routing control, subgroups, main outputs.';
    return 'General production equipment for Build-a-Room briefs.';
  }
  function itemsArray(){
    const locker = readLocker();
    return Object.values(locker.items || {})
      .map(item => ({...item, qty:Number(item.qty || 0), category:categoryFor(item), asset:assetFor(item)}))
      .filter(item => item.qty > 0)
      .sort((a,b) => String(a.category).localeCompare(String(b.category)) || String(a.label || a.key).localeCompare(String(b.label || b.key)));
  }
  function categories(items){
    const out = ['all'];
    items.forEach(item => { if(!out.includes(item.category)) out.push(item.category); });
    return out;
  }
  function labelCat(cat){
    return ({all:'All',mics:'Mics',interfaces:'Interfaces',processors:'Processors',cables:'Cables / DI',speakers:'Speakers',consoles:'Consoles',equipment:'Equipment'})[cat] || cat.replace(/-/g,' ');
  }

  let currentCategory = 'all';
  let selectedKey = '';

  function detailMarkup(item){
    if(!item){
      return `<div class="sf-locker-detail-art-v215" style="background-image:url('${SHELVES}dimensional-empty-cubby-goodstyle.svg')"></div>
        <h3>Locker Ready</h3>
        <p>Purchased Build-a-Room equipment appears here permanently. Owned gear can be reused on future room builds for <strong>0 new credits</strong>.</p>
        <div class="sf-locker-detail-list-v215">
          <div><b>How to add gear</b>Complete Build-a-Room levels and purchase required equipment.</div>
          <div><b>Economy rule</b>Only new purchases cost credits. Gear already in the locker is reusable.</div>
        </div>`;
    }
    return `<div class="sf-locker-detail-art-v215" style="background-image:url('${esc(item.asset)}')"></div>
      <h3>${esc(item.label || item.key)}</h3>
      <p>${esc(labelCat(item.category))} · Owned quantity <strong>x${Number(item.qty || 0)}</strong></p>
      <div class="sf-locker-detail-list-v215">
        <div><b>First acquired</b>${esc(item.firstLevel || item.lastLevel || 'Purchased gear')}</div>
        <div><b>Reusable status</b>Available in future Build-a-Room levels for $0 new credit cost.</div>
        <div><b>Common uses</b>${esc(useCasesFor(item))}</div>
      </div>`;
  }

  function renderLocker(){
    document.querySelectorAll('.sf-locker-modal-v215, .sf-economy-modal').forEach(el => el.remove());
    const items = itemsArray();
    const cats = categories(items);
    if(!cats.includes(currentCategory)) currentCategory = 'all';
    const filtered = currentCategory === 'all' ? items : items.filter(item => item.category === currentCategory);
    const selected = items.find(item => item.key === selectedKey) || filtered[0] || items[0] || null;
    if(selected) selectedKey = selected.key;
    const totals = currentTotals();
    const ownedCount = items.reduce((sum,item) => sum + Number(item.qty || 0), 0);

    const el = document.createElement('div');
    el.className = 'sf-locker-modal-v215';
    el.innerHTML = `<section class="sf-locker-stage-v215" role="dialog" aria-modal="true" aria-label="Equipment Locker">
      <div class="sf-locker-bg-v215" aria-hidden="true"></div>
      <header class="sf-locker-header-v215">
        <div><h2>Equipment Locker</h2><p>Permanent Build-a-Room inventory. Owned equipment is reusable and costs 0 credits on future builds.</p></div>
        <button class="sf-locker-close-v215" type="button" aria-label="Close Equipment Locker">×</button>
      </header>
      <div class="sf-locker-counters-v215">
        <div class="sf-locker-pill-v215"><strong>${items.length}</strong> item types</div>
        <div class="sf-locker-pill-v215"><strong>${ownedCount}</strong> total owned</div>
        <div class="sf-locker-pill-v215"><strong>${totals.availableCredits}</strong> credits available</div>
      </div>
      <main class="sf-locker-body-v215">
        <section class="sf-locker-shelves-v215">
          <nav class="sf-locker-tabs-v215" aria-label="Locker categories">
            ${cats.map(cat => `<button type="button" class="sf-locker-tab-v215 ${cat === currentCategory ? 'is-active' : ''}" data-locker-cat="${esc(cat)}">${esc(labelCat(cat))}</button>`).join('')}
          </nav>
          <div class="sf-locker-grid-v215">
            ${filtered.length ? filtered.map(item => `<button type="button" class="sf-locker-slot-v215 ${item.key === selectedKey ? 'is-selected' : ''}" data-locker-key="${esc(item.key)}">
              <span class="sf-locker-item-art-v215" style="background-image:url('${esc(item.asset)}')"></span>
              <span class="sf-locker-qty-v215">×${Number(item.qty || 0)}</span>
              <span class="sf-locker-item-label-v215">${esc(item.label || item.key)}</span>
              <span class="sf-locker-item-meta-v215">${esc(labelCat(item.category))}</span>
            </button>`).join('') : `<div class="sf-locker-empty-v215"><div><strong>No ${currentCategory === 'all' ? 'owned gear' : labelCat(currentCategory)} yet</strong><p>Complete Build-a-Room levels to purchase gear and add it to the locker.</p></div></div>`}
          </div>
        </section>
        <aside class="sf-locker-detail-v215">${detailMarkup(selected)}</aside>
      </main>
    </section>`;
    document.body.appendChild(el);

    el.querySelector('.sf-locker-close-v215')?.addEventListener('click', () => el.remove());
    el.addEventListener('click', ev => { if(ev.target === el) el.remove(); });
    el.addEventListener('keydown', ev => { if(ev.key === 'Escape') el.remove(); });
    el.querySelectorAll('[data-locker-cat]').forEach(btn => {
      btn.addEventListener('click', ev => { ev.preventDefault(); currentCategory = btn.dataset.lockerCat || 'all'; selectedKey = ''; renderLocker(); });
    });
    el.querySelectorAll('[data-locker-key]').forEach(btn => {
      btn.addEventListener('click', ev => { ev.preventDefault(); selectedKey = btn.dataset.lockerKey || ''; renderLocker(); });
    });
  }

  function showLocker(){ renderLocker(); }
  window.sfOpenEquipmentLocker = showLocker;
  window.sfShowEquipmentLockerV6r215 = showLocker;

  function replaceOpenButton(){
    const old = document.getElementById('sf-equipment-locker-open');
    if(old && old.dataset.sfLockerUiV215 !== '1'){
      const clone = old.cloneNode(true);
      clone.dataset.sfLockerUiV215 = '1';
      clone.textContent = 'Equipment Locker';
      clone.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); showLocker(); }, true);
      old.replaceWith(clone);
      return;
    }
    if(!old){
      const btn = document.createElement('button');
      btn.id = 'sf-equipment-locker-open';
      btn.type = 'button';
      btn.className = 'sf-locker-open-button secondary';
      btn.dataset.sfLockerUiV215 = '1';
      btn.textContent = 'Equipment Locker';
      btn.style.position = 'fixed';
      btn.style.right = '18px';
      btn.style.bottom = '18px';
      btn.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); showLocker(); }, true);
      document.body.appendChild(btn);
    }
  }

  function installSplashEntry(){
    let entry = document.getElementById('sf-locker-splash-entry-v215');
    if(!entry){
      entry = document.createElement('button');
      entry.id = 'sf-locker-splash-entry-v215';
      entry.type = 'button';
      entry.className = 'sf-locker-splash-entry';
      entry.innerHTML = `<div>Equipment Locker<span>Owned Build-a-Room gear</span></div>`;
      entry.addEventListener('click', ev => { ev.preventDefault(); showLocker(); });
      document.body.appendChild(entry);
    }
    const isSplash = !!document.querySelector('.splash, .corrected-splash-stage, .machine-home') && !document.querySelector('.level-shell, [data-training-panel]');
    entry.classList.toggle('is-visible', isSplash);
  }

  function interceptOldLockerClicks(){
    if(window.sfLockerUiV215CaptureInstalled) return;
    window.sfLockerUiV215CaptureInstalled = true;
    document.addEventListener('click', ev => {
      const btn = ev.target && ev.target.closest && ev.target.closest('button, [role="button"], a');
      if(!btn) return;
      const text = (btn.textContent || btn.value || btn.getAttribute('aria-label') || '').replace(/\s+/g,' ').trim();
      if(btn.id !== 'sf-equipment-locker-open' && !/^open equipment locker$/i.test(text) && !/^equipment locker$/i.test(text)) return;
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation && ev.stopImmediatePropagation();
      showLocker();
    }, true);
  }

  function refresh(){
    replaceOpenButton();
    installSplashEntry();
  }

  interceptOldLockerClicks();
  document.addEventListener('DOMContentLoaded', refresh);
  window.addEventListener('load', () => { refresh(); setTimeout(refresh, 250); setTimeout(refresh, 900); });
  window.addEventListener('hashchange', () => setTimeout(refresh, 100));
  window.addEventListener('popstate', () => setTimeout(refresh, 100));
  new MutationObserver(() => { clearTimeout(window.sfLockerUiV215Timer); window.sfLockerUiV215Timer = setTimeout(refresh, 120); }).observe(document.documentElement, { childList:true, subtree:true });
  refresh();
  console.log('[Signal Flow] Equipment Locker UI active', VERSION);
})();
