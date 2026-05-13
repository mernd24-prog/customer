import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Scale, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { toggleCompare } from "../../utils/recentlyViewed";
import {
  formatMoney,
  getProductId,
  getProductImage,
  getProductTitle,
} from "../../utils/ecommerce";

export default function ProductCard({
  product,
  onWishlist,
  onAddToCart,
  isWishlisted,
}) {
  const id = getProductId(product);
  const title = getProductTitle(product);
  const images = product?.images || [];
  const primaryImage = getProductImage(product);
  const [isHovering, setIsHovering] = useState(false);
  const [hoveredSide, setHoveredSide] = useState(null);
  const [canHover, setCanHover] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  });
  const swiperRef = useRef(null);

  // Detect whether the active device supports precise hover interactions.
  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateHoverCapability = () => {
      setCanHover(mediaQuery.matches);
    };

    updateHoverCapability();
    mediaQuery.addEventListener("change", updateHoverCapability);

    return () => {
      mediaQuery.removeEventListener("change", updateHoverCapability);
    };
  }, []);



  // Combine primary image with additional images, removing duplicates
  const displayImages = primaryImage
    ? [primaryImage, ...images.filter((img) => img !== primaryImage)]
    : images;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const mouseX = e.clientX - rect.left;

    if (mouseX < centerX) {
      setHoveredSide("left");
    } else {
      setHoveredSide("right");
    }
  };

  useEffect(() => {
    let interval;
    // Auto-swipe only on devices with reliable hover zones.
    if (canHover && isHovering && hoveredSide && displayImages.length > 1) {
      interval = window.setInterval(() => {
        if (hoveredSide === "left" && swiperRef.current) {
          swiperRef.current.slidePrev();
        } else if (hoveredSide === "right" && swiperRef.current) {
          swiperRef.current.slideNext();
        }
      }, 500);
    }
    return () => window.clearInterval(interval);
  }, [isHovering, hoveredSide, displayImages.length, canHover]);

  return (
    <article className="product-card ">
      <div
        className="product-media relative group"
        onMouseEnter={() => canHover && setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setHoveredSide(null);
        }}
        onMouseMove={canHover ? handleMouseMove : undefined}
      >
        {displayImages.length > 0 ? (
          <>
            {displayImages.length === 1 ? (
              <Link
                to={`/products/${id}`}
                aria-label={title}
                className="w-full h-full"
              >
                <img
                  src={displayImages[0]}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </Link>
            ) : (
              <>
                <Swiper
                  onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                  }}
                  modules={[Pagination]}
                  pagination={{
                    clickable: true,
                    renderBullet: (index, className) =>
                      `<span class="${className} product-swiper-bullet"></span>`,
                  }}
                  allowTouchMove={true}
                  touchEventsTarget="container"
                  preventClicks={true}
                  preventClicksPropagation={true}
                  className="product-images-swiper w-full h-full"
                  style={{
                    "--swiper-pagination-bottom": canHover ? "8px" : "12px",
                    "--swiper-pagination-bullet-size": canHover ? "8px" : "10px",
                    "--swiper-pagination-bullet-horizontal-gap": "6px",
                    "--swiper-pagination-bullet-inactive-color": "#e7dfd1",
                    "--swiper-pagination-bullet-inactive-opacity": "0.8",
                    "--swiper-pagination-color": "#CE9F2D",
                  }}
                >
                  {displayImages.map((img, index) => (
                    <SwiperSlide
                      key={`${id}-img-${index}`}
                    >
                      <Link
                        to={`/products/${id}`}
                        aria-label={`${title} - Image ${index + 1}`}
                        className="block h-full w-full"
                      >
                        <img
                          src={img}
                          alt={`${title} - Image ${index + 1}`}
                          className="w-full h-full object-cover cursor-pointer"
                          draggable="false"
                        />
                      </Link>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Left hover zone with indicator - hover devices only */}
                {canHover && (
                  <div
                    className={`absolute left-0 top-0 w-1/3 h-full transition-all duration-200 flex items-center justify-center ${
                      hoveredSide === "left" ? "bg-black/20" : "bg-black/0"
                    }`}
                    onMouseEnter={() => setHoveredSide("left")}
                  >
                    <ChevronLeft
                      size={24}
                      className={`text-white transition-all duration-200 ${
                        hoveredSide === "left" ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </div>
                )}

                {/* Right hover zone with indicator - hover devices only */}
                {canHover && (
                  <div
                    className={`absolute right-0 top-0 w-1/3 h-full transition-all duration-200 flex items-center justify-center ${
                      hoveredSide === "right" ? "bg-black/20" : "bg-black/0"
                    }`}
                    onMouseEnter={() => setHoveredSide("right")}
                  >
                    <ChevronRight
                      size={24}
                      className={`text-white transition-all duration-200 ${
                        hoveredSide === "right" ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <Link to={`/products/${id}`} aria-label={title} className="w-full h-full">
            <div className="flex h-full w-full items-center justify-center bg-stone-50 text-stone-300">
              <ShoppingCart size={48} strokeWidth={1} />
            </div>
          </Link>
        )}
      </div>
      <div className="product-body ">
        <Link to={`/products/${id}`} className="product-title">
          {title}
        </Link>
        <p>{product?.category || product?.brand || "Catalog item"}</p>
        <strong>{formatMoney(product?.price, product?.currency)}</strong>
      </div>
      <div className="icon-row ">
        <button
          type="button"
          className="icon-button"
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-label={
            isWishlisted
              ? `Remove ${title} from wishlist`
              : `Add ${title} to wishlist`
          }
          onClick={() => onWishlist?.(product)}
        >
          <Heart
            size={18}
            fill={isWishlisted ? "red" : "none"}
            color={isWishlisted ? "red" : "currentColor"}
          />
        </button>

        <button
          type="button"
          className="icon-button"
          title="Compare"
          aria-label={`Compare ${title}`}
          onClick={() => toggleCompare(product)}
        >
          <Scale size={18} />
        </button>
        <button
          type="button"
          className="icon-button primary"
          title="Add to cart"
          aria-label={`Add ${title} to cart`}
          onClick={() => onAddToCart?.(product)}
        >
          <ShoppingCart size={18} />
        </button>
      </div>
    </article>
  );
}
