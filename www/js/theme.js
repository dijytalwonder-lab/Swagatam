// Light / dark theme. 'auto' follows the phone's setting; 'light' and 'dark' force one.
// The choice is a per-device preference (not part of the account data, so "Clear data" keeps it).
// The colours themselves live in css/app.css as variables under :root and :root[data-theme="dark"].
const KEY = 'swagatam.theme';
const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
const listeners = new Set();

export function getMode() {
  try { const m = localStorage.getItem(KEY); return m === 'light' || m === 'dark' ? m : 'auto'; } catch (e) { return 'auto'; }
}

export const isDark = () => { const m = getMode(); return m === 'dark' || (m === 'auto' && !!mq && mq.matches); };

function apply() {
  const dark = isDark();
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', dark ? '#12040f' : '#2b0833');
  listeners.forEach((fn) => fn(dark));
}

export function setMode(mode) {
  try { localStorage.setItem(KEY, mode); } catch (e) { /* storage blocked: the choice lasts until the app closes */ }
  apply();
}

/** Call fn(isDark) whenever the effective theme is re-applied (user choice or phone setting changed). */
export const onThemeChange = (fn) => listeners.add(fn);

export function initTheme() {
  apply();
  if (mq && mq.addEventListener) mq.addEventListener('change', () => { if (getMode() === 'auto') apply(); });
}
