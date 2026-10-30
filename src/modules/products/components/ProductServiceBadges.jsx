import { Clock, Truck, Banknote } from "lucide-react";

export default function ProductServiceBadges({
  shippingEtaText,
  staticIsFree,
  staticCharge,
  productCodAvailable,
  productCodDisabled,
  className = "",
  layout = "cards",
}) {
  const formattedCharge =
    staticCharge > 0
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(staticCharge)
      : "";
  const rowItemClass =
    "flex min-h-[76px] min-w-0 w-full items-center justify-center gap-2 rounded-lg border border-border bg-[#F5F5F9] px-2 py-4 text-center sm:px-3";

  return (
    <div className={`${layout === "row" ? "grid w-full grid-cols-3 gap-1 sm:gap-2" : "grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 2xl:grid-cols-3 gap-3"} ${className}`}>
      {/* 1. Dispatch / Shipping ETA with Flipkart-style icon */}
      {shippingEtaText && (
        <div className={`${layout === "row" ? rowItemClass : "flex items-center gap-3 rounded-lg border border-border bg-white p-3 shadow-xs hover:border-gold transition-colors"}`}>
          <div className={`flex shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-dark ${layout === "row" ? "h-9 w-9" : "h-10 w-10"}`}>
            <Clock size={20} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-muted">Dispatch</span>
            <span className={`${layout === "row" ? "block text-xs font-bold leading-4 text-ink sm:text-sm" : "block text-sm font-bold text-ink break-words"}`}>
              Ships in {shippingEtaText} {shippingEtaText === "1" ? "Day" : "Days"}
            </span>
          </div>
        </div>
      )}

      {/* 2. COD Status with Flipkart-style icon */}
      {productCodAvailable && (
        <div className={`${layout === "row" ? rowItemClass : "flex items-center gap-3 rounded-lg border border-border bg-white p-3 shadow-xs hover:border-gold transition-colors"}`}>
          <div className={`flex shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-dark ${layout === "row" ? "h-9 w-9" : "h-10 w-10"}`}>
            <Banknote size={20} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-muted">Payment</span>
            <span className={`${layout === "row" ? "block text-xs font-bold leading-4 text-ink sm:text-sm" : "block text-sm font-bold text-ink break-words"}`}>
              Cash on Delivery
            </span>
          </div>
        </div>
      )}

      {productCodDisabled && (
        <div className={`${layout === "row" ? `${rowItemClass} border-[#FEE2E2]` : "flex items-center gap-3 rounded-lg border border-[#FEE2E2] bg-white p-3 shadow-xs"}`}>
          <div className={`flex shrink-0 items-center justify-center rounded-full bg-[#FEE2E2] text-[#DC2626] ${layout === "row" ? "h-9 w-9" : "h-10 w-10"}`}>
            <Banknote size={20} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-muted">Payment</span>
            <span className={`${layout === "row" ? "block text-xs font-bold leading-4 text-[#DC2626] sm:text-sm" : "block text-sm font-bold text-[#DC2626] break-words"}`}>
              Prepaid Only
            </span>
          </div>
        </div>
      )}

      {/* 3. Shipping Fee / Free Shipping */}
      {staticIsFree ? (
        <div className={`${layout === "row" ? rowItemClass : "flex items-center gap-3 rounded-lg border border-border bg-white p-3 shadow-xs hover:border-gold transition-colors"}`}>
          <div className={`flex shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-dark ${layout === "row" ? "h-9 w-9" : "h-10 w-10"}`}>
            <Truck size={20} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-muted">Delivery</span>
            <span className={`${layout === "row" ? "block text-xs font-bold leading-4 text-[#16A34A] sm:text-sm" : "block text-sm font-bold text-[#16A34A] break-words"}`}>
              Free Delivery
            </span>
          </div>
        </div>
      ) : staticCharge > 0 ? (
        <div className={`${layout === "row" ? rowItemClass : "flex items-center gap-3 rounded-lg border border-border bg-white p-3 shadow-xs hover:border-gold transition-colors"}`}>
          <div className={`flex shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-dark ${layout === "row" ? "h-9 w-9" : "h-10 w-10"}`}>
            <Truck size={20} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-muted">Delivery</span>
            <span className={`${layout === "row" ? "block text-xs font-bold leading-4 text-ink sm:text-sm" : "block text-sm font-bold text-ink break-words"}`}>
              {formattedCharge}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
