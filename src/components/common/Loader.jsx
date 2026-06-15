// components/common/Loader.jsx
export default function Loader({ size = "md" }) {
  const sizes = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-4 border-gray-300 border-t-primary`}
      />
    </div>
  );
}