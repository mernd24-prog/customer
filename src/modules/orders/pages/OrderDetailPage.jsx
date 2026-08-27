import { Link } from "react-router-dom";
import { MdOutlineShoppingCart } from "react-icons/md";
import { IndianRupee, RotateCcw, ReceiptText, RefreshCw, XCircle } from "lucide-react";

import ApiState from "../../../components/ui/ApiState";
import Seo from "../../../components/ui/Seo";
import Button from "../../../components/ui/buttons/Button";
import ConfirmModal from "../../../components/ui/overlay/ConfirmModal";
import Breadcrumbs from "../../../components/ecommerce/Breadcrumbs";
import StickySidebarLayout from "../../../components/ui/layout/StickySidebarLayout";
import CustomDropdown from "../../../components/ui/CustomDropdown";
import DetailSectionCard from "../../../components/ui/layout/DetailSectionCard";
import OrderItemsSection from "../components/OrderItemsSection";
import OrderPaymentSummary from "../components/OrderPaymentSummary";
import OrderDetailInfoGrid from "../components/OrderDetailInfoGrid";

import { useOrderDetail } from "../controllers/useOrderDetail";
import OrderCancellations from "../components/OrderCancellations";
import OrderDocuments from "../components/OrderDocuments";
import OrderActions from "../components/OrderActions";

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
  canCancelOrder,
} from "../../../utils/pages/orderUtils";

import { formatMoney } from "../../../utils/ecommerce";

export default function OrderDetailPage({ orderId }) {
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

    selectedOrderItem,
    selectedItemReturn,
    selectedItemStatus,
    selectedItemAmount,
    visibleShipments,
    selectedItemReturnWindowOpen,
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
    cancelReasonError,
    cancelReasonCode,
    cancelItems,
    downloadingId,
    retrying,
    setCancelModalOpen,
    setCancelReason,
    setCancelReasonError,
    setCancelReasonCode,
    setCancelItems,
    setDownloadingId,
    handleRetryPayment,
    handleDownload,
    handleCancelOrder,
    openCancellation,
    hasCancellableQuantity,
    getInvoiceUrl,
    getReturnRefundAmount,
    getReturnItemTitle,
    getReturnItemQuantity,
    getReturnNumber,
    isCodOrder,
    visibleReturns,
    visiblePendingSellerDocuments,
  } = useOrderDetail({ orderId });
  return (
    <>
      <Seo title={`Order ${getOrderNumber(order) || "Details"} | Sam Global`} />
      <div className="mx-auto w-full max-w-[1740px]  px-4 sm:px-6 lg:px-8">
        <ApiState
          loading={state.loading && !order}
          error={state.error}
          empty={!order}
        >
          <div className="grid gap-5 sm:gap-6 lg:gap-9">
            <section className="grid gap-4 sm:gap-8">
              <div className="flex flex-col gap-4  items-center mt-8 md:flex-row  justify-between">
                <div>
                  <Breadcrumbs items={breadcrumbItems} />
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap items-center md:w-auto md:justify-end">
                  {(status === "pending_payment" || status === "payment_failed") && (
                    <Button
                      className="flex h-[54px] w-full sm:w-auto items-center justify-center gap-[10px] rounded-[10px] px-[24px] py-[15px] text-white"
                      loading={retrying}
                      onClick={handleRetryPayment}
                    >
                      <RefreshCw size={18} />
                      <span className="text-center text-[14px] sm:text-[15px] font-semibold leading-[20px] sm:leading-[24px]">
                        Retry payment
                      </span>
                    </Button>
                  )}

                  {canCancelOrder(order) && hasCancellableQuantity && (
                    <Button
                      variant="secondary"
                      className="flex h-[54px] w-full sm:w-auto items-center justify-center gap-[10px] rounded-[10px] border border-[#CE9F2D] px-[24px] py-[15px] text-[#1B1D60] hover:bg-[#FFF9EA]"
                      onClick={openCancellation}
                    >
                      <XCircle size={18} className="text-red-500" />
                      <span className="text-center text-[14px] sm:text-[15px] font-semibold leading-[20px] sm:leading-[24px]">
                        {selectedOrderItem ? "Cancel item" : "Cancel order"}
                      </span>
                    </Button>
                  )}

                  {Boolean(selectedOrderItem) &&
                    selectedItemCanReturn && (
                      <Link
                        to={`/returns/request/${orderId}?orderItemId=${encodeURIComponent(getOrderItemId(selectedOrderItem))}`}
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

              {["delivered", "fulfilled", "partially_returned"].includes(
                  status,
                ) &&
                !returnWindowOpen && (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    All eligible item return windows closed by{" "}
                    {formatOrderDate(returnEligibleUntil)}.
                  </p>
                )}
            </section>

              <StickySidebarLayout
                sidebarPosition="right"
                containerClass="flex flex-col xl:flex-row gap-4 md:gap-6 xl:gap-8"
                sidebarClass="w-full xl:w-[320px] 2xl:w-[380px]"
                mainContent={
                  <OrderItemsSection
                    items={visibleOrderItems}
                    order={order}
                    selectedOrderItem={selectedOrderItem}
                    orderId={orderId}
                    orderStatus={status}
                    shipments={shipments}
                    sellerFulfillmentGroups={
                      order?.relations?.sellerFulfillmentGroups || []
                    }
                    returns={visibleReturns}
                    cancellations={visibleCancellations}
                    currency={currency}
                    getItemImage={getItemImage}
                    getProductTitle={getProductTitle}
                    getItemProductPath={getItemProductPath}
                    getOrderItemColor={getOrderItemColor}
                    getItemLineTotal={getItemLineTotal}
                    formatMoney={formatMoney}
                    isCodOrder={isCodOrder}
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



            <OrderDocuments
                downloadableDocuments={downloadableDocuments}
                visiblePendingSellerDocuments={visiblePendingSellerDocuments}
                invoiceDownloadAvailable={invoiceDownloadAvailable}
                customerInvoices={customerInvoices}
                getInvoiceUrl={getInvoiceUrl}
                downloadingId={downloadingId}
                handleDownload={handleDownload}
                order={order}
                selectedOrderItem={selectedOrderItem}
                orderItems={items}
              />
          </div>
        </ApiState>
      </div>
      <ConfirmModal
        open={cancelModalOpen}
        title={
          selectedOrderItem
            ? "Request item cancellation?"
            : "Request cancellation?"
        }
        description={
          selectedOrderItem
            ? "Cancel this complete product line for seller/admin approval. No refund or cancellation is processed before approval."
            : "Select the products to cancel. All remaining units of each selected product will be cancelled after approval."
        }
        confirmLabel={
          state.loading ? "Submitting..." : "Submit cancellation request"
        }
        confirmDisabled={
          state.loading ||
          !Object.values(cancelItems).some((quantity) => Number(quantity) > 0)
        }
        cancelLabel={selectedOrderItem ? "Keep item" : "Keep order"}
        onCancel={() => {
          if (!state.loading) setCancelModalOpen(false);
        }}
        onConfirm={handleCancelOrder}
      >
        <div className="grid gap-4">
          <div className="grid gap-3 rounded-xl border border-[#E7D9B8] bg-[#FFFDF9] p-3.5 sm:p-4">
            <p className="text-sm font-bold text-[#1B1D60]">
              Select products
            </p>
            {(selectedOrderItem ? [selectedOrderItem] : items).map((item) => {
              const itemId = String(getOrderItemId(item));
              const pendingQuantity = cancellations
                .filter(
                  (request) =>
                    !["completed", "failed", "rejected"].includes(
                      String(request.status || "").toLowerCase(),
                    ),
                )
                .flatMap((request) => request.items || [])
                .filter(
                  (entry) =>
                    String(entry.orderItemId || entry.order_item_id || "") ===
                    itemId,
                )
                .reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);
              const remaining = Math.max(
                Number(item.quantity || 0) -
                  Number(
                    item.cancelled_quantity || item.cancelledQuantity || 0,
                  ) -
                  pendingQuantity,
                0,
              );
              const selected = Object.prototype.hasOwnProperty.call(
                cancelItems,
                itemId,
              );
              return (
                <div
                  key={itemId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#E2E3EA] bg-white p-3 text-sm transition hover:border-[#CE9F2D66]"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {!selectedOrderItem && (
                      <input
                        type="checkbox"
                        checked={selected}
                        disabled={remaining <= 0 || state.loading}
                        aria-label={`Select ${getProductTitle(item)} for cancellation`}
                        className="h-4 w-4 rounded border-gray-300 text-[#CE9F2D]"
                        onChange={(event) =>
                          setCancelItems((current) => {
                            const next = { ...current };
                            if (event.target.checked) next[itemId] = remaining;
                            else delete next[itemId];
                            return next;
                          })
                        }
                      />
                    )}
                    <span className="min-w-0 flex-1 line-clamp-2 font-semibold text-[#1B1D60]">
                      {getProductTitle(item)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${selected ? "bg-red-50 text-red-700" : "bg-[#F4F4F7] text-[#5F6078]"}`}>
                      {selected
                        ? `Cancel all ${remaining} unit${remaining === 1 ? "" : "s"}`
                        : `${remaining} unit${remaining === 1 ? "" : "s"}`}
                    </span>
                    {pendingQuantity > 0 && (
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        {pendingQuantity} pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {!Object.values(cancelItems).some(
              (quantity) => Number(quantity) > 0,
            ) && (
              <p className="text-xs font-semibold text-red-600">
                Select at least one product.
              </p>
            )}
          </div>
          <div className="grid gap-1.5">
            <span className="text-sm font-bold text-[#1B1D60]">
              Reason for cancellation
            </span>
            <CustomDropdown
              options={[
                { value: "changed_mind", label: "Changed my mind" },
                { value: "ordered_by_mistake", label: "Ordered by mistake" },
                { value: "address_issue", label: "Address issue" },
                { value: "payment_issue", label: "Payment issue" },
                { value: "delivery_delay", label: "Delivery delay" },
                { value: "other", label: "Other" },
              ]}
              value={cancelReasonCode}
              onChange={(val) => {
                setCancelReasonCode(val);
                if (cancelReasonError) setCancelReasonError(false);
              }}
              placeholder="Select reason"
              buttonClassName="h-11 rounded-lg border-[#DCDDE5] text-sm font-medium text-[#1B1D60]"
            />
          </div>
          <div className="grid gap-1.5">
            <span className="text-sm font-bold text-[#1B1D60]">
              Additional details
            </span>
            <textarea
              className={`min-h-[96px] w-full resize-none rounded-lg border p-3 text-sm font-medium text-[#1B1D60] focus:outline-none transition placeholder:text-[#8C8E9E]  ${
                cancelReasonError ? "border-red-600" : "border-[#DCDDE5]"
              }`}
              value={cancelReason}
              onChange={(event) => {
                setCancelReason(event.target.value);
                if (cancelReasonError) setCancelReasonError(false);
              }}
              maxLength={500}
              placeholder="Tell us why you are cancelling *"
            />
          </div>

          {(cancelReasonError ||
            (cancelReason.trim().length > 0 &&
              cancelReason.trim().length < 10)) && (
            <p className="text-xs font-semibold text-red-600">
              Please enter at least 10 characters.
            </p>
          )}
        </div>
      </ConfirmModal>
    </>
  );
}
