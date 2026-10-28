import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import ConfirmModal from "../../../components/ui/overlay/ConfirmModal";
import CustomDropdown from "../../../components/ui/CustomDropdown";

import {
  getItemImage,
  getProductTitle,
  getOrderItemColor,
  getOrderItemId,
  getItemLineTotal,
} from "../../../utils/pages/orderUtils";

import { formatMoney } from "../../../utils/ecommerce";

export default function CancelOrderModal({
  open,
  state,
  orderId,
  selectedOrderItem,
  items,
  cancellations,
  cancelItems,
  setCancelItems,
  cancelReason,
  setCancelReason,
  cancelReasonError,
  setCancelReasonError,
  cancelReasonCode,
  setCancelReasonCode,
  setCancelModalOpen,
  handleCancelOrder,
  currency,
}) {
  const selectedItems = selectedOrderItem ? [selectedOrderItem] : items;

  const hasSelectedQuantity = Object.values(cancelItems).some(
    (quantity) => Number(quantity) > 0,
  );

  return (
    <ConfirmModal
      open={open}
      title="Cancel order?"
      description={
        <span>
          {selectedOrderItem
            ? "You can cancel this item before it is shipped. No cancellation is processed before approval."
            : "You can cancel items before they are shipped. No cancellation is processed before approval."}
          <span className="mt-1 block text-xs">
            Read our{" "}
            <Link
              to="/refund-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-gold transition-colors hover:text-[#A96F14] hover:underline"
            >
              Cancellation Policy
            </Link>
          </span>
        </span>
      }
      confirmLabel={
        state.loading ? "Submitting..." : "Submit cancellation request"
      }
      confirmDisabled={state.loading || !hasSelectedQuantity}
      cancelLabel={selectedOrderItem ? "Keep item" : "Keep order"}
      onCancel={() => {
        if (!state.loading) setCancelModalOpen(false);
      }}
      onConfirm={handleCancelOrder}
    >
      <div className="grid min-h-0 gap-4">
        {/* Scrollable content keeps the modal actions accessible. */}
        <div className="grid min-h-0 max-h-[45dvh] gap-3 overflow-y-auto overscroll-contain pr-1 sm:max-h-[42dvh]">
          <div className="grid gap-2 rounded-xl border border-border bg-[#FFFDF9] p-2.5 sm:p-3">
            {selectedItems.map((item) => {
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
                    String(
                      entry.orderItemId || entry.order_item_id || "",
                    ) === itemId,
                )
                .reduce(
                  (sum, entry) => sum + Number(entry.quantity || 0),
                  0,
                );

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
                  className="flex min-w-0 items-center gap-2.5 rounded-xl bg-white p-1.5 sm:gap-3"
                >
                  {!selectedOrderItem && (
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={remaining <= 0 || state.loading}
                      aria-label={`Select ${getProductTitle(item)} for cancellation`}
                      className="h-4 w-4 shrink-0 accent-[#CE9F2D]"
                      onChange={(event) =>
                        setCancelItems((current) => {
                          const next = { ...current };

                          if (event.target.checked) {
                            next[itemId] = remaining;
                          } else {
                            delete next[itemId];
                          }

                          return next;
                        })
                      }
                    />
                  )}

                  {imgSrc && (
                    <img
                      src={imgSrc}
                      alt={getProductTitle(item)}
                      className="h-12 w-12 shrink-0 rounded-lg object-cover sm:h-[60px] sm:w-[60px]"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 break-words text-xs font-bold leading-5 text-navy sm:text-sm">
                      {getProductTitle(item)}
                    </p>

                    {color && color !== "N/A" && (
                      <p className="mt-0.5 truncate text-xs text-[#5F6078]">
                        Color: {color}
                      </p>
                    )}

                    {price > 0 && (
                      <p className="mt-1 text-sm font-bold text-navy">
                        {formatMoney(price, currency)}
                      </p>
                    )}

                    {remaining <= 0 && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        No cancellable quantity remaining
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!selectedOrderItem && !hasSelectedQuantity && (
            <p className="text-xs font-semibold text-red-600">
              Select at least one product.
            </p>
          )}
        </div>

        <div className="grid min-w-0 gap-1.5">
          <label
            htmlFor="cancel-reason"
            className="text-sm font-bold text-navy"
          >
            Reason for cancellation
          </label>

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
            onChange={(value) => {
              setCancelReasonCode(value);
              if (cancelReasonError) setCancelReasonError(false);
            }}
            placeholder="Select reason"
            buttonClassName="h-11 rounded-lg border-[#DCDDE5] text-sm font-medium text-navy"
          />
        </div>

        <div className="grid min-w-0 gap-1.5">
          <label
            htmlFor="cancel-additional-details"
            className="text-sm font-bold text-navy"
          >
            Additional details
          </label>

          <textarea
            id="cancel-additional-details"
            className={`min-h-20 w-full resize-y rounded-lg border p-3 text-sm font-medium text-navy transition placeholder:text-[#8C8E9E] focus:outline-none ${
              cancelReasonError
                ? "border-red-600"
                : "border-[#DCDDE5]"
            }`}
            value={cancelReason}
            onChange={(event) => {
              setCancelReason(event.target.value);
              if (cancelReasonError) setCancelReasonError(false);
            }}
            maxLength={500}
            placeholder="Tell us why you are cancelling *"
          />

          {(cancelReasonError ||
            (cancelReason.trim().length > 0 &&
              cancelReason.trim().length < 10)) && (
            <p className="text-xs font-semibold text-red-600">
              Please enter at least 10 characters.
            </p>
          )}
        </div>
      </div>
    </ConfirmModal>
  );
}