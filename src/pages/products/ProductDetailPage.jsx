import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Minus,
  PackageCheck,
  Plus,
  RefreshCw,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  ZoomIn,
} from "lucide-react";
import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import ProductCard from "../../components/product/ProductCard";
import { fetchProductById } from "../../features/product/productSlice";
import { fetchProductWarranty } from "../../features/warranty/warrantySlice";
import { checkServiceability } from "../../features/delivery/deliverySlice";
import { fetchDynamicPrice } from "../../features/dynamicPricing/dynamicPricingSlice";
import { fetchTrendingProducts, trackRecommendationInteraction } from "../../features/recommendation/recommendationSlice";
import { trackAnalyticsEvent } from "../../features/analytics/analyticsSlice";
import { useProductActions } from "../../hooks/useProductActions";
import { addRecentlyViewed } from "../../utils/recentlyViewed";
import { formatMoney, getProductId } from "../../utils/ecommerce";

function ImageGallery({ images, title }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const src = images?.[active] || null;

  const prev = () => setActive((i) => (i > 0 ? i - 1 : images.length - 1));
  const next = () => setActive((i) => (i < images.length - 1 ? i + 1 : 0));

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative overflow-hidden rounded-2xl bg-stone-100 aspect-square">
        {src ? (
          <img
            src={src}
            alt={title}
            className="h-full w-full object-cover cursor-zoom-in transition-transform duration-300 hover:scale-105"
            onClick={() => setZoomed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-300">
            <ShoppingCart size={60} />
          </div>
        )}

        {images?.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow hover:bg-white transition"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow hover:bg-white transition"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setZoomed(true)}
          className="absolute right-3 top-3 rounded-full bg-white/80 p-1.5 shadow hover:bg-white transition"
        >
          <ZoomIn size={16} />
        </button>
      </div>

      {/* Thumbnails */}
      {images?.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition ${
                active === i ? "border-slate-950" : "border-transparent"
              }`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {zoomed && src && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoomed(false)}
        >
          <img
            src={src}
            alt={title}
            className="max-h-full max-w-full rounded-xl object-contain"
          />
        </div>
      )}
    </div>
  );
}

function StarRating({ rating, count }) {
  const stars = Math.round(rating || 0);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={14}
            className={i < stars ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"}
          />
        ))}
      </div>
      {rating != null && (
        <span className="text-sm font-semibold text-slate-700">{Number(rating).toFixed(1)}</span>
      )}
      {count != null && (
        <span className="text-xs text-slate-400">({count.toLocaleString()} reviews)</span>
      )}
    </div>
  );
}

function DeliveryChecker({ productId }) {
  const dispatch = useDispatch();
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const check = async (e) => {
    e.preventDefault();
    const pin = pincode.trim();
    if (!/^\d{6}$/.test(pin)) { setError("Enter a valid 6-digit pincode"); return; }
    setError("");
    setLoading(true);
    try {
      const action = await dispatch(checkServiceability({ pincode: pin, productId }));
      const data = action?.payload?.data || action?.payload;
      setResult(data);
    } catch {
      setError("Could not check delivery. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-stone-200 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
        <MapPin size={15} /> Check Delivery
      </div>
      <form onSubmit={check} className="flex gap-2">
        <input
          type="text"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter 6-digit pincode"
          className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-slate-950"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition"
        >
          {loading ? "…" : "Check"}
        </button>
      </form>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      {result && (
        <div className="mt-2 text-sm">
          {result.serviceable ? (
            <p className="text-emerald-600 font-medium">
              ✓ Delivery available by{" "}
              {result.estimatedDelivery || result.estimatedDate || "2-5 business days"}
            </p>
          ) : (
            <p className="text-red-500">Delivery not available to this pincode.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const productState = useSelector((s) => s.product);
  const warrantyState = useSelector((s) => s.warranty);
  const dynamicState = useSelector((s) => s.dynamicPricing);
  const relatedList = useSelector((s) => s.recommendation.list);

  const product = productState.current;
  const warranty = warrantyState.current;
  const dynamicPrice = dynamicState.current?.price;
  const relatedProducts = Array.isArray(relatedList) ? relatedList.slice(0, 4) : [];

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();

  useEffect(() => {
    dispatch(fetchProductById({ productId }));
  }, [dispatch, productId]);

  useEffect(() => {
    if (!product) return;
    addRecentlyViewed(product);
    dispatch(fetchProductWarranty({ productId })).catch(() => {});
    dispatch(fetchDynamicPrice({ productId, quantity })).catch(() => {});
    dispatch(fetchTrendingProducts({ limit: 4 })).catch(() => {});
    dispatch(trackAnalyticsEvent({ eventName: "product_view", metadata: { productId } })).catch(() => {});
    dispatch(trackRecommendationInteraction({ productId, interactionType: "viewed" })).catch(() => {});
  }, [dispatch, product, productId]);

  useEffect(() => {
    if (!product) return;
    dispatch(fetchDynamicPrice({ productId, quantity })).catch(() => {});
  }, [dispatch, productId, quantity]);

  const price = dynamicPrice ?? product?.price ?? product?.sellingPrice;
  const mrp = product?.mrp ?? product?.originalPrice;
  const discount = mrp && price && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const images = product?.images?.length ? product.images : product?.imageUrl ? [product.imageUrl] : [];
  const variants = product?.variants || [];
  const attributes = product?.attributes || product?.specifications || {};
  const inStock = product?.inStock ?? (product?.stock > 0) ?? true;

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate("/checkout");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <>
      <Seo
        title={`${product?.title || "Product"} | Sam Global`}
        description={product?.description?.slice(0, 160) || "Shop this product at Sam Global."}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-slate-400">
          <Link to="/" className="hover:text-slate-700">Home</Link>
          <span>/</span>
          {product?.category && (
            <>
              <Link to={`/categories/${product.category}`} className="hover:text-slate-700 capitalize">
                {product.category}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-slate-700 line-clamp-1">{product?.title || "Product"}</span>
        </nav>

        <ApiState
          loading={productState.loading && !product}
          error={productState.error}
          empty={!product && !productState.loading}
          emptyTitle="Product not found"
          emptyText="This product may no longer be available."
          onRetry={() => dispatch(fetchProductById({ productId }))}
        >
          {product && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Left: Gallery */}
              <div>
                <ImageGallery images={images} title={product.title} />
              </div>

              {/* Right: Details */}
              <div className="flex flex-col gap-5">
                {/* Brand & share */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {product.brand && (
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {product.brand}
                      </p>
                    )}
                    <h1 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl leading-snug">
                      {product.title}
                    </h1>
                  </div>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="shrink-0 rounded-full border border-stone-200 p-2 text-slate-500 hover:bg-stone-50 transition"
                  >
                    <Share2 size={16} />
                  </button>
                </div>

                {/* Rating */}
                {(product.rating != null || product.reviewCount != null) && (
                  <StarRating rating={product.rating} count={product.reviewCount || product.ratingCount} />
                )}

                {/* Price */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-3xl font-bold text-slate-950">
                    {formatMoney(price)}
                  </span>
                  {mrp && mrp > price && (
                    <>
                      <span className="text-lg text-slate-400 line-through">{formatMoney(mrp)}</span>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-sm font-bold text-emerald-600">
                        {discount}% off
                      </span>
                    </>
                  )}
                </div>

                {dynamicState.current?.loyalty && (
                  <p className="text-xs font-medium text-amber-600 bg-amber-50 rounded-full px-3 py-1 inline-block w-fit">
                    Loyalty price applied
                  </p>
                )}

                {/* Stock badge */}
                {!inStock && (
                  <span className="text-sm font-semibold text-red-500">Out of stock</span>
                )}

                {/* Variants */}
                {variants.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-700">Options</p>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                            selectedVariant === v
                              ? "border-slate-950 bg-slate-950 text-white"
                              : "border-stone-200 text-slate-700 hover:border-slate-400"
                          }`}
                        >
                          {v.name || v.value || JSON.stringify(v)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">Qty:</span>
                  <div className="flex items-center gap-2 rounded-lg border border-stone-200 px-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="rounded p-1.5 text-slate-600 hover:bg-stone-50 disabled:opacity-40 transition"
                      disabled={quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="min-w-[28px] text-center text-sm font-bold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="rounded p-1.5 text-slate-600 hover:bg-stone-50 transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-slate-950 py-3 text-sm font-bold text-slate-950 hover:bg-slate-50 disabled:opacity-50 transition"
                  >
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={!inStock}
                    className="flex flex-1 items-center justify-center rounded-full bg-slate-950 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition"
                  >
                    Buy Now
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className={`rounded-full border-2 p-3 transition ${
                      isWishlisted(product)
                        ? "border-red-400 bg-red-50 text-red-500"
                        : "border-stone-200 text-slate-500 hover:border-slate-400"
                    }`}
                  >
                    <Heart size={18} fill={isWishlisted(product) ? "currentColor" : "none"} />
                  </button>
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: <Truck size={18} />, label: "Free Delivery" },
                    { icon: <RefreshCw size={18} />, label: "Easy Returns" },
                    { icon: <ShieldCheck size={18} />, label: "Secure Pay" },
                  ].map((b) => (
                    <div
                      key={b.label}
                      className="flex flex-col items-center gap-1 rounded-xl border border-stone-100 bg-stone-50 py-3 text-center"
                    >
                      <span className="text-slate-500">{b.icon}</span>
                      <span className="text-xs font-medium text-slate-600">{b.label}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery check */}
                <DeliveryChecker productId={productId} />

                {/* Warranty */}
                {warranty && (
                  <div className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
                    <ShieldCheck size={20} className="mt-0.5 shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Warranty Included</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {warranty.period || warranty.duration || warranty.type || "Warranty available"}
                        {warranty.coverage && ` · ${warranty.coverage}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Product info tabs */}
          {product && (
            <div className="mt-12 space-y-8">
              {/* Description */}
              {product.description && (
                <div className="rounded-2xl border border-stone-200 p-6">
                  <h2 className="mb-3 text-lg font-bold text-slate-900">Description</h2>
                  <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Specifications */}
              {Object.keys(attributes).length > 0 && (
                <div className="rounded-2xl border border-stone-200 p-6">
                  <h2 className="mb-4 text-lg font-bold text-slate-900">Specifications</h2>
                  <dl className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                    {Object.entries(attributes).map(([key, val]) => (
                      <div key={key} className="flex gap-3 border-b border-stone-100 py-2 last:border-0">
                        <dt className="w-36 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {key}
                        </dt>
                        <dd className="text-sm text-slate-700">
                          {Array.isArray(val) ? val.join(", ") : String(val)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Seller info */}
              {product.seller && (
                <div className="rounded-2xl border border-stone-200 p-6">
                  <h2 className="mb-3 text-lg font-bold text-slate-900">Sold By</h2>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
                      {(product.seller.name || "S")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {product.seller.name || product.seller.storeName || "Seller"}
                      </p>
                      {product.seller.rating && (
                        <StarRating rating={product.seller.rating} />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Related / Trending products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-950">You May Also Like</h2>
                <Link to="/products" className="text-sm font-medium text-amber-600 hover:underline">
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {relatedProducts.map((p) => (
                  <ProductCard
                    key={getProductId(p)}
                    product={p}
                    onAddToCart={addToCart}
                    onWishlist={toggleWishlist}
                    isWishlisted={isWishlisted(p)}
                  />
                ))}
              </div>
            </div>
          )}
        </ApiState>
      </div>
    </>
  );
}
