import { canRetryOrderPayment } from "../utils/paymentRetry";
import { Link } from "react-router-dom";
import {
  RefreshCw,
  XCircle,
  RotateCcw,
  MessageSquare,
  Ticket,
} from "lucide-react";
import { useSupportController } from "../../support/controllers/useSupportController";


import DynamicButton from "../../../components/ui/button/button.jsx";
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
  const hasRetryPayment = canRetryOrderPayment(order, status);

  const hasCancelAction =
    typeof canCancelOrder === "function" &&
    canCancelOrder(order) &&
    Boolean(hasCancellableQuantity) &&
    !hasRetryPayment;

  const hasReturnAction =
    (Boolean(selectedOrderItem) && Boolean(selectedItemCanReturn)) ||
    (!selectedOrderItem && Boolean(canRequestReturn));
const buttonClass =
  "flex min-h-11 w-full min-w-0 flex-row items-center justify-center gap-2 rounded-lg border border-[#E9DFC8] bg-white px-3 py-2 text-xs font-semibold !text-[#51545A] transition-all duration-200 hover:bg-[#F5F0E7] hover:!text-[#1B1D60] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CE9F2D] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-10 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-2 sm:py-1"; 
  const iconClass = "shrink-0";
  const textClass = "min-w-0 truncate";

  const actionItems = [];

  if (hasRetryPayment) {
    actionItems.push(
      <DynamicButton
        key="retry-payment"
        variant="softGold"
        size="sm"
        shape="rounded"
        className={buttonClass}
        onClick={handleRetryPayment}
        disabled={retrying}
      >
        <RefreshCw size={15} className={iconClass} />
        <span className={textClass}>Retry Payment</span>
      </DynamicButton>,
    );
  }

  if (hasCancelAction) {
    actionItems.push(
      <DynamicButton
        key="cancel"
        variant="softGold"
        size="sm"
        shape="rounded"
        className={buttonClass}
        onClick={openCancellation}
      >
        <XCircle size={15} className={iconClass} />
        <span className={textClass}>
          {selectedOrderItem ? "Cancel Item" : "Cancel Order"}
        </span>
      </DynamicButton>,
    );
  }

  if (hasReturnAction) {
    actionItems.push(
      <DynamicButton
        key="return"
        as={Link}
        to={
          selectedOrderItem
            ? `/returns/request/${orderId}?orderItemId=${encodeURIComponent(
                getOrderItemId(selectedOrderItem),
              )}`
            : `/returns/request/${orderId}`
        }
        variant="softGold"
        size="sm"
        shape="rounded"
        className={buttonClass}
      >
        <RotateCcw size={15} className={iconClass} />
        <span className={textClass}>Request Return</span>
      </DynamicButton>,
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
    <DynamicButton
      key="ticket"
      variant="softGold"
      size="sm"
      shape="rounded"
      onClick={handleTicketClick}
      className={buttonClass}
    >
      <Ticket size={15} className={iconClass} />
      <span className={textClass}>Raise Ticket</span>
    </DynamicButton>,
    <DynamicButton
      key="chat"
      variant="softGold"
      size="sm"
      shape="rounded"
      onClick={handleChatClick}
      className={buttonClass}
    >
      <MessageSquare size={15} className={iconClass} />
      <span className={textClass}>Chat with us</span>
    </DynamicButton>,
  ];

 return (
  <div
  className="grid w-full min-w-0 grid-cols-1 gap-2 border-t border-[#E9DFC8] bg-white p-3 sm:grid-cols-[repeat(var(--action-count),minmax(0,1fr))] sm:gap-0 sm:bg-white sm:p-0 sm:divide-x sm:divide-[#EAE6DC]"
  style={{ "--action-count": allActions.length }}
>
  {allActions}
</div>
);
}