export const RETURNS_PAGE_SKELETON = [
  {
    type: "col",
    className: "w-full gap-4",
    children: [
      {
        type: "col",
        count: 3,
        className:
          "w-full overflow-hidden rounded-2xl border border-[#E7D9B8] bg-[#FFFCF6]",
        children: [
          {
            type: "row",
            className:
              "w-full items-center gap-3 px-4 py-3 sm:gap-4 sm:px-4 sm:py-3",
            children: [
              {
                type: "box",
                width: "72px",
                height: "72px",
                className: "shrink-0 rounded-[8px]",
              },

              {
                type: "col",
                className: "min-w-0 flex-1 gap-1.5",
                children: [
                  {
                    type: "box",
                    width: "70%",
                    height: "16px",
                    className: "rounded-md",
                  },
                  {
                    type: "box",
                    width: "42%",
                    height: "11px",
                    className: "rounded-md",
                  },
                  {
                    type: "box",
                    width: "50%",
                    height: "11px",
                    className: "rounded-md",
                  },
                  {
                    type: "box",
                    width: "38%",
                    height: "11px",
                    className: "rounded-md",
                  },
                ],
              },

              {
                type: "col",
                className:
                  "hidden shrink-0 items-end gap-1.5 sm:flex",
                children: [
                  {
                    type: "box",
                    width: "105px",
                    height: "27px",
                    className: "rounded-full !bg-[#FFEFC8]",
                  },
                  {
                    type: "box",
                    width: "85px",
                    height: "10px",
                    className: "rounded-md",
                  },
                  {
                    type: "box",
                    width: "105px",
                    height: "11px",
                    className: "rounded-md",
                  },
                ],
              },
            ],
          },

          {
            type: "row",
            className:
              "w-full items-center justify-between gap-3 border-t border-[#D9DDE8] px-4 py-3",
            children: [
              {
                type: "row",
                className:
                  "items-start gap-5 sm:gap-8 md:gap-10",
                children: [
                  {
                    type: "col",
                    className: "gap-1",
                    children: [
                      {
                        type: "box",
                        width: "65px",
                        height: "10px",
                        className: "rounded-md",
                      },
                      {
                        type: "box",
                        width: "90px",
                        height: "14px",
                        className: "rounded-md",
                      },
                    ],
                  },

                  {
                    type: "col",
                    className: "hidden gap-1 sm:flex",
                    children: [
                      {
                        type: "box",
                        width: "65px",
                        height: "10px",
                        className: "rounded-md",
                      },
                      {
                        type: "box",
                        width: "70px",
                        height: "14px",
                        className: "rounded-md",
                      },
                    ],
                  },

                  {
                    type: "col",
                    className: "hidden gap-1 md:flex",
                    children: [
                      {
                        type: "box",
                        width: "70px",
                        height: "10px",
                        className: "rounded-md",
                      },
                      {
                        type: "box",
                        width: "100px",
                        height: "14px",
                        className: "rounded-md",
                      },
                    ],
                  },
                ],
              },

              {
                type: "box",
                width: "115px",
                height: "34px",
                className:
                  "shrink-0 rounded-[8px] !bg-transparent border border-[#CE9F2D]",
              },
            ],
          },
        ],
      },
    ],
  },
];