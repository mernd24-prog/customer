import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Wallet, Lock, Sparkles } from "lucide-react";

import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import { fetchWallet } from "../../features/wallet/walletSlice";
import { formatMoney } from "../../utils/ecommerce";

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
        <h1 className="mb-6 text-2xl font-bold text-ink">My Wallet</h1>
        <ApiState
          loading={walletState.loading && !wallet}
          error={walletState.error}
          empty={!wallet && !walletState.loading}
          emptyTitle="Wallet not available"
          emptyText="Your wallet information will appear here."
        >
          {wallet && (
            <div className="relative overflow-hidden rounded-[var(--customer-radius)] border border-[#CE9F2D]/60 bg-gradient-to-br from-[#FFFDF8] via-[#FFF9E6] to-[#FFF1C9] p-6 sm:p-7 transition-shadow">
              {/* Subtle ambient gold glow */}
              <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#FFC82E]/25 blur-2xl pointer-events-none" />

              <div className="relative z-10 mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-[#CE9F2D]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#CE9F2D]/15 text-[#CE9F2D] border border-[#CE9F2D]/30">
                    <Wallet size={18} />
                  </div>
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#8C620D]">
                    Available Balance
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-[#FFC82E]/30 px-3 py-1 text-xs font-bold text-[#8C620D] border border-[#CE9F2D]/40 shadow-2xs">
                  <Sparkles size={12} className="text-[#8C620D]" />
                  Store Credit
                </span>
              </div>

              <p className="relative z-10 mt-3 text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                {formatMoney(wallet.balance || 0, wallet.currency || "INR")}
              </p>

              {wallet.lockedBalance > 0 && (
                <div className="relative z-10 mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-[#D6A323]/15 px-3 py-1.5 text-xs font-semibold text-[#8C620D] border border-[#CE9F2D]/30">
                  <Lock size={13} className="text-[#8C620D]" />
                  <span>
                    Locked:{" "}
                    <strong className="font-bold text-ink">
                      {formatMoney(
                        wallet.lockedBalance,
                        wallet.currency || "INR",
                      )}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          )}
        </ApiState>
      </div>
    </>
  );
}
