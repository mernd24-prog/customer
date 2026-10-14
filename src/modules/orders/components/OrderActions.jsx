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

  const hasAnyAction = hasRetryPayment || hasCancelAction || hasReturnAction;

  const buttonClass =
    "flex h-[52px] w-full min-w-0 cursor-pointer items-center justify-center gap-2 bg-transparent px-3 py-2 text-sm font-semibold text-[#1B1D60] transition-colors duration-200 hover:bg-[#F5F0E7] disabled:cursor-not-allowed disabled:opacity-60";

  const chatButtonClass =
    "flex h-[52px] w-full min-w-0 cursor-pointer items-center justify-center gap-2 bg-transparent px-3 py-2 text-sm font-semibold text-[#1B1D60] transition-colors duration-200 hover:bg-[#F5F0E7]";

  const ticketButtonClass =
    "flex h-[52px] w-full min-w-0 cursor-pointer items-center justify-center gap-2 bg-transparent px-3 py-2 text-sm font-semibold text-[#1B1D60] transition-colors duration-200 hover:bg-[#F5F0E7]";

  const iconClass = "h-4 w-4 shrink-0 text-[#1B1D60]";
  const chatIconClass = "h-4 w-4 shrink-0 text-[#1B1D60]";
  const ticketIconClass = "h-4 w-4 shrink-0 text-[#1B1D60]";

  const dividerClass = "h-4 w-px shrink-0 bg-[#D8C9A1]";
  const chatDividerClass = "h-4 w-px shrink-0 bg-[#D8C9A1]";
  const ticketDividerClass = "h-4 w-px shrink-0 bg-[#D8C9A1]";

  const textClass =
    "min-w-0 whitespace-normal break-words text-center text-sm font-semibold leading-5 text-[#1B1D60]";
  const chatTextClass =
    "min-w-0 whitespace-normal break-words text-center text-sm font-semibold leading-5 text-[#1B1D60]";
  const ticketTextClass =
    "min-w-0 whitespace-normal break-words text-center text-sm font-semibold leading-5 text-[#1B1D60]";

  const actionItems = [];

  if (hasRetryPayment) {
    actionItems.push(
      <div
        key="retry-payment"
        className="w-full min-w-0 border-b border-[#D8C9A1] last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
      >
        <button
          type="button"
          className={buttonClass}
          onClick={handleRetryPayment}
          disabled={retrying}
        >
          <RefreshCw className={iconClass} />
          <span className={dividerClass} />
          <span className={textClass}>Retry Payment</span>
        </button>
      </div>,
    );
  }

  if (hasCancelAction) {
    actionItems.push(
      <div
        key="cancel"
        className="w-full min-w-0 border-b border-[#D8C9A1] last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
      >
        <button
          type="button"
          className={buttonClass}
          onClick={openCancellation}
        >
          <XCircle className={iconClass} />
          <span className={dividerClass} />
          <span className={textClass}>
            {selectedOrderItem ? "Cancel Item" : "Cancel Order"}
          </span>
        </button>
      </div>,
    );
  }

  if (hasReturnAction) {
    actionItems.push(
      <div
        key="return"
        className="w-full min-w-0 border-b border-[#D8C9A1] last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
      >
        <Link
          to={
            selectedOrderItem
              ? `/returns/request/${orderId}?orderItemId=${encodeURIComponent(
                  getOrderItemId(selectedOrderItem),
                )}`
              : `/returns/request/${orderId}`
          }
          className={`${buttonClass} block`}
        >
          <RotateCcw className={iconClass} />
          <span className={dividerClass} />
          <span className={textClass}>Request Return</span>
        </Link>
      </div>,
    );
  }

  const actionButtons = (
    <div className="grid w-full min-w-0 overflow-hidden rounded-lg border border-[#D8C9A1] bg-[#F6F0E5]">
      <div className="grid w-full min-w-0 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {actionItems}
      </div>
    </div>
  );

  const handleTicketClick = () => {
    const subject = order?.orderNumber || order?.id || orderId || "Order Issue";

    handleOpenRaiseTicketModal({
      category: "ORDER_ISSUE",
      subject: `Order #${subject} issue`,
      message: `I need help with order ${subject}.`,
    });
  };

  const chatButton = (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("open-ai-chat"));
      }}
      className={chatButtonClass}
    >
      <MessageSquare className={chatIconClass} />
      <span className={chatDividerClass} />
      <span className={chatTextClass}>Chat with us</span>
    </button>
  );

  const ticketButton = (
    <button
      type="button"
      onClick={handleTicketClick}
      className={ticketButtonClass}
    >
      <Ticket className={ticketIconClass} />
      <span className={ticketDividerClass} />
      <span className={ticketTextClass}>Raise Ticket</span>
    </button>
  );

  const supportActions = (
    <div className="grid w-full min-w-0 overflow-hidden rounded-lg border border-[#D8C9A1] bg-[#F6F0E5] md:grid-cols-2">
      <div className="min-w-0 border-b border-[#D8C9A1] md:border-b-0 md:border-r md:last:border-r-0">
        {ticketButton}
      </div>
      <div className="min-w-0">{chatButton}</div>
    </div>
  );

  return (
    <div className="w-full min-w-0">
      {hasAnyAction ? (
        <div className="grid w-full min-w-0 gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="min-w-0">{actionButtons}</div>
          <div className="min-w-0">{supportActions}</div>
        </div>
      ) : (
        <div className="w-full min-w-0">{supportActions}</div>
      )}
    </div>
  );
}
