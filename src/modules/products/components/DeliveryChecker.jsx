import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { checkServiceability } from "../../../features/delivery/deliverySlice";
import {
  Truck,
  Banknote,
  CheckCircle2,
  XCircle,
  Package,
  ShieldCheck,
  X,
  MapPin,
} from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "../../../utils/common";

export default function DeliveryChecker({
  productId: initialProductId,
  onResultChange,
  standalone = false,
}) {
  const dispatch = useDispatch();
  const [pincode, setPincode] = useState("");
  const [lastCheckedPincode, setLastCheckedPincode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProductId, setActiveProductId] = useState(initialProductId);

  useEffect(() => {
    setActiveProductId(initialProductId);
  }, [initialProductId]);

  useEffect(() => {
    const handleOpen = (e) => {
      if (e.defaultPrevented) return;
      e.preventDefault();
      if (e.detail?.productId) {
        setActiveProductId(e.detail.productId);
      }
      if (e.detail?.pincode) {
        setPincode(String(e.detail.pincode));
      }
      setIsModalOpen(true);
    };
    window.addEventListener("open-delivery-checker", handleOpen);
    return () => window.removeEventListener("open-delivery-checker", handleOpen);
  }, []);

  useEffect(() => {
    if (!error && result?.serviceable !== false) return undefined;
    const timeoutId = window.setTimeout(() => {
      setError("");
      if (result?.serviceable === false) {
        setResult(null);
        onResultChange?.(null);
      }
    }, 5000);
    return () => window.clearTimeout(timeoutId);
  }, [error, onResultChange, result?.serviceable]);

  const check = async (e) => {
    e?.preventDefault();
    const pin = pincode.trim();
    if (!/^\d{6}$/.test(pin)) {
      setError("Enter a valid 6-digit pincode");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const targetProductId = activeProductId || initialProductId;
      const payload = await dispatch(
        checkServiceability({ pincode: pin, productId: targetProductId }),
      ).unwrap();
      const nextResult = payload?.data || payload;
      setResult(nextResult);
      onResultChange?.(nextResult);
      if (nextResult) {
        setLastCheckedPincode(pin);
      }
    } catch (err) {
      setResult(null);
      onResultChange?.(null);
      setError(
        typeof err === "string" ? err : "Could not check delivery. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const sellerDelivery = result?.deliveryChargeBreakup?.sellers?.[0] || {};
  const eta =
    sellerDelivery.estimatedDeliveryDays ||
    result?.estimatedDeliveryDays ||
    null;
  const etaText = eta
    ? [eta.minDays, eta.maxDays]
        .filter((v) => v !== null && v !== undefined)
        .join("–")
    : "";
  const deliveryCharge = Number(
    result?.sellerDeliveryChargeAmount ?? sellerDelivery.chargeAmount ?? 0,
  );
  const resultCodAvailable = result?.codAvailable;

  const closeModal = () => {
    setIsModalOpen(false);
    setPincode("");
    setLastCheckedPincode("");
    setResult(null);
    setError("");
    onResultChange?.(null);
  };

  if (standalone) {
    if (!isModalOpen) return null;
  }

  return (
    <div className={standalone ? "" : "w-full"}>
      {/* Trigger Link directly below Quantity Selector */}
      {!standalone && (
        <div className=" flex flex-col gap-1 ">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="group inline-flex w-fit items-center gap-2 text-xs sm:text-sm font-semibold text-ink transition-colors hover:text-gold focus:outline-none"
        >
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full text-gold transition-all group-hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, var(--customer-gold-soft) 0%, var(--customer-cream) 100%)",
            }}
          >
            <MapPin size={15} />
          </div>
          <span className="underline decoration-gold/50 underline-offset-4 group-hover:decoration-gold">
            {lastCheckedPincode
              ? `Delivering to ${lastCheckedPincode} (Change)`
              : "Check Delivery & Pincode Availability"}
          </span>
          <span className="text-xs font-bold text-gold transition-transform group-hover:translate-x-1">
            →
          </span>
        </button>

        {/* Quick inline status if already checked */}
        {result &&
          (result.serviceable ? (
            <div className="flex items-center gap-2 pt-0.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
              <span>
                Deliverable to <strong>{lastCheckedPincode}</strong>
                {etaText ? ` • Ships in ${etaText} days` : ""}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-0.5 text-xs font-medium text-red-600">
              <XCircle size={14} className="shrink-0 text-red-500" />
              <span>
                Sorry, we do not ship to this pincode. Try another one.
              </span>
            </div>
          ))}
      </div>
      )}

      {/* Modal Popup portal styled like AuthModal */}
      {isModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4 animate-overlay-in"
            style={{
              backgroundColor: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(6px)",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
            role="dialog"
            aria-modal="true"
          >
            <div
              className={cn(
                "relative w-full bg-white overflow-hidden",
                "rounded-t-[20px] sm:rounded-[var(--customer-radius-lg)]",
                "sm:max-w-[420px]",
                "shadow-2xl",
                "sm:animate-modal-in animate-sheet-in",
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Gold Accent Bar */}
              <div className="h-[3px] w-full bg-gradient-to-r from-gold via-gold to-gold-dark" />

              {/* Mobile drag handle */}
              <div className="flex justify-center pt-3 sm:hidden">
                <div className="h-1 w-10 rounded-full bg-border" />
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={closeModal}
                className={cn(
                  "absolute right-4 top-4 flex h-8 w-8 items-center justify-center",
                  "rounded-full text-muted transition-all duration-300 ease-in-out",
                  "hover:bg-cream hover:text-ink",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1",
                )}
                aria-label="Close Delivery Modal"
              >
                <X size={16} strokeWidth={1.8} />
              </button>

              {/* Body */}
              <div className="px-6 pb-7 pt-5 sm:pt-6 sm:px-7">
                {/* Icon Badge */}
                <div className="mb-4 flex justify-center">
                  <div
                    className="flex h-[60px] w-[60px] items-center justify-center rounded-full text-gold"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--customer-gold-soft) 0%, var(--customer-cream) 100%)",
                      boxShadow:
                        "0 0 0 8px rgba(214, 163, 35, 0.14), 0 0 0 14px rgba(214, 163, 35, 0.08)",
                    }}
                  >
                    <Truck size={28} />
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-center text-[1.25rem] font-semibold leading-snug text-ink">
                  Check Delivery Availability
                </h2>

                {/* Description */}
                <p className="mt-2 text-center text-[0.825rem] leading-relaxed text-muted">
                  Enter your 6-digit delivery pincode to check estimated arrival
                  times, shipping costs, and COD availability for your location.
                </p>

                {/* Divider */}
                <div className="my-5 h-px w-full bg-border" />

                {/* Form */}
                <form onSubmit={check} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => {
                        setError("");
                        setPincode(
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        );
                      }}
                      placeholder="Enter 6-digit Pincode"
                      className="h-11 flex-1 min-w-0 rounded-[8px] border border-border bg-white px-4 text-sm font-medium text-ink placeholder:text-muted/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={loading || pincode.length !== 6}
                      aria-busy={loading}
                      aria-label={
                        loading
                          ? "Checking delivery availability"
                          : "Check delivery availability"
                      }
                      className={cn(
                        "inline-flex h-11 min-w-[82px] items-center justify-center gap-2 px-5 rounded-[8px]",
                        "text-sm font-semibold text-white",
                        "bg-gradient-to-r from-gold to-gold-dark",
                        "shadow-sm hover:shadow-md",
                        "transition-all duration-300 ease-in-out hover:brightness-105 active:brightness-95",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                      )}
                    >
                      {loading ? (
                        <>
                          <span
                            className="block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/40 border-t-white"
                            aria-hidden="true"
                          />
                          <span className="sr-only">
                            Checking delivery availability
                          </span>
                        </>
                      ) : (
                        "Check"
                      )}
                    </button>
                  </div>

                  {error && (
                    <p className="text-xs font-semibold text-red-600 pl-1">
                      {error}
                    </p>
                  )}
                </form>

                {/* Result Block */}
                {result && (
                  <div className="mt-5 overflow-hidden rounded-[10px]  text-xs">
                    {result.serviceable ? (
                      <div className="flex items-center gap-2.5 font-semibold text-emerald-700 text-xs">
                        <CheckCircle2
                          size={16}
                          className="shrink-0 text-emerald-600"
                        />
                        <span className="leading-snug text-xs">
                          Deliverable to <strong>{lastCheckedPincode}</strong>
                          {etaText ? ` • Ships in ${etaText} days` : ""}
                          {deliveryCharge > 0
                            ? ` • ${new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                                maximumFractionDigits: 0,
                              }).format(deliveryCharge)} Delivery`
                            : " • Free Shipping"}
                          {resultCodAvailable !== undefined
                            ? resultCodAvailable
                              ? " • COD Available"
                              : " • COD Not Available"
                            : ""}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 text-red-600 font-semibold">
                        <XCircle size={18} className="shrink-0 text-red-600" />
                        <span className="text-xs font-semibold text-red-600">
                          Sorry, we do not ship to this pincode. Try another
                          one.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
