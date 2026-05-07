import { useState } from "react";
import CategoryCard from "../ui/CategoryCard";
import { SkeletonLoader } from "../common/skeleton";

export default function HomeCategoryGrid({ categories = [], loading = false }) {
    const [activeId, setActiveId] = useState(null);

    if (loading) {
        return (
            <SkeletonLoader
                preset="CATEGORY_CARD"
                count={5}
                containerClass="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
                wrapperClass="rounded-[20px] border border-card-border bg-white p-2"
            />
        );
    }

    return (
        <div className="mt-5 ">
            <h1 className="text-2xl font-bold text-[#2E2E2E] font-montserrat mb-5 mt-5">Time for a spring refresh</h1>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">  {categories.map((item) => (
                <CategoryCard
                    key={item.id}
                    image={item.image}
                    title={item.title}
                    active={activeId === item.id}
                    onClick={() => setActiveId(item.id)}
                />
            ))}</div>
        </div>
    );
}
