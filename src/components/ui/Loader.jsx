// components/ui/Loader.jsx

export default function Loader({ size = "md" }) {
  const sizes = {
    sm: "h-5 w-5",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-20 w-20",
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${sizes[size]} animate-spin rounded-full border-[3px] border-[#EAD9B6] border-t-[#CE9F2D]`}
    />
  );
}
