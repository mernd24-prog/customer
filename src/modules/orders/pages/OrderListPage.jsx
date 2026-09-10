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
import { useDispatch } from "react-redux";
import { RefreshCw } from "lucide-react";
import Button from "../../../components/ui/buttons/Button";

import { formatMoney } from "../../../utils/ecommerce";
import {
  COMPACT_STATUS_BADGE,
  items,
  ORDER_BREADCRUMBS,
} from "../../../data/orderPage";
import { ORDER_LIST_SKELETON } from "../../../components/ui/skeleton/layouts";

import { fetchMyOrders } from "../slices/orderSlice";
import { fetchMyProductReview } from "../../../features/review/reviewSlice";
import OrderItemSummaryCard from "../components/OrderItemSummaryCard";

import {
  getOrderId,
  getOrderStatus,
  getProductTitle,
  resolveOrderItemDisplayStatus,
  getOrderItemId,
} from "../../../utils/pages/orderUtils";


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

  // Batch fetch reviews for products shown on the current page
  useEffect(() => {
    if (orderItemsList?.length > 0) {
      const productIdsToFetch = new Set();
      
      orderItemsList.forEach(({ order, item }) => {
        const s = String(resolveOrderItemDisplayStatus(item, getOrderStatus(order), order?.shipments || [], [], order?.cancellations || [])).toLowerCase();
        const canReview = ["delivered", "completed"].includes(s); // simplifcation
        const isUnreviewed = !item.has_reviewed && !item.is_reviewed;
        
        if (canReview && isUnreviewed) {
          const productId = getReviewProductId(item);
          if (productId && !locallyReviewedProducts.has(productId)) {
            productIdsToFetch.add(productId);
          }
        }
      });

      productIdsToFetch.forEach((productId) => {
         dispatch(fetchMyProductReview({ productId }));
      });
    }
  }, [orderItemsList, dispatch, locallyReviewedProducts]);

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