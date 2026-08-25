import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight, ShoppingBag, X } from "lucide-react";
import ModalOverlay from "../../../components/ui/overlay/BaseModal";
import {
  applyImageFallback,
  formatMoney,
  getImageFallbackSrc,
  getProductId,
  getProductImage,
  getProductPublicPath,
  getProductTitle,
} from "../../../utils/ecommerce";

function getCartLineDisplayPrice(item, product) {
  if (typeof item?.salePrice === "number" && item.salePrice > 0) {
    return item.salePrice;
  }
  if (typeof item?.price === "number" && item.price > 0) {
    return item.price;
  }

  const variantId = item?.variantId || item?.variantSku;
  if (variantId && product?.variants?.length) {
    const variant = product.variants.find(
      (v) => v._id === variantId || v.id === variantId || v.sku === variantId,
    );
    if (variant) {
      const vSalePrice = variant.salePrice ?? variant.sale_price;
      if (typeof vSalePrice === "number" && vSalePrice > 0) return vSalePrice;
      const vPrice = variant.price ?? variant.sellingPrice;
      if (typeof vPrice === "number" && vPrice > 0) return vPrice;
    }
  }

  if (typeof product?.salePrice === "number" && product.salePrice > 0) {
    return product.salePrice;
  }
  return product?.price || 0;
}

function CartLine({ item, onClose }) {
  const productEntities = useSelector((state) => state.product?.entities) || {};

  const product =
    item?.productId && typeof item.productId === "object"
      ? item.productId
      : item?.product ||
        (typeof item?.productId === "string"
          ? productEntities[item.productId]
          : null) ||
        {};
  const baseTitle = getProductTitle(product, item?.title || "Product");
  const title =
    item?.variantTitle &&
    item.variantTitle !== "Default Title" &&
    item.variantTitle !== baseTitle
      ? `${baseTitle} - ${item.variantTitle}`
      : baseTitle;

  let image =
    getProductImage(product) ||
    item?.image ||
    item?.imageUrl ||
    item?.thumbnail ||
    getProductImage(item);
  const variantId = item?.variantId || item?.variantSku;
  if (variantId && product?.variants?.length) {
    const variant = product.variants.find(
      (v) => v._id === variantId || v.id === variantId || v.sku === variantId,
    );
    if (
      variant &&
      (variant.images?.length > 0 || variant.image || variant.imageUrl)
    ) {
      image =
        getProductImage({ ...product, selectedVariant: variant }) || image;
    }
  }

  const displayImage = image || getImageFallbackSrc(title, "cart");

  const quantity = item?.quantity || 1;
  const unitPrice = getCartLineDisplayPrice(item, product);

  return (
    <Link
      to={getProductPublicPath(product || item)}
      onClick={onClose}
      className="group flex items-center gap-3 rounded-xl border border-[var(--customer-border)] bg-white p-2.5 transition-all duration-300 "
      aria-label={`View ${title}`}
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[var(--customer-cream)] ring-1 ring-black/5">
        <img
          loading="lazy"
          width="400"
          height="400"
          src={displayImage}
          alt={title}
          className="h-full w-full object-contain"
          onError={(e) => applyImageFallback(e, title, "cart")}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-semibold text-[var(--customer-ink)]">
          {title}
        </p>
        <p className="mt-1  text-xs text-[var(--customer-muted)]">
          Qty {quantity} • {formatMoney(unitPrice, product?.currency || "INR")}
        </p>
      </div>
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold text-[var(--customer-gold-dark)] transition-all group-hover:gap-2 group-hover:bg-[var(--customer-gold-soft)]">
        View <ArrowRight size={12} aria-hidden="true" />
      </span>
    </Link>
  );
}

export default function AddedToCartModal({
  open,
  onClose,
  onCheckout,
  addedProduct,
  cartItems = [],
}) {
  if (!open) return null;

  const addedTitle = getProductTitle(addedProduct, "Item");
  const addedImage =
    getProductImage(addedProduct) ||
    addedProduct?.image ||
    addedProduct?.imageUrl ||
    getImageFallbackSrc(addedTitle, "cart");
  const addedProductPath = getProductPublicPath(addedProduct);

  const subtotal = cartItems.reduce((sum, item) => {
    const product = typeof item?.productId === "object" ? item.productId : {};
    const finalPrice = getCartLineDisplayPrice(item, product);
    return sum + finalPrice * (item?.quantity || 1);
  }, 0);

  return (
    <ModalOverlay onClose={onClose} showCloseButton={false}>
      <div className="relative grid max-h-[92vh] w-full grid-cols-1 overflow-y-auto rounded-2xl bg-white shadow-2xl md:max-h-[80vh] md:grid-cols-[minmax(0,1fr)_360px] md:overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[var(--customer-navy)] shadow-sm backdrop-blur transition-all duration-300  hover:bg-[var(--customer-gold-soft)] sm:right-4 sm:top-4"
          aria-label="Close"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <div className="relative overflow-hidden border-b border-[var(--customer-border)] bg-gradient-to-br from-white via-white to-[var(--customer-cream)] p-4  sm:p-7 md:border-b-0 md:border-r">
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-[var(--customer-gold-soft)]/60 blur-3xl" />
          <div className="relative flex items-center gap-3 pr-10">
            <div>
              <h2 className="text-xl font-bold leading-tight text-[var(--customer-navy)] sm:text-2xl">
                Added to Your Cart
              </h2>
              <p className="mt-0.5 text-xs text-[var(--customer-muted)]">
                Your Item Is Ready for Checkout.
              </p>
            </div>
          </div>
          <Link
            to={addedProductPath}
            onClick={onClose}
            className="group relative mt-5 flex items-center gap-4 rounded-2xl border border-white bg-white/80 p-3 shadow-sm backdrop-blur transition-all duration-300  sm:p-4"
            aria-label={`View ${addedTitle}`}
          >
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--customer-cream)] ring-1  ring-black/5 sm:h-24 sm:w-24">
              <img
                loading="lazy"
                width="400"
                height="400"
                src={addedImage}
                alt={addedTitle}
                className="h-full  w-full object-contain"
                onError={(e) => applyImageFallback(e, addedTitle, "cart")}
              />
            </div>
            <div className="min-w-0">
              <p className="line-clamp-2  text-sm font-bold leading-5 text-[var(--customer-ink)] sm:text-base">
                {addedTitle}
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--customer-cream)] px-2.5 py-1 text-xs font-medium text-[var(--customer-muted)]">
                <ShoppingBag size={13} aria-hidden="true" />
                Cart Now Has {cartItems.length}{" "}
                {cartItems.length === 1 ? "item" : "items"}
              </p>
            </div>
          </Link>
          <div className="relative mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              to="/cart"
              onClick={onClose}
              className="button border border-gold w-full py-2 rounded-lg text-center shadow-sm transition-transform hover:-translate-y-0.5"
            >
              View Cart
            </Link>
            <button
              type="button"
              onClick={() => {
                onClose?.();
                onCheckout?.(cartItems);
              }}
              className="button secondary border py-2 rounded-lg border-gold w-full text-center transition-transform hover:-translate-y-0.5"
            >
              Checkout
            </button>
          </div>
        </div>

        <div className="flex flex-col bg-[#fcfcfb] p-4 sm:p-5 md:max-h-[80vh]">
          <div className="mb-4 flex min-h-9 items-center justify-between gap-3 md:pr-14">
            <div>
              <h3 className="mt-0.5 text-base font-bold text-[var(--customer-ink)]">
                Cart Items
              </h3>
            </div>
            <span className="shrink-0 whitespace-nowrap text-right text-sm font-bold text-[var(--customer-navy)]">
              {formatMoney(subtotal, "INR")}
            </span>
          </div>
          <div className="space-y-2.5 max-h-[20rem] overflow-y-auto pr-1 hide-scrollbar">
            {cartItems.map((item, index) => (
              <CartLine
                key={`${getProductId(item?.productId || item?.product || item)}-${index}`}
                item={item}
                onClose={onClose}
              />
            ))}
            {cartItems.length === 0 && (
              <div className="rounded-xl border border-dashed border-[var(--customer-border)] bg-white p-6 text-center">
                <ShoppingBag
                  className="mx-auto mb-2 text-[var(--customer-muted)]"
                  size={24}
                  aria-hidden="true"
                />
                <p className="text-xs text-[var(--customer-muted)]">
                  No Items in Cart Yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}
