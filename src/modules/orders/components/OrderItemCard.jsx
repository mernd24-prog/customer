import { Link } from "react-router-dom";
import { Package, ExternalLink } from "lucide-react";
import ShowMoreText from "../../../utils/showMore";
import {
  getOrderItemProductPath,
  formatDate,
  getReviewProductId,
  reviewKeyForItem,
} from "../utils/orderItems";
import { OrderItemReviewAction } from "./OrderItemReview";
import { capitalizeFirst } from "../../../utils/stringUtils";

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
  orderId,
  reviewByItem = {},
  checkedReviewKeys = {},
  onReviewClick,
  shipment = {},
  isCancelled = false,
  isReturned = false,
  cancellationDetails,
  returnDetails,
}) {
  const productPath =
    getItemProductPath?.(item) || getOrderItemProductPath(item);

  const eta = item?.product_snapshot?.shipping?.processingDays;
  const itemColor = getOrderItemColor(item);

  const rawVariantAttributes =
    item?.attributes && typeof item.attributes === "object"
      ? item.attributes
      : item?.product_snapshot?.variant?.attributes ||
        item?.productSnapshot?.variant?.attributes ||
        item?.product_snapshot?.attributes ||
        item?.productSnapshot?.attributes ||
        {};

  const variantAttributes = Object.entries(rawVariantAttributes).filter(
    ([, value]) => value !== null && value !== undefined && value !== "",
  );

  if (
    !variantAttributes.some(([key]) => /^(color|colour)$/i.test(key)) &&
    itemColor != null &&
    String(itemColor).trim().toLowerCase() !== "n/a"
  ) {
    variantAttributes.unshift(["color", itemColor]);
  }

  const formatAttributeLabel = (key) =>
    String(key || "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const orderedQuantity = Math.max(Number(item?.quantity || 1), 0);

  const cancelledQuantity = Math.min(
    orderedQuantity,
    Math.max(
      Number(
        cancelledQuantityProp ??
          item?.cancelled_quantity ??
          item?.cancelledQuantity ??
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

  const showQuantityBreakdown = cancelledQuantity > 0 || returnedQuantity > 0;

  const reviewKey = reviewKeyForItem(orderId, item);
  const reviewChecked = Boolean(checkedReviewKeys[reviewKey]);
  const reviewEntry = reviewByItem?.[reviewKey];

  const existingReview =
    reviewEntry?.review ||
    reviewEntry?.data?.review ||
    reviewEntry?.data ||
    reviewEntry;

  const hasExistingReview = Boolean(
    existingReview &&
    typeof existingReview === "object" &&
    !existingReview.alreadyReviewed,
  );

  const canReview =
    Boolean(delivered) &&
    returnedQuantity === 0 &&
    Boolean(getReviewProductId(item));

  const renderReviewAction = () =>
    canReview && !hasExistingReview ? (
      <OrderItemReviewAction
        item={item}
        orderId={orderId}
        canReview={canReview}
        reviewChecked={reviewChecked}
        onReviewClick={onReviewClick}
      />
    ) : null;

  const quantityBreakdown = showQuantityBreakdown ? (
    <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
      {deliveredQuantity > 0 && (
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
          Delivered {deliveredQuantity}
        </span>
      )}

      {cancelledQuantity > 0 && (
        <span className="rounded-full bg-red-50 px-2.5 py-1 text-red-700">
          Cancelled {cancelledQuantity}
        </span>
      )}

      {returnedQuantity > 0 && (
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
          Returned {returnedQuantity}
        </span>
      )}
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

  const cancellationId =
    cancellationDetails?.requestNumber ||
    cancellationDetails?.request_number ||
    cancellationDetails?.cancellationNumber ||
    cancellationDetails?.cancellation_number ||
    cancellationDetails?.id ||
    cancellationDetails?._id;

  const cancellationStatus =
    cancellationDetails?.status ||
    item?.cancellation_status ||
    item?.cancellationStatus;

  const cancellationReason =
    cancellationDetails?.reason ||
    cancellationDetails?.metadata?.reason ||
    item?.cancellation_reason ||
    item?.cancellationReason;

  const returnId =
    returnDetails?.returnId ||
    returnDetails?.return_id ||
    returnDetails?.requestNumber ||
    returnDetails?.request_number ||
    returnDetails?.returnNumber ||
    returnDetails?.return_number ||
    returnDetails?.id ||
    returnDetails?._id ||
    item?.return_lifecycle?.returnId ||
    item?.return_lifecycle?.return_id ||
    item?.returnLifecycle?.returnId ||
    null;

  const refundAmount =
    returnDetails?.refundAmount ??
    returnDetails?.refund_amount ??
    returnDetails?.refund?.requestedAmount ??
    returnDetails?.refund?.amount ??
    returnDetails?.refundBreakup?.totalRefundAmount ??
    returnDetails?.refund_breakup?.total_refund_amount ??
    item?.return_lifecycle?.refundAmount ??
    item?.return_lifecycle?.refund_amount ??
    item?.returnLifecycle?.refundAmount ??
    null;

  const returnReason =
    returnDetails?.reason ||
    returnDetails?.metadata?.reason ||
    item?.return_reason ||
    item?.returnReason;

  const renderShipmentAndRequestDetails = () => (
    <div className="mt-2 min-w-0 space-y-1.5 text-xs text-[#6F7480]">
      {!isCancelled && !isReturned && (
        <>
          {/* <p className="flex min-w-0 flex-wrap items-center gap-x-1">
            <span>Courier:</span>
            <span className="font-semibold text-[#1B1D60]">
              {capitalizeFirst(shipment?.courier_name || "Seller Delivery")}
            </span>
          </p> */}

          <p className="flex min-w-0 flex-wrap items-center gap-x-1">
            <span>Tracking ID:</span>
            <span
              className="break-all font-semibold text-[#1B1D60]"
              title={shipment?.tracking_number || shipment?.awb_number || ""}
            >
              {shipment?.tracking_number ||
                shipment?.awb_number ||
                "Not available yet"}
            </span>
          </p>
        </>
      )}

      {isCancelled && (
        <>
          {cancellationId && (
            <p className="break-words">
              <span>Cancellation ID:</span>{" "}
              <span className="font-semibold text-[#1B1D60]">
                {cancellationId}
              </span>
            </p>
          )}

          {cancellationStatus && (
            <p className="break-words">
              <span>Cancellation Status:</span>{" "}
              <span className="font-semibold text-[#1B1D60]">
                {String(cancellationStatus)
                  .replace(/[_-]+/g, " ")
                  .replace(/\b\w/g, (letter) => letter.toUpperCase())}
              </span>
            </p>
          )}

          {cancellationReason && (
            <p className="break-words">
              <span>Reason:</span>{" "}
              <span className="font-medium text-[#1F2430]">
                {cancellationReason}
              </span>
            </p>
          )}
        </>
      )}

      {isReturned && (
        <>
          {(returnId || refundAmount != null) && (
            <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
              {returnId && (
                <p className="break-words">
                  <span>Return ID:</span>{" "}
                  <span className="font-semibold text-[#1B1D60]">
                    {returnId}
                  </span>
                </p>
              )}

              {refundAmount != null && (
                <p className="break-words">
                  <span>Refund Amount:</span>{" "}
                  <span className="font-semibold text-[#1B1D60]">
                    {formatMoney
                      ? formatMoney(refundAmount, currency)
                      : `₹${Number(refundAmount).toLocaleString("en-IN")}`}
                  </span>
                </p>
              )}
            </div>
          )}

          {returnReason && (
            <p className="break-words">
              <span>Reason:</span>{" "}
              <span className="font-medium text-[#1F2430]">{returnReason}</span>
            </p>
          )}
        </>
      )}
    </div>
  );

  const renderProductActions = () => {
    const buttonStyle =
      "inline-flex min-h-9 max-w-full shrink-0 items-center justify-center gap-1.5 rounded-md border border-[#CE9F2D] bg-[#FFF9EA] px-3 py-2 text-xs font-semibold leading-none text-[#1B1D60] transition-colors hover:bg-[#F8EDCF] sm:text-sm";

    return (
      <div className="flex w-full min-w-0 flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end">
        {!isCancelled && !isReturned && shipment?.tracking_url && (
          <a
            href={shipment.tracking_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Track order on courier website"
            className={buttonStyle}
          >
            <span>Track Order</span>
            <ExternalLink size={14} className="shrink-0" />
          </a>
        )}

        {canReview && !hasExistingReview && (
          <div className="flex min-w-0 max-w-full items-center">
            {renderReviewAction()}
          </div>
        )}
      </div>
    );
  };

  const renderProductImage = (imageWidthClass) => (
    <div
      className={`flex aspect-square ${imageWidthClass} shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E4DDCF] bg-[#FAF6EE]/50 p-2 shadow-2xs`}
    >
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
  );

  const renderProductTitle = (limit = 65, titleClassName = "") => (
    <h3
      className={`min-w-0 flex-1 text-sm font-bold leading-snug text-[#1F2430] sm:text-base ${titleClassName}`}
    >
      <ShowMoreText
        text={getProductTitle(item)}
        mode="characters"
        limit={limit}
        moreLabel="more"
        lessLabel="less"
        textClassName="inline"
        buttonClassName="ml-1 text-xs font-semibold text-[#201B78] hover:underline sm:text-sm"
      />
    </h3>
  );

  if (compact) {
    return (
      <div className="w-full min-w-0">
        <div className="flex w-full min-w-0 items-start gap-3 sm:gap-4">
          {renderProductImage("w-[85px] sm:w-[110px] lg:w-[125px]")}

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
              {renderProductTitle(65, "basis-[180px]")}

              <div className="w-full min-w-0 sm:ml-auto sm:w-auto">
                {renderProductActions()}
              </div>
            </div>

            {renderShipmentAndRequestDetails()}

            {quantityBreakdown && (
              <div className="mt-2">{quantityBreakdown}</div>
            )}

            {deliveryDateStr ? (
              <p className="mt-2 break-words text-xs font-medium text-[#6F7480]">
                Estimated Delivery:{" "}
                <span className="font-semibold text-[#1F2430]">
                  {deliveryDateStr}
                </span>
              </p>
            ) : eta !== undefined && eta !== null && eta !== "" ? (
              <p className="mt-2 text-xs font-medium text-[#6F7480]">
                Estimated Delivery:{" "}
                <span className="font-semibold text-[#1F2430]">
                  {eta} {Number(eta) === 1 ? "day" : "days"}
                </span>
              </p>
            ) : null}

            <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2 text-xs font-semibold text-[#1F2430]">
              <p className="text-lg font-bold text-[#1F2430]">
                {formatMoney(getItemLineTotal(item), currency)}
              </p>

              <span className="inline-flex items-center gap-1 rounded-full border border-[#E4DDCF]/80 bg-[#FAF6EE] px-2.5 py-0.5">
                <span className="font-normal text-[#6F7480]">Qty:</span>{" "}
                {String(item?.quantity || 1).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="flex w-full min-w-0 items-start gap-3 sm:gap-4 lg:gap-6">
        {renderProductImage("w-[85px] sm:w-[130px] md:w-[150px] lg:w-[170px]")}

        <div className="flex min-w-0 flex-1 flex-col pt-1 sm:pt-2">
          <div className="flex w-full min-w-0 flex-wrap items-start gap-x-3 gap-y-2">
            {renderProductTitle(65, "basis-[180px] md:text-lg")}

            <div className="w-full min-w-0 sm:ml-auto sm:w-auto">
              {renderProductActions()}
            </div>
          </div>

          <div className="my-2 flex min-w-0 flex-wrap items-center gap-2 text-xs font-semibold text-[#1F2430]">
            {variantAttributes.map(([key, value]) => (
              <span
                key={key}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#E4DDCF]/80 bg-[#FAF6EE] px-3 py-1"
              >
                <span className="font-normal text-[#6F7480]">
                  {formatAttributeLabel(key)}:
                </span>{" "}
                <span className="break-words">{String(value)}</span>
              </span>
            ))}

            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E4DDCF]/80 bg-[#FAF6EE] px-3 py-1">
              <span className="font-normal text-[#6F7480]">Qty:</span>{" "}
              {String(item?.quantity || 1).padStart(2, "0")}
            </span>
          </div>

          {renderShipmentAndRequestDetails()}

          {quantityBreakdown && <div className="mt-2">{quantityBreakdown}</div>}

          {deliveryDateStr && (
            <p className="mt-2 break-words text-xs font-medium text-[#6F7480]">
              Estimated Delivery:{" "}
              <span className="font-semibold text-[#1F2430]">
                {deliveryDateStr}
              </span>
            </p>
          )}

          <div className="mt-2">
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
