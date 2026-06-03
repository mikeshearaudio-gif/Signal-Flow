# Signal Flow Volume 2 Active Handoff

## Current State
Active project: Signal Flow Live Sound native board rollout.

## Last Locked Board
LIV-021 - Lead Vocal Input + Channel Insert Compressor
Locked cache: v6r498liv021hintboxsizing

## LIV-021 Lock Details
- 101 false/trap jacks baked from audit/liv021-false-hitboxes-final-v2.json.
- 18 good/hint hitboxes baked from audit/liv021-good-hitboxes-final.json.
- False jacks stay hidden before and during Show Hints.
- Show Hints reveals only good nodes.
- Invalid LIV-021 selectable-node routes commit red cables instead of blocking.
- Correct routes validate/checklist/score.
- Bad routes do not complete checklist.

## Next Board Workflow
1. List routes in manifest.
2. Approve/add/remove/change routes.
3. List required gear.
4. Approve/add/remove/change gear.
5. Identify real jacks.
6. Identify false/trap jacks.
7. Check stereo-pair rules.
8. Identify asset needs.
9. Bring up dev tools and begin layout.
