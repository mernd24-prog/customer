export const ORDER_LIST_SKELETON = [
  {
    type: "row",
    className:
      "mb-4 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
    children: [
      {
        type: "box",
        width: "100%",
        height: "40px",
        className: "sm:max-w-[550px] rounded-lg",
      },
      {
        type: "row",
        className: "w-full gap-3 sm:w-auto",
        children: [
          {
            type: "box",
            width: "150px",
            height: "40px",
            className: "rounded-lg",
          },
          {
            type: "box",
            width: "150px",
            height: "40px",
            className: "rounded-lg",
          },
        ],
      },
    ],
  },

  {
    type: "col",
    className: "w-full gap-[10px]",
    children: [
      {
        type: "col",
        count: 5,
        className:
          "w-full overflow-hidden rounded-lg border border-[#E7D9B8] bg-white !gap-0",
        children: [
          /* Desktop */
          {
            type: "grid",
            className:
              "hidden sm:grid h-[96px] grid-cols-12 items-center gap-4 px-6",
            children: [
              /* Product */
              {
                type: "row",
                className:
                  "col-span-7 min-w-0 items-center gap-4",
                children: [
                  {
                    type: "box",
                    width: "64px",
                    height: "64px",
                    className: "shrink-0 rounded-lg",
                  },

                  {
                    type: "col",
                    className:
                      "min-w-0 flex-1 !gap-1.5",
                    children: [
                      {
                        type: "box",
                        width: "72%",
                        height: "15px",
                        className: "rounded-md",
                      },

                      {
                        type: "box",
                        width: "105px",
                        height: "20px",
                        className: "rounded-md",
                      },
                    ],
                  },
                ],
              },

              /* Price */
              {
                type: "col",
                className:
                  "col-span-2 items-start justify-center !gap-1",
                children: [
                  {
                    type: "box",
                    width: "78px",
                    height: "16px",
                    className: "rounded-md",
                  },
                ],
              },

              /* Status */
              {
                type: "row",
                className:
                  "col-span-3 min-w-0 items-center gap-2",
                children: [
                  {
                    type: "box",
                    width: "9px",
                    height: "9px",
                    className: "shrink-0 rounded-full",
                  },

                  {
                    type: "col",
                    className:
                      "min-w-0 flex-1 !gap-1.5",
                    children: [
                      {
                        type: "box",
                        width: "145px",
                        height: "15px",
                        className: "rounded-md",
                      },
                      {
                        type: "box",
                        width: "125px",
                        height: "11px",
                        className: "rounded-md",
                      },
                    ],
                  },
                ],
              },
            ],
          },

          /* Mobile */
          {
            type: "row",
            className:
              "flex h-[88px] items-center gap-3 px-3.5 sm:hidden",
            children: [
              {
                type: "box",
                width: "56px",
                height: "56px",
                className: "shrink-0 rounded-lg",
              },

              {
                type: "col",
                className:
                  "min-w-0 flex-1 !gap-1.5",
                children: [
                  {
                    type: "box",
                    width: "100%",
                    height: "15px",
                    className: "rounded-md",
                  },

                  {
                    type: "box",
                    width: "70%",
                    height: "11px",
                    className: "rounded-md",
                  },

                  {
                    type: "box",
                    width: "62px",
                    height: "20px",
                    className: "rounded-md",
                  },
                ],
              },

              {
                type: "col",
                className:
                  "shrink-0 items-end !gap-1",
                children: [
                  {
                    type: "box",
                    width: "65px",
                    height: "15px",
                    className: "rounded-md",
                  },
                  {
                    type: "box",
                    width: "55px",
                    height: "11px",
                    className: "rounded-md",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];