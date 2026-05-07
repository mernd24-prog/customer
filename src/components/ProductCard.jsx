import { Link } from "react-router-dom";
import { Heart, Scale, ShoppingCart } from "lucide-react";
import { toggleCompare } from "../utils/recentlyViewed";
import {
  formatMoney,
  getProductId,
  getProductImage,
  getProductTitle,
} from "../utils/ecommerce";

export default function ProductCard({ product, onWishlist, onAddToCart }) {
  const id = getProductId(product);
  const image = getProductImage(product);
  const title = getProductTitle(product);

  return (
    <article className="product-card">
      <Link to={`/products/${id}`} className="product-media" aria-label={title}>
        {image ? <img src={image} alt={title} /> : <span>No image</span>}
      </Link>
      <div className="product-body">
        <Link to={`/products/${id}`} className="product-title">{title}</Link>
        <p>{product?.category || product?.brand || "Catalog item"}</p>
        <strong>{formatMoney(product?.price, product?.currency)}</strong>
      </div>
      <div className="icon-row">
        <button className="icon-button" title="Add to wishlist" onClick={() => onWishlist?.(product)}><Heart size={18} /></button>
        <button className="icon-button" title="Compare" onClick={() => toggleCompare(product)}><Scale size={18} /></button>
        <button className="icon-button primary" title="Add to cart" onClick={() => onAddToCart?.(product)}><ShoppingCart size={18} /></button>
      </div>
    </article>
  );
}
