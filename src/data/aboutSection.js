import { aboutValues, brandSwiper } from "../constant/image.constant";

export const brandSwiperData = {
  sectionDetails: {
    heading: "Indian Brands",
    description: "Experience Across Leading Global Brands",
  },
  logos: [
    {
      name: "ZARA",
      image: brandSwiper.zara,
    },
    {
      name: "GQ",
      image: brandSwiper.gq,
    },
    {
      name: "Lacoste",
      image: brandSwiper.lacoste,
    },
    {
      name: "Gucci",
      image: brandSwiper.gucci,
    },
    {
      name: "Prada",
      image: brandSwiper.prada,
    },
    {
      name: "Vogue",
      image: brandSwiper.vogue,
    },
  ],
};

export const valueData = {
  sectionDetails: {
    heading: "OUR VALUES",
  },
  cards: [
    {
      image: aboutValues.excellence,
      title: "Execution Excellence",
      description:
        "We believe in strong ground-level execution. Every store, every customer interaction, and every process is driven by performance and discipline.",
    },
    {
      image: aboutValues.customer,
      title: "Customer First",
      description:
        "Our approach is built around understanding Indian consumers and delivering consistent, high-quality retail experiences.",
    },
    {
      image: aboutValues.growth,
      title: "Scalable Growth",
      description:
        "We focus on building systems and processes that enable sustainable, long-term expansion across markets.",
    },
  ],
};
