import { useState } from "react";
import { Link } from "react-router-dom";

import { MdDateRange } from "react-icons/md";
import { FaShoppingCart } from "react-icons/fa";
import { BsCreditCardFill } from "react-icons/bs";
import { IoIosStar } from "react-icons/io";
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
import { useOrderPayment } from "../controllers/actions/useOrderPayment";
import { useSelector } from "react-redux";
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

function OrderItemSummaryCard({ order, item, onReviewClick }) {
  if (!order || !item) return null;

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

  const paymentStatus = String(
    order?.paymentStatus || order?.payment_status || "",
  ).toLowerCase();

  const paymentMethod = String(
    order?.paymentMethod || order?.payment_method || "",
  ).toLowerCase();

  const isCod = paymentMethod === "cod" || paymentMethod === "cash_on_delivery";
  const orderStatus = getOrderStatus(order);
  const isPaymentPending =
    orderStatus === "pending_payment" || orderStatus === "payment_failed";

  const canPayOnline =
    (isPaymentPending || isCod) &&
    paymentStatus !== "captured" &&
    !["cancelled", "returned", "delivered", "completed"].includes(orderStatus);

  const userState = useSelector((s) => s.user?.current);
  const { retrying, handleRetryPayment } = useOrderPayment({
    orderId: id,
    order,
    userState,
  });

  const [hoverStar, setHoverStar] = useState(0);

  const handleCardClick = (e) => {
    if (isPaymentPending && !isCod) {
      e.preventDefault();
      handleRetryPayment();
    }
  };

  const s = String(itemStatus).toLowerCase();
  let statusBadgeStyle = "bg-amber-50/90 text-[#A96F14] border-amber-200/90";
  let statusDotColor = "bg-amber-500";

  if (["delivered", "completed"].includes(s)) {
    statusBadgeStyle = "bg-emerald-50/90 text-emerald-700 border-emerald-200/90";
    statusDotColor = "bg-emerald-500";
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
    statusBadgeStyle = "bg-rose-50/90 text-rose-700 border-rose-200/90";
    statusDotColor = "bg-rose-500";
  } else if (["pending_payment"].includes(s)) {
    statusBadgeStyle = "bg-amber-50/90 text-amber-700 border-amber-200/90";
    statusDotColor = "bg-amber-500";
  }

  const isDelivered = ["delivered", "completed", "refunded"].includes(s);
  const isUnreviewed = !item.has_reviewed && !item.is_reviewed;

  return (
    <article className="group relative overflow-hidden rounded-xl border border-[#E4DDCF] bg-white transition-all duration-200 hover:border-[#D6A323]/40 shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4">
        {/* Left section: Thumbnail & Details (Link to detail) */}
        <Link
          to={itemDetailPath}
          onClick={handleCardClick}
          className="flex flex-1 items-center gap-3 sm:gap-4 min-w-0 group/link"
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

          <div className="flex flex-col gap-1 min-w-0 flex-1">
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

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
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

        {/* Right Columns: Price | Status & Date | Action Button */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-4 lg:gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E4DDCF]/60 shrink-0">
          {/* Price */}
          <div className="flex flex-col justify-center min-w-[100px] lg:text-right">
            <span className="text-base sm:text-lg font-extrabold text-[#1F2430] tracking-tight">
              {formatMoney(itemTotal, currency)}
            </span>
          </div>

          {/* Status & Date */}
          <div className="flex flex-col justify-center gap-1 min-w-[140px] lg:items-start">
            <div className="flex items-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold whitespace-nowrap border ${statusBadgeStyle} shadow-2xs`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusDotColor} animate-pulse shrink-0`} />
                <span>{humanize(itemStatus, "Processing")}</span>
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#6F7480] whitespace-nowrap pl-0.5">
              {formatOrderDate(createdAt)}
            </span>
          </div>

          {/* Action Button (Pay Now or Rate Product) */}
          <div className="flex items-center justify-end shrink-0 min-w-[110px]">
            {canPayOnline ? (
              <button
                type="button"
                disabled={retrying}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRetryPayment();
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#D6A323] to-[#A96F14] hover:from-[#A96F14] hover:to-[#86560B] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:shadow-xs transition-all active:scale-95 whitespace-nowrap cursor-pointer"
              >
                {retrying ? (
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Pay Now"
                )}
              </button>
            ) : (
              isDelivered && isUnreviewed && (
                <div className="flex flex-col gap-0.5 items-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F7480]">
                    Rate product
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (onReviewClick) onReviewClick(item, order, rating);
                        }}
                        onMouseEnter={() => setHoverStar(rating)}
                        onMouseLeave={() => setHoverStar(0)}
                        className="p-0.5 transition-transform hover:scale-125 focus:outline-none"
                        title={`Rate ${rating} star${rating > 1 ? "s" : ""}`}
                      >
                        <IoIosStar
                          size={18}
                          className={
                            rating <= (hoverStar || 0)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-[#D7D7E0] text-[#D7D7E0] hover:fill-amber-300"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
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
                  {/* Top filter chips */}
                  {/* status chips moved into dropdown per request */}

                  {/* Search + controls */}
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
          onSubmitted={() => {
            setReviewModalState({ isOpen: false, item: null, order: null, initialRating: 0 });
          }}
        />
      )}
    </>
  );
}