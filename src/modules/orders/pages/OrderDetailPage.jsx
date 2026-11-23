import CancelOrderModal from "../components/CancelOrderModal";
import ApiState from "../../../components/ui/ApiState";
import { SKELETON_PRESETS } from "../../../components/ui/skeleton/skeletonPresets";
import Seo from "../../../components/ui/Seo";
import Breadcrumbs from "../../common/components/Breadcrumbs";
import StickySidebarLayout from "../../../components/ui/layout/StickySidebarLayout";
import OrderItemsSection from "../components/OrderItemsSection";
import OrderPaymentSummary from "../components/OrderPaymentSummary";
import { useOrderDetail } from "../controllers/useOrderDetail";
import { DynamicButton } from "../../../components/ui/button";
import { FileText, Download } from "lucide-react";

import {
  getItemImage,
  getProductTitle,
  getItemProductPath,
  getOrderItemColor,
  getOrderItemId,
  getItemLineTotal,
  asNumber,
  canCancelOrder,
} from "../../../utils/pages/orderUtils";

import { formatMoney } from "../../../utils/ecommerce";
import { PageContainer } from "../../../components/ui/layout";
export default function OrderDetailPage({ orderId }) {
  const {
    state,
    order,
    orderNumber,
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
    canRequestReturn,
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
      <Seo title={`Order ${orderNumber || "Details"} | Sam Global`} />
      <PageContainer>
        <ApiState
          loading={state.loading && !order}
          error={state.error}
          empty={!order}
          skeletonLayout={SKELETON_PRESETS.ORDER_DETAIL_PAGE}
        >
          <div className="grid ">
            <section className="grid gap-4 sm:gap-8 mb-2">
              <Breadcrumbs
                items={breadcrumbItems}
                copyLastItem
                copyValue={orderNumber}
              />
            </section>

            <StickySidebarLayout
              sidebarPosition="right"
              containerClass="w-full flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8"
              sidebarClass="w-full lg:w-[320px] xl:w-[350px] 2xl:w-[380px]"
              mainClass=" w-full flex min-w-0 flex-1 flex-col"
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
                  canCancelOrder={canCancelOrder}
                  retrying={retrying}
                  handleRetryPayment={handleRetryPayment}
                  openCancellation={openCancellation}
                  hasCancellableQuantity={hasCancellableQuantity}
                  canRequestReturn={canRequestReturn}
                  selectedItemCanReturn={selectedItemCanReturn}
                  getOrderItemId={getOrderItemId}
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
                        const isDelivered = [
                          "delivered",
                          "completed",
                          "partially_delivered",
                        ].includes(String(status).toLowerCase());
                        if (doc.type === "order_receipt" && !isDelivered) {
                          return false;
                        }
                        return (
                          doc.type === "platform_fee" ||
                          doc.type === "order_receipt"
                        );
                      });
                      if (globalDocuments.length === 0) return null;

                      return (
                        <div className="flex flex-col gap-3 p-4 rounded-lg border border-[#E7D9B8] bg-[#FFFDF8]">
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
                                  <span className="font-semibold text-sm text-[#2E2E2E] truncate">
                                    {document.title}
                                  </span>
                                </div>
                                <DynamicButton
                                  variant="outlineSecondary"
                                  size="sm"
                                  shape="rounded"
                                  disabled={
                                    document.pending || !document.downloadPath
                                  }
                                  loading={
                                    downloadingId === document.downloadPath
                                  }
                                  onClick={() =>
                                    handleDownload(
                                      document.downloadPath,
                                      document.filename,
                                    )
                                  }
                                  className="shrink-0"
                                >
                                  <Download size={14} />
                                  {document.pending ? "Pending" : "Download"}
                                </DynamicButton>
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
      </PageContainer>

      <CancelOrderModal
        open={cancelModalOpen}
        state={state}
        selectedOrderItem={selectedOrderItem}
        items={items}
        cancellations={cancellations}
        cancelItems={cancelItems}
        setCancelItems={setCancelItems}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        cancelReasonError={cancelReasonError}
        setCancelReasonError={setCancelReasonError}
        cancelReasonCode={cancelReasonCode}
        setCancelReasonCode={setCancelReasonCode}
        setCancelModalOpen={setCancelModalOpen}
        handleCancelOrder={handleCancelOrder}
        currency={currency}
      />
    </>
  );
}
