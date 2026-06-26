import { Wallet } from "lucide-react";
import FormField from "../../../components/ui/FormField";
import { formatMoney } from "../../../utils/ecommerce";
import OrderDetailSectionCard from "../../orders/components/OrderDetailSectionCard";

export default function DiscountsSection({ register, errors, walletBalance }) {
  return (
    <OrderDetailSectionCard title="Discounts">
      <div className="flex flex-col gap-4 lg:gap-[36px] rounded-[20px] px-[15px] py-[20px] lg:px-[25px] lg:py-[30px] lg:flex-row">
        <div className="flex-1">
          <FormField
            id="couponCode"
            label="Coupon Code"
            placeholder="Enter coupon code"
            registration={register("couponCode")}
            error={errors.couponCode}
          />
        </div>

        <div className="flex-1">
          <FormField
            id="walletAmount"
            label={`Wallet Amount (Available: ${formatMoney(walletBalance, "INR")})`}
            placeholder="Enter wallet amount"
            mode="wallet"
            registration={register("walletAmount")}
            error={errors.walletAmount}
          />
        </div>
      </div>
    </OrderDetailSectionCard>
  );
}
