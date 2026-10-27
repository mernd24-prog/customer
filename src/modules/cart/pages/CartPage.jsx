import { useState } from "react";
import Seo from "../../../components/ui/Seo";
import ApiState from "../../../components/ui/ApiState";
import { SkeletonLoader } from "../../../components/ui/skeleton";
import { EmptyState } from "../../../components/ui";
import StickySidebarLayout from "../../../components/ui/layout/StickySidebarLayout";
import CartItemCard from "../components/CartItemCard";
import BrandButton from "../../../components/ui/buttons/Button";
import ProductCard from "../../products/components/ProductCard";
import Breadcrumbs from "../../common/components/Breadcrumbs";
import { ConfirmModal } from "../../../components/ui";
import GuestOtpAuthModal from "../../../components/ui/overlay/GuestOtpAuthModal";
import OrderPaymentSummary from "../../orders/components/OrderPaymentSummary";
import { ContinueShoppingButton } from "../../../components/ui/button/static";
import { ArrowRight, CircleAlert, X } from "lucide-react";
import { CART_PAGE_SKELETON } from "../../../components/ui/skeleton/layouts";
import { formatMoney, toNum } from "../../../utils/ecommerce/money";
import { PageContainer } from "../../../components/ui/layout";
import {
  normalizeCartItemId,
  cartLineKey,
  buildSavedProductView,
} from "../../../utils/ecommerce/cart";
import { getProductId } from "../../../utils/ecommerce";
import {
  BUY_NOW_STORAGE_KEY,
  SELECTED_CHECKOUT_STORAGE_KEY,
} from "../../../constants";
import { adaptItemForCard } from "../../../utils/pages/cartUtils";
import useCart from "../controllers/useCart";

export default function CartPage() {
  const [itemToRemove, setItemToRemove] = useState(null);
  const {
    navigate,
    showGuestOtpModal,
    setShowGuestOtpModal,
    showLimitModal,
    setShowLimitModal,
    breadcrumbItems,
    cartState,
    cart,
    hasCartItems,
    hasSavedItems,
    selectedItems,
    selectedItemCount,
    items,
    normalizedSelectedItemIds,
    handleSelectAll,
    handleSelectItem,
    handleIncrease,
    handleDecrease,
    handleRemove,
    handleSaveForLater,
    handleBuyNow,
    mrpSubtotal,
    sellingSubtotal,
    productSavings,
    extraCoupon,
    extraWallet,
    shippingTotal,
    totalPayable,
    totalSavings,
    savedForLaterItems,
    wishlist,
    handleMoveSavedLineToCart,
    handleMoveWishlistToCart,
    wishlistLoading,
    populatedWishlist,
    recentViewedItems,
    selectedItemIds,
    setSelectedItemIds,
    addToCart,
    isWishlisted,
    toggleWishlist,
    currentUser,
  } = useCart();

  const savedCardClass =
    "relative cursor-pointer overflow-hidden rounded-[18px] border border-border bg-white px-4 py-4 shadow-[0_12px_32px_rgba(31,36,48,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[0_18px_45px_rgba(31,36,48,0.1)] sm:px-5";
  const savedCardStripClass = "absolute left-0 top-0 h-full w-1  ";
  const savedCardContentClass =
    "flex min-w-0 flex-col gap-4 pl-2 sm:flex-row sm:items-center sm:justify-between";
  const savedCardInfoClass = "flex min-w-0 items-center gap-4";
  const savedCardImageWrapperClass =
    "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-cream ring-1 ring-border sm:h-20 sm:w-20 object-top";
  const savedCardActionClass =
    "flex shrink-0 flex-col items-stretch gap-2 sm:min-w-[150px] sm:items-end";
  const savedCardLabelClass =
    "hidden text-xs font-semibold uppercase text-muted sm:block";
  const moveToCartButtonClass =
    "h-9 w-full border-gold/40 px-4 text-xs font-bold text-ink sm:w-auto";
  const stockBlockedItems = selectedItems.filter((item) => {
    if (item?.stock === null || item?.stock === undefined) return false;
    const stock = Number(item.stock);
    const quantity = Math.max(1, Number(item?.quantity || 1));
    return Number.isFinite(stock) && (stock <= 0 || quantity > stock);
  });
  const checkoutBlockedByStock = stockBlockedItems.length > 0;
  const checkoutButtonText = !selectedItems.length
    ? "Select products to checkout"
    : checkoutBlockedByStock
      ? "Review unavailable items"
      : "Proceed to Checkout";

  const getStockIssueLabel = (item) => {
    const stock = Number(item?.stock);
    const quantity = Math.max(1, Number(item?.quantity || 1));

    if (Number.isFinite(stock) && stock <= 0) return "Out of stock";
    if (Number.isFinite(stock) && quantity > stock) {
      return `Only ${stock} ${stock === 1 ? "unit" : "units"} available`;
    }

    return "Unavailable";
  };

  const removeOutOfStockItems = () => {
    if (!stockBlockedItems.length) return;

    stockBlockedItems.forEach((item) => {
      if (item?.id) handleRemove(item.id);
    });
  };

  return (
    <>
      <GuestOtpAuthModal
        open={showGuestOtpModal}
        onClose={() => setShowGuestOtpModal(false)}
        onSuccess={() => {
          setShowGuestOtpModal(false);
          navigate("/checkout");
        }}
      />
      <ConfirmModal
        open={showLimitModal}
        title="Maximum Quantity Reached"
        description="You can only purchase up to 5 units of this product in a single order."
        confirmLabel="OK"
        cancelLabel={null}
        onConfirm={() => setShowLimitModal(false)}
        onCancel={() => setShowLimitModal(false)}
      />
      <ConfirmModal
        open={!!itemToRemove}
        title="Remove Item"
        description="Are you sure you want to remove this item from your cart?"
        image={
          (typeof itemToRemove === "object" ? itemToRemove?.image : null) ||
          items.find(
            (item) => item.id === itemToRemove || item === itemToRemove,
          )?.image
        }
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (itemToRemove) {
            handleRemove(itemToRemove);
            setItemToRemove(null);
          }
        }}
        onCancel={() => setItemToRemove(null)}
      />
      <Seo
        title="Cart | Sam Global"
        description="Review items in your shopping cart."
      />

      <PageContainer>
        <Breadcrumbs items={breadcrumbItems} />

        <ApiState
          loading={cartState.loading && !cart.items}
          error={cartState.error}
          empty={false}
          skeletonLayout={CART_PAGE_SKELETON}
          skeletonContainerClass="bg-transparent"
        >
          {!hasCartItems && !cartState.loading ? (
            <EmptyState
              title="Your Cart is Empty"
              description="Add some products to continue shopping."
              actionLabel="Continue Shopping"
              onAction={() => navigate("/products")}
            />
          ) : (
            <StickySidebarLayout
              sidebarPosition="right"
              containerClass="flex flex-col gap-5 lg:flex-row lg:gap-6"
              sidebarClass="w-full shrink-0 transition-[top] duration-300 ease-in-out lg:w-[350px] 2xl:w-[369px]"
              mainContent={
                <div className="min-w-0 space-y-5">
                {checkoutBlockedByStock && (
                  <section
                    role="alert"
                    aria-live="polite"
                    className="rounded-lg border border-red-200 bg-red-50/70 px-3 py-2.5"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-2.5">
                        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-red-600">
                          <CircleAlert size={16} strokeWidth={2} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold leading-5 text-red-800">
                            {stockBlockedItems.length === 1
                              ? "1 item is unavailable"
                              : `${stockBlockedItems.length} items are unavailable`}
                          </h3>
                          <p className="mt-0.5 text-xs leading-4 text-red-700">
                            Remove unavailable items to continue to checkout.
                          </p>

                          {stockBlockedItems.length > 0 && (
                            <p className="mt-1 max-w-[680px] truncate text-[11px] leading-4 text-red-600/90">
                              {stockBlockedItems
                                .map((item) => item.title || item.name || "Product")
                                .join(" • ")}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={removeOutOfStockItems}
                        className="inline-flex shrink-0 items-center justify-center rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium leading-4 text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                      >
                        Remove unavailable items
                      </button>
                    </div>
                  </section>
                )}

                  {hasCartItems && (
                    <div className="flex items-center justify-between gap-3 py-1">
                      <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#2D2D2D]">
                        <input
                          type="checkbox"
                          checked={
                            selectedItems.length === items.length &&
                            items.length > 0
                          }
                          onChange={(event) =>
                            handleSelectAll(event.target.checked)
                          }
                          className="h-4 w-4 shrink-0 cursor-pointer rounded accent-[#3F4095]"
                        />
                        <span>Select all items</span>
                      </label>
                      <span className="shrink-0 text-sm font-medium text-[#555555]">
                        {selectedItems.length} of {items.length} selected
                      </span>
                    </div>
                  )}

                  {hasCartItems && (
                    <div className="rounded-lg border border-[#F0E6D2] bg-[#FFFDF8]  sm:rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                      {items.map((item, index) => (
                        <div key={item.id}>
                          <CartItemCard
                            item={item}
                            isLastItem={index === items.length - 1}
                            selected={normalizedSelectedItemIds.includes(
                              normalizeCartItemId(item),
                            )}
                            onSelect={handleSelectItem}
                            onIncrease={handleIncrease}
                            onDecrease={handleDecrease}
                            onRemove={setItemToRemove}
                            onSaveForLater={handleSaveForLater}
                            onBuyNow={handleBuyNow}
                            showCheckbox={true}
                            isWishlisted={isWishlisted(item)}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* On screens below lg, display Order Summary ABOVE Wishlist */}
                  {hasCartItems && (
                    <div className="block lg:hidden pt-2">
                      <OrderPaymentSummary
                        variant="cart"
                        mrpSubtotal={mrpSubtotal}
                        subtotal={sellingSubtotal}
                        productDiscount={productSavings}
                        couponDiscount={extraCoupon}
                        walletDiscount={extraWallet}
                        shipping={shippingTotal}
                        customerAmount={totalPayable}
                        totalSavings={totalSavings}
                        itemCount={selectedItemCount}
                        currency="INR"
                        title="Order Summary"
                        formatMoney={formatMoney}
                        asNumber={toNum}
                        buttonText={checkoutButtonText}
                        disabled={
                          !selectedItems.length || checkoutBlockedByStock
                        }
                        onCheckout={() => {
                          if (!selectedItems.length || checkoutBlockedByStock)
                            return;

                          window.sessionStorage.removeItem(BUY_NOW_STORAGE_KEY);
                          window.sessionStorage.setItem(
                            SELECTED_CHECKOUT_STORAGE_KEY,
                            JSON.stringify(selectedItemIds),
                          );

                          if (!currentUser) {
                            setShowGuestOtpModal(true);
                            return;
                          }
                          navigate("/checkout");
                        }}
                      />
                    </div>
                  )}

                  {hasCartItems && (
                    <div className="flex items-center gap-3 pt-2">
                      <ContinueShoppingButton
                        to="/products"
                        rightIcon={
                          <ArrowRight
                            className="w-3.5 h-3.5"
                            strokeWidth={2.5}
                          />
                        }
                      >
                        Continue Shopping
                      </ContinueShoppingButton>
                    </div>
                  )}
                </div>
              }
              sidebarContent={
                hasCartItems && (
                  <div className="hidden lg:block w-full min-w-0">
                    <OrderPaymentSummary
                      variant="cart"
                      mrpSubtotal={mrpSubtotal}
                      subtotal={sellingSubtotal}
                      productDiscount={productSavings}
                      couponDiscount={extraCoupon}
                      walletDiscount={extraWallet}
                      shipping={shippingTotal}
                      customerAmount={totalPayable}
                      totalSavings={totalSavings}
                      itemCount={selectedItemCount}
                      currency="INR"
                      title="Order Summary"
                      formatMoney={formatMoney}
                      asNumber={toNum}
                      buttonText={checkoutButtonText}
                      disabled={!selectedItems.length || checkoutBlockedByStock}
                      onCheckout={() => {
                        if (!selectedItems.length || checkoutBlockedByStock)
                          return;

                        window.sessionStorage.removeItem(BUY_NOW_STORAGE_KEY);
                        window.sessionStorage.setItem(
                          SELECTED_CHECKOUT_STORAGE_KEY,
                          JSON.stringify(selectedItemIds),
                        );

                        if (!currentUser) {
                          setShowGuestOtpModal(true);
                          return;
                        }

                        navigate("/checkout");
                      }}
                    />
                  </div>
                )
              }
            />
          )}
        </ApiState>
      </PageContainer>
    </>
  );
}
