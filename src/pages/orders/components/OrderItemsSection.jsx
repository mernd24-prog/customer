import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Camera, Package, RotateCcw } from "lucide-react";
import { IoIosStar } from "react-icons/io";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import ReviewImageUploader from "../../../components/ecommerce/ReviewImageUploader";
import ReviewMediaLightbox from "../../../components/ecommerce/ReviewMediaLightbox";
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
      className="mt-5 overflow-hidden rounded-2xl border border-[#E2E3EA] bg-white "
      aria-label="Your Product Review"
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
            {rating}.0 Out of 5
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
              <Camera size={15} /> Photos From Your Review
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
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
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
            placeholder="Summarise Your Experience"
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
            placeholder="Share Product Quality, Delivery Condition, and Fit."
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

const label = (value = "") =>
  String(value || "Not available").replace(/_/g, " ");

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const sellerGroupKey = (sellerId, organizationId = null) =>
  `${String(sellerId || "platform")}:${organizationId || "default"}`;

const getItemSellerGroupKey = (item = {}) =>
  sellerGroupKey(
    item.seller_id ||
      item.sellerId ||
      item.seller?.id ||
      item.seller?._id ||
      "platform",
    item.organization_id ||
      item.organizationId ||
      item.organization?.id ||
      item.organization?._id ||
      null,
  );

const getItemReturnPolicy = (item = {}) => {
  const snapshot = item.product_snapshot || item.productSnapshot || {};
  const policy =
    item.return_policy_snapshot ||
    item.returnPolicySnapshot ||
    snapshot.returnPolicy ||
    snapshot.return_policy ||
    snapshot.commercialPolicy?.returnPolicy ||
    {};
  return {
    returnable: item.returnable ?? policy.returnable ?? policy.eligible ?? true,
    days: Number(
      item.return_window_days ??
        policy.returnWindowDays ??
        policy.windowDays ??
        policy.days ??
        0,
    ),
    eligibleUntil:
      item.return_eligible_until ||
      item.returnEligibleUntil ||
      policy.eligibleUntil ||
      null,
  };
};

const getItemId = (item = {}) =>
  String(item.id || item._id || item.orderItemId || item.order_item_id || "");

const isDeliveredStatus = (status) =>
  DELIVERED_STATUSES.has(String(status || "").toLowerCase());

const isClosedItemStatus = (status) =>
  ["cancelled", "returned", "refunded", "replaced", "closed"].includes(
    String(status || "").toLowerCase(),
  );

function OrderItemCard({
  item,
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

  const eta = item.product_snapshot.shipping.processingDays;
  const itemColor = getOrderItemColor(item);
  const shouldShowColor =
    itemColor != null && String(itemColor).trim().toLowerCase() !== "n/a";

  return (
    <div className="w-full">
      <div className="flex w-full flex-col gap-5 sm:flex-row sm:items-start sm:gap-6 lg:gap-8">
        <div className=" aspect-square w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#CE9F2D33] bg-white p-2 w-[180px] lg:w-[210px] 2xl:w-[220px]">
          {getItemImage(item) ? (
            productPath ? (
              <Link to={productPath}>
                <img
                  src={getItemImage(item)}
                  alt={getProductTitle(item)}
                  className="h-full w-full object-contain  "
                />
              </Link>
            ) : (
              <img
                src={getItemImage(item)}
                alt={getProductTitle(item)}
                className="h-full w-full object-contain  "
              />
            )
          ) : (
            <Package size={28} />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <p className="line-clamp-2 break-words text-h4 font-bold text-[#2E2E2E]">
            {getProductTitle(item)}
          </p>

          <div className="my-3 flex flex-wrap gap-x-6 gap-y-2 text-ink sm:my-4">
            {shouldShowColor && (
              <span className="text-sm font-medium text-[#2E2E2E] sm:text-base">
                Color:{" "}
                <span className="font-semibold text-[#1B1D60]">
                  <strong className="font-bold text-[#25247B]">
                    {itemColor}
                  </strong>
                </span>
              </span>
            )}
            <span className="text-sm font-medium text-[#2E2E2E] sm:text-base">
              Quantity:{" "}
              <strong className="font-bold text-[#25247B]">
                {String(item.quantity || 1).padStart(2, "0")}
              </strong>
            </span>
          </div>

          {eta && (
            <p className="mb-3 text-[14px]  font-semibold leading-5 text-[#5F6078]">
              Estimated Delivery : {eta}
            </p>
          )}

          <div className="mt-1">
            <p className="text-xl font-extrabold leading-8 text-[#1B1D60] sm:text-2xl">
              {formatMoney(getItemLineTotal(item), currency)}
            </p>
            <p className="mt-0.5 text-sm font-medium text-[#2E2E2E] sm:text-base">
              Inclusive of All Taxes
            </p>
          </div>
        </div>
      </div>
    </div>
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

  return (
    <div className="w-full">
      {!reviewChecked ? (
        <span className="inline-flex min-h-9 items-center rounded-[8px] border border-[#D7D7E0] bg-[#F7F7FA] px-4 text-sm font-bold text-[#6B6B80]">
          Checking Review...
        </span>
      ) : existingReview ? (
        <ExistingReviewCard review={existingReview} />
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
  );
}

function OrderItemsSection({
  items = [],
  orderId,
  orderStatus,
  shipments = [],
  sellerFulfillmentGroups = [],
  returns = [],
  ...itemProps
}) {
  const dispatch = useDispatch();
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewByItem, setReviewByItem] = useState({});
  const [checkedReviewKeys, setCheckedReviewKeys] = useState({});

  const itemFulfillment = useMemo(() => {
    const result = new Map();
    const forwardShipments = shipments.filter(
      (shipment) => String(shipment.direction || "forward") !== "reverse",
    );

    items.forEach((item) => {
      const itemId = getItemId(item);
      const groupKey = getItemSellerGroupKey(item);
      const fulfillment = sellerFulfillmentGroups.find(
        (group) =>
          sellerGroupKey(
            group.sellerId || group.seller_id,
            group.organizationId || group.organization_id,
          ) === groupKey,
      );
      const shipment = forwardShipments.find((candidate) => {
        const ids =
          candidate.orderItemIds ||
          candidate.order_item_ids ||
          candidate.metadata?.orderItemIds ||
          [];
        if (ids.length) return ids.map(String).includes(itemId);
        return (
          sellerGroupKey(
            candidate.seller_id || candidate.sellerId,
            candidate.organization_id ||
              candidate.organizationId ||
              candidate.metadata?.organizationId,
          ) === groupKey
        );
      });
      const status =
        item.delivery_status ||
        item.deliveryStatus ||
        shipment?.status ||
        fulfillment?.deliveryStatus ||
        fulfillment?.shipmentStatus ||
        orderStatus ||
        null;
      result.set(itemId, {
        status,
        delivered: isDeliveredStatus(status),
        deliveredAt:
          item.delivered_at ||
          item.deliveredAt ||
          shipment?.delivered_at ||
          shipment?.deliveredAt ||
          null,
      });
    });
    return result;
  }, [items, orderStatus, sellerFulfillmentGroups, shipments]);

  const reviewableItems = useMemo(
    () =>
      orderId
        ? items.filter(
            (item) =>
              itemFulfillment.get(getItemId(item))?.delivered &&
              getReviewProductId(item),
          )
        : [],
    [itemFulfillment, items, orderId],
  );

  useEffect(() => {
    if (!orderId || !reviewableItems.length) return;

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
  }, [checkedReviewKeys, dispatch, orderId, reviewableItems]);

  const packageGroups = useMemo(() => {
    const shipmentByGroup = new Map();
    shipments
      .filter(
        (shipment) => String(shipment.direction || "forward") !== "reverse",
      )
      .forEach((shipment) => {
        const metadata = shipment.metadata || {};
        const key = sellerGroupKey(
          shipment.seller_id || shipment.sellerId,
          shipment.organization_id ||
            shipment.organizationId ||
            metadata.organizationId ||
            null,
        );
        if (!shipmentByGroup.has(key)) shipmentByGroup.set(key, []);
        shipmentByGroup.get(key).push(shipment);
      });

    const fulfillmentByGroup = new Map();
    sellerFulfillmentGroups.forEach((group) => {
      fulfillmentByGroup.set(
        sellerGroupKey(
          group.sellerId || group.seller_id,
          group.organizationId || group.organization_id,
        ),
        group,
      );
    });

    const returnByItem = new Map();
    returns.forEach((returnRequest) => {
      (returnRequest.items || []).forEach((returnItem) => {
        if (returnItem.orderItemId)
          returnByItem.set(String(returnItem.orderItemId), returnRequest);
      });
    });

    const grouped = new Map();
    items.forEach((item) => {
      const key = getItemSellerGroupKey(item);
      if (!grouped.has(key)) {
        const fulfillment = fulfillmentByGroup.get(key) || {};
        const groupShipments = shipmentByGroup.get(key) || [];
        grouped.set(key, {
          key,
          sellerName:
            fulfillment.sellerName ||
            item.sellerName ||
            item.seller?.displayName ||
            item.seller?.businessName ||
            "Marketplace seller",
          status:
            fulfillment.deliveryStatus ||
            fulfillment.shipmentStatus ||
            groupShipments[0]?.status ||
            orderStatus ||
            null,
          expectedDeliveryAt:
            fulfillment.expectedDeliveryAt ||
            groupShipments[0]?.expected_delivery_at ||
            groupShipments[0]?.expectedDeliveryAt,
          items: [],
          returnByItem,
        });
      }
      grouped.get(key).items.push(item);
    });
    return Array.from(grouped.values());
  }, [items, returns, sellerFulfillmentGroups, shipments]);

  const handleSubmitted = (review) => {
    if (!reviewTarget) return;
    const key = reviewKeyForItem(orderId, reviewTarget);
    setReviewByItem((current) => ({ ...current, [key]: review || true }));
    setCheckedReviewKeys((current) => ({ ...current, [key]: true }));
    setReviewTarget(null);
  };

  return (
    <section className="grid gap-5 h-full">
      {packageGroups.map((group) => (
        <div
          key={group.key}
          className="grid gap-5 rounded-xl border border-[#E7D9B8] bg-[#FFFDF8] p-4 h-full"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-[#1B1D60]">Order</h3>
              <p className="mt-0.5 text-sm text-[#6F7480]">
                {group.sellerName}
              </p>
            </div>
            <div className="text-right text-sm">
              {group.status && (
                <span className="rounded-full bg-[#1B1D60] px-3 py-1 text-xs font-semibold capitalize text-white">
                  {label(group.status)}
                </span>
              )}
              {group.expectedDeliveryAt && (
                <p className="mt-1 text-xs text-[#6F7480]">
                  Expected {formatDate(group.expectedDeliveryAt)}
                </p>
              )}
            </div>
          </div>
          {group.items.map((item, index) => {
            const policy = getItemReturnPolicy(item);
            const itemId = getItemId(item);
            const fulfillment = itemFulfillment.get(itemId) || {};
            const returnRequest = group.returnByItem.get(itemId);
            const returnExpired =
              Boolean(policy.eligibleUntil) &&
              new Date(policy.eligibleUntil).getTime() < Date.now();
            const canReturn =
              fulfillment.delivered &&
              policy.returnable &&
              !returnExpired &&
              !returnRequest &&
              !isClosedItemStatus(item.status || item.item_status);
            return (
              <div
                key={item.id || item._id || index}
                className="grid gap-3 border-t border-[#E7D9B8] pt-5 first:border-t-0 first:pt-0"
              >
                <OrderItemCard item={item} {...itemProps} />
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span
                    className={`rounded-full px-3 py-1 capitalize ${fulfillment.delivered ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"}`}
                  >
                    {label(fulfillment.status)}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 ${policy.returnable ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                  >
                    {policy.returnable
                      ? `Returnable${policy.days ? ` for ${policy.days} days` : ""}`
                      : "Non-returnable"}
                  </span>
                  {policy.returnable && policy.eligibleUntil && (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                      Return Until {formatDate(policy.eligibleUntil)}
                    </span>
                  )}
                  {returnRequest && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                      Return {label(returnRequest.status)}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {fulfillment.delivered &&
                    Boolean(getReviewProductId(item)) && (
                      <OrderItemReviewAction
                        item={item}
                        orderId={orderId}
                        canReview
                        existingReview={
                          reviewByItem[reviewKeyForItem(orderId, item)]
                        }
                        reviewChecked={Boolean(
                          checkedReviewKeys[reviewKeyForItem(orderId, item)],
                        )}
                        onReviewClick={setReviewTarget}
                      />
                    )}
                  {canReturn && (
                    <Link
                      to={`/returns/request/${orderId}?orderItemId=${encodeURIComponent(itemId)}`}
                      className="inline-flex min-h-9 items-center gap-2 rounded-[8px] border border-[#CE9F2D] bg-white px-4 text-sm font-bold text-[#1B1D60] transition hover:bg-[#FFF8E7]"
                    >
                      <RotateCcw size={15} /> Return or Replace
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {reviewTarget && (
        <ReviewModal
          item={reviewTarget}
          orderId={orderId}
          getProductTitle={itemProps.getProductTitle}
          onClose={() => setReviewTarget(null)}
          onSubmitted={handleSubmitted}
        />
      )}
    </section>
  );
}

export { OrderItemCard };
export default OrderItemsSection;
