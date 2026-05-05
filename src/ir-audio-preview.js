(function(global){
  'use strict';

  let ctx = null;
  const buffers = new Map();
  const stemCandidates = [
    '../assets/audio/stems/Flute Solo_1(25).wav',
    '../assets/audio/stems/Flute Solo_1(24).wav',
    '../assets/audio/stems/flute-solo-1.wav',
    '../assets/audio/Flute Solo_1(25).wav',
    '../assets/audio/Flute Solo_1(24).wav'
  ];

  function getCtx(){
    if(!ctx) ctx = new (global.AudioContext || global.webkitAudioContext)();
    return ctx;
  }

  async function unlock(){
    const audio = getCtx();
    if(audio.state === 'suspended') await audio.resume();
    return audio;
  }

  function paramsFor(name, meta){
    const m = (meta && meta[name]) || {};
    const decay = {none:.12, small:.42, medium:.78, large:1.22, massive:2.05, fx:1.0}[m.size] || .65;
    const tone = {dry:.08, treated:.2, soft:.32, reflective:.68, lively:.72, controlled:.44, wash:.9, directional:.82, metallic:.96, boxy:.54, effect:1}[m.kind] || .5;
    return { decay, tone };
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
      return buf;
    }catch(err){
      buffers.set(url, null);
      return null;
    }
  }

  async function loadStem(){
    for(const url of stemCandidates){
      const buf = await tryLoadBuffer(url);
      if(buf) return buf;
    }
    return null;
  }

  async function playIR(name, meta){
    const audio = await unlock();
    const p = paramsFor(name, meta);
    const master = audio.createGain();
    master.gain.value = .24;
    master.connect(audio.destination);

    const wetDelay = audio.createDelay(2.5);
    wetDelay.delayTime.value = .05 + p.tone * .12;
    const feedback = audio.createGain();
    feedback.gain.value = Math.min(.76, .15 + p.decay * .24);
    const wetGain = audio.createGain();
    wetGain.gain.value = .14 + p.tone * .18;
    wetDelay.connect(feedback);
    feedback.connect(wetDelay);
    wetDelay.connect(wetGain);
    wetGain.connect(master);

    const dryGain = audio.createGain();
    dryGain.gain.value = .72;
    dryGain.connect(master);

    const stem = await loadStem();
    const now = audio.currentTime;
    if(stem){
      const src = audio.createBufferSource();
      src.buffer = stem;
      const trim = Math.min(2.2, stem.duration || 2.2);
      const env = audio.createGain();
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(.95, now + .03);
      env.gain.setValueAtTime(.95, now + Math.max(.04, trim - .18));
      env.gain.linearRampToValueAtTime(.001, now + trim);
      src.connect(env);
      env.connect(dryGain);
      env.connect(wetDelay);
      src.start(now, 0, trim);
      src.stop(now + trim + .03);
      setTimeout(() => { try{ master.disconnect(); }catch(e){} }, (trim + 1.2) * 1000);
      return;
    }

    // Fallback if Flute Solo file is not present in the repo yet.
    [523.25,659.25,783.99,659.25,587.33,523.25].forEach((freq, step) => {
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      const t = now + step * .18;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(.32, t + .012);
      g.gain.exponentialRampToValueAtTime(.001, t + .16);
      o.connect(g);
      g.connect(dryGain);
      g.connect(wetDelay);
      o.start(t);
      o.stop(t + .18);
    });
    setTimeout(() => { try{ master.disconnect(); }catch(e){} }, 1900);
  }

  async function playCompare(selected, reference, meta){
    await playIR(selected, meta);
    setTimeout(() => playIR(reference, meta), 1500);
  }

  global.SF_IR_AUDIO = { unlock, playIR, playCompare };
})(window);
