import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isCrazyGames = mode === 'crazygames';
  const isAndroid = mode === 'android' || mode === 'androidtest';
  const isPortal = mode === 'portal';

  return {
    base: isPortal ? './' : '',
    plugins: [
      react(),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          // Android (AdMob only), CrazyGames (SDK ads only) and portal builds must not ship
          // AdSense, Adsterra or the Monetag push service worker.
          const stripWebAds = (h) => h
            .replace(/<!-- ADSENSE_START -->[\s\S]*?<!-- ADSENSE_END -->/, '')
            .replace(/<!-- WEB_ONLY_START[\s\S]*?<!-- WEB_ONLY_END -->/, '');
          if (isPortal) {
            return stripWebAds(html)
              .replace('<!-- MONETAG_PLACEHOLDER -->', '')
              .replace('<!-- CRAZYGAMES_SDK_PLACEHOLDER -->', '');
          }
          if (isCrazyGames) {
            return stripWebAds(html)
              .replace('<!-- MONETAG_PLACEHOLDER -->', '')
              .replace('<!-- CRAZYGAMES_SDK_PLACEHOLDER -->', '<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>');
          }
          if (isAndroid) {
            return stripWebAds(html)
              .replace('<!-- MONETAG_PLACEHOLDER -->', '')
              .replace('<!-- CRAZYGAMES_SDK_PLACEHOLDER -->', '');
          }
          return html
            .replace('<!-- MONETAG_PLACEHOLDER -->', '')
            .replace('<!-- CRAZYGAMES_SDK_PLACEHOLDER -->', '');
        }
      },
      {
        // sw.js carries Monetag push ads; only the website build may ship it
        name: 'strip-web-service-worker',
        apply: 'build',
        closeBundle() {
          if (!(isAndroid || isCrazyGames || isPortal)) return;
          const outDir = isCrazyGames ? 'dist_crazygames' : (isPortal ? 'dist_portal' : 'dist_production');
          fs.rmSync(path.join(outDir, 'sw.js'), { force: true });
        }
      }
    ],
    build: {
      outDir: isCrazyGames ? 'dist_crazygames' : (isPortal ? 'dist_portal' : 'dist_production'),
      emptyOutDir: false,
      rollupOptions: {
        output: {
          entryFileNames: `[name].js`,
          chunkFileNames: `[name].js`,
          assetFileNames: `[name].[ext]`
        }
      }
    }
  };
})
