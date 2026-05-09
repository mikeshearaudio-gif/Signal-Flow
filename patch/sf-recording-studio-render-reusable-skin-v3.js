// Signal Flow Recording Studio render-style reusable skin v3
// Integration skeleton only. Keep gameplay DOM, labels, jacks, cable layer, scoring, undo/clear, and hints in existing game code.
window.SF_REC_RENDERSTYLE_SKIN_V3 = {
  basePath: 'assets/recording-studio/svg/',
  install(root = document) {
    const wrap = root.querySelector('#patchbayWrap.env-recording, .env-recording-studio, [data-environment="recording-studio"]');
    if (!wrap) return false;
    wrap.classList.add('sf-rec-renderstyle-v3');
    return true;
  }
};
