import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Wallet } from "lucide-react";

import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import { fetchWallet } from "../../features/wallet/walletSlice";
import { formatMoney } from "../../utils/ecommerce";
import { WALLET_PAGE_SKELETON } from "../../components/common/skeleton/layouts";

export function WalletPage() {
  const dispatch = useDispatch();
  const walletState = useSelector((s) => s.wallet);
  const wallet = walletState.current;

  useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  return (
    <>
      <Seo title="My Wallet | Sam Global" />
      <div className="w-container py-8">
        <h1 className="mb-6  text-2xl font-bold text-ink">My Wallet</h1>
        <ApiState
          loading={walletState.loading && !wallet}
          error={walletState.error}
          empty={!wallet && !walletState.loading}
          emptyTitle="Wallet not available"
          emptyText="Your wallet information will appear here."
          skeletonLayout={WALLET_PAGE_SKELETON}
          skeletonContainerClass="bg-transparent"
        >
          {wallet && (
            <div className="rounded-[var(--customer-radius)] bg-gradient-to-br from-ink to-muted p-6 text-white">
              <div className="mb-1 flex items-center gap-2">
                <Wallet size={18} />
                <span className=" text-sm font-medium opacity-80">
                  Available Balance
                </span>
              </div>
              <p className=" text-4xl font-bold">
                {formatMoney(wallet.balance || 0, wallet.currency || "INR")}
              </p>
              {wallet.lockedBalance > 0 && (
                <p className="mt-1  text-sm opacity-60">
                  Locked:{" "}
                  {formatMoney(wallet.lockedBalance, wallet.currency || "INR")}
                </p>
              )}
            </div>
          )}
        </ApiState>
      </div>
    </>
  );
}
