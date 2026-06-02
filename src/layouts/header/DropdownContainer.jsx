export default function DropdownContainer({ width = "w-[320px]", children }) {
  return (
    <div
      className={`${width} overflow-hidden rounded-[var(--customer-radius)] border border-[var(--customer-border)] bg-white shadow-[var(--customer-shadow-strong)]`}
    >
      {children}
    </div>
  );
}
