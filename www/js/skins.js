// Festival artwork "skins": a full-bleed picture (made by scripts/prepare-festivals.js from assets/festivals/) that replaces the
// built-in drawing of a template for one festival. This file says where the live text, photo and brand go on each picture.
// Coordinates are on the 1080x1920 status canvas.
//   ink / kicker / hi / wishInk   title, "Happy", Hindi line, wish colours          shadow  soft shadow under the text
//   scrim     soft darkening so the text stays readable:  {ellipse:[cx,cy,rx,ry,[r,g,b],alpha]} or {grad:{y0,y1,c:[r,g,b],a0,a1}}
//   photo     where the user's photo goes {cx,cy,r,ring,ringW,always}  (drawn only when they added one; always:true = also shows the festival emblem)
//   lay       text block + wish line when there is no photo;  layP  the same when there is a photo (defaults to lay)
//   baked     the picture already has its own "Happy ..." words, so only the photo, the brand card and the user's own line (msg) are added
//   brand     the brand footer card {x,y,w,h,bg,fg,sub,badgeBg,badgeFg,stroke,radius,hard,shadow}
//   primary   when a template slot has several pictures, the primary one takes the slot, the rest become extra designs (name:)
// A picture with no entry below gets GENERIC (dark gradient at the bottom, photo at the top) - it works, then can be tuned here.
import { FESTIVAL_ART } from './festival-art.js';

const BR = (o) => ({ x: 90, y: 1710, w: 900, h: 150, radius: 75, ...o });
const NAVY = { bg: 'rgba(6,18,72,.84)', stroke: '#d4a017', fg: '#f6e7a8', sub: 'rgba(246,231,168,.78)', badgeBg: '#d4a017', badgeFg: '#12205a' };
const DARK = { bg: 'rgba(24,4,40,.74)', stroke: '#d4a017', fg: '#f6e7a8', sub: 'rgba(246,231,168,.78)', badgeBg: '#d4a017', badgeFg: '#2b1a00' };
const BLACK = { bg: 'rgba(0,0,0,.78)', stroke: '#d4a017', fg: '#f6e7a8', sub: 'rgba(246,231,168,.78)', badgeBg: '#d4a017', badgeFg: '#2b1a00' };
const CREAM = { bg: 'rgba(255,247,222,.96)', stroke: '#c8962b', fg: '#6b3f00', sub: '#8a6a30', badgeBg: '#c8962b', badgeFg: '#fff' };
const WHITE = (fg, badgeBg, badgeFg = '#fff') => ({ bg: 'rgba(255,255,255,.95)', fg, sub: '#6b5a6e', badgeBg, badgeFg, shadow: true });
const POP = { bg: '#fff', hard: '#2a0a4a', fg: '#2a0a4a', sub: '#6b5a6e', badgeBg: '#ff2d95', badgeFg: '#fff' };
const PILL_LIGHT = { bg: 'rgba(255,255,255,.94)', fg: '#5a1a00' };
const PILL_DARK = { bg: 'rgba(20,0,40,.82)', fg: '#f6e7a8', stroke: '#d4a017' };

export const GENERIC = {
  ink: '#fff7dc', kicker: '#ffd166', hi: '#ffe9a8', wishInk: '#f4ead2', shadow: true,
  scrim: [{ grad: { y0: 1000, y1: 1400, c: [20, 4, 28], a0: 0, a1: 0.8 } }],
  photo: { cx: 540, cy: 700, r: 190, ring: '#f6d874' },
  lay: { text: { top: 1150, bottom: 1580, maxW: 900, maxSize: 180 }, wish: { bottom: 1690, maxW: 860 } },
  brand: BR(DARK),
};

const LAYOUTS = {
  // ---------------------------------------------------------------- Makar Sankranti
  'makar-sankranti-makar-sankranti-gold-frame': {
    ink: '#ffe08a', kicker: '#fff6d8', hi: '#ffe9a8', wishInk: '#f3e8c8', shadow: true,
    scrim: [{ ellipse: [540, 1020, 430, 380, [5, 15, 70], 0.62] }],
    photo: { cx: 540, cy: 665, r: 140, ring: '#f6d874' },
    lay: { text: { top: 810, bottom: 1170, maxW: 640, maxSize: 150 }, wish: { bottom: 1340, maxW: 600 } },
    brand: BR(NAVY),
  },
  'makar-sankranti-makar-sankranti-marigold-theme': {
    ink: '#8a2a0b', kicker: '#d9480f', hi: '#b3541e', wishInk: '#6b4a3a',
    photo: { cx: 538, cy: 905, r: 165, ring: '#e07b00' },
    lay: { text: { top: 900, bottom: 1450, maxW: 540, maxSize: 170 }, wish: { bottom: 1640, maxW: 460 } },
    layP: { text: { top: 1085, bottom: 1420, maxW: 540, maxSize: 150 }, wish: { bottom: 1640, maxW: 460 } },
    brand: BR({ x: 110, y: 1745, w: 860, h: 140, ...WHITE('#8a2a0b', '#ff9f1c', '#8a2a0b') }),
  },
  'makar-sankranti-makar-sankranti-royal-theme': {
    ink: '#ffe9a8', kicker: '#ffffff', hi: '#f6e7a8', wishInk: '#f5ead3', shadow: true,
    scrim: [{ grad: { y0: 1080, y1: 1420, c: [30, 6, 50], a0: 0, a1: 0.88 } }],
    photo: { cx: 215, cy: 905, r: 125, ring: '#f6d874' },
    lay: { text: { top: 1250, bottom: 1650, maxW: 900, maxSize: 190 }, wish: { bottom: 1690, maxW: 860 } },
    brand: BR(DARK),
  },
  'makar-sankranti-marigold-theme-bold-split': {
    ink: '#ffffff', kicker: '#ffd166', hi: '#ffe08a', wishInk: 'rgba(255,255,255,.92)', shadow: true,
    scrim: [{ grad: { y0: 1150, y1: 1450, c: [6, 20, 70], a0: 0, a1: 0.86 } }],
    photo: { cx: 525, cy: 918, r: 166, ring: '#ffffff', ringW: 8, always: true },
    lay: { text: { top: 1260, bottom: 1650, maxW: 900, maxSize: 180 }, wish: { bottom: 1690, maxW: 860 } },
    brand: BR({ y: 1715, ...WHITE('#0b3f7a', '#f59e0b') }),
  },
  'makar-sankranti-makar-sankranti-floral-arch-theme': {
    baked: true, photo: { cx: 540, cy: 985, r: 135, ring: '#e07b00' },
    msg: PILL_LIGHT, brand: BR({ y: 1725, h: 140, ...WHITE('#8a2a0b', '#ff9f1c', '#8a2a0b') }),
  },
  'makar-sankranti-makar-sankranti-pop-art': {
    baked: true, photo: { cx: 440, cy: 1390, r: 175, ring: '#ffffff', ringW: 16 },
    msg: { bg: '#ffffff', fg: '#2a0a4a', stroke: '#2a0a4a' }, brand: BR(POP),
  },

  // ---------------------------------------------------------------- New Year
  'new-year-new-year-marigold-theme': {
    primary: true, ink: '#ffe7a3', kicker: '#ffbf47', hi: '#ffd98a', wishInk: '#f3e6ff', shadow: true,
    photo: { cx: 538, cy: 750, r: 205, ring: '#ffb703' },
    lay: { text: { top: 650, bottom: 1130, maxW: 700, maxSize: 190 }, wish: { bottom: 1420, maxW: 680 } },
    layP: { text: { top: 1000, bottom: 1300, maxW: 700, maxSize: 150 }, wish: { bottom: 1450, maxW: 660 } },
    brand: BR({ x: 200, y: 1500, w: 680, h: 140, bg: 'rgba(20,0,30,.62)', stroke: '#ffb703', fg: '#ffe7a3', sub: 'rgba(255,231,163,.78)', badgeBg: '#ffb703', badgeFg: '#3b0a45' }),
  },
  'new-year-new-year-wishes-marigold-theme': {
    name: 'Marigold Wreath', ink: '#ffe7a3', kicker: '#ffbf47', hi: '#ffd98a', wishInk: '#f3e6ff', shadow: true,
    photo: { cx: 538, cy: 890, r: 300, ring: '#ffb703', ringW: 12 },
    lay: { text: { top: 690, bottom: 1090, maxW: 560, maxSize: 170 }, wish: { bottom: 1270, maxW: 470 } },
    layP: { text: { top: 1235, bottom: 1500, maxW: 640, maxSize: 130 }, wish: { bottom: 1690, maxW: 700 } },
    brand: BR({ y: 1720, h: 150, ...WHITE('#4a1250', '#ffb703', '#4a1250') }),
  },
  'new-year-new-year-gold-frame': {
    primary: true, ink: '#f6d27a', kicker: '#ffe9b0', hi: '#e8c872', wishInk: '#e8d9b0', shadow: true,
    photo: { cx: 538, cy: 770, r: 225, ring: '#d4a017', ringW: 14 },
    lay: { text: { top: 620, bottom: 1100, maxW: 520, maxSize: 160 }, wish: { x: 570, bottom: 1330, maxW: 430 } },
    layP: { text: { top: 1050, bottom: 1400, maxW: 520, maxSize: 140 }, wish: { x: 570, bottom: 1580, maxW: 420 } },
    brand: BR({ x: 330, w: 700, y: 1715, ...BLACK }),
  },
  'new-year-new-year-wishes-gold-frame': {
    name: 'Champagne Gold', ink: '#6b3f00', kicker: '#a8730a', hi: '#8a5a10', wishInk: '#7a5a2a',
    photo: { cx: 390, cy: 1270, r: 175, ring: '#c8962b' },
    lay: { text: { top: 520, bottom: 1020, maxW: 820, maxSize: 190 }, wish: { x: 400, bottom: 1280, maxW: 520 } },
    layP: { text: { top: 400, bottom: 820, maxW: 820, maxSize: 180 }, wish: { bottom: 1010, maxW: 760 } },
    brand: BR({ y: 1725, h: 140, x: 100, w: 880, ...CREAM }),
  },
  'new-year-ney-year-royal-theme': {
    primary: true, ink: '#f6e7a8', kicker: '#fff3c4', hi: '#f6e7a8', wishInk: '#f1e6c8', shadow: true,
    photo: { cx: 540, cy: 985, r: 140, ring: '#d4a017' },
    lay: { text: { top: 1305, bottom: 1540, maxW: 620, maxSize: 120 }, wish: { bottom: 1650, maxW: 600 } },
    brand: BR({ x: 170, y: 1735, w: 740, h: 130, ...DARK }),
  },
  'new-year-new-year-wishes-royal-theme': {
    name: 'Royal Throne', baked: true, photo: { cx: 540, cy: 1225, r: 170, ring: '#d4a017' },
    msg: PILL_DARK, brand: BR({ y: 1705, h: 150, ...DARK }),
  },
  'new-year-new-year-pop-art': {
    baked: true, photo: { cx: 590, cy: 1430, r: 170, ring: '#ffffff', ringW: 16 },
    msg: { bg: '#ffffff', fg: '#2a0a4a', stroke: '#2a0a4a' }, brand: BR(POP),
  },
  'new-year-ney-year-floral-arch-theme': {
    baked: true, photo: { cx: 520, cy: 560, r: 120, ring: '#d4a017' },
    msg: PILL_DARK, brand: BR({ x: 250, w: 580, y: 1730, h: 140, bg: 'rgba(8,20,50,.86)', stroke: '#d4a017', fg: '#f6e7a8', sub: 'rgba(246,231,168,.78)', badgeBg: '#d4a017', badgeFg: '#0a1a40' }),
  },
};

// a tuned picture starts from "nothing added" (no scrim, no photo) so only what it lists is drawn; an untuned one gets GENERIC
const BLANK = { ink: '#ffffff', kicker: '#ffd166', hi: '#ffe9a8', wishInk: '#ffffff', shadow: false, scrim: [], photo: null, lay: GENERIC.lay, brand: GENERIC.brand };

/** SKINS[festivalId] = [{ id, tpl, name?, primary?, ...layout }] in the order the pictures were found. */
export const SKINS = {};
for (const [fid, list] of Object.entries(FESTIVAL_ART)) {
  SKINS[fid] = list.map((a) => ({ ...(LAYOUTS[a.id] ? { ...BLANK, ...LAYOUTS[a.id] } : GENERIC), id: a.id, tpl: a.tpl, label: a.label, tuned: !!LAYOUTS[a.id] }));
}
export const skinUrl = (id) => `img/fest/${id}.webp`;
