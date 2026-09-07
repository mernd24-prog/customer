export function CategoryWavyDividerSvg({ className = "w-full h-8 block shrink-0", color, ...props }) {
  return (
    <svg
      className={className}
      viewBox="0 0 500 40"
      preserveAspectRatio="none"
      fill={color || "currentColor"}
      {...props}
    >
      <path d="M0,20 C150,42 350,-2 500,20 L500,40 L0,40 Z" />
    </svg>
  );
}

export default CategoryWavyDividerSvg;
