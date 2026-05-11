import { footer } from "../constant/image.constant";

export const footerData = {
  benefits: [
    {
      title: "10% Cashback on all App orders",
      description: "Enjoy exclusive savings on every purchase.",
      icon: footer.caseBack,
      alt: "Cashback",
    },
    {
      title: "30 days Easy Returns & Exchanges",
      description: "Hassle-free returns with customer-first cies.",
      icon: footer.exchange,
      alt: "Returns and exchanges",
    },
    {
      title: "Free & Fast Shipping",
      description: "Reliable and quick delivery across locations.",
      icon: footer.shipping,
      alt: "Shipping",
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
        { label: "Seller Policies", href: "/cms/seller-policies" },
        { label: "Growth Support", href: "/cms/growth-support" },
      ],
    },
    {
      title: "About SAM",
      links: [
        { label: "Who We Are", href: "/cms/who-we-are" },
        { label: "Why Choose Us", href: "/why-choose-us" },
        { label: "Our Commitment", href: "/our-commitment" },
        { label: "Features", href: "/features" },
      ],
    },
    {
      title: "Tools & apps",
      links: [
        { label: "Mobile App", href: "/cms/mobile-app" },
        { label: "Seller Tools", href: "/seller/status" },
        { label: "Analytics Dashboard", href: "/seller/tracking" },
      ],
    },
    {
      title: "Help & Contact",
      links: [
        { label: "Customer Support", href: "/support" },
        { label: "FAQs", href: "/faq" },
        { label: "Returns", href: "/returns" },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "Blog", href: "/cms/blog" },
        { label: "Updates", href: "/cms/updates" },
        { label: "Announcements", href: "/cms/announcements" },
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
      href: "/cms/advertise",
      icon: footer.advertise,
      alt: "Advertise",
    },
    {
      label: "Gift Cards",
      href: "/cms/gift-cards",
      icon: footer.gift,
      alt: "Gift cards",
    },
    {
      label: "Help Center",
      href: "/cms/customer-support",
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
  paymentMethods: [
    "VISA",
    "Mastercard",
    "Maestro",
    "American Express",
    "Diners Club",
    "Discover",
    "RuPay",
    "Net Banking",
    "Cash on Delivery",
    "Easy EMI",
  ],
  copyright: "Sam Global - Smart Choices. Better Living.",
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
