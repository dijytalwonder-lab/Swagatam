// Swagatam - screens, routing and actions.
import { artUrl, dateFor, nextDate, occurrences, fmtDate, whenLabel, startOfDay, daysBetween, ymd, parseYmd, isLunar } from './festivals.js';
import {
  state, save, resetAll, allFestivals, getFestival, addCustom, removeCustom, defaultSet, getSet, putSet, dropSet,
  isPro, onTrial, trialDaysLeft, startTrial, grantPro, effective, FREE_TEMPLATES, TRIAL_DAYS, blobs, getImage, shrink, brandOf, isBusiness, getArt, getDecor,
} from './store.js';
import { renderPoster, ensureFonts, TEMPLATES } from './poster.js';
import { sendOtp, verifyOtp, validMobile } from './auth.js';
import { scheduleReminders, notificationsAllowed, onNotificationTap, sharePoster } from './platform.js';
import { esc, icons, toran, logo, toast, busy, openSheet, closeSheet, confirmSheet } from './ui.js';
import { PLANS, DEMO_OTP, DEMO_AUTH, DEMO_BILLING, TAGLINE } from './config.js';

const app = document.getElementById('app');
const ui = { auth: { step: 'phone', mobile: '' }, filter: 'all', cal: null, plan: 'year', emoji: '🎉', ptype: 'business' };
let draft = null;
let lastKey = '';

const today = () => startOfDay();
const firstName = (n) => String(n || '').trim().split(/\s+/)[0] || 'friend';
const gradient = (p) => `linear-gradient(155deg, ${p[0]}, ${p[1]})`;
const hhmm12 = (t) => { const [h, m] = (t || '07:30').split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };

const icon = (f) => (f.art ? `<img class="ficon" src="${artUrl(f.art)}" alt="" loading="lazy">` : f.emoji);
const posterUser = () => ({ ...state.user, brand: brandOf(state.user) });
const typeSeg = (biz) => `<div class="seg"><button class="${biz ? '' : 'on'}" data-act="setType" data-v="personal">👤 Personal</button><button class="${biz ? 'on' : ''}" data-act="setType" data-v="business">🏪 Business</button></div>`;

// ---------- plan label ----------
const planLabel = () => (isPro() ? (onTrial() ? `Trial · ${trialDaysLeft()}d left` : 'PRO') : 'Free plan');

// ---------- shared fragments ----------
function nav(active) {
  const t = (id, icon, label) => `<button class="${active === id ? 'on' : ''}" data-act="nav" data-tab="${id}">${icon}<span>${label}</span></button>`;
  return `<nav class="nav">${t('home', icons.home, 'Home')}${t('calendar', icons.cal, 'Calendar')}${t('me', icons.user, 'Profile')}</nav>`;
}
const topbar = (title, right = '') => `<div class="topbar"><button class="iconbtn" data-act="back" aria-label="Back">${icons.back}</button><h2>${esc(title)}</h2>${right || '<span style="width:44px"></span>'}</div>`;

function frow(f) {
  const set = state.sets[f.id], d = nextDate(f, today(), set && set.overrides);
  return `<div class="frow" data-act="openFest" data-id="${f.id}">
    <div class="badge" style="background:${gradient(f.p)}">${icon(f)}</div>
    <div class="info"><b>${esc(f.name)}</b><small>${d ? `${fmtDate(d)} · ${whenLabel(d)}` : 'Date not added yet'}</small>${set ? '<span class="tagline">Status set</span>' : ''}</div>
    <button class="switch ${set ? 'on' : ''}" data-act="toggleFest" data-id="${f.id}" aria-label="Set status"></button></div>`;
}

const upcomingList = () => allFestivals().map((f) => ({ f, d: nextDate(f, today(), state.sets[f.id] && state.sets[f.id].overrides) })).filter((x) => x.d).sort((a, b) => a.d - b.d);

// ---------- screens: each returns { html, after? } ----------
const screens = {
  auth() {
    const a = ui.auth;
    const body = a.step === 'phone' ? `
      <h2>Welcome! Let's get you started</h2><p class="hint">Register with your mobile number</p>
      <label class="field"><span>Mobile number</span><div class="phone"><div class="cc">+91</div><input class="input" id="mobile" type="tel" inputmode="numeric" maxlength="10" placeholder="98765 43210" value="${esc(a.mobile)}" data-enter="sendOtp" autocomplete="tel-national"></div></label>
      <div class="err" id="err"></div>
      <button class="btn primary" data-act="sendOtp">Get OTP</button>` : `
      <h2>Enter the OTP</h2><p class="hint">Sent to +91 ${esc(a.mobile)} · <button class="btn link" style="min-height:0;font-size:14px;display:inline;padding:0 4px" data-act="changeNumber">Change</button></p>
      <label class="field"><span>6-digit code</span><input class="input otp" id="otp" type="tel" inputmode="numeric" maxlength="6" placeholder="······" data-enter="verifyOtp" autocomplete="one-time-code"></label>
      ${DEMO_AUTH ? `<p class="hint" style="margin-top:-6px">Demo mode: use code <b>${DEMO_OTP}</b></p>` : ''}
      <div class="err" id="err"></div>
      <button class="btn primary" data-act="verifyOtp">Verify &amp; continue</button>`;
    return { html: `<div class="screen dark-screen">${toran}<div class="hero">${logo()}<h1>Swagatam</h1><div class="tag">${TAGLINE}</div><div class="welcome">स्वागतम् 🙏</div></div><div class="sheetcard">${body}</div></div>` };
  },

  offer() {
    const item = (e, t, s) => `<div class="item"><i>${e}</i><div><b>${t}</b><span>${s}</span></div></div>`;
    return { html: `<div class="screen"><div class="pad offer" style="padding-top:30px">
      <h1>What we offer</h1>
      ${item('🎨', 'Ready-made festival posters', '40+ festivals and special days, sized for WhatsApp Status. Pick a design, add your photo.')}
      ${item('⏰', 'Schedule once, celebrate forever', 'Set a festival one time. We remind you every year with your status ready to post.')}
      ${item('🏷️', 'Your brand on every status', 'Your name, brand and logo placed beautifully on each poster.')}
      ${item('🌐', 'English + हिन्दी greetings', 'Show both languages or pick one, and add your own offer line.')}
      </div><div class="bottombar"><button class="btn primary" data-act="startTrial">Start free trial</button>
      <div class="hint">${TRIAL_DAYS} days of every design and your logo. No card needed.</div>
      <button class="btn link" style="margin:2px auto 0;display:flex" data-act="skipTrial">Continue with the free plan</button></div></div>` };
  },

  'profile-setup'() {
    const u = state.user, biz = ui.ptype !== 'personal';
    return { html: `<div class="screen"><div class="pad" style="padding-top:34px"><h1 style="font-size:34px">Tell us about you</h1><p class="hint" style="margin:8px 0 18px;font-size:16px">This appears on every status you share.</p>
      ${typeSeg(biz)}
      <label class="field"><span>Your name</span><input class="input" id="pname" value="${esc(u.name)}" placeholder="e.g. Divya Sharma" autocomplete="name" autocapitalize="words" maxlength="40" data-enter="finishProfile"></label>
      <label class="field" id="brandField" style="${biz ? '' : 'display:none'}"><span>Brand name</span><input class="input" id="pbrand" value="${esc(u.brand)}" placeholder="e.g. Sharma Sweets" autocapitalize="words" maxlength="40" data-enter="finishProfile"></label>
      <div class="err" id="err"></div></div>
      <div class="bottombar"><button class="btn primary" data-act="finishProfile">Continue</button></div></div>` };
  },

  home() {
    const u = state.user, now = today(), list = upcomingList();
    const sets = list.filter((x) => state.sets[x.f.id]);
    const todays = sets.filter((x) => daysBetween(now, x.d) === 0);
    const todayHtml = todays.map(({ f }) => `<div class="todaycard" style="background:${gradient(f.p)}"><div class="thumb" data-thumb="${f.id}"></div><div><small>Today</small><h3>${esc(f.name)}</h3><button class="btn" data-act="openFest" data-id="${f.id}">Post it now</button></div></div>`).join('');
    const cards = list.slice(0, 8).map(({ f, d }) => {
      const isSet = !!state.sets[f.id];
      return `<div class="ucard" style="background:${gradient(f.p)}" data-act="openFest" data-id="${f.id}"><span class="when">${whenLabel(d)}</span><div class="e">${icon(f)}</div><b>${esc(f.name.replace(/^(Happy|Merry)\s+/, ''))}</b><small>${fmtDate(d)}</small><button class="set ${isSet ? 'done' : ''}" data-act="${isSet ? 'openFest' : 'newSet'}" data-id="${f.id}">${isSet ? '✓ Status set' : 'Set status'}</button></div>`;
    }).join('');
    const rows = sets.map(({ f, d }) => `<button class="srow" data-act="openFest" data-id="${f.id}"><div class="thumb" data-thumb="${f.id}"></div><div class="info"><b>${esc(f.name)}</b><small>${fmtDate(d, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} · ${whenLabel(d)}</small><span class="tagline ${daysBetween(now, d) === 0 ? 'live' : ''}">${daysBetween(now, d) === 0 ? 'Ready to post' : 'Repeats every year'}</span></div>${icons.chevR.replace('<svg', '<svg width="22" height="22"')}</button>`).join('');
    return {
      html: `<div class="screen hasnav">
        <div class="homehead"><div class="avatar" data-avatar>${esc((brandOf(u) || '?').charAt(0).toUpperCase())}</div><div class="who"><small>Swagatam 🙏 ${esc(firstName(u.name))}</small><b>${esc(brandOf(u))}</b></div><button class="planpill ${isPro() ? 'pro' : ''}" data-act="gotoPro">${planLabel()}</button></div>
        ${todayHtml}
        <div class="sec"><h3>Upcoming holidays</h3><button data-act="gotoFestivals">See all</button></div>
        <div class="hscroll">${cards || '<div class="empty" style="margin:0">No upcoming dates found.</div>'}</div>
        <div class="sec"><h3>Your set status</h3>${sets.length ? '<button data-act="gotoFestivals">+ Add</button>' : ''}</div>
        ${rows ? `<div class="list">${rows}</div>` : `<div class="empty"><b>Nothing scheduled yet</b>Pick a festival once and we'll remind you every year.<br><button class="btn primary" data-act="gotoFestivals">${icons.plus.replace('<svg', '<svg width="20" height="20"')} Add your first status</button></div>`}
        <div style="height:16px"></div></div>${nav('home')}`,
      after: () => { hydrateThumbs(); hydrateAvatar(); },
    };
  },

  festivals() {
    const f = ui.filter;
    const chips = [['all', 'All'], ['festival', 'Festivals'], ['national', 'National'], ['day', 'Special days'], ['set', 'My status']]
      .map(([id, l]) => `<button class="chip ${f === id ? 'on' : ''}" data-act="setFilter" data-f="${id}">${l}</button>`).join('');
    const items = allFestivals().map((x) => ({ x, d: nextDate(x, today(), state.sets[x.id] && state.sets[x.id].overrides) }))
      .filter(({ x }) => f === 'all' || (f === 'set' ? !!state.sets[x.id] : f === 'day' ? x.kind === 'day' || x.kind === 'custom' : x.kind === f))
      .sort((a, b) => (a.d ? a.d.getTime() : 9e15) - (b.d ? b.d.getTime() : 9e15));
    return { html: `<div class="screen">${topbar('Festivals & days', `<button class="iconbtn" data-act="addEvent" aria-label="Add your own event">${icons.plus}</button>`)}
      <div class="chips">${chips}</div>
      <div class="list" style="padding-bottom:30px">${items.map(({ x }) => frow(x)).join('') || '<div class="empty"><b>Nothing here yet</b>Turn on a festival to see it here.</div>'}
      <button class="empty" style="margin:4px 0 0;cursor:pointer" data-act="addEvent"><b>＋ Add your own event</b>Anniversary, birthday, sale day…</button></div></div>` };
  },

  calendar() {
    const now = today(); if (!ui.cal) ui.cal = { y: now.getFullYear(), m: now.getMonth(), sel: ymd(now) };
    const { y, m } = ui.cal, first = new Date(y, m, 1), last = new Date(y, m + 1, 0);
    const ev = {};
    for (const f of allFestivals()) for (const d of occurrences(f, first, last, (state.sets[f.id] && state.sets[f.id].overrides) || {})) (ev[ymd(d)] = ev[ymd(d)] || []).push(f);
    let cells = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => `<div class="dow">${d}</div>`).join('') + '<div class="d off"></div>'.repeat(first.getDay());
    for (let n = 1; n <= last.getDate(); n++) {
      const k = ymd(new Date(y, m, n)), es = ev[k] || [];
      cells += `<button class="d ${k === ymd(now) ? 'now' : ''} ${k === ui.cal.sel ? 'sel' : ''}" data-act="calSel" data-d="${k}">${n}${es.length ? `<span class="dots">${es.slice(0, 3).map((f) => `<i class="${state.sets[f.id] ? 'set' : ''}"></i>`).join('')}</span>` : ''}</button>`;
    }
    const sel = ev[ui.cal.sel] || [], sd = parseYmd(ui.cal.sel);
    return {
      html: `<div class="screen hasnav"><div class="calhead"><h2>${first.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h2><div style="display:flex"><button class="iconbtn" data-act="calMove" data-n="-1">${icons.chevL}</button><button class="iconbtn" data-act="calMove" data-n="1">${icons.chevR}</button></div></div>
        <div class="cal">${cells}</div>
        <div class="sec" style="padding-top:12px"><h3>${fmtDate(sd, { weekday: 'long', day: 'numeric', month: 'short' })}</h3></div>
        <div class="list">${sel.map(frow).join('') || `<div class="empty" style="margin:0"><b>No festival on this day</b>Add your own event, like an anniversary or sale.<br><button class="btn ghost sm" data-act="addEvent" data-date="${ui.cal.sel}">＋ Add event</button></div>`}</div>
        <div style="height:16px"></div></div>${nav('calendar')}` };
  },

  me() {
    const u = state.user, biz = isBusiness(u);
    const planText = isPro() ? (onTrial() ? `Free trial · ${trialDaysLeft()} day${trialDaysLeft() === 1 ? '' : 's'} left` : 'Swagatam Pro') : 'Free plan';
    const planSub = isPro() ? 'All designs and your logo are unlocked.' : '3 designs and your photo are free. Unlock every design and your logo with Pro.';
    return {
      html: `<div class="screen hasnav"><div class="profhead"><div class="avatar" data-avatar>${esc((brandOf(u) || '?').charAt(0).toUpperCase())}</div><h2>${esc(brandOf(u))}</h2><span class="hint">+91 ${esc(u.mobile)}</span></div>
        <div class="planbox"><h3>${planText}</h3><p>${planSub}</p><button class="btn primary" data-act="gotoPro">${isPro() && !onTrial() ? 'Manage plan' : 'See Pro plans'}</button></div>
        <div class="card"><h4>Your details</h4>${typeSeg(biz)}
          <label class="field"><span>Your name</span><input class="input" data-bind="uname" value="${esc(u.name)}" maxlength="40" autocapitalize="words"></label>
          <label class="field" id="brandField" style="${biz ? '' : 'display:none'}"><span>Brand name</span><input class="input" data-bind="ubrand" value="${esc(u.brand)}" maxlength="40" autocapitalize="words"></label>
          <label class="field" style="margin-bottom:0"><span>Daily reminder time</span><input class="input" type="time" data-bind="unotify" value="${esc(u.notifyTime || '07:30')}"></label></div>
        <div class="card"><h4>${biz ? 'Brand logo' : 'Your logo or photo'} <span class="pro-tag">PRO</span></h4>
          <div class="toggle-row"><img class="picthumb" id="logoThumb" alt="" style="display:none"><div class="grow"><b id="logoTitle">No logo yet</b><small>Shown on your statuses when you turn it on.</small></div>
          ${isPro() ? `<label class="btn ghost sm filebtn">Upload<input type="file" accept="image/*" data-bind="logoFile"></label>` : '<button class="btn ghost sm" data-act="gotoPro">Unlock</button>'}</div></div>
        <div style="padding:0 20px 20px"><div class="row2"><button class="btn ghost" data-act="logout">Log out</button><button class="btn danger" data-act="clearData">Clear data</button></div><p class="hint" style="text-align:center;margin-top:12px">Swagatam 1.0 · ${esc(TAGLINE)}</p></div></div>${nav('me')}`,
      after: () => { hydrateAvatar(); hydrateLogoThumb(); },
    };
  },

  config(id) {
    const f = getFestival(id); if (!f) { location.replace('#/home'); return { html: '' }; }
    if (!draft || draft.fid !== id) draft = newDraft(f);
    const s = draft.set, custom = f.kind === 'custom', pro = isPro();
    const tpls = TEMPLATES.map((t, i) => { const locked = i >= FREE_TEMPLATES && !pro; return `<button class="tpl ${s.template === i ? 'on' : ''}" data-act="pickTpl" data-i="${i}"><div class="t" data-tpl="${i}">${locked ? '<div class="lock">🔒</div>' : ''}</div>${t.name}${i >= FREE_TEMPLATES ? ' <span class="pro-tag">PRO</span>' : ''}</button>`; }).join('');
    const lang = (v, l) => `<button class="chip ${s.lang === v ? 'on' : ''}" data-act="setLang" data-v="${v}">${l}</button>`;
    return {
      html: `<div class="screen">${topbar(`Set status`)}
        <div class="pvwrap"><div class="pv" id="pv"></div></div>
        <div class="card"><h4>${f.emoji} Event &amp; date</h4>
          <label class="field"><span>Event</span><input class="input" data-bind="evName" value="${esc(draft.name)}" ${custom ? 'maxlength="40"' : 'disabled'}></label>
          <label class="field" style="margin-bottom:0"><span>Date</span><input class="input" type="date" data-bind="evDate" value="${draft.date}" min="${ymd(today())}"></label>
          <p class="hint" style="margin-top:8px">${custom ? 'Repeats every year on this date.' : isLunar(f) ? 'Repeats every year. Dates follow the common panchang — change it if your region celebrates on another day.' : 'Repeats every year on this date.'}</p></div>
        <div class="card"><h4>Choose template <small>${FREE_TEMPLATES} free · then Pro</small></h4><div class="tplrow">${tpls}</div></div>
        <div class="card"><h4>Your photo <small>Free</small></h4>
          <div class="toggle-row"><img class="picthumb" id="picThumb" alt="" style="${draft.picUrl ? '' : 'display:none'}" src="${draft.picUrl || ''}"><div class="grow"><b>${draft.picBlob ? 'Photo added' : 'Add a photo'}</b><small>Your product, shop or you. Looks best in portrait.</small></div>
          <label class="btn ghost sm filebtn">${draft.picBlob ? 'Change' : 'Choose'}<input type="file" accept="image/*" data-bind="picFile"></label></div>
          ${draft.picBlob ? '<button class="btn link" data-act="removePic">Remove photo</button>' : ''}</div>
        <div class="card"><h4>Brand</h4>
          <div class="toggle-row"><div class="grow"><b>Show my logo <span class="pro-tag">PRO</span></b><small>${state.user.hasLogo || draft.logo ? 'Replaces the letter badge.' : 'Upload your logo in Profile first.'}</small></div><button class="switch ${s.useLogo ? 'on' : ''}" data-act="toggleLogo" aria-label="Show my logo"></button></div>
          <div class="toggle-row"><div class="grow"><b>Show my mobile number</b><small>+91 ${esc(state.user.mobile)} on the poster</small></div><button class="switch ${s.showPhone ? 'on' : ''}" data-act="togglePhone" aria-label="Show my mobile number"></button></div></div>
        <div class="card"><h4>Greeting</h4><div class="chips" style="padding:0 0 10px">${lang('both', 'English + हिन्दी')}${lang('en', 'English')}${lang('hi', 'हिन्दी')}</div>
          <label class="field" style="margin-bottom:0"><span>Your own line (optional)</span><textarea class="input" data-bind="message" maxlength="140" placeholder="e.g. Flat 20% off on all sweets today!">${esc(s.message)}</textarea></label></div>
        ${custom ? '<div style="padding:0 20px"><button class="btn link" data-act="deleteCustom" style="color:var(--danger)">Delete this event</button></div>' : ''}
        <div class="bottombar"><button class="btn primary" data-act="saveSet">${draft.isNew ? 'Save &amp; schedule' : 'Save changes'}</button></div></div>`,
      after: () => { hydrateConfig(); },
    };
  },

  status(id) {
    const f = getFestival(id), set = getSet(id);
    if (!f || !set) { location.replace('#/home'); return { html: '' }; }
    const d = nextDate(f, today(), set.overrides), t = TEMPLATES[effective(set).template];
    return {
      html: `<div class="screen">${topbar(f.name)}
        <div class="bigpv" id="bigpv"></div>
        <div class="pad" style="text-align:center;margin-bottom:14px"><span class="chip">📅 ${d ? fmtDate(d, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Date not set'}</span> <span class="chip">${esc(t.name)}</span>
          <p class="hint" style="margin-top:10px">${d ? `We'll remind you at ${hhmm12(state.user.notifyTime)} on the day — and every year after.` : ''}</p></div>
        <div class="pad" style="display:grid;gap:10px;padding-bottom:30px">
          <button class="btn primary" data-act="shareNow" data-id="${id}">${icons.share.replace('<svg', '<svg width="22" height="22"')} Share to WhatsApp Status</button>
          <button class="btn ghost" data-act="editStatus" data-id="${id}">Edit design</button>
          <button class="btn link" data-act="removeSet" data-id="${id}" style="color:var(--danger);margin:0 auto">Remove this status</button></div></div>`,
      after: async () => { await ensureFonts(); const el = document.getElementById('bigpv'); if (!el) return; el.replaceChildren(renderPoster(await posterOpts(f, set), 0.5)); },
    };
  },

  pro() {
    const sel = PLANS.find((p) => p.id === ui.plan) || PLANS[1];
    return { html: `<div class="screen">${topbar('Swagatam Pro')}
      <div class="pad"><h1 style="font-size:32px;margin:6px 0 4px">Make every status yours ✨</h1><p class="hint" style="margin-bottom:16px;font-size:16px">${onTrial() ? `Your free trial has ${trialDaysLeft()} day${trialDaysLeft() === 1 ? '' : 's'} left.` : 'Unlock everything and keep your scheduled statuses looking their best.'}</p>
      <ul class="ticks"><li>All ${TEMPLATES.length} designs, plus every new one we add</li><li>Your own logo on every status</li><li>Everything you've scheduled keeps working</li></ul>
      ${PLANS.map((p) => `<button class="plan ${p.id === sel.id ? 'on' : ''}" data-act="selectPlan" data-id="${p.id}"><span class="radio"></span><div><b>${p.name}</b><small>${p.sub}</small></div><span class="price">₹${p.price}</span></button>`).join('')}
      </div><div class="bottombar"><button class="btn primary" data-act="buyPlan" data-id="${sel.id}">Unlock Pro · ₹${sel.price}</button>${DEMO_BILLING ? '<div class="hint">Preview build: no payment is taken yet.</div>' : ''}</div></div>` };
  },
};

// ---------- data helpers ----------
function newDraft(f) {
  const existing = getSet(f.id), set = existing ? { ...defaultSet(), ...existing, overrides: { ...(existing.overrides || {}) } } : defaultSet();
  const d = nextDate(f, today(), set.overrides);
  return { fid: f.id, isNew: !existing, set, name: f.name, date: d ? ymd(d) : '', pic: null, picBlob: null, picUrl: '', picDirty: false, logo: null, tpl: [] };
}

async function posterOpts(f, set) {
  return { festival: f, set: effective(set), user: posterUser(), pic: set.hasPic ? await getImage('pic:' + f.id) : null, logo: await getImage('logo'), art: await getArt(f), decor: await getDecor(f) };
}

async function hydrateThumbs() {
  await ensureFonts();
  for (const el of [...app.querySelectorAll('[data-thumb]')]) {
    const f = getFestival(el.dataset.thumb), set = f && getSet(f.id); if (!set) continue;
    const c = renderPoster(await posterOpts(f, set), 0.25);
    if (el.isConnected) el.replaceChildren(c);
  }
}

async function hydrateAvatar() {
  const img = await getImage('logo'), el = app.querySelector('[data-avatar]');
  if (img && el && isPro()) el.innerHTML = `<img src="${img.src}" alt="">`;
}
async function hydrateLogoThumb() {
  const img = await getImage('logo'), t = document.getElementById('logoThumb'), l = document.getElementById('logoTitle');
  if (img && t) { t.src = img.src; t.style.display = ''; l.textContent = 'Logo added'; }
}

function draftOpts() {
  const f = getFestival(draft.fid);
  return { festival: { ...f, name: draft.name || f.name }, set: effective({ ...draft.set, hasPic: !!draft.pic }), user: posterUser(), pic: draft.pic, logo: draft.logo, art: draft.art, decor: draft.decor };
}
function refreshPreview() {
  const el = document.getElementById('pv'); if (!el || !draft) return;
  el.replaceChildren(renderPoster(draftOpts(), 0.5));
}
function drawTemplateThumbs() {
  document.querySelectorAll('[data-tpl]').forEach((el) => {
    const i = +el.dataset.tpl; if (!draft.tpl[i]) return;
    const keep = el.querySelector('.lock'); el.replaceChildren(cloneCanvas(draft.tpl[i])); if (keep) el.appendChild(keep);
  });
}
function cloneCanvas(c) { const n = document.createElement('canvas'); n.width = c.width; n.height = c.height; n.getContext('2d').drawImage(c, 0, 0); return n; }
async function buildTemplateThumbs() {
  const o = draftOpts();
  draft.tpl = TEMPLATES.map((_, i) => renderPoster({ ...o, set: { ...o.set, template: i } }, 0.14));
  drawTemplateThumbs();
}
async function hydrateConfig() {
  await ensureFonts();
  if (!draft.loaded) {
    draft.loaded = true;
    draft.logo = await getImage('logo'); state.user.hasLogo = !!draft.logo;
    { const f = getFestival(draft.fid); draft.art = await getArt(f); draft.decor = await getDecor(f); }
    if (!draft.picBlob && draft.set.hasPic) { draft.picBlob = await blobs.get('pic:' + draft.fid); }
    if (draft.picBlob && !draft.pic) { draft.picUrl = URL.createObjectURL(draft.picBlob); draft.pic = await getImage('pic:' + draft.fid); }
    refresh(); return;
  }
  refreshPreview();
  if (!draft.tpl.length || draft.tplStale) { draft.tplStale = false; await buildTemplateThumbs(); } else drawTemplateThumbs();
  const th = document.getElementById('picThumb'); if (th && draft.picUrl) { th.src = draft.picUrl; th.style.display = ''; }
}

// ---------- router ----------
function guard(name) {
  const u = state.user;
  if (!u) return name === 'auth' ? null : '#/auth';
  if (u.stage === 'offer') return name === 'offer' ? null : '#/offer';
  if (u.stage === 'profile') return name === 'profile-setup' ? null : '#/profile-setup';
  if (['auth', 'offer', 'profile-setup'].includes(name)) return '#/home';
  return null;
}
const parseHash = () => { const [name, arg] = location.hash.replace(/^#\/?/, '').split('/'); return [name || 'home', arg && decodeURIComponent(arg)]; };

function render(keepScroll = false) {
  const [name, arg] = parseHash();
  const redirect = guard(name); if (redirect) { location.replace(redirect); return; }
  const screen = screens[name] || screens.home, key = name + '/' + (arg || '');
  const y = keepScroll ? window.scrollY : 0;
  const out = screen(arg); if (!out.html) return;
  app.innerHTML = out.html;
  if (keepScroll && key === lastKey && app.firstElementChild) app.firstElementChild.classList.add('noanim');
  lastKey = key; window.scrollTo(0, y);
  try { if (window.SwInsets && window.SwInsets.statusIcons) window.SwInsets.statusIcons(name !== 'auth'); } catch (e) { /* not on Android */ }
  if (out.after) out.after();
}
const refresh = () => render(true);
const go = (h) => { location.hash = h; };
const goReplace = (h) => { if (location.hash === h) render(); else location.replace(h); };   // hashchange renders for us

// ---------- actions ----------
const $ = (id) => document.getElementById(id);
const setErr = (m) => { const e = $('err'); if (e) e.textContent = m || ''; };

const actions = {
  async sendOtp() {
    const m = ($('mobile').value || '').replace(/\D/g, ''); ui.auth.mobile = m;
    if (!validMobile(m)) return setErr('Enter a valid 10-digit mobile number.');
    const done = busy('Sending OTP…'); try { await sendOtp(m); } finally { done(); }
    ui.auth.step = 'otp'; refresh(); setTimeout(() => { const o = $('otp'); if (o) o.focus(); }, 60);
  },
  async verifyOtp() {
    const code = ($('otp').value || '').trim(); if (code.length < 6) return setErr('Enter the 6-digit code.');
    const done = busy('Verifying…'); let ok; try { ok = await verifyOtp(ui.auth.mobile, code); } finally { done(); }
    if (!ok) return setErr('That code is not right. Try again.');
    const saved = state.saved;
    if (saved && saved.mobile === ui.auth.mobile) {
      state.user = { ...saved, stage: 'ready' }; delete state.saved; save(); scheduleReminders();
      ui.auth = { step: 'phone', mobile: '' }; toast('Welcome back! Your statuses are here.'); goReplace('#/home'); return;
    }
    if (saved) resetAll();   // different number: never carry someone else's data over
    state.user = { mobile: ui.auth.mobile, name: '', brand: '', type: 'business', stage: 'offer', notifyTime: '07:30', trialEndsAt: 0, proUntil: 0 }; save();
    ui.auth = { step: 'phone', mobile: '' }; goReplace('#/offer');
  },
  changeNumber() { ui.auth.step = 'phone'; refresh(); },
  startTrial() { startTrial(); state.user.stage = 'profile'; save(); goReplace('#/profile-setup'); },
  skipTrial() { state.user.stage = 'profile'; save(); goReplace('#/profile-setup'); },
  finishProfile() {
    const biz = ui.ptype !== 'personal', name = $('pname').value.trim(), brand = $('pbrand').value.trim();
    if (!name) return setErr('Please enter your name.');
    if (biz && !brand) return setErr('Please enter your brand name.');
    Object.assign(state.user, { name, brand: biz ? brand : '', type: biz ? 'business' : 'personal', stage: 'ready' }); save(); goReplace('#/home');
  },
  setType(d) {
    if (state.user.stage === 'profile') {   // onboarding: flip the form in place so nothing typed is lost
      ui.ptype = d.v; setErr('');
      document.querySelectorAll('[data-act=setType]').forEach((b) => b.classList.toggle('on', b.dataset.v === d.v));
      const bf = $('brandField'); if (bf) bf.style.display = d.v === 'business' ? '' : 'none';
    } else { state.user.type = d.v; save(); scheduleReminders(); refresh(); }
  },
  nav(d) { goReplace('#/' + d.tab); },
  back() { if (history.length > 1) history.back(); else goReplace('#/home'); },
  gotoPro() { go('#/pro'); },
  gotoFestivals() { go('#/festivals'); },
  setFilter(d) { ui.filter = d.f; refresh(); },
  openFest(d) { if (getSet(d.id)) go('#/status/' + d.id); else actions.newSet(d); },
  newSet(d) { draft = null; go('#/config/' + d.id); },
  async toggleFest(d, e) {
    e.stopPropagation();
    if (getSet(d.id)) { dropSet(d.id); await scheduleReminders(); toast('Status removed'); refresh(); } else actions.newSet(d);
  },
  editStatus(d) { draft = null; go('#/config/' + d.id); },
  async removeSet(d) { if (!(await confirmSheet('Remove this status?', 'It will no longer be scheduled or remind you each year.', 'Remove', true))) return; dropSet(d.id); draft = null; await scheduleReminders(); goReplace('#/home'); toast('Status removed'); },

  // calendar
  calMove(d) { const c = ui.cal; const x = new Date(c.y, c.m + +d.n, 1); c.y = x.getFullYear(); c.m = x.getMonth(); c.sel = ymd(x); refresh(); },
  calSel(d) { ui.cal.sel = d.d; refresh(); },

  // custom events
  addEvent(d) {
    ui.emoji = '🎉';
    const emo = ['🎉', '🎂', '🏪', '🛍️', '💍', '🎓', '🏆', '🌟', '🎁', '❤️'];
    openSheet(`<h3>Add your own event</h3>
      <label class="field"><span>Event name</span><input class="input" id="cname" maxlength="40" placeholder="e.g. Shop anniversary" autocapitalize="sentences"></label>
      <label class="field"><span>Date (repeats every year)</span><input class="input" type="date" id="cdate" value="${(d && d.date) || ymd(today())}"></label>
      <div class="field"><span>Icon</span><div class="emojis">${emo.map((e, i) => `<button class="${i === 0 ? 'on' : ''}" data-act="pickEmoji" data-e="${e}">${e}</button>`).join('')}</div></div>
      <div class="err" id="cerr"></div><button class="btn primary" data-act="saveEvent">Continue</button>`);
    setTimeout(() => { const n = $('cname'); if (n) n.focus(); }, 80);
  },
  pickEmoji(d, e) { ui.emoji = d.e; document.querySelectorAll('.emojis button').forEach((b) => b.classList.toggle('on', b === e.target.closest('button'))); },
  saveEvent() {
    const name = $('cname').value.trim(), date = $('cdate').value;
    if (!name) { $('cerr').textContent = 'Give your event a name.'; return; } if (!date) { $('cerr').textContent = 'Pick a date.'; return; }
    const f = addCustom({ name, date, emoji: ui.emoji }); closeSheet(); draft = null; go('#/config/' + f.id);
  },
  async deleteCustom() {
    if (!(await confirmSheet('Delete this event?', 'The event and its scheduled status will be removed.', 'Delete', true))) return;
    removeCustom(draft.fid); draft = null; await scheduleReminders(); goReplace('#/festivals');
  },

  // config
  pickTpl(d) {
    const i = +d.i; if (i >= FREE_TEMPLATES && !isPro()) { toast('That design is part of Pro'); return go('#/pro'); }
    draft.set.template = i; refresh();
  },
  setLang(d) { draft.set.lang = d.v; refresh(); },
  togglePhone() { draft.set.showPhone = !draft.set.showPhone; refresh(); },
  toggleLogo() {
    if (!isPro()) { toast('Your logo is part of Pro'); return go('#/pro'); }
    if (!draft.logo) return toast('Upload your logo in Profile first');
    draft.set.useLogo = !draft.set.useLogo; refresh();
  },
  removePic() { draft.pic = null; draft.picBlob = null; draft.picUrl = ''; draft.picDirty = true; draft.tplStale = true; refresh(); },
  async saveSet() {
    const f = getFestival(draft.fid), s = { ...draft.set, hasPic: !!draft.picBlob };
    if (!draft.date) return toast('Pick a date for this status');
    const d = parseYmd(draft.date); if (d < today()) return toast('Pick today or a later date');
    if (f.kind === 'custom') { f.name = draft.name.trim() || f.name; f.fixed = draft.date.slice(5); s.overrides = {}; }
    else {
      const y = d.getFullYear(), def = dateFor(f, y), ov = {};
      for (const [yr, v] of Object.entries(s.overrides || {})) if (+yr >= today().getFullYear()) ov[yr] = v;
      if (def && ymd(def) === draft.date) delete ov[y]; else ov[y] = draft.date;
      s.overrides = ov;
    }
    if (draft.picDirty) { if (draft.picBlob) await blobs.put('pic:' + f.id, draft.picBlob); else await blobs.del('pic:' + f.id); }
    putSet(f.id, s); save();
    const asked = await notificationsAllowed(true); const n = await scheduleReminders();
    draft = null; goReplace('#/home');
    toast(asked || !n ? `${f.name} is set. We'll remind you every year.` : 'Saved. Turn on notifications to get reminders.', 3000);
  },

  // share
  async shareNow(d) {
    const f = getFestival(d.id), set = getSet(d.id); if (!f || !set) return;
    const done = busy('Preparing your status…');
    try {
      await ensureFonts();
      const c = renderPoster(await posterOpts(f, set), 1);
      const r = await sharePoster(c, `${f.id}-${new Date().getFullYear()}`, `${f.name} - ${brandOf(state.user)}`);
      if (r === 'downloaded') toast('Saved. Open WhatsApp > Status to post it.');
    } catch (e) { toast('Could not open sharing. Please try again.'); } finally { done(); }
  },

  // plans
  selectPlan(d) { ui.plan = d.id; refresh(); },
  async buyPlan(d) {
    const p = PLANS.find((x) => x.id === d.id); if (!p) return;
    // DEMO billing: replace with a real purchase (Google Play Billing / Razorpay) and only grant after it succeeds.
    grantPro(p.days); save(); toast('Pro unlocked. Thank you!'); history.length > 1 ? history.back() : goReplace('#/home');
  },

  async logout() {
    const mobile = state.user.mobile;
    if (!(await confirmSheet('Log out?', `Your statuses stay saved on this phone. Sign in again with +91 ${mobile} to get them back.`, 'Log out'))) return;
    state.saved = state.user; state.user = null; save();   // keep profile, statuses and images for the next sign-in
    draft = null; ui.auth = { step: 'phone', mobile: '' }; scheduleReminders(); goReplace('#/auth');
  },
  async clearData() {
    if (!(await confirmSheet('Clear all data?', 'This removes your profile, logo, photos and scheduled statuses from this phone and logs you out. It cannot be undone.', 'Clear data', true))) return;
    resetAll(); draft = null; ui.auth = { step: 'phone', mobile: '' }; ui.ptype = 'business'; scheduleReminders(); goReplace('#/auth');
  },
};

// ---------- events ----------
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  const fn = actions[t.dataset.act]; if (fn) fn(t.dataset, e);
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return; const t = e.target.closest('[data-enter]'); if (t) { e.preventDefault(); actions[t.dataset.enter](t.dataset, e); }
});

let pvTimer;
const schedulePreview = () => { clearTimeout(pvTimer); pvTimer = setTimeout(refreshPreview, 120); };

document.addEventListener('input', (e) => {
  const b = e.target.dataset && e.target.dataset.bind; if (!b || !draft) return;
  if (b === 'message') { draft.set.message = e.target.value; schedulePreview(); }
  if (b === 'evName') { draft.name = e.target.value; schedulePreview(); }
});

document.addEventListener('change', async (e) => {
  const el = e.target, b = el.dataset && el.dataset.bind; if (!b) return;
  if (b === 'evDate' && draft) draft.date = el.value;
  else if (b === 'picFile' && draft && el.files[0]) {
    const done = busy('Adding photo…');
    try {
      draft.picBlob = await shrink(el.files[0], 1400); draft.picUrl = URL.createObjectURL(draft.picBlob); draft.picDirty = true;
      await blobs.put('pic:draft', draft.picBlob); draft.pic = await getImage('pic:draft'); draft.tplStale = true; refresh();
    } catch (err) { toast('That photo could not be opened.'); } finally { done(); el.value = ''; }
  } else if (b === 'logoFile' && el.files[0]) {
    const done = busy('Saving logo…');
    try { await blobs.put('logo', await shrink(el.files[0], 600, 'image/png')); if (draft) { draft.logo = await getImage('logo'); draft.tplStale = true; } toast('Logo saved'); refresh(); }
    catch (err) { toast('That logo could not be opened.'); } finally { done(); el.value = ''; }
  } else if (b === 'uname' || b === 'ubrand') {
    const v = el.value.trim(); if (!v) { el.value = state.user[b === 'uname' ? 'name' : 'brand']; return toast('This cannot be empty'); }
    state.user[b === 'uname' ? 'name' : 'brand'] = v; save(); toast('Saved'); scheduleReminders();
  } else if (b === 'unotify' && el.value) { state.user.notifyTime = el.value; save(); await scheduleReminders(); toast(`Reminders at ${hhmm12(el.value)}`); }
});

window.addEventListener('hashchange', () => { closeSheet(); render(); });
// the keyboard no longer resizes the page on newer Android, so bring the focused field into view ourselves
document.addEventListener('focusin', (e) => { if (e.target.matches && e.target.matches('input, textarea')) setTimeout(() => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 320); });

// ---------- boot ----------
function applyInsets(top, bottom, kb) {
  const r = document.documentElement.style; r.setProperty('--sat', top + 'px'); r.setProperty('--sab', bottom + 'px'); r.setProperty('--kb', kb + 'px');
}
window.__setInsets = applyInsets;   // Android's MainActivity pushes system-bar / keyboard sizes here
try { if (window.SwInsets) { const [t, b, k] = window.SwInsets.get().split(',').map(Number); applyInsets(t, b, k); } } catch (e) { /* ignore */ }

async function boot() {
  app.innerHTML = `<div class="screen dark-screen splash">${logo()}<h1>Swagatam</h1><div class="tag">${TAGLINE}</div></div>`;
  await Promise.all([ensureFonts(), new Promise((r) => setTimeout(r, 1100))]);
  render();
  onNotificationTap((fid) => { if (state.user && state.user.stage === 'ready' && getSet(fid)) go('#/status/' + fid); });
  scheduleReminders();
}
boot();
