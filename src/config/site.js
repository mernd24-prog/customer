export const SITE_CONFIG = {
  name: "Sam Global",
  titleTemplate: "%s | Sam Global",
  defaultTitle: "Sam Global | Shop smarter",
  description:
    "Shop products, track orders, manage returns, loyalty, wallet, warranties, and subscriptions.",
  url: import.meta.env.VITE_SITE_URL || "https://samglobal.com",
  locale: "en_IN",
  image: "/image/png/logo.png",
  twitterHandle: "",
};

export const DEFAULT_SEO = {
  title: SITE_CONFIG.defaultTitle,
  description: SITE_CONFIG.description,
  image: SITE_CONFIG.image,
  type: "website",
  robots: "index,follow",
};
