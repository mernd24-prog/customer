import { ProductCard } from "../ecommerce";
import { useProductActions } from "../../hooks/useProductActions";
import SectionContainer from "../ui/SectionContainer";

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
  products = featuredProducts,
}) {
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();
  const displayProducts = Array.isArray(products) ? products.slice(0, 5) : [];

  return (
    <SectionContainer
      title={title}
      actionLabel={actionLabel}
      actionHref={actionHref}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {displayProducts.map((product) => (
          <ProductCard
            key={product.id}
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
