import { useState } from "react";
import CategoryCard from "../ui/CategoryCard";
import { SkeletonBox } from "../common/skeleton";

export default function HomeCategoryGrid({ categories = [], loading = false }) {
    const [activeId, setActiveId] = useState(null);

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className="rounded-[20px] border border-card-border bg-white p-2"
                    >
                        <SkeletonBox className="h-[256px] w-full rounded-lg" />
                        <SkeletonBox className="mx-auto mt-3 h-[18px] w-3/4" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {categories.map((item) => (
                <CategoryCard
                    key={item.id}
                    image={item.image}
                    title={item.title}
                    active={activeId === item.id}
                    onClick={() => setActiveId(item.id)}
                />
            ))}
        </div>
    );
}
