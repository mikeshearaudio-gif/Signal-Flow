# Signal Flow — Live Sound Environment Audit v1
Source inputs: `/mnt/data/live-sound-raw-level-inventory.csv` and `/mnt/data/live-sound-raw-snippets.md`.
This is a manifest-first audit intended to stop reactive per-board debugging. It uses the uploaded raw audit outputs plus the locked native-rollout allowlist/non-patch list from the current Signal Flow part 6 thread.
## Decision
Stop patching LIV-028 directly. Continue only after the Live Sound manifest and generated jack model are committed.
## Locked rollout classification
- Patch-board candidates: 33 levels: LIV-002, LIV-003, LIV-006, LIV-007, LIV-009, LIV-010, LIV-011, LIV-012, LIV-015, LIV-016, LIV-018, LIV-019, LIV-020, LIV-021, LIV-023, LIV-025, LIV-026, LIV-028, LIV-029, LIV-030, LIV-032, LIV-033, LIV-034, LIV-037, LIV-038, LIV-039, LIV-040, LIV-042, LIV-043, LIV-044, LIV-047, LIV-048, LIV-049
- Non-patch / do-not-convert levels: 17 levels: LIV-001, LIV-004, LIV-005, LIV-008, LIV-013, LIV-014, LIV-017, LIV-022, LIV-024, LIV-027, LIV-031, LIV-035, LIV-036, LIV-041, LIV-045, LIV-046, LIV-050
- v1.41.18 wrapper replaces the source slots for LIV-005, LIV-014, LIV-024, LIV-035, and LIV-046 with LIV-IR aliases. Keep those source definitions in the audit, but do not prioritize them as native patch boards.
## Route family inventory
| Route family | Total levels | Patch candidates | Non-patch | Required equipment pattern | Generated jacks / false options |
|---|---:|---:|---:|---|---|
| aux-delay-feed | 1 | 1 | 0 | FOH Console, Delay Tower Processing, Delay, System Processor | Aux outputs 1-4, Delay input, System Processor L/R inputs, Main L/R outputs |
| aux-sub-feed | 1 | 1 | 0 | FOH Console, Crossover / Sub Processor, Sub Input, System Processor | Aux outputs 1-4, Sub input, System Processor L/R inputs, Main L/R outputs |
| broadcast-split | 5 | 3 | 2 | Broadcast Split / Iso Split, Recorder / Stream Feed | Broadcast Split L/R, Record Out L/R, Main L/R false options |
| delay-tower-route | 4 | 2 | 2 | FOH Console, Delay Tower Processor, System Processor | Matrix outputs 1-4, Delay Tower Processor input, FOH Main L/R outputs, System Processor L/R inputs |
| front-fill-matrix | 5 | 2 | 3 | FOH Console, Front Fill Processor, System Processor | Matrix outputs 1-4, Front Fill Processor input, FOH Main L/R outputs, System Processor L/R inputs |
| keyboard-stereo-inputs | 5 | 5 | 0 | Keys L DI, Keys R DI, 16ch Stage Box | Stage Box Inputs 1-16, Keys L/R source nodes, nearby false stagebox inputs 6/9 |
| lead-vocal-to-foh | 5 | 2 | 3 | Lead Vocal Mic, 16ch Stage Box, FOH Console, System Processor | Stage Box Inputs 1-16, FOH Main L/R outputs, System Processor L/R inputs |
| main-pa-amp-feed | 5 | 4 | 1 | FOH Console, System Processor, Main PA Amplifier | FOH Main L/R outputs, System Processor L/R inputs, System Processor L/R outputs, Main PA Amp L/R inputs, processor-to-processor false options |
| stereo-iem-send | 5 | 4 | 1 | FOH Console, IEM Transmitter A | FOH Aux 5 L/R outputs, IEM TX A L/R inputs, Main L/R false options |
| sub-matrix-feed | 4 | 1 | 3 | FOH Console, Sub Processor / Crossover, System Processor | Matrix outputs 1-4, Sub Processor input, FOH Main L/R outputs, System Processor L/R inputs |
| talkback-monitor-system | 5 | 4 | 1 | Talkback Mic, Lead Vocal Mic, Keys L DI, Keys R DI, 16ch Stage Box, FOH Console, In-Ear Monitoring Rack | Stage Box Inputs 1-16, FOH Talkback output, IEM A/B inputs, FOH Main L/R false options, FOH Aux outputs false options |
| vocal-wedge-mix | 5 | 4 | 1 | Lead Vocal Mic, 16ch Stage Box, FOH Console, Vocal Wedge | Stage Box Inputs 1-16, FOH Aux outputs 1-8, Vocal Wedge input, FOH Main L/R false options |

## Board construction laws pulled from the audit
1. Build source nodes from the manifest only. No board-specific injected DOM source nodes. LIV-028 Talkback Mic failed because it was visible but not a real source-node path.
2. Generate jacks from equipment, not just required routes. A 16ch stagebox must expose all visible/false stagebox jacks, even when the checklist only needs inputs 1, 7, 8, or 14.
3. Apply stereo pair completeness globally. Any route touching L/R must include both sides in checklist, validation, hints, labels, and acceptance tests.
4. Separate visual asset layer, cable layer, and node/hitbox layer. Cables should render above hardware artwork but below active source/jack nodes and hint overlays.
5. Treat native rollout allowlist as the gate. Non-patch levels can still have required route data in the source, but must not receive native patch UI unless intentionally redesigned.

## Immediate LIV-028 conclusion
LIV-028 should not be fixed by further one-off helpers. Its Talkback Mic must be added to the normal manifest source list, the stagebox/IEM/FOH jacks must be generated from equipment definitions, and cable layering must be handled in the shared native renderer.

## Draft per-level manifest
| Level | Status | Family | Required routes draft | Audit notes |
|---|---|---|---|---|
| LIV-001 | Non-patch | lead-vocal-to-foh | Lead Vocal Mic -> Stage Box Input 1; Main L Output -> System Processor L In; Main R Output -> System Processor R In | Uploaded raw snippets show Main L in several places; manifest must add/check Main R by stereo-pair rule. Do not apply LIV-025/LIV-026 native patch renderer to this level until non-patch training mode is explicitly designed. |
| LIV-002 | Patch | vocal-wedge-mix | Lead Vocal Mic -> Stage Box Input 1; FOH Aux 1 Output -> Vocal Wedge Input |  |
| LIV-003 | Patch | stereo-iem-send | FOH Aux 5 L Output -> IEM TX A Left Input; FOH Aux 5 R Output -> IEM TX A Right Input |  |
| LIV-004 | Non-patch | front-fill-matrix | Matrix 1 Output -> Front Fill Processor Input; Main L Output -> System Processor L In; Main R Output -> System Processor R In | Uploaded raw snippets show Main L in several places; manifest must add/check Main R by stereo-pair rule. Do not apply LIV-025/LIV-026 native patch renderer to this level until non-patch training mode is explicitly designed. |
| LIV-005 | Non-patch | sub-matrix-feed | Matrix 2 Output -> Sub Processor Input; Main L Output -> System Processor L In; Main R Output -> System Processor R In | Wrapper slot replaced by LIV-IR alias; keep source level but do not prioritize native board. Uploaded raw snippets show Main L in several places; manifest must add/check Main R by stereo-pair rule. Do not apply LIV-025/LIV-026 native patch renderer to this level until non-patch training mode is explicitly designed. |
| LIV-006 | Patch | delay-tower-route | Matrix 3 Output -> Delay Tower Processor Input; Main L Output -> System Processor L In; Main R Output -> System Processor R In | Uploaded raw snippets show Main L in several places; manifest must add/check Main R by stereo-pair rule. |
| LIV-007 | Patch | broadcast-split | Broadcast Split L -> Record Out L; Broadcast Split R -> Record Out R |  |
| LIV-008 | Non-patch | talkback-monitor-system | Talkback Mic -> Stage Box Input 14; Talkback Output -> In-Ear B In; Lead Vocal Mic -> Stage Box Input 1; Keys L DI -> Stage Box Input 7; Keys R DI -> Stage Box Input 8 | No manual Talkback Mic injection; source node must be created through normal source-node path. Do not apply LIV-025/LIV-026 native patch renderer to this level until non-patch training mode is explicitly designed. |
| LIV-009 | Patch | keyboard-stereo-inputs | Keys L DI -> Stage Box Input 7; Keys R DI -> Stage Box Input 8 |  |
| LIV-010 | Patch | main-pa-amp-feed | Main L Output -> System Processor L In; Main R Output -> System Processor R In; System Processor L Out -> Main PA Amp L In; System Processor R Out -> Main PA Amp R In |  |
| LIV-011 | Patch | lead-vocal-to-foh | Lead Vocal Mic -> Stage Box Input 11; Main L Output -> System Processor L In; Main R Output -> System Processor R In | Uploaded raw snippets show Main L in several places; manifest must add/check Main R by stereo-pair rule. |
| LIV-012 | Patch | vocal-wedge-mix | Lead Vocal Mic -> Stage Box Input 1; FOH Aux 1 Output -> Vocal Wedge Input |  |
| LIV-013 | Non-patch | stereo-iem-send | FOH Aux 5 L Output -> IEM TX A Left Input; FOH Aux 5 R Output -> IEM TX A Right Input | Do not apply LIV-025/LIV-026 native patch renderer to this level until non-patch training mode is explicitly designed. |
| LIV-014 | Non-patch | front-fill-matrix | Matrix 1 Output -> Front Fill Processor Input; Main L Output -> System Processor L In; Main R Output -> System Processor R In | Wrapper slot replaced by LIV-IR alias; keep source level but do not prioritize native board. Uploaded raw snippets show Main L in several places; manifest must add/check Main R by stereo-pair rule. Do not apply LIV-025/LIV-026 native patch renderer to this level until non-patch training mode is explicitly designed. |
| LIV-015 | Patch | sub-matrix-feed | Matrix 2 Output -> Sub Processor Input; Main L Output -> System Processor L In; Main R Output -> System Processor R In | Uploaded raw snippets show Main L in several places; manifest must add/check Main R by stereo-pair rule. |
| LIV-016 | Patch | delay-tower-route | Matrix 3 Output -> Delay Tower Processor Input; Main L Output -> System Processor L In; Main R Output -> System Processor R In | Uploaded raw snippets show Main L in several places; manifest must add/check Main R by stereo-pair rule. |
| LIV-017 | Non-patch | broadcast-split | Broadcast Split L -> Record Out L; Broadcast Split R -> Record Out R | Do not apply LIV-025/LIV-026 native patch renderer to this level until non-patch training mode is explicitly designed. |
| LIV-018 | Patch | talkback-monitor-system | Talkback Mic -> Stage Box Input 14; Talkback Output -> In-Ear B In; Lead Vocal Mic -> Stage Box Input 1; Keys L DI -> Stage Box Input 7; Keys R DI -> Stage Box Input 8 | No manual Talkback Mic injection; source node must be created through normal source-node path. |
| LIV-019 | Patch | keyboard-stereo-inputs | Keys L DI -> Stage Box Input 7; Keys R DI -> Stage Box Input 8 |  |
| LIV-020 | Patch | main-pa-amp-feed | Main L Output -> System Processor L In; Main R Output -> System Processor R In; System Processor L Out -> Main PA Amp L In; System Processor R Out -> Main PA Amp R In |  |
| LIV-021 | Patch | lead-vocal-to-foh | Lead Vocal Mic -> Stage Box Input 9; Main L Output -> System Processor L In; Main R Output -> System Processor R In | Uploaded raw snippets show Main L in several places; manifest must add/check Main R by stereo-pair rule. |
| LIV-022 | Non-patch | vocal-wedge-mix | Lead Vocal Mic -> Stage Box Input 1; FOH Aux 1 Output -> Vocal Wedge Input | Do not apply LIV-025/LIV-026 native patch renderer to this level until non-patch training mode is explicitly designed. |
| LIV-023 | Patch | stereo-iem-send | FOH Aux 5 L Output -> IEM TX A Left Input; FOH Aux 5 R Output -> IEM TX A Right Input |  |
| LIV-024 | Non-patch | front-fill-matrix | Matrix 1 Output -> Front Fill Processor Input; Main L Output -> System Processor L In; Main R Output -> System Processor R In | Wrapper slot replaced by LIV-IR alias; keep source level but do not prioritize native board. Uploaded raw snippets show Main L in several places; manifest must add/check Main R by stereo-pair rule. Do not apply LIV-025/LIV-026 native patch renderer to this level until non-patch training mode is explicitly designed. |
| LIV-025 | Patch | aux-sub-feed | Aux 2 Output -> Sub Input; Main L Output -> System Processor L In; Main R Output -> System Processor R In | Uploaded raw snippets show Main L in several places; manifest must add/check Main R by stereo-pair rule. |
| LIV-026 | Patch | aux-delay-feed | Aux 3 Output -> Delay; Main L Output -> System Processor L In; Main R Output -> System Processor R In | Uploaded raw snippets show Main L in several places; manifest must add/check Main R by stereo-pair rule. |
| LIV-027 | Non-patch | broadcast-split | Broadcast Split L -> Record Out L; Broadcast Split R -> Record Out R | Do not apply LIV-025/LIV-026 native patch renderer to this level until non-patch training mode is explicitly designed. |
| LIV-028 | Patch | talkback-monitor-system | Talkback Mic -> Stage Box Input 14; Talkback Output -> In-Ear B In; Lead Vocal Mic -> Stage Box Input 1; Keys L DI -> Stage Box Input 7; Keys R DI -> Stage Box Input 8 | No manual Talkback Mic injection; source node must be created through normal source-node path. |
| LIV-029 | Patch | keyboard-stereo-inputs | Keys L DI -> Stage Box Input 7; Keys R DI -> Stage Box Input 8 |  |
| LIV-030 | Patch | main-pa-amp-feed | Main L Output -> System Processor L In; Main R Output -> System Processor R In; System Processor L Out -> Main PA Amp L In; System Processor R Out -> Main PA Amp R In |  |
| LIV-031 | Non-patch | lead-vocal-to-foh | Lead Vocal Mic -> Stage Box Input 5; Main L Output -> System Processor L In; Main R Output -> System Processor R In | Uploaded raw snippets show Main L in several places; manifest must add/check Main R by stereo-pair rule. Do not apply LIV-025/LIV-026 native patch renderer to this level until non-patch training mode is explicitly designed. |
| LIV-032 | Patch | vocal-wedge-mix | Lead Vocal Mic -> Stage Box Input 1; FOH Aux 1 Output -> Vocal Wedge Input |  |
| LIV-033 | Patch | stereo-iem-send | FOH Aux 5 L Output -> IEM TX A Left Input; FOH Aux 5 R Output -> IEM TX A Right Input |  |
| LIV-034 | Patch | front-fill-matrix | Matrix 1 Output -> Front Fill Processor Input; Main L Output -> System Processor L In; Main R Output -> System Processor R In | Uploaded raw snippets show Main L in several places; manifest must add/check Main R by stereo-pair rule. |
| LIV-035 | Non-patch | sub-matrix-feed | Matrix 2 Output -> Sub Processor Input; Main L Output -> System Processor L In; Main R Output -> System Processor R In | Wrapper slot replaced by LIV-IR alias; keep source level but do not prioritize native board. Uploaded raw snippets show Main L in several places; manifest must add/check Main R by stereo-pair rule. Do not apply LIV-025/LIV-026 native patch renderer to this level until non-patch training mode is explicitly designed. |
| LIV-036 | Non-patch | delay-tower-route | Matrix 3 Output -> Delay Tower Processor Input; Main L Output -> System Processor L In; Main R Output -> System Processor R In | Uploaded raw snippets show Main L in several places; manifest must add/check Main R by stereo-pair rule. Do not apply LIV-025/LIV-026 native patch renderer to this level until non-patch training mode is explicitly designed. |
| LIV-037 | Patch | broadcast-split | Broadcast Split L -> Record Out L; Broadcast Split R -> Record Out R |  |
| LIV-038 | Patch | talkback-monitor-system | Talkback Mic -> Stage Box Input 14; Talkback Output -> In-Ear B In; Lead Vocal Mic -> Stage Box Input 1; Keys L DI -> Stage Box Input 7; Keys R DI -> Stage Box Input 8 | No manual Talkback Mic injection; source node must be created through normal source-node path. |
| LIV-039 | Patch | keyboard-stereo-inputs | Keys L DI -> Stage Box Input 7; Keys R DI -> Stage Box Input 8 |  |
| LIV-040 | Patch | main-pa-amp-feed | Main L Output -> System Processor L In; Main R Output -> System Processor R In; System Processor L Out -> Main PA Amp L In; System Processor R Out -> Main PA Amp R In |  |
| LIV-041 | Non-patch | lead-vocal-to-foh | Lead Vocal Mic -> Stage Box Input 5; Main L Output -> System Processor L In; Main R Output -> System Processor R In | Uploaded raw snippets show Main L in several places; manifest must add/check Main R by stereo-pair rule. Do not apply LIV-025/LIV-026 native patch renderer to this level until non-patch training mode is explicitly designed. |
| LIV-042 | Patch | vocal-wedge-mix | Lead Vocal Mic -> Stage Box Input 1; FOH Aux 1 Output -> Vocal Wedge Input |  |
| LIV-043 | Patch | stereo-iem-send | FOH Aux 5 L Output -> IEM TX A Left Input; FOH Aux 5 R Output -> IEM TX A Right Input |  |
| LIV-044 | Patch | front-fill-matrix | Matrix 1 Output -> Front Fill Processor Input; Main L Output -> System Processor L In; Main R Output -> System Processor R In | Uploaded raw snippets show Main L in several places; manifest must add/check Main R by stereo-pair rule. |
| LIV-045 | Non-patch | sub-matrix-feed | Matrix 2 Output -> Sub Processor Input; Main L Output -> System Processor L In; Main R Output -> System Processor R In | Uploaded raw snippets show Main L in several places; manifest must add/check Main R by stereo-pair rule. Do not apply LIV-025/LIV-026 native patch renderer to this level until non-patch training mode is explicitly designed. |
| LIV-046 | Non-patch | delay-tower-route | Matrix 3 Output -> Delay Tower Processor Input; Main L Output -> System Processor L In; Main R Output -> System Processor R In | Wrapper slot replaced by LIV-IR alias; keep source level but do not prioritize native board. Uploaded raw snippets show Main L in several places; manifest must add/check Main R by stereo-pair rule. Do not apply LIV-025/LIV-026 native patch renderer to this level until non-patch training mode is explicitly designed. |
| LIV-047 | Patch | broadcast-split | Broadcast Split L -> Record Out L; Broadcast Split R -> Record Out R |  |
| LIV-048 | Patch | talkback-monitor-system | Talkback Mic -> Stage Box Input 14; Talkback Output -> In-Ear B In; Lead Vocal Mic -> Stage Box Input 1; Keys L DI -> Stage Box Input 7; Keys R DI -> Stage Box Input 8 | No manual Talkback Mic injection; source node must be created through normal source-node path. |
| LIV-049 | Patch | keyboard-stereo-inputs | Keys L DI -> Stage Box Input 7; Keys R DI -> Stage Box Input 8 |  |
| LIV-050 | Non-patch | main-pa-amp-feed | Main L Output -> System Processor L In; Main R Output -> System Processor R In; System Processor L Out -> Main PA Amp L In; System Processor R Out -> Main PA Amp R In | Do not apply LIV-025/LIV-026 native patch renderer to this level until non-patch training mode is explicitly designed. |

## Next implementation step
Create `src/live-sound-level-manifest.js` from this CSV and have the native renderer consume manifest objects instead of scattered level-specific helper code. Then run a manifest acceptance harness before touching visual layout.
