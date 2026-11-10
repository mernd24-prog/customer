export default function IconActionButton({
  title,
  onClick,
  children,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-blue/60 bg-[#F5F8FB] transition-[color,background-color,border-color,box-shadow] duration-300 ease-in-out  hover:bg-[#EAF0F8] hover:shadow-sm sm:h-12 sm:w-12 ${className}`}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}