import Seo from "../../components/ui/Seo";
import ApiState from "../../components/ui/ApiState";
import { SkeletonLoader } from "../../components/ui/skeleton";
import { EmptyState } from "../../components/ui";
import StickySidebarLayout from "../../components/ui/layout/StickySidebarLayout";
import CartItemCard from "./components/CartItemCard";
import BrandButton from "../../components/ui/buttons/Button";
import { Breadcrumbs, ProductCard } from "../../components/ecommerce";
import { ConfirmModal } from "../../components/ui";
import GuestOtpAuthModal from "../../components/ui/overlay/GuestOtpAuthModal";
import OrderPaymentSummary from "../orders/components/OrderPaymentSummary";
import { OutlineSmallButton } from "../../components/ui/button/static";
import { FaAngleRight } from "react-icons/fa6";
import { CART_PAGE_SKELETON } from "../../components/ui/skeleton/layouts";
import { formatMoney, toNum } from "../../utils/ecommerce/money";
import {
  normalizeCartItemId,
  cartLineKey,
  buildSavedProductView,
} from "../../utils/ecommerce/cart";
import { getProductId } from "../../utils/ecommerce";
import {
  BUY_NOW_STORAGE_KEY,
  SELECTED_CHECKOUT_STORAGE_KEY,
} from "../../constants";
import { adaptItemForCard } from "../../utils/pages/cartUtils";
import useCart from "./hooks/useCart";

export default function CartPage() {
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
      <Seo
        title="Cart | Sam Global"
        description="Review items in your shopping cart."
      />

      <section className="bg-white mt-8">
        <div className="mx-auto w-full max-w-[1900px]">
          <Breadcrumbs
            items={breadcrumbItems}
            className="mb-2 flex flex-wrap items-center gap-[10px] sm:gap-[12px] lg:gap-[15px]"
            linkClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#2E2E2E]"
            currentClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#CE9F2D]"
            separatorClassName="text-[#2E2E2E]"
            heading="Shopping Cart"
          />

          <ApiState
            loading={cartState.loading && !cart.items}
            error={cartState.error}
            empty={false}
            skeletonLayout={CART_PAGE_SKELETON}
            skeletonContainerClass="bg-transparent"
          >
            {!hasCartItems && !cartState.loading && (
              <EmptyState
                title="Your Cart is Empty"
                description="Add some products to continue shopping."
                actionLabel="Continue Shopping"
                onAction={() => navigate("/products")}
                className={hasSavedItems ? "mb-8" : ""}
              />
            )}

            <StickySidebarLayout
              sidebarPosition="right"
              containerClass="flex flex-col lg:flex-row gap-5 sm:gap-6 lg:gap-8 xl:gap-9"
              sidebarClass="w-full lg:w-[350px] 2xl:w-[369px] shrink-0 transition-[top] duration-300 ease-in-out"
              mainContent={
                <div className="min-w-0 space-y-5 sm:space-y-6 lg:space-y-8">
                  {hasCartItems && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-bold text-[#2d2d2d] sm:text-[15px]">
                        <input
                          type="checkbox"
                          checked={
                            selectedItems.length === items.length &&
                            items.length > 0
                          }
                          onChange={(event) =>
                            handleSelectAll(event.target.checked)
                          }
                          className="h-4 w-4 rounded-[4px] border-[#A9B4D8] accent-[#3F4095]"
                        />
                        Select All Items
                      </label>
                      <span className="text-sm font-bold text-[#2d2d2d] sm:text-[15px]">
                        {selectedItems.length}/{items.length} Items selected
                      </span>
                    </div>
                  )}

                  {hasCartItems && (
                    <div className="rounded-[16px] border border-[#F0E6D2] bg-[#FFFDF8] sm:rounded-[20px]">
                      {items.map((item) => (
                        <div key={item.id}>
                          <CartItemCard
                            item={item}
                            selected={normalizedSelectedItemIds.includes(
                              normalizeCartItemId(item),
                            )}
                            onSelect={handleSelectItem}
                            onIncrease={handleIncrease}
                            onDecrease={handleDecrease}
                            onRemove={handleRemove}
                            onSaveForLater={handleSaveForLater}
                            onBuyNow={handleBuyNow}
                            showCheckbox={true}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* On screens below lg, display Order Summary ABOVE Wishlist */}
                  {hasCartItems && (
                    <div className="block lg:hidden my-2 sm:my-4">
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
                        itemCount={selectedItems.length}
                        currency="INR"
                        title="Order Summary"
                        formatMoney={formatMoney}
                        asNumber={toNum}
                        buttonText={
                          selectedItems.length
                            ? "Proceed to Checkout"
                            : "Select products to checkout"
                        }
                        onCheckout={() => {
                          if (!selectedItems.length) return;

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

                  {hasSavedItems && (
                    <div className="">
                      <h2 className="mb-4  text-[16px] font-semibold text-ink">
                        Wishlist ({savedForLaterItems.length + wishlist.length})
                      </h2>

                      <div className="grid gap-3">
                        {savedForLaterItems.map((savedItem) => {
                          const savedItemView = adaptItemForCard(savedItem);

                          return (
                            <div
                              key={savedItemView.id}
                              className={savedCardClass}
                            >
                              <div className={savedCardStripClass} />
                              <div className={savedCardContentClass}>
                                <div className={savedCardInfoClass}>
                                  <div className={savedCardImageWrapperClass}>
                                    <img
                                      src={savedItemView.image}
                                      alt={savedItemView.title}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="line-clamp-2  text-sm font-bold leading-5 text-ink sm:text-base">
                                      {savedItemView.title}
                                    </p>

                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                                      {savedItemView.variantSku ? (
                                        <span className="rounded-full bg-cream px-2.5 py-1 font-semibold text-[#595959]">
                                          {savedItemView.variantSku}
                                        </span>
                                      ) : null}
                                      <span>
                                        Qty {savedItemView.quantity} x{" "}
                                        <span className="font-semibold text-ink">
                                          ₹
                                          {Number(
                                            savedItemView.price || 0,
                                          ).toLocaleString("en-IN")}
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className={savedCardActionClass}>
                                  <p className={savedCardLabelClass}>
                                    Saved item
                                  </p>
                                  <BrandButton
                                    variant="secondary"
                                    rounded
                                    size="sm"
                                    label="Move to cart"
                                    className={moveToCartButtonClass}
                                    onClick={() =>
                                      handleMoveSavedLineToCart(savedItem)
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {wishlistLoading ? (
                          <div className="grid gap-3">
                            <SkeletonLoader
                              count={wishlist.length || 2}
                              layout={[
                                {
                                  type: "row",
                                  className:
                                    "relative overflow-hidden rounded-[18px] border border-border bg-white px-4 py-4 shadow-[0_12px_32px_rgba(31,36,48,0.06)] sm:px-5 flex items-center justify-between",
                                  children: [
                                    {
                                      type: "row",
                                      className: "flex items-center gap-4",
                                      children: [
                                        {
                                          type: "box",
                                          width: "64px",
                                          height: "64px",
                                          rounded: "rounded-[14px]",
                                          className: "sm:h-20 sm:w-20",
                                        },
                                        {
                                          type: "col",
                                          className: "gap-2",
                                          children: [
                                            {
                                              type: "box",
                                              width: "140px",
                                              height: "16px",
                                            },
                                            {
                                              type: "box",
                                              width: "80px",
                                              height: "14px",
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                    {
                                      type: "box",
                                      width: "90px",
                                      height: "36px",
                                      rounded: "rounded-full",
                                      className: "hidden sm:block",
                                    },
                                  ],
                                },
                              ]}
                            />
                          </div>
                        ) : (
                          populatedWishlist
                            .map((wishlistProduct) => {
                              const wishlistId = getProductId(wishlistProduct);
                              const savedProduct = buildSavedProductView(
                                wishlistProduct,
                                wishlistProduct,
                              );

                              return { wishlistId, savedProduct };
                            })
                            .filter(Boolean)
                            .map(({ wishlistId, savedProduct }) => {
                              return (
                                <div
                                  key={wishlistId}
                                  className={savedCardClass}
                                  onClick={() =>
                                    navigate(`/products/${savedProduct.id}`)
                                  }
                                  onKeyDown={(event) => {
                                    if (
                                      event.key === "Enter" ||
                                      event.key === " "
                                    ) {
                                      event.preventDefault();
                                      navigate(`/products/${savedProduct.id}`);
                                    }
                                  }}
                                  role="link"
                                  tabIndex={0}
                                >
                                  <div className={savedCardStripClass} />
                                  <div className={savedCardContentClass}>
                                    <div className={savedCardInfoClass}>
                                      <div
                                        className={savedCardImageWrapperClass}
                                      >
                                        <img
                                          src={savedProduct.image}
                                          alt={savedProduct.title}
                                          className="h-full w-full object-cover object-top"
                                        />
                                      </div>

                                      <div className="min-w-0">
                                        <p className="line-clamp-2 text-sm font-bold leading-5 text-ink sm:text-base">
                                          {savedProduct.title}
                                        </p>

                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                                          {savedProduct.brand ? (
                                            <span className="rounded-full bg-cream px-2.5 py-1 font-semibold text-[#595959]">
                                              {savedProduct.brand}
                                            </span>
                                          ) : null}

                                          {savedProduct.price != null ? (
                                            <span className="font-semibold text-ink">
                                              ₹
                                              {Number(
                                                savedProduct.price,
                                              ).toLocaleString("en-IN")}
                                            </span>
                                          ) : (
                                            <span className="font-semibold text-muted">
                                              Price not available
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className={savedCardActionClass}>
                                      <p className={savedCardLabelClass}>
                                        Saved item
                                      </p>
                                      <BrandButton
                                        variant="secondary"
                                        rounded
                                        size="sm"
                                        label="Move to cart"
                                        className={moveToCartButtonClass}
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          handleMoveWishlistToCart(
                                            savedProduct,
                                          );
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </div>
                  )}

                  {hasCartItems && (
                    <div className="flex items-center gap-3 ">
                      <OutlineSmallButton
                        to="/products"
                        rightIcon={<FaAngleRight className="text-[10px]" />}
                        className="xl:text-[18px] text-[14px] xl:font-bold lg:text-[16px] lg:font-semibold transition-all duration-300 ease-in-out"
                      >
                        Continue Shopping
                      </OutlineSmallButton>
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
                      itemCount={selectedItems.length}
                      currency="INR"
                      title="Order Summary"
                      formatMoney={formatMoney}
                      asNumber={toNum}
                      buttonText={
                        selectedItems.length
                          ? "Proceed to Checkout"
                          : "Select products to checkout"
                      }
                      onCheckout={() => {
                        if (!selectedItems.length) return;

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

            {/* RECENTLY VIEWED SECTION
            {recentViewedItems && recentViewedItems.length > 0 && (
              <div className="mt-8 lg:mt-16">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-[#3F4095] sm:text-2xl lg:text-[28px]">
                      Recently Viewed
                    </h2>
                    <p className="mt-2 text-sm text-[#666] sm:text-[15px]">
                      Multiple widgets available in the product designer
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ">
                    <OutlineSmallButton
                      to="/products"
                      rightIcon={<FaAngleRight className="text-[10px]" />}
                      className="xl:text-[18px] text-[14px] xl:font-bold lg:text-[16px] lg:font-semibold  transition-all duration-300 ease-in-out"
                    >
                      Browse All Products
                    </OutlineSmallButton>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 lg:gap-6">
                  {recentViewedItems.map((item) => (
                    <ProductCard
                      key={getProductId(item)}
                      product={item}
                      onAddToCart={addToCart}
                      onWishlist={toggleWishlist}
                      isWishlisted={isWishlisted(item)}
                    />
                  ))}
                </div>
              </div>
            )} */}
          </ApiState>
        </div>
      </section>
    </>
  );
}
