import {
  getProductId,
  getProductImage,
  getProductTitle,
  getImageFallbackSrc,
  getProductAvailableStock,
  getProductMrp,
  getProductPrice,
} from "../../utils/ecommerce";

export function adaptProductToItem(product, quantity = 1) {
  const rawProductId = getProductId(
    product?.productId ||
      product?._raw?.productId ||
      product?.product ||
      product?._raw ||
      product,
  );
  const id = product?.wishlistKey || rawProductId;
  const title = getProductTitle(product, "Product");
  const image =
    getProductImage(product) || getImageFallbackSrc(title, "watchlist");
  const price = getProductPrice(product) ?? 0;
  const oldPrice = getProductMrp(product);
  const stock = getProductAvailableStock(product);
  const stockQuantity = stock == null ? null : Number(stock);
  const hasStockQuantity = Number.isFinite(stockQuantity);
  const outOfStock = hasStockQuantity && stockQuantity <= 0;
  const stockLimitReached =
    hasStockQuantity && stockQuantity > 0 && quantity >= stockQuantity;
  const stockMessage = outOfStock
    ? "Out of stock"
    : stockLimitReached
      ? `Only ${stockQuantity} in stock`
      : "";
  const rating =
    product?.rating ??
    product?.averageRating ??
    product?.ratingsAverage ??
    null;
  const reviewCount =
    product?.reviewCount ??
    product?.reviewsCount ??
    product?.numReviews ??
    null;

  return {
    id,
    productId: rawProductId,
    title,
    image,
    price,
    oldPrice,
    quantity,
    shipping: 0,
    seller: product?.seller?.name || product?.seller || product?.brand || "",
    color:
      product?.selectedVariant?.attributes?.color ||
      product?.color ||
      product?.selectedColor ||
      null,
    size: product?.size || product?.selectedSize || null,
    stock: hasStockQuantity ? stockQuantity : null,
    rating,
    reviewCount,
    attributes: product?.selectedVariant?.attributes || {},
    increaseDisabled: outOfStock || stockLimitReached,
    stockMessage,
    _raw: product,
  };
}
