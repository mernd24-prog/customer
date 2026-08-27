import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream, mkdirSync } from "fs";
import { dirname } from "path";

// 1. Sitemap Configuration
const HOSTNAME = "https://staging.samglobal1.com";
const OUTPUT_FILE = "./public/sitemap.xml";

// 2. Static Public Pages
const staticLinks = [
  // Home
  {
    url: "/",
    changefreq: "daily",
    priority: 1.0,
  },

  // Main Pages
  {
    url: "/products",
    changefreq: "daily",
    priority: 0.9,
  },
  {
    url: "/categories",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    url: "/about-us",
    changefreq: "monthly",
    priority: 0.7,
  },
  {
    url: "/contact-us",
    changefreq: "monthly",
    priority: 0.6,
  },
  {  
    url: "/faq",
    changefreq: "monthly",
    priority: 0.6,
  },

  // Discovery Pages
  {
    url: "/new-arrivals",
    changefreq: "daily",
    priority: 0.8,
  },

  // Brand
  {
    url: "/brand-outlet",
    changefreq: "weekly",
    priority: 0.7,
  },
  {
    url: "/categories/brand",
    changefreq: "weekly",
    priority: 0.7,
  },

  // Company / CMS Pages
  {
    url: "/who-we-are",
    changefreq: "monthly",
    priority: 0.6,
  },
  {
    url: "/mobile-app",
    changefreq: "monthly",
    priority: 0.5,
  },

  // Policies
  {
    url: "/shipping-policy",
    changefreq: "monthly",
    priority: 0.5,
  },
  {
    url: "/refund-policy",
    changefreq: "monthly",
    priority: 0.5,
  },
  {
    url: "/terms-of-use",
    changefreq: "monthly",
    priority: 0.5,
  },

  // Seller Pages
  {
    url: "/become-a-seller",
    changefreq: "monthly",
    priority: 0.6,
  },
  {
    url: "/seller-policies",
    changefreq: "monthly",
    priority: 0.5,
  },
];

// 3. Generate Sitemap
async function generate() {
  console.log("⏳ Generating sitemap...");

  try {
    // Make sure public directory exists
    mkdirSync(dirname(OUTPUT_FILE), { recursive: true });

    const stream = new SitemapStream({
      hostname: HOSTNAME,
    });

    const writeStream = createWriteStream(OUTPUT_FILE);

    stream.pipe(writeStream);

    // Add static pages
    staticLinks.forEach((link) => {
      stream.write(link);
    });

    stream.end();

    await streamToPromise(stream);

    console.log(
      `\x1b[32m✅ Sitemap generated successfully!\x1b[0m`
    );

    console.log(`📄 File: ${OUTPUT_FILE}`);
    console.log(`🌐 URL: ${HOSTNAME}/sitemap.xml`);
    console.log(`📊 Total URLs: ${staticLinks.length}`);
  } catch (error) {
    console.error("❌ Failed to generate sitemap:", error);
    process.exit(1);
  }
}

generate();