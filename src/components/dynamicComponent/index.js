/**
 * Global Dynamic Components — Barrel Export
 *
 * Single import point for the entire design system.
 *
 * Usage:
 * import { GlobalCard, ProductCard, DynamicButton, PriceButton } from '../../components/dynamicComponent';
 */

// --- CARDS ---
export { default as GlobalCard } from "./cards/GlobalCard";
export {
  ProductCard,
  CategoryPriceCard,
  DealGridCard,
  FourGridCard,
  CategoryCard,
} from "./cards/static";

// --- BUTTONS ---
export { default as DynamicButton } from "./button/button";
export {
  PrimaryGradientButton,
  RegisterButton,
  RoundIconWithBg,
  ButtonWithIcon,
  PriceButton,
} from "./button/static";
