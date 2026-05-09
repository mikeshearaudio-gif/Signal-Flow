// Signal Flow Build Room v6 Photoshop-direction asset helper.
// Codex should adapt this to the current local renderer rather than replacing game logic.
(function(){
  const BASE = 'assets/build-room/svg/';
  const map = {
    micBox: BASE + 'boxes/microphone-condenser-green-box-goodstyle.svg',
    audioInterfaceBox: BASE + 'boxes/audio-interface-blue-box-goodstyle.svg',
    rackInterface: BASE + 'gear/rack-interface-unit-goodstyle.svg',
    emptyBoard: BASE + 'backgrounds/build-room-empty-shop-board-goodstyle.svg',
    dropZone: BASE + 'overlays/drop-zone-highlight-goodstyle.svg'
  };
  window.SF_BUILD_ROOM_V6_ASSETS = {
    base: BASE,
    map,
    createImg(key, className='sf-buildroom-asset') {
      const src = map[key] || key;
      const img = document.createElement('img');
      img.className = className;
      img.src = src;
      img.alt = '';
      img.draggable = false;
      return img;
    }
  };
})();
