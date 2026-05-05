/**
 * skeletonPresets - Predefined layout configurations for common e-commerce UI components.
 * These can be passed directly to the 'layout' prop of SkeletonLoader.
 */

export const SKELETON_PRESETS = {
  // 1. Product Card (Vertical)
  PRODUCT_CARD: [
    { type: "box", height: "200px", rounded: "rounded-lg", className: "mb-4" }, // Image
    { type: "box", width: "80%", height: "16px", className: "mb-2" }, // Title
    { type: "box", width: "40%", height: "14px", className: "mb-4" }, // Category
    {
      type: "row",
      className: "justify-between",
      children: [
        { type: "box", width: "60px", height: "20px" }, // Price
        { type: "box", width: "32px", height: "32px", variant: "circle" }, // Cart Icon
      ],
    },
  ],

  // 2. Table Row (e.g., for Orders or Admin panels)
  TABLE_ROW: [
    {
      type: "row",
      className: "border-b border-gray-100 py-4",
      children: [
        { type: "box", width: "50px", height: "14px" }, // ID
        { type: "box", width: "150px", height: "14px" }, // Customer Name
        { type: "box", width: "100px", height: "14px" }, // Date
        { type: "box", width: "80px", height: "24px", rounded: "rounded-full" }, // Status Badge
        { type: "box", width: "60px", height: "14px" }, // Total
        { type: "box", width: "40px", height: "24px" }, // Action
      ],
    },
  ],

  // 3. Admin Dashboard Stats Card
  STATS_CARD: [
    {
      type: "row",
      className: "items-start",
      children: [
        { type: "box", width: "48px", height: "48px", rounded: "rounded-lg" }, // Icon box
        {
          type: "col",
          className: "flex-1",
          children: [
            { type: "box", width: "60%", height: "12px" }, // Label
            { type: "box", width: "40%", height: "24px", className: "mt-2" }, // Value
          ],
        },
      ],
    },
  ],

  // 4. User Profile Screen
  PROFILE: [
    {
      type: "col",
      className: "items-center py-8",
      children: [
        { type: "box", width: "120px", height: "120px", variant: "circle" }, // Avatar
        { type: "box", width: "180px", height: "24px", className: "mt-6" }, // Name
        { type: "box", width: "120px", height: "16px", className: "mt-2" }, // Subtitle
      ],
    },
    {
      type: "grid",
      className: "grid-cols-1 md:grid-cols-2 gap-6 mt-8",
      children: [
        { type: "box", height: "48px", count: 6 }, // Form input fields
      ],
    },
  ],

  // 5. Sidebar Menu
  SIDEBAR: [
    { type: "box", width: "80%", height: "32px", className: "mb-10 mx-auto" }, // Logo
    {
      type: "col",
      gap: " gap-6",
      children: [
        {
          type: "row",
          children: [
            { type: "box", width: "24px", height: "24px", rounded: "rounded-sm" }, // Icon
            { type: "box", width: "100px", height: "14px" }, // Label
          ],
          count: 8,
        },
      ],
    },
  ],

  // 6. Analytics Chart Widget
  CHART_WIDGET: [
    {
      type: "row",
      className: "justify-between mb-6",
      children: [
        { type: "box", width: "140px", height: "20px" }, // Title
        { type: "box", width: "80px", height: "32px" }, // Filter dropdown
      ],
    },
    { type: "box", height: "300px", rounded: "rounded-xl" }, // Chart area
  ],

  // 7. Navbar
  NAVBAR: [
    {
      type: "row",
      className: "justify-between px-6 h-16 items-center border-b border-gray-100",
      children: [
        { type: "box", width: "120px", height: "24px" }, // Logo
        {
          type: "row",
          className: "hidden md:flex gap-8",
          children: [{ type: "box", width: "60px", height: "14px", count: 4 }], // Links
        },
        {
          type: "row",
          className: "gap-4",
          children: [
            { type: "box", width: "32px", height: "32px", variant: "circle" }, // Icon
            { type: "box", width: "32px", height: "32px", variant: "circle" }, // Avatar
          ],
        },
      ],
    },
  ],

  // 8. Order Detail Card
  ORDER_DETAIL: [
    {
      type: "row",
      className: "border p-4 rounded-lg items-center",
      children: [
        { type: "box", width: "80px", height: "80px", rounded: "rounded-md" }, // Product img
        {
          type: "col",
          className: "flex-1 ml-4",
          children: [
            { type: "box", width: "70%", height: "16px" }, // Name
            { type: "box", width: "30%", height: "14px", className: "mt-2" }, // Qty/Price
          ],
        },
        { type: "box", width: "100px", height: "14px" }, // Date
      ],
    },
  ],

  // 9. Footer Links Section
  FOOTER_LINKS: [
    {
      type: "col",
      children: [
        { type: "box", width: "60%", height: "20px", className: "mb-4" }, // Title
        {
          type: "col",
          className: "space-y-3",
          children: [{ type: "box", width: "80%", height: "12px", count: 4 }], // Links
        },
      ],
    },
  ],

  // 10. Footer Action Links Section
  FOOTER_ACTIONS: [
    {
      type: "row",
      className: "items-center gap-4 py-2",
      children: [
        { type: "box", width: "36px", height: "36px", variant: "circle" }, // Icon
        { type: "box", width: "100px", height: "16px" }, // Label
      ],
    },
  ],

  // 11. Social Icons
  SOCIAL_ICONS: [
    { type: "box", width: "40px", height: "40px", variant: "circle", count: 3 },
  ],
};
