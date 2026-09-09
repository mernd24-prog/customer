import { SKELETON_PRESETS } from "../skeletonPresets";

export const CHECKOUT_PAGE_SKELETON = [
  {
    type: "grid",
    className: "grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-8 xl:gap-11",
    children: [
      {
        type: "col",
        className: "gap-6",
        children: [
          { 
            type: "col", 
            className: "w-full rounded-[15px] bg-white border border-border shadow-[0_2px_12px_rgba(0,0,0,0.03)]", 
            children: [
              {
                type: "row",
                className: "px-4 sm:px-[25px] py-[15px] sm:py-5 border-b border-border items-center justify-between",
                children: [
                  { type: "box", width: "160px", height: "24px", className: "rounded-md" },
                  { type: "box", width: "120px", height: "20px", className: "rounded-md" },
                ]
              },
              {
                type: "col",
                className: "p-4 sm:p-5 md:px-[25px] gap-4",
                children: [
                  {
                    type: "row",
                    className: "items-start gap-3 sm:gap-[15px] pb-4 border-b border-border",
                    children: [
                      { type: "box", width: "20px", height: "20px", variant: "circle" },
                      {
                        type: "col",
                        className: "flex-1 gap-3 pt-0.5",
                        children: [
                          { type: "box", width: "40%", height: "20px", className: "rounded-md" },
                          { type: "box", width: "70%", height: "16px", className: "rounded-md" },
                          { type: "box", width: "80%", height: "16px", className: "rounded-md" },
                        ]
                      },
                      { type: "box", width: "32px", height: "32px", variant: "circle" }
                    ]
                  }
                ]
              }
            ]
          },
          { 
            type: "col", 
            className: "w-full rounded-[15px] bg-white border border-border shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 sm:p-5 md:px-[25px] gap-4", 
            children: [
              { type: "box", width: "30%", height: "24px", className: "rounded-md mb-2" },
              { type: "box", width: "100%", height: "48px", className: "rounded-md" },
              { type: "box", width: "100%", height: "48px", className: "rounded-md" },
            ]
          },
        ]
      },
      { 
        type: "col", 
        className: "w-full rounded-[15px] border border-[#EFE5D2] p-5 lg:p-7 bg-[#FFF8E7] gap-4",
        children: SKELETON_PRESETS.ORDER_SUMMARY
      }
    ]
  }
];
