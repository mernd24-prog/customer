import { CreditCard } from "lucide-react";
import Button from "../../components/ui/Button";
import { formatMoney } from "../../utils/ecommerce";

export default function CheckoutSummary({
  items,
  subtotal,
  shipping,
  total,
  loading,
}) {
  return (
    <aside className="min-w-0">
      <div className="sticky top-4 w-full overflow-hidden rounded-lg border border-[#e7dfd1] bg-white p-5">
        <h2 className="mb-4 font-montserrat text-base font-semibold text-[#2E2E2E]">
          Order summary
        </h2>
        <div className="grid divide-y divide-[#e7dfd1]">
          {items.map((item) => (
            <div
              key={item._lineKey}
              className="grid min-w-0 grid-cols-[56px_minmax(0,1fr)] gap-3 py-3 text-sm first:pt-0 last:pb-0"
            >
              <img
                src={item._image}
                alt={item._safeTitle}
                className="h-14 w-14 shrink-0 rounded-[8px] bg-[#FAF6EE] object-cover"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#2E2E2E]">
                      {item._safeTitle}
                    </p>
                    {item._variantTitle ? (
                      <p className="mt-0.5 truncate text-xs text-[#787878]">
                        {item._variantTitle}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-[#787878]">
                      Qty: {item.quantity} ·{" "}
                      {formatMoney(item.price, "INR")}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-right font-medium text-[#2E2E2E]">
                    {formatMoney(item._lineTotal, "INR")}
                  </span>
                </div>
                {item._attributes.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item._attributes.map(([key, value]) => (
                      <span
                        key={key}
                        className="rounded-full bg-[#FAF6EE] px-2 py-0.5 text-[11px] capitalize text-[#787878]"
                      >
                        {key.replace(/[_-]/g, " ")}: {String(value)}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-[#e7dfd1] pt-4">
          <div className="flex justify-between text-sm text-[#787878]">
            <span>Items ({items.length})</span>
            <span>{formatMoney(subtotal, "INR")}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm text-[#787878]">
            <span>Shipping</span>
            <span>{formatMoney(shipping, "INR")}</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-[#e7dfd1] pt-4 font-semibold text-[#2E2E2E]">
            <span>Total</span>
            <span>{formatMoney(total, "INR")}</span>
          </div>
        </div>

        <Button
          type="submit"
          loading={loading}
          className="mt-5 w-full"
        >
          <CreditCard size={16} /> Place order &amp; pay
        </Button>

        <p className="mt-3 text-center text-xs text-[#A6A6A6]">
          Secured by Razorpay · SSL encrypted
        </p>
      </div>
    </aside>
  );
}
