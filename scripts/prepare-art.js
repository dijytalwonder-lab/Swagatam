// Turns the chosen game art into small WebP files in www/img/art (trimmed, max 900px, transparency kept).
// Re-run after changing the list:  node scripts/prepare-art.js
// The sources live outside this project (the user's other games); only the optimised copies are shipped.
//
// Only artwork with REAL transparency is used. Several source PNGs (lanterns, temples, rangoli, star, coin, trays...)
// have a checkerboard painted into the pixels instead of an alpha channel; those look like boxes on a poster, so they are left out.
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const D = 'C:/New game/Diwali Delivery Dash/Assets/';
const M = 'C:/New game/Dashavatara/CHAPTER 1 MATSYA/Assets/';
const B = 'C:/New game/BunnysMagicalFishing/public/images/';   // same files as BunnysMagicalFishing.zip > images
const K = 'C:/Users/divya/OneDrive/Documents/LittleKrishna-GaneshEvent/src/assets/';

const ART = [
  // name,        source file,                       max side
  ['diya',        D + 'golden_diya_bonus.png',       900],   // Diwali
  ['pot-gold',    M + 'Kurma/amritaPot.png',         900],   // Dhanteras
  ['treasure',    M + 'Kurma/treasure.png',          900],   // Akshaya Tritiya
  ['marigold',    D + 'flower_collectible.png',      900],   // Vasant Panchami
  ['ganesha',     K + 'ganesh/ganesha_idol.png',     900],   // Ganesh Chaturthi
  ['krishna',     K + 'characters/Krishna_hero.png', 900],   // Janmashtami
  ['matsya',      M + 'Matsya/MATSYA.png',           900],   // Matsya Jayanti
  ['kurma',       M + 'Kurma/kurma.png',             900],   // Kurma Jayanti
  ['bunny',       B + 'bunny/bunny_idle.png',        900],   // Easter
  ['fairy',       B + 'fairy/fairy_idle.png',        900],   // Children's Day
  ['tree',        B + 'tree/magical_tree.png',       900],   // Christmas
  // hanging decorations drawn at the top corners of some posters
  ['garland',     K + 'ganesh/modak_prize.png',      700],   // marigold string: Diwali family, Ganesh Chaturthi
  ['handi',       K + 'items/butter_pot.png',        700],   // dahi handi: Janmashtami
];

(async () => {
  const out = path.join(__dirname, '..', 'www', 'img', 'art');
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  let total = 0;
  for (const [name, src, max] of ART) {
    if (!fs.existsSync(src)) { console.log('MISSING', name, src); continue; }
    const buf = await sharp(src).trim({ threshold: 8 }).resize(max, max, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 86, alphaQuality: 92, effort: 5 }).toBuffer();
    fs.writeFileSync(path.join(out, name + '.webp'), buf);
    const m = await sharp(buf).metadata(); total += buf.length;
    console.log(name.padEnd(10), `${m.width}x${m.height}`.padEnd(10), `${(buf.length / 1024).toFixed(0)} KB`);
  }
  console.log('total', (total / 1024).toFixed(0), 'KB');
})();
