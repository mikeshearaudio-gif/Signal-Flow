// Signal Flow Diagnosis Universal GUI v6r261
// Single-owner deterministic diagnosis renderer.
(function(){
  'use strict';

  const VERSION = '6r261';
  const ASSET = new URL('../assets/diagnosis/svg/', document.currentScript?.src || document.baseURI).href;
  const PANEL_SELECTOR = '[data-sfdiag-generic-panel="true"]';
  const LEGACY_SELECTOR = '[data-training-panel="diagnose"], .diagnose-panel';

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
  function bars(count){
    let out = '';
    for(let i = 0; i < count; i++){
      out += `<span style="--i:${i};animation-delay:${(i % 13) * 0.045}s"></span>`;
    }
    return out;
  }
  function extractLevelId(value){
    const m = String(value || '').toUpperCase().match(/\b[A-Z]{3}-\d{3}\b/);
    return m ? m[0] : '';
  }

  function dataRoot(){
    try{ if(typeof DATA !== 'undefined' && DATA && Array.isArray(DATA.levels)) return DATA; }catch(_){}
    try{ if(window.DATA && Array.isArray(window.DATA.levels)) return window.DATA; }catch(_){}
    return null;
  }

  function selectedLevelId(){
    const levelSelect = qs('#levelJump, #levelSelect, select[name*="level" i], select[id*="level" i]');
    if(levelSelect){
      const opt = levelSelect.selectedOptions && levelSelect.selectedOptions[0];
      const id = extractLevelId([levelSelect.value, opt && opt.value, opt && opt.textContent].join(' '));
      if(id) return id;
    }

    for(const s of qsa('select')){
      const opt = s.selectedOptions && s.selectedOptions[0];
      const id = extractLevelId([s.value, opt && opt.value, opt && opt.textContent].join(' '));
      if(id) return id;
    }

    return extractLevelId(location.hash || location.href) ||
      extractLevelId(qs('.game-title')?.textContent || document.body.textContent || '');
  }

  function levelBySelectedId(){
    const id = selectedLevelId();
    const data = dataRoot();
    if(data && id) return data.levels.find(l => l && l.id === id) || null;

    try{
      if(typeof level === 'function'){
        const l = level();
        if(l && (!id || l.id === id)) return l;
      }
    }catch(_){}

    try{
      const l = window.state && window.state.level;
      if(l && (!id || l.id === id)) return l;
    }catch(_){}

    return null;
  }

  function gameRoot(){
    return qs('main.game') || qs('main') || qs('#app main') || qs('#app') || document.body;
  }

  function mainTrainingSurface(){
    const main = gameRoot();
    const surfaces = [
      qs('.training-only-board', main),
      qs('.board-card', main),
      qs('.training-stage-shell', main),
      qs('.level-shell', main),
      main
    ].filter(Boolean);

    return surfaces.find(el => {
      if(el.matches && el.matches(LEGACY_SELECTOR)) return false;
      if(el.closest && el.closest('.sf-build-room-v6r227')) return false;
      return true;
    }) || main || document.body;
  }

  function diagnosisChoices(level){
    const patches = level && level.training && Array.isArray(level.training.patches)
      ? level.training.patches
      : [];
    return patches.map((p, index) => ({
      text: p && (p.text || p.label || p.name) || `Route ${index + 1}`,
      ok: Boolean(p && p.ok),
      reason: p && p.reason || (p && p.ok ? 'This patch follows the intended route.' : 'You found the broken route.')
    }));
  }

  function animatedMonitor(kind, title, body=''){
    return `<div class="sfdiag-animated-monitor sfdiag-${kind}" aria-hidden="true">
      <div class="sfdiag-monitor-bezel">
        <div class="sfdiag-monitor-title">${title}</div>
        <div class="sfdiag-monitor-screen">${body}</div>
      </div>
    </div>`;
  }
  function patientCardHtml(){
    return `<div class="sfdiag-card sfdiag-patient-card"><img src="${asset('cards/patient-status-card.svg')}" alt="" /></div>`;
  }
  function vitalsHtml(){
    return animatedMonitor('vitals-monitor', 'CALLER VITALS', `<div class="sfdiag-ecg"><svg viewBox="0 0 320 90" aria-hidden="true"><path d="M0 48 L34 48 L47 30 L58 60 L72 46 L104 46 L116 15 L130 72 L145 44 L180 44 L190 34 L204 54 L218 42 L242 42 L252 28 L264 58 L278 45 L320 45"/></svg></div><div class="sfdiag-heart-rate">72<small>BPM</small></div>`);
  }
  function insertMonitorHtml(){
    return animatedMonitor('insert-monitor', 'INSERT PATH MONITOR', `<div class="sfdiag-row-label">SEND</div><div class="sfdiag-meter-row">${bars(30)}</div><div class="sfdiag-row-label">RETURN</div><div class="sfdiag-meter-row">${bars(30)}</div>`);
  }
  function analyzerHtml(){
    return animatedMonitor('audio-analyzer-monitor', 'AUDIO ANALYZER', `<div class="sfdiag-analyzer-layer">${bars(46)}</div>`);
  }
  function patchTesterHtml(){
    return `<div class="sfdiag-animated-monitor sfdiag-patch-tester sfdiag-state-neutral" data-sfdiag-patch-tester aria-hidden="true">
      <div class="sfdiag-monitor-bezel">
        <div class="sfdiag-monitor-title">SIGNAL FLOW PATCH TESTER <b data-sfdiag-patch-state>READY</b></div>
        <div class="sfdiag-patch-tester-screen"><div class="sfdiag-jack sfdiag-jack-send">SEND</div><div class="sfdiag-dotline"></div><div class="sfdiag-jack sfdiag-jack-device">DEVICE</div><div class="sfdiag-dotline sfdiag-dotline-2"></div><div class="sfdiag-jack sfdiag-jack-return">RETURN</div><div class="sfdiag-mini-led"></div></div>
      </div>
    </div>`;
  }
  function spectrumHtml(){
    return animatedMonitor('spectrum-monitor', 'SPECTRUM VIEW', `<div class="sfdiag-spectrum-layer">${bars(62)}</div>`);
  }
  function levelMeterHtml(){
    return `<div class="sfdiag-animated-monitor sfdiag-overall-meter" aria-hidden="true"><div class="sfdiag-monitor-bezel"><div class="sfdiag-monitor-title">OVERALL LEVEL</div><div class="sfdiag-level-body"><div class="sfdiag-level-column">${bars(26)}</div><div class="sfdiag-level-column">${bars(26)}</div><ol><li>0</li><li>-6</li><li>-12</li><li>-18</li><li>-24</li><li>-36</li><li>-48</li><li>-60</li></ol></div></div></div>`;
  }
  function labLeftHtml(){
    return `<aside class="sfdiag-lab-left" aria-hidden="true" data-sfdiag-decorator="left">${patientCardHtml()}${vitalsHtml()}${insertMonitorHtml()}${analyzerHtml()}<div class="sfdiag-prop-row"><div class="sfdiag-prop"><img src="${asset('props/sticky-note-reminder.svg')}" alt="" /></div><div class="sfdiag-prop"><img src="${asset('props/good-route-mug.svg')}" alt="" /></div></div></aside>`;
  }
  function labRightHtml(){
    return `<aside class="sfdiag-lab-right" aria-hidden="true" data-sfdiag-decorator="right"><div class="sfdiag-card sfdiag-neon"><img src="${asset('cards/neon-diagnose-sign.svg')}" alt="" /></div>${patchTesterHtml()}${spectrumHtml()}<div class="sfdiag-right-bottom">${levelMeterHtml()}<div class="sfdiag-cart-stack"><div class="sfdiag-prop"><img src="${asset('props/diagnosis-cart.svg')}" alt="" /></div><div class="sfdiag-prop sfdiag-trash"><img src="${asset('props/bad-routes-trash-can.svg')}" alt="" /></div></div></div><img class="sfdiag-lamp" src="${asset('props/desk-lamp.svg')}" alt="" /></aside>`;
  }
  function workflowHtml(){
    return `<div class="sfdiag-workflow-rail" aria-hidden="true" data-sfdiag-decorator="workflow"><div class="sfdiag-workflow-inner"><span><b></b>Diagnose</span><span>Plan</span><span>Patch</span><span>Test</span><span>Listen</span><span>Review</span></div></div>`;
  }
  function artLayerHtml(){
    return `<div class="sf-diagnosis-art-layer" data-sf-diagnosis-skin="${VERSION}" aria-hidden="true">
      <img src="${asset('backgrounds/diagnosis-board-shell.svg')}" class="sf-diagnosis-board-shell" alt="" decoding="async" draggable="false" />
      <img src="${asset('backgrounds/diagnosis-topbar-skin.svg')}" class="sf-diagnosis-topbar-skin" alt="" decoding="async" draggable="false" />
      <img src="${asset('backgrounds/diagnosis-sidebar-skin.svg')}" class="sf-diagnosis-sidebar-skin" alt="" decoding="async" draggable="false" />
    </div>`;
  }

  function panelHtml(level){
    const t = level.training || {};
    const choices = diagnosisChoices(level);
    const buttons = choices.map((p, i) => `
      <button type="button" class="diagnose-patch inline-diagnose sfv174-diagnose-item sfv175-diagnose-item sfdiag-generated-choice sf-diagnosis-choice-card" data-ok="${String(p.ok)}" data-sfdiag-correct="${String(!p.ok)}" data-reason="${escHtml(p.reason)}">
        <span>${i + 1}</span>${escHtml(p.text)}
      </button>`).join('');

    return `<section class="sfdiag-board-shell sfdiag-generic-panel sfdiag-svg-skin-active sf-diagnosis-mode" data-sfdiag-generic-panel="true" data-training-panel="diagnose" data-training-only="true" data-sfdiag-level-id="${escHtml(level.id)}" data-sfdiag-version="${VERSION}" data-sfdiag-choice-count="${choices.length}">
      ${artLayerHtml()}
      ${labLeftHtml()}
      <div class="sfdiag-clipboard-panel">
        <div class="sfv174-clipboard sfv175-clipboard">
          <p class="eyebrow sfdiag-generated-title">Signal Flow Diagnosis</p>
          <strong class="sfdiag-generated-prompt">${escHtml(t.prompt || 'Find the broken, backwards, or unsafe patch before the room goes live.')}</strong>
          <p class="sfv174-clipboard-note sfdiag-generated-note">Review the chart and tap the broken route.</p>
          <div class="inline-diagnose-list sfv174-diagnose-list sfv175-diagnose-list">${buttons || '<p class="sfdiag-generated-note">No diagnosis routes found for this board.</p>'}</div>
          <div class="training-result sfv174-clipboard-result" data-sfdiag-result></div>
        </div>
      </div>
      ${labRightHtml()}
      ${workflowHtml()}
    </section>`;
  }

  function setPatchTester(panel, kind){
    const tester = qs('[data-sfdiag-patch-tester]', panel);
    const state = qs('[data-sfdiag-patch-state]', panel);
    if(!tester || !state) return;
    tester.classList.remove('sfdiag-state-neutral','sfdiag-state-pass','sfdiag-state-fail');
    if(kind === 'pass') { tester.classList.add('sfdiag-state-pass'); state.textContent = 'PASS'; }
    else if(kind === 'fail') { tester.classList.add('sfdiag-state-fail'); state.textContent = 'CHECK'; }
    else { tester.classList.add('sfdiag-state-neutral'); state.textContent = 'READY'; }
  }
  function play(name){ try{ if(typeof playSfx === 'function') playSfx(name); }catch(_){ } }
  function renderScoreSafe(){ try{ if(typeof renderScore === 'function') renderScore(); }catch(_){ } }
  function completeSafe(){ try{ if(typeof completeLevel === 'function') completeLevel(); }catch(e){ console.error(e); } }

  function bindPanel(panel, level){
    if(!panel || panel.dataset.sfdiagBound === VERSION) return;
    panel.dataset.sfdiagBound = VERSION;
    const result = qs('[data-sfdiag-result]', panel);

    function setResult(kind, message){
      if(result){
        result.className = 'training-result show ' + kind + ' sfv174-clipboard-result';
        result.textContent = message || '';
      }
      if(kind === 'bad') play('wrongAnswer');
    }

    qsa('.diagnose-patch', panel).forEach(btn => {
      btn.addEventListener('click', () => {
        if(btn.disabled) return;
        const correct = btn.dataset.ok === 'false';
        qsa('.diagnose-patch', panel).forEach(x => x.classList.remove('selected'));
        btn.classList.add('selected');

        if(!correct){
          setPatchTester(panel, 'fail');
          setResult('bad', 'That patch is valid for this job. Look for the route that breaks the workflow.');
          return;
        }

        play('rightAnswer');
        setPatchTester(panel, 'pass');
        setResult('good', 'Correct. ' + (btn.dataset.reason || 'You found the broken route.'));
        qsa('.diagnose-patch', panel).forEach(b => { b.disabled = true; b.setAttribute('aria-disabled','true'); });
        try{
          if(typeof sfAwardLedgerScoreOnce === 'function') sfAwardLedgerScoreOnce('training-' + level.id, 500, 25);
          renderScoreSafe();
        }catch(err){ console.warn('[Signal Flow] Diagnosis award failed ' + VERSION, err); }
        setTimeout(completeSafe, 550);
      });
    });
  }

  function normalizeGeneratedChoices(panel){
    qsa('.sfdiag-generated-choice', panel).forEach(btn => {
      btn.hidden = false;
      btn.removeAttribute('aria-hidden');
      btn.style.setProperty('display', 'flex', 'important');
      btn.style.setProperty('visibility', 'visible', 'important');
      btn.style.setProperty('opacity', '1', 'important');
      btn.style.setProperty('pointer-events', 'auto', 'important');
    });
  }

  function cleanupDiagnosis(){
    const main = gameRoot();
    if(main){
      main.classList.remove('sfdiag-ui-active');
      delete main.dataset.sfdiagVersion;
    }
    qsa(PANEL_SELECTOR).forEach(el => el.remove());
    qsa('[data-sfdiag-legacy-diagnosis="hidden"]').forEach(el => {
      el.removeAttribute('data-sfdiag-legacy-diagnosis');
      el.removeAttribute('aria-hidden');
      el.style.display = '';
      el.style.visibility = '';
      el.style.pointerEvents = '';
    });
    qsa('.sfdiag-host-owned').forEach(el => {
      el.classList.remove('sfdiag-host-owned');
      el.removeAttribute('data-sfdiag-rendered-level');
    });
  }

  function removeOldDiagnosisMount(host){
    qsa(PANEL_SELECTOR).forEach(el => {
      if(el.parentElement !== host) el.remove();
    });
    qsa(PANEL_SELECTOR, host).forEach(el => el.remove());
  }

  function hideLegacyDiagnosis(host){
    qsa(LEGACY_SELECTOR, host).forEach(el => {
      if(el.matches(PANEL_SELECTOR)) return;
      el.setAttribute('data-sfdiag-legacy-diagnosis', 'hidden');
      el.setAttribute('aria-hidden', 'true');
      el.style.display = 'none';
      el.style.visibility = 'hidden';
      el.style.pointerEvents = 'none';
    });
  }

  function renderDiagnosis(){
    const level = levelBySelectedId();
    if(!level || !level.training || level.training.type !== 'diagnose'){
      cleanupDiagnosis();
      return false;
    }

    const main = gameRoot();
    const host = mainTrainingSurface();
    if(!host) return false;

    removeOldDiagnosisMount(host);
    hideLegacyDiagnosis(host);

    host.classList.add('sfdiag-host-owned');
    host.setAttribute('data-sfdiag-rendered-level', level.id);
    if(getComputedStyle(host).position === 'static') host.style.position = 'relative';

    host.insertAdjacentHTML('afterbegin', panelHtml(level));
    const panel = qs(PANEL_SELECTOR, host);
    if(!panel) return false;

    main.classList.add('sfdiag-ui-active');
    main.dataset.sfdiagVersion = VERSION;
    bindPanel(panel, level);
    normalizeGeneratedChoices(panel);
    setPatchTester(panel, 'neutral');

    if(renderDiagnosis._lastLog !== level.id + ':' + VERSION){
      renderDiagnosis._lastLog = level.id + ':' + VERSION;
      console.log('[Signal Flow] Diagnosis single-owner renderer active ' + VERSION, level.id, diagnosisChoices(level).length);
    }
    return true;
  }

  function scheduleRender(){
    clearTimeout(scheduleRender.timer);
    scheduleRender.timer = setTimeout(renderDiagnosis, 0);
  }

  function scheduleDiagnosisRemount(){
    scheduleRender();
    setTimeout(renderDiagnosis, 40);
    setTimeout(() => {
      renderDiagnosis();
      const panel = qs(PANEL_SELECTOR);
      if(panel) normalizeGeneratedChoices(panel);
    }, 140);
  }

  function installLifecycleHooks(){
    if(installLifecycleHooks.done) return;
    installLifecycleHooks.done = true;

    document.addEventListener('click', event => {
      const target = event.target && event.target.closest && event.target.closest('#retryBtn, [id*="retry" i], [class*="retry" i], button');
      if(!target) return;
      const label = String(target.id || target.className || target.textContent || '');
      if(!/retry|try\s*again|restart/i.test(label)) return;
      scheduleDiagnosisRemount();
    }, true);

    if(typeof window.renderTrainingOnlyLevel === 'function' && !window.renderTrainingOnlyLevel.sfdiagWrapped){
      const original = window.renderTrainingOnlyLevel;
      const wrapped = function(...args){
        const result = original.apply(this, args);
        const l = args[0];
        if(l && l.training && l.training.type === 'diagnose') scheduleDiagnosisRemount();
        return result;
      };
      wrapped.sfdiagWrapped = true;
      window.renderTrainingOnlyLevel = wrapped;
    }

    if(typeof window.sfLedgerDispatch === 'function' && !window.sfLedgerDispatch.sfdiagWrapped){
      const originalDispatch = window.sfLedgerDispatch;
      const wrappedDispatch = function(event){
        const result = originalDispatch.apply(this, arguments);
        if(event && (event.type === 'LEVEL_STARTED' || event.type === 'LEVEL_RETRIED')) scheduleDiagnosisRemount();
        return result;
      };
      wrappedDispatch.sfdiagWrapped = true;
      window.sfLedgerDispatch = wrappedDispatch;
    }
  }

  window.sfInstallDiagnosisGui = renderDiagnosis;
  installLifecycleHooks();

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleRender);
  else scheduleRender();

  window.addEventListener('load', scheduleRender);
  window.addEventListener('hashchange', scheduleRender);
  window.addEventListener('popstate', scheduleRender);
  document.addEventListener('change', event => {
    if(event.target && event.target.matches && event.target.matches('select,#levelJump,#envJump,#levelSelect,#envSelect')){
      scheduleRender();
    }
  }, true);
})();
