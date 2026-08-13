import { useState } from "react";
import { BadgeCheck, Camera } from "lucide-react";
import { IoIosStar } from "react-icons/io";
import { useDispatch } from "react-redux";
import ReviewImageUploader from "../../../components/ecommerce/ReviewImageUploader";
import ReviewMediaLightbox from "../../../components/ecommerce/ReviewMediaLightbox";
import BaseModal from "../../../components/ui/overlay/BaseModal";
import {
  fetchMyProductReview,
  submitProductReview,
} from "../../../features/review/reviewSlice";
import { notify } from "../../../utils/notify";
import { getReviewProductId, getReviewOrderItemId, reviewKeyForItem } from "../hooks/useOrderItems";

function StarInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          className="transition-transform hover:scale-110"
          onClick={() => onChange(rating)}
          onMouseEnter={() => setHovered(rating)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${rating} star`}
        >
          <IoIosStar
            size={30}
            className={
              rating <= (hovered || value)
                ? "fill-[#CE9F2D] text-[#CE9F2D]"
                : "fill-[#D7D7E0] text-[#D7D7E0]"
            }
          />
        </button>
      ))}
    </div>
  );
}

function ReviewRating({ rating = 0 }) {
  const value = Math.round(Number(rating) || 0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <IoIosStar
          key={star}
          size={16}
          className={
            star <= value
              ? "fill-[#CE9F2D] text-[#CE9F2D]"
              : "fill-[#D7D7E0] text-[#D7D7E0]"
          }
        />
      ))}
    </div>
  );
}

function ExistingReviewCard({ review }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const media = Array.isArray(review?.media)
    ? review.media.filter(Boolean)
    : [];
  const status = String(review?.status || "pending").replace(/_/g, " ");
  const reviewText = review?.reviewText || review?.text || "";
  const rating = Math.round(Number(review?.rating) || 0);
  const submittedAt = review?.createdAt || review?.created_at;
  const submittedDateValue = submittedAt ? new Date(submittedAt) : null;
  const submittedDate =
    submittedDateValue && !Number.isNaN(submittedDateValue.getTime())
      ? new Intl.DateTimeFormat("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(submittedDateValue)
      : "";
  const isPublished = status.toLowerCase() === "published";

  return (
    <section
      className="mt-5 overflow-hidden rounded-2xl border border-[#E2E3EA] bg-white w-full sm:w-fit max-w-full"
      aria-label="Your product review"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ECECF1] bg-[#F5ECD5] px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#E9F7ED] text-[#21812C]">
            <BadgeCheck size={20} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-[#1B1D60] sm:text-base">
              Your product review
            </h3>
            <p className="mt-0.5 text-xs text-[#6B6B80]">
              {submittedDate
                ? `Submitted on ${submittedDate}`
                : "Thanks for sharing your experience"}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold capitalize ${isPublished ? "border-[#BFE5C6] bg-[#EFFAF1] text-[#21812C]" : "border-[#E7D39B] bg-[#FFF8E5] text-[#8B650B]"}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${isPublished ? "bg-[#2DA33A]" : "bg-[#CE9F2D]"}`}
          />
          {status}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <ReviewRating rating={rating} />
          <span className="text-sm font-bold text-[#1B1D60]">
            {rating}.0 out of 5
          </span>
        </div>

        {review?.title && (
          <h4 className="mt-4 text-base font-bold text-[#22232B] sm:text-lg">
            {review.title}
          </h4>
        )}

        {reviewText && (
          <p className="mt-2 max-full text-sm leading-6 text-[#4E505C] sm:text-[14px]">
            {reviewText}
          </p>
        )}

        {media.length > 0 && (
          <div className="mt-5">
            <p className="mb-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[.08em] text-[#6B6B80]">
              <Camera size={15} /> Photos from your review
            </p>
            <div className="flex flex-wrap gap-2.5">
              {media.slice(0, 5).map((url, index) => (
                <button
                  type="button"
                  key={`${url}-${index}`}
                  onClick={() => setLightboxIndex(index)}
                  className="group relative block size-16 overflow-hidden rounded-lg border border-[#DCDDE5] bg-[#F7F7FA] shadow-sm transition hover:border-[#CE9F2D] hover:shadow-md sm:size-20"
                  aria-label={`Preview review image ${index + 1}`}
                >
                  <img
                    src={url}
                    alt={`Review image ${index + 1}`}
                    className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <ReviewMediaLightbox
          images={media}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </section>
  );
}

function ReviewModal({ item, orderId, getProductTitle, onClose, onSubmitted }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ rating: 0, title: "", reviewText: "" });
  const [reviewImages, setReviewImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const productId = getReviewProductId(item);
  const orderItemId = getReviewOrderItemId(item);
  const isUploadingImages = reviewImages.some(
    (image) => image.status === "uploading",
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.rating) {
      notify.warning("Please select a rating.");
      return;
    }
    if (!form.title.trim()) {
      notify.warning("Please enter a review title.");
      return;
    }
    if (!form.reviewText.trim()) {
      notify.warning("Please write your review.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await dispatch(
        submitProductReview({
          productId,
          orderId,
          orderItemId,
          rating: form.rating,
          title: form.title.trim(),
          reviewText: form.reviewText.trim(),
          media: reviewImages.map((image) => image.url).filter(Boolean),
        }),
      ).unwrap();
      notify.success("Review submitted for approval.");
      onSubmitted(result?.data || true);
    } catch (error) {
      notify.error(error || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseModal onClose={onClose} maxWidth="max-w-lg">
      <form className="grid gap-5 p-5 sm:p-6" onSubmit={handleSubmit}>
        <div className="pr-8">
          <h2 className="text-xl font-bold text-[#1B1D60]">Write Review</h2>
          <p className="mt-1 line-clamp-2 text-sm text-[#5F6078]">
            {getProductTitle(item)}
          </p>
        </div>

        <div className="grid gap-2">
          <span className="text-sm font-semibold text-[#2E2E2E]">Rating</span>
          <StarInput
            value={form.rating}
            onChange={(rating) =>
              setForm((current) => ({ ...current, rating }))
            }
          />
        </div>

        <label className="grid gap-2 text-sm font-semibold text-[#2E2E2E]">
          Title
          <input
            type="text"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            maxLength={200}
            className="h-11 rounded-[8px] border border-[#CE9F2D66] px-3 text-sm font-medium outline-none focus:border-transparent"
            placeholder="Summarise your experience"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[#2E2E2E]">
          Review
          <textarea
            value={form.reviewText}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                reviewText: event.target.value,
              }))
            }
            maxLength={2000}
            rows={5}
            className="resize-none rounded-[8px] border border-[#CE9F2D66] px-3 py-2 text-sm font-medium outline-none focus:border-transparent"
            placeholder="Share product quality, delivery condition, and fit."
          />
        </label>

        <ReviewImageUploader
          value={reviewImages}
          onChange={setReviewImages}
          disabled={submitting}
        />

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            className="rounded-[8px] border border-[#D7D7E0] px-4 py-2 text-sm font-bold text-[#1B1D60]"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-[8px] bg-[#CE9F2D] px-5 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={
              submitting ||
              isUploadingImages ||
              !form.rating ||
              !form.title.trim() ||
              !form.reviewText.trim()
            }
          >
            {submitting
              ? "Submitting..."
              : isUploadingImages
                ? "Uploading..."
                : "Submit Review"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

function OrderItemReviewAction({
  item,
  orderId,
  canReview,
  existingReview,
  reviewChecked,
  onReviewClick,
}) {
  if (!canReview) return null;

  if (!reviewChecked) {
    return (
      <span className="inline-flex min-h-9 items-center rounded-[8px] border border-[#D7D7E0] bg-[#F7F7FA] px-4 text-sm font-bold text-[#6B6B80]">
        Checking review...
      </span>
    );
  }

  if (existingReview) {
    return (
      <div className="w-full">
        <ExistingReviewCard review={existingReview} />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="inline-flex min-h-9 items-center rounded-[8px] border border-[#CE9F2D] bg-[#CE9F2D12] px-4 text-sm font-bold text-[#1B1D60] transition hover:bg-[#CE9F2D22]"
      onClick={() => onReviewClick(item)}
      disabled={!orderId}
    >
      Write Review
    </button>
  );
}


export { OrderItemReviewAction, ReviewModal, ExistingReviewCard, StarInput, ReviewRating };
