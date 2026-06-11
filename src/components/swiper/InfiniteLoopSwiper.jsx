export default function InfiniteLoopSwiper({ item, index }) {
  return (
    <div key={`${item?.title}-${index}`} className="flex-shrink-0">
      <img
        src={item?.image?.url}
        alt={item?.title}
        loading="lazy"
        decoding="async"
        className="h-8 md:h-12 lg:h-18 w-full object-contain"
      />
    </div>
  );
}
