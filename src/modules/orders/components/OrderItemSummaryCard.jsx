
import { useState } from "react";
import { Link } from "react-router-dom";
import { PiStarThin, PiStarFill } from "react-icons/pi";
import { Package, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";
import { orderReviewKey } from "../../../features/review/reviewSlice";
import ShowMoreText from "../../../utils/showMore";
import { getOpaqueOrderPath } from "../../../utils/routeTokens";
import { formatMoney } from "../../../utils/ecommerce";
import { getReviewProductId, getReviewOrderItemId } from "../utils/orderItems";
import {
  getOrderId,
  getOrderStatus,
  formatOrderDate,
  getOrderCurrency,
  getProductTitle,
  humanize,
  getOrderItemColor,
  getOrderItemId,
  resolveOrderItemDisplayStatus,
  getOrderCardImage,
} from "../../../utils/pages/orderUtils";

export const StarRatingUI = ({
  item,
  order,
  isUnreviewed,
  myReview,
  onReviewClick,
  hoverStar,
  setHoverStar,
}) => {
  if (isUnreviewed) {
    return (
      <div className="flex items-center justify-between gap-3 sm:justify-start sm:gap-2.5">
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHoverStar(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = star <= (hoverStar || 0);

            return (
              <button
                key={star}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onReviewClick?.(item, order, star);
                }}
                onMouseEnter={() => setHoverStar(star)}
                className="focus:outline-none"
                aria-label={`${star} star`}
              >
                {isFilled ? (
                  <PiStarFill
                    size={22}
                    className="text-[#F59E0B] sm:h-6 sm:w-6"
                  />
                ) : (
                  <PiStarThin
                    size={22}
                    className="text-[#9CA3AF] sm:h-6 sm:w-6"
                  />
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onReviewClick?.(item, order, hoverStar || 5);
          }}
          className="whitespace-nowrap border-none text-xs font-bold text-[#201B78] outline-none"
        >
          Rate & Review
        </button>
      </div>
    );
  }

  const rating = myReview?.rating || item?.review?.rating || 5;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#F0FDF4] px-2.5 py-1 sm:bg-transparent sm:px-0 sm:py-0">
      <div className="flex items-center gap-0.5 sm:gap-1">
        {[1, 2, 3, 4, 5].map((star) =>
          star <= rating ? (
            <PiStarFill
              key={star}
              size={18}
              className="text-[#16A34A] sm:h-5 sm:w-5"
            />
          ) : (
            <PiStarThin
              key={star}
              size={18}
              className="text-[#16A34A] sm:h-5 sm:w-5"
            />
          ),
        )}
      </div>

      <span className="text-[#BBF7D0] sm:hidden">|</span>
      <span className="text-[11px] font-bold text-[#1F2430] sm:hidden">
        {Number(rating).toFixed(1)}
      </span>
      <span className="text-[#BBF7D0] sm:hidden">|</span>

      <span className="rounded-md text-[10px] font-bold text-[#065F46] sm:bg-[#DCFCE7] sm:px-2 sm:py-0.5 sm:text-[11px]">
        Reviewed
      </span>
    </div>
  );
};

export default function OrderItemSummaryCard({
  order,
  item,
  onReviewClick,
  locallyReviewedProducts = new Set(),
}) {
  const [hoverStar, setHoverStar] = useState(0);

  if (!order || !item) return null;

  const productId = getReviewProductId(item);
  const reviewKey = orderReviewKey({ productId, orderId: getOrderId(order), orderItemId: getReviewOrderItemId(item) });
  const myReview = useSelector(
    (state) => state.review?.myReviewByOrderItem?.[reviewKey],
  );

  const id = getOrderId(order);
  const productTitle = getProductTitle(item);
  const createdAt = order?.created_at || order?.createdAt;
  const currency = getOrderCurrency(order);
  const itemId = getOrderItemId(item);
  const itemImage = getOrderCardImage(item);

  const shipments = Array.isArray(order?.relations?.shipments)
    ? order.relations.shipments
    : Array.isArray(order?.shipments)
      ? order.shipments
      : [];

  const itemStatus = resolveOrderItemDisplayStatus(
    item,
    getOrderStatus(order),
    shipments,
    [],
    order?.relations?.cancellations || order?.cancellations || [],
  );

  const orderedQuantity = Math.max(Number(item.quantity || 0), 0);

  const itemTotal =
    item?.line_total ??
    item?.lineTotal ??
    Number(item?.unit_price || item?.unitPrice || 0) *
      Number(item?.quantity || 0);

  const itemDetailPath = getOpaqueOrderPath(id, {
    query: itemId ? `?orderItemId=${encodeURIComponent(itemId)}` : "",
  });

  const status = String(itemStatus || "").toLowerCase();
  const orderStatus = String(getOrderStatus(order) || "").toLowerCase();
  const paymentStatus = String(
    order?.payment_status || order?.paymentStatus || "",
  ).toLowerCase();

  const isPaymentFailed =
    ["payment_failed", "failed", "pending_payment"].includes(status) ||
    ["payment_failed", "failed", "pending_payment"].includes(orderStatus) ||
    ["failed", "payment_failed"].includes(paymentStatus);

  let statusDotColor = "bg-[#FF9F00]";

  if (["delivered", "completed"].includes(status)) {
    statusDotColor = "bg-[#26A541]";
  } else if (
    isPaymentFailed ||
    [
      "cancelled",
      "failed",
      "returned",
      "refunded",
      "payment_failed",
      "cancellation_approved",
      "cancellation_rejected",
    ].includes(status)
  ) {
    statusDotColor = "bg-[#FF6161]";
  }

  const isDelivered = ["delivered", "completed", "refunded"].includes(status);

  const canReview = isDelivered && !["refunded", "returned"].includes(status);

  const isReviewForThisItem =
    !myReview?.orderItemId && !myReview?.order_item_id
      ? true
      : myReview?.orderItemId === itemId ||
        myReview?.order_item_id === itemId;

  const hasMyReview =
    (myReview &&
      (myReview._id || myReview.id || myReview.rating !== undefined) &&
      isReviewForThisItem) ||
    Boolean(item?.has_reviewed || item?.is_reviewed || item?.review);

  const isUnreviewed =
    !locallyReviewedProducts.has(productId) && !hasMyReview;

  const statusLabel = humanize(itemStatus, "Processing");
  const orderDate = formatOrderDate(createdAt);

  const statusDescription =
    status === "cancelled"
      ? "Your order was cancelled as per your request."
      : status === "delivered" || status === "completed"
        ? "Your item has been delivered."
        : status === "returned"
          ? "Your item has been returned."
          : status === "refunded"
            ? "Your refund has been processed."
            : isPaymentFailed
              ? "Your payment could not be completed."
              : status === "shipped" || status === "in_transit"
                ? "Your order is on its way."
                : "Your order is being processed.";

  return (
     <article className="group relative overflow-hidden border-b border-[#E5E1DA] bg-white lg:rounded-lg lg:border lg:border-[#E4CA8E]"> 

      <div className="lg:hidden">
        <Link
          to={itemDetailPath}
          className="flex min-h-[100px] items-center gap-3 transition-colors hover:bg-[#FCFBF8] sm:gap-4"
          aria-label={`${productTitle}, ${statusLabel} on ${orderDate}`}
        >
          <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F5F5F5] p-1.5 sm:h-[76px] sm:w-[76px]">
            {itemImage ? (
              <img
                loading="lazy"
                width="400"
                height="400"
                src={itemImage}
                alt={productTitle}
                className="h-full w-full object-contain"
              />
            ) : (
              <Package
                size={28}
                strokeWidth={1.5}
                className="text-[#9E886A]/60"
              />
            )}
          </div>

          <div className="min-w-0 flex-1 py-0.5">
            <h3 className="line-clamp-2 text-[13px] font-semibold leading-[1.4] text-[#292929] sm:text-[14px]">
              {statusLabel} on {orderDate}
            </h3>

            <p className="mt-1 line-clamp-2 text-[11px] leading-[1.5] text-[#707070] sm:text-[13px]">
              {statusDescription}
            </p>

            {/* Mobile: show quantity only, never show color */}
            <div className="mt-1.5 flex items-center gap-x-2 text-[11px] text-[#777777]">
              {orderedQuantity > 1 && (
                <span>Qty: {orderedQuantity}</span>
              )}
            </div>
          </div>

          <ChevronRight
            size={20}
            strokeWidth={2}
            className="shrink-0 text-[#202020]"
            aria-hidden="true"
          />
        </Link>

        {canReview && (
          <div
            className="mx-4 border-t border-[#EDE8DE] px-1 py-3 sm:mx-5"
            onClick={(e) => e.stopPropagation()}
          >
            <StarRatingUI
              item={item}
              order={order}
              isUnreviewed={isUnreviewed}
              myReview={myReview}
              onReviewClick={onReviewClick}
              hoverStar={hoverStar}
              setHoverStar={setHoverStar}
            />
          </div>
        )}
      </div>

      {/* Desktop layout: keep color and quantity */}
      <Link
        to={itemDetailPath}
        className="hidden grid-cols-12 items-start gap-3 p-4 transition-colors hover:bg-[#FCFBF8] lg:grid lg:gap-4"
      >
        <div className="col-span-6 flex min-w-0 items-start gap-4 lg:col-span-7">
          <div className="relative flex aspect-square w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1.5 sm:w-20">
            {itemImage ? (
              <img
                loading="lazy"
                width="400"
                height="400"
                src={itemImage}
                alt={productTitle}
                className="h-full w-full object-contain"
              />
            ) : (
              <Package size={28} className="text-[#9E886A]/50" />
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[#1F2430]">
              <ShowMoreText
                text={productTitle}
                mode="characters"
                limit={58}
                moreLabel="more"
                lessLabel="less"
                textClassName="inline"
                buttonClassName="ml-1 text-xs font-semibold text-[#201B78] hover:underline"
              />
            </h3>

            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
              {getOrderItemColor(item) !== "N/A" && (
                <span className="inline-flex items-center gap-1 rounded-md border border-[#E4DDCF]/80 bg-[#FAF6EE] px-2.5 py-0.5 text-[11px] font-medium text-[#1F2430]">
                  <span className="font-normal text-[#6F7480]">
                    Color:
                  </span>
                  {getOrderItemColor(item)}
                </span>
              )}

              <span className="inline-flex items-center gap-1 rounded-md border border-[#E4DDCF]/80 bg-[#FAF6EE] px-2.5 py-0.5 text-[11px] font-medium text-[#1F2430]">
                <span className="font-normal text-[#6F7480]">
                  Qty:
                </span>
                {orderedQuantity}
              </span>
            </div>
          </div>
        </div>

        <div className="col-span-2 flex min-w-0 flex-col items-start justify-start">
          <span className="text-base font-extrabold tracking-tight text-[#1F2430] sm:text-lg">
            {formatMoney(itemTotal, currency)}
          </span>
        </div>

        <div className="col-span-4 flex min-w-0 items-start justify-start gap-2 lg:col-span-3">
          <span
            className={`mt-[5px] h-2.5 w-2.5 shrink-0 rounded-full ${statusDotColor}`}
          />

          <div className="flex min-w-0 flex-col items-start">
            <span className="whitespace-normal text-sm font-semibold text-[#1F2430] sm:whitespace-nowrap">
              {statusLabel} on {orderDate}
            </span>

            <p className="mt-0.5 text-xs text-[#6F7480]">
              {statusDescription}
            </p>

            {canReview && (
              <div
                className="mt-2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <StarRatingUI
                  item={item}
                  order={order}
                  isUnreviewed={isUnreviewed}
                  myReview={myReview}
                  onReviewClick={onReviewClick}
                  hoverStar={hoverStar}
                  setHoverStar={setHoverStar}
                />
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

