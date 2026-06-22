import { FiBox } from "react-icons/fi";
import { Headphones } from "lucide-react";
import { Truck } from "lucide-react";

export const ORDER_STEPS = [
  "pending_payment",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "fulfilled",
];

export const ORDER_BREADCRUMBS = [
  { label: "Home", href: "/" },
  { label: "My Order", href: "/orders" },
];

export const TRACKING_LABELS = {
  pending_payment: "Payment pending",
  payment_failed: "Payment failed",
  confirmed: "Order confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  fulfilled: "Completed",
  return_requested: "Return requested",
  partially_returned: "Partially returned",
  returned: "Returned",
  cancelled: "Cancelled",
};

export const RETURN_STEPS = [
  "return_requested",
  "return_approved",
  "pickup_scheduled",
  "pickup_completed",
  "refund_initiated",
  "refund_completed",
];

export const INFO_TILE_TONES = {
  blue: "bg-[#E3E7F4] text-[#3E4093]",
  green: "bg-[#D8F1DA] text-[#1F9D55]",
  purple: "bg-[#E9D8F8] text-[#8B5CF6]",
  yellow: "bg-[#FFE8B5] text-[#CE9F2D]",
};

export const ORDER_FILTERS = [
  { label: "All", value: "" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Return", value: "return_requested" },
  { label: "Payment failed", value: "payment_failed" },
];

export const COMPACT_STATUS_BADGE = {
  delivered: "bg-[#0C9F45] text-white",
  fulfilled: "bg-[#0C9F45] text-white",
  partially_delivered: "bg-[#0C9F45] text-white",
  shipped: "bg-[#25247B] text-white",
  packed: "bg-[#25247B] text-white",
  out_for_delivery: "bg-[#25247B] text-white",
  confirmed: "bg-[#2F64E5] text-white",
  processing: "bg-[#D7A522] text-white",
  pending_payment: "bg-[#D7A522] text-white",
  payment_failed: "bg-[#D93636] text-white",
  cancelled: "bg-[#D93636] text-white",
};

export const items = [
  { icon: Headphones, title: "Contact Support" },
  { icon: FiBox, title: "Contact Support" },
  { icon: Truck, title: "Contact Support" },
];
