# Live Sound Raw LIV Snippets

## LIV-001 — docs/build_notes_history/BUILD_NOTES_v1_40_93_BUILD_ROOM_GEAR_FIX.txt:11

```text
Changed:
- Fixed Build-the-Room shelf naming so vague labels like Audio Gear and Communication Interface no longer appear.
- Live Sound Build-the-Room shelves now derive needed equipment from the actual required routes, not only the training.needed list.
- Stage Box / Stagebox route endpoints now produce an Audio Snake shelf item for Live Sound.
- IEM TX endpoints now produce IEM Transmitter, not Headphones.
- Phone Hybrid, Comms Router, Intercom Beltpack, IEM Beltpack Receiver, System Processor, DI Box, Mixing Console, Microphone, and Audio Snake are specific named shelf items.

Verification targets:
- LIV-001 Build Room should require Microphone, Audio Snake, Mixing Console, and System Processor.
- LIV-013 Build Room should require Microphone, DI Box, Audio Snake, Mixing Console, and IEM Transmitter.
- No shelf item should display Audio Gear or Communication Interface.

Preserved:
- Route data and validation logic.
- v1.40.92 Live Sound consolidation layout pass.
- Stereo-pair completeness behavior.
```

## LIV-013 — docs/build_notes_history/BUILD_NOTES_v1_40_93_BUILD_ROOM_GEAR_FIX.txt:12

```text
- Fixed Build-the-Room shelf naming so vague labels like Audio Gear and Communication Interface no longer appear.
- Live Sound Build-the-Room shelves now derive needed equipment from the actual required routes, not only the training.needed list.
- Stage Box / Stagebox route endpoints now produce an Audio Snake shelf item for Live Sound.
- IEM TX endpoints now produce IEM Transmitter, not Headphones.
- Phone Hybrid, Comms Router, Intercom Beltpack, IEM Beltpack Receiver, System Processor, DI Box, Mixing Console, Microphone, and Audio Snake are specific named shelf items.

Verification targets:
- LIV-001 Build Room should require Microphone, Audio Snake, Mixing Console, and System Processor.
- LIV-013 Build Room should require Microphone, DI Box, Audio Snake, Mixing Console, and IEM Transmitter.
- No shelf item should display Audio Gear or Communication Interface.

Preserved:
- Route data and validation logic.
- v1.40.92 Live Sound consolidation layout pass.
- Stereo-pair completeness behavior.
```

## LIV-113 — docs/build_notes_history/BUILD_NOTES_v1_40_94_FULL_VARIETY_SYSTEMS.txt:16

```text
- Show Mode: live-pressure repair stage with animated show-status/meter treatment.
- IR / Convolution Lab: post-production send -> convolution reverb / IR loader -> stereo FX return workflow.
- Immersive Routing: infrastructure-based 5.1 routing: audio interface outputs -> speaker processor inputs -> speaker processor outputs -> physical speakers.
- Build-the-Room gear vocabulary expansion for speaker processors, convolution reverbs / IR loaders, and FX return sections.

New prototype levels:
- BRD-103 Find the Mistake: Cue Feed Interrupt
- BRD-104 Diagnose: Remote Mix-Minus
- LIV-113 Show Mode: IEM Right Side Gone
- PST-102 Immersive 5.1 Speaker Processor Order
- PST-103 Convolution Reverb IR Return

Important design notes:
- Immersive audio is now based on real-world infrastructure and channel identity, not simplified content rules.
- Music/effects are not restricted to L/R; surround and LFE usage is program-dependent.
- Stereo pair completeness remains enforced conceptually in the new IR and immersive examples.
- This is a broad prototype integration pass, not a final balancing pass.

Suggested smoke tests:
- Open BRD-103 and confirm Find-the-Mistake stage appears and completes by selecting the bad route.
- Open BRD-104 and confirm Diagnosis stage appears and completes by selecting the program-to-hybrid send error.
- Open LIV-113 and confirm Show Mode appears and completes by selecting the bad mains-to-IEM route.
```

## LIV-113 — docs/build_notes_history/BUILD_NOTES_v1_40_94_FULL_VARIETY_SYSTEMS.txt:29

```text
- Immersive audio is now based on real-world infrastructure and channel identity, not simplified content rules.
- Music/effects are not restricted to L/R; surround and LFE usage is program-dependent.
- Stereo pair completeness remains enforced conceptually in the new IR and immersive examples.
- This is a broad prototype integration pass, not a final balancing pass.

Suggested smoke tests:
- Open BRD-103 and confirm Find-the-Mistake stage appears and completes by selecting the bad route.
- Open BRD-104 and confirm Diagnosis stage appears and completes by selecting the program-to-hybrid send error.
- Open LIV-113 and confirm Show Mode appears and completes by selecting the bad mains-to-IEM route.
- Open PST-102 and confirm the immersive infrastructure stage appears.
- Open PST-103 and confirm the IR / Convolution Lab appears.
```

## LIV-013 — docs/build_notes_history/BUILD_NOTES_v1_40_95_VISUAL_MULTI_MODE_LIV013.txt:1

```text
Signal Flow v1.40.95 - Visual Multi-Mode LIV-013 Prototype

Base: v1.40.94 standalone full variety systems.

Added a visual-first multi-mode prototype based on the LIV-013 IEM system concept.

New prototype levels:
- LIV-213 Visual Build: Assemble the IEM System
- LIV-214 Visual Patch Lab
- LIV-215 Signal Inspection: Find the Mistake
- LIV-216 Diagnose: Performer Hears Left Only
- LIV-217 Show Mode: Restore the IEM Right Side
- LIV-218 Visual 5.1 Speaker Calibration: Interface to Processor
- LIV-219 Visual IR Lab: Convolution Reverb Return
```

## LIV-013 — docs/build_notes_history/BUILD_NOTES_v1_40_95_VISUAL_MULTI_MODE_LIV013.txt:5

```text
Signal Flow v1.40.95 - Visual Multi-Mode LIV-013 Prototype

Base: v1.40.94 standalone full variety systems.

Added a visual-first multi-mode prototype based on the LIV-013 IEM system concept.

New prototype levels:
- LIV-213 Visual Build: Assemble the IEM System
- LIV-214 Visual Patch Lab
- LIV-215 Signal Inspection: Find the Mistake
- LIV-216 Diagnose: Performer Hears Left Only
- LIV-217 Show Mode: Restore the IEM Right Side
- LIV-218 Visual 5.1 Speaker Calibration: Interface to Processor
- LIV-219 Visual IR Lab: Convolution Reverb Return

Interaction/UI additions:
- Visual signal-flow cards for source -> stagebox -> snake -> console -> IEM transmitter.
- Signal pulse / stereo mate assist visual controls for patch mode.
```

## LIV-213 — docs/build_notes_history/BUILD_NOTES_v1_40_95_VISUAL_MULTI_MODE_LIV013.txt:8

```text
Signal Flow v1.40.95 - Visual Multi-Mode LIV-013 Prototype

Base: v1.40.94 standalone full variety systems.

Added a visual-first multi-mode prototype based on the LIV-013 IEM system concept.

New prototype levels:
- LIV-213 Visual Build: Assemble the IEM System
- LIV-214 Visual Patch Lab
- LIV-215 Signal Inspection: Find the Mistake
- LIV-216 Diagnose: Performer Hears Left Only
- LIV-217 Show Mode: Restore the IEM Right Side
- LIV-218 Visual 5.1 Speaker Calibration: Interface to Processor
- LIV-219 Visual IR Lab: Convolution Reverb Return

Interaction/UI additions:
- Visual signal-flow cards for source -> stagebox -> snake -> console -> IEM transmitter.
- Signal pulse / stereo mate assist visual controls for patch mode.
- Probe tool + trace cable panel for Find-the-Mistake.
- Diagnosis layout with routing monitor, inject signal button, IEM vitals, and trace action.
- Show Mode crisis layout with performer status, protected PA mains note, and show clock.
```

## LIV-214 — docs/build_notes_history/BUILD_NOTES_v1_40_95_VISUAL_MULTI_MODE_LIV013.txt:9

```text
Signal Flow v1.40.95 - Visual Multi-Mode LIV-013 Prototype

Base: v1.40.94 standalone full variety systems.

Added a visual-first multi-mode prototype based on the LIV-013 IEM system concept.

New prototype levels:
- LIV-213 Visual Build: Assemble the IEM System
- LIV-214 Visual Patch Lab
- LIV-215 Signal Inspection: Find the Mistake
- LIV-216 Diagnose: Performer Hears Left Only
- LIV-217 Show Mode: Restore the IEM Right Side
- LIV-218 Visual 5.1 Speaker Calibration: Interface to Processor
- LIV-219 Visual IR Lab: Convolution Reverb Return

Interaction/UI additions:
- Visual signal-flow cards for source -> stagebox -> snake -> console -> IEM transmitter.
- Signal pulse / stereo mate assist visual controls for patch mode.
- Probe tool + trace cable panel for Find-the-Mistake.
- Diagnosis layout with routing monitor, inject signal button, IEM vitals, and trace action.
- Show Mode crisis layout with performer status, protected PA mains note, and show clock.
- Speaker calibration room layout for infrastructure-based 5.1 routing.
```

## LIV-215 — docs/build_notes_history/BUILD_NOTES_v1_40_95_VISUAL_MULTI_MODE_LIV013.txt:10

```text

Base: v1.40.94 standalone full variety systems.

Added a visual-first multi-mode prototype based on the LIV-013 IEM system concept.

New prototype levels:
- LIV-213 Visual Build: Assemble the IEM System
- LIV-214 Visual Patch Lab
- LIV-215 Signal Inspection: Find the Mistake
- LIV-216 Diagnose: Performer Hears Left Only
- LIV-217 Show Mode: Restore the IEM Right Side
- LIV-218 Visual 5.1 Speaker Calibration: Interface to Processor
- LIV-219 Visual IR Lab: Convolution Reverb Return

Interaction/UI additions:
- Visual signal-flow cards for source -> stagebox -> snake -> console -> IEM transmitter.
- Signal pulse / stereo mate assist visual controls for patch mode.
- Probe tool + trace cable panel for Find-the-Mistake.
- Diagnosis layout with routing monitor, inject signal button, IEM vitals, and trace action.
- Show Mode crisis layout with performer status, protected PA mains note, and show clock.
- Speaker calibration room layout for infrastructure-based 5.1 routing.
- Convolution reverb / IR loader lab with waveform, room preview, and stereo return choices.
```

## LIV-216 — docs/build_notes_history/BUILD_NOTES_v1_40_95_VISUAL_MULTI_MODE_LIV013.txt:11

```text
Base: v1.40.94 standalone full variety systems.

Added a visual-first multi-mode prototype based on the LIV-013 IEM system concept.

New prototype levels:
- LIV-213 Visual Build: Assemble the IEM System
- LIV-214 Visual Patch Lab
- LIV-215 Signal Inspection: Find the Mistake
- LIV-216 Diagnose: Performer Hears Left Only
- LIV-217 Show Mode: Restore the IEM Right Side
- LIV-218 Visual 5.1 Speaker Calibration: Interface to Processor
- LIV-219 Visual IR Lab: Convolution Reverb Return

Interaction/UI additions:
- Visual signal-flow cards for source -> stagebox -> snake -> console -> IEM transmitter.
- Signal pulse / stereo mate assist visual controls for patch mode.
- Probe tool + trace cable panel for Find-the-Mistake.
- Diagnosis layout with routing monitor, inject signal button, IEM vitals, and trace action.
- Show Mode crisis layout with performer status, protected PA mains note, and show clock.
- Speaker calibration room layout for infrastructure-based 5.1 routing.
- Convolution reverb / IR loader lab with waveform, room preview, and stereo return choices.

```

## LIV-217 — docs/build_notes_history/BUILD_NOTES_v1_40_95_VISUAL_MULTI_MODE_LIV013.txt:12

```text

Added a visual-first multi-mode prototype based on the LIV-013 IEM system concept.

New prototype levels:
- LIV-213 Visual Build: Assemble the IEM System
- LIV-214 Visual Patch Lab
- LIV-215 Signal Inspection: Find the Mistake
- LIV-216 Diagnose: Performer Hears Left Only
- LIV-217 Show Mode: Restore the IEM Right Side
- LIV-218 Visual 5.1 Speaker Calibration: Interface to Processor
- LIV-219 Visual IR Lab: Convolution Reverb Return

Interaction/UI additions:
- Visual signal-flow cards for source -> stagebox -> snake -> console -> IEM transmitter.
- Signal pulse / stereo mate assist visual controls for patch mode.
- Probe tool + trace cable panel for Find-the-Mistake.
- Diagnosis layout with routing monitor, inject signal button, IEM vitals, and trace action.
- Show Mode crisis layout with performer status, protected PA mains note, and show clock.
- Speaker calibration room layout for infrastructure-based 5.1 routing.
- Convolution reverb / IR loader lab with waveform, room preview, and stereo return choices.

Kept route logic consistent with the existing rule set:
```

## LIV-218 — docs/build_notes_history/BUILD_NOTES_v1_40_95_VISUAL_MULTI_MODE_LIV013.txt:13

```text
Added a visual-first multi-mode prototype based on the LIV-013 IEM system concept.

New prototype levels:
- LIV-213 Visual Build: Assemble the IEM System
- LIV-214 Visual Patch Lab
- LIV-215 Signal Inspection: Find the Mistake
- LIV-216 Diagnose: Performer Hears Left Only
- LIV-217 Show Mode: Restore the IEM Right Side
- LIV-218 Visual 5.1 Speaker Calibration: Interface to Processor
- LIV-219 Visual IR Lab: Convolution Reverb Return

Interaction/UI additions:
- Visual signal-flow cards for source -> stagebox -> snake -> console -> IEM transmitter.
- Signal pulse / stereo mate assist visual controls for patch mode.
- Probe tool + trace cable panel for Find-the-Mistake.
- Diagnosis layout with routing monitor, inject signal button, IEM vitals, and trace action.
- Show Mode crisis layout with performer status, protected PA mains note, and show clock.
- Speaker calibration room layout for infrastructure-based 5.1 routing.
- Convolution reverb / IR loader lab with waveform, room preview, and stereo return choices.

Kept route logic consistent with the existing rule set:
- Stagebox signal path requires an audio snake in Build mode.
```

## LIV-219 — docs/build_notes_history/BUILD_NOTES_v1_40_95_VISUAL_MULTI_MODE_LIV013.txt:14

```text

New prototype levels:
- LIV-213 Visual Build: Assemble the IEM System
- LIV-214 Visual Patch Lab
- LIV-215 Signal Inspection: Find the Mistake
- LIV-216 Diagnose: Performer Hears Left Only
- LIV-217 Show Mode: Restore the IEM Right Side
- LIV-218 Visual 5.1 Speaker Calibration: Interface to Processor
- LIV-219 Visual IR Lab: Convolution Reverb Return

Interaction/UI additions:
- Visual signal-flow cards for source -> stagebox -> snake -> console -> IEM transmitter.
- Signal pulse / stereo mate assist visual controls for patch mode.
- Probe tool + trace cable panel for Find-the-Mistake.
- Diagnosis layout with routing monitor, inject signal button, IEM vitals, and trace action.
- Show Mode crisis layout with performer status, protected PA mains note, and show clock.
- Speaker calibration room layout for infrastructure-based 5.1 routing.
- Convolution reverb / IR loader lab with waveform, room preview, and stereo return choices.

Kept route logic consistent with the existing rule set:
- Stagebox signal path requires an audio snake in Build mode.
- IEM uses IEM Transmitter, not headphones.
```

## LIV-213 — docs/build_notes_history/BUILD_NOTES_v1_40_96_VISUAL_MODES_REWORK.txt:6

```text
Signal Flow v1.40.96 - Visual Modes Rework

Based on user notes from v1.40.95.

Changed:
- LIV-213 Visual Build now uses novice-friendly real-world names and a custom shelf/placement UI.
- Removed vague concepts such as Signal Utility Box.
- Renamed the stagebox concept to Stage Snake for beginner clarity, described as stage box plus multicore path.
- Icons are simplified toward real-world roles; snake is no longer represented by a dial-style utility icon.
- LIV-214 is now Flow Assembly: draggable gear icons move into signal-flow boxes instead of presenting another text-heavy patch list.
- LIV-215 is narrowed to a lightweight visual bad-cable review so it is not trying to duplicate Diagnose.
- LIV-216 now uses the established diagnosis/clinic board style because the existing diagnosis levels were stronger.
- LIV-217 Show Mode now shows a patched system with one bad route, tells the player where sound is not arriving, and asks for the correct repatch.
- Added explicit PST-102 and PST-103 level IDs in addition to legacy LIV-218/LIV-219 aliases.
- PST-102 implements infrastructure-based 5.1 routing: interface -> speaker processor -> physical speakers.
- PST-103 implements a visual convolution reverb / IR send-return lab.

Preserved:
- No core route data rewrites outside prototype levels.
```

## LIV-214 — docs/build_notes_history/BUILD_NOTES_v1_40_96_VISUAL_MODES_REWORK.txt:10

```text

Based on user notes from v1.40.95.

Changed:
- LIV-213 Visual Build now uses novice-friendly real-world names and a custom shelf/placement UI.
- Removed vague concepts such as Signal Utility Box.
- Renamed the stagebox concept to Stage Snake for beginner clarity, described as stage box plus multicore path.
- Icons are simplified toward real-world roles; snake is no longer represented by a dial-style utility icon.
- LIV-214 is now Flow Assembly: draggable gear icons move into signal-flow boxes instead of presenting another text-heavy patch list.
- LIV-215 is narrowed to a lightweight visual bad-cable review so it is not trying to duplicate Diagnose.
- LIV-216 now uses the established diagnosis/clinic board style because the existing diagnosis levels were stronger.
- LIV-217 Show Mode now shows a patched system with one bad route, tells the player where sound is not arriving, and asks for the correct repatch.
- Added explicit PST-102 and PST-103 level IDs in addition to legacy LIV-218/LIV-219 aliases.
- PST-102 implements infrastructure-based 5.1 routing: interface -> speaker processor -> physical speakers.
- PST-103 implements a visual convolution reverb / IR send-return lab.

Preserved:
- No core route data rewrites outside prototype levels.
- Stereo pair completeness.
- Live sound monitor vs PA separation.
- Existing v1.40.95 levels remain overridden by the v1.40.96 patch layer.
```

## LIV-215 — docs/build_notes_history/BUILD_NOTES_v1_40_96_VISUAL_MODES_REWORK.txt:11

```text
Based on user notes from v1.40.95.

Changed:
- LIV-213 Visual Build now uses novice-friendly real-world names and a custom shelf/placement UI.
- Removed vague concepts such as Signal Utility Box.
- Renamed the stagebox concept to Stage Snake for beginner clarity, described as stage box plus multicore path.
- Icons are simplified toward real-world roles; snake is no longer represented by a dial-style utility icon.
- LIV-214 is now Flow Assembly: draggable gear icons move into signal-flow boxes instead of presenting another text-heavy patch list.
- LIV-215 is narrowed to a lightweight visual bad-cable review so it is not trying to duplicate Diagnose.
- LIV-216 now uses the established diagnosis/clinic board style because the existing diagnosis levels were stronger.
- LIV-217 Show Mode now shows a patched system with one bad route, tells the player where sound is not arriving, and asks for the correct repatch.
- Added explicit PST-102 and PST-103 level IDs in addition to legacy LIV-218/LIV-219 aliases.
- PST-102 implements infrastructure-based 5.1 routing: interface -> speaker processor -> physical speakers.
- PST-103 implements a visual convolution reverb / IR send-return lab.

Preserved:
- No core route data rewrites outside prototype levels.
- Stereo pair completeness.
- Live sound monitor vs PA separation.
- Existing v1.40.95 levels remain overridden by the v1.40.96 patch layer.
```

## LIV-216 — docs/build_notes_history/BUILD_NOTES_v1_40_96_VISUAL_MODES_REWORK.txt:12

```text

Changed:
- LIV-213 Visual Build now uses novice-friendly real-world names and a custom shelf/placement UI.
- Removed vague concepts such as Signal Utility Box.
- Renamed the stagebox concept to Stage Snake for beginner clarity, described as stage box plus multicore path.
- Icons are simplified toward real-world roles; snake is no longer represented by a dial-style utility icon.
- LIV-214 is now Flow Assembly: draggable gear icons move into signal-flow boxes instead of presenting another text-heavy patch list.
- LIV-215 is narrowed to a lightweight visual bad-cable review so it is not trying to duplicate Diagnose.
- LIV-216 now uses the established diagnosis/clinic board style because the existing diagnosis levels were stronger.
- LIV-217 Show Mode now shows a patched system with one bad route, tells the player where sound is not arriving, and asks for the correct repatch.
- Added explicit PST-102 and PST-103 level IDs in addition to legacy LIV-218/LIV-219 aliases.
- PST-102 implements infrastructure-based 5.1 routing: interface -> speaker processor -> physical speakers.
- PST-103 implements a visual convolution reverb / IR send-return lab.

Preserved:
- No core route data rewrites outside prototype levels.
- Stereo pair completeness.
- Live sound monitor vs PA separation.
- Existing v1.40.95 levels remain overridden by the v1.40.96 patch layer.
```

## LIV-217 — docs/build_notes_history/BUILD_NOTES_v1_40_96_VISUAL_MODES_REWORK.txt:13

```text
Changed:
- LIV-213 Visual Build now uses novice-friendly real-world names and a custom shelf/placement UI.
- Removed vague concepts such as Signal Utility Box.
- Renamed the stagebox concept to Stage Snake for beginner clarity, described as stage box plus multicore path.
- Icons are simplified toward real-world roles; snake is no longer represented by a dial-style utility icon.
- LIV-214 is now Flow Assembly: draggable gear icons move into signal-flow boxes instead of presenting another text-heavy patch list.
- LIV-215 is narrowed to a lightweight visual bad-cable review so it is not trying to duplicate Diagnose.
- LIV-216 now uses the established diagnosis/clinic board style because the existing diagnosis levels were stronger.
- LIV-217 Show Mode now shows a patched system with one bad route, tells the player where sound is not arriving, and asks for the correct repatch.
- Added explicit PST-102 and PST-103 level IDs in addition to legacy LIV-218/LIV-219 aliases.
- PST-102 implements infrastructure-based 5.1 routing: interface -> speaker processor -> physical speakers.
- PST-103 implements a visual convolution reverb / IR send-return lab.

Preserved:
- No core route data rewrites outside prototype levels.
- Stereo pair completeness.
- Live sound monitor vs PA separation.
- Existing v1.40.95 levels remain overridden by the v1.40.96 patch layer.
```

## LIV-218 — docs/build_notes_history/BUILD_NOTES_v1_40_96_VISUAL_MODES_REWORK.txt:14

```text
- LIV-213 Visual Build now uses novice-friendly real-world names and a custom shelf/placement UI.
- Removed vague concepts such as Signal Utility Box.
- Renamed the stagebox concept to Stage Snake for beginner clarity, described as stage box plus multicore path.
- Icons are simplified toward real-world roles; snake is no longer represented by a dial-style utility icon.
- LIV-214 is now Flow Assembly: draggable gear icons move into signal-flow boxes instead of presenting another text-heavy patch list.
- LIV-215 is narrowed to a lightweight visual bad-cable review so it is not trying to duplicate Diagnose.
- LIV-216 now uses the established diagnosis/clinic board style because the existing diagnosis levels were stronger.
- LIV-217 Show Mode now shows a patched system with one bad route, tells the player where sound is not arriving, and asks for the correct repatch.
- Added explicit PST-102 and PST-103 level IDs in addition to legacy LIV-218/LIV-219 aliases.
- PST-102 implements infrastructure-based 5.1 routing: interface -> speaker processor -> physical speakers.
- PST-103 implements a visual convolution reverb / IR send-return lab.

Preserved:
- No core route data rewrites outside prototype levels.
- Stereo pair completeness.
- Live sound monitor vs PA separation.
- Existing v1.40.95 levels remain overridden by the v1.40.96 patch layer.
```

## LIV-219 — docs/build_notes_history/BUILD_NOTES_v1_40_96_VISUAL_MODES_REWORK.txt:14

```text
- LIV-213 Visual Build now uses novice-friendly real-world names and a custom shelf/placement UI.
- Removed vague concepts such as Signal Utility Box.
- Renamed the stagebox concept to Stage Snake for beginner clarity, described as stage box plus multicore path.
- Icons are simplified toward real-world roles; snake is no longer represented by a dial-style utility icon.
- LIV-214 is now Flow Assembly: draggable gear icons move into signal-flow boxes instead of presenting another text-heavy patch list.
- LIV-215 is narrowed to a lightweight visual bad-cable review so it is not trying to duplicate Diagnose.
- LIV-216 now uses the established diagnosis/clinic board style because the existing diagnosis levels were stronger.
- LIV-217 Show Mode now shows a patched system with one bad route, tells the player where sound is not arriving, and asks for the correct repatch.
- Added explicit PST-102 and PST-103 level IDs in addition to legacy LIV-218/LIV-219 aliases.
- PST-102 implements infrastructure-based 5.1 routing: interface -> speaker processor -> physical speakers.
- PST-103 implements a visual convolution reverb / IR send-return lab.

Preserved:
- No core route data rewrites outside prototype levels.
- Stereo pair completeness.
- Live sound monitor vs PA separation.
- Existing v1.40.95 levels remain overridden by the v1.40.96 patch layer.
```

## LIV-213 — docs/build_notes_history/BUILD_NOTES_v1_40_97_VISUAL_MODES_CORRECTIVE.txt:6

```text
Signal Flow v1.40.97 Standalone - Visual Modes Corrective Pass

Base: v1.40.96 standalone.

User-note corrections applied:
- LIV-213: corrected to a novice-friendly real-world naming convention. Removed vague/non-real gear language such as Signal Utility Box. Stage box concept is now presented as Stage Snake for beginner clarity. Target drop boxes are numbered only, with no hidden answer text. Submit control is sticky/visible instead of trapped below the scroll area.
- LIV-214: rebuilt as a numbered visual flow assembly. Boxes are numbered only; the player must decide what goes where. Gear remains draggable/click-placeable after being placed so mistakes can be corrected.
- LIV-215: added a working Cable Inspection / Find the Bad Patch prototype. This is intentionally simpler than Diagnose: a visible cable is wrong and a silent meter indicates the affected destination.
- LIV-216: reverted to the existing/current diagnosis board style rather than the experimental visual diagnosis panel.
- LIV-217: rebuilt as a more visual Show Mode. It shows a patched live system with one visible wrong route: Aux 5 R is patched to PA Right instead of IEM TX R. The player is told only the symptom visually: right ear silent / IEM R meter dead.
- PST-102 / LIV-218: revised 5.1 prototype around real-world infrastructure: audio interface outputs feed a speaker processor, which maps to physical speakers. The lesson is preserving channel identity, not routing by content type.
- PST-103 / LIV-219: replaced prior IR workflow with a Space Match Lab. It shows a physical room preview and a Bricasti M7-style convolution IR selector with 24 impulse-response positions. Correct target is IR 24 / Production Room.

Validation:
- patch_v14097.js passed node --check.
- No core route engine changes intended; this is an overlay/prototype training-mode pass.
```

## LIV-214 — docs/build_notes_history/BUILD_NOTES_v1_40_97_VISUAL_MODES_CORRECTIVE.txt:7

```text
Signal Flow v1.40.97 Standalone - Visual Modes Corrective Pass

Base: v1.40.96 standalone.

User-note corrections applied:
- LIV-213: corrected to a novice-friendly real-world naming convention. Removed vague/non-real gear language such as Signal Utility Box. Stage box concept is now presented as Stage Snake for beginner clarity. Target drop boxes are numbered only, with no hidden answer text. Submit control is sticky/visible instead of trapped below the scroll area.
- LIV-214: rebuilt as a numbered visual flow assembly. Boxes are numbered only; the player must decide what goes where. Gear remains draggable/click-placeable after being placed so mistakes can be corrected.
- LIV-215: added a working Cable Inspection / Find the Bad Patch prototype. This is intentionally simpler than Diagnose: a visible cable is wrong and a silent meter indicates the affected destination.
- LIV-216: reverted to the existing/current diagnosis board style rather than the experimental visual diagnosis panel.
- LIV-217: rebuilt as a more visual Show Mode. It shows a patched live system with one visible wrong route: Aux 5 R is patched to PA Right instead of IEM TX R. The player is told only the symptom visually: right ear silent / IEM R meter dead.
- PST-102 / LIV-218: revised 5.1 prototype around real-world infrastructure: audio interface outputs feed a speaker processor, which maps to physical speakers. The lesson is preserving channel identity, not routing by content type.
- PST-103 / LIV-219: replaced prior IR workflow with a Space Match Lab. It shows a physical room preview and a Bricasti M7-style convolution IR selector with 24 impulse-response positions. Correct target is IR 24 / Production Room.

Validation:
- patch_v14097.js passed node --check.
- No core route engine changes intended; this is an overlay/prototype training-mode pass.
```

## LIV-215 — docs/build_notes_history/BUILD_NOTES_v1_40_97_VISUAL_MODES_CORRECTIVE.txt:8

```text
Signal Flow v1.40.97 Standalone - Visual Modes Corrective Pass

Base: v1.40.96 standalone.

User-note corrections applied:
- LIV-213: corrected to a novice-friendly real-world naming convention. Removed vague/non-real gear language such as Signal Utility Box. Stage box concept is now presented as Stage Snake for beginner clarity. Target drop boxes are numbered only, with no hidden answer text. Submit control is sticky/visible instead of trapped below the scroll area.
- LIV-214: rebuilt as a numbered visual flow assembly. Boxes are numbered only; the player must decide what goes where. Gear remains draggable/click-placeable after being placed so mistakes can be corrected.
- LIV-215: added a working Cable Inspection / Find the Bad Patch prototype. This is intentionally simpler than Diagnose: a visible cable is wrong and a silent meter indicates the affected destination.
- LIV-216: reverted to the existing/current diagnosis board style rather than the experimental visual diagnosis panel.
- LIV-217: rebuilt as a more visual Show Mode. It shows a patched live system with one visible wrong route: Aux 5 R is patched to PA Right instead of IEM TX R. The player is told only the symptom visually: right ear silent / IEM R meter dead.
- PST-102 / LIV-218: revised 5.1 prototype around real-world infrastructure: audio interface outputs feed a speaker processor, which maps to physical speakers. The lesson is preserving channel identity, not routing by content type.
- PST-103 / LIV-219: replaced prior IR workflow with a Space Match Lab. It shows a physical room preview and a Bricasti M7-style convolution IR selector with 24 impulse-response positions. Correct target is IR 24 / Production Room.

Validation:
- patch_v14097.js passed node --check.
- No core route engine changes intended; this is an overlay/prototype training-mode pass.
```

## LIV-216 — docs/build_notes_history/BUILD_NOTES_v1_40_97_VISUAL_MODES_CORRECTIVE.txt:9

```text
Signal Flow v1.40.97 Standalone - Visual Modes Corrective Pass

Base: v1.40.96 standalone.

User-note corrections applied:
- LIV-213: corrected to a novice-friendly real-world naming convention. Removed vague/non-real gear language such as Signal Utility Box. Stage box concept is now presented as Stage Snake for beginner clarity. Target drop boxes are numbered only, with no hidden answer text. Submit control is sticky/visible instead of trapped below the scroll area.
- LIV-214: rebuilt as a numbered visual flow assembly. Boxes are numbered only; the player must decide what goes where. Gear remains draggable/click-placeable after being placed so mistakes can be corrected.
- LIV-215: added a working Cable Inspection / Find the Bad Patch prototype. This is intentionally simpler than Diagnose: a visible cable is wrong and a silent meter indicates the affected destination.
- LIV-216: reverted to the existing/current diagnosis board style rather than the experimental visual diagnosis panel.
- LIV-217: rebuilt as a more visual Show Mode. It shows a patched live system with one visible wrong route: Aux 5 R is patched to PA Right instead of IEM TX R. The player is told only the symptom visually: right ear silent / IEM R meter dead.
- PST-102 / LIV-218: revised 5.1 prototype around real-world infrastructure: audio interface outputs feed a speaker processor, which maps to physical speakers. The lesson is preserving channel identity, not routing by content type.
- PST-103 / LIV-219: replaced prior IR workflow with a Space Match Lab. It shows a physical room preview and a Bricasti M7-style convolution IR selector with 24 impulse-response positions. Correct target is IR 24 / Production Room.

Validation:
- patch_v14097.js passed node --check.
- No core route engine changes intended; this is an overlay/prototype training-mode pass.
```

## LIV-217 — docs/build_notes_history/BUILD_NOTES_v1_40_97_VISUAL_MODES_CORRECTIVE.txt:10

```text

Base: v1.40.96 standalone.

User-note corrections applied:
- LIV-213: corrected to a novice-friendly real-world naming convention. Removed vague/non-real gear language such as Signal Utility Box. Stage box concept is now presented as Stage Snake for beginner clarity. Target drop boxes are numbered only, with no hidden answer text. Submit control is sticky/visible instead of trapped below the scroll area.
- LIV-214: rebuilt as a numbered visual flow assembly. Boxes are numbered only; the player must decide what goes where. Gear remains draggable/click-placeable after being placed so mistakes can be corrected.
- LIV-215: added a working Cable Inspection / Find the Bad Patch prototype. This is intentionally simpler than Diagnose: a visible cable is wrong and a silent meter indicates the affected destination.
- LIV-216: reverted to the existing/current diagnosis board style rather than the experimental visual diagnosis panel.
- LIV-217: rebuilt as a more visual Show Mode. It shows a patched live system with one visible wrong route: Aux 5 R is patched to PA Right instead of IEM TX R. The player is told only the symptom visually: right ear silent / IEM R meter dead.
- PST-102 / LIV-218: revised 5.1 prototype around real-world infrastructure: audio interface outputs feed a speaker processor, which maps to physical speakers. The lesson is preserving channel identity, not routing by content type.
- PST-103 / LIV-219: replaced prior IR workflow with a Space Match Lab. It shows a physical room preview and a Bricasti M7-style convolution IR selector with 24 impulse-response positions. Correct target is IR 24 / Production Room.

Validation:
- patch_v14097.js passed node --check.
- No core route engine changes intended; this is an overlay/prototype training-mode pass.
```

## LIV-218 — docs/build_notes_history/BUILD_NOTES_v1_40_97_VISUAL_MODES_CORRECTIVE.txt:11

```text
Base: v1.40.96 standalone.

User-note corrections applied:
- LIV-213: corrected to a novice-friendly real-world naming convention. Removed vague/non-real gear language such as Signal Utility Box. Stage box concept is now presented as Stage Snake for beginner clarity. Target drop boxes are numbered only, with no hidden answer text. Submit control is sticky/visible instead of trapped below the scroll area.
- LIV-214: rebuilt as a numbered visual flow assembly. Boxes are numbered only; the player must decide what goes where. Gear remains draggable/click-placeable after being placed so mistakes can be corrected.
- LIV-215: added a working Cable Inspection / Find the Bad Patch prototype. This is intentionally simpler than Diagnose: a visible cable is wrong and a silent meter indicates the affected destination.
- LIV-216: reverted to the existing/current diagnosis board style rather than the experimental visual diagnosis panel.
- LIV-217: rebuilt as a more visual Show Mode. It shows a patched live system with one visible wrong route: Aux 5 R is patched to PA Right instead of IEM TX R. The player is told only the symptom visually: right ear silent / IEM R meter dead.
- PST-102 / LIV-218: revised 5.1 prototype around real-world infrastructure: audio interface outputs feed a speaker processor, which maps to physical speakers. The lesson is preserving channel identity, not routing by content type.
- PST-103 / LIV-219: replaced prior IR workflow with a Space Match Lab. It shows a physical room preview and a Bricasti M7-style convolution IR selector with 24 impulse-response positions. Correct target is IR 24 / Production Room.

Validation:
- patch_v14097.js passed node --check.
- No core route engine changes intended; this is an overlay/prototype training-mode pass.
```

## LIV-219 — docs/build_notes_history/BUILD_NOTES_v1_40_97_VISUAL_MODES_CORRECTIVE.txt:12

```text

User-note corrections applied:
- LIV-213: corrected to a novice-friendly real-world naming convention. Removed vague/non-real gear language such as Signal Utility Box. Stage box concept is now presented as Stage Snake for beginner clarity. Target drop boxes are numbered only, with no hidden answer text. Submit control is sticky/visible instead of trapped below the scroll area.
- LIV-214: rebuilt as a numbered visual flow assembly. Boxes are numbered only; the player must decide what goes where. Gear remains draggable/click-placeable after being placed so mistakes can be corrected.
- LIV-215: added a working Cable Inspection / Find the Bad Patch prototype. This is intentionally simpler than Diagnose: a visible cable is wrong and a silent meter indicates the affected destination.
- LIV-216: reverted to the existing/current diagnosis board style rather than the experimental visual diagnosis panel.
- LIV-217: rebuilt as a more visual Show Mode. It shows a patched live system with one visible wrong route: Aux 5 R is patched to PA Right instead of IEM TX R. The player is told only the symptom visually: right ear silent / IEM R meter dead.
- PST-102 / LIV-218: revised 5.1 prototype around real-world infrastructure: audio interface outputs feed a speaker processor, which maps to physical speakers. The lesson is preserving channel identity, not routing by content type.
- PST-103 / LIV-219: replaced prior IR workflow with a Space Match Lab. It shows a physical room preview and a Bricasti M7-style convolution IR selector with 24 impulse-response positions. Correct target is IR 24 / Production Room.

Validation:
- patch_v14097.js passed node --check.
- No core route engine changes intended; this is an overlay/prototype training-mode pass.
```

## LIV-213 — docs/build_notes_history/BUILD_NOTES_v1_40_98_ACTUAL_VISUAL_MODE_FIX.txt:7

```text
Signal Flow v1.40.98 Actual Visual Mode Fix

This build corrects the v1.40.97 issue where the new prototype renderer did not take effect.

Changes:
- Reassigned the actual global trainingLanePanel and bindTrainingLanePanel functions instead of only setting window properties.
- LIV-213: numbered drop boxes only; real-world novice-friendly names; Stage Snake naming; sticky submit.
- LIV-214: numbered-only drag/drop flow assembly; items remain movable after placement.
- LIV-215: visible cable-inspection prototype now rendered.
- LIV-216: restored to the existing diagnosis-board style.
- LIV-217: visual patched-system repair with meters and clickable bad cable.
- PST-102/LIV-218: 5.1 interface to speaker processor calibration prototype.
- PST-103/LIV-219: 24-position M7-style IR dial / physical-space match lab.

Verification:
- patch_v14098.js passes node --check.
- HTML includes sfv198-actual-js and sfv198-actual-css.
```

## LIV-214 — docs/build_notes_history/BUILD_NOTES_v1_40_98_ACTUAL_VISUAL_MODE_FIX.txt:8

```text
Signal Flow v1.40.98 Actual Visual Mode Fix

This build corrects the v1.40.97 issue where the new prototype renderer did not take effect.

Changes:
- Reassigned the actual global trainingLanePanel and bindTrainingLanePanel functions instead of only setting window properties.
- LIV-213: numbered drop boxes only; real-world novice-friendly names; Stage Snake naming; sticky submit.
- LIV-214: numbered-only drag/drop flow assembly; items remain movable after placement.
- LIV-215: visible cable-inspection prototype now rendered.
- LIV-216: restored to the existing diagnosis-board style.
- LIV-217: visual patched-system repair with meters and clickable bad cable.
- PST-102/LIV-218: 5.1 interface to speaker processor calibration prototype.
- PST-103/LIV-219: 24-position M7-style IR dial / physical-space match lab.

Verification:
- patch_v14098.js passes node --check.
- HTML includes sfv198-actual-js and sfv198-actual-css.
```

## LIV-215 — docs/build_notes_history/BUILD_NOTES_v1_40_98_ACTUAL_VISUAL_MODE_FIX.txt:9

```text
Signal Flow v1.40.98 Actual Visual Mode Fix

This build corrects the v1.40.97 issue where the new prototype renderer did not take effect.

Changes:
- Reassigned the actual global trainingLanePanel and bindTrainingLanePanel functions instead of only setting window properties.
- LIV-213: numbered drop boxes only; real-world novice-friendly names; Stage Snake naming; sticky submit.
- LIV-214: numbered-only drag/drop flow assembly; items remain movable after placement.
- LIV-215: visible cable-inspection prototype now rendered.
- LIV-216: restored to the existing diagnosis-board style.
- LIV-217: visual patched-system repair with meters and clickable bad cable.
- PST-102/LIV-218: 5.1 interface to speaker processor calibration prototype.
- PST-103/LIV-219: 24-position M7-style IR dial / physical-space match lab.

Verification:
- patch_v14098.js passes node --check.
- HTML includes sfv198-actual-js and sfv198-actual-css.
```

## LIV-216 — docs/build_notes_history/BUILD_NOTES_v1_40_98_ACTUAL_VISUAL_MODE_FIX.txt:10

```text

This build corrects the v1.40.97 issue where the new prototype renderer did not take effect.

Changes:
- Reassigned the actual global trainingLanePanel and bindTrainingLanePanel functions instead of only setting window properties.
- LIV-213: numbered drop boxes only; real-world novice-friendly names; Stage Snake naming; sticky submit.
- LIV-214: numbered-only drag/drop flow assembly; items remain movable after placement.
- LIV-215: visible cable-inspection prototype now rendered.
- LIV-216: restored to the existing diagnosis-board style.
- LIV-217: visual patched-system repair with meters and clickable bad cable.
- PST-102/LIV-218: 5.1 interface to speaker processor calibration prototype.
- PST-103/LIV-219: 24-position M7-style IR dial / physical-space match lab.

Verification:
- patch_v14098.js passes node --check.
- HTML includes sfv198-actual-js and sfv198-actual-css.
```

## LIV-217 — docs/build_notes_history/BUILD_NOTES_v1_40_98_ACTUAL_VISUAL_MODE_FIX.txt:11

```text
This build corrects the v1.40.97 issue where the new prototype renderer did not take effect.

Changes:
- Reassigned the actual global trainingLanePanel and bindTrainingLanePanel functions instead of only setting window properties.
- LIV-213: numbered drop boxes only; real-world novice-friendly names; Stage Snake naming; sticky submit.
- LIV-214: numbered-only drag/drop flow assembly; items remain movable after placement.
- LIV-215: visible cable-inspection prototype now rendered.
- LIV-216: restored to the existing diagnosis-board style.
- LIV-217: visual patched-system repair with meters and clickable bad cable.
- PST-102/LIV-218: 5.1 interface to speaker processor calibration prototype.
- PST-103/LIV-219: 24-position M7-style IR dial / physical-space match lab.

Verification:
- patch_v14098.js passes node --check.
- HTML includes sfv198-actual-js and sfv198-actual-css.
```

## LIV-218 — docs/build_notes_history/BUILD_NOTES_v1_40_98_ACTUAL_VISUAL_MODE_FIX.txt:12

```text

Changes:
- Reassigned the actual global trainingLanePanel and bindTrainingLanePanel functions instead of only setting window properties.
- LIV-213: numbered drop boxes only; real-world novice-friendly names; Stage Snake naming; sticky submit.
- LIV-214: numbered-only drag/drop flow assembly; items remain movable after placement.
- LIV-215: visible cable-inspection prototype now rendered.
- LIV-216: restored to the existing diagnosis-board style.
- LIV-217: visual patched-system repair with meters and clickable bad cable.
- PST-102/LIV-218: 5.1 interface to speaker processor calibration prototype.
- PST-103/LIV-219: 24-position M7-style IR dial / physical-space match lab.

Verification:
- patch_v14098.js passes node --check.
- HTML includes sfv198-actual-js and sfv198-actual-css.
```

## LIV-219 — docs/build_notes_history/BUILD_NOTES_v1_40_98_ACTUAL_VISUAL_MODE_FIX.txt:13

```text
Changes:
- Reassigned the actual global trainingLanePanel and bindTrainingLanePanel functions instead of only setting window properties.
- LIV-213: numbered drop boxes only; real-world novice-friendly names; Stage Snake naming; sticky submit.
- LIV-214: numbered-only drag/drop flow assembly; items remain movable after placement.
- LIV-215: visible cable-inspection prototype now rendered.
- LIV-216: restored to the existing diagnosis-board style.
- LIV-217: visual patched-system repair with meters and clickable bad cable.
- PST-102/LIV-218: 5.1 interface to speaker processor calibration prototype.
- PST-103/LIV-219: 24-position M7-style IR dial / physical-space match lab.

Verification:
- patch_v14098.js passes node --check.
- HTML includes sfv198-actual-js and sfv198-actual-css.
```

## LIV-213 — docs/build_notes_history/BUILD_NOTES_v1_40_99_DIRECT_VISUAL_ROUTES.txt:7

```text
Signal Flow v1.40.99 Direct Visual Routes

This build addresses the issue where v1.40.97 and v1.40.98 appeared unchanged because the prototype UI was still not taking over the active training renderer.

What changed:
- Added a direct hash-route interceptor for these prototype IDs:
  - LIV-213
  - LIV-214
  - LIV-215
  - LIV-217
  - PST-102
  - PST-103
  - LIV-218 alias to PST-102
  - LIV-219 alias to PST-103
- These routes now render standalone visual prototype screens directly into the app root, bypassing the old training panel renderer.
- Added visible v1.40.99 header/navigation on these prototype pages so it is obvious when the direct visual renderer is active.

Implemented prototype behavior:
- LIV-213: real-world gear naming, numbered drop boxes, sticky Submit.
- LIV-214: numbered-only drag-and-drop signal-flow assembly; placed icons can be moved again.
```

## LIV-213 — docs/build_notes_history/BUILD_NOTES_v1_40_99_DIRECT_VISUAL_ROUTES.txt:19

```text
  - PST-102
  - PST-103
  - LIV-218 alias to PST-102
  - LIV-219 alias to PST-103
- These routes now render standalone visual prototype screens directly into the app root, bypassing the old training panel renderer.
- Added visible v1.40.99 header/navigation on these prototype pages so it is obvious when the direct visual renderer is active.

Implemented prototype behavior:
- LIV-213: real-world gear naming, numbered drop boxes, sticky Submit.
- LIV-214: numbered-only drag-and-drop signal-flow assembly; placed icons can be moved again.
- LIV-215: visible cable inspection prototype with one bad cable to click.
- LIV-217: visual show-mode repair screen with performer state, meters, patched routes, and repatch action.
- PST-102: infrastructure-based 5.1 interface -> speaker processor -> speaker tone check.
- PST-103: 24-position IR selector / Bricasti-style convolution reverb match lab.

Verification:
- patch_v14099.js passes node --check.
- Output HTML contains script id sfv199-direct-routes.
- Opening #/level/LIV-213 etc should show the v1.40.99 direct visual prototype route header.
```

## LIV-213 — docs/build_notes_history/BUILD_NOTES_v1_40_99_DIRECT_VISUAL_ROUTES.txt:29

```text
- LIV-215: visible cable inspection prototype with one bad cable to click.
- LIV-217: visual show-mode repair screen with performer state, meters, patched routes, and repatch action.
- PST-102: infrastructure-based 5.1 interface -> speaker processor -> speaker tone check.
- PST-103: 24-position IR selector / Bricasti-style convolution reverb match lab.

Verification:
- patch_v14099.js passes node --check.
- Output HTML contains script id sfv199-direct-routes.
- Opening #/level/LIV-213 etc should show the v1.40.99 direct visual prototype route header.
```

## LIV-214 — docs/build_notes_history/BUILD_NOTES_v1_40_99_DIRECT_VISUAL_ROUTES.txt:8

```text
Signal Flow v1.40.99 Direct Visual Routes

This build addresses the issue where v1.40.97 and v1.40.98 appeared unchanged because the prototype UI was still not taking over the active training renderer.

What changed:
- Added a direct hash-route interceptor for these prototype IDs:
  - LIV-213
  - LIV-214
  - LIV-215
  - LIV-217
  - PST-102
  - PST-103
  - LIV-218 alias to PST-102
  - LIV-219 alias to PST-103
- These routes now render standalone visual prototype screens directly into the app root, bypassing the old training panel renderer.
- Added visible v1.40.99 header/navigation on these prototype pages so it is obvious when the direct visual renderer is active.

Implemented prototype behavior:
- LIV-213: real-world gear naming, numbered drop boxes, sticky Submit.
- LIV-214: numbered-only drag-and-drop signal-flow assembly; placed icons can be moved again.
- LIV-215: visible cable inspection prototype with one bad cable to click.
```

## LIV-214 — docs/build_notes_history/BUILD_NOTES_v1_40_99_DIRECT_VISUAL_ROUTES.txt:20

```text
  - PST-103
  - LIV-218 alias to PST-102
  - LIV-219 alias to PST-103
- These routes now render standalone visual prototype screens directly into the app root, bypassing the old training panel renderer.
- Added visible v1.40.99 header/navigation on these prototype pages so it is obvious when the direct visual renderer is active.

Implemented prototype behavior:
- LIV-213: real-world gear naming, numbered drop boxes, sticky Submit.
- LIV-214: numbered-only drag-and-drop signal-flow assembly; placed icons can be moved again.
- LIV-215: visible cable inspection prototype with one bad cable to click.
- LIV-217: visual show-mode repair screen with performer state, meters, patched routes, and repatch action.
- PST-102: infrastructure-based 5.1 interface -> speaker processor -> speaker tone check.
- PST-103: 24-position IR selector / Bricasti-style convolution reverb match lab.

Verification:
- patch_v14099.js passes node --check.
- Output HTML contains script id sfv199-direct-routes.
- Opening #/level/LIV-213 etc should show the v1.40.99 direct visual prototype route header.
```

## LIV-215 — docs/build_notes_history/BUILD_NOTES_v1_40_99_DIRECT_VISUAL_ROUTES.txt:9

```text
Signal Flow v1.40.99 Direct Visual Routes

This build addresses the issue where v1.40.97 and v1.40.98 appeared unchanged because the prototype UI was still not taking over the active training renderer.

What changed:
- Added a direct hash-route interceptor for these prototype IDs:
  - LIV-213
  - LIV-214
  - LIV-215
  - LIV-217
  - PST-102
  - PST-103
  - LIV-218 alias to PST-102
  - LIV-219 alias to PST-103
- These routes now render standalone visual prototype screens directly into the app root, bypassing the old training panel renderer.
- Added visible v1.40.99 header/navigation on these prototype pages so it is obvious when the direct visual renderer is active.

Implemented prototype behavior:
- LIV-213: real-world gear naming, numbered drop boxes, sticky Submit.
- LIV-214: numbered-only drag-and-drop signal-flow assembly; placed icons can be moved again.
- LIV-215: visible cable inspection prototype with one bad cable to click.
- LIV-217: visual show-mode repair screen with performer state, meters, patched routes, and repatch action.
```

## LIV-215 — docs/build_notes_history/BUILD_NOTES_v1_40_99_DIRECT_VISUAL_ROUTES.txt:21

```text
  - LIV-218 alias to PST-102
  - LIV-219 alias to PST-103
- These routes now render standalone visual prototype screens directly into the app root, bypassing the old training panel renderer.
- Added visible v1.40.99 header/navigation on these prototype pages so it is obvious when the direct visual renderer is active.

Implemented prototype behavior:
- LIV-213: real-world gear naming, numbered drop boxes, sticky Submit.
- LIV-214: numbered-only drag-and-drop signal-flow assembly; placed icons can be moved again.
- LIV-215: visible cable inspection prototype with one bad cable to click.
- LIV-217: visual show-mode repair screen with performer state, meters, patched routes, and repatch action.
- PST-102: infrastructure-based 5.1 interface -> speaker processor -> speaker tone check.
- PST-103: 24-position IR selector / Bricasti-style convolution reverb match lab.

Verification:
- patch_v14099.js passes node --check.
- Output HTML contains script id sfv199-direct-routes.
- Opening #/level/LIV-213 etc should show the v1.40.99 direct visual prototype route header.
```

## LIV-217 — docs/build_notes_history/BUILD_NOTES_v1_40_99_DIRECT_VISUAL_ROUTES.txt:10

```text

This build addresses the issue where v1.40.97 and v1.40.98 appeared unchanged because the prototype UI was still not taking over the active training renderer.

What changed:
- Added a direct hash-route interceptor for these prototype IDs:
  - LIV-213
  - LIV-214
  - LIV-215
  - LIV-217
  - PST-102
  - PST-103
  - LIV-218 alias to PST-102
  - LIV-219 alias to PST-103
- These routes now render standalone visual prototype screens directly into the app root, bypassing the old training panel renderer.
- Added visible v1.40.99 header/navigation on these prototype pages so it is obvious when the direct visual renderer is active.

Implemented prototype behavior:
- LIV-213: real-world gear naming, numbered drop boxes, sticky Submit.
- LIV-214: numbered-only drag-and-drop signal-flow assembly; placed icons can be moved again.
- LIV-215: visible cable inspection prototype with one bad cable to click.
- LIV-217: visual show-mode repair screen with performer state, meters, patched routes, and repatch action.
- PST-102: infrastructure-based 5.1 interface -> speaker processor -> speaker tone check.
```

## LIV-217 — docs/build_notes_history/BUILD_NOTES_v1_40_99_DIRECT_VISUAL_ROUTES.txt:22

```text
  - LIV-219 alias to PST-103
- These routes now render standalone visual prototype screens directly into the app root, bypassing the old training panel renderer.
- Added visible v1.40.99 header/navigation on these prototype pages so it is obvious when the direct visual renderer is active.

Implemented prototype behavior:
- LIV-213: real-world gear naming, numbered drop boxes, sticky Submit.
- LIV-214: numbered-only drag-and-drop signal-flow assembly; placed icons can be moved again.
- LIV-215: visible cable inspection prototype with one bad cable to click.
- LIV-217: visual show-mode repair screen with performer state, meters, patched routes, and repatch action.
- PST-102: infrastructure-based 5.1 interface -> speaker processor -> speaker tone check.
- PST-103: 24-position IR selector / Bricasti-style convolution reverb match lab.

Verification:
- patch_v14099.js passes node --check.
- Output HTML contains script id sfv199-direct-routes.
- Opening #/level/LIV-213 etc should show the v1.40.99 direct visual prototype route header.
```

## LIV-218 — docs/build_notes_history/BUILD_NOTES_v1_40_99_DIRECT_VISUAL_ROUTES.txt:13

```text
What changed:
- Added a direct hash-route interceptor for these prototype IDs:
  - LIV-213
  - LIV-214
  - LIV-215
  - LIV-217
  - PST-102
  - PST-103
  - LIV-218 alias to PST-102
  - LIV-219 alias to PST-103
- These routes now render standalone visual prototype screens directly into the app root, bypassing the old training panel renderer.
- Added visible v1.40.99 header/navigation on these prototype pages so it is obvious when the direct visual renderer is active.

Implemented prototype behavior:
- LIV-213: real-world gear naming, numbered drop boxes, sticky Submit.
- LIV-214: numbered-only drag-and-drop signal-flow assembly; placed icons can be moved again.
- LIV-215: visible cable inspection prototype with one bad cable to click.
- LIV-217: visual show-mode repair screen with performer state, meters, patched routes, and repatch action.
- PST-102: infrastructure-based 5.1 interface -> speaker processor -> speaker tone check.
- PST-103: 24-position IR selector / Bricasti-style convolution reverb match lab.

Verification:
```

## LIV-219 — docs/build_notes_history/BUILD_NOTES_v1_40_99_DIRECT_VISUAL_ROUTES.txt:14

```text
- Added a direct hash-route interceptor for these prototype IDs:
  - LIV-213
  - LIV-214
  - LIV-215
  - LIV-217
  - PST-102
  - PST-103
  - LIV-218 alias to PST-102
  - LIV-219 alias to PST-103
- These routes now render standalone visual prototype screens directly into the app root, bypassing the old training panel renderer.
- Added visible v1.40.99 header/navigation on these prototype pages so it is obvious when the direct visual renderer is active.

Implemented prototype behavior:
- LIV-213: real-world gear naming, numbered drop boxes, sticky Submit.
- LIV-214: numbered-only drag-and-drop signal-flow assembly; placed icons can be moved again.
- LIV-215: visible cable inspection prototype with one bad cable to click.
- LIV-217: visual show-mode repair screen with performer state, meters, patched routes, and repatch action.
- PST-102: infrastructure-based 5.1 interface -> speaker processor -> speaker tone check.
- PST-103: 24-position IR selector / Bricasti-style convolution reverb match lab.

Verification:
- patch_v14099.js passes node --check.
```

## LIV-213 — docs/build_notes_history/BUILD_NOTES_v1_41_00_VISUAL_MODES_PROTOTYPE_STANDALONE.txt:8

```text
Signal Flow v1.41.00 Visual Modes Prototype Standalone

Purpose:
- This is a guaranteed-visible standalone prototype page, not another overlay patch inside the large app.
- Created because v1.40.97-v1.40.99 route/renderer overrides did not visibly affect the running standalone build.

Included prototype screens:
- LIV-213: Build the Room with same core UI concept, real-world gear names, numbered-only boxes, sticky submit.
- LIV-214: Drag-and-drop visual patch lab with numbered-only boxes; items can be moved after placement.
- LIV-215: Parked/placeholder because current Find the Mistake concept was not better than Diagnose.
- LIV-217: Visual Show Mode with patched system, bad route, meters, and repatch action.
- PST-102: 5.1 interface -> speaker processor -> speaker calibration with test tones.
- PST-103: Bricasti-style 24-position convolution IR selector matched to a physical space.

Important:
- This does not replace the main game build.
- It is intended to validate the visual/interaction direction before reintegrating into the app's actual renderer.
```

## LIV-214 — docs/build_notes_history/BUILD_NOTES_v1_41_00_VISUAL_MODES_PROTOTYPE_STANDALONE.txt:9

```text
Signal Flow v1.41.00 Visual Modes Prototype Standalone

Purpose:
- This is a guaranteed-visible standalone prototype page, not another overlay patch inside the large app.
- Created because v1.40.97-v1.40.99 route/renderer overrides did not visibly affect the running standalone build.

Included prototype screens:
- LIV-213: Build the Room with same core UI concept, real-world gear names, numbered-only boxes, sticky submit.
- LIV-214: Drag-and-drop visual patch lab with numbered-only boxes; items can be moved after placement.
- LIV-215: Parked/placeholder because current Find the Mistake concept was not better than Diagnose.
- LIV-217: Visual Show Mode with patched system, bad route, meters, and repatch action.
- PST-102: 5.1 interface -> speaker processor -> speaker calibration with test tones.
- PST-103: Bricasti-style 24-position convolution IR selector matched to a physical space.

Important:
- This does not replace the main game build.
- It is intended to validate the visual/interaction direction before reintegrating into the app's actual renderer.
```

## LIV-215 — docs/build_notes_history/BUILD_NOTES_v1_41_00_VISUAL_MODES_PROTOTYPE_STANDALONE.txt:10

```text

Purpose:
- This is a guaranteed-visible standalone prototype page, not another overlay patch inside the large app.
- Created because v1.40.97-v1.40.99 route/renderer overrides did not visibly affect the running standalone build.

Included prototype screens:
- LIV-213: Build the Room with same core UI concept, real-world gear names, numbered-only boxes, sticky submit.
- LIV-214: Drag-and-drop visual patch lab with numbered-only boxes; items can be moved after placement.
- LIV-215: Parked/placeholder because current Find the Mistake concept was not better than Diagnose.
- LIV-217: Visual Show Mode with patched system, bad route, meters, and repatch action.
- PST-102: 5.1 interface -> speaker processor -> speaker calibration with test tones.
- PST-103: Bricasti-style 24-position convolution IR selector matched to a physical space.

Important:
- This does not replace the main game build.
- It is intended to validate the visual/interaction direction before reintegrating into the app's actual renderer.
```

## LIV-217 — docs/build_notes_history/BUILD_NOTES_v1_41_00_VISUAL_MODES_PROTOTYPE_STANDALONE.txt:11

```text
Purpose:
- This is a guaranteed-visible standalone prototype page, not another overlay patch inside the large app.
- Created because v1.40.97-v1.40.99 route/renderer overrides did not visibly affect the running standalone build.

Included prototype screens:
- LIV-213: Build the Room with same core UI concept, real-world gear names, numbered-only boxes, sticky submit.
- LIV-214: Drag-and-drop visual patch lab with numbered-only boxes; items can be moved after placement.
- LIV-215: Parked/placeholder because current Find the Mistake concept was not better than Diagnose.
- LIV-217: Visual Show Mode with patched system, bad route, meters, and repatch action.
- PST-102: 5.1 interface -> speaker processor -> speaker calibration with test tones.
- PST-103: Bricasti-style 24-position convolution IR selector matched to a physical space.

Important:
- This does not replace the main game build.
- It is intended to validate the visual/interaction direction before reintegrating into the app's actual renderer.
```

## LIV-213 — docs/build_notes_history/BUILD_NOTES_v1_41_02_VISUAL_MODES_CORRECTION.txt:4

```text
Signal Flow v1.41.02 Visual Modes Correction Prototype

Updated from user notes:
- LIV-213: Sources 1 and 2 are interchangeable. Roadmap no longer gives exact device order. Scenario is now: send two stage sources to front of house and feed monitors. Stage monitor option removed. Snake naming is used for novice clarity.
- LIV-214: Numbered boxes only. Gear tokens can be dragged after placement. Dropping onto an occupied box swaps items instead of hiding/overwriting the icon. Roadmap icons removed.
- LIV-217: Rebuilt as a visual patched-system repair board: mostly normal playing-board language, green working patches, red broken patch, and a dead IEM-right symptom.
- PST-102: Rebuilt as a 5.1 speaker processor calibration task with test tone, visible wrong speaker response, draggable/swappable processor assignments, and explicit Submit Calibration button.
- PST-103: Uses the uploaded IR example image as the visual target and a Bricasti-style 24-position IR selector. The correct answer is not printed.

IR asset note:
For production quality, yes: render/install the IR space images as a separate asset set, then have Codex wire them into the level. This prototype embeds the uploaded example as a proof of interaction only.
```

## LIV-214 — docs/build_notes_history/BUILD_NOTES_v1_41_02_VISUAL_MODES_CORRECTION.txt:5

```text
Signal Flow v1.41.02 Visual Modes Correction Prototype

Updated from user notes:
- LIV-213: Sources 1 and 2 are interchangeable. Roadmap no longer gives exact device order. Scenario is now: send two stage sources to front of house and feed monitors. Stage monitor option removed. Snake naming is used for novice clarity.
- LIV-214: Numbered boxes only. Gear tokens can be dragged after placement. Dropping onto an occupied box swaps items instead of hiding/overwriting the icon. Roadmap icons removed.
- LIV-217: Rebuilt as a visual patched-system repair board: mostly normal playing-board language, green working patches, red broken patch, and a dead IEM-right symptom.
- PST-102: Rebuilt as a 5.1 speaker processor calibration task with test tone, visible wrong speaker response, draggable/swappable processor assignments, and explicit Submit Calibration button.
- PST-103: Uses the uploaded IR example image as the visual target and a Bricasti-style 24-position IR selector. The correct answer is not printed.

IR asset note:
For production quality, yes: render/install the IR space images as a separate asset set, then have Codex wire them into the level. This prototype embeds the uploaded example as a proof of interaction only.
```

## LIV-217 — docs/build_notes_history/BUILD_NOTES_v1_41_02_VISUAL_MODES_CORRECTION.txt:6

```text
Signal Flow v1.41.02 Visual Modes Correction Prototype

Updated from user notes:
- LIV-213: Sources 1 and 2 are interchangeable. Roadmap no longer gives exact device order. Scenario is now: send two stage sources to front of house and feed monitors. Stage monitor option removed. Snake naming is used for novice clarity.
- LIV-214: Numbered boxes only. Gear tokens can be dragged after placement. Dropping onto an occupied box swaps items instead of hiding/overwriting the icon. Roadmap icons removed.
- LIV-217: Rebuilt as a visual patched-system repair board: mostly normal playing-board language, green working patches, red broken patch, and a dead IEM-right symptom.
- PST-102: Rebuilt as a 5.1 speaker processor calibration task with test tone, visible wrong speaker response, draggable/swappable processor assignments, and explicit Submit Calibration button.
- PST-103: Uses the uploaded IR example image as the visual target and a Bricasti-style 24-position IR selector. The correct answer is not printed.

IR asset note:
For production quality, yes: render/install the IR space images as a separate asset set, then have Codex wire them into the level. This prototype embeds the uploaded example as a proof of interaction only.
```

## LIV-003 — docs/source_context/BOARD_BUILD_RULES_CHECKLIST(39).md:286

```text
- Connector detail must not interfere with the click target or feedback states.

### Validation Additions
Every release after v1.40.32 must also verify:
- Educational Tools text remains white on dark splash/brief controls;
- jack spacing is tighter but uncrowded;
- gear/device titles remain visually separate from rack/category headings;
- XLR connectors are distinguishable from TRS-style connectors;
- LIV-003 and LIV-005 remain solvable with reduced unnecessary scrolling.


## v1.40.34 All-Stage Live Formatting Addendum

These rules apply across Live Sound stages, not only the reviewed level.

- Remove duplicated or unnecessary helper labels from Live Sound board cards. Keep functional gear names and hierarchy labels; do not show explanatory strips like "only relevant sources" or "input numbers are printed" on the board.
- Live source cards should live inside the gear grid, not in a separate full-width row that creates avoidable vertical scrolling.
- In early Live Sound layouts, place the source card in the former upper-right console area and drop the FOH console below it so console I/O aligns more naturally with stagebox mic/line input rows.
- Pack Amp/Monitor Rack and System/Utility Rack cards upward with dense grid flow to close unnecessary blank space.
- Mic inputs and other XLR paths must visually read as 3-pin XLR connectors. TRS/quarter-inch style jacks should remain visually distinct.
- Do not fix spacing by crowding or overlapping labels, jacks, cable anchors, or cards.

```

## LIV-005 — docs/source_context/BOARD_BUILD_RULES_CHECKLIST(39).md:286

```text
- Connector detail must not interfere with the click target or feedback states.

### Validation Additions
Every release after v1.40.32 must also verify:
- Educational Tools text remains white on dark splash/brief controls;
- jack spacing is tighter but uncrowded;
- gear/device titles remain visually separate from rack/category headings;
- XLR connectors are distinguishable from TRS-style connectors;
- LIV-003 and LIV-005 remain solvable with reduced unnecessary scrolling.


## v1.40.34 All-Stage Live Formatting Addendum

These rules apply across Live Sound stages, not only the reviewed level.

- Remove duplicated or unnecessary helper labels from Live Sound board cards. Keep functional gear names and hierarchy labels; do not show explanatory strips like "only relevant sources" or "input numbers are printed" on the board.
- Live source cards should live inside the gear grid, not in a separate full-width row that creates avoidable vertical scrolling.
- In early Live Sound layouts, place the source card in the former upper-right console area and drop the FOH console below it so console I/O aligns more naturally with stagebox mic/line input rows.
- Pack Amp/Monitor Rack and System/Utility Rack cards upward with dense grid flow to close unnecessary blank space.
- Mic inputs and other XLR paths must visually read as 3-pin XLR connectors. TRS/quarter-inch style jacks should remain visually distinct.
- Do not fix spacing by crowding or overlapping labels, jacks, cable anchors, or cards.

```

## LIV-001 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:17032

```text
            "ok": false,
            "reason": "This is a known bad route for the level. It would send signal to the wrong place or create an unsafe workflow."
          }
        ],
        "explanation": "This level replaces blank patching with troubleshooting. The player must recognize why one route is wrong."
      }
    },
    {
      "id": "LIV-001",
      "environment": "live",
      "title": "Lead Vocal Mic to FOH",
      "brief": "Patch Lead Vocal Mic into the stagebox and feed mains to system processing.",
      "difficulty": 1,
      "required": [
        [
          "Lead Vocal Mic",
          "Stage Box Input 1"
        ],
        [
          "Main L Output",
          "System Processor L In"
        ],
```

## LIV-002 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:17089

```text
          "Dolby Renderer",
          "ADR Booth Headphone Amp",
          "Phone Hybrid"
        ],
        "explanation": "This level replaces the patch board with a system-design decision: identify the pieces that actually belong in the room."
      }
    },
             {
               "id": "LIV-002",
               "environment": "live",
               "title": "Vocal wedge mix 2",
               "brief": "Patch a vocal monitor aux to the wedge input.",
               "difficulty": 1,
               "required": [
                 [
                   "Lead Vocal Mic",
                   "Stage Box Input 1"
                 ],
                 [
                   "FOH Aux 1 Output",
                   "Vocal Wedge Input"
                 ]
```

## LIV-003 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:17127

```text
                 "Do not use the audience main mix for a wedge."
               ],
               "learning": [
                 "Monitor aux",
                 "Wedge routing"
               ]
             },
    {
      "id": "LIV-003",
      "environment": "live",
      "title": "Stereo IEM send 1",
      "brief": "Patch stereo aux outputs into the IEM transmitter.",
      "difficulty": 1,
      "required": [
        [
          "FOH Aux 5 L Output",
          "IEM TX A Left Input"
        ],
        [
          "FOH Aux 5 R Output",
          "IEM TX A Right Input"
        ]
```

## LIV-004 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:17165

```text
        "IEMs need an independent monitor mix."
      ],
      "learning": [
        "Stereo aux",
        "IEM routing"
      ]
    },
    {
      "id": "LIV-004",
      "environment": "live",
      "title": "Front fill matrix",
      "brief": "Patch matrix output to front-fill processing while mains remain active.",
      "difficulty": 1,
      "required": [
        [
          "Matrix 1 Output",
          "Front Fill Processor Input"
        ],
        [
          "Main L Output",
          "System Processor L In"
        ],
```

## LIV-005 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:17223

```text
            "text": "A guitar pedal power supply",
            "correct": false
          }
        ],
        "explanation": "This checkpoint replaces the patch board and tests the concept behind this environment before moving on."
      }
    },
    {
      "id": "LIV-005",
      "environment": "live",
      "title": "Sub matrix feed",
      "brief": "Patch sub matrix output to the sub processor.",
      "difficulty": 1,
      "required": [
        [
          "Matrix 2 Output",
          "Sub Processor Input"
        ],
        [
          "Main L Output",
          "System Processor L In"
        ],
```

## LIV-006 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:17261

```text
        "Sub feeds are separate system zones."
      ],
      "learning": [
        "Sub routing",
        "Matrix outputs"
      ]
    },
             {
               "id": "LIV-006",
               "environment": "live",
               "title": "Delay tower route",
               "brief": "Patch a matrix output to the delay tower processor.",
               "difficulty": 1,
               "required": [
                 [
                   "Matrix 3 Output",
                   "Delay Tower Processor Input"
                 ],
                 [
                   "Main L Output",
                   "System Processor L In"
                 ],
```

## LIV-007 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:17303

```text
                 "Delay fills should use matrix-fed processing."
               ],
               "learning": [
                 "Delay tower",
                 "Matrix feed"
               ]
             },
    {
      "id": "LIV-007",
      "environment": "live",
      "title": "Broadcast split",
      "brief": "Patch broadcast split outputs for a recorder or stream feed.",
      "difficulty": 1,
      "required": [
        [
          "Broadcast Split L",
          "Record Out L"
        ],
        [
          "Broadcast Split R",
          "Record Out R"
        ]
```

## LIV-008 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:17341

```text
        "Keep stereo order intact for broadcast feeds."
      ],
      "learning": [
        "Broadcast split",
        "Record output"
      ]
    },
             {
               "id": "LIV-008",
               "environment": "live",
               "title": "Talkback to monitor system",
               "brief": "Route talkback into the monitor send path without feeding mains.",
               "difficulty": 1,
               "required": [
                 [
                   "Talkback Mic",
                   "Stage Box Input 14"
                 ],
                 [
                   "Talkback Output",
                   "In-Ear B Input"
                 ]
```

## LIV-009 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:17407

```text
                     "ok": false,
                     "reason": "This is a known bad route for the level. It would send signal to the wrong place or create an unsafe workflow."
                   }
                 ],
                 "explanation": "This level replaces blank patching with troubleshooting. The player must recognize why one route is wrong."
               }
             },
    {
      "id": "LIV-009",
      "environment": "live",
      "title": "Keyboard stereo inputs",
      "brief": "Patch stereo keyboard DIs into adjacent stagebox inputs.",
      "difficulty": 1,
      "required": [
        [
          "Keys L DI",
          "Stage Box Input 7"
        ],
        [
          "Keys R DI",
          "Stage Box Input 8"
        ]
```

## LIV-010 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:17445

```text
        "Stereo stage inputs should not be crossed."
      ],
      "learning": [
        "Stereo DI",
        "Stagebox order"
      ]
    },
             {
               "id": "LIV-010",
               "environment": "live",
               "title": "Main PA amp feed",
               "brief": "Patch the console mains into the system processor, then patch the processor outputs into the main PA amplifier inputs.",
               "difficulty": 1,
               "required": [
                 [
                   "Main L Output",
                   "System Processor L In"
                 ],
                 [
                   "Main R Output",
                   "System Processor R In"
                 ],
```

## LIV-011 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:17491

```text
                 "Do not patch processor input jacks into amplifier inputs. The back-panel path is console output → processor input → processor output → amp input."
               ],
               "learning": [
                 "System processing",
                 "PA feed"
               ]
             },
    {
      "id": "LIV-011",
      "environment": "live",
      "title": "Lead Vocal Mic to FOH",
      "brief": "Patch Lead Vocal Mic into the stagebox and feed mains to system processing.",
      "difficulty": 2,
      "required": [
        [
          "Lead Vocal Mic",
          "Stage Box Input 11"
        ],
        [
          "Main L Output",
          "System Processor L In"
        ],
```

## LIV-012 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:17539

```text
      ],
      "learning": [
        "Stagebox input",
        "Main PA feed"
      ],
      "time": 260
    },
             {
               "id": "LIV-012",
               "environment": "live",
               "title": "Vocal wedge mix 4",
               "brief": "Patch a vocal monitor aux to the wedge input.",
               "difficulty": 2,
               "required": [
                 [
                   "Lead Vocal Mic",
                   "Stage Box Input 1"
                 ],
                 [
                   "FOH Aux 1 Output",
                   "Vocal Wedge Input"
                 ],
```

## LIV-013 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:17586

```text
               ],
               "learning": [
                 "Monitor aux",
                 "Wedge routing"
               ],
               "time": 260
             },
        {
          "id": "LIV-013",
          "environment": "live",
          "title": "Stereo IEM send 1",
          "brief": "Patch stereo aux outputs into the IEM transmitter.",
          "difficulty": 2,
          "required": [
            [
              "FOH Aux 5 L Output",
              "IEM TX A Left Input"
            ],
            [
              "FOH Aux 5 R Output",
              "IEM TX A Right Input"
            ],
```

## LIV-014 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:17654

```text
              "ADR Booth Headphone Amp",
              "Phone Hybrid"
            ],
            "explanation": "This level replaces the patch board with a system-design decision: identify the pieces that actually belong in the room."
          },
          "time": 260
        },
{
      "id": "LIV-014",
      "environment": "live",
      "title": "Front fill matrix",
      "brief": "Patch matrix output to front-fill processing while mains remain active.",
      "difficulty": 2,
      "required": [
        [
          "Matrix 1 Output",
          "Front Fill Processor Input"
        ],
        [
          "Main L Output",
          "System Processor L In"
        ],
```

## LIV-015 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:17697

```text
      ],
      "learning": [
        "Matrix routing",
        "Speaker zones"
      ],
      "time": 260
    },
    {
      "id": "LIV-015",
      "environment": "live",
      "title": "Sub matrix feed",
      "brief": "Patch sub matrix output to the sub processor.",
      "difficulty": 2,
      "required": [
        [
          "Matrix 2 Output",
          "Sub Processor Input"
        ],
        [
          "Main L Output",
          "System Processor L In"
        ],
```

## LIV-016 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:17740

```text
      ],
      "learning": [
        "Sub routing",
        "Matrix outputs"
      ],
      "time": 260
    },
             {
               "id": "LIV-016",
               "environment": "live",
               "title": "Delay tower route",
               "brief": "Patch a matrix output to the delay tower processor.",
               "difficulty": 2,
               "required": [
                 [
                   "Matrix 3 Output",
                   "Delay Tower Processor Input"
                 ],
                 [
                   "Main L Output",
                   "System Processor L In"
                 ],
```

## LIV-017 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:17787

```text
               ],
               "learning": [
                 "Delay tower",
                 "Matrix feed"
               ],
               "time": 260
             },
        {
          "id": "LIV-017",
          "environment": "live",
          "title": "Broadcast split",
          "brief": "Patch broadcast split outputs for a recorder or stream feed.",
          "difficulty": 2,
          "required": [
            [
              "Broadcast Split L",
              "Record Out L"
            ],
            [
              "Broadcast Split R",
              "Record Out R"
            ],
```

## LIV-018 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:17866

```text
                "reason": "This is a known bad route for the level. It would send signal to the wrong place or create an unsafe workflow."
              }
            ],
            "explanation": "This level replaces blank patching with troubleshooting. The player must recognize why one route is wrong."
          },
          "time": 260
        },
        {
          "id": "LIV-018",
          "environment": "live",
          "title": "Talkback to monitor system",
          "brief": "Route talkback into the monitor send path without feeding mains.",
          "difficulty": 2,
          "required": [
            [
              "Talkback Mic",
              "Stage Box Input 14"
            ],
            [
              "Talkback Output",
              "In-Ear B Input"
            ],
```

## LIV-019 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:17917

```text
          ],
          "learning": [
            "Talkback",
            "Monitor communication"
          ],
          "time": 260
        },
    {
      "id": "LIV-019",
      "environment": "live",
      "title": "Keyboard stereo inputs",
      "brief": "Patch stereo keyboard DIs into adjacent stagebox inputs.",
      "difficulty": 2,
      "required": [
        [
          "Keys L DI",
          "Stage Box Input 7"
        ],
        [
          "Keys R DI",
          "Stage Box Input 8"
        ],
```

## LIV-020 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:17964

```text
      ],
      "learning": [
        "Stereo DI",
        "Stagebox order"
      ],
      "time": 260
    },
    {
      "id": "LIV-020",
      "environment": "live",
      "title": "Main PA amp feed",
      "brief": "Patch the console mains into the system processor, then patch the processor outputs into the main PA amplifier inputs.",
      "difficulty": 2,
      "required": [
        [
          "Main L Output",
          "System Processor L In"
        ],
        [
          "Main R Output",
          "System Processor R In"
        ],
```

## LIV-021 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:18010

```text
        "Do not patch processor input jacks into amplifier inputs. The back-panel path is console output → processor input → processor output → amp input."
      ],
      "learning": [
        "System processing",
        "PA feed"
      ]
    },
    {
      "id": "LIV-021",
      "environment": "live",
      "title": "Lead Vocal Mic to FOH",
      "brief": "Patch Lead Vocal Mic into the stagebox and feed mains to system processing.",
      "difficulty": 3,
      "required": [
        [
          "Lead Vocal Mic",
          "Stage Box Input 9"
        ],
        [
          "Main L Output",
          "System Processor L In"
        ],
```

## LIV-022 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:18057

```text
      ],
      "learning": [
        "Stagebox input",
        "Main PA feed"
      ],
      "time": 280
    },
    {
      "id": "LIV-022",
      "environment": "live",
      "title": "Vocal wedge mix 2",
      "brief": "Patch a vocal monitor aux to the wedge input.",
      "difficulty": 3,
      "required": [
        [
          "Lead Vocal Mic",
          "Stage Box Input 1"
        ],
        [
          "FOH Aux 1 Output",
          "Vocal Wedge Input"
        ],
```

## LIV-023 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:18128

```text
            "correct": false
          }
        ],
        "explanation": "This checkpoint replaces the patch board and tests the concept behind this environment before moving on."
      },
      "time": 280
    },
    {
      "id": "LIV-023",
      "environment": "live",
      "title": "Stereo IEM send 1",
      "brief": "Patch stereo aux outputs into the IEM transmitter.",
      "difficulty": 3,
      "required": [
        [
          "FOH Aux 5 L Output",
          "IEM TX A Left Input"
        ],
        [
          "FOH Aux 5 R Output",
          "IEM TX A Right Input"
        ],
```

## LIV-024 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:18179

```text
      ],
      "learning": [
        "Stereo aux",
        "IEM routing"
      ],
      "time": 280
    },
    {
      "id": "LIV-024",
      "environment": "live",
      "title": "Front fill matrix",
      "brief": "Patch matrix output to front-fill processing while mains remain active.",
      "difficulty": 3,
      "required": [
        [
          "Matrix 1 Output",
          "Front Fill Processor Input"
        ],
        [
          "Main L Output",
          "System Processor L In"
        ],
```

## LIV-025 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:8189

```text
  -webkit-overflow-scrolling:touch;
}
#paths{
  min-height:0!important;
}

</style>
<style id="sf-live-native-liv025-prehide">
/* LIV-025 native renderer: prevent the legacy front UI from flashing before native mount. */
main.level-liv-025 .patchbay-wrap.front-panel-view .hybrid-board,
main.level-liv-025 .patchbay-wrap.front-panel-view .live-ui-grid,
main.level-liv-025 .patchbay-wrap.front-panel-view .device-card {
  opacity: 0.035 !important;
  filter: blur(1px) !important;
  pointer-events: none !important;
}

main.level-liv-025 .patchbay-wrap.front-panel-view .sf-live-native-layer,
main.level-liv-025 .patchbay-wrap.front-panel-view .sf-live-native-layer * {
  opacity: 1 !important;
  filter: none !important;
}
```

## LIV-025 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:18230

```text
      ],
      "learning": [
        "Matrix routing",
        "Speaker zones"
      ],
      "time": 280
    },
    {
      "id": "LIV-025",
      "environment": "live",
      "title": "Sub matrix feed",
      "brief": "Patch Aux 2 to the crossover sub input.",
      "difficulty": 3,
      "required": [
        [
          "Aux 2 Output",
          "Sub Input"
        ],
        [
          "Main L Output",
          "System Processor L In"
        ],
```

## LIV-026 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:8206

```text
main.level-liv-025 .patchbay-wrap.front-panel-view .sf-live-native-layer,
main.level-liv-025 .patchbay-wrap.front-panel-view .sf-live-native-layer * {
  opacity: 1 !important;
  filter: none !important;
}
</style>

<style id="sf-live-native-liv026-prehide">
/* LIV-026 native renderer: prevent the legacy front UI from flashing before native mount. */
main.level-liv-026 .patchbay-wrap.front-panel-view .hybrid-board,
main.level-liv-026 .patchbay-wrap.front-panel-view .live-ui-grid,
main.level-liv-026 .patchbay-wrap.front-panel-view .device-card {
  opacity: 0.035 !important;
  filter: blur(1px) !important;
  pointer-events: none !important;
}

main.level-liv-026 .patchbay-wrap.front-panel-view .sf-live-native-layer,
main.level-liv-026 .patchbay-wrap.front-panel-view .sf-live-native-layer * {
  opacity: 1 !important;
  filter: none !important;
}
```

## LIV-026 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:18281

```text
      ],
      "learning": [
        "Sub routing",
        "Aux outputs"
      ],
      "time": 280
    },
    {
      "id": "LIV-026",
      "environment": "live",
      "title": "Delay tower route",
      "brief": "Patch Aux 3 to delay.",
      "difficulty": 3,
      "required": [
        [
          "Aux 3 Output",
          "Delay"
        ],
        [
          "Main L Output",
          "System Processor L In"
        ],
```

## LIV-027 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:18336

```text
      ],
      "learning": [
        "Delay tower",
        "Aux feed"
      ],
      "time": 280
    },
    {
      "id": "LIV-027",
      "environment": "live",
      "title": "Broadcast split",
      "brief": "Patch broadcast split outputs for a recorder or stream feed.",
      "difficulty": 3,
      "required": [
        [
          "Broadcast Split L",
          "Record Out L"
        ],
        [
          "Broadcast Split R",
          "Record Out R"
        ],
```

## LIV-028 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:18404

```text
          "ADR Booth Headphone Amp",
          "Phone Hybrid"
        ],
        "explanation": "This level replaces the patch board with a system-design decision: identify the pieces that actually belong in the room."
      },
      "time": 280
    },
    {
      "id": "LIV-028",
      "environment": "live",
      "title": "Talkback to monitor system",
      "brief": "Route talkback into the in-ear monitor path without feeding mains.",
      "difficulty": 3,
      "required": [
        [
          "Talkback Mic",
          "Stage Box Input 14"
        ],
        [
          "Talkback Output",
          "In-Ear B In"
        ],
```

## LIV-029 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:18455

```text
      ],
      "learning": [
        "Talkback",
        "Monitor communication"
      ],
      "time": 280
    },
        {
          "id": "LIV-029",
          "environment": "live",
          "title": "Keyboard stereo inputs",
          "brief": "Patch stereo keyboard DIs into adjacent stagebox inputs.",
          "difficulty": 3,
          "required": [
            [
              "Keys L DI",
              "Stage Box Input 7"
            ],
            [
              "Keys R DI",
              "Stage Box Input 8"
            ],
```

## LIV-030 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:18510

```text
          ],
          "learning": [
            "Stereo DI",
            "Stagebox order"
          ],
          "time": 280
        },
        {
          "id": "LIV-030",
          "environment": "live",
          "title": "Main PA amp feed",
          "brief": "Patch the console mains into the system processor, then patch the processor outputs into the main PA amplifier inputs.",
          "difficulty": 3,
          "required": [
            [
              "Main L Output",
              "System Processor L In"
            ],
            [
              "Main R Output",
              "System Processor R In"
            ],
```

## LIV-031 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:18561

```text
          ],
          "learning": [
            "System processing",
            "PA feed"
          ],
          "time": 280
        },
    {
      "id": "LIV-031",
      "environment": "live",
      "title": "Lead Vocal Mic to FOH",
      "brief": "Patch Lead Vocal Mic into the stagebox and feed mains to system processing.",
      "difficulty": 4,
      "required": [
        [
          "Lead Vocal Mic",
          "Stage Box Input 5"
        ],
        [
          "Main L Output",
          "System Processor L In"
        ],
```

## LIV-032 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:18653

```text
            "reason": "This is a known bad route for the level. It would send signal to the wrong place or create an unsafe workflow."
          }
        ],
        "explanation": "This level replaces blank patching with troubleshooting. The player must recognize why one route is wrong."
      },
      "time": 300
    },
    {
      "id": "LIV-032",
      "environment": "live",
      "title": "Vocal wedge mix 4",
      "brief": "Patch a vocal monitor aux to the wedge input.",
      "difficulty": 4,
      "required": [
        [
          "Lead Vocal Mic",
          "Stage Box Input 1"
        ],
        [
          "FOH Aux 1 Output",
          "Vocal Wedge Input"
        ],
```

## LIV-033 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:18708

```text
      ],
      "learning": [
        "Monitor aux",
        "Wedge routing"
      ],
      "time": 300
    },
    {
      "id": "LIV-033",
      "environment": "live",
      "title": "Stereo IEM send 1",
      "brief": "Patch stereo aux outputs into the IEM transmitter.",
      "difficulty": 4,
      "required": [
        [
          "FOH Aux 5 L Output",
          "IEM TX A Left Input"
        ],
        [
          "FOH Aux 5 R Output",
          "IEM TX A Right Input"
        ],
```

## LIV-034 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:18763

```text
      ],
      "learning": [
        "Stereo aux",
        "IEM routing"
      ],
      "time": 300
    },
    {
      "id": "LIV-034",
      "environment": "live",
      "title": "Front fill matrix",
      "brief": "Patch matrix output to front-fill processing while mains remain active.",
      "difficulty": 4,
      "required": [
        [
          "Matrix 1 Output",
          "Front Fill Processor Input"
        ],
        [
          "Main L Output",
          "System Processor L In"
        ],
```

## LIV-035 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:18814

```text
      ],
      "learning": [
        "Matrix routing",
        "Speaker zones"
      ],
      "time": 300
    },
    {
      "id": "LIV-035",
      "environment": "live",
      "title": "Sub matrix feed",
      "brief": "Patch sub matrix output to the sub processor.",
      "difficulty": 4,
      "required": [
        [
          "Matrix 2 Output",
          "Sub Processor Input"
        ],
        [
          "Main L Output",
          "System Processor L In"
        ],
```

## LIV-036 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:18865

```text
      ],
      "learning": [
        "Sub routing",
        "Matrix outputs"
      ],
      "time": 300
    },
    {
      "id": "LIV-036",
      "environment": "live",
      "title": "Delay tower route",
      "brief": "Patch a matrix output to the delay tower processor.",
      "difficulty": 4,
      "required": [
        [
          "Matrix 3 Output",
          "Delay Tower Processor Input"
        ],
        [
          "Main L Output",
          "System Processor L In"
        ],
```

## LIV-037 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:18940

```text
            "correct": false
          }
        ],
        "explanation": "This checkpoint replaces the patch board and tests the concept behind this environment before moving on."
      },
      "time": 300
    },
    {
      "id": "LIV-037",
      "environment": "live",
      "title": "Broadcast split",
      "brief": "Patch broadcast split outputs for a recorder or stream feed.",
      "difficulty": 4,
      "required": [
        [
          "Broadcast Split L",
          "Record Out L"
        ],
        [
          "Broadcast Split R",
          "Record Out R"
        ],
```

## LIV-038 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:18995

```text
      ],
      "learning": [
        "Broadcast split",
        "Record output"
      ],
      "time": 300
    },
    {
      "id": "LIV-038",
      "environment": "live",
      "title": "Talkback to monitor system",
      "brief": "Route talkback into the monitor send path without feeding mains.",
      "difficulty": 4,
      "required": [
        [
          "Talkback Mic",
          "Stage Box Input 14"
        ],
        [
          "Talkback Output",
          "In-Ear B Input"
        ],
```

## LIV-039 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:19054

```text
      ],
      "learning": [
        "Talkback",
        "Monitor communication"
      ],
      "time": 300
    },
    {
      "id": "LIV-039",
      "environment": "live",
      "title": "Keyboard stereo inputs",
      "brief": "Patch stereo keyboard DIs into adjacent stagebox inputs.",
      "difficulty": 4,
      "required": [
        [
          "Keys L DI",
          "Stage Box Input 7"
        ],
        [
          "Keys R DI",
          "Stage Box Input 8"
        ],
```

## LIV-040 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:19109

```text
      ],
      "learning": [
        "Stereo DI",
        "Stagebox order"
      ],
      "time": 300
    },
    {
      "id": "LIV-040",
      "environment": "live",
      "title": "Main PA amp feed",
      "brief": "Patch the console mains into the system processor, then patch the processor outputs into the main PA amplifier inputs.",
      "difficulty": 4,
      "required": [
        [
          "Main L Output",
          "System Processor L In"
        ],
        [
          "Main R Output",
          "System Processor R In"
        ],
```

## LIV-041 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:19168

```text
      ],
      "learning": [
        "System processing",
        "PA feed"
      ],
      "time": 300
    },
    {
      "id": "LIV-041",
      "environment": "live",
      "title": "Lead Vocal Mic to FOH",
      "brief": "Patch Lead Vocal Mic into the stagebox and feed mains to system processing.",
      "difficulty": 5,
      "required": [
        [
          "Lead Vocal Mic",
          "Stage Box Input 5"
        ],
        [
          "Main L Output",
          "System Processor L In"
        ],
```

## LIV-042 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:19246

```text
          "ADR Booth Headphone Amp",
          "Phone Hybrid"
        ],
        "explanation": "This level replaces the patch board with a system-design decision: identify the pieces that actually belong in the room."
      },
      "time": 340
    },
    {
      "id": "LIV-042",
      "environment": "live",
      "title": "Vocal wedge mix 2",
      "brief": "Patch a vocal monitor aux to the wedge input.",
      "difficulty": 5,
      "required": [
        [
          "Lead Vocal Mic",
          "Stage Box Input 1"
        ],
        [
          "FOH Aux 1 Output",
          "Vocal Wedge Input"
        ],
```

## LIV-043 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:19313

```text
      ],
      "learning": [
        "Monitor aux",
        "Wedge routing"
      ],
      "time": 340
    },
    {
      "id": "LIV-043",
      "environment": "live",
      "title": "Stereo IEM send 1",
      "brief": "Patch stereo aux outputs into the IEM transmitter.",
      "difficulty": 5,
      "required": [
        [
          "FOH Aux 5 L Output",
          "IEM TX A Left Input"
        ],
        [
          "FOH Aux 5 R Output",
          "IEM TX A Right Input"
        ],
```

## LIV-044 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:19376

```text
      ],
      "learning": [
        "Stereo aux",
        "IEM routing"
      ],
      "time": 340
    },
    {
      "id": "LIV-044",
      "environment": "live",
      "title": "Front fill matrix",
      "brief": "Patch matrix output to front-fill processing while mains remain active.",
      "difficulty": 5,
      "required": [
        [
          "Matrix 1 Output",
          "Front Fill Processor Input"
        ],
        [
          "Main L Output",
          "System Processor L In"
        ],
```

## LIV-045 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:19439

```text
      ],
      "learning": [
        "Matrix routing",
        "Speaker zones"
      ],
      "time": 340
    },
    {
          "id": "LIV-045",
          "environment": "live",
          "title": "Sub matrix feed",
          "brief": "Patch sub matrix output to the sub processor.",
          "difficulty": 5,
          "required": [
            [
              "Matrix 2 Output",
              "Sub Processor Input"
            ],
            [
              "Main L Output",
              "System Processor L In"
            ],
```

## LIV-046 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:19522

```text
                "correct": false
              }
            ],
            "explanation": "This checkpoint replaces the patch board and tests the concept behind this environment before moving on."
          },
          "time": 340
        },
    {
      "id": "LIV-046",
      "environment": "live",
      "title": "Delay tower route",
      "brief": "Patch a matrix output to the delay tower processor.",
      "difficulty": 5,
      "required": [
        [
          "Matrix 3 Output",
          "Delay Tower Processor Input"
        ],
        [
          "Main L Output",
          "System Processor L In"
        ],
```

## LIV-047 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:19585

```text
      ],
      "learning": [
        "Delay tower",
        "Matrix feed"
      ],
      "time": 340
    },
    {
      "id": "LIV-047",
      "environment": "live",
      "title": "Broadcast split",
      "brief": "Patch broadcast split outputs for a recorder or stream feed.",
      "difficulty": 5,
      "required": [
        [
          "Broadcast Split L",
          "Record Out L"
        ],
        [
          "Broadcast Split R",
          "Record Out R"
        ],
```

## LIV-048 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:19648

```text
      ],
      "learning": [
        "Broadcast split",
        "Record output"
      ],
      "time": 340
    },
    {
      "id": "LIV-048",
      "environment": "live",
      "title": "Talkback to monitor system",
      "brief": "Route talkback into the monitor send path without feeding mains.",
      "difficulty": 5,
      "required": [
        [
          "Talkback Mic",
          "Stage Box Input 14"
        ],
        [
          "Talkback Output",
          "In-Ear B Input"
        ],
```

## LIV-049 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:19715

```text
      ],
      "learning": [
        "Talkback",
        "Monitor communication"
      ],
      "time": 340
    },
    {
      "id": "LIV-049",
      "environment": "live",
      "title": "Keyboard stereo inputs",
      "brief": "Patch stereo keyboard DIs into adjacent stagebox inputs.",
      "difficulty": 5,
      "required": [
        [
          "Keys L DI",
          "Stage Box Input 7"
        ],
        [
          "Keys R DI",
          "Stage Box Input 8"
        ],
```

## LIV-050 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:19778

```text
      ],
      "learning": [
        "Stereo DI",
        "Stagebox order"
      ],
      "time": 340
    },
    {
      "id": "LIV-050",
      "environment": "live",
      "title": "Main PA amp feed",
      "brief": "Patch the console mains into the system processor, then patch the processor outputs into the main PA amplifier inputs.",
      "difficulty": 5,
      "required": [
        [
          "Main L Output",
          "System Processor L In"
        ],
        [
          "Main R Output",
          "System Processor R In"
        ],
```

## LIV-113 — launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html:26165

```text
    training:{ type:'diagnose', label:'Diagnose', prompt:'Symptom: the remote caller hears an echo of their own voice.', symptom:'Caller hears themselves delayed in the return feed.', patches:[
      {text:'Phone Hybrid Receive → Broadcast Console Channel 5 Line Input', ok:true, reason:'This gets the caller into the console.'},
      {text:'Program Bus Output → Phone Hybrid Send', ok:false, reason:'This is the diagnosis: full program includes the caller, so it feeds them back to themselves. Use the mix-minus output.'},
      {text:'Mix-Minus 1 Output → Phone Hybrid Send', ok:true, reason:'Correct repair: mix-minus excludes the remote caller from the return.'}
    ], tools:['Listen','Trace','Confirm','Solve'], explanation:'Diagnosis uses a symptom and meter/tool context, not just a visible bad cable.' }
  });

  addOrReplaceLevel({
    id:'LIV-113', environment:'live', title:'Show Mode: IEM Right Side Gone', brief:'During the set, restore the performer’s stereo IEM feed without touching the PA mains.', difficulty:3, time:150,
    required:[['FOH Aux 5 L Output','IEM TX A Left Input'],['FOH Aux 5 R Output','IEM TX A Right Input'],['Lead Vocal Mic','Stage Box Input 1'],['Keys L DI','Stage Box Input 7'],['Keys R DI','Stage Box Input 8']],
    forbidden:[['Main R Output','IEM TX A Right Input']],
    system:['Show Mode simulates a live pressure fix.','Aux 5 L/R feeds the IEM transmitter; mains are not a monitor source.'],
    notes:['Stereo repair must preserve both sides of the L/R pair.'],
    learning:['Show pressure','Stereo IEM repair','Monitor vs mains'],
    training:{ type:'show-mode', label:'Show Mode', prompt:'Mid-show symptom: the performer has only the left side of their IEM mix.', symptom:'Right IEM is silent while the show is running.', countdown:'Doors are open. Fix the monitor path without breaking the PA.', patches:[
      {text:'FOH Aux 5 L Output → IEM TX A Left Input', ok:true, reason:'Left side is already correct.'},
      {text:'Main R Output → IEM TX A Right Input', ok:false, reason:'Wrong family: mains are the audience path, not the performer IEM send.'},
      {text:'FOH Aux 5 R Output → IEM TX A Right Input', ok:true, reason:'Correct repair: the right side of Aux 5 completes the stereo IEM pair.'}
    ], explanation:'Show Mode adds urgency and focuses on restoring service without causing a new failure.' }
  });

  addOrReplaceLevel({
```

## LIV-001 — launch/Signal_Flow_v1_41_17_NAV_WRAPPER.html:81

```text
      <iframe id="gameFrame" title="Signal Flow Game" src="Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html#/level/PST-103"></iframe>
    </main>
  </div>
  <script>
  (function(){
    const GAME = 'Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html';
    const LEVELS = {
      REC:['REC-001','REC-002','REC-003','REC-004','REC-005','REC-006'],
      LIV:['LIV-001','LIV-002','LIV-003','LIV-004','LIV-005','LIV-006','LIV-013','LIV-113','LIV-213','LIV-214','LIV-215','LIV-216','LIV-217'],
      BRD:['BRD-001','BRD-002','BRD-003','BRD-004','BRD-005','BRD-006','BRD-103','BRD-104'],
      PST:['PST-001','PST-002','PST-003','PST-004','PST-005','PST-006','PST-102','PST-103'],
      GAM:['GAM-001','GAM-002','GAM-003','GAM-004','GAM-005','GAM-006']
    };
    const frame = document.getElementById('gameFrame');
    const envSelect = document.getElementById('envSelect');
    const levelSelect = document.getElementById('levelSelect');
    const manualLevel = document.getElementById('manualLevel');
    const loadBtn = document.getElementById('loadBtn');
    const homeBtn = document.getElementById('homeBtn');

    function populate(env){
      const ids = LEVELS[env] || LEVELS.PST;
```

## LIV-002 — launch/Signal_Flow_v1_41_17_NAV_WRAPPER.html:81

```text
      <iframe id="gameFrame" title="Signal Flow Game" src="Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html#/level/PST-103"></iframe>
    </main>
  </div>
  <script>
  (function(){
    const GAME = 'Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html';
    const LEVELS = {
      REC:['REC-001','REC-002','REC-003','REC-004','REC-005','REC-006'],
      LIV:['LIV-001','LIV-002','LIV-003','LIV-004','LIV-005','LIV-006','LIV-013','LIV-113','LIV-213','LIV-214','LIV-215','LIV-216','LIV-217'],
      BRD:['BRD-001','BRD-002','BRD-003','BRD-004','BRD-005','BRD-006','BRD-103','BRD-104'],
      PST:['PST-001','PST-002','PST-003','PST-004','PST-005','PST-006','PST-102','PST-103'],
      GAM:['GAM-001','GAM-002','GAM-003','GAM-004','GAM-005','GAM-006']
    };
    const frame = document.getElementById('gameFrame');
    const envSelect = document.getElementById('envSelect');
    const levelSelect = document.getElementById('levelSelect');
    const manualLevel = document.getElementById('manualLevel');
    const loadBtn = document.getElementById('loadBtn');
    const homeBtn = document.getElementById('homeBtn');

    function populate(env){
      const ids = LEVELS[env] || LEVELS.PST;
```

## LIV-003 — launch/Signal_Flow_v1_41_17_NAV_WRAPPER.html:81

```text
      <iframe id="gameFrame" title="Signal Flow Game" src="Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html#/level/PST-103"></iframe>
    </main>
  </div>
  <script>
  (function(){
    const GAME = 'Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html';
    const LEVELS = {
      REC:['REC-001','REC-002','REC-003','REC-004','REC-005','REC-006'],
      LIV:['LIV-001','LIV-002','LIV-003','LIV-004','LIV-005','LIV-006','LIV-013','LIV-113','LIV-213','LIV-214','LIV-215','LIV-216','LIV-217'],
      BRD:['BRD-001','BRD-002','BRD-003','BRD-004','BRD-005','BRD-006','BRD-103','BRD-104'],
      PST:['PST-001','PST-002','PST-003','PST-004','PST-005','PST-006','PST-102','PST-103'],
      GAM:['GAM-001','GAM-002','GAM-003','GAM-004','GAM-005','GAM-006']
    };
    const frame = document.getElementById('gameFrame');
    const envSelect = document.getElementById('envSelect');
    const levelSelect = document.getElementById('levelSelect');
    const manualLevel = document.getElementById('manualLevel');
    const loadBtn = document.getElementById('loadBtn');
    const homeBtn = document.getElementById('homeBtn');

    function populate(env){
      const ids = LEVELS[env] || LEVELS.PST;
```

## LIV-004 — launch/Signal_Flow_v1_41_17_NAV_WRAPPER.html:81

```text
      <iframe id="gameFrame" title="Signal Flow Game" src="Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html#/level/PST-103"></iframe>
    </main>
  </div>
  <script>
  (function(){
    const GAME = 'Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html';
    const LEVELS = {
      REC:['REC-001','REC-002','REC-003','REC-004','REC-005','REC-006'],
      LIV:['LIV-001','LIV-002','LIV-003','LIV-004','LIV-005','LIV-006','LIV-013','LIV-113','LIV-213','LIV-214','LIV-215','LIV-216','LIV-217'],
      BRD:['BRD-001','BRD-002','BRD-003','BRD-004','BRD-005','BRD-006','BRD-103','BRD-104'],
      PST:['PST-001','PST-002','PST-003','PST-004','PST-005','PST-006','PST-102','PST-103'],
      GAM:['GAM-001','GAM-002','GAM-003','GAM-004','GAM-005','GAM-006']
    };
    const frame = document.getElementById('gameFrame');
    const envSelect = document.getElementById('envSelect');
    const levelSelect = document.getElementById('levelSelect');
    const manualLevel = document.getElementById('manualLevel');
    const loadBtn = document.getElementById('loadBtn');
    const homeBtn = document.getElementById('homeBtn');

    function populate(env){
      const ids = LEVELS[env] || LEVELS.PST;
```

## LIV-005 — launch/Signal_Flow_v1_41_17_NAV_WRAPPER.html:81

```text
      <iframe id="gameFrame" title="Signal Flow Game" src="Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html#/level/PST-103"></iframe>
    </main>
  </div>
  <script>
  (function(){
    const GAME = 'Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html';
    const LEVELS = {
      REC:['REC-001','REC-002','REC-003','REC-004','REC-005','REC-006'],
      LIV:['LIV-001','LIV-002','LIV-003','LIV-004','LIV-005','LIV-006','LIV-013','LIV-113','LIV-213','LIV-214','LIV-215','LIV-216','LIV-217'],
      BRD:['BRD-001','BRD-002','BRD-003','BRD-004','BRD-005','BRD-006','BRD-103','BRD-104'],
      PST:['PST-001','PST-002','PST-003','PST-004','PST-005','PST-006','PST-102','PST-103'],
      GAM:['GAM-001','GAM-002','GAM-003','GAM-004','GAM-005','GAM-006']
    };
    const frame = document.getElementById('gameFrame');
    const envSelect = document.getElementById('envSelect');
    const levelSelect = document.getElementById('levelSelect');
    const manualLevel = document.getElementById('manualLevel');
    const loadBtn = document.getElementById('loadBtn');
    const homeBtn = document.getElementById('homeBtn');

    function populate(env){
      const ids = LEVELS[env] || LEVELS.PST;
```

## LIV-006 — launch/Signal_Flow_v1_41_17_NAV_WRAPPER.html:81

```text
      <iframe id="gameFrame" title="Signal Flow Game" src="Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html#/level/PST-103"></iframe>
    </main>
  </div>
  <script>
  (function(){
    const GAME = 'Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html';
    const LEVELS = {
      REC:['REC-001','REC-002','REC-003','REC-004','REC-005','REC-006'],
      LIV:['LIV-001','LIV-002','LIV-003','LIV-004','LIV-005','LIV-006','LIV-013','LIV-113','LIV-213','LIV-214','LIV-215','LIV-216','LIV-217'],
      BRD:['BRD-001','BRD-002','BRD-003','BRD-004','BRD-005','BRD-006','BRD-103','BRD-104'],
      PST:['PST-001','PST-002','PST-003','PST-004','PST-005','PST-006','PST-102','PST-103'],
      GAM:['GAM-001','GAM-002','GAM-003','GAM-004','GAM-005','GAM-006']
    };
    const frame = document.getElementById('gameFrame');
    const envSelect = document.getElementById('envSelect');
    const levelSelect = document.getElementById('levelSelect');
    const manualLevel = document.getElementById('manualLevel');
    const loadBtn = document.getElementById('loadBtn');
    const homeBtn = document.getElementById('homeBtn');

    function populate(env){
      const ids = LEVELS[env] || LEVELS.PST;
```

## LIV-013 — launch/Signal_Flow_v1_41_17_NAV_WRAPPER.html:81

```text
      <iframe id="gameFrame" title="Signal Flow Game" src="Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html#/level/PST-103"></iframe>
    </main>
  </div>
  <script>
  (function(){
    const GAME = 'Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html';
    const LEVELS = {
      REC:['REC-001','REC-002','REC-003','REC-004','REC-005','REC-006'],
      LIV:['LIV-001','LIV-002','LIV-003','LIV-004','LIV-005','LIV-006','LIV-013','LIV-113','LIV-213','LIV-214','LIV-215','LIV-216','LIV-217'],
      BRD:['BRD-001','BRD-002','BRD-003','BRD-004','BRD-005','BRD-006','BRD-103','BRD-104'],
      PST:['PST-001','PST-002','PST-003','PST-004','PST-005','PST-006','PST-102','PST-103'],
      GAM:['GAM-001','GAM-002','GAM-003','GAM-004','GAM-005','GAM-006']
    };
    const frame = document.getElementById('gameFrame');
    const envSelect = document.getElementById('envSelect');
    const levelSelect = document.getElementById('levelSelect');
    const manualLevel = document.getElementById('manualLevel');
    const loadBtn = document.getElementById('loadBtn');
    const homeBtn = document.getElementById('homeBtn');

    function populate(env){
      const ids = LEVELS[env] || LEVELS.PST;
```

## LIV-113 — launch/Signal_Flow_v1_41_17_NAV_WRAPPER.html:81

```text
      <iframe id="gameFrame" title="Signal Flow Game" src="Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html#/level/PST-103"></iframe>
    </main>
  </div>
  <script>
  (function(){
    const GAME = 'Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html';
    const LEVELS = {
      REC:['REC-001','REC-002','REC-003','REC-004','REC-005','REC-006'],
      LIV:['LIV-001','LIV-002','LIV-003','LIV-004','LIV-005','LIV-006','LIV-013','LIV-113','LIV-213','LIV-214','LIV-215','LIV-216','LIV-217'],
      BRD:['BRD-001','BRD-002','BRD-003','BRD-004','BRD-005','BRD-006','BRD-103','BRD-104'],
      PST:['PST-001','PST-002','PST-003','PST-004','PST-005','PST-006','PST-102','PST-103'],
      GAM:['GAM-001','GAM-002','GAM-003','GAM-004','GAM-005','GAM-006']
    };
    const frame = document.getElementById('gameFrame');
    const envSelect = document.getElementById('envSelect');
    const levelSelect = document.getElementById('levelSelect');
    const manualLevel = document.getElementById('manualLevel');
    const loadBtn = document.getElementById('loadBtn');
    const homeBtn = document.getElementById('homeBtn');

    function populate(env){
      const ids = LEVELS[env] || LEVELS.PST;
```

## LIV-213 — launch/Signal_Flow_v1_41_17_NAV_WRAPPER.html:81

```text
      <iframe id="gameFrame" title="Signal Flow Game" src="Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html#/level/PST-103"></iframe>
    </main>
  </div>
  <script>
  (function(){
    const GAME = 'Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html';
    const LEVELS = {
      REC:['REC-001','REC-002','REC-003','REC-004','REC-005','REC-006'],
      LIV:['LIV-001','LIV-002','LIV-003','LIV-004','LIV-005','LIV-006','LIV-013','LIV-113','LIV-213','LIV-214','LIV-215','LIV-216','LIV-217'],
      BRD:['BRD-001','BRD-002','BRD-003','BRD-004','BRD-005','BRD-006','BRD-103','BRD-104'],
      PST:['PST-001','PST-002','PST-003','PST-004','PST-005','PST-006','PST-102','PST-103'],
      GAM:['GAM-001','GAM-002','GAM-003','GAM-004','GAM-005','GAM-006']
    };
    const frame = document.getElementById('gameFrame');
    const envSelect = document.getElementById('envSelect');
    const levelSelect = document.getElementById('levelSelect');
    const manualLevel = document.getElementById('manualLevel');
    const loadBtn = document.getElementById('loadBtn');
    const homeBtn = document.getElementById('homeBtn');

    function populate(env){
      const ids = LEVELS[env] || LEVELS.PST;
```

## LIV-214 — launch/Signal_Flow_v1_41_17_NAV_WRAPPER.html:81

```text
      <iframe id="gameFrame" title="Signal Flow Game" src="Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html#/level/PST-103"></iframe>
    </main>
  </div>
  <script>
  (function(){
    const GAME = 'Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html';
    const LEVELS = {
      REC:['REC-001','REC-002','REC-003','REC-004','REC-005','REC-006'],
      LIV:['LIV-001','LIV-002','LIV-003','LIV-004','LIV-005','LIV-006','LIV-013','LIV-113','LIV-213','LIV-214','LIV-215','LIV-216','LIV-217'],
      BRD:['BRD-001','BRD-002','BRD-003','BRD-004','BRD-005','BRD-006','BRD-103','BRD-104'],
      PST:['PST-001','PST-002','PST-003','PST-004','PST-005','PST-006','PST-102','PST-103'],
      GAM:['GAM-001','GAM-002','GAM-003','GAM-004','GAM-005','GAM-006']
    };
    const frame = document.getElementById('gameFrame');
    const envSelect = document.getElementById('envSelect');
    const levelSelect = document.getElementById('levelSelect');
    const manualLevel = document.getElementById('manualLevel');
    const loadBtn = document.getElementById('loadBtn');
    const homeBtn = document.getElementById('homeBtn');

    function populate(env){
      const ids = LEVELS[env] || LEVELS.PST;
```

## LIV-215 — launch/Signal_Flow_v1_41_17_NAV_WRAPPER.html:81

```text
      <iframe id="gameFrame" title="Signal Flow Game" src="Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html#/level/PST-103"></iframe>
    </main>
  </div>
  <script>
  (function(){
    const GAME = 'Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html';
    const LEVELS = {
      REC:['REC-001','REC-002','REC-003','REC-004','REC-005','REC-006'],
      LIV:['LIV-001','LIV-002','LIV-003','LIV-004','LIV-005','LIV-006','LIV-013','LIV-113','LIV-213','LIV-214','LIV-215','LIV-216','LIV-217'],
      BRD:['BRD-001','BRD-002','BRD-003','BRD-004','BRD-005','BRD-006','BRD-103','BRD-104'],
      PST:['PST-001','PST-002','PST-003','PST-004','PST-005','PST-006','PST-102','PST-103'],
      GAM:['GAM-001','GAM-002','GAM-003','GAM-004','GAM-005','GAM-006']
    };
    const frame = document.getElementById('gameFrame');
    const envSelect = document.getElementById('envSelect');
    const levelSelect = document.getElementById('levelSelect');
    const manualLevel = document.getElementById('manualLevel');
    const loadBtn = document.getElementById('loadBtn');
    const homeBtn = document.getElementById('homeBtn');

    function populate(env){
      const ids = LEVELS[env] || LEVELS.PST;
```

## LIV-216 — launch/Signal_Flow_v1_41_17_NAV_WRAPPER.html:81

```text
      <iframe id="gameFrame" title="Signal Flow Game" src="Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html#/level/PST-103"></iframe>
    </main>
  </div>
  <script>
  (function(){
    const GAME = 'Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html';
    const LEVELS = {
      REC:['REC-001','REC-002','REC-003','REC-004','REC-005','REC-006'],
      LIV:['LIV-001','LIV-002','LIV-003','LIV-004','LIV-005','LIV-006','LIV-013','LIV-113','LIV-213','LIV-214','LIV-215','LIV-216','LIV-217'],
      BRD:['BRD-001','BRD-002','BRD-003','BRD-004','BRD-005','BRD-006','BRD-103','BRD-104'],
      PST:['PST-001','PST-002','PST-003','PST-004','PST-005','PST-006','PST-102','PST-103'],
      GAM:['GAM-001','GAM-002','GAM-003','GAM-004','GAM-005','GAM-006']
    };
    const frame = document.getElementById('gameFrame');
    const envSelect = document.getElementById('envSelect');
    const levelSelect = document.getElementById('levelSelect');
    const manualLevel = document.getElementById('manualLevel');
    const loadBtn = document.getElementById('loadBtn');
    const homeBtn = document.getElementById('homeBtn');

    function populate(env){
      const ids = LEVELS[env] || LEVELS.PST;
```

## LIV-217 — launch/Signal_Flow_v1_41_17_NAV_WRAPPER.html:81

```text
      <iframe id="gameFrame" title="Signal Flow Game" src="Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html#/level/PST-103"></iframe>
    </main>
  </div>
  <script>
  (function(){
    const GAME = 'Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html';
    const LEVELS = {
      REC:['REC-001','REC-002','REC-003','REC-004','REC-005','REC-006'],
      LIV:['LIV-001','LIV-002','LIV-003','LIV-004','LIV-005','LIV-006','LIV-013','LIV-113','LIV-213','LIV-214','LIV-215','LIV-216','LIV-217'],
      BRD:['BRD-001','BRD-002','BRD-003','BRD-004','BRD-005','BRD-006','BRD-103','BRD-104'],
      PST:['PST-001','PST-002','PST-003','PST-004','PST-005','PST-006','PST-102','PST-103'],
      GAM:['GAM-001','GAM-002','GAM-003','GAM-004','GAM-005','GAM-006']
    };
    const frame = document.getElementById('gameFrame');
    const envSelect = document.getElementById('envSelect');
    const levelSelect = document.getElementById('levelSelect');
    const manualLevel = document.getElementById('manualLevel');
    const loadBtn = document.getElementById('loadBtn');
    const homeBtn = document.getElementById('homeBtn');

    function populate(env){
      const ids = LEVELS[env] || LEVELS.PST;
```

## LIV-001 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:50

```text
        'REC-026','REC-027','REC-028','REC-029','REC-030',
        'REC-031','REC-032','REC-033','REC-IR-04','REC-035',
        'REC-036','REC-037','REC-038','REC-039','REC-040',
        'REC-041','REC-042','REC-043','REC-044','REC-045',
        'REC-046','REC-047','REC-048','REC-049','REC-050'
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
```

## LIV-002 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:50

```text
        'REC-026','REC-027','REC-028','REC-029','REC-030',
        'REC-031','REC-032','REC-033','REC-IR-04','REC-035',
        'REC-036','REC-037','REC-038','REC-039','REC-040',
        'REC-041','REC-042','REC-043','REC-044','REC-045',
        'REC-046','REC-047','REC-048','REC-049','REC-050'
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
```

## LIV-003 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:50

```text
        'REC-026','REC-027','REC-028','REC-029','REC-030',
        'REC-031','REC-032','REC-033','REC-IR-04','REC-035',
        'REC-036','REC-037','REC-038','REC-039','REC-040',
        'REC-041','REC-042','REC-043','REC-044','REC-045',
        'REC-046','REC-047','REC-048','REC-049','REC-050'
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
```

## LIV-004 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:50

```text
        'REC-026','REC-027','REC-028','REC-029','REC-030',
        'REC-031','REC-032','REC-033','REC-IR-04','REC-035',
        'REC-036','REC-037','REC-038','REC-039','REC-040',
        'REC-041','REC-042','REC-043','REC-044','REC-045',
        'REC-046','REC-047','REC-048','REC-049','REC-050'
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
```

## LIV-006 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:51

```text
        'REC-031','REC-032','REC-033','REC-IR-04','REC-035',
        'REC-036','REC-037','REC-038','REC-039','REC-040',
        'REC-041','REC-042','REC-043','REC-044','REC-045',
        'REC-046','REC-047','REC-048','REC-049','REC-050'
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
```

## LIV-007 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:51

```text
        'REC-031','REC-032','REC-033','REC-IR-04','REC-035',
        'REC-036','REC-037','REC-038','REC-039','REC-040',
        'REC-041','REC-042','REC-043','REC-044','REC-045',
        'REC-046','REC-047','REC-048','REC-049','REC-050'
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
```

## LIV-008 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:51

```text
        'REC-031','REC-032','REC-033','REC-IR-04','REC-035',
        'REC-036','REC-037','REC-038','REC-039','REC-040',
        'REC-041','REC-042','REC-043','REC-044','REC-045',
        'REC-046','REC-047','REC-048','REC-049','REC-050'
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
```

## LIV-009 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:51

```text
        'REC-031','REC-032','REC-033','REC-IR-04','REC-035',
        'REC-036','REC-037','REC-038','REC-039','REC-040',
        'REC-041','REC-042','REC-043','REC-044','REC-045',
        'REC-046','REC-047','REC-048','REC-049','REC-050'
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
```

## LIV-010 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:51

```text
        'REC-031','REC-032','REC-033','REC-IR-04','REC-035',
        'REC-036','REC-037','REC-038','REC-039','REC-040',
        'REC-041','REC-042','REC-043','REC-044','REC-045',
        'REC-046','REC-047','REC-048','REC-049','REC-050'
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
```

## LIV-011 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:52

```text
        'REC-036','REC-037','REC-038','REC-039','REC-040',
        'REC-041','REC-042','REC-043','REC-044','REC-045',
        'REC-046','REC-047','REC-048','REC-049','REC-050'
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
```

## LIV-012 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:52

```text
        'REC-036','REC-037','REC-038','REC-039','REC-040',
        'REC-041','REC-042','REC-043','REC-044','REC-045',
        'REC-046','REC-047','REC-048','REC-049','REC-050'
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
```

## LIV-013 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:52

```text
        'REC-036','REC-037','REC-038','REC-039','REC-040',
        'REC-041','REC-042','REC-043','REC-044','REC-045',
        'REC-046','REC-047','REC-048','REC-049','REC-050'
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
```

## LIV-015 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:52

```text
        'REC-036','REC-037','REC-038','REC-039','REC-040',
        'REC-041','REC-042','REC-043','REC-044','REC-045',
        'REC-046','REC-047','REC-048','REC-049','REC-050'
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
```

## LIV-016 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:53

```text
        'REC-041','REC-042','REC-043','REC-044','REC-045',
        'REC-046','REC-047','REC-048','REC-049','REC-050'
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
```

## LIV-017 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:53

```text
        'REC-041','REC-042','REC-043','REC-044','REC-045',
        'REC-046','REC-047','REC-048','REC-049','REC-050'
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
```

## LIV-018 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:53

```text
        'REC-041','REC-042','REC-043','REC-044','REC-045',
        'REC-046','REC-047','REC-048','REC-049','REC-050'
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
```

## LIV-019 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:53

```text
        'REC-041','REC-042','REC-043','REC-044','REC-045',
        'REC-046','REC-047','REC-048','REC-049','REC-050'
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
```

## LIV-020 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:53

```text
        'REC-041','REC-042','REC-043','REC-044','REC-045',
        'REC-046','REC-047','REC-048','REC-049','REC-050'
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
```

## LIV-021 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:54

```text
        'REC-046','REC-047','REC-048','REC-049','REC-050'
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
```

## LIV-022 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:54

```text
        'REC-046','REC-047','REC-048','REC-049','REC-050'
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
```

## LIV-023 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:54

```text
        'REC-046','REC-047','REC-048','REC-049','REC-050'
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
```

## LIV-025 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:54

```text
        'REC-046','REC-047','REC-048','REC-049','REC-050'
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
```

## LIV-026 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:55

```text
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
        'BRD-026','BRD-027','BRD-028','BRD-029','BRD-030',
```

## LIV-027 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:55

```text
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
        'BRD-026','BRD-027','BRD-028','BRD-029','BRD-030',
```

## LIV-028 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:55

```text
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
        'BRD-026','BRD-027','BRD-028','BRD-029','BRD-030',
```

## LIV-029 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:55

```text
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
        'BRD-026','BRD-027','BRD-028','BRD-029','BRD-030',
```

## LIV-030 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:55

```text
      ],

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
        'BRD-026','BRD-027','BRD-028','BRD-029','BRD-030',
```

## LIV-031 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:56

```text

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
        'BRD-026','BRD-027','BRD-028','BRD-029','BRD-030',
        'BRD-031','BRD-032','BRD-033','BRD-034','BRD-035',
```

## LIV-032 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:56

```text

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
        'BRD-026','BRD-027','BRD-028','BRD-029','BRD-030',
        'BRD-031','BRD-032','BRD-033','BRD-034','BRD-035',
```

## LIV-033 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:56

```text

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
        'BRD-026','BRD-027','BRD-028','BRD-029','BRD-030',
        'BRD-031','BRD-032','BRD-033','BRD-034','BRD-035',
```

## LIV-034 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:56

```text

      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
        'BRD-026','BRD-027','BRD-028','BRD-029','BRD-030',
        'BRD-031','BRD-032','BRD-033','BRD-034','BRD-035',
```

## LIV-036 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:57

```text
      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
        'BRD-026','BRD-027','BRD-028','BRD-029','BRD-030',
        'BRD-031','BRD-032','BRD-033','BRD-034','BRD-035',
        'BRD-036','BRD-IR-04','BRD-038','BRD-039','BRD-040',
```

## LIV-037 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:57

```text
      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
        'BRD-026','BRD-027','BRD-028','BRD-029','BRD-030',
        'BRD-031','BRD-032','BRD-033','BRD-034','BRD-035',
        'BRD-036','BRD-IR-04','BRD-038','BRD-039','BRD-040',
```

## LIV-038 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:57

```text
      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
        'BRD-026','BRD-027','BRD-028','BRD-029','BRD-030',
        'BRD-031','BRD-032','BRD-033','BRD-034','BRD-035',
        'BRD-036','BRD-IR-04','BRD-038','BRD-039','BRD-040',
```

## LIV-039 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:57

```text
      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
        'BRD-026','BRD-027','BRD-028','BRD-029','BRD-030',
        'BRD-031','BRD-032','BRD-033','BRD-034','BRD-035',
        'BRD-036','BRD-IR-04','BRD-038','BRD-039','BRD-040',
```

## LIV-040 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:57

```text
      LIV:[
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
        'BRD-026','BRD-027','BRD-028','BRD-029','BRD-030',
        'BRD-031','BRD-032','BRD-033','BRD-034','BRD-035',
        'BRD-036','BRD-IR-04','BRD-038','BRD-039','BRD-040',
```

## LIV-041 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:58

```text
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
        'BRD-026','BRD-027','BRD-028','BRD-029','BRD-030',
        'BRD-031','BRD-032','BRD-033','BRD-034','BRD-035',
        'BRD-036','BRD-IR-04','BRD-038','BRD-039','BRD-040',
        'BRD-041','BRD-042','BRD-043','BRD-044','BRD-045',
```

## LIV-042 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:58

```text
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
        'BRD-026','BRD-027','BRD-028','BRD-029','BRD-030',
        'BRD-031','BRD-032','BRD-033','BRD-034','BRD-035',
        'BRD-036','BRD-IR-04','BRD-038','BRD-039','BRD-040',
        'BRD-041','BRD-042','BRD-043','BRD-044','BRD-045',
```

## LIV-043 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:58

```text
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
        'BRD-026','BRD-027','BRD-028','BRD-029','BRD-030',
        'BRD-031','BRD-032','BRD-033','BRD-034','BRD-035',
        'BRD-036','BRD-IR-04','BRD-038','BRD-039','BRD-040',
        'BRD-041','BRD-042','BRD-043','BRD-044','BRD-045',
```

## LIV-044 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:58

```text
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
        'BRD-026','BRD-027','BRD-028','BRD-029','BRD-030',
        'BRD-031','BRD-032','BRD-033','BRD-034','BRD-035',
        'BRD-036','BRD-IR-04','BRD-038','BRD-039','BRD-040',
        'BRD-041','BRD-042','BRD-043','BRD-044','BRD-045',
```

## LIV-045 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:58

```text
        'LIV-001','LIV-002','LIV-003','LIV-004','LIV-IR-01',
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
        'BRD-026','BRD-027','BRD-028','BRD-029','BRD-030',
        'BRD-031','BRD-032','BRD-033','BRD-034','BRD-035',
        'BRD-036','BRD-IR-04','BRD-038','BRD-039','BRD-040',
        'BRD-041','BRD-042','BRD-043','BRD-044','BRD-045',
```

## LIV-047 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:59

```text
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
        'BRD-026','BRD-027','BRD-028','BRD-029','BRD-030',
        'BRD-031','BRD-032','BRD-033','BRD-034','BRD-035',
        'BRD-036','BRD-IR-04','BRD-038','BRD-039','BRD-040',
        'BRD-041','BRD-042','BRD-043','BRD-044','BRD-045',
        'BRD-046','BRD-047','BRD-048','BRD-049','BRD-050'
```

## LIV-048 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:59

```text
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
        'BRD-026','BRD-027','BRD-028','BRD-029','BRD-030',
        'BRD-031','BRD-032','BRD-033','BRD-034','BRD-035',
        'BRD-036','BRD-IR-04','BRD-038','BRD-039','BRD-040',
        'BRD-041','BRD-042','BRD-043','BRD-044','BRD-045',
        'BRD-046','BRD-047','BRD-048','BRD-049','BRD-050'
```

## LIV-049 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:59

```text
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
        'BRD-026','BRD-027','BRD-028','BRD-029','BRD-030',
        'BRD-031','BRD-032','BRD-033','BRD-034','BRD-035',
        'BRD-036','BRD-IR-04','BRD-038','BRD-039','BRD-040',
        'BRD-041','BRD-042','BRD-043','BRD-044','BRD-045',
        'BRD-046','BRD-047','BRD-048','BRD-049','BRD-050'
```

## LIV-050 — launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html:59

```text
        'LIV-006','LIV-007','LIV-008','LIV-009','LIV-010',
        'LIV-011','LIV-012','LIV-013','LIV-IR-02','LIV-015',
        'LIV-016','LIV-017','LIV-018','LIV-019','LIV-020',
        'LIV-021','LIV-022','LIV-023','LIV-IR-03','LIV-025',
        'LIV-026','LIV-027','LIV-028','LIV-029','LIV-030',
        'LIV-031','LIV-032','LIV-033','LIV-034','LIV-IR-04',
        'LIV-036','LIV-037','LIV-038','LIV-039','LIV-040',
        'LIV-041','LIV-042','LIV-043','LIV-044','LIV-045',
        'LIV-IR-05','LIV-047','LIV-048','LIV-049','LIV-050'
      ],

      BRD:[
        'BRD-001','BRD-002','BRD-003','BRD-004','BRD-IR-01',
        'BRD-006','BRD-007','BRD-008','BRD-009','BRD-010',
        'BRD-011','BRD-IR-02','BRD-013','BRD-014','BRD-015',
        'BRD-016','BRD-017','BRD-018','BRD-019','BRD-020',
        'BRD-021','BRD-022','BRD-023','BRD-IR-03','BRD-025',
        'BRD-026','BRD-027','BRD-028','BRD-029','BRD-030',
        'BRD-031','BRD-032','BRD-033','BRD-034','BRD-035',
        'BRD-036','BRD-IR-04','BRD-038','BRD-039','BRD-040',
        'BRD-041','BRD-042','BRD-043','BRD-044','BRD-045',
        'BRD-046','BRD-047','BRD-048','BRD-049','BRD-050'
```

## LIV-001 — src/live-sound-adapter.js:18

```text
  else root.SF_LIVE_SOUND_ADAPTER = factory();
})(typeof globalThis !== "undefined" ? globalThis : window, function() {
  "use strict";

  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
```

## LIV-002 — src/live-sound-adapter.js:18

```text
  else root.SF_LIVE_SOUND_ADAPTER = factory();
})(typeof globalThis !== "undefined" ? globalThis : window, function() {
  "use strict";

  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
```

## LIV-003 — src/live-sound-adapter.js:18

```text
  else root.SF_LIVE_SOUND_ADAPTER = factory();
})(typeof globalThis !== "undefined" ? globalThis : window, function() {
  "use strict";

  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
```

## LIV-004 — src/live-sound-adapter.js:18

```text
  else root.SF_LIVE_SOUND_ADAPTER = factory();
})(typeof globalThis !== "undefined" ? globalThis : window, function() {
  "use strict";

  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
```

## LIV-005 — src/live-sound-adapter.js:18

```text
  else root.SF_LIVE_SOUND_ADAPTER = factory();
})(typeof globalThis !== "undefined" ? globalThis : window, function() {
  "use strict";

  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
```

## LIV-006 — src/live-sound-adapter.js:19

```text
})(typeof globalThis !== "undefined" ? globalThis : window, function() {
  "use strict";

  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
```

## LIV-007 — src/live-sound-adapter.js:19

```text
})(typeof globalThis !== "undefined" ? globalThis : window, function() {
  "use strict";

  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
```

## LIV-008 — src/live-sound-adapter.js:19

```text
})(typeof globalThis !== "undefined" ? globalThis : window, function() {
  "use strict";

  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
```

## LIV-009 — src/live-sound-adapter.js:19

```text
})(typeof globalThis !== "undefined" ? globalThis : window, function() {
  "use strict";

  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
```

## LIV-010 — src/live-sound-adapter.js:19

```text
})(typeof globalThis !== "undefined" ? globalThis : window, function() {
  "use strict";

  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
```

## LIV-011 — src/live-sound-adapter.js:20

```text
  "use strict";

  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
```

## LIV-012 — src/live-sound-adapter.js:20

```text
  "use strict";

  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
```

## LIV-013 — src/live-sound-adapter.js:20

```text
  "use strict";

  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
```

## LIV-014 — src/live-sound-adapter.js:20

```text
  "use strict";

  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
```

## LIV-015 — src/live-sound-adapter.js:20

```text
  "use strict";

  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
```

## LIV-016 — src/live-sound-adapter.js:21

```text

  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
```

## LIV-017 — src/live-sound-adapter.js:21

```text

  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
```

## LIV-018 — src/live-sound-adapter.js:21

```text

  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
```

## LIV-019 — src/live-sound-adapter.js:21

```text

  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
```

## LIV-020 — src/live-sound-adapter.js:21

```text

  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
```

## LIV-021 — src/live-sound-adapter.js:22

```text
  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
```

## LIV-022 — src/live-sound-adapter.js:22

```text
  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
```

## LIV-023 — src/live-sound-adapter.js:22

```text
  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
```

## LIV-024 — src/live-sound-adapter.js:22

```text
  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
```

## LIV-025 — src/live-sound-adapter.js:22

```text
  const VERSION = "0.1.0";
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
```

## LIV-026 — src/live-sound-adapter.js:23

```text
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
```

## LIV-027 — src/live-sound-adapter.js:23

```text
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
```

## LIV-028 — src/live-sound-adapter.js:23

```text
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
```

## LIV-029 — src/live-sound-adapter.js:23

```text
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
```

## LIV-030 — src/live-sound-adapter.js:23

```text
  const LIVE_IR_LEVEL_RE = /^LIV-IR-\d+$/i;

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
```

## LIV-031 — src/live-sound-adapter.js:24

```text

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
```

## LIV-032 — src/live-sound-adapter.js:24

```text

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
```

## LIV-033 — src/live-sound-adapter.js:24

```text

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
```

## LIV-034 — src/live-sound-adapter.js:24

```text

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
```

## LIV-035 — src/live-sound-adapter.js:24

```text

  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
```

## LIV-036 — src/live-sound-adapter.js:25

```text
  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
    "stagebox.mic7": { panel: "stagebox", jack: "mic7", type: "xlr-female", label: "Stagebox Mic 7" },
```

## LIV-037 — src/live-sound-adapter.js:25

```text
  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
    "stagebox.mic7": { panel: "stagebox", jack: "mic7", type: "xlr-female", label: "Stagebox Mic 7" },
```

## LIV-038 — src/live-sound-adapter.js:25

```text
  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
    "stagebox.mic7": { panel: "stagebox", jack: "mic7", type: "xlr-female", label: "Stagebox Mic 7" },
```

## LIV-039 — src/live-sound-adapter.js:25

```text
  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
    "stagebox.mic7": { panel: "stagebox", jack: "mic7", type: "xlr-female", label: "Stagebox Mic 7" },
```

## LIV-040 — src/live-sound-adapter.js:25

```text
  const LIVE_NORMAL_LEVEL_IDS = [
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
    "stagebox.mic7": { panel: "stagebox", jack: "mic7", type: "xlr-female", label: "Stagebox Mic 7" },
```

## LIV-041 — src/live-sound-adapter.js:26

```text
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
    "stagebox.mic7": { panel: "stagebox", jack: "mic7", type: "xlr-female", label: "Stagebox Mic 7" },
    "stagebox.mic8": { panel: "stagebox", jack: "mic8", type: "xlr-female", label: "Stagebox Mic 8" },
```

## LIV-042 — src/live-sound-adapter.js:26

```text
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
    "stagebox.mic7": { panel: "stagebox", jack: "mic7", type: "xlr-female", label: "Stagebox Mic 7" },
    "stagebox.mic8": { panel: "stagebox", jack: "mic8", type: "xlr-female", label: "Stagebox Mic 8" },
```

## LIV-043 — src/live-sound-adapter.js:26

```text
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
    "stagebox.mic7": { panel: "stagebox", jack: "mic7", type: "xlr-female", label: "Stagebox Mic 7" },
    "stagebox.mic8": { panel: "stagebox", jack: "mic8", type: "xlr-female", label: "Stagebox Mic 8" },
```

## LIV-044 — src/live-sound-adapter.js:26

```text
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
    "stagebox.mic7": { panel: "stagebox", jack: "mic7", type: "xlr-female", label: "Stagebox Mic 7" },
    "stagebox.mic8": { panel: "stagebox", jack: "mic8", type: "xlr-female", label: "Stagebox Mic 8" },
```

## LIV-045 — src/live-sound-adapter.js:26

```text
    "LIV-001","LIV-002","LIV-003","LIV-004","LIV-005",
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
    "stagebox.mic7": { panel: "stagebox", jack: "mic7", type: "xlr-female", label: "Stagebox Mic 7" },
    "stagebox.mic8": { panel: "stagebox", jack: "mic8", type: "xlr-female", label: "Stagebox Mic 8" },
```

## LIV-046 — src/live-sound-adapter.js:27

```text
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
    "stagebox.mic7": { panel: "stagebox", jack: "mic7", type: "xlr-female", label: "Stagebox Mic 7" },
    "stagebox.mic8": { panel: "stagebox", jack: "mic8", type: "xlr-female", label: "Stagebox Mic 8" },
    "stagebox.linkOut": { panel: "stagebox", jack: "linkOut", type: "xlr-male", label: "Stagebox Link Out" },
```

## LIV-047 — src/live-sound-adapter.js:27

```text
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
    "stagebox.mic7": { panel: "stagebox", jack: "mic7", type: "xlr-female", label: "Stagebox Mic 7" },
    "stagebox.mic8": { panel: "stagebox", jack: "mic8", type: "xlr-female", label: "Stagebox Mic 8" },
    "stagebox.linkOut": { panel: "stagebox", jack: "linkOut", type: "xlr-male", label: "Stagebox Link Out" },
```

## LIV-048 — src/live-sound-adapter.js:27

```text
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
    "stagebox.mic7": { panel: "stagebox", jack: "mic7", type: "xlr-female", label: "Stagebox Mic 7" },
    "stagebox.mic8": { panel: "stagebox", jack: "mic8", type: "xlr-female", label: "Stagebox Mic 8" },
    "stagebox.linkOut": { panel: "stagebox", jack: "linkOut", type: "xlr-male", label: "Stagebox Link Out" },
```

## LIV-049 — src/live-sound-adapter.js:27

```text
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
    "stagebox.mic7": { panel: "stagebox", jack: "mic7", type: "xlr-female", label: "Stagebox Mic 7" },
    "stagebox.mic8": { panel: "stagebox", jack: "mic8", type: "xlr-female", label: "Stagebox Mic 8" },
    "stagebox.linkOut": { panel: "stagebox", jack: "linkOut", type: "xlr-male", label: "Stagebox Link Out" },
```

## LIV-050 — src/live-sound-adapter.js:27

```text
    "LIV-006","LIV-007","LIV-008","LIV-009","LIV-010",
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
    "stagebox.mic7": { panel: "stagebox", jack: "mic7", type: "xlr-female", label: "Stagebox Mic 7" },
    "stagebox.mic8": { panel: "stagebox", jack: "mic8", type: "xlr-female", label: "Stagebox Mic 8" },
    "stagebox.linkOut": { panel: "stagebox", jack: "linkOut", type: "xlr-male", label: "Stagebox Link Out" },
```

## LIV-113 — src/live-sound-adapter.js:28

```text
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
    "stagebox.mic7": { panel: "stagebox", jack: "mic7", type: "xlr-female", label: "Stagebox Mic 7" },
    "stagebox.mic8": { panel: "stagebox", jack: "mic8", type: "xlr-female", label: "Stagebox Mic 8" },
    "stagebox.linkOut": { panel: "stagebox", jack: "linkOut", type: "xlr-male", label: "Stagebox Link Out" },

```

## LIV-113 — src/live-sound-adapter.js:211

```text
    return /^LIV-\d+$/i.test(id) && !LIVE_IR_LEVEL_RE.test(id);
  }

  function scenarioForLevelId(levelId) {
    const id = normalizeLevelId(levelId);
    if (!isLiveNormalLevelId(id)) return null;
    const n = Number((id.match(/^LIV-(\d+)$/i) || [])[1]);
    if (!Number.isFinite(n)) {
      if (/^LIV-113$/i.test(id)) return "stagebox-foh";
      if (/^LIV-21[3-7]$/i.test(id)) return "final";
      return "final";
    }
    if (n >= 1 && n <= 13) return "stagebox-foh";
    if (n >= 14 && n <= 23) return "foh-monitor";
    if (n >= 24 && n <= 35) return "foh-amp";
    if (n >= 36 && n <= 45) return "utility";
    if (n >= 46 && n <= 50) return "final";
    return "stagebox-foh";
  }

  function normalizeId(raw) {
    return String(raw || "")
```

## LIV-213 — src/live-sound-adapter.js:28

```text
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
    "stagebox.mic7": { panel: "stagebox", jack: "mic7", type: "xlr-female", label: "Stagebox Mic 7" },
    "stagebox.mic8": { panel: "stagebox", jack: "mic8", type: "xlr-female", label: "Stagebox Mic 8" },
    "stagebox.linkOut": { panel: "stagebox", jack: "linkOut", type: "xlr-male", label: "Stagebox Link Out" },

```

## LIV-214 — src/live-sound-adapter.js:28

```text
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
    "stagebox.mic7": { panel: "stagebox", jack: "mic7", type: "xlr-female", label: "Stagebox Mic 7" },
    "stagebox.mic8": { panel: "stagebox", jack: "mic8", type: "xlr-female", label: "Stagebox Mic 8" },
    "stagebox.linkOut": { panel: "stagebox", jack: "linkOut", type: "xlr-male", label: "Stagebox Link Out" },

```

## LIV-215 — src/live-sound-adapter.js:28

```text
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
    "stagebox.mic7": { panel: "stagebox", jack: "mic7", type: "xlr-female", label: "Stagebox Mic 7" },
    "stagebox.mic8": { panel: "stagebox", jack: "mic8", type: "xlr-female", label: "Stagebox Mic 8" },
    "stagebox.linkOut": { panel: "stagebox", jack: "linkOut", type: "xlr-male", label: "Stagebox Link Out" },

```

## LIV-216 — src/live-sound-adapter.js:28

```text
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
    "stagebox.mic7": { panel: "stagebox", jack: "mic7", type: "xlr-female", label: "Stagebox Mic 7" },
    "stagebox.mic8": { panel: "stagebox", jack: "mic8", type: "xlr-female", label: "Stagebox Mic 8" },
    "stagebox.linkOut": { panel: "stagebox", jack: "linkOut", type: "xlr-male", label: "Stagebox Link Out" },

```

## LIV-217 — src/live-sound-adapter.js:28

```text
    "LIV-011","LIV-012","LIV-013","LIV-014","LIV-015",
    "LIV-016","LIV-017","LIV-018","LIV-019","LIV-020",
    "LIV-021","LIV-022","LIV-023","LIV-024","LIV-025",
    "LIV-026","LIV-027","LIV-028","LIV-029","LIV-030",
    "LIV-031","LIV-032","LIV-033","LIV-034","LIV-035",
    "LIV-036","LIV-037","LIV-038","LIV-039","LIV-040",
    "LIV-041","LIV-042","LIV-043","LIV-044","LIV-045",
    "LIV-046","LIV-047","LIV-048","LIV-049","LIV-050",
    "LIV-113","LIV-213","LIV-214","LIV-215","LIV-216","LIV-217"
  ];

  const CANONICAL_PANEL_JACKS = Object.freeze({
    "stagebox.mic1": { panel: "stagebox", jack: "mic1", type: "xlr-female", label: "Stagebox Mic 1" },
    "stagebox.mic2": { panel: "stagebox", jack: "mic2", type: "xlr-female", label: "Stagebox Mic 2" },
    "stagebox.mic3": { panel: "stagebox", jack: "mic3", type: "xlr-female", label: "Stagebox Mic 3" },
    "stagebox.mic4": { panel: "stagebox", jack: "mic4", type: "xlr-female", label: "Stagebox Mic 4" },
    "stagebox.mic5": { panel: "stagebox", jack: "mic5", type: "xlr-female", label: "Stagebox Mic 5" },
    "stagebox.mic6": { panel: "stagebox", jack: "mic6", type: "xlr-female", label: "Stagebox Mic 6" },
    "stagebox.mic7": { panel: "stagebox", jack: "mic7", type: "xlr-female", label: "Stagebox Mic 7" },
    "stagebox.mic8": { panel: "stagebox", jack: "mic8", type: "xlr-female", label: "Stagebox Mic 8" },
    "stagebox.linkOut": { panel: "stagebox", jack: "linkOut", type: "xlr-male", label: "Stagebox Link Out" },

```

## LIV-025 — src/live-sound-liv025-bridge.js:2

```text
/*
 * Signal Flow - Live Sound LIV-025 Bridge v5
 *
 * Fixes from v5:
 * - Visual cables draw above hardware panels and above jack badges.
 * - Browser-native title tooltips and visible jack badges removed from visual jacks.
 * - Unused visible panel jacks are clickable and participate in invalid-pair feedback.
 * - Valid LIV-025 pairs draw blue cables; invalid pairs draw a temporary red cable then disappear.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-liv025-bridge.js"></script>
 */
(function () {
  "use strict";
```

## LIV-025 — src/live-sound-liv025-bridge.js:8

```text
/*
 * Signal Flow - Live Sound LIV-025 Bridge v5
 *
 * Fixes from v5:
 * - Visual cables draw above hardware panels and above jack badges.
 * - Browser-native title tooltips and visible jack badges removed from visual jacks.
 * - Unused visible panel jacks are clickable and participate in invalid-pair feedback.
 * - Valid LIV-025 pairs draw blue cables; invalid pairs draw a temporary red cable then disappear.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-liv025-bridge.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";
  let selectedVisualNode = null;
  const completedVisualRoutes = new Set();

  const VALID_ROUTES = [
```

## LIV-025 — src/live-sound-liv025-bridge.js:17

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-liv025-bridge.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";
  let selectedVisualNode = null;
  const completedVisualRoutes = new Set();

  const VALID_ROUTES = [
    { key: "lead-vocal-to-stagebox-1", a: "lead-vocal-mic", b: "stagebox-input-1" },
    { key: "keys-left-to-stagebox-7", a: "keys-left-di", b: "stagebox-input-7" },
    { key: "keys-right-to-stagebox-8", a: "keys-right-di", b: "stagebox-input-8" },
    { key: "main-left-to-system-left", a: "main-left-output", b: "system-processor-left-in" },
    { key: "main-right-to-system-right", a: "main-right-output", b: "system-processor-right-in" },
    { key: "matrix-2-to-sub", a: "matrix-2-output", b: "sub-processor-input" }
  ];

  function validRouteKey(a, b) {
```

## LIV-025 — src/live-sound-liv025-bridge.js:615

```text
    createLabel(layer, "SYSTEM PROCESSOR / SUB", rect.width * 0.46, rect.height * 0.58, 11);
    createJackButton(layer, "system-processor-left-in", "System Processor Left In", ["System Processor Left In", "System Processor L In", "Processor Left In", "Left In"], pointFromPanel(adapter, level, "amp.inputA"), "L");
    createJackButton(layer, "system-processor-right-in", "System Processor Right In", ["System Processor Right In", "System Processor R In", "Processor Right In", "Right In"], pointFromPanel(adapter, level, "amp.inputB"), "R");
    createJackButton(layer, "sub-processor-input", "Sub Processor Input", ["Sub Processor Input", "Sub Processor In", "Sub Input", "Sub"], pointFromPanel(adapter, level, "amp.link"), "SUB");

    addGhostPanelJacks(layer, adapter, level, usedKeys);

    surface.appendChild(layer);
    console.log("[Signal Flow] LIV-025 Sub Matrix Feed renderer v5 mounted.");
  }

  function renderIntegratedLiveSound() {
    const adapter = window.SF_LIVE_SOUND_ADAPTER;

    if (!adapter) {
      console.warn("[Signal Flow] Live Sound adapter missing.");
      return;
    }

    const levelId = getLevelId();

    if (levelId !== LEVEL_ID) {
```

## LIV-025 — src/live-sound-liv025-bridge.js:629

```text
    if (!adapter) {
      console.warn("[Signal Flow] Live Sound adapter missing.");
      return;
    }

    const levelId = getLevelId();

    if (levelId !== LEVEL_ID) {
      console.log("[Signal Flow] Integrated bridge currently tuned for LIV-025 only:", levelId);
      return;
    }

    const surface = findLiveWorldSurface();

    if (!surface) {
      console.warn("[Signal Flow] Could not find Live Console + Rack World surface.");
      return;
    }

    if (getComputedStyle(surface).position === "static") {
      surface.style.position = "relative";
    }
```

## LIV-025 — src/live-sound-native-renderer.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  let LEVEL_ID = "LIV-025";
  let activeNativeLevelId = null;
  let nativeLevelCompleteShown = false;

  const LIV_028_LAYOUT = {
    sources: {
      x: 0.145,
      firstY: 0.155,
      gap: 44,
      width: 154,
      height: 38
    },
    stagebox: {
      x: 0.060,
```

## LIV-025 — src/live-sound-native-renderer.js:104

```text
        from: "keys-right-di",
        to: "stagebox-input-8",
        checklist: "Keys Right DI → Stage Box Input 8"
      }
    ]
  };

  const LIVE_NATIVE_PATCH_SPECS = {
    "LIV-025": {
      id: "LIV-025",
      title: "Sub Matrix Feed",
      processorLabel: "CROSSOVER",
      validRoutes: [
        {
          key: "aux-2-to-sub",
          from: "matrix-2-output",
          to: "sub-processor-input",
          checklist: "Aux 2 Output → Sub Input"
        },
        {
          key: "main-left-to-system-left",
          from: "main-left-output",
```

## LIV-025 — src/live-sound-native-renderer.js:105

```text
        to: "stagebox-input-8",
        checklist: "Keys Right DI → Stage Box Input 8"
      }
    ]
  };

  const LIVE_NATIVE_PATCH_SPECS = {
    "LIV-025": {
      id: "LIV-025",
      title: "Sub Matrix Feed",
      processorLabel: "CROSSOVER",
      validRoutes: [
        {
          key: "aux-2-to-sub",
          from: "matrix-2-output",
          to: "sub-processor-input",
          checklist: "Aux 2 Output → Sub Input"
        },
        {
          key: "main-left-to-system-left",
          from: "main-left-output",
          to: "system-processor-left-in",
```

## LIV-025 — src/live-sound-native-renderer.js:686

```text
  }

  function defaultCableBend(routeKey, index) {
    const lanes = [-54, -36, -20, 18, 34, 52, 68];
    return lanes[(cableHash(routeKey) + index) % lanes.length];
  }

  function cableD(from, to, bend) {
    // LIV-025 natural cable feel:
    // - cables sag downward with gravity
    // - each route gets a slightly different lane/bow
    // - near-vertical runs bow sideways instead of stacking on top of each other
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const span = Math.max(1, Math.hypot(dx, dy));
    const lane = Number.isFinite(bend) ? bend : 0;

    const sag = Math.max(38, Math.min(190, span * 0.20 + Math.abs(dy) * 0.10));
    const verticalish = Math.abs(dy) > Math.abs(dx) * 1.35;

    let c1;
    let c2;
```

## LIV-025 — src/live-sound-native-renderer.js:791

```text
      { x: from.x, y: midY },
      { x: to.x, y: midY },
      to,
      0.5
    );
  }

  function createCableDragHandle(layer, route) {
    // Disabled: LIV-025 now uses drag-from-endpoint-to-endpoint patching,
    // not midpoint cable-bend handles.
    return;
    const point = cablePointAtMid(route.fromPoint, route.toPoint, route.bend || 0);

    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = "sf-cable-drag-handle";
    handle.setAttribute("aria-label", "Drag cable");
    handle.dataset.routeKey = route.key;

    handle.style.cssText = [
      "position:absolute",
      "left:" + point.x + "px",
```

## LIV-025 — src/live-sound-native-renderer.js:1198

```text
  }

  function resetNativeLevelComplete() {
    nativeLevelCompleteShown = false;
    closeNativeCompletionPopup();
  }

  function nextNativeLevelId() {
    const sequence = ["LIV-025", "LIV-026", "LIV-027", "LIV-028", "LIV-029"];
    const index = sequence.indexOf(LEVEL_ID);
    return index >= 0 ? sequence[index + 1] || null : null;
  }

  function goToNativeLevel(levelId) {
    if (!levelId) {
      closeNativeCompletionPopup();
      return;
    }

    closeNativeCompletionPopup();
    resetNativeLevelComplete();

```

## LIV-025 — src/live-sound-native-renderer.js:2354

```text
    }

    function plaque(text, x, y, w) {
      createNativeOverlayLabel(layer, text, x, y, { width: w || 80, size: 7, color: "#f4f1dc" });
    }

    if (LEVEL_ID !== "LIV-028") createNativePrewireIcons(layer, adapter, level);

    if (LEVEL_ID === "LIV-025") {
      const aux = pointFromPanel(adapter, level, "foh.lineOut2");
      const sub = pointFromPanel(adapter, level, "amp.link");

      // Only relabel the section. Do not cover the jack numbers.
      mask(aux.x + 4, aux.y - 48, 112, 16);
      plaque("AUX OUTS", aux.x + 4, aux.y - 48, 92);

      mask(sub.x, sub.y - 29, 86, 16);
      plaque("SUB INPUT", sub.x, sub.y - 29, 78);
    }

    if (LEVEL_ID === "LIV-026") {
      const aux = pointFromPanel(adapter, level, "foh.lineOut3");
```

## LIV-025 — src/live-sound-native-renderer.js:2474

```text
    surface.appendChild(layer);
    createNativeBoardTerminologyOverlays(layer, adapter, level);
    createLiv028TalkbackUnderSources(layer, adapter, level);
    redrawCables(layer);
    installCableDrag(layer);
  }

  function raiseHintOverlays() {
    // Native LIV-025 layer sits high in the board. Keep hint UI visible above it.
    Array.from(document.querySelectorAll("div, section, article, aside, dialog"))
      .forEach(el => {
        if (!el || !el.isConnected) return;
        if (el.closest(".sf-live-native-layer")) return;

        const text = normalize(textOf(el));
        const cls = String(el.className || "").toLowerCase();

        const looksLikeHint =
          cls.includes("hint") ||
          text.includes("hint") ||
          text.includes("show hints") ||
          text.includes("hide hints");
```

## LIV-025 — src/live-sound-native-renderer.js:2502

```text
        if (r.width > window.innerWidth * 0.95 && r.height > window.innerHeight * 0.75) return;

        el.style.position = getComputedStyle(el).position === "static" ? "relative" : el.style.position;
        el.style.zIndex = "12000";
      });
  }

  function hidePanelToggleControls() {
    // LIV-025 native recovery: front/back equipment images are not ready yet.
    // Hide the panel toggle for now so players stay on the stable native board.
    Array.from(document.querySelectorAll("button, [role='button']")).forEach(button => {
      const label = normalize([
        textOf(button),
        button.getAttribute && button.getAttribute("aria-label"),
        button.getAttribute && button.getAttribute("title")
      ].filter(Boolean).join(" "));

      if (
        label.includes("inspect") ||
        label.includes("back panel") ||
        label.includes("front panel") ||
        label === "front" ||
```

## LIV-026 — src/live-sound-native-renderer.js:147

```text
        {
          key: "keys-right-to-stagebox-8",
          from: "keys-right-di",
          to: "stagebox-input-8",
          checklist: "Keys Right DI → Stage Box Input 8"
        }
      ]
    },
    "LIV-026": {
      id: "LIV-026",
      title: "Delay Tower Route",
      processorLabel: "DELAY TOWER PROCESSING",
      validRoutes: [
        {
          key: "aux-3-to-delay-processing",
          from: "aux-3-output",
          to: "delay-tower-processing-input",
          checklist: "Aux 3 Output → Delay"
        },
        {
          key: "main-left-to-system-left",
          from: "main-left-output",
```

## LIV-026 — src/live-sound-native-renderer.js:148

```text
          key: "keys-right-to-stagebox-8",
          from: "keys-right-di",
          to: "stagebox-input-8",
          checklist: "Keys Right DI → Stage Box Input 8"
        }
      ]
    },
    "LIV-026": {
      id: "LIV-026",
      title: "Delay Tower Route",
      processorLabel: "DELAY TOWER PROCESSING",
      validRoutes: [
        {
          key: "aux-3-to-delay-processing",
          from: "aux-3-output",
          to: "delay-tower-processing-input",
          checklist: "Aux 3 Output → Delay"
        },
        {
          key: "main-left-to-system-left",
          from: "main-left-output",
          to: "system-processor-left-in",
```

## LIV-026 — src/live-sound-native-renderer.js:1198

```text
  }

  function resetNativeLevelComplete() {
    nativeLevelCompleteShown = false;
    closeNativeCompletionPopup();
  }

  function nextNativeLevelId() {
    const sequence = ["LIV-025", "LIV-026", "LIV-027", "LIV-028", "LIV-029"];
    const index = sequence.indexOf(LEVEL_ID);
    return index >= 0 ? sequence[index + 1] || null : null;
  }

  function goToNativeLevel(levelId) {
    if (!levelId) {
      closeNativeCompletionPopup();
      return;
    }

    closeNativeCompletionPopup();
    resetNativeLevelComplete();

```

## LIV-026 — src/live-sound-native-renderer.js:2366

```text
      // Only relabel the section. Do not cover the jack numbers.
      mask(aux.x + 4, aux.y - 48, 112, 16);
      plaque("AUX OUTS", aux.x + 4, aux.y - 48, 92);

      mask(sub.x, sub.y - 29, 86, 16);
      plaque("SUB INPUT", sub.x, sub.y - 29, 78);
    }

    if (LEVEL_ID === "LIV-026") {
      const aux = pointFromPanel(adapter, level, "foh.lineOut3");
      const delay = pointFromPanel(adapter, level, "amp.link");

      // Only relabel the section. Do not cover the jack numbers.
      mask(aux.x + 2, aux.y - 48, 112, 16);
      plaque("AUX OUTS", aux.x + 2, aux.y - 48, 92);

      mask(delay.x, delay.y - 35, 86, 16);
      createNativeAssetLabel(layer, "/assets/live-sound/svg/cable-wrap/delay-cable-wrap-label.svg", delay.x, delay.y - 35, { width: 76, height: 24 });
    }

    if (LEVEL_ID === "LIV-028") {
      createNativeStagebox16Overlay(layer, level);
```

## LIV-027 — src/live-sound-native-renderer.js:1198

```text
  }

  function resetNativeLevelComplete() {
    nativeLevelCompleteShown = false;
    closeNativeCompletionPopup();
  }

  function nextNativeLevelId() {
    const sequence = ["LIV-025", "LIV-026", "LIV-027", "LIV-028", "LIV-029"];
    const index = sequence.indexOf(LEVEL_ID);
    return index >= 0 ? sequence[index + 1] || null : null;
  }

  function goToNativeLevel(levelId) {
    if (!levelId) {
      closeNativeCompletionPopup();
      return;
    }

    closeNativeCompletionPopup();
    resetNativeLevelComplete();

```

## LIV-028 — src/live-sound-native-renderer.js:190

```text
        {
          key: "keys-right-to-stagebox-8",
          from: "keys-right-di",
          to: "stagebox-input-8",
          checklist: "Keys Right DI → Stage Box Input 8"
        }
      ]
    },
    "LIV-028": {
      id: "LIV-028",
      title: "Talkback to Monitor System",
      processorLabel: "IN-EAR MONITORING",
      validRoutes: [
        {
          key: "talkback-mic-to-stagebox-14",
          from: "talkback-mic",
          to: "stagebox-input-14",
          checklist: "Talkback Mic → Stage Box Input 14"
        },
        {
          key: "talkback-output-to-in-ear-b",
          from: "talkback-output",
```

## LIV-028 — src/live-sound-native-renderer.js:191

```text
          key: "keys-right-to-stagebox-8",
          from: "keys-right-di",
          to: "stagebox-input-8",
          checklist: "Keys Right DI → Stage Box Input 8"
        }
      ]
    },
    "LIV-028": {
      id: "LIV-028",
      title: "Talkback to Monitor System",
      processorLabel: "IN-EAR MONITORING",
      validRoutes: [
        {
          key: "talkback-mic-to-stagebox-14",
          from: "talkback-mic",
          to: "stagebox-input-14",
          checklist: "Talkback Mic → Stage Box Input 14"
        },
        {
          key: "talkback-output-to-in-ear-b",
          from: "talkback-output",
          to: "in-ear-b-in",
```

## LIV-028 — src/live-sound-native-renderer.js:454

```text
    const stage = level.panels && level.panels.find && level.panels.find(p => p.id === "stagebox");
    const foh = level.panels && level.panels.find && level.panels.find(p => p.id === "foh");
    const amp = level.panels && level.panels.find && level.panels.find(p => p.id === "amp");

    const stageMatch = /^stagebox\.input(\d+)$/.exec(panelJackId || "");
    if (stage && stageMatch) {
      const n = Number(stageMatch[1]);

      if (LEVEL_ID === "LIV-028" && n >= 1 && n <= 16) {
        const svgXs = [92, 168, 244, 320, 396, 472, 548, 624];
        const col = (n - 1) % 8;
        const row = n > 8 ? 1 : 0;
        const assetHeight = stage.width * 360 / 980;

        return {
          x: stage.x + stage.width * (svgXs[col] / 980),
          y: stage.y + assetHeight * ((row ? 250 : 125) / 360)
        };
      }

      if (n >= 1 && n <= 16) {
        const col = (n - 1) % 8;
```

## LIV-028 — src/live-sound-native-renderer.js:508

```text
      };
    }

    return null;
  }

  function pointFromPanel(adapter, level, panelJackId) {
    if (
      LEVEL_ID === "LIV-028" &&
      (
        /^stagebox\.input([1-9]|1[0-6])$/.test(panelJackId || "") ||
        panelJackId === "amp.inputB"
      )
    ) {
      const fallback = fallbackNativePanelPoint(level, panelJackId);
      if (fallback) return fallback;
    }

    try {
      const pt = adapter.endpointPanelPoint(level, panelJackId, {
        levelId: LEVEL_ID,
        scenario: "native-liv025"
```

## LIV-028 — src/live-sound-native-renderer.js:549

```text
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.top + layoutHeight,
      width: rect.width,
      height: layoutHeight
    };

    const isTalkbackBoard = LEVEL_ID === "LIV-028";
    const liv = isTalkbackBoard ? LIV_028_LAYOUT : null;

    return {
      id: LEVEL_ID,
      rect: layoutRect,
      panels: [
        {
          id: "stagebox",
          kind: "stagebox",
          x: rect.width * (liv ? liv.stagebox.x : 0.06),
          y: layoutHeight * (liv ? liv.stagebox.y : 0.34),
          width: rect.width * (liv ? liv.stagebox.width : 0.39)
        },
```

## LIV-028 — src/live-sound-native-renderer.js:584

```text
        }
      ]
    };
  }



  function getNodePoint(adapter, level, key) {
    if (LEVEL_ID === "LIV-028") {
      const sourceIndex = {
        "lead-vocal-mic": 0,
        "keys-left-di": 1,
        "keys-right-di": 2,
        "talkback-mic": 3
      };

      if (Object.prototype.hasOwnProperty.call(sourceIndex, key)) {
        return {
          x: level.rect.width * LIV_028_LAYOUT.sources.x,
          y: level.rect.height * LIV_028_LAYOUT.sources.firstY + sourceIndex[key] * LIV_028_LAYOUT.sources.gap
        };
      }
```

## LIV-028 — src/live-sound-native-renderer.js:1198

```text
  }

  function resetNativeLevelComplete() {
    nativeLevelCompleteShown = false;
    closeNativeCompletionPopup();
  }

  function nextNativeLevelId() {
    const sequence = ["LIV-025", "LIV-026", "LIV-027", "LIV-028", "LIV-029"];
    const index = sequence.indexOf(LEVEL_ID);
    return index >= 0 ? sequence[index + 1] || null : null;
  }

  function goToNativeLevel(levelId) {
    if (!levelId) {
      closeNativeCompletionPopup();
      return;
    }

    closeNativeCompletionPopup();
    resetNativeLevelComplete();

```

## LIV-028 — src/live-sound-native-renderer.js:1968

```text
      "z-index:" + (opts.zIndex || 1000)
    ].join(";");

    layer.appendChild(img);
    return img;
  }

  function installLiv028LayerStackCss(targetLayer) {
    if (LEVEL_ID !== "LIV-028") return;

    const doc = targetLayer && targetLayer.ownerDocument ? targetLayer.ownerDocument : document;
    if (!doc || !doc.head) return;

    let style = doc.getElementById("sf-liv028-layer-stack-style");
    if (!style) {
      style = doc.createElement("style");
      style.id = "sf-liv028-layer-stack-style";
      doc.head.appendChild(style);
    }

    style.textContent = [
      ".sf-live-native-layer img { z-index: 700 !important; pointer-events: none !important; }",
```

## LIV-028 — src/live-sound-native-renderer.js:1991

```text
      ".sf-live-native-layer svg, .sf-live-native-layer svg.sf-native-cables { position: absolute !important; z-index: 3500 !important; pointer-events: none !important; overflow: visible !important; }",
      ".sf-live-native-layer .sf-native-node.sf-native-jack { z-index: 4600 !important; pointer-events: auto !important; }",
      ".sf-live-native-layer .sf-native-node.sf-native-source { z-index: 5000 !important; pointer-events: auto !important; }",
      ".sf-live-native-layer .sf-native-liv028-talkback-source { z-index: 6000 !important; pointer-events: auto !important; }"
    ].join("\n");
  }

  function syncLiv028JackHitboxesToVisibleHardware(layer) {
    if (LEVEL_ID !== "LIV-028") return;

    const targetLayer = layer || document.querySelector(".sf-live-native-layer");
    if (!targetLayer) return;

    const layerRect = targetLayer.getBoundingClientRect();
    installLiv028LayerStackCss(targetLayer);
    const debug = true;

    const stageAsset = targetLayer.querySelector(".sf-native-liv028-stagebox-asset") ||
      Array.from(targetLayer.querySelectorAll("img")).find(img =>
        String(img.getAttribute("src") || "").includes("stagebox-snake-head-16x2")
      );

```

## LIV-028 — src/live-sound-native-renderer.js:2108

```text
      fohCount += styleHitbox(
        "talkback-output",
        ox + r.width * 0.765,
        oy + r.height * 0.575,
        34
      );
    }

    console.log("[Signal Flow] LIV-028 real hitboxes synced from Talkback helper", {
      stageAsset: !!stageAsset,
      iemAsset: !!iemAsset,
      fohAsset: !!fohAsset,
      stageboxCount,
      iemCount,
      fohCount
    });
  }

  function forceLiv028TalkbackSourceFinal(layer, level) {
    if (LEVEL_ID !== "LIV-028") return;

    const targetLayer = layer || document.querySelector(".sf-live-native-layer");
```

## LIV-028 — src/live-sound-native-renderer.js:2119

```text
      fohAsset: !!fohAsset,
      stageboxCount,
      iemCount,
      fohCount
    });
  }

  function forceLiv028TalkbackSourceFinal(layer, level) {
    if (LEVEL_ID !== "LIV-028") return;

    const targetLayer = layer || document.querySelector(".sf-live-native-layer");
    if (!targetLayer) {
      console.log("[Signal Flow] LIV-028 talkback final helper: no layer");
      return;
    }

    const layerRect = targetLayer.getBoundingClientRect();

    const candidates = Array.from(targetLayer.querySelectorAll("button, div, [role='button']")).filter(el => {
      const txt = (el.textContent || "").trim().toLowerCase();
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
```

## LIV-028 — src/live-sound-native-renderer.js:2123

```text
    });
  }

  function forceLiv028TalkbackSourceFinal(layer, level) {
    if (LEVEL_ID !== "LIV-028") return;

    const targetLayer = layer || document.querySelector(".sf-live-native-layer");
    if (!targetLayer) {
      console.log("[Signal Flow] LIV-028 talkback final helper: no layer");
      return;
    }

    const layerRect = targetLayer.getBoundingClientRect();

    const candidates = Array.from(targetLayer.querySelectorAll("button, div, [role='button']")).filter(el => {
      const txt = (el.textContent || "").trim().toLowerCase();
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);

      return (
        txt.includes("keys right di") &&
        r.width > 70 &&
```

## LIV-028 — src/live-sound-native-renderer.js:2203

```text
      event.preventDefault();
      event.stopPropagation();
      handleNodeClick("talkback-mic");
    });

    targetLayer.appendChild(talkback);
    syncLiv028JackHitboxesToVisibleHardware(targetLayer);

    console.log("[Signal Flow] LIV-028 talkback final helper ran", {
      candidates: candidates.length,
      sourceX,
      sourceY
    });
  }








```

## LIV-028 — src/live-sound-native-renderer.js:2219

```text







  function createLiv028TalkbackUnderSources(layer, adapter, level) {
    if (LEVEL_ID !== "LIV-028") return;

    const layout = LIV_028_LAYOUT.sources;
    const sourceX = level.rect.width * layout.x;
    const firstY = level.rect.height * layout.firstY;

    const sourceLayout = [
      { key: "lead-vocal-mic", y: firstY },
      { key: "keys-left-di", y: firstY + layout.gap },
      { key: "keys-right-di", y: firstY + layout.gap * 2 },
      { key: "talkback-mic", y: firstY + layout.gap * 3 }
    ];

    Array.from(layer.querySelectorAll("[data-node-key='talkback-mic']")).forEach(el => {
```

## LIV-028 — src/live-sound-native-renderer.js:2289

```text







  function createNativeStagebox16Overlay(layer, level) {
    if (LEVEL_ID !== "LIV-028") return;

    const stage = level.panels && level.panels.find && level.panels.find(p => p.id === "stagebox");
    if (!stage) return;

    for (let n = 1; n <= 16; n++) {
      Array.from(layer.querySelectorAll("[data-node-key='stagebox-input-" + n + "']")).forEach(el => {
        el.style.opacity = "0.01";
        el.style.pointerEvents = "auto";
        el.style.zIndex = "780";
      });
    }

    const old = layer.querySelector(".sf-native-liv028-stagebox-asset");
```

## LIV-028 — src/live-sound-native-renderer.js:2352

```text
      ].join(";");
      layer.appendChild(el);
    }

    function plaque(text, x, y, w) {
      createNativeOverlayLabel(layer, text, x, y, { width: w || 80, size: 7, color: "#f4f1dc" });
    }

    if (LEVEL_ID !== "LIV-028") createNativePrewireIcons(layer, adapter, level);

    if (LEVEL_ID === "LIV-025") {
      const aux = pointFromPanel(adapter, level, "foh.lineOut2");
      const sub = pointFromPanel(adapter, level, "amp.link");

      // Only relabel the section. Do not cover the jack numbers.
      mask(aux.x + 4, aux.y - 48, 112, 16);
      plaque("AUX OUTS", aux.x + 4, aux.y - 48, 92);

      mask(sub.x, sub.y - 29, 86, 16);
      plaque("SUB INPUT", sub.x, sub.y - 29, 78);
    }

```

## LIV-028 — src/live-sound-native-renderer.js:2378

```text
      // Only relabel the section. Do not cover the jack numbers.
      mask(aux.x + 2, aux.y - 48, 112, 16);
      plaque("AUX OUTS", aux.x + 2, aux.y - 48, 92);

      mask(delay.x, delay.y - 35, 86, 16);
      createNativeAssetLabel(layer, "/assets/live-sound/svg/cable-wrap/delay-cable-wrap-label.svg", delay.x, delay.y - 35, { width: 76, height: 24 });
    }

    if (LEVEL_ID === "LIV-028") {
      createNativeStagebox16Overlay(layer, level);

      const talkbackOut = pointFromPanel(adapter, level, "foh.lineOut4");

      createNativeAssetLabel(
        layer,
        "/assets/live-sound/svg/cable-wrap/tb-cable-wrap-label.svg",
        talkbackOut.x,
        talkbackOut.y + 28,
        { width: 64, height: 20, rotate: "-2deg", opacity: ".96" }
      );
    }
  }
```

## LIV-028 — src/live-sound-native-renderer.js:2413

```text
      "pointer-events:none",
      "overflow:hidden",
      "border-radius:16px",
      "background:radial-gradient(circle at top, rgba(18,36,28,.32), rgba(0,0,0,0) 62%)"
    ].join(";");

    createLabel(layer, (LEVEL.title || "Live Patch").toUpperCase() + " - NATIVE CONCEPT MODE", 18, 14, 12);
    createLabel(layer, "SOURCES", level.rect.width * 0.06, level.rect.height * 0.08, 12);
    createLabel(layer, "STAGE BOX INPUTS", level.rect.width * 0.07, (LEVEL_ID === "LIV-028" ? level.rect.height * 0.31 + 86 : level.rect.height * 0.31), 11);
    createLabel(layer, "FOH CONSOLE", level.rect.width * 0.40, level.rect.height * 0.10, 11);
    createLabel(layer, LEVEL.processorLabel || "SYSTEM PROCESSOR / SUB", (LEVEL_ID === "LIV-028" ? level.rect.width * 0.51 : level.rect.width * 0.46), (LEVEL_ID === "LIV-028" ? level.rect.height * 0.55 : level.rect.height * 0.47), 11);

    level.panels.forEach(panel => {
      const img = document.createElement("img");
      img.src = hardwareAssetFor(panel.kind);
      img.alt = panel.kind;
      img.style.cssText = [
        "position:absolute",
        "left:" + panel.x + "px",
        "top:" + panel.y + "px",
        "width:" + panel.width + "px",
        "height:auto",
```

## LIV-028 — src/live-sound-native-renderer.js:2415

```text
      "border-radius:16px",
      "background:radial-gradient(circle at top, rgba(18,36,28,.32), rgba(0,0,0,0) 62%)"
    ].join(";");

    createLabel(layer, (LEVEL.title || "Live Patch").toUpperCase() + " - NATIVE CONCEPT MODE", 18, 14, 12);
    createLabel(layer, "SOURCES", level.rect.width * 0.06, level.rect.height * 0.08, 12);
    createLabel(layer, "STAGE BOX INPUTS", level.rect.width * 0.07, (LEVEL_ID === "LIV-028" ? level.rect.height * 0.31 + 86 : level.rect.height * 0.31), 11);
    createLabel(layer, "FOH CONSOLE", level.rect.width * 0.40, level.rect.height * 0.10, 11);
    createLabel(layer, LEVEL.processorLabel || "SYSTEM PROCESSOR / SUB", (LEVEL_ID === "LIV-028" ? level.rect.width * 0.51 : level.rect.width * 0.46), (LEVEL_ID === "LIV-028" ? level.rect.height * 0.55 : level.rect.height * 0.47), 11);

    level.panels.forEach(panel => {
      const img = document.createElement("img");
      img.src = hardwareAssetFor(panel.kind);
      img.alt = panel.kind;
      img.style.cssText = [
        "position:absolute",
        "left:" + panel.x + "px",
        "top:" + panel.y + "px",
        "width:" + panel.width + "px",
        "height:auto",
        "pointer-events:none",
        "user-select:none",
```

## LIV-029 — src/live-sound-native-renderer.js:1198

```text
  }

  function resetNativeLevelComplete() {
    nativeLevelCompleteShown = false;
    closeNativeCompletionPopup();
  }

  function nextNativeLevelId() {
    const sequence = ["LIV-025", "LIV-026", "LIV-027", "LIV-028", "LIV-029"];
    const index = sequence.indexOf(LEVEL_ID);
    return index >= 0 ? sequence[index + 1] || null : null;
  }

  function goToNativeLevel(levelId) {
    if (!levelId) {
      closeNativeCompletionPopup();
      return;
    }

    closeNativeCompletionPopup();
    resetNativeLevelComplete();

```

## LIV-025 — src/live-sound-native-renderer.v6-before-badge-checklist-fix.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6-before-badge-checklist-fix.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let nativeVisible = true;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

  const LEVEL = {
    id: LEVEL_ID,
    title: "Sub Matrix Feed",
```

## LIV-025 — src/live-sound-native-renderer.v6-before-badge-checklist-fix.js:891

```text

    if (getComputedStyle(surface).position === "static") {
      surface.style.position = "relative";
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

## LIV-025 — src/live-sound-native-renderer.v6-before-checklist-frame-lowfilter-fix.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6-before-checklist-frame-lowfilter-fix.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let nativeVisible = true;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

  const LEVEL = {
    id: LEVEL_ID,
    title: "Sub Matrix Feed",
```

## LIV-025 — src/live-sound-native-renderer.v6-before-checklist-frame-lowfilter-fix.js:919

```text

    if (getComputedStyle(surface).position === "static") {
      surface.style.position = "relative";
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

## LIV-025 — src/live-sound-native-renderer.v6-before-disable-checklist-style.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6-before-disable-checklist-style.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let nativeVisible = true;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

  const LEVEL = {
    id: LEVEL_ID,
    title: "Sub Matrix Feed",
```

## LIV-025 — src/live-sound-native-renderer.v6-before-disable-checklist-style.js:866

```text

    if (getComputedStyle(surface).position === "static") {
      surface.style.position = "relative";
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

## LIV-025 — src/live-sound-native-renderer.v6-before-frame-aware-checklist-fix.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6-before-frame-aware-checklist-fix.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let nativeVisible = true;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

  const LEVEL = {
    id: LEVEL_ID,
    title: "Sub Matrix Feed",
```

## LIV-025 — src/live-sound-native-renderer.v6-before-frame-aware-checklist-fix.js:561

```text
      setTimeout(() => ctx.close && ctx.close(), 240);
    } catch (err) {}
  }

  function findChecklistTarget(routeKey) {
    const routeIndex = LEVEL.validRoutes.findIndex(r => r.key === routeKey);
    if (routeIndex < 0) return null;

    // LIV-025 checklist rows are real DOM cards:
    //   div.path-card.playful-card
    //   em.todo-badge
    // Earlier filters were too narrow and missed these because the card width
    // is large in the embedded game frame.
    const rows = Array.from(document.querySelectorAll(".path-card"))
      .filter(row => {
        if (!row || !row.isConnected) return false;
        if (row.closest(".sf-live-native-layer")) return false;

        const text = normalize(textOf(row));
        const r = row.getBoundingClientRect();

        return (
```

## LIV-025 — src/live-sound-native-renderer.v6-before-frame-aware-checklist-fix.js:890

```text

    if (getComputedStyle(surface).position === "static") {
      surface.style.position = "relative";
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

## LIV-025 — src/live-sound-native-renderer.v6-before-front-panel-fix.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6-before-front-panel-fix.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let nativeVisible = true;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

  const LEVEL = {
    id: LEVEL_ID,
    title: "Sub Matrix Feed",
```

## LIV-025 — src/live-sound-native-renderer.v6-before-front-panel-fix.js:866

```text

    if (getComputedStyle(surface).position === "static") {
      surface.style.position = "relative";
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

## LIV-025 — src/live-sound-native-renderer.v6-before-index-checklist-fix.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6-before-index-checklist-fix.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let nativeVisible = true;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

  const LEVEL = {
    id: LEVEL_ID,
    title: "Sub Matrix Feed",
```

## LIV-025 — src/live-sound-native-renderer.v6-before-index-checklist-fix.js:884

```text

    if (getComputedStyle(surface).position === "static") {
      surface.style.position = "relative";
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

## LIV-025 — src/live-sound-native-renderer.v6-before-path-card-checklist-fix.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6-before-path-card-checklist-fix.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let nativeVisible = true;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

  const LEVEL = {
    id: LEVEL_ID,
    title: "Sub Matrix Feed",
```

## LIV-025 — src/live-sound-native-renderer.v6-before-path-card-checklist-fix.js:907

```text

    if (getComputedStyle(surface).position === "static") {
      surface.style.position = "relative";
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

## LIV-025 — src/live-sound-native-renderer.v6-before-safe-checklist-fix.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6-before-safe-checklist-fix.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let nativeVisible = true;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

  const LEVEL = {
    id: LEVEL_ID,
    title: "Sub Matrix Feed",
```

## LIV-025 — src/live-sound-native-renderer.v6-before-safe-checklist-fix.js:558

```text
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.17);
      setTimeout(() => ctx.close && ctx.close(), 240);
    } catch (err) {}
  }

  function markChecklist(routeKey) {
    // Temporarily disabled for LIV-025 v6 lifecycle recovery.
    // The broad checklist DOM scan can select/stylize a parent sidebar container,
    // causing the left task column to disappear after the first valid route.
    console.log("[Signal Flow] Checklist mark skipped for native recovery:", routeKey);
  }

  function unmarkChecklist(routeKey) {
    // Temporarily disabled with markChecklist during native recovery.
    console.log("[Signal Flow] Checklist unmark skipped for native recovery:", routeKey);
  }

  function setSelected(node, selected) {
    node.el.style.boxShadow = selected
      ? "0 0 0 3px rgba(111,208,255,.95), 0 0 20px rgba(111,208,255,.55)"
```

## LIV-025 — src/live-sound-native-renderer.v6-before-safe-checklist-fix.js:822

```text

    if (getComputedStyle(surface).position === "static") {
      surface.style.position = "relative";
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

## LIV-025 — src/live-sound-native-renderer.v6-before-visibility-lifecycle-fix.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6-before-visibility-lifecycle-fix.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let nativeVisible = true;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

  const LEVEL = {
    id: LEVEL_ID,
    title: "Sub Matrix Feed",
```

## LIV-025 — src/live-sound-native-renderer.v6-before-visibility-lifecycle-fix.js:866

```text

    if (getComputedStyle(surface).position === "static") {
      surface.style.position = "relative";
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

## LIV-025 — src/live-sound-native-renderer.v6-before-zstack-fix.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6-before-zstack-fix.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let nativeVisible = true;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

  const LEVEL = {
    id: LEVEL_ID,
    title: "Sub Matrix Feed",
```

## LIV-025 — src/live-sound-native-renderer.v6-before-zstack-fix.js:866

```text

    if (getComputedStyle(surface).position === "static") {
      surface.style.position = "relative";
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

## LIV-025 — src/live-sound-native-renderer.v6r10-before-coin-and-hint-toggle.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6r10-before-coin-and-hint-toggle.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let nativeVisible = true;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

  const LEVEL = {
    id: LEVEL_ID,
    title: "Sub Matrix Feed",
```

## LIV-025 — src/live-sound-native-renderer.v6r10-before-coin-and-hint-toggle.js:964

```text
    });

    surface.appendChild(layer);
    redrawCables(layer);
    installCableDrag(layer);
  }

  function raiseHintOverlays() {
    // Native LIV-025 layer sits high in the board. Keep hint UI visible above it.
    Array.from(document.querySelectorAll("div, section, article, aside, dialog"))
      .forEach(el => {
        if (!el || !el.isConnected) return;
        if (el.closest(".sf-live-native-layer")) return;

        const text = normalize(textOf(el));
        const cls = String(el.className || "").toLowerCase();

        const looksLikeHint =
          cls.includes("hint") ||
          text.includes("hint") ||
          text.includes("show hints") ||
          text.includes("hide hints");
```

## LIV-025 — src/live-sound-native-renderer.v6r10-before-coin-and-hint-toggle.js:992

```text
        if (r.width > window.innerWidth * 0.95 && r.height > window.innerHeight * 0.75) return;

        el.style.position = getComputedStyle(el).position === "static" ? "relative" : el.style.position;
        el.style.zIndex = "12000";
      });
  }

  function hidePanelToggleControls() {
    // LIV-025 native recovery: front/back equipment images are not ready yet.
    // Hide the panel toggle for now so players stay on the stable native board.
    Array.from(document.querySelectorAll("button, [role='button']")).forEach(button => {
      const label = normalize([
        textOf(button),
        button.getAttribute && button.getAttribute("aria-label"),
        button.getAttribute && button.getAttribute("title")
      ].filter(Boolean).join(" "));

      if (
        label.includes("inspect") ||
        label.includes("back panel") ||
        label.includes("front panel") ||
        label === "front" ||
```

## LIV-025 — src/live-sound-native-renderer.v6r10-before-coin-and-hint-toggle.js:1044

```text
      surface.style.position = "relative";
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);
    hidePanelToggleControls();
    raiseHintOverlays();

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

## LIV-025 — src/live-sound-native-renderer.v6r11-stable-before-empty-board-clear-fix.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6r11-stable-before-empty-board-clear-fix.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let nativeVisible = true;
  let nativeHintsVisible = false;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

  const LEVEL = {
    id: LEVEL_ID,
```

## LIV-025 — src/live-sound-native-renderer.v6r11-stable-before-empty-board-clear-fix.js:1006

```text
    });

    surface.appendChild(layer);
    redrawCables(layer);
    installCableDrag(layer);
  }

  function raiseHintOverlays() {
    // Native LIV-025 layer sits high in the board. Keep hint UI visible above it.
    Array.from(document.querySelectorAll("div, section, article, aside, dialog"))
      .forEach(el => {
        if (!el || !el.isConnected) return;
        if (el.closest(".sf-live-native-layer")) return;

        const text = normalize(textOf(el));
        const cls = String(el.className || "").toLowerCase();

        const looksLikeHint =
          cls.includes("hint") ||
          text.includes("hint") ||
          text.includes("show hints") ||
          text.includes("hide hints");
```

## LIV-025 — src/live-sound-native-renderer.v6r11-stable-before-empty-board-clear-fix.js:1034

```text
        if (r.width > window.innerWidth * 0.95 && r.height > window.innerHeight * 0.75) return;

        el.style.position = getComputedStyle(el).position === "static" ? "relative" : el.style.position;
        el.style.zIndex = "12000";
      });
  }

  function hidePanelToggleControls() {
    // LIV-025 native recovery: front/back equipment images are not ready yet.
    // Hide the panel toggle for now so players stay on the stable native board.
    Array.from(document.querySelectorAll("button, [role='button']")).forEach(button => {
      const label = normalize([
        textOf(button),
        button.getAttribute && button.getAttribute("aria-label"),
        button.getAttribute && button.getAttribute("title")
      ].filter(Boolean).join(" "));

      if (
        label.includes("inspect") ||
        label.includes("back panel") ||
        label.includes("front panel") ||
        label === "front" ||
```

## LIV-025 — src/live-sound-native-renderer.v6r11-stable-before-empty-board-clear-fix.js:1087

```text
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);
    hidePanelToggleControls();
    raiseHintOverlays();
    updateNativeHintHighlights();

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

## LIV-025 — src/live-sound-native-renderer.v6r11-stable-liv025.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6r11-stable-liv025.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let nativeVisible = true;
  let nativeHintsVisible = false;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

  const LEVEL = {
    id: LEVEL_ID,
```

## LIV-025 — src/live-sound-native-renderer.v6r11-stable-liv025.js:1006

```text
    });

    surface.appendChild(layer);
    redrawCables(layer);
    installCableDrag(layer);
  }

  function raiseHintOverlays() {
    // Native LIV-025 layer sits high in the board. Keep hint UI visible above it.
    Array.from(document.querySelectorAll("div, section, article, aside, dialog"))
      .forEach(el => {
        if (!el || !el.isConnected) return;
        if (el.closest(".sf-live-native-layer")) return;

        const text = normalize(textOf(el));
        const cls = String(el.className || "").toLowerCase();

        const looksLikeHint =
          cls.includes("hint") ||
          text.includes("hint") ||
          text.includes("show hints") ||
          text.includes("hide hints");
```

## LIV-025 — src/live-sound-native-renderer.v6r11-stable-liv025.js:1034

```text
        if (r.width > window.innerWidth * 0.95 && r.height > window.innerHeight * 0.75) return;

        el.style.position = getComputedStyle(el).position === "static" ? "relative" : el.style.position;
        el.style.zIndex = "12000";
      });
  }

  function hidePanelToggleControls() {
    // LIV-025 native recovery: front/back equipment images are not ready yet.
    // Hide the panel toggle for now so players stay on the stable native board.
    Array.from(document.querySelectorAll("button, [role='button']")).forEach(button => {
      const label = normalize([
        textOf(button),
        button.getAttribute && button.getAttribute("aria-label"),
        button.getAttribute && button.getAttribute("title")
      ].filter(Boolean).join(" "));

      if (
        label.includes("inspect") ||
        label.includes("back panel") ||
        label.includes("front panel") ||
        label === "front" ||
```

## LIV-025 — src/live-sound-native-renderer.v6r11-stable-liv025.js:1087

```text
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);
    hidePanelToggleControls();
    raiseHintOverlays();
    updateNativeHintHighlights();

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

## LIV-025 — src/live-sound-native-renderer.v6r12-empty-click-fixed-before-drag.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6r12-empty-click-fixed-before-drag.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let nativeVisible = true;
  let nativeHintsVisible = false;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

  const LEVEL = {
    id: LEVEL_ID,
```

## LIV-025 — src/live-sound-native-renderer.v6r12-empty-click-fixed-before-drag.js:1006

```text
    });

    surface.appendChild(layer);
    redrawCables(layer);
    installCableDrag(layer);
  }

  function raiseHintOverlays() {
    // Native LIV-025 layer sits high in the board. Keep hint UI visible above it.
    Array.from(document.querySelectorAll("div, section, article, aside, dialog"))
      .forEach(el => {
        if (!el || !el.isConnected) return;
        if (el.closest(".sf-live-native-layer")) return;

        const text = normalize(textOf(el));
        const cls = String(el.className || "").toLowerCase();

        const looksLikeHint =
          cls.includes("hint") ||
          text.includes("hint") ||
          text.includes("show hints") ||
          text.includes("hide hints");
```

## LIV-025 — src/live-sound-native-renderer.v6r12-empty-click-fixed-before-drag.js:1034

```text
        if (r.width > window.innerWidth * 0.95 && r.height > window.innerHeight * 0.75) return;

        el.style.position = getComputedStyle(el).position === "static" ? "relative" : el.style.position;
        el.style.zIndex = "12000";
      });
  }

  function hidePanelToggleControls() {
    // LIV-025 native recovery: front/back equipment images are not ready yet.
    // Hide the panel toggle for now so players stay on the stable native board.
    Array.from(document.querySelectorAll("button, [role='button']")).forEach(button => {
      const label = normalize([
        textOf(button),
        button.getAttribute && button.getAttribute("aria-label"),
        button.getAttribute && button.getAttribute("title")
      ].filter(Boolean).join(" "));

      if (
        label.includes("inspect") ||
        label.includes("back panel") ||
        label.includes("front panel") ||
        label === "front" ||
```

## LIV-025 — src/live-sound-native-renderer.v6r12-empty-click-fixed-before-drag.js:1087

```text
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);
    hidePanelToggleControls();
    raiseHintOverlays();
    updateNativeHintHighlights();

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

## LIV-025 — src/live-sound-native-renderer.v6r13-before-drag-to-patch.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6r13-before-drag-to-patch.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let nativeVisible = true;
  let nativeHintsVisible = false;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

  const LEVEL = {
    id: LEVEL_ID,
```

## LIV-025 — src/live-sound-native-renderer.v6r13-before-drag-to-patch.js:1029

```text
    });

    surface.appendChild(layer);
    redrawCables(layer);
    installCableDrag(layer);
  }

  function raiseHintOverlays() {
    // Native LIV-025 layer sits high in the board. Keep hint UI visible above it.
    Array.from(document.querySelectorAll("div, section, article, aside, dialog"))
      .forEach(el => {
        if (!el || !el.isConnected) return;
        if (el.closest(".sf-live-native-layer")) return;

        const text = normalize(textOf(el));
        const cls = String(el.className || "").toLowerCase();

        const looksLikeHint =
          cls.includes("hint") ||
          text.includes("hint") ||
          text.includes("show hints") ||
          text.includes("hide hints");
```

## LIV-025 — src/live-sound-native-renderer.v6r13-before-drag-to-patch.js:1057

```text
        if (r.width > window.innerWidth * 0.95 && r.height > window.innerHeight * 0.75) return;

        el.style.position = getComputedStyle(el).position === "static" ? "relative" : el.style.position;
        el.style.zIndex = "12000";
      });
  }

  function hidePanelToggleControls() {
    // LIV-025 native recovery: front/back equipment images are not ready yet.
    // Hide the panel toggle for now so players stay on the stable native board.
    Array.from(document.querySelectorAll("button, [role='button']")).forEach(button => {
      const label = normalize([
        textOf(button),
        button.getAttribute && button.getAttribute("aria-label"),
        button.getAttribute && button.getAttribute("title")
      ].filter(Boolean).join(" "));

      if (
        label.includes("inspect") ||
        label.includes("back panel") ||
        label.includes("front panel") ||
        label === "front" ||
```

## LIV-025 — src/live-sound-native-renderer.v6r13-before-drag-to-patch.js:1110

```text
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);
    hidePanelToggleControls();
    raiseHintOverlays();
    updateNativeHintHighlights();

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

## LIV-025 — src/live-sound-native-renderer.v6r14-drag-to-patch-before-score-physics-flicker.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6r14-drag-to-patch-before-score-physics-flicker.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let patchDrag = null;
  let suppressNativeClickUntil = 0;
  let nativeVisible = true;
  let nativeHintsVisible = false;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

```

## LIV-025 — src/live-sound-native-renderer.v6r14-drag-to-patch-before-score-physics-flicker.js:384

```text
      { x: from.x, y: midY },
      { x: to.x, y: midY },
      to,
      0.5
    );
  }

  function createCableDragHandle(layer, route) {
    // Disabled: LIV-025 now uses drag-from-endpoint-to-endpoint patching,
    // not midpoint cable-bend handles.
    return;
    const point = cablePointAtMid(route.fromPoint, route.toPoint, route.bend || 0);

    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = "sf-cable-drag-handle";
    handle.setAttribute("aria-label", "Drag cable");
    handle.dataset.routeKey = route.key;

    handle.style.cssText = [
      "position:absolute",
      "left:" + point.x + "px",
```

## LIV-025 — src/live-sound-native-renderer.v6r14-drag-to-patch-before-score-physics-flicker.js:1253

```text
    });

    surface.appendChild(layer);
    redrawCables(layer);
    installCableDrag(layer);
  }

  function raiseHintOverlays() {
    // Native LIV-025 layer sits high in the board. Keep hint UI visible above it.
    Array.from(document.querySelectorAll("div, section, article, aside, dialog"))
      .forEach(el => {
        if (!el || !el.isConnected) return;
        if (el.closest(".sf-live-native-layer")) return;

        const text = normalize(textOf(el));
        const cls = String(el.className || "").toLowerCase();

        const looksLikeHint =
          cls.includes("hint") ||
          text.includes("hint") ||
          text.includes("show hints") ||
          text.includes("hide hints");
```

## LIV-025 — src/live-sound-native-renderer.v6r14-drag-to-patch-before-score-physics-flicker.js:1281

```text
        if (r.width > window.innerWidth * 0.95 && r.height > window.innerHeight * 0.75) return;

        el.style.position = getComputedStyle(el).position === "static" ? "relative" : el.style.position;
        el.style.zIndex = "12000";
      });
  }

  function hidePanelToggleControls() {
    // LIV-025 native recovery: front/back equipment images are not ready yet.
    // Hide the panel toggle for now so players stay on the stable native board.
    Array.from(document.querySelectorAll("button, [role='button']")).forEach(button => {
      const label = normalize([
        textOf(button),
        button.getAttribute && button.getAttribute("aria-label"),
        button.getAttribute && button.getAttribute("title")
      ].filter(Boolean).join(" "));

      if (
        label.includes("inspect") ||
        label.includes("back panel") ||
        label.includes("front panel") ||
        label === "front" ||
```

## LIV-025 — src/live-sound-native-renderer.v6r14-drag-to-patch-before-score-physics-flicker.js:1334

```text
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);
    hidePanelToggleControls();
    raiseHintOverlays();
    updateNativeHintHighlights();

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

## LIV-025 — src/live-sound-native-renderer.v6r15-before-neutral-drag-preview.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6r15-before-neutral-drag-preview.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let patchDrag = null;
  let suppressNativeClickUntil = 0;
  let nativeVisible = true;
  let nativeHintsVisible = false;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

```

## LIV-025 — src/live-sound-native-renderer.v6r15-before-neutral-drag-preview.js:324

```text
  }

  function defaultCableBend(routeKey, index) {
    const lanes = [-54, -36, -20, 18, 34, 52, 68];
    return lanes[(cableHash(routeKey) + index) % lanes.length];
  }

  function cableD(from, to, bend) {
    // LIV-025 natural cable feel:
    // - cables sag downward with gravity
    // - each route gets a slightly different lane/bow
    // - near-vertical runs bow sideways instead of stacking on top of each other
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const span = Math.max(1, Math.hypot(dx, dy));
    const lane = Number.isFinite(bend) ? bend : 0;

    const sag = Math.max(38, Math.min(190, span * 0.20 + Math.abs(dy) * 0.10));
    const verticalish = Math.abs(dy) > Math.abs(dx) * 1.35;

    let c1;
    let c2;
```

## LIV-025 — src/live-sound-native-renderer.v6r15-before-neutral-drag-preview.js:429

```text
      { x: from.x, y: midY },
      { x: to.x, y: midY },
      to,
      0.5
    );
  }

  function createCableDragHandle(layer, route) {
    // Disabled: LIV-025 now uses drag-from-endpoint-to-endpoint patching,
    // not midpoint cable-bend handles.
    return;
    const point = cablePointAtMid(route.fromPoint, route.toPoint, route.bend || 0);

    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = "sf-cable-drag-handle";
    handle.setAttribute("aria-label", "Drag cable");
    handle.dataset.routeKey = route.key;

    handle.style.cssText = [
      "position:absolute",
      "left:" + point.x + "px",
```

## LIV-025 — src/live-sound-native-renderer.v6r15-before-neutral-drag-preview.js:1348

```text
    });

    surface.appendChild(layer);
    redrawCables(layer);
    installCableDrag(layer);
  }

  function raiseHintOverlays() {
    // Native LIV-025 layer sits high in the board. Keep hint UI visible above it.
    Array.from(document.querySelectorAll("div, section, article, aside, dialog"))
      .forEach(el => {
        if (!el || !el.isConnected) return;
        if (el.closest(".sf-live-native-layer")) return;

        const text = normalize(textOf(el));
        const cls = String(el.className || "").toLowerCase();

        const looksLikeHint =
          cls.includes("hint") ||
          text.includes("hint") ||
          text.includes("show hints") ||
          text.includes("hide hints");
```

## LIV-025 — src/live-sound-native-renderer.v6r15-before-neutral-drag-preview.js:1376

```text
        if (r.width > window.innerWidth * 0.95 && r.height > window.innerHeight * 0.75) return;

        el.style.position = getComputedStyle(el).position === "static" ? "relative" : el.style.position;
        el.style.zIndex = "12000";
      });
  }

  function hidePanelToggleControls() {
    // LIV-025 native recovery: front/back equipment images are not ready yet.
    // Hide the panel toggle for now so players stay on the stable native board.
    Array.from(document.querySelectorAll("button, [role='button']")).forEach(button => {
      const label = normalize([
        textOf(button),
        button.getAttribute && button.getAttribute("aria-label"),
        button.getAttribute && button.getAttribute("title")
      ].filter(Boolean).join(" "));

      if (
        label.includes("inspect") ||
        label.includes("back panel") ||
        label.includes("front panel") ||
        label === "front" ||
```

## LIV-025 — src/live-sound-native-renderer.v6r15-before-neutral-drag-preview.js:1429

```text
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);
    hidePanelToggleControls();
    raiseHintOverlays();
    updateNativeHintHighlights();

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

## LIV-025 — src/live-sound-native-renderer.v6r16-before-system-processor-up.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6r16-before-system-processor-up.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let patchDrag = null;
  let suppressNativeClickUntil = 0;
  let nativeVisible = true;
  let nativeHintsVisible = false;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

```

## LIV-025 — src/live-sound-native-renderer.v6r16-before-system-processor-up.js:324

```text
  }

  function defaultCableBend(routeKey, index) {
    const lanes = [-54, -36, -20, 18, 34, 52, 68];
    return lanes[(cableHash(routeKey) + index) % lanes.length];
  }

  function cableD(from, to, bend) {
    // LIV-025 natural cable feel:
    // - cables sag downward with gravity
    // - each route gets a slightly different lane/bow
    // - near-vertical runs bow sideways instead of stacking on top of each other
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const span = Math.max(1, Math.hypot(dx, dy));
    const lane = Number.isFinite(bend) ? bend : 0;

    const sag = Math.max(38, Math.min(190, span * 0.20 + Math.abs(dy) * 0.10));
    const verticalish = Math.abs(dy) > Math.abs(dx) * 1.35;

    let c1;
    let c2;
```

## LIV-025 — src/live-sound-native-renderer.v6r16-before-system-processor-up.js:429

```text
      { x: from.x, y: midY },
      { x: to.x, y: midY },
      to,
      0.5
    );
  }

  function createCableDragHandle(layer, route) {
    // Disabled: LIV-025 now uses drag-from-endpoint-to-endpoint patching,
    // not midpoint cable-bend handles.
    return;
    const point = cablePointAtMid(route.fromPoint, route.toPoint, route.bend || 0);

    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = "sf-cable-drag-handle";
    handle.setAttribute("aria-label", "Drag cable");
    handle.dataset.routeKey = route.key;

    handle.style.cssText = [
      "position:absolute",
      "left:" + point.x + "px",
```

## LIV-025 — src/live-sound-native-renderer.v6r16-before-system-processor-up.js:1348

```text
    });

    surface.appendChild(layer);
    redrawCables(layer);
    installCableDrag(layer);
  }

  function raiseHintOverlays() {
    // Native LIV-025 layer sits high in the board. Keep hint UI visible above it.
    Array.from(document.querySelectorAll("div, section, article, aside, dialog"))
      .forEach(el => {
        if (!el || !el.isConnected) return;
        if (el.closest(".sf-live-native-layer")) return;

        const text = normalize(textOf(el));
        const cls = String(el.className || "").toLowerCase();

        const looksLikeHint =
          cls.includes("hint") ||
          text.includes("hint") ||
          text.includes("show hints") ||
          text.includes("hide hints");
```

## LIV-025 — src/live-sound-native-renderer.v6r16-before-system-processor-up.js:1376

```text
        if (r.width > window.innerWidth * 0.95 && r.height > window.innerHeight * 0.75) return;

        el.style.position = getComputedStyle(el).position === "static" ? "relative" : el.style.position;
        el.style.zIndex = "12000";
      });
  }

  function hidePanelToggleControls() {
    // LIV-025 native recovery: front/back equipment images are not ready yet.
    // Hide the panel toggle for now so players stay on the stable native board.
    Array.from(document.querySelectorAll("button, [role='button']")).forEach(button => {
      const label = normalize([
        textOf(button),
        button.getAttribute && button.getAttribute("aria-label"),
        button.getAttribute && button.getAttribute("title")
      ].filter(Boolean).join(" "));

      if (
        label.includes("inspect") ||
        label.includes("back panel") ||
        label.includes("front panel") ||
        label === "front" ||
```

## LIV-025 — src/live-sound-native-renderer.v6r16-before-system-processor-up.js:1429

```text
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);
    hidePanelToggleControls();
    raiseHintOverlays();
    updateNativeHintHighlights();

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

## LIV-025 — src/live-sound-native-renderer.v6r17-stable-liv025.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6r17-stable-liv025.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let patchDrag = null;
  let suppressNativeClickUntil = 0;
  let nativeVisible = true;
  let nativeHintsVisible = false;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

```

## LIV-025 — src/live-sound-native-renderer.v6r17-stable-liv025.js:337

```text
  }

  function defaultCableBend(routeKey, index) {
    const lanes = [-54, -36, -20, 18, 34, 52, 68];
    return lanes[(cableHash(routeKey) + index) % lanes.length];
  }

  function cableD(from, to, bend) {
    // LIV-025 natural cable feel:
    // - cables sag downward with gravity
    // - each route gets a slightly different lane/bow
    // - near-vertical runs bow sideways instead of stacking on top of each other
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const span = Math.max(1, Math.hypot(dx, dy));
    const lane = Number.isFinite(bend) ? bend : 0;

    const sag = Math.max(38, Math.min(190, span * 0.20 + Math.abs(dy) * 0.10));
    const verticalish = Math.abs(dy) > Math.abs(dx) * 1.35;

    let c1;
    let c2;
```

## LIV-025 — src/live-sound-native-renderer.v6r17-stable-liv025.js:442

```text
      { x: from.x, y: midY },
      { x: to.x, y: midY },
      to,
      0.5
    );
  }

  function createCableDragHandle(layer, route) {
    // Disabled: LIV-025 now uses drag-from-endpoint-to-endpoint patching,
    // not midpoint cable-bend handles.
    return;
    const point = cablePointAtMid(route.fromPoint, route.toPoint, route.bend || 0);

    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = "sf-cable-drag-handle";
    handle.setAttribute("aria-label", "Drag cable");
    handle.dataset.routeKey = route.key;

    handle.style.cssText = [
      "position:absolute",
      "left:" + point.x + "px",
```

## LIV-025 — src/live-sound-native-renderer.v6r17-stable-liv025.js:1361

```text
    });

    surface.appendChild(layer);
    redrawCables(layer);
    installCableDrag(layer);
  }

  function raiseHintOverlays() {
    // Native LIV-025 layer sits high in the board. Keep hint UI visible above it.
    Array.from(document.querySelectorAll("div, section, article, aside, dialog"))
      .forEach(el => {
        if (!el || !el.isConnected) return;
        if (el.closest(".sf-live-native-layer")) return;

        const text = normalize(textOf(el));
        const cls = String(el.className || "").toLowerCase();

        const looksLikeHint =
          cls.includes("hint") ||
          text.includes("hint") ||
          text.includes("show hints") ||
          text.includes("hide hints");
```

## LIV-025 — src/live-sound-native-renderer.v6r17-stable-liv025.js:1389

```text
        if (r.width > window.innerWidth * 0.95 && r.height > window.innerHeight * 0.75) return;

        el.style.position = getComputedStyle(el).position === "static" ? "relative" : el.style.position;
        el.style.zIndex = "12000";
      });
  }

  function hidePanelToggleControls() {
    // LIV-025 native recovery: front/back equipment images are not ready yet.
    // Hide the panel toggle for now so players stay on the stable native board.
    Array.from(document.querySelectorAll("button, [role='button']")).forEach(button => {
      const label = normalize([
        textOf(button),
        button.getAttribute && button.getAttribute("aria-label"),
        button.getAttribute && button.getAttribute("title")
      ].filter(Boolean).join(" "));

      if (
        label.includes("inspect") ||
        label.includes("back panel") ||
        label.includes("front panel") ||
        label === "front" ||
```

## LIV-025 — src/live-sound-native-renderer.v6r17-stable-liv025.js:1442

```text
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);
    hidePanelToggleControls();
    raiseHintOverlays();
    updateNativeHintHighlights();

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

## LIV-025 — src/live-sound-native-renderer.v6r4-routing-checklist-good-before-front-panel.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6r4-routing-checklist-good-before-front-panel.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let nativeVisible = true;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

  const LEVEL = {
    id: LEVEL_ID,
    title: "Sub Matrix Feed",
```

## LIV-025 — src/live-sound-native-renderer.v6r4-routing-checklist-good-before-front-panel.js:919

```text

    if (getComputedStyle(surface).position === "static") {
      surface.style.position = "relative";
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

## LIV-025 — src/live-sound-native-renderer.v6r5-working-routing-checklist-hide-panel-next.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6r5-working-routing-checklist-hide-panel-next.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let nativeVisible = true;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

  const LEVEL = {
    id: LEVEL_ID,
    title: "Sub Matrix Feed",
```

## LIV-025 — src/live-sound-native-renderer.v6r5-working-routing-checklist-hide-panel-next.js:919

```text

    if (getComputedStyle(surface).position === "static") {
      surface.style.position = "relative";
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

## LIV-025 — src/live-sound-native-renderer.v6r7-working-hide-panel-before-sound.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6r7-working-hide-panel-before-sound.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let nativeVisible = true;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

  const LEVEL = {
    id: LEVEL_ID,
    title: "Sub Matrix Feed",
```

## LIV-025 — src/live-sound-native-renderer.v6r7-working-hide-panel-before-sound.js:894

```text
    });

    surface.appendChild(layer);
    redrawCables(layer);
    installCableDrag(layer);
  }

  function hidePanelToggleControls() {
    // LIV-025 native recovery: front/back equipment images are not ready yet.
    // Hide the panel toggle for now so players stay on the stable native board.
    Array.from(document.querySelectorAll("button, [role='button']")).forEach(button => {
      const label = normalize([
        textOf(button),
        button.getAttribute && button.getAttribute("aria-label"),
        button.getAttribute && button.getAttribute("title")
      ].filter(Boolean).join(" "));

      if (
        label.includes("back panel") ||
        label.includes("front panel") ||
        label === "front" ||
        label === "back"
```

## LIV-025 — src/live-sound-native-renderer.v6r7-working-hide-panel-before-sound.js:944

```text
    if (getComputedStyle(surface).position === "static") {
      surface.style.position = "relative";
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);
    hidePanelToggleControls();

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

## LIV-025 — src/live-sound-native-renderer.v6r8-working-before-hide-inspect-hints.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6r8-working-before-hide-inspect-hints.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let nativeVisible = true;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

  const LEVEL = {
    id: LEVEL_ID,
    title: "Sub Matrix Feed",
```

## LIV-025 — src/live-sound-native-renderer.v6r8-working-before-hide-inspect-hints.js:942

```text
    });

    surface.appendChild(layer);
    redrawCables(layer);
    installCableDrag(layer);
  }

  function hidePanelToggleControls() {
    // LIV-025 native recovery: front/back equipment images are not ready yet.
    // Hide the panel toggle for now so players stay on the stable native board.
    Array.from(document.querySelectorAll("button, [role='button']")).forEach(button => {
      const label = normalize([
        textOf(button),
        button.getAttribute && button.getAttribute("aria-label"),
        button.getAttribute && button.getAttribute("title")
      ].filter(Boolean).join(" "));

      if (
        label.includes("back panel") ||
        label.includes("front panel") ||
        label === "front" ||
        label === "back"
```

## LIV-025 — src/live-sound-native-renderer.v6r8-working-before-hide-inspect-hints.js:992

```text
    if (getComputedStyle(surface).position === "static") {
      surface.style.position = "relative";
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);
    hidePanelToggleControls();

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

## LIV-025 — src/live-sound-native-renderer.v6r9-before-real-sfx.js:5

```text
/*
 * Signal Flow - Live Sound Native Renderer v6
 *
 * Scope:
 *   LIV-025 - Sub matrix feed
 *
 * Purpose:
 *   Replaces the temporary bridge approach with a native concept-sheet renderer
 *   for this board. It owns visual node selection, valid/invalid cables, undo,
 *   clear, bad-connect feedback, and front/back visibility for the concept layer.
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

```

## LIV-025 — src/live-sound-native-renderer.v6r9-before-real-sfx.js:19

```text
 *
 * Required load order:
 *   <script src="/src/live-sound-adapter.js"></script>
 *   <script src="/src/live-sound-native-renderer.js"></script>
 */
(function () {
  "use strict";

  const LEVEL_ID = "LIV-025";

  let selectedNode = null;
  let nativeVisible = true;
  let state = {
    routes: [],
    completedValidKeys: new Set()
  };

  const NATIVE_LAYER_TOP = 58;

  const LEVEL = {
    id: LEVEL_ID,
    title: "Sub Matrix Feed",
```

## LIV-025 — src/live-sound-native-renderer.v6r9-before-real-sfx.js:940

```text
    });

    surface.appendChild(layer);
    redrawCables(layer);
    installCableDrag(layer);
  }

  function raiseHintOverlays() {
    // Native LIV-025 layer sits high in the board. Keep hint UI visible above it.
    Array.from(document.querySelectorAll("div, section, article, aside, dialog"))
      .forEach(el => {
        if (!el || !el.isConnected) return;
        if (el.closest(".sf-live-native-layer")) return;

        const text = normalize(textOf(el));
        const cls = String(el.className || "").toLowerCase();

        const looksLikeHint =
          cls.includes("hint") ||
          text.includes("hint") ||
          text.includes("show hints") ||
          text.includes("hide hints");
```

## LIV-025 — src/live-sound-native-renderer.v6r9-before-real-sfx.js:968

```text
        if (r.width > window.innerWidth * 0.95 && r.height > window.innerHeight * 0.75) return;

        el.style.position = getComputedStyle(el).position === "static" ? "relative" : el.style.position;
        el.style.zIndex = "12000";
      });
  }

  function hidePanelToggleControls() {
    // LIV-025 native recovery: front/back equipment images are not ready yet.
    // Hide the panel toggle for now so players stay on the stable native board.
    Array.from(document.querySelectorAll("button, [role='button']")).forEach(button => {
      const label = normalize([
        textOf(button),
        button.getAttribute && button.getAttribute("aria-label"),
        button.getAttribute && button.getAttribute("title")
      ].filter(Boolean).join(" "));

      if (
        label.includes("inspect") ||
        label.includes("back panel") ||
        label.includes("front panel") ||
        label === "front" ||
```

## LIV-025 — src/live-sound-native-renderer.v6r9-before-real-sfx.js:1020

```text
      surface.style.position = "relative";
    }

    hideLegacyBoard(surface);
    renderNative(surface, adapter);
    hidePanelToggleControls();
    raiseHintOverlays();

    console.log("[Signal Flow] LIV-025 native renderer v6 mounted.");
  }

  function unmountNative() {
    const surface = findSurface();
    if (!surface) return;

    surface.querySelectorAll(".sf-live-native-layer").forEach(el => el.remove());
    restoreLegacyBoard(surface);
    clearSelection();
  }

  function clearNative() {
    state.routes = [];
```

