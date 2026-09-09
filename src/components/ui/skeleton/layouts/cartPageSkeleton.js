import { SKELETON_PRESETS } from "../skeletonPresets";

export const CART_PAGE_SKELETON = [
  {
    type: "row",
    className: "flex flex-col xl:flex-row gap-6 lg:gap-8 xl:gap-11 items-start w-full",
    children: [
      {
        type: "col",
        className: "min-w-0 flex-1 w-full",
        children: [
          {
            type: "row",
            count: 2,
            className: "grid grid-cols-1 sm:grid-cols-[170px_1fr] lg:grid-cols-[190px_1fr] gap-5 sm:gap-6 pb-6 sm:pb-7 mb-6 sm:mb-7 border-b border-[#CE9F2D4D]",
            children: [
              {
                type: "col",
                className: "flex-col items-start sm:items-center gap-3 w-full",
                children: [
                  {
                    type: "box",
                    width: "165px",
                    height: "165px",
                    className: "w-full max-w-full sm:max-w-[165px] rounded-[10px] border border-[#F0E6D2] bg-white flex-1 shrink-0",
                  }
                ]
              },
              {
                type: "col",
                className: "min-w-0 flex-col justify-between py-1",
                children: [
                  {
                    type: "col",
                    className: "w-full",
                    children: [
                      { type: "box", width: "100px", height: "16px", rounded: "rounded-md", className: "mb-3" }, // Stars
                      { type: "box", width: "90%", height: "24px", rounded: "rounded-md", className: "mb-3.5" }, // Title
                      { type: "box", width: "40%", height: "24px", rounded: "rounded-md", className: "mb-1.5" }, // Price
                      { type: "box", width: "30%", height: "16px", rounded: "rounded-md", className: "mb-3" }, // MRP
                    ],
                  },
                  {
                    type: "row",
                    className: "pt-4 gap-6",
                    children: [
                      {
                        type: "box",
                        width: "120px",
                        height: "20px",
                        rounded: "rounded-md",
                      },
                      {
                        type: "box",
                        width: "80px",
                        height: "20px",
                        rounded: "rounded-md",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "col",
        className:
          "w-full md:w-[320px] lg:w-[350px] xl:w-[420px] 2xl:w-[369px] shrink-0 rounded-[15px] border border-[#EFE5D2] p-5 lg:p-7 bg-[#FFF8E7] gap-4",
        children: SKELETON_PRESETS.ORDER_SUMMARY,
      },
    ],
  },
];
