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
  const title = getProductTitle(product, "Product");

  const category =
    product?.category?.name ||
    (typeof product?.category === "string" ? product.category : "") ||
    product?.subcategory?.name ||
    "";

  const price = getProductPrice(product) ?? product?.salePrice ?? "";
  const mrp = getProductMrp(product) ?? product?.originalPrice ?? "";

  const discount =
    mrp && price && Number(mrp) > Number(price)
      ? `${Math.round(((Number(mrp) - Number(price)) / Number(mrp)) * 100)}% Off`
      : product?.discount || "";

  return {
    title,
    category,
    price,
    mrp,
    discount,
    image: getProductImage(product) || getImageFallbackSrc(title, category),
  };
}
