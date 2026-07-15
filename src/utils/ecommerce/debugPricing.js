import {
  calcMRPSubtotal,
  calcSellingSubtotal,
  calcShippingTotal,
  calcTotalSavings,
} from "./money";

/**
 * Utility to log the cart API response and price calculations in a single place.
 * Call this function passing your raw items or adapted items to debug pricing in the console.
 * 
 * Example usage in CartPage.jsx:
 * import { debugCartPricing } from "../../utils/ecommerce/debugPricing";
 * debugCartPricing(items);
 */
export function debugCartPricing(items = []) {
  if (!items || items.length === 0) {
    // Fail silently to avoid spamming the console when the cart is empty or loading
    return;
  }

  console.group("🛒 [Cart Pricing Debug]");
  
  console.log("📦 Raw Items API Response Data:", items);

  // 1. Log Item-Level Breakdown
  const itemBreakdown = items.map((item, index) => ({
    Index: index + 1,
    Title: item.title || item.productId?.title || "Unknown",
    Quantity: item.quantity,
    "Selling Price (Per Unit)": item.price,
    "MRP (Per Unit)": item.oldPrice ?? item.mrp ?? item.price,
    Shipping: item.shipping ?? 0,
    "Item Subtotal": (item.price ?? 0) * (item.quantity ?? 1)
  }));
  
  console.log("🔍 Item-Level Breakdown:");
  console.table(itemBreakdown);

  // 2. Log Total Calculations
  const mrpSubtotal = calcMRPSubtotal(items);
  const sellingSubtotal = calcSellingSubtotal(items);
  const shippingTotal = calcShippingTotal(items);
  const productSavings = calcTotalSavings(items);

  const totals = {
    "Total MRP (Before Discount)": mrpSubtotal,
    "Total Selling Subtotal": sellingSubtotal,
    "Total Product Savings": productSavings,
    "Total Shipping": shippingTotal,
    "Final Payable (Pre-Tax/Coupon)": sellingSubtotal + shippingTotal,
  };

  console.log("💰 Final Totals Calculation:");
  console.table(totals);

  console.groupEnd();
}
