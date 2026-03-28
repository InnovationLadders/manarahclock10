import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';
import { copyFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: 'public',
  build: {
    copyPublicDir: false,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
      }
    }
  },
  plugins: [
    {
      name: 'copy-public-selective',
      async closeBundle() {
        const publicDir = resolve(process.cwd(), 'public');
        const distDir = resolve(process.cwd(), 'dist');

        const allowedFiles = [
          '_redirects',
          'robots.txt',
          'sitemap.xml',
          'manifest.json',
          'manarah1.png',
          'apple-touch-icon.png',
          'favicon.ico',
          'pwa-512x512.png',
          'logo_MANARAH_25.svg'
        ];

        for (const file of allowedFiles) {
          const src = join(publicDir, file);
          const dest = join(distDir, file);
          try {
            if (existsSync(src)) {
              copyFileSync(src, dest);
            }
          } catch (e) {
            console.warn(`Could not copy ${file}:`, e);
          }
        }
      }
    },
    react(),
    svgr(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'ساعة منارة - ساعة المسجد الذكية لأوقات الصلاة',
        short_name: 'ساعة منارة',
        description: 'ساعة منارة - ساعة المسجد الذكية والتلفزيونية لعرض أوقات الصلاة والأذان بدقة عالية. نظام متطور لإدارة شاشات المساجد مع عرض الأدعية والإعلانات.',
        theme_color: '#059669',
        background_color: '#059669',
        display: 'fullscreen',
        orientation: 'any',
        lang: 'ar',
        dir: 'rtl',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/images\.pexels\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pexels-images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /.*\.(png|jpg|jpeg|gif|webp|svg|bmp|ico|mp4|webm|ogg|avi|mov)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'media-files-cache',
            }
          }
        ]
      }
    }
    )
  ],
  server: {
    port: 5173,
    host: true
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  }
});