import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CreditCard } from "lucide-react";

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
        <h1 className="mb-6  text-2xl font-bold text-ink">Payment History</h1>
        <ApiState
          loading={paymentState.loading && !payments.length}
          error={paymentState.error}
          empty={!payments.length && !paymentState.loading}
          emptyTitle="No payments yet"
          emptyText="Your payment transactions will appear here."
        >
          <div className="rounded-[12px] border border-border bg-white">
            {payments.map((payment, i) => {
              const id = payment.id || payment.paymentId;
              const status = payment.status;
              const statusColor =
                status === "success" || status === "paid"
                  ? "text-emerald-600 bg-emerald-50"
                  : status === "failed"
                    ? "text-red-600 bg-red-50"
                    : "text-amber-600 bg-amber-50";
              return (
                <div
                  key={id || i}
                  className="flex items-center justify-between border-b border-border px-5 py-4 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-soft">
                      <CreditCard size={14} className="text-gold" />
                    </div>
                    <div>
                      <p className=" text-sm font-medium text-ink">
                        {payment.provider || "Payment"}
                      </p>
                      <p className=" text-xs text-gray">
                        {payment.createdAt
                          ? new Date(payment.createdAt).toLocaleDateString(
                              "en-IN",
                            )
                          : id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5  text-xs font-semibold capitalize ${statusColor}`}
                    >
                      {status}
                    </span>
                    <span className=" text-sm font-bold text-ink">
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
        </ApiState>
      </div>
    </>
  );
}
