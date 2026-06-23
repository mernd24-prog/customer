export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 h-44 w-full rounded-[var(--customer-radius)] bg-gray-200" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-72 rounded-xl bg-gray-200" />
        ))}
      </div>
    </div>
  );
}