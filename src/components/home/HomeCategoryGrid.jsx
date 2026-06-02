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
        containerClass="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5"
        wrapperClass="customer-card p-2"
      />
    );
  }

  return (
    <section className="my-8">
      {title && (
        <div className="mb-5 mt-8">
          <h2 className="customer-section-title font-montserrat text-[20px]">{title}</h2>
          {subtitle && <p className="mt-1 font-montserrat text-xs text-[var(--customer-muted)]">{subtitle}</p>}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
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
    </section>
  );
}
