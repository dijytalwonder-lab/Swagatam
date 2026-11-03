// Slices assets/"Festive Diwali Welcome Screen.png" into the pieces the sign-in screen is built from:
//   welcome-top     garland, logo, title, tagline          (rows 0-799)
//   welcome-orn     the small leaf + diya above the card    (rows 800-909)
//   welcome-bottom  the three diyas on the rangoli          (rows 1497-end)
//   welcome-strip   a clean, softened row, stretched by CSS to fill the gap on taller phones
// The card in the middle (heading, number field, button) is real HTML so it can switch to the OTP step.
// Run from the project root:  node scripts/prepare-welcome.js
const sharp = require('sharp');
const fs = require('fs');

const SRC = 'assets/Festive Diwali Welcome Screen.png';
const OUT = 'www/img/';
const CUT = { top: [0, 800], orn: [800, 910], bottom: [1497, null], strip: [796, 800] };

(async () => {
  if (!fs.existsSync(SRC)) throw new Error(SRC + ' not found');
  const { width, height } = await sharp(SRC).metadata();
  if (width !== 887 || height !== 1774) console.warn(`expected 887x1774, got ${width}x${height} - check the CUT rows`);
  for (const [name, [from, to]] of Object.entries(CUT)) {
    const img = sharp(SRC).extract({ left: 0, top: from, width, height: (to == null ? height : to) - from });
    const file = OUT + 'welcome-' + name + (name === 'strip' ? '.png' : '.webp');
    // the strip is the background of the stretchy gap: average a few rows and soften it so no sparkle turns into a streak
    if (name === 'strip') await img.resize(width, 1, { fit: 'fill' }).blur(5).png().toFile(file); else await img.webp({ quality: 88 }).toFile(file);
    console.log(file, (fs.statSync(file).size / 1024).toFixed(0) + ' KB');
  }
})().catch((e) => { console.error(e); process.exit(1); });
