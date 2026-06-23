/**
 * Shared formatting utilities for the Customer storefront.
 * All functions return a safe string — never null, undefined, or raw DB keys.
 *
 * Currency / money helpers live in utils/ecommerce/money.js.
 * Import from here for date, label, phone, and address formatting.
 */

// ── Date / Time ───────────────────────────────────────────────────────────────

/**
 * Format a date to "DD MMM YYYY" (e.g. "23 Jun 2026").
 * Returns "Not available" for falsy/invalid values.
 */
export function formatDate(value, fallback = "Not available") {
  if (!value) return fallback;
  const d = new Date(value);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a date-time to "DD MMM YYYY, HH:MM" (24-hour).
 * Returns "Not available" for falsy/invalid values.
 */
export function formatDateTime(value, fallback = "Not available") {
  if (!value) return fallback;
  const d = new Date(value);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Show "Today", "Yesterday", or fall back to formatDate.
 */
export function formatRelativeDate(value, fallback = "Not available") {
  if (!value) return fallback;
  const d = new Date(value);
  if (isNaN(d.getTime())) return fallback;
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return formatDate(value, fallback);
}

// ── Labels ────────────────────────────────────────────────────────────────────

/**
 * Convert a raw DB key / enum value to a human-readable title-cased label.
 * Examples:
 *   "order_status"      → "Order Status"
 *   "pending_payment"   → "Pending Payment"
 *   ""                  → "Not available"
 */
export function formatLabel(value, fallback = "Not available") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value)
    .replace(/[_\-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || fallback;
}

// ── Phone ─────────────────────────────────────────────────────────────────────

/**
 * Format a phone number for display.
 * Adds +91 prefix for 10-digit Indian numbers.
 */
export function formatPhone(value, fallback = "Not available") {
  if (!value) return fallback;
  const digits = String(value).replace(/\D/g, "");
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  if (digits.length === 12 && digits.startsWith("91"))
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  return value;
}

// ── Address ───────────────────────────────────────────────────────────────────

/**
 * Format an address object into a single readable string.
 */
export function formatAddress(addr, fallback = "Not available") {
  if (!addr || typeof addr !== "object") return fallback;
  const parts = [
    addr.line1 || addr.address_line1,
    addr.line2 || addr.address_line2,
    addr.city,
    addr.state,
    addr.postalCode || addr.postal_code || addr.pincode || addr.zip,
    addr.country,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : fallback;
}

// ── Name ──────────────────────────────────────────────────────────────────────

/**
 * Derive a display name from a user/profile object.
 */
export function formatName(user, fallback = "Not available") {
  if (!user) return fallback;
  const first = user.profile?.firstName || user.firstName || "";
  const last = user.profile?.lastName || user.lastName || "";
  const full = [first, last].filter(Boolean).join(" ").trim();
  return full || user.full_name || user.fullName || user.name || user.email || fallback;
}

// ── Order status ──────────────────────────────────────────────────────────────

/** Human-readable label overrides for order/return status values. */
const ORDER_STATUS_LABELS = {
  pending_payment:      "Payment Pending",
  payment_failed:       "Payment Failed",
  confirmed:            "Confirmed",
  packed:               "Packed",
  shipped:              "Shipped",
  out_for_delivery:     "Out for Delivery",
  delivered:            "Delivered",
  return_requested:     "Return Requested",
  partially_returned:   "Partially Returned",
  returned:             "Returned",
  cancelled:            "Cancelled",
  // Returns
  requested:            "Requested",
  approved:             "Approved",
  rejected:             "Rejected",
  refund_pending:       "Refund Pending",
  refunded:             "Refunded",
  replacement_pending:  "Replacement Pending",
  replaced:             "Replaced",
  closed:               "Closed",
};

/**
 * Get a human-readable order/return status label.
 * Falls back to formatLabel for unknown values.
 */
export function formatOrderStatus(status, fallback = "Pending") {
  if (!status) return fallback;
  const key = String(status).toLowerCase();
  return ORDER_STATUS_LABELS[key] || formatLabel(status, fallback);
}
