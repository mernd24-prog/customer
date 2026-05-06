import NewArrivalCard from "../components/ui/NewArrivalCard";
import TopDealCard from "../components/ui/TopDealCard";
import arrivals from "./arrivals.json";
import topDeals from "./topDeals.json";

export const homeShowcaseSections = [
    {
        id: "top-deals",
        title: "Top Deals",
        subtitle: "Score the lowest prices on samglobal.com",
        headerbgColor: "bg-[#C9C9DB]",
        bodybgColor: "bg-[#F3F3FA]",
        gridClassName: "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4",
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
        gridClassName: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3",
        items: arrivals,
        CardComponent: NewArrivalCard,
        skeletonVariant: "new-arrivals",
        skeletonCount: 3,
        className: "mt-8",
    },
];
