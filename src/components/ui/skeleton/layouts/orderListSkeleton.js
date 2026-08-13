export const ORDER_LIST_SKELETON = [
  {
    type: "row",
    className: "my-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full",
    children: [
      { type: "box", className: "w-full sm:max-w-[450px] h-12", rounded: "rounded-[10px]" },
      { type: "box", className: "w-full lg:w-[220px] h-12", rounded: "rounded-[10px]" }
    ]
  },
  {
    type: "col",
    className: "w-full gap-4",
    children: [
      {
        type: "col",
        className: "overflow-hidden rounded-xl border border-[#E7D9B8] bg-[#FFFCF6] !gap-0",
        count: 3,
        children: [
          {
            type: "row",
            className: "border-b border-[#E7D9B8] bg-[#CE9F2D33] px-3 py-3 text-sm md:px-4 items-center justify-between min-h-[46px]",
            children: [
              { type: "box", width: "220px", height: "16px", rounded: "rounded-md" },
              { type: "box", width: "160px", height: "22px", rounded: "rounded-full" },
            ]
          },
          {
            type: "grid",
            className: "gap-4 px-4 py-5 md:px-5 sm:grid-cols-[150px_minmax(0,1fr)] items-start",
            children: [
              { type: "box", className: "aspect-square w-full max-w-[150px] shrink-0 border border-[#EFE5D2]", rounded: "rounded-xl" },
              {
                type: "col",
                className: "flex-1 min-w-0 !gap-0 pt-0",
                children: [
                  { type: "box", width: "80%", height: "24px", rounded: "rounded-md", className: "md:h-[28px]" }, // Title
                  { 
                    type: "row", 
                    className: "flex-wrap gap-2 mt-3", // Badges
                    children: [
                      { type: "box", width: "64px", height: "28px", rounded: "rounded-full" },
                      { type: "box", width: "90px", height: "28px", rounded: "rounded-full" }
                    ]
                  },
                  { type: "box", width: "110px", height: "32px", rounded: "rounded-md", className: "mt-4" }, // Price
                  { type: "box", width: "160px", height: "36px", rounded: "rounded-lg", className: "mt-4" } // Button
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

