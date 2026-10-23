const point = (title, lines, sortOrder) => ({
  title,
  description: Array.isArray(lines) ? lines.join("\n") : lines,
  sortOrder,
});

const policy = (title, heading, description, items) => ({
  title,
  description: "",
  sections: [{ type: "content", title: heading, description, points: items }],
});

export const CANONICAL_POLICY_DATA = {
  shipping: policy(
    "Shipping & Delivery",
    "Designed for Convenience. Delivered with Care.",
    "At Sam Global, we aim to ensure a seamless delivery experience. This Shipping Policy outlines the terms governing order processing, dispatch, and delivery.",
    [
      point(
        "Order Processing",
        [
          "Orders are processed within standard business timelines after successful payment confirmation",
          "Processing timelines may vary based on product availability, order volume, or operational factors",
          "Sam Global reserves the right to cancel or delay orders in case of unforeseen circumstances, including stock unavailability or verification issues",
        ],
        1,
      ),
      point(
        "Delivery Timelines",
        [
          "Estimated delivery timelines are indicative and will be displayed at checkout",
          "Actual delivery may vary depending on location, logistics partner timelines, and external factors",
          "Delays caused by circumstances beyond our control (including but not limited to weather, strikes, regional restrictions, or logistics disruptions) shall not constitute a breach of obligation",
        ],
        2,
      ),
      point(
        "Shipping Coverage",
        [
          "Delivery is subject to serviceable pincodes as determined by our logistics partners",
          "Sam Global reserves the right to refuse delivery to certain locations without prior notice",
        ],
        3,
      ),
      point(
        "Shipping Charges",
        [
          "Shipping charges, if applicable, will be displayed at checkout prior to order confirmation",
          "Charges may vary based on order value, delivery location, product category, or promotional offers",
        ],
        4,
      ),
      point(
        "Order Tracking",
        [
          "Tracking details will be shared upon dispatch of the order",
          "The Customer is responsible for monitoring shipment updates using the provided tracking information",
        ],
        5,
      ),
      point(
        "Delivery & Acceptance",
        [
          "Delivery shall be deemed completed once the order is delivered to the address provided at the time of purchase",
          "Any person available at the delivery address shall be deemed authorized to receive the order on behalf of the Customer",
          "Sam Global shall not be liable for loss or damage after successful delivery",
        ],
        6,
      ),
      point(
        "Limitation of Liability",
        "Sam Global shall not be liable for delays, non-delivery, or service interruptions caused by third-party logistics providers or events beyond reasonable control.",
        7,
      ),
      point(
        "Need Assistance?",
        [
          "For any shipping-related queries, please contact our support team.",
          "Reliable delivery, aligned with clarity and trust.",
        ],
        8,
      ),
    ],
  ),
  returns: policy(
    "Return & Refund Policy",
    "Simple. Transparent. Hassle-Free.",
    "This Return & Refund Policy governs the conditions under which returns, exchanges, and refunds are processed.",
    [
      point(
        "Return Eligibility",
        [
          "Returns will be accepted only if:",
          "The return request is initiated within the specified return window",
          "The product is unused, undamaged, and in its original condition",
          "All original tags, packaging, and accessories are intact",
          "Sam Global reserves the right to reject returns that do not meet the above conditions.",
        ],
        1,
      ),
      point(
        "Return Process",
        [
          "Return requests must be initiated through the designated platform or support channels",
          "Pickup or return instructions will be communicated upon request approval",
          "Products must be handed over in the same condition as received",
          "Failure to comply may result in rejection of the return request.",
        ],
        2,
      ),
      point(
        "Verification & Approval",
        [
          "All returned products are subject to inspection and quality checks",
          "Approval or rejection of returns shall be at the sole discretion of Sam Global based on product condition",
        ],
        3,
      ),
      point(
        "Refund Process",
        [
          "Refunds will be initiated only after successful verification of returned products",
          "Refunds will be processed via the original mode of payment unless otherwise specified",
          "Timelines may vary depending on banking partners and payment gateways",
          "Sam Global shall not be liable for delays caused by third-party financial institutions.",
        ],
        4,
      ),
      point(
        "Exchange Policy",
        [
          "Exchanges are subject to product availability and eligibility",
          "In cases where exchange is not possible, a refund may be issued as per policy",
        ],
        5,
      ),
      point(
        "Non-Returnable Items",
        [
          "Certain products may not be eligible for return, including but not limited to:",
          "Personal use or hygiene-sensitive items",
          "Products marked as non-returnable at the time of purchase",
        ],
        6,
      ),
      point(
        "Damaged / Incorrect Products",
        [
          "Any claims regarding damaged, defective, or incorrect products must be reported within 48 hours of delivery",
          "Failure to report within this timeframe may result in rejection of the claim",
        ],
        7,
      ),
      point(
        "Cancellation Policy",
        [
          "Orders can be cancelled only within a limited time window before dispatch",
          "Once dispatched, orders cannot be cancelled and will be treated under the return policy",
        ],
        8,
      ),
      point(
        "Limitation of Liability",
        [
          "Sam Global shall not be liable for:",
          "Improper use or handling of products after delivery",
          "Minor variations in color, texture, or finish due to display differences",
          "Delays in refunds caused by external financial systems",
        ],
        9,
      ),
      point(
        "Need Help?",
        [
          "For assistance, please reach out to our support team.",
          "Clarity in process. Confidence in every purchase.",
        ],
        10,
      ),
    ],
  ),
  privacy: policy(
    "Privacy Policy",
    "Your Privacy Matters",
    "At Sam Global, we are committed to protecting your personal information and ensuring transparency in how your data is collected, used, and safeguarded.",
    [
      point(
        "1. Information We Collect",
        [
          "Personal Information: Name, phone number, email address; shipping and billing address",
          "Account Information: Login details, preferences, and order history",
          "Transaction Data: Payment details processed securely via third-party gateways",
          "Technical Data: IP address, browser type, device information, website usage and interaction data",
        ],
        1,
      ),
      point(
        "2. How We Use Your Information",
        [
          "Process and deliver your orders",
          "Provide customer support",
          "Improve our platform and user experience",
          "Send order updates, service notifications, and relevant offers",
          "Prevent fraud and ensure platform security",
        ],
        2,
      ),
      point(
        "3. Sharing of Information",
        [
          "We do not sell your personal data.",
          "We may share information with logistics partners, payment gateways, technology and analytics providers, and sellers where applicable.",
          "All partners are expected to maintain data confidentiality and security.",
        ],
        3,
      ),
      point(
        "4. Data Security",
        [
          "We implement appropriate technical and organizational measures to protect your data.",
          "However, no system is completely secure, and we cannot guarantee absolute security.",
        ],
        4,
      ),
      point(
        "5. Cookies & Tracking",
        [
          "We use cookies and similar technologies to enhance browsing, remember preferences, and analyse platform usage.",
          "Refer to our Cookie Policy for more details.",
        ],
        5,
      ),
      point(
        "6. Your Rights",
        [
          "Access or update your personal information",
          "Request deletion of your data, subject to legal requirements",
          "Opt out of marketing communications",
        ],
        6,
      ),
      point(
        "7. Data Retention",
        [
          "We retain data only as long as necessary for order fulfilment, legal and regulatory compliance, and business operations.",
        ],
        7,
      ),
      point(
        "8. Third-Party Links",
        "Our platform may contain links to external websites. We are not responsible for the privacy practices of such third parties.",
        8,
      ),
      point(
        "9. Policy Updates",
        "We may update this Privacy Policy from time to time. Continued use of the platform implies acceptance of the updated policy.",
        9,
      ),
      point(
        "10. Contact Us",
        [
          "For any privacy-related concerns, please contact us through our Contact page.",
          "Your trust is important to us, and we are committed to protecting it.",
        ],
        10,
      ),
    ],
  ),
  cookie: policy(
    "Cookie Policy",
    "Understanding How We Use Cookies",
    "This Cookie Policy explains how Sam Global uses cookies and similar technologies to enhance your experience on our platform.",
    [
      point(
        "1. What Are Cookies?",
        "Cookies are small text files stored on your device when you visit a website. They help improve functionality, performance, and user experience.",
        1,
      ),
      point(
        "2. Types of Cookies We Use",
        [
          "Essential Cookies: Required for basic website functionality such as login and checkout.",
          "Performance Cookies: Help us understand how users interact with our platform to improve performance.",
          "Functional Cookies: Remember your preferences and settings for a personalized experience.",
          "Advertising Cookies: Used to deliver relevant ads and measure campaign effectiveness.",
        ],
        2,
      ),
      point(
        "3. How We Use Cookies",
        [
          "Enable smooth navigation and functionality",
          "Remember your preferences and login details",
          "Analyse website traffic and usage patterns",
          "Improve performance and user experience",
          "Support marketing and advertising efforts",
        ],
        3,
      ),
      point(
        "4. Third-Party Cookies",
        "We may allow trusted third-party services, such as analytics or advertising platforms, to place cookies on your device. These cookies are governed by the respective third parties’ policies.",
        4,
      ),
      point(
        "5. Managing Cookies",
        "You can control or disable cookies through your browser settings. Please note that disabling cookies may affect certain features and functionality of the platform.",
        5,
      ),
      point(
        "6. Consent",
        "By continuing to use our platform, you consent to our use of cookies as described in this policy.",
        6,
      ),
      point(
        "7. Updates to This Policy",
        "We may update this Cookie Policy from time to time.",
        7,
      ),
      point(
        "Closing Line",
        "Designed to enhance your experience while respecting your privacy.",
        8,
      ),
    ],
  ),
  terms: policy(
    "Terms of Use",
    "Please Read Carefully",
    "These Terms & Conditions (Terms) govern your access to and use of the Sam Global website, platform, and services (collectively, the Platform). By accessing, browsing, or using the Platform, you agree to be bound by these Terms. If you do not agree, please do not use the Platform.",
    [
      point(
        "1. Definitions",
        [
          "Platform refers to the Sam Global website, mobile application, and related services",
          "User / Customer refers to any individual accessing or using the Platform",
          "Seller refers to third-party vendors offering products through the Platform (where applicable)",
          "Services refers to all functionalities provided through the Platform",
        ],
        1,
      ),
      point(
        "2. Eligibility",
        [
          "Users must be at least 18 years of age or legally competent to enter into a contract",
          "By using the Platform, you represent that all information provided is accurate and complete",
        ],
        2,
      ),
      point(
        "3. Account & User Responsibility",
        [
          "Users may be required to create an account to access certain features",
          "You are responsible for maintaining the confidentiality of your login credentials",
          "Any activity conducted through your account shall be deemed your responsibility",
          "Sam Global shall not be liable for unauthorized access arising from user negligence.",
        ],
        3,
      ),
      point(
        "4. Platform Usage",
        [
          "Do not use the Platform for unlawful or fraudulent purposes",
          "Do not interfere with its operation, security, or functionality",
          "Do not attempt unauthorized access to systems, data, or accounts",
          "Do not use automated tools without permission",
          "Sam Global reserves the right to restrict or terminate access for violations.",
        ],
        4,
      ),
      point(
        "5. Product Information & Pricing",
        [
          "Product descriptions, images, and pricing are provided for informational purposes",
          "While efforts are made to ensure accuracy, errors may occur",
          "Sam Global reserves the right to correct errors, update information, or cancel orders without prior notice",
          "Prices and availability are subject to change.",
        ],
        5,
      ),
      point(
        "6. Orders & Acceptance",
        [
          "Placing an order constitutes an offer to purchase",
          "Sam Global reserves the right to accept or reject any order at its discretion",
          "Order confirmation does not guarantee acceptance; orders may be cancelled due to stock issues, pricing errors, or verification concerns",
        ],
        6,
      ),
      point(
        "7. Payments",
        [
          "All payments must be made through approved payment methods available on the Platform",
          "Transactions are processed through secure third-party payment gateways",
          "Sam Global shall not be liable for payment failures or delays caused by third-party providers",
        ],
        7,
      ),
      point(
        "8. Shipping, Returns & Refunds",
        "All policies relating to shipping, returns, and refunds are governed by separate policy pages available on the Platform. By using the Platform, you agree to be bound by such policies.",
        8,
      ),
      point(
        "9. Marketplace Disclaimer (If Applicable)",
        [
          "The Platform may act as an intermediary connecting customers and third-party sellers",
          "Sam Global does not manufacture, own, or directly control products listed by sellers",
          "Responsibility for product quality, legality, and compliance rests solely with the respective seller",
          "Sam Global shall not be liable for disputes arising between users and sellers.",
        ],
        9,
      ),
      point(
        "10. Intellectual Property",
        [
          "All content on the Platform, including text, images, logos, design, and software, is the property of Sam Global or its licensors",
          "Unauthorized use, reproduction, or distribution is strictly prohibited",
        ],
        10,
      ),
      point(
        "11. Limitation of Liability",
        [
          "Indirect, incidental, or consequential damages",
          "Loss of profits, data, business, or goodwill",
          "Delays, interruptions, or technical failures",
          "Actions or omissions of third-party sellers, logistics providers, or payment gateways",
        ],
        11,
      ),
      point(
        "12. Indemnity",
        [
          "Your use of the Platform",
          "Violation of these Terms",
          "Infringement of third-party rights",
        ],
        12,
      ),
      point(
        "13. Termination",
        [
          "Suspend or terminate user access at any time without prior notice",
          "Remove content or restrict access in case of policy violations",
        ],
        13,
      ),
      point(
        "14. Force Majeure",
        "Sam Global shall not be liable for failure or delay caused by events beyond reasonable control, including natural disasters, government actions, or technical disruptions.",
        14,
      ),
      point(
        "15. Governing Law & Jurisdiction",
        "These Terms shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts located in Ludhiana, Punjab.",
        15,
      ),
      point(
        "16. Modifications",
        "Sam Global reserves the right to update or modify these Terms at any time. Continued use of the Platform constitutes acceptance of revised Terms.",
        16,
      ),
      point(
        "17. Contact",
        "For any queries regarding these Terms, please contact us through the Contact Us page.",
        17,
      ),
    ],
  ),
};

export const CANONICAL_FAQ_DATA = {
  slug: "faq-details",
  title: "Frequently Asked Questions",
  description: "Everything You Need to Know",
  excerpt:
    "We believe great experiences come from clarity. Here are answers to some of the most common questions to help you navigate Sam Global with ease.",
  sections: [
    [
      "Shopping & Orders",
      [
        [
          "How do I place an order?",
          "Browse through our collections, select your preferred products, and proceed to checkout. The process is designed to be simple, seamless, and secure.",
        ],
        [
          "How can I track my order?",
          "Once your order is confirmed, you will receive tracking details so you can monitor your delivery in real time.",
        ],
        [
          "Can I modify or cancel my order?",
          "Orders can be modified or canceled within a limited time window after placement. We recommend acting promptly or reaching out to our support team for assistance.",
        ],
      ],
    ],
    [
      "Shipping & Delivery",
      [
        [
          "What are the delivery timelines?",
          "Delivery timelines may vary based on your location and product availability. Estimated timelines will be shared at checkout.",
        ],
        [
          "Do you offer free shipping?",
          "Shipping benefits may vary depending on ongoing offers, order value, or location. Applicable details will be visible during checkout.",
        ],
      ],
    ],
    [
      "Returns & Refunds",
      [
        [
          "What is your return policy?",
          "We offer a hassle-free return process within the specified return period, provided the product is unused and in its original condition.",
        ],
        [
          "How are refunds processed?",
          "Refunds are initiated after product verification and processed to the original payment method within standard timelines.",
        ],
      ],
    ],
    [
      "Payments",
      [
        [
          "What payment methods are accepted?",
          "We support a range of secure payment options, including cards, UPI, net banking, and digital wallets.",
        ],
        [
          "Is it safe to make payments on your platform?",
          "Yes, all transactions are secured through trusted payment gateways to ensure a safe and reliable experience.",
        ],
      ],
    ],
    [
      "Account & Support",
      [
        [
          "Do I need an account to shop?",
          "While you can browse freely, creating an account allows for a more personalized and seamless shopping experience.",
        ],
        [
          "How can I contact customer support?",
          "You can reach out to us through the Contact Us page. Our team is always ready to assist you.",
        ],
      ],
    ],
    [
      "For Brands & Partners",
      [
        [
          "How can brands partner with Sam Global?",
          "We collaborate with brands looking to expand through a structured and scalable retail platform. You can connect with us through our business inquiry channels.",
        ],
        [
          "Do you offer retail expansion opportunities?",
          "Yes, we actively work with partners to expand our retail presence across key markets through a disciplined, growth-focused approach.",
        ],
      ],
    ],
  ].map(([title, items], sortOrder) => ({
    type: "faq-category",
    title,
    sortOrder: sortOrder + 1,
    points: items.map(([question, answer], index) =>
      point(question, answer, index + 1),
    ),
  })),
};
