export function getProductId(product) {
  return product?.id || product?._id || product?.productId || product?.sku || product;
}

export function getProductTitle(product, fallback = "Untitled product") {
  return product?.title || product?.name || product?.productName || fallback;
}

export function getProductImage(product) {
  return product?.images?.[0] || product?.image || product?.imageUrl || product?.thumbnail || "";
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
