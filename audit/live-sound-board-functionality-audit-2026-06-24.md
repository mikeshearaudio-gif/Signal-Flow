# Live Sound Board Functionality Audit

Date: 2026-06-24

Scope: LIV-001 through LIV-050, based on static repo inspection plus recent manual validation notes from the Signal Flow handoff thread. This is not a full browser playtest. Items marked as needing manual QA should be treated as implemented or present in code, but not proven clean by this audit alone.

Sources checked:

- `audit/live-sound-canonical-level-summary.csv`
- `audit/live-sound-canonical-route-manifest.csv`
- `audit/live-sound-remaining-board-roadmap.md`
- `audit/live-sound-liv020-liv023-detailed-manifest.md`
- `audit/live-sound-liv015-implementation-checklist.md`
- `src/live-sound-native-renderer.js`
- `patch/sf-build-room-renderer.js`
- active launch includes in `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`

Current active runtime locks observed:

- Native renderer cache: `live-sound-native-renderer.js?v=6r669liv015hitboxaspect`
- Build-a-Room renderer include: `sf-build-room-renderer.js?v=6r286buildroombalance`
- LIV-018 scroll shell: `sf-liv018-scroll-shell.js?v=6r376`
- LIV-019 scroll shell: `sf-liv019-scroll-shell.js?v=6r389`
- LIV-019 hitbox lock: `sf-liv019-hitbox-final-lock.js?v=6r408q2`
- LIV-019 clean finalizer: `sf-liv019-clean-finalizer-v6r421.js?v=6r421q2`
- LIV-019 cable kit: `sf-live-cable-mode-kit.js?v=6r426`
- Scroll affordance: `sf-scroll-affordance.js?v=6r292`
- No active `sf-liv019-runtime-finalizer.js`, `cableCenterSource`, or `native-cableLayer-rendered-locked-hitbox-center` references were found in active launch/src/patch grep output.

## Status Key

- Functioning / high confidence: recently validated by user reports and supported by current includes/code.
- Implemented / needs smoke QA: native or build-room code exists, but manual route/visual QA is still needed.
- Regression-sensitive: known fixed area with many locks, scroll/cable/hitbox risks, or recent breakage history.
- Partial / in progress: scaffold or manifest exists, but gameplay should not be considered finished.
- Planned / not built: canonical or roadmap entry exists, but no dedicated current native implementation was found.
- Legacy / non-patch: present in canonical launcher data as quiz, diagnosis, IR/listening, or old training content; may load, but it is not part of the current native patch-board build path.

## Summary

The repo currently has canonical metadata for all 50 Live Sound boards, but dedicated native patch-board specs in `src/live-sound-native-renderer.js` only for:

`LIV-002`, `LIV-003`, `LIV-006`, `LIV-007`, `LIV-009`, `LIV-010`, `LIV-011`, `LIV-012`, `LIV-015`, `LIV-016`, `LIV-018`, `LIV-019`, `LIV-020`, `LIV-021`, `LIV-023`, `LIV-025`, `LIV-026`, `LIV-028`, `LIV-029`.

Patch boards listed in canonical data but missing native specs are:

`LIV-030`, `LIV-032`, `LIV-033`, `LIV-034`, `LIV-037`, `LIV-038`, `LIV-039`, `LIV-040`, `LIV-042`, `LIV-043`, `LIV-044`, `LIV-047`, `LIV-048`, `LIV-049`.

Build-a-Room renderer support exists for build-room style boards, with roadmap emphasis on `LIV-004`, `LIV-013`, `LIV-027`, and `LIV-041`. Those should still be manually checked because stale build-room shell state has broken normal board rendering before.

## Board-by-Board Status

| Level | Type / current source | Status | What appears correct | What is not correct / risk | Recommended next check |
| --- | --- | --- | --- | --- | --- |
| LIV-001 | Legacy / non-patch canonical build-room-style starter | Legacy / non-patch | Canonical route metadata exists with 3 required routes. | Not in native renderer spec set; current intended ownership unclear. | Smoke load from wrapper and decide whether to keep as legacy training or rebuild. |
| LIV-002 | Native patch board | Functioning / high confidence | Earlier boot recovery notes confirmed native surface selection and mount. Native spec exists. | No recent visual screenshot audit in this pass. | Quick route smoke for both required routes. |
| LIV-003 | Native patch board | Functioning / high confidence | Earlier boot recovery notes confirmed it mounts. Native spec exists. | Stereo-pair behavior should be checked visually. | Test both stereo IEM routes and checklist completion. |
| LIV-004 | Build-a-Room | Functioning but regression-sensitive | Build-a-Room renderer is actively included; prior stale shell issue was fixed by clearing build-room mode when leaving Build-a-Room. | Scroll indicators and build-room shell ownership have been fragile; future roadmap concept differs from old canonical title. | Load LIV-004, submit/reset gear controls, navigate away to LIV-019/LIV-020, confirm normal boards still mount. |
| LIV-005 | Legacy / non-patch canonical | Legacy / non-patch | Canonical metadata exists with 3 required routes. | Not in native renderer spec set; likely old/training flow rather than current patch board. | Decide whether to preserve, convert, or replace with diagnosis/listening flow. |
| LIV-006 | Native patch board | Functioning / high confidence | Valid route `foh-liv006-bus-3-output-to-liv006-delay-tower-processor-input` is a locked preservation target. Native spec exists. | Shares assets/keys with LIV-015, so regressions can happen when LIV-015 is edited. | Test Bus 3 Output to Delay Tower Processor Input after LIV-015 changes. |
| LIV-007 | Native patch board | Implemented / needs smoke QA | Native spec exists. | No recent manual validation captured in this audit. | Load and validate broadcast split routes, cable colors, and checklist. |
| LIV-008 | Legacy / diagnosis canonical | Legacy / non-patch | Canonical diagnosis/training metadata exists. | Not in native renderer spec set; current diagnosis behavior not audited here. | Smoke diagnosis UI if this remains in active level path. |
| LIV-009 | Native patch board | Implemented / regression-sensitive | Dedicated drum/keyboard renderer sections and hint/cable cleanup exist. | Many bespoke visual-layer comments indicate previous alignment/layering work. | Test stereo DI routes and hint visibility. |
| LIV-010 | Native patch board | Implemented / regression-sensitive | Dedicated vertical locked renderer exists. | Scroll behavior was part of recent repair work; needs visual QA. | Test full route set, vertical scroll, and cue behavior. |
| LIV-011 | Native patch board | Implemented / needs smoke QA | Native spec exists; cleanup include exists. | Needs check after native renderer/cache changes. | Route all 5 required items; verify labels and SFX remain normal. |
| LIV-012 | Native patch board | Implemented / needs smoke QA | Native spec exists; shares wedge board behavior with LIV-002/LIV-012 code path. | No recent browser evidence in this pass. | Test all 4 required routes and checklist. |
| LIV-013 | Build-a-Room | Implemented / regression-sensitive | Build-a-Room renderer should support this level family. | Needs manual confirmation against locked build-room layout. | Load, interact, and navigate away/back. |
| LIV-014 | Legacy / non-patch canonical | Legacy / non-patch | Canonical metadata exists. | Not in native renderer spec set. | Decide whether to rebuild or leave as old training content. |
| LIV-015 | Native patch board | Implemented but currently needs manual visual QA | Invalid completed routes now commit red for distinct valid nodes. Valid Bus 2 to Sub Processor route is preserved in code. Current cache is `6r669liv015hitboxaspect`. | Hitbox alignment was just repaired by stagebox aspect correction and still needs browser confirmation. | Test Lead Vocal Mic to Stage Box Input 1, wrong Stage Box input, Bus 2 to Sub Processor, wrong FOH output, and Show Hints. |
| LIV-016 | Native patch board | Implemented / regression-sensitive | PNG full-band renderer and stereo-group handling exist. | Full-band visual and route density need screenshot QA. | Test all 4 routes, stereo grouping, scroll, and cable endpoints. |
| LIV-017 | Legacy / diagnosis canonical | Legacy / non-patch | Canonical diagnosis metadata exists. | Not in native renderer spec set. | Smoke diagnosis route if still active, otherwise mark for rebuild. |
| LIV-018 | Native patch board with special scroll shell | Implemented / regression-sensitive | Dedicated talkback monitor renderer exists; special scroll shell include is active. | Scroll/cue behavior was recently fragile; must remain owned by `sf-liv018-scroll-shell.js`. | Test vertical/horizontal scroll, five routes, hints, and idle scroll cues. |
| LIV-019 | Native patch board with locked cable/hitbox stack | Functioning but regression-sensitive | Clean finalizer, hitbox lock `6r408q2`, cable kit `6r426`, scroll shell, overlay/label locks are active. Old full-cable runtime finalizer is absent. | User recently observed jack placement drift before current lock state; this board remains high-risk. | Full smoke: hitbox 70/70, Kick to Stage Box 1, FOH Aux 1 to IEM 1, Bus 1 to Reverb L, return/fallback, scroll. |
| LIV-020 | Native patch board | Implemented / needs smoke QA | Native monitor-world code, gear/hitbox/label locks, and false jack handling exist. | Canonical title is stale compared with newer roadmap; implementation may be ahead of manifest naming. | Test mono IEM/monitor routes, bad-jack behavior, and labels. |
| LIV-021 | Native patch board | Implemented / regression-sensitive | Dedicated hitbox/cable/false-jack audit exports exist; code has LIV-021-specific false jack handling. | Many repair diffs indicate this was recently unstable. | Test correct routes, false jacks red cables, hint rings, and sidebar to-do completion. |
| LIV-022 | Diagnosis / roadmap monitor fault | Planned / not built as native patch board | Detailed monitor-world diagnosis manifest exists. | No native patch spec; final diagnosis-only behavior still needs implementation/QA. | Build diagnosis board from manifest, not via reactive patches. |
| LIV-023 | Native patch board | Implemented / needs smoke QA | Dedicated native renderer and final layout JSON exports exist. | Needs full visual QA for drum fill, sidefill, and wedge route intent. | Test all 5 routes, false/trap jacks, labels, and scroll/cues. |
| LIV-024 | IR / listening roadmap | Planned / not built | Roadmap concept exists. | No dedicated current implementation found in native renderer. | Define IR/listening assets and acceptance tests before runtime work. |
| LIV-025 | Native patch board | Implemented / regression-sensitive | Processing-family renderer exists; LIV-025 false/true hitbox and forced hint handling exist. | Several post-mount hitbox ensures make it fragile. | Test all 6 processor/sub routes, false jacks, hints, cable endpoints. |
| LIV-026 | Native patch board | Implemented / regression-sensitive | Dedicated complex zone renderer exists with baked true/false hitboxes and invalid red cable persistence comments. | Needs manual QA for all 6 routes and false-route persistence. | Test Aux 3/delay routes, false hitboxes, labels, and scroll. |
| LIV-027 | Build-a-Room roadmap | Partial / needs build-room QA | Build-a-Room renderer can mount build-room levels; roadmap identifies small festival stage package. | Asset-first future concept likely not fully built beyond canonical/build-room shell. | Confirm current gameplay, then compare against roadmap asset needs. |
| LIV-028 | Native patch board | Implemented / regression-sensitive | Talkback renderer/scaffold, true hitboxes, normalled cable manifest, and gear label locks exist. | Code comments show dev scaffold history; must verify it is gameplay-ready. | Test all 5 routes, normalled visual cables, real/false hitboxes, hints. |
| LIV-029 | Native patch board plus board-tool scaffold | Partial / in progress | Native spec exists; `data/live-sound/boards/liv029.json`, normalized manifest, and board tool exist. | Gameplay scaffold appears recent; route/hitbox polish likely not fully proven. | Run board tool validate/summary, then manual route QA for 8 renderer routes / 6 canonical routes mismatch. |
| LIV-030 | Patch roadmap | Planned / not built | Canonical and asset planning rows exist. | Missing native spec. | Build from asset-first manifest before renderer work. |
| LIV-031 | Diagnosis roadmap | Planned / not built | Roadmap calls for stereo IEM left-only diagnosis. | No native patch spec; diagnosis implementation not confirmed. | Build diagnosis content and acceptance tests. |
| LIV-032 | Patch roadmap | Planned / not built | Roadmap: front fills from matrix outputs. | Missing native spec. | Create matrix/front-fill assets and route manifest. |
| LIV-033 | Patch roadmap | Planned / not built | Roadmap: outfills and delay fills. | Missing native spec. | Create matrix/fill destination manifest. |
| LIV-034 | Patch roadmap | Planned / not built | Roadmap: lobby/overflow/backstage feed. | Missing native spec. | Create distributed-zone assets and route validation plan. |
| LIV-035 | IR / listening roadmap | Planned / not built | Roadmap concept exists. | No dedicated current implementation found. | Define listening assets and answer logic. |
| LIV-036 | Quiz / diagnosis roadmap | Planned / not built | Roadmap concept exists for aux vs group vs matrix vs DCA. | No dedicated current implementation confirmed. | Build concept quiz/diagnosis content. |
| LIV-037 | Patch roadmap | Planned / not built | Roadmap: corporate ballroom. | Missing native spec. | Build asset and route manifest before runtime. |
| LIV-038 | Patch roadmap | Planned / not built | Roadmap: house of worship stream/feed. | Missing native spec. | Build stream/broadcast/monitor assets first. |
| LIV-039 | Patch roadmap | Planned / not built | Roadmap: festival guest console/playback/MC. | Missing native spec. | Build split/playback asset plan. |
| LIV-040 | Patch roadmap | Planned / not built | Roadmap: complex matrix zone setup. | Missing native spec. | Build matrix 1-8 patch panel and zone asset family. |
| LIV-041 | Build-a-Room roadmap | Partial / needs build-room QA | Build-a-Room renderer can mount build-room levels; roadmap identifies multi-zone venue design. | Final multi-zone asset/design package likely not built. | Validate current build-room shell, then compare against multi-zone asset requirements. |
| LIV-042 | Patch roadmap | Planned / not built | Roadmap: musical orchestra pit stagebox. | Missing native spec and theater/pit assets. | Asset-first theater/pit manifest. |
| LIV-043 | Patch roadmap | Planned / not built | Roadmap: stage vocals plus pit plus backstage monitor. | Missing native spec. | Build source/destination manifests. |
| LIV-044 | Patch roadmap | Planned / not built | Roadmap: conductor cam/click/cue sends. | Missing native spec. | Define cue/click/video/audio traps. |
| LIV-045 | Diagnosis / quiz roadmap | Planned / not built | Roadmap: musical monitor failure or wrong matrix zone. | No dedicated implementation confirmed. | Build diagnosis case and answer model. |
| LIV-046 | IR / listening roadmap | Planned / not built | Roadmap: theater/room response check. | No dedicated current implementation found. | Define IR assets and answer criteria. |
| LIV-047 | Patch roadmap | Planned / not built | Roadmap: musical full pit monitor setup. | Missing native spec. | Build pit monitor/personal mixer assets. |
| LIV-048 | Patch roadmap | Planned / not built | Roadmap: theater distributed zones. | Missing native spec. | Build theater zone route plan. |
| LIV-049 | Patch capstone roadmap | Planned / not built | Roadmap: full musical with pit, vocals, IEM/wedges, FX, matrix zones. | Missing native spec; depends on multiple asset families. | Do not start until LIV-042 through LIV-048 assets/contracts are stable. |
| LIV-050 | Final diagnosis / commissioning roadmap | Planned / not built | Roadmap: final musical commissioning diagnosis. | No dedicated final diagnosis implementation confirmed. | Build after capstone routing systems exist. |

## Functioning Correctly, Based On Current Evidence

Highest-confidence boards:

- LIV-002: native patch board mounts according to prior boot recovery validation.
- LIV-003: native patch board mounts according to prior boot recovery validation.
- LIV-006: valid delay tower route remains a locked preservation target.
- LIV-019: current active includes show the locked clean finalizer/cable-kit/hitbox stack and old runtime finalizer remains absent.

Functioning but still needs smoke QA:

- LIV-007, LIV-009, LIV-010, LIV-011, LIV-012, LIV-016, LIV-018, LIV-020, LIV-021, LIV-023, LIV-025, LIV-026, LIV-028.

Current active repair board:

- LIV-015: route policy is corrected in code, but the hitbox aspect fix requires manual browser confirmation.

## Not Functioning Or Not Complete Yet

Needs manual confirmation before calling complete:

- LIV-015: hitbox alignment and Show Hints after `6r669liv015hitboxaspect`.
- LIV-018: scroll shell and cue behavior.
- LIV-019: hitbox lock/cable lock after recent placement concerns.
- LIV-021, LIV-023, LIV-025, LIV-026, LIV-028: recent or bespoke false-jack/hitbox/label work.
- LIV-029: native scaffold and board tool exist, but the level should be treated as in progress until route counts, hitboxes, and tool manifest align.

Not currently implemented as dedicated native patch boards:

- LIV-030, LIV-032, LIV-033, LIV-034, LIV-037, LIV-038, LIV-039, LIV-040, LIV-042, LIV-043, LIV-044, LIV-047, LIV-048, LIV-049.

Roadmap / alternate board slots needing implementation work:

- LIV-022, LIV-024, LIV-031, LIV-035, LIV-036, LIV-045, LIV-046, LIV-050.

Legacy / non-patch slots needing product decision:

- LIV-001, LIV-005, LIV-008, LIV-014, LIV-017.

## Immediate QA Queue

1. LIV-015: validate cache `6r669liv015hitboxaspect`; test valid green route, invalid red routes, and centered hitboxes.
2. LIV-019: validate 70/70 hitbox lock, old runtime finalizer absence, endpoint cable lock, scroll, and return/fallback behavior.
3. LIV-018: validate scroll shell ownership, no diagonal wheel regression, route completion, and passive scroll cues.
4. LIV-021 and LIV-023: validate monitor-world false jacks, labels, red/green cables, and checklist state.
5. LIV-025 and LIV-026: validate processor/zone routes and false-hitbox persistence.
6. LIV-028: validate talkback routing and normalled visual cable behavior.
7. LIV-029: reconcile canonical route count, native route count, and board-tool normalized manifest before treating as complete.

## Build Queue After QA

1. Finish/lock LIV-029 or explicitly park it as tool scaffold.
2. Build LIV-030 from asset-first split/broadcast planning.
3. Build matrix-zone rollout: LIV-032 through LIV-040.
4. Build musical/theater rollout: LIV-042 through LIV-049.
5. Build final diagnosis/commissioning: LIV-050.

