
(function(){
  if(window.sfBuildRoomRendererV6r235Installed) return;
  window.sfBuildRoomRendererV6r235Installed = true;

  const VERSION = '6r235';
  const MANIFEST_URL = '/assets/build-room/build-room-manifest-v4.json?v=' + VERSION;
  const ASSET_MAP_URL = '/assets/build-room/build-room-asset-map.json?v=' + VERSION;
  const LOCKER_KEY = 'signal-flow-equipment-locker-v1';
  const SEL_KEY = 'signal-flow-build-room-selection-v6r235';
  const SHELF_MAP_URL = '/assets/build-room/build-room-shelf-map.json?v=' + VERSION;

  let manifest = null;
  let levelsById = {};
  let assetMap = null;
  let assetBySlug = {};
  let aliasToSlug = {};
  let currentRenderedLevelId = '';
  let shelfMap = { shelves: [] };
  let renderTimer = null;
  let activeCategory = 'All';
  let loggedActive = new Set();

  function slugify(value){
    return String(value || '').toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/\([^)]*\)/g, ' ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item';
  }

  function titleCaseish(value){
    return String(value || '').trim().replace(/\s+/g, ' ');
  }

  function normalizeName(name){
    let n = titleCaseish(name);
    const low = n.toLowerCase();
    const replacements = [
      [/^stage wedge mix$/i, 'Stage monitor'],
      [/^phone hybrid send$/i, 'Broadcast Phone System'],
      [/^foh matrix( 1)?$/i, 'Matrix router'],
      [/^getner$/i, 'Broadcast Phone System'],
      [/^gentner phone hybrid$/i, 'Broadcast Phone System'],
      [/^telephone hybrid$/i, 'Broadcast Phone System'],
      [/^ifb receiver \/ beltpack$/i, 'IFB beltpack receiver'],
      [/^ifb interface$/i, 'IFB transmitter'],
      [/^system matrix$/i, 'Matrix router'],
      [/^portable multichannel recorder \/ field recorder$/i, 'Field recorder / portable multichannel recorder'],
      [/^mic stand \/ field mic stand kit$/i, 'Mic stand kit'],
      [/^daw \/ computer workstation$/i, 'DAW workstation'],
      [/^processors?$/i, 'Processor rack'],
      [/^consoles?$/i, '16x4x2 live console'],
      [/^interfaces?$/i, 'Audio interface / DAW interface'],
      [/^speakers?$/i, 'Control room monitor pair'],
      [/^equipment$/i, 'General equipment kit'],
      [/^mixing console$/i, '16x4x2 live console'],
      [/^speaker processor$/i, 'System processor'],
      [/^telephone hybrid$/i, 'Broadcast Phone System']
    ];
    for(const [re, rep] of replacements){ if(re.test(n)) return rep; }
    // Endpoint terms should become physical gear if they leak into a store list.
    if(/tie line/i.test(n)) return 'XLR cable';
    if(/aux\s*\d*\s*output/i.test(n)) return 'TT patch cable';
    if(/fx return/i.test(n)) return '16x4x2 live console';
    if(/plate reverb output/i.test(n)) return 'Plate reverb';
    if(/console ch .*mic input|channel .*input/i.test(n)) return '16x4x2 recording console';
    if(/program bus output/i.test(n)) return '16x4x2 broadcast console';
    if(/stream encoder input/i.test(n)) return 'Stream encoder';
    if(/iem tx|iem transmitter input/i.test(n)) return 'IEM transmitter';
    return n;
  }

  function categoryFor(name){
    const n = String(name || '').toLowerCase();
    if(/cable|loom|trs|xlr|tt patch|instrument cable|di box/.test(n)) return 'Cables / DI';
    if(/mic|microphone|condenser|shotgun|boundary|contact|talkback/.test(n)) return 'Mics';
    if(/console|mixer/.test(n)) return 'Consoles / Mixers';
    if(/interface|daw|recorder|encoder|computer|workstation/.test(n)) return 'Interfaces / Recorders';
    if(/reverb|compressor|eq|processor|matrix|crossover|splitter|loudness|downmix|patchbay/.test(n)) return 'Processors / Routing';
    if(/iem|ifb|earpiece|earbud|headphone|beltpack/.test(n)) return 'Monitoring / IFB';
    if(/speaker|monitor|pa|stage monitor|front fill/.test(n)) return 'Speakers / Monitors';
    if(/stand|mount|wind|foley|kit/.test(n)) return 'Accessories';
    return 'General';
  }

  function iconFor(name){
    const c = categoryFor(name);
    if(c === 'Mics') return '🎙';
    if(c === 'Cables / DI') return '⎇';
    if(c === 'Consoles / Mixers') return '🎚';
    if(c === 'Interfaces / Recorders') return '▣';
    if(c === 'Processors / Routing') return '▤';
    if(c === 'Monitoring / IFB') return '🎧';
    if(c === 'Speakers / Monitors') return '◖';
    return '◆';
  }

  function loadJson(url){
    return fetch(url, {cache:'no-store'}).then(r => {
      if(!r.ok) throw new Error('Could not load ' + url + ': ' + r.status);
      return r.json();
    });
  }

  function prepareData(){
    if(!manifest || !manifest.levels) return;
    levelsById = {};
    manifest.levels.forEach(level => { levelsById[String(level.level_id || '').toUpperCase()] = level; });
    assetBySlug = {};
    aliasToSlug = {};
    (assetMap && assetMap.items || []).forEach(item => {
      const id = item.id || slugify(item.displayName);
      assetBySlug[id] = item;
      aliasToSlug[slugify(item.displayName)] = id;
      (item.aliases || []).forEach(alias => { aliasToSlug[slugify(alias)] = id; });
    });
  }

  function currentLevelObject(){
    try{ if(typeof level === 'function') return level(); }catch(_){ }
    return null;
  }

  function normalizeLevelId(value){
    const m = String(value || '').toUpperCase().match(/\b([A-Z]{3})[-_ ]?(\d{1,3})\b/);
    return m ? m[1] + '-' + String(Number(m[2])).padStart(3,'0') : '';
  }

  function currentLevelId(){
    const l = currentLevelObject();
    if(l && l.id) return normalizeLevelId(l.id);
    const hash = normalizeLevelId(location.hash);
    if(hash) return hash;
    const selected = Array.from(document.querySelectorAll('select')).map(s => {
      const opt = s.options && s.options[s.selectedIndex];
      return normalizeLevelId((opt && (opt.textContent || opt.value)) || s.value);
    }).find(Boolean);
    return selected || '';
  }

  function isBuildRoomLevel(id){
    id = normalizeLevelId(id || currentLevelId());
    if(id && levelsById[id]) return true;
    const l = currentLevelObject();
    const type = l && l.training && String(l.training.type || '').toLowerCase();
    return type === 'build-room';
  }

  function ledgerTotals(){
    try{
      if(typeof sfCompletionLedgerTotals === 'function') return sfCompletionLedgerTotals();
    }catch(_){ }
    try{
      const st = typeof sfLedgerState === 'function' ? sfLedgerState() : (window.sfSignalFlowLedgerState || {});
      const totalCredits = Number(st.totalCredits || 0);
      const spentCredits = Number(st.spentCredits || 0);
      return { totalCredits, spentCredits, availableCredits: Math.max(0, totalCredits - spentCredits), totalScore: Number(st.totalScore || 0) };
    }catch(_){ return { totalCredits:0, spentCredits:0, availableCredits:0, totalScore:0 }; }
  }

  function normalizeLockerData(locker){
    const out = {items:{}};
    const src = locker && locker.items ? Object.values(locker.items) : [];
    src.forEach(it => {
      const rawName = it && (it.name || it.displayName || it.id || it.category);
      if(!rawName) return;
      addLockerItem(out, rawName, Number(it.qty || it.quantity || 1), it.firstAcquiredLevel || it.firstAcquired || 'Legacy');
    });
    return out;
  }

  function loadLocker(){
    try{
      const raw = localStorage.getItem(LOCKER_KEY);
      if(!raw) return { items:{} };
      const parsed = JSON.parse(raw);
      if(parsed && parsed.items) return normalizeLockerData(parsed);
      if(Array.isArray(parsed)){
        const out = {items:{}};
        parsed.forEach(it => addLockerItem(out, it.name || it.displayName || it.id, Number(it.qty || it.quantity || 1), it.firstAcquiredLevel || 'Legacy'));
        return normalizeLockerData(out);
      }
    }catch(_){ }
    return { items:{} };
  }

  function saveLocker(locker){ localStorage.setItem(LOCKER_KEY, JSON.stringify(locker || {items:{}})); }

  function addLockerItem(locker, name, qty, levelId){
    name = normalizeName(name);
    const slug = slugify(name);
    if(!locker.items) locker.items = {};
    const item = locker.items[slug] || { id:slug, name, qty:0, firstAcquiredLevel:levelId || '', category:categoryFor(name) };
    item.name = item.name || name;
    item.qty = Number(item.qty || 0) + Math.max(0, Number(qty || 1));
    item.category = item.category || categoryFor(name);
    item.firstAcquiredLevel = item.firstAcquiredLevel || levelId || '';
    locker.items[slug] = item;
  }

  function ownedQty(name){
    const locker = loadLocker();
    const slug = slugify(normalizeName(name));
    return Number(locker.items && locker.items[slug] && locker.items[slug].qty || 0);
  }

  function getSelection(levelId){
    try{
      const all = JSON.parse(sessionStorage.getItem(SEL_KEY) || '{}');
      return all[levelId] || {};
    }catch(_){ return {}; }
  }

  function setSelection(levelId, selection){
    let all = {};
    try{ all = JSON.parse(sessionStorage.getItem(SEL_KEY) || '{}'); }catch(_){ }
    all[levelId] = selection || {};
    sessionStorage.setItem(SEL_KEY, JSON.stringify(all));
  }

  function clearSelection(levelId){ setSelection(levelId, {}); }

  function estimatedCost(name){
    const n = String(name || '').toLowerCase();
    if(/cable|loom/.test(n)) return /set|pair/.test(n) ? 20 : 10;
    if(/di box/.test(n)) return 35;
    if(/mic stand|mount|wind|foley/.test(n)) return 30;
    if(/earbud|headphone|earpiece/.test(n)) return 45;
    if(/dynamic|handheld|broadcast dynamic/.test(n)) return 80;
    if(/condenser|shotgun|boundary|contact/.test(n)) return 120;
    if(/interface|recorder|encoder|transmitter|receiver|beltpack/.test(n)) return 130;
    if(/console|mixer/.test(n)) return /48x|24x/.test(n) ? 500 : /16x/.test(n) ? 320 : 180;
    if(/speaker|pa|monitor/.test(n)) return 180;
    if(/reverb|compressor|eq|processor|matrix|crossover|splitter|loudness|downmix|patchbay|broadcast phone/.test(n)) return 140;
    return 75;
  }

  function assetFor(name){
    const normalized = normalizeName(name);
    const slug = slugify(normalized);
    const key = assetBySlug[slug] ? slug : aliasToSlug[slug];
    const exact = key ? assetBySlug[key] : null;
    if(exact && Array.isArray(exact.assetPaths) && exact.assetPaths.filter(Boolean).length) return exact;

    const category = categoryFor(normalized);
    const sameCategory = Object.values(assetBySlug).find(item =>
      item && Array.isArray(item.assetPaths) && item.assetPaths.filter(Boolean).length &&
      ((item.category && item.category === category) || categoryFor(item.displayName) === category)
    );
    if(sameCategory) return sameCategory;

    const fallbackOrder = ['16x4x2-live-console','xlr-cable','dynamic-cardioid-mic','rack-interface-unit','2x2-usb-interface','reverb-unit','control-room-monitor-pair'];
    for(const id of fallbackOrder){
      const item = assetBySlug[id] || assetBySlug[aliasToSlug[id]];
      if(item && Array.isArray(item.assetPaths) && item.assetPaths.filter(Boolean).length) return item;
    }
    return exact || null;
  }

  function imgFor(name){
    const asset = assetFor(name);
    const paths = asset && Array.isArray(asset.assetPaths) ? asset.assetPaths.filter(Boolean) : [];
    if(!paths.length) return '';
    return '/' + String(paths[0]).replace(/^\/+/, '');
  }


  function shelfUrl(){
    const shelves = shelfMap && Array.isArray(shelfMap.shelves) ? shelfMap.shelves : [];
    const preferred = shelves.find(s => /locker|shelf|store|equipment|build/i.test(String(s.path || s.name || ''))) || shelves[0];
    if(preferred && preferred.path) return '/' + String(preferred.path).replace(/^\/+/, '');
    return '';
  }

  function buildRoomSidebarRoot(){
    const candidates = Array.from(document.querySelectorAll('aside, section, article, div'))
      .filter(el => !el.closest('.sf-build-room-v6r235') && /CURRENT LEVEL|LEVEL BRIEF|EDUCATIONAL TOOLS|WHY THIS SETUP MATTERS/i.test(el.textContent || ''))
      .map(el => ({el, r: el.getBoundingClientRect(), text: el.textContent || ''}))
      .filter(x => x.r.width > 220 && x.r.width < 430 && x.r.left < 440 && x.r.height > 260)
      .sort((a,b) => {
        const scoreA = (/CURRENT LEVEL/i.test(a.text) ? 2 : 0) + (/EDUCATIONAL TOOLS/i.test(a.text) ? 2 : 0) + (a.r.height / 1000);
        const scoreB = (/CURRENT LEVEL/i.test(b.text) ? 2 : 0) + (/EDUCATIONAL TOOLS/i.test(b.text) ? 2 : 0) + (b.r.height / 1000);
        return scoreB - scoreA;
      });
    return candidates.length ? candidates[0].el : null;
  }

  function findEducationalToolsBlock(root){
    if(!root) return null;
    const children = Array.from(root.children || []);
    const direct = children.find(el => /EDUCATIONAL TOOLS/i.test(el.textContent || ''));
    if(direct) return direct;
    const label = Array.from(root.querySelectorAll('*')).find(el => /^\s*EDUCATIONAL TOOLS\s*$/i.test(el.textContent || ''));
    if(!label) return null;
    let node = label;
    while(node && node.parentElement && node.parentElement !== root){
      const r = node.getBoundingClientRect();
      const pr = node.parentElement.getBoundingClientRect();
      if(pr.width > 180 && pr.width < 430 && pr.height > Math.max(80, r.height + 40)) node = node.parentElement;
      else break;
    }
    return node.parentElement === root ? node : (label.closest('section, article, .card, .panel, div') || label);
  }

  function rowSatisfied(row, selection, items, reqStatus){
    const cableOrGear = normalizeName(row && row[2] || '');
    if(cableOrGear){
      const wanted = slugify(cableOrGear);
      if(Number(selection[wanted] || 0) > 0) return true;
      const matching = items.find(item => slugify(item.name) === wanted || slugify(normalizeName(item.name)) === wanted);
      if(matching && Number(selection[slugify(matching.name)] || 0) > 0) return true;
      if(/xlr/i.test(cableOrGear)){
        if(Object.keys(selection).some(k => /xlr/.test(k) && Number(selection[k] || 0) > 0)) return true;
      }
      if(/tt patch/i.test(cableOrGear)){
        if(Object.keys(selection).some(k => /tt.*patch|patch.*cable/.test(k) && Number(selection[k] || 0) > 0)) return true;
      }
      if(/console|mixer/i.test(cableOrGear)){
        if(Object.keys(selection).some(k => /console|mixer/.test(k) && Number(selection[k] || 0) > 0)) return true;
      }
    }
    const statuses = reqStatus && reqStatus.statuses || [];
    const idx = Array.isArray(row) && typeof row.__idx === 'number' ? row.__idx : -1;
    if(idx >= 0 && statuses[idx]) return !!statuses[idx].ok;
    return false;
  }

  function injectSidebarChecklist(level, reqStatus, selection, items){
    document.querySelectorAll('.sf-br-sidebar-checklist').forEach(el => el.remove());
    const root = buildRoomSidebarRoot();
    if(!root) return;
    const panel = document.createElement('div');
    panel.className = 'sf-br-sidebar-checklist';
    const checklist = Array.isArray(level.checklist) ? level.checklist : [];
    if(checklist.length){
      panel.innerHTML = `<div class="sf-br-sidebar-title">Connection Checklist</div>${checklist.map((row, idx) => {
        const from = row[0] || '';
        const to = row[1] || '';
        const annotated = row.slice ? row.slice() : row;
        annotated.__idx = idx;
        const ok = rowSatisfied(annotated, selection || {}, items || [], reqStatus);
        return `<div class="sf-br-sidebar-need ${ok ? 'is-satisfied' : ''}">
          <span class="sf-br-sidebar-dot"></span>
          <span><strong>${escapeHtml(from)} → ${escapeHtml(to)}</strong></span>
        </div>`;
      }).join('')}`;
    } else if(reqStatus && reqStatus.statuses && reqStatus.statuses.length){
      panel.innerHTML = `<div class="sf-br-sidebar-title">Build Checklist</div>${reqStatus.statuses.map(st => `
        <div class="sf-br-sidebar-need ${st.ok ? 'is-satisfied' : ''}">
          <span class="sf-br-sidebar-dot"></span>
          <span><strong>${escapeHtml(st.req.need_group || st.req.name)}</strong></span>
        </div>`).join('')}`;
    } else {
      return;
    }
    const edu = findEducationalToolsBlock(root);
    if(edu && edu.parentElement){ edu.parentElement.insertBefore(panel, edu); }
    else {
      const firstBig = Array.from(root.children || []).find(el => /EDUCATIONAL TOOLS|LEVEL BRIEF|WHY THIS SETUP/i.test(el.textContent || ''));
      if(firstBig) root.insertBefore(panel, firstBig); else root.appendChild(panel);
    }
  }

  function removeSidebarChecklist(){
    document.querySelectorAll('.sf-br-sidebar-checklist').forEach(el => el.remove());
  }

  function consolidateStore(level){
    const bySlug = {};
    function add(raw){
      if(!raw || !raw.name) return;
      const name = normalizeName(raw.name);
      // refuse to treat endpoints as gear unless normalized above changed them to real gear
      if(/input|output|return|send|tie line|program bus|channel|\bch\b/i.test(name) && name === raw.name) return;
      const slug = slugify(name);
      const entry = bySlug[slug] || {
        name,
        qty: Number(raw.qty || 1),
        role: raw.role || 'option',
        satisfies: raw.satisfies || raw.need_group || '',
        category: raw.category || categoryFor(name),
        notes: raw.notes || '',
        cost: estimatedCost(name)
      };
      // if any option satisfies a required group, keep that internal role, but never display it
      if(!entry.satisfies && (raw.satisfies || raw.need_group)) entry.satisfies = raw.satisfies || raw.need_group;
      if(entry.role === 'distractor' && raw.role && raw.role !== 'distractor') entry.role = raw.role;
      bySlug[slug] = entry;
    }
    (level.store || []).forEach(add);
    (level.required || []).forEach(req => add(Object.assign({}, req, {satisfies:req.need_group || req.satisfies || req.name})));
    return Object.values(bySlug).sort((a,b) => {
      const ca = categoryFor(a.name).localeCompare(categoryFor(b.name));
      return ca || a.name.localeCompare(b.name);
    });
  }

  function selectedSpendAndOwned(selection, items){
    let spend = 0, ownedApplied = 0, selectedCount = 0;
    items.forEach(item => {
      const slug = slugify(item.name);
      const qty = Number(selection[slug] || 0);
      if(!qty) return;
      selectedCount += qty;
      const owned = ownedQty(item.name);
      const free = Math.min(owned, qty);
      ownedApplied += free;
      spend += Math.max(0, qty - free) * item.cost;
    });
    return { spend, ownedApplied, selectedCount };
  }

  function requirementStatus(level, selection, items){
    const missing = [];
    const statuses = [];
    (level.required || []).forEach(req => {
      const needed = Number(req.qty || 1);
      const group = req.need_group || req.satisfies || req.name;
      let have = 0;
      items.forEach(item => {
        const q = Number(selection[slugify(item.name)] || 0);
        if(!q) return;
        const direct = slugify(item.name) === slugify(req.name);
        const groupMatch = group && item.satisfies && item.satisfies === group && !/distractor|wrong/i.test(item.role || '');
        if(direct || groupMatch) have += q;
      });
      const ok = have >= needed;
      statuses.push({ req, needed, have, ok, group });
      if(!ok) missing.push(req);
    });
    return { missing, statuses, ok: missing.length === 0 };
  }

  function ensureContainer(levelId){
    let existing = document.querySelector('.sf-build-room-v6r235[data-level-id="' + levelId + '"]');
    if(existing) return existing;
    document.querySelectorAll('.sf-build-room-v6r235').forEach(el => el.remove());
    const root = document.createElement('section');
    root.className = 'sf-build-room-v6r235';
    root.dataset.levelId = levelId;
    const old = findOldBuildPanel();
    if(old && old.parentElement){ old.parentElement.insertBefore(root, old); }
    else {
      const main = document.querySelector('main, .app, .level, body') || document.body;
      main.appendChild(root);
    }
    return root;
  }

  function findOldBuildPanel(){
    const selectors = ['[data-training-panel="build-room"]','.build-room','.build-room-panel','.route-training-panel','[class*="build-room"]'];
    for(const sel of selectors){
      const found = Array.from(document.querySelectorAll(sel)).find(el => !el.classList.contains('sf-build-room-v6r235') && /Build|Room|Check Room|BUY ONLY/i.test(el.textContent || ''));
      if(found) return found;
    }
    return Array.from(document.querySelectorAll('section, article, div')).find(el => /BUY ONLY WHAT THE BRIEF NEEDS|Check Room|Build the Room/i.test(el.textContent || '') && (el.getBoundingClientRect().width > 240));
  }

  function renderBuildRoom(){
    if(!manifest) return;
    const levelId = currentLevelId();
    if(!isBuildRoomLevel(levelId)){ document.body.classList.remove('sf-build-room-v6r235-active'); removeSidebarChecklist(); return; }
    const level = levelsById[levelId];
    if(!level) return;

    document.body.classList.add('sf-build-room-v6r235-active');
    const root = ensureContainer(levelId);
    const selection = getSelection(levelId);
    const items = consolidateStore(level);
    const totals = ledgerTotals();
    const money = selectedSpendAndOwned(selection, items);
    const reqStatus = requirementStatus(level, selection, items);
    const categories = ['All'].concat(Array.from(new Set(items.map(i => i.category || categoryFor(i.name)))));
    if(!categories.includes(activeCategory)) activeCategory = 'All';
    const visibleItems = activeCategory === 'All' ? items : items.filter(i => (i.category || categoryFor(i.name)) === activeCategory);

    if(!loggedActive.has(levelId)){
      console.log('[Signal Flow] Build-a-Room consolidated renderer active v6r235', levelId);
      loggedActive.add(levelId);
    }

    const renderStamp = JSON.stringify({levelId, activeCategory, selection, availableCredits: totals.availableCredits, spend: money.spend, ownedApplied: money.ownedApplied});
    if(root.dataset.sfBrRenderStamp === renderStamp) return;
    root.dataset.sfBrRenderStamp = renderStamp;

    injectSidebarChecklist(level, reqStatus, selection, items);

    root.innerHTML = `
      <div class="sf-br-top">
        <div class="sf-br-title-block">
          <div class="sf-br-title-kicker">${escapeHtml(level.environment || '')} • BUILD A ROOM</div>
          <div class="sf-br-title">${escapeHtml(level.level_id)} • ${escapeHtml(level.scenario || 'Build the Room')}</div>
          <div class="sf-br-brief">${escapeHtml(level.brief || level.instruction || 'Choose the equipment needed for this job.')}</div>
        </div>
        <div class="sf-br-header-actions">
          <button class="sf-br-btn danger" data-sf-br-action="reset">Reset</button>
          <button class="sf-br-btn" data-sf-br-action="check">Submit</button>
        </div>
        <div class="sf-br-metrics">
          <div class="sf-br-metric"><div class="sf-br-metric-label">Credits available</div><div class="sf-br-metric-value">${totals.availableCredits}</div></div>
          <div class="sf-br-metric"><div class="sf-br-metric-label">New spend</div><div class="sf-br-metric-value">${money.spend}</div></div>
          <div class="sf-br-metric"><div class="sf-br-metric-label">Owned applied</div><div class="sf-br-metric-value">${money.ownedApplied}</div></div>
        </div>
      </div>
      <div class="sf-br-shop" style="${shelfUrl() ? 'background-image: linear-gradient(180deg, rgba(3,8,18,.46), rgba(3,8,18,.90)), url(' + escapeAttr(shelfUrl()) + ');' : ''}">
        <div class="sf-br-store-head">
          <div>
            <div class="sf-br-section-title">Equipment options</div>
          </div>
          <div class="sf-br-tabs">${categories.map(cat => `<button class="sf-br-tab ${cat===activeCategory?'is-active':''}" data-sf-br-tab="${escapeAttr(cat)}">${escapeHtml(cat)}</button>`).join('')}</div>
        </div>
        <div class="sf-br-store-grid">
          ${visibleItems.map(item => renderCard(item, selection)).join('')}
        </div>
      </div>
`;

    bindBuildRoom(root, level, items);
  }

  function renderCard(item, selection){
    const slug = slugify(item.name);
    const qty = Number(selection[slug] || 0);
    const owned = ownedQty(item.name);
    const image = imgFor(item.name);
    const cost = item.cost || estimatedCost(item.name);
    const badges = [];
    if(owned > 0) badges.push(`<span class="sf-br-badge owned">Locker ×${owned}</span><span class="sf-br-badge owned">$0 reuse</span>`);
    badges.push(`<span class="sf-br-badge cost">${cost} credits</span>`);
    const fallback = `<div class="sf-br-art-fallback">${iconFor(item.name)}</div>`;
    const art = image ? `<img alt="" src="${escapeAttr(image)}" loading="lazy" onerror="this.remove();this.parentElement.classList.add('no-image')">${fallback}` : fallback;
    const ownedPill = `<span class="sf-br-owned-pill ${owned > 0 ? 'has-owned' : ''}">Owned ×${owned}</span>`;
    return `<article class="sf-br-card ${qty?'is-selected':''}" data-sf-br-item="${escapeAttr(slug)}" data-name="${escapeAttr(item.name)}">
      ${ownedPill}
      <div class="sf-br-art">${art}</div>
      <div class="sf-br-card-body">
        <div class="sf-br-card-name">${escapeHtml(item.name)}</div>
        <div class="sf-br-card-badges">${badges.join('')}</div>
        <div class="sf-br-card-controls">
          <button class="sf-br-step" data-sf-br-step="-1" aria-label="Remove one ${escapeAttr(item.name)}">−</button>
          <span class="sf-br-qty">${qty}</span>
          <button class="sf-br-step" data-sf-br-step="1" aria-label="Add one ${escapeAttr(item.name)}">+</button>
        </div>
      </div>
    </article>`;
  }

  function bindBuildRoom(root, level, items){
    root.querySelectorAll('[data-sf-br-tab]').forEach(btn => btn.addEventListener('click', () => { activeCategory = btn.dataset.sfBrTab || 'All'; renderBuildRoom(); }));
    root.querySelectorAll('[data-sf-br-item]').forEach(card => {
      card.addEventListener('click', ev => {
        const stepBtn = ev.target.closest('[data-sf-br-step]');
        const delta = stepBtn ? Number(stepBtn.dataset.sfBrStep || 0) : 1;
        const levelId = level.level_id;
        const selection = getSelection(levelId);
        const slug = card.dataset.sfBrItem;
        selection[slug] = Math.max(0, Number(selection[slug] || 0) + delta);
        if(selection[slug] <= 0) delete selection[slug];
        setSelection(levelId, selection);
        renderBuildRoom();
      });
    });
    root.querySelectorAll('[data-sf-br-action]').forEach(btn => btn.addEventListener('click', () => {
      const action = btn.dataset.sfBrAction;
      if(action === 'reset') { closeAllBuildModals(); clearSelection(level.level_id); renderBuildRoom(); }
      if(action === 'check') checkRoom(level, items);
    }));
  }

  function checkRoom(level, items){
    const selection = getSelection(level.level_id);
    const totals = ledgerTotals();
    const money = selectedSpendAndOwned(selection, items);
    const reqStatus = requirementStatus(level, selection, items);
    if(!reqStatus.ok){
      showModal('Room Needs Revision', `<p>Required needs are not satisfied yet.</p><ul>${reqStatus.missing.map(m => `<li>${escapeHtml(m.need_group || m.name)}: ${escapeHtml(m.name)} ×${Number(m.qty||1)}</li>`).join('')}</ul>`, [
        {label:'Retry Build', cls:'secondary', action:() => { closeAllBuildModals(); clearSelection(level.level_id); renderBuildRoom(); }},
        {label:'Keep Building', action:closeAllBuildModals}
      ]);
      try{ if(typeof playSfx === 'function') playSfx('wrongAnswer'); }catch(_){ }
      return;
    }
    if(money.spend > totals.availableCredits){
      showModal('Not Enough Credits', `<p>This build needs <strong>${money.spend}</strong> new credits, but only <strong>${totals.availableCredits}</strong> are available.</p><p>Replay earlier boards to earn more credits, then return to this build.</p>`, [
        {label:'Retry Build', cls:'secondary', action:() => { closeAllBuildModals(); clearSelection(level.level_id); renderBuildRoom(); }},
        {label:'Review Gear', action:closeAllBuildModals}
      ]);
      try{ if(typeof playSfx === 'function') playSfx('wrongAnswer'); }catch(_){ }
      return;
    }
    // Spend credits, add new purchases to locker, then award score only.
    try{
      if(typeof sfLedgerDispatch === 'function' && money.spend > 0){
        sfLedgerDispatch({ type:'REWARD_SPENT', levelId: level.level_id, itemId:'build-room-' + level.level_id + '-purchase', cost: money.spend });
      }
    }catch(err){ console.warn('[Signal Flow] Build-a-Room spend failed:', err); }

    const locker = loadLocker();
    items.forEach(item => {
      const selected = Number(selection[slugify(item.name)] || 0);
      if(!selected) return;
      const alreadyOwned = ownedQty(item.name);
      const newQty = Math.max(0, selected - alreadyOwned);
      if(newQty > 0) addLockerItem(locker, item.name, newQty, level.level_id);
    });
    saveLocker(locker);

    try{ if(typeof sfAwardLedgerScoreOnce === 'function') sfAwardLedgerScoreOnce('build-room-' + level.level_id, 100, 0); }catch(_){ }
    try{ if(typeof playSfx === 'function') playSfx('rightAnswer'); }catch(_){ }
    showModal('Room Approved', `<p>The required equipment needs are satisfied.</p><p><strong>New spend:</strong> ${money.spend} credits<br><strong>Owned gear applied:</strong> ${money.ownedApplied}<br><strong>New purchases:</strong> added to Equipment Locker.</p>`, [
      {label:'Open Locker', cls:'secondary', action:openLockerModal},
      {label:'Complete Board', action:() => { closeAllBuildModals(); try{ if(typeof completeLevel === 'function') completeLevel(); }catch(_){ } }}
    ]);
  }

  function showModal(title, html, actions){
    closeAllBuildModals();
    const backdrop = document.createElement('div');
    backdrop.className = 'sf-br-modal-backdrop';
    backdrop.innerHTML = `<div class="sf-br-modal" role="dialog" aria-modal="true"><h2>${escapeHtml(title)}</h2><div>${html}</div><div class="sf-br-modal-actions"></div></div>`;
    const actionsEl = backdrop.querySelector('.sf-br-modal-actions');
    (actions || [{label:'OK', action:closeAllBuildModals}]).forEach(a => {
      const b = document.createElement('button'); b.className = 'sf-br-btn ' + (a.cls || ''); b.textContent = a.label; b.addEventListener('click', a.action || closeAllBuildModals); actionsEl.appendChild(b);
    });
    document.body.appendChild(backdrop);
  }
  function closeAllBuildModals(){ document.querySelectorAll('.sf-br-modal-backdrop, .sf-build-room-modal, .sf-equipment-locker-modal, .sf-economy-modal, .sf-br2-modal, #gameOverOverlay, .game-over-overlay').forEach(el => el.remove()); }

  function openLockerModal(){
    const locker = loadLocker();
    const items = Object.values(locker.items || {}).sort((a,b) => String(a.name).localeCompare(String(b.name)));
    const shelf = shelfUrl();
    const body = items.length ? `<div class="sf-br-locker-shelf" style="${shelf ? 'background-image: linear-gradient(180deg, rgba(5,10,18,.30), rgba(5,10,18,.72)), url(' + escapeAttr(shelf) + ');' : ''}">${items.map(it => {
      const image = imgFor(it.name);
      const fallback = `<span class="sf-br-locker-fallback">${iconFor(it.name)}</span>`;
      return `<button class="sf-br-locker-card" type="button"><span class="sf-br-locker-art">${image ? `<img alt="" src="${escapeAttr(image)}" loading="lazy" onerror="this.remove();this.parentElement.classList.add('no-image')">${fallback}` : fallback}</span><strong>${escapeHtml(it.name)}</strong><small>Qty ${Number(it.qty||0)}</small><small>First acquired: ${escapeHtml(it.firstAcquiredLevel || '—')}</small></button>`;
    }).join('')}</div>` : '<p>No owned equipment yet. Approved Build-a-Room purchases will appear here.</p>';
    showModal('Equipment Locker', body, [{label:'Close', action:closeAllBuildModals}]);
  }


  function isVisibleElement(el){
    if(!el || !(el instanceof Element)) return false;
    const r = el.getBoundingClientRect();
    const st = getComputedStyle(el);
    return r.width > 20 && r.height > 12 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth && st.display !== 'none' && st.visibility !== 'hidden' && Number(st.opacity || 1) > 0.05;
  }

  function textOf(el){ return String((el && (el.textContent || el.getAttribute('aria-label') || el.value)) || '').replace(/\s+/g, ' ').trim(); }

  function splashIsVisible(){
    if(document.querySelector('.sf-build-room-v6r235')) return false;
    const txt = document.body ? document.body.textContent || '' : '';
    return /\bPlay\b/i.test(txt) && (/\bTutorial\b/i.test(txt) || /\bMic Locker\b|\bEquipment Locker\b/i.test(txt));
  }

  function findSplashLockerButton(){
    const controls = Array.from(document.querySelectorAll('#micLockerBtn, button, a, [role="button"], .clean-splash-btn'))
      .filter(isVisibleElement)
      .filter(el => /^(Mic Locker|Equipment Locker)$/i.test(textOf(el)));
    if(!controls.length) return null;
    // Prefer the legacy bottom-row locker slot, not any in-game Open Locker action.
    controls.sort((a,b) => {
      const ar = a.getBoundingClientRect(), br = b.getBoundingClientRect();
      const bottomA = ar.top > innerHeight * .55 ? 0 : 1;
      const bottomB = br.top > innerHeight * .55 ? 0 : 1;
      const micA = /micLockerBtn/i.test(a.id || '') ? -1 : 0;
      const micB = /micLockerBtn/i.test(b.id || '') ? -1 : 0;
      return micA - micB || bottomA - bottomB || ar.left - br.left;
    });
    return controls[0];
  }

  function removeSplashLockerOverlay(){
    document.querySelectorAll('.sf-br-splash-locker-overlay').forEach(el => el.remove());
  }

  function removeFloatingLockerButtons(){
    removeSplashLockerOverlay();
    document.querySelectorAll('.sf-build-room-floating-locker, .sf-equipment-locker-floating').forEach(el => el.remove());
    Array.from(document.querySelectorAll('button, a, [role="button"]')).forEach(el => {
      const r = el.getBoundingClientRect();
      if(/^Equipment Locker$/i.test(textOf(el)) && r.top > innerHeight * .70 && r.left > innerWidth * .55 && !/micLockerBtn/i.test(el.id || '') && !el.classList.contains('sf-br-splash-locker-overlay')) el.remove();
    });
  }

  function findSplashLockerSlot(){
    const elements = Array.from(document.querySelectorAll('#micLockerBtn, .clean-locker-btn, .clean-splash-btn, button, a, [role="button"], div, span'))
      .filter(isVisibleElement)
      .filter(el => /^(Mic Locker|Equipment Locker)$/i.test(textOf(el)))
      .map(el => ({el, r: el.getBoundingClientRect()}))
      .filter(x => x.r.top > innerHeight * .50 && x.r.left < innerWidth * .65);
    if(!elements.length) return null;
    elements.sort((a,b) => {
      const am = /micLockerBtn|clean-locker-btn/i.test(a.el.id || a.el.className || '') ? -1 : 0;
      const bm = /micLockerBtn|clean-locker-btn/i.test(b.el.id || b.el.className || '') ? -1 : 0;
      return am - bm || a.r.left - b.r.left;
    });
    return elements[0];
  }

  function installSplashLockerOverlay(slot){
    removeSplashLockerOverlay();
    if(!slot || !slot.r) return;
    const r = slot.r;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sf-br-splash-locker-overlay';
    btn.textContent = 'Equipment Locker';
    btn.setAttribute('aria-label', 'Equipment Locker');
    Object.assign(btn.style, {
      left: Math.round(r.left) + 'px',
      top: Math.round(r.top) + 'px',
      width: Math.max(120, Math.round(r.width)) + 'px',
      height: Math.max(34, Math.round(r.height)) + 'px'
    });
    bindLockerClick(btn);
    document.body.appendChild(btn);
  }

  function bindLockerClick(btn){
    if(!btn) return;
    btn.dataset.sfBrLockerOwner = VERSION;
    btn.onclick = function(ev){
      if(ev){ ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation) ev.stopImmediatePropagation(); }
      openLockerModal();
      return false;
    };
    btn.addEventListener('click', ev => {
      ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation) ev.stopImmediatePropagation(); openLockerModal();
    }, true);
  }

  function installSplashLocker(){
    removeFloatingLockerButtons();
    if(!splashIsVisible()){ removeSplashLockerOverlay(); return; }
    const btn = findSplashLockerButton();
    if(btn){
      removeSplashLockerOverlay();
      btn.id = btn.id || 'micLockerBtn';
      btn.textContent = 'Equipment Locker';
      btn.setAttribute('aria-label', 'Equipment Locker');
      btn.removeAttribute('aria-hidden');
      btn.removeAttribute('inert');
      btn.classList.add('sf-build-room-equipment-locker-entry');
      btn.style.pointerEvents = 'auto';
      btn.style.visibility = 'visible';
      btn.style.opacity = '1';
      bindLockerClick(btn);
      return;
    }
    // Some Splash builds render the locker label as a non-button visual. Cover that exact slot only.
    installSplashLockerOverlay(findSplashLockerSlot());
  }

  function interceptSplashLockerClick(ev){
    if(!splashIsVisible()) return;
    const target = ev.target && ev.target.closest && ev.target.closest('#micLockerBtn, button, a, [role="button"], .clean-splash-btn');
    if(!target || !isVisibleElement(target)) return;
    if(!/^(Mic Locker|Equipment Locker)$/i.test(textOf(target))) return;
    ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation) ev.stopImmediatePropagation();
    installSplashLocker();
    openLockerModal();
  }

  window.openMicLocker = function(){ openLockerModal(); return false; };

  function escapeHtml(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function escapeAttr(s){ return escapeHtml(s).replace(/`/g, '&#96;'); }

  function scheduleRender(){
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderBuildRoom, 80);
  }

  function boot(){
    Promise.all([loadJson(MANIFEST_URL), loadJson(ASSET_MAP_URL), loadJson(SHELF_MAP_URL).catch(() => ({shelves:[]}))]).then(([m,a,sh]) => {
      manifest = m; assetMap = a; shelfMap = sh || {shelves:[]}; prepareData();
      console.log('[Signal Flow] Build-a-Room consolidated renderer installed v6r235');
      window.sfOpenBuildRoomEquipmentLocker = openLockerModal;
      removeSplashLockerOverlay();
      installSplashLocker();
      renderBuildRoom();

      document.addEventListener('click', interceptSplashLockerClick, true);
      document.addEventListener('click', ev => {
        const btn = ev.target && ev.target.closest && ev.target.closest('button, a, [role="button"]');
        if(btn && /^(Splash|Play|Tutorial)$/i.test(textOf(btn))){
          if(splashIsVisible()) setTimeout(installSplashLocker, 60);
        }
      }, false);

      document.addEventListener('change', scheduleRender, true);
      document.addEventListener('input', scheduleRender, true);
      window.addEventListener('hashchange', scheduleRender);
      window.addEventListener('popstate', scheduleRender);
      ['sf:level-change','sf-level-change','signalflow:levelchange','signal-flow:level-change'].forEach(name => window.addEventListener(name, scheduleRender));

      const obs = new MutationObserver(mutations => {
        let shouldRender = false;
        for(const m of mutations){
          for(const node of Array.from(m.addedNodes || [])){
            if(node.nodeType !== 1) continue;
            if(node.closest && node.closest('.sf-build-room-v6r235')) continue;
            if(node.matches && node.matches('[data-sf-build-room-renderer-mount], [data-training-panel="build-room"]')) shouldRender = true;
            if(node.querySelector && node.querySelector('[data-sf-build-room-renderer-mount], [data-training-panel="build-room"]')) shouldRender = true;
          }
        }
        if(shouldRender) scheduleRender();
        if(splashIsVisible()) setTimeout(installSplashLocker, 80);
      });
      obs.observe(document.body || document.documentElement, {childList:true, subtree:true});
    }).catch(err => console.error('[Signal Flow] Build-a-Room consolidated renderer failed:', err));
  }


  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
