import FormField from "../../../components/ui/FormField";
import { formatMoney } from "../../../utils/ecommerce";
import OrderDetailSectionCard from "../../../modules/orders/components/OrderDetailSectionCard";
import { Wallet } from "lucide-react";

export default function DiscountsSection({
  register,
  errors,
  walletBalance,
  setValue,
  watchedWalletAmount,
}) {
  const isWalletApplied = Number(watchedWalletAmount) > 0;

  const handleWalletToggle = (e) => {
    if (e.target.checked) {
      setValue("walletAmount", walletBalance || 0, { shouldValidate: true });
    } else {
      setValue("walletAmount", 0, { shouldValidate: true });
    }
  };

  return (
    <OrderDetailSectionCard title="Discounts">
      <div className="flex flex-col gap-4 lg:gap-[36px] rounded-[20px] px-[15px] py-[20px] lg:px-[25px] lg:py-[30px] lg:flex-row">
        <div className="flex-1">
          <FormField
            id="couponCode"
            label="Coupon or Influencer Code"
            placeholder="Enter Coupon or Influencer Code"
            registration={register("couponCode")}
            error={errors.couponCode}
          />
        </div>

        <div className="flex-1">
          <div className="grid gap-1.5 text-sm lg:text-base font-medium text-[var(--customer-ink)]">
            <span>Pay from Wallet</span>
            <label
              className={`customer-input relative flex items-center justify-between transition-all cursor-pointer !px-3 ${
                isWalletApplied
                  ? "!border-[#CE9F2D] !bg-[#CE9F2D]/5"
                  : "hover:!border-[#CE9F2D]/50 hover:bg-gray-50"
              } ${!walletBalance ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center gap-2.5">
                <Wallet
                  className={`h-[18px] w-[18px] ${isWalletApplied ? "text-[#CE9F2D]" : "text-gray-500"}`}
                />
                <span
                  className={`text-[15px] font-normal ${isWalletApplied ? "text-[#CE9F2D]" : "text-gray-900"}`}
                >
                  Available: {formatMoney(walletBalance, "INR")}
                </span>
              </div>
              <input
                type="checkbox"
                className="h-[18px] w-[18px] rounded border-gray-300 text-[#CE9F2D] focus:ring-[#CE9F2D] cursor-pointer"
                checked={isWalletApplied}
                onChange={handleWalletToggle}
                disabled={!walletBalance}
              />
            </label>
            <span className="min-h-4 text-xs font-normal text-red-600">
              {errors.walletAmount?.message}
            </span>
          </div>
          <input type="hidden" {...register("walletAmount")} />
        </div>
      </div>
    </OrderDetailSectionCard>
  );
}
