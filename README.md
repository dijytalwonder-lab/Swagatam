# Swagatam — schedule once, celebrate forever

Festival status maker for businesses and influencers. Pick a festival once; every year the app reminds you
(at your chosen time) with a poster ready in WhatsApp-Status size, carrying your brand, photo, logo and message.

Plain HTML/CSS/JS (no bundler) in `www/`, wrapped as an Android app with Capacitor 6.

## Flow (from the wireflow)
1. **Auth** — register with mobile number (+91) and OTP
2. **Onboarding** — "What we offer" + **Start free trial** (7 days of everything)
3. **Profile setup** — your name + brand name
4. **Landing** — upcoming holidays, your set status, bottom nav (Home / Calendar / Profile)
5. **Festival list** — toggle a festival to set its status (also reachable from the Calendar)
6. **Status configuration** — date + event, template (3 free, rest Pro), photo (free), logo (Pro), language, own line

Extras: custom yearly events (anniversary, sale day), English / हिन्दी / both, show mobile number, live preview,
share sheet (WhatsApp lists *My status*), per-year date override for moon-based festivals.

## Run in a browser
```
npm install
npm run dev        # http://localhost:5180
```
Demo OTP is `123456`.

## Build the Android APK
```
powershell -ExecutionPolicy Bypass -File build-android.ps1
```
Mirrors the project to `C:\sw-build` (Gradle dislikes OneDrive placeholders), adds the Android project, applies
`scripts/setup-android.js` (SDK 36, icons, splash, edge-to-edge insets) and writes `dist\Swagatam-debug.apk`.
Needs JDK 17 and the Android SDK (`JAVA_HOME`, `ANDROID_HOME`; defaults in the script).
The APK is debug-signed; a Play Store release needs a keystore and `assembleRelease`.

## What is still a stand-in
| Piece | Now | To go live |
|---|---|---|
| Sign-in | `js/auth.js` accepts the fixed code in `js/config.js` | real OTP provider (Firebase Auth, MSG91…) |
| Payments | `buyPlan()` in `js/main.js` just grants the plan locally; prices in `js/config.js` are placeholders | Google Play Billing / Razorpay |
| Data | everything is on the phone (localStorage + IndexedDB) | add accounts/backup if wanted |
| Festival dates | `js/festivals.js` has 2026–2028 (some festivals 2026–2027) | add each new year, or serve the table from a URL |

Notes
- WhatsApp does not allow apps to post a status for you, so the app reminds you and opens the share sheet; one tap on *My status* posts it.
- Lunar-calendar dates follow commonly published panchang dates and can differ by a day by region; users can change the date per year on the config screen.
- Reminders are local notifications, rescheduled each time the app opens (next ~3 years of known dates).

## Layout
- `www/js/festivals.js` festival data + date rules · `poster.js` canvas templates · `store.js` state, plan, images
- `www/js/main.js` screens, router, actions · `platform.js` notifications + share · `auth.js`, `config.js`
- `scripts/setup-android.js`, `build-android.ps1` Android build
