export function ActiveLinkSkeleton() {
  return (
    <div className="w-container grid gap-8 my-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="w-24 h-5 rounded-md bg-gray-200 mb-4"></div>
          <div className="space-y-3">
            <div className="w-20 h-3 rounded-md bg-gray-200"></div>
            <div className="w-28 h-3 rounded-md bg-gray-200"></div>
            <div className="w-24 h-3 rounded-md bg-gray-200"></div>
            <div className="w-16 h-3 rounded-md bg-gray-200"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActionSkeleton() {
  return (
    <div className="w-container grid gap-4 border-y bg-band border-accent grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex min-h-12 p-2 lg:p-6 items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-gray-200"></div>
          <div className="w-24 h-4 rounded-md bg-gray-200"></div>
        </div>
      ))}
    </div>
  );
}
