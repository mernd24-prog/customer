/**
 * constants.js
 * All shared constants, config defaults, and icon maps for the Header.
 */
import {
  Bell,
  Camera,
  Lock,
  LogOut,
  Settings,
  ShoppingBag,
  Store,
  Truck,
  User,
  LifeBuoy,
  RefreshCcw,
} from "lucide-react";

export const CATEGORY_MENU_OPEN_DELAY_MS = 350;
export const CATEGORY_MENU_CLOSE_DELAY_MS = 160;
export const HEADER_HEIGHT_VAR = "--customer-header-height";

export const dropdownIconMap = {
  bell: Bell,
  camera: Camera,
  lock: Lock,
  logOut: LogOut,
  settings: Settings,
  shoppingBag: ShoppingBag,
  store: Store,
  truck: Truck,
  user: User,
  lifeBuoy: LifeBuoy,
  refreshCcw: RefreshCcw,
};

export const navbarIconLabels = {
  IN: "Deliver to address",
  Word: "Language and region",
  Account: "Account",
  Cart: "Cart",
};

export const baseAccountMenuItems = [
  { label: "My Profile", path: "/account/profile", icon: "user" },
  { label: "My Orders", path: "/orders", icon: "shoppingBag" },
  { label: "Returns & Refunds", path: "/returns-refunds", icon: "refreshCcw" },
  { label: "Wallet", path: "/wallet", icon: "lock" },
  { label: "Notifications", path: "/notifications", icon: "bell" },
  { label: "Settings", path: "/notification-preferences", icon: "settings" },
];

export const DEFAULT_TOP_NAV_LINKS = [
  // { name: "Deals", path: "/deals" },
  { name: "Shop by Brand", path: "/brand-outlet" },
];

export const DEFAULT_SELL_DROPDOWN = {
  title: "Start selling in a snap",
  description: "Turn your pre-loved items into extra cash.",
  features: [
    { icon: "camera", text: "Listing is easy and faster than ever in the app" },
    { icon: "lock", text: "Seller protections and secure payments" },
    { icon: "truck", text: "Easy shipping and local pickup" },
  ],
  buttons: [
    { label: "List an item", path: "/products" },
    { label: "Download the app", path: "/mobile-app" },
  ],
};

export const DEFAULT_FASHION_MENU = { leftSections: [], promo: null };
