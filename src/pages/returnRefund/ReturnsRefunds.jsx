import Seo from "../../components/common/Seo";
import Breadcrumbs from "../../components/ecommerce/Breadcrumbs";
import ApiState from "../../components/common/ApiState";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { disputeReturnQc, fetchMyReturns } from "../../features/returns/returnsSlice";
import { notify } from "../../utils/notify";
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
  if (["pickup_failed", "qc_failed", "qc_failure_upheld", "refund_failed"].includes(status))
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
      description: "Your return pickup has been scheduled.",
      statuses: ["reverse_pickup_scheduled", "manual_ship_back"],
    },
    {
      title: currentStatus === "pickup_failed" ? "Pickup Failed" : "Product Shipped Back",
      description: currentStatus === "pickup_failed"
        ? "The pickup could not be completed. A new pickup will be arranged."
        : "Your item is on its way back to the seller.",
      statuses: ["pickup_failed", "shipped_back", "in_reverse_transit"],
    },
    {
      title: currentStatus === "qc_failed" ? "Quality Check Failed" : "Quality Check",
      description: currentStatus === "qc_failed"
        ? "The returned item did not pass quality inspection."
        : "We are checking the returned item at our facility.",
      statuses: ["received", "qc_passed", "qc_completed", "qc_failed"],
    },
  ];

  if (currentStatus === "qc_failure_upheld" || ret.qcReview?.adminDecision === "uphold") {
    stepsDef.push({
      title: "QC Failure Upheld",
      description: "Marketplace review upheld the QC failure. No refund is due, and the product will be returned to you when required.",
      statuses: ["qc_failure_upheld", "qc_uphold"],
    });
  }

  if (resolution === "replacement") {
    const replacementSteps = [
      {
        title: "Replacement Requested",
        description: ret.replacement?.metadata?.doorstepExchange
          ? "Your doorstep exchange has been approved."
          : "Your replacement is awaiting approval.",
        statuses: ["replacement_requested", "replacement_pending"],
      },
      {
        title: "Replacement Order Created",
        description: ret.replacement?.metadata?.doorstepExchange
          ? "Your ₹0 replacement order is reserved for the doorstep exchange."
          : "A linked replacement order has been created at no additional charge.",
        statuses: ["replacement_created"],
      },
      {
        title: "Replacement Shipped",
        description: "Your replacement product is on its way.",
        statuses: ["replacement_shipped"],
      },
      {
        title: "Replacement Delivered",
        description: "Your replacement product has been delivered.",
        statuses: ["replacement_delivered"],
      },
      {
        title: "Replacement Completed",
        description: "The replacement item has been delivered.",
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
  const [qcDispute, setQcDispute] = useState({ returnId: null, reason: "", evidence: "", submitting: false });

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

  const submitQcDispute = async () => {
    if (!qcDispute.returnId || qcDispute.reason.trim().length < 10) {
      notify.error("Please explain the QC dispute in at least 10 characters.");
      return;
    }
    try {
      setQcDispute((current) => ({ ...current, submitting: true }));
      await dispatch(disputeReturnQc({
        returnId: qcDispute.returnId,
        reason: qcDispute.reason.trim(),
        evidence: qcDispute.evidence.split(/[\n,]/).map((value) => value.trim()).filter(Boolean),
      })).unwrap();
      notify.success("Your QC dispute was submitted for marketplace review.");
      setQcDispute({ returnId: null, reason: "", evidence: "", submitting: false });
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
          const qcDisputeDeadline = ret.qcReview?.disputeDeadline ? new Date(ret.qcReview.disputeDeadline) : null;
          const qcDisputeOpen = !qcDisputeDeadline || qcDisputeDeadline >= new Date();

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
                  <h3 className="font-semibold text-amber-900">Quality check failed — marketplace review</h3>
                  <p className="mt-1 text-sm text-amber-800">The seller reported that the returned product did not pass inspection. Your refund remains on hold until the evidence is reviewed.</p>
                  {(ret.qcReview?.sellerEvidence || []).map((evidence, index) => (
                    <div key={evidence.orderItemId || index} className="mt-3 rounded-lg bg-white p-3 text-sm text-[#454545]">
                      <div className="font-medium">Seller finding: {String(evidence.result || "").replace(/_/g, " ")}</div>
                      <div>{evidence.notes || "No inspection note provided."}</div>
                      {(evidence.photos || []).map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" className="mr-3 text-blue-700 underline">View evidence</a>)}
                    </div>
                  ))}
                  {ret.qcReview?.customerDispute ? (
                    <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">Your dispute is under admin review: {ret.qcReview.customerDispute.reason}</p>
                  ) : !qcDisputeOpen ? (
                    <p className="mt-3 rounded-lg bg-stone-100 p-3 text-sm text-stone-700">The QC dispute window closed on {qcDisputeDeadline.toLocaleString("en-IN")}.</p>
                  ) : qcDispute.returnId === returnId ? (
                    <div className="mt-4 space-y-3">
                      <textarea className="w-full rounded-lg border border-amber-300 bg-white p-3 text-sm" rows={4} placeholder="Explain why you disagree with the QC result" value={qcDispute.reason} onChange={(event) => setQcDispute((current) => ({ ...current, reason: event.target.value }))} />
                      <textarea className="w-full rounded-lg border border-amber-300 bg-white p-3 text-sm" rows={2} placeholder="Optional evidence image URLs, one per line" value={qcDispute.evidence} onChange={(event) => setQcDispute((current) => ({ ...current, evidence: event.target.value }))} />
                      <div className="flex gap-2">
                        <button type="button" disabled={qcDispute.submitting} onClick={submitQcDispute} className="rounded-lg bg-[#3E4093] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Submit dispute</button>
                        <button type="button" onClick={() => setQcDispute({ returnId: null, reason: "", evidence: "", submitting: false })} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setQcDispute({ returnId, reason: "", evidence: "", submitting: false })} className="mt-3 rounded-lg bg-[#3E4093] px-4 py-2 text-sm font-semibold text-white">Dispute QC result</button>
                  )}
                </div>
              )}

              {ret.qcReview?.status === "resolved" && (
                <div className="border-t border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 sm:p-6">
                  <strong>Marketplace decision:</strong> {String(ret.qcReview.adminDecision || "").replace(/_/g, " ")} — {ret.qcReview.decisionReason}
                </div>
              )}

              {ret.returnToCustomer?.trackingNumber && (
                <div className="border-t border-purple-200 bg-purple-50 p-4 text-sm text-purple-900 sm:p-6">
                  <strong>Product returning to you:</strong> {ret.returnToCustomer.courierName} · {ret.returnToCustomer.trackingNumber} · {String(ret.returnToCustomer.status || "").replace(/_/g, " ")}
                  {ret.returnToCustomer.trackingUrl && <a className="ml-3 underline" href={ret.returnToCustomer.trackingUrl} target="_blank" rel="noreferrer">Track shipment</a>}
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
