# IR System Checklist

## Level structure

- [ ] IR levels use subjective scoring, not binary correct/incorrect answers.
- [ ] Each IR level has one target/example space image.
- [ ] The IR selector shows all 24 labeled IR names.
- [ ] Plate and Reverse remain selectable but never target spaces.
- [ ] Plate and Reverse always score 1 star / 25 points.

## Scoring

- [ ] 3 stars = 100 points.
- [ ] 2 stars = 50 points.
- [ ] 1 star = 25 points.
- [ ] Feedback text uses the locked educational copy:
  - 3 stars: “This space matches well. The size and reflections feel natural.”
  - 2 stars: “This works, but the space feels slightly different in size or material.”
  - 1 star: “This feels mismatched. The space is too dry or too reflective.”
- [ ] Plate/Reverse feedback: “This effect does not represent a natural space.”

## UX

- [ ] Selecting an IR previews the sound.
- [ ] Preview Selected replays the chosen IR.
- [ ] Submit scores once per attempt and disables itself afterward.
- [ ] Reset is only available before submission.
- [ ] Next Board returns control to the wrapper and advances to the next board.

## Distribution

- [ ] `PST-103` is not used as the isolated IR prototype level in navigation.
- [ ] IR levels are distributed across Recording, Live Sound, Broadcast, Post, and Game Audio.
- [ ] IR levels do not replace critical beginner routing levels too early.
