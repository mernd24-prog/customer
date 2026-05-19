import { useState } from "react";
import { CategoryCard } from "../../components/ecommerce";
import { SkeletonLoader } from "../../components/common/skeleton";

export default function HomeCategoryGrid({
  categories = [],
  loading = false,
  title = "Shop by Category",
  subtitle = "",
}) {
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
    <div className="my-12">
      {title && (
        <div className="mb-5 mt-8">
          <h2 className="font-montserrat text-2xl font-bold text-[#2E2E2E]">{title}</h2>
          {subtitle && <p className="mt-1 font-montserrat text-sm text-[#787878]">{subtitle}</p>}
        </div>
      )}
      <div className="grid grid-cols-1 gap-[1.5rem] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {categories.map((item, idx) => (
          <CategoryCard
            key={item.id ? item.id : item.categoryKey ? item.categoryKey : `idx-${idx}`}
            image={item.imageUrl}
            title={item.title}
            href={item.categoryKey ? `/categories/${item.categoryKey}` : undefined}
            active={activeId === item.id}
            onClick={() => setActiveId(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
