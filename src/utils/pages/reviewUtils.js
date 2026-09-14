import {
  getImageFallbackSrc,
  getProductImage,
  getProductMrp,
  getProductPrice,
  getProductTitle,
} from "../../utils/ecommerce";

export function getReviewTime(review) {
  const value = review?.createdAt || review?.updatedAt || review?.date;
  const time = value ? new Date(value).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

export function sortReviews(reviews, sort) {
  return [...reviews].sort((a, b) => {
    if (sort === "highest") {
      return Number(b?.rating || 0) - Number(a?.rating || 0);
    }
    if (sort === "lowest") {
      return Number(a?.rating || 0) - Number(b?.rating || 0);
    }
    if (sort === "helpful") {
      return (
        Number(b?.helpfulVotes ?? b?.helpful ?? 0) -
        Number(a?.helpfulVotes ?? a?.helpful ?? 0)
      );
    }

    return getReviewTime(b) - getReviewTime(a);
  });
}

export function getUserDisplayName(user = {}) {
  const first = user.profile?.firstName || user.firstName || "";
  const last = user.profile?.lastName || user.lastName || "";
  return (
    [first, last].filter(Boolean).join(" ").trim() ||
    user.fullName ||
    user.displayName ||
    user.name ||
    user.email ||
    ""
  );
}

export function getProductDisplay(product) {
  const p = product?.data || product || {};
  const title = getProductTitle(p, "Product");

  const category =
    p?.category?.name ||
    (typeof p?.category === "string" ? p.category : "") ||
    p?.subcategory?.name ||
    "";
  const brand =
    p?.brand?.name ||
    (typeof p?.brand === "string" ? p.brand : "") ||
    p?.brandName ||
    p?.sellerName ||
    "";

  const price = getProductPrice(p) ?? p?.salePrice ?? "";
  const mrp = getProductMrp(p) ?? p?.originalPrice ?? "";

  const discount =
    mrp && price && Number(mrp) > Number(price)
      ? `${Math.round(((Number(mrp) - Number(price)) / Number(mrp)) * 100)}% Off`
      : p?.discount || "";

  const image = getProductImage(p) || getImageFallbackSrc(title, category);
  const id = p?._id || p?.id || p?.productId || "";
  const slug = p?.slug || p?.handle || p?.seoSlug || "";
  const publicCode = p?.publicCode || p?.public_code || "";

  return {
    id,
    _id: id,
    slug,
    publicCode,
    title,
    brand,
    category,
    price,
    mrp,
    discount,
    image,
    rawProduct: p,
  };
}
