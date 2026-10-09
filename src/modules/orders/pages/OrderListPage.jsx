
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  X,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { useDispatch } from "react-redux";

import Seo from "../../../components/ui/Seo";
import ApiState from "../../../components/ui/ApiState";
import FilterDropdown from "../../../components/ui/FilterDropdown";
import { AllOrdersIcon } from "../../../components/ui/icons";
import { PageContainer } from "../../../components/ui/layout";

import Breadcrumbs from "../../common/components/Breadcrumbs";
import Pagination from "../../products/components/Pagination";
import NeedHelpPanel from "../../support/components/NeedHelpPanel";

import { useOrderList } from "../controllers/useOrderList";
import { ReviewModal } from "../components/OrderItemReview";
import OrderItemSummaryCard from "../components/OrderItemSummaryCard";

import { getOpaqueOrderPath } from "../../../utils/routeTokens";
import { getReviewProductId, getReviewOrderItemId } from "../utils/orderItems";

import {
  COMPACT_STATUS_BADGE,
  items,
  ORDER_BREADCRUMBS,
} from "../../../data/orderPage";

const RETURN_BREADCRUMBS = [
  { label: "Home", href: "/" },
  { label: "Return & Refund", href: "/returns-refunds" },
];

import { ORDER_LIST_SKELETON } from "../../../components/ui/skeleton/layouts";

import { fetchMyOrders } from "../slices/orderSlice";
import { fetchMyProductReview, orderReviewKey } from "../../../features/review/reviewSlice";

import {
  getOrderId,
  getOrderStatus,
  getProductTitle,
  resolveOrderItemDisplayStatus,
  getOrderItemId,
} from "../../../utils/pages/orderUtils";

const getStatusIcon = (value) => {
  const iconClass = "shrink-0 text-[var(--customer-gold-dark)]";

  switch (value) {
    case "all":
      return <AllOrdersIcon size={16} className={iconClass} />;

    case "on_the_way":
    case "in_transit":
    case "in_reverse_transit":
    case "pickup_scheduled":
    case "reverse_pickup_scheduled":
      return <Truck size={16} className={iconClass} />;

    case "delivered":
    case "approved":
    case "return_approved":
    case "qc_passed":
    case "return_qc_passed":
    case "refunded":
      return <CheckCircle2 size={16} className={iconClass} />;

    case "cancelled":
    case "rejected":
    case "return_rejected":
    case "qc_failed":
    case "refund_failed":
    case "pickup_failed":
      return <XCircle size={16} className={iconClass} />;

    case "returned":
    case "return_requested":
    case "requested":
      return <RotateCcw size={16} className={iconClass} />;

    case "payment_failed":
    case "refund_pending":
      return <AlertCircle size={16} className={iconClass} />;

    default:
      return <AllOrdersIcon size={16} className={iconClass} />;
  }
};

const orderHelpItems = items.map((item) => ({
  icon: item.icon,
  title: item.title,
  description: "Get help with your orders",
  path: "/contact-us",
}));

export default function OrderListPage({ returnOnly = false }) {
  const location = useLocation();
  const isReturnOnly = Boolean(
    returnOnly ||
    location.pathname === "/returns-refunds",
  );

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
    hasAnyOrders,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useOrderList({ returnOnly: isReturnOnly });

  const dispatch = useDispatch();

  const [locallyReviewedProducts, setLocallyReviewedProducts] = useState(
    new Set(),
  );

  const [reviewModalState, setReviewModalState] = useState({
    isOpen: false,
    item: null,
    order: null,
    initialRating: 0,
  });

  useEffect(() => {
    if (orderItemsList?.length > 0) {
      const reviewsToFetch = new Map();

      orderItemsList.forEach(({ order, item, itemStatus }) => {
        const status = String(
          itemStatus ||
            resolveOrderItemDisplayStatus(
              item,
              getOrderStatus(order),
              order?.relations?.shipments || order?.shipments || [],
              [],
              order?.relations?.cancellations || order?.cancellations || [],
            ),
        ).toLowerCase();

        const canReview = ["delivered", "completed"].includes(status);
        const isUnreviewed = !item.has_reviewed && !item.is_reviewed;

        if (canReview && isUnreviewed) {
          const productId = getReviewProductId(item);

          const scope = { productId, orderId: getOrderId(order), orderItemId: getReviewOrderItemId(item) };
          const key = orderReviewKey(scope);
          if (productId && scope.orderId && scope.orderItemId && !locallyReviewedProducts.has(key)) {
            reviewsToFetch.set(key, scope);
          }
        }
      });

      reviewsToFetch.forEach((scope) => {
        dispatch(fetchMyProductReview(scope));
      });
    }
  }, [orderItemsList, dispatch, locallyReviewedProducts]);

  const handleReviewClick = (item, order, rating = 0) => {
    setReviewModalState({
      isOpen: true,
      item,
      order,
      initialRating: rating,
    });
  };

  const isFilteredOrSearched = Boolean(
    statusFilters.length || timeFilters.length || query,
  );

  return (
    <>
      <Seo title={isReturnOnly ? "Return & Refund | Sam Global" : "My Orders | Sam Global"} />

      <PageContainer>
        <Breadcrumbs
          items={isReturnOnly ? RETURN_BREADCRUMBS : ORDER_BREADCRUMBS}
          
        />

        <div className="flex flex-col gap-5 sm:gap-6 lg:gap-7">
          <div className="min-w-0 rounded-xl bg-white">
            {hasAnyOrders && (
              <div className="mb-4 flex flex-col gap-3">
                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                  <label className="relative block w-full sm:max-w-[640px]">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9E886A]"
                    />

                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={
                        isReturnOnly
                          ? "Search returns by order ID, product name or tracking number"
                          : "Search by order ID, product name or tracking number"
                      }
                      className=" h-11 w-full rounded-lg border border-[#e4ca8e] bg-white pl-11 pr-11 text-sm font-medium text-[#1F2430] placeholder-[#6F7480] outline-none transition-shadow duration-200 focus:bg-white focus:outline-none focus:shadow-[0_4px_14px_rgba(31,36,48,0.08)]"
                    />

                    {Boolean(query) && (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        aria-label="Clear search"
                        className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-[#6F7480] transition hover:text-[#1F2430]"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </label>

                  <div className=" flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
                    <FilterDropdown
                      options={[
                        {
                          value: 10,
                          label: "10 per page",
                        },
                        {
                          value: 20,
                          label: "20 per page",
                        },
                        {
                          value: 30,
                          label: "30 per page",
                        },
                        {
                          value: 40,
                          label: "40 per page",
                        },
                      ]}
                      value={pageSize}
                      onChange={(value) => {
                        setPageSize(Number(value));
                        setCurrentPage(1);
                      }}
                      placeholder="Per page"
                      className="w-full sm:w-[150px]"
                    />

                    <FilterDropdown
                      options={[
                        {
                          value: "all",
                          label: isReturnOnly ? "All Returns" : "All Orders",
                          icon: getStatusIcon("all"),
                        },
                        ...availableStatusFilters.map((filter) => ({
                          value: filter.value,
                          label: filter.label,
                          icon: getStatusIcon(filter.value),
                        })),
                      ]}
                      value={
                        statusFilters && statusFilters.length === 1
                          ? statusFilters[0]
                          : "all"
                      }
                      onChange={(value) => {
                        if (value === "all") {
                          setStatusFilters([]);
                        } else {
                          setStatusFilters([value]);
                        }
                        setCurrentPage(1);
                      }}
                      placeholder={isReturnOnly ? "Return Status" : "Status"}
                    />
                  </div>
                </div>
              </div>
            )}

            <ApiState
              loading={state.loading && !hasAnyOrders}
              error={state.error}
              empty={!orderItemsList.length && !state.loading}
              skeletonLayout={ORDER_LIST_SKELETON}
              skeletonContainerClass=""
              emptyTitle={
                isFilteredOrSearched
                  ? (isReturnOnly ? "No returns found" : "No orders found")
                  : (isReturnOnly ? "No returns yet" : "No orders yet")
              }
              emptyText={
                isFilteredOrSearched
                  ? "Try adjusting your filters."
                  : (isReturnOnly
                      ? "You haven't requested any returns or refunds yet."
                      : "Once you place an order, it will appear here.")
              }
              emptyActionLabel={
                isFilteredOrSearched
                  ? "Clear Filters"
                  : (isReturnOnly ? "View My Orders" : "Continue Shopping")
              }
              onEmptyAction={() => {
                if (isFilteredOrSearched) {
                  setStatusFilters([]);
                  setTimeFilters([]);
                  setQuery("");
                } else {
                  navigate(isReturnOnly ? "/orders" : "/products");
                }
              }}
            >
              <div className="flex flex-col gap-3">
                {orderItemsList.map((entry) => {
                  const order = entry?.order;
                  const item = entry?.item || entry;
                  return (
                    <OrderItemSummaryCard
                      key={`${getOrderId(order)}:${getOrderItemId(item)}`}
                      order={order}
                      item={item}
                      status={entry?.itemStatus}
                      returns={entry?.returns}
                      locallyReviewedProducts={locallyReviewedProducts}
                      onReviewClick={handleReviewClick}
                    />
                  );
                })}
              </div>

              {orderItemsList.length > 0 && (
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
      </PageContainer>

      {reviewModalState.isOpen && reviewModalState.item && (
        <ReviewModal
          item={reviewModalState.item}
          orderId={getOrderId(reviewModalState.order)}
          initialRating={reviewModalState.initialRating}
          getProductTitle={getProductTitle}
          onClose={() =>
            setReviewModalState({
              isOpen: false,
              item: null,
              order: null,
              initialRating: 0,
            })
          }
          onSubmitted={(res) => {
            setReviewModalState({
              isOpen: false,
              item: null,
              order: null,
              initialRating: 0,
            });

            dispatch(
              fetchMyOrders({
                params: {
                  limit: 200,
                  offset: 0,
                },
              }),
            );

            const productId =
              res?.productId || getReviewProductId(reviewModalState.item);

            if (productId) {
              setLocallyReviewedProducts(
                (previous) => new Set([...previous, orderReviewKey({
                  productId,
                  orderId: getOrderId(reviewModalState.order),
                  orderItemId: res?.orderItemId || getReviewOrderItemId(reviewModalState.item),
                })]),
              );
            }
          }}
        />
      )}
    </>
  );
}
