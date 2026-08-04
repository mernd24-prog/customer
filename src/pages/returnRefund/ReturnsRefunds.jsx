import Seo from "../../components/common/Seo";
import Breadcrumbs from "../../components/ecommerce/Breadcrumbs";
import ApiState from "../../components/common/ApiState";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  disputeReturnQc,
  fetchMyReturns,
} from "../../features/returns/returnsSlice";
import { notify } from "../../utils/notify";
import { ChevronDown } from "lucide-react";
import ReturnItemCard from "./component/ReturnItemCard";
import ReturnTrackingCard from "./component/ReturnTrackingCard";
import { RETURNS_PAGE_SKELETON } from "../../components/common/skeleton/layouts";


/* ─── Status filter options ───────────────────────────────────────────── */
const STATUS_FILTERS = [
  { value: "all", label: "All Returns" },
  { value: "requested", label: "Requested" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "reverse_pickup_scheduled", label: "Reverse Pickup Scheduled" },
  { value: "pickup_failed", label: "Pickup Failed" },
  { value: "manual_ship_back", label: "Manual Ship Back" },
  { value: "shipped_back", label: "Shipped Back" },
  { value: "in_reverse_transit", label: "In Reverse Transit" },
  { value: "received", label: "Received" },
  { value: "qc_passed", label: "QC Passed" },
  { value: "qc_failed", label: "QC Failed" },
  { value: "qc_completed", label: "QC Completed" },
  { value: "qc_failure_upheld", label: "QC Failure Upheld" },
  { value: "refund_pending", label: "Refund Pending" },
  { value: "refund_failed", label: "Refund Failed" },
  { value: "partially_refunded", label: "Partially Refunded" },
  { value: "refunded", label: "Refunded" },
  { value: "replacement_requested", label: "Replacement Requested" },
  { value: "replacement_pending", label: "Replacement Pending" },
  { value: "replacement_created", label: "Replacement Created" },
  { value: "replacement_shipped", label: "Replacement Shipped" },
  { value: "replacement_delivered", label: "Replacement Delivered" },
  { value: "replaced", label: "Replaced" },
  { value: "closed", label: "Closed" },
];

/* exact-match filter — value is the raw API status string */
const matchesFilter = (status, filter) => {
  if (filter === "all") return true;
  return String(status || "") === filter;
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
    if (statuses.includes("requested")) {
      return entry?.note || entry?.reason || ret.description || "";
    }
    if (!entry) return "";
    return entry.note || entry.reason || "";
  };

  const stepsDef = [
    {
      title: "Return Requested",
      statuses: ["requested"],
    },
    {
      title: "Return Approved",
      statuses: ["approved"],
    },
    {
      title: "Pickup Scheduled",
      statuses: ["reverse_pickup_scheduled", "manual_ship_back"],
    },
    {
      title:
        currentStatus === "pickup_failed"
          ? "Pickup Failed"
          : "Product Shipped Back",
      statuses: ["pickup_failed", "shipped_back", "in_reverse_transit"],
    },
    {
      title:
        currentStatus === "qc_failed"
          ? "Quality Check Failed"
          : "Quality Check",
      statuses: ["received", "qc_passed", "qc_completed", "qc_failed"],
    },
  ];

  if (
    currentStatus === "qc_failure_upheld" ||
    ret.qcReview?.adminDecision === "uphold"
  ) {
    stepsDef.push({
      title: "QC Failure Upheld",
      statuses: ["qc_failure_upheld", "qc_uphold"],
    });
  }

  if (resolution === "replacement") {
    const replacementSteps = [
      {
        title: "Replacement Requested",
        statuses: ["replacement_requested", "replacement_pending"],
      },
      {
        title: "Replacement Order Created",
        statuses: ["replacement_created"],
      },
      {
        title: "Replacement Shipped",
        statuses: ["replacement_shipped"],
      },
      {
        title: "Replacement Delivered",
        statuses: ["replacement_delivered"],
      },
      {
        title: "Replacement Completed",
        statuses: ["replaced"],
      },
    ];
    if (ret.replacement?.metadata?.doorstepExchange) {
      stepsDef.splice(3, 0, ...replacementSteps);
    } else {
      stepsDef.push(...replacementSteps);
    }
  } else {
    stepsDef.push(
      {
        title: "Refund Initiated",
        statuses: ["refund_pending", "refund_failed"],
      },
      {
        title: "Refund Completed",
        statuses: ["refunded", "partially_refunded"],
      },
    );
  }

  if (currentStatus === "rejected") {
    stepsDef.push({
      title: "Return Rejected",
      statuses: ["rejected"],
    });
  } else if (
    currentStatus === "closed" &&
    !hasStatus(["refunded", "replaced"])
  ) {
    stepsDef.push({
      title: "Return Closed",
      statuses: ["closed"],
    });
  }

  const recordedSteps = stepsDef
    .map((def) => {
      const time = getTimelineTime(def.statuses);
      const hasBeenRecorded = hasStatus(def.statuses);
      return {
        title: def.title,
        description: getTimelineDetail(def.statuses),
        time: time || "—",
        completed: false,
        active: false,
        hasBeenRecorded,
      };
    })
    .filter((step) => step.hasBeenRecorded);

  recordedSteps.forEach((step, idx) => {
    if (idx === recordedSteps.length - 1) {
      step.active = true;
    } else {
      step.completed = true;
    }
  });

  return recordedSteps;
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
        <ul className="absolute left-0 right-0 z-10 mt-1.5 max-h-64 overflow-y-auto rounded-[10px] border border-[#CE9F2D66] bg-white py-1 shadow-lg [scrollbar-width:thin] [scrollbar-color:#CE9F2D_transparent]">
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
  const [qcDispute, setQcDispute] = useState({
    returnId: null,
    reason: "",
    evidence: "",
    submitting: false,
  });

  useEffect(() => {
    const refreshReturns = () =>
      dispatch(fetchMyReturns())
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

  const [visibleCount, setVisibleCount] = useState(3);

  const handleStatusFilterChange = (newFilter) => {
    setStatusFilter(newFilter);
    setVisibleCount(3);
  };

  /* filtered list */
  const filteredReturns =
    statusFilter === "all"
      ? returns
      : returns.filter((ret) => matchesFilter(ret.status, statusFilter));

  const visibleReturns = filteredReturns.slice(0, visibleCount);
  const hasMoreReturns = visibleCount < filteredReturns.length;

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Returns & Refunds" },
  ];

  const toggleTracking = (retId) => {
    setExpandedReturnId((prev) => (prev === retId ? null : retId));
  };

  const submitQcDispute = async () => {
    if (!qcDispute.returnId || qcDispute.reason.trim().length < 10) {
      notify.error("Please explain the QC dispute in at least 10 characters.");
      return;
    }
    try {
      setQcDispute((current) => ({ ...current, submitting: true }));
      await dispatch(
        disputeReturnQc({
          returnId: qcDispute.returnId,
          reason: qcDispute.reason.trim(),
          evidence: qcDispute.evidence
            .split(/[\n,]/)
            .map((value) => value.trim())
            .filter(Boolean),
        }),
      ).unwrap();
      notify.success("Your QC dispute was submitted for marketplace review.");
      setQcDispute({
        returnId: null,
        reason: "",
        evidence: "",
        submitting: false,
      });
      await dispatch(fetchMyReturns());
    } catch (error) {
      notify.error(error?.message || "Unable to submit the QC dispute.");
      setQcDispute((current) => ({ ...current, submitting: false }));
    }
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
          const qcDisputeDeadline = ret.qcReview?.disputeDeadline
            ? new Date(ret.qcReview.disputeDeadline)
            : null;
          const qcDisputeOpen =
            !qcDisputeDeadline || qcDisputeDeadline >= new Date();

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

              {ret.status === "qc_failed" && (
                <div className="border-t border-amber-200 bg-amber-50 p-4 sm:p-6">
                  <h3 className="font-semibold text-amber-900">
                    Quality Check Failed ——— Marketplace Review
                  </h3>
                  <p className="mt-1 text-sm text-amber-800">
                    The Seller Reported That the Returned Product Did Not Pass
                    Inspection. Your Refund Remains on Hold Until the Evidence
                    Is Reviewed.
                  </p>
                  {(ret.qcReview?.sellerEvidence || []).map(
                    (evidence, index) => (
                      <div
                        key={evidence.orderItemId || index}
                        className="mt-3 rounded-lg bg-white p-3 text-sm text-[#454545]"
                      >
                        <div className="font-medium">
                          Seller Finding:{" "}
                          {String(evidence.result || "").replace(/_/g, " ")}
                        </div>
                        <div>
                          {evidence.notes || "No inspection note provided."}
                        </div>
                        {(evidence.photos || []).map((url) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="mr-3 text-blue-700 underline"
                          >
                            View Evidence
                          </a>
                        ))}
                      </div>
                    ),
                  )}
                  {ret.qcReview?.customerDispute ? (
                    <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                      Your Dispute Is Under Admin Review:{" "}
                      {ret.qcReview.customerDispute.reason}
                    </p>
                  ) : !qcDisputeOpen ? (
                    <p className="mt-3 rounded-lg bg-stone-100 p-3 text-sm text-stone-700">
                      The Qc Dispute Window Closed on{" "}
                      {qcDisputeDeadline.toLocaleString("en-IN")}.
                    </p>
                  ) : qcDispute.returnId === returnId ? (
                    <div className="mt-4 space-y-3">
                      <textarea
                        className="w-full rounded-lg border border-amber-300 bg-white p-3 text-sm"
                        rows={4}
                        placeholder="Explain Why You Disagree with the Qc Result"
                        value={qcDispute.reason}
                        onChange={(event) =>
                          setQcDispute((current) => ({
                            ...current,
                            reason: event.target.value,
                          }))
                        }
                      />
                      <textarea
                        className="w-full rounded-lg border border-amber-300 bg-white p-3 text-sm"
                        rows={2}
                        placeholder="Optional Evidence Image Urls, One Per Line"
                        value={qcDispute.evidence}
                        onChange={(event) =>
                          setQcDispute((current) => ({
                            ...current,
                            evidence: event.target.value,
                          }))
                        }
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={qcDispute.submitting}
                          onClick={submitQcDispute}
                          className="rounded-lg bg-[#3E4093] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          Submit Dispute
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setQcDispute({
                              returnId: null,
                              reason: "",
                              evidence: "",
                              submitting: false,
                            })
                          }
                          className="rounded-lg border px-4 py-2 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setQcDispute({
                          returnId,
                          reason: "",
                          evidence: "",
                          submitting: false,
                        })
                      }
                      className="mt-3 rounded-lg bg-[#3E4093] px-4 py-2 text-sm font-semibold text-white"
                    >
                      Dispute Qc Result
                    </button>
                  )}
                </div>
              )}

              {ret.qcReview?.status === "resolved" && (
                <div className="border-t border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 sm:p-6">
                  <strong>Marketplace Decision:</strong>{" "}
                  {String(ret.qcReview.adminDecision || "").replace(/_/g, " ")}{" "}
                  — {ret.qcReview.decisionReason}
                </div>
              )}

              {ret.returnToCustomer?.trackingNumber && (
                <div className="border-t border-purple-200 bg-purple-50 p-4 text-sm text-purple-900 sm:p-6">
                  <strong>Product Returning to You:</strong>{" "}
                  {ret.returnToCustomer.courierName} ·{" "}
                  {ret.returnToCustomer.trackingNumber} ·{" "}
                  {String(ret.returnToCustomer.status || "").replace(/_/g, " ")}
                  {ret.returnToCustomer.trackingUrl && (
                    <a
                      className="ml-3 underline"
                      href={ret.returnToCustomer.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Track Shipment
                    </a>
                  )}
                </div>
              )}

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
          Manage Your Return Requests and Track Refund Status.
        </p>

        <ApiState
          loading={state.loading && !returns.length}
          error={state.error}
          empty={!returns.length}
          skeletonLayout={RETURNS_PAGE_SKELETON}
          skeletonContainerClass="bg-transparent mt-4 flex flex-col gap-6"
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
            <StatusDropdown
              value={statusFilter}
              onChange={handleStatusFilterChange}
            />
          </div>

          {/* ── Return cards ────────────────────────────────────────── */}
          {filteredReturns.length === 0 ? (
            <div className="rounded-[15px] border border-dashed border-[#CE9F2D66] bg-[#FFF4D7]/10 p-8 text-center text-[16px] font-medium text-[#454545]">
              No Returns Found for This Filter.
            </div>
          ) : (
            <>
              {renderReturnsList(visibleReturns)}
              {hasMoreReturns && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 3)}
                    className="flex items-center gap-2 rounded-xl border border-[#CE9F2D] bg-white px-6 py-3 font-sans text-[14px] font-semibold text-[#3E4093] shadow-sm transition-all hover:bg-[#FFEFC8]/40 focus:outline-none"
                  >
                    Load More
                    <ChevronDown size={16} className="text-[#CE9F2D]" />
                  </button>
                </div>
              )}
            </>
          )}
        </ApiState>
      </div>
    </>
  );
}

export default ReturnsRefundsPage;
