import Button from "../ui/BrandButton";
import AddedProductCard from "./AddedProductCard";
import ModalOverlay from "./ModalOverlay";
import OfferCard from "./OfferCard";
import RelatedProductCard from "./RelatedProductCard";

export default function AddedToCartModal({
    open,
    onClose,
    product,
    relatedProducts,
}) {
    if (!open) return null;

    return (
        <ModalOverlay onClose={onClose}>
            <div className="grid grid-cols-1 overflow-hidden rounded-2xl bg-white md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
                {/* Left */}
                <div className="border-b p-4 sm:p-5 md:p-6 lg:border-b-0 lg:border-r">
                    {/* Heading */}
                    <h2 className="text-lg font-bold text-[#111] sm:text-xl md:text-2xl">
                        Added to cart
                    </h2>

                    {/* Product */}
                    <div className="mt-4 sm:mt-5">
                        <AddedProductCard
                            image={product.image}
                            title={product.title}
                            itemPrice={product.price}
                            shipping={product.shipping}
                            subtotal={product.total}
                            badgeText={product.badgeText}
                        />
                    </div>

                    {/* Offer */}
                    <div className="mt-4">
                        <OfferCard
                            title="You'll get this offer!"
                            subtitle="Save up to 5%"
                            linkText="Shop now"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="mt-4 space-y-3">
                        {/* See In Cart */}
                        <Button
                            variant="primary"
                            rounded
                            className="w-full px-4 py-2 text-xs font-semibold sm:px-5 sm:py-3 sm:text-sm md:text-base"
                        >
                            See in cart
                        </Button>

                        {/* Checkout */}
                        <Button
                            variant="outline"
                            rounded
                            className="w-full px-4 py-2 text-xs font-semibold hover:bg-[#f5f9ff] sm:px-5 sm:py-3 sm:text-sm md:text-base"
                        >
                            Checkout 7 items
                        </Button>
                    </div>
                </div>

                {/* Right */}
                <div className="p-4 sm:p-5 md:p-6">
                    {/* Heading */}
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-bold text-[#111] sm:text-lg md:text-xl">
                            Explore related items
                        </h3>

                        <button className="text-xs font-semibold underline sm:text-sm">
                            See all
                        </button>
                    </div>

                    {/* Products */}
                    <div className="mt-4 flex flex-wrap justify-between gap-y-5 sm:mt-5">
                        {relatedProducts.map((item) => (
                            <RelatedProductCard
                                key={item.id}
                                image={item.image}
                                title={item.title}
                                price={item.price}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </ModalOverlay>
    );
}