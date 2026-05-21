/**
 * static.jsx — Pre-configured GlobalCard wrappers
 *
 * These are ready-to-use card components that map directly to
 * the 5 design layouts. Import and use them anywhere in your app.
 * All GlobalCard props are forwarded, so you can still override anything.
 */
import React from "react";
import GlobalCard from "./GlobalCard";

// 1. Standard ecommerce product card with wishlist + add to cart
export const ProductCard = (props) => (
  <GlobalCard
    layout="product"
    variant="default"
    hoverEffect="lift"
    showWishlist
    showAddToCart
    {...props}
  />
);

// 2. Category card with price on the right (gray background)
export const CategoryPriceCard = (props) => (
  <GlobalCard
    layout="category-price"
    variant="gray"
    hoverEffect="shadow"
    {...props}
  />
);

// 3. Two-image deal/editorial card with badge and subtitle
export const DealGridCard = (props) => (
  <GlobalCard
    layout="two-grid"
    variant="default"
    hoverEffect="none"
    {...props}
  />
);

// 4. Four-image 2x2 grid category card
export const FourGridCard = (props) => (
  <GlobalCard
    layout="four-grid"
    variant="gray"
    hoverEffect="shadow"
    {...props}
  />
);

// 5. Single image, golden border, centered category label
export const CategoryCard = (props) => (
  <GlobalCard
    layout="category-centered"
    variant="bordered"
    hoverEffect="lift"
    {...props}
  />
);
