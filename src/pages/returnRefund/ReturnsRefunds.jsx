import Seo from "../../components/common/Seo";
import Breadcrumbs from "../../components/ecommerce/Breadcrumbs";
import ApiState from "../../components/common/ApiState";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyReturns } from "../../features/returns/returnsSlice";
import { ChevronDown } from "lucide-react";
import ReturnItemCard from "./component/ReturnItemCard";
import ReturnTrackingCard from "./component/ReturnTrackingCard";

/* ─── Status filter options ───────────────────────────────────────────── */
const STATUS_FILTERS = [
  { value: "all", label: "All Returns" },
  { value: "requested", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "received", label: "Received" },
  { value: "issue", label: "Action Required" },
  { value: "refunded", label: "Refunded" },
];

/* maps raw API status → filter bucket */
const statusToBucket = (status) => {
  if (!status) return "all";
  if (status === "requested") return "requested";
  if (
    ["approved", "reverse_pickup_scheduled", "manual_ship_back", "shipped_back", "in_reverse_transit"].includes(
      status,
    )
  )
    return "approved";
  if (status === "rejected") return "rejected";
  if (["received", "qc_passed", "qc_completed", "replacement_requested", "replacement_pending", "replacement_created", "replacement_shipped", "replacement_delivered"].includes(status))
    return "received";
  if (["pickup_failed", "qc_failed", "refund_failed"].includes(status))
    return "issue";
  if (
    [
      "refunded",
      "partially_refunded",
      "refund_pending",
      "replaced",
      "closed",
    ].includes(status)
  )
    return "refunded";
  return "all";
};

/* ─── Tracking-step builder ───────────────────────────────────────────── */
const buildTrackingSteps = (ret) => {
  if (!ret || !ret.timeline || ret.timeline.length === 0) return [];

  const sortedTimeline = [...ret.timeline].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );

  const formatTitle = (status) => {
    if (!status) return "Updated";
    if (status === "requested") return "Return Requested";
    if (status === "shipped_back") return "Product Picked Up";
    if (status === "reverse_pickup_scheduled") return "Pickup Scheduled";
    if (status === "qc_passed") return "Quality Check Passed";
    if (status === "qc_failed") return "Quality Check Failed";
    if (status === "received") return "Quality Check";
    if (status === "refunded") return "Refund Completed";
    
    return status
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const mappedSteps = sortedTimeline.map((event) => {
    const time = new Date(event.at).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return {
      title: formatTitle(event.status),
      description: event.note || event.reason || `Status updated to ${formatTitle(event.status)}.`,
      time: time,
      completed: false,
      active: false,
      status: event.status, // useful for checking end state
    };
  });

  const finalStates = ["refunded", "partially_refunded", "closed", "replaced", "rejected"];

  mappedSteps.forEach((step, idx) => {
    const isLast = idx === mappedSteps.length - 1;
    if (isLast) {
      if (finalStates.includes(step.status)) {
        step.completed = true;
        step.active = false;
      } else {
        step.completed = false;
        step.active = true;
      }
    } else {
      step.completed = true;
      step.active = false;
    }
  });

  return mappedSteps;
};

/* ─── Expected-date helper (unchanged) ────────────────────────────────── */
const getExpectedDate = (ret) => {
  if (ret.status === "refunded" || ret.status === "partially_refunded") {
    const refundedEvent = ret.timeline?.find((t) =>
      ["refunded", "partially_refunded"].includes(t.status),
    );
    const dateStr =
      refundedEvent?.at || ret.updatedAt || ret.requestedAt || ret.createdAt;
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } else {
    const dateStr = ret.requestedAt || ret.createdAt || Date.now();
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 7);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
};

/* ─── Custom dropdown component ───────────────────────────────────────── */
function StatusDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLabel =
    STATUS_FILTERS.find((f) => f.value === value)?.label || "All Returns";

  return (
    <div ref={ref} className="relative w-full sm:w-[260px] lg:w-[300px]">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between gap-2 rounded-[10px] border border-[#CE9F2D66] bg-white px-4 py-3 text-left font-sans text-[13px] font-semibold text-[#1B1D60] shadow-sm transition-all duration-200 hover:border-[#CE9F2D] focus:outline-none sm:text-[14px] lg:py-3.5 lg:text-[16px]"
      >
        <span className="truncate">{activeLabel}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-[#CE9F2D] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="absolute left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-[10px] border border-[#CE9F2D66] bg-white py-1 shadow-lg">
          {STATUS_FILTERS.map((opt) => {
            const isActive = value === opt.value;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-left font-sans text-[12px] font-medium transition-colors sm:text-[13px] lg:text-[14px] ${
                    isActive
                      ? "bg-[#FFEFC8]/60 text-[#1B1D60]"
                      : "text-[#454545] hover:bg-[#F9F5EB]"
                  }`}
                >
                  <span
                    className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                      isActive ? "bg-[#CE9F2D]" : "bg-[#D4D4D4]"
                    }`}
                  />
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────────────── */
function ReturnsRefundsPage() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.returns);
  const returns = Array.isArray(state.list) ? state.list : [];

  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedReturnId, setExpandedReturnId] = useState(null);

  useEffect(() => {
    const refreshReturns = () => dispatch(fetchMyReturns())
      .unwrap()
      .catch((error) => {
        console.log("Returns API error:", error);
      });

    refreshReturns();
    const intervalId = window.setInterval(refreshReturns, 30000);
    const refreshOnFocus = () => refreshReturns();
    window.addEventListener("focus", refreshOnFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [dispatch]);

  /* filtered list */
  const filteredReturns =
    statusFilter === "all"
      ? returns
      : returns.filter((ret) => statusToBucket(ret.status) === statusFilter);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Returns & Refunds" },
  ];

  const toggleTracking = (retId) => {
    setExpandedReturnId((prev) => (prev === retId ? null : retId));
  };

  const renderReturnsList = (list) => {
    return (
      <div className="flex flex-col  gap-y-14">
        {list.map((ret) => {
          const returnId =
            ret._id || ret.id || ret.returnId || ret.returnNumber;

          const isExpanded = expandedReturnId === returnId;
          const trackingSteps = buildTrackingSteps(ret);
          const firstItemTitle = ret.items?.[0]?.productTitle || "Product";
          const trackingReturnId = ret.returnNumber || returnId;

          const refundAmount =
            ret.refundAmount ||
            ret.refund?.requestedAmount ||
            ret.refund?.amount ||
            ret.refund_amount ||
            0;

          const expectedDate = getExpectedDate(ret);

          return (
            <div
              key={returnId}
              className="overflow-hidden rounded-[15px] border border-[#CE9F2D66] bg-white"
            >
              {ret.items?.map((item, idx) => {
                const title = item.productTitle || "Product";
                const image = item.productImage;
                const orderId = ret.orderId;
                const quantity = item.quantity || item.requestedQuantity || 1;
                const seller = item.sellerName || "Sam Global Seller";
                const price = item.lineTotal || item.unitPrice || 0;
                const status = ret.status?.replace(/_/g, " ");
                const requestedOn = new Date(
                  ret.requestedAt || ret.createdAt || Date.now(),
                ).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                const reason = ret.description;

                return (
                  <ReturnItemCard
                    key={`${returnId}-${item.orderItemId || idx}`}
                    title={title}
                    image={image}
                    orderId={orderId}
                    quantity={quantity}
                    seller={seller}
                    price={price}
                    status={status}
                    requestedOn={requestedOn}
                    returnId={ret.returnNumber || returnId}
                    reason={reason}
                    refundAmount={price}
                    expectedDate={expectedDate}
                    onTrackRequest={() => toggleTracking(returnId)}
                    trackLabel={isExpanded ? "Hide Tracking" : "Track Order"}
                    className="!rounded-none !border-0"
                  />
                );
              })}

              {isExpanded && (
                <ReturnTrackingCard
                  title={`Return Tracking – ${firstItemTitle}`}
                  returnId={trackingReturnId}
                  steps={trackingSteps}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Seo title="Returns & Refunds | Sam Global" />
      <div className="py-6 sm:py-8">
        <Breadcrumbs
          items={breadcrumbItems}
          linkClassName="font-medium text-[12px] sm:text-[14px] lg:text-[16px] leading-[100%] text-[#2E2E2E]"
          separatorClassName="text-[#2E2E2E]"
        />
        <h1 className="lg:mb-4 lg:mt-5 text-[24px] sm:text-[28px] lg:text-[32px] font-bold text-[#3E4093] ">
          Returns & Refunds
        </h1>
        <p className="mb-4 max-w-[600px] font-sans text-[14px] sm:text-[16px] font-medium text-[#2E2E2E] ">
          Manage your return requests and track refund status.
        </p>

        <ApiState
          loading={state.loading && !returns.length}
          error={state.error}
          empty={!returns.length}
          emptyTitle="No returns yet"
          emptyText="Your return requests will appear here."
        >
          {/* ── Filter row ─────────────────────────────────────────── */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-sans text-[14px] font-semibold text-[#1B1D60] sm:text-[15px] lg:text-[18px]">
              {filteredReturns.length}{" "}
              {filteredReturns.length === 1 ? "Return" : "Returns"}
              {statusFilter !== "all" && (
                <span className="ml-1 font-normal text-[#454545]">
                  ·{" "}
                  {STATUS_FILTERS.find((f) => f.value === statusFilter)?.label}
                </span>
              )}
            </p>
            <StatusDropdown value={statusFilter} onChange={setStatusFilter} />
          </div>

          {/* ── Return cards ────────────────────────────────────────── */}
          {filteredReturns.length === 0 ? (
            <div className="rounded-[15px] border border-dashed border-[#CE9F2D66] bg-[#FFF4D7]/10 p-8 text-center text-[16px] font-medium text-[#454545]">
              No returns found for this filter.
            </div>
          ) : (
            renderReturnsList(filteredReturns)
          )}
        </ApiState>
      </div>
    </>
  );
}

export default ReturnsRefundsPage;
