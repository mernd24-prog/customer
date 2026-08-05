export const SUPPORT_PAGE_SKELETON = [
  {
    type: "row",
    className: "flex-col md:flex-row gap-5 items-start",
    children: [
      {
        type: "col",
        className: "flex-1 w-full space-y-5",
        children: [
          {
            type: "col",
            className: "hidden md:flex flex-col overflow-hidden rounded-[10px] border border-[#EFE5D2] bg-white",
            children: [
               { type: "box", height: "48px", className: "w-full rounded-none" },
               { 
                 type: "grid", 
                 className: "grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-5 p-5",
                 children: Array.from({ length: 5 }).map(() => ({
                   type: "col", 
                   className: "items-center gap-3", 
                   children: [
                     { type: "box", width: "64px", height: "64px", rounded: "rounded-full" }, 
                     { type: "box", width: "70%", height: "12px", rounded: "rounded" }
                   ] 
                 }))
               }
            ]
          },
          {
            type: "col",
            className: "overflow-hidden rounded-[10px] border border-[#EFE5D2] bg-white",
            children: [
               { type: "box", height: "48px", className: "w-full rounded-none" },
               {
                 type: "col", className: "p-5 gap-4",
                 children: Array.from({ length: 6 }).map(() => ({
                   type: "box", height: "40px", className: "w-full rounded-md" 
                 }))
               }
            ]
          }
        ],
      },
      {
        type: "col",
        className: "w-full md:w-[280px] lg:w-[320px] xl:w-[340px] space-y-5",
        children: [
          { 
             type: "col", 
             className: "rounded-[10px] border border-[#EFE5D2] bg-white overflow-hidden", 
             children: [
               { type: "box", height: "56px", className: "w-full rounded-none" },
               { type: "col", className: "p-5 gap-6", children: Array.from({ length: 3 }).map(() => ({
                 type: "row", className: "gap-4 items-center", children: [
                   { type: "box", width: "40px", height: "40px", rounded: "rounded-full" }, 
                   { type: "col", className: "flex-1 gap-2", children: [
                     { type: "box", width: "60%", height: "12px" }, 
                     { type: "box", width: "40%", height: "12px" }
                   ]} 
                 ]
               }))}
             ]
          },
          { 
             type: "col", 
             className: "rounded-[10px] border border-[#EFE5D2] bg-white overflow-hidden", 
             children: [
               { type: "box", height: "64px", className: "w-full rounded-none" },
               { type: "col", className: "p-5 gap-6", children: Array.from({ length: 3 }).map(() => ({
                 type: "row", className: "justify-between items-start gap-4", children: [
                   { type: "col", className: "flex-1 gap-2 mt-1", children: [
                     { type: "box", width: "80%", height: "16px" }, 
                     { type: "box", width: "50%", height: "12px" }
                   ]}, 
                   { type: "box", width: "60px", height: "24px", rounded: "rounded-full" } 
                 ]
               }))}
             ]
          },
        ],
      },
    ],
  },
];
