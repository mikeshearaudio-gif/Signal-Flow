/* Signal Flow Economy + Timeout Rules v6r224
 * Adds board-type timeout handling, Build-a-Room equipment locker ownership,
 * replay/best-run bookkeeping, and locker UI without changing quiz handling.
 */
(function(){
  'use strict';
  if(window.sfEconomyRulesV6r224Installed) return;
  window.sfEconomyRulesV6r224Installed = true;

  const VERSION = '6r224';
  const LOCKER_KEY = 'signal-flow-equipment-locker-v1';
  const BEST_KEY = 'signal-flow-best-runs-v1';
  const HINT_KEY = 'signal-flow-hint-usage-v1';

  function safeJson(raw, fallback){ try { return raw ? JSON.parse(raw) : fallback; } catch(_) { return fallback; } }
  function readStore(key, fallback){ try { return safeJson(localStorage.getItem(key), fallback); } catch(_) { return fallback; } }
  function writeStore(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); } catch(_) {} }
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }
  function currentLevel(){ try { return typeof level === 'function' ? level() : null; } catch(_) { return null; } }
  function currentLevelId(){ const l = currentLevel(); return l && l.id ? String(l.id) : ''; }
  function modeFor(l=currentLevel()){ return l && l.training && l.training.type ? String(l.training.type) : ''; }
  function ledgerTotals(){
    try { if(typeof sfCompletionLedgerTotals === 'function') return sfCompletionLedgerTotals(); } catch(_) {}
    try {
      const s = typeof sfLedgerState === 'function' ? sfLedgerState() : (window.sfSignalFlowLedgerState || {});
      return {
        totalScore: Number(s.totalScore || 0),
        totalCredits: Number(s.totalCredits || 0),
        spentCredits: Number(s.spentCredits || 0),
        availableCredits: Number(s.availableCredits != null ? s.availableCredits : Math.max(0, Number(s.totalCredits || 0) - Number(s.spentCredits || 0)))
      };
    } catch(_) { return { totalScore: 0, totalCredits: 0, spentCredits: 0, availableCredits: 0 }; }
  }
  function availableCredits(){
    try { if(typeof sfBuildRoomAvailableCredits === 'function') return Number(sfBuildRoomAvailableCredits() || 0); } catch(_) {}
    return Number(ledgerTotals().availableCredits || 0);
  }
  function dispatchLedger(event){ try { if(typeof sfLedgerDispatch === 'function') return sfLedgerDispatch(event); } catch(err) { console.warn('[Signal Flow] Economy ledger dispatch failed:', err); } return null; }
  function awardOnce(groupId, score=100, credits=0){ try { if(typeof sfAwardLedgerScoreOnce === 'function') return sfAwardLedgerScoreOnce(groupId, score, credits); } catch(err) { console.warn('[Signal Flow] Economy award failed:', err); } return null; }
  function play(name){ try { if(typeof playSfx === 'function') playSfx(name); } catch(_) {} }
  function clearGameTimer(){ try { if(typeof clearTimer === 'function') clearTimer(); } catch(_) {} }
  function stopGameMusic(){ try { if(typeof stopMusic === 'function') stopMusic(); } catch(_) {} }
  function updateGameTimer(){ try { if(typeof updateTimer === 'function') updateTimer(); } catch(_) {} }
  function clearBlockingModals(){
    try { document.querySelectorAll('.sf-economy-modal, .sf-br2-modal').forEach(x => x.remove()); } catch(_) {}
  }
  function setStatus(kind, msg){ try { if(typeof status === 'function') status(kind, msg); } catch(_) {} }
  function retryCurrent(){
    clearBlockingModals();
    const id = currentLevelId();
    try {
      if(window.state){
        state.gameOver = false;
        state.paused = false;
        if(Number(state.timeLeft || 0) <= 0) state.timeLeft = Number(state.baseTime || state.timer || 60) || 60;
      }
    } catch(_) {}
    try { document.querySelectorAll('.jack, #undoBtn, #clearBtn, #hintBtn, #inspectBtn, #checkLevelTraining').forEach(el => { el.disabled = false; }); } catch(_) {}
    try {
      if(typeof navigateTo === 'function' && id){
        navigateTo('/level/' + encodeURIComponent(id));
        setTimeout(clearBlockingModals, 25);
        setTimeout(clearBlockingModals, 250);
        return;
      }
    } catch(_) {}
    try { if(typeof renderLevel === 'function') renderLevel(); } catch(_) { location.reload(); }
    setTimeout(clearBlockingModals, 25);
    setTimeout(clearBlockingModals, 250);
  }

  function routeListMarkup(l){
    const routes = (l && l.required || []).map((pair, i) => {
      const from = Array.isArray(pair) ? pair[0] : '';
      const to = Array.isArray(pair) ? pair[1] : '';
      return `<li class="sf-review-path-card"><b>${i+1}</b><span>${esc(from)} → ${esc(to)}</span></li>`;
    }).join('');
    return routes || '<li>No route list available for this board.</li>';
  }

  function modal({ kicker, title, body, blocks=[], actions=[] }){
    document.querySelectorAll('.sf-economy-modal').forEach(x => x.remove());
    const el = document.createElement('div');
    el.className = 'sf-economy-modal';
    el.innerHTML = `<article class="sf-economy-card">
      <div class="sf-economy-kicker">${esc(kicker || 'Signal Flow')}</div>
      <h2>${esc(title || '')}</h2>
      ${body ? `<p>${body}</p>` : ''}
      ${blocks.join('')}
      <div class="sf-economy-actions">${actions.map((a, i) => `<button type="button" class="${a.secondary ? 'secondary' : ''}" data-sf-action="${i}">${esc(a.label)}</button>`).join('')}</div>
    </article>`;
    document.body.appendChild(el);
    actions.forEach((a, i) => {
      const btn = el.querySelector(`[data-sf-action="${i}"]`);
      if(btn) btn.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); a.run && a.run(el); });
    });
    return el;
  }

  function freezeForTimeout(){
    try { if(window.state) { state.gameOver = true; state.paused = false; state.timeLeft = 0; } } catch(_) {}
    clearGameTimer();
    updateGameTimer();
    stopGameMusic();
    try { document.body.classList.remove('paused'); } catch(_) {}
    try { document.querySelectorAll('.jack, #undoBtn, #clearBtn, #hintBtn, #inspectBtn, #checkLevelTraining').forEach(el => { el.disabled = true; }); } catch(_) {}
  }

  function reviewSignalPathModal(l){
    modal({
      kicker: 'Review Signal Path',
      title: 'Intended Route List',
      body: 'Use this review as a teaching view, then retry the board. Review mode does not complete the level or award credits.',
      blocks: [`<div class="sf-economy-list"><h3>Correct signal path</h3><ul>${routeListMarkup(l)}</ul></div>`],
      actions: [
        { label: 'Retry Board', run: el => { if(el) el.remove(); retryCurrent(); } },
        { label: 'Close Review', secondary: true, run: el => el.remove() }
      ]
    });
  }

  function patchTimeout(l){
    freezeForTimeout();
    setStatus('bad', 'Signal lost. Review the intended path, then retry this board.');
    play('wrong');
    modal({
      kicker: 'Time’s Up',
      title: 'Signal Path Lost',
      body: 'The board timed out before the required routes were completed. There is no overtime on patch boards.',
      blocks: [`<div class="sf-economy-list"><h3>Available actions</h3><ul><li>Review Signal Path opens a non-scoring teaching view.</li><li>Retry Board restarts this level.</li></ul></div>`],
      actions: [
        { label: 'Review Signal Path', run: () => reviewSignalPathModal(l) },
        { label: 'Retry Board', run: retryCurrent }
      ]
    });
  }

  function brokenDiagnosisPatch(l){
    const patches = l && l.training && Array.isArray(l.training.patches) ? l.training.patches : [];
    return patches.find(p => p && p.ok === false) || patches.find(p => String(p && p.ok) === 'false') || null;
  }
  function diagnosisTimeout(l){
    freezeForTimeout();
    play('wrong');
    const broken = brokenDiagnosisPatch(l);
    const answerText = broken ? (broken.text || 'Broken route') : 'No answer data was found for this case.';
    const reason = broken ? (broken.reason || 'This is the broken, backwards, or unsafe patch.') : '';
    modal({
      kicker: 'Case Escalated',
      title: 'Diagnosis Timed Out',
      body: 'The issue was not diagnosed before showtime. The answer is shown for review, but completion credits are not awarded unless the case is solved during an active run.',
      blocks: [`<div class="sf-economy-list"><h3>Correct diagnosis</h3><ul><li><strong>${esc(answerText)}</strong>${reason ? `<br>${esc(reason)}` : ''}</li></ul></div>`],
      actions: [
        { label: 'Retry Case', run: el => { if(el) el.remove(); retryCurrent(); } },
        { label: 'Review Case File', secondary: true, run: el => el.querySelector('.sf-economy-list')?.scrollIntoView({ block:'nearest', behavior:'smooth' }) }
      ]
    });
  }

  function buildRoomTimeout(l){
    freezeForTimeout();
    play('wrong');
    modal({
      kicker: 'Build Deadline Missed',
      title: 'Room Not Approved',
      body: 'The room was not submitted before time ran out. Review the brief, check your available credits, then retry.',
      blocks: [`<div class="sf-economy-list"><h3>Build rule</h3><ul><li>Required equipment must be present.</li><li>Extra equipment is allowed if it stays within available credits.</li><li>Owned locker gear can be reused without buying again.</li></ul></div>`],
      actions: [
        { label: 'Retry Build', run: el => { if(el) el.remove(); retryCurrent(); } },
        { label: 'Open Equipment Locker', secondary: true, run: () => showLocker() }
      ]
    });
  }

  function installTimeoutOverride(){
    if(window.sfEconomyOriginalGameOverV6r224) return;
    window.sfEconomyOriginalGameOverV6r224 = typeof window.gameOver === 'function' ? window.gameOver : null;
    window.gameOver = function(){
      const l = currentLevel();
      const mode = modeFor(l);
      if(mode === 'quiz' && window.sfEconomyOriginalGameOverV6r224) return window.sfEconomyOriginalGameOverV6r224.apply(this, arguments);
      if(mode === 'diagnose') return diagnosisTimeout(l);
      if(mode === 'build-room') return buildRoomTimeout(l);
      return patchTimeout(l);
    };
  }

  function keyFromButton(btn){
    return String(btn?.dataset?.gearKey || btn?.dataset?.key || btn?.textContent || 'gear')
      .toLowerCase().replace(/\s*\d+\s*credits\s*/gi, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'gear';
  }
  function labelFromButton(btn){
    return (btn && (btn.querySelector('.room-gear-label')?.textContent || btn.textContent || '')).replace(/\s*\d+\s*credits\s*/gi, '').replace(/LOCKER/g, '').trim();
  }
  function readLocker(){
    const locker = readStore(LOCKER_KEY, { items: {}, history: [] });
    if(!locker.items) locker.items = {};
    if(!Array.isArray(locker.history)) locker.history = [];
    return locker;
  }
  function writeLocker(locker){ writeStore(LOCKER_KEY, locker); }
  function ownedQty(key){ const locker = readLocker(); return Number(locker.items?.[key]?.qty || 0); }
  function addOwnedGear(items, levelId){
    const locker = readLocker();
    items.forEach(item => {
      const key = item.key;
      if(!key) return;
      if(!locker.items[key]) locker.items[key] = { key, label: item.label || key, qty: 0, category: item.category || 'equipment', firstLevel: levelId || '' };
      locker.items[key].qty += Number(item.qty || 1);
      locker.items[key].lastLevel = levelId || locker.items[key].lastLevel || '';
    });
    locker.history.push({ levelId, at: new Date().toISOString(), items });
    writeLocker(locker);
  }

  function selectedNewPurchases(panel){
    const selected = [...panel.querySelectorAll('.room-gear.selected')];
    const lockerCounts = {};
    const purchases = [];
    selected.forEach(btn => {
      const key = keyFromButton(btn);
      const owned = ownedQty(key);
      const usedOwned = lockerCounts[key] || 0;
      lockerCounts[key] = usedOwned + 1;
      if(usedOwned < owned) return;
      purchases.push({ key, label: labelFromButton(btn), cost: Number(btn.dataset.cost || 0), qty: 1 });
    });
    return purchases;
  }

  function buildRoomState(panel){
    const buttons = [...panel.querySelectorAll('.room-gear')];
    const selected = buttons.filter(btn => btn.classList.contains('selected'));
    const required = buttons.filter(btn => btn.dataset.needed === 'true');
    const selectedCounts = {};
    selected.forEach(btn => { const k = keyFromButton(btn); selectedCounts[k] = (selectedCounts[k] || 0) + 1; });
    const requiredCounts = {};
    required.forEach(btn => { const k = keyFromButton(btn); requiredCounts[k] = (requiredCounts[k] || 0) + 1; });
    const missing = [];
    Object.keys(requiredCounts).forEach(key => {
      const have = ownedQty(key) + (selectedCounts[key] || 0);
      const need = requiredCounts[key];
      if(have < need){
        const sample = required.find(btn => keyFromButton(btn) === key);
        missing.push({ key, label: labelFromButton(sample) || key, need, have, short: need - have });
      }
    });
    const purchases = selectedNewPurchases(panel);
    const newCost = purchases.reduce((sum, item) => sum + Number(item.cost || 0), 0);
    const credits = availableCredits();
    return { buttons, selected, required, missing, purchases, newCost, credits, overBy: Math.max(0, newCost - credits) };
  }

  function suggestedReplayBoards(current){
    let levels = [];
    try {
      levels = (window.DATA && DATA.levels || [])
        .filter(l => l && l.environment === current.environment && l.id !== current.id && modeFor(l) !== 'build-room')
        .slice(0, 50);
    } catch(_) {}
    const sameEnvBefore = levels.filter(l => String(l.id) < String(current.id)).slice(-4);
    const picks = sameEnvBefore.length ? sameEnvBefore : levels.slice(0, 4);
    return picks.map(l => `<li>${esc(l.id)} — ${esc(l.title || 'Earlier board')}</li>`).join('') || '<li>Replay earlier completed boards in this environment to improve credits.</li>';
  }

  function showBuildRoomMessage(panel, kind, message){
    let out = panel.querySelector('[data-build-room-message], #levelTrainingResult, .training-result');
    if(!out){ out = document.createElement('div'); out.className = 'training-result'; panel.appendChild(out); }
    out.className = 'training-result sf-build-room-message show ' + (kind || '');
    out.textContent = message;
    out.style.display = 'block';
    out.style.visibility = 'visible';
    out.style.opacity = '1';
    out.style.marginTop = '12px';
    out.style.padding = '12px 14px';
    out.style.borderRadius = '12px';
    out.style.fontWeight = '850';
    out.style.lineHeight = '1.35';
    out.style.color = kind === 'good' ? '#d1fae5' : '#fee2e2';
    out.style.background = kind === 'good' ? 'rgba(6,95,70,.90)' : 'rgba(127,29,29,.90)';
    out.style.border = kind === 'good' ? '1px solid rgba(52,211,153,.95)' : '1px solid rgba(248,113,113,.95)';
    out.scrollIntoView({ block:'nearest', behavior:'smooth' });
  }

  function updateBuildRoomCards(panel){
    if(!panel || panel.dataset.trainingPanel !== 'build-room') return;
    panel.querySelectorAll('.room-gear').forEach(btn => {
      const key = keyFromButton(btn);
      const qty = ownedQty(key);
      btn.classList.toggle('sf-owned-gear', qty > 0);
      btn.dataset.ownedQty = String(qty);
      const cost = btn.querySelector('.room-gear-cost');
      if(cost){
        const base = Number(btn.dataset.cost || 0);
        cost.textContent = qty > 0 ? `Owned x${qty} · new ${base} credits` : `${base} credits`;
      }
    });
    const s = buildRoomState(panel);
    const meter = panel.querySelector('[data-build-room-budget-meter]');
    if(meter){
      meter.textContent = `Credits: ${s.credits} · New purchases: ${s.newCost} · Owned gear reusable`;
      meter.classList.toggle('bad', s.newCost > s.credits);
    }
  }

  function buildRoomCheck(panel, check, event){
    if(event){ event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation && event.stopImmediatePropagation(); }
    if(panel.dataset.submitted === 'true') return;
    updateBuildRoomCards(panel);
    const s = buildRoomState(panel);
    const l = currentLevel() || { id:'build-room', environment:'' };

    if(s.missing.length){
      showBuildRoomMessage(panel, 'bad', 'Missing required equipment: ' + s.missing.map(x => `${x.label} (${x.short} more)`).join(', ') + '. Owned locker gear counts automatically.');
      play('wrongAnswer');
      return;
    }

    if(s.overBy > 0){
      const suggestions = suggestedReplayBoards(l);
      showBuildRoomMessage(panel, 'bad', `Not enough credits. Need ${s.overBy} more credits for the new gear in this build.`);
      modal({
        kicker: 'Insufficient Credits',
        title: 'Replay Earlier Boards to Earn Budget',
        body: `You need ${s.overBy} more credits before this room can be approved. Owned locker gear is free to reuse; only new purchases cost credits.`,
        blocks: [`<div class="sf-economy-list sf-credit-shortage"><h3>Suggested boards to replay</h3><ul>${suggestions}</ul></div>`],
        actions: [
          { label: 'Open Equipment Locker', secondary: true, run: () => showLocker() },
          { label: 'Close', run: el => el.remove() }
        ]
      });
      play('wrongAnswer');
      return;
    }

    try{
      if(s.newCost > 0){
        dispatchLedger({ type:'REWARD_SPENT', levelId: l.id, itemId: 'build-room-purchase-' + l.id + '-' + Date.now(), cost: s.newCost });
      }
      if(s.purchases.length) addOwnedGear(s.purchases, l.id);
      const underBudget = Math.max(0, s.credits - s.newCost);
      const buildScore = 100 + Math.min(25, underBudget);
      awardOnce('build-room-' + l.id, buildScore, 0);
      panel.dataset.submitted = 'true';
      if(check) check.disabled = true;
      showBuildRoomMessage(panel, 'good', `Room approved. New purchases: ${s.newCost} credits. Added ${s.purchases.length} item(s) to Equipment Locker. Score +${buildScore}.`);
      play('rightAnswer');
      updateBuildRoomCards(panel);
      if(panel.dataset.routeTraining === 'true'){
        const next = document.querySelector('#routeTrainingNextBtn');
        if(next) next.disabled = false;
        return;
      }
      if(panel.dataset.trainingOnly === 'true' && typeof completeLevel === 'function') setTimeout(() => completeLevel(), 650);
    }catch(err){
      showBuildRoomMessage(panel, 'bad', err && err.message ? err.message : 'Could not complete this room build.');
      play('wrongAnswer');
    }
  }

  function installBuildRoomDelegatedCheck(){
    if(window.sfEconomyBuildRoomDelegatedV6r224) return;
    window.sfEconomyBuildRoomDelegatedV6r224 = true;
    document.addEventListener('click', function(event){
      const target = event.target && event.target.closest ? event.target : null;
      if(!target) return;
      const check = target.closest('#checkLevelTraining, .sfv166-check-room');
      if(!check) return;
      const panel = check.closest('[data-training-panel="build-room"], .sf-reward-build-room');
      if(!panel) return;
      buildRoomCheck(panel, check, event);
    }, true);
    document.addEventListener('click', function(event){
      const btn = event.target && event.target.closest ? event.target.closest('[data-training-panel="build-room"] .room-gear, .sf-reward-build-room .room-gear') : null;
      if(!btn) return;
      setTimeout(() => updateBuildRoomCards(btn.closest('[data-training-panel="build-room"], .sf-reward-build-room')), 0);
    }, true);
  }

  function showLocker(){
    const locker = readLocker();
    const items = Object.values(locker.items || {}).sort((a,b) => String(a.label).localeCompare(String(b.label)));
    modal({
      kicker: 'Equipment Locker',
      title: 'Owned Gear',
      body: 'Purchased Build-a-Room gear is permanent. Owned equipment is reusable in future room builds and does not need to be purchased again.',
      blocks: [`<div class="sf-economy-list"><h3>Locker Inventory</h3>${items.length ? `<div class="sf-locker-grid">${items.map(item => `<div class="sf-locker-item"><strong>${esc(item.label || item.key)}</strong><span>Owned x${Number(item.qty || 0)}</span><small>${item.firstLevel ? 'First acquired: ' + esc(item.firstLevel) : 'Purchased gear'}</small></div>`).join('')}</div>` : '<p>No purchased equipment yet. Complete Build-a-Room boards to add gear.</p>'}</div>`],
      actions: [{ label:'Close Locker', run: el => el.remove() }]
    });
  }
  window.sfOpenEquipmentLocker = showLocker;

  function installLockerButton(){
    if(document.getElementById('sf-equipment-locker-open')) return;
    const btn = document.createElement('button');
    btn.id = 'sf-equipment-locker-open';
    btn.type = 'button';
    btn.className = 'sf-locker-open-button secondary';
    btn.textContent = 'Equipment Locker';
    btn.addEventListener('click', showLocker);
    document.body.appendChild(btn);
  }

  function markHintUsage(){
    document.addEventListener('click', ev => {
      const btn = ev.target && ev.target.closest ? ev.target.closest('#hintBtn, button') : null;
      if(!btn) return;
      const text = (btn.textContent || '').trim();
      if(!/show hints/i.test(text)) return;
      const id = currentLevelId();
      if(!id) return;
      const hints = readStore(HINT_KEY, {});
      hints[id] = true;
      writeStore(HINT_KEY, hints);
    }, true);
  }

  function installBestRunCapture(){
    if(window.sfEconomyBestRunCaptureV6r224) return;
    window.sfEconomyBestRunCaptureV6r224 = true;
    const originalComplete = typeof window.completeLevel === 'function' ? window.completeLevel : null;
    if(originalComplete){
      window.completeLevel = function(){
        const l = currentLevel();
        const id = l && l.id;
        const before = ledgerTotals();
        const result = originalComplete.apply(this, arguments);
        setTimeout(() => {
          if(!id) return;
          const totals = ledgerTotals();
          const best = readStore(BEST_KEY, {});
          const current = best[id] || { bestScore: 0, bestCredits: 0, completions: 0 };
          const runScore = Math.max(0, totals.totalScore - Number(before.totalScore || 0));
          const runCredits = Math.max(0, totals.totalCredits - Number(before.totalCredits || 0));
          current.bestScore = Math.max(Number(current.bestScore || 0), runScore);
          current.bestCredits = Math.max(Number(current.bestCredits || 0), runCredits);
          current.completions = Number(current.completions || 0) + 1;
          current.lastCompletedAt = new Date().toISOString();
          best[id] = current;
          writeStore(BEST_KEY, best);
        }, 0);
        return result;
      };
    }
  }

  function watchCriticalScore(){
    const check = () => {
      const l = currentLevel();
      if(!l || modeFor(l) === 'quiz') return;
      const scoreEl = document.getElementById('scoreText');
      const score = Number(scoreEl && scoreEl.textContent || ledgerTotals().totalScore || 0);
      const main = document.querySelector('main.game, main');
      if(main) main.classList.toggle('sf-critical-signal', score <= 0 && !document.querySelector('.complete-overlay.show'));
    };
    setInterval(check, 1200);
  }

  function enhanceCompletionLanguage(){
    if(window.sfEconomyCompletionLanguageV6r224) return;
    window.sfEconomyCompletionLanguageV6r224 = true;
    const original = window.sfCompletionDecorateOverlay;
    window.sfCompletionDecorateOverlay = function(levelId){
      try { if(typeof original === 'function') original(levelId); } catch(_) {}
      const l = currentLevel();
      const mode = modeFor(l);
      const card = document.querySelector('#completeOverlay .complete-card');
      if(!card) return;
      const h2 = card.querySelector('h2');
      const kicker = card.querySelector('.eyebrow');
      if(mode === 'diagnose') { if(kicker) kicker.textContent = 'Case Report'; if(h2) h2.textContent = 'Case Resolved'; }
      else if(mode === 'build-room') { if(kicker) kicker.textContent = 'Build Report'; if(h2) h2.textContent = 'Room Approved'; }
      else if(!mode) { if(kicker) kicker.textContent = 'Signal Path Complete'; }
    };
  }

  function refreshBuildRoomPanels(){ document.querySelectorAll('[data-training-panel="build-room"], .sf-reward-build-room').forEach(updateBuildRoomCards); }

  function init(){
    installTimeoutOverride();
    installBuildRoomDelegatedCheck();
    installLockerButton();
    markHintUsage();
    installBestRunCapture();
    watchCriticalScore();
    enhanceCompletionLanguage();
    refreshBuildRoomPanels();
    const obs = new MutationObserver(() => { clearTimeout(window.sfEconomyRefreshTimer); window.sfEconomyRefreshTimer = setTimeout(refreshBuildRoomPanels, 80); });
    obs.observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['class', 'data-training-panel'] });
    console.log('[Signal Flow] Economy + timeout rules active', VERSION);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
