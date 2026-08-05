/**
 * skeletonPresets - Predefined layout configurations for common e-commerce UI components.
 * These can be passed directly to the 'layout' prop of SkeletonLoader.
 */

export const SKELETON_PRESETS = {
  // 1. Product Card (Vertical)
  PRODUCT_CARD: [
    {
      type: "col",
      className: "relative flex flex-col h-[525px] overflow-hidden rounded-[20px] border border-[#CE9F2D80]/50 bg-white",
      children: [
        {
          type: "row",
          className: "absolute left-4 top-4 z-20 gap-2 w-[calc(100%-2rem)]",
          children: [
            { type: "box", width: "72px", height: "24px", rounded: "rounded-[50px]", className: "sm:h-[28px] sm:w-[84px]" },
            { type: "box", width: "100px", height: "24px", rounded: "rounded-[50px]", className: "sm:h-[28px]" },
          ],
        },
        { type: "box", height: "260px", width: "100%", className: "rounded-t-[20px] shrink-0" },
        {
          type: "col",
          className: "px-4 pb-4 pt-4 lg:pt-6 flex-1 min-w-0",
          children: [
            { type: "box", width: "90px", height: "16px", className: "mb-2" },
            { type: "box", width: "100%", height: "20px" },
            {
              type: "row",
              className: "gap-3 my-2 lg:my-4 items-center",
              children: [
                { type: "box", width: "70px", height: "24px" },
                { type: "box", width: "50px", height: "20px" },
              ],
            },
          ],
        },
        {
          type: "row",
          className: "px-4 pb-4 gap-8 mt-auto shrink-0",
          children: [
            { type: "box", height: "44px", rounded: "rounded-[30px]", className: "flex-1" },
            { type: "box", width: "44px", height: "44px", variant: "circle" },
          ],
        },
      ],
    },
  ],

  PRODUCTS_FOR_YOU_CARD: [
    {
      type: "box",
      height: "auto",
      rounded: "rounded-[8px]",
      className: "aspect-[1/1.15] w-full",
    },
    {
      type: "col",
      className: "mt-2 gap-1",
      children: [
        { type: "box", width: "48px", height: "12px" },
        { type: "box", width: "80%", height: "12px" },
        { type: "box", width: "75%", height: "12px" },
        {
          type: "box",
          width: "100%",
          height: "34px",
          rounded: "rounded-full",
          className: "mt-2 max-w-[160px]",
        },
      ],
    },
  ],

  PRODUCTS_FOR_YOU_LIST_CARD: [
    {
      type: "box",
      height: "auto",
      rounded: "rounded-[8px]",
      className: "aspect-[302/300] w-full",
    },
    {
      type: "row",
      className: "mt-3 justify-between border-b border-border pb-2",
      children: [
        { type: "box", width: "112px", height: "12px" },
        { type: "box", width: "72px", height: "12px" },
      ],
    },
    { type: "box", width: "80%", height: "14px", className: "mt-3" },
    { type: "box", width: "128px", height: "18px", className: "mt-3" },
  ],

  CATEGORY_CARD: [
    {
      type: "box",
      height: "256px",
      rounded: "rounded-lg",
      className: "w-full",
    },
    { type: "box", width: "75%", height: "18px", className: "mx-auto mt-3" },
  ],

  TOP_DEAL_CARD: [
    {
      type: "box",
      height: "auto",
      rounded: "rounded-[10px]",
      className: "aspect-[292/310] w-full",
    },
    {
      type: "row",
      className:
        "mt-4 min-h-[38px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
      children: [
        { type: "box", width: "50%", height: "16px" },
        {
          type: "box",
          width: "138px",
          height: "34px",
          rounded: "rounded-full",
        },
      ],
    },
  ],

  NEW_ARRIVAL_CARD: [
    {
      type: "col",
      className: "flex flex-col h-[510px] overflow-hidden rounded-[20px] border border-[#1B1D6066] bg-white shadow-sm",
      children: [
        {
          type: "col",
          className: "bg-[#1B1D60] p-5 h-[100px] shrink-0",
          children: [
             { type: "row", className: "justify-end w-full mb-3", children: [{ type: "box", width: "80px", height: "24px", className: "!bg-white/20" }] },
             { type: "box", width: "80%", height: "24px", className: "!bg-white/20 mt-1" }
          ]
        },
        {
          type: "col",
          className: "flex-col divide-y divide-[#1B1D6066] bg-white flex-1",
          children: [
             {
                type: "row",
                className: "p-6 items-center gap-4 pl-4 h-[135px]",
                children: [
                   { type: "box", width: "90px", height: "90px", rounded: "rounded-[10px]" },
                   {
                      type: "col",
                      className: "flex-1",
                      children: [
                         { type: "box", width: "95%", height: "18px", className: "mb-4" },
                         { type: "row", className: "gap-2 mb-3 items-end", children: [ { type: "box", width: "70px", height: "22px"}, { type: "box", width: "60px", height: "18px"} ] },
                         { type: "box", width: "110px", height: "14px", className: "mt-1" }
                      ]
                   }
                ]
             },
             {
                type: "row",
                className: "p-6 items-center gap-4 pl-4 h-[135px]",
                children: [
                   { type: "box", width: "90px", height: "90px", rounded: "rounded-[10px]" },
                   {
                      type: "col",
                      className: "flex-1",
                      children: [
                         { type: "box", width: "90%", height: "18px", className: "mb-4" },
                         { type: "row", className: "gap-2 mb-3 items-end", children: [ { type: "box", width: "65px", height: "22px"}, { type: "box", width: "55px", height: "18px"} ] },
                         { type: "box", width: "100px", height: "14px", className: "mt-1" }
                      ]
                   }
                ]
             },
             {
                type: "row",
                className: "p-6 items-center gap-4 pl-4 h-[135px]",
                children: [
                   { type: "box", width: "90px", height: "90px", rounded: "rounded-[10px]" },
                   {
                      type: "col",
                      className: "flex-1",
                      children: [
                         { type: "box", width: "85%", height: "18px", className: "mb-4" },
                         { type: "row", className: "gap-2 mb-3 items-end", children: [ { type: "box", width: "75px", height: "22px"}, { type: "box", width: "65px", height: "18px"} ] },
                         { type: "box", width: "95px", height: "14px", className: "mt-1" }
                      ]
                   }
                ]
             }
          ]
        }
      ]
    }
  ],

  API_GRID_CARD: [
    {
      type: "box",
      height: "180px",
      rounded: "rounded-lg",
      className: "w-full",
    },
    { type: "box", width: "80%", height: "16px", className: "mt-4" },
    { type: "box", width: "55%", height: "14px", className: "mt-2" },
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
            {
              type: "box",
              width: "24px",
              height: "24px",
              rounded: "rounded-sm",
            }, // Icon
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
      className:
        "justify-between px-6 h-16 items-center border-b border-gray-100",
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

  // Checkout/Cart Order Summary 
  ORDER_SUMMARY: [
    { type: "box", width: "60%", height: "28px", className: "rounded-md mb-2" },
    { type: "box", width: "100%", height: "24px", className: "rounded-md" },
    { type: "box", width: "100%", height: "24px", className: "rounded-md" },
    { type: "box", width: "100%", height: "24px", className: "rounded-md" },
    { type: "box", width: "100%", height: "1px", className: "bg-[#EFE5D2] my-2" },
    { type: "row", className: "justify-between", children: [
        { type: "box", width: "40%", height: "28px", className: "rounded-md" },
        { type: "box", width: "30%", height: "28px", className: "rounded-md" },
    ]},
    { type: "box", width: "100%", height: "48px", className: "rounded-[12px] mt-4" },
  ],

  // 11. Social Icons
  SOCIAL_ICONS: [
    { type: "box", width: "40px", height: "40px", variant: "circle", count: 3 },
  ],

  // 12. Hero/Banner Cards
  HERO_CARDS: [
    {
      type: "col",
      className: "relative h-[250px] overflow-hidden rounded-[var(--customer-radius)]",
      children: [
        { type: "box", height: "100%", width: "100%" }, // Image area
        {
          type: "box",
          width: "70%",
          height: "24px",
          className: "absolute bottom-6 left-6",
        }, // Title overlay
      ],
    },
  ],

  // 13. Brand Logo (for horizontal scrolling/swiper)
  BRAND_LOGO: [
    {
      type: "box",
      width: "250px",
      height: "80px",
      className: "md:w-32 md:h-12 lg:w-40 lg:h-18",
      rounded: "rounded-md",
    },
  ],

  WHY_CHOOSE_CARD: [
    {
      type: "row",
      className: "items-start p-4",
      children: [
        {
          type: "box",
          width: "40px",
          height: "40px",
          rounded: "rounded-lg",
          className: "flex-shrink-0",
        },
        {
          type: "col",
          className: "flex-1 ml-4 gap-2",
          children: [
            { type: "box", width: "60%", height: "18px" },
            {
              type: "col",
              className: "gap-1",
              children: [
                { type: "box", width: "90%", height: "12px" },
                { type: "box", width: "75%", height: "12px" },
              ],
            },
          ],
        },
      ],
    },
  ],

  // 14. Our Story Section
  OUR_STORY: [
    {
      type: "grid",
      className: "grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12",
      children: [
        {
          type: "box",
          height: "auto",
          rounded: "rounded-lg",
          className: "aspect-[4/3] w-full max-w-[750px]",
        },
        {
          type: "col",
          className: "justify-center gap-6",
          children: [
            { type: "box", width: "40%", height: "32px", rounded: "rounded-sm" },
            {
              type: "col",
              className: "gap-3",
              children: [
                { type: "box", width: "100%", height: "16px" },
                { type: "box", width: "100%", height: "16px" },
                { type: "box", width: "90%", height: "16px" },
                {
                  type: "box",
                  width: "100%",
                  height: "16px",
                  className: "mt-4",
                },
                { type: "box", width: "95%", height: "16px" },
                {
                  type: "box",
                  width: "120px",
                  height: "48px",
                  rounded: "rounded-full",
                  className: "mt-6",
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  NOTIFICATIONS_PAGE_SKELETON: [
    {
      type: "col",
      className: "w-full",
      count: 4,
      children: [
        {
          type: "row",
          className: "flex gap-4 border-b border-[#D9DDE8] py-6 sm:gap-5 sm:py-7 lg:gap-6 items-start",
          children: [
            {
              type: "box",
              width: "56px",
              height: "56px",
              variant: "circle",
              className: "shrink-0 border border-gold/40 !bg-transparent",
            },
            {
              type: "col",
              className: "flex-1 min-w-0 pt-1 gap-0",
              children: [
                {
                  type: "row",
                  className: "justify-between gap-4 items-center mb-1.5",
                  children: [
                    {
                      type: "row",
                      className: "gap-2 items-center",
                      children: [
                        { type: "box", width: "8px", height: "8px", variant: "circle" },
                        { type: "box", width: "160px", height: "20px", rounded: "rounded-md" },
                      ]
                    },
                    { type: "box", width: "80px", height: "14px", rounded: "rounded-md", className: "hidden sm:block" }
                  ]
                },
                { type: "box", width: "90%", height: "14px", rounded: "rounded-md", className: "mb-1" },
                { type: "box", width: "70%", height: "14px", rounded: "rounded-md", className: "mb-3" },
                { type: "box", width: "100px", height: "14px", rounded: "rounded-md" }
              ]
            }
          ]
        }
      ]
    }
  ],
};
