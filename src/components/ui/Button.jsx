export default function Button({ children, className = "", loading = false, variant = "primary", ...props }) {
  const variants = {
    primary: "border-slate-950 bg-slate-950 text-white hover:bg-slate-800",
    secondary: "border-stone-300 bg-white text-slate-950 hover:bg-stone-50",
    gradient: "border-transparent bg-slate-950 text-white hover:bg-slate-800"
  };

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant] || variants.primary} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
