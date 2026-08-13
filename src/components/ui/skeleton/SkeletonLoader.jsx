import React from "react";
import SkeletonBox from "./SkeletonBox";
import { SKELETON_PRESETS } from "./skeletonPresets";

/**
 * SkeletonLoader - Dynamic skeleton generator.
 * Takes a layout configuration and renders a complex skeleton structure.
 */
const SkeletonLoader = ({
  layout,
  preset,
  count = 1,
  wrapperClass = "",
  containerClass = "space-y-4",
  ...props
}) => {
  const activeLayout =
    layout || (typeof preset === "string" ? SKELETON_PRESETS[preset] : preset) || [];

  // Recursive function to render layout items
  const renderLayout = (items) => {
    return items.map((item, index) => {
      const {
        type = "box", // box, group, row, col, grid
        children,
        className = "",
        count: itemCount = 1,
        ...itemProps
      } = item;

      // Handle multiple items of the same type
      const itemsToRender = Array.from({ length: itemCount });

      return itemsToRender.map((_, i) => {
        const key = `${index}-${i}`;

        switch (type) {
          case "group":
          case "row":
          case "col":
          case "grid": {
            const layoutClasses = {
              group: "flex flex-wrap gap-4",
              row: "flex flex-row items-center gap-4",
              col: "flex flex-col gap-4",
              grid: "grid gap-4",
            };

            return (
              <div key={key} className={`${layoutClasses[type]} ${className}`}>
                {children && renderLayout(children)}
              </div>
            );
          }

          case "box":
          default:
            return <SkeletonBox key={key} className={className} {...itemProps} />;
        }
      });
    });
  };

  // Render the entire structure multiple times based on the 'count' prop
  const mainItems = Array.from({ length: count });

  return (
    <div className={containerClass} {...props}>
      {mainItems.map((_, i) => (
        <div key={i} className={wrapperClass}>
          {renderLayout(activeLayout)}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
