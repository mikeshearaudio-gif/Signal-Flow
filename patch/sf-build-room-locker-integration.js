/* Signal Flow Build-a-Room Locker Integration v6r216
 * Fixes ownership persistence and Build-a-Room cost rules.
 * This script intentionally installs in <head> so its Check Room capture handler
 * runs before older inline Build-a-Room handlers that may block propagation.
 */
(function(){
  'use strict';
  if(window.sfBuildRoomLockerIntegrationV6r216Installed) return;
  window.sfBuildRoomLockerIntegrationV6r216Installed = true;

  const VERSION = '6r216';
  const LOCKER_KEY = 'signal-flow-equipment-locker-v1';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
  function safeJson(raw, fallback){ try { return raw ? JSON.parse(raw) : fallback; } catch(_) { return fallback; } }
  function readStore(key, fallback){ try { return safeJson(localStorage.getItem(key), fallback); } catch(_) { return fallback; } }
  function writeStore(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); } catch(_) {} }
  function currentLevel(){ try { return typeof level === 'function' ? level() : null; } catch(_) { return null; } }
  function currentLevelId(){ const l = currentLevel(); return l && l.id ? String(l.id) : 'build-room'; }
  function currentLevelMode(){ const l = currentLevel(); return l && l.training && l.training.type ? String(l.training.type) : ''; }
  function play(name){ try { if(typeof playSfx === 'function') playSfx(name); } catch(_) {} }

  function ledgerTotals(){
    try { if(typeof sfCompletionLedgerTotals === 'function') return sfCompletionLedgerTotals(); } catch(_) {}
    try {
      const s = typeof sfLedgerState === 'function' ? sfLedgerState() : (window.sfSignalFlowLedgerState || {});
      const totalCredits = Number(s.totalCredits || 0);
      const spentCredits = Number(s.spentCredits || 0);
      const availableCredits = Number(s.availableCredits != null ? s.availableCredits : Math.max(0, totalCredits - spentCredits));
      return { totalScore:Number(s.totalScore || 0), totalCredits, spentCredits, availableCredits };
    } catch(_) { return { totalScore:0, totalCredits:0, spentCredits:0, availableCredits:0 }; }
  }
  function availableCredits(){
    try { if(typeof sfBuildRoomAvailableCredits === 'function') return Number(sfBuildRoomAvailableCredits() || 0); } catch(_) {}
    return Number(ledgerTotals().availableCredits || 0);
  }
  function dispatchLedger(event){ try { if(typeof sfLedgerDispatch === 'function') return sfLedgerDispatch(event); } catch(err) { console.warn('[Signal Flow] Build-room locker ledger dispatch failed:', err); } return null; }
  function awardOnce(groupId, score=100, credits=0){ try { if(typeof sfAwardLedgerScoreOnce === 'function') return sfAwardLedgerScoreOnce(groupId, score, credits); } catch(err) { console.warn('[Signal Flow] Build-room locker award failed:', err); } return null; }

  function readLocker(){
    const locker = readStore(LOCKER_KEY, { items:{}, history:[] });
    locker.items = locker.items || {};
    locker.history = Array.isArray(locker.history) ? locker.history : [];
    return locker;
  }
  function writeLocker(locker){ writeStore(LOCKER_KEY, locker); }

  function normalizeKey(s){
    return String(s || 'gear')
      .toLowerCase()
      .replace(/owned\s*x\d+/gi, '')
      .replace(/locker\s*x\d+/gi, '')
      .replace(/new\s+\d+\s*credits/gi, '')
      .replace(/\d+\s*credits/gi, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'gear';
  }
  function gearKey(btn){
    return normalizeKey(btn?.dataset?.gearKey || btn?.dataset?.key || btn?.getAttribute('data-item-key') || labelFromButton(btn));
  }
  function labelFromButton(btn){
    const raw = btn && (
      btn.querySelector('.room-gear-label')?.textContent ||
      btn.querySelector('[data-gear-label]')?.textContent ||
      btn.getAttribute('aria-label') ||
      btn.textContent ||
      ''
    );
    return String(raw || '')
      .replace(/\bLOCKER\b/gi, '')
      .replace(/Owned\s*x\d+/gi, '')
      .replace(/new\s+\d+\s*credits/gi, '')
      .replace(/\d+\s*credits/gi, '')
      .replace(/×\d+/g, '')
      .replace(/\s+/g, ' ')
      .trim() || gearKey(btn);
  }
  function categoryForLabel(label, key){
    const text = String([label, key].join(' ')).toLowerCase();
    if(/mic|sm57|sm58|condenser|dynamic|lav|shotgun/.test(text)) return 'mics';
    if(/interface|converter|adac|a\/d|d\/a/.test(text)) return 'interfaces';
    if(/compress|preamp|eq|reverb|delay|processor|rack|outboard/.test(text)) return 'processors';
    if(/cable|xlr|adapter|di|direct/.test(text)) return 'cables';
    if(/speaker|monitor|wedge|pa|line array/.test(text)) return 'speakers';
    if(/console|mixer|mixing/.test(text)) return 'consoles';
    return 'equipment';
  }
  function baseCost(btn){ return Number(btn?.dataset?.cost || btn?.getAttribute('data-cost') || 0); }
  function ownedQty(key){
    const locker = readLocker();
    return Number(locker.items && locker.items[key] && locker.items[key].qty || 0);
  }
  function selectedButtons(panel){ return Array.from(panel.querySelectorAll('.room-gear.selected')); }
  function allGearButtons(panel){ return Array.from(panel.querySelectorAll('.room-gear')); }
  function requiredButtons(panel){ return allGearButtons(panel).filter(btn => String(btn.dataset.needed) === 'true'); }

  function addOwnedGear(items, levelId){
    if(!items.length) return;
    const locker = readLocker();
    items.forEach(item => {
      const key = item.key;
      if(!key) return;
      if(!locker.items[key]){
        locker.items[key] = {
          key,
          label: item.label || key,
          qty: 0,
          category: item.category || categoryForLabel(item.label, key),
          firstLevel: levelId || '',
          firstAcquiredAt: new Date().toISOString()
        };
      }
      locker.items[key].label = locker.items[key].label || item.label || key;
      locker.items[key].category = locker.items[key].category || item.category || categoryForLabel(item.label, key);
      locker.items[key].qty = Number(locker.items[key].qty || 0) + Number(item.qty || 1);
      locker.items[key].lastLevel = levelId || locker.items[key].lastLevel || '';
      locker.items[key].lastAcquiredAt = new Date().toISOString();
    });
    locker.history.push({ levelId, at:new Date().toISOString(), items });
    writeLocker(locker);
    try { window.dispatchEvent(new CustomEvent('sf-equipment-locker-updated', { detail:{ levelId, items } })); } catch(_) {}
    try { window.dispatchEvent(new StorageEvent('storage', { key: LOCKER_KEY })); } catch(_) {}
  }

  function selectedCounts(panel){
    const counts = {};
    selectedButtons(panel).forEach(btn => { const k = gearKey(btn); counts[k] = (counts[k] || 0) + 1; });
    return counts;
  }
  function requiredCounts(panel){
    const counts = {};
    requiredButtons(panel).forEach(btn => { const k = gearKey(btn); counts[k] = (counts[k] || 0) + 1; });
    return counts;
  }
  function gearSample(panel, key){ return allGearButtons(panel).find(btn => gearKey(btn) === key); }

  function newPurchases(panel){
    const seenSelected = {};
    const purchases = [];
    selectedButtons(panel).forEach(btn => {
      const key = gearKey(btn);
      const usedBefore = seenSelected[key] || 0;
      seenSelected[key] = usedBefore + 1;
      if(usedBefore < ownedQty(key)) return;
      purchases.push({
        key,
        label: labelFromButton(btn),
        cost: baseCost(btn),
        qty: 1,
        category: categoryForLabel(labelFromButton(btn), key)
      });
    });
    return purchases;
  }

  function buildRoomState(panel){
    const selected = selectedButtons(panel);
    const required = requiredButtons(panel);
    const reqCounts = requiredCounts(panel);
    const selCounts = selectedCounts(panel);
    const missing = [];
    Object.keys(reqCounts).forEach(key => {
      const have = ownedQty(key) + (selCounts[key] || 0);
      const need = reqCounts[key];
      if(have < need){
        const sample = gearSample(panel, key);
        missing.push({ key, label: labelFromButton(sample), need, have, short: need - have });
      }
    });
    const purchases = newPurchases(panel);
    const newCost = purchases.reduce((sum, item) => sum + Number(item.cost || 0), 0);
    const credits = availableCredits();
    return { selected, required, missing, purchases, newCost, credits, overBy: Math.max(0, newCost - credits), totalSelected:selected.length };
  }

  function suggestedReplayBoards(current){
    let levels = [];
    try {
      const env = current && current.environment;
      levels = (window.DATA && DATA.levels || [])
        .filter(l => l && (!env || l.environment === env) && l.id !== current.id && !(l.training && l.training.type === 'build-room'))
        .slice(0, 80);
    } catch(_) {}
    const before = levels.filter(l => String(l.id) < String(current.id || '')).slice(-4);
    const picks = before.length ? before : levels.slice(0,4);
    return picks.map(l => `<li>${esc(l.id)} — ${esc(l.title || 'Earlier board')}</li>`).join('') || '<li>Replay earlier completed boards to improve credits.</li>';
  }

  function ensureMessage(panel){
    let out = panel.querySelector('[data-build-room-message], #levelTrainingResult, .training-result');
    const check = panel.querySelector('#checkLevelTraining, .sfv166-check-room');
    if(!out){
      out = document.createElement('div');
      out.setAttribute('data-build-room-message', 'true');
      out.className = 'training-result sf-build-room-message';
      if(check) check.insertAdjacentElement('afterend', out);
      else panel.appendChild(out);
    }
    return out;
  }
  function showPanelMessage(panel, kind, message){
    const out = ensureMessage(panel);
    out.className = `training-result sf-build-room-message show ${kind || ''}`;
    out.textContent = message || '';
    out.style.display = 'block';
    out.style.visibility = 'visible';
    out.style.opacity = '1';
    out.scrollIntoView({ block:'nearest', behavior:'smooth' });
    try { console.log('[Signal Flow] Build-a-Room locker integration:', kind, message); } catch(_) {}
  }

  function modal({kicker, title, body, blocks=[], actions=[]}){
    document.querySelectorAll('.sf-build-room-v216-modal').forEach(el => el.remove());
    const el = document.createElement('div');
    el.className = 'sf-build-room-v216-modal';
    el.innerHTML = `<article class="sf-build-room-v216-card" role="dialog" aria-modal="true">
      <div class="sf-build-room-v216-kicker">${esc(kicker || 'Build-a-Room')}</div>
      <h2>${esc(title || '')}</h2>
      ${body ? `<p>${body}</p>` : ''}
      ${blocks.join('')}
      <div class="sf-build-room-v216-actions">${actions.map((a,i) => `<button type="button" class="${a.secondary ? 'secondary' : ''}" data-action="${i}">${esc(a.label)}</button>`).join('')}</div>
    </article>`;
    document.body.appendChild(el);
    actions.forEach((a,i) => {
      const btn = el.querySelector(`[data-action="${i}"]`);
      if(btn) btn.addEventListener('click', ev => { ev.preventDefault(); a.run && a.run(el); }, true);
    });
    return el;
  }

  function openLocker(){
    try { if(typeof window.sfOpenEquipmentLocker === 'function') return window.sfOpenEquipmentLocker(); } catch(_) {}
    try { document.getElementById('sf-equipment-locker-open')?.click(); } catch(_) {}
  }

  function approveBuildRoom(panel, check){
    refreshBuildRoomPanel(panel);
    const s = buildRoomState(panel);
    const l = currentLevel() || { id:'build-room', environment:'' };

    if(s.missing.length){
      showPanelMessage(panel, 'bad', 'Missing required equipment: ' + s.missing.map(x => `${x.label} (${x.short} more)`).join(', ') + '. Owned locker gear counts automatically.');
      play('wrongAnswer');
      return;
    }
    if(s.overBy > 0){
      showPanelMessage(panel, 'bad', `Not enough credits. Need ${s.overBy} more credits for new purchases. Owned locker gear is free to reuse.`);
      modal({
        kicker:'Insufficient Credits',
        title:'Replay Earlier Boards to Earn Budget',
        body:`You need ${s.overBy} more credits before this room can be approved. Owned locker gear costs 0; only new purchases spend credits.`,
        blocks:[`<div class="sf-build-room-v216-list"><h3>Suggested boards to replay</h3><ul>${suggestedReplayBoards(l)}</ul></div>`],
        actions:[
          { label:'Open Equipment Locker', secondary:true, run: () => openLocker() },
          { label:'Close', run: el => el.remove() }
        ]
      });
      play('wrongAnswer');
      return;
    }

    try {
      if(s.newCost > 0){
        dispatchLedger({ type:'REWARD_SPENT', levelId:l.id, itemId:'build-room-purchase-' + l.id + '-' + Date.now(), cost:s.newCost });
      }
      addOwnedGear(s.purchases, l.id);
      const underBudget = Math.max(0, s.credits - s.newCost);
      const buildScore = 100 + Math.min(25, underBudget);
      awardOnce('build-room-' + l.id, buildScore, 0);
      panel.dataset.submitted = 'true';
      if(check) check.disabled = true;
      showPanelMessage(panel, 'good', `Room approved. New purchases: ${s.newCost} credits. Added ${s.purchases.length} item(s) to Equipment Locker. Score +${buildScore}.`);
      play('rightAnswer');
      refreshBuildRoomPanel(panel);

      const routeTraining = panel.dataset.routeTraining === 'true';
      const isTrainingOnly = panel.dataset.trainingOnly === 'true';
      if(routeTraining){
        const next = document.querySelector('#routeTrainingNextBtn');
        if(next) next.disabled = false;
        return;
      }
      if(isTrainingOnly && typeof completeLevel === 'function'){
        setTimeout(() => completeLevel(), 650);
      }
    } catch(err){
      showPanelMessage(panel, 'bad', err && err.message ? err.message : 'Could not complete this room build.');
      play('wrongAnswer');
    }
  }

  function refreshBuildRoomPanel(panel){
    if(!panel || !(panel.matches('[data-training-panel="build-room"], .sf-reward-build-room') || panel.querySelector('.room-gear'))) return;
    const s = buildRoomState(panel);
    panel.classList.add('sf-build-room-locker-v216');
    panel.dataset.sfBuildRoomLockerV216 = '1';

    const selectedSeen = {};
    allGearButtons(panel).forEach(btn => {
      const key = gearKey(btn);
      const label = labelFromButton(btn);
      const qty = ownedQty(key);
      const selected = btn.classList.contains('selected');
      const cost = baseCost(btn);
      btn.classList.toggle('sf-owned-gear', qty > 0);
      btn.dataset.ownedQty = String(qty);
      btn.dataset.gearKey = key;
      btn.title = qty > 0 ? `${label}: owned x${qty}; reusable for $0` : `${label}: ${cost} credits if purchased`;

      let badge = btn.querySelector('.sf-v216-locker-badge');
      if(!badge){
        badge = document.createElement('span');
        badge.className = 'sf-v216-locker-badge';
        btn.appendChild(badge);
      }
      badge.textContent = qty > 0 ? `LOCKER ×${qty}` : (String(btn.dataset.needed) === 'true' ? 'REQUIRED' : 'OPTIONAL');

      const costEl = btn.querySelector('.room-gear-cost');
      if(costEl){
        if(qty > 0) costEl.textContent = `Owned ×${qty} · $0 reuse`;
        else costEl.textContent = `${cost} credits`;
      }
      const labelEl = btn.querySelector('.room-gear-label');
      if(labelEl && !labelEl.dataset.sfV216Cleaned){
        labelEl.textContent = label;
        labelEl.dataset.sfV216Cleaned = '1';
      }

      if(selected){ selectedSeen[key] = (selectedSeen[key] || 0) + 1; }
    });

    const meter = panel.querySelector('[data-build-room-budget-meter]');
    if(meter){
      meter.textContent = `Credits: ${s.credits} · New purchases: ${s.newCost} · Locker reuse: $0`;
      meter.classList.toggle('bad', s.newCost > s.credits);
    }

    let summary = panel.querySelector('.sf-v216-build-summary');
    const header = panel.querySelector('.sfv166-shop-header, .sfv164-retail-shelf, .inline-room-build');
    if(!summary){
      summary = document.createElement('div');
      summary.className = 'sf-v216-build-summary';
      if(header && header.parentElement) header.insertAdjacentElement('afterend', summary);
      else panel.prepend(summary);
    }
    const ownedAuto = s.required.filter(btn => ownedQty(gearKey(btn)) > 0).length;
    summary.innerHTML = `<span><b>${s.required.length}</b> required need${s.required.length === 1 ? '' : 's'}</span><span><b>${ownedAuto}</b> already in locker</span><span><b>${s.purchases.length}</b> new purchase${s.purchases.length === 1 ? '' : 's'}</span><span><b>${s.newCost}</b> credits to spend</span>`;
  }

  function refreshAllBuildRooms(){
    document.querySelectorAll('[data-training-panel="build-room"], .sf-reward-build-room').forEach(refreshBuildRoomPanel);
  }

  function installCheckCapture(){
    document.addEventListener('click', function(event){
      const target = event.target && event.target.closest ? event.target : null;
      if(!target) return;
      const check = target.closest('#checkLevelTraining, .sfv166-check-room');
      if(!check) return;
      const panel = check.closest('[data-training-panel="build-room"], .sf-reward-build-room');
      if(!panel) return;
      event.preventDefault();
      event.stopPropagation();
      if(event.stopImmediatePropagation) event.stopImmediatePropagation();
      approveBuildRoom(panel, check);
    }, true);

    document.addEventListener('click', function(event){
      const btn = event.target && event.target.closest ? event.target.closest('[data-training-panel="build-room"] .room-gear, .sf-reward-build-room .room-gear') : null;
      if(!btn) return;
      setTimeout(() => refreshBuildRoomPanel(btn.closest('[data-training-panel="build-room"], .sf-reward-build-room')), 0);
      setTimeout(() => refreshBuildRoomPanel(btn.closest('[data-training-panel="build-room"], .sf-reward-build-room')), 80);
    }, true);
  }

  function init(){
    installCheckCapture();
    refreshAllBuildRooms();
    const obs = new MutationObserver(() => { clearTimeout(window.sfV216BuildRoomRefreshTimer); window.sfV216BuildRoomRefreshTimer = setTimeout(refreshAllBuildRooms, 80); });
    obs.observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['class', 'data-training-panel'] });
    window.addEventListener('sf-equipment-locker-updated', () => setTimeout(refreshAllBuildRooms, 60));
    window.addEventListener('storage', ev => { if(!ev || ev.key === LOCKER_KEY) setTimeout(refreshAllBuildRooms, 60); });
    console.log('[Signal Flow] Build-a-Room locker integration active', VERSION);
  }

  // Install capture listener immediately in head, before older inline handlers register.
  installCheckCapture();
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
