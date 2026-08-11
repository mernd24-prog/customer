import { Link } from "react-router-dom";
import { MdOutlineShoppingCart } from "react-icons/md";
import { IndianRupee, RotateCcw, ReceiptText } from "lucide-react";

import ApiState from "../../../components/common/ApiState";
import Seo from "../../../components/common/Seo";
import Button from "../../../components/ui/Button";
import ConfirmModal from "../../../components/common/overlay/ConfirmModal";
import Breadcrumbs from "../../../components/ecommerce/Breadcrumbs";
import StickySidebarLayout from "../../../components/common/layouts/StickySidebarLayout";
import OrderDetailSectionCard from "./OrderDetailSectionCard";
import OrderItemsSection from "./OrderItemsSection";
import OrderPaymentSummary from "./OrderPaymentSummary";
import OrderProgress from "./OrderProgress";
import ShipmentTrackingPanel from "./ShipmentTrackingPanel";
import OrderDetailInfoGrid from "../../../components/orderDetailInfoGrid/orderDetailInfoGrid";

import { useOrderDetail } from "../hooks/useOrderDetail";
import OrderCancellations from "./OrderCancellations";
import OrderReturns from "./OrderReturns";
import OrderDocuments from "./OrderDocuments";
import OrderActions from "./OrderActions";

import {
  getOrderNumber,
  getDeliveryStatus,
  hasKnownStatus,
  getItemImage,
  getOrderCurrency,
  getProductTitle,
  getItemProductPath,
  formatOrderDate,
  getOrderItemColor,
  getOrderItemId,
  getItemLineTotal,
  asNumber,
  canCancelOrder
} from "../utils/orderUtils";

import { formatMoney } from "../../../utils/ecommerce";


export default function OrderDetail({ orderId, track }) {
    const {
    state,
    notificationState,
    order,
    items,
    cancellations,
    visibleCancellations,
    returns,
    shipments,
    currency,
    subtotal,
    discount,
    walletDiscount,
    shipping,
    customerPlatformFeeBase,
    customerPlatformFeeTax,
    pricingSummary,
    customerAmount,
    status,
    progressStatus,
    returnEligibleUntil,
    returnWindowOpen,
    canRequestReturn,
    selectedOrderItem,
    selectedItemReturn,
    selectedItemStatus,
    selectedItemAmount,
    selectedItemShipment,
    visibleShipments,
    selectedItemReturnWindowOpen,
    selectedItemReturnableQuantity,
    selectedItemReturnedQuantity,
    selectedItemCanReturn,
    selectedItemReturnDeadline,
    visibleOrderItems,
    invoiceDownloadAvailable,
    customerInvoices,
    orderReceipt,
    customerFeeInvoice,
    pendingSellerDocuments,
    downloadableDocuments,
    breadcrumbItems,
    cancelModalOpen,
    cancelReason,
    cancelReasonCode,
    cancelItems,
    downloadingId,
    retrying,
    setCancelModalOpen,
    setCancelReason,
    setCancelReasonCode,
    setCancelItems,
    setDownloadingId,
    handleRetryPayment,
    handleDownload,
    handleCancelOrder,
    openCancellation,
    getInvoiceUrl,
    getReturnRefundAmount,
    getReturnItemTitle,
    getReturnItemQuantity,
    getReturnNumber,
    isCodOrder,
    visibleReturns,
    visiblePendingSellerDocuments
  } = useOrderDetail({ orderId, track });
return (
    <>
      <Seo title={`Order ${getOrderNumber(order) || "Details"} | Sam Global`} />
      <div className="mx-auto w-full max-w-[1740px] px-4 sm:px-6 lg:px-8">
        <ApiState
          loading={state.loading && !order}
          error={state.error}
          empty={!order}
        >
          <div className="grid gap-5 sm:gap-6 lg:gap-9">
            <section className="grid gap-4 sm:gap-8">
              <div className="flex flex-col gap-4  items-center mt-8 md:flex-row  justify-between">
                <div>
                  <Breadcrumbs
                    items={breadcrumbItems}
                  />
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap items-center md:w-auto md:justify-end">
                  {!track &&
                    (selectedOrderItem
                      ? selectedItemCanReturn
                      : canRequestReturn) && (
                      <Link
                        to={`/returns/request/${orderId}${selectedOrderItem ? `?orderItemId=${encodeURIComponent(getOrderItemId(selectedOrderItem))}` : ""}`}
                        className="block w-full sm:w-auto"
                      >
                        <Button className="flex h-[54px] w-full sm:w-[196px] items-center justify-center gap-[10px] rounded-[10px] bg-[#CE9F2D] px-[24px] py-[15px] text-white hover:bg-[#B88200]">
                          <RotateCcw size={18} />
                          <span className="text-center text-[14px] sm:text-[15px] font-semibold leading-[20px] sm:leading-[24px] text-white">
                            Request Return
                          </span>
                        </Button>
                      </Link>
                    )}
                </div>
              </div>
              <OrderDetailInfoGrid
                items={[
                  {
                    icon: <MdOutlineShoppingCart size={20} />,
                    label: "Placed on",
                    value: formatOrderDate(
                      order?.created_at || order?.createdAt,
                    ),
                    tone: "blue",
                  },

                  {
                    icon: <IndianRupee size={20} />,
                    label: selectedOrderItem
                      ? "Selected item amount"
                      : "Order amount",
                    value: formatMoney(
                      selectedOrderItem ? selectedItemAmount : customerAmount,
                      currency,
                    ),
                    tone: "yellow",
                  },
                  ...((
                    selectedOrderItem
                      ? selectedItemReturnDeadline
                      : returnEligibleUntil
                  )
                    ? [
                        {
                          icon: <RotateCcw size={20} />,
                          label: selectedOrderItem
                            ? selectedItemReturnWindowOpen
                              ? "Selected item return deadline"
                              : "Selected item return closed"
                            : returnWindowOpen
                              ? "Latest item return deadline"
                              : "All return windows closed",
                          value: formatOrderDate(
                            selectedOrderItem
                              ? selectedItemReturnDeadline
                              : returnEligibleUntil,
                          ),
                          tone: (
                            selectedOrderItem
                              ? selectedItemReturnWindowOpen
                              : returnWindowOpen
                          )
                            ? "blue"
                            : "yellow",
                        },
                      ]
                    : []),
                ]}
              />

              {!track &&
                ["delivered", "fulfilled", "partially_returned"].includes(
                  status,
                ) &&
                !returnWindowOpen && (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    All eligible item return windows closed by{" "}
                    {formatOrderDate(returnEligibleUntil)}.
                  </p>
                )}

              {getDeliveryStatus(order) === "partially_delivered" && (
                <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  Part of your order has been delivered. Remaining seller
                  packages are still being prepared or shipped.
                </p>
              )}
            </section>

            {!track && (
              <StickySidebarLayout
                sidebarPosition="right"
                containerClass="flex flex-col xl:flex-row gap-4 md:gap-6 xl:gap-8"
                sidebarClass="w-full xl:w-[320px] 2xl:w-[380px]"
                mainContent={
                  <OrderItemsSection
                    items={visibleOrderItems}
                    orderId={orderId}
                    orderStatus={status}
                    shipments={shipments}
                    sellerFulfillmentGroups={
                      order?.relations?.sellerFulfillmentGroups || []
                    }
                    returns={visibleReturns}
                    currency={currency}
                    getItemImage={getItemImage}
                    getProductTitle={getProductTitle}
                    getItemProductPath={getItemProductPath}
                    getOrderItemColor={getOrderItemColor}
                    getItemLineTotal={getItemLineTotal}
                    formatMoney={formatMoney}
                  />
                }
                sidebarContent={
                  (subtotal !== undefined || items.length > 0) && (
                    <OrderPaymentSummary
                      variant="order"
                      subtotal={subtotal}
                      discount={discount}
                      discountFundingType={pricingSummary.discountFundingType}
                      sellerFundedDiscount={
                        pricingSummary.sellerFundedDiscountAmount
                      }
                      marketplaceFundedDiscount={
                        pricingSummary.marketplaceFundedDiscountAmount
                      }
                      paymentPartnerFundedDiscount={
                        pricingSummary.paymentPartnerFundedDiscountAmount
                      }
                      walletDiscount={walletDiscount}
                      shipping={shipping}
                      customerPlatformFee={customerPlatformFeeBase}
                      customerPlatformFeeTax={customerPlatformFeeTax}
                      customerAmount={customerAmount}
                      currency={currency}
                      formatMoney={formatMoney}
                      asNumber={asNumber}
                    />
                  )
                }
              />
            )}

            <section className="grid gap-4 sm:gap-8">
              {hasKnownStatus(order) && (
                <OrderDetailSectionCard
                  title={
                    selectedOrderItem
                      ? "Selected Item Progress"
                      : "Order Progress"
                  }
                  headerClassName="!min-h-[56px] !py-4"
                  bodyClassName="overflow-hidden px-4"
                  titleClassName="text-lg font-bold leading-none"
                >
                  <OrderProgress
                    status={selectedItemStatus || progressStatus}
                    cancellations={visibleCancellations}
                    returns={
                      selectedItemReturn
                        ? [selectedItemReturn]
                        : selectedOrderItem
                          ? []
                          : returns
                    }
                    timeline={
                      selectedOrderItem
                        ? selectedOrderItem.timeline || []
                        : order?.timeline || []
                    }
                  />
                </OrderDetailSectionCard>
              )}

              {(track || visibleShipments.length > 0) && (
                <ShipmentTrackingPanel
                  shipments={visibleShipments}
                  orderDeliveryStatus={getDeliveryStatus(order)}
                  notifications={
                    Array.isArray(notificationState.list)
                      ? notificationState.list
                      : []
                  }
                />
              )}
            </section>

            <OrderCancellations cancellations={visibleCancellations} currency={currency} />

            <OrderReturns visibleReturns={visibleReturns} currency={currency} getReturnRefundAmount={getReturnRefundAmount} getReturnItemTitle={getReturnItemTitle} getReturnItemQuantity={getReturnItemQuantity} getReturnNumber={getReturnNumber} isCodOrder={isCodOrder} selectedOrderItem={selectedOrderItem} />

            <OrderDocuments downloadableDocuments={downloadableDocuments} visiblePendingSellerDocuments={visiblePendingSellerDocuments} invoiceDownloadAvailable={invoiceDownloadAvailable} customerInvoices={customerInvoices} getInvoiceUrl={getInvoiceUrl} downloadingId={downloadingId} handleDownload={handleDownload} order={order} selectedOrderItem={selectedOrderItem} />

            <OrderActions order={order} status={status} canCancelOrder={canCancelOrder} retrying={retrying} handleRetryPayment={handleRetryPayment} openCancellation={openCancellation} selectedOrderItem={selectedOrderItem} />
          </div>
        </ApiState>
      </div>
      <ConfirmModal
        open={cancelModalOpen}
        title={selectedOrderItem ? "Cancel this item?" : "Cancel this order?"}
        description={
          selectedOrderItem
            ? "Only the selected item will be cancelled. Other active items and their shipment will continue normally."
            : "All remaining items will be cancelled and reserved inventory will be released. Any captured payment will be refunded according to the payment method."
        }
        confirmLabel={state.loading ? "Cancelling..." : selectedOrderItem ? "Cancel item" : "Cancel order"}
        cancelLabel={selectedOrderItem ? "Keep item" : "Keep order"}
        onCancel={() => setCancelModalOpen(false)}
        onConfirm={handleCancelOrder}
      >
        <div className="grid gap-3">
          <label className="text-sm font-medium text-ink">
            Reason
            <select
              className="mt-1 w-full focus:outline-none  rounded-[6px] border border-border bg-white px-3 py-2 "
              value={cancelReasonCode}
              onChange={(event) => setCancelReasonCode(event.target.value)}
            >
              <option value="changed_mind">Changed my mind</option>
              <option value="ordered_by_mistake">Ordered by mistake</option>
              <option value="address_issue">Address issue</option>
              <option value="payment_issue">Payment issue</option>
              <option value="delivery_delay">Delivery delay</option>
              <option value="other">Other</option>
            </select>
          </label>
          <textarea
            className="min-h-20 focus:outline-none  w-full rounded-[6px]  px-3 py-2 text-sm"
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            maxLength={500}
            placeholder="Tell us why you are cancelling"
          />

          {cancelReason.trim().length > 0 && cancelReason.trim().length < 3 && (
            <p className="text-xs text-red-600">
              Please enter at least 3 characters.
            </p>
          )}
        </div>
      </ConfirmModal>
    </>
  );
}
