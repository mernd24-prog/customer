import { useState } from "react";
import { Link } from "react-router-dom";
import { FaAngleRight } from "react-icons/fa6";
import { SkeletonLoader } from "../../components/common/skeleton";
import CategoryCard from "./CategoryCard";

const fallbackCategoryImages = [
  "/image/jpg/stylish-girls.jpg",
  "/image/png/men-fashion.png",
  "/image/jpg/kids-fashion.jpg",
  "/image/jpg/home-decor.jpg",
  "/image/jpg/smart-home.jpg",
];

const defaultHomeCategories = [
  {
    title: "Women's Fashion",
    image: "/image/jpg/stylish-girls.jpg",
    categoryKey: "womens-fashion",
  },
  {
    title: "Men's Fashion",
    image: "/image/png/men-fashion.png",
    categoryKey: "mens-fashion",
  },
  {
    title: "Kids Collection",
    image: "/image/jpg/kids-fashion.jpg",
    categoryKey: "kids-collection",
  },
  {
    title: "Home Decor",
    image: "/image/jpg/home-decor.jpg",
    categoryKey: "home-decor",
  },
  {
    title: "Home Decor",
    image: "/image/jpg/smart-home.jpg",
    categoryKey: "smart-home",
  },
];

export default function HomeCategoryGrid({
  categories = [],
  loading = false,
  title = "Shop by Category",
  subtitle = "",
  actionLabel = "View All Collections",
  actionHref = "/categories",
  badge = "Featured",
  ctaLabel = "Shop Now",
}) {
  const [activeId, setActiveId] = useState(null);
  const displayCategories = categories.length ? categories.slice(0, 5) : defaultHomeCategories;

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
        <div className="mb-5 mt-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className=" h-[49px]  text-[38px] font-bold leading-none text-[#3E4093]">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2  text-[18px] font-medium leading-5 text-[#2E2E2E]">
                {subtitle}
              </p>
            )}
          </div>
          {actionHref && actionLabel ? (
            <Link
              to={actionHref}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 self-start rounded-[6px] border border-[#33368F33] px-4  text-[12px] font-bold text-[#33368F] transition-all duration-300 ease-in-out hover:border-[#CE9F2D] hover:bg-[#CE9F2D1A]"
            >
              {actionLabel}
              <FaAngleRight className="text-[10px]" />
            </Link>
          ) : null}
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {displayCategories.map((item, idx) => (
          <CategoryCard
            key={item.id ? item.id : item.categoryKey ? item.categoryKey : `idx-${idx}`}
            image={
              item.imageUrl ||
              item.image ||
              item.thumbnailUrl ||
              item.coverImage ||
              fallbackCategoryImages[idx % fallbackCategoryImages.length]
            }
            title={item.title || item.name || "Featured Collection"}
            stylesCount={item.stylesCount || item.productCountLabel || item.countLabel || "3,200+ styles"}
            href={item.categoryKey ? `/categories/${item.categoryKey}` : item.slug ? `/categories/${item.slug}` : undefined}
            badge={item.badge || badge}
            ctaLabel={ctaLabel}
            active={activeId === item.id}
            onClick={() => setActiveId(item.id)}
          />
        ))}
      </div>
    </section>
  );
}
