import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["image/png/favicon.png", "image/png/logo.png"],
      manifest: {
        name: "Sam Global",
        short_name: "SamGlobal",
        description: "Shop smarter with Sam Global.",
        theme_color: "#f7f4ef",
        background_color: "#f7f4ef",

        display: "standalone",
        icons: [
          {
            src: "image/png/favicon.png",
            sizes: "738x718",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "image/png/logo.png",
            sizes: "994x549",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [
          /^\/assets\//,
          /\/[^/?]+\.(?:js|mjs|css|map|json|ico|png|jpg|jpeg|svg|webp)$/i,
        ],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 14 },
            },
          },
        ],
      },
    }),
  ],
});
