export const topNavLinks = [
  { cmsKey: "deals", name: "Deals", path: "/deals" },
  { cmsKey: "brand-outlet", name: "Brand Outlet", path: "/brand-outlet" },
  { cmsKey: "gift-cards", name: "Gift Card", path: "/gift-cards" },
  { cmsKey: "help-contact", name: "Help & Contact", path: "/help-contact" },
];

export const sellDropdownData = {
  cmsKey: "header-sell-dropdown",
  title: "Start selling in a snap",
  description: "Turn your pre-loved items into extra cash.",
  features: [
    {
      icon: "camera",
      text: "Listing is easy and faster than ever in the app",
    },
    {
      icon: "lock",
      text: "Seller protections and secure payments",
    },
    {
      icon: "truck",
      text: "Easy shipping and local pickup",
    },
  ],
  buttons: [
    {
      label: "List an item",
      path: "/seller/status",
    },
    {
      label: "Download the app",
      path: "/mobile-app",
    },
  ],
};

export const accountMenuItems = [
  {
    cmsKey: "account-profile",
    label: "My Profile",
    path: "/account/profile",
    icon: "user",
  },
  {
    cmsKey: "orders",
    label: "My Orders",
    path: "/orders",
    icon: "shoppingBag",
  },
  {
    cmsKey: "notification-preferences",
    label: "Settings",
    path: "/notification-preferences",
    icon: "settings",
  },
  {
    cmsKey: "login",
    label: "Sign in",
    path: "/login",
    icon: "logOut",
  },
];
