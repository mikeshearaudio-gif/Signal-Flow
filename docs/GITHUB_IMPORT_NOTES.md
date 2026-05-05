# GitHub Import Notes

Prepared from:

- `/Users/mikeshear/Downloads/Signal_Flow_v1_40_62_Checklist/Signal_Flow_v1_41_16_Handoff_Part_1_Launch_Docs.zip`
- `/Users/mikeshear/Downloads/Signal_Flow_v1_40_62_Checklist/Signal_Flow_v1_41_16_Handoff_Part_2_Audio.zip`
- `/Users/mikeshear/Downloads/Signal_Flow_v1_40_62_Checklist/Signal_Flow_v1_41_16_Handoff_Part_3_IR images.zip`
- visual asset folders inside `/Users/mikeshear/Downloads/Signal_Flow_v1_40_62_Checklist/`

Not committed:

- Handoff zip wrappers.
- `__MACOSX` metadata folders.
- `.DS_Store` files.
- `Signal_Flow_v1_41_16_Handoff_Part_4_Source_Archives.zip`, because it only wraps the IR images archive and exceeds GitHub's normal file limit.

Known size note:

- `launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html` is close to GitHub's per-file limit. It should push, but future builds should split embedded assets out of the single HTML file.

Authentication note:

- This machine could not push to `github.com:mikeshearaudio-gif/Signal-Flow` during preparation because neither HTTPS nor SSH GitHub auth was configured for this repo.
