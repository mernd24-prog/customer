
import { Clock, Truck, Banknote } from "lucide-react";

export default function ProductServiceBadges({
  shippingEtaText,
  staticIsFree,
  staticCharge,
  productCodAvailable,
  productCodDisabled,
  className = "",
  layout = "cards",
}) {
  const formattedCharge =
    staticCharge > 0
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(staticCharge)
      : "";

  const services = [];

  if (shippingEtaText) {
    services.push({
      key: "dispatch",
      icon: Clock,
      label: "Dispatch",
      value: `Ships in ${shippingEtaText} ${shippingEtaText === "1" ? "Day" : "Days"}`,
    });
  }

  if (productCodAvailable) {
    services.push({
      key: "payment",
      icon: Banknote,
      label: "Payment",
      value: "Cash on Delivery",
    });
  } else if (productCodDisabled) {
    services.push({
      key: "payment",
      icon: Banknote,
      label: "Payment",
      value: "Prepaid Only",
      disabled: true,
    });
  }

  if (staticIsFree) {
    services.push({
      key: "delivery",
      icon: Truck,
      label: "Delivery",
      value: "Free Delivery",
      success: true,
    });
  } else if (staticCharge > 0) {
    services.push({
      key: "delivery",
      icon: Truck,
      label: "Delivery",
      value: formattedCharge,
    });
  }

  if (!services.length) return null;

  if (layout === "row") {
    return (
      <div
        className={`grid w-full grid-cols-3 overflow-hidden rounded-lg border border-[#E9DCC3] bg-[#FFFAF0] divide-x divide-[#E9DCC3] ${className}`}
      >
        {services.map(({ key, icon: Icon, label, value, disabled, success }) => (
          <div
            key={key}
            className="flex min-w-0 items-center justify-center gap-2 px-2 py-3 sm:gap-2.5 sm:py-3.5"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                disabled
                  ? "bg-red-50 text-red-600"
                  : success
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-[#FFF0CC] text-[#A96300]"
              }`}
            >
              <Icon size={18} strokeWidth={2} />
            </div>

            <div className="min-w-0">
              <span className="block text-[11px] font-medium leading-4 text-gray-500 sm:text-xs">
                {label}
              </span>

              <span
                className={`block text-[11px] font-bold leading-4 sm:text-sm ${
                  disabled
                    ? "text-red-600"
                    : success
                      ? "text-emerald-700"
                      : "text-[#25233B]"
                }`}
              >
                {value}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 2xl:grid-cols-3 ${className}`}>
      {services.map(({ key, icon: Icon, label, value, disabled, success }) => (
        <div
          key={key}
          className="flex min-w-0 items-center gap-3 rounded-lg border border-[#E9E1D4] bg-[#FFFAF3] p-3 transition-colors hover:border-[#D5B77A]"
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              disabled
                ? "bg-red-50 text-red-600"
                : success
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-[#FFF0CC] text-[#A96300]"
            }`}
          >
            <Icon size={20} strokeWidth={2} />
          </div>

          <div className="min-w-0">
            <span className="block text-xs font-medium text-gray-500">
              {label}
            </span>
            <span
              className={`block break-words text-sm font-bold ${
                disabled
                  ? "text-red-600"
                  : success
                    ? "text-emerald-700"
                    : "text-[#25233B]"
              }`}
            >
              {value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
