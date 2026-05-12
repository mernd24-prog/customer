import { useState } from "react";
import cartItems from "../../data/cartData";
import CartItemCard from "../../components/cart/cartItemCard";
import CartSummary from "../../components/cart/CartSummary";
import AddedToCartModal from "../../components/cart/AddedToCartModal";
import { addedProduct, relatedProducts } from "../../data/modalData";

export default function CartPage() {
    const [items, setItems] = useState(cartItems);
    const [showModal, setShowModal] = useState(true);

    // Increase Quantity
    const increaseQuantity = (id) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        quantity: item.quantity + 1,
                    }
                    : item
            )
        );
    };

    // Decrease Quantity
    const decreaseQuantity = (id) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id && item.quantity > 1
                    ? {
                        ...item,
                        quantity: item.quantity - 1,
                    }
                    : item
            )
        );
    };

    return (
        <>
            <section className="bg-white px-4 py-6 sm:px-6 sm:py-8 lg:px-12 lg:py-10">
                <div className="mx-auto max-w-[1400px]">
                    {/* Heading */}
                    <h1 className="mb-6 text-3xl font-bold sm:mb-6 sm:text-3xl lg:text-4xl">
                        Cart
                    </h1>

                    {/* Layout */}
                    <div className="grid grid-cols-1 items-start gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
                        {/* Cart Items */}
                        <div className="space-y-6">
                            {items.length > 0 ? (
                                items.map((item) => (
                                    <CartItemCard
                                        key={item.id}
                                        item={item}
                                        onIncrease={increaseQuantity}
                                        onDecrease={decreaseQuantity}
                                    />
                                ))
                            ) : (
                                <div className="rounded-2xl border p-10 text-center">
                                    <h2 className="text-xl font-semibold">
                                        Your cart is empty
                                    </h2>

                                    <p className="mt-2 text-gray-500">
                                        Add products to continue shopping.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Summary */}
                        {items.length > 0 && (
                            <div className="self-start">
                                <CartSummary
                                    items={items}
                                    shippingLabel="Shipping to"
                                    shippingLocation="451113"
                                    protectionText="Purchase protected by"
                                    protectionLinkText="Same Global Money Back Guarantee"
                                    protectionLink="/"
                                    buttonText="Proceed to payment"
                                />
                            </div>
                        )}
                    </div>
                </div>


            </section>


            <AddedToCartModal
                open={showModal}
                onClose={() => setShowModal(false)}
                product={addedProduct}
                relatedProducts={relatedProducts}
            />
        </>
    );
}