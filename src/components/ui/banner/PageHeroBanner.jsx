import React from "react";
import { cn } from "../../../utils/common";

const THEMES = {
  navy: {
    section: "bg-[#17145f] text-white",
    badge:
      "border border-white/15 bg-white/10 text-white backdrop-blur-sm",
    title: "text-white",
    description: "text-white/75",
    overlay:
      "from-[#111050]/95 via-[#17145f]/80 to-transparent lg:from-[#111050]/90 lg:via-[#17145f]/35 lg:to-transparent",
    imagePosition: "object-top",
  },
  cream: {
    section: "bg-[#FAF8F3] text-[#18156D]",
    badge:
      "border border-[#D4A52A]/30 bg-[#D4A52A]/15 text-[#18156D] backdrop-blur-sm",
    title: "text-[#18156D]",
    description: "text-gray-700",
    overlay:
      "from-[#FAF8F3]/95 via-[#FAF8F3]/75 to-transparent lg:from-[#FAF8F3]/90 lg:via-[#FAF8F3]/30 lg:to-transparent",
    imagePosition: "object-top",
  },
};

export default function PageHeroBanner({
  image,
  badge,
  title,
  description,
  actions,
  bottomContent,
  theme = "navy",
  minHeightClass = "min-h-[570px] lg:min-h-[780px]",
  className = "",
  badgeClassName = "",
  titleClassName = "",
  descriptionClassName = "",
  imageClassName = "",
}) {
  const palette = THEMES[theme] || THEMES.navy;

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden",
        palette.section,
        className,
      )}
    >
      {image && (
        <img
          loading="lazy"
          width="1600"
          height="900"
          src={image}
          alt={typeof title === "string" ? title : "Hero banner"}
          className={cn(
            "absolute inset-0 -z-20 h-full w-full object-cover object-top",
            palette.imagePosition,
            imageClassName,
          )}
        />
      )}

      <div
        className={cn(
          "absolute inset-0 -z-10 bg-gradient-to-r",
          palette.overlay,
        )}
      />

      <div
        className={cn(
          "customer-container relative z-20 flex items-center py-12 sm:py-16",
          minHeightClass,
        )}
      >
        <div className="max-w-3xl">
          {badge && (
            <div
              className={cn(
                "mb-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium sm:mb-6 sm:px-4 sm:py-2",
                palette.badge,
                badgeClassName,
              )}
            >
              {badge}
            </div>
          )}

          {title && (
            <h1
              className={cn(
                "banner-heading font-bold leading-[1.08] tracking-[-0.02em]",
                palette.title,
                titleClassName,
              )}
            >
              {title}
            </h1>
          )}

          {description && (
            <p
              className={cn(
                "mt-5 max-w-xl text-base sm:mt-6 sm:text-lg",
                palette.description,
                descriptionClassName,
              )}
            >
              {description}
            </p>
          )}

          {actions && (
            <div className="mt-6 flex flex-row flex-wrap items-center justify-center gap-2 text-center sm:mt-8 sm:justify-start sm:gap-3">
              {actions}
            </div>
          )}

          {bottomContent && (
            <div className="mt-6 sm:mt-8">{bottomContent}</div>
          )}
        </div>
      </div>
    </section>
  );
}
