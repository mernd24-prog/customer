import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import CartItemCard from "../../components/cart/CartItemCard";
import CartSummary from "../../components/cart/CartSummary";
import BrandButton from "../../components/ui/BrandButton";
import { Breadcrumbs, ProductCard } from "../../components/ecommerce";
import { fetchCart, updateCart } from "../../features/cart/cartSlice";
import { fetchProductById } from "../../features/product/productSlice";
import { useToastThunk } from "../../hooks/useToastThunk";
import { useProductActions } from "../../hooks/useProductActions";
import { getRecentlyViewed } from "../../utils/recentlyViewed";
import {
  getProductId,
  getProductImage,
  getImageFallbackSrc,
  getProductTitle,
  addProductToCartPayload,
  normalizeCartPayloadForWrite,
  wishlistPayload,
} from "../../utils/ecommerce";
import {
  formatMoney,
  calcMRPSubtotal,
  calcSellingSubtotal,
  calcShippingTotal,
  calcTotalSavings,
  toNum,
} from "../../utils/ecommerce/money";

import { ConfirmModal } from "../../components/common";

import OrderPaymentSummary from "../orders/components/OrderPaymentSummary";

// import { ChevronRight } from "lucide-react";
import { OutlineSmallButton } from "../../components/dynamicComponent/button/static";
import { FaAngleRight } from "react-icons/fa6";
import { buildSavedProductView, cartLineKey, getCartItemStock, mergeDisplayCartItems, normalizeCartItemId, normalizeCartItemIds, normalizeId, readCheckoutCartItemIds, readSavedForLaterItems, readSelectedCheckoutItemIds, writeCheckoutCartItemIds, writeSavedForLaterItems, writeSelectedCheckoutItemIds } from "../../utils/ecommerce/cart";
import { BUY_NOW_STORAGE_KEY, CHECKOUT_CART_ITEM_IDS_STORAGE_KEY, SELECTED_CHECKOUT_STORAGE_KEY } from "../../constants";


function adaptItemForCard(item) {
  const product = item.productId || {};
  const productId = item.productId?._id || getProductId(product);
  const variantKey = item.variantId || item.variantSku || "";
  const title = getProductTitle(product, item.title || "Product");
  const image =
    getProductImage(product) ||
    item.image ||
    getImageFallbackSrc(title, "cart");
  const price = item.price ?? product.price ?? product.sellingPrice ?? 0;
  const oldPrice = item.oldPrice ?? product.mrp ?? product.originalPrice;
  const shipping = item.shipping ?? 0;
  const quantity = item.quantity || 1;
  const seller = item.seller || product.seller?.name || product.brand;
  const condition = item.condition;
  const attributes = item.attributes || {};
  const color = item.color || item.selectedColor || attributes.color;
  const size = item.size || item.selectedSize || attributes.size;
  const stock = getCartItemStock(item, product);
  const outOfStock = stock !== null && stock <= 0;
  const stockLimitReached = stock !== null && stock > 0 && quantity >= stock;
  const stockMessage = outOfStock
    ? "Out of stock"
    : stockLimitReached
      ? `Only ${stock} in stock`
      : "";
  const rating =
    item.rating ??
    item.averageRating ??
    product.rating ??
    product.averageRating ??
    product.ratingsAverage;
  const reviewCount =
    item.reviewCount ??
    item.reviewsCount ??
    product.reviewCount ??
    product.reviewsCount ??
    product.numReviews;

  return {
    id: normalizeCartItemId({
      productId,
      variantId: item.variantId,
      variantSku: variantKey,
    }),
    productId,
    variantId: item.variantId,
    variantSku: item.variantSku,
    title,
    image,
    price,
    oldPrice,
    shipping,
    quantity,
    seller,
    condition,
    color,
    size,
    rating,
    reviewCount,
    stock,
    attributes,
    stockMessage,
    increaseDisabled: outOfStock || stockLimitReached,
    _raw: item,
  };
}



export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const run = useToastThunk();
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();
  const recentViewedItems = getRecentlyViewed();

  const cartState = useSelector((s) => s.cart);
  const cart = cartState.current || {};
  const rawItems = useMemo(
    () => mergeDisplayCartItems(cart.items || []),
    [cart.items],
  );
  const wishlist = useMemo(() => cart.wishlist || [], [cart.wishlist]);
  const productEntities = useSelector((state) => state.product.entities || {});
  const fetchedIdsRef = useRef(new Set());
  const hasInitializedRef = useRef(false);
  const prevItemIdsRef = useRef(new Set());
  const [savedForLaterItems, setSavedForLaterItems] = useState(() =>
    readSavedForLaterItems(),
  );
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const [localQuantities, setLocalQuantities] = useState({});
  const latestRef = useRef({ rawItems: [], wishlist: [], localQuantities: {} });
  const updateTimerRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Cart", href: "/cart" },
  ];

  useEffect(() => {
    latestRef.current = {
      rawItems,
      wishlist: cart.wishlist || [],
      localQuantities,
    };
  }, [rawItems, cart.wishlist, localQuantities]);

  useEffect(() => {
    setLocalQuantities({});
  }, [cart.items]);

  useEffect(() => {
    return () => clearTimeout(updateTimerRef.current);
  }, []);

  useEffect(() => {
    const wishlistIds = wishlist.map(getProductId).filter(Boolean);
    const missingIds = wishlistIds.filter(
      (id) => !productEntities[id] && !fetchedIdsRef.current.has(id),
    );

    if (!missingIds.length) return;

    missingIds.forEach((id) => fetchedIdsRef.current.add(id));

    missingIds.forEach((productId) => {
      dispatch(fetchProductById({ productId })).catch(() => {});
    });
  }, [dispatch, wishlist, productEntities]);

  const items = useMemo(
    () =>
      rawItems.map((item) => {
        const key = cartLineKey(item);
        const adapted = adaptItemForCard(item);
        return localQuantities[key] != null
          ? { ...adapted, quantity: localQuantities[key] }
          : adapted;
      }),
    [rawItems, localQuantities],
  );

  const mrpSubtotal = calcMRPSubtotal(items);
  const sellingSubtotal = calcSellingSubtotal(items);
  const shippingTotal = calcShippingTotal(items);
  const productSavings = calcTotalSavings(items);
  const extraCoupon = 0;
  const extraWallet = 0;
  const extraTaxPayable = 0;
  const totalBeforeTax =
    sellingSubtotal + shippingTotal - extraCoupon - extraWallet;
  const totalPayable = Math.max(0, totalBeforeTax + extraTaxPayable);
  const totalSavings = productSavings + extraCoupon + extraWallet;

  const hasCartItems = items.length > 0;
  const hasSavedItems = savedForLaterItems.length > 0 || wishlist.length > 0;
  const normalizedSelectedItemIds = useMemo(
    () => normalizeCartItemIds(selectedItemIds),
    [selectedItemIds],
  );
  const selectedItems = items.filter((item) =>
    normalizedSelectedItemIds.includes(normalizeCartItemId(item)),
  );

  useEffect(() => {
    const currentItemIds = normalizeCartItemIds(
      items.map((item) => normalizeCartItemId(item)),
    );
    const currentItemIdsSet = new Set(currentItemIds);

    if (!items.length) {
      if (hasInitializedRef.current) {
        setSelectedItemIds([]);
        window.sessionStorage.removeItem(SELECTED_CHECKOUT_STORAGE_KEY);
        window.sessionStorage.removeItem(CHECKOUT_CART_ITEM_IDS_STORAGE_KEY);
        hasInitializedRef.current = false;
      }
      prevItemIdsRef.current = currentItemIdsSet;
      return;
    }

    if (!hasInitializedRef.current) {
      const storedSelectedItemIds = readSelectedCheckoutItemIds();
      const savedSelectedItemIds = normalizeCartItemIds(
        storedSelectedItemIds || [],
      );
      const savedCartItemIds = normalizeCartItemIds(readCheckoutCartItemIds());
      const savedCartItemIdsSet = new Set(savedCartItemIds);
      const newlyAddedItemIds = currentItemIds.filter(
        (id) => !savedCartItemIdsSet.has(id),
      );
      const nextSelectedItemIds =
        storedSelectedItemIds === null
          ? currentItemIds
          : normalizeCartItemIds([
              ...savedSelectedItemIds.filter((id) => currentItemIdsSet.has(id)),
              ...newlyAddedItemIds,
            ]);

      setSelectedItemIds(nextSelectedItemIds);
      writeSelectedCheckoutItemIds(nextSelectedItemIds);
      writeCheckoutCartItemIds(currentItemIds);
      hasInitializedRef.current = true;
    } else if (hasInitializedRef.current) {
      // Find if there are any new items that were added
      const newIds = currentItemIds.filter(
        (id) => !prevItemIdsRef.current.has(id),
      );

      setSelectedItemIds((current) => {
        // Filter out any selected items that are no longer in the cart
        const nextFiltered = normalizeCartItemIds(current).filter((id) =>
          currentItemIdsSet.has(id),
        );
        // Add any newly added items
        const next = normalizeCartItemIds([...nextFiltered, ...newIds]);

        // Only update state if selection actually changed
        const normalizedCurrent = normalizeCartItemIds(current);
        const isSame =
          next.length === normalizedCurrent.length &&
          next.every((id, idx) => id === normalizedCurrent[idx]);
        if (!isSame) writeSelectedCheckoutItemIds(next);
        writeCheckoutCartItemIds(currentItemIds);
        return isSame ? normalizedCurrent : next;
      });
    }

    prevItemIdsRef.current = currentItemIdsSet;
  }, [items]);

  const persistSavedForLater = (itemsToSave) => {
    setSavedForLaterItems(itemsToSave);
    writeSavedForLaterItems(itemsToSave);
  };

  const scheduleCartUpdate = useCallback(() => {
    clearTimeout(updateTimerRef.current);
    updateTimerRef.current = setTimeout(() => {
      const {
        rawItems: latestRawItems,
        wishlist: latestWishlist,
        localQuantities: pending,
      } = latestRef.current;
      const updated = latestRawItems.map((ci) => {
        const key = cartLineKey(ci);
        return pending[key] != null ? { ...ci, quantity: pending[key] } : ci;
      });
      run(
        dispatch,
        updateCart(
          normalizeCartPayloadForWrite({
            items: updated,
            wishlist: latestWishlist,
          }),
        ),
        "Cart updated",
      );
    }, 600);
  }, [dispatch, run]);

  const handleIncrease = (id) => {
    setLocalQuantities((prev) => {
      const item = rawItems.find((ci) => cartLineKey(ci) === id);
      const current = prev[id] ?? item?.quantity ?? 1;
      return { ...prev, [id]: current + 1 };
    });
    scheduleCartUpdate();
  };

  const handleDecrease = (id) => {
    setLocalQuantities((prev) => {
      const item = rawItems.find((ci) => cartLineKey(ci) === id);
      const current = prev[id] ?? item?.quantity ?? 1;
      return { ...prev, [id]: Math.max(1, current - 1) };
    });
    scheduleCartUpdate();
  };

  const handleRemove = (id) => {
    const updated = rawItems.filter((ci) => cartLineKey(ci) !== id);

    run(
      dispatch,
      updateCart(
        normalizeCartPayloadForWrite({
          items: updated,
          wishlist: cart.wishlist || [],
        }),
      ),
      "Item removed",
    );
  };

  const handleSelectItem = (id, selected) => {
    const normalizedId = normalizeCartItemId(id);

    setSelectedItemIds((current) => {
      const normalizedCurrent = normalizeCartItemIds(current);
      const next = selected
        ? normalizeCartItemIds([...normalizedCurrent, normalizedId])
        : normalizedCurrent.filter((itemId) => itemId !== normalizedId);
      writeSelectedCheckoutItemIds(next);
      return next;
    });
  };

  const handleSelectAll = (selected) => {
    const next = selected
      ? normalizeCartItemIds(items.map((item) => normalizeCartItemId(item)))
      : [];
    setSelectedItemIds(next);
    writeSelectedCheckoutItemIds(next);
  };

  const handleSaveForLater = (id) => {
    const normalizedId = normalizeCartItemId(id);
    const itemToSave = rawItems.find(
      (ci) => normalizeCartItemId(ci) === normalizedId,
    );
    const itemView = items.find(
      (item) => normalizeCartItemId(item) === normalizedId,
    );

    if (!itemToSave) return;

    const remainingItems = rawItems.filter(
      (ci) => normalizeCartItemId(ci) !== normalizedId,
    );
    const productToWishlist =
      itemToSave.productId && typeof itemToSave.productId === "object"
        ? itemToSave.productId
        : itemToSave.product || itemToSave._raw || itemView?._raw || itemToSave;
    const nextCart = normalizeCartPayloadForWrite({
      items: remainingItems,
      wishlist: cart.wishlist || [],
    });

    run(
      dispatch,
      updateCart(wishlistPayload(nextCart, productToWishlist, false)),
      "Moved to wishlist",
    );
  };

  const handleMoveWishlistToCart = (savedProduct) => {
    const payload = addProductToCartPayload(
      cart,
      savedProduct.productForCart,
      1,
    );

    const newWishlistPayload = wishlistPayload(
      payload,
      savedProduct.productForCart,
      true,
    );

    run(dispatch, updateCart(newWishlistPayload), "Moved to cart");
  };

  const handleMoveSavedLineToCart = (savedItem) => {
    const normalizedSavedItemId = normalizeCartItemId(savedItem);
    persistSavedForLater(
      savedForLaterItems.filter(
        (item) => normalizeCartItemId(item) !== normalizedSavedItemId,
      ),
    );
    run(
      dispatch,
      updateCart(
        normalizeCartPayloadForWrite({
          items: [...rawItems, savedItem],
          wishlist: cart.wishlist || [],
        }),
      ),
      "Moved to cart",
    );
  };

  const handleBuyNow = (id) => {
    const itemToBuy = rawItems.find((ci) => cartLineKey(ci) === id);
    if (!itemToBuy) return;
    window.sessionStorage.setItem(
      BUY_NOW_STORAGE_KEY,
      JSON.stringify([itemToBuy]),
    );
    navigate("/checkout");
  };

  const savedCardClass =
  "relative overflow-hidden rounded-[18px] border border-border bg-white px-4 py-4 shadow-[0_12px_32px_rgba(31,36,48,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[0_18px_45px_rgba(31,36,48,0.1)] sm:px-5";
  const savedCardStripClass =
  "absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-gold to-gold-dark";
  const savedCardContentClass =
  "flex min-w-0 flex-col gap-4 pl-2 sm:flex-row sm:items-center sm:justify-between";
  const savedCardInfoClass =
  "flex min-w-0 items-center gap-4";
  const savedCardImageWrapperClass =
  "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-cream ring-1 ring-border sm:h-20 sm:w-20";
  const savedCardActionClass =
  "flex shrink-0 flex-col items-stretch gap-2 sm:min-w-[150px] sm:items-end";
  const savedCardLabelClass =
  "hidden text-xs font-semibold uppercase text-muted sm:block";
  const moveToCartButtonClass =
  "h-9 w-full border-gold/40 px-4 text-xs font-bold text-ink sm:w-auto";

  return (
    <>
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

      <section className="bg-white px-3 py-6 min-[375px]:px-4 sm:px-6 sm:py-8 lg:px-10 2xl:px-0">
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
            empty={!hasCartItems && !hasSavedItems && !cartState.loading}
            emptyTitle="Your cart is empty"
            emptyText="Add some products to continue shopping."
            emptyActionLabel="Continue Shopping"
            onEmptyAction={() => navigate("/")}
          >
            <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_563px] lg:gap-9">
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
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className={
                          index !== items.length - 1
                            ? "border-b border-[#F0E6D2]"
                            : ""
                        }
                      >
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

                {hasSavedItems && (
                  <div className="panel">
                    <h3 className="mb-4  text-[16px] font-semibold text-ink">
                      Saved for later (
                      {savedForLaterItems.length + wishlist.length})
                    </h3>

                    <div className="grid gap-3">
                      {savedForLaterItems.map((savedItem) => {
                        const savedItemView = adaptItemForCard(savedItem);

                        return (
                          <div
                            key={savedItemView.id}
                            className={savedCardClass}
                          >
                            <div className={savedCardStripClass}/>
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
                                  <p className="line-clamp-2 text-sm font-bold leading-5 text-ink sm:text-base">
                                    {savedItemView.title}
                                  </p>

                                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                                    {savedItemView.variantSku ? (
                                      <span className="rounded-full bg-cream px-2.5 py-1 font-semibold text-gray">
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

                      {wishlist.map((wishlistProduct) => {
                        const wishlistId = getProductId(wishlistProduct);

                        const savedProduct = buildSavedProductView(
                          wishlistProduct,
                          productEntities[wishlistId],
                        );

                        return (
                          <div
                            key={wishlistId}
                            className={savedCardClass}
                          >
                            <div className={savedCardStripClass}/>
                            <div className={savedCardContentClass}>
                              <div className={savedCardInfoClass}>
                                <div className={savedCardImageWrapperClass}>
                                  <img
                                    src={savedProduct.image}
                                    alt={savedProduct.title}
                                    className="h-full w-full object-cover"
                                  />
                                </div>

                                <div className="min-w-0">
                                  <p className="line-clamp-2 text-sm font-bold leading-5 text-ink sm:text-base">
                                    {savedProduct.title}
                                  </p>

                                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                                    {savedProduct.brand ? (
                                      <span className="rounded-full bg-cream px-2.5 py-1 font-semibold text-gray">
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
                                  onClick={() =>
                                    handleMoveWishlistToCart(savedProduct)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <OutlineSmallButton
                    to="/products"
                    rightIcon={<FaAngleRight className="text-[10px]" />}
                  >
                    Continue Shopping
                  </OutlineSmallButton>
                </div>
              </div>

              {hasCartItems && (
                <div className="w-full">
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
                    formatMoney={formatMoney}
                    asNumber={toNum}
                    buttonText={
                      selectedItems.length
                        ? "Proceed to Checkout"
                        : "Select products to checkout"
                    }
                    onCheckout={() => {
                      if (!selectedItems.length) return;

                      window.sessionStorage.setItem(
                        SELECTED_CHECKOUT_STORAGE_KEY,
                        JSON.stringify(selectedItemIds),
                      );

                      navigate("/checkout");
                    }}
                  />
                </div>
              )}
            </div>

            {/* RECENTLY VIEWED SECTION */}
            {recentViewedItems && recentViewedItems.length > 0 && (
              <div className="mt-12 lg:mt-16">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-[#3F4095] sm:text-2xl lg:text-[28px]">
                      Recently Viewed
                    </h2>
                    <p className="mt-2 text-sm text-[#666] sm:text-[15px]">
                      Multiple widgets available in the product designer
                    </p>
                  </div>
                  <OutlineSmallButton
                    to="/products"
                    rightIcon={<FaAngleRight className="text-[10px]" />}
                    className="self-start sm:self-center"
                  >
                    Browse All Products
                  </OutlineSmallButton>
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
            )}
          </ApiState>
        </div>
      </section>
    </>
  );
}
