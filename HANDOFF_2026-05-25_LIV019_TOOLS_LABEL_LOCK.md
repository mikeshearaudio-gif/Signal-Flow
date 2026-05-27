# Signal Flow LIV-019 Tool / Label Lock — 2026-05-25

Locked working tools:
- Gear Mover: `src/sf-liv019-gear-mover-dev.js?v=6r384`
- Scroll Shell: `src/sf-liv019-scroll-shell.js?v=6r389`
- General Overlay Mover: `src/sf-liv019-overlay-mover-dev.js?v=6r390b`
- Overlay Lock: `src/sf-liv019-overlay-lock.js?v=6r397`
- FOH Label Finalizer / Mover: `src/sf-liv019-foh-label-finalizer.js?v=6r400`
- FOH Label Final Lock: `src/sf-liv019-foh-label-final-lock.js?v=6r401`
- Hitbox Mapper: `src/sf-liv019-hitbox-mapper-dev.js?v=6r401`

LIV-019 current stable direction:
- Keep current gear placement.
- Keep current scroll behavior.
- Keep current IEM / reverb / delay label and LED-frame treatment.
- FOH labels are locked from the v6r400 FOH Label Mover export.
- Old FOH placeholder labels should remain visually muted.
- Drum-kit hitboxes remain; secondary drum source button panel remains hidden.
- Next stage: map actual route hitboxes using the hitbox mapper.
