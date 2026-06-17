// components/common/Loader.jsx

const loaderImage = (
  <div className="flex flex-col items-center gap-4">
    <img src="/image/svg/loader.svg" alt="Loading" className="h-full w-full" />
  </div>
);

export default function Loader({ size = "md" }) {
  const sizes = {
    sm: "h-5 w-5",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-20 w-20",
  };

  return (
    <div
      className={`${sizes[size]} flex rounded-full bg-white border border-black/15 shadow-[0_2px_4px_rgba(0,0,0,0.15)] items-center justify-center`}
    >
      {loaderImage}
    </div>
  );
}
