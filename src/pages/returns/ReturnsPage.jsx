import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Package, RotateCcw } from "lucide-react";
import Seo from "../../components/ui/Seo";
import Button from "../../components/ui/buttons/Button";
import CustomDropdown from "../../components/ui/CustomDropdown";
import ShowMoreText from "../../utils/showMore";
import useReturnRequest from "./hooks/useReturnRequest";
import {
  RETURN_REASONS,
  getItemProductId,
  getItemTitle,
  getItemImage,
  getDisplayItemPrice,
  getItemId,
  getItemVariantSku,
  getItemReturnPolicy,
  getReturnForItem,
  getReturnedQuantityForItem,
  getCancelledQuantityForItem,
  getReturnableQuantityForItem,
  isItemDelivered,
  getItemQuantity
} from "../../utils/pages/returnUtils";

function ReturnRequestPage({ orderId }) {
  const {
    loading,
    order,
    orderLoading,
    selectedOrderItemId,
    returnsChecked,
    orderItems,
    existingReturns,
    selectedItem,
    register,
    handleSubmit,
    watch,
    errors,
    watchedQty,
    estimatedRefund,
    selectedReturnableQuantity,
    selectedReturnedQuantity,
    selectedOrderedQuantity,
    quantityExceedsRemaining,
    handleItemSelect,
    submit,
    setValue
  } = useReturnRequest(orderId);

  return (
    <>
      <Seo title="Request Return | Sam Global" />
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Link
          to="/orders"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#5E6472] hover:text-[#1B1D60] transition-colors duration-200"
        >
          <ArrowLeft size={16} className="text-[#CE9F2D]" /> Back to Orders
        </Link>

        <div className="overflow-hidden rounded-2xl border border-[#E7D9B8] bg-white p-5 shadow-[0_4px_20px_rgba(27,29,96,0.05)] sm:p-7 lg:p-9">
          <div className="mb-6 border-b border-[#EFE5D2] pb-5">
            <h1 className="text-2xl font-extrabold text-[#1B1D60]">
              Request a Return
            </h1>
            <p className="mt-1 text-sm font-medium text-[#5E6472]">
              Select the item you want to return from this order and specify the
              return reason.
            </p>
          </div>

          {orderLoading && !order ? (
            <div className="flex flex-col items-center justify-center py-12 text-sm font-semibold text-[#5E6472]">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#CE9F2D] border-t-transparent mb-3" />
              Loading Order Details…
            </div>
          ) : !orderItems.length ? (
            <div className="rounded-xl border border-dashed border-[#E7D9B8] bg-[#FFFCF6] p-8 text-center text-sm font-semibold text-[#5E6472]">
              No items found for this order.
            </div>
          ) : (
            <form
              className="grid gap-6"
              onSubmit={handleSubmit(submit)}
              noValidate
            >
              {/* Hidden productId & orderItemId fields */}
              <input type="hidden" {...register("productId")} />
              <input type="hidden" {...register("orderItemId")} />

              {/* Item selector */}
              <div className="grid gap-2">
                <span className="text-sm font-bold text-[#1B1D60]">
                  Select Item to Return
                </span>
                <div className="grid gap-3">
                  {orderItems.map((item) => {
                    const pid = getItemProductId(item);
                    const title = getItemTitle(item);
                    const img = getItemImage(item);
                    const price = getDisplayItemPrice(item);
                    const lineKey =
                      getItemId(item) || `${pid}:${getItemVariantSku(item)}`;
                    const isSelected =
                      String(selectedOrderItemId) === String(lineKey);
                    const policy = getItemReturnPolicy(item);
                    const existingReturn = getReturnForItem(
                      existingReturns,
                      item,
                    );
                    const returnedQuantity = getReturnedQuantityForItem(
                      existingReturns,
                      item,
                    );
                    const cancelledQuantity = getCancelledQuantityForItem(item);
                    const returnableQuantity = getReturnableQuantityForItem(
                      existingReturns,
                      item,
                    );
                    const delivered = isItemDelivered(order, item);
                    const expired =
                      policy.eligibleUntil &&
                      new Date(policy.eligibleUntil).getTime() < Date.now();
                    const disabled =
                      !returnsChecked ||
                      !delivered ||
                      !policy.returnable ||
                      Boolean(expired) ||
                      returnableQuantity <= 0;
                    return (
                      <button
                        key={lineKey || title}
                        type="button"
                        onClick={() => handleItemSelect(item)}
                        disabled={disabled}
                        className={`flex w-full min-w-0 items-center gap-3.5 rounded-xl border p-4 text-left transition-all duration-200 ${
                          isSelected
                            ? "border-1 border-[#CE9F2D] "
                            : disabled
                              ? "cursor-not-allowed border-[#E5E5E5] bg-gray-50 opacity-60"
                              : "border-[#E7D9B8]  hover:border-[#CE9F2D]/60 "
                        }`}
                      >
                        {img ? (
                          <img loading="lazy" width="400" height="400"
                            src={img}
                            alt={title}
                            className="h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 rounded-xl border border-[#EFE5D2] object-contain p-1.5 bg-white shadow-xs"
                          />
                        ) : (
                          <span className="flex h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 items-center justify-center rounded-xl border border-[#EFE5D2] bg-[#FFF8E7] text-[#CE9F2D]">
                            <Package size={30} />
                          </span>
                        )}

                        <div className="min-w-0 flex-1 overflow-hidden">
                          <h2 className="break-words text-sm font-bold text-[#1B1D60] sm:text-base">
                            <ShowMoreText
                              text={title}
                              mode="lines"
                              limit={1}
                              moreLabel="more"
                              lessLabel="less"
                              textClassName="inline"
                              buttonClassName="ml-1 text-xs font-semibold text-[#1B1D60] hover:underline"
                            />
                          </h2>

                          {price > 0 && (
                            <p className="mt-1 text-xs font-semibold text-[#2E2E2E] sm:text-sm">
                              ₹{Number(price).toLocaleString("en-IN")}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-[#5E6472]">
                            Ordered: {getItemQuantity(item)}
                            {cancelledQuantity > 0
                              ? ` · Cancelled: ${cancelledQuantity}`
                              : ""}
                            {returnedQuantity > 0
                              ? ` · Already in return/refund queue: ${returnedQuantity}`
                              : ""}
                            {returnsChecked
                              ? ` · Returnable now: ${returnableQuantity}`
                              : " · Checking return history…"}
                          </p>
                          <p
                            className={`mt-1 text-xs font-bold ${!disabled ? "text-[#10B981]" : "text-rose-600"}`}
                          >
                            {!returnsChecked
                              ? "Checking existing return requests…"
                              : cancelledQuantity >= getItemQuantity(item)
                                ? "Cancelled items cannot be returned"
                              : returnableQuantity <= 0 && existingReturn
                                ? `All units already ${String(existingReturn.status || "requested").replace(/_/g, " ")}`
                                : !delivered
                                  ? "Return available after this item is delivered"
                                  : expired
                                    ? "Return window has closed"
                                    : policy.returnable
                                      ? `Returnable${policy.days ? ` for ${policy.days} days` : ""}${policy.inspectionRequired ? " · QC required" : ""}`
                                      : "This item is not returnable"}
                          </p>
                        </div>

                        <span
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            isSelected
                              ? "border-[#CE9F2D] bg-[#CE9F2D]"
                              : "border-[#D6B45B] bg-white"
                          }`}
                        >
                          {isSelected && (
                            <span className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.productId && (
                  <span className="text-xs font-medium text-rose-600">
                    {errors.productId.message}
                  </span>
                )}
              </div>

              {selectedItem && (
                <>
                  {/* Preferred Resolution CustomDropdown */}
                  <CustomDropdown
                    label="Preferred Resolution"
                    required
                    options={[
                      { value: "refund", label: "Return for Refund" },
                      { value: "replacement", label: "Replace This Item" },
                    ]}
                    value={watch("resolution")}
                    onChange={(val) =>
                      setValue("resolution", val, { shouldValidate: true })
                    }
                    placeholder="Select Resolution"
                    error={errors.resolution}
                  />

                  {/* Quantity Input */}
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="quantity"
                      className="text-sm font-bold text-[#1B1D60]"
                    >
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      max={
                        selectedReturnableQuantity ||
                        selectedItem?.quantity ||
                        99
                      }
                      {...register("quantity", { valueAsNumber: true })}
                      className="min-h-11 rounded-lg border border-[#E7D9B8] bg-white px-3.5 py-2.5 text-sm font-medium text-[#2E2E2E] outline-none transition hover:border-[#CE9F2D] focus:border-[#CE9F2D] focus:outline-none"
                    />
                    <p className="text-xs text-[#5E6472]">
                      You can return up to {selectedReturnableQuantity} unit
                      {selectedReturnableQuantity === 1 ? "" : "s"} for this
                      exact order item/variant.
                    </p>
                    {selectedReturnedQuantity > 0 && (
                      <div className="rounded-lg border border-[#E7D9B8] bg-[#FFF8E7] px-3.5 py-2.5 text-xs font-semibold text-[#855B14]">
                        {selectedReturnedQuantity} of {selectedOrderedQuantity}{" "}
                        unit{selectedOrderedQuantity === 1 ? "" : "s"} already
                        in return/refund queue. You can return only{" "}
                        {selectedReturnableQuantity} more unit
                        {selectedReturnableQuantity === 1 ? "" : "s"} now.
                      </div>
                    )}
                    {quantityExceedsRemaining && (
                      <span className="text-xs font-bold text-rose-600">
                        Quantity cannot be more than the remaining returnable
                        quantity: {selectedReturnableQuantity}.
                      </span>
                    )}
                    {errors.quantity && (
                      <span className="text-xs font-medium text-rose-600">
                        {errors.quantity.message}
                      </span>
                    )}
                  </div>

                  {/* Reason for Return CustomDropdown */}
                  <CustomDropdown
                    label="Reason for Return"
                    required
                    options={RETURN_REASONS}
                    value={watch("reason")}
                    onChange={(val) =>
                      setValue("reason", val, { shouldValidate: true })
                    }
                    placeholder="Select Reason for Return"
                    error={errors.reason}
                  />

                  {/* Description */}
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="description"
                      className="text-sm font-bold text-[#1B1D60]"
                    >
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      {...register("description")}
                      rows={4}
                      placeholder="Describe the issue in detail…"
                      className="rounded-lg border border-[#E7D9B8] bg-white px-3.5 py-2.5 text-sm font-medium text-[#2E2E2E] outline-none transition hover:border-[#CE9F2D] focus:border-[#CE9F2D] focus:outline-none placeholder:text-stone-400 resize-none"
                    />
                    {errors.description && (
                      <span className="text-xs font-medium text-rose-600">
                        {errors.description.message}
                      </span>
                    )}
                  </div>

                  {/* Re-themed Estimated Refund Card */}
                  {estimatedRefund.total > 0 && (
                    <div className="rounded-xl border border-[#E7D9B8] bg-[#FFFBF0] p-4 sm:p-5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#9A7A27]">
                          Estimated Refund
                        </p>
                        <span className="inline-flex items-center rounded-full bg-[#FFF8E7] border border-[#E7D9B8] px-2.5 py-0.5 text-[11px] font-bold text-[#855B14]">
                          Summary
                        </span>
                      </div>
                      <p className="mt-1.5 text-2xl font-extrabold text-[#1B1D60]">
                        ₹
                        {estimatedRefund.total.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <div className="mt-3 space-y-2 rounded-lg border border-[#EFE5D2] bg-white p-3 text-xs">
                        {estimatedRefund.rows.map((row) => (
                          <div
                            key={row.label}
                            className="flex items-center justify-between gap-3"
                          >
                            <span
                              className={
                                row.tone === "muted"
                                  ? "text-stone-500 font-medium"
                                  : "text-[#2E2E2E] font-semibold"
                              }
                            >
                              {row.label}
                            </span>
                            <span
                              className={
                                row.tone === "muted"
                                  ? "font-semibold text-stone-400"
                                  : "font-extrabold text-[#1B1D60]"
                              }
                            >
                              {row.displayValue || (
                                <>
                                  {row.value > 0
                                    ? "+"
                                    : row.value < 0
                                      ? "-"
                                      : ""}
                                  ₹
                                  {Math.abs(row.value).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-[#5E6472]">
                        {estimatedRefund.note}
                      </p>
                      {estimatedRefund.cod && (
                        <p className="mt-2 rounded-lg border border-[#E7D9B8] bg-[#F8F1E2] p-2.5 text-xs font-medium text-[#855B14]">
                          COD order: no Razorpay gateway refund is created.
                          Admin/seller will complete the approved refund through
                          the configured COD refund process.
                        </p>
                      )}
                      <p className="mt-1.5 text-[11px] font-medium text-[#9A7A27]">
                        Final refund is subject to review and Quality Check
                        (QC).
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    loading={loading}
                    disabled={
                      !returnsChecked ||
                      quantityExceedsRemaining ||
                      selectedReturnableQuantity <= 0
                    }
                    className="w-full h-12 bg-[#CE9F2D] text-white hover:bg-[#B68A22] font-bold rounded-lg shadow-sm transition hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={18} /> Submit Return Request
                  </Button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default function ReturnsPage({ request = false }) {
  const { orderId } = useParams();
  if (request) return <ReturnRequestPage orderId={orderId} />;
}
