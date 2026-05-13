import { Link } from "react-router-dom";
import ModalOverlay from "./ModalOverlay";
import {
  formatMoney,
  getProductId,
  getProductImage,
  getProductTitle,
} from "../../utils/ecommerce";

function CartLine({ item }) {
  const product = item?.productId && typeof item.productId === "object" ? item.productId : item?.product || {};
  const id = getProductId(product) || item?.productId || item?._id;
  const title = getProductTitle(product, "Product");
  const image = getProductImage(product);
  const quantity = item?.quantity || 1;
  const price = item?.price ?? product?.price ?? 0;

  return (
    <div className="flex items-center gap-3 rounded-[10px] border border-[#e7dfd1] p-2">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[8px] bg-[#FAF6EE]">
        {image ? <img src={image} alt={title} className="h-full w-full object-cover" /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 font-montserrat text-xs font-semibold text-[#2E2E2E]">{title}</p>
        <p className="font-montserrat text-xs text-[#787878]">
          Qty {quantity} • {formatMoney(price, product?.currency || "INR")}
        </p>
      </div>
      <Link to={`/products/${id}`} className="font-montserrat text-[11px] font-semibold text-[#CE9F2D]">
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
    <ModalOverlay onClose={onClose}>
      <div className="grid max-h-[80vh] grid-cols-1 overflow-hidden rounded-2xl bg-white md:grid-cols-[minmax(0,1fr)_360px]">
        <div className="border-b p-5 md:border-b-0 md:border-r">
          <h2 className="font-montserrat text-xl font-bold text-[#2E2E2E]">Added to cart</h2>
          <div className="mt-4 flex items-center gap-3 rounded-[10px] bg-[#FAF6EE] p-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[8px] bg-white">
              {addedImage ? <img src={addedImage} alt={addedTitle} className="h-full w-full object-cover" /> : null}
            </div>
            <div>
              <p className="line-clamp-2 font-montserrat text-sm font-semibold text-[#2E2E2E]">{addedTitle}</p>
              <p className="mt-1 font-montserrat text-xs text-[#787878]">
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

        <div className="flex max-h-[80vh] flex-col p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-montserrat text-sm font-bold text-[#2E2E2E]">Cart Items</h3>
            <span className="font-montserrat text-xs text-[#787878]">{formatMoney(subtotal, "INR")}</span>
          </div>
          <div className="space-y-2 overflow-y-auto pr-1">
            {cartItems.map((item, index) => (
              <CartLine key={`${getProductId(item?.productId || item?.product || item)}-${index}`} item={item} />
            ))}
            {cartItems.length === 0 && (
              <p className="font-montserrat text-xs text-[#787878]">No items in cart yet.</p>
            )}
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}

