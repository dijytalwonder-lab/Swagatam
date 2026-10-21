// Poster renderer: draws a 1080x1920 (WhatsApp status size) greeting on a <canvas>.
// renderPoster() can draw at any scale, so the same code makes list thumbnails, live previews and the shared file.
import { wishFor } from './festivals.js';

export const W = 1080, H = 1920;

// older Android WebViews (< Chrome 99) lack roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    r = Math.min(typeof r === 'number' ? r : (r && r[0]) || 0, w / 2, h / 2);
    this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r); this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); this.closePath();
  };
}

const FONT = '"Baloo 2", "Noto Sans Devanagari", "Nirmala UI", system-ui, sans-serif';
const EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

export const TEMPLATES = [
  { id: 'marigold', name: 'Marigold', free: true },
  { id: 'frame', name: 'Gold Frame', free: true },
  { id: 'split', name: 'Bold Split', free: true },
  { id: 'royal', name: 'Royal', free: false },
  { id: 'pop', name: 'Pop Art', free: false },
  { id: 'arch', name: 'Floral Arch', free: false },
];

export async function ensureFonts() {
  try {
    await Promise.all([
      document.fonts.load('800 60px "Baloo 2"', 'Happy Diwali'), document.fonts.load('700 40px "Baloo 2"', 'Happy Diwali'),
      document.fonts.load('500 40px "Baloo 2"', 'Happy Diwali'), document.fonts.load('800 60px "Baloo 2"', 'दीपावली'),
      document.fonts.load('700 40px "Baloo 2"', 'दीपावली'), document.fonts.load('500 40px "Baloo 2"', 'शुभकामनाएँ'),
    ]);
  } catch (e) { /* fall back to system fonts */ }
}

// ---------- small helpers ----------
const hex = (h) => { if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]; const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
export function mix(a, b, t) { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; }
function rng(seed) { let h = 1779033703 ^ seed.length; for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } let a = h >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function vgrad(ctx, a, b, y0 = 0, y1 = H) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function glow(ctx, x, y, r, color, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
function star(ctx, x, y, r) { ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill(); }
function sparkles(ctx, seed, n, color, [x0, y0, x1, y1], alpha = 0.7) {
  const r = rng(seed); ctx.save(); ctx.fillStyle = color;
  for (let i = 0; i < n; i++) { ctx.globalAlpha = alpha * (0.35 + r() * 0.65); star(ctx, x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 8 + r() * 20); }
  ctx.restore();
}
function mandala(ctx, cx, cy, r, color, alpha, n = 24) {
  ctx.save(); ctx.translate(cx, cy); ctx.fillStyle = color; ctx.strokeStyle = color; ctx.globalAlpha = alpha;
  for (let layer = 0; layer < 3; layer++) {
    const R = r * (1 - layer * 0.2), pn = n - layer * 4;
    for (let i = 0; i < pn; i++) { ctx.save(); ctx.rotate((i / pn) * Math.PI * 2 + layer * 0.13); ctx.beginPath(); ctx.ellipse(0, -R * 0.82, R * 0.085, R * 0.18, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  }
  ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r * 0.98, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}
function ring(ctx, x, y, r, color, w, alpha = 1) { ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
function chakra(ctx, cx, cy, r, color) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = r * 0.07; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = r * 0.035; for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r * 0.16, cy + Math.sin(a) * r * 0.16); ctx.lineTo(cx + Math.cos(a) * r * 0.94, cy + Math.sin(a) * r * 0.94); ctx.stroke(); }
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(cx, cy, r * 0.15, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
function flower(ctx, x, y, r, petal, centre, n = 6) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = petal;
  for (let i = 0; i < n; i++) { ctx.save(); ctx.rotate((i / n) * Math.PI * 2); ctx.beginPath(); ctx.ellipse(0, -r * 0.6, r * 0.34, r * 0.55, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  ctx.fillStyle = centre; ctx.beginPath(); ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
function garland(ctx) {
  const cols = ['#ff9f1c', '#ffbf00', '#f77f00', '#ffd166'];
  ctx.save();
  for (let s = 0; s < 3; s++) {
    const x0 = s * 360, steps = 11;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, x = x0 + t * 360, y = 26 + Math.sin(t * Math.PI) * 84;
      ctx.fillStyle = cols[(i + s) % cols.length]; ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(x - 6, y - 7, 6, 0, Math.PI * 2); ctx.fill();
    }
  }
  for (let i = 0; i < 7; i++) {
    const x = 90 + i * 150, y0 = 26 + Math.sin(((x % 360) / 360) * Math.PI) * 84 + 24;
    for (let k = 0; k < 4; k++) { ctx.fillStyle = cols[(i + k) % cols.length]; ctx.beginPath(); ctx.arc(x, y0 + k * 40, 17 - k * 1.5, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
}

function cover(ctx, img, x, y, w, h) {
  const s = Math.max(w / img.width, h / img.height), iw = img.width * s, ih = img.height * s;
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) * 0.4, iw, ih);
}
function contain(ctx, img, x, y, w, h) {
  const s = Math.min(w / img.width, h / img.height), iw = img.width * s, ih = img.height * s;
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}

// photo (or a festive fallback) clipped to whatever path `path` builds, inside the box x,y,w,h
function media(ctx, d, path, x, y, w, h) {
  ctx.save(); path(); ctx.clip();
  if (d.pic) cover(ctx, d.pic, x, y, w, h);
  else {
    const g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, mix(d.p[0], d.p[1], 0.35)); g.addColorStop(1, d.p[1]);
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    const cx = x + w / 2, cy = y + h / 2, m = Math.min(w, h);
    glow(ctx, cx, cy, m * 0.6, d.p[2], 0.45); mandala(ctx, cx, cy, m * 0.52, '#fff', 0.16);
    if (d.chakra) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, m * 0.3, 0, Math.PI * 2); ctx.fill(); chakra(ctx, cx, cy, m * 0.27, d.p[2]); }
    else if (d.art) { ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = m * 0.05; ctx.shadowOffsetY = m * 0.025; contain(ctx, d.art, cx - m * 0.4, cy - m * 0.4, m * 0.8, m * 0.8); }
    else { ctx.font = `${Math.round(m * 0.5)}px ${EMOJI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText(d.emoji, cx, cy + m * 0.03); }
  }
  ctx.restore();
}
const circlePath = (ctx, x, y, r) => () => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); };
const rectPath = (ctx, x, y, w, h, r) => () => rr(ctx, x, y, w, h, r);

// ---------- text ----------
function splitTitle(name) { const m = /^(Happy|Merry)\s+(.+)$/.exec(name); return m ? { kicker: m[1], main: m[2] } : { kicker: '', main: name }; }

function balanced(words, n) {
  if (n === 1 || words.length < 2) return [words.join(' ')];
  const len = (a) => a.join(' ').length; let best = null, bestScore = 1e9;
  const tryCut = (cuts) => { const parts = []; let p = 0; for (const c of [...cuts, words.length]) { parts.push(words.slice(p, c)); p = c; } if (parts.some((q) => !q.length)) return; const sc = Math.max(...parts.map(len)); if (sc < bestScore) { bestScore = sc; best = parts.map((q) => q.join(' ')); } };
  if (n === 2) for (let i = 1; i < words.length; i++) tryCut([i]);
  else for (let i = 1; i < words.length - 1; i++) for (let j = i + 1; j < words.length; j++) tryCut([i, j]);
  return best || [words.join(' ')];
}

function layoutTitle(ctx, text, maxW, maxSize, minSize) {
  const words = text.split(/\s+/);
  for (let n = 1; n <= 3; n++) {
    const lines = balanced(words, n);
    let size = maxSize; for (; size > 20; size -= 4) { ctx.font = `800 ${size}px ${FONT}`; if (lines.every((l) => ctx.measureText(l).width <= maxW)) break; }
    if (size >= minSize || n === 3) return { lines, size };
  }
}

function fitLine(ctx, text, weight, size, maxW, min = 26) {
  let s = size; for (; s > min; s -= 2) { ctx.font = `${weight} ${s}px ${FONT}`; if (ctx.measureText(text).width <= maxW) break; } ctx.font = `${weight} ${s}px ${FONT}`; return s;
}

function ellipsize(ctx, text, maxW) {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text; while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
  return t.trimEnd() + '…';
}

function wrapLines(ctx, text, maxW) {
  const out = []; for (const para of text.split('\n')) {
    let line = ''; for (const w of para.split(/\s+/)) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }
    out.push(line);
  }
  return out;
}

function textBlock(ctx, d, o) {
  const x = o.x ?? W / 2; let y = o.top;
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  const shadow = () => { if (o.shadow) { ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6; } };
  if (d.kicker) {
    const ks = Math.min(76, o.maxSize * 0.4); ctx.font = `700 ${ks}px ${FONT}`; y += ks * 0.92;
    ctx.save(); shadow(); ctx.fillStyle = o.kicker || o.color; ctx.fillText(d.kicker, x, y); ctx.restore(); y += ks * 0.12;
  }
  // shrink the whole block until it leaves room for the wish line above the footer
  const kh = d.kicker ? Math.min(76, o.maxSize * 0.4) * 1.04 : 0, avail = (o.bottom ?? 1e9) - o.top;
  let L;
  for (let ms = o.maxSize; ms >= 56; ms -= 8) {
    L = layoutTitle(ctx, d.main, o.maxW, ms, Math.min(o.minSize || 100, ms));
    const hiH = d.hi ? Math.min(L.size * 0.42, 86) * 1.15 : 0;
    if (kh + L.lines.length * L.size * 0.96 + hiH <= avail) break;
  }
  ctx.font = `800 ${L.size}px ${FONT}`;
  for (const line of L.lines) {
    y += L.size * 0.86;
    ctx.save(); shadow();
    if (o.stroke) { ctx.strokeStyle = o.stroke.color; ctx.lineWidth = o.stroke.width; ctx.strokeText(line, x, y); }
    ctx.fillStyle = o.color; ctx.fillText(line, x, y); ctx.restore(); y += L.size * 0.1;
  }
  if (d.hi) {
    const s = fitLine(ctx, d.hi, 700, Math.min(L.size * 0.42, 86), o.maxW, 34); y += s * 0.95;
    ctx.save(); shadow(); ctx.fillStyle = o.hiColor || o.color; ctx.globalAlpha = 0.92; ctx.fillText(d.hi, x, y); ctx.restore(); y += s * 0.2;
  }
  return y;
}

function wishText(ctx, text, o) {
  if (!text) return o.y;
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = o.color;
  let size = o.size || 46, lines;
  for (; size >= 28; size -= 2) { ctx.font = `500 ${size}px ${FONT}`; lines = wrapLines(ctx, text, o.maxW); if (o.y + lines.length * size * 1.28 <= o.bottom) break; }
  const max = Math.max(1, Math.floor((o.bottom - o.y) / (size * 1.28))); if (lines.length > max) { lines = lines.slice(0, max); lines[max - 1] = lines[max - 1].replace(/\s*\S*$/, '') + '…'; }
  let y = o.y; for (const l of lines) { y += size * 1.1; ctx.fillText(l, o.x ?? W / 2, y); y += size * 0.18; }
  return y;
}

// ---------- brand footer ----------
function badge(ctx, d, cx, cy, r, bg, fg) {
  ctx.save();
  ctx.fillStyle = d.logo ? '#fff' : bg; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  if (d.logo) { ctx.clip(); contain(ctx, d.logo, cx - r * 0.84, cy - r * 0.84, r * 1.68, r * 1.68); }
  else { ctx.fillStyle = fg; ctx.font = `800 ${r * 1.05}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText((d.brand || '?').trim().charAt(0).toUpperCase(), cx, cy + r * 0.08); }
  ctx.restore();
}

// brand name + owner/phone, with the logo (or monogram) on the left
function brandLine(ctx, d, x, y, h, maxW, fg, sub, badgeBg, badgeFg) {
  const r = h * 0.38, tx = x + r * 2 + 28, tw = maxW - r * 2 - 28;
  badge(ctx, d, x + r, y + h / 2, r, badgeBg, badgeFg);
  const lines = [d.name && d.name !== d.brand ? d.name : '', d.phone].filter(Boolean).join('  ·  ');
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const s1 = fitLine(ctx, d.brand, 800, 56, tw, 30); ctx.fillStyle = fg;
  const baseY = lines ? y + h / 2 - 2 : y + h / 2 + s1 * 0.3;
  ctx.fillText(ellipsize(ctx, d.brand, tw), tx, baseY);
  if (lines) { fitLine(ctx, lines, 500, 36, tw, 24); ctx.fillStyle = sub; ctx.fillText(ellipsize(ctx, lines, tw), tx, baseY + 46); }
}

function footerCard(ctx, d, o) {
  ctx.save();
  if (o.shadow) { ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10; }
  if (o.hard) { ctx.fillStyle = o.hard; rr(ctx, o.x + 10, o.y + 12, o.w, o.h, o.h / 2); ctx.fill(); }
  ctx.fillStyle = o.bg; rr(ctx, o.x, o.y, o.w, o.h, o.radius ?? 44); ctx.fill(); ctx.restore();
  if (o.stroke) { ctx.save(); ctx.strokeStyle = o.stroke; ctx.lineWidth = 4; rr(ctx, o.x, o.y, o.w, o.h, o.radius ?? 44); ctx.stroke(); ctx.restore(); }
  brandLine(ctx, d, o.x + 40, o.y, o.h, o.w - 80, o.fg, o.sub, o.badgeBg, o.badgeFg);
}

// ---------- templates ----------
const templates = {
  marigold(ctx, d) {
    const [c0, c1, ac] = d.p;
    vgrad(ctx, c0, c1); glow(ctx, 540, 700, 760, ac, 0.34);
    sparkles(ctx, d.seed, 28, '#fff', [0, 150, W, 1500]);
    mandala(ctx, 540, 700, 470, '#fff', 0.1); mandala(ctx, 540, 700, 392, ac, 0.2, 18);
    garland(ctx);
    media(ctx, d, circlePath(ctx, 540, 700, 285), 255, 415, 570, 570);
    ring(ctx, 540, 700, 285, ac, 16); ring(ctx, 540, 700, 316, '#fff', 4, 0.5);
    const y = textBlock(ctx, d, { top: 1040, bottom: 1500, maxW: 940, maxSize: 200, color: '#fff', kicker: ac, shadow: true });
    wishText(ctx, d.wish, { y: y + 14, bottom: 1660, maxW: 860, color: 'rgba(255,255,255,.9)' });
    footerCard(ctx, d, { x: 60, y: 1690, w: 960, h: 180, bg: 'rgba(255,255,255,.96)', fg: c0, sub: '#6b5a6e', badgeBg: ac, badgeFg: c0, shadow: true });
  },

  frame(ctx, d) {
    const [c0, c1, ac] = d.p; const gold = mix(ac, '#b8860b', 0.35);
    ctx.fillStyle = '#fff8ec'; ctx.fillRect(0, 0, W, H);
    sparkles(ctx, d.seed, 22, c1, [60, 60, W - 60, H - 60], 0.22);
    ctx.lineWidth = 10; ctx.strokeStyle = gold; rr(ctx, 36, 36, W - 72, H - 72, 56); ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = c1; ctx.globalAlpha = 0.6; rr(ctx, 64, 64, W - 128, H - 128, 38); ctx.stroke(); ctx.globalAlpha = 1;
    mandala(ctx, 540, 150, 86, c1, 0.5, 16);
    media(ctx, d, rectPath(ctx, 150, 270, 780, 780, 70), 150, 270, 780, 780);
    ctx.lineWidth = 18; ctx.strokeStyle = gold; rr(ctx, 150, 270, 780, 780, 70); ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; rr(ctx, 168, 288, 744, 744, 56); ctx.stroke();
    if (d.pic) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(860, 1010, 84, 0, Math.PI * 2); ctx.fill(); ring(ctx, 860, 1010, 84, gold, 8); if (d.chakra) chakra(ctx, 860, 1010, 56, c0); else if (d.art) contain(ctx, d.art, 806, 956, 108, 108); else { ctx.font = `92px ${EMOJI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#000'; ctx.fillText(d.emoji, 860, 1016); } }
    const y = textBlock(ctx, d, { top: 1090, bottom: 1510, maxW: 880, maxSize: 190, color: c0, kicker: c1, hiColor: c1 });
    wishText(ctx, d.wish, { y: y + 10, bottom: 1660, maxW: 820, color: '#6b4f5e' });
    footerCard(ctx, d, { x: 90, y: 1690, w: 900, h: 170, bg: c0, fg: '#fff', sub: 'rgba(255,255,255,.78)', badgeBg: ac, badgeFg: c0, radius: 40 });
  },

  split(ctx, d) {
    const [c0, c1, ac] = d.p;
    vgrad(ctx, mix(c1, c0, 0.5), c0);
    media(ctx, d, () => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, 1040); ctx.lineTo(0, 1250); ctx.closePath(); }, 0, 0, W, 1250);
    ctx.fillStyle = ac; ctx.beginPath(); ctx.moveTo(0, 1250); ctx.lineTo(W, 1040); ctx.lineTo(W, 1092); ctx.lineTo(0, 1302); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(900, 1080, 100, 0, Math.PI * 2); ctx.fill(); ring(ctx, 900, 1080, 100, ac, 10);
    if (d.chakra) chakra(ctx, 900, 1080, 66, c0); else if (d.art) contain(ctx, d.art, 832, 1012, 136, 136); else { ctx.font = `116px ${EMOJI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#000'; ctx.fillText(d.emoji, 900, 1088); }
    sparkles(ctx, d.seed, 14, '#fff', [0, 1320, W, 1700], 0.35);
    const y = textBlock(ctx, d, { x: 70, align: 'left', top: 1310, bottom: 1570, maxW: 800, maxSize: 170, minSize: 90, color: '#fff', kicker: ac, hiColor: ac, shadow: true });
    wishText(ctx, d.wish, { x: 70, align: 'left', y: y + 6, bottom: 1715, maxW: 840, color: 'rgba(255,255,255,.88)', size: 42 });
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(70, 1730); ctx.lineTo(W - 70, 1730); ctx.stroke();
    brandLine(ctx, d, 70, 1745, 140, W - 140, '#fff', 'rgba(255,255,255,.78)', ac, c0);
  },

  royal(ctx, d) {
    const [c0, c1, ac] = d.p;
    vgrad(ctx, mix(c0, '#000', 0.72), mix(c1, '#000', 0.78)); glow(ctx, 540, 720, 700, c1, 0.28);
    const gg = ctx.createLinearGradient(0, 0, W, 0); gg.addColorStop(0, '#f6e7a8'); gg.addColorStop(0.5, '#d4a017'); gg.addColorStop(1, '#f6e7a8');
    mandala(ctx, 540, 720, 600, '#e9c46a', 0.09, 28);
    sparkles(ctx, d.seed, 22, '#f6e7a8', [100, 120, W - 100, 1600], 0.6);
    ctx.strokeStyle = gg; ctx.lineWidth = 7; rr(ctx, 48, 48, W - 96, H - 96, 24); ctx.stroke(); ctx.lineWidth = 2; rr(ctx, 80, 80, W - 160, H - 160, 12); ctx.stroke();
    for (const [cx, cy, a] of [[80, 80, 0], [W - 80, 80, 1], [W - 80, H - 80, 2], [80, H - 80, 3]]) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(a * Math.PI / 2); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 70, 0, Math.PI / 2); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI / 2); ctx.stroke(); ctx.restore(); }
    for (let i = 0; i < 44; i++) { const a = (i / 44) * Math.PI * 2; ctx.fillStyle = '#e9c46a'; ctx.beginPath(); ctx.arc(540 + Math.cos(a) * 338, 700 + Math.sin(a) * 338, 6, 0, Math.PI * 2); ctx.fill(); }
    media(ctx, d, circlePath(ctx, 540, 700, 290), 250, 410, 580, 580);
    ctx.strokeStyle = gg; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(540, 700, 290, 0, Math.PI * 2); ctx.stroke();
    const y = textBlock(ctx, d, { top: 1060, bottom: 1490, maxW: 900, maxSize: 190, color: gg, kicker: '#f6e7a8', hiColor: '#f6e7a8' });
    wishText(ctx, d.wish, { y: y + 12, bottom: 1650, maxW: 840, color: '#f1e6c8' });
    footerCard(ctx, d, { x: 100, y: 1690, w: 880, h: 160, bg: 'rgba(0,0,0,.32)', stroke: '#d4a017', fg: '#f6e7a8', sub: 'rgba(246,231,168,.75)', badgeBg: '#d4a017', badgeFg: '#2b1a00', radius: 80 });
  },

  pop(ctx, d) {
    const [c0, c1, ac] = d.p; const dark = mix(c0, '#000', 0.35);
    ctx.fillStyle = ac; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(540, 960); ctx.rotate(-0.35); ctx.fillStyle = mix(ac, '#fff', 0.35); ctx.globalAlpha = 0.55;
    for (let x = -1500; x < 1500; x += 150) ctx.fillRect(x, -1700, 64, 3400); ctx.restore();
    const r = rng(d.seed); const cols = [c0, c1, '#fff', dark];
    for (let i = 0; i < 46; i++) { ctx.save(); ctx.translate(r() * W, r() * 1500); ctx.rotate(r() * 6); ctx.fillStyle = cols[i % 4]; if (i % 3 === 0) { ctx.beginPath(); ctx.arc(0, 0, 8 + r() * 10, 0, Math.PI * 2); ctx.fill(); } else ctx.fillRect(-6, -14, 12, 28); ctx.restore(); }
    ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(560, 740, 500, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c1; ctx.beginPath(); ctx.arc(540, 720, 500, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.translate(540, 700); ctx.rotate(0.05);
    ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 36; ctx.shadowOffsetY = 18; ctx.fillStyle = '#fff'; rr(ctx, -320, -370, 640, 760, 26); ctx.fill(); ctx.shadowColor = 'transparent';
    media(ctx, d, rectPath(ctx, -280, -330, 560, 560, 14), -280, -330, 560, 560);
    ctx.fillStyle = dark; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; fitLine(ctx, d.brand, 800, 56, 540, 32); ctx.fillText(ellipsize(ctx, d.brand, 540), 0, 330);
    ctx.restore();
    ctx.save(); ctx.translate(540, 1150); ctx.rotate(-0.045); ctx.translate(-540, -1150);
    const y = textBlock(ctx, d, { top: 1110, bottom: 1520, maxW: 900, maxSize: 190, color: '#fff', kicker: dark, hiColor: '#fff', stroke: { color: dark, width: 26 } });
    ctx.restore();
    wishText(ctx, d.wish, { y: y + 18, bottom: 1660, maxW: 860, color: dark, size: 46 });
    footerCard(ctx, d, { x: 60, y: 1700, w: 960, h: 160, bg: '#fff', hard: dark, fg: dark, sub: '#6b5a6e', badgeBg: c1, badgeFg: '#fff', radius: 80 });
  },

  arch(ctx, d) {
    const [c0, c1, ac] = d.p;
    vgrad(ctx, mix(c1, '#fff', 0.78), mix(c0, '#fff', 0.9));
    for (const [x, y, r] of [[0, 120, 300], [W, 300, 260], [60, 1250, 220], [W - 40, 1150, 280]]) { ctx.fillStyle = c1; ctx.globalAlpha = 0.1; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
    const archPath = (g) => () => { ctx.beginPath(); ctx.moveTo(190 - g, 1090); ctx.lineTo(190 - g, 510); ctx.arc(540, 510, 350 + g, Math.PI, 0); ctx.lineTo(890 + g, 1090); ctx.closePath(); };
    [[46, 0.22], [24, 0.4]].forEach(([g, a]) => { archPath(g)(); ctx.strokeStyle = c1; ctx.globalAlpha = a; ctx.lineWidth = 8; ctx.stroke(); ctx.globalAlpha = 1; });
    media(ctx, d, archPath(0), 190, 160, 700, 930);
    archPath(0)(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 12; ctx.stroke();
    for (let i = 0; i < 8; i++) { const x = 190 + i * 100; flower(ctx, x, 1100, 52, i % 2 ? ac : c1, i % 2 ? c0 : '#fff', 7); }
    flower(ctx, 140, 1120, 38, ac, c0); flower(ctx, 940, 1120, 38, ac, c0);
    const y = textBlock(ctx, d, { top: 1190, bottom: 1520, maxW: 900, maxSize: 180, color: c0, kicker: c1, hiColor: c1 });
    wishText(ctx, d.wish, { y: y + 10, bottom: 1665, maxW: 840, color: mix(c0, '#777', 0.4) });
    footerCard(ctx, d, { x: 70, y: 1695, w: 940, h: 170, bg: '#fff', fg: c0, sub: '#7a6a7e', badgeBg: c1, badgeFg: '#fff', shadow: true, radius: 50 });
  },
};

// ---------- public API ----------
function fmtPhone(m) { const s = String(m || '').replace(/\D/g, '').slice(-10); return s.length === 10 ? `+91 ${s.slice(0, 5)} ${s.slice(5)}` : ''; }

function contentFor(o) {
  const f = o.festival, s = o.set, wish = wishFor(f), hasHi = !!f.hi;
  const { kicker, main } = splitTitle(s.lang === 'hi' && hasHi ? f.hi : f.name);
  const u = o.user || {};
  return {
    p: f.p, emoji: f.emoji, chakra: f.p[0] === '#ff9933', seed: f.id,
    kicker, main, hi: s.lang === 'both' && hasHi ? f.hi : '',
    wish: (s.message || '').trim() || (s.lang === 'hi' && hasHi ? wish.hi : wish.en),
    brand: u.brand || u.name || 'Your brand', name: u.name || '',
    phone: s.showPhone ? fmtPhone(u.mobile) : '',
    pic: o.pic || null, logo: s.useLogo ? o.logo || null : null,
    art: o.art || null, decor: o.decor || null,
  };
}

// a pair of decorations (marigold strings, dahi handi...) hanging from the top corners
function hanging(ctx, img) {
  const h = 340, w = (h * img.width) / img.height;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
  for (const x of [22, W - 22 - w]) ctx.drawImage(img, x, -8, w, h);
  ctx.restore();
}

/** o = { festival, set (already passed through effective()), user, pic?, logo?, art?, decor?: Image }. Returns a canvas. */
export function renderPoster(o, scale = 1) {
  const c = document.createElement('canvas'); c.width = Math.round(W * scale); c.height = Math.round(H * scale);
  const ctx = c.getContext('2d'); ctx.scale(scale, scale);
  const fn = templates[TEMPLATES[o.set.template]?.id] || templates.marigold;
  const d = contentFor(o);
  fn(ctx, d);
  if (d.decor) hanging(ctx, d.decor);
  return c;
}
