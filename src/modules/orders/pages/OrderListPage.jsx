import { useState } from "react";
import { Link } from "react-router-dom";

import { MdDateRange } from "react-icons/md";
import { FaShoppingCart } from "react-icons/fa";
import { BsCreditCardFill } from "react-icons/bs";
import { IoIosStar } from "react-icons/io";
import ShowMoreText from "../../../utils/showMore";
import { Search, Truck, X, Package } from "lucide-react";

import ApiState from "../../../components/ui/ApiState";
import Seo from "../../../components/ui/Seo";

import Breadcrumbs from "../../common/components/Breadcrumbs";
import StickySidebarLayout from "../../../components/ui/layout/StickySidebarLayout";
import ProductFilterSidebar, { FilterSection, CheckboxListFilter } from "../../products/components/ProductFilterSidebar";

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
  const isPaymentPending = orderStatus === "pending_payment" || orderStatus === "payment_failed";
  
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

  const handleCardClick = (e) => {
    if (isPaymentPending && !isCod) {
      e.preventDefault();
      handleRetryPayment();
    }
  };

  const s = String(itemStatus).toLowerCase();
  let statusDotColor = "bg-[#D7A522]";
  if (["delivered", "completed"].includes(s)) statusDotColor = "bg-[#21812C]";
  else if (["cancelled", "failed", "returned", "refunded"].includes(s)) statusDotColor = "bg-[#DC2626]";

  return (
    <article className="overflow-hidden rounded-xl border border-[#E7D9B8] bg-[#FFFCF6] transition hover:shadow-sm">
      <Link
        to={itemDetailPath}
        onClick={handleCardClick}
        className="flex flex-col md:flex-row md:items-start gap-4 p-4 md:p-5 transition hover:bg-[#FFFDF9]"
      >
        <div className="flex flex-1 gap-4 min-w-0">
          <span className="flex aspect-square w-20 sm:w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#EFE5D2] bg-white p-1.5 sm:p-2">
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
              <Package size={34} className="text-[#D9CBAE]" />
            )}
          </span>
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <span className="block text-sm font-semibold text-[#1B1D60] md:text-base">
              <ShowMoreText
                text={productTitle}
                mode="characters"
                limit={58}
                moreLabel="more"
                lessLabel="less"
                textClassName="inline"
                buttonClassName="ml-1 text-sm font-semibold text-[#1B1D60] hover:underline"
              />
            </span>
            <span className="flex flex-wrap gap-2 text-xs font-semibold text-[#5E6472] mt-1">
              {getOrderItemColor(item) !== "N/A" && (
                <span className="rounded-full bg-[#F4F6FA] px-3 py-1.5">
                  Color: {getOrderItemColor(item)}
                </span>
              )}
              <span className="rounded-full bg-[#F4F6FA] px-3 py-1.5">
                Qty: {orderedQuantity}
              </span>
            </span>
          </div>
        </div>

        <div className="md:w-28 shrink-0 mt-2 md:mt-0">
          <span className="block text-lg font-semibold text-[#1B1D60]">
            {formatMoney(itemTotal, currency)}
          </span>
        </div>

        <div className="md:w-64 shrink-0 flex flex-col gap-1.5 mt-2 md:mt-0">
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusDotColor}`} />
            <span className="font-bold text-sm text-[#1B1D60] capitalize">
              {humanize(itemStatus, "Processing")} on {formatOrderDate(createdAt)}
            </span>
          </div>
          
          <p className="text-xs text-[#5E6472]">
            {s === 'delivered' ? 'Your item has been delivered' : s === 'cancelled' ? 'Your order was cancelled' : 'Your order is being processed'}
          </p>

          {canPayOnline ? (
            <button
              type="button"
              disabled={retrying}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRetryPayment();
              }}
              className="mt-3 flex w-fit items-center gap-1.5 rounded-full border border-[#D7A522] bg-[#FFFCF6] px-4 py-1.5 text-sm font-semibold text-[#D7A522] shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all hover:bg-[#D7A522] hover:text-white"
            >
              {retrying ? (
                <span className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                "Pay Now"
              )}
            </button>
          ) : (
            isDeliveredOrderItem(item) && !item.has_reviewed && !item.is_reviewed && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onReviewClick) onReviewClick(item, order);
                }}
                className="mt-2 flex w-fit items-center gap-1.5 text-sm font-semibold text-[#2564EB] transition hover:text-[#1d4ed8]"
              >
                <IoIosStar size={16} className="fill-[#2564EB]" /> Rate & Review Product
              </button>
            )
          )}
        </div>
      </Link>
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
  } = useOrderList();

  const [reviewModalState, setReviewModalState] = useState({
    isOpen: false,
    item: null,
    order: null,
  });

  const handleReviewClick = (item, order) => {
    setReviewModalState({ isOpen: true, item, order });
  };

  return (
    <>
      <Seo title="My Orders | Sam Global" />

      <section className="min-h-screen bg-white  py-5 sm:py-8 lg:py-10">
        <div className="mx-auto w-full max-w-[1740px] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={ORDER_BREADCRUMBS}
            className="mb-2 flex flex-wrap  items-center gap-[10px] sm:gap-[12px] lg:gap-[15px]"
            heading="My Order"
          />
          <StickySidebarLayout
            sidebarPosition="left"
            containerClass="flex flex-col xl:flex-row gap-5 sm:gap-6 lg:gap-7 lg:mt-4"
            sidebarClass="w-full xl:w-[280px] 2xl:w-[280px] transition-[top] duration-300 ease-in-out"
            mainContent={
              <div className="min-w-0 rounded-xl bg-white">
                {!(state.loading && !orderItemsList.length) && (
                  <div className="mb-4 flex flex-col gap-3">
                    <label className="relative block w-full">
                      <Search
                        size={15}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                      />
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search your orders here"
                        className="h-10 w-full rounded-[10px] border border-[#1B1D604D] bg-[#FAF8FFB2] pl-9 pr-9 text-base font-medium text-ink outline-none focus:outline-none"
                      />
                      {Boolean(query) && (
                        <button
                          type="button"
                          onClick={() => setQuery("")}
                          aria-label="Clear search"
                          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#1B1D6080] hover:text-[#1B1D60] transition"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </label>
                  </div>
                )}

                <ApiState
                  loading={state.loading && !orderItemsList.length}
                  error={state.error}
                  empty={
                    !orderItemsList.length &&
                    !state.loading &&
                    !!state.lastFetchedAt
                  }
                  skeletonLayout={ORDER_LIST_SKELETON}
                  skeletonContainerClass=""
                  emptyTitle={
                    statusFilters.length || timeFilters.length ? "No orders found" : "No orders yet"
                  }
                  emptyText={
                    statusFilters.length || timeFilters.length || query
                      ? "Try adjusting your filters."
                      : "Once you place an order, it will appear here."
                  }
                  emptyActionLabel="Continue Shopping"
                  onEmptyAction={() => navigate("/products")}
                >
                  <div className="flex  flex-col gap-4  ">
                    {orderItemsList.map(({ order, item }) => (
                      <OrderItemSummaryCard
                        key={`${getOrderId(order)}:${getOrderItemId(item)}`}
                        order={order}
                        item={item}
                        onReviewClick={handleReviewClick}
                      />
                    ))}
                  </div>
                </ApiState>
              </div>
            }
            sidebarContent={
              <div className="min-w-0 self-start xl:h-fit">
                <ProductFilterSidebar
                  onClearAll={
                    statusFilters.length > 0 || timeFilters.length > 0
                      ? () => {
                          setStatusFilters([]);
                          setTimeFilters([]);
                        }
                      : undefined
                  }
                  sections={[
                    {
                      title: "Order Status",
                      defaultOpen: true,
                      searchable: true,
                      content: (
                        <CheckboxListFilter
                          name="status"
                          options={availableStatusFilters}
                          selected={statusFilters}
                          onChange={setStatusFilters}
                        />
                      ),
                    },
                    {
                      title: "Order Time",
                      defaultOpen: true,
                      searchable: true,
                      content: (
                        <CheckboxListFilter
                          name="time"
                          options={availableTimeFilters}
                          selected={timeFilters}
                          onChange={setTimeFilters}
                        />
                      ),
                    },
                  ]}
                />
              </div>
            }
          />
        </div>
      </section>

      {reviewModalState.isOpen && reviewModalState.item && (
        <ReviewModal
          item={reviewModalState.item}
          orderId={getOrderId(reviewModalState.order)}
          getProductTitle={getProductTitle}
          onClose={() => setReviewModalState({ isOpen: false, item: null, order: null })}
          onSubmitted={() => {
            setReviewModalState({ isOpen: false, item: null, order: null });
          }}
        />
      )}
    </>
  );
}
