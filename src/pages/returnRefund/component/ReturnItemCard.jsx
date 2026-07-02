import {
  Badge,
  Button,
  Divider,
  ImageWithFallback,
} from "../../../components/common";
import { formatMoney } from "../../../utils/ecommerce";

export default function ReturnItemCard({
  title,
  image,
  orderId,
  quantity = 1,
  seller,
  price,
  currency = "INR",
  status,
  requestedOn,
  returnId,
  reason,
  refundAmount,
  expectedDate,
  onTrackRequest,
  trackLabel = "Track Order",
  className = "",
}) {
  return (
    <article
      className={`w-full overflow-hidden rounded-[15px] border border-[#CE9F2D66] bg-white px-3 py-4 min-[375px]:px-4 sm:px-6 sm:py-5 lg:px-12 lg:py-6 ${className}`}
    >
      <div className="flex flex-col justify-between md:flex-row">
        <div className="grid min-w-0 gap-4 sm:grid-cols-[125px_minmax(0,1fr)] sm:items-center sm:gap-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10 ">
          <ImageWithFallback
            src={image}
            alt={title}
            className="mx-auto h-[110px] w-[110px] shrink-0 bg-white min-[375px]:h-[120px] min-[375px]:w-[120px] sm:mx-0 sm:h-[125px] sm:w-[125px] md:h-[135px] md:w-[135px] lg:h-auto lg:w-auto"
          />

          <div className="min-w-0 space-y-1.5 text-[13px] font-medium  text-[#454545] min-[375px]:text-sm sm:space-y-2 sm:text-[15px] md:text-[16px] lg:text-[20px] ">
            <h2 className="line-clamp-2 text-[17px] py-2 font-semibold  text-[#1B1D60] min-[375px]:text-[18px] sm:text-[20px] md:text-[22px] lg:text-[26px] max-w-2xl lg:font-bold ">
              {title}
            </h2>

            <p>Order ID : {orderId}</p>
            <p className="py-2">QTY : {quantity}</p>
            <p>Sold by {seller}</p>

            <p className="py-2 text-[16px] font-bold text-[#1B1D60] sm:text-[18px] md:text-[20px] lg:text-[24px] lg:font-extrabold lg:leading-[36px]">
              {formatMoney(price, currency)}
            </p>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <Badge
            variant="gold"
            className="w-fit min-w-[120px] justify-center rounded-[10px] px-3 py-1.5 text-xs font-medium normal-case text-[#CE9F2D] sm:min-w-[140px] sm:py-2 md:w-full lg:h-[45px] lg:w-[220px] lg:min-w-[220px] lg:rounded-[15px] lg:border lg:border-[#CE9F2D] lg:px-[10px] lg:text-[20px] lg:font-medium"
          >
            {status}
          </Badge>

          <div>
            <div>Requested On</div>
            <div className="mt-1 text-[16px] font-bold text-[#1B1D60] sm:text-[18px] md:text-[20px] lg:text-[24px] lg:font-extrabold lg:leading-[36px]">
              {requestedOn}
            </div>
          </div>

          <div>
            <div>Return ID</div>
            <div className="mt-1 break-words text-[16px] font-bold text-[#1B1D60] sm:text-[18px] md:text-[20px] lg:text-[20px] lg:font-extrabold ">
              {returnId}
            </div>
          </div>
        </div>
      </div>

      <Divider className="my-4 border-[#8D8D8D] sm:my-5 lg:pt-2" />

      <div className="grid gap-5 md:grid-cols-[1.1fr_1fr_1fr_220px]  mt-6 md:items-end lg:grid-cols-[1.1fr_1fr_1fr_220px] lg:gap-8">
        <ReturnInfo label="Reason for Return">{reason}</ReturnInfo>

        <ReturnInfo label="Refund Amount">
          {formatMoney(refundAmount || 0, currency)}
        </ReturnInfo>

        <ReturnInfo label="Expected Date">{expectedDate || "—"}</ReturnInfo>

        <Button
          variant="secondary"
          size="sm"
          onClick={onTrackRequest}
          className="h-9 w-full border-[#A9ACD1] px-4 text-sm font-semibold md:h-10 lg:h-[45px] lg:w-[220px] lg:min-w-[220px] lg:rounded-[10px] lg:border lg:px-[25px] lg:py-[10px] lg:text-[20px] lg:font-medium"
        >
          {trackLabel}
        </Button>
      </div>
    </article>
  );
}

function ReturnInfo({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="text-[13px] font-medium text-[#454545] sm:text-sm md:text-[16px] lg:text-[20px] lg:leading-[100%]">
        {label}
      </p>

      <p className="mt-2 break-words text-[16px] font-bold text-[#1B1D60] sm:text-[18px] md:text-[20px] lg:text-[24px] lg:font-extrabold lg:leading-[36px]">
        {children}
      </p>
    </div>
  );
}
