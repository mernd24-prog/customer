import NewArrivalCard from "../components/ui/NewArrivalCard";
import TopDealCard from "../components/ui/TopDealCard";
import {
  collageCard,
  mothersDaySwiperImages,
} from "../constant/image.constant";

export const homeShowcaseSections = [
  {
    id: "top-deals",
    cmsKey: "home-top-deals",
    title: "Top Deals",
    subtitle: "Score the lowest prices on samglobal.com",
    headerbgColor: "bg-[#C9C9DB]",
    bodybgColor: "bg-[#F3F3FA]",
    gridClassName:
      "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4",
    items: [],
    CardComponent: TopDealCard,
    skeletonVariant: "top-deals",
    skeletonCount: 4,
    className: "mt-8",
  },
  {
    id: "new-arrivals",
    cmsKey: "home-new-arrivals",
    title: "New Arrivals",
    subtitle: "Navigate trends with data-driven rankings",
    headerbgColor: "bg-[#ECDFCB]",
    bodybgColor: "bg-[#CE9F2D0D]",
    gridClassName:
      "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3",
    items: [],
    CardComponent: NewArrivalCard,
    skeletonVariant: "new-arrivals",
    skeletonCount: 3,
    className: "mt-8",
  },
];

export const collageCards = [
  {
    cmsKey: "home-collage-men-fashion",
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
    cmsKey: "home-collage-home-lifestyle",
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
    cmsKey: "home-collage-womens-fashion",
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
    cmsKey: "home-collage-kids-fashion",
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
    cmsKey: "home-seasonal-personalized-gifts",
    name: "Personalized Gifts",
    image: mothersDaySwiperImages.maxi,
    link: "#",
  },
  {
    cmsKey: "home-seasonal-fashion-gifts",
    name: "Fashion Gifts",
    image: mothersDaySwiperImages.blazer,
    link: "#",
  },
  {
    cmsKey: "home-seasonal-beauty-care",
    name: "Beauty & Personal Care",
    image: mothersDaySwiperImages.pants,
    link: "#",
  },
  {
    cmsKey: "home-seasonal-personalized-gifts-repeat-1",
    name: "Personalized Gifts",
    image: mothersDaySwiperImages.maxi,
    link: "#",
  },
  {
    cmsKey: "home-seasonal-fashion-gifts-repeat-1",
    name: "Fashion Gifts",
    image: mothersDaySwiperImages.blazer,
    link: "#",
  },
  {
    cmsKey: "home-seasonal-beauty-care-repeat-1",
    name: "Beauty & Personal Care",
    image: mothersDaySwiperImages.pants,
    link: "#",
  },
  {
    cmsKey: "home-seasonal-fashion-gifts-repeat-2",
    name: "Fashion Gifts",
    image: mothersDaySwiperImages.maxi,
    link: "#",
  },
  {
    cmsKey: "home-seasonal-fashion-gifts-repeat-3",
    name: "Fashion Gifts",
    image: mothersDaySwiperImages.blazer,
    link: "#",
  },
  {
    cmsKey: "home-seasonal-beauty-care-repeat-2",
    name: "Beauty & Personal Care",
    image: mothersDaySwiperImages.pants,
    link: "#",
  },
];
