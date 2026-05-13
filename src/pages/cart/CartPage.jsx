import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import { fetchCart, updateCart } from "../../features/cart/cartSlice";
import { useToastThunk } from "../../hooks/useToastThunk";
import { formatMoney, getProductId } from "../../utils/ecommerce";

function CartItem({ item, cart, dispatch, run }) {
  const product = item.product || {};
  const productId = item.productId || getProductId(product);
  const image = product.images?.[0] || product.imageUrl || product.image;
  const title = product.title || product.name || "Product";
  const price = item.price ?? product.price ?? product.sellingPrice ?? 0;
  const mrp = product.mrp ?? product.originalPrice;
  const quantity = item.quantity || 1;

  const setQuantity = (newQty) => {
    if (newQty < 1) return;
    const items = (cart.items || []).map((ci) =>
      (ci.productId || getProductId(ci.product)) === productId
        ? { ...ci, quantity: newQty }
        : ci,
    );
    run(dispatch, updateCart({ items, wishlist: cart.wishlist || [] }), "Cart updated");
  };

  const remove = () => {
    const items = (cart.items || []).filter(
      (ci) => (ci.productId || getProductId(ci.product)) !== productId,
    );
    run(dispatch, updateCart({ items, wishlist: cart.wishlist || [] }), "Item removed");
  };

  const moveToWishlist = () => {
    const items = (cart.items || []).filter(
      (ci) => (ci.productId || getProductId(ci.product)) !== productId,
    );
    const wishlist = Array.from(new Set([...(cart.wishlist || []), productId]));
    run(dispatch, updateCart({ items, wishlist }), "Moved to wishlist");
  };

  return (
    <div className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
      {/* Image */}
      <Link to={`/products/${productId}`} className="shrink-0">
        <div className="h-24 w-24 overflow-hidden rounded-xl bg-stone-100 sm:h-28 sm:w-28">
          {image ? (
            <img src={image} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-stone-300">
              <ShoppingCart size={28} />
            </div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/products/${productId}`}
            className="line-clamp-2 text-sm font-semibold text-slate-900 hover:underline underline-offset-2 sm:text-base"
          >
            {title}
          </Link>
          <button
            type="button"
            onClick={remove}
            className="shrink-0 rounded p-1 text-slate-400 hover:bg-stone-50 hover:text-red-500 transition"
          >
            <X size={16} />
          </button>
        </div>

        {product.brand && (
          <p className="mt-0.5 text-xs text-slate-500">{product.brand}</p>
        )}

        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-base font-bold text-slate-900 sm:text-lg">
            {formatMoney(price)}
          </span>
          {mrp && mrp > price && (
            <span className="text-xs text-slate-400 line-through">{formatMoney(mrp)}</span>
          )}
        </div>

        {/* Quantity + actions */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-stone-200 px-1">
            <button
              type="button"
              onClick={() => setQuantity(quantity - 1)}
              disabled={quantity <= 1}
              className="rounded p-1.5 text-slate-600 hover:bg-stone-50 disabled:opacity-40 transition"
            >
              <Minus size={14} />
            </button>
            <span className="min-w-[24px] text-center text-sm font-semibold text-slate-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="rounded p-1.5 text-slate-600 hover:bg-stone-50 transition"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={moveToWishlist}
              className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline transition"
            >
              Save for later
            </button>
            <button
              type="button"
              onClick={remove}
              className="flex items-center gap-1 text-xs font-medium text-red-500 underline-offset-2 hover:underline transition"
            >
              <Trash2 size={12} /> Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartSummaryPanel({ cart, items, onCheckout }) {
  const subtotal = items.reduce((acc, item) => {
    const price = item.price ?? item.product?.price ?? item.product?.sellingPrice ?? 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  return (
    <div className="sticky top-5 rounded-2xl bg-stone-50 p-5 sm:p-6">
      <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Order Summary</h2>

      <div className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Items ({items.length})</span>
          <span className="font-medium text-slate-900">{formatMoney(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Shipping</span>
          <span className="font-medium text-emerald-600">Free</span>
        </div>
      </div>

      <div className="my-4 border-t border-stone-200" />

      <div className="flex items-center justify-between text-base font-bold text-slate-900">
        <span>Total</span>
        <span>{formatMoney(subtotal)}</span>
      </div>

      <button
        type="button"
        onClick={onCheckout}
        className="mt-5 w-full rounded-full bg-slate-950 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
      >
        Proceed to Checkout
      </button>

      <p className="mt-4 text-center text-xs leading-5 text-slate-500">
        Purchase protected by{" "}
        <Link to="/" className="font-semibold text-amber-600 hover:underline">
          Sam Global Money Back Guarantee
        </Link>
      </p>
    </div>
  );
}

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const run = useToastThunk();

  const cartState = useSelector((s) => s.cart);
  const cart = cartState.current || {};
  const items = cart.items || [];

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  return (
    <>
      <Seo title="Cart | Sam Global" description="Review items in your cart." />

      <section className="bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-6 text-2xl font-bold text-slate-950 sm:text-3xl">
            Cart {items.length > 0 && <span className="text-lg font-normal text-slate-400">({items.length})</span>}
          </h1>

          <ApiState
            loading={cartState.loading && !cart.items}
            error={cartState.error}
            empty={!items.length && !cartState.loading}
            emptyTitle="Your cart is empty"
            emptyText="Add some products to get started."
            onRetry={() => dispatch(fetchCart())}
          >
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
              {/* Items list */}
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <CartItem
                    key={item.productId || item._id || idx}
                    item={item}
                    cart={cart}
                    dispatch={dispatch}
                    run={run}
                  />
                ))}

                {/* Wishlist items */}
                {(cart.wishlist || []).length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-3 text-sm font-semibold text-slate-700">Saved for later</h3>
                    <div className="space-y-3">
                      {cart.wishlist.map((productId) => (
                        <div key={productId} className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
                          <span className="truncate text-sm text-slate-700">{productId}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newItems = [...(cart.items || []), { productId, quantity: 1 }];
                              const newWishlist = (cart.wishlist || []).filter((id) => id !== productId);
                              run(dispatch, updateCart({ items: newItems, wishlist: newWishlist }), "Moved to cart");
                            }}
                            className="ml-3 shrink-0 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800 transition"
                          >
                            Move to cart
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              <CartSummaryPanel
                cart={cart}
                items={items}
                onCheckout={() => navigate("/checkout")}
              />
            </div>
          </ApiState>
        </div>
      </section>
    </>
  );
}
