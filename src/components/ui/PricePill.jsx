import Price from "../../modules/products/components/Price";

export default function PricePill({
    price,
    oldPrice,
    currency,
    className = "",
    priceClassName = "",
    oldPriceClassName = "",
}) {
    return (
        <Price
            price={price}
            oldPrice={oldPrice}
            currency={currency}
            layout="pill"
            className={className}
            priceClassName={priceClassName}
            oldPriceClassName={oldPriceClassName}
        />
    );
}
