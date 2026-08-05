import { SKELETON_PRESETS } from "../skeletonPresets";

export const CART_PAGE_SKELETON = [
  {
    type: "row",
    className: "flex flex-col md:flex-row gap-5 sm:gap-6 lg:gap-8 xl:gap-9 items-start",
    children: [
      {
        type: "col",
        className: "min-w-0 flex-1 space-y-5 sm:space-y-6 lg:space-y-8 w-full",
        children: [
          {
            type: "row",
            count: 2,
            className:
              "w-full rounded-[15px] border border-[#EFE5D2] p-4 bg-white flex-col sm:flex-row",
            children: [
              {
                type: "box",
                width: "120px",
                height: "120px",
                className: "shrink-0 rounded-[12px] w-full sm:w-[120px]",
              },
              {
                type: "col",
                className: "flex-1 justify-between w-full",
                children: [
                  {
                    type: "col",
                    className: "gap-2 mb-4",
                    children: [
                      {
                        type: "box",
                        width: "90%",
                        height: "20px",
                        className: "rounded-md",
                      },
                      {
                        type: "box",
                        width: "50%",
                        height: "16px",
                        className: "rounded-md",
                      },
                    ],
                  },
                  {
                    type: "row",
                    className: "justify-between",
                    children: [
                      {
                        type: "box",
                        width: "120px",
                        height: "36px",
                        className: "rounded-full",
                      },
                      {
                        type: "box",
                        width: "40px",
                        height: "40px",
                        className: "rounded-[10px]",
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
