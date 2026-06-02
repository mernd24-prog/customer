import { Wallet } from "lucide-react";
import FormField from "../../components/ui/FormField";
import { formatMoney } from "../../utils/ecommerce";

export default function DiscountsSection({
  register,
  errors,
  walletBalance,
}) {
  return (
    <section className="rounded-[12px] border border-border bg-white p-5">
      <h2 className="mb-4  text-base font-semibold text-ink">
        Discounts
      </h2>
      <div className="grid gap-4">
        <FormField
          id="couponCode"
          label="Coupon code"
          registration={register("couponCode")}
          error={errors.couponCode}
          placeholder="Enter coupon (applied on order)"
        />
        <label className="grid gap-1.5 text-sm font-medium text-slate-800">
          <span className="flex items-center gap-1.5">
            <Wallet size={14} /> Wallet amount (balance:{" "}
            {formatMoney(walletBalance, "INR")})
          </span>
          <input
            type="number"
            min="0"
            max={walletBalance}
            placeholder="0"
            {...register("walletAmount")}
            className="min-h-11 rounded-[8px] border border-border-strong bg-white px-3 py-2.5  text-ink outline-none transition-all duration-300 ease-in-out placeholder:text-gray focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
          {errors.walletAmount?.message ? (
            <span className="min-h-4  text-xs font-normal text-red-600">
              {errors.walletAmount.message}
            </span>
          ) : null}
        </label>
      </div>
    </section>
  );
}
