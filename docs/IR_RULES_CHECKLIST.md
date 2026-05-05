# Signal Flow IR Rules Checklist v1.41.16

## Level and scoring
- Use subjective scoring rather than correct/incorrect pass/fail.
- 3 stars = 100 points: “This space matches well. The size and reflections feel natural.”
- 2 stars = 50 points: “This works, but the space feels slightly different in size or material.”
- 1 star = 25 points: “This feels mismatched. The space is too dry or too reflective.”
- Forgiving difficulty: like size and indoor/outdoor grouping should usually be acceptable.
- Plate and Reverse may be selected, but never serve as target/best-fit answers and always score 1 star.

## Visual behavior
- Only the target/example space gets an image.
- The selector shows all 24 IR names as labeled choices.
- Selector must not default to the best-fit answer.
- IR choices should not include thumbnails unless explicitly redesigned later.

## Audio behavior
- Use Flute Solo 1 as the IR reference source/stem.
- Player must be able to preview the selected IR.
- Background music should not mask IR listening levels.
- Placeholder/synthetic processing must be labeled internally as placeholder, not final convolution.

## Game flow
- IR levels are normal levels, not separate subgames.
- Use normal navigation controls and completion flow.
- Submit should complete the level and should not allow point farming.
- Reset should not allow resetting awarded points after submission.
