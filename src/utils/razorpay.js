const RAZORPAY_CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";
let razorpayScriptPromise;

export const RAZORPAY_ERROR_CODES = Object.freeze({
  DISMISSED: "PAYMENT_DISMISSED",
  FAILED: "PAYMENT_GATEWAY_FAILED",
  CONFIRMATION_PENDING: "PAYMENT_CONFIRMATION_PENDING",
});

const paymentError = (code, message, cause) => {
  const error = new Error(message, cause ? { cause } : undefined);
  error.code = code;
  return error;
};

const paymentPayload = (result = {}) =>
  result?.data?.payment || result?.data?.data?.payment || result?.data?.data ||
  result?.payment || result?.data || result;

export const loadRazorpayCheckout = () => {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${RAZORPAY_CHECKOUT_SCRIPT}"]`);
    const handleLoad = () => {
      if (window.Razorpay) resolve(window.Razorpay);
      else reject(new Error("Razorpay checkout could not be loaded."));
    };
    if (existing) {
      existing.addEventListener("load", handleLoad, { once: true });
      existing.addEventListener("error", () => reject(new Error("Razorpay checkout could not be loaded.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SCRIPT;
    script.async = true;
    script.onload = handleLoad;
    script.onerror = () => reject(new Error("Razorpay checkout could not be loaded."));
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
};

export const openRazorpayCheckout = async ({ dispatch, run, order, orderId, payment, user, verifyPayment }) => {
  const checkout = payment?.checkout || {};
  if (!checkout.keyId || !checkout.orderId || !checkout.amount) {
    throw new Error("Razorpay checkout details are missing. Please try again.");
  }

  const Razorpay = await loadRazorpayCheckout();

  return new Promise((resolve, reject) => {
    let settled = false;
    const settle = (fn, value) => {
      if (settled) return;
      settled = true;
      fn(value);
    };

    const razorpay = new Razorpay({
      key: checkout.keyId,
      amount: checkout.amount,
      currency: checkout.currency || payment.currency || "INR",
      name: "Sam Global",
      description: `Order ${order?.orderNumber || order?.order_number || orderId}`,
      order_id: checkout.orderId,
      prefill: {
        name: user?.name || user?.fullName || "",
        email: user?.email || "",
        contact: user?.phone || user?.mobile || "",
      },
      notes: { orderId },
      theme: { color: "#B48A3C" },
      handler: async (response) => {
        try {
          const verified = await run(
            dispatch,
            verifyPayment({
              provider: "razorpay",
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
            "Payment verified",
          );
          const verifiedPayment = paymentPayload(verified);
          const status = String(
            verifiedPayment?.status || verifiedPayment?.payment_status || "",
          ).toLowerCase();
          if (status !== "captured") {
            settle(
              reject,
              paymentError(
                status === "failed"
                  ? RAZORPAY_ERROR_CODES.FAILED
                  : RAZORPAY_ERROR_CODES.CONFIRMATION_PENDING,
                status === "failed"
                  ? "Razorpay could not complete the payment. You can retry from the order page."
                  : "Payment was submitted, but confirmation is still pending. Check the order page before paying again.",
              ),
            );
            return;
          }
          settle(resolve, verified);
        } catch (error) {
          settle(
            reject,
            error?.code
              ? error
              : paymentError(
                  RAZORPAY_ERROR_CODES.CONFIRMATION_PENDING,
                  "Payment was submitted, but confirmation could not be verified. Check the order page before paying again.",
                  error,
                ),
          );
        }
      },
      modal: {
        ondismiss: () =>
          settle(reject, paymentError(
            RAZORPAY_ERROR_CODES.DISMISSED,
            "Razorpay was closed before payment completed. Your order is saved and still awaiting payment.",
          )),
      },
    });

    razorpay.on("payment.failed", (response) => {
      settle(
        reject,
        paymentError(
          RAZORPAY_ERROR_CODES.FAILED,
          response?.error?.description || response?.error?.reason ||
            "Payment failed. Your order is saved and you can retry from the order page.",
        ),
      );
    });

    razorpay.open();
  });
};
