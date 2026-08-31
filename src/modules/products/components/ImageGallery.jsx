import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Heart, Play, Share2, ZoomIn, X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

import { applyImageFallback } from "../../../utils/ecommerce";
import IconActionButton from "./IconActionButton";
import ShareProductPopover from "./socialMediaShare";

function ProductGallery({
  images,
  video,
  isModal = false,
  initialIndex = 0,
  onCollapsedThumbnailClick,
  fallbackLabel = "Product",
}) {
  const [mainSwiper, setMainSwiper] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRefs = useRef([]);
  const [isLarge, setIsLarge] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1280 : false,
  );
  const mediaItems = [
    ...images.map((src) => ({ type: "image", src })),
    ...(video ? [{ type: "video", src: video, poster: images[0] }] : []),
  ];
  const visibleThumbnailCount = 5;
  const hasHiddenThumbnails = mediaItems.length > visibleThumbnailCount;
  const hiddenThumbnailCount = Math.max(
    0,
    mediaItems.length - visibleThumbnailCount,
  );
  const shouldCollapseThumbnails = !isModal && hasHiddenThumbnails && isLarge;
  const thumbnailItems = shouldCollapseThumbnails
    ? mediaItems.slice(0, visibleThumbnailCount)
    : mediaItems;

  const handleVideoToggle = (index) => {
    const videoElement = videoRefs.current[index];
    if (!videoElement) return;

    if (videoElement.paused) {
      videoElement.play().catch(() => {});
    } else {
      videoElement.pause();
    }
  };

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

  useEffect(() => {
    if (!mainSwiper) return;

    const nextIndex = Math.max(
      0,
      Math.min(Number(initialIndex) || 0, mediaItems.length - 1),
    );

    setActiveIndex(nextIndex);
    mainSwiper.slideTo(nextIndex, 0);
  }, [initialIndex, mainSwiper, mediaItems.length]);

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
        className={`flex min-w-0 flex-col overflow-hidden w-full ${
          isModal ? "h-full" : "xl:h-full"
        } ${mediaItems.length > 1 ? "gap-6 xl:flex-row" : ""}`}
      >
        {mediaItems.length > 1 && (
          <div className="order-2 h-[84px] w-full shrink-0 overflow-hidden xl:order-1 xl:h-full xl:w-[92px]">
            <div
              className={`flex h-full w-full gap-3 overflow-x-auto overflow-y-hidden hide-scrollbar no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden xl:flex-col xl:overflow-x-hidden xl:overflow-y-auto ${
                isModal
                  ? "xl:gap-5"
                  : "xl:gap-4"
              }`}
            >
              {thumbnailItems.map((item, i) => {
                const isLastVisible =
                  shouldCollapseThumbnails && i === thumbnailItems.length - 1;
                const targetIndex = i;
                const isActive =
                  activeIndex === i || (isLastVisible && activeIndex >= i);

                return (
                  <button
                    key={`${item.type}-${item.src}-${i}`}
                    type="button"
                    onClick={() => {
                      if (isLastVisible && onCollapsedThumbnailClick) {
                        onCollapsedThumbnailClick(targetIndex);
                        return;
                      }

                      setActiveIndex(targetIndex);
                      mainSwiper?.slideTo(targetIndex);
                    }}
                    onMouseEnter={() => {
                      if (!isLarge) return;
                      if (isLastVisible && onCollapsedThumbnailClick) return;

                      setActiveIndex(targetIndex);
                      mainSwiper?.slideTo(targetIndex);
                    }}
                    className={`relative h-[80px] w-[80px] shrink-0 overflow-hidden rounded-[15px] border transition-colors duration-200 xl:w-[92px] ${
                      isModal ? "xl:h-[80px]" : "xl:h-[calc((100%_-_64px)/5)]"
                    } ${
                      isActive
                        ? "border-gold shadow-sm bg-white"
                        : "border-border bg-white"
                    }`}
                  >
                    {item.type === "video" ? (
                      <span className="relative flex h-full w-full items-center justify-center bg-black">
                        {item.poster && (
                          <img loading="lazy" width="400" height="400"
                            src={item.poster}
                            alt=""
                            className="absolute inset-0 h-full w-full object-contain p-2 opacity-70"
                            onError={(event) =>
                              applyImageFallback(
                                event,
                                fallbackLabel,
                                "product",
                              )
                            }
                          />
                        )}
                        <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#CE9F2D] text-white shadow-sm ring-2 ring-white">
                          <Play size={18} fill="currentColor" />
                        </span>
                      </span>
                    ) : (
                      <img 
                        loading={i === 0 ? "eager" : "lazy"} 
                        fetchPriority={i === 0 ? "high" : "auto"}
                        width="400" 
                        height="400"
                        src={item.src}
                        alt=""
                        className="h-full p-2 w-full object-contain"
                        onError={(event) =>
                          applyImageFallback(event, fallbackLabel, "product")
                        }
                      />
                    )}

                    {isLastVisible && (
                      <span className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 text-lg font-bold text-white">
                        +{hiddenThumbnailCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div
          className={`relative order-1 min-w-0  overflow-hidden border border-gold rounded-[20px]  bg-transparent xl:order-2 ${
            isModal
              ? "h-full w-full"
              : "h-[324px] md:h-[440px] xl:h-full w-full"
          }`}
        >
          <Swiper
            onSwiper={setMainSwiper}
            onSlideChange={(swiper) => {
              videoRefs.current.forEach((videoElement) => {
                videoElement?.pause();
              });
              setActiveIndex(swiper.activeIndex);
              setIsZoomed(false);
              setIsVideoPlaying(false);
            }}
            spaceBetween={10}
            modules={[FreeMode]}
            className="h-full w-full bg-transparent"
          >
            {mediaItems.map((item, i) => (
              <SwiperSlide key={i} className="!h-full bg-transparent">
                {item.type === "video" ? (
                  <button
                    type="button"
                    className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black"
                    onClick={() => handleVideoToggle(i)}
                    aria-label={isVideoPlaying ? "Pause video" : "Play video"}
                  >
                    <video
                      ref={(node) => {
                        videoRefs.current[i] = node;
                      }}
                      src={item.src}
                      poster={item.poster}
                      className="h-full w-full object-contain"
                      preload="metadata"
                      playsInline
                      onPlay={() => setIsVideoPlaying(true)}
                      onPause={() => setIsVideoPlaying(false)}
                      onEnded={() => setIsVideoPlaying(false)}
                    />
                    <div
                      className={`pointer-events-none absolute inset-0 items-center justify-center text-white ${
                        isVideoPlaying ? "hidden" : "flex"
                      }`}
                    >
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#CE9F2D] text-white shadow-lg ring-4 ring-white">
                        <Play size={34} fill="currentColor" />
                      </span>
                    </div>
                  </button>
                ) : (
                  <div
                    className={`relative   h-full w-full overflow-hidden bg-transparent ${
                      isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                    }`}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleImageClick}
                  >
                    <img 
                      loading={i === 0 ? "eager" : "lazy"} 
                      fetchPriority={i === 0 ? "high" : "auto"}
                      width="400" 
                      height="400"
                      src={item.src}
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
                )}
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
  video,
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
  const [modalInitialIndex, setModalInitialIndex] = useState(0);
  const shareRef = useRef(null);

  const openModal = (initialIndex = 0) => {
    setModalInitialIndex(initialIndex);
    if (onModalOpen) onModalOpen();
    setIsModalOpen(true);
  };

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
      <ProductGallery
        images={images}
        video={video}
        fallbackLabel={fallbackLabel}
        onCollapsedThumbnailClick={openModal}
      />

      <div className="absolute right-3  top-3 z-20 flex flex-col gap-2 sm:right-4 sm:top-4">
        <IconActionButton
          title="Zoom Image"
          onClick={() => openModal(activeIndex)}
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
                video={video}
                isModal={true}
                initialIndex={modalInitialIndex}
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
