import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Gift } from "lucide-react";

import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import BrandButton from "../../components/ui/BrandButton";
import { useToastThunk } from "../../hooks/useToastThunk";
import {
  fetchLoyaltyProfile,
  fetchLoyaltyHistory,
  redeemLoyaltyPoints,
} from "../../features/loyalty/loyaltySlice";

export function LoyaltyPage() {
  const dispatch = useDispatch();
  const loyaltyState = useSelector((s) => s.loyalty);
  const profile = loyaltyState.current;
  const [history, setHistory] = useState([]);
  const run = useToastThunk();

  useEffect(() => {
    dispatch(fetchLoyaltyProfile());
    dispatch(fetchLoyaltyHistory({ limit: 20, offset: 0 }))
      .unwrap()
      .then((result) => {
        const items = Array.isArray(result?.data)
          ? result.data
          : result?.data?.items || result?.data?.list || [];
        setHistory(items);
      })
      .catch(() => {});
  }, [dispatch]);

  return (
    <>
      <Seo title="Loyalty Rewards | Sam Global" />
      <div className="w-container py-8">
        <h1 className="mb-6  text-2xl font-bold text-ink">Loyalty Rewards</h1>
        <ApiState
          loading={loyaltyState.loading && !profile}
          error={loyaltyState.error}
          empty={!profile && !loyaltyState.loading}
          emptyTitle="No loyalty profile"
          emptyText="Start shopping to earn loyalty points."
        >
          {/* Points card */}
          {profile && (
            <div className="mb-6 rounded-[var(--customer-radius)] bg-gradient-to-br from-gold to-gold-dark p-6 text-white">
              <div className="mb-1 flex items-center gap-2">
                <Gift size={18} />
                <span className=" text-sm font-medium opacity-80">
                  Available Points
                </span>
              </div>
              <p className=" text-4xl font-bold">
                {profile.points || profile.balance || 0}
              </p>
              <p className="mt-1  text-sm opacity-70">
                Tier: {profile.tier || profile.level || "Standard"}
              </p>
              <div className="mt-5">
                <BrandButton
                  variant="secondary"
                  rounded
                  label="Redeem 50 Points"
                  className="h-10 border-white px-6 text-sm font-semibold text-white hover:bg-white/20"
                  onClick={() =>
                    run(
                      dispatch,
                      redeemLoyaltyPoints({ points: 50 }),
                      "Points redeemed",
                    )
                  }
                />
              </div>
            </div>
          )}

          {/* Transaction history */}
          {history.length > 0 && (
            <div className="rounded-[12px] border border-border bg-white">
              <div className="border-b border-border px-5 py-4">
                <h2 className=" text-base font-semibold text-ink">
                  Transaction History
                </h2>
              </div>
              <div className="divide-y divide-border">
                {history.map((tx, i) => (
                  <div
                    key={tx.id || i}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div>
                      <p className=" text-sm font-medium text-ink">
                        {tx.reason || tx.description || "Points transaction"}
                      </p>
                      <p className=" text-xs text-gray">
                        {tx.createdAt
                          ? new Date(tx.createdAt).toLocaleDateString("en-IN")
                          : ""}
                      </p>
                    </div>
                    <span
                      className={` text-sm font-semibold ${(tx.points || tx.amount || 0) >= 0 ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {(tx.points || tx.amount || 0) >= 0 ? "+" : ""}
                      {tx.points || tx.amount || 0} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ApiState>
      </div>
    </>
  );
}
