const RAZORPAY_CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";
let razorpayScriptPromise;

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
          settle(resolve, verified);
        } catch (error) {
          settle(reject, error);
        }
      },
      modal: {
        ondismiss: () =>
          settle(reject, new Error("Payment was not completed. Your order is still pending payment.")),
      },
    });

    razorpay.on("payment.failed", (response) => {
      settle(
        reject,
        new Error(response?.error?.description || response?.error?.reason || "Payment failed. Please try again."),
      );
    });

    razorpay.open();
  });
};
