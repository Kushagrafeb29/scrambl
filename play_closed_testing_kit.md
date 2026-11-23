# Scrambl — Play Store Closed Testing Kit

Goal: get through Google's rule for new personal accounts — **a closed test with at least 12 testers opted in for 14 days in a row** — then apply for production.

Total effort: about 1–2 hours of setup, then roughly 5 minutes a day for 14 days.

---

## Step 1 — Create your upload key (one time, ~2 min)

Run this in a terminal and **choose your own password** when it asks. Store the password and the `.jks` file somewhere safe, like a password manager plus a cloud backup. If you lose them, you can still reset the key through Play support, but it's a hassle.

```bash
"C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -genkeypair -v -keystore D:\Scrambl\android\scrambl-upload.jks -alias scrambl -keyalg RSA -keysize 2048 -validity 10000
```

Then create `D:\Scrambl\android\keystore.properties` (it's in `.gitignore`, so it never gets committed):

```properties
storeFile=scrambl-upload.jks
storePassword=YOUR_PASSWORD
keyAlias=scrambl
keyPassword=YOUR_PASSWORD
```

The Gradle build already reads this file, so a signed AAB comes out automatically.

## Step 2 — Build the closed-test AAB

The closed-test build uses **Google test ads**. That matters: if testers tap your real ads, AdMob can flag the traffic as invalid and suspend your account.

```bash
cd D:\Scrambl
npm run build:android:test
npx cap sync android
cd android
gradlew.bat bundleRelease
```

Output: `D:\Scrambl\android\app\build\outputs\bundle\release\app-release.aab`

> For the **production** release later, use `npm run build:android` (live ads) and raise `versionCode` in `android/app/build.gradle`.

## Step 3 — Play Console setup

1. **Create app:** name "Word Scrambl", type Game, Free.
2. **Store listing:** use the text in the "Store listing copy" section below. You'll also need a 512×512 icon, a 1024×500 feature graphic, and at least 2 phone screenshots.
3. **App content** section:
   - **Privacy policy:** `https://wordscrambl.com/privacy`
   - **Ads:** Yes, contains ads.
   - **Target audience:** choose **13+** only. Don't include under-13 ages; that pulls you into the stricter Families policy and its ad rules.
   - **Data safety:** declare these:
     - *Device or other IDs* — collected by AdMob for advertising and analytics.
     - *Email address* — Firebase Auth, account management.
     - *App interactions* — Firebase/Google Analytics.
     - Data is encrypted in transit. Users can request deletion.
   - **Content rating:** fill in the questionnaire (no violence, etc.). It should come out as Everyone or 3+.
4. **Testing → Closed testing → Create track** and upload the AAB.
5. **Testers:** choose **Google Groups** and enter your group's email (see Step 4). This is much easier than typing emails one by one.
6. Send the release for review. The first review takes about 1–3 days.

## Step 4 — Get 12+ testers (aim for 15–20, since some will drop out)

1. Create a Google Group at groups.google.com, for example `scrambl-testers@googlegroups.com`.
   - Set "Who can join" to **Anyone can join**.
2. Add that group to the closed test (Step 3.5).
3. Once the release is approved, copy the **opt-in link** from Play Console.
   - It looks like `https://play.google.com/apps/testing/com.wordscrambl.app`.

**Where to find testers:**
- Friends and family who have **Android** phones. Each one counts.
- **r/AndroidClosedTesting** and **r/TestersCommunity** on Reddit. Developers test each other's apps there. You test theirs, they test yours.
- Tester-exchange apps on Play, like "Testers Community" or "12 Testers". Read the terms before using one.
- College, office or WhatsApp groups.

**Invite message (copy and paste):**

> Hey! I've built a word puzzle game called **Word Scrambl** and Google needs a few people to test it before I can publish it. It takes 2 minutes:
> 1. Join this group with your Gmail: https://groups.google.com/g/scrambl-testers
> 2. Open this link and tap "Become a tester": <OPT-IN LINK>
> 3. Install the app from the Play Store link on that page
>
> Please **keep it installed for 14 days** and open it once in a while. Honest feedback welcome. Thank you! 🙏

## Step 5 — The 14 days

- The clock starts once 12 testers have opted in. They must **stay opted in** the whole time. If someone leaves and you drop below 12, the clock restarts.
- Google also looks at real engagement:
  - Send a reminder on days 3, 7 and 11 asking testers to play a level.
  - Ship **at least 1–2 small updates** during the test (bump `versionCode` each time). Google's reviewers notice active development.
- Keep notes on any feedback. You'll need it for Step 6.

## Step 6 — Apply for production access

After 14 days, a **Dashboard → Apply for production** button appears. You'll answer questions about:
- **How you recruited testers.** Be honest: friends, family, a Reddit tester community.
- **What feedback you got and what you changed.** Use your notes.
- **Whether the app is ready.** Say yes, and why.

Approval usually takes up to 7 days. Rejection happens mostly when answers are vague or testers weren't really engaged. If that happens, keep the test running and apply again.

---

## Store listing copy (draft — edit freely)

**App name (30):** Word Scrambl: Jumble Puzzles

**Short description (80):** Unscramble words, solve the riddle & travel the world in 1,400+ puzzle levels!

**Full description:**

> Love word jumbles? **Word Scrambl** turns the classic newspaper puzzle into a world tour!
>
> 🧩 **Unscramble & solve the riddle.** Unscramble each clue word. The circled letters build the answer to a punny riddle.
>
> 🌍 **1,400+ levels across the world.** Travel from Australia to Japan, Italy, Mexico and more. Every destination brings new puzzles.
>
> ⏱️ **Time Attack.** Race the clock and see how many words you can solve.
>
> 📅 **Daily Challenge & Word of the Day.** A fresh puzzle every day to keep your streak going.
>
> 🏆 **Achievements & leaderboards.** Unlock badges, track your stats and compete with friends.
>
> 💡 **Hints when you're stuck.** Use coins or watch a short video for a free hint.
>
> Relaxing, clever, and great for building vocabulary. Play offline, anytime.

*(Check that the claims match the app. For example, only keep "Play offline" if it really works without internet.)*
