# Android Build Guide — Scrambl

This guide walks you through building the Scrambl APK (for testing) and AAB (for Play Store upload).

---

## Prerequisites

1. **Android Studio** — [Download here](https://developer.android.com/studio) if not installed.
2. **Java 17** — Android Studio bundles it, but confirm via `java -version`.
3. **Node.js** — Already installed on your machine.

---

## Step 1: Build the Web Assets

Open a terminal in the Scrambl project folder and run:

```bash
npm run build:android
```

This builds your web app into `dist_production/` with **no ads** (Monetag and CrazyGames both stripped out — the Android version uses AdMob natively instead).

---

## Step 2: Sync to Android

Copy the freshly built web assets into the Android project:

```bash
npx cap sync android
```

This does two things:
- Copies `dist_production/` into `android/app/src/main/assets/public/`
- Syncs any native Capacitor plugins (like AdMob)

---

## Step 3: Open in Android Studio

```bash
npx cap open android
```

This opens the `android/` folder in Android Studio. If this doesn't work, just open Android Studio manually and choose **Open** → navigate to:
```
c:\Users\KUSHAGRA MISHRA\.gemini\antigravity\scratch\Scrambl\android
```

**Wait for Gradle sync to finish** (progress bar at the bottom). This can take a few minutes on first open.

---

## Step 4: Build a Debug APK (for testing on your phone)

### Option A — From Android Studio UI:
1. In the menu bar: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Wait for the build to finish.
3. Click the **"locate"** link in the notification popup.
4. The APK will be at:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```
5. Transfer this file to your phone and install it (enable "Install from unknown sources" if prompted).

### Option B — From terminal:
```bash
cd android
.\gradlew.bat assembleDebug
```
The APK will be at `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## Step 5: Build a Signed AAB (for Play Store upload)

Google Play **requires an AAB** (Android App Bundle), not an APK. You need a signing key.

### 5a. Create a Signing Key (one-time only)

Open a terminal and run:

```bash
keytool -genkey -v -keystore scrambl-release.keystore -alias scrambl -keyalg RSA -keysize 2048 -validity 10000
```

You'll be prompted for:
- **Keystore password** — Choose a strong password and **SAVE IT FOREVER**. You cannot recover it.
- **Your name, org, etc.** — Fill in or press Enter to skip.
- **Key password** — Can be the same as the keystore password.

This creates `scrambl-release.keystore`. **Back this file up somewhere safe** — you need it for every future update.

### 5b. Configure Signing in the Project

Move the keystore file into the `android/app/` directory:
```bash
move scrambl-release.keystore android\app\
```

Then edit `android/app/build.gradle` and add the signing config. Add this block **inside** the `android { }` section, right before `buildTypes`:

```groovy
    signingConfigs {
        release {
            storeFile file('scrambl-release.keystore')
            storePassword 'YOUR_KEYSTORE_PASSWORD'
            keyAlias 'scrambl'
            keyPassword 'YOUR_KEY_PASSWORD'
        }
    }
```

Then update the `buildTypes` → `release` block to use it:

```groovy
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
```

### 5c. Build the AAB

#### From Android Studio:
1. Menu: **Build → Generate Signed Bundle / APK...**
2. Select **Android App Bundle**
3. Choose your keystore, enter passwords, select alias `scrambl`
4. Choose **release** build variant
5. Click **Create**
6. The AAB file will be at:
   ```
   android/app/build/outputs/bundle/release/app-release.aab
   ```

#### From terminal:
```bash
cd android
.\gradlew.bat bundleRelease
```
The AAB will be at `android/app/build/outputs/bundle/release/app-release.aab`.

---

## Step 6: Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your **Word Scrambl** app (or create a new app if first time)
3. Navigate to **Release → Production** (or **Internal Testing** for testing first)
4. Click **Create new release**
5. Upload your `app-release.aab` file
6. Add release notes (e.g., "Initial release of Scrambl word puzzle game")
7. Click **Review release** → **Start rollout**

---

## Quick Reference — Full Build Commands

```bash
# 1. Build web assets (no web ads, AdMob native only)
npm run build:android

# 2. Sync into Android project
npx cap sync android

# 3a. Debug APK (for testing)
cd android && .\gradlew.bat assembleDebug

# 3b. Release AAB (for Play Store)
cd android && .\gradlew.bat bundleRelease
```

---

## Important Notes

> ⚠️ **NEVER lose your keystore file or password.** If you do, you can never update your app on the Play Store — you'd have to publish a completely new app with a new package name.

> 💡 **Version bumps:** Before each Play Store update, increment `versionCode` and `versionName` in `android/app/build.gradle`:
> ```groovy
> versionCode 2        // Must be higher than previous upload
> versionName "1.1"    // Human-readable version
> ```

> 🎯 **Target SDK:** Your current `targetSdkVersion` is 33. Google Play currently requires **34+** for new apps. You may need to update `variables.gradle`:
> ```groovy
> compileSdkVersion = 34
> targetSdkVersion = 34
> ```
