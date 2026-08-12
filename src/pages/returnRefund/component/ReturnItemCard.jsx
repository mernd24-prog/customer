import {
  Badge,
  Button,
  Divider,
  ImageWithFallback,
} from "../../../components/common";
import { formatMoney } from "../../../utils/ecommerce";
import ShowMoreText from "../../../utils/showMore";
import { capitalizeFirst } from "../../../utils/stringUtils";

export default function ReturnItemCard({
  title,
  image,
  quantity = 1,
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
      className={`w-full overflow-hidden rounded-[15px] border border-[#CE9F2D66] bg-white px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 ${className}`}
    >
      <div className="flex flex-col min-[480px]:flex-row items-start gap-4 sm:gap-6">
        <ImageWithFallback
          src={image}
          alt={title}
          className="shrink-0 rounded-[8px] bg-white object-cover w-full h-[180px] min-[480px]:w-[120px] min-[480px]:h-[120px] sm:h-[150px] sm:w-[150px] lg:h-[120px] lg:w-[120px]"
        />

        <div className="min-w-0 flex-1 flex flex-col w-full">
          <div className="flex flex-row items-start justify-between gap-3 sm:gap-4 mb-2 min-[480px]:mb-0">
            <h2 className="max-w-4xl block text-[13px] min-[400px]:text-[14px] font-bold text-[#1B1D60] min-[480px]:text-base md:text-lg lg:text-[20px] leading-snug">
              <ShowMoreText
                text={title}
                mode="characters"
                limit={65}
                moreLabel="more"
                lessLabel="less"
                textClassName="inline"
                buttonClassName="ml-1 text-xs sm:text-sm font-semibold text-[#1B1D60] hover:underline"
              />
            </h2>
            <Badge
              variant="gold"
              className="w-fit shrink-0 justify-center rounded-[8px] border border-[#CE9F2D] !bg-[#FFEFC8] px-2.5 py-1 text-[10px] font-semibold normal-case text-[#CE9F2D] sm:px-4 sm:py-1.5 sm:text-[13px]"
            >
              {capitalizeFirst(status)}
            </Badge>
          </div>

          <div className="space-y-1.5 sm:space-y-2 text-[11px] min-[400px]:text-[12px] font-medium text-[#454545] sm:text-[14px]">
            <p>Qty : {quantity}</p>
            
            <div className="flex flex-col min-[480px]:flex-row min-[480px]:flex-wrap min-[480px]:items-center gap-x-6 gap-y-1 sm:gap-y-2">
              <div className="flex items-center gap-1">
                <span className="font-medium text-muted">Requested On :</span>
                <span className="font-semibold text-[#1B1D60]">{requestedOn}</span>
              </div>

              <div className="flex items-start gap-1">
                <span className="font-medium whitespace-nowrap text-muted">Return ID :</span>
                <span className="break-all font-semibold text-[#1B1D60]">{returnId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Divider className="my-3 border-[#D9DDE8] sm:my-4" />

      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-5 md:gap-6">
        <div className="flex flex-1 flex-wrap items-start gap-4 sm:gap-6 lg:gap-10 w-full">
          <ReturnInfo 
            label="Reason for Return" 
            className="flex-1 min-w-[130px] sm:min-w-[200px] md:flex-none md:w-[260px] lg:w-[320px] shrink-0"
          >
            <ShowMoreText
              label="Reason for Return"
              text={capitalizeFirst(reason)}
              mode="lines"
              limit={2}
              buttonClassName="ml-1 text-xs font-semibold text-[#1B1D60] hover:underline"
            />
          </ReturnInfo>

          <ReturnInfo label="Refund Amount" className="flex-1 min-w-[100px] shrink-0">
            {formatMoney(refundAmount || 0, currency)}
          </ReturnInfo>

          <ReturnInfo label="Expected Date" className="flex-1 min-w-[100px] shrink-0">
            {expectedDate || "—"}
          </ReturnInfo>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onTrackRequest}
          className="h-9 sm:h-10 w-full shrink-0 rounded-[8px] border border-[#CE9F2D] !bg-transparent px-4 text-[12px] sm:text-[13px] font-semibold text-[#1B1D60] hover:bg-[#FFEFC8]/40 md:w-[140px]"
        >
          {trackLabel}
        </Button>
      </div>
    </article>
  );
}

function ReturnInfo({ label, children, className = "" }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-[11px] font-medium text-muted sm:text-[14px]">{label}</p>
      <div className="mt-1 break-words text-[12px] font-semibold text-[#1B1D60] sm:text-[14px]">
        {children}
      </div>
    </div>
  );
}
