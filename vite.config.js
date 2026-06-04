import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Sam Global Customer",
        short_name: "SamGlobal",
        description: "Customer ecommerce web app for Sam Global.",
        theme_color: "#f7f4ef",
        background_color: "#f7f4ef",
        
        display: "standalone",
        icons: [
          {
            src: "favicon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
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
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 14 }
            }
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("react-router")) return "vendor-router";
          if (id.includes("react-dom") || id.includes("/react/")) {
            return "vendor-react";
          }
          if (
            id.includes("@reduxjs") ||
            id.includes("react-redux") ||
            id.includes("redux") ||
            id.includes("immer") ||
            id.includes("reselect")
          ) {
            return "vendor-redux";
          }
          if (id.includes("lucide-react") || id.includes("react-icons")) {
            return "vendor-icons";
          }
          if (id.includes("axios")) return "vendor-http";
          if (
            id.includes("react-helmet-async") ||
            id.includes("react-hook-form") ||
            id.includes("react-toastify") ||
            id.includes("@hookform")
          ) {
            return "vendor-ui";
          }
          if (id.includes("zod")) return "zod";

          return undefined;
        }
      }
    }
  }
});
