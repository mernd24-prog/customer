import {
  getProductId,
  getProductImage,
  getImageFallbackSrc,
  getProductTitle,
  getProductMrp,
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
  const baseTitle = getProductTitle(product, item.title || "Product");
  const title =
    item.variantTitle &&
    item.variantTitle !== "Default Title" &&
    item.variantTitle !== baseTitle
      ? `${baseTitle} - ${item.variantTitle}`
      : baseTitle;
  let image =
    getProductImage(product) ||
    item.image ||
    getImageFallbackSrc(title, "cart");

  const fallbackProduct = item.productId || {};

  let livePrice = getProductPrice(product);
  let liveMrp = getProductMrp(product);

  const variantId = item.variantId || item.variantSku;
  if (variantId && product?.variants?.length) {
    const variant = product.variants.find(
      (v) => v._id === variantId || v.id === variantId || v.sku === variantId,
    );
    if (variant) {
      livePrice = getVariantPrice(variant) ?? livePrice;
      liveMrp = variant.mrp ?? variant.oldPrice ?? liveMrp;
      if (variant.images?.length > 0 || variant.image || variant.imageUrl) {
        image =
          getProductImage({ ...product, selectedVariant: variant }) || image;
      }
    }
  }

  let price =
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
  const stock = getCartItemStock(item, product);
  const outOfStock = stock !== null && stock <= 0;
  const stockLimitReached = stock !== null && stock > 0 && quantity >= stock;
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
    attributes,
    stockMessage,
    increaseDisabled: outOfStock || stockLimitReached,
    _raw: item,
  };
}