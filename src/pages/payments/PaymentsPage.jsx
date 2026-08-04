import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CreditCard, CheckCircle2, XCircle, Clock } from "lucide-react";

import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import { fetchPayments } from "../../features/payment/paymentSlice";
import { formatMoney } from "../../utils/ecommerce";

export function PaymentsPage() {
  const dispatch = useDispatch();
  const paymentState = useSelector((s) => s.payment);
  const payments = Array.isArray(paymentState.list) ? paymentState.list : [];

  useEffect(() => {
    dispatch(fetchPayments());
  }, [dispatch]);

  return (
    <>
      <Seo title="Payment History | Sam Global" />
      <div className="w-container py-8">
        <div className="mb-6 border-b border-[#EFE5D2] pb-5">
          <h1 className="text-2xl font-extrabold text-[#1B1D60] sm:text-3xl">
            Payment History
          </h1>
          <p className="mt-1 text-sm font-medium text-[#5E6472]">
            View and track all your past transaction history and payment
            details.
          </p>
        </div>

        <ApiState
          loading={paymentState.loading && !payments.length}
          error={paymentState.error}
          empty={!payments.length && !paymentState.loading}
          emptyTitle="No payments yet"
          emptyText="Your payment transactions will appear here."
        >
          <div className="overflow-hidden rounded-2xl border border-[#E7D9B8] bg-white ">
            <div className="hidden border-b border-[#EFE5D2] bg-[#FFFCF6] px-6 py-3.5 sm:block">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#855B14]">
                <span>Transaction Details</span>
                <span>Status & Amount</span>
              </div>
            </div>

            <div className="divide-y divide-[#EFE5D2]">
              {payments.map((payment, i) => {
                const id = payment.id || payment.paymentId || payment._id;
                const statusRaw = String(
                  payment.status || "pending",
                ).toLowerCase();

                const isSuccess =
                  statusRaw === "success" ||
                  statusRaw === "paid" ||
                  statusRaw === "completed";
                const isFailed =
                  statusRaw === "failed" || statusRaw === "rejected";

                const badgeStyle = isSuccess
                  ? "bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]"
                  : isFailed
                    ? "bg-[#FFEBEE] text-[#C62828] border border-[#EF9A9A]"
                    : "bg-[#FFF8E7] text-[#855B14] border border-[#E7D9B8]";

                const StatusIcon = isSuccess
                  ? CheckCircle2
                  : isFailed
                    ? XCircle
                    : Clock;

                const formattedDate = payment.createdAt
                  ? new Date(payment.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : null;

                const providerName =
                  payment.provider ||
                  payment.paymentMethod ||
                  payment.method ||
                  "Online Payment";

                return (
                  <div
                    key={id || i}
                    className="flex flex-col justify-between gap-4 px-5 py-4 transition-colors duration-150 hover:bg-[#FFFCF6] sm:flex-row sm:items-center sm:px-7 sm:py-5"
                  >
                    <div className="flex min-w-0 items-start gap-3.5 sm:items-center">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E7D9B8] bg-[#FFF8E7] text-[#CE9F2D] shadow-xs">
                        <CreditCard size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold capitalize text-[#1B1D60] sm:text-base">
                            {providerName}
                          </p>
                          {(payment.orderId || payment.order_id) && (
                            <span className="rounded bg-[#F8F1E2] px-2 py-0.5 text-[11px] font-semibold text-[#855B14]">
                              Order #
                              {String(
                                payment.orderId || payment.order_id,
                              ).slice(-8)}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-[#5E6472]">
                          {formattedDate && <span>{formattedDate}</span>}
                          {formattedDate && id && <span>•</span>}
                          {id && (
                            <span className="font-mono text-[11px] text-stone-500">
                              ID: {id}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-between gap-4 border-t border-[#EFE5D2] pt-3 sm:border-t-0 sm:pt-0 sm:justify-end">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold capitalize ${badgeStyle}`}
                      >
                        <StatusIcon size={13} />
                        {payment.status || "Pending"}
                      </span>
                      <span className="text-base font-extrabold text-[#1B1D60] sm:text-lg">
                        {formatMoney(
                          payment.amount || 0,
                          payment.currency || "INR",
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ApiState>
      </div>
    </>
  );
}
