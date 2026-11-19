import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { cn } from "../../../utils/common";
import { checkServiceability } from "../../../features/delivery/deliverySlice";
import {
  Truck,
  CheckCircle2,
  XCircle,
  MapPin,
  ArrowRight,
  Loader2,
} from "lucide-react";

import ConfirmModal from "../../../components/ui/overlay/ConfirmModal";
import { Download } from "lucide-react";

import DynamicButton from "../../../components/ui/button/button.jsx";
import { resolveInputClasses } from "../../../components/ui/inputs/inputStyles";

export default function DeliveryChecker({
  productId: initialProductId,
  onResultChange,
  standalone = false,
  compactMobile = false,
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

    return () =>
      window.removeEventListener("open-delivery-checker", handleOpen);
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

  const check = async () => {
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
        checkServiceability({
          pincode: pin,
          productId: targetProductId,
        }),
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
    if (loading) return;

    setIsModalOpen(false);
    setPincode("");
    setLastCheckedPincode("");
    setResult(null);
    setError("");
    onResultChange?.(null);
  };

  if (standalone && !isModalOpen) {
    return null;
  }

  return (
    <div className={standalone ? "" : "w-full"}>
      {/* Delivery Checker Trigger */}
      {!standalone && (
        <div className="flex min-w-0 flex-col gap-2">
          {compactMobile ? (
            <div className="min-w-0">
              <label
                htmlFor="product-delivery-pincode"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6F7480]"
              >
                Pincode
              </label>

              {/* Pincode Input Wrapper */}
              <div
                className={cn(
                  "flex h-10 w-full items-center gap-1 p-1",
                  resolveInputClasses({ variant: "quantity" }),
                )}
              >
                {/* Pincode Trigger */}
                <DynamicButton
                  id="product-delivery-pincode"
                  variant="unstyled"
                  size="none"
                  shape="rounded"
                  onClick={() => setIsModalOpen(true)}
                  disabled={loading}
                  className="!h-full !min-w-0 !flex-1 !justify-start !px-3 !py-0"
                >
                  <span className="flex min-w-0 w-full items-center justify-start gap-2">
                    {loading ? (
                      <Loader2
                        size={16}
                        className="shrink-0 animate-spin text-gold-dark"
                      />
                    ) : (
                      <MapPin size={16} className="shrink-0 text-gold-dark" />
                    )}

                    <span className="min-w-0 truncate text-left text-sm font-semibold text-[#1B1D60]">
                      {lastCheckedPincode || "Enter pincode"}
                    </span>
                  </span>
                </DynamicButton>
                <DynamicButton
                  variant="primary"
                  size="iconSm"
                  shape="circle"
                  onClick={() => setIsModalOpen(true)}
                  disabled={loading}
                  aria-label="Open delivery checker"
                  
                >
                  <ArrowRight/>
                </DynamicButton>
              </div>
            </div>
          ) : (
            <div
              onClick={() => !loading && setIsModalOpen(true)}
              className="group flex w-full min-w-0 cursor-pointer flex-col items-start gap-3 rounded-lg border border-border bg-surface-soft p-4 text-left transition-colors hover:border-gold hover:bg-cream sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
                  {loading ? (
                    <Loader2
                      size={18}
                      className="animate-spin text-gold-dark"
                    />
                  ) : (
                    <MapPin size={18} />
                  )}
                </div>

                <div className="min-w-0">
                  <span className="block text-base font-semibold text-navy">
                    Delivery details
                  </span>

                  <span className="mt-1 block break-words text-sm leading-relaxed text-muted">
                    {lastCheckedPincode
                      ? `Delivering to ${lastCheckedPincode}`
                      : "Check delivery availability in your area"}
                  </span>
                </div>
              </div>

              <DynamicButton
                variant="qtyWhite"
                size="sm"
                shape="rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
                disabled={loading}
                rightIcon={<ArrowRight size={14} aria-hidden="true" />}
                className="self-stretch sm:self-center"
              >
                {lastCheckedPincode ? "Change pincode" : "Enter pincode"}
              </DynamicButton>
            </div>
          )}

          {/* Inline Delivery Status */}
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

      {/* Reusable Confirm Modal */}
      <ConfirmModal
        open={isModalOpen}
        title="Check Delivery"
        icon={Truck}
        iconBgClassName="bg-[#F5E9C9]"
        iconClassName="text-[#A96F14]"
        description="Enter your 6-digit delivery pincode to check estimated arrival times, shipping costs, and COD availability for your location."
        confirmLabel={loading ? "Checking..." : "Check Availability"}
        confirmDisabled={loading || pincode.length !== 6}
        cancelLabel="Close"
        onConfirm={check}
        onCancel={closeModal}
        maxWidth="max-w-[420px]"
        modalClassName="rounded-lg"
        confirmClassName="bg-gradient-to-r from-[#CE9F2D] to-[#A96F14] hover:brightness-105"
      >
        <div className="grid min-w-0 gap-4">
          <div className="grid min-w-0 gap-2">
            <input
              id="delivery-pincode"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
              value={pincode}
              disabled={loading}
              onChange={(e) => {
                setError("");
                setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && pincode.length === 6 && !loading) {
                  e.preventDefault();
                  check();
                }
              }}
              placeholder="Enter 6-digit Pincode"
              className={cn(
                resolveInputClasses({ variant: "default" }),
                "h-11 w-full min-w-0 px-4 text-sm font-medium text-[#1B1D60] placeholder:text-[#8C8E9E] bg-white",
              )}
            />

            {error && (
              <p className="text-xs font-semibold text-red-600">{error}</p>
            )}
          </div>

          {/* Delivery Result */}
          {result && (
            <div
              className={`rounded-lg p-3 ${
                result.serviceable ? "bg-emerald-50" : "bg-red-50"
              }`}
            >
              {result.serviceable ? (
                <div className="flex items-start gap-2">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <div className="min-w-0 text-xs leading-relaxed text-emerald-800">
                    <p className="font-bold">Delivery available!</p>

                    <p className="mt-1">
                      Deliverable to <strong>{lastCheckedPincode}</strong>
                    </p>

                    {etaText && <p>Estimated delivery: {etaText} days</p>}

                    <p>
                      {deliveryCharge > 0
                        ? `Delivery Charge: ${new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                            maximumFractionDigits: 0,
                          }).format(deliveryCharge)}`
                        : "Free Shipping"}
                    </p>

                    {resultCodAvailable !== undefined && (
                      <p>
                        {resultCodAvailable
                          ? "COD Available"
                          : "COD Not Available"}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <XCircle size={18} className="mt-0.5 shrink-0 text-red-600" />

                  <p className="text-xs font-semibold leading-relaxed text-red-700">
                    Sorry, we do not ship to this pincode. Try another one.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </ConfirmModal>
    </div>
  );
}
