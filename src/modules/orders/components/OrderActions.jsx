
import { Link } from "react-router-dom";
import { RefreshCw, XCircle, RotateCcw } from "lucide-react";
import Button from "../../../components/ui/buttons/Button";

export default function OrderActions({
  order,
  orderId,
  status,
  canCancelOrder,
  retrying,
  handleRetryPayment,
  openCancellation,
  selectedOrderItem,
  hasCancellableQuantity,
  canRequestReturn,
  selectedItemCanReturn,
  getOrderItemId,
}) {
  const normalizedStatus = String(status || "").toLowerCase();

  const hasRetryPayment = [
    "pending_payment",
    "payment_failed",
  ].includes(normalizedStatus);

  const hasCancelAction =
    typeof canCancelOrder === "function" &&
    canCancelOrder(order) &&
    Boolean(hasCancellableQuantity) &&
    !hasRetryPayment;

  const hasReturnAction =
    (Boolean(selectedOrderItem) && Boolean(selectedItemCanReturn)) ||
    (!selectedOrderItem && Boolean(canRequestReturn));

  if (!hasRetryPayment && !hasCancelAction && !hasReturnAction) {
    return null;
  }

  const buttonClass =
    "flex min-h-[46px] w-full min-w-0 items-center justify-center gap-2 rounded-[10px] border border-[#CE9F2D] bg-white px-3 py-2 transition-colors hover:bg-[#FFF9EA] active:bg-[#F2E5C5] sm:min-h-[48px] sm:gap-3 sm:px-5";

  const iconClass = "h-4 w-4 shrink-0 text-[#CE9F2D]";

  const dividerClass = "h-4 w-px shrink-0 bg-[#CE9F2D]/30";

  const textClass =
    "min-w-0 whitespace-normal break-words text-center text-sm font-semibold leading-5 text-[#1B1D60]";

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      {hasRetryPayment && (
        <Button
          variant="secondary"
          className={buttonClass}
          loading={retrying}
          onClick={handleRetryPayment}
        >
          <RefreshCw className={iconClass} />
          <span className={dividerClass} />
          <span className={textClass}>Retry Payment</span>
        </Button>
      )}

      {hasCancelAction && (
        <Button
          variant="secondary"
          className={buttonClass}
          onClick={openCancellation}
        >
          <XCircle className={iconClass} />
          <span className={dividerClass} />
          <span className={textClass}>
            {selectedOrderItem ? "Cancel Item" : "Cancel Order"}
          </span>
        </Button>
      )}

      {hasReturnAction && (
        <Link
          to={
            selectedOrderItem
              ? `/returns/request/${orderId}?orderItemId=${encodeURIComponent(
                  getOrderItemId(selectedOrderItem),
                )}`
              : `/returns/request/${orderId}`
          }
          className="block w-full min-w-0"
        >
          <Button variant="secondary" className={buttonClass}>
            <RotateCcw className={iconClass} />
            <span className={dividerClass} />
            <span className={textClass}>Request Return</span>
          </Button>
        </Link>
      )}
    </div>
  );
}
