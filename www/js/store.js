// App state (localStorage) + image blobs (IndexedDB) + plan helpers.
import { FESTIVALS, artUrl } from './festivals.js';

const KEY = 'swagatam.v1';
const DAY = 86400000;
export const TRIAL_DAYS = 7;

const fresh = () => ({ v: 1, user: null, sets: {}, custom: [] });

function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1) return { ...fresh(), ...s }; } catch (e) { /* first run or blocked storage */ }
  return fresh();
}

export const state = load();

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked - keep going in memory */ }
}

export function resetAll() {
  for (const k of Object.keys(state)) delete state[k];
  Object.assign(state, fresh());
  save();
  blobs.clear();
}

// ---- festivals (built-in + the user's own events) ----
// the name shown on statuses: a business uses its brand name, a personal account uses the person's own name
export const isBusiness = (u) => !(u && u.type === 'personal');
export const brandOf = (u) => (u ? (isBusiness(u) ? u.brand || u.name : u.name) || '' : '');

export const allFestivals = () => FESTIVALS.concat(state.custom);
export const getFestival = (id) => allFestivals().find((f) => f.id === id) || null;

export function addCustom({ name, emoji, date }) {
  const id = 'c_' + Date.now().toString(36);
  const [, m, d] = date.split('-');
  const f = { id, name, hi: '', emoji: emoji || '🎉', kind: 'custom', p: ['#4a1250', '#d9480f', '#ffd43b'], fixed: `${m}-${d}` };
  state.custom.push(f); save();
  return f;
}

export function removeCustom(id) {
  state.custom = state.custom.filter((f) => f.id !== id);
  delete state.sets[id];
  blobs.del('pic:' + id); save();
}

// ---- schedules ("set status") ----
export const defaultSet = () => ({ template: 0, lang: 'both', message: '', showPhone: false, useLogo: false, hasPic: false, overrides: {} });
export const getSet = (id) => state.sets[id] || null;
export function putSet(id, s) { state.sets[id] = s; save(); }
export function dropSet(id) { delete state.sets[id]; blobs.del('pic:' + id); save(); }

// ---- plan: 7-day trial unlocks everything, free plan keeps 3 designs and no logo ----
export const FREE_TEMPLATES = 3;
export const isPro = () => !!state.user && ((state.user.proUntil || 0) > Date.now() || (state.user.trialEndsAt || 0) > Date.now());
export const onTrial = () => !!state.user && (state.user.trialEndsAt || 0) > Date.now() && !((state.user.proUntil || 0) > Date.now());
export const trialDaysLeft = () => Math.max(0, Math.ceil(((state.user && state.user.trialEndsAt) - Date.now()) / DAY));
export function startTrial() { state.user.trialEndsAt = Date.now() + TRIAL_DAYS * DAY; save(); }
export function grantPro(days) { state.user.proUntil = Math.max(Date.now(), state.user.proUntil || 0) + days * DAY; save(); }

/** What a saved status really renders with right now: paid extras quietly drop away once Pro ends. */
export function effective(set) {
  const pro = isPro();
  return { ...set, template: pro || set.template < FREE_TEMPLATES ? set.template : 0, useLogo: pro && set.useLogo };
}

// ---- image blobs ----
let dbp;
const mem = new Map();
function db() {
  if (!dbp) dbp = new Promise((res, rej) => {
    try {
      const r = indexedDB.open('swagatam-blobs', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('b');
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    } catch (e) { rej(e); }
  });
  return dbp;
}
const tx = (mode, fn) => db().then((d) => new Promise((res, rej) => {
  const t = d.transaction('b', mode); const out = fn(t.objectStore('b'));
  t.oncomplete = () => res(out && 'result' in out ? out.result : undefined); t.onerror = () => rej(t.error);
}));

const imgCache = new Map();
export const blobs = {
  async put(key, blob) { imgCache.delete(key); mem.set(key, blob); try { await tx('readwrite', (s) => s.put(blob, key)); } catch (e) { /* memory copy only */ } },
  async get(key) { if (mem.has(key)) return mem.get(key); try { const b = await tx('readonly', (s) => s.get(key)); if (b) mem.set(key, b); return b || null; } catch (e) { return null; } },
  async del(key) { imgCache.delete(key); mem.delete(key); try { await tx('readwrite', (s) => s.delete(key)); } catch (e) { /* ignore */ } },
  async clear() { imgCache.clear(); mem.clear(); try { await tx('readwrite', (s) => s.clear()); } catch (e) { /* ignore */ } },
};

export async function getImage(key) {
  if (imgCache.has(key)) return imgCache.get(key);
  const b = await blobs.get(key);
  if (!b) return null;
  const img = await loadImage(URL.createObjectURL(b));
  imgCache.set(key, img);
  return img;
}

export function loadImage(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}

/** Downscale a picked file so a handful of posters never blow the storage budget. */
export async function shrink(file, maxSide, type = 'image/jpeg', q = 0.88) {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const k = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(img.naturalWidth * k)); c.height = Math.max(1, Math.round(img.naturalHeight * k));
    const x = c.getContext('2d');
    if (type === 'image/jpeg') { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }
    x.drawImage(img, 0, 0, c.width, c.height);
    return await new Promise((res) => c.toBlob(res, type, q));
  } finally { URL.revokeObjectURL(url); }
}

// illustration for a festival (null when it has none or the file cannot be read) and the shared lantern decoration
const artCache = new Map();
function loadArt(name) {
  if (!name) return Promise.resolve(null);
  if (!artCache.has(name)) artCache.set(name, loadImage(artUrl(name)).catch(() => null));
  return artCache.get(name);
}
export const getArt = (f) => loadArt(f && f.art);
export const getDecor = (f) => loadArt(f && f.decor);
