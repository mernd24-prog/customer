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
  cancelledQuantity: cancelledQuantityProp,
  returnedQuantity: returnedQuantityProp = 0,
  delivered = false,
  effectiveStatus = "",
  compact = false,
  expectedDeliveryAt,
}) {
  const productPath =
    getItemProductPath?.(item) || getOrderItemProductPath(item);

  const eta = item.product_snapshot?.shipping?.processingDays;
  const itemColor = getOrderItemColor(item);
  const shouldShowColor =
    itemColor != null && String(itemColor).trim().toLowerCase() !== "n/a";
  const orderedQuantity = Math.max(Number(item.quantity || 1), 0);
  const cancelledQuantity = Math.min(
    orderedQuantity,
    Math.max(
      Number(
        cancelledQuantityProp ??
          item.cancelled_quantity ??
          item.cancelledQuantity ??
          0,
      ),
      0,
    ),
  );
  const nonCancelledQuantity = Math.max(orderedQuantity - cancelledQuantity, 0);
  const returnedQuantity = Math.min(
    nonCancelledQuantity,
    Math.max(Number(returnedQuantityProp || 0), 0),
  );
  const deliveredQuantity = delivered
    ? Math.max(nonCancelledQuantity - returnedQuantity, 0)
    : 0;
  const remainingQuantity = Math.max(
    nonCancelledQuantity - returnedQuantity - deliveredQuantity,
    0,
  );
  const returnPending = String(effectiveStatus || "").includes("request");
  const showQuantityBreakdown = cancelledQuantity > 0 || returnedQuantity > 0;

  const quantityBreakdown = showQuantityBreakdown ? (
    <div className=" flex flex-wrap gap-1.5 text-[11px] font-semibold">
      {/* <span className="rounded-full bg-[#F4F6FA] px-2.5 py-1 text-[#1B1D60]">
        Ordered {orderedQuantity}
      </span>
      {cancelledQuantity > 0 && (
        <span className="rounded-full bg-red-50 px-2.5 py-1 text-red-700">
          Cancelled {cancelledQuantity}
        </span>
      )} */}
      {/* {returnedQuantity > 0 && (
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
          {returnPending ? "Return requested" : "Returned"} {returnedQuantity}
        </span>
      )} */}
      {deliveredQuantity > 0 && (
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
          Delivered {deliveredQuantity}
        </span>
      )}
      {/* {remainingQuantity > 0 && (
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
          Remaining {remainingQuantity}
        </span>
      )} */}
    </div>
  ) : null;

  const getEstimatedDeliveryDateStr = () => {
    const explicit =
      expectedDeliveryAt ||
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

  if (compact) {
    const itemSize = item.product_snapshot?.attributes?.size;
    return (
      <div className="w-full">
        <div className="flex w-full flex-row items-start gap-4 sm:gap-6">
          <div className="aspect-square shrink-0 flex items-center justify-center overflow-hidden rounded-xl border border-[#E4DDCF] bg-[#FAF6EE]/50 p-2 w-[85px] sm:w-[110px] lg:w-[125px] shadow-2xs">
            {getItemImage(item) ? (
              productPath ? (
                <Link
                  to={productPath}
                  className="flex h-full w-full items-center justify-center"
                >
                  <img
                    loading="lazy"
                    width="400"
                    height="400"
                    src={getItemImage(item)}
                    alt={getProductTitle(item)}
                    className="h-full w-full object-contain"
                  />
                </Link>
              ) : (
                <img
                  loading="lazy"
                  width="400"
                  height="400"
                  src={getItemImage(item)}
                  alt={getProductTitle(item)}
                  className="h-full w-full object-contain"
                />
              )
            ) : (
              <Package size={28} className="text-[#9E886A]/50" />
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold text-[#1F2430]">
              {shouldShowColor && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF6EE] border border-[#E4DDCF]/80">
                  <span className="text-[#6F7480] font-normal">Color:</span> {itemColor}
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF6EE] border border-[#E4DDCF]/80">
                <span className="text-[#6F7480] font-normal">Qty:</span> {String(item.quantity || 1).padStart(2, "0")}
              </span>
              {itemSize && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF6EE] border border-[#E4DDCF]/80">
                  <span className="text-[#6F7480] font-normal">Size:</span> {itemSize}
                </span>
              )}
            </div>
            {quantityBreakdown}

            {deliveryDateStr ? (
              <p className="mt-2 text-xs font-medium text-[#6F7480]">
                Estimated Delivery: <span className="font-semibold text-[#1F2430]">{deliveryDateStr}</span>
              </p>
            ) : eta !== undefined && eta !== null && eta !== "" ? (
              <p className="mt-2 text-xs font-medium text-[#6F7480]">
                Estimated Delivery: <span className="font-semibold text-[#1F2430]">{eta} {Number(eta) === 1 ? "day" : "days"}</span>
              </p>
            ) : null}

            <div className="mt-2.5">
              <p className="text-lg font-bold text-[#1F2430]">
                {formatMoney(getItemLineTotal(item), currency)}
              </p>
              <p className="text-[11px] font-medium text-[#6F7480]">
                Inclusive of all taxes
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex w-full flex-row items-start gap-4 sm:gap-6 lg:gap-8">
        <div className="aspect-square shrink-0 flex items-center justify-center overflow-hidden rounded-xl border border-[#E4DDCF] bg-[#FAF6EE]/50 p-2 w-[85px] sm:w-[130px] md:w-[150px] lg:w-[170px] shadow-2xs">
          {getItemImage(item) ? (
            productPath ? (
              <Link to={productPath}>
                <img
                  loading="lazy"
                  width="400"
                  height="400"
                  src={getItemImage(item)}
                  alt={getProductTitle(item)}
                  className="h-full w-full object-contain"
                />
              </Link>
            ) : (
              <img
                loading="lazy"
                width="400"
                height="400"
                src={getItemImage(item)}
                alt={getProductTitle(item)}
                className="h-full w-full object-contain"
              />
            )
          ) : (
            <Package size={28} className="text-[#9E886A]/50" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col pt-1 sm:pt-2">
          <h3 className="block text-base font-bold text-[#1F2430] md:text-lg leading-snug">
            <ShowMoreText
              text={getProductTitle(item)}
              mode="characters"
              limit={65}
              moreLabel="more"
              lessLabel="less"
              textClassName="inline"
              buttonClassName="ml-1 text-sm font-semibold text-[#201B78] hover:underline"
            />
          </h3>

          <div className="my-2.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#1F2430]">
            {shouldShowColor && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6EE] border border-[#E4DDCF]/80">
                <span className="text-[#6F7480] font-normal">Color:</span> {itemColor}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6EE] border border-[#E4DDCF]/80">
              <span className="text-[#6F7480] font-normal">Qty:</span> {String(item.quantity || 1).padStart(2, "0")}
            </span>
          </div>
          {quantityBreakdown}

          {deliveryDateStr ? (
            <p className="mb-2 text-xs font-medium text-[#6F7480]">
              Estimated Delivery: <span className="font-semibold text-[#1F2430]">{deliveryDateStr}</span>
            </p>
          ) : null}

          <div className="mt-1">
            <p className="text-lg font-extrabold text-[#1F2430] sm:text-xl">
              {formatMoney(getItemLineTotal(item), currency)}
            </p>
            <p className="mt-0.5 text-xs font-medium text-[#6F7480]">
              Inclusive of all taxes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
