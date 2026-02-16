const LANDMARKS =[
  {
    id: "ESB",
    name: "Empire State Building",
    zone: "Midtown",
    Lat: 40.7484,
    Lng: -73.9857,
    secret: "ESB_QUANTUM_7X9K_SECRET",
    hint: "Look up - it touches the clouds",
  },
  {
    id: "BKBR",
    name: "Brooklyn Bridge",
    zone: "Downtown",
    lat: 40.7061,
    lng:  -73.9969,
    secret: "BKBR_ENTNGL_4M2R_SECRET",
    hint: "Where two boroughs become one",
  },
  {
    id: "CENT",
    name: "Central Park",
    zone: "Midtown",
    lat: 40.7739,
    lng: -73.9709,
    secret: "CENT_WAVEFN_8Q5T_SECRET",
    hint: "The angel watches over the water",
  },
  {
    id: "TIMES",
    name: "Times Square",
    zone: "Midtown",
    lat: 40.7580,
    lng: -73.9855,
    secret: "TSQR_DECOHR-2P7W_SECRET",
    hint: "Where the ball drops",
  },
  {
    id: "HIGH",
    name: "The High Line",
    zone: "Chelsea",
    lat: 40.748,
    lng: -74.0048,
    secret: "HIGH_SCHRD_6L3V_SECRET",
    hint: "A park above the streets",
  },
  {
    id: "CONY",
    name: "Coney Island",
    zone: "Brookyln",
    lat: 40.5755,
    lng: -73.9707,
    secret: "CONY_QLBIT_9N1S_SECRET",
    hint: "The Wonder Wheel never stops turning",
  },
];

const LANDMARKS_PUBLIC = LANDMARKS.map(({ secret, ...rest}) => rest);
 
module.exports = { LANDMARKS, LANDMARKS_PUBLIC};