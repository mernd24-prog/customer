// import { useState, useRef, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Heart, Scale, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Pagination } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/pagination";
// import { toggleCompare } from "../../utils/recentlyViewed";
// import {
//   formatMoney,
//   getProductId,
//   getProductImage,
//   getProductTitle,
// } from "../../utils/ecommerce";

// export default function ProductCard({
//   product,
//   onWishlist,
//   onAddToCart,
//   isWishlisted,
//   variant = "default",
// }) {
//   const id = getProductId(product);
//   const title = getProductTitle(product);
//   const images = product?.images || [];
//   const primaryImage = getProductImage(product);
//   const categoryLabel = product?.category || "";
//   const brandLabel = product?.brand || "";
//   const price = Number(product?.price || 0);
//   const mrp = Number(product?.mrp || 0);
//   const [isHovering, setIsHovering] = useState(false);
//   const [hoveredSide, setHoveredSide] = useState(null);
//   const [canHover, setCanHover] = useState(() => {
//     if (typeof window === "undefined") return false;
//     return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
//   });
//   const swiperRef = useRef(null);

//   // Detect whether the active device supports precise hover interactions.
//   useEffect(() => {
//     const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
//     const updateHoverCapability = () => {
//       setCanHover(mediaQuery.matches);
//     };

//     updateHoverCapability();
//     mediaQuery.addEventListener("change", updateHoverCapability);

//     return () => {
//       mediaQuery.removeEventListener("change", updateHoverCapability);
//     };
//   }, []);



//   // Combine primary image with additional images, removing duplicates
//   const displayImages = primaryImage
//     ? [primaryImage, ...images.filter((img) => img !== primaryImage)]
//     : images;

//   const handleMouseMove = (e) => {
//     const rect = e.currentTarget.getBoundingClientRect();
//     const centerX = rect.width / 2;
//     const mouseX = e.clientX - rect.left;

//     if (mouseX < centerX) {
//       setHoveredSide("left");
//     } else {
//       setHoveredSide("right");
//     }
//   };

//   useEffect(() => {
//     let interval;
//     // Auto-swipe only on devices with reliable hover zones.
//     if (canHover && isHovering && hoveredSide && displayImages.length > 1) {
//       interval = window.setInterval(() => {
//         if (hoveredSide === "left" && swiperRef.current) {
//           swiperRef.current.slidePrev();
//         } else if (hoveredSide === "right" && swiperRef.current) {
//           swiperRef.current.slideNext();
//         }
//       }, 500);
//     }
//     return () => window.clearInterval(interval);
//   }, [isHovering, hoveredSide, displayImages.length, canHover]);

//   return (
//     <article className={`product-card ${variant === "compact" ? "product-card-compact" : ""} ${variant === "detailed" ? "product-card-detailed" : ""}`}>
//       <div
//         className="product-media relative group aspect-[4/5] w-full overflow-hidden"
//         onMouseEnter={() => canHover && setIsHovering(true)}
//         onMouseLeave={() => {
//           setIsHovering(false);
//           setHoveredSide(null);
//         }}
//         onMouseMove={canHover ? handleMouseMove : undefined}
//       >
//         {displayImages.length > 0 ? (
//           <>
//             {displayImages.length === 1 ? (
//               <Link
//                 to={`/products/${id}`}
//                 aria-label={title}
//                 className="w-full h-full"
//               >
//                 <img
//                   src={displayImages[0]}
//                   alt={title}
//                   className="h-full w-full object-cover"
//                   loading="lazy"
//                   decoding="async"
//                 />
//               </Link>
//             ) : (
//               <>
//                 <Swiper
//                   onSwiper={(swiper) => {
//                     swiperRef.current = swiper;
//                   }}
//                   modules={[Pagination]}
//                   pagination={{
//                     clickable: true,
//                     renderBullet: (index, className) =>
//                       `<span class="${className} product-swiper-bullet"></span>`,
//                   }}
//                   allowTouchMove={true}
//                   touchEventsTarget="container"
//                   preventClicks={true}
//                   preventClicksPropagation={true}
//                   className="product-images-swiper w-full h-full"
//                   style={{
//                     "--swiper-pagination-bottom": canHover ? "8px" : "12px",
//                     "--swiper-pagination-bullet-size": canHover ? "8px" : "10px",
//                     "--swiper-pagination-bullet-horizontal-gap": "6px",
//                     "--swiper-pagination-bullet-inactive-color": "#e7dfd1",
//                     "--swiper-pagination-bullet-inactive-opacity": "0.8",
//                     "--swiper-pagination-color": "#CE9F2D",
//                   }}
//                 >
//                   {displayImages.map((img, index) => (
//                     <SwiperSlide
//                       key={`${id}-img-${index}`}
//                     >
//                       <Link
//                         to={`/products/${id}`}
//                         aria-label={`${title} - Image ${index + 1}`}
//                         className="block h-full w-full"
//                       >
//                         <img
//                           src={img}
//                           alt={`${title} - Image ${index + 1}`}
//                           className="h-full w-full cursor-pointer object-cover"
//                           loading="lazy"
//                           decoding="async"
//                           draggable="false"
//                         />
//                       </Link>
//                     </SwiperSlide>
//                   ))}
//                 </Swiper>

//                 {/* Left hover zone with indicator - hover devices only */}
//                 {canHover && (
//                   <div
//                     className={`absolute left-0 top-0 w-1/3 h-full transition-all duration-200 flex items-center justify-center ${
//                       hoveredSide === "left" ? "bg-black/20" : "bg-black/0"
//                     }`}
//                     onMouseEnter={() => setHoveredSide("left")}
//                   >
//                     <ChevronLeft
//                       size={24}
//                       className={`text-white transition-all duration-200 ${
//                         hoveredSide === "left" ? "opacity-100" : "opacity-0"
//                       }`}
//                     />
//                   </div>
//                 )}

//                 {/* Right hover zone with indicator - hover devices only */}
//                 {canHover && (
//                   <div
//                     className={`absolute right-0 top-0 w-1/3 h-full transition-all duration-200 flex items-center justify-center ${
//                       hoveredSide === "right" ? "bg-black/20" : "bg-black/0"
//                     }`}
//                     onMouseEnter={() => setHoveredSide("right")}
//                   >
//                     <ChevronRight
//                       size={24}
//                       className={`text-white transition-all duration-200 ${
//                         hoveredSide === "right" ? "opacity-100" : "opacity-0"
//                       }`}
//                     />
//                   </div>
//                 )}
//               </>
//             )}
//           </>
//         ) : (
//           <Link to={`/products/${id}`} aria-label={title} className="w-full h-full">
//             <div className="flex h-full w-full items-center justify-center bg-stone-50 text-stone-300">
//               <ShoppingCart size={48} strokeWidth={1} />
//             </div>
//           </Link>
//         )}
//       </div>
//       <div className="product-body ">
//         {(brandLabel || categoryLabel) && (
//           <div className="flex flex-wrap gap-1.5">
//             {brandLabel && <span className="chip !min-h-0 !rounded-full !px-2 !py-0.5 !text-[10px] !font-semibold !leading-4">{brandLabel}</span>}
//             {categoryLabel && <span className="chip !min-h-0 !rounded-full !px-2 !py-0.5 !text-[10px] !font-semibold !leading-4">{categoryLabel}</span>}
//           </div>
//         )}
//         <Link to={`/products/${id}`} className="product-title ">
//           {title}
//         </Link>
//         <p className="my-2">{categoryLabel || brandLabel || "Catalog item"}</p>
//         <div className="flex items-center gap-2 py-1">
//           <strong>{formatMoney(price, product?.currency)}/-</strong>
//           {mrp > price && (
//             <span className="text-xs text-[#8a8275] line-through">{formatMoney(mrp, product?.currency)}</span>
//           )}
//         </div>
//       </div>
//       <div className="icon-row ">
//         <button
//           type="button"
//           className="icon-button "
//           title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
//           aria-label={
//             isWishlisted
//               ? `Remove ${title} from wishlist`
//               : `Add ${title} to wishlist`
//           }
//           onClick={() => onWishlist?.(product)}
//         >
//           <Heart
//             size={18}
//             fill={isWishlisted ? "red" : "none"}
//             color={isWishlisted ? "red" : "currentColor"}
//           />
//         </button>

//         {/* <button
//           type="button"
//           className="icon-button"
//           title="Compare"
//           aria-label={`Compare ${title}`}
//           onClick={() => toggleCompare(product)}
//         >
//           <Scale size={18} />
//         </button> */}
//         <button
//           type="button"
//           className="icon-button primary"
//           title="Add to cart"
//           aria-label={`Add ${title} to cart`}
//           onClick={() => onAddToCart?.(product)}
//         >
//           <ShoppingCart size={18} />
//         </button>
//       </div>
//     </article>
//   );
// }
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import {
  formatMoney,
  getProductId,
  getProductImage,
  getProductTitle,
} from "../../utils/ecommerce";
import { getRatingStars } from "../../utils/ecommerce";
import PricePill from "../ui/PricePill";

export default function ProductCard({
  product,
  variant = "grid",
}) {
  const id = getProductId(product);
  const title = getProductTitle(product);
  const image = getProductImage(product);
  const subtitle = product?.description || product?.category || product?.brand || "";
  const price = product?.salePrice || product?.price || 0;
  const oldPrice = product?.mrp || 0;
  const rating = product?.rating || 0;
  const discountPercent = product?.discountPercent || 0;
  const isInStock = product?.isInStock;
  const brand = product?.brand;

  const { stars, emptyStars } = getRatingStars(rating);
  const isListVariant = variant === "list" || variant === "compact";

  if (isListVariant) {
    return (
      <Link
        to={`/products/${id}`}
        className="block h-full rounded-xl p-4 hover:shadow-xl xl:p-6"
      >
        <article className="min-w-0 bg-white">
          <img
            src={image}
            alt={title}
            className="aspect-[302/300] w-full rounded-[8px] object-cover"
          />

          <div className="mt-3 flex items-center justify-between gap-3 border-b border-[#E9E9E9] pb-2">
            <h3
              className="min-w-0 truncate font-montserrat text-[12px] font-medium text-[#787878]"
              title={title}
            >
              {title}
            </h3>

            <p className="shrink-0 font-montserrat text-[15px] leading-none text-[#F79A3E]">
              {stars}
              <span className="text-[#F79A3E]">{emptyStars}</span>
            </p>
          </div>

          <p
            className="mt-3 line-clamp-2 min-h-[34px] font-montserrat text-[13px] leading-5 text-[#2E2E2E]"
            title={subtitle}
          >
            {subtitle}
          </p>

          <div className="mt-3 flex items-center gap-2 font-montserrat">
            <span className="text-[13px] font-semibold text-[#2E2E2E]">
              {formatMoney(price, product?.currency)}
            </span>

            {oldPrice > price && (
              <span className="text-[12px] text-[#E23B3B] line-through">
                {formatMoney(oldPrice, product?.currency)}
              </span>
            )}
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={`/products/${id}`} className="block">
      <article className="relative min-w-0 rounded-[8px] bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-xl sm:px-4 sm:pb-5 sm:pt-5">
        {discountPercent > 0 && (
          <span className="absolute left-5 top-5 z-10 rounded-full bg-[#E23B3B] px-2 py-1 font-montserrat text-[11px] font-semibold text-white">
            {discountPercent}% OFF
          </span>
        )}

        {!isInStock && (
          <span className="absolute right-5 top-5 z-10 rounded-full bg-black/70 px-2 py-1 font-montserrat text-[11px] font-semibold text-white">
            Out of stock
          </span>
        )}

        <img
          src={image}
          alt={title}
          className="mx-auto mb-2 mt-1 aspect-[1/1.15] w-full rounded-[8px] object-cover"
        />

        <div className="mt-2">
          <p className="font-montserrat text-[18px] leading-none text-[#CE9F2D]">
            {stars}
            <span className="text-[#E7DFD1]">{emptyStars}</span>
          </p>

          {brand && (
            <p className="mt-1 font-montserrat text-[11px] font-medium uppercase tracking-wide text-[#787878]">
              {brand}
            </p>
          )}

          <h3
            className="mt-1 line-clamp-1 font-montserrat text-[12px] font-semibold text-[#2E2E2E] sm:text-[14px]"
            title={title}
          >
            {title}
          </h3>

          <p
            className="mt-1 line-clamp-2 min-h-[28px] font-montserrat text-[13px] leading-4 text-[#787878]"
            title={subtitle}
          >
            {subtitle}
          </p>

          <PricePill
            price={price}
            oldPrice={oldPrice}
            className="mt-3 h-[34px] w-full max-w-[160px]"
          />
        </div>
      </article>
    </Link>
  );
}