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
      <div className="sticky bottom-0 z-30 mt-2 border-t border-[#F0E6D2] bg-white/95 pb-2 pt-3 backdrop-blur-sm lg:shadow-[0_-8px_16px_rgba(255,255,255,0.9)]">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {inStock ? (
            <>
              <button
                type="button"
                disabled={!inStock}
                onClick={() => {
                  addToCart({ ...product, selectedVariant }, quantity);
                }}
                className="h-11 min-w-0 w-full rounded-lg border border-gold bg-white px-2 text-sm font-bold text-gold shadow-sm transition-all duration-300 ease-in-out hover:bg-gold/5 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:text-base"
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
                className="h-11 min-w-0 w-full rounded-lg bg-gold px-2 text-sm font-bold text-white shadow-sm transition-all duration-300 ease-in-out hover:bg-gold-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:text-base"
              >
                Buy now
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowNotifyModal(true)}
              className="h-11 w-full rounded-lg bg-gold px-3 text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:bg-gold-dark sm:h-12 sm:text-base"
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