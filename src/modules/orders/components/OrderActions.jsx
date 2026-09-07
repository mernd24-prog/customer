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
    hasCancellableQuantity;

  if (!hasRetryPayment && !hasCancelAction) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center py-2">
      {(status === "pending_payment" || status === "payment_failed") && (
        <Button
          className="flex h-[46px] sm:h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-[10px] px-5 py-2.5 text-white"
          loading={retrying}
          onClick={handleRetryPayment}
        >
          <RefreshCw size={16} />
          <span className="text-center text-sm font-semibold">
            Retry payment
          </span>
        </Button>
      )}
      {hasCancelAction && (
        <Button
          variant="secondary"
          className="flex h-[46px] sm:h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-[10px] border border-[#CE9F2D] bg-[#FFFDF8] px-5 py-2.5 text-[#1B1D60] shadow-sm transition-all hover:bg-[#FFF9EA] hover:border-[#CE9F2D] active:scale-[0.98]"
          onClick={openCancellation}
        >
          <XCircle size={16} className="text-[#CE9F2D]" />
          <span className="text-center text-sm font-semibold">
            {selectedOrderItem ? "Cancel item" : "Cancel order"}
          </span>
        </Button>
      )}
    </div>
  );
}
