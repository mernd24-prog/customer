import { useState } from "react";
import { SkeletonLoader } from "../../components/common/skeleton";
import CategoryCard from "./CategoryCard";
import SectionContainer from "../ui/SectionContainer";
import CUSTOMER_ROUTES from "../../constants/routes";

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
    title: "Kids' Fashion",
    image: "/image/jpg/kids-fashion.jpg",
    categoryKey: "kids-fashion",
  },
  {
    title: "Electronics",
    image: "/image/jpg/smart-home.jpg",
    categoryKey: "electronics",
  },
  {
    title: "Home & Kitchen",
    image: "/image/jpg/home-decor.jpg",
    categoryKey: "home-kitchen",
  },
  {
    title: "Beauty & Care",
    image: "/image/jpg/stylish-girls.jpg",
    categoryKey: "beauty",
  },
  {
    title: "Sports & Fitness",
    image: "/image/jpg/home-decor.jpg",
    categoryKey: "sports",
  },
  {
    title: "Furniture",
    image: "/image/jpg/home-decor.jpg",
    categoryKey: "furniture",
  },
  {
    title: "Jewellery",
    image: "/image/jpg/stylish-girls.jpg",
    categoryKey: "jewelry",
  },
  {
    title: "Books & Media",
    image: "/image/jpg/home-decor.jpg",
    categoryKey: "books",
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
  const displayCategories = categories.length
    ? categories.slice(0, 10)
    : defaultHomeCategories;

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
    <SectionContainer
      title={title}
      subtitle={subtitle}
      actionLabel={actionLabel}
      actionHref={actionHref}
    >
      <div className="grid grid-cols-1  gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {displayCategories.map((item, idx) => (
          <CategoryCard
            key={
              item.id
                ? item.id
                : item.categoryKey
                  ? item.categoryKey
                  : `idx-${idx}`
            }
            image={
              item.imageUrl ||
              item.image ||
              item.thumbnailUrl ||
              item.coverImage ||
              fallbackCategoryImages[idx % fallbackCategoryImages.length]
            }
            title={item.title || item.name || "Featured Collection"}
            stylesCount={
              item.stylesCount ||
              item.productCountLabel ||
              item.countLabel ||
              "3,200+ styles"
            }
            href={
              item.categoryKey
                ? CUSTOMER_ROUTES.category(item.categoryKey)
                : item.slug
                  ? CUSTOMER_ROUTES.category(item.slug)
                  : undefined
            }
            badge={item.badge || badge}
            ctaLabel={ctaLabel}
            active={activeId === item.id}
            onClick={() => setActiveId(item.id)}
          />
        ))}
      </div>
    </SectionContainer>
  );
}
