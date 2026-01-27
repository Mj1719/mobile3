// Mode Wheel v12 — with Mode Family Selector Panel
// ------------------------------------------------

// ---------- Constants ----------
const NOTES = ["C","C♯/D♭","D","D♯/E♭","E","F","F♯/G♭","G","G♯/A♭","A","A♯/B♭","B"];

function splitKeyRowsIntoBalancedLines(){
  const container = document.getElementById('key-rows');
  if(!container) return;

  // If already wrapped, unwrap first to get the raw tiles
  const existingRows = Array.from(container.querySelectorAll(':scope > .mode-row'));
  let tiles = [];
  if(existingRows.length){
    existingRows.forEach(r => tiles.push(...Array.from(r.children)));
  }else{
    tiles = Array.from(container.children);
  }
  // Filter out non-element nodes
  tiles = tiles.filter(el => el && el.nodeType === 1);

  const n = tiles.length;
  if(n === 0) return;

  container.innerHTML = '';

  const row1Count = (n <= 7) ? n : Math.ceil(n/2);  // 8->4, 9->5, 10->5, 11->6, 12->6
  const row2Count = (n <= 7) ? 0 : (n - row1Count);

  const row1 = document.createElement('div');
  row1.className = 'mode-row';
  tiles.slice(0, row1Count).forEach(t => row1.appendChild(t));
  container.appendChild(row1);

  if(row2Count > 0){
    const row2 = document.createElement('div');
    row2.className = 'mode-row';
    tiles.slice(row1Count).forEach(t => row2.appendChild(t));
    container.appendChild(row2);
  }
}
const INTERVALS = ["Root","m2","M2","m3","M3","P4","Tritone","P5","m6","M6","m7","M7"];

// Mode families with noteCount + familyIndex metadata
const MODE_FAMILIES = {
"Void": {
  familyIndex: 1,
  noteCount: 0,
  names: ["Silence"], // or []
  sets: [
    [] // a single “rotation” of the empty set
  ]
},
// 1 note scale
  "Unison/Octave": {
    familyIndex: 1,
    noteCount: 1,
    names: ["Unison/Octave"],
    sets: [
      [0],
    ]
  },
// 2 note scales
  "Tritone": {
    familyIndex: 1,
    noteCount: 2,
    names: ["Augmented Fourth", "Diminished Fifth"],
    sets: [
    [0,6], // Aug 4
    [0,6], // Dim 5 (same pattern, distinct entry)
    ]
  },
  "P5 & P4": {
    familyIndex: 2,
    noteCount: 2,
    names: ["Perfect Fifth", "Perfect Fourth"],
    sets: [
      [0,7],
      [0,5],
    ]
  },
  "M3 & m6": {
    familyIndex: 3,
    noteCount: 2,
    names: ["Major Third", "Minor Sixth"],
    sets: [
      [0,4],
      [0,8],
    ]
  },
  "M6 & m3": {
    familyIndex: 4,
    noteCount: 2,
    names: ["Major Sixth", "Minor Third"],
    sets: [
      [0,9],
      [0,3],
    ]
  },
  "M2 & m7": {
    familyIndex: 5,
    noteCount: 2,
    names: ["Major Second", "Minor Seventh"],
    sets: [
      [0,2],
      [0,10],
    ]
  },
  "M7 & m2": {
    familyIndex: 6,
    noteCount: 2,
    names: ["Major Seventh", "Minor Second"],
    sets: [
      [0,11],
      [0,1],
    ]
  },
  "Augmented Triad": {
    familyIndex: 1,
    noteCount: 3,
    names: ["Augmented Triad"],
    sets: [
      [0,4,8],
    ]
  },
  "Major Triad": {
    familyIndex: 2, // -2 / +2 = 4
    noteCount: 3,
    names: ["Major Triad", "First Inversion", "Second Inversion"],
    sets: [
      [0,4,7], // -1,
      [0,3,8], // -1 (flattest)
      [0,5,9], // +2,
    ]
  },
  "Minor Triad": {
    familyIndex: 3, // -2 / +2 = 4
    noteCount: 3,
    names: ["Minor Triad", "First Inversion", "Second Inversion"],
    sets: [
      [0,3,7], // -2 (flattest)
      [0,4,9], // +1,
      [0,5,8], // +1,
    ]
  },
  "Diminished Triad": {
    familyIndex: 5, // -3 / +3 = 6
    noteCount: 3,
    names: ["Diminished Triad", "First Inversion", "Second Inversion"],
    sets: [
      [0,3,6], // -3 (flattest)
      [0,3,9], // +0,
      [0,6,9], // +3,
    ]
  },
  "Suspended Triad": {
    familyIndex: 4, // -3 / +3 = 6
    noteCount: 3,
    names: ["Sus4", "Sus2", "Sus7"],
    sets: [
      [0,5,7], // +0,
      [0,2,7], // -3 (flattest)
      [0,5,10], // +3,
    ]
  },
  "Dominant 7th no 5th": {
    familyIndex: 6, // -4 / +4 = 8
    noteCount: 3,
    names: ["Dom7 no 5", "Mode 2", "Mode 3"],
    sets: [
      [0,4,10], // +2,
      [0,6,8], // +2,
      [0,2,6], // -4 (flattest)
    ]
  },
  "Tritonic 7": {
    familyIndex: 7, // -4 / +4 = 8
    noteCount: 3,
    names: ["Mode 1", "Mode 2", "Mode 3"],
    sets: [
      [0,6,10], // +4,
      [0,4,6], // -2,
      [0,2,8], // -2 (flattest)
    ]
  },
  "Tritonic 8": {
    familyIndex: 8, // -5 / +5 = 10
    noteCount: 3,
    names: ["Mode 1", "Mode 2", "Mode 3"],
    sets: [
      [0,5,11], // +4,
      [0,6,7], // +1,
      [0,1,6], // -5 (flattest)
    ]
  },
  "Tritonic 9": {
    familyIndex: 9, // -5 / +5 = 10
    noteCount: 3,
    names: ["Mode 1", "Mode 2", "Mode 3"],
    sets: [
      [0,6,11], // +5,
      [0,5,6], // -1,
      [0,1,7], // -4 (flattest)
    ]
  },
  "Tritonic 10": {
    familyIndex: 10, // -5 / +5 = 10
    noteCount: 3,
    names: ["Mode 1", "Mode 2", "Mode 3"],
    sets: [
      [0,3,10], // +1,
      [0,7,9], // +4,
      [0,2,5], // -5 (flattest)
    ]
  },
  "Tritonic 11": {
    familyIndex: 11, // -5 / +5 = 10
    noteCount: 3,
    names: ["Mode 1", "Mode 2", "Mode 3"],
    sets: [
      [0,2,9], // -1,
      [0,7,10], // +5,
      [0,3,5], // -4 (flattest)
    ]
  },
  "Tritonic 12": {
    familyIndex: 12, // -6 / +6 = 12
    noteCount: 3,
    names: ["Mode 1", "Mode 2", "Mode 3"],
    sets: [
      [0,4,11], // +3,
      [0,7,8], // +3,
      [0,1,5], // -6 (flattest)
    ]
  },
  "Tritonic 13": {
    familyIndex: 13, // -6 / +6 = 12
    noteCount: 3,
    names: ["Mode 1", "Mode 2", "Mode 3"],
    sets: [
      [0,7,11], // +6,
      [0,4,5], // -3,
      [0,1,8], // -3 (flattest)
    ]
  },
  "Tritonic 14": {
    familyIndex: 14, // -6 / +6 = 12
    noteCount: 3,
    names: ["Mode 1", "Mode 2", "Mode 3"],
    sets: [
      [0,2,10], // +0,
      [0,8,10], // +6,
      [0,2,4], // -6 (flattest)
    ]
  },
  "Tritonic 15": {
    familyIndex: 15, // -7 / +7 = 14
    noteCount: 3,
    names: ["Mode 1", "Mode 2", "Mode 3"],
    sets: [
      [0,3,11], // +2,
      [0,8,9], // +5,
      [0,1,4], // -7 (flattest)
    ]
  },
  "Tritonic 16": {
    familyIndex: 16, // -7 / +7 = 14
    noteCount: 3,
    names: ["Mode 1", "Mode 2", "Mode 3"],
    sets: [
      [0,1,9], // -2,
      [0,8,11], // +7,
      [0,3,4], // -5 (flattest)
    ]
  },
  "Tritonic 17": {
    familyIndex: 17, // -8 / +8 = 16
    noteCount: 3,
    names: ["Mode 1", "Mode 2", "Mode 3"],
    sets: [
      [0,2,11], // +1,
      [0,9,10], // +7,
      [0,1,3], // -8 (flattest)
    ]
  },
  "Tritonic 18": {
    familyIndex: 18, // -8 / +8 = 16
    noteCount: 3,
    names: ["Mode 1", "Mode 2", "Mode 3"],
    sets: [
      [0,1,10], // -1,
      [0,9,11], // +8,
      [0,2,3], // -7 (flattest)
    ]
  },
  "Trichromatic": {
    familyIndex: 19, // -9 / +9 = 18
    noteCount: 3,
    names: ["Mode 1", "Mode 2", "Mode 3"],
    sets: [
      [0,1,11], // +0,
      [0,10,11], // +9,
      [0,1,2], // -9 (flattest)
    ]
  },
// 4 note scales
"Fully Diminished": {
    familyIndex: 1,
    noteCount: 4,
    names: ["Fully Diminished"],
    sets: [
      [0,3,6,9],
    ]
  },
  "Half Diminshed": {
    familyIndex: 2, // -3 / +3 = 6
    noteCount: 4,
    names: ["Half Diminished", "First Inversion", "Second Inversion", "Third Inversion"],
    sets: [
      [0,3,6,10], // +1,
      [0,3,7,9], // +1,
      [0,4,6,9], // +1,
      [0,2,5,8], // -3 (flattest)
    ]
  },
  "Dominant 7th": {
    familyIndex: 3, // -3 / +3 = 6
    noteCount: 4,
    names: ["Dominant 7th", "First Inversion", "Second Inversion", "Third Inversion"],
    sets: [
      [0,4,7,10], // +3,
      [0,3,6,8], // -1,
      [0,3,5,9], // -1,
      [0,2,6,9], // -1 (flattest)
    ]
  },
  "Major 7th": {
    familyIndex: 4, // -4 / +4 = 8
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,4,7,11], // +4,
      [0,3,7,8], // +0,
      [0,4,5,9], // +0,
      [0,1,5,8], // -4 (flattest)
    ]
  },
  "Tetratonic 5": {
    familyIndex: 5, // -4 / +4 = 8
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,2,6,10], // +0,
      [0,4,8,10], // +4,
      [0,4,6,8], // +0,
      [0,2,4,8], // -4 (flattest)
    ]
  },
  "Tetratonic 6": {
    familyIndex: 6, // -4 / +4 = 8
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,3,5,10], // +0,
      [0,2,7,9], // +0,
      [0,5,7,10], // +4,
      [0,2,5,7], // -4 (flattest)
    ]
  },
  "Minor 7th": {
    familyIndex: 7, // -4 / +4 = 8
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,3,7,10], // +2,
      [0,4,7,9], // +2,
      [0,3,5,8], // -2,
      [0,2,5,9], // -2 (flattest)
    ]
  },
  "Tetratonic 8": {
    familyIndex: 8, // -4 / +4 = 8
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,4,6,10], // +2,
      [0,2,6,8], // -2,
      [0,4,6,10], // +2,
      [0,2,6,8], // -2 (flattest)
    ]
  },
  "Tetratonic 9": {
    familyIndex: 9, // -6 / +6 = 12
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,3,6,11], // +2,
      [0,3,8,9], // +2,
      [0,5,6,9], // +2,
      [0,1,4,7], // -6 (flattest)
    ]
  },
  "Tetratonic 10": {
    familyIndex: 10, // -6 / +6 = 12
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,3,7,11], // +3,
      [0,4,8,9], // +3,
      [0,4,5,8], // -1,
      [0,1,4,8], // -5 (flattest)
    ]
  },
  "Tetratonic 11": {
    familyIndex: 11, // -6 / +6 = 12
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,4,6,11], // +3,
      [0,2,7,8], // -1,
      [0,5,6,10], // +3,
      [0,1,5,7], // -5 (flattest)
    ]
  },
  "Tetratonic 12": {
    familyIndex: 12, // -6 / +6 = 12
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,4,8,11], // +5,
      [0,4,7,8], // +1,
      [0,3,4,8], // -3,
      [0,1,5,9], // -3 (flattest)
    ]
  },
  "Tetratonic 13": {
    familyIndex: 13, // -6 / +6 = 12
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,5,7,11], // +5,
      [0,2,6,7], // -3,
      [0,4,5,10], // +1,
      [0,1,6,8], // -3 (flattest)
    ]
  },
  "Tetratonic 14": {
    familyIndex: 14, // -6 / +6 = 12
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,5,8,11], // +6,
      [0,3,6,7], // -2,
      [0,3,4,9], // -2,
      [0,1,6,9], // -2 (flattest)
    ]
  },
  "Tetratonic 15": {
    familyIndex: 15, // -6 / +6 = 12
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,2,5,10], // -1,
      [0,3,8,10], // +3,
      [0,5,7,9], // +3,
      [0,2,4,7], // -5 (flattest)
    ]
  },
  "Tetratonic 16": {
    familyIndex: 16, // -6 / +6 = 12
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,2,7,10], // +1,
      [0,5,8,10], // +5,
      [0,3,5,7], // -3,
      [0,2,4,9], // -3 (flattest)
    ]
  },
  "Tetratonic 17": {
    familyIndex: 17, // -7 / +7 = 14
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,2,6,11], // +1,
      [0,4,9,10], // +5,
      [0,5,6,8], // +1,
      [0,1,3,7], // -7 (flattest)
    ]
  },
  "Tetratonic 18": {
    familyIndex: 18, // -7 / +7 = 14
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,3,5,11], // +1,
      [0,2,8,9], // +1,
      [0,6,7,10], // +5,
      [0,1,4,6], // -7 (flattest)
    ]
  },
  "Tetratonic 19": {
    familyIndex: 19, // -7 / +7 = 14
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,1,6,10], // -1,
      [0,5,9,11], // +7,
      [0,4,6,7], // -1,
      [0,2,3,8], // -5 (flattest)
    ]
  },
  "Tetratonic 20": {
    familyIndex: 20, // -7 / +7 = 14
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,3,4,10], // -1,
      [0,1,7,9], // -1,
      [0,6,8,11], // +7,
      [0,2,5,6], // -5 (flattest)
    ]
  },
  "Tetratonic 21": {
    familyIndex: 21, // -8 / +8 = 16
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,1,6,11], // +0,
      [0,5,10,11], // +8,
      [0,5,6,7], // +0,
      [0,1,2,7], // -8 (flattest)
    ]
  },
  "Tetratonic 22": {
    familyIndex: 22, // -8 / +8 = 16
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,2,5,11], // +0,
      [0,3,9,10], // +4,
      [0,6,7,9], // +4,
      [0,1,3,6], // -8 (flattest)
    ]
  },
  "Tetratonic 23": {
    familyIndex: 23, // -8 / +8 = 16
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,2,7,11], // +2,
      [0,5,9,10], // +6,
      [0,4,5,7], // -2,
      [0,1,3,8], // -6 (flattest)
    ]
  },
  "Tetratonic 24": {
    familyIndex: 24, // -8 / +8 = 16
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,3,4,11], // +0,
      [0,1,8,9], // +0,
      [0,7,8,11], // +8,
      [0,1,4,5], // -8 (flattest)
    ]
  },
  "Tetratonic 25": {
    familyIndex: 25, // -8 / +8 = 16
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,3,8,11], // +4,
      [0,5,8,9], // +4,
      [0,3,4,7], // -4,
      [0,1,4,9], // -4 (flattest)
    ]
  },
  "Tetratonic 26": {
    familyIndex: 26, // -8 / +8 = 16
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,4,5,11], // +2,
      [0,1,7,8], // -2,
      [0,6,7,11], // +6,
      [0,1,5,6], // -6 (flattest)
    ]
  },
  "Tetratonic 27": {
    familyIndex: 27, // -8 / +8 = 16
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,1,5,10], // -2,
      [0,4,9,11], // +6,
      [0,5,7,8], // +2,
      [0,2,3,7], // -6 (flattest)
    ]
  },
  "Tetratonic 28": {
    familyIndex: 28, // -8 / +8 = 16
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,5,6,11], // +4,
      [0,1,6,7], // -4,
      [0,5,6,11], // +4,
      [0,1,6,7], // -4 (flattest)
    ]
  },
  "Tetratonic 29": {
    familyIndex: 29, // -8 / +8 = 16
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,2,3,9], // -4,
      [0,1,7,10], // +0,
      [0,6,9,11], // +8,
      [0,3,5,6], // -4 (flattest)
    ]
  },
  "Tetratonic 30": {
    familyIndex: 30, // -8 / +8 = 16
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,2,4,10], // -2,
      [0,2,8,10], // +2,
      [0,6,8,10], // +6,
      [0,2,4,6], // -6 (flattest)
    ]
  },
  "Tetratonic 31": {
    familyIndex: 31, // -10 / +10 = 20
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,1,5,11], // -1,
      [0,4,10,11], // +7,
      [0,6,7,8], // +3,
      [0,1,2,6], // -9 (flattest)
    ]
  },
  "Tetratonic 32": {
    familyIndex: 32, // -10 / +10 = 20
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,1,7,11], // +1,
      [0,6,10,11], // +9,
      [0,4,5,6], // -3,
      [0,1,2,8], // -7 (flattest)
    ]
  },
  "Tetratonic 33": {
    familyIndex: 33, // -10 / +10 = 20
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,2,4,11], // -1,
      [0,2,9,10], // +3,
      [0,7,8,10], // +7,
      [0,1,3,5], // -9 (flattest)
    ]
  },
  "Tetratonic 34": {
    familyIndex: 34, // -10 / +10 = 20
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,2,8,11], // +3,
      [0,6,9,10], // +7,
      [0,3,4,6], // -5,
      [0,1,3,9], // -5 (flattest)
    ]
  },
  "Tetratonic 35": {
    familyIndex: 35, // -10 / +10 = 20
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,1,4,10], // -3,
      [0,3,9,11], // +5,
      [0,6,8,9], // +5,
      [0,2,3,6], // -7 (flattest)
    ]
  },
  "Tetratonic 36": {
    familyIndex: 36, // -10 / +10 = 20
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,2,3,10], // -3,
      [0,1,8,10], // +1,
      [0,7,9,11], // +9,
      [0,2,4,5], // -7 (flattest)
    ]
  },
  "Tetratonic 37": {
    familyIndex: 37, // -12 / +12 = 24
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,1,4,11], // -2,
      [0,3,10,11], // +6,
      [0,7,8,9], // +6,
      [0,1,2,5], // -10 (flattest)
    ]
  },
  "Tetratonic 38": {
    familyIndex: 38, // -12 / +12 = 24
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,1,8,11], // +2,
      [0,7,10,11], // +10,
      [0,3,4,5], // -6,
      [0,1,2,9], // -6 (flattest)
    ]
  },
  "Tetratonic 39": {
    familyIndex: 39, // -12 / +12 = 24
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,2,3,11], // -2,
      [0,1,9,10], // +2,
      [0,8,9,11], // +10,
      [0,1,3,4], // -10 (flattest)
    ]
  },
  "Tetratonic 40": {
    familyIndex: 40, // -12 / +12 = 24
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,1,3,10], // -4,
      [0,2,9,11], // +4,
      [0,7,9,10], // +8,
      [0,2,3,5], // -8 (flattest)
    ]
  },
  "Tetratonic 41": {
    familyIndex: 41, // -14 / +14 = 28
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,1,3,11], // -3,
      [0,2,10,11], // +5,
      [0,8,9,10], // +9,
      [0,1,2,4], // -11 (flattest)
    ]
  },
  "Tetratonic 42": {
    familyIndex: 42, // -14 / +14 = 28
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,1,2,10], // -5,
      [0,1,9,11], // +3,
      [0,8,10,11], // +11,
      [0,2,3,4], // -9 (flattest)
    ]
  },
  "Tetratonic 43": {
    familyIndex: 43, // -16 / +16 = 32
    noteCount: 4,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4"],
    sets: [
      [0,1,2,11], // -4,
      [0,1,10,11], // +4,
      [0,9,10,11], // +12,
      [0,1,2,3], // -12 (flattest)
    ]
  },
// 5 note scales
  Pentatonic: {
    familyIndex: 1,
    noteCount: 5,
    names: ["Major Pentatonic","Suspended Pentatonic","Blues Minor","Blues Major","Minor Pentatonic"],
    sets: [
      [0,2,4,7,9],
      [0,2,5,7,10],
      [0,3,5,8,10],
      [0,2,5,7,9],
      [0,3,5,7,10]
    ]
  },
  "Pentatonic 2": {
    familyIndex: 2, // -4 / +4 = 8
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,2,4,7,10], // -1,
      [0,2,5,8,10], // +1,
      [0,3,6,8,10], // +3,
      [0,3,5,7,9], // +0,
      [0,2,4,6,9], // -3 (flattest)
    ]
  },
  "Pentatonic 3": {
    familyIndex: 3, // -5 / +5 = 10
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,3,5,8,11], // +3,
      [0,2,5,8,9], // +0,
      [0,3,6,7,10], // +2,
      [0,3,4,7,9], // -1,
      [0,1,4,6,9], // -4 (flattest)
    ]
  },
  "Pentatonic 4": {
    familyIndex: 4, // -5 / +5 = 10
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,3,6,8,11], // +4,
      [0,3,5,8,9], // +1,
      [0,2,5,6,9], // -2,
      [0,3,4,7,10], // +0,
      [0,1,4,7,9], // -3 (flattest)
    ]
  },
  "Pentatonic 5": {
    familyIndex: 5, // -6 / +6 = 12
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,2,5,7,11], // +1,
      [0,3,5,9,10], // +3,
      [0,2,6,7,9], // +0,
      [0,4,5,7,10], // +2,
      [0,1,3,6,8], // -6 (flattest)
    ]
  },
  "Pentatonic 6": {
    familyIndex: 6, // -6 / +6 = 12
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,3,5,7,11], // +2,
      [0,2,4,8,9], // -1,
      [0,2,6,7,10], // +1,
      [0,4,5,8,10], // +3,
      [0,1,4,6,8], // -5 (flattest)
    ]
  },
  "Pentatonic 7": {
    familyIndex: 7, // -6 / +6 = 12
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,2,5,6,10], // -1,
      [0,3,4,8,10], // +1,
      [0,1,5,7,9], // -2,
      [0,4,6,8,11], // +5,
      [0,2,4,7,8], // -3 (flattest)
    ]
  },
  "Pentatonic 8": {
    familyIndex: 8, // -6 / +6 = 12
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,5,7,10], // -1,
      [0,4,6,9,11], // +6,
      [0,2,5,7,8], // -2,
      [0,3,5,6,10], // +0,
      [0,2,3,7,9], // -3 (flattest)
    ]
  },
  "Pentatonic 9": {
    familyIndex: 9, // -6 / +6 = 12
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,2,4,6,10], // -2,
      [0,2,4,8,10], // +0,
      [0,2,6,8,10], // +2,
      [0,4,6,8,10], // +4,
      [0,2,4,6,8], // -4 (flattest)
    ]
  },
  "Pentatonic 10": {
    familyIndex: 10, // -7 / +7 = 14
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,2,4,7,11], // +0,
      [0,2,5,9,10], // +2,
      [0,3,7,8,10], // +4,
      [0,4,5,7,9], // +1,
      [0,1,3,5,8], // -7 (flattest)
    ]
  },
  "Pentatonic 11": {
    familyIndex: 11, // -7 / +7 = 14
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,2,5,8,11], // +2,
      [0,3,6,9,10], // +4,
      [0,3,6,7,9], // +1,
      [0,3,4,6,9], // -2,
      [0,1,3,6,9], // -5 (flattest)
    ]
  },
  "Pentatonic 12": {
    familyIndex: 12, // -7 / +7 = 14
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,3,6,7,11], // +3,
      [0,3,4,8,9], // +0,
      [0,1,5,6,9], // -3,
      [0,4,5,8,11], // +4,
      [0,1,4,7,8], // -4 (flattest)
    ]
  },
  "Pentatonic 13": {
    familyIndex: 13, // -7 / +7 = 14
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,4,7,10], // -2,
      [0,3,6,9,11], // +5,
      [0,3,6,8,9], // +2,
      [0,3,5,6,9], // -1,
      [0,2,3,6,9], // -4 (flattest)
    ]
  },
  "Pentatonic 14": {
    familyIndex: 14, // -7 / +7 = 14
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,2,3,7,10], // -2,
      [0,1,5,8,10], // +0,
      [0,4,7,9,11], // +7,
      [0,3,5,7,8], // -1,
      [0,2,4,5,9], // -4 (flattest)
    ]
  },
  "Pentatonic 15": {
    familyIndex: 15, // -8 / +8 = 16
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,5,7,11], // +0,
      [0,4,6,10,11], // +7,
      [0,2,6,7,8], // -1,
      [0,4,5,6,10], // +1,
      [0,1,2,6,8], // -7 (flattest)
    ]
  },
  "Pentatonic 16": {
    familyIndex: 16, // -8 / +8 = 16
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,2,5,6,11], // +0,
      [0,3,4,9,10], // +2,
      [0,1,6,7,9], // -1,
      [0,5,6,8,11], // +6,
      [0,1,3,6,7], // -7 (flattest)
    ]
  },
  "Pentatonic 17": {
    familyIndex: 17, // -8 / +8 = 16
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,2,6,8,11], // +3,
      [0,4,6,9,10], // +5,
      [0,2,5,6,8], // -3,
      [0,3,4,6,10], // -1,
      [0,1,3,7,9], // -4 (flattest)
    ]
  },
  "Pentatonic 18": {
    familyIndex: 18, // -8 / +8 = 16
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,3,4,7,11], // +1,
      [0,1,4,8,9], // -2,
      [0,3,7,8,11], // +5,
      [0,4,5,8,9], // +2,
      [0,1,4,5,8], // -6 (flattest)
    ]
  },
  "Pentatonic 19": {
    familyIndex: 19, // -8 / +8 = 16
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,3,4,8,11], // +2,
      [0,1,5,8,9], // -1,
      [0,4,7,8,11], // +6,
      [0,3,4,7,8], // -2,
      [0,1,4,5,9], // -5 (flattest)
    ]
  },
  "Pentatonic 20": {
    familyIndex: 20, // -8 / +8 = 16
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,3,5,6,11], // +1,
      [0,2,3,8,9], // -2,
      [0,1,6,7,10], // +0,
      [0,5,6,9,11], // +7,
      [0,1,4,6,7], // -6 (flattest)
    ]
  },
  "Pentatonic 21": {
    familyIndex: 21, // -8 / +8 = 16
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,4,6,10], // -3,
      [0,3,5,9,11], // +4,
      [0,2,6,8,9], // +1,
      [0,4,6,7,10], // +3,
      [0,2,3,6,8], // -5 (flattest)
    ]
  },
  "Pentatonic 22": {
    familyIndex: 22, // -9 / +9 = 18
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,4,7,11], // -1,
      [0,3,6,10,11], // +6,
      [0,3,7,8,9], // +3,
      [0,4,5,6,9], // +0,
      [0,1,2,5,8], // -8 (flattest)
    ]
  },
  "Pentatonic 23": {
    familyIndex: 23, // -9 / +9 = 18
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,5,8,11], // +1,
      [0,4,7,10,11], // +8,
      [0,3,6,7,8], // +0,
      [0,3,4,5,9], // -3,
      [0,1,2,6,9], // -6 (flattest)
    ]
  },
  "Pentatonic 24": {
    familyIndex: 24, // -9 / +9 = 18
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,2,3,7,11], // -1,
      [0,1,5,9,10], // +1,
      [0,4,8,9,11], // +8,
      [0,4,5,7,8], // +0,
      [0,1,3,4,8], // -8 (flattest)
    ]
  },
  "Pentatonic 25": {
    familyIndex: 25, // -9 / +9 = 18
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,2,4,6,11], // -1,
      [0,2,4,9,10], // +1,
      [0,2,7,8,10], // +3,
      [0,5,6,8,10], // +5,
      [0,1,3,5,7], // -8 (flattest)
    ]
  },
  "Pentatonic 26": {
    familyIndex: 26, // -9 / +9 = 18
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,2,4,8,11], // +1,
      [0,2,6,9,10], // +3,
      [0,4,7,8,10], // +5,
      [0,3,4,6,8], // -3,
      [0,1,3,5,9], // -6 (flattest)
    ]
  },
  "Pentatonic 27": {
    familyIndex: 27, // -9 / +9 = 18
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,2,6,7,11], // +2,
      [0,4,5,9,10], // +4,
      [0,1,5,6,8], // -4,
      [0,4,5,7,11], // +3,
      [0,1,3,7,8], // -5 (flattest)
    ]
  },
  "Pentatonic 28": {
    familyIndex: 28, // -9 / +9 = 18
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,2,3,6,10], // -3,
      [0,1,4,8,10], // -1,
      [0,3,7,9,11], // +6,
      [0,4,6,8,9], // +3,
      [0,2,4,5,8], // -5 (flattest)
    ]
  },
  "Pentatonic 29": {
    familyIndex: 29, // -9 / +9 = 18
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,5,6,10], // -2,
      [0,4,5,9,11], // +5,
      [0,1,5,7,8], // -3,
      [0,4,6,7,11], // +4,
      [0,2,3,7,8], // -4 (flattest)
    ]
  },
  "Pentatonic 30": {
    familyIndex: 30, // -9 / +9 = 18
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,2,4,5,10], // -3,
      [0,2,3,8,10], // -1,
      [0,1,6,8,10], // +1,
      [0,5,7,9,11], // +8,
      [0,2,4,6,7], // -5 (flattest)
    ]
  },
  "Pentatonic 31": {
    familyIndex: 31, // -10 / +10 = 20
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,3,6,10], // -4,
      [0,2,5,9,11], // +3,
      [0,3,7,9,10], // +5,
      [0,4,6,7,9], // +2,
      [0,2,3,5,8], // -6 (flattest)
    ]
  },
  "Pentatonic 32": {
    familyIndex: 32, // -10 / +10 = 20
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,3,7,10], // -3,
      [0,2,6,9,11], // +4,
      [0,4,7,9,10], // +6,
      [0,3,5,6,8], // -2,
      [0,2,3,5,9], // -5 (flattest)
    ]
  },
  "Pentatonic 33": {
    familyIndex: 33, // -10 / +10 = 20
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,3,4,6,11], // +0,
      [0,1,3,8,9], // -3,
      [0,2,7,8,11], // +4,
      [0,5,6,9,10], // +6,
      [0,1,4,5,7], // -7 (flattest)
    ]
  },
  "Pentatonic 34": {
    familyIndex: 34, // -10 / +10 = 20
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,4,5,10], // -4,
      [0,3,4,9,11], // +3,
      [0,1,6,8,9], // +0,
      [0,5,7,8,11], // +7,
      [0,2,3,6,7], // -6 (flattest)
    ]
  },
  "Pentatonic 35": {
    familyIndex: 35, // -11 / +11 = 22
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,4,6,11], // -2,
      [0,3,5,10,11], // +5,
      [0,2,7,8,9], // +2,
      [0,5,6,7,10], // +4,
      [0,1,2,5,7], // -9 (flattest)
    ]
  },
  "Pentatonic 36": {
    familyIndex: 36, // -11 / +11 = 22
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,4,8,11], // +0,
      [0,3,7,10,11], // +7,
      [0,4,7,8,9], // +4,
      [0,3,4,5,8], // -4,
      [0,1,2,5,9], // -7 (flattest)
    ]
  },
  "Pentatonic 37": {
    familyIndex: 37, // -11 / +11 = 22
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,5,6,11], // -1,
      [0,4,5,10,11], // +6,
      [0,1,6,7,8], // -2,
      [0,5,6,7,11], // +5,
      [0,1,2,6,7], // -8 (flattest)
    ]
  },
  "Pentatonic 38": {
    familyIndex: 38, // -11 / +11 = 22
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,6,7,11], // +1,
      [0,5,6,10,11], // +8,
      [0,1,5,6,7], // -5,
      [0,4,5,6,11], // +2,
      [0,1,2,7,8], // -6 (flattest)
    ]
  },
  "Pentatonic 39": {
    familyIndex: 39, // -11 / +11 = 22
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,6,8,11], // +2,
      [0,5,7,10,11], // +9,
      [0,2,5,6,7], // -4,
      [0,3,4,5,10], // -2,
      [0,1,2,7,9], // -5 (flattest)
    ]
  },
  "Pentatonic 40": {
    familyIndex: 40, // -11 / +11 = 22
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,2,3,6,11], // -2,
      [0,1,4,9,10], // +0,
      [0,3,8,9,11], // +7,
      [0,5,6,8,9], // +4,
      [0,1,3,4,7], // -9 (flattest)
    ]
  },
  "Pentatonic 41": {
    familyIndex: 41, // -11 / +11 = 22
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,2,3,8,11], // +0,
      [0,1,6,9,10], // +2,
      [0,5,8,9,11], // +9,
      [0,3,4,6,7], // -4,
      [0,1,3,4,9], // -7 (flattest)
    ]
  },
  "Pentatonic 42": {
    familyIndex: 42, // -11 / +11 = 22
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,2,4,5,11], // -2,
      [0,2,3,9,10], // +0,
      [0,1,7,8,10], // +2,
      [0,6,7,9,11], // +9,
      [0,1,3,5,6], // -9 (flattest)
    ]
  },
  "Pentatonic 43": {
    familyIndex: 43, // -12 / +12 = 24
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,3,7,11], // -2,
      [0,2,6,10,11], // +5,
      [0,4,8,9,10], // +7,
      [0,4,5,6,8], // -1,
      [0,1,2,4,8], // -9 (flattest)
    ]
  },
  "Pentatonic 44": {
    familyIndex: 44, // -12 / +12 = 24
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,2,6,10], // -5,
      [0,1,5,9,11], // +2,
      [0,4,8,10,11], // +9,
      [0,4,6,7,8], // +1,
      [0,2,3,4,8], // -7 (flattest)
    ]
  },
  "Pentatonic 45": {
    familyIndex: 45, // -12 / +12 = 24
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,3,5,10], // -5,
      [0,2,4,9,11], // +2,
      [0,2,7,9,10], // +4,
      [0,5,7,8,10], // +6,
      [0,2,3,5,7], // -7 (flattest)
    ]
  },
  "Pentatonic 46": {
    familyIndex: 46, // -12 / +12 = 24
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,2,3,5,10], // -4,
      [0,1,3,8,10], // -2,
      [0,2,7,9,11], // +5,
      [0,5,7,9,10], // +7,
      [0,2,4,5,7], // -6 (flattest)
    ]
  },
  "Pentatonic 47": {
    familyIndex: 47, // -13 / +13 = 26
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,3,6,11], // -3,
      [0,2,5,10,11], // +4,
      [0,3,8,9,10], // +6,
      [0,5,6,7,9], // +3,
      [0,1,2,4,7], // -10 (flattest)
    ]
  },
  "Pentatonic 48": {
    familyIndex: 48, // -13 / +13 = 26
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,4,5,11], // -3,
      [0,3,4,10,11], // +4,
      [0,1,7,8,9], // +1,
      [0,6,7,8,11], // +8,
      [0,1,2,5,6], // -10 (flattest)
    ]
  },
  "Pentatonic 49": {
    familyIndex: 49, // -13 / +13 = 26
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,2,7,10], // -4,
      [0,1,6,9,11], // +3,
      [0,5,8,10,11], // +10,
      [0,3,5,6,7], // -3,
      [0,2,3,4,9], // -6 (flattest)
    ]
  },
  "Pentatonic 50": {
    familyIndex: 50, // -13 / +13 = 26
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,3,4,5,11], // -1,
      [0,1,2,8,9], // -4,
      [0,1,7,8,11], // +3,
      [0,6,7,10,11], // +10,
      [0,1,4,5,6], // -8 (flattest)
    ]
  },
  "Pentatonic 51": {
    familyIndex: 51, // -14 / +14 = 28
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,3,8,11], // -1,
      [0,2,7,10,11], // +6,
      [0,5,8,9,10], // +8,
      [0,3,4,5,7], // -5,
      [0,1,2,4,9], // -8 (flattest)
    ]
  },
  "Pentatonic 52": {
    familyIndex: 52, // -14 / +14 = 28
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,2,5,10], // -6,
      [0,1,4,9,11], // +1,
      [0,3,8,10,11], // +8,
      [0,5,7,8,9], // +5,
      [0,2,3,4,7], // -8 (flattest)
    ]
  },
  "Pentatonic 53": {
    familyIndex: 53, // -14 / +14 = 28
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,2,3,5,11], // -3,
      [0,1,3,9,10], // -1,
      [0,2,8,9,11], // +6,
      [0,6,7,9,10], // +8,
      [0,1,3,4,6], // -10 (flattest)
    ]
  },
  "Pentatonic 54": {
    familyIndex: 54, // -14 / +14 = 28
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,3,4,10], // -6,
      [0,2,3,9,11], // +1,
      [0,1,7,9,10], // +3,
      [0,6,8,9,11], // +10,
      [0,2,3,5,6], // -8 (flattest)
    ]
  },
  "Pentatonic 55": {
    familyIndex: 55, // -15 / +15 = 30
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,2,6,11], // -4,
      [0,1,5,10,11], // +3,
      [0,4,9,10,11], // +10,
      [0,5,6,7,8], // +2,
      [0,1,2,3,7], // -11 (flattest)
    ]
  },
  "Pentatonic 56": {
    familyIndex: 56, // -15 / +15 = 30
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,2,7,11], // -3,
      [0,1,6,10,11], // +4,
      [0,5,9,10,11], // +11,
      [0,4,5,6,7], // -2,
      [0,1,2,3,8], // -10 (flattest)
    ]
  },
  "Pentatonic 57": {
    familyIndex: 57, // -15 / +15 = 30
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,3,5,11], // -4,
      [0,2,4,10,11], // +3,
      [0,2,8,9,10], // +5,
      [0,6,7,8,10], // +7,
      [0,1,2,4,6], // -11 (flattest)
    ]
  },
  "Pentatonic 58": {
    familyIndex: 58, // -15 / +15 = 30
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,2,3,4,10], // -5,
      [0,1,2,8,10], // -3,
      [0,1,7,9,11], // +4,
      [0,6,8,10,11], // +11,
      [0,2,4,5,6], // -7 (flattest)
    ]
  },
  "Pentatonic 59": {
    familyIndex: 59, // -16 / +16 = 32
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,2,4,10], // -7,
      [0,1,3,9,11], // +0,
      [0,2,8,10,11], // +7,
      [0,6,8,9,10], // +9,
      [0,2,3,4,6], // -9 (flattest)
    ]
  },
  "Pentatonic 60": {
    familyIndex: 60, // -17 / +17 = 34
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,2,5,11], // -5,
      [0,1,4,10,11], // +2,
      [0,3,9,10,11], // +9,
      [0,6,7,8,9], // +6,
      [0,1,2,3,6], // -12 (flattest)
    ]
  },
  "Pentatonic 61": {
    familyIndex: 61, // -17 / +17 = 34
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,2,8,11], // -2,
      [0,1,7,10,11], // +5,
      [0,6,9,10,11], // +12,
      [0,3,4,5,6], // -6,
      [0,1,2,3,9], // -9 (flattest)
    ]
  },
  "Pentatonic 62": {
    familyIndex: 62, // -17 / +17 = 34
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,3,4,11], // -5,
      [0,2,3,10,11], // +2,
      [0,1,8,9,10], // +4,
      [0,7,8,9,11], // +11,
      [0,1,2,4,5], // -12 (flattest)
    ]
  },
  "Pentatonic 63": {
    familyIndex: 63, // -17 / +17 = 34
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,2,3,4,11], // -4,
      [0,1,2,9,10], // -2,
      [0,1,8,9,11], // +5,
      [0,7,8,10,11], // +12,
      [0,1,3,4,5], // -11 (flattest)
    ]
  },
  "Pentatonic 64": {
    familyIndex: 64, // -19 / +19 = 38
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,2,4,11], // -6,
      [0,1,3,10,11], // +1,
      [0,2,9,10,11], // +8,
      [0,7,8,9,10], // +10,
      [0,1,2,3,5], // -13 (flattest)
    ]
  },
  "Pentatonic 65": {
    familyIndex: 65, // -19 / +19 = 38
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,2,3,10], // -8,
      [0,1,2,9,11], // -1,
      [0,1,8,10,11], // +6,
      [0,7,9,10,11], // +13,
      [0,2,3,4,5], // -10 (flattest)
    ]
  },
  "Pentatonic 66": {
    familyIndex: 66, // -21 / +21 = 42
    noteCount: 5,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,2,3,11], // -7,
      [0,1,2,10,11], // +0,
      [0,1,9,10,11], // +7,
      [0,8,9,10,11], // +14,
      [0,1,2,3,4], // -14 (flattest)
    ]
  },
// 6 note scales
"Whole tone": {
    familyIndex: 1,
    noteCount: 6,
    names: ["Whole Tone"],
    sets: [
      [0,2,4,6,8,10],
    ]
  },
  "Hexatonic 2": {
    familyIndex: 2, // -5 / +5 = 10
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,4,6,8,11], // +1,
      [0,2,4,6,9,10], // +1,
      [0,2,4,7,8,10], // +1,
      [0,2,5,6,8,10], // +1,
      [0,3,4,6,8,10], // +1,
      [0,1,3,5,7,9], // -5 (flattest)
    ]
  },
  "Hexatonic 3": {
    familyIndex: 3, // -5 / +5 = 10
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,3,5,7,9,11], // +5,
      [0,2,4,6,8,9], // -1,
      [0,2,4,6,7,10], // -1,
      [0,2,4,5,8,10], // -1,
      [0,2,3,6,8,10], // -1,
      [0,1,4,6,8,10], // -1 (flattest)
    ]
  },
  "Hexatonic 4": {
    familyIndex: 4, // -6 / +6 = 12
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,4,6,8,11], // +0,
      [0,3,5,7,10,11], // +6,
      [0,2,4,7,8,9], // +0,
      [0,2,5,6,7,10], // +0,
      [0,3,4,5,8,10], // +0,
      [0,1,2,5,7,9], // -6 (flattest)
    ]
  },
  "Hexatonic 5": {
    familyIndex: 5, // -6 / +6 = 12
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,3,6,8,11], // +0,
      [0,1,4,6,9,10], // +0,
      [0,3,5,8,9,11], // +6,
      [0,2,5,6,8,9], // +0,
      [0,3,4,6,7,10], // +0,
      [0,1,3,4,7,9], // -6 (flattest)
    ]
  },
  "Hexatonic 6": {
    familyIndex: 6, // -6 / +6 = 12
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,4,5,8,11], // +0,
      [0,2,3,6,9,10], // +0,
      [0,1,4,7,8,10], // +0,
      [0,3,6,7,9,11], // +6,
      [0,3,4,6,8,9], // +0,
      [0,1,3,5,6,9], // -6 (flattest)
    ]
  },
  "Hexatonic 7": {
    familyIndex: 7, // -6 / +6 = 12
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,4,6,7,11], // +0,
      [0,2,4,5,9,10], // +0,
      [0,2,3,7,8,10], // +0,
      [0,1,5,6,8,10], // +0,
      [0,4,5,7,9,11], // +6,
      [0,1,3,5,7,8], // -6 (flattest)
    ]
  },
  "Hexatonic 8": {
    familyIndex: 8, // -8 / +8 = 16
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,4,6,9,11], // +2,
      [0,2,4,7,9,10], // +2,
      [0,2,5,7,8,10], // +2,
      [0,3,5,6,8,10], // +2,
      [0,2,3,5,7,9], // -4,
      [0,1,3,5,7,10], // -4 (flattest)
    ]
  },
  "Hexatonic 9": {
    familyIndex: 9, // -8 / +8 = 16
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,4,7,8,11], // +2,
      [0,2,5,6,9,10], // +2,
      [0,3,4,7,8,10], // +2,
      [0,1,4,5,7,9], // -4,
      [0,3,4,6,8,11], // +2,
      [0,1,3,5,8,9], // -4 (flattest)
    ]
  },
  "Hexatonic 10": {
    familyIndex: 10, // -8 / +8 = 16
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,5,6,8,11], // +2,
      [0,3,4,6,9,10], // +2,
      [0,1,3,6,7,9], // -4,
      [0,2,5,6,8,11], // +2,
      [0,3,4,6,9,10], // +2,
      [0,1,3,6,7,9], // -4 (flattest)
    ]
  },
  "Hexatonic 11": {
    familyIndex: 11, // -8 / +8 = 16
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,5,7,9,11], // +4,
      [0,3,5,7,9,10], // +4,
      [0,2,4,6,7,9], // -2,
      [0,2,4,5,7,10], // -2,
      [0,2,3,5,8,10], // -2,
      [0,1,3,6,8,10], // -2 (flattest)
    ]
  },
  "Hexatonic 12": {
    familyIndex: 12, // -8 / +8 = 16
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,3,4,7,9,11], // +4,
      [0,1,4,6,8,9], // -2,
      [0,3,5,7,8,11], // +4,
      [0,2,4,5,8,9], // -2,
      [0,2,3,6,7,10], // -2,
      [0,1,4,5,8,10], // -2 (flattest)
    ]
  },
  "Hexatonic 13": {
    familyIndex: 13, // -8 / +8 = 16
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,3,5,6,9,11], // +4,
      [0,2,3,6,8,9], // -2,
      [0,1,4,6,7,10], // -2,
      [0,3,5,6,9,11], // +4,
      [0,2,3,6,8,9], // -2,
      [0,1,4,6,7,10], // -2 (flattest)
    ]
  },
  "Hexatonic 14": {
    familyIndex: 14, // -9 / +9 = 18
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,4,7,9,11], // +3,
      [0,2,5,7,9,10], // +3,
      [0,3,5,7,8,10], // +3,
      [0,2,4,5,7,9], // -3,
      [0,2,3,5,7,10], // -3,
      [0,1,3,5,8,10], // -3 (flattest)
    ]
  },
  "Hexatonic 15": {
    familyIndex: 15, // -9 / +9 = 18
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,5,6,9,11], // +3,
      [0,3,4,7,9,10], // +3,
      [0,1,4,6,7,9], // -3,
      [0,3,5,6,8,11], // +3,
      [0,2,3,5,8,9], // -3,
      [0,1,3,6,7,10], // -3 (flattest)
    ]
  },
  "Hexatonic 16": {
    familyIndex: 16, // -9 / +9 = 18
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,5,7,8,11], // +3,
      [0,3,5,6,9,10], // +3,
      [0,2,3,6,7,9], // -3,
      [0,1,4,5,7,10], // -3,
      [0,3,4,6,9,11], // +3,
      [0,1,3,6,8,9], // -3 (flattest)
    ]
  },
  "Hexatonic 17": {
    familyIndex: 17, // -9 / +9 = 18
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,3,4,7,8,11], // +3,
      [0,1,4,5,8,9], // -3,
      [0,3,4,7,8,11], // +3,
      [0,1,4,5,8,9], // -3,
      [0,3,4,7,8,11], // +3,
      [0,1,4,5,8,9], // -3 (flattest)
    ]
  },
  "Hexatonic 18": {
    familyIndex: 18, // -10 / +10 = 20
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,3,6,8,11], // -1,
      [0,2,5,7,10,11], // +5,
      [0,3,5,8,9,10], // +5,
      [0,2,5,6,7,9], // -1,
      [0,3,4,5,7,10], // -1,
      [0,1,2,4,7,9], // -7 (flattest)
    ]
  },
  "Hexatonic 19": {
    familyIndex: 19, // -10 / +10 = 20
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,4,5,8,11], // -1,
      [0,3,4,7,10,11], // +5,
      [0,1,4,7,8,9], // -1,
      [0,3,6,7,8,11], // +5,
      [0,3,4,5,8,9], // -1,
      [0,1,2,5,6,9], // -7 (flattest)
    ]
  },
  "Hexatonic 20": {
    familyIndex: 20, // -10 / +10 = 20
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,4,6,7,11], // -1,
      [0,3,5,6,10,11], // +5,
      [0,2,3,7,8,9], // -1,
      [0,1,5,6,7,10], // -1,
      [0,4,5,6,9,11], // +5,
      [0,1,2,5,7,8], // -7 (flattest)
    ]
  },
  "Hexatonic 21": {
    familyIndex: 21, // -10 / +10 = 20
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,4,6,9,11], // +1,
      [0,3,5,8,10,11], // +7,
      [0,2,5,7,8,9], // +1,
      [0,3,5,6,7,10], // +1,
      [0,2,3,4,7,9], // -5,
      [0,1,2,5,7,10], // -5 (flattest)
    ]
  },
  "Hexatonic 22": {
    familyIndex: 22, // -10 / +10 = 20
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,4,7,8,11], // +1,
      [0,3,6,7,10,11], // +7,
      [0,3,4,7,8,9], // +1,
      [0,1,4,5,6,9], // -5,
      [0,3,4,5,8,11], // +1,
      [0,1,2,5,8,9], // -5 (flattest)
    ]
  },
  "Hexatonic 23": {
    familyIndex: 23, // -10 / +10 = 20
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,5,6,8,11], // +1,
      [0,4,5,7,10,11], // +7,
      [0,1,3,6,7,8], // -5,
      [0,2,5,6,7,11], // +1,
      [0,3,4,5,9,10], // +1,
      [0,1,2,6,7,9], // -5 (flattest)
    ]
  },
  "Hexatonic 24": {
    familyIndex: 24, // -10 / +10 = 20
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,3,5,8,11], // -1,
      [0,1,3,6,9,10], // -1,
      [0,2,5,8,9,11], // +5,
      [0,3,6,7,9,10], // +5,
      [0,3,4,6,7,9], // -1,
      [0,1,3,4,6,9], // -7 (flattest)
    ]
  },
  "Hexatonic 25": {
    familyIndex: 25, // -10 / +10 = 20
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,3,6,7,11], // -1,
      [0,1,4,5,9,10], // -1,
      [0,3,4,8,9,11], // +5,
      [0,1,5,6,8,9], // -1,
      [0,4,5,7,8,11], // +5,
      [0,1,3,4,7,8], // -7 (flattest)
    ]
  },
  "Hexatonic 26": {
    familyIndex: 26, // -10 / +10 = 20
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,3,6,9,11], // +1,
      [0,1,4,7,9,10], // +1,
      [0,3,6,8,9,11], // +7,
      [0,3,5,6,8,9], // +1,
      [0,2,3,5,6,9], // -5,
      [0,1,3,4,7,10], // -5 (flattest)
    ]
  },
  "Hexatonic 27": {
    familyIndex: 27, // -10 / +10 = 20
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,3,7,8,11], // +1,
      [0,1,5,6,9,10], // +1,
      [0,4,5,8,9,11], // +7,
      [0,1,4,5,7,8], // -5,
      [0,3,4,6,7,11], // +1,
      [0,1,3,4,8,9], // -5 (flattest)
    ]
  },
  "Hexatonic 28": {
    familyIndex: 28, // -10 / +10 = 20
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,4,5,7,11], // -1,
      [0,2,3,5,9,10], // -1,
      [0,1,3,7,8,10], // -1,
      [0,2,6,7,9,11], // +5,
      [0,4,5,7,9,10], // +5,
      [0,1,3,5,6,8], // -7 (flattest)
    ]
  },
  "Hexatonic 29": {
    familyIndex: 29, // -10 / +10 = 20
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,4,5,9,11], // +1,
      [0,2,3,7,9,10], // +1,
      [0,1,5,7,8,10], // +1,
      [0,4,6,7,9,11], // +7,
      [0,2,3,5,7,8], // -5,
      [0,1,3,5,6,10], // -5 (flattest)
    ]
  },
  "Hexatonic 30": {
    familyIndex: 30, // -12 / +12 = 24
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,3,5,7,11], // -3,
      [0,2,4,6,10,11], // +3,
      [0,2,4,8,9,10], // +3,
      [0,2,6,7,8,10], // +3,
      [0,4,5,6,8,10], // +3,
      [0,1,2,4,6,8], // -9 (flattest)
    ]
  },
  "Hexatonic 31": {
    familyIndex: 31, // -12 / +12 = 24
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,3,5,8,11], // -2,
      [0,2,4,7,10,11], // +4,
      [0,2,5,8,9,10], // +4,
      [0,3,6,7,8,10], // +4,
      [0,3,4,5,7,9], // -2,
      [0,1,2,4,6,9], // -8 (flattest)
    ]
  },
  "Hexatonic 32": {
    familyIndex: 32, // -12 / +12 = 24
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,3,6,7,11], // -2,
      [0,2,5,6,10,11], // +4,
      [0,3,4,8,9,10], // +4,
      [0,1,5,6,7,9], // -2,
      [0,4,5,6,8,11], // +4,
      [0,1,2,4,7,8], // -8 (flattest)
    ]
  },
  "Hexatonic 33": {
    familyIndex: 33, // -12 / +12 = 24
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,3,6,9,11], // +0,
      [0,2,5,8,10,11], // +6,
      [0,3,6,8,9,10], // +6,
      [0,3,5,6,7,9], // +0,
      [0,2,3,4,6,9], // -6,
      [0,1,2,4,7,10], // -6 (flattest)
    ]
  },
  "Hexatonic 34": {
    familyIndex: 34, // -12 / +12 = 24
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,3,7,8,11], // +0,
      [0,2,6,7,10,11], // +6,
      [0,4,5,8,9,10], // +6,
      [0,1,4,5,6,8], // -6,
      [0,3,4,5,7,11], // +0,
      [0,1,2,4,8,9], // -6 (flattest)
    ]
  },
  "Hexatonic 35": {
    familyIndex: 35, // -12 / +12 = 24
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,4,5,7,11], // -2,
      [0,3,4,6,10,11], // +4,
      [0,1,3,7,8,9], // -2,
      [0,2,6,7,8,11], // +4,
      [0,4,5,6,9,10], // +4,
      [0,1,2,5,6,8], // -8 (flattest)
    ]
  },
  "Hexatonic 36": {
    familyIndex: 36, // -12 / +12 = 24
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,4,5,9,11], // +0,
      [0,3,4,8,10,11], // +6,
      [0,1,5,7,8,9], // +0,
      [0,4,6,7,8,11], // +6,
      [0,2,3,4,7,8], // -6,
      [0,1,2,5,6,10], // -6 (flattest)
    ]
  },
  "Hexatonic 37": {
    familyIndex: 37, // -12 / +12 = 24
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,4,7,9,11], // +2,
      [0,3,6,8,10,11], // +8,
      [0,3,5,7,8,9], // +2,
      [0,2,4,5,6,9], // -4,
      [0,2,3,4,7,10], // -4,
      [0,1,2,5,8,10], // -4 (flattest)
    ]
  },
  "Hexatonic 38": {
    familyIndex: 38, // -12 / +12 = 24
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,5,6,7,11], // +0,
      [0,4,5,6,10,11], // +6,
      [0,1,2,6,7,8], // -6,
      [0,1,5,6,7,11], // +0,
      [0,4,5,6,10,11], // +6,
      [0,1,2,6,7,8], // -6 (flattest)
    ]
  },
  "Hexatonic 39": {
    familyIndex: 39, // -12 / +12 = 24
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,5,6,9,11], // +2,
      [0,4,5,8,10,11], // +8,
      [0,1,4,6,7,8], // -4,
      [0,3,5,6,7,11], // +2,
      [0,2,3,4,8,9], // -4,
      [0,1,2,6,7,10], // -4 (flattest)
    ]
  },
  "Hexatonic 40": {
    familyIndex: 40, // -12 / +12 = 24
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,5,7,8,11], // +2,
      [0,4,6,7,10,11], // +8,
      [0,2,3,6,7,8], // -4,
      [0,1,4,5,6,10], // -4,
      [0,3,4,5,9,11], // +2,
      [0,1,2,6,8,9], // -4 (flattest)
    ]
  },
  "Hexatonic 41": {
    familyIndex: 41, // -12 / +12 = 24
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,5,7,9,11], // +3,
      [0,4,6,8,10,11], // +9,
      [0,2,4,6,7,8], // -3,
      [0,2,4,5,6,10], // -3,
      [0,2,3,4,8,10], // -3,
      [0,1,2,6,8,10], // -3 (flattest)
    ]
  },
  "Hexatonic 42": {
    familyIndex: 42, // -12 / +12 = 24
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,3,5,7,11], // -2,
      [0,1,3,5,9,10], // -2,
      [0,2,4,8,9,11], // +4,
      [0,2,6,7,9,10], // +4,
      [0,4,5,7,8,10], // +4,
      [0,1,3,4,6,8], // -8 (flattest)
    ]
  },
  "Hexatonic 43": {
    familyIndex: 43, // -12 / +12 = 24
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,3,5,9,11], // +0,
      [0,1,3,7,9,10], // +0,
      [0,2,6,8,9,11], // +6,
      [0,4,6,7,9,10], // +6,
      [0,2,3,5,6,8], // -6,
      [0,1,3,4,6,10], // -6 (flattest)
    ]
  },
  "Hexatonic 44": {
    familyIndex: 44, // -12 / +12 = 24
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,3,7,9,11], // +2,
      [0,1,5,7,9,10], // +2,
      [0,4,6,8,9,11], // +8,
      [0,2,4,5,7,8], // -4,
      [0,2,3,5,6,10], // -4,
      [0,1,3,4,8,10], // -4 (flattest)
    ]
  },
  "Hexatonic 45": {
    familyIndex: 45, // -14 / +14 = 28
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,2,5,7,11], // -4,
      [0,1,4,6,10,11], // +2,
      [0,3,5,9,10,11], // +8,
      [0,2,6,7,8,9], // +2,
      [0,4,5,6,7,10], // +2,
      [0,1,2,3,6,8], // -10 (flattest)
    ]
  },
  "Hexatonic 46": {
    familyIndex: 46, // -14 / +14 = 28
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,2,6,8,11], // -2,
      [0,1,5,7,10,11], // +4,
      [0,4,6,9,10,11], // +10,
      [0,2,5,6,7,8], // -2,
      [0,3,4,5,6,10], // -2,
      [0,1,2,3,7,9], // -8 (flattest)
    ]
  },
  "Hexatonic 47": {
    familyIndex: 47, // -14 / +14 = 28
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,3,4,7,11], // -4,
      [0,2,3,6,10,11], // +2,
      [0,1,4,8,9,10], // +2,
      [0,3,7,8,9,11], // +8,
      [0,4,5,6,8,9], // +2,
      [0,1,2,4,5,8], // -10 (flattest)
    ]
  },
  "Hexatonic 48": {
    familyIndex: 48, // -14 / +14 = 28
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,3,5,6,11], // -4,
      [0,2,4,5,10,11], // +2,
      [0,2,3,8,9,10], // +2,
      [0,1,6,7,8,10], // +2,
      [0,5,6,7,9,11], // +8,
      [0,1,2,4,6,7], // -10 (flattest)
    ]
  },
  "Hexatonic 49": {
    familyIndex: 49, // -14 / +14 = 28
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,3,4,8,11], // -2,
      [0,1,2,6,9,10], // -2,
      [0,1,5,8,9,11], // +4,
      [0,4,7,8,10,11], // +10,
      [0,3,4,6,7,8], // -2,
      [0,1,3,4,5,9], // -8 (flattest)
    ]
  },
  "Hexatonic 50": {
    familyIndex: 50, // -14 / +14 = 28
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,4,5,6,11], // -2,
      [0,2,3,4,9,10], // -2,
      [0,1,2,7,8,10], // -2,
      [0,1,6,7,9,11], // +4,
      [0,5,6,8,10,11], // +10,
      [0,1,3,5,6,7], // -8 (flattest)
    ]
  },
  "Hexatonic 51": {
    familyIndex: 51, // -15 / +15 = 30
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,2,5,8,11], // -3,
      [0,1,4,7,10,11], // +3,
      [0,3,6,9,10,11], // +9,
      [0,3,6,7,8,9], // +3,
      [0,3,4,5,6,9], // -3,
      [0,1,2,3,6,9], // -9 (flattest)
    ]
  },
  "Hexatonic 52": {
    familyIndex: 52, // -15 / +15 = 30
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,2,6,7,11], // -3,
      [0,1,5,6,10,11], // +3,
      [0,4,5,9,10,11], // +9,
      [0,1,5,6,7,8], // -3,
      [0,4,5,6,7,11], // +3,
      [0,1,2,3,7,8], // -9 (flattest)
    ]
  },
  "Hexatonic 53": {
    familyIndex: 53, // -15 / +15 = 30
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,3,4,8,11], // -3,
      [0,2,3,7,10,11], // +3,
      [0,1,5,8,9,10], // +3,
      [0,4,7,8,9,11], // +9,
      [0,3,4,5,7,8], // -3,
      [0,1,2,4,5,9], // -9 (flattest)
    ]
  },
  "Hexatonic 54": {
    familyIndex: 54, // -15 / +15 = 30
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,3,5,9,11], // -1,
      [0,2,4,8,10,11], // +5,
      [0,2,6,8,9,10], // +5,
      [0,4,6,7,8,10], // +5,
      [0,2,3,4,6,8], // -7,
      [0,1,2,4,6,10], // -7 (flattest)
    ]
  },
  "Hexatonic 55": {
    familyIndex: 55, // -15 / +15 = 30
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,3,7,9,11], // +1,
      [0,2,6,8,10,11], // +7,
      [0,4,6,8,9,10], // +7,
      [0,2,4,5,6,8], // -5,
      [0,2,3,4,6,10], // -5,
      [0,1,2,4,8,10], // -5 (flattest)
    ]
  },
  "Hexatonic 56": {
    familyIndex: 56, // -15 / +15 = 30
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,4,5,6,11], // -3,
      [0,3,4,5,10,11], // +3,
      [0,1,2,7,8,9], // -3,
      [0,1,6,7,8,11], // +3,
      [0,5,6,7,10,11], // +9,
      [0,1,2,5,6,7], // -9 (flattest)
    ]
  },
  "Hexatonic 57": {
    familyIndex: 57, // -15 / +15 = 30
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,3,4,7,11], // -3,
      [0,1,2,5,9,10], // -3,
      [0,1,4,8,9,11], // +3,
      [0,3,7,8,10,11], // +9,
      [0,4,5,7,8,9], // +3,
      [0,1,3,4,5,8], // -9 (flattest)
    ]
  },
  "Hexatonic 58": {
    familyIndex: 58, // -15 / +15 = 30
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,3,5,6,11], // -3,
      [0,1,3,4,9,10], // -3,
      [0,2,3,8,9,11], // +3,
      [0,1,6,7,9,10], // +3,
      [0,5,6,8,9,11], // +9,
      [0,1,3,4,6,7], // -9 (flattest)
    ]
  },
  "Hexatonic 59": {
    familyIndex: 59, // -16 / +16 = 32
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,2,4,7,11], // -5,
      [0,1,3,6,10,11], // +1,
      [0,2,5,9,10,11], // +7,
      [0,3,7,8,9,10], // +7,
      [0,4,5,6,7,9], // +1,
      [0,1,2,3,5,8], // -11 (flattest)
    ]
  },
  "Hexatonic 60": {
    familyIndex: 60, // -16 / +16 = 32
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,2,5,6,11], // -5,
      [0,1,4,5,10,11], // +1,
      [0,3,4,9,10,11], // +7,
      [0,1,6,7,8,9], // +1,
      [0,5,6,7,8,11], // +7,
      [0,1,2,3,6,7], // -11 (flattest)
    ]
  },
  "Hexatonic 61": {
    familyIndex: 61, // -16 / +16 = 32
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,2,6,9,11], // -1,
      [0,1,5,8,10,11], // +5,
      [0,4,7,9,10,11], // +11,
      [0,3,5,6,7,8], // -1,
      [0,2,3,4,5,9], // -7,
      [0,1,2,3,7,10], // -7 (flattest)
    ]
  },
  "Hexatonic 62": {
    familyIndex: 62, // -16 / +16 = 32
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,2,7,8,11], // -1,
      [0,1,6,7,10,11], // +5,
      [0,5,6,9,10,11], // +11,
      [0,1,4,5,6,7], // -7,
      [0,3,4,5,6,11], // -1,
      [0,1,2,3,8,9], // -7 (flattest)
    ]
  },
  "Hexatonic 63": {
    familyIndex: 63, // -16 / +16 = 32
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,3,4,6,11], // -5,
      [0,2,3,5,10,11], // +1,
      [0,1,3,8,9,10], // +1,
      [0,2,7,8,9,11], // +7,
      [0,5,6,7,9,10], // +7,
      [0,1,2,4,5,7], // -11 (flattest)
    ]
  },
  "Hexatonic 64": {
    familyIndex: 64, // -16 / +16 = 32
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,3,4,5,10], // -7,
      [0,2,3,4,9,11], // -1,
      [0,1,2,7,9,10], // -1,
      [0,1,6,8,9,11], // +5,
      [0,5,7,8,10,11], // +11,
      [0,2,3,5,6,7], // -7 (flattest)
    ]
  },
  "Hexatonic 65": {
    familyIndex: 65, // -18 / +18 = 36
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,2,3,7,11], // -6,
      [0,1,2,6,10,11], // +0,
      [0,1,5,9,10,11], // +6,
      [0,4,8,9,10,11], // +12,
      [0,4,5,6,7,8], // +0,
      [0,1,2,3,4,8], // -12 (flattest)
    ]
  },
  "Hexatonic 66": {
    familyIndex: 66, // -18 / +18 = 36
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,2,4,6,11], // -6,
      [0,1,3,5,10,11], // +0,
      [0,2,4,9,10,11], // +6,
      [0,2,7,8,9,10], // +6,
      [0,5,6,7,8,10], // +6,
      [0,1,2,3,5,7], // -12 (flattest)
    ]
  },
  "Hexatonic 67": {
    familyIndex: 67, // -18 / +18 = 36
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,2,4,8,11], // -4,
      [0,1,3,7,10,11], // +2,
      [0,2,6,9,10,11], // +8,
      [0,4,7,8,9,10], // +8,
      [0,3,4,5,6,8], // -4,
      [0,1,2,3,5,9], // -10 (flattest)
    ]
  },
  "Hexatonic 68": {
    familyIndex: 68, // -18 / +18 = 36
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,2,5,9,11], // -2,
      [0,1,4,8,10,11], // +4,
      [0,3,7,9,10,11], // +10,
      [0,4,6,7,8,9], // +4,
      [0,2,3,4,5,8], // -8,
      [0,1,2,3,6,10], // -8 (flattest)
    ]
  },
  "Hexatonic 69": {
    familyIndex: 69, // -18 / +18 = 36
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,2,7,9,11], // +0,
      [0,1,6,8,10,11], // +6,
      [0,5,7,9,10,11], // +12,
      [0,2,4,5,6,7], // -6,
      [0,2,3,4,5,10], // -6,
      [0,1,2,3,8,10], // -6 (flattest)
    ]
  },
  "Hexatonic 70": {
    familyIndex: 70, // -18 / +18 = 36
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,3,4,5,11], // -6,
      [0,2,3,4,10,11], // +0,
      [0,1,2,8,9,10], // +0,
      [0,1,7,8,9,11], // +6,
      [0,6,7,8,10,11], // +12,
      [0,1,2,4,5,6], // -12 (flattest)
    ]
  },
  "Hexatonic 71": {
    familyIndex: 71, // -18 / +18 = 36
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,3,4,9,11], // -2,
      [0,2,3,8,10,11], // +4,
      [0,1,6,8,9,10], // +4,
      [0,5,7,8,9,11], // +10,
      [0,2,3,4,6,7], // -8,
      [0,1,2,4,5,10], // -8 (flattest)
    ]
  },
  "Hexatonic 72": {
    familyIndex: 72, // -18 / +18 = 36
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,3,4,6,11], // -4,
      [0,1,2,4,9,10], // -4,
      [0,1,3,8,9,11], // +2,
      [0,2,7,8,10,11], // +8,
      [0,5,6,8,9,10], // +8,
      [0,1,3,4,5,7], // -10 (flattest)
    ]
  },
  "Hexatonic 73": {
    familyIndex: 73, // -21 / +21 = 42
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,2,3,6,11], // -7,
      [0,1,2,5,10,11], // -1,
      [0,1,4,9,10,11], // +5,
      [0,3,8,9,10,11], // +11,
      [0,5,6,7,8,9], // +5,
      [0,1,2,3,4,7], // -13 (flattest)
    ]
  },
  "Hexatonic 74": {
    familyIndex: 74, // -21 / +21 = 42
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,2,3,8,11], // -5,
      [0,1,2,7,10,11], // +1,
      [0,1,6,9,10,11], // +7,
      [0,5,8,9,10,11], // +13,
      [0,3,4,5,6,7], // -5,
      [0,1,2,3,4,9], // -11 (flattest)
    ]
  },
  "Hexatonic 75": {
    familyIndex: 75, // -21 / +21 = 42
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,2,4,5,11], // -7,
      [0,1,3,4,10,11], // -1,
      [0,2,3,9,10,11], // +5,
      [0,1,7,8,9,10], // +5,
      [0,6,7,8,9,11], // +11,
      [0,1,2,3,5,6], // -13 (flattest)
    ]
  },
  "Hexatonic 76": {
    familyIndex: 76, // -21 / +21 = 42
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,2,4,9,11], // -3,
      [0,1,3,8,10,11], // +3,
      [0,2,7,9,10,11], // +9,
      [0,5,7,8,9,10], // +9,
      [0,2,3,4,5,7], // -9,
      [0,1,2,3,5,10], // -9 (flattest)
    ]
  },
  "Hexatonic 77": {
    familyIndex: 77, // -21 / +21 = 42
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,2,3,4,5,11], // -5,
      [0,1,2,3,9,10], // -5,
      [0,1,2,8,9,11], // +1,
      [0,1,7,8,10,11], // +7,
      [0,6,7,9,10,11], // +13,
      [0,1,3,4,5,6], // -11 (flattest)
    ]
  },
  "Hexatonic 78": {
    familyIndex: 78, // -24 / +24 = 48
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,2,3,5,11], // -8,
      [0,1,2,4,10,11], // -2,
      [0,1,3,9,10,11], // +4,
      [0,2,8,9,10,11], // +10,
      [0,6,7,8,9,10], // +10,
      [0,1,2,3,4,6], // -14 (flattest)
    ]
  },
  "Hexatonic 79": {
    familyIndex: 79, // -24 / +24 = 48
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,2,3,9,11], // -4,
      [0,1,2,8,10,11], // +2,
      [0,1,7,9,10,11], // +8,
      [0,6,8,9,10,11], // +14,
      [0,2,3,4,5,6], // -10,
      [0,1,2,3,4,10], // -10 (flattest)
    ]
  },
  "Hexatonic 80": {
    familyIndex: 80, // -27 / +27 = 54
    noteCount: 6,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6"],
    sets: [
      [0,1,2,3,4,11], // -9,
      [0,1,2,3,10,11], // -3,
      [0,1,2,9,10,11], // +3,
      [0,1,8,9,10,11], // +9,
      [0,7,8,9,10,11], // +15,
      [0,1,2,3,4,5], // -15 (flattest)
    ]
  },
// 7 note scales
   "Diatonic": {
    familyIndex: 1, // -6 / +6 = 12
    noteCount: 7,
    names: ["Ionian","Dorian","Phrygian","Lydian","Mixolydian","Aeolian","Locrian"],
    sets: [
      [0,2,4,5,7,9,11], // +2
      [0,2,3,5,7,9,10], //  0
      [0,1,3,5,7,8,10], // -2
      [0,2,4,6,7,9,11], // +3
      [0,2,4,5,7,9,10], // +1
      [0,2,3,5,7,8,10], // -1
      [0,1,3,5,6,8,10]  // -3 (flattest)
    ]
  },

  "Melodic Minor": {
    familyIndex: 2, // -7 / +7 = 14
    noteCount: 7,
    names: [
      "Melodic Minor","Dorian ♭2","Lydian Augmented",
      "Lydian Dominant","Mixolydian ♭6","Locrian ♮2","Altered"
    ],
    sets: [
      [0,2,3,5,7,9,11], // +1
      [0,1,3,5,7,9,10], // -1
      [0,2,4,6,8,9,11], // +4
      [0,2,4,6,7,9,10], // +2
      [0,2,4,5,7,8,10], //  0
      [0,2,3,5,6,8,10], // -2
      [0,1,3,4,6,8,10]  // -4 (flattest)
    ]
  },

  "Harmonic Minor": {
    familyIndex: 3, // -8 / +8
    noteCount: 7,
    names: [
      "Harmonic Minor","Locrian ♮6","Ionian Augmented",
      "Dorian ♯4","Phrygian Dominant","Lydian +2","Altered o7"
    ],
    sets: [
      [0,2,3,5,7,8,11], //  0
      [0,1,3,5,6,9,10], // -2
      [0,2,4,5,8,9,11], // +3
      [0,2,3,6,7,9,10], // +1
      [0,1,4,5,7,8,10], // -1
      [0,3,4,6,7,9,11], // +4
      [0,1,3,4,6,8,9]   // -5 (flattest)
    ]
  },

  "Harmonic Major": {
    familyIndex: 4, // -8 / +8
    noteCount: 7,
    names: [
      "Harmonic Major","Dorian ♭5","Phrygian ♭4",
      "Lydian ♭3","Mixolydian ♭2","Lydian Augmented +2","Locrian o7"
    ],
    sets: [
      [0,2,4,5,7,8,11], // +1
      [0,2,3,5,6,9,10], // -1
      [0,1,3,4,7,8,10], // -3
      [0,2,3,6,7,9,11], // +2
      [0,1,4,5,7,9,10], //  0
      [0,3,4,6,8,9,11], // +5
      [0,1,3,5,6,8,9]   // -4 (flattest)
    ]
  },

  "Neopolitan Major": {
    familyIndex: 5, // -9 / +9
    noteCount: 7,
    names: [
      "Neopolitan Major","Lydian Augmented +6","Lydian Augmented b7",
      "Lydian b6 b7","Locrian ♮2 ♮3","Atlered ♮2","Altered o3"
    ],
    sets: [
      [0,1,3,5,7,9,11], //  0
      [0,2,4,6,8,10,11], // +5
      [0,2,4,6,8,9,10], // +3
      [0,2,4,6,7,8,10], // +1
      [0,2,4,5,6,8,10], // -1
      [0,2,3,4,6,8,10], // -3
      [0,1,2,4,6,8,10]  // -5 (flattest)
    ]
  },

  "Neopolitan Minor": {
    familyIndex: 6, // -9 / +9
    noteCount: 7,
    names: [
      "Neopolitan Minor","Lydian +6","Mixolydian Augmented",
      "Aeolian #4","Locrian Dominant","Ionian +2","Altered o3 o7"
    ],
    sets: [
      [0,1,3,5,7,8,11], // -1
      [0,2,4,6,7,10,11], // +4
      [0,2,4,5,8,9,10], // +2
      [0,2,3,6,7,8,10], //  0
      [0,1,4,5,6,8,10], // -2
      [0,3,4,5,7,9,11], // +3
      [0,1,2,4,6,8,9]   // -6 (flattest)
    ]
  },

  "Ionian b2": {
    familyIndex: 7, // -9 / +9
    noteCount: 7,
    names: [
      "Ionian b2","Lydian Augmented +2 +6","Phrygian o7",
      "Harmonic Lydian","Mixolydian b5","Aeolian b4","Locrian o3"
    ],
    sets: [
      [0,1,4,5,7,9,11], // +1
      [0,3,4,6,8,10,11], // +6
      [0,1,3,5,7,8,9],  // -3
      [0,2,4,6,7,8,11], // +2
      [0,2,4,5,6,9,10], //  0
      [0,2,3,4,7,8,10], // -2
      [0,1,2,5,6,8,10]  // -4 (flattest)
    ]
  },

  "Double Harmonic": {
    familyIndex: 8, // -10 / +10
    noteCount: 7,
    names: [
      "Double Harmonic","Lydian +2 +6","Phrygian b4 o7",
      "Lydian b3 b6","Locrian ♮3 ♮6","Ionian Augmented +2","Locrian o3 o7"
    ],
    sets: [
      [0,1,4,5,7,8,11], //  0
      [0,3,4,6,7,10,11], // +5
      [0,1,3,4,7,8,9],  // -4
      [0,2,3,6,7,8,11], // +1
      [0,1,4,5,6,9,10], // -1
      [0,3,4,5,8,9,11], // +4
      [0,1,2,5,6,8,9]   // -5 (flattest)
    ]
  },

"Heptatonic 9": {
    familyIndex: 9, // -10 / +10 = 20
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,2,3,5,6,8,11], // -1,
      [0,1,3,4,6,9,10], // -3,
      [0,2,3,5,8,9,11], // +2,
      [0,1,3,6,7,9,10], // +0,
      [0,2,5,6,8,9,11], // +5,
      [0,3,4,6,7,9,10], // +3,
      [0,1,3,4,6,7,9], // -6 (flattest)
    ]
  },
  "Heptatonic 10": {
    familyIndex: 10, // -10 / +10 = 20
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,4,6,7,9,10], // +1,
      [0,3,5,6,8,9,11], // +6,
      [0,2,3,5,6,8,9], // -3,
      [0,1,3,4,6,7,10], // -5 (flattest)
      [0,2,3,5,6,9,11], // +0,
      [0,1,3,4,7,9,10], // -2,
      [0,2,3,6,8,9,11], // +3,
    ]
  },
  "Harmonic Locrian": {
    familyIndex: 11, // -10 / +10 = 20
    noteCount: 7,
    names: ["Harmonic Locrian", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,3,5,6,8,11], // -2,
      [0,2,4,5,7,10,11], // +3,
      [0,2,3,5,8,9,10], // +1,
      [0,1,3,6,7,8,10], // -1,
      [0,2,5,6,7,9,11], // +4,
      [0,3,4,5,7,9,10], // +2,
      [0,1,2,4,6,7,9], // -7 (flattest)
    ]
},
  "Lydian b2": {
    familyIndex: 12, // -10 / +10 = 20
    noteCount: 7,
    names: ["Lydian b2", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,4,6,7,9,11], // +2,
      [0,3,5,6,8,10,11], // +7,
      [0,2,3,5,7,8,9], // -2,
      [0,1,3,5,6,7,10], // -4 (flattest)
      [0,2,4,5,6,9,11], // +1,
      [0,2,3,4,7,9,10], // -1,
      [0,1,2,5,7,8,10], // -3,
    ]
  },
  "Melodic Locrian": {
    familyIndex: 13, // -11 / +11 = 22
    noteCount: 7,
    names: ["Melodic Locrian", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,3,5,6,9,11], // -1,
      [0,2,4,5,8,10,11], // +4,
      [0,2,3,6,8,9,10], // +2,
      [0,1,4,6,7,8,10], // +0,
      [0,3,5,6,7,9,11], // +5,
      [0,2,3,4,6,8,9], // -4,
      [0,1,2,4,6,7,10], // -6 (flattest)
    ]
  },
  "Lydian b2 b3": {
    familyIndex: 14, // -11 / +11 = 22
    noteCount: 7,
    names: ["Lydian b2 b3", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,3,6,7,9,11], // +1,
      [0,2,5,6,8,10,11], // +6,
      [0,3,4,6,8,9,10], // +4,
      [0,1,3,5,6,7,9], // -5 (flattest)
      [0,2,4,5,6,8,11], // +0,
      [0,2,3,4,6,9,10], // -2,
      [0,1,2,4,7,8,10], // -4,
    ]
  },
  "Harmonic Altered": {
    familyIndex: 15, // -11 / +11 = 22
    noteCount: 7,
    names: ["Harmonic Altered", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,3,4,6,8,11], // -3,
      [0,2,3,5,7,10,11], // +2,
      [0,1,3,5,8,9,10], // +0,
      [0,2,4,7,8,9,11], // +5,
      [0,2,5,6,7,9,10], // +3,
      [0,3,4,5,7,8,10], // +1,
      [0,1,2,4,5,7,9], // -8 (flattest)
    ]
  },

  "Lydian Augmented b2": {
    familyIndex: 16, // -11 / +11 = 22
    noteCount: 7,
    names: ["Lydian Augmented b2", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,4,6,8,9,11], // +3,
      [0,3,5,7,8,10,11], // +8,
      [0,2,4,5,7,8,9], // -1,
      [0,2,3,5,6,7,10], // -3,
      [0,1,3,4,5,8,10], // -5 (flattest)
      [0,2,3,4,7,9,11], // +0,
      [0,1,2,5,7,9,10], // -2,
    ]
  },
  "Heptatonic 17": {
    familyIndex: 17, // -12 / +12 = 24
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,4,5,6,8,11], // -1,
      [0,3,4,5,7,10,11], // +4,
      [0,1,2,4,7,8,9], // -5,
      [0,1,3,6,7,8,11], // +0,
      [0,2,5,6,7,10,11], // +5,
      [0,3,4,5,8,9,10], // +3,
      [0,1,2,5,6,7,9], // -6 (flattest)
    ]
  },
  "Heptatonic 18": {
    familyIndex: 18, // -12 / +12 = 24
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,4,6,7,8,11], // +1,
      [0,3,5,6,7,10,11], // +6,
      [0,2,3,4,7,8,9], // -3,
      [0,1,2,5,6,7,10], // -5 (flattest)
      [0,1,4,5,6,9,11], // +0,
      [0,3,4,5,8,10,11], // +5,
      [0,1,2,5,7,8,9], // -4,
    ]
  },
  "Heptatonic 19": {
    familyIndex: 19, // -12 / +12 = 24
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,3,4,7,8,11], // -2,
      [0,2,3,6,7,10,11], // +3,
      [0,1,4,5,8,9,10], // +1,
      [0,3,4,7,8,9,11], // +6,
      [0,1,4,5,6,8,9], // -3,
      [0,3,4,5,7,8,11], // +2,
      [0,1,2,4,5,8,9], // -7 (flattest)
    ]
  },

  "Heptatonic 20": {
    familyIndex: 20, // -12 / +12 = 24
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,4,5,8,9,11], // +2,
      [0,3,4,7,8,10,11], // +7,
      [0,1,4,5,7,8,9], // -2,
      [0,3,4,6,7,8,11], // +3,
      [0,1,3,4,5,8,9], // -6 (flattest)
      [0,2,3,4,7,8,11], // -1,
      [0,1,2,5,6,9,10], // -3,
    ]
  },
   "Heptatonic 21": {
    familyIndex: 21, // -13 / +13 = 26
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,2,3,4,6,8,11], // -2,
      [0,1,2,4,6,9,10], // -4,
      [0,1,3,5,8,9,11], // +1,
      [0,2,4,7,8,10,11], // +6,
      [0,2,5,6,8,9,10], // +4,
      [0,3,4,6,7,8,10], // +2,
      [0,1,3,4,5,7,9], // -7 (flattest)
    ]
  },

  "Heptatonic 22": {
    familyIndex: 22, // -13 / +13 = 26
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,4,6,8,9,10], // +2,
      [0,3,5,7,8,9,11], // +7,
      [0,2,4,5,6,8,9], // -2,
      [0,2,3,4,6,7,10], // -4,
      [0,1,2,4,5,8,10], // -6 (flattest)
      [0,1,3,4,7,9,11], // -1,
      [0,2,3,6,8,10,11], // +4,
    ]
  },

  "Heptatonic 23": {
    familyIndex: 23, // -13 / +13 = 26
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,2,5,6,8,11], // -3,
      [0,1,4,5,7,10,11], // +2,
      [0,3,4,6,9,10,11], // +7,
      [0,1,3,6,7,8,9], // -2,
      [0,2,5,6,7,8,11], // +3,
      [0,3,4,5,6,9,10], // +1,
      [0,1,2,3,6,7,9], // -8 (flattest)
    ]
  },
  "Heptatonic 24": {
    familyIndex: 24, // -13 / +13 = 26
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,4,6,7,10,11], // +3,
      [0,3,5,6,9,10,11], // +8,
      [0,2,3,6,7,8,9], // -1,
      [0,1,4,5,6,7,10], // -3,
      [0,3,4,5,6,9,11], // +2,
      [0,1,2,3,6,8,9], // -7 (flattest)
      [0,1,2,5,7,8,11], // -2,
    ]
  },
  "Heptatonic 25": {
    familyIndex: 25, // -13 / +13 = 26
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,2,3,4,8,9,10], // +0,
      [0,1,2,6,7,8,10], // -2,
      [0,1,5,6,7,9,11], // +3,
      [0,4,5,6,8,10,11], // +8,
      [0,1,2,4,6,7,8], // -8 (flattest)
      [0,1,3,5,6,7,11], // -3,
      [0,2,4,5,6,10,11], // +2,
    ]
  },
  "Heptatonic 26": {
    familyIndex: 26, // -13 / +13 = 26
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,2,4,6,8,11], // -4,
      [0,1,3,5,7,10,11], // +1,
      [0,2,4,6,9,10,11], // +6,
      [0,2,4,7,8,9,10], // +4,
      [0,2,5,6,7,8,10], // +2,
      [0,3,4,5,6,8,10], // +0,
      [0,1,2,3,5,7,9], // -9 (flattest)
    ]
  },
  "Enigmatic": {
    familyIndex: 27, // -13 / +13 = 26
    noteCount: 7,
    names: ["Enigmatic", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,4,6,8,10,11], // +4,
      [0,3,5,7,9,10,11], // +9,
      [0,2,4,6,7,8,9], // +0,
      [0,2,4,5,6,7,10], // -2,
      [0,2,3,4,5,8,10], // -4,
      [0,1,2,3,6,8,10], // -6 (flattest)
      [0,1,2,5,7,9,11], // -1,
    ]
  },
    "Heptatonic 28": {
    familyIndex: 28, // -14 / +14 = 28
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,3,4,6,9,11], // -2,
      [0,2,3,5,8,10,11], // +3,
      [0,1,3,6,8,9,10], // +1,
      [0,2,5,7,8,9,11], // +6,
      [0,3,5,6,7,9,10], // +4,
      [0,2,3,4,6,7,9], // -5,
      [0,1,2,4,5,7,10], // -7 (flattest)
    ]
  },
  "Heptatonic 29": {
    familyIndex: 29, // -14 / +14 = 28
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,3,6,8,9,11], // +2,
      [0,2,5,7,8,10,11], // +7,
      [0,3,5,6,8,9,10], // +5,
      [0,2,3,5,6,7,9], // -4,
      [0,1,3,4,5,7,10], // -6 (flattest)
      [0,2,3,4,6,9,11], // -1,
      [0,1,2,4,7,9,10], // -3,
    ]
  },
  "Heptatonic 30": {
    familyIndex: 30, // -14 / +14 = 28
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,3,4,6,7,11], // -4,
      [0,2,3,5,6,10,11], // +1,
      [0,1,3,4,8,9,10], // -1,
      [0,2,3,7,8,9,11], // +4,
      [0,1,5,6,7,9,10], // +2,
      [0,4,5,6,8,9,11], // +7,
      [0,1,2,4,5,7,8], // -9 (flattest)
    ]
  },

  "Heptatonic 31": {
    familyIndex: 31, // -14 / +14 = 28
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,5,6,8,9,11], // +4,
      [0,4,5,7,8,10,11], // +9,
      [0,1,3,4,6,7,8], // -7 (flattest)
      [0,2,3,5,6,7,11], // -2,
      [0,1,3,4,5,9,10], // -4,
      [0,2,3,4,8,9,11], // +1,
      [0,1,2,6,7,9,10], // -1,
    ]
  },
  "Heptatonic 32": {
    familyIndex: 32, // -14 / +14 = 28
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,3,4,5,7,8,9], // +0,
      [0,1,2,4,5,6,9], // -9 (flattest)
      [0,1,3,4,5,8,11], // -4,
      [0,2,3,4,7,10,11], // +1,
      [0,1,2,5,8,9,10], // -1,
      [0,1,4,7,8,9,11], // +4,
      [0,3,6,7,8,10,11], // +9,
    ]
  },
  "Heptatonic 33": {
    familyIndex: 33, // -15 / +15 = 30
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,2,4,7,8,11], // -3,
      [0,1,3,6,7,10,11], // +2,
      [0,2,5,6,9,10,11], // +7,
      [0,3,4,7,8,9,10], // +5,
      [0,1,4,5,6,7,9], // -4,
      [0,3,4,5,6,8,11], // +1,
      [0,1,2,3,5,8,9], // -8 (flattest)
    ]
  },
  "Heptatonic 34": {
    familyIndex: 34, // -15 / +15 = 30
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,4,5,8,10,11], // +3,
      [0,3,4,7,9,10,11], // +8,
      [0,1,4,6,7,8,9], // -1,
      [0,3,5,6,7,8,11], // +4,
      [0,2,3,4,5,8,9], // -5,
      [0,1,2,3,6,7,10], // -7 (flattest)
      [0,1,2,5,6,9,11], // -2,
    ]
  },
  "Heptatonic 35": {
    familyIndex: 35, // -15 / +15 = 30
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,2,4,6,7,11], // -5,
      [0,1,3,5,6,10,11], // +0,
      [0,2,4,5,9,10,11], // +5,
      [0,2,3,7,8,9,10], // +3,
      [0,1,5,6,7,8,10], // +1,
      [0,4,5,6,7,9,11], // +6,
      [0,1,2,3,5,7,8], // -10 (flattest)
    ]
  },

  "Heptatonic 36": {
    familyIndex: 36, // -15 / +15 = 30
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,5,6,8,10,11], // +5,
      [0,4,5,7,9,10,11], // +10,
      [0,1,3,5,6,7,8], // -6 (flattest)
      [0,2,4,5,6,7,11], // -1,
      [0,2,3,4,5,9,10], // -3,
      [0,1,2,3,7,8,10], // -5,
      [0,1,2,6,7,9,11], // +0,
    ]
  },
  "Heptatonic 37": {
    familyIndex: 37, // -16 / +16 = 32
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,3,4,8,9,11], // +0,
      [0,2,3,7,8,10,11], // +5,
      [0,1,5,6,8,9,10], // +3,
      [0,4,5,7,8,9,11], // +8,
      [0,1,3,4,5,7,8], // -8 (flattest)
      [0,2,3,4,6,7,11], // -3,
      [0,1,2,4,5,9,10], // -5,
    ]
  },
  "Heptatonic 38": {
    familyIndex: 38, // -16 / +16 = 32
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,2,5,6,7,11], // -4,
      [0,1,4,5,6,10,11], // +1,
      [0,3,4,5,9,10,11], // +6,
      [0,1,2,6,7,8,9], // -3,
      [0,1,5,6,7,8,11], // +2,
      [0,4,5,6,7,10,11], // +7,
      [0,1,2,3,6,7,8], // -9 (flattest)
    ]
  },
  "Heptatonic 39": {
    familyIndex: 39, // -16 / +16 = 32
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,5,6,7,10,11], // +4,
      [0,4,5,6,9,10,11], // +9,
      [0,1,2,5,6,7,8], // -7 (flattest)
      [0,1,4,5,6,7,11], // -2,
      [0,3,4,5,6,10,11], // +3,
      [0,1,2,3,7,8,9], // -6,
      [0,1,2,6,7,8,11], // -1,
    ]
  },
  "Heptatonic 40": {
    familyIndex: 40, // -16 / +16 = 32
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,2,4,5,8,11], // -5,
      [0,1,3,4,7,10,11], // +0,
      [0,2,3,6,9,10,11], // +5,
      [0,1,4,7,8,9,10], // +3,
      [0,3,6,7,8,9,11], // +8,
      [0,3,4,5,6,8,9], // -1,
      [0,1,2,3,5,6,9], // -10 (flattest)
    ]
  },

  "Heptatonic 41": {
    familyIndex: 41, // -16 / +16 = 32
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,4,7,8,10,11], // +5,
      [0,3,6,7,9,10,11], // +10,
      [0,3,4,6,7,8,9], // +1,
      [0,1,3,4,5,6,9], // -8 (flattest)
      [0,2,3,4,5,8,11], // -3,
      [0,1,2,3,6,9,10], // -5,
      [0,1,2,5,8,9,11], // +0,
    ]
  },
  "Heptatonic 42": {
    familyIndex: 42, // -16 / +16 = 32
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,2,5,7,10,11], // +0,
      [0,1,4,6,9,10,11], // +5,
      [0,3,5,8,9,10,11], // +10,
      [0,2,5,6,7,8,9], // +1,
      [0,3,4,5,6,7,10], // -1,
      [0,1,2,3,4,7,9], // -10 (flattest)
      [0,1,2,3,6,8,11], // -5,
    ]
  },

  "Heptatonic 43": {
    familyIndex: 43, // -17 / +17 = 34
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,2,4,6,9,11], // -3,
      [0,1,3,5,8,10,11], // +2,
      [0,2,4,7,9,10,11], // +7,
      [0,2,5,7,8,9,10], // +5,
      [0,3,5,6,7,8,10], // +3,
      [0,2,3,4,5,7,9], // -6,
      [0,1,2,3,5,7,10], // -8 (flattest)
    ]
  },
  "Heptatonic 44": {
    familyIndex: 44, // -17 / +17 = 34
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,3,6,8,10,11], // +3,
      [0,2,5,7,9,10,11], // +8,
      [0,3,5,7,8,9,10], // +6,
      [0,2,4,5,6,7,9], // -3,
      [0,2,3,4,5,7,10], // -5,
      [0,1,2,3,5,8,10], // -7 (flattest)
      [0,1,2,4,7,9,11], // -2,
    ]
  },
  "Heptatonic 45": {
    familyIndex: 45, // -17 / +17 = 34
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,3,4,5,7,11], // -5,
      [0,2,3,4,6,10,11], // +0,
      [0,1,2,4,8,9,10], // -2,
      [0,1,3,7,8,9,11], // +3,
      [0,2,6,7,8,10,11], // +8,
      [0,4,5,6,8,9,10], // +6,
      [0,1,2,4,5,6,8], // -10 (flattest)
    ]
  },
  "Heptatonic 46": {
    familyIndex: 46, // -17 / +17 = 34
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,5,7,8,9,11], // +5,
      [0,4,6,7,8,10,11], // +10,
      [0,2,3,4,6,7,8], // -6,
      [0,1,2,4,5,6,10], // -8 (flattest)
      [0,1,3,4,5,9,11], // -3,
      [0,2,3,4,8,10,11], // +2,
      [0,1,2,6,8,9,10], // +0,
    ]
  },

  "Heptatonic 47": {
    familyIndex: 47, // -18 / +18 = 36
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,2,4,5,7,11], // -6,
      [0,1,3,4,6,10,11], // -1,
      [0,2,3,5,9,10,11], // +4,
      [0,1,3,7,8,9,10], // +2,
      [0,2,6,7,8,9,11], // +7,
      [0,4,5,6,7,9,10], // +5,
      [0,1,2,3,5,6,8], // -11 (flattest)
    ]
  },
  "Heptatonic 48": {
    familyIndex: 48, // -18 / +18 = 36
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,5,7,8,10,11], // +6,
      [0,4,6,7,9,10,11], // +11,
      [0,2,3,5,6,7,8], // -5,
      [0,1,3,4,5,6,10], // -7 (flattest)
      [0,2,3,4,5,9,11], // -2,
      [0,1,2,3,7,9,10], // -4,
      [0,1,2,6,8,9,11], // +1,
    ]
  },
  "Heptatonic 49": {
    familyIndex: 49, // -18 / +18 = 36
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,2,3,6,7,11], // -6,
      [0,1,2,5,6,10,11], // -1,
      [0,1,4,5,9,10,11], // +4,
      [0,3,4,8,9,10,11], // +9,
      [0,1,5,6,7,8,9], // +0,
      [0,4,5,6,7,8,11], // +5,
      [0,1,2,3,4,7,8], // -11 (flattest)
    ]
  },
  "Heptatonic 50": {
    familyIndex: 50, // -18 / +18 = 36
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,5,6,9,10,11], // +6,
      [0,4,5,8,9,10,11], // +11,
      [0,1,4,5,6,7,8], // -5,
      [0,3,4,5,6,7,11], // +0,
      [0,1,2,3,4,8,9], // -9 (flattest)
      [0,1,2,3,7,8,11], // -4,
      [0,1,2,6,7,10,11], // +1,
    ]
  },
  "Heptatonic 51": {
    familyIndex: 51, // -20 / +20 = 40
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,2,4,5,9,11], // -4,
      [0,1,3,4,8,10,11], // +1,
      [0,2,3,7,9,10,11], // +6,
      [0,1,5,7,8,9,10], // +4,
      [0,4,6,7,8,9,11], // +9,
      [0,2,3,4,5,7,8], // -7,
      [0,1,2,3,5,6,10], // -9 (flattest)
    ]
  },
  "Heptatonic 52": {
    familyIndex: 52, // -20 / +20 = 40
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,3,7,8,10,11], // +4,
      [0,2,6,7,9,10,11], // +9,
      [0,4,5,7,8,9,10], // +7,
      [0,1,3,4,5,6,8], // -9 (flattest)
      [0,2,3,4,5,7,11], // -4,
      [0,1,2,3,5,9,10], // -6,
      [0,1,2,4,8,9,11], // -1,
    ]
  },
  "Heptatonic 53": {
    familyIndex: 53, // -20 / +20 = 40
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,2,3,5,8,11], // -6,
      [0,1,2,4,7,10,11], // -1,
      [0,1,3,6,9,10,11], // +4,
      [0,2,5,8,9,10,11], // +9,
      [0,3,6,7,8,9,10], // +7,
      [0,3,4,5,6,7,9], // -2,
      [0,1,2,3,4,6,9], // -11 (flattest)
    ]
  },
  "Heptatonic 54": {
    familyIndex: 54, // -20 / +20 = 40
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,4,7,9,10,11], // +6,
      [0,3,6,8,9,10,11], // +11,
      [0,3,5,6,7,8,9], // +2,
      [0,2,3,4,5,6,9], // -7,
      [0,1,2,3,4,7,10], // -9 (flattest)
      [0,1,2,3,6,9,11], // -4,
      [0,1,2,5,8,10,11], // +1,
    ]
  },

  "Heptatonic 55": {
    familyIndex: 55, // -21 / +21 = 42
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,2,3,5,7,11], // -7,
      [0,1,2,4,6,10,11], // -2,
      [0,1,3,5,9,10,11], // +3,
      [0,2,4,8,9,10,11], // +8,
      [0,2,6,7,8,9,10], // +6,
      [0,4,5,6,7,8,10], // +4,
      [0,1,2,3,4,6,8], // -12 (flattest)
    ]
  },
  "Heptatonic 56": {
    familyIndex: 56, // -21 / +21 = 42
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,5,7,9,10,11], // +7,
      [0,4,6,8,9,10,11], // +12,
      [0,2,4,5,6,7,8], // -4,
      [0,2,3,4,5,6,10], // -6,
      [0,1,2,3,4,8,10], // -8 (flattest)
      [0,1,2,3,7,9,11], // -3,
      [0,1,2,6,8,10,11], // +2,
    ]
  },
  "Heptatonic 57": {
    familyIndex: 57, // -21 / +21 = 42
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,2,4,5,6,11], // -7,
      [0,1,3,4,5,10,11], // -2,
      [0,2,3,4,9,10,11], // +3,
      [0,1,2,7,8,9,10], // +1,
      [0,1,6,7,8,9,11], // +6,
      [0,5,6,7,8,10,11], // +11,
      [0,1,2,3,5,6,7], // -12 (flattest)
    ]
  },
  "Heptatonic 58": {
    familyIndex: 58, // -21 / +21 = 42
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,6,7,8,10,11], // +7,
      [0,5,6,7,9,10,11], // +12,
      [0,1,2,4,5,6,7], // -11 (flattest)
      [0,1,3,4,5,6,11], // -6,
      [0,2,3,4,5,10,11], // -1,
      [0,1,2,3,8,9,10], // -3,
      [0,1,2,7,8,9,11], // +2,
    ]
  },
  "Heptatonic 59": {
    familyIndex: 59, // -23 / +23 = 46
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,2,4,8,10,11], // +0,
      [0,1,3,7,9,10,11], // +5,
      [0,2,6,8,9,10,11], // +10,
      [0,4,6,7,8,9,10], // +8,
      [0,2,3,4,5,6,8], // -8,
      [0,1,2,3,4,6,10], // -10 (flattest)
      [0,1,2,3,5,9,11], // -5,
    ]
  },

  "Heptatonic 62": {
    familyIndex: 62, // -24 / +24 = 48
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,2,3,5,6,11], // -8,
      [0,1,2,4,5,10,11], // -3,
      [0,1,3,4,9,10,11], // +2,
      [0,2,3,8,9,10,11], // +7,
      [0,1,6,7,8,9,10], // +5,
      [0,5,6,7,8,9,11], // +10,
      [0,1,2,3,4,6,7], // -13 (flattest)
    ]
  },
  "Heptatonic 63": {
    familyIndex: 63, // -24 / +24 = 48
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,6,7,9,10,11], // +8,
      [0,5,6,8,9,10,11], // +13,
      [0,1,3,4,5,6,7], // -10 (flattest)
      [0,2,3,4,5,6,11], // -5,
      [0,1,2,3,4,9,10], // -7,
      [0,1,2,3,8,9,11], // -2,
      [0,1,2,7,8,10,11], // +3,
    ]
  },
  "Heptatonic 60": {
    familyIndex: 60, // -24 / +24 = 48
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,2,3,4,7,11], // -8,
      [0,1,2,3,6,10,11], // -3,
      [0,1,2,5,9,10,11], // +2,
      [0,1,4,8,9,10,11], // +7,
      [0,3,7,8,9,10,11], // +12,
      [0,4,5,6,7,8,9], // +3,
      [0,1,2,3,4,5,8], // -13 (flattest)
    ]
  },
  "Heptatonic 61": {
    familyIndex: 61, // -24 / +24 = 48
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,5,8,9,10,11], // +8,
      [0,4,7,8,9,10,11], // +13,
      [0,3,4,5,6,7,8], // -3,
      [0,1,2,3,4,5,9], // -12 (flattest)
      [0,1,2,3,4,8,11], // -7,
      [0,1,2,3,7,10,11], // -2,
      [0,1,2,6,9,10,11], // +3,
    ]
  },
  "Heptatonic 64": {
    familyIndex: 64, // -27 / +27 = 54
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,2,3,4,6,11], // -9,
      [0,1,2,3,5,10,11], // -4,
      [0,1,2,4,9,10,11], // +1,
      [0,1,3,8,9,10,11], // +6,
      [0,2,7,8,9,10,11], // +11,
      [0,5,6,7,8,9,10], // +9,
      [0,1,2,3,4,5,7], // -14 (flattest)
    ]
  },
  "Heptatonic 65": {
    familyIndex: 65, // -27 / +27 = 54
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,6,8,9,10,11], // +9,
      [0,5,7,8,9,10,11], // +14,
      [0,2,3,4,5,6,7], // -9,
      [0,1,2,3,4,5,10], // -11 (flattest)
      [0,1,2,3,4,9,11], // -6,
      [0,1,2,3,8,10,11], // -1,
      [0,1,2,7,9,10,11], // +4,
    ]
  },
  "Heptachromatic": {
    familyIndex: 66, // -30 / +30 = 60
    noteCount: 7,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7"],
    sets: [
      [0,1,2,3,9,10,11], // +0,
      [0,1,2,8,9,10,11], // +5,
      [0,1,7,8,9,10,11], // +10,
      [0,6,7,8,9,10,11], // +15,
      [0,1,2,3,4,5,6], // -15 (flattest)
      [0,1,2,3,4,5,11], // -10,
      [0,1,2,3,4,10,11], // -5,
    ]
  },
// 8 note scales
  "Octatonic": {
    familyIndex: 1, // -8 / +8 = 16
    noteCount: 8,
    names: ["Whole Half", "Half Whole", "Whole Half", "Half Whole", "Whole Half", "Half Whole", "Whole Half", "Half Whole"],
    sets: [
      [0,2,3,5,6,8,9,11], // +2,
      [0,1,3,4,6,7,9,10], // -2,
      [0,2,3,5,6,8,9,11], // +2,
      [0,1,3,4,6,7,9,10], // -2,
      [0,2,3,5,6,8,9,11], // +2,
      [0,1,3,4,6,7,9,10], // -2,
      [0,2,3,5,6,8,9,11], // +2,
      [0,1,3,4,6,7,9,10], // -2 (flattest)
    ]
  },
  "Bebop Major": {
    familyIndex: 2, // -8 / +8 = 16
    noteCount: 8,
    names: ["Mode 1", "Bebop Natural Minor", "Mode 3", "Bebop Major", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,3,4,6,8,9,11], // +0,
      [0,2,3,5,7,8,10,11], // +4,
      [0,1,3,5,6,8,9,10], // +0,
      [0,2,4,5,7,8,9,11], // +4,
      [0,2,3,5,6,7,9,10], // +0,
      [0,1,3,4,5,7,8,10], // -4,
      [0,2,3,4,6,7,9,11], // +0,
      [0,1,2,4,5,7,9,10], // -4 (flattest)
    ]
  },
  "Octatonic 3": {
    familyIndex: 3, // -8 / +8 = 16
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,3,5,6,7,9,11], // +0,
      [0,2,4,5,6,8,10,11], // +4,
      [0,2,3,4,6,8,9,10], // +0,
      [0,1,2,4,6,7,8,10], // -4,
      [0,1,3,5,6,7,9,11], // +0,
      [0,2,4,5,6,8,10,11], // +4,
      [0,2,3,4,6,8,9,10], // +0,
      [0,1,2,4,6,7,8,10], // -4 (flattest)
    ]
  },
  "Bebop Melodic Minor": {
    familyIndex: 4, // -9 / +9 = 18
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Bebop Melodic Minor", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,3,4,6,7,9,11], // -1,
      [0,2,3,5,6,8,10,11], // +3,
      [0,1,3,4,6,8,9,10], // -1,
      [0,2,3,5,7,8,9,11], // +3,
      [0,1,3,5,6,7,9,10], // -1,
      [0,2,4,5,6,8,9,11], // +3,
      [0,2,3,4,6,7,9,10], // -1,
      [0,1,2,4,5,7,8,10], // -5 (flattest)
    ]
  },
  "Octatonic 5": {
    familyIndex: 5, // -9 / +9 = 18
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,3,5,6,8,9,11], // +1,
      [0,2,4,5,7,8,10,11], // +5,
      [0,2,3,5,6,8,9,10], // +1,
      [0,1,3,4,6,7,8,10], // -3,
      [0,2,3,5,6,7,9,11], // +1,
      [0,1,3,4,5,7,9,10], // -3,
      [0,2,3,4,6,8,9,11], // +1,
      [0,1,2,4,6,7,9,10], // -3 (flattest)
    ]
  },
  "Bebop Dominant": {
    familyIndex: 6, // -12 / +12 = 24
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Bebop Dominant", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,4,5,7,8,11], // -4,
      [0,1,3,4,6,7,10,11], // +0,
      [0,2,3,5,6,9,10,11], // +4,
      [0,1,3,4,7,8,9,10], // +0,
      [0,2,3,6,7,8,9,11], // +4,
      [0,1,4,5,6,7,9,10], // +0,
      [0,3,4,5,6,8,9,11], // +4,
      [0,1,2,3,5,6,8,9], // -8 (flattest)
    ]
  },
  "Bebop Dorian (b4)": {
    familyIndex: 7, // -12 / +12 = 24
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Bebop Dorian (b4)", "Mode 8"],
    sets: [
      [0,1,2,4,6,7,9,11], // -2,
      [0,1,3,5,6,8,10,11], // +2,
      [0,2,4,5,7,9,10,11], // +6,
      [0,2,3,5,7,8,9,10], // +2,
      [0,1,3,5,6,7,8,10], // -2,
      [0,2,4,5,6,7,9,11], // +2,
      [0,2,3,4,5,7,9,10], // -2,
      [0,1,2,3,5,7,8,10], // -6 (flattest)
    ]
  },
  "Octatonic 8": {
    familyIndex: 8, // -12 / +12 = 24
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,5,6,8,9,11], // +0,
      [0,1,4,5,7,8,10,11], // +4,
      [0,3,4,6,7,9,10,11], // +8,
      [0,1,3,4,6,7,8,9], // -4,
      [0,2,3,5,6,7,8,11], // +0,
      [0,1,3,4,5,6,9,10], // -4,
      [0,2,3,4,5,8,9,11], // +0,
      [0,1,2,3,6,7,9,10], // -4 (flattest)
    ]
  },
  "Octatonic 9": {
    familyIndex: 9, // -12 / +12 = 24
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,3,4,5,7,9,11], // -2,
      [0,2,3,4,6,8,10,11], // +2,
      [0,1,2,4,6,8,9,10], // -2,
      [0,1,3,5,7,8,9,11], // +2,
      [0,2,4,6,7,8,10,11], // +6,
      [0,2,4,5,6,8,9,10], // +2,
      [0,2,3,4,6,7,8,10], // -2,
      [0,1,2,4,5,6,8,10], // -6 (flattest)
    ]
  },
  "Octatonic 10": {
    familyIndex: 10, // -12 / +12 = 24
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,3,4,6,7,8,11], // -2,
      [0,2,3,5,6,7,10,11], // +2,
      [0,1,3,4,5,8,9,10], // -2,
      [0,2,3,4,7,8,9,11], // +2,
      [0,1,2,5,6,7,9,10], // -2,
      [0,1,4,5,6,8,9,11], // +2,
      [0,3,4,5,7,8,10,11], // +6,
      [0,1,2,4,5,7,8,9], // -6 (flattest)
    ]
  },
  "Bebop Dorian (♮7)": {
    familyIndex: 11, // -13 / +13 = 26
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Bebop Dorian (♮7)", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,4,5,7,9,11], // -3,
      [0,1,3,4,6,8,10,11], // +1,
      [0,2,3,5,7,9,10,11], // +5,
      [0,1,3,5,7,8,9,10], // +1,
      [0,2,4,6,7,8,9,11], // +5,
      [0,2,4,5,6,7,9,10], // +1,
      [0,2,3,4,5,7,8,10], // -3,
      [0,1,2,3,5,6,8,10], // -7 (flattest)
    ]
  },
  "Octatonic 12": {
    familyIndex: 12, // -13 / +13 = 26
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,4,6,7,8,11], // -3,
      [0,1,3,5,6,7,10,11], // +1,
      [0,2,4,5,6,9,10,11], // +5,
      [0,2,3,4,7,8,9,10], // +1,
      [0,1,2,5,6,7,8,10], // -3,
      [0,1,4,5,6,7,9,11], // +1,
      [0,3,4,5,6,8,10,11], // +5,
      [0,1,2,3,5,7,8,9], // -7 (flattest)
    ]
  },
  "Octatonic 13": {
    familyIndex: 13, // -13 / +13 = 26
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,4,6,8,9,11], // -1,
      [0,1,3,5,7,8,10,11], // +3,
      [0,2,4,6,7,9,10,11], // +7,
      [0,2,4,5,7,8,9,10], // +3,
      [0,2,3,5,6,7,8,10], // -1,
      [0,1,3,4,5,6,8,10], // -5,
      [0,2,3,4,5,7,9,11], // -1,
      [0,1,2,3,5,7,9,10], // -5 (flattest)
    ]
  },
  "Octatonic 14": {
    familyIndex: 14, // -13 / +13 = 26
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,5,6,7,9,11], // -1,
      [0,1,4,5,6,8,10,11], // +3,
      [0,3,4,5,7,9,10,11], // +7,
      [0,1,2,4,6,7,8,9], // -5,
      [0,1,3,5,6,7,8,11], // -1,
      [0,2,4,5,6,7,10,11], // +3,
      [0,2,3,4,5,8,9,10], // -1,
      [0,1,2,3,6,7,8,10], // -5 (flattest)
    ]
  },
  "Octatonic 15": {
    familyIndex: 15, // -13 / +13 = 26
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,3,4,5,7,8,11], // -3,
      [0,2,3,4,6,7,10,11], // +1,
      [0,1,2,4,5,8,9,10], // -3,
      [0,1,3,4,7,8,9,11], // +1,
      [0,2,3,6,7,8,10,11], // +5,
      [0,1,4,5,6,8,9,10], // +1,
      [0,3,4,5,7,8,9,11], // +5,
      [0,1,2,4,5,6,8,9], // -7 (flattest)
    ]
  },
  "Octatonic 16": {
    familyIndex: 16, // -13 / +13 = 26
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,3,4,5,8,9,11], // -1,
      [0,2,3,4,7,8,10,11], // +3,
      [0,1,2,5,6,8,9,10], // -1,
      [0,1,4,5,7,8,9,11], // +3,
      [0,3,4,6,7,8,10,11], // +7,
      [0,1,3,4,5,7,8,9], // -5,
      [0,2,3,4,6,7,8,11], // -1,
      [0,1,2,4,5,6,9,10], // -5 (flattest)
    ]
  },
  "Octatonic 17": {
    familyIndex: 17, // -16 / +16 = 32
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,3,5,7,8,11], // -5,
      [0,1,2,4,6,7,10,11], // -1,
      [0,1,3,5,6,9,10,11], // +3,
      [0,2,4,5,8,9,10,11], // +7,
      [0,2,3,6,7,8,9,10], // +3,
      [0,1,4,5,6,7,8,10], // -1,
      [0,3,4,5,6,7,9,11], // +3,
      [0,1,2,3,4,6,8,9], // -9 (flattest)
    ]
  },
  "Octatonic 18": {
    familyIndex: 18, // -16 / +16 = 32
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,3,5,7,9,11], // -4,
      [0,1,2,4,6,8,10,11], // +0,
      [0,1,3,5,7,9,10,11], // +4,
      [0,2,4,6,8,9,10,11], // +8,
      [0,2,4,6,7,8,9,10], // +4,
      [0,2,4,5,6,7,8,10], // +0,
      [0,2,3,4,5,6,8,10], // -4,
      [0,1,2,3,4,6,8,10], // -8 (flattest)
    ]
  },
  "Octatonic 19": {
    familyIndex: 19, // -16 / +16 = 32
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,3,6,7,8,11], // -4,
      [0,1,2,5,6,7,10,11], // +0,
      [0,1,4,5,6,9,10,11], // +4,
      [0,3,4,5,8,9,10,11], // +8,
      [0,1,2,5,6,7,8,9], // -4,
      [0,1,4,5,6,7,8,11], // +0,
      [0,3,4,5,6,7,10,11], // +4,
      [0,1,2,3,4,7,8,9], // -8 (flattest)
    ]
  },
  "Octatonic 20": {
    familyIndex: 20, // -16 / +16 = 32
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,3,6,7,9,11], // -3,
      [0,1,2,5,6,8,10,11], // +1,
      [0,1,4,5,7,9,10,11], // +5,
      [0,3,4,6,8,9,10,11], // +9,
      [0,1,3,5,6,7,8,9], // -3,
      [0,2,4,5,6,7,8,11], // +1,
      [0,2,3,4,5,6,9,10], // -3,
      [0,1,2,3,4,7,8,10], // -7 (flattest)
    ]
  },
  "Octatonic 21": {
    familyIndex: 21, // -16 / +16 = 32
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,4,5,6,8,11], // -5,
      [0,1,3,4,5,7,10,11], // -1,
      [0,2,3,4,6,9,10,11], // +3,
      [0,1,2,4,7,8,9,10], // -1,
      [0,1,3,6,7,8,9,11], // +3,
      [0,2,5,6,7,8,10,11], // +7,
      [0,3,4,5,6,8,9,10], // +3,
      [0,1,2,3,5,6,7,9], // -9 (flattest)
    ]
  },
  "Octatonic 22": {
    familyIndex: 22, // -16 / +16 = 32
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,4,5,6,9,11], // -4,
      [0,1,3,4,5,8,10,11], // +0,
      [0,2,3,4,7,9,10,11], // +4,
      [0,1,2,5,7,8,9,10], // +0,
      [0,1,4,6,7,8,9,11], // +4,
      [0,3,5,6,7,8,10,11], // +8,
      [0,2,3,4,5,7,8,9], // -4,
      [0,1,2,3,5,6,7,10], // -8 (flattest)
    ]
  },
  "Octatonic 23": {
    familyIndex: 23, // -16 / +16 = 32
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,4,5,8,9,11], // -2,
      [0,1,3,4,7,8,10,11], // +2,
      [0,2,3,6,7,9,10,11], // +6,
      [0,1,4,5,7,8,9,10], // +2,
      [0,3,4,6,7,8,9,11], // +6,
      [0,1,3,4,5,6,8,9], // -6,
      [0,2,3,4,5,7,8,11], // -2,
      [0,1,2,3,5,6,9,10], // -6 (flattest)
    ]
  },
  "Octatonic 24": {
    familyIndex: 24, // -16 / +16 = 32
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,3,4,5,6,8,11], // -4,
      [0,2,3,4,5,7,10,11], // +0,
      [0,1,2,3,5,8,9,10], // -4,
      [0,1,2,4,7,8,9,11], // +0,
      [0,1,3,6,7,8,10,11], // +4,
      [0,2,5,6,7,9,10,11], // +8,
      [0,3,4,5,7,8,9,10], // +4,
      [0,1,2,4,5,6,7,9], // -8 (flattest)
    ]
  },
  "Octatonic 25": {
    familyIndex: 25, // -16 / +16 = 32
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,5,6,7,8,11], // -2,
      [0,1,4,5,6,7,10,11], // +2,
      [0,3,4,5,6,9,10,11], // +6,
      [0,1,2,3,6,7,8,9], // -6,
      [0,1,2,5,6,7,8,11], // -2,
      [0,1,4,5,6,7,10,11], // +2,
      [0,3,4,5,6,9,10,11], // +6,
      [0,1,2,3,6,7,8,9], // -6 (flattest)
    ]
  },
  "Octatonic 26": {
    familyIndex: 26, // -16 / +16 = 32
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,3,4,5,6,9,11], // -3,
      [0,2,3,4,5,8,10,11], // +1,
      [0,1,2,3,6,8,9,10], // -3,
      [0,1,2,5,7,8,9,11], // +1,
      [0,1,4,6,7,8,10,11], // +5,
      [0,3,5,6,7,9,10,11], // +9,
      [0,2,3,4,6,7,8,9], // -3,
      [0,1,2,4,5,6,7,10], // -7 (flattest)
    ]
  },
  "Octatonic 27": {
    familyIndex: 27, // -18 / +18 = 36
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,3,5,6,8,11], // -6,
      [0,1,2,4,5,7,10,11], // -2,
      [0,1,3,4,6,9,10,11], // +2,
      [0,2,3,5,8,9,10,11], // +6,
      [0,1,3,6,7,8,9,10], // +2,
      [0,2,5,6,7,8,9,11], // +6,
      [0,3,4,5,6,7,9,10], // +2,
      [0,1,2,3,4,6,7,9], // -10 (flattest)
    ]
  },
  "Octatonic 28": {
    familyIndex: 28, // -18 / +18 = 36
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,3,6,8,9,11], // -2,
      [0,1,2,5,7,8,10,11], // +2,
      [0,1,4,6,7,9,10,11], // +6,
      [0,3,5,6,8,9,10,11], // +10,
      [0,2,3,5,6,7,8,9], // -2,
      [0,1,3,4,5,6,7,10], // -6,
      [0,2,3,4,5,6,9,11], // -2,
      [0,1,2,3,4,7,9,10], // -6 (flattest)
    ]
  },
  "Octatonic 29": {
    familyIndex: 29, // -20 / +20 = 40
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,3,4,7,8,11], // -6,
      [0,1,2,3,6,7,10,11], // -2,
      [0,1,2,5,6,9,10,11], // +2,
      [0,1,4,5,8,9,10,11], // +6,
      [0,3,4,7,8,9,10,11], // +10,
      [0,1,4,5,6,7,8,9], // -2,
      [0,3,4,5,6,7,8,11], // +2,
      [0,1,2,3,4,5,8,9], // -10 (flattest)
    ]
  },
  "Octatonic 30": {
    familyIndex: 30, // -20 / +20 = 40
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,3,5,6,9,11], // -5,
      [0,1,2,4,5,8,10,11], // -1,
      [0,1,3,4,7,9,10,11], // +3,
      [0,2,3,6,8,9,10,11], // +7,
      [0,1,4,6,7,8,9,10], // +3,
      [0,3,5,6,7,8,9,11], // +7,
      [0,2,3,4,5,6,8,9], // -5,
      [0,1,2,3,4,6,7,10], // -9 (flattest)
    ]
  },
  "Octatonic 31": {
    familyIndex: 31, // -20 / +20 = 40
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,3,5,8,9,11], // -3,
      [0,1,2,4,7,8,10,11], // +1,
      [0,1,3,6,7,9,10,11], // +5,
      [0,2,5,6,8,9,10,11], // +9,
      [0,3,4,6,7,8,9,10], // +5,
      [0,1,3,4,5,6,7,9], // -7,
      [0,2,3,4,5,6,8,11], // -3,
      [0,1,2,3,4,6,9,10], // -7 (flattest)
    ]
  },
  "Octatonic 32": {
    familyIndex: 32, // -20 / +20 = 40
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,4,5,6,7,11], // -6,
      [0,1,3,4,5,6,10,11], // -2,
      [0,2,3,4,5,9,10,11], // +2,
      [0,1,2,3,7,8,9,10], // -2,
      [0,1,2,6,7,8,9,11], // +2,
      [0,1,5,6,7,8,10,11], // +6,
      [0,4,5,6,7,9,10,11], // +10,
      [0,1,2,3,5,6,7,8], // -10 (flattest)
    ]
  },
  "Octatonic 33": {
    familyIndex: 33, // -21 / +21 = 42
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,3,4,6,8,11], // -7,
      [0,1,2,3,5,7,10,11], // -3,
      [0,1,2,4,6,9,10,11], // +1,
      [0,1,3,5,8,9,10,11], // +5,
      [0,2,4,7,8,9,10,11], // +9,
      [0,2,5,6,7,8,9,10], // +5,
      [0,3,4,5,6,7,8,10], // +1,
      [0,1,2,3,4,5,7,9], // -11 (flattest)
    ]
  },
  "Octatonic 34": {
    familyIndex: 34, // -21 / +21 = 42
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,3,4,7,9,11], // -5,
      [0,1,2,3,6,8,10,11], // -1,
      [0,1,2,5,7,9,10,11], // +3,
      [0,1,4,6,8,9,10,11], // +7,
      [0,3,5,7,8,9,10,11], // +11,
      [0,2,4,5,6,7,8,9], // -1,
      [0,2,3,4,5,6,7,10], // -5,
      [0,1,2,3,4,5,8,10], // -9 (flattest)
    ]
  },
  "Octatonic 35": {
    familyIndex: 35, // -21 / +21 = 42
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,3,5,6,7,11], // -7,
      [0,1,2,4,5,6,10,11], // -3,
      [0,1,3,4,5,9,10,11], // +1,
      [0,2,3,4,8,9,10,11], // +5,
      [0,1,2,6,7,8,9,10], // +1,
      [0,1,5,6,7,8,9,11], // +5,
      [0,4,5,6,7,8,10,11], // +9,
      [0,1,2,3,4,6,7,8], // -11 (flattest)
    ]
  },
  "Octatonic 36": {
    familyIndex: 36, // -21 / +21 = 42
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,3,4,5,6,7,11], // -5,
      [0,2,3,4,5,6,10,11], // -1,
      [0,1,2,3,4,8,9,10], // -5,
      [0,1,2,3,7,8,9,11], // -1,
      [0,1,2,6,7,8,10,11], // +3,
      [0,1,5,6,7,9,10,11], // +7,
      [0,4,5,6,8,9,10,11], // +11,
      [0,1,2,4,5,6,7,8], // -9 (flattest)
    ]
  },
  "Octatonic 37": {
    familyIndex: 37, // -24 / +24 = 48
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,3,4,5,8,11], // -8,
      [0,1,2,3,4,7,10,11], // -4,
      [0,1,2,3,6,9,10,11], // +0,
      [0,1,2,5,8,9,10,11], // +4,
      [0,1,4,7,8,9,10,11], // +8,
      [0,3,6,7,8,9,10,11], // +12,
      [0,3,4,5,6,7,8,9], // +0,
      [0,1,2,3,4,5,6,9], // -12 (flattest)
    ]
  },
  "Octatonic 38": {
    familyIndex: 38, // -24 / +24 = 48
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,3,4,6,7,11], // -8,
      [0,1,2,3,5,6,10,11], // -4,
      [0,1,2,4,5,9,10,11], // +0,
      [0,1,3,4,8,9,10,11], // +4,
      [0,2,3,7,8,9,10,11], // +8,
      [0,1,5,6,7,8,9,10], // +4,
      [0,4,5,6,7,8,9,11], // +8,
      [0,1,2,3,4,5,7,8], // -12 (flattest)
    ]
  },
  "Octatonic 39": {
    familyIndex: 39, // -24 / +24 = 48
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,3,4,6,9,11], // -6,
      [0,1,2,3,5,8,10,11], // -2,
      [0,1,2,4,7,9,10,11], // +2,
      [0,1,3,6,8,9,10,11], // +6,
      [0,2,5,7,8,9,10,11], // +10,
      [0,3,5,6,7,8,9,10], // +6,
      [0,2,3,4,5,6,7,9], // -6,
      [0,1,2,3,4,5,7,10], // -10 (flattest)
    ]
  },
  "Octatonic 40": {
    familyIndex: 40, // -24 / +24 = 48
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,3,4,8,9,11], // -4,
      [0,1,2,3,7,8,10,11], // +0,
      [0,1,2,6,7,9,10,11], // +4,
      [0,1,5,6,8,9,10,11], // +8,
      [0,4,5,7,8,9,10,11], // +12,
      [0,1,3,4,5,6,7,8], // -8,
      [0,2,3,4,5,6,7,11], // -4,
      [0,1,2,3,4,5,9,10], // -8 (flattest)
    ]
  },
  "Octatonic 41": {
    familyIndex: 41, // -28 / +28 = 56
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,3,4,5,7,11], // -9,
      [0,1,2,3,4,6,10,11], // -5,
      [0,1,2,3,5,9,10,11], // -1,
      [0,1,2,4,8,9,10,11], // +3,
      [0,1,3,7,8,9,10,11], // +7,
      [0,2,6,7,8,9,10,11], // +11,
      [0,4,5,6,7,8,9,10], // +7,
      [0,1,2,3,4,5,6,8], // -13 (flattest)
    ]
  },
  "Octatonic 42": {
    familyIndex: 42, // -28 / +28 = 56
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,3,4,5,9,11], // -7,
      [0,1,2,3,4,8,10,11], // -3,
      [0,1,2,3,7,9,10,11], // +1,
      [0,1,2,6,8,9,10,11], // +5,
      [0,1,5,7,8,9,10,11], // +9,
      [0,4,6,7,8,9,10,11], // +13,
      [0,2,3,4,5,6,7,8], // -7,
      [0,1,2,3,4,5,6,10], // -11 (flattest)
    ]
  },
  "Octatonic 43": {
    familyIndex: 43, // -32 / +32 = 64
    noteCount: 8,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8"],
    sets: [
      [0,1,2,3,4,5,6,11], // -10,
      [0,1,2,3,4,5,10,11], // -6,
      [0,1,2,3,4,9,10,11], // -2,
      [0,1,2,3,8,9,10,11], // +2,
      [0,1,2,7,8,9,10,11], // +6,
      [0,1,6,7,8,9,10,11], // +10,
      [0,5,6,7,8,9,10,11], // +14,
      [0,1,2,3,4,5,6,7], // -14 (flattest)
    ]
  },
// 9 note scales
  "Nonatonic": {
    familyIndex: 1, // -9 / +9 = 18
    noteCount: 9,
    names: ["Nonatonic 1", "Nonatonic 2", "Nonatonic 3", "Nonatonic 1", "Nonatonic 2", "Nonatonic 3", "Nonatonic 1", "Nonatonic 2", "Nonatonic 3"],
    sets: [
      [0,1,3,4,5,7,8,9,11], // +0,
      [0,2,3,4,6,7,8,10,11], // +3,
      [0,1,2,4,5,6,8,9,10], // -3,
      [0,1,3,4,5,7,8,9,11], // +0,
      [0,2,3,4,6,7,8,10,11], // +3,
      [0,1,2,4,5,6,8,9,10], // -3,
      [0,1,3,4,5,7,8,9,11], // +0,
      [0,2,3,4,6,7,8,10,11], // +3,
      [0,1,2,4,5,6,8,9,10], // -3 (flattest)
    ]
  },
  "Nonatonic 2": {
    familyIndex: 2, // -11 / +11 = 22
    noteCount: 9,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8", "Mode 9"],
    sets: [
      [0,1,2,4,5,6,8,9,11], // -2,
      [0,1,3,4,5,7,8,10,11], // +1,
      [0,2,3,4,6,7,9,10,11], // +4,
      [0,1,2,4,5,7,8,9,10], // -2,
      [0,1,3,4,6,7,8,9,11], // +1,
      [0,2,3,5,6,7,8,10,11], // +4,
      [0,1,3,4,5,6,8,9,10], // -2,
      [0,2,3,4,5,7,8,9,11], // +1,
      [0,1,2,3,5,6,7,9,10], // -5 (flattest)
    ]
  },
  "Nonatonic 3": {
    familyIndex: 3, // -11 / +11 = 22
    noteCount: 9,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8", "Mode 9"],
    sets: [
      [0,1,2,4,5,7,8,9,11], // -1,
      [0,1,3,4,6,7,8,10,11], // +2,
      [0,2,3,5,6,7,9,10,11], // +5,
      [0,1,3,4,5,7,8,9,10], // -1,
      [0,2,3,4,6,7,8,9,11], // +2,
      [0,1,2,4,5,6,7,9,10], // -4,
      [0,1,3,4,5,6,8,9,11], // -1,
      [0,2,3,4,5,7,8,10,11], // +2,
      [0,1,2,3,5,6,8,9,10], // -4 (flattest)
    ]
  },
  "Nonatonic 4": {
    familyIndex: 4, // -12 / +12 = 24
    noteCount: 9,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8", "Mode 9"],
    sets: [
      [0,1,2,3,5,6,8,9,11], // -3,
      [0,1,2,4,5,7,8,10,11], // +0,
      [0,1,3,4,6,7,9,10,11], // +3,
      [0,2,3,5,6,8,9,10,11], // +6,
      [0,1,3,4,6,7,8,9,10], // +0,
      [0,2,3,5,6,7,8,9,11], // +3,
      [0,1,3,4,5,6,7,9,10], // -3,
      [0,2,3,4,5,6,8,9,11], // +0,
      [0,1,2,3,4,6,7,9,10], // -6 (flattest)
    ]
  },
  "Nonatonic 5": {
    familyIndex: 5, // -12 / +12 = 24
    noteCount: 9,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8", "Mode 9"],
    sets: [
      [0,1,2,4,5,6,7,9,11], // -3,
      [0,1,3,4,5,6,8,10,11], // +0,
      [0,2,3,4,5,7,9,10,11], // +3,
      [0,1,2,3,5,7,8,9,10], // -3,
      [0,1,2,4,6,7,8,9,11], // +0,
      [0,1,3,5,6,7,8,10,11], // +3,
      [0,2,4,5,6,7,9,10,11], // +6,
      [0,2,3,4,5,7,8,9,10], // +0,
      [0,1,2,3,5,6,7,8,10], // -6 (flattest)
    ]
  },
  "Nonatonic 6": {
    familyIndex: 6, // -14 / +14 = 28
    noteCount: 9,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8", "Mode 9"],
    sets: [
      [0,1,2,3,5,6,7,9,11], // -4,
      [0,1,2,4,5,6,8,10,11], // -1,
      [0,1,3,4,5,7,9,10,11], // +2,
      [0,2,3,4,6,8,9,10,11], // +5,
      [0,1,2,4,6,7,8,9,10], // -1,
      [0,1,3,5,6,7,8,9,11], // +2,
      [0,2,4,5,6,7,8,10,11], // +5,
      [0,2,3,4,5,6,8,9,10], // -1,
      [0,1,2,3,4,6,7,8,10], // -7 (flattest)
    ]
  },
  "Nonatonic 7": {
    familyIndex: 7, // -14 / +14 = 28
    noteCount: 9,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8", "Mode 9"],
    sets: [
      [0,1,2,3,5,7,8,9,11], // -2,
      [0,1,2,4,6,7,8,10,11], // +1,
      [0,1,3,5,6,7,9,10,11], // +4,
      [0,2,4,5,6,8,9,10,11], // +7,
      [0,2,3,4,6,7,8,9,10], // +1,
      [0,1,2,4,5,6,7,8,10], // -5,
      [0,1,3,4,5,6,7,9,11], // -2,
      [0,2,3,4,5,6,8,10,11], // +1,
      [0,1,2,3,4,6,8,9,10], // -5 (flattest)
    ]
  },
  "Nonatonic 8": {
    familyIndex: 8, // -17 / +17 = 34
    noteCount: 9,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8", "Mode 9"],
    sets: [
      [0,1,2,3,4,6,7,9,11], // -5,
      [0,1,2,3,5,6,8,10,11], // -2,
      [0,1,2,4,5,7,9,10,11], // +1,
      [0,1,3,4,6,8,9,10,11], // +4,
      [0,2,3,5,7,8,9,10,11], // +7,
      [0,1,3,5,6,7,8,9,10], // +1,
      [0,2,4,5,6,7,8,9,11], // +4,
      [0,2,3,4,5,6,7,9,10], // -2,
      [0,1,2,3,4,5,7,8,10], // -8 (flattest)
    ]
  },
  "Nonatonic 9": {
    familyIndex: 9, // -17 / +17 = 34
    noteCount: 9,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8", "Mode 9"],
    sets: [
      [0,1,2,3,4,6,8,9,11], // -4,
      [0,1,2,3,5,7,8,10,11], // -1,
      [0,1,2,4,6,7,9,10,11], // +2,
      [0,1,3,5,6,8,9,10,11], // +5,
      [0,2,4,5,7,8,9,10,11], // +8,
      [0,2,3,5,6,7,8,9,10], // +2,
      [0,1,3,4,5,6,7,8,10], // -4,
      [0,2,3,4,5,6,7,9,11], // -1,
      [0,1,2,3,4,5,7,9,10], // -7 (flattest)
    ]
  },
  "Nonatonic 10": {
    familyIndex: 10, // -17 / +17 = 34
    noteCount: 9,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8", "Mode 9"],
    sets: [
      [0,1,2,3,5,6,7,8,11], // -5,
      [0,1,2,4,5,6,7,10,11], // -2,
      [0,1,3,4,5,6,9,10,11], // +1,
      [0,2,3,4,5,8,9,10,11], // +4,
      [0,1,2,3,6,7,8,9,10], // -2,
      [0,1,2,5,6,7,8,9,11], // +1,
      [0,1,4,5,6,7,8,10,11], // +4,
      [0,3,4,5,6,7,9,10,11], // +7,
      [0,1,2,3,4,6,7,8,9], // -8 (flattest)
    ]
  },
  "Nonatonic 11": {
    familyIndex: 11, // -17 / +17 = 34
    noteCount: 9,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8", "Mode 9"],
    sets: [
      [0,1,2,4,5,6,7,8,11], // -4,
      [0,1,3,4,5,6,7,10,11], // -1,
      [0,2,3,4,5,6,9,10,11], // +2,
      [0,1,2,3,4,7,8,9,10], // -4,
      [0,1,2,3,6,7,8,9,11], // -1,
      [0,1,2,5,6,7,8,10,11], // +2,
      [0,1,4,5,6,7,9,10,11], // +5,
      [0,3,4,5,6,8,9,10,11], // +8,
      [0,1,2,3,5,6,7,8,9], // -7 (flattest)
    ]
  },
  "Nonatonic 12": {
    familyIndex: 12, // -18 / +18 = 36
    noteCount: 9,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8", "Mode 9"],
    sets: [
      [0,1,2,3,4,6,7,8,11], // -6,
      [0,1,2,3,5,6,7,10,11], // -3,
      [0,1,2,4,5,6,9,10,11], // +0,
      [0,1,3,4,5,8,9,10,11], // +3,
      [0,2,3,4,7,8,9,10,11], // +6,
      [0,1,2,5,6,7,8,9,10], // +0,
      [0,1,4,5,6,7,8,9,11], // +3,
      [0,3,4,5,6,7,8,10,11], // +6,
      [0,1,2,3,4,5,7,8,9], // -9 (flattest)
    ]
  },
  "Nonatonic 13": {
    familyIndex: 13, // -18 / +18 = 36
    noteCount: 9,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8", "Mode 9"],
    sets: [
      [0,1,2,3,4,7,8,9,11], // -3,
      [0,1,2,3,6,7,8,10,11], // +0,
      [0,1,2,5,6,7,9,10,11], // +3,
      [0,1,4,5,6,8,9,10,11], // +6,
      [0,3,4,5,7,8,9,10,11], // +9,
      [0,1,2,4,5,6,7,8,9], // -6,
      [0,1,3,4,5,6,7,8,11], // -3,
      [0,2,3,4,5,6,7,10,11], // +0,
      [0,1,2,3,4,5,8,9,10], // -6 (flattest)
    ]
  },
  "Nonatonic 14": {
    familyIndex: 14, // -21 / +21 = 42
    noteCount: 9,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8", "Mode 9"],
    sets: [
      [0,1,2,3,4,5,7,9,11], // -6,
      [0,1,2,3,4,6,8,10,11], // -3,
      [0,1,2,3,5,7,9,10,11], // +0,
      [0,1,2,4,6,8,9,10,11], // +3,
      [0,1,3,5,7,8,9,10,11], // +6,
      [0,2,4,6,7,8,9,10,11], // +9,
      [0,2,4,5,6,7,8,9,10], // +3,
      [0,2,3,4,5,6,7,8,10], // -3,
      [0,1,2,3,4,5,6,8,10], // -9 (flattest)
    ]
  },
  "Nonatonic 15": {
    familyIndex: 15, // -22 / +22 = 44
    noteCount: 9,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8", "Mode 9"],
    sets: [
      [0,1,2,3,4,5,7,8,11], // -7,
      [0,1,2,3,4,6,7,10,11], // -4,
      [0,1,2,3,5,6,9,10,11], // -1,
      [0,1,2,4,5,8,9,10,11], // +2,
      [0,1,3,4,7,8,9,10,11], // +5,
      [0,2,3,6,7,8,9,10,11], // +8,
      [0,1,4,5,6,7,8,9,10], // +2,
      [0,3,4,5,6,7,8,9,11], // +5,
      [0,1,2,3,4,5,6,8,9], // -10 (flattest)
    ]
  },
  "Nonatonic 16": {
    familyIndex: 16, // -22 / +22 = 44
    noteCount: 9,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8", "Mode 9"],
    sets: [
      [0,1,2,3,4,5,8,9,11], // -5,
      [0,1,2,3,4,7,8,10,11], // -2,
      [0,1,2,3,6,7,9,10,11], // +1,
      [0,1,2,5,6,8,9,10,11], // +4,
      [0,1,4,5,7,8,9,10,11], // +7,
      [0,3,4,6,7,8,9,10,11], // +10,
      [0,1,3,4,5,6,7,8,9], // -5,
      [0,2,3,4,5,6,7,8,11], // -2,
      [0,1,2,3,4,5,6,9,10], // -8 (flattest)
    ]
  },
  "Nonatonic 17": {
    familyIndex: 17, // -26 / +26 = 52
    noteCount: 9,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8", "Mode 9"],
    sets: [
      [0,1,2,3,4,5,6,8,11], // -8,
      [0,1,2,3,4,5,7,10,11], // -5,
      [0,1,2,3,4,6,9,10,11], // -2,
      [0,1,2,3,5,8,9,10,11], // +1,
      [0,1,2,4,7,8,9,10,11], // +4,
      [0,1,3,6,7,8,9,10,11], // +7,
      [0,2,5,6,7,8,9,10,11], // +10,
      [0,3,4,5,6,7,8,9,10], // +4,
      [0,1,2,3,4,5,6,7,9], // -11 (flattest)
    ]
  },
  "Nonatonic 18": {
    familyIndex: 18, // -26 / +26 = 52
    noteCount: 9,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8", "Mode 9"],
    sets: [
      [0,1,2,3,4,5,6,9,11], // -7,
      [0,1,2,3,4,5,8,10,11], // -4,
      [0,1,2,3,4,7,9,10,11], // -1,
      [0,1,2,3,6,8,9,10,11], // +2,
      [0,1,2,5,7,8,9,10,11], // +5,
      [0,1,4,6,7,8,9,10,11], // +8,
      [0,3,5,6,7,8,9,10,11], // +11,
      [0,2,3,4,5,6,7,8,9], // -4,
      [0,1,2,3,4,5,6,7,10], // -10 (flattest)
    ]
  },
  "Nonatonic 19": {
    familyIndex: 19, // -30 / +30 = 60
    noteCount: 9,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8", "Mode 9"],
    sets: [
      [0,1,2,3,4,5,6,7,11], // -9,
      [0,1,2,3,4,5,6,10,11], // -6,
      [0,1,2,3,4,5,9,10,11], // -3,
      [0,1,2,3,4,8,9,10,11], // +0,
      [0,1,2,3,7,8,9,10,11], // +3,
      [0,1,2,6,7,8,9,10,11], // +6,
      [0,1,5,6,7,8,9,10,11], // +9,
      [0,4,5,6,7,8,9,10,11], // +12,
      [0,1,2,3,4,5,6,7,8], // -12 (flattest)
    ]
  },
// 10 note scales
  "No Tritone": {
    familyIndex: 1, // -12 / +12 = 24
    noteCount: 10,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,2,4,5,6,7,8,10,11], // +0,
      [0,1,3,4,5,6,7,9,10,11], // +2,
      [0,2,3,4,5,6,8,9,10,11], // +4,
      [0,1,2,3,4,6,7,8,9,10], // -4 (flattest)
      [0,1,2,3,5,6,7,8,9,11], // -2,
      [0,1,2,4,5,6,7,8,10,11], // +0,
      [0,1,3,4,5,6,7,9,10,11], // +2,
      [0,2,3,4,5,6,8,9,10,11], // +4,
      [0,1,2,3,4,6,7,8,9,10], // -4,
      [0,1,2,3,5,6,7,8,9,11], // -2,
    ]
  },
  "No 4th/5th": {
    familyIndex: 2, // -13 / +13 = 26
    noteCount: 10,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8", "Mode 9", "Mode 10"],
    sets: [
      [0,1,2,3,5,6,7,8,10,11], // -1,
      [0,1,2,4,5,6,7,9,10,11], // +1,
      [0,1,3,4,5,6,8,9,10,11], // +3,
      [0,2,3,4,5,7,8,9,10,11], // +5,
      [0,1,2,3,5,6,7,8,9,10], // -3,
      [0,1,2,4,5,6,7,8,9,11], // -1,
      [0,1,3,4,5,6,7,8,10,11], // +1,
      [0,2,3,4,5,6,7,9,10,11], // +3,
      [0,1,2,3,4,5,7,8,9,10], // -5 (flattest)
      [0,1,2,3,4,6,7,8,9,11], // -3,
    ]
  },
  "No M3/m6": {
    familyIndex: 3, // -14 / +14 = 28
    noteCount: 10,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8", "Mode 9", "Mode 10"],
    sets: [
      [0,1,2,3,5,6,7,9,10,11], // +0,
      [0,1,2,4,5,6,8,9,10,11], // +2,
      [0,1,3,4,5,7,8,9,10,11], // +4,
      [0,2,3,4,6,7,8,9,10,11], // +6,
      [0,1,2,4,5,6,7,8,9,10], // -2,
      [0,1,3,4,5,6,7,8,9,11], // +0,
      [0,2,3,4,5,6,7,8,10,11], // +2,
      [0,1,2,3,4,5,6,8,9,10], // -6 (flattest)
      [0,1,2,3,4,5,7,8,9,11], // -4,
      [0,1,2,3,4,6,7,8,10,11], // -2,
    ]
  },
  "No M6/m3": {
    familyIndex: 4, // -17 / +17 = 34
    noteCount: 10,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8", "Mode 9", "Mode 10"],
    sets: [
      [0,1,2,3,5,6,8,9,10,11], // +1,
      [0,1,2,4,5,7,8,9,10,11], // +3,
      [0,1,3,4,6,7,8,9,10,11], // +5,
      [0,2,3,5,6,7,8,9,10,11], // +7,
      [0,1,3,4,5,6,7,8,9,10], // -1,
      [0,2,3,4,5,6,7,8,9,11], // +1,
      [0,1,2,3,4,5,6,7,9,10], // -7 (flattest)
      [0,1,2,3,4,5,6,8,9,11], // -5,
      [0,1,2,3,4,5,7,8,10,11], // -3,
      [0,1,2,3,4,6,7,9,10,11], // -1,
    ]
  },
  "No M2/m7": {
    familyIndex: 5, // -20 / +20 = 40
    noteCount: 10,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8", "Mode 9", "Mode 10"],
    sets: [
      [0,1,2,3,4,6,8,9,10,11], // +0,
      [0,1,2,3,5,7,8,9,10,11], // +2,
      [0,1,2,4,6,7,8,9,10,11], // +4,
      [0,1,3,5,6,7,8,9,10,11], // +6,
      [0,2,4,5,6,7,8,9,10,11], // +8,
      [0,2,3,4,5,6,7,8,9,10], // +0,
      [0,1,2,3,4,5,6,7,8,10], // -8 (flattest)
      [0,1,2,3,4,5,6,7,9,11], // -6,
      [0,1,2,3,4,5,6,8,10,11], // -4,
      [0,1,2,3,4,5,7,9,10,11], // -2,
    ]
  },
  "No M7/m2": {
    familyIndex: 6, // -25 / +25 = 50
    noteCount: 10,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5", "Mode 6", "Mode 7", "Mode 8", "Mode 9", "Mode 10"],
    sets: [
      [0,1,2,3,4,5,8,9,10,11], // -1,
      [0,1,2,3,4,7,8,9,10,11], // +1,
      [0,1,2,3,6,7,8,9,10,11], // +3,
      [0,1,2,5,6,7,8,9,10,11], // +5,
      [0,1,4,5,6,7,8,9,10,11], // +7,
      [0,3,4,5,6,7,8,9,10,11], // +9,
      [0,1,2,3,4,5,6,7,8,9], // -9 (flattest)
      [0,1,2,3,4,5,6,7,8,11], // -7,
      [0,1,2,3,4,5,6,7,10,11], // -5,
      [0,1,2,3,4,5,6,9,10,11], // -3,
    ]
  },
// 11 note scales
  "Undecatonic": {
    familyIndex: 1, // -15 / +15 = 30
    noteCount: 11,
    names: ["Mode 1","Mode 2","Mode 3","Mode 4","Mode 5",
            "Mode 6","Undecachromatic","Mode 8","Mode 9","Mode 10","Mode 11"],
    sets: [
      [0,1,2,3,4,5,7,8,9,10,11],   // +0
      [0,1,2,3,4,6,7,8,9,10,11],   // +1
      [0,1,2,3,5,6,7,8,9,10,11],   // +2
      [0,1,2,4,5,6,7,8,9,10,11],   // +3
      [0,1,3,4,5,6,7,8,9,10,11],   // +4
      [0,2,3,4,5,6,7,8,9,10,11],   // +5
      [0,1,2,3,4,5,6,7,8,9,10],    // -5 (flattest)
      [0,1,2,3,4,5,6,7,8,9,11],    // -4
      [0,1,2,3,4,5,6,7,8,10,11],   // -3
      [0,1,2,3,4,5,6,7,9,10,11],   // -2
      [0,1,2,3,4,5,6,8,9,10,11],   // -1
    ]
  },
// 12 note scales
  "Chromatic": {
    familyIndex: 1,
    noteCount: 12,
    names: ["Chromatic"],
    sets: [
      [0,1,2,3,4,5,6,7,8,9,10,11],
    ]
  },
  "No Tritone": {
    familyIndex: 1,
    noteCount: 10,
    names: ["Mode 1", "Mode 2", "Mode 3", "Mode 4", "Mode 5"],
    sets: [
      [0,1,2,4,5,6,7,8,10,11],
      [0,1,3,4,5,6,7,9,10,11],
      [0,2,3,4,5,6,8,9,10,11],
      [0,1,2,3,4,6,7,8,9,10],
      [0,1,2,3,5,6,7,8,9,11],
    ]
  },
  "Nonatonic": {
    familyIndex: 1,
    noteCount: 9,
    names: ["Nonatonic 1", "Nonatonic 2", "Nonatonic 3"],
    sets: [
      [0,1,3,4,5,7,8,9,11],
      [0,2,3,4,6,7,8,10,11],
      [0,1,2,4,5,6,8,9,10],
    ]
  },
  "Octatonic": {
    familyIndex: 1,
    noteCount: 8,
    names: ["Octatonic 1", "Octatonic 2"],
    sets: [
      [0,1,3,4,6,7,9,10],
      [0,2,3,5,6,8,9,11]
    ]
  },
};

// ---------- Detection ----------
function detectModeFamilyAndIndex(intervalSet) {
  const rels = Array.from(intervalSet).sort((a, b) => a - b);
  const matches = [];

  for (const [familyName, data] of Object.entries(MODE_FAMILIES)) {
    data.sets.forEach((pattern, i) => {
      if (rels.length === pattern.length && rels.every((v, j) => v === pattern[j])) {
        matches.push({ family: familyName, index: i });
      }
    });
  }

  // If multiple matches, prefer the currently active selection
  if (matches.length > 1) {
    const sameFamily = matches.find(m => m.family === activeFamilyKey && m.index === activeModeIndex);
    if (sameFamily) return sameFamily;
    const sameFamilyAny = matches.find(m => m.family === activeFamilyKey);
    if (sameFamilyAny) return sameFamilyAny;
  }

  return matches[0] || { family: "Unknown", index: -1 };
}


// ---------- Color Setup ----------
const baseHues=[0,30,60,120,200,260,300];
function interpolateHues(anchors,totalSteps){
  const result=[];
  const sections=anchors.length-1;
  const stepsPerSection=totalSteps/sections;
  for(let i=0;i<sections;i++){
    const start=anchors[i];
    const end=anchors[i+1];
    for(let j=0;j<stepsPerSection;j++){
      const t=j/stepsPerSection;
      const hue=start+(end-start)*t;
      result.push(`hsl(${hue},70%,55%)`);
    }
  }
  return result.slice(0,totalSteps);
}
const COLORS=interpolateHues(baseHues,12);

// ---------- Global State ----------
let baseMask=new Set([0,2,4,5,7,9,11]);
let state={
  rootIndex:0,
  noteRot:0,
  colorStep:0,
  colorRot:0
};

// Family selector state
let activeNoteCount=7;
let activeFamilyKey="Diatonic";
let activeModeIndex=0;

// ---------- Audio (pooled, warm & light) ----------
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioCtx();

// Ensure audio can start after a user gesture (Chrome/Safari policy)
document.addEventListener('pointerdown', () => {
  if (ctx.state === 'suspended') ctx.resume();
}, { once: true });

// Master output (one gentle lowpass for warmth; single node = negligible CPU)
const masterGain = ctx.createGain();
masterGain.gain.value = 0.7;

const warmthLP = ctx.createBiquadFilter();
warmthLP.type = 'lowpass';
warmthLP.frequency.value = 6000; // slightly warm, still clear
warmthLP.Q.value = 0.7;

masterGain.connect(warmthLP);
warmthLP.connect(ctx.destination);

// --- 12-note persistent pool (C..B). Each has 2 oscillators mixed to one gain. ---
// Keeps CPU flat: no per-note node creation/destruction.
const NOTE_POOL = Array.from({ length: 12 }, () => {
  // Core sine body
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';

  // Subtle triangle for warmth (very low level)
  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';

  const triGain = ctx.createGain();
  triGain.gain.value = 0.18; // warmth amount (safe & light)

  // Per-note channel gain (we shape the envelope here)
  const chan = ctx.createGain();
  chan.gain.value = 0.0;

  // Routing
  osc1.connect(chan);
  osc2.connect(triGain).connect(chan);
  chan.connect(masterGain);

  // Run oscillators continuously; we only modulate their freq + chan gain
  const now = ctx.currentTime;
  osc1.start(now);
  osc2.start(now);

  return { osc1, osc2, gain: chan };
});

// Map frequency to pool index 0..11 (C..B around MIDI 60)
function poolIndexFromFreq(freq) {
  // nearest MIDI note
  const midi = Math.round(12 * Math.log2(freq / 440)) + 69;
  // pitch-class index relative to C4 (=60)
  let idx = (midi - 60) % 12;
  if (idx < 0) idx += 12;
  return idx;
}

// Ultra-light pluck with gentle attack & decay
function playFreq(freq, when = 0, dur = 1.6) {
  if (ctx.state === 'suspended') ctx.resume();

  const t = ctx.currentTime + when;
  const idx = poolIndexFromFreq(freq);
  const slot = NOTE_POOL[idx];

  // Set both oscillator frequencies (same pitch, different waveform)
  slot.osc1.frequency.setValueAtTime(freq, t);
  slot.osc2.frequency.setValueAtTime(freq, t);

  // Envelope on the pooled channel gain (restarts cleanly on retrigger)
  const g = slot.gain.gain;
  g.cancelScheduledValues(t);
  g.setValueAtTime(0.0001, t);
  g.exponentialRampToValueAtTime(0.33, t + 0.035); // gentle, non-clicky attack
  g.exponentialRampToValueAtTime(0.0001, t + dur); // smooth decay
}

// Helpers (unchanged)
function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }
function noteIndexToMidi(i, octave = 4) {
  return 60 + ((i + 12) % 12) + (octave - 4) * 12;
}

// Warm-up (prevents first-note hiccup)
(() => {
  const s = ctx.createBufferSource();
  s.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
  s.connect(masterGain);
  s.start(0);
})();


// ---------- Build SVG + Event Setup ----------
document.addEventListener('DOMContentLoaded',()=>{
  const svg=document.getElementById('wheel');
  const intervalControls=document.getElementById('interval-controls');
  const keyRows=document.getElementById('key-rows');

  svg.innerHTML=`
    <defs>
      <filter id="glowFilter"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <linearGradient id="stoneGrad" x1="0" x2="1"><stop offset="0%" stop-color="#3a3b3d"/><stop offset="100%" stop-color="#222325"/></linearGradient>
    </defs>
    <g id="rings"></g>
    <g id="color-rot"></g>
    <g id="notes-rot"></g>
    <g id="outer-btns"></g>
    <circle class="center" r="34"></circle>`;

  const rings=svg.querySelector('#rings');
  const colorRotGroup=svg.querySelector('#color-rot');
  const notesRot=svg.querySelector('#notes-rot');
  const outerBtnsG=svg.querySelector('#outer-btns');

  const R_outer=210,R_middle=175,noteR=30,R_inner_end=R_middle-noteR-1;
  const R_outer_interval=R_middle+noteR+40;
  const R_inner_interval=R_middle+noteR+4;
  const degStep=30,toRad=d=>d*Math.PI/180;

  // Outer ring
  const outerRing=document.createElementNS('http://www.w3.org/2000/svg','circle');
  outerRing.setAttribute('r',R_outer);
  outerRing.setAttribute('class','stone-ring');
  rings.appendChild(outerRing);

  // Color spokes
  for(let i=0;i<12;i++){
    const angle=(i*30-90)*Math.PI/180;
    const x=Math.cos(angle)*R_inner_end;
    const y=Math.sin(angle)*R_inner_end;
    const line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',0);line.setAttribute('y1',0);
    line.setAttribute('x2',x);line.setAttribute('y2',y);
    line.setAttribute('class','spoke');
    line.setAttribute('stroke',COLORS[i]);
    line.dataset.index=i;
    if(baseMask.has(i))line.classList.add('on');
    colorRotGroup.appendChild(line);
  }

  // Notes + labels
  for(let i=0;i<12;i++){
    const angle=(i*30-90)*Math.PI/180;
    const x=Math.cos(angle)*R_middle;
    const y=Math.sin(angle)*R_middle;
    const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('class','note-circle');
    c.setAttribute('r',noteR);
    c.setAttribute('cx',x);
    c.setAttribute('cy',y);
    c.dataset.index=i;
    notesRot.appendChild(c);
    const t=document.createElementNS('http://www.w3.org/2000/svg','text');
    t.setAttribute('class','note-label');
    t.setAttribute('x',x);t.setAttribute('y',y);
    t.setAttribute('text-anchor','middle');
    t.setAttribute('dominant-baseline','middle');
    t.dataset.idx=i;
    t.textContent=NOTES[i];
    t.setAttribute('font-size',/♯|♭/.test(NOTES[i])?'18px':'40px');
    notesRot.appendChild(t);
  }

  // Label orientation
  function updateNoteLabelOrientation(){
    notesRot.querySelectorAll('text.note-label').forEach(t=>{
      const x=parseFloat(t.getAttribute('x'));
      const y=parseFloat(t.getAttribute('y'));
      t.setAttribute('transform',`rotate(${-state.noteRot} ${x} ${y})`);
    });
  }
  updateNoteLabelOrientation();

  // Build interval wedges
  outerBtnsG.innerHTML='';
  outerBtnsG.setAttribute('transform','rotate(-15)');
  for(let i=0;i<12;i++){
    const startDeg=i*degStep-90;
    const endDeg=startDeg+degStep;
    const x1_outer=Math.cos(toRad(startDeg))*R_outer_interval;
    const y1_outer=Math.sin(toRad(startDeg))*R_outer_interval;
    const x2_outer=Math.cos(toRad(endDeg))*R_outer_interval;
    const y2_outer=Math.sin(toRad(endDeg))*R_outer_interval;
    const x1_inner=Math.cos(toRad(endDeg))*R_inner_interval;
    const y1_inner=Math.sin(toRad(endDeg))*R_inner_interval;
    const x2_inner=Math.cos(toRad(startDeg))*R_inner_interval;
    const y2_inner=Math.sin(toRad(startDeg))*R_inner_interval;
    const d=[`M ${x1_outer} ${y1_outer}`,
      `A ${R_outer_interval} ${R_outer_interval} 0 0 1 ${x2_outer} ${y2_outer}`,
      `L ${x1_inner} ${y1_inner}`,
      `A ${R_inner_interval} ${R_inner_interval} 0 0 0 ${x2_inner} ${y2_inner}`,
      'Z'].join(' ');
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',d);
    path.setAttribute('class','interval-wedge');
    path.dataset.idx=i;
    path.addEventListener('click',()=>toggleIntervalAtPosition(i));
    outerBtnsG.appendChild(path);
    const midDeg=startDeg+degStep/2;
    const labelR=(R_outer_interval+R_inner_interval)/2;
    const tx=Math.cos(toRad(midDeg))*labelR;
    const ty=Math.sin(toRad(midDeg))*labelR;
    const label=document.createElementNS('http://www.w3.org/2000/svg','text');
    label.setAttribute('x',tx);label.setAttribute('y',ty+4);
    label.setAttribute('text-anchor','middle');
    label.setAttribute('dominant-baseline','middle');
    label.setAttribute('class','interval-label');
    label.textContent=INTERVALS[i];
    label.setAttribute('transform',`rotate(15 ${tx} ${ty})`);
    outerBtnsG.appendChild(label);
  }
  // --- Bottom interval controls (kept hidden, still useful for debugging) ---
  const intervalButtons=[];
  for(let i=0;i<12;i++){
    const b=document.createElement('button');
    b.className='interval-btn';
    b.textContent=INTERVALS[i];
    b.dataset.idx=i;
    b.addEventListener('click',()=>toggleIntervalAtPosition(i));
    intervalControls.appendChild(b);
    intervalButtons.push(b);
  }
  intervalControls.style.display='none';

  // Click notes to play a tone
  notesRot.querySelectorAll('circle.note-circle').forEach(c=>{
    c.addEventListener('click', ()=>{
      const idx=parseInt(c.dataset.index);
      playSingleNote(idx);
    });
  });

  // ---------- Mapping / helpers bound to current DOM scope ----------
  function colorIndexAtInterval(intervalIndex){
    return (intervalIndex + state.colorStep) % 12;
  }

  function getSelectedIntervals(){
    const k=((state.colorStep%12)+12)%12;
    const sel=new Set();
    baseMask.forEach(colorIdx=>{
      const intervalIdx=((colorIdx - k)%12 + 12)%12;
      sel.add(intervalIdx);
    });
    return sel;
  }

  // Live preview helpers while dragging color ring
  function topColorIndexLive(){
    const rawTop=((Math.round(-state.colorRot/30)%12)+12)%12;
    const active=Array.from(baseMask);
    if(active.length===0) return rawTop;
    let best=active[0],bestDist=circularDistance(rawTop,best);
    for(const a of active){
      const d=circularDistance(rawTop,a);
      if(d<bestDist){best=a;bestDist=d;}
    }
    return best;
  }
  function colorIndexAtIntervalLive(intervalIndex){
    return (intervalIndex + topColorIndexLive()) % 12;
  }
  function getSelectedIntervalsLive(){
    const k=topColorIndexLive();
    const sel=new Set();
    baseMask.forEach(colorIdx=>{
      const intervalIdx=((colorIdx - k)%12 + 12)%12;
      sel.add(intervalIdx);
    });
    return sel;
  }

  function updateSpokesVisual(){
    colorRotGroup.querySelectorAll('line.spoke').forEach(line=>{
      const idx=parseInt(line.dataset.index);
      line.classList.toggle('on', baseMask.has(idx));
    });
  }

  function updateIntervalButtonsAndOuter(){
    const sel=getSelectedIntervals();
    outerBtnsG.querySelectorAll('path.interval-wedge').forEach((w,idx)=>{
      w.classList.toggle('active', sel.has(idx));
    });
    intervalButtons.forEach((btn,idx)=>{
      btn.classList.toggle('active', sel.has(idx));
    });
    renderKey(sel);
    reflectIndexUIFromCurrentSelection(sel); // keep panel synced
  }

  function updateAllVisuals(){
    updateSpokesVisual();
    updateIntervalButtonsAndOuter();
  }

  function toggleIntervalAtPosition(intervalIndex){
    const colorIdx=colorIndexAtInterval(intervalIndex);
    if(baseMask.has(colorIdx)) baseMask.delete(colorIdx); else baseMask.add(colorIdx);
    updateAllVisuals();
  }

  function getRotatedColor(intervalDeg){
    const colorIdx=colorIndexAtIntervalLive(intervalDeg);
    return COLORS[colorIdx];
  }

// ---------- Degree picker for variable-scale triads ----------
function getChordDegreesForScale(rels, idx) {
  const n = rels.length;
  let steps;

 if (n <= 2) steps = [0, 1];          // 2-note: dyad (1–2)
  else if (n === 3) steps = [0, 1, 2]; // 3-note: 1–2–3
  else if (n === 4) steps = [0, 1, 2, 3]; // 4-note: 1-2-3-4
  else if (n === 5) steps = [0, 2, 3]; // 5-note: 1–3–4
  else if (n <= 8) steps = [0, 2, 4];  // 4–8-note: 1–3–5
  else if (n <= 10) steps = [0, 3, 6]; // 9–10-note: 1–4–7
  else steps = [0, 4, 7];              // 11–12-note: 1–5–8

  // Build triad relative to this scale degree
  return steps.map(step => rels[(idx + step) % n]);
}

// ---------- Adaptive chord quality detection (robust tritone handling) ----------
function chordSymbolFromDegree(rels, idx) {
  const n = rels.length;

  // 1-note: always I
  if (n === 1) return 'I';

  // 2-note: dyad rules
  if (n === 2) {
    // Compute interval from this degree to the next degree
    const root = rels[idx];
    const other = rels[(idx + 1) % n];
    const interval = ((other - root + 12) % 12);

    let numeral = roman(idx + 1);

    // SPECIAL CASE: exact tritone dyad [0,6] — make degrees distinct
    // If the set itself is a pure tritone (difference = 6), format per-degree:
    const isPureTritone =
      ((rels[1] - rels[0] + 12) % 12) === 6 || ((rels[0] - rels[1] + 12) % 12) === 6;

    if (isPureTritone && interval === 6) {
      // First tile → Augmented Fourth (uppercase +)
      if (idx === 0) return numeral.toUpperCase() + '⁺';
      // Second tile → Diminished Fifth (lowercase °)
      return numeral.toLowerCase() + '°';
    }

    // Normal dyad logic
    switch (interval) {
      case 1: case 3: case 8: case 10: // minor intervals
        return numeral.toLowerCase();
      case 2: case 4: case 9: case 11: // major intervals
      case 5: case 7:                   // perfect 4th/5th
        return numeral.toUpperCase();
      case 6:                           // generic tritone dyad not caught above
        return numeral.toLowerCase() + '°';
      default:                          // unusual
        return numeral.toUpperCase() + '*';
    }
  }

  // 3+ notes: use adaptive triad logic
  const chordPcs = getChordDegreesForScale(rels, idx);
  const root = chordPcs[0];
  const third = chordPcs[1] ?? chordPcs[0];
  const fifth = chordPcs[2] ?? chordPcs[0];

  const thirdInt = ((third - root + 12) % 12);
  const fifthInt = ((fifth - root + 12) % 12);

  let numeral = roman(idx + 1);
  let isUpper = thirdInt >= 4;
  let suffix = '';

  if (fifthInt < 6 || fifthInt > 8) suffix = '*';
  else if (fifthInt > 7) suffix = '⁺';
  else if (fifthInt < 7) suffix = '°';

  if (!isUpper) numeral = numeral.toLowerCase();
  return numeral + suffix;
}

// ---------- Render mode tiles (auto Roman numerals) ----------
function renderKey(sel) {
  keyRows.innerHTML = '';
  const rels = Array.from(sel).sort((a, b) => a - b);
  const detected = detectModeFamilyAndIndex(sel);
  const names = MODE_FAMILIES[detected.family]?.names || [];

  rels.forEach((deg, idx) => {
    const tile = document.createElement('div');
    tile.className = 'mode-tile';
    tile.style.setProperty('--tile-color', getRotatedColor(deg));

    const col = document.createElement('div');
    col.className = 'key-col';
    tile.appendChild(col);

    // --- Roman numeral (quality-aware) ---
    const rn = document.createElement('button');
    rn.className = 'key-btn roman-btn';
    rn.textContent = chordSymbolFromDegree(rels, idx);
    rn.addEventListener('click', () => playTriadFromDegree(deg));

    // --- Mode name ---
    const nameBtn = document.createElement('button');
    nameBtn.className = 'key-btn key-name';
    if (detected.index >= 0 && names.length) {
      nameBtn.textContent = names[(detected.index + idx) % names.length];
    } else {
      nameBtn.textContent = `Mode ${idx + 1}`;
    }
    nameBtn.addEventListener('click', () => playModeFromDegree(idx));

    col.appendChild(rn);
    col.appendChild(nameBtn);
    keyRows.appendChild(tile);
  });
}

 // ===== Dragging and Rotation Logic (no-jump, smooth grab) =====

// Shared drag state
let dragging = null;
let lastAngle = 0;
let tempColorRotation = 0;
let startGroupRotation = 0;
let suppressVisualUpdate = false;

// Helper to get the current pointer angle
function getAngleFromEvent(e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
  return Math.atan2(loc.y, loc.x) * 180 / Math.PI;
}

// ----- Pointer Down / Drag Intent -----
// Mobile: avoid "scroll jam" by only locking the page once the gesture is clearly a wheel drag.
// If the initial motion is mostly vertical, we treat it as a scroll and do NOT start dragging.
let pendingDrag = null; // 'color' | 'notes' | null
let pendingPointerId = null;
let startClientX = 0, startClientY = 0;

const DRAG_DECIDE_PX = 10;      // how far to move before we decide intent
const VERTICAL_BIAS = 1.25;     // >1 means "more vertical than horizontal" = scroll intent

svg.addEventListener('pointerdown', (e) => {
  // Only capture primary pointer. Ignore secondary touches.
  if (e.pointerType === 'touch' && !e.isPrimary) return;

  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
  const dist = Math.hypot(loc.x, loc.y);

  const R_middle = 175, noteR = 30;

  // define grab zones
  const colorInner = 20;                    // inner radius where color grab starts
  const colorOuter = R_middle * 0.85;       // outer boundary of color zone
  const noteInner  = colorOuter - 6;        // inner boundary of note zone
  const noteOuter  = R_middle + noteR + 4;  // outer boundary of note zone

  pendingDrag = null;
  pendingPointerId = e.pointerId;
  startClientX = e.clientX;
  startClientY = e.clientY;

  // Determine which ring they grabbed, but DON'T lock scrolling yet.
  if (dist >= colorInner && dist < colorOuter) {
    pendingDrag = 'color';
  } else if (dist >= noteInner && dist <= noteOuter) {
    pendingDrag = 'notes';
  } else {
    return;
  }

  // If they click with mouse (desktop), start immediately (no scroll conflict).
  if (e.pointerType === 'mouse') {
    dragging = pendingDrag;
    pendingDrag = null;

    if (dragging === 'color') {
      tempColorRotation = 0;
      suppressVisualUpdate = true;

      const currentTransform = colorRotGroup.getAttribute('transform');
      const match = currentTransform ? currentTransform.match(/rotate\((-?\d+(\.\d+)?)\)/) : null;
      startGroupRotation = match ? parseFloat(match[1]) : state.colorRot;
      state.colorRot = startGroupRotation;
    } else if (dragging === 'notes') {
      suppressVisualUpdate = true;
      suppressVisualUpdate = true;
    }

    lastAngle = getAngleFromEvent(e);
    if (e.cancelable) e.preventDefault();
    return;
  }
}, { passive: true });


// ----- Pointer Move -----
window.addEventListener('pointermove', (e) => {
  // If a drag is pending (touch), decide whether it's scroll or wheel drag.
  if (!dragging && pendingDrag && e.pointerId === pendingPointerId) {
    const dx = e.clientX - startClientX;
    const dy = e.clientY - startClientY;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);

    // Wait until the gesture is big enough to classify intent.
    if (adx + ady < DRAG_DECIDE_PX) return;

    // Mostly vertical => user intends to scroll the page. Give up the drag.
    if (ady > adx * VERTICAL_BIAS) {
      pendingDrag = null;
      pendingPointerId = null;
      return;
    }

    // Otherwise: user intends to drag the wheel. Lock in.
    dragging = pendingDrag;
    pendingDrag = null;

    // Capture pointer so the drag continues even if finger leaves the SVG slightly.
    try { svg.setPointerCapture(e.pointerId); } catch (_) {}

    if (dragging === 'color') {
      tempColorRotation = 0;
      suppressVisualUpdate = true;

      const currentTransform = colorRotGroup.getAttribute('transform');
      const match = currentTransform ? currentTransform.match(/rotate\((-?\d+(\.\d+)?)\)/) : null;
      startGroupRotation = match ? parseFloat(match[1]) : state.colorRot;
      state.colorRot = startGroupRotation;
    } else if (dragging === 'notes') {
      suppressVisualUpdate = true;
    }

    lastAngle = getAngleFromEvent(e);
    if (e.cancelable) e.preventDefault();
    // fall through to apply movement this frame if any
  }

  if (!dragging) return;

  // While actively dragging, prevent vertical scroll "slip" on mobile.
  if (e.cancelable) e.preventDefault();

  const angle = getAngleFromEvent(e);
  const delta = angle - lastAngle;
  lastAngle = angle;

  if (dragging === 'notes') {
    state.noteRot += delta;
    notesRot.setAttribute('transform', `rotate(${state.noteRot})`);
    updateNoteLabelOrientation();
    state.rootIndex = ((Math.round((-state.noteRot) / 30) % 12) + 12) % 12;
  }

  else if (dragging === 'color') {
    tempColorRotation += delta;
    const visualRotation = startGroupRotation + tempColorRotation;
    colorRotGroup.setAttribute('transform', `rotate(${visualRotation})`);
    state.colorRot = visualRotation;
  }
}, { passive: false });


// ----- Pointer Up / Cancel -----
function endPointerDrag() {
  pendingDrag = null;
  pendingPointerId = null;
  if (!dragging) return;

  if (dragging === 'notes') {
    state.noteRot = Math.round(state.noteRot / 30) * 30;
    notesRot.setAttribute('transform', `rotate(${state.noteRot})`);
    updateNoteLabelOrientation();
    state.rootIndex = ((Math.round((-state.noteRot) / 30) % 12) + 12) % 12;
  }

  else if (dragging === 'color') {
    const totalRotation = startGroupRotation + tempColorRotation;
    let indexAtTop = Math.round((-totalRotation) / 30);
    indexAtTop = ((indexAtTop % 12) + 12) % 12;

    const active = Array.from(baseMask);
    if (active.length === 0) {
      state.colorStep = indexAtTop;
    } else {
      let best = active[0], bestDist = circularDistance(indexAtTop, best);
      for (const a of active) {
        const d = circularDistance(indexAtTop, a);
        if (d < bestDist) { best = a; bestDist = d; }
      }
      state.colorStep = best;
    }

    const targetRotation = -state.colorStep * 30;
    let startRotation = state.colorRot;

    // choose the shortest direction to target
    let delta = targetRotation - startRotation;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    const duration = 120; // ms
    const startTime = performance.now();

    function animateSnap(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const ease = t < 1 ? (1 - Math.cos(t * Math.PI)) / 2 : 1;
      const current = startRotation + delta * ease;
      colorRotGroup.setAttribute('transform', `rotate(${current})`);
      if (t < 1) requestAnimationFrame(animateSnap);
      else {
        state.colorRot = targetRotation;
        tempColorRotation = 0;
        updateAllVisuals();
      }
    }
    requestAnimationFrame(animateSnap);
  }

  suppressVisualUpdate = false;
  dragging = null;
}

window.addEventListener('pointerup', endPointerDrag, { passive: true });
window.addEventListener('pointercancel', endPointerDrag, { passive: true });


// Prevent repeated resume() calls and desync on  and desync on small sets
let audioReady = false;
function ensureAudioReady() {
  if (!audioReady && ctx.state === "suspended") {
    ctx.resume().then(() => (audioReady = true));
  } else {
    audioReady = true;
  }
}

// Wrap highlight calls in a single rAF batch for smoothness
const highlightQueue = new Set();
function scheduleHighlight(idx) {
  highlightQueue.add(idx);
  if (!scheduleHighlight._scheduled) {
    scheduleHighlight._scheduled = true;
    requestAnimationFrame(() => {
      highlightQueue.forEach(i => highlightNoteVisual(i));
      highlightQueue.clear();
      scheduleHighlight._scheduled = false;
    });
  }
}

// ---------- Playback ----------
function highlightNoteVisual(idx) {
  const lbl = svg.querySelector(`text.note-label[data-idx="${idx}"]`);
  const circle = svg.querySelector(`circle.note-circle[data-index="${idx}"]`);
  const intervalDeg = ((idx - state.rootIndex) % 12 + 12) % 12;
  const colorIdx = (intervalDeg + state.colorStep) % 12;
  const spoke = baseMask.has(colorIdx)
    ? svg.querySelector(`line.spoke[data-index="${colorIdx}"]`)
    : null;

  const glowColor = spoke ? spoke.getAttribute('stroke') : '#fff';

  // ✴️ helper to trigger glow animations for labels/circles
  const triggerGlow = (el) => {
    if (!el) return;
    el.classList.remove('glow-active');
    void el.offsetWidth; // restart animation
    el.style.setProperty('--glow-color', glowColor);
    el.classList.add('glow-active');
    setTimeout(() => el.classList.remove('glow-active'), 700);
  };

// 🔹 create white halo around colored spoke (visible outer glow)
if (spoke) {
  const halo = spoke.cloneNode();
  halo.removeAttribute('class');
  halo.setAttribute('stroke', 'white');
  halo.setAttribute('stroke-width', parseFloat(spoke.getAttribute('stroke-width')) + 6); // much thicker
  halo.setAttribute('stroke-linecap', 'round');
  halo.classList.add('spoke-halo');

  spoke.parentNode.insertBefore(halo, spoke); // place behind the colored spoke

  // animate halo fade
  requestAnimationFrame(() => {
    halo.style.opacity = 1;
    setTimeout(() => (halo.style.opacity = 0), 300);
    setTimeout(() => halo.remove(), 700);
  });
}

  // trigger note label and circle glows
  triggerGlow(lbl);
  triggerGlow(circle);
}

// ---------- Playback (consistent root register, correctly voiced) ----------

// Helper: get anchored MIDI so all playback starts from same base register
function anchoredMidiForNote(noteIdx) {
  const intervalFromRoot = ((noteIdx - state.rootIndex) % 12 + 12) % 12;
  const rootBase = noteIndexToMidi(state.rootIndex, 4); // reference octave
  let m = noteIndexToMidi(noteIdx, 4);
  if (intervalFromRoot === 0) return rootBase;          // tonic stays at base
  while (m <= rootBase) m += 12;                        // all others above it
  return m;
}

// ---------- Single note (click) ----------
function playSingleNote(idx) {
  if (ctx.state === 'suspended') ctx.resume();
  const midi = anchoredMidiForNote(idx);
  playFreq(midiToFreq(midi), 0, 1.0);
  highlightNoteVisual(idx);
}

// ---------- Adaptive triad playback ----------
function playTriadFromDegree(deg) {
  if (ctx.state === 'suspended') ctx.resume();

  const sel = getSelectedIntervals();
  const rels = Array.from(sel).sort((a,b)=>a-b);
  const n = rels.length;
  const i = rels.indexOf(deg);
  if (i === -1) return;

  const chordPcs = getChordDegreesForScale(rels, i);
  const noteIdxs = chordPcs.map(pc => (pc + state.rootIndex) % 12);

  // Root defines chord register
  const midis = [];
  midis[0] = anchoredMidiForNote(noteIdxs[0]);

  // Each upper voice placed above the previous
  for (let k = 1; k < noteIdxs.length; k++) {
    let m = noteIndexToMidi(noteIdxs[k], 4);
    while (m <= midis[k-1]) m += 12;
    midis[k] = m;
  }

  midis.forEach((m, k) => {
    playFreq(midiToFreq(m), k * 0.02, 1.2);
    highlightNoteVisual(noteIdxs[k]);
  });
}

// ---------- Mode (starts same as single note, ends one octave up) ----------
function playModeFromDegree(i) {
  ensureAudioReady();

  const sel = getSelectedIntervals();
  const rels = Array.from(sel).sort((a, b) => a - b);
  if (rels.length === 0) return;

  const start = i % rels.length;
  const pcs = [];
  for (let k = 0; k < rels.length; k++) pcs.push(rels[(start + k) % rels.length]);

  const baseMidi = noteIndexToMidi(state.rootIndex, 4);
  let prevMidi = null;

  pcs.forEach((pc, idx) => {
    const noteIdx = (pc + state.rootIndex) % 12;
    let midi = noteIndexToMidi(noteIdx, 4);
    if (!Number.isFinite(midi)) return;
    if (prevMidi !== null) while (midi <= prevMidi) midi += 12;

    const when = 0.02 + idx * 0.36; // <== small safe delay for first note
    const freq = midiToFreq(midi);
    if (!isFinite(freq) || freq <= 20) return;

    playFreq(freq, when, 1.0);
    setTimeout(() => scheduleHighlight(noteIdx), when * 1000);
    prevMidi = midi;
  });

  const firstIdx = (pcs[0] + state.rootIndex) % 12;
  const octaveWhen = 0.02 + pcs.length * 0.36 + 0.05;
  const octaveMidi = noteIndexToMidi(firstIdx, 5);
  const octaveFreq = midiToFreq(octaveMidi);
  if (isFinite(octaveFreq)) {
    playFreq(octaveFreq, octaveWhen, 1.0);
    setTimeout(() => scheduleHighlight(firstIdx), octaveWhen * 1000);
  }
}


  // Hook up action controls if visible
  const actionPlayMode=document.getElementById('play-mode');
  const actionPlayChords=document.getElementById('play-chords');
  const actionPlayScale=document.getElementById('play-scale');
  if(actionPlayMode) actionPlayMode.addEventListener('click', ()=>playModeSequence());
  if(actionPlayScale) actionPlayScale.addEventListener('click', ()=>playModeSequence());
  if(actionPlayChords) actionPlayChords.addEventListener('click', ()=>{
    if(ctx.state==='suspended') ctx.resume();
    const sel=getSelectedIntervals();
    const rels=Array.from(sel).sort((a,b)=>a-b);
    rels.forEach((deg,i)=>{
      const second=rels[(i+2)%rels.length];
      const third =rels[(i+4)%rels.length];
      const notes=[deg,second,third].map(d=>(d+state.rootIndex)%12);
      notes.forEach((n,j)=> playFreq(midiToFreq(noteIndexToMidi(n,4)), i*0.6 + j*0.02, 1.0));
      notes.forEach(n=> setTimeout(()=> highlightNoteVisual(n), i*600));
    });
  });


  // ---------- Mode Control Panel wiring ----------
  const notesMinus=document.getElementById('notes-minus');
  const notesPlus =document.getElementById('notes-plus');
  const notesDisplay=document.getElementById('notes-display');
  const familyPrev=document.getElementById('family-prev');
  const familyNext=document.getElementById('family-next');
  const familyDisplay=document.getElementById('family-display');
  const indexInput=document.getElementById('index-input');

  // derive unique note counts available
  function availableNoteCounts(){
    const s=new Set(Object.values(MODE_FAMILIES).map(f=>f.noteCount));
    return Array.from(s).sort((a,b)=>a-b);
  }
  function familiesForCount(n){
    return Object.keys(MODE_FAMILIES).filter(k=>MODE_FAMILIES[k].noteCount===n);
  }

  function loadModeFamily(familyKey, modeIndex=0){
    const fam=MODE_FAMILIES[familyKey];
    if(!fam) return;
    // replace baseMask with the chosen mode pattern
    baseMask=new Set(fam.sets[modeIndex]);
    activeFamilyKey=familyKey;
    activeNoteCount=fam.noteCount;
    activeModeIndex=modeIndex;

    // snap color group to the first active spoke (root defaults to nearest active)
    const active=Array.from(baseMask);
    state.colorStep = active.length ? active[0] : 0;
    colorRotGroup.setAttribute('transform', `rotate(${-state.colorStep*30})`);
    state.colorRot = -state.colorStep*30;

    // update UI
    familyDisplay.textContent=familyKey;
    notesDisplay.textContent=activeNoteCount;
    indexInput.value=`${fam.noteCount}.${fam.familyIndex}.${modeIndex+1}`;

    updateAllVisuals();
  }

  function reflectIndexUIFromCurrentSelection(sel){
    // Called after any change to intervals/rotation to keep index/labels in sync
    const { family, index } = detectModeFamilyAndIndex(sel);
    const famObj=MODE_FAMILIES[family];
    if(famObj && index>=0){
      activeFamilyKey=family;
      activeNoteCount=famObj.noteCount;
      activeModeIndex=index;
      familyDisplay.textContent=family;
      notesDisplay.textContent=activeNoteCount;
      indexInput.value=`${famObj.noteCount}.${famObj.familyIndex}.${index+1}`;
    }else{
      // Unknown / custom: show derived count, keep family label
      familyDisplay.textContent='Custom';
      notesDisplay.textContent=Array.from(sel).length;
      indexInput.value=`${Array.from(sel).length}.0.1`;
    }
  }

  // Notes ± handlers
  notesMinus.addEventListener('click',()=>{
    const counts=availableNoteCounts();
    let idx=counts.indexOf(activeNoteCount);
    if(idx<=0) idx=counts.length; // wrap
    idx--;
    const newCount=counts[idx];
    const fams=familiesForCount(newCount);
    loadModeFamily(fams[0], 0);
  });
  notesPlus.addEventListener('click',()=>{
    const counts=availableNoteCounts();
    let idx=counts.indexOf(activeNoteCount);
    idx=(idx+1)%counts.length;
    const newCount=counts[idx];
    const fams=familiesForCount(newCount);
    loadModeFamily(fams[0], 0);
  });

  // Family ⇄ handlers
  familyPrev.addEventListener('click',()=>{
    const fams=familiesForCount(activeNoteCount);
    let i=fams.indexOf(activeFamilyKey);
    if(i<=0) i=fams.length;
    i--;
    loadModeFamily(fams[i], 0);
  });
  familyNext.addEventListener('click',()=>{
    const fams=familiesForCount(activeNoteCount);
    let i=fams.indexOf(activeFamilyKey);
    i=(i+1)%fams.length;
    loadModeFamily(fams[i], 0);
  });

  // Index input handler (format n.f.m)
  indexInput.addEventListener('change',()=>{
    const v=indexInput.value.trim();
    const parts=v.split('.');
    if(parts.length!==3) return; // ignore invalid
    const [nStr,fStr,mStr]=parts;
    const n=Number(nStr), f=Number(fStr), m=Number(mStr);
    if(!Number.isFinite(n) || !Number.isFinite(f) || !Number.isFinite(m)) return;

    // find family with matching (noteCount, familyIndex)
    const matchKey = Object.keys(MODE_FAMILIES).find(k=>{
      const fam=MODE_FAMILIES[k];
      return fam.noteCount===n && fam.familyIndex===f;
    });
    if(!matchKey) return;

    const fam=MODE_FAMILIES[matchKey];
    const modeIndex=Math.min(Math.max(m-1,0), fam.sets.length-1);
    loadModeFamily(matchKey, modeIndex);
  });

  // ---------- Initial render ----------
  // Start on whatever the current active family should be (Diatonic Ionian)
  loadModeFamily(activeFamilyKey, 0);

}); // end DOMContentLoaded

// ---------- Utilities (global) ----------
function circularDistance(a,b){
  const diff=Math.abs(a-b)%12;
  return Math.min(diff, 12-diff);
}
function roman(n){
  const romans=["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
  return romans[n-1]||n;
}

(function(){
  const container = document.getElementById('key-rows');
  if(!container) return;

  const obs = new MutationObserver(() => {
    // avoid endless loop: only wrap when direct children are not rows
    const hasRows = container.querySelector(':scope > .mode-row');
    if(!hasRows){
      splitKeyRowsIntoBalancedLines();
    }
  });
  obs.observe(container, { childList: true });

  // initial attempt
  splitKeyRowsIntoBalancedLines();
})();
