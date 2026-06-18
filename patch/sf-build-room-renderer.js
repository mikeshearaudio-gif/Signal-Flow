
(function(){
  if(window.sfBuildRoomRendererV6r227Installed) return;
  window.sfBuildRoomRendererV6r227Installed = true;

  const VERSION = '6r286buildroombalance';
  const REPO_ROOT = new URL('../', document.currentScript?.src || document.baseURI).href;
  const ASSET_ROOT = new URL('../assets/build-room/', document.currentScript?.src || document.baseURI).href;
  const MANIFEST_URL = ASSET_ROOT + 'build-room-manifest-v4.json?v=' + VERSION;
  const ASSET_MAP_URL = ASSET_ROOT + 'build-room-asset-map.json?v=' + VERSION;
  const LOCKER_KEY = 'signal-flow-equipment-locker-v1';
  const SEL_KEY = 'signal-flow-build-room-selection-v6r227';
  const oldScriptNames = ['sf-build-room-2-ui','sf-build-room-locker-integration','sf-equipment-locker-ui'];

  let manifest = null;
  let levelsById = {};
  let assetMap = null;
  let assetBySlug = {};
  let aliasToSlug = {};
  let currentRenderedLevelId = '';
  let renderTimer = null;
  let activeCategory = 'All';
  let loggedActive = new Set();
  let lifecycleHooksInstalled = false;

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
      [/^daw \/ computer workstation$/i, 'DAW workstation']
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
    const envCounts = {};
    manifest.levels.forEach(level => {
      const envKey = String(level.environment || '').toLowerCase();
      envCounts[envKey] = Number(envCounts[envKey] || 0) + 1;
      const normalized = normalizeTieredLevel(level, envCounts[envKey]);
      levelsById[String(normalized.level_id || '').toUpperCase()] = normalized;
    });
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

  function launchLevels(){
    try{
      if(window.DATA && Array.isArray(window.DATA.levels)) return window.DATA.levels;
    }catch(_){}
    try{
      if(window.SIGNAL_FLOW_V12 && Array.isArray(window.SIGNAL_FLOW_V12.levels)) return window.SIGNAL_FLOW_V12.levels;
    }catch(_){}
    return [];
  }

  function priorLedgerCreditsForLevel(levelId){
    const id = String(levelId || '').toUpperCase();
    const levels = launchLevels();
    if(!id || !levels.length) return null;
    const creditByEnv = {};
    for(const level of levels){
      const env = String(level && level.environment || '');
      const currentCredits = Number(creditByEnv[env] || 0);
      if(String(level && level.id || '').toUpperCase() === id) return currentCredits;
      if(!env) continue;
      creditByEnv[env] = currentCredits + 25;
      if(level && level.training && String(level.training.type || '').toLowerCase() === 'quiz'){
        creditByEnv[env] += 25;
      }
    }
    return null;
  }

  function loadLocker(){
    try{
      const raw = localStorage.getItem(LOCKER_KEY);
      if(!raw) return { items:{} };
      const parsed = JSON.parse(raw);
      if(parsed && parsed.items) return parsed;
      if(Array.isArray(parsed)){
        const out = {items:{}};
        parsed.forEach(it => addLockerItem(out, it.name || it.displayName || it.id, Number(it.qty || it.quantity || 1), it.firstAcquiredLevel || 'Legacy'));
        return out;
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
    if(/cable|loom/.test(n)) return /set|pair/.test(n) ? 10 : 5;
    if(/di box/.test(n)) return 10;
    if(/mic stand|mount|wind|foley/.test(n)) return 10;
    if(/earbud|headphone|earpiece/.test(n)) return 15;
    if(/dynamic|handheld|broadcast dynamic/.test(n)) return 15;
    if(/condenser|shotgun|boundary|contact/.test(n)) return 25;
    if(/interface|recorder|encoder|transmitter|receiver|beltpack/.test(n)) return 30;
    if(/console|mixer/.test(n)) return /48x|24x/.test(n) ? 120 : /16x/.test(n) ? 50 : 45;
    if(/speaker|pa|monitor/.test(n)) return 25;
    if(/stagebox/.test(n)) return 15;
    if(/reverb|compressor|eq|processor|matrix|crossover|splitter|loudness|downmix|patchbay|broadcast phone/.test(n)) return 25;
    return 20;
  }

  function itemCost(item){
    return Number(item && item.cost != null ? item.cost : estimatedCost(item && item.name));
  }

  function tierStarterAllowed(item){
    const name = String(item && item.name || '').toLowerCase();
    const category = String(item && item.category || categoryFor(item && item.name) || '').toLowerCase();
    if(/processor|matrix|crossover|splitter|loudness|downmix|patchbay|broadcast phone|ifb|iem|speaker|pa|front fill|stage monitor|monitor pair|headphone|earbud|beltpack|reverb|compressor|eq|dolby|renderer|advanced|rack/.test(name)) return false;
    if(/processors|routing|speakers|monitors|ifb/.test(category)) return false;
    if(/encoder/.test(name)) return false;
    if(/boundary|contact/.test(name)) return false;
    return /cable|loom|trs|xlr|usb|instrument|di box|mic|microphone|preamp|interface|recorder|daw|console|mixer|stagebox|snake|stand|mount|wind|foley|kit/.test(name + ' ' + category);
  }

  function requiredCost(required){
    return (required || []).reduce((sum, item) => sum + itemCost(item) * Number(item && item.qty || 1), 0);
  }

  function normalizeTieredLevel(level, tier){
    const copy = JSON.parse(JSON.stringify(level || {}));
    copy.tier = tier;
    copy.required = (copy.required || []).map(item => Object.assign({}, item, {
      name: normalizeName(item.name),
      category: item.category || categoryFor(item.name)
    }));
    copy.store = (copy.store || []).map(item => Object.assign({}, item, {
      name: normalizeName(item.name),
      category: item.category || categoryFor(item.name)
    }));

    if(tier !== 1) return copy;

    const priorCredits = priorLedgerCreditsForLevel(copy.level_id);
    const cap = Number.isFinite(Number(priorCredits)) ? Number(priorCredits) : 100;
    if(requiredCost(copy.required) <= cap) return copy;

    const selected = [];
    const demoted = [];
    let total = 0;
    copy.required.forEach(item => {
      const cost = itemCost(item) * Number(item.qty || 1);
      if(tierStarterAllowed(item) && total + cost <= cap){
        selected.push(item);
        total += cost;
      }else{
        demoted.push(item);
      }
    });

    if(selected.length){
      copy.required = selected;
      const demotedSlugs = new Set(demoted.map(item => slugify(item.name)));
      copy.store = copy.store.map(item => {
        if(!demotedSlugs.has(slugify(item.name))) return item;
        return Object.assign({}, item, { role:'distractor', satisfies:'', notes: item.notes || 'Tier 1 optional/overkill gear.' });
      });
      copy.tier_normalized = true;
      copy.tier_prior_credits = cap;
    }
    return copy;
  }

  function assetFor(name){
    const slug = slugify(normalizeName(name));
    const key = assetBySlug[slug] ? slug : aliasToSlug[slug];
    return key ? assetBySlug[key] : null;
  }

  function imgFor(name){
    const asset = assetFor(name);
    const paths = asset && Array.isArray(asset.assetPaths) ? asset.assetPaths.filter(Boolean) : [];
    if(!paths.length) return '';
    return new URL(String(paths[0]).replace(/^\/+/, ''), REPO_ROOT).href;
  }

  function fallbackLevelFromCurrent(){
    const l = currentLevelObject();
    const t = l && l.training;
    if(!t || String(t.type || '').toLowerCase() !== 'build-room') return null;

    const levelId = normalizeLevelId(l.id || currentLevelId()) || String(l.id || currentLevelId() || 'BUILD-ROOM').toUpperCase();
    const needed = Array.isArray(t.needed) ? t.needed : [];
    const distractors = Array.isArray(t.distractors) ? t.distractors : [];
    const required = needed.map(item => {
      const name = normalizeName(item && item.name ? item.name : item);
      return {
        name,
        qty: Number(item && item.qty || 1),
        need_group: name,
        category: categoryFor(name),
        role: 'required'
      };
    });
    const store = required.concat(distractors.map(item => {
      const name = normalizeName(item && item.name ? item.name : item);
      return {
        name,
        qty: Number(item && item.qty || 1),
        category: categoryFor(name),
        role: 'distractor'
      };
    }));

    return {
      level_id: levelId,
      environment: l.environment || t.environment || '',
      scenario: l.title || t.scenario || 'Build the Room',
      brief: t.brief || l.brief || l.prompt || '',
      instruction: t.instruction || t.prompt || l.instruction || l.prompt || 'Choose the equipment needed for this job.',
      required,
      store
    };
  }

  function consolidateStore(level){
    const bySlug = {};
    function add(raw){
      if(!raw || !raw.name) return;
      const name = normalizeName(raw.name);
      // refuse to treat endpoints as gear unless normalized above changed them to real gear
      if(/input|output|return|send|tie line|program bus|\bch\b/i.test(name) && name === raw.name) return;
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

  function wrongSelectionStatus(level, selection, items){
    const required = level.required || [];
    const wrong = [];
    items.forEach(item => {
      const qty = Number(selection[slugify(item.name)] || 0);
      if(!qty) return;
      const satisfiesRequired = required.some(req => {
        const group = req.need_group || req.satisfies || req.name;
        const direct = slugify(item.name) === slugify(req.name);
        const groupMatch = group && item.satisfies && item.satisfies === group && !/distractor|wrong/i.test(item.role || '');
        return direct || groupMatch;
      });
      if(!satisfiesRequired || /distractor|wrong/i.test(item.role || '')) wrong.push(item);
    });
    return { wrong, ok: wrong.length === 0 };
  }

  function ensureContainer(levelId){
    let existing = document.querySelector('.sf-build-room-v6r227[data-level-id="' + levelId + '"]');
    if(existing) return mountContainerInShell(existing);
    document.querySelectorAll('.sf-build-room-v6r227').forEach(el => el.remove());
    const root = document.createElement('section');
    root.className = 'sf-build-room-v6r227';
    root.dataset.levelId = levelId;
    const host = buildRoomShellHost();
    if(host){ host.insertBefore(root, host.firstElementChild || null); }
    else {
      const old = findOldBuildPanel();
      if(old && old.parentElement){ old.parentElement.insertBefore(root, old); }
      else {
        const main = document.querySelector('main, .app, .level, body') || document.body;
        main.appendChild(root);
      }
    }
    return mountContainerInShell(root);
  }

  function currentBuildRoomMount(){
    const levelId = currentLevelId();
    const scoped = [
      levelId ? '[data-sf-build-room-renderer-mount="true"][data-level-id="' + levelId + '"]' : '',
      levelId ? '[data-training-panel="build-room"][data-level-id="' + levelId + '"]' : '',
      '[data-sf-build-room-renderer-mount="true"]',
      '[data-training-panel="build-room"]'
    ].filter(Boolean);

    for(const sel of scoped){
      const found = Array.from(document.querySelectorAll(sel)).find(el => !el.closest('.sf-build-room-v6r227'));
      if(found) return found;
    }
    return null;
  }

  function buildRoomShellFor(el){
    return el && el.closest ? el.closest('.level-shell, .training-stage-shell') : null;
  }

  function buildRoomShellHost(){
    const mountedRoot = document.querySelector('.sf-build-room-v6r227[data-level-id="' + currentLevelId() + '"]');
    const rootShell = buildRoomShellFor(mountedRoot);
    if(rootShell) return rootShell;

    const mountShell = buildRoomShellFor(currentBuildRoomMount());
    if(mountShell) return mountShell;

    const levelId = currentLevelId();
    const shells = Array.from(document.querySelectorAll('.level-shell, .training-stage-shell'));
    if(levelId){
      const matchingShell = shells.find(shell => (shell.textContent || '').indexOf(levelId) !== -1);
      if(matchingShell) return matchingShell;
    }
    return shells[shells.length - 1] || null;
  }

  function mountContainerInShell(root){
    if(!root) return root;
    const host = buildRoomShellHost();
    if(host && root.parentElement !== host){
      host.insertBefore(root, host.firstElementChild || null);
    }
    return root;
  }

  function findOldBuildPanel(){
    const selectors = ['[data-training-panel="build-room"]','.build-room','.build-room-panel','.route-training-panel'];
    for(const sel of selectors){
      const found = Array.from(document.querySelectorAll(sel)).find(el => !el.classList.contains('sf-build-room-v6r227') && /Build|Room|Check Room|BUY ONLY/i.test(el.textContent || ''));
      if(found) return found;
    }
    return null;
  }


  function applyBuildRoomShellMode(root){
    try{
      document.body.classList.add('sf-build-room-v6r227-active');

      if(!root) return;

      const levelId = (typeof currentLevelId === 'function' ? currentLevelId() : '') || '';
      document.body.dataset.sfBrShellModeKey = 'build-room:' + levelId;

      if(root.parentElement){
        rememberStyle(root.parentElement, 'overflowX');
        rememberStyle(root.parentElement, 'overflowY');
        root.parentElement.style.overflowX = 'hidden';
        root.parentElement.style.overflowY = 'auto';
      }

      mountContainerInShell(root);

      const shell = buildRoomShellFor(root);
      if(shell){
        shell.classList.add('sf-br-shell-owned');
        rememberStyle(shell, 'gridTemplateColumns');
        rememberStyle(shell, 'gap');
        rememberStyle(shell, 'padding');
        rememberStyle(shell, 'minHeight');
        rememberStyle(shell, 'overflowY');
        rememberStyle(shell, 'overflowX');
        rememberStyle(shell, 'overscrollBehavior');
        rememberStyle(shell, 'webkitOverflowScrolling');
        shell.style.setProperty('grid-template-columns', 'minmax(0, 1fr)', 'important');
        shell.style.setProperty('gap', '0', 'important');
        shell.style.setProperty('padding', '10px', 'important');
        shell.style.setProperty('min-height', '0', 'important');
        shell.style.setProperty('overflow-y', 'auto', 'important');
        shell.style.setProperty('overflow-x', 'hidden', 'important');
        shell.style.setProperty('overscroll-behavior', 'contain', 'important');
        shell.style.setProperty('-webkit-overflow-scrolling', 'touch', 'important');


        Array.from(shell.children).forEach(child => {
          if(child === root) return;
          child.dataset.sfBrOldShellChild = 'true';
          rememberStyle(child, 'display');
          rememberStyle(child, 'visibility');
          rememberStyle(child, 'pointerEvents');
          child.style.setProperty('display', 'none', 'important');
          child.style.setProperty('visibility', 'hidden', 'important');
          child.style.setProperty('pointer-events', 'none', 'important');
        });
      }

      root.dataset.sfBrShellRoot = 'true';
      rememberStyle(root, 'gridColumn');
      rememberStyle(root, 'width');
      rememberStyle(root, 'maxWidth');
      rememberStyle(root, 'margin');
      rememberStyle(root, 'alignSelf');
      root.style.setProperty('grid-column', '1 / -1', 'important');
      root.style.setProperty('width', 'min(1500px, calc(100vw - 36px))', 'important');
      root.style.setProperty('max-width', 'none', 'important');
      root.style.setProperty('margin', '0 auto 28px', 'important');
      root.style.setProperty('align-self', 'start', 'important');

      hideFloatingLockerButtons();
    }catch(err){
      console.warn('[Signal Flow] Build-a-Room shell mode failed ' + VERSION, err);
    }
  }

  function hideFloatingLockerButtons(){
    Array.from(document.querySelectorAll('button, a, [role="button"]')).forEach(el => {
      if(el.closest('.sf-build-room-v6r227')) return;
      const label = String(el.textContent || el.getAttribute('aria-label') || '').trim();
      if(!/^(Equipment Locker|Mic Locker)$/i.test(label)) return;
      el.dataset.sfBrFloatingLocker = 'true';
      rememberStyle(el, 'display');
      rememberStyle(el, 'visibility');
      rememberStyle(el, 'pointerEvents');
      el.style.setProperty('display', 'none', 'important');
      el.style.setProperty('visibility', 'hidden', 'important');
      el.style.setProperty('pointer-events', 'none', 'important');
    });
  }

  function rememberStyle(el, prop){
    if(!el || !prop) return;
    const key = 'sfBrPrev' + prop.charAt(0).toUpperCase() + prop.slice(1);
    if(!(key in el.dataset)) el.dataset[key] = el.style[prop] || '';
  }

  function restoreStyle(el, prop){
    if(!el || !prop) return;
    const key = 'sfBrPrev' + prop.charAt(0).toUpperCase() + prop.slice(1);
    if(key in el.dataset){
      el.style[prop] = el.dataset[key] || '';
      delete el.dataset[key];
    }
  }

  function clearBuildRoomShellMode(removeClass = true){
    try{
      if(removeClass){
        document.body.classList.remove('sf-build-room-v6r227-active');
      }
      delete document.body.dataset.sfBrShellModeKey;

      document.querySelectorAll('.level-shell.sf-br-shell-owned, .training-stage-shell.sf-br-shell-owned').forEach(shell => {
        restoreStyle(shell, 'gridTemplateColumns');
        restoreStyle(shell, 'gap');
        restoreStyle(shell, 'padding');
        restoreStyle(shell, 'minHeight');
        restoreStyle(shell, 'overflowY');
        restoreStyle(shell, 'overflowX');
        restoreStyle(shell, 'overscrollBehavior');
        restoreStyle(shell, 'webkitOverflowScrolling');
        shell.classList.remove('sf-br-shell-owned');
      });

      document.querySelectorAll('[data-sf-br-prev-overflow-x], [data-sf-br-prev-overflow-y]').forEach(el => {
        restoreStyle(el, 'overflowX');
        restoreStyle(el, 'overflowY');
      });

      document.querySelectorAll('[data-sf-br-old-shell-child="true"]').forEach(el => {
        restoreStyle(el, 'display');
        restoreStyle(el, 'visibility');
        restoreStyle(el, 'pointerEvents');
        delete el.dataset.sfBrOldShellChild;
      });

      document.querySelectorAll('[data-sf-br-shell-root="true"]').forEach(el => {
        restoreStyle(el, 'gridColumn');
        restoreStyle(el, 'width');
        restoreStyle(el, 'maxWidth');
        restoreStyle(el, 'margin');
        restoreStyle(el, 'alignSelf');
        if(removeClass) el.remove();
        delete el.dataset.sfBrShellRoot;
      });

      document.querySelectorAll('[data-sf-br-floating-locker="true"]').forEach(el => {
        restoreStyle(el, 'display');
        restoreStyle(el, 'visibility');
        restoreStyle(el, 'pointerEvents');
        delete el.dataset.sfBrFloatingLocker;
      });
    }catch(_){}
  }

  function renderBuildRoom(){
    const levelId = currentLevelId();
    if(!isBuildRoomLevel(levelId)) { clearBuildRoomShellMode(); return; }
    const level = levelsById[levelId] || fallbackLevelFromCurrent();
    if(!level) return;

    document.body.classList.add('sf-build-room-v6r227-active');
    const root = ensureContainer(levelId);
    applyBuildRoomShellMode(root);
    const selection = getSelection(levelId);
    const items = consolidateStore(level);
    const totals = ledgerTotals();
    const money = selectedSpendAndOwned(selection, items);
    const reqStatus = requirementStatus(level, selection, items);
    const wrongStatus = wrongSelectionStatus(level, selection, items);
    const categories = ['All'].concat(Array.from(new Set(items.map(i => i.category || categoryFor(i.name)))));
    if(!categories.includes(activeCategory)) activeCategory = 'All';
    const visibleItems = activeCategory === 'All' ? items : items.filter(i => (i.category || categoryFor(i.name)) === activeCategory);

    if(!loggedActive.has(levelId)){
      console.log('[Signal Flow] Build-a-Room consolidated renderer active ' + VERSION, levelId);
      loggedActive.add(levelId);
    }

    root.innerHTML = `
      <div class="sf-br-top">
        <div class="sf-br-title-panel">
          <div class="sf-br-title-kicker">${escapeHtml(level.environment || '')} • BUILD A ROOM</div>
          <div class="sf-br-title">${escapeHtml(level.level_id)} • ${escapeHtml(level.scenario || 'Build the Room')}</div>
          <div class="sf-br-brief">${escapeHtml(level.brief || level.instruction || 'Choose the equipment needed for this job.')}</div>
        </div>
        <div class="sf-br-top-strip" aria-label="Build actions and credit summary">
          <button class="sf-br-btn sf-br-top-btn danger" type="button" data-sf-br-action="reset">Reset Build</button>
          <button class="sf-br-btn sf-br-top-btn" type="button" data-sf-br-action="check">Submit Build</button>
          <div class="sf-br-metric"><div class="sf-br-metric-label">Credits available</div><div class="sf-br-metric-value">${totals.availableCredits}</div></div>
          <div class="sf-br-metric"><div class="sf-br-metric-label">New spend</div><div class="sf-br-metric-value">${money.spend}</div></div>
          <div class="sf-br-metric"><div class="sf-br-metric-label">Owned applied</div><div class="sf-br-metric-value">${money.ownedApplied}</div></div>
        </div>
      </div>
      <div class="sf-br-body">
        <aside class="sf-br-left">
          <div class="sf-br-note"><h3>Job Brief</h3><p>${escapeHtml(level.instruction || 'Choose the equipment needed for this job.')}</p></div>
          <div class="sf-br-checklist">
            <div class="sf-br-section-title">Build Checklist</div>
            ${reqStatus.statuses.map(st => `
              <div class="sf-br-need ${st.ok ? 'is-satisfied' : ''}">
                <div class="sf-br-need-dot"></div>
                <div><div class="sf-br-need-name">${escapeHtml(st.req.need_group || st.req.name)}</div><div class="sf-br-need-detail">${st.have}/${st.needed} selected</div></div>
              </div>`).join('')}
          </div>
        </aside>
        <main class="sf-br-main">
          <div class="sf-br-store-head">
            <div class="sf-br-section-title">Equipment options</div>
            <div class="sf-br-tabs">${categories.map(cat => `<button class="sf-br-tab ${cat===activeCategory?'is-active':''}" data-sf-br-tab="${escapeAttr(cat)}">${escapeHtml(cat)}</button>`).join('')}</div>
          </div>
          <div class="sf-br-store-grid">
            ${visibleItems.map(item => renderCard(item, selection)).join('')}
          </div>
        </main>
      </div>
      <div class="sf-br-bottom">
        <div class="sf-br-summary">
          <span><strong>${money.selectedCount}</strong> selected</span>
          <span><strong>${money.spend}</strong> new credits</span>
          <span><strong>${Math.max(0, totals.availableCredits - money.spend)}</strong> remaining</span>
          <span><strong>${reqStatus.ok && wrongStatus.ok ? 'Ready to submit' : 'Needs gear'}</strong></span>
        </div>
      </div>`;

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
    const art = image ? `<img alt="" src="${escapeAttr(image)}" loading="lazy" onerror="this.remove();this.parentElement.classList.add('no-image')">` : `<div class="sf-br-art-fallback">${iconFor(item.name)}</div>`;
    return `<article class="sf-br-card ${qty?'is-selected':''}" data-sf-br-item="${escapeAttr(slug)}" data-name="${escapeAttr(item.name)}">
      <div class="sf-br-art">${art}</div>
      <div class="sf-br-card-body">
        <div class="sf-br-card-name">${escapeHtml(item.name)}</div>
        <div class="sf-br-card-category">${escapeHtml(item.category || categoryFor(item.name))}</div>
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
    root.querySelectorAll('[data-sf-br-tab]').forEach(btn => btn.addEventListener('click', ev => {
      ev.preventDefault();
      activeCategory = btn.dataset.sfBrTab || 'All';
      renderBuildRoom();
    }));
    root.querySelectorAll('[data-sf-br-step]').forEach(btn => btn.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const card = btn.closest('[data-sf-br-item]');
      if(!card) return;
      adjustSelection(level.level_id, card.dataset.sfBrItem, Number(btn.dataset.sfBrStep || 0));
    }));
    root.querySelectorAll('[data-sf-br-item]').forEach(card => {
      card.addEventListener('click', ev => {
        if(ev.target.closest('[data-sf-br-step], button, a, input, select, textarea')) return;
        adjustSelection(level.level_id, card.dataset.sfBrItem, 1);
      });
    });
    root.querySelectorAll('[data-sf-br-action]').forEach(btn => btn.addEventListener('click', ev => {
      ev.preventDefault();
      const action = btn.dataset.sfBrAction;
      if(action === 'open-locker') openLockerModal();
      if(action === 'reset') { closeAllBuildModals(); clearSelection(level.level_id); renderBuildRoom(); }
      if(action === 'check') checkRoom(level, items);
    }));
  }

  function adjustSelection(levelId, slug, delta){
    if(!slug || !delta) return;
    const selection = getSelection(levelId);
    selection[slug] = Math.max(0, Number(selection[slug] || 0) + delta);
    if(selection[slug] <= 0) delete selection[slug];
    setSelection(levelId, selection);
    renderBuildRoom();
  }

  function checkRoom(level, items){
    const selection = getSelection(level.level_id);
    const totals = ledgerTotals();
    const money = selectedSpendAndOwned(selection, items);
    const reqStatus = requirementStatus(level, selection, items);
    const wrongStatus = wrongSelectionStatus(level, selection, items);
    if(!reqStatus.ok){
      showModal('Room Needs Revision', `<p>Required needs are not satisfied yet.</p><ul>${reqStatus.missing.map(m => `<li>${escapeHtml(m.need_group || m.name)}: ${escapeHtml(m.name)} ×${Number(m.qty||1)}</li>`).join('')}</ul>`, [
        {label:'Retry Build', cls:'secondary', action:() => { closeAllBuildModals(); clearSelection(level.level_id); renderBuildRoom(); }},
        {label:'Keep Building', action:closeAllBuildModals}
      ]);
      try{ if(typeof playSfx === 'function') playSfx('wrongAnswer'); }catch(_){ }
      return;
    }
    if(!wrongStatus.ok){
      showModal('Room Needs Revision', `<p>Remove gear that does not belong in this tier of the room build.</p><ul>${wrongStatus.wrong.map(item => `<li>${escapeHtml(item.name)}</li>`).join('')}</ul>`, [
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
  function closeAllBuildModals(){ document.querySelectorAll('.sf-br-modal-backdrop, .sf-build-room-modal, .sf-equipment-locker-modal').forEach(el => el.remove()); }

  function openLockerModal(){
    const locker = loadLocker();
    const items = Object.values(locker.items || {}).sort((a,b) => String(a.name).localeCompare(String(b.name)));
    const body = items.length ? `<div class="sf-br-locker-grid">${items.map(it => `<div class="sf-br-locker-item"><strong>${escapeHtml(it.name)}</strong><span>Qty ${Number(it.qty||0)} • ${escapeHtml(it.category || categoryFor(it.name))}</span><br><span>First acquired: ${escapeHtml(it.firstAcquiredLevel || '—')}</span></div>`).join('')}</div>` : '<p>No owned equipment yet. Approved Build-a-Room purchases will appear here.</p>';
    showModal('Equipment Locker', body, [{label:'Close', action:closeAllBuildModals}]);
  }

  function installSplashLocker(){
    // Build-a-Room locked layout:
    // do not inject or clone floating Equipment Locker / Mic Locker buttons.
    return;
    // Remove old floating fallback buttons from previous patches.
    Array.from(document.querySelectorAll('button, a, [role="button"]')).forEach(el => {
      const text = String(el.textContent || el.getAttribute('aria-label') || '').trim();
      if(/Equipment Locker/i.test(text) && !/micLockerBtn/i.test(el.id || '') && el.dataset.sfBrLockerOwner !== VERSION){
        const r = el.getBoundingClientRect && el.getBoundingClientRect();
        if(!r || r.bottom > window.innerHeight * .55 || /fixed|absolute/i.test(getComputedStyle(el).position || '')) el.remove();
      }
    });
    let btn = document.getElementById('micLockerBtn') || Array.from(document.querySelectorAll('button, a, [role="button"]')).find(el => /Mic Locker/i.test(el.textContent || el.getAttribute('aria-label') || ''));
    if(btn){
      const clone = btn.cloneNode(true);
      clone.id = 'micLockerBtn';
      clone.textContent = 'Equipment Locker';
      clone.setAttribute('aria-label', 'Equipment Locker');
      clone.removeAttribute('aria-hidden');
      clone.classList.add('sf-build-room-equipment-locker-entry');
      clone.dataset.sfBrLockerOwner = VERSION;
      clone.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); openLockerModal(); });
      btn.replaceWith(clone);
      return;
    }
    // Fallback: add exactly one entry near splash action area, not bottom-right.
    if(document.querySelector('[data-sf-br-locker-owner="' + VERSION + '"]')) return;
    const host = Array.from(document.querySelectorAll('main, .splash, .clean-splash, body')).find(el => /Play|Start|Signal Flow/i.test(el.textContent || '')) || document.body;
    const fallback = document.createElement('button');
    fallback.type = 'button'; fallback.className = 'clean-splash-btn clean-locker-btn sf-build-room-equipment-locker-entry'; fallback.textContent = 'Equipment Locker'; fallback.dataset.sfBrLockerOwner = VERSION;
    fallback.addEventListener('click', openLockerModal);
    host.appendChild(fallback);
  }

  function escapeHtml(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function escapeAttr(s){ return escapeHtml(s).replace(/`/g, '&#96;'); }

  function scheduleRender(){
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderBuildRoom, 80);
  }

  function wrapLifecycleFunction(name){
    const fn = window[name];
    if(typeof fn !== 'function' || fn.__sfBuildRoomRendererWrapped) return;
    const wrapped = function(...args){
      const result = fn.apply(this, args);
      scheduleRender();
      setTimeout(renderBuildRoom, 0);
      setTimeout(renderBuildRoom, 180);
      return result;
    };
    wrapped.__sfBuildRoomRendererWrapped = true;
    window[name] = wrapped;
  }

  function installLifecycleHooks(){
    if(lifecycleHooksInstalled) return;
    lifecycleHooksInstalled = true;

    [
      'startLevelById',
      'renderRoute',
      'navigateTo',
      'loadGameLevel',
      'loadLevel',
      'renderLevel',
      'render',
      'loadBoardById',
      'goToLevel'
    ].forEach(wrapLifecycleFunction);

    document.addEventListener('change', event => {
      const target = event.target;
      if(target && target.matches && target.matches('select, #levelJump, #boardSelect, #boardPicker')) {
        scheduleRender();
        setTimeout(renderBuildRoom, 0);
        setTimeout(renderBuildRoom, 180);
      }
    }, true);
  }

  function boot(){
    Promise.all([loadJson(MANIFEST_URL), loadJson(ASSET_MAP_URL)]).then(([m,a]) => {
      manifest = m; assetMap = a; prepareData();
      console.log('[Signal Flow] Build-a-Room consolidated renderer installed ' + VERSION);
      installSplashLocker();
      installLifecycleHooks();
      renderBuildRoom();
      setInterval(rescanBuildRoomShellOnly, 500);
      window.addEventListener('hashchange', scheduleRender);
      window.addEventListener('popstate', scheduleRender);
    }).catch(err => {
      console.warn('[Signal Flow] Build-a-Room manifest unavailable; using embedded level fallback when possible:', err);
      installSplashLocker();
      installLifecycleHooks();
      renderBuildRoom();
      setInterval(rescanBuildRoomShellOnly, 500);
      window.addEventListener('hashchange', scheduleRender);
      window.addEventListener('popstate', scheduleRender);
    });
  }

  function rescanBuildRoomShellOnly(){
    const levelId = currentLevelId();
    if(!isBuildRoomLevel(levelId)) {
      clearBuildRoomShellMode();
      return;
    }
    const root = document.querySelector('.sf-build-room-v6r227[data-level-id="' + levelId + '"]');
    if(!root || !root.isConnected || !root.querySelector('.sf-br-body')){
      renderBuildRoom();
      return;
    }
    mountContainerInShell(root);
    applyBuildRoomShellMode(root);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
