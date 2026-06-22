import { FiBox } from "react-icons/fi";
import { Headphones } from "lucide-react";
import { Truck } from "lucide-react";
export const STATUS_BADGE = {
  pending_payment: "bg-amber-100 text-amber-700",
  payment_failed: "bg-red-100 text-red-700",
  confirmed: "bg-blue-100 text-blue-700",
  packed: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  partially_delivered: "bg-teal-100 text-teal-700",
  fulfilled: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  return_requested: "bg-amber-100 text-amber-700",
  return_approved: "bg-blue-100 text-blue-700",
  return_rejected: "bg-red-100 text-red-700",
  pickup_scheduled: "bg-indigo-100 text-indigo-700",
  pickup_completed: "bg-violet-100 text-violet-700",
  refund_initiated: "bg-sky-100 text-sky-700",
  refund_completed: "bg-emerald-100 text-emerald-700",
  partially_returned: "bg-orange-100 text-orange-700",
  partially_refunded: "bg-sky-100 text-sky-700",
  order_closed: "bg-gray-100 text-gray-600",
};
export const ORDER_STEPS = [
  "pending_payment",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "fulfilled",
];
export const TRACKING_LABELS = {
  pending_payment: "Payment pending",
  payment_failed: "Payment failed",
  confirmed: "Order confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery:"Out For Delivery",
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
  { label: "Out For Delivery", value: "out" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Return", value: "return_requested" },
  { label: "Payment failed", value: "payment_failed" },
];
 
export const COMPACT_STATUS_BADG = {
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