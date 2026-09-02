import { Link } from "react-router-dom";
import { MdOutlineShoppingCart } from "react-icons/md";
import {
  IndianRupee,
  RotateCcw,
  ReceiptText,
  RefreshCw,
  XCircle,
  FileText,
  Download,
} from "lucide-react";

import ApiState from "../../../components/ui/ApiState";
import Seo from "../../../components/ui/Seo";
import Button from "../../../components/ui/buttons/Button";
import ConfirmModal from "../../../components/ui/overlay/ConfirmModal";
import Breadcrumbs from "../../common/components/Breadcrumbs";
import StickySidebarLayout from "../../../components/ui/layout/StickySidebarLayout";
import CustomDropdown from "../../../components/ui/CustomDropdown";
import OrderItemsSection from "../components/OrderItemsSection";
import OrderPaymentSummary from "../components/OrderPaymentSummary";
import OrderDetailInfoGrid from "../components/OrderDetailInfoGrid";
import { useOrderDetail } from "../controllers/useOrderDetail";

import {
  getOrderNumber,
  getItemImage,
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
    order,
    items,
    cancellations,
    visibleCancellations,
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
    returnEligibleUntil,
    returnWindowOpen,
    selectedOrderItem,
    selectedItemAmount,
    selectedItemReturnWindowOpen,
    selectedItemCanReturn,
    selectedItemReturnDeadline,
    visibleOrderItems,
    invoiceDownloadAvailable,
    customerInvoices,
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
    handleRetryPayment,
    handleDownload,
    handleCancelOrder,
    openCancellation,
    hasCancellableQuantity,
    getInvoiceUrl,
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
                  {(status === "pending_payment" ||
                    status === "payment_failed") && (
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
                      className="flex h-[46px] d sm:h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[#CE9F2D66] bg-[#FFFDF8] px-5 py-2.5 text-[#1B1D60] shadow-sm transition-all hover:bg-[#FFF9EA] hover:border-[#CE9F2D] active:scale-[0.98]"
                      onClick={openCancellation}
                    >
                      <XCircle size={18} className="text-[#CE9F2D]" />
                      <span className="text-center text-sm font-semibold">
                        {selectedOrderItem ? "Cancel item" : "Cancel order"}
                      </span>
                    </Button>
                  )}

                  {Boolean(selectedOrderItem) && selectedItemCanReturn && (
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
              containerClass="w-full flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8"
              sidebarClass="w-full lg:w-[320px] xl:w-[350px] 2xl:w-[380px]"
              mainClass="w-full flex min-w-0 flex-1 flex-col"
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
                  downloadableDocuments={downloadableDocuments}
                  visiblePendingSellerDocuments={visiblePendingSellerDocuments}
                  invoiceDownloadAvailable={invoiceDownloadAvailable}
                  customerInvoices={customerInvoices}
                  getInvoiceUrl={getInvoiceUrl}
                  downloadingId={downloadingId}
                  handleDownload={handleDownload}
                />
              }
              sidebarContent={
                (subtotal !== undefined || items.length > 0) && (
                  <div className="flex flex-col gap-4">
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
                    {(() => {
                      const globalDocuments = (
                        downloadableDocuments || []
                      ).filter((doc) => {
                        if (visibleOrderItems.length <= 1) {
                          return false;
                        }
                        return (
                          doc.type === "platform_fee" ||
                          doc.type === "order_receipt"
                        );
                      });
                      if (globalDocuments.length === 0) return null;

                      return (
                        <div className="flex flex-col gap-3 p-4 rounded-xl border border-[#E7D9B8] bg-[#FFFDF8]">
                          <h4 className="font-bold text-[#1B1D60] mb-1 flex items-center gap-2 text-sm">
                            <FileText size={16} className="text-[#3E4093]" />{" "}
                            Order Documents
                          </h4>
                          <div className="flex flex-col gap-2">
                            {globalDocuments.map((document) => (
                              <div
                                key={`${document.title}-${document.id}`}
                                className="flex items-center justify-between gap-3 rounded-lg border border-[#CE9F2D40] bg-white px-3 py-2 text-sm transition-all hover:border-[#CE9F2D80]"
                              >
                                <div className="min-w-0 flex items-center gap-1.5">
                                  <span className="font-semibold text-[13px] text-[#2E2E2E] truncate">
                                    {document.title}
                                  </span>
                                </div>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  loading={
                                    downloadingId === document.downloadPath
                                  }
                                  onClick={() =>
                                    handleDownload(
                                      document.downloadPath,
                                      document.filename,
                                    )
                                  }
                                  className="border-[#CE9F2D] font-semibold text-[#1B1D60] hover:bg-[#FFF9EA] h-7 text-xs px-3 shrink-0"
                                >
                                  <Download size={12} /> Download
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )
              }
            />
          </div>
        </ApiState>
      </div>
      <ConfirmModal
        open={cancelModalOpen}
        title={selectedOrderItem ? "Cancel order?" : "Cancel order?"}
        description={
          <span>
            {selectedOrderItem
              ? "You can cancel this item before it is shipped.\nNo cancellation is processed before approval."
              : "You can cancel items before they are shipped.\nNo cancellation is processed before approval."}
            <br />
            <span className="text-xs mt-1 block">
              Read our{" "}
              <Link
                to="/refund-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#CE9F2D] hover:text-[#A96F14] hover:underline font-bold transition-colors"
              >
                Cancellation Policy
              </Link>
            </span>
          </span>
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
          <div className="grid gap-2 rounded-xl border border-[#E7D9B8] bg-[#FFFDF9] p-3">
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
              const imgSrc = getItemImage(item);
              const color = getOrderItemColor(item);
              const price = getItemLineTotal(item);

              return (
                <div
                  key={itemId}
                  className="flex items-center gap-3 rounded-xl  bg-white "
                >
                  {/* Checkbox (multi-item mode only) */}
                  {!selectedOrderItem && (
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={remaining <= 0 || state.loading}
                      aria-label={`Select ${getProductTitle(item)} for cancellation`}
                      className="h-4 w-4 shrink-0 rounded border-gray-300 accent-[#CE9F2D]"
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

                  {/* Product image */}
                  {imgSrc && (
                    <img
                      src={imgSrc}
                      alt={getProductTitle(item)}
                      className="h-[60px] w-[60px] shrink-0 rounded-lg object-cover"
                    />
                  )}

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-bold text-[#1B1D60]">
                      {getProductTitle(item)}
                    </p>
                    <p className="mt-0.5 text-xs text-[#5F6078]">
                      {color && color !== "N/A" ? `Color: ${color}` : ""}
                    </p>
                    {price > 0 && (
                      <p className="mt-1 text-sm font-bold text-[#1B1D60]">
                        {formatMoney(price, currency)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {!Object.values(cancelItems).some(
              (quantity) => Number(quantity) > 0,
            ) &&
              !selectedOrderItem && (
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
