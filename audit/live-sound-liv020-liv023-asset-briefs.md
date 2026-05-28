# LIV-020 to LIV-023 Asset Art Briefs

Planning date: 2026-05-28

Scope: asset planning briefs only. These assets should be created before renderer or route validation work. Each asset must expose visible jack names that match the route manifest.

## Shared Visual Direction

- Match the existing Live Sound hardware language: dark rack faces, readable tape/label accents, high-contrast jack labels, and realistic but simplified connector shapes.
- Preserve the educational surface: ports should be clear enough that wrong routes feel fair.
- Do not bake validation or behavior into art files. Assets provide visible jack geometry and labels only.
- Use existing connector primitives when possible: XLR, TRS, Speakon, BNC/antenna, RJ45/network, mode switch, level knob.
- Non-audio ports should be visually distinct from audio jacks.

## Asset: `ls_personal_mono_iem_pack`

Recommended output path: `assets/live-sound/svg/hardware/personal-mono-iem-pack.svg`

Needed for: LIV-020, LIV-028, LIV-038

Existing candidate:
- `assets/build-room/svg/gear/iem-receiver-bodypack-teal-led.svg`
- `assets/live-sound/svg/hardware/iem-wireless-rack-front.svg`
- `assets/live-sound/svg/hardware/iem-rack-liv019-five-inputs.svg`

Purpose:
- A small mono personal monitor receiver/pack that can be repeated five times without clutter.

Required jacks/labels:
- `IEM Input`
- `Phones`

False/trap ports:
- `RF`
- `Network`
- `Link`
- `Service`

Art notes:
- Make the audio input visually larger or more central than RF/network/service traps.
- Use numbered label slots when repeated: IEM 1 Input, IEM 2 Input, etc.
- Avoid making RF/network ports look like equivalent audio inputs.

Implementation risk: low. Main risk is clutter when five packs appear on one board.

## Asset: `ls_monitor_console_rack`

Recommended output path: `assets/live-sound/svg/hardware/monitor-console-aux-panel.svg`

Needed for: LIV-020, LIV-021, LIV-023, LIV-029

Existing candidate:
- `assets/live-sound/svg/hardware/foh-console-io-panel.svg`
- `assets/live-sound/svg/hardware/foh-console-liv003-game-style.svg`
- `assets/live-sound/svg/panels/section-foh-console.svg`

Purpose:
- A monitor-world output panel that makes aux sends feel intentional, not like reused FOH mains.

Required jacks/labels:
- `Aux 1 Output`
- `Aux 2 Output`
- `Aux 3 Output`
- `Aux 4 Output`
- `Aux 5 Output`
- Optional later: `Talkback Output`, `Sidefill Output`

False/trap jacks:
- `Main L Output`
- `Main R Output`
- `Bus 1 Output`
- `Bus 2 Output`
- `Record Out L`
- `Record Out R`

Art notes:
- Group aux outputs together in a visually teachable row.
- Separate false traps into clearly labeled but lower-emphasis rows.
- Do not hide bus or record labels; traps must be fair.

Implementation risk: medium. This is a shared foundation asset for several boards.

## Asset: `ls_floor_wedge_monitor`

Recommended output path: `assets/live-sound/svg/hardware/floor-wedge-monitor.svg`

Needed for: LIV-021, LIV-023, LIV-037, LIV-047

Existing candidate:
- `assets/live-sound/svg/hardware/monitor-wedge-input-panel.svg`
- `assets/build-room/svg/gear/stage monitor.svg`
- `assets/live-sound/svg/panels/section-monitor-wedge.svg`

Purpose:
- A clear performer floor wedge destination with a primary audio input and secondary thru/service traps.

Required jacks/labels:
- `Wedge Input`
- Role variants: `Vocal Wedge Input`, `Guitar Wedge Input`

False/trap jacks:
- `Thru`
- `Service`

Art notes:
- The wedge should look physically different from sidefill and main PA.
- Role label should sit close to the input jack.
- Thru should be visible but visually secondary.

Implementation risk: low.

## Asset: `ls_sidefill_stack`

Recommended output path: `assets/live-sound/svg/hardware/sidefill-speaker-stack.svg`

Needed for: LIV-021, LIV-023, LIV-027

Existing candidate:
- `assets/build-room/svg/gear/main PA speaker syste.svg`
- `assets/live-sound/svg/hardware/full-pa-system-line-array-over-subs-renderstyle-standalone.svg`
- `assets/live-sound/svg/hardware/line-array-liv010-left.svg`

Purpose:
- A side-stage coverage speaker destination that is visually distinct from both wedges and the main PA.

Required jacks/labels:
- `Sidefill Input`

Optional future labels:
- `Sidefill L`
- `Sidefill R`

False/trap ports:
- `Link`
- `Service`
- `Main In` only if visually useful as a trap

Art notes:
- Use a side-stage orientation or compact stack silhouette.
- Do not make it look like front-of-house main PA.
- Keep LIV-021 and LIV-023 mono unless a later board intentionally introduces L/R sidefill.

Implementation risk: medium. Distinction from main PA is the core visual challenge.

## Asset: `ls_drum_fill_speaker`

Recommended output path: `assets/live-sound/svg/hardware/drum-fill-speaker.svg`

Needed for: LIV-023, LIV-047

Existing candidate:
- `assets/live-sound/svg/hardware/monitor-wedge-input-panel.svg`
- `assets/build-room/svg/gear/stage monitor.svg`
- `assets/drums/svg/drum-kit-5-piece-8-hitboxes.svg` as contextual source art only

Purpose:
- A drummer-focused monitor/fill destination that is distinct from vocal wedges and sidefill.

Required jacks/labels:
- `Drum Fill Input`

False/trap ports:
- `Thru`
- `Service`

Art notes:
- Consider a slightly larger wedge or compact fill cabinet near drum context.
- Label must say Drum Fill Input, not just Monitor Input.
- Should not imply it is the drum microphone source.

Implementation risk: low.

## Asset: `ls_monitor_send_fault_scene`

Recommended output path: `assets/diagnosis/svg/scenes/live-monitor-send-fault.svg`

Needed for: LIV-022, LIV-031

Existing candidate:
- `assets/diagnosis/svg/backgrounds/diagnosis-board-shell.svg`
- `assets/diagnosis/svg/monitors/signal-flow-patch-tester.svg`
- `assets/diagnosis/svg/monitors/insert-path-monitor.svg`
- `assets/live-sound/svg/hardware/iem-wireless-rack-front.svg`

Purpose:
- A diagnosis scene showing expected monitor send versus actual wrong feed.

Required callouts/labels:
- `Expected: Aux 2 Vocal Mix`
- `Actual: Bus 1 Band Mix`
- `Performer IEM`
- `Wrong Mix`

False diagnosis families to support:
- Main PA problem
- Record feed problem
- RF/network problem
- Level/volume problem

Art notes:
- This is not a patch board. Avoid making route endpoints look draggable unless the diagnosis system expects that.
- Use two clear evidence panels: Expected and Actual.
- The performer symptom should be visually tied to the IEM/bodypack or wedge.

Implementation risk: medium. Diagnosis readability matters more than visual density.

## Asset Creation Batch Order

1. `ls_monitor_console_rack`
2. `ls_personal_mono_iem_pack`
3. `ls_floor_wedge_monitor`
4. `ls_sidefill_stack`
5. `ls_monitor_send_fault_scene`
6. `ls_drum_fill_speaker`

Reasoning:
- The monitor console/rack defines the source side for LIV-020, LIV-021, and LIV-023.
- IEM packs unlock LIV-020.
- Wedge and sidefill unlock LIV-021.
- Diagnosis scene unlocks LIV-022.
- Drum fill completes LIV-023.
