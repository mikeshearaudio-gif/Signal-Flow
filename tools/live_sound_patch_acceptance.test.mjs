import fs from "node:fs";
import assert from "node:assert/strict";

const renderer = fs.readFileSync("src/live-sound-native-renderer.js", "utf8");
const launch = fs.readFileSync("launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html", "utf8");
const liv029Board = JSON.parse(fs.readFileSync("data/live-sound/boards/liv029.json", "utf8"));
const liv029Normalized = JSON.parse(fs.readFileSync("data/live-sound/boards/normalized/liv029.normalized.json", "utf8"));

const liv002Block = launch.match(/"id": "LIV-002"[\s\S]*?"brief":/);
assert(liv002Block, "LIV-002 data block should exist");
assert(!/Vocal wedge mix 2/.test(liv002Block[0]), "LIV-002 visible board title should not include the number 2");
assert(/title: "Vocal Wedge Mix"/.test(renderer), "native LIV-002 title should not include the number 2");
assert(!/title: "Vocal Wedge Mix 2"/.test(renderer), "native LIV-002 title should not retain the number 2");

assert(!/\? "z-index:2147483600" : "z-index:1800"/.test(renderer), "native cable SVG z-index should not be board-conditional");
assert(/"z-index:2147483600"/.test(renderer), "native cable SVG should use the top board-local z-index");
assert(/sfNativeCableLayer = "top-board-layer"/.test(renderer), "redrawn native cables should be marked as top board layer");

assert(/gearText\(foh\.wrap, "AUX SENDS"/.test(renderer), "LIV-019 FOH should have an Aux section label");
assert(/gearText\(foh\.wrap, "BUS OUTS"/.test(renderer), "LIV-019 FOH should have a Bus section label");
assert(/iemInputJack\(iem1, "a", "liv019-iem-1-input", "IEM 1 Input", false\)/.test(renderer), "LIV-019 should keep the IEM 1 input jack label");
assert(/iemInputJack\(iem3, "a", "liv019-iem-5-input", "IEM 5 Input", false\)/.test(renderer), "LIV-019 should keep the IEM 5 input jack label");
assert(!/gearText\(unit\.wrap, aLabel \+ " INPUT"/.test(renderer), "LIV-019 should not render duplicate generic IEM input overlays");
assert(!/gearText\(unit\.wrap, bLabel \+ " INPUT"/.test(renderer), "LIV-019 should not render duplicate generic IEM input overlays");
assert(/gearText\(unit\.wrap, "INPUT A", inputAX, inputAY/.test(renderer), "LIV-019 INPUT A labels should use locked antenna-label overlay positions");
assert(/gearText\(unit\.wrap, "INPUT B", inputBX, inputBY/.test(renderer), "LIV-019 INPUT B labels should use locked antenna-label overlay positions");
assert(/addKey\(route\.fromId\);[\s\S]*addKey\(route\.toId\);/.test(renderer), "native hints should read canonical manifest route endpoint ids");
assert(/setNativeHintsVisible\(visible\)[\s\S]*updateNativeHintHighlights\(\);[\s\S]*normalizeNativeRequiredHintRings\(\);/.test(renderer), "native hint toggling should apply required route endpoint rings");
assert(/syncLiv019HintRings\(nativeHintsVisible \? "toggle-on" : "toggle-off", nativeHintsVisible\);/.test(renderer), "LIV-019 hint visibility should sync from the persistent hint toggle state");
assert(/scheduleLiv019HintRingsResync\(nativeHintsVisible \? "deferred-resync-toggle-on" : "deferred-resync-toggle-off"\);/.test(renderer), "LIV-019 hint toggles should schedule a bounded deferred resync");
assert(/sf-liv019-hint-ring-layer/.test(renderer), "LIV-019 hints should use a dedicated visible ring layer");
assert(/z-index:2147483601/.test(renderer), "LIV-019 hint rings should sit above the promoted native cable layer");
assert(/ringLayer\.appendChild\(ring\);/.test(renderer), "LIV-019 hint ring layer should target route-derived jack positions");
assert(/redrawCables\(layer, reason\)[\s\S]*LEVEL_ID === "LIV-019" && nativeHintsVisible[\s\S]*syncLiv019HintRings\(reason \|\| "redraw-cables", true\);/.test(renderer), "LIV-019 active hints should rebuild after native cable redraws");
assert(/scheduleLiv019HintRingsResync\("deferred-resync-" \+ \(reason \|\| "redraw-cables"\)\);/.test(renderer), "LIV-019 cable redraws should schedule a bounded deferred resync");
assert(/redrawCables\(layer, route\.valid \? "route-added" : "invalid-route"\);/.test(renderer), "LIV-019 hint diagnostics should distinguish valid and invalid route redraws");
assert(/ringLayer\.replaceChildren\(\);/.test(renderer), "LIV-019 hint rebuild should be idempotent and avoid duplicate rings");
assert(/layer\.appendChild\(ringLayer\);/.test(renderer), "LIV-019 hint ring layer should be kept above route/cable redraw artifacts");
assert(/function liv019HintDocuments/.test(renderer), "LIV-019 hints should scan current, parent, and iframe documents");
assert(/parent-iframe-/.test(renderer), "LIV-019 hint document scan should include parent iframe documents");
assert(/layer\.querySelectorAll\("\.sf-native-jack, \.sf-native-source"\)/.test(renderer), "LIV-019 hint rings should target both jack and source endpoint nodes");
assert(/\.closest\("\.sf-native-liv019-source-panel"\)/.test(renderer), "LIV-019 hint rings should skip hidden source-panel duplicate nodes");
assert(/ring\.dataset\.sfLiv019HintKey = key;/.test(renderer), "LIV-019 visual hint rings should use a visual-only data key");
assert(!/ring\.dataset\.nodeKey = key;/.test(renderer), "LIV-019 visual hint rings must not masquerade as locked hitbox nodes");
assert(/targetIds: targetKeys/.test(renderer), "LIV-019 hint diagnostics should log route-derived target endpoint ids");
assert(/removedBecauseHidden/.test(renderer), "LIV-019 hint diagnostics should report when Hide Hints removes the ring layer");
assert(/ringLayerZIndex/.test(renderer), "LIV-019 hint diagnostics should report ring layer stacking");
assert(/coordinateSystem: "layer-local-from-getBoundingClientRect"/.test(renderer), "LIV-019 hint diagnostics should declare the ring coordinate system");
assert(/LIV-019 hint ring summary/.test(renderer), "LIV-019 hint builder should log target, match, and ring diagnostics");

assert(/kind: "stagebox", x: rect\.width \* 0\.045, y: layoutHeight \* 0\.330, width: rect\.width \* 0\.330/.test(renderer), "LIV-015 stagebox should use the spread layout");
assert(/kind: "foh", x: rect\.width \* 0\.445, y: layoutHeight \* 0\.075, width: rect\.width \* 0\.500/.test(renderer), "LIV-015 FOH should use the spread layout");
assert(/kind: "amp", x: rect\.width \* 0\.420, y: layoutHeight \* 0\.650, width: rect\.width \* 0\.500/.test(renderer), "LIV-015 processor should use the spread layout");

assert.equal(liv029Board.title, "Debate Panel Signal Flow", "LIV-029 board title should match the educational puzzle identity");
assert.equal(liv029Board.requiredRoutes.length, 11, "LIV-029 should require four receiver inputs, PA L/R, speaker L/R, press L/R, and moderator wedge");
assert(liv029Board.requiredRoutes.some(route => route.fromId === "wireless-receiver-ch4-audio-out" && route.toId === "console-input-4"), "LIV-029 should include the audience Q&A wireless route");
assert(liv029Board.requiredRoutes.some(route => route.fromId === "pa-processor-amp-l-output" && route.toId === "left-speaker-input"), "LIV-029 should include the left speaker output route");
assert(liv029Board.requiredRoutes.some(route => route.fromId === "console-matrix-record-l-output" && route.toId === "press-recorder-l-input"), "LIV-029 should use matrix/record outputs for the press feed");
assert(liv029Board.gear.some(item => item.asset.includes("wireless-receiver-panel-animated-aligned.svg")), "LIV-029 should use the corrected aligned wireless receiver asset");
assert(liv029Board.hitboxes.good.length >= 22, "LIV-029 should declare good hitboxes for every required endpoint");
assert(liv029Board.hitboxes.false.length >= 8, "LIV-029 should include false/trap jacks");
assert(liv029Board.educationalFeedback && Object.keys(liv029Board.educationalFeedback).length >= 5, "LIV-029 should include curated wrong-route educational feedback");
assert(liv029Board.acceptance.forbiddenText.includes("Drum Kit Stage Inputs"), "LIV-029 acceptance should guard against the old placeholder title");

assert.equal(liv029Normalized.title, liv029Board.title, "LIV-029 normalized manifest should mirror board title");
assert.equal(liv029Normalized.routeCount, liv029Board.requiredRoutes.length, "LIV-029 normalized route count should mirror source board");
assert(liv029Normalized.nodes.falseTrapKeys.includes("wireless-receiver-antenna-a"), "LIV-029 normalized manifest should expose antenna trap jacks");

assert(/title: "Debate Panel Signal Flow"/.test(renderer), "native LIV-029 title should match the educational puzzle identity");
assert(/wireless-receiver-panel-animated-aligned\.svg/.test(renderer), "native LIV-029 should use the corrected aligned receiver asset");
assert(liv029Board.puzzle && liv029Board.puzzle.puzzleMode === "signal-type", "LIV-029 source board should carry canonical puzzle metadata");
assert(liv029Normalized.puzzle && liv029Normalized.puzzle.puzzleMode === "signal-type", "LIV-029 normalized manifest should preserve canonical puzzle metadata");
assert(/function getLiveSoundPuzzleSpec/.test(renderer), "native renderer should expose a generic puzzle metadata reader");
assert(/function resolveLiveSoundPuzzleFeedback/.test(renderer), "native renderer should resolve feedback from generic puzzle metadata");
assert(/function showLiveSoundEducationalFeedback/.test(renderer), "native renderer should reuse a generic educational feedback toast");
assert(!/const LIV029_EDUCATIONAL_FEEDBACK/.test(renderer), "native renderer should not hard-code LIV-029 educational feedback as a board-specific constant");
assert(/puzzle:\s*\{[\s\S]*puzzleMode:\s*"signal-type"[\s\S]*rf-vs-audio/.test(renderer), "native LIV-029 spec should include top-level puzzle metadata");
assert(/resolveLiveSoundPuzzleFeedback\(getLiveSoundPuzzleSpec/.test(renderer), "native wrong-route path should resolve feedback through puzzle metadata");
assert(/function isLiveSoundPuzzleHintExcluded/.test(renderer), "native hint filtering should use a generic puzzle-aware exclusion helper");
assert(/LEVEL_ID === "LIV-029"[\s\S]*decision\.allowed = true/.test(renderer), "native route engine should commit LIV-029 invalid/trap routes for feedback");

const liv029LaunchBlock = launch.match(/"id": "LIV-029"[\s\S]*?"id": "LIV-030"/);
assert(liv029LaunchBlock, "LIV-029 launcher block should exist");
assert(/"title": "Debate Panel Signal Flow"/.test(liv029LaunchBlock[0]), "launcher LIV-029 title should match source board");
assert(/Audience Q&A Handheld Audio Out/.test(liv029LaunchBlock[0]), "launcher LIV-029 should list the audience Q&A route");
assert(!/Drum Kit Stage Inputs/.test(liv029LaunchBlock[0]), "launcher LIV-029 should not contain old drum placeholder copy");

console.log("live sound patch acceptance checks passed");
