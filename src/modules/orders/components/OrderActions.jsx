import { Link } from "react-router-dom";
import {
  RefreshCw,
  XCircle,
  RotateCcw,
  MessageSquare,
  Ticket,
} from "lucide-react";
import { useSupportController } from "../../support/controllers/useSupportController";

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
  const { handleOpenRaiseTicketModal } = useSupportController();
  const normalizedStatus = String(status || "").toLowerCase();

  const hasRetryPayment = ["pending_payment", "payment_failed"].includes(
    normalizedStatus,
  );

  const hasCancelAction =
    typeof canCancelOrder === "function" &&
    canCancelOrder(order) &&
    Boolean(hasCancellableQuantity) &&
    !hasRetryPayment;

  const hasReturnAction =
    (Boolean(selectedOrderItem) && Boolean(selectedItemCanReturn)) ||
    (!selectedOrderItem && Boolean(canRequestReturn));

  // Match CartItemCard bottom action styling exactly
  const buttonClass =
    "flex min-w-0 min-h-[52px] w-full flex-col items-center justify-center gap-1 px-1 py-1.5 text-[10px] font-semibold text-[#51545A] transition-colors hover:bg-[#F5F0E7] hover:text-[#1B1D60] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[36px] sm:flex-row sm:gap-2 sm:px-2 sm:py-1 sm:text-xs";

  const iconClass = "shrink-0";
  const textClass = "min-w-0 truncate";

  const actionItems = [];

  if (hasRetryPayment) {
    actionItems.push(
      <button
        key="retry-payment"
        type="button"
        className={buttonClass}
        onClick={handleRetryPayment}
        disabled={retrying}
      >
        <RefreshCw size={15} className={iconClass} />
        <span className={textClass}>Retry Payment</span>
      </button>,
    );
  }

  if (hasCancelAction) {
    actionItems.push(
      <button
        key="cancel"
        type="button"
        className={buttonClass}
        onClick={openCancellation}
      >
        <XCircle size={15} className={iconClass} />
        <span className={textClass}>
          {selectedOrderItem ? "Cancel Item" : "Cancel Order"}
        </span>
      </button>,
    );
  }

  if (hasReturnAction) {
    actionItems.push(
      <Link
        key="return"
        to={
          selectedOrderItem
            ? `/returns/request/${orderId}?orderItemId=${encodeURIComponent(
                getOrderItemId(selectedOrderItem),
              )}`
            : `/returns/request/${orderId}`
        }
        className={buttonClass}
      >
        <RotateCcw size={15} className={iconClass} />
        <span className={textClass}>Request Return</span>
      </Link>,
    );
  }

  const handleTicketClick = () => {
    const subject = order?.orderNumber || order?.id || orderId || "Order Issue";

    handleOpenRaiseTicketModal({
      category: "ORDER_ISSUE",
      subject: `Order #${subject} issue`,
      message: `I need help with order ${subject}.`,
    });
  };

  const handleChatClick = () => {
    window.dispatchEvent(new CustomEvent("open-ai-chat"));
  };

  const allActions = [
    ...actionItems,
    <button
      key="ticket"
      type="button"
      onClick={handleTicketClick}
      className={buttonClass}
    >
      <Ticket size={15} className={iconClass} />
      <span className={textClass}>Raise Ticket</span>
    </button>,
    <button
      key="chat"
      type="button"
      onClick={handleChatClick}
      className={buttonClass}
    >
      <MessageSquare size={15} className={iconClass} />
      <span className={textClass}>Chat with us</span>
    </button>,
  ];

  return (
    <div
      className="grid w-full min-w-0 divide-x divide-[#EAE6DC] border-t border-[#E9DFC8] bg-[#F8F5EE]"
      style={{
        gridTemplateColumns: `repeat(${allActions.length}, minmax(0, 1fr))`,
      }}
    >
      {allActions}
    </div>
  );
}