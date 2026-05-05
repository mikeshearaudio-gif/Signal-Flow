(function(global){
  'use strict';

  let ctx = null;
  const buffers = new Map();
  const reverseBuffers = new WeakMap();
  const loadAttempts = [];
  let fallbackWarningShown = false;
  let lastStemUrl = null;
  let lastUsedFallback = false;

  const stemCandidates = [
    '../assets/audio/stems/Flute Solo_1(24).wav',
    '../assets/audio/stems/Flute Solo_1(25).wav'
  ];

  const PRESETS = {
    'Vocal Booth': { dry:.93, wet:.06, decay:.10, predelay:.006, feedback:.03, highpass:90, lowpass:7200, taps:[.018], tapGain:.025 },
    'Bedroom Studio': { dry:.82, wet:.15, decay:.22, predelay:.014, feedback:.08, highpass:80, lowpass:6400, taps:[.032,.071], tapGain:.035, modDepth:.001 },
    'Podcast Studio': { dry:.91, wet:.08, decay:.14, predelay:.008, feedback:.04, highpass:110, lowpass:5600, taps:[.021], tapGain:.025 },
    'Office': { dry:.77, wet:.21, decay:.32, predelay:.018, feedback:.13, highpass:95, lowpass:5100, taps:[.026,.064,.118], tapGain:.04 },
    'Classroom': { dry:.66, wet:.33, decay:.55, predelay:.026, feedback:.24, highpass:85, lowpass:6200, taps:[.041,.093,.172], tapGain:.055 },
    'Rehearsal Room': { dry:.62, wet:.38, decay:.70, predelay:.022, feedback:.31, highpass:70, lowpass:7600, taps:[.029,.077,.143,.219], tapGain:.06, modDepth:.002 },
    'Living Room': { dry:.75, wet:.23, decay:.34, predelay:.016, feedback:.15, highpass:75, lowpass:4700, taps:[.027,.066,.121], tapGain:.045 },
    'Wood Room': { dry:.65, wet:.34, decay:.48, predelay:.018, feedback:.24, highpass:100, lowpass:8200, taps:[.021,.049,.096,.151], tapGain:.055 },
    'Scoring Stage': { dry:.54, wet:.43, decay:.88, predelay:.041, feedback:.34, highpass:65, lowpass:9400, taps:[.052,.119,.211,.344], tapGain:.065, modDepth:.002 },
    'Soundstage': { dry:.49, wet:.48, decay:1.05, predelay:.056, feedback:.42, highpass:70, lowpass:8600, taps:[.064,.151,.278,.421], tapGain:.068, modDepth:.003 },
    'Open Air': { dry:.96, wet:.025, decay:.04, predelay:.003, feedback:.01, highpass:55, lowpass:16000, taps:[.085], tapGain:.012 },
    'Courtyard': { dry:.61, wet:.36, decay:.64, predelay:.038, feedback:.27, highpass:80, lowpass:8800, taps:[.059,.137,.241], tapGain:.06 },
    'Alley': { dry:.58, wet:.39, decay:.58, predelay:.026, feedback:.34, highpass:120, lowpass:9000, taps:[.045,.091,.182,.296], tapGain:.07 },
    'Parking Garage': { dry:.46, wet:.53, decay:1.08, predelay:.047, feedback:.50, highpass:140, lowpass:7200, taps:[.061,.128,.255,.386,.511], tapGain:.075, modDepth:.001 },
    'Tunnel': { dry:.42, wet:.56, decay:1.15, predelay:.072, feedback:.55, highpass:120, lowpass:6800, taps:[.086,.173,.346,.612], tapGain:.08, panSweep:true },
    'Broadcast Studio': { dry:.94, wet:.05, decay:.08, predelay:.005, feedback:.025, highpass:120, lowpass:5900, taps:[.017], tapGain:.02 },
    'Attic Chamber': { dry:.68, wet:.30, decay:.42, predelay:.013, feedback:.22, highpass:160, lowpass:4300, taps:[.023,.057,.102], tapGain:.05 },
    'Club / Live Venue': { dry:.55, wet:.43, decay:.82, predelay:.044, feedback:.38, highpass:85, lowpass:9300, taps:[.049,.112,.205,.331], tapGain:.07, modDepth:.003 },
    'Gymnasium': { dry:.40, wet:.58, decay:1.45, predelay:.061, feedback:.58, highpass:90, lowpass:9800, taps:[.074,.163,.299,.484,.721], tapGain:.075, modDepth:.002 },
    'Church Interior': { dry:.34, wet:.64, decay:1.85, predelay:.082, feedback:.62, highpass:70, lowpass:8200, taps:[.101,.226,.392,.641,.914], tapGain:.078, modDepth:.004 },
    'Cathedral': { dry:.28, wet:.70, decay:2.35, predelay:.105, feedback:.69, highpass:65, lowpass:7600, taps:[.127,.282,.511,.838,1.17], tapGain:.082, modDepth:.006 },
    'Concert Hall': { dry:.43, wet:.54, decay:1.32, predelay:.068, feedback:.47, highpass:60, lowpass:10200, taps:[.073,.169,.312,.517,.743], tapGain:.07, modDepth:.003 },
    'Plate': { dry:.34, wet:.74, decay:1.15, predelay:.018, feedback:.68, highpass:420, lowpass:12500, taps:[.011,.019,.031,.047,.071,.113,.173], tapGain:.09, metallic:true, modDepth:.007 },
    'Reverse': { dry:.28, wet:.70, decay:.92, predelay:.13, feedback:.23, highpass:180, lowpass:6900, taps:[.16,.26,.38,.52], tapGain:.08, reverse:true }
  };

  function getCtx(){
    if(!ctx) ctx = new (global.AudioContext || global.webkitAudioContext)();
    return ctx;
  }

  async function unlock(){
    const audio = getCtx();
    if(audio.state === 'suspended') await audio.resume();
    return audio;
  }

  function resolveUrl(url){
    try{
      return new URL(url, global.location && global.location.href).href;
    }catch(err){
      return url;
    }
  }

  function logAttempt(url, ok, err){
    const attempt = { url: resolveUrl(url), ok, error: err ? String(err.message || err) : '' };
    loadAttempts.push(attempt);
    if(ok){
      console.info('[Signal Flow IR audio] loaded Flute Solo preview:', attempt.url);
    }else{
      console.warn('[Signal Flow IR audio] failed Flute Solo preview URL:', attempt.url, attempt.error);
    }
  }

  async function tryLoadBuffer(url){
    if(buffers.has(url)) return buffers.get(url);
    try{
      const res = await fetch(url);
      if(!res.ok) throw new Error('HTTP '+res.status);
      const arr = await res.arrayBuffer();
      const audio = await unlock();
      const buf = await audio.decodeAudioData(arr);
      buffers.set(url, buf);
      logAttempt(url, true);
      return buf;
    }catch(err){
      buffers.set(url, null);
      logAttempt(url, false, err);
      return null;
    }
  }

  async function loadStem(){
    for(const url of stemCandidates){
      const buf = await tryLoadBuffer(url);
      if(buf){
        lastStemUrl = resolveUrl(url);
        return { buffer: buf, url };
      }
    }
    lastStemUrl = null;
    return null;
  }

  function showFallbackWarning(){
    if(fallbackWarningShown) return;
    fallbackWarningShown = true;
    const doc = global.document;
    if(!doc) return;
    const warning = doc.createElement('div');
    warning.id = 'sfIrAudioFallbackWarning';
    warning.setAttribute('role', 'status');
    warning.textContent = 'Audio warning: real Flute Solo 1 could not be loaded, so a synthetic emergency preview is playing.';
    warning.style.cssText = [
      'position:fixed',
      'left:16px',
      'right:16px',
      'bottom:16px',
      'z-index:9999',
      'padding:12px 14px',
      'border:1px solid rgba(255,215,106,.75)',
      'border-radius:12px',
      'background:rgba(20,13,2,.95)',
      'color:#fff6d6',
      'font:700 14px system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif',
      'box-shadow:0 16px 36px rgba(0,0,0,.38)'
    ].join(';');
    doc.body.appendChild(warning);
  }

  function reverseBuffer(buffer){
    if(reverseBuffers.has(buffer)) return reverseBuffers.get(buffer);
    const audio = getCtx();
    const reversed = audio.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
    for(let ch = 0; ch < buffer.numberOfChannels; ch++){
      const src = buffer.getChannelData(ch);
      const dst = reversed.getChannelData(ch);
      for(let i = 0, j = src.length - 1; i < src.length; i++, j--) dst[i] = src[j];
    }
    reverseBuffers.set(buffer, reversed);
    return reversed;
  }

  function profileFor(name, meta){
    if(PRESETS[name]) return PRESETS[name];
    const m = (meta && meta[name]) || {};
    const sizeDecay = { none:.04, small:.24, medium:.58, large:1.08, massive:1.9, fx:1.0 }[m.size] || .5;
    const kindTone = { dry:.05, treated:.14, soft:.22, reflective:.42, lively:.5, controlled:.34, wash:.7, directional:.55, metallic:.6, boxy:.28, effect:.65 }[m.kind] || .3;
    return {
      dry: Math.max(.32, .88 - sizeDecay * .24),
      wet: Math.min(.66, .09 + sizeDecay * .26 + kindTone * .18),
      decay: sizeDecay,
      predelay: .012 + sizeDecay * .035,
      feedback: Math.min(.62, .06 + sizeDecay * .25 + kindTone * .16),
      highpass: 80,
      lowpass: 9000 - kindTone * 2500,
      taps: [.035,.085,.17],
      tapGain: .045
    };
  }

  function createOutput(audio){
    const master = audio.createGain();
    master.gain.value = .26;
    master.connect(audio.destination);
    return master;
  }

  function connectProfile(audio, sourceNode, profile, master, duration){
    const dryGain = audio.createGain();
    dryGain.gain.value = profile.dry;
    sourceNode.connect(dryGain);
    dryGain.connect(master);

    const wetInput = audio.createGain();
    wetInput.gain.value = profile.wet;
    sourceNode.connect(wetInput);

    const highpass = audio.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = profile.highpass || 70;

    const lowpass = audio.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = profile.lowpass || 8000;
    lowpass.Q.value = profile.metallic ? 4.2 : .72;

    const predelay = audio.createDelay(1.5);
    predelay.delayTime.value = profile.predelay || .02;

    const feedbackDelay = audio.createDelay(2.8);
    feedbackDelay.delayTime.value = Math.min(1.15, Math.max(.025, (profile.decay || .5) * .22));

    const feedback = audio.createGain();
    feedback.gain.value = Math.min(.78, profile.feedback || .2);

    const wetOut = audio.createGain();
    wetOut.gain.value = .88;

    wetInput.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(predelay);
    predelay.connect(feedbackDelay);
    feedbackDelay.connect(feedback);
    feedback.connect(feedbackDelay);
    feedbackDelay.connect(wetOut);
    predelay.connect(wetOut);
    wetOut.connect(master);

    const taps = profile.taps || [];
    taps.forEach((time, index) => {
      const tapDelay = audio.createDelay(1.5);
      tapDelay.delayTime.value = time;
      const tapGain = audio.createGain();
      tapGain.gain.value = (profile.tapGain || .04) * Math.max(.28, 1 - index * .11);
      const panner = audio.createStereoPanner ? audio.createStereoPanner() : null;
      predelay.connect(tapDelay);
      tapDelay.connect(tapGain);
      if(panner){
        panner.pan.value = index % 2 ? .38 : -.38;
        tapGain.connect(panner);
        panner.connect(master);
      }else{
        tapGain.connect(master);
      }
    });

    const stops = [];
    if(profile.modDepth){
      const mod = audio.createOscillator();
      const modGain = audio.createGain();
      mod.frequency.value = profile.metallic ? 5.8 : .42;
      modGain.gain.value = profile.modDepth;
      mod.connect(modGain);
      modGain.connect(feedbackDelay.delayTime);
      mod.start();
      stops.push(() => mod.stop());
    }
    if(profile.metallic){
      [640, 980, 1470].forEach((freq, index) => {
        const resonator = audio.createBiquadFilter();
        resonator.type = 'bandpass';
        resonator.frequency.value = freq;
        resonator.Q.value = 8 + index * 3;
        const rg = audio.createGain();
        rg.gain.value = .11;
        wetInput.connect(resonator);
        resonator.connect(rg);
        rg.connect(master);
      });
    }
    if(profile.panSweep && audio.createStereoPanner){
      const pan = audio.createStereoPanner();
      const panDelay = audio.createDelay(1.5);
      panDelay.delayTime.value = .19;
      const panGain = audio.createGain();
      panGain.gain.value = .18;
      predelay.connect(panDelay);
      panDelay.connect(panGain);
      panGain.connect(pan);
      pan.connect(master);
      const now = audio.currentTime;
      pan.pan.setValueAtTime(-.65, now);
      pan.pan.linearRampToValueAtTime(.65, now + Math.min(2.2, duration));
    }

    return () => stops.forEach(stop => { try{ stop(); }catch(e){} });
  }

  function playSynthetic(audio, profile, master){
    showFallbackWarning();
    lastUsedFallback = true;
    const now = audio.currentTime;
    const env = audio.createGain();
    connectProfile(audio, env, profile, master, 1.9);
    [523.25,659.25,783.99,659.25,587.33,523.25].forEach((freq, step) => {
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.type = profile.metallic ? 'triangle' : 'sine';
      o.frequency.value = profile.reverse ? freq * .5 : freq;
      const t = now + step * .18;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(.32, t + (profile.reverse ? .13 : .012));
      g.gain.exponentialRampToValueAtTime(.001, t + .16);
      o.connect(g);
      g.connect(env);
      o.start(t);
      o.stop(t + .18);
    });
    setTimeout(() => { try{ master.disconnect(); }catch(e){} }, 2200);
    return 1.9;
  }

  async function playIR(name, meta){
    const audio = await unlock();
    const profile = profileFor(name, meta);
    const master = createOutput(audio);
    const stem = await loadStem();
    const now = audio.currentTime;

    if(!stem) return playSynthetic(audio, profile, master);

    lastUsedFallback = false;
    const buffer = profile.reverse ? reverseBuffer(stem.buffer) : stem.buffer;
    const src = audio.createBufferSource();
    src.buffer = buffer;
    const trim = Math.min(2.35, buffer.duration || 2.35);
    const env = audio.createGain();
    env.gain.setValueAtTime(0, now);
    if(profile.reverse){
      env.gain.linearRampToValueAtTime(.92, now + Math.min(.72, trim * .68));
      env.gain.linearRampToValueAtTime(.001, now + trim);
    }else{
      env.gain.linearRampToValueAtTime(.95, now + .025);
      env.gain.setValueAtTime(.95, now + Math.max(.04, trim - .18));
      env.gain.linearRampToValueAtTime(.001, now + trim);
    }
    src.connect(env);
    const stopExtras = connectProfile(audio, env, profile, master, trim);
    src.start(now, 0, trim);
    src.stop(now + trim + .03);
    setTimeout(() => {
      stopExtras();
      try{ master.disconnect(); }catch(e){}
    }, (trim + Math.max(1.3, profile.decay || .8)) * 1000);
    return trim + .35;
  }

  async function playCompare(selected, reference, meta){
    const selectedDuration = await playIR(selected, meta);
    setTimeout(() => playIR(reference, meta), Math.max(1500, (selectedDuration || 1.9) * 1000 + 250));
  }

  function getStatus(){
    return {
      lastStemUrl,
      lastUsedFallback,
      fallbackWarningShown,
      loadAttempts: loadAttempts.slice()
    };
  }

  global.SF_IR_AUDIO = { unlock, playIR, playCompare, getStatus };
})(window);
