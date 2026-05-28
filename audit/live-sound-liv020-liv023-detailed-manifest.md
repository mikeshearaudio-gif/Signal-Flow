# LIV-020 to LIV-023 Detailed Monitor World Manifest

Planning date: 2026-05-28

Scope: planning only for the next Monitor World batch. Do not implement these boards with reactive DOM patches, broad overlays, or after-the-fact correction scripts. Build assets and explicit jack manifests first, then wire renderer/route validation only after the visual contracts are stable.

Locked systems to preserve:
- Scroll affordance remains passive cue-only and must not own wheel physics, layout, or scroll positions.
- Build-a-Room rendering and scrolling remain owned by `patch/sf-build-room-renderer.js`.
- LIV-019 cable lock remains the native game cable renderer top-layer lock via the cable kit; old runtime finalizer must not return.
- No route data, renderer, launch, diagnosis, scoring, hitbox, label, cable, or runtime CSS/JS changes are part of this manifest.

## Batch Intent

LIV-020 through LIV-023 should expand monitor-world thinking without jumping into split systems or matrix-zone routing. The batch teaches: mono IEM send assignment, wedge versus sidefill destination intent, symptom-based wrong monitor bus diagnosis, and combined monitor destination routing.

## Shared Design Rules

- Keep labels visible and literal: Aux 1 Output, IEM 1 Input, Vocal Wedge Input, Sidefill Input, Drum Fill Input.
- Prefer mono routes in this batch. If a future art choice introduces L/R, both sides must be represented and validated as a stereo pair.
- False routes should be fair and teachable: main outs, bus outs, record outs, network/RF-only ports, link/thru/service ports, and wrong aux numbers.
- Avoid hidden targets. Every route and false route needs a visible jack or explicit non-audio port label.
- Completion scoring should reward correct destination intent, not cable count alone.

## LIV-020 - FOH Aux Sends to Multiple Mono IEM Packs

Board type: Patch

Board concept: FOH sends five discrete mono aux mixes to five personal IEM packs. This remains readable and mostly mono so the player learns that each performer gets a dedicated aux send into a matching IEM input.

Learning objective: Route mono FOH aux outputs to the correct IEM pack inputs without using main outs, bus outs, record outs, or RF/network-only ports.

Required assets:
- `ls_personal_mono_iem_pack`
- `ls_monitor_console_rack`

Reusable existing assets:
- `assets/live-sound/svg/hardware/iem-wireless-rack-front.svg`
- `assets/live-sound/svg/hardware/iem-rack-liv019-five-inputs.svg`
- `assets/live-sound/svg/hardware/foh-console-io-panel.svg`
- `assets/live-sound/svg/panels/section-iem-wireless.svg`
- `assets/live-sound/svg/connectors/trs-quarter-inch.svg`
- `assets/live-sound/svg/connectors/bnc-antenna.svg`
- `assets/live-sound/svg/connectors/antenna-port.svg`

Missing or modified assets:
- `assets/live-sound/svg/hardware/personal-mono-iem-pack.svg`
- `assets/live-sound/svg/hardware/monitor-console-aux-panel.svg`

Required source nodes:
- `foh-aux-1-output`
- `foh-aux-2-output`
- `foh-aux-3-output`
- `foh-aux-4-output`
- `foh-aux-5-output`

Required destination jacks:
- `iem-pack-1-input`
- `iem-pack-2-input`
- `iem-pack-3-input`
- `iem-pack-4-input`
- `iem-pack-5-input`

Required routes:
- `liv020-aux-1-to-iem-pack-1`
- `liv020-aux-2-to-iem-pack-2`
- `liv020-aux-3-to-iem-pack-3`
- `liv020-aux-4-to-iem-pack-4`
- `liv020-aux-5-to-iem-pack-5`

False/trap jacks:
- `foh-main-l-output`
- `foh-main-r-output`
- `foh-bus-1-output`
- `foh-bus-2-output`
- `record-out-l`
- `record-out-r`
- `iem-pack-1-rf-port`
- `iem-pack-2-network-port`
- `iem-pack-3-link-port`
- `iem-pack-4-service-port`

False route families:
- Main PA output used as a monitor source
- Bus output used instead of aux output
- Record output used as performer mix source
- Audio cable patched to RF/network/service-only port
- Correct aux to wrong IEM pack

Label requirements:
- FOH rack labels: Aux 1 Output through Aux 5 Output; Main L; Main R; Bus 1; Bus 2; Record L; Record R.
- IEM labels: IEM 1 Input through IEM 5 Input; RF Out; Network; Link; Service.
- Use "Input" on audio targets and "RF/Network/Service" on non-audio traps so mistakes are readable.

Stereo-pair requirements: None. Do not introduce L/R IEM pairs in LIV-020; reserve stereo IEM reasoning for LIV-031.

Scoring/completion notes:
- Each correct route can award equal credit.
- Wrong aux-to-wrong-pack should be marked incorrect even though it is audio-to-audio.
- Non-audio trap ports should produce explanatory feedback rather than silent failure.

## LIV-021 - Wedge Mixes Plus Sidefill Send

Board type: Patch

Board concept: FOH or monitor rack sends mono monitor mixes to vocal wedges and a separate sidefill destination. The player must distinguish performer wedge mixes from stage coverage sidefill.

Learning objective: Choose the correct monitor destination family: wedge inputs for performer mixes and sidefill input for broader stage coverage.

Required assets:
- `ls_floor_wedge_monitor`
- `ls_sidefill_stack`
- `ls_monitor_console_rack`

Reusable existing assets:
- `assets/live-sound/svg/hardware/monitor-wedge-input-panel.svg`
- `assets/build-room/svg/gear/stage monitor.svg`
- `assets/build-room/svg/gear/main PA speaker syste.svg`
- `assets/live-sound/svg/connectors/speakon-nl4.svg`
- `assets/live-sound/svg/panels/section-monitor-wedge.svg`
- `assets/live-sound/svg/hardware/foh-console-io-panel.svg`

Missing or modified assets:
- `assets/live-sound/svg/hardware/floor-wedge-monitor.svg`
- `assets/live-sound/svg/hardware/sidefill-speaker-stack.svg`
- `assets/live-sound/svg/hardware/monitor-console-aux-panel.svg`

Required source nodes:
- `foh-aux-1-output`
- `foh-aux-2-output`
- `foh-aux-3-output`

Required destination jacks:
- `vocal-wedge-input`
- `guitar-wedge-input`
- `sidefill-input`

Required routes:
- `liv021-aux-1-to-vocal-wedge`
- `liv021-aux-2-to-guitar-wedge`
- `liv021-aux-3-to-sidefill`

False/trap jacks:
- `foh-main-l-output`
- `foh-main-r-output`
- `record-out-l`
- `record-out-r`
- `sidefill-link-port`
- `vocal-wedge-thru`
- `guitar-wedge-thru`
- `sidefill-service-port`

False route families:
- Sidefill send patched to a wedge input
- Wedge mix patched to sidefill
- Main output used as monitor source
- Record output used as live monitor source
- Link/thru/service ports treated as primary inputs

Label requirements:
- Wedges must be labeled by performer or role, not just Wedge 1 and Wedge 2.
- Sidefill must be labeled Sidefill Input and should visually differ from a main PA stack.
- Link/Thru/Service labels must be visible and non-ambiguous.

Stereo-pair requirements: None by default. Use a single sidefill input for this board to preserve the monitor-world ramp. If a sidefill L/R art variant is chosen later, it must become a paired route and should probably move to a later board.

Scoring/completion notes:
- Award completion for all three intended destinations.
- Treat role mismatch as incorrect even if source and destination are both audio jacks.
- Feedback should say whether the mistake is wrong output family or wrong destination family.

## LIV-022 - Monitor Send Wrong Bus Diagnosis

Board type: Diagnosis only

Board concept: A performer reports hearing the wrong mix. The board presents a monitor send fault where one performer is fed by the wrong aux/bus path. The player diagnoses the cause rather than drawing patch cables.

Learning objective: Trace a symptom to wrong monitor send family or wrong bus assignment, distinguishing aux sends from bus/main/record outputs.

Required assets:
- `ls_monitor_send_fault_scene`

Reusable existing assets:
- `assets/diagnosis/svg/backgrounds/diagnosis-board-shell.svg`
- `assets/diagnosis/svg/monitors/signal-flow-patch-tester.svg`
- `assets/diagnosis/svg/monitors/insert-path-monitor.svg`
- `assets/live-sound/svg/hardware/iem-wireless-rack-front.svg`
- `assets/live-sound/svg/hardware/monitor-wedge-input-panel.svg`

Missing or modified assets:
- `assets/diagnosis/svg/scenes/live-monitor-send-fault.svg`

Required source nodes:
- `expected-aux-2-vocal-mix`
- `actual-bus-1-band-mix`
- `performer-iem-input`

Required destination jacks:
- Diagnosis board should not expose playable patch jacks as draggable route endpoints.
- Visual callouts may identify Performer IEM, Expected Aux 2, Actual Bus 1, and FOH monitor send panel.

Required diagnosis outcomes:
- Correct finding: performer IEM is fed from Bus 1 instead of Aux 2.
- Correct fix recommendation: move performer IEM feed to Aux 2 Output.
- Secondary accepted language: wrong monitor send / wrong mix bus feeding performer.

False/trap jacks:
- `foh-main-l-output`
- `foh-main-r-output`
- `record-out-l`
- `record-out-r`
- `network-control-port`
- `rf-antenna-port`

False route families:
- Blaming the IEM bodypack hardware when the route is wrong
- Blaming main PA output
- Blaming record feed
- Treating RF/network/control port as audio feed
- Selecting "turn up the mix" when the wrong mix is routed

Label requirements:
- Symptom label: "Vocalist hears band mix, not vocal mix."
- Expected path label: "Expected: Aux 2 Vocal Mix."
- Actual fault label: "Actual: Bus 1 Band Mix."
- Diagnosis options should use route-family names: Aux, Bus, Main, Record, RF/Network.

Stereo-pair requirements: None. This diagnosis is mono/wrong-mix focused.

Scoring/completion notes:
- Correct answer should complete the board without cable drawing.
- Incorrect answers should explain the wrong family distinction.
- This level should not mutate route validation or require new patch-board behavior.

## LIV-023 - Drum Fill Plus Sidefill Plus Vocal Wedge

Board type: Patch

Board concept: A compact stage monitor board with three destination types: drummer fill, sidefill, and vocal wedge. The board combines what LIV-020 and LIV-021 taught without introducing split or matrix routing.

Learning objective: Route monitor outputs by destination intent and performer role: drummer gets drum fill, vocalist gets vocal wedge, band/stage gets sidefill.

Required assets:
- `ls_drum_fill_speaker`
- `ls_sidefill_stack`
- `ls_floor_wedge_monitor`
- `ls_monitor_console_rack`

Reusable existing assets:
- `assets/drums/svg/drum-kit-5-piece-8-hitboxes.svg`
- `assets/live-sound/svg/hardware/monitor-wedge-input-panel.svg`
- `assets/build-room/svg/gear/stage monitor.svg`
- `assets/build-room/svg/gear/main PA speaker syste.svg`
- `assets/live-sound/svg/hardware/foh-console-io-panel.svg`
- `assets/live-sound/svg/connectors/speakon-nl4.svg`

Missing or modified assets:
- `assets/live-sound/svg/hardware/drum-fill-speaker.svg`
- `assets/live-sound/svg/hardware/sidefill-speaker-stack.svg`
- `assets/live-sound/svg/hardware/floor-wedge-monitor.svg`
- `assets/live-sound/svg/hardware/monitor-console-aux-panel.svg`

Required source nodes:
- `monitor-aux-1-output`
- `monitor-aux-2-output`
- `monitor-aux-3-output`

Required destination jacks:
- `drum-fill-input`
- `sidefill-input`
- `vocal-wedge-input`

Required routes:
- `liv023-aux-1-to-drum-fill`
- `liv023-aux-2-to-sidefill`
- `liv023-aux-3-to-vocal-wedge`

False/trap jacks:
- `foh-main-l-output`
- `foh-main-r-output`
- `record-out-l`
- `record-out-r`
- `drum-fill-thru`
- `sidefill-link-port`
- `vocal-wedge-thru`
- `service-port`

False route families:
- Drum fill patched to sidefill
- Vocal wedge patched to drum fill
- Sidefill patched to vocal wedge
- Main/record output used as monitor source
- Link/thru/service port used as primary input

Label requirements:
- Destination labels must say Drum Fill Input, Sidefill Input, Vocal Wedge Input.
- Aux outputs should include role hints only if needed: Aux 1 Drummer, Aux 2 Sidefill, Aux 3 Vocal.
- False trap labels must remain visible but visually secondary.

Stereo-pair requirements: None. Keep this mono for readability.

Scoring/completion notes:
- Completion requires all three correct monitor destinations.
- Role mismatch should remain incorrect even when the physical connector type matches.
- This board should feel like a monitor-intent puzzle, not a cable-density puzzle.

## Asset-First Implementation Gate

Before any runtime work begins, confirm:
- Each missing asset has a named output path.
- Each required jack and false trap jack appears in the art brief.
- Each label is readable at game scale.
- Route IDs in the route manifest map one-to-one to visible endpoints.
- Diagnosis-only LIV-022 has answer/fault IDs but no patch-board route implementation requirement.
