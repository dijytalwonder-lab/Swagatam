// Small UI helpers shared by the screens.
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ic = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
export const icons = {
  back: ic('<path d="M15 5l-7 7 7 7"/>'),
  home: ic('<path d="M3 11l9-7.5L21 11"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/>'),
  cal: ic('<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  user: ic('<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1-4 4-6 7.500-6s6.500 2 7.500 6"/>'),
  plus: ic('<path d="M12 5v14M5 12h14"/>'),
  chevL: ic('<path d="M15 5l-7 7 7 7"/>'),
  chevR: ic('<path d="M9 5l7 7-7 7"/>'),
  share: ic('<path d="M12 3v12M7.500 7.500L12 3l4.500 4.500"/><path d="M5 12v7.500a1.500 1.500 0 001.500 1.500h11a1.500 1.500 0 001.500-1.500V12"/>'),
};

const swag = (x0, w, steps, sag) => Array.from({ length: steps + 1 }, (_, i) => {
  const t = i / steps, x = x0 + t * w, y = 18 + Math.sin(t * Math.PI) * sag;
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="${['#ff9f1c', '#ffbf00', '#f77f00', '#ffd166'][i % 4]}"/><circle cx="${(x - 2.5).toFixed(1)}" cy="${(y - 3).toFixed(1)}" r="2.6" fill="#fff" opacity=".35"/>`;
}).join('');

/** Marigold-garland strip for the top of the dark screens. */
export const toran = `<svg class="toran" viewBox="0 0 480 90" preserveAspectRatio="none" aria-hidden="true">${[0, 160, 320].map((x) => swag(x, 160, 8, 34)).join('')}${[40, 120, 200, 280, 360, 440].map((x, i) => {
  const y0 = 18 + Math.sin(((x % 160) / 160) * Math.PI) * 34 + 12;
  return [0, 1, 2].map((k) => `<circle cx="${x}" cy="${(y0 + k * 15).toFixed(1)}" r="${(7 - k).toFixed(1)}" fill="${['#ff9f1c', '#ffbf00', '#f77f00'][(i + k) % 3]}"/>`).join('');
}).join('')}</svg>`;

export const logo = (cls = 'logo') => `<img class="${cls}" src="img/logo.svg" alt="Swagatam">`;

let toastTimer;
export function toast(msg, ms = 2400) {
  document.querySelectorAll('.toast').forEach((t) => t.remove());
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.remove(), ms);
}

export function busy(msg) {
  const b = document.createElement('div'); b.className = 'busy'; b.textContent = msg; document.body.appendChild(b);
  return () => b.remove();
}

export function openSheet(html) {
  closeSheet();
  const o = document.createElement('div'); o.className = 'overlay'; o.id = 'sheet';
  o.innerHTML = `<div class="sheet">${html}</div>`;
  o.addEventListener('click', (e) => { if (e.target === o) closeSheet(); });
  document.body.appendChild(o);
  return o;
}
/** In-app replacement for window.confirm(), which some WebViews and preview panes silently block. Resolves true/false. */
export function confirmSheet(title, body, okLabel = 'Yes', danger = false) {
  return new Promise((resolve) => {
    const o = openSheet(`<h3>${esc(title)}</h3><p class="hint" style="margin:-6px 0 18px;font-size:16px">${esc(body)}</p><div style="display:grid;gap:10px"><button class="btn ${danger ? 'danger-fill' : 'primary'}" data-ok>${esc(okLabel)}</button><button class="btn ghost" data-cancel>Cancel</button></div>`);
    let done = false; const finish = (v) => { if (done) return; done = true; closeSheet(); resolve(v); };
    o.querySelector('[data-ok]').addEventListener('click', () => finish(true));
    o.querySelector('[data-cancel]').addEventListener('click', () => finish(false));
    o.addEventListener('click', (e) => { if (e.target === o) finish(false); });
  });
}

export function closeSheet() { const o = document.getElementById('sheet'); if (o) o.remove(); }
