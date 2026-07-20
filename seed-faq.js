const {
  connectMongo,
  mongoose,
} = require("../../src/infrastructure/mongo/mongo-client");
const {
  ContentPageModel,
} = require("../../src/modules/content/models/content-page.model");

async function seedPolicyPages() {
  try {
    await connectMongo();

    console.log("✅ MongoDB Connected");

    const pages = [
      {
        slug: "faq-details",
        title: "Frequently Asked Questions",
        pageType: "faq",
        status: "published",
        published: true,
        publishedAt: new Date(),

        description:
          "We believe great experiences come from clarity. Here are answers to some of the most common questions to help you navigate Sam Global with ease.",

        body: "",
        excerpt: "Everything You Need To Know",

        category: "faq",
        tags: ["faq", "help", "support"],

        image: {},
        gallery: [],
        points: [],
        cta: {
          label: "Contact Support",
          url: "/contact-us",
          target: "_self",
        },

        visibility: {
          channels: [],
          roles: [],
        },

        sortOrder: 1,
        language: "en",

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
          ogImage: {},
          twitterTitle: "Frequently Asked Questions",
          twitterDescription:
            "Find answers to common shopping, payment, shipping and account questions.",
          twitterImage: {},
          schemaType: "FAQPage",
          schemaJson: {},
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

        sections: [
          {
            type: "faq-category",
            title: "Shopping & Orders",
            description: "",
            image: {},
            gallery: [],
            sortOrder: 1,

            points: [
              {
                title: "How do I place an order?",
                description:
                  "Browse products, add them to your cart, proceed to checkout, provide your delivery details, and complete the payment.",
                image: {},
                cta: {},
                sortOrder: 1,
              },
              {
                title: "How can I track my order?",
                description:
                  "Once your order is confirmed, tracking details will be shared with you. You can monitor the shipment using the tracking link.",
                image: {},
                cta: {},
                sortOrder: 2,
              },
              {
                title: "Can I modify or cancel my order?",
                description:
                  "Orders can be modified or cancelled only before they are dispatched. After dispatch, the return policy will apply.",
                image: {},
                cta: {},
                sortOrder: 3,
              },
            ],

            cta: {},
          },

          {
            type: "faq-category",
            title: "Shipping & Delivery",
            description: "",
            image: {},
            gallery: [],
            sortOrder: 2,

            points: [
              {
                title: "How long does delivery take?",
                description:
                  "Delivery timelines depend on your location and product availability. Estimated delivery dates are shown during checkout.",
                image: {},
                cta: {},
                sortOrder: 1,
              },
              {
                title: "Do you deliver everywhere?",
                description:
                  "Delivery is available only in serviceable pincodes supported by our logistics partners.",
                image: {},
                cta: {},
                sortOrder: 2,
              },
            ],

            cta: {},
          },

          {
            type: "faq-category",
            title: "Returns & Refunds",
            description: "",
            image: {},
            gallery: [],
            sortOrder: 3,

            points: [
              {
                title: "How do I request a return?",
                description:
                  "Submit a return request from your account or contact customer support within the eligible return period.",
                image: {},
                cta: {},
                sortOrder: 1,
              },
              {
                title: "When will I receive my refund?",
                description:
                  "Refunds are initiated after successful verification of the returned product and are credited to the original payment method.",
                image: {},
                cta: {},
                sortOrder: 2,
              },
            ],

            cta: {},
          },

          {
            type: "faq-category",
            title: "Payments",
            description: "",
            image: {},
            gallery: [],
            sortOrder: 4,

            points: [
              {
                title: "Which payment methods are accepted?",
                description:
                  "We accept debit cards, credit cards, UPI, net banking, wallets, and other supported payment methods.",
                image: {},
                cta: {},
                sortOrder: 1,
              },
            ],

            cta: {},
          },

          {
            type: "faq-category",
            title: "Account & Support",
            description: "",
            image: {},
            gallery: [],
            sortOrder: 5,

            points: [
              {
                title: "How do I reset my password?",
                description:
                  "Click on 'Forgot Password' on the login page and follow the instructions sent to your registered email or mobile.",
                image: {},
                cta: {},
                sortOrder: 1,
              },
            ],

            cta: {},
          },

          {
            type: "faq-category",
            title: "For Brands & Partners",
            description: "",
            image: {},
            gallery: [],
            sortOrder: 6,

            points: [
              {
                title: "How can I sell on Sam Global?",
                description:
                  "Visit the Become a Seller page, complete the registration process, and our team will review your application.",
                image: {},
                cta: {},
                sortOrder: 1,
              },
            ],

            cta: {},
          },

          {
            type: "need-help",
            title: "Need More Help?",
            description:
              "Get the help you need from our automated assistant or contact our support team for further assistance.",

            image: {},
            gallery: [],
            points: [],
            cta: {
              label: "Contact Support",
              url: "/contact-us",
              target: "_self",
            },
            sortOrder: 99,
          },
        ],

        metadata: {},
      },
    ];

    for (const page of pages) {
      await ContentPageModel.findOneAndUpdate({ slug: page.slug }, page, {
        new: true,
        upsert: true,
      });

      console.log(`✅ ${page.title} uploaded`);
    }

    console.log("\n🎉 All Policy Pages Seeded Successfully");

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

seedPolicyPages();
