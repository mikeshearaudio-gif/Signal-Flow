/* Signal Flow Live Sound SVG Skin v1.8 */
(function(){
  const scriptUrl = document.currentScript && document.currentScript.src ? document.currentScript.src : location.href;
  const ROOT = new URL('../assets/live-sound/svg/', scriptUrl).href;
  const connectorNaturalSizes = {
    'xlr-female': [96, 96],
    'xlr-male': [96, 96],
    'speakon-nl4': [92, 92],
    'powercon-true1': [92, 92],
    'level-knob': [80, 80],
    'amber-lamp': [72, 72],
    'rj45-network': [72, 58],
    'trs-quarter-inch': [64, 64],
    'bnc-antenna': [58, 58],
    'antenna-port': [58, 58]
  };
  const connectorFiles = {
    'xlr-female': 'connectors/xlr-female.svg',
    'xlr-male': 'connectors/xlr-male.svg',
    'speakon-nl4': 'connectors/speakon-nl4.svg',
    'powercon-true1': 'connectors/powercon-true1.svg',
    'level-knob': 'connectors/level-knob.svg',
    'amber-lamp': 'connectors/amber-lamp.svg',
    'rj45-network': 'connectors/rj45-network.svg',
    'trs-quarter-inch': 'connectors/trs-quarter-inch.svg',
    'bnc-antenna': 'connectors/bnc-antenna.svg',
    'antenna-port': 'connectors/antenna-port.svg'
  };
  const cardAssets = [
    {cls: 'live-ui-stagebox', asset: 'hardware/stagebox-snake-head.svg', type: 'stagebox'},
    {cls: 'live-ui-console', asset: 'hardware/foh-console-io-panel.svg', type: 'foh-console'},
    {cls: 'live-ui-rack', asset: 'hardware/system-utility-rack.svg', type: 'utility-rack'},
    {cls: 'live-ui-amp', asset: 'hardware/power-amplifier.svg', type: 'amplifier'},
    {cls: 'live-ui-sources', asset: 'panels/section-stagebox.svg', type: 'source-panel'}
  ];
  const sectionAssets = [
    {match: /stagebox|snake|input/i, asset: 'panels/section-stagebox.svg', tone: 'blue'},
    {match: /console|foh|matrix|aux|record|broadcast|talkback|main output/i, asset: 'panels/section-foh-console.svg', tone: 'blue'},
    {match: /iem|wireless|rf|ear/i, asset: 'panels/section-iem-wireless.svg', tone: 'green'},
    {match: /wedge|monitor/i, asset: 'panels/section-monitor-wedge.svg', tone: 'green'},
    {match: /amp|speaker|pa|sub|fill|delay/i, asset: 'panels/section-power-amplifier.svg', tone: 'red'},
    {match: /utility|system|network|power|processor/i, asset: 'panels/section-utility-rack.svg', tone: 'amber'}
  ];
  let installing = false;

  function wrap(){
    return document.querySelector('#patchbayWrap');
  }
  function currentLevel(){
    try {
      return typeof level === 'function' ? level() : null;
    } catch(err) {
      return null;
    }
  }
  function levelId(){
    const l = currentLevel();
    const selectors = ['#boardSelect', '#boardPicker', '[data-current-board]', '#levelTitle'];
    const domText = selectors.map(sel => document.querySelector(sel)?.value || document.querySelector(sel)?.textContent || '').join(' ');
    return String((l && l.id) || domText || location.hash || '');
  }
  function isTrainingLevel(l){
    const t = l && l.training;
    return !!(t && (t.type || t.quiz || t.buildRoom || t.diagnose));
  }
  function isLiveNormalBoard(){
    const w = wrap();
    const id = levelId();
    const l = currentLevel();
    if(!w) return false;
    const live = /\benv-li(?:ve|v)\b/i.test(w.className) || /^LIV-/i.test(id) || (l && l.environment === 'live');
    if(!live) return false;
    if(/-IR-/i.test(id) || /ir-level-runner/i.test(location.pathname)) return false;
    if(isTrainingLevel(l) || w.querySelector('.training-level-panel, .training-only-game')) return false;
    return !!w.querySelector('.live-ui-board, .live-board, .live-ui-jack');
  }
  function board(){
    const w = wrap();
    return w && (w.querySelector('.live-ui-board, .live-board') || w.querySelector('#patchbay') || w);
  }
  function assetUrl(path){
    return new URL(path, ROOT).href;
  }
  function textOf(el){
    return String(el?.textContent || el?.className || '').trim();
  }
  function addDecorativeImage(parent, className, path){
    let img = parent.querySelector(`:scope > .${className}`);
    if(!img){
      img = document.createElement('img');
      img.className = `${className} sf-live-svg-art`;
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      img.draggable = false;
      parent.prepend(img);
    }
    img.src = assetUrl(path);
    return img;
  }
  function classifySection(el){
    const label = textOf(el);
    return sectionAssets.find(item => item.match.test(label)) || sectionAssets.find(item => item.match.test(el.className));
  }
  function decorateCards(){
    const root = board();
    if(!root) return;
    root.classList.add('sf-live-skinned-board');
    cardAssets.forEach(item => {
      root.querySelectorAll(`.${item.cls}`).forEach(card => {
        if(card.dataset.sfLiveCardSkin === item.type) return;
        card.dataset.sfLiveCardSkin = item.type;
        card.classList.add('sf-live-skinned-card', `sf-live-card-${item.type}`);
        addDecorativeImage(card, 'sf-live-card-art', item.asset);
      });
    });
    root.querySelectorAll('.live-ui-section, .sfv171-wire-section, .wire-section, [data-section]').forEach(section => {
      const found = classifySection(section);
      if(!found || section.dataset.sfLiveSectionSkin === found.tone) return;
      section.dataset.sfLiveSectionSkin = found.tone;
      section.classList.add('sf-live-skinned-section', `sf-live-section-${found.tone}`);
      addDecorativeImage(section, 'sf-live-section-bg', found.asset);
    });
  }
  function connectorType(node, jack){
    const s = `${node || ''} ${jack?.className || ''}`.toLowerCase();
    if(/\b(power|ac|mains)\b/.test(s)) return 'powercon-true1';
    if(/\b(rj45|network|dante|avb|ethernet)\b/.test(s)) return 'rj45-network';
    if(/\b(bnc)\b/.test(s)) return 'bnc-antenna';
    if(/\b(antenna|rf)\b/.test(s)) return 'antenna-port';
    if(/\b(speaker|speakon|amp output|amplifier output|main pa|pa input)\b/.test(s)) return 'speakon-nl4';
    if(/\b(aux|matrix|trs|wedge|fill|sub|delay|talkback)\b/.test(s)) return 'trs-quarter-inch';
    if(/\b(output|send|tx|transmit|program|record|broadcast|main left|main right)\b/.test(s)) return 'xlr-male';
    return 'xlr-female';
  }
  function connectorScale(jack, type){
    const section = jack.closest('.live-ui-section, .live-ui-card, .sfv171-wire-section, .wire-section');
    const label = textOf(section).toLowerCase();
    if(/stagebox|console|input/.test(label)) return type.startsWith('xlr') ? 0.47 : 0.52;
    if(/iem|wireless|system|utility|network/.test(label)) return 0.46;
    if(/amp|speaker|pa|sub|fill|delay|wedge|monitor/.test(label)) return type === 'speakon-nl4' ? 0.54 : 0.48;
    if(jack.classList.contains('pair-left') || jack.classList.contains('pair-right')) return 0.42;
    return type.startsWith('xlr') ? 0.48 : 0.5;
  }
  function decorateJacks(){
    const root = board();
    if(!root) return;
    root.querySelectorAll('.live-ui-jack, .live-photo-jack').forEach(jack => {
      const host = jack.querySelector('.live-ui-jack-hole, .live-photo-target');
      if(!host) return;
      const node = jack.dataset.node || jack.getAttribute('aria-label') || jack.textContent || '';
      const type = connectorType(node, jack);
      const file = connectorFiles[type];
      const size = connectorNaturalSizes[type] || [64, 64];
      const scale = connectorScale(jack, type);
      if(host.dataset.sfLiveConnector === type) return;
      host.dataset.sfLiveConnector = type;
      host.classList.add('sf-live-connector-host');
      jack.classList.add('sf-live-connector-node', `sf-live-connector-${type}`);
      host.style.setProperty('--sf-live-connector-w', `${size[0]}px`);
      host.style.setProperty('--sf-live-connector-h', `${size[1]}px`);
      host.style.setProperty('--sf-live-connector-scale', String(scale));
      host.querySelectorAll('.sf-live-connector-art').forEach(el => el.remove());
      const img = document.createElement('img');
      img.className = `sf-live-connector-art sf-live-svg-art sf-live-connector-art-${type}`;
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      img.draggable = false;
      img.src = assetUrl(file);
      host.appendChild(img);
    });
  }
  function ensureMeters(){
    const root = board();
    if(!root) return null;
    const head = root.querySelector('.live-ui-board-head') || root;
    let rail = head.querySelector(':scope > .sf-live-meter-rail');
    if(!rail){
      rail = document.createElement('div');
      rail.className = 'sf-live-meter-rail';
      rail.setAttribute('aria-hidden', 'true');
      rail.innerHTML = [
        '<div class="sf-live-meter-slot" data-sf-live-meter="rfAf"><img alt="" draggable="false"></div>',
        '<div class="sf-live-meter-slot" data-sf-live-meter="amp"><img alt="" draggable="false"></div>'
      ].join('');
      head.appendChild(rail);
    }
    return rail;
  }
  function validConnections(){
    if(typeof state === 'undefined' || !state || !Array.isArray(state.connections)) return [];
    return state.connections.filter(c => c && c.correct);
  }
  function endpointText(connection){
    return `${connection.a || ''} ${connection.b || ''} ${connection.from || ''} ${connection.to || ''}`;
  }
  function meterStateFromRoutes(){
    const completed = validConnections().map(endpointText).join(' ').toLowerCase();
    return {
      rfAf: /\b(iem|wireless|rf|antenna|earpiece|in-ear|monitor|wedge|cue)\b/.test(completed),
      amp: /\b(amp|amplifier|speaker|speakon|main pa|pa input|sub|fill|delay|system processor|processor output)\b/.test(completed)
    };
  }
  function updateMeters(){
    if(!isLiveNormalBoard()) return;
    const stateByKey = meterStateFromRoutes();
    ensureMeters()?.querySelectorAll('[data-sf-live-meter]').forEach(slot => {
      const key = slot.dataset.sfLiveMeter;
      const active = !!stateByKey[key];
      const file = key === 'amp'
        ? `meters/live-amp-status-${active ? 'active' : 'standby'}.svg`
        : `meters/live-rf-af-meter-${active ? 'active' : 'standby'}.svg`;
      const img = slot.querySelector('img');
      if(img) img.src = assetUrl(file);
      slot.dataset.sfActive = active ? 'true' : 'false';
    });
  }
  function install(){
    if(installing || !isLiveNormalBoard()) return;
    installing = true;
    try {
      decorateCards();
      decorateJacks();
      ensureMeters();
      updateMeters();
    } finally {
      installing = false;
    }
  }
  function queueInstall(){
    requestAnimationFrame(() => {
      install();
      requestAnimationFrame(updateMeters);
    });
  }
  function wrapFunction(name, after){
    const original = window[name];
    if(typeof original !== 'function' || original.__sfLiveSvgSkinWrapped) return;
    const wrapped = function(...args){
      const result = original.apply(this, args);
      after();
      return result;
    };
    wrapped.__sfLiveSvgSkinWrapped = true;
    window[name] = wrapped;
  }
  function hookRuntime(){
    ['renderLevel', 'render', 'startLevelById', 'loadBoardById', 'goToLevel'].forEach(name => wrapFunction(name, queueInstall));
    ['addConnection', 'undo', 'clearConnections', 'clearAllConnections', 'resetLevel'].forEach(name => wrapFunction(name, () => requestAnimationFrame(updateMeters)));
  }

  window.SF_LIVE_SOUND_SVG_SKIN = {
    install,
    updateMeters,
    ROOT,
    connectorNaturalSizes
  };

  hookRuntime();
  const mo = new MutationObserver(queueInstall);
  mo.observe(document.documentElement, {childList: true, subtree: true});
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', queueInstall);
  else queueInstall();
})();
