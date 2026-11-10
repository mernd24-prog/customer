
import { Clock, Truck, Banknote,  IndianRupee, PackageCheck,} from "lucide-react";

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
      icon: PackageCheck,
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
      icon: IndianRupee,
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
      icon: IndianRupee,
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

  return (
    <div
      className={`grid w-full min-w-0 grid-cols-1 min-[380px]:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 ${className}`}
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
            className={`
              flex min-w-0 items-center gap-2
              rounded-lg border p-2 sm:p-2.5
              min-h-[68px] sm:min-h-[76px]
              ${cardBg} ${cardBorder}
              transition-colors duration-200
              hover:border-opacity-80
              ${isThreeServices ? "xl:gap-2" : ""}
            `}
          >
            {/* Icon */}
            <div
              className={`
                flex h-9 w-9 sm:h-10 sm:w-10 shrink-0
                items-center justify-center rounded-lg
                ${iconBg} text-white
              `}
            >
              <Icon
                size={19}
                strokeWidth={2}
              />
            </div>

            {/* Divider */}
            <div className="h-8 w-px shrink-0 bg-[#D8D5E3]" />

            {/* Content */}
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
              <span
                className="
                  text-[10px] sm:text-[11px]
                  font-bold uppercase leading-4
                  tracking-wide text-[#73758A]
                "
              >
                {label}
              </span>

              <span
                className={`
                  break-words [overflow-wrap:anywhere]
                  text-xs sm:text-sm
                  font-extrabold leading-4 sm:leading-5
                  ${textColor}
                `}
                title={value}
              >
                {value}
              </span>

              {disabled && (
                <span
                  className="
                    mt-0.5 inline-flex w-fit max-w-full
                    whitespace-normal rounded
                    bg-[#F8E8C6] px-1.5 py-0.5
                    text-[8px] sm:text-[9px]
                    font-extrabold uppercase leading-3
                    tracking-wide text-[#875900]
                  "
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
