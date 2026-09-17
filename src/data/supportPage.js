import { Phone, Mail, Ticket } from "lucide-react";

export const SUPPORT_CONTACT_ITEMS = [
  {
    icon: Phone,
    title: "+91 99154 29897",
    description: "Call Us",
    path: "/contact-us",
  },
  {
    icon: Mail,
    title: "info@samglobal1.com",
    description: "Email Support",
    path: "/contact-us",
  },
  {
    icon: Ticket,
    title: "Raise a Ticket",
    description: "Submit a ticket and we will get back",
  },
];

export const SUPPORT_BREADCRUMBS = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Help & Support",
  },
];

export const SUPPORT_TOPIC_IMAGE_BY_TITLE = {
  order: "/image/png/fallback/Help&Support/Track-order.png",
  track: "/image/png/fallback/Help&Support/Track-order.png",
  return: "/image/png/fallback/Help&Support/Return-refund.png",
  refund: "/image/png/fallback/Help&Support/Return-refund.png",
  payment: "/image/png/fallback/Help&Support/payment-issues.png",
  paying: "/image/png/fallback/Help&Support/payment-issues.png",
  account: "/image/png/fallback/Help&Support/account-security.png",
  security: "/image/png/fallback/Help&Support/account-security.png",
};

export const SUPPORT_FALLBACK_FAQS = [
  {
    title: "How do i cancel an order ?",
    description:
      "You can cancel your order directly from the My Orders section of your profile before the item is shipped.",
  },
  {
    title: "When will i receive my refund ?",
    description:
      "Refunds are processed within 5-7 business days after we receive and inspect the returned item.",
  },
  {
    title: "How do i track my order ?",
    description:
      "You can track your order using the Track Order option under Quick Actions.",
  },
  {
    title: "How do i contact a seller ?",
    description:
      "Go to the product detail page and use the Contact Seller option.",
  },
  {
    title: "How do i change my delivery address?",
    description:
      "You can update your delivery address from your Account settings.",
  },
  {
    title: "What payment methods do you accept?",
    description:
      "We accept major cards, UPI, net banking, mobile wallets, and eligible Cash on Delivery.",
  },
];

export const SUPPORT_FALLBACK_TOPICS = [
  {
    title: "Track Order",
    image: "/image/png/fallback/Help&Support/Track-order.png",
    path: "/orders",
  },
  {
    title: "Return & Refund",
    image: "/image/png/fallback/Help&Support/Return-refund.png",
    path: "/returns-refunds",
  },
  {
    title: "Payment Issues",
    image: "/image/png/fallback/Help&Support/payment-issues.png",
    path: "/payments",
  },
  {
    title: "Rewards Help",
    image: "/image/png/fallback/Help&Support/account-security.png",
    path: "#",
  },
  {
    title: "Account Security",
    image: "/image/png/fallback/Help&Support/account-security.png",
    path: "/account/profile",
  },
];
