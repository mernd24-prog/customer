import React from "react";
import PropTypes from "prop-types";
import { FailedIcon } from "../../../components/ui/icons";


export default function PaymentStatusCard({
  status = "success",
  icon,
  title,
  description,
  action,
  orderRef,
  deliveryLabel,
  footer,
  className = "",
}) {
  const isSuccess = status === "success";
  const isFailed = status === "failed";
  const isPending = status === "pending";

  // Card theme styling
  const cardBorderBg = isFailed
    ? "border-red-200 bg-[#fff9f9]"
    : isPending
      ? "border-amber-300/60 bg-[#fffdf8]"
      : "border-[#CE9F2D]/40 bg-[#fffcf6]";

  // Default icons per status
  const defaultIcon = isSuccess ? (
    <img
      loading="lazy"
      width="400"
      height="400"
      src="/image/png/Group.png"
      alt={typeof title === "string" ? title : "Order Placed Successfully"}
      className="h-16 w-16 object-contain sm:h-20 sm:w-20"
    />
  ) : isFailed ? (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500 sm:h-20 sm:w-20">
      <FailedIcon className="h-8 w-8 sm:h-10 sm:w-10" />
    </div>
  ) : (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 sm:h-20 sm:w-20">
      <span className="text-3xl sm:text-4xl" aria-hidden="true">
        ⌛
      </span>
    </div>
  );

  // Default titles per status
  const defaultTitle = isSuccess
    ? "Order Placed Successfully!"
    : isFailed
      ? "Payment Failed"
      : "Payment Confirmation Pending";
  const defaultDescription = isSuccess
    ? "Thank You for Shopping with Sam Global. Your order has been received and is being prepared for shipment."
    : isFailed
      ? "Razorpay could not complete this payment. Your order is saved; retry safely from its order page."
      : "We have not received final payment confirmation yet. This page checks automatically; please do not pay twice.";
  const footerBg = isFailed
    ? "border-red-200/60 bg-[#FEE2E2]/40 text-[#991B1B]"
    : "border-[#CE9F2D]/30 bg-[#FFF4D7] text-[#1B1D60]";

  const hasOrderDetails = Boolean(orderRef || deliveryLabel || footer);

  return (
    <section
      className={`flex w-full flex-col overflow-hidden rounded-lg border shadow-sm sm:rounded-lg ${cardBorderBg} ${className}`}
    >
      <div className="flex flex-col gap-4 px-5 py-6 text-center sm:px-8 sm:py-8">
        <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
          <div className="shrink-0">{icon || defaultIcon}</div>

          <div className="flex flex-col items-center">
            <h1 className="break-words text-xl font-bold text-[#3E4093] sm:text-2xl">
              {title || defaultTitle}
            </h1>

            {(description || defaultDescription) && (
              <p className="my-2 max-w-xl text-xs font-medium leading-relaxed text-[#2E2E2E] sm:text-sm">
                {description || defaultDescription}
              </p>
            )}

            {action && (
              <div className="mt-3 flex flex-col justify-center gap-3 sm:flex-row sm:items-center">
                {action}
              </div>
            )}
          </div>
        </div>
      </div>

      {hasOrderDetails && (
        <div
          className={`mt-auto flex flex-col gap-2 border-t px-5 py-3 text-xs font-semibold sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-3.5 sm:text-sm ${footerBg}`}
        >
          {orderRef && (
            <span className="break-words">Order : #{orderRef}</span>
          )}

          {deliveryLabel && (
            <span className="break-words">
              Estimated Delivery : {deliveryLabel}
            </span>
          )}

          {footer}
        </div>
      )}
    </section>
  );
}

PaymentStatusCard.propTypes = {
  status: PropTypes.oneOf(["success", "pending", "failed"]),
  icon: PropTypes.node,
  title: PropTypes.node,
  description: PropTypes.node,
  action: PropTypes.node,
  orderRef: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  deliveryLabel: PropTypes.string,
  footer: PropTypes.node,
  className: PropTypes.string,
};
