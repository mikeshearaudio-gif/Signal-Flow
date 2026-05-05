(function(global){
  'use strict';

  let ctx = null;
  const buffers = new Map();
  const impulseBuffers = new Map();
  const reverseBuffers = new WeakMap();
  const loadAttempts = [];
  let fallbackWarningShown = false;
  let lastStemUrl = null;
  let lastUsedFallback = false;
  let lastProfileName = '';

  const stemCandidates = [
    '../assets/audio/stems/Flute Solo_1(24).wav',
    '../assets/audio/stems/Flute Solo_1(25).wav'
  ];

  const PROFILES = {
    'Open Air': { dry:.985, wet:.012, length:.10, decay:.045, predelay:.002, density:6, highpass:55, lowpass:17000, width:.18, early:[{t:.085,g:.012,p:.12}] },
    'Vocal Booth': { dry:.95, wet:.045, length:.14, decay:.06, predelay:.004, density:16, highpass:125, lowpass:6100, width:.22, early:[{t:.012,g:.028,p:-.12},{t:.024,g:.018,p:.12}] },
    'Broadcast Studio': { dry:.955, wet:.038, length:.12, decay:.055, predelay:.003, density:14, highpass:135, lowpass:5600, width:.18, early:[{t:.011,g:.022,p:0}] },
    'Podcast Studio': { dry:.935, wet:.06, length:.17, decay:.075, predelay:.004, density:18, highpass:125, lowpass:5100, width:.20, early:[{t:.014,g:.029,p:-.1},{t:.029,g:.016,p:.12}] },

    'Bedroom Studio': { dry:.84, wet:.16, length:.36, decay:.18, predelay:.010, density:36, highpass:85, lowpass:4200, width:.34, soft:true, early:[{t:.026,g:.046,p:-.22},{t:.058,g:.030,p:.20}] },
    'Living Room': { dry:.79, wet:.22, length:.52, decay:.25, predelay:.012, density:40, highpass:75, lowpass:4700, width:.38, soft:true, early:[{t:.029,g:.054,p:-.2},{t:.071,g:.037,p:.24},{t:.128,g:.021,p:-.06}] },
    'Office': { dry:.74, wet:.26, length:.52, decay:.24, predelay:.014, density:34, highpass:150, lowpass:5000, width:.28, boxy:true, flutter:true, flutterPeriod:.034, flutterGain:.055, early:[{t:.031,g:.074,p:-.1},{t:.064,g:.056,p:.14},{t:.098,g:.040,p:-.12},{t:.133,g:.028,p:.10}] },
    'Classroom': { dry:.62, wet:.40, length:.82, decay:.36, predelay:.018, density:46, highpass:170, lowpass:5600, width:.42, boxy:true, flutter:true, flutterPeriod:.041, flutterGain:.082, early:[{t:.038,g:.095,p:-.22},{t:.082,g:.074,p:.20},{t:.151,g:.054,p:-.2},{t:.229,g:.038,p:.22}] },
    'Wood Room': { dry:.65, wet:.34, length:.60, decay:.29, predelay:.012, density:48, highpass:75, lowpass:7600, width:.40, warm:true, early:[{t:.021,g:.066,p:-.2},{t:.047,g:.055,p:.18},{t:.091,g:.038,p:-.1},{t:.142,g:.026,p:.15}] },

    'Rehearsal Room': { dry:.55, wet:.48, length:1.02, decay:.55, predelay:.018, density:78, highpass:80, lowpass:7600, width:.58, lively:true, early:[{t:.025,g:.078,p:-.32},{t:.063,g:.071,p:.28},{t:.118,g:.054,p:-.2},{t:.197,g:.041,p:.22}] },
    'Club / Live Venue': { dry:.49, wet:.54, length:1.24, decay:.62, predelay:.034, density:74, highpass:95, lowpass:6200, width:.66, lively:true, stage:true, early:[{t:.043,g:.092,p:-.38},{t:.104,g:.073,p:.34},{t:.193,g:.052,p:-.25},{t:.318,g:.041,p:.28}] },
    'Courtyard': { dry:.68, wet:.30, length:.78, decay:.35, predelay:.040, density:30, highpass:100, lowpass:9500, width:.82, outdoor:true, early:[{t:.061,g:.080,p:-.52},{t:.142,g:.058,p:.48},{t:.251,g:.034,p:-.32}] },
    'Alley': { dry:.64, wet:.35, length:.68, decay:.31, predelay:.022, density:18, highpass:135, lowpass:9200, width:.84, outdoor:true, slap:true, echoTrain:[.047,.094,.188,.292], early:[{t:.047,g:.115,p:-.72},{t:.094,g:.086,p:.68},{t:.188,g:.060,p:-.6},{t:.292,g:.040,p:.56}] },

    'Parking Garage': { dry:.40, wet:.65, length:1.48, decay:.66, predelay:.044, density:34, highpass:155, lowpass:7000, width:.76, metallic:true, concrete:true, echoTrain:[.066,.132,.264,.402,.536,.702], early:[{t:.066,g:.125,p:-.5},{t:.132,g:.108,p:.48},{t:.264,g:.082,p:-.42},{t:.402,g:.059,p:.38},{t:.536,g:.044,p:-.32}] },
    'Tunnel': { dry:.34, wet:.68, length:2.05, decay:.88, predelay:.064, density:26, highpass:125, lowpass:6400, width:.98, tunnel:true, echoTrain:[.092,.184,.368,.646,.936,1.24], early:[{t:.092,g:.145,p:-.84},{t:.184,g:.122,p:.84},{t:.368,g:.092,p:-.76},{t:.646,g:.064,p:.74},{t:.936,g:.044,p:-.62}] },
    'Gymnasium': { dry:.36, wet:.68, length:1.88, decay:.82, predelay:.054, density:50, highpass:105, lowpass:10400, width:.82, bright:true, slap:true, flutter:true, flutterPeriod:.086, flutterGain:.070, early:[{t:.084,g:.158,p:-.58},{t:.168,g:.122,p:.58},{t:.310,g:.092,p:-.48},{t:.498,g:.066,p:.48},{t:.742,g:.042,p:-.38}] },
    'Soundstage': { dry:.62, wet:.34, length:1.12, decay:.44, predelay:.046, density:52, highpass:80, lowpass:5200, width:.56, soft:true, damped:true, early:[{t:.070,g:.041,p:-.28},{t:.156,g:.031,p:.30},{t:.281,g:.020,p:-.2}] },
    'Scoring Stage': { dry:.52, wet:.46, length:1.34, decay:.64, predelay:.040, density:96, highpass:70, lowpass:9200, width:.70, smooth:true, clean:true, early:[{t:.052,g:.052,p:-.3},{t:.119,g:.044,p:.31},{t:.218,g:.028,p:-.22}] },
    'Concert Hall': { dry:.41, wet:.59, length:1.95, decay:.96, predelay:.066, density:132, highpass:65, lowpass:9400, width:.88, smooth:true, musical:true, early:[{t:.074,g:.055,p:-.34},{t:.166,g:.041,p:.35},{t:.318,g:.027,p:-.24}] },
    'Church Interior': { dry:.30, wet:.72, length:2.55, decay:1.30, predelay:.082, density:122, highpass:80, lowpass:6800, width:.88, warm:true, bloom:.34, diffuse:true, early:[{t:.132,g:.038,p:-.34},{t:.251,g:.026,p:.36},{t:.430,g:.018,p:-.22}] },
    'Cathedral': { dry:.20, wet:.84, length:4.35, decay:2.45, predelay:.125, density:164, highpass:70, lowpass:5000, width:.98, warm:true, bloom:.92, dark:true, diffuse:true, airy:true, early:[{t:.225,g:.026,p:-.42},{t:.452,g:.018,p:.44},{t:.780,g:.012,p:-.28}] },
    'Attic Chamber': { dry:.69, wet:.29, length:.45, decay:.22, predelay:.011, density:24, highpass:170, lowpass:4100, width:.26, boxy:true, early:[{t:.022,g:.071,p:-.12},{t:.055,g:.052,p:.1},{t:.103,g:.033,p:-.09}] },

    'Plate': { dry:.32, wet:.78, length:1.55, decay:.82, predelay:.014, density:220, highpass:360, lowpass:13200, width:.9, plate:true, smooth:true, early:[] },
    'Reverse': { dry:.46, wet:.86, length:1.55, decay:1.05, predelay:.030, density:96, highpass:150, lowpass:7200, width:.9, reverse:true, reverseTail:true, swellTime:1.05, forwardDelay:.92, early:[{t:.22,g:.040,p:-.35},{t:.38,g:.030,p:.35}] }
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

  function seededRandom(seed){
    let h = 2166136261;
    for(let i = 0; i < seed.length; i++){
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return function(){
      h += 0x6D2B79F5;
      let t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function profileFor(name, meta){
    if(PROFILES[name]) return PROFILES[name];
    const m = (meta && meta[name]) || {};
    const length = {none:.12, small:.32, medium:.75, large:1.35, massive:2.8, fx:1.1}[m.size] || .7;
    return { dry:.7, wet:.28, length, decay:length * .5, predelay:.02, density:40, highpass:90, lowpass:7800, width:.5, early:[{t:.04,g:.04,p:-.2},{t:.09,g:.03,p:.22}] };
  }

  function impulseKey(name, profile, sampleRate){
    return [
      name, sampleRate, profile.length, profile.decay, profile.predelay, profile.density,
      profile.lowpass, profile.highpass, profile.width, profile.plate, profile.dark,
      profile.bloom, profile.flutterPeriod, profile.echoTrain && profile.echoTrain.join(',')
    ].join('|');
  }

  function addImpulseTap(left, right, sample, amp, pan){
    if(sample < 0 || sample >= left.length) return;
    left[sample] += amp * (1 - Math.max(0, pan) * .55);
    right[sample] += amp * (1 + Math.min(0, pan) * .55);
  }

  function createImpulse(name, profile, audio){
    const sampleRate = audio.sampleRate;
    const key = impulseKey(name, profile, sampleRate);
    if(impulseBuffers.has(key)) return impulseBuffers.get(key);

    const predelaySamples = Math.max(0, Math.floor((profile.predelay || 0) * sampleRate));
    const tailSamples = Math.max(64, Math.floor((profile.length || .4) * sampleRate));
    const buffer = audio.createBuffer(2, predelaySamples + tailSamples, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    const rand = seededRandom(name + ':impulse');
    const density = profile.density || 40;
    const eventMultiplier = profile.plate ? 3.6 : (profile.diffuse || profile.smooth ? 1.65 : 1.15);
    const events = Math.max(8, Math.floor(density * (profile.length || .4) * eventMultiplier));
    const width = profile.width == null ? .55 : profile.width;
    const decay = Math.max(.03, profile.decay || .4);
    const bloom = profile.bloom || 0;

    for(let i = 0; i < events; i++){
      let t = profile.plate ? Math.pow(rand(), 1.6) : rand();
      if(profile.bloom) t = Math.pow(t, 1 + bloom * 2.35);
      if(profile.diffuse) t = Math.pow(t, 1.18);
      if(profile.slap && i < 14) t = Math.min(1, (i + 1) / 16 + rand() * .015);
      if(profile.tunnel && i < 12) t = Math.min(1, (i + 1) / 13 + rand() * .018);
      const sample = predelaySamples + Math.min(tailSamples - 1, Math.floor(t * tailSamples));
      const seconds = t * (profile.length || .4);
      let envelope = Math.exp(-seconds / decay);
      if(bloom) envelope *= Math.min(1, Math.pow(seconds / Math.max(.035, bloom), 1.35));
      if(profile.dark) envelope *= 1 - t * .50;
      if(profile.damped) envelope *= 1 - t * .38;
      if(profile.soft) envelope *= 1 - t * .28;
      if(profile.outdoor) envelope *= .62;
      if(profile.plate) envelope *= .92 + rand() * .16;
      if(profile.metallic || profile.concrete) envelope *= (i % 3 === 0) ? 1.28 : .70;
      if(profile.clean || profile.musical) envelope *= .88 + .18 * Math.sin(i * 1.7);
      const sign = rand() > .5 ? 1 : -1;
      const amp = sign * envelope * (profile.plate ? .40 : .34) / Math.sqrt(events / 24);
      const pan = (rand() * 2 - 1) * width;
      addImpulseTap(left, right, sample, amp, pan);
    }

    if(profile.flutter){
      const period = profile.flutterPeriod || .04;
      const count = Math.min(12, Math.floor((profile.length || .5) / period));
      for(let i = 1; i <= count; i++){
        const t = i * period + (rand() - .5) * .006;
        const env = Math.exp(-t / Math.max(.08, decay * .75));
        const pan = i % 2 ? -.45 : .45;
        addImpulseTap(left, right, predelaySamples + Math.floor(t * sampleRate), (profile.flutterGain || .05) * env, pan);
      }
    }

    if(profile.echoTrain){
      profile.echoTrain.forEach((time, index) => {
        const env = Math.exp(-time / Math.max(.1, decay));
        const pan = index % 2 ? .72 : -.72;
        const amp = (profile.tunnel ? .16 : profile.concrete ? .13 : .10) * env;
        addImpulseTap(left, right, predelaySamples + Math.floor(time * sampleRate), amp, pan);
      });
    }

    if(profile.plate){
      for(let i = predelaySamples; i < buffer.length; i++){
        const t = (i - predelaySamples) / sampleRate;
        const env = Math.exp(-t / decay);
        left[i] += (rand() * 2 - 1) * env * .0055;
        right[i] += (rand() * 2 - 1) * env * .0055;
      }
    }

    impulseBuffers.set(key, buffer);
    return buffer;
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

  function connectTone(audio, input, profile, master){
    const highpass = audio.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = profile.highpass || 80;
    highpass.Q.value = .7;

    const lowpass = audio.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = profile.lowpass || 8000;
    lowpass.Q.value = profile.plate ? .45 : (profile.metallic || profile.concrete ? 3.2 : .7);

    input.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(master);
    return { highpass, lowpass };
  }

  function connectEarlyReflections(audio, sourceNode, profile, master, gainScale){
    const stops = [];
    (profile.early || []).forEach((tap, index) => {
      const delay = audio.createDelay(2);
      delay.delayTime.value = tap.t;
      const gain = audio.createGain();
      gain.gain.value = tap.g * (gainScale == null ? 1 : gainScale);
      const filter = audio.createBiquadFilter();
      filter.type = profile.metallic || profile.concrete ? 'bandpass' : 'lowpass';
      filter.frequency.value = (profile.metallic || profile.concrete) ? (520 + index * 330) : (profile.bright ? 10800 : (profile.lowpass || 7500));
      filter.Q.value = (profile.metallic || profile.concrete) ? 6.5 : (profile.boxy ? 1.35 : .7);
      const panner = audio.createStereoPanner ? audio.createStereoPanner() : null;
      sourceNode.connect(delay);
      delay.connect(filter);
      filter.connect(gain);
      if(panner){
        panner.pan.value = tap.p || 0;
        gain.connect(panner);
        panner.connect(master);
      }else{
        gain.connect(master);
      }
    });
    return () => stops.forEach(stop => { try{ stop(); }catch(e){} });
  }

  function connectConvolver(audio, sourceNode, profile, name, master, wetScale){
    const wetGain = audio.createGain();
    wetGain.gain.value = profile.wet * (wetScale == null ? 1 : wetScale);
    const convolver = audio.createConvolver();
    convolver.normalize = true;
    convolver.buffer = createImpulse(name, profile, audio);
    sourceNode.connect(convolver);
    convolver.connect(wetGain);
    connectTone(audio, wetGain, profile, master);
  }

  function envelopeSource(audio, sourceNode, duration){
    const env = audio.createGain();
    const now = audio.currentTime;
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(.95, now + .022);
    env.gain.setValueAtTime(.95, now + Math.max(.05, duration - .18));
    env.gain.linearRampToValueAtTime(.001, now + duration);
    sourceNode.connect(env);
    return env;
  }

  function createOutput(audio){
    const master = audio.createGain();
    master.gain.value = .28;
    master.connect(audio.destination);
    return master;
  }

  function playSynthetic(audio, profile, name, master){
    showFallbackWarning();
    lastUsedFallback = true;
    const now = audio.currentTime;
    const synthetic = audio.createGain();
    const dry = audio.createGain();
    dry.gain.value = profile.dry * .55;
    synthetic.connect(dry);
    dry.connect(master);
    connectConvolver(audio, synthetic, profile, name, master);
    connectEarlyReflections(audio, synthetic, profile, master);

    [523.25,659.25,783.99,659.25,587.33,523.25].forEach((freq, step) => {
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.type = profile.plate ? 'triangle' : 'sine';
      o.frequency.value = profile.reverse ? freq * .5 : freq;
      const t = now + step * .18;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(.28, t + (profile.reverse ? .18 : .012));
      g.gain.exponentialRampToValueAtTime(.001, t + .17);
      o.connect(g);
      g.connect(synthetic);
      o.start(t);
      o.stop(t + .18);
    });
    setTimeout(() => { try{ master.disconnect(); }catch(e){} }, 2700);
    return 1.9;
  }

  function playReverseIR(audio, stem, profile, name, master){
    const now = audio.currentTime;
    const reverseDuration = Math.min(1.85, stem.buffer.duration || 1.85);
    const forwardDelay = profile.forwardDelay || .9;
    const forwardDuration = Math.min(2.2, stem.buffer.duration || 2.2);

    const reverseSrc = audio.createBufferSource();
    reverseSrc.buffer = reverseBuffer(stem.buffer);
    const swell = audio.createGain();
    swell.gain.setValueAtTime(.001, now);
    swell.gain.linearRampToValueAtTime(.08, now + .18);
    swell.gain.linearRampToValueAtTime(.96, now + (profile.swellTime || 1.05));
    swell.gain.exponentialRampToValueAtTime(.001, now + reverseDuration);
    reverseSrc.connect(swell);
    connectConvolver(audio, swell, profile, name, master, 1.05);
    connectEarlyReflections(audio, swell, profile, master, 1.15);
    const reverseAir = audio.createGain();
    reverseAir.gain.value = .16;
    swell.connect(reverseAir);
    connectTone(audio, reverseAir, profile, master);

    const forwardSrc = audio.createBufferSource();
    forwardSrc.buffer = stem.buffer;
    const forwardEnv = audio.createGain();
    forwardEnv.gain.setValueAtTime(0, now);
    forwardEnv.gain.setValueAtTime(0, now + forwardDelay);
    forwardEnv.gain.linearRampToValueAtTime(.86, now + forwardDelay + .045);
    forwardEnv.gain.setValueAtTime(.86, now + forwardDelay + Math.max(.08, forwardDuration - .18));
    forwardEnv.gain.linearRampToValueAtTime(.001, now + forwardDelay + forwardDuration);
    forwardSrc.connect(forwardEnv);
    const dryGain = audio.createGain();
    dryGain.gain.value = profile.dry;
    forwardEnv.connect(dryGain);
    dryGain.connect(master);
    connectConvolver(audio, forwardEnv, profile, name, master, .24);

    reverseSrc.start(now, 0, reverseDuration);
    reverseSrc.stop(now + reverseDuration + .03);
    forwardSrc.start(now + forwardDelay, 0, forwardDuration);
    forwardSrc.stop(now + forwardDelay + forwardDuration + .03);

    setTimeout(() => { try{ master.disconnect(); }catch(e){} }, (forwardDelay + forwardDuration + profile.length + .4) * 1000);
    return forwardDelay + forwardDuration + .35;
  }

  async function playIR(name, meta){
    const audio = await unlock();
    const profile = profileFor(name, meta);
    lastProfileName = name;
    const master = createOutput(audio);
    const stem = await loadStem();

    if(!stem) return playSynthetic(audio, profile, name, master);

    lastUsedFallback = false;
    if(profile.reverse) return playReverseIR(audio, stem, profile, name, master);

    const src = audio.createBufferSource();
    src.buffer = stem.buffer;
    const duration = Math.min(2.35, stem.buffer.duration || 2.35);
    const shaped = envelopeSource(audio, src, duration);

    const dryGain = audio.createGain();
    dryGain.gain.value = profile.dry;
    shaped.connect(dryGain);
    dryGain.connect(master);

    connectConvolver(audio, shaped, profile, name, master);
    const stopEarly = connectEarlyReflections(audio, shaped, profile, master);

    const now = audio.currentTime;
    src.start(now, 0, duration);
    src.stop(now + duration + .03);
    setTimeout(() => {
      stopEarly();
      try{ master.disconnect(); }catch(e){}
    }, (duration + Math.max(.8, profile.length || .8)) * 1000);
    return duration + .35;
  }

  async function playCompare(selected, reference, meta){
    const selectedDuration = await playIR(selected, meta);
    setTimeout(() => playIR(reference, meta), Math.max(1500, (selectedDuration || 1.9) * 1000 + 250));
  }

  function getStatus(){
    return {
      lastProfileName,
      lastStemUrl,
      lastUsedFallback,
      fallbackWarningShown,
      loadAttempts: loadAttempts.slice()
    };
  }

  global.SF_IR_AUDIO = { unlock, playIR, playCompare, getStatus };
})(window);
