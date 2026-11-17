import { useState } from "react";
import { buildCartItem } from "../../../utils/ecommerce";
import NotifyMeModal from "../../../components/ui/overlay/NotifyMeModal";
import { DynamicButton } from "../../../components/ui/button";

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
              <DynamicButton
                variant="goldOutline"
                size="md"
                disabled={!inStock}
                className="w-full"
                onClick={() => {
                  addToCart({ ...product, selectedVariant }, quantity);
                }}
              >
                Add to cart
              </DynamicButton>

              <DynamicButton
                variant="gold"
                size="md"
                disabled={!inStock}
                className="w-full"
                onClick={() => {
                  const buyNowItem = buildCartItem(
                    { ...product, selectedVariant },
                    quantity,
                  );
                  onBuyNow?.(buyNowItem);
                }}
              >
                Buy now
              </DynamicButton>
            </>
          ) : (
            <DynamicButton
              variant="gold"
              size="md"
              className="w-full"
              onClick={() => setShowNotifyModal(true)}
            >
              Notify Me
            </DynamicButton> 
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
