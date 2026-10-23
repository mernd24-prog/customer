import { SELLER_LOGIN_URL } from "../config/seller";
import {
  CANONICAL_FAQ_DATA,
  CANONICAL_POLICY_DATA,
} from "./canonicalLegalContent";

const image = (url, alt = "") => ({ url, alt });
export const FALLBACK_CONTACT_PAGE = {
  title: "Contact us",
  excerpt: "Get in touch with Sam Global for support, inquiries, or feedback.",
  sections: [
    {
      type: "content",
      title: "contact-info",
      description: "",
      points: [
        { title: "Email", description: "info@samglobal1.com" },
        { title: "Phone", description: "+91 99154 29897" },
        { title: "Working Hours", description: "Mon - Sat\n 09:00 AM - 07:00 PM" },
        {
          title: "Office",
          description:
            "202, KINGSTON1 OMAXE ROYAL RESIDENCY, PAKHOWAL ROAD, Lalton Kalan, Ludhiana, Ludhiana punjab 142022",
        },
      ],
    },
    {
      type: "content",
      title: "subject",
      description: "",
      points: [
        { title: "Order Issue", description: "" },
        { title: "Payment", description: "" },
        { title: "Return", description: "" },
        { title: "Seller Support", description: "" },
        { title: "Technical", description: "" },
      ],
    },
  ],
};
export const FALLBACK_HERO_SLIDES = [
  [
    "HeroImg1.jpg",
    "END OF SEASON SALE | UP TO 50% OFF",
    "Shop Smarter Across",
    "Every Category",
    "Discover premium accessories, smart gadgets, travel gear, and everyday essentials designed to complement your modern lifestyle.",
  ],
  [
    "HeroImg2.jpg",
    "NEW ARRIVALS",
    "Upgrade Your Daily",
    "Lifestyle Essentials",
    "From premium laptops and wireless headphones to everyday gadgets and accessories, find everything you need at unbeatable prices.",
  ],
  [
    "HeroImg3.jpg",
    "LIMITED TIME OFFERS | SAVE UP TO 50%",
    "Upgrade Your Lifestyle",
    "With Smart Tech",
    "Discover stylish fashion, beauty, and everyday essentials curated for every occasion. Find quality products that bring comfort, confidence, and effortless style to your everyday life.",
  ],
].map(([file, badge, title, highlight, description], index) => ({
  id: `static-hero-${index + 1}`,
  image: `/image/png/fallback/${file}`,
  badge,
  title,
  highlight,
  description,
  primaryButton: "Shop Now",
  primaryLink: "/products",
  secondaryButton: "Explore Categories",
  secondaryLink: "/categories",
}));
export const FALLBACK_PROMO_CARDS = [
  [
    "diwali.webp",
    "Diwali Special Collection",
    "Celebrate the Festival of Lights with beautiful festive décor, traditional diyas, and special gifts for every occasion",
    "Explore now",
  ],
  [
    "diwali3.webp",
    "Diwali Festive Wear",
    "Shine this Diwali with elegant ethnic outfits, vibrant colours, and timeless traditional styles.",
    "Explore now",
  ],
  [
    "diwali1.webp",
    "Diwali Décor & Diyas",
    "Brighten your home with decorative diyas, glowing lights, and beautiful festive decorations.",
    "Explore now",
  ],
  [
    "diwali4.webp",
    "Diwali Gifts & Hampers",
    "Share the joy of Diwali with thoughtful gifts, festive hampers, and delightful treats for your loved ones.",
    "Explore now",
  ],
].map(([file, title, description, ctaLabel]) => ({
  image: `/image/png/fallback/${file}`,
  title,
  description,
  ctaLabel,
  link: "/products",
}));
export const FALLBACK_SHOPPING_BANNER = {
  image: "/image/png/fallback/bannerDeals.png",
  title: "Irresistible Brands,\nBest Prices",
  description: "20-30",
  cta: { url: "/deals" },
};
export const FALLBACK_HOME_CATEGORIES = [
  ["fashion", "Fashion"],
  ["electronics", "Electronics"],
  ["home-living", "Home & Living"],
  ["beauty", "Beauty"],
  ["accessories", "Accessories"],
].map(([categoryKey, title]) => ({
  categoryKey,
  slug: categoryKey,
  title,
  name: title,
  productCount: 1,
  active: true,
  isDashboardVisible: true,
}));
export const FALLBACK_SUPPORT = {
  topicImages: {
    order: "/image/png/fallback/Help&Support/Track-order.png",
    track: "/image/png/fallback/Help&Support/Track-order.png",
    return: "/image/png/fallback/Help&Support/Return-refund.png",
    refund: "/image/png/fallback/Help&Support/Return-refund.png",
    payment: "/image/png/fallback/Help&Support/payment-issues.png",
    paying: "/image/png/fallback/Help&Support/payment-issues.png",
    account: "/image/png/fallback/Help&Support/account-security.png",
    security: "/image/png/fallback/Help&Support/account-security.png",
  },
  topics: [
    ["Track Order", "Track-order.png", "/orders"],
    ["Return & Refund", "Return-refund.png", "/returns-refunds"],
    ["Payment Issues", "payment-issues.png", "/payments"],
    ["Rewards Help", "account-security.png", "#"],
    ["Account Security", "account-security.png", "/account/profile"],
  ].map(([title, file, path]) => ({
    title,
    image: `/image/png/fallback/Help&Support/${file}`,
    path,
  })),
  faqs: [
    [
      "How do I cancel an order?",
      "You can cancel an eligible order from My Orders before it is shipped.",
    ],
    [
      "When will I receive my refund?",
      "Refunds are processed within 5-7 business days after the returned item is inspected.",
    ],
    [
      "How do I track my order?",
      "Use the Track Order option under Quick Actions.",
    ],
    [
      "How do I contact a seller?",
      "Use Contact Seller from the product detail page.",
    ],
    [
      "How do I change my delivery address?",
      "Update your address from Account settings.",
    ],
    [
      "What payment methods do you accept?",
      "We accept cards, UPI, net banking, wallets, and eligible Cash on Delivery.",
    ],
  ].map(([title, description]) => ({ title, description })),
  contacts: [
    {
      type: "phone",
      title: "+91 99154 29897",
      description: "Call Us",
      path: "/contact-us",
    },
    {
      type: "mail",
      title: "info@samglobal1.com",
      description: "Email Support",
      path: "/contact-us",
    },
    {
      type: "ticket",
      title: "Raise a Ticket",
      description: "Submit a ticket and we will get back",
    },
  ],
};
export const FALLBACK_FAQ_PAGE = {
  title: "Frequently Asked Questions",
  description:
    "We believe great experiences come from clarity. Here are answers to some of the most common questions to help you navigate Sam Global with ease.",
  sections: [
    {
      type: "faq-category",
      title: "Shopping & Orders",
      points: [
        {
          title: "How do I place an order?",
          description:
            "Browse through our collections, select your preferred products, and proceed to checkout. The process is designed to be simple, seamless, and secure.",
        },
        {
          title: "How can I track my order?",
          description:
            "Once your order is confirmed, you will receive tracking details so you can monitor your delivery in real time.",
        },
        {
          title: "Can I modify or cancel my order?",
          description:
            "Orders can be modified or canceled within a limited time window after placement. We recommend acting promptly or reaching out to our support team for assistance.",
        },
      ],
    },
    {
      type: "faq-category",
      title: "Shipping & Delivery",
      points: [
        {
          title: "What are the delivery timelines?",
          description:
            "Delivery timelines may vary based on your location and product availability. Estimated timelines will be shared at checkout.",
        },
        {
          title: "Do you offer free shipping?",
          description:
            "Shipping benefits may vary depending on ongoing offers, order value, or location. Applicable details will be visible during checkout.",
        },
      ],
    },
    {
      type: "faq-category",
      title: "Returns & Refunds",
      points: [
        {
          title: "What is your return policy?",
          description:
            "We offer a hassle-free return process within the specified return period, provided the product is unused and in its original condition.",
        },
        {
          title: "How are refunds processed?",
          description:
            "Refunds are initiated after product verification and processed to the original payment method within standard timelines.",
        },
      ],
    },
    {
      type: "faq-category",
      title: "Payments",
      points: [
        {
          title: "What payment methods are accepted?",
          description:
            "We support a range of secure payment options, including cards, UPI, net banking, and digital wallets.",
        },
        {
          title: "Is it safe to make payments on your platform?",
          description:
            "Yes, all transactions are secured through trusted payment gateways to ensure a safe and reliable experience.",
        },
      ],
    },
    {
      type: "faq-category",
      title: "Account & Support",
      points: [
        {
          title: "Do I need an account to shop?",
          description:
            "While you can browse freely, creating an account allows for a more personalized and seamless shopping experience.",
        },
        {
          title: "How can I contact customer support?",
          description:
            "You can reach out to us through the Contact Us page. Our team is always ready to assist you.",
        },
      ],
    },
    {
      type: "faq-category",
      title: "For Brands & Partners",
      points: [
        {
          title: "How can brands partner with Sam Global?",
          description:
            "We collaborate with brands looking to expand through a structured and scalable retail platform. You can connect with us through our business inquiry channels.",
        },
        {
          title: "Do you offer retail expansion opportunities?",
          description:
            "Yes, we actively work with partners to expand our retail presence across key markets through a disciplined, growth-focused approach.",
        },
      ],
    },
    {
      type: "need-help",
      title: "Still Have Questions?",
      description:
        "If you need further assistance, we’re here to help. Reach out to us through our Contact page, and our team will get back to you shortly.",
      points: [],
      cta: { label: "Contact Support", url: "/contact-us", target: "_self" },
      sortOrder: 99,
    },
  ],
};
/* -------------------------------------------------------------------------- */ /* Become A Seller                                                            */ /* -------------------------------------------------------------------------- */ const sellerStories =
  [
    [
      "Sam Bhatia",
      "The Bear House is a contemporary menswear brand offering premium shirts, T-shirts, trousers, and stylish everyday clothing. With a focus on modern designs, quality fabrics, and versatile fashion, the brand brings together comfort, sophistication, and effortless style for today's men.",
      "SellerStory5.jpg",
      "The Bear House",
      "Recently achieved 3.2x growth",
    ],
    [
      "Nisha Kapoor",
      "The seller tools help us make better decisions every week.",
      "SellerStory1.webp",
      "Owner, Nivara Studio",
      "18,000+ orders delivered",
    ],
    [
      "Kabir Shah",
      "Reliable payouts gave us the confidence to scale.",
      "SellerStory2.webp",
      "Director, K&S Essentials",
      "200+ products listed",
    ],
    [
      "Riya Malhotra",
      "The marketplace helped our family-run brand find customers beyond our city.",
      "SellerStory3.webp",
      "Co-founder, Terra Crafts",
      "42 cities reached",
    ],
    [
      "Dev Arora",
      "Sam Global made online selling feel approachable from day one.",
      "SellerStory4.webp",
      "Owner, Volt Avenue",
      "4.8 average rating",
    ],
    [
      "Meera Iyer",
      "Simple tools and dependable support let us focus on our customers.",
      "SellerStory5.webp",
      "Founder, Studio Meera",
      "2.5x monthly growth",
    ],
  ].map(([title, description, file, role, result]) => ({
    title,
    description,
    image: image(
      `/image/png/fallback/become-a-seller/${file}`,
      `${title} - ${role}`,
    ),
    metadata: { role },
    cta: { label: result },
  }));
export const FALLBACK_SELLER_PAGE = {
  title: "Grow Your Business\nWith Sam Global",
  excerpt:
    "Reach more customers, manage orders easily, and grow with reliable support.",
  image: image("/image/png/fallback/sellerBanner.webp", "Sam Global seller"),
  sections: [
    { type: "seller-stories", points: sellerStories },
    {
      type: "seller-benefits",
      title: "Why sell with us",
      description: "Everything you need to build a thriving online business.",
      points: [
        {
          title: "Transparent earnings",
          description: "Clear fees and dependable payment cycles.",
        },
        {
          title: "Nationwide reach",
          description: "Reach customers across India.",
        },
        {
          title: "Insights that help",
          description: "Understand product performance.",
        },
      ],
    },
    {
      type: "seller-steps",
      title: "Start selling",
      description: "Set up your storefront in a few simple steps.",
      points: [
        {
          title: "Create your account",
          description: "Register your business and share basic details.",
        },
        {
          title: "Build your storefront",
          description: "Add products, pricing, and inventory.",
        },
        {
          title: "Receive and ship orders",
          description: "Manage orders from your seller dashboard.",
        },
        {
          title: "Get paid and grow",
          description: "Track payouts and performance insights.",
        },
      ],
    },
  ],
};
/* -------------------------------------------------------------------------- */ /* Seller Policy                                                              */ /* -------------------------------------------------------------------------- */ export const FALLBACK_SELLER_POLICY =
  {
    title: "Seller Policy",
    excerpt: "Seller Guidelines",
    description:
      "Our Seller Policy defines the standards and responsibilities that create a trusted experience for sellers and customers.",
    image: image("/image/png/fallback/sellerPolicy.webp", "Seller Policy"),
    cta: { label: "Become a Seller", url: "/become-a-seller" },
    sections: [
      [
        "policy-highlights",
        "Everything You Need To Sell Confidently",
        "Our marketplace policies protect sellers and strengthen customer confidence.",
        [
          [
            "Genuine Products",
            "Sell only authentic and legally sourced products.",
          ],
          [
            "Accurate Listings",
            "Provide correct titles, images, pricing and specifications.",
          ],
          ["Timely Shipping", "Dispatch orders within the promised timeline."],
        ],
      ],
      [
        "seller-responsibilities",
        "Your Commitment Matters",
        "Follow these responsibilities to provide a trusted shopping experience.",
        [
          [
            "List Authentic Products",
            "Upload only original products with complete details.",
          ],
          [
            "Maintain Accurate Listings",
            "Keep pricing, stock, and information updated.",
          ],
          [
            "Process Orders Quickly",
            "Accept, pack and dispatch every order on time.",
          ],
          [
            "Support Customers",
            "Respond professionally to customer queries and returns.",
          ],
        ],
      ],
      [
        "account-compliance",
        "Maintain a Healthy Seller Account",
        "We monitor seller performance to ensure reliable service.",
        [
          [
            "Good Standing",
            "Maintain accurate listings, timely shipping, and quality service.",
          ],
          [
            "Performance Review",
            "Accounts are reviewed using fulfillment and satisfaction data.",
          ],
          [
            "Policy Violations",
            "Repeated violations can lead to account restrictions.",
          ],
        ],
      ],
    ].map(([type, title, description, points]) => ({
      type,
      title,
      description,
      points: points.map(([pointTitle, pointDescription]) => ({
        title: pointTitle,
        description: pointDescription,
      })),
    })),
  };
/* -------------------------------------------------------------------------- */ /* About                                                                      */ /* -------------------------------------------------------------------------- */
export const FALLBACK_ABOUT = {
  banner: {
    image: "/image/png/fallback/become-a-seller/About-banner.png",
    badge: "Your Next Chapter Starts Here",
    title: "Grow Your Business With Sam Global",
    description:
      "Reach more customers, manage orders easily, and grow with reliable support.",
    cta: {
      label: "Learn More",
      href: "#who-we-are",
    },
    highlights: ["Simple onboarding", "Secure payouts", "Dedicated support"],
  },

  story: {
    description:
      "Sam Global is built on over 18+ years of experience in FMCG distribution and customer selling, with a strong foundation in execution and scale. From building high-performance sales networks to now expanding into organized apparel retail, our journey is driven by a clear vision — to create a scalable, execution-focused retail platform across India. Starting from Ludhiana, we are expanding into key markets with a structured, disciplined approach focused on performance, consistency, and long-term growth.",
    image: image("/image/png/fallback/become-a-seller/outStory.png", "Sam Global story"),
  },

  values: {
    title: "Our Values",
    points: [
      {
        title: "Execution Excellence",
        description:
          "We believe in strong ground-level execution. Every store, every customer interaction, and every process is driven by performance and discipline.",
        image: image("/image/png/fallback/icons/excellence.png"),
      },
      {
        title: "Customer First",
        description:
          "Our approach is built around understanding Indian consumers and delivering consistent, high-quality retail experiences.",
        image: image("/image/png/fallback/icons/customer.png"),
      },
      {
        title: "Scalable Growth",
        description:
          "We focus on building systems and processes that enable sustainable, long-term expansion across markets.",
        image: image("/image/png/fallback/icons/growth.png"),
      },
    ],
  },

  brands: {
    title: "Indian Brands",
    description: "Experience Across Leading Global Brands",
    points: ["zara", "gq", "lacoste", "gucci", "prada", "vogue"].map(
      (brand) => ({
        title: brand.toUpperCase(),
        image: image(`/image/png/fallback/brands/${brand}.png`),
      }),
    ),
  },

  mission: {
    title: "Our Mission",
    description:
      "Our mission is to build a trusted digital marketplace where customers can shop with clarity and sellers can grow with confidence.</br> </br> We aim to make quality products more accessible through dependable technology, transparent service, and a customer-first approach.",
    image: image("/image/png/fallback/become-a-seller/hand.png", "Our mission"),
  },

  whyChoose: {
    title: "Why Choose Us",
    description:
      "A strong retail partner focused on execution, growth, and long-term success.",
    points: [
      {
        title: "Proven Sales Expertise",
        description: "18+ years of experience in high-volume product selling and distribution.",
        image: image("/image/png/fallback/icons/dummy.png"),
      },
      {
        title: "Strong Retail Execution",
        description: "Disciplined store-level execution driving performance and consistency.",
        image: image("/image/png/fallback/icons/dummy1.png"),
      },
      {
        title: "Consumer Understanding",
        description: "Deep insights into Indian consumer behaviour and buying patterns.",
        image: image("/image/png/fallback/icons/dummy2.png"),
      },
      {
        title: "Global Brand Experience",
        description: "Leadership experience with Adidas, Reebok, Levi's, Pepe Jeans, and Benetton.",
        image: image("/image/png/fallback/icons/dummy3.png"),
      },
      {
        title: "Structured Expansion",
        description: "Planned multi-city growth strategy with scalable systems.",
        image: image("/image/png/fallback/icons/dummy4.png"),
      },
      {
        title: "Performance-Driven Approach",
        description: "Focused on sell-through, inventory movement, and profitability.",
        image: image("/image/png/fallback/icons/dummy5.png"),
      },
      {
        title: "Financial Discipline",
        description: "Strong governance and structured financial planning.",
        image: image("/image/png/fallback/icons/dummy3.png"),
      },
      {
        title: "SOP-Driven Operations",
        description: "Ensuring brand compliance and operational consistency.",
        image: image("/image/png/fallback/icons/dummy4.png"),
      },
      {
        title: "Long-Term Partnerships",
        description: "Committed to building sustainable brand relationships.",
        image: image("/image/png/fallback/icons/dummy5.png"),
      },
    ],
  },
};
export const FALLBACK_POLICY_DATA = {
  shipping: {
    title: "Shipping & Delivery Policy",
    description: "",
    sections: [
      {
        type: "content",
        title: "Designed for Convenience. Delivered with Care.",
        description:
          "At Sam Global, we aim to ensure a seamless delivery experience. This Shipping Policy outlines the terms governing order processing, dispatch, and delivery.",
        image: { url: "", alt: "", title: "", caption: "", type: "" },
        gallery: [],
        points: [
          {
            title: "Order Processing",
            description:
              "Orders are processed within standard business timelines after successful payment confirmation.\nProcessing timelines may vary based on product availability, order volume, or operational factors.\nSam Global reserves the right to cancel or delay orders in case of unforeseen circumstances, including stock unavailability or verification issues.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 1,
          },
          {
            title: "Delivery Timelines",
            description:
              "Estimated delivery timelines are indicative and will be displayed at checkout.\nActual delivery may vary depending on location, logistics partner timelines, and external factors.\nDelays caused by circumstances beyond our control, including weather, strikes, regional restrictions, or logistics disruptions, shall not constitute a breach of obligation.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 2,
          },
          {
            title: "Shipping Coverage",
            description:
              "Delivery is subject to serviceable pincodes as determined by our logistics partners.\nSam Global reserves the right to refuse delivery to certain locations without prior notice.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 3,
          },
          {
            title: "Shipping Charges",
            description:
              "Shipping charges, if applicable, will be displayed at checkout prior to order confirmation.\nCharges may vary based on order value, delivery location, product category, or promotional offers.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 4,
          },
          {
            title: "Order Tracking",
            description:
              "Tracking details will be shared upon dispatch of the order.\nThe customer is responsible for monitoring shipment updates using the provided tracking information.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 5,
          },
          {
            title: "Delivery & Acceptance",
            description:
              "Delivery shall be deemed completed once the order is delivered to the address provided at the time of purchase.\nAny person available at the delivery address shall be deemed authorized to receive the order on behalf of the customer.\nSam Global shall not be liable for loss or damage after successful delivery.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 6,
          },
          {
            title: "Limitation of Liability",
            description:
              "Sam Global shall not be liable for delays, non-delivery, or service interruptions caused by third-party logistics providers or events beyond reasonable control.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 7,
          },
          {
            title: "Need Assistance?",
            description:
              "For any shipping-related queries, please contact our support team.Reliable delivery, aligned with clarity and trust.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 8,
          },
        ],
        cta: { label: "", url: "", target: "_self" },
        sortOrder: 1,
      },
    ],
  },
  returns: {
    title: "Return & Refund Policy",
    description: "",
    sections: [
      {
        type: "content",
        title: "Simple. Transparent. Hassle-Free.",
        description:
          "This Return & Refund Policy governs the conditions under which returns, exchanges, and refunds are processed.",
        image: { url: "", alt: "", title: "", caption: "", type: "" },
        gallery: [],
        points: [
          {
            title: "Return Eligibility",
            description:
              "Returns will be accepted only if the product is eligible under the applicable policy.\nThe return request is initiated within the specified return window.\nThe product is unused, undamaged, and in its original condition.\nOriginal tags, packaging, and accessories are intact.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 1,
          },
          {
            title: "Return Process",
            description:
              "Return requests must be raised through the appropriate platform or support channel.\nOnce submitted, return requests will be reviewed and approved where applicable.\nProducts must be handed over to the return courier as instructed.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 2,
          },
          {
            title: "Verification & Approval",
            description:
              "All returned products are subject to inspection and quality checks.\nApproval of return or refund is at the sole discretion of Sam Global based on product condition.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 3,
          },
          {
            title: "Refund Process",
            description:
              "Refunds will be initiated only after successful verification of returned products.\nRefunds will be processed to the original mode of payment unless otherwise specified.\nTimelines may vary depending on banking/payment gateway and logistics partner.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 4,
          },
          {
            title: "Exchange Policy",
            description:
              "Exchanges are subject to product availability and eligibility.\nIf the requested replacement is unavailable, a refund may be issued as per policy.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 5,
          },
          {
            title: "Non-Returnable Items",
            description:
              "Certain products may be marked as non-returnable at the time of purchase.\nPersonalized or hygiene-sensitive items.\nProducts used, damaged, or returned without original condition.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 6,
          },
          {
            title: "Damaged / Incorrect Products",
            description:
              "Any claims regarding damaged, defective, or incorrect products must be reported within 48 hours of delivery.\nPhotographic or video evidence may be required for claim review.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 7,
          },
          {
            title: "Cancellation Policy",
            description:
              "Orders can be cancelled only within the permitted cancellation window.\nOnce dispatched, cancellation requests shall be treated under the return policy.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 8,
          },
          {
            title: "Limitation of Liability",
            description:
              "Sam Global shall not be liable for improper use or handling of products after delivery.\nRefund liability shall be limited to the value of the eligible product.\nDelays attributable to banks, logistics, or payment gateways are outside our control.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 9,
          },
          {
            title: "Need Help?",
            description:
              "For assistance, please reach out to our support team.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 10,
          },
        ],
        cta: { label: "", url: "", target: "_self" },
        sortOrder: 1,
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "",
    sections: [
      {
        type: "content",
        title: "Your Privacy Matters",
        description:
          "At Sam Global, we are committed to protecting your personal information and ensuring transparency in how your data is collected, used, and safeguarded.",
        image: { url: "", alt: "", title: "", caption: "", type: "" },
        gallery: [],
        points: [
          {
            title: "Information We Collect",
            description:
              "Personal Information: Name, phone number, email address, shipping and billing address.\nAccount Information: Login details, preferences, and order history.\nTransaction Data: Payment details processed securely via third-party gateways.\nTechnical Data: IP address, browser type, device information, and website usage data.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 1,
          },
          {
            title: "How We Use Your Information",
            description:
              "Your information is used to process and deliver your orders, provide customer support, improve the platform and user experience, send order updates and relevant offers, and prevent fraud and ensure platform security.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 2,
          },
          {
            title: "Sharing of Information",
            description:
              "We do not sell your personal data. We may share your information with logistics partners, payment gateways, technology and analytics providers, and sellers where required to fulfil your order.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 3,
          },
          {
            title: "Data Security",
            description:
              "We implement appropriate technical and organisational measures to protect your data. However, no system is completely secure, and we cannot guarantee absolute security.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 4,
          },
          {
            title: "Cookies & Tracking",
            description:
              "We use cookies and similar technologies to enhance your browsing experience, remember your preferences, and analyse platform usage. Please refer to our Cookie Policy for more details.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 5,
          },
          {
            title: "Your Rights",
            description:
              "You may access or update your personal information, request deletion of your data subject to legal requirements, and opt out of marketing communications.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 6,
          },
          {
            title: "Data Retention",
            description:
              "We retain your data only as long as necessary for order fulfilment, legal compliance, and business operations.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 7,
          },
          {
            title: "Third-Party Links",
            description:
              "Our platform may contain links to external websites. We are not responsible for the privacy practices of such third parties.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 8,
          },
          {
            title: "Policy Updates",
            description:
              "We may update this Privacy Policy from time to time. Continued use of the platform implies acceptance of the updated policy.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 9,
          },
          {
            title: "Contact Us",
            description:
              "For any privacy-related concerns, please contact us through our Contact page.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 10,
          },
        ],
        cta: { label: "", url: "", target: "_self" },
        sortOrder: 1,
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    description:
      "This Cookie Policy explains how Sam Global uses cookies and similar technologies to enhance your experience on our platform.",
    sections: [
      {
        type: "content",
        title: "Understanding How We Use Cookies",
        description:
          "This Cookie Policy explains how Sam Global uses cookies and similar technologies to enhance your experience on our platform.",
        image: { url: "", alt: "", title: "", caption: "", type: "" },
        gallery: [],
        points: [
          {
            title: "What Are Cookies?",
            description:
              "Cookies are small text files stored on your device when you visit a website. They help improve functionality, performance, and user experience.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 1,
          },
          {
            title: "Types of Cookies We Use",
            description:
              "Essential Cookies: Required for basic website functionality such as login and checkout.\nPerformance Cookies: Help us understand how users interact with our platform to improve performance.\nFunctional Cookies: Remember your preferences and settings for a personalised experience.\nAdvertising Cookies: Used to deliver relevant ads and measure campaign effectiveness.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 2,
          },
          {
            title: "How We Use Cookies",
            description:
              "We use cookies to enable smooth navigation and functionality, remember your preferences and login details, analyse website traffic and usage patterns, improve performance and user experience, and support marketing and advertising efforts.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 3,
          },
          {
            title: "Third-Party Cookies",
            description:
              "We may allow trusted third-party services such as analytics or advertising platforms to place cookies on your device. These providers may use the information to help us understand traffic and improve our platform and campaigns.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 4,
          },
          {
            title: "Managing Cookies",
            description:
              "You can manage your cookie settings through your browser preferences. Please note that disabling certain cookies may affect website functionality and access to some features.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 5,
          },
          {
            title: "Updates",
            description:
              "We may update this Cookie Policy from time to time to reflect changes in technology, services, or legal requirements. Updated versions will be posted on the Platform.",
            image: { url: "", alt: "", title: "", caption: "", type: "" },
            cta: { label: "", url: "", target: "_self" },
            sortOrder: 6,
          },
        ],
        cta: { label: "", url: "", target: "_self" },
        sortOrder: 1,
      },
    ],
  },
  terms: {
  title: "Terms of Use",
  description: "",
  sections: [
    {
      type: "content",
      title: "Please Read Carefully",
      description:
        'These Terms & Conditions <strong>Terms</strong> govern your access to and use of the Sam Global website, platform, and services  <strong> collectively, the Platform</strong>\n\nBy accessing, browsing, or using the Platform, you agree to be bound by these Terms. If you do not agree, please do not use the Platform.',
      image: {
        url: "",
        alt: "Please Read Carefully",
        title: "",
        caption: "",
        type: "section",
      },
      gallery: [],
      points: [
        {
          title: "Definitions",
          description:
            '<strong>Platform</strong> refers to the Sam Global website, mobile application, and related services.\n<strong>User</strong> or <strong>Customer</strong> refers to any individual accessing or using the Platform.\n<strong>Seller</strong> refers to third-party vendors offering products through the Platform, where applicable.\n<strong>Services</strong> refers to all functionalities provided through the Platform.',
          image: {
            url: "",
            alt: "Definitions",
            title: "",
            caption: "",
            type: "point",
          },
          cta: { label: "", url: "", target: "_self" },
          sortOrder: 1,
        },
        {
          title: "Eligibility",
          description:
            "Users must be at least 18 years of age or legally competent to enter into a contract.\nBy using the Platform, you represent that all information you provide is accurate and complete.",
          image: {
            url: "",
            alt: "Eligibility",
            title: "",
            caption: "",
            type: "point",
          },
          cta: { label: "", url: "", target: "_self" },
          sortOrder: 2,
        },
        {
          title: "Account & User Responsibility",
          description:
            "Users may be required to create an account to access certain features.\nYou are responsible for maintaining the confidentiality of your login credentials.\nAny activity conducted through your account shall be deemed your responsibility.\nSam Global shall not be liable for unauthorized access arising from user negligence, to the extent permitted by applicable law.",
          image: {
            url: "",
            alt: "Account & User Responsibility",
            title: "",
            caption: "",
            type: "point",
          },
          cta: { label: "", url: "", target: "_self" },
          sortOrder: 3,
        },
        {
          title: "Platform Usage",
          description:
            "You agree not to use the Platform for unlawful or fraudulent purposes.\nYou must not interfere with the operation, security, or functionality of the Platform.\nYou must not attempt unauthorized access to systems, data, or accounts.\nYou must not use automated tools, including bots or scraping tools, without permission.\nSam Global reserves the right to restrict or terminate access for violations of these Terms.",
          image: {
            url: "",
            alt: "Platform Usage",
            title: "",
            caption: "",
            type: "point",
          },
          cta: { label: "", url: "", target: "_self" },
          sortOrder: 4,
        },
        {
          title: "Product Information & Pricing",
          description:
            "Product descriptions, images, and pricing are provided for informational purposes.\nAlthough we make reasonable efforts to ensure accuracy, errors may occur.\nSam Global reserves the right to correct errors, update information, or cancel orders affected by pricing or product information errors, subject to applicable law.\nPrices and product availability are subject to change.",
          image: {
            url: "",
            alt: "Product Information & Pricing",
            title: "",
            caption: "",
            type: "point",
          },
          cta: { label: "", url: "", target: "_self" },
          sortOrder: 5,
        },
        {
          title: "Orders & Acceptance",
          description:
            "Placing an order constitutes an offer to purchase the selected products.\nSam Global reserves the right to accept or reject an order, subject to applicable law.\nAn order confirmation does not necessarily constitute final acceptance. Orders may be cancelled due to stock issues, pricing errors, or verification concerns, subject to applicable law and the applicable order policies.",
          image: {
            url: "",
            alt: "Orders & Acceptance",
            title: "",
            caption: "",
            type: "point",
          },
          cta: { label: "", url: "", target: "_self" },
          sortOrder: 6,
        },
        {
          title: "Payments",
          description:
            "All payments must be made through the approved payment methods available on the Platform.\nTransactions are processed through third-party payment gateways.\nSam Global is not responsible for payment failures or delays caused by third-party providers, except where liability cannot be excluded under applicable law.",
          image: {
            url: "",
            alt: "Payments",
            title: "",
            caption: "",
            type: "point",
          },
          cta: { label: "", url: "", target: "_self" },
          sortOrder: 7,
        },
        {
          title: "Shipping, Returns & Refunds",
          description:
            "Shipping, returns, and refunds are governed by the separate policies published on the Platform.\nBy placing an order, you agree to the applicable policies, subject to your rights under applicable law.",
          image: {
            url: "",
            alt: "Shipping, Returns & Refunds",
            title: "",
            caption: "",
            type: "point",
          },
          cta: { label: "", url: "", target: "_self" },
          sortOrder: 8,
        },
        {
          title: "Marketplace Disclaimer",
          description:
            "The Platform may act as an intermediary connecting customers with third-party sellers.\nSam Global may not manufacture, own, or directly control products listed by third-party sellers.\nResponsibility for product quality, legality, and compliance rests with the respective seller, subject to applicable law and Sam Global's obligations.\nSam Global is not responsible for disputes between users and sellers except to the extent required by applicable law.",
          image: {
            url: "",
            alt: "Marketplace Disclaimer",
            title: "",
            caption: "",
            type: "point",
          },
          cta: { label: "", url: "", target: "_self" },
          sortOrder: 9,
        },
        {
          title: "Intellectual Property",
          description:
            "All content on the Platform, including text, images, logos, designs, and software, is owned by Sam Global or its licensors.\nUnauthorized use, reproduction, or distribution of this content is prohibited unless permitted by the owner or applicable law.",
          image: {
            url: "",
            alt: "Intellectual Property",
            title: "",
            caption: "",
            type: "point",
          },
          cta: { label: "", url: "", target: "_self" },
          sortOrder: 10,
        },
        {
          title: "Limitation of Liability",
          description:
            "To the maximum extent permitted by applicable law, Sam Global shall not be liable for indirect, incidental, or consequential damages; loss of profits, data, business, or goodwill; delays, interruptions, or technical failures; or the acts or omissions of third-party sellers, logistics providers, or payment gateways.\nNothing in these Terms excludes or limits liability that cannot legally be excluded or limited.",
          image: {
            url: "",
            alt: "Limitation of Liability",
            title: "",
            caption: "",
            type: "point",
          },
          cta: { label: "", url: "", target: "_self" },
          sortOrder: 11,
        },
        {
          title: "Indemnity",
          description:
            "To the extent permitted by applicable law, you agree to indemnify and hold harmless Sam Global against claims, damages, losses, or liabilities arising from your unlawful use of the Platform, violation of these Terms, or infringement of third-party rights.",
          image: {
            url: "",
            alt: "Indemnity",
            title: "",
            caption: "",
            type: "point",
          },
          cta: { label: "", url: "", target: "_self" },
          sortOrder: 12,
        },
        {
          title: "Termination",
          description:
            "Sam Global may suspend or terminate access to the Platform or remove content where necessary due to violations of these Terms, security concerns, or other legitimate reasons, subject to applicable law.",
          image: {
            url: "",
            alt: "Termination",
            title: "",
            caption: "",
            type: "point",
          },
          cta: { label: "", url: "", target: "_self" },
          sortOrder: 13,
        },
        {
          title: "Force Majeure",
          description:
            "Sam Global shall not be responsible for failures or delays caused by events beyond its reasonable control, including natural disasters, government actions, or technical and infrastructure disruptions, subject to applicable law.",
          image: {
            url: "",
            alt: "Force Majeure",
            title: "",
            caption: "",
            type: "point",
          },
          cta: { label: "", url: "", target: "_self" },
          sortOrder: 14,
        },
        {
          title: "Governing Law & Jurisdiction",
          description:
            "These Terms shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of the competent courts in India, as determined under applicable law.",
          image: {
            url: "",
            alt: "Governing Law & Jurisdiction",
            title: "",
            caption: "",
            type: "point",
          },
          cta: { label: "", url: "", target: "_self" },
          sortOrder: 15,
        },
        {
          title: "Modifications",
          description:
            "Sam Global reserves the right to update or modify these Terms from time to time.\nUpdated Terms will be published on the Platform with the revised effective date, where applicable.\nYour continued use of the Platform after revised Terms become effective may constitute acceptance where permitted by applicable law.",
          image: {
            url: "",
            alt: "Modifications",
            title: "",
            caption: "",
            type: "point",
          },
          cta: { label: "", url: "", target: "_self" },
          sortOrder: 16,
        },
        {
          title: "Contact",
          description:
            "For any questions or concerns regarding these Terms, please contact us through the Contact Us page on the Platform.",
          image: {
            url: "",
            alt: "Contact",
            title: "",
            caption: "",
            type: "point",
          },
          cta: { label: "", url: "", target: "_self" },
          sortOrder: 17,
        },
      ],
      cta: { label: "", url: "", target: "_self" },
      sortOrder: 1,
    },
  ],
},
};
Object.assign(FALLBACK_POLICY_DATA, CANONICAL_POLICY_DATA);
export const FALLBACK_CMS_PAGE_CONTENT = {
  "privacy-policy": {
    slug: "privacy-policy",
    title: "Privacy Policy",
    excerpt: "Your Privacy Matters",
    description:
      "At Sam Global, we are committed to protecting your personal information and ensuring transparency in how your data is collected, used, and safeguarded.",
    body: `
      Your Privacy Matters

      At Sam Global, we are committed to protecting your personal information and ensuring transparency in how your data is collected, used, and safeguarded.

      1. Information We Collect
      We may collect the following types of information:
      Personal Information: Name, phone number, email address, shipping and billing address.
      Account Information: Login details, preferences, and order history.
      Transaction Data: Payment details processed securely via third-party gateways.
      Technical Data: IP address, browser type, device information, and website usage data.

      2. How We Use Your Information
      Your information is used to process and deliver your orders, provide customer support, improve the platform and user experience, send order updates and relevant offers, and prevent fraud and ensure platform security.

      3. Sharing of Information
      We do not sell your personal data. We may share your information with logistics partners, payment gateways, technology and analytics providers, and sellers where required to fulfil your order.

      4. Data Security
      We implement appropriate technical and organisational measures to protect your data. However, no system is completely secure, and we cannot guarantee absolute security.

      5. Cookies & Tracking
      We use cookies and similar technologies to enhance your browsing experience, remember your preferences, and analyse platform usage. Please refer to our Cookie Policy for more details.

      6. Your Rights
      You may access or update your personal information, request deletion of your data subject to legal requirements, and opt out of marketing communications.

      7. Data Retention
      We retain your data only as long as necessary for order fulfilment, legal compliance, and business operations.

      8. Third-Party Links
      Our platform may contain links to external websites. We are not responsible for the privacy practices of such third parties.

      9. Policy Updates
      We may update this Privacy Policy from time to time. Continued use of the platform implies acceptance of the updated policy.

      10. Contact Us
      For any privacy-related concerns, please contact us through our Contact page.

      Your trust is important to us, and we are committed to protecting it.
    `,
    metadata: {
      seoTitle: "Privacy Policy",
      seoDescription:
        "Learn how Sam Global collects, uses, and protects your personal information.",
    },
  },
  "cookie-policy": {
    slug: "cookie-policy",
    title: "Cookie Policy",
    excerpt: "Understanding How We Use Cookies",
    description:
      "This Cookie Policy explains how Sam Global uses cookies and similar technologies to enhance your experience on our platform.",
    body: `
      Understanding How We Use Cookies

      This Cookie Policy explains how Sam Global uses cookies and similar technologies to enhance your experience on our platform.

      1. What Are Cookies?
      Cookies are small text files stored on your device when you visit a website. They help improve functionality, performance, and user experience.

      2. Types of Cookies We Use
      Essential Cookies: Required for basic website functionality such as login and checkout.
      Performance Cookies: Help us understand how users interact with our platform to improve performance.
      Functional Cookies: Remember your preferences and settings for a personalised experience.
      Advertising Cookies: Used to deliver relevant ads and measure campaign effectiveness.

      3. How We Use Cookies
      We use cookies to enable smooth navigation and functionality, remember your preferences and login details, analyse website traffic and usage patterns, improve performance and user experience, and support marketing and advertising efforts.

      4. Third-Party Cookies
      We may allow trusted third-party services such as analytics or advertising platforms to place cookies on your device. These providers may use the information to help us understand traffic and improve our platform and campaigns.

      5. Managing Cookies
      You can manage your cookie settings through your browser preferences. Please note that disabling certain cookies may affect website functionality and access to some features.

      6. Updates
      We may update this Cookie Policy from time to time to reflect changes in technology, services, or legal requirements. Updated versions will be posted on the Platform.
    `,
    metadata: {
      seoTitle: "Cookie Policy",
      seoDescription:
        "Learn how Sam Global uses cookies, tracking tools, and related technologies.",
    },
  },
};

export const FALLBACK_CMS_DATA = {
  faq: {
    _id: "6aaa4fe3f5dedaa4a6a2a320",
    slug: "faq-details",
    title: "Frequently Asked Questions",
    pageType: "faq",
    category: "faq",
    description:
      "We believe great experiences come from clarity. Here are answers to some of the most common questions to help you navigate Sam Global with ease.",
    excerpt: "Everything You Need to Know",
    published: true,
    status: "published",
    cta: { label: "Contact Support", url: "/contact-us", target: "_self" },
    sections: [
      {
        type: "faq-category",
        title: "Shopping & Orders",
        description: "",
        points: [
          {
            title: "How do I place an order?",
            description:
              "Browse through our collections, select your preferred products, and proceed to checkout. The process is designed to be simple, seamless, and secure.",
            sortOrder: 1,
          },
          {
            title: "How can I track my order?",
            description:
              "Once your order is confirmed, you will receive tracking details so you can monitor your delivery in real time.",
            sortOrder: 2,
          },
          {
            title: "Can I modify or cancel my order?",
            description:
              "Orders can be modified or canceled within a limited time window after placement. We recommend acting promptly or reaching out to our support team for assistance.",
            sortOrder: 3,
          },
        ],
        cta: { label: "", url: "", target: "_self" },
        sortOrder: 1,
      },
      {
        type: "faq-category",
        title: "Shipping & Delivery",
        description: "",
        points: [
          {
            title: "What are the delivery timelines?",
            description:
              "Delivery timelines may vary based on your location and product availability. Estimated timelines will be shared at checkout.",
            sortOrder: 1,
          },
          {
            title: "Do you offer free shipping?",
            description:
              "Shipping benefits may vary depending on ongoing offers, order value, or location. Applicable details will be visible during checkout.",
            sortOrder: 2,
          },
        ],
        cta: { label: "", url: "", target: "_self" },
        sortOrder: 2,
      },
      {
        type: "faq-category",
        title: "Returns & Refunds",
        description: "",
        points: [
          {
            title: "What is your return policy?",
            description:
              "We offer a hassle-free return process within the specified return period, provided the product is unused and in its original condition.",
            sortOrder: 1,
          },
          {
            title: "How are refunds processed?",
            description:
              "Refunds are initiated after product verification and processed to the original payment method within standard timelines.",
            sortOrder: 2,
          },
        ],
        cta: { label: "", url: "", target: "_self" },
        sortOrder: 3,
      },
      {
        type: "faq-category",
        title: "Payments",
        description: "",
        points: [
          {
            title: "What payment methods are accepted?",
            description:
              "We support a range of secure payment options, including cards, UPI, net banking, and digital wallets.",
            sortOrder: 1,
          },
          {
            title: "Is it safe to make payments on your platform?",
            description:
              "Yes, all transactions are secured through trusted payment gateways to ensure a safe and reliable experience.",
            sortOrder: 2,
          },
        ],
        cta: { label: "", url: "", target: "_self" },
        sortOrder: 4,
      },
      {
        type: "faq-category",
        title: "Account & Support",
        description: "",
        points: [
          {
            title: "Do I need an account to shop?",
            description:
              "While you can browse freely, creating an account allows for a more personalized and seamless shopping experience.",
            sortOrder: 1,
          },
          {
            title: "How can I contact customer support?",
            description:
              "You can reach out to us through the Contact Us page. Our team is always ready to assist you.",
            sortOrder: 2,
          },
        ],
        cta: { label: "", url: "", target: "_self" },
        sortOrder: 5,
      },
      {
        type: "faq-category",
        title: "For Brands & Partners",
        description: "",
        points: [
          {
            title: "How can brands partner with Sam Global?",
            description:
              "We collaborate with brands looking to expand through a structured and scalable retail platform. You can connect with us through our business inquiry channels.",
            sortOrder: 1,
          },
          {
            title: "Do you offer retail expansion opportunities?",
            description:
              "Yes, we actively work with partners to expand our retail presence across key markets through a disciplined, growth-focused approach.",
            sortOrder: 2,
          },
        ],
        cta: { label: "", url: "", target: "_self" },
        sortOrder: 6,
      },
      {
        type: "need-help",
        title: "Still Have Questions?",
        description:
          "If you need further assistance, we’re here to help. Reach out to us through our Contact page, and our team will get back to you shortly.",
        points: [],
        cta: { label: "Contact Support", url: "/contact-us", target: "_self" },
        sortOrder: 99,
      },
    ],
    seo: {
      metaTitle: "Frequently Asked Questions",
      metaDescription:
        "Find answers to common shopping, payment, shipping and account questions.",
      keywords: ["faq", "help", "shipping", "orders", "payments", "returns"],
      focusKeyword: "Frequently Asked Questions",
      canonicalUrl: "/faq",
      robots: "index,follow",
      ogTitle: "Frequently Asked Questions",
      ogDescription:
        "Find answers to common shopping, payment, shipping and account questions.",
      schemaType: "FAQPage",
      breadcrumbs: [
        { label: "Home", url: "/" },
        { label: "FAQ", url: "/faq" },
      ],
    },
  },
};
FALLBACK_CMS_DATA.faq = CANONICAL_FAQ_DATA;
/* -------------------------------------------------------------------------- */
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

const footerImage = (url, alt = "") => ({
  url,
  alt,
});

export const FALLBACK_FOOTER = {
  slug: "footerdata",
  title: "footerData",
  logo: "/image/webp/logoWithName.webp",
  benefits: [
    {
      title: "100% Secure Payments",
      description: "Multiple sale payment options",
      icon: footerImage("/image/png/fallback/footer/payment.png", "Payment")
        .url,
      alt: "Payment",
    },
    {
      title: "Easy Returns",
      description: "Hassle-free 10 days return",
      icon: footerImage(
        "/image/png/fallback/footer/return.png",
        "Returns and exchanges",
      ).url,
      alt: "Returns and exchanges",
    },
    {
      title: "24/7 Support",
      description: "We’re here to help you.",
      icon: footerImage("/image/png/fallback/footer/support.png", "Support")
        .url,
      alt: "Support",
    },
  ],

  linkGroups: [
    {
      title: "Sell",
      links: [
        {
          label: "Become a Seller",
          href: "/become-a-seller",
        },
        {
          label: "Seller Dashboard",
          href: SELLER_LOGIN_URL,
          target: "_blank",
        },
        {
          label: "Seller Policies",
          href: "/seller-policies",
        },
      ],
    },
    {
      title: "About SAM",
      links: [
        {
          label: "Who We Are",
          href: "/about-us#who-we-are",
        },
        {
          label: "Why Choose Us",
          href: "/about-us#why-choose-us",
        },
        {
          label: "Our Values",
          href: "/about-us#our-values",
        },
        {
          label: "Privacy Policy",
          href: "/privacy-policy",
        },
        {
          label: "Cookie Policy",
          href: "/cookie-policy",
        },
      ],
    },
    {
      title: "Help & Contact",
      links: [
        {
          label: "Customer Support",
          href: "/support",
        },
        {
          label: "Mobile App",
          href: "/mobile-app",
        },
        {
          label: "Shipping & Delivery Policy",
          href: "/shipping-policy",
        },
        {
          label: "Return & Refund Policy",
          href: "/refund-policy",
        },
        {
          label: "Terms of Use",
          href: "/terms-of-use",
        },
        // {
        //   label: "Privacy Policy",
        //   href: "/privacy-policy",
        // },
        // {
        //   label: "Cookie Policy",
        //   href: "/cookie-policy",
        // },
        {
          label: "FAQ",
          href: "/faq",
        },
      ],
    },
  ],

  appDownload: {
    title: "Download our app for a faster and smarter shopping experience.",

    links: [
      {
        label: "Download on the App Store",
        href: "/mobile-app",
        image: "/image/png/fallback/footer/appStore.svg",
        alt: "Download on the App Store",
      },
      {
        label: "Get it on Google Play",
        href: "/mobile-app",
        image: "/image/png/fallback/footer/playStore.svg",
        alt: "Get it on Google Play",
      },
    ],
  },

  copyright: "© 2026 Samglobal Marketplace Pvt. Ltd. All Rights Reserved.",

  socialLinks: [
    {
      label: "Instagram",
      href: "/#",
      icon: "",
      alt: "Instagram",
    },
    {
      label: "Facebook",
      href: "/#",
      icon: "",
      alt: "Facebook",
    },
    {
      label: "YouTube",
      href: "/#",
      icon: "",
      alt: "YouTube",
    },
  ],
};
