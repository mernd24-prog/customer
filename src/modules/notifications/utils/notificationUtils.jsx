import {
  BellRing,
  FileText,
  Mail,
  MessageSquareText,
  Package,
  Tag,
  Truck,
  User,
  Bell,
  Smartphone,
} from "lucide-react";
import { AllOrdersIcon } from "../../../components/ui/icons";

export const formatRelativeTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export const getTypeConfig = (notif = {}) => {
  const eventName = (
    notif.payload?.eventName ||
    notif.type ||
    notif.subject ||
    ""
  ).toLowerCase();
  const title = (notif.title || notif.subject || "").toLowerCase();
  const body = (
    notif.template ||
    notif.message ||
    notif.body ||
    ""
  ).toLowerCase();

  if (
    eventName.startsWith("shipment") ||
    title.includes("shipment") ||
    title.includes("deliver") ||
    title.includes("transit") ||
    title.includes("dispatch") ||
    body.includes("shipment")
  ) {
    return {
      type: "shipments",
      icon: Truck,
      iconColor: "text-[#3E4093]",
      iconBg: "bg-[#3E4093]/10",
    };
  }
  if (
    eventName.startsWith("invoice") ||
    eventName.includes("payment") ||
    eventName.includes("credit_note") ||
    title.includes("invoice") ||
    title.includes("credit note") ||
    title.includes("receipt") ||
    title.includes("refund") ||
    title.includes("payment") ||
    body.includes("credit note") ||
    body.includes("invoice")
  ) {
    return {
      type: "invoices",
      icon: FileText,
      iconColor: "text-[#3E4093]",
      iconBg: "bg-[#3E4093]/10",
    };
  }
  if (
    eventName.includes("offer") ||
    eventName.includes("promo") ||
    title.includes("offer") ||
    title.includes("discount") ||
    title.includes("special") ||
    title.includes("coupon")
  ) {
    return {
      type: "offers",
      icon: Tag,
      iconColor: "text-[#CE9F2D]",
      iconBg: "bg-[#CE9F2D]/10",
    };
  }
  if (
    eventName.includes("user") ||
    eventName.includes("profile") ||
    title.includes("profile") ||
    title.includes("account") ||
    title.includes("security")
  ) {
    return {
      type: "account",
      icon: User,
      iconColor: "text-[#3E4093]",
      iconBg: "bg-[#3E4093]/10",
    };
  }
  return {
    type: "orders",
    icon: Package,
    iconColor: "text-[#3E4093]",
    iconBg: "bg-[#3E4093]/10",
  };
};

export const getNotificationFilterIcon = (value) => {
  const iconClass = "shrink-0 text-[var(--customer-gold-dark)]";
  switch (value) {
    case "all":
      return <AllOrdersIcon size={16} className={iconClass} />;
    case "unread":
      return <BellRing size={16} className={iconClass} />;
    case "orders":
      return <Package size={16} className={iconClass} />;
    case "shipments":
      return <Truck size={16} className={iconClass} />;
    case "invoices":
      return <FileText size={16} className={iconClass} />;
    case "offers":
      return <Tag size={16} className={iconClass} />;
    case "account":
      return <User size={16} className={iconClass} />;
    default:
      return <AllOrdersIcon size={16} className={iconClass} />;
  }
};

export const PREFERENCE_CHANNELS = [
  {
    key: "email",
    title: "Email Notifications",
    description:
      "Receive updates about your orders, offers and account activity via email.",
    icon: Mail,
  },
  {
    key: "sms",
    title: "SMS Notifications",
    description: "Get important updates directly on your mobile number.",
    icon: MessageSquareText,
  },
  {
    key: "push",
    title: "Push Notifications",
    description: "Stay informed with real-time updates on your device.",
    icon: Bell,
  },
  {
    key: "inApp",
    title: "In-app Notifications",
    description: "View all updates directly in the Sam Global app.",
    icon: Smartphone,
  },
];

export const FREQUENCY_OPTIONS = [
  { value: "real_time", label: "Real Time" },
  { value: "daily", label: "Daily Digest" },
  { value: "weekly", label: "Weekly Summary" },
];

export const TIMEZONE_OPTIONS = [
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST, UTC+05:30)" },
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST, UTC+04:00)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT, UTC+08:00)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
];
