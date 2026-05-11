# Live Sound Board Build Order

## Policy

- Do not convert non-patch levels into native patch boards.
- Build patch boards from the manifest: source nodes, equipment, generated jacks, false jacks, then layout.
- Enforce stereo pair completeness before visual polish.
- No board-specific source may be manually injected after render.

## Suggested patch-board build order

- LIV-002 - Vocal wedge mix 2 (2 required routes; equipment: 16-channel stagebox; FOH console I/O; Stage source stack; Vocal wedge monitor)
- LIV-003 - Stereo IEM send 1 (2 required routes; equipment: FOH console I/O; IEM transmitter)
- LIV-007 - Broadcast split (2 required routes; equipment: Broadcast / recorder I/O; FOH console I/O)
- LIV-009 - Keyboard stereo inputs (2 required routes; equipment: 16-channel stagebox; Stage source stack)
- LIV-006 - Delay tower route (3 required routes; equipment: Delay tower processing; FOH console I/O; System processor / crossover)
- LIV-010 - Main PA amp feed (4 required routes; equipment: FOH console I/O; Main PA amplifier; System processor / crossover)
- LIV-012 - Vocal wedge mix 4 (4 required routes; equipment: 16-channel stagebox; FOH console I/O; Stage source stack; Vocal wedge monitor)
- LIV-015 - Sub matrix feed (4 required routes; equipment: 16-channel stagebox; FOH console I/O; Stage source stack; Sub processor / crossover input; System processor / crossover)
- LIV-016 - Delay tower route (4 required routes; equipment: 16-channel stagebox; Delay tower processing; FOH console I/O; Stage source stack; System processor / crossover)
- LIV-019 - Keyboard stereo inputs (4 required routes; equipment: 16-channel stagebox; Stage source stack)
- LIV-020 - Main PA amp feed (4 required routes; equipment: FOH console I/O; Main PA amplifier; System processor / crossover)
- LIV-011 - Lead Vocal Mic to FOH (5 required routes; equipment: 16-channel stagebox; FOH console I/O; Stage source stack; System processor / crossover)
- LIV-021 - Lead Vocal Mic to FOH (5 required routes; equipment: 16-channel stagebox; FOH console I/O; Stage source stack; System processor / crossover)
- LIV-023 - Stereo IEM send 1 (5 required routes; equipment: 16-channel stagebox; FOH console I/O; IEM transmitter; Stage source stack)
- LIV-030 - Main PA amp feed (5 required routes; equipment: 16-channel stagebox; FOH console I/O; Main PA amplifier; Stage source stack; System processor / crossover)
- LIV-018 - Talkback to monitor system (5 required routes; equipment: 16-channel stagebox; FOH console I/O; In-Ear Monitoring rack; Stage source stack)
- LIV-028 - Talkback to monitor system (5 required routes; equipment: 16-channel stagebox; FOH console I/O; In-Ear Monitoring rack; Stage source stack)
- LIV-025 - Sub matrix feed (6 required routes; equipment: 16-channel stagebox; FOH console I/O; Stage source stack; Sub processor / crossover input; System processor / crossover)
- LIV-026 - Delay tower route (6 required routes; equipment: 16-channel stagebox; Delay tower processing; FOH console I/O; Stage source stack; System processor / crossover)
- LIV-029 - Keyboard stereo inputs (6 required routes; equipment: 16-channel stagebox; FOH console I/O; Stage source stack; System processor / crossover)
- LIV-033 - Stereo IEM send 1 (6 required routes; equipment: 16-channel stagebox; FOH console I/O; IEM transmitter; Stage source stack)
- LIV-034 - Front fill matrix (6 required routes; equipment: 16-channel stagebox; FOH console I/O; Front-fill processor; Stage source stack; System processor / crossover)
- LIV-037 - Broadcast split (6 required routes; equipment: 16-channel stagebox; Broadcast / recorder I/O; FOH console I/O; Stage source stack)
- LIV-039 - Keyboard stereo inputs (6 required routes; equipment: 16-channel stagebox; FOH console I/O; Stage source stack; System processor / crossover)
- LIV-032 - Vocal wedge mix 4 (7 required routes; equipment: 16-channel stagebox; FOH console I/O; Stage source stack; System processor / crossover; Vocal wedge monitor)
- LIV-040 - Main PA amp feed (7 required routes; equipment: 16-channel stagebox; FOH console I/O; Main PA amplifier; Stage source stack; System processor / crossover)
- LIV-038 - Talkback to monitor system (7 required routes; equipment: 16-channel stagebox; FOH console I/O; In-Ear Monitoring rack; Stage source stack; System processor / crossover)
- LIV-043 - Stereo IEM send 1 (8 required routes; equipment: 16-channel stagebox; FOH console I/O; IEM transmitter; Stage source stack; System processor / crossover)
- LIV-047 - Broadcast split (8 required routes; equipment: 16-channel stagebox; Broadcast / recorder I/O; FOH console I/O; Stage source stack; System processor / crossover)
- LIV-049 - Keyboard stereo inputs (8 required routes; equipment: 16-channel stagebox; FOH console I/O; IEM transmitter; Stage source stack; System processor / crossover)
- LIV-042 - Vocal wedge mix 2 (9 required routes; equipment: 16-channel stagebox; FOH console I/O; IEM transmitter; Stage source stack; System processor / crossover; Vocal wedge monitor)
- LIV-044 - Front fill matrix (9 required routes; equipment: 16-channel stagebox; FOH console I/O; Front-fill processor; IEM transmitter; Stage source stack; System processor / crossover)
- LIV-048 - Talkback to monitor system (9 required routes; equipment: 16-channel stagebox; FOH console I/O; IEM transmitter; In-Ear Monitoring rack; Stage source stack; System processor / crossover)

## Non-patch / do-not-convert levels

- LIV-001 - Lead Vocal Mic to FOH
- LIV-004 - Front fill matrix
- LIV-005 - Sub matrix feed
- LIV-008 - Talkback to monitor system
- LIV-013 - Stereo IEM send 1
- LIV-014 - Front fill matrix
- LIV-017 - Broadcast split
- LIV-022 - Vocal wedge mix 2
- LIV-024 - Front fill matrix
- LIV-027 - Broadcast split
- LIV-031 - Lead Vocal Mic to FOH
- LIV-035 - Sub matrix feed
- LIV-036 - Delay tower route
- LIV-041 - Lead Vocal Mic to FOH
- LIV-045 - Sub matrix feed
- LIV-046 - Delay tower route
- LIV-050 - Main PA amp feed