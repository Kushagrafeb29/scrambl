// Which ad stack a build may use. Vite replaces import.meta.env.MODE with a string literal at build
// time, so these fold to true/false and web-ad code is removed entirely from Android / CrazyGames /
// portal bundles. (Keep them as plain === comparisons so the minifier can fold them.)
//   - website (production/development): Adsterra banners + smartlink, AdSense
//   - android / androidtest: AdMob only
//   - crazygames / portal: their own SDK only
export const WEB_ADS_ENABLED = import.meta.env.MODE === 'production' || import.meta.env.MODE === 'development';
export const IS_ANDROID_BUILD = import.meta.env.MODE === 'android' || import.meta.env.MODE === 'androidtest';
