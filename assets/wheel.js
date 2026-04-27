/* ModeWheel page hook for scoped desktop layout lock.
   Safari-safe alternative to CSS :has(). */
document.body.classList.add("modewheel-page");

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
  const sipPanel=document.getElementById('scale-info-panel');
  const sipTitle=document.getElementById('sip-title');
  const sipSpell=document.getElementById('sip-spell');
  const sipSpellNatural=document.getElementById('sip-spell-natural');
  const sipSpellSharp=document.getElementById('sip-spell-sharp');
  const sipSpellFlat=document.getElementById('sip-spell-flat');
  const sipSpellEnharmonic=document.getElementById('sip-spell-enharmonic');
  const sipSpellSet=document.getElementById('sip-spell-set');
  const sipIntervalDisplay=document.getElementById('sip-interval-display');
  const sipIntervalDegrees=document.getElementById('sip-interval-degrees');
  const sipIntervalIntervals=document.getElementById('sip-interval-intervals');
  const sipIntervalSteps=document.getElementById('sip-interval-steps');
  const sipToggle=document.getElementById('sip-toggle');
  const sipBody=document.getElementById('sip-body');
  const sipSet=document.getElementById('sip-set');
  const sipSetRelative=document.getElementById('sip-set-relative');
  const sipSetFixed=document.getElementById('sip-set-fixed');
  const sipHist=document.getElementById('sip-hist');


  // Scale info panel toggle (desktop)
  if(sipToggle && sipBody){
    sipToggle.addEventListener('click', ()=>{
      const isOpen = !sipBody.hasAttribute('hidden');
      if(isOpen){
        sipBody.setAttribute('hidden','');
        sipToggle.textContent = '+';
        sipToggle.setAttribute('aria-expanded','false');
      }else{
        sipBody.removeAttribute('hidden');
        sipToggle.textContent = '−';
        sipToggle.setAttribute('aria-expanded','true');
      }
    });
  }


  // Spelling controls (desktop panel)
  // accidentalMode controls free spelling: natural split, sharp-only, or flat-only.
  // enharmonicSpelling adds strict 7-letter spelling when the current set qualifies.
  function updateSpellingControlButtons(){
    const mode = state.accidentalMode || 'natural';
    if(sipSpellNatural){ sipSpellNatural.classList.toggle('active', mode==='natural'); sipSpellNatural.setAttribute('aria-pressed', mode==='natural' ? 'true' : 'false'); }
    if(sipSpellSharp){ sipSpellSharp.classList.toggle('active', mode==='sharp'); sipSpellSharp.setAttribute('aria-pressed', mode==='sharp' ? 'true' : 'false'); }
    if(sipSpellFlat){ sipSpellFlat.classList.toggle('active', mode==='flat'); sipSpellFlat.setAttribute('aria-pressed', mode==='flat' ? 'true' : 'false'); }
    if(sipSpellSet){ sipSpellSet.classList.toggle('active', !!state.spellAsSet); sipSpellSet.setAttribute('aria-pressed', state.spellAsSet ? 'true' : 'false'); }
  }

  function updateIntervalControlButtons(){
    const mode = state.intervalDisplayMode || 'degrees';
    if(sipIntervalDegrees){ sipIntervalDegrees.classList.toggle('active', mode==='degrees'); sipIntervalDegrees.setAttribute('aria-pressed', mode==='degrees' ? 'true' : 'false'); }
    if(sipIntervalIntervals){ sipIntervalIntervals.classList.toggle('active', mode==='intervals'); sipIntervalIntervals.setAttribute('aria-pressed', mode==='intervals' ? 'true' : 'false'); }
    if(sipIntervalSteps){ sipIntervalSteps.classList.toggle('active', mode==='steps'); sipIntervalSteps.setAttribute('aria-pressed', mode==='steps' ? 'true' : 'false'); }
  }

  function setIntervalDisplayMode(mode){
    state.intervalDisplayMode = mode;
    updateIntervalControlButtons();
    updateScaleInfoPanel();
  }

  function setAccidentalMode(mode){
    state.accidentalMode = mode;
    state.spellAsSet = false; // Set is a temporary display override; spelling buttons return to notes.
    updateSpellingControlButtons();
    updateScaleInfoPanel();
  }
  function setEnharmonicSpelling(on){
    state.enharmonicSpelling = !!on;
    state.spellAsSet = false; // Leaving Set restores as much of the underlying spelling state as eligible.
    updateSpellingControlButtons();
    updateScaleInfoPanel();
  }
  function setSpellingAsSet(on){
    state.spellAsSet = !!on;
    updateSpellingControlButtons();
    updateScaleInfoPanel();
  }

  if(sipSpellNatural) sipSpellNatural.addEventListener('click', ()=>setAccidentalMode('natural'));
  if(sipSpellSharp)   sipSpellSharp.addEventListener('click', ()=>setAccidentalMode('sharp'));
  if(sipSpellFlat)    sipSpellFlat.addEventListener('click', ()=>setAccidentalMode('flat'));
  if(sipSpellEnharmonic){
    sipSpellEnharmonic.addEventListener('click', ()=>{
      if(sipSpellEnharmonic.disabled) return;
      setEnharmonicSpelling(!state.enharmonicSpelling);
    });
  }
  if(sipSpellSet) sipSpellSet.addEventListener('click', ()=>setSpellingAsSet(!state.spellAsSet));
  if(sipIntervalDegrees) sipIntervalDegrees.addEventListener('click', ()=>setIntervalDisplayMode('degrees'));
  if(sipIntervalIntervals) sipIntervalIntervals.addEventListener('click', ()=>setIntervalDisplayMode('intervals'));
  if(sipIntervalSteps) sipIntervalSteps.addEventListener('click', ()=>setIntervalDisplayMode('steps'));

  // Defaults: Natural + Enharmonic ON, matching normal C major spelling.
  if(state.accidentalMode === undefined) state.accidentalMode = 'natural';
  if(state.enharmonicSpelling === undefined) state.enharmonicSpelling = true;
  if(state.spellAsSet === undefined) state.spellAsSet = false;
  if(state.intervalDisplayMode === undefined) state.intervalDisplayMode = 'degrees';
  updateSpellingControlButtons();
  updateIntervalControlButtons();
  updateScaleInfoPanel();

  svg.innerHTML=`
    <defs>
      <filter id="glowFilter"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <linearGradient id="stoneGrad" x1="0" x2="1"><stop offset="0%" stop-color="#3a3b3d"/><stop offset="100%" stop-color="#222325"/></linearGradient>
      <radialGradient id="noteGlassGrad" cx="38%" cy="30%" r="74%">
        <stop offset="0%" stop-color="#2a2a31" stop-opacity="0.98"/>
        <stop offset="38%" stop-color="#131318" stop-opacity="0.98"/>
        <stop offset="78%" stop-color="#07070a" stop-opacity="1"/>
        <stop offset="100%" stop-color="#020203" stop-opacity="1"/>
      </radialGradient>
      <radialGradient id="intervalGlassGrad" cx="48%" cy="32%" r="88%">
        <stop offset="0%" stop-color="#24242a" stop-opacity="0.42"/>
        <stop offset="42%" stop-color="#111116" stop-opacity="0.52"/>
        <stop offset="78%" stop-color="#060608" stop-opacity="0.76"/>
        <stop offset="100%" stop-color="#010102" stop-opacity="0.90"/>
      </radialGradient>
      <linearGradient id="noteRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f0f0f4" stop-opacity="0.38"/>
        <stop offset="34%" stop-color="#bfc0c8" stop-opacity="0.24"/>
        <stop offset="62%" stop-color="#1c1c22" stop-opacity="0.42"/>
        <stop offset="100%" stop-color="#050506" stop-opacity="0.70"/>
      </linearGradient>
      <radialGradient id="wheelFieldGrad" cx="50%" cy="46%" r="88%">
        <stop offset="0%" stop-color="#1a1a22" stop-opacity="0.94"/>
        <stop offset="40%" stop-color="#111116" stop-opacity="0.97"/>
        <stop offset="66%" stop-color="#09090e" stop-opacity="1"/>
        <stop offset="84%" stop-color="#050507" stop-opacity="1"/>
        <stop offset="100%" stop-color="#020203" stop-opacity="1"/>
      </radialGradient>
    </defs>
    <g id="rings"></g>
    <g id="color-rot"></g>
    <g id="notes-rot"></g>
    <g id="outer-btns"></g>
    <g id="center-hub" aria-hidden="true">
      <circle class="center-spoke-mask" r="32.35"></circle>
      <circle class="center-rim-outline center-rim-outline-outer" r="31.7"></circle>
      <circle class="center-rim-glass" r="30.55"></circle>
      <circle class="center-rim-outline center-rim-outline-inner" r="29.35"></circle>
      <circle class="center" r="28"></circle>
    </g>`;

  const rings=svg.querySelector('#rings');
  const colorRotGroup=svg.querySelector('#color-rot');
  const notesRot=svg.querySelector('#notes-rot');
  const outerBtnsG=svg.querySelector('#outer-btns');
  const handleRotGroup = svg.querySelector('#handle-rot') || (()=>{
    const g=document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('id','handle-rot');
    // Put handles above notes so touch always hits them on mobile
    notesRot.parentNode.appendChild(g);
    return g;
  })();

  const R_outer=210,R_middle=175,noteR=30,R_inner_end=R_middle-noteR-1;
  const R_outer_interval=R_middle+noteR+40;
  const R_inner_interval=R_middle+noteR+5;
  const degStep=30,toRad=d=>d*Math.PI/180;

  // Outer ring
  const outerRing=document.createElementNS('http://www.w3.org/2000/svg','circle');
  outerRing.setAttribute('r',R_outer);
  outerRing.setAttribute('class','stone-ring');
  rings.appendChild(outerRing);

  // Color spokes
  // Each active spoke is a crisp layered "glass rod":
  // broad low-opacity underlay + solid colored core + thin white highlight.
  handleRotGroup.innerHTML='';
  for(let i=0;i<12;i++){
    const angle=(i*30-90)*Math.PI/180;
    const x=Math.cos(angle)*R_inner_end;
    const y=Math.sin(angle)*R_inner_end;

    const spokeStack=document.createElementNS('http://www.w3.org/2000/svg','g');
    spokeStack.setAttribute('class','spoke-stack');
    spokeStack.dataset.index=i;
    if(baseMask.has(i)) spokeStack.classList.add('on');

    const underlay=document.createElementNS('http://www.w3.org/2000/svg','line');
    underlay.setAttribute('x1',0); underlay.setAttribute('y1',0);
    underlay.setAttribute('x2',x); underlay.setAttribute('y2',y);
    underlay.setAttribute('class','spoke-underlay');
    underlay.setAttribute('stroke',COLORS[i]);
    underlay.setAttribute('stroke-linecap','round');
    underlay.dataset.index=i;

    const line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',0);line.setAttribute('y1',0);
    line.setAttribute('x2',x);line.setAttribute('y2',y);
    line.setAttribute('class','spoke');
    line.setAttribute('stroke',COLORS[i]);
    line.setAttribute('stroke-linecap','round');
    line.dataset.index=i;

    const highlight=document.createElementNS('http://www.w3.org/2000/svg','line');
    highlight.setAttribute('x1',0);highlight.setAttribute('y1',0);
    highlight.setAttribute('x2',x);highlight.setAttribute('y2',y);
    highlight.setAttribute('class','spoke-highlight');
    highlight.setAttribute('stroke','rgba(255,255,255,0.62)');
    highlight.setAttribute('stroke-linecap','round');
    highlight.dataset.index=i;

    spokeStack.appendChild(underlay);
    spokeStack.appendChild(line);
    spokeStack.appendChild(highlight);
    colorRotGroup.appendChild(spokeStack);

    // Small grab handle at spoke end (where it meets the note ring)
    // Handles are placed in handleRotGroup (above notes) for reliable iOS hit-testing.
    const h=document.createElementNS('http://www.w3.org/2000/svg','circle');
    h.setAttribute('class','dual-rotate-handle');

    // Bias slightly toward the note circle so it's easier to grab on touch.
    const R_handle = R_inner_end + noteR * 0.08;
    const xh = Math.cos(angle) * R_handle;
    const yh = Math.sin(angle) * R_handle;
    h.setAttribute('cx',xh); h.setAttribute('cy',yh);

    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    h.setAttribute('r', isTouch ? 7 : 5);

    h.dataset.index=i;
    handleRotGroup.appendChild(h);
  }

  // Notes + labels
  for(let i=0;i<12;i++){
    const angle=(i*30-90)*Math.PI/180;
    const x=Math.cos(angle)*R_middle;
    const y=Math.sin(angle)*R_middle;
    const mask=document.createElementNS('http://www.w3.org/2000/svg','circle');
    mask.setAttribute('class','note-spoke-mask');
    mask.setAttribute('r',noteR + 2.35);
    mask.setAttribute('cx',x);
    mask.setAttribute('cy',y);
    mask.dataset.index=i;
    notesRot.appendChild(mask);

    const rimOuter=document.createElementNS('http://www.w3.org/2000/svg','circle');
    rimOuter.setAttribute('class','note-rim-outline note-rim-outline-outer');
    rimOuter.setAttribute('r',noteR + 1.7);
    rimOuter.setAttribute('cx',x);
    rimOuter.setAttribute('cy',y);
    rimOuter.dataset.index=i;
    notesRot.appendChild(rimOuter);

    const rimGlass=document.createElementNS('http://www.w3.org/2000/svg','circle');
    rimGlass.setAttribute('class','note-rim-glass');
    rimGlass.setAttribute('r',noteR + 0.55);
    rimGlass.setAttribute('cx',x);
    rimGlass.setAttribute('cy',y);
    rimGlass.dataset.index=i;
    notesRot.appendChild(rimGlass);

    const rimInner=document.createElementNS('http://www.w3.org/2000/svg','circle');
    rimInner.setAttribute('class','note-rim-outline note-rim-outline-inner');
    rimInner.setAttribute('r',noteR - 0.65);
    rimInner.setAttribute('cx',x);
    rimInner.setAttribute('cy',y);
    rimInner.dataset.index=i;
    notesRot.appendChild(rimInner);

    const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('class','note-circle');
    c.setAttribute('r',noteR - 2.0);
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
  setTimeout(() => {
    if (typeof updateWheelNoteLabelsFromSpelling === 'function') {
      updateWheelNoteLabelsFromSpelling();
    }
  }, 0);

  // Tandem rotation: dragging at note/spoke intersections rotates BOTH rings together
  handleRotGroup.querySelectorAll('circle.dual-rotate-handle').forEach(h=>{
    h.addEventListener('pointerdown', startTandemDrag, { passive: false });
  });

  // Build interval wedges
  outerBtnsG.innerHTML='';
  outerBtnsG.setAttribute('transform','rotate(-15)');

  // Double-banded obsidian rims for the interval band.
  // Define helper here, but draw the rims AFTER the wedges so they sit visibly on top.
  const addIntervalRim = (r, edge) => {
    const outline=document.createElementNS('http://www.w3.org/2000/svg','circle');
    outline.setAttribute('r',r);
    outline.setAttribute('class',`interval-rim-outline interval-rim-outline-${edge}`);
    outerBtnsG.appendChild(outline);

    const glass=document.createElementNS('http://www.w3.org/2000/svg','circle');
    glass.setAttribute('r', edge === 'outer' ? r - 1.35 : r + 1.35);
    glass.setAttribute('class',`interval-rim-glass interval-rim-glass-${edge}`);
    outerBtnsG.appendChild(glass);

    const dark=document.createElementNS('http://www.w3.org/2000/svg','circle');
    dark.setAttribute('r', edge === 'outer' ? r - 2.7 : r + 2.7);
    dark.setAttribute('class',`interval-rim-dark interval-rim-dark-${edge}`);
    outerBtnsG.appendChild(dark);
  };

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
    label.dataset.idx = i;
    label.textContent=INTERVALS[i];
    label.setAttribute('transform',`rotate(15 ${tx} ${ty})`);
    outerBtnsG.appendChild(label);
  }

  // Draw interval double-band rims after wedges/labels so the edge treatment is visible.
  // Labels remain readable because rims are thin and pointer-events are disabled.
  addIntervalRim(R_outer_interval, 'outer');
  addIntervalRim(R_inner_interval, 'inner');

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

  // Keep center hub visually above spokes, rims, handles, and note layers.
  const centerHub = svg.querySelector('#center-hub');
  if (centerHub) svg.appendChild(centerHub);

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
    colorRotGroup.querySelectorAll('.spoke-stack').forEach(stack=>{
      const idx=parseInt(stack.dataset.index);
      stack.classList.toggle('on', baseMask.has(idx));
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
    updateIntervalRingLabels();
    renderKey(sel);
    reflectIndexUIFromCurrentSelection(sel); // keep panel synced
  }

  function updateAllVisuals(){
    updateSpokesVisual();
    updateIntervalButtonsAndOuter();
    updateScaleInfoPanel();
  }

  function toggleIntervalAtPosition(intervalIndex){
    const colorIdx=colorIndexAtInterval(intervalIndex);
    if(baseMask.has(colorIdx)) baseMask.delete(colorIdx); else baseMask.add(colorIdx);
    updateAllVisuals();
    updateScaleInfoPanel();
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
    const tileColor = getRotatedColor(deg);
    tile.style.setProperty('--tile-color', tileColor);

    // Mobile Safari fallback: if color-mix() backgrounds fail, this preserves tile color.
    tile.style.background = `radial-gradient(circle at 50% 22%, ${tileColor} 0%, ${tileColor} 38%, rgba(8,8,10,0.96) 132%)`;

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

    const modeName = (detected.index >= 0 && names.length)
      ? names[(detected.index + idx) % names.length]
      : `Mode ${idx + 1}`;

    nameBtn.dataset.modeName = modeName;

    const rootSpan = document.createElement('span');
    rootSpan.className = 'mode-root-label';

    const modeSpan = document.createElement('span');
    modeSpan.className = 'mode-name-label';
    modeSpan.textContent = modeName;

    nameBtn.appendChild(rootSpan);
    nameBtn.appendChild(modeSpan);

    nameBtn.addEventListener('click', () => playModeFromDegree(idx));

    col.appendChild(rn);
    col.appendChild(nameBtn);
    keyRows.appendChild(tile);
  });

  updateModeTileDesktopLabels(sel, detected);
}

// ---------- Desktop mode tile metadata: family header + spelled mode roots ----------

function getModeFamilyDisplayName(familyName, selectedIntervals) {
  const set = Array.from(selectedIntervals || getSelectedIntervals()).sort((a, b) => a - b);
  const noteCount = set.length;

  // detectModeFamilyAndIndex returns { family, index }, so look up familyIndex
  // from MODE_FAMILIES rather than expecting it on the detected object.
  const detected = detectModeFamilyAndIndex(set);
  const resolvedFamilyName = detected?.family || familyName;
  const familyData = MODE_FAMILIES[resolvedFamilyName] || MODE_FAMILIES[familyName];
  const familyIndex = familyData && typeof familyData.familyIndex !== 'undefined'
    ? familyData.familyIndex
    : null;

  // Vernacular exceptions for common/standard families.
  if (noteCount === 7 && familyIndex === 1) return 'The Major Scale';
  if (noteCount === 6 && familyIndex === 1) return 'The Whole-Tone Scale';
  if (noteCount === 5 && familyIndex === 1) return 'The Pentatonic Scale';
  if (noteCount === 8 && familyIndex === 1) return 'The Octatonic Scale';
  if (noteCount === 12 && familyIndex === 1) return 'The Chromatic Scale';

  return familyName || resolvedFamilyName || 'Custom';
}


function ensureModeFamilyHeader() {
  const keyArea = document.getElementById('key-area');
  if (!keyArea || !keyRows) return null;

  let header = document.getElementById('mode-family-header');
  if (!header) {
    header = document.createElement('div');
    header.id = 'mode-family-header';
    header.innerHTML = '<div class="mode-family-header-kicker">Modes of</div><div class="mode-family-header-name"></div>';
    keyArea.insertBefore(header, keyRows);
  }
  const topRow = document.getElementById('mw-toprow');
  if (topRow && !document.getElementById('mw-instructions')) {
    const instructions = document.createElement('div');
    instructions.id = 'mw-instructions';
    instructions.innerHTML = '<div>Adjust wheel to select scale</div><div>Tap modes to listen</div>';
    topRow.appendChild(instructions);
  }

  return header;
}

function updateModeTileDesktopLabels(sel, detectedInfo) {
  const header = ensureModeFamilyHeader();
  const selected = sel || getSelectedIntervals();
  const detected = detectedInfo || detectModeFamilyAndIndex(selected);

  const rels = Array.from(selected).sort((a, b) => a - b);
  const familyData = MODE_FAMILIES[detected?.family] || null;
  const familyNames = Array.isArray(familyData?.names) ? familyData.names : [];
  const detectedIndex = Number.isFinite(detected?.index) ? detected.index : -1;

  let spelled = [];
  try {
    spelled = spellNotesForSet(state.rootIndex, rels);
  } catch (err) {
    spelled = [];
  }

  let activeRootName = '';
  let activeModeName = '';

  /*
    Live visual sync for desktop mode tiles.

    renderKey() rebuilds these on release. During drag, however, we want the
    existing tiles to behave like a live instrument display:
      - Roman numerals follow the currently approached mode.
      - Tile colors follow the current spoke/color position.
      - Mode names/root labels update without waiting for pointerup.
  */
  const tiles = Array.from(document.querySelectorAll('#key-area .mode-tile'));

  tiles.forEach((tile, idx) => {
    const deg = rels[idx] ?? 0;

    // Tile color: use the live color position while dragging.
    const tileColor = getRotatedColor(deg);
    tile.style.setProperty('--tile-color', tileColor);
    tile.style.background = `radial-gradient(circle at 50% 22%, ${tileColor} 0%, ${tileColor} 38%, rgba(8,8,10,0.96) 132%)`;

    // Roman numeral: recompute from the current live modal ordering.
    const romanBtn = tile.querySelector('.roman-btn');
    if (romanBtn) {
      romanBtn.textContent = chordSymbolFromDegree(rels, idx);
    }

    const btn = tile.querySelector('.key-name');
    if (!btn) return;

    /*
      Recompute the mode name on every live update.
      Previously this reused btn.dataset.modeName, which was only refreshed by renderKey().
      During dragging, renderKey() does not always run, so the first mode/header,
      Roman numerals, and tile colors could lag until pointerup.
    */
    const modeName = (detectedIndex >= 0 && familyNames.length)
      ? familyNames[(detectedIndex + idx) % familyNames.length]
      : (btn.dataset.modeName || `Mode ${idx + 1}`);

    btn.dataset.modeName = modeName;

    let rootName = spelled[idx];

    // Fallback if the current spelling mode cannot produce a clean label.
    if (!rootName || rootName === 'Spelling unavailable') {
      rootName = pickNeutralName((state.rootIndex + deg) % 12);
    }

    let rootSpan = btn.querySelector('.mode-root-label');
    let modeSpan = btn.querySelector('.mode-name-label');

    if (!rootSpan || !modeSpan) {
      btn.textContent = '';
      rootSpan = document.createElement('span');
      rootSpan.className = 'mode-root-label';
      modeSpan = document.createElement('span');
      modeSpan.className = 'mode-name-label';
      btn.appendChild(rootSpan);
      btn.appendChild(modeSpan);
    }

    rootSpan.textContent = rootName;
    modeSpan.textContent = modeName;

    // The first row is the mode currently in root position.
    if (idx === 0) {
      activeRootName = rootName;
      activeModeName = modeName;
    }
  });

  if (header) {
    const familyNameEl = header.querySelector('.mode-family-header-name');
    if (familyNameEl) {
      let displayMode = activeModeName || 'Mode';
      if (displayMode === 'Ionian') displayMode = 'Major';
      if (displayMode === 'Aeolian') displayMode = 'Natural Minor';
      familyNameEl.textContent = activeRootName ? `${activeRootName} ${displayMode}` : displayMode;
    }
  }

  if (typeof window.syncModeTileNameWidth === 'function') {
    window.syncModeTileNameWidth();
  }
}



 // ===== Dragging and Rotation Logic (no-jump, smooth grab) =====

// Shared drag state
let dragging = null;
let lastAngle = 0;
let tempColorRotation = 0;
let startGroupRotation = 0;
let startNoteRotation = 0; // for tandem (notes + colors together)
let startTandemRootIndex = 0;
let startTandemColorStep = 0;
let lastTandemLiveColorStep = null; // spelling updates only when nearest active spoke/mode changes
let suppressVisualUpdate = false;

// Helper to get the current pointer angle
function getAngleFromEvent(e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
  return Math.atan2(loc.y, loc.x) * 180 / Math.PI;
}

// Start tandem drag from the small intersection handles (note meets colored line)
function startTandemDrag(e){
  if (e.pointerType === 'touch' && !e.isPrimary) return;
  e.stopPropagation();
  if (e.cancelable) e.preventDefault();

  // Sync rotations from current transforms (in case an animation was in progress)
  const nT = notesRot.getAttribute('transform');
  const nM = nT ? nT.match(/rotate\((-?\d+(?:\.\d+)?)\)/) : null;
  if (nM) state.noteRot = parseFloat(nM[1]);

  const cT = colorRotGroup.getAttribute('transform');
  const cM = cT ? cT.match(/rotate\((-?\d+(?:\.\d+)?)\)/) : null;
  if (cM) state.colorRot = parseFloat(cM[1]);

  dragging = 'tandem';
  tempColorRotation = 0;
  startGroupRotation = state.colorRot || 0;
  startNoteRotation = state.noteRot || 0;

  // Tandem drag is modal, not chromatic:
  // remember the starting displayed root and starting nearest active spoke.
  startTandemRootIndex = ((state.rootIndex % 12) + 12) % 12;
  startTandemColorStep = topColorIndexLive();
  lastTandemLiveColorStep = startTandemColorStep;

  lastAngle = getAngleFromEvent(e);

  try { (e.currentTarget && e.currentTarget.setPointerCapture) ? e.currentTarget.setPointerCapture(e.pointerId) : svg.setPointerCapture(e.pointerId); } catch (_) {}
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
    } else if (dragging === 'tandem') {
    // Rotate notes + color spokes together (relative mode view)
    state.noteRot += delta;
    notesRot.setAttribute('transform', `rotate(${state.noteRot})`);
    updateNoteLabelOrientation();
    state.rootIndex = ((Math.round((-state.noteRot) / 30) % 12) + 12) % 12;
    updateKeyDisplay();

    tempColorRotation += delta;
    const visualRotation = startGroupRotation + tempColorRotation;
    colorRotGroup.setAttribute('transform', `rotate(${visualRotation})`);
    handleRotGroup.setAttribute('transform', `rotate(${visualRotation})`);
    state.colorRot = visualRotation;

    // update mode + index live while dragging
    const idxAtTop = ((Math.round((-visualRotation) / 30) % 12) + 12) % 12;
    state.colorStep = idxAtTop;
    updateModeDisplay();
    reflectIndexUIFromCurrentSelection(getSelectedIntervals());
    updateScaleInfoPanel();
  }

  else if (dragging === 'notes') {
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
    updateKeyDisplay();
    // keep index panel synced (adds key digit)
    reflectIndexUIFromCurrentSelection(getSelectedIntervals());
    updateScaleInfoPanel();
  }

  else if (dragging === 'color') {
    tempColorRotation += delta;
    const visualRotation = startGroupRotation + tempColorRotation;
    colorRotGroup.setAttribute('transform', `rotate(${visualRotation})`);
    handleRotGroup.setAttribute('transform', `rotate(${visualRotation})`);
    state.colorRot = visualRotation;

    // Live-update the mode controls and right-side mode tiles as the color ring
    // passes each nearest active spoke. This keeps mode names, Roman numerals,
    // and tile colors from waiting until pointerup/snap.
    state.colorStep = topColorIndexLive();
    const liveSel = getSelectedIntervals();
    reflectIndexUIFromCurrentSelection(liveSel);
    updateModeTileDesktopLabels(liveSel);
    updateScaleInfoPanel();
  }

  else if (dragging === 'tandem') {
    // Rotate notes + color spokes together while dragging from intersection handles
    state.noteRot += delta;
    tempColorRotation += delta;

    const visualRotation = startGroupRotation + tempColorRotation;
    notesRot.setAttribute('transform', `rotate(${state.noteRot})`);
    colorRotGroup.setAttribute('transform', `rotate(${visualRotation})`);
    handleRotGroup.setAttribute('transform', `rotate(${visualRotation})`);
    state.colorRot = visualRotation;
    updateNoteLabelOrientation();

    // Live-update mode/index from the nearest active spoke.
    // Do NOT update spelling from every chromatic note crossing during tandem drag.
    // Instead, derive the displayed root from the starting root plus movement
    // through selected relative-mode spokes. This is direction-independent.
    const liveColorStep = topColorIndexLive();
    state.colorStep = liveColorStep;

    if (liveColorStep !== lastTandemLiveColorStep) {
      lastTandemLiveColorStep = liveColorStep;

      const modalDelta = ((liveColorStep - startTandemColorStep) % 12 + 12) % 12;
      state.rootIndex = (startTandemRootIndex + modalDelta) % 12;

      updateKeyDisplay();
    }

    const liveSel = getSelectedIntervals();
    reflectIndexUIFromCurrentSelection(liveSel);
    updateModeTileDesktopLabels(liveSel);
    updateScaleInfoPanel();
  }
}, { passive: false });


// ----- Pointer Up / Cancel -----
function endPointerDrag() {
  pendingDrag = null;
  pendingPointerId = null;
  if (!dragging) return;

  if (dragging === 'tandem') {
    // Snap BOTH rings together to the nearest ACTIVE spoke (keeps relative-mode relationship)
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
    // Use the CURRENT visual rotation as the snap start (tandem drag doesn't always keep state.colorRot updated)
    const startRotation = startGroupRotation + tempColorRotation;
    const startNote = state.noteRot;

    // choose the shortest direction to target
    let delta = targetRotation - startRotation;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    const duration = 120; // ms
    const startTime = performance.now();

    function animateSnap(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const ease = t < 1 ? (1 - Math.cos(t * Math.PI)) / 2 : 1;

      const currentColor = startRotation + delta * ease;
      const currentNote  = startNote  + delta * ease;

      colorRotGroup.setAttribute('transform', `rotate(${currentColor})`);
      notesRot.setAttribute('transform', `rotate(${currentNote})`);
      updateNoteLabelOrientation();

      if (t < 1) requestAnimationFrame(animateSnap);
      else {
        state.colorRot = targetRotation;
        state.noteRot  = startNote + delta;
        tempColorRotation = 0;

        // Snap note rotation exactly to step and refresh UI
        state.noteRot = Math.round(state.noteRot / 30) * 30;
        notesRot.setAttribute('transform', `rotate(${state.noteRot})`);
        updateNoteLabelOrientation();

        state.rootIndex = ((Math.round((-state.noteRot) / 30) % 12) + 12) % 12;
        updateKeyDisplay();
        updateModeDisplay();
        reflectIndexUIFromCurrentSelection(getSelectedIntervals());
        updateScaleInfoPanel();
        updateAllVisuals();
      }
    }
    requestAnimationFrame(animateSnap);
  }

  else if (dragging === 'notes') {
    state.noteRot = Math.round(state.noteRot / 30) * 30;
    notesRot.setAttribute('transform', `rotate(${state.noteRot})`);
    updateNoteLabelOrientation();
    state.rootIndex = ((Math.round((-state.noteRot) / 30) % 12) + 12) % 12;
    updateKeyDisplay();
    updateScaleInfoPanel();
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
  lastTandemLiveColorStep = null;
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
  const spokeStack = baseMask.has(colorIdx)
    ? svg.querySelector(`.spoke-stack[data-index="${colorIdx}"]`)
    : null;
  const spoke = spokeStack ? spokeStack.querySelector('line.spoke') : null;

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

  spokeStack.insertBefore(halo, spokeStack.firstChild); // place behind the glass spoke stack

  // animate halo fade
  requestAnimationFrame(() => {
    halo.style.opacity = 1;
    setTimeout(() => (halo.style.opacity = 0), 300);
    setTimeout(() => halo.remove(), 700);
  });
}

  // trigger note label, face, and full rim-system glows
  triggerGlow(lbl);
  triggerGlow(circle);
  svg.querySelectorAll(
    `.note-rim-outline[data-index="${idx}"], .note-rim-glass[data-index="${idx}"]`
  ).forEach(triggerGlow);
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
  const resetWheel=document.getElementById('reset-wheel');

  // URL/index sync. The URL uses ?index=n.family.key.mode, for example ?index=7.1.0.1
  // Keep disabled during initial render so the default state does not overwrite a shared URL before it is read.
  let urlIndexSyncEnabled = false;

  function updateUrlFromIndex(){
    if(!urlIndexSyncEnabled || !indexInput) return;
    const currentIndex = indexInput.value.trim();
    if(!currentIndex) return;

    const url = new URL(window.location.href);
    if(url.searchParams.get('index') === currentIndex) return;

    url.searchParams.set('index', currentIndex);
    window.history.replaceState({}, '', url);
  }

  // New selectors: Key + Mode
  const keyPrev=document.getElementById('key-prev');
  const keyNext=document.getElementById('key-next');
  const keyDisplay=document.getElementById('key-display');
  const modePrev=document.getElementById('mode-prev');
  const modeNext=document.getElementById('mode-next');
  const modeDisplay=document.getElementById('mode-display');

  function updateKeyDisplay(){
    if(!keyDisplay) return;
    keyDisplay.textContent = NOTES[state.rootIndex] || 'C';
  }
  function updateModeDisplay(){
    if(!modeDisplay) return;
    const fam = MODE_FAMILIES[activeFamilyKey];
    if(fam && Array.isArray(fam.names) && fam.names[activeModeIndex]){
      modeDisplay.textContent = fam.names[activeModeIndex];
    } else if(fam){
      modeDisplay.textContent = `Mode ${activeModeIndex+1}`;
    } else {
      modeDisplay.textContent = 'Custom';
    }
  }

  function ensureSipTitleControls(){
    if(!sipTitle) return;

    if(!sipTitle.querySelector('.sip-key-control')){
      sipTitle.innerHTML = `
        <span class="sip-title-control sip-key-control" aria-label="Key selector">
          <button class="sip-title-arrow sip-key-prev" type="button" aria-label="Previous key">‹</button>
          <span class="sip-title-value sip-key-value">C</span>
          <button class="sip-title-arrow sip-key-next" type="button" aria-label="Next key">›</button>
        </span>
        <span class="sip-title-control sip-mode-control" aria-label="Mode selector">
          <button class="sip-title-arrow sip-mode-prev" type="button" aria-label="Previous mode">‹</button>
          <span class="sip-title-value sip-mode-value">Ionian</span>
          <button class="sip-title-arrow sip-mode-next" type="button" aria-label="Next mode">›</button>
        </span>
      `;

      sipTitle.querySelector('.sip-key-prev')?.addEventListener('click', (e)=>{
        e.stopPropagation();
        setKeyRootIndex(state.rootIndex - 1);
      });
      sipTitle.querySelector('.sip-key-next')?.addEventListener('click', (e)=>{
        e.stopPropagation();
        setKeyRootIndex(state.rootIndex + 1);
      });
      sipTitle.querySelector('.sip-mode-prev')?.addEventListener('click', (e)=>{
        e.stopPropagation();
        stepMode(-1);
      });
      sipTitle.querySelector('.sip-mode-next')?.addEventListener('click', (e)=>{
        e.stopPropagation();
        stepMode(1);
      });
    }
  }

  function updateSipTitleControls(keyName, modeName){
    if(!sipTitle) return;
    ensureSipTitleControls();

    const keyValue = sipTitle.querySelector('.sip-key-value');
    const modeValue = sipTitle.querySelector('.sip-mode-value');

    if(keyValue) keyValue.textContent = keyName || (NOTES[state.rootIndex] || 'C');
    if(modeValue) modeValue.textContent = modeName || 'Mode';
  }

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
    indexInput.value=`${fam.noteCount}.${fam.familyIndex}.${state.rootIndex}.${modeIndex+1}`;
    updateModeDisplay();
    updateKeyDisplay();
    updateScaleInfoPanel();
    updateUrlFromIndex();

    updateAllVisuals();
  }

  
  function pickNeutralName(pc){
    return NOTES[(pc+12)%12] || '';
  }
  function pickSharpName(pc){
    const s = pickNeutralName(pc);
    return s.includes('/') ? s.split('/')[0] : s;
  }
  function pickFlatName(pc){
    const s = pickNeutralName(pc);
    return s.includes('/') ? s.split('/')[1] : s;
  }

  function maxStepOfSet(intervals){
    const arr = Array.from(new Set(intervals)).sort((a,b)=>a-b);
    if(arr.length < 2) return 0;
    let maxStep = 0;
    for(let i=0;i<arr.length;i++){
      const a = arr[i];
      const b = (i===arr.length-1) ? (12 + arr[0]) : arr[i+1];
      maxStep = Math.max(maxStep, b-a);
    }
    return maxStep;
  }

  function canUseEnharmonicSpelling(intervals){
    const setArr = Array.from(new Set(intervals)).sort((a,b)=>a-b);
    return setArr.length === 7 && maxStepOfSet(setArr) <= 3;
  }

  function accidentalText(acc){
    if(acc === 0) return '';
    if(acc > 0){
      if(acc === 1) return '#';
      if(acc === 2) return 'x';
      const pairs = Math.floor(acc / 2);
      const extra = acc % 2;
      return 'x'.repeat(pairs) + (extra ? '#' : '');
    }
    return 'b'.repeat(Math.abs(acc));
  }

  function pcFromLetterAndAcc(letter, acc){
    const basePcForLetter = {C:0, D:2, E:4, F:5, G:7, A:9, B:11};
    return (basePcForLetter[letter] + acc + 1200) % 12;
  }

  function accidentalForPc(letter, targetPc, mode){
    const basePcForLetter = {C:0, D:2, E:4, F:5, G:7, A:9, B:11};
    const base = basePcForLetter[letter];
    const target = ((targetPc % 12) + 12) % 12;

    if(mode === 'sharp'){
      return (target - base + 12) % 12;       // 0..11, never flat
    }
    if(mode === 'flat'){
      return -((base - target + 12) % 12);    // -11..0, never sharp
    }

    // JS `%` keeps the sign of negative numbers, so normalize before shifting
    // into the -6..5 range. Without this, cases like B -> C could become
    // -11 instead of +1, producing runaway spellings such as Bbbbbbbbbbbb.
    let diff = (((target - base + 6) % 12) + 12) % 12 - 6; // -6..5, simplest spelling
    if(diff === -6) diff = 6;
    return diff;
  }

  function rootCandidatesForPc(rootPc, mode){
    const letters = ['C','D','E','F','G','A','B'];
    const candidates = [];
    letters.forEach(letter=>{
      const acc = accidentalForPc(letter, rootPc, mode);
      if(pcFromLetterAndAcc(letter, acc) === ((rootPc%12)+12)%12){
        candidates.push({letter, acc, name: letter + accidentalText(acc)});
      }
    });
    return candidates;
  }

  function spellEnharmonicFromRootCandidate(rootPc, intervals, rootCandidate, mode){
    const setArr = Array.from(new Set(intervals)).sort((a,b)=>a-b);
    if(!canUseEnharmonicSpelling(setArr)) return null;

    const letters = ['C','D','E','F','G','A','B'];
    const startIdx = letters.indexOf(rootCandidate.letter);
    if(startIdx < 0) return null;

    const spelled = [];
    const accs = [];
    for(let deg=0; deg<7; deg++){
      const letter = letters[(startIdx + deg) % 7];
      const targetPc = (rootPc + setArr[deg]) % 12;
      const acc = accidentalForPc(letter, targetPc, mode);
      spelled.push(letter + accidentalText(acc));
      accs.push(acc);
    }

    return {
      spelled,
      accs,
      score: accs.reduce((sum, acc)=>sum + Math.abs(acc), 0),
      maxAbs: Math.max(...accs.map(acc=>Math.abs(acc))),
      rootAcc: rootCandidate.acc
    };
  }

  function compareEnharmonicOptions(a, b, mode){
    if(a.score !== b.score) return a.score - b.score;
    if(a.maxAbs !== b.maxAbs) return a.maxAbs - b.maxAbs;
    if(mode === 'sharp') return a.rootAcc - b.rootAcc;
    if(mode === 'flat') return b.rootAcc - a.rootAcc;
    // Natural mode tie-breaker: prefer flat-side names for now when accidentals are otherwise equal.
    return a.rootAcc - b.rootAcc;
  }

  function spellEnharmonicNotes(rootPc, intervals, mode){
    const effectiveMode = mode || 'natural';
    const candidates = rootCandidatesForPc(rootPc, effectiveMode);
    let options = candidates
      .map(candidate => spellEnharmonicFromRootCandidate(rootPc, intervals, candidate, effectiveMode))
      .filter(Boolean);

    // Natural + Enharmonic: if the pitch-class has a natural root spelling, preserve it.
    if(effectiveMode === 'natural'){
      const naturalRootOptions = options.filter(opt => opt.rootAcc === 0);
      if(naturalRootOptions.length) options = naturalRootOptions;
    }

    if(!options.length) return null;
    options.sort((a,b)=>compareEnharmonicOptions(a,b,effectiveMode));
    return options[0].spelled;
  }

  function spellNotesForSet(rootPc, intervals){
    const mode = state.accidentalMode || 'natural';
    const wantsEnharmonic = !!state.enharmonicSpelling;
    const enharmonicAvailable = canUseEnharmonicSpelling(intervals);

    if(wantsEnharmonic && enharmonicAvailable){
      const enharmonicSpelling = spellEnharmonicNotes(rootPc, intervals, mode);
      if(enharmonicSpelling) return enharmonicSpelling;
      return ['Spelling unavailable'];
    }

    if(mode === 'sharp') return intervals.map(iv => pickSharpName((rootPc + iv)%12));
    if(mode === 'flat')  return intervals.map(iv => pickFlatName((rootPc + iv)%12));
    return intervals.map(iv => pickNeutralName((rootPc + iv)%12));
  }

  function wheelNoteFontSizeForLabel(label, isScaleTone){
    const text = String(label || '');
    const accidentalCount = (text.match(/[♯♭#bx]/g) || []).length;

    if(text.includes('/')) return isScaleTone ? '17px' : '16px';
    if(accidentalCount === 0 && text.length <= 2) return '40px';
    if(accidentalCount === 1) return '32px';
    if(accidentalCount === 2) return '27px';
    if(accidentalCount === 3) return '22px';
    return '19px';
  }

  function wheelFallbackNoteLabel(pc){
    const mode = state.accidentalMode || 'natural';
    if(mode === 'sharp') return pickSharpName(pc);
    if(mode === 'flat') return pickFlatName(pc);
    return pickNeutralName(pc);
  }

  function updateWheelNoteLabelsFromSpelling(){
    try {
      if(!notesRot) return;

      const rels = Array.from(getSelectedIntervals()).sort((a,b)=>a-b);
      const scaleMap = new Map();

      let spelled = [];
      try {
        spelled = spellNotesForSet(state.rootIndex, rels);
      } catch(err) {
        spelled = [];
      }

      if(Array.isArray(spelled) && spelled[0] && spelled[0] !== 'Spelling unavailable'){
        rels.forEach((iv, idx)=>{
          const pc = ((state.rootIndex + iv) % 12 + 12) % 12;
          const label = spelled[idx];
          if(label && label !== 'Spelling unavailable') scaleMap.set(pc, label);
        });
      }

      notesRot.querySelectorAll('text.note-label').forEach(t=>{
        const pc = ((parseInt(t.dataset.idx, 10) || 0) % 12 + 12) % 12;

        // Set notation on the wheel is always fixed pitch-class notation:
        // C=0, C#/Db=1, D=2 ... B=11.
        // It ignores root, scale membership, enharmonic spelling, and sharp/flat preference.
        if (state.spellAsSet) {
          const label = String(pc);

          t.textContent = label;
          t.setAttribute('font-size', '36px');
          t.classList.toggle('spelled-scale-tone', false);
          t.classList.toggle('spelled-chromatic-tone', false);
          return;
        }

        const isScaleTone = scaleMap.has(pc);
        const label = isScaleTone ? scaleMap.get(pc) : wheelFallbackNoteLabel(pc);

        t.textContent = label;
        t.setAttribute('font-size', wheelNoteFontSizeForLabel(label, isScaleTone));
        t.classList.toggle('spelled-scale-tone', isScaleTone);
        t.classList.toggle('spelled-chromatic-tone', !isScaleTone);
      });
    } catch(err) {
      console.warn('[ModeWheel] note spelling display skipped:', err);
    }
  }

// ---------- Scale Info Panel (desktop) ----------
  function intervalClassHistogram(pcs){
    const uniq = Array.from(new Set(pcs)).map(n=>((n%12)+12)%12).sort((a,b)=>a-b);
    const counts = {1:0,2:0,3:0,4:0,5:0,6:0};
    for(let i=0;i<uniq.length;i++){
      for(let j=i+1;j<uniq.length;j++){
        const d = (uniq[j]-uniq[i]+12)%12;
        const ic = Math.min(d, 12-d);
        if(ic>=1 && ic<=6) counts[ic] += 1;
      }
    }
    return counts;
  }

  function renderHistogram(counts){
    if(!sipHist) return;
    const labels = {
      1: 'm2 / M7',
      2: 'M2 / m7',
      3: 'm3 / M6',
      4: 'M3 / m6',
      5: 'P4 / P5',
      6: 'Tritone'
    };
    const vals = [1,2,3,4,5,6].map(k=>counts[k]||0);
    const maxV = Math.max(1, ...vals);
    sipHist.innerHTML = '';
    [1,2,3,4,5,6].forEach(ic=>{
      const row = document.createElement('div');
      row.className = 'sip-row';

      const lab = document.createElement('div');
      lab.className = 'sip-ic';
      lab.textContent = labels[ic];

      const cnt = document.createElement('div');
      cnt.className = 'sip-count';
      cnt.textContent = String(counts[ic]||0);

      const bar = document.createElement('div');
      bar.className = 'sip-bar';
      const fill = document.createElement('span');
      fill.style.width = ((counts[ic]||0)/maxV*100).toFixed(1) + '%';
      bar.appendChild(fill);

      row.appendChild(lab);
      row.appendChild(cnt);
      row.appendChild(bar);
      sipHist.appendChild(row);
    });
  }

  function renderFixedSetNotation(rootPc, intervals){
    const uniqueInOrder = [];
    const seen = new Set();

    intervals.forEach(n=>{
      const pc = ((n%12)+12)%12;
      if(!seen.has(pc)){
        seen.add(pc);
        uniqueInOrder.push(pc);
      }
    });

    // Set notation here is fixed pitch-class notation where C=0, C#/Db=1, etc.
    // It preserves the current mode/scale order, so E-rooted displays start with 4.
    return uniqueInOrder.map(n=>((rootPc + n)%12 + 12)%12);
  }


  function parseSpelledNoteToken(token){
    // Parses compact spellings generated by this app, including C, C#, Cx, Cx#, Cbb.
    // Neutral split spellings such as D#/Eb are intentionally treated as ambiguous.
    if(!token || token.includes('/')) return null;
    const m = String(token).match(/^([A-G])((?:x#?|#|b*)?)$/);
    if(!m) return null;
    const letter = m[1];
    const accidental = m[2] || '';
    let acc = 0;
    for(let i=0; i<accidental.length; i++){
      const ch = accidental[i];
      if(ch === '#') acc += 1;
      else if(ch === 'b') acc -= 1;
      else if(ch === 'x') acc += 2;
    }
    const letterPcs = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
    const letterIndex = {C:0,D:1,E:2,F:3,G:4,A:5,B:6};
    return {
      token,
      letter,
      acc,
      letterIndex: letterIndex[letter],
      pc: ((letterPcs[letter] + acc) % 12 + 12) % 12
    };
  }

  function normalizeAlteration(n){
    let x = n;
    while(x > 6) x -= 12;
    while(x < -6) x += 12;
    return x;
  }

  function degreeAccidentalText(alteration){
    if(alteration === 0) return '';
    if(alteration > 0){
      if(alteration === 1) return '#';
      if(alteration === 2) return 'x';
      const pairs = Math.floor(alteration / 2);
      const extra = alteration % 2;
      return 'x'.repeat(pairs) + (extra ? '#' : '');
    }
    return 'b'.repeat(Math.abs(alteration));
  }

  function intervalQualityText(degreeNum, alteration){
    const perfectType = (degreeNum === 1 || degreeNum === 4 || degreeNum === 5);
    if(perfectType){
      if(alteration === 0) return 'P';
      if(alteration > 0) return '+'.repeat(alteration);
      return 'o'.repeat(Math.abs(alteration));
    }

    // Major-type intervals: 2, 3, 6, 7.
    if(alteration === 0) return 'M';
    if(alteration === -1) return 'm';
    if(alteration < -1) return 'o'.repeat(Math.abs(alteration) - 1);
    return '+'.repeat(alteration);
  }

  function intervalLabelsFromSpelling(spelled, intervals, mode){
    const parsed = (spelled || []).map(parseSpelledNoteToken);
    if(parsed.length && parsed.every(Boolean)){
      const root = parsed[0];
      const majorDegreeSemitones = [0,2,4,5,7,9,11];
      return parsed.map(note=>{
        const degreeNum = ((note.letterIndex - root.letterIndex + 7) % 7) + 1;
        const semitoneDistance = (note.pc - root.pc + 12) % 12;
        const expected = majorDegreeSemitones[degreeNum - 1];
        const alteration = normalizeAlteration(semitoneDistance - expected);

        if(mode === 'intervals'){
          return intervalQualityText(degreeNum, alteration) + degreeNum;
        }
        return degreeAccidentalText(alteration) + degreeNum;
      });
    }

    // Fallback for neutral split spelling or custom unavailable spellings.
    // This keeps the panel useful even when there is not one unambiguous spelled note row.
    // Tritone naming is contextual here: positions 1-4 read as #4/+4,
    // while positions 5+ read as b5/o5. This avoids the default row calling
    // an apparent fifth-scale-degree tritone "#4".
    const degreeByStep = ['1','b2','2','b3','3','4','#4','5','b6','6','b7','7'];
    const intervalByStep = ['P1','m2','M2','m3','M3','P4','+4','P5','m6','M6','m7','M7'];
    const source = mode === 'intervals' ? intervalByStep : degreeByStep;
    return (intervals || []).map((iv, idx) => {
      const step = ((iv%12)+12)%12;
      const scaleDegreePosition = idx + 1;
      if(step === 6){
        if(scaleDegreePosition === 4){
          return mode === 'intervals' ? '+4' : '#4';
        }
        if(scaleDegreePosition === 5){
          return mode === 'intervals' ? 'o5' : 'b5';
        }
        return 'Tt';
      }
      return source[step];
    });
  }

  function renderIntervalDisplay(spelled, intervals){
    const mode = state.intervalDisplayMode || 'degrees';
    if(mode === 'steps') return (intervals || []).map(iv=>((iv%12)+12)%12);
    return intervalLabelsFromSpelling(spelled, intervals, mode);
  }

  function intervalRingDegreeLabel(step){
    const s = ((step % 12) + 12) % 12;

    // Default chromatic degree names.
    // No split labels here: out-of-scale tones and non-enharmonic display should stay simple.
    return ['1','b2','2','b3','3','4','#4','5','b6','6','b7','7'][s];
  }

  function intervalRingIntervalLabel(step){
    const s = ((step % 12) + 12) % 12;

    // Default chromatic interval names.
    // No split labels here: out-of-scale tones and non-enharmonic display should stay simple.
    return ['P1','m2','M2','m3','M3','P4','+4','P5','m6','M6','m7','M7'][s];
  }

  function updateIntervalRingLabels(){
    try {
      if(!outerBtnsG) return;

      const labels = Array.from(outerBtnsG.querySelectorAll('text.interval-label'));
      if(!labels.length) return;

      const selected = getSelectedIntervals();
      let spelled = [];
      try {
        const rels = Array.from(selected).sort((a,b)=>a-b);
        spelled = spellNotesForSet(state.rootIndex, rels);
      } catch(err) {
        spelled = [];
      }

      let selectedLabelMap = new Map();

      /*
        Enharmonic-aware interval labels only apply to selected scale tones,
        and only when Enharmonic is enabled.

        The note-wheel "Set" toggle is intentionally ignored here:
        Set controls note display only. The interval ring remains controlled by
        Degrees / Intervals / Steps.
      */
      if(state.enharmonicSpelling && Array.isArray(spelled) && spelled[0] && spelled[0] !== 'Spelling unavailable'){
        const rels = Array.from(selected).sort((a,b)=>a-b);
        const selectedLabels = renderIntervalDisplay(spelled, rels);
        rels.forEach((iv, idx)=>{
          const ringLabel = String(selectedLabels[idx]) === 'Tt' ? 'Tritone' : selectedLabels[idx];
          selectedLabelMap.set(((iv % 12) + 12) % 12, ringLabel);
        });
      }

      labels.forEach(label=>{
        const step = ((parseInt(label.dataset.idx, 10) || 0) % 12 + 12) % 12;
        const mode = state.intervalDisplayMode || 'degrees';

        let text;
        if(mode === 'steps'){
          text = String(step);

        } else if(mode === 'degrees'){
          // Degree mode: Root is always the anchor label, even if selectedLabelMap says "1".
          if(step === 0){
            text = 'Root';

          } else if(selectedLabelMap.has(step)){
            text = String(selectedLabelMap.get(step));

          } else if(step === 6){
            /*
              Tritone context:
              If the tritone is a selected scale tone, use the same contextual fallback
              as the spelling panel even when Enharmonic is off:
                - 4th scale position or earlier: #4
                - 5th scale position or later: b5
              If it is not a selected scale tone, call it Tritone.
            */
            const rels = Array.from(selected).sort((a,b)=>a-b);
            const tritoneIdx = rels.indexOf(6);
            const scalePosition = tritoneIdx + 1;

            if(scalePosition === 4){
              text = '#4';
            } else if(scalePosition === 5){
              text = 'b5';
            } else {
              text = 'Tritone';
            }

          } else {
            text = intervalRingDegreeLabel(step);
          }

        } else if(mode === 'intervals'){
          if(selectedLabelMap.has(step)){
            text = String(selectedLabelMap.get(step));

          } else if(step === 6){
            /*
              Tritone context:
              If selected, use +4/o5 by scale-degree position even when Enharmonic is off.
              If unselected, use the neutral concept label.
            */
            const rels = Array.from(selected).sort((a,b)=>a-b);
            const tritoneIdx = rels.indexOf(6);
            const scalePosition = tritoneIdx + 1;

            if(scalePosition === 4){
              text = '+4';
            } else if(scalePosition === 5){
              text = 'o5';
            } else {
              text = 'Tritone';
            }

          } else {
            text = intervalRingIntervalLabel(step);
          }

        } else {
          text = intervalRingDegreeLabel(step);
        }

        label.textContent = text;

        // Longer split labels need to shrink to keep the ring clean.
        const len = String(text).length;
        const fontSize =
          len <= 2 ? '15px' :
          len <= 4 ? '12px' :
          len <= 6 ? '10px' :
          '8.5px';

        label.setAttribute('font-size', fontSize);
      });
    } catch(err) {
      console.warn('[ModeWheel] interval ring label sync skipped:', err);
    }
  }

  function updateScaleInfoPanel(){
    if(!sipPanel || !sipTitle) return;

    const fam = MODE_FAMILIES[activeFamilyKey];
    if(!fam) return;

    // Use the same mode index the wheel + mode tiles use.
    const modeIdx = activeModeIndex;

    const modeName = (fam.names && Array.isArray(fam.names) && fam.names[modeIdx])
      ? fam.names[modeIdx]
      : `Mode ${modeIdx+1}`;

    const keyName = NOTES[state.rootIndex] || 'C';

    const setArr = Array.from(new Set(fam.sets[modeIdx] || [])).sort((a,b)=>a-b);

    const enharmonicAvailable = canUseEnharmonicSpelling(setArr);
    const enharmonicActive = !!state.enharmonicSpelling && enharmonicAvailable;
    if(sipSpellEnharmonic){
      sipSpellEnharmonic.disabled = !enharmonicAvailable;
      sipSpellEnharmonic.classList.toggle('active', enharmonicActive);
      sipSpellEnharmonic.classList.toggle('disabled', !enharmonicAvailable);
      sipSpellEnharmonic.setAttribute('aria-pressed', enharmonicActive ? 'true' : 'false');
      sipSpellEnharmonic.textContent = 'Enharmonic';
      sipSpellEnharmonic.title = enharmonicAvailable
        ? 'Toggle strict 7-letter enharmonic spelling.'
        : 'Enharmonic spelling is available only for 7-note scales without gaps larger than an augmented second.';
    }

    updateSpellingControlButtons();

    const spelled = spellNotesForSet(state.rootIndex, setArr);
    const displayKeyName = (!state.spellAsSet && spelled && spelled[0] && spelled[0] !== 'Spelling unavailable')
      ? spelled[0]
      : keyName;
    updateSipTitleControls(displayKeyName, modeName);

    if(sipSpell){
      if(state.spellAsSet){
        sipSpell.textContent = renderFixedSetNotation(state.rootIndex, setArr).join(' ');
      }else{
        sipSpell.textContent = spelled.join(' ');
      }
    }

    if(sipIntervalDisplay){
      sipIntervalDisplay.textContent = renderIntervalDisplay(spelled, setArr).join(' ');
    }
    updateIntervalControlButtons();

    const famSet = fam.sets[0] || setArr;
    const counts = intervalClassHistogram(famSet);
    renderHistogram(counts);

    // Keep desktop mode tile roots aligned with the current spelling logic.
    if (typeof updateModeTileDesktopLabels === 'function') {
      updateModeTileDesktopLabels(getSelectedIntervals());
    }

    // Safely sync the note-wheel labels and interval ring to the current spelling settings.
    if (typeof updateWheelNoteLabelsFromSpelling === 'function') {
      updateWheelNoteLabelsFromSpelling();
    }
    if (typeof updateIntervalRingLabels === 'function') {
      updateIntervalRingLabels();
    }
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
      indexInput.value=`${famObj.noteCount}.${famObj.familyIndex}.${state.rootIndex}.${index+1}`;
      updateModeDisplay();
    }else{
      // Unknown / custom: show derived count, keep family label
      familyDisplay.textContent='Custom';
      notesDisplay.textContent=Array.from(sel).length;
      indexInput.value=`${Array.from(sel).length}.0.${state.rootIndex}.1`;
      updateModeDisplay();
    }

    updateUrlFromIndex();
  }

  

  // --- Key selector handlers (rotates note wheel) ---
  function setKeyRootIndex(newRootIndex){
    state.rootIndex = ((newRootIndex % 12) + 12) % 12;
    state.noteRot = -state.rootIndex * 30;
    notesRot.setAttribute('transform', `rotate(${state.noteRot})`);
    updateNoteLabelOrientation();
    updateKeyDisplay();
    if (typeof updateWheelNoteLabelsFromSpelling === 'function') {
      updateWheelNoteLabelsFromSpelling();
    }

    // keep index panel synced to the currently visible mode (adds key digit)
    if(typeof reflectIndexUIFromCurrentSelection === 'function'){
      reflectIndexUIFromCurrentSelection(getSelectedIntervals());
    }
    updateScaleInfoPanel();
  }
  if (keyPrev) keyPrev.addEventListener('click', ()=> setKeyRootIndex(state.rootIndex - 1));
  if (keyNext) keyNext.addEventListener('click', ()=> setKeyRootIndex(state.rootIndex + 1));

  // --- Mode selector handlers (rotates the color spokes / changes mode) ---
  function stepMode(dir){
    const active = Array.from(baseMask).sort((a,b)=>a-b);
    if(active.length === 0) return;

    let idx = active.indexOf(state.colorStep);
    if(idx === -1) idx = 0;

    idx = (idx + dir + active.length) % active.length;
    state.colorStep = active[idx];

    state.colorRot = -state.colorStep * 30;
    colorRotGroup.setAttribute('transform', `rotate(${state.colorRot})`);
  handleRotGroup.setAttribute('transform', `rotate(${state.colorRot})`);

    updateAllVisuals();
    updateModeDisplay();
    updateScaleInfoPanel();
  }
  if (modePrev) modePrev.addEventListener('click', ()=> stepMode(-1));
  if (modeNext) modeNext.addEventListener('click', ()=> stepMode(1));

  // Initialize selector displays
  updateKeyDisplay();
  updateModeDisplay();
// Notes ± handlers
  notesMinus.addEventListener('click',()=>{
    const counts=availableNoteCounts();
    let idx=counts.indexOf(activeNoteCount);
    if(idx<=0) idx=counts.length; // wrap
    idx--;
    const newCount=counts[idx];
    const fams=familiesForCount(newCount);
    loadModeFamily(fams[0], 0);
  updateScaleInfoPanel();
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

  function applyIndexString(rawIndex){
    if(!rawIndex) return false;

    const v=String(rawIndex).trim();
    const parts=v.split('.');
    if(parts.length!==4) return false;

    const [nStr,fStr,kStr,mStr]=parts;
    const n=Number(nStr), f=Number(fStr), k=Number(kStr), m=Number(mStr);
    if(!Number.isInteger(n) || !Number.isInteger(f) || !Number.isInteger(k) || !Number.isInteger(m)) return false;

    // find family with matching (noteCount, familyIndex)
    const matchKey = Object.keys(MODE_FAMILIES).find(key=>{
      const fam=MODE_FAMILIES[key];
      return fam.noteCount===n && fam.familyIndex===f;
    });
    if(!matchKey) return false;

    const fam=MODE_FAMILIES[matchKey];
    const modeIndex=Math.min(Math.max(m-1,0), fam.sets.length-1);
    const rootIndex=((k%12)+12)%12;

    loadModeFamily(matchKey, modeIndex);
    // apply key/root note (0=C, 1=C♯/D♭, ...)
    setKeyRootIndex(rootIndex);
    return true;
  }

  // Index input handler (format n.f.k.m)
  indexInput.addEventListener('change',()=>{
    if(applyIndexString(indexInput.value)){
      updateUrlFromIndex();
    }
  });


  if(resetWheel){
    resetWheel.addEventListener('click',()=>{
      const defaultIndex = '7.1.0.1'; // C Major / C Ionian

      if(applyIndexString(defaultIndex)){
        // Keep the wheel reset, but clear the share-state URL back to the plain page.
        const url = new URL(window.location.href);
        url.searchParams.delete('index');
        window.history.replaceState({}, '', url.pathname + url.search + url.hash);
      }
    });
  }

  // ---------- Initial render ----------
  // Start on whatever the current active family should be (Diatonic Ionian)
  loadModeFamily(activeFamilyKey, 0);

  // If a shared link includes ?index=..., load that exact wheel state after the default render.
  const urlIndex = new URLSearchParams(window.location.search).get('index');
  if(urlIndex){
    applyIndexString(urlIndex);
  }

  // From this point forward, wheel changes keep the URL shareable without reloading the page.
  urlIndexSyncEnabled = true;
  updateUrlFromIndex();

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


/* === Desktop mode tile width sync ===
   Measures the longest visible mode-name button and applies that width to all mode-name buttons.
   Keeps colored tile wrappers intact while preserving aligned equal button widths. */
(function setupModeTileNameWidthSync(){
  function syncModeTileNameWidth(){
    const keyArea = document.getElementById("key-area");
    if (!keyArea) return;

    const names = Array.from(keyArea.querySelectorAll(".mode-tile .key-name"));
    if (!names.length) return;

    // Reset first so newly shorter/longer mode families measure naturally.
    keyArea.style.removeProperty("--modeNameButtonW");
    names.forEach(btn => {
      btn.style.removeProperty("width");
      btn.style.removeProperty("minWidth");
      btn.style.removeProperty("maxWidth");
    });

    let max = 0;
    names.forEach(btn => {
      const rect = btn.getBoundingClientRect();
      const scroll = btn.scrollWidth || 0;
      max = Math.max(max, rect.width, scroll);
    });

    // Add a little safety room so long names do not feel clipped.
    const padded = Math.ceil(max + 4);
    keyArea.style.setProperty("--modeNameButtonW", `${padded}px`);
  }

  function scheduleSync(){
    requestAnimationFrame(() => {
      syncModeTileNameWidth();
      requestAnimationFrame(syncModeTileNameWidth);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleSync);
  } else {
    scheduleSync();
  }

  window.addEventListener("resize", scheduleSync);

  const keyRows = document.getElementById("key-rows");
  if (keyRows && "MutationObserver" in window) {
    const observer = new MutationObserver(scheduleSync);
    observer.observe(keyRows, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class", "style"]
    });
  }

  // Expose a hook in case existing wheel code wants to call it after rerendering.
  window.syncModeTileNameWidth = scheduleSync;
})();


/* === Number of Notes Bubble: isolated proof-of-concept ===
   Adds only the new desktop left-side Number of Notes bubble.
   Does NOT hide/remove old controls yet. */
(function setupNumberOfNotesBubble(){
  function getSelectedCountSafe(){
    try {
      const sel = typeof getSelectedIntervals === "function" ? getSelectedIntervals() : null;
      if (sel && typeof sel.size === "number") return sel.size;
    } catch (e) {}
    const oldDisplay = document.getElementById("notes-display");
    return oldDisplay ? oldDisplay.textContent.trim() : "7";
  }

  function updateNumberBubble(){
    const display = document.getElementById("notes-display-inline");
    if (display) display.textContent = String(getSelectedCountSafe());
  }

  function setup(){
    const panel = document.getElementById("scale-info-panel");
    const topRow = document.getElementById("mw-toprow");
    if (!panel || !topRow) return;

    let stack = document.getElementById("left-control-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.id = "left-control-stack";
      topRow.appendChild(stack);
    }

    // Move the spelling drawer into the stack only once.
    if (panel.parentElement !== stack) {
      stack.insertBefore(panel, stack.firstChild);
    }

    if (!document.getElementById("note-count-panel")) {
      const notesPanel = document.createElement("section");
      notesPanel.id = "note-count-panel";
      notesPanel.className = "left-menu-bubble note-count-bubble";
      notesPanel.innerHTML = `
        <div class="left-bubble-label">Number of Notes</div>
        <div class="left-dial-row">
          <button id="notes-minus-inline" class="left-dial-arrow" type="button" aria-label="Fewer notes">‹</button>
          <span id="notes-display-inline" class="left-dial-value">7</span>
          <button id="notes-plus-inline" class="left-dial-arrow" type="button" aria-label="More notes">›</button>
        </div>
      `;
      stack.appendChild(notesPanel);

      notesPanel.querySelector("#notes-minus-inline")?.addEventListener("click", () => {
        document.getElementById("notes-minus")?.click();
        requestAnimationFrame(updateNumberBubble);
      });

      notesPanel.querySelector("#notes-plus-inline")?.addEventListener("click", () => {
        document.getElementById("notes-plus")?.click();
        requestAnimationFrame(updateNumberBubble);
      });
    }

    updateNumberBubble();

    const oldNotesDisplay = document.getElementById("notes-display");
    if (oldNotesDisplay && "MutationObserver" in window) {
      const observer = new MutationObserver(updateNumberBubble);
      observer.observe(oldNotesDisplay, { childList: true, characterData: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }

  window.addEventListener("resize", updateNumberBubble);
})();


/* === Mode Family Bubble: isolated addition ===
   Adds only the new desktop left-side Mode Family bubble.
   Does NOT hide/remove old controls yet. */
(function setupModeFamilyBubble(){
  function getFamilyNameSafe(){
    const inline = document.getElementById("family-display-inline");
    const oldDisplay = document.getElementById("family-display");

    // Prefer existing visible old control text as the source of truth.
    if (oldDisplay && oldDisplay.textContent.trim()) {
      return oldDisplay.textContent.trim();
    }

    try {
      const detected = typeof detectModeFamilyAndIndex === "function"
        ? detectModeFamilyAndIndex(getSelectedIntervals())
        : null;
      if (detected && detected.family) return detected.family;
    } catch (e) {}

    return inline ? inline.textContent.trim() : "Diatonic";
  }

  function updateFamilyBubble(){
    const display = document.getElementById("family-display-inline");
    if (display) display.textContent = getFamilyNameSafe();
  }

  function setup(){
    const topRow = document.getElementById("mw-toprow");
    if (!topRow) return;

    let stack = document.getElementById("left-control-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.id = "left-control-stack";
      topRow.appendChild(stack);
    }

    if (!document.getElementById("family-panel")) {
      const familyPanel = document.createElement("section");
      familyPanel.id = "family-panel";
      familyPanel.className = "left-menu-bubble family-bubble";
      familyPanel.innerHTML = `
        <div class="family-panel-header">
          <div class="left-bubble-label">Mode Family</div>
          <button id="family-panel-toggle" type="button" aria-expanded="false" aria-controls="family-panel-body">+</button>
        </div>

        <div class="left-dial-row family-dial-row">
          <button id="family-prev-inline" class="left-dial-arrow" type="button" aria-label="Previous mode family">‹</button>
          <span id="family-display-inline" class="left-dial-value family-value">Diatonic</span>
          <button id="family-next-inline" class="left-dial-arrow" type="button" aria-label="Next mode family">›</button>
        </div>

        <div id="family-panel-body" hidden>
          <div class="family-hist-label">Interval-Class Histogram</div>
          <div id="family-hist-target"></div>
        </div>
      `;

      const notesPanel = document.getElementById("note-count-panel");
      if (notesPanel && notesPanel.parentElement === stack) {
        notesPanel.insertAdjacentElement("afterend", familyPanel);
      } else {
        stack.appendChild(familyPanel);
      }

      familyPanel.querySelector("#family-prev-inline")?.addEventListener("click", () => {
        document.getElementById("family-prev")?.click();
        requestAnimationFrame(updateFamilyBubble);
      });

      familyPanel.querySelector("#family-next-inline")?.addEventListener("click", () => {
        document.getElementById("family-next")?.click();
        requestAnimationFrame(updateFamilyBubble);
      });

      const toggle = familyPanel.querySelector("#family-panel-toggle");
      const body = familyPanel.querySelector("#family-panel-body");
      toggle?.addEventListener("click", () => {
        const shouldOpen = body.hasAttribute("hidden");
        body.toggleAttribute("hidden", !shouldOpen);
        toggle.textContent = shouldOpen ? "−" : "+";
        toggle.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
      });
    }

    updateFamilyBubble();

    const oldFamilyDisplay = document.getElementById("family-display");
    if (oldFamilyDisplay && "MutationObserver" in window) {
      const observer = new MutationObserver(updateFamilyBubble);
      observer.observe(oldFamilyDisplay, { childList: true, characterData: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }

  window.addEventListener("resize", updateFamilyBubble);
})();


/* === Move Histogram into Mode Family Drawer === */
(function moveHistogramToFamilyDrawer(){
  function moveHistogram(){
    const target = document.getElementById("family-hist-target");
    const hist = document.getElementById("sip-hist");
    if (!target || !hist) return;

    if (hist.parentElement !== target) {
      target.appendChild(hist);
    }
  }

  function setup(){
    moveHistogram();

    const sipBody = document.getElementById("sip-body");
    if (sipBody && "MutationObserver" in window) {
      const observer = new MutationObserver(moveHistogram);
      observer.observe(sipBody, { childList: true, subtree: true });
    }

    const familyBody = document.getElementById("family-panel-body");
    if (familyBody && "MutationObserver" in window) {
      const observer = new MutationObserver(moveHistogram);
      observer.observe(familyBody, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }

  window.addEventListener("resize", moveHistogram);
})();


/* === Index / Reset Bubble: isolated addition ===
   Moves the existing index input + reset button into a desktop left-side bubble.
   Does NOT hide old control groups yet, though moving the actual elements will remove
   them visually from the old row because DOM nodes can only live in one place. */
(function setupIndexResetBubble(){
  function setup(){
    const topRow = document.getElementById("mw-toprow");
    if (!topRow) return;

    let stack = document.getElementById("left-control-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.id = "left-control-stack";
      topRow.appendChild(stack);
    }

    if (!document.getElementById("index-panel")) {
      const indexPanel = document.createElement("section");
      indexPanel.id = "index-panel";
      indexPanel.className = "left-menu-bubble index-bubble";
      indexPanel.innerHTML = `
        <div class="left-bubble-label">Index</div>
        <div id="index-inline-slot" class="index-inline-row"></div>
      `;
      stack.appendChild(indexPanel);
    }

    const slot = document.getElementById("index-inline-slot");
    const input = document.getElementById("index-input");
    const reset = document.getElementById("reset-wheel");

    if (slot && input && input.parentElement !== slot) {
      slot.appendChild(input);
    }

    if (slot && reset && reset.parentElement !== slot) {
      slot.appendChild(reset);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }
})();
/* =========================================================
   LEFT STACK INSTRUCTIONS INTEGRATION V7
   ---------------------------------------------------------
   Move #mw-instructions into #left-control-stack so it participates
   in the same vertical centering as the control bubbles.
   ========================================================= */
(function integrateInstructionsIntoLeftStack(){
  function setup(){
    const topRow = document.getElementById("mw-toprow");
    if (!topRow) return;

    let stack = document.getElementById("left-control-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.id = "left-control-stack";
      topRow.appendChild(stack);
    }

    let instructions = document.getElementById("mw-instructions");
    if (!instructions) {
      instructions = document.createElement("div");
      instructions.id = "mw-instructions";
      instructions.innerHTML = "<div>Rotate wheel to explore</div><div>Tap modes to hear</div>";
    }

    if (instructions.parentElement !== stack) {
      stack.insertBefore(instructions, stack.firstChild);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }

  window.addEventListener("load", setup);
  window.addEventListener("resize", setup);
})();


/* === MOBILE PORTRAIT: options gear + spelling popup v3 === */
function ensureMobileOptionsButton() {
  const indexBubble = document.querySelector('.index-bubble');
  const indexRow = indexBubble ? indexBubble.querySelector('.index-inline-row') : null;
  const panel = document.getElementById('scale-info-panel');
  const leftControlStack = document.getElementById('left-control-stack');

  if (!indexRow || !panel) return;

  let optionsButton = document.getElementById('mobile-options-button');
  if (!optionsButton) {
    optionsButton = document.createElement('button');
    optionsButton.id = 'mobile-options-button';
    optionsButton.type = 'button';
    optionsButton.setAttribute('aria-label', 'Options');
    optionsButton.setAttribute('aria-expanded', 'false');
    optionsButton.textContent = '⚙';
  }
  if (optionsButton.parentElement !== indexRow) indexRow.appendChild(optionsButton);

  let closeButton = document.getElementById('mobile-options-close');
  if (!closeButton) {
    closeButton = document.createElement('button');
    closeButton.id = 'mobile-options-close';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Close options');
    closeButton.textContent = '×';
  }
  if (closeButton.parentElement !== panel) panel.insertBefore(closeButton, panel.firstChild);

  function movePanelToBodyForMobile() {
    if (window.innerWidth < 900 && panel.parentElement !== document.body) {
      document.body.appendChild(panel);
    }
  }

  function restorePanelForDesktop() {
    if (window.innerWidth >= 900 && leftControlStack && panel.parentElement !== leftControlStack) {
      leftControlStack.insertBefore(panel, leftControlStack.firstChild);
    }
  }

  function openMobileOptions() {
    if (window.innerWidth >= 900) return;
    movePanelToBodyForMobile();

    const sipBody = document.getElementById('sip-body');
    const sipToggle = document.getElementById('sip-toggle');
    if (sipBody) sipBody.removeAttribute('hidden');
    if (sipToggle) {
      sipToggle.textContent = '−';
      sipToggle.setAttribute('aria-expanded', 'true');
    }

    document.body.classList.add('mobile-options-open');
    optionsButton.setAttribute('aria-expanded', 'true');
  }

  function closeMobileOptions() {
    document.body.classList.remove('mobile-options-open');
    optionsButton.setAttribute('aria-expanded', 'false');
  }

  if (!optionsButton.dataset.mobileOptionsWired) {
    optionsButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      document.body.classList.contains('mobile-options-open') ? closeMobileOptions() : openMobileOptions();
    });
    optionsButton.dataset.mobileOptionsWired = '1';
  }

  if (!closeButton.dataset.mobileOptionsWired) {
    closeButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeMobileOptions();
    });
    closeButton.dataset.mobileOptionsWired = '1';
  }

  if (!document.body.dataset.mobileOptionsDismissWired) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileOptions();
    });

    document.addEventListener('click', (e) => {
      if (!document.body.classList.contains('mobile-options-open')) return;
      if (panel.contains(e.target) || optionsButton.contains(e.target)) return;
      closeMobileOptions();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 900) {
        closeMobileOptions();
        restorePanelForDesktop();
      } else {
        setTimeout(ensureMobileOptionsButton, 0);
      }
    });

    document.body.dataset.mobileOptionsDismissWired = '1';
  }
}

ensureMobileOptionsButton();
setTimeout(ensureMobileOptionsButton, 0);
window.addEventListener('load', ensureMobileOptionsButton);


/* === MOBILE PORTRAIT: place index/reset below mode controls === */
function placeIndexForMobile() {
  const modeControls = document.getElementById('mode-controls');
  const indexBubble = document.querySelector('.index-bubble');
  const leftControlStack = document.getElementById('left-control-stack');

  if (!modeControls || !indexBubble) return;

  if (window.innerWidth < 900) {
    modeControls.insertAdjacentElement('afterend', indexBubble);
    indexBubble.style.display = 'block';
    indexBubble.style.visibility = 'visible';
    indexBubble.style.opacity = '1';
    indexBubble.style.pointerEvents = 'auto';
  } else {
    if (leftControlStack && indexBubble.parentElement !== leftControlStack) {
      leftControlStack.appendChild(indexBubble);
    }
    indexBubble.style.display = '';
    indexBubble.style.visibility = '';
    indexBubble.style.opacity = '';
    indexBubble.style.pointerEvents = '';
  }
}

placeIndexForMobile();
window.addEventListener('resize', placeIndexForMobile);




/* === MOBILE ROW FINALIZER: restore index/reset/options and click === */
(function mobileRowFinalizer() {
  function placeIndexForMobileFinal() {
    const modeControls = document.getElementById('mode-controls');
    const indexBubble = document.querySelector('.index-bubble');
    const leftControlStack = document.getElementById('left-control-stack');

    if (!modeControls || !indexBubble) return;

    if (window.innerWidth < 900) {
      if (modeControls.nextElementSibling !== indexBubble) {
        modeControls.insertAdjacentElement('afterend', indexBubble);
      }
      indexBubble.style.display = 'block';
      indexBubble.style.visibility = 'visible';
      indexBubble.style.opacity = '1';
      indexBubble.style.pointerEvents = 'auto';
    } else if (leftControlStack && indexBubble.parentElement !== leftControlStack) {
      leftControlStack.appendChild(indexBubble);
      indexBubble.style.display = '';
      indexBubble.style.visibility = '';
      indexBubble.style.opacity = '';
      indexBubble.style.pointerEvents = '';
    }
  }

  function ensureGearFinal() {
    const indexRow = document.querySelector('.index-bubble .index-inline-row');
    const panel = document.getElementById('scale-info-panel');
    if (!indexRow || !panel) return;

    let gear = document.getElementById('mobile-options-button');
    if (!gear) {
      gear = document.createElement('button');
      gear.id = 'mobile-options-button';
      gear.type = 'button';
      gear.setAttribute('aria-label', 'Options');
      gear.textContent = '⚙';
    }
    if (gear.parentElement !== indexRow) indexRow.appendChild(gear);

    let close = document.getElementById('mobile-options-close');
    if (!close) {
      close = document.createElement('button');
      close.id = 'mobile-options-close';
      close.type = 'button';
      close.setAttribute('aria-label', 'Close options');
      close.textContent = '×';
    }
    if (close.parentElement !== panel) panel.insertBefore(close, panel.firstChild);

    function open() {
      if (window.innerWidth >= 900) return;
      if (panel.parentElement !== document.body) document.body.appendChild(panel);

      const sipBody = document.getElementById('sip-body');
      const sipToggle = document.getElementById('sip-toggle');
      if (sipBody) sipBody.removeAttribute('hidden');
      if (sipToggle) {
        sipToggle.textContent = '−';
        sipToggle.setAttribute('aria-expanded', 'true');
      }

      document.body.classList.add('mobile-options-open');
      gear.setAttribute('aria-expanded', 'true');
    }

    function closePopup() {
      document.body.classList.remove('mobile-options-open');
      gear.setAttribute('aria-expanded', 'false');
    }

    if (!gear.dataset.finalWired) {
      gear.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.body.classList.contains('mobile-options-open') ? closePopup() : open();
      });
      gear.dataset.finalWired = '1';
    }

    if (!close.dataset.finalWired) {
      close.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closePopup();
      });
      close.dataset.finalWired = '1';
    }

    if (!document.body.dataset.finalOptionsDismissWired) {
      document.addEventListener('click', (e) => {
        if (!document.body.classList.contains('mobile-options-open')) return;
        const currentPanel = document.getElementById('scale-info-panel');
        const currentGear = document.getElementById('mobile-options-button');
        if ((currentPanel && currentPanel.contains(e.target)) || (currentGear && currentGear.contains(e.target))) return;
        closePopup();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePopup();
      });

      document.body.dataset.finalOptionsDismissWired = '1';
    }
  }

  function runFinalizer() {
    placeIndexForMobileFinal();
    ensureGearFinal();
  }

  runFinalizer();
  setTimeout(runFinalizer, 0);
  setTimeout(runFinalizer, 100);
  window.addEventListener('load', runFinalizer);
  window.addEventListener('resize', runFinalizer);
})();


/* === MOBILE OPTIONS: final delegated click opener === */
/*
  Final mobile-only repair:
  The row and gear are already visible. This delegated capture-phase handler
  makes the existing gear open the spelling/options popup reliably, even if
  earlier handlers were attached before the button moved or got replaced.
*/
(function mobileOptionsFinalDelegatedClick() {
  function getPanel() {
    return document.getElementById('scale-info-panel');
  }

  function getGear() {
    return document.getElementById('mobile-options-button');
  }

  function ensureCloseButton(panel) {
    let close = document.getElementById('mobile-options-close');
    if (!close) {
      close = document.createElement('button');
      close.id = 'mobile-options-close';
      close.type = 'button';
      close.setAttribute('aria-label', 'Close options');
      close.textContent = '×';
    }
    if (panel && close.parentElement !== panel) {
      panel.insertBefore(close, panel.firstChild);
    }
    return close;
  }

  function openMobileOptionsPanel() {
    if (window.innerWidth >= 900) return;

    const panel = getPanel();
    const gear = getGear();
    if (!panel) return;

    // Move out of hidden desktop stacks before showing as a fixed mobile popup.
    if (panel.parentElement !== document.body) {
      document.body.appendChild(panel);
    }

    ensureCloseButton(panel);

    const sipBody = document.getElementById('sip-body');
    const sipToggle = document.getElementById('sip-toggle');
    if (sipBody) sipBody.removeAttribute('hidden');
    if (sipToggle) {
      sipToggle.textContent = '−';
      sipToggle.setAttribute('aria-expanded', 'true');
    }

    document.body.classList.add('mobile-options-open');
    if (gear) gear.setAttribute('aria-expanded', 'true');
  }

  function closeMobileOptionsPanel() {
    const gear = getGear();
    document.body.classList.remove('mobile-options-open');
    if (gear) gear.setAttribute('aria-expanded', 'false');
  }

  document.addEventListener('click', function(e) {
    const gear = e.target && e.target.closest ? e.target.closest('#mobile-options-button') : null;
    if (!gear) return;

    e.preventDefault();
    e.stopPropagation();

    if (document.body.classList.contains('mobile-options-open')) {
      closeMobileOptionsPanel();
    } else {
      openMobileOptionsPanel();
    }
  }, true);

  document.addEventListener('click', function(e) {
    const close = e.target && e.target.closest ? e.target.closest('#mobile-options-close') : null;
    if (!close) return;

    e.preventDefault();
    e.stopPropagation();
    closeMobileOptionsPanel();
  }, true);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeMobileOptionsPanel();
  });

  window.addEventListener('resize', function() {
    if (window.innerWidth >= 900) {
      closeMobileOptionsPanel();
      const panel = getPanel();
      const stack = document.getElementById('left-control-stack');
      if (panel && stack && panel.parentElement !== stack) {
        stack.insertBefore(panel, stack.firstChild);
      }
    }
  });
})();


/* === MOBILE OPTIONS CLEANUP FINAL: remove legacy popup contents after open === */
/*
  This intentionally does not touch the gear button or its click handler.
  It only cleans contents inside #scale-info-panel after the mobile popup opens.
*/
(function mobileOptionsPopupContentCleanupFinal() {
  function cleanPanel() {
    if (!document.body.classList.contains('mobile-options-open')) return;

    const panel = document.getElementById('scale-info-panel');
    if (!panel) return;

    // Hide old key/mode title controls if present.
    [
      '#sip-key-control',
      '#sip-mode-control',
      '.sip-title-control',
      '.sip-title-arrow',
      '.sip-title-value',
      '.sip-key-mode-row',
      '.sip-key-row',
      '.sip-mode-row'
    ].forEach(selector => {
      panel.querySelectorAll(selector).forEach(el => {
        el.style.display = 'none';
        el.style.visibility = 'hidden';
        el.style.pointerEvents = 'none';
      });
    });

    // Hide histogram material by structure and by exact visible label text.
    [
      '#sip-hist',
      '.sip-hist'
    ].forEach(selector => {
      panel.querySelectorAll(selector).forEach(el => {
        el.style.display = 'none';
      });
    });

    panel.querySelectorAll('*').forEach(el => {
      const text = (el.textContent || '').trim().toLowerCase();
      if (text === 'interval-class histogram' || text === 'interval class histogram') {
        el.style.display = 'none';
        const parent = el.closest('.sip-section') || el.parentElement;
        if (parent && parent !== panel) parent.style.display = 'none';
      }
    });
  }

  // Clean immediately after any click that opens the menu.
  document.addEventListener('click', () => {
    setTimeout(cleanPanel, 0);
    setTimeout(cleanPanel, 60);
  }, true);

  window.addEventListener('load', cleanPanel);
})();

