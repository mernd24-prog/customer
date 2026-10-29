import { Clock, Truck, Banknote, ShieldCheck } from "lucide-react";

export default function ProductServiceBadges({
  shippingEtaText,
  staticIsFree,
  staticCharge,
  productCodAvailable,
  productCodDisabled,
  className = "",
}) {
  const formattedCharge =
    staticCharge > 0
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(staticCharge)
      : "";

  return (
    <div className={`grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 2xl:grid-cols-3 gap-3 ${className}`}>
      {/* 1. Dispatch / Shipping ETA with Flipkart-style icon */}
      {shippingEtaText && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-3 shadow-xs hover:border-gold transition-colors">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
            <Clock size={20} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-muted">Dispatch</span>
            <span className="block text-sm font-bold text-ink break-words">
              Ships in {shippingEtaText} {shippingEtaText === "1" ? "Day" : "Days"}
            </span>
          </div>
        </div>
      )}

      {/* 2. COD Status with Flipkart-style icon */}
      {productCodAvailable && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-3 shadow-xs hover:border-gold transition-colors">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
            <Banknote size={20} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-muted">Payment</span>
            <span className="block text-sm font-bold text-ink break-words">
              Cash on Delivery
            </span>
          </div>
        </div>
      )}

      {productCodDisabled && (
        <div className="flex items-center gap-3 rounded-lg border border-[#FEE2E2] bg-white p-3 shadow-xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2] text-[#DC2626]">
            <Banknote size={20} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-muted">Payment</span>
            <span className="block text-sm font-bold text-[#DC2626] break-words">
              Prepaid Only
            </span>
          </div>
        </div>
      )}

      {/* 3. Shipping Fee / Free Shipping */}
      {staticIsFree ? (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-3 shadow-xs hover:border-gold transition-colors">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
            <Truck size={20} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-muted">Delivery</span>
            <span className="block text-sm font-bold text-[#16A34A] break-words">
              Free Delivery
            </span>
          </div>
        </div>
      ) : staticCharge > 0 ? (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-3 shadow-xs hover:border-gold transition-colors">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
            <Truck size={20} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-muted">Delivery</span>
            <span className="block text-sm font-bold text-ink break-words">
              {formattedCharge}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-3 shadow-xs hover:border-gold transition-colors">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
            <ShieldCheck size={20} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-muted">Quality</span>
            <span className="block text-sm font-bold text-ink break-words">
              100% Genuine
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
