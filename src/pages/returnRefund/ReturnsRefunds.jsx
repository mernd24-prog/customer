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
  { value: "refunded", label: "Refunded" },
];

/* maps raw API status → filter bucket */
const statusToBucket = (status) => {
  if (!status) return "all";
  if (status === "requested") return "requested";
  if (
    ["approved", "reverse_pickup_scheduled", "in_reverse_transit"].includes(
      status,
    )
  )
    return "approved";
  if (status === "rejected") return "rejected";
  if (["received", "qc_passed", "qc_completed"].includes(status))
    return "received";
  if (
    [
      "refunded",
      "partially_refunded",
      "refund_pending",
      "refund_failed",
      "replaced",
      "closed",
    ].includes(status)
  )
    return "refunded";
  return "all";
};

/* ─── Tracking-step builder (unchanged) ───────────────────────────────── */
const buildTrackingSteps = (ret) => {
  if (!ret) return [];
  const timeline = ret.timeline || [];
  const currentStatus = ret.status;
  const resolution = ret.resolution || "refund";

  const getTimelineTime = (statuses) => {
    const entry = timeline.find((t) => statuses.includes(t.status));
    if (!entry) return null;
    return new Date(entry.at).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const hasStatus = (statuses) => {
    return (
      statuses.includes(currentStatus) ||
      timeline.some((t) => statuses.includes(t.status))
    );
  };

  const getTimelineDetail = (statuses) => {
    const entry = timeline.find((t) => statuses.includes(t.status));
    if (!entry) return "";
    return entry.note || entry.reason || "";
  };

  const stepsDef = [
    {
      title: "Return Requested",
      description: "Your return request has been submitted successfully.",
      statuses: ["requested"],
    },
    {
      title: "Return Approved",
      description: "Your return request has been approved.",
      statuses: ["approved"],
    },
    {
      title: "Pickup Scheduled",
      description: "Pickup has been scheduled with our delivery partner.",
      statuses: ["reverse_pickup_scheduled"],
    },
    {
      title: "Product Picked Up",
      description: "Your item has been picked up by the delivery partner.",
      statuses: ["in_reverse_transit"],
    },
    {
      title: "Quality Check",
      description: "We are checking the returned item at our facility.",
      statuses: ["received", "qc_passed", "qc_completed"],
    },
  ];

  if (resolution === "replacement") {
    stepsDef.push(
      {
        title: "Replacement Initiated",
        description: "Replacement item will be shipped soon.",
        statuses: ["replacement_pending"],
      },
      {
        title: "Replacement Completed",
        description: "The replacement item has been delivered.",
        statuses: ["replaced"],
      },
    );
  } else {
    stepsDef.push(
      {
        title: "Refund Initiated",
        description:
          currentStatus === "refund_failed"
            ? "Refund attempt failed. We will retry."
            : "Refund will be initiated once the item is approved.",
        statuses: ["refund_pending", "refund_failed"],
      },
      {
        title: "Refund Completed",
        description: "The refund amount will be credited to your account.",
        statuses: ["refunded", "partially_refunded"],
      },
    );
  }

  if (currentStatus === "rejected") {
    stepsDef.push({
      title: "Return Rejected",
      description: "Your return request has been rejected.",
      statuses: ["rejected"],
    });
  } else if (
    currentStatus === "closed" &&
    !hasStatus(["refunded", "replaced"])
  ) {
    stepsDef.push({
      title: "Return Closed",
      description: "The return request has been closed.",
      statuses: ["closed"],
    });
  }

  let lastCompletedIndex = -1;
  const mappedSteps = stepsDef.map((def, idx) => {
    const time = getTimelineTime(def.statuses);
    const hasBeenRecorded = hasStatus(def.statuses);
    if (hasBeenRecorded) {
      lastCompletedIndex = idx;
    }
    return {
      title: def.title,
      description: getTimelineDetail(def.statuses) || def.description,
      time: time || "—",
      completed: false,
      active: false,
      hasBeenRecorded,
    };
  });

  mappedSteps.forEach((step, idx) => {
    if (step.hasBeenRecorded) {
      if (idx === lastCompletedIndex) {
        step.active = true;
      } else {
        step.completed = true;
      }
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
        className="flex w-full items-center justify-between gap-2 rounded-[10px] border border-[#CE9F2D66] bg-white px-4 py-3 text-left font-sans text-[14px] font-semibold text-[#1B1D60] shadow-sm transition-all duration-200 hover:border-[#CE9F2D] focus:outline-none sm:text-[16px] lg:py-3.5 lg:text-[18px]"
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
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-left font-sans text-[13px] font-medium transition-colors sm:text-[15px] lg:text-[16px] ${
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
    dispatch(fetchMyReturns())
      .unwrap()
      .catch((error) => {
        console.log("Returns API error:", error);
      });
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
      <div className="flex flex-col gap-y-14">
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
                const image = item.productImage || "/image/png/watch.png";
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
                const reason = ret.reason?.replace(/_/g, " ");

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
                    refundAmount={refundAmount}
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
          linkClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#2E2E2E]"
          separatorClassName="text-[#2E2E2E]"
        />
        <h1 className="lg:mb-4 lg:mt-5 font-sans text-[20px] font-bold text-[#3E4093] min-[375px]:text-[20px] min-[425px]:text-[24px] sm:text-[34px] lg:text-[38px]">
          Returns & Refunds
        </h1>
        <p className="mb-4 max-w-[600px] font-sans text-[13px] font-medium leading-[20px] text-[#2E2E2E] min-[375px]:text-[14px] min-[375px]:leading-[22px] sm:text-[16px] sm:leading-[24px] xl:text-[20px] xl:leading-[30px]">
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
            <p className="font-sans text-[14px] font-semibold text-[#1B1D60] sm:text-[16px] lg:text-[20px]">
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
