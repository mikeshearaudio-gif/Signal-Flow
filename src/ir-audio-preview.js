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
      'Open Air': { dry:.15, wet:.46, length:1.85, decay:.72, predelay:.16, density:12, highpass:135, lowpass:14000, width:.98, outdoor:true, echoTrain:[.28,.62,1.05,1.52], early:[{t:.28,g:.135,p:-.78},{t:.62,g:.095,p:.72},{t:1.05,g:.060,p:-.56},{t:1.52,g:.036,p:.48}] },

      'Vocal Booth': { dry:.15, wet:.010, length:.035, decay:0, predelay:.001, density:4, highpass:180, lowpass:2600, width:.04, soft:true, damped:true, early:[{t:.008,g:.004,p:0}] },

      'Broadcast Studio': { dry:.15, wet:.038, length:.12, decay:.055, predelay:.003, density:14, highpass:135, lowpass:5600, width:.18, early:[{t:.011,g:.022,p:0}] },

      'Podcast Studio': { dry:.15, wet:.014, length:.065, decay:.026, predelay:.002, density:8, highpass:170, lowpass:3300, width:.08, soft:true, damped:true, early:[{t:.011,g:.009,p:-.04},{t:.021,g:.005,p:.04}] },

      'Bedroom Studio': { dry:.15, wet:.14, length:.38, decay:.18, predelay:.012, density:55, highpass:80, lowpass:6020, width:.36, soft:true, damped:true, diffuse:true, early:[{t:.026,g:.035,p:-.18},{t:.057,g:.026,p:.16},{t:.112,g:.014,p:-.08},{t:.185,g:.010,p:.10}] },

      'Living Room': { dry:.15, wet:.22, length:.58, decay:.30, predelay:.012, density:44, highpass:75, lowpass:4700, width:.38, soft:true, early:[{t:.029,g:.054,p:-.2},{t:.071,g:.037,p:.24},{t:.128,g:.021,p:-.06}] },

      'Office': { dry:.15, wet:.29, length:.42, decay:.19, predelay:.013, density:28, highpass:190, lowpass:6500, width:.24, boxy:true, flutter:true, flutterPeriod:.032, flutterGain:.070, early:[{t:.028,g:.085,p:-.10},{t:.058,g:.064,p:.12},{t:.091,g:.047,p:-.10},{t:.126,g:.030,p:.08}] },

      'Classroom': { dry:.15, wet:.30, length:.32, decay:.17, predelay:.016, density:34, highpass:175, lowpass:6000, width:.36, boxy:true, flutter:true, flutterPeriod:.037, flutterGain:.060, early:[{t:.032,g:.080,p:-.20},{t:.068,g:.060,p:.18},{t:.118,g:.040,p:-.16},{t:.176,g:.024,p:.16}] },

      'Wood Room': { dry:.15, wet:.38, length:.90, decay:.42, predelay:.014, density:76, highpass:75, lowpass:7800, width:.46, warm:true, diffuse:true, early:[{t:.021,g:.064,p:-.22},{t:.049,g:.052,p:.20},{t:.094,g:.038,p:-.12},{t:.152,g:.026,p:.16},{t:.255,g:.016,p:-.08}] },

      'Rehearsal Room': { dry:.15, wet:.30, length:.62, decay:.30, predelay:.017, density:48, highpass:125, lowpass:8300, width:.46, lively:true, early:[{t:.026,g:.062,p:-.26},{t:.061,g:.052,p:.24},{t:.112,g:.037,p:-.18},{t:.178,g:.026,p:.18}] },

      'Club / Live Venue': { dry:.15, wet:.48, length:.95, decay:.46, predelay:.034, density:64, highpass:145, lowpass:8200, width:.66, lively:true, stage:true, early:[{t:.039,g:.105,p:-.42},{t:.092,g:.084,p:.38},{t:.168,g:.062,p:-.30},{t:.264,g:.045,p:.30},{t:.405,g:.028,p:-.22}] },

      'Courtyard': { dry:.15, wet:.48, length:.88, decay:.38, predelay:.055, density:26, highpass:115, lowpass:10500, width:.88, outdoor:true, early:[{t:.068,g:.110,p:-.56},{t:.155,g:.084,p:.52},{t:.278,g:.056,p:-.36},{t:.455,g:.034,p:.32}] },

      'Alley': { dry:.15, wet:.44, length:.82, decay:.34, predelay:.020, density:22, highpass:280, lowpass:12500, width:.90, outdoor:true, slap:true, bright:true, echoTrain:[.052,.104,.206,.318,.455], early:[{t:.052,g:.150,p:-.80},{t:.104,g:.115,p:.76},{t:.206,g:.082,p:-.66},{t:.318,g:.056,p:.60},{t:.455,g:.034,p:-.46}] },

      'Parking Garage': { dry:.15, wet:.80, length:2.05, decay:.92, predelay:.045, density:62, highpass:360, lowpass:13500, width:.88, metallic:true, concrete:true, bright:true, echoTrain:[.072,.144,.288,.432,.576,.790,1.05,1.34], early:[{t:.072,g:.175,p:-.56},{t:.144,g:.145,p:.54},{t:.288,g:.112,p:-.48},{t:.432,g:.086,p:.44},{t:.576,g:.064,p:-.36},{t:.790,g:.046,p:.34},{t:1.05,g:.032,p:-.28},{t:1.34,g:.020,p:.22}] },

      'Tunnel': { dry:.15, wet:.64, length:4.10, decay:2.35, predelay:.135, density:190, highpass:85, lowpass:4600, width:.98, warm:true, bloom:1.05, dark:true, diffuse:true, airy:true, echoTrain:[.18,.36,.72,1.18,1.72,2.35], early:[{t:.265,g:.020,p:-.38},{t:.545,g:.013,p:.40},{t:.920,g:.008,p:-.24},{t:1.35,g:.006,p:.22}] },

      'Gymnasium': { dry:.15, wet:.42, length:1.05, decay:.42, predelay:.038, density:30, highpass:220, lowpass:12500, width:.74, bright:true, slap:true, flutter:true, flutterPeriod:.072, flutterGain:.080, early:[{t:.064,g:.150,p:-.52},{t:.128,g:.112,p:.52},{t:.238,g:.076,p:-.44},{t:.390,g:.046,p:.42}] },

      'Soundstage': { dry:.15, wet:.30, length:.86, decay:.28, predelay:.038, density:48, highpass:110, lowpass:9200, width:.58, soft:true, damped:true, early:[{t:.058,g:.042,p:-.28},{t:.128,g:.030,p:.30},{t:.226,g:.018,p:-.2}] },

      'Scoring Stage': { dry:.15, wet:.34, length:.92, decay:.42, predelay:.044, density:82, highpass:95, lowpass:9000, width:.62, smooth:true, clean:true, early:[{t:.054,g:.044,p:-.28},{t:.121,g:.034,p:.30},{t:.218,g:.020,p:-.20}] },

      'Concert Hall': { dry:.15, wet:.64, length:3.00, decay:1.35, predelay:.030, density:165, highpass:35, lowpass:7600, width:.92, smooth:true, musical:true, diffuse:true, warm:true, bloom:.28, early:[{t:.030,g:.095,p:-.34},{t:.064,g:.078,p:.35},{t:.118,g:.056,p:-.24},{t:.205,g:.040,p:.22},{t:.360,g:.026,p:-.16},{t:.540,g:.016,p:.12}] },

      'Church Interior': { dry:.15, wet:.58, length:2.20, decay:1.18, predelay:.088, density:138, highpass:95, lowpass:6100, width:.86, warm:true, bloom:.42, diffuse:true, early:[{t:.145,g:.022,p:-.30},{t:.285,g:.014,p:.32},{t:.510,g:.008,p:-.20}] },

      'Cathedral': { dry:.15, wet:.68, length:2.05, decay:.88, predelay:.064, density:26, highpass:125, lowpass:6400, width:.98, tunnel:true, echoTrain:[.092,.184,.368,.646,.936,1.24], early:[{t:.092,g:.145,p:-.84},{t:.184,g:.122,p:.84},{t:.368,g:.092,p:-.76},{t:.646,g:.064,p:.74},{t:.936,g:.044,p:-.62}] },

      'Attic Chamber': { dry:.15, wet:.29, length:.45, decay:.22, predelay:.011, density:24, highpass:170, lowpass:4100, width:.26, boxy:true, early:[{t:.022,g:.071,p:-.12},{t:.055,g:.052,p:.1},{t:.103,g:.033,p:-.09}] },

      'Plate': { dry:.15, wet:.35, length:.42, decay:.20, predelay:.018, density:170, highpass:1200, lowpass:15000, width:.72, plate:true, bright:true, early:[{t:.045,g:.135,p:-.38},{t:.071,g:.105,p:.34},{t:.118,g:.072,p:-.22},{t:.165,g:.045,p:.20}] },

      'Reverse': { dry:.15, wet:.96, length:2.15, decay:1.18, predelay:.055, density:170, highpass:220, lowpass:7600, width:.98, reverse:true, reverseTail:true, swellTime:1.55, forwardDelay:1.05, early:[{t:.30,g:.080,p:-.52},{t:.52,g:.060,p:.50},{t:.78,g:.040,p:-.36},{t:1.05,g:.025,p:.32}] }
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
    master.gain.value = .8;
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
