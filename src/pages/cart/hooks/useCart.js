import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  setGuestCart,
  updateCart,
} from "../../../features/cart/cartSlice";
import { fetchProductById } from "../../../features/product/productSlice";
import { useToastThunk } from "../../../hooks/useToastThunk";
import { useProductActions } from "../../../hooks/useProductActions";
import { useWatchlistProducts } from "../../../hooks/useWatchlistProducts";
import { useAuthModal } from "../../../features/auth/AuthModalContext";
import { store } from "../../../app/store";
import { getRecentlyViewed } from "../../../utils/recentlyViewed";
import {
  getProductId,
  addProductToCartPayload,
  normalizeCartPayloadForWrite,
  wishlistPayload,
} from "../../../utils/ecommerce";
import {
  calcMRPSubtotal,
  calcSellingSubtotal,
  calcShippingTotal,
  calcTotalSavings,
} from "../../../utils/ecommerce/money";
import {
  cartLineKey,
  getCartItemStock,
  mergeDisplayCartItems,
  normalizeCartItemId,
  normalizeCartItemIds,
  readCheckoutCartItemIds,
  readSavedForLaterItems,
  readSelectedCheckoutItemIds,
  writeCheckoutCartItemIds,
  writeGuestCart,
  writeSavedForLaterItems,
  writeSelectedCheckoutItemIds,
} from "../../../utils/ecommerce/cart";
import {
  BUY_NOW_STORAGE_KEY,
  CHECKOUT_CART_ITEM_IDS_STORAGE_KEY,
  SELECTED_CHECKOUT_STORAGE_KEY,
} from "../../../constants";
import { adaptItemForCard } from "../utils/cartUtils";

export default function useCart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const run = useToastThunk();
  const { openGuestOtpModal } = useAuthModal();
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();
  const recentViewedItems = getRecentlyViewed();

  const currentUser = useSelector((state) => state.auth.current);
  const cartState = useSelector((s) => s.cart);
  const cart = cartState.current || {};
  const rawItems = useMemo(
    () => mergeDisplayCartItems(cart.items) || [],
    [cart.items],
  );
  const wishlist = useMemo(() => cart.wishlist || [], [cart.wishlist]);
  const productEntities = useSelector((state) => state.product.entities) || {};
  const fetchedIdsRef = useRef(new Set());
  const hasInitializedRef = useRef(false);
  const prevItemIdsRef = useRef(new Set());
  const [savedForLaterItems, setSavedForLaterItems] = useState(() =>
    readSavedForLaterItems(),
  );
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showGuestOtpModal, setShowGuestOtpModal] = useState(false);

  const [localQuantities, setLocalQuantities] = useState({});
  const latestRef = useRef({ rawItems: [], wishlist: [], localQuantities: {} });
  const updateTimerRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchCart());
    }
  }, [dispatch, currentUser]);

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

  const { products: populatedWishlist, isLoading: wishlistLoading } =
    useWatchlistProducts();

  useEffect(() => {
    const cartItemIds = rawItems
      .map((item) => getProductId(item.productId || {}))
      .filter(Boolean);

    const missingIds = cartItemIds.filter(
      (id) => !productEntities[id] && !fetchedIdsRef.current.has(id),
    );

    if (!missingIds.length) return;

    missingIds.forEach((id) => fetchedIdsRef.current.add(id));

    missingIds.forEach((productId) => {
      dispatch(fetchProductById({ productId })).catch(() => { });
    });
  }, [dispatch, rawItems, productEntities]);

  const items = useMemo(
    () =>
      rawItems.map((item) => {
        const key = cartLineKey(item);
        const productId =
          item.productId?._id || getProductId(item.productId || {});
        const fullProduct = productEntities[productId] || null;

        return localQuantities[key] != null
          ? adaptItemForCard(
            { ...item, quantity: localQuantities[key] },
            fullProduct,
          )
          : adaptItemForCard(item, fullProduct);
      }),
    [rawItems, localQuantities, productEntities],
  );

  const hasCartItems = items.length > 0;
  const hasSavedItems = savedForLaterItems.length > 0 || wishlist.length > 0;
  const normalizedSelectedItemIds = useMemo(
    () => normalizeCartItemIds(selectedItemIds),
    [selectedItemIds],
  );
  const selectedItems = items.filter((item) =>
    normalizedSelectedItemIds.includes(normalizeCartItemId(item)),
  );
  const selectedItemCount = selectedItems.reduce(
    (total, item) => total + Math.max(1, Number(item?.quantity || item?.qty || 1)),
    0,
  );

  const mrpSubtotal = calcMRPSubtotal(selectedItems);
  const sellingSubtotal = calcSellingSubtotal(selectedItems);
  const shippingTotal = 0;
  const productSavings = calcTotalSavings(selectedItems);
  const extraCoupon = 0;
  const extraWallet = 0;
  const extraTaxPayable = 0;
  const totalBeforeTax =
    sellingSubtotal + shippingTotal - extraCoupon - extraWallet;
  const totalPayable = Math.max(0, totalBeforeTax + extraTaxPayable);
  const totalSavings = productSavings + extraCoupon + extraWallet;

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

      if (!currentUser) {
        const nextCart = normalizeCartPayloadForWrite({
          items: updated,
          wishlist: latestWishlist,
        });
        const writtenCart = writeGuestCart(nextCart);
        dispatch(setGuestCart(writtenCart));
        return;
      }

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
  }, [currentUser, dispatch, run]);

  const handleIncrease = (id) => {
    setLocalQuantities((prev) => {
      const item = rawItems.find((ci) => cartLineKey(ci) === id);
      const current = prev[id] ?? item?.quantity ?? 1;
      const product = item?.productId || {};
      const stock = item ? getCartItemStock(item, product) : null;

      if (stock !== null && current >= stock) return prev;

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

    if (!currentUser) {
      const nextCart = normalizeCartPayloadForWrite({
        items: updated,
        wishlist: cart.wishlist || [],
      });
      const writtenCart = writeGuestCart(nextCart);
      dispatch(setGuestCart(writtenCart));
      return;
    }

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

    if (!currentUser) {
      openGuestOtpModal(() => {
        const currentStoreState = store.getState();
        const currentCart = currentStoreState.cart.current || {};
        const currentRawItems = mergeDisplayCartItems(currentCart.items) || [];
        const remainingItems = currentRawItems.filter(
          (ci) => normalizeCartItemId(ci) !== normalizedId,
        );
        const productToWishlist = {
          ...(itemToSave.productId && typeof itemToSave.productId === "object"
            ? itemToSave.productId
            : itemToSave.product || itemToSave._raw || itemView?._raw || {}),
          productId: itemToSave.productId,
          variantId: itemToSave.variantId,
          variantSku: itemToSave.variantSku,
          variantTitle: itemToSave.variantTitle,
          attributes: itemToSave.attributes,
        };
        const nextCart = normalizeCartPayloadForWrite({
          items: remainingItems,
          wishlist: currentCart.wishlist || [],
        });

        run(
          dispatch,
          updateCart(wishlistPayload(nextCart, productToWishlist, false)),
          "Moved to wishlist",
        );
      });
      return;
    }

    const remainingItems = rawItems.filter(
      (ci) => normalizeCartItemId(ci) !== normalizedId,
    );
    const productToWishlist = {
      ...(itemToSave.productId && typeof itemToSave.productId === "object"
        ? itemToSave.productId
        : itemToSave.product || itemToSave._raw || itemView?._raw || {}),
      productId: itemToSave.productId,
      variantId: itemToSave.variantId,
      variantSku: itemToSave.variantSku,
      variantTitle: itemToSave.variantTitle,
      attributes: itemToSave.attributes,
    };
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
    window.sessionStorage.removeItem(SELECTED_CHECKOUT_STORAGE_KEY);
    if (!currentUser) {
      setShowGuestOtpModal(true);
      return;
    }
    navigate("/checkout");
  };

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

  return {
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
    currentUser
  };

}
