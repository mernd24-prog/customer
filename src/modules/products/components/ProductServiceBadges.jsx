
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
      value: `Ships in ${shippingEtaText} ${
        shippingEtaText === "1" ? "Day" : "Days"
      }`,
      cardBg: "bg-[#F3F2FC]",
      cardBorder: "border-[#DCD9F2]",
      iconBg: "bg-[#302A87]",
      textColor: "text-[#211B70]",
    });
  }

  if (productCodAvailable) {
    services.push({
      key: "payment",
      icon: Banknote,
      label: "Payment",
      value: "Cash on Delivery",
      cardBg: "bg-[#FFF8EC]",
      cardBorder: "border-[#F0DDBB]",
      iconBg: "bg-[#DDA51D]",
      textColor: "text-[#211B70]",
    });
  } else if (productCodDisabled) {
    services.push({
      key: "payment",
      icon: Banknote,
      label: "Payment",
      value: "Prepaid Only",
      disabled: true,
      cardBg: "bg-[#FFF8EC]",
      cardBorder: "border-[#F0DDBB]",
      iconBg: "bg-[#DDA51D]",
      textColor: "text-[#211B70]",
    });
  }

  if (staticIsFree) {
    services.push({
      key: "delivery",
      icon: Truck,
      label: "Delivery",
      value: "Free Delivery",
      cardBg: "bg-[#EFF8F1]",
      cardBorder: "border-[#D3E9D8]",
      iconBg: "bg-[#25804B]",
      textColor: "text-[#185C36]",
    });
  } else if (staticCharge > 0) {
    services.push({
      key: "delivery",
      icon: Truck,
      label: "Delivery",
      value: formattedCharge,
      cardBg: "bg-[#FFF8EC]",
      cardBorder: "border-[#F0DDBB]",
      iconBg: "bg-[#DDA51D]",
      textColor: "text-[#211B70]",
    });
  }

  if (!services.length) return null;

  const isThreeServices = services.length >= 3;

  const gridClass = isThreeServices
    ? "grid-cols-3"
    : "grid-cols-2";

  return (
    <div
      className={`grid w-full ${gridClass} gap-2 ${className}`}
    >
      {services.map(
        ({
          key,
          icon: Icon,
          label,
          value,
          disabled,
          cardBg,
          cardBorder,
          iconBg,
          textColor,
        }) => (
          <div
            key={key}
            className={`flex min-h-[76px] min-w-0 items-center gap-2 rounded-lg border px-2 py-2 transition-all duration-200 hover:shadow-sm ${
              isThreeServices ? "min-h-[70px] gap-1.5 px-1.5" : ""
            } ${cardBg} ${cardBorder}`}
          >
            {/* Icon */}
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg} ${
                isThreeServices ? "h-8 w-8 rounded-md" : ""
              } text-white`}
            >
              <Icon
                size={isThreeServices ? 16 : 19}
                strokeWidth={2}
              />
            </div>

            {/* Divider */}
            <div className="h-8 w-px shrink-0 bg-[#D8D5E3]" />

            {/* Content */}
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
              <span
                className={`text-[11px] font-bold uppercase leading-4 tracking-wide text-[#73758A] ${
                  isThreeServices ? "text-[9px] leading-3" : ""
                }`}
              >
                {label}
              </span>

              <span
                className={`break-words text-[14px] font-extrabold leading-5 ${textColor} ${
                  isThreeServices ? "text-[10px] leading-4" : ""
                }`}
                title={value}
              >
                {value}
              </span>

              {disabled && (
                <span
                  className={`inline-flex w-fit items-center rounded bg-[#F8E8C6] px-1.5 py-0.5 text-[9px] font-extrabold uppercase leading-3 tracking-wide text-[#875900] ${
                    isThreeServices ? "px-1 text-[7px]" : ""
                  }`}
                >
                  COD NOT AVAILABLE
                </span>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}
