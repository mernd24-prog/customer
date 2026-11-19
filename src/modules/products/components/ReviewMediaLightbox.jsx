
import { IoIosStar } from "react-icons/io";
import { X } from "lucide-react";

import { DynamicButton } from "../../../components/ui/button";
import CarouselNavigation from "../../../components/ui/carousel/CarouselNavigation";
import { GoldOutlineButton } from "../../../components/ui/button/buttonSpecialized";

function getUserDisplayName(user = {}) {
  if (typeof user === "string") return user;

  const first = user?.profile?.firstName || user?.firstName || "";
  const last = user?.profile?.lastName || user?.lastName || "";

  return (
    [first, last].filter(Boolean).join(" ").trim() ||
    user?.fullName ||
    user?.displayName ||
    user?.name ||
    user?.email ||
    ""
  );
}

function sanitizeTextString(str = "") {
  if (!str) return "";

  let clean = str.replace(/Write Review/gi, "").trim();

  // Deduplicate repeated sentences or concatenated title strings.
  if (clean.length > 30) {
    const half = Math.floor(clean.length / 2);
    const firstHalf = clean.slice(0, half).trim();
    const secondHalf = clean.slice(half).trim();

    if (secondHalf.startsWith(firstHalf.slice(0, 15))) {
      clean = firstHalf;
    }
  }

  return clean.trim();
}

export default function ReviewMediaLightbox({
  images = [],
  index = 0,
  review = null,
  currentUser = null,
  currentUserId = null,
  onClose,
  onIndexChange,
}) {
  if (!images.length) return null;

  const safeIndex = Math.min(Math.max(index, 0), images.length - 1);
  const showNavigation = images.length > 1;

  // Extract review fields.
  const rating = review ? Number(review.rating || 0).toFixed(1) : null;
  const rawTitle = review?.title || "";
  const rawText = review?.reviewText || review?.text || "";

  // Sanitize review text and title.
  const cleanTitle = sanitizeTextString(rawTitle);
  let cleanText = sanitizeTextString(rawText);

  if (cleanText.toLowerCase() === cleanTitle.toLowerCase()) {
    cleanText = "";
  }

  // Reviewer name.
  const isOwn =
    currentUserId &&
    review &&
    (String(review.buyerId) === String(currentUserId) ||
      String(review.userId) === String(currentUserId) ||
      String(review.user?._id || review.user?.id || review.user) ===
        String(currentUserId));

  let reviewerName = "";

  if (isOwn && currentUser) {
    reviewerName = getUserDisplayName(currentUser);
  } else if (review?.user && typeof review.user === "object") {
    reviewerName = getUserDisplayName(review.user);
  }

  if (!reviewerName || reviewerName === "Unknown") {
    reviewerName = review?.buyerName || review?.name || "";
  }

  if (!reviewerName || reviewerName === "Unknown") {
    reviewerName = "Customer";
  }

  const formattedDate = review?.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : review?.date || "";

  const hasReviewDetails = Boolean(review);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-xs transition-opacity sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative flex w-full flex-col overflow-hidden rounded-lg bg-white shadow-2xl md:flex-row ${
          hasReviewDetails
            ? "max-h-[640px] h-[85vh] max-w-4xl"
            : "max-h-[80vh] max-w-3xl"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Left Side: Image Preview */}
        <div className="relative flex min-h-[320px] shrink-0 flex-1 select-none flex-col justify-between overflow-hidden border-r border-[#EAD9B6] bg-gradient-to-b from-[#FFFDF8] via-[#FAF4E8] to-[#F7EED8] md:w-[480px] lg:w-[500px]">
          {!hasReviewDetails && (
            <GoldOutlineButton
              onClick={onClose}
              aria-label="Close Preview"
              className="absolute right-3 top-3 z-30 h-8 w-8 rounded-full p-0"
            >
              <X size={16} />
            </GoldOutlineButton>
          )}

          {/* Main Image */}
          <div className="relative flex min-h-0 w-full flex-1 items-center justify-center px-12 py-5">
            {showNavigation && (
              <CarouselNavigation
                alwaysVisible
                hidePrev={safeIndex <= 0}
                hideNext={safeIndex >= images.length - 1}
                onPrev={() => onIndexChange(safeIndex - 1)}
                onNext={() => onIndexChange(safeIndex + 1)}
                prevLabel="Previous Image"
                nextLabel="Next Image"
                prevClassName="!left-3 z-20"
                nextClassName="!right-3 z-20"
              />
            )}

            <div className="relative flex h-full max-h-[440px] w-full max-w-[380px] items-center justify-center sm:max-w-[400px]">
              <img
                loading="lazy"
                src={images[safeIndex]}
                alt={`Review media ${safeIndex + 1}`}
                className="max-h-full max-w-full rounded-md object-contain shadow-sm"
              />
            </div>
          </div>

          {/* Bottom Thumbnails */}
          {showNavigation && (
            <div className="flex shrink-0 items-center justify-center gap-2 overflow-x-auto border-t border-[#E8DAAF] bg-[#FAF4E8]/80 px-4 py-3">
              {images.map((img, thumbIndex) => (
                <DynamicButton
                  key={`${img}-${thumbIndex}`}
                  onClick={() => onIndexChange(thumbIndex)}
                  style={{ outline: "none", boxShadow: "none" }}
                  className={`h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-md border-2 transition-all focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 sm:h-14 sm:w-14 ${
                    thumbIndex === safeIndex
                      ? "border-[#CE9F2D] opacity-100 shadow-sm"
                      : "border-[#EAD9B6] bg-white opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    loading="lazy"
                    src={img}
                    alt=""
                    className="h-full w-full rounded-xs object-cover"
                  />
                </DynamicButton>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Review Details */}
        {hasReviewDetails && (
          <div className="relative flex w-full shrink-0 flex-col justify-between overflow-y-auto bg-white p-6 md:w-[360px] lg:w-[400px]">
           <DynamicButton
            variant="iconNeutral"
            size="icon"
            shape="circle"
              onClick={onClose}
              aria-label="Close Preview"
              className="absolute right-4 top-4 z-10 "
            >
              <X size={16} />
            </DynamicButton>

            <div className="flex flex-col gap-3 pr-6">
              {/* Rating + Title */}
              <div className="flex flex-wrap items-start gap-2">
                {rating && (
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-xs font-bold text-white shadow-2xs ${
                      Number(rating) >= 4
                        ? "bg-[#22A447]"
                        : "bg-[#CE9F2D]"
                    }`}
                  >
                    <IoIosStar size={11} className="fill-white" />
                    {rating}
                  </span>
                )}

                {cleanTitle && (
                  <h3 className="text-sm font-bold leading-snug text-[#282c3f] sm:text-base">
                    {cleanTitle}
                  </h3>
                )}
              </div>

              {/* Review Body */}
              {cleanText && (
                <p className="mt-1 whitespace-pre-line text-xs font-normal leading-relaxed text-[#4E4E4E] sm:text-sm">
                  {cleanText}
                </p>
              )}
            </div>

            {/* Reviewer Metadata */}
            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 text-xs font-medium text-[#737373]">
              <div className="flex items-center gap-1.5 truncate">
                <span className="truncate font-bold text-[#282c3f]">
                  {reviewerName}
                </span>

                {formattedDate && (
                  <>
                    <span>|</span>
                    <span className="shrink-0">{formattedDate}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
