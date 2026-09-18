const image = (url, alt = "") => ({ url, alt });

export const FALLBACK_HEADER_CATEGORIES = [
  "Electronics", "Fashion", "Beauty & Personal Care", "Home Appliances", "Home",
  "Furniture", "Food & Beverages", "Sports & Fitness", "Books & Media", "Toys & Baby Products",
].map((name) => ({
  name,
  categoryKey: name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-"),
  children: [],
}));

export const FALLBACK_HOME_CATEGORIES = [
  ["electronics", "Electronics", "/image/webp/cat.webp"],
  ["fashion", "Fashion", "/image/png/Fashion.png"],
  ["beauty-personal-care", "Beauty & Personal Care", "/image/png/coOrdSet.png"],
  ["home-appliances", "Home Appliances", "/image/webp/cat1.webp"],
  ["home", "Home", "/image/webp/home-decor.webp"],
].map(([categoryKey, displayName, displayImage]) => ({
  id: `fallback-${categoryKey}`,
  categoryKey,
  displayName,
  displayImage,
}));

export const FALLBACK_HERO_SLIDES = [
  ["HeroImg1.webp",
     "END OF SEASON SALE | UP TO 50% OFF",
     "Shop Smarter Across",
     "Every Category",
     "Discover premium accessories, smart gadgets, travel gear, and everyday essentials designed to complement your modern lifestyle."],
  ["HeroImg2.jpg", 
    "NEW ARRIVALS", 
    "Upgrade Your Daily",
     "Lifestyle Essentials", "From premium laptops and wireless headphones to everyday gadgets and accessories, find everything you need at unbeatable prices."],
  ["HeroImg3.jpg",
     "LIMITED TIME OFFERS | SAVE UP TO 50%",
      "Upgrade Your Lifestyle", 
      "With Smart Tech", "Discover stylish fashion, beauty, and everyday essentials curated for every occasion. Find quality products that bring comfort, confidence, and effortless style to your everyday life."],
].map(([file, badge, title, highlight, description], index) => ({
  id: `static-hero-${index + 1}`,
  image: `/image/png/fallback/${file}`,
  badge, title, highlight, description,
  primaryButton: "Shop Now", primaryLink: "/products",
  secondaryButton: "Explore Categories", secondaryLink: "/categories",
}));

export const FALLBACK_PROMO_CARDS = [
  ["chaniya-choli1.webp", "Festive Fashion"], ["chaniya-choli2.webp", "Celebrate In Style"],
  ["chaniya-choli3.webp", "New Season Looks"], ["chaniya-choli4.webp", "Traditional Edit"],
].map(([file, title]) => ({ image: `/image/png/fallback/${file}`, title, link: "/products" }));

export const FALLBACK_SHOPPING_BANNER = {
  image: "/image/png/fallback/bannerDeals.png",
  title: "Irresistible Brands,\nBest Prices",
  description: "50-80",
  cta: { url: "/deals" },
};

export const FALLBACK_SUPPORT = {
  topicImages: {
    order: "/image/png/fallback/Help&Support/Track-order.png", track: "/image/png/fallback/Help&Support/Track-order.png",
    return: "/image/png/fallback/Help&Support/Return-refund.png", refund: "/image/png/fallback/Help&Support/Return-refund.png",
    payment: "/image/png/fallback/Help&Support/payment-issues.png", paying: "/image/png/fallback/Help&Support/payment-issues.png",
    account: "/image/png/fallback/Help&Support/account-security.png", security: "/image/png/fallback/Help&Support/account-security.png",
  },
  topics: [
    ["Track Order", "Track-order.png", "/orders"], ["Return & Refund", "Return-refund.png", "/returns-refunds"],
    ["Payment Issues", "payment-issues.png", "/payments"], ["Rewards Help", "account-security.png", "#"],
    ["Account Security", "account-security.png", "/account/profile"],
  ].map(([title, file, path]) => ({ title, image: `/image/png/fallback/Help&Support/${file}`, path })),
  faqs: [
    ["How do I cancel an order?", "You can cancel an eligible order from My Orders before it is shipped."],
    ["When will I receive my refund?", "Refunds are processed within 5-7 business days after the returned item is inspected."],
    ["How do I track my order?", "Use the Track Order option under Quick Actions."],
    ["How do I contact a seller?", "Use Contact Seller from the product detail page."],
    ["How do I change my delivery address?", "Update your address from Account settings."],
    ["What payment methods do you accept?", "We accept cards, UPI, net banking, wallets, and eligible Cash on Delivery."],
  ].map(([title, description]) => ({ title, description })),
  contacts: [
    { type: "phone", title: "+91 99154 29897", description: "Call Us", path: "/contact-us" },
    { type: "mail", title: "info@samglobal1.com", description: "Email Support", path: "/contact-us" },
    { type: "ticket", title: "Raise a Ticket", description: "Submit a ticket and we will get back" },
  ],
};

export const FALLBACK_FAQ_PAGE = {
  title: "Frequently Asked Questions",
  description: "Helpful answers for shopping, orders, delivery, and payments.",
  sections: [{ type: "faq-category", title: "Orders", points: [
    { title: "How do I track my order?", description: "Open My Orders to view the latest delivery status." },
    { title: "How do I cancel an order?", description: "You can cancel an eligible order from My Orders before it is shipped." },
  ] }, { type: "faq-category", title: "Returns", points: [
    { title: "When will I receive my refund?", description: "Refunds are processed after the returned item is received and inspected." },
  ] }],
};

const sellerStories = [
  ["Aarav Mehta", "Sam Global gave our handcrafted home collection the reach it deserved.", "SellerStory.avif", "Founder, House of Aara", "3.2x growth in 8 months"],
  ["Nisha Kapoor", "The seller tools help us make better decisions every week.", "SellerStory1.webp", "Owner, Nivara Studio", "18,000+ orders delivered"],
  ["Kabir Shah", "Reliable payouts gave us the confidence to scale.", "SellerStory2.webp", "Director, K&S Essentials", "200+ products listed"],
  ["Riya Malhotra", "The marketplace helped our family-run brand find customers beyond our city.", "SellerStory3.webp", "Co-founder, Terra Crafts", "42 cities reached"],
  ["Dev Arora", "Sam Global made online selling feel approachable from day one.", "SellerStory4.webp", "Owner, Volt Avenue", "4.8 average rating"],
  ["Meera Iyer", "Simple tools and dependable support let us focus on our customers.", "SellerStory5.webp", "Founder, Studio Meera", "2.5x monthly growth"],
].map(([title, description, file, caption, label]) => ({ title, description, image: image(`/image/png/fallback/become-a-seller/${file}`, caption), cta: { label } }));

export const FALLBACK_SELLER_PAGE = {
  title: "Grow Your Business\nWith Sam Global",
  excerpt: "Reach more customers, manage orders easily, and grow with reliable support.",
  image: image("/image/png/fallback/sellerBanner.webp"),
  sections: [
    { points: sellerStories },
    { title: "Why sell with us", description: "Everything you need to build a thriving online business.", points: [
      ["Transparent earnings", "Clear fees and dependable payment cycles."], ["Nationwide reach", "Reach customers across India."], ["Insights that help", "Understand product performance."],
    ].map(([title, description]) => ({ title, description })) },
    { title: "Start selling", description: "Set up your storefront in a few simple steps.", points: [
      ["Create your account", "Register your business and share basic details."], ["Build your storefront", "Add products, pricing, and inventory."], ["Receive and ship orders", "Manage orders from your seller dashboard."], ["Get paid and grow", "Track payouts and performance insights."],
    ].map(([title, description]) => ({ title, description })) },
  ],
};

export const FALLBACK_SELLER_POLICY = {
  title: "Seller Policy", excerpt: "Seller Guidelines",
  description: "Our Seller Policy defines the standards and responsibilities that create a trusted experience for sellers and customers.",
  image: image("/image/png/fallback/sellerPolicy.webp"), cta: { label: "Become a Seller", url: "/become-a-seller" },
  sections: [
    ["policy-highlights", "Everything You Need To Sell Confidently", "Our marketplace policies protect sellers and strengthen customer confidence.", [["Genuine Products", "Sell only authentic and legally sourced products."], ["Accurate Listings", "Provide correct titles, images, pricing and specifications."], ["Timely Shipping", "Dispatch orders within the promised timeline."]]],
    ["seller-responsibilities", "Your Commitment Matters", "Follow these responsibilities to provide a trusted shopping experience.", [["List Authentic Products", "Upload only original products with complete details."], ["Maintain Accurate Listings", "Keep pricing, stock and information updated."], ["Process Orders Quickly", "Accept, pack and dispatch every order on time."], ["Support Customers", "Respond professionally to customer queries and returns."]]],
    ["account-compliance", "Maintain a Healthy Seller Account", "We monitor seller performance to ensure reliable service.", [["Good Standing", "Maintain accurate listings, timely shipping, and quality service."], ["Performance Review", "Accounts are reviewed using fulfillment and satisfaction data."], ["Policy Violations", "Repeated violations can lead to account restrictions."]]],
  ].map(([type, title, description, points]) => ({ type, title, description, points: points.map(([pointTitle, pointDescription]) => ({ title: pointTitle, description: pointDescription })) })),
};

export const FALLBACK_ABOUT = {
  bannerImage: "/image/png/fallback/sellerPolicy.webp",
  story: { description: "Sam Global is built on years of retail and distribution experience, with a clear focus on disciplined execution, customer trust, and sustainable growth across India.", image: image("/image/png/fallback/become-a-seller/outStory.png", "Sam Global story") },
  values: { title: "Our Values", points: [
    ["Execution Excellence", "Every customer interaction and process is driven by performance and discipline.", "excellence.png"], ["Customer First", "We focus on consistent, high-quality retail experiences for Indian consumers.", "customer.png"], ["Scalable Growth", "We build systems that support sustainable long-term expansion.", "growth.png"],
  ].map(([title, description, file]) => ({ title, description, image: image(`/image/png/fallback/icons/${file}`) })) },
  brands: { title: "Indian Brands", description: "Experience Across Leading Global Brands", points: ["zara", "gq", "lacoste", "gucci", "prada", "vogue"].map((brand) => ({ title: brand.toUpperCase(), image: image(`/image/png/fallback/brands/${brand}.png`) })) },
  mission: { title: "Our Mission", description: "Our mission is to build an execution-focused retail network that delivers dependable stores, strong brand experiences, and long-term value for customers and partners.", image: image("/image/png/fallback/become-a-seller/hand.png", "Our mission") },
  whyChoose: { title: "Why Choose Us", description: "A strong retail partner focused on execution, growth, and long-term success.", points: [
    ["Global Brand Experience", "Retail expertise shaped by leading global brands."], ["Financial Discipline", "Strong governance and structured planning."], ["Strong Retail Execution", "Disciplined operations that drive consistency."], ["Structured Expansion", "Scalable systems for multi-city growth."], ["Consumer Understanding", "Deep insight into customer needs and choices."], ["Long-Term Partnerships", "Built for trusted and sustainable collaboration."],
  ].map(([title, description], index) => ({ title, description, image: image(`/image/png/fallback/icons/dummy${index || ""}.png`) })) },
};
