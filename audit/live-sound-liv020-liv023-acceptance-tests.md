# LIV-020 to LIV-023 Acceptance Tests

Planning date: 2026-05-28

Scope: acceptance criteria for future implementation. These tests describe expected behavior after assets, level data, route validation, and renderer work are intentionally implemented. This file does not authorize runtime changes by itself.

## Global Batch Acceptance

- Game boots through the active wrapper and raw game paths.
- No old LIV-019 runtime finalizer script or cable-center markers return.
- Scroll affordance remains passive cue-only and does not alter wheel physics or scroll positions.
- Build-a-Room behavior remains owned by the locked Build-a-Room renderer.
- No monitor-world board uses reactive DOM patches, broad overlays, or post-render correction scripts as its primary construction method.
- Every required route endpoint has a visible jack or clear diagnosis callout.
- Every false/trap jack is visibly labeled and fair.
- Mono boards remain mono unless a future design explicitly promotes a route to L/R.
- If any L/R route is introduced later, both sides must be visible and validated as a pair.

## LIV-020 Acceptance - Multiple Mono IEM Packs

Board load:
- LIV-020 opens as a patch board.
- The board shows a monitor/FOH aux output panel and five mono IEM pack destinations.
- The board remains readable at the default viewport without requiring hidden labels for core jacks.

Required visible labels:
- FOH Aux 1 Output through FOH Aux 5 Output.
- IEM 1 Input through IEM 5 Input.
- Main L Output, Main R Output, Bus 1 Output, Bus 2 Output, Record Out L, Record Out R.
- RF, Network, Link, or Service labels on non-audio trap ports.

Route validation:
- Aux 1 Output to IEM 1 Input validates.
- Aux 2 Output to IEM 2 Input validates.
- Aux 3 Output to IEM 3 Input validates.
- Aux 4 Output to IEM 4 Input validates.
- Aux 5 Output to IEM 5 Input validates.
- Aux output to the wrong IEM pack fails with a destination mismatch explanation.
- Main, bus, and record outputs to IEM inputs fail with an output-family explanation.
- Aux output to RF/network/link/service ports fails with a non-audio-port explanation.

Completion/scoring:
- Checklist completes only when all five intended routes are made.
- Score updates once per correct route.
- Repeated correct routes should not double-score.
- Clearing the board resets visible routes and checklist state according to existing game conventions.

Regression watch:
- LIV-019 cable lock remains unchanged.
- No scroll behavior changes are required for this board beyond existing shared behavior.

## LIV-021 Acceptance - Wedge Versus Sidefill Intent

Board load:
- LIV-021 opens as a patch board.
- The board visually separates vocal wedge, guitar wedge, and sidefill destination families.
- Sidefill art does not look like the main PA or a floor wedge.

Required visible labels:
- FOH Aux 1 Output, FOH Aux 2 Output, FOH Aux 3 Output.
- Vocal Wedge Input.
- Guitar Wedge Input.
- Sidefill Input.
- Main L Output, Main R Output, Record Out L, Record Out R.
- Wedge Thru, Sidefill Link, and Service labels where traps exist.

Route validation:
- Aux 1 Output to Vocal Wedge Input validates.
- Aux 2 Output to Guitar Wedge Input validates.
- Aux 3 Output to Sidefill Input validates.
- Aux 1 Output to Sidefill Input fails as wrong destination intent.
- Aux 3 Output to a wedge input fails as wrong destination intent.
- Main or record output to any monitor destination fails as wrong output family.
- Link/thru/service ports fail as wrong jack type.

Completion/scoring:
- Completion requires all three intended monitor routes.
- Feedback distinguishes wrong output family from wrong destination family.
- No stereo-pair completion is required.

Regression watch:
- Board should not require matrix routing.
- Board should not require split/broadcast assets.

## LIV-022 Acceptance - Wrong Bus Diagnosis

Board load:
- LIV-022 opens as diagnosis-only.
- The player sees a symptom: performer hears the wrong mix.
- The board presents expected and actual monitor-send evidence without asking the player to draw patch cables.

Required visible labels/callouts:
- Symptom: Vocalist hears band mix, not vocal mix.
- Expected: Aux 2 Vocal Mix.
- Actual: Bus 1 Band Mix.
- Performer IEM Input.
- Answer options or evidence families: Aux, Bus, Main, Record, RF/Network, Level.

Diagnosis validation:
- Correct answer identifies Bus 1 feeding the performer instead of Aux 2.
- Correct fix recommendation says to feed the performer from Aux 2 Output.
- Blaming main PA output fails.
- Blaming record feed fails.
- Blaming RF/network port fails.
- Choosing a level/volume fix fails because the route family is wrong.

Completion/scoring:
- Completion occurs when the correct fault/fix is selected.
- No patch-board cable completion is required.
- Incorrect answers give explanatory feedback by route family.

Regression watch:
- Diagnosis UI and answer logic should remain owned by existing diagnosis systems.
- No patch-board route validation should be added solely for LIV-022.

## LIV-023 Acceptance - Drum Fill Sidefill Vocal Wedge

Board load:
- LIV-023 opens as a patch board.
- The board shows drum fill, sidefill, and vocal wedge as distinct destinations.
- The drum source area may use existing drum art as context, but the required destination is the drum fill input.

Required visible labels:
- Monitor Aux 1 Output, Monitor Aux 2 Output, Monitor Aux 3 Output.
- Drum Fill Input.
- Sidefill Input.
- Vocal Wedge Input.
- Main L Output, Main R Output, Record Out L, Record Out R.
- Drum Fill Thru, Sidefill Link, Vocal Wedge Thru, Service where traps exist.

Route validation:
- Aux 1 Output to Drum Fill Input validates.
- Aux 2 Output to Sidefill Input validates.
- Aux 3 Output to Vocal Wedge Input validates.
- Aux 1 Output to Sidefill Input fails as drummer mix to wrong destination.
- Aux 2 Output to Vocal Wedge Input fails as sidefill send to wrong destination.
- Aux 3 Output to Drum Fill Input fails as vocal mix to wrong destination.
- Main or record output to monitor destination fails as wrong output family.
- Thru/link/service ports fail as wrong jack type.

Completion/scoring:
- Completion requires all three intended routes.
- Correct route feedback should mention role or destination intent.
- No stereo-pair completion is required.

Regression watch:
- Board should not feel like a matrix board.
- Do not introduce split/record routing as required behavior.

## Manual QA Checklist for Implementation Handoff

- Load LIV-020, complete all five IEM routes, verify score/checklist.
- On LIV-020, try one main-out trap, one bus trap, one RF/network trap, and one wrong-pack trap.
- Load LIV-021, complete the two wedges and one sidefill route.
- On LIV-021, intentionally swap sidefill and wedge destinations and verify fair feedback.
- Load LIV-022, choose the wrong bus diagnosis and verify completion.
- On LIV-022, try at least two wrong diagnosis choices and verify feedback.
- Load LIV-023, complete drum fill, sidefill, and vocal wedge routes.
- On LIV-023, try one role mismatch and one link/thru trap.
- Navigate away and back to each board; board state should follow existing Signal Flow behavior.
- Confirm no old LIV-019 full-cable runtime finalizer path appears in console.
