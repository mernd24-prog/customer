import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ProductCard from "../../../modules/products/components/ProductCard";

import { getProductId } from "../../../utils/ecommerce";

export default function ProductRecommendationSection({
  title,
  linkText,
  products,
  addToCart,
  toggleWishlist,
  isWishlisted,
  className = "mt-12 ",
}) {
  if (!products.length) return null;

  return (
    <section className={`relative z-10 ${className} bg-white`}>
      <div className="section-head mb-6">
        <h2 className="text-base lg:text-[28px] font-bold text-[#3E4093]">
          {title}
        </h2>

        <Link
          to="/products"
          className="group inline-flex items-center gap-1.5 text-base lg:text-xl font-medium text-gold hover:text-gold-dark transition-all duration-300 ease-in-out"
        >
          <span>{linkText.replace(" →", "").replace("→", "")}</span>
          <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4  sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-8">
        {products.slice(0, 4).map((p) => (
          <ProductCard
            key={getProductId(p)}
            product={p}
            onAddToCart={addToCart}
            onWishlist={toggleWishlist}
            isWishlisted={isWishlisted(p)}
          />
        ))}
      </div>
    </section>
  );
}
