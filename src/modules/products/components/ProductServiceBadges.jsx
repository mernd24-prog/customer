import { Clock, Truck, Banknote } from "lucide-react";

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
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {/* 1. Dispatch / Shipping ETA */}
      {shippingEtaText && (
        <div className="group inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-slate-50/90 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-200 hover:border-slate-300 hover:bg-slate-100/80 hover:shadow-sm">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200/70 text-slate-700 transition-transform group-hover:scale-110">
            <Clock size={12} className="stroke-[2.2]" />
          </span>
          <span>Ships in {shippingEtaText} Days</span>
        </div>
      )}

      {/* 2. Shipping Fee / Free Shipping */}
      {staticIsFree ? (
        <div className="group inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-100/60 hover:shadow-sm">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-200/70 text-emerald-800 transition-transform group-hover:scale-110">
            <Truck size={12} className="stroke-[2.2]" />
          </span>
          <span>Free Shipping</span>
        </div>
      ) : staticCharge > 0 ? (
        <div className="group inline-flex items-center gap-2 rounded-full border border-amber-200/90 bg-amber-50/80 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-200 hover:border-amber-300 hover:bg-amber-100/60 hover:shadow-sm">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200/70 text-amber-800 transition-transform group-hover:scale-110">
            <Truck size={12} className="stroke-[2.2]" />
          </span>
          <span>{formattedCharge} Delivery</span>
        </div>
      ) : null}

      {/* 3. Cash on Delivery Availability */}
      {productCodAvailable && (
        <div className="group inline-flex items-center gap-2 rounded-full border border-teal-200/90 bg-teal-50/80 px-3 py-1.5 text-xs font-semibold text-teal-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-200 hover:border-teal-300 hover:bg-teal-100/60 hover:shadow-sm">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-200/70 text-teal-800 transition-transform group-hover:scale-110">
            <Banknote size={12} className="stroke-[2.2]" />
          </span>
          <span>COD Available</span>
        </div>
      )}

      {productCodDisabled && (
        <div className="group inline-flex items-center gap-2 rounded-full border border-rose-200/90 bg-rose-50/80 px-3 py-1.5 text-xs font-semibold text-rose-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-200 hover:border-rose-300 hover:bg-rose-100/60 hover:shadow-sm">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200/70 text-rose-700 transition-transform group-hover:scale-110">
            <Banknote size={12} className="stroke-[2.2]" />
          </span>
          <span>COD Not Available</span>
        </div>
      )}
    </div>
  );
}
