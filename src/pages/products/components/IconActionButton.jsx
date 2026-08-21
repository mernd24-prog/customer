export default function IconActionButton({ title, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[36px] w-[36px] sm:h-11 sm:w-11 items-center justify-center bg-[#F5F8FB] rounded-full border border-blue/60 hover:scale-110 ${className}`}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}
