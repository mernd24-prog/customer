/* global console, process */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_ROUTES } from "../src/config/siteRoutes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const siteUrl = (process.env.VITE_SITE_URL || "https://samglobal.com").replace(/\/$/, "");

const routes = SITE_ROUTES.filter((route) => route.includeInSitemap !== false);

function absoluteUrl(path) {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function sitemapEntry(route) {
  return [
    "  <url>",
    `    <loc>${absoluteUrl(route.path)}</loc>`,
    `    <changefreq>${route.changefreq || "weekly"}</changefreq>`,
    `    <priority>${route.priority ?? 0.5}</priority>`,
    "  </url>",
  ].join("\n");
}

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  routes.map(sitemapEntry).join("\n"),
  "</urlset>",
  "",
].join("\n");

const robots = [
  "User-agent: *",
  "Allow: /",
  "Disallow: /account/",
  "Disallow: /cart",
  "Disallow: /checkout",
  "Disallow: /orders",
  `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
  "",
].join("\n");

await mkdir(resolve(rootDir, "public"), { recursive: true });
await writeFile(resolve(rootDir, "public/sitemap.xml"), sitemap);
await writeFile(resolve(rootDir, "public/robots.txt"), robots);

console.log(`Generated sitemap.xml and robots.txt for ${siteUrl}`);
