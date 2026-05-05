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
    'Vocal Booth': ['../assets/IR images/vocal booth.png'],
    'Bedroom Studio': ['../assets/IR images/bedroom studio.png'],
    'Podcast Studio': ['../assets/IR images/podcast.png'],
    'Office': ['../assets/IR images/office.png'],
    'Classroom': ['../assets/IR images/Classroom.png'],
    'Rehearsal Room': ['../assets/IR images/Rehersal Room.png'],
    'Living Room': ['../assets/IR images/Living Room v2.png','../assets/IR images/Living Room.png'],
    'Wood Room': ['../assets/IR images/Wood Room v2.png','../assets/IR images/Wood room.png'],
    'Scoring Stage': ['../assets/IR images/Scoring Stage.png'],
    'Soundstage': ['../assets/IR images/Soundstage.png'],
    'Open Air': ['../assets/IR images/Outdoor Open Air.png'],
    'Courtyard': ['../assets/IR images/Courtyard.png'],
    'Alley': ['../assets/IR images/Alley.png'],
    'Parking Garage': ['../assets/IR images/Parking Garage.png'],
    'Tunnel': ['../assets/IR images/Tunnel.png'],
    'Broadcast Studio': ['../assets/IR images/Tight Broadcast Studio0.png'],
    'Attic Chamber': ['../assets/IR images/Chamber.png'],
    'Club / Live Venue': ['../assets/IR images/Club  Live Venue0.png'],
    'Gymnasium': ['../assets/IR images/Gym.png'],
    'Church Interior': ['../assets/IR images/Church Interior.png'],
    'Cathedral': ['../assets/IR images/Cathedral.png'],
    'Concert Hall': ['../assets/IR images/Concert Hall.png'],
    'Plate': ['../assets/IR images/Plate.png'],
    'Reverse': ['../assets/IR images/Reverse.png']
  };

  function candidatesFor(space){
    return (imageMap[space] || []).slice();
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

  const LEVEL_IMAGE_CANDIDATES = {
    'REC-IR-01': ['../assets/IR images/vocal booth.png'],
    'REC-IR-02': ['../assets/IR images/Wood Room v2.png','../assets/IR images/Wood room.png'],
    'LIV-IR-01': ['../assets/IR images/Club  Live Venue0.png'],
    'LIV-IR-02': ['../assets/IR images/Gym.png'],
    'BRD-IR-01': ['../assets/IR images/Tight Broadcast Studio0.png'],
    'PST-IR-01': ['../assets/IR images/Living Room v2.png','../assets/IR images/Living Room.png'],
    'PST-IR-02': ['../assets/IR images/Scoring Stage.png'],
    'GAM-IR-01': ['../assets/IR images/Tunnel.png'],
    'GAM-IR-02': ['../assets/IR images/Courtyard.png']
  };

  Object.keys(IR_LEVELS).forEach(id => {
    IR_LEVELS[id].id = id;
    IR_LEVELS[id].imageCandidates = (LEVEL_IMAGE_CANDIDATES[id] || candidatesFor(IR_LEVELS[id].space)).slice();
  });

  global.SF_IR_DATA = { IR_LIST, IR_META, IR_LEVELS, candidatesFor };
})(window);
