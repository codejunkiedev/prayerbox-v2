import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import { VitePWA } from 'vite-plugin-pwa';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const sentryAuthToken = env.SENTRY_AUTH_TOKEN;
  const sentryOrg = env.SENTRY_ORG;
  const sentryProject = env.SENTRY_PROJECT;
  const sentryRelease = env.VITE_SENTRY_RELEASE;
  const enableSentryPlugin = Boolean(sentryAuthToken && sentryOrg && sentryProject);

  return {
    plugins: [
      react(),
      legacy({
        targets: ['defaults', 'chrome >= 49', 'android >= 5', 'not IE 11'],
        polyfills: true, // Auto-inject core-js polyfills
        modernPolyfills: true,
        renderLegacyChunks: true,
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      }),
      VitePWA({
        registerType: 'autoUpdate',
        // Registration is done manually in src/main.tsx so we can report
        // service-worker registration / update failures to Sentry.
        injectRegister: false,
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
          navigateFallback: '/index.html',
          // Display screens can build up a lot of large images over time
          // (announcements, posts, ayat-hadith canvases). Bump the precache
          // size limit so the build doesn't fail and let runtime caching pick
          // up large media at request time.
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          runtimeCaching: [
            {
              // Supabase storage (announcement / event / post / ayat-hadith images)
              urlPattern: /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\//,
              handler: 'CacheFirst',
              options: {
                cacheName: 'supabase-storage',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Al-Adhan prayer times API
              urlPattern: /^https:\/\/api\.aladhan\.com\//,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'aladhan-api',
                networkTimeoutSeconds: 8,
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 35, // ~ one extra month buffer
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // OpenWeather forecast API
              urlPattern: /^https:\/\/api\.openweathermap\.org\//,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'openweather-api',
                networkTimeoutSeconds: 6,
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24, // 1 day
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Google Fonts stylesheet
              urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts-stylesheets',
              },
            },
            {
              // Google Fonts files
              urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        manifest: {
          name: 'Prayer Box',
          short_name: 'Prayer Box',
          description: 'Mosque display screens for prayer times, announcements, and content.',
          theme_color: '#000000',
          background_color: '#000000',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: '/vite.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any',
            },
          ],
        },
      }),
      enableSentryPlugin &&
        sentryVitePlugin({
          org: sentryOrg,
          project: sentryProject,
          authToken: sentryAuthToken,
          release: sentryRelease ? { name: sentryRelease } : undefined,
          sourcemaps: {
            filesToDeleteAfterUpload: ['./dist/**/*.map'],
          },
        }),
    ],
    build: {
      target: 'es2015',
      minify: 'terser', // Better for older browsers than esbuild
      sourcemap: enableSentryPlugin,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
