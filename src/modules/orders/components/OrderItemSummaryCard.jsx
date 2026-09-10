import { useState } from "react";
import { Link } from "react-router-dom";
import { PiStarThin, PiStarFill } from "react-icons/pi";
import { Package } from "lucide-react";
import { useSelector } from "react-redux";
import ShowMoreText from "../../../utils/showMore";
import { getOpaqueOrderPath } from "../../../utils/routeTokens";
import { formatMoney } from "../../../utils/ecommerce";
import { getReviewProductId } from "../utils/orderItems";
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
      <div className="flex items-center justify-between sm:justify-start sm:gap-2.5">
        <div className="flex items-center gap-1" onMouseLeave={() => setHoverStar(0)}>
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = star <= (hoverStar || 0);
            return (
              <button
                key={star}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onReviewClick) onReviewClick(item, order, star);
                }}
                onMouseEnter={() => setHoverStar(star)}
                className="focus:outline-none transition-transform hover:scale-115"
                aria-label={`${star} star`}
              >
                {isFilled ? (
                  <PiStarFill size={22} className="text-[#F59E0B] sm:h-6 sm:w-6" />
                ) : (
                  <PiStarThin size={22} className="text-[#9CA3AF] sm:h-6 sm:w-6" />
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
            if (onReviewClick) onReviewClick(item, order, hoverStar || 5);
          }}
          className="text-xs font-bold text-[#201B78] hover:text-[#15115D] no-underline border-none outline-none focus:outline-none cursor-pointer whitespace-nowrap"
        >
          Rate & Review
        </button>
      </div>
    );
  }

  const rating = myReview?.rating || 5;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#F0FDF4] px-2.5 py-1 sm:bg-transparent sm:px-0 sm:py-0">
      <div className="flex items-center gap-0.5 sm:gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= rating ? (
            <PiStarFill key={star} size={18} className="text-[#16A34A] sm:h-5 sm:w-5" />
          ) : (
            <PiStarThin key={star} size={18} className="text-[#16A34A] sm:h-5 sm:w-5" />
          )
        ))}
      </div>
      <span className="text-[#BBF7D0] sm:hidden">|</span>
      <span className="text-[11px] font-bold text-[#1F2430] sm:hidden">{rating.toFixed(1)}</span>
      <span className="text-[#BBF7D0] sm:hidden">|</span>
      <span className="text-[10px] sm:text-[11px] font-bold text-[#065F46] sm:bg-[#DCFCE7] sm:px-2 sm:py-0.5 sm:rounded-md">
        Reviewed
      </span>
    </div>
  );
};

export default function OrderItemSummaryCard({ order, item, onReviewClick, locallyReviewedProducts = new Set() }) {
  if (!order || !item) return null;

  const productId = getReviewProductId(item);
  const myReview = useSelector((state) => state.review?.myReviewByProduct?.[productId]);

  const id = getOrderId(order);
  const productTitle = getProductTitle(item);
  const createdAt = order?.created_at || order?.createdAt;
  const currency = getOrderCurrency(order);
  const shipments = Array.isArray(order?.relations?.shipments)
    ? order.relations.shipments
    : Array.isArray(order?.shipments)
      ? order.shipments
      : [];
  const itemId = getOrderItemId(item);
  const itemStatus = resolveOrderItemDisplayStatus(
    item,
    getOrderStatus(order),
    shipments,
    [],
    order?.relations?.cancellations || order?.cancellations || [],
  );
  const orderedQuantity = Math.max(Number(item.quantity || 0), 0);
  const itemImage = getOrderCardImage(item);
  const itemTotal =
    item?.line_total ??
    item?.lineTotal ??
    Number(item?.unit_price || item?.unitPrice || 0) *
      Number(item?.quantity || 0);
  const itemDetailPath = getOpaqueOrderPath(id, {
    query: itemId ? `?orderItemId=${encodeURIComponent(itemId)}` : "",
  });

  const [hoverStar, setHoverStar] = useState(0);

  const handleCardClick = () => {
    // Always navigate to order detail page, even for payment_failed/pending_payment
  };

  const s = String(itemStatus).toLowerCase();
  let statusDotColor = "bg-[#ff9f00]"; // default yellow/orange

  if (["delivered", "completed"].includes(s)) {
    statusDotColor = "bg-[#26a541]"; // green
  } else if (
    [
      "cancelled",
      "failed",
      "returned",
      "refunded",
      "payment_failed",
      "cancellation_approved",
      "cancellation_rejected",
    ].includes(s)
  ) {
    statusDotColor = "bg-[#ff6161]"; // red
  } else if (["pending_payment"].includes(s)) {
    statusDotColor = "bg-[#ff9f00]"; // orange
  }

  const isDelivered = ["delivered", "completed", "refunded"].includes(s);
  // Refunded and returned items should NOT show the review option
  const canReview = isDelivered && !["refunded", "returned"].includes(s);
  const isReviewForThisItem = !myReview?.orderItemId && !myReview?.order_item_id 
    ? true 
    : (myReview?.orderItemId === itemId || myReview?.order_item_id === itemId);
  const hasMyReview = myReview && (myReview._id || myReview.id || myReview.rating !== undefined) && isReviewForThisItem;
  const isUnreviewed = 
    !locallyReviewedProducts.has(productId) &&
    !hasMyReview;

  return (
    <article className="group relative overflow-hidden rounded-xl border border-[#E4DDCF] bg-white transition-all duration-200 hover:border-[#D6A323]/40 shadow-2xs">
      <Link
        to={itemDetailPath}
        onClick={handleCardClick}
        className="hidden md:grid grid-cols-12 items-start gap-3 lg:gap-4 p-4 group/link"
      >
        <div className="col-span-6 lg:col-span-7 flex items-start gap-4 min-w-0">
          <div className="relative flex aspect-square w-16 sm:w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E4DDCF]/80 bg-[#FAF6EE]/50 p-1.5">
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

          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <h3 className="text-sm font-bold text-[#1F2430] group-hover/link:text-[#201B78] transition-colors leading-snug line-clamp-2">
              <ShowMoreText
                text={productTitle}
                mode="characters"
                limit={58}
                moreLabel="more"
                lessLabel="less"
                textClassName="inline"
                buttonClassName="ml-1 text-xs font-semibold text-[#201B78] hover:underline"
                onClick={(e) => {
                  // Prevent navigation if the user clicks "more/less"
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            </h3>

            <div className="flex flex-wrap items-center gap-1.5 text-xs mt-1">
              {getOrderItemColor(item) !== "N/A" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#FAF6EE] text-[#1F2430] border border-[#E4DDCF]/80">
                  <span className="text-[#6F7480] font-normal">Color:</span>
                  {getOrderItemColor(item)}
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#FAF6EE] text-[#1F2430] border border-[#E4DDCF]/80">
                <span className="text-[#6F7480] font-normal">Qty:</span>
                {orderedQuantity}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Section: Price (col-span-2) */}
        <div className="col-span-2 flex flex-col items-start justify-start min-w-0">
          <span className="text-base sm:text-lg font-extrabold text-[#1F2430] tracking-tight">
            {formatMoney(itemTotal, currency)}
          </span>
        </div>

        {/* Right Section: Status & Date & Actions */}
        <div className="col-span-4 lg:col-span-3 flex min-w-0 gap-2 items-start justify-start">
          <span className={`h-2.5 w-2.5 rounded-full ${statusDotColor} shrink-0 mt-[5px]`} />
          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-semibold text-[#1F2430] whitespace-normal sm:whitespace-nowrap">
              {humanize(itemStatus, "Processing")} on {formatOrderDate(createdAt)}
            </span>

            <p className="text-xs text-[#6F7480] mt-0.5">
              {s === "delivered"
                ? "Your item has been delivered"
                : s === "cancelled"
                ? "Your order was cancelled"
                : "Your order is being processed"}
            </p>

            {/* Review Section positioned under Status without creating extra space */}
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

      {/* Mobile Layout */}
      <div className="flex flex-col md:hidden">
        <Link
          to={itemDetailPath}
          onClick={handleCardClick}
          className="flex flex-col"
        >
          {/* Full Width Image */}
          <div className="relative flex w-full aspect-video sm:aspect-[2/1] items-center justify-center overflow-hidden bg-[#FAF6EE]/50 border-b border-[#E4DDCF]/80 p-4">
            {itemImage ? (
              <img
                loading="lazy"
                width="400"
                height="400"
                src={itemImage}
                alt={productTitle}
                className="h-full w-full object-contain mix-blend-multiply"
              />
            ) : (
              <Package size={40} className="text-[#9E886A]/50" />
            )}
          </div>
          
          {/* Content Area */}
          <div className="flex flex-col p-4 gap-3">
             <div className="flex justify-between items-start gap-3">
                <h3 className="text-sm font-bold text-[#1F2430] leading-snug line-clamp-2 flex-1">
                   {productTitle}
                </h3>
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-sm font-extrabold text-[#1F2430] tracking-tight">
                    {formatMoney(itemTotal, currency)}
                  </span>
                  <span className="text-[10px] font-medium text-[#6F7480] mt-1">
                     {formatOrderDate(createdAt)}
                  </span>
                </div>
             </div>

             <div className="flex items-center gap-2 mt-0.5">
               <span className={`h-2 w-2 rounded-full ${statusDotColor} shrink-0`} />
               <span className="text-xs font-semibold text-[#1F2430]">
                  {humanize(itemStatus, "Processing")}
               </span>
             </div>
             
             {canReview && (
               <div 
                 className="mt-2 w-full pt-3 border-t border-[#E4DDCF]/60"
                 onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
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
        </Link>
      </div>
    </article>
  );
}
