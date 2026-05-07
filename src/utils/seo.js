import { DEFAULT_SEO, SITE_CONFIG } from "../config/site";

export function absoluteUrl(path = "", baseUrl = SITE_CONFIG.url) {
  if (!path) return baseUrl;
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedBase = baseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export function buildPageTitle(title) {
  if (!title) return SITE_CONFIG.defaultTitle;
  if (title.includes(SITE_CONFIG.name)) return title;
  return SITE_CONFIG.titleTemplate.replace("%s", title);
}

export function buildSeo({
  title,
  description,
  image,
  path,
  canonical,
  type,
  robots,
  jsonLd,
} = {}) {
  const finalTitle = buildPageTitle(title || DEFAULT_SEO.title);
  const finalDescription = description || DEFAULT_SEO.description;
  const finalImage = absoluteUrl(image || DEFAULT_SEO.image);
  const finalUrl = absoluteUrl(canonical || path || "/");

  return {
    title: finalTitle,
    description: finalDescription,
    image: finalImage,
    canonical: finalUrl,
    type: type || DEFAULT_SEO.type,
    robots: robots || DEFAULT_SEO.robots,
    jsonLd,
  };
}

export function buildProductJsonLd(product = {}, url) {
  const name = product.title || product.name || "Product";
  const image = product.image || product.imageUrl || product.images?.[0];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    image: image ? [absoluteUrl(image)] : undefined,
    description: product.description || product.subtitle,
    sku: product.sku || product.id || product._id || product.productId,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: product.price
      ? {
          "@type": "Offer",
          url: absoluteUrl(url || `/products/${product.id || product._id || product.productId || ""}`),
          priceCurrency: product.currency || "INR",
          price: product.price,
          availability: "https://schema.org/InStock",
        }
      : undefined,
  };
}

export function buildBreadcrumbJsonLd(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}
