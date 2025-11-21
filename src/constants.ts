// PICO-8 Palette
export const COLORS = [
  '#000000', // 0: Black
  '#1D2B53', // 1: Dark Blue
  '#7E2553', // 2: Dark Purple
  '#008751', // 3: Dark Green
  '#AB5236', // 4: Brown
  '#5F574F', // 5: Dark Gray
  '#C2C3C7', // 6: Light Gray
  '#FFF1E8', // 7: White
  '#FF004D', // 8: Red
  '#FFA300', // 9: Orange
  '#FFEC27', // 10: Yellow
  '#00E436', // 11: Green
  '#29ADFF', // 12: Blue
  '#83769C', // 13: Indigo
  '#FF77A8', // 14: Pink
  '#FFCCAA', // 15: Peach
];

export const INITIAL_CODE = `
// REACT-8: Star Catcher
// Arrow Keys: Move
// Collect yellow stars!

let p = {x:60, y:60, spd:2};
let stars = [];
let parts = []; // particles
let score = 0;
let cam = {x:0, y:0, shake:0};

function _init() {
  // Spawn initial stars
  for(let i=0; i<5; i++) spawn_star();
}

function spawn_star() {
  stars.push({
    x: rnd(120), 
    y: rnd(120), 
    c: 10 // Yellow
  });
}

function _update() {
  // Player Movement
  if (btn(0)) p.x -= p.spd;
  if (btn(1)) p.x += p.spd;
  if (btn(2)) p.y -= p.spd;
  if (btn(3)) p.y += p.spd;

  // Boundary Checks
  if (p.x < 0) p.x = 0;
  if (p.x > 120) p.x = 120;
  if (p.y < 0) p.y = 0;
  if (p.y > 120) p.y = 120;

  // Screen Shake Logic
  if (cam.shake > 0) {
    cam.shake -= 0.5;
    let sx = rnd(cam.shake) - cam.shake/2;
    let sy = rnd(cam.shake) - cam.shake/2;
    camera(sx, sy);
  } else {
    camera(0,0);
  }

  // Collision with Stars
  for(let i=stars.length-1; i>=0; i--) {
    let s = stars[i];
    // Simple distance check
    if (Math.abs(p.x - s.x) < 8 && Math.abs(p.y - s.y) < 8) {
      score += 10;
      stars.splice(i, 1);
      spawn_star();
      cam.shake = 6; // Screen shake on collect
      
      // Spawn Particles
      for(let j=0; j<8; j++) {
        parts.push({
          x: s.x+4, y: s.y+4, 
          dx: rnd(2)-1, dy: rnd(2)-1, 
          age: 15 + rnd(10), 
          c: (rnd(10)>5) ? 7 : 10
        });
      }
    }
  }

  // Update Particles
  for(let i=parts.length-1; i>=0; i--) {
    let pt = parts[i];
    pt.x += pt.dx;
    pt.y += pt.dy;
    pt.age--;
    if (pt.age <= 0) parts.splice(i, 1);
  }
}

function _draw() {
  cls(1); // Dark Blue BG
  
  // Draw Stars
  for(let s of stars) {
    circfill(s.x+4, s.y+4, 2, s.c);
    // Twinkle effect
    if (rnd(20)>18) pset(s.x+4, s.y+4, 7);
  }

  // Draw Particles
  for(let pt of parts) {
    // Randomly alternate color for sparkle
    let c = (pt.age % 4 < 2) ? pt.c : 7;
    pset(pt.x, pt.y, c);
  }
  
  // Draw Player Sprite
  spr(0, p.x, p.y);
  
  // Draw HUD (Reset camera first)
  let c_x = cam.x; 
  let c_y = cam.y;
  camera(0,0);
  
  rect(0,0, 128, 10, 0);
  print("SCORE: " + score, 2, 2, 7);
  
  // Restore camera for next frame logic if needed
  camera(c_x, c_y);
}
`.trim();

export const INITIAL_SPRITE = new Array(64).fill(0).map((_, i) => {
  // A cute little alien/character
  const x = i % 8;
  const y = Math.floor(i / 8);
  
  // Body (Green 11)
  if (y >= 2 && y <= 6 && x >= 1 && x <= 6) {
    // Eyes (Black 0)
    if (y === 3 && (x === 2 || x === 5)) return 0;
    // Mouth (White 7)
    if (y === 5 && x >= 3 && x <= 4) return 7;
    return 11; 
  }
  // Antenna (Green 11)
  if (y === 1 && (x === 2 || x === 5)) return 11;
  // Feet (Red 8)
  if (y === 7 && (x === 1 || x === 6)) return 8;
  
  return 0; // Transparent
});