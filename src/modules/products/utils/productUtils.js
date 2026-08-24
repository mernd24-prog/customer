import { firstMoneyValue, getImageUrlFromValue } from "../../../utils/ecommerce";

export const BUY_NOW_STORAGE_KEY = "sam_global_buy_now_items";

export const formatSellerAddress = (addr) => {
  if (!addr) return "";
  if (typeof addr === "string") return addr;
  if (typeof addr === "object") {
    const parts = [
      addr.line1,
      addr.line2,
      addr.street,
      addr.city,
      addr.state,
      addr.postalCode || addr.postal_code || addr.zip,
      addr.country,
    ].filter(Boolean);
    return parts.join(", ");
  }
  return "";
};

export const isImageSource = (src) => {
  if (!src || typeof src !== "string") return false;
  const value = src.trim();
  if (!value || value.startsWith("#")) return false;

  return (
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:image/") ||
    value.startsWith("blob:") ||
    /\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i.test(value)
  );
};

export const firstImageSource = (...values) =>
  values.map(getImageUrlFromValue).find(isImageSource) || "";

export const getActiveDealPrice = (product = {}) =>
  firstMoneyValue(
    product?.deal?.dealPrice,
    product?.dealPrice,
    product?.metadata?.dealPrice,
  );

export const getActiveDealOriginalPrice = (product = {}) =>
  firstMoneyValue(
    product?.deal?.originalPrice,
    product?.originalPrice,
    product?.compareAtPrice,
    product?.mrp,
  );

export const getColorSwatchImage = ({
  option,
  value,
  matchingVariant,
  product,
  index,
}) =>
  firstImageSource(
    option?.images?.[value],
    option?.imageUrls?.[value],
    option?.valueImages?.[value],
    option?.valueImageUrls?.[value],
    matchingVariant?.images,
    matchingVariant?.imageUrls,
    matchingVariant?.media?.images,
    matchingVariant?.gallery,
    matchingVariant?.imageUrl,
    matchingVariant?.image,
    matchingVariant?.thumbnail,
    product?.images?.[index],
    product?.images,
    product?.imageUrl,
    product?.image,
    product?.thumbnail,
  );
