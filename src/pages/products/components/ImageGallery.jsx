import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Heart, Share2, ZoomIn, X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/free-mode";
import "swiper/css/zoom";

import { applyImageFallback } from "../../../utils/ecommerce";
import IconActionButton from "./IconActionButton";
import ShareProductPopover from "./socialMediaShare";

function ProductGallery({
  images,
  isModal = false,
  fallbackLabel = "Product",
}) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [mainSwiper, setMainSwiper] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLarge, setIsLarge] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1280 : false,
  );

  useEffect(() => {
    const handleResize = () => {
      const nextIsLarge = window.innerWidth >= 1280;
      setIsLarge(nextIsLarge);

      if (!nextIsLarge) {
        setIsZoomed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseMove = (e) => {
    if (!isLarge && !isModal) return;
    if (!isZoomed) return;

    const rect = e.currentTarget.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleMouseLeave = () => {
    setZoomPos({ x: 50, y: 50 });

    if (!isModal) {
      setIsZoomed(false);
    }
  };

  const handleImageClick = (e) => {
    if (!isLarge && !isModal) return;

    const rect = e.currentTarget.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });

    setIsZoomed((prev) => !prev);
  };

  return (
    <div
      className={`flex min-w-0 flex-col gap-4  overflow-hidden ${
        isModal ? "h-full w-full" : "h-auto w-full xl:h-[480px] 2xl:h-[560px]"
      }`}
    >
      <div
        className={`flex min-w-0 flex-col overflow-hidden xl:h-full ${
          images.length > 1 ? "gap-6 xl:flex-row" : ""
        }`}
      >
        {images.length > 1 && (
          <div className="order-2 h-[90px]   w-full shrink-0 overflow-hidden xl:order-1 xl:h-full xl:w-[85px]">
            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={20}
              slidesPerView="auto"
              freeMode
              watchSlidesProgress
              direction={isLarge ? "vertical" : "horizontal"}
              modules={[FreeMode, Thumbs]}
              className="h-full w-full"
            >
              {images.map((img, i) => (
                <SwiperSlide
                  key={i}
                  className="!h-[90px] !w-[90px] xl:!h-[90px]  xl:!w-[85px]"
                >
                  <button
                    type="button"
                    aria-label={`View product thumbnail ${i + 1}`}
                    onClick={() => {
                      setActiveIndex(i);
                      mainSwiper?.slideTo(i);
                    }}
                    onMouseEnter={() => {
                      if (!isLarge) return;
                      setActiveIndex(i);
                      mainSwiper?.slideTo(i);
                    }}
                    className={`h-full w-full overflow-hidden rounded-[15px] border transition-colors duration-200 ${
                      activeIndex === i
                        ? "border-gold shadow-sm bg-white"
                        : "border-border bg-white"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="h-full p-2  w-full object-contain"
                      onError={(event) =>
                        applyImageFallback(event, fallbackLabel, "product")
                      }
                    />
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        <div
          className={`relative order-1 min-w-0  overflow-hidden border border-gold rounded-[20px]  bg-transparent xl:order-2 ${
            isModal ? "h-full w-full" : "h-[324px] md:h-[440px] xl:h-full w-full"
          }`}
        >
          <Swiper
            onSwiper={setMainSwiper}
            onSlideChange={(swiper) => {
              setActiveIndex(swiper.activeIndex);
              setIsZoomed(false);
            }}
            spaceBetween={10}
            thumbs={{
              swiper:
                thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
            }}
            modules={[Thumbs, FreeMode]}
            className="h-full w-full bg-transparent"
          >
            {images.map((img, i) => (
              <SwiperSlide key={i} className="!h-full bg-transparent">
                <div
                  className={`relative   h-full w-full overflow-hidden bg-transparent ${
                    isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                  }`}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onClick={handleImageClick}
                >
                  <img
                    src={img}
                    alt=""
                    draggable={false}
                    className={`h-full w-full select-none  object-contain transition-transform duration-300 ease-out ${
                      isZoomed
                        ? isModal
                          ? "scale-[2.0]"
                          : "scale-[2.4]"
                        : "scale-95"
                    }`}
                    style={{
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      willChange: "transform",
                    }}
                    onError={(event) =>
                      applyImageFallback(event, fallbackLabel, "product")
                    }
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}

export default function ImageGallery({
  images,
  fallbackLabel,
  isWishlisted,
  onWishlist,
  onModalOpen,
  onModalClose,
  productTitle,
  shareOpen,
  onShareToggle,
  onShareClose,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const shareRef = useRef(null);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!shareOpen) return undefined;

    const handlePointerDown = (event) => {
      if (shareRef.current?.contains(event.target)) return;
      onShareClose?.();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [onShareClose, shareOpen]);

  return (
    <div className="relative w-full  min-w-0 overflow-hidden">
      <ProductGallery images={images} fallbackLabel={fallbackLabel} />

      <div className="absolute right-3  top-3 z-20 flex flex-col gap-2 sm:right-4 sm:top-4">
        <IconActionButton
          title="Zoom Image"
          onClick={() => {
            if (onModalOpen) onModalOpen();
            setIsModalOpen(true);
          }}
          className="hidden text-ink md:flex"
        >
          <ZoomIn size={18} />
        </IconActionButton>

        <IconActionButton
          title="Add to Wishlist"
          onClick={onWishlist}
          className={isWishlisted ? "text-navy" : "text-ink"}
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
        </IconActionButton>

        <div ref={shareRef} className="relative">
          <IconActionButton
            title="Share Product"
            onClick={onShareToggle}
            className="text-navy"
          >
            <Share2 size={18} />
          </IconActionButton>

          {shareOpen && <ShareProductPopover productTitle={productTitle} />}
        </div>
      </div>

      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white p-4 animate-fadeIn sm:p-6">
            <button
              type="button"
              aria-label="Close image gallery modal"
              onClick={() => {
                setIsModalOpen(false);
                if (onModalClose) onModalClose();
              }}
              className="absolute top-6 right-6 z-[10000] w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-300 ease-in-out"
            >
              <X size={28} />
            </button>

            <div className="flex h-[90vh]  w-full max-w-[1200px] items-center justify-center bg-white">
              <ProductGallery
                images={images}
                isModal={true}
                fallbackLabel={fallbackLabel}
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export { ProductGallery };
