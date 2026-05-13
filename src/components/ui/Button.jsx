export default function Button({ children, className = "", loading = false, variant = "primary", label, ...props }) {
  const variants = {
    primary: "border-[#CE9F2D] bg-[#CE9F2D] text-white hover:bg-[#A26D27]",
    secondary: "border-[#CE9F2D] bg-white text-[#CE9F2D] hover:bg-[#FAF6EE]",
  };

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border px-4 py-2.5 font-montserrat text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Please wait…" : (children ?? label)}
    </button>
  );
}
