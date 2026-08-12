import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MdOutlineShoppingCart, MdContentCopy, MdDateRange } from "react-icons/md";
import { FaShoppingCart } from "react-icons/fa";
import { BsCreditCardFill } from "react-icons/bs";
import ShowMoreText from "../../../utils/showMore";
import {
  Download,
  IndianRupee,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  Search,
  Truck,
  XCircle,
} from "lucide-react";

import ApiState from "../../../components/common/ApiState";
import Seo from "../../../components/common/Seo";
import Button from "../../../components/ui/Button";
import ConfirmModal from "../../../components/common/overlay/ConfirmModal";
import Breadcrumbs from "../../../components/ecommerce/Breadcrumbs";
import StickySidebarLayout from "../../../components/common/layouts/StickySidebarLayout";
import { useToastThunk } from "../../../hooks/useToastThunk";
import { notify } from "../../../utils/notify";

import NeedHelpPanel from "../../../components/ecommerce/NeedHelpPanel";
import CustomDropdown from "../../../components/ui/CustomDropdown";

import {
  fetchMyOrders,
} from "../../../features/order/orderSlice";

import { formatMoney, getImageUrlFromValue } from "../../../utils/ecommerce";
import {
  COMPACT_STATUS_BADGE,
  items,
  ORDER_BREADCRUMBS,
  ORDER_FILTERS,
} from "../../../data/orderPage";
import { ORDER_LIST_SKELETON } from "../../../components/common/skeleton/layouts";

import {
getOrderId,
  getOrderNumber,
  getOrderStatus,
  getDeliveryStatus,
  getProgressStatus,
  hasKnownStatus,
  canCancelOrder,
  getOrderItems,
  isDeliveredOrderItem,
  hasDeliveredSellerPackage,
  getItemProduct,
  getItemProductId,
  getItemProductPath,
  getItemImage,
  getOrderCurrency,
  getAddressValue,
  getProductTitle,
  getItemAttributes,
  getItemUnitPrice,
  getItemLineTotal,
  idsMatch,
  getOrderCollection,
  unwrapOrder,
  getMatchingOrder,
  getItemsTotal,
  getAmount,
  getCustomerOrderAmount,
  getTaxIncludedAmount,
  getTaxPayableAmount,
  getCustomerPlatformFeeAmount,
  getCustomerPlatformFeeTaxAmount,
  getCustomerPlatformFeeTaxRate,
  splitInclusivePlatformFee,
  formatOrderDate,
  formatOrderId,
  getApiOrderId,
  normalizeOrderSearchText,
  getOrderRelations,
  getPaymentMethod,
  asNumber,
  STATUS_LABELS,
  humanize,
  getOrderItemColor,
  getOrderItemId,
  getOrderItemVariantId,
  getOrderItemVariantSku,
  getReturnItemProductId,
  getReturnItemVariantId,
  getReturnItemVariantSku,
  returnItemMatchesOrderItem,
  getSellerGroupKey,
  getOrderItemSellerGroupKey,
  findShipmentForOrderItem,
  resolveOrderItemDisplayStatus,
  getOrderCardImage
} from "../utils/orderUtils";

function OrderListStatusBadge({ status }) {
  const cls = COMPACT_STATUS_BADGE[status] || "bg-[#D7A522] text-white";
  return (
    <span
      className={`mt-2 md:mt-0  inline-flex min-w-[74px] small justify-center rounded-full px-3 py-2   font-bold capitalize ${cls}`}
    >
      {humanize(status, "Processing")}
    </span>
  );
}

function OrderListItemStatusSummary({ statuses = [] }) {
  const normalized = [
    ...new Set(
      statuses.filter(Boolean).map((itemStatus) => String(itemStatus)),
    ),
  ];
  if (!normalized.length) return <OrderListStatusBadge status="processing" />;
  if (normalized.length === 1)
    return <OrderListStatusBadge status={normalized[0]} />;
  return (
    <span className="mt-2 inline-flex min-w-[110px] justify-center rounded-full bg-[#1B1D60] px-3 py-2 text-xs font-bold capitalize text-white md:mt-0">
      Mixed item status
    </span>
  );
}

function OrderItemSummaryCard({ order, item }) {
  const id = getOrderId(order);
  const apiOrderId = getOrderId(order);
  const createdAt = order.created_at || order.createdAt;
  const currency = getOrderCurrency(order);
  const paymentMethod = humanize(getPaymentMethod(order), "N/A");
  const shipments = Array.isArray(order?.relations?.shipments)
    ? order.relations.shipments
    : [];
  const itemId = getOrderItemId(item);
  const itemStatus = resolveOrderItemDisplayStatus(
    item,
    getOrderStatus(order),
    shipments,
  );
  const shipment = findShipmentForOrderItem(shipments, item);
  const itemImage = getOrderCardImage(item);
  const itemTotal =
    item.line_total ??
    item.lineTotal ??
    Number(item.unit_price || item.unitPrice || 0) * Number(item.quantity || 0);
  const itemDetailPath = `/orders/${id}?orderItemId=${encodeURIComponent(itemId)}`;

  const handleCopyOrderId = (event) => {
    event.preventDefault();
    event.stopPropagation();
    navigator.clipboard
      .writeText(apiOrderId)
      .then(() =>
        notify.success(`Order ID #${apiOrderId} copied to clipboard!`),
      )
      .catch((err) => console.error("Failed to copy Order ID:", err));
  };

  return (
    <article className="overflow-hidden rounded-xl border border-[#E7D9B8] bg-[#FFFCF6]">
      <div className="flex flex-col gap-2 border-b border-[#E7D9B8] bg-[#CE9F2D33] px-3 py-3 text-sm font-semibold text-ink md:flex-row md:items-center md:justify-between md:px-4">
        <span className="flex min-w-0 items-center gap-1.5">
          <FaShoppingCart className="shrink-0 text-sm text-[#2564EB]" />
          <span className="shrink-0">Order ID :</span>
          <span className="min-w-0 break-all text-xs md:text-sm">
            #{apiOrderId}
          </span>
          <button
            type="button"
            onClick={handleCopyOrderId}
            className="flex shrink-0 items-center justify-center rounded-full p-1 hover:bg-[#CE9F2D33]"
            title="Copy Order ID"
          >
            <MdContentCopy className="text-[#2E2E2E] text-sm cursor-pointer" />
          </button>
        </span>
        <span className="flex flex-wrap items-center gap-4 text-xs md:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <MdDateRange className="text-[#2564EB]" />
            {formatOrderDate(createdAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BsCreditCardFill className="text-[#2564EB]" />
            {paymentMethod}
          </span>
          <span
            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold capitalize ${COMPACT_STATUS_BADGE[itemStatus] || "bg-[#2564EB] text-white"}`}
          >
            {humanize(itemStatus, "Processing")}
          </span>
        </span>
      </div>

      <Link
        to={itemDetailPath}
        className="grid gap-4 px-4 py-5 transition hover:bg-[#FFFCF6] sm:grid-cols-[175px_minmax(0,1fr)] lg:grid-cols-[190px_minmax(0,1fr)] md:px-5"
      >
        <span className="flex aspect-square w-full max-w-[175px] lg:max-w-[190px] items-center justify-center overflow-hidden rounded-xl border border-[#EFE5D2] bg-white p-2">
          {itemImage ? (
            <img
              src={itemImage}
              alt={getProductTitle(item)}
              className="h-full w-full object-contain"
            />
          ) : (
            <Package size={34} className="text-[#D9CBAE]" />
          )}
        </span>

        <span className="min-w-0">
          <span className="block text-base font-extrabold text-[#1B1D60] md:text-lg">
            <ShowMoreText
              text={getProductTitle(item)}
              mode="characters"
              limit={65}
              moreLabel="more"
              lessLabel="less"
              textClassName="inline"
              buttonClassName="ml-1 text-sm font-semibold text-[#1B1D60] hover:underline"
            />
          </span>
          <span className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[#5E6472]">
            <span className="rounded-full bg-[#F4F6FA] px-3 py-1.5">
              Qty {Number(item.quantity || 0)}
            </span>
            {getOrderItemColor(item) !== "N/A" && (
              <span className="rounded-full bg-[#F4F6FA] px-3 py-1.5">
                Color: {getOrderItemColor(item)}
              </span>
            )}
            {/* <span
              className={`rounded-full px-3 py-1.5 capitalize ${COMPACT_STATUS_BADGE[itemStatus] || "bg-[#EEF2FF] text-[#1B1D60]"}`}
            >
              {humanize(itemStatus, "Processing")}
            </span> */}
          </span>
          <span className="mt-4 block text-xl font-extrabold text-[#1B1D60]">
            {formatMoney(itemTotal, currency)}
          </span>
          {/* <span className="mt-0.5 block text-xs font-medium text-[#6F7480]">
            Inclusive of all taxes
          </span> */}
          {/* {(courierName || trackingNumber) && (
            <span className="mt-3 block text-xs font-semibold text-[#3E4093]">
              {courierName ? humanize(courierName, "Courier") : "Tracking"}
              {trackingNumber ? ` · ${trackingNumber}` : ""}
            </span>
          )} */}
          <span className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-gold px-4 text-sm font-bold text-white">
            <Truck size={15} />
            Track item details
          </span>
        </span>
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

export default function OrderList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const state = useSelector((s) => s.order);
  const [activeFilter, setActiveFilter] = useState("");
  const [query, setQuery] = useState("");

  const allOrders = state.list.length
    ? state.list
    : getOrderCollection(state.current);

  const availableFilters = useMemo(() => {
    return ORDER_FILTERS;
  }, []);

  const orderItemsList = useMemo(() => {
    let term = query.trim().toLowerCase();
    const normalizedTerm = normalizeOrderSearchText(query);

    // Strip leading '#' if present since it's only a visual prefix
    if (term.startsWith("#")) {
      term = term.slice(1);
    }

    return allOrders.flatMap((order) => {
      const id = String(getOrderId(order) || "").toLowerCase();
      const apiOrderId = getApiOrderId(order);
      const orderNumber = String(apiOrderId || "").toLowerCase();
      const formattedId = String(
        formatOrderId(orderNumber || id),
      ).toLowerCase();
      const visibleOrderIdText = `order id #${apiOrderId}`.toLowerCase();
      const shipments = Array.isArray(order?.relations?.shipments)
        ? order.relations.shipments
        : [];

      return getOrderItems(order)
        .map((item) => {
          const itemStatus = resolveOrderItemDisplayStatus(
            item,
            getOrderStatus(order),
            shipments,
          );
          return { order, item, itemStatus };
        })
        .filter(({ order, item, itemStatus }) => {
          if (activeFilter) {
            const normalizedItemStatus = String(itemStatus || "").toLowerCase();
            const normalizedOrderStatus = String(
              getOrderStatus(order) || "",
            ).toLowerCase();

            if (activeFilter === "return_requested") {
              if (
                ![
                  "return_requested",
                  "return_approved",
                  "partially_returned",
                  "returned",
                  "refunded",
                ].includes(normalizedItemStatus)
              ) {
                return false;
              }
            } else if (
              normalizedItemStatus !== activeFilter &&
              normalizedOrderStatus !== activeFilter
            ) {
              return false;
            }
          }

          if (!term) return true;
          const itemText = getProductTitle(item).toLowerCase();
          const normalizedOrderText = normalizeOrderSearchText(
            [
              id,
              apiOrderId,
              formattedId,
              visibleOrderIdText,
              itemText,
              itemStatus,
            ].join(" "),
          );

          return (
            id.includes(term) ||
            orderNumber.includes(term) ||
            formattedId.includes(term) ||
            itemText.includes(term) ||
            visibleOrderIdText.includes(term) ||
            String(itemStatus || "")
              .toLowerCase()
              .includes(term) ||
            (Boolean(normalizedTerm) &&
              normalizedOrderText.includes(normalizedTerm))
          );
        });
    });
  }, [activeFilter, allOrders, query]);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

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
            sidebarPosition="right"
            containerClass="flex flex-col xl:flex-row gap-6 sm:gap-8 lg:gap-9 lg:mt-4"
            sidebarClass="w-full xl:w-[400px] 2xl:w-[413px] transition-[top] duration-300 ease-in-out"
            mainContent={
              <div className="min-w-0 rounded-xl bg-white sm:p-4">
                {!(state.loading && !orderItemsList.length) && (
                  <div className="my-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="relative block w-full sm:max-w-[450px]">
                      <Search
                        size={15}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                      />
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search by  product name or Order ID..."
                        className="h-12 w-full  rounded-[10px] border border-[#1B1D604D] bg-[#FAF8FFB2] pl-9 pr-3  text-base font-medium text-ink outline-none focus:outline-none"
                      />
                    </label>

                    <CustomDropdown
                      className="w-full  lg:w-[220px]"
                      buttonClassName="h-12 rounded-[10px] border-[#1B1D604D] font-semibold text-ink"
                      options={availableFilters.map((f) => ({
                        value: f.value,
                        label: f.label === "All" ? "All Status" : f.label,
                      }))}
                      value={activeFilter}
                      onChange={(val) => {
                        setActiveFilter(val);
                      }}
                      placeholder="All Status"
                    />
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
                    activeFilter ? "No orders found" : "No orders yet"
                  }
                  emptyText={
                    activeFilter || query
                      ? "Try a different filter."
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
                      />
                    ))}
                  </div>
                </ApiState>
              </div>
            }
            sidebarContent={
              <div className="min-w-0 self-start xl:h-fit">
                <NeedHelpPanel
                  title="Need Help ?"
                  items={orderHelpItems}
                  headerStyle="plain"
                  sticky={false}
                />
              </div>
            }
          />
        </div>
      </section>
    </>
  );
}

