# Word Scrambl — iOS / App Store launch guide

The iOS app is already set up in `ios/` (Capacitor 8, Swift Package Manager, iPhone-only, portrait, 1.0.5 build 6).
Apple only builds and uploads iOS apps from macOS, so the build runs on a **cloud Mac (Codemagic)** from the GitHub repo.
You never need a Mac yourself.

Things only you can do are marked **(you)**: they involve paying, legal agreements, or your Apple ID.

---

## 1. Apple Developer Program **(you)** — 1–2 days

1. Go to https://developer.apple.com/programs/enroll/ and enroll as an **Individual** with your Apple ID.
2. Pay **US$99/year** (₹ equivalent). Apple verifies your identity; approval usually takes 24–48 h.
3. Sign the agreements shown in App Store Connect (https://appstoreconnect.apple.com → Business).

## 2. Create the app in App Store Connect **(you)** — 5 min

App Store Connect → **Apps → + → New App**

| Field | Value |
|---|---|
| Platform | iOS |
| Name | Word Scrambl: Jumble Puzzles |
| Primary language | English (U.K.) |
| Bundle ID | `com.wordscrambl.app` (register it first at developer.apple.com → Identifiers if it isn't listed) |
| SKU | `wordscrambl-ios` |

Then open **App Information** and copy the **Apple ID** number (e.g. `6749xxxxxx`) into `codemagic.yaml` → `APP_STORE_APPLE_ID`.

## 3. App Store Connect API key **(you)** — 2 min

App Store Connect → **Users and Access → Integrations → App Store Connect API → +**
- Name: `Codemagic`, Access: **App Manager**
- Download the `.p8` file (only downloadable once) and note the **Key ID** and **Issuer ID**.

## 4. Codemagic **(you)** — 5 min, free tier is enough

1. Sign up at https://codemagic.io with your GitHub account and add the repo `Kushagrafeb29/scrambl`.
2. **Teams → Integrations → App Store Connect → Connect**: upload the `.p8`, Key ID, Issuer ID. Name it exactly **`WordScrambl ASC`**.
3. **Code signing identities → iOS certificates → Generate** (Codemagic creates the distribution certificate for you), then
   **iOS provisioning profiles → Fetch** for `com.wordscrambl.app` (App Store type).
4. In the app, pick branch **`play-store-launch`**, workflow **`ios-release`**, **Start new build**.

About 15–20 minutes later the build appears in **App Store Connect → TestFlight**.

## 5. AdMob for iOS (recommended before public release)

The app currently shows **Google test ads on iOS** (no revenue, but fully policy-safe).
1. AdMob → **Apps → Add app → iOS → "Word Scrambl"** (not yet published is fine).
2. Create 3 ad units: Banner, Interstitial, Rewarded.
3. Put the IDs into `src/utils/adUnits.js` (`IOS` block) and the iOS **app ID** into
   `ios/App/App/Info.plist` → `GADApplicationIdentifier`. Commit, push, rebuild in Codemagic.

## 6. App Store listing (I can fill this in with you once the app exists)

- **Subtitle (30):** Unscramble & travel the world
- **Promotional text:** 1,451 handcrafted word jumbles across 60 countries. New daily puzzle every day!
- **Description:** same as the Google Play full description.
- **Keywords (100):** `word,jumble,anagram,puzzle,scramble,brain,vocabulary,daily,unscramble,crossword,spelling,trivia`
- **Category:** Games → Word (secondary: Puzzle)
- **Age rating questionnaire:** infrequent/mild alcohol & drug *references* (the words BEER/WINE/DRUG appear) → **9+**; everything else None.
- **Privacy policy URL:** https://wordscrambl.com/privacy · **Support URL:** https://wordscrambl.com
- **App Privacy ("nutrition label"):** Contact info (email) – app functionality, linked to user; Identifiers (user ID, device ID/IDFA) – advertising & analytics; Usage data – analytics; Diagnostics. Tracking: **Yes** (AdMob IDFA, only with ATT permission).
- **Account deletion:** in-app (Settings → Delete Account) ✅ — Apple requires this.
- **Review notes / demo account:** give the same reviewer email+password you gave Google Play.
- **Screenshots:** 6.9" iPhone (1320×2868) — required. I can generate these from the game like the Play ones.

## 7. Submit **(you click the final button)**

App Store Connect → your app → **1.0.5 → Add build (from TestFlight) → Add for Review → Submit**.
First reviews usually take 24–48 h.

---

### Apple-specific risks already handled in the code
- Web ads (Adsterra/AdSense/Monetag) are compiled out of the native build — AdMob only.
- No external payment links in the app (Ko-fi only shows on the website); paid items show "Soon".
- Google sign-in hidden in the app, so **Sign in with Apple is not required**.
- App Tracking Transparency prompt shown before ads load; `NSUserTrackingUsageDescription` set.
- Account deletion available in-app and on the web.
- `ITSAppUsesNonExemptEncryption = false` (no export-compliance questions on each upload).

### Known risk: Guideline 4.2 (Minimum functionality)
Apple sometimes rejects apps that feel like a wrapped website. Word Scrambl is a full offline-capable game with 1,451 levels,
so it should pass, but if Apple raises 4.2, reply highlighting: native ads/ATT, haptics-free gameplay, 60-country campaign,
daily puzzles, achievements, and that the app is not a website mirror.
