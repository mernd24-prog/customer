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

export function getProductTitle(product, fallback = "Untitled product") {
  return product?.title || product?.name || product?.productName || fallback;
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

export function getVariantPrice(variant) {
  return firstMoneyValue(
    variant?.salePrice,
    variant?.sale_price,
    variant?.sellingPrice,
    variant?.selling_price,
    variant?.price,
    variant?.currentPrice,
    variant?.current_price,
  );
}

export function getProductPrice(product) {
  return firstMoneyValue(
    product?.salePrice,
    product?.sale_price,
    product?.sellingPrice,
    product?.selling_price,
    product?.price,
    product?.currentPrice,
    product?.current_price,
    product?.amount,
  );
}

export function getProductMrp(product) {
  return firstMoneyValue(
    product?.mrp,
    product?.compareAtPrice,
    product?.compare_at_price,
    product?.originalPrice,
    product?.original_price,
    product?.regularPrice,
    product?.regular_price,
  );
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

  const variants = Array.isArray(product.variants) ? product.variants : [];
  if (variants.length) {
    const variantStocks = variants
      .filter(
        (variant) =>
          variant?.status !== "inactive" && variant?.status !== "out_of_stock",
      )
      .map(getAvailableStock)
      .filter((value) => value !== null);

    if (variantStocks.length) {
      return variantStocks.reduce((total, value) => total + value, 0);
    }
  }

  return getAvailableStock(product);
}

export function getImageUrlFromValue(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map(getImageUrlFromValue).find(Boolean) || "";
  }
  if (typeof value === "object") {
    return (
      [
        value.url,
        value.src,
        value.imageUrl,
        value.thumbnailUrl,
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
    
      <rect width="800" height="800" fill="url(#bg)"/>
      <circle cx="650" cy="140" r="150" fill="#ffffff" opacity=".16"/>
      <circle cx="100" cy="690" r="180" fill="#ffffff" opacity=".12"/>
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
