export const ORDER_LIST_SKELETON = [
  {
    type: "row",
    className: "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full",
    children: [
      { type: "box", width: "100%", height: "44px", className: "sm:max-w-[450px]", rounded: "rounded-lg" },
      { type: "box", width: "100%", height: "44px", className: "sm:max-w-[190px]", rounded: "rounded-lg" }
    ]
  },
  {
    type: "col",
    className: "w-full gap-3",
    children: [
      {
        type: "col",
        className: "overflow-hidden rounded-xl border border-[#E4DDCF] bg-white shadow-2xs !gap-0",
        count: 3,
        children: [
          // Desktop Skeleton
          {
            type: "grid",
            className: "hidden sm:grid grid-cols-12 items-start gap-4 p-4",
            children: [
              {
                type: "row",
                className: "col-span-7 flex items-start gap-4",
                children: [
                  { type: "box", width: "80px", height: "80px", className: "shrink-0", rounded: "rounded-lg" },
                  {
                    type: "col",
                    className: "flex-1 min-w-0 !gap-2 pt-1",
                    children: [
                      { type: "box", width: "90%", height: "20px", rounded: "rounded-md" },
                      { type: "box", width: "60%", height: "20px", rounded: "rounded-md" },
                      {
                        type: "row",
                        className: "flex-wrap gap-1.5 mt-1",
                        children: [
                          { type: "box", width: "70px", height: "22px", rounded: "rounded-md" },
                          { type: "box", width: "60px", height: "22px", rounded: "rounded-md" }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                type: "col",
                className: "col-span-2 pt-1",
                children: [
                  { type: "box", width: "80%", height: "28px", rounded: "rounded-md" }
                ]
              },
              {
                type: "row",
                className: "col-span-3 gap-2 pt-1",
                children: [
                  { type: "box", width: "10px", height: "10px", rounded: "rounded-full" },
                  {
                    type: "col",
                    className: "flex-1 !gap-2",
                    children: [
                      { type: "box", width: "100%", height: "20px", rounded: "rounded-md" },
                      { type: "box", width: "80%", height: "16px", rounded: "rounded-md" }
                    ]
                  }
                ]
              }
            ]
          },
          // Mobile Skeleton
          {
            type: "row",
            className: "flex sm:hidden p-3.5 gap-3 items-center",
            children: [
              { type: "box", width: "64px", height: "64px", className: "shrink-0", rounded: "rounded-lg" },
              {
                type: "col",
                className: "flex-1 min-w-0 !gap-2",
                children: [
                  { type: "box", width: "100%", height: "20px", rounded: "rounded-md" },
                  { type: "box", width: "70%", height: "16px", rounded: "rounded-md" },
                  { type: "box", width: "90px", height: "24px", rounded: "rounded-md", className: "mt-1" }
                ]
              },
              {
                type: "col",
                className: "shrink-0 items-end !gap-1.5",
                children: [
                  { type: "box", width: "60px", height: "20px", rounded: "rounded-md" },
                  { type: "box", width: "50px", height: "14px", rounded: "rounded-md" }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

