import { useDispatch } from "react-redux";
import { Star } from "lucide-react";

import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import BrandButton from "../../components/ui/BrandButton";
import { useToastThunk } from "../../hooks/useToastThunk";
import {
  fetchSubscriptionPlans,
  purchaseSubscription,
} from "../../features/subscription/subscriptionSlice";
import { formatMoney } from "../../utils/ecommerce";
import { useFetch, itemsFrom } from "../customer/helpers";

export function SubscriptionPage() {
  const dispatch = useDispatch();
  const plans = useFetch(
    fetchSubscriptionPlans,
    undefined,
    (s) => s.subscription,
  );
  const run = useToastThunk();

  return (
    <>
      <Seo title="Subscriptions | Sam Global" />
      <div className="w-container py-8">
        <h1 className="mb-6  text-2xl font-bold text-ink">
          Subscription Plans
        </h1>
        <ApiState
          loading={plans.loading}
          error={plans.error}
          empty={!itemsFrom(plans).length}
          emptyTitle="No plans available"
          emptyText="Subscription plans will appear here."
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {itemsFrom(plans).map((plan) => (
              <div
                key={plan.id || plan.planId || plan.planCode}
                className="flex flex-col rounded-[var(--customer-radius)] border border-border bg-white p-6"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold-soft">
                  <Star size={18} className="text-gold" />
                </div>
                <h2 className=" text-lg font-semibold text-ink">
                  {plan.title}
                </h2>
                <p className="mt-1  text-sm text-muted">{plan.description}</p>
                <p className="mt-4  text-2xl font-bold text-gold">
                  {formatMoney(plan.monthlyPrice, plan.currency || "INR")}
                  <span className=" text-sm font-normal text-gray">/mo</span>
                </p>
                <div className="mt-auto pt-5">
                  <BrandButton
                    variant="primary"
                    rounded
                    label="Subscribe"
                    className="w-full h-11 text-sm font-semibold"
                    onClick={() =>
                      run(
                        dispatch,
                        purchaseSubscription({
                          planId: plan.id || plan.planId,
                          billingCycle: "monthly",
                          metadata: {},
                        }),
                        "Subscription purchased",
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </ApiState>
      </div>
    </>
  );
}
