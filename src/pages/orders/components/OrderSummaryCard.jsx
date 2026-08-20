import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { MdContentCopy, MdDateRange } from "react-icons/md";
import { BsCreditCardFill } from "react-icons/bs";
import { Truck, Download, Package } from "lucide-react";
import { formatMoney } from "../../../utils/ecommerce";
import { notify } from "../../../utils/notify";
import { OrderListItemStatusSummary } from "./OrderListStatusBadge";
import { COMPACT_STATUS_BADGE } from "../../../data/orderPage";
import { getOrderId, getOrderStatus, hasDeliveredSellerPackage, getOrderItems, getSellerGroupKey, findShipmentForOrderItem, resolveOrderItemDisplayStatus, isDeliveredOrderItem, getOrderCurrency, getCustomerOrderAmount, getPaymentMethod, formatOrderDate, getOrderCardImage, getProductTitle, humanize, getOrderItemId } from "../../../utils/pages/orderUtils";

export function OrderSummaryCard({ order }) {
  const id = getOrderId(order);
  const apiOrderId = getOrderId(order);
  const status = getOrderStatus(order);
  const invoiceDownloadAvailable = hasDeliveredSellerPackage(order);
  const createdAt = order.created_at || order.createdAt;
  const orderItems = getOrderItems(order);
  const shipments = Array.isArray(order?.relations?.shipments) ? order.relations.shipments : [];
  const fulfillmentGroups = order?.relations?.sellerFulfillmentGroups || [];
  const sellerPackages = (() => {
    const grouped = new Map();
    orderItems.forEach((item) => {
      const sellerId = item.seller_id || item.sellerId || "platform";
      const organizationId = item.organization_id || item.organizationId || "default";
      const key = getSellerGroupKey(sellerId, organizationId);
      if (!grouped.has(key)) {
        const fulfillment = fulfillmentGroups.find((group) =>
          getSellerGroupKey(group.sellerId || group.seller_id || "platform", group.organizationId || group.organization_id || "default") === key,
        ) || {};
        const sellerSnapshot = item.seller_snapshot || item.sellerSnapshot || {};
        const organization = item.organization_snapshot || item.organizationSnapshot || {};
        grouped.set(key, {
          key,
          sellerName: fulfillment.sellerName || organization.displayName || organization.legalBusinessName ||
            sellerSnapshot.displayName || sellerSnapshot.businessName || "Marketplace seller",
          status: fulfillment.deliveryStatus || fulfillment.delivery_status || fulfillment.shipmentStatus || null,
          items: [],
        });
      }
      grouped.get(key).items.push(item);
    });
    return [...grouped.values()].map((sellerPackage) => {
      const itemStatuses = sellerPackage.items.map((item) =>
        resolveOrderItemDisplayStatus(item, sellerPackage.status || status, shipments, fulfillmentGroups, order?.relations?.cancellations || order?.cancellations || []),
      );
      const uniqueStatuses = [...new Set(itemStatuses.filter(Boolean))];
      return {
        ...sellerPackage,
        itemStatuses,
        status: uniqueStatuses.length === 1
          ? uniqueStatuses[0]
          : sellerPackage.status || (sellerPackage.items.every(isDeliveredOrderItem) ? "delivered" : status),
      };
    });
  })();
  const orderItemStatuses = orderItems.map((item) => resolveOrderItemDisplayStatus(item, status, shipments, fulfillmentGroups, order?.relations?.cancellations || order?.cancellations || []));
  const previewItems = orderItems.slice(0, 4);
  const currency = getOrderCurrency(order);
  const amount = getCustomerOrderAmount(order);
  const quantity = orderItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const paymentMethod = humanize(getPaymentMethod(order), "N/A");

  const handleCopyOrderId = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard
      .writeText(apiOrderId)
      .then(() => {
        notify.success(`Order ID #${apiOrderId} copied to clipboard!`);
      })
      .catch((err) => {
        console.error("Failed to copy order ID:", err);
      });
  };

  return (
    <article className="overflow-hidden rounded-xl  border border-[#E7D9B8]  bg-[#FFFCF6]">
      <div className="flex  flex-col gap-3 border-b border-[#E7D9B8] bg-[#CE9F2D33] px-3 py-4 md:flex-row md:items-center  md:justify-between md:gap-4 md:px-4 md:py-6  text-sm md:text-base 2xl:text-[20px]  font-semibold text-ink">
        <div className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between md:contents">
          <span className="flex min-w-0 items-center gap-1.5">
            <FaShoppingCart className="shrink-0 text-sm text-[#2564EB] lg:text-xl" />
            <span className="shrink-0">#</span>
            <span className="min-w-0 break-all small">{apiOrderId}</span>
            <button
              type="button"
              onClick={handleCopyOrderId}
              className="flex shrink-0 items-center justify-center rounded-full p-1 transition-colors duration-200 hover:bg-[#CE9F2D33]"
              title="Copy Order ID"
            >
              <MdContentCopy className="text-[#2E2E2E] text-sm lg:text-xl cursor-pointer" />
            </button>
          </span>
          <span className="self-start sm:hidden">
            <OrderListItemStatusSummary statuses={orderItemStatuses} />
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between w-full md:contents">
          <span className="lg:inline-flex  small  items-center gap-1.5  hidden">
            <MdDateRange className="text-[#2564EB] text-sm lg:text-xl" />
            {formatOrderDate(createdAt)}
          </span>
          <span className="lg:inline-flex items-center small  gap-1.5  hidden ">
            <BsCreditCardFill className="text-[#2564EB] text-sm lg:text-xl" />
            {paymentMethod}
          </span>
        </div>
        <span className="hidden md:inline-block">
          <OrderListItemStatusSummary statuses={orderItemStatuses} />
        </span>
      </div>

      <div className="p-3 sm:p-5 lg:p-6">
        <div className="grid gap-5 rounded-xl border border-[#EFE5D2] bg-white p-4 md:grid-cols-[220px_minmax(0,1fr)] md:p-5">
          <Link
            to={`/orders/${id}`}
            className={`grid min-h-44 gap-2 overflow-hidden rounded-lg bg-[#FFFAEF] p-2 ${previewItems.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
          >
            {previewItems.length ? previewItems.map((previewItem, index) => {
              const image = getOrderCardImage(previewItem);
              return (
                <div key={previewItem.id || previewItem._id || index} className="relative flex min-h-20 items-center justify-center overflow-hidden rounded-md border border-[#EFE5D2] bg-white">
                  {image ? <img src={image} alt={getProductTitle(previewItem)} className={`w-full object-contain p-2 ${previewItems.length === 1 ? "h-52" : "h-24"}`} /> : <Package size={30} className="text-[#D9CBAE]" />}
                  {index === 3 && orderItems.length > 4 && (
                    <span className="absolute inset-0 flex items-center justify-center bg-[#1B1D60D9] text-lg font-bold text-white">+{orderItems.length - 3}</span>
                  )}
                </div>
              );
            }) : <Package size={42} className="m-auto text-[#D9CBAE]" />}
          </Link>

          <div className="flex min-w-0 flex-col justify-between gap-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9A7A27]">Order overview</p>
                <h3 className="mt-1 text-xl font-extrabold text-[#1B1D60]">
                  {orderItems.length} product{orderItems.length === 1 ? "" : "s"} in {sellerPackages.length} package{sellerPackages.length === 1 ? "" : "s"}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[#5E6472]">
                  <span className="rounded-full bg-[#F4F6FA] px-3 py-1.5">{quantity} total unit{quantity === 1 ? "" : "s"}</span>
                  <span className="rounded-full bg-[#F4F6FA] px-3 py-1.5">{sellerPackages.length} seller shipment{sellerPackages.length === 1 ? "" : "s"}</span>
                </div>
              </div>
              <div className="shrink-0 sm:text-right">
                <p className="text-xs font-bold uppercase tracking-wide text-[#6F7480]">Complete order total</p>
                <p className="mt-1 text-2xl font-extrabold text-[#1B1D60]">{formatMoney(amount, currency)}</p>
                <p className="mt-0.5 text-xs font-medium text-[#6F7480]">Inclusive of all taxes</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/orders/${id}/track`}
              className="inline-flex h-11 w-full min-w-[160px] items-center justify-center gap-2 rounded-lg bg-gold px-6 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-auto"
            >
              <Truck size={18} />
              Track packages
            </Link>
            {invoiceDownloadAvailable && (
              <Link
                to={`/orders/${id}`}
                onClick={(event) => event.stopPropagation()}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#D6B45B] bg-white px-5 text-sm font-bold text-gold-dark transition hover:bg-gold-soft sm:w-auto"
              >
                <Download size={16} />
                Seller invoices
              </Link>
            )}
          </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {sellerPackages.map((sellerPackage, packageIndex) => (
            <section key={sellerPackage.key} className="overflow-hidden rounded-xl border border-[#E7D9B8] bg-white shadow-[0_3px_14px_rgba(53,45,20,0.05)]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFE5D2] bg-[#FFF8E7] px-4 py-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9A7A27]">Package {packageIndex + 1}</p>
                  <h4 className="mt-0.5 text-sm font-bold text-[#1B1D60]">{sellerPackage.sellerName}</h4>
                  <p className="mt-0.5 text-[11px] font-semibold text-[#6F7480]">Item-wise status shown below</p>
                </div>
                <span className="inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#6F7480]">
                  {sellerPackage.items.length} item{sellerPackage.items.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="divide-y divide-[#F1E8D5]">
                {sellerPackage.items.map((packageItem, index) => {
                  const itemStatus = resolveOrderItemDisplayStatus(packageItem, sellerPackage.status, shipments, fulfillmentGroups, order?.relations?.cancellations || order?.cancellations || []);
                  const shipment = findShipmentForOrderItem(shipments, packageItem);
                  const trackingNumber = shipment?.tracking_number || shipment?.trackingNumber || shipment?.awb_number || shipment?.awbNumber;
                  const courierName = shipment?.courier_name || shipment?.courierName || shipment?.provider;
                  const itemImage = getOrderCardImage(packageItem);
                  const itemTotal = packageItem.line_total ?? packageItem.lineTotal ?? (Number(packageItem.unit_price || packageItem.unitPrice || 0) * Number(packageItem.quantity || 0));
                  return (
                    <Link key={packageItem.id || packageItem._id || index} to={`/orders/${id}?orderItemId=${encodeURIComponent(getOrderItemId(packageItem))}`} className="grid grid-cols-[48px_minmax(0,1fr)] gap-3 px-4 py-3 transition hover:bg-[#FFFCF6] sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center">
                      <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border border-[#EFE5D2] bg-white">
                        {itemImage ? <img src={itemImage} alt="" className="h-full w-full object-contain p-1" /> : <Package size={20} className="text-[#D9CBAE]" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-[#2E2E2E]">{getProductTitle(packageItem)}</span>
                        <span className="mt-1 block text-xs font-medium text-[#6F7480]">Qty {Number(packageItem.quantity || 0)} · {formatMoney(itemTotal, currency)}</span>
                        {(courierName || trackingNumber) && (
                          <span className="mt-1 block truncate text-[11px] font-semibold text-[#3E4093]">
                            {courierName ? humanize(courierName, "Courier") : "Tracking"}{trackingNumber ? ` · ${trackingNumber}` : ""}
                          </span>
                        )}
                      </span>
                      <span className="col-span-2 flex flex-wrap items-center justify-between gap-2 sm:col-span-1 sm:justify-end">
                        <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold capitalize ${COMPACT_STATUS_BADGE[itemStatus] || "bg-[#EEF2FF] text-[#1B1D60]"}`}>
                          {humanize(itemStatus, "Processing")}
                        </span>
                        <span className="text-xs font-bold text-[#3E4093]">View item details</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}

