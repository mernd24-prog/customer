
const image = (url, alt = "") => ({
  url,
  alt,
});

export const FALLBACK_HERO_SLIDES = [
  [
    "HeroImg1.webp",
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
  ["chaniya-choli1.webp", "Festive Fashion"],
  ["chaniya-choli2.webp", "Celebrate In Style"],
  ["chaniya-choli3.webp", "New Season Looks"],
  ["chaniya-choli4.webp", "Traditional Edit"],
].map(([file, title]) => ({
  image: `/image/png/fallback/${file}`,
  title,
  link: "/products",
}));

export const FALLBACK_SHOPPING_BANNER = {
  image: "/image/png/fallback/bannerDeals.png",
  title: "Irresistible Brands,\nBest Prices",
  description: "50-80",
  cta: {
    url: "/deals",
  },
};

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
  ].map(([title, description]) => ({
    title,
    description,
  })),

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
    "Helpful answers for shopping, orders, delivery, and payments.",

  sections: [
    {
      type: "faq-category",
      title: "Orders",
      points: [
        {
          title: "How do I track my order?",
          description:
            "Open My Orders to view the latest delivery status.",
        },
        {
          title: "How do I cancel an order?",
          description:
            "You can cancel an eligible order from My Orders before it is shipped.",
        },
      ],
    },
    {
      type: "faq-category",
      title: "Returns",
      points: [
        {
          title: "When will I receive my refund?",
          description:
            "Refunds are processed after the returned item is received and inspected.",
        },
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Become A Seller                                                            */
/* -------------------------------------------------------------------------- */

const sellerStories = [
  [
    "Aarav Mehta",
    "Sam Global gave our handcrafted home collection the reach it deserved.",
    "SellerStory.avif",
    "Founder, House of Aara",
    "3.2x growth in 8 months",
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

  metadata: {
    role,
  },

  cta: {
    label: result,
  },
}));

export const FALLBACK_SELLER_PAGE = {
  title: "Grow Your Business\nWith Sam Global",

  excerpt:
    "Reach more customers, manage orders easily, and grow with reliable support.",

  image: image(
    "/image/png/fallback/sellerBanner.webp",
    "Sam Global seller",
  ),

  sections: [
    {
      type: "seller-stories",
      points: sellerStories,
    },

    {
      type: "seller-benefits",
      title: "Why sell with us",
      description:
        "Everything you need to build a thriving online business.",

      points: [
        {
          title: "Transparent earnings",
          description:
            "Clear fees and dependable payment cycles.",
        },
        {
          title: "Nationwide reach",
          description:
            "Reach customers across India.",
        },
        {
          title: "Insights that help",
          description:
            "Understand product performance.",
        },
      ],
    },

    {
      type: "seller-steps",
      title: "Start selling",
      description:
        "Set up your storefront in a few simple steps.",

      points: [
        {
          title: "Create your account",
          description:
            "Register your business and share basic details.",
        },
        {
          title: "Build your storefront",
          description:
            "Add products, pricing, and inventory.",
        },
        {
          title: "Receive and ship orders",
          description:
            "Manage orders from your seller dashboard.",
        },
        {
          title: "Get paid and grow",
          description:
            "Track payouts and performance insights.",
        },
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Seller Policy                                                              */
/* -------------------------------------------------------------------------- */

export const FALLBACK_SELLER_POLICY = {
  title: "Seller Policy",
  excerpt: "Seller Guidelines",

  description:
    "Our Seller Policy defines the standards and responsibilities that create a trusted experience for sellers and customers.",

  image: image(
    "/image/png/fallback/sellerPolicy.webp",
    "Seller Policy",
  ),

  cta: {
    label: "Become a Seller",
    url: "/become-a-seller",
  },

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
        [
          "Timely Shipping",
          "Dispatch orders within the promised timeline.",
        ],
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

/* -------------------------------------------------------------------------- */
/* About                                                                      */
/* -------------------------------------------------------------------------- */

export const FALLBACK_ABOUT = {
  bannerImage: "/image/png/fallback/sellerPolicy.webp",

  story: {
    description:
      "Sam Global is built on years of retail and distribution experience, with a clear focus on disciplined execution, customer trust, and sustainable growth across India.",

    image: image(
      "/image/png/fallback/become-a-seller/outStory.png",
      "Sam Global story",
    ),
  },

  values: {
    title: "Our Values",

    points: [
      [
        "Execution Excellence",
        "Every customer interaction and process is driven by performance and discipline.",
        "excellence.png",
      ],
      [
        "Customer First",
        "We focus on consistent, high-quality retail experiences for Indian consumers.",
        "customer.png",
      ],
      [
        "Scalable Growth",
        "We build systems that support sustainable long-term expansion.",
        "growth.png",
      ],
    ].map(([title, description, file]) => ({
      title,
      description,
      image: image(`/image/png/fallback/icons/${file}`),
    })),
  },

  brands: {
    title: "Indian Brands",
    description: "Experience Across Leading Global Brands",

    points: [
      "zara",
      "gq",
      "lacoste",
      "gucci",
      "prada",
      "vogue",
    ].map((brand) => ({
      title: brand.toUpperCase(),
      image: image(`/image/png/fallback/brands/${brand}.png`),
    })),
  },

  mission: {
    title: "Our Mission",

    description:
      "Our mission is to build an execution-focused retail network that delivers dependable stores, strong brand experiences, and long-term value for customers and partners.",

    image: image(
      "/image/png/fallback/become-a-seller/hand.png",
      "Our mission",
    ),
  },

  whyChoose: {
    title: "Why Choose Us",

    description:
      "A strong retail partner focused on execution, growth, and long-term success.",

    points: [
      [
        "Global Brand Experience",
        "Retail expertise shaped by leading global brands.",
      ],
      [
        "Financial Discipline",
        "Strong governance and structured planning.",
      ],
      [
        "Strong Retail Execution",
        "Disciplined operations that drive consistency.",
      ],
      [
        "Structured Expansion",
        "Scalable systems for multi-city growth.",
      ],
      [
        "Consumer Understanding",
        "Deep insight into customer needs and choices.",
      ],
      [
        "Long-Term Partnerships",
        "Built for trusted and sustainable collaboration.",
      ],
    ].map(([title, description], index) => ({
      title,
      description,
      image: image(
        `/image/png/fallback/icons/dummy${index || ""}.png`,
      ),
    })),
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

        image: {
          url: "",
          alt: "",
          title: "",
          caption: "",
          type: "",
        },

        gallery: [],

        points: [
          {
            title: "Order Processing",
            description:
              "Orders are processed within standard business timelines after successful payment confirmation.\nProcessing timelines may vary based on product availability, order volume, or operational factors.\nSam Global reserves the right to cancel or delay orders in case of unforeseen circumstances, including stock unavailability or verification issues.",
            image: {
              url: "",
              alt: "",
              title: "",
              caption: "",
              type: "",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 1,
          },

          {
            title: "Delivery Timelines",
            description:
              "Estimated delivery timelines are indicative and will be displayed at checkout.\nActual delivery may vary depending on location, logistics partner timelines, and external factors.\nDelays caused by circumstances beyond our control, including weather, strikes, regional restrictions, or logistics disruptions, shall not constitute a breach of obligation.",
            image: {
              url: "",
              alt: "",
              title: "",
              caption: "",
              type: "",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 2,
          },

          {
            title: "Shipping Coverage",
            description:
              "Delivery is subject to serviceable pincodes as determined by our logistics partners.\nSam Global reserves the right to refuse delivery to certain locations without prior notice.",
            image: {
              url: "",
              alt: "",
              title: "",
              caption: "",
              type: "",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 3,
          },

          {
            title: "Shipping Charges",
            description:
              "Shipping charges, if applicable, will be displayed at checkout prior to order confirmation.\nCharges may vary based on order value, delivery location, product category, or promotional offers.",
            image: {
              url: "",
              alt: "",
              title: "",
              caption: "",
              type: "",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 4,
          },

          {
            title: "Order Tracking",
            description:
              "Tracking details will be shared upon dispatch of the order.\nThe customer is responsible for monitoring shipment updates using the provided tracking information.",
            image: {
              url: "",
              alt: "",
              title: "",
              caption: "",
              type: "",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 5,
          },

          {
            title: "Delivery & Acceptance",
            description:
              "Delivery shall be deemed completed once the order is delivered to the address provided at the time of purchase.\nAny person available at the delivery address shall be deemed authorized to receive the order on behalf of the customer.\nSam Global shall not be liable for loss or damage after successful delivery.",
            image: {
              url: "",
              alt: "",
              title: "",
              caption: "",
              type: "",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 6,
          },

          {
            title: "Limitation of Liability",
            description:
              "Sam Global shall not be liable for delays, non-delivery, or service interruptions caused by third-party logistics providers or events beyond reasonable control.",
            image: {
              url: "",
              alt: "",
              title: "",
              caption: "",
              type: "",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 7,
          },

          {
            title: "Need Assistance?",
            description:
              "For any shipping-related queries, please contact our support team.Reliable delivery, aligned with clarity and trust.",
            image: {
              url: "",
              alt: "",
              title: "",
              caption: "",
              type: "",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 8,
          },
        ],

        cta: {
          label: "",
          url: "",
          target: "_self",
        },

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

        image: {
          url: "",
          alt: "",
          title: "",
          caption: "",
          type: "",
        },

        gallery: [],

        points: [
          {
            title: "Return Eligibility",
            description:
              "Returns will be accepted only if the product is eligible under the applicable policy.\nThe return request is initiated within the specified return window.\nThe product is unused, undamaged, and in its original condition.\nOriginal tags, packaging, and accessories are intact.",
            image: {
              url: "",
              alt: "",
              title: "",
              caption: "",
              type: "",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 1,
          },

          {
            title: "Return Process",
            description:
              "Return requests must be raised through the appropriate platform or support channel.\nOnce submitted, return requests will be reviewed and approved where applicable.\nProducts must be handed over to the return courier as instructed.",
            image: {
              url: "",
              alt: "",
              title: "",
              caption: "",
              type: "",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 2,
          },

          {
            title: "Verification & Approval",
            description:
              "All returned products are subject to inspection and quality checks.\nApproval of return or refund is at the sole discretion of Sam Global based on product condition.",
            image: {
              url: "",
              alt: "",
              title: "",
              caption: "",
              type: "",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 3,
          },

          {
            title: "Refund Process",
            description:
              "Refunds will be initiated only after successful verification of returned products.\nRefunds will be processed to the original mode of payment unless otherwise specified.\nTimelines may vary depending on banking/payment gateway and logistics partner.",
            image: {
              url: "",
              alt: "",
              title: "",
              caption: "",
              type: "",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 4,
          },

          {
            title: "Exchange Policy",
            description:
              "Exchanges are subject to product availability and eligibility.\nIf the requested replacement is unavailable, a refund may be issued as per policy.",
            image: {
              url: "",
              alt: "",
              title: "",
              caption: "",
              type: "",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 5,
          },

          {
            title: "Non-Returnable Items",
            description:
              "Certain products may be marked as non-returnable at the time of purchase.\nPersonalized or hygiene-sensitive items.\nProducts used, damaged, or returned without original condition.",
            image: {
              url: "",
              alt: "",
              title: "",
              caption: "",
              type: "",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 6,
          },

          {
            title: "Damaged / Incorrect Products",
            description:
              "Any claims regarding damaged, defective, or incorrect products must be reported within 48 hours of delivery.\nPhotographic or video evidence may be required for claim review.",
            image: {
              url: "",
              alt: "",
              title: "",
              caption: "",
              type: "",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 7,
          },

          {
            title: "Cancellation Policy",
            description:
              "Orders can be cancelled only within the permitted cancellation window.\nOnce dispatched, cancellation requests shall be treated under the return policy.",
            image: {
              url: "",
              alt: "",
              title: "",
              caption: "",
              type: "",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 8,
          },

          {
            title: "Limitation of Liability",
            description:
              "Sam Global shall not be liable for improper use or handling of products after delivery.\nRefund liability shall be limited to the value of the eligible product.\nDelays attributable to banks, logistics, or payment gateways are outside our control.",
            image: {
              url: "",
              alt: "",
              title: "",
              caption: "",
              type: "",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 9,
          },

          {
            title: "Need Help?",
            description:
              "For assistance, please reach out to our support team.",
            image: {
              url: "",
              alt: "",
              title: "",
              caption: "",
              type: "",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 10,
          },
        ],

        cta: {
          label: "",
          url: "",
          target: "_self",
        },

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
          'These Terms & Conditions ("Terms") govern your access to and use of the Sam Global website, platform, and services (collectively, the "Platform"). By accessing, browsing, or using the Platform, you agree to be bound by these Terms. If you do not agree, please do not use the Platform.',

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
            title: "Eligibility",
            description:
              "You must be legally capable of entering into binding agreements to use this platform.\nBy using Sam Global, you confirm that all information provided is accurate and complete.",
            image: {
              url: "",
              alt: "Eligibility",
              title: "",
              caption: "",
              type: "point",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 1,
          },

          {
            title: "Eligibility",
            description:
              "You must be legally capable of entering into binding agreements to use this platform.\nBy using Sam Global, you confirm that all information provided is accurate and complete.",
            image: {
              url: "",
              alt: "Eligibility",
              title: "",
              caption: "",
              type: "point",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 2,
          },

          {
            title: "Account & User Responsibility",
            description:
              "You are responsible for maintaining the confidentiality of your account credentials.\nYou agree not to misuse the platform or engage in fraudulent activities.\nAny activity carried out through your account shall be deemed your responsibility.",
            image: {
              url: "",
              alt: "Account & User Responsibility",
              title: "",
              caption: "",
              type: "point",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 3,
          },

          {
            title: "Platform Usage",
            description:
              "You shall use the platform only for lawful purposes.\nYou shall not attempt to disrupt, damage, or interfere with platform operations.\nYou shall not upload or transmit harmful, illegal, or objectionable content.\nSam Global reserves the right to suspend or terminate access for policy violations.",
            image: {
              url: "",
              alt: "Platform Usage",
              title: "",
              caption: "",
              type: "point",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 4,
          },

          {
            title: "Product Information & Pricing",
            description:
              "Product descriptions, images, and pricing are provided for informational purposes.\nWe strive for accuracy, but errors may occur.\nSam Global reserves the right to correct, update, or cancel orders in case of price or product errors.",
            image: {
              url: "",
              alt: "Product Information & Pricing",
              title: "",
              caption: "",
              type: "point",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 5,
          },

          {
            title: "Orders & Acceptance",
            description:
              "Placing an order constitutes an offer to purchase.\nPlacing an order constitutes an offer to purchase.\nOrder confirmation does not guarantee acceptance where verification or availability checks are pending.",
            image: {
              url: "",
              alt: "Orders & Acceptance",
              title: "",
              caption: "",
              type: "point",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 6,
          },

          {
            title: "Payments",
            description:
              "Payments must be made through approved payment methods.\nTransactions are processed through secure third-party payment gateways.\nSam Global is not liable for payment failures arising from banks or payment service providers.",
            image: {
              url: "",
              alt: "Payments",
              title: "",
              caption: "",
              type: "point",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 7,
          },

          {
            title: "Shipping, Returns & Refunds",
            description:
              "Shipping, returns, and refunds are governed by the applicable policies published on the platform.\nBy placing an order, you agree to those policy terms.",
            image: {
              url: "",
              alt: "Shipping, Returns & Refunds",
              title: "",
              caption: "",
              type: "point",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 8,
          },

          {
            title: "Marketplace Disclaimer",
            description:
              "Some products may be offered by third-party sellers through the platform.\nSam Global may facilitate transactions but is not responsible for seller-side representations beyond applicable policy commitments.",
            image: {
              url: "",
              alt: "Marketplace Disclaimer",
              title: "",
              caption: "",
              type: "point",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 9,
          },

          {
            title: "Intellectual Property",
            description:
              "All content, branding, graphics, designs, logos, software, and materials are owned by or licensed to Sam Global.\nUnauthorized use, reproduction, or distribution is strictly prohibited.",
            image: {
              url: "",
              alt: "Intellectual Property",
              title: "",
              caption: "",
              type: "point",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 10,
          },

          {
            title: "Limitation of Liability",
            description:
              "Indirect, incidental, or consequential damages.\nLoss of profits, data, business, or goodwill.\nDelays, interruptions, or technical failures.\nActions or omissions of third-party sellers, logistics providers, or payment gateways.",
            image: {
              url: "",
              alt: "Limitation of Liability",
              title: "",
              caption: "",
              type: "point",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 11,
          },

          {
            title: "INDEMNITY",
            description:
              "You agree to indemnify and hold harmless Sam Global from any claims, damages, losses, or liabilities arising from:\nYour use of the Platform.\nViolation of these Terms.\nInfringement of third-party rights.",
            image: {
              url: "",
              alt: "INDEMNITY ",
              title: "",
              caption: "",
              type: "point",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 12,
          },

          {
            title: "TERMINATION",
            description:
              "Sam Global reserves the right to:\nSuspend or terminate user access at any time without prior notice.\nRemove content or restrict access in case of policy violations.",
            image: {
              url: "",
              alt: "TERMINATION",
              title: "",
              caption: "",
              type: "point",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 13,
          },

          {
            title: "FORCE MAJEURE",
            description:
              "Sam Global shall not be liable for failure or delay caused by events beyond reasonable control, including natural disasters, government actions, or technical disruptions.",
            image: {
              url: "",
              alt: "FORCE MAJEURE",
              title: "",
              caption: "",
              type: "point",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 14,
          },

          {
            title: "GOVERNING LAW & JURISDICTION",
            description:
              "These Terms shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts located in [Insert City].",
            image: {
              url: "",
              alt: "GOVERNING LAW & JURISDICTION",
              title: "",
              caption: "",
              type: "point",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 15,
          },

          {
            title: "MODIFICATIONS",
            description:
              "Sam Global reserves the right to update or modify these Terms at any time. Continued use of the Platform constitutes acceptance of revised Terms.",
            image: {
              url: "",
              alt: "MODIFICATIONS",
              title: "",
              caption: "",
              type: "point",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 16,
          },

          {
            title: "CONTACT",
            description:
              "For any queries regarding these Terms, please contact us through the Contact Us page.",
            image: {
              url: "",
              alt: "CONTACT",
              title: "",
              caption: "",
              type: "point",
            },
            cta: {
              label: "",
              url: "",
              target: "_self",
            },
            sortOrder: 17,
          },
        ],

        cta: {
          label: "",
          url: "",
          target: "_self",
        },

        sortOrder: 1,
      },
    ],
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
    excerpt: "Everything You Need To Know",
    published: true,
    status: "published",

    cta: {
      label: "Contact Support",
      url: "/contact-us",
      target: "_self",
    },

    sections: [
      {
        type: "faq-category",
        title: "Shopping & Orders",
        description: "",
        points: [
          {
            title: "How do I place an order?",
            description:
              "Browse products, add them to your cart, proceed to checkout, provide your delivery details, and complete the payment.",
            sortOrder: 1,
          },
          {
            title: "How can I track my order?",
            description:
              "Once your order is confirmed, tracking details will be shared with you. You can monitor the shipment using the tracking link.",
            sortOrder: 2,
          },
          {
            title: "Can I modify or cancel my order?",
            description:
              "Orders can be modified or cancelled only before they are dispatched. After dispatch, the return policy will apply.",
            sortOrder: 3,
          },
        ],
        cta: {
          label: "",
          url: "",
          target: "_self",
        },
        sortOrder: 1,
      },

      {
        type: "faq-category",
        title: "Shipping & Delivery",
        description: "",
        points: [
          {
            title: "How long does delivery take?",
            description:
              "Delivery timelines depend on your location and product availability. Estimated delivery dates are shown during checkout.",
            sortOrder: 1,
          },
          {
            title: "Do you deliver everywhere?",
            description:
              "Delivery is available only in serviceable pincodes supported by our logistics partners.",
            sortOrder: 2,
          },
        ],
        cta: {
          label: "",
          url: "",
          target: "_self",
        },
        sortOrder: 2,
      },

      {
        type: "faq-category",
        title: "Returns & Refunds",
        description: "",
        points: [
          {
            title: "How do I request a return?",
            description:
              "Submit a return request from your account or contact customer support within the eligible return period.",
            sortOrder: 1,
          },
          {
            title: "When will I receive my refund?",
            description:
              "Refunds are initiated after successful verification of the returned product and are credited to the original payment method.",
            sortOrder: 2,
          },
        ],
        cta: {
          label: "",
          url: "",
          target: "_self",
        },
        sortOrder: 3,
      },

      {
        type: "faq-category",
        title: "Payments",
        description: "",
        points: [
          {
            title: "Which payment methods are accepted?",
            description:
              "We accept debit cards, credit cards, UPI, net banking, wallets, and other supported payment methods.",
            sortOrder: 1,
          },
        ],
        cta: {
          label: "",
          url: "",
          target: "_self",
        },
        sortOrder: 4,
      },

      {
        type: "faq-category",
        title: "Account & Support",
        description: "",
        points: [
          {
            title: "How do I reset my password?",
            description:
              "Click on 'Forgot Password' on the login page and follow the instructions sent to your registered email or mobile.",
            sortOrder: 1,
          },
        ],
        cta: {
          label: "",
          url: "",
          target: "_self",
        },
        sortOrder: 5,
      },

      {
        type: "faq-category",
        title: "For Brands & Partners",
        description: "",
        points: [
          {
            title: "How can I sell on Sam Global?",
            description:
              "Visit the Become a Seller page, complete the registration process, and our team will review your application.",
            sortOrder: 1,
          },
        ],
        cta: {
          label: "",
          url: "",
          target: "_self",
        },
        sortOrder: 6,
      },

      {
        type: "need-help",
        title: "Need More Help?",
        description:
          "Get the help you need from our automated assistant or contact our support team for further assistance.",
        points: [],
        cta: {
          label: "Contact Support",
          url: "/contact-us",
          target: "_self",
        },
        sortOrder: 99,
      },
    ],

    seo: {
      metaTitle: "Frequently Asked Questions",
      metaDescription:
        "Find answers to common shopping, payment, shipping and account questions.",
      keywords: [
        "faq",
        "help",
        "shipping",
        "orders",
        "payments",
        "returns",
      ],
      focusKeyword: "Frequently Asked Questions",
      canonicalUrl: "/faq",
      robots: "index,follow",
      ogTitle: "Frequently Asked Questions",
      ogDescription:
        "Find answers to common shopping, payment, shipping and account questions.",
      schemaType: "FAQPage",
      breadcrumbs: [
        {
          label: "Home",
          url: "/",
        },
        {
          label: "FAQ",
          url: "/faq",
        },
      ],
    },
  },
};