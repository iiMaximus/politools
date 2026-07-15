import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// base: "./" keeps asset paths relative so a production build also works when
// opened straight from the filesystem or served from a sub-path (matches the
// "just open it" workflow of the older static sites). Routing uses HashRouter
// for the same reason.
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Polito Tools",
        short_name: "PoliTo",
        description: "Learn, practice and pass PoliTo mechanical-engineering courses.",
        display: "standalone",
        start_url: "./",
        scope: "./",
        theme_color: "#f4f6fb",
        background_color: "#f4f6fb",
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // precache EVERYTHING — offline study on the metro is the point;
        // course chunks are split, so each caches independently
        globPatterns: ["**/*.{js,css,html,woff2,woff,ttf,png,svg}"],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    open: true,
  },
});
