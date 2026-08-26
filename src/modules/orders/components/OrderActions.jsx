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
          className="min-h-[38px] w-full sm:w-auto text-white"
          loading={retrying}
          onClick={handleRetryPayment}
        >
          <RefreshCw size={15} /> Retry payment
        </Button>
      )}
      {hasCancelAction && (
        <Button
          variant="secondary"
          className="min-h-[36px] w-full border-[#CE9F2D] font-bold text-[#1B1D60] hover:bg-[#FFF9EA] sm:w-auto px-4 rounded-[10px]"
          onClick={openCancellation}
        >
          <XCircle size={15} className="text-red-500" />{" "}
          {selectedOrderItem ? "Cancel selected item" : "Cancel order"}
        </Button>
      )}
    </div>
  );
}
