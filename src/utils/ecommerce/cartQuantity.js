// UI limits mirror the existing cart cap, live stock and active deal limit.
// Server validation remains authoritative if availability changes after load.
export function getCartQuantityLimit(item = {}, stock = null) {
  const limits = [10];
  const deal = item.deal || item.productId?.deal || {};
  const dealLimit = Number(deal.maxQuantityPerOrder ?? deal.max_quantity_per_order);
  if (Number.isFinite(dealLimit) && dealLimit > 0) limits.push(Math.floor(dealLimit));
  if (stock !== null && stock !== undefined && Number.isFinite(Number(stock))) {
    limits.push(Math.max(0, Math.floor(Number(stock))));
  }
  return Math.min(...limits);
}

export function rollbackCartQuantities(current = {}, rejected = {}) {
  // A failed older request must not erase a newer quantity edit.
  return Object.fromEntries(Object.entries(current).filter(([key, quantity]) =>
    quantity !== rejected[key],
  ));
}

export function getReducedCartQuantity(current, limit) {
  // A new deal may lower the limit below an already-saved quantity. Reducing
  // directly to a valid value avoids repeated server rejections on every step.
  return Math.max(1, Math.min(Number(current) - 1, limit));
}
