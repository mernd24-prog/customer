import { useState } from "react";
import { buildCartItem } from "../../../utils/ecommerce";
import NotifyMeModal from "../../../components/ui/overlay/NotifyMeModal";

export default function ProductActionButtons({
  inStock,
  product,
  selectedVariant,
  quantity,
  addToCart,
  onBuyNow,
}) {
  const [showNotifyModal, setShowNotifyModal] = useState(false);

  return (
    <>
      <div className="sticky bottom-0 z-40 mt-2 w-full bg-white pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_20px_rgba(255,255,255,0.96)] lg:z-20 lg:pb-3">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {inStock ? (
            <>
              <button
                type="button"
                disabled={!inStock}
                onClick={() => {
                  addToCart({ ...product, selectedVariant }, quantity);
                }}
                className="h-11 min-w-0 w-full rounded-lg border border-gold bg-white px-2 text-sm font-bold text-gold shadow-sm transition-colors duration-200 hover:bg-[#FFF8E8] active:bg-[#FFF1CC] disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:text-base"
              >
                Add to cart
              </button>

              <button
                type="button"
                disabled={!inStock}
                onClick={() => {
                  const buyNowItem = buildCartItem(
                    { ...product, selectedVariant },
                    quantity,
                  );
                  onBuyNow?.(buyNowItem);
                }}
                className="h-11 min-w-0 w-full rounded-lg bg-gold px-2 text-sm font-bold text-white shadow-sm transition-colors duration-200 hover:bg-gold-dark active:bg-[#A97810] disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:text-base"
              >
                Buy now
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowNotifyModal(true)}
              className="h-11 w-full rounded-lg bg-gold px-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-gold-dark active:bg-[#A97810] sm:h-12 sm:text-base"
            >
              Notify Me
            </button>
          )}
        </div>
      </div>

      <NotifyMeModal
        open={showNotifyModal}
        onClose={() => setShowNotifyModal(false)}
        product={product}
        selectedVariant={selectedVariant}
      />
    </>
  );
}
