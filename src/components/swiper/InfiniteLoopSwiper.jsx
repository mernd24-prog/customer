export default function InfiniteLoopSwiper({ item, index }) {
  return (
    <div key={`${item.name}-${index}`} className="flex-shrink-0">
      <img
        src={item.icon}
        alt={item.name}
        loading="lazy"
        decoding="async"
        className="h-8 md:h-12 lg:h-18 w-full object-contain"
      />
    </div>
  );
}
