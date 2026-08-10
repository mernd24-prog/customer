import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { cn } from "../../../lib/utils";
import AuthCard from "../../ui/AuthCard";
import OtpInput from "../../ui/OtpInput";
import Button from "../../ui/Button";
import { otpAuth } from "../../../features/auth/authSlice";
import { fetchCart, updateCart } from "../../../features/cart/cartSlice";
import { syncGuestCartWithServer } from "../../../utils/ecommerce/cart";
import { notify } from "../../../utils/notify";

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M11 3L3 11M3 3l8 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function GuestOtpAuthModal({
  open,
  onClose,
  onSuccess,
  image = "/image/png/authImage.png",
  icon = "/image/png/person.png",
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const authLoading = useSelector((state) => state.auth.loading);

  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const mobileInputRef = useRef(null);

  useEffect(() => {
    if (resendTimer <= 0) return undefined;

    const timer = window.setInterval(() => {
      setResendTimer((previousValue) =>
        previousValue > 0 ? previousValue - 1 : 0,
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendTimer]);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return undefined;
    }

    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      if (step === 1) {
        mobileInputRef.current?.focus();
      }
    }, 100);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = "";
    };
  }, [open, step]);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setMobile("");
      setOtp("");
      setErrorMessage("");
      setLoading(false);
      setResendTimer(0);
    }
  }, [open]);

  const validateMobile = (number) => {
    const cleanedNumber = String(number || "").replace(/\D/g, "");
    return /^[6-9]\d{9}$/.test(cleanedNumber);
  };

  const getErrorMessage = (error, fallbackMessage) => {
    if (typeof error === "string") return error;

    return (
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      fallbackMessage
    );
  };

  const handleSendOtp = async (event) => {
    event?.preventDefault();
    setErrorMessage("");

    const cleanedMobile = mobile.replace(/\D/g, "").slice(0, 10);

    if (!validateMobile(cleanedMobile)) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      await dispatch(otpAuth({ mobile: cleanedMobile })).unwrap();

      notify.success(`OTP sent successfully to ${cleanedMobile}`);
      setMobile(cleanedMobile);
      setOtp("");
      setStep(2);
      setResendTimer(30);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Failed to send OTP. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event?.preventDefault();
    setErrorMessage("");

    const cleanedMobile = mobile.replace(/\D/g, "").slice(0, 10);
    const cleanedOtp = otp.replace(/\D/g, "").slice(0, 6);

    if (!validateMobile(cleanedMobile)) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      setStep(1);
      return;
    }

    if (cleanedOtp.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      await dispatch(
        otpAuth({
          mobile: cleanedMobile,
          otp: cleanedOtp,
        }),
      ).unwrap();

      notify.success("Authenticated successfully!");

      await syncGuestCartWithServer(dispatch, {
        fetchCartAction: fetchCart,
        updateCartAction: updateCart,
      });

      if (onSuccess) {
        // The success handler closes the modal after capturing the pending
        // wishlist action. Calling onClose first clears that action.
        await onSuccess();
      } else {
        onClose?.();
        navigate("/checkout");
      }
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Invalid OTP code. Please check and try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeMobile = () => {
    setStep(1);
    setOtp("");
    setErrorMessage("");
    setResendTimer(0);

    window.setTimeout(() => {
      mobileInputRef.current?.focus();
    }, 0);
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && !loading && !authLoading) {
      onClose?.();
    }
  };

  if (!open || typeof document === "undefined" || !document.body) {
    return null;
  }

  const isSubmitting = loading || authLoading;

  const cardTitle = step === 1 ? "Login with Phone" : "Verify OTP";
  const cardSubtitle =
    step === 1
      ? "Enter your mobile number to continue shopping with Sam Global."
      : `Enter the 6-digit verification code sent to +91 ${mobile}`;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center overflow-y-auto bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-otp-title"
    >
      <div
        className={cn(
          "relative max-h-[95vh] w-full overflow-y-auto",
          "rounded-t-[20px] sm:max-w-[820px] sm:rounded-xl",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onClose?.()}
          disabled={isSubmitting}
          className={cn(
            "absolute right-0 top-8 z-30 flex h-9 w-9 items-center justify-center",
            "rounded-full bg-white text-muted shadow-md",
            "transition hover:bg-cream hover:text-ink",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-gold",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          aria-label="Close"
        >
          <CloseIcon />
        </button>

        <div className="bg-[#F7F8FC]">
          <AuthCard
            image={image}
            icon={icon}
            title={cardTitle}
            subtitle={cardSubtitle}
            maxWidth="max-w-[820px]"
            maxHeight="h-[400px]"
          >
            <div id="guest-otp-title" className="sr-only">
              {cardTitle}
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600"
              >
                {errorMessage}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="guest-mobile"
                    className="mb-2 block text-sm font-medium text-[#2E2E2E]"
                  >
                    Mobile Number
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="flex h-11 w-full overflow-hidden rounded-md border border-[#D6D9DE] bg-white transition-all duration-200 focus-within:border-[#CE9F2D] focus-within:ring-2 focus-within:ring-[#CE9F2D]/20">
                    <div className="flex shrink-0 items-center border-r border-[#D6D9DE] bg-[#FAFAFA] px-3.5 text-sm font-medium text-[#5F6470]">
                      +91
                    </div>

                    <input
                      id="guest-mobile"
                      ref={mobileInputRef}
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        setMobile(value);
                        setErrorMessage("");
                      }}
                      placeholder="Mobile Number"
                      className="h-full min-w-0 flex-1 border-0 bg-transparent px-3.5 text-sm font-medium text-[#2E2E2E] placeholder:font-normal placeholder:text-muted focus:border-0 focus:outline-none focus:ring-0"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={isSubmitting || !validateMobile(mobile)}
                  className="h-11 text-sm font-semibold uppercase"
                >
                  {isSubmitting ? "Please wait..." : "Continue"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4" noValidate>
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <label className="text-sm font-medium text-[#2E2E2E]">
                      Enter OTP
                    </label>

                    <button
                      type="button"
                      onClick={handleChangeMobile}
                      disabled={isSubmitting}
                      className="text-sm font-semibold text-gold transition hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Change number
                    </button>
                  </div>

                  <OtpInput
                    value={otp}
                    length={6}
                    onChange={(value) => {
                      setOtp(
                        String(value || "")
                          .replace(/\D/g, "")
                          .slice(0, 6),
                      );
                      setErrorMessage("");
                    }}
                    error=""
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-muted">
                    Didn&apos;t receive the code?
                  </span>

                  {resendTimer > 0 ? (
                    <span className="font-medium text-ink">
                      Resend in {resendTimer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSubmitting}
                      className="font-semibold text-gold transition hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={isSubmitting || otp.length !== 6}
                  className="h-11 text-sm font-semibold uppercase"
                >
                  {isSubmitting ? "Verifying..." : "Continue"}
                </Button>
              </form>
            )}
          </AuthCard>
        </div>
      </div>
    </div>,
    document.body,
  );
}
