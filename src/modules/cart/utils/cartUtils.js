import {
  getProductId,
  getProductImage,
  getImageFallbackSrc,
  getProductTitle,
  composeProductVariantTitle,
  getProductMrp,
  getProductDealPrice,
  getProductPrice,
  getVariantPrice,
} from "../../../utils/ecommerce";
import {
  getCartItemStock,
  normalizeCartItemId,
} from "../../../utils/ecommerce/cart";

export function adaptItemForCard(item, fullProduct = null) {
  const product = fullProduct || item.productId || {};
  const productId = item.productId?._id || getProductId(item.productId || {});
  const variantKey = item.variantId || item.variantSku || "";
  // Use only the plain product title (no variant baked in) as the base.
  // item.title is intentionally NOT used as a fallback here because it is
  // stored at add-to-cart time and may already contain a different variant's
  // name (e.g. "Adisa Bag – Brown"). Appending the current variantTitle on
  // top of that would yield "Adisa Bag – Brown – Peach".
  const rawProductTitle =
    product?.title ||
    product?.productTitle ||
    product?.product_title ||
    product?.name ||
    product?.productName;
  const baseTitle = rawProductTitle || item.title || "Product";
  const title = composeProductVariantTitle(baseTitle, item.variantTitle);
  let image =
    getProductImage(product) ||
    item.image ||
    getImageFallbackSrc(title, "cart");

  const fallbackProduct = item.productId || {};

  let livePrice = getProductPrice(product);
  let liveMrp = getProductMrp(product);
  const activeDealPrice =
    getProductDealPrice(item) ?? getProductDealPrice(product);
  const activeDealOriginalPrice =
    item?.deal?.originalPrice ??
    item?.deal?.original_price ??
    product?.deal?.originalPrice ??
    product?.deal?.original_price;

  const variantId = item.variantId || item.variantSku;
  if (variantId && product?.variants?.length) {
    const variant = product.variants.find(
      (v) => v._id === variantId || v.id === variantId || v.sku === variantId,
    );
    if (variant) {
      if (activeDealPrice === undefined) {
        livePrice = getVariantPrice(variant) ?? livePrice;
        liveMrp = variant.mrp ?? variant.oldPrice ?? liveMrp;
      }
      if (variant.images?.length > 0 || variant.image || variant.imageUrl) {
        image =
          getProductImage({ ...product, selectedVariant: variant }) || image;
      }
    }
  }

  let price =
    activeDealPrice ??
    livePrice ??
    item.price ??
    item.unitPrice ??
    item.unit_price ??
    item.salePrice ??
    getProductPrice(fallbackProduct) ??
    fallbackProduct.price ??
    fallbackProduct.sellingPrice ??
    0;
  const oldPrice =
    activeDealOriginalPrice ??
    liveMrp ??
    item.oldPrice ??
    item.mrp ??
    getProductMrp(fallbackProduct) ??
    fallbackProduct.mrp ??
    fallbackProduct.originalPrice;
  const productShippingInfo =
    product.shipping && typeof product.shipping === "object"
      ? product.shipping
      : {};
  const shipping =
    typeof item.shipping === "number"
      ? item.shipping
      : productShippingInfo.freeShipping
        ? 0
        : Number(
            productShippingInfo.shippingCharge ??
              productShippingInfo.additionalCost ??
              0,
          ) + Number(productShippingInfo.handlingCharge ?? 0);
  const quantity = item.quantity || 1;
  const seller = item.seller || product.seller?.name || product.brand;
  const condition = item.condition;
  const attributes = item.attributes || {};
  const color = item.color || item.selectedColor || attributes.color;
  const size = item.size || item.selectedSize || attributes.size;
  const rawStock = getCartItemStock(item, product);
  const stock =
    rawStock != null && !isNaN(Number(rawStock)) ? Number(rawStock) : null;
  const outOfStock = stock !== null && stock <= 0;
  const effectiveMaxStock = stock !== null ? stock : 999;
  const stockLimitReached = stock !== null && quantity >= effectiveMaxStock;
  const stockMessage = outOfStock
    ? "Out of stock"
    : stockLimitReached
      ? `Only ${stock} in stock`
      : "";
  const rating =
    item.rating ??
    item.averageRating ??
    product.rating ??
    product.averageRating ??
    product.ratingsAverage;
  const reviewCount =
    item.reviewCount ??
    item.reviewsCount ??
    product.reviewCount ??
    product.reviewsCount ??
    product.numReviews;

  return {
    id: normalizeCartItemId({
      productId,
      variantId: item.variantId,
      variantSku: variantKey,
    }),
    productId,
    variantId: item.variantId,
    variantSku: item.variantSku,
    title,
    image,
    price,
    oldPrice,
    shipping,
    quantity,
    seller,
    condition,
    color,
    size,
    rating,
    reviewCount,
    stock,
    maxQuantity: effectiveMaxStock,
    attributes,
    stockMessage,
    increaseDisabled: outOfStock || stockLimitReached,
    _raw: item,
  };
}
