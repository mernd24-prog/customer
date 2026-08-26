import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import ShowMoreText from "../../../utils/showMore";
import { getOrderItemProductPath, formatDate } from "../utils/orderItems";

export function OrderItemCard({
  item,
  order,
  currency,
  getItemImage,
  getProductTitle,
  getItemProductPath,
  getItemLineTotal,
  getOrderItemColor,
  formatMoney,
}) {
  const productPath =
    getItemProductPath?.(item) || getOrderItemProductPath(item);

  const itemColor = getOrderItemColor(item);
  const shouldShowColor =
    itemColor != null && String(itemColor).trim().toLowerCase() !== "n/a";

  const getEstimatedDeliveryDateStr = () => {
    const explicit =
      item?.expected_delivery_at ||
      item?.expectedDeliveryAt ||
      item?.delivery_date ||
      item?.deliveryDate ||
      order?.expected_delivery ||
      order?.expectedDelivery ||
      order?.relations?.shipments?.[0]?.expected_delivery_at ||
      order?.relations?.shipments?.[0]?.expectedDeliveryAt;

    if (explicit) {
      const formatted = formatDate(explicit);
      if (formatted) return formatted;
    }

    const shipping =
      item?.product_snapshot?.shipping ||
      item?.productSnapshot?.shipping ||
      item?.shipping ||
      {};

    const days = Number(
      shipping.estimatedDaysMax ??
        shipping.processingDays ??
        shipping.estimatedDaysMin ??
        item?.eta ??
        0,
    );

    const baseDateVal =
      item?.created_at ||
      item?.createdAt ||
      order?.created_at ||
      order?.createdAt;

    const baseDate = baseDateVal ? new Date(baseDateVal) : new Date();

    if (!Number.isNaN(baseDate.getTime()) && days > 0) {
      const target = new Date(baseDate);
      target.setDate(target.getDate() + days);
      return formatDate(target);
    }

    if (!Number.isNaN(baseDate.getTime()) && baseDateVal) {
      const target = new Date(baseDate);
      target.setDate(target.getDate() + 3);
      return formatDate(target);
    }

    return null;
  };

  const deliveryDateStr = getEstimatedDeliveryDateStr();

  return (
    <div className="w-full">
      <div className="flex w-full flex-row items-start gap-4 sm:gap-6 lg:gap-8">
        <div className="aspect-square shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#CE9F2D33] bg-white p-2 w-[100px] sm:w-[180px] lg:w-[210px] 2xl:w-[220px]">
          {getItemImage(item) ? (
            productPath ? (
              <Link to={productPath}>
                <img loading="lazy" width="400" height="400"
                  src={getItemImage(item)}
                  alt={getProductTitle(item)}
                  className="h-full w-full object-contain"
                />
              </Link>
            ) : (
              <img loading="lazy" width="400" height="400"
                src={getItemImage(item)}
                alt={getProductTitle(item)}
                className="h-full w-full object-contain"
              />
            )
          ) : (
            <Package size={28} className="text-[#D9CBAE]" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col pt-2 sm:pt-3">
          <span className="block text-base font-extrabold text-[#2E2E2E] md:text-lg">
            <ShowMoreText
              text={getProductTitle(item)}
              mode="characters"
              limit={65}
              moreLabel="more"
              lessLabel="less"
              textClassName="inline"
              buttonClassName="ml-1 text-sm font-semibold text-[#1B1D60] hover:underline"
            />
          </span>

          <div className="my-3 flex flex-wrap gap-x-6 gap-y-2 text-ink sm:my-4">
            {shouldShowColor && (
              <span className="text-sm font-medium text-[#2E2E2E] sm:text-base">
                Color:{" "}
                <span className="font-semibold text-[#1B1D60]">
                  <strong className="font-bold text-[#25247B]">
                    {itemColor}
                  </strong>
                </span>
              </span>
            )}
            <span className="text-sm font-medium text-[#2E2E2E] sm:text-base">
              Quantity:{" "}
              <strong className="font-bold text-[#25247B]">
                {String(item.quantity || 1).padStart(2, "0")}
              </strong>
            </span>
          </div>

          {deliveryDateStr ? (
            <p className="mb-3 text-[14px] font-semibold leading-5 text-[#5F6078]">
              Estimated Delivery: {deliveryDateStr}
            </p>
          ) : null}

          <div className="mt-1">
            <p className="text-base font-extrabold leading-8 text-[#1B1D60] sm:text-xl">
              {formatMoney(getItemLineTotal(item), currency)}
            </p>
            <p className="mt-0.5 text-sm font-medium text-[#2E2E2E] sm:text-base">
              Inclusive of all taxes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


