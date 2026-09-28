import { formatMoney } from "../../../utils/ecommerce";
import DetailSectionCard from "../../../components/ui/layout/DetailSectionCard";

export default function OrderCancellations({ cancellations, currency, isCodOrder }) {
  if (!cancellations || !cancellations.length) return null;
  return (
    <DetailSectionCard
      title="Cancellation and refund status"
      headerClassName="!min-h-[60px] !py-4"
      titleClassName="text-lg font-bold"
      bodyClassName="p-5"
    >
      <div className="grid gap-3">
        {cancellations.map((cancellation) => {
          const scenario = cancellation.metadata?.refundPolicyScenario;
          const isRtoCancellation = Boolean(
            cancellation.metadata?.rtoSettlement ||
              cancellation.reason_code === "shipment_rto" ||
              scenario === "rtoDeliveryFailed",
          );
          const isSellerOrRtoCancellation = Boolean(
            cancellation.metadata?.sellerSupplyCancellation ||
              isRtoCancellation ||
              scenario === "sellerCancellation",
          );
          const shippingRefund = Number(
            cancellation.metadata?.shippingRefundAmount || 0,
          );
          const platformFeeRefund = Number(
            cancellation.metadata?.platformFeeRefundAmount || 0,
          );
          const refundStatus = String(
            cancellation.refund_status || "pending",
          ).replace(/_/g, " ");
          return (
            <div
              key={cancellation.id}
              className="rounded-[6px] border border-border bg-surface px-3 py-3 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>
                  {isRtoCancellation
                    ? "Delivery could not be completed"
                    : isSellerOrRtoCancellation
                      ? "Cancelled by seller"
                      : cancellation.cancellation_number}
                </strong>
                <span className="capitalize text-muted">
                  {String(cancellation.status || "requested").replace(/_/g, " ")}
                </span>
              </div>
              <p className="mt-1 text-muted">{cancellation.reason}</p>
              {isSellerOrRtoCancellation && (
                <p className="mt-2 rounded-[6px] bg-blue-50 px-3 py-2 text-xs text-blue-700">
                  {isRtoCancellation
                    ? "The delivery partner could not complete this delivery and the item is being returned to the seller."
                    : "The seller could not fulfil this item."} This was not
                  caused by you, and no action is required. All eligible
                  customer-paid charges are included in your refund.
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted">
                <span>
                  Refund:{" "}
                  {formatMoney(cancellation.refund_amount, currency)}
                </span>
                <span>
                  Refund status: {refundStatus}
                </span>
                {(cancellation.credit_note_id ||
                  cancellation.creditNoteId) && (
                  <span>
                    Reverse invoice: available in Order documents
                  </span>
                )}
              </div>
              {isSellerOrRtoCancellation &&
                (shippingRefund > 0 || platformFeeRefund > 0) && (
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 rounded-[6px] bg-green-50 px-3 py-2 text-xs text-green-800">
                    {shippingRefund > 0 && (
                      <span>
                        Delivery fee returned: {formatMoney(shippingRefund, currency)}
                      </span>
                    )}
                    {platformFeeRefund > 0 && (
                      <span>
                        Platform fee returned: {formatMoney(platformFeeRefund, currency)}
                      </span>
                    )}
                  </div>
                )}
              <div className="mt-2 space-y-1 text-xs text-muted">
                {(cancellation.items || []).map((item) => (
                  <div key={item.orderItemId || item.order_item_id}>
                    {item.productTitle || item.product_title || "Product"} (Qty: {item.quantity})
                  </div>
                ))}
              </div>
              {cancellation.status === "rejected" && cancellation.metadata?.rejectionReason && (
                <p className="mt-2 rounded-[6px] bg-red-50 px-3 py-2 text-xs text-red-700">
                  Rejection reason: {cancellation.metadata.rejectionReason}
                </p>
              )}
              {isCodOrder && cancellation.status !== "rejected" && cancellation.refund_status !== "not_required" && (
                <p className="mt-2 rounded-[6px] bg-[#FFF7E6] px-3 py-2 text-xs text-[#8A5A00]">
                  COD refund: after approval, the refund is completed
                  through the marketplace COD refund process. No
                  Razorpay gateway refund is created for COD payment.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </DetailSectionCard>
  );
}
