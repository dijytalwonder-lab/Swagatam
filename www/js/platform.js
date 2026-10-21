// Thin wrappers around Capacitor plugins so the same code runs in a normal browser (dev) and on Android.
import { state, getFestival, brandOf } from './store.js';
import { occurrences, startOfDay, ymd } from './festivals.js';

const cap = window.Capacitor;
export const isNative = !!(cap && cap.isNativePlatform && cap.isNativePlatform());
// no bundler here, so use the plugin proxies the native bridge injects as Capacitor.Plugins
const plugin = (name) => (isNative && cap.Plugins && cap.Plugins[name]) || null;
const LN = plugin('LocalNotifications');
const Share = plugin('Share');
const Filesystem = plugin('Filesystem');

// stable positive int id for "festival + year" so rescheduling replaces rather than duplicates
function nid(fid, year) { let h = year; for (let i = 0; i < fid.length; i++) h = (h * 31 + fid.charCodeAt(i)) % 2147483000; return h + 1; }

export async function notificationsAllowed(ask) {
  if (!LN) return false;
  try {
    let p = await LN.checkPermissions();
    if (p.display !== 'granted' && ask) p = await LN.requestPermissions();
    return p.display === 'granted';
  } catch (e) { return false; }
}

/** (Re)schedule one morning reminder for every set festival over the next ~3 years. Safe to call any time. */
export async function scheduleReminders() {
  if (!LN) return 0;
  try {   // always clear old reminders first, so logging out leaves none behind
    const pend = await LN.getPending();
    if (pend.notifications.length) await LN.cancel({ notifications: pend.notifications.map((n) => ({ id: n.id })) });
  } catch (e) { /* nothing to clear */ }
  if (!state.user || !(await notificationsAllowed(false))) return 0;
  try {
    const [hh, mm] = (state.user.notifyTime || '07:30').split(':').map(Number);
    const now = new Date(), end = new Date(now.getFullYear() + 3, 11, 31), list = [];
    for (const [fid, set] of Object.entries(state.sets)) {
      const f = getFestival(fid); if (!f) continue;
      for (const d of occurrences(f, startOfDay(now), end, set.overrides || {})) {
        const at = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm, 0);
        if (at <= now) continue;
        list.push({
          id: nid(fid, d.getFullYear()), title: `${f.name} - your status is ready`,
          body: `Tap to share your ${brandOf(state.user) || 'brand'} greeting on WhatsApp.`,
          schedule: { at, allowWhileIdle: true }, extra: { fid, date: ymd(d) },
        });
      }
    }
    list.sort((a, b) => a.schedule.at - b.schedule.at);
    const batch = list.slice(0, 400);
    if (batch.length) await LN.schedule({ notifications: batch });
    return batch.length;
  } catch (e) { return 0; }
}

export function onNotificationTap(fn) {
  if (!LN) return;
  LN.addListener('localNotificationActionPerformed', (e) => { const fid = e.notification && e.notification.extra && e.notification.extra.fid; if (fid) fn(fid); });
}

const blobToBase64 = (blob) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(blob); });
const canvasBlob = (canvas) => new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.92));

/** Opens the system share sheet with the poster attached (WhatsApp lists "My status" there). Falls back to a download in a browser. */
export async function sharePoster(canvas, filename, text) {
  const blob = await canvasBlob(canvas);
  if (isNative && Share && Filesystem) {
    const path = `status/${filename}.jpg`;
    const f = await Filesystem.writeFile({ path, data: await blobToBase64(blob), directory: 'CACHE', recursive: true });
    await Share.share({ title: filename, text, files: [f.uri], dialogTitle: 'Post your status' });
    return 'shared';
  }
  const file = new File([blob], `${filename}.jpg`, { type: 'image/jpeg' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], text }); return 'shared'; } catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; } }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${filename}.jpg`; document.body.appendChild(a); a.click(); a.remove();
  return 'downloaded';
}

