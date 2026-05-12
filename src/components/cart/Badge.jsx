// components/ui/Badge.jsx

export default function Badge({
    children,
    className = "",
}) {
    return (
        <span
            className={`mb-1 inline-block rounded-[16px] border border-[#d48f03] px-2 text-[10px] font-semibold uppercase tracking-wide text-[#d48f03] sm:px-3 sm:text-[11px] md:text-[12px] ${className}`}
        >
            {children}
        </span>
    );
}