export function CategoryBotanicalLeafSvg({
  color = "#D6A323",
  size = 44,
  width,
  height,
  className = "opacity-40",
  strokeWidth = "1.8",
  ...props
}) {
  const leafColor = color;
  return (
    <svg
      width={width || size}
      height={height || size}
      viewBox="0 0 48 48"
      fill="none"
      stroke={leafColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M10 38C18 30 26 22 38 10" />
      <path d="M38 10C30 12 24 19 24 28C31 28 36 21 38 10Z" fill={`${leafColor}33`} />
      <path d="M24 28C17 29 12 34 10 38C17 38 22 33 24 28Z" fill={`${leafColor}33`} />
    </svg>
  );
}

export default CategoryBotanicalLeafSvg;
