import ProductCard from "../../modules/products/components/ProductCard";

import {
  useCartActions,
  useWishlistActions,
} from "../../modules/products/controllers/actions";
import SectionContainer from "../ui/SectionContainer";
import { getProductId } from "../../utils/ecommerce";
import { SkeletonLoader } from "../../components/ui/skeleton";

const featuredProducts = [
  {
    id: "featured-lehenga",
    title: "Lehenga - Designer Ethnic Wear",
    image: "/image/png/bridal-fashion.png",
    price: 1999,
    mrp: 3099,
    rating: 4.1,
    discountPercent: 35,
  },
  {
    id: "featured-formal-wear",
    title: "Men's Premium Formal Wear Set",
    image: "/image/png/men-formal-look.png",
    price: 1999,
    mrp: 3099,
    rating: 4.1,
    discountPercent: 35,
  },
  {
    id: "featured-watch",
    title: "Bejewelled Luxury Watch Collection",
    image: "/image/png/luxury-watches.png",
    price: 1999,
    mrp: 3099,
    rating: 3.4,
    discountPercent: 35,
  },
  {
    id: "featured-formal-shoes",
    title: "Men's Premium Formal Shoes",
    image: "/image/png/formal-shoes.png",
    price: 1999,
    mrp: 3099,
    rating: 3.4,
    discountPercent: 35,
  },
  {
    id: "featured-earrings",
    title: "Silver Earrings",
    image: "/image/png/silver-earrings.png",
    price: 1999,
    mrp: 3099,
    rating: 3.4,
    discountPercent: 35,
  },
];

export default function FeaturedProductsSection({
  title = "Featured Products",
  actionLabel = "View Featured Products",
  actionHref = "/products",
  products = [],
  loading = false,
}) {
  const addToCart = useCartActions();
  const { isWishlisted, toggleWishlist } = useWishlistActions();
  const displayProducts = Array.isArray(products) ? products.slice(0, 5) : [];

  if (loading) {
    return (
      <SectionContainer
        title={title}
        actionLabel={actionLabel}
        actionHref={actionHref}
        actionStyle="icon"
        mobileActionStyle="button"
        className="rounded-3xl py-2 px-3 sm:px-5 my-8 md:my-12"
        style={{ backgroundImage: "linear-gradient(to bottom, #e1d5b4, #e2d1f0)" }}
        disablePadding={true}
        contentClassName="px-2 sm:px-3"
        headerClassName="px-2 sm:px-3"
      >
        <SkeletonLoader
          preset="PRODUCT_CARD"
          count={5}
          containerClass="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
          wrapperClass="min-w-0"
        />
      </SectionContainer>
    );
  }

  if (!displayProducts.length) {
    return null;
  }

  return (
    <SectionContainer
      title={title}
      actionLabel={actionLabel}
      actionHref={actionHref}
      actionStyle="icon"
      mobileActionStyle="button"
      className="rounded-3xl py-2 px-3 sm:px-5 my-8 md:my-12"
      style={{ backgroundImage: "linear-gradient(to bottom, #e1d5b4, #e2d1f0)" }}
      disablePadding={true}
      contentClassName="px-2 sm:px-3 pb-2"
      headerClassName="px-2 sm:px-3"
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {displayProducts.map((product, index) => (
          <ProductCard
            key={getProductId(product) || `featured-product-${index}`}
            product={product}
            badge="Featured"
            onAddToCart={addToCart}
            onWishlist={toggleWishlist}
            isWishlisted={isWishlisted(product)}
          />
        ))}
      </div>
    </SectionContainer>
  );
}
