# Live Sound Puzzle Game Roadmap

Status: strategic roadmap, not a mass conversion plan  
Date: 2026-06-29  
Scope: Signal Flow live-sound patch-board levels only

## Decision

LIV-029 should be kept as the first puzzle-game prototype, but it should not be treated as the full pivot. The larger change is a curriculum redesign across applicable live-sound patch-board levels so that players learn signal flow through realistic production goals, constrained patching, meaningful traps, diagnostic feedback, and increasing system complexity.

Do not convert non-patch levels unless a later design review identifies a specific reason. Do not mass-convert the patch-board set until this roadmap is reviewed.

## Source Set

Primary target set from the current patch-board allowlist:

LIV-002, LIV-003, LIV-006, LIV-007, LIV-009, LIV-010, LIV-011, LIV-012, LIV-015, LIV-016, LIV-018, LIV-019, LIV-020, LIV-021, LIV-023, LIV-025, LIV-026, LIV-028, LIV-029, LIV-030, LIV-032, LIV-033, LIV-034, LIV-037, LIV-038, LIV-039.

Audit inputs reviewed:

- `audit/live-sound-canonical-level-summary.csv`
- `audit/live-sound-raw-level-inventory.csv`
- `audit/live-sound-board-equipment-jack-manifest.csv`
- `src/live-sound-native-renderer.js`
- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html`
- `docs/HANDOFF_2026-05-26_LIV019_NATIVE_CABLE_LOCK.md`
- Current LIV-029 prototype board data and renderer behavior

## Current State Audit

Notes:

- "False/trap jacks" means the board currently has known false-jack concepts, unused endpoints, or prototype trap endpoints that can support puzzle design. It does not always mean those traps already have educational route feedback.
- Most boards currently validate correct routes and reject wrong routes, but only LIV-029 has purpose-built educational wrong-route feedback as a prototype.
- Some current titles differ between older canonical audit rows and newer native-renderer boards. The table uses the current/native intent where it is clearer.

| Level | Current title | Current learning goal | Current route type | Puzzle-like now? | False/trap jacks now? | Educational wrong-route feedback? | Build/troubleshooting potential | Recommendation | Puzzle type |
|---|---|---|---|---|---|---|---|---|---|
| LIV-002 | Vocal Wedge Mix | Send a console aux output to a stage monitor wedge. | Single monitor-send chain | Low | Limited candidate traps: main output, wrong aux/matrix, unused inputs | No | Build-from-scratch foundation | Remain simple; add scenario/objective text first | Basic Build |
| LIV-003 | Stereo IEM Send 1 | Patch stereo aux/IEM outputs to the correct IEM input pair. | Stereo monitor pair | Low | Candidate traps: wrong pack input, swapped L/R, main output monitor trap | No | Build-from-scratch with light constraints | Lightly revise; teach stereo pair completeness | Basic Build |
| LIV-006 | Delay Tower Route | Route a matrix/delay feed through processing to a remote speaker zone. | Matrix/processor/amp chain | Medium | Candidate traps: crossed L/R, processor input-to-amp shortcut, wrong aux/matrix | No | Could become constrained or diagnostic | Convert to constrained build after early basics | Constrained Build |
| LIV-007 | Broadcast Split | Feed a broadcast/record path without stealing the main mix or monitor path. | Split/record feed | Medium | Candidate traps: mono/crossed record feed, wrong matrix, main output misuse | No | Could become signal-type puzzle | Add signal-type feedback for record vs PA vs monitor | Signal-Type Puzzle |
| LIV-009 | Drum Kit Stage Inputs | Patch multiple drum sources into the intended stagebox/console inputs. | Source-to-input fan-in | Low | Mostly unused/wrong stagebox inputs | No | Build-from-scratch foundation | Keep mostly simple; use as source-order practice | Basic Build |
| LIV-010 | Main PA Amp Feed | Patch console main outputs through system processing/amplification to speakers. | Main L/R output chain | Medium | Candidate traps: crossed processor L/R, processor bypass, wrong output bus | No | Build-from-scratch with constraints | Convert to constrained build; require processor order | Constrained Build |
| LIV-011 | Lead Vocal Mic to FOH | Route a vocal source into FOH and onward to the PA path. | Source plus output chain | Medium | Candidate traps from combined input/output board | No | Could become constrained build | Lightly revise objective, then add focused traps | Constrained Build |
| LIV-012 | Vocal Wedge Mix 4 | Patch a larger monitor-send scenario with multiple related endpoints. | Monitor aux routing | Medium | Candidate traps: wrong aux/wedge, wrong source side | No | Could become trap-recognition puzzle | Add monitor-specific wrong-route feedback | Trap Recognition |
| LIV-015 | Sub Matrix Feed | Send a matrix/sub/front-fill style feed to the correct zone path. | Matrix/zone feed | Medium | Candidate traps around aux vs matrix vs main outputs | No | Could become signal-type puzzle | Add signal-type labels and feedback | Signal-Type Puzzle |
| LIV-016 | Delay Tower Route | Build a longer remote-zone chain with stage routing and processing. | Delay/zone processing chain | Medium | Candidate traps: wrong processor side, wrong zone, wrong output bus | No | Could become diagnostic | Convert after LIV-006 as harder zone puzzle | Troubleshooting |
| LIV-018 | Talkback to Monitor System | Route talkback into the monitor system without sending it to the audience. | Talkback/monitor path | High concept fit | Candidate traps: talkback to PA, wrong monitor destination | No | Strong troubleshooting candidate | Convert to diagnostic trap-recognition puzzle | Troubleshooting |
| LIV-019 | Drum Inputs, IEM Sends and FX Returns | Combine drum inputs, IEM sends, and FX returns on one locked native board. | Integrated input/monitor/return board | Medium | Candidate traps exist, but board behavior is locked | No | Capstone-style build, not first retrofit | Reserve until generic puzzle behavior is stable | Capstone System Puzzle |
| LIV-020 | Main PA + IEM Monitor Feed | Patch mains, processing, speakers, and a monitor/IEM feed. | Integrated PA plus monitor chain | High | Yes, including unused/false endpoints | No | Capstone build | Reserve as mid-late capstone | Capstone System Puzzle |
| LIV-021 | Lead Vocal Input + Channel Insert Compressor | Patch mic input, insert send/return, PA, and monitor path. | Insert plus output chain | High | Yes, especially insert-direction traps | No | Strong troubleshooting candidate | Convert to diagnostic insert puzzle | Troubleshooting |
| LIV-023 | Monitor Console: Vocal Insert, Stereo IEM, and 3-Way PA | Combine insert, stereo IEM, and multi-way PA routing. | Full integrated system | High | Yes | No | Capstone build | Reserve as advanced capstone | Capstone System Puzzle |
| LIV-025 | Front Fill Zone Feed | Route a local zone/front-fill feed from the correct bus. | Matrix/zone feed | Medium | Yes, zone and bus-confusion traps | No | Good early signal-type puzzle | Convert soon after renderer abstraction | Signal-Type Puzzle |
| LIV-026 | Full Zone Processing | Patch multiple zone-processing paths through the correct equipment order. | Multi-zone processor/amp chain | High | Yes | No | Capstone build | Reserve as processing capstone | Capstone System Puzzle |
| LIV-028 | Talkback to Monitor System | Route talkback/control-room style signals to the right monitoring destination. | Talkback/monitor distribution | High concept fit | Yes | No | Strong diagnostic candidate | Convert after LIV-018 | Troubleshooting |
| LIV-029 | Debate Panel Signal Flow | Build a realistic panel system: wireless audio outs, PA, press feed, and wedge. | Multi-output production system | High | Yes, prototype trap jacks exist | Yes, prototype only | First proof of concept | Keep as first prototype; generalize implementation | Signal-Type Puzzle |
| LIV-030 | Main PA Amp Feed | Reinforce main output to processing/amp/speaker routing. | Main PA output chain | Medium | Candidate traps from PA chain family | No | Build-from-scratch with constraints | Lightly revise, then add processor-order traps | Constrained Build |
| LIV-032 | Vocal Wedge Mix 4 | Larger monitor aux/wedge scenario. | Multi-route monitor build | Medium | Candidate traps from monitor family | No | Could become constrained build | Use after LIV-002/LIV-012 progression | Constrained Build |
| LIV-033 | Stereo IEM Send 1 | Larger stereo IEM path with more endpoint pressure. | Stereo monitor pair/system | Medium | Candidate traps: L/R swap, wrong pack, wrong aux | No | Could become signal-type puzzle | Convert after LIV-003 | Signal-Type Puzzle |
| LIV-034 | Front Fill Matrix | Route front-fill/zone matrix feeds correctly. | Matrix/zone output | Medium | Candidate traps: main vs matrix vs aux confusion | No | Good signal-type puzzle | Convert after LIV-025 | Signal-Type Puzzle |
| LIV-037 | Broadcast Split | Build a more advanced split/record/broadcast path. | Split/record feed | Medium | Candidate traps: record L/R, mono, wrong bus | No | Could become redundancy/failure puzzle | Add production goal and failure-safe constraints | Redundancy/Failure Puzzle |
| LIV-038 | Talkback to Monitor System | Advanced talkback/monitor routing. | Talkback/monitor distribution | High concept fit | Candidate traps: PA leakage, wrong monitor bus | No | Strong diagnostic candidate | Convert after LIV-018/LIV-028 | Troubleshooting |
| LIV-039 | Keyboard Stereo Inputs | Patch stereo keyboard/input routes under greater complexity. | Stereo source-to-input routing | Medium | Candidate traps: swapped L/R, wrong input pair | No | Advanced constrained build | Use as late source/input consolidation | Constrained Build |

## Puzzle Progression Model

The live-sound patch-board curriculum should progress from visible, literal signal direction toward system reasoning under realistic production constraints.

1. Basic signal direction and endpoint literacy
   - Candidate levels: LIV-002, LIV-009
   - Player learns that signals leave outputs and enter inputs, and that source channels must land on specific console/stagebox inputs.

2. Source-to-console and stereo pair discipline
   - Candidate levels: LIV-003, LIV-039
   - Player learns pair integrity, left/right consistency, and why a stereo source or stereo monitor path cannot be patched as two arbitrary mono cables.

3. Console outputs, monitor sends, and auxes
   - Candidate levels: LIV-002, LIV-003, LIV-012, LIV-032, LIV-033
   - Player distinguishes channel inputs, aux outputs, main outputs, and monitor destinations.

4. Matrix feeds, zone sends, processors, and amps
   - Candidate levels: LIV-006, LIV-010, LIV-015, LIV-016, LIV-025, LIV-026, LIV-030, LIV-034
   - Player learns that many outputs are intentionally similar, but the correct choice depends on zone, bus type, and equipment order.

5. Splits, record feeds, press feeds, and wireless/RF vs audio
   - Candidate levels: LIV-007, LIV-029, LIV-037
   - Player learns the difference between RF carrier paths, receiver audio outputs, PA feeds, record feeds, press feeds, and monitor feeds.

6. Troubleshooting and diagnostic correction
   - Candidate levels: LIV-018, LIV-021, LIV-028, LIV-038
   - Player is given symptoms or partial patches, then identifies the wrong signal type, reversed insert direction, wrong bus, or unsafe talkback destination.

7. Full-system capstones
   - Candidate levels: LIV-019, LIV-020, LIV-023, LIV-026
   - Player assembles or repairs systems with multiple simultaneous goals: inputs, monitor feeds, PA outputs, inserts, FX returns, zones, and record/split paths.

## Recommended Puzzle Type Per Level

| Puzzle type | Levels |
|---|---|
| Basic Build | LIV-002, LIV-003, LIV-009 |
| Constrained Build | LIV-006, LIV-010, LIV-011, LIV-030, LIV-032, LIV-039 |
| Trap Recognition | LIV-012 |
| Troubleshooting | LIV-016, LIV-018, LIV-021, LIV-028, LIV-038 |
| Signal-Type Puzzle | LIV-007, LIV-015, LIV-025, LIV-029, LIV-033, LIV-034 |
| Redundancy/Failure Puzzle | LIV-037 |
| Capstone System Puzzle | LIV-019, LIV-020, LIV-023, LIV-026 |

## Proposed Metadata Model

LIV-029 should be generalized into board metadata rather than kept as a one-off renderer exception. The renderer should read optional puzzle metadata from level data and fall back to existing locked-board behavior when metadata is absent.

Example shape:

```json
{
  "puzzleMode": "signal-type",
  "scenario": "You are wiring a four-person debate panel with a PA, moderator wedge, and press recorder feed.",
  "objective": "Deliver all microphone receiver audio to the console, feed the room PA, provide a moderator monitor, and send a clean stereo press feed.",
  "constraints": [
    {
      "id": "rf-is-not-audio",
      "text": "RF antenna outputs cannot be patched directly into console audio inputs.",
      "appliesTo": ["wireless", "console-input"]
    }
  ],
  "routeListVisibility": "partial",
  "educationalFeedback": {
    "defaultWrongRoute": "Trace the signal type first: source audio, console bus, processor input, amplifier output, or speaker input.",
    "routePairs": {
      "rf-antenna-out->console-input-1": "That jack carries RF, not balanced audio. Use the receiver audio output after the wireless receiver demodulates the microphone signal."
    },
    "concepts": {
      "wrong-bus": "This destination needs a dedicated bus, not the main PA output.",
      "reversed-insert": "Insert sends leave the console channel and insert returns come back into it."
    }
  },
  "trapRoutes": [
    {
      "from": "rf-antenna-out",
      "to": "console-input-1",
      "concept": "rf-vs-audio",
      "severity": "teach",
      "message": "RF antenna outputs are not console audio outputs."
    }
  ],
  "completionExplanation": "The receivers convert RF to audio, the console distributes that audio to PA, monitor, and press buses, and each output lands on the correct downstream input.",
  "difficulty": 4,
  "conceptTags": ["wireless", "rf-vs-audio", "press-feed", "monitor-aux", "main-pa"]
}
```

Field recommendations:

- `puzzleMode`: Optional string enum. Suggested values: `basic-build`, `constrained-build`, `trap-recognition`, `troubleshooting`, `signal-type`, `redundancy-failure`, `capstone-system`.
- `scenario`: Production context in plain language. This should replace abstract cable-matching as the player's first mental model.
- `objective`: The job to accomplish. This can be shorter than the route list and may hide exact cable endpoints.
- `constraints`: Data-driven rules, not renderer branches. Examples: "do not use main outs for monitor wedges", "receiver RF is not audio", "processor must sit between console and amps".
- `routeListVisibility`: Suggested values: `full`, `partial`, `objective-only`, `hidden-until-hint`, `diagnostic-partial`.
- `educationalFeedback`: Wrong-route feedback keyed by exact route pair, concept tag, endpoint type, or fallback default.
- `trapRoutes`: Explicit non-valid interactions that should teach a misconception. These should never count as valid routes.
- `completionExplanation`: End-of-level explanation that ties the final patch to the production goal.
- `difficulty`: Numeric or tiered level ordering for curriculum and test coverage.
- `conceptTags`: Stable tags for filtering, analytics, curriculum review, and acceptance tests.

## Canonical Metadata Schema

This roadmap describes curriculum intent and level progression. The implementation contract for future board data, validation, and renderer support lives in `docs/live-sound-puzzle-metadata-schema.md`.

Future puzzle-board work should treat that schema document as the source of truth for accepted enum values, required fields, validation rules, renderer expectations, board-tool expectations, backward compatibility, and the migration path from the LIV-029 prototype to reusable puzzle metadata.

## Renderer and Tooling Plan

All changes should be additive and level-data-driven. Boards without puzzle metadata must behave exactly as they do now.

Required renderer abstractions:

1. Puzzle spec reader
   - Add a generic `getPuzzleSpec(levelId, boardData)` path that returns optional puzzle metadata.
   - Treat absence of `puzzleMode` as legacy board behavior.

2. Generic educational feedback
   - Replace the LIV-029-specific feedback toast with `showEducationalFeedback(feedback, routeAttempt)`.
   - Resolve feedback in this order: exact trap route, exact wrong pair, concept tag, endpoint-type rule, default wrong-route message.
   - Preserve current invalid-route handling for boards without metadata.

3. Trap route registry
   - Treat `trapRoutes` as interactive wrong attempts with neutral visual state before interaction.
   - Trap jacks must not glow, pulse, or present as required routes before the player uses them.
   - Trap routes must never be accepted as completion routes.

4. Hint filtering
   - "Show Hints" must continue to reveal only valid routes and valid jacks.
   - Hints must not reveal false/trap jacks unless a future diagnostic mode explicitly asks the player to inspect a bad existing patch.

5. Route list visibility
   - Add data-driven visibility modes so early levels can show full cable lists while later levels can show objectives, partial routes, or diagnostic symptoms.
   - The route validator must still know all valid routes regardless of what the UI reveals.

6. Diagnostic start states
   - Later troubleshooting levels need optional pre-patched wrong routes, missing routes, or locked good routes.
   - These must be metadata-driven so the same renderer can support build-from-scratch and repair levels.

7. Board-tool validation
   - Extend `tools/live-sound-board-tool.js` so puzzle boards can be audited for:
     - every trap route has feedback
     - trap endpoints do not overlap valid endpoint IDs accidentally
     - every puzzle board has `scenario`, `objective`, `difficulty`, and `conceptTags`
     - `routeListVisibility` is valid
     - hidden routes still have hints and completion checks

8. Locked-board protection
   - Respect the LIV-019 native cable lock guidance: do not change cable drawing, z-index, scroll shell, route hitboxes, or board geometry merely to add puzzle metadata.
   - Any renderer refactor must pass regression checks on currently locked boards before content conversion begins.

## Level-by-Level Recommendations

| Level | Recommendation |
|---|---|
| LIV-002 | Keep as-is mechanically. Add scenario/objective text first. Later add one educational main-output-to-wedge trap only if it teaches aux-vs-main cleanly. |
| LIV-003 | Lightly revise prompt/objective. Teach stereo IEM pair discipline before adding many traps. Add educational feedback for L/R swap and wrong pack input. |
| LIV-006 | Convert to constrained puzzle after metadata support. Require matrix/delay feed through processing; add feedback for processor bypass and wrong bus. |
| LIV-007 | Add false/trap jacks and educational feedback for record feed vs main PA vs monitor. Keep route count manageable. |
| LIV-009 | Keep mostly as-is. Use as early input-order/source-to-console practice. Add scenario language around drum channels before traps. |
| LIV-010 | Convert to constrained puzzle. Add processor-order feedback and prevent direct console-to-speaker thinking. |
| LIV-011 | Lightly revise objective. Add constraints only after LIV-010 proves the PA-chain pattern. |
| LIV-012 | Add educational feedback and a small number of trap jacks around wrong aux/wedge choices. |
| LIV-015 | Convert to signal-type puzzle. Emphasize matrix/zone/sub feed reasoning instead of endpoint matching. |
| LIV-016 | Convert to troubleshooting puzzle later. Use symptoms such as "delay tower has no signal" or "wrong zone is playing." |
| LIV-018 | Convert to troubleshooting puzzle. Focus on talkback leakage and monitor-only destinations. |
| LIV-019 | Reserve as capstone. Do not retrofit until generic puzzle code is stable because this board has locked native-cable behavior. |
| LIV-020 | Reserve as capstone. Use for integrated PA plus monitor reasoning after players know individual pieces. |
| LIV-021 | Convert to troubleshooting puzzle. Insert send/return direction is an ideal educational wrong-route target. |
| LIV-023 | Reserve as advanced capstone with partial route visibility and production goals. |
| LIV-025 | Convert early after LIV-029 abstraction. It is a compact zone-feed signal-type puzzle. |
| LIV-026 | Reserve as processing capstone. Add only after zone and PA-chain puzzles are working. |
| LIV-028 | Convert after LIV-018. Use as more complex talkback/monitor diagnostic scenario. |
| LIV-029 | Keep as first prototype. Refactor its route feedback, trap jacks, and hint exclusions into generic puzzle metadata before copying the pattern. |
| LIV-030 | Lightly revise prompt, then convert to constrained PA-chain build. Use as reinforcement after LIV-010. |
| LIV-032 | Convert after LIV-002/LIV-012. Use as a larger monitor build with limited route visibility. |
| LIV-033 | Convert after LIV-003. Add stereo IEM signal-type feedback and L/R correction. |
| LIV-034 | Convert after LIV-025. Use as a harder front-fill/matrix puzzle. |
| LIV-037 | Convert later as a redundancy/failure puzzle. Production goal should involve maintaining broadcast/record feed correctness under constraints. |
| LIV-038 | Convert after LIV-018/LIV-028. Use advanced talkback troubleshooting. |
| LIV-039 | Convert late as an advanced constrained stereo-input build with pair and channel-order feedback. |

## Implementation Phases

### Phase 1: Define metadata and documentation

- Approve this roadmap or adjust curriculum order.
- Add a formal puzzle metadata schema to the live-sound board data conventions.
- Document puzzle type definitions and route-list visibility modes.
- Pick 3-5 pilot boards after LIV-029 for the first retrofit wave.

### Phase 2: Generalize LIV-029 feedback and puzzle UI

- Move LIV-029-specific feedback behavior into reusable puzzle metadata.
- Replace board-specific feedback functions with a generic resolver.
- Make trap-route interaction, toast rendering, completion explanation, and hint filtering reusable.
- Preserve existing locked board behavior when puzzle metadata is absent.

### Phase 3: Retrofit early levels with scenario/objective text

- Update LIV-002, LIV-003, LIV-009, and LIV-010 with scenario/objective metadata first.
- Keep route lists visible and route counts low.
- Do not add many traps until the player has learned the basic patch grammar.

### Phase 4: Add traps and feedback to mid-level boards

- Add concept-based traps to LIV-006, LIV-007, LIV-012, LIV-015, LIV-025, LIV-030, LIV-033, and LIV-034.
- Every trap must map to a real audio misconception.
- No trap should exist only to surprise the player.

### Phase 5: Add troubleshooting and capstone boards

- Add diagnostic start states to LIV-018, LIV-021, LIV-028, and LIV-038.
- Add partial route visibility and production-goal objectives to LIV-019, LIV-020, LIV-023, and LIV-026.
- Consider LIV-037 for redundancy/failure behavior after split-feed basics are stable.

### Phase 6: Acceptance tests and regression protection

- Add metadata validation in board tooling.
- Add browser smoke tests for:
  - valid route completion
  - wrong-route educational feedback
  - trap jacks remaining neutral before interaction
  - hints revealing only valid routes/jacks
  - legacy boards behaving unchanged
- Add regression protection for locked native cable boards, especially LIV-019 and any current capstone boards.

## Acceptance Criteria

The puzzle pivot is working when:

- Every converted level has an explicit learning objective and production scenario.
- Wrong routes teach the misconception instead of only punishing the player.
- Route complexity increases over time in a curriculum order that players can feel.
- False/trap jacks represent real audio mistakes: wrong signal type, wrong bus, reversed insert, skipped processor, wrong stereo side, or unsafe destination.
- There are no arbitrary gotcha traps.
- Show Hints reveals valid routes and valid jacks only.
- Trap jacks stay visually neutral before interaction.
- LIV-029 behavior is implemented through reusable metadata, not board-specific renderer branches.
- Existing locked level behavior remains stable when puzzle metadata is absent.
- Non-patch levels remain unchanged unless explicitly approved.

## First Conversion Batch After Approval

Recommended first boards after the LIV-029 abstraction is reviewed:

1. LIV-002: simplest scenario/objective retrofit, establishes Basic Build tone.
2. LIV-003: stereo IEM pair discipline with low implementation risk.
3. LIV-006: first constrained matrix/processor chain.
4. LIV-007: first compact split/record signal-type puzzle.
5. LIV-025: compact front-fill/zone signal-type puzzle that can reuse the same feedback model.

Defer LIV-019, LIV-020, LIV-023, and LIV-026 until the renderer abstraction and regression tests are stable.
