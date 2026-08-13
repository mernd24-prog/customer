import { SKELETON_PRESETS } from "../skeletonPresets";

export const CHECKOUT_PAGE_SKELETON = [
  {
    type: "grid",
    className: "grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-8 xl:gap-11",
    children: [
      {
        type: "col",
        className: "gap-4",
        children: [
          { type: "row", className: "w-full rounded-[12px] bg-white p-5 border border-[#EFE5D2] justify-between", children: [
            { type: "box", width: "40%", height: "24px", className: "rounded-md" },
            { type: "box", width: "80px", height: "24px", className: "rounded-md" },
          ]},
          { type: "col", className: "w-full rounded-[12px] bg-white p-5 border border-[#EFE5D2] gap-4", children: [
            { type: "box", width: "30%", height: "24px", className: "rounded-md mb-2" },
            { type: "box", width: "100%", height: "48px", className: "rounded-md" },
            { type: "box", width: "100%", height: "48px", className: "rounded-md" },
            { type: "box", width: "50%", height: "48px", className: "rounded-md" },
          ]},
          { type: "row", className: "w-full rounded-[12px] bg-white p-5 border border-[#EFE5D2] justify-between", children: [
            { type: "box", width: "40%", height: "24px", className: "rounded-md" },
            { type: "box", width: "80px", height: "24px", className: "rounded-md" },
          ]},
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
