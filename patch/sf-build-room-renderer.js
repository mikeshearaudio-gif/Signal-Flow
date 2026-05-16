/* Signal Flow Build-a-Room consolidated renderer v6r226
 * Single owner for Build-a-Room UI + Equipment Locker.
 * Generated from level().training data and a scanned asset manifest.
 */
(function(){
  'use strict';
  if(window.sfBuildRoomRendererV6r226Installed) return;
  window.sfBuildRoomRendererV6r226Installed = true;

  // Suppress previously layered Build-a-Room / Locker patch scripts if any stale references remain.
  [
    'sfBuildRoom2UiV6r217Installed','sfBuildRoom2UiV6r218Installed','sfBuildRoom2UiV6r219Installed','sfBuildRoom2UiV6r220Installed','sfBuildRoom2UiV6r221Installed','sfBuildRoom2UiV6r222Installed','sfBuildRoom2UiV6r223Installed','sfBuildRoom2UiV6r224Installed',
    'sfBuildRoomLockerIntegrationV6r216Installed',
    'sfEquipmentLockerUiV6r215Installed','sfEquipmentLockerUiV6r216Installed','sfEquipmentLockerUiV6r217Installed','sfEquipmentLockerUiV6r218Installed','sfEquipmentLockerUiV6r219Installed','sfEquipmentLockerUiV6r220Installed','sfEquipmentLockerUiV6r221Installed','sfEquipmentLockerUiV6r222Installed','sfEquipmentLockerUiV6r223Installed','sfEquipmentLockerUiV6r224Installed',
    'sfLockerUiV221CaptureInstalled'
  ].forEach(k => { try { window[k] = true; } catch(_) {} });

  const VERSION = '6r226';
  const LOCKER_KEY = 'signal-flow-equipment-locker-v1';
  const MANIFEST_URL = '/assets/build-room/build-room-asset-manifest.json?v=6r226';
  const FALLBACK_SHELF = '/assets/build-room/svg/shelves/right-pegboard-shelf-bay-goodstyle.svg';

  let assetManifest = null;
  let assetManifestLoaded = false;
  let activeLevelId = '';
  let activeFilter = 'all';
  let selectedKeys = new Set();
  let lastRenderKey = '';
  let lastLoggedLevel = '';
  let refreshTimer = null;
  let lockerFilter = 'all';
  let selectedLockerKey = '';

  const CATEGORY_ORDER = ['mics','interfaces','processors','monitoring','cables','consoles','computers','accessories'];
  const CATEGORY_LABELS = {
    all:'All', mics:'Mics', interfaces:'Interfaces', processors:'Processors', monitoring:'Monitoring',
    cables:'Cables / DI', consoles:'Consoles', computers:'Computers', accessories:'Accessories', equipment:'Equipment'
  };
  const ICONS = {mics:'🎙️', interfaces:'🔌', processors:'🎚️', cables:'🔗', monitoring:'🔊', consoles:'🎛️', computers:'💻', accessories:'📦', equipment:'📦'};

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
  function safeJson(raw, fallback){ try { return raw ? JSON.parse(raw) : fallback; } catch(_) { return fallback; } }
  function readStore(key, fallback){ try { return safeJson(localStorage.getItem(key), fallback); } catch(_) { return fallback; } }
  function writeStore(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); } catch(_) {} }
  function currentLevel(){ try { return typeof level === 'function' ? level() : null; } catch(_) { return null; } }
  function play(name){ try { if(typeof playSfx === 'function') playSfx(name); } catch(_) {} }
  function normalizeKey(s){ return String(s || 'gear').toLowerCase().replace(/owned\s*x\d+/gi,'').replace(/locker\s*x\d+/gi,'').replace(/new\s+\d+\s*credits/gi,'').replace(/\d+\s*credits/gi,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') || 'gear'; }
  function readLocker(){ const locker=readStore(LOCKER_KEY,{items:{},history:[]}); locker.items=locker.items||{}; locker.history=Array.isArray(locker.history)?locker.history:[]; return locker; }
  function writeLocker(locker){ writeStore(LOCKER_KEY,locker); try{window.dispatchEvent(new CustomEvent('sf-equipment-locker-updated',{detail:{source:'sf-build-room-renderer',version:VERSION}}));}catch(_){} }
  function ownedQty(key){ const item=readLocker().items[normalizeKey(key)]; return Number(item&&item.qty||0); }
  function lockerItems(){ return Object.values(readLocker().items||{}).filter(x=>Number(x.qty||0)>0); }
  function ledgerTotals(){
    try{ if(typeof sfCompletionLedgerTotals==='function') return sfCompletionLedgerTotals(); }catch(_){}
    try{ const s=typeof sfLedgerState==='function'?sfLedgerState():(window.sfSignalFlowLedgerState||{}); const totalCredits=Number(s.totalCredits||0); const spentCredits=Number(s.spentCredits||0); const availableCredits=Number(s.availableCredits!=null?s.availableCredits:Math.max(0,totalCredits-spentCredits)); return {totalScore:Number(s.totalScore||0),totalCredits,spentCredits,availableCredits}; }catch(_){ return {totalScore:0,totalCredits:0,spentCredits:0,availableCredits:0}; }
  }
  function availableCredits(){ try{ if(typeof sfBuildRoomAvailableCredits==='function') return Number(sfBuildRoomAvailableCredits()||0); }catch(_){} return Number(ledgerTotals().availableCredits||0); }
  function dispatchLedger(event){ try{ if(typeof sfLedgerDispatch==='function') return sfLedgerDispatch(event); }catch(err){ console.warn('[Signal Flow] Build-a-Room ledger dispatch failed:',err); } return null; }
  function awardOnce(groupId, score=100, credits=0){ try{ if(typeof sfAwardLedgerScoreOnce==='function') return sfAwardLedgerScoreOnce(groupId,score,credits); }catch(err){ console.warn('[Signal Flow] Build-a-Room award failed:',err); } return null; }

  function loadAssetManifest(){
    if(assetManifestLoaded) return Promise.resolve(assetManifest);
    assetManifestLoaded = true;
    return fetch(MANIFEST_URL, {cache:'no-store'})
      .then(r => r.ok ? r.json() : null)
      .then(data => { assetManifest = data || {assets:[]}; return assetManifest; })
      .catch(() => { assetManifest = {assets:[]}; return assetManifest; });
  }
  function manifestAssets(){ return assetManifest && Array.isArray(assetManifest.assets) ? assetManifest.assets : []; }
  function scoreAsset(path, terms){
    const p = String(path||'').toLowerCase();
    let score = 0;
    for(const t of terms){ if(t && p.includes(t)) score += 1; }
    return score;
  }
  function assetFor(label, category){
    const assets = manifestAssets();
    if(!assets.length) return '';
    const text = String(label||'').toLowerCase();
    let terms = [];
    if(category === 'mics') terms = ['mic','microphone', text.includes('condenser')?'condenser':'', text.includes('dynamic')?'dynamic':''];
    else if(category === 'interfaces') terms = ['interface','redbox','converter','io','2x2','rack'];
    else if(category === 'processors') terms = ['preamp','compressor','eq','reverb','crossover','processor','rack','outboard'];
    else if(category === 'monitoring') terms = ['monitor','speaker','headphone','iem','beltpack'];
    else if(category === 'cables') terms = ['cable','xlr','patch','tt','di','loom','adapter'];
    else if(category === 'consoles') terms = ['console','mixer','mixing'];
    else if(category === 'computers') terms = ['computer','daw','recorder','workstation'];
    else terms = ['gear','box','cubby'];
    const words = text.split(/[^a-z0-9]+/).filter(w => w.length > 2 && !['the','and','for','with'].includes(w));
    terms = [...terms, ...words.slice(0,4)].filter(Boolean);
    let best = '', bestScore = 0;
    for(const a of assets){ const s = scoreAsset(a.path || a, terms); if(s > bestScore){ bestScore = s; best = a.path || a; } }
    return bestScore > 0 ? best : '';
  }
  function shelfAsset(){
    const assets = manifestAssets();
    const found = assets.find(a => /shelves\/.*(pegboard|shelf|bay|cubby)/i.test(a.path||a));
    return (found && (found.path||found)) || FALLBACK_SHELF;
  }

  function normalizeGearDisplayName(label){
    let s = String(label || '').replace(/\s+/g,' ').trim();
    const exact = [
      [/^.*mic tie line$/i,'XLR Cable'], [/^.*tie line$/i,'XLR Cable'], [/^tie line$/i,'XLR Cable'],
      [/^aux(?:iliary)?\s*\d+\s*(?:out|output)\s*[lr]?$/i,'TT Patch Cable'], [/^aux(?:iliary)?\s*\d+\s*output$/i,'TT Patch Cable'],
      [/^speaker processor$/i,'3-Way Crossover'], [/^system processor$/i,'Matrix Router'], [/^processor$/i,'Matrix Router'],
      [/^oversized mixing console$/i,'48x16x4 Broadcast Console'], [/^large live console$/i,'32x8x4 Digital Live Console'], [/^small mixer$/i,'8x2x2 Analog Mixer'], [/^mixing console$/i,'16x4x2 Live Console'],
      [/^vocal mic$/i,'Dynamic Cardioid Mic'], [/^lead vocal mic$/i,'Dynamic Cardioid Mic'], [/^dynamic vocal mic$/i,'Dynamic Cardioid Mic'], [/^instrument mic$/i,'Small Diaphragm Condenser'], [/^kick drum mic$/i,'Dynamic Low-Frequency Mic'],
      [/^reverb unit$/i,'Stereo Reverb FX Unit'], [/^compressor$/i,'Stereo Compressor'], [/^graphic eq$/i,'31-Band Graphic EQ']
    ];
    for(const [rx,repl] of exact){ if(rx.test(s)) return repl; }
    return s
      .replace(/\b[A-Za-z0-9 ]*Mic Tie Line\b/gi,'XLR Cable')
      .replace(/\bTie Line\b/gi,'XLR Cable')
      .replace(/\bAux(?:iliary)?\s*\d+\s*(?:Out|Output)\s*[LR]?\b/gi,'TT Patch Cable')
      .replace(/\bSpeaker Processor\b/gi,'3-Way Crossover')
      .replace(/\bSystem Processor\b/gi,'Matrix Router')
      .replace(/\bOversized Mixing Console\b/gi,'48x16x4 Broadcast Console')
      .replace(/\bOversized Console\b/gi,'48x16x4 Broadcast Console')
      .replace(/\bLarge Mixer\b/gi,'16x4x2 Live Console')
      .replace(/\bSmall Mixer\b/gi,'8x2x2 Analog Mixer')
      .replace(/\bVocal\b/gi,'')
      .replace(/\bInstrument\b/gi,'')
      .replace(/\bKick Drum Mic\b/gi,'Dynamic Low-Frequency Mic')
      .replace(/\bProcessor\b/gi,'Matrix Router')
      .replace(/\s{2,}/g,' ')
      .trim();
  }
  function categoryForLabel(label){
    const text=String(label||'').toLowerCase();
    if(/mic|microphone|sm57|sm58|condenser|dynamic|lav|shotgun|talkback|boundary/.test(text)) return 'mics';
    if(/interface|converter|adac|a\/d|d\/a|dante|madi|adat|i\/o|2x2|8x8|24x24/.test(text)) return 'interfaces';
    if(/preamp|compress|eq|equalizer|reverb|delay|processor|rack|outboard|encoder|decoder|render|crossover|matrix|limiter|gate|expander|loudness/.test(text)) return 'processors';
    if(/cable|xlr|adapter|di|direct|snake|line|tie|split|loom|trs|tt|patch|aux\s*\d+\s*(out|output)|db25|ethercon|cat5|cat6|aes|ebu|patchbay/.test(text)) return 'cables';
    if(/speaker|monitor|wedge|headphone|cue|iem|pa|line array|subwoofer|nearfield/.test(text)) return 'monitoring';
    if(/console|mixer|mix-minus|broadcast|8x2x2|12x4x2|16x4x2|24x8x2|32x8x4|48x16x4/.test(text)) return 'consoles';
    if(/computer|daw|recorder|workstation|laptop|tablet/.test(text)) return 'computers';
    return 'accessories';
  }
  function iconForCategory(category){ return ICONS[category] || ICONS.equipment; }
  function useCasesForCategory(category){ return ({
    mics:'Capture microphone-level sources. Choose pattern, output level, and practical context from the brief.',
    interfaces:'Convert analog audio to and from recorders, computers, or playback systems.',
    processors:'Shape, split, route, cross over, equalize, or control dynamics by function.',
    cables:'Complete physical patch paths. Match connector type and signal format.',
    monitoring:'Provide studio monitoring, cue monitoring, foldback, or playback checks.',
    consoles:'Mix inputs, auxes, buses, subgroups, and main outputs. Console format matters.',
    computers:'Record, edit, render, or play back final outputs and stems.',
    accessories:'Support the room build without necessarily completing the signal chain.'
  })[category] || 'General production equipment.'; }
  function baseCost(label, category, tag){
    const text=String(label||'').toLowerCase();
    if(tag==='distractor') return /usb|soundbar|hub|light|plant|tablet/.test(text)?15:45;
    if(tag==='overkill') return category==='consoles'?300:category==='interfaces'?220:category==='processors'?170:150;
    if(category==='mics') return /condenser|broadcast|re20|shotgun/.test(text)?120:70;
    if(category==='interfaces') return /24|madi|dante/.test(text)?240:/rack|8x8|adat/.test(text)?180:95;
    if(category==='processors') return /matrix|multiband|crossover/.test(text)?140:/tube|premium/.test(text)?150:90;
    if(category==='monitoring') return /pa|party|line array/.test(text)?160:/headphone|cue/.test(text)?40:130;
    if(category==='cables') return /snake|db25|loom/.test(text)?60:15;
    if(category==='consoles') return /48x16x4/.test(text)?360:/32x8x4|24x8x2/.test(text)?280:/16x4x2/.test(text)?220:120;
    if(category==='computers') return 180;
    return 50;
  }
  function option(label, opts={}){
    const displayLabel = normalizeGearDisplayName(label);
    const category = opts.category || categoryForLabel(displayLabel);
    const key = normalizeKey(opts.key || displayLabel);
    return { key, label:displayLabel, category, role:opts.role||'', satisfies:opts.satisfies||'', tag:opts.tag||'optional', cost:Number(opts.cost != null ? opts.cost : baseCost(displayLabel,category,opts.tag||'optional')), asset:opts.asset||'', useCases:opts.useCases||useCasesForCategory(category) };
  }

  const BANK = {
    mics:[['Handheld Dynamic Mic','acceptable',70],['SM57 Dynamic Utility Mic','acceptable',70],['SM58 Dynamic Mic','acceptable',75],['Large Diaphragm Condenser','acceptable',120],['Small Diaphragm Condenser Pair','acceptable',160],['Shotgun Boom Mic','acceptable',130],['Broadcast Dynamic Mic','overkill',180],['RE20 Broadcast Mic','overkill',190],['Dynamic Low-Frequency Mic','distractor',65],['Boundary Conference Mic','distractor',80],['USB Podcast Mic','distractor',55]],
    interfaces:[['2x2 USB Audio Interface','acceptable',95],['4x4 USB Audio Interface','acceptable',130],['8x8 Rack Interface','acceptable',180],['ADAT 8-Channel Expander','acceptable',150],['Dante 16x16 Interface','overkill',260],['24x24 Studio Interface','overkill',240],['2-Channel USB Sound Card','distractor',25]],
    processors:[['Clean Mic Preamp','acceptable',80],['Tube Mic Preamp','acceptable',130],['31-Band Graphic EQ','acceptable',90],['Parametric EQ','acceptable',95],['Stereo Compressor','acceptable',100],['Gate / Expander','acceptable',85],['3-Way Crossover','acceptable',120],['Matrix Router','acceptable',140],['2x6 Speaker Management DSP','acceptable',150],['Multiband Compressor','overkill',170],['Broadcast Loudness Processor','overkill',190],['Stereo Reverb FX Unit','distractor',90],['Guitar Amp Modeler','distractor',100]],
    cables:[['XLR Cable','acceptable',15],['TT Patch Cable','acceptable',15],['TRS Patch Cable','acceptable',15],['DB25 Analog Loom','acceptable',60],['AES/EBU Cable Pair','acceptable',35],['EtherCON Stage Cable','acceptable',45],['Consumer 3.5 mm Cable','distractor',10]],
    monitoring:[['5-inch Studio Monitor Pair','acceptable',120],['Nearfield Studio Monitor Pair','acceptable',130],['8-inch Studio Monitor Pair','overkill',220],['Cue Headphone Amp','acceptable',70],['Closed-Back Studio Headphones','acceptable',45],['IEM Transmitter Rack','acceptable',150],['Passive Stage Wedge','distractor',100],['Consumer Party Speaker','distractor',85]],
    consoles:[['8x2x2 Analog Mixer','acceptable',120],['12x4x2 Podcast Mixer','acceptable',150],['16x4x2 Live Console','acceptable',220],['24x8x2 Recording Console','overkill',280],['32x8x4 Digital Live Console','overkill',300],['48x16x4 Broadcast Console','overkill',360],['DJ Mixer','distractor',90]],
    computers:[['DAW Workstation','acceptable',180],['Laptop Recorder','acceptable',140],['Print Recorder','acceptable',120],['Tablet Playback Device','distractor',45]],
    accessories:[['Pop Filter','optional',15],['Mic Boom Arm','optional',35],['Mic Stand','acceptable',30],['USB Hub','distractor',15],['LED Mood Light','distractor',18]]
  };

  function roleId(label, i){ return 'role-'+i+'-'+normalizeKey(normalizeGearDisplayName(label)); }
  function buildModelInfo(){
    const l=currentLevel();
    if(!l) return null;
    const t=l.training||{};
    if(t.type !== 'build-room' && !String(document.body.innerText||'').includes('[BUILD]')) return null;
    const needed = Array.isArray(t.needed) ? t.needed.slice() : [];
    const distractors = Array.isArray(t.distractors) ? t.distractors.slice() : [];
    if(!needed.length && Array.isArray(l.required)){
      l.required.forEach(pair => { if(Array.isArray(pair)){ needed.push(pair[0]); needed.push(pair[1]); } });
    }
    return { id:l.id||'', environment:l.environment||'', title:l.title||'', prompt:t.prompt||'Choose the equipment needed for this job before anyone starts patching.', brief:l.brief||'', learning:l.learning||[], needed, distractors };
  }
  function buildOptions(info){
    const seen = new Map();
    const roles = info.needed.map((need,i)=>({ key:roleId(need,i), label:normalizeGearDisplayName(need), raw:need, category:categoryForLabel(normalizeGearDisplayName(need)) }));
    function add(o){ const k=o.key+'::'+(o.role||''); if(!seen.has(k)){ const withAsset={...o}; withAsset.asset = assetFor(withAsset.label, withAsset.category); seen.set(k,withAsset); } }
    roles.forEach(role => {
      add(option(role.label,{role:role.key,satisfies:role.key,tag:'required',category:role.category}));
      const bank = BANK[role.category] || BANK.accessories;
      bank.slice(0,7).forEach((row,idx)=>{
        const [name,tag,cost]=row;
        add(option(name,{role:tag==='distractor'?'' : role.key, satisfies:tag==='distractor'?'':role.key, tag, cost, category:categoryForLabel(name)}));
      });
    });
    (info.distractors||[]).forEach(d => add(option(d,{tag:'distractor',category:categoryForLabel(d)})));
    CATEGORY_ORDER.forEach(cat => (BANK[cat]||[]).slice(0,4).forEach(row => add(option(row[0],{tag:row[1],cost:row[2],category:cat}))));
    return { roles, options:Array.from(seen.values()) };
  }
  function selectedOptions(model){ return model.options.filter(o=>selectedKeys.has(o.key)); }
  function selectedForRole(model, roleKey){ return selectedOptions(model).find(o=>o.satisfies===roleKey || o.role===roleKey) || null; }
  function stateFor(info, model){
    const selected=selectedOptions(model);
    const missing=model.roles.filter(r=>!selectedForRole(model,r.key));
    const purchases=selected.filter(o=>ownedQty(o.key)<=0);
    const ownedApplied=selected.length-purchases.length;
    const newCost=purchases.reduce((sum,o)=>sum+Number(o.cost||0),0);
    const credits=availableCredits();
    const extras=selected.filter(o=>!o.satisfies && !model.roles.some(r=>r.key===o.role));
    let grade='Needs Gear', gradeClass='bad', gradeText=missing.length?('Missing '+missing.length+' slot'+(missing.length===1?'':'s')+'.'):'Ready';
    if(!missing.length){ if(newCost>credits){grade='Over Budget';gradeClass='bad';gradeText='Need '+(newCost-credits)+' more credits.';} else if(extras.length){grade='Approved';gradeClass='ok';gradeText='Required gear selected. Extra choices may reduce bonus later.';} else {grade='Ideal Build';gradeClass='good';gradeText='Required gear selected with no visible waste.';} }
    return {selected,missing,purchases,ownedApplied,newCost,credits,extras,grade,gradeClass,gradeText};
  }

  function findBoardMount(){
    return document.querySelector('.training-only-board.board-card') || document.querySelector('.training-only-board') || document.querySelector('.board-card') || document.querySelector('main.game') || document.body;
  }
  function hideOldBuildDom(){
    document.querySelectorAll('[data-training-panel="build-room"], .inline-build-room-list, .sf-build-room-2-stage, .sf-br2-modal').forEach(el=>{ if(el.id!=='sf-build-room-renderer') el.style.display='none'; });
  }
  function renderCard(o){
    const owned=ownedQty(o.key); const selected=selectedKeys.has(o.key);
    const status=owned>0?`Locker ×${owned}`:'New'; const badgeCls=owned>0?'owned':'new'; const price=owned>0?'$0':String(o.cost||0);
    const art=o.asset?`<img src="${esc(o.asset)}" alt="" loading="lazy" decoding="async">`:`<span class="sf-broom-icon">${iconForCategory(o.category)}</span>`;
    return `<button type="button" class="sf-broom-card ${selected?'selected':''}" data-broom-gear="${esc(o.key)}" title="${esc(o.useCases||'')}"><div class="sf-broom-art">${art}</div><b>${esc(o.label)}</b><div class="meta"><span class="sf-broom-badge ${badgeCls}">${esc(status)}</span><span class="sf-broom-price">${esc(price)}</span></div></button>`;
  }
  function renderOptions(model){
    const cats = CATEGORY_ORDER.filter(c=>model.options.some(o=>o.category===c));
    const active = activeFilter==='all'?'all':activeFilter;
    return cats.map(cat => {
      if(active !== 'all' && active !== cat) return '';
      const cards=model.options.filter(o=>o.category===cat).map(renderCard).join('');
      if(!cards) return '';
      return `<div class="sf-broom-section-title">${esc(CATEGORY_LABELS[cat]||cat)}</div><div class="sf-broom-grid">${cards}</div>`;
    }).join('');
  }
  function renderStage(info, model, state){
    const cats=['all',...CATEGORY_ORDER.filter(c=>model.options.some(o=>o.category===c))];
    const checklist=model.roles.map(r=>{ const applied=selectedForRole(model,r.key); const done=!!applied; return `<div class="sf-broom-need ${done?'done':''}"><span class="sf-broom-dot"></span><span><b>${esc(r.label)}</b><small>${applied?esc(applied.label)+(ownedQty(applied.key)>0?' · locker $0':''):'Choose gear for this slot'}</small></span><span class="ico">${iconForCategory(r.category)}</span></div>`; }).join('');
    const selected=selectedOptions(model).length;
    return `<section id="sf-build-room-renderer" data-sf-broom-level="${esc(info.id)}" style="--sf-broom-shelf-bg:url('${esc(shelfAsset())}'); --sf-broom-locker-bg:url('${esc(shelfAsset())}')">
      <div class="sf-broom-top"><div><div class="sf-broom-kicker">Build-a-Room 2.0 · ${esc(info.id)}</div><h2 class="sf-broom-title">${esc(info.title)}</h2></div><div class="sf-broom-meters"><div class="sf-broom-meter"><span>Budget</span><strong>${state.credits}</strong></div><div class="sf-broom-meter ${state.newCost>state.credits?'bad':''}"><span>New Spend</span><strong>${state.newCost}</strong></div><div class="sf-broom-meter good"><span>Owned Applied</span><strong>${state.ownedApplied}</strong></div></div></div>
      <div class="sf-broom-body"><aside class="sf-broom-left"><div class="sf-broom-note"><div class="eyebrow">Current level</div><h3>${esc(info.title)}</h3><p>${esc(info.prompt)}</p></div><div class="sf-broom-checklist"><h4>Build Checklist · ${model.roles.length-state.missing.length} / ${model.roles.length}</h4>${checklist}</div><div class="sf-broom-tip"><b>Build rule:</b> owned gear costs <b>$0</b>, but it must still be selected. New purchases spend credits and enter the Equipment Locker after approval.</div></aside>
      <main class="sf-broom-main" aria-label="Build-a-Room equipment store"><div class="sf-broom-store"><div class="sf-broom-store-head"><h3>Equipment Store</h3><button type="button" class="sf-broom-locker-open" data-broom-open-locker>Equipment Locker</button></div><div class="sf-broom-tabs">${cats.map(cat=>`<button type="button" class="sf-broom-tab ${activeFilter===cat?'active':''}" data-broom-filter="${esc(cat)}">${esc(CATEGORY_LABELS[cat]||cat)}</button>`).join('')}</div>${renderOptions(model)}<div class="sf-broom-result" data-broom-result></div><div class="sf-broom-sticky"><span>${selected} selected</span><span>New spend <strong class="${state.newCost>state.credits?'bad':''}">${state.newCost}</strong></span><span>Remaining <strong class="${state.credits-state.newCost>=0?'good':'bad'}">${Math.max(0,state.credits-state.newCost)}</strong></span><div class="sf-broom-actions"><button type="button" class="sf-broom-action" data-broom-clear>Clear</button><button type="button" class="sf-broom-action" data-broom-reset>Reset Build</button><button type="button" class="sf-broom-action primary" data-broom-check>Check Room</button></div></div></div></main></div>
    </section>`;
  }
  function showResult(kind, message){ const out=document.querySelector('#sf-build-room-renderer [data-broom-result]'); if(!out) return; out.className='sf-broom-result show '+(kind||''); out.innerHTML=message; }
  function addOwnedGear(items, levelId){
    if(!items.length) return;
    const locker=readLocker();
    items.forEach(item=>{ const key=normalizeKey(item.key||item.label); if(!locker.items[key]) locker.items[key]={key,label:item.label||key,qty:0,category:item.category||categoryForLabel(item.label||key),firstLevel:levelId||'',firstAcquiredAt:new Date().toISOString(),useCases:item.useCases||useCasesForCategory(item.category||categoryForLabel(item.label||key))}; const row=locker.items[key]; row.label=item.label||row.label; row.category=item.category||row.category; row.qty=Number(row.qty||0)+1; row.lastLevel=levelId||row.lastLevel; row.lastAcquiredAt=new Date().toISOString(); if(item.asset) row.asset=item.asset; row.useCases=item.useCases||row.useCases; });
    locker.history.push({levelId,at:new Date().toISOString(),items}); writeLocker(locker);
  }
  function showModal(title, html){ closeBuildRoomModals(); const el=document.createElement('div'); el.className='sf-broom-modal'; el.innerHTML=`<article class="sf-broom-modal-card"><h2>${esc(title)}</h2><div>${html}</div><div class="sf-broom-modal-actions"><button class="sf-broom-action primary" data-broom-modal-close>Close</button><button class="sf-broom-action" data-broom-retry>Retry Build</button><button class="sf-broom-action" data-broom-open-locker>Open Equipment Locker</button></div></article>`; document.body.appendChild(el); }
  function closeBuildRoomModals(){ document.querySelectorAll('.sf-broom-modal,.sf-br2-modal,.sf-timeout-modal,.sf-build-timeout-modal,.sf-economy-modal,.sf-completion-modal,.sf-reward-modal').forEach(x=>x.remove()); document.querySelectorAll('.complete-overlay.show,.game-over-overlay.show,.modal.show,.overlay.show').forEach(x=>{x.classList.remove('show'); x.removeAttribute('aria-modal');}); document.body.classList.remove('modal-open','sf-modal-open','sf-timeout-active'); }
  function approveBuild(){ const info=buildModelInfo(); if(!info) return; const model=buildOptions(info); const st=stateFor(info,model); if(st.missing.length){ showResult('bad','Room is incomplete: '+st.missing.map(r=>esc(r.label)).join(', ')+'.'); play('wrongAnswer'); return; } if(st.newCost>st.credits){ const over=st.newCost-st.credits; showResult('bad','Not enough credits. Need '+over+' more credits for selected new purchases.'); showModal('Insufficient Credits',`<p>You need <b>${over}</b> more credits before this room can be approved.</p><ul><li>Owned locker gear costs $0.</li><li>Replay earlier boards to earn more credits.</li></ul>`); play('wrongAnswer'); return; } if(st.newCost>0) dispatchLedger({type:'REWARD_SPENT',levelId:info.id,itemId:'build-room-purchase-'+info.id+'-'+Date.now(),cost:st.newCost}); addOwnedGear(st.purchases,info.id); awardOnce('build-room-consolidated-'+info.id, st.extras.length?100:125, 0); showResult('good',`Room approved. ${st.purchases.length} new purchase${st.purchases.length===1?'':'s'} added to Equipment Locker.`); play('rightAnswer'); setTimeout(()=>{ try{ if(typeof completeLevel==='function') completeLevel(); }catch(_){} },700); renderBuildRoom(true); }

  function renderBuildRoom(force){
    const info=buildModelInfo();
    const stage=document.getElementById('sf-build-room-renderer');
    if(!info){ document.body.classList.remove('sf-broom-active'); if(stage) stage.remove(); activeLevelId=''; lastRenderKey=''; return; }
    if(assetManifestLoaded && !assetManifest) assetManifest={assets:[]};
    if(activeLevelId!==info.id){ activeLevelId=info.id; activeFilter='all'; selectedKeys=new Set(); lastRenderKey=''; }
    const model=buildOptions(info); const st=stateFor(info,model);
    const key=[info.id,activeFilter,[...selectedKeys].sort().join(','),lockerItems().length,st.credits,st.newCost,manifestAssets().length].join('::');
    if(!force && key===lastRenderKey && stage){ hideOldBuildDom(); return; }
    lastRenderKey=key;
    const mount=findBoardMount();
    if(!mount) return;
    if(stage) stage.outerHTML=renderStage(info,model,st); else mount.insertAdjacentHTML('afterbegin',renderStage(info,model,st));
    document.body.classList.add('sf-broom-active'); hideOldBuildDom();
    if(lastLoggedLevel!==info.id){ lastLoggedLevel=info.id; console.log('[Signal Flow] Build-a-Room consolidated renderer active',VERSION,info.id); }
  }
  function scheduleRender(force){ clearTimeout(refreshTimer); refreshTimer=setTimeout(()=>renderBuildRoom(!!force),80); }

  function lockerCategory(item){ return item.category || categoryForLabel(item.label||item.key); }
  function renderLocker(){
    const items=lockerItems().map(item=>({...item,category:lockerCategory(item),asset:item.asset||assetFor(item.label,item.category||categoryForLabel(item.label))}));
    if(!selectedLockerKey && items[0]) selectedLockerKey=normalizeKey(items[0].key||items[0].label);
    const cats=['all',...Array.from(new Set(items.map(i=>i.category)))];
    const shown=items.filter(i=>lockerFilter==='all'||i.category===lockerFilter);
    const selected=items.find(i=>normalizeKey(i.key||i.label)===selectedLockerKey)||items[0];
    return `<div class="sf-broom-locker-modal" role="dialog" aria-modal="true"><section class="sf-broom-locker-shell" style="--sf-broom-locker-bg:url('${esc(shelfAsset())}')"><header class="sf-broom-locker-head"><div><h2>Equipment Locker</h2><p>Permanent Build-a-Room inventory. Owned equipment is reusable and costs 0 credits on future builds.</p></div><button class="sf-broom-close" data-broom-close-locker aria-label="Close">×</button></header><div class="sf-broom-locker-body"><main class="sf-broom-locker-list"><div class="sf-broom-locker-tabs">${cats.map(c=>`<button class="${lockerFilter===c?'active':''}" data-broom-locker-filter="${esc(c)}">${esc(CATEGORY_LABELS[c]||c)}</button>`).join('')}</div><div class="sf-broom-locker-grid">${shown.length?shown.map(item=>{const key=normalizeKey(item.key||item.label); const art=item.asset?`<img src="${esc(item.asset)}" alt="">`:`<span class="sf-broom-icon">${iconForCategory(item.category)}</span>`; return `<button class="sf-broom-locker-item ${key===selectedLockerKey?'active':''}" data-broom-locker-item="${esc(key)}"><span class="sf-broom-locker-qty">×${Number(item.qty||1)}</span>${art}<b>${esc(item.label||key)}</b><small>${esc(CATEGORY_LABELS[item.category]||item.category||'Equipment')}</small></button>`;}).join(''):'<p>No owned equipment yet. Purchase gear in Build-a-Room levels to fill this locker.</p>'}</div></main><aside class="sf-broom-locker-detail">${selected?`${selected.asset?`<img src="${esc(selected.asset)}" alt="">`:''}<h3>${esc(selected.label||selected.key)}</h3><p>${esc(CATEGORY_LABELS[selected.category]||selected.category||'Equipment')} · Owned quantity ×${Number(selected.qty||1)}</p><div class="box"><b>First acquired</b><br>${esc(selected.firstLevel||'Unknown')}</div><div class="box"><b>Reusable status</b><br>Available in future Build-a-Room levels for $0 new credit cost.</div><div class="box"><b>Common uses</b><br>${esc(selected.useCases||useCasesForCategory(selected.category))}</div>`:'<h3>Equipment Locker</h3><p>No item selected.</p>'}</aside></div></section></div>`;
  }
  function openLocker(){ closeLocker(); document.body.insertAdjacentHTML('beforeend',renderLocker()); }
  function closeLocker(){ document.querySelectorAll('.sf-broom-locker-modal').forEach(x=>x.remove()); }

  function installSplashLocker(){
    const mic=document.getElementById('micLockerBtn') || Array.from(document.querySelectorAll('button,a,[role="button"]')).find(el=>/mic\s*locker/i.test(el.textContent||''));
    if(mic){
      mic.textContent='Equipment\nLocker';
      mic.removeAttribute('aria-hidden');
      mic.classList.add('sf-broom-replaced-mic-locker');
      mic.addEventListener('click',function(ev){ ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation) ev.stopImmediatePropagation(); openLocker(); },true);
      document.body.classList.remove('sf-broom-splash-ready');
      document.querySelectorAll('.sf-broom-splash-equipment-overlay').forEach(x=>x.remove());
      return;
    }
    const existing=document.querySelector('.sf-broom-splash-equipment-overlay');
    const label=Array.from(document.querySelectorAll('*')).find(el=>/mic\s*locker/i.test(el.textContent||'') && el.getBoundingClientRect && el.getBoundingClientRect().width>20);
    if(label){ const r=label.getBoundingClientRect(); let btn=existing; if(!btn){btn=document.createElement('button'); btn.className='sf-broom-splash-equipment-overlay'; btn.type='button'; btn.textContent='Equipment\nLocker'; btn.onclick=openLocker; document.body.appendChild(btn);} Object.assign(btn.style,{left:Math.round(r.left)+'px',top:Math.round(r.top)+'px',width:Math.round(r.width)+'px',height:Math.round(r.height)+'px'}); document.body.classList.add('sf-broom-splash-ready'); }
  }

  function installHandlers(){
    document.addEventListener('click',function(ev){
      const gear=ev.target.closest && ev.target.closest('[data-broom-gear]');
      if(gear){ ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation)ev.stopImmediatePropagation(); const id=gear.getAttribute('data-broom-gear'); if(selectedKeys.has(id)) selectedKeys.delete(id); else selectedKeys.add(id); renderBuildRoom(true); return; }
      const filter=ev.target.closest && ev.target.closest('[data-broom-filter]');
      if(filter){ ev.preventDefault(); activeFilter=filter.getAttribute('data-broom-filter')||'all'; renderBuildRoom(true); return; }
      const clear=ev.target.closest && ev.target.closest('[data-broom-clear]');
      if(clear){ ev.preventDefault(); selectedKeys.clear(); renderBuildRoom(true); return; }
      const reset=ev.target.closest && ev.target.closest('[data-broom-reset]');
      if(reset){ ev.preventDefault(); selectedKeys.clear(); closeBuildRoomModals(); renderBuildRoom(true); return; }
      const check=ev.target.closest && ev.target.closest('[data-broom-check]');
      if(check){ ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation)ev.stopImmediatePropagation(); approveBuild(); return; }
      const open=ev.target.closest && ev.target.closest('[data-broom-open-locker]');
      if(open){ ev.preventDefault(); openLocker(); return; }
      const close=ev.target.closest && ev.target.closest('[data-broom-close-locker], [data-broom-modal-close]');
      if(close){ ev.preventDefault(); closeLocker(); closeBuildRoomModals(); return; }
      const lf=ev.target.closest && ev.target.closest('[data-broom-locker-filter]');
      if(lf){ ev.preventDefault(); lockerFilter=lf.getAttribute('data-broom-locker-filter')||'all'; openLocker(); return; }
      const li=ev.target.closest && ev.target.closest('[data-broom-locker-item]');
      if(li){ ev.preventDefault(); selectedLockerKey=li.getAttribute('data-broom-locker-item')||''; openLocker(); return; }
      const retry=ev.target.closest && ev.target.closest('[data-broom-retry],button,a');
      if(retry && /retry\s*(build|board|case|level)?/i.test(retry.textContent||'')){
        const info=buildModelInfo();
        if(info){ ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation)ev.stopImmediatePropagation(); closeBuildRoomModals(); selectedKeys=new Set(); try{ if(typeof navigateTo==='function') navigateTo('/level/'+encodeURIComponent(info.id)); else if(typeof startLevelById==='function') startLevelById(info.id); }catch(_){ location.reload(); } setTimeout(()=>renderBuildRoom(true),100); return; }
      }
    },true);
  }

  function init(){
    installHandlers();
    loadAssetManifest().then(()=>renderBuildRoom(true));
    scheduleRender(true);
    installSplashLocker();
    const obs=new MutationObserver(()=>{ scheduleRender(false); installSplashLocker(); });
    obs.observe(document.documentElement,{childList:true,subtree:true,attributes:false});
    window.addEventListener('sf-equipment-locker-updated',()=>renderBuildRoom(true));
    window.addEventListener('storage',ev=>{ if(!ev||ev.key===LOCKER_KEY) renderBuildRoom(true); });
    console.log('[Signal Flow] Build-a-Room consolidated renderer installed',VERSION);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
