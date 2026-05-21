import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import PageHeader from "../../components/common/PageHeader";
import CartItemCard from "../../components/cart/CartItemCard";
import CartSummary from "../../components/cart/CartSummary";
import BrandButton from "../../components/ui/BrandButton";
import { fetchCart, updateCart } from "../../features/cart/cartSlice";
import { useToastThunk } from "../../hooks/useToastThunk";
import {
  getProductId,
  getProductImage,
  getProductTitle,
  addProductToCartPayload,
  normalizeCartPayloadForWrite,
  wishlistPayload,
} from "../../utils/ecommerce";

function adaptItemForCard(item) {
  const product = item.productId || {};
  const productId = item.productId?._id || getProductId(product);
  const variantKey = item.variantId || item.variantSku || "";
  const title = item.title || getProductTitle(product) || "Product";
  const image = item.image || getProductImage(product);
  const price = item.price ?? product.price ?? product.sellingPrice ?? 0;
  const oldPrice = item.oldPrice ?? product.mrp ?? product.originalPrice;
  const shipping = item.shipping ?? 0;
  const quantity = item.quantity || 1;
  const seller = item.seller || product.seller?.name || product.brand;
  const condition = item.condition;
  const attributes = item.attributes || {};
  const color = item.color || item.selectedColor || attributes.color;
  const size = item.size || item.selectedSize || attributes.size;

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
    _raw: item,
  };
}

function cartLineKey(item) {
  const productId = getProductId(item.productId || item.product);
  const variantKey = item.variantId || item.variantSku || "";
  return [productId, variantKey].filter(Boolean).join(":");
}

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const run = useToastThunk();

  const cartState = useSelector((s) => s.cart);
  const cart = cartState.current || {};
  const rawItems = cart.items || [];

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const items = rawItems.map(adaptItemForCard);

  const handleIncrease = (id) => {
    const updated = rawItems.map((ci) => {
      const cid = cartLineKey(ci);
      return cid === id ? { ...ci, quantity: (ci.quantity || 1) + 1 } : ci;
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

  const handleDecrease = (id) => {
    const updated = rawItems.map((ci) => {
      const cid = cartLineKey(ci);
      if (cid !== id) return ci;
      const newQty = Math.max(1, (ci.quantity || 1) - 1);
      return { ...ci, quantity: newQty };
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
    const updated = rawItems.filter((ci) => {
      const cid = cartLineKey(ci);
      return cid !== id;
    });
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

  const handleSaveForLater = (id) => {
    const itemToSave = rawItems.find((ci) => {
      const cid = getProductId(ci.productId || ci.product);
      return cid === id;
    });
    if (!itemToSave) return;

    const remainingItems = rawItems.filter((ci) => {
      const cid = getProductId(ci.productId || ci.product);
      return cid !== id;
    });

    const productToWishlist = itemToSave.productId || itemToSave.product;
    const newWishlistPayload = wishlistPayload(
      { items: remainingItems, wishlist: cart.wishlist || [] },
      productToWishlist,
      false,
    );

    run(dispatch, updateCart(newWishlistPayload), "Saved for later");
  };

  return (
    <>
      <Seo
        title="Cart | Sam Global"
        description="Review items in your shopping cart."
      />

      <section className=" bg-white px-4 py-6 sm:px-6 sm:py-8 lg:px-12 lg:py-10">
        <div className="mx-auto max-w-[1400px]">
          <PageHeader
            title={`Cart${items.length > 0 ? ` (${items.length})` : ""}`}
            className="mb-6"
          />

          <ApiState
            loading={cartState.loading && !cart.items}
            error={cartState.error}
            empty={!items.length && !cartState.loading}
            emptyTitle="Your cart is empty"
            emptyText="Add some products to continue shopping."
            onRetry={() => dispatch(fetchCart())}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
              {/* Items */}
              <div className="space-y-6">
                {items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onIncrease={handleIncrease}
                    onDecrease={handleDecrease}
                    onRemove={handleRemove}
                    onSaveForLater={handleSaveForLater}
                  />
                ))}

                {/* Saved for later (wishlist) */}
                {(cart.wishlist || []).length > 0 && (
                  <div className="panel">
                    <h3 className="mb-4 font-montserrat text-[16px] font-semibold text-[#2E2E2E]">
                      Saved for later ({cart.wishlist.length})
                    </h3>
                    <div className="grid gap-3">
                      {cart.wishlist.map((wishlistProduct) => {
                        const wishlistId = getProductId(wishlistProduct);
                        const wishlistTitle =
                          typeof wishlistProduct === "object"
                            ? getProductTitle(wishlistProduct, wishlistId)
                            : wishlistId;
                        return (
                          <div
                            key={wishlistId}
                            className="flex items-center justify-between gap-3 rounded-[8px] border border-[#e7dfd1] bg-[#FAF6EE] px-4 py-3"
                          >
                            <span className="truncate font-montserrat text-sm text-[#787878]">
                              {wishlistTitle}
                            </span>
                            <BrandButton
                              variant="secondary"
                              rounded
                              size="sm"
                              label="Move to cart"
                              className="shrink-0 h-8 px-3 text-xs"
                              onClick={() => {
                                const payload = addProductToCartPayload(
                                  cart,
                                  wishlistProduct,
                                  1,
                                );
                                const newWishlistPayload = wishlistPayload(
                                  payload,
                                  wishlistProduct,
                                  true,
                                );
                                run(
                                  dispatch,
                                  updateCart(newWishlistPayload),
                                  "Moved to cart",
                                );
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Continue shopping */}
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

              {/* Summary */}
              {items.length > 0 && (
                <div className="self-start">
                  <CartSummary
                    items={items}
                    shippingLabel="Shipping"
                    shippingLocation=""
                    showInfoIcon={false}
                    protectionText="Purchase protected by"
                    protectionLinkText="Sam Global Money Back Guarantee"
                    protectionLink="/"
                    buttonText="Proceed to Checkout"
                    onCheckout={() => navigate("/checkout")}
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
