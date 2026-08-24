import { addProductToCartPayload } from "./src/utils/ecommerce/cart.js";

const cart = { items: [], wishlist: [] };
const product = {
  _id: "648b29c693a1f4b89083a213",
  title: "Test Product",
  price: 299,
  mrp: 399
};

const payload = addProductToCartPayload(cart, product, 1);
console.log(JSON.stringify(payload, null, 2));
