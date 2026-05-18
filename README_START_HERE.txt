Signal Flow local repo

Start here:
1. Open index.html in a browser.
2. The local launcher redirects to launch/Signal_Flow_v1_41_18_NAV_WRAPPER.html.
3. The wrapper uses launch/Signal_Flow_v1_41_16_IR_NORMAL_LEVEL_FLOW_FIX.html for the full embedded game and launch/ir-level-runner.html for distributed IR levels.
4. Review docs/Signal_Flow_v1_41_16_Handoff.docx and docs/build-notes/BUILD_NOTES_v1_41_18_DISTRIBUTED_IR_LEVELS.md for current status, rules, known risks, and next steps.

Package contents:
- index.html: local launcher.
- launch/: active wrapper, full embedded game dependency, and IR runner.
- assets/audio/: uploaded music, stems, and SFX assets.
- assets/: audio, IR images, board art, UI references, and environment art.
- src/: active extracted source modules.
- patch/: reusable patch modules referenced by the launch HTML.
- docs/: handoff documents, asset manifests, build notes, rule source files, and build-note history.
- audit/: compact audit summaries and manifests only; generated pre-patch snapshots are intentionally excluded.

Important: v1.41.18 is the active launcher/wrapper, while v1.41.16 remains the full embedded game dependency.
