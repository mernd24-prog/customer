import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X, Truck, CheckCircle2, XCircle, RotateCcw, AlertCircle } from "lucide-react";
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
import { getReviewProductId } from "../utils/orderItems";

import {
  COMPACT_STATUS_BADGE,
  items,
  ORDER_BREADCRUMBS,
} from "../../../data/orderPage";

import { ORDER_LIST_SKELETON } from "../../../components/ui/skeleton/layouts";

import { fetchMyOrders } from "../slices/orderSlice";
import { fetchMyProductReview } from "../../../features/review/reviewSlice";

import {
  getOrderId,
  getOrderStatus,
  getProductTitle,
  resolveOrderItemDisplayStatus,
  getOrderItemId,
} from "../../../utils/pages/orderUtils";

const getStatusIcon = (value) => {
  const iconClass =
    "shrink-0 text-[var(--customer-gold-dark)]";

  switch (value) {
    case "all":
      return (
        <AllOrdersIcon
          size={16}
          className={iconClass}
        />
      );

    case "on_the_way":
      return (
        <Truck
          size={16}
          className={iconClass}
        />
      );

    case "delivered":
      return (
        <CheckCircle2
          size={16}
          className={iconClass}
        />
      );

    case "cancelled":
      return (
        <XCircle
          size={16}
          className={iconClass}
        />
      );

    case "returned":
      return (
        <RotateCcw
          size={16}
          className={iconClass}
        />
      );

    case "payment_failed":
      return (
        <AlertCircle
          size={16}
          className={iconClass}
        />
      );

    default:
      return (
        <AllOrdersIcon
          size={16}
          className={iconClass}
        />
      );
  }
};

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

  const [locallyReviewedProducts, setLocallyReviewedProducts] =
    useState(new Set());

  const [reviewModalState, setReviewModalState] = useState({
    isOpen: false,
    item: null,
    order: null,
    initialRating: 0,
  });

  useEffect(() => {
    if (orderItemsList?.length > 0) {
      const productIdsToFetch = new Set();

      orderItemsList.forEach(({ order, item }) => {
        const status = String(
          resolveOrderItemDisplayStatus(
            item,
            getOrderStatus(order),
            order?.shipments || [],
            [],
            order?.cancellations || [],
          ),
        ).toLowerCase();

        const canReview = ["delivered", "completed"].includes(status);
        const isUnreviewed =
          !item.has_reviewed && !item.is_reviewed;

        if (canReview && isUnreviewed) {
          const productId = getReviewProductId(item);

          if (
            productId &&
            !locallyReviewedProducts.has(productId)
          ) {
            productIdsToFetch.add(productId);
          }
        }
      });

      productIdsToFetch.forEach((productId) => {
        dispatch(fetchMyProductReview({ productId }));
      });
    }
  }, [
    orderItemsList,
    dispatch,
    locallyReviewedProducts,
  ]);

  const handleReviewClick = (
    item,
    order,
    rating = 0,
  ) => {
    setReviewModalState({
      isOpen: true,
      item,
      order,
      initialRating: rating,
    });
  };

  return (
    <>
      <Seo title="My Orders | Sam Global" />

      <PageContainer>
        <Breadcrumbs
          items={ORDER_BREADCRUMBS}
          className="mb-6 sm:mb-8 flex flex-wrap items-center gap-[10px] sm:gap-[12px] lg:gap-[15px]"
        />

        <div className="flex flex-col gap-5 sm:gap-6 lg:gap-7">
          <div className="min-w-0 rounded-xl bg-white">
            {!(
              state.loading &&
              !totalOrders &&
              !orderItemsList.length
            ) && (
              <div className="mb-4 flex flex-col gap-3">
                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                  <label className="relative block w-full sm:max-w-[640px]">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9E886A]"
                    />

                    <input
                      value={query}
                      onChange={(event) =>
                        setQuery(event.target.value)
                      }
                      placeholder="Search by order ID, product name or tracking number"
                      className="h-11 w-full rounded-lg border border-[#E7D9B8] bg-white pl-11 pr-11 text-sm font-medium text-[#1F2430] placeholder-[#6F7480] outline-none transition-shadow duration-200 focus:bg-white focus:outline-none focus:shadow-[0_4px_14px_rgba(31,36,48,0.08)]"
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

                  <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
                    <FilterDropdown
                      options={[
                        {
                          value: 4,
                          label: "4 per page",
                        },
                        {
                          value: 8,
                          label: "8 per page",
                        },
                        {
                          value: 12,
                          label: "12 per page",
                        },
                        {
                          value: 20,
                          label: "20 per page",
                        },
                      ]}
                      value={pageSize}
                      onChange={(value) =>
                        setPageSize(Number(value))
                      }
                      placeholder="Per page"
                      className="w-full sm:w-[150px]"
                    />

                    <FilterDropdown
                      options={[
                        {
                          value: "all",
                          label: "All Orders",
                          icon: getStatusIcon("all"),
                        },
                        ...availableStatusFilters.map(
                          (filter) => ({
                            value: filter.value,
                            label: filter.label,
                            icon: getStatusIcon(
                              filter.value,
                            ),
                          }),
                        ),
                      ]}
                      value={
                        statusFilters &&
                        statusFilters.length === 1
                          ? statusFilters[0]
                          : "all"
                      }
                      onChange={(value) => {
                        if (value === "all") {
                          setStatusFilters([]);
                        } else {
                          setStatusFilters([value]);
                        }
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
                statusFilters.length ||
                timeFilters.length
                  ? "No orders found"
                  : "No orders yet"
              }
              emptyText={
                statusFilters.length ||
                timeFilters.length ||
                query
                  ? "Try adjusting your filters."
                  : "Once you place an order, it will appear here."
              }
              emptyActionLabel="Continue Shopping"
              onEmptyAction={() =>
                navigate("/products")
              }
            >
              <div className="flex flex-col gap-3">
                {orderItemsList.map(
                  ({ order, item }) => (
                    <OrderItemSummaryCard
                      key={`${getOrderId(order)}:${getOrderItemId(item)}`}
                      order={order}
                      item={item}
                      locallyReviewedProducts={
                        locallyReviewedProducts
                      }
                      onReviewClick={
                        handleReviewClick
                      }
                    />
                  ),
                )}
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

      {reviewModalState.isOpen &&
        reviewModalState.item && (
          <ReviewModal
            item={reviewModalState.item}
            orderId={getOrderId(
              reviewModalState.order,
            )}
            initialRating={
              reviewModalState.initialRating
            }
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
                  page: currentPage,
                  limit: pageSize,
                }),
              );

              const productId =
                res?.productId ||
                getReviewProductId(
                  reviewModalState.item,
                );

              if (productId) {
                setLocallyReviewedProducts(
                  (previous) =>
                    new Set([
                      ...previous,
                      productId,
                    ]),
                );
              }
            }}
          />
        )}
    </>
  );
}
