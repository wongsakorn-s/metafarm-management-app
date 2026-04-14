import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    globals: true,
    css: true,
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["e2e/**"],
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 550,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "favicon-32x32.png", "apple-touch-icon.png", "mask-icon.svg", "pwa-512x512.png"],
      manifest: {
        id: "/",
        name: "MetaFarm Bee Management",
        short_name: "MetaFarm",
        description: "ระบบจัดการรังผึ้งชันโรงสำหรับใช้งานในฟาร์มบนมือถือและเดสก์ท็อป",
        lang: "th",
        start_url: "/",
        scope: "/",
        orientation: "portrait",
        theme_color: "#f59e0b",
        background_color: "#fff7ed",
        display: "standalone",
        display_override: ["standalone", "window-controls-overlay"],
        categories: ["productivity", "business", "utilities"],
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        shortcuts: [
          {
            name: "ภาพรวมฟาร์ม",
            short_name: "Dashboard",
            url: "/",
          },
          {
            name: "รายการรังผึ้ง",
            short_name: "Hives",
            url: "/hives",
          },
          {
            name: "พิมพ์ QR",
            short_name: "QR",
            url: "/print-qr",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
});
