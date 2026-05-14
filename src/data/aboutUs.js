import {
  aboutValues,
  brandSwiper,
  ourStory,
  whyChooseUs,
} from "../constant/image.constant";

export const brandSwiperData = {
  cmsKey: "home-brand-carousel",
  sectionDetails: {
    heading: "Indian Brands",
    description: "Experience Across Leading Global Brands",
  },
  logos: [
    {
      name: "ZARA",
      icon: brandSwiper.zara,
    },
    {
      name: "GQ",
      icon: brandSwiper.gq,
    },
    {
      name: "Lacoste",
      icon: brandSwiper.lacoste,
    },
    {
      name: "Gucci",
      icon: brandSwiper.gucci,
    },
    {
      name: "Prada",
      icon: brandSwiper.prada,
    },
    {
      name: "Vogue",
      icon: brandSwiper.vogue,
    },
  ],
};

export const valueData = {
  cmsKey: "home-values",
  sectionDetails: {
    heading: "OUR VALUES",
  },
  cards: [
    {
      icon: aboutValues.excellence,
      title: "Execution Excellence",
      description:
        "We believe in strong ground-level execution. Every store, every customer interaction, and every process is driven by performance and discipline.",
    },
    {
      icon: aboutValues.customer,
      title: "Customer First",
      description:
        "Our approach is built around understanding Indian consumers and delivering consistent, high-quality retail experiences.",
    },
    {
      icon: aboutValues.growth,
      title: "Scalable Growth",
      description:
        "We focus on building systems and processes that enable sustainable, long-term expansion across markets.",
    },
  ],
};

export const whyChooseUsData = {
  cmsKey: "home-why-choose-us",
  sectionDetails: {
    heading: "Why Choose Us",
    description:
      "A strong retail partner focused on execution, growth, and long-term success.",
  },
  cards: [
    {
      icon: whyChooseUs.global,
      title: "Global Brand Experience",
      description:
        "Leadership experience with Adidas, Reebok, Levi’s, Pepe Jeans, and Benetton.",
    },
    {
      icon: whyChooseUs.performance,
      title: "Financial Discipline",
      description: "Strong governance and structured financial planning.",
    },

    {
      icon: whyChooseUs.performance,
      title: "Strong Retail Execution",
      description:
        "Disciplined store-level execution driving performance and consistency.",
    },
    {
      icon: whyChooseUs.multiCity,
      title: "Structured Expansion",
      description: "Planned multi-city growth strategy with scalable systems.",
    },

    {
      icon: whyChooseUs.sop,
      title: "SOP-Driven Operations",
      description: "Ensuring brand compliance and operational consistency.",
    },

    {
      icon: whyChooseUs.consumer,
      title: "Consumer Understanding",
      description:
        "Deep insights into Indian consumer behaviour and buying patterns.",
    },
    {
      icon: whyChooseUs.performance,
      title: "Performance-Driven Approach",
      description:
        "Focused on sell-through, inventory movement, and profitability.",
    },
    {
      icon: whyChooseUs.partnership,
      title: "Long-Term Partnerships",
      description: "Committed to building sustainable brand relationships.",
    },
  ],
};

export const ourStoryData = {
  cmsKey: "home-our-story",
  heading: "",
  description:
    "Sam Global is built on over 18+ years of experience in FMCG distribution and customer selling, with a strong foundation in execution and scale.<br/><br class='hidden md:block'/>From building high-performance sales networks to now expanding into organized apparel retail, our journey is driven by a clear vision — to create a scalable, execution-focused retail platform across India.<br/><br class='hidden md:block'/> Starting from Ludhiana, we are expanding into key markets with a structured, disciplined approach focused on performance, consistency, and long-term growth.",
  image: ourStory.about,
  ctaText: "",
};

export const ourMission = {
  cmsKey: "home-our-mission",
  title: "Our Mission",
  description:
    "Our mission is to build one of India’s most execution-focused retail networks, delivering high-performance stores and consistent brand experiences.<br/><br/>We aim to combine FMCG-scale execution with apparel retail expertise to ensure strong sell-through, operational efficiency, and customer satisfaction.<br/><br/>Through strategic partnerships and disciplined expansion, we are committed to building a nationwide retail platform with 400+ stores across India.",
  image: "/image/png/hand.png",
};
