export function ReturnStatus({
  isCancelled,
  isReturned,
  groupCancellation,
  groupReturn,
  group,
  formatMoney,
  currency,
}) {
  if (!(isCancelled || isReturned) || !(groupCancellation || groupReturn)) {
    return null;
  }

  const getRefundAmount = () => {
    if (isReturned) {
      return (
        groupReturn?.refundAmount ||
        groupReturn?.refund?.requestedAmount ||
        groupReturn?.refund?.amount ||
        groupReturn?.refund_amount ||
        groupReturn?.refundBreakup?.totalRefundAmount ||
        groupReturn?.refund_breakup?.total_refund_amount ||
        group?.items?.[0]?.return_lifecycle?.refundAmount ||
        group?.items?.[0]?.return_lifecycle?.refund_amount ||
        group?.items?.[0]?.returnLifecycle?.refundAmount ||
        0
      );
    }
    return (
      groupCancellation?.refundAmount ||
      groupCancellation?.refund_amount ||
      groupCancellation?.refund?.requestedAmount ||
      groupCancellation?.refund?.amount ||
      groupCancellation?.refundBreakup?.totalRefundAmount ||
      groupCancellation?.refund_breakup?.total_refund_amount ||
      group?.items?.[0]?.cancellation_lifecycle?.refundAmount ||
      0
    );
  };

  const getRequestId = () => {
    if (isReturned) {
      return (
        groupReturn?.returnNumber ||
        groupReturn?.return_number ||
        groupReturn?.id ||
        groupReturn?._id ||
        "N/A"
      );
    }
    return (
      groupCancellation?.cancellationNumber ||
      groupCancellation?.cancellation_number ||
      groupCancellation?.id ||
      groupCancellation?._id ||
      "N/A"
    );
  };

  const refundAmount = getRefundAmount();
  const requestId = getRequestId();

  return (
    <div className="mt-3">
      <div className="grid grid-cols-2 items-center gap-4 sm:gap-6 rounded-lg bg-[#FFF9EA] p-3 border border-[#CE9F2D] border-opacity-30">
        <div className="min-w-0">
          <p className="text-xs text-[#8A5A00]">
            {isReturned ? "Return ID" : "Cancellation ID"}
          </p>
          <p className="text-sm font-semibold text-[#1B1D60] truncate">
            {requestId}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-[#8A5A00]">Refund Amount</p>
          <p className="text-sm font-bold text-[#1B1D60] truncate">
            {formatMoney ? formatMoney(refundAmount, currency) : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
