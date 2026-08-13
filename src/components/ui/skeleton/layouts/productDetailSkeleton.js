export const PRODUCT_DETAIL_SKELETON = [
  { type: "box", height: "24px", width: "30%", className: "mb-6 hidden md:block" },
  {
    type: "grid",
    className: "grid-cols-1 md:grid-cols-2 gap-8 mb-12",
    children: [
      {
        type: "col",
        children: [
          { type: "box", height: "450px", className: "w-full rounded-[12px] mb-4" },
          { type: "grid", className: "grid-cols-5 gap-2", children: [
            { type: "box", height: "80px", className: "rounded-[8px]" },
            { type: "box", height: "80px", className: "rounded-[8px]" },
            { type: "box", height: "80px", className: "rounded-[8px]" },
            { type: "box", height: "80px", className: "rounded-[8px]" },
            { type: "box", height: "80px", className: "rounded-[8px]" }
          ]}
        ]
      },
      {
        type: "col",
        children: [
          { type: "box", height: "32px", width: "80%", className: "mb-4" },
          { type: "box", height: "20px", width: "40%", className: "mb-6" },
          { type: "box", height: "48px", width: "30%", className: "mb-6" },
          { type: "box", height: "1px", width: "100%", className: "bg-[#EFE5D2] mb-6" },
          { type: "box", height: "24px", width: "20%", className: "mb-4" },
          { type: "grid", className: "grid-cols-6 gap-2 mb-6", children: [
            { type: "box", height: "40px", className: "rounded-full" },
            { type: "box", height: "40px", className: "rounded-full" },
            { type: "box", height: "40px", className: "rounded-full" },
          ]},
          { type: "box", height: "24px", width: "20%", className: "mb-4" },
          { type: "grid", className: "grid-cols-4 gap-2 mb-8", children: [
            { type: "box", height: "40px", className: "rounded-[8px]" },
            { type: "box", height: "40px", className: "rounded-[8px]" },
            { type: "box", height: "40px", className: "rounded-[8px]" },
          ]},
          { type: "grid", className: "grid-cols-2 gap-4", children: [
            { type: "box", height: "48px", className: "rounded-[8px]" },
            { type: "box", height: "48px", className: "rounded-[8px]" },
          ]}
        ]
      }
    ]
  }
];
