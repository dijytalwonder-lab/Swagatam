// Run from the project root AFTER `npx cap add android` (build-android.ps1 does this for you).
// Applies everything the generated Android project needs: SDK levels, Gradle versions, manifest tweaks,
// launcher icons + notification icon + splash from www/img/logo.svg, and MainActivity edge-to-edge insets.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const APP_ID = 'com.swagatam.app';
const and = 'android/';
const res = and + 'app/src/main/res/';
const logoSvg = fs.readFileSync('www/img/logo.svg');
const sizes = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
const notifSizes = { mdpi: 24, hdpi: 36, xhdpi: 48, xxhdpi: 72, xxxhdpi: 96 };

const edit = (file, fn) => { const s = fs.readFileSync(file, 'utf8'); const o = fn(s); if (o !== s) fs.writeFileSync(file, o); };

(async () => {
  if (!fs.existsSync(and)) throw new Error('android/ not found - run `npx cap add android` first');

  // ---- Gradle / SDK ----
  edit(and + 'variables.gradle', (s) => s.replace('minSdkVersion = 22', 'minSdkVersion = 23').replace('compileSdkVersion = 34', 'compileSdkVersion = 36').replace('targetSdkVersion = 34', 'targetSdkVersion = 36'));
  edit(and + 'build.gradle', (s) => s.replace('gradle:8.2.1', 'gradle:8.9.1'));
  edit(and + 'gradle/wrapper/gradle-wrapper.properties', (s) => s.replace('gradle-8.2.1-all', 'gradle-8.11.1-all'));
  fs.writeFileSync(and + 'local.properties', 'sdk.dir=C:/Android/sdk\n');
  edit(and + 'app/build.gradle', (s) => s.replace(/versionCode \d+/, 'versionCode 1').replace(/versionName "[^"]*"/, 'versionName "1.0.0"'));

  // ---- manifest: portrait, notification permission, keyboard mode ----
  edit(and + 'app/src/main/AndroidManifest.xml', (m) => {
    if (!m.includes('POST_NOTIFICATIONS')) m = m.replace('<uses-permission android:name="android.permission.INTERNET" />', '<uses-permission android:name="android.permission.INTERNET" />\n    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />');
    if (!m.includes('screenOrientation')) m = m.replace('android:launchMode="singleTask"', 'android:launchMode="singleTask"\n            android:screenOrientation="portrait"\n            android:windowSoftInputMode="adjustResize"');
    return m.replace(/\n\s*android:usesCleartextTraffic="true"/, '');
  });

  // ---- icons (logo.svg is a rounded square already) ----
  const full = await sharp(logoSvg, { density: 600 }).resize(1024, 1024).png().toBuffer();
  fs.rmSync(res + 'mipmap-anydpi-v26', { recursive: true, force: true });
  for (const [d, s] of Object.entries(sizes)) {
    const dir = res + 'mipmap-' + d + '/';
    const sq = await sharp(full).resize(s, s).png().toBuffer();
    const round = await sharp(sq).composite([{ input: Buffer.from(`<svg width="${s}" height="${s}"><circle cx="${s / 2}" cy="${s / 2}" r="${s / 2}"/></svg>`), blend: 'dest-in' }]).png().toBuffer();
    fs.writeFileSync(dir + 'ic_launcher.png', sq);
    fs.writeFileSync(dir + 'ic_launcher_foreground.png', sq);
    fs.writeFileSync(dir + 'ic_launcher_round.png', round);
  }

  // ---- notification small icon: white flower silhouette ----
  const petals = Array.from({ length: 8 }, (_, i) => `<ellipse cx="48" cy="26" rx="11" ry="20" transform="rotate(${i * 45} 48 48)"/>`).join('');
  const flower = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><g fill="#fff">${petals}<circle cx="48" cy="48" r="13"/></g></svg>`);
  for (const [d, s] of Object.entries(notifSizes)) {
    const dir = res + 'drawable-' + d + '/'; fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dir + 'ic_stat_swagatam.png', await sharp(flower).resize(s, s).png().toBuffer());
  }

  // ---- splash: plum with the logo ----
  const logo = await sharp(full).resize(360, 360).png().toBuffer();
  const splash = await sharp({ create: { width: 1080, height: 1920, channels: 4, background: '#2b0833' } }).composite([{ input: logo, gravity: 'center' }]).png().toBuffer();
  for (const f of fs.readdirSync(res).filter((x) => /^drawable/.test(x))) if (fs.existsSync(res + f + '/splash.png')) fs.writeFileSync(res + f + '/splash.png', splash);
  const colors = res + 'values/colors.xml';
  fs.writeFileSync(colors, '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="splash_bg">#2B0833</color>\n</resources>\n');
  edit(res + 'values/styles.xml', (s) => (s.includes('windowSplashScreenBackground') ? s : s.replace(/(<style name="AppTheme.NoActionBarLaunch"[^>]*>)/, '$1\n        <item name="windowSplashScreenBackground">@color/splash_bg</item>')));

  // ---- MainActivity: draw edge-to-edge, hand system-bar + keyboard sizes to the web page ----
  const pkgDir = path.join(and, 'app/src/main/java', ...APP_ID.split('.'));
  fs.mkdirSync(pkgDir, { recursive: true });
  fs.writeFileSync(path.join(pkgDir, 'MainActivity.java'), `package ${APP_ID};

import android.graphics.Color;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private volatile String lastInsets = "0,0,0";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);
        final WindowInsetsControllerCompat bars = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        bars.setAppearanceLightNavigationBars(true);

        final WebView web = getBridge().getWebView();
        web.addJavascriptInterface(new Object() {
            @JavascriptInterface public String get() { return lastInsets; }
            @JavascriptInterface public void statusIcons(final boolean dark) {
                runOnUiThread(new Runnable() { public void run() { bars.setAppearanceLightStatusBars(dark); } });
            }
        }, "SwInsets");

        ViewCompat.setOnApplyWindowInsetsListener(web, (v, insets) -> {
            Insets sys = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());
            float d = getResources().getDisplayMetrics().density;
            float kb = ime.bottom > sys.bottom ? ime.bottom / d : 0f;
            float bottom = kb > 0 ? 0f : sys.bottom / d;
            lastInsets = (sys.top / d) + "," + bottom + "," + kb;
            web.post(() -> web.evaluateJavascript("window.__setInsets&&window.__setInsets(" + lastInsets + ")", null));
            return WindowInsetsCompat.CONSUMED;
        });
        ViewCompat.requestApplyInsets(web);
    }
}
`);
  console.log('android project configured');
})().catch((e) => { console.error(e); process.exit(1); });
