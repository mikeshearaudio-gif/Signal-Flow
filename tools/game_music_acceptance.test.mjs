import fs from "node:fs";
import assert from "node:assert/strict";

const launch = fs.readFileSync("launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html", "utf8");

assert(
  /window\.__SignalFlowNoAudio = window\.Audio \|\| window\.__SignalFlowNoAudio/.test(launch),
  "game audio factory should use real browser Audio when available"
);
assert(
  !/window\.__sfMusicDisabled = true/.test(launch),
  "music should not be globally disabled"
);
assert(
  !/function ensureLevelMusic\(\)\{\s*window\.__sfMusicDisabled = true;\s*return null;\s*\}/.test(launch),
  "ensureLevelMusic should create and start a music element"
);
assert(
  !/function startLevelMusic\(\)\{\s*window\.__sfMusicDisabled = true;\s*return null;\s*\}/.test(launch),
  "startLevelMusic should create and start a music element"
);
assert(
  /if\(state\.audioEnabled\)\{\s*await primeAudioAndStartMusic\(\);\s*\}/.test(launch),
  "intro Start button should unlock audio and start music through the prime helper"
);
assert(
  /if\(!state\.musicEls \|\| !state\.musicEls\.length \|\| state\.musicPending \|\| !state\.musicStarted\)\{\s*state\.audioEnabled = true;\s*try\{ ensureLevelMusic\(\); \}catch\(e\)\{\}\s*try\{ updateAudioButton\(\); \}catch\(e\)\{\}\s*return;\s*\}/.test(launch),
  "Sound button should start music after capture-phase unlock instead of toggling off"
);

[
  "music/bg_music_original_full.mp3",
  "music/after_party.mp3",
  "music/after_party_2.mp3",
  "music/big_saw_bass_1.mp3"
].forEach(path => {
  assert(
    new RegExp(`'assets/audio/${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}'\\s*:\\s*'assets/audio/music/[^']+\\(\\d+\\)\\.mp3'`).test(launch),
    `assetUrl should repair missing music asset ${path} to the shipped suffixed file`
  );
});

[
  ["sfx/connection_click.mp3", "sfx/connection_click(51).mp3"],
  ["sfx/wrong_patch_blip.mp3", "sfx/wrong_patch_blip(51).mp3"],
  ["sfx/feedback_warning.mp3", "sfx/feedback_warning(51).mp3"],
  ["sfx/success_soft_hit.mp3", "sfx/success_soft_hit(51).mp3"],
  ["sfx/SFcoin.wav", "sfx/SFcoin(81).wav"],
  ["sfx/right_answer.wav", "sfx/right_answer(48).wav"],
  ["sfx/wrong_answer.wav", "sfx/wrong_answer(49).wav"]
].forEach(([from, to]) => {
  assert(
    launch.includes(`'assets/audio/${from}':'assets/audio/${to}'`),
    `assetUrl should repair missing SFX asset ${from} to shipped file ${to}`
  );
});

console.log("game music acceptance checks passed");
