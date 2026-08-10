import { COMPACT_STATUS_BADGE } from "../../../data/orderPage";
import { humanize } from "../utils/orderUtils";

export function OrderListStatusBadge({ status }) {
  const cls = COMPACT_STATUS_BADGE[status] || "bg-[#D7A522] text-white";
  return (
    <span
      className={`mt-2 md:mt-0  inline-flex min-w-[74px] small justify-center rounded-full px-3 py-2   font-bold capitalize ${cls}`}
    >
      {humanize(status, "Processing")}
    </span>
  );
}

export function OrderListItemStatusSummary({ statuses = [] }) {
  const normalized = [...new Set(statuses.filter(Boolean).map((itemStatus) => String(itemStatus)))];
  if (!normalized.length) return <OrderListStatusBadge status="processing" />;
  if (normalized.length === 1) return <OrderListStatusBadge status={normalized[0]} />;
  return (
    <span className="mt-2 inline-flex min-w-[110px] justify-center rounded-full bg-[#1B1D60] px-3 py-2 text-xs font-bold capitalize text-white md:mt-0">
      Mixed item status
    </span>
  );
}

