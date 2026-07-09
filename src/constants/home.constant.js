import { collageCard } from "./image.constant";

export const FALLBACK_COLLAGE_SECTIONS = [
  {
    key: "mens-best-sellers",
    title: "Best Sellers in Men's Fashion",
    label: "Trending",
    category: "mens-fashion",
    images: [
      {
        image: collageCard.menFashion,
        label: "Sneakers",
      },
      { image: collageCard.stylishPair, label: "Jackets" },
      {
        image: collageCard.blazer,
        label: "Shirts",
      },
      {
        image: collageCard.watch,
        label: "Trousers",
      },
    ],
  },
  {
    key: "home-lifestyle-deals",
    title: "Up to 60% Off Home & Lifestyle",
    label: "Hot Deal",
    category: "home",
    images: [
      {
        image: collageCard.homeDecor,
        label: "Vases",
      },
      {
        image: collageCard.smartHome,
        label: "Sofas",
      },
      {
        image: collageCard.plants,
        label: "Plants",
      },
      {
        image: collageCard.candles,
        label: "Candles",
      },
    ],
  },
  {
    key: "womens-trending",
    title: "Trending in Women's Fashion",
    label: "New In",
    category: "womens-fashion",
    images: [
      {
        image: collageCard.hats,
        label: "Hats",
      },
      {
        image: collageCard.handbags,
        label: "Handbags",
      },
      {
        image: collageCard.jeweler,
        label: "Jewelry",
      },
      {
        image: collageCard.heels,
        label: "Heels",
      },
    ],
  },
  {
    key: "kids-popular",
    title: "Top Picks in Kids Fashion",
    label: "Popular",
    category: "kids",
    images: [
      { image: collageCard.caps, label: "Caps" },
      { image: collageCard.shorts, label: "Shorts" },
      {
        image: collageCard.shoes,
        label: "Shoes",
      },
      {
        image: collageCard.socks,
        label: "Socks",
      },
    ],
  },
];
