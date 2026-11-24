// AdMob ad unit IDs per platform. AdMob issues separate IDs for Android and iOS apps.
// iOS uses Google's public test units until a Word Scrambl iOS app is created in AdMob:
// replace the IOS values below with the real "ca-app-pub-4173109231628867/..." IDs, and set
// GADApplicationIdentifier in ios/App/App/Info.plist to the iOS app ID.
import { Capacitor } from '@capacitor/core';

const ANDROID = {
  banner: 'ca-app-pub-4173109231628867/6076498960',
  interstitial: 'ca-app-pub-4173109231628867/7253849260',
  rewarded: 'ca-app-pub-4173109231628867/9193616890',
};

const IOS = {
  banner: 'ca-app-pub-3940256099942544/2934735716',
  interstitial: 'ca-app-pub-3940256099942544/4411468910',
  rewarded: 'ca-app-pub-3940256099942544/1712485313',
};

export const IS_IOS = Capacitor.getPlatform() === 'ios';
export const AD_UNITS = IS_IOS ? IOS : ANDROID;
// True while iOS still uses Google's test units (keeps test mode on so AdMob policy is respected)
export const IOS_USING_TEST_UNITS = IS_IOS && IOS.banner.startsWith('ca-app-pub-3940256099942544');
