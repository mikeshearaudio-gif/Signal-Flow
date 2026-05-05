# Signal Flow Board Build Rules Checklist v1.40.62

This checklist is the required build standard for all future Signal Flow game builds. Every new package should include this file and should be audited against it before delivery.

## 1) Core Build Philosophy

- Simplify, simplify, simplify.
- Each level should show only the amount of gear needed to teach that step in the learning curve.
- The board should feel like interactive audio equipment, not a UI floating on top of random pictures.
- Complexity should ramp gradually across levels.

## 2) Equipment Complexity by Level

### Global progression rule

- Earlier levels: fewer devices, fewer jacks, larger gear, minimal or no scrolling.
- Mid levels: moderate gear count, moderate routing choices.
- Later levels: more realistic system complexity, more distractors, more routing options.

### Pre-Level-25 rule

- No unused equipment before level 25.
- Only equipment relevant to the lesson may appear.
- The equipment that is shown must still be complete enough to make sense.

### Scaling rule

If a level asks for 4 required connections, the total visible board should generally stay close to:

- 12 to 24 jacks total
- 1 to 2 pieces of gear

Do not show 3 full racks with 200+ jacks for a beginner board.

## 3) Equipment Completeness Rule

- If a device or section is shown, it should appear as a believable complete subsection, not a random fragment.
- If the level brief references a section, the visible gear must include the logical channel set needed.

Examples:

- If the task uses Aux 5 L/R, the visible console must show at least Aux 1 L/R through Aux 6 L/R, because audio channels in that context should appear as a logical even-paired set.
- If the task uses Stage Box Input 5, the stage box should include enough inputs that Input 5 belongs to a believable series, such as 1-8 or 1-12.

## 4) Labeling Rules

Use hierarchical labeling only:

1. Section label
2. Subsection label
3. Jack/channel identifier

Correct examples:

- Section: In-Ear Monitor
- Subsection: Input
- Jacks: L, R

- Section: Stage Box
- Subsection: Inputs
- Jacks: 1, 2, 3, 4, 5...

Wrong behavior:

- Do not name the entire jack with a long pill label when the gear already contains the structure.
- Do not duplicate labels.
- Do not label one jack "IEM A L" unless there are multiple IEM systems.
- If there is only one IEM, use "In-Ear Monitor" as the section, "Input" as the subsection, and L/R as jack labels.
- If the equipment image already shows jack numbers on the gear, use those numbers and do not create a second competing numbering system.

## 5) Jack Visibility and Interaction Rules

- The actual jack on the gear image or gear panel should be the patch point.
- Patch points must visually feel centered on the real jack opening.
- No floating patch circles disconnected from the hardware.
- No overlay circles offset from the jack.
- No duplicate hover targets.
- No second invisible layer shifted down/right.

### Hints off

- Overlays should not be visibly highlighted.
- Jacks should still be readable.
- The user should see the equipment, the section/subsection structure, and the jack identifiers.

### Hints on

- Show clear visual emphasis only for relevant targets.
- Hint visuals must not misalign with the gear.
- Hint visuals must not cover important printed gear text.

### Dot rule

- Do not add unnecessary dots on jacks if they create clutter.
- If the jack already exists visually, the readable identifier should do the work.

## 6) Board Layout Rules

- Equipment images or panels should be large enough to read easily.
- Earlier boards should avoid scrolling whenever possible.
- If scrolling is necessary, it must preserve access to all required jacks and must not clip required connection targets.
- No random extra equipment in corners.
- No blackout or mask panels covering gear.
- No detached UI boxes replacing gear images unless intentionally designed.

## 7) Level Brief Rules

- Level briefs should appear as a full post-it note style overlay, not inside a machine-like modal.
- Use a single post-it per brief.
- Randomize post-it color per level.
- Use Segoe Script font in black text.
- The level brief should appear before the level starts.
- The brief must include a Start button.
- When Start is pressed, the brief closes, the level begins, and the brief remains available in Educational Tools.

## 8) Splash Screen Rules

- Splash screen image must be visible.
- Bottom buttons must align with the background art.
- Buttons must function.
- Buttons should have drop shadow for separation.
- No doubled text overlays.
- Top board/environment selectors must remain fully onscreen and properly aligned.

## 9) Tutorial Rules

- Tutorials should be image-first, not text-heavy.
- Use a step-by-step slide format.
- Use short captions only.
- Training lane buttons must have explicit working handlers.
- Each board family should have its own tutorial flow.
- Tutorials should clearly show what gear section the player is looking at, how to identify section/subsection/jack, how to patch, how hints work, and how to win the level.

## 10) Audio Control Rules

- Audio should default to on.
- The audio control should be labeled Sound.
- It should function as a real on/off toggle.
- No duplicate text rendering.

## 11) Live Sound / Gear-Specific Rules

- Match the art style of the created gear images.
- Adapt the gear to difficulty.
- Early live levels use simplified stage box / small rack layouts.
- Later live levels use larger systems and more routing choices.

Example early live board:

- 8-input stage box
- 4 returns
- small 2-unit rack

Example later live board:

- larger stage box
- console outputs
- processor/IEM rack
- more routing choices

## 12) Acceptance Rules for Each Level

### Board design

- [ ] Board shows only relevant equipment.
- [ ] Equipment count matches difficulty.
- [ ] No unnecessary scrolling on early levels.
- [ ] No random or unused gear before level 25.

### Labeling

- [ ] Section labels are correct.
- [ ] Subsection labels are correct.
- [ ] Jack IDs are correct.
- [ ] No duplicate or competing labels.
- [ ] Built-in gear numbering is respected.

### Jack alignment

- [ ] Patch point is centered on the real jack.
- [ ] No offset overlay bug.
- [ ] No duplicate interactive layers.
- [ ] No overlays covering wrong jacks.

### Gameplay

- [ ] All required jacks are present.
- [ ] All required jacks are patchable.
- [ ] No broken buttons.
- [ ] Hints only appear when Show Hints is enabled.
- [ ] Educational tools work.
- [ ] Start/Play works.
- [ ] Sound toggle works.

### Visual/UI

- [ ] Splash screen visible.
- [ ] Splash buttons aligned and working.
- [ ] Level brief uses post-it format.
- [ ] Tutorial is visual and functional.

## 13) Quick Board Size Heuristic

- 1-2 required connections: show about 8-12 jacks total.
- 3-4 required connections: show about 12-24 jacks total.
- 5-6 required connections: show about 18-32 jacks total.
- Advanced boards: expand only when the learning goal justifies it.

## 14) Non-Negotiable Rules

- No unused equipment before level 25.
- Visible gear must be logically complete.
- Actual jacks are the patch points.
- Hierarchical labeling only.
- Complexity increases with progression.
- Earlier levels should be large, readable, and simple.


## v1.40.31 Added Game-Wide Rules

### Signal Path First
- Arrange each board so the readable flow is Source -> Input -> Processing/Routing -> Output -> Destination.
- Required jacks get the clearest placement before distractors are added.

### Complete Subsection, Not Full Device
- Before level 25, show complete relevant subsections rather than full devices.
- If a level uses Aux 5 L/R, show a believable even stereo range such as Aux 1-6 L/R.
- If a device exposes outputs, include its relevant input section when the real-world device requires signal to enter first.

### Hierarchical Label Grammar
- Use one labeling system: Category -> Subcategory -> Jack ID.
- Example: Aux -> Outputs -> L 5 R.
- For stereo pairs, place the channel number centered between the L and R jacks.
- Do not double-label the same jack with both full names and IDs.

### Single-Device Naming
- Do not use A/B naming unless multiple same-type devices are present.
- A single IEM device is In-Ear Monitor -> Input -> L/R, not IEM A L/R.

### Hint vs Identity
- Basic jack identity (number or L/R) remains visible with hints off.
- Hint mode reveals what to do, not what the jack is.
- Required target glow/highlight appears only when hints are on or when selected/correct/wrong feedback applies.

### Post-It Briefs
- Post-it text is black for readability.
- White text is allowed only on dark UI controls such as Educational Tools.
- The post-it is the entire brief window, not a note inside a machine-style modal.
- One post-it per brief; color varies per level.

### Validation Rule
Every release must verify:
- required nodes are visible and clickable;
- no unused equipment appears before level 25;
- visible equipment is logically complete;
- stereo pairs include both L and R;
- numbered ranges are complete and even when appropriate;
- to-do language matches the board labels.

## v1.40.32 UI Density + Connector Realism Addendum

### Splash / Brief Controls
- Educational Tools on the level splash/brief post-it uses white text on its dark button background.
- Post-it body copy remains black for readability.

### Live Sound Density
- Tighten repeated jack groups, especially stereo output groups, without overlap or crowding.
- Keep jack targets large enough to click and labels legible at early-level scale.
- Slim equipment panel padding, internal row gaps, and excessive empty space to reduce unnecessary scrolling.

### Device Name Separation
- Device names inside equipment faces should be centered or visually separated from the broader rack/card category heading.
- Rack/card category headings remain distinct from actual gear names such as Console, System Processor, or In-Ear Monitor.

### Connector Realism
- XLR-style I/O should read visually as XLR, with a recognizable face/pin pattern.
- TRS/quarter-inch style I/O should remain visually different from XLR.
- Connector detail must not interfere with the click target or feedback states.

### Validation Additions
Every release after v1.40.32 must also verify:
- Educational Tools text remains white on dark splash/brief controls;
- jack spacing is tighter but uncrowded;
- gear/device titles remain visually separate from rack/category headings;
- XLR connectors are distinguishable from TRS-style connectors;
- LIV-003 and LIV-005 remain solvable with reduced unnecessary scrolling.


## v1.40.34 All-Stage Live Formatting Addendum

These rules apply across Live Sound stages, not only the reviewed level.

- Remove duplicated or unnecessary helper labels from Live Sound board cards. Keep functional gear names and hierarchy labels; do not show explanatory strips like "only relevant sources" or "input numbers are printed" on the board.
- Live source cards should live inside the gear grid, not in a separate full-width row that creates avoidable vertical scrolling.
- In early Live Sound layouts, place the source card in the former upper-right console area and drop the FOH console below it so console I/O aligns more naturally with stagebox mic/line input rows.
- Pack Amp/Monitor Rack and System/Utility Rack cards upward with dense grid flow to close unnecessary blank space.
- Mic inputs and other XLR paths must visually read as 3-pin XLR connectors. TRS/quarter-inch style jacks should remain visually distinct.
- Do not fix spacing by crowding or overlapping labels, jacks, cable anchors, or cards.


## v1.40.34 All-Environment Rules Compliance Addendum

These rules apply across **Recording Studio, Broadcast, Post-Production, Game Audio, and Live Sound**:

- Before level 25, do not show unused equipment, spare gear, or decorative context devices unless the level explicitly requires them.
- When a board is filtered for an early level, keep the visible gear logically complete by preserving stereo mates, adjacent channel pairs, and send/return or input/output mates.
- Keep real jack/channel identifiers visible with hints off. If a filtered row uses channel numbers, preserve the real channel number rather than renumbering the filtered list from 1.
- Move repeated helper notes out of individual boards. Stage boards should focus on the patching task; tutorials/briefs can carry the explanatory text.
- Keep all environment layouts compact enough for early levels while preserving readability and click targets.
- Do not show context filler panels in Broadcast or Post before level 25. Context gear may appear later only when it supports increased-stage complexity.
- Recording Studio stages use the interactive gear strip plus compact filtered patchbay rows in early levels.
- Live Sound stages keep the all-stage formatting rules from v1.40.33 and add the realistic jack treatment from the v1.40.34 visual pass.


## v1.40.57 Recording Studio Compact Patchbay + Unused Lower Bay Rule

These rules apply universally across Recording Studio levels, with REC-002 as the reference validation stage.

- Active/required Recording Studio jacks are grouped into the fewest practical readable rows.
- Active jacks and labels must render at full visibility: no ghost opacity, global dark overlays, disabled styling, or background image dimming.
- Active label cards use high-contrast cream/white cards with dark text and remain readable at normal browser zoom.
- Remaining lower board space is filled with generated, unlabeled, non-interactive TT-style patchbay rows.
- The lower unused bay is dimmer than the active rows but still reads as physical patchbay hardware.
- The lower unused bay must not include labels, numbers, route hints, solution indicators, or clickable distractor jacks.
- Recording Studio patchbays must not use a screenshot, photo, ghosted labeled patchbay, or background image behind the active hardware.
- Cable stacking order is: jack faces below cables, labels/tooltips above cables.
- Normal Recording Studio levels should not require horizontal scrolling; required jacks must not be clipped.

## v1.40.60 Global Board Construction + Validation Addendum

These rules apply across all Signal Flow environments: Recording Studio, Live Sound, Broadcast, Post-Production, and Game Audio.

### Minimum Believable Range Rule

- If a numbered jack/channel/aux/matrix/send appears because of a required, forbidden, normalled, or context route, the board must show the complete local range that makes the number believable.
- Low numbered sequential groups expand from 1 through the highest needed even pair: Aux 6 means Aux 1-6; CH 6 Insert Send means CH 1-6 Insert Sends; Aux 5 means Aux 1-6.
- Channel banks above 8 should show the containing bank instead of a lone high number, such as CH 9-16 or CH 17-24.
- Do not show lone floating jacks like CH 7, CH 8, Aux 5, Aux 6, Matrix 3, Input 5, or Send 6 without the surrounding logical range.

### Complete Active Section Before Decorative Hardware

- Build the complete active/playable subsection first, including required jacks, forbidden teaching distractors, normalled mates, stereo mates, and the minimum believable numbered range.
- Only after the active subsection is complete may the renderer fill remaining board space with decorative/unlabeled hardware rows.
- Decorative patchbay rows must never hide missing active jacks or replace a needed numbered range.

### Smallest Practical Active Row Count

- Required and context jacks should be packed into the fewest practical readable active rows.
- If the complete active subsection fits cleanly on one row, it should render as one active row.
- Extra active rows should be used only when needed for readability, grouping clarity, or click-target spacing.

### Input / Output Subcategory Separation

- A visible gear section that contains both outputs and inputs must show a clear subcategory break.
- Use separate subsection headers, color strips, or visually distinct grouping for outputs versus inputs.
- A mixed bay such as Aux/Cue/Recorder should not render as one undifferentiated strip when aux/cue outputs and headphone/recorder/converter inputs are both visible.

### Duplicate / Broken Numbering Rejection

- No board may ship with duplicate visible labels unless the duplicate is intentionally mirrored and clearly disambiguated.
- The validation pass must reject repeated labels such as two identical CH 6 Insert Send nodes.
- Numbered groups must not skip required context numbers within the active local range.

### Universal Validation Additions

Every release after v1.40.60 must also verify:

- [ ] Required nodes are visible and clickable.
- [ ] Required nodes are not clipped at the left, right, top, or bottom of the board.
- [ ] Numbered ranges are logically complete for the local context.
- [ ] No duplicate visible labels appear in any active playable section.
- [ ] Inputs and outputs are visually separated when they share a broader hardware bay.
- [ ] The active section is packed into the fewest practical readable rows.
- [ ] Decorative lower/blank hardware appears only after the active section is complete.
- [ ] Decorative hardware remains unlabeled, non-interactive, and does not reveal solutions.
- [ ] To-do text, board labels, tooltips, and hints use matching terminology.

## v1.40.61 Global Section Grammar Addendum

These rules apply across every environment, with Recording Studio as the current reference implementation.

### One Descriptor Per Section
- Do not combine unrelated descriptors in a single section header such as "AUX / CUE OUTPUTS", "MONITOR / RECORDER INPUTS", or "OUTBOARD OUTPUTS / INSERT RETURNS".
- Each active section must use one clear role descriptor: examples include Outboard Inputs, Outboard Outputs, Insert Returns, FX Returns, Aux Outputs, Monitor Inputs, Recorder Inputs, and Direct Outputs.
- If a row contains more than one role, split it into multiple adjacent sections instead of using slash-combined wording.

### No Duplicate Signal-Family Names
- Do not show separate Aux and Cue Aux jack families in the same setup. A console aux used for cue/headphone monitoring is still labeled as Aux on the board.
- The educational copy may explain cue/headphone use, but the jack label should keep the single real-world family name used by the hardware.

### Split Outputs, Inputs, and Returns
- Outputs, inputs, and returns must not be presented as one undifferentiated strip when they are separate signal roles.
- Outboard processor outputs and channel insert returns must be rendered as separate sections.
- Aux outputs and monitor/headphone inputs must be rendered as separate sections.

### Consolidated, Even Active Rows
- Once the complete believable active subsection is assembled, pack it into the fewest readable active rows.
- When the complete active content fits on one row, use one active row and place the blank/non-interactive patchbay rows below it.
- Jacks within each active section should be evenly spaced and labels must remain readable without horizontal clipping.

### Validation Additions
Every release after v1.40.61 must verify:
- no active section header contains slash-combined role labels unless it is a true single standardized device name;
- no board shows both Aux and Cue Aux as separate jack families;
- outboard outputs and insert/FX returns are split when both appear;
- aux outputs and monitor/recorder inputs are split when both appear;
- active jacks are consolidated into the fewest practical rows with even spacing.

## v1.40.62 Universal Stereo Pair Completeness Addendum

These rules apply across every Signal Flow environment: Recording Studio, Live Sound, Broadcast, Post-Production, Game Audio, and any future board family.

### Stereo Pair Completeness Rule

- Any route involving one side of a stereo left/right pair must include the matching opposite side.
- If the left channel is routed, the right channel must also be routed.
- If the right channel is routed, the left channel must also be routed.
- No level may ask the player to patch only L or only R of a stereo path.
- This rule applies to required routes, context routes, normalled route data, to-do lists, labels, hints, validation checks, and acceptance testing.
- Mono-only sources and mono-only processors are unaffected, but once a path is explicitly labeled or structured as L/R, it must be treated as a complete stereo pair.

### Required Board Construction Behavior

- When the level data includes any required jack labeled L, Left, R, Right, L Out, R Out, L In, R In, Left Output, Right Output, Left Input, Right Input, or equivalent stereo terminology, the board builder must search for and include the matching mate.
- The matching mate must be visible, clickable, and included in the level route list.
- The matching mate must use the same device family, channel number, send number, bus number, stem name, matrix number, processor name, and destination family as the routed side.
- Stereo mates must remain visually adjacent or clearly paired unless the real-world hardware separates them by design.
- The to-do list must show both sides of the stereo route, either as two explicit tasks or as a single clearly paired L/R task.

### Correct Examples

- Delay Out L -> FX Return L requires Delay Out R -> FX Return R.
- Aux 5 L Out -> IEM L In requires Aux 5 R Out -> IEM R In.
- DAW Stem L -> Renderer L requires DAW Stem R -> Renderer R.
- Main Left Out -> PA Left In requires Main Right Out -> PA Right In.
- Matrix 3 L -> Broadcast Feed L requires Matrix 3 R -> Broadcast Feed R.

### Incorrect Examples

- Delay Out L -> FX Return L with no Delay Out R route.
- Aux 5 L Out -> IEM L In with no Aux 5 R route.
- DAW Stem R -> Renderer R with no DAW Stem L route.
- Main Right Out -> PA Right In with no Main Left route.

### Validation Additions

Every release after v1.40.62 must verify:

- [ ] Every required L route has a matching required R route.
- [ ] Every required R route has a matching required L route.
- [ ] Every visible required stereo source has both L and R jacks present.
- [ ] Every visible required stereo destination has both L and R jacks present.
- [ ] Stereo mates are not clipped, hidden, decorative-only, disabled, or non-clickable.
- [ ] To-do list language includes both sides of any stereo pair.
- [ ] Hint text and target highlighting include both sides of any stereo pair.
- [ ] Acceptance tests fail if a required stereo route contains only one side.

