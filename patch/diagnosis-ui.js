// Signal Flow Diagnosis Universal GUI v6r208
// Visual/animation layer only: preserves existing question, answers, next-question behavior, scoring, timer, completion, and navigation.
(function(){
  'use strict';
  const VERSION = '6r208';
  const ASSET = '/assets/diagnosis/svg/';

  function qs(sel, root=document){ return root.querySelector(sel); }
  function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
  function asset(path){ return ASSET + path; }
  function bars(count, cls=''){
    let out = '';
    for(let i=0;i<count;i++) out += `<span class="${cls}" style="--i:${i};animation-delay:${(i%13)*0.045}s"></span>`;
    return out;
  }
  function levelId(){
    const sel = qs('#levelJump');
    if(sel && sel.value) return sel.value;
    const text = (qs('.game-title h1')?.textContent || document.body.textContent || '').match(/\b[A-Z]{3}-\d{3}\b/);
    return text ? text[0] : '';
  }
  function isDiagnosisBoard(){
    const main = qs('main.game');
    if(!main) return false;
    if(qs('[data-training-panel="diagnose"]')) return true;
    if(main.classList.contains('sfdiag-force')) return true;
    const opt = qs('#levelJump')?.selectedOptions?.[0]?.textContent || '';
    const title = (qs('.game-title')?.textContent || '').replace(/\s+/g,' ');
    const body = (document.body.textContent || '').replace(/\s+/g,' ').slice(0, 12000);
    return /\[DIAG\]|Diagnose|Diagnosis Check|Signal Flow Diagnosis|Find the broken|Find the incorrect|unsafe patch/i.test(opt + ' ' + title + ' ' + body);
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
        <div class="sfdiag-patch-tester-screen">
          <div class="sfdiag-jack sfdiag-jack-send">SEND</div>
          <div class="sfdiag-dotline"></div>
          <div class="sfdiag-jack sfdiag-jack-device">DEVICE</div>
          <div class="sfdiag-dotline sfdiag-dotline-2"></div>
          <div class="sfdiag-jack sfdiag-jack-return">RETURN</div>
          <div class="sfdiag-mini-led"></div>
        </div>
      </div>
    </div>`;
  }

  function spectrumHtml(){
    return animatedMonitor('spectrum-monitor', 'SPECTRUM VIEW', `<div class="sfdiag-spectrum-layer">${bars(62)}</div>`);
  }

  function levelMeterHtml(){
    return `<div class="sfdiag-animated-monitor sfdiag-overall-meter" aria-hidden="true">
      <div class="sfdiag-monitor-bezel"><div class="sfdiag-monitor-title">OVERALL LEVEL</div>
        <div class="sfdiag-level-body"><div class="sfdiag-level-column">${bars(26)}</div><div class="sfdiag-level-column">${bars(26)}</div><ol><li>0</li><li>-6</li><li>-12</li><li>-18</li><li>-24</li><li>-36</li><li>-48</li><li>-60</li></ol></div>
      </div>
    </div>`;
  }


  function removeStagnantDiagnosisMonitorImages(root=document){
    qsa('[data-sfdiag-decorator] img', root).forEach(img => {
      const src = String(img.getAttribute('src') || img.src || '');
      if(/monitors\/|side-monitor-frame|signal-flow-patch-tester|spectrum-view|overall-level-meter|insert-path-monitor|audio-analyzer/i.test(src)){
        img.remove();
      }
    });
  }

  function labLeftHtml(){
    return `<aside class="sfdiag-lab-left" aria-hidden="true" data-sfdiag-decorator="left">
      ${patientCardHtml()}
      ${vitalsHtml()}
      ${insertMonitorHtml()}
      ${analyzerHtml()}
      <div class="sfdiag-prop-row"><div class="sfdiag-prop"><img src="${asset('props/sticky-note-reminder.svg')}" alt="" /></div><div class="sfdiag-prop"><img src="${asset('props/good-route-mug.svg')}" alt="" /></div></div>
    </aside>`;
  }

  function labRightHtml(){
    return `<aside class="sfdiag-lab-right" aria-hidden="true" data-sfdiag-decorator="right">
      <div class="sfdiag-card sfdiag-neon"><img src="${asset('cards/neon-diagnose-sign.svg')}" alt="" /></div>
      ${patchTesterHtml()}
      ${spectrumHtml()}
      <div class="sfdiag-right-bottom">${levelMeterHtml()}<div class="sfdiag-cart-stack"><div class="sfdiag-prop"><img src="${asset('props/diagnosis-cart.svg')}" alt="" /></div><div class="sfdiag-prop sfdiag-trash"><img src="${asset('props/bad-routes-trash-can.svg')}" alt="" /></div></div></div>
      <img class="sfdiag-lamp" src="${asset('props/desk-lamp.svg')}" alt="" />
    </aside>`;
  }

  function workflowHtml(){
    return `<div class="sfdiag-workflow-rail" aria-hidden="true" data-sfdiag-decorator="workflow"><div class="sfdiag-workflow-inner">
      <span><b></b>Diagnose</span><span>Plan</span><span>Patch</span><span>Test</span><span>Listen</span><span>Review</span>
    </div></div>`;
  }

  function findBoard(){
    return qs('.training-only-board') || qs('.sfv182-quiz-board') || qs('.board-card') || qs('main.game > section:not(.training-stage-shell)');
  }
  function findPlayablePanel(board){
    if(!board) return null;
    return qs('[data-training-panel="diagnose"]', board) ||
           qs('[data-training-panel="quiz"]', board) ||
           qs('.training-level-panel.diagnose-panel', board) ||
           qs('.training-level-panel.quiz-panel', board) ||
           qs('.sfv182-quiz-popover', board) ||
           qs('.quiz-panel', board) ||
           qs('.diagnose-panel', board) ||
           qs('.training-level-panel', board);
  }

  function labelDiagnosis(){
    const p = qs('.game-title p');
    if(p && !/diagnose/i.test(p.textContent || '')) p.textContent = (p.textContent || '').replace(/·.*$/, '').trim() + ' · Diagnose';
  }

  function syncPatchTesterState(){
    const main = qs('main.game.sfdiag-ui-active');
    if(!main) return;
    const tester = qs('[data-sfdiag-patch-tester]');
    const state = qs('[data-sfdiag-patch-state]', tester || document);
    if(!tester || !state) return;

    const selected = qs('.quiz-answer.selected, .sfv183-answer.selected, .diagnose-patch.selected, .inline-diagnose.selected', main);
    tester.classList.remove('sfdiag-state-neutral','sfdiag-state-pass','sfdiag-state-fail');

    if(!selected){
      tester.classList.add('sfdiag-state-neutral');
      state.textContent = 'READY';
      return;
    }

    const isCorrect = selected.matches('.quiz-answer, .sfv183-answer')
      ? selected.dataset.correct === 'true'
      : selected.dataset.ok === 'false';

    tester.classList.add(isCorrect ? 'sfdiag-state-pass' : 'sfdiag-state-fail');
    state.textContent = isCorrect ? 'PASS' : 'CHECK';
  }

  function activate(){
    if(!isDiagnosisBoard()) return false;
    const main = qs('main.game');
    const board = findBoard();
    const panel = findPlayablePanel(board);
    if(!main || !board || !panel) return false;

    if(main.dataset.sfdiagVersion !== VERSION){
      qsa('[data-sfdiag-decorator]').forEach(el => el.remove());
    }

    main.classList.add('sfdiag-ui-active');
    main.dataset.sfdiagVersion = VERSION;
    board.classList.add('sfdiag-board-shell');
    panel.classList.add('sfdiag-clipboard-panel');
    panel.setAttribute('data-sfdiag-level-id', levelId());
    labelDiagnosis();

    if(!qs('[data-sfdiag-decorator="left"]', board)) board.insertAdjacentHTML('afterbegin', labLeftHtml());
    if(!qs('[data-sfdiag-decorator="right"]', board)) board.insertAdjacentHTML('beforeend', labRightHtml());
    if(!qs('[data-sfdiag-decorator="workflow"]', board)) board.insertAdjacentHTML('beforeend', workflowHtml());
    removeStagnantDiagnosisMonitorImages(board);

    // Old diagnosis side devices live inside the original panel. The universal lab replaces them,
    // but the original playable center column must stay visible and clickable.
    qsa('.sfv175-diagnose-left, .sfv175-diagnose-right, .sfv175-side-device', panel).forEach(el => {
      el.style.display = 'none';
      el.setAttribute('aria-hidden','true');
    });

    // Keep the existing question/answer UI as the real interactive layer.
    qsa('.quiz-answer, .sfv183-answer, .diagnose-patch, .inline-diagnose, #nextQuestionBtn, .sfv183-next-question, button.primary', panel).forEach(el => {
      el.style.pointerEvents = 'auto';
    });

    syncPatchTesterState();
    return true;
  }

  function deactivateIfNeeded(){
    const main = qs('main.game.sfdiag-ui-active');
    if(main && !isDiagnosisBoard()){
      main.classList.remove('sfdiag-ui-active');
      delete main.dataset.sfdiagVersion;
      qsa('[data-sfdiag-decorator]').forEach(el => el.remove());
      qsa('.sfdiag-board-shell,.sfdiag-clipboard-panel').forEach(el => el.classList.remove('sfdiag-board-shell','sfdiag-clipboard-panel'));
    }
  }
  function refresh(){ if(!activate()) deactivateIfNeeded(); }

  window.sfInstallDiagnosisGui = refresh;

  let timer = null;
  function schedule(delay=80){ clearTimeout(timer); timer = setTimeout(refresh, delay); }

  document.addEventListener('DOMContentLoaded', () => schedule(60));
  window.addEventListener('load', () => { schedule(80); setTimeout(refresh, 360); setTimeout(refresh, 900); });
  window.addEventListener('hashchange', () => schedule(100));
  window.addEventListener('popstate', () => schedule(100));
  window.addEventListener('resize', () => schedule(120));
  document.addEventListener('change', event => {
    if(event.target && event.target.matches && event.target.matches('#levelJump,#envJump')) schedule(180);
  }, true);
  document.addEventListener('click', event => {
    if(event.target && event.target.closest && event.target.closest('.quiz-answer, .sfv183-answer, .diagnose-patch, .inline-diagnose, #nextQuestionBtn, .sfv183-next-question')){
      setTimeout(syncPatchTesterState, 40);
      setTimeout(syncPatchTesterState, 260);
      setTimeout(refresh, 320);
    }
  }, true);

  new MutationObserver(() => schedule(110)).observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['class','data-correct','data-ok'] });
  schedule(120);
})();
