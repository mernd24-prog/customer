import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Store } from "lucide-react";
import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import CartItemCard from "../../components/cart/CartItemCard";
import CartSummary from "../../components/cart/CartSummary";
import BrandButton from "../../components/ui/BrandButton";
import { ProductCard } from "../../components/ecommerce";
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
import { ConfirmModal } from "../../components/common";
import { ChevronRight } from "lucide-react";
import { OutlineSmallButton } from "../../components/dynamicComponent/button/static";
import { FaAngleRight } from "react-icons/fa6";

const BUY_NOW_STORAGE_KEY = "sam_global_buy_now_items";
const SAVED_FOR_LATER_STORAGE_KEY = "sam_global_saved_for_later_items";
const SELECTED_CHECKOUT_STORAGE_KEY = "sam_global_selected_checkout_item_ids";
const CHECKOUT_CART_ITEM_IDS_STORAGE_KEY = "sam_global_checkout_cart_item_ids";

function readSavedForLaterItems() {
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(SAVED_FOR_LATER_STORAGE_KEY) || "[]",
    );
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSavedForLaterItems(items) {
  window.localStorage.setItem(
    SAVED_FOR_LATER_STORAGE_KEY,
    JSON.stringify(items),
  );
}

function readSelectedCheckoutItemIds() {
  try {
    const storedValue = window.sessionStorage.getItem(
      SELECTED_CHECKOUT_STORAGE_KEY,
    );
    if (storedValue === null) return null;
    const parsed = JSON.parse(storedValue);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeSelectedCheckoutItemIds(itemIds) {
  window.sessionStorage.setItem(
    SELECTED_CHECKOUT_STORAGE_KEY,
    JSON.stringify(itemIds),
  );
}

function readCheckoutCartItemIds() {
  try {
    const parsed = JSON.parse(
      window.sessionStorage.getItem(CHECKOUT_CART_ITEM_IDS_STORAGE_KEY) || "[]",
    );
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCheckoutCartItemIds(itemIds) {
  window.sessionStorage.setItem(
    CHECKOUT_CART_ITEM_IDS_STORAGE_KEY,
    JSON.stringify(itemIds),
  );
}

function getNumericValue(...values) {
  const value = values.find((entry) => entry !== undefined && entry !== null && entry !== "");
  if (value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getCartItemStock(item = {}, product = {}) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const matchingVariant = variants.find(
    (variant) =>
      String(variant?._id || variant?.id || "") === String(item.variantId || "") ||
      String(variant?.sku || "") === String(item.variantSku || ""),
  );

  return getNumericValue(
    item.stock,
    item.availableStock,
    item.inventory,
    item.variant?.stock,
    matchingVariant?.stock,
    product.stock,
    product.availableStock,
    product.inventory,
    product.totalStock,
  );
}

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
    id: [productId, variantKey].filter(Boolean).join(":"),
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
    stock,
    stockMessage,
    increaseDisabled: outOfStock || stockLimitReached,
    _raw: item,
  };
}

function cartLineKey(item) {
  const product =
    item.productId && typeof item.productId === "object"
      ? item.productId
      : item.product;
  const productId = getProductId(item.productId || item.product);
  const defaultVariant =
    !item.variantId && !item.variantSku && Array.isArray(product?.variants)
      ? product.variants.find((variant) => variant.isDefault) ||
        product.variants[0]
      : null;
  const variantKey =
    item.variantId ||
    item.variantSku ||
    defaultVariant?._id ||
    defaultVariant?.id ||
    defaultVariant?.sku ||
    "";
  return [productId, variantKey].filter(Boolean).join(":");
}

function mergeDisplayCartItems(items = []) {
  const byKey = new Map();

  items.forEach((item) => {
    const key = cartLineKey(item);
    if (!key) return;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, item);
      return;
    }

    byKey.set(key, {
      ...existing,
      ...item,
      productId:
        typeof existing.productId === "object"
          ? existing.productId
          : item.productId,
      image: existing.image || item.image,
      title: existing.title || item.title,
      quantity: Number(existing.quantity || 0) + Number(item.quantity || 0),
    });
  });

  return [...byKey.values()];
}

function buildSavedProductView(wishlistProduct, resolvedProduct) {
  const product =
    resolvedProduct ||
    (typeof wishlistProduct === "object" ? wishlistProduct : null);
  const id = getProductId(product || wishlistProduct);
  const title = product
    ? getProductTitle(product, "Saved product")
    : "Saved product";
  const image = product ? getProductImage(product) : "";

  return {
    id,
    title,
    image: image || getImageFallbackSrc(title, "saved"),
    price: product?.price ?? product?.sellingPrice ?? product?.salePrice,
    brand:
      product?.brand?.name || product?.brand || product?.seller?.name || "",
    productForCart: product || wishlistProduct,
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

  const sellerGroups = useMemo(() => {
    const groups = new Map();
    items.forEach((item) => {
      const key = item.seller || "other";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    return [...groups.entries()].map(([sellerName, groupItems]) => ({
      sellerName: sellerName === "other" ? null : sellerName,
      items: groupItems,
    }));
  }, [items]);

  const hasCartItems = items.length > 0;
  const hasSavedItems = savedForLaterItems.length > 0 || wishlist.length > 0;
  const selectedItems = items.filter((item) =>
    selectedItemIds.includes(item.id),
  );

  useEffect(() => {
    const currentItemIds = items.map((item) => item.id);
    const currentItemIdsSet = new Set(currentItemIds);

    if (!items.length) {
      setSelectedItemIds([]);
      window.sessionStorage.removeItem(SELECTED_CHECKOUT_STORAGE_KEY);
      window.sessionStorage.removeItem(CHECKOUT_CART_ITEM_IDS_STORAGE_KEY);
      hasInitializedRef.current = false;
      prevItemIdsRef.current = currentItemIdsSet;
      return;
    }

    if (!hasInitializedRef.current) {
      const savedSelectedItemIds = readSelectedCheckoutItemIds();
      const savedCartItemIds = readCheckoutCartItemIds();
      const savedCartItemIdsSet = new Set(savedCartItemIds);
      const newlyAddedItemIds = currentItemIds.filter(
        (id) => !savedCartItemIdsSet.has(id),
      );
      const nextSelectedItemIds =
        savedSelectedItemIds === null
          ? currentItemIds
          : Array.from(
              new Set([
                ...savedSelectedItemIds.filter((id) =>
                  currentItemIdsSet.has(id),
                ),
                ...newlyAddedItemIds,
              ]),
            );

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
        const nextFiltered = current.filter((id) => currentItemIdsSet.has(id));
        // Add any newly added items
        const next = [...nextFiltered, ...newIds];

        // Only update state if selection actually changed
        const isSame =
          next.length === current.length &&
          next.every((id, idx) => id === current[idx]);
        if (!isSame) writeSelectedCheckoutItemIds(next);
        writeCheckoutCartItemIds(currentItemIds);
        return isSame ? current : next;
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
    setSelectedItemIds((current) => {
      const next = selected
        ? Array.from(new Set([...current, id]))
        : current.filter((itemId) => itemId !== id);
      writeSelectedCheckoutItemIds(next);
      return next;
    });
  };

  const handleSelectAll = (selected) => {
    const next = selected ? items.map((item) => item.id) : [];
    writeSelectedCheckoutItemIds(next);
    setSelectedItemIds(next);
  };

  const handleSaveForLater = (id) => {
    const itemToSave = rawItems.find((ci) => cartLineKey(ci) === id);
    const itemView = items.find((item) => item.id === id);

    if (!itemToSave) return;

    const remainingItems = rawItems.filter((ci) => cartLineKey(ci) !== id);
    const savedLine = {
      ...itemToSave,
      title: itemToSave.title || itemView?.title,
      image: itemToSave.image || itemView?.image,
      price: itemToSave.price ?? itemView?.price,
      savedAt: Date.now(),
    };

    persistSavedForLater([
      savedLine,
      ...savedForLaterItems.filter((item) => cartLineKey(item) !== id),
    ]);
    run(
      dispatch,
      updateCart(
        normalizeCartPayloadForWrite({
          items: remainingItems,
          wishlist: cart.wishlist || [],
        }),
      ),
      "Saved for later",
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
    persistSavedForLater(
      savedForLaterItems.filter(
        (item) => cartLineKey(item) !== cartLineKey(savedItem),
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
          <div className="mb-7 flex flex-col gap-4 sm:mb-8 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <nav
                aria-label="Breadcrumb"
                className="mb-4 flex items-center gap-2 text-sm font-medium text-[#2d2d2d] min-[375px]:text-base sm:mb-5 sm:gap-3 sm:text-lg"
              >
                <Link to="/" className="transition hover:text-[#1B1D60]">
                  Home
                </Link>
                <span className="text-[#2d2d2d]">›</span>
                <span className="text-[#CE9F2D]">Cart</span>
              </nav>

              <h1 className="text-2xl font-black leading-tight text-[#3F4095] min-[375px]:text-3xl sm:text-4xl">
                Shopping Cart
              </h1>
            </div>
          </div>

          <ApiState
            loading={cartState.loading && !cart.items}
            error={cartState.error}
            empty={!hasCartItems && !hasSavedItems && !cartState.loading}
            emptyTitle="Your cart is empty"
            emptyText="Add some products to continue shopping."
            emptyActionLabel="Continue Shopping"
            onEmptyAction={() => navigate("/")}
          >
            <div className="grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(360px,563px)] xl:gap-9">
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
                          selected={selectedItemIds.includes(item.id)}
                          onSelect={handleSelectItem}
                          onIncrease={handleIncrease}
                          onDecrease={handleDecrease}
                          onRemove={handleRemove}
                          onSaveForLater={handleSaveForLater}
                          onBuyNow={handleBuyNow}
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
                            className="relative overflow-hidden rounded-[18px] border border-border bg-white px-4 py-4 shadow-[0_12px_32px_rgba(31,36,48,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[0_18px_45px_rgba(31,36,48,0.1)] sm:px-5"
                          >
                            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-gold to-gold-dark" />
                            <div className="flex min-w-0 flex-col gap-4 pl-2 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex min-w-0 items-center gap-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-cream ring-1 ring-border sm:h-20 sm:w-20">
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

                              <div className="flex shrink-0 flex-col items-stretch gap-2 sm:min-w-[150px] sm:items-end">
                                <p className="hidden text-xs font-semibold uppercase text-muted sm:block">
                                  Saved item
                                </p>
                                <BrandButton
                                  variant="secondary"
                                  rounded
                                  size="sm"
                                  label="Move to cart"
                                  className="h-9 w-full border-gold/40 px-4 text-xs font-bold text-ink sm:w-auto"
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
                            className="relative overflow-hidden rounded-[18px] border border-border bg-white px-4 py-4 shadow-[0_12px_32px_rgba(31,36,48,0.06)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[0_18px_45px_rgba(31,36,48,0.1)] sm:px-5"
                          >
                            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-gold to-gold-dark" />
                            <div className="flex min-w-0 flex-col gap-4 pl-2 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex min-w-0 items-center gap-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-cream ring-1 ring-border sm:h-20 sm:w-20">
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

                              <div className="flex shrink-0 flex-col items-stretch gap-2 sm:min-w-[150px] sm:items-end">
                                <p className="hidden text-xs font-semibold uppercase text-muted sm:block">
                                  Saved item
                                </p>
                                <BrandButton
                                  variant="secondary"
                                  rounded
                                  size="sm"
                                  label="Move to cart"
                                  className="h-9 w-full border-gold/40 px-4 text-xs font-bold text-ink sm:w-auto"
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
                  <CartSummary
                    items={selectedItems}
                    shippingLabel="Shipping"
                    shippingLocation=""
                    showInfoIcon={false}
                    protectionText="Purchase protected by"
                    protectionLinkText="Sam Global Money Back Guarantee"
                    protectionLink="/"
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
