import { Link } from "react-router-dom";
import { formatMoney } from "../../../utils/ecommerce";
import { humanize, returnItemMatchesOrderItem } from "../../../utils/pages/orderUtils";

export default function OrderReturns({ 
  visibleReturns, 
  currency, 
  getReturnRefundAmount, 
  getReturnItemTitle, 
  getReturnItemQuantity,
  getReturnNumber,
  isCodOrder,
  selectedOrderItem
}) {
  if (!visibleReturns || !visibleReturns.length) return null;
  return (
    <>
      
              <section className="rounded-[8px] md:border md:border-border bg-white px-4 py-4 sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-ink">
                      {selectedOrderItem
                        ? "Selected item return and refund"
                        : "Return and refund status"}
                    </h2>
                    <p className="mt-1 text-xs text-muted">
                      Return and payout changes are shown item-wise. Only
                      returned items affect refund and settlement.
                    </p>
                  </div>
                  <Link
                    to="/returns-refunds"
                    className="text-xs font-semibold text-[#3E4093] underline-offset-2 hover:underline"
                  >
                    View all returns
                  </Link>
                </div>

                <div className="mt-3 grid gap-3">
                  {visibleReturns.map((returnRequest) => {
                    const creditNoteId =
                      returnRequest.creditNoteId ||
                      returnRequest.credit_note_id ||
                      returnRequest.refund?.creditNoteId ||
                      returnRequest.refund?.credit_note_id ||
                      returnRequest.refund?.metadata?.creditNoteId ||
                      returnRequest.refund?.metadata?.credit_note_id;
                    const returnItems = Array.isArray(returnRequest.items)
                      ? selectedOrderItem
                        ? returnRequest.items.filter((returnItem) =>
                            returnItemMatchesOrderItem(
                              returnItem,
                              selectedOrderItem,
                            ),
                          )
                        : returnRequest.items
                      : [];

                    return (
                      <div
                        key={
                          returnRequest.id ||
                          returnRequest._id ||
                          getReturnNumber(returnRequest)
                        }
                        className="rounded-[6px] border border-border bg-surface px-3 py-3 text-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <strong>{getReturnNumber(returnRequest)}</strong>
                          <span className="capitalize text-muted">
                            {humanize(returnRequest.status, "processing")}
                          </span>
                        </div>

                        {returnRequest.reason && (
                          <p className="mt-1 text-muted">
                            {returnRequest.reason}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted">
                          <span>
                            Refund:{" "}
                            {formatMoney(
                              getReturnRefundAmount(returnRequest),
                              currency,
                            )}
                          </span>
                          {/* <span className="capitalize">
                            Refund status:{" "}
                            {humanize(
                              getReturnRefundStatus(returnRequest),
                              "pending",
                            )}
                          </span> */}
                          {returnRequest.refund?.method ||
                          returnRequest.refundMethod ? (
                            <span className="capitalize">
                              Method:{" "}
                              {humanize(
                                returnRequest.refund?.method ||
                                  returnRequest.refundMethod,
                              )}
                            </span>
                          ) : null}
                          {returnRequest.refund?.providerRefundId ||
                          returnRequest.providerRefundId ? (
                            <span>
                              Gateway refund:{" "}
                              {returnRequest.refund?.providerRefundId ||
                                returnRequest.providerRefundId}
                            </span>
                          ) : null}
                          <span>
                            Reverse invoice:{" "}
                            {creditNoteId
                              ? "available in Order documents"
                              : "pending"}
                          </span>
                        </div>
                        {isCodOrder && (
                          <p className="mt-2 rounded-[6px] bg-[#FFF7E6] px-3 py-2 text-xs text-[#8A5A00]">
                            COD refund: after return approval and QC, refund is
                            completed through wallet/bank/manual COD process
                            according to marketplace policy.
                          </p>
                        )}

                        {returnItems.length > 0 && (
                          <div className="mt-3 grid gap-2">
                            {returnItems.map((item, index) => (
                              <div
                                key={
                                  item.orderItemId ||
                                  item.order_item_id ||
                                  item.id ||
                                  item._id ||
                                  index
                                }
                                className="flex flex-wrap items-center justify-between gap-2 rounded-[6px] bg-white px-3 py-2 text-xs"
                              >
                                <span className="min-w-0 font-medium text-ink">
                                  {getReturnItemTitle(item)}
                                </span>
                                <span className="shrink-0 text-muted">
                                  Qty {getReturnItemQuantity(item)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            
    </>
  );
}
