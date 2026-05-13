import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  RefreshCw,
  Share2,
  ShieldCheck,
  Star,
  Truck,
  ZoomIn,
} from "lucide-react";
import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import PageHeader from "../../components/common/PageHeader";
import ProductCard from "../../components/product/ProductCard";
import BrandButton from "../../components/ui/BrandButton";
import PricePill from "../../components/ui/PricePill";
import { fetchProductById } from "../../features/product/productSlice";
import { fetchProductWarranty } from "../../features/warranty/warrantySlice";
import { checkServiceability } from "../../features/delivery/deliverySlice";
import { fetchDynamicPrice } from "../../features/dynamicPricing/dynamicPricingSlice";
import { fetchTrendingProducts, trackRecommendationInteraction } from "../../features/recommendation/recommendationSlice";
import { trackAnalyticsEvent } from "../../features/analytics/analyticsSlice";
import { useProductActions } from "../../hooks/useProductActions";
import { addRecentlyViewed } from "../../utils/recentlyViewed";
import { formatMoney, getProductId, getProductImage, getProductTitle } from "../../utils/ecommerce";

function StarRating({ rating, count }) {
  const stars = Math.round(rating || 0);
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} size={15} className={i < stars ? "fill-[#CE9F2D] text-[#CE9F2D]" : "fill-[#E0E0E0] text-[#E0E0E0]"} />
        ))}
      </div>
      {rating != null && <span className="font-montserrat text-sm font-semibold text-[#2E2E2E]">{Number(rating).toFixed(1)}</span>}
      {count != null && <span className="font-montserrat text-xs text-[#A6A6A6]">({count.toLocaleString()} reviews)</span>}
    </div>
  );
}

function ImageGallery({ images, title }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const src = images?.[active] || null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-[12px] bg-[#FAF6EE] border border-[#e7dfd1]">
        {src ? (
          <img
            src={src}
            alt={title}
            className="h-full w-full object-cover cursor-zoom-in transition-transform duration-300 hover:scale-105"
            onClick={() => setZoomed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#A6A6A6] font-montserrat text-sm">
            No image available
          </div>
        )}
        {images?.length > 1 && (
          <>
            <button type="button" onClick={() => setActive((i) => (i > 0 ? i - 1 : images.length - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white transition">
              <ChevronLeft size={16} />
            </button>
            <button type="button" onClick={() => setActive((i) => (i < images.length - 1 ? i + 1 : 0))} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white transition">
              <ChevronRight size={16} />
            </button>
          </>
        )}
        <button type="button" onClick={() => setZoomed(true)} className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 shadow hover:bg-white transition">
          <ZoomIn size={15} />
        </button>
      </div>

      {images?.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button key={i} type="button" onClick={() => setActive(i)}
              className={`shrink-0 h-[72px] w-[72px] overflow-hidden rounded-[8px] border-2 transition ${active === i ? "border-[#CE9F2D]" : "border-[#e7dfd1]"}`}>
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {zoomed && src && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setZoomed(false)}>
          <img src={src} alt={title} className="max-h-full max-w-full rounded-[12px] object-contain" />
        </div>
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
      setResult(action?.payload?.data || action?.payload);
    } catch { setError("Could not check delivery. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="panel">
      <div className="mb-3 flex items-center gap-2">
        <MapPin size={16} className="text-[#CE9F2D]" />
        <span className="font-montserrat text-sm font-semibold text-[#2E2E2E]">Check Delivery</span>
      </div>
      <form onSubmit={check} className="flex gap-2">
        <input
          type="text"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter 6-digit pincode"
          className="flex-1 rounded-[6px] border border-[#cfc6b8] px-3 py-2 text-sm"
        />
        <button type="submit" disabled={loading} className="button px-4 py-2 text-sm">
          {loading ? "…" : "Check"}
        </button>
      </form>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      {result && (
        <p className={`mt-2 font-montserrat text-sm font-medium ${result.serviceable ? "success" : "text-red-600"}`}>
          {result.serviceable
            ? `✓ Delivery by ${result.estimatedDelivery || result.estimatedDate || "2–5 business days"}`
            : "Delivery not available to this pincode."}
        </p>
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

  return (
    <>
      <Seo
        title={`${getProductTitle(product) || "Product"} | Sam Global`}
        description={product?.description?.slice(0, 160) || "Shop this product at Sam Global."}
      />

      <div className="w-container py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="mb-4 flex flex-wrap items-center gap-1 font-montserrat text-xs text-[#A6A6A6]">
          <Link to="/" className="hover:text-[#2E2E2E] transition">Home</Link>
          <span>/</span>
          {product?.category && (
            <>
              <Link to={`/categories/${product.category}`} className="capitalize hover:text-[#2E2E2E] transition">
                {product.category}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-[#2E2E2E] line-clamp-1">{getProductTitle(product) || "Product"}</span>
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
            <>
              {/* ── Main detail layout ── */}
              <div className="detail">
                {/* Left: gallery */}
                <ImageGallery images={images} title={getProductTitle(product)} />

                {/* Right: panel */}
                <div className="flex flex-col gap-4">
                  {/* Brand + share */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {product.brand && (
                        <p className="font-montserrat text-xs font-semibold uppercase tracking-wider text-[#A26D27]">
                          {product.brand}
                        </p>
                      )}
                      <h1 className="mt-1 font-montserrat text-[22px] font-bold leading-snug text-[#2E2E2E] sm:text-[26px]">
                        {getProductTitle(product)}
                      </h1>
                    </div>
                    <button type="button" onClick={() => navigator.clipboard?.writeText(window.location.href)}
                      className="icon-button shrink-0" title="Share">
                      <Share2 size={16} />
                    </button>
                  </div>

                  {/* Rating */}
                  {(product.rating != null || product.reviewCount != null) && (
                    <StarRating rating={product.rating} count={product.reviewCount || product.ratingCount} />
                  )}

                  {/* Price */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-montserrat text-[32px] font-bold leading-none text-[#2E2E2E] sm:text-[36px]">
                      {formatMoney(price)}
                    </span>
                    {mrp && mrp > price && (
                      <span className="font-montserrat text-lg text-[#A6A6A6] line-through">
                        {formatMoney(mrp)}
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="rounded-full bg-[#F5ECDD] px-2.5 py-0.5 font-montserrat text-sm font-bold text-[#A26D27]">
                        {discount}% off
                      </span>
                    )}
                  </div>

                  {dynamicState.current?.loyalty && (
                    <p className="inline-block w-fit rounded-full bg-[#F5ECDD] px-3 py-1 font-montserrat text-xs font-semibold text-[#A26D27]">
                      ✦ Loyalty price applied
                    </p>
                  )}

                  {!inStock && (
                    <p className="font-montserrat text-sm font-semibold text-red-500">Out of stock</p>
                  )}

                  {/* Variants */}
                  {variants.length > 0 && (
                    <div>
                      <p className="mb-2 font-montserrat text-sm font-semibold text-[#2E2E2E]">Options</p>
                      <div className="flex flex-wrap gap-2">
                        {variants.map((v, i) => (
                          <button key={i} type="button" onClick={() => setSelectedVariant(v)}
                            className={`rounded-[6px] border px-3 py-1.5 font-montserrat text-sm font-medium transition ${
                              selectedVariant === v ? "border-[#CE9F2D] bg-[#CE9F2D] text-white" : "border-[#cfc6b8] text-[#2E2E2E] hover:border-[#CE9F2D]"
                            }`}>
                            {v.name || v.value || JSON.stringify(v)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="flex items-center gap-3">
                    <span className="font-montserrat text-sm font-semibold text-[#2E2E2E]">Qty:</span>
                    <div className="flex items-center overflow-hidden rounded-[6px] border border-[#cfc6b8] bg-white">
                      <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}
                        className="flex h-9 w-9 items-center justify-center text-[#2c2c2c] transition hover:bg-[#FAF6EE] disabled:opacity-40 text-lg font-semibold">
                        −
                      </button>
                      <span className="flex min-w-[44px] items-center justify-center font-montserrat text-sm font-bold text-[#2c2c2c]">
                        {quantity}
                      </span>
                      <button type="button" onClick={() => setQuantity((q) => q + 1)}
                        className="flex h-9 w-9 items-center justify-center text-[#2c2c2c] transition hover:bg-[#FAF6EE] text-lg font-semibold">
                        +
                      </button>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="button-row flex gap-3">
                    <BrandButton
                      variant="gradient"
                      rounded
                      label="Buy Now"
                      disabled={!inStock}
                      className="flex-1 h-[50px] text-base font-bold"
                      onClick={() => { addToCart(product, quantity); navigate("/checkout"); }}
                    />
                    <BrandButton
                      variant="secondary"
                      rounded
                      label="Add to Cart"
                      disabled={!inStock}
                      className="flex-1 h-[50px] text-base"
                      onClick={() => addToCart(product, quantity)}
                    />
                    <button type="button" onClick={() => toggleWishlist(product)}
                      className={`icon-button h-[50px] w-[50px] rounded-full transition ${isWishlisted(product) ? "!bg-red-50 !border-red-300 !text-red-500" : ""}`}>
                      <Heart size={18} fill={isWishlisted(product) ? "currentColor" : "none"} />
                    </button>
                  </div>

                  {/* Trust badges */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: <Truck size={18} className="text-[#CE9F2D]" />, label: "Free Delivery" },
                      { icon: <RefreshCw size={18} className="text-[#CE9F2D]" />, label: "Easy Returns" },
                      { icon: <ShieldCheck size={18} className="text-[#CE9F2D]" />, label: "Secure Pay" },
                    ].map((b) => (
                      <div key={b.label} className="card flex flex-col items-center gap-1 py-3 text-center">
                        {b.icon}
                        <span className="font-montserrat text-xs font-medium text-[#787878]">{b.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery check */}
                  <DeliveryChecker productId={productId} />

                  {/* Warranty */}
                  {warranty && (
                    <div className="panel flex items-start gap-3">
                      <ShieldCheck size={20} className="mt-0.5 shrink-0 text-green" />
                      <div>
                        <p className="font-montserrat text-sm font-semibold text-[#2E2E2E]">Warranty Included</p>
                        <p className="mt-0.5 font-montserrat text-xs text-[#787878]">
                          {warranty.period || warranty.duration || warranty.type || "Warranty available"}
                          {warranty.coverage && ` · ${warranty.coverage}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Info tabs below ── */}
              <div className="mt-10 grid gap-6">
                {product.description && (
                  <div className="panel">
                    <h2 className="mb-3 font-montserrat text-[18px] font-bold text-[#2E2E2E]">Description</h2>
                    <p className="font-montserrat text-sm leading-7 text-[#787878] whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                )}

                {Object.keys(attributes).length > 0 && (
                  <div className="panel">
                    <h2 className="mb-4 font-montserrat text-[18px] font-bold text-[#2E2E2E]">Specifications</h2>
                    <div className="grid grid-cols-1 gap-y-0 sm:grid-cols-2">
                      {Object.entries(attributes).map(([key, val]) => (
                        <div key={key} className="flex gap-4 border-b border-[#e7dfd1] py-2.5 last:border-0">
                          <dt className="w-36 shrink-0 font-montserrat text-xs font-semibold uppercase tracking-wide text-[#A6A6A6]">
                            {key}
                          </dt>
                          <dd className="font-montserrat text-sm text-[#2E2E2E]">
                            {Array.isArray(val) ? val.join(", ") : String(val)}
                          </dd>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {product.seller && (
                  <div className="panel">
                    <h2 className="mb-3 font-montserrat text-[18px] font-bold text-[#2E2E2E]">Sold By</h2>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5ECDD] font-montserrat font-bold text-[#A26D27]">
                        {(product.seller.name || "S")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-montserrat text-sm font-semibold text-[#2E2E2E]">
                          {product.seller.name || product.seller.storeName || "Seller"}
                        </p>
                        {product.seller.rating && <StarRating rating={product.seller.rating} />}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Related products ── */}
              {relatedProducts.length > 0 && (
                <section className="mt-12">
                  <div className="section-head mb-6">
                    <h2 className="font-montserrat text-[22px] font-bold text-[#2E2E2E]">You May Also Like</h2>
                    <Link to="/products" className="font-montserrat text-sm font-medium text-[#CE9F2D] hover:text-[#a76616] transition">
                      View all →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {relatedProducts.map((p) => (
                      <ProductCard key={getProductId(p)} product={p} onAddToCart={addToCart} onWishlist={toggleWishlist} isWishlisted={isWishlisted(p)} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </ApiState>
      </div>
    </>
  );
}
