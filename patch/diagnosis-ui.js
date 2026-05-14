// Signal Flow Diagnosis Universal GUI v6r213
// Generic diagnosis renderer: builds the clipboard from level().training, not from legacy diagnosis DOM.
(function(){
  'use strict';
  const VERSION = '6r213';
  const ASSET = '/assets/diagnosis/svg/';
  document.documentElement.setAttribute('data-sfdiag-gui-version', VERSION);

  function qs(sel, root=document){ return root.querySelector(sel); }
  function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
  function asset(path){ return ASSET + path; }
  function escHtml(value){
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function bars(count, cls=''){
    let out = '';
    for(let i=0;i<count;i++) out += `<span class="${cls}" style="--i:${i};animation-delay:${(i%13)*0.045}s"></span>`;
    return out;
  }

  function selectedDiagnosisId(){
    const selects = qsa('select');
    for(const s of selects){
      const opt = s.selectedOptions && s.selectedOptions[0];
      const text = ((opt && opt.textContent) || '') + ' ' + (s.value || '');
      if(/\[DIAG\]|diagnose/i.test(text)){
        const m = text.match(/\b[A-Z]{3}-\d{3}\b/);
        if(m) return m[0];
      }
    }
    const visible = (qs('.game-title')?.textContent || document.body.textContent || '').match(/\b[A-Z]{3}-\d{3}\b/);
    return visible ? visible[0] : '';
  }

  function currentLevelObject(){
    const diagId = selectedDiagnosisId();
    try{
      if(window.DATA && Array.isArray(window.DATA.levels) && diagId){
        const byId = window.DATA.levels.find(l => l && l.id === diagId);
        if(byId && byId.training && byId.training.type === 'diagnose') return byId;
      }
    }catch(_){ }
    try{
      if(typeof window.level === 'function'){
        const l = window.level();
        if(l && l.training && l.training.type === 'diagnose') return l;
      }
    }catch(_){ }
    try{
      if(window.state && window.state.level && window.state.level.training && window.state.level.training.type === 'diagnose') return window.state.level;
    }catch(_){ }
    try{
      if(window.DATA && Array.isArray(window.DATA.levels) && diagId){
        return window.DATA.levels.find(l => l && l.id === diagId) || null;
      }
    }catch(_){ }
    return null;
  }

  function currentDiagnosisTraining(){
    const l = currentLevelObject();
    const t = l && l.training;
    return t && t.type === 'diagnose' ? t : null;
  }

  function levelId(){
    const l = currentLevelObject();
    return (l && l.id) || selectedDiagnosisId() || '';
  }

  function isDiagnosisBoard(){
    if(currentDiagnosisTraining()) return true;
    const selected = qsa('select').map(s => ((s.selectedOptions && s.selectedOptions[0] && s.selectedOptions[0].textContent) || '') + ' ' + (s.value || '')).join(' ');
    const title = (qs('.game-title')?.textContent || '').replace(/\s+/g, ' ');
    return /\[DIAG\]|\bDIAGNOSE\b|Diagnose Patch|Signal Flow Diagnosis|Find the broken|unsafe patch/i.test(selected + ' ' + title);
  }

  function animatedMonitor(kind, title, body=''){
    return `<div class="sfdiag-animated-monitor sfdiag-${kind}" aria-hidden="true">
      <div class="sfdiag-monitor-bezel">
        <div class="sfdiag-monitor-title">${title}</div>
        <div class="sfdiag-monitor-screen">${body}</div>
      </div>
    </div>`;
  }
  function patientCardHtml(){ return `<div class="sfdiag-card sfdiag-patient-card"><img src="${asset('cards/patient-status-card.svg')}" alt="" /></div>`; }
  function vitalsHtml(){ return animatedMonitor('vitals-monitor', 'CALLER VITALS', `<div class="sfdiag-ecg"><svg viewBox="0 0 320 90" aria-hidden="true"><path d="M0 48 L34 48 L47 30 L58 60 L72 46 L104 46 L116 15 L130 72 L145 44 L180 44 L190 34 L204 54 L218 42 L242 42 L252 28 L264 58 L278 45 L320 45"/></svg></div><div class="sfdiag-heart-rate">72<small>BPM</small></div>`); }
  function insertMonitorHtml(){ return animatedMonitor('insert-monitor', 'INSERT PATH MONITOR', `<div class="sfdiag-row-label">SEND</div><div class="sfdiag-meter-row">${bars(30)}</div><div class="sfdiag-row-label">RETURN</div><div class="sfdiag-meter-row">${bars(30)}</div>`); }
  function analyzerHtml(){ return animatedMonitor('audio-analyzer-monitor', 'AUDIO ANALYZER', `<div class="sfdiag-analyzer-layer">${bars(46)}</div>`); }
  function patchTesterHtml(){ return `<div class="sfdiag-animated-monitor sfdiag-patch-tester sfdiag-state-neutral" data-sfdiag-patch-tester aria-hidden="true">
      <div class="sfdiag-monitor-bezel">
        <div class="sfdiag-monitor-title">SIGNAL FLOW PATCH TESTER <b data-sfdiag-patch-state>READY</b></div>
        <div class="sfdiag-patch-tester-screen"><div class="sfdiag-jack sfdiag-jack-send">SEND</div><div class="sfdiag-dotline"></div><div class="sfdiag-jack sfdiag-jack-device">DEVICE</div><div class="sfdiag-dotline sfdiag-dotline-2"></div><div class="sfdiag-jack sfdiag-jack-return">RETURN</div><div class="sfdiag-mini-led"></div></div>
      </div>
    </div>`; }
  function spectrumHtml(){ return animatedMonitor('spectrum-monitor', 'SPECTRUM VIEW', `<div class="sfdiag-spectrum-layer">${bars(62)}</div>`); }
  function levelMeterHtml(){ return `<div class="sfdiag-animated-monitor sfdiag-overall-meter" aria-hidden="true"><div class="sfdiag-monitor-bezel"><div class="sfdiag-monitor-title">OVERALL LEVEL</div><div class="sfdiag-level-body"><div class="sfdiag-level-column">${bars(26)}</div><div class="sfdiag-level-column">${bars(26)}</div><ol><li>0</li><li>-6</li><li>-12</li><li>-18</li><li>-24</li><li>-36</li><li>-48</li><li>-60</li></ol></div></div></div>`; }
  function labLeftHtml(){ return `<aside class="sfdiag-lab-left" aria-hidden="true" data-sfdiag-decorator="left">${patientCardHtml()}${vitalsHtml()}${insertMonitorHtml()}${analyzerHtml()}<div class="sfdiag-prop-row"><div class="sfdiag-prop"><img src="${asset('props/sticky-note-reminder.svg')}" alt="" /></div><div class="sfdiag-prop"><img src="${asset('props/good-route-mug.svg')}" alt="" /></div></div></aside>`; }
  function labRightHtml(){ return `<aside class="sfdiag-lab-right" aria-hidden="true" data-sfdiag-decorator="right"><div class="sfdiag-card sfdiag-neon"><img src="${asset('cards/neon-diagnose-sign.svg')}" alt="" /></div>${patchTesterHtml()}${spectrumHtml()}<div class="sfdiag-right-bottom">${levelMeterHtml()}<div class="sfdiag-cart-stack"><div class="sfdiag-prop"><img src="${asset('props/diagnosis-cart.svg')}" alt="" /></div><div class="sfdiag-prop sfdiag-trash"><img src="${asset('props/bad-routes-trash-can.svg')}" alt="" /></div></div></div><img class="sfdiag-lamp" src="${asset('props/desk-lamp.svg')}" alt="" /></aside>`; }
  function workflowHtml(){ return `<div class="sfdiag-workflow-rail" aria-hidden="true" data-sfdiag-decorator="workflow"><div class="sfdiag-workflow-inner"><span><b></b>Diagnose</span><span>Plan</span><span>Patch</span><span>Test</span><span>Listen</span><span>Review</span></div></div>`; }

  function findBoardShell(){
    const main = qs('main.game');
    if(!main) return null;
    const candidates = qsa('.training-only-board, .board-card, .sfv182-quiz-board, .training-board, .training-stage-board', main)
      .filter(el => {
        if(el.closest('aside, .training-only-side, .panel-scroll')) return false;
        const r = el.getBoundingClientRect();
        return r.width > 420 && r.height > 180;
      })
      .sort((a,b) => (b.getBoundingClientRect().width * b.getBoundingClientRect().height) - (a.getBoundingClientRect().width * a.getBoundingClientRect().height));
    return candidates[0] || qs('.training-stage-shell', main) || main;
  }

  function diagnosisChoices(t){
    return Array.isArray(t?.patches) && t.patches.length ? t.patches
      : Array.isArray(t?.checks) && t.checks.length ? t.checks
      : Array.isArray(t?.choices) && t.choices.length ? t.choices
      : [];
  }

  function generatedPanelHtml(l, t){
    const choices = diagnosisChoices(t);
    const prompt = t.prompt || 'Find the broken, backwards, or unsafe patch before the room goes live.';
    const buttons = choices.map((p, i) => {
      const ok = !!p.ok;
      const reason = p.reason || (ok ? 'This patch is valid.' : 'You found the broken route.');
      const text = p.text || p.label || p.name || ('Route ' + (i + 1));
      return `<button type="button" class="diagnose-patch inline-diagnose sfv174-diagnose-item sfv175-diagnose-item sfdiag-generated-choice" data-ok="${String(ok)}" data-reason="${escHtml(reason)}"><span>${i + 1}</span>${escHtml(text)}</button>`;
    }).join('');
    return `<section class="training-level-panel diagnose-panel sfv174-diagnose-clinic sfv175-diagnose-board sfdiag-clipboard-panel sfdiag-generic-panel" data-training-panel="diagnose" data-training-only="true" data-sfdiag-generic-panel="true" data-sfdiag-level-id="${escHtml(l?.id || levelId())}">
      <div class="sfv175-diagnose-stage">
        <div class="sfv174-clipboard sfv175-clipboard">
          <p class="eyebrow sfdiag-generated-title">Signal Flow Diagnosis</p>
          <strong class="sfdiag-generated-prompt">${escHtml(prompt)}</strong>
          <p class="sfv174-clipboard-note sfdiag-generated-note">Review the chart and tap the broken route.</p>
          <div class="inline-diagnose-list sfv174-diagnose-list sfv175-diagnose-list">${buttons || '<p class="sfdiag-generated-note">No diagnosis routes found for this board.</p>'}</div>
          <div class="training-result sfv174-clipboard-result" data-sfdiag-result></div>
        </div>
      </div>
    </section>`;
  }

  function hideLegacyDiagnosis(board, generated){
    qsa('[data-training-panel="diagnose"], .diagnose-panel, .sfv175-diagnose-stage, .sfv174-clipboard, .sfv175-clipboard', board).forEach(el => {
      if(el === generated || generated.contains(el) || el.contains(generated)) return;
      const hideTarget = el.closest('.training-level-panel, .diagnose-panel') || el;
      if(hideTarget === generated || generated.contains(hideTarget)) return;
      hideTarget.setAttribute('data-sfdiag-legacy-diagnosis', 'hidden');
      hideTarget.setAttribute('aria-hidden', 'true');
      hideTarget.style.display = 'none';
      hideTarget.style.visibility = 'hidden';
      hideTarget.style.pointerEvents = 'none';
    });
  }

  function play(name){ try{ if(typeof window.playSfx === 'function') window.playSfx(name); }catch(_){ } }
  function renderScoreSafe(){ try{ if(typeof window.renderScore === 'function') window.renderScore(); }catch(_){ } }
  function completeSafe(){ try{ if(typeof window.completeLevel === 'function') window.completeLevel(); }catch(e){ console.error(e); } }

  function setPatchTester(kind){
    const tester = qs('[data-sfdiag-patch-tester]');
    const state = qs('[data-sfdiag-patch-state]', tester || document);
    if(!tester || !state) return;
    tester.classList.remove('sfdiag-state-neutral','sfdiag-state-pass','sfdiag-state-fail');
    if(kind === 'pass') { tester.classList.add('sfdiag-state-pass'); state.textContent = 'PASS'; }
    else if(kind === 'fail') { tester.classList.add('sfdiag-state-fail'); state.textContent = 'CHECK'; }
    else { tester.classList.add('sfdiag-state-neutral'); state.textContent = 'READY'; }
  }

  function bindGeneratedPanel(panel){
    if(!panel || panel.dataset.sfdiagBound === VERSION) return;
    panel.dataset.sfdiagBound = VERSION;
    const out = qs('[data-sfdiag-result], .training-result', panel);
    function setResult(kind, message){
      if(out){ out.className = 'training-result show ' + kind + ' sfv174-clipboard-result'; out.textContent = message || ''; }
      if(kind === 'bad') play('wrongAnswer');
    }
    function finish(btn){
      play('rightAnswer');
      setPatchTester('pass');
      setResult('good', 'Correct. ' + (btn.dataset.reason || 'You found the broken route.'));
      qsa('.diagnose-patch', panel).forEach(b => { b.disabled = true; b.setAttribute('aria-disabled','true'); });
      try{
        const id = panel.getAttribute('data-sfdiag-level-id') || levelId();
        if(typeof window.sfAwardLedgerScoreOnce === 'function') window.sfAwardLedgerScoreOnce('training-' + id, 500, 25);
        renderScoreSafe();
      }catch(e){ console.warn('[Signal Flow] Diagnosis GUI award failed', e); }
      setTimeout(completeSafe, 550);
    }
    qsa('.diagnose-patch', panel).forEach(btn => {
      btn.addEventListener('click', () => {
        if(btn.disabled) return;
        const correct = btn.dataset.ok === 'false';
        qsa('.diagnose-patch', panel).forEach(x => x.classList.remove('selected'));
        btn.classList.add('selected');
        if(correct) finish(btn);
        else { setPatchTester('fail'); setResult('bad', 'That patch is valid for this job. Look for the route that breaks the workflow.'); }
      });
    });
  }

  function removeOldDecorators(board){
    qsa('[data-sfdiag-decorator]', board).forEach(el => el.remove());
  }

  function renderGenericDiagnosis(){
    if(!isDiagnosisBoard()) return false;
    const main = qs('main.game');
    const l = currentLevelObject();
    const t = currentDiagnosisTraining();
    const board = findBoardShell();
    if(!main || !board || !t) return false;

    const id = (l && l.id) || levelId();
    const existingId = board.getAttribute('data-sfdiag-rendered-level');
    if(main.dataset.sfdiagVersion !== VERSION || existingId !== id){
      removeOldDecorators(board);
      qsa('[data-sfdiag-generic-panel="true"]', board).forEach(el => el.remove());
      qsa('[data-sfdiag-legacy-diagnosis="hidden"]', board).forEach(el => {
        el.removeAttribute('data-sfdiag-legacy-diagnosis');
        el.removeAttribute('aria-hidden');
        el.style.display = '';
        el.style.visibility = '';
        el.style.pointerEvents = '';
      });
    }

    main.classList.add('sfdiag-ui-active');
    main.dataset.sfdiagVersion = VERSION;
    board.classList.add('sfdiag-board-shell');
    board.setAttribute('data-sfdiag-rendered-level', id || 'unknown');

    let panel = qs('[data-sfdiag-generic-panel="true"]', board);
    if(!panel){
      board.insertAdjacentHTML('afterbegin', generatedPanelHtml(l, t));
      panel = qs('[data-sfdiag-generic-panel="true"]', board);
    }
    panel.classList.add('sfdiag-clipboard-panel');
    bindGeneratedPanel(panel);
    hideLegacyDiagnosis(board, panel);

    if(!qs('[data-sfdiag-decorator="left"]', board)) board.insertAdjacentHTML('afterbegin', labLeftHtml());
    if(!qs('[data-sfdiag-decorator="right"]', board)) board.insertAdjacentHTML('beforeend', labRightHtml());
    if(!qs('[data-sfdiag-decorator="workflow"]', board)) board.insertAdjacentHTML('beforeend', workflowHtml());
    setPatchTester('neutral');

    document.documentElement.classList.remove('sfdiag-precloak-pending','sfdiag-cloak-failsafe-open');
    console.log('[Signal Flow] Diagnosis generic GUI active', VERSION, id, diagnosisChoices(t).length);
    return true;
  }

  function deactivateIfNeeded(){
    if(isDiagnosisBoard()) return;
    const main = qs('main.game.sfdiag-ui-active');
    if(!main) return;
    main.classList.remove('sfdiag-ui-active');
    delete main.dataset.sfdiagVersion;
    qsa('[data-sfdiag-decorator]').forEach(el => el.remove());
    qsa('[data-sfdiag-generic-panel="true"]').forEach(el => el.remove());
    qsa('[data-sfdiag-legacy-diagnosis="hidden"]').forEach(el => {
      el.removeAttribute('data-sfdiag-legacy-diagnosis');
      el.removeAttribute('aria-hidden');
      el.style.display = '';
      el.style.visibility = '';
      el.style.pointerEvents = '';
    });
    qsa('.sfdiag-board-shell').forEach(el => { el.classList.remove('sfdiag-board-shell'); el.removeAttribute('data-sfdiag-rendered-level'); });
  }

  function refresh(){ if(!renderGenericDiagnosis()) deactivateIfNeeded(); }
  window.sfInstallDiagnosisGui = refresh;

  let timer = null;
  function schedule(delay=60){ clearTimeout(timer); timer = setTimeout(refresh, delay); }
  document.addEventListener('DOMContentLoaded', () => schedule(20));
  window.addEventListener('load', () => { schedule(30); setTimeout(refresh, 140); setTimeout(refresh, 360); setTimeout(refresh, 760); setTimeout(refresh, 1400); });
  window.addEventListener('hashchange', () => schedule(60));
  window.addEventListener('popstate', () => schedule(60));
  window.addEventListener('resize', () => schedule(100));
  document.addEventListener('change', event => { if(event.target && event.target.matches && event.target.matches('select,#levelJump,#envJump')) schedule(120); }, true);
  document.addEventListener('click', event => {
    if(event.target && event.target.closest && event.target.closest('button,select,#loadLevel,#loadBoard')){
      setTimeout(refresh, 80); setTimeout(refresh, 260); setTimeout(refresh, 700);
    }
  }, true);
  new MutationObserver(() => schedule(80)).observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['class','value','data-ok','data-correct'] });
  schedule(80);
})();
