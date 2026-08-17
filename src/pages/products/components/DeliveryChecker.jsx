import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkServiceability } from "../../../features/delivery/deliverySlice";
import { IoIosSearch } from "react-icons/io";
import { Truck, Banknote, X } from "lucide-react";

export default function DeliveryChecker({ productId, onResultChange }) {
  const dispatch = useDispatch();
  const [pincode, setPincode] = useState("");
  const [lastCheckedPincode, setLastCheckedPincode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        setResult(null);
        onResultChange?.(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [result, onResultChange]);

  const check = async (e) => {
    e.preventDefault();
    const pin = pincode.trim();
    if (!/^\d{6}$/.test(pin)) {
      setError("Enter a valid 6-digit pincode");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const payload = await dispatch(
        checkServiceability({ pincode: pin, productId }),
      ).unwrap();
      const nextResult = payload?.data || payload;
      setResult(nextResult);
      onResultChange?.(nextResult);
      if (nextResult) {
        setLastCheckedPincode(pin);
        setPincode("");
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

  return (
    <div className="flex w-full max-w-[360px] flex-col gap-2">
      <form
        onSubmit={check}
        className="flex h-11 w-full overflow-hidden rounded-full border border-[#1B1D604D] bg-white shadow-sm"
      >
        <input
          type="text"
          value={pincode}
          onChange={(e) => {
            setError("");
            setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
          }}
          placeholder="Enter 6-digit Pincode"
          className="flex-1 min-w-0 bg-transparent border border-none focus:outline-none px-6 text-sm text-[#4E4E4E]"
        />
        <button
          type="submit"
          disabled={loading}
          aria-label="Check delivery pincode"
          className="flex h-full w-14 shrink-0 items-center justify-center bg-navy text-white disabled:opacity-60 transition hover:bg-[#25287d]"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <IoIosSearch className="text-xl" />
          )}
        </button>
      </form>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {result && (
        <div className="relative mt-3 p-4 rounded-xl border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 overflow-hidden">
          {/* Close button */}
          <button
            type="button"
            aria-label="Close delivery result"
            onClick={() => {
              setResult(null);
              onResultChange?.(null);
            }}
            className="absolute top-3 right-3 text-[#2E2E2E]/40 hover:text-[#2E2E2E]/80 transition-colors"
          >
            <X size={16} />
          </button>

          {result.serviceable ? (
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs">
                  ✓
                </span>
                <span>Deliverable to {lastCheckedPincode}</span>
              </div>

              {/* Grid of info */}
              <div className="grid grid-cols-1 gap-2 pt-2 border-t border-gray-100 text-xs text-[#4E4E4E]">
                {etaText && (
                  <div className="flex items-center gap-2.5">
                    <Truck size={14} className="text-[#1B1D60]/75 shrink-0" />
                    <span>
                      Estimated Delivery: <strong>{etaText} Days</strong>
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-[10px] font-bold text-emerald-700 shrink-0">
                    ₹
                  </span>
                  <span>
                    Shipping Charge:{" "}
                    <strong>
                      {deliveryCharge > 0
                        ? `${new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                            maximumFractionDigits: 0,
                          }).format(deliveryCharge)}`
                        : "Free Delivery"}
                    </strong>
                  </span>
                </div>
                {resultCodAvailable !== undefined && (
                  <div className="flex items-center gap-2.5">
                    <Banknote
                      size={14}
                      className={`${resultCodAvailable ? "text-emerald-600" : "text-red-500"} shrink-0`}
                    />
                    <span>
                      Cash on Delivery:{" "}
                      <strong
                        className={
                          resultCodAvailable
                            ? "text-emerald-700"
                            : "text-red-600"
                        }
                      >
                        {resultCodAvailable ? "Available" : "Not Available"}
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5">
               <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-800 text-xs shrink-0 font-bold mt-0.5">
                ✗
              </span>
              <div className="text-sm font-medium text-red-600">
                <span>Delivery Not Available to {lastCheckedPincode}.</span>
                <p className="text-xs text-[#7E7E7E] mt-0.5">
                  Please Check Another Pincode.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
