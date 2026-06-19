import { Wallet } from "lucide-react";
import FormField from "../../components/ui/FormField";
import { formatMoney } from "../../utils/ecommerce";

export default function DiscountsSection({ register, errors, walletBalance }) {
  return (
    <section className="overflow-hidden rounded-[8px] border border-border bg-white">
      <div className="bg-cream-strong px-4 py-3 sm:px-5">
        <h2 className="text-base font-bold text-ink">Discounts</h2>
      </div>
      <div className="grid gap-4 px-4 py-4 sm:grid-cols-2 sm:px-5">
        <FormField
          id="couponCode"
          label="Coupon code"
          registration={register("couponCode")}
          error={errors.couponCode}
          placeholder="Enter Coupon code"
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
            className="customer-input"
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
