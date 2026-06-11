import { footer } from "../constants/image.constant";

export const footerData = {
  cmsKey: "footer-links",
  benefits: [
    {
      title: "100% Secure Payments",
      description: "Multiple sale payment options",
      icon: footer.payment,
      alt: "Payment",
    },
    {
      title: "Free Shipping",
      description: "On order above ₹999",
      icon: footer.shipping,
      alt: "Shipping",
    },
    {
      title: "Easy Returns",
      description: "Hassle-free 10 days return",
      icon: footer.return,
      alt: "Returns and exchanges",
    },
    {
      title: "24/7 Support",
      description: "We’re here to help you.",
      icon: footer.support,
      alt: "Support",
    },
  ],
  linkGroups: [
    {
      title: "Buy",
      links: [
        { label: "Men", href: "/categories/men" },
        { label: "Women", href: "/categories/women" },
        { label: "Kids", href: "/categories/kids" },
        { label: "Accessories", href: "/categories/accessories" },
        { label: "Footwear", href: "/categories/footwear" },
      ],
    },
    {
      title: "Sell",
      links: [
        { label: "Become a Seller", href: "/seller/status" },
        { label: "Seller Dashboard", href: "/seller/status" },
        { label: "Seller Policies", href: "/seller-policies" },
        { label: "Growth Support", href: "/growth-support" },
      ],
    },
    {
      title: "About SAM",
      links: [
        { label: "Who We Are", href: "/who-we-are" },
        { label: "Why Choose Us", href: "/about-us#why-choose-us" },
        { label: "Our Vision", href: "/our-commitment" },
        { label: "Careers", href: "/features" },
      ],
    },
    {
      title: "Tools & apps",
      links: [
        { label: "Mobile App", href: "/mobile-app" },
        { label: "Seller Tools", href: "/seller/status" },
        { label: "Analytics Dashboard", href: "/seller/tracking" },
      ],
    },
    {
      title: "Help & Contact",
      links: [
        { label: "Customer Support", href: "/support" },
        { label: "FAQs", href: "/faq" },
        { label: "Shipping & Delivery Policy", href: "/shipping-policy" },
        { label: "Returns", href: "/returns" },

        // Added policy routes
      ],
    },
    {
      title: "Community",
      links: [
        { label: "Blog", href: "/blog" },
        { label: "Updates", href: "/updates" },
        { label: "Announcements", href: "/announcements" },
      ],
    },
  ],
  actionLinks: [
    {
      label: "Become a Seller",
      href: "/seller/status",
      icon: footer.seller,
      alt: "Seller",
    },
    {
      label: "Advertise",
      href: "/advertise",
      icon: footer.advertise,
      alt: "Advertise",
    },
    {
      label: "Help Center",
      href: "/help-contact",
      icon: footer.help,
      alt: "Help center",
    },
  ],
  appDownload: {
    title: "Download our app for a faster and smarter shopping experience.",
    links: [
      {
        label: "Download on the App Store",
        href: "#",
        image: footer.appStore,
        alt: "Download on the App Store",
      },
      {
        label: "Get it on Google Play",
        href: "#",
        image: footer.playStore,
        alt: "Get it on Google Play",
      },
    ],
  },

  copyright: "© 2026 Samglobal Marketplace Pvt. Ltd. All rights reserved.",
  extrapages: [
    {
      labels: "Privacy Policy",
      links: "/privacy-policy",
    },
    {
      labels: "Terms of Use",
      links: "/terms-of-use",
    },
    {
      labels: "Cookie Settings",
      links: "/cookie-settings",
    },
    {
      labels: "Sitemap",
      links: "#",
    },
  ],
  socialLinks: [
    {
      label: "Instagram",
      href: "#",
      icon: footer.youtube,
      alt: "Instagram",
    },
    {
      label: "Facebook",
      href: "#",
      icon: footer.facebook,
      alt: "Facebook",
    },
    {
      label: "YouTube",
      href: "#",
      icon: footer.youtube,
      alt: "YouTube",
    },
  ],
};
