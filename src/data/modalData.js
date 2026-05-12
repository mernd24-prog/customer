import { productImages } from "../constant/image.constant";

export const addedProduct = {
    image: productImages.homeDecor,
    title: "Apple iPhone 16 Pro Max",
    price: 809.99,
    shipping: 230.06,
    total: 1040.05,
    badgeText : "In 42 Carts"
};

export const relatedProducts = [
    {
        id: 1,
        image: productImages.homeDecor,
        title: "iPhone 16 Pro",
        price: 1073,
    },
    {
        id: 2,
        image: productImages.kidsFashion,
        title: "iPhone 16 Pro Refurbished",
        price: 879,
    },
      {
        id: 3,
        image: productImages.menFashion,
        title: "iPhone 16 Pro Refurbished",
        price: 879,
    },
];


