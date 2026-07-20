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
        slug: "about-banner",
        title: "About Banner",
        pageType: "about",
        status: "published",
        published: true,
        publishedAt: new Date(),

        description: "",
        body: "",
        excerpt: "",

        category: "about",
        tags: ["about", "banner"],

        image: {},
        gallery: [],
        points: [],
        cta: {},

        visibility: {
          channels: [],
          roles: [],
        },

        sortOrder: 1,
        language: "en",

        seo: {
          metaTitle: "About Us",
          metaDescription: "About Sam Global",
          keywords: ["about", "sam global"],
          focusKeyword: "About Sam Global",
          canonicalUrl: "/about-us",
          robots: "index,follow",
          ogTitle: "About Us",
          ogDescription: "About Sam Global",
          ogImage: {},
          twitterTitle: "About Us",
          twitterDescription: "About Sam Global",
          twitterImage: {},
          schemaType: "WebPage",
          schemaJson: {},
          breadcrumbs: [
            {
              label: "Home",
              url: "/",
            },
            {
              label: "About Us",
              url: "/about-us",
            },
          ],
        },

        sections: [
          {
            type: "about-banner",
            title: "",
            description: "",
            image: {
              url: "/image/png/aboutBanner.png",
              alt: "Modern and elegant fashion banner",
              title: "About Banner",
              caption: "",
              type: "image",
            },
            gallery: [],
            points: [],
            cta: {},
            sortOrder: 1,
          },
        ],

        metadata: {},
      },
      {
        slug: "about-sam-global",
        title: "About Sam Global",
        pageType: "about",
        status: "published",
        published: true,
        publishedAt: new Date(),

        description: "",
        body: "",
        excerpt: "",

        category: "about",
        tags: ["about", "company"],

        image: {},
        gallery: [],
        points: [],
        cta: {},

        visibility: {
          channels: [],
          roles: [],
        },

        sortOrder: 2,
        language: "en",

        seo: {
          metaTitle: "About Sam Global",
          metaDescription: "Learn more about Sam Global.",
          keywords: ["about", "sam global", "company"],
          focusKeyword: "About Sam Global",
          canonicalUrl: "/about-us",
          robots: "index,follow",
          ogTitle: "About Sam Global",
          ogDescription: "Learn more about Sam Global.",
          ogImage: {},
          twitterTitle: "About Sam Global",
          twitterDescription: "Learn more about Sam Global.",
          twitterImage: {},
          schemaType: "WebPage",
          schemaJson: {},
          breadcrumbs: [
            {
              label: "Home",
              url: "/",
            },
            {
              label: "About Us",
              url: "/about-us",
            },
          ],
        },

        sections: [
          {
            type: "about-sam-global",
            title: "About Sam Global",
            description:
              "Sam Global is built on over 18+ years of experience in FMCG distribution and customer selling, with a strong foundation in execution and scale.\n\nFrom building high-performance sales networks to now expanding into organized apparel retail, our journey is driven by a clear vision — to create a scalable, execution-focused retail platform across India.\n\nStarting from Ludhiana, we are expanding into key markets with a structured, disciplined approach focused on performance, consistency, and long-term growth.",

            image: {
              url: "/image/png/ourStory.png",
              alt: "About Sam Global",
              title: "About Sam Global",
              caption: "",
              type: "image",
            },

            gallery: [],
            points: [],
            cta: {},
            sortOrder: 1,
          },
        ],

        metadata: {},
      },
      {
        slug: "our-values",
        title: "Our Values",
        pageType: "about",
        status: "published",
        published: true,
        publishedAt: new Date(),

        description: "",
        body: "",
        excerpt: "",

        category: "about",
        tags: ["about", "values"],

        image: {},
        gallery: [],
        points: [],
        cta: {},

        visibility: {
          channels: [],
          roles: [],
        },

        sortOrder: 3,
        language: "en",

        seo: {
          metaTitle: "Our Values",
          metaDescription: "The values that define Sam Global.",
          keywords: ["our values", "sam global", "company values"],
          focusKeyword: "Our Values",
          canonicalUrl: "/about-us",
          robots: "index,follow",
          ogTitle: "Our Values",
          ogDescription: "The values that define Sam Global.",
          ogImage: {},
          twitterTitle: "Our Values",
          twitterDescription: "The values that define Sam Global.",
          twitterImage: {},
          schemaType: "WebPage",
          schemaJson: {},
          breadcrumbs: [
            {
              label: "Home",
              url: "/",
            },
            {
              label: "About Us",
              url: "/about-us",
            },
          ],
        },

        sections: [
          {
            type: "our-values",
            title: "Our Values",
            description: "",

            image: {},
            gallery: [],
            cta: {},
            sortOrder: 1,

            points: [
              {
                title: "Execution Excellence",
                description:
                  "We believe in strong ground-level execution. Every store, every customer interaction, and every process is driven by performance and discipline.",
                image: {
                  url: "/image/png/excellence.png",
                  alt: "Execution Excellence",
                  title: "Execution Excellence",
                  caption: "",
                  type: "image",
                },
                cta: {},
                sortOrder: 1,
              },
              {
                title: "Customer First",
                description:
                  "Our approach is built around understanding Indian consumers and delivering consistent, high-quality retail experiences.",
                image: {
                  url: "/image/png/customer.png",
                  alt: "Customer First",
                  title: "Customer First",
                  caption: "",
                  type: "image",
                },
                cta: {},
                sortOrder: 2,
              },
              {
                title: "Scalable Growth",
                description:
                  "We focus on building systems and processes that enable sustainable, long-term expansion across markets.",
                image: {
                  url: "/image/png/growth.png",
                  alt: "Scalable Growth",
                  title: "Scalable Growth",
                  caption: "",
                  type: "image",
                },
                cta: {},
                sortOrder: 3,
              },
            ],
          },
        ],

        metadata: {},
      },
      {
        slug: "indian-brand",
        title: "Indian Brands",
        pageType: "about",
        status: "published",
        published: true,
        publishedAt: new Date(),

        description: "",
        body: "",
        excerpt: "",

        category: "about",
        tags: ["about", "brands"],

        image: {},
        gallery: [],
        points: [],
        cta: {},

        visibility: {
          channels: [],
          roles: [],
        },

        sortOrder: 4,
        language: "en",

        seo: {
          metaTitle: "Indian Brands",
          metaDescription:
            "Discover the trusted brands associated with Sam Global.",
          keywords: ["indian brands", "brands", "sam global"],
          focusKeyword: "Indian Brands",
          canonicalUrl: "/about-us",
          robots: "index,follow",
          ogTitle: "Indian Brands",
          ogDescription:
            "Discover the trusted brands associated with Sam Global.",
          ogImage: {},
          twitterTitle: "Indian Brands",
          twitterDescription:
            "Discover the trusted brands associated with Sam Global.",
          twitterImage: {},
          schemaType: "WebPage",
          schemaJson: {},
          breadcrumbs: [
            {
              label: "Home",
              url: "/",
            },
            {
              label: "About Us",
              url: "/about-us",
            },
          ],
        },

        sections: [
          {
            type: "indian-brand",
            title: "Indian Brands",
            description:
              "A curated space showcasing trusted brands associated with Sam Global.",

            image: {},
            gallery: [],
            cta: {},
            sortOrder: 1,

            points: [
              {
                title: "Zara",
                description: "",
                image: {
                  url: "/image/png/zara.png",
                  alt: "Zara",
                  title: "Zara",
                  caption: "",
                  type: "image",
                },
                cta: {},
                sortOrder: 1,
              },
              {
                title: "Vogue",
                description: "",
                image: {
                  url: "/image/png/vogue.png",
                  alt: "Vogue",
                  title: "Vogue",
                  caption: "",
                  type: "image",
                },
                cta: {},
                sortOrder: 2,
              },
              {
                title: "Lacoste",
                description: "",
                image: {
                  url: "/image/png/lacoste.png",
                  alt: "Lacoste",
                  title: "Lacoste",
                  caption: "",
                  type: "image",
                },
                cta: {},
                sortOrder: 3,
              },
              {
                title: "GQ",
                description: "",
                image: {
                  url: "/image/png/gq.png",
                  alt: "GQ",
                  title: "GQ",
                  caption: "",
                  type: "image",
                },
                cta: {},
                sortOrder: 4,
              },
              {
                title: "Prada",
                description: "",
                image: {
                  url: "/image/png/prada.png",
                  alt: "Prada",
                  title: "Prada",
                  caption: "",
                  type: "image",
                },
                cta: {},
                sortOrder: 5,
              },
              {
                title: "Gucci",
                description: "",
                image: {
                  url: "/image/png/gucci.png",
                  alt: "Gucci",
                  title: "Gucci",
                  caption: "",
                  type: "image",
                },
                cta: {},
                sortOrder: 6,
              },
            ],
          },
        ],

        metadata: {},
      },
      {
        slug: "why-choose-us",
        title: "Why Choose Us",
        pageType: "about",
        status: "published",
        published: true,
        publishedAt: new Date(),

        description: "",
        body: "",
        excerpt: "",

        category: "about",
        tags: ["about", "why choose us"],

        image: {},
        gallery: [],
        points: [],
        cta: {},

        visibility: {
          channels: [],
          roles: [],
        },

        sortOrder: 5,
        language: "en",

        seo: {
          metaTitle: "Why Choose Us",
          metaDescription:
            "A strong retail partner focused on execution, growth, and long-term success.",
          keywords: ["why choose us", "sam global"],
          focusKeyword: "Why Choose Us",
          canonicalUrl: "/about-us",
          robots: "index,follow",
          ogTitle: "Why Choose Us",
          ogDescription:
            "A strong retail partner focused on execution, growth, and long-term success.",
          ogImage: {},
          twitterTitle: "Why Choose Us",
          twitterDescription:
            "A strong retail partner focused on execution, growth, and long-term success.",
          twitterImage: {},
          schemaType: "WebPage",
          schemaJson: {},
          breadcrumbs: [
            {
              label: "Home",
              url: "/",
            },
            {
              label: "About Us",
              url: "/about-us",
            },
          ],
        },

        sections: [
          {
            type: "why-choose-us",
            title: "Why Choose Us",
            description:
              "A strong retail partner focused on execution, growth, and long-term success.",

            image: {},
            gallery: [],
            cta: {},
            sortOrder: 1,

            points: [
              {
                title: "Proven Sales Expertise",
                description:
                  "18+ years of experience in high-volume product selling and distribution.",
                image: {
                  url: "/image/png/provenSalesExpertise.png",
                  alt: "Proven Sales Expertise",
                  title: "Proven Sales Expertise",
                  caption: "",
                  type: "image",
                },
                cta: {},
                sortOrder: 1,
              },
              {
                title: "Strong Retail Execution",
                description:
                  "Disciplined store-level execution driving performance and consistency.",
                image: {
                  url: "/image/png/strongRetailExecution.png",
                  alt: "Strong Retail Execution",
                  title: "Strong Retail Execution",
                  caption: "",
                  type: "image",
                },
                cta: {},
                sortOrder: 2,
              },
              {
                title: "Consumer Understanding",
                description:
                  "Deep insights into Indian consumer behaviour and buying patterns.",
                image: {
                  url: "/image/png/consumerUnderstanding.png",
                  alt: "Consumer Understanding",
                  title: "Consumer Understanding",
                  caption: "",
                  type: "image",
                },
                cta: {},
                sortOrder: 3,
              },
              {
                title: "Global Brand Experience",
                description:
                  "Leadership experience with Adidas, Reebok, Levi's, Pepe Jeans, and Benetton.",
                image: {
                  url: "/image/png/globalBrandExperience.png",
                  alt: "Global Brand Experience",
                  title: "Global Brand Experience",
                  caption: "",
                  type: "image",
                },
                cta: {},
                sortOrder: 4,
              },
              {
                title: "Structured Expansion",
                description:
                  "Planned multi-city growth strategy with scalable systems.",
                image: {
                  url: "/image/png/structuredExpansion.png",
                  alt: "Structured Expansion",
                  title: "Structured Expansion",
                  caption: "",
                  type: "image",
                },
                cta: {},
                sortOrder: 5,
              },
              {
                title: "Performance-Driven Approach",
                description:
                  "Focused on sell-through, inventory movement, and profitability.",
                image: {
                  url: "/image/png/performanceDrivenApproach.png",
                  alt: "Performance-Driven Approach",
                  title: "Performance-Driven Approach",
                  caption: "",
                  type: "image",
                },
                cta: {},
                sortOrder: 6,
              },
              {
                title: "Financial Discipline",
                description:
                  "Strong governance and structured financial planning.",
                image: {
                  url: "/image/png/financialDiscipline.png",
                  alt: "Financial Discipline",
                  title: "Financial Discipline",
                  caption: "",
                  type: "image",
                },
                cta: {},
                sortOrder: 7,
              },
              {
                title: "SOP-Driven Operations",
                description:
                  "Ensuring brand compliance and operational consistency.",
                image: {
                  url: "/image/png/sopDrivenOperations.png",
                  alt: "SOP-Driven Operations",
                  title: "SOP-Driven Operations",
                  caption: "",
                  type: "image",
                },
                cta: {},
                sortOrder: 8,
              },
              {
                title: "Long-Term Partnerships",
                description:
                  "Committed to building sustainable brand relationships.",
                image: {
                  url: "/image/png/longTermPartnerships.png",
                  alt: "Long-Term Partnerships",
                  title: "Long-Term Partnerships",
                  caption: "",
                  type: "image",
                },
                cta: {},
                sortOrder: 9,
              },
            ],
          },
        ],

        metadata: {},
      },
      {
        slug: "our-mission",
        title: "Our Mission",
        pageType: "about",
        status: "published",
        published: true,
        publishedAt: new Date(),

        description: "",
        body: "",
        excerpt: "",

        category: "about",
        tags: ["about", "mission"],

        image: {},
        gallery: [],
        points: [],
        cta: {},

        visibility: {
          channels: [],
          roles: [],
        },

        sortOrder: 6,
        language: "en",

        seo: {
          metaTitle: "Our Mission",
          metaDescription: "Learn about the mission of Sam Global.",
          keywords: ["our mission", "sam global"],
          focusKeyword: "Our Mission",
          canonicalUrl: "/about-us",
          robots: "index,follow",
          ogTitle: "Our Mission",
          ogDescription: "Learn about the mission of Sam Global.",
          ogImage: {},
          twitterTitle: "Our Mission",
          twitterDescription: "Learn about the mission of Sam Global.",
          twitterImage: {},
          schemaType: "WebPage",
          schemaJson: {},
          breadcrumbs: [
            {
              label: "Home",
              url: "/",
            },
            {
              label: "About Us",
              url: "/about-us",
            },
          ],
        },

        sections: [
          {
            type: "our-mission",
            title: "Our Mission",
            description:
              "Our mission is to build a trusted digital marketplace where customers can shop with clarity and sellers can grow with confidence.<br /><br />We aim to make quality products more accessible through dependable technology, transparent service, and a customer-first approach.",

            image: {
              url: "/image/png/hand.png",
              alt: "Customer and seller support",
              title: "Our Mission",
              caption: "",
              type: "image",
            },

            gallery: [],
            points: [],
            cta: {},
            sortOrder: 1,
          },
        ],

        metadata: {
          helpSection: {
            heading1: "Shopping Made Easy",
            heading2: "Your trusted marketplace for everyday needs.",
            description:
              "Explore products, discover trusted sellers, and shop with confidence.",
            buttonText: "Shop Now",
            buttonPath: "/products",
          },
        },
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
