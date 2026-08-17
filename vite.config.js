import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // Remove repeated third-party license comments from emitted bundles.
  // Vite's esbuild minifier remains responsible for production JavaScript.
  esbuild: {
    legalComments: "none",
  },
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
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 14 }
            }
          }
        ]
      }
    })
  ],
  build: {
    minify: "esbuild",
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
          if (id.includes("swiper")) return "vendor-swiper";
          if (
            id.includes("react-helmet-async") ||
            id.includes("react-hook-form") ||
            id.includes("@hookform")
          ) {
            return "vendor-ui";
          }
          if (id.includes("zod")) return "zod";

          return undefined;
        }
      }
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://45.195.90.183:4000",
        changeOrigin: true
      },
    },
  },
  preview: {
    proxy: {
      "/api": {
        target: "http://45.195.90.183:4000",
        changeOrigin: true
      },
    },
    headers: {
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Content-Security-Policy": "default-src 'self' http://45.195.90.183:4000 https: data: blob: 'unsafe-inline' 'unsafe-eval'",
    }
  }
});
