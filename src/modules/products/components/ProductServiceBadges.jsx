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
    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${className}`}>
      {/* 1. Dispatch / Shipping ETA with Flipkart-style icon */}
      {shippingEtaText && (
        <div className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-xs hover:border-[#CE9F2D] transition-colors">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBF3FF] text-[#1A73E8]">
            <Clock size={20} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-[#6B7280]">Dispatch</span>
            <span className="block text-sm font-bold text-[#111827] truncate">
              Ships in {shippingEtaText} {shippingEtaText === "1" ? "Day" : "Days"}
            </span>
          </div>
        </div>
      )}

      {/* 2. COD Status with Flipkart-style icon */}
      {productCodAvailable && (
        <div className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-xs hover:border-[#CE9F2D] transition-colors">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBF3FF] text-[#1A73E8]">
            <Banknote size={20} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-[#6B7280]">Payment</span>
            <span className="block text-sm font-bold text-[#111827] truncate">
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
            <span className="block text-xs font-medium text-[#6B7280]">Payment</span>
            <span className="block text-sm font-bold text-[#DC2626] truncate">
              Prepaid Only
            </span>
          </div>
        </div>
      )}

      {/* 3. Shipping Fee / Free Shipping */}
      {staticIsFree ? (
        <div className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-xs hover:border-[#CE9F2D] transition-colors">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBF3FF] text-[#1A73E8]">
            <Truck size={20} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-[#6B7280]">Delivery</span>
            <span className="block text-sm font-bold text-[#16A34A] truncate">
              Free Delivery
            </span>
          </div>
        </div>
      ) : staticCharge > 0 ? (
        <div className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-xs hover:border-[#CE9F2D] transition-colors">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBF3FF] text-[#1A73E8]">
            <Truck size={20} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-[#6B7280]">Delivery</span>
            <span className="block text-sm font-bold text-[#111827] truncate">
              {formattedCharge}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-xs hover:border-[#CE9F2D] transition-colors">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBF3FF] text-[#1A73E8]">
            <ShieldCheck size={20} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-[#6B7280]">Quality</span>
            <span className="block text-sm font-bold text-[#111827] truncate">
              100% Genuine
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
