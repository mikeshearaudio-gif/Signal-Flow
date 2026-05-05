(function(global){
  'use strict';

  const IR_LIST = [
    'Vocal Booth','Bedroom Studio','Podcast Studio','Office','Classroom','Rehearsal Room',
    'Living Room','Wood Room','Scoring Stage','Soundstage','Reverse','Plate','Open Air',
    'Courtyard','Alley','Parking Garage','Tunnel','Broadcast Studio','Attic Chamber',
    'Club / Live Venue','Gymnasium','Church Interior','Cathedral','Concert Hall'
  ];

  const IR_META = {
    'Vocal Booth': {size:'small', env:'indoor', kind:'dry'},
    'Bedroom Studio': {size:'small', env:'indoor', kind:'treated'},
    'Podcast Studio': {size:'small', env:'indoor', kind:'dry'},
    'Office': {size:'small', env:'indoor', kind:'semi-reflective'},
    'Classroom': {size:'medium', env:'indoor', kind:'reflective'},
    'Rehearsal Room': {size:'medium', env:'indoor', kind:'lively'},
    'Living Room': {size:'small', env:'indoor', kind:'soft'},
    'Wood Room': {size:'small', env:'indoor', kind:'reflective'},
    'Scoring Stage': {size:'large', env:'indoor', kind:'controlled'},
    'Soundstage': {size:'large', env:'indoor', kind:'reflective'},
    'Reverse': {size:'fx', env:'special', kind:'effect', alwaysOneStar:true},
    'Plate': {size:'fx', env:'artificial', kind:'effect', alwaysOneStar:true},
    'Open Air': {size:'none', env:'outdoor', kind:'dry'},
    'Courtyard': {size:'medium', env:'outdoor', kind:'enclosed'},
    'Alley': {size:'medium', env:'outdoor', kind:'directional'},
    'Parking Garage': {size:'large', env:'indoor', kind:'metallic'},
    'Tunnel': {size:'large', env:'outdoor', kind:'directional'},
    'Broadcast Studio': {size:'small', env:'indoor', kind:'dry'},
    'Attic Chamber': {size:'small', env:'indoor', kind:'boxy'},
    'Club / Live Venue': {size:'medium', env:'indoor', kind:'lively'},
    'Gymnasium': {size:'large', env:'indoor', kind:'reflective'},
    'Church Interior': {size:'large', env:'indoor', kind:'diffuse'},
    'Cathedral': {size:'massive', env:'indoor', kind:'wash'},
    'Concert Hall': {size:'large', env:'indoor', kind:'controlled'}
  };

  const imageMap = {
    'Vocal Booth': ['vocal booth.png','Vocal Booth.png','01-vocal-booth.png'],
    'Bedroom Studio': ['bedroom studio.png','Bedroom Studio.png','02-bedroom-studio.png'],
    'Podcast Studio': ['podcast.png','Podcast Studio.png','03-podcast-studio.png'],
    'Office': ['office.png','Office.png','04-office.png'],
    'Classroom': ['Classroom.png','05-classroom.png'],
    'Rehearsal Room': ['Rehersal Room.png','Rehearsal Room.png','06-rehearsal-room.png'],
    'Living Room': ['Living Room v2.png','Living Room.png','07-living-room.png'],
    'Wood Room': ['Wood Room v2.png','Wood Room.png','08-wood-room.png'],
    'Scoring Stage': ['Scoring Stage.png','09-scoring-stage.png'],
    'Soundstage': ['Soundstage.png','10-soundstage.png'],
    'Open Air': ['Outdoor Open Air.png','Open Air.png','13-open-air.png'],
    'Courtyard': ['Courtyard.png','14-courtyard.png'],
    'Alley': ['Alley.png','15-alley.png'],
    'Parking Garage': ['Parking Garage.png','16-parking-garage.png'],
    'Tunnel': ['Tunnel.png','17-tunnel.png'],
    'Broadcast Studio': ['Tight Broadcast Studio0.png','Broadcast Studio.png','18-broadcast-studio.png'],
    'Attic Chamber': ['Chamber.png','Attic Chamber.png','19-attic-chamber.png'],
    'Club / Live Venue': ['Club  Live Venue0.png','Club Live Venue.png','20-club-live-venue.png'],
    'Gymnasium': ['Gym.png','Gymnasium.png','21-gymnasium.png'],
    'Church Interior': ['Church Interior.png','22-church-interior.png'],
    'Cathedral': ['Cathedral.png','23-cathedral.png'],
    'Concert Hall': ['Concert Hall.png','24-concert-hall.png'],
    'Plate': ['Plate.png','12-plate.png'],
    'Reverse': ['Reverse.png','11-reverse.png']
  };

  function candidatesFor(space){
    const names = imageMap[space] || [];
    const roots = ['../assets/ir-spaces/final/','../assets/ir-spaces/','../assets/images/ir/','../assets/'];
    const out = [];
    roots.forEach(root => names.forEach(name => out.push(root + name)));
    return out;
  }

  const IR_LEVELS = {
    'REC-IR-01': {env:'REC', title:'Recording IR 1', space:'Vocal Booth', icon:'🎙️', brief:'Match a close, dry recording space for a focused source.'},
    'REC-IR-02': {env:'REC', title:'Recording IR 2', space:'Bedroom Studio', icon:'🎹', brief:'Choose a small treated room, not a large performance space.'},
    'REC-IR-03': {env:'REC', title:'Recording IR 3', space:'Podcast Studio', icon:'🎧', brief:'Pick a tight spoken-word space that keeps reflections controlled.'},
    'REC-IR-04': {env:'REC', title:'Recording IR 4', space:'Wood Room', icon:'🪵', brief:'Match a small reflective room with hard wood surfaces.'},

    'LIV-IR-01': {env:'LIV', title:'Live IR 1', space:'Club / Live Venue', icon:'🎸', brief:'A live performance feed needs a believable small venue ambience.'},
    'LIV-IR-02': {env:'LIV', title:'Live IR 2', space:'Rehearsal Room', icon:'🥁', brief:'Choose a lively practice space without making it too huge.'},
    'LIV-IR-03': {env:'LIV', title:'Live IR 3', space:'Gymnasium', icon:'🏀', brief:'A temporary event space has bright, long reflections.'},
    'LIV-IR-04': {env:'LIV', title:'Live IR 4', space:'Open Air', icon:'🌄', brief:'An outdoor stage should not sound like an enclosed room.'},
    'LIV-IR-05': {env:'LIV', title:'Live IR 5', space:'Soundstage', icon:'🎬', brief:'Match a large reflective production space.'},

    'BRD-IR-01': {env:'BRD', title:'Broadcast IR 1', space:'Broadcast Studio', icon:'📻', brief:'Broadcast speech should stay dry and controlled.'},
    'BRD-IR-02': {env:'BRD', title:'Broadcast IR 2', space:'Office', icon:'💼', brief:'A remote office interview should feel small and lightly reflective.'},
    'BRD-IR-03': {env:'BRD', title:'Broadcast IR 3', space:'Classroom', icon:'🏫', brief:'Match a mid-size speech space with more reflection than a studio.'},
    'BRD-IR-04': {env:'BRD', title:'Broadcast IR 4', space:'Courtyard', icon:'🏛️', brief:'A field segment is outdoors but still enclosed by reflective walls.'},

    'PST-IR-01': {env:'PST', title:'Post IR 1', space:'Living Room', icon:'🛋️', brief:'Match production audio to a furnished living space with soft surfaces.'},
    'PST-IR-02': {env:'PST', title:'Post IR 2', space:'Scoring Stage', icon:'🎼', brief:'Choose a large controlled production room, not a washed-out cathedral.'},
    'PST-IR-03': {env:'PST', title:'Post IR 3', space:'Church Interior', icon:'⛪', brief:'Match a large indoor space with warm, diffuse reflections.'},
    'PST-IR-04': {env:'PST', title:'Post IR 4', space:'Concert Hall', icon:'🎻', brief:'Choose a large musical room with clear controlled decay.'},
    'PST-IR-05': {env:'PST', title:'Post IR 5', space:'Cathedral', icon:'🕍', brief:'Match an extremely large indoor space with a long reverb tail.'},

    'GAM-IR-01': {env:'GAM', title:'Game IR 1', space:'Tunnel', icon:'🚇', brief:'A linear game space needs directional reflections.'},
    'GAM-IR-02': {env:'GAM', title:'Game IR 2', space:'Parking Garage', icon:'🅿️', brief:'Choose a large hard space with metallic repeating reflections.'},
    'GAM-IR-03': {env:'GAM', title:'Game IR 3', space:'Alley', icon:'🌃', brief:'Match a narrow outdoor corridor with slapback reflections.'},
    'GAM-IR-04': {env:'GAM', title:'Game IR 4', space:'Courtyard', icon:'🏛️', brief:'An open-air area with boundaries should not sound fully dry.'},
    'GAM-IR-05': {env:'GAM', title:'Game IR 5', space:'Open Air', icon:'🌄', brief:'A wide outdoor environment should have almost no room reflections.'}
  };

  Object.keys(IR_LEVELS).forEach(id => { IR_LEVELS[id].id = id; IR_LEVELS[id].imageCandidates = candidatesFor(IR_LEVELS[id].space); });

  global.SF_IR_DATA = { IR_LIST, IR_META, IR_LEVELS, candidatesFor };
})(window);
