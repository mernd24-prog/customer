import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { MdDateRange } from "react-icons/md";
import { FaShoppingCart } from "react-icons/fa";
import { BsCreditCardFill } from "react-icons/bs";
import { PiStarThin, PiStarFill } from "react-icons/pi";
import ShowMoreText from "../../../utils/showMore";
import { Search, Truck, X, Package } from "lucide-react";
import CustomDropdown from "../../../components/ui/CustomDropdown";
import Pagination from "../../products/components/Pagination";

import ApiState from "../../../components/ui/ApiState";
import Seo from "../../../components/ui/Seo";

import Breadcrumbs from "../../common/components/Breadcrumbs";
// Note: Sidebar removed — rendering main content full width
// sidebar removed

import { getOpaqueOrderPath } from "../../../utils/routeTokens";

import NeedHelpPanel from "../../support/components/NeedHelpPanel";

import { useOrderList } from "../controllers/useOrderList";
import { ReviewModal } from "../components/OrderItemReview";
import { getReviewProductId } from "../utils/orderItems";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrders } from "../slices/orderSlice";
import { fetchMyProductReview } from "../../../features/review/reviewSlice";
import { RefreshCw } from "lucide-react";
import Button from "../../../components/ui/buttons/Button";

import { formatMoney } from "../../../utils/ecommerce";
import {
  COMPACT_STATUS_BADGE,
  items,
  ORDER_BREADCRUMBS,
} from "../../../data/orderPage";
import { ORDER_LIST_SKELETON } from "../../../components/ui/skeleton/layouts";

import {
  getOrderId,
  getOrderStatus,
  formatOrderDate,
  getOrderCurrency,
  getProductTitle,
  getPaymentMethod,
  humanize,
  getOrderItemColor,
  getOrderItemId,
  findShipmentForOrderItem,
  isDeliveredOrderItem,
  resolveOrderItemDisplayStatus,
  getOrderCardImage,
} from "../../../utils/pages/orderUtils";

function OrderItemSummaryCard({ order, item, onReviewClick, locallyReviewedProducts = new Set() }) {
  if (!order || !item) return null;

  const dispatch = useDispatch();
  const productId = getReviewProductId(item);
  const myReview = useSelector((state) => state.review?.myReviewByProduct?.[productId]);
  const [hasCheckedReview, setHasCheckedReview] = useState(false);

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
  const isUnreviewed = 
    !item.has_reviewed && 
    !item.is_reviewed && 
    !locallyReviewedProducts.has(productId) &&
    !myReview;

  // Eager fetch to know if user already reviewed it in a past order
  useEffect(() => {
    if (canReview && isUnreviewed && !hasCheckedReview && productId) {
      dispatch(fetchMyProductReview({ productId })).finally(() => {
        setHasCheckedReview(true);
      });
    }
  }, [canReview, isUnreviewed, hasCheckedReview, productId, dispatch]);

  return (
    <article className="group relative overflow-hidden rounded-xl border border-[#E4DDCF] bg-white transition-all duration-200 hover:border-[#D6A323]/40 shadow-2xs">
            <div className="hidden sm:grid grid-cols-12 items-start gap-4 p-4">
        <Link
          to={itemDetailPath}
          onClick={handleCardClick}
          className="col-span-7 flex items-start gap-4 min-w-0 group/link"
        >
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
        </Link>

        {/* Middle Section: Price (col-span-2) */}
        <div className="col-span-2 flex flex-col items-start justify-start min-w-0">
          <span className="text-base sm:text-lg font-extrabold text-[#1F2430] tracking-tight">
            {formatMoney(itemTotal, currency)}
          </span>
        </div>

        {/* Right Section: Status & Date & Actions (col-span-3) */}
        <div className="col-span-3 flex min-w-0 gap-2 items-start justify-start">
          <span className={`h-2.5 w-2.5 rounded-full ${statusDotColor} shrink-0 mt-[5px]`} />
          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-semibold text-[#1F2430] whitespace-nowrap">
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
                {isUnreviewed ? (
                  <div className="flex justify-center items-center gap-2.5">
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
                              if (onReviewClick) onReviewClick(item, order, star);
                            }}
                            onMouseEnter={() => setHoverStar(star)}
                            className="focus:outline-none transition-transform hover:scale-115"
                            aria-label={`${star} star`}
                          >
                            {isFilled ? (
                              <PiStarFill size={24} className="text-[#F59E0B]" />
                            ) : (
                              <PiStarThin size={24} className="text-[#9CA3AF]" />
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
                      className="text-xs font-semibold text-[#201B78] hover:text-[#15115D] no-underline border-none outline-none focus:outline-none whitespace-nowrap cursor-pointer"
                    >
                      Rate & Review Product
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <PiStarFill key={star} size={20} className="text-[#16A34A]" />
                      ))}
                    </div>
                    <span className="inline-flex items-center rounded-md bg-[#DCFCE7] px-2 py-0.5 text-[11px] font-bold text-[#15803D]">
                      Reviewed
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex sm:hidden p-3.5 gap-3 items-center">
        <Link
          to={itemDetailPath}
          onClick={handleCardClick}
          className="flex flex-1 items-center gap-3 min-w-0"
        >
          <div className="relative flex aspect-square w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E4DDCF]/80 bg-[#FAF6EE]/50 p-1.5">
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
             <h3 className="text-sm font-bold text-[#1F2430] leading-snug line-clamp-1">
                {productTitle}
             </h3>
             <span className="text-xs font-semibold text-[#1F2430] mt-0.5">
                {humanize(itemStatus, "Processing")}
             </span>
             {canReview && (
               <div 
                 className="mt-1 w-fit"
                 onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
               >
                 {isUnreviewed ? (
                   <div className="flex items-center gap-2 mt-1">
                     <div 
                       className="flex items-center gap-0.5"
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
                               if (onReviewClick) onReviewClick(item, order, star);
                             }}
                             onMouseEnter={() => setHoverStar(star)}
                             className="focus:outline-none"
                             aria-label={`${star} star`}
                           >
                              {isFilled ? (
                                <PiStarFill size={19} className="text-[#F59E0B]" />
                              ) : (
                                <PiStarThin size={19} className="text-[#9CA3AF]" />
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
                        className="text-[11px] font-semibold text-[#201B78] hover:text-[#15115D] no-underline border-none outline-none focus:outline-none cursor-pointer"
                      >
                        Rate & Review
                      </button>
                   </div>
                 ) : (
                   <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#F0FDF4] px-2.5 py-1">
                     <div className="flex items-center gap-0.5">
                       {[1, 2, 3, 4, 5].map((star) => (
                         <PiStarFill key={star} size={18} className="text-[#16A34A]" />
                       ))}
                     </div>
                     <span className="text-[#BBF7D0]">|</span>
                     <span className="text-[11px] font-bold text-[#1F2430]">5.0</span>
                     <span className="text-[#BBF7D0]">|</span>
                     <span className="text-[10px] font-bold text-[#065F46]">Reviewed</span>
                   </div>
                 )}
               </div>
             )}
          </div>
        </Link>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-sm font-extrabold text-[#1F2430] tracking-tight">
            {formatMoney(itemTotal, currency)}
          </span>
          <span className="text-[10px] font-medium text-[#6F7480] mt-1">
             {formatOrderDate(createdAt)}
          </span>
        </div>
      </div>
    </article>
  );
}

const orderHelpItems = items.map((item) => ({
  icon: item.icon,
  title: item.title,
  description: "Get help with your orders",
  path: "/contact-us",
}));

export default function OrderListPage() {
  const {
    state,
    navigate,
    statusFilters,
    setStatusFilters,
    timeFilters,
    setTimeFilters,
    query,
    setQuery,
    availableStatusFilters,
    availableTimeFilters,
    orderItemsList,
    totalOrders,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useOrderList();

  const dispatch = useDispatch();

  const [locallyReviewedProducts, setLocallyReviewedProducts] = useState(new Set());

  const [reviewModalState, setReviewModalState] = useState({
    isOpen: false,
    item: null,
    order: null,
    initialRating: 0,
  });

  const handleReviewClick = (item, order, rating = 0) => {
    setReviewModalState({ isOpen: true, item, order, initialRating: rating });
  };

  return (
    <>
      <Seo title="My Orders | Sam Global" />

      <section className=" bg-white  py-5 sm:py-8 lg:py-10">
        <div className="mx-auto w-full max-w-[1740px] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={ORDER_BREADCRUMBS}
            className="mb-2 flex flex-wrap  items-center gap-[10px] sm:gap-[12px] lg:gap-[15px]"
            heading="My Order"
          />
          <div className="flex flex-col gap-5 sm:gap-6 lg:gap-7 lg:mt-4">
            <div className="min-w-0 rounded-xl bg-white">
              {!(state.loading && !totalOrders && !orderItemsList.length) && (
                <div className="mb-4 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <label className="relative block w-full sm:max-w-[640px]">
                      <Search
                        size={16}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9E886A]"
                      />
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search by order ID, product name or tracking number"
                        className="h-11 w-full rounded-lg border border-[#E4DDCF] bg-[#FAF6EE]/40 pl-11 pr-11 text-sm font-medium text-[#1F2430] placeholder-[#6F7480] outline-none transition-all focus:outline-none focus:bg-white focus:ring-3 focus:ring-[#D6A323]/15 shadow-2xs"
                      />
                      {Boolean(query) && (
                        <button
                          type="button"
                          onClick={() => setQuery("")}
                          aria-label="Clear search"
                          className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#6F7480] hover:text-[#1F2430] transition"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </label>

                    <div className="w-full sm:w-auto shrink-0 flex justify-end">
                      <CustomDropdown
                        className="w-full sm:w-[190px]"
                        buttonClassName="h-11 w-full rounded-lg border border-[#E4DDCF] bg-white px-4 text-sm font-bold text-[#1F2430] shadow-2xs transition-all hover:border-[#D6A323]/60 focus:outline-none"
                        options={[
                          { value: "all", label: "All Orders" },
                          ...availableStatusFilters.map((f) => ({
                            value: f.value,
                            label: f.label,
                          })),
                        ]}
                        value={
                          statusFilters && statusFilters.length === 1
                            ? statusFilters[0]
                            : "all"
                        }
                        onChange={(v) => {
                          if (v === "all") setStatusFilters([]);
                          else setStatusFilters([v]);
                        }}
                        placeholder="Status"
                      />
                    </div>
                  </div>
                </div>
              )}

              <ApiState
                loading={state.loading && !totalOrders}
                error={state.error}
                empty={
                  !orderItemsList.length &&
                  !state.loading &&
                  !!state.lastFetchedAt
                }
                skeletonLayout={ORDER_LIST_SKELETON}
                skeletonContainerClass=""
                emptyTitle={
                  statusFilters.length || timeFilters.length
                    ? "No orders found"
                    : "No orders yet"
                }
                emptyText={
                  statusFilters.length || timeFilters.length || query
                    ? "Try adjusting your filters."
                    : "Once you place an order, it will appear here."
                }
                emptyActionLabel="Continue Shopping"
                onEmptyAction={() => navigate("/products")}
              >
                <div className="flex flex-col gap-3">
                  {orderItemsList.map(({ order, item }) => (
                    <OrderItemSummaryCard
                      key={`${getOrderId(order)}:${getOrderItemId(item)}`}
                      order={order}
                      item={item}
                      locallyReviewedProducts={locallyReviewedProducts}
                      onReviewClick={handleReviewClick}
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </ApiState>
            </div>
          </div>
        </div>
      </section>

      {reviewModalState.isOpen && reviewModalState.item && (
        <ReviewModal
          item={reviewModalState.item}
          orderId={getOrderId(reviewModalState.order)}
          initialRating={reviewModalState.initialRating}
          getProductTitle={getProductTitle}
          onClose={() =>
            setReviewModalState({ isOpen: false, item: null, order: null, initialRating: 0 })
          }
          onSubmitted={(res) => {
            setReviewModalState({ isOpen: false, item: null, order: null, initialRating: 0 });
            dispatch(fetchMyOrders({ page: currentPage, limit: pageSize }));
            
            const pId = res?.productId || getReviewProductId(reviewModalState.item);
            if (pId) {
              setLocallyReviewedProducts(prev => new Set([...prev, pId]));
            }
          }}
        />
      )}
    </>
  );
}