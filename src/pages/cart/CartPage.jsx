import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import PageHeader from "../../components/common/PageHeader";
import CartItemCard from "../../components/cart/CartItemCard";
import CartSummary from "../../components/cart/CartSummary";
import BrandButton from "../../components/ui/BrandButton";
import { fetchCart, updateCart } from "../../features/cart/cartSlice";
import { fetchProductById } from "../../features/product/productSlice";
import { useToastThunk } from "../../hooks/useToastThunk";
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

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

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

  const items = useMemo(() => rawItems.map(adaptItemForCard), [rawItems]);
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

  const handleIncrease = (id) => {
    const item = rawItems.find((ci) => cartLineKey(ci) === id);
    if (!item) return;

    const product =
      item?.productId && typeof item.productId === "object"
        ? item.productId
        : item?.product || {};
    const stock = getCartItemStock(item, product);
    const quantity = item?.quantity || 1;

    if (stock !== null && quantity >= stock) {
      return;
    }

    if (quantity >= 5) {
      setShowLimitModal(true);
      return;
    }

    const updated = rawItems.map((ci) =>
      cartLineKey(ci) === id ? { ...ci, quantity: (ci.quantity || 1) + 1 } : ci,
    );

    run(
      dispatch,
      updateCart(
        normalizeCartPayloadForWrite({
          items: updated,
          wishlist: cart.wishlist || [],
        }),
      ),
      "Cart updated",
    );
  };

  const handleDecrease = (id) => {
    const updated = rawItems.map((ci) => {
      if (cartLineKey(ci) !== id) return ci;

      return {
        ...ci,
        quantity: Math.max(1, (ci.quantity || 1) - 1),
      };
    });

    run(
      dispatch,
      updateCart(
        normalizeCartPayloadForWrite({
          items: updated,
          wishlist: cart.wishlist || [],
        }),
      ),
      "Cart updated",
    );
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

      <section className="bg-white px-4 py-4 sm:px-6 sm:py-6 lg:px-12 lg:py-10">
        <div className="mx-auto max-w-[1400px]">
          <PageHeader
            title={`Cart${hasCartItems ? ` (${items.length})` : ""}`}
            className="mb-5 sm:mb-6"
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
            <div className="grid grid-cols-1 items-start gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="min-w-0 space-y-4 sm:space-y-5 lg:space-y-6">
                {items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    selected={selectedItemIds.includes(item.id)}
                    onSelect={handleSelectItem}
                    onIncrease={handleIncrease}
                    onDecrease={handleDecrease}
                    onRemove={handleRemove}
                    onSaveForLater={handleSaveForLater}
                    onBuyNow={handleBuyNow}
                  />
                ))}

                {hasCartItems && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-border bg-white px-4 py-3">
                    <label className="flex items-center gap-2  text-sm font-semibold text-ink">
                      <input
                        type="checkbox"
                        checked={
                          selectedItems.length === items.length &&
                          items.length > 0
                        }
                        onChange={(event) =>
                          handleSelectAll(event.target.checked)
                        }
                        className="h-4 w-4 rounded border-border-strong accent-gold"
                      />
                      Select all
                    </label>
                    <span className=" text-xs text-muted">
                      {selectedItems.length > 0
                        ? `${selectedItems.length} selected for checkout`
                        : "Select all"}
                    </span>
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
                            className="flex min-w-0 flex-col gap-3 rounded-[8px] border border-border bg-cream px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <img
                                src={savedItemView.image}
                                alt={savedItemView.title}
                                className="h-14 w-14 shrink-0 rounded-md object-cover"
                              />

                              <div className="min-w-0">
                                <p className="truncate  text-sm font-semibold text-ink">
                                  {savedItemView.title}
                                </p>

                                <div className="mt-0.5 flex flex-wrap items-center gap-2  text-xs text-muted">
                                  {savedItemView.variantSku ? (
                                    <span>{savedItemView.variantSku}</span>
                                  ) : null}
                                  <span>Qty: {savedItemView.quantity}</span>
                                  <span className="font-semibold text-ink">
                                    ₹
                                    {Number(
                                      savedItemView.price || 0,
                                    ).toLocaleString("en-IN")}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <BrandButton
                              variant="secondary"
                              rounded
                              size="sm"
                              label="Move to cart"
                              className="h-8 w-full shrink-0 px-3 text-xs sm:w-auto"
                              onClick={() =>
                                handleMoveSavedLineToCart(savedItem)
                              }
                            />
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
                            className="flex min-w-0 flex-col gap-3 rounded-[8px] border border-border bg-cream px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <img
                                src={savedProduct.image}
                                alt={savedProduct.title}
                                className="h-14 w-14 shrink-0 rounded-md object-cover"
                              />

                              <div className="min-w-0">
                                <p className="truncate  text-sm font-semibold text-ink">
                                  {savedProduct.title}
                                </p>

                                <div className="mt-0.5 flex flex-wrap items-center gap-2  text-xs text-muted">
                                  {savedProduct.brand ? (
                                    <span>{savedProduct.brand}</span>
                                  ) : null}

                                  {savedProduct.price != null ? (
                                    <span className="font-semibold text-ink">
                                      ₹
                                      {Number(
                                        savedProduct.price,
                                      ).toLocaleString("en-IN")}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>

                            <BrandButton
                              variant="secondary"
                              rounded
                              size="sm"
                              label="Move to cart"
                              className="h-8 w-full shrink-0 px-3 text-xs sm:w-auto"
                              onClick={() =>
                                handleMoveWishlistToCart(savedProduct)
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Link to="/products">
                    <BrandButton
                      variant="secondary"
                      rounded
                      label="Continue Shopping"
                      size="md"
                      className="h-[44px] px-6"
                    />
                  </Link>
                </div>
              </div>

              {hasCartItems && (
                <div className="self-start">
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
          </ApiState>
        </div>
      </section>
    </>
  );
}
