# Live Sound Manifest Validation


- Parsed LIV levels: 50
- Patch-board levels: 33
- Non-patch / do-not-convert levels: 17
- Required route rows: 274

## Validation notes

- No missing parsed levels or one-sided stereo groups found by this extractor.

## Next review targets

- Confirm non-patch levels are not handed to the native patch renderer.
- Confirm all patch boards use normal source-node creation, not boot-time DOM injection.
- Confirm generated jack families are rendered from equipment, not only from required routes.
- Confirm stereo pair rule is enforced for all L/R or Left/Right routes.