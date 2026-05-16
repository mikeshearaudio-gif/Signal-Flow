/* Signal Flow Build-a-Room 2.0 UI v6r224
 * Hard takeover generic renderer for training.type === "build-room" or visible build-room panels.
 * Does not skin old DOM; it builds a new board from level().training or old panel data and hides the old lane.
 */
(function(){
  'use strict';
  if(window.sfBuildRoom2UiV6r224Installed) return;
  window.sfBuildRoom2UiV6r224Installed = true;

  const VERSION = '6r224';
  const LOCKER_KEY = 'signal-flow-equipment-locker-v1';
  let activeLevelId = '';
  let activeFilter = 'all';
  let selectedKeys = new Set();
  let lastRenderKey = '';
  let refreshTimer = null;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
  function safeJson(raw, fallback){ try { return raw ? JSON.parse(raw) : fallback; } catch(_) { return fallback; } }
  function readStore(key, fallback){ try { return safeJson(localStorage.getItem(key), fallback); } catch(_) { return fallback; } }
  function writeStore(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); } catch(_) {} }
  function currentLevel(){ try { return typeof level === 'function' ? level() : null; } catch(_) { return null; } }
  function play(name){ try { if(typeof playSfx === 'function') playSfx(name); } catch(_) {} }
  function normalizeKey(s){ return String(s || 'gear').toLowerCase().replace(/owned\s*x\d+/gi,'').replace(/locker\s*x\d+/gi,'').replace(/new\s+\d+\s*credits/gi,'').replace(/\d+\s*credits/gi,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') || 'gear'; }
  function hash(text){ let h = 2166136261; const s = String(text || ''); for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  function normalizeGearDisplayName(label){
    let s = String(label || '').replace(/\s+/g,' ').trim();

    const exact = [
      [/^oversized mixing console$/i, '48x16x4 Broadcast Console'],
      [/^large live console$/i, '32x8x4 Digital Live Console'],
      [/^small mixer$/i, '8x2x2 Analog Mixer'],
      [/^broadcast splitter$/i, '2x8 Broadcast Splitter'],
      [/^speaker processor$/i, '3-Way Crossover'],
      [/^extra reverb processor$/i, 'Stereo Reverb FX Unit'],
      [/^processor$/i, 'Matrix Router'],
      [/^premium interface$/i, '24x24 Studio Interface'],
      [/^rack interface$/i, '8x8 Rack Interface'],
      [/^usb sound card$/i, '2-Channel USB Sound Card'],
      [/^party speaker$/i, 'Consumer Party Speaker'],
      [/^premium monitor pair$/i, '8-inch Studio Monitor Pair'],
      [/^lead vocal mic tie line$/i, 'XLR Cable'],
      [/^lead mic tie line$/i, 'XLR Cable'],
      [/^.*mic tie line$/i, 'XLR Cable'],
      [/^.*tie line$/i, 'XLR Cable'],
      [/^aux(?:iliary)?\s*\d+\s*(?:out|output)$/i, 'TT Patch Cable'],
      [/^aux(?:iliary)?\s*\d+\s*output\s*[lr]?$/i, 'TT Patch Cable'],
      [/^vocal mic$/i, 'Dynamic Cardioid Mic'],
      [/^dynamic vocal mic$/i, 'Dynamic Cardioid Mic'],
      [/^kick drum mic$/i, 'Dynamic Low-Frequency Mic'],
      [/^instrument mic$/i, 'Small Diaphragm Condenser'],
      [/^premium broadcast mic$/i, 'Broadcast Dynamic Mic'],
      [/^reverb unit$/i, 'Stereo Reverb FX Unit'],
      [/^compressor$/i, 'Stereo Compressor'],
      [/^graphic eq$/i, '31-Band Graphic EQ'],
      [/^interface input$/i, '2x2 Interface Input'],
      [/^interface output$/i, '2x2 Interface Output'],
      [/^speaker processor input$/i, '3-Way Crossover Input'],
      [/^speaker processor output$/i, '3-Way Crossover Output']
    ];
    for(const [rx, repl] of exact){ if(rx.test(s)) return repl; }

    s = s
      .replace(/\bAux(?:iliary)?\s*\d+\s*(?:Out|Output)\b/gi, 'TT Patch Cable')
      .replace(/\b[A-Za-z0-9 ]*Mic Tie Line\b/gi, 'XLR Cable')
      .replace(/\bTie Line\b/gi, 'XLR Cable')
      .replace(/\bKick Drum Mic\b/gi, 'Dynamic Low-Frequency Mic')
      .replace(/\bSpeaker Processor\b/gi, '3-Way Crossover')
      .replace(/\bProcessor Rack\b/gi, 'Signal Processor Rack')
      .replace(/\bProcessor\b/gi, 'Matrix Router')
      .replace(/\bLarge Mixer\b/gi, '16x4x2 Live Console')
      .replace(/\bSmall Mixer\b/gi, '8x2x2 Analog Mixer')
      .replace(/\bOversized Console\b/gi, '48x16x4 Broadcast Console')
      .replace(/\bMixing Console\b/gi, '16x4x2 Live Console')
      .replace(/\bMic\b/g, 'Mic')
      .replace(/\bCH\s*(\d+)\b/gi, 'CH $1')
      .replace(/\bVocal\b/gi, '')
      .replace(/\bInstrument\b/gi, '')
      .replace(/\bSpeaker Processor\b/gi, '3-Way Crossover')
      .replace(/\bOversized Mixing Console\b/gi, '48x16x4 Broadcast Console')
      .replace(/\bOversized Console\b/gi, '48x16x4 Broadcast Console')
      .replace(/\s{2,}/g, ' ');

    return s;
  }

  function normalizeNeedDisplayName(label){
    return normalizeGearDisplayName(label)
      .replace(/Select required or acceptable gear/gi,'Choose gear for this slot')
      .replace(/\s*required\s*/gi,' ')
      .replace(/\s+/g,' ')
      .trim();
  }

  function visibleGearStatus(o){
    const owned = ownedQty(o.key);
    if(owned > 0) return { label:'Locker ×' + owned, className:'owned', price:'$0' };
    return { label:'New', className:'new', price:String(o.cost || 0) };
  }

  function fallbackAssetForCategory(category, label){
    const text = String(label || '').toLowerCase();
    if(category === 'mics') return /condenser|side-address|large diaphragm/.test(text) ? '/assets/build-room/svg/boxes/microphone-condenser-green-box-goodstyle.svg' : '/assets/build-room/svg/boxes/microphone-dynamic-orange-box-goodstyle.svg';
    if(category === 'interfaces') return /rack|8x8|24x24/.test(text) ? '/assets/build-room/svg/gear/rack-interface-unit-goodstyle.svg' : '/assets/build-room/svg/gear/desktop-2x2-interface-goodstyle.svg';
    if(category === 'processors'){
      if(/eq/.test(text)) return '/assets/build-room/svg/gear/graphic-eq-rack-unit-goodstyle.svg';
      if(/compress/.test(text)) return '/assets/build-room/svg/gear/fet-compressor-rack-unit-goodstyle.svg';
      if(/reverb|fx|delay/.test(text)) return '/assets/build-room/svg/gear/delay-reverb-open-case-goodstyle.svg';
      return '/assets/build-room/svg/gear/preamp-rack-unit-goodstyle.svg';
    }
    if(category === 'cables') return '/assets/build-room/svg/gear/xlr-adapter-hanging-card-goodstyle.svg';
    if(category === 'speakers') return '/assets/build-room/svg/boxes/monitor-speakers-teal-box-goodstyle.svg';
    if(category === 'consoles') return '/assets/build-room/svg/gear/mixing-console-open-case-goodstyle.svg';
    if(category === 'computers') return '/assets/build-room/svg/gear/desktop-processor-unit-goodstyle.svg';
    return '/assets/build-room/svg/shelves/dimensional-empty-cubby-goodstyle.svg';
  }


  function readLocker(){ const locker = readStore(LOCKER_KEY, { items:{}, history:[] }); locker.items = locker.items || {}; locker.history = Array.isArray(locker.history) ? locker.history : []; return locker; }
  function writeLocker(locker){ writeStore(LOCKER_KEY, locker); }
  function ownedQty(key){ const item = readLocker().items[normalizeKey(key)]; return Number(item && item.qty || 0); }
  function lockerItems(){ return Object.values(readLocker().items || {}).filter(item => Number(item.qty || 0) > 0); }
  function dispatchLockerUpdate(items, levelId){ try { window.dispatchEvent(new CustomEvent('sf-equipment-locker-updated', { detail:{ levelId, items } })); } catch(_) {} try { window.dispatchEvent(new StorageEvent('storage', { key: LOCKER_KEY })); } catch(_) {} }
  function addOwnedGear(items, levelId){
    if(!items.length) return;
    const locker = readLocker();
    items.forEach(item => {
      const key = normalizeKey(item.key || item.label);
      if(!locker.items[key]){
        locker.items[key] = { key, label:item.label || key, qty:0, category:item.category || categoryForLabel(item.label || key), firstLevel:levelId || '', firstAcquiredAt:new Date().toISOString(), useCases:useCasesForCategory(item.category || categoryForLabel(item.label || key)).join('; ') };
      }
      locker.items[key].label = item.label || locker.items[key].label || key;
      locker.items[key].category = item.category || locker.items[key].category || categoryForLabel(item.label || key);
      locker.items[key].qty = Number(locker.items[key].qty || 0) + Number(item.qty || 1);
      locker.items[key].lastLevel = levelId || locker.items[key].lastLevel || '';
      locker.items[key].lastAcquiredAt = new Date().toISOString();
      if(item.asset) locker.items[key].asset = item.asset;
      if(item.useCases) locker.items[key].useCases = item.useCases;
    });
    locker.history.push({ levelId, at:new Date().toISOString(), items });
    writeLocker(locker); dispatchLockerUpdate(items, levelId);
  }

  function ledgerTotals(){
    try { if(typeof sfCompletionLedgerTotals === 'function') return sfCompletionLedgerTotals(); } catch(_) {}
    try { const s = typeof sfLedgerState === 'function' ? sfLedgerState() : (window.sfSignalFlowLedgerState || {}); const totalCredits = Number(s.totalCredits || 0); const spentCredits = Number(s.spentCredits || 0); const availableCredits = Number(s.availableCredits != null ? s.availableCredits : Math.max(0, totalCredits - spentCredits)); return { totalScore:Number(s.totalScore || 0), totalCredits, spentCredits, availableCredits }; } catch(_) { return { totalScore:0,totalCredits:0,spentCredits:0,availableCredits:0 }; }
  }
  function availableCredits(){ try { if(typeof sfBuildRoomAvailableCredits === 'function') return Number(sfBuildRoomAvailableCredits() || 0); } catch(_) {} return Number(ledgerTotals().availableCredits || 0); }
  function dispatchLedger(event){ try { if(typeof sfLedgerDispatch === 'function') return sfLedgerDispatch(event); } catch(err) { console.warn('[Signal Flow] BR2 ledger dispatch failed:', err); } return null; }
  function awardOnce(groupId, score=100, credits=0){ try { if(typeof sfAwardLedgerScoreOnce === 'function') return sfAwardLedgerScoreOnce(groupId, score, credits); } catch(err) { console.warn('[Signal Flow] BR2 award failed:', err); } return null; }

  function categoryForLabel(label){
    const text = String(label || '').toLowerCase();
    if(/mic|microphone|sm57|sm58|podmic|at2020|condenser|dynamic|lav|shotgun|boom|talkback|boundary|kick drum mic|drum mic/.test(text)) return 'mics';
    if(/interface|converter|adac|a\/d|d\/a|scarlett|preamp input|usb audio|dante|madi|adat/.test(text)) return 'interfaces';
    if(/preamp|compress|eq|equalizer|reverb|delay|processor|rack|outboard|encoder|decoder|render|immersive|crossover|matrix router|limiter|de-esser|gate/.test(text)) return 'processors';
    if(/cable|xlr|adapter|di|direct|snake|line|tie|split|loom|trs|tt|patch|aux\s*\d+\s*(out|output)|db25|ethercon|cat5|cat6|aes|ebu|patchbay/.test(text)) return 'cables';
    if(/speaker|monitor|wedge|headphone|cue|iem|pa|line array|subwoofer|nearfield/.test(text)) return 'speakers';
    if(/console|mixer|mix-minus|broadcast|8x2x2|12x4x2|16x4x2|24x8x2|32x8x4|48x16x4/.test(text)) return 'consoles';
    if(/computer|daw|recorder|workstation|laptop|tablet/.test(text)) return 'computers';
    return 'equipment';
  }

  function iconForCategory(category){ return ({mics:'🎙️',interfaces:'🔌',processors:'🎚️',cables:'⛓️',speakers:'🔊',consoles:'🎛️',computers:'💻',equipment:'📦'})[category || 'equipment'] || '📦'; }
  function assetForCategory(category, label){
    /* v6r224: avoid hard-coded rendered-asset paths that can 404 repeatedly.
       Rich rendered assets can still be used when they are present in the locker data,
       while generated gear cards use known Build-a-Room category art as the safe base. */
    return fallbackAssetForCategory(category, label);
  }
  function useCasesForCategory(category){ return ({
    mics:['capture a source at microphone level','match mic type to voice, stage source, or instrument'],
    interfaces:['convert analog audio to/from a computer or recorder','choose enough inputs and outputs for the brief'],
    processors:['route, split, cross over, equalize, or control dynamics','choose the processor by function, not by generic rack name'],
    cables:['complete physical signal paths','match connector type and channel count'],
    speakers:['monitor playback or reinforce room output','choose studio monitors, wedges, PA, or headphones by context'],
    consoles:['mix inputs, buses, auxes, and outputs','console format is shown as inputs x buses x main outputs'],
    computers:['record, edit, render, or play back the final result','receives interface outputs or render returns']
  })[category] || ['general signal-flow equipment']; }
  function baseCostFor(label, category, tag){
    const text = String(label || '').toLowerCase();
    if(tag === 'distractor') return /usb|soundbar|hub|light|plant|tablet/.test(text) ? 15 : 45;
    if(tag === 'overkill') return category === 'consoles' ? 300 : category === 'interfaces' ? 220 : category === 'processors' ? 170 : 150;
    if(category === 'mics') return /condenser|pod|broadcast|sm7|re20|shotgun/.test(text) ? 120 : 70;
    if(category === 'interfaces') return /24|madi|dante/.test(text) ? 240 : /rack|8x8|adat/.test(text) ? 180 : 95;
    if(category === 'processors') return /matrix|multiband|crossover/.test(text) ? 140 : /tube|premium/.test(text) ? 150 : 90;
    if(category === 'speakers') return /pa|party|line array/.test(text) ? 160 : /headphone|cue/.test(text) ? 40 : 130;
    if(category === 'cables') return /snake|db25|loom/.test(text) ? 60 : 15;
    if(category === 'consoles') return /48x16x4/.test(text) ? 360 : /32x8x4|24x8x2/.test(text) ? 280 : /16x4x2/.test(text) ? 220 : 120;
    if(category === 'computers') return 180;
    return 50;
  }

  function roleFromNeed(need, index){ return 'role-' + index + '-' + normalizeKey(need); }
  function option(label, opts={}){ const category = opts.category || categoryForLabel(label); const key = normalizeKey(opts.key || label); const tag = opts.tag || (opts.needed ? 'required' : 'optional'); const displayLabel = normalizeGearDisplayName(label); return { key, label, displayLabel, role:opts.role || '', satisfies:opts.satisfies || '', needed:!!opts.needed, category, tag, cost:Number(opts.cost != null ? opts.cost : baseCostFor(label, category, tag)), asset:opts.asset || assetForCategory(category, displayLabel), fallbackAsset:fallbackAssetForCategory(category, displayLabel), useCases:opts.useCases || useCasesForCategory(category).join('; '), source:opts.source || 'generated' }; }

  const alternativeBank = {
    mics:[
      ['Handheld Dynamic Mic','acceptable',70],
      ['SM57 Dynamic Utility Mic','acceptable',70],
      ['SM58 Dynamic Mic','acceptable',75],
      ['Large Diaphragm Condenser','acceptable',120],
      ['Shotgun Boom Mic','acceptable',130],
      ['Broadcast Dynamic Mic','overkill',180],
      ['RE20 Broadcast Mic','overkill',190],
      ['Small Diaphragm Condenser Pair','overkill',160],
      ['Dynamic Low-Frequency Mic','distractor',65],
      ['Boundary Conference Mic','distractor',80],
      ['USB Podcast Mic','distractor',55],
      ['Camera-Mount Stereo Mic','distractor',45]
    ],
    interfaces:[
      ['2x2 USB Audio Interface','acceptable',95],
      ['4x4 USB Audio Interface','acceptable',130],
      ['8x8 Rack Interface','acceptable',180],
      ['ADAT 8-Channel Expander','acceptable',150],
      ['Dante 16x16 Interface','overkill',260],
      ['24x24 Studio Interface','overkill',240],
      ['MADI PCIe Interface','overkill',300],
      ['2-Channel USB Sound Card','distractor',25],
      ['Bluetooth Audio Receiver','distractor',30]
    ],
    processors:[
      ['Clean Mic Preamp','acceptable',80],
      ['Tube Mic Preamp','acceptable',130],
      ['31-Band Graphic EQ','acceptable',90],
      ['Parametric EQ','acceptable',95],
      ['Stereo Compressor','acceptable',100],
      ['Gate / Expander','acceptable',85],
      ['3-Way Crossover','acceptable',120],
      ['Matrix Router','acceptable',140],
      ['2x6 Speaker Management DSP','acceptable',150],
      ['Multiband Compressor','overkill',170],
      ['Broadcast Loudness Processor','overkill',190],
      ['Stereo Reverb FX Unit','distractor',90],
      ['Guitar Amp Modeler','distractor',100]
    ],
    speakers:[
      ['5-inch Studio Monitor Pair','acceptable',120],
      ['Nearfield Studio Monitor Pair','acceptable',130],
      ['8-inch Studio Monitor Pair','overkill',220],
      ['Cue Headphone Amp','acceptable',70],
      ['Closed-Back Studio Headphones','acceptable',45],
      ['IEM Transmitter Rack','acceptable',150],
      ['Passive Stage Wedge','distractor',100],
      ['Consumer Party Speaker','distractor',85],
      ['Soundbar Speaker','distractor',60],
      ['Powered PA Top Pair','overkill',240]
    ],
    cables:[
      ['XLR Cable Pair','acceptable',20],
      ['Balanced TRS Cable Pair','acceptable',15],
      ['Active DI Box','acceptable',45],
      ['Passive DI Box','acceptable',35],
      ['TT Patch Cable Set','acceptable',25],
      ['TRS Patch Cable Set','acceptable',25],
      ['DB25 Analog Loom','acceptable',65],
      ['AES/EBU Cable Pair','acceptable',35],
      ['ADAT Optical Cable','acceptable',25],
      ['CAT6 etherCON Cable','acceptable',30],
      ['Instrument Cable','distractor',15],
      ['16-Channel Stage Snake','overkill',110],
      ['Unbalanced RCA Cable','distractor',10]
    ],
    consoles:[
      ['8x2x2 Analog Mixer','acceptable',120],
      ['12x4x2 Podcast Mixer','acceptable',160],
      ['16x4x2 Live Console','acceptable',220],
      ['24x8x2 Recording Console','overkill',280],
      ['32x8x4 Digital Live Console','overkill',320],
      ['48x16x4 Broadcast Console','overkill',380],
      ['2-Channel DJ Mixer','distractor',80],
      ['2x8 Broadcast Splitter','acceptable',90]
    ],
    computers:[
      ['Recording Computer / DAW','acceptable',180],
      ['Laptop Recorder','acceptable',140],
      ['Field Recorder','acceptable',120],
      ['Tablet Recorder','distractor',55],
      ['Gaming Laptop','overkill',220]
    ],
    equipment:[
      ['Studio Headphones','acceptable',45],
      ['Mic Stand','acceptable',35],
      ['Boom Arm','acceptable',35],
      ['Shockmount','acceptable',25],
      ['Pop Filter','optional',15],
      ['Reflection Filter','optional',50],
      ['LED Mood Light','distractor',18],
      ['Decor Plant','distractor',10],
      ['USB Hub','distractor',15]
    ]
  };

  function oldPanel(){ return document.querySelector('[data-training-panel="build-room"], .training-level-panel.build-room-panel, .sf-reward-build-room'); }
  function oldPanelItems(panel){
    if(!panel) return [];
    return Array.from(panel.querySelectorAll('.room-gear')).map(btn => {
      const labelEl = btn.querySelector('.room-gear-label');
      const label = (labelEl ? labelEl.textContent : btn.textContent || '').replace(/\d+\s*credits/gi,'').replace(/Owned\s*x\d+.*$/i,'').replace(/Locker\s*x\d+.*$/i,'').trim().replace(/\s+/g,' ');
      return { name:label, needed:btn.dataset.needed === 'true', key:btn.dataset.gearKey || normalizeKey(label), cost:Number(btn.dataset.cost || 0), category:categoryForLabel(label) };
    }).filter(x => x.name);
  }
  function isBuildRoomCandidate(l){ return !!((l && l.training && l.training.type === 'build-room') || oldPanel() || /BUILD THE ROOM|Build-a-Room|Check Room/i.test(document.body.innerText || '')); }
  function levelModel(){
    const l = currentLevel();
    const panel = oldPanel();
    const items = oldPanelItems(panel);
    const title = (l && (l.title || l.id)) || (document.querySelector('.current-level-title, h1, h2') || {}).textContent || 'Build the Room';
    const prompt = (l && l.training && l.training.prompt) || (panel && (panel.querySelector('.sfv166-shop-header strong, strong') || {}).textContent) || 'Choose the equipment needed for this room.';
    let needed = [];
    let distractors = [];
    if(l && l.training && l.training.type === 'build-room'){
      needed = (l.training.needed || []).filter(Boolean).map(String);
      distractors = (l.training.distractors || []).filter(Boolean).map(String);
    }
    if(!needed.length && items.length){ needed = items.filter(x => x.needed).map(x => x.name); distractors = items.filter(x => !x.needed).map(x => x.name); }
    return { id:(l && l.id) || (document.querySelector('[data-current-level-id]') || {}).dataset?.currentLevelId || 'build-room', title, prompt, needed, distractors, sourceItems:items, rawLevel:l };
  }

  function buildOptions(modelInfo){
    const needed = (modelInfo.needed || []).filter(Boolean);
    const distractors = (modelInfo.distractors || []).filter(Boolean);
    const roles = needed.map((need,i) => ({ key:roleFromNeed(need,i), label:need, category:categoryForLabel(need), index:i }));
    const opts = [];
    const sourceByName = new Map((modelInfo.sourceItems || []).map(it => [normalizeKey(it.name), it]));
    roles.forEach(role => {
      const src = sourceByName.get(normalizeKey(role.label));
      opts.push(option(role.label, { role:role.key, satisfies:role.key, needed:true, key:(src && src.key) || role.label, category:role.category, tag:'required', cost:(src && src.cost) || undefined, source:'needed' }));
      const roleText = String(role.label || '').toLowerCase();
      if(/tie line/.test(roleText)){
        opts.push(option('XLR Cable', { role:role.key, satisfies:role.key, category:'cables', tag:'new', cost:20, source:'role-specific' }));
      }
      if(/aux\s*\d+\s*(out|output)|auxiliary\s*\d+\s*(out|output)/.test(roleText)){
        opts.push(option('TT Patch Cable', { role:role.key, satisfies:role.key, category:'cables', tag:'new', cost:15, source:'role-specific' }));
      }
      const bank = alternativeBank[role.category] || alternativeBank.equipment;
      const sorted = [...bank].sort((a,b) => hash(`${modelInfo.id}:${role.key}:${a[0]}`) - hash(`${modelInfo.id}:${role.key}:${b[0]}`));
      sorted.slice(0, 6).forEach(([name, tag, cost]) => { const satisfies = tag === 'distractor' ? '' : role.key; opts.push(option(name, { role:role.key, satisfies, category:role.category, tag:tag === 'acceptable' ? 'new' : tag, cost, source:'alternative' })); });
    });
    distractors.forEach(name => opts.push(option(name, { tag:'distractor', source:'level-distractor' })));
    ['LED Mood Light','Stereo Reverb FX Unit','Consumer Party Speaker','USB Hub','48x16x4 Broadcast Console','Bluetooth Audio Receiver','Unbalanced RCA Cable','Decor Plant'].forEach(name => opts.push(option(name, { tag:/48x16x4/.test(name) ? 'overkill' : 'distractor', source:'generic-distractor' })));
    const seen = new Set();
    const unique = opts.filter(o => { const id = `${o.key}:${o.role}:${o.tag}`; if(seen.has(id)) return false; seen.add(id); return true; });
    unique.forEach(o => { if(ownedQty(o.key) > 0) o.tag = 'owned'; });
    return { roles, options:unique };
  }

  function selectedOptions(model){ return model.options.filter(o => selectedKeys.has(o.key + '|' + o.role)); }
  function selectedId(o){ return o.key + '|' + o.role; }
  function selectedForRole(model, roleKey){ return selectedOptions(model).find(o => o.satisfies === roleKey); }
  function roleSatisfied(model, roleKey){ return !!selectedForRole(model, roleKey); }
  function newPurchases(model){ const used = {}; const purchases = []; selectedOptions(model).forEach(o => { const owned = ownedQty(o.key); const count = used[o.key] || 0; used[o.key] = count + 1; if(count < owned) return; purchases.push({ key:o.key, label:o.label, category:o.category, cost:o.cost, qty:1, asset:o.asset, useCases:o.useCases }); }); return purchases; }
  function buildState(modelInfo, model){ const selected = selectedOptions(model); const missing = model.roles.filter(r => !roleSatisfied(model, r.key)); const purchases = newPurchases(model); const newCost = purchases.reduce((sum,o)=>sum+Number(o.cost||0),0); const credits = availableCredits(); const extra = selected.filter(o => !o.satisfies || !model.roles.some(r => r.key === o.satisfies)); const overkill = selected.filter(o => o.tag === 'overkill'); const distractors = selected.filter(o => o.tag === 'distractor'); const ownedApplied = selected.filter(o => ownedQty(o.key) > 0).length; let grade='Needs Gear', gradeClass='bad', gradeText='Select the required equipment to satisfy the room brief.'; if(!missing.length && newCost <= credits){ if(!extra.length && !overkill.length && !distractors.length){ grade='Ideal Build'; gradeClass='good'; gradeText='All needs satisfied cleanly with no wasted gear.'; } else if(overkill.length || distractors.length){ grade='Approved'; gradeClass='warn'; gradeText='Required gear is present, but the build includes extra or inefficient choices.'; } else { grade='Approved'; gradeClass='good'; gradeText='Required gear is present and budget compliant.'; } } else if(newCost > credits){ grade='Over Budget'; gradeClass='bad'; gradeText=`Need ${newCost - credits} more credits for selected purchases.`; } return { selected, missing, purchases, newCost, credits, remaining:credits-newCost, extra, overkill, distractors, ownedApplied, grade, gradeClass, gradeText }; }



  function scrubBuildRoomSpoilers(){
    const stage = document.getElementById('sf-build-room-2-stage');
    const roots = [stage, ...Array.from(document.querySelectorAll('[data-training-panel="build-room"], .build-room, .build-room-panel, .sf-build-room, .sf-br2-store')).filter(Boolean)];
    const spoilerWords = /\b(REQUIRED|DISTRACTOR|OVERKILL)\b/i;
    roots.forEach(root => {
      if(!root) return;
      root.querySelectorAll('.sf-br2-tag, .gear-badge, .badge, .tag, [class*="badge"], [class*="tag"]').forEach(el => {
        const txt = (el.textContent || '').trim();
        if(spoilerWords.test(txt) && !/LOCKER|OWNED|NEW/i.test(txt)){
          el.setAttribute('aria-hidden','true');
          el.style.display = 'none';
          el.textContent = '';
        }
      });
      root.querySelectorAll('h4 span, .sf-br2-category-title span, .sf-br2-zone span, .sf-br2-check-sub, .sf-br2-gear-name').forEach(el => {
        if(el.dataset.sfBr2Scrubbed === '1') return;
        let txt = el.textContent || '';
        const next = txt
          .replace(/\bdistractors?\s*\/\s*extras?\b/ig, 'available options')
          .replace(/\bchoose as needed\b/ig, 'available options')
          .replace(/\(\s*Required\s*\)/ig, '')
          .replace(/\bRequired\b/ig, '')
          .replace(/\bDistractor\b/ig, '')
          .replace(/\bOverkill\b/ig, '')
          .replace(/\s{2,}/g, ' ')
          .trim();
        if(next && next !== txt){ el.textContent = next; el.dataset.sfBr2Scrubbed = '1'; }
      });
    });
  }

  function findMountTarget(){ const panel = oldPanel(); if(panel && panel.parentElement) return { parent:panel.parentElement, oldPanel:panel }; const cards = Array.from(document.querySelectorAll('main, .play-card, .play-area, .game-shell, .level-play-area')).filter(Boolean); return { parent:cards[0] || document.body, oldPanel:null }; }
  function hideOldPanel(panel){ if(!panel) return; panel.classList.add('sf-build-room-2-hidden'); panel.setAttribute('aria-hidden','true'); Object.assign(panel.style,{display:'none',visibility:'hidden',pointerEvents:'none'}); }
  function assetStackMarkup(o, label, className){
    const primary = o.asset || assetForCategory(o.category, label);
    const fallback = o.fallbackAsset || fallbackAssetForCategory(o.category, label);
    const both = fallback && fallback !== primary;
    return `<span class="${esc(className || 'sf-br2-art-stack')}"><img class="sf-br2-art-primary" src="${esc(primary)}" alt="" onerror="this.style.display='none'">${both ? `<img class="sf-br2-art-support" src="${esc(fallback)}" alt="" onerror="this.style.display='none'">` : ''}</span>`;
  }

  function gearCard(o){
    const id=selectedId(o);
    const selected=selectedKeys.has(id);
    const status=visibleGearStatus(o);
    const label=normalizeGearDisplayName(o.displayLabel || o.label);
    return `<button type="button" class="sf-br2-gear ${selected?'selected':''}" data-br2-gear="${esc(id)}" data-category="${esc(o.category)}" title="${esc(o.useCases)}">${assetStackMarkup(o,label,'sf-br2-art-stack')}<span class="sf-br2-gear-name">${esc(label)}</span><span class="sf-br2-gear-price"><span class="sf-br2-tag ${esc(status.className)}">${esc(status.label)}</span><b>${esc(status.price)}</b></span></button>`;
  }

  function categoryOrder(model){ const order=['mics','interfaces','processors','speakers','cables','consoles','computers','equipment']; return order.filter(cat => model.options.some(o => o.category === cat)); }
  function categoryLabel(cat){ return ({mics:'Mics',interfaces:'Interfaces',processors:'Processors',speakers:'Monitoring',cables:'Cables / DI',consoles:'Consoles',computers:'Computers',equipment:'Accessories'})[cat] || cat; }
  function renderOptions(model){ const cats=categoryOrder(model).filter(cat => activeFilter === 'all' || activeFilter === cat); return cats.map(cat => { const items=model.options.filter(o=>o.category===cat); const roleCount=new Set(items.filter(o=>o.satisfies).map(o=>o.satisfies)).size; return `<section class="sf-br2-category"><h4 class="sf-br2-category-title">${esc(categoryLabel(cat))}<span>available options</span></h4><div class="sf-br2-option-grid">${items.map(gearCard).join('')}</div></section>`; }).join(''); }
  function renderLockerStrip(){ const items=lockerItems().slice(0,6); if(!items.length) return `<div class="sf-br2-locker-row"><div class="sf-br2-locker-item sf-br2-locker-empty">Empty locker</div><div class="sf-br2-locker-item sf-br2-locker-empty">Buy gear</div><div class="sf-br2-locker-item sf-br2-locker-empty">Reuse for $0</div></div>`; return `<div class="sf-br2-locker-row">${items.map(item => `<div class="sf-br2-locker-item"><img src="${esc(item.asset||assetForCategory(item.category,item.label))}" alt="" onerror="this.style.display='none'"><span>${esc(item.label||item.key)}<br>×${Number(item.qty||0)}</span></div>`).join('')}<button type="button" class="sf-br2-locker-item" data-br2-open-locker>View all</button></div>`; }
  function renderZones(model){
    const selected=selectedOptions(model);
    const zones=model.roles.map((r,i)=>{
      const applied=selectedForRole(model,r.key);
      let extraClass=r.category||'equipment';
      if(r.category==='speakers') extraClass += i%2?' right':' left';
      const label=applied?normalizeGearDisplayName(applied.displayLabel || applied.label):normalizeNeedDisplayName(r.label);
      const asset=applied?applied.asset:assetForCategory(r.category,r.label);
      const fallback=applied?(applied.fallbackAsset || fallbackAssetForCategory(applied.category,label)):fallbackAssetForCategory(r.category,r.label);
      return `<div class="sf-br2-zone ${esc(extraClass)} ${applied?'done':''}">${applied?`<img class="asset" src="${esc(asset)}" data-fallback="${esc(fallback)}" alt="" onerror="if(this.dataset.fallback && this.src.indexOf(this.dataset.fallback)<0){this.src=this.dataset.fallback}else{this.style.display='none'}">`:''}<span>${esc(label)}${applied?(ownedQty(applied.key)>0?' · Locker $0':''):''}</span></div>`;
    }).join('');
    const extras=selected.filter(o=>!o.satisfies).slice(0,2).map(o=>{ const label=normalizeGearDisplayName(o.displayLabel || o.label); return `<div class="sf-br2-zone extra ${esc(o.category)}"><img class="asset" src="${esc(o.asset)}" data-fallback="${esc(o.fallbackAsset || fallbackAssetForCategory(o.category,label))}" alt="" onerror="if(this.dataset.fallback && this.src.indexOf(this.dataset.fallback)<0){this.src=this.dataset.fallback}else{this.style.display='none'}"><span>${esc(label)}<br>(Selected)</span></div>`; }).join('');
    return zones+extras;
  }


  function renderStage(modelInfo){
    const model=buildOptions(modelInfo);
    const state=buildState(modelInfo,model);
    const cats=['all',...categoryOrder(model)];
    const title=modelInfo.title || modelInfo.id || 'Build-a-Room';
    const checklist = model.roles.map(r=>{
      const done=roleSatisfied(model,r.key);
      const applied=selectedForRole(model,r.key);
      const roleLabel=normalizeNeedDisplayName(r.label);
      const appliedLabel=applied?normalizeGearDisplayName(applied.displayLabel || applied.label):'Choose gear for this slot';
      return `<div class="sf-br2-check-row ${done?'done':''}"><span class="sf-br2-check-dot"></span><span><span class="sf-br2-check-main">${esc(roleLabel)}</span><span class="sf-br2-check-sub">${esc(appliedLabel)}${applied&&ownedQty(applied.key)>0?' · locker $0':''}</span></span><span class="sf-br2-check-icon">${iconForCategory(r.category)}</span></div>`;
    }).join('');
    return `<section id="sf-build-room-2-stage" class="sf-build-room-2-stage sf-build-room-2-stage-v222" data-sf-br2-level="${esc(modelInfo.id||'')}">
      <div class="sf-br2-topline">
        <div><div class="sf-br2-mode">Build-a-Room 2.0 · ${esc(modelInfo.id||'')}</div><div class="sf-br2-title">${esc(title)}</div></div>
        <div class="sf-br2-meter"><span>Budget</span><strong>${state.credits}</strong></div>
        <div class="sf-br2-meter ${state.newCost>state.credits?'bad':''}"><span>New Spend</span><strong>${state.newCost}</strong></div>
        <div class="sf-br2-meter good"><span>Owned Applied</span><strong>${state.ownedApplied}</strong></div>
      </div>
      <div class="sf-br2-build-floor">
        <aside class="sf-br2-brief-rail">
          <div class="sf-br2-note compact-note"><div class="kicker">Current Level</div><h3>${esc(title)}</h3><p>${esc(modelInfo.prompt || 'Choose gear for the job before anyone starts patching.')}</p></div>
          <div class="sf-br2-checklist"><h4>Build Checklist · ${model.roles.length-state.missing.length} / ${model.roles.length}</h4>${checklist}</div>
          <div class="sf-br2-tip"><h4>Strategy</h4>Use concrete gear choices. Owned locker gear costs <b>$0</b>, but it still has to fit the job.</div>
        </aside>
        <main class="sf-br2-shop-scene" aria-label="Build-a-Room equipment shelves">
          <div class="sf-br2-scene-backdrop" aria-hidden="true"></div>
          <div class="sf-br2-store-head"><h3 class="sf-br2-store-title">Equipment Store</h3><button type="button" class="sf-br2-tab" data-br2-open-locker>Equipment Locker</button></div>
          <div class="sf-br2-tabs">${cats.map(cat=>`<button type="button" class="sf-br2-tab ${activeFilter===cat?'active':''}" data-br2-filter="${esc(cat)}">${esc(cat==='all'?'All':categoryLabel(cat))}</button>`).join('')}</div>
          <div class="sf-br2-options">${renderOptions(model)}</div>
          <div class="sf-br2-selection-strip"><span><strong>${selectedOptions(model).length}</strong> selected</span><span>New spend <strong class="${state.newCost>state.credits?'bad':''}">${state.newCost}</strong></span><span>Remaining <strong class="${state.credits-state.newCost>=0?'good':'bad'}">${Math.max(0,state.credits-state.newCost)}</strong></span><button type="button" data-br2-clear>Clear</button></div>
        </main>
        <aside class="sf-br2-summary-rail">
          <div class="sf-br2-grade ${state.gradeClass}"><b>Grade Preview</b><strong>${esc(state.grade)}</strong><span>${esc(state.gradeText)}</span></div>
          <div class="sf-br2-locker"><h4>Locker Preview · ${lockerItems().length} owned</h4>${renderLockerStrip()}</div>
        </aside>
      </div>
      <div class="sf-br2-actionbar"><button type="button" class="sf-br2-action primary" data-br2-check>Check Room</button><button type="button" class="sf-br2-action" data-br2-reset>Reset Build</button><button type="button" class="sf-br2-action" data-br2-open-locker>Open Locker</button></div>
      <div class="sf-br2-result" aria-live="polite"></div>
    </section>`;
  }

  function showResult(kind,message){ const out=document.querySelector('#sf-build-room-2-stage [data-br2-result]'); if(!out) return; out.className=`sf-br2-result show ${kind||''}`; out.innerHTML=message; out.scrollIntoView({block:'nearest',behavior:'smooth'}); }
  function openLocker(){ try { if(typeof window.sfOpenEquipmentLocker === 'function') return window.sfOpenEquipmentLocker(); } catch(_) {} try { document.getElementById('sf-equipment-locker-open')?.click(); } catch(_) {} }
  function suggestedReplayBoards(modelInfo){ return '<li>Replay earlier completed boards to improve credits.</li>'; }
  function showModal(title,body){ document.querySelectorAll('.sf-br2-modal').forEach(x=>x.remove()); const el=document.createElement('div'); el.className='sf-br2-modal'; el.innerHTML=`<article class="sf-br2-modal-card"><h2>${esc(title)}</h2><p>${body}</p><button type="button" data-close>Close</button></article>`; el.querySelector('[data-close]').onclick=()=>el.remove(); document.body.appendChild(el); }
  function approveBuildRoom(){ const modelInfo=levelModel(); const model=buildOptions(modelInfo); const state=buildState(modelInfo,model); if(state.missing.length){ showResult('bad',`Room is incomplete: ${state.missing.map(r=>esc(normalizeNeedDisplayName(r.label))).join(', ')}.`); play('wrongAnswer'); return; } if(state.newCost>state.credits){ const overBy=state.newCost-state.credits; showResult('bad',`Not enough credits. Need ${overBy} more credits for selected new purchases.`); showModal('Insufficient Credits',`You need ${overBy} more credits before this room can be approved. Owned locker gear costs $0. Replay earlier boards to earn more:<ul>${suggestedReplayBoards(modelInfo)}</ul>`); play('wrongAnswer'); return; } try { if(state.newCost>0){ dispatchLedger({type:'REWARD_SPENT',levelId:modelInfo.id,itemId:'build-room-2-purchase-'+modelInfo.id+'-'+Date.now(),cost:state.newCost}); } addOwnedGear(state.purchases, modelInfo.id); const ideal=state.grade==='Ideal Build'; awardOnce('build-room-2-'+modelInfo.id, ideal?125:100, 0); showResult('good',`Room approved. New purchases: ${state.newCost} credits. Added ${state.purchases.length} new item(s) to Equipment Locker. ${ideal?'Ideal Build bonus earned.':'Approved with room for optimization.'}`); play('rightAnswer'); const panel=oldPanel(); if(panel) panel.dataset.submitted='true'; setTimeout(()=>{ try { if(typeof completeLevel === 'function') completeLevel(); } catch(_){} },800); renderBuildRoom(true); } catch(err){ showResult('bad',esc(err&&err.message?err.message:'Could not approve room.')); play('wrongAnswer'); } }

  function renderBuildRoom(force=false){ const l=currentLevel(); if(!isBuildRoomCandidate(l)){ document.body.classList.remove('sf-build-room-2-active'); const stage=document.getElementById('sf-build-room-2-stage'); if(stage) stage.remove(); activeLevelId=''; lastRenderKey=''; return; } const modelInfo=levelModel(); if(!(modelInfo.needed||[]).length){ return; } const renderKey=`${modelInfo.id}:${activeFilter}:${Array.from(selectedKeys).sort().join(',')}:${lockerItems().length}:${availableCredits()}:${modelInfo.needed.join('|')}`; if(!force && renderKey===lastRenderKey && document.getElementById('sf-build-room-2-stage')){ const p=oldPanel(); if(p) hideOldPanel(p); return; } lastRenderKey=renderKey; if(activeLevelId!==modelInfo.id){ activeLevelId=modelInfo.id; selectedKeys=new Set(); activeFilter='all'; }
    const mount=findMountTarget(); if(!mount.parent) return; let stage=document.getElementById('sf-build-room-2-stage'); if(stage) stage.outerHTML=renderStage(modelInfo); else if(mount.oldPanel) mount.oldPanel.insertAdjacentHTML('beforebegin',renderStage(modelInfo)); else mount.parent.insertAdjacentHTML('afterbegin',renderStage(modelInfo)); if(mount.oldPanel) hideOldPanel(mount.oldPanel); document.body.classList.add('sf-build-room-2-active'); scrubBuildRoomSpoilers(); try { console.log('[Signal Flow] Build-a-Room 2.0 GUI active', VERSION, modelInfo.id); } catch(_) {} }
  function scheduleRender(){ clearTimeout(refreshTimer); refreshTimer=setTimeout(()=>{ renderBuildRoom(false); scrubBuildRoomSpoilers(); },60); }
  function installHandlers(){ document.addEventListener('click',function(ev){ const gear=ev.target&&ev.target.closest?ev.target.closest('[data-br2-gear]'):null; if(gear){ ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation) ev.stopImmediatePropagation(); const id=gear.getAttribute('data-br2-gear'); if(selectedKeys.has(id)) selectedKeys.delete(id); else selectedKeys.add(id); renderBuildRoom(true); return; } const filter=ev.target&&ev.target.closest?ev.target.closest('[data-br2-filter]'):null; if(filter){ ev.preventDefault(); activeFilter=filter.getAttribute('data-br2-filter')||'all'; renderBuildRoom(true); return; } const clear=ev.target&&ev.target.closest?ev.target.closest('[data-br2-clear]'):null; if(clear){ ev.preventDefault(); selectedKeys.clear(); renderBuildRoom(true); return; } const reset=ev.target&&ev.target.closest?ev.target.closest('[data-br2-reset]'):null; if(reset){ ev.preventDefault(); selectedKeys.clear(); renderBuildRoom(true); return; } const check=ev.target&&ev.target.closest?ev.target.closest('[data-br2-check]'):null; if(check){ ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation) ev.stopImmediatePropagation(); approveBuildRoom(); return; } const locker=ev.target&&ev.target.closest?ev.target.closest('[data-br2-open-locker]'):null; if(locker){ ev.preventDefault(); openLocker(); return; } },true); }
  function init(){ installHandlers(); scheduleRender(); [0,50,150,350,750,1500].forEach(ms=>setTimeout(()=>renderBuildRoom(true),ms)); const obs=new MutationObserver(scheduleRender); obs.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','value','data-training-panel','data-board-id']}); window.addEventListener('sf-equipment-locker-updated',()=>renderBuildRoom(true)); window.addEventListener('storage',ev=>{ if(!ev||ev.key===LOCKER_KEY) renderBuildRoom(true); }); setInterval(scheduleRender,900); setInterval(scrubBuildRoomSpoilers,450); console.log('[Signal Flow] Build-a-Room 2.0 UI installed',VERSION); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
