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
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-blue/60 bg-[#F5F8FB] transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#EAF0F8] hover:shadow-sm active:scale-95 sm:h-12 sm:w-12 ${className}`}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}