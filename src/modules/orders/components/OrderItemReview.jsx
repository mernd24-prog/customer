import { useRef, useState } from "react";
import { BadgeCheck, Camera } from "lucide-react";
import { useDispatch } from "react-redux";

import ReviewImageUploader from "../../products/components/ReviewImageUploader";
import ReviewMediaLightbox from "../../products/components/ReviewMediaLightbox";
import ConfirmModal from "../../../components/ui/overlay/ConfirmModal";
import ShowMoreText from "../../../utils/showMore";
import StarRating, {
  RatingStars,
} from "../../../components/ui/display/StarRating";

import { submitProductReview } from "../../../features/review/reviewSlice";
import { notify } from "../../../utils/notify";
import { getReviewProductId, getReviewOrderItemId } from "../utils/orderItems";

function StarInput({ value, onChange }) {
  const [hoverStar, setHoverStar] = useState(0);

  return (
    <div onMouseLeave={() => setHoverStar(0)}>
      <RatingStars
        rating={value}
        hoverStar={hoverStar}
        interactive
        size={25}
        filledClassName="text-[#F59E0B]"
        emptyClassName="text-[#D7D7E0]"
        onSelect={onChange}
        onHover={setHoverStar}
        ariaLabelPrefix="Rate"
      />
    </div>
  );
}

function ReviewRating({ rating = 0 }) {
  return (
    <RatingStars
      rating={rating}
      size={16}
      filledClassName="text-[#F59E0B]"
      emptyClassName="text-[#D7D7E0]"
    />
  );
}

function ExistingReviewCard({ review }) {
  const reviewObj = typeof review === "object" && review !== null ? review : {};

  const [lightboxIndex, setLightboxIndex] = useState(null);

  const media = Array.isArray(reviewObj?.media)
    ? reviewObj.media.filter(Boolean)
    : [];

  const status = String(reviewObj?.status || "pending").replace(/_/g, " ");
  const reviewText = reviewObj?.reviewText || reviewObj?.text || "";
  const rating = Math.round(Number(reviewObj?.rating) || 0);

  const submittedAt = reviewObj?.createdAt || reviewObj?.created_at;
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
      className="mt-3 flex w-full flex-col gap-3 border-t border-[#E7D9B8] pt-3"
      aria-label="Product review"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-lg bg-[#E9F7ED] text-[#21812C]">
            <BadgeCheck size={20} />
          </span>

          <div>
            <h3 className="text-sm font-bold text-[#1B1D60]">Product review</h3>

            <p className="text-xs text-[#6B6B80]">
              {submittedDate
                ? `Submitted on ${submittedDate}`
                : "Thanks for sharing your experience"}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${
            isPublished
              ? "border-[#BFE5C6] bg-[#EFFAF1] text-[#21812C]"
              : "border-[#E7D39B] bg-[#FFF8E5] text-[#8B650B]"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
              isPublished ? "bg-[#2DA33A]" : "bg-[#CE9F2D]"
            }`}
          />
          {status}
        </span>
      </div>

      <div className="flex w-full flex-col gap-3.5">
        {rating > 0 && (
          <div className="flex items-center gap-2.5">
            <StarRating rating={rating} showValue={true} showCountText={true} />
          </div>
        )}

        <ShowMoreText
          text={reviewObj.title}
          mode="characters"
          line={1}
          moreLabel="more"
          lessLabel="less"
          textClassName="inline break-words text-sm font-semibold text-[#22232B] sm:text-base"
          buttonClassName="ml-1 text-xs font-semibold text-[#1B1D60]"
        />

        <ShowMoreText
          text={reviewText}
          mode="characters"
          line={1}
          moreLabel="more"
          lessLabel="less"
          textClassName="inline max-w-full break-words text-sm leading-relaxed text-[#4E505C]"
          buttonClassName="ml-1 text-xs font-semibold text-[#1B1D60]"
        />

        {media.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#6B6B80]">
              <Camera size={16} />
              Photos from your review ({media.length})
            </p>

            <div className="flex flex-wrap gap-2">
              {media.slice(0, 5).map((url, index) => (
                <button
                  type="button"
                  key={`${url}-${index}`}
                  onClick={() => setLightboxIndex(index)}
                  className="group relative block size-14 overflow-hidden rounded-lg border border-[#E2E3EA] bg-[#F7F7FA] shadow-sm transition hover:border-[#CE9F2D] sm:size-16"
                  aria-label={`Preview review image ${index + 1}`}
                >
                  <img
                    loading="lazy"
                    width="400"
                    height="400"
                    src={url}
                    alt={`Review image ${index + 1}`}
                    className="size-full object-cover transition duration-300"
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
          review={reviewObj}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </section>
  );
}

function ReviewModal({
  item,
  orderId,
  initialRating = 0,
  getProductTitle,
  onClose,
  onSubmitted,
}) {
  const dispatch = useDispatch();
  const formRef = useRef(null);

  const [form, setForm] = useState({
    rating: initialRating || 0,
    title: "",
    reviewText: "",
  });

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
      const errorMessage =
        typeof error === "string" ? error : error?.message || "";

      if (
        errorMessage.toLowerCase().includes("already exists") ||
        errorMessage.includes("DUPLICATE_ENTRY")
      ) {
        notify.info("You have already reviewed this product.");

        onSubmitted?.({
          alreadyReviewed: true,
          productId,
          orderItemId,
        });
      } else {
        notify.error(error || "Failed to submit review.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ConfirmModal
      open={true}
      title="Write Review"
      description={getProductTitle(item)}
      confirmLabel={
        submitting
          ? "Submitting..."
          : isUploadingImages
            ? "Uploading..."
            : "Submit Review"
      }
      cancelLabel="Cancel"
      onConfirm={() => formRef.current?.requestSubmit()}
      onCancel={onClose}
      confirmDisabled={
        submitting ||
        isUploadingImages ||
        !form.rating ||
        !form.title.trim() ||
        !form.reviewText.trim()
      }
      variant="navy"
      maxWidth="max-w-lg"
      confirmClassName="!bg-[#CE9F2D] hover:!bg-[#B88D26]"
    >
      <form ref={formRef} className="grid gap-3" onSubmit={handleSubmit}>
        <div className="grid gap-1">
          <span className="text-[13px] font-semibold leading-5 text-[#2E2E2E]">Rating</span>

          <StarInput
            value={form.rating}
            onChange={(rating) =>
              setForm((current) => ({ ...current, rating }))
            }
          />
        </div>

        <label className="grid gap-1 text-[13px] font-semibold leading-5 text-[#2E2E2E]">
          Title
          <input
            type="text"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            maxLength={200}
            className="h-9 rounded-lg border border-[#CE9F2D66] px-3 text-[13px] font-medium outline-none focus:border-[#CE9F2D]"
            placeholder="Summarise your experience"
          />
        </label>

        <label className="grid gap-1 text-[13px] font-semibold leading-5 text-[#2E2E2E]">
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
            rows={3}
            className="min-h-[84px] resize-none rounded-lg border border-[#CE9F2D66] px-3 py-2 text-[13px] font-medium outline-none focus:border-[#CE9F2D]"
            placeholder="Share product quality, delivery condition, and fit."
          />
        </label>

        <ReviewImageUploader
          value={reviewImages}
          onChange={setReviewImages}
          disabled={submitting}
        />
      </form>
    </ConfirmModal>
  );
}

function OrderItemReviewAction({
  item,
  orderId,
  canReview,
  reviewChecked,
  onReviewClick,
}) {
  if (!canReview) return null;

  if (!reviewChecked) {
    return (
      <span className="inline-flex min-h-9 max-w-full shrink-0 items-center justify-center gap-1.5 rounded-md border border-[#CE9F2D] bg-[#FFF9EA] px-3 py-2 text-xs font-semibold leading-none text-[#1B1D60] transition-colors hover:bg-[#F8EDCF] sm:text-sm">
        Checking review...
      </span>
    );
  }

  return (
    <button
      type="button"
      className="inline-flex min-h-9 max-w-full shrink-0 items-center justify-center gap-1.5 rounded-md border border-[#CE9F2D] bg-[#FFF9EA] px-3 py-2 text-xs font-semibold leading-none text-[#1B1D60] transition-colors hover:bg-[#F8EDCF] sm:text-sm"
      onClick={() => onReviewClick(item)}
      disabled={!orderId}
    >
      Write Review
    </button>
  );
}

export {
  OrderItemReviewAction,
  ReviewModal,
  ExistingReviewCard,
  StarInput,
  ReviewRating,
};