import NewArrivalCard from "../components/ui/NewArrivalCard";
import TopDealCard from "../components/ui/TopDealCard";
import {
  collageCard,
  mothersDaySwiperImages,
} from "../constant/image.constant";
import arrivals from "./arrivals.json";
import topDeals from "./topDeals.json";
 

export const homeShowcaseSections = [
  {
    id: "top-deals",
    title: "Top Deals",
    subtitle: "Score the lowest prices on samglobal.com",
    headerbgColor: "bg-[#C9C9DB]",
    bodybgColor: "bg-[#F3F3FA]",
    gridClassName:
      "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4",
    items: topDeals,
    CardComponent: TopDealCard,
    skeletonVariant: "top-deals",
    skeletonCount: 4,
    className: "mt-8",
  },
  {
    id: "new-arrivals",
    title: "New Arrivals",
    subtitle: "Navigate trends with data-driven rankings",
    headerbgColor: "bg-[linear-gradient(270deg,_#A26D27_5.77%,_#CE9F2D_100%)]",
    bodybgColor: "bg-[#CE9F2D0D]",
    gridClassName:
      "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3",
    items: arrivals,
    CardComponent: NewArrivalCard,
    skeletonVariant: "new-arrivals",
    skeletonCount: 3,
    className: "mt-8",
  },
];

export const collageCards = [
  {
    title: "Best Sellers in Men's Fashion",
    images: [
      {
        image: collageCard.menFashion,
        link: "#",
      },
      {
        image: collageCard.stylishPair,
        link: "#",
      },
      {
        image: collageCard.blazer,
        link: "#",
      },
      {
        image: collageCard.watch,
        link: "#",
      },
    ],
  },
  {
    title: "Up to 60% Off | Home & Lifestyle",
    images: [
      {
        image: collageCard.menFashion,
        link: "#",
      },
      {
        image: collageCard.homeDecor,
        link: "#",
      },
      {
        image: collageCard.blazer,
        link: "#",
      },
      {
        image: collageCard.watch,
        link: "#",
      },
    ],
  },
  {
    title: "Trending in Women's Fashion",
    images: [
      {
        image: collageCard.homeDecor,
        link: "#",
      },
      {
        image: collageCard.stylishPair,
        link: "#",
      },
      {
        image: collageCard.blazer,
        link: "#",
      },
      {
        image: collageCard.watch,
        link: "#",
      },
    ],
  },
  {
    title: "Top Picks in Kids Fashion",
    images: [
      {
        image: collageCard.menFashion,
        link: "#",
      },
      {
        image: collageCard.stylishPair,
        link: "#",
      },
      {
        image: collageCard.homeDecor,
        link: "#",
      },
      {
        image: collageCard.watch,
        link: "#",
      },
    ],
  },
];

export const mothersDayData = [
  {
    name: "Personalized Gifts",
    image: mothersDaySwiperImages.maxi,
    link: "#",
  },
  {
    name: "Fashion Gifts",
    image: mothersDaySwiperImages.blazer,
    link: "#",
  },
  {
    name: "Beauty & Personal Care",
    image: mothersDaySwiperImages.pants,
    link: "#",
  },
  {
    name: "Personalized Gifts",
    image: mothersDaySwiperImages.maxi,
    link: "#",
  },
  {
    name: "Fashion Gifts",
    image: mothersDaySwiperImages.blazer,
    link: "#",
  },
  {
    name: "Beauty & Personal Care",
    image: mothersDaySwiperImages.pants,
    link: "#",
  },
  {
    name: "Fashion Gifts",
    image: mothersDaySwiperImages.maxi,
    link: "#",
  },
  {
    name: "Fashion Gifts",
    image: mothersDaySwiperImages.blazer,
    link: "#",
  },
  {
    name: "Beauty & Personal Care",
    image: mothersDaySwiperImages.pants,
    link: "#",
  },
];
