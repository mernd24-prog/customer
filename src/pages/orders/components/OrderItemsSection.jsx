import { useEffect, useRef, useMemo, useState } from "react";
import { Package } from "lucide-react";
import { IoIosStar } from "react-icons/io";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import BaseModal from "../../../components/common/overlay/BaseModal";
import OrderDetailSectionCard from "./OrderDetailSectionCard";
import {
  fetchMyProductReview,
  submitProductReview,
} from "../../../features/review/reviewSlice";
import { notify } from "../../../utils/notify";

const DELIVERED_STATUSES = new Set(["delivered", "fulfilled", "completed"]);

const reviewKeyForItem = (orderId, item) =>
  [
    orderId,
    item?.id || item?._id || item?.orderItemId || item?.order_item_id || "",
    item?.product_id ||
      item?.productId ||
      item?.product?.id ||
      item?.product?._id ||
      "",
  ].join(":");

const getReviewProductId = (item) => {
  const productId = item?.product_id || item?.productId;
  if (productId && typeof productId === "object")
    return productId.id || productId._id;
  return productId || item?.product?.id || item?.product?._id || "";
};

const getReviewOrderItemId = (item) =>
  item?.id || item?._id || item?.orderItemId || item?.order_item_id || "";

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

function ReviewModal({ item, orderId, getProductTitle, onClose, onSubmitted }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ rating: 0, title: "", reviewText: "" });
  const [submitting, setSubmitting] = useState(false);
  const productId = getReviewProductId(item);
  const orderItemId = getReviewOrderItemId(item);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.rating) {
      notify.warning("Please select a rating.");
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
            disabled={submitting || !form.rating}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

const getOrderItemProductId = (item) => {
  const product =
    item?.productId && typeof item.productId === "object"
      ? item.productId
      : item?.product;

  return (
    product?._id ||
    product?.id ||
    (typeof product?.productId === "string" ? product.productId : "") ||
    (typeof item?.productId === "string" ? item.productId : "") ||
    item?.product_id ||
    item?.productId?._id ||
    item?.productId?.id ||
    ""
  );
};

const getOrderItemProductPath = (item) => {
  const productId = getOrderItemProductId(item);
  return productId ? `/products/${productId}` : "";
};

function OrderItemCard({
  item,
  orderId,
  canReview,
  existingReview,
  reviewChecked,
  onReviewClick,
  currency,
  getItemImage,
  getProductTitle,
  getItemProductPath,
  getItemLineTotal,
  getOrderItemColor,
  formatMoney,
}) {
  const productPath =
    getItemProductPath?.(item) || getOrderItemProductPath(item);

  return (
    <div className="flex w-full flex-col gap-4  sm:flex-row sm:gap-5 lg:gap-[36px]">
      <div className="flex aspect-[252/210] w-full shrink-0 items-center justify-center overflow-hidden rounded-[10px] border  border-[#CE9F2D33] bg-white sm:w-[180px] lg:w-[220px] 2xl:w-[252px]">
        {getItemImage(item) ? (
          productPath ? (
            <Link to={productPath}>
              <img
                src={getItemImage(item)}
                alt={getProductTitle(item)}
                className="h-full  w-full object-contain"
              />
            </Link>
          ) : (
            <img
              src={getItemImage(item)}
              alt={getProductTitle(item)}
              className="h-full  w-full object-contain"
            />
          )
        ) : (
          <Package size={28} />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col  justify-center ">
        <p className="line-clamp-2 break-words text-[18px] font-semibold leading-[26px] text-[#2E2E2E] sm:text-[22px] sm:leading-[32px] lg:text-[26px] md:leading-[38px]">
          {getProductTitle(item)}
        </p>

        <div className="my-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink xl:my-4">
          <span className="text-[18px] font-medium leading-[100%] text-[#2E2E2E]">
            Color:{" "}
            <span className="font-semibold text-[#1B1D60]">
              <strong className="font-bold text-[#25247B]">
                {getOrderItemColor(item)}
              </strong>
            </span>
          </span>
          <span className="text-[18px] font-medium leading-[100%] text-[#2E2E2E]">
            Quantity:{" "}
            <strong className="font-bold text-[#25247B]">
              {String(item.quantity || 1).padStart(2, "0")}
            </strong>
          </span>
        </div>

        <div className="mt-2 gap-[5px] sm:mt-4 lg:mt-0">
          <p className="text-[20px] font-extrabold leading-[28px] text-[#1B1D60] sm:text-[26px] sm:leading-[38px] md:text-[24px] md:leading-[46px] ">
            {formatMoney(getItemLineTotal(item), currency)}
          </p>
          <p className="text-[14px] font-medium leading-[100%] text-[#2E2E2E] sm:text-[16px] md:text-[18px]">
            Inclusive of all taxes
          </p>
        </div>

        {canReview && (
          <div className="mt-5">
            {!reviewChecked ? (
              <span className="inline-flex min-h-9 items-center rounded-[8px] border border-[#D7D7E0] bg-[#F7F7FA] px-4 text-sm font-bold text-[#6B6B80]">
                Checking review...
              </span>
            ) : existingReview ? (
              <span className="inline-flex min-h-9 items-center rounded-[8px] border border-[#37B44633] bg-[#37B44612] px-4 text-sm font-bold text-[#21812C]">
                Review submitted
              </span>
            ) : (
              <button
                type="button"
                className="inline-flex min-h-9 items-center rounded-[8px] border border-[#CE9F2D] bg-[#CE9F2D12] px-4 text-sm font-bold text-[#1B1D60] transition hover:bg-[#CE9F2D22]"
                onClick={() => onReviewClick(item)}
                disabled={!orderId}
              >
                Write Review
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderItemsSection({ items = [], orderId, orderStatus, ...itemProps }) {
  const dispatch = useDispatch();
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewByItem, setReviewByItem] = useState({});
  const [checkedReviewKeys, setCheckedReviewKeys] = useState({});
  const canReviewOrder = DELIVERED_STATUSES.has(
    String(orderStatus || "").toLowerCase(),
  );

  const reviewableItems = useMemo(
    () =>
      canReviewOrder && orderId
        ? items.filter((item) => getReviewProductId(item))
        : [],
    [canReviewOrder, items, orderId],
  );

  useEffect(() => {
    if (!orderId || !canReviewOrder || !reviewableItems.length) return;

    reviewableItems.forEach((item) => {
      const key = reviewKeyForItem(orderId, item);
      if (checkedReviewKeys[key]) return;

      dispatch(
        fetchMyProductReview({
          productId: getReviewProductId(item),
          orderId,
          orderItemId: getReviewOrderItemId(item),
        }),
      )
        .unwrap()
        .then((response) => {
          setReviewByItem((current) => ({
            ...current,
            [key]: response?.data || null,
          }));
        })
        .catch(() => {
          setReviewByItem((current) => ({ ...current, [key]: null }));
        })
        .finally(() => {
          setCheckedReviewKeys((current) => ({ ...current, [key]: true }));
        });
    });
  }, [canReviewOrder, checkedReviewKeys, dispatch, orderId, reviewableItems]);

  const handleSubmitted = (review) => {
    if (!reviewTarget) return;
    const key = reviewKeyForItem(orderId, reviewTarget);
    setReviewByItem((current) => ({ ...current, [key]: review || true }));
    setCheckedReviewKeys((current) => ({ ...current, [key]: true }));
    setReviewTarget(null);
  };

  return (
    <>
      <OrderDetailSectionCard
        title="Item"
        borderClassName="border-[#CE9F2D66]  h-fit "
        bodyClassName="grid gap-8 sm:gap-14 p-4 sm:p-5 lg:p-6"
      >
        {items.map((item, index) => (
          <OrderItemCard
            key={item.id || item._id || index}
            item={item}
            orderId={orderId}
            canReview={canReviewOrder && Boolean(getReviewProductId(item))}
            existingReview={reviewByItem[reviewKeyForItem(orderId, item)]}
            reviewChecked={Boolean(
              checkedReviewKeys[reviewKeyForItem(orderId, item)],
            )}
            onReviewClick={setReviewTarget}
            {...itemProps}
          />
        ))}
      </OrderDetailSectionCard>

      {reviewTarget && (
        <ReviewModal
          item={reviewTarget}
          orderId={orderId}
          getProductTitle={itemProps.getProductTitle}
          onClose={() => setReviewTarget(null)}
          onSubmitted={handleSubmitted}
        />
      )}
    </>
  );
}

export { OrderItemCard };
export default OrderItemsSection;
