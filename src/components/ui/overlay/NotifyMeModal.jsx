import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { CheckCircle2, BellRing } from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import {
  getProductImage,
  getProductTitle,
  getProductPrice,
  getVariantPrice,
} from "../../../utils/ecommerce";
import { apiRequest } from "../../../api/client";
import { endpoints } from "../../../api/endpoints";
import { DynamicInput } from "../input";

export default function NotifyMeModal({
  open,
  onClose,
  product,
  selectedVariant,
  userId: propUserId,
  onSubmit,
}) {
  const currentUser = useSelector((state) => state.auth?.current);
  const userProfile = useSelector((state) => state.user?.current);
  const user = userProfile || currentUser;

  const resolvedUserId =
    propUserId ||
    user?._id ||
    user?.id ||
    user?.userId ||
    null;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      const first =
        user?.profile?.firstName ||
        user?.firstName ||
        user?.user?.firstName ||
        user?.user?.profile?.firstName ||
        "";
      const last =
        user?.profile?.lastName ||
        user?.lastName ||
        user?.user?.lastName ||
        user?.user?.profile?.lastName ||
        "";
      const defaultName =
        [first, last].filter(Boolean).join(" ").trim() ||
        user?.fullName ||
        user?.displayName ||
        user?.name ||
        user?.profile?.fullName ||
        user?.profile?.name ||
        user?.user?.name ||
        user?.user?.fullName ||
        "";
      const defaultEmail =
        user?.email ||
        user?.profile?.email ||
        user?.user?.email ||
        "";

      setFullName(defaultName);
      setEmail(defaultEmail);
      setTouched({ fullName: false, email: false });
      setSubmitting(false);
      setSubmitted(false);
    }
  }, [open, user]);

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

  const displayPrice =
    getVariantPrice(selectedVariant) ??
    getProductPrice(product) ??
    selectedVariant?.selling_price ??
    selectedVariant?.sellingPrice ??
    selectedVariant?.price ??
    product?.selling_price ??
    product?.sellingPrice ??
    product?.price ??
    0;

  const isFullNameValid = fullName.trim().length >= 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isFormValid = isFullNameValid && isEmailValid;

  const handleSubmit = async () => {
    if (!isFormValid || submitting) {
      setTouched({ fullName: true, email: true });
      return;
    }

    const payload = {
      userId: resolvedUserId,
      name: fullName.trim(),
      email: email.trim(),
      productId: product?._id || product?.id,
      variantId: selectedVariant?._id || selectedVariant?.id || null,
      price: displayPrice,
      sku: selectedVariant?.sku || product?.sku || "",
    };

    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        await apiRequest({
          method: "post",
          url: endpoints.stockNotifications.create,
          data: payload,
        });
      }
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to process notification request", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ConfirmModal
      open={open}
      title={submitted ? "You’re on the list!" : "Get Notified When Available"}
      description={
        submitted
          ? `We’ll notify you at ${email} when this product is back in stock.`
          : "This product is currently out of stock. Enter your details and we’ll notify you when it becomes available."
      }
      icon={submitted ? CheckCircle2 : BellRing}
      iconBgClassName={submitted ? "bg-[#CE9F2D]/15" : "bg-[#3E4093]/10"}
      iconClassName={submitted ? "text-[#CE9F2D]" : "text-[#3E4093]"}
      confirmLabel={submitted ? "Done" : "Notify Me"}
      confirmLoading={submitting}
      confirmDisabled={!submitted && (!isFormValid || submitting)}
      cancelLabel={submitted ? "" : "Cancel"}
      onConfirm={submitted ? onClose : handleSubmit}
      onCancel={onClose}
      maxWidth="max-w-md"
      modalClassName="border border-[#EEDFB9] bg-[#FFFDF8]"
    >
      {submitted ? (
        <div className="rounded-lg border border-[#EEDFB9] bg-white p-4 text-center">
          <p className="text-sm font-medium text-[#6F7480]">
            You’ll receive an email when this product is available again.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-[#EEDFB9] bg-white p-3 shadow-sm">
            {productImage ? (
              <img
                src={productImage}
                alt={productTitle}
                className="h-16 w-16 shrink-0 object-contain"
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
              {displayPrice > 0 && (
                <p className="mt-0.5 text-xs font-bold text-blue">
                  ₹{Number(displayPrice).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </div>

          <div>
            <DynamicInput
              id="notify-full-name"
              type="text"
              label={<>Full Name <span className="text-black">*</span></>}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
              placeholder="Enter your full name"
              variant="cream"
              size="lg"
              error={touched.fullName && !isFullNameValid ? { message: "Please enter your full name (at least 2 characters)." } : null}
            />
          </div>

          <div>
            <DynamicInput
              id="notify-email"
              type="email"
              label={<>Email Address <span className="text-black">*</span></>}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              placeholder="Enter your email address"
              variant="cream"
              size="lg"
              error={touched.email && !isEmailValid ? { message: "Please enter a valid email address." } : null}
            />
          </div>
        </div>
      )}
    </ConfirmModal>
  );
}
