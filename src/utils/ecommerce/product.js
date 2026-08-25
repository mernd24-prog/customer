const getDefaultApiAssetBaseUrl = () => {
  if (typeof window === "undefined") return "http://localhost:4000";
  return `${window.location.protocol}//${window.location.hostname}:4000`;
};

const API_ASSET_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || getDefaultApiAssetBaseUrl()
).replace(/\/+$/, "");

function normalizeImageUrl(url = "") {
  const value = String(url || "").trim();
  if (!value) return "";
  if (/^(https?:)?\/\//i.test(value) || /^(data|blob):/i.test(value)) {
    return value;
  }
  return `${API_ASSET_BASE_URL}/${value.replace(/^\/+/, "")}`;
}

export function getOptimizedCloudinaryUrl(url, width = "auto") {
  if (!url || typeof url !== "string") return url;
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    if (url.includes("f_auto") || url.includes("q_auto")) return url;
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
  }
  return url;
}

export function generateCloudinarySrcSet(url, widths = [300, 400, 800]) {
  if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com"))
    return undefined;
  return widths
    .map((w) => `${getOptimizedCloudinaryUrl(url, w)} ${w}w`)
    .join(", ");
}

export function getProductId(product) {
  if (!product) return "";

  if (typeof product !== "object") return product;

  const directId = product.id || product._id || product.sku;
  if (directId) return directId;

  const nestedProduct = product.productId || product.product;
  if (nestedProduct && nestedProduct !== product) {
    return getProductId(nestedProduct);
  }

  return "";
}

export function getProductSlug(product) {
  if (!product) return "";
  if (typeof product !== "object") return "";
  return product.slug || product.handle || product.seoSlug || "";
}

export function getProductUrlSlug(product) {
  const slug = getProductSlug(product);
  const titleSlug = product?.title
    ? String(product.title)
        .trim()
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/['’]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    : "";
  return titleSlug || slug.replace(/-\d{10,}$/, "");
}

export function getProductPublicCode(product) {
  if (!product) return "";
  if (typeof product !== "object") return "";
  return product.publicCode || product.public_code || product.code || "";
}

export function getVariantPublicCode(variant) {
  if (!variant || typeof variant !== "object") return "";
  return variant.publicVariantCode || variant.public_variant_code || "";
}

export function getVariantRouteKey(variant) {
  if (!variant || typeof variant !== "object") return "";
  return getVariantPublicCode(variant) || variant.sku || variant.code || variant._id || variant.id || "";
}

const PRODUCT_TOKEN_VERSION = "p1";
const VARIANT_TOKEN_VERSION = "v1";
const ROUTE_TOKEN_MASK = "sam-global-product-route-v1";

function getRouteTokenMaskByte(index) {
  return ROUTE_TOKEN_MASK.charCodeAt(index % ROUTE_TOKEN_MASK.length);
}

function encodeBase64Url(value) {
  const text = JSON.stringify(value);
  const bytes =
    typeof TextEncoder !== "undefined"
      ? new TextEncoder().encode(text)
      : Uint8Array.from(unescape(encodeURIComponent(text)), (char) => char.charCodeAt(0));
  const binary = String.fromCharCode(
    ...Array.from(bytes, (byte, index) => byte ^ getRouteTokenMaskByte(index) ^ ((index * 31) & 255)),
  );
  const encoded =
    typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(binary, "binary").toString("base64");
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(token) {
  const normalized = String(token || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary =
    typeof atob === "function"
      ? atob(padded)
      : Buffer.from(padded, "base64").toString("binary");
  const decodedBinary = String.fromCharCode(
    ...Array.from(binary, (char, index) => char.charCodeAt(0) ^ getRouteTokenMaskByte(index) ^ ((index * 31) & 255)),
  );

  if (typeof TextDecoder !== "undefined") {
    const bytes = Uint8Array.from(decodedBinary, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  return JSON.parse(decodeURIComponent(escape(decodedBinary)));
}

export function encodeProductRouteToken(payload = {}) {
  return encodeBase64Url({ t: PRODUCT_TOKEN_VERSION, ...payload });
}

export function decodeProductRouteToken(token) {
  try {
    const payload = decodeBase64Url(token);
    if (!payload || payload.t !== PRODUCT_TOKEN_VERSION) return null;
    return payload;
  } catch {
    return null;
  }
}

export function encodeVariantRouteToken(payload = {}) {
  return encodeBase64Url({ t: VARIANT_TOKEN_VERSION, ...payload });
}

export function decodeVariantRouteToken(token) {
  try {
    const payload = decodeBase64Url(token);
    if (!payload || payload.t !== VARIANT_TOKEN_VERSION) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getProductPublicPath(product, options = {}) {
  const slug = getProductSlug(product);
  const urlSlug = getProductUrlSlug(product);
  const id = getProductId(product);
  const variantCode = getVariantRouteKey(options.variant) || options.variantCode || "";

  if (id || slug) {
    const token = encodeProductRouteToken({ p: id || slug, s: urlSlug || slug || undefined });
    const query = variantCode
      ? `?x=${encodeURIComponent(encodeVariantRouteToken({ v: variantCode }))}`
      : "";
    return `/products/i/${encodeURIComponent(token)}${query}`;
  }

  return "/products";
}

export function getProductListFromResponse(result) {
  const data = result?.data ?? result;
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  return (
    [data.products, data.items, data.results, data.hits, data.list].find(
      Array.isArray,
    ) || []
  );
}

export function composeProductVariantTitle(baseTitle, variantTitle) {
  const base = String(baseTitle || "").trim();
  const variant = String(variantTitle || "").trim();
  if (!variant || variant.toLowerCase() === "default title") return base;
  if (!base) return variant;

  const normalizedBase = base.toLowerCase();
  const normalizedVariant = variant.toLowerCase();
  if (
    normalizedBase === normalizedVariant ||
    normalizedBase.includes(normalizedVariant)
  ) {
    return base;
  }
  if (normalizedVariant.includes(normalizedBase)) return variant;
  return `${base} - ${variant}`;
}

export function getProductTitle(product, fallback = "Untitled product") {
  const baseTitle =
    product?.title ||
    product?.productTitle ||
    product?.product_title ||
    product?.name ||
    product?.productName ||
    fallback;
  const variantTitle =
    product?.selectedVariant?.title ||
    product?.variant?.title ||
    product?.variantTitle ||
    product?.variant_title;

  return composeProductVariantTitle(baseTitle, variantTitle);
}

function normalizeBooleanFlag(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes"].includes(normalized)) return true;
    if (["false", "0", "no"].includes(normalized)) return false;
  }
  return undefined;
}

export function isProductCodAvailable(product = {}) {
  const shippingCod = normalizeBooleanFlag(
    product?.shipping?.codAvailable ?? product?.shipping?.cod_available,
  );
  if (shippingCod !== undefined) return shippingCod;

  const metadataCod = normalizeBooleanFlag(
    product?.metadata?.codAvailable ?? product?.metadata?.cod_available,
  );
  if (metadataCod !== undefined) return metadataCod;

  return (
    normalizeBooleanFlag(
      product?.codAvailable ?? product?.cod_available ?? product?.cod,
    ) === true
  );
}

export function normalizeMoneyNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === "string") {
    const numericValue = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(numericValue) ? numericValue : undefined;
  }
  return undefined;
}

export function firstMoneyValue(...values) {
  for (const value of values) {
    const normalized = normalizeMoneyNumber(value);
    if (normalized !== undefined) return normalized;
  }
  return undefined;
}

function optionalDiscountPrice(value) {
  const normalized = normalizeMoneyNumber(value);
  return normalized && normalized > 0 ? normalized : undefined;
}

export function getVariantPrice(variant) {
  return firstMoneyValue(
    optionalDiscountPrice(variant?.salePrice),
    optionalDiscountPrice(variant?.sale_price),
    variant?.sellingPrice,
    variant?.selling_price,
    variant?.price,
    variant?.currentPrice,
    variant?.current_price,
  );
}

export function getDefaultVariant(product) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (!variants.length) return null;
  return (
    variants.find((variant) => variant?.isDefault === true) ||
    variants.find((variant) => variant?.status !== "inactive") ||
    variants[0] ||
    null
  );
}

export function getVariantMrp(variant) {
  return firstMoneyValue(
    variant?.mrp,
    variant?.compareAtPrice,
    variant?.compare_at_price,
    variant?.originalPrice,
    variant?.original_price,
    variant?.regularPrice,
    variant?.regular_price,
  );
}

export function getProductDealPrice(product) {
  return firstMoneyValue(
    product?.deal?.dealPrice,
    product?.dealPrice,
    product?.metadata?.dealPrice,
  );
}

export function getProductPrice(product) {
  const defaultVariant = getDefaultVariant(product);
  return firstMoneyValue(
    getProductDealPrice(product),
    getVariantPrice(defaultVariant),
    optionalDiscountPrice(product?.salePrice),
    optionalDiscountPrice(product?.sale_price),
    product?.sellingPrice,
    product?.selling_price,
    product?.price,
    product?.currentPrice,
    product?.current_price,
    product?.amount,
  );
}

export function getProductMrp(product) {
  const defaultVariant = getDefaultVariant(product);
  return firstMoneyValue(
    product?.deal?.originalPrice,
    getVariantMrp(defaultVariant),
    product?.mrp,
    product?.compareAtPrice,
    product?.compare_at_price,
    product?.originalPrice,
    product?.original_price,
    product?.regularPrice,
    product?.regular_price,
  );
}

export function sortProducts(products = [], sortKey = "") {
  if (!Array.isArray(products) || !products.length || !sortKey) return products;
  const list = [...products];

  switch (sortKey) {
    case "price_asc":
      return list.sort(
        (a, b) =>
          (Number(getProductPrice(a)) || 0) - (Number(getProductPrice(b)) || 0),
      );
    case "price_desc":
      return list.sort(
        (a, b) =>
          (Number(getProductPrice(b)) || 0) - (Number(getProductPrice(a)) || 0),
      );
    case "rating":
      return list.sort(
        (a, b) => Number(b?.rating || 0) - Number(a?.rating || 0),
      );
    case "newest":
      return list.sort(
        (a, b) =>
          new Date(b?.createdAt || b?.created_at || 0) -
          new Date(a?.createdAt || a?.created_at || 0),
      );
    default:
      return list;
  }
}

function normalizeStockNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function getAvailableStock(source) {
  if (!source || typeof source !== "object") return null;

  const explicitAvailable = normalizeStockNumber(
    source.availableStock ??
      source.available_stock ??
      source.sellableStock ??
      source.sellable_stock,
  );
  if (explicitAvailable !== null) {
    return Math.max(0, Math.floor(explicitAvailable));
  }

  const stock = normalizeStockNumber(
    source.stock ?? source.quantity ?? source.inventory ?? source.totalStock,
  );
  if (stock === null) return null;

  const reserved = normalizeStockNumber(
    source.reservedStock ?? source.reserved_stock,
  );

  return Math.max(0, Math.floor(stock - (reserved || 0)));
}

export function getProductAvailableStock(product) {
  if (!product || typeof product !== "object") return null;

  if (product.selectedVariant) {
    return getAvailableStock(product.selectedVariant);
  }

  const defaultVariant = getDefaultVariant(product);
  if (defaultVariant) {
    return getAvailableStock(defaultVariant);
  }

  return getAvailableStock(product);
}

export function getImageUrlFromValue(value) {
  if (!value) return "";
  if (typeof value === "string") return normalizeImageUrl(value);
  if (Array.isArray(value)) {
    return value.map(getImageUrlFromValue).find(Boolean) || "";
  }
  if (typeof value === "object") {
    return (
      [
        value.url,
        value.src,
        value.image,
        value.imageUrl,
        value.image_url,
        value.thumbnailUrl,
        value.thumbnail,
        value.thumbnail_url,
        value.path,
        value.secure_url,
        value.original,
        value.large,
        value.medium,
        value.small,
      ]
        .map(getImageUrlFromValue)
        .find(Boolean) || ""
    );
  }
  return "";
}

export function getProductImage(product) {
  return (
    getImageUrlFromValue(product?.selectedVariant?.images) ||
    getImageUrlFromValue(getDefaultVariant(product)?.images) ||
    getImageUrlFromValue(product?.images) ||
    getImageUrlFromValue(product?.image) ||
    getImageUrlFromValue(product?.imageUrl) ||
    getImageUrlFromValue(product?.thumbnail) ||
    getImageUrlFromValue(product?.images?.gallery)
  );
}

export function getProductBrandName(product) {
  return (
    product?.brand ||
    product?.brandName ||
    product?.manufacturer ||
    product?.vendor ||
    ""
  );
}

export function getProductRatingValue(product) {
  return Number(
    product?.rating ??
      product?.averageRating ??
      product?.avgRating ??
      product?.reviewsAverage ??
      0,
  );
}

export function buildFacetCountMap(products, resolver) {
  return (products || []).reduce((counts, product) => {
    const rawValue = resolver?.(product);
    const values = Array.isArray(rawValue) ? rawValue : [rawValue];

    values
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .forEach((value) => {
        counts[value] = (counts[value] || 0) + 1;
      });

    return counts;
  }, {});
}

export function buildRatingCountMap(products) {
  return [5, 4, 3, 2, 1].reduce((counts, stars) => {
    counts[String(stars)] = (products || []).filter(
      (product) => getProductRatingValue(product) >= stars,
    ).length;
    return counts;
  }, {});
}

export function isProductInStock(product) {
  const availableStock = getProductAvailableStock(product);

  if (product?.selectedVariant && availableStock !== null) {
    return availableStock > 0;
  }
  if (typeof product?.inStock === "boolean") return product.inStock;
  if (typeof product?.isInStock === "boolean") return product.isInStock;
  if (availableStock !== null) return availableStock > 0;
  return true;
}

const FALLBACK_PALETTES = [
  ["#12343B", "#E1B866"],
  ["#5B2A3E", "#E8C7B7"],
  ["#234D3C", "#A9D18E"],
  ["#243B6B", "#9EC5FE"],
  ["#4D3B2F", "#D8B384"],
];

export function getImageFallbackSrc(label = "Sam Global", context = "") {
  const text = String(label || context || "Sam Global")
    .trim()
    .slice(0, 50);
  const key = `${text} ${context}`;
  const paletteIndex =
    Array.from(key).reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    FALLBACK_PALETTES.length;
  const [from, to] = FALLBACK_PALETTES[paletteIndex];

  // Wrap text into lines of max 15 characters to make it fit
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";
  words.forEach((word) => {
    if ((currentLine + " " + word).trim().length <= 15) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);

  const displayLines = lines.slice(0, 3);
  const tspans = displayLines
    .map((line, idx) => {
      const safeLine = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const dy = idx === 0 ? `-${(displayLines.length - 1) * 0.6}em` : "1.2em";
      return `<tspan x="50%" dy="${dy}">${safeLine}</tspan>`;
    })
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="100%" stop-color="${to}" />
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="url(#bg)"/>
      <circle cx="650" cy="140" r="150" fill="#ffffff" opacity=".16"/>
      <circle cx="100" cy="690" r="180" fill="#ffffff" opacity=".12"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="72" font-weight="bold">
        ${tspans}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function applyImageFallback(event, label, context) {
  const img = event?.currentTarget;
  if (!img || img.dataset.fallbackApplied === "true") return;
  img.dataset.fallbackApplied = "true";
  img.src = getImageFallbackSrc(label, context);
}

export function clampRating(rating, max = 5) {
  return Math.max(0, Math.min(max, Number(rating) || 0));
}

export function getRatingStars(rating, max = 5) {
  const filled = clampRating(rating, max);
  return {
    filled,
    stars: "★★★★★".slice(0, filled),
    emptyStars: "☆☆☆☆☆".slice(0, max - filled),
  };
}
