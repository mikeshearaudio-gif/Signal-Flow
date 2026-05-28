# Live Sound Asset Build Priority

Planning date: 2026-05-27

This build order is asset-first. New renderers and route validation should wait until the visual assets and jack labels exist in a manifest with explicit intended and false-route jack names.

## Batch 1 - Monitor Boards LIV-020 to LIV-023

Goal: finish the next monitor-world boards without overloading the player with split or matrix concepts.

| Priority | Asset ID | Asset | Existing candidate | Output target | Why now |
| --- | --- | --- | --- | --- | --- |
| P0 | ls_personal_mono_iem_pack | Personal mono IEM pack | assets/build-room/svg/gear/iem-receiver-bodypack-teal-led.svg | assets/live-sound/svg/hardware/personal-mono-iem-pack.svg | LIV-020 needs multiple mono IEM destinations |
| P0 | ls_floor_wedge_monitor | Floor wedge monitor | assets/live-sound/svg/hardware/monitor-wedge-input-panel.svg | assets/live-sound/svg/hardware/floor-wedge-monitor.svg | LIV-021 and LIV-023 need clear wedge destinations |
| P0 | ls_sidefill_stack | Sidefill speaker stack | assets/build-room/svg/gear/main PA speaker syste.svg | assets/live-sound/svg/hardware/sidefill-speaker-stack.svg | Sidefill must not be confused with mains or wedges |
| P0 | ls_drum_fill_speaker | Drum fill speaker | assets/live-sound/svg/hardware/monitor-wedge-input-panel.svg | assets/live-sound/svg/hardware/drum-fill-speaker.svg | LIV-023 introduces drummer-specific monitoring |
| P0 | ls_monitor_console_rack | Monitor console or monitor rack | assets/live-sound/svg/hardware/foh-console-io-panel.svg | assets/live-sound/svg/hardware/monitor-console-aux-panel.svg | Makes aux sends feel like monitor-world ownership |
| P0 | ls_monitor_send_fault_scene | Monitor send fault diagnosis art | assets/diagnosis/svg/backgrounds/diagnosis-board-shell.svg | assets/diagnosis/svg/scenes/live-monitor-send-fault.svg | LIV-022 diagnosis needs a monitor-specific symptom surface |

Jack/label focus:
- Intended jacks: Aux 1-4; Sidefill; Drum Fill; Wedge Input; IEM Input; Talkback Send.
- False traps: Main L/R; record out; bus out; network/RF-only ports; link/thru ports.

## Batch 2 - Split/Broadcast/Record LIV-029 to LIV-030

Goal: introduce ownership and isolation without building the full theater system yet.

| Priority | Asset ID | Asset | Existing candidate | Output target | Why now |
| --- | --- | --- | --- | --- | --- |
| P1 | ls_transformer_split_rack | Transformer-isolated split rack | assets/build-room/svg/gear/Stereo broadcast splitter.svg | assets/live-sound/svg/hardware/transformer-split-rack-16ch.svg | Core split-snake concept for FOH plus monitor plus record |
| P1 | ls_foh_split_panel | FOH split panel | assets/live-sound/svg/hardware/stagebox-snake-head-16x2-aes.svg | assets/live-sound/svg/hardware/foh-split-panel.svg | Keeps FOH split route labels compact |
| P1 | ls_monitor_split_panel | Monitor split panel | assets/live-sound/svg/hardware/stagebox-snake-head-16x2-aes.svg | assets/live-sound/svg/hardware/monitor-split-panel.svg | Separates monitor console from FOH console |
| P1 | ls_broadcast_record_split_panel | Broadcast record split panel | assets/build-room/svg/gear/field recorder.svg | assets/live-sound/svg/hardware/broadcast-record-split-panel.svg | Supports record and broadcast branches |
| P1 | ls_stream_broadcast_feed_box | Stream broadcast feed box | assets/build-room/svg/gear/Stream encoder.svg | assets/live-sound/svg/hardware/stream-broadcast-feed-box.svg | Needed for stream and house-of-worship boards |

Jack/label focus:
- Intended jacks: Stage Inputs 1-16; FOH Split 1-16; MON Split 1-16; Record 1-8; Broadcast L/R; Stream L/R.
- False traps: ground lift; link; network; phones; main outs used as split substitutes.

## Batch 3 - Matrix/Zone LIV-032 to LIV-041

Goal: teach matrix routing as a zone-distribution system rather than a new cable-count challenge.

| Priority | Asset ID | Asset | Existing candidate | Output target | Why now |
| --- | --- | --- | --- | --- | --- |
| P1 | ls_matrix_processor_zone_dsp | Matrix processor / zone DSP | assets/build-room/svg/gear/Matrix router.svg | assets/live-sound/svg/hardware/matrix-processor-zone-dsp.svg | Central matrix-zone asset |
| P1 | ls_matrix_patch_panel_8out | Matrix patch panel with Matrix 1-8 outputs | assets/live-sound/svg/hardware/foh-console-liv006-matrix-main-outs.svg | assets/live-sound/svg/hardware/matrix-output-patch-panel-8.svg | Explicit numbered matrix outputs support traps |
| P1 | ls_frontfill_pair | Front fill pair | assets/build-room/svg/gear/frontfill.svg | assets/live-sound/svg/hardware/front-fill-pair.svg | First matrix destination family |
| P1 | ls_outfill_pair | Outfill pair | assets/live-sound/svg/hardware/line-array-liv010-left.svg | assets/live-sound/svg/hardware/outfill-speaker-pair.svg | Distinguishes outer coverage from mains |
| P1 | ls_delay_fill_speaker | Delay fill speaker | assets/live-sound/svg/hardware/line-array-liv010-right.svg | assets/live-sound/svg/hardware/delay-fill-speaker.svg | Supports delay tower and distributed fill boards |
| P1 | ls_under_balcony_speaker | Under-balcony speaker | assets/build-room/svg/gear/main PA speaker syste.svg | assets/live-sound/svg/hardware/under-balcony-speaker.svg | Adds venue-zone specificity |
| P1 | ls_lobby_speaker | Lobby speaker | assets/build-room/svg/gear/main PA speaker syste.svg | assets/live-sound/svg/hardware/lobby-program-speaker.svg | Supports overflow/lobby feeds |
| P1 | ls_backstage_program_speaker | Backstage program speaker | assets/build-room/svg/gear/stage monitor.svg | assets/live-sound/svg/hardware/backstage-program-speaker.svg | Bridges zone and theater use cases |
| P1 | ls_assistive_listening_tx | Assistive listening transmitter | assets/build-room/svg/gear/ifb-transmitter-bodypack-amber-led.svg | assets/live-sound/svg/hardware/assistive-listening-transmitter.svg | Adds non-speaker distributed output |
| P1 | ls_distributed_zone_amp_rack | Distributed zone amp rack | assets/live-sound/svg/hardware/power-amplifier.svg | assets/live-sound/svg/hardware/distributed-zone-amp-rack.svg | Makes zone chain readable |

Jack/label focus:
- Intended jacks: Matrix 1-8; Zone In 1-4; Speaker Out 1-4; Front Fill L/R; Outfill L/R; Lobby Feed; Backstage Program.
- False traps: main L/R; aux monitor outs; record outs; network/control/link ports; wrong matrix numbers.

## Batch 4 - Musical/Theater LIV-042 to LIV-050

Goal: introduce theater-specific sources and cue/monitor systems after players understand monitors, splits, and matrix zones.

| Priority | Asset ID | Asset | Existing candidate | Output target | Why now |
| --- | --- | --- | --- | --- | --- |
| P2 | ls_orchestra_pit_layout_base | Orchestra pit layout base | assets/IR images/Scoring Stage.png | assets/live-sound/svg/backgrounds/orchestra-pit-layout-base.svg | Anchor for pit boards |
| P2 | ls_pit_stagebox | Pit stagebox | assets/live-sound/svg/hardware/stagebox-snake-head-16x2-aes.svg | assets/live-sound/svg/hardware/pit-stagebox-24x8.svg | Dense pit source patching |
| P2 | ls_conductor_monitor | Conductor monitor | assets/diagnosis/svg/monitors/signal-flow-patch-tester.svg | assets/live-sound/svg/hardware/conductor-monitor.svg | Cue and program monitoring target |
| P2 | ls_conductor_camera_video_monitor | Conductor camera/video monitor | assets/diagnosis/svg/monitors/spectrum-view.svg | assets/live-sound/svg/hardware/conductor-camera-video-monitor.svg | Video/control false-route distinction |
| P2 | ls_click_cue_playback_box | Click/cue playback box | assets/build-room/svg/gear/desktop-processor-unit-goodstyle.svg | assets/live-sound/svg/hardware/click-cue-playback-box.svg | Musical cue source |
| P2 | ls_backstage_program_speaker | Backstage cue speaker | assets/build-room/svg/gear/stage monitor.svg | assets/live-sound/svg/hardware/backstage-program-speaker.svg | Program/cue destination |
| P1 | ls_lobby_speaker | Green room/dressing room program speaker seed | assets/build-room/svg/gear/main PA speaker syste.svg | assets/live-sound/svg/hardware/lobby-program-speaker.svg | Reuse with label variants |
| P2 | ls_pit_wedge_monitors | Pit wedge monitors | assets/live-sound/svg/hardware/monitor-wedge-input-panel.svg | assets/live-sound/svg/hardware/pit-wedge-monitor-set.svg | Pit monitor setup |
| P2 | ls_pit_personal_mixers | Pit personal mixers | assets/build-room/svg/gear/iem-receiver-bodypack-teal-led.svg | assets/live-sound/svg/hardware/pit-personal-mixers.svg | Advanced pit monitor routing |
| P2 | ls_strings_source_art | Strings section source art | none | assets/live-sound/svg/hardware/source-strings-section.svg | Orchestra source readability |
| P2 | ls_woodwinds_source_art | Woodwinds section source art | none | assets/live-sound/svg/hardware/source-woodwinds-section.svg | Orchestra source readability |
| P2 | ls_brass_source_art | Brass section source art | none | assets/live-sound/svg/hardware/source-brass-section.svg | Orchestra source readability |
| P2 | ls_percussion_timpani_source_art | Percussion/timpani source art | assets/drums/svg/drum-kit-5-piece-8-hitboxes.svg | assets/live-sound/svg/hardware/source-percussion-timpani.svg | Orchestra source readability |
| P2 | ls_harp_source_art | Harp source art | none | assets/live-sound/svg/hardware/source-harp.svg | Theater source variety |
| P2 | ls_piano_keyboard_source_art | Piano/keyboard source art | assets/live-sound/svg/hardware/keyboard0.svg | assets/live-sound/svg/hardware/source-piano-keyboard-pit.svg | Existing asset can be modified |
| P2 | ls_stage_vocal_bodypack_source | Stage vocal/bodypack source | assets/live-sound/svg/hardware/live mic.svg | assets/live-sound/svg/hardware/source-stage-vocal-bodypack.svg | Stage vocals distinct from pit sources |
| P2 | ls_stage_manager_comm_cue_box | Stage manager/comm cue box | assets/build-room/svg/gear/ifb-transmitter-bodypack-amber-led.svg | assets/live-sound/svg/hardware/stage-manager-comm-cue-box.svg | Final commissioning faults |

Jack/label focus:
- Intended jacks: Pit Inputs 1-24; Pit Returns 1-8; Click Out; Cue L/R; Program In; Cue In; Bodypack Out; Matrix Zones.
- False traps: video-only; network/control; main PA; record outs; wrong matrix zones; missing L/R pair side.

## Highest-Risk Asset Decisions

- `ls_transformer_split_rack`: high jack density and label clarity risk.
- `ls_matrix_processor_zone_dsp`: central to many boards; wrong labels here would multiply downstream confusion.
- `ls_pit_stagebox`: dense theater endgame patching needs clear spacing and label groups.
- `ls_pit_personal_mixers`: network audio vs control/network traps must be visually fair.
- `ls_theater_commissioning_fault_art`: final diagnosis must be readable without changing diagnosis logic.
