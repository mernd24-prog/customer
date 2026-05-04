import { Link } from "react-router-dom";
import { Heart, Scale, ShoppingCart } from "lucide-react";
import { toggleCompare } from "../utils/recentlyViewed";

export default function ProductCard({ product, onWishlist, onAddToCart }) {
  const id = product?.id || product?._id || product?.productId;
  const image = product?.images?.[0] || product?.imageUrl;
  return (
    <article className="product-card">
      <Link to={`/products/${id}`} className="product-media" aria-label={product?.title || "Product detail"}>
        {image ? <img src={image} alt={product?.title || "Product"} /> : <span>No image</span>}
      </Link>
      <div className="product-body">
        <Link to={`/products/${id}`} className="product-title">{product?.title || product?.name || "Untitled product"}</Link>
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

export function formatMoney(value, currency = "INR") {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "Price on request";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(Number(value));
}
