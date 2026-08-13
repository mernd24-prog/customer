export const RETURNS_PAGE_SKELETON = [
  {
    type: "col",
    className: "gap-y-14 w-full",
    children: [
      {
        type: "col",
        count: 3,
        className: "w-full rounded-[15px] border border-[#CE9F2D66] bg-white pt-6 pb-6 gap-0",
        children: [
          // Top section (Image + Details + Right badges)
          {
            type: "row",
            className: "w-full px-6 items-start gap-6",
            children: [
              // Image
              { type: "box", width: "120px", height: "120px", className: "shrink-0 rounded-[8px]" },
              // Details
              {
                type: "col",
                className: "flex-1 pt-1 gap-2",
                children: [
                  { type: "box", width: "80%", height: "20px", className: "rounded-md mb-2" },
                  { type: "box", width: "60%", height: "14px", className: "rounded-md" },
                  { type: "box", width: "40%", height: "14px", className: "rounded-md" },
                  { type: "box", width: "50%", height: "14px", className: "rounded-md" },
                  { type: "box", width: "80px", height: "20px", className: "rounded-md mt-2" },
                ]
              },
              // Right Info (Pill, Date, ID)
              {
                type: "col",
                className: "shrink-0 items-end gap-1.5 hidden md:flex",
                children: [
                  { type: "box", width: "120px", height: "32px", className: "rounded-full !bg-[#FFEFC8] mb-2" },
                  { type: "box", width: "100px", height: "12px", className: "rounded-md" },
                  { type: "box", width: "80px", height: "14px", className: "rounded-md" },
                  { type: "box", width: "100px", height: "12px", className: "rounded-md mt-2" },
                  { type: "box", width: "180px", height: "14px", className: "rounded-md" },
                ]
              }
            ]
          },
          // Bottom section (Stats + Button)
          {
            type: "row",
            className: "w-full border-t border-[#D9DDE8] mt-6 pt-6 px-6 justify-between items-end",
            children: [
              {
                type: "row",
                className: "gap-6 sm:gap-10 md:gap-14 items-start",
                children: [
                  {
                    type: "col", className: "gap-2", children: [
                      { type: "box", width: "100px", height: "12px" },
                      { type: "box", width: "140px", height: "16px" }
                    ]
                  },
                  {
                    type: "col", className: "gap-2 hidden sm:flex", children: [
                      { type: "box", width: "100px", height: "12px" },
                      { type: "box", width: "80px", height: "16px" }
                    ]
                  },
                  {
                    type: "col", className: "gap-2 hidden md:flex", children: [
                      { type: "box", width: "100px", height: "12px" },
                      { type: "box", width: "120px", height: "16px" }
                    ]
                  },
                ]
              },
              { type: "box", width: "140px", height: "40px", className: "rounded-[8px] !bg-transparent border border-[#CE9F2D] shrink-0" },
            ]
          }
        ]
      }
    ]
  }
];
