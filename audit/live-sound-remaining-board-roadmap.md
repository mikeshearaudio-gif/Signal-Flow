# Live Sound Remaining Board Roadmap

Planning date: 2026-05-27

Scope: LIV-020 through LIV-050 asset-first planning for the remaining Live Sound boards. This roadmap intentionally raises difficulty by adding system decisions, stereo-pair reasoning, split ownership, matrix routing, distributed zones, and musical/theater cue workflows instead of simply adding more cables.

Runtime lock notes: this audit does not change route data, launch files, renderers, cable locks, scroll behavior, hitbox locks, label locks, scoring, economy, Build-a-Room behavior, or diagnosis logic.

| Level | Board type | Proposed concept | Learning goal | Expected gear families | Difficulty ramp | Route complexity notes |
| --- | --- | --- | --- | --- | --- | --- |
| LIV-020 | Patch | FOH aux sends to multiple mono IEM packs | Route discrete mono aux sends from FOH to performers without using mains or bus outs | monitor_world; source_icons | Early monitor expansion | Multiple mono destinations; traps include main outs and wrong aux numbers |
| LIV-021 | Patch | Wedge mixes plus sidefill send | Distinguish wedge mixes from sidefill coverage and assign outputs intentionally | monitor_world; speaker_destinations | Adds speaker destination choice | Mix sends are similar but not interchangeable; sidefill should not use wedge-only outputs |
| LIV-022 | Diagnosis | Monitor send wrong bus or performer hears wrong mix | Identify an incorrect aux or bus assignment from symptoms | diagnosis_art; monitor_world | First monitor diagnosis | Requires reading performer complaint and tracing wrong send family |
| LIV-023 | Patch | Drum fill plus sidefill plus vocal wedge | Combine several monitor destination types on one board | monitor_world; speaker_destinations | Multi-destination monitor board | Requires selecting correct destination by performer or coverage role |
| LIV-024 | IR / Listening | Identify room or reverb space for live venue | Match ambience to live venue use cases | ir_listening_art | Listening branch | Uses venue IR candidates such as club; hall; church; outdoor |
| LIV-025 | Patch | Aux-fed sub or processor route | Feed a processor or sub path without stealing main outputs | processor_patch_panels; speaker_destinations | Processing returns to patch flow | Traps include sidechain; link; network; full-range outs |
| LIV-026 | Patch | Delay tower feed | Route delayed distributed PA feed through system processor to delay tower | processor_patch_panels; speaker_destinations | Introduces distance/processor thinking | L/R pair or mono tower rules depending board design |
| LIV-027 | Build-a-Room | Small festival stage package | Select a workable stage package for outdoor festival | build_room_thumbnails; monitor_world | Build-a-Room gear selection | Needs PA; stagebox; wedges/IEM; power/utility; console choices |
| LIV-028 | Patch | Talkback to IEM or monitor system | Route talkback to performer monitor destinations without sending to audience | monitor_world; source_icons | Adds communication source routing | Traps include main PA and recording feed |
| LIV-029 | Patch | Split snake with FOH plus monitor console | Understand split ownership between FOH and monitor world | split_broadcast_record; monitor_world | First split system board | Requires source-to-split and split-to-two-console routing |
| LIV-030 | Patch | Recording split plus broadcast feed | Add record/broadcast outputs to the split ecosystem | split_broadcast_record; house_of_worship_stream | Split plus external destination | Requires record feed isolation and broadcast target labels |
| LIV-031 | Diagnosis | Performer hears left only or IEM stereo issue | Diagnose missing half of stereo IEM route | diagnosis_art; monitor_world | First stereo diagnosis | Stereo pair rule is explicit; both L and R must be represented |
| LIV-032 | Patch | Front fills from matrix outputs | Feed front fills from the correct matrix pair instead of mains or auxes | matrix_zone_distribution; speaker_destinations | Matrix rollout begins | Matrix 1/2 or mono front-fill rules; traps use main L/R and aux outs |
| LIV-033 | Patch | Outfills and delay fills | Route multiple fill families with correct matrix outputs | matrix_zone_distribution; speaker_destinations | More zone destinations | Adds fill type discrimination and optional stereo pairs |
| LIV-034 | Patch | Lobby; overflow; backstage feed | Feed distributed program zones from matrix outputs | matrix_zone_distribution; speaker_destinations | Distributed zone routing | Program zones should not use monitor auxes or record outs |
| LIV-035 | IR / Listening | Match venue or reverb treatment | Choose treatment for venue character and application | ir_listening_art | Listening reinforcement | Theater; worship; hall; lobby reverb comparison |
| LIV-036 | Quiz / Diagnosis | Aux vs group vs matrix vs DCA | Test conceptual routing families before endgame | diagnosis_art; matrix_zone_distribution | Knowledge checkpoint | Focuses on why a route family is correct; may include false route examples |
| LIV-037 | Patch | Corporate ballroom with main PA; lobby; record; presenter wedge | Combine audience PA; distributed feed; record feed; monitor feed | corporate_ballroom; matrix_zone_distribution; monitor_world | Practical mixed-use board | Meaningful choices across aux; matrix; record; main outs |
| LIV-038 | Patch | House of worship with band IEMs; choir mics; stream feed | Route stage sources; monitor feeds; and streaming outputs | house_of_worship_stream; monitor_world; split_broadcast_record | Large applied venue | Requires stream/broadcast family while keeping monitor sends separate |
| LIV-039 | Patch | Festival guest console; playback; MC mic | Integrate guest console and playback into festival system | split_broadcast_record; source_icons; monitor_world | Festival complexity | Traps include wrong split side; playback to record only; MC to wrong bus |
| LIV-040 | Patch | Complex matrix zone setup | Route several independent zones from matrix outputs | matrix_zone_distribution | Matrix mastery | Matrix 1-8 labels and false matrix traps are central |
| LIV-041 | Build-a-Room | Multi-zone venue design | Build a coherent multi-zone room package | build_room_thumbnails; matrix_zone_distribution | Build-a-Room matrix capstone | Needs matrix DSP; zone amps; frontfill/outfill/lobby/backstage endpoints |
| LIV-042 | Patch | Musical orchestra pit stagebox | Patch pit sections into pit stagebox and FOH path | musical_theater_pit; source_icons | Theater rollout begins | Source density increases by section; traps include stage vocal inputs |
| LIV-043 | Patch | Musical stage vocals plus pit plus backstage monitor | Combine pit sources; bodypacks; and backstage program | musical_theater_pit; musical_theater_monitor_cue | Cross-domain theater board | Requires differentiating performance sources and program feeds |
| LIV-044 | Patch | Musical conductor cam; click; cue sends | Route cue/click/video monitor support paths | musical_theater_monitor_cue | Cue system specialization | Audio cue and video/control traps should be visually distinct |
| LIV-045 | Diagnosis | Musical monitor failure or wrong matrix zone | Diagnose wrong zone/cue/monitor route in theater system | diagnosis_art; musical_theater_monitor_cue | Advanced diagnosis | Player traces symptom to matrix or cue path error |
| LIV-046 | IR / Listening | Theater or room response check | Identify theater or pit/house response issues | ir_listening_art; musical_theater_pit | Listening in theater context | Needs theater; scoring stage; hall; backstage/room candidates |
| LIV-047 | Patch | Musical full pit monitor setup | Feed pit wedges and personal mixers correctly | musical_theater_pit; musical_theater_monitor_cue | Pit monitor depth | Stereo/mono monitor variants and section feeds matter |
| LIV-048 | Patch | Theater distributed zones | Route orchestra; stage; backstage; lobby; dressing room program zones | matrix_zone_distribution; musical_theater_monitor_cue | Distributed theater board | Matrix zones are numerous; trap outputs should be convincing |
| LIV-049 | Patch Capstone | Full musical with orchestra pit; stage vocals; IEM/wedges; effects; matrix zones | Integrate full live theater routing system | musical_theater_pit; musical_theater_monitor_cue; matrix_zone_distribution; split_broadcast_record | Patch capstone | Requires aux vs bus vs matrix vs split vs processor decisions with stereo-pair validation |
| LIV-050 | Final Diagnosis / Commissioning | Find and fix errors in the full musical system | Commission and troubleshoot a completed complex system | diagnosis_art; musical_theater_monitor_cue; matrix_zone_distribution | Final systems diagnosis | Multiple simultaneous faults; wrong matrix zone; missing stereo side; wrong split; monitor feed mismatch |

## Alternative Board Slots

The following levels can remain non-patch boards to control pacing and teach concepts before heavier patch boards:

| Level | Alternate type | Planning note |
| --- | --- | --- |
| LIV-022 | Diagnosis | Best used as a monitor-world troubleshooting checkpoint after LIV-020 and LIV-021 |
| LIV-024 | IR / Listening | Keeps the early monitor run from becoming cable-only |
| LIV-027 | Build-a-Room | Introduces festival gear families before split/broadcast boards |
| LIV-031 | Diagnosis | Reinforces stereo-pair rule before matrix-zone rollout |
| LIV-035 | IR / Listening | Breaks up matrix boards and reinforces venue reasoning |
| LIV-036 | Quiz / Diagnosis | Concept checkpoint for aux; group; matrix; DCA |
| LIV-041 | Build-a-Room | Asset-first prep for multi-zone and theater endgame |
| LIV-045 | Diagnosis | Theater cue/matrix failure checkpoint |
| LIV-046 | IR / Listening | Theater response and room character checkpoint |
| LIV-050 | Final Diagnosis / Commissioning | Final applied troubleshooting board rather than another cable-density board |

## Difficulty Design Rules

- Build boards from available assets first, then write route validation against explicit jacks.
- Represent both sides of stereo L/R paths and validate them as a pair.
- Increase difficulty through system decisions: aux vs bus vs matrix vs split vs processor vs distributed zone.
- Use false-route traps intentionally: wrong matrix outs; bus outs; main outs; monitor outs; record outs; sidechain; link; network; control ports.
- Preserve visible labels for all teachable jacks so player errors are legible rather than arbitrary.
