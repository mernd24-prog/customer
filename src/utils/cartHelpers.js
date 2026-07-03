

import { firstDefined } from "./orderHelpers";

export const getProductId = (item = {}) => {
  const product = item.productId || item.product_id || item.product || item;
  return typeof product === "object"
    ? firstDefined(product._id, product.id, product.productId, product.sku)
    : product;
};

export const getProductTitle = (item = {}) => {
  const product = item.productId || item.product_id || item.product;
  return typeof product === "object"
    ? firstDefined(
        product.title,
        product.name,
        product.sku,
        product._id,
        product.id,
      )
    : product;
};

// ---------------------------------------------------------------------------
// Cart estimate
// ---------------------------------------------------------------------------

export const cartEstimate = (items = []) =>
  items.reduce((sum, item) => {
    const product = item.productId || item.product_id || item.product || {};
    const unit = Number(
      firstDefined(
        item.unitPrice,
        item.unit_price,
        product.salePrice,
        product.price,
        0,
      ),
    );
    return sum + unit * Number(item.quantity || 0);
  }, 0);
