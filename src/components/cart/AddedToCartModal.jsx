import { Link } from "react-router-dom";
import ModalOverlay from "./ModalOverlay";
import {
  formatMoney,
  getProductId,
  getProductImage,
  getProductTitle,
} from "../../utils/ecommerce";

function CartLine({ item, onClose }) {
  const product = item?.productId && typeof item.productId === "object" ? item.productId : item?.product || {};
  const id = getProductId(product) || item?.productId || item?._id;
  const title = getProductTitle(product, "Product");
  const image = getProductImage(product);
  const quantity = item?.quantity || 1;
  const price = item?.price ?? product?.price ?? 0;

  return (
    <div className="flex items-center gap-3 rounded-[var(--customer-radius)] border border-[var(--customer-border)] p-2">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[var(--customer-radius-sm)] bg-[var(--customer-cream)]">
        {image ? <img src={image} alt={title} className="h-full w-full object-cover" /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1  text-xs font-semibold text-[var(--customer-ink)]">{title}</p>
        <p className=" text-xs text-[var(--customer-muted)]">
          Qty {quantity} • {formatMoney(price, product?.currency || "INR")}
        </p>
      </div>
      <Link
        to={`/products/${id}`}
        onClick={onClose}
        className=" text-[11px] font-semibold text-[var(--customer-gold-dark)] underline-offset-2 hover:underline"
      >
        View
      </Link>
    </div>
  );
}

export default function AddedToCartModal({
  open,
  onClose,
  addedProduct,
  cartItems = [],
}) {
  if (!open) return null;

  const addedTitle = getProductTitle(addedProduct, "Item");
  const addedImage = getProductImage(addedProduct);
  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum + (item?.price ?? (typeof item?.productId === "object" ? item.productId?.price : 0) ?? 0) * (item?.quantity || 1),
    0,
  );

  return (
    <ModalOverlay onClose={onClose} showCloseButton={false}>
      <div className="grid max-h-[90vh] grid-cols-1 overflow-y-auto rounded-[var(--customer-radius)] bg-white md:max-h-[80vh] md:grid-cols-[minmax(0,1fr)_360px] md:overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--customer-border)] bg-[var(--customer-cream)] text-lg font-bold leading-none text-[var(--customer-navy)] transition-all duration-300 ease-in-out hover:bg-[var(--customer-gold-soft)]"
          aria-label="Close"
        >
          ×
        </button>
 
        <div className="border-b border-[var(--customer-border)] p-5 md:border-b-0 md:border-r">
          <h2 className=" text-xl font-bold text-[var(--customer-navy)]">Added to cart</h2>
          <div className="mt-4 flex items-center gap-3 rounded-[var(--customer-radius)] bg-[var(--customer-cream)] p-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[var(--customer-radius-sm)] bg-white">
              {addedImage ? <img src={addedImage} alt={addedTitle} className="h-full w-full object-cover" /> : null}
            </div>
            <div>
              <p className="line-clamp-2  text-sm font-semibold text-[var(--customer-ink)]">{addedTitle}</p>
              <p className="mt-1  text-xs text-[var(--customer-muted)]">
                Cart now has {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link to="/cart" onClick={onClose} className="button w-full text-center">
              View Cart
            </Link>
            <Link to="/checkout" onClick={onClose} className="button secondary w-full text-center">
              Checkout
            </Link>
          </div>
        </div>
 
        <div className="flex flex-col p-5 md:max-h-[80vh]">
          <div className="mb-3 flex items-center justify-between gap-4 pr-11">
            <h3 className=" text-sm font-bold text-[var(--customer-ink)]">Cart Items</h3>
            <span className="shrink-0  text-xs text-[var(--customer-muted)]">{formatMoney(subtotal, "INR")}</span>
          </div>
          <div className="space-y-2 overflow-y-auto pr-1">
            {cartItems.map((item, index) => (
              <CartLine
                key={`${getProductId(item?.productId || item?.product || item)}-${index}`}
                item={item}
                onClose={onClose}
              />
            ))}
            {cartItems.length === 0 && (
              <p className=" text-xs text-[var(--customer-muted)]">No items in cart yet.</p>
            )}
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}
