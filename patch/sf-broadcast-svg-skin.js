/* Signal Flow Broadcast Environment SVG Kit v1.2
   Broadcast-only decorative skin for normal patching boards. */
(function(){
  const scriptUrl = document.currentScript?.src || location.href;
  const ROOT = new URL('../assets/broadcast/svg/', scriptUrl).href;
  const METER_IDS = ['cue-monitor', 'talkback', 'output', 'talent-phone', 'stereo'];
  let hooksInstalled = false;
  let installQueued = false;

  function asset(path){ return new URL(path, ROOT).href; }
  function q(sel, root=document){ return root.querySelector(sel); }
  function qa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
  function currentLevel(){
    try{ return typeof level === 'function' ? level() : null; }catch{ return null; }
  }
  function isBroadcastNormalBoard(){
    const wrap = q('#patchbayWrap');
    const l = currentLevel();
    const isBroadcast = !!wrap?.classList.contains('env-broadcast') || /^BRD-/i.test(String(l?.id || location.hash));
    const isTraining = !!document.querySelector('.training-only-game') || !!(typeof trainingModeForLevel === 'function' && l && trainingModeForLevel(l));
    const isIr = /-IR-/i.test(String(l?.id || location.search || location.hash));
    return !!(wrap && isBroadcast && !isTraining && !isIr);
  }
  function findBoard(){
    return q('#patchbayWrap.env-broadcast #patchbay .sfv171-broadcast-board')
      || q('#patchbayWrap.env-broadcast #patchbay .broadcast-board')
      || q('#patchbayWrap.env-broadcast #patchbay .hybrid-board')
      || q('#patchbayWrap.env-broadcast #patchbay');
  }
  function decoImage(path, className){
    const node = document.createElement('img');
    node.src = asset(path);
    node.alt = '';
    node.className = className;
    node.loading = 'eager';
    node.decoding = 'async';
    node.setAttribute('aria-hidden', 'true');
    return node;
  }
  function ensureArtLayer(board){
    let layer = q(':scope > .sf-broadcast-art-layer', board);
    if(!layer){
      layer = document.createElement('div');
      layer.className = 'sf-broadcast-art-layer';
      layer.setAttribute('aria-hidden', 'true');
      board.prepend(layer);
    }
    return layer;
  }
  function sectionShellFor(section){
    const text = String(section.className + ' ' + (section.textContent || '')).toLowerCase();
    if(/talkback|stream|record|air|program output|main program|encoder|transmitter|distribution/.test(text)) return 'panels/row-well-red.svg';
    if(/cue|monitor|ifb/.test(text)) return 'panels/row-well-green.svg';
    if(/phone|remote|codec|comms|talent|earpiece|anchor|guest/.test(text)) return 'panels/row-well-orange.svg';
    if(/console|mix|source|host|microphone|tie line|reporter/.test(text)) return 'panels/row-well-blue.svg';
    return 'panels/row-well-neutral.svg';
  }
  function installSectionShells(board){
    qa('.sfv171-wire-section', board).forEach((section, index) => {
      if(section.dataset.sfBroadcastSkinned === 'true') return;
      section.dataset.sfBroadcastSkinned = 'true';
      section.classList.add('sf-broadcast-section');
      const shell = decoImage(sectionShellFor(section), 'sf-broadcast-svg-deco sf-broadcast-section-shell');
      section.prepend(shell);
    });
  }
  function colorForNode(node){
    const text = String(node.dataset.node || node.textContent || '').toLowerCase();
    if(/talkback|interrupt|producer/.test(text)) return 'blue';
    if(/talent|earpiece|phone|hybrid|remote|codec|anchor|guest/.test(text)) return 'orange';
    if(/stream|record|air|program output|main program|encoder|transmitter|distribution/.test(text)) return 'red';
    if(/cue|ifb|monitor|mix-minus/.test(text)) return 'green';
    return 'gray';
  }
  function decorateJacks(board){
    qa('.jack, .sfv171-wire-node', board).forEach(jack => {
      if(jack.dataset.sfBroadcastJackDecorated === 'true') return;
      jack.dataset.sfBroadcastJackDecorated = 'true';
      jack.classList.add('sf-broadcast-jack-host');
      const socket = q('.sfv171-socket, .port-socket, .live-ui-jack-hole', jack) || jack;
      socket.classList.add('sf-broadcast-socket-art-host');
      socket.append(
        decoImage(`jacks/jack-${colorForNode(jack)}-standby.svg`, 'sf-broadcast-jack-art'),
        decoImage('overlays/jack-active-ring.svg', 'sf-broadcast-active-ring')
      );
    });
  }
  function ensureMeters(board){
    let rail = q('.sf-broadcast-meter-rail', board);
    if(rail) return rail;
    rail = document.createElement('div');
    rail.className = 'sf-broadcast-meter-rail';
    rail.setAttribute('aria-hidden', 'true');
    METER_IDS.forEach(id => {
      const slot = document.createElement('div');
      slot.className = 'sf-broadcast-meter-slot';
      slot.dataset.sfMeterId = id;
      slot.dataset.sfActive = 'false';
      slot.append(
        decoImage(`meters/meter-${id}-standby.svg`, 'sf-meter-standby'),
        decoImage(`meters/meter-${id}-active.svg`, 'sf-meter-active')
      );
      rail.appendChild(slot);
    });
    const head = q('.sfv171-wire-head', board);
    if(head) head.appendChild(rail);
    else board.prepend(rail);
    return rail;
  }
  function endpointText(connection){
    return [connection.from, connection.to, connection.signalFrom, connection.signalTo]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
  }
  function routeDestination(connection){
    return String(connection.signalTo || connection.to || '').toLowerCase();
  }
  function sideInfo(value){
    const text = String(value || '');
    if(/\b(left|l)\b/i.test(text) || /\bL\b/.test(text)) return 'L';
    if(/\b(right|r)\b/i.test(text) || /\bR\b/.test(text)) return 'R';
    return '';
  }
  function stereoBase(value){
    return String(value || '')
      .toLowerCase()
      .replace(/\b(left|right)\b/g, '')
      .replace(/\b[lr]\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function hasCompletedStereoPair(connections){
    const pairs = new Map();
    connections.forEach(c => {
      const fromSide = sideInfo(c.signalFrom || c.from);
      const toSide = sideInfo(c.signalTo || c.to);
      const side = fromSide || toSide;
      if(!side) return;
      const key = `${stereoBase(c.signalFrom || c.from)} -> ${stereoBase(c.signalTo || c.to)}`;
      if(!pairs.has(key)) pairs.set(key, new Set());
      pairs.get(key).add(side);
    });
    return Array.from(pairs.values()).some(sides => sides.has('L') && sides.has('R'));
  }
  function completedConnections(){
    try{
      if(typeof state !== 'undefined' && state?.connections){
        return state.connections.filter(c => c && c.correct);
      }
    }catch{}
    return [];
  }
  function setMeter(id, active){
    qa(`.sf-broadcast-meter-slot[data-sf-meter-id="${id}"]`).forEach(slot => {
      slot.dataset.sfActive = active ? 'true' : 'false';
    });
  }
  function updateBroadcastMetersFromState(){
    if(!isBroadcastNormalBoard()) return;
    const completed = completedConnections();
    const active = {
      'cue-monitor': completed.some(c => /cue|ifb|monitor input|program input/.test(routeDestination(c))),
      talkback: completed.some(c => /talkback|interrupt/.test(endpointText(c))),
      output: completed.some(c => /stream|record|air|program output|main program|encoder|transmitter|distribution|output/.test(routeDestination(c))),
      'talent-phone': completed.some(c => /earpiece|talent|phone|hybrid|remote|codec|anchor|guest/.test(routeDestination(c))),
      stereo: hasCompletedStereoPair(completed)
    };
    METER_IDS.forEach(id => setMeter(id, !!active[id]));
  }
  function installBroadcastEnvironmentSkin(){
    installQueued = false;
    if(!isBroadcastNormalBoard()) return;
    const board = findBoard();
    if(!board) return;
    const wrap = q('#patchbayWrap');
    wrap?.classList.add('sf-broadcast-svg-active');
    board.classList.add('sf-broadcast-skinned');
    ensureArtLayer(board);
    installSectionShells(board);
    decorateJacks(board);
    ensureMeters(board);
    updateBroadcastMetersFromState();
  }
  function queueInstall(){
    if(installQueued) return;
    installQueued = true;
    requestAnimationFrame(installBroadcastEnvironmentSkin);
  }
  function afterStateChange(){
    queueInstall();
    requestAnimationFrame(updateBroadcastMetersFromState);
  }
  function wrapFunction(name, after){
    const fn = window[name];
    if(typeof fn !== 'function' || fn.__sfBroadcastWrapped) return;
    const wrapped = function(...args){
      const result = fn.apply(this, args);
      after();
      return result;
    };
    wrapped.__sfBroadcastWrapped = true;
    window[name] = wrapped;
  }
  function installHooks(){
    if(hooksInstalled) return;
    hooksInstalled = true;
    ['render', 'renderRoute', 'renderLevel', 'startLevelById', 'navigateTo'].forEach(name => wrapFunction(name, queueInstall));
    ['addConnection', 'undo', 'clearConnections'].forEach(name => wrapFunction(name, afterStateChange));
  }

  window.SF_BROADCAST_SVG_SKIN = {
    install: installBroadcastEnvironmentSkin,
    updateMeters: updateBroadcastMetersFromState,
    setMeter
  };

  document.addEventListener('DOMContentLoaded', () => {
    installHooks();
    queueInstall();
  });
  window.addEventListener('hashchange', () => setTimeout(queueInstall, 80));
  installHooks();
  queueInstall();

  const mo = new MutationObserver(() => {
    if(isBroadcastNormalBoard()) queueInstall();
  });
  mo.observe(document.documentElement, {childList:true, subtree:true});
})();
