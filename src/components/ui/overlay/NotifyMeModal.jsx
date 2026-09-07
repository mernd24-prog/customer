import { useState, useEffect } from "react";
import { CheckCircle2, BellRing } from "lucide-react";
import BaseModal from "./BaseModal";
import PhoneField from "../PhoneField";
import Button from "../buttons/Button";
import { getProductImage, getProductTitle } from "../../../utils/ecommerce";

export default function NotifyMeModal({
  open,
  onClose,
  product,
  selectedVariant,
  onSubmit,
}) {
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [dialCode, setDialCode] = useState("+91");
  const [touched, setTouched] = useState({
    fullName: false,
    mobileNumber: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setFullName("");
      setMobileNumber("");
      setDialCode("+91");
      setTouched({ fullName: false, mobileNumber: false });
      setSubmitting(false);
      setSubmitted(false);
    }
  }, [open]);

  if (!open) return null;

  const productTitle =
    getProductTitle({ ...product, selectedVariant }) ||
    product?.title ||
    product?.name ||
    "Product";
  const productImage =
    getProductImage({ ...product, selectedVariant }) ||
    product?.images?.[0] ||
    product?.user_image ||
    "";

  let variantLabel = null;
  if (selectedVariant?.attributes) {
    variantLabel = Object.entries(selectedVariant.attributes)
      .map(([k, v]) => `${k}: ${typeof v === "object" ? v.name || v.label : v}`)
      .join(" | ");
  } else if (selectedVariant?.color || selectedVariant?.size) {
    variantLabel = [selectedVariant.color, selectedVariant.size]
      .filter(Boolean)
      .join(" / ");
  } else if (product?.color) {
    variantLabel = `Colour: ${product.color}`;
  }

  const isFullNameValid = fullName.trim().length >= 2;
  const isMobileValid = /^[6-9]\d{9}$/.test(mobileNumber.trim());
  const isFormValid = isFullNameValid && isMobileValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || submitting) return;

    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({
          fullName: fullName.trim(),
          mobileNumber: mobileNumber.trim(),
          dialCode,
          product,
          selectedVariant,
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to process notification request", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseModal
      maxWidth="max-w-md"
      onClose={onClose}
      className="rounded-[20px] border border-[#EEDFB9] bg-[#FFFDF8] p-6 shadow-xl"
    >
      {submitted ? (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#CE9F2D]/15 text-[#CE9F2D]">
            <CheckCircle2 size={36} className="text-[#CE9F2D]" />
          </div>

          <h3 className="mb-2 text-2xl font-bold tracking-tight text-[#2D347D]">
            You’re on the list!
          </h3>

          <p className="mb-6 max-w-xs text-sm font-medium text-[#6F7480]">
            We’ll notify you when this product is back in stock.
          </p>

          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            onClick={onClose}
            className="max-w-xs rounded-[10px] bg-[#CE9F2D] text-white hover:bg-[#b88c22]"
          >
            Done
          </Button>
        </div>
      ) : (
        <div>
          {/* Header */}
          <div className="mb-4 flex items-start gap-3 pr-6">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3E4093]/10 text-[#3E4093]">
              <BellRing size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#2D347D]">
                Get Notified When Available
              </h2>
              <p className="mt-1 text-xs text-[#6F7480] sm:text-sm">
                This product is currently out of stock. Enter your details and
                we’ll notify you when it becomes available.
              </p>
            </div>
          </div>

          {/* Product Preview Box */}
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#EEDFB9] bg-white p-3 shadow-sm">
            {productImage ? (
              <img
                src={productImage}
                alt={productTitle}
                className="h-14 w-14 shrink-0 rounded-lg border border-[#EEDFB9]/60 bg-[#FFFDF8] object-contain p-1"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                No image
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4
                className="truncate text-sm font-bold text-[#2D347D]"
                title={productTitle}
              >
                {productTitle}
              </h4>
              {variantLabel && (
                <p className="mt-0.5 truncate text-xs font-medium text-[#6F7480]">
                  {variantLabel}
                </p>
              )}
              {product?.price != null && (
                <p className="mt-0.5 text-xs font-bold text-blue">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="notify-full-name"
                className="mb-1.5 block text-base font-medium  text-black/90"
              >
                Full Name <span className="text-black">*</span>
              </label>
              <input
                id="notify-full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, fullName: true }))
                }
                placeholder="Enter your full name"
                className={`h-11 w-full rounded-[8px] border bg-white px-3 text-sm font-medium text-[#2E2E2E] outline-none transition-colors duration-200 placeholder:text-[#8D8F98] ${
                  touched.fullName && !isFullNameValid
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#EEDFB9] focus:outline-none"
                }`}
              />
              {touched.fullName && !isFullNameValid && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  Please enter your full name (at least 2 characters).
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <PhoneField
                id="notify-mobile-number"
                label="Mobile Number *"
                placeholder="10-digit mobile number"
                dialCodes={["+91"]}
                phoneRegistration={{
                  value: mobileNumber,
                  onChange: (e) => setMobileNumber(e.target.value),
                  onBlur: () =>
                    setTouched((prev) => ({ ...prev, mobileNumber: true })),
                }}
                dialCodeRegistration={{
                  value: dialCode,
                  onChange: (e) => setDialCode(e.target.value),
                }}
                error={
                  touched.mobileNumber && !isMobileValid
                    ? {
                        message: "Please enter a valid 10-digit mobile number.",
                      }
                    : undefined
                }
              />
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                fullWidth
                onClick={onClose}
                className="h-11 rounded-[10px]"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={submitting}
                disabled={!isFormValid || submitting}
                className="h-11 rounded-[10px] bg-[#CE9F2D] text-white hover:bg-[#b88c22]"
              >
                Notify Me
              </Button>
            </div>
          </form>
        </div>
      )}
    </BaseModal>
  );
}
