import { Link } from "react-router-dom";
import { Truck, Copy, Calendar, PackageCheck, AlertCircle, ArrowUpRight } from "lucide-react";
import { ImageWithFallback } from "../../../components/ui";
import { formatMoney } from "../../../utils/ecommerce";
import ShowMoreText from "../../../utils/showMore";
import { capitalizeFirst } from "../../../utils/stringUtils";
import { notify } from "../../../utils/notify";

const getStatusBadgeStyle = (statusRaw = "") => {
  const s = String(statusRaw).toLowerCase();
  if (s.includes("refunded") || s.includes("passed") || s.includes("completed") || s.includes("replaced") || s.includes("approved")) {
    return "bg-[#E6F4EA] text-[#0D652D] border-[#CEEAD6]";
  }
  if (s.includes("failed") || s.includes("rejected") || s.includes("upheld") || s.includes("closed")) {
    return "bg-[#FCE8E6] text-[#C5221F] border-[#FAD2CF]";
  }
  if (s.includes("transit") || s.includes("shipped") || s.includes("received") || s.includes("pickup") || s.includes("scheduled")) {
    return "bg-[#E8F0FE] text-[#1967D2] border-[#D2E3FC]";
  }
  return "bg-[#FFF8E7] text-[#9A6D00] border-[#FCE8B3]";
};

export default function ReturnItemCard({
  title,
  image,
  orderId,
  quantity = 1,
  seller = "Sam Global Seller",
  price,
  currency = "INR",
  status,
  requestedOn,
  returnId,
  reason,
  refundAmount,
  expectedDate,
  onTrackRequest,
  trackLabel = "Track Order",
  productPath = "",
  className = "",
}) {
  const badgeStyle = getStatusBadgeStyle(status);

  const handleCopyReturnId = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (returnId) {
      navigator.clipboard.writeText(returnId);
      notify.success("Return ID copied to clipboard!");
    }
  };

  return (
    <article
      className={`w-full overflow-hidden rounded-2xl border border-[#E7D9B8] bg-[#FFFCF6] shadow-2xs transition-shadow hover:shadow-xs ${className}`}
    >
      {/* ── Top Header Bar ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFE5D2] bg-[#FFFDF9] px-4 py-2.5 sm:px-5">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold text-[#4E4E4E]">
          <div className="flex items-center gap-1.5 text-[#1B1D60]">
            <span className="text-[#6E6E6E]">Return ID:</span>
            <span className="font-mono font-bold text-[#1B1D60]">{returnId}</span>
            <button
              type="button"
              onClick={handleCopyReturnId}
              title="Copy Return ID"
              className="text-[#6E6E6E] hover:text-[#CE9F2D] transition-colors"
            >
              <Copy size={13} />
            </button>
          </div>
          {requestedOn && (
            <>
              <span className="text-[#C0C4D0]">•</span>
              <span className="flex items-center gap-1 text-[#6E6E6E]">
                <Calendar size={13} className="text-[#6E6E6E]" />
                Requested on {requestedOn}
              </span>
            </>
          )}
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${badgeStyle}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {capitalizeFirst(status)}
        </span>
      </div>

      {/* ── Main Body: Product Details & Info Table Grid ────────────── */}
      <div className="p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row items-start gap-3.5 sm:gap-4">
          {/* Thumbnail - Prominent, wider rectangular size matching right column height */}
          <div className="shrink-0 flex items-center justify-center overflow-hidden rounded-xl border border-[#E7D9B8] bg-white p-2 w-[130px] h-[125px] sm:w-[150px] sm:h-[135px] lg:w-[165px] lg:h-[142px]">
            {productPath ? (
              <Link to={productPath} className="flex h-full w-full items-center justify-center group">
                <ImageWithFallback
                  src={image}
                  alt={title}
                  className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
                  imgClassName="object-contain max-h-full max-w-full mix-blend-multiply"
                />
              </Link>
            ) : (
              <ImageWithFallback
                src={image}
                alt={title}
                className="max-h-full max-w-full object-contain"
                imgClassName="object-contain max-h-full max-w-full mix-blend-multiply"
              />
            )}
          </div>

          {/* Right Column: Title & Qty on top, Info Grid starting right below in the right column */}
          <div className="min-w-0 flex-1 flex flex-col justify-between space-y-3">
            {/* Top Meta with improved spacing */}
            <div className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold leading-snug text-[#1B1D60] hover:text-[#CE9F2D] transition-colors">
                {productPath ? (
                  <Link to={productPath} className="inline-flex items-baseline gap-1 group">
                    <ShowMoreText
                      text={title}
                      mode="characters"
                      limit={75}
                      moreLabel="more"
                      lessLabel="less"
                      textClassName="inline"
                      buttonClassName="ml-1 text-xs font-semibold text-[#CE9F2D] hover:underline"
                    />
                    <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#CE9F2D] inline shrink-0" />
                  </Link>
                ) : (
                  <ShowMoreText
                    text={title}
                    mode="characters"
                    limit={75}
                    moreLabel="more"
                    lessLabel="less"
                    textClassName="inline"
                    buttonClassName="ml-1 text-xs font-semibold text-[#CE9F2D] hover:underline"
                  />
                )}
              </h2>

              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#6E6E6E]">
                <span className="rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[#2E2E2E] font-semibold">
                  Qty: {quantity}
                </span>
                {seller && (
                  <>
                    <span className="text-[#C0C4D0]">•</span>
                    <span>Sold by: <strong className="text-[#2E2E2E]">{seller}</strong></span>
                  </>
                )}
              </div>
            </div>

            {/* ── Info Grid directly below Qty inside right column ────── */}
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 rounded-xl border border-[#EFE5D2] bg-[#FFFDF9] p-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1">
                {/* Reason */}
                <div className="min-w-0 space-y-0.5 border-b sm:border-b-0 sm:border-r border-[#EFE5D2] pb-2 sm:pb-0 sm:pr-3">
                  <p className="text-[11px] font-medium text-[#6E6E6E] flex items-center gap-1">
                    <AlertCircle size={13} className="text-[#CE9F2D] shrink-0" />
                    Reason for Return
                  </p>
                  <div className="text-xs font-semibold text-[#1B1D60] leading-snug">
                    <ShowMoreText
                      label="Reason for Return"
                      text={capitalizeFirst(reason) || "Not specified"}
                      mode="lines"
                      limit={1}
                      buttonClassName="ml-1 text-[11px] font-semibold text-[#CE9F2D] hover:underline"
                    />
                  </div>
                </div>

                {/* Refund Amount */}
                <div className="min-w-0 space-y-0.5 border-b sm:border-b-0 sm:border-r border-[#EFE5D2] pb-2 sm:pb-0 sm:pr-3">
                  <p className="text-[11px] font-medium text-[#6E6E6E] flex items-center gap-1">
                    <PackageCheck size={13} className="text-[#0D652D] shrink-0" />
                    Refund Amount
                  </p>
                  <p className="text-sm sm:text-base font-bold text-[#0D652D]">
                    {formatMoney(refundAmount || price || 0, currency)}
                  </p>
                </div>

                {/* Expected Date */}
                <div className="min-w-0 space-y-0.5">
                  <p className="text-[11px] font-medium text-[#6E6E6E] flex items-center gap-1">
                    <Calendar size={13} className="text-[#CE9F2D] shrink-0" />
                    Expected Date
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-[#1B1D60]">
                    {expectedDate || "—"}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 pt-2 xl:pt-0 xl:pl-3 border-t xl:border-t-0 xl:border-l border-[#EFE5D2] flex items-center justify-end">
                <button
                  type="button"
                  onClick={onTrackRequest}
                  className="w-full xl:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#CE9F2D] px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:opacity-90 transition-opacity"
                >
                  <Truck size={14} />
                  <span>{trackLabel}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
