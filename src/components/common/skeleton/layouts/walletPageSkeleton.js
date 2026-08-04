export const WALLET_PAGE_SKELETON = [
  {
    type: "col",
    className: "w-full rounded-[var(--customer-radius)] bg-gradient-to-br from-ink to-muted p-6 gap-0",
    children: [
      {
        type: "row",
        className: "mb-1 flex items-center gap-2",
        children: [
           { type: "box", width: "18px", height: "18px", className: "!bg-white/20 rounded-sm" },
           { type: "box", width: "120px", height: "14px", className: "!bg-white/20 rounded-md" }
        ]
      },
      { type: "box", width: "140px", height: "40px", className: "!bg-white/30 rounded-md mt-2" }
    ]
  }
];
