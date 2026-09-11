import Seo from "../../../components/ui/Seo";
import Breadcrumbs from "../../common/components/Breadcrumbs";
import ApiState from "../../../components/ui/ApiState";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  disputeReturnQc,
  fetchMyReturns,
} from "../slices/returnsSlice";
import FilterDropdown from "../../../components/ui/FilterDropdown";
import { notify } from "../../../utils/notify";
import {
  ChevronDown,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarClock,
  AlertTriangle,
  Send,
  Truck,
  RefreshCw,
  Inbox,
  ShieldCheck,
  AlertOctagon,
  AlertCircle,
  CreditCard,
  RotateCcw,
  PackagePlus,
  PackageCheck,
  Lock,
} from "lucide-react";
import { AllOrdersIcon } from "../../../components/ui/icons";
import ReturnItemCard from "../components/ReturnItemCard";
import ReturnTrackingCard from "../components/ReturnTrackingCard";
import { RETURNS_PAGE_SKELETON } from "../../../components/ui/skeleton/layouts";
import AppErrorBoundary from "../../../components/ui/AppErrorBoundary";
import { getProductPublicPath } from "../../../utils/ecommerce";
import useReturnsRefunds from "../controllers/useReturnsRefunds";

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
/* ─── Tracking-step builder ───────────────────────────────── */
const buildTrackingSteps = (ret) => {
  if (!ret) return [];
  const timeline = Array.isArray(ret.timeline) ? ret.timeline : [];

  const uniqueTimeline = [];
  const seen = new Set();
  for (let i = timeline.length - 1; i >= 0; i--) {
    if (!seen.has(timeline[i].status)) {
      uniqueTimeline.unshift(timeline[i]);
      seen.add(timeline[i].status);
    }
  }

  const recordedSteps = uniqueTimeline.map((t, idx) => {
    const status = t.status || "";
    let title = STATUS_FILTERS.find(f => f.value === status)?.label || String(status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    let rawNote = t.note || t.reason || "";
    if (rawNote && (rawNote.includes("http://") || rawNote.includes("https://") || rawNote.includes("Timeline-,"))) {
      rawNote = "";
    }

    let description = rawNote;
    if (status === "requested" && !description) {
      description = ret.description || "";
    }

    if (
      status === "reverse_pickup_scheduled" &&
      ret.reverseShipment?.pickupScheduledAt
    ) {
      const scheduledDate = new Date(
        ret.reverseShipment.pickupScheduledAt,
      ).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      description = description
        ? `${description} | Expected Pickup: ${scheduledDate}`
        : `Expected Pickup: ${scheduledDate}`;
    }

    const time = t.at
      ? new Date(t.at).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "—";

    const isLast = idx === uniqueTimeline.length - 1;

    return {
      title,
      description,
      time,
      completed: true,
      active: isLast,
    };
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

const getReturnStatusIcon = (status, size = 15) => {
  const iconClass = "shrink-0 text-[var(--customer-gold-dark)]";
  switch (status) {
    case "all":
      return <AllOrdersIcon size={size} className={iconClass} />;
    case "requested":
      return <Clock size={size} className={iconClass} />;
    case "approved":
      return <CheckCircle2 size={size} className={iconClass} />;
    case "rejected":
      return <XCircle size={size} className={iconClass} />;
    case "reverse_pickup_scheduled":
      return <CalendarClock size={size} className={iconClass} />;
    case "pickup_failed":
      return <AlertTriangle size={size} className={iconClass} />;
    case "manual_ship_back":
      return <Send size={size} className={iconClass} />;
    case "shipped_back":
    case "in_reverse_transit":
      return <Truck size={size} className={iconClass} />;
    case "received":
      return <Inbox size={size} className={iconClass} />;
    case "qc_passed":
      return <ShieldCheck size={size} className={iconClass} />;
    case "qc_failed":
      return <AlertOctagon size={size} className={iconClass} />;
    case "qc_completed":
      return <CheckCircle2 size={size} className={iconClass} />;
    case "qc_failure_upheld":
      return <AlertCircle size={size} className={iconClass} />;
    case "refund_pending":
      return <Clock size={size} className={iconClass} />;
    case "refund_failed":
      return <XCircle size={size} className={iconClass} />;
    case "partially_refunded":
      return <RotateCcw size={size} className={iconClass} />;
    case "refunded":
      return <CheckCircle2 size={size} className={iconClass} />;
    case "replacement_requested":
      return <RefreshCw size={size} className={iconClass} />;
    case "replacement_pending":
      return <Clock size={size} className={iconClass} />;
    case "replacement_created":
      return <PackagePlus size={size} className={iconClass} />;
    case "replacement_shipped":
      return <Truck size={size} className={iconClass} />;
    case "replacement_delivered":
    case "replaced":
      return <PackageCheck size={size} className={iconClass} />;
    case "closed":
      return <Lock size={size} className={iconClass} />;
    default:
      return <AllOrdersIcon size={size} className={iconClass} />;
  }
};


/* ─── Main page ───────────────────────────────────────────────────────── */
function ReturnsRefundsPage() {
  const {
    state,
    returns,
    statusFilter,
    expandedReturnId,
    qcDispute,
    setQcDispute,
    visibleCount,
    setVisibleCount,
    filteredReturns,
    visibleReturns,
    hasMoreReturns,
    handleStatusFilterChange,
    toggleTracking,
    submitQcDispute
  } = useReturnsRefunds();

  const returnFilterOptions = useMemo(
    () =>
      STATUS_FILTERS.map((opt) => ({
        value: opt.value,
        label: opt.label,
        icon: getReturnStatusIcon(opt.value, 16),
      })),
    [],
  );

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Returns & Refunds" },
  ];

  const renderReturnsList = useCallback((list) => {
    return (
      <div className="flex flex-col gap-4">
        {list.map((ret) => {
          const returnId =
            ret._id || ret.id || ret.returnId || ret.returnNumber;

          const isExpanded = expandedReturnId === returnId;
          const trackingSteps = buildTrackingSteps(ret);
          const firstItemTitle = ret.items?.[0]?.productTitle || "Product";
          const trackingReturnId = ret.returnNumber || returnId;
          const expectedDate = getExpectedDate(ret);
          const qcDisputeDeadline = ret.qcReview?.disputeDeadline
            ? new Date(ret.qcReview.disputeDeadline)
            : null;
          const qcDisputeOpen =
            !qcDisputeDeadline || qcDisputeDeadline >= new Date();

          return (
            <div
              key={returnId}
              className="overflow-hidden rounded-2xl border border-[#E7D9B8] bg-[#FFFCF6] shadow-2xs transition-all"
            >
              {ret.items?.map((item, idx) => {
                const title = item.productTitle || "Product";
                const image = item.productImage;
                const orderId = ret.orderId;
                const quantity = item.quantity || item.requestedQuantity || 1;
                const seller = item.sellerName || "Sam Global Seller";
                const price = item.lineTotal || item.unitPrice || 0;
                const status = STATUS_FILTERS.find(f => f.value === ret.status)?.label || ret.status?.replace(/_/g, " ");
                const requestedOn = new Date(
                  ret.requestedAt || ret.createdAt || Date.now(),
                ).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                const reason = ret.description;

                const productId = item.productId || item.product_id || item.product?._id || item.product?.id || "";
                const productPath = productId ? getProductPublicPath(item.product || { id: productId }) : "";

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
                    productPath={productPath}
                    className="!border-0 !rounded-none"
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
                        className="w-full rounded-lg border border-amber-300 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white p-3 text-sm"
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
                        className="w-full rounded-lg border border-amber-300 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white p-3 text-sm"
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
  }, [expandedReturnId, qcDispute, toggleTracking, submitQcDispute]);

  return (
    <AppErrorBoundary>
      <Seo title="Returns & Refunds | Sam Global" />
      <div className="py-6 sm:py-8">
        <Breadcrumbs
          items={breadcrumbItems}
        />
        <h1 className="lg:mb-4 lg:mt-5 text-[24px] sm:text-[28px] lg:text-[32px] font-bold text-[#3E4093] ">
          Returns & Refunds
        </h1>

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
            <FilterDropdown
              options={returnFilterOptions}
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
    </AppErrorBoundary>
  );
}

export default ReturnsRefundsPage;
