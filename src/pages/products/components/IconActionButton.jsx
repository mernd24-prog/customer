export default function IconActionButton({ title, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center bg-[#F5F8FB] rounded-full border border-blue/60 hover:scale-110 sm:h-12 sm:w-12 ${className}`}
      title={title}
    >
      {children}
    </button>
  );
}
