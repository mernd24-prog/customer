export default function DropdownContainer({ width = "w-[320px]", children }) {
  return (
    <div
      className={`${width} overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl`}
    >
      {children}
    </div>
  );
}
