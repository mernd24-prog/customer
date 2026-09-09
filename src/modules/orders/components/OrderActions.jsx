import { RefreshCw, XCircle } from "lucide-react";
import Button from "../../../components/ui/buttons/Button";

export default function OrderActions({
  order,
  status,
  canCancelOrder,
  retrying,
  handleRetryPayment,
  openCancellation,
  selectedOrderItem,
  hasCancellableQuantity,
}) {
  const hasRetryPayment =
    status === "pending_payment" || status === "payment_failed";
  const hasCancelAction =
    Boolean(selectedOrderItem) &&
    canCancelOrder(order) &&
    hasCancellableQuantity &&
    status !== "pending_payment" &&
    status !== "payment_failed";

  if (!hasRetryPayment && !hasCancelAction) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center py-2">
      {(status === "pending_payment" || status === "payment_failed") && (
        <Button
          variant="secondary"
          className="flex h-[46px] sm:h-[48px] w-full sm:w-auto items-center justify-center gap-3 rounded-[10px] border border-[#CE9F2D] bg-white px-5 py-2.5 transition-colors hover:bg-[#FFF9EA] active:bg-[#F2E5C5]"
          loading={retrying}
          onClick={handleRetryPayment}
        >
          <RefreshCw size={16} className="text-[#CE9F2D]" />
          <div className="w-[1px] h-4 bg-[#CE9F2D]/30" />
          <span className="text-sm font-semibold text-[#1B1D60]">
            Retry Payment
          </span>
        </Button>
      )}
      {hasCancelAction && (
        <Button
          variant="secondary"
          className="flex h-[46px] sm:h-[48px] w-full sm:w-auto items-center justify-center gap-3 rounded-[10px] border border-[#CE9F2D] bg-white px-5 py-2.5 transition-colors hover:bg-[#FFF9EA] active:bg-[#F2E5C5]"
          onClick={openCancellation}
        >
          <XCircle size={16} className="text-[#CE9F2D]" />
          <div className="w-[1px] h-4 bg-[#CE9F2D]/30" />
          <span className="text-sm font-semibold text-[#1B1D60]">
            {selectedOrderItem ? "Cancel Item" : "Cancel Order"}
          </span>
        </Button>
      )}
    </div>
  );
}
