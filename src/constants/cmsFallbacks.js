const image = (url, alt = "", title = alt) => ({
  url,
  alt,
  title,
  caption: "",
  type: "image",
});

const point = (title, description, imageUrl = "", extra = {}) => ({
  title,
  description,
  image: imageUrl ? image(imageUrl, title, title) : {},
  cta: {},
  sortOrder: 0,
  ...extra,
});

const section = ({
  type,
  title = "",
  description = "",
  imageUrl = "",
  points = [],
  cta = {},
  sortOrder = 1,
}) => ({
  type,
  title,
  description,
  image: imageUrl ? image(imageUrl, title || type, title || type) : {},
  gallery: [],
  points: points.map((item, index) => ({ ...item, sortOrder: item.sortOrder ?? index + 1 })),
  cta,
  sortOrder,
});

const page = ({
  slug,
  title,
  pageType,
  description = "",
  excerpt = description,
  category = pageType,
  imageUrl = "",
  sections = [],
  cta = {},
}) => {
  const normalized = {
    slug,
    title,
    pageType,
    status: "published",
    published: true,
    description,
    excerpt,
    body: "",
    category,
    tags: [pageType, slug].filter(Boolean),
    image: imageUrl ? image(imageUrl, title, title) : {},
    heroImage: imageUrl || "",
    coverImage: imageUrl || "",
    thumbnailUrl: imageUrl || "",
    gallery: [],
    points: sections.flatMap((item) => item.points || []),
    cta,
    sections,
    metadata: {},
  };

  normalized.metadata = {
    data: {
      title,
      description,
      sections,
      points: normalized.points,
    },
  };

  return normalized;
};

const policies = {
  "terms-of-use": page({
    slug: "terms-of-use",
    title: "Terms of Use",
    pageType: "policy",
    description: "Please read these terms carefully before using Sam Global.",
    sections: [
      section({
        type: "content",
        title: "Please Read Carefully",
        description:
          "These Terms of Use explain the rules for accessing Sam Global, creating an account, placing orders, and using marketplace services.",
        points: [
          point("Eligibility", "You must be legally able to enter into a binding contract and provide accurate account information."),
          point("Account & User Responsibility", "You are responsible for maintaining account confidentiality and for all activities under your account."),
          point("Platform Usage", "Use the platform only for lawful purchases, browsing, communication, and seller interactions."),
          point("Product Information & Pricing", "Product details, availability, prices, discounts, and offers may change based on sellers and promotions."),
          point("Orders & Acceptance", "An order is confirmed only after validation, payment or COD checks, and seller or platform acceptance."),
          point("Payments", "Payments are processed through approved methods and may be subject to verification by payment partners."),
          point("Shipping, Returns & Refunds", "Shipping, returns, exchanges, and refunds are governed by the applicable Sam Global policies."),
          point("Marketplace Disclaimer", "Some products may be offered by third-party sellers responsible for their listed products and commitments."),
          point("Intellectual Property", "Sam Global names, content, designs, images, and platform materials may not be copied without permission."),
          point("Limitation of Liability", "Sam Global is not liable for indirect losses, service interruptions, or third-party actions beyond legal requirements."),
          point("Indemnity", "You agree to protect Sam Global from claims arising from misuse, violation of terms, or unlawful activity."),
          point("Termination", "Accounts or access may be restricted for misuse, fraud, policy breaches, or legal compliance."),
          point("Governing Law & Jurisdiction", "These terms are governed by Indian law and subject to the courts with applicable jurisdiction."),
          point("Contact", "For questions about these terms, contact Sam Global support through the help or contact page."),
        ],
      }),
    ],
  }),
  "return-refund-policy": page({
    slug: "return-refund-policy",
    title: "Return & Refund Policy",
    pageType: "policy",
    description: "Simple, transparent support for eligible returns, exchanges, and refunds.",
    sections: [
      section({
        type: "content",
        title: "Simple. Transparent. Hassle-Free.",
        description:
          "Our return and refund process is designed to resolve eligible product issues quickly while keeping customers and sellers protected.",
        points: [
          point("Return Eligibility", "Products must be unused, undamaged, and returned with original packaging, tags, accessories, and invoice where applicable."),
          point("Return Process", "Request a return from your order details and share the reason, photos, or required information."),
          point("Verification & Approval", "Returns may be inspected before approval, replacement, exchange, or refund processing."),
          point("Refund Process", "Approved refunds are issued to the original payment method or eligible wallet balance after verification."),
          point("Exchange Policy", "Exchanges depend on product availability, seller policy, and serviceability at the delivery location."),
          point("Non-Returnable Items", "Certain hygiene, personalized, perishable, clearance, or final-sale items may not be returnable."),
          point("Damaged / Incorrect Products", "Report damaged, missing, or incorrect products quickly with clear photos so support can assist."),
          point("Cancellation Policy", "Orders can be cancelled before shipment where cancellation is available for the item."),
          point("Need Help?", "Contact Sam Global support if a return, exchange, or refund needs additional assistance."),
        ],
      }),
    ],
  }),
  "shipping-delivery-policy": page({
    slug: "shipping-delivery-policy",
    title: "Shipping & Delivery Policy",
    pageType: "policy",
    description: "Designed for convenience and delivered with care.",
    sections: [
      section({
        type: "content",
        title: "Designed for Convenience. Delivered with Care.",
        description:
          "Shipping timelines, charges, and service availability may vary by product, seller, location, and logistics partner.",
        points: [
          point("Order Processing", "Orders are processed after confirmation, payment checks, inventory validation, and seller readiness."),
          point("Delivery Timelines", "Estimated delivery dates are shown during checkout and may vary due to location or logistics conditions."),
          point("Shipping Coverage", "Serviceability depends on the delivery pin code and courier availability."),
          point("Shipping Charges", "Charges may vary by order value, delivery location, product category, weight, or promotional offers."),
          point("Order Tracking", "Tracking details are shared after shipment and can be viewed from order details where available."),
          point("Delivery & Acceptance", "Please check the package at delivery and report visible damage or incorrect items promptly."),
          point("Need Assistance?", "For delivery help, contact support with your order ID and shipment details."),
        ],
      }),
    ],
  }),
  "privacy-policy": page({
    slug: "privacy-policy",
    title: "Privacy Policy",
    pageType: "policy",
    description: "How Sam Global handles customer, seller, and visitor information.",
    sections: [
      section({
        type: "content",
        title: "Your Privacy Matters",
        description:
          "This policy explains the information we collect, why we collect it, and how it supports a safer shopping and selling experience.",
        points: [
          point("Information We Collect", "We may collect account details, contact information, addresses, order activity, payment references, device data, and support messages."),
          point("How We Use Information", "Information is used to process orders, provide support, prevent fraud, improve services, and meet legal obligations."),
          point("Sharing Information", "We share information only with sellers, logistics partners, payment providers, service providers, or authorities when required for service or compliance."),
          point("Security", "We use reasonable safeguards to protect personal information from unauthorized access, misuse, or disclosure."),
          point("Your Choices", "You may update account details, manage communication preferences, or contact support for privacy-related requests."),
        ],
      }),
    ],
  }),
};

export const CMS_FALLBACK_PAGES = {
  "about-banner": page({
    slug: "about-banner",
    title: "About Banner",
    pageType: "about",
    category: "about",
    imageUrl: "/image/png/bannerFestival.png",
    sections: [
      section({
        type: "about-banner",
        imageUrl: "/image/png/bannerFestival.png",
      }),
    ],
  }),
  "about-sam-global": page({
    slug: "about-sam-global",
    title: "About Sam Global",
    pageType: "about",
    category: "about",
    sections: [
      section({
        type: "about-sam-global",
        title: "About Sam Global",
        description:
          "Sam Global is built on years of retail, distribution, and customer selling experience. We are creating a dependable marketplace where customers can discover quality products and sellers can grow with confidence.",
        imageUrl: "/image/png/Fashion.png",
      }),
    ],
  }),
  "our-values": page({
    slug: "our-values",
    title: "Our Values",
    pageType: "about",
    category: "about",
    sections: [
      section({
        type: "our-values",
        title: "Our Values",
        points: [
          point("Execution Excellence", "Every process is guided by discipline, clarity, and reliable delivery.", "/image/svg/expertise.svg"),
          point("Customer First", "We build around customer trust, useful choices, and smooth service.", "/image/svg/consumer.svg"),
          point("Scalable Growth", "We grow with repeatable systems that support customers, sellers, and teams.", "/image/svg/performance.svg"),
        ],
      }),
    ],
  }),
  "indian-brand": page({
    slug: "indian-brand",
    title: "Indian Brands",
    pageType: "about",
    category: "about",
    sections: [
      section({
        type: "indian-brand",
        title: "Indian Brands",
        description: "A marketplace experience shaped for Indian customers and ambitious brands.",
        points: [
          point("Fashion", "Everyday style and seasonal essentials.", "/image/png/Fashion.png"),
          point("Home", "Useful finds for homes and living spaces.", "/image/webp/home-decor.webp"),
          point("Support", "Service that keeps shopping simple.", "/image/svg/customer-support.svg"),
        ],
      }),
    ],
  }),
  "why-choose-us": page({
    slug: "why-choose-us",
    title: "Why Choose Us",
    pageType: "about",
    category: "about",
    sections: [
      section({
        type: "why-choose-us",
        title: "Why Choose Us",
        points: [
          point("Proven Sales Expertise", "Built by teams who understand commerce and customer behavior.", "/image/svg/expertise.svg"),
          point("Strong Retail Execution", "Focused on consistency from catalog to checkout.", "/image/svg/performance.svg"),
          point("Consumer Understanding", "Designed around practical needs, value, and trust.", "/image/svg/consumer.svg"),
          point("Long-Term Partnerships", "A platform for sellers and partners to grow sustainably.", "/image/svg/partnership.svg"),
        ],
      }),
    ],
  }),
  "our-mission": page({
    slug: "our-mission",
    title: "Our Mission",
    pageType: "about",
    category: "about",
    sections: [
      section({
        type: "our-mission",
        title: "Our Mission",
        description:
          "Our mission is to build a trusted digital marketplace where customers can shop with clarity and sellers can grow with confidence.<br /><br />We aim to make quality products more accessible through dependable technology, transparent service, and a customer-first approach.",
        imageUrl: "/image/png/seller-support.png",
      }),
    ],
  }),
  "faq-details": page({
    slug: "faq-details",
    title: "Frequently Asked Questions",
    pageType: "faq",
    description: "Find quick answers about shopping, delivery, returns, payments, accounts, and selling on Sam Global.",
    sections: [
      section({
        type: "faq-category",
        title: "Shopping & Orders",
        points: [
          point("How do I place an order?", "Browse products, add items to cart, choose delivery and payment details, then confirm your order."),
          point("How can I track my order?", "Open order details from your account to view tracking updates after shipment."),
          point("Can I modify or cancel my order?", "Eligible orders can be cancelled before shipment from order details."),
        ],
      }),
      section({
        type: "faq-category",
        title: "Returns & Refunds",
        points: [
          point("How do I request a return?", "Open your order, select the item, and submit a return request with the required details."),
          point("When will I receive my refund?", "Approved refunds are processed after item verification and payment partner timelines."),
        ],
      }),
      section({
        type: "faq-category",
        title: "For Brands & Partners",
        points: [
          point("How can I sell on Sam Global?", "Visit Become a Seller and complete the onboarding details for review."),
        ],
      }),
    ],
  }),
  "promo-campaign-carousel": page({
    slug: "promo-campaign-carousel",
    title: "Campaign Carousel",
    pageType: "home",
    category: "home",
    sections: [
      section({
        type: "promo-campaign-carousel",
        title: "Featured Campaigns",
        points: [
          point("End of Season Sale", "Save on fashion and everyday essentials.", "/image/png/bannerFestival.png", { cta: { label: "Shop Now", url: "/products" } }),
          point("Fresh Home Finds", "Refresh your home with practical picks.", "/image/webp/home-decor.webp", { cta: { label: "Explore", url: "/categories" } }),
          point("New Arrivals", "Discover recently added products.", "/image/png/Fashion.png", { cta: { label: "View New", url: "/products?sort=newest" } }),
        ],
      }),
    ],
  }),
  "shopping-banner": page({
    slug: "shopping-banner",
    title: "Shopping Made Easy",
    pageType: "home",
    category: "home",
    imageUrl: "/image/png/bannerFestival.png",
    sections: [
      section({
        type: "shopping-banner",
        title: "Shopping Made Easy",
        description: "50% OFF",
        imageUrl: "/image/png/bannerFestival.png",
        points: [point("50", "Limited time marketplace offers")],
        cta: { label: "Shop Now", url: "/products" },
      }),
    ],
  }),
  "become-a-seller": page({
    slug: "become-a-seller",
    title: "Grow Your Business\nwith Sam Global",
    pageType: "seller",
    description: "Reach more customers, manage orders easily, and get reliable seller support.",
    excerpt: "Reach more customers, manage orders easily, and get reliable seller support.",
    imageUrl: "/image/svg/seller.svg",
    sections: [
      section({
        type: "seller-stories",
        title: "Seller Stories",
        points: [
          point("Local Fashion Store", "Sam Global helped us reach more customers with less operational friction.", "/image/png/person.png", { cta: { label: "Growing steadily" } }),
          point("Home Essentials Supplier", "Catalog tools and order visibility made daily selling easier.", "/image/png/seller-support.png", { cta: { label: "More repeat orders" } }),
          point("Lifestyle Brand", "The marketplace gave our products a cleaner digital storefront.", "/image/png/Fashion.png", { cta: { label: "Better discovery" } }),
        ],
      }),
      section({
        type: "seller-benefits",
        title: "Why Suppliers Love Sam Global",
        points: [
          point("Wider Reach", "List products for customers looking across categories."),
          point("Order Management", "Manage orders, status updates, and fulfillment workflows."),
          point("Secure Payouts", "Track seller payouts and payment status clearly."),
          point("Seller Support", "Get help for onboarding, catalog, and operational questions."),
        ],
      }),
      section({
        type: "seller-steps",
        title: "How Selling on Sam Global Works",
        points: [
          point("Create your account", "Register with your business and contact details."),
          point("Complete verification", "Submit required KYC, pickup, and bank details."),
          point("Upload products", "Add catalog information, prices, and inventory."),
          point("Start receiving orders", "Fulfill orders and track payouts from your seller dashboard."),
        ],
      }),
    ],
  }),
  "seller-policy": page({
    slug: "seller-policy",
    title: "Seller Policy",
    pageType: "seller",
    description: "Guidelines for selling responsibly on Sam Global.",
    excerpt: "Trusted marketplace standards",
    imageUrl: "/image/png/seller-support.png",
    cta: { label: "Become a Seller", url: "/become-a-seller" },
    sections: [
      section({
        type: "policy-guidelines",
        title: "Sell Confidently With Clear Guidelines",
        description: "These standards help keep marketplace operations fair, transparent, and reliable.",
        points: [
          point("Accurate Listings", "Product titles, images, pricing, inventory, and descriptions must be accurate."),
          point("Quality Fulfillment", "Pack orders safely and hand them over within promised timelines."),
          point("Customer Trust", "Resolve seller-side issues promptly and follow platform communication standards."),
        ],
      }),
      section({
        type: "seller-responsibilities",
        title: "Seller Responsibilities",
        description: "Every seller is expected to keep product, tax, pickup, and service details up to date.",
        points: [
          point("Maintain Inventory", "Keep stock, pricing, and availability accurate."),
          point("Follow Packaging Rules", "Use safe packaging suitable for the product category."),
          point("Honor Policies", "Support eligible returns, refunds, and exchanges under platform rules."),
          point("Protect Customers", "Do not misuse customer data or contact details."),
        ],
      }),
      section({
        type: "account-compliance",
        title: "Account Health & Compliance",
        description: "Accounts may be reviewed for quality, fraud prevention, customer complaints, or policy breaches.",
        points: [
          point("KYC Compliance", "Submit valid business, tax, and bank details where required."),
          point("Performance Review", "Order cancellations, late shipments, and disputes may affect account standing."),
          point("Policy Action", "Repeated or serious violations may result in listing restrictions or account suspension."),
        ],
      }),
    ],
  }),
  "seller-policies": null,
  "who-we-are": page({
    slug: "who-we-are",
    title: "Who We Are",
    pageType: "about",
    description: "Sam Global is a trusted marketplace for customers and sellers.",
    imageUrl: "/image/png/bannerFestival.png",
    sections: [
      section({
        type: "content",
        title: "Who We Are",
        description:
          "Sam Global connects customers with dependable products and gives sellers a platform built for growth, service, and operational clarity.",
        imageUrl: "/image/png/bannerFestival.png",
      }),
    ],
  }),
  ...policies,
};

CMS_FALLBACK_PAGES["seller-policies"] = {
  ...CMS_FALLBACK_PAGES["seller-policy"],
  slug: "seller-policies",
};

export const FALLBACK_CATEGORIES = [
  {
    id: "fallback-fashion",
    categoryKey: "fashion",
    title: "Fashion",
    displayName: "Fashion",
    image: "/image/png/Fashion.png",
    isDashboardVisible: true,
    active: true,
  },
  {
    id: "fallback-home-decor",
    categoryKey: "home-decor",
    title: "Home Decor",
    displayName: "Home Decor",
    image: "/image/webp/home-decor.webp",
    isDashboardVisible: true,
    active: true,
  },
  {
    id: "fallback-kids",
    categoryKey: "kids",
    title: "Kids Collection",
    displayName: "Kids Collection",
    image: "/image/webp/kids-fashion.webp",
    isDashboardVisible: true,
    active: true,
  },
  {
    id: "fallback-deals",
    categoryKey: "deals",
    title: "Deals",
    displayName: "Deals",
    image: "/image/png/bannerFestival.png",
    isDashboardVisible: true,
    active: true,
  },
];

const isObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value);

const hasValue = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (isObject(value)) return Object.keys(value).length > 0 && Object.values(value).some(hasValue);
  return value !== undefined && value !== null && value !== "";
};

const mergeArrayByIndex = (current = [], fallback = []) => {
  const maxLength = Math.max(current.length, fallback.length);
  return Array.from({ length: maxLength }, (_, index) =>
    mergeCmsFallback(current[index], fallback[index]),
  ).filter(hasValue);
};

export function mergeCmsFallback(current, fallback) {
  if (!hasValue(current)) return fallback || current;
  if (!hasValue(fallback)) return current;

  if (Array.isArray(current) || Array.isArray(fallback)) {
    return mergeArrayByIndex(
      Array.isArray(current) ? current : [],
      Array.isArray(fallback) ? fallback : [],
    );
  }

  if (isObject(current) && isObject(fallback)) {
    const keys = new Set([...Object.keys(fallback), ...Object.keys(current)]);
    return Array.from(keys).reduce((acc, key) => {
      acc[key] = mergeCmsFallback(current[key], fallback[key]);
      return acc;
    }, {});
  }

  return hasValue(current) ? current : fallback;
}

export function getCmsFallbackPage(slug) {
  return CMS_FALLBACK_PAGES[slug] || null;
}

export function withCmsFallback(pageRecord, slug) {
  const fallback = getCmsFallbackPage(slug || pageRecord?.slug);
  return mergeCmsFallback(pageRecord, fallback);
}
