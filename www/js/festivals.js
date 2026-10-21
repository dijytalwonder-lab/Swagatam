// Festival & special-day data. Lunar festivals list their date per year ("MM-DD"); fixed days repeat
// every year; "nth" days are the Nth weekday of a month. Add a new year to a festival's `dates` table
// (or ship it as a remote JSON later) and the whole app picks it up - nothing else to change.
// Lunar dates follow the commonly published panchang; regions can differ by a day, so users can
// override the date for a single occurrence on the config screen.

const DEFAULT_WISH = {
  festival: ['Wishing you and your family joy, peace and prosperity.', 'आपको और आपके परिवार को सुख, शांति और समृद्धि की शुभकामनाएँ।'],
  national: ['Celebrating our nation with pride, together.', 'आइए गर्व से मनाएँ, साथ मिलकर।'],
  day: ['Sending warm wishes your way.', 'आपको ढेर सारी शुभकामनाएँ।'],
  custom: ['', ''],
};

// F(id, english, hindi, emoji, kind, [top, bottom, accent], when, extra)
const F = (id, name, hi, emoji, kind, p, when, extra = {}) => ({ id, name, hi, emoji, kind, p, ...when, ...extra });
const dates = (d) => ({ dates: d });
const fixed = (md) => ({ fixed: md });
const nth = (month, weekday, n) => ({ nth: [month, weekday, n] });

export const FESTIVALS = [
  F('new-year', 'Happy New Year', 'नववर्ष की शुभकामनाएँ', '🎆', 'day', ['#1b1464', '#7b2cbf', '#ffd166'], fixed('01-01'), { wish: 'May the year ahead bring you health, happiness and success.', wishHi: 'नया साल आपके जीवन में स्वास्थ्य, खुशियाँ और सफलता लाए।' }),
  F('makar-sankranti', 'Happy Makar Sankranti', 'मकर संक्रांति की शुभकामनाएँ', '🪁', 'festival', ['#0b5fa5', '#f59e0b', '#fff3bf'], dates({ 2026: '01-14', 2027: '01-15', 2028: '01-15' })),
  F('pongal', 'Happy Pongal', 'पोंगल की शुभकामनाएँ', '🌾', 'festival', ['#7a3e00', '#e8a317', '#fff3bf'], dates({ 2026: '01-14', 2027: '01-15', 2028: '01-15' })),
  F('vasant-panchami', 'Happy Vasant Panchami', 'वसंत पंचमी की शुभकामनाएँ', '🌼', 'festival', ['#b7791f', '#f6c90e', '#fff9db'], dates({ 2026: '01-23', 2027: '02-11', 2028: '01-31' })),
  F('republic-day', 'Happy Republic Day', 'गणतंत्र दिवस की शुभकामनाएँ', '🇮🇳', 'national', ['#ff9933', '#138808', '#0b2a6f'], fixed('01-26')),
  F('valentines', "Happy Valentine's Day", 'वैलेंटाइन डे की शुभकामनाएँ', '💝', 'day', ['#7a0f3b', '#e64980', '#ffd6e0'], fixed('02-14'), { wish: 'Spread the love, today and every day.', wishHi: 'प्यार बाँटिए, आज और हर दिन।' }),
  F('maha-shivaratri', 'Happy Maha Shivaratri', 'महाशिवरात्रि की हार्दिक शुभकामनाएँ', '🔱', 'festival', ['#0f1b3d', '#3b5bdb', '#dbe4ff'], dates({ 2026: '02-15', 2027: '03-06', 2028: '02-23' }), { wish: 'Om Namah Shivaya. May Mahadev bless you with strength and peace.', wishHi: 'ॐ नमः शिवाय। महादेव आपको शक्ति और शांति दें।' }),
  F('womens-day', "Happy Women's Day", 'महिला दिवस की शुभकामनाएँ', '👩', 'day', ['#5f0f6e', '#d6336c', '#ffe3ec'], fixed('03-08'), { wish: 'Here is to strong women - may we know them, be them, raise them.', wishHi: 'हर सशक्त महिला को सलाम।' }),
  F('holi', 'Happy Holi', 'होली की हार्दिक शुभकामनाएँ', '🎨', 'festival', ['#7c1d6f', '#e64980', '#ffd43b'], dates({ 2026: '03-04', 2027: '03-22', 2028: '03-10' }), { wish: 'May your life be filled with colours of joy and togetherness.', wishHi: 'आपका जीवन खुशियों और अपनों के रंगों से भरा रहे।' }),
  F('ugadi', 'Happy Ugadi & Gudi Padwa', 'उगादी व गुड़ी पड़वा की शुभकामनाएँ', '🌿', 'festival', ['#0b6e4f', '#f4a300', '#fff3bf'], dates({ 2026: '03-19', 2027: '04-07', 2028: '03-27' })),
  F('eid-fitr', 'Eid Mubarak', 'ईद मुबारक', '🌙', 'festival', ['#053b3a', '#0f766e', '#f5d782'], dates({ 2026: '03-21', 2027: '03-10', 2028: '02-27' }), { wish: 'May Allah accept your prayers and fill your home with happiness.', wishHi: 'अल्लाह आपकी दुआएँ क़ुबूल करे और आपका घर खुशियों से भर दे।' }),
  F('ram-navami', 'Happy Ram Navami', 'राम नवमी की हार्दिक शुभकामनाएँ', '🏹', 'festival', ['#7a2e00', '#e8590c', '#ffe8cc'], dates({ 2026: '03-26', 2027: '04-15', 2028: '04-03' }), { wish: 'Jai Shri Ram. May Lord Ram guide you on the path of truth.', wishHi: 'जय श्री राम। प्रभु श्रीराम आपको सत्य के मार्ग पर चलाएँ।' }),
  F('mahavir-jayanti', 'Happy Mahavir Jayanti', 'महावीर जयंती की शुभकामनाएँ', '☸️', 'festival', ['#9c4a00', '#f0a500', '#fff4cc'], dates({ 2026: '03-31', 2027: '04-18', 2028: '04-07' }), { wish: 'Live and let live. Peace and non-violence for all.', wishHi: 'जियो और जीने दो। सबको शांति और अहिंसा मिले।' }),
  F('hanuman-jayanti', 'Happy Hanuman Jayanti', 'हनुमान जयंती की शुभकामनाएँ', '🙏', 'festival', ['#8a1c00', '#f76707', '#ffe8cc'], dates({ 2026: '04-02', 2027: '04-20', 2028: '04-09' }), { wish: 'Jai Bajrangbali. May he remove every obstacle from your path.', wishHi: 'जय बजरंगबली। वे आपके हर संकट को दूर करें।' }),
  F('easter', 'Happy Easter', 'ईस्टर की शुभकामनाएँ', '🐣', 'festival', ['#5f3dc4', '#f783ac', '#fff3bf'], dates({ 2026: '04-05', 2027: '03-28', 2028: '04-16' }), { wish: 'Wishing you a season of new beginnings and hope.', wishHi: 'नई शुरुआत और उम्मीदों से भरा ईस्टर मुबारक।' }),
  F('baisakhi', 'Happy Baisakhi', 'बैसाखी की हार्दिक शुभकामनाएँ', '🌾', 'festival', ['#1c5d99', '#f4b400', '#fff3bf'], fixed('04-14')),
  F('akshaya-tritiya', 'Happy Akshaya Tritiya', 'अक्षय तृतीया की शुभकामनाएँ', '🪙', 'festival', ['#6b3a00', '#d4a017', '#fff3bf'], dates({ 2026: '04-19', 2027: '05-09' }), { wish: 'May prosperity and good fortune never diminish.', wishHi: 'सुख-समृद्धि कभी कम न हो।' }),
  F('labour-day', 'Happy Labour Day', 'श्रमिक दिवस की शुभकामनाएँ', '🛠️', 'day', ['#7f1d1d', '#e8590c', '#ffe8cc'], fixed('05-01'), { wish: 'Salute to every hand that builds our tomorrow.', wishHi: 'हर उस हाथ को सलाम जो हमारा कल बनाता है।' }),
  F('buddha-purnima', 'Happy Buddha Purnima', 'बुद्ध पूर्णिमा की शुभकामनाएँ', '🪷', 'festival', ['#1d3557', '#a8dadc', '#fff3bf'], dates({ 2026: '05-01', 2027: '05-20', 2028: '05-08' }), { wish: 'May peace and compassion light your path.', wishHi: 'शांति और करुणा आपके जीवन को रोशन करें।' }),
  F('mothers-day', "Happy Mother's Day", 'मदर्स डे की शुभकामनाएँ', '🌸', 'day', ['#8a2a5c', '#f783ac', '#ffe3ec'], nth(5, 0, 2), { wish: 'To the heart of every home - thank you, Maa.', wishHi: 'हर घर की धड़कन, माँ को प्रणाम।' }),
  F('eid-adha', 'Eid al-Adha Mubarak', 'ईद-उल-अज़हा मुबारक', '🕌', 'festival', ['#052e2b', '#2b8a3e', '#f5d782'], dates({ 2026: '05-27', 2027: '05-17', 2028: '05-06' }), { wish: 'May the spirit of sacrifice and sharing bless your home.', wishHi: 'क़ुर्बानी और भाईचारे की भावना आपके घर को बरकत दे।' }),
  F('fathers-day', "Happy Father's Day", 'फादर्स डे की शुभकामनाएँ', '👔', 'day', ['#0b2545', '#1c7ed6', '#d0ebff'], nth(6, 0, 3), { wish: 'To the hero who taught us everything - thank you, Papa.', wishHi: 'हमें सब कुछ सिखाने वाले हमारे हीरो, पापा को धन्यवाद।' }),
  F('raksha-bandhan', 'Happy Raksha Bandhan', 'रक्षाबंधन की हार्दिक शुभकामनाएँ', '🧵', 'festival', ['#8a1c4a', '#f08c00', '#fff3bf'], dates({ 2026: '08-28', 2027: '08-17', 2028: '08-05' }), { wish: 'A bond of love that no distance can break.', wishHi: 'प्यार का वह बंधन जिसे कोई दूरी तोड़ नहीं सकती।' }),
  F('friendship-day', 'Happy Friendship Day', 'फ्रेंडशिप डे की शुभकामनाएँ', '🤝', 'day', ['#0c8599', '#f59f00', '#e3fafc'], nth(8, 0, 1), { wish: 'Cheers to the friends who make life brighter.', wishHi: 'उन दोस्तों के नाम जो ज़िंदगी को खूबसूरत बनाते हैं।' }),
  F('independence-day', 'Happy Independence Day', 'स्वतंत्रता दिवस की हार्दिक शुभकामनाएँ', '🇮🇳', 'national', ['#ff9933', '#138808', '#0b2a6f'], fixed('08-15'), { wish: 'Jai Hind! Proud to be Indian, today and always.', wishHi: 'जय हिंद! हमें भारतीय होने पर गर्व है।' }),
  F('onam', 'Happy Onam', 'ओणम की हार्दिक शुभकामनाएँ', '🌺', 'festival', ['#0b6e4f', '#f4b400', '#fff3bf'], dates({ 2026: '08-26', 2027: '09-12', 2028: '09-01' })),
  F('janmashtami', 'Happy Janmashtami', 'जन्माष्टमी की हार्दिक शुभकामनाएँ', '🦚', 'festival', ['#0b3c8a', '#4dabf7', '#fff3bf'], dates({ 2026: '09-04', 2027: '08-25', 2028: '08-13' }), { wish: 'Jai Shri Krishna. May Kanha fill your life with joy.', wishHi: 'जय श्री कृष्ण। कान्हा आपके जीवन को खुशियों से भर दें।' }),
  F('ganesh-chaturthi', 'Happy Ganesh Chaturthi', 'गणेश चतुर्थी की हार्दिक शुभकामनाएँ', '🐘', 'festival', ['#a61e4d', '#f76707', '#fff3bf'], dates({ 2026: '09-14', 2027: '09-04', 2028: '08-23' }), { wish: 'Ganpati Bappa Morya! May Vighnaharta remove all obstacles.', wishHi: 'गणपति बप्पा मोरया! विघ्नहर्ता आपके सारे विघ्न हरें।' }),
  F('teachers-day', "Happy Teachers' Day", 'शिक्षक दिवस की शुभकामनाएँ', '📚', 'day', ['#1864ab', '#74c0fc', '#fff9db'], fixed('09-05'), { wish: 'Thank you to the guides who light the way.', wishHi: 'राह रोशन करने वाले हर गुरु को नमन।' }),
  F('gandhi-jayanti', 'Gandhi Jayanti', 'गांधी जयंती', '🕊️', 'national', ['#364fc7', '#a5d8ff', '#fff9db'], fixed('10-02'), { wish: 'Be the change you wish to see in the world.', wishHi: 'वह बदलाव खुद बनिए जो आप दुनिया में देखना चाहते हैं।' }),
  F('navratri', 'Happy Navratri', 'नवरात्रि की हार्दिक शुभकामनाएँ', '🔆', 'festival', ['#8e0e3d', '#f76707', '#ffe066'], dates({ 2026: '10-11', 2027: '09-30', 2028: '09-19' }), { wish: 'Jai Mata Di. Nine nights of devotion, dance and blessings.', wishHi: 'जय माता दी। भक्ति, गरबा और आशीर्वाद की नौ रातें मुबारक।' }),
  F('dussehra', 'Happy Dussehra', 'दशहरा की हार्दिक शुभकामनाएँ', '🏹', 'festival', ['#7a1d00', '#e8590c', '#ffe066'], dates({ 2026: '10-20', 2027: '10-09', 2028: '09-27' }), { wish: 'May good always win over evil in your life.', wishHi: 'आपके जीवन में सदा बुराई पर अच्छाई की जीत हो।' }),
  F('karwa-chauth', 'Happy Karwa Chauth', 'करवा चौथ की हार्दिक शुभकामनाएँ', '🌕', 'festival', ['#6a0f2a', '#d6336c', '#ffe3ec'], dates({ 2026: '10-29', 2027: '10-18', 2028: '10-07' }), { wish: 'May your love grow stronger with every moonrise.', wishHi: 'हर चाँद के साथ आपका प्यार और गहरा हो।' }),
  F('dhanteras', 'Happy Dhanteras', 'धनतेरस की हार्दिक शुभकामनाएँ', '🪙', 'festival', ['#3b1d00', '#c2410c', '#fcd34d'], dates({ 2026: '11-06', 2027: '10-27', 2028: '10-15' }), { wish: 'May Goddess Lakshmi and Lord Kubera shower you with wealth.', wishHi: 'माँ लक्ष्मी और कुबेर देव आपको धन-धान्य से भरपूर करें।' }),
  F('diwali', 'Happy Diwali', 'दीपावली की हार्दिक शुभकामनाएँ', '🪔', 'festival', ['#3b0a45', '#d9480f', '#ffd43b'], dates({ 2026: '11-08', 2027: '10-29', 2028: '10-17' }), { wish: 'May the festival of lights fill your life with happiness and prosperity.', wishHi: 'रोशनी का यह पर्व आपके जीवन को खुशियों और समृद्धि से रोशन करे।' }),
  F('bhai-dooj', 'Happy Bhai Dooj', 'भाई दूज की हार्दिक शुभकामनाएँ', '👫', 'festival', ['#7a1d4a', '#f08c00', '#fff3bf'], dates({ 2026: '11-11', 2027: '10-31', 2028: '10-19' })),
  F('chhath', 'Happy Chhath Puja', 'छठ पूजा की हार्दिक शुभकामनाएँ', '🌅', 'festival', ['#7a2e00', '#f76707', '#ffe8cc'], dates({ 2026: '11-15', 2027: '11-04', 2028: '10-23' })),
  F('childrens-day', "Happy Children's Day", 'बाल दिवस की शुभकामनाएँ', '🎈', 'day', ['#0c8599', '#f783ac', '#fff3bf'], fixed('11-14'), { wish: 'Keep the child in you alive, always.', wishHi: 'अपने अंदर के बच्चे को हमेशा ज़िंदा रखिए।' }),
  F('guru-nanak', 'Happy Guru Nanak Jayanti', 'गुरु नानक जयंती की शुभकामनाएँ', '🪯', 'festival', ['#0b3c8a', '#f59f00', '#fff3bf'], dates({ 2026: '11-24', 2027: '11-14', 2028: '11-02' }), { wish: 'Waheguru Ji Ka Khalsa. May Guru Sahib bless you with peace.', wishHi: 'वाहेगुरु जी का खालसा। गुरु साहिब आपको शांति का आशीर्वाद दें।' }),
  F('christmas', 'Merry Christmas', 'क्रिसमस की शुभकामनाएँ', '🎄', 'festival', ['#0b3d2e', '#b3202a', '#ffd166'], fixed('12-25'), { wish: 'Wishing you love, laughter and a very merry Christmas.', wishHi: 'प्यार, हँसी और खुशियों से भरा क्रिसमस मुबारक।' }),
  F('new-years-eve', "New Year's Eve", 'नववर्ष की पूर्व संध्या', '🥂', 'day', ['#0a0a2e', '#4c1d95', '#ffd166'], fixed('12-31'), { wish: 'Thank you for a wonderful year. See you in the next one!', wishHi: 'शानदार साल के लिए शुक्रिया। नए साल में फिर मिलेंगे!' }),
  F('matsya-jayanti', 'Happy Matsya Jayanti', 'मत्स्य जयंती की शुभकामनाएँ', '🐟', 'festival', ['#06325c', '#1c8fb8', '#ffd166'], dates({ 2026: '03-21', 2027: '04-09', 2028: '03-29' }), { wish: 'Jai Shri Hari. May Lord Matsya protect and guide you.', wishHi: 'जय श्री हरि। भगवान मत्स्य आपकी रक्षा करें और राह दिखाएँ।' }),
  F('kurma-jayanti', 'Happy Kurma Jayanti', 'कूर्म जयंती की शुभकामनाएँ', '🐢', 'festival', ['#0b3d2e', '#2a9d8f', '#ffd166'], dates({ 2026: '05-01', 2027: '05-20', 2028: '05-08' }), { wish: 'May Lord Kurma give you the steadiness to carry every burden.', wishHi: 'भगवान कूर्म आपको हर बोझ उठाने की स्थिरता दें।' }),
];

// Illustrations (www/img/art/<name>.webp, built by scripts/prepare-art.js). Festivals without one fall back to their emoji.
const ART = {
  diwali: 'diya', dhanteras: 'pot-gold', 'akshaya-tritiya': 'treasure', 'vasant-panchami': 'marigold', 'ganesh-chaturthi': 'ganesha',
  janmashtami: 'krishna', 'matsya-jayanti': 'matsya', 'kurma-jayanti': 'kurma', easter: 'bunny', 'childrens-day': 'fairy', christmas: 'tree',
};
const DECOR = { diwali: 'garland', dhanteras: 'garland', 'bhai-dooj': 'garland', 'ganesh-chaturthi': 'garland', janmashtami: 'handi' };   // hang from the poster's top corners
for (const f of FESTIVALS) { if (ART[f.id]) f.art = ART[f.id]; if (DECOR[f.id]) f.decor = DECOR[f.id]; }

export const artUrl = (name) => (name ? `img/art/${name}.webp` : '');

export const PALETTE_CHOICES = [
  ['#3b0a45', '#d9480f', '#ffd43b'], ['#0b3d2e', '#2b8a3e', '#ffd166'], ['#0b2545', '#1c7ed6', '#ffd166'],
  ['#7a0f3b', '#e64980', '#ffd6e0'], ['#5f3dc4', '#f783ac', '#fff3bf'], ['#7a2e00', '#f59f00', '#fff3bf'],
];

export function wishFor(f) {
  const d = DEFAULT_WISH[f.kind] || DEFAULT_WISH.day;
  return { en: f.wish || d[0], hi: f.wishHi || d[1] };
}

const atMidnight = (y, m, d) => new Date(y, m - 1, d, 0, 0, 0, 0);

/** Date of the festival in `year`, or null when we don't have it for that year. */
export function dateFor(f, year) {
  if (f.fixed) { const [m, d] = f.fixed.split('-').map(Number); return atMidnight(year, m, d); }
  if (f.nth) {
    const [m, wd, n] = f.nth; const first = new Date(year, m - 1, 1).getDay();
    return atMidnight(year, m, 1 + ((wd - first + 7) % 7) + (n - 1) * 7);
  }
  const s = f.dates && f.dates[year];
  if (!s) return null;
  const [m, d] = s.split('-').map(Number); return atMidnight(year, m, d);
}

export const isLunar = (f) => !!f.dates;
export const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const daysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / 86400000);
export const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const parseYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return atMidnight(y, m, d); };

/** Every known occurrence of `f` from `from` through `to` (inclusive). An override { 'YYYY': 'YYYY-MM-DD' } wins for its year. */
export function occurrences(f, from, to, overrides = {}) {
  const out = [];
  for (let y = from.getFullYear(); y <= to.getFullYear(); y++) {
    const d = overrides[y] ? parseYmd(overrides[y]) : dateFor(f, y);
    if (d && d >= startOfDay(from) && d <= to) out.push(d);
  }
  return out;
}

export function nextDate(f, from = new Date(), overrides = {}) {
  const to = new Date(from.getFullYear() + 3, 11, 31);
  return occurrences(f, from, to, overrides)[0] || null;
}

export function fmtDate(d, opts) {
  return d.toLocaleDateString('en-IN', opts || { weekday: 'short', day: 'numeric', month: 'short' });
}

export function whenLabel(d, today = new Date()) {
  const n = daysBetween(today, d);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n < 0) return `${-n}d ago`;
  return `in ${n} days`;
}
