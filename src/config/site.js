export const SITE_CONFIG = {
  name: "Sam Global",
  titleTemplate: "%s | Sam Global",
  defaultTitle: "Sam Global | Shop products, deals, orders & rewards",
  description:
    "Shop smarter with Sam Global. Discover products, deals, order tracking, returns, loyalty rewards, wallet, warranties, and subscriptions in one ecommerce experience.",
  url: import.meta.env.VITE_SITE_URL || "https://samglobal.com",
  locale: "en_IN",
  image: "/image/png/logo.png",
  favicon: "/image/png/favicon.png",
  twitterHandle: "",
};

export const DEFAULT_SEO = {
  title: SITE_CONFIG.defaultTitle,
  description: SITE_CONFIG.description,
  image: SITE_CONFIG.image,
  type: "website",
  robots: "index,follow",
};
