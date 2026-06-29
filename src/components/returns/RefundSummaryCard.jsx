import Button from "../common/buttons/Button";
import { Badge, Divider } from "../common/display";
import { formatMoney } from "../../utils/ecommerce/money";

export default function RefundSummaryCard({
  amount,
  currency = "INR",
  paymentMethod = "Card",
  paymentLastFour,
  expectedDate,
  status,
  onViewDetails,
  className = "",
}) {
  return (
    <section
      className={`rounded-[12px] border border-[#CE9F2D66] bg-white px-3 py-4 min-[375px]:px-4 sm:rounded-[15px] sm:px-6 sm:py-5 lg:px-8  lg:py-6 ${className}`}
      aria-label="Refund summary"
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#DADCF0] sm:h-8 sm:w-8 lg:h-[35px] lg:w-[35px]">
          <img
            src="/image/png/refund.png"
            alt="Refund"
            className="h-4 w-4 object-contain sm:h-[18px] sm:w-[18px] lg:h-[20px] lg:w-[20px]"
          />
        </span>

        <h2 className="text-[18px] font-semibold leading-[100%] text-[#1B1D60] sm:text-[22px] lg:text-[26px]">
          Refunds
        </h2>
      </div>

      <Divider className="my-4 border-[#8D8D8D] sm:my-5" />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-[1fr_1.4fr_1fr_267px] lg:items-end lg:gap-8 lg:pt-2">
        <RefundDetail label="Refund Amount">
          {formatMoney(amount, currency)}
        </RefundDetail>

        <RefundDetail label="Payment Method">
          <span className="inline-flex max-w-full flex-wrap items-center gap-2">
            <span className="border border-[#ECECEC] bg-white px-2 py-0.5 text-[10px] font-bold italic text-[#1B1D60] sm:text-xs lg:text-sm">
              {paymentMethod}
            </span>

            {paymentLastFour ? (
              <span className="break-words">
                •••• •••• •••• {paymentLastFour}
              </span>
            ) : null}
          </span>
        </RefundDetail>

        <RefundDetail label="Expected Date">{expectedDate}</RefundDetail>

        <div className="grid gap-2 sm:col-span-2 sm:max-w-[267px] lg:col-span-1 lg:w-[267px]">
          <Badge
            variant="gold"
            className="m-0 flex h-[32px] w-full items-center justify-center rounded-[5px] border border-[#CE9F2D66] text-[#CE9F2D] px-4 text-[11px] lg:text-[16px] font-medium normal-case sm:h-[35px] sm:text-xs lg:h-[35px] lg:px-[25px]"
          >
            {status}
          </Badge>

          <Button
            variant="secondary"
            size="xs"
            fullWidth
            onClick={onViewDetails}
            className="h-[32px] rounded-[5px] border border-[#A9ACD1] px-4 text-[11px] lg:text-[16px] font-medium text-[#1B1D60] sm:h-[35px] sm:text-xs lg:h-[35px] lg:px-[25px]"
          >
            View Details
          </Button>
        </div>
      </div>
    </section>
  );
}

function RefundDetail({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="text-[13px] font-medium leading-[100%] text-[#454545] min-[375px]:text-sm sm:text-base lg:text-[18px]">
        {label}
      </p>

      <div className="mt-4 text-[16px] font-bold leading-tight text-[#1B1D60] min-[375px]:text-[17px] sm:text-xl lg:text-[24px] lg:leading-[36px]">
        {children}
      </div>
    </div>
  );
}
