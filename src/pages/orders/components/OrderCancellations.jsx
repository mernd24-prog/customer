import { formatMoney } from "../../../utils/ecommerce";

export default function OrderCancellations({ cancellations, currency,isCodOrder }) {
  if (!cancellations || !cancellations.length) return null;
  return (
    <>
      
              <section className="rounded-[8px] md:border md:border-border bg-white px-4 py-4 sm:px-6">
                <h2 className="text-sm font-semibold text-ink">
                  Cancellation and refund status
                </h2>
                <div className="mt-3 grid gap-3">
                  {cancellations.map((cancellation) => {
                    return (
                      <div
                        key={cancellation.id}
                        className="rounded-[6px] border border-border bg-surface px-3 py-3 text-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <strong>{cancellation.cancellation_number}</strong>
                          <span className="capitalize text-muted">
                            {String(
                              cancellation.status || "processing",
                            ).replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="mt-1 text-muted">{cancellation.reason}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted">
                          <span>
                            Refund:{" "}
                            {formatMoney(cancellation.refund_amount, currency)}
                          </span>
                          {/* <span>
                            Refund status:{" "}
                            {String(
                              cancellation.refund_status || "pending",
                            ).replace(/_/g, " ")}
                          </span> */}
                          {(cancellation.credit_note_id ||
                            cancellation.creditNoteId) && (
                            <span>
                              Reverse invoice: available in Order documents
                            </span>
                          )}
                        </div>
                        {isCodOrder && (
                          <p className="mt-2 rounded-[6px] bg-[#FFF7E6] px-3 py-2 text-xs text-[#8A5A00]">
                            COD refund: after approval, the refund is completed
                            through the marketplace COD refund process. No
                            Razorpay gateway refund is created for COD payment.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            
    </>
  );
}
