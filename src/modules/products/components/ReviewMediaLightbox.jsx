import { useState } from "react";
import { ChevronLeft, ChevronRight, X, ThumbsUp, ThumbsDown } from "lucide-react";
import { IoIosStar } from "react-icons/io";

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
  // Deduplicate repeated sentences or concatenated title strings
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
  onHelpful = null,
  onClose,
  onIndexChange,
}) {
  if (!images.length) return null;
  const safeIndex = Math.min(Math.max(index, 0), images.length - 1);
  const showNavigation = images.length > 1;

  // Extract review fields
  const rating = review ? Number(review.rating || 0).toFixed(1) : null;
  const rawTitle = review?.title || "";
  const rawText = review?.reviewText || review?.text || "";

  // Sanitize text & title to prevent repetitive phrases
  let cleanTitle = sanitizeTextString(rawTitle);
  let cleanText = sanitizeTextString(rawText);

  if (cleanText.toLowerCase() === cleanTitle.toLowerCase()) {
    cleanText = "";
  }

  // Reviewer Name & Date
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

  const reviewId = review?._id || review?.id;
  const helpfulVotes = review?.helpfulVotes ?? review?.helpful ?? 0;
  const alreadyVoted = (review?.helpfulVotedBy || []).includes(
    String(currentUserId || "")
  );

  const hasReviewDetails = Boolean(review);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-xs transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative flex flex-col md:flex-row w-full ${
          hasReviewDetails ? "max-w-4xl h-[85vh] max-h-[640px]" : "max-w-3xl max-h-[80vh]"
        } overflow-hidden rounded-xl bg-white shadow-2xl`}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Left Side: Warm Light Golden Media Viewer */}
        <div className="relative flex-1 md:w-[480px] lg:w-[500px] shrink-0 bg-gradient-to-b from-[#FFFDF8] via-[#FAF4E8] to-[#F7EED8] flex flex-col justify-between select-none overflow-hidden min-h-[320px] border-r border-[#EAD9B6]">
          {/* Top Control Bar (Only shown in image-only mode) */}
          {!hasReviewDetails && (
            <div className="absolute top-3 right-3 z-30 pointer-events-none">
              <button
                type="button"
                onClick={onClose}
                className="pointer-events-auto flex items-center justify-center h-8 w-8 rounded-full bg-white/90 text-[#1B1D60] hover:bg-white transition-all border border-[#EAD9B6] shadow-md focus:outline-none"
                aria-label="Close Preview"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>
          )}

          {/* Main Image Container with Fixed Frame Bounds */}
          <div className="relative flex-1 flex items-center justify-center w-full min-h-0 px-12 py-5">
            {showNavigation && safeIndex > 0 && (
              <button
                type="button"
                onClick={() => onIndexChange(safeIndex - 1)}
                className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/50 text-[#1B1D60] hover:bg-white border border-[#EAD9B6] shadow-md transition-all focus:outline-none"
                aria-label="Previous Image"
              >
                <ChevronLeft size={22} strokeWidth={2.5} />
              </button>
            )}

            {/* Fixed Aspect/Dimensions Image Viewport */}
            <div className="relative flex items-center justify-center w-full h-full max-h-[440px] max-w-[380px] sm:max-w-[400px]">
              <img
                loading="lazy"
                src={images[safeIndex]}
                alt={`Review media ${safeIndex + 1}`}
                className="max-h-full max-w-full object-contain rounded-md shadow-sm"
              />
            </div>

            {showNavigation && safeIndex < images.length - 1 && (
              <button
                type="button"
                onClick={() => onIndexChange(safeIndex + 1)}
                className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#1B1D60] hover:bg-white border border-[#EAD9B6] shadow-md transition-all focus:outline-none"
                aria-label="Next Image"
              >
                <ChevronRight size={22} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails */}
          {showNavigation && (
            <div className="flex items-center justify-center gap-2 px-4 py-3 shrink-0 overflow-x-auto border-t border-[#E8DAAF] bg-[#FAF4E8]/80">
              {images.map((img, thumbIndex) => (
                <button
                  type="button"
                  key={`${img}-${thumbIndex}`}
                  onClick={() => onIndexChange(thumbIndex)}
                  style={{ outline: "none", boxShadow: "none" }}
                  className={`h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-md cursor-pointer border-2 transition-all outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${
                    thumbIndex === safeIndex
                      ? "border-[#CE9F2D] shadow-sm opacity-100"
                      : "border-[#EAD9B6] opacity-60 hover:opacity-100 bg-white"
                  }`}
                >
                  <img
                    loading="lazy"
                    src={img}
                    alt=""
                    className="h-full w-full object-cover rounded-xs"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Myntra-Style Review Details Pane */}
        {hasReviewDetails && (
          <div className="relative w-full md:w-[360px] lg:w-[400px] shrink-0 bg-white flex flex-col justify-between p-6 overflow-y-auto">
            {/* Top Right Close Button on Details Pane */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer z-10"
              aria-label="Close Preview"
            >
              <X size={20} strokeWidth={2} />
            </button>

            <div className="flex flex-col gap-3 pr-6">
              {/* Rating + Title Row */}
              <div className="flex items-start gap-2 flex-wrap">
                {rating && (
                  <span
                    className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-bold text-white shrink-0 shadow-2xs ${
                      Number(rating) >= 4 ? "bg-[#22A447]" : "bg-[#CE9F2D]"
                    }`}
                  >
                    <IoIosStar size={11} className="fill-white" /> {rating}
                  </span>
                )}

                {cleanTitle && (
                  <h3 className="text-sm sm:text-base font-bold text-[#282c3f] leading-snug">
                    {cleanTitle}
                  </h3>
                )}
              </div>

              {/* Review Body Text */}
              {cleanText && (
                <p className="text-xs sm:text-sm text-[#4E4E4E] leading-relaxed whitespace-pre-line font-normal mt-1">
                  {cleanText}
                </p>
              )}
            </div>

            {/* Bottom Footer Metadata + Reactions */}
            <div className="pt-4 mt-6 border-t border-gray-100 flex items-center justify-between text-xs text-[#737373] font-medium">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-bold text-[#282c3f] truncate">{reviewerName}</span>
                {formattedDate && (
                  <>
                    <span>|</span>
                    <span className="shrink-0">{formattedDate}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0 text-gray-500">
                <button
                  type="button"
                  onClick={() => onHelpful && reviewId && onHelpful(reviewId)}
                  disabled={!reviewId || isOwn || !onHelpful}
                  className={`flex items-center gap-1.5 transition-colors ${
                    alreadyVoted ? "text-[#CE9F2D] font-bold" : "hover:text-gray-900"
                  }`}
                  title="Helpful"
                >
                  <ThumbsUp size={14} className={alreadyVoted ? "fill-[#CE9F2D] text-[#CE9F2D]" : ""} />
                  <span>{helpfulVotes}</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 hover:text-gray-900 transition-colors opacity-60"
                  title="Not helpful"
                >
                  <ThumbsDown size={14} />
                  <span>0</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}







