import ProductsForYouCard from "../ui/ProductsForYouCard";
import productsForYou from "../../data/productsForYou";

export default function HomeProductsForYouSection({ loading = false }) {
    const list = loading ? Array.from({ length: 12 }) : productsForYou;

    return (
        <section className="mt-8 rounded-[10px]  bg-[#F7F6F500] p-5 sm:p-4 lg:p-6">
            <h2 className="text-center font-montserrat text-[16px] font-semibold text-[#2E2E2E] sm:text-[18px]">
                Products For You
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:gap-4  md:grid-cols-3 lg:grid-cols-4">
                {loading
                    ? list.map((_, index) => (
                        <ProductsForYouCard key={`skeleton-${index}`} loading />
                    ))
                    : list.map((item) => (
                        <ProductsForYouCard key={item.id} {...item} variant="list"   link={`/product/${item.id}`}/>
                    ))}
            </div>
        </section>
    );
}
